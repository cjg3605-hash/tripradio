import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import SequentialDialogueProcessor, { DialogueSegment } from '@/lib/ai/tts/sequential-dialogue-processor';
import SequentialTTSGenerator from '@/lib/ai/tts/sequential-tts-generator';
import { ChapterGenerator } from '@/lib/ai/chapter-generator';
import { LocationAnalyzer, LocationContext, EXPERT_PERSONAS } from '@/lib/ai/location-analyzer';
import LocationSlugService from '@/lib/location/location-slug-service';
import { parseDialogueScript, type PodcastPromptConfig } from '@/lib/ai/prompts/podcast';

export const maxDuration = 90;

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// 🔥 UNIFIED GEMINI PROMPT GENERATOR
// ========================================

/**
 * 모든 챕터를 한 번에 생성하는 통합 프롬프트
 */
function createUnifiedChaptersPrompt(
  locationName: string,
  chapters: any[],
  personaDetails: any[],
  locationAnalysis: any,
  language: string
): string {
  const chapterDescriptions = chapters
    .map((chapter, idx) => {
      return `
[CHAPTER ${idx} INFO]
제목: ${chapter.title}
설명: ${chapter.description}
목표 지속시간: ${chapter.targetDuration}초
권장 세그먼트: ${chapter.estimatedSegments}개
초점 영역: ${chapter.contentFocus?.join(', ') || 'N/A'}
`;
    })
    .join('\n');

  const personaInfo = personaDetails
    .map(p => `- ${p.name}: ${p.description} (전문 분야: ${p.expertise.join(', ')})`)
    .join('\n');

  const systemPrompt =
    language === 'ko'
      ? `당신은 전문적인 여행 팟캐스트 제작자입니다. 아래 지침을 따라 장소의 각 챕터에 대해 HOST(남성)와 CURATOR(여성)의 대화 형식 스크립트를 생성합니다.

[생성 기준]
- 총 ${chapters.length}개 챕터의 스크립트를 한 번에 생성
- 각 챕터는 [CHAPTER {숫자} START]와 [CHAPTER {숫자} END] 마커로 정확히 구분
- 각 턴마다 [male] 또는 [female]로 화자를 명확히 표시
- 대화는 자연스럽고, 정보가 정확하며, 청취자를 사로잡는 톤 유지
- 연속된 같은 화자 발화는 절대 불가 (HOST → CURATOR 또는 CURATOR → HOST)
- 한국어 사용, 장황한 설명보다 간결하고 명확한 표현
- 시간 제약을 고려하여 필요한 정보만 포함

[참여 페르소나]
${personaInfo}

[장소 분석]
- 문화적 중요성: ${locationAnalysis.culturalSignificance || '중요한 문화유산'}
- 역사적 중요도: ${locationAnalysis.historicalImportance || 8}/10
- 문화적 가치: ${locationAnalysis.culturalValue || 9}/10
- 특별한 특징: ${locationAnalysis.uniqueFeatures?.join(', ') || 'N/A'}
- 권장 포인트: ${locationAnalysis.recommendations?.join(', ') || 'N/A'}

[필수 출력 형식]
각 챕터마다 반드시 이 형식을 정확히 따르세요:

[CHAPTER {번호} START]
[male] {HOST의 첫 번째 발화}
[female] {CURATOR의 응답}
[male] {HOST의 질문 또는 진행}
[female] {CURATOR의 설명}
... (계속 교대하며 진행)
[CHAPTER {번호} END]

주의: 마커는 정확히 [CHAPTER {번호} START]와 [CHAPTER {번호} END] 형식이어야 합니다.`
      : `You are a professional travel podcast producer. Generate dialogue scripts for HOST (male) and CURATOR (female) for each chapter of the location below.

[Generation Guidelines]
- Generate scripts for ${chapters.length} chapters all at once
- Each chapter separated by [CHAPTER {number} START] and [CHAPTER {number} END] markers
- Clearly mark each turn with [male] or [female]
- Keep dialogue natural, accurate, and engaging
- Never have consecutive turns from same speaker
- Use English, keep expressions concise
- Include only necessary information within time constraints

[Participating Personas]
${personaInfo}

[Location Analysis]
- Cultural Significance: ${locationAnalysis.culturalSignificance || 'Important cultural heritage'}
- Historical Importance: ${locationAnalysis.historicalImportance || 8}/10
- Cultural Value: ${locationAnalysis.culturalValue || 9}/10
- Special Features: ${locationAnalysis.uniqueFeatures?.join(', ') || 'N/A'}
- Recommended Points: ${locationAnalysis.recommendations?.join(', ') || 'N/A'}

[Output Format]
For each chapter, write exactly:

[CHAPTER {number} START]
[male] {HOST's first statement}
[female] {CURATOR's response}
[male] {HOST's question}
[female] {CURATOR's explanation}
... (continue alternating)
[CHAPTER {number} END]

Note: Markers must be exactly [CHAPTER {number} START] and [CHAPTER {number} END].`;

  return `${systemPrompt}

[위치명 / Location Name]
${locationName}

[챕터 구조 / Chapter Structure]
${chapterDescriptions}

이제 ${chapters.length}개 챕터의 스크립트를 생성하세요. / Generate scripts for ${chapters.length} chapters now.`;
}

/**
 * 통합 응답에서 개별 챕터 추출
 */
function extractChaptersFromUnifiedResponse(
  response: string,
  chapterCount: number
): Map<number, string> {
  const chapters = new Map<number, string>();

  for (let i = 0; i < chapterCount; i++) {
    const startMarker = `[CHAPTER ${i} START]`;
    const endMarker = `[CHAPTER ${i} END]`;

    const startIdx = response.indexOf(startMarker);
    const endIdx = response.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1) {
      const chapterContent = response.substring(startIdx + startMarker.length, endIdx).trim();
      chapters.set(i, chapterContent);
      console.log(`✅ 챕터 ${i} 추출: ${chapterContent.length}자`);
    } else {
      console.warn(`⚠️ 챕터 ${i} 마커를 찾을 수 없습니다`);
    }
  }

  return chapters;
}

export async function POST(req: NextRequest) {
  try {
    const totalStartTime = Date.now();
    const performanceMetrics = {
      chapterGeneration: 0,
      ttsGeneration: 0,
      dbOperations: 0,
      totalTime: 0,
      segmentCount: 0,
      throughput: 0,
      apiCallCount: 1, // 🔥 통합 방식 = 1회
      optimizationMethod: 'unified' // 마커
    };

    const { locationName, language = 'ko', locationContext } = await req.json();

    console.log('🎙️ [V2] 통합 Gemini 팟캐스트 생성 요청:', {
      locationName,
      language,
      method: 'unified-single-api-call'
    });

    if (!locationName) {
      return NextResponse.json(
        { success: false, error: '위치명이 필요합니다.' },
        { status: 400 }
      );
    }

    // Step 0: 기존 에피소드 확인
    console.log('🔍 Step 0: 기존 에피소드 확인');
    const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
    console.log(`📍 슬러그: "${locationName}" → "${slugResult.slug}"`);

    const { data: existingEpisodes } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('location_slug', slugResult.slug)
      .eq('language', language)
      .order('created_at', { ascending: false });

    if (existingEpisodes && existingEpisodes.length > 0) {
      const existingEpisode = existingEpisodes[0];
      if (existingEpisode.status === 'completed') {
        console.log('✅ 완료된 에피소드 발견, 기존 데이터 반환');
        const { data: segments } = await supabase
          .from('podcast_segments')
          .select('*')
          .eq('episode_id', existingEpisode.id);

        return NextResponse.json({
          success: true,
          message: '기존 완료된 팟캐스트를 반환합니다.',
          data: {
            episodeId: existingEpisode.id,
            locationName,
            language,
            status: 'completed',
            existingEpisode: true,
            segmentCount: segments?.length || 0
          }
        });
      }
      // 기존 레코드 삭제
      await supabase.from('podcast_segments').delete().eq('episode_id', existingEpisode.id);
      await supabase.from('podcast_episodes').delete().eq('id', existingEpisode.id);
    }

    // Step 1: 장소 분석 및 챕터 구조 생성
    console.log('🔍 Step 1: AI 기반 장소 분석');
    const podcastStructure = await ChapterGenerator.generatePodcastStructure(
      locationName,
      locationContext || {},
      null,
      language
    );

    console.log('📊 팟캐스트 구조:', {
      totalChapters: podcastStructure.totalChapters,
      selectedPersonas: podcastStructure.selectedPersonas
    });

    // Step 2: 페르소나 준비
    console.log('🎭 Step 2: 페르소나 정보 준비');
    const personaDetails = podcastStructure.selectedPersonas
      .map(personaId => EXPERT_PERSONAS[personaId])
      .filter(Boolean);

    console.log('👥 활성화된 페르소나:', personaDetails.map(p => p.name));

    // Step 3: 초기 에피소드 레코드 생성
    const episodeId = `episode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const locationNames = {
      [language]: locationName,
      en: slugResult.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };

    const allChapters = [
      podcastStructure.intro,
      ...podcastStructure.chapters,
      ...(podcastStructure.outro ? [podcastStructure.outro] : [])
    ];

    const { error: insertError } = await supabase
      .from('podcast_episodes')
      .insert({
        id: episodeId,
        title: `${locationName} 팟캐스트`,
        description: `${locationName}에 대한 NotebookLM 스타일 팟캐스트`,
        language,
        location_input: locationName,
        location_slug: slugResult.slug,
        slug_source: slugResult.source,
        location_names: locationNames,
        status: 'generating',
        generation_progress: 0,
        total_chapters: allChapters.length,
        quality_score: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ 에피소드 생성 오류:', insertError);
      throw insertError;
    }

    console.log(`✅ 초기 에피소드 레코드 생성: ${episodeId}`);

    // 🔥 Step 4: 통합 Gemini API 호출 (단 1회!)
    console.log('🚀 Step 4: 통합 프롬프트로 모든 챕터 한 번에 생성');
    const geminiStartTime = Date.now();

    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const unifiedPrompt = createUnifiedChaptersPrompt(
      locationName,
      allChapters,
      personaDetails,
      podcastStructure.locationAnalysis,
      language
    );

    console.log(`📝 통합 프롬프트 크기: ${unifiedPrompt.length}자`);

    // 단일 API 호출
    const unifiedResponse = await model.generateContent(unifiedPrompt);
    const unifiedResponseText = unifiedResponse.response.text();
    const geminiTime = Date.now() - geminiStartTime;

    console.log(`✅ 통합 API 호출 완료: ${geminiTime}ms (응답: ${unifiedResponseText.length}자)`);
    performanceMetrics.chapterGeneration = geminiTime;

    // 디버깅: Gemini 응답 로깅
    console.log(`📝 Gemini 응답 샘플 (처음 500자):`);
    console.log(unifiedResponseText.substring(0, 500));
    console.log(`...[중략]...`);
    console.log(`📝 Gemini 응답 끝 (마지막 300자):`);
    console.log(unifiedResponseText.substring(Math.max(0, unifiedResponseText.length - 300)));

    // Step 5: 마커 기반 챕터 추출
    console.log('📄 Step 5: 응답에서 챕터 추출');
    const extractedChapters = extractChaptersFromUnifiedResponse(
      unifiedResponseText,
      allChapters.length
    );

    console.log(`✅ 챕터 추출 완료: ${extractedChapters.size}/${allChapters.length}`);

    // Step 6: 세그먼트 변환 및 통합
    console.log('🔄 Step 6: 세그먼트로 변환');
    const chapterScripts: any[] = [];
    let allSegments: any[] = [];
    let segmentCounter = 1;

    for (let i = 0; i < allChapters.length; i++) {
      const chapter = allChapters[i];
      const extractedContent = extractedChapters.get(i);

      if (extractedContent) {
        const dialogueSegments = parseDialogueScript(extractedContent, language);
        const segments = dialogueSegments.map(segment => ({
          speaker: segment.speaker,
          text: segment.content,
          estimatedSeconds: Math.min(Math.max(Math.ceil(segment.content.length / 8), 15), 45)
        }));

        for (const segment of segments) {
          const formattedSegment = {
            sequenceNumber: segmentCounter,
            speakerType: segment.speaker,
            text: segment.text,
            estimatedSeconds: segment.estimatedSeconds,
            chapterIndex: chapter.chapterIndex,
            chapterTitle: chapter.title
          };
          allSegments.push(formattedSegment);
          segmentCounter++;
        }

        chapterScripts.push({
          chapterIndex: chapter.chapterIndex,
          title: chapter.title,
          segments: segments,
          transition: chapter.transitionToNext
        });

        console.log(`✅ 챕터 ${i}: ${segments.length}개 세그먼트`);
      } else {
        console.warn(`⚠️ 챕터 ${i} 추출 실패`);
      }
    }

    console.log(`📊 총 ${allSegments.length}개 세그먼트 생성`);
    performanceMetrics.segmentCount = allSegments.length;

    // Step 7: 통합 스크립트 생성 (DB 저장용)
    console.log('💾 Step 7: 스크립트 저장');
    let combinedScript = '';
    for (const segment of allSegments) {
      combinedScript += `[${segment.speakerType}] ${segment.text}\n\n`;
    }

    const dbStartTime = Date.now();

    // 에피소드 메타데이터 업데이트
    const { error: updateError } = await supabase
      .from('podcast_episodes')
      .update({
        user_script: combinedScript,
        tts_script: allSegments.map(s => `${s.speakerType}: ${s.text}`).join('\n'),
        duration_seconds: Math.round(
          allSegments.reduce((sum, seg) => sum + seg.estimatedSeconds, 0)
        ),
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId);

    if (updateError) {
      console.error('❌ 에피소드 업데이트 오류:', updateError);
      throw updateError;
    }

    // 세그먼트 저장
    const segmentRecords = allSegments.map(segment => ({
      episode_id: episodeId,
      sequence_number: segment.sequenceNumber,
      speaker_type: segment.speakerType,
      speaker_name: segment.speakerType === 'male' ? 'Host' : 'Curator',
      text_content: segment.text,
      audio_url: null,
      file_size_bytes: 0,
      duration_seconds: segment.estimatedSeconds,
      chapter_index: segment.chapterIndex,
      chapter_title: segment.chapterTitle || null  // ✅ AI 생성 챕터명 저장
    }));

    const batchSize = 20;
    for (let i = 0; i < segmentRecords.length; i += batchSize) {
      const batch = segmentRecords.slice(i, i + batchSize);
      const { error: segmentError } = await supabase
        .from('podcast_segments')
        .insert(batch);

      if (segmentError) {
        console.error(`❌ 세그먼트 배치 삽입 오류:`, segmentError);
        throw segmentError;
      }
    }

    console.log(`✅ ${segmentRecords.length}개 세그먼트 DB 저장`);

    // 챕터 타임라인 생성
    const chapterTimeline = chapterScripts.map((ch, idx) => ({
      chapterIndex: ch.chapterIndex,
      title: ch.title,
      description: ch.title,
      contentFocus: [],
      segmentCount: ch.segments.length,
      startTime: 0,
      endTime: 0,
      duration: ch.segments.reduce((sum, seg) => sum + seg.estimatedSeconds, 0)
    }));

    const totalDuration = allSegments.reduce((sum, seg) => sum + seg.estimatedSeconds, 0);
    const qualityScore = Math.min(
      75 + Math.floor(allSegments.length / 5),
      Math.max(90, chapterScripts.length * 5)
    );

    // 최종 업데이트
    const { error: finalError } = await supabase
      .from('podcast_episodes')
      .update({
        status: 'script_ready',
        generation_progress: 100,
        generation_step: 'completed',
        chapter_timestamps: chapterTimeline,
        quality_score: qualityScore,
        duration_seconds: totalDuration,
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId);

    const dbTime = Date.now() - dbStartTime;
    performanceMetrics.dbOperations = dbTime;

    if (finalError) {
      console.warn('⚠️ 최종 업데이트 경고:', finalError);
    }

    const totalTime = Date.now() - totalStartTime;
    performanceMetrics.totalTime = totalTime;

    console.log('🎉 팟캐스트 생성 완료!');
    console.log(`📊 성능 지표:`, {
      총_소요_시간: `${totalTime}ms`,
      API_호출_시간: `${geminiTime}ms`,
      DB_저장_시간: `${dbTime}ms`,
      API_호출_수: 1,
      생성_세그먼트: allSegments.length
    });

    return NextResponse.json({
      success: true,
      message: '팟캐스트 스크립트가 성공적으로 생성되었습니다.',
      method: 'unified-single-api-call',
      data: {
        episodeId,
        status: 'script_ready',
        locationName,
        language,
        segmentCount: allSegments.length,
        estimatedDuration: totalDuration,
        chapterCount: chapterScripts.length,
        performance: {
          totalTime: `${totalTime}ms`,
          apiCallTime: `${geminiTime}ms`,
          dbOperationTime: `${dbTime}ms`,
          apiCallCount: 1,
          timePerChapter: `${Math.round(geminiTime / allChapters.length)}ms`
        }
      }
    });
  } catch (error) {
    console.error('❌ V2 팟캐스트 생성 중 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

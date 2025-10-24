import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import SequentialDialogueProcessor, { DialogueSegment } from '@/lib/ai/tts/sequential-dialogue-processor';
import SequentialTTSGenerator from '@/lib/ai/tts/sequential-tts-generator';
import { ChapterGenerator } from '@/lib/ai/chapter-generator';
import { LocationAnalyzer, LocationContext, EXPERT_PERSONAS } from '@/lib/ai/location-analyzer';
import LocationSlugService from '@/lib/location/location-slug-service';
import { createPodcastChapterPrompt, type PodcastPromptConfig, parseDialogueScript } from '@/lib/ai/prompts/podcast';

export const maxDuration = 60;

// 순차 재생용 팟캐스트 생성

// Supabase 클라이언트 생성 (서버사이드에서 RLS 우회하기 위해 SERVICE_ROLE_KEY 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 프롬프트 캐시 (성능 최적화)
const promptCache = new Map<string, string>();

/**
 * 챕터별 NotebookLM 스타일 스크립트 생성 함수 - 캐싱 최적화 버전
 */
async function generateChapterScript(
  model: any,
  chapter: any,
  locationName: string,
  locationContext: LocationContext,
  personaDetails: any[],
  locationAnalysis: any,
  language: string,
  previousLastSpeaker?: 'male' | 'female' | null
) {
  // 캐시 키 생성 (성능 최적화) - previousLastSpeaker 포함하여 정확한 캐싱
  const cacheKey = `${locationName}-${chapter.chapterIndex}-${language}-${previousLastSpeaker || 'first'}`;

  // 캐시된 프롬프트 확인
  let prompt: string;
  if (promptCache.has(cacheKey)) {
    prompt = promptCache.get(cacheKey)!;
    console.log(`🚀 캐시된 프롬프트 사용: 챕터 ${chapter.chapterIndex}`);
  } else {
    // 새 프롬프트 시스템을 위한 설정 변환
    const config: PodcastPromptConfig = {
      locationName,
      chapter: {
        title: chapter.title,
        description: chapter.description,
        targetDuration: chapter.targetDuration,
        estimatedSegments: chapter.estimatedSegments,
        contentFocus: chapter.contentFocus || []
      },
      locationContext,
      personaDetails: personaDetails.map(p => ({
        name: p.name,
        description: p.description,
        expertise: p.expertise,
        speechStyle: '친근하고 전문적인',
        emotionalTone: '열정적이고 호기심 많은'
      })),
      locationAnalysis: {
        significance: locationAnalysis.culturalSignificance || '중요한 문화유산',
        historicalImportance: locationAnalysis.complexityScore || 8,
        culturalValue: 9,
        uniqueFeatures: [locationAnalysis.locationType || '특별한 장소'],
        recommendations: ['필수 관람 포인트']
      },
      language,
      previousLastSpeaker: previousLastSpeaker || null  // 🔥 이전 챕터 마지막 화자 정보 전달
    };

    // 새 프롬프트 시스템으로 프롬프트 생성 및 캐시
    prompt = await createPodcastChapterPrompt(config);
    promptCache.set(cacheKey, prompt);
    console.log(`💾 새 프롬프트 생성 및 캐시: 챕터 ${chapter.chapterIndex} (이전 화자: ${previousLastSpeaker || '없음'})`);
  }

  const result = await model.generateContent(prompt);
  const scriptText = result.response.text();

  // 새 파싱 시스템 사용 (기존 호환성 유지)
  const dialogueSegments = parseDialogueScript(scriptText, language);
  
  // 기존 형식으로 변환 (기존 API 호환성 보장)
  const segments = dialogueSegments.map(segment => ({
    speaker: segment.speaker,
    text: segment.content,
    estimatedSeconds: Math.min(Math.max(Math.ceil(segment.content.length / 8), 15), 45)
  }));
  
  return {
    chapterIndex: chapter.chapterIndex,
    title: chapter.title,
    segments: segments,
    transition: chapter.transitionToNext
  };
}

/**
 * 생성된 스크립트를 세그먼트로 파싱하는 함수 (호환성 래퍼 - 레거시 지원)
 * @deprecated 새 parseDialogueScript 함수 사용 권장
 */
function parseScriptToSegments(scriptText: string, language: string = 'ko') {
  // 새 파싱 시스템 사용
  const dialogueSegments = parseDialogueScript(scriptText, language);
  
  // 기존 형식으로 변환
  return dialogueSegments.map(segment => ({
    speaker: segment.speaker,
    text: segment.content,
    estimatedSeconds: Math.min(Math.max(Math.ceil(segment.content.length / 8), 15), 45)
  }));
}

export async function POST(req: NextRequest) {
  try {
    // 전체 성능 모니터링 시작
    const totalStartTime = Date.now();
    const performanceMetrics = {
      chapterGeneration: 0,
      ttsGeneration: 0,
      dbOperations: 0,
      totalTime: 0,
      segmentCount: 0,
      throughput: 0 // 세그먼트/초
    };

    const { 
      locationName, 
      language = 'ko',
      locationContext,
      options = {}
    } = await req.json();
    
    console.log('🎙️ NotebookLM 팟캐스트 생성 요청:', { 
      locationName, 
      language,
      locationContext: locationContext ? 'provided' : 'missing'
    });
    
    if (!locationName) {
      return NextResponse.json({ 
        success: false, 
        error: '위치명이 필요합니다.' 
      }, { status: 400 });
    }

    // 🔍 Step 0: 기존 팟캐스트 에피소드 확인 (중복 방지)
    console.log('🔍 0단계: 기존 에피소드 중복 확인');
    const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
    console.log(`📍 슬러그 확인: "${locationName}" → "${slugResult.slug}" (${slugResult.source})`);

    // 슬러그 기반 기존 에피소드 조회
    const { data: existingEpisodes, error: episodeCheckError } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('location_slug', slugResult.slug)
      .eq('language', language)
      .order('created_at', { ascending: false });
    
    if (episodeCheckError) {
      console.warn('⚠️ 에피소드 조회 중 오류 (계속 진행):', episodeCheckError);
    }

    // 기존 에피소드가 있는 경우 처리 - completed만 반환, 나머지는 재생성
    if (existingEpisodes && existingEpisodes.length > 0) {
      const existingEpisode = existingEpisodes[0];
      console.log('🎙️ 기존 에피소드 발견:', {
        id: existingEpisode.id,
        status: existingEpisode.status,
        created_at: existingEpisode.created_at
      });

      // 완료된 에피소드가 있으면 바로 반환
      if (existingEpisode.status === 'completed') {
        console.log('✅ 완료된 팟캐스트 발견, 기존 에피소드 반환');

        // 세그먼트 조회
        const { data: segments } = await supabase
          .from('podcast_segments')
          .select('*')
          .eq('episode_id', existingEpisode.id)
          .order('sequence_number', { ascending: true});

        return NextResponse.json({
          success: true,
          message: '기존 완료된 팟캐스트를 반환합니다.',
          data: {
            episodeId: existingEpisode.id,
            locationName: locationName,
            language: language,
            status: 'completed',
            existingEpisode: true,
            segmentCount: segments?.length || 0,
            totalDuration: existingEpisode.total_duration || 0,
            folderPath: existingEpisode.folder_path
          }
        });
      }

      // generating이나 failed 상태는 기존 레코드 삭제 후 재생성
      console.log(`🗑️ 기존 에피소드(${existingEpisode.status}) 삭제 후 재생성`);

      // 기존 세그먼트 삭제
      await supabase
        .from('podcast_segments')
        .delete()
        .eq('episode_id', existingEpisode.id);

      // 기존 에피소드 삭제
      await supabase
        .from('podcast_episodes')
        .delete()
        .eq('id', existingEpisode.id);

      console.log('🗑️ 기존 에피소드 정리 완료');
    }

    // 📍 Step 1: 장소 분석 및 챕터 구조 생성
    console.log('🔍 1단계: AI 기반 장소 분석 시작');
    const podcastStructure = await ChapterGenerator.generatePodcastStructure(
      locationName,
      locationContext || {},
      null, // 기존 가이드 데이터는 나중에 통합
      language
    );
    
    console.log('📊 생성된 팟캐스트 구조:', {
      totalChapters: podcastStructure.totalChapters,
      locationAnalysis: podcastStructure.locationAnalysis,
      selectedPersonas: podcastStructure.selectedPersonas
    });

    // 📚 Step 2: 기존 가이드 데이터 조회 (선택적)
    console.log('📚 2단계: 기존 가이드 데이터 조회');
    const { data: existingGuide, error: guideError } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName)
      .eq('language', language)
      .order('created_at', { ascending: false })
      .limit(1);

    if (guideError) {
      console.warn('⚠️ 가이드 조회 중 오류 (계속 진행):', guideError);
    }

    const guide = existingGuide?.[0];
    
    // 기존 가이드가 있다면 챕터 구조 재생성
    let finalPodcastStructure = podcastStructure;
    if (guide) {
      console.log('🔄 기존 가이드 발견, 챕터 구조 최적화');
      finalPodcastStructure = await ChapterGenerator.generatePodcastStructure(
        locationName,
        locationContext || {},
        guide, // 기존 가이드 데이터 포함
        language
      );
    }
    
    // 🎭 Step 3: 선택된 페르소나 정보 준비  
    console.log('🎭 3단계: 전문가 페르소나 정보 준비');
    const personaDetails = finalPodcastStructure.selectedPersonas.map(personaId => 
      EXPERT_PERSONAS[personaId]
    ).filter(Boolean);
    
    console.log('👥 활성화된 페르소나:', personaDetails.map(p => `${p.name} (${p.expertise.join(', ')})`));

    // 🎤 Step 4: 챕터별 NotebookLM 스타일 스크립트 순차 생성 (API 안정성 우선)
    console.log('🎤 4단계: 챕터별 스크립트 순차 생성 시작');
    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const allChapters = [
      finalPodcastStructure.intro,
      ...finalPodcastStructure.chapters,
      ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
    ];

    console.log(`📊 순차 처리 시작: ${allChapters.length}개 챕터를 하나씩 생성 (API 안정성 향상)`);
    const startTime = Date.now();

    // 순차 처리로 API 과부하 방지 및 안정성 확보
    const chapterScripts: any[] = [];
    let previousLastSpeaker: 'male' | 'female' | null = null; // 🔥 이전 챕터의 마지막 화자 추적

    for (let i = 0; i < allChapters.length; i++) {
      const chapter = allChapters[i];
      console.log(`📝 챕터 ${chapter.chapterIndex + 1}/${allChapters.length} 생성 시작: ${chapter.title}`);

      const chapterStartTime = Date.now();

      const chapterScript = await generateChapterScript(
        model,
        chapter,
        locationName,
        locationContext,
        personaDetails,
        finalPodcastStructure.locationAnalysis,
        language,
        previousLastSpeaker  // 🔥 이전 챕터의 마지막 화자 전달
      );

      const chapterTime = Date.now() - chapterStartTime;
      console.log(`✅ 챕터 ${chapter.chapterIndex + 1} 완료 (${chapterTime}ms): ${chapterScript.segments.length}개 세그먼트`);

      chapterScripts.push({
        ...chapter,
        script: chapterScript
      });

      // 🔥 현재 챕터의 마지막 화자를 다음 챕터를 위해 저장
      // 주의: 이 시점에서는 아직 전환 세그먼트가 추가되기 전이므로,
      // 실제 마지막 화자를 정확히 추적하려면 전환 세그먼트 추가 후 업데이트 필요
      if (chapterScript.segments && chapterScript.segments.length > 0) {
        const lastSegment = chapterScript.segments[chapterScript.segments.length - 1];
        previousLastSpeaker = lastSegment.speaker as 'male' | 'female';
        console.log(`🎤 챕터 ${chapter.chapterIndex + 1} 콘텐츠 마지막 화자: ${previousLastSpeaker}`);
      }

      // 진행률 표시
      const progress = Math.round(((i + 1) / allChapters.length) * 100);
      console.log(`📊 전체 진행률: ${progress}% (${i + 1}/${allChapters.length} 챕터 완료)`);
    }

    const chapterGenerationTime = Date.now() - startTime;
    performanceMetrics.chapterGeneration = chapterGenerationTime;
    console.log(`⚡ 순차 스크립트 생성 완료: ${chapterGenerationTime}ms (평균 ${Math.round(chapterGenerationTime / allChapters.length)}ms/챕터)`);
    
    // 🔄 Step 5: 챕터 스크립트들을 하나의 연속된 대화로 통합
    console.log('🔄 5단계: 챕터 스크립트 통합 및 TTS 변환');
    
    let combinedScript = '';
    let allSegments: any[] = [];
    let segmentCounter = 1;
    
    for (const chapterScript of chapterScripts) {
      console.log(`📚 챕터 ${chapterScript.chapterIndex} 통합: ${chapterScript.script.segments.length}개 세그먼트`);
      
      for (const segment of chapterScript.script.segments) {
        const formattedSegment = {
          sequenceNumber: segmentCounter,
          speakerType: segment.speaker, // 'male' 또는 'female'
          text: segment.text,
          estimatedSeconds: segment.estimatedSeconds || 30,
          chapterIndex: chapterScript.chapterIndex,
          chapterTitle: chapterScript.title
        };
        
        allSegments.push(formattedSegment);
        combinedScript += `[${segment.speaker}] ${segment.text}\n\n`;
        segmentCounter++;
      }
      
      // 챕터 간 전환 멘트 추가 (마지막 챕터가 아닌 경우)
      if (chapterScript.script.transition && chapterScript !== chapterScripts[chapterScripts.length - 1]) {
        // 🔥 전환 세그먼트는 마지막 콘텐츠 화자와 **반대** 화자가 말함
        // 이렇게 하면 챕터 내부에서도 교대가 유지되고, 다음 챕터 시작도 자연스럽게 교대됨
        // 예: 콘텐츠 끝 [female] → 전환 [male] → 다음 챕터 시작 [female]
        const lastContentSpeaker = chapterScript.script.segments && chapterScript.script.segments.length > 0
          ? chapterScript.script.segments[chapterScript.script.segments.length - 1].speaker
          : 'female';
        const transitionSpeaker = lastContentSpeaker === 'male' ? 'female' : 'male'; // 반대 화자!

        const transitionSegment = {
          sequenceNumber: segmentCounter,
          speakerType: transitionSpeaker,
          text: chapterScript.script.transition,
          estimatedSeconds: 15,
          chapterIndex: chapterScript.chapterIndex,
          chapterTitle: '전환'
        };

        allSegments.push(transitionSegment);
        combinedScript += `[${transitionSpeaker}] ${chapterScript.script.transition}\n\n`;
        segmentCounter++;

        // 🔥 전환 세그먼트가 실제 마지막 화자이므로 previousLastSpeaker 업데이트
        previousLastSpeaker = transitionSpeaker;
        console.log(`🔄 챕터 ${chapterScript.chapterIndex + 1} 전환 세그먼트 화자: ${transitionSpeaker} (다음 챕터는 ${transitionSpeaker === 'male' ? 'female' : 'male'}로 시작)`);
      }
    }
    
    console.log(`📊 통합 완료: 총 ${allSegments.length}개 세그먼트, 예상 시간 ${Math.round(allSegments.reduce((sum, seg) => sum + seg.estimatedSeconds, 0) / 60)}분`);
    
    // 이제 기존 TTS 시스템과 호환되도록 변환
    const rawScript = combinedScript;

    console.log('🚀 순차 재생용 다중 화자 팟캐스트 생성 시작...');
    
    // 1. 이미 준비된 세그먼트를 DialogueSegment 형식으로 변환
    const processedSegments: DialogueSegment[] = allSegments.map((segment, index) => ({
      sequenceNumber: segment.sequenceNumber,
      speakerType: segment.speakerType,
      textContent: segment.text,
      estimatedDuration: segment.estimatedSeconds,
      chapterIndex: segment.chapterIndex,
      chapterTitle: segment.chapterTitle
    }));

    const processedDialogue = {
      segments: processedSegments,
      totalSegments: processedSegments.length,
      totalEstimatedDuration: processedSegments.reduce((sum, seg) => sum + seg.estimatedDuration, 0),
      maleSegments: processedSegments.filter(s => s.speakerType === 'male').length,
      femaleSegments: processedSegments.filter(s => s.speakerType === 'female').length
    };
    
    // 빈 세그먼트 검증 강화
    if (processedDialogue.segments.length === 0) {
      throw new Error('대화 세그먼트 분할에 실패했습니다.');
    }

    // 각 세그먼트의 텍스트 내용 검증 및 필터링
    const shortSegments = processedDialogue.segments.filter(
      seg => seg.textContent && seg.textContent.trim().length > 0 && seg.textContent.trim().length < 5
    );

    if (shortSegments.length > 0) {
      console.log(`⚠️  짧은 세그먼트 ${shortSegments.length}개 발견 (5자 미만), 필터링:`,
        shortSegments.map(s => `#${s.sequenceNumber}: "${s.textContent}"`).join(', ')
      );

      // 짧은 세그먼트는 제외하고 진행
      processedDialogue.segments = processedDialogue.segments.filter(
        seg => seg.textContent && seg.textContent.trim().length >= 5
      );

      // 세그먼트 번호 재정렬
      processedDialogue.segments.forEach((seg, idx) => {
        seg.sequenceNumber = idx + 1;
      });

      processedDialogue.totalSegments = processedDialogue.segments.length;
    }

    // 완전히 빈 세그먼트 체크
    const emptySegments = processedDialogue.segments.filter(
      seg => !seg.textContent || seg.textContent.trim().length === 0
    );

    if (emptySegments.length > 0) {
      console.error(`❌ 빈 세그먼트 발견:`, emptySegments.map(s => `#${s.sequenceNumber}`).join(', '));
      throw new Error(`빈 세그먼트 ${emptySegments.length}개 발견. 스크립트 생성을 재시도해주세요.`);
    }
    
    console.log('📝 스크립트 분할 완료:', {
      totalSegments: processedDialogue.totalSegments,
      maleSegments: processedDialogue.maleSegments, 
      femaleSegments: processedDialogue.femaleSegments,
      totalDuration: `${Math.round(processedDialogue.totalEstimatedDuration)}초`,
      avgSegmentDuration: `${Math.round(processedDialogue.totalEstimatedDuration / processedDialogue.totalSegments)}초`
    });

    // 2. 에피소드 DB 레코드 생성 (슬러그 정보 포함)
    const episodeId = `episode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 초기 슬러그 정보 생성 (TTS 생성 전)
    const initialSlugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
    console.log(`📍 초기 슬러그 생성: "${locationName}" → "${initialSlugResult.slug}" (${initialSlugResult.source})`);
    
    // 다국어 location_names 구성
    const locationNames = {
      [language]: locationName,
      en: initialSlugResult.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };

    const { error: insertError } = await supabase
      .from('podcast_episodes')
      .upsert({
        id: episodeId,
        guide_id: guide?.id,
        title: `${locationName} 팟캐스트 - 멀티챕터`,
        description: `${locationName}에 대한 NotebookLM 스타일 순차 재생 다중챕터 가이드`,
        language: language,
        location_input: locationName,
        location_slug: initialSlugResult.slug,
        slug_source: initialSlugResult.source,
        location_names: locationNames,  // ✅ 다국어 이름 JSONB
        user_script: rawScript,
        tts_script: processedDialogue.segments.map(s => `${s.speakerType}: ${s.textContent}`).join('\n'),
        status: 'generating',
        duration_seconds: Math.round(processedDialogue.totalEstimatedDuration),
        quality_score: 75,  // ✅ 초기 품질 점수 (최소 기준)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ 에피소드 저장 오류:', insertError);
      throw insertError;
    }
    
    console.log('📝 에피소드 DB 저장 완료:', episodeId);

    // 3. ⚠️ TTS 생성은 제외 - 사용자가 재생 버튼 클릭 시 별도 생성
    console.log('📝 스크립트 생성 완료 - TTS는 재생 시 생성됩니다');

    // TTS 없이 스크립트 세그먼트만 저장
    performanceMetrics.segmentCount = processedDialogue.segments.length;
    
    // 4. 챕터 메타데이터 계산 (제목, 구간 정보 등)
    const chapterMetaMap = new Map<number, {
      title: string;
      description?: string;
      contentFocus?: string[];
    }>();

    chapterScripts.forEach(chapterScript => {
      const index = chapterScript.chapterIndex;
      const resolvedTitle =
        chapterScript.script?.title ||
        chapterScript.title ||
        `챕터 ${index}`;

      chapterMetaMap.set(index, {
        title: resolvedTitle,
        description: chapterScript.description,
        contentFocus: Array.isArray(chapterScript.contentFocus)
          ? chapterScript.contentFocus
          : undefined
      });
    });

    // TTS 없이 스크립트 세그먼트 기반으로 타임라인 계산
    const sortedSegments = [...processedDialogue.segments].sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber
    );

    const chapterTimelineMap = new Map<number, {
      startTime: number;
      endTime: number;
      duration: number;
      segmentCount: number;
      title: string;
      description?: string;
      contentFocus?: string[];
    }>();

    let accumulatedTime = 0;

    sortedSegments.forEach(segment => {
      const chapterIndex = segment.chapterIndex ?? 0;
      const chapterMeta = chapterMetaMap.get(chapterIndex);
      const titleFromSegment =
        segment.chapterTitle ||
        chapterMeta?.title ||
        `챕터 ${chapterIndex}`;

      if (!chapterTimelineMap.has(chapterIndex)) {
        chapterTimelineMap.set(chapterIndex, {
          startTime: accumulatedTime,
          endTime: accumulatedTime,
          duration: 0,
          segmentCount: 0,
          title: titleFromSegment,
          description: chapterMeta?.description,
          contentFocus: chapterMeta?.contentFocus
        });
      }

      const current = chapterTimelineMap.get(chapterIndex)!;
      current.segmentCount += 1;
      // 예상 재생 시간 계산 (텍스트 길이 기반)
      const estimatedDuration = segment.estimatedDuration || Math.ceil(segment.textContent.length / 8);
      current.duration += estimatedDuration;
      accumulatedTime += estimatedDuration;
      current.endTime = accumulatedTime;
    });

    // 챕터 메타데이터가 있지만 세그먼트가 없는 경우도 포함
    chapterMetaMap.forEach((meta, index) => {
      if (!chapterTimelineMap.has(index)) {
        chapterTimelineMap.set(index, {
          startTime: 0,
          endTime: 0,
          duration: 0,
          segmentCount: 0,
          title: meta?.title || `챕터 ${index}`,
          description: meta?.description,
          contentFocus: meta?.contentFocus
        });
      }
    });

    const chapterTimeline = Array.from(chapterTimelineMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([chapterIndex, value]) => ({
        chapterIndex,
        title: value.title,
        description: value.description,
        contentFocus: value.contentFocus,
        segmentCount: value.segmentCount,
        startTime: Math.round(value.startTime),
        endTime: Math.round(value.endTime),
        duration: Math.round(value.duration)
      }));

    // 5. 스크립트 세그먼트를 DB에 저장 (텍스트만, audio_url은 null)
    console.log('📝 스크립트 세그먼트 DB 저장 시작...');

    const segmentRecords = sortedSegments.map(segment => ({
      episode_id: episodeId,
      sequence_number: segment.sequenceNumber,
      speaker_type: segment.speakerType,
      speaker_name: segment.speakerType === 'male' ? 'Host' : 'Curator',
      text_content: segment.textContent,
      audio_url: null,  // TTS 미생성 상태
      file_size_bytes: 0,
      duration_seconds: segment.estimatedDuration || Math.ceil(segment.textContent.length / 8),
      chapter_index: segment.chapterIndex || 0
    }));

    // 배치 삽입
    const batchSize = 20;
    let insertedCount = 0;

    for (let i = 0; i < segmentRecords.length; i += batchSize) {
      const batch = segmentRecords.slice(i, i + batchSize);

      const { error: segmentError } = await supabase
        .from('podcast_segments')
        .insert(batch);

      if (segmentError) {
        console.error(`❌ 세그먼트 배치 ${Math.floor(i/batchSize) + 1} 삽입 실패:`, segmentError);

        // 🔧 개선: 에러 발생 시에도 에피소드 상태를 'failed'로 업데이트
        const { error: failUpdate } = await supabase
          .from('podcast_episodes')
          .update({
            status: 'failed',
            error_message: `세그먼트 배치 ${Math.floor(i/batchSize) + 1} 삽입 실패: ${segmentError.message}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', episodeId);

        if (failUpdate) {
          console.error('⚠️ 실패 상태 업데이트 실패:', failUpdate);
        } else {
          console.log('✅ 에피소드 상태를 failed로 업데이트함');
        }

        throw segmentError;
      }

      insertedCount += batch.length;
    }

    console.log(`✅ ${insertedCount}개 세그먼트 DB 저장 완료`);

    // 6. 에피소드 상태 업데이트 (script_ready 상태)
    const finalLocationSlug = initialSlugResult.slug;
    const finalLocationNames = {
      [language]: locationName,
      en: finalLocationSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };

    // 품질 점수 계산 (세그먼트 수, 챕터 구조 등 고려)
    const qualityScore = Math.min(
      75 + Math.floor(processedDialogue.segments.length / 5),  // 세그먼트 많을수록 +점수
      Math.max(90, chapterTimeline.length * 5)  // 챕터 구조 잘 갖춰져 있으면 +점수
    );

    const totalEstimatedDuration = chapterTimeline.reduce((sum, ch) => sum + ch.duration, 0);

    const { error: updateError } = await supabase
      .from('podcast_episodes')
      .update({
        status: 'script_ready',  // 스크립트만 준비된 상태
        location_input: locationName,
        location_slug: finalLocationSlug,
        slug_source: initialSlugResult.source,
        location_names: finalLocationNames,
        chapter_timestamps: chapterTimeline,
        quality_score: qualityScore,
        duration_seconds: totalEstimatedDuration,  // 예상 재생 시간
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId);

    if (updateError) {
      console.warn('⚠️ 에피소드 상태 업데이트 경고:', updateError);
    }

    // 최종 성능 지표 계산
    const totalTime = Date.now() - totalStartTime;
    performanceMetrics.totalTime = totalTime;

    console.log('🎉 팟캐스트 스크립트 생성 완료!');
    console.log(`📊 성능 지표:`, {
      총_소요시간: `${totalTime}ms`,
      챕터_생성: `${performanceMetrics.chapterGeneration}ms`,
      세그먼트_개수: performanceMetrics.segmentCount
    });

    // 7. ✅ CQRS 패턴: POST는 최소 메타데이터만 반환 (상세 정보는 GET으로 조회)
    return NextResponse.json({
      success: true,
      message: '팟캐스트 스크립트가 성공적으로 생성되었습니다. 재생 버튼을 누르면 오디오가 생성됩니다.',
      data: {
        episodeId: episodeId,
        status: 'script_ready',
        locationName: locationName,
        language: language,
        segmentCount: processedDialogue.segments.length,
        estimatedDuration: totalEstimatedDuration,
        chapterCount: chapterTimeline.length,
        // ✅ 성능 지표 (개발용)
        performance: process.env.NODE_ENV === 'development' ? {
          totalTime: `${totalTime}ms`,
          챕터_생성: `${performanceMetrics.chapterGeneration}ms`
        } : undefined
      }
    });

  } catch (error) {
    console.error('❌ NotebookLM 팟캐스트 생성 중 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

/**
 * 기존 팟캐스트 조회 핸들러 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const language = searchParams.get('language') || 'ko';
    console.log('🌐 요청된 언어:', language);

    if (!location) {
      return NextResponse.json({
        success: false,
        error: 'location 파라미터가 필요합니다.'
      }, { status: 400 });
    }

    console.log('🔍 기존 팟캐스트 조회:', { location, language });

    // 1. 슬러그 기반으로 에피소드 조회
    console.log('🔍 SlugService를 통한 에피소드 조회 시작...');
    const slugResult = await LocationSlugService.getOrCreateLocationSlug(location, language);
    console.log(`📍 슬러그 결과: "${location}" → "${slugResult.slug}" (${slugResult.source})`);

    // 2. 슬러그로 먼저 조회, 없으면 입력값으로 조회 (이중 안전망)
    let episodes: any[] | null = null;
    let episodeError: any = null;
    
    // 슬러그 기반 조회
    const slugQuery = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('location_slug', slugResult.slug)
      .eq('language', language)
      .order('created_at', { ascending: false })
      .limit(1);
    
    // 슬러그 조회 실패 시 입력값 기반 조회 (fallback)
    if (slugQuery.error || !slugQuery.data || slugQuery.data.length === 0) {
      console.log('🔄 슬러그 조회 실패, 입력값 기반 조회로 fallback...');
      const inputQuery = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('location_input', location)
        .eq('language', language)
        .order('created_at', { ascending: false })
        .limit(1);
      
      episodes = inputQuery.data || null;
      episodeError = inputQuery.error || null;
    } else {
      episodes = slugQuery.data || null;
      episodeError = slugQuery.error || null;
    }

    if (episodeError) {
      console.error('❌ 에피소드 조회 오류:', episodeError);
      return NextResponse.json({
        success: false,
        error: '에피소드 조회 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    if (!episodes || episodes.length === 0) {
      console.log('📭 기존 에피소드 없음');
      return NextResponse.json({
        success: true,
        data: {
          hasEpisode: false,
          message: '기존 팟캐스트가 없습니다.'
        }
      });
    }

    // 🔧 NEW: 세그먼트가 없어도 에피소드가 있으면 반환 (부분 생성된 경우도 표시)
    // 이렇게 하면 segment가 부분적으로라도 저장되면 바로 페이지에서 표시됨
    console.log('🔍 에피소드 발견! 세그먼트 조회 전에 기본 정보 먼저 반환하도록 준비중...');

    // 찾은 에피소드 정보 로깅
    console.log('🎙️ 찾은 에피소드:', {
      id: episodes[0].id,
      title: episodes[0].title,
      status: episodes[0].status,
      created_at: episodes[0].created_at
    });

    const episode = episodes[0];

    let chapterTimelineMeta: any[] = [];
    const rawChapterTimeline = episode.chapter_timestamps;

    if (Array.isArray(rawChapterTimeline)) {
      chapterTimelineMeta = rawChapterTimeline;
    } else if (typeof rawChapterTimeline === 'string') {
      try {
        const parsed = JSON.parse(rawChapterTimeline);
        if (Array.isArray(parsed)) {
          chapterTimelineMeta = parsed;
        }
      } catch (parseError) {
        console.warn('⚠️ chapter_timestamps 문자열 파싱 실패:', parseError);
      }
    }

    const chapterMetaMap = new Map<number, any>();
    chapterTimelineMeta.forEach((meta) => {
      if (!meta) return;
      if (typeof meta.chapterIndex === 'number') {
        chapterMetaMap.set(meta.chapterIndex, meta);
      } else if (typeof meta.chapter_index === 'number') {
        chapterMetaMap.set(meta.chapter_index, meta);
      }
    });
    
    // 세그먼트 조회
    const { data: segments, error: segmentError } = await supabase
      .from('podcast_segments')
      .select('*')
      .eq('episode_id', episode.id)
      .order('sequence_number', { ascending: true });
    
    // 상태가 'generating'이지만 세그먼트가 많이 있는 경우 자동으로 completed로 업데이트
    if (episode.status === 'generating' && segments && segments.length >= 20) {
      console.log(`🔄 에피소드 상태 자동 업데이트: generating → completed (${segments.length}개 세그먼트)`);
      
      await supabase
        .from('podcast_episodes')
        .update({
          status: 'completed',
          total_segments: segments.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', episode.id);
        
      // 메모리상 에피소드 객체도 업데이트
      episode.status = 'completed';
      episode.total_segments = segments.length;
    }

    if (segmentError) {
      console.error('❌ 세그먼트 조회 오류:', segmentError);
      return NextResponse.json({
        success: false,
        error: '세그먼트 조회 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    // 세그먼트 데이터를 기반으로 챕터 구조 처리
    let chapters: any[] = [];

    if (!segments || segments.length === 0) {
      console.log('📁 세그먼트가 없음 - 스토리지 파일 스캔으로 챕터 구조 구성');
    } else {
      console.log(`📊 기존 세그먼트 발견: ${segments.length}개 - chapter_index 기반 그룹화 시작`);

      // 우선: chapter_index 기반으로 세그먼트 그룹화 (실제 대화 내용 기반)
      const chapterSegmentMap = new Map<number, any[]>();

      segments.forEach((segment) => {
        const chapterIdx = segment.chapter_index || 0;
        if (!chapterSegmentMap.has(chapterIdx)) {
          chapterSegmentMap.set(chapterIdx, []);
        }
        chapterSegmentMap.get(chapterIdx)!.push(segment);
      });

      // 챕터별로 정리
      chapters = Array.from(chapterSegmentMap.entries())
        .map(([chapterIndex, chapterSegments]) => {
          const meta = chapterMetaMap.get(chapterIndex);
          const chapterTitle = meta?.title || `챕터 ${chapterIndex}`;

          // 챕터별 총 시간 계산
          const totalDuration = chapterSegments.reduce((sum, seg) =>
            sum + (seg.duration_seconds || 30), 0
          );

          return {
            chapterNumber: chapterIndex,
            title: chapterTitle,
            description: meta?.description || `${chapterSegments.length}개 대화`,
            segmentCount: chapterSegments.length,
            totalDuration: meta?.duration || totalDuration,
            segments: chapterSegments.map(seg => ({
              sequenceNumber: seg.sequence_number,
              speakerType: seg.speaker_type || 'male',
              audioUrl: seg.audio_url,
              duration: seg.duration_seconds || 30,
              textContent: seg.text_content || '',
              chapterIndex: seg.chapter_index
            })),
            files: [] // 호환성을 위해 빈 배열
          };
        })
        .sort((a, b) => a.chapterNumber - b.chapterNumber);

      console.log(`✅ chapter_index 기반 챕터 구조 생성 완료: ${chapters.length}개 챕터`);

      // 기존 JSON 파싱 로직은 fallback으로만 사용
      if (chapters.length === 0) {
        console.log(`🔄 Fallback: JSON 데이터 파싱 시도`);

        try {
          // segments에서 text_content JSON 파싱
          const chapterMap = new Map();

        segments.forEach((segment, index) => {
          try {
            if (segment.text_content && typeof segment.text_content === 'string') {
              // JSON 문자열을 파싱
              const chapterData = JSON.parse(segment.text_content);

              if (chapterData && chapterData.files && Array.isArray(chapterData.files)) {
                const chapterKey = segment.sequence_number || (index + 1);

                chapterMap.set(chapterKey, {
                  chapterNumber: chapterKey,
                  title: chapterData.title || `챕터 ${chapterKey}`,
                  description: chapterData.description || `${chapterData.files.length}개 오디오 세그먼트`,
                  segmentCount: chapterData.files.length,
                  totalDuration: chapterData.files.length * 30, // 추정 시간
                  startFile: chapterData.startFile || chapterData.files[0],
                  endFile: chapterData.endFile || chapterData.files[chapterData.files.length - 1],
                  files: chapterData.files,
                  segments: []
                });

                console.log(`✅ 챕터 ${chapterKey} JSON 파싱 성공: ${chapterData.files.length}개 파일`);
              }
            }
          } catch (parseError) {
            console.warn(`⚠️ 세그먼트 ${index + 1} JSON 파싱 실패:`, parseError instanceof Error ? parseError.message : String(parseError));
          }
        });

        // Map을 배열로 변환하고 정렬
        chapters = Array.from(chapterMap.values()).sort((a, b) => a.chapterNumber - b.chapterNumber);

        console.log(`✅ JSON 기반 챕터 구조 파싱 완료: ${chapters.length}개 챕터`);

        } catch (error) {
          console.error('❌ JSON 파싱 중 오류 발생:', error);
          console.log('🔄 대체 방법으로 스토리지 파일 스캔 실행');
          chapters = []; // 파싱 실패 시 빈 배열로 설정하여 다음 단계로 진행
        }
      }
    }

    // JSON 파싱이 실패했거나 세그먼트가 없는 경우 스토리지 스캔
    if (chapters.length === 0) {
      console.log('📁 스토리지 파일 스캔으로 챕터 구조 구성');

      try {
        // LocationSlugService를 사용하여 폴더 경로 확인
        const locationSlug = episode.location_slug || 'default-location';
        const folderPath = `podcasts/${locationSlug}`;

        console.log(`🔍 스토리지 폴더 스캔: ${folderPath}`);

        // Supabase 스토리지에서 실제 오디오 파일 목록 조회
        const { data: audioFiles, error: storageError } = await supabase.storage
          .from('audio')
          .list(folderPath, {
            limit: 1000,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (!storageError && audioFiles && audioFiles.length > 0) {
          // .mp3 파일만 필터링
          const mp3Files = audioFiles.filter(file => file.name.endsWith('.mp3'));
          console.log(`📊 발견된 오디오 파일: ${mp3Files.length}개`);

          // 파일명을 기반으로 챕터별로 그룹화 (예: 1-1ko.mp3, 1-2ko.mp3, 2-1ko.mp3)
          const chapterGroups: { [key: number]: string[] } = {};

          mp3Files.forEach(file => {
            const match = file.name.match(/^(\d+)-(\d+)[a-z]{2}\.mp3$/);
            if (match) {
              const chapterNumber = parseInt(match[1]);
              if (!chapterGroups[chapterNumber]) {
                chapterGroups[chapterNumber] = [];
              }
              chapterGroups[chapterNumber].push(file.name);
            }
          });

          // 챕터 구조 생성
          chapters = Object.keys(chapterGroups).map(chapterNumStr => {
            const chapterNumber = parseInt(chapterNumStr);
            const files = chapterGroups[chapterNumber].sort(); // 파일명 순서 정렬
            const meta = chapterMetaMap.get(chapterNumber);

            return {
              chapterNumber: chapterNumber,
              title: meta?.title || `챕터 ${chapterNumber}`,
              description: meta?.description || `${files.length}개 오디오 세그먼트`,
              segmentCount: files.length,
              totalDuration: meta?.duration || files.length * 30, // 추정 시간
              startFile: files[0],
              endFile: files[files.length - 1],
              files: files,
              segments: []
            };
          }).sort((a, b) => a.chapterNumber - b.chapterNumber);

          console.log(`✅ 스토리지 기반 챕터 구조 생성: ${chapters.length}개 챕터, 총 ${mp3Files.length}개 파일`);
        } else {
          console.warn('⚠️ 스토리지에서 오디오 파일을 찾을 수 없음:', storageError);
          chapters = [];
        }
      } catch (error) {
        console.error('❌ 스토리지 스캔 중 오류:', error);
        chapters = [];
      }
    }

    console.log('✅ 기존 팟캐스트 조회 성공 (챕터별 구성):', {
      episodeId: episode.id,
      chapterCount: chapters.length,
      totalSegments: segments?.length || 0,
      totalDuration: episode.total_duration
    });

    return NextResponse.json({
      success: true,
      data: {
        hasEpisode: true,
        episodeId: episode.id,
        status: episode.status,
        userScript: episode.user_script,
        duration: episode.total_duration,
        chapters: chapters,
        qualityScore: episode.quality_score,
        chapterTimeline: chapterTimelineMeta
      }
    });

  } catch (error) {
    console.error('❌ 기존 팟캐스트 조회 중 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

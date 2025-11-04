import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { ChapterGenerator } from '@/lib/ai/chapter-generator';
import { LocationAnalyzer, EXPERT_PERSONAS } from '@/lib/ai/location-analyzer';
import LocationSlugService from '@/lib/location/location-slug-service';
import { parseDialogueScript, type PodcastPromptConfig } from '@/lib/ai/prompts/podcast';

export const maxDuration = 60;

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// 🔥 UNIFIED PROMPT GENERATION (1 API CALL)
// ========================================

/**
 * 모든 챕터를 한 번에 처리하는 통합 프롬프트 생성
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
[CHAPTER ${idx} STRUCTURE]
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
- 각 챕터는 [CHAPTER {숫자} START]와 [CHAPTER {숫자} END] 마커로 구분
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

[출력 형식]
각 챕터마다 정확히 다음 형식으로 작성:
[CHAPTER {번호} START]
[male] {HOST의 첫 번째 발화}
[female] {CURATOR의 응답}
[male] {HOST의 질문 또는 진행}
... (자연스러운 대화 흐름)
[CHAPTER {번호} END]

반드시 첫 번째 줄부터 끝 줄까지 [male] 또는 [female] 형식을 유지하세요.`
      : `You are a professional travel podcast producer. Generate dialogue scripts for HOST (male) and CURATOR (female) for each chapter of the location below, following the guidelines.

[Generation Guidelines]
- Generate scripts for ${chapters.length} chapters all at once
- Each chapter separated by [CHAPTER {number} START] and [CHAPTER {number} END] markers
- Clearly mark each turn with [male] or [female]
- Keep dialogue natural, accurate, and engaging for listeners
- Never have consecutive turns from same speaker (HOST → CURATOR or CURATOR → HOST)
- Use English, keep expressions concise and clear
- Consider time constraints, include only necessary information

[Participating Personas]
${personaInfo}

[Location Analysis]
- Cultural Significance: ${locationAnalysis.culturalSignificance || 'Important cultural heritage'}
- Historical Importance: ${locationAnalysis.historicalImportance || 8}/10
- Cultural Value: ${locationAnalysis.culturalValue || 9}/10
- Special Features: ${locationAnalysis.uniqueFeatures?.join(', ') || 'N/A'}
- Recommended Points: ${locationAnalysis.recommendations?.join(', ') || 'N/A'}

[Output Format]
For each chapter, write exactly in this format:
[CHAPTER {number} START]
[male] {HOST's first statement}
[female] {CURATOR's response}
[male] {HOST's question or progression}
... (natural dialogue flow)
[CHAPTER {number} END]

Maintain [male] or [female] format from first to last line.`;

  return `${systemPrompt}

[장소명]
${locationName}

[챕터 구조]
${chapterDescriptions}

이제 ${chapters.length}개 챕터의 스크립트를 생성하세요.`;
}

/**
 * 통합 응답에서 개별 챕터 추출
 */
function extractChaptersFromUnifiedResponse(
  response: string,
  chapterCount: number,
  language: string
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
    } else {
      console.warn(`⚠️ 챕터 ${i} 마커를 찾을 수 없습니다`);
    }
  }

  return chapters;
}

/**
 * 추출된 챕터를 현재 API 형식으로 변환
 */
function convertChapterToScriptFormat(
  chapterContent: string,
  chapterIndex: number,
  chapterTitle: string,
  language: string
): any {
  const segments = parseDialogueScript(chapterContent, language);

  return {
    chapterIndex,
    title: chapterTitle,
    segments: segments.map(segment => ({
      speaker: segment.speaker,
      text: segment.content,
      estimatedSeconds: Math.min(Math.max(Math.ceil(segment.content.length / 8), 15), 45)
    })),
    transition: null
  };
}

// ========================================
// 🔧 TEST ENDPOINT
// ========================================

export async function POST(req: NextRequest) {
  try {
    const totalStartTime = Date.now();

    const { locationName, language = 'ko', testMode = 'unified' } = await req.json();

    if (!locationName) {
      return NextResponse.json(
        { success: false, error: '위치명이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🧪 통합 Gemini 최적화 테스트 시작:', {
      locationName,
      language,
      testMode
    });

    // 기존 로직: 팟캐스트 구조 생성
    console.log('🔍 1단계: 장소 분석 및 챕터 구조 생성');
    const podcastStructure = await ChapterGenerator.generatePodcastStructure(
      locationName,
      {},
      null,
      language
    );

    // 페르소나 준비
    const personaDetails = podcastStructure.selectedPersonas
      .map(personaId => EXPERT_PERSONAS[personaId])
      .filter(Boolean);

    console.log('👥 활성화된 페르소나:', personaDetails.map(p => p.name));

    // 챕터 리스트 준비
    const allChapters = [
      podcastStructure.intro,
      ...podcastStructure.chapters,
      ...(podcastStructure.outro ? [podcastStructure.outro] : [])
    ];

    console.log(`📊 총 ${allChapters.length}개 챕터 준비`);

    // Gemini 클라이언트 초기화
    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let result: any = {
      success: false,
      testMode,
      locationName,
      language,
      performance: {},
      chapters: []
    };

    if (testMode === 'unified') {
      // 🔥 UNIFIED APPROACH: 1 API CALL FOR ALL CHAPTERS
      console.log('🚀 2단계: 통합 프롬프트로 모든 챕터 한 번에 생성');
      const unifiedStartTime = Date.now();

      const unifiedPrompt = createUnifiedChaptersPrompt(
        locationName,
        allChapters,
        personaDetails,
        podcastStructure.locationAnalysis,
        language
      );

      console.log(`📝 통합 프롬프트 길이: ${unifiedPrompt.length}자`);

      // 단일 API 호출
      const unifiedResponse = await model.generateContent(unifiedPrompt);
      const unifiedResponseText = unifiedResponse.response.text();

      const unifiedApiTime = Date.now() - unifiedStartTime;

      console.log(
        `✅ 통합 API 호출 완료: ${unifiedApiTime}ms (응답 길이: ${unifiedResponseText.length}자)`
      );

      // 응답에서 챕터 추출
      const extractStartTime = Date.now();
      const extractedChapters = extractChaptersFromUnifiedResponse(
        unifiedResponseText,
        allChapters.length,
        language
      );
      const extractTime = Date.now() - extractStartTime;

      console.log(
        `✅ 챕터 추출 완료: ${extractTime}ms (${extractedChapters.size}/${allChapters.length} 성공)`
      );

      // 추출된 챕터를 API 형식으로 변환
      const processingStartTime = Date.now();
      const chapterScripts: any[] = [];

      for (let i = 0; i < allChapters.length; i++) {
        const chapter = allChapters[i];
        const extractedContent = extractedChapters.get(i);

        if (extractedContent) {
          const scriptFormat = convertChapterToScriptFormat(
            extractedContent,
            chapter.chapterIndex,
            chapter.title,
            language
          );
          chapterScripts.push(scriptFormat);
          console.log(`✅ 챕터 ${i}: ${scriptFormat.segments.length}개 세그먼트`);
        } else {
          console.warn(`⚠️ 챕터 ${i} 추출 실패`);
        }
      }

      const processingTime = Date.now() - processingStartTime;

      // 최종 결과
      result = {
        success: chapterScripts.length === allChapters.length,
        testMode: 'unified',
        locationName,
        language,
        performance: {
          totalTime: Date.now() - totalStartTime,
          apiCallTime: unifiedApiTime,
          extractionTime: extractTime,
          processingTime: processingTime,
          apiCallCount: 1,
          timePerChapter: Math.round(unifiedApiTime / allChapters.length)
        },
        chapters: {
          count: chapterScripts.length,
          successful: chapterScripts.length,
          failed: allChapters.length - chapterScripts.length,
          totalSegments: chapterScripts.reduce((sum, ch) => sum + ch.segments.length, 0)
        },
        output: {
          chapterCount: chapterScripts.length,
          details: chapterScripts.map(ch => ({
            chapterIndex: ch.chapterIndex,
            title: ch.title,
            segmentCount: ch.segments.length,
            firstSegment: ch.segments[0]?.text?.substring(0, 50) || 'N/A'
          }))
        }
      };
    } else if (testMode === 'sequential') {
      // 기존 SEQUENTIAL APPROACH: 7 API CALLS
      console.log('🔄 2단계: 기존 순차 처리로 챕터별 생성');
      const sequentialStartTime = Date.now();

      const chapterScripts: any[] = [];
      let apiCallCount = 0;

      for (let i = 0; i < allChapters.length; i++) {
        const chapter = allChapters[i];
        const chapterStartTime = Date.now();

        // 기존과 동일한 개별 프롬프트 생성
        const config: PodcastPromptConfig = {
          locationName,
          chapter: {
            title: chapter.title,
            description: chapter.description,
            targetDuration: chapter.targetDuration,
            estimatedSegments: chapter.estimatedSegments,
            contentFocus: chapter.contentFocus || []
          },
          personaDetails: personaDetails.map(p => ({
            name: p.name,
            description: p.description,
            expertise: p.expertise,
            speechStyle: '친근하고 전문적인',
            emotionalTone: '열정적이고 호기심 많은'
          })),
          locationAnalysis: {
            significance: podcastStructure.locationAnalysis.culturalSignificance || '중요한 문화유산',
            historicalImportance: podcastStructure.locationAnalysis.complexityScore || 8,
            culturalValue: 9,
            uniqueFeatures: [podcastStructure.locationAnalysis.locationType || '특별한 장소'],
            recommendations: ['필수 관람 포인트']
          },
          language
        };

        // 개별 API 호출 (기존 방식)
        const { createPodcastChapterPrompt } = await import('@/lib/ai/prompts/podcast');
        const prompt = await createPodcastChapterPrompt(config);
        const response = await model.generateContent(prompt);
        const scriptText = response.response.text();

        apiCallCount++;

        const dialogueSegments = parseDialogueScript(scriptText, language);
        const segments = dialogueSegments.map(segment => ({
          speaker: segment.speaker,
          text: segment.content,
          estimatedSeconds: Math.min(Math.max(Math.ceil(segment.content.length / 8), 15), 45)
        }));

        chapterScripts.push({
          chapterIndex: chapter.chapterIndex,
          title: chapter.title,
          segments,
          transition: chapter.transitionToNext
        });

        const chapterTime = Date.now() - chapterStartTime;
        console.log(
          `✅ 챕터 ${i}: ${chapterTime}ms (${segments.length}개 세그먼트)`
        );
      }

      const sequentialTotalTime = Date.now() - sequentialStartTime;

      result = {
        success: chapterScripts.length === allChapters.length,
        testMode: 'sequential',
        locationName,
        language,
        performance: {
          totalTime: sequentialTotalTime,
          apiCallTime: sequentialTotalTime,
          extractionTime: 0,
          processingTime: 0,
          apiCallCount,
          timePerChapter: Math.round(sequentialTotalTime / allChapters.length)
        },
        chapters: {
          count: chapterScripts.length,
          successful: chapterScripts.length,
          failed: allChapters.length - chapterScripts.length,
          totalSegments: chapterScripts.reduce((sum, ch) => sum + ch.segments.length, 0)
        },
        output: {
          chapterCount: chapterScripts.length,
          details: chapterScripts.map(ch => ({
            chapterIndex: ch.chapterIndex,
            title: ch.title,
            segmentCount: ch.segments.length,
            firstSegment: ch.segments[0]?.text?.substring(0, 50) || 'N/A'
          }))
        }
      };
    }

    console.log('🎉 테스트 완료!');
    console.log(JSON.stringify(result.performance, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

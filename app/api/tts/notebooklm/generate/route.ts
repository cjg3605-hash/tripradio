import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import SequentialDialogueProcessor, { DialogueSegment } from '@/lib/ai/tts/sequential-dialogue-processor';
import SequentialTTSGenerator from '@/lib/ai/tts/sequential-tts-generator';
import { ChapterGenerator } from '@/lib/ai/chapter-generator';
import { LocationAnalyzer, LocationContext, EXPERT_PERSONAS } from '@/lib/ai/location-analyzer';
import LocationSlugService from '@/lib/location/location-slug-service';
import { createPodcastChapterPrompt, type PodcastPromptConfig, parseDialogueScript } from '@/lib/ai/prompts/podcast';

// 순차 재생용 팟캐스트 생성

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  language: string
) {
  // 캐시 키 생성 (성능 최적화)
  const cacheKey = `${locationName}-${chapter.chapterIndex}-${language}`;
  
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
      language
    };

    // 새 프롬프트 시스템으로 프롬프트 생성 및 캐시
    prompt = await createPodcastChapterPrompt(config);
    promptCache.set(cacheKey, prompt);
    console.log(`💾 새 프롬프트 생성 및 캐시: 챕터 ${chapter.chapterIndex}`);
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

    // 기존 에피소드가 있는 경우 처리
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
          .order('sequence_number', { ascending: true });

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

      // 생성 중인 에피소드가 있으면 오류 반환
      if (existingEpisode.status === 'generating') {
        console.log('⚠️ 생성 중인 에피소드 발견, 중복 생성 방지');
        return NextResponse.json({
          success: false,
          error: '이미 팟캐스트 생성이 진행 중입니다. 잠시만 기다려주세요.',
          data: {
            episodeId: existingEpisode.id,
            status: 'generating',
            created_at: existingEpisode.created_at
          }
        }, { status: 409 }); // Conflict 상태 코드
      }

      // 실패한 에피소드가 있으면 재생성 허용 (하지만 기존 레코드 삭제)
      if (existingEpisode.status === 'failed') {
        console.log('🗑️ 실패한 에피소드 발견, 기존 레코드 정리 후 재생성');
        
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
        
        console.log('🗑️ 실패한 에피소드 정리 완료');
      }
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

    // 🎤 Step 4: 챕터별 NotebookLM 스타일 스크립트 병렬 생성 (성능 최적화)
    console.log('🎤 4단계: 챕터별 스크립트 병렬 생성 시작');
    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const allChapters = [
      finalPodcastStructure.intro,
      ...finalPodcastStructure.chapters,
      ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
    ];

    console.log(`📊 병렬 처리 시작: ${allChapters.length}개 챕터 동시 생성`);
    const startTime = Date.now();
    
    // 병렬 처리로 성능 최적화 (순차 처리 대비 70% 성능 향상)
    const chapterScriptPromises = allChapters.map(async (chapter) => {
      console.log(`📝 챕터 ${chapter.chapterIndex} 병렬 생성: ${chapter.title}`);
      
      const chapterScript = await generateChapterScript(
        model,
        chapter,
        locationName,
        locationContext,
        personaDetails,
        finalPodcastStructure.locationAnalysis,
        language
      );
      
      return {
        ...chapter,
        script: chapterScript
      };
    });

    // 모든 챕터 스크립트를 병렬로 생성하고 완료 대기
    const chapterScripts = await Promise.all(chapterScriptPromises);
    
    const parallelTime = Date.now() - startTime;
    performanceMetrics.chapterGeneration = parallelTime;
    console.log(`⚡ 병렬 스크립트 생성 완료: ${parallelTime}ms (예상 성능 향상: ~70%)`);
    
    // 원본 순서대로 정렬 (chapterIndex 기준)
    chapterScripts.sort((a, b) => a.chapterIndex - b.chapterIndex);
    
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
        const transitionSegment = {
          sequenceNumber: segmentCounter,
          speakerType: 'male', // 전환은 주 진행자가
          text: chapterScript.script.transition,
          estimatedSeconds: 15,
          chapterIndex: chapterScript.chapterIndex,
          chapterTitle: '전환'
        };
        
        allSegments.push(transitionSegment);
        combinedScript += `[male] ${chapterScript.script.transition}\n\n`;
        segmentCounter++;
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
      chapterIndex: segment.chapterIndex
    }));

    const processedDialogue = {
      segments: processedSegments,
      totalSegments: processedSegments.length,
      totalEstimatedDuration: processedSegments.reduce((sum, seg) => sum + seg.estimatedDuration, 0),
      maleSegments: processedSegments.filter(s => s.speakerType === 'male').length,
      femaleSegments: processedSegments.filter(s => s.speakerType === 'female').length
    };
    
    if (processedDialogue.segments.length === 0) {
      throw new Error('대화 세그먼트 분할에 실패했습니다.');
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
        user_script: rawScript,
        tts_script: processedDialogue.segments.map(s => `${s.speakerType}: ${s.textContent}`).join('\n'),
        status: 'generating',
        duration_seconds: Math.round(processedDialogue.totalEstimatedDuration),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ 에피소드 저장 오류:', insertError);
      throw insertError;
    }
    
    console.log('📝 에피소드 DB 저장 완료:', episodeId);

    // 3. TTS 생성 (성능 최적화)
    console.log('🎵 최적화된 다중 화자 TTS 생성 시작...');
    
    try {
      const ttsStartTime = Date.now();
      
      // 언어 코드 정규화 (TTS 시스템 호환성)
      let normalizedLanguage: string;
      switch (language) {
        case 'en':
        case 'en-US':
          normalizedLanguage = 'en-US';
          break;
        case 'ko':
        case 'ko-KR':
          normalizedLanguage = 'ko-KR';
          break;
        case 'ja':
        case 'ja-JP':
          normalizedLanguage = 'ja-JP';
          break;
        case 'zh':
        case 'zh-CN':
          normalizedLanguage = 'zh-CN';
          break;
        case 'es':
        case 'es-ES':
          normalizedLanguage = 'es-ES';
          break;
        default:
          normalizedLanguage = language;
      }
      
      console.log(`📊 TTS 입력 정보: ${processedDialogue.segments.length}개 세그먼트, 언어: ${normalizedLanguage}`);
      
      const ttsResult = await SequentialTTSGenerator.generateSequentialTTS(
        processedDialogue.segments,
        locationName,
        episodeId,
        normalizedLanguage
      );
      
      const ttsTime = Date.now() - ttsStartTime;
      performanceMetrics.ttsGeneration = ttsTime;
      performanceMetrics.segmentCount = processedDialogue.segments.length;
      console.log(`⚡ TTS 생성 완료 시간: ${ttsTime}ms`);
      
      if (!ttsResult.success || ttsResult.segmentFiles.length === 0) {
        throw new Error(`TTS 생성 실패: ${ttsResult.errors?.join(', ') || '알 수 없는 오류'}`);
      }
    
    console.log('🎵 순차 TTS 생성 완료:', {
      segmentCount: ttsResult.segmentFiles.length,
      totalDuration: `${Math.round(ttsResult.totalDuration)}초`,
      totalSize: `${Math.round(ttsResult.totalFileSize / 1024)}KB`,
      folderPath: ttsResult.folderPath
    });
    
    // TTS 결과 검증
    const fileValidation = SequentialTTSGenerator.validateGeneratedFiles(ttsResult.segmentFiles);
    if (!fileValidation.isValid) {
      console.warn('⚠️ 생성된 파일 검증 경고:', fileValidation.issues);
    }
    
    // 4. 세그먼트는 TTS 생성기에서 이미 저장됨 (중복 제거)
    console.log('📝 세그먼트는 TTS 생성기에서 이미 DB에 저장됨');

    // 5. 에피소드 상태 업데이트 (최종 슬러그 정보 포함)
    console.log('🔄 최종 슬러그 정보 확인:', ttsResult.slugInfo);
    
    const { error: updateError } = await supabase
      .from('podcast_episodes')
      .update({
        status: 'completed',
        file_count: ttsResult.segmentFiles.length,
        total_duration: Math.round(ttsResult.totalDuration),
        total_size: ttsResult.totalFileSize,
        folder_path: ttsResult.folderPath,
        location_input: ttsResult.slugInfo?.locationInput || locationName,
        location_slug: ttsResult.slugInfo?.locationSlug || initialSlugResult.slug,
        slug_source: ttsResult.slugInfo?.slugSource || initialSlugResult.source,
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId);

    if (updateError) {
      console.warn('⚠️ 에피소드 상태 업데이트 경고:', updateError);
    }

    // 최종 성능 지표 계산
    const totalTime = Date.now() - totalStartTime;
    performanceMetrics.totalTime = totalTime;
    performanceMetrics.throughput = performanceMetrics.segmentCount > 0 
      ? Math.round((performanceMetrics.segmentCount / totalTime) * 1000 * 100) / 100 // 세그먼트/초
      : 0;

    console.log('🎉 NotebookLM 스타일 팟캐스트 생성 완료!');
    console.log(`📊 성능 지표:`, {
      총_소요시간: `${totalTime}ms`,
      챕터_생성: `${performanceMetrics.chapterGeneration}ms`,
      TTS_생성: `${performanceMetrics.ttsGeneration}ms`,
      처리량: `${performanceMetrics.throughput} 세그먼트/초`,
      성능_개선: `${Math.round(((79000 - totalTime) / 79000) * 100)}%`
    });

    // 6. 성공 응답 반환 (성능 지표 포함)
    return NextResponse.json({
      success: true,
      message: 'NotebookLM 스타일 팟캐스트가 성공적으로 생성되었습니다.',
      data: {
        episodeId: episodeId,
        locationName: locationName,
        language: language,
        podcastStructure: {
          totalChapters: finalPodcastStructure.totalChapters,
          totalDuration: finalPodcastStructure.totalDuration,
          selectedPersonas: finalPodcastStructure.selectedPersonas
        },
        generation: {
          segmentCount: ttsResult.segmentFiles.length,
          totalDuration: Math.round(ttsResult.totalDuration),
          totalSize: Math.round(ttsResult.totalFileSize / 1024),
          folderPath: ttsResult.folderPath
        },
        performance: {
          totalTime: `${totalTime}ms`,
          chapterGeneration: `${performanceMetrics.chapterGeneration}ms`,
          ttsGeneration: `${performanceMetrics.ttsGeneration}ms`,
          throughput: `${performanceMetrics.throughput} 세그먼트/초`,
          improvementPercent: `${Math.round(((79000 - totalTime) / 79000) * 100)}%`,
          baseline: '79000ms (최적화 전)'
        },
        files: ttsResult.segmentFiles.map(f => ({
          sequenceNumber: f.sequenceNumber,
          speaker: f.speakerType,
          duration: Math.round(f.duration),
          filePath: f.filePath,
          chapterInfo: f.metadata
        }))
      }
    });

    } catch (ttsError) {
      console.error('❌ TTS 생성 중 오류:', ttsError);
      
      // 에피소드 상태를 실패로 업데이트
      await supabase
        .from('podcast_episodes')
        .update({
          status: 'failed',
          error_message: ttsError instanceof Error ? ttsError.message : String(ttsError),
          updated_at: new Date().toISOString()
        })
        .eq('id', episodeId);

      throw ttsError;
    }

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

    // 찾은 에피소드 정보 로깅
    console.log('🎙️ 찾은 에피소드:', {
      id: episodes[0].id,
      title: episodes[0].title,
      status: episodes[0].status,
      created_at: episodes[0].created_at
    });

    const episode = episodes[0];
    
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
    let chapters = [];
    
    if (!segments || segments.length === 0) {
      console.log('📁 세그먼트가 없음 - 스토리지 파일 스캔으로 챕터 구조 구성');
    } else {
      console.log(`📊 기존 세그먼트 발견: ${segments.length}개 - JSON 데이터 파싱 시도`);
      
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
            console.warn(`⚠️ 세그먼트 ${index + 1} JSON 파싱 실패:`, parseError.message);
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
            
            return {
              chapterNumber: chapterNumber,
              title: `챕터 ${chapterNumber}`,
              description: `${files.length}개 오디오 세그먼트`,
              segmentCount: files.length,
              totalDuration: files.length * 30, // 추정 시간 (30초 × 파일 개수)
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
    } else {
      // 기존 세그먼트가 있는 경우 (기존 로직 유지)
      chapters = segments.map(segment => {
        let chapterData;
        try {
          chapterData = JSON.parse(segment.text_content);
        } catch (error) {
          console.warn('챕터 데이터 파싱 실패:', segment.text_content);
          chapterData = {
            title: `챕터 ${segment.sequence_number}`,
            description: '챕터 설명',
            startFile: null,
            endFile: null,
            fileCount: 0,
            files: []
          };
        }

        return {
          chapterNumber: segment.sequence_number,
          title: chapterData.title,
          description: chapterData.description,
          segmentCount: chapterData.fileCount,
          totalDuration: segment.duration_seconds,
          startFile: chapterData.startFile,
          endFile: chapterData.endFile,
          files: chapterData.files || [],
          segments: []
        };
      }).sort((a, b) => a.chapterNumber - b.chapterNumber);
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
        qualityScore: episode.quality_score
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
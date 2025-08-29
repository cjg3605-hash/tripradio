import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import SequentialTTSGenerator from '@/lib/ai/tts/sequential-tts-generator';
import { ChapterGenerator } from '@/lib/ai/chapter-generator';
import { LocationAnalyzer, LocationContext, EXPERT_PERSONAS } from '@/lib/ai/location-analyzer';
import LocationSlugService from '@/lib/location/location-slug-service';
import { createPodcastChapterPrompt, type PodcastPromptConfig, parseDialogueScript } from '@/lib/ai/prompts/podcast';

// 챕터별 순차 생성용 팟캐스트 API

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 단일 챕터 스크립트 생성 함수 - 새 프롬프트 시스템 통합
 */
async function generateSingleChapterScript(
  model: any,
  chapter: any,
  locationName: string,
  locationContext: LocationContext,
  personaDetails: any[],
  locationAnalysis: any,
  language: string
) {
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

  // 새 프롬프트 시스템으로 프롬프트 생성
  const prompt = await createPodcastChapterPrompt(config);

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
 * 스크립트 파싱 함수 (호환성 래퍼 - 레거시 지원)
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
    const { 
      locationName, 
      language = 'ko',
      locationContext,
      chapterIndex, // 특정 챕터만 생성
      action = 'init' // 'init', 'generate_chapter', 'generate_all_chapters', 'finalize'
    } = await req.json();
    
    console.log('🎙️ 챕터별 팟캐스트 생성 요청:', { 
      locationName, 
      language,
      chapterIndex,
      action
    });

    if (!locationName) {
      return NextResponse.json({ 
        success: false, 
        error: '위치명이 필요합니다.' 
      }, { status: 400 });
    }

    // 액션별 처리
    switch (action) {
      case 'init':
        return await handleInitialization(locationName, language, locationContext);
      case 'generate_chapter':
        return await handleChapterGeneration(locationName, language, locationContext, chapterIndex);
      case 'generate_all_chapters':
        return await handleAllChaptersGeneration(locationName, language, locationContext);
      case 'finalize':
        return await handleFinalization(locationName, language);
      default:
        return NextResponse.json({
          success: false,
          error: '잘못된 action입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ 챕터별 팟캐스트 생성 중 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

/**
 * 1단계: 초기화 - 팟캐스트 구조 생성 및 에피소드 레코드 생성
 */
async function handleInitialization(
  locationName: string, 
  language: string, 
  locationContext: any
) {
  console.log('🚀 1단계: 팟캐스트 초기화 시작');

  // 기존 에피소드 확인
  const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
  const { data: existingEpisodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', slugResult.slug)
    .eq('language', language)
    .order('created_at', { ascending: false });

  // 완료된 에피소드가 있으면 바로 반환
  if (existingEpisodes && existingEpisodes.length > 0 && existingEpisodes[0].status === 'completed') {
    const { data: segments } = await supabase
      .from('podcast_segments')
      .select('*')
      .eq('episode_id', existingEpisodes[0].id)
      .order('sequence_number', { ascending: true });

    return NextResponse.json({
      success: true,
      message: '기존 완료된 팟캐스트가 있습니다.',
      data: {
        episodeId: existingEpisodes[0].id,
        status: 'completed',
        existingEpisode: true,
        segmentCount: segments?.length || 0
      }
    });
  }

  // 생성 중인 에피소드 정리
  if (existingEpisodes && existingEpisodes.length > 0 && existingEpisodes[0].status === 'generating') {
    console.log('🗑️ 기존 생성 중인 에피소드 정리');
    await supabase.from('podcast_segments').delete().eq('episode_id', existingEpisodes[0].id);
    await supabase.from('podcast_episodes').delete().eq('id', existingEpisodes[0].id);
  }

  // 장소 분석 및 챕터 구조 생성
  const podcastStructure = await ChapterGenerator.generatePodcastStructure(
    locationName,
    locationContext || {},
    null,
    language
  );

  const allChapters = [
    podcastStructure.intro,
    ...podcastStructure.chapters,
    ...(podcastStructure.outro ? [podcastStructure.outro] : [])
  ];

  // 에피소드 생성
  const episodeId = `episode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const { error: insertError } = await supabase
    .from('podcast_episodes')
    .insert({
      id: episodeId,
      title: `${locationName} 팟캐스트 - 챕터별 생성`,
      description: `${locationName}에 대한 NotebookLM 스타일 챕터별 순차 생성 가이드`,
      language: language,
      location_input: locationName,
      location_slug: slugResult.slug,
      slug_source: slugResult.source,
      status: 'generating',
      duration_seconds: podcastStructure.totalDuration,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (insertError) {
    throw insertError;
  }

  console.log('✅ 팟캐스트 초기화 완료:', {
    episodeId,
    totalChapters: allChapters.length,
    estimatedDuration: podcastStructure.totalDuration
  });

  return NextResponse.json({
    success: true,
    message: '팟캐스트 구조가 생성되었습니다.',
    data: {
      episodeId,
      locationName,
      language,
      totalChapters: allChapters.length,
      chapters: allChapters.map((ch, idx) => ({
        index: idx,
        title: ch.title,
        description: ch.description,
        estimatedDuration: ch.targetDuration,
        estimatedSegments: ch.estimatedSegments
      })),
      podcastStructure: {
        totalDuration: podcastStructure.totalDuration,
        selectedPersonas: podcastStructure.selectedPersonas,
        locationAnalysis: podcastStructure.locationAnalysis
      }
    }
  });
}

/**
 * 2단계: 특정 챕터 생성
 */
async function handleChapterGeneration(
  locationName: string, 
  language: string, 
  locationContext: any,
  chapterIndex: number
) {
  console.log(`🎤 2단계: 챕터 ${chapterIndex} 생성 시작`);

  if (typeof chapterIndex !== 'number' || chapterIndex < 0) {
    return NextResponse.json({
      success: false,
      error: '유효한 챕터 인덱스가 필요합니다.'
    }, { status: 400 });
  }

  // 에피소드 확인
  const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
  const { data: episodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', slugResult.slug)
    .eq('language', language)
    .eq('status', 'generating')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!episodes || episodes.length === 0) {
    return NextResponse.json({
      success: false,
      error: '생성 중인 에피소드를 찾을 수 없습니다. 먼저 초기화를 진행하세요.'
    }, { status: 404 });
  }

  const episode = episodes[0];

  // 팟캐스트 구조 재생성 (챕터 정보를 위해)
  const podcastStructure = await ChapterGenerator.generatePodcastStructure(
    locationName,
    locationContext || {},
    null,
    language
  );

  const allChapters = [
    podcastStructure.intro,
    ...podcastStructure.chapters,
    ...(podcastStructure.outro ? [podcastStructure.outro] : [])
  ];

  if (chapterIndex >= allChapters.length) {
    return NextResponse.json({
      success: false,
      error: `유효하지 않은 챕터 인덱스입니다. (최대: ${allChapters.length - 1})`
    }, { status: 400 });
  }

  const targetChapter = allChapters[chapterIndex];

  // 페르소나 정보 준비
  const personaDetails = podcastStructure.selectedPersonas.map(personaId => 
    EXPERT_PERSONAS[personaId]
  ).filter(Boolean);

  // 챕터 스크립트 생성
  const geminiClient = getGeminiClient();
  const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const chapterScript = await generateSingleChapterScript(
    model,
    targetChapter,
    locationName,
    locationContext,
    personaDetails,
    podcastStructure.locationAnalysis,
    language
  );

  // 세그먼트들을 DB 형식으로 변환
  const processedSegments = chapterScript.segments.map((segment, segIdx) => ({
    sequenceNumber: (chapterIndex * 100) + segIdx + 1, // 챕터별로 100씩 차이
    speakerType: segment.speaker as 'male' | 'female',
    textContent: segment.text,
    estimatedDuration: segment.estimatedSeconds,
    chapterIndex: chapterIndex
  }));

  // TTS 생성
  try {
    const ttsResult = await SequentialTTSGenerator.generateSequentialTTS(
      processedSegments,
      locationName,
      episode.id,
      language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : language,
      chapterIndex  // 실제 챕터 인덱스 전달
    );

    if (!ttsResult.success) {
      throw new Error(`TTS 생성 실패: ${ttsResult.errors?.join(', ')}`);
    }

    console.log(`✅ 챕터 ${chapterIndex} 생성 완료:`, {
      segmentCount: ttsResult.segmentFiles.length,
      duration: Math.round(ttsResult.totalDuration),
      folderPath: ttsResult.folderPath
    });

    return NextResponse.json({
      success: true,
      message: `챕터 ${chapterIndex} (${targetChapter.title}) 생성 완료`,
      data: {
        chapterIndex,
        chapterTitle: targetChapter.title,
        segmentCount: ttsResult.segmentFiles.length,
        duration: Math.round(ttsResult.totalDuration),
        files: ttsResult.segmentFiles.map(f => ({
          sequenceNumber: f.sequenceNumber,
          speaker: f.speakerType,
          duration: Math.round(f.duration),
          fileName: f.fileName,
          filePath: f.filePath
        }))
      }
    });

  } catch (ttsError) {
    console.error(`❌ 챕터 ${chapterIndex} TTS 생성 실패:`, ttsError);
    throw ttsError;
  }
}

/**
 * 2.5단계: 모든 챕터 자동 순차 생성
 */
async function handleAllChaptersGeneration(
  locationName: string, 
  language: string, 
  locationContext: any
) {
  console.log('🚀 전체 챕터 자동 생성 시작');

  // 에피소드 확인
  const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
  const { data: episodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', slugResult.slug)
    .eq('language', language)
    .eq('status', 'generating')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!episodes || episodes.length === 0) {
    return NextResponse.json({
      success: false,
      error: '생성 중인 에피소드를 찾을 수 없습니다. 먼저 초기화를 진행하세요.'
    }, { status: 404 });
  }

  const episode = episodes[0];

  // 팟캐스트 구조 조회
  const podcastStructure = await ChapterGenerator.generatePodcastStructure(
    locationName,
    locationContext || {},
    null,
    language
  );

  const allChapters = [
    podcastStructure.intro,
    ...podcastStructure.chapters,
    ...(podcastStructure.outro ? [podcastStructure.outro] : [])
  ];

  console.log(`📊 총 ${allChapters.length}개 챕터 생성 예정`);

  // 기존 완료된 챕터 확인
  const { data: existingSegments } = await supabase
    .from('podcast_segments')
    .select('sequence_number')
    .eq('episode_id', episode.id)
    .not('audio_url', 'is', null); // 오디오 파일이 있는 세그먼트만

  const existingChapters = new Set();
  if (existingSegments && existingSegments.length > 0) {
    existingSegments.forEach(seg => {
      const chapterIndex = Math.floor(seg.sequence_number / 100);
      existingChapters.add(chapterIndex);
    });
    console.log(`🔄 기존 완료된 챕터: [${Array.from(existingChapters).join(', ')}]`);
  }

  // 각 챕터 순차 생성
  const results: Array<{
    chapterIndex: number;
    chapterTitle: string;
    status: 'success' | 'skipped' | 'error';
    reason?: string;
    error?: string;
    segmentCount?: number;
    duration?: number;
  }> = [];
  let successCount = 0;
  let failureCount = 0;

  for (let chapterIndex = 0; chapterIndex < allChapters.length; chapterIndex++) {
    const chapter = allChapters[chapterIndex];
    
    // 이미 완료된 챕터는 건너뛰기
    if (existingChapters.has(chapterIndex)) {
      console.log(`⏭️ 챕터 ${chapterIndex} (${chapter.title}) 이미 완료됨, 건너뛰기`);
      results.push({
        chapterIndex,
        chapterTitle: chapter.title,
        status: 'skipped',
        reason: 'already_completed'
      });
      continue;
    }

    try {
      console.log(`🎤 챕터 ${chapterIndex} (${chapter.title}) 생성 중...`);
      
      // 개별 챕터 생성 호출 (기존 함수 재사용)
      const chapterResult = await handleChapterGeneration(
        locationName, 
        language, 
        locationContext, 
        chapterIndex
      );

      if (chapterResult instanceof NextResponse) {
        const responseData = await chapterResult.json();
        if (responseData.success) {
          successCount++;
          results.push({
            chapterIndex,
            chapterTitle: chapter.title,
            status: 'success',
            segmentCount: responseData.data?.segmentCount || 0,
            duration: responseData.data?.duration || 0
          });
          console.log(`✅ 챕터 ${chapterIndex} 생성 완료`);
        } else {
          throw new Error(responseData.error || '챕터 생성 실패');
        }
      }

      // 챕터 간 딜레이 (API 제한 고려)
      if (chapterIndex < allChapters.length - 1) {
        console.log('⏳ 챕터 간 대기 (3초)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      failureCount++;
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error(`❌ 챕터 ${chapterIndex} 생성 실패:`, errorMessage);
      
      results.push({
        chapterIndex,
        chapterTitle: chapter.title,
        status: 'error',
        error: errorMessage
      });

      // 실패해도 다음 챕터 계속 진행
      console.log('🔄 다음 챕터 진행...');
    }
  }

  // 결과 정리
  const completedChapters = results.filter(r => r.status === 'success' || r.status === 'skipped').length;
  const totalChapters = allChapters.length;
  
  console.log(`📊 전체 생성 결과: ${completedChapters}/${totalChapters} 완료`);

  // 모든 챕터가 완료되었으면 자동 최종화
  if (completedChapters === totalChapters && failureCount === 0) {
    console.log('🏁 모든 챕터 완료, 자동 최종화 진행...');
    try {
      const finalizationResult = await handleFinalization(locationName, language);
      if (finalizationResult instanceof NextResponse) {
        const finalizationData = await finalizationResult.json();
        console.log('✅ 최종화 완료');
      }
    } catch (finalizationError) {
      console.warn('⚠️ 최종화 실패 (수동으로 진행 필요):', finalizationError);
    }
  }

  return NextResponse.json({
    success: completedChapters > 0,
    message: `전체 챕터 생성 ${completedChapters === totalChapters ? '완료' : '부분 완료'}`,
    data: {
      totalChapters,
      completedChapters,
      successCount,
      failureCount,
      results,
      needsFinalization: completedChapters === totalChapters && failureCount === 0 ? false : true
    }
  });
}

/**
 * 3단계: 최종화
 */
async function handleFinalization(locationName: string, language: string) {
  console.log('🏁 3단계: 팟캐스트 최종화 시작');

  // 에피소드 확인
  const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
  const { data: episodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', slugResult.slug)
    .eq('language', language)
    .eq('status', 'generating')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!episodes || episodes.length === 0) {
    return NextResponse.json({
      success: false,
      error: '최종화할 에피소드를 찾을 수 없습니다.'
    }, { status: 404 });
  }

  const episode = episodes[0];

  // 모든 세그먼트 조회
  const { data: segments } = await supabase
    .from('podcast_segments')
    .select('*')
    .eq('episode_id', episode.id)
    .order('sequence_number', { ascending: true });

  if (!segments || segments.length === 0) {
    return NextResponse.json({
      success: false,
      error: '생성된 세그먼트가 없습니다.'
    }, { status: 400 });
  }

  // 총 지속시간 및 파일 크기 계산
  const totalDuration = segments.reduce((sum, seg) => sum + (seg.duration_seconds || 0), 0);
  const totalSize = segments.reduce((sum, seg) => sum + (seg.file_size_bytes || 0), 0);

  // 에피소드 완료 처리
  const { error: updateError } = await supabase
    .from('podcast_episodes')
    .update({
      status: 'completed',
      file_count: segments.length,
      total_duration: totalDuration,
      total_size: totalSize,
      updated_at: new Date().toISOString()
    })
    .eq('id', episode.id);

  if (updateError) {
    console.warn('⚠️ 에피소드 상태 업데이트 실패:', updateError);
  }

  console.log('🎉 팟캐스트 최종화 완료!', {
    episodeId: episode.id,
    segmentCount: segments.length,
    totalDuration,
    totalSize
  });

  return NextResponse.json({
    success: true,
    message: '팟캐스트가 성공적으로 완성되었습니다!',
    data: {
      episodeId: episode.id,
      segmentCount: segments.length,
      totalDuration,
      totalSize: Math.round(totalSize / 1024),
      completedAt: new Date().toISOString()
    }
  });
}

/**
 * 진행 상황 조회 (GET)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const language = searchParams.get('language') || 'ko';

    if (!location) {
      return NextResponse.json({
        success: false,
        error: 'location 파라미터가 필요합니다.'
      }, { status: 400 });
    }

    const slugResult = await LocationSlugService.getOrCreateLocationSlug(location, language);
    const { data: episodes } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('location_slug', slugResult.slug)
      .eq('language', language)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!episodes || episodes.length === 0) {
      return NextResponse.json({
        success: true,
        data: { hasEpisode: false, message: '진행 중인 팟캐스트가 없습니다.' }
      });
    }

    const episode = episodes[0];
    
    // 세그먼트 조회
    const { data: segments } = await supabase
      .from('podcast_segments')
      .select('*')
      .eq('episode_id', episode.id)
      .order('sequence_number', { ascending: true });

    // 챕터별 그룹화
    const chapterGroups = segments?.reduce((groups: any, segment: any) => {
      const chapterKey = Math.floor(segment.sequence_number / 100);
      if (!groups[chapterKey]) {
        groups[chapterKey] = [];
      }
      groups[chapterKey].push(segment);
      return groups;
    }, {}) || {};

    const chapters = Object.entries(chapterGroups).map(([chapterIdx, chapterSegments]: [string, any]) => ({
      chapterIndex: parseInt(chapterIdx),
      segmentCount: chapterSegments.length,
      totalDuration: chapterSegments.reduce((sum: number, seg: any) => sum + (seg.duration_seconds || 0), 0),
      files: chapterSegments.map((seg: any) => ({
        sequenceNumber: seg.sequence_number,
        speakerType: seg.speaker_type,
        duration: seg.duration_seconds,
        audioUrl: seg.audio_url
      }))
    }));

    return NextResponse.json({
      success: true,
      data: {
        hasEpisode: true,
        episodeId: episode.id,
        status: episode.status,
        totalSegments: segments?.length || 0,
        totalDuration: episode.total_duration || 0,
        chapters,
        createdAt: episode.created_at
      }
    });

  } catch (error) {
    console.error('❌ 진행 상황 조회 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
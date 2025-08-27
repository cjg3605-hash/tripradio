import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import SequentialDialogueProcessor, { DialogueSegment } from '@/lib/ai/tts/sequential-dialogue-processor';
import SequentialTTSGenerator from '@/lib/ai/tts/sequential-tts-generator';
import { ChapterGenerator } from '@/lib/ai/chapter-generator';
import { LocationAnalyzer, LocationContext, EXPERT_PERSONAS } from '@/lib/ai/location-analyzer';
import LocationSlugService from '@/lib/location/location-slug-service';

// 순차 재생용 팟캐스트 생성

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 챕터별 NotebookLM 스타일 스크립트 생성 함수 (다국어 지원)
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
  const personaInfo = personaDetails.map(p => 
    `### ${p.name}\n${p.description}\n전문분야: ${p.expertise.join(', ')}`
  ).join('\n\n');

  // 언어별 프롬프트 생성
  let prompt: string;
  
  if (language === 'en' || language === 'en-US') {
    // 영어 프롬프트
    prompt = `
## Core Mission
Perfectly replicate the **actual conversation patterns** of Google NotebookLM Audio Overview to create 
a natural and engaging ${locationName} - ${chapter.title} episode.

## Chapter Information
- **Title**: ${chapter.title}
- **Description**: ${chapter.description}  
- **Target Duration**: ${chapter.targetDuration} seconds (about ${Math.round(chapter.targetDuration/60)} minutes)
- **Expected Segments**: ${chapter.estimatedSegments} segments
- **Main Content**: ${chapter.contentFocus.join(', ')}

## Activated Expert Personas
${personaInfo}

## Location Analysis Results
- **Location Type**: ${locationAnalysis.locationType}
- **Cultural Significance**: ${locationAnalysis.culturalSignificance}
- **Complexity Score**: ${locationAnalysis.complexityScore}/10

## NotebookLM Core Characteristics (Research-based)

### 1. Natural Conversation Flow
- **Mutual completion**: When one person starts, the other naturally completes
- **Predictable interruptions**: "Oh, that..." / "Right, and..." 
- **Information layering**: Basic info → interesting details → amazing facts in order

### 2. High Information Density and Specificity
- **2-3 concrete facts per turn** mandatory
- **Number contextualization**: "420,000 pieces... if you saw one daily, it'd take 1,150 years"
- **Comparisons and connections**: "Size of 18 football fields" / "Half of Central Park"

### 3. Natural Surprise and Discovery
- **Gradual amazement**: "But did you know? What's even more amazing is..."
- **Shared discovery**: "I had no idea until I learned this..."
- **Continuous curiosity**: "So what happens next..."

### 4. Listener-Centered Awareness
- **Meta awareness**: "Our listeners are probably wondering..."
- **Participation invitation**: "Imagine if you were there..."
- **Clear guidance**: "To summarize..." / "Simply put..."

## Required Output Format
**Host:** (dialogue)
**Curator:** (dialogue)

## Absolute Prohibitions
- No markdown formatting (**, ##, * etc.) allowed
- No emoji usage
- No abstract flowery language ("beautiful", "amazing" etc.)
- No speculative expressions ("probably", "seems like")

**Create a NotebookLM-style ${chapter.title} episode right now in **Host:** and **Curator:** format!**
`;
  } else {
    // 한국어 프롬프트 (기본)
    prompt = `
## 핵심 미션
Google NotebookLM Audio Overview의 **실제 대화 패턴**을 완벽 재현하여 
자연스럽고 매력적인 ${locationName} - ${chapter.title} 에피소드를 제작하세요.

## 챕터 정보
- **제목**: ${chapter.title}
- **설명**: ${chapter.description}  
- **목표 시간**: ${chapter.targetDuration}초 (약 ${Math.round(chapter.targetDuration/60)}분)
- **예상 세그먼트**: ${chapter.estimatedSegments}개
- **주요 내용**: ${chapter.contentFocus.join(', ')}

## 활성화된 전문가 페르소나
${personaInfo}

## 위치 분석 결과
- **장소 유형**: ${locationAnalysis.locationType}
- **문화적 중요성**: ${locationAnalysis.culturalSignificance}
- **복잡성 점수**: ${locationAnalysis.complexityScore}/10

## NotebookLM 핵심 특성 (연구 결과 기반)

### 1. 대화의 자연스러운 흐름
- **상호 완성**: 한 사람이 말을 시작하면 다른 사람이 자연스럽게 완성
- **예상 가능한 인터럽션**: "아, 그거..." / "맞아요, 그리고..." 
- **정보 계층화**: 기본 정보 → 흥미로운 디테일 → 놀라운 사실 순서

### 2. 높은 정보 밀도와 구체성
- **한 턴당 2-3개 구체적 사실** 필수 포함
- **숫자의 체감화**: "42만 점이면... 하루에 하나씩 봐도 1,150년"
- **비교와 연결**: "축구장 18개 크기" / "여의도 공원 절반"

### 3. 자연스러운 놀라움과 발견
- **단계적 놀라움**: "근데 이거 알아요? 더 놀라운 건..."
- **공유된 발견**: "저도 이번에 처음 알았는데..."
- **지속적인 호기심**: "그럼 그 다음엔 뭐가..."

### 4. 청취자 중심 의식
- **메타 인식**: "지금 청취자분들이 궁금해하실 텐데..."
- **참여 유도**: "여러분도 상상해보세요..."
- **명확한 안내**: "정리하면..." / "쉽게 말하면..."

## 필수 출력 포맷
**male:** (대사)
**female:** (대사)

## 절대 금지사항
- 마크다운 형식 (**, ##, * 등) 절대 사용 금지
- 이모지 사용 금지
- 추상적 미사여구 ("아름다운", "놀라운" 등) 금지
- 추측성 표현 ("아마도", "~것 같다") 금지

**지금 바로 NotebookLM 스타일 ${chapter.title} 에피소드를 **male:**와 **female:** 형식으로 제작하세요!**
`;
  }

  const result = await model.generateContent(prompt);
  const scriptText = result.response.text();

  // 언어에 따른 스크립트 파싱
  const segments = parseScriptToSegments(scriptText, language);
  
  return {
    chapterIndex: chapter.chapterIndex,
    title: chapter.title,
    segments: segments,
    transition: chapter.transitionToNext
  };
}

/**
 * 생성된 스크립트를 세그먼트로 파싱하는 함수 (다국어 지원)
 */
function parseScriptToSegments(scriptText: string, language: string = 'ko') {
  const segments: Array<{
    speaker: string;
    text: string;
    estimatedSeconds: number;
  }> = [];
  const lines = scriptText.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    let maleMatch, femaleMatch;
    
    if (language === 'en' || language === 'en-US') {
      // 영어: Host/Curator 패턴 매칭
      maleMatch = line.match(/\*\*(?:Host|Male):\*\*\s*(.+)/i);
      femaleMatch = line.match(/\*\*(?:Curator|Female):\*\*\s*(.+)/i);
    } else {
      // 한국어: male/female 또는 진행자/큐레이터 패턴 매칭
      maleMatch = line.match(/\*\*(?:male|진행자):\*\*\s*(.+)/i);
      femaleMatch = line.match(/\*\*(?:female|큐레이터):\*\*\s*(.+)/i);
    }
    
    if (maleMatch) {
      segments.push({
        speaker: 'male',
        text: maleMatch[1].trim(),
        estimatedSeconds: Math.min(Math.max(Math.ceil(maleMatch[1].length / 8), 15), 45)
      });
    } else if (femaleMatch) {
      segments.push({
        speaker: 'female', 
        text: femaleMatch[1].trim(),
        estimatedSeconds: Math.min(Math.max(Math.ceil(femaleMatch[1].length / 8), 15), 45)
      });
    }
  }
  
  return segments;
}

export async function POST(req: NextRequest) {
  try {
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

    // 🎤 Step 4: 챕터별 NotebookLM 스타일 스크립트 생성
    console.log('🎤 4단계: 챕터별 스크립트 생성 시작');
    const geminiClient = getGeminiClient();
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const allChapters = [
      finalPodcastStructure.intro,
      ...finalPodcastStructure.chapters,
      ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
    ];

    const chapterScripts: any[] = [];
    
    for (const chapter of allChapters) {
      console.log(`📝 챕터 ${chapter.chapterIndex} 스크립트 생성: ${chapter.title}`);
      
      const chapterScript = await generateChapterScript(
        model,
        chapter,
        locationName,
        locationContext,
        personaDetails,
        finalPodcastStructure.locationAnalysis,
        language
      );
      
      chapterScripts.push({
        ...chapter,
        script: chapterScript
      });
    }
    
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

    // 3. 순차 TTS 생성 
    console.log('🎵 순차 다중 화자 TTS 생성 시작...');
    
    try {
      // 언어 코드 정규화 (TTS 시스템 호환성)
      const normalizedLanguage = language === 'en' ? 'en-US' : language === 'ko' ? 'ko-KR' : language;
      
      const ttsResult = await SequentialTTSGenerator.generateSequentialTTS(
        processedDialogue.segments,
        locationName,
        episodeId,
        normalizedLanguage
      );
      
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
    
    // 4. 세그먼트 DB 저장
    console.log('💾 세그먼트 정보 DB 저장...');
    const segmentInserts = ttsResult.segmentFiles.map((file, index) => ({
      episode_id: episodeId,
      sequence_number: index + 1,
      speaker_type: file.speakerType,
      text_content: file.textContent,
      file_path: file.filePath,
      file_size: file.fileSize,
      duration_seconds: Math.round(file.duration),
      chapter_index: file.metadata?.chapterIndex || 0,
      chapter_title: file.metadata?.chapterTitle || 'Unknown'
    }));

    const { error: segmentError } = await supabase
      .from('podcast_segments')
      .insert(segmentInserts);

    if (segmentError) {
      console.warn('⚠️ 세그먼트 저장 경고 (메인 기능은 정상):', segmentError);
    } else {
      console.log(`✅ ${segmentInserts.length}개 세그먼트 정보 저장 완료`);
    }

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

    console.log('🎉 NotebookLM 스타일 팟캐스트 생성 완료!');

    // 6. 성공 응답 반환
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

    // 새로운 챕터 기반 구조 처리
    const chapters = segments?.map(segment => {
      // text_content에서 챕터 메타데이터 파싱
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
        // 호환성을 위한 segments 배열 (빈 배열)
        segments: []
      };
    }).sort((a, b) => a.chapterNumber - b.chapterNumber) || [];

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
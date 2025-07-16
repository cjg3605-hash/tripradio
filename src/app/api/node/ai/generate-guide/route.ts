import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { createStructurePrompt, createChapterPrompt, getRecommendedSpotCount } from '@/lib/ai/prompts/korean';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

function normalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s가-힣]/g, '');
}

function getGeminiClient(): GoogleGenerativeAI | Response {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server configuration error: Missing API key',
      }),
      { status: 500 }
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

// JSON 파싱 유틸리티
import { validateJsonResponse, createErrorResponse, createSuccessResponse } from '@/lib/utils';

function normalizeGuideData(raw: any, language?: string) {
  console.log('🔍 원본 데이터 구조 확인:', {
    hasContent: !!raw.content,
    contentType: typeof raw.content,
    keys: raw.content ? Object.keys(raw.content) : [],
  });

  // raw가 직접 가이드 데이터인 경우
  if (raw.overview || raw.route || raw.realTimeGuide) {
    console.log('📋 직접 가이드 데이터 형식 감지');
    return {
      overview: raw.overview || '개요 정보가 없습니다.',
      route: raw.route || { steps: [], tips: [], duration: '정보 없음' },
      realTimeGuide: raw.realTimeGuide || { chapters: [] }
    };
  }

  // raw.content가 있는 경우
  if (!raw.content || typeof raw.content !== 'object') {
    console.log('⚠️ content 필드가 없거나 올바르지 않음, 기본값 반환');
    return {
      overview: '개요 정보가 없습니다.',
      route: { steps: [], tips: [], duration: '정보 없음' },
      realTimeGuide: { chapters: [] }
    };
  }

  const { overview, route, realTimeGuide } = raw.content;
  console.log('✅ content에서 데이터 추출:', {
    hasOverview: !!overview,
    hasRoute: !!route,
    hasRealTimeGuide: !!realTimeGuide
  });

  return {
    overview: overview || '개요 정보가 없습니다.',
    route: route || { steps: [], tips: [], duration: '정보 없음' },
    realTimeGuide: realTimeGuide || { chapters: [] }
  };
}

export async function POST(req: NextRequest) {
  console.log('📍 /api/node/ai/generate-guide POST 호출됨');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  let requestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: '잘못된 JSON 형식입니다.' }),
      { status: 400, headers }
    );
  }

  const { 
    locationName, 
    language = 'ko', 
    userProfile = {}, 
    forceRegenerate = false,
    generationMode = 'auto', // 'auto' | 'structure' | 'chapter'
    existingGuide = null,
    targetChapter = null,
    maxChapters
  } = requestBody;
  
  // 위치 유형별 권장 스팟 수 동적 계산
  const spotCount = getRecommendedSpotCount(locationName);
  const finalMaxChapters = maxChapters || spotCount.default;
  console.log('📝 요청 파라미터:', { 
    locationName, 
    language, 
    forceRegenerate, 
    generationMode, 
    targetChapter,
    spotCountInfo: spotCount,
    finalMaxChapters 
  });
  
  if (!locationName || typeof locationName !== 'string') {
    console.error('❌ 위치 정보 누락:', locationName);
    return new Response(
      JSON.stringify({ success: false, error: '유효한 위치 정보가 필요합니다.' }),
      { status: 400, headers }
    );
  }

  const normLocation = normalize(locationName);
  const normLang = normalize(language);
  console.log('🔄 정규화된 파라미터:', { 
    original: { locationName, language }, 
    normalized: { normLocation, normLang },
    lengths: { normLocation: normLocation.length, normLang: normLang.length }
  });

  // 1. 캐시 확인 (강제 재생성이 아닌 경우에만)
  if (!forceRegenerate) {
    console.log('🔍 캐시 확인 중...');
    
    const { data: cached } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', normLang)
      .maybeSingle();

    if (cached) {
      // 챕터 생성 모드에서 해당 챕터에 이미 내용이 있는지 확인
      if (generationMode === 'chapter' && targetChapter !== null) {
        const existingChapter = cached.content?.realTimeGuide?.chapters?.[targetChapter];
        console.log('📖 기존 챕터 확인:', {
          targetChapter,
          hasChapter: !!existingChapter,
          hasDetailedContent: !!(existingChapter?.sceneDescription || existingChapter?.coreNarrative || existingChapter?.humanStories),
          chapterKeys: existingChapter ? Object.keys(existingChapter) : []
        });
        
        // 챕터에 이미 상세 내용이 있으면 생성하지 않고 반환
        if (existingChapter && (existingChapter.sceneDescription || existingChapter.coreNarrative || existingChapter.humanStories)) {
          console.log('✅ 챕터 내용이 이미 존재 - 기존 데이터 반환');
          return NextResponse.json({
            success: true,
            data: { content: cached.content },
            cached: 'hit',
            language,
            message: '챕터 내용이 이미 존재합니다.'
          });
        }
      } else if (generationMode !== 'chapter') {
        // 일반 모드에서는 기존 로직 유지
        console.log('✅ 캐시된 데이터 반환');
        return NextResponse.json({
          success: true,
          data: { content: cached.content },
          cached: 'hit',
          language
        });
      }
    }
  }

  // 2. AI로 새 가이드 생성
  console.log('🤖 AI 가이드 생성 시작 - 모드:', generationMode);
  const genAI = getGeminiClient();
  if (genAI instanceof Response) return genAI;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
  });
  
  let responseText: string;
  let prompt: string;

  // 생성 모드에 따른 프롬프트 선택
  if (generationMode === 'structure') {
    // 구조만 생성
    console.log('🏗️ 구조 생성 모드');
    prompt = createStructurePrompt(locationName, language, userProfile);
  } else if (generationMode === 'chapter' && existingGuide && targetChapter !== null) {
    // 특정 챕터 생성
    console.log('📖 챕터 생성 모드 상세:', {
      targetChapter,
      hasExistingGuide: !!existingGuide,
      hasRealTimeGuide: !!existingGuide.realTimeGuide,
      hasChapters: !!existingGuide.realTimeGuide?.chapters,
      chaptersLength: existingGuide.realTimeGuide?.chapters?.length || 0,
      targetChapterExists: !!existingGuide.realTimeGuide?.chapters?.[targetChapter],
      allChapterTitles: existingGuide.realTimeGuide?.chapters?.map((ch: any) => ch.title) || []
    });
    const chapterTitle = existingGuide.realTimeGuide?.chapters?.[targetChapter]?.title || `챕터 ${targetChapter + 1}`;
    console.log('📖 챕터 제목 확정:', chapterTitle);
    prompt = createChapterPrompt(locationName, targetChapter, chapterTitle, existingGuide, language, userProfile);
  } else {
    // 기존 방식 (자동 완성 시도)
    console.log('🔄 자동 완성 모드');
    prompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
  }
  
  try {
    console.log('🚀 AI 요청 시작:', { 
      mode: generationMode, 
      targetChapter, 
      promptLength: prompt.length
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    responseText = await response.text();
    console.log('🤖 AI 응답 수신:', {
      mode: generationMode,
      responseLength: responseText.length
    });
    
    if (!responseText || responseText.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI로부터 빈 응답을 받았습니다.' }),
        { status: 500, headers }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: `AI 응답 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }),
      { status: 500, headers }
    );
  }

  // JSON 파싱
  const parsed = validateJsonResponse(responseText);
  if (!parsed.success) {
    console.error('❌ JSON 파싱 실패:', {
      error: parsed.error,
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 1000) + '...',
    });
    return new Response(
      JSON.stringify(createErrorResponse(parsed.error, 'JSON_PARSE_ERROR')),
      { status: 500, headers }
    );
  }

  console.log('✅ JSON 파싱 성공:', {
    dataKeys: Object.keys(parsed.data),
    hasContent: !!parsed.data.content,
  });

  let finalData;

  // 생성 모드에 따른 데이터 처리
  if (generationMode === 'chapter' && existingGuide && targetChapter !== null) {
    // 챕터 생성 모드: 기존 가이드에 새 챕터 추가
    console.log('📖 챕터 통합 시작:', {
      parsedDataKeys: Object.keys(parsed.data),
      hasChapter: !!parsed.data.chapter,
      chapterStructure: parsed.data.chapter ? Object.keys(parsed.data.chapter) : []
    });
    const newChapter = parsed.data.chapter;
    
    if (!newChapter) {
      console.error('❌ 챕터 데이터 없음');
      return new Response(
        JSON.stringify({ success: false, error: '챕터 데이터가 생성되지 않았습니다.' }),
        { status: 500, headers }
      );
    }

    // 기존 가이드 복사하고 새 챕터 추가
    finalData = { ...existingGuide };
    if (!finalData.realTimeGuide) {
      finalData.realTimeGuide = { chapters: [] };
    }
    
    // 새 챕터를 해당 인덱스에 직접 할당 (제목 + 상세 내용 모두 포함)
    finalData.realTimeGuide.chapters[targetChapter] = {
      ...finalData.realTimeGuide.chapters[targetChapter], // 기존 id, title 유지
      ...newChapter // 새로운 sceneDescription, coreNarrative, humanStories, nextDirection 추가
    };
    
    console.log('📖 챕터 통합 완료:', {
      chapterIndex: targetChapter,
      totalChapters: finalData.realTimeGuide.chapters.length,
      updatedChapterKeys: Object.keys(finalData.realTimeGuide.chapters[targetChapter] || {})
    });
  } else {
    // 구조 생성 또는 전체 생성 모드
    finalData = normalizeGuideData(parsed.data, language);
  }

  // 3. 기존 content JSONB에 저장 (단순한 방식 유지)
  try {
    if (generationMode === 'chapter') {
      // 챕터 생성 모드: 기존 데이터 업데이트
      console.log('💾 챕터 생성 모드 - 기존 가이드 업데이트');
      
      const { error: updateError } = await supabase
        .from('guides')
        .update({
          content: finalData,
          updated_at: new Date().toISOString()
        })
        .eq('locationname', normLocation)
        .eq('language', normLang);

      if (updateError) {
        console.error('❌ 가이드 업데이트 실패:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: '가이드 업데이트 중 오류가 발생했습니다.' }),
          { status: 500, headers }
        );
      }

      console.log('✅ 챕터 업데이트 완료');
    } else {
      // 구조 생성 또는 전체 생성 모드: upsert로 저장
      console.log('💾 새 가이드 저장/업데이트');
      
      const { error: upsertError } = await supabase
        .from('guides')
        .upsert({
          locationname: normLocation,
          language: normLang,
          content: finalData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'locationname,language'
        });

      if (upsertError) {
        console.error('❌ 가이드 저장 실패:', upsertError);
        return new Response(
          JSON.stringify({ success: false, error: '가이드 저장 중 오류가 발생했습니다.' }),
          { status: 500, headers }
        );
      }

      console.log('✅ 새 가이드 저장 완료');
    }

    return NextResponse.json({
      success: true,
      data: { content: finalData },
      cached: generationMode === 'chapter' ? 'updated' : 'new',
      language,
      generationMode,
      targetChapter: generationMode === 'chapter' ? targetChapter : undefined
    });

  } catch (dbError) {
    console.error('❌ 데이터베이스 연결 오류:', dbError);
    return new Response(
      JSON.stringify({ success: false, error: '데이터베이스 연결 오류가 발생했습니다.' }),
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

// 간단한 정규화 함수
function normalize(str: string): string {
  return str.trim().toLowerCase();
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

// parseJsonResponse는 utils.ts의 validateJsonResponse로 대체됨
import { validateJsonResponse, createErrorResponse, createSuccessResponse } from '@/lib/utils';

function normalizeGuideData(raw: any, language?: string) {
  console.log('🔍 원본 데이터 구조 확인:', {
    hasContent: !!raw.content,
    contentType: typeof raw.content,
    keys: raw.content ? Object.keys(raw.content) : [],
    raw: JSON.stringify(raw, null, 2).substring(0, 500) + '...'
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

  const { locationName, language = 'ko', userProfile, forceRegenerate = false } = requestBody;
  console.log('📝 요청 파라미터:', { locationName, language, forceRegenerate });
  
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
      console.log('✅ 캐시된 데이터 반환');
      return NextResponse.json({
        success: true,
        data: { content: cached.content },
        cached: 'hit',
        language
      });
    }
  }

    // 2. AI로 새 가이드 생성
  console.log('🤖 AI 가이드 생성 시작');
  const genAI = getGeminiClient();
  if (genAI instanceof Response) return genAI;
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: { temperature: 0.3, maxOutputTokens: 16384 }
  });

  const autonomousPrompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
  
  let responseText: string;
  try {
    const result = await model.generateContent(autonomousPrompt);
    const response = await result.response;
    responseText = await response.text();
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

  const parsed = validateJsonResponse(responseText);
  if (!parsed.success) {
    console.error('❌ JSON 파싱 실패:', {
      error: parsed.error,
      responseLength: responseText.length,
      responsePreview: responseText.substring(0, 1000) + '...'
    });
    return new Response(
      JSON.stringify(createErrorResponse(parsed.error, 'JSON_PARSE_ERROR')),
      { status: 500, headers }
    );
  }

  console.log('✅ JSON 파싱 성공:', {
    dataKeys: Object.keys(parsed.data),
    hasContent: !!parsed.data.content,
    dataStructure: JSON.stringify(parsed.data, null, 2).substring(0, 500) + '...'
  });

  const normalizedData = normalizeGuideData(parsed.data, language);
  console.log('📊 정규화된 데이터:', {
    hasOverview: !!normalizedData.overview,
    hasRoute: !!normalizedData.route,
    hasRealTimeGuide: !!normalizedData.realTimeGuide,
    routeSteps: normalizedData.route?.steps?.length || 0,
    chapters: normalizedData.realTimeGuide?.chapters?.length || 0
  });

  // 3. 간단한 INSERT 시도 (중복이면 기존 데이터 반환)
  console.log('💾 새 가이드 저장 시도');
  const { error: insertError } = await supabase
    .from('guides')
    .insert([{
      locationname: normLocation,
      language: normLang,
      content: normalizedData,
      created_at: new Date().toISOString()
    }]);

  // 중복 키 에러 시 기존 데이터 조회하여 반환
  if (insertError && insertError.code === '23505') {
    console.log('🔍 중복 키 감지 - 기존 데이터 조회');
    const { data: existing, error: fetchError } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', normLang)
      .maybeSingle();

    if (fetchError || !existing) {
      return new Response(
        JSON.stringify({ success: false, error: `기존 가이드 조회 실패: ${fetchError?.message || '데이터를 찾을 수 없습니다'}`, language }),
        { status: 500, headers }
      );
    }

    console.log('✅ 기존 데이터 반환');
    return NextResponse.json({
      success: true,
      data: { content: existing.content },
      cached: 'existing',
      language
    });
  }

  // 다른 insert 에러 처리
  if (insertError) {
    return new Response(
      JSON.stringify({ success: false, error: `가이드 저장 실패: ${insertError.message}`, language }),
      { status: 500, headers }
    );
  }

  // 정상 저장 완료
  console.log('✅ 새 가이드 저장 완료');
  return NextResponse.json({
    success: true,
    data: { content: normalizedData },
    cached: 'miss',
    language
  });
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
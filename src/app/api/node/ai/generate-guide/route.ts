import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createAutonomousGuidePrompt, REALTIME_GUIDE_KEYS } from '@/lib/ai/prompts/index';
import authOptions from '@/lib/auth';
import { getOrCreateTTSAndUrl } from '@/lib/tts-gcs';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

// 정규화 함수 추가
function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Gemini AI 클라이언트를 요청 시점에 초기화
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Gemini AI 응답에서 JSON을 추출하고 파싱하는 함수
 */
function parseJsonResponse(jsonString: string) {
  if (!jsonString || jsonString === 'undefined' || jsonString.trim() === '' || jsonString === undefined || jsonString === null) {
    throw new Error('AI 응답이 비어있거나 undefined/null입니다.');
  }
  // 코드블록 제거 (있을 경우만)
  const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let cleanedString = codeBlockMatch ? codeBlockMatch[1] : jsonString;
  // JSON 시작/끝만 남기기
  const jsonStart = cleanedString.indexOf('{');
  const jsonEnd = cleanedString.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('응답에서 JSON 시작(`{`) 또는 끝(`}`)을 찾을 수 없습니다.');
  }
  cleanedString = cleanedString.substring(jsonStart, jsonEnd + 1);
  // 앞뒤 공백/BOM 제거 후 바로 파싱
  cleanedString = cleanedString.replace(/^[\uFEFF\s]+/, '');

  // AI 응답에 포함될 수 있는 주석 제거 (e.g., // ...)
  cleanedString = cleanedString.replace(/\/\/.*$/gm, '');

  return JSON.parse(cleanedString);
}

// GuideData 구조 normalize 함수 - 포괄적 필드명 매핑
function normalizeGuideData(raw: any, language?: string) {
  // 프롬프트 예시와 100% 동일한 구조만 허용
  if (!raw.content || typeof raw.content !== 'object') {
    return {
      overview: '개요 정보가 없습니다.',
      route: { steps: [], tips: [], duration: '정보 없음' },
      realTimeGuide: { chapters: [] }
    };
  }
  const { overview, route, realTimeGuide } = raw.content;
  return {
    overview: overview || '개요 정보가 없습니다.',
    route: route || { steps: [], tips: [], duration: '정보 없음' },
    realTimeGuide: realTimeGuide || { chapters: [] }
  };
}

export async function POST(req: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    console.log('🌟 AI 가이드 생성 API 호출됨');
    
    const genAI = getGeminiClient();
    let requestBody;
    
    try {
      requestBody = await req.json();
      console.log('📝 요청 데이터:', requestBody);
    } catch (error) {
      console.error('❌ JSON 파싱 실패:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '잘못된 JSON 형식입니다.' 
        }), 
        { 
          status: 400, 
          headers 
        }
      );
    }

    const { locationName, language = 'ko', userProfile, forceRegenerate = false } = requestBody;
    
    if (!locationName || typeof locationName !== 'string') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '유효한 위치 정보가 필요합니다.' 
        }), 
        { 
          status: 400, 
          headers 
        }
      );
    }
    
    // === 정규화 적용 ===
    const normLocation = normalizeString(locationName);
    const normLang = normalizeString(language);
    
    // === guides 테이블에서 locationname+language로 캐시(중복) 조회 ===
    const { data: cached, error: cacheError } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', normLang)
      .maybeSingle();

    if (cached && cached.content && !forceRegenerate) {
      // 이미 있으면 바로 반환 (AI 토큰 소모 X)
      return NextResponse.json({
        success: true,
        data: { content: cached.content },
        cached: 'file',
        language
      });
    }

    // forceRegenerate가 true면 기존 캐시 삭제
    if (forceRegenerate) {
      console.log('🔄 강제 재생성 모드 - 기존 캐시 삭제');
      await supabase
        .from('guides')
        .delete()
        .filter('locationname', 'eq', normLocation)
        .filter('language', 'eq', normLang);
    }

    // === (없으면) AI로 생성 후 insert ===
    console.log('❌ 캐시 miss - 새로운 가이드 생성 시작');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192
      }
    });
    console.log(`🚀 AI 가이드 생성 시작 - ${locationName} (${language})`);
    const autonomousPrompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
    console.log(`📝 프롬프트 전송 완료, 응답 대기 중...`);
    let responseText: string;
    try {
      console.log('🤖 Gemini API 호출 시작');
      const result = await model.generateContent(autonomousPrompt);
      const response = await result.response;
      responseText = await response.text();
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('AI로부터 빈 응답을 받았습니다.');
      }
    } catch (error) {
      throw new Error(`AI 응답 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
    let parsedData;
    try {
      parsedData = parseJsonResponse(responseText);
    } catch (parseError) {
      throw new Error(`AI 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 파싱 오류'}`);
    }
    const normalizedData = normalizeGuideData(parsedData, language);
    // === Supabase에 저장 (ON CONFLICT DO NOTHING) ===
    await supabase
      .from('guides')
      .insert([
        {
          locationname: normLocation,
          language: normLang,
          content: normalizedData,
          created_at: new Date().toISOString()
        }
      ], { onConflict: ['locationname', 'language'] });
    // 항상 select로 최종 데이터 반환
    const { data: selected, error: selectError } = await supabase
      .from('guides')
      .select('content')
      .eq('locationname', normLocation)
      .eq('language', normLang)
      .maybeSingle();

    if (!selected) {
      return NextResponse.json({
        success: false,
        error: '가이드 데이터가 존재하지 않습니다.',
        language
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { content: selected.content },
      cached: 'miss',
      language
    });

  } catch (error) {
    console.error('❌ 전체 프로세스 실패:', error);
    console.error('❌ 에러 스택:', error instanceof Error ? error.stack : error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers 
      }
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
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
  console.log('🔧 normalizeGuideData input:', JSON.stringify(raw, null, 2));
  const languageKey = language?.slice(0, 2) as keyof typeof REALTIME_GUIDE_KEYS || 'en';
  const realTimeGuideKey = REALTIME_GUIDE_KEYS[languageKey] || 'RealTimeGuide';
  console.log('🔧 realTimeGuideKey:', realTimeGuideKey);
  let realTimeGuide = raw[realTimeGuideKey] ||
    raw.realTimeGuide || raw.RealTimeGuide || raw.REALTIMEGUIDE ||
    raw.realtimeGuide || raw.realtime_guide || raw.real_time_guide ||
    raw.audioGuide || raw.AudioGuide || raw.audio_guide ||
    raw.실시간가이드 || raw.오디오가이드 || raw.chapters || 
    null;
  console.log('🔧 realTimeGuide 추출 결과:', !!realTimeGuide, realTimeGuide);
  
  // overview - 다양한 케이스 지원
  const overview = raw.overview || raw.Overview || raw.OVERVIEW || 
                   raw.소개 || raw.개요 || raw.introduction || raw.Introduction ||
                   null;
  console.log('🔧 overview 매핑 결과:', !!overview);

  // route - 다양한 케이스 지원 
  const route = raw.route || raw.Route || raw.ROUTE ||
                raw.관람동선 || raw.동선 || raw.루트 ||
                null;
  console.log('🔧 route 매핑 결과:', !!route);

  // 정규화된 구조로 반환
  const normalized = {
    overview: overview || '개요 정보가 없습니다.',
    route: route || { steps: [], tips: [], duration: '정보 없음' },
    realTimeGuide: realTimeGuide || { chapters: [] }
  };

  console.log('🔧 최종 정규화 결과:', {
    hasOverview: !!normalized.overview,
    hasRoute: !!normalized.route,
    hasRealTimeGuide: !!normalized.realTimeGuide,
    chaptersCount: normalized.realTimeGuide?.chapters?.length || 0
  });

  return normalized;
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
    
    // forceRegenerate가 true면 기존 캐시 삭제
    if (forceRegenerate) {
      console.log('🔄 강제 재생성 모드 - 기존 캐시 삭제');
      await supabase
        .from('guides')
        .delete()
        .filter('locationname', 'eq', normLocation)
        .filter('language', 'eq', normLang);
    }
    
    // === guides 테이블에서 locationname+language로 중복 체크 (정규화 값만 사용) ===
    const { data: existing } = await supabase
      .from('guides')
      .select('*')
      .filter('locationname', 'eq', normLocation)
      .filter('language', 'eq', normLang)
      .single();
      
    if (existing && existing.content && !forceRegenerate) {
      // 항상 동일한 구조(data: { content: ... })로 반환
      return NextResponse.json({
        success: true,
        data: { content: existing.content },
        cached: 'hit',
        language
      });
    }
    
    if (existing && !existing.content) {
      console.log('⚠️ 캐시에 있지만 content가 null - 기존 데이터 삭제 후 새로 생성');
      // content가 null인 기존 레코드 삭제
      await supabase.from('guides').delete().eq('id', existing.id);
    }
    
    console.log('❌ 캐시 miss - 새로운 가이드 생성 시작');
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192
      }
    });

    console.log(`🚀 AI 가이드 생성 시작 - ${locationName} (${language})`);
    
    // 🔄 비동기 프롬프트 호출로 변경
    const autonomousPrompt = await createAutonomousGuidePrompt(locationName, language, userProfile);
    
    console.log(`📝 프롬프트 전송 완료, 응답 대기 중...`);
    
    let responseText: string;
    try {
      console.log('🤖 Gemini API 호출 시작');
      const result = await model.generateContent(autonomousPrompt);
      const response = await result.response;
      responseText = await response.text();
      
      console.log(`📝 AI 응답 수신 (${responseText?.length || 0}자)`);
      console.log('🔍 응답 첫 200자:', responseText?.substring(0, 200) || 'null');
      console.log('🔍 응답 마지막 200자:', responseText?.substring(-200) || 'null');
      
      if (!responseText || responseText.trim().length === 0) {
        console.log('❌ AI 응답이 비어있음 - 전체 응답:', responseText);
        throw new Error('AI로부터 빈 응답을 받았습니다.');
      }
    } catch (error) {
      console.error('❌ AI 응답 생성 중 오류 발생:', error);
      console.error('❌ 에러 상세:', error instanceof Error ? error.stack : error);
      throw new Error(`AI 응답 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    let parsedData;
    try {
      console.log('🔍 JSON 파싱 시작');
      parsedData = parseJsonResponse(responseText);
      console.log('✅ JSON 파싱 성공');
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      console.error('❌ 원본 응답 텍스트:', responseText);
      throw new Error(`AI 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 파싱 오류'}`);
    }

    console.log('🔧 데이터 정규화 시작');
    const normalizedData = normalizeGuideData(parsedData, language);
    console.log('✅ 데이터 정규화 완료');

    // === Supabase에 저장 (중복 방지를 위해 upsert 사용) ===
    console.log('💾 DB 저장 시작');
    const { data: saveData, error: saveError } = await supabase
      .from('guides')
      .upsert([
        {
          locationname: normLocation,
          language: normLang,
          original_location: locationName,
          original_language: language,
          content: normalizedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], {
        onConflict: 'locationname,language',
        ignoreDuplicates: false
      })
      .select();

    if (saveError) {
      console.error('❌ DB 저장 실패:', saveError);
      // DB 저장 실패해도 응답은 반환
    } else {
      console.log('✅ DB 저장 성공:', saveData);
    }

    // === 최종 응답 ===
    const finalResponse = {
      success: true,
      data: { content: normalizedData },
      cached: 'miss',
      language,
      metadata: {
        originalLocationName: locationName,
        normalizedLocationName: normLocation,
        responseLength: responseText.length,
        generatedAt: new Date().toISOString(),
        hasRealTimeGuide: !!(normalizedData.realTimeGuide?.chapters?.length),
        chaptersCount: normalizedData.realTimeGuide?.chapters?.length || 0
      }
    };

    console.log('🎉 AI 가이드 생성 완료!', {
      location: locationName,
      language,
      hasContent: !!normalizedData,
      chaptersCount: normalizedData.realTimeGuide?.chapters?.length || 0
    });

    return NextResponse.json(finalResponse);

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
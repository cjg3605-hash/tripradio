import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createAutonomousGuidePrompt, REALTIME_GUIDE_KEYS } from '@/lib/ai/prompts';
import authOptions from '@/lib/auth';
import { getOrCreateTTSAndUrl } from '@/lib/tts-gcs';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

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
    console.log(`🔍 원본 응답 길이: ${jsonString.length}자`);
    console.log(`🔍 원본 시작 100자: ${JSON.stringify(jsonString.substring(0, 100))}`);

    // 1. 코드 블록에서 JSON 추출 시도
    const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let cleanedString = codeBlockMatch ? codeBlockMatch[1] : jsonString;

    // 1-1. 코드블록이 아니고, JSON 앞뒤에 불필요한 텍스트가 있을 수 있으므로, JSON 시작/끝만 남기기
    const jsonStart = cleanedString.indexOf('{');
    const jsonEnd = cleanedString.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('응답에서 JSON 시작(`{`) 또는 끝(`}`)을 찾을 수 없습니다.');
    }
    cleanedString = cleanedString.substring(jsonStart, jsonEnd + 1);

    // 2. 자동 보정: 문자열 내 줄바꿈, 잘못된 따옴표, 누락된 콤마 등
    let fixedString = cleanedString
        // 줄바꿈 문자가 문자열 내에 있을 경우 이스케이프
        .replace(/([^\\])\n/g, '$1\\n')
        // 문자열 내 큰따옴표 미이스케이프 보정
        .replace(/: ([^\"]*?)([\},])/g, (m, p1, p2) => {
            // 콜론 뒤에 따옴표 없이 문자열이 올 경우 따옴표로 감싸기
            if (!p1.startsWith('"') && !p1.endsWith('"')) {
                return ': "' + p1.trim() + '"' + p2;
            }
            return m;
        })
        // 배열/객체 내 누락된 콤마 보정(간단, 완벽하지 않음)
        .replace(/([\}\]"])(\s*[\{\["])/g, '$1,$2');

    // 3. 중괄호 밸런스를 맞추며 JSON 추출
    let balance = 0;
    let inString = false;
    let escapeNext = false;
    let result = '';
    for (let i = 0; i < fixedString.length; i++) {
        const char = fixedString[i];
        if (escapeNext) {
            result += char;
            escapeNext = false;
            continue;
        }
        if (char === '"') {
            inString = !inString;
        } else if (char === '\\' && inString) {
            escapeNext = true;
        }
        if (!inString) {
            if (char === '{') balance++;
            if (char === '}') balance--;
        }
        result += char;
        if (balance === 0 && result.startsWith('{')) {
            break;
        }
    }
    // 4. JSON 파싱 시도
    try {
        console.log(`🔍 보정 후 JSON 길이: ${result.length}자`);
        const parsed = JSON.parse(result);
        console.log('✅ JSON 파싱 성공!');
        return parsed;
    } catch (error) {
        // 어디서 오류가 났는지 위치까지 출력
        let errorPosition = 0;
        if (error instanceof SyntaxError && /position (\d+)/.test(error.message)) {
            errorPosition = Number(error.message.match(/position (\d+)/)?.[1]);
        }
        console.error('🚨 JSON 파싱 실패:', error);
        console.error('💣 실패한 JSON 문자열 (첫 300자):', result.substring(0, 300));
        if (errorPosition > 0) {
            console.error('💣 오류 발생 위치 전후(±30자):', result.substring(Math.max(0, errorPosition-30), errorPosition+30));
        }
        throw new Error(`JSON 파싱에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
}


// GuideData 구조 normalize 함수 - 포괄적 필드명 매핑
function normalizeGuideData(raw: any, language?: string) {
  console.log('�� normalizeGuideData input:', JSON.stringify(raw, null, 2));
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
                raw.경로 || raw.동선 || raw.navigation || raw.Navigation ||
                { steps: raw.steps || raw.Steps || [] };
  console.log('🔧 route 매핑 결과:', !!route);
  
  // chapters가 최상위에 있는 경우 realTimeGuide로 감싸기
  if (!realTimeGuide && Array.isArray(raw.chapters)) {
    realTimeGuide = { chapters: raw.chapters };
    console.log('🔧 chapters를 realTimeGuide로 감쌈');
  }
  
  // chapters 보정
  if (realTimeGuide && !realTimeGuide.chapters && Array.isArray(raw.chapters)) {
    realTimeGuide.chapters = raw.chapters;
    console.log('🔧 realTimeGuide에 chapters 추가');
  }
  
  const result = {
    overview,
    route,
    realTimeGuide
  };
  
  console.log('🔧 normalizeGuideData result:', JSON.stringify(result, null, 2));
  return result;
}

function normalizeString(s: string) {
  return decodeURIComponent(s || '').trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  // Set default response headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  try {
    // 환경변수 확인
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 GEMINI_API_KEY 설정 여부:', !!geminiApiKey);
    
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY가 설정되지 않음');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'AI API 키가 설정되지 않았습니다.' 
        }), 
        { 
          status: 500, 
          headers 
        }
      );
    }
    
    const genAI = getGeminiClient();
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.log('⚠️ 세션 획득 실패, 익명 사용자로 처리:', error);
    }
    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('❌ 요청 본문 파싱 실패:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '잘못된 요청 형식입니다.' 
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
    // AI 프롬프트 원래대로 복구
    const autonomousPrompt = createAutonomousGuidePrompt(locationName, language, userProfile);
    
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
      throw new Error(`AI 응답 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // 응답 파싱 (코드블록 제거 후 파싱)
    let guideData;
    try {
      guideData = parseJsonResponse(responseText);
    } catch (parseError) {
      return NextResponse.json({ success: false, error: 'AI 응답 파싱 실패: ' + (parseError instanceof Error ? parseError.message : '알 수 없는 오류') }, { status: 500 });
    }

    // === 디버깅: normalizeGuideData 호출 ===
    console.log('🔧 POST에서 normalizeGuideData 호출, language:', language);
    const normalized = normalizeGuideData(guideData.content || guideData, language);
    // 필수 필드 체크
    if (!normalized.overview || !normalized.route || !normalized.realTimeGuide) {
      console.error('❌ 필수 필드 누락:', {
        overview: !!normalized.overview,
        route: !!normalized.route,
        realTimeGuide: !!normalized.realTimeGuide
      });
      return NextResponse.json({
        success: false,
        error: '필수 필드 누락: ' + JSON.stringify({
          overview: !!normalized.overview,
          route: !!normalized.route,
          realTimeGuide: !!normalized.realTimeGuide
        }),
        data: normalized
      }, { status: 500 });
    }

    // === Supabase guides 테이블에 저장 ===
    try {
      const insertData = {
        content: guideData,
        metadata: null,
        locationname: normLocation,
        language: normLang,
        user_id: (session as any)?.user?.id || null,
        created_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('guides')
        .insert([insertData]);
      
      if (insertError) {
        console.error('❌ Supabase 저장 실패:', insertError);
        throw new Error('가이드 저장 중 오류가 발생했습니다.');
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { content: guideData }, 
          cached: 'new', 
          language 
        }),
        { 
          status: 200, 
          headers 
        }
      );
    } catch (dbError) {
      console.error('❌ 데이터베이스 오류:', dbError);
      throw new Error('데이터베이스 저장 중 오류가 발생했습니다.');
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        cached: 'error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}
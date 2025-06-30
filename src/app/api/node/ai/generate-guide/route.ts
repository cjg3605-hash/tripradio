import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createAutonomousGuidePrompt, createSimpleTestPrompt, REALTIME_GUIDE_KEYS } from '@/lib/ai/prompts';
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
    
    // 2. JSON 시작/끝 찾기
    const jsonStart = cleanedString.indexOf('{');
    if (jsonStart === -1) {
        throw new Error('응답에서 JSON 시작(`{`)을 찾을 수 없습니다.');
    }
    
    // 3. 중괄호 밸런스를 맞추며 JSON 추출
    let balance = 0;
    let inString = false;
    let escapeNext = false;
    let result = '';
    
    for (let i = jsonStart; i < cleanedString.length; i++) {
        const char = cleanedString[i];
        
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
        console.log(`🔍 추출된 JSON 길이: ${result.length}자`);
        const parsed = JSON.parse(result);
        console.log('✅ JSON 파싱 성공!');
        return parsed;
    } catch (error) {
        console.error('🚨 JSON 파싱 실패:', error);
        console.error('💣 실패한 JSON 문자열 (첫 300자):', result.substring(0, 300));
        throw new Error(`JSON 파싱에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
}

// GuideData 구조 normalize 함수 - 포괄적 필드명 매핑
function normalizeGuideData(raw: any, language?: string) {
  console.log('�� normalizeGuideData input:', JSON.stringify(raw, null, 2));
  const realTimeGuideKey = REALTIME_GUIDE_KEYS[language?.slice(0,2)] || 'RealTimeGuide';
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
  try {
    // 환경변수 확인
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 GEMINI_API_KEY 설정 여부:', !!geminiApiKey);
    console.log('🔑 GEMINI_API_KEY 길이:', geminiApiKey?.length || 0);
    
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY가 설정되지 않음');
      return NextResponse.json({ error: 'AI API 키가 설정되지 않았습니다.' }, { status: 500 });
    }
    
    const genAI = getGeminiClient();
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.log('⚠️ 세션 획득 실패, 익명 사용자로 처리:', error);
    }
    const { locationName, language = 'ko', userProfile } = await req.json();
    if (!locationName) {
      return NextResponse.json({ success: false, error: 'Location is required' }, { status: 400 });
    }
    // === 정규화 적용 ===
    const normLocation = normalizeString(locationName);
    const normLang = normalizeString(language);
    // === guides 테이블에서 locationname+language로 중복 체크 (정규화 값만 사용) ===
    const { data: existing } = await supabase
      .from('guides')
      .select('*')
      .filter('locationname', 'eq', normLocation)
      .filter('language', 'eq', normLang)
      .single();
    if (existing && existing.content) {
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
      let jsonString = responseText.trim();
      if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```json|^```/i, '').replace(/```$/, '').trim();
      }
      guideData = JSON.parse(jsonString);
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
    const insertData = {
      content: guideData, // 구조 보정 없이 원본 그대로 저장
      metadata: null,
      locationname: normLocation,
      language: normLang,
      user_id: session?.user?.id || null,
      created_at: new Date().toISOString()
    };
    await supabase.from('guides').insert([insertData]);
    return NextResponse.json({ success: true, data: { content: guideData }, cached: 'new', language });

  } catch (error) {
    console.error('❌ API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      cached: 'error' 
    }, { status: 500 });
  }
}
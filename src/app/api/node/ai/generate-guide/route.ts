import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts';
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

// GuideData 구조 normalize 함수 추가
function normalizeGuideData(raw: any) {
  // overview
  const overview = raw.overview || raw.Overview || null;
  // route
  const route = raw.route || raw.Route || { steps: raw.steps || [] };
  // realTimeGuide
  let realTimeGuide = raw.realTimeGuide || raw.RealTimeGuide || raw.realtimeGuide || null;
  // chapters 보정
  if (realTimeGuide && !realTimeGuide.chapters && Array.isArray(raw.chapters)) {
    realTimeGuide.chapters = raw.chapters;
  }
  return {
    overview,
    route,
    realTimeGuide
  };
}

export async function POST(req: NextRequest) {
  try {
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
    console.log(`🌍 가이드 생성 요청 - 장소: ${locationName}, 언어: ${language}`);
    // === Supabase guides 테이블에서 조회 ===
    const { data: cachedGuide } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', locationName)
      .eq('language', language)
      .single();
    
    console.log('🔍 Supabase 캐시 조회 결과:', cachedGuide);
    console.log('🔍 cachedGuide.content:', cachedGuide?.content);
    
    if (cachedGuide && cachedGuide.content && 
        cachedGuide.content.overview && 
        cachedGuide.content.route && 
        cachedGuide.content.realTimeGuide) {
      console.log('✅ 캐시 hit - 기존 데이터 반환');
      // 캐시 hit 시 일관된 구조로 반환 (캐시 miss와 동일한 구조)
      return NextResponse.json({ 
        success: true, 
        data: { content: cachedGuide.content }, // cachedGuide.content에 실제 가이드 데이터가 있음
        cached: 'hit',
        language: language 
      });
    }
    
    if (cachedGuide && !cachedGuide.content) {
      console.log('⚠️ 캐시에 있지만 content가 null - 기존 데이터 삭제 후 새로 생성');
      // content가 null인 기존 레코드 삭제
      await supabase.from('guides').delete().eq('id', cachedGuide.id);
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
    const autonomousPrompt = createAutonomousGuidePrompt(locationName, language, userProfile);
    
    console.log(`📝 프롬프트 전송 완료, 응답 대기 중...`);
    
    let responseText: string;
    try {
      const result = await model.generateContent(autonomousPrompt);
      const response = await result.response;
      responseText = await response.text();
      
      console.log(`📝 AI 응답 수신 (${responseText.length}자)`);
      
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('AI로부터 빈 응답을 받았습니다.');
      }
    } catch (error) {
      console.error('❌ AI 응답 생성 중 오류 발생:', error);
      throw new Error(`AI 응답 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // 응답 파싱
    let guideData;
    try {
      if (!responseText || responseText === 'undefined' || responseText.trim() === '' || responseText === undefined || responseText === null) {
        throw new Error('AI 응답이 비어있거나 undefined/null입니다.');
      }
      console.log('🔍 AI 응답 파싱 시작');
      guideData = parseJsonResponse(responseText);
      console.log('🔍 JSON 파싱 결과:', guideData);
      
      guideData = normalizeGuideData(guideData); // 구조 보정
      console.log('🔍 구조 정규화 후:', guideData);
      console.log('✅ JSON 파싱 및 구조 보정 성공');
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      return NextResponse.json({ success: false, error: 'AI 응답 파싱 실패: ' + (parseError instanceof Error ? parseError.message : '알 수 없는 오류') }, { status: 500 });
    }

    // GuideData 구조 검증
    if (!guideData || !guideData.overview || !guideData.route || !guideData.realTimeGuide) {
      console.error('❌ GuideData 구조 오류:', guideData);
      return NextResponse.json({ success: false, error: 'AI 응답 구조 오류: 필수 정보 누락' }, { status: 500 });
    }

    // 오디오 생성 및 업로드 (시작 챕터만 예시)
    let audioUrl = null;
    try {
      const script = guideData.realTimeGuide?.chapters?.[0]?.realTimeScript;
      if (script) {
        // 언어코드 변환 (ko, en 등 -> ko-KR, en-US 등)
        const ttsLang = language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : language;
        audioUrl = await getOrCreateTTSAndUrl(script, locationName, ttsLang);
        guideData.realTimeGuide.chapters[0].audioUrl = audioUrl;
      }
    } catch (ttsError) {
      console.error('TTS/GCS 업로드 실패:', ttsError);
    }
    
    console.log(`✅ AI 가이드 생성 완료 (${language})`);

    // === Supabase guides 테이블에 저장 ===
    console.log('💾 Supabase에 저장할 데이터:', guideData);
    console.log('💾 저장할 데이터 구조 확인 - overview:', !!guideData.overview);
    console.log('💾 저장할 데이터 구조 확인 - route:', !!guideData.route);
    console.log('💾 저장할 데이터 구조 확인 - realTimeGuide:', !!guideData.realTimeGuide);
    
    const insertData = {
      content: guideData, // 구조 검증된 데이터만 저장
      metadata: null,
      locationname: locationName,
      language,
      user_id: session?.user?.id || null,
      created_at: new Date().toISOString()
    };
    
    console.log('💾 실제 insert할 데이터:', JSON.stringify(insertData, null, 2));
    
    const { error: insertError } = await supabase.from('guides').insert([insertData]);
    if (insertError) {
      console.error('❌ Supabase guides insert error:', insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }
    console.log('✅ Supabase 저장 완료');
    
    return NextResponse.json({ 
      success: true, 
      data: { content: guideData }, 
      cached: 'new',
      language: language,
      version: '4.0-database-free'
    });

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
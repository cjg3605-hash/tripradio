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
      .eq('locationName', locationName)
      .eq('language', language)
      .single();
    if (cachedGuide) {
      // GuideData 타입 구조 보장: content, metadata 필드가 없으면 감싸서 반환
      if (cachedGuide.content) {
        return NextResponse.json({ 
          success: true, 
          data: cachedGuide, 
          cached: 'hit',
          language: language 
        });
      } else {
        return NextResponse.json({
          success: true,
          data: { content: cachedGuide },
          cached: 'hit',
          language: language
        });
      }
    }
    
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
      guideData = parseJsonResponse(responseText);
      console.log('✅ JSON 파싱 성공');
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      throw new Error(`가이드 데이터 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}`);
    }

    // 가이드 데이터 유효성 검사
    if (!guideData || !guideData.content) {
      console.error('❌ 유효하지 않은 가이드 데이터:', guideData);
      throw new Error('AI가 생성한 가이드 형식이 올바르지 않습니다.');
    }
    
    // 오디오 생성 및 업로드 (시작 챕터만 예시)
    let audioUrl = null;
    try {
      const script = guideData.content?.realTimeGuide?.chapters?.[0]?.realTimeScript;
      if (script) {
        // 언어코드 변환 (ko, en 등 -> ko-KR, en-US 등)
        const ttsLang = language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : language;
        audioUrl = await getOrCreateTTSAndUrl(script, locationName, ttsLang);
        guideData.content.realTimeGuide.chapters[0].audioUrl = audioUrl;
      }
    } catch (ttsError) {
      console.error('TTS/GCS 업로드 실패:', ttsError);
    }
    
    console.log(`✅ AI 가이드 생성 완료 (${language})`);

    // === Supabase guides 테이블에 저장 ===
    await supabase.from('guides').insert([{
      content: guideData.content,
      metadata: guideData.metadata,
      locationName,
      language,
      user_id: session?.user?.id || null,
      created_at: new Date().toISOString()
    }]);
    return NextResponse.json({ 
      success: true, 
      data: guideData, 
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
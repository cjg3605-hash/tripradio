import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts';
import authOptions from '@/lib/auth';
import { getOrCreateTTSAndUrl } from '@/lib/tts-gcs';

export const runtime = 'nodejs';

// Vercel KV 캐시 (선택적 import)
let kv: any = null;
try {
  kv = require('@vercel/kv').kv;
  console.log('✅ Vercel KV 사용 가능');
} catch (error) {
  console.log('⚠️ Vercel KV 사용 불가, 인메모리 캐시만 사용');
}

// 인메모리 캐시 (항상 사용 가능)
const memoryCache = new Map<string, { data: any; timestamp: number; userId?: string }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

// Gemini AI 클라이언트를 요청 시점에 초기화
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
    return new GoogleGenerativeAI(apiKey);
}

// --- 간소화된 캐시 관리 함수 ---

// 캐시에서 가이드 읽기 (우선순위: Vercel KV > Memory)
const readGuideFromCache = async (locationName: string, language: string = 'ko'): Promise<any | null> => {
  const cacheKey = `guide:${locationName}:${language}`;
  
  try {
    // 1. Vercel KV 캐시 시도
    if (kv) {
      const cached = await kv.get(cacheKey);
      if (cached) {
        console.log(`✅ Vercel KV 캐시에서 로드 (${language}): ${locationName}`);
        return cached;
      }
    }
  } catch (error) {
    console.log('⚠️ Vercel KV 캐시 읽기 실패:', error);
  }

  // 2. 인메모리 캐시 시도
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached && (Date.now() - memoryCached.timestamp) < CACHE_TTL) {
    console.log(`✅ 메모리 캐시에서 로드 (${language}): ${locationName}`);
    return memoryCached.data;
    }

    return null;
};

// 캐시에 가이드 저장 (모든 가능한 캐시에 저장)
const saveGuideToCache = async (
  locationName: string, 
  language: string, 
  guideData: any,
  userId?: string
): Promise<void> => {
  const cacheKey = `guide:${locationName}:${language}`;
  
  // 1. Vercel KV 저장 시도
  try {
    if (kv) {
      await kv.set(cacheKey, guideData, { ex: 86400 }); // 24시간 TTL
      console.log(`💾 Vercel KV 캐시에 저장 (${language}): ${locationName}`);
    }
  } catch (error) {
    console.log('⚠️ Vercel KV 캐시 저장 실패:', error);
  }

  // 2. 인메모리 캐시 저장 (항상 성공)
  memoryCache.set(cacheKey, { 
    data: guideData, 
    timestamp: Date.now(),
    userId: userId 
  });
  console.log(`💾 메모리 캐시에 저장 (${language}): ${locationName}`);
};

/**
 * Gemini AI 응답에서 JSON을 추출하고 파싱하는 함수
 */
function parseJsonResponse(jsonString: string) {
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
    
    // 세션 획득 (JWT 기반이므로 안전)
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
    
    // 캐시에서 가이드 확인
    const cachedGuide = await readGuideFromCache(locationName, language);
    if (cachedGuide) {
      return NextResponse.json({ 
        success: true, 
        data: cachedGuide, 
        cached: 'hit',
        language: language 
      });
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

    // 캐시에 저장
    await saveGuideToCache(locationName, language, guideData, session?.user?.id);

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
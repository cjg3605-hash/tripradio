import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/auth';

// Initialize Gemini AI with direct environment variable access
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
  
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw new Error('Failed to initialize AI service');
  }
}

const genAI = getGeminiClient();

// --- 데이터베이스 기반 캐시 관련 함수 ---

// DB에서 가이드 읽기 (언어별 가장 최근 가이드)
const readGuideFromDatabase = async (locationName: string, language: string = 'ko'): Promise<any | null> => {
  try {
    const guide = await prisma.guideHistory.findFirst({
      where: {
        originalLocationName: locationName,
        language: language,
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    if (guide) {
      console.log(`✅ 데이터베이스 캐시에서 로드 (${language}): ${locationName}`);
      return guide.guideData;
    }

    return null;
  } catch (error) {
    console.error(`DB 캐시 읽기 실패 (${language}): ${locationName}`, error);
    return null;
  }
};

// DB에 가이드 저장 (언어별)
const saveGuideToDatabase = async (
  locationName: string, 
  language: string, 
  guideData: any,
  userId?: string
): Promise<void> => {
  try {
    await prisma.guideHistory.create({
      data: {
        originalLocationName: locationName,
        language: language,
        guideData: guideData,
        userId: userId, // 로그인한 사용자의 ID 연결
      },
    });
    console.log(`💾 데이터베이스 캐시에 저장 (${language}): ${locationName}`);
  } catch (error) {
    console.error('데이터베이스 캐시 저장 실패:', error);
  }
};

// 명소명을 영문 파일명으로 변환하는 함수 (언어 지원 추가)
const convertToEnglishFileName = (locationName: string, language: string = 'ko'): string => {
  // 한글 명소명 → 영문명 매핑
  const nameMapping: { [key: string]: string } = {
    // 스페인
    '알함브라': 'alhambra',
    '알함브라 궁전': 'alhambra-palace',
    '메스키타': 'mezquita',
    '코르도바 메스키타': 'mezquita-cordoba',
    '코르도바 메스키타-카테드랄': 'mezquita-cordoba',
    '세비야 대성당': 'seville-cathedral',
    '히랄다 탑': 'giralda-tower',
    '사그라다 파밀리아': 'sagrada-familia',
    '구엘 공원': 'park-guell',
    '카사 밀라': 'casa-mila',
    '카사 바트요': 'casa-batllo',
    '몬세라트': 'montserrat',
    '플라멩코': 'flamenco',
    '레알 알카사르': 'real-alcazar',
    
    // 프랑스
    '에펠탑': 'eiffel-tower',
    '루브르 박물관': 'louvre-museum',
    '노트르담 대성당': 'notre-dame-cathedral',
    '베르사유 궁전': 'versailles-palace',
    '샹젤리제': 'champs-elysees',
    '몽마르트': 'montmartre',
    '개선문': 'arc-de-triomphe',
    
    // 이탈리아
    '콜로세움': 'colosseum',
    '바티칸': 'vatican',
    '피사의 사탑': 'leaning-tower-pisa',
    '두오모': 'duomo',
    '베네치아': 'venice',
    '피렌체': 'florence',
    
    // 기타
    '성': 'castle',
    '궁전': 'palace',
    '대성당': 'cathedral',
    '성당': 'church',
    '박물관': 'museum',
    '공원': 'park',
    '광장': 'square',
    '다리': 'bridge',
    '탑': 'tower'
  };

  let englishName = locationName.toLowerCase();
  
  // 매핑된 이름이 있으면 사용
  if (nameMapping[locationName]) {
    return nameMapping[locationName];
  }
  
  // 부분 매칭으로 변환
  Object.entries(nameMapping).forEach(([korean, english]) => {
    if (locationName.includes(korean)) {
      englishName = englishName.replace(korean, english);
    }
  });
  
  // 특수문자 제거 및 공백을 하이픈으로 변환
  englishName = englishName
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // 한글이 남아있으면 로마자 변환 (간단한 방식)
  if (/[가-힣]/.test(englishName)) {
    englishName = englishName.replace(/[가-힣]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
  
  // 빈 문자열이면 타임스탬프 사용
  if (!englishName) {
    englishName = `location-${Date.now()}`;
  }
  
  return englishName;
};

// 명소 이름을 파일명으로 안전하게 변환 (언어 포함)
const getLocationCacheFileName = (locationName: string, language: string = 'ko') => {
  const englishName = convertToEnglishFileName(locationName, language);
  const timestamp = Date.now();
  return `${englishName}-${language}-${timestamp}.json`;
};

/**
 * Gemini AI 응답에서 JSON을 추출하고 파싱하는 함수
 * - 코드 블록에서 JSON 추출 시도
 * - 중괄호 밸런스에 따라 유효한 JSON 추출
 * - 여러 가지 방법으로 파싱을 시도하여 성공 확률 향상
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
        
        // 이스케이프 문자 처리
        if (escapeNext) {
            result += char;
            escapeNext = false;
            continue;
        }
        
        // 문자열 내부/외부 처리
        if (char === '"') {
            inString = !inString;
        } else if (char === '\\' && inString) {
            escapeNext = true;
        } 
        
        // 중괄호 카운팅 (문자열 외부에서만)
        if (!inString) {
            if (char === '{') balance++;
            if (char === '}') balance--;
        }
        
        result += char;
        
        // 모든 중괄호가 닫히면 종료
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

// JSON 파싱 에러 위치 컨텍스트 추출
function getErrorContext(jsonString: string, error: any): string {
    try {
        const match = error.message.match(/position (\d+)/);
        if (match) {
            const position = parseInt(match[1]);
            const start = Math.max(0, position - 100);
            const end = Math.min(jsonString.length, position + 100);
            return `...${jsonString.substring(start, end)}...`;
        }
    } catch (e) {
        // 컨텍스트 추출 실패시 무시
    }
    return '컨텍스트 추출 실패';
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { locationName, language = 'ko', userProfile } = await req.json();

    if (!locationName) {
      return NextResponse.json({ success: false, error: 'Location is required' }, { status: 400 });
    }
    
    console.log(`🌍 다국어 가이드 생성 요청 - 장소: ${locationName}, 언어: ${language}`);
    
    // 데이터베이스에서 캐시된 가이드 확인
    const cachedGuide = await readGuideFromDatabase(locationName, language);
    if (cachedGuide) {
      return NextResponse.json({ 
        success: true, 
        data: cachedGuide, 
        cached: 'database',
        language: language 
      });
    }
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,  // 더 일관성 있는 출력을 위해 낮춤
        maxOutputTokens: 8192
      }
    });

    // --- 다국어 자율 리서치 기반 완전한 가이드 생성 ---
    console.log(`🚀 다국어 자율 리서치 기반 가이드 생성 시작 - ${locationName} (${language})`);
    const autonomousPrompt = createAutonomousGuidePrompt(locationName, language, userProfile);
    
    console.log(`📝 프롬프트 전송 완료, 응답 대기 중...`);
    
    let responseText: string;
    try {
      const result = await model.generateContent(autonomousPrompt);
      const response = await result.response;
      responseText = await response.text();
      
      console.log(`📝 AI 응답 수신 (${responseText.length}자)`);
      console.log(`📝 응답 미리보기 (첫 500자):`);
      console.log(responseText.substring(0, 500));
      
      // 응답이 비어있는지 확인
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('AI로부터 빈 응답을 받았습니다.');
      }
    } catch (error) {
      console.error('❌ AI 응답 생성 중 오류 발생:', error);
      throw new Error(`AI 응답 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // 응답 파싱 시도
    let guideData;
    try {
      guideData = parseJsonResponse(responseText);
      console.log('✅ JSON 파싱 성공');
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      console.error('파싱 실패한 응답 내용:', responseText);
      throw new Error(`가이드 데이터 파싱 실패: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}`);
    }

    // 가이드 데이터 유효성 검사
    if (!guideData || !guideData.content) {
      console.error('❌ 유효하지 않은 가이드 데이터:', guideData);
      throw new Error('AI가 생성한 가이드 형식이 올바르지 않습니다.');
    }
    
    console.log(`✅ 다국어 자율 리서치 기반 가이드 생성 완료 (${language})`);

    // 데이터베이스에 캐시 저장
    await saveGuideToDatabase(locationName, language, guideData, session?.user?.id);

    return NextResponse.json({ 
      success: true, 
      data: guideData, 
      cached: 'new',
      language: language,
      version: '2.0-multilingual-db'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    // 에러 상세 정보 로깅
    if (error instanceof Error) {
      console.error('❌ Error stack:', error.stack);
      if ('response' in error) {
        console.error('❌ Error response:', JSON.stringify(error.response, null, 2));
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      cached: 'error' 
    }, { status: 500 });
  }
}
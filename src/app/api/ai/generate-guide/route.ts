import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- 영구 캐시 관련 설정 ---
const PERMANENT_CACHE_DIR = path.join(process.cwd(), 'saved-guides', 'history');

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

// 영구 캐시에서 가이드 읽기 (언어별 가장 최근 파일)
const readGuideFromCache = async (locationName: string, language: string = 'ko'): Promise<any | null> => {
  try {
    const englishName = convertToEnglishFileName(locationName, language);
    
    // history 폴더의 모든 파일 검색 (언어별 필터링)
    const files = await fs.readdir(PERMANENT_CACHE_DIR);
    const matchingFiles = files
      .filter(file => 
        file.startsWith(englishName) && 
        file.includes(`-${language}-`) && 
        file.endsWith('.json')
      )
      .sort((a, b) => {
        // 타임스탬프로 정렬 (최신순)
        const timestampA = parseInt(a.split('-').pop()?.replace('.json', '') || '0');
        const timestampB = parseInt(b.split('-').pop()?.replace('.json', '') || '0');
        return timestampB - timestampA;
      });
    
    if (matchingFiles.length > 0) {
      const latestFile = matchingFiles[0];
      const filePath = path.join(PERMANENT_CACHE_DIR, latestFile);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      console.log(`✅ 파일 캐시에서 로드 (${language}): ${latestFile}`);
      return JSON.parse(fileContent);
    }
    
    return null;
  } catch (error) {
    console.log(`📂 캐시 파일 없음 (${language}): ${locationName}`);
    return null;
  }
};

// 영구 캐시에 가이드 저장 (언어별)
const saveGuideToFile = async (locationName: string, language: string, guideData: any): Promise<void> => {
  try {
    await fs.mkdir(PERMANENT_CACHE_DIR, { recursive: true });
    const fileName = getLocationCacheFileName(locationName, language);
    const filePath = path.join(PERMANENT_CACHE_DIR, fileName);
    
    // 메타데이터 추가
    const dataToSave = {
      ...guideData,
      metadata: {
        originalLocationName: locationName,
        language: language,
        englishFileName: fileName,
        generatedAt: new Date().toISOString(),
        version: '2.0-multilingual'
      }
    };
    
    await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    console.log(`💾 파일 캐시에 저장 (${language}): ${fileName}`);
  } catch (error) {
    console.error('파일 캐시 저장 실패:', error);
  }
};

// JSON 응답 파싱 (더 안정적인 파싱을 위한 함수)
function parseJsonResponse(jsonString: string) {
    console.log(`🔍 원본 응답 길이: ${jsonString.length}자`);
    console.log(`🔍 원본 시작 100자: ${JSON.stringify(jsonString.substring(0, 100))}`);
    
    // 1. 코드 블록 제거 및 기본 정리
    let cleanedString = jsonString.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/g, '$1').trim();
    
    // 2. JSON 시작점 찾기
    const jsonStart = cleanedString.indexOf('{');
    if (jsonStart === -1) {
        throw new Error('응답에서 JSON 시작(`{`)을 찾을 수 없습니다.');
    }
    cleanedString = cleanedString.substring(jsonStart);
    
    // 3. JSON 끝 찾기 (마지막 '}'부터 거꾸로 검색)
    const jsonEnd = cleanedString.lastIndexOf('}');
    if (jsonEnd === -1) {
        throw new Error('응답에서 JSON 끝(`}`)을 찾을 수 없습니다.');
    }
    cleanedString = cleanedString.substring(0, jsonEnd + 1);
    
    // 4. JSON 문자열 내부의 이스케이프된 따옴표 보호
    cleanedString = cleanedString.replace(/\\(["\\\/bfnrtu])/g, (match, p1) => {
        return `__ESCAPED_${p1.charCodeAt(0)}__`;
    });
    
    // 5. 문자열 외부의 공백 정리 (문자열 내부는 보존)
    let inString = false;
    let result: string[] = [];
    let currentString = '';
    
    for (let i = 0; i < cleanedString.length; i++) {
        const char = cleanedString[i];
        
        if (char === '"' && (i === 0 || cleanedString[i-1] !== '\\')) {
            inString = !inString;
            currentString += char;
            if (!inString) {
                result.push(currentString);
                currentString = '';
            }
        } else if (inString) {
            currentString += char;
        } else {
            // 문자열 외부에서만 공백 정리
            if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
                if (result.length > 0 && result[result.length - 1] !== ' ') {
                    result.push(' ');
                }
            } else {
                result.push(char);
            }
        }
    }
    
    // 마지막 문자열이 닫히지 않은 경우 추가
    if (currentString) {
        result.push(currentString);
    }
    
    cleanedString = result.join('')
        // JSON 구조 정리
        .replace(/\s*([\{\}\[\],:])\s*/g, '$1')
        // 마지막 쉼표 제거
        .replace(/,(\s*[\}\]])(?=([^"]*"[^"]*")*[^"]*$)/g, '$1');
    
    // 이스케이프된 문자 복원
    cleanedString = cleanedString.replace(/__ESCAPED_(\d+)__/g, (match, p1) => {
        return `\\${String.fromCharCode(parseInt(p1))}`;
    });
    
    console.log(`🔍 정리 후 200자: ${cleanedString.substring(0, 200)}`);
    
    try {
        const parsed = JSON.parse(cleanedString);
        console.log('✅ JSON 파싱 성공!');
        return parsed;
    } catch (error) {
        console.error('🚨 JSON 파싱 실패:', error);
        console.error('💣 실패 문자열 (첫 300자):', cleanedString.substring(0, 300));
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
    const { locationName, language = 'ko', userProfile } = await req.json();

    if (!locationName) {
      return NextResponse.json({ success: false, error: 'Location is required' }, { status: 400 });
    }
    
    console.log(`🌍 다국어 가이드 생성 요청 - 장소: ${locationName}, 언어: ${language}`);
    
    // 언어별 캐시된 가이드 확인
    const cachedGuide = await readGuideFromCache(locationName, language);
    if (cachedGuide) {
      return NextResponse.json({ 
        success: true, 
        data: cachedGuide, 
        cached: 'file',
        language: language 
      });
    }
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.3,  // 더 일관성 있는 출력을 위해 낮춤
        topK: 20,          // 더 집중된 선택을 위해 낮춤  
        topP: 0.6,         // 더 예측 가능한 출력을 위해 낮춤
        maxOutputTokens: 8192,
      }
    });

    // --- 다국어 자율 리서치 기반 완전한 가이드 생성 ---
    console.log(`🚀 다국어 자율 리서치 기반 가이드 생성 시작 - ${locationName} (${language})`);
    const autonomousPrompt = createAutonomousGuidePrompt(locationName, language, userProfile);
    
    const result = await model.generateContent(autonomousPrompt);
    const responseText = result.response.text();
    
    console.log(`📝 AI 응답 미리보기 (첫 500자):`);
    console.log(responseText.substring(0, 500));
    
    const guideData = parseJsonResponse(responseText);

    if (!guideData || !guideData.content) {
      throw new Error('AI 가이드 생성 또는 파싱에 실패했습니다.');
    }
    
    console.log(`✅ 다국어 자율 리서치 기반 가이드 생성 완료 (${language})`);

    // 언어별 파일 캐시에 저장
    await saveGuideToFile(locationName, language, guideData);

    return NextResponse.json({ 
      success: true, 
      data: guideData, 
      cached: 'new',
      language: language,
      version: '2.0-multilingual'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage, 
      cached: 'error' 
    }, { status: 500 });
  }
}
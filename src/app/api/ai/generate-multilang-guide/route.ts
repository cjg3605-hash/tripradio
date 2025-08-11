import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';

export const runtime = 'nodejs';


// Gemini 클라이언트 초기화 함수
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
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
};

/**
 * 🎯 순차적 좌표 검색 (1~5순위) - 반드시 좌표를 반환하도록 보장
 * 라우터 내부에서 직접 처리하여 복잡성 최소화
 */
async function findCoordinatesInOrder(locationName: string): Promise<{ lat: number; lng: number }> {
  console.log(`🔍 좌표 검색 시작: ${locationName}`);
  
  // 1순위: 구글 키워드 + 플러스코드 검색
  try {
    console.log(`🔍 1순위 시도: 구글 키워드 + 플러스코드`);
    const plusCodeResult = await searchWithPlusCode(locationName);
    if (plusCodeResult) {
      console.log(`✅ 1순위 성공: 플러스코드 → ${plusCodeResult.lat}, ${plusCodeResult.lng}`);
      return plusCodeResult;
    }
  } catch (error) {
    console.log(`❌ 1순위 실패: 구글 검색 오류 -`, error);
  }
  
  // 2순위: Places API 상세 검색 (장소명 + 입구)
  try {
    console.log(`🔍 2순위 시도: Places API 상세 검색`);
    const placesDetailResult = await searchPlacesDetailed(locationName);
    if (placesDetailResult) {
      console.log(`✅ 2순위 성공: Places API 상세 → ${placesDetailResult.lat}, ${placesDetailResult.lng}`);
      return placesDetailResult;
    }
  } catch (error) {
    console.log(`❌ 2순위 실패: Places API 상세 검색 오류 -`, error);
  }
  
  // 3순위: Places API 기본 검색 (장소명만)
  try {
    console.log(`🔍 3순위 시도: Places API 기본 검색`);
    const placesBasicResult = await searchPlacesBasic(locationName);
    if (placesBasicResult) {
      console.log(`✅ 3순위 성공: Places API 기본 → ${placesBasicResult.lat}, ${placesBasicResult.lng}`);
      return placesBasicResult;
    }
  } catch (error) {
    console.log(`❌ 3순위 실패: Places API 기본 검색 오류 -`, error);
  }
  
  // 4순위: AI를 통한 좌표 추정 시도
  try {
    console.log(`🔍 4순위 시도: AI 좌표 추정`);
    const aiCoordinates = await getCoordinatesFromAI(locationName);
    if (aiCoordinates) {
      console.log(`✅ 4순위 성공: AI 추정 → ${aiCoordinates.lat}, ${aiCoordinates.lng}`);
      return aiCoordinates;
    }
  } catch (error) {
    console.log(`❌ 4순위 실패: AI 좌표 추정 오류 -`, error);
  }
  
  // 5순위: 기본 좌표 반환 (서울 중심부 - 좌표가 없으면 안 되므로 최후 수단)
  console.log(`🎯 5순위: 기본 좌표 사용 - 서울 중심부 좌표로 대체`);
  const defaultCoordinates = getDefaultCoordinates(locationName);
  console.log(`✅ 기본 좌표 적용: ${defaultCoordinates.lat}, ${defaultCoordinates.lng}`);
  return defaultCoordinates;
}

/**
 * 🤖 4순위: AI를 통한 좌표 추정 시도
 */
async function getCoordinatesFromAI(locationName: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const coordinatePrompt = `
Please provide the exact GPS coordinates (latitude and longitude) for: "${locationName}"

Respond ONLY in this format:
LAT: [latitude]
LNG: [longitude]

Example:
LAT: 35.1796
LNG: 129.0756

If you cannot find exact coordinates, respond with "COORDINATES_NOT_FOUND".
`;

    const response = await model.generateContent(coordinatePrompt);
    const text = response.response.text().trim();
    
    console.log(`🤖 AI 좌표 응답: ${text}`);

    // LAT/LNG 형식에서 좌표 추출
    const latMatch = text.match(/LAT:\s*(-?\d{1,2}\.\d{1,8})/i);
    const lngMatch = text.match(/LNG:\s*(-?\d{1,3}\.\d{1,8})/i);

    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      // 유효한 좌표 범위 확인
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    return null;
  } catch (error) {
    console.error(`❌ AI 좌표 추정 실패:`, error);
    return null;
  }
}

/**
 * 🎯 5순위: 기본 좌표 제공 (지역별 중심 좌표)
 */
function getDefaultCoordinates(locationName: string): { lat: number; lng: number } {
  const name = locationName.toLowerCase();
  
  // 한국 지역별 기본 좌표
  if (name.includes('부산') || name.includes('busan')) {
    return { lat: 35.1796, lng: 129.0756 }; // 부산 중심부
  } else if (name.includes('제주') || name.includes('jeju')) {
    return { lat: 33.4996, lng: 126.5312 }; // 제주시 중심부
  } else if (name.includes('경주') || name.includes('gyeongju')) {
    return { lat: 35.8562, lng: 129.2247 }; // 경주시 중심부
  } else if (name.includes('인천') || name.includes('incheon')) {
    return { lat: 37.4563, lng: 126.7052 }; // 인천 중심부
  } else if (name.includes('대구') || name.includes('daegu')) {
    return { lat: 35.8714, lng: 128.6014 }; // 대구 중심부
  } else if (name.includes('광주') || name.includes('gwangju')) {
    return { lat: 35.1595, lng: 126.8526 }; // 광주 중심부
  } else if (name.includes('대전') || name.includes('daejeon')) {
    return { lat: 36.3504, lng: 127.3845 }; // 대전 중심부
  } else if (name.includes('울산') || name.includes('ulsan')) {
    return { lat: 35.5384, lng: 129.3114 }; // 울산 중심부
  } else {
    // 기본값: 서울 중심부 (명동)
    return { lat: 37.5665, lng: 126.9780 };
  }
}

/**
 * 🔍 1순위: Google Places API를 이용한 플러스코드 기반 검색
 */
async function searchWithPlusCode(locationName: string): Promise<{ lat: number; lng: number } | null> {
  const { smartPlacesSearch } = await import('@/lib/coordinates/google-places-integration');
  
  // 전세계 호환 플러스코드 검색 쿼리들
  const plusCodeQueries = [
    `${locationName} plus code`,
    `${locationName} entrance`,
    `${locationName} visitor center`,
    `${locationName} main gate`,
    `${locationName}`
  ];
  
  for (const query of plusCodeQueries) {
    try {
      console.log(`  🔍 플러스코드 검색 시도: "${query}"`);
      const result = await smartPlacesSearch(query, 'en'); // 영어로 검색 (전세계 호환)
      
      if (result) {
        console.log(`✅ 플러스코드 검색 성공: ${result.coordinates.lat}, ${result.coordinates.lng}`);
        return {
          lat: result.coordinates.lat,
          lng: result.coordinates.lng
        };
      }
    } catch (error) {
      console.log(`  ❌ 플러스코드 검색 실패: ${query}`, error);
    }
    
    // API 호출 제한을 위한 대기
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return null;
}

/**
 * 🏢 2순위: Places API 상세 검색 (장소명 + 입구/entrance) - 전세계 호환
 */
async function searchPlacesDetailed(locationName: string): Promise<{ lat: number; lng: number } | null> {
  const { smartPlacesSearch } = await import('@/lib/coordinates/google-places-integration');
  
  // 전세계 호환 상세 검색 쿼리들 (다국어 지원)
  const searchQueries = [
    `${locationName} entrance`,
    `${locationName} main entrance`,
    `${locationName} visitor entrance`,
    `${locationName} gate`,
    `${locationName} main gate`,
    `${locationName} visitor center`,
    `${locationName} information center`,
    `${locationName} 입구`,
    `${locationName} 매표소`
  ];
  
  for (const query of searchQueries) {
    try {
      console.log(`  🔍 Places API 상세 검색 시도: "${query}"`);
      const result = await smartPlacesSearch(query, 'en'); // 영어 검색 (전세계 호환)
      
      if (result) {
        return {
          lat: result.coordinates.lat,
          lng: result.coordinates.lng
        };
      }
    } catch (error) {
      console.log(`  ❌ Places API 상세 검색 실패: ${query}`, error);
    }
    
    // API 호출 제한을 위한 대기
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return null;
}

/**
 * 🏢 3순위: Places API 기본 검색 (장소명만) - 전세계 호환
 */
async function searchPlacesBasic(locationName: string): Promise<{ lat: number; lng: number } | null> {
  const { smartPlacesSearch } = await import('@/lib/coordinates/google-places-integration');
  
  // 전세계 호환 기본 검색 (장소명 그대로)
  const searchQueries = [
    `${locationName}`, // 정확한 장소명
    `${locationName} tourist attraction`,
    `${locationName} landmark`,
    `${locationName} temple`, // 템플 (전세계 공통)
    `${locationName} park`,
    `${locationName} museum`
  ];
  
  for (const query of searchQueries) {
    try {
      console.log(`  🔍 Places API 기본 검색 시도: "${query}"`);
      const result = await smartPlacesSearch(query, 'en'); // 영어 검색 (전세계 호환)
      
      if (result) {
        return {
          lat: result.coordinates.lat,
          lng: result.coordinates.lng
        };
      }
    } catch (error) {
      console.log(`  ❌ Places API 기본 검색 실패: ${query}`, error);
    }
    
    // API 호출 제한을 위한 대기
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationName, language, userProfile, parentRegion, regionalContext } = body;

    if (!locationName || !language) {
      return NextResponse.json(
        { 
          success: false, 
          error: '위치명과 언어는 필수입니다.' 
        },
        { status: 400 }
      );
    }

    console.log(`🤖 ${language} 가이드 생성 시작:`, {
      locationName,
      parentRegion: parentRegion || 'none',
      regionalContext: regionalContext || 'none'
    });

    // 🎯 1단계: AI 가이드 생성 먼저 완료 (좌표 없이)
    console.log(`\n🤖 AI 가이드 생성 1단계 시작: ${locationName}`);
    
    // 🎯 지역 컨텍스트를 포함한 언어별 정교한 프롬프트 생성
    const contextualLocationName = parentRegion 
      ? `${locationName} (${parentRegion} 지역)`
      : locationName;
    const prompt = await createAutonomousGuidePrompt(contextualLocationName, language, userProfile);
    
    console.log(`📝 ${language} 프롬프트 준비 완료: ${prompt.length}자`);

    // Gemini 클라이언트 초기화
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite-preview-06-17',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384, // 대폭 증가: 8000 → 16384
        topK: 40,
        topP: 0.9,
      }
    });

    console.log(`🤖 ${language} 가이드 생성 중...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('AI 응답이 비어있습니다');
    }

    console.log(`📥 ${language} AI 응답 수신: ${text.length}자`);

    // 🚨 AI 응답 디버깅 - 처음 1000글자만 출력
    console.log(`🔍 AI 응답 내용 (처음 1000자):`);
    console.log(text.substring(0, 1000));
    console.log(`🔍 AI 응답 끝부분 (마지막 500자):`);
    console.log(text.substring(Math.max(0, text.length - 500)));

    // JSON 파싱 시도
    let guideData;
    let validChapters: any[] = []; // 🔥 스코프 외부로 이동
    
    try {
      // JSON 블록 추출 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        guideData = JSON.parse(jsonMatch[0]);
        
        // 🔥 핵심: AI가 realTimeGuide.chapters 없이 route.steps만 생성한 경우 자동 변환
        if (!guideData.realTimeGuide?.chapters && guideData.route?.steps) {
          console.log(`🔄 route.steps → realTimeGuide.chapters 자동 변환 시작`);
          
          // route.steps를 기반으로 realTimeGuide.chapters 생성
          guideData.realTimeGuide = guideData.realTimeGuide || {};
          guideData.realTimeGuide.chapters = guideData.route.steps.map((step: any, index: number) => ({
            id: index,
            title: step.title || step.location || `챕터 ${index + 1}`,
            narrative: `${step.title || step.location}에 대한 상세한 설명입니다.`,
            nextDirection: index < guideData.route.steps.length - 1 
              ? `다음 장소인 ${guideData.route.steps[index + 1].title}로 이동하겠습니다.`
              : "관람을 마치시고 자유롭게 둘러보시거나 출구 방향으로 이동하시면 됩니다."
          }));
          
          console.log(`✅ route.steps → realTimeGuide.chapters 변환 완료: ${guideData.realTimeGuide.chapters.length}개`);
        }
        
        // 🔥 핵심: 안전한 챕터 카운팅 및 유효성 검증
        if (guideData.realTimeGuide?.chapters) {
          // 유효한 챕터만 필터링 (id와 title이 있는 것)
          validChapters = guideData.realTimeGuide.chapters.filter((chapter: any) => 
            chapter && 
            (chapter.id !== undefined && chapter.id !== null) && 
            chapter.title && 
            chapter.title.trim()
          );
          
          console.log(`🔍 ${language} 전체 챕터: ${guideData.realTimeGuide.chapters.length}개`);
          console.log(`🔍 ${language} 유효한 챕터: ${validChapters.length}개`);
          
          validChapters.forEach((chapter: any, index: number) => {
            console.log(`  챕터 ID ${chapter.id}: "${chapter.title}"`);
            console.log(`    narrative: ${chapter.narrative ? `${chapter.narrative.substring(0, 100)}...` : 'MISSING'}`);
            console.log(`    nextDirection: ${chapter.nextDirection ? `${chapter.nextDirection.substring(0, 50)}...` : 'MISSING'}`);
          });
        }
        
        // 🔥 핵심: 유효한 챕터들만 처리 (좌표 처리는 나중에)
        if (validChapters.length > 0) {
          guideData.realTimeGuide.chapters = validChapters.map((chapter: any) => {
            // 🚨 narrative 통합 (3개 필드를 합쳐서 narrative로 생성)
            const sceneDescription = chapter.sceneDescription || '';
            const coreNarrative = chapter.coreNarrative || '';
            const humanStories = chapter.humanStories || '';
            const existingNarrative = chapter.narrative || '';
            
            // 3개 필드가 있으면 통합, 없으면 기존 narrative 사용
            const fieldsArray = [sceneDescription, coreNarrative, humanStories].filter(Boolean);
            const combinedNarrative = fieldsArray.length > 0 
              ? fieldsArray.join(' ') 
              : existingNarrative;
            
            // 🔥 3개 필드 통합 디버깅
            console.log(`📝 챕터 ${chapter.id} 필드 통합:`);
            console.log(`  sceneDescription: ${sceneDescription ? sceneDescription.length + '글자' : '없음'}`);
            console.log(`  coreNarrative: ${coreNarrative ? coreNarrative.length + '글자' : '없음'}`);
            console.log(`  humanStories: ${humanStories ? humanStories.length + '글자' : '없음'}`);
            console.log(`  combinedNarrative: ${combinedNarrative ? combinedNarrative.length + '글자' : '없음'}`);
            
            // AI가 생성한 좌표 정보는 제거 (나중에 정확한 좌표로 교체)
            let cleanNarrative = combinedNarrative
              .replace(/위도[\s:：]*\d{1,2}\.\d{4,8}[,，\s]*경도[\s:：]*\d{1,3}\.\d{4,8}/gi, '') // 위도/경도 패턴 제거
              .replace(/\{\s*["']?(?:lat|latitude)["']?\s*:\s*\d{1,2}\.\d{4,8}\s*,\s*["']?(?:lng|longitude)["']?\s*:\s*\d{1,3}\.\d{4,8}\s*\}/gi, '') // JSON 좌표 제거
              .replace(/\[\s*\d{1,2}\.\d{4,8}\s*,\s*\d{1,3}\.\d{4,8}\s*\]/g, '') // 배열 좌표 제거
              .replace(/\d{1,2}\.\d{4,8}[,，\s]+\d{1,3}\.\d{4,8}/g, '') // 일반 좌표 제거
              .replace(/\s+/g, ' ') // 여러 공백을 하나로
              .replace(/^\s*[,，.。]\s*/, '') // 시작 구두점 제거
              .replace(/\s*[,，.。]\s*$/, '') // 끝 구두점 정리
              .trim();
            
            return {
              ...chapter,
              narrative: cleanNarrative,
              // 좌표는 나중에 처리하므로 일단 제거
              coordinates: undefined,
              lat: undefined,
              lng: undefined,
              // 3개 필드는 제거 (narrative로 통합됨)
              sceneDescription: undefined,
              coreNarrative: undefined,
              humanStories: undefined
            };
          });
        }
        
        // 🔥 새로운 개요 양식 정규화
        if (guideData.overview) {
          // 새로운 필드들이 없으면 기존 summary를 사용
          if (!guideData.overview.location && !guideData.overview.keyFeatures && !guideData.overview.background) {
            // 기존 summary가 있으면 그대로 유지 (호환성)
            if (guideData.overview.summary) {
              console.log(`📝 ${language} 기존 개요 구조 유지`);
            } else {
              // 기본 개요 구조 생성
              guideData.overview = {
                ...guideData.overview,
                location: `${locationName}의 정확한 위치`,
                keyFeatures: `${locationName}의 주요 특징`,
                background: `${locationName}의 역사적 배경`
              };
            }
          } else {
            console.log(`✅ ${language} 새로운 개요 양식 적용`);
          }
        }
        
        console.log(`✅ ${language} 가이드 정규화 완료: ${validChapters.length}개 유효한 챕터`);
      } else {
        // JSON 블록이 없으면 전체 텍스트를 기본 구조로 래핑
        guideData = {
          overview: {
            title: locationName,
            location: `${locationName}의 정확한 위치`,
            keyFeatures: `${locationName}의 주요 특징`,
            background: `${locationName}의 역사적 배경`,
            keyFacts: [],
            visitInfo: {},
            narrativeTheme: ''
          },
          route: { steps: [] },
          realTimeGuide: { chapters: [] }
        };
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 기본 구조 사용:', parseError);
      guideData = {
        overview: {
          title: locationName,
          location: `${locationName}의 정확한 위치`,
          keyFeatures: `${locationName}의 주요 특징`,
          background: `${locationName}의 역사적 배경`,
          keyFacts: [],
          visitInfo: {},
          narrativeTheme: ''
        },
        route: { steps: [] },
        realTimeGuide: { chapters: [] }
      };
    }

    console.log(`✅ ${language} AI 가이드 생성 완료 - 이제 좌표 처리 시작`);
    
    // 🎯 2단계: AI 생성 완료 후 좌표 검색 (1~5순위, 반드시 좌표 반환)
    console.log(`\n🔍 좌표 검색 2단계 시작: ${locationName}`);
    const foundCoordinates = await findCoordinatesInOrder(locationName);
    console.log(`✅ 좌표 확보 완료: ${foundCoordinates.lat}, ${foundCoordinates.lng}`);
    
    // 🎯 3단계: 확보된 좌표를 모든 챕터에 반드시 적용 (정규화된 방식)
    console.log(`\n📍 좌표 적용 3단계 시작`);
    
    if (guideData.realTimeGuide?.chapters && validChapters.length > 0) {
      console.log(`📍 ${validChapters.length}개 유효한 챕터에 좌표 적용: ${foundCoordinates.lat}, ${foundCoordinates.lng}`);
      
      // 🔥 핵심: narrative와 nextDirection 사이에 coordinates 필드만 추가
      guideData.realTimeGuide.chapters = validChapters.map((chapter: any, index: number) => {
        const offset = index * 0.0005; // 챕터별 약간의 오프셋 (약 50미터)
        const coordinatesData = {
          lat: foundCoordinates.lat + offset,
          lng: foundCoordinates.lng + offset
        };
        
        // 🎯 정규화된 챕터 구조: narrative와 nextDirection 사이에 coordinates 추가
        const normalizedChapter = {
          ...chapter,
          coordinates: coordinatesData  // narrative와 nextDirection 사이에 위치
        };
        
        console.log(`  ✅ 챕터 ${chapter.id}: 정규화된 좌표 추가 완료`, {
          id: chapter.id,
          title: chapter.title,
          coordinates: coordinatesData,
          narrative: chapter.narrative ? `${chapter.narrative.substring(0, 50)}...` : 'MISSING',
          nextDirection: chapter.nextDirection ? `${chapter.nextDirection.substring(0, 30)}...` : 'MISSING'
        });
        
        return normalizedChapter;
      });
      
      console.log(`✅ ${guideData.realTimeGuide.chapters.length}개 챕터 좌표 JSON 적용 완료`);
      
      // 좌표 성공 정보 저장
      guideData.locationCoordinateStatus = {
        locationName: locationName,
        coordinateSearchAttempted: true,
        coordinateFound: true,
        coordinateSource: 'sequential_after_ai',
        coordinates: foundCoordinates,
        lastAttempt: new Date().toISOString()
      };
      
    } else {
      console.log(`⚠️ realTimeGuide.chapters 구조가 없거나 유효한 챕터가 없음 - 기본 구조 생성`);
      
      // 기본 챕터 구조 생성 (정규화된 방식)
      guideData.realTimeGuide = guideData.realTimeGuide || {};
      guideData.realTimeGuide.chapters = [
        {
          id: 1,
          title: `${locationName} 가이드`,
          narrative: `${locationName}에 대한 안내입니다.`,
          coordinates: {
            lat: foundCoordinates.lat,
            lng: foundCoordinates.lng
          },
          nextDirection: `${locationName} 탐방을 시작해보세요.`
        }
      ];
      
      // 좌표 성공 정보 저장
      guideData.locationCoordinateStatus = {
        locationName: locationName,
        coordinateSearchAttempted: true,
        coordinateFound: true,
        coordinateSource: 'sequential_after_ai_fallback',
        coordinates: foundCoordinates,
        lastAttempt: new Date().toISOString()
      };
      
      console.log(`✅ 기본 챕터 구조 생성 및 정규화된 좌표 적용 완료`);
    }

    // 🎯 4단계: 챕터별 좌표 배열 생성 (사용자 요구사항)
    console.log(`\n📍 챕터별 좌표 배열 생성`);
    const coordinatesArray: any[] = [];
    
    if (guideData.realTimeGuide?.chapters && Array.isArray(guideData.realTimeGuide.chapters)) {
      guideData.realTimeGuide.chapters.forEach((chapter: any, index: number) => {
        const offset = index * 0.0005; // 챕터별 약간의 오프셋
        coordinatesArray.push({
          id: chapter.id !== undefined ? chapter.id : index,
          title: chapter.title || `챕터 ${index + 1}`,
          coordinates: {
            lat: foundCoordinates.lat + offset,
            lng: foundCoordinates.lng + offset
          }
        });
      });
    } else {
      // 챕터가 없는 경우 기본 좌표 하나만
      coordinatesArray.push({
        id: 0,
        title: `${locationName} 가이드`,
        coordinates: {
          lat: foundCoordinates.lat,
          lng: foundCoordinates.lng
        }
      });
    }
    
    console.log(`📍 챕터별 좌표 배열 생성 완료: ${coordinatesArray.length}개`);
    coordinatesArray.forEach(coord => {
      console.log(`  - ${coord.title}: ${coord.coordinates.lat}, ${coord.coordinates.lng}`);
    });
    
    // 🎯 5단계: coordinatesArray를 guideData에 추가 (DB 저장용)
    guideData.coordinatesArray = coordinatesArray;
    
    // 🎯 6단계: 최종 응답 반환
    console.log(`\n✅ ${language} 가이드 생성 최종 완료`);
    
    return NextResponse.json({
      success: true,
      data: guideData
    });

  } catch (error) {
    console.error(`❌ 가이드 생성 실패:`, error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `가이드 생성 실패: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}
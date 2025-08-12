// src/lib/coordinates/coordinate-utils.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🌍 지역 컨텍스트를 포함한 좌표 검색 옵션
 */
export interface LocationContext {
  locationName: string;
  parentRegion?: string;
  countryCode?: string;
  language?: string;
}

/**
 * 🎯 순차적 좌표 검색 유틸리티 (1~5순위) - 지역 컨텍스트 지원
 * 반드시 좌표를 반환하도록 보장
 */
export async function findCoordinatesInOrder(
  locationName: string, 
  context?: LocationContext
): Promise<{ lat: number; lng: number }> {
  const ctx = context || { locationName };
  const contextualName = buildContextualLocationName(ctx);
  
  console.log(`🔍 좌표 검색 시작: ${locationName}`);
  console.log(`🌍 컨텍스트 정보:`, {
    original: locationName,
    contextual: contextualName,
    region: ctx.parentRegion,
    country: ctx.countryCode,
    language: ctx.language
  });
  
  // 1순위: 구글 키워드 + 플러스코드 검색
  try {
    console.log(`🔍 1순위 시도: 구글 키워드 + 플러스코드`);
    const plusCodeResult = await searchWithPlusCode(contextualName, ctx);
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
    const placesDetailResult = await searchPlacesDetailed(contextualName, ctx);
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
    const placesBasicResult = await searchPlacesBasic(contextualName, ctx);
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
    const aiCoordinates = await getCoordinatesFromAI(contextualName, ctx);
    if (aiCoordinates) {
      console.log(`✅ 4순위 성공: AI 추정 → ${aiCoordinates.lat}, ${aiCoordinates.lng}`);
      return aiCoordinates;
    }
  } catch (error) {
    console.log(`❌ 4순위 실패: AI 좌표 추정 오류 -`, error);
  }
  
  // 5순위: 기본 좌표 반환 (지역별 중심부)
  console.log(`🎯 5순위: 기본 좌표 사용`);
  const defaultCoordinates = getDefaultCoordinates(locationName, ctx);
  console.log(`✅ 기본 좌표 적용: ${defaultCoordinates.lat}, ${defaultCoordinates.lng}`);
  return defaultCoordinates;
}

/**
 * 🌍 컨텍스트 정보를 활용한 장소명 생성
 */
function buildContextualLocationName(context: LocationContext): string {
  const { locationName, parentRegion, countryCode } = context;
  
  // 지역과 국가 정보가 모두 있는 경우
  if (parentRegion && countryCode) {
    return `${locationName}, ${parentRegion}, ${getCountryName(countryCode)}`;
  }
  
  // 지역 정보만 있는 경우
  if (parentRegion) {
    return `${locationName}, ${parentRegion}`;
  }
  
  // 국가 정보만 있는 경우
  if (countryCode) {
    return `${locationName}, ${getCountryName(countryCode)}`;
  }
  
  // 컨텍스트 정보가 없는 경우
  return locationName;
}

/**
 * 🌍 국가 코드를 국가명으로 변환
 */
function getCountryName(countryCode: string): string {
  const countryNames: { [key: string]: string } = {
    'KR': 'South Korea',
    'US': 'United States',
    'FR': 'France',
    'GB': 'United Kingdom',
    'IT': 'Italy',
    'JP': 'Japan',
    'CN': 'China',
    'DE': 'Germany',
    'ES': 'Spain',
    'AU': 'Australia',
    'CA': 'Canada',
    'IN': 'India',
    'TH': 'Thailand',
    'SG': 'Singapore',
    'MY': 'Malaysia'
  };
  
  return countryNames[countryCode] || countryCode;
}

/**
 * 🔍 1순위: Google Places API를 이용한 플러스코드 기반 검색
 * 실제 가이드 생성 API와 동일한 로직 사용 + 지역 컨텍스트 지원
 */
async function searchWithPlusCode(locationName: string, context?: LocationContext): Promise<{ lat: number; lng: number } | null> {
  const { smartPlacesSearch } = await import('@/lib/coordinates/google-places-integration');
  
  // 전세계 호환 플러스코드 검색 쿼리들 (지역 컨텍스트 포함)
  const plusCodeQueries = [
    `${locationName} plus code`,
    `${locationName} entrance`,
    `${locationName} visitor center`,
    `${locationName} main gate`,
    `${locationName}`
  ];
  
  // 지역 바이어스 설정 (국가별 중심 좌표)
  const locationBias = getLocationBias(context?.countryCode);
  
  for (const query of plusCodeQueries) {
    try {
      console.log(`  🔍 플러스코드 검색 시도: "${query}"`);
      const result = await smartPlacesSearch(query, context?.language || 'en', locationBias);
      
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
 * 🌍 국가별 위치 바이어스 설정
 */
function getLocationBias(countryCode?: string): { lat: number; lng: number; radius: number } | undefined {
  if (!countryCode) return undefined;
  
  const locationBiases: { [key: string]: { lat: number; lng: number; radius: number } } = {
    'KR': { lat: 37.5665, lng: 126.9780, radius: 100000 }, // 서울 중심, 100km 반경
    'US': { lat: 39.8283, lng: -98.5795, radius: 2000000 }, // 미국 중심, 2000km 반경
    'FR': { lat: 46.6034, lng: 1.8883, radius: 500000 }, // 프랑스 중심, 500km 반경
    'GB': { lat: 55.3781, lng: -3.4360, radius: 300000 }, // 영국 중심, 300km 반경
    'IT': { lat: 41.8719, lng: 12.5674, radius: 500000 }, // 이탈리아 중심, 500km 반경
    'JP': { lat: 36.2048, lng: 138.2529, radius: 500000 }, // 일본 중심, 500km 반경
    'CN': { lat: 35.8617, lng: 104.1954, radius: 2000000 }, // 중국 중심, 2000km 반경
  };
  
  return locationBiases[countryCode];
}

/**
 * 🏢 2순위: Places API 상세 검색 (장소명 + 입구/entrance) - 전세계 호환 + 지역 컨텍스트
 */
async function searchPlacesDetailed(locationName: string, context?: LocationContext): Promise<{ lat: number; lng: number } | null> {
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
  
  const locationBias = getLocationBias(context?.countryCode);
  
  for (const query of searchQueries) {
    try {
      console.log(`  🔍 Places API 상세 검색 시도: "${query}"`);
      const result = await smartPlacesSearch(query, context?.language || 'en', locationBias);
      
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
 * 🏢 3순위: Places API 기본 검색 (장소명만) - 전세계 호환 + 지역 컨텍스트
 */
async function searchPlacesBasic(locationName: string, context?: LocationContext): Promise<{ lat: number; lng: number } | null> {
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
  
  const locationBias = getLocationBias(context?.countryCode);
  
  for (const query of searchQueries) {
    try {
      console.log(`  🔍 Places API 기본 검색 시도: "${query}"`);
      const result = await smartPlacesSearch(query, context?.language || 'en', locationBias);
      
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

/**
 * 🤖 4순위: AI를 통한 좌표 추정 시도 + 지역 컨텍스트 지원
 */
async function getCoordinatesFromAI(locationName: string, context?: LocationContext): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return null;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 컨텍스트 정보를 포함한 상세한 프롬프트
    const contextInfo = context?.parentRegion || context?.countryCode 
      ? `in ${context.parentRegion ? context.parentRegion + ', ' : ''}${context.countryCode ? getCountryName(context.countryCode) : ''}`
      : '';

    const coordinatePrompt = `
Please provide the exact GPS coordinates (latitude and longitude) for: "${locationName}" ${contextInfo}

Important: Please be specific about the location based on the regional context provided.

Respond ONLY in this format:
LAT: [latitude]
LNG: [longitude]

Example:
LAT: 37.5665
LNG: 126.9780
`;

    const result = await model.generateContent(coordinatePrompt);
    const response = result.response.text();
    
    console.log(`🤖 AI 좌표 응답: ${response}`);
    
    // LAT: 37.5665, LNG: 126.9780 형식에서 좌표 추출
    const latMatch = response.match(/LAT:\s*([-+]?\d{1,3}\.\d{4,8})/i);
    const lngMatch = response.match(/LNG:\s*([-+]?\d{1,3}\.\d{4,8})/i);
    
    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      // 좌표 유효성 검증 (위도: -90~90, 경도: -180~180)
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log(`✅ AI 좌표 추정 성공: ${lat}, ${lng}`);
        return { lat, lng };
      } else {
        console.log(`❌ AI 좌표 범위 초과: lat=${lat}, lng=${lng}`);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ AI 좌표 추정 실패:', error);
    return null;
  }
}

/**
 * 🎯 5순위: 기본 좌표 반환 (지역별 중심 좌표) - 컨텍스트 지원
 */
function getDefaultCoordinates(locationName: string, context?: LocationContext): { lat: number; lng: number } {
  const name = locationName.toLowerCase();
  
  // 1. 컨텍스트 국가 코드 우선 적용
  if (context?.countryCode) {
    const countryDefaults = getDefaultCoordinatesByCountry(context.countryCode);
    if (countryDefaults) {
      console.log(`🌍 국가 코드 기반 기본 좌표: ${context.countryCode}`);
      return countryDefaults;
    }
  }
  
  // 2. 지역별 세부 좌표 매핑 (한국)
  if (name.includes('서울') || name.includes('seoul')) {
    return { lat: 37.5665, lng: 126.9780 }; // 서울 시청
  } else if (name.includes('부산') || name.includes('busan')) {
    return { lat: 35.1796, lng: 129.0756 }; // 부산 시청
  } else if (name.includes('인천') || name.includes('incheon')) {
    return { lat: 37.4563, lng: 126.7052 }; // 인천 시청
  } else if (name.includes('대구') || name.includes('daegu')) {
    return { lat: 35.8714, lng: 128.6014 }; // 대구 시청
  } else if (name.includes('대전') || name.includes('daejeon')) {
    return { lat: 36.3504, lng: 127.3845 }; // 대전 시청
  } else if (name.includes('광주') || name.includes('gwangju')) {
    return { lat: 35.1595, lng: 126.8526 }; // 광주 시청
  } else if (name.includes('울산') || name.includes('ulsan')) {
    return { lat: 35.5384, lng: 129.3114 }; // 울산 시청
  } else if (name.includes('제주') || name.includes('jeju')) {
    return { lat: 33.4996, lng: 126.5312 }; // 제주 시청
  }
  
  // 3. 해외 주요 도시 매핑
  else if (name.includes('paris') || name.includes('파리')) {
    return { lat: 48.8566, lng: 2.3522 }; // 파리 중심부
  } else if (name.includes('london') || name.includes('런던')) {
    return { lat: 51.5074, lng: -0.1278 }; // 런던 중심부
  } else if (name.includes('tokyo') || name.includes('도쿄')) {
    return { lat: 35.6762, lng: 139.6503 }; // 도쿄 중심부
  } else if (name.includes('new york') || name.includes('뉴욕')) {
    return { lat: 40.7128, lng: -74.0060 }; // 뉴욕 중심부
  } else if (name.includes('beijing') || name.includes('베이징')) {
    return { lat: 39.9042, lng: 116.4074 }; // 베이징 중심부
  }
  
  // 4. 기본값: 서울 중심부 (또는 컨텍스트 지역)
  return { lat: 37.5665, lng: 126.9780 };
}

/**
 * 🌍 국가별 기본 좌표 반환
 */
function getDefaultCoordinatesByCountry(countryCode: string): { lat: number; lng: number } | null {
  const countryDefaults: { [key: string]: { lat: number; lng: number } } = {
    'KR': { lat: 37.5665, lng: 126.9780 }, // 서울, 대한민국
    'US': { lat: 39.8283, lng: -98.5795 }, // 미국 중심부
    'FR': { lat: 48.8566, lng: 2.3522 },   // 파리, 프랑스
    'GB': { lat: 51.5074, lng: -0.1278 },  // 런던, 영국
    'IT': { lat: 41.9028, lng: 12.4964 },  // 로마, 이탈리아
    'JP': { lat: 35.6762, lng: 139.6503 }, // 도쿄, 일본
    'CN': { lat: 39.9042, lng: 116.4074 }, // 베이징, 중국
    'DE': { lat: 52.5200, lng: 13.4050 },  // 베를린, 독일
    'ES': { lat: 40.4168, lng: -3.7038 },  // 마드리드, 스페인
    'AU': { lat: -35.2809, lng: 149.1300 }, // 캔버라, 호주
    'CA': { lat: 45.4215, lng: -75.6972 }, // 오타와, 캐나다
  };
  
  return countryDefaults[countryCode] || null;
}

/**
 * 📍 챕터별 좌표 배열 생성 (기존 로직 재사용)
 */
export function generateCoordinatesArray(
  chapters: any[], 
  baseCoordinates: { lat: number; lng: number }
): any[] {
  const coordinatesArray: any[] = [];
  
  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return coordinatesArray;
  }
  
  console.log(`📊 ${chapters.length}개 챕터에서 좌표 배열 생성`);
  
  chapters.forEach((chapter: any, index: number) => {
    const offset = index * 0.0005; // 챕터별 약간의 오프셋 (약 50미터)
    const chapterCoords = {
      id: chapter.id !== undefined ? chapter.id : index,
      chapterId: chapter.id !== undefined ? chapter.id : index,
      step: index,
      title: chapter.title || `챕터 ${index + 1}`,
      lat: baseCoordinates.lat + offset,
      lng: baseCoordinates.lng + offset,
      coordinates: {
        lat: baseCoordinates.lat + offset,
        lng: baseCoordinates.lng + offset
      }
    };
    
    coordinatesArray.push(chapterCoords);
    
    console.log(`  ✅ 챕터 ${chapterCoords.id}: "${chapterCoords.title}" → ${chapterCoords.lat}, ${chapterCoords.lng}`);
  });
  
  return coordinatesArray;
}

/**
 * 🔍 content에서 챕터 정보 추출
 */
export function extractChaptersFromContent(content: any): any[] {
  if (!content) return [];
  
  // 중첩된 content.content.realTimeGuide.chapters 확인 (현재 DB 구조)
  if (content.content?.realTimeGuide?.chapters && Array.isArray(content.content.realTimeGuide.chapters)) {
    console.log(`🔍 중첩 구조에서 ${content.content.realTimeGuide.chapters.length}개 챕터 발견`);
    return content.content.realTimeGuide.chapters.filter((chapter: any) => 
      chapter && 
      (chapter.id !== undefined && chapter.id !== null) && 
      chapter.title && 
      chapter.title.trim()
    );
  }
  
  // realTimeGuide.chapters 우선 확인 (기본 구조)
  if (content.realTimeGuide?.chapters && Array.isArray(content.realTimeGuide.chapters)) {
    console.log(`🔍 기본 구조에서 ${content.realTimeGuide.chapters.length}개 챕터 발견`);
    return content.realTimeGuide.chapters.filter((chapter: any) => 
      chapter && 
      (chapter.id !== undefined && chapter.id !== null) && 
      chapter.title && 
      chapter.title.trim()
    );
  }
  
  // route.steps 확인 (구버전 호환성)
  if (content.route?.steps && Array.isArray(content.route.steps)) {
    return content.route.steps.map((step: any, index: number) => ({
      id: index,
      title: step.title || step.location || `챕터 ${index + 1}`,
      narrative: step.description || step.narrative || `${step.title || step.location}에 대한 설명입니다.`
    }));
  }
  
  return [];
}
// src/lib/coordinates/plus-code-search.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🎯 Plus Code 전용 좌표 검색 시스템
 * Google Places API 의존성 최소화하고 구조화된 지역 데이터 활용
 */

export interface EnhancedLocationData {
  name: string;          // 장소명
  location: string;      // 상세 위치 (기존 호환성)
  region: string;        // 지역/도시
  country: string;       // 국가명  
  countryCode: string;   // 국가 코드 (KR, US, FR 등)
  type: 'location' | 'attraction'; // 위치 타입
}

export interface CoordinateResult {
  lat: number;
  lng: number;
  source: 'plus_code' | 'ai_estimation' | 'default_fallback';
  confidence: number;
}

/**
 * 🚀 Plus Code 전용 좌표 검색 (기존 1-5순위 시스템 단순화)
 */
export async function searchWithPlusCodeOnly(
  locationData: EnhancedLocationData
): Promise<CoordinateResult> {
  console.log(`🔍 Plus Code 전용 좌표 검색 시작:`, locationData);
  
  // 1순위: Plus Code 기반 Google Places 검색
  try {
    console.log(`🔍 1순위: Plus Code 검색 시도`);
    const plusCodeResult = await searchPlacesWithPlusCode(locationData);
    if (plusCodeResult) {
      console.log(`✅ 1순위 성공: Plus Code 검색`);
      return {
        lat: plusCodeResult.lat,
        lng: plusCodeResult.lng,
        source: 'plus_code',
        confidence: 0.95
      };
    }
  } catch (error) {
    console.log(`❌ 1순위 실패: Plus Code 검색 오류`, error);
  }
  
  // 2순위: AI 좌표 추정 (지역 컨텍스트 활용)
  try {
    console.log(`🔍 2순위: AI 좌표 추정 시도`);
    const aiResult = await getCoordinatesFromAI(locationData);
    if (aiResult) {
      console.log(`✅ 2순위 성공: AI 추정`);
      return {
        lat: aiResult.lat,
        lng: aiResult.lng,
        source: 'ai_estimation',
        confidence: 0.8
      };
    }
  } catch (error) {
    console.log(`❌ 2순위 실패: AI 추정 오류`, error);
  }
  
  // 3순위: 국가별 기본 좌표 (마지막 수단)
  console.log(`🎯 3순위: 국가별 기본 좌표 사용`);
  const defaultCoordinates = getDefaultCoordinatesByCountry(locationData.countryCode);
  console.log(`✅ 기본 좌표 적용: ${defaultCoordinates.lat}, ${defaultCoordinates.lng}`);
  
  return {
    lat: defaultCoordinates.lat,
    lng: defaultCoordinates.lng,
    source: 'default_fallback',
    confidence: 0.3
  };
}

/**
 * 🔍 1순위: Plus Code 기반 Google Places 검색
 */
async function searchPlacesWithPlusCode(
  locationData: EnhancedLocationData
): Promise<{ lat: number; lng: number } | null> {
  try {
    const { smartPlacesSearch } = await import('@/lib/coordinates/google-places-integration');
    
    // 지역 컨텍스트를 활용한 정확한 검색 쿼리 구성
    const searchQueries = buildSearchQueries(locationData);
    
    // 국가별 위치 바이어스 설정
    const locationBias = getLocationBias(locationData.countryCode);
    
    for (const query of searchQueries) {
      try {
        console.log(`  🔍 Plus Code 검색: "${query}"`);
        const result = await smartPlacesSearch(query, 'en', locationBias);
        
        if (result && result.coordinates) {
          // Plus Code 존재 여부 확인 (정확도 검증)
          if (result.plus_code || result.formatted_address) {
            console.log(`✅ Plus Code 검색 성공: ${result.coordinates.lat}, ${result.coordinates.lng}`);
            return {
              lat: result.coordinates.lat,
              lng: result.coordinates.lng
            };
          }
        }
      } catch (error) {
        console.log(`  ❌ Plus Code 검색 실패: ${query}`, error);
      }
      
      // API 호출 제한을 위한 대기
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return null;
  } catch (error) {
    console.error('Plus Code 검색 중 오류:', error);
    return null;
  }
}

/**
 * 🌍 지역 컨텍스트 기반 검색 쿼리 생성
 */
function buildSearchQueries(locationData: EnhancedLocationData): string[] {
  const queries: string[] = [];
  
  // 1단계: 완전한 지역 정보 활용
  if (locationData.region && locationData.region !== '미분류') {
    queries.push(
      `${locationData.name}, ${locationData.region}, ${locationData.country}`,
      `${locationData.name} ${locationData.region} ${locationData.country}`,
      `${locationData.name}, ${locationData.region}`
    );
  }
  
  // 2단계: 국가별 맞춤 검색어
  if (locationData.countryCode === 'CN') {
    // 중국 특화 검색어
    queries.push(
      `${locationData.name} China`,
      `${locationData.name} tourist attraction China`,
      `${locationData.name} entrance China`
    );
  } else if (locationData.countryCode === 'KOR') {
    // 한국 특화 검색어
    queries.push(
      `${locationData.name} Korea`,
      `${locationData.name} 관광지`,
      `${locationData.name} 입구`
    );
  } else {
    // 기타 국가
    queries.push(
      `${locationData.name} ${locationData.country}`,
      `${locationData.name} tourist attraction`,
      `${locationData.name} entrance`
    );
  }
  
  // 3단계: 기본 검색어
  queries.push(locationData.name);
  
  // 중복 제거 및 유효성 검증
  return [...new Set(queries)].filter(query => query && query.length > 2);
}

/**
 * 🌍 국가별 위치 바이어스 설정
 */
function getLocationBias(countryCode: string): { lat: number; lng: number; radius: number } | undefined {
  const locationBiases: { [key: string]: { lat: number; lng: number; radius: number } } = {
    // 아시아-태평양 (3자리 코드)
    'CHN': { lat: 39.9042, lng: 116.4074, radius: 1000000 }, // 베이징 중심, 1000km 반경
    'JPN': { lat: 35.6762, lng: 139.6503, radius: 500000 }, // 도쿄 중심, 500km 반경
    'THA': { lat: 13.7563, lng: 100.5018, radius: 300000 }, // 방콕 중심, 300km 반경
    'VNM': { lat: 21.0285, lng: 105.8542, radius: 300000 }, // 하노이 중심, 300km 반경
    'IDN': { lat: -6.2088, lng: 106.8456, radius: 800000 }, // 자카르타 중심, 800km 반경
    'IND': { lat: 20.5937, lng: 78.9629, radius: 1500000 }, // 인도 중심, 1500km 반경
    'AUS': { lat: -25.2744, lng: 133.7751, radius: 2000000 }, // 호주 중심, 2000km 반경
    'SGP': { lat: 1.3521, lng: 103.8198, radius: 50000 }, // 싱가포르, 50km 반경
    'MYS': { lat: 4.2105, lng: 101.9758, radius: 200000 }, // 쿠알라룸푸르, 200km 반경
    'PHL': { lat: 14.5995, lng: 120.9842, radius: 400000 }, // 마닐라 중심, 400km 반경
    
    // 북미 (3자리 코드)
    'USA': { lat: 39.8283, lng: -98.5795, radius: 2000000 }, // 미국 중심, 2000km 반경
    'CAN': { lat: 56.1304, lng: -106.3468, radius: 2000000 }, // 캐나다 중심, 2000km 반경
    'MEX': { lat: 23.6345, lng: -102.5528, radius: 800000 }, // 멕시코 중심, 800km 반경
    
    // 남미 (3자리 코드)
    'BRA': { lat: -14.2350, lng: -51.9253, radius: 1500000 }, // 브라질 중심, 1500km 반경
    'ARG': { lat: -38.4161, lng: -63.6167, radius: 800000 }, // 아르헨티나 중심, 800km 반경
    'CHL': { lat: -35.6751, lng: -71.5430, radius: 600000 }, // 칠레 중심, 600km 반경
    'COL': { lat: 4.5709, lng: -74.2973, radius: 400000 }, // 콜롬비아 중심, 400km 반경
    'PER': { lat: -9.19, lng: -75.0152, radius: 400000 }, // 페루 중심, 400km 반경
    
    // 유럽 (3자리 코드)
    'FRA': { lat: 46.6034, lng: 1.8883, radius: 500000 }, // 프랑스 중심, 500km 반경
    'GBR': { lat: 55.3781, lng: -3.4360, radius: 300000 }, // 영국 중심, 300km 반경
    'ITA': { lat: 41.8719, lng: 12.5674, radius: 500000 }, // 이탈리아 중심, 500km 반경
    'DEU': { lat: 52.5200, lng: 13.4050, radius: 500000 }, // 독일 중심, 500km 반경
    'ESP': { lat: 40.4168, lng: -3.7038, radius: 500000 }, // 스페인 중심, 500km 반경
    'RUS': { lat: 61.5240, lng: 105.3188, radius: 3000000 }, // 러시아 중심, 3000km 반경
    'POL': { lat: 51.9194, lng: 19.1451, radius: 300000 }, // 폴란드 중심, 300km 반경
    'NLD': { lat: 52.1326, lng: 5.2913, radius: 100000 }, // 네덜란드 중심, 100km 반경
    'CHE': { lat: 46.8182, lng: 8.2275, radius: 100000 }, // 스위스 중심, 100km 반경
    'AUT': { lat: 47.5162, lng: 14.5501, radius: 200000 }, // 오스트리아 중심, 200km 반경
    'GRC': { lat: 39.0742, lng: 21.8243, radius: 300000 }, // 그리스 중심, 300km 반경
    'PRT': { lat: 39.3999, lng: -8.2245, radius: 200000 }, // 포르투갈 중심, 200km 반경
    
    // 중동 (3자리 코드)
    'TUR': { lat: 38.9637, lng: 35.2433, radius: 400000 }, // 터키 중심, 400km 반경
    'ARE': { lat: 23.4241, lng: 53.8478, radius: 200000 }, // UAE 중심, 200km 반경
    'SAU': { lat: 23.8859, lng: 45.0792, radius: 800000 }, // 사우디 중심, 800km 반경
    'EGY': { lat: 26.0975, lng: 31.4735, radius: 500000 }, // 이집트 중심, 500km 반경
    'ISR': { lat: 31.0461, lng: 34.8516, radius: 100000 }, // 이스라엘 중심, 100km 반경
    'JOR': { lat: 30.5852, lng: 36.2384, radius: 200000 }, // 요단 중심, 200km 반경
    
    // 아프리카 (3자리 코드)
    'ZAF': { lat: -30.5595, lng: 22.9375, radius: 600000 }, // 남아공 중심, 600km 반경
    'KEN': { lat: -0.0236, lng: 37.9062, radius: 300000 }, // 케냐 중심, 300km 반경
    'ETH': { lat: 9.1450, lng: 40.4897, radius: 500000 }, // 에티오피아 중심, 500km 반경
    'GHA': { lat: 7.9465, lng: -1.0232, radius: 200000 }, // 가나 중심, 200km 반경
    'NGA': { lat: 9.0820, lng: 8.6753, radius: 500000 }, // 나이지리아 중심, 500km 반경
    'MAR': { lat: 31.7917, lng: -7.0926, radius: 300000 } // 모로코 중심, 300km 반경
  };
  
  return locationBiases[countryCode];
}

/**
 * 🤖 2순위: AI 좌표 추정 (지역 컨텍스트 활용)
 */
async function getCoordinatesFromAI(
  locationData: EnhancedLocationData
): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return null;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // 구조화된 지역 컨텍스트 활용
    const coordinatePrompt = `
Please provide the exact GPS coordinates for this location:

Location: "${locationData.name}"
Region: "${locationData.region}"
Country: "${locationData.country}" (${locationData.countryCode})
Type: ${locationData.type}

Context: This is a ${locationData.type} located in ${locationData.region}, ${locationData.country}.
Please be very specific about the exact coordinates for this ${locationData.type}.

Respond ONLY in this format:
LAT: [latitude]
LNG: [longitude]

Example:
LAT: 40.4319
LNG: 116.5704
`;

    const result = await model.generateContent(coordinatePrompt);
    const response = result.response.text();
    
    console.log(`🤖 AI 좌표 응답: ${response}`);
    
    // 좌표 추출
    const latMatch = response.match(/LAT:\s*([-+]?\d{1,3}\.\d{4,8})/i);
    const lngMatch = response.match(/LNG:\s*([-+]?\d{1,3}\.\d{4,8})/i);
    
    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      // 좌표 유효성 검증
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
 * 🌍 3순위: 국가별 기본 좌표
 */
function getDefaultCoordinatesByCountry(countryCode: string): { lat: number; lng: number } {
  const countryDefaults: { [key: string]: { lat: number; lng: number } } = {
    'KOR': { lat: 37.5665, lng: 126.9780 }, // 서울, 대한민국
    'CHN': { lat: 39.9042, lng: 116.4074 }, // 베이징, 중국
    'JPN': { lat: 35.6762, lng: 139.6503 }, // 도쿄, 일본
    'USA': { lat: 39.8283, lng: -98.5795 }, // 미국 중심부
    'FRA': { lat: 48.8566, lng: 2.3522 },   // 파리, 프랑스
    'GBR': { lat: 51.5074, lng: -0.1278 },  // 런던, 영국
    'ITA': { lat: 41.9028, lng: 12.4964 },  // 로마, 이탈리아
    'DE': { lat: 52.5200, lng: 13.4050 },  // 베를린, 독일
    'ES': { lat: 40.4168, lng: -3.7038 },  // 마드리드, 스페인
    'AU': { lat: -35.2809, lng: 149.1300 }, // 캔버라, 호주
    'CA': { lat: 45.4215, lng: -75.6972 }, // 오타와, 캐나다
    'TH': { lat: 13.7563, lng: 100.5018 }, // 방콕, 태국
  };
  
  return countryDefaults[countryCode] || null; // 🔥 기본값 제거: 폴백 좌표 없음
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
 * 🎯 통합 Plus Code 좌표 생성 함수
 */
export async function generatePlusCodeCoordinates(
  locationData: EnhancedLocationData,
  guideData: any
): Promise<{
  baseCoordinates: CoordinateResult;
  coordinatesArray: any[];
  source: string;
}> {
  console.log(`🎯 Plus Code 통합 좌표 생성 시작:`, locationData);
  
  // 1단계: Plus Code 전용 시스템으로 기본 좌표 찾기
  const baseCoordinates = await searchWithPlusCodeOnly(locationData);
  
  // 2단계: 챕터 정보 추출 (기존 함수 재사용)
  const { extractChaptersFromContent } = await import('@/lib/coordinates/coordinate-utils');
  const chapters = extractChaptersFromContent(guideData);
  
  // 3단계: 챕터별 좌표 배열 생성
  const coordinatesArray = generateCoordinatesArray(chapters, baseCoordinates);
  
  console.log(`✅ Plus Code 좌표 생성 완료: ${baseCoordinates.source}, ${coordinatesArray.length}개 챕터`);
  
  return {
    baseCoordinates,
    coordinatesArray,
    source: `plus_code_system_${baseCoordinates.source}_confidence_${Math.round(baseCoordinates.confidence * 100)}%`
  };
}
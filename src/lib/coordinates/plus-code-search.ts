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
  } else if (locationData.countryCode === 'KR') {
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
    // 🔥 'KR': { lat: 37.5665, lng: 126.9780, radius: 100000 }, // 서울 중심 바이어스 제거
    'CN': { lat: 39.9042, lng: 116.4074, radius: 1000000 }, // 베이징 중심, 1000km 반경
    'JP': { lat: 35.6762, lng: 139.6503, radius: 500000 }, // 도쿄 중심, 500km 반경
    'US': { lat: 39.8283, lng: -98.5795, radius: 2000000 }, // 미국 중심, 2000km 반경
    'FR': { lat: 46.6034, lng: 1.8883, radius: 500000 }, // 프랑스 중심, 500km 반경
    'GB': { lat: 55.3781, lng: -3.4360, radius: 300000 }, // 영국 중심, 300km 반경
    'IT': { lat: 41.8719, lng: 12.5674, radius: 500000 }, // 이탈리아 중심, 500km 반경
    'DE': { lat: 52.5200, lng: 13.4050, radius: 500000 }, // 독일 중심, 500km 반경
    'ES': { lat: 40.4168, lng: -3.7038, radius: 500000 }, // 스페인 중심, 500km 반경
    'TH': { lat: 13.7563, lng: 100.5018, radius: 300000 }, // 태국 중심, 300km 반경
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
    'KR': { lat: 37.5665, lng: 126.9780 }, // 서울, 대한민국
    'CN': { lat: 39.9042, lng: 116.4074 }, // 베이징, 중국
    'JP': { lat: 35.6762, lng: 139.6503 }, // 도쿄, 일본
    'US': { lat: 39.8283, lng: -98.5795 }, // 미국 중심부
    'FR': { lat: 48.8566, lng: 2.3522 },   // 파리, 프랑스
    'GB': { lat: 51.5074, lng: -0.1278 },  // 런던, 영국
    'IT': { lat: 41.9028, lng: 12.4964 },  // 로마, 이탈리아
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
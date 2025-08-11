/**
 * 동적 위치 분류 시스템
 * 
 * DB와 AI를 활용하여 실시간으로 위치를 분류합니다.
 * 정적 데이터에 없는 장소도 자동으로 처리합니다.
 */

import { supabase } from '@/lib/supabaseClient';
import { classifyLocation, LocationData, PageType, determinePageType } from './location-classification';

interface LocationClassificationCache {
  [key: string]: {
    locationData: LocationData;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  };
}

// 메모리 캐시 (30분 TTL)
const cache: LocationClassificationCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Google Places API를 사용하여 위치 정보 조회
 */
async function getLocationInfoFromGoogle(locationName: string): Promise<LocationData | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(locationName)}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=ko`
    );
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results.length) {
      return null;
    }
    
    const place = data.results[0];
    const types = place.types || [];
    
    // Google Places API 타입을 우리 시스템에 맞게 변환
    const locationType = classifyGooglePlaceType(types);
    const level = getLocationLevel(locationType);
    
    return {
      type: locationType,
      level,
      country: extractCountryFromAddress(place.formatted_address),
      parent: extractParentFromAddress(place.formatted_address),
      aliases: [place.name, locationName],
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      popularity: calculatePopularityFromGoogle(place)
    };
    
  } catch (error) {
    console.warn('Google Places API 조회 실패:', error);
    return null;
  }
}

/**
 * Google Places API 타입을 우리 시스템에 맞게 분류
 */
function classifyGooglePlaceType(types: string[]): LocationData['type'] {
  // 우선순위 순으로 매핑
  const typeMapping: Record<string, LocationData['type']> = {
    // 국가/지역
    'country': 'country',
    'administrative_area_level_1': 'province',
    'locality': 'city',
    'sublocality': 'district',
    
    // 관광지/명소
    'tourist_attraction': 'attraction',
    'museum': 'landmark',
    'park': 'landmark',
    'place_of_worship': 'landmark',
    'cemetery': 'landmark',
    'zoo': 'attraction',
    'amusement_park': 'attraction',
    'aquarium': 'attraction',
    'casino': 'attraction',
    'night_club': 'attraction',
    'shopping_mall': 'attraction',
    'stadium': 'landmark',
    'university': 'landmark',
    'hospital': 'landmark',
    'airport': 'landmark',
    'train_station': 'landmark',
    'bus_station': 'landmark',
    'subway_station': 'landmark',
    
    // 상업지역/구역
    'neighborhood': 'district',
    'sublocality_level_1': 'district',
    'route': 'district'
  };
  
  // 우선순위 순으로 확인
  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }
  
  // 기본값: landmark (구체적인 장소로 간주)
  return 'landmark';
}

/**
 * 위치 타입에 따른 레벨 결정
 */
function getLocationLevel(type: LocationData['type']): number {
  const levelMapping: Record<LocationData['type'], number> = {
    'country': 1,
    'province': 2,
    'city': 3,
    'district': 4,
    'landmark': 4,
    'attraction': 4
  };
  
  return levelMapping[type] || 4;
}

/**
 * 주소에서 국가 추출
 */
function extractCountryFromAddress(address: string): string {
  if (address.includes('대한민국') || address.includes('South Korea') || address.includes('Korea')) {
    return '한국';
  }
  if (address.includes('Japan') || address.includes('日本')) {
    return '일본';
  }
  if (address.includes('China') || address.includes('中国')) {
    return '중국';
  }
  if (address.includes('France')) {
    return '프랑스';
  }
  if (address.includes('United States') || address.includes('USA')) {
    return '미국';
  }
  
  // 기본값 또는 더 정교한 파싱 로직
  return '알 수 없음';
}

/**
 * 주소에서 부모 지역 추출
 */
function extractParentFromAddress(address: string): string | undefined {
  const parts = address.split(', ');
  if (parts.length >= 2) {
    return parts[parts.length - 2]; // 마지막에서 두 번째 (국가 제외)
  }
  return undefined;
}

/**
 * Google Places 데이터에서 인기도 계산
 */
function calculatePopularityFromGoogle(place: any): number {
  let popularity = 5; // 기본값
  
  // 평점이 있으면 고려
  if (place.rating) {
    popularity = Math.min(Math.max(Math.round(place.rating * 2), 1), 10);
  }
  
  // 리뷰 수가 많으면 인기도 증가
  if (place.user_ratings_total > 1000) {
    popularity = Math.min(popularity + 1, 10);
  }
  if (place.user_ratings_total > 5000) {
    popularity = Math.min(popularity + 1, 10);
  }
  
  return popularity;
}

/**
 * DB에서 기존 가이드 존재 여부 확인
 */
async function checkGuideExistsInDB(locationName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id')
      .eq('locationname', locationName)
      .limit(1);
    
    if (error) {
      console.warn('DB 가이드 조회 오류:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.warn('DB 가이드 조회 실패:', error);
    return false;
  }
}

/**
 * AI를 사용한 위치 분류 (최후 수단)
 */
async function classifyLocationWithAI(locationName: string): Promise<LocationData | null> {
  try {
    const prompt = `다음 장소를 분석하여 분류해주세요: "${locationName}"

다음 중 하나로 분류하고, JSON 형태로 답변해주세요:
- country (국가)
- province (지역/주)  
- city (도시)
- district (구역/동네)
- landmark (명소/건물)
- attraction (관광지/테마파크)

응답 형식:
{
  "type": "landmark",
  "level": 4,
  "country": "한국",
  "reasoning": "분류 이유"
}`;

    // 실제 구현에서는 OpenAI API 등을 사용
    // 여기서는 간단한 휴리스틱 사용
    const result = classifyByHeuristics(locationName);
    
    return result;
    
  } catch (error) {
    console.warn('AI 분류 실패:', error);
    return null;
  }
}

/**
 * 휴리스틱 기반 분류 (AI 대신 임시 사용)
 */
function classifyByHeuristics(locationName: string): LocationData {
  // 간단한 키워드 기반 분류
  if (locationName.includes('관광단지') || locationName.includes('리조트') || locationName.includes('테마파크')) {
    return {
      type: 'attraction',
      level: 4,
      country: '한국',
      aliases: [locationName],
      coordinates: { lat: 0, lng: 0 }, // 실제로는 Google에서 가져옴
      popularity: 6
    };
  }
  
  if (locationName.includes('궁') || locationName.includes('사') || locationName.includes('탑') || locationName.includes('박물관')) {
    return {
      type: 'landmark',
      level: 4,
      country: '한국',
      aliases: [locationName],
      coordinates: { lat: 0, lng: 0 },
      popularity: 7
    };
  }
  
  if (locationName.includes('시') || locationName.includes('구')) {
    return {
      type: 'city',
      level: 3,
      country: '한국',
      aliases: [locationName],
      coordinates: { lat: 0, lng: 0 },
      popularity: 6
    };
  }
  
  // 기본값: landmark
  return {
    type: 'landmark',
    level: 4,
    country: '한국',
    aliases: [locationName],
    coordinates: { lat: 0, lng: 0 },
    popularity: 5
  };
}

/**
 * 캐시에서 조회
 */
function getFromCache(locationName: string): LocationData | null {
  const key = locationName.toLowerCase().trim();
  const cached = cache[key];
  
  if (!cached) return null;
  
  // TTL 체크
  if (Date.now() - cached.timestamp > cached.ttl) {
    delete cache[key];
    return null;
  }
  
  return cached.locationData;
}

/**
 * 캐시에 저장
 */
function saveToCache(locationName: string, locationData: LocationData, ttl: number = CACHE_TTL): void {
  const key = locationName.toLowerCase().trim();
  cache[key] = {
    locationData,
    timestamp: Date.now(),
    ttl
  };
}

/**
 * 메인 동적 위치 분류 함수
 */
export async function classifyLocationDynamic(locationName: string): Promise<{
  locationData: LocationData | null;
  pageType: PageType;
  source: 'static' | 'cache' | 'google' | 'db' | 'ai' | 'fallback';
  confidence: number;
}> {
  const normalizedName = locationName.trim();
  
  // 1단계: 정적 데이터에서 확인
  const staticResult = classifyLocation(normalizedName);
  if (staticResult) {
    return {
      locationData: staticResult,
      pageType: determinePageType(staticResult),
      source: 'static',
      confidence: 0.95
    };
  }
  
  // 2단계: 캐시에서 확인
  const cachedResult = getFromCache(normalizedName);
  if (cachedResult) {
    return {
      locationData: cachedResult,
      pageType: determinePageType(cachedResult),
      source: 'cache',
      confidence: 0.9
    };
  }
  
  // 3단계: DB에 가이드가 있는지 확인
  const guideExists = await checkGuideExistsInDB(normalizedName);
  if (guideExists) {
    console.log(`📚 DB에 가이드 존재: ${normalizedName} - 상세 가이드 페이지로 분류`);
    
    // Google Places API로 상세 정보 조회
    let locationData = await getLocationInfoFromGoogle(normalizedName);
    
    if (!locationData) {
      // Google에서 못 찾으면 휴리스틱 사용
      locationData = classifyByHeuristics(normalizedName);
    }
    
    // 캐시에 저장
    saveToCache(normalizedName, locationData);
    
    return {
      locationData,
      pageType: 'DetailedGuidePage', // DB에 가이드가 있으면 무조건 상세 페이지
      source: 'db',
      confidence: 0.85
    };
  }
  
  // 4단계: Google Places API로 조회
  const googleResult = await getLocationInfoFromGoogle(normalizedName);
  if (googleResult) {
    // 캐시에 저장
    saveToCache(normalizedName, googleResult);
    
    return {
      locationData: googleResult,
      pageType: determinePageType(googleResult),
      source: 'google',
      confidence: 0.8
    };
  }
  
  // 5단계: AI 분류 (최후 수단)
  const aiResult = await classifyLocationWithAI(normalizedName);
  if (aiResult) {
    // 캐시에 저장 (TTL 짧게)
    saveToCache(normalizedName, aiResult, 10 * 60 * 1000); // 10분
    
    return {
      locationData: aiResult,
      pageType: determinePageType(aiResult),
      source: 'ai',
      confidence: 0.6
    };
  }
  
  // 6단계: 기본값 (DetailedGuidePage)
  console.log(`❓ 위치 분류 실패: ${normalizedName} - 기본값으로 상세 가이드 페이지 사용`);
  
  return {
    locationData: null,
    pageType: 'DetailedGuidePage', // 확실하지 않으면 가이드 페이지로
    source: 'fallback',
    confidence: 0.5
  };
}

/**
 * 캐시 통계 및 관리
 */
export function getCacheStats() {
  const now = Date.now();
  const validEntries = Object.values(cache).filter(
    entry => now - entry.timestamp < entry.ttl
  ).length;
  
  return {
    totalEntries: Object.keys(cache).length,
    validEntries,
    expiredEntries: Object.keys(cache).length - validEntries
  };
}

export function clearExpiredCache() {
  const now = Date.now();
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > cache[key].ttl) {
      delete cache[key];
    }
  });
}

export function clearAllCache() {
  Object.keys(cache).forEach(key => delete cache[key]);
}
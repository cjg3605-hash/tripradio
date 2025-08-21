/**
 * 동적 위치 분류 시스템
 * 
 * DB와 AI를 활용하여 실시간으로 위치를 분류합니다.
 * 정적 데이터에 없는 장소도 자동으로 처리합니다.
 */

import { supabase } from '@/lib/supabaseClient';
import { classifyLocation, LocationData, PageType, determinePageType } from './location-classification';
import { findGlobalLandmark, convertToLocationData, GLOBAL_LANDMARKS } from './global-landmark-classifier';
import { logger } from '../utils/logger';
import { checkCityDisambiguation } from './city-disambiguation';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * 서버 API를 통한 전세계 범용 지역정보 추출
 */
async function getLocationFromServerAPI(locationName: string): Promise<LocationData | null> {
  try {
    const response = await fetch('/api/locations/extract-regional-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        placeName: locationName,
        language: 'ko',
        detailed: false
      })
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('API 응답 데이터 없음');
    }

    const data = result.data;
    
    // 기본적으로 landmark로 분류하되, 명시적으로 도시인 경우만 city
    let detectedType: LocationData['type'] = 'landmark';
    
    // 도시 패턴 감지
    const cityPatterns = [
      'city', 'ville', 'ciudad', 'città', 'stadt', '시', '구',
      // 유명 도시들
      'paris', 'london', 'tokyo', 'new york', 'seoul', 'busan', 
      'sydney', 'rome', 'berlin', 'madrid', 'barcelona'
    ];
    
    const locationLower = locationName.toLowerCase();
    const isCity = cityPatterns.some(pattern => 
      locationLower.includes(pattern) || 
      locationLower === pattern ||
      data.city?.toLowerCase().includes(pattern)
    );
    
    if (isCity) {
      detectedType = 'city';
    }

    console.log(`🌍 서버 API 분류: "${locationName}" → ${detectedType} (${data.country}, ${data.region})`);

    return {
      type: detectedType,
      level: detectedType === 'city' ? 3 : 4,
      country: data.country || '알 수 없음',
      parent: data.region || '미분류',
      aliases: [locationName],
      coordinates: data.coordinates || { lat: 0, lng: 0 },
      popularity: 6
    };
    
  } catch (error) {
    console.warn('서버 API 호출 실패:', error);
    return null;
  }
}

/**
 * AI를 사용한 정확한 도시/명소 분류 (서버에서만 사용)
 */
async function classifyLocationWithAI(locationName: string): Promise<LocationData | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY 없음, 서버 API 사용');
      return await getLocationFromServerAPI(locationName);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 300,
        topP: 0.9,
        topK: 20
      }
    });

    const prompt = `전세계 지리학 전문가로서 다음 지명을 정확히 분류해주세요: "${locationName}"

🏙️ **CITY (도시) 기준 - 매우 엄격**:
- 전세계적으로 알려진 도시만: Seoul, Paris, London, Tokyo, New York, Sydney, Rio de Janeiro, Bangkok, Cairo, etc.
- 도시로 확실히 알려진 경우만: Brisbane (호주), Cambridge (영국), Alexandria (이집트) 등
- 도시면 무조건 RegionExploreHub로 보내야 함

🏛️ **LANDMARK (명소) 기준 - 기본값**:
- 모든 건물: Palace, Tower, Cathedral, Museum, Bridge, etc.
- 모든 구체적 장소: Sagrada Familia, Eiffel Tower, Christ the Redeemer, etc.
- 확실하지 않은 모든 것

⚠️ **절대 규칙**: 
1. 도시가 확실하면 → city
2. 조금이라도 의심되면 → landmark
3. 건물/구조물 이름이면 → landmark

JSON만 응답:
{
  "type": "city|landmark|country|province|district|attraction",
  "level": 3,
  "country": "국가명",
  "parent": "상위지역",
  "coordinates": {"lat": 0, "lng": 0},
  "popularity": 8,
  "reasoning": "분류 근거"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    console.log('🤖 AI 위치 분류 응답:', text);
    
    // JSON 파싱
    let jsonString = text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    
    const parsed = JSON.parse(jsonString);
    
    // 유효성 검사 및 변환
    if (!parsed.type) {
      throw new Error('type 필드 누락');
    }
    
    return {
      type: parsed.type as LocationData['type'],
      level: parsed.level || getLocationLevel(parsed.type),
      country: parsed.country || '알 수 없음',
      parent: parsed.parent || undefined,
      aliases: [locationName],
      coordinates: parsed.coordinates || { lat: 0, lng: 0 },
      popularity: parsed.popularity || 5
    };
    
  } catch (error) {
    console.warn('AI 분류 실패, 서버 API 사용:', error);
    return await getLocationFromServerAPI(locationName);
  }
}

/**
 * 폴백 분류 - 최소한의 기본 분류만
 */
function getBasicFallbackClassification(locationName: string): LocationData {
  console.log(`⚠️ 폴백 분류 사용: "${locationName}" → landmark (알 수 없음, 미분류)`);
  
  return {
    type: 'landmark', // 확실하지 않은 경우 모두 landmark
    level: 4,
    country: '알 수 없음',
    parent: '미분류',
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
 * 메인 동적 위치 분류 함수 - 전세계 명소 우선 분류
 */
export async function classifyLocationDynamic(locationName: string): Promise<{
  locationData: LocationData | null;
  pageType: PageType;
  source: 'static' | 'cache' | 'google' | 'db' | 'ai' | 'fallback' | 'global_landmarks' | 'disambiguation_needed' | 'auto_selected_city' | 'db_with_ai';
  confidence: number;
  reasoning: string;
  disambiguationOptions?: any[];
}> {
  const normalizedName = locationName.trim();
  
  // 🚨 도시 모호성 체크 (우선 단계)
  const disambiguationResult = checkCityDisambiguation(normalizedName);
  
  // 🤖 AI가 자동으로 선택한 경우 바로 처리
  if (disambiguationResult.autoSelected) {
    const selectedCity = disambiguationResult.autoSelected;
    console.log(`🤖 AI 자동 선택된 도시: ${selectedCity.name}, ${selectedCity.country} (인구: ${selectedCity.population?.toLocaleString()})`);
    
    // 선택된 도시로 LocationData 생성
    const locationData: LocationData = {
      type: 'city',
      level: 3,
      country: selectedCity.country,
      parent: selectedCity.region,
      aliases: [selectedCity.name, normalizedName],
      coordinates: selectedCity.coordinates,
      popularity: Math.min(10, Math.max(1, Math.ceil((selectedCity.population || 0) / 500000)))
    };
    
    return {
      locationData,
      pageType: 'RegionExploreHub',
      source: 'auto_selected_city',
      confidence: 0.95,
      reasoning: `AI가 자동 선택한 도시: ${selectedCity.name}, ${selectedCity.country}`
    };
  }
  
  // 여전히 사용자 선택이 필요한 경우
  if (disambiguationResult.needsDisambiguation) {
    console.log(`🤔 도시 모호성 발견: "${normalizedName}" - ${disambiguationResult.options.length}개 옵션`);
    
    return {
      locationData: null,
      pageType: 'RegionExploreHub', // 도시이므로 허브로 예정
      source: 'disambiguation_needed',
      confidence: 0.9,
      reasoning: `도시 모호성 발견: "${normalizedName}" - ${disambiguationResult.options.length}개 옵션`,
      disambiguationOptions: disambiguationResult.options
    };
  }
  
  // 🌍 0단계: 전세계 명소 데이터베이스에서 우선 확인 (가장 정확)
  const globalLandmark = findGlobalLandmark(normalizedName);
  if (globalLandmark) {
    const locationData = convertToLocationData(globalLandmark);
    console.log(`🌍 전세계 명소 데이터베이스 매칭: "${normalizedName}" → ${globalLandmark.country} ${globalLandmark.region} (인기도: ${globalLandmark.popularity}/10)`);
    
    return {
      locationData,
      pageType: determinePageType(locationData),
      source: 'global_landmarks',
      confidence: 0.98, // 가장 높은 신뢰도
      reasoning: `전세계 명소 데이터베이스 매칭: "${normalizedName}" → ${globalLandmark.country} ${globalLandmark.region} (인기도: ${globalLandmark.popularity}/10)`
    };
  }
  
  // 1단계: 정적 데이터에서 확인
  const staticResult = classifyLocation(normalizedName);
  if (staticResult) {
    return {
      locationData: staticResult,
      pageType: determinePageType(staticResult),
      source: 'static',
      confidence: 0.95,
      reasoning: `정적 데이터에서 매칭: "${normalizedName}"`
    };
  }
  
  // 2단계: 캐시에서 확인
  const cachedResult = getFromCache(normalizedName);
  if (cachedResult) {
    return {
      locationData: cachedResult,
      pageType: determinePageType(cachedResult),
      source: 'cache',
      confidence: 0.9,
      reasoning: `캐시에서 매칭: "${normalizedName}"`
    };
  }
  
  // 3단계: DB에 가이드가 있는지 확인
  const guideExists = await checkGuideExistsInDB(normalizedName);
  if (guideExists) {
    console.log(`📚 DB에 가이드 존재: ${normalizedName} - AI로 위치 타입 분류`);
    
    // AI 분류로 위치 타입 결정
    let locationData = await classifyLocationWithAI(normalizedName);
    
    if (!locationData) {
      // AI 분류에 실패하면 서버 API 사용
      locationData = await getLocationFromServerAPI(normalizedName);
      if (!locationData) {
        // 서버 API도 실패하면 기본 폴백 사용
        locationData = getBasicFallbackClassification(normalizedName);
      }
    }
    
    // 캐시에 저장
    saveToCache(normalizedName, locationData);
    
    return {
      locationData,
      pageType: determinePageType(locationData), // 🔥 위치 타입에 따라 동적으로 결정
      source: 'db_with_ai',
      confidence: 0.85,
      reasoning: `DB 검색과 AI 분류 결합: "${normalizedName}"`
    };
  }
  
  // 4단계: AI 분류 (최후 수단)
  const aiResult = await classifyLocationWithAI(normalizedName);
  if (aiResult) {
    // 캐시에 저장 (TTL 짧게)
    saveToCache(normalizedName, aiResult, 10 * 60 * 1000); // 10분
    
    return {
      locationData: aiResult,
      pageType: determinePageType(aiResult),
      source: 'ai',
      confidence: 0.6,
      reasoning: `AI 분류 결과: "${normalizedName}"`
    };
  }
  
  // 6단계: 기본값 (DetailedGuidePage)
  console.log(`❓ 위치 분류 실패: ${normalizedName} - 기본값으로 상세 가이드 페이지 사용`);
  
  return {
    locationData: null,
    pageType: 'DetailedGuidePage', // 확실하지 않으면 가이드 페이지로
    source: 'fallback',
    confidence: 0.5,
    reasoning: `위치 분류 실패: ${normalizedName} - 기본값으로 상세 가이드 페이지 사용`
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
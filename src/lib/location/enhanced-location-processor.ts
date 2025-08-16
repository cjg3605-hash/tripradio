/**
 * 🚀 향상된 위치 처리 시스템
 * 
 * 기존 시스템과 새로운 스마트 해결 시스템을 통합하여
 * 용궁사 같은 동명 장소 문제를 자동으로 해결합니다.
 */

import { smartResolveLocation } from './smart-location-resolver';
import { saveAutocompleteData } from '@/lib/cache/autocompleteStorage';

export interface ProcessedLocationResult {
  success: boolean;
  data?: {
    name: string;
    displayName: string;
    region: string;
    country: string;
    countryCode: string;
    confidence: number;
    coordinates?: { lat: number; lng: number };
  };
  url: string;
  error?: string;
  method: 'smart_resolution' | 'fallback_api' | 'basic_fallback';
}

/**
 * 🎯 메인 위치 처리 함수 - 기존 시스템과 호환
 */
export async function processLocationForNavigation(
  query: string,
  language: string = 'ko'
): Promise<ProcessedLocationResult> {
  
  console.log(`🚀 향상된 위치 처리 시작: "${query}" (${language})`);
  
  try {
    // 1️⃣ 스마트 해결 시스템 시도
    console.log('🤖 스마트 해결 시스템 시도');
    const smartResult = await smartResolveLocation(query, query, '');
    
    if (smartResult.confidence >= 0.6) {
      console.log('✅ 스마트 해결 성공:', smartResult.selectedLocation);
      
      // SessionStorage에 저장
      const autocompleteData = {
        name: smartResult.selectedLocation.displayName,
        location: `${smartResult.selectedLocation.region}, ${smartResult.selectedLocation.country}`,
        region: smartResult.selectedLocation.region,
        country: smartResult.selectedLocation.country,
        countryCode: getCountryCodeFromName(smartResult.selectedLocation.country),
        type: 'attraction' as const,
        confidence: smartResult.confidence,
        timestamp: Date.now()
      };
      
      saveAutocompleteData(
        smartResult.selectedLocation.displayName,
        autocompleteData,
        {
          region: smartResult.selectedLocation.region,
          country: smartResult.selectedLocation.country,
          countryCode: getCountryCodeFromName(smartResult.selectedLocation.country)
        }
      );
      
      const locationPath = encodeURIComponent(smartResult.selectedLocation.displayName.toLowerCase().trim());
      const url = `/guide/${locationPath}?lang=${language}`;
      
      return {
        success: true,
        data: {
          name: smartResult.selectedLocation.displayName,
          displayName: smartResult.selectedLocation.displayName,
          region: smartResult.selectedLocation.region,
          country: smartResult.selectedLocation.country,
          countryCode: getCountryCodeFromName(smartResult.selectedLocation.country),
          confidence: smartResult.confidence,
          coordinates: smartResult.selectedLocation.coordinates
        },
        url,
        method: 'smart_resolution'
      };
    }
    
    console.log('⚠️ 스마트 해결 신뢰도 낮음, Fallback 사용');
    
  } catch (smartError) {
    console.warn('⚠️ 스마트 해결 실패, Fallback 사용:', smartError);
  }
  
  // 2️⃣ 기존 자동완성 API Fallback
  try {
    console.log('🔍 기존 자동완성 API 시도');
    
    const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}&lang=${language}`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const firstResult = data.data[0];
      console.log('✅ 자동완성 API 성공:', firstResult);
      
      // SessionStorage에 저장
      const fallbackData = {
        name: firstResult.name,
        location: firstResult.location,
        region: firstResult.region || 'unknown',
        country: firstResult.country || 'unknown',
        countryCode: firstResult.countryCode || 'unknown',
        type: 'attraction' as const,
        confidence: 0.7,
        timestamp: Date.now()
      };
      
      saveAutocompleteData(
        firstResult.name,
        fallbackData,
        {
          region: firstResult.region || 'unknown',
          country: firstResult.country || 'unknown',
          countryCode: firstResult.countryCode || 'unknown'
        }
      );
      
      const locationPath = encodeURIComponent(firstResult.name.toLowerCase().trim());
      const url = `/guide/${locationPath}?lang=${language}`;
      
      return {
        success: true,
        data: {
          name: firstResult.name,
          displayName: firstResult.name,
          region: firstResult.region || 'unknown',
          country: firstResult.country || 'unknown',  
          countryCode: firstResult.countryCode || 'unknown',
          confidence: 0.7
        },
        url,
        method: 'fallback_api'
      };
    }
    
  } catch (apiError) {
    console.warn('⚠️ 자동완성 API 실패:', apiError);
  }
  
  // 3️⃣ 기본 Fallback
  console.log('🚨 기본 Fallback 사용');
  
  const basicData = {
    name: query,
    location: '',
    region: 'unknown',
    country: 'unknown',
    countryCode: 'unknown',
    type: 'attraction' as const,
    confidence: 0.3,
    timestamp: Date.now()
  };
  
  saveAutocompleteData(
    query,
    basicData,
    {
      region: 'unknown',
      country: 'unknown',
      countryCode: 'unknown'
    }
  );
  
  const locationPath = encodeURIComponent(query.toLowerCase().trim());
  const url = `/guide/${locationPath}?lang=${language}`;
  
  return {
    success: true,
    data: {
      name: query,
      displayName: query,
      region: 'unknown',
      country: 'unknown',
      countryCode: 'unknown',
      confidence: 0.3
    },
    url,
    method: 'basic_fallback'
  };
}

/**
 * 🌍 국가명에서 국가코드 추출 (간단 버전)
 */
function getCountryCodeFromName(countryName: string): string {
  const countryMap: { [key: string]: string } = {
    '한국': 'KOR',
    '대한민국': 'KOR',
    '일본': 'JPN',
    '중국': 'CHN',
    '미국': 'USA',
    '프랑스': 'FRA',
    '영국': 'GBR',
    '독일': 'DEU',
    '이탈리아': 'ITA',
    '스페인': 'ESP',
    '태국': 'THA',
    '베트남': 'VNM',
    '말레이시아': 'MYS',
    '싱가포르': 'SGP',
    '인도네시아': 'IDN',
    '필리핀': 'PHL',
    '호주': 'AUS',
    '뉴질랜드': 'NZL',
    '캐나다': 'CAN',
    '브라질': 'BRA',
    '아르헨티나': 'ARG',
    '러시아': 'RUS',
    '인도': 'IND',
    '남아프리카공화국': 'ZAF',
    '이집트': 'EGY',
    '터키': 'TUR',
    '그리스': 'GRC',
    '네덜란드': 'NLD',
    '벨기에': 'BEL',
    '스위스': 'CHE',
    '오스트리아': 'AUT',
    '포르투갈': 'PRT',
    '노르웨이': 'NOR',
    '스웨덴': 'SWE',
    '덴마크': 'DNK',
    '핀란드': 'FIN'
  };
  
  const normalized = countryName.toLowerCase();
  
  // 정확 매칭
  for (const [country, code] of Object.entries(countryMap)) {
    if (country.toLowerCase() === normalized) {
      return code;
    }
  }
  
  // 부분 매칭
  for (const [country, code] of Object.entries(countryMap)) {
    if (normalized.includes(country.toLowerCase()) || country.toLowerCase().includes(normalized)) {
      return code;
    }
  }
  
  return 'unknown';
}

/**
 * 📊 처리 결과 통계 (디버깅용)
 */
export interface ProcessingStats {
  smartResolutions: number;
  fallbackApi: number;
  basicFallback: number;
  totalProcessed: number;
  averageConfidence: number;
  topQueries: string[];
}

// 간단한 메모리 통계
let stats: ProcessingStats = {
  smartResolutions: 0,
  fallbackApi: 0,
  basicFallback: 0,
  totalProcessed: 0,
  averageConfidence: 0,
  topQueries: []
};

export function recordProcessingResult(result: ProcessedLocationResult, query: string) {
  stats.totalProcessed++;
  
  switch (result.method) {
    case 'smart_resolution':
      stats.smartResolutions++;
      break;
    case 'fallback_api':
      stats.fallbackApi++;
      break;
    case 'basic_fallback':
      stats.basicFallback++;
      break;
  }
  
  if (result.data) {
    const totalConfidence = stats.averageConfidence * (stats.totalProcessed - 1) + result.data.confidence;
    stats.averageConfidence = totalConfidence / stats.totalProcessed;
  }
  
  // 상위 쿼리 기록 (최대 10개)
  if (!stats.topQueries.includes(query)) {
    stats.topQueries.unshift(query);
    stats.topQueries = stats.topQueries.slice(0, 10);
  }
}

export function getProcessingStats(): ProcessingStats {
  return { ...stats };
}

/**
 * 🎨 사용 예시 (기존 컴포넌트에서 사용)
 */
export async function exampleUsage(query: string, language: string = 'ko') {
  const result = await processLocationForNavigation(query, language);
  
  if (result.success) {
    console.log('✅ 처리 성공:', result.data);
    console.log('🎯 이동할 URL:', result.url);
    console.log('📊 사용된 방법:', result.method);
    
    // 통계 기록
    recordProcessingResult(result, query);
    
    // 실제 네비게이션 (React Router 등에서 사용)
    // router.push(result.url);
    
    return result.url;
  } else {
    console.error('❌ 처리 실패:', result.error);
    return null;
  }
}
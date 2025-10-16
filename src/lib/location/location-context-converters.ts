/**
 * 🔄 API 응답을 OptimizedLocationContext로 변환하는 유틸리티
 * 
 * Gemini API, Google Geocoding API, 기타 서비스들의 응답을
 * 통일된 OptimizedLocationContext 형태로 변환
 */

import { OptimizedLocationContext, LegacyGeminiResponse, LegacyGeoCodingResponse } from '@/types/unified-location';
import { 
  getCurrencyFromCountry, 
  getLanguageFromCountry, 
  getFamousPlaceInfo,
  inferCategoryFromName,
  inferDurationFromCategory,
  inferSignificanceFromName
} from '@/lib/location/lookup-tables';
import { GeocodingResult, LocationValidationResult } from '@/lib/location/enhanced-geocoding-service';

/**
 * 🎯 Gemini API 응답을 OptimizedLocationContext로 변환
 */
export function convertGeminiToOptimized(
  geminiResponse: LegacyGeminiResponse, 
  language: string
): OptimizedLocationContext {
  const countryCode = geminiResponse.countryCode || 'KOR';
  const placeName = geminiResponse.placeName || '';
  
  // 룩업 테이블에서 상세 정보 조회
  const famousPlaceInfo = getFamousPlaceInfo(placeName);
  const category = inferCategoryFromName(placeName);
  const duration = inferDurationFromCategory(category);
  const significance = inferSignificanceFromName(placeName);
  
  return {
    // 기본 필수 필드
    placeName: placeName,
    location_region: geminiResponse.region || '',
    country_code: countryCode,
    language: language,
    
    // 사실 정확성 향상 필드 (룩업 테이블 우선)
    factual_context: {
      construction_date: famousPlaceInfo?.factual_context?.construction_date,
      architect: famousPlaceInfo?.factual_context?.architect,
      height_meters: famousPlaceInfo?.factual_context?.height_meters,
      cultural_status: famousPlaceInfo?.factual_context?.cultural_status,
      current_status: famousPlaceInfo?.factual_context?.current_status || 'active',
      period: famousPlaceInfo?.factual_context?.period
    },
    
    // 현지화 정보
    local_context: {
      local_name: famousPlaceInfo?.local_context?.local_name,
      pronunciation_guide: famousPlaceInfo?.local_context?.pronunciation_guide,
      primary_language: getLanguageFromCountry(countryCode),
      currency: getCurrencyFromCountry(countryCode),
      entrance_fee: famousPlaceInfo?.local_context?.entrance_fee,
      local_customs: famousPlaceInfo?.local_context?.local_customs
    },
    
    // 실용 정보
    practical_info: {
      typical_visit_duration: famousPlaceInfo?.practical_info?.typical_visit_duration || duration,
      accessibility_level: famousPlaceInfo?.practical_info?.accessibility_level || 'partially',
      best_visit_seasons: famousPlaceInfo?.practical_info?.best_visit_seasons || ['spring', 'autumn'],
      category: famousPlaceInfo?.practical_info?.category || category,
      opening_hours: famousPlaceInfo?.practical_info?.opening_hours,
      recommended_time: famousPlaceInfo?.practical_info?.recommended_time || ['morning', 'afternoon']
    },
    
    // 문화적 맥락
    cultural_context: {
      historical_period: famousPlaceInfo?.cultural_context?.historical_period,
      religious_context: famousPlaceInfo?.cultural_context?.religious_context,
      cultural_significance: famousPlaceInfo?.cultural_context?.cultural_significance || significance,
      architectural_style: famousPlaceInfo?.cultural_context?.architectural_style,
      dynasty_era: famousPlaceInfo?.cultural_context?.dynasty_era
    }
  };
}

/**
 * 🗺️ Google Geocoding API 응답을 OptimizedLocationContext로 변환
 */
export function convertGeocodingToOptimized(
  geocodingResponse: LegacyGeoCodingResponse,
  language: string = 'ko'
): OptimizedLocationContext {
  const countryCode = geocodingResponse.countryCode || 'KOR';
  const placeName = geocodingResponse.placeName || '';
  
  // 룩업 테이블에서 상세 정보 조회
  const famousPlaceInfo = getFamousPlaceInfo(placeName);
  const category = inferCategoryFromName(placeName);
  const duration = inferDurationFromCategory(category);
  const significance = inferSignificanceFromName(placeName);
  
  return {
    // 기본 필수 필드
    placeName: placeName,
    location_region: geocodingResponse.region || '',
    country_code: countryCode,
    language: language,
    
    // 사실 정확성 향상 필드 (룩업 테이블 우선)
    factual_context: {
      construction_date: famousPlaceInfo?.factual_context?.construction_date,
      architect: famousPlaceInfo?.factual_context?.architect,
      height_meters: famousPlaceInfo?.factual_context?.height_meters,
      cultural_status: famousPlaceInfo?.factual_context?.cultural_status,
      current_status: famousPlaceInfo?.factual_context?.current_status || 'active',
      period: famousPlaceInfo?.factual_context?.period
    },
    
    // 현지화 정보
    local_context: {
      local_name: famousPlaceInfo?.local_context?.local_name,
      pronunciation_guide: famousPlaceInfo?.local_context?.pronunciation_guide,
      primary_language: getLanguageFromCountry(countryCode),
      currency: getCurrencyFromCountry(countryCode),
      entrance_fee: famousPlaceInfo?.local_context?.entrance_fee,
      local_customs: famousPlaceInfo?.local_context?.local_customs
    },
    
    // 실용 정보
    practical_info: {
      typical_visit_duration: famousPlaceInfo?.practical_info?.typical_visit_duration || duration,
      accessibility_level: famousPlaceInfo?.practical_info?.accessibility_level || 'partially',
      best_visit_seasons: famousPlaceInfo?.practical_info?.best_visit_seasons || ['spring', 'autumn'],
      category: famousPlaceInfo?.practical_info?.category || category,
      opening_hours: famousPlaceInfo?.practical_info?.opening_hours,
      recommended_time: famousPlaceInfo?.practical_info?.recommended_time || ['morning', 'afternoon']
    },
    
    // 문화적 맥락
    cultural_context: {
      historical_period: famousPlaceInfo?.cultural_context?.historical_period,
      religious_context: famousPlaceInfo?.cultural_context?.religious_context,
      cultural_significance: famousPlaceInfo?.cultural_context?.cultural_significance || significance,
      architectural_style: famousPlaceInfo?.cultural_context?.architectural_style,
      dynasty_era: famousPlaceInfo?.cultural_context?.dynasty_era
    }
  };
}

/**
 * 🌐 Enhanced Geocoding Service 응답을 OptimizedLocationContext로 변환
 */
export function convertEnhancedGeocodingToOptimized(
  enhancedResult: LocationValidationResult,
  placeName: string,
  language: string = 'ko'
): OptimizedLocationContext {
  // 좌표를 통한 역 지오코딩으로 국가 정보 추론 (간소화)
  const { lat, lng } = enhancedResult.coordinates;
  
  // 좌표 기반 국가 코드 추론 (간단한 룰 기반 - 실제로는 더 정교한 로직 필요)
  const countryCode = inferCountryFromCoordinates(lat, lng);
  
  // 룩업 테이블에서 상세 정보 조회
  const famousPlaceInfo = getFamousPlaceInfo(placeName);
  const category = inferCategoryFromName(placeName);
  const duration = inferDurationFromCategory(category);
  const significance = inferSignificanceFromName(placeName);
  
  return {
    // 기본 필수 필드
    placeName: placeName,
    location_region: '', // Enhanced Geocoding에서는 지역 정보가 별도로 제공되지 않음
    country_code: countryCode,
    language: language,
    
    // 사실 정확성 향상 필드 (룩업 테이블 우선)
    factual_context: {
      construction_date: famousPlaceInfo?.factual_context?.construction_date,
      architect: famousPlaceInfo?.factual_context?.architect,
      height_meters: famousPlaceInfo?.factual_context?.height_meters,
      cultural_status: famousPlaceInfo?.factual_context?.cultural_status,
      current_status: famousPlaceInfo?.factual_context?.current_status || 'active',
      period: famousPlaceInfo?.factual_context?.period
    },
    
    // 현지화 정보
    local_context: {
      local_name: famousPlaceInfo?.local_context?.local_name,
      pronunciation_guide: famousPlaceInfo?.local_context?.pronunciation_guide,
      primary_language: getLanguageFromCountry(countryCode),
      currency: getCurrencyFromCountry(countryCode),
      entrance_fee: famousPlaceInfo?.local_context?.entrance_fee,
      local_customs: famousPlaceInfo?.local_context?.local_customs
    },
    
    // 실용 정보
    practical_info: {
      typical_visit_duration: famousPlaceInfo?.practical_info?.typical_visit_duration || duration,
      accessibility_level: famousPlaceInfo?.practical_info?.accessibility_level || 'partially',
      best_visit_seasons: famousPlaceInfo?.practical_info?.best_visit_seasons || ['spring', 'autumn'],
      category: famousPlaceInfo?.practical_info?.category || category,
      opening_hours: famousPlaceInfo?.practical_info?.opening_hours,
      recommended_time: famousPlaceInfo?.practical_info?.recommended_time || ['morning', 'afternoon']
    },
    
    // 문화적 맥락
    cultural_context: {
      historical_period: famousPlaceInfo?.cultural_context?.historical_period,
      religious_context: famousPlaceInfo?.cultural_context?.religious_context,
      cultural_significance: famousPlaceInfo?.cultural_context?.cultural_significance || significance,
      architectural_style: famousPlaceInfo?.cultural_context?.architectural_style,
      dynasty_era: famousPlaceInfo?.cultural_context?.dynasty_era
    }
  };
}

/**
 * 🎨 OptimizedLocationContext를 AI 프롬프트용으로 변환
 */
export function convertOptimizedToAIPrompt(context: OptimizedLocationContext): any {
  return {
    // 기본 정보
    placeName: context.placeName,
    location_region: context.location_region,
    country_code: context.country_code,
    language: context.language,
    
    // 사실 정보 (빈 값 제외)
    ...(context.factual_context.construction_date && { construction_date: context.factual_context.construction_date }),
    ...(context.factual_context.architect && { architect: context.factual_context.architect }),
    ...(context.factual_context.height_meters && { height_meters: context.factual_context.height_meters }),
    ...(context.factual_context.cultural_status && { cultural_status: context.factual_context.cultural_status }),
    current_status: context.factual_context.current_status,
    ...(context.factual_context.period && { period: context.factual_context.period }),
    
    // 현지화 정보 (빈 값 제외)
    ...(context.local_context.local_name && { local_name: context.local_context.local_name }),
    ...(context.local_context.pronunciation_guide && { pronunciation_guide: context.local_context.pronunciation_guide }),
    primary_language: context.local_context.primary_language,
    currency: context.local_context.currency,
    ...(context.local_context.entrance_fee && { entrance_fee: context.local_context.entrance_fee }),
    ...(context.local_context.local_customs && { local_customs: context.local_context.local_customs }),
    
    // 실용 정보
    typical_visit_duration: context.practical_info.typical_visit_duration,
    accessibility_level: context.practical_info.accessibility_level,
    best_visit_seasons: context.practical_info.best_visit_seasons,
    category: context.practical_info.category,
    ...(context.practical_info.opening_hours && { opening_hours: context.practical_info.opening_hours }),
    recommended_time: context.practical_info.recommended_time,
    
    // 문화적 맥락 (빈 값 제외)
    ...(context.cultural_context.historical_period && { historical_period: context.cultural_context.historical_period }),
    ...(context.cultural_context.religious_context && { religious_context: context.cultural_context.religious_context }),
    cultural_significance: context.cultural_context.cultural_significance,
    ...(context.cultural_context.architectural_style && { architectural_style: context.cultural_context.architectural_style }),
    ...(context.cultural_context.dynasty_era && { dynasty_era: context.cultural_context.dynasty_era })
  };
}

/**
 * 🌍 좌표를 통한 국가 코드 추론 (간소화된 버전)
 * 실제 프로덕션에서는 더 정교한 역 지오코딩 서비스 사용 권장
 */
function inferCountryFromCoordinates(lat: number, lng: number): string {
  // 대략적인 지리적 범위로 국가 추론
  if (lat >= 33 && lat <= 43 && lng >= 124 && lng <= 132) return 'KOR'; // 한국
  if (lat >= 31 && lat <= 46 && lng >= 129 && lng <= 146) return 'JPN'; // 일본
  if (lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135) return 'CHN'; // 중국
  if (lat >= 5 && lat <= 21 && lng >= 92 && lng <= 141) return 'THA'; // 동남아시아
  if (lat >= 35 && lat <= 72 && lng >= -10 && lng <= 40) return 'EUR'; // 유럽 (일반)
  if (lat >= 24 && lat <= 49 && lng >= -125 && lng >= -66) return 'USA'; // 미국
  
  return 'KOR'; // 기본값
}

/**
 * 🔄 호환성을 위한 기존 형식 변환 함수들
 */

// 기존 Gemini 응답을 새로운 형식으로 변환
export function upgradeLegacyGeminiResponse(legacy: any): LegacyGeminiResponse {
  return {
    placeName: legacy.placeName || legacy.name || '',
    region: legacy.region || legacy.location_region || '',
    country: legacy.country || '',
    countryCode: legacy.countryCode || legacy.country_code || 'KOR'
  };
}

// 기존 Geocoding 응답을 새로운 형식으로 변환
export function upgradeLegacyGeocodingResponse(legacy: any): LegacyGeoCodingResponse {
  return {
    placeName: legacy.placeName || legacy.name || '',
    formattedAddress: legacy.formattedAddress || legacy.formatted_address || '',
    region: legacy.region || '',
    country: legacy.country || '',
    countryCode: legacy.countryCode || legacy.country_code || 'KOR',
    coordinates: legacy.coordinates || { lat: 0, lng: 0 },
    confidence: legacy.confidence || 0.8,
    source: legacy.source || 'unknown'
  };
}
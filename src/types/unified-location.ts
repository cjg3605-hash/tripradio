/**
 * 🎯 AI 품질 향상을 위한 통합 지역정보 인터페이스
 * 
 * Gemini API와 Google Geocoding API 결과를 통합하여
 * AI 프롬프트 품질을 향상시키면서 창의성은 보존하는 최적화된 구조
 */

// 🎯 메인 통합 인터페이스
export interface OptimizedLocationContext {
  // === 기본 필수 필드 (기존 호환성 유지) ===
  placeName: string;        // "에펠탑", "경복궁"
  location_region: string;  // "파리", "서울특별시" 
  country_code: string;     // "FRA", "KOR"
  language: string;         // "ko", "en", "fr"
  
  // === 사실 정확성 향상 필드 ===
  factual_context: {
    construction_date?: string;     // "1887-1889", "1395년"
    architect?: string;             // "Gustave Eiffel", "정도전"
    height_meters?: number;         // 324, 50
    cultural_status?: string;       // "UNESCO World Heritage", "국보 제1호"
    current_status: string;         // "active" | "museum" | "ruins" | "monument"
    period?: string;               // "Industrial Revolution", "조선시대"
  };
  
  // === 현지화 정보 ===
  local_context: {
    local_name?: string;           // "Tour Eiffel", "景福宮"
    pronunciation_guide?: string;  // "toor ay-FELL", "경-복-궁"
    primary_language: string;      // "French", "Korean"
    currency: string;              // "EUR", "KRW"
    entrance_fee?: string;         // "€29", "₩3,000"
    entrance_location?: string;    // "대한문", "Main Entrance"
    main_area?: string;            // "근정전", "Main Hall"
    nearby_attractions?: string;   // "법궁사, 창덕궁"
    local_customs?: string[];      // ["remove_hat_indoors", "bow_before_entering"]
  };
  
  // === 실용 정보 ===
  practical_info: {
    typical_visit_duration: number;    // 120 (minutes)
    accessibility_level: string;       // "fully" | "partially" | "limited" | "none"
    best_visit_seasons: string[];      // ["spring", "summer", "autumn", "winter"]
    category: string;                   // "historical" | "natural" | "cultural" | "modern" | "religious"
    opening_hours?: string;             // "09:00-18:00", "24시간"
    recommended_time?: string[];        // ["morning", "afternoon", "evening", "sunset"]
    gift_shop?: string;                 // "기념품점 운영", "Gift shop available"
  };
  
  // === 문화적 맥락 ===
  cultural_context: {
    historical_period?: string;        // "Industrial Revolution", "조선 전기"
    religious_context?: string;        // "Secular", "Catholic", "Buddhist", "Confucian"
    cultural_significance: string;     // "Symbol of France", "조선왕조의 법궁"
    architectural_style?: string;      // "Art Nouveau", "한옥 건축"
    dynasty_era?: string;              // "조선왕조", "Roman Empire"
  };
}

// 🔄 기존 API 응답과의 호환성을 위한 변환 인터페이스들
export interface LegacyGeminiResponse {
  placeName: string;
  region: string;
  country: string;
  countryCode: string;
}

export interface LegacyGeoCodingResponse {
  placeName: string;
  formattedAddress: string;
  region: string;
  country: string;
  countryCode: string;
  coordinates: { lat: number; lng: number; };
  confidence: number;
  source: string;
}

// 🎯 SessionStorage용 확장 인터페이스 (메타데이터 포함)
export interface EnhancedAutocompleteData extends OptimizedLocationContext {
  // SessionStorage 전용 메타데이터 (AI 프롬프트에는 전달하지 않음)
  timestamp: number;      // 5분 만료용
  confidence: number;     // 데이터 신뢰도
  source: string;         // "gemini" | "geocoding" | "hybrid"
  version: string;        // 데이터 버전 관리용
}

// 🎨 AI 프롬프트용 정제된 인터페이스 (창의성 보존)
export interface AIPromptContext {
  // 사실 정보만 포함 (AI 창의성 영역 제외)
  basic_info: {
    placeName: string;
    location_region: string;
    country_code: string;
    language: string;
  };
  
  factual_info: {
    construction_date?: string;
    architect?: string;
    height_meters?: number;
    cultural_status?: string;
    current_status: string;
  };
  
  practical_info: {
    entrance_fee?: string;
    typical_visit_duration: number;
    accessibility_level: string;
    category: string;
  };
  
  cultural_info: {
    historical_period?: string;
    religious_context?: string;
    cultural_significance: string;
  };
  
  // ❌ 의도적으로 제외하는 영역들 (AI 창의성 보존)
  // - description_template
  // - narrative_style
  // - story_structure
  // - emotional_expressions
  // - transition_phrases
}

// 🛠️ 유틸리티 타입들
export type LocationCategory = 'historical' | 'natural' | 'cultural' | 'modern' | 'religious' | 'entertainment' | 'shopping';
export type AccessibilityLevel = 'fully' | 'partially' | 'limited' | 'none';
export type CurrentStatus = 'active' | 'museum' | 'ruins' | 'monument' | 'restored';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'sunset' | 'night';
export type ReligiousContext = 'Secular' | 'Catholic' | 'Protestant' | 'Buddhist' | 'Confucian' | 'Islamic' | 'Hindu' | 'Jewish';

// 🔍 변환 함수 타입 정의
export type GeminiToOptimizedConverter = (response: LegacyGeminiResponse) => OptimizedLocationContext;
export type GeocodingToOptimizedConverter = (response: LegacyGeoCodingResponse) => OptimizedLocationContext;
export type OptimizedToAIPromptConverter = (context: OptimizedLocationContext) => AIPromptContext;
// src/types/guide.ts
export interface UserProfile {
  interests?: string[];
  preferredLanguage?: string;
  travelStyle?: 'cultural' | 'adventure' | 'relaxed' | 'educational';
  duration?: string;
  groupSize?: number;
  accessibilityNeeds?: string[];
  // 기존 호환성 유지
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
  tourDuration?: number;
  preferredStyle?: string;
  language?: string;
}

export interface GuideOverview {
  title: string;
  summary?: string;
  narrativeTheme?: string;
  keyFacts: {
    title: string;
    description: string;
  }[] | string[];
  visitingTips?: string[];
  historicalBackground?: string;
  visitInfo?: {
    duration?: string;
    difficulty?: string;
    season?: string;
    openingHours?: string;
    admissionFee?: string;
    website?: string;
    phone?: string;
    address?: string;
  };
}

export interface GuideStep {
  step?: number;
  stepNumber?: number;
  location?: string;
  title: string;
  description?: string;
  duration?: string;
  estimatedTime?: string;
  keyHighlights?: string[];
}

export interface GuideRoute {
  steps: GuideStep[];
}

export interface RouteStep {
  stepNumber: number;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  estimatedTime: string;
  keyHighlights: string[];
}

export interface PointOfInterest {
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  category: string;
}

export interface GuideChapter {
  id: number; // 필수 필드로 통일
  title: string;
  description?: string;
  content?: string;
  duration?: number | string;
  audioUrl?: string;
  keyPoints?: string[];
  
  // 권장되는 좌표 필드
  location?: {
    lat: number;
    lng: number;
  };
  
  // 기존 호환성을 위해 유지하되 deprecated 표시
  /** @deprecated use location.lat instead */
  lat?: number;
  /** @deprecated use location.lng instead */
  lng?: number;
  /** @deprecated use location.lat instead */
  latitude?: number;
  /** @deprecated use location.lng instead */
  longitude?: number;
  /** @deprecated use location instead */
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  nearbyPois?: PointOfInterest[];
  /**
   * Unified continuous narrative for the chapter (≈ 1700-2100 chars)
   * 하나의 연속된 오디오 가이드 스토리 (새로운 방식)
   */
  narrative?: string;
  /**
   * 개별 필드들 (하위 호환성을 위해 유지)
   */
  sceneDescription?: string;
  coreNarrative?: string;
  humanStories?: string;
  /** @deprecated 기존 다중 파트 구조. 더 이상 사용하지 않음 */
  narrativeLayers?: {
    coreNarrative?: string;
    humanStories?: string;
    [key: string]: any;
  };
  /**
   * Concrete navigation instructions guiding the visitor to the next stop (≥ 200-300 chars)
   */
  nextDirection?: string;
  realTimeScript?: string;
  
  // 확장성을 위한 인덱스 시그니처 추가
  [key: string]: any;
}

export interface RealTimeGuide {
  chapters: GuideChapter[];
  [key: string]: any;
}

export interface GuideMetadata {
  originalLocationName: string;
  englishFileName?: string;
  generatedAt?: string;
  version?: string;
  language?: string;
}

export interface GuideData {
  overview: GuideOverview;
  route: GuideRoute;
  realTimeGuide?: RealTimeGuide;
  metadata: GuideMetadata;
}

export interface ApiResponse {
  success: boolean;
  data?: GuideData;
  error?: string;
  cached?: 'file' | 'new' | 'error';
  version?: string;
}

// 다국어 관리용 타입
export interface MultiLanguageGuide {
  locationName: string;
  languages: {
    [key: string]: {
      data: GuideData;
      lastUpdated: string;
      version: string;
    };
  };
}

// API 응답 타입
export interface GuideApiResponse {
  success: boolean;
  data?: GuideData;
  error?: string;
  source?: 'cache' | 'generated' | 'database';
}

// 데이터베이스 스키마 타입
export interface GuideRecord {
  id?: number;
  locationname: string;
  language: string;
  guide_data: GuideData;
  user_profile?: UserProfile;
  created_at?: string;
  updated_at?: string;
}

// 언어별 설정 타입은 LanguageContext에서 import하도록 변경됨
// export interface LanguageConfig는 src/contexts/LanguageContext.tsx에서 관리
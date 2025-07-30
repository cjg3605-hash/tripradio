// Enhanced Chapter Selection System Types
// 통합 챕터 선정 시스템을 위한 타입 정의

export interface LocationData {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  venueType: VenueType;
  scale: VenueScale;
  averageVisitDuration: number; // 분 단위
  tier1Points: ViewingPoint[]; // 세계급 명소
  tier2Points: ViewingPoint[]; // 국가급 중요도  
  tier3Points: ViewingPoint[]; // 지역급/인기 스팟
}

export interface ViewingPoint {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
    floor?: number; // 실내용
  };
  tier: 'tier1_worldFamous' | 'tier2_nationalTreasure' | 'tier3_crowdFavorite';
  scores: {
    globalFameScore: number; // 0-10
    culturalImportance: number; // 0-10
    visitorPreference: number; // 0-10
    photoWorthiness: number; // 0-10
    uniquenessScore: number; // 0-10
    accessibilityScore: number; // 0-10
  };
  compositeScore: number; // 최종 종합 점수
  content: {
    shortDescription: string;
    detailedDescription: string;
    interestingFacts: string;
    photoTips?: string;
  };
  location: {
    sectionName?: string; // 구역명 (예: "정전", "메인 홀")
    visualLandmarks: string[]; // 시각적 랜드마크
    walkingDirections?: string; // 이전 지점에서의 이동 안내
  };
  metadata: {
    lastVerified: Date;
    curatorNotes?: string;
  };
}

export type VenueType = 'indoor' | 'outdoor' | 'mixed';
export type VenueScale = 'world_heritage' | 'national_museum' | 'major_attraction' | 'regional_site' | 'local_attraction';

export interface EnhancedChapterStructure {
  // Chapter 0: 인트로 (필수)
  introChapter: IntroChapter;
  
  // Chapter 1~N: 실제 관람포인트
  mainChapters: MainChapter[];
  
  // 메타데이터
  metadata: ChapterMetadata;
}

export interface IntroChapter {
  id: 0;
  type: 'introduction';
  title: string;
  location: {
    type: 'entrance' | 'starting_point' | 'visitor_center';
    coordinates: {
      lat: number;
      lng: number;
    };
    description: string;
  };
  content: {
    historicalBackground: string;
    culturalContext: string;
    visitingTips: string;
    whatsToExpected: string;
    timeEstimate: number; // 분 단위
    highlightsPreview: string[]; // 주요 볼거리 미리보기
  };
  triggers: {
    primaryTrigger: {
      type: 'gps_proximity';
      coordinates: {
        lat: number;
        lng: number;
      };
      radius: number; // 미터
    };
    alternativeTriggers: AlternativeTrigger[];
  };
  navigation: {
    nextChapterHint: string;
    estimatedDuration: number; // 분 단위
  };
}

export interface MainChapter {
  id: number; // 1부터 시작
  type: 'viewing_point';
  title: string;
  priority: 'must_see' | 'highly_recommended' | 'optional';
  viewingPoint: ViewingPoint;
  content: {
    narrative: string; // 음성 가이드용 내러티브
    description: string; // 텍스트 설명
    keyHighlights: string[]; // 핵심 포인트
    didYouKnow?: string; // 흥미로운 사실
    photoTips?: string; // 사진 촬영 팁
  };
  navigation: {
    fromPrevious: NavigationInstruction;
    estimatedWalkTime: number; // 분 단위
    accessibility: AccessibilityInfo;
  };
  triggers: {
    outdoor?: {
      type: 'gps_proximity';
      coordinates: {
        lat: number;
        lng: number;
      };
      radius: number;
    };
    indoor?: {
      type: 'manual_activation';
      contextualCues: string[];
      visualLandmarks: string[];
    };
  };
  audioInfo?: {
    duration: number; // 초 단위
    audioUrl?: string;
  };
}

export interface AlternativeTrigger {
  type: 'qr_code' | 'manual_start' | 'geofence' | 'beacon';
  location?: string;
  description: string;
  data?: any;
}

export interface NavigationInstruction {
  direction: string;
  distance?: number; // 미터
  estimatedTime: number; // 분 단위
  landmarks: string[];
  accessibility: AccessibilityInfo;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  stairsRequired: boolean;
  elevatorAvailable?: boolean;
  accessibilityNotes?: string;
}

export interface ChapterMetadata {
  totalChapters: number;
  estimatedTotalDuration: number; // 분 단위
  difficulty: 'easy' | 'moderate' | 'challenging';
  bestTimeToVisit?: string;
  seasonalNotes?: string;
  crowdLevelInfo?: string;
  generatedAt: Date;
  version: string;
  personalizedFor?: UserProfile;
}

// Google Places API 연동을 위한 타입
export interface GooglePlacesData {
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  photos?: {
    photoReference: string;
    height: number;
    width: number;
  }[];
  reviews?: {
    rating: number;
    text: string;
    time: number;
  }[];
}

// KTO API 연동을 위한 타입
export interface KTOTourismData {
  contentId: string;
  title: string;
  category: string;
  address: string;
  overview?: string;
  tel?: string;
  homepage?: string;
  images?: {
    originimgurl: string;
    smallimageurl: string;
  }[];
}

// Must-See 데이터베이스 스키마
export interface MustSeePoint {
  id: number;
  locationName: string;
  pointName: string;
  tier: 1 | 2 | 3;
  globalFameScore: number;
  culturalImportance: number;
  visitorPreference: number;
  photoWorthiness: number;
  uniquenessScore: number;
  accessibilityScore: number;
  coordinates: {
    latitude: number;
    longitude: number;
    floorLevel?: number;
  };
  sectionName?: string;
  shortDescription: string;
  detailedDescription: string;
  interestingFacts: string;
  photoTips?: string;
  lastVerifiedAt: Date;
  curatorNotes?: string;
}

// 위치 컨텍스트 (실내/실외 통합 관리용)
export interface LocationContext {
  currentVenue: VenueType;
  currentChapter: number;
  trigger: 'gps_proximity' | 'manual_progression' | 'contextual_cues';
  accuracy: 'high' | 'medium' | 'contextual';
  method: 'gps_geofence' | 'user_initiated' | 'beacon' | 'qr_code';
  locationHints?: string[];
  visualCues?: string[];
  nextChapterHint?: string;
  estimatedAccuracy?: number; // 미터 단위
}

// 챕터 생성 요청/응답
export interface ChapterGenerationRequest {
  locationName: string;
  userProfile?: UserProfile;
  preferredLanguage: string;
  visitDuration?: number; // 분 단위
  interests?: string[];
  accessibilityNeeds?: AccessibilityInfo;
}

export interface ChapterGenerationResponse {
  success: boolean;
  data?: EnhancedChapterStructure;
  metadata: {
    processingTime: number; // ms
    dataSource: string[];
    confidence: number; // 0-1
    cacheHit: boolean;
  };
  error?: string;
}

// 성능 모니터링용
export interface PerformanceMetrics {
  responseTime: number; // ms
  cacheHitRate: number; // 0-1
  apiCallCount: number;
  errorRate: number; // 0-1
  userSatisfactionScore?: number; // 1-5
  completionRate?: number; // 0-1
}

// 검증 시스템용
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-1
  detailedChecks: {
    mustSeeInclusion: boolean;
    socialMediaCoverage: boolean;
    educationalBalance: boolean;
    accessibilityOptimization: boolean;
    timeAllocationBalance: boolean;
    personalizationRelevance: boolean;
  };
  improvementSuggestions: string[];
  missingElements: string[];
}

// 기존 타입과의 호환성
export interface UserProfile {
  interests: string[];
  ageGroup: string;
  knowledgeLevel: string;
  companions: string;
  tourDuration: number;
  preferredStyle: string;
  language: string;
  accessibilityNeeds?: AccessibilityInfo;
}
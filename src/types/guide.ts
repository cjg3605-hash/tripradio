export interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
  tourDuration?: number;      // 투어 소요 시간 (분)
  preferredStyle?: string;    // 선호하는 가이드 스타일
  language?: string;          // 언어 설정
}

export interface GuideOverview {
  title: string;
  summary?: string;
  narrativeTheme?: string;
  keyFacts: {
    title: string;
    description: string;
  }[];
  visitingTips?: string[];
  historicalBackground?: string;
  visitInfo?: {
    duration?: string;
    difficulty?: string;
    season?: string;
  };
}

export interface GuideStep {
  step: number;
  location: string;
  title: string;
  description?: string;
  duration?: string;
}

export interface GuideRoute {
  steps: GuideStep[];
}

export interface GuideChapter {
  id: number;
  title: string;
  description?: string;
  duration?: number | string;
  audioUrl?: string;
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
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  realTimeScript?: string;
  location?: {
    name?: string;
    [key: string]: any;
  };
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
}

export interface GuideData {
  overview: GuideOverview;
  route: GuideRoute;  // 프롬프트 JSON 양식에 맞게 수정
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
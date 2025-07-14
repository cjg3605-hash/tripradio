export interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}

export interface GuideOverview {
  title: string;
  summary?: string;
  narrativeTheme?: string;
  keyFacts: {
    title: string;
    description: string;
  }[];
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
   * Unified continuous narrative for the chapter (≈ 2 100+ chars)
   */
  narrative?: string;
  /** @deprecated 기존 다중 파트 구조. 더 이상 사용하지 않음 */
  narrativeLayers?: {
    coreNarrative?: string;
    humanStories?: string;
    [key: string]: any;
  };
  /**
   * Concrete navigation instructions guiding the visitor to the next stop (≥ 300 chars)
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
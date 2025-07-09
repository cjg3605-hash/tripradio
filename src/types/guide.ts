export interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}

export interface GuideOverview {
  title: string;
  narrativeTheme: string;
  keyFacts: string[];
  visitInfo: {
    duration: string;
    difficulty: string;
    season: string;
  };
}

export interface RouteStep {
  step: number;
  location: string;
  title: string;
}

export interface GuideRoute {
  steps: RouteStep[];
}

export interface GuideChapter {
  id: number;
  title: string;
  realTimeScript: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  [key: string]: any; // For dynamic access to properties
}

export interface StartingLocation {
  name: string;
  address: string;
  googleMapsUrl: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

export interface RealTimeGuide {
  startingLocation?: StartingLocation;
  chapters: GuideChapter[];
}

export interface GuideContent {
  overview?: GuideOverview;
  route?: GuideRoute;
  realTimeGuide?: RealTimeGuide;
  RealTimeGuide?: RealTimeGuide;
  '실시간가이드'?: RealTimeGuide;
  [key: string]: any; // For dynamic access to properties
}

export interface GuideMetadata {
  originalLocationName: string;
  englishFileName: string;
  generatedAt: string;
  version: string;
}

export interface GuideData {
  content?: GuideContent;
  overview?: GuideOverview;
  route?: GuideRoute;
  realTimeGuide?: RealTimeGuide;
  RealTimeGuide?: RealTimeGuide;
  '실시간가이드'?: RealTimeGuide;
  [key: string]: any; // For dynamic access to properties
  metadata?: GuideMetadata;
}

export interface ApiResponse {
  success: boolean;
  data?: GuideData;
  error?: string;
  cached?: 'file' | 'new' | 'error';
  version?: string;
} 
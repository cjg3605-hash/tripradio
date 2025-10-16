// API 타입 정의 강화
export interface UserProfile {
  id?: string;
  language: string;
  interests: string[];
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
  ageGroup: string;
  preferredStyle: string;
  tourDuration: number;
  companions: string;
  usage?: {
    sessionsPerMonth?: number;
    avgSessionDuration?: number;
    preferredContentLength?: string;
    deviceType?: string;
  };
  demographics?: {
    age?: number;
    country?: string;
    region?: string;
    language?: string;
    travelStyle?: string;
    techSavviness?: number;
  };
  satisfaction?: {
    overall?: number;
    accuracy?: number;
    storytelling?: number;
    engagement?: number;
    relevance?: number;
    cultural_respect?: number;
    speed?: number;
  };
}

export interface GuideGenerationRequest {
  locationName: string;
  language?: string;
  userProfile?: UserProfile;
  forceRegenerate?: boolean;
  generationMode?: 'autonomous' | 'structure' | 'chapter';
  targetChapter?: number | null;
}

export interface GuideGenerationResponse {
  success: boolean;
  data?: any;
  error?: string;
  cached?: 'hit' | 'mega_hit' | 'miss' | 'updated' | 'new' | 'existing';
  language?: string;
  response_time?: string;
  satisfaction_expected?: string;
  message?: string;
}

export interface PersonalityAnalysis {
  primaryPersonality: string;
  confidence: number;
  traits: string[];
  adaptationLevel: number;
}

export interface PersonalizedGuideResult {
  success: boolean;
  personalityAnalysis: PersonalityAnalysis;
  adaptedContent: any;
  error?: string;
}

export interface MultilingualResult {
  success: boolean;
  targetLanguage: string;
  localizationLevel: number;
  culturalAdaptations: string[];
  adaptedContent: any;
  error?: string;
}

export interface BehaviorData {
  clickCount: number;
  totalTime: number;
  scrollDepth: number;
  interactionTypes: string[];
}

export interface GenerationOptions {
  userBehaviorData?: BehaviorData;
  culturalContext?: string;
  targetDuration?: number;
  contentType: string;
}
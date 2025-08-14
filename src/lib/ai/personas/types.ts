// Universal Persona System Types
// 글로벌 다국어 페르소나 시스템을 위한 타입 정의

/**
 * 🌍 글로벌 페르소나 카탈로그
 * 전 세계 모든 관광지에 적용 가능한 15개 전문가 페르소나
 */
export type GlobalPersonaType = 
  | 'architecture_engineer'     // 🏗️ 건축 & 공학 전문가 (현대 건물, 타워, 교량)
  | 'ancient_civilizations'     // 🏛️ 고대문명 전문가 (고고학 유적, 고대 기념물)
  | 'royal_heritage'           // 🏰 왕실 유산 전문가 (궁궐, 성, 왕실 거주지)
  | 'sacred_spiritual'         // ⛪ 성지 & 영성 전문가 (종교 유적, 영성 장소)
  | 'arts_culture'            // 🎨 예술 & 문화 전문가 (박물관, 갤러리, 문화센터)
  | 'nature_ecology'          // 🌿 자연 & 생태 전문가 (국립공원, 자연경관)
  | 'history_heritage'        // 🏛️ 역사 & 유산 전문가 (역사 유적, 기념관)
  | 'urban_life'              // 🛍️ 도시생활 전문가 (쇼핑지구, 현대 도심)
  | 'culinary_culture'        // 🍜 요리문화 전문가 (음식시장, 요리지구)
  | 'entertainment'           // 🎪 엔터테인먼트 전문가 (테마파크, 엔터테인먼트 지구)
  | 'sports_recreation'       // 🏃 스포츠 & 레크리에이션 전문가 (스포츠 시설, 레크리에이션 지역)
  | 'nightlife_social'        // 🌃 나이트라이프 & 사교 전문가 (엔터테인먼트 지구, 사교 장소)
  | 'family_experience'       // 👨‍👩‍👧‍👦 가족체험 전문가 (가족친화 명소)
  | 'romantic_experience'     // 💑 로맨틱 체험 전문가 (로맨틱 여행지)
  | 'educational'             // 🎓 교육 전문가 (대학, 교육기관);

/**
 * 🌍 문화적 컨텍스트 지역 분류
 */
export type CulturalRegion = 
  | 'western'      // 서구 문화권 (유럽, 북미, 오세아니아)
  | 'eastern'      // 동양 문화권 (동아시아, 동남아시아)
  | 'islamic'      // 이슬람 문화권 (중동, 북아프리카)
  | 'latin'        // 라틴 문화권 (남미, 중미)
  | 'african'      // 아프리카 문화권 (사하라 이남 아프리카)
  | 'indigenous'   // 원주민 문화권 (아메리카, 오세아니아 원주민)
  | 'global';      // 글로벌/다문화 (국제적 성격);

/**
 * 🎭 커뮤니케이션 스타일
 */
export type CommunicationStyle = 
  | 'formal'       // 격식 있는 (공식적인 장소)
  | 'friendly'     // 친근한 (일반적인 관광지)
  | 'reverent'     // 경건한 (종교적 장소)
  | 'educational'  // 교육적 (학습 중심)
  | 'entertaining' // 재미있는 (엔터테인먼트)
  | 'intimate';    // 친밀한 (로맨틱한 장소);

/**
 * 📚 콘텐츠 깊이 수준
 */
export type ContentDepth = 'basic' | 'intermediate' | 'detailed';

/**
 * 🌍 문화적 컨텍스트 정보
 */
export interface CulturalContext {
  region: CulturalRegion;
  communicationStyle: CommunicationStyle;
  contentDepth: ContentDepth;
  culturalReferences: string[];
  languageSpecificNuances: Record<string, string>;
}

/**
 * 🎭 글로벌 페르소나 정의
 */
export interface GlobalPersona {
  type: GlobalPersonaType;
  icon: string;
  name: Record<string, string>; // 다국어 이름
  description: Record<string, string>; // 다국어 설명
  expertise: string[];
  communicationStyle: CommunicationStyle;
  culturalAdaptations: Record<CulturalRegion, PersonaCulturalAdaptation>;
}

/**
 * 🎨 페르소나 문화적 적응 설정
 */
export interface PersonaCulturalAdaptation {
  tone: string;
  emphasis: string[];
  culturalReferences: string[];
  avoidTopics?: string[];
  preferredExamples: string[];
}

/**
 * 🔍 위치 분석 컨텍스트
 */
export interface LocationContext {
  name: string;
  coordinates?: { lat: number; lng: number };
  googlePlaceType?: string[];
  wikiDataType?: string;
  culturalRegion?: CulturalRegion;
  historicalPeriod?: string;
  architecturalStyle?: string;
  primaryFunction?: string;
  userIntent?: string;
  language: string;
  parentRegion?: string;
}

/**
 * 🎯 페르소나 분류 결과
 */
export interface PersonaClassificationResult {
  persona: GlobalPersona;
  confidence: number;
  reasoning: string[];
  alternativePersonas: GlobalPersona[];
  culturalContext: CulturalContext;
  recommendedPromptAdaptations: PromptAdaptation[];
}

/**
 * 📝 프롬프트 적응 설정
 */
export interface PromptAdaptation {
  type: 'tone' | 'content' | 'structure' | 'cultural_reference';
  description: string;
  value: string;
}

/**
 * 🤖 AI 기반 분석 결과
 */
export interface AIAnalysisResult {
  locationCategory: string;
  culturalSignificance: string;
  architecturalStyle: string;
  historicalContext: string;
  primaryAudience: string;
  confidence: number;
  reasoning: string[];
}

/**
 * 🔧 분류기 설정
 */
export interface ClassifierConfig {
  aiModel: 'gemini' | 'gpt' | 'claude';
  language: string;
  fallbackPersona: GlobalPersonaType;
  confidenceThreshold: number;
  enableCulturalAdaptation: boolean;
  enableAIAnalysis: boolean;
}

/**
 * 📊 분류기 성능 메트릭
 */
export interface ClassifierMetrics {
  totalClassifications: number;
  averageConfidence: number;
  accuracyScore: number;
  culturalAdaptationUsage: number;
  topPersonas: Array<{ persona: GlobalPersonaType; count: number }>;
  averageResponseTime: number;
}
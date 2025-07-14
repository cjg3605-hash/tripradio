// 동적 임포트를 사용한 다국어 프롬프트 최적화

// 타입 정의
export interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
  tourDuration?: number;      // gemini.ts 호환성을 위해 추가
  preferredStyle?: string;    // gemini.ts 호환성을 위해 추가
  language?: string;          // gemini.ts 호환성을 위해 추가
}

// 인터페이스 정의
export interface LanguageConfig {
  code: string;
  name: string;
  ttsLang: string;
}

export interface LocationTypeConfig {
  keywords: string[];
  expertRole: string;
  focusAreas: string[];
  specialRequirements: string;
  chapterStructure: string;
}

export interface LanguageHeader {
  role: string;
  goal: string;
  outputInstructions: string;
  qualityStandards: string;
}

// 지원 언어 설정
export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  ko: { code: 'ko', name: '한국어', ttsLang: 'ko-KR' },
  en: { code: 'en', name: 'English', ttsLang: 'en-US' },
  ja: { code: 'ja', name: '日本語', ttsLang: 'ja-JP' },
  zh: { code: 'zh', name: '中文', ttsLang: 'zh-CN' },
  es: { code: 'es', name: 'Español', ttsLang: 'es-ES' }
};

// 언어별 실시간 가이드 키 매핑
export const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

// 위치 유형별 전문 가이드 스타일 정의
export const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  architecture: {
    keywords: ['궁궐', '성당', '사원', '교회', '성곽', '탑', '건축', '전각', '건물', 'cathedral', 'palace', 'temple', 'tower', 'architecture'],
    expertRole: '건축사이자 문화재 전문가',
    focusAreas: ['건축 양식과 기법', '구조적 특징', '건축재료와 공법', '시대별 건축 변천사', '장인정신과 기술'],
    specialRequirements: '건축학적 디테일, 구조 분석, 건축 기법의 혁신성, 시대적 의미를 중점적으로 다뤄야 합니다.',
    chapterStructure: '건축물의 외관 → 구조적 특징 → 세부 장식 → 건축 기법 → 역사적 의의 순서'
  },
  historical: {
    keywords: ['박물관', '유적지', '기념관', '사적', '역사', '유물', '전쟁', '독립', 'museum', 'historical', 'memorial', 'heritage'],
    expertRole: '역사학자이자 문화유산 해설사',
    focusAreas: ['역사적 사건과 맥락', '시대적 배경', '인물들의 이야기', '사회문화적 의미', '현재적 교훈'],
    specialRequirements: '역사적 사실의 정확성, 시대적 맥락, 인물 중심 스토리텔링, 현재와의 연결점을 강조해야 합니다.',
    chapterStructure: '역사적 배경 → 주요 사건 → 핵심 인물들 → 문화적 영향 → 현재적 의미 순서'
  },
  nature: {
    keywords: ['공원', '산', '강', '바다', '숲', '정원', '자연', '생태', '경관', 'park', 'mountain', 'nature', 'garden', 'scenic'],
    expertRole: '생태학자이자 자연환경 해설사',
    focusAreas: ['생태계와 생물다양성', '지형과 지질학적 특징', '계절별 변화', '환경보전의 중요성', '자연과 인간의 관계'],
    specialRequirements: '생태학적 정보, 자연현상 설명, 환경보전 메시지, 계절별 특징을 중점적으로 다뤄야 합니다.',
    chapterStructure: '자연환경 개관 → 생태계 특징 → 주요 동식물 → 지질학적 특성 → 보전의 의미 순서'
  },
  culinary: {
    keywords: ['맛집', '음식', '시장', '골목', '전통음식', '요리', '카페', '레스토랑', 'food', 'market', 'restaurant', 'culinary', 'cuisine'],
    expertRole: '음식문화 연구가이자 미식 전문가',
    focusAreas: ['지역 특색 음식', '요리 역사와 전통', '식재료와 조리법', '음식문화와 사회', '미식 체험 포인트'],
    specialRequirements: '음식의 역사와 문화적 의미, 맛의 특징, 조리법의 비밀, 지역성을 중점적으로 다뤄야 합니다.',
    chapterStructure: '음식문화 개관 → 대표 음식들 → 조리법과 재료 → 맛집 투어 → 미식 체험법 순서'
  },
  religious: {
    keywords: ['절', '교회', '성당', '신사', '종교', '불교', '기독교', '천주교', '신앙', 'temple', 'church', 'shrine', 'religious', 'buddhist'],
    expertRole: '종교학자이자 문화사 전문가',
    focusAreas: ['종교적 의미와 신앙 체계', '종교 예술과 건축', '종교 의식과 전통', '종교 문화의 사회적 역할', '종교간 화합과 이해'],
    specialRequirements: '종교적 존중감을 바탕으로 신앙의 본질, 종교 예술, 영성의 가치, 종교 문화를 중점적으로 다뤄야 합니다.',
    chapterStructure: '종교적 배경 → 신앙의 특징 → 종교 건축과 예술 → 의식과 전통 → 영성의 의미 순서'
  },
  default: {
    keywords: [],
    expertRole: '문화관광 전문 해설사',
    focusAreas: ['역사와 문화', '건축과 예술', '사회적 의미', '관광 정보', '체험 활동'],
    specialRequirements: '방문객의 흥미를 끄는 다양한 이야기와 정보를 균형있게 제공해야 합니다.',
    chapterStructure: '전체 개관 → 주요 특징들 → 세부 관람 → 문화적 의미 → 방문 정보 순서'
  }
};

// 위치 유형 분석 함수
export function analyzeLocationType(locationName: string): string {
  const normalizedName = locationName.toLowerCase();
  
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (config.keywords.some(keyword => normalizedName.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  
  return 'default';
}

// 위치 유형별 예시 JSON 생성
export function generateTypeSpecificExample(locationType: string, locationName: string): any {
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType] || LOCATION_TYPE_CONFIGS.default;
  
  return {
    overview: {
      title: `${locationName} 개관`,
      description: `${typeConfig.specialRequirements}에 따른 상세 설명`,
      highlights: typeConfig.focusAreas,
      visitInfo: {
        duration: "2-3시간",
        bestTime: "상황에 따라",
        accessibility: "접근성 정보"
      }
    },
    route: {
      steps: [
        { 
          title: "입구 및 전체 개관",
          description: "방문 시작점에서의 오리엔테이션",
          duration: "15분",
          highlights: ["첫인상", "전체 구조 파악"]
        }
      ],
      tips: [`${typeConfig.chapterStructure}에 따른 효율적 관람`],
      duration: "전체 소요시간"
    },
    realTimeGuide: {
      chapters: [
        {
          title: "입구 및 전체 개관",
          narrative: "2 100자 이상의 연속 서사 - 현장 묘사 · 역사 · 인물 이야기가 자연스레 이어진 스크립트",


          nextDirection: "300자 이상의 이동 안내 - 다음 관람 지점으로의 명확한 경로 및 거리 정보"
        }
      ]
    }
  };
}

// 비동기 프롬프트 생성 함수들
export async function createAutonomousGuidePrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> {
  try {
    // 확장자 제거로 안정성 확보
    let langModule;
    switch (language) {
      case 'ko':
        langModule = await import('./korean');
        return langModule.createKoreanGuidePrompt(locationName, userProfile);
      case 'en':
        langModule = await import('./english');
        return langModule.createEnglishGuidePrompt(locationName, userProfile);
      case 'ja':
        langModule = await import('./japanese');
        return langModule.createJapaneseGuidePrompt(locationName, userProfile);
      case 'zh':
        langModule = await import('./chinese');
        return langModule.createChineseGuidePrompt(locationName, userProfile);
      case 'es':
        langModule = await import('./spanish');
        return langModule.createSpanishGuidePrompt(locationName, userProfile);
      default:
        console.warn(`Language ${language} not found, falling back to Korean`);
        const koModule = await import('./korean');
        return koModule.createKoreanGuidePrompt(locationName, userProfile);
    }
  } catch (error) {
    console.warn(`Language module ${language} not found, falling back to Korean`);
    const koModule = await import('./korean');
    return koModule.createKoreanGuidePrompt(locationName, userProfile);
  }
}

export async function createFinalGuidePrompt(
  locationName: string,
  language: string = 'ko',
  researchData: any,
  userProfile?: UserProfile
): Promise<string> {
  try {
    let langModule;
    switch (language) {
      case 'ko':
        langModule = await import('./korean');
        return langModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
      case 'en':
        langModule = await import('./english');
        return langModule.createEnglishFinalPrompt(locationName, researchData, userProfile);
      case 'ja':
        langModule = await import('./japanese');
        return langModule.createJapaneseFinalPrompt(locationName, researchData, userProfile);
      case 'zh':
        langModule = await import('./chinese');
        return langModule.createChineseFinalPrompt(locationName, researchData, userProfile);
      case 'es':
        langModule = await import('./spanish');
        return langModule.createSpanishFinalPrompt(locationName, researchData, userProfile);
      default:
        console.warn(`Language ${language} not found, falling back to Korean`);
        const koModule = await import('./korean');
        return koModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
    }
  } catch (error) {
    console.warn(`Language module ${language} not found, falling back to Korean`);
    const koModule = await import('./korean');
    return koModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
  }
}

// GPT-4O용 스키마 기반 가이드 생성 프롬프트 (기존 유지)
export function generateAudioGuidePrompt(
  location: string,
  language: string,
  userPrompt: string
): {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  response_format: {
    type: string;
    json_schema: {
      name: string;
      strict: boolean;
      schema: {
        type: string;
        properties: {
          title: { type: string; description: string };
          introduction: { type: string; description: string };
          chapters: {
            type: string;
            items: {
              type: string;
              properties: {
                chapterTitle: { type: string; description: string };
                content: { type: string; description: string };
                humanStories: { type: string; description: string };
                coreNarrative: { type: string; description: string };
                nextDirection: { type: string; description: string };
                sceneDescription: { type: string; description: string };
                route: { type: string; description: string };
                realTimeGuide: { 
                  type: 'object'; 
                  properties: { 
                    number: { type: 'integer' }, 
                    order: { type: 'string' } 
                  } 
                };
              };
              required: string[];
              additionalProperties: boolean;
            };
          };
        };
        required: string[];
        additionalProperties: boolean;
      };
    };
  };
} {
  return {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert in creating engaging, detailed audio guides for various locations around the world. Your goal is to generate an extremely detailed and lengthy audio guide as a single object, covering every possible detail and behind-the-scenes story.`
      },
      {
        role: 'user',
        content: `Generate an extremely detailed and lengthy audio guide for ${location} in ${language}. Include every possible detail and behind-the-scenes story.

User Requirements: ${userPrompt}

Create a comprehensive JSON object with the following structure:
- title: Main title of the audio guide
- introduction: Brief overview and welcome message
- chapters: Array of detailed chapters, each containing:
  - chapterTitle: Title of this specific chapter
  - content: Main narrative content (extremely detailed)
  - humanStories: Personal stories and anecdotes 
  - coreNarrative: Key historical/cultural information
  - nextDirection: Instructions for moving to next location
  - sceneDescription: Vivid description of the current scene
  - route: Specific routing information
  - realTimeGuide: Guide metadata (number, order)

Make sure each chapter is extremely detailed with rich storytelling, historical context, and personal anecdotes that bring the location to life.`
      }
    ],
    temperature: 0.7,
    response_format: {
      type: "json_object",
      json_schema: {
        name: "audio_guide",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Main title of the audio guide"
            },
            introduction: {
              type: "string", 
              description: "Brief overview and welcome message"
            },
            chapters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapterTitle: {
                    type: "string",
                    description: "Title of this specific chapter"
                  },
                  content: {
                    type: "string", 
                    description: "Main narrative content"
                  },
                  humanStories: {
                    type: "string",
                    description: "Personal stories and anecdotes"
                  },
                  coreNarrative: {
                    type: "string",
                    description: "Key historical/cultural information"
                  },
                  nextDirection: {
                    type: "string",
                    description: "Instructions for moving to next location"
                  },
                  sceneDescription: {
                    type: "string",
                    description: "Vivid description of the current scene"
                  },
                  route: {
                    type: "string",
                    description: "Specific routing information"
                  },
                  realTimeGuide: {
                    type: "object",
                    properties: {
                      number: {
                        type: "integer"
                      },
                      order: {
                        type: "string"
                      }
                    }
                  }
                },
                required: ["chapterTitle", "content", "humanStories", "coreNarrative", "nextDirection", "sceneDescription", "route", "realTimeGuide"],
                additionalProperties: false
              }
            }
          },
          required: ["title", "introduction", "chapters"],
          additionalProperties: false
        }
      }
    }
  };
}
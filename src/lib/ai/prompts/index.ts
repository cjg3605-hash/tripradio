// src/lib/ai/prompts/index.ts - 완전히 새로운 최소화된 인덱스 라우터

import { UserProfile } from '@/types/guide';
import { LanguageConfig, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';

// ===============================
// 🔧 인터페이스 정의
// ===============================

export interface LocationTypeConfig {
  keywords: string[];
  expertRole: string;
  focusAreas: string[];
  specialRequirements: string;
  chapterStructure: string;
  recommendedSpots?: number;
}

// ===============================
// 🔧 공통 설정들 (모든 언어가 공유)
// ===============================

// 기존 SUPPORTED_LANGUAGES를 Record로 변환하여 타입 충돌 해결
export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = 
  SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang.code] = lang;
    return acc;
  }, {} as Record<string, LanguageConfig>);

const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  architecture: {
    keywords: ['궁궐', '성당', '사원', '교회', '성곽', '탑', '건축', '전각', '건물', 'cathedral', 'palace', 'temple', 'tower', 'architecture'],
    expertRole: '건축사이자 문화재 전문가',
    focusAreas: ['건축 양식과 기법', '구조적 특징', '건축재료와 공법', '시대별 건축 변천사', '장인정신과 기술'],
    specialRequirements: '건축학적 디테일, 구조 분석, 건축 기법의 혁신성, 시대적 의미를 중점적으로 다뤄야 합니다.',
    chapterStructure: '건축물의 외관 → 구조적 특징 → 세부 장식 순서',
    recommendedSpots: 6
  },
  historical: {
    keywords: ['박물관', '유적지', '기념관', '사적', '문화재', '역사', '전쟁', '독립', 'museum', 'historical', 'memorial', 'heritage'],
    expertRole: '역사학자이자 문화유산 해설사',
    focusAreas: ['역사적 사건과 맥락', '시대적 배경', '인물들의 이야기', '사회문화적 변화', '유물과 유적의 의미'],
    specialRequirements: '역사적 사실의 정확성과 인물 중심 스토리텔링을 강조해야 합니다.',
    chapterStructure: '역사적 배경 → 주요 사건 → 핵심 인물들 순서',
    recommendedSpots: 7
  },
  nature: {
    keywords: ['공원', '산', '강', '바다', '숲', '계곡', '호수', '자연', '생태', 'park', 'mountain', 'nature', 'garden', 'forest'],
    expertRole: '생태학자이자 자연환경 해설사',
    focusAreas: ['생태계와 생물다양성', '지형과 지질학적 특징', '환경보전', '기후와 자연현상', '동식물의 특성'],
    specialRequirements: '생태학적 정보와 환경보전 메시지를 중점적으로 다뤄야 합니다.',
    chapterStructure: '자연환경 개관 → 생태계 특징 → 주요 동식물 순서',
    recommendedSpots: 5
  },
  cultural: {
    keywords: ['예술', '문화', '전통', '공연', '축제', '예술관', '갤러리', 'art', 'culture', 'traditional', 'festival', 'gallery'],
    expertRole: '문화예술 전문가이자 큐레이터',
    focusAreas: ['예술사와 미학', '문화적 맥락', '작가와 작품', '전통과 현대의 만남', '예술 기법과 재료'],
    specialRequirements: '예술적 감성과 문화적 깊이를 동시에 전달해야 합니다.',
    chapterStructure: '예술적 배경 → 주요 작품 → 문화적 의미 순서',
    recommendedSpots: 6
  },
  commercial: {
    keywords: ['시장', '상점', '쇼핑', '거리', '상가', '백화점', '전통시장', 'market', 'shopping', 'street', 'store'],
    expertRole: '도시문화 연구가이자 상권 전문가',
    focusAreas: ['상업문화와 경제', '지역 특산품', '전통과 현대 상업', '도시 발전사', '생활문화'],
    specialRequirements: '경제적 맥락과 생활문화의 변화상을 흥미롭게 전달해야 합니다.',
    chapterStructure: '상권 형성사 → 주요 상점가 → 특색 있는 업종 순서',
    recommendedSpots: 5
  },
  religious: {
    keywords: ['사찰', '교회', '성당', '종교', '절', '신앙', '영성', 'temple', 'church', 'religious', 'spiritual'],
    expertRole: '종교학자이자 영성 가이드',
    focusAreas: ['종교적 의미와 철학', '건축과 상징', '신앙 생활', '종교 예술', '영성과 수행'],
    specialRequirements: '종교적 존경심을 바탕으로 깊이 있는 영성적 메시지를 전달해야 합니다.',
    chapterStructure: '종교적 배경 → 성스러운 공간 → 신앙의 의미 순서',
    recommendedSpots: 4
  },
  general: {
    keywords: [],
    expertRole: '전문 관광 가이드',
    focusAreas: ['역사와 문화', '지역 특색', '관광 정보', '일반적 상식', '흥미로운 이야기'],
    specialRequirements: '균형 잡힌 관점에서 전반적인 정보를 제공해야 합니다.',
    chapterStructure: '전체 개관 → 주요 명소 → 특별한 이야기 순서',
    recommendedSpots: 6
  }
};

// ===============================
// 🔧 유틸리티 함수들
// ===============================

/**
 * 장소명에서 위치 유형 감지
 */
export function analyzeLocationType(locationName: string): string {
  const normalizedName = locationName.toLowerCase();
  
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (config.keywords.some(keyword => normalizedName.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  
  return 'general';
}



/**
 * 권장 스팟 수 계산
 */
export function getRecommendedSpotCount(locationName: string): { default: number; min: number; max: number } {
  const locationType = analyzeLocationType(locationName);
  const config = LOCATION_TYPE_CONFIGS[locationType];
  const baseCount = config.recommendedSpots || 6;
  
  return {
    default: baseCount,
    min: Math.max(3, baseCount - 2),
    max: baseCount + 3
  };
}

/**
 * 복합 위치 유형 감지 (여러 키워드 매칭)
 */
export function detectMultipleLocationTypes(locationName: string): string[] {
  const normalizedName = locationName.toLowerCase();
  const matchedTypes: string[] = [];
  
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (type === 'general') continue;
    
    if (config.keywords.some(keyword => normalizedName.includes(keyword.toLowerCase()))) {
      matchedTypes.push(type);
    }
  }
  
  return matchedTypes.length > 0 ? matchedTypes : ['general'];
}

// ===============================
// 🔧 메인 프롬프트 라우터
// ===============================

/**
 * 메인 가이드 생성 프롬프트 라우터
 */
export async function createPrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> {
  const langCode = language.slice(0, 2);
  
  try {
    switch (langCode) {
      case 'ko': {
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
      }
      case 'en': {
        // 영어 파일이 없으면 한국어로 폴백
        try {
          const englishModule = await import('./english');
          return englishModule.createEnglishGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      case 'ja': {
        // 일본어 파일이 없으면 한국어로 폴백
        try {
          const japaneseModule = await import('./japanese');
          return japaneseModule.createJapaneseGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      case 'zh': {
        // 중국어 파일이 없으면 한국어로 폴백
        try {
          const chineseModule = await import('./chinese');
          return chineseModule.createChineseGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      case 'es': {
        // 스페인어 파일이 없으면 한국어로 폴백
        try {
          const spanishModule = await import('./spanish');
          return spanishModule.createSpanishGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      default:
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
    }
  } catch (error) {
    console.error(`Failed to load ${language} prompts:`, error);
    const koreanModule = await import('./korean');
    return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
  }
}

/**
 * 구조 생성 프롬프트 라우터
 */
export async function createStructurePrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> {
  const langCode = language.slice(0, 2);
  
  try {
    switch (langCode) {
      case 'ko': {
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanStructurePrompt(locationName, language, userProfile);
      }
      case 'en': {
        try {
          const englishModule = await import('./english');
          return englishModule.createEnglishStructurePrompt(locationName, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanStructurePrompt(locationName, language, userProfile);
        }
      }
      case 'ja': {
        try {
          const japaneseModule = await import('./japanese');
          return japaneseModule.createJapaneseStructurePrompt(locationName, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanStructurePrompt(locationName, language, userProfile);
        }
      }
      case 'zh': {
        try {
          const chineseModule = await import('./chinese');
          return chineseModule.createChineseStructurePrompt(locationName, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanStructurePrompt(locationName, language, userProfile);
        }
      }
      case 'es': {
        try {
          const spanishModule = await import('./spanish');
          return spanishModule.createSpanishStructurePrompt(locationName, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanStructurePrompt(locationName, language, userProfile);
        }
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanStructurePrompt(locationName, language, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load ${language} structure prompts:`, error);
    const koreanModule = await import('./korean');
    return koreanModule.createKoreanStructurePrompt(locationName, language, userProfile);
  }
}

/**
 * 챕터 생성 프롬프트 라우터
 */
export async function createChapterPrompt(
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> {
  const langCode = language.slice(0, 2);
  
  try {
    switch (langCode) {
      case 'ko': {
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
      case 'en': {
        try {
          const englishModule = await import('./english');
          return englishModule.createEnglishChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        }
      }
      case 'ja': {
        try {
          const japaneseModule = await import('./japanese');
          return japaneseModule.createJapaneseChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        }
      }
      case 'zh': {
        try {
          const chineseModule = await import('./chinese');
          return chineseModule.createChineseChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        }
      }
      case 'es': {
        try {
          const spanishModule = await import('./spanish');
          return spanishModule.createSpanishChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
        }
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load ${language} chapter prompts:`, error);
    const koreanModule = await import('./korean');
    return koreanModule.createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
  }
}

/**
 * 최종 가이드 생성 프롬프트 라우터 (리서치 데이터 포함)
 */
export async function createFinalGuidePrompt(
  locationName: string,
  researchData: any,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> {
  const langCode = language.slice(0, 2);
  
  try {
    switch (langCode) {
      case 'ko': {
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
      }
      case 'en': {
        try {
          const englishModule = await import('./english');
          return englishModule.createEnglishFinalPrompt(locationName, researchData, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
        }
      }
      case 'ja': {
        try {
          const japaneseModule = await import('./japanese');
          return japaneseModule.createJapaneseFinalPrompt(locationName, researchData, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
        }
      }
      case 'zh': {
        try {
          const chineseModule = await import('./chinese');
          return chineseModule.createChineseFinalPrompt(locationName, researchData, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
        }
      }
      case 'es': {
        try {
          const spanishModule = await import('./spanish');
          return spanishModule.createSpanishFinalPrompt(locationName, researchData, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
        }
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load ${language} final prompts:`, error);
    const koreanModule = await import('./korean');
    return koreanModule.createKoreanFinalPrompt(locationName, researchData, userProfile);
  }
}

/**
 * 자율 리서치 기반 가이드 생성 프롬프트 라우터
 */
export async function createAutonomousGuidePrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> {
  const langCode = language.slice(0, 2);
  
  try {
    switch (langCode) {
      case 'ko': {
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
      }
      case 'en': {
        try {
          const englishModule = await import('./english');
          return englishModule.createEnglishGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      case 'ja': {
        try {
          const japaneseModule = await import('./japanese');
          return japaneseModule.createJapaneseGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      case 'zh': {
        try {
          const chineseModule = await import('./chinese');
          return chineseModule.createChineseGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      case 'es': {
        try {
          const spanishModule = await import('./spanish');
          return spanishModule.createSpanishGuidePrompt(locationName, userProfile);
        } catch {
          const koreanModule = await import('./korean');
          return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
        }
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const koreanModule = await import('./korean');
        return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load ${language} autonomous prompts:`, error);
    const koreanModule = await import('./korean');
    return koreanModule.createKoreanGuidePrompt(locationName, userProfile);
  }
}

/**
 * @deprecated 동기 버전은 더 이상 사용하지 않습니다. createAutonomousGuidePrompt를 사용하세요.
 */
export function createAutonomousGuidePromptSync(
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): string {
  console.warn('createAutonomousGuidePromptSync is deprecated. Use async version.');
  
  const locationType = analyzeLocationType(locationName);
  const spotCount = getRecommendedSpotCount(locationName);
  
  return `# "${locationName}" 가이드 생성
언어: ${language}
위치 타입: ${locationType}
권장 스팟 수: ${spotCount.default}

⚠️ 동기 버전은 deprecated입니다. 
createAutonomousGuidePrompt(locationName, language, userProfile)를 사용하세요.`;
}

// ===============================
// 🔧 레거시 호환성 및 기타 함수들
// ===============================

/**
 * 언어별 설정 가져오기
 */
export function getLanguageConfig(language: string): LanguageConfig {
  const langCode = language.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode] || LANGUAGE_CONFIGS.ko;
}

/**
 * 지원되는 언어 목록 가져오기
 */
export function getSupportedLanguages(): LanguageConfig[] {
  return SUPPORTED_LANGUAGES;
}

/**
 * 언어 코드가 지원되는지 확인
 */
export function isLanguageSupported(language: string): boolean {
  const langCode = language.slice(0, 2);
  return langCode in LANGUAGE_CONFIGS;
}

/**
 * 위치별 권장 챕터 수 계산
 */
export function calculateOptimalChapterCount(locationName: string): number {
  const spotCount = getRecommendedSpotCount(locationName);
  return Math.min(Math.max(spotCount.default, 5), 8); // 5-8개 챕터 권장
}

/**
 * 사용자 프로필 기반 맞춤 설정
 */
export function getPersonalizedSettings(userProfile?: UserProfile): {
  complexity: 'simple' | 'moderate' | 'detailed';
  focus: string[];
  tone: 'formal' | 'casual' | 'friendly';
} {
  if (!userProfile) {
    return {
      complexity: 'moderate',
      focus: ['general'],
      tone: 'friendly'
    };
  }

  const complexity = userProfile.knowledgeLevel === '초급' ? 'simple' :
                    userProfile.knowledgeLevel === '고급' ? 'detailed' : 'moderate';
  
  const focus = userProfile.interests || ['general'];
  
  const tone = userProfile.preferredStyle === '전문적' ? 'formal' :
               userProfile.preferredStyle === '캐주얼' ? 'casual' : 'friendly';

  return { complexity, focus, tone };
}

// ===============================
// 🔧 기존 코드와의 호환성을 위한 export
// ===============================

// 기존 코드에서 사용하던 export들
export { REALTIME_GUIDE_KEYS };
export type { LanguageConfig };

// 기존에 사용되던 상수들
export const LOCATION_TYPES = Object.keys(LOCATION_TYPE_CONFIGS);
export const DEFAULT_LANGUAGE = 'ko';
export const DEFAULT_CHAPTER_COUNT = 6;

// 기존 함수명과의 호환성
export { analyzeLocationType as detectLocationType };

// LOCATION_TYPE_CONFIGS export 추가
export { LOCATION_TYPE_CONFIGS };

// 기본 export (호환성)
export default {
  createPrompt,
  createStructurePrompt,
  createChapterPrompt,
  createFinalGuidePrompt,
  createAutonomousGuidePrompt,
  analyzeLocationType,
  getLanguageConfig,
  getSupportedLanguages,
  isLanguageSupported,
  getRecommendedSpotCount,
  calculateOptimalChapterCount,
  getPersonalizedSettings,
  LANGUAGE_CONFIGS,
  REALTIME_GUIDE_KEYS,
  LOCATION_TYPE_CONFIGS
};
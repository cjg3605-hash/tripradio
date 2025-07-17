// src/lib/ai/prompts/index.ts - 완전히 새로운 최소화된 인덱스 라우터

import { UserProfile } from '@/types/guide';
import { LanguageConfig as BaseLanguageConfig } from '../../../contexts/LanguageContext';
export interface LanguageConfig {
  code: string;
  name: string;
  ttsLang: string;
  flag: string;
  nativeName: string;
}

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

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  ko: { code: 'ko', name: '한국어', ttsLang: 'ko-KR', flag: '🇰🇷', nativeName: '한국어' },
  en: { code: 'en', name: 'English', ttsLang: 'en-US', flag: '🇺🇸', nativeName: 'English' },
  ja: { code: 'ja', name: '日本語', ttsLang: 'ja-JP', flag: '🇯🇵', nativeName: '日本語' },
  zh: { code: 'zh', name: '中文', ttsLang: 'zh-CN', flag: '🇨🇳', nativeName: '中文' },
  es: { code: 'es', name: 'Español', ttsLang: 'es-ES', flag: '🇪🇸', nativeName: 'Español' }
};

const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  architecture: {
    keywords: ['궁궐', '성당', '사원', 'cathedral', 'palace', 'temple', 'tower'],
    expertRole: '건축사이자 문화재 전문가',
    focusAreas: ['건축 양식과 기법', '구조적 특징', '건축재료와 공법'],
    specialRequirements: '건축학적 디테일과 구조 분석을 중점적으로 다뤄야 합니다.',
    chapterStructure: '건축물의 외관 → 구조적 특징 → 세부 장식 순서',
    recommendedSpots: 6
  },
  historical: {
    keywords: ['박물관', '유적지', '기념관', 'museum', 'historical', 'memorial'],
    expertRole: '역사학자이자 문화유산 해설사',
    focusAreas: ['역사적 사건과 맥락', '시대적 배경', '인물들의 이야기'],
    specialRequirements: '역사적 사실의 정확성과 인물 중심 스토리텔링을 강조해야 합니다.',
    chapterStructure: '역사적 배경 → 주요 사건 → 핵심 인물들 순서',
    recommendedSpots: 7
  },
  nature: {
    keywords: ['공원', '산', '강', 'park', 'mountain', 'nature', 'garden'],
    expertRole: '생태학자이자 자연환경 해설사',
    focusAreas: ['생태계와 생물다양성', '지형과 지질학적 특징', '환경보전'],
    specialRequirements: '생태학적 정보와 환경보전 메시지를 중점적으로 다뤄야 합니다.',
    chapterStructure: '자연환경 개관 → 생태계 특징 → 주요 동식물 순서',
    recommendedSpots: 5
  },
  general: {
    keywords: [],
    expertRole: '전문 관광 가이드',
    focusAreas: ['역사와 문화', '지역 특색', '관광 정보'],
    specialRequirements: '균형 잡힌 관점에서 전반적인 정보를 제공해야 합니다.',
    chapterStructure: '일반적인 소개 → 주요 특징 → 관광 정보 순서',
    recommendedSpots: 6
  }
};

// ===============================
// 🛠️ 유틸리티 함수들
// ===============================

function analyzeLocationType(locationName: string): string {
  const lowerName = locationName.toLowerCase();
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (config.keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  return 'general';
}

function getRecommendedSpotCount(locationName: string) {
  const type = analyzeLocationType(locationName);
  const config = LOCATION_TYPE_CONFIGS[type] || LOCATION_TYPE_CONFIGS.general;
  
  return {
    min: Math.max(3, (config.recommendedSpots || 6) - 2),
    max: Math.min(8, (config.recommendedSpots || 6) + 2),
    default: config.recommendedSpots || 6
  };
}

function getTTSLanguage(language: string): string {
  const langCode = language?.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode]?.ttsLang || 'ko-KR';
}

function getLanguageConfig(language: string): LanguageConfig {
  const langCode = language?.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode] || LANGUAGE_CONFIGS.ko;
}

function getRealTimeGuideKey(language: string): string {
  const langCode = language?.slice(0, 2);
  return REALTIME_GUIDE_KEYS[langCode] || REALTIME_GUIDE_KEYS.ko;
}

// ===============================
// 🚀 동적 임포트 라우터 함수들
// ===============================

/**
 * 메인 가이드 생성 프롬프트 라우터
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

// ===============================
// 🎯 공통 설정 및 유틸리티 Export
// ===============================

export {
  LOCATION_TYPE_CONFIGS,
  REALTIME_GUIDE_KEYS,
  analyzeLocationType,
  getRecommendedSpotCount,
  getTTSLanguage,
  getLanguageConfig,
  getRealTimeGuideKey
};

// ===============================
// 🔄 기존 API 호환성 유지
// ===============================

/**
 * 동기 버전 - 기존 코드 호환성
 * @deprecated 비동기 버전 사용 권장
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
// 동적 임포트를 사용한 다국어 프롬프트 최적화

import { UserProfile } from '@/types/guide';

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
  recommendedSpots?: number;
}

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  ko: { code: 'ko', name: '한국어', ttsLang: 'ko-KR' },
  en: { code: 'en', name: 'English', ttsLang: 'en-US' },
  ja: { code: 'ja', name: '日本語', ttsLang: 'ja-JP' },
  zh: { code: 'zh', name: '中文', ttsLang: 'zh-CN' },
  es: { code: 'es', name: 'Español', ttsLang: 'es-ES' }
};

export const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

export const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  architecture: {
    keywords: ['궁궐', '성당', '사원', 'cathedral', 'palace', 'temple', 'tower'],
    expertRole: '건축사이자 문화재 전문가',
    focusAreas: ['건축 양식과 기법', '구조적 특징', '건축재료와 공법'],
    specialRequirements: '건축학적 디테일과 구조 분석을 중점적으로 다뤄야 합니다.',
    chapterStructure: '건축물의 외관 → 구조적 특징 → 세부 장식 순서'
  },
  historical: {
    keywords: ['박물관', '유적지', '기념관', 'museum', 'historical', 'memorial'],
    expertRole: '역사학자이자 문화유산 해설사',
    focusAreas: ['역사적 사건과 맥락', '시대적 배경', '인물들의 이야기'],
    specialRequirements: '역사적 사실의 정확성과 인물 중심 스토리텔링을 강조해야 합니다.',
    chapterStructure: '역사적 배경 → 주요 사건 → 핵심 인물들 순서'
  },
  nature: {
    keywords: ['공원', '산', '강', 'park', 'mountain', 'nature', 'garden'],
    expertRole: '생태학자이자 자연환경 해설사',
    focusAreas: ['생태계와 생물다양성', '지형과 지질학적 특징', '환경보전'],
    specialRequirements: '생태학적 정보와 환경보전 메시지를 중점적으로 다뤄야 합니다.',
    chapterStructure: '자연환경 개관 → 생태계 특징 → 주요 동식물 순서'
  },
  general: {
    keywords: [],
    expertRole: '전문 관광 가이드',
    focusAreas: ['역사와 문화', '지역 특색', '관광 정보'],
    specialRequirements: '균형 잡힌 관점에서 전반적인 정보를 제공해야 합니다.',
    chapterStructure: '개요 → 주요 특징 → 문화적 의미 순서'
  }
};

export const analyzeLocationType = (locationName: string): string => {
  const lowerName = locationName.toLowerCase();
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (config.keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  return 'general';
};

export const getRecommendedSpotCount = (locationName: string): { min: number, max: number, default: number } => {
  const locationType = analyzeLocationType(locationName);
  switch (locationType) {
    case 'architecture':
      return { min: 6, max: 8, default: 7 };
    case 'historical':
      return { min: 5, max: 7, default: 6 };
    case 'nature':
      return { min: 4, max: 6, default: 5 };
    default:
      return { min: 4, max: 6, default: 5 };
  }
};

// ===============================
// 다국어 프롬프트 생성 함수 (동적 임포트, 함수명 표준화)
// ===============================

export const createGuidePrompt = async (
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> => {
  try {
    switch (language) {
      case 'ko': {
        const { createKoreanGuidePrompt } = await import('./korean');
        return createKoreanGuidePrompt(locationName, userProfile);
      }
      case 'en': {
        const { createEnglishGuidePrompt } = await import('./english');
        return createEnglishGuidePrompt(locationName, userProfile);
      }
      case 'ja': {
        const { createJapaneseGuidePrompt } = await import('./japanese');
        return createJapaneseGuidePrompt(locationName, userProfile);
      }
      case 'zh': {
        const { createChineseGuidePrompt } = await import('./chinese');
        return createChineseGuidePrompt(locationName, userProfile);
      }
      case 'es': {
        const { createSpanishGuidePrompt } = await import('./spanish');
        return createSpanishGuidePrompt(locationName, userProfile);
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const { createKoreanGuidePrompt } = await import('./korean');
        return createKoreanGuidePrompt(locationName, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load language module for ${language}:`, error);
    const { createKoreanGuidePrompt } = await import('./korean');
    return createKoreanGuidePrompt(locationName, userProfile);
  }
};

export const createFinalGuidePrompt = async (
  locationName: string,
  language: string = 'ko',
  researchData: any,
  userProfile?: UserProfile
): Promise<string> => {
  try {
    switch (language) {
      case 'ko': {
        const { createKoreanFinalPrompt } = await import('./korean');
        return createKoreanFinalPrompt(locationName, researchData, userProfile);
      }
      case 'en': {
        const { createEnglishFinalPrompt } = await import('./english');
        return createEnglishFinalPrompt(locationName, researchData, userProfile);
      }
      case 'ja': {
        const { createJapaneseFinalPrompt } = await import('./japanese');
        return createJapaneseFinalPrompt(locationName, researchData, userProfile);
      }
      case 'zh': {
        const { createChineseFinalPrompt } = await import('./chinese');
        return createChineseFinalPrompt(locationName, researchData, userProfile);
      }
      case 'es': {
        const { createSpanishFinalPrompt } = await import('./spanish');
        return createSpanishFinalPrompt(locationName, researchData, userProfile);
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const { createKoreanFinalPrompt } = await import('./korean');
        return createKoreanFinalPrompt(locationName, researchData, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load language module for ${language}:`, error);
    const { createKoreanFinalPrompt } = await import('./korean');
    return createKoreanFinalPrompt(locationName, researchData, userProfile);
  }
};

export const createStructurePrompt = async (
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> => {
  try {
    switch (language) {
      case 'ko': {
        const { createKoreanStructurePrompt } = await import('./korean');
        return createKoreanStructurePrompt(locationName, language, userProfile);
      }
      case 'en': {
        const { createEnglishStructurePrompt } = await import('./english');
        return createEnglishStructurePrompt(locationName, language, userProfile);
      }
      case 'ja': {
        const { createJapaneseStructurePrompt } = await import('./japanese');
        return createJapaneseStructurePrompt(locationName, language, userProfile);
      }
      case 'zh': {
        const { createChineseStructurePrompt } = await import('./chinese');
        return createChineseStructurePrompt(locationName, language, userProfile);
      }
      case 'es': {
        const { createSpanishStructurePrompt } = await import('./spanish');
        return createSpanishStructurePrompt(locationName, language, userProfile);
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const { createKoreanStructurePrompt } = await import('./korean');
        return createKoreanStructurePrompt(locationName, language, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load language module for ${language}:`, error);
    const { createKoreanStructurePrompt } = await import('./korean');
    return createKoreanStructurePrompt(locationName, language, userProfile);
  }
};

export const createChapterPrompt = async (
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'ko',
  userProfile?: UserProfile
): Promise<string> => {
  try {
    switch (language) {
      case 'ko': {
        const { createKoreanChapterPrompt } = await import('./korean');
        return createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
      case 'en': {
        const { createEnglishChapterPrompt } = await import('./english');
        return createEnglishChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
      case 'ja': {
        const { createJapaneseChapterPrompt } = await import('./japanese');
        return createJapaneseChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
      case 'zh': {
        const { createChineseChapterPrompt } = await import('./chinese');
        return createChineseChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
      case 'es': {
        const { createSpanishChapterPrompt } = await import('./spanish');
        return createSpanishChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
      default: {
        console.warn(`Unsupported language: ${language}, falling back to Korean`);
        const { createKoreanChapterPrompt } = await import('./korean');
        return createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
      }
    }
  } catch (error) {
    console.error(`Failed to load language module for ${language}:`, error);
    const { createKoreanChapterPrompt } = await import('./korean');
    return createKoreanChapterPrompt(locationName, chapterIndex, chapterTitle, existingGuide, language, userProfile);
  }
};

// ===============================
// 유틸리티 함수들 (중복 방지)
// ===============================

export const getTTSLanguage = (language: string): string => {
  const langCode = language?.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode]?.ttsLang || 'ko-KR';
};

export const getLanguageConfig = (language: string): LanguageConfig => {
  const langCode = language?.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode] || LANGUAGE_CONFIGS.ko;
};

export const getRealTimeGuideKey = (language: string): string => {
  const langCode = language?.slice(0, 2);
  return REALTIME_GUIDE_KEYS[langCode] || REALTIME_GUIDE_KEYS.ko;
};
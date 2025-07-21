// src/lib/ai/prompts/index.ts - 완전히 새로운 최소화된 인덱스 라우터

import { UserProfile } from '@/types/guide';
// LanguageConfig는 타입으로만 import
import type { LanguageConfig } from '@/contexts/LanguageContext';

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

// 서버 사이드에서 사용 가능한 언어 설정 (클라이언트 의존성 제거)
export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  ko: { 
    code: 'ko', 
    name: '한국어', 
    flag: '🇰🇷', 
    nativeName: '한국어',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-kr)',
    ttsLang: 'ko-KR'
  },
  en: { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸', 
    nativeName: 'English',
    dir: 'ltr',
    fontFamily: 'var(--font-inter)',
    ttsLang: 'en-US'
  },
  ja: { 
    code: 'ja', 
    name: '日本語', 
    flag: '🇯🇵', 
    nativeName: '日本語',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-jp)',
    ttsLang: 'ja-JP'
  },
  zh: { 
    code: 'zh', 
    name: '中文', 
    flag: '🇨🇳', 
    nativeName: '中文',
    dir: 'ltr',
    fontFamily: 'var(--font-noto-sans-sc)',
    ttsLang: 'zh-CN'
  },
  es: { 
    code: 'es', 
    name: 'Español', 
    flag: '🇪🇸', 
    nativeName: 'Español',
    dir: 'ltr',
    fontFamily: 'var(--font-inter)',
    ttsLang: 'es-ES'
  }
};

const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

// 🎯 프롬프트 최적화된 위치 유형 분류 (9개 카테고리)
const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  // 1. 궁궐/고궁 전용 (최고 품질 가이드 필요)
  palace: {
    keywords: ['궁궐', '궁', '고궁', '왕궁', '별궁', '이궁', 'palace', 'royal', '창덕궁', '경복궁', '덕수궁', '경희궁', '창경궁'],
    expertRole: '궁궐 건축사이자 조선왕조 역사 전문가',
    focusAreas: ['궁궐 건축의 위계질서', '조선 왕실 생활사', '정치사적 의미', '건축 배치의 원리', '궁중 문화와 예술'],
    specialRequirements: '왕실의 권위와 품격, 정치적 상징성, 건축의 우수성을 강조하며 스토리텔링해야 합니다.',
    chapterStructure: '정문 → 외전(정치 공간) → 내전(생활 공간) → 후원(휴식 공간) 순서',
    recommendedSpots: 7
  },
  
  // 2. 종교 건축 (사찰, 교회, 성당)
  religious: {
    keywords: ['사찰', '절', '암자', '교회', '성당', '대성당', '성지', '종교', '신앙', 'temple', 'church', 'cathedral', 'monastery', 'shrine'],
    expertRole: '종교 건축사이자 종교학 전문가',
    focusAreas: ['종교 건축의 상징성', '신앙과 철학', '종교 예술', '수행과 명상', '종교 역사'],
    specialRequirements: '종교적 존경심과 영성적 깊이를 바탕으로 건축적 특징과 신앙의 의미를 전달해야 합니다.',
    chapterStructure: '진입 공간 → 예배/수행 공간 → 성스러운 핵심 공간 → 부속 공간 순서',
    recommendedSpots: 6
  },
  
  // 3. 역사 유적지 (유적, 기념관, 박물관)
  historical: {
    keywords: ['박물관', '기념관', '기념공원', '유적지', '사적', '문화재', '역사', '독립', '전쟁', '항일', 'museum', 'memorial', 'heritage', 'historic'],
    expertRole: '역사학자이자 문화유산 전문가',
    focusAreas: ['역사적 사건과 인물', '시대적 맥락', '사회문화사', '유물의 가치', '역사적 교훈'],
    specialRequirements: '역사적 사실의 정확성과 교육적 가치, 감동적인 인물 스토리텔링을 강조해야 합니다.',
    chapterStructure: '역사적 배경 → 핵심 사건/인물 → 유물/유적 → 현재적 의미 순서',
    recommendedSpots: 6
  },
  
  // 4. 자연 경관 (공원, 산, 바다)
  nature: {
    keywords: ['공원', '국립공원', '산', '바다', '해변', '강', '호수', '숲', '계곡', '자연', '생태', 'park', 'mountain', 'beach', 'forest', 'nature'],
    expertRole: '생태학자이자 지질학 전문가',
    focusAreas: ['지질학적 형성 과정', '생태계와 생물다양성', '환경 보전', '기후와 지형', '자연 현상'],
    specialRequirements: '과학적 정확성과 환경 보전 메시지를 바탕으로 자연의 신비로움을 전달해야 합니다.',
    chapterStructure: '지형 개관 → 지질학적 특징 → 생태계 → 환경 보전 의미 순서',
    recommendedSpots: 5
  },
  
  // 5. 음식/요리 전문 (맛집, 요리, 전통 음식)
  culinary: {
    keywords: ['맛집', '음식', '요리', '식당', '전통음식', '향토음식', '먹거리', '미식', '카페', 'food', 'restaurant', 'cuisine', 'cooking', 'gourmet'],
    expertRole: '요리 연구가이자 식문화 전문가',
    focusAreas: ['요리법과 조리 기술', '식재료의 특성', '음식의 역사와 유래', '영양과 건강', '식문화와 전통'],
    specialRequirements: '조리 과정의 과학성, 재료의 신선함과 품질, 맛의 특징을 구체적으로 설명해야 합니다.',
    chapterStructure: '대표 음식 소개 → 조리법과 재료 → 맛의 특징 → 식문화적 의미 순서',
    recommendedSpots: 5
  },
  
  // 6. 예술/문화 공간 (갤러리, 예술관)
  cultural: {
    keywords: ['갤러리', '미술관', '예술관', '문화센터', '공연장', '전시관', '예술', '문화', '전통', '공연', 'gallery', 'museum', 'art', 'culture', 'performance'],
    expertRole: '미술사학자이자 문화 큐레이터',
    focusAreas: ['예술사와 미학 이론', '작가와 작품 세계', '예술 기법과 재료', '문화적 맥락', '예술의 사회적 역할'],
    specialRequirements: '예술적 감성과 학술적 깊이를 조화시켜 작품의 가치와 의미를 전달해야 합니다.',
    chapterStructure: '예술적 배경 → 주요 작품 해설 → 예술 기법 → 문화적 의미 순서',
    recommendedSpots: 6
  },
  
  // 7. 상업/쇼핑 지역 (시장, 거리, 상가)
  commercial: {
    keywords: ['시장', '전통시장', '상가', '거리', '쇼핑', '백화점', '상점가', '상권', 'market', 'shopping', 'street', 'district', 'store'],
    expertRole: '도시 상업사 연구가이자 유통 전문가',
    focusAreas: ['상권 형성사', '상업 문화', '지역 특산품', '경제사', '도시 발전과 변화'],
    specialRequirements: '상업 활동의 역사적 변천과 경제적 가치, 지역민의 생활 문화를 흥미롭게 전달해야 합니다.',
    chapterStructure: '상권 역사 → 주요 상점가 → 특색 상품 → 현대적 변화 순서',
    recommendedSpots: 5
  },
  
  // 8. 현대 건축 (타워, 빌딩, 현대 시설)
  modern: {
    keywords: ['타워', '빌딩', '전망대', '스카이라인', '현대건축', '랜드마크', '고층건물', '건축물', 'tower', 'building', 'skyscraper', 'landmark', 'modern'],
    expertRole: '현대 건축 전문가이자 도시 설계사',
    focusAreas: ['현대 건축 기술', '구조 공학', '도시 계획', '건축 디자인', '지속가능한 건축'],
    specialRequirements: '첨단 기술과 혁신적 설계, 건축공학의 우수성과 도시 발전에 미치는 영향을 강조해야 합니다.',
    chapterStructure: '건축 개념 → 구조적 특징 → 기술적 혁신 → 도시적 의미 순서',
    recommendedSpots: 5
  },
  
  // 9. 일반 관광지 (기타 모든 장소)
  general: {
    keywords: [],
    expertRole: '종합 관광 전문가',
    focusAreas: ['종합적 역사 문화', '관광 정보', '지역 특색', '흥미로운 스토리', '실용적 정보'],
    specialRequirements: '균형 잡힌 관점에서 다양한 측면의 정보를 흥미롭고 유익하게 제공해야 합니다.',
    chapterStructure: '전체 개관 → 주요 볼거리 → 특별한 이야기 → 방문 팁 순서',
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
 * 🎯 과학적 근거 기반 권장 스팟 수 계산
 * 
 * 프롬프트 최적화 원칙:
 * - 인간의 집중 시간: 7±2 법칙 (밀러의 법칙)
 * - 각 스팟당 8-10분 = 총 40-70분 투어 시간
 * - 위치별 복잡도와 정보 밀도 고려
 */
export function getRecommendedSpotCount(locationName: string): { default: number; min: number; max: number } {
  const locationType = analyzeLocationType(locationName);
  const config = LOCATION_TYPE_CONFIGS[locationType];
  const baseCount = config.recommendedSpots || 6;
  
  // 장소 이름 길이 기반 복잡도 조정 (긴 이름 = 복합 시설 가능성)
  const nameComplexity = locationName.length > 10 ? 1 : 0;
  
  // 유형별 최적화된 범위 계산
  const adjustedBase = Math.min(Math.max(baseCount + nameComplexity, 4), 8);
  
  return {
    default: adjustedBase,
    min: Math.max(4, adjustedBase - 1),  // 최소 4개 (품질 보장)
    max: Math.min(adjustedBase + 2, 8)   // 최대 8개 (집중력 유지)
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
  return Object.values(LANGUAGE_CONFIGS);
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
/**
 * 🎯 AI 프롬프트 공통 유틸리티
 * 
 * 목적: 여러 API에서 사용되는 프롬프트 생성 로직을 표준화하고 중복을 제거
 * 사용처: generate-guide-with-gemini, generate-multilang-guide, generate-sequential-guide 등
 */

import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';

/**
 * 🌍 사용자 프로필 표준 인터페이스
 */
export interface StandardUserProfile {
  interests?: string[];
  knowledgeLevel?: 'beginner' | 'intermediate' | 'expert' | '초급' | '중급' | '고급';
  ageGroup?: string;
  preferredStyle?: 'formal' | 'casual' | 'friendly' | '공식적' | '캐주얼' | '친근함';
  language?: string;
}

/**
 * 🏛️ 지역 컨텍스트 표준 인터페이스
 */
export interface StandardRegionalContext {
  country?: string;
  region?: string;
  countryCode?: string;
  culturalContext?: string;
  timeZone?: string;
  currency?: string;
}

/**
 * 🎯 프롬프트 생성 옵션
 */
export interface PromptGenerationOptions {
  /** 위치명 (필수) */
  locationName: string;
  /** 언어 (기본: 'ko') */
  language?: string;
  /** 사용자 프로필 */
  userProfile?: StandardUserProfile;
  /** 상위 지역 정보 */
  parentRegion?: string;
  /** 지역 컨텍스트 */
  regionalContext?: StandardRegionalContext;
  /** 특별 요구사항 */
  specialRequirements?: {
    tripType?: string;
    budget?: string;
    duration?: string;
    focus?: 'cultural' | 'historical' | 'natural' | 'modern' | 'food' | 'adventure';
  };
}

/**
 * 🎨 프롬프트 템플릿 유형
 */
export type PromptTemplate = 
  | 'autonomous-guide'      // 자율적 가이드 생성
  | 'trip-planner'         // 여행 계획 특화
  | 'quick-overview'       // 빠른 개요
  | 'detailed-exploration' // 상세 탐구
  | 'cultural-focus';      // 문화 중심

/**
 * 🔧 사용자 프로필 정규화
 * 
 * 다양한 형태의 사용자 프로필을 표준 형식으로 변환
 */
export function normalizeUserProfile(userProfile: any): StandardUserProfile {
  if (!userProfile || typeof userProfile !== 'object') {
    return {
      interests: ['문화', '역사'],
      knowledgeLevel: 'intermediate',
      ageGroup: '30대',
      preferredStyle: 'friendly',
      language: 'ko'
    };
  }

  // 배열이 아닌 interests를 배열로 변환
  let interests = userProfile.interests;
  if (typeof interests === 'string') {
    interests = interests.split(',').map((s: string) => s.trim());
  }
  if (!Array.isArray(interests)) {
    interests = ['문화', '역사'];
  }

  // 지식 수준 정규화
  const knowledgeLevel = userProfile.knowledgeLevel || userProfile.knowledge || 'intermediate';
  
  // 선호 스타일 정규화
  const preferredStyle = userProfile.preferredStyle || userProfile.style || 'friendly';

  return {
    interests,
    knowledgeLevel,
    ageGroup: userProfile.ageGroup || userProfile.age || '30대',
    preferredStyle,
    language: userProfile.language || 'ko'
  };
}

/**
 * 🌍 지역 컨텍스트 정규화
 * 
 * 다양한 형태의 지역 정보를 표준 형식으로 변환
 */
export function normalizeRegionalContext(
  regionalContext: any,
  parentRegion?: string
): StandardRegionalContext {
  if (!regionalContext || typeof regionalContext !== 'object') {
    return {
      country: undefined,
      region: parentRegion,
      countryCode: undefined
    };
  }

  return {
    country: regionalContext.country || regionalContext.countryName,
    region: regionalContext.region || parentRegion,
    countryCode: regionalContext.countryCode || regionalContext.code,
    culturalContext: regionalContext.culturalContext,
    timeZone: regionalContext.timeZone,
    currency: regionalContext.currency
  };
}

/**
 * 🎯 프롬프트 생성 (통합 함수)
 * 
 * 모든 API에서 사용할 수 있는 표준화된 프롬프트 생성 함수
 */
export async function generateStandardPrompt(
  options: PromptGenerationOptions,
  template: PromptTemplate = 'autonomous-guide'
): Promise<string> {
  const {
    locationName,
    language = 'ko',
    userProfile,
    parentRegion,
    regionalContext,
    specialRequirements
  } = options;

  // 입력값 정규화
  const normalizedUserProfile = normalizeUserProfile(userProfile);
  const normalizedRegionalContext = normalizeRegionalContext(regionalContext, parentRegion);

  // 템플릿별 프롬프트 생성
  switch (template) {
    case 'autonomous-guide':
      return await createAutonomousGuidePrompt(
        locationName,
        language,
        normalizedUserProfile,
        parentRegion || '',
        normalizedRegionalContext
      );

    case 'trip-planner':
      return await createTripPlannerPrompt(
        locationName,
        language,
        normalizedUserProfile,
        specialRequirements
      );

    case 'quick-overview':
      return await createQuickOverviewPrompt(
        locationName,
        language,
        normalizedUserProfile
      );

    case 'detailed-exploration':
      return await createDetailedExplorationPrompt(
        locationName,
        language,
        normalizedUserProfile,
        normalizedRegionalContext
      );

    case 'cultural-focus':
      return await createCulturalFocusPrompt(
        locationName,
        language,
        normalizedUserProfile,
        normalizedRegionalContext
      );

    default:
      console.warn(`⚠️ 알 수 없는 템플릿: ${template}, autonomous-guide 사용`);
      return await createAutonomousGuidePrompt(
        locationName,
        language,
        normalizedUserProfile,
        parentRegion || '',
        normalizedRegionalContext
      );
  }
}

/**
 * 🗺️ 여행 계획 특화 프롬프트
 */
async function createTripPlannerPrompt(
  locationName: string,
  language: string,
  userProfile: StandardUserProfile,
  specialRequirements?: any
): Promise<string> {
  const basePrompt = await createAutonomousGuidePrompt(
    locationName,
    language,
    userProfile,
    '',
    {}
  );

  const tripEnhancement = `

🗺️ **여행 계획 특별 요구사항**:
- 여행 유형: ${specialRequirements?.tripType || '일반 관광'}
- 예산: ${specialRequirements?.budget || '중간'}
- 기간: ${specialRequirements?.duration || '1-2일'}

추가 포함 사항:
1. 실용적인 여행 팁 (교통, 숙박, 식사)
2. 예산별 추천 활동
3. 시간대별 일정 제안
4. 현지 문화 체험 기회`;

  return basePrompt + tripEnhancement;
}

/**
 * ⚡ 빠른 개요 프롬프트
 */
async function createQuickOverviewPrompt(
  locationName: string,
  language: string,
  userProfile: StandardUserProfile
): Promise<string> {
  return `${locationName}에 대한 간단하고 핵심적인 가이드를 ${language}로 생성해주세요.

사용자 특성:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 지식 수준: ${userProfile.knowledgeLevel || '중급'}
- 선호 스타일: ${userProfile.preferredStyle || '친근함'}

요구사항:
1. 3-5분 안에 읽을 수 있는 분량
2. 핵심 하이라이트만 포함
3. 실용적인 정보 중심
4. 간결하고 명확한 표현

JSON 형식으로 응답:
{
  "overview": {
    "title": "제목",
    "summary": "간단 요약",
    "highlights": ["주요 특징들"],
    "practicalInfo": "실용 정보"
  }
}`;
}

/**
 * 🔍 상세 탐구 프롬프트
 */
async function createDetailedExplorationPrompt(
  locationName: string,
  language: string,
  userProfile: StandardUserProfile,
  regionalContext: StandardRegionalContext
): Promise<string> {
  const basePrompt = await createAutonomousGuidePrompt(
    locationName,
    language,
    userProfile,
    regionalContext.region || '',
    regionalContext
  );

  const detailedEnhancement = `

🔍 **상세 탐구 요구사항**:
1. 역사적 배경의 깊이 있는 분석
2. 건축/예술적 특징의 전문적 설명
3. 지역 문화와의 연관성 분석
4. 숨겨진 이야기나 흥미로운 사실들
5. 전문가 수준의 관람 포인트
6. 다른 유사 장소와의 비교 분석`;

  return basePrompt + detailedEnhancement;
}

/**
 * 🏛️ 문화 중심 프롬프트
 */
async function createCulturalFocusPrompt(
  locationName: string,
  language: string,
  userProfile: StandardUserProfile,
  regionalContext: StandardRegionalContext
): Promise<string> {
  return `${locationName}의 문화적 의미와 가치에 중점을 둔 전문적인 가이드를 ${language}로 생성해주세요.

지역 정보:
- 국가: ${regionalContext.country || '미지정'}
- 지역: ${regionalContext.region || '미지정'}
- 문화적 컨텍스트: ${regionalContext.culturalContext || '일반'}

사용자 관심사: ${userProfile.interests?.join(', ') || '문화, 역사'}

문화 중심 요구사항:
1. 역사적 문화적 배경의 심도 있는 설명
2. 지역 전통과의 연관성
3. 문화재로서의 가치와 의미
4. 현지인들에게 이 장소가 갖는 의미
5. 문화적 관람 에티켓
6. 관련 문화 체험 활동
7. 계절별 문화 행사나 축제

JSON 형식으로 문화적 관점에서 구조화된 정보를 제공해주세요.`;
}

/**
 * 🚀 빠른 프롬프트 생성 (레거시 호환)
 * 
 * 기존 API들에서 바로 사용할 수 있는 간편 함수
 */
export async function createQuickPrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: any,
  parentRegion?: string,
  regionalContext?: any
): Promise<string> {
  return await generateStandardPrompt({
    locationName,
    language,
    userProfile,
    parentRegion,
    regionalContext
  });
}

/**
 * 🎯 여행 계획용 프롬프트 생성
 */
export async function createTripPlanPrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: any,
  tripType?: string,
  budget?: string,
  duration?: string
): Promise<string> {
  return await generateStandardPrompt({
    locationName,
    language,
    userProfile,
    specialRequirements: { tripType, budget, duration }
  }, 'trip-planner');
}

/**
 * 🔧 프롬프트 검증 함수
 */
export function validatePromptOptions(options: PromptGenerationOptions): boolean {
  if (!options.locationName || options.locationName.trim().length === 0) {
    console.error('❌ 위치명이 누락되었습니다');
    return false;
  }

  if (options.language && !['ko', 'en', 'ja', 'zh', 'es'].includes(options.language)) {
    console.warn(`⚠️ 지원하지 않는 언어: ${options.language}, 한국어로 설정`);
    options.language = 'ko';
  }

  return true;
}

/**
 * 📊 프롬프트 통계
 */
let promptGenerationCount = 0;
let lastGenerationTime = Date.now();

export function getPromptStats() {
  return {
    totalPrompts: promptGenerationCount,
    lastGeneration: new Date(lastGenerationTime).toISOString(),
    uptime: Date.now() - lastGenerationTime
  };
}

// 통계 추적 래퍼
const originalGeneratePrompt = generateStandardPrompt;
export async function generateStandardPromptWithStats(
  options: PromptGenerationOptions,
  template: PromptTemplate = 'autonomous-guide'
): Promise<string> {
  promptGenerationCount++;
  lastGenerationTime = Date.now();
  return await originalGeneratePrompt(options, template);
}

/**
 * 🧪 테스트 유틸리티
 */
export const promptTestUtils = {
  /** 테스트용 프롬프트 옵션 생성 */
  createTestOptions: (locationName: string): PromptGenerationOptions => ({
    locationName,
    language: 'ko',
    userProfile: {
      interests: ['테스트'],
      knowledgeLevel: 'intermediate',
      preferredStyle: 'friendly'
    }
  }),

  /** 통계 리셋 */
  resetStats: () => {
    promptGenerationCount = 0;
    lastGenerationTime = Date.now();
  },

  /** 프롬프트 길이 검증 */
  validatePromptLength: (prompt: string, maxLength: number = 10000): boolean => {
    return prompt.length <= maxLength;
  }
};
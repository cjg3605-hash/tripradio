/**
 * 🤖 Gemini AI 클라이언트 공통 유틸리티
 * 
 * 목적: 여러 API에서 중복되는 Gemini 클라이언트 초기화 로직을 통합
 * 사용처: generate-guide-with-gemini, generate-multilang-guide, generate-sequential-guide 등
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ServiceValidators } from '@/lib/env-validator';

/**
 * 🔧 Gemini 클라이언트 초기화 설정
 */
export interface GeminiClientConfig {
  /** API 키 우선순위: 명시적 전달 > 환경변수 */
  apiKey?: string;
  /** 디버그 로깅 활성화 */
  enableLogging?: boolean;
  /** 초기화 실패 시 재시도 횟수 */
  retryCount?: number;
}

/**
 * 🤖 Gemini 모델 설정 옵션
 */
export interface GeminiModelConfig {
  /** 모델명 (기본: gemini-2.5-flash-lite) */
  model?: string;
  /** 생성 설정 */
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topK?: number;
    topP?: number;
  };
}

/**
 * 🔒 환경변수 검증 및 API 키 추출
 */
function validateAndExtractApiKey(explicitApiKey?: string): string {
  // 1. 명시적으로 전달된 API 키 사용
  if (explicitApiKey) {
    console.log('✅ 명시적 API 키 사용');
    return explicitApiKey;
  }

  // 2. 환경변수 검증 (ServiceValidators 사용)
  const validation = ServiceValidators.gemini();
  if (!validation.isValid) {
    console.error('❌ Gemini API 환경변수 검증 실패:', validation.missingKeys);
    throw new Error(`Server configuration error: Missing required keys: ${validation.missingKeys.join(', ')}`);
  }

  // 3. 환경변수에서 API 키 추출
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }

  return apiKey;
}

/**
 * 🤖 Gemini 클라이언트 생성 (공통 함수)
 * 
 * @param config 클라이언트 설정
 * @returns GoogleGenerativeAI 인스턴스
 */
export function createGeminiClient(config: GeminiClientConfig = {}): GoogleGenerativeAI {
  const { 
    apiKey: explicitApiKey, 
    enableLogging = true, 
    retryCount = 1 
  } = config;

  try {
    // API 키 검증 및 추출
    const apiKey = validateAndExtractApiKey(explicitApiKey);
    
    // 클라이언트 생성
    const client = new GoogleGenerativeAI(apiKey);
    
    if (enableLogging) {
      console.log('✅ Gemini AI 클라이언트 초기화 성공');
    }
    
    return client;
    
  } catch (error) {
    console.error('❌ Gemini AI 초기화 실패:', error);
    
    // 재시도 로직
    if (retryCount > 1) {
      console.log(`🔄 재시도 ${retryCount - 1}회 남음`);
      return createGeminiClient({ 
        ...config, 
        retryCount: retryCount - 1 
      });
    }
    
    throw new Error('Failed to initialize AI service');
  }
}

/**
 * 🎯 Gemini 모델 생성 (고급 함수)
 * 
 * @param modelConfig 모델 설정
 * @param clientConfig 클라이언트 설정  
 * @returns GenerativeModel 인스턴스
 */
export function createGeminiModel(
  modelConfig: GeminiModelConfig = {},
  clientConfig: GeminiClientConfig = {}
): GenerativeModel {
  const {
    model = 'gemini-2.5-flash-lite',
    generationConfig = {
      temperature: 0.7,
      maxOutputTokens: 16384,
      topK: 40,
      topP: 0.9,
    }
  } = modelConfig;

  try {
    const client = createGeminiClient(clientConfig);
    
    const modelInstance = client.getGenerativeModel({ 
      model,
      generationConfig
    });

    if (clientConfig.enableLogging !== false) {
      console.log(`✅ Gemini 모델 생성 완료: ${model}`);
    }

    return modelInstance;
    
  } catch (error) {
    console.error('❌ Gemini 모델 생성 실패:', error);
    throw error;
  }
}

/**
 * 🚀 빠른 Gemini 클라이언트 생성 (기본 설정)
 * 
 * 기존 getGeminiClient() 함수들의 직접적인 대체용
 */
export function getGeminiClient(): GoogleGenerativeAI {
  return createGeminiClient();
}

/**
 * 🎯 기본 Gemini 모델 생성 (가장 일반적인 사용)
 * 
 * 대부분의 API에서 바로 사용할 수 있는 기본 설정 모델
 */
export function getDefaultGeminiModel(): GenerativeModel {
  return createGeminiModel();
}

/**
 * 📊 고성능 Gemini 모델 생성 (복잡한 작업용)
 * 
 * 더 높은 토큰 수와 정교한 설정이 필요한 경우
 */
export function getHighPerformanceGeminiModel(): GenerativeModel {
  return createGeminiModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 32768,
      topK: 50,
      topP: 0.95,
    }
  });
}

/**
 * ⚡ 빠른 응답용 Gemini 모델 생성 (실시간 요청용)
 * 
 * 빠른 응답이 필요한 실시간 사용자 요청에 최적화
 */
export function getFastResponseGeminiModel(): GenerativeModel {
  return createGeminiModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 8192,
      topK: 30,
      topP: 0.8,
    }
  });
}

/**
 * 🔧 레거시 지원 함수들
 * 
 * 기존 코드의 점진적 마이그레이션을 위한 호환성 함수들
 */

/** @deprecated createGeminiClient() 사용 권장 */
export const initializeGeminiClient = getGeminiClient;

/** @deprecated getDefaultGeminiModel() 사용 권장 */
export const createDefaultModel = getDefaultGeminiModel;

/**
 * 📈 사용 통계 및 모니터링
 */
let clientCreationCount = 0;
let lastCreationTime = Date.now();

/**
 * 클라이언트 생성 통계 조회
 */
export function getGeminiClientStats() {
  return {
    totalClients: clientCreationCount,
    lastCreation: new Date(lastCreationTime).toISOString(),
    uptime: Date.now() - lastCreationTime
  };
}

// 통계 추적
const originalCreateClient = createGeminiClient;
export function createGeminiClientWithStats(config: GeminiClientConfig = {}): GoogleGenerativeAI {
  clientCreationCount++;
  lastCreationTime = Date.now();
  return originalCreateClient(config);
}

/**
 * 🧪 테스트용 함수들
 */
export const testUtils = {
  /** 테스트용 API 키 유효성 검증 */
  validateApiKey: validateAndExtractApiKey,
  
  /** 테스트용 클라이언트 생성 */
  createTestClient: (apiKey: string) => createGeminiClient({ apiKey, enableLogging: false }),
  
  /** 테스트용 통계 리셋 */
  resetStats: () => {
    clientCreationCount = 0;
    lastCreationTime = Date.now();
  }
};
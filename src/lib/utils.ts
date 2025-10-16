// src/lib/utils.ts
import { UserProfile, GuideData, GuideOverview, GuideRoute, GuideStep, RealTimeGuide, GuideChapter } from '@/types/guide';

import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeString(s: string | null | undefined): string {
  return decodeURIComponent(s || '').trim().toLowerCase();
}

// 위치명 정규화 (DB 저장/조회용 - page.tsx와 동일한 로직)
export function normalizeLocationName(locationName: string): string {
  return locationName.trim().toLowerCase().replace(/\s+/g, ' ');
}

// 표준 에러 응답 타입
export interface StandardErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: string;
  timestamp: string;
}

// 표준 성공 응답 타입
export interface StandardSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  cached?: string;
}

// 표준 에러 응답 생성 함수
export function createErrorResponse(
  error: string,
  code?: string,
  details?: string
): StandardErrorResponse {
  return {
    success: false,
    error,
    code,
    details,
    timestamp: new Date().toISOString()
  };
}

// 표준 성공 응답 생성 함수
export function createSuccessResponse<T>(
  data: T,
  cached?: string
): StandardSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    cached
  };
}

// 에러 객체를 표준 형식으로 변환
export function normalizeError(error: unknown): {
  message: string;
  code?: string;
  details?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR'
    };
  }
  
  return {
    message: '알 수 없는 오류가 발생했습니다.',
    code: 'UNKNOWN_ERROR',
    details: String(error)
  };
}

// API 응답 래퍼
export function createApiResponse(
  data: any,
  status: number = 200,
  headers?: Record<string, string>
): Response {
  const responseHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders
  });
}

// 타입 가드 함수들

// UserProfile 타입 가드
export function isValidUserProfile(obj: any): obj is UserProfile {
  if (!obj || typeof obj !== 'object') return false;
  
  // 선택적 필드들의 타입 체크
  if (obj.interests && (!Array.isArray(obj.interests) || !obj.interests.every((item: any) => typeof item === 'string'))) {
    return false;
  }
  
  if (obj.ageGroup && typeof obj.ageGroup !== 'string') return false;
  if (obj.knowledgeLevel && typeof obj.knowledgeLevel !== 'string') return false;
  if (obj.companions && typeof obj.companions !== 'string') return false;
  if (obj.tourDuration && typeof obj.tourDuration !== 'number') return false;
  if (obj.preferredStyle && typeof obj.preferredStyle !== 'string') return false;
  if (obj.language && typeof obj.language !== 'string') return false;
  
  return true;
}

// GuideChapter 타입 가드 (개선됨)
export function isValidGuideChapter(obj: any): obj is GuideChapter {
  if (!obj || typeof obj !== 'object') return false;
  
  // id는 필수 필드
  if (typeof obj.id !== 'number' || typeof obj.title !== 'string') {
    return false;
  }
  
  // 선택적 필드들의 타입 체크
  if (obj.description && typeof obj.description !== 'string') return false;
  if (obj.duration && typeof obj.duration !== 'number' && typeof obj.duration !== 'string') return false;
  if (obj.audioUrl && typeof obj.audioUrl !== 'string') return false;
  if (obj.narrative && typeof obj.narrative !== 'string') return false;
  if (obj.nextDirection && typeof obj.nextDirection !== 'string') return false;
  
  // 좌표 검증 개선 (여러 형태 지원하되 하나라도 유효하면 OK)
  const hasValidLocation = obj.location?.lat && obj.location?.lng;
  const hasValidCoords = obj.coordinates?.lat && obj.coordinates?.lng;
  const hasValidLatLng = obj.lat && obj.lng;
  const hasValidLatitudeLongitude = obj.latitude && obj.longitude;
  
  // 좌표가 있다면 최소 하나는 유효해야 함
  if ((obj.location || obj.coordinates || obj.lat || obj.latitude) && 
      !(hasValidLocation || hasValidCoords || hasValidLatLng || hasValidLatitudeLongitude)) {
    return false;
  }
  
  return true;
}

// GuideData 타입 가드
export function isValidGuideData(obj: any): obj is GuideData {
  if (!obj || typeof obj !== 'object') return false;
  
  // 필수 필드 체크
  if (!obj.overview || !obj.route || !obj.metadata) return false;
  if (typeof obj.overview.title !== 'string') return false;
  if (!Array.isArray(obj.route.steps)) return false;
  if (typeof obj.metadata.originalLocationName !== 'string') return false;
  
  return true;
}

/**
 * 기본 UserProfile 생성
 */
export const createDefaultUserProfile = (): UserProfile => ({
  interests: ['문화', '역사'],
  preferredLanguage: 'ko',
  travelStyle: 'cultural',
  duration: '2시간',
  groupSize: 1,
  accessibilityNeeds: [],
  ageGroup: '30대',
  knowledgeLevel: '중급',
  preferredStyle: '친근함'
});

/**
 * 부분적인 UserProfile을 완전한 UserProfile로 변환
 */
export const normalizeUserProfile = (partial: Partial<UserProfile> = {}): UserProfile => ({
  ...createDefaultUserProfile(),
  ...partial
});

/**
 * 빈 객체를 안전한 UserProfile로 변환
 */
export const safeUserProfile = (input: any): UserProfile => {
  if (!input || typeof input !== 'object') {
    return createDefaultUserProfile();
  }
  return normalizeUserProfile(input);
};

/**
 * GuideChapter에서 좌표 추출 (여러 형태 지원)
 */
export const extractCoordinates = (chapter: GuideChapter): { lat: number; lng: number } | null => {
  // 우선순위: location > coordinates > lat/lng > latitude/longitude
  if (chapter.location?.lat && chapter.location?.lng) {
    return { lat: chapter.location.lat, lng: chapter.location.lng };
  }
  
  if (chapter.coordinates?.lat && chapter.coordinates?.lng) {
    return { lat: chapter.coordinates.lat, lng: chapter.coordinates.lng };
  }
  
  if (chapter.lat && chapter.lng) {
    return { lat: chapter.lat, lng: chapter.lng };
  }
  
  if (chapter.latitude && chapter.longitude) {
    return { lat: chapter.latitude, lng: chapter.longitude };
  }
  
  return null;
};

/**
 * GuideChapter 좌표 정규화 (권장 location 형태로 변환)
 */
export const normalizeChapterCoordinates = (chapter: GuideChapter): GuideChapter => {
  const coords = extractCoordinates(chapter);
  
  if (!coords) {
    return chapter;
  }
  
  return {
    ...chapter,
    location: coords,
    // deprecated 필드들은 유지하되 location을 우선시
  };
};

/**
 * 안전한 숫자 변환
 */
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * 안전한 문자열 변환
 */
export const safeString = (value: any, defaultValue: string = ''): string => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
};

/**
 * 배열인지 확인하고 안전하게 반환
 */
export const safeArray = <T>(value: any, defaultValue: T[] = []): T[] => {
  return Array.isArray(value) ? value : defaultValue;
};

/**
 * 객체인지 확인하고 안전하게 반환
 */
export const safeObject = <T extends Record<string, any>>(
  value: any, 
  defaultValue: T = {} as T
): T => {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : defaultValue;
};

/**
 * URL slug 생성 (한글 지원)
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * 깊은 복사
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * JSON 응답 검증 및 파싱 (개선된 버전)
 */
export function validateJsonResponse(responseText: string | undefined): { success: boolean; data?: any; error?: string } {
  if (!responseText || typeof responseText !== 'string') {
    return { success: false, error: '응답 텍스트가 올바르지 않습니다.' };
  }
  
  try {
    const parsed = JSON.parse(responseText);
    return { success: true, data: parsed };
     
  } catch (error) {
    return { 
      success: false, 
      error: `JSON 파싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * 안전한 언어 코드 정규화 (서버/클라이언트 모두 사용 가능)
 */
export function safeLanguageCode(lang: any): string {
  if (!lang || typeof lang !== 'string') {
    return 'ko';
  }
  
  const supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es'];
  const normalizedLang = lang.toLowerCase().slice(0, 2);
  
  return supportedLanguages.includes(normalizedLang) ? normalizedLang : 'ko';
}

/**
 * 서버-클라이언트 언어 동기화를 위한 쿠키 기반 언어 관리
 */
export const LANGUAGE_COOKIE_NAME = 'preferred-language';
export const LANGUAGE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1년

/**
 * 클라이언트에서 언어 쿠키 설정
 */
export function setLanguageCookie(language: string): void {
  if (typeof window === 'undefined') return;
  
  const safeLanguage = safeLanguageCode(language);
  
  // HTTPS 환경에서 secure 플래그 추가
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; secure' : '';
  
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${safeLanguage}; max-age=${LANGUAGE_COOKIE_MAX_AGE}; path=/; samesite=lax${secureFlag}`;
  
  // 쿠키 저장 검증
  const savedValue = getLanguageCookie();
  if (savedValue === safeLanguage) {
    console.log(`✅ 언어 쿠키 저장 성공: ${safeLanguage}`);
  } else {
    console.warn(`❌ 언어 쿠키 저장 실패: 설정=${safeLanguage}, 읽기=${savedValue}`);
  }
}

/**
 * 클라이언트에서 언어 쿠키 읽기
 */
export function getLanguageCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp(`(^| )${LANGUAGE_COOKIE_NAME}=([^;]+)`));
  const cookieValue = match ? match[2] : null;
  
  return cookieValue ? safeLanguageCode(cookieValue) : null;
}

/**
 * 서버-클라이언트 통합 언어 감지 (우선순위 기반)
 * 1순위: 쿠키 (서버-클라이언트 공통)
 * 2순위: localStorage (클라이언트만)
 * 3순위: URL 파라미터
 * 4순위: 브라우저 언어
 * 5순위: 기본값 (ko)
 */
export function detectPreferredLanguage(options: {
  cookieValue?: string;
  urlLang?: string;
  storageValue?: string;
  browserLang?: string;
  prioritizeUrl?: boolean;
} = {}): string {
  const { cookieValue, urlLang, storageValue, browserLang, prioritizeUrl = false } = options;
  
  // URL 우선 모드: URL 파라미터를 최우선으로 처리
  if (prioritizeUrl && urlLang) {
    const safeUrlLang = safeLanguageCode(urlLang);
    console.log(`🎯 언어 감지 - URL (우선): ${safeUrlLang}`);
    return safeUrlLang;
  }
  
  // 1순위: 쿠키 (서버-클라이언트 동기화)
  if (cookieValue) {
    const safeCookieLang = safeLanguageCode(cookieValue);
    console.log(`🎯 언어 감지 - 쿠키: ${safeCookieLang}`);
    return safeCookieLang;
  }
  
  // 2순위: localStorage (클라이언트만)
  if (storageValue) {
    const safeStorageLang = safeLanguageCode(storageValue);
    console.log(`🎯 언어 감지 - localStorage: ${safeStorageLang}`);
    return safeStorageLang;
  }
  
  // 3순위: URL 파라미터 (일반 모드)
  if (!prioritizeUrl && urlLang) {
    const safeUrlLang = safeLanguageCode(urlLang);
    console.log(`🎯 언어 감지 - URL: ${safeUrlLang}`);
    return safeUrlLang;
  }
  
  // 4순위: 브라우저 언어
  if (browserLang) {
    const safeBrowserLang = safeLanguageCode(browserLang.split('-')[0]);
    console.log(`🎯 언어 감지 - 브라우저: ${safeBrowserLang}`);
    return safeBrowserLang;
  }
  
  // 5순위: 기본값
  console.log(`🎯 언어 감지 - 기본값: ko`);
  return 'ko';
}

/**
 * 안전한 객체 JSON 직렬화 (순환 참조 방지)
 */
export function safeJsonStringify(obj: any, space?: number): string {
  const seen = new WeakSet();
  
  try {
    return JSON.stringify(obj, (key, value) => {
      // undefined, function, symbol 등을 안전하게 처리
      if (value === undefined || typeof value === 'function' || typeof value === 'symbol') {
        return null;
      }
      
      // 순환 참조 방지
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      
      return value;
    }, space);
  } catch (error) {
    console.error('JSON stringify error:', error);
    return JSON.stringify({ error: 'Serialization failed' });
  }
}
// src/lib/utils.ts
import { UserProfile, GuideData, GuideOverview, GuideRoute, GuideStep, RealTimeGuide, GuideChapter } from '@/types/guide';

export function normalizeString(s: string | null | undefined): string {
  return decodeURIComponent(s || '').trim().toLowerCase();
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

// GuideChapter 타입 가드
export function isValidGuideChapter(obj: any): obj is GuideChapter {
  if (!obj || typeof obj !== 'object') return false;
  
  // 필수 필드 체크 (id 또는 number 중 하나는 있어야 함)
  if ((typeof obj.id !== 'number' && typeof obj.number !== 'number') || typeof obj.title !== 'string') {
    return false;
  }
  
  // 선택적 필드들의 타입 체크
  if (obj.description && typeof obj.description !== 'string') return false;
  if (obj.duration && typeof obj.duration !== 'number' && typeof obj.duration !== 'string') return false;
  if (obj.audioUrl && typeof obj.audioUrl !== 'string') return false;
  if (obj.narrative && typeof obj.narrative !== 'string') return false;
  if (obj.nextDirection && typeof obj.nextDirection !== 'string') return false;
  
  // 좌표 체크
  if (obj.location && (!obj.location.lat || !obj.location.lng)) return false;
  
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
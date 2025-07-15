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
  
  // 필수 필드 체크
  if (typeof obj.id !== 'number' || typeof obj.title !== 'string') {
    return false;
  }
  
  // 선택적 필드들의 타입 체크
  if (obj.description && typeof obj.description !== 'string') return false;
  if (obj.duration && typeof obj.duration !== 'number' && typeof obj.duration !== 'string') return false;
  if (obj.audioUrl && typeof obj.audioUrl !== 'string') return false;
  if (obj.narrative && typeof obj.narrative !== 'string') return false;
  if (obj.nextDirection && typeof obj.nextDirection !== 'string') return false;
  
  // 좌표 필드들 체크
  if (obj.lat && typeof obj.lat !== 'number') return false;
  if (obj.lng && typeof obj.lng !== 'number') return false;
  if (obj.latitude && typeof obj.latitude !== 'number') return false;
  if (obj.longitude && typeof obj.longitude !== 'number') return false;
  
  if (obj.coordinates) {
    if (typeof obj.coordinates !== 'object' || 
        typeof obj.coordinates.lat !== 'number' || 
        typeof obj.coordinates.lng !== 'number') {
      return false;
    }
  }
  
  return true;
}

// RealTimeGuide 타입 가드
export function isValidRealTimeGuide(obj: any): obj is RealTimeGuide {
  if (!obj || typeof obj !== 'object') return false;
  
  if (!Array.isArray(obj.chapters)) return false;
  
  return obj.chapters.every((chapter: any) => isValidGuideChapter(chapter));
}

// GuideOverview 타입 가드
export function isValidGuideOverview(obj: any): obj is GuideOverview {
  if (!obj || typeof obj !== 'object') return false;
  
  // 필수 필드
  if (typeof obj.title !== 'string') return false;
  
  // keyFacts 배열 체크
  if (!Array.isArray(obj.keyFacts)) return false;
  
  for (const fact of obj.keyFacts) {
    if (!fact || typeof fact !== 'object' || 
        typeof fact.title !== 'string' || 
        typeof fact.description !== 'string') {
      return false;
    }
  }
  
  // 선택적 필드들
  if (obj.summary && typeof obj.summary !== 'string') return false;
  if (obj.narrativeTheme && typeof obj.narrativeTheme !== 'string') return false;
  
  if (obj.visitInfo) {
    if (typeof obj.visitInfo !== 'object') return false;
    if (obj.visitInfo.duration && typeof obj.visitInfo.duration !== 'string') return false;
    if (obj.visitInfo.difficulty && typeof obj.visitInfo.difficulty !== 'string') return false;
    if (obj.visitInfo.season && typeof obj.visitInfo.season !== 'string') return false;
  }
  
  return true;
}

// GuideStep 배열 타입 가드
export function isValidGuideStepArray(obj: any): obj is GuideStep[] {
  if (!Array.isArray(obj)) return false;
  
  return obj.every((step: any) => {
    return step && typeof step === 'object' &&
           typeof step.step === 'number' &&
           typeof step.location === 'string' &&
           typeof step.title === 'string';
  });
}

// GuideRoute 타입 가드
export function isValidGuideRoute(obj: any): obj is GuideRoute {
  if (!obj || typeof obj !== 'object') return false;
  
  if (!Array.isArray(obj.steps)) return false;
  
  return obj.steps.every((step: any) => {
    return step && typeof step === 'object' &&
           typeof step.step === 'number' &&
           typeof step.location === 'string' &&
           typeof step.title === 'string';
  });
}

// GuideData 타입 가드
export function isValidGuideData(obj: any): obj is GuideData {
  if (!obj || typeof obj !== 'object') return false;
  
  // 필수 필드들
  if (!isValidGuideOverview(obj.overview)) return false;
  
  // route는 이제 GuideStep 배열
  if (!isValidGuideStepArray(obj.route)) return false;
  
  if (!obj.metadata || typeof obj.metadata !== 'object' || typeof obj.metadata.originalLocationName !== 'string') {
    return false;
  }
  
  // 선택적 필드
  if (obj.realTimeGuide && !isValidRealTimeGuide(obj.realTimeGuide)) return false;
  
  return true;
}

// JSON 응답 유효성 검증
export function validateJsonResponse(jsonString: string): { 
  success: true; 
  data: any; 
} | { 
  success: false; 
  error: string; 
} {
  try {
    // 코드 블록 제거
    const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let cleanedString = codeBlockMatch ? codeBlockMatch[1] : jsonString;
    
    // JSON 시작과 끝 찾기
    const jsonStart = cleanedString.indexOf('{');
    const jsonEnd = cleanedString.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      return {
        success: false,
        error: 'JSON 시작 또는 끝을 찾을 수 없습니다.'
      };
    }
    
    cleanedString = cleanedString.substring(jsonStart, jsonEnd + 1);
    
    // BOM 및 주석 제거
    cleanedString = cleanedString.replace(/^[\uFEFF\s]+/, '');
    // JSON 파싱 전에 주석 제거는 위험할 수 있으므로 제거하거나
    // 더 정교한 파서를 사용하는 것이 좋습니다
    
    const parsed = JSON.parse(cleanedString);
    return { success: true, data: parsed };
    
  } catch (error) {
    return {
      success: false,
      error: `JSON 파싱 실패: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// 안전한 객체 접근 함수
export function safeGet<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
}

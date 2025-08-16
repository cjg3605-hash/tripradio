/**
 * 🚨 통합 에러 핸들링 시스템
 * 구체적인 에러 타입별 처리 및 사용자 친화적 메시지 제공
 */

// 에러 타입 분류
export enum ErrorType {
  // 환경설정 관련
  ENV_MISSING = 'ENV_MISSING',
  ENV_INVALID = 'ENV_INVALID',
  
  // 네트워크 관련
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  
  // 데이터베이스 관련
  DB_CONNECTION = 'DB_CONNECTION',
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
  DB_CONFLICT = 'DB_CONFLICT',
  
  // AI 서비스 관련
  AI_API_ERROR = 'AI_API_ERROR',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_CONTENT_FILTER = 'AI_CONTENT_FILTER',
  
  // 검증 관련
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INPUT_INVALID = 'INPUT_INVALID',
  
  // 시스템 관련
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  userMessage: string;
  suggestion: string;
  retryable: boolean;
  statusCode: number;
  originalError?: any;
}

/**
 * 🔍 에러 분류 및 정보 추출
 */
export function classifyError(error: any): ErrorInfo {
  const errorMessage = error?.message || error?.toString() || '알 수 없는 오류';
  const errorCode = error?.code || error?.status;
  
  // 환경변수 관련 에러
  if (errorMessage.includes('Missing API key') || errorMessage.includes('환경변수')) {
    return {
      type: ErrorType.ENV_MISSING,
      message: errorMessage,
      userMessage: '서버 설정에 문제가 있습니다.',
      suggestion: '관리자에게 문의하여 API 키 설정을 확인하세요.',
      retryable: false,
      statusCode: 500,
      originalError: error
    };
  }
  
  if (errorMessage.includes('값이 올바르지 않습니다')) {
    return {
      type: ErrorType.ENV_INVALID,
      message: errorMessage,
      userMessage: 'API 키 설정이 올바르지 않습니다.',
      suggestion: '관리자에게 문의하여 API 키를 다시 확인하세요.',
      retryable: false,
      statusCode: 500,
      originalError: error
    };
  }
  
  // 네트워크 관련 에러
  if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    return {
      type: ErrorType.NETWORK_TIMEOUT,
      message: errorMessage,
      userMessage: '요청 시간이 초과되었습니다.',
      suggestion: '잠시 후 다시 시도해보세요.',
      retryable: true,
      statusCode: 408,
      originalError: error
    };
  }
  
  if (errorMessage.includes('fetch failed') || errorMessage.includes('network error')) {
    return {
      type: ErrorType.NETWORK_UNAVAILABLE,
      message: errorMessage,
      userMessage: '네트워크 연결에 문제가 있습니다.',
      suggestion: '인터넷 연결을 확인하고 다시 시도해보세요.',
      retryable: true,
      statusCode: 503,
      originalError: error
    };
  }
  
  if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return {
      type: ErrorType.API_RATE_LIMIT,
      message: errorMessage,
      userMessage: '요청이 너무 많습니다.',
      suggestion: '잠시 기다린 후 다시 시도해보세요.',
      retryable: true,
      statusCode: 429,
      originalError: error
    };
  }
  
  // 데이터베이스 관련 에러
  if (errorCode === 'PGRST301' || errorCode === 'PGRST302') {
    return {
      type: ErrorType.DB_CONNECTION,
      message: errorMessage,
      userMessage: '데이터베이스 연결에 실패했습니다.',
      suggestion: '잠시 후 다시 시도해보세요.',
      retryable: true,
      statusCode: 503,
      originalError: error
    };
  }
  
  if (errorCode === 'PGRST116') {
    return {
      type: ErrorType.DB_QUERY_ERROR,
      message: errorMessage,
      userMessage: '요청한 데이터를 찾을 수 없습니다.',
      suggestion: '다른 검색어로 시도하거나 새로운 가이드를 생성해보세요.',
      retryable: false,
      statusCode: 404,
      originalError: error
    };
  }
  
  if (errorCode === 406 || errorCode === 'PGRST104') {
    return {
      type: ErrorType.DB_CONFLICT,
      message: errorMessage,
      userMessage: '데이터 처리 중 충돌이 발생했습니다.',
      suggestion: '잠시 후 다시 시도해보세요.',
      retryable: true,
      statusCode: 406,
      originalError: error
    };
  }
  
  // AI 서비스 관련 에러
  if (errorMessage.includes('AI 응답이 비어있습니다') || errorMessage.includes('AI 가이드 생성 실패')) {
    return {
      type: ErrorType.AI_API_ERROR,
      message: errorMessage,
      userMessage: 'AI 가이드 생성에 실패했습니다.',
      suggestion: '다시 시도하거나 다른 검색어로 시도해보세요.',
      retryable: true,
      statusCode: 500,
      originalError: error
    };
  }
  
  if (errorMessage.includes('quota exceeded') || errorMessage.includes('limit exceeded')) {
    return {
      type: ErrorType.AI_QUOTA_EXCEEDED,
      message: errorMessage,
      userMessage: 'AI 서비스 사용량이 초과되었습니다.',
      suggestion: '잠시 후 다시 시도해보세요.',
      retryable: true,
      statusCode: 429,
      originalError: error
    };
  }
  
  // 검증 관련 에러
  if (errorMessage.includes('필수입니다') || errorMessage.includes('잘못된 JSON')) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: errorMessage,
      userMessage: '입력 정보가 올바르지 않습니다.',
      suggestion: '입력 내용을 확인하고 다시 시도해보세요.',
      retryable: false,
      statusCode: 400,
      originalError: error
    };
  }
  
  // HTTP 상태 코드별 처리
  if (errorCode >= 500) {
    return {
      type: ErrorType.SYSTEM_ERROR,
      message: errorMessage,
      userMessage: '서버에 일시적인 문제가 발생했습니다.',
      suggestion: '잠시 후 다시 시도해보세요.',
      retryable: true,
      statusCode: errorCode,
      originalError: error
    };
  }
  
  if (errorCode >= 400 && errorCode < 500) {
    return {
      type: ErrorType.INPUT_INVALID,
      message: errorMessage,
      userMessage: '요청이 올바르지 않습니다.',
      suggestion: '입력 내용을 확인하고 다시 시도해보세요.',
      retryable: false,
      statusCode: errorCode,
      originalError: error
    };
  }
  
  // 기본 처리
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    userMessage: '예상치 못한 오류가 발생했습니다.',
    suggestion: '페이지를 새로고침하거나 잠시 후 다시 시도해보세요.',
    retryable: true,
    statusCode: 500,
    originalError: error
  };
}

/**
 * 🚨 표준화된 에러 응답 생성
 */
export function createErrorResponse(error: any, context?: string): Response {
  const errorInfo = classifyError(error);
  
  // 상세 로깅 (개발 환경에서만)
  const isDev = process.env.NODE_ENV === 'development';
  
  console.error(`❌ ${context || '에러 발생'}:`, {
    type: errorInfo.type,
    message: errorInfo.message,
    statusCode: errorInfo.statusCode,
    retryable: errorInfo.retryable,
    stack: isDev ? errorInfo.originalError?.stack : undefined
  });
  
  // 응답 본문 구성
  const responseBody: any = {
    success: false,
    error: errorInfo.userMessage,
    errorType: errorInfo.type,
    suggestion: errorInfo.suggestion,
    retryable: errorInfo.retryable,
    timestamp: new Date().toISOString()
  };
  
  // 개발 환경에서만 상세 정보 포함
  if (isDev) {
    responseBody.debug = {
      originalMessage: errorInfo.message,
      originalError: errorInfo.originalError,
      context: context
    };
  }
  
  return new Response(JSON.stringify(responseBody), {
    status: errorInfo.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Error-Type': errorInfo.type,
      'X-Retryable': errorInfo.retryable.toString()
    }
  });
}

/**
 * 🔧 API 라우트용 에러 핸들러 데코레이터
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<Response>,
  context?: string
) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      return createErrorResponse(error, context);
    }
  };
}

/**
 * 📊 에러 통계 수집기
 */
class ErrorStatsCollector {
  private stats = new Map<ErrorType, { count: number; lastOccurred: Date }>();
  
  recordError(errorType: ErrorType): void {
    const current = this.stats.get(errorType) || { count: 0, lastOccurred: new Date() };
    current.count++;
    current.lastOccurred = new Date();
    this.stats.set(errorType, current);
  }
  
  getStats(): { [errorType: string]: { count: number; lastOccurred: string } } {
    const result: any = {};
    
    for (const [errorType, stats] of this.stats.entries()) {
      result[errorType] = {
        count: stats.count,
        lastOccurred: stats.lastOccurred.toISOString()
      };
    }
    
    return result;
  }
  
  getMostFrequentErrors(limit: number = 5): Array<{ type: ErrorType; count: number }> {
    return Array.from(this.stats.entries())
      .map(([type, stats]) => ({ type, count: stats.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  logStats(): void {
    const stats = this.getStats();
    const mostFrequent = this.getMostFrequentErrors(3);
    
    console.log('\n📊 에러 통계:');
    mostFrequent.forEach(({ type, count }) => {
      console.log(`  ${type}: ${count}회 발생`);
    });
    
    if (Object.keys(stats).length === 0) {
      console.log('  에러 없음 ✅');
    }
  }
}

export const errorStats = new ErrorStatsCollector();

/**
 * 🎯 비즈니스 로직별 특화 에러 핸들러
 */
export const SpecializedErrorHandlers = {
  /**
   * 가이드 생성 전용 에러 처리
   */
  guideGeneration: (error: any, locationName?: string): ErrorInfo => {
    const baseInfo = classifyError(error);
    
    // 가이드 생성 맥락에 맞게 메시지 조정
    if (baseInfo.type === ErrorType.AI_API_ERROR) {
      return {
        ...baseInfo,
        userMessage: `"${locationName}" 가이드 생성에 실패했습니다.`,
        suggestion: '다른 장소명으로 시도하거나 잠시 후 다시 시도해보세요.'
      };
    }
    
    if (baseInfo.type === ErrorType.NETWORK_TIMEOUT) {
      return {
        ...baseInfo,
        userMessage: '가이드 생성이 너무 오래 걸립니다.',
        suggestion: '복잡한 장소의 경우 시간이 오래 걸릴 수 있습니다. 잠시 후 다시 시도해보세요.'
      };
    }
    
    return baseInfo;
  },
  
  /**
   * 좌표 생성 전용 에러 처리
   */
  coordinateGeneration: (error: any): ErrorInfo => {
    const baseInfo = classifyError(error);
    
    if (baseInfo.type === ErrorType.API_RATE_LIMIT) {
      return {
        ...baseInfo,
        userMessage: '지도 데이터 처리 요청이 제한되었습니다.',
        suggestion: '가이드는 정상적으로 생성되었으며, 지도는 잠시 후 표시됩니다.'
      };
    }
    
    return baseInfo;
  }
};
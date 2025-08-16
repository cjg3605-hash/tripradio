/**
 * 🔄 API 재시도 시스템
 * 네트워크 오류, 타임아웃, 서버 오류에 대한 지능형 재시도 로직
 */

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  exponentialBackoff: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  delayMs: 1000,
  exponentialBackoff: true,
  retryCondition: (error) => {
    // 재시도할 수 있는 에러 타입들
    if (error?.code) {
      // Supabase 관련 재시도 가능한 에러들
      const retryableCodes = [
        'PGRST301', // Connection timeout
        'PGRST302', // Connection refused
        'PGRST104', // Conflict (때로는 일시적)
        '406',      // Not Acceptable (헤더 문제 등)
        '503',      // Service Unavailable
        '502',      // Bad Gateway
        '504'       // Gateway Timeout
      ];
      return retryableCodes.includes(error.code);
    }

    // HTTP 상태 코드 기반 재시도
    if (error?.status) {
      const retryableStatus = [408, 429, 500, 502, 503, 504];
      return retryableStatus.includes(error.status);
    }

    // 네트워크 관련 에러
    if (error?.message) {
      const networkErrors = [
        'fetch failed',
        'network error',
        'timeout',
        'connection refused',
        'connection reset',
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT'
      ];
      const message = error.message.toLowerCase();
      return networkErrors.some(err => message.includes(err));
    }

    return false;
  }
};

/**
 * 🔄 지능형 API 재시도 실행
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      console.log(attempt > 0 ? `🔄 재시도 ${attempt}/${finalConfig.maxRetries}` : '🚀 초기 시도');
      
      const result = await operation();
      
      if (attempt > 0) {
        console.log(`✅ ${attempt}번째 재시도에서 성공`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // 마지막 시도이거나 재시도 불가능한 에러인 경우
      if (attempt >= finalConfig.maxRetries || !finalConfig.retryCondition?.(error)) {
        if (attempt >= finalConfig.maxRetries) {
          console.error(`❌ ${finalConfig.maxRetries}번 재시도 후 최종 실패:`, error);
        } else {
          console.error('❌ 재시도 불가능한 에러:', error);
        }
        throw error;
      }
      
      // 재시도 전 대기
      const delay = finalConfig.exponentialBackoff 
        ? finalConfig.delayMs * Math.pow(2, attempt)
        : finalConfig.delayMs;
      
      console.warn(`⚠️ ${attempt + 1}번째 시도 실패, ${delay}ms 후 재시도:`, error instanceof Error ? error.message : String(error));
      
      finalConfig.onRetry?.(attempt + 1, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * 🔄 Supabase 전용 재시도 래퍼
 */
export async function withSupabaseRetry<T>(
  operation: () => Promise<T>,
  context: string = 'Supabase 작업'
): Promise<T> {
  return withRetry(operation, {
    maxRetries: 2,
    delayMs: 1000,
    exponentialBackoff: true,
    retryCondition: (error) => {
      // Supabase 특화 재시도 조건
      if (error?.code) {
        // Supabase 에러 코드별 재시도 정책
        const retryableCodes = [
          'PGRST301', // Connection timeout
          'PGRST302', // Connection refused  
          'PGRST104', // Conflict
          '406',      // Not Acceptable
          '503',      // Service Unavailable
          '502',      // Bad Gateway
          '504'       // Gateway Timeout
        ];
        return retryableCodes.includes(error.code);
      }
      
      return DEFAULT_RETRY_CONFIG.retryCondition?.(error) || false;
    },
    onRetry: (attempt, error) => {
      console.log(`🔄 ${context} - ${attempt}번째 재시도 (에러: ${error.code || error.status || error.message})`);
    }
  });
}

/**
 * 🔄 Google API 전용 재시도 래퍼
 */
export async function withGoogleAPIRetry<T>(
  operation: () => Promise<T>,
  context: string = 'Google API 호출'
): Promise<T> {
  return withRetry(operation, {
    maxRetries: 3,
    delayMs: 2000,
    exponentialBackoff: true,
    retryCondition: (error) => {
      // Google API 특화 재시도 조건
      if (error?.status) {
        const retryableStatus = [
          429, // Too Many Requests
          500, // Internal Server Error
          502, // Bad Gateway
          503, // Service Unavailable
          504  // Gateway Timeout
        ];
        return retryableStatus.includes(error.status);
      }
      
      if (error?.message) {
        const message = error.message.toLowerCase();
        // Google API 특화 에러 메시지
        const googleErrors = [
          'quota exceeded',
          'rate limit',
          'service unavailable',
          'backend error'
        ];
        return googleErrors.some(err => message.includes(err));
      }
      
      return DEFAULT_RETRY_CONFIG.retryCondition?.(error) || false;
    },
    onRetry: (attempt, error) => {
      console.log(`🔄 ${context} - ${attempt}번째 재시도 (Google API 에러: ${error.status || error.message})`);
    }
  });
}

/**
 * 🔄 Fetch 전용 재시도 래퍼
 */
export async function withFetchRetry(
  url: string,
  options: RequestInit = {},
  context: string = 'HTTP 요청'
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, {
      ...options,
      // 기본 타임아웃 설정
      signal: options.signal || AbortSignal.timeout(15000)
    });
    
    // HTTP 에러 상태도 예외로 처리
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }
    
    return response;
  }, {
    maxRetries: 2,
    delayMs: 1000,
    exponentialBackoff: true,
    onRetry: (attempt, error) => {
      console.log(`🔄 ${context} - ${attempt}번째 재시도 (URL: ${url}, 에러: ${error.status || error.message})`);
    }
  });
}

/**
 * 📊 재시도 통계 수집기
 */
class RetryStatsCollector {
  private stats = new Map<string, { attempts: number; successes: number; failures: number }>();
  
  recordAttempt(operation: string): void {
    const current = this.stats.get(operation) || { attempts: 0, successes: 0, failures: 0 };
    current.attempts++;
    this.stats.set(operation, current);
  }
  
  recordSuccess(operation: string): void {
    const current = this.stats.get(operation) || { attempts: 0, successes: 0, failures: 0 };
    current.successes++;
    this.stats.set(operation, current);
  }
  
  recordFailure(operation: string): void {
    const current = this.stats.get(operation) || { attempts: 0, successes: 0, failures: 0 };
    current.failures++;
    this.stats.set(operation, current);
  }
  
  getStats(): { [operation: string]: { attempts: number; successes: number; failures: number; successRate: number } } {
    const result: any = {};
    
    for (const [operation, stats] of this.stats.entries()) {
      result[operation] = {
        ...stats,
        successRate: stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0
      };
    }
    
    return result;
  }
  
  logStats(): void {
    const stats = this.getStats();
    console.log('\n📊 API 재시도 통계:');
    for (const [operation, stat] of Object.entries(stats)) {
      console.log(`  ${operation}: ${stat.successes}/${stat.attempts} (${stat.successRate.toFixed(1)}% 성공률)`);
    }
  }
}

export const retryStats = new RetryStatsCollector();
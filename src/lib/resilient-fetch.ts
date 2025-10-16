// 복원력 있는 HTTP 클라이언트 - 타임아웃, 재시도, 서킷브레이커 통합
import { aiCircuitBreaker } from './circuit-breaker';

export interface ResilienceConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  useCircuitBreaker?: boolean;
  abortSignal?: AbortSignal;
}

export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Operation timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

export class RetryExhaustedError extends Error {
  constructor(attempts: number, lastError: Error) {
    super(`Failed after ${attempts} attempts. Last error: ${lastError.message}`);
    this.name = 'RetryExhaustedError';
    this.cause = lastError;
  }
}

export async function resilientFetch(
  url: string | URL,
  options: RequestInit & ResilienceConfig = {}
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 2,
    retryDelay = 1000,
    useCircuitBreaker = true,
    abortSignal,
    ...fetchOptions
  } = options;

  const operation = async (): Promise<Response> => {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const combinedSignal = combineAbortSignals([controller.signal, abortSignal]);
      
      // 타임아웃 설정
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);
      
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: combinedSignal
        });
        
        clearTimeout(timeoutId);
        
        // HTTP 에러 상태 체크
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          if (response.status >= 500 && attempt < retries) {
            lastError = error;
            await delay(retryDelay * Math.pow(2, attempt)); // 지수 백오프
            continue;
          }
          throw error;
        }
        
        return response;
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          // AbortError를 TimeoutError로 변환
          if (error.name === 'AbortError' && !abortSignal?.aborted) {
            lastError = new TimeoutError(timeout);
          } else {
            lastError = error;
          }
          
          // 재시도 가능한 에러인지 확인
          if (isRetryableError(error) && attempt < retries) {
            console.warn(`🔄 재시도 ${attempt + 1}/${retries}: ${error.message}`);
            await delay(retryDelay * Math.pow(2, attempt));
            continue;
          }
        }
        
        throw lastError || (error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    throw new RetryExhaustedError(retries + 1, lastError || new Error('Unknown error'));
  };

  // 서킷브레이커 적용
  if (useCircuitBreaker) {
    return await aiCircuitBreaker.call(operation);
  }
  
  return await operation();
}

// AbortSignal 결합 유틸리티
function combineAbortSignals(signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();
  const validSignals = signals.filter(Boolean) as AbortSignal[];
  
  for (const signal of validSignals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  
  return controller.signal;
}

// 재시도 가능한 에러 판별
function isRetryableError(error: Error): boolean {
  if (error instanceof TimeoutError) return true;
  if (error.name === 'NetworkError') return true;
  if (error.message.includes('fetch')) return true;
  
  // HTTP 5xx 에러는 재시도 가능
  const httpMatch = error.message.match(/HTTP (\d+)/);
  if (httpMatch) {
    const status = parseInt(httpMatch[1]);
    return status >= 500;
  }
  
  return false;
}

// 지연 유틸리티
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 편의 함수들
export const resilientPost = (url: string | URL, data: any, config?: ResilienceConfig) =>
  resilientFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    ...config
  });

export const resilientGet = (url: string | URL, config?: ResilienceConfig) =>
  resilientFetch(url, { method: 'GET', ...config });
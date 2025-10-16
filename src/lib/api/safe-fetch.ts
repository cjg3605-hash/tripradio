/**
 * 안전한 API 호출을 위한 유틸리티 함수
 * JSON 파싱 에러를 방지하고 일관된 에러 처리를 제공합니다.
 */

export interface SafeFetchOptions extends RequestInit {
  timeout?: number;
}

export interface SafeFetchResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * 안전한 fetch 래퍼 함수
 * @param url 요청 URL
 * @param options 요청 옵션
 * @returns Promise<SafeFetchResult<T>>
 */
export async function safeFetch<T = any>(
  url: string, 
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult<T>> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  try {
    // 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // HTTP 상태 확인
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      };
    }
    
    // Content-Type 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return {
        success: false,
        error: `예상하지 못한 응답 형식입니다. Content-Type: ${contentType}`,
        status: response.status
      };
    }
    
    // JSON 파싱
    const data = await response.json();
    
    return {
      success: true,
      data,
      status: response.status
    };
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: `요청 시간 초과 (${timeout}ms)`
        };
      }
      
      if (error.message.includes('JSON')) {
        return {
          success: false,
          error: 'JSON 파싱 오류: 서버에서 유효하지 않은 JSON을 반환했습니다.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: '알 수 없는 오류가 발생했습니다.'
    };
  }
}

/**
 * GET 요청을 위한 간단한 래퍼
 */
export async function safeGet<T = any>(url: string, options?: SafeFetchOptions): Promise<SafeFetchResult<T>> {
  return safeFetch<T>(url, { ...options, method: 'GET' });
}

/**
 * POST 요청을 위한 간단한 래퍼
 */
export async function safePost<T = any>(
  url: string, 
  data?: any, 
  options?: SafeFetchOptions
): Promise<SafeFetchResult<T>> {
  return safeFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: data ? JSON.stringify(data) : undefined
  });
}
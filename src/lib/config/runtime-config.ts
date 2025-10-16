/**
 * 런타임 설정 관리
 * 서버 시작 후에도 동적으로 설정을 감지하고 업데이트
 */

interface RuntimeConfig {
  port: number;
  host: string;
  protocol: string;
  baseUrl: string;
  nextAuthUrl: string;
}

let runtimeConfig: RuntimeConfig | null = null;

/**
 * 서버 요청에서 실제 호스트와 포트 감지
 */
export function detectRuntimeConfig(req?: any): RuntimeConfig {
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드
    const location = window.location;
    return {
      port: parseInt(location.port) || (location.protocol === 'https:' ? 443 : 80),
      host: location.hostname,
      protocol: location.protocol.replace(':', ''),
      baseUrl: location.origin,
      nextAuthUrl: location.origin
    };
  }

  // 서버 사이드
  if (req?.headers) {
    const host = req.headers.host || req.headers['x-forwarded-host'] || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 
                     (req.connection?.encrypted ? 'https' : 'http');
    
    const [hostname, portStr] = host.split(':');
    const port = parseInt(portStr) || (protocol === 'https' ? 443 : 80);
    
    const baseUrl = `${protocol}://${host}`;
    
    return {
      port,
      host: hostname,
      protocol,
      baseUrl,
      nextAuthUrl: baseUrl
    };
  }

  // 환경변수 기반 기본값
  const port = parseInt(process.env.PORT || '3000', 10);
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.NODE_ENV === 'production' ? 'navidocent.com' : 'localhost';
  const baseUrl = `${protocol}://${host}${port === 80 || port === 443 ? '' : `:${port}`}`;

  return {
    port,
    host,
    protocol,
    baseUrl,
    nextAuthUrl: baseUrl
  };
}

/**
 * 런타임 설정 캐싱 및 반환
 */
export function getRuntimeConfig(req?: any): RuntimeConfig {
  if (!runtimeConfig || req) {
    runtimeConfig = detectRuntimeConfig(req);
  }
  return runtimeConfig;
}

/**
 * NextAuth 설정을 런타임에 업데이트
 */
export function updateNextAuthConfig(req?: any): void {
  const config = getRuntimeConfig(req);
  
  // 개발 환경에서만 동적 업데이트
  if (process.env.NODE_ENV !== 'production') {
    process.env.NEXTAUTH_URL = config.nextAuthUrl;
  }
}

/**
 * API 라우트에서 사용할 수 있는 헬퍼
 */
export function getApiBaseUrl(req: any): string {
  const config = detectRuntimeConfig(req);
  return config.baseUrl;
}

/**
 * 환경변수를 런타임 설정으로 오버라이드
 */
export function overrideProcessEnv(req?: any): void {
  const config = getRuntimeConfig(req);
  
  if (process.env.NODE_ENV !== 'production') {
    process.env.NEXTAUTH_URL = config.nextAuthUrl;
    process.env.NEXT_PUBLIC_BASE_URL = config.baseUrl;
  }
}
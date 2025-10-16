/**
 * 동적 환경변수 설정 관리
 */

interface DynamicConfig {
  port: number;
  nextAuthUrl: string;
  isDevelopment: boolean;
  baseUrl: string;
}

/**
 * 현재 실행 포트 동적 감지
 */
export function detectCurrentPort(): number {
  // 1. 환경변수에서 PORT 확인
  if (process.env.PORT) {
    return parseInt(process.env.PORT, 10);
  }
  
  // 2. 개발 서버 기본 포트들 순차 확인
  const defaultPorts = [3000, 3001, 3002, 3030, 3035, 3040];
  
  // 현재 프로세스의 포트 감지 (서버사이드)
  if (typeof window === 'undefined') {
    // Node.js 환경에서만 실행
    try {
      const net = require('net');
      for (const port of defaultPorts) {
        const server = net.createServer();
        try {
          server.listen(port);
          server.close();
          return port;
        } catch {
          continue;
        }
      }
    } catch {
      // net 모듈을 사용할 수 없는 경우
    }
  }
  
  // 3. 클라이언트에서 현재 URL의 포트 감지
  if (typeof window !== 'undefined') {
    const port = parseInt(window.location.port, 10);
    if (port) return port;
  }
  
  // 기본값
  return 3000;
}

/**
 * NextAuth URL 동적 생성
 */
export function generateNextAuthUrl(): string {
  const port = detectCurrentPort();
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
  }
  
  return `${protocol}://localhost:${port}`;
}

/**
 * 동적 설정 객체 생성
 */
export function getDynamicConfig(): DynamicConfig {
  const port = detectCurrentPort();
  const nextAuthUrl = generateNextAuthUrl();
  
  return {
    port,
    nextAuthUrl,
    isDevelopment: process.env.NODE_ENV !== 'production',
    baseUrl: nextAuthUrl
  };
}

/**
 * 환경변수 동적 오버라이드
 */
export function overrideEnvVars(): void {
  const config = getDynamicConfig();
  
  // 개발 환경에서만 동적 설정 적용
  if (config.isDevelopment) {
    process.env.NEXTAUTH_URL = config.nextAuthUrl;
    process.env.NEXT_PUBLIC_BASE_URL = config.baseUrl;
    
    console.log(`🔄 동적 환경변수 설정:`);
    console.log(`   NEXTAUTH_URL: ${config.nextAuthUrl}`);
    console.log(`   포트: ${config.port}`);
  }
}

/**
 * 클라이언트용 동적 설정 (브라우저)
 */
export function getClientConfig() {
  if (typeof window === 'undefined') return null;
  
  const currentUrl = new URL(window.location.href);
  const port = currentUrl.port || (currentUrl.protocol === 'https:' ? '443' : '80');
  
  return {
    port: parseInt(port, 10),
    baseUrl: `${currentUrl.protocol}//${currentUrl.hostname}:${currentUrl.port}`,
    origin: currentUrl.origin
  };
}
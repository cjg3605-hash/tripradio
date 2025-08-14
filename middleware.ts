import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import createIntlMiddleware from 'next-intl/middleware';
import { botDetectionEngine } from './src/lib/security/bot-detection-engine';
import { captchaSystem } from './src/lib/security/captcha-system';
import { loginRateLimiter, emailVerificationRateLimiter } from './src/lib/rate-limiter-auth';

// next-intl 미들웨어 설정
const intlMiddleware = createIntlMiddleware({
  locales: ['ko', 'en', 'ja', 'zh', 'es'],
  defaultLocale: 'ko',
  localeDetection: false
});

/**
 * 클라이언트 IP 추출 헬퍼 함수
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return request.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * 인증 엔드포인트 확인
 */
function isAuthenticationEndpoint(pathname: string): boolean {
  const authEndpoints = [
    '/api/auth/register',
    '/api/auth/signin',
    '/api/auth/email-verification',
    '/auth/signin'
  ];
  
  return authEndpoints.some(endpoint => pathname.includes(endpoint));
}

/**
 * Rate limiting 적용
 */
async function applyRateLimit(request: NextRequest): Promise<{ blocked: boolean; retryAfter?: number }> {
  const pathname = request.nextUrl.pathname;
  
  try {
    if (pathname.includes('/api/auth/signin') || pathname.includes('/auth/signin')) {
      const result = await loginRateLimiter.isRateLimited(request);
      return {
        blocked: result.limited,
        retryAfter: result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : undefined
      };
    }
    
    if (pathname.includes('/api/auth/email-verification')) {
      const result = await emailVerificationRateLimiter.isRateLimited(request);
      return {
        blocked: result.limited,
        retryAfter: result.resetTime ? Math.ceil((result.resetTime - Date.now()) / 1000) : undefined
      };
    }
    
    return { blocked: false };
  } catch (error) {
    console.error('Rate limiting 오류:', error);
    return { blocked: false };
  }
}

/**
 * 봇 탐지 및 보안 미들웨어
 */
async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const startTime = Date.now();
  const ip = getClientIP(request);
  
  try {
    // 1. 봇 탐지 실행
    const botDetectionResult = await botDetectionEngine.detectBot(request);
    
    // 2. 봇으로 판단되면 차단
    if (botDetectionResult.action === 'block') {
      console.log(`🤖 봇 요청 차단: ${ip} (위험도: ${botDetectionResult.riskScore})`);
      return new NextResponse('Access Denied', { 
        status: 403,
        headers: {
          'X-Bot-Detection': 'blocked',
          'X-Risk-Score': botDetectionResult.riskScore.toString()
        }
      });
    }
    
    // 3. CAPTCHA 챌린지 필요 시 처리
    if (botDetectionResult.action === 'challenge') {
      const captchaRequired = captchaSystem.shouldRequireCaptcha(botDetectionResult.riskScore);
      if (captchaRequired && isAuthenticationEndpoint(request.nextUrl.pathname)) {
        const challenge = captchaSystem.getAdaptiveCaptcha(botDetectionResult.riskScore);
        
        return new NextResponse(JSON.stringify({
          error: 'CAPTCHA_REQUIRED',
          challenge: {
            id: challenge.id,
            type: challenge.type,
            challenge: challenge.challenge
          },
          riskScore: botDetectionResult.riskScore
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-Bot-Detection': 'challenge',
            'X-Risk-Score': botDetectionResult.riskScore.toString()
          }
        });
      }
    }
    
    // 4. Rate limiting 적용
    if (isAuthenticationEndpoint(request.nextUrl.pathname)) {
      const rateLimitResult = await applyRateLimit(request);
      if (rateLimitResult.blocked) {
        return new NextResponse(JSON.stringify({
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: rateLimitResult.retryAfter
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-Rate-Limit': 'exceeded'
          }
        });
      }
    }
    
    // 5. 처리 시간 로깅
    const processingTime = Date.now() - startTime;
    if (processingTime > 100) {
      console.warn(`⚠️ 미들웨어 처리 시간 초과: ${processingTime}ms (${request.nextUrl.pathname})`);
    }
    
    // 보안 검사 통과
    return null;
  } catch (error) {
    console.error('보안 미들웨어 오류:', error);
    // 오류 발생 시 정상 처리 계속
    return null;
  }
}

export default withAuth(
  async function middleware(req) {
    // 1. next-intl 미들웨어 실행 (정적 경로 제외)
    const pathname = req.nextUrl.pathname;
    const isApiRoute = pathname.startsWith('/api/');
    const isStaticFile = pathname.includes('.');
    
    if (!isApiRoute && !isStaticFile) {
      const intlResponse = intlMiddleware(req);
      if (intlResponse instanceof Response) {
        return intlResponse;
      }
    }
    
    // 2. 보안 미들웨어 실행
    const securityResponse = await securityMiddleware(req);
    if (securityResponse) {
      return securityResponse;
    }
    
    // 3. 강제 로그아웃 감지 및 처리
    const isForceLogout = req.nextUrl.pathname === '/api/auth/force-logout';
    if (isForceLogout) {
      // 강제 로그아웃 요청 시 토큰 캐시 무효화
      console.log('🔥 미들웨어: 강제 로그아웃 감지, 토큰 캐시 무효화');
      // NextAuth 토큰 강제 무효화
      req.nextauth.token = null;
    }
    
    // 4. 쿠키 기반 세션 검증 (토큰 캐시 우회)
    const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                        req.cookies.get('__Secure-next-auth.session-token')?.value;
    
    const hasValidSession = sessionToken && req.nextauth.token;
    
    // 5. 기본 인증 처리 (쿠키 검증 기반)
    let response: NextResponse;
    
    if (!hasValidSession && req.nextUrl.pathname.startsWith('/mypage')) {
      console.log('🚪 미들웨어: 세션 없음, 로그인 페이지로 리다이렉트');
      response = NextResponse.redirect(
        new URL('/auth/signin?callbackUrl=' + encodeURIComponent(req.url), req.url)
      );
    } else if (hasValidSession && req.nextUrl.pathname.startsWith('/auth/signin')) {
      console.log('🔄 미들웨어: 로그인 상태에서 로그인 페이지 접근, 홈으로 리다이렉트');
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
      response = NextResponse.redirect(
        new URL(callbackUrl || '/', req.url)
      );
    } else {
      response = NextResponse.next();
    }

    // 3. 보안 헤더 추가
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.openai.com https:; frame-src 'self' https://www.google.com;"
    );
    
    // 4. 인증 관련 경로에 추가 보안 헤더 (Next.js headers()에서 처리되므로 여기서는 제거)

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/mypage')) {
          // 쿠키 기반 세션 검증 (토큰 캐시 우회)
          const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                              req.cookies.get('__Secure-next-auth.session-token')?.value;
          
          const hasValidAuth = !!(token && sessionToken);
          console.log(`🔐 미들웨어 authorized: mypage 접근, token: ${!!token}, sessionToken: ${!!sessionToken}, hasValidAuth: ${hasValidAuth}`);
          return hasValidAuth;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all pathnames except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (public files)
     * - files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
    '/api/auth/:path*',
    '/api/security/:path*',
    '/api/monitoring/:path*'
  ],
};
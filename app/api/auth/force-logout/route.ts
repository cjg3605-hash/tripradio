import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 강제 로그아웃 API 호출됨');
    
    // NextAuth 내부 캐시 무효화 신호
    const timestamp = Date.now();
    console.log(`📡 강제 로그아웃 타임스탬프: ${timestamp}`);
    
    // 모든 NextAuth 관련 쿠키 강제 삭제
    const cookieStore = cookies();
    const authCookieNames = [
      'next-auth.session-token',
      'next-auth.callback-url', 
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
    ];

    const response = NextResponse.json({ 
      success: true, 
      message: '강제 로그아웃 완료',
      timestamp: new Date().toISOString(),
      cacheInvalidation: timestamp
    });

    // 캐시 무효화 헤더 추가
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Auth-Cache-Invalidate', timestamp.toString());

    // 서버 사이드에서 쿠키 강제 삭제
    authCookieNames.forEach(cookieName => {
      // 환경에 따른 도메인 설정
      const domains = process.env.NODE_ENV === 'production' 
        ? ['navidocent.com', '.navidocent.com', undefined]
        : [undefined]; // 개발환경에서는 도메인 설정 안함
      const paths = ['/', '/auth', '/api'];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          const cookieOptions: any = {
            expires: new Date(0),
            path: path,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          };
          
          if (domain) {
            cookieOptions.domain = domain;
          }
          
          response.cookies.set(cookieName, '', cookieOptions);
          console.log(`🍪 쿠키 삭제 시도: ${cookieName}, 도메인: ${domain || 'default'}, 경로: ${path}`);
        });
      });
    });

    console.log('✅ 서버 사이드 강제 로그아웃 완료');
    return response;
    
  } catch (error) {
    console.error('❌ 강제 로그아웃 실패:', error);
    return NextResponse.json(
      { success: false, error: '강제 로그아웃 실패' },
      { status: 500 }
    );
  }
}
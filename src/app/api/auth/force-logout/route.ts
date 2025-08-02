import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 강제 로그아웃 API 호출됨');
    
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
      timestamp: new Date().toISOString()
    });

    // 서버 사이드에서 쿠키 강제 삭제
    authCookieNames.forEach(cookieName => {
      // 다양한 도메인과 경로로 삭제 시도
      const domains = ['navidocent.com', '.navidocent.com', undefined];
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
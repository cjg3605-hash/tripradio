import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API 호출됨');

    // 기본 환경변수만 먼저 확인
    const basicEnvCheck = {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
    };

    console.log('🔐 NextAuth 기본 환경변수:', basicEnvCheck);

    return NextResponse.json({
      status: 'debug_success',
      basicEnvCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Debug API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    return NextResponse.json({
      status: 'debug_error',
      error: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
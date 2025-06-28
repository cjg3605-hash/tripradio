import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 기본 환경변수 확인
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'GEMINI_API_KEY not configured',
          setup_required: true
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Health check passed',
      services: {
        gemini: 'configured'
      }
    });

  } catch (error: any) {
    console.error('❌ Health check 실패:', error.message);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
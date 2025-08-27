import { NextResponse } from 'next/server';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: '서버가 정상 작동 중입니다',
    timestamp: new Date().toISOString()
  });
}
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';

async function getGuideStatsHandler() {
  try {
    // 실제 구현시에는 가이드 생성 로그나 사용자 활동 데이터에서 조회
    // localStorage 데이터는 서버에서 직접 접근할 수 없으므로 
    // 별도의 가이드 생성 로그 테이블이 필요합니다.
    
    // 현재는 모의 데이터로 구현
    const mockGuideStats = {
      totalGenerated: 45621 + Math.floor(Math.random() * 1000),
      dailyGenerated: 312 + Math.floor(Math.random() * 100),
      weeklyGenerated: 1987 + Math.floor(Math.random() * 500),
      completionRate: 84.2 + (Math.random() * 10 - 5),
      averageLength: 8.5 + (Math.random() * 3 - 1.5),
      topLanguages: [
        { language: 'Korean', count: 28473, percentage: 62.4 },
        { language: 'English', count: 9124, percentage: 20.0 },
        { language: 'Japanese', count: 4562, percentage: 10.0 },
        { language: 'Chinese', count: 2281, percentage: 5.0 },
        { language: 'Spanish', count: 1181, percentage: 2.6 }
      ]
    };

    // 최근 7일간 가이드 생성 추이
    const generationTrend: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      generationTrend.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 400) + 200
      });
    }

    // 시간대별 가이드 생성 패턴 (0-23시)
    const hourlyPattern = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 50) + 10
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...mockGuideStats,
        generationTrend,
        hourlyPattern
      }
    });

  } catch (error) {
    console.error('가이드 통계 조회 실패:', error);
    return NextResponse.json({
      success: false,
      message: '가이드 통계 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

export const GET = withAdminAuth(getGuideStatsHandler);
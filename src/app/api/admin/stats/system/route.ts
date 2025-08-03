import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';

async function getSystemStatsHandler() {
  try {
    // 실제 구현시에는 시스템 모니터링 도구에서 데이터를 가져옴
    // 예: New Relic, DataDog, Prometheus 등
    
    const mockSystemStats = {
      uptime: 99.7 + (Math.random() * 0.5 - 0.2), // 99.5% ~ 99.9%
      avgResponseTime: 245 + Math.floor(Math.random() * 100 - 50), // 195ms ~ 295ms
      errorRate: 0.3 + (Math.random() * 0.4 - 0.2), // 0.1% ~ 0.5%
      serverLoad: 34.2 + (Math.random() * 20 - 10), // 24.2% ~ 44.2%
      memoryUsage: 68.5 + (Math.random() * 15 - 7.5), // 61% ~ 76%
      diskUsage: 45.3 + (Math.random() * 10 - 5), // 40.3% ~ 50.3%
      networkTraffic: {
        inbound: Math.floor(Math.random() * 500 + 200), // MB/s
        outbound: Math.floor(Math.random() * 300 + 100) // MB/s
      }
    };

    // 최근 24시간 응답시간 추이 (시간별)
    const responseTimeTrend: Array<{ hour: number; time: string; responseTime: number }> = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      responseTimeTrend.push({
        hour: hour.getHours(),
        time: hour.toISOString(),
        responseTime: Math.floor(Math.random() * 200 + 150)
      });
    }

    // 최근 7일간 에러율 추이
    const errorRateTrend: Array<{ date: string; errorRate: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      errorRateTrend.push({
        date: date.toISOString().split('T')[0],
        errorRate: Math.random() * 0.8 + 0.1
      });
    }

    // API 엔드포인트별 성능
    const apiPerformance = [
      { endpoint: '/api/node/ai/generate-guide', avgResponseTime: 2340, requests: 1247, errorRate: 0.2 },
      { endpoint: '/api/locations/search', avgResponseTime: 156, requests: 3421, errorRate: 0.1 },
      { endpoint: '/api/auth/[...nextauth]', avgResponseTime: 89, requests: 1876, errorRate: 0.3 },
      { endpoint: '/api/tts/generate', avgResponseTime: 678, requests: 987, errorRate: 0.4 },
      { endpoint: '/api/admin/stats/*', avgResponseTime: 234, requests: 156, errorRate: 0.0 }
    ];

    return NextResponse.json({
      success: true,
      data: {
        ...mockSystemStats,
        responseTimeTrend,
        errorRateTrend,
        apiPerformance,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('시스템 통계 조회 실패:', error);
    return NextResponse.json({
      success: false,
      message: '시스템 통계 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

export const GET = withAdminAuth(getSystemStatsHandler);
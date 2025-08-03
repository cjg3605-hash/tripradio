import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';

async function getLocationStatsHandler() {
  try {
    // 실제 구현시에는 가이드 생성 로그에서 location 데이터를 집계
    // 현재는 모의 데이터로 구현
    
    const mockLocationStats = {
      popularDestinations: [
        { name: '경복궁', count: 3842, percentage: 8.4, trend: '+12%' },
        { name: '제주도', count: 3156, percentage: 6.9, trend: '+8%' },
        { name: '부산', count: 2843, percentage: 6.2, trend: '+15%' },
        { name: '경주', count: 2567, percentage: 5.6, trend: '+5%' },
        { name: '서울타워', count: 2234, percentage: 4.9, trend: '+3%' },
        { name: '인사동', count: 1987, percentage: 4.4, trend: '+7%' },
        { name: '명동', count: 1823, percentage: 4.0, trend: '-2%' },
        { name: '홍대', count: 1654, percentage: 3.6, trend: '+9%' },
        { name: '강남', count: 1432, percentage: 3.1, trend: '+4%' },
        { name: '대구', count: 1287, percentage: 2.8, trend: '+6%' }
      ],
      totalLocations: 1247,
      categoryBreakdown: [
        { category: '역사 유적지', count: 156, percentage: 32.4 },
        { category: '자연 관광지', count: 134, percentage: 27.8 },
        { category: '도시 명소', count: 98, percentage: 20.3 },
        { category: '문화 시설', count: 67, percentage: 13.9 },
        { category: '쇼핑/엔터테인먼트', count: 27, percentage: 5.6 }
      ],
      regionalDistribution: [
        { region: '서울', count: 245, percentage: 19.6 },
        { region: '부산', count: 123, percentage: 9.9 },
        { region: '제주', count: 98, percentage: 7.9 },
        { region: '경기', count: 156, percentage: 12.5 },
        { region: '강원', count: 89, percentage: 7.1 },
        { region: '경북', count: 134, percentage: 10.7 },
        { region: '경남', count: 98, percentage: 7.9 },
        { region: '전북', count: 76, percentage: 6.1 },
        { region: '전남', count: 87, percentage: 7.0 },
        { region: '충북', count: 54, percentage: 4.3 },
        { region: '충남', count: 45, percentage: 3.6 },
        { region: '기타', count: 42, percentage: 3.4 }
      ]
    };

    // 최근 7일간 새로운 관광지 추가 현황
    const newLocationsTrend: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      newLocationsTrend.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 15) + 2
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...mockLocationStats,
        newLocationsTrend
      }
    });

  } catch (error) {
    console.error('관광지 통계 조회 실패:', error);
    return NextResponse.json({
      success: false,
      message: '관광지 통계 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

export const GET = withAdminAuth(getLocationStatsHandler);
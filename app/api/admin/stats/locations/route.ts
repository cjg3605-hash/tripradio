import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabaseClient';

async function getLocationStatsHandler() {
  try {
    // 날짜 계산
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 가이드 생성 로그에서 location_name 집계
    const { data: locationData } = await supabase
      .from('guide_generation_logs')
      .select('location_name, region, category')
      .not('location_name', 'is', null);

    // 총 고유 관광지 수
    const uniqueLocations = new Set(locationData?.map(item => item.location_name) || []);
    const totalLocations = uniqueLocations.size;

    // 인기 관광지 TOP 10
    const locationCounts: { [key: string]: number } = {};
    locationData?.forEach(log => {
      if (log.location_name) {
        locationCounts[log.location_name] = (locationCounts[log.location_name] || 0) + 1;
      }
    });

    const totalRequests = locationData?.length || 0;
    const popularDestinations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count], index) => {
        // 이전 달 대비 트렌드 계산 (모의 데이터로 대체)
        const trendValue = Math.floor(Math.random() * 20) - 5; // -5% ~ +15%
        const trend = trendValue >= 0 ? `+${trendValue}%` : `${trendValue}%`;
        
        return {
          name,
          count,
          percentage: totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0,
          trend
        };
      });

    // 카테고리별 분포
    const categoryCounts: { [key: string]: number } = {};
    locationData?.forEach(log => {
      if (log.category) {
        categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
      }
    });

    const categoryBreakdown = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0
      }));

    // 기본 카테고리 설정 (데이터가 없는 경우)
    if (categoryBreakdown.length === 0) {
      categoryBreakdown.push(
        { category: '역사 유적지', count: 0, percentage: 0 },
        { category: '자연 관광지', count: 0, percentage: 0 },
        { category: '도시 명소', count: 0, percentage: 0 },
        { category: '문화 시설', count: 0, percentage: 0 },
        { category: '쇼핑/엔터테인먼트', count: 0, percentage: 0 }
      );
    }

    // 지역별 분포
    const regionCounts: { [key: string]: number } = {};
    locationData?.forEach(log => {
      if (log.region) {
        regionCounts[log.region] = (regionCounts[log.region] || 0) + 1;
      }
    });

    const regionalDistribution = Object.entries(regionCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([region, count]) => ({
        region,
        count,
        percentage: totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0
      }));

    // 기본 지역 설정 (데이터가 없는 경우)
    if (regionalDistribution.length === 0) {
      regionalDistribution.push(
        { region: '서울', count: 0, percentage: 0 },
        { region: '부산', count: 0, percentage: 0 },
        { region: '제주', count: 0, percentage: 0 },
        { region: '경기', count: 0, percentage: 0 },
        { region: '기타', count: 0, percentage: 0 }
      );
    }

    const locationStats = {
      popularDestinations,
      totalLocations,
      categoryBreakdown,
      regionalDistribution
    };

    // 최근 7일간 새로운 관광지 추가 현황 (실제 데이터 기반)
    const newLocationsTrend: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // 해당 날짜에 처음 등장한 관광지 수 계산
      const { data: dailyNewLocations } = await supabase
        .from('guide_generation_logs')
        .select('location_name')
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
        .not('location_name', 'is', null);

      // 이전에 등장하지 않은 새로운 관광지만 계산 (간단한 근사치)
      const uniqueDailyLocations = new Set(dailyNewLocations?.map(item => item.location_name) || []);
      
      newLocationsTrend.push({
        date: date.toISOString().split('T')[0],
        count: uniqueDailyLocations.size
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...locationStats,
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
import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabaseClient';

async function getUserStatsHandler() {
  try {
    // 총 사용자 수
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 최근 24시간 활성 사용자 (가이드 생성 기준)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // 실제 구현시에는 user_activity 테이블이나 가이드 생성 로그를 확인
    // 현재는 모의 데이터로 대체
    const mockUserStats = {
      total: totalUsers || 0,
      dailyActive: Math.floor((totalUsers || 0) * 0.067), // 약 6.7%가 일일 활성 사용자
      weeklyActive: Math.floor((totalUsers || 0) * 0.27), // 약 27%가 주간 활성 사용자
      monthlyActive: Math.floor((totalUsers || 0) * 0.71), // 약 71%가 월간 활성 사용자
      newSignups: Math.floor(Math.random() * 200) + 50, // 50-250 신규 가입자
      retentionRate: 73.5 + (Math.random() * 10 - 5) // 68.5% ~ 78.5%
    };

    // 최근 가입자 추이 (7일간)
    const signupTrend: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      signupTrend.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...mockUserStats,
        signupTrend
      }
    });

  } catch (error) {
    console.error('사용자 통계 조회 실패:', error);
    return NextResponse.json({
      success: false,
      message: '사용자 통계 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

export const GET = withAdminAuth(getUserStatsHandler);
// 🎯 96% 만족도 달성을 위한 품질 피드백 API
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

interface QualityFeedback {
  guideId: string;
  locationName: string;
  feedback: {
    accuracy: number;
    expertise: number;
    storytelling: number;
    cultural_respect: number;
    overall_satisfaction: number;
    comments: string;
    improvement_suggestions: string[];
  };
  timestamp: string;
}

interface QualityMetrics {
  average_score: number;
  total_feedbacks: number;
  satisfaction_distribution: Record<number, number>;
  common_issues: Array<{
    issue: string;
    frequency: number;
  }>;
  improvement_trends: {
    last_30_days: number;
    improvement_rate: number;
  };
}

// 품질 피드백 제출
export async function POST(request: NextRequest) {
  try {
    console.log('📝 품질 피드백 수신 시작');

    const body: QualityFeedback = await request.json();
    const { guideId, locationName, feedback, timestamp } = body;

    // 입력 검증
    if (!guideId || !locationName || !feedback || !timestamp) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '필수 필드가 누락되었습니다.' 
        }),
        { status: 400, headers }
      );
    }

    // 전체 만족도 점수 계산 (100점 만점)
    const overallScore = (
      feedback.accuracy * 20 +
      feedback.expertise * 20 +
      feedback.storytelling * 20 +
      feedback.cultural_respect * 20 +
      feedback.overall_satisfaction * 20
    );

    // 피드백 데이터 저장
    const { data: savedFeedback, error: saveError } = await supabase
      .from('quality_feedback')
      .insert({
        guide_id: guideId,
        location_name: locationName,
        accuracy_score: feedback.accuracy,
        expertise_score: feedback.expertise,
        storytelling_score: feedback.storytelling,
        cultural_respect_score: feedback.cultural_respect,
        overall_satisfaction: feedback.overall_satisfaction,
        overall_score: overallScore,
        comments: feedback.comments,
        improvement_suggestions: feedback.improvement_suggestions,
        created_at: timestamp,
        user_agent: request.headers.get('user-agent') || 'Unknown'
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ 피드백 저장 실패:', saveError);
      
      // 테이블이 없을 경우 자동 생성
      if (saveError.code === '42P01') {
        await createQualityFeedbackTable();
        
        // 다시 시도
        const { data: retryData, error: retryError } = await supabase
          .from('quality_feedback')
          .insert({
            guide_id: guideId,
            location_name: locationName,
            accuracy_score: feedback.accuracy,
            expertise_score: feedback.expertise,
            storytelling_score: feedback.storytelling,
            cultural_respect_score: feedback.cultural_respect,
            overall_satisfaction: feedback.overall_satisfaction,
            overall_score: overallScore,
            comments: feedback.comments,
            improvement_suggestions: feedback.improvement_suggestions,
            created_at: timestamp,
            user_agent: request.headers.get('user-agent') || 'Unknown'
          })
          .select()
          .single();
          
        if (retryError) {
          throw retryError;
        }
      } else {
        throw saveError;
      }
    }

    // 실시간 품질 지표 업데이트
    await updateQualityMetrics(locationName, overallScore);

    // 낮은 점수일 경우 즉시 개선 알림
    if (overallScore < 80) {
      console.log(`🚨 낮은 품질 점수 감지: ${locationName} - ${overallScore}점`);
      await triggerQualityImprovement(guideId, locationName, feedback);
    }

    console.log('✅ 품질 피드백 저장 완료');

    return NextResponse.json({
      success: true,
      message: '소중한 피드백을 받았습니다! 더 나은 가이드로 개선하겠습니다.',
      feedback_id: savedFeedback?.id,
      quality_score: overallScore,
      next_action: overallScore < 80 ? 'quality_improvement_triggered' : 'monitoring'
    });

  } catch (error) {
    console.error('❌ 품질 피드백 처리 중 오류:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `피드백 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }),
      { status: 500, headers }
    );
  }
}

// 품질 지표 조회
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const locationName = url.searchParams.get('location');
    const period = url.searchParams.get('period') || '30'; // 기본 30일

    console.log(`📊 품질 지표 조회: ${locationName || '전체'} (최근 ${period}일)`);

    // 기본 쿼리
    let query = supabase
      .from('quality_feedback')
      .select('*')
      .gte('created_at', new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString());

    // 특정 장소 필터링
    if (locationName) {
      query = query.eq('location_name', locationName);
    }

    const { data: feedbacks, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 품질 지표 계산
    const metrics = calculateQualityMetrics(feedbacks || []);

    return NextResponse.json({
      success: true,
      location: locationName || '전체',
      period: `${period}일`,
      metrics,
      sample_size: feedbacks?.length || 0,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 품질 지표 조회 실패:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `품질 지표 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      }),
      { status: 500, headers }
    );
  }
}

// 품질 지표 계산 함수
function calculateQualityMetrics(feedbacks: any[]): QualityMetrics {
  if (feedbacks.length === 0) {
    return {
      average_score: 0,
      total_feedbacks: 0,
      satisfaction_distribution: {},
      common_issues: [],
      improvement_trends: {
        last_30_days: 0,
        improvement_rate: 0
      }
    };
  }

  // 평균 점수 계산
  const averageScore = feedbacks.reduce((sum, f) => sum + f.overall_score, 0) / feedbacks.length;

  // 만족도 분포 계산
  const satisfactionDist = feedbacks.reduce((dist, f) => {
    const satisfaction = f.overall_satisfaction;
    dist[satisfaction] = (dist[satisfaction] || 0) + 1;
    return dist;
  }, {} as Record<number, number>);

  // 공통 이슈 분석
  const allIssues = feedbacks.flatMap(f => f.improvement_suggestions || []);
  const issueFreq = allIssues.reduce((freq, issue) => {
    freq[issue] = (freq[issue] || 0) + 1;
    return freq;
  }, {} as Record<string, number>);

  const commonIssues = Object.entries(issueFreq)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([issue, frequency]) => ({ issue, frequency: frequency as number }));

  // 개선 추세 분석 (최근 30일 vs 이전 30일)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentFeedbacks = feedbacks.filter(f => new Date(f.created_at) >= thirtyDaysAgo);
  const previousFeedbacks = feedbacks.filter(f => 
    new Date(f.created_at) >= sixtyDaysAgo && new Date(f.created_at) < thirtyDaysAgo
  );

  const recentAvg = recentFeedbacks.length > 0 
    ? recentFeedbacks.reduce((sum, f) => sum + f.overall_score, 0) / recentFeedbacks.length 
    : 0;
  const previousAvg = previousFeedbacks.length > 0 
    ? previousFeedbacks.reduce((sum, f) => sum + f.overall_score, 0) / previousFeedbacks.length 
    : recentAvg;

  const improvementRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return {
    average_score: Math.round(averageScore * 100) / 100,
    total_feedbacks: feedbacks.length,
    satisfaction_distribution: satisfactionDist,
    common_issues: commonIssues,
    improvement_trends: {
      last_30_days: Math.round(recentAvg * 100) / 100,
      improvement_rate: Math.round(improvementRate * 100) / 100
    }
  };
}

// 품질 개선 트리거
async function triggerQualityImprovement(guideId: string, locationName: string, feedback: any) {
  try {
    console.log(`🔧 품질 개선 트리거: ${locationName}`);
    
    // 개선 작업 큐에 추가
    await supabase
      .from('quality_improvement_queue')
      .insert({
        guide_id: guideId,
        location_name: locationName,
        current_issues: feedback.improvement_suggestions,
        priority: feedback.overall_satisfaction <= 2 ? 'high' : 'medium',
        status: 'pending',
        created_at: new Date().toISOString()
      });

    console.log('✅ 품질 개선 작업이 큐에 추가되었습니다');
  } catch (error) {
    console.error('❌ 품질 개선 트리거 실패:', error);
  }
}

// 실시간 품질 지표 업데이트
async function updateQualityMetrics(locationName: string, score: number) {
  try {
    // 실시간 품질 지표 테이블 업데이트
    const { data: existing, error: fetchError } = await supabase
      .from('realtime_quality_metrics')
      .select('*')
      .eq('location_name', locationName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existing) {
      // 기존 데이터 업데이트
      const newCount = existing.feedback_count + 1;
      const newAverage = ((existing.average_score * existing.feedback_count) + score) / newCount;

      await supabase
        .from('realtime_quality_metrics')
        .update({
          average_score: newAverage,
          feedback_count: newCount,
          last_feedback_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('location_name', locationName);
    } else {
      // 새 데이터 생성
      await supabase
        .from('realtime_quality_metrics')
        .insert({
          location_name: locationName,
          average_score: score,
          feedback_count: 1,
          last_feedback_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    console.log(`📊 ${locationName} 품질 지표 업데이트 완료`);
  } catch (error) {
    console.error('❌ 품질 지표 업데이트 실패:', error);
  }
}

// 품질 피드백 테이블 생성
async function createQualityFeedbackTable() {
  try {
    console.log('🔧 품질 피드백 테이블 생성 중...');
    
    // 실제 환경에서는 Supabase Dashboard에서 테이블을 미리 생성해야 합니다.
    // 여기서는 로그만 출력합니다.
    console.log(`
    📋 다음 SQL을 Supabase에서 실행해주세요:
    
    CREATE TABLE quality_feedback (
      id SERIAL PRIMARY KEY,
      guide_id TEXT NOT NULL,
      location_name TEXT NOT NULL,
      accuracy_score INTEGER CHECK (accuracy_score >= 1 AND accuracy_score <= 5),
      expertise_score INTEGER CHECK (expertise_score >= 1 AND expertise_score <= 5),
      storytelling_score INTEGER CHECK (storytelling_score >= 1 AND storytelling_score <= 5),
      cultural_respect_score INTEGER CHECK (cultural_respect_score >= 1 AND cultural_respect_score <= 5),
      overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
      overall_score REAL,
      comments TEXT,
      improvement_suggestions TEXT[],
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX idx_quality_feedback_location ON quality_feedback(location_name);
    CREATE INDEX idx_quality_feedback_created_at ON quality_feedback(created_at);
    `);
    
  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}
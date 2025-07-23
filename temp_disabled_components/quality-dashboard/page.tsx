"use client";

import { useState, useEffect } from 'react';

interface QualityMetrics {
  location: string;
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

const QualityDashboard = () => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('30');
  const [isLoading, setIsLoading] = useState(true);

  const fetchQualityMetrics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (locationFilter) params.append('location', locationFilter);
      params.append('period', periodFilter);

      const response = await fetch(`/api/quality-feedback?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
      } else {
        console.error('품질 지표 로드 실패:', data.error);
      }
    } catch (error) {
      console.error('품질 지표 요청 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQualityMetrics();
  }, [locationFilter, periodFilter]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '🎉';
    if (score >= 80) return '😊';
    if (score >= 70) return '😐';
    return '😞';
  };

  const satisfactionLabels = {
    1: '매우 불만족',
    2: '불만족',
    3: '보통',
    4: '만족',
    5: '매우 만족'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 96% 만족도 달성 품질 대시보드
          </h1>
          
          {/* 필터 */}
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                장소 필터
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="특정 장소 입력 (예: 창경궁)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                기간 설정
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">최근 7일</option>
                <option value="30">최근 30일</option>
                <option value="90">최근 90일</option>
                <option value="365">최근 1년</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchQualityMetrics}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {metrics ? (
          <>
            {/* 메인 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* 전체 만족도 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 만족도</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.average_score.toFixed(1)}점
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${getScoreColor(metrics.average_score)}`}>
                    {getScoreIcon(metrics.average_score)}
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(metrics.average_score)}`}>
                    목표: 96점 {metrics.average_score >= 96 ? '✅' : `(${(96 - metrics.average_score).toFixed(1)}점 부족)`}
                  </div>
                </div>
              </div>

              {/* 총 피드백 수 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">총 피드백 수</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.total_feedbacks}개
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                    📊
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  최근 {periodFilter}일간 수집된 피드백
                </p>
              </div>

              {/* 개선률 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">개선률</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.improvement_trends.improvement_rate > 0 ? '+' : ''}{metrics.improvement_trends.improvement_rate.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    metrics.improvement_trends.improvement_rate > 0 ? 'bg-green-100' : 
                    metrics.improvement_trends.improvement_rate < 0 ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {metrics.improvement_trends.improvement_rate > 0 ? '📈' : 
                     metrics.improvement_trends.improvement_rate < 0 ? '📉' : '➡️'}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  지난 달 대비 품질 개선도
                </p>
              </div>

              {/* 최근 30일 평균 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">최근 30일 평균</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {metrics.improvement_trends.last_30_days.toFixed(1)}점
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                    📅
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  최신 품질 트렌드 반영
                </p>
              </div>
            </div>

            {/* 상세 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 만족도 분포 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">만족도 분포</h3>
                <div className="space-y-3">
                  {Object.entries(satisfactionLabels).reverse().map(([score, label]) => {
                    const count = metrics.satisfaction_distribution[parseInt(score)] || 0;
                    const percentage = metrics.total_feedbacks > 0 ? (count / metrics.total_feedbacks) * 100 : 0;
                    
                    return (
                      <div key={score} className="flex items-center">
                        <div className="w-24 text-sm text-gray-600">
                          {score}점 ({label})
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                parseInt(score) >= 4 ? 'bg-green-500' :
                                parseInt(score) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm font-medium text-gray-900">
                          {count}명 ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 주요 개선 이슈 */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 개선 요청</h3>
                {metrics.common_issues.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.common_issues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{issue.issue}</p>
                          <p className="text-xs text-gray-500">
                            {((issue.frequency / metrics.total_feedbacks) * 100).toFixed(1)}%의 사용자가 언급
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {issue.frequency}건
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    개선 요청이 없습니다! 🎉
                  </p>
                )}
              </div>
            </div>

            {/* 96% 목표 달성 현황 */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 96% 목표 달성 현황</h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">현재 점수: {metrics.average_score.toFixed(1)}점</span>
                  <span className="text-sm font-medium text-gray-600">목표: 96점</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      metrics.average_score >= 96 ? 'bg-green-500' : 
                      metrics.average_score >= 90 ? 'bg-blue-500' : 
                      metrics.average_score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((metrics.average_score / 96) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500">
                    {((metrics.average_score / 96) * 100).toFixed(1)}% 달성
                  </span>
                </div>
              </div>

              {metrics.average_score >= 96 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">🎉</div>
                    <div>
                      <h4 className="font-semibold text-green-800">목표 달성!</h4>
                      <p className="text-sm text-green-600">
                        축하합니다! 96% 만족도 목표를 달성했습니다.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">💪</div>
                    <div>
                      <h4 className="font-semibold text-blue-800">목표까지 {(96 - metrics.average_score).toFixed(1)}점</h4>
                      <p className="text-sm text-blue-600">
                        주요 개선 포인트를 집중 개선하여 목표를 달성해보세요!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">데이터 없음</h3>
            <p className="text-gray-600">
              아직 품질 피드백이 없습니다. 가이드를 사용한 후 피드백을 남겨주세요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityDashboard;
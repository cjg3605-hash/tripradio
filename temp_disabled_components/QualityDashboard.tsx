// 🎯 실시간 품질 모니터링 대시보드
// Phase 1 Task 2.2: 품질 지표 실시간 모니터링 및 알림

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { qualityValidationPipeline, QualityValidationResult } from '@/lib/quality/quality-pipeline';
import { VALIDATION_STEPS_CONFIG, ValidationStepsManager } from '@/lib/quality/validation-steps';

interface QualityMetrics {
  overallScore: number;
  stepScores: Record<number, number>;
  processingTime: number;
  passRate: number;
  totalValidations: number;
  successfulValidations: number;
  lastValidation: Date;
  trends: QualityTrend[];
}

interface QualityTrend {
  timestamp: number;
  score: number;
  stepScores: Record<number, number>;
}

interface QualityAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  metric: string;
  currentValue: number;
  threshold: number;
  suggested_action?: string;
}

interface DashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  showDetailedMetrics?: boolean;
}

/**
 * 🎯 실시간 품질 모니터링 대시보드 컴포넌트
 */
export default function QualityDashboard({ 
  autoRefresh = true, 
  refreshInterval = 30000, // 30초
  showDetailedMetrics = true 
}: DashboardProps) {
  
  // 상태 관리
  const [metrics, setMetrics] = useState<QualityMetrics>({
    overallScore: 0,
    stepScores: {},
    processingTime: 0,
    passRate: 0,
    totalValidations: 0,
    successfulValidations: 0,
    lastValidation: new Date(),
    trends: []
  });

  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');

  /**
   * 📊 품질 메트릭 데이터 로드
   */
  const loadQualityMetrics = useCallback(async () => {
    try {
      setIsLoading(true);

      // 시뮬레이션 데이터 생성 (실제로는 API 호출)
      const mockMetrics = await generateMockQualityData();
      
      setMetrics(mockMetrics);
      
      // 경고 상황 체크
      const newAlerts = checkQualityAlerts(mockMetrics);
      setAlerts(prev => [...prev.slice(-20), ...newAlerts]); // 최대 20개 알림 유지
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ 품질 메트릭 로드 실패:', error);
      
      // 오류 알림 추가
      setAlerts(prev => [...prev, {
        id: `error_${Date.now()}`,
        level: 'error',
        message: '품질 메트릭 데이터 로드에 실패했습니다',
        timestamp: Date.now(),
        metric: 'system_error',
        currentValue: 0,
        threshold: 1,
        suggested_action: '시스템 관리자에게 문의하세요'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🔔 품질 경고 체크
   */
  const checkQualityAlerts = (metrics: QualityMetrics): QualityAlert[] => {
    const newAlerts: QualityAlert[] = [];
    const now = Date.now();

    // 전체 품질 점수 경고
    if (metrics.overallScore < 85) {
      newAlerts.push({
        id: `overall_quality_${now}`,
        level: metrics.overallScore < 75 ? 'critical' : 'warning',
        message: `전체 품질 점수가 낮습니다: ${metrics.overallScore.toFixed(1)}%`,
        timestamp: now,
        metric: 'overall_score',
        currentValue: metrics.overallScore,
        threshold: 85,
        suggested_action: '품질 개선 알고리즘 점검 필요'
      });
    }

    // 통과율 경고
    if (metrics.passRate < 95) {
      newAlerts.push({
        id: `pass_rate_${now}`,
        level: metrics.passRate < 90 ? 'error' : 'warning',
        message: `품질 통과율이 낮습니다: ${metrics.passRate.toFixed(1)}%`,
        timestamp: now,
        metric: 'pass_rate',
        currentValue: metrics.passRate,
        threshold: 95,
        suggested_action: '품질 임계값 조정 또는 알고리즘 개선 검토'
      });
    }

    // 처리 시간 경고 (2초 초과)
    if (metrics.processingTime > 2000) {
      newAlerts.push({
        id: `processing_time_${now}`,
        level: metrics.processingTime > 5000 ? 'error' : 'warning',
        message: `처리 시간이 길어지고 있습니다: ${(metrics.processingTime / 1000).toFixed(1)}초`,
        timestamp: now,
        metric: 'processing_time',
        currentValue: metrics.processingTime,
        threshold: 2000,
        suggested_action: '캐시 최적화 또는 서버 성능 점검'
      });
    }

    // 단계별 품질 점수 경고
    VALIDATION_STEPS_CONFIG.forEach(stepConfig => {
      const stepScore = metrics.stepScores[stepConfig.stepNumber];
      if (stepScore && stepScore < stepConfig.threshold) {
        newAlerts.push({
          id: `step${stepConfig.stepNumber}_${now}`,
          level: stepScore < (stepConfig.threshold - 15) ? 'error' : 'warning',
          message: `${stepConfig.name} 품질이 낮습니다: ${stepScore.toFixed(1)}%`,
          timestamp: now,
          metric: `step_${stepConfig.stepNumber}`,
          currentValue: stepScore,
          threshold: stepConfig.threshold,
          suggested_action: `${stepConfig.name} 알고리즘 점검 필요`
        });
      }
    });

    return newAlerts;
  };

  /**
   * 🎨 시뮬레이션 데이터 생성 (실제로는 API에서 가져옴)
   */
  const generateMockQualityData = async (): Promise<QualityMetrics> => {
    // 기본 품질 점수 (96.3% 기준으로 약간의 변동)
    const baseScore = 96.3;
    const variance = (Math.random() - 0.5) * 4; // ±2점 변동
    const overallScore = Math.max(85, Math.min(100, baseScore + variance));

    // 단계별 점수 생성 (가중치 고려)
    const stepScores: Record<number, number> = {};
    VALIDATION_STEPS_CONFIG.forEach(stepConfig => {
      const stepVariance = (Math.random() - 0.5) * 8; // ±4점 변동
      stepScores[stepConfig.stepNumber] = Math.max(
        70, 
        Math.min(100, stepConfig.threshold + stepVariance)
      );
    });

    // 처리 시간 시뮬레이션 (1.8초 기준)
    const baseProcessingTime = 1800;
    const timeVariance = (Math.random() - 0.5) * 800; // ±400ms 변동
    const processingTime = Math.max(500, baseProcessingTime + timeVariance);

    // 통과율 계산 (전체 점수 기반)
    const passRate = Math.min(100, (overallScore - 70) * 3.33); // 70점 이상부터 통과율 계산

    // 총 검증 수 및 성공 수 시뮬레이션
    const totalValidations = Math.floor(Math.random() * 1000) + 5000;
    const successfulValidations = Math.floor(totalValidations * (passRate / 100));

    // 트렌드 데이터 생성 (최근 24시간)
    const trends: QualityTrend[] = [];
    const now = Date.now();
    const hoursToShow = selectedTimeRange === '1h' ? 1 : selectedTimeRange === '6h' ? 6 : selectedTimeRange === '24h' ? 24 : 168;
    
    for (let i = hoursToShow; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000);
      const trendVariance = (Math.random() - 0.5) * 6;
      const trendScore = Math.max(85, Math.min(100, baseScore + trendVariance));
      
      const trendStepScores: Record<number, number> = {};
      VALIDATION_STEPS_CONFIG.forEach(stepConfig => {
        const stepTrendVariance = (Math.random() - 0.5) * 10;
        trendStepScores[stepConfig.stepNumber] = Math.max(
          70,
          Math.min(100, stepConfig.threshold + stepTrendVariance)
        );
      });

      trends.push({
        timestamp,
        score: trendScore,
        stepScores: trendStepScores
      });
    }

    return {
      overallScore,
      stepScores,
      processingTime,
      passRate,
      totalValidations,
      successfulValidations,
      lastValidation: new Date(),
      trends
    };
  };

  /**
   * 🎨 점수에 따른 색상 반환
   */
  const getScoreColor = (score: number): string => {
    if (score >= 95) return 'text-green-600 bg-green-50';
    if (score >= 90) return 'text-blue-600 bg-blue-50';
    if (score >= 85) return 'text-yellow-600 bg-yellow-50';
    if (score >= 75) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  /**
   * 🎨 알림 레벨에 따른 스타일 반환
   */
  const getAlertStyle = (level: QualityAlert['level']): string => {
    switch (level) {
      case 'critical': return 'border-l-4 border-red-500 bg-red-50 text-red-700';
      case 'error': return 'border-l-4 border-orange-500 bg-orange-50 text-orange-700';
      case 'warning': return 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-700';
      default: return 'border-l-4 border-blue-500 bg-blue-50 text-blue-700';
    }
  };

  /**
   * 📅 시간 범위 선택 핸들러
   */
  const handleTimeRangeChange = (range: '1h' | '6h' | '24h' | '7d') => {
    setSelectedTimeRange(range);
    loadQualityMetrics(); // 새로운 시간 범위로 데이터 다시 로드
  };

  // 자동 새로고침 설정
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (autoRefresh) {
      intervalId = setInterval(loadQualityMetrics, refreshInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval, loadQualityMetrics]);

  // 초기 데이터 로드
  useEffect(() => {
    loadQualityMetrics();
  }, [loadQualityMetrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">품질 데이터 로드 중...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎯 품질 모니터링 대시보드</h1>
            <p className="text-gray-600">실시간 품질 지표 및 8단계 검증 시스템 모니터링</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* 시간 범위 선택 */}
            <div className="flex border rounded-lg overflow-hidden">
              {(['1h', '6h', '24h', '7d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`px-3 py-1 text-sm ${
                    selectedTimeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button
              onClick={loadQualityMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              🔄 새로고침
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          마지막 업데이트: {lastUpdated.toLocaleString()}
        </p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 전체 품질 점수 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">전체 품질 점수</h3>
            <div className="text-2xl">🎯</div>
          </div>
          <div className={`mt-2 text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
            {metrics.overallScore.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600 mt-1">
            목표: 98% 이상 (현재 {metrics.overallScore >= 98 ? '✅ 달성' : '🔴 미달성'})
          </p>
        </div>

        {/* 품질 통과율 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">품질 통과율</h3>
            <div className="text-2xl">✅</div>
          </div>
          <div className={`mt-2 text-3xl font-bold ${getScoreColor(metrics.passRate)}`}>
            {metrics.passRate.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {metrics.successfulValidations.toLocaleString()} / {metrics.totalValidations.toLocaleString()} 건 통과
          </p>
        </div>

        {/* 처리 시간 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">평균 처리 시간</h3>
            <div className="text-2xl">⚡</div>
          </div>
          <div className={`mt-2 text-3xl font-bold ${
            metrics.processingTime <= 2000 ? 'text-green-600' : 
            metrics.processingTime <= 3000 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {(metrics.processingTime / 1000).toFixed(1)}초
          </div>
          <p className="text-sm text-gray-600 mt-1">
            목표: 2초 이하 ({metrics.processingTime <= 2000 ? '✅ 달성' : '🔴 초과'})
          </p>
        </div>

        {/* 활성 알림 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">활성 알림</h3>
            <div className="text-2xl">🔔</div>
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {alerts.filter(a => Date.now() - a.timestamp < 3600000).length}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            최근 1시간 내 알림 ({alerts.filter(a => a.level === 'critical').length}개 긴급)
          </p>
        </div>
      </div>

      {/* 8단계 품질 검증 상세 */}
      {showDetailedMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 단계별 품질 점수 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 8단계 검증 상세</h3>
            <div className="space-y-3">
              {VALIDATION_STEPS_CONFIG.map(stepConfig => {
                const stepScore = metrics.stepScores[stepConfig.stepNumber] || 0;
                const percentage = Math.max(0, Math.min(100, stepScore));
                
                return (
                  <div key={stepConfig.stepNumber} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Step {stepConfig.stepNumber}: {stepConfig.name}
                      </span>
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${getScoreColor(stepScore)}`}>
                        {stepScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stepScore >= stepConfig.threshold ? 'bg-green-500' :
                          stepScore >= stepConfig.threshold - 10 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>가중치: {(stepConfig.weight * 100).toFixed(1)}%</span>
                      <span>임계값: {stepConfig.threshold}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 품질 트렌드 차트 (간단한 텍스트 버전) */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 품질 트렌드</h3>
            <div className="space-y-2">
              {metrics.trends.slice(-10).map((trend, index) => {
                const time = new Date(trend.timestamp).toLocaleTimeString();
                const isUp = index > 0 && trend.score > metrics.trends[metrics.trends.length - 10 + index - 1]?.score;
                const isDown = index > 0 && trend.score < metrics.trends[metrics.trends.length - 10 + index - 1]?.score;
                
                return (
                  <div key={trend.timestamp} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">{time}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getScoreColor(trend.score).split(' ')[0]}`}>
                        {trend.score.toFixed(1)}%
                      </span>
                      <span className="text-xs">
                        {index > 0 && (
                          isUp ? '📈' : isDown ? '📉' : '➡️'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 알림 패널 */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 최근 알림</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.slice(-10).reverse().map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg ${getAlertStyle(alert.level)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm uppercase tracking-wide">
                        {alert.level}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 font-medium">{alert.message}</p>
                    {alert.suggested_action && (
                      <p className="mt-2 text-sm opacity-90">
                        💡 권장사항: {alert.suggested_action}
                      </p>
                    )}
                    <div className="mt-2 text-xs">
                      현재값: {alert.currentValue} / 임계값: {alert.threshold}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 시스템 상태 */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 시스템 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <div className="text-sm font-medium text-gray-700">품질 파이프라인</div>
            <div className="text-xs text-gray-500">정상 동작</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <div className="text-sm font-medium text-gray-700">자동 수정 시스템</div>
            <div className="text-xs text-gray-500">활성화</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <div className="text-sm font-medium text-gray-700">실시간 모니터링</div>
            <div className="text-xs text-gray-500">{refreshInterval / 1000}초마다 업데이트</div>
          </div>
        </div>
      </div>
    </div>
  );
}
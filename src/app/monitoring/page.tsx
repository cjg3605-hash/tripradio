'use client';

import { useState, useEffect } from 'react';

interface Metric {
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  totalCalls: number;
  errorRate: number;
  successRate: number;
  totalErrors: number;
  lastCall: string | null;
  minutesSinceLastCall: number | null;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  summary: {
    totalOperations: number;
    healthyOperations: number;
    totalCalls: number;
    totalErrors: number;
    overallErrorRate: number;
  };
}

interface MonitoringData {
  timestamp: string;
  health: HealthStatus;
  metrics: Record<string, Metric>;
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/metrics?detailed=true');
      if (!response.ok) throw new Error('메트릭 조회 실패');
      
      const newData = await response.json();
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const clearMetrics = async () => {
    if (!confirm('모든 메트릭을 초기화하시겠습니까?')) return;
    
    try {
      const response = await fetch('/api/monitoring/metrics', { method: 'DELETE' });
      if (!response.ok) throw new Error('메트릭 초기화 실패');
      
      await fetchMetrics();
      alert('메트릭이 초기화되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '초기화에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchMetrics, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">메트릭을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl">❌ 오류 발생</p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">🏁 가이드AI 성능 모니터링</h1>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                자동 갱신 (10초)
              </label>
              <button
                onClick={fetchMetrics}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 새로고침
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={clearMetrics}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🗑️ 초기화
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            마지막 업데이트: {data ? new Date(data.timestamp).toLocaleString('ko-KR') : 'N/A'}
          </p>
        </div>

        {data && (
          <>
            {/* 전체 상태 */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">전체 시스템 상태</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.health.status)}`}>
                  {getStatusIcon(data.health.status)} {data.health.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{data.health.summary.totalOperations}</p>
                  <p className="text-sm text-gray-600">총 작업 수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{data.health.summary.healthyOperations}</p>
                  <p className="text-sm text-gray-600">정상 작업</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{data.health.summary.totalCalls.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">총 호출 수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{data.health.summary.totalErrors.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">총 오류 수</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{data.health.summary.overallErrorRate}%</p>
                  <p className="text-sm text-gray-600">전체 오류율</p>
                </div>
              </div>

              {data.health.issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">🚨 발견된 문제점</h3>
                  <ul className="list-disc list-inside text-red-700">
                    {data.health.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 개별 메트릭 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(data.metrics).map(([name, metric]) => (
                <div key={name} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {name.replace(/-/g, ' ')}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">평균 응답시간</p>
                      <p className="text-lg font-bold text-blue-600">{metric.avgResponseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">성공률</p>
                      <p className="text-lg font-bold text-green-600">{metric.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">총 호출</p>
                      <p className="text-lg font-bold text-purple-600">{metric.totalCalls.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">오류율</p>
                      <p className={`text-lg font-bold ${metric.errorRate > 20 ? 'text-red-600' : metric.errorRate > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {metric.errorRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">최소/최대</p>
                      <p className="text-sm text-gray-800">{metric.minResponseTime}ms / {metric.maxResponseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">마지막 호출</p>
                      <p className="text-sm text-gray-800">
                        {metric.minutesSinceLastCall !== null 
                          ? `${metric.minutesSinceLastCall}분 전`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* 성능 인디케이터 */}
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.avgResponseTime > 30000 ? 'bg-red-500' :
                        metric.avgResponseTime > 15000 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (metric.avgResponseTime / 30000) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
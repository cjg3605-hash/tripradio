'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface MigrationStats {
  processed: number;
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

interface ProgressData {
  total: number;
  migrated: number;
  remaining: number;
  progress: string;
  isCompleted: boolean;
}

export default function CoordinatesMigrationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<MigrationStats | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(5);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');

  // 진행 상황 조회
  const fetchProgress = useCallback(async () => {
    try {
      const url = locationFilter 
        ? `/api/coordinates/migrate?location=${encodeURIComponent(locationFilter)}`
        : '/api/coordinates/migrate';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setProgress(result.data);
      }
    } catch (error) {
      console.error('진행 상황 조회 실패:', error);
    }
  }, [locationFilter]);

  // 페이지 로드 시 진행 상황 조회
  useEffect(() => {
    fetchProgress();
  }, [locationFilter, fetchProgress]);

  // 마이그레이션 실행
  const runMigration = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setStats(null);
    setLogs([]);

    try {
      let offset = 0;
      let hasMore = true;
      let totalStats: MigrationStats = {
        processed: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      };

      while (hasMore && isRunning) {
        const logMessage = `🚀 배치 실행 중: ${offset + 1}~${offset + batchSize}`;
        setLogs(prev => [...prev, logMessage]);

        const response = await fetch('/api/coordinates/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            limit: batchSize,
            offset: offset,
            forceUpdate: forceUpdate,
            locationFilter: locationFilter || null
          })
        });

        const result = await response.json();

        if (result.success) {
          const batchStats = result.stats;
          
          // 통계 누적
          totalStats.processed += batchStats.processed;
          totalStats.success += batchStats.success;
          totalStats.failed += batchStats.failed;
          totalStats.skipped += batchStats.skipped;
          totalStats.errors.push(...batchStats.errors);

          const batchLog = `✅ 배치 완료: 처리 ${batchStats.processed}, 성공 ${batchStats.success}, 실패 ${batchStats.failed}, 스킵 ${batchStats.skipped}`;
          setLogs(prev => [...prev, batchLog]);
          
          setStats(totalStats);
          
          // 더 많은 데이터가 있는지 확인
          hasMore = result.hasMore;
          offset += batchSize;
          
          // 진행 상황 새로고침
          await fetchProgress();
          
        } else {
          const errorLog = `❌ 배치 실패: ${result.error}`;
          setLogs(prev => [...prev, errorLog]);
          break;
        }
      }

      if (!hasMore) {
        setLogs(prev => [...prev, '🎉 모든 마이그레이션 완료!']);
      }

    } catch (error) {
      const errorLog = `❌ 마이그레이션 실행 실패: ${error}`;
      setLogs(prev => [...prev, errorLog]);
      console.error('마이그레이션 실행 실패:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // 마이그레이션 중단
  const stopMigration = () => {
    setIsRunning(false);
    setLogs(prev => [...prev, '⏹️ 마이그레이션 중단됨']);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🗺️ 좌표 마이그레이션 도구
        </h1>

        {/* 진행 상황 카드 */}
        {progress && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 진행 상황</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progress.total}</div>
                <div className="text-sm text-gray-600">전체 가이드</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.migrated}</div>
                <div className="text-sm text-gray-600">완료</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{progress.remaining}</div>
                <div className="text-sm text-gray-600">남은 개수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{progress.progress}</div>
                <div className="text-sm text-gray-600">진행률</div>
              </div>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: progress.progress }}
              />
            </div>
            
            {progress.isCompleted && (
              <div className="text-green-600 font-semibold text-center">
                🎉 모든 마이그레이션 완료!
              </div>
            )}
          </div>
        )}

        {/* 설정 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">⚙️ 마이그레이션 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                배치 크기
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRunning}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치 필터 (선택사항)
              </label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="예: 경복궁"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRunning}
              />
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={forceUpdate}
                  onChange={(e) => setForceUpdate(e.target.checked)}
                  className="mr-2"
                  disabled={isRunning}
                />
                <span className="text-sm text-gray-700">강제 업데이트</span>
              </label>
            </div>
          </div>

          {/* 실행 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={runMigration}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isRunning
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? '🔄 실행 중...' : '🚀 마이그레이션 시작'}
            </button>

            <button
              onClick={stopMigration}
              disabled={!isRunning}
              className={`px-6 py-2 rounded-lg font-semibold ${
                !isRunning
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              ⏹️ 중단
            </button>

            <button
              onClick={fetchProgress}
              disabled={isRunning}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-400"
            >
              🔄 새로고침
            </button>
          </div>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 실행 통계</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{stats.processed}</div>
                <div className="text-sm text-gray-600">처리됨</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                <div className="text-sm text-gray-600">성공</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">실패</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.skipped}</div>
                <div className="text-sm text-gray-600">스킵</div>
              </div>
            </div>

            {/* 에러 목록 */}
            {stats.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-red-600 mb-2">❌ 에러 목록</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {stats.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 로그 카드 */}
        {logs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 실행 로그</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  [{new Date().toLocaleTimeString()}] {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
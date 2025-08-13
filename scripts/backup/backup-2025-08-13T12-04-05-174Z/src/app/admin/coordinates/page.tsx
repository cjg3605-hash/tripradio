'use client';

import { useState, useEffect, useCallback } from 'react';
import { CoordinateStats, CoordinateCandidateInfo, CoordinateRegenerationResponse } from '@/types/guide';

interface StatsResponse {
  success: boolean;
  stats: CoordinateStats;
  error?: string;
  details?: {
    byStatus: Record<string, CoordinateCandidateInfo[]>;
    recentlyValidated: CoordinateCandidateInfo[];
    highestAccuracy: CoordinateCandidateInfo[];
    lowestAccuracy: CoordinateCandidateInfo[];
  };
}

export default function CoordinateManagementPage() {
  const [stats, setStats] = useState<CoordinateStats | null>(null);
  const [candidates, setCandidates] = useState<CoordinateCandidateInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState('');
  const [minAccuracy, setMinAccuracy] = useState(0.9); // 실용적 정확도 기준
  const [message, setMessage] = useState('');

  // 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedGuideId 
        ? `/api/coordinates/stats?guideId=${selectedGuideId}&includeDetails=true`
        : '/api/coordinates/stats?includeDetails=true';
      
      const response = await fetch(url);
      const data: StatsResponse = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setMessage(`통계 조회 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      setMessage(`통계 조회 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedGuideId]);

  // 재생성 대상 조회
  const fetchCandidates = useCallback(async () => {
    try {
      const url = selectedGuideId
        ? `/api/coordinates/regenerate?guideId=${selectedGuideId}&minAccuracy=${minAccuracy}`
        : `/api/coordinates/regenerate?minAccuracy=${minAccuracy}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCandidates(data.candidates || []);
      } else {
        setMessage(`재생성 대상 조회 실패: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      setMessage(`재생성 대상 조회 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }, [selectedGuideId, minAccuracy]);

  // 좌표 재생성 실행
  const regenerateCoordinates = async () => {
    try {
      setRegenerating(true);
      const response = await fetch('/api/coordinates/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideId: selectedGuideId || undefined,
          minAccuracy,
          maxAttempts: 3
        })
      });

      const data: CoordinateRegenerationResponse = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.regeneratedCount}개 챕터의 좌표를 성공적으로 재생성했습니다.`);
        await fetchStats();
        await fetchCandidates();
      } else {
        setMessage(`❌ 재생성 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      setMessage(`❌ 재생성 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCandidates();
  }, [selectedGuideId, minAccuracy, fetchStats, fetchCandidates]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">좌표 관리 시스템</h1>
      
      {/* 컨트롤 패널 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">컨트롤 패널</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">가이드 ID (선택사항)</label>
            <input
              type="text"
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(e.target.value)}
              placeholder="특정 가이드만 관리"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">최소 정확도</label>
            <select
              value={minAccuracy}
              onChange={(e) => setMinAccuracy(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={0.9}>90% 이상</option>
              <option value={0.8}>80% 이상</option>
              <option value={0.7}>70% 이상</option>
              <option value={0.6}>60% 이상</option>
              <option value={0.5}>50% 이상</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={regenerateCoordinates}
              disabled={regenerating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {regenerating ? '재생성 중...' : '좌표 재생성'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>

      {/* 통계 대시보드 */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">좌표 통계</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalChapters}</div>
              <div className="text-sm text-gray-600">전체 챕터</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.withCoordinates}</div>
              <div className="text-sm text-gray-600">좌표 보유</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.highAccuracy}</div>
              <div className="text-sm text-gray-600">고정확도 (≥80%)</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.needsRegeneration}</div>
              <div className="text-sm text-gray-600">재생성 필요</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">평균 정확도:</span>
              <span className="text-lg font-bold">{(stats.averageAccuracy * 100).toFixed(1)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${stats.averageAccuracy * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 재생성 대상 목록 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          재생성 대상 챕터 ({candidates.length}개)
        </h2>
        
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            재생성이 필요한 챕터가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">챕터</th>
                  <th className="px-4 py-2 text-left">제목</th>
                  <th className="px-4 py-2 text-left">현재 좌표</th>
                  <th className="px-4 py-2 text-left">정확도</th>
                  <th className="px-4 py-2 text-left">시도 횟수</th>
                  <th className="px-4 py-2 text-left">상태</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-t">
                    <td className="px-4 py-2">{candidate.chapterIndex}</td>
                    <td className="px-4 py-2 font-medium">{candidate.title}</td>
                    <td className="px-4 py-2 text-sm">
                      {candidate.latitude && candidate.longitude
                        ? `${candidate.latitude.toFixed(6)}, ${candidate.longitude.toFixed(6)}`
                        : '좌표 없음'
                      }
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        (candidate.coordinateAccuracy || 0) >= 0.8 
                          ? 'bg-green-100 text-green-800'
                          : (candidate.coordinateAccuracy || 0) >= 0.5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {candidate.coordinateAccuracy 
                          ? `${(candidate.coordinateAccuracy * 100).toFixed(1)}%`
                          : '미측정'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-2">{candidate.regenerationAttempts || 0}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        candidate.validationStatus === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : candidate.validationStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.validationStatus || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
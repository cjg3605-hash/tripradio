'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/guide';

interface FactVerificationResponse {
  success: boolean;
  data: any;
  location: string;
  language: string;
  dataIntegration: {
    hasIntegratedData: boolean;
    sources: string[];
    confidence: number;
    verificationStatus: any;
    dataQuality: number;
    errors?: string[];
  };
  factVerification: {
    isFactVerified: boolean;
    confidenceScore: number;
    dataSourceCount: number;
    verificationMethod: string;
  };
}

export default function TestFactVerificationPage() {
  const [location, setLocation] = useState('경복궁');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userProfile] = useState<UserProfile>({
    interests: ['문화', '역사'],
    ageGroup: '30대',
    knowledgeLevel: '중급',
    companions: 'solo',
    tourDuration: 90,
    preferredStyle: '친근함',
    language: 'ko'
  });

  const testLocations = [
    '경복궁',
    '에펠탑',
    '타지마할',
    '콜로세움',
    '자유의 여신상',
    '마추픽추',
    '판교 아브뉴프랑',
    '강남역',
    '부산 해운대'
  ];

  const handleGenerateGuide = async () => {
    if (!location.trim()) {
      setError('위치를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 사실 검증된 가이드 생성 요청:', location);
      
      const response = await fetch('/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          userProfile
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success) {
        setResult(data);
        console.log('✅ 가이드 생성 성공:', data);
      } else {
        throw new Error(data.error || '가이드 생성에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('❌ 가이드 생성 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 사실 검증된 가이드 생성 테스트
          </h1>
          <p className="text-gray-600">
            다중 데이터 소스(UNESCO, Wikidata, Government, Google Places)를 통합하여 
            사실 기반으로 검증된 고품질 여행 가이드를 생성합니다.
          </p>
        </div>

        {/* 입력 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📍 위치 입력</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              여행지 이름
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 경복궁, 에펠탑, 타지마할..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">빠른 테스트용 위치들:</p>
            <div className="flex flex-wrap gap-2">
              {testLocations.map((testLocation) => (
                <button
                  key={testLocation}
                  onClick={() => setLocation(testLocation)}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 disabled:opacity-50"
                >
                  {testLocation}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateGuide}
            disabled={loading || !location.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                사실 검증된 가이드 생성 중...
              </div>
            ) : (
              '🚀 사실 검증된 가이드 생성하기'
            )}
          </button>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="text-red-400">
                ❌
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {result && (
          <div className="space-y-6">
            {/* 사실 검증 상태 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🔍 사실 검증 결과</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">검증 상태</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.factVerification.isFactVerified ? '✅ 검증됨' : '⚠️ 부분 검증'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">신뢰도 점수</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {(result.factVerification.confidenceScore * 100).toFixed(1)}%
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900">데이터 소스</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {result.factVerification.dataSourceCount}개
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-900">데이터 품질</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {(result.dataIntegration.dataQuality * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* 사용된 데이터 소스 */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">📊 사용된 데이터 소스</h3>
                <div className="flex flex-wrap gap-2">
                  {result.dataIntegration.sources.map((source: string) => (
                    <span
                      key={source}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              {/* 검증 방법 */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🔬 검증 방법</h3>
                <p className="text-gray-600">
                  {result.factVerification.verificationMethod === 'multi_source_cross_reference' 
                    ? '다중 소스 교차 검증' 
                    : result.factVerification.verificationMethod}
                </p>
              </div>

              {/* 에러가 있는 경우 표시 */}
              {result.dataIntegration.errors && result.dataIntegration.errors.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">⚠️ 데이터 수집 중 발생한 문제</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {result.dataIntegration.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 생성된 가이드 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">📖 생성된 가이드</h2>
              
              {result.data && (
                <div className="space-y-6">
                  {/* 개요 */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">개요</h3>
                    <p className="text-gray-700 leading-relaxed">{result.data.overview}</p>
                  </div>

                  {/* 하이라이트 */}
                  {result.data.highlights && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">주요 특징</h3>
                      <ul className="space-y-1">
                        {result.data.highlights.map((highlight: string, index: number) => (
                          <li key={index} className="text-gray-700">• {highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 방문 경로 */}
                  {result.data.visitRoute && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">방문 경로</h3>
                      <p className="text-gray-600 mb-2">
                        총 소요시간: {result.data.visitRoute.totalDuration}분
                      </p>
                      <p className="text-gray-700 mb-3">{result.data.visitRoute.description}</p>
                      
                      {result.data.visitRoute.steps && (
                        <div className="space-y-2">
                          {result.data.visitRoute.steps.map((step: any, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {step.order}
                              </span>
                              <div>
                                <h4 className="font-medium text-gray-900">{step.location}</h4>
                                <p className="text-sm text-gray-600">{step.duration} • {step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 개인화 메시지 */}
                  {result.data.personalizedNote && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">💝 개인화 메시지</h3>
                      <p className="text-blue-800">{result.data.personalizedNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 기술적 세부사항 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔧 기술적 세부사항</h2>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
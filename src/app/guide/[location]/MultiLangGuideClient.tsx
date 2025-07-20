"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GuideData } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';
import MinimalTourContent from './tour/components/TourContent';
import { guideHistory } from '@/lib/cache/localStorage';
import { saveGuideHistoryToSupabase } from '@/lib/supabaseGuideHistory';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/guide';
import { MultiLangGuideManager } from '@/lib/multilang-guide-manager';
import { safeUserProfile } from '@/lib/utils';

interface Props {
  locationName: string;
  initialGuide?: any;
}

// 가이드 데이터 정규화 함수
const normalizeGuideData = (data: any, locationName: string): GuideData => {
  if (!data) {
    throw new Error('가이드 데이터가 없습니다.');
  }

  // 기본 구조 확인 및 생성
  const normalizedData: GuideData = {
    overview: {
      title: data.overview?.title || data.title || locationName,
      summary: data.overview?.summary || data.summary,
      narrativeTheme: data.overview?.narrativeTheme,
      keyFacts: data.overview?.keyFacts || [],
      visitingTips: data.overview?.visitingTips,
      historicalBackground: data.overview?.historicalBackground,
      visitInfo: data.overview?.visitInfo
    },
    route: {
      steps: data.route?.steps || data.steps || []
    },
    realTimeGuide: {
      chapters: data.realTimeGuide?.chapters || data.chapters || [],
      ...data.realTimeGuide
    },
    metadata: {
      originalLocationName: locationName,
      generatedAt: data.metadata?.generatedAt || new Date().toISOString(),
      version: data.metadata?.version || '1.0',
      language: data.metadata?.language || 'ko',
      ...data.metadata
    }
  };

  // 챕터 ID 정규화
  if (normalizedData.realTimeGuide?.chapters) {
    normalizedData.realTimeGuide.chapters = normalizedData.realTimeGuide.chapters.map((chapter, index) => ({
      ...chapter,
      id: chapter.id !== undefined ? chapter.id : index
    }));
  }

  return normalizedData;
};

export default function MultiLangGuideClient({ locationName, initialGuide }: Props) {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const sessionResult = useSession();
  const session = sessionResult?.data;

  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'cache' | 'generated' | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 히스토리 저장 함수
  const saveToHistory = async (guideData: GuideData) => {
    try {
      // 로컬 히스토리 저장 (userProfile 매개변수 확인 필요)
      guideHistory.saveGuide(
        guideData.metadata.originalLocationName,
        guideData
      );

      // 로그인한 사용자의 경우 Supabase에도 저장
      if (session?.user) {
        const userProfile: UserProfile = safeUserProfile({
          preferredLanguage: currentLanguage,
          interests: ['여행', '문화'],
          travelStyle: 'cultural' as const
        });

        await saveGuideHistoryToSupabase(session.user, guideData.metadata.originalLocationName, guideData, userProfile);
      }
    } catch (error) {
      console.warn('히스토리 저장 실패:', error);
    }
  };

  // 🌍 언어별 가이드 로드
  const loadGuideForLanguage = async (language = currentLanguage, forceRegenerate = false) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 ${language} 가이드 로드:`, locationName, { forceRegenerate });

      let result;
      
      if (forceRegenerate) {
        // 강제 재생성
        result = await MultiLangGuideManager.generateAndSaveGuide(
          locationName,
          language
        );
      } else {
        // 스마트 언어 전환 (캐시 우선)
        result = await MultiLangGuideManager.smartLanguageSwitch(
          locationName,
          language
        );
      }

      if (result.success && result.data) {
        // 데이터 구조 정규화
        const normalizedData = normalizeGuideData(result.data, locationName);
        setGuideData(normalizedData);
        setSource((result as any).source || 'unknown');

        // 히스토리 저장
        await saveToHistory(normalizedData);

        console.log(`✅ ${language} 가이드 로드 완료 (${(result as any).source || 'unknown'})`);
      } else {
        throw new Error((result as any).error?.message || result.error || '가이드 로드 실패');
      }

    } catch (err) {
      console.error('❌ 가이드 로드 오류:', err);
      setError(err instanceof Error ? err.message : '가이드 로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  // 🌍 사용 가능한 언어 목록 로드
  const loadAvailableLanguages = async () => {
    try {
      const versions = await MultiLangGuideManager.getAllLanguageVersions(locationName);
      if (versions.success && versions.data) {
        setAvailableLanguages(versions.data);
      }
    } catch (error) {
      console.warn('언어 목록 로드 실패:', error);
    }
  };

  // 🔄 재생성 함수
  const handleRegenerateGuide = async () => {
    setIsRegenerating(true);
    setError(null);
    
    try {
      console.log(`🔄 ${currentLanguage} 가이드 재생성:`, locationName);
      
      await loadGuideForLanguage(currentLanguage, true);
      
      console.log('✅ 가이드 재생성 완료');
    } catch (error) {
      console.error('❌ 재생성 오류:', error);
      setError(error instanceof Error ? error.message : '재생성 중 오류 발생');
    }
  };

  // 초기 로드 (서버에서 받은 initialGuide 우선 사용)
  useEffect(() => {
    const initializeGuide = async () => {
      if (initialGuide) {
        console.log('🎯 서버에서 받은 초기 가이드 사용:', initialGuide);
        try {
          const normalizedData = normalizeGuideData(initialGuide, locationName);
          setGuideData(normalizedData);
          setSource('cache');
          setIsLoading(false);
          await saveToHistory(normalizedData);
        } catch (error) {
          console.error('초기 가이드 처리 오류:', error);
          // 초기 가이드 처리 실패시 새로 로드
          await loadGuideForLanguage(currentLanguage);
        }
      } else {
        console.log('🔄 새로운 가이드 로드 필요');
        await loadGuideForLanguage(currentLanguage);
      }
      
      await loadAvailableLanguages();
    };

    initializeGuide();
  }, [locationName]); // initialGuide 의존성 제거 (한 번만 실행)

  // 언어 변경시 자동 로드
  useEffect(() => {
    if (currentLanguage && !isLoading && guideData) {
      console.log(`🌍 언어 변경 감지: ${currentLanguage}`);
      loadGuideForLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {currentLanguage === 'ko' ? '가이드를 불러오는 중...' : 'Loading guide...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {locationName}
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태 (가이드가 없는 경우)
  if (!guideData || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLanguage === 'ko' ? '가이드를 찾을 수 없습니다' : 'Guide not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || (currentLanguage === 'ko' ? 
                '가이드 데이터를 찾을 수 없습니다.' : 'No guide data found.')}
            </p>
            <button
              onClick={handleRegenerateGuide}
              disabled={isRegenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {currentLanguage === 'ko' ? '생성 중...' : 'Generating...'}
                </div>
              ) : (
                currentLanguage === 'ko' ? '가이드 생성' : 'Generate Guide'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 정상적인 가이드 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
          <div>언어: {currentLanguage}</div>
          <div>소스: {source}</div>
          <div>가능한 언어: {availableLanguages.join(', ')}</div>
          <div>챕터 수: {guideData.realTimeGuide?.chapters?.length || 0}</div>
          <div>생성 시간: {guideData.metadata.generatedAt ? new Date(guideData.metadata.generatedAt).toLocaleTimeString() : 'N/A'}</div>
        </div>
      )}

      {/* 오류 알림 (가이드는 있지만 오류가 발생한 경우) */}
      {error && guideData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-yellow-600 underline mt-1 hover:text-yellow-800"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 컨트롤 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 뒤로가기
              </button>
              <h1 className="text-lg font-semibold text-gray-800 truncate max-w-md">
                {guideData.overview.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 언어 표시 */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">언어:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {currentLanguage.toUpperCase()}
                </span>
              </div>

              {/* 소스 표시 */}
              {source && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">소스:</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    source === 'cache' ? 'bg-green-100 text-green-800' :
                    source === 'generated' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {source === 'cache' ? '캐시됨' : 
                     source === 'generated' ? '새로 생성' : source}
                  </span>
                </div>
              )}

              {/* 재생성 버튼 */}
              <button
                onClick={handleRegenerateGuide}
                disabled={isRegenerating}
                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                {isRegenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                    <span>재생성 중...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>{currentLanguage === 'ko' ? '재생성' : 'Regenerate'}</span>
                  </>
                )}
              </button>

              {/* 다운로드 버튼 */}
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(guideData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${locationName}_guide_${currentLanguage}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
                title="가이드 다운로드"
              >
                <span>💾</span>
                <span className="hidden sm:inline">다운로드</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 가용 언어 표시 (2개 이상인 경우) */}
      {availableLanguages.length > 1 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-blue-700 font-medium">사용 가능한 언어:</span>
                <div className="flex space-x-1">
                  {availableLanguages.map(lang => (
                    <span
                      key={lang}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        lang === currentLanguage 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-blue-600 text-xs">
                언어 설정에서 변경하면 자동으로 전환됩니다
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 가이드 컨텐츠 */}
      <div className="relative">
        {/* 로딩 오버레이 (재생성 중) */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 z-40 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">새로운 가이드를 생성하고 있습니다...</p>
              <p className="text-sm text-gray-500 mt-1">잠시만 기다려주세요</p>
            </div>
          </div>
        )}
        
        <MinimalTourContent 
          guide={guideData}
          language={currentLanguage}
        />
      </div>

      {/* 하단 정보 */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span>
                생성일: {guideData.metadata.generatedAt ? 
                  new Date(guideData.metadata.generatedAt).toLocaleDateString('ko-KR') : 
                  '알 수 없음'
                }
              </span>
              <span>•</span>
              <span>
                버전: {guideData.metadata.version || '1.0'}
              </span>
              <span>•</span>
              <span>
                챕터: {guideData.realTimeGuide?.chapters?.length || 0}개
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {session?.user && (
                <>
                  <span>
                    사용자: {session.user.name || session.user.email}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>
                AI 여행 가이드 powered by Gemini
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 키보드 단축키 안내 (개발 환경) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded max-w-xs">
          <div className="font-bold mb-2">키보드 단축키</div>
          <div>R: 재생성</div>
          <div>D: 다운로드</div>
          <div>←/→: 챕터 이동</div>
          <div>Space: 오디오 재생/일시정지</div>
          <div>Esc: 뒤로가기</div>
        </div>
      )}
    </div>
  );
}

// 키보드 단축키 처리 (개발 환경)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return; // 입력 필드에서는 단축키 비활성화
    }

    switch (e.key.toLowerCase()) {
      case 'r':
        if (e.ctrlKey || e.metaKey) return; // 브라우저 새로고침과 충돌 방지
        // 재생성 버튼 클릭 시뮬레이션
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) return;
        // 다운로드 버튼 클릭 시뮬레이션
        break;
      case 'escape':
        window.history.back();
        break;
    }
  });
}
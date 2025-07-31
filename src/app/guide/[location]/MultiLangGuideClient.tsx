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
import GuideLoading from '@/components/ui/GuideLoading';

interface Props {
  locationName: string;
  initialGuide?: any;
}

// 🔥 핵심 수정: content 래핑 구조 올바른 처리
const normalizeGuideData = (data: any, locationName: string): GuideData => {
  if (!data) {
    throw new Error('가이드 데이터가 없습니다.');
  }

  // 🔥 핵심 수정: content 래핑 구조 올바른 처리
  let sourceData = data;
  
  // data.content가 있으면 그것을 사용 (가장 일반적인 케이스)
  if (data.content && typeof data.content === 'object') {
    sourceData = data.content;
    console.log('📦 content 필드에서 데이터 추출');
  }
  // data가 직접 overview, route, realTimeGuide를 가지면 직접 사용
  else if (data.overview || data.route || data.realTimeGuide) {
    sourceData = data;
    console.log('📦 직접 구조에서 데이터 추출');
  }
  else {
    console.error('❌ 올바른 가이드 구조를 찾을 수 없음:', Object.keys(data));
    throw new Error('올바른 가이드 데이터 구조가 아닙니다.');
  }

  // 🔍 mustVisitSpots 데이터 추적
  console.log('🎯 MultiLangGuideClient에서 sourceData 확인:', {
    hasSourceData: !!sourceData,
    sourceDataKeys: Object.keys(sourceData || {}),
    sourceMustVisitSpots: sourceData?.mustVisitSpots,
    keyHighlights: sourceData?.keyHighlights,
    highlights: sourceData?.highlights
  });

  // 🎯 정규화된 GuideData 생성
  const normalizedData: GuideData = {
    overview: {
      title: sourceData.overview?.title || locationName,
      // 새로운 개요 필드들
      location: sourceData.overview?.location || '',
      keyFeatures: sourceData.overview?.keyFeatures || '',
      background: sourceData.overview?.background || '',
      // 기존 필드들 (호환성)
      summary: sourceData.overview?.summary || '',
      narrativeTheme: sourceData.overview?.narrativeTheme || '',
      keyFacts: Array.isArray(sourceData.overview?.keyFacts) ? sourceData.overview.keyFacts : [],
      visitingTips: sourceData.overview?.visitingTips,
      historicalBackground: sourceData.overview?.historicalBackground,
      visitInfo: sourceData.overview?.visitInfo || {}
    },
    route: {
      steps: Array.isArray(sourceData.route?.steps) ? sourceData.route.steps : []
    },
    realTimeGuide: {
      chapters: Array.isArray(sourceData.realTimeGuide?.chapters) ? sourceData.realTimeGuide.chapters : [],
      ...sourceData.realTimeGuide
    },
    safetyWarnings: sourceData.safetyWarnings || '', // 안전 주의사항 추가
    mustVisitSpots: sourceData.mustVisitSpots || sourceData.keyHighlights || sourceData.highlights || '', // 필수관람포인트 추가
    metadata: {
      originalLocationName: locationName,
      generatedAt: sourceData.metadata?.generatedAt || new Date().toISOString(),
      version: sourceData.metadata?.version || '1.0',
      language: sourceData.metadata?.language || 'ko',
      ...sourceData.metadata
    }
  };

  // 🔧 챕터 ID 정규화 (타입 요구사항 충족)
  if (normalizedData.realTimeGuide?.chapters) {
    normalizedData.realTimeGuide.chapters = normalizedData.realTimeGuide.chapters.map((chapter, index) => {
      // 챕터 데이터 정규화: 3개 필드를 narrative로 통합
      const normalizedChapter = {
        ...chapter,
        id: chapter.id !== undefined ? chapter.id : index,
        title: chapter.title || `챕터 ${index + 1}`,
        // narrative가 있으면 사용, 없으면 3개 필드 합치기
        narrative: chapter.narrative || 
          [chapter.sceneDescription, chapter.coreNarrative, chapter.humanStories]
            .filter(Boolean).join(' '),
        nextDirection: chapter.nextDirection || ''
      };
      
      return normalizedChapter;
    });
  }

  // 🔍 최종 정규화 결과 확인
  console.log('🎯 MultiLangGuideClient 최종 정규화 결과:', {
    hasMustVisitSpots: !!normalizedData.mustVisitSpots,
    mustVisitSpots: normalizedData.mustVisitSpots,
    mustVisitSpotsType: typeof normalizedData.mustVisitSpots,
    mustVisitSpotsLength: normalizedData.mustVisitSpots?.length
  });

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
        result = await MultiLangGuideManager.forceRegenerateGuide(
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
        // 🔥 핵심: data.data가 실제 가이드 데이터
        const guideResponse = result.data;
        
        // 정규화 함수에 위임
        const normalizedData = normalizeGuideData(guideResponse, locationName);
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
          // 🔥 핵심: initialGuide를 정규화 함수로 처리
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
  }, [locationName, initialGuide]); // 🔥 무한 루프 방지: 함수 의존성 제거

  // 언어 변경시 자동 로드 (초기 로드 이후에만)
  useEffect(() => {
    // 초기 로드가 완료되고, 현재 가이드의 언어와 다를 때만 로드
    if (currentLanguage && !isLoading && guideData && guideData.metadata?.language !== currentLanguage) {
      console.log(`🌍 언어 변경 감지: ${guideData.metadata?.language} → ${currentLanguage}`);
      loadGuideForLanguage(currentLanguage);
    }
  }, [currentLanguage]); // 🔥 무한 루프 방지: 함수 의존성 제거, 실제 언어 변경시에만 트리거

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 mobile-touch-optimized"
           style={{
             padding: 'var(--space-4)'
           }}>
        <GuideLoading 
          type="fetching"
          message={currentLanguage === 'ko' ? `"${locationName}" 가이드 불러오는 중` : `Loading "${locationName}" guide`}
          subMessage={currentLanguage === 'ko' ? '다국어 가이드 데이터를 준비하고 있어요...' : 'Preparing multilingual guide data...'}
          showProgress={true}
        />
      </div>
    );
  }

  // 에러 상태 (가이드가 없는 경우)
  if (!guideData || error) {
    return (
      <div className="min-h-screen bg-gray-50 ios-viewport-fix">
        <div className="container-responsive"
             style={{
               padding: 'var(--space-4) var(--space-4) var(--space-16) var(--space-4)'
             }}>
          <div className="text-center">
            <div className="text-fluid-6xl"
                 style={{ marginBottom: 'var(--space-4)' }}>😕</div>
            <h1 className="heading-responsive text-gray-900"
                style={{ marginBottom: 'var(--space-4)' }}>
              {currentLanguage === 'ko' ? '가이드를 찾을 수 없습니다' : 'Guide not found'}
            </h1>
            <p className="body-responsive text-gray-600"
               style={{ marginBottom: 'var(--space-6)' }}>
              {error || (currentLanguage === 'ko' ? 
                '가이드 데이터를 찾을 수 없습니다.' : 'No guide data found.')}
            </p>
            <button
              onClick={handleRegenerateGuide}
              disabled={isRegenerating}
              className="btn-base btn-mobile-friendly bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mobile-touch-action safari-button-reset transition-compat"
              style={{
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-md)'
              }}
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
    <div className="min-h-screen bg-gray-50 ios-viewport-fix safari-scroll-fix">
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


      {/* 키보드 단축키 안내 (개발 환경) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded max-w-xs">
          <div className="font-medium mb-2">키보드 단축키</div>
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
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

  // 🌍 언어별 가이드 로드
  const loadGuideForLanguage = async (language = currentLanguage) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 ${language} 가이드 로드:`, locationName);

      // 스마트 언어 전환 (캐시 우선)
      const result = await MultiLangGuideManager.smartLanguageSwitch(
        locationName,
        language
      );

      if (result.success && result.data) {
        // 데이터 구조 정규화
        const normalizedData = normalizeGuideData(result.data, locationName);
        setGuideData(normalizedData);
        setSource((result as any).source || 'unknown');

        // 히스토리 저장
        await saveToHistory(normalizedData);

        console.log(`✅ ${language} 가이드 로드 완료 (${(result as any).source || 'unknown'})`);
      } else {
        setError((result as any).error?.message || result.error || '가이드 로드 실패');
      }

    } catch (err) {
      console.error('❌ 가이드 로드 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 가이드 데이터 정규화 (기존 컴포넌트 호환성 보장)
  const normalizeGuideData = (data: any, locationName: string): GuideData => {
    console.log('🔧 가이드 데이터 정규화:', data);
    
    // 다양한 데이터 구조 처리
    let content = data;
    
    // 래핑된 구조 처리
    if (data.content) content = data.content;
    if (data.guide_data) content = data.guide_data;
    
    // 기본 구조 생성
    const normalized: GuideData = {
      overview: {
        title: content.overview?.title || content.title || locationName,
        summary: content.overview?.summary || content.summary || content.description || '',
        keyFacts: content.overview?.keyFacts || content.keyFacts || [],
        visitInfo: content.overview?.visitInfo || content.visitInfo || {},
        narrativeTheme: content.overview?.narrativeTheme || content.theme || ''
      },
      route: {
        steps: content.route?.steps || content.steps || []
      },
      realTimeGuide: {
        chapters: content.realTimeGuide?.chapters || content.chapters || []
      },
      metadata: {
        originalLocationName: locationName,
        englishFileName: '',
        generatedAt: new Date().toISOString(),
        version: '2.0-multilang',
        language: currentLanguage
      }
    };

    // 빈 데이터 처리 - 최소한의 구조 보장
    if (!normalized.overview.title) {
      normalized.overview.title = locationName;
    }

    if (!normalized.overview.summary) {
      normalized.overview.summary = `${locationName}에 대한 AI 가이드입니다.`;
    }

    // realTimeGuide가 없으면 기본 챕터 생성
    if (!normalized.realTimeGuide?.chapters?.length) {
      normalized.realTimeGuide = {
        chapters: [
          {
            number: 1,
            title: `${locationName} 소개`,
            content: normalized.overview.summary,
            audioUrl: '',
            duration: '5분',
            keyPoints: [],
            location: { lat: 0, lng: 0 },
            nearbyPois: []
          }
        ]
      };
    }

    console.log('✅ 정규화된 가이드 데이터:', normalized);
    return normalized;
  };

  // 💾 히스토리 저장
  const saveToHistory = async (guideData: GuideData) => {
    try {
      const userProfile = safeUserProfile({});
      
      if (session?.user) {
        await saveGuideHistoryToSupabase(
          session.user, 
          locationName, 
          guideData, 
          userProfile
        );
      } else {
        guideHistory.saveGuide(locationName, guideData, userProfile);
      }
    } catch (error) {
      console.warn('히스토리 저장 실패:', error);
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
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 ${currentLanguage} 가이드 재생성:`, locationName);
      
      const result = await MultiLangGuideManager.generateAndSaveGuide(
        locationName,
        currentLanguage
      );
      
      if (result.success) {
        const normalizedData = normalizeGuideData(result.data, locationName);
        setGuideData(normalizedData);
        setSource('generated');
        await saveToHistory(normalizedData);
        console.log('✅ 가이드 재생성 완료');
      } else {
        setError(result.error?.message || '재생성 실패');
      }
    } catch (error) {
      console.error('❌ 재생성 오류:', error);
      setError(error instanceof Error ? error.message : '재생성 중 오류 발생');
    } finally {
      setIsLoading(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {currentLanguage === 'ko' ? '가이드를 불러오는 중...' : 'Loading guide...'}
          </p>
        </div>
      </div>
    );
  }

  // 오류 상태 표시
  if (error && !guideData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {currentLanguage === 'ko' ? '가이드 로드 실패' : 'Failed to load guide'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => loadGuideForLanguage(currentLanguage)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentLanguage === 'ko' ? '다시 시도' : 'Retry'}
            </button>
            <button
              onClick={handleRegenerateGuide}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {currentLanguage === 'ko' ? '새로 생성' : 'Generate New'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 가이드 데이터가 없는 경우
  if (!guideData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {currentLanguage === 'ko' ? '가이드 데이터를 찾을 수 없습니다.' : 'No guide data found.'}
          </p>
          <button
            onClick={handleRegenerateGuide}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentLanguage === 'ko' ? '가이드 생성' : 'Generate Guide'}
          </button>
        </div>
      </div>
    );
  }

  // 정상적인 가이드 렌더링
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>언어: {currentLanguage}</div>
          <div>소스: {source}</div>
          <div>가능한 언어: {availableLanguages.join(', ')}</div>
        </div>
      )}

      {/* 오류 알림 (가이드는 있지만 오류가 발생한 경우) */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-yellow-600 underline mt-1"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 언어/재생성 컨트롤 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {guideData.overview.title}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={handleRegenerateGuide}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              {currentLanguage === 'ko' ? '재생성' : 'Regenerate'}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 가이드 컨텐츠 */}
      <MinimalTourContent 
        guide={guideData}
        language={currentLanguage}
      />
    </div>
  );
}
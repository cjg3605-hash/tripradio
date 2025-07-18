// 🎯 1단계: GuideClient 다국어 통합 (최우선)
// src/app/guide/[location]/MultiLangGuideClient.tsx

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
import { MultiLanguageGuideManager } from '@/lib/multilang-guide-manager';

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
      const result = await MultiLanguageGuideManager.smartLanguageSwitch(
        locationName,
        language
      );

      if (result.success && result.data) {
        // 데이터 구조 정규화
        const normalizedData = normalizeGuideData(result.data, locationName);
        setGuideData(normalizedData);
        setSource(result.source);

        // 히스토리 저장
        saveToHistory(normalizedData);

        console.log(`✅ ${language} 가이드 로드 완료 (${result.source})`);
      } else {
        setError(result.error?.message || '가이드 로드 실패');
      }

    } catch (err) {
      console.error('❌ 가이드 로드 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 가이드 데이터 정규화 (기존 컴포넌트 호환)
  const normalizeGuideData = (data: any, locationName: string): GuideData => {
    // content 래핑 구조 처리
    const content = data.content || data;
    
    return {
      overview: content.overview || { 
        title: '', 
        summary: '', 
        keyFacts: [], 
        visitInfo: {},
        narrativeTheme: '' 
      },
      route: content.route || { steps: [] },
      realTimeGuide: content.realTimeGuide || { chapters: [] },
      metadata: {
        originalLocationName: locationName,
        englishFileName: '',
        generatedAt: new Date().toISOString(),
        version: '2.0-multilang'
      }
    };
  };

  // 💾 히스토리 저장
  const saveToHistory = async (guideData: GuideData) => {
    try {
      if (session?.user) {
        await saveGuideHistoryToSupabase(
          session.user, 
          locationName, 
          guideData, 
          {}
        );
      } else {
        const historyEntry = {
          locationName,
          timestamp: Date.now(),
          guideData
        };
        guideHistory.saveGuide(locationName, guideData, {});
      }
    } catch (error) {
      console.warn('히스토리 저장 실패:', error);
    }
  };

  // 🌍 사용 가능한 언어 목록 로드
  const loadAvailableLanguages = async () => {
    try {
      const versions = await MultiLanguageGuideManager.getAllLanguageVersions(locationName);
      setAvailableLanguages(Object.keys(versions));
    } catch (error) {
      console.warn('언어 목록 로드 실패:', error);
    }
  };

  // 초기 로드 (서버에서 받은 initialGuide 우선 사용)
  useEffect(() => {
    if (initialGuide) {
      // 서버에서 받은 데이터 사용
      const normalizedData = normalizeGuideData(initialGuide, locationName);
      setGuideData(normalizedData);
      setSource('cache');
      setIsLoading(false);
      saveToHistory(normalizedData);
    } else {
      // 없으면 새로 로드
      loadGuideForLanguage(currentLanguage);
    }
    
    loadAvailableLanguages();
  }, [locationName, initialGuide]);

  // 언어 변경시 자동 로드
  useEffect(() => {
    // 언어 변경시 항상 새로 로드
    if (currentLanguage && !isLoading) {
      loadGuideForLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  // 🔄 재생성 함수
  const regenerateGuide = async () => {
    setIsLoading(true);
    try {
      const result = await MultiLanguageGuideManager.generateAndSaveGuide(
        locationName,
        currentLanguage
      );
      
      if (result.success) {
        const normalizedData = normalizeGuideData(result.data, locationName);
        setGuideData(normalizedData);
        setSource('generated');
        saveToHistory(normalizedData);
      } else {
        setError(result.error?.message || '재생성 실패');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '재생성 중 오류');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t.common?.loading || '로딩 중...'}
            </h2>
            <p className="text-gray-600 text-sm">
              {currentLanguage === 'ko' ? `${locationName} ${currentLanguage} 가이드 로드 중...` :
               currentLanguage === 'en' ? `Loading ${locationName} guide in ${currentLanguage}...` :
               currentLanguage === 'ja' ? `${locationName}の${currentLanguage}ガイドを読み込み中...` :
               currentLanguage === 'zh' ? `正在加载${locationName}的${currentLanguage}导游...` :
               `Cargando guía de ${locationName} en ${currentLanguage}...`}
            </p>
            {source && (
              <p className="text-xs text-gray-500 mt-2">
                {source === 'cache' ? '캐시에서 로드 중...' : '새로 생성 중...'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t.errors?.serverError || '오류 발생'}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => loadGuideForLanguage()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t.errors?.retry || '다시 시도'}
              </button>
              <button
                onClick={regenerateGuide}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                새로 생성
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 가이드 없음
  if (!guideData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            가이드를 찾을 수 없습니다
          </h2>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 메인 콘텐츠
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 기존 TourContent 그대로 사용 */}
      <MinimalTourContent 
        guide={guideData}
        language={currentLanguage}
      />
      
      {/* 다국어 상태 표시 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs p-2 rounded">
          언어: {currentLanguage} | 
          소스: {source} | 
          사용가능: {availableLanguages.join(', ')}
        </div>
      )}
    </div>
  );
}
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

export default function GuideClient({ locationName, initialGuide }: { locationName: string, initialGuide: any }) {
    const router = useRouter();
    const { currentLanguage } = useLanguage();
    const sessionResult = useSession();
const session = sessionResult?.data;

    const [guideData, setGuideData] = useState<GuideData | null>(() => {
        if (!initialGuide) return null;

        console.log('🔍 초기 가이드 데이터 구조:', {
            hasOverview: !!initialGuide.overview,
            hasRoute: !!initialGuide.route,
            hasRealTimeGuide: !!initialGuide.realTimeGuide,
            hasContent: !!initialGuide.content,
            keys: Object.keys(initialGuide)
        });

        // 직접 구조인 경우 (캐시된 데이터)
        if (initialGuide.overview && initialGuide.route && initialGuide.realTimeGuide) {
            console.log('✅ 직접 구조 데이터 사용');
            return {
                overview: initialGuide.overview,
                route: initialGuide.route,
                realTimeGuide: initialGuide.realTimeGuide,
                metadata: initialGuide.metadata || {
                    originalLocationName: locationName,
                    englishFileName: '',
                    generatedAt: new Date().toISOString(),
                    version: '1.0'
                }
            };
        }

        // content 래핑된 구조인 경우 (새 API 응답)
        if (initialGuide.content) {
            console.log('✅ content 래핑 구조 데이터 사용');
            const content = initialGuide.content;
            return {
                overview: content.overview || { title: '', summary: '', keyFacts: [], visitInfo: {}, narrativeTheme: '' },
                route: content.route || { steps: [] },
                realTimeGuide: content.realTimeGuide || { chapters: [] },
                metadata: content.metadata || {
                    originalLocationName: locationName,
                    englishFileName: '',
                    generatedAt: new Date().toISOString(),
                    version: '1.0'
                }
            };
        }

        console.log('⚠️ 알 수 없는 데이터 구조, null 반환');
        return null;
    });

    const [isLoading, setIsLoading] = useState(!guideData);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('AI 가이드를 생성하고 있습니다...');
    const [currentProgress, setCurrentProgress] = useState(0);
    const [totalSteps, setTotalSteps] = useState(1);

    useEffect(() => {
        if (initialGuide) {
            const normalizedData = normalizeGuideData(initialGuide, locationName);
            setGuideData(normalizedData);
            setSource('cache');
            setIsLoading(false);
            saveToHistory(normalizedData);
        } else {
            loadGuideForLanguage(currentLanguage);
        }
        loadAvailableLanguages();
    }, [locationName, initialGuide]);

    // 로딩 중
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto p-8">
                    {/* 로딩 카드 */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        {/* 프로그레스 바 */}
                        <div className="mb-6">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-black h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(currentProgress / totalSteps) * 100}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                {currentProgress}/{totalSteps} 단계
                            </div>
                        </div>

                        {/* 스피너 */}
                        <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                        
                        {/* 메시지 */}
                        <h2 className="text-xl font-bold text-gray-900 mb-2">가이드 생성 중</h2>
                        <p className="text-gray-600 text-sm">{loadingMessage}</p>
                        
                        {/* 팁 */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500">
                                💡 AI가 해당 장소의 역사, 문화, 숨겨진 이야기들을 찾아 정리하고 있습니다.
                            </p>
                        </div>
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
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 text-xl">!</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
                        <p className="text-gray-600 text-sm mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 가이드 데이터가 없는 경우
    if (!guideData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 mb-4">가이드 데이터를 찾을 수 없습니다.</div>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    console.log('✅ 데이터 로드 완료, MinimalTourContent 렌더링!', { guideData });

    return <MinimalTourContent guide={guideData} language={currentLanguage} />;
}

// --- 유틸 함수: 가이드 데이터 정규화 ---
function normalizeGuideData(raw: any, locationName: string) {
  if (!raw) return null;
  if (raw.overview && raw.route && raw.realTimeGuide) {
    return {
      overview: raw.overview,
      route: raw.route,
      realTimeGuide: raw.realTimeGuide,
      metadata: raw.metadata || {
        originalLocationName: locationName,
        englishFileName: '',
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  }
  if (raw.content) {
    const content = raw.content;
    return {
      overview: content.overview || { title: '', summary: '', keyFacts: [], visitInfo: {}, narrativeTheme: '' },
      route: content.route || { steps: [] },
      realTimeGuide: content.realTimeGuide || { chapters: [] },
      metadata: content.metadata || {
        originalLocationName: locationName,
        englishFileName: '',
        generatedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  }
  return null;
}

// --- 상태 관리용 setSource ---
const setSource = (src: string) => {};
// --- 히스토리 저장 ---
const saveToHistory = (data: any) => {};
// --- 언어별 가이드 로드 ---
const loadGuideForLanguage = async (language: string) => {};
// --- 사용 가능한 언어 목록 로드 ---
const loadAvailableLanguages = () => {};
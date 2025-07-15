"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GuideData, RealTimeGuide, GuideOverview, GuideMetadata } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';
import { REALTIME_GUIDE_KEYS } from '@/lib/ai/prompts/index';
import TourContent from './tour/components/TourContent';
import { guideHistory } from '@/lib/cache/localStorage';
import { saveGuideHistoryToSupabase } from '@/lib/supabaseGuideHistory';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/guide';
import { normalizeString, isValidGuideData } from '@/lib/utils';
import LoadingWithAd from '@/components/ui/LoadingWithAd';
import { MapPin, Route, Headphones } from 'lucide-react';

const extractGuideData = (raw: any, language: string): GuideData | null => {
    if (!raw) return null;

    let contentSource: any = null;
    if (raw.overview) contentSource = raw;
    else if (raw.content?.overview) contentSource = raw.content;
    else if (raw.content?.content?.overview) contentSource = raw.content.content;
    else if (raw.data?.overview) contentSource = raw.data;
    else if (raw.data?.content?.overview) contentSource = raw.data.content;
    else if (raw.data?.content?.content?.overview) contentSource = raw.data.content.content;

    if (!contentSource) return null;

    const langKey = language.slice(0, 2);
    
    // 포괄적인 realTimeGuide 키 찾기 (REALTIME_GUIDE_KEYS + 기본 키들)
    let realTimeGuide: RealTimeGuide | undefined;
    const possibleKeys = [
        REALTIME_GUIDE_KEYS[langKey], // 언어별 키
        'realTimeGuide',
        'RealTimeGuide', 
        '실시간가이드',
        'realtimeGuide',
        'realtime_guide',
        'real_time_guide'
    ].filter(Boolean); // null/undefined 제거
    
    for (const key of possibleKeys) {
        if (contentSource[key] && (contentSource[key].chapters || Array.isArray(contentSource[key]))) {
            realTimeGuide = contentSource[key];
            break;
        }
    }
    
    // realTimeGuide가 없고 최상위에 chapters가 있다면 realTimeGuide로 감싸기
    if (!realTimeGuide && Array.isArray(contentSource.chapters)) {
        realTimeGuide = { chapters: contentSource.chapters };
    }

    let keyFacts = contentSource.overview?.keyFacts || [];
    if (keyFacts.length > 0 && typeof keyFacts[0] === 'string') {
        keyFacts = keyFacts.map((fact: string) => ({ title: fact, description: '' }));
    }

    const overview: GuideOverview = {
        ...contentSource.overview,
        keyFacts: keyFacts,
    };

    const metadata: GuideMetadata = {
        originalLocationName: contentSource.metadata?.originalLocationName || '',
        englishFileName: contentSource.metadata?.englishFileName || '',
        generatedAt: contentSource.metadata?.generatedAt || new Date().toISOString(),
        version: contentSource.metadata?.version || '1.0',
    };

    return {
        overview: overview,
        route: contentSource.route,
        realTimeGuide: realTimeGuide,
        metadata: metadata,
    };
};

function validateGuideContent(content: GuideData | null): content is GuideData {
    if (!content) return false;
    
    // 완전한 타입 가드를 사용하되, 실패시 최소 검증으로 fallback
    try {
        return isValidGuideData(content);
    } catch (error) {
        console.warn('Complete validation failed, using minimal validation:', error);
        // Only validate the most critical part of the guide data to prevent full page crash
        // The component can handle missing route or chapters gracefully.
        const { overview } = content;
        return !!(overview && overview.title);
    }
}

export default function GuideClient({ locationName, initialGuide }: { locationName: string, initialGuide: any }) {
    const router = useRouter();
    const { currentLanguage } = useLanguage();
    const { data: session } = useSession();

    const [guideData, setGuideData] = useState<GuideData | null>(() => extractGuideData(initialGuide, currentLanguage));
    const [isLoading, setIsLoading] = useState(!validateGuideContent(guideData));
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'route' | 'realtime'>('overview');

    useEffect(() => {
        if (validateGuideContent(guideData)) return;

        const fetchGuide = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 단일 엔드포인트로 통일: DB 조회+생성 모두 처리
                const response = await fetch('/api/node/ai/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        locationName: normalizeString(locationName), 
                        language: normalizeString(currentLanguage),
                        forceRegenerate: false
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Server error: ${response.status}`);
                }

                const result = await response.json();
                let extracted: GuideData | null = null;
                if (result.data || result.content) {
                    extracted = extractGuideData(result.data || result.content, currentLanguage);
                }
                if (!validateGuideContent(extracted)) {
                    console.error("Validation failed for extracted data:", extracted);
                    throw new Error('Received guide data is invalid.');
                }

                setGuideData(extracted);

                if (session?.user?.id) {
                    const userProfile: UserProfile = { interests: [], ageGroup: 'adult', knowledgeLevel: 'intermediate', companions: 'solo' };
                    await saveGuideHistoryToSupabase(session.user, locationName, extracted, userProfile);
                } else {
                    guideHistory.saveGuide(locationName, extracted, undefined);
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                console.error('Error loading guide:', err);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGuide();
    }, [locationName, currentLanguage, guideData, session]);

    if (isLoading) {
        return (
            <LoadingWithAd
                message={`${locationName} AI 가이드를 생성하고 있습니다...`}
            />
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">오류 발생</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => router.push('/')} className="px-4 py-2 border rounded-md">홈으로</button>
                </div>
            </div>
        );
    }

    if (!guideData) {
        return (
             <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
               <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                 <h2 className="text-lg font-medium text-gray-900 mb-2">데이터 표시 실패</h2>
                 <p className="text-gray-600 mb-6">가이드 데이터를 불러왔지만, 내용이 올바르지 않습니다. 다시 시도해주세요.</p>
                 <button onClick={() => window.location.reload()} className="px-4 py-2 border rounded-md">다시 시도</button>
               </div>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{guideData.overview.title}</h1>
                    <p className="text-gray-600">{guideData.overview.summary}</p>
                </div>

                {/* 탭 네비게이션 */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'overview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <MapPin className="w-4 h-4 inline mr-2" />
                                개요
                            </button>
                            <button
                                onClick={() => setActiveTab('route')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'route'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Route className="w-4 h-4 inline mr-2" />
                                관람순서
                            </button>
                            <button
                                onClick={() => setActiveTab('realtime')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'realtime'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Headphones className="w-4 h-4 inline mr-2" />
                                실시간가이드
                            </button>
                        </nav>
                    </div>

                    {/* 탭 컨텐츠 */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* 주요 정보 */}
                                {guideData.overview.keyFacts && guideData.overview.keyFacts.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 정보</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {guideData.overview.keyFacts.map((fact, index) => (
                                                <div key={index} className="bg-blue-50 rounded-lg p-4">
                                                    <h4 className="font-medium text-blue-900">{fact.title}</h4>
                                                    {fact.description && (
                                                        <p className="text-blue-700 text-sm mt-1">{fact.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 방문 팁 */}
                                {guideData.overview.visitingTips && guideData.overview.visitingTips.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">방문 팁</h3>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <ul className="space-y-2">
                                                {guideData.overview.visitingTips.map((tip, index) => (
                                                    <li key={index} className="text-green-800 flex items-start">
                                                        <span className="text-green-600 mr-2">•</span>
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* 역사적 배경 */}
                                {guideData.overview.historicalBackground && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">역사적 배경</h3>
                                        <div className="bg-amber-50 rounded-lg p-4">
                                            <p className="text-amber-800">{guideData.overview.historicalBackground}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'route' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900">추천 관람순서</h3>
                                {guideData.route && guideData.route.length > 0 ? (
                                    <div className="space-y-4">
                                        {guideData.route.map((step, index) => (
                                            <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 mb-2">{step.title}</h4>
                                                        <p className="text-gray-600 text-sm">{step.description}</p>
                                                        {step.duration && (
                                                            <p className="text-blue-600 text-sm mt-2">소요시간: {step.duration}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">관람순서 정보가 없습니다.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'realtime' && (
                            <TourContent guide={guideData} language={currentLanguage} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GuideData } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';
import TourContent from './tour/components/TourContent';
import { guideHistory } from '@/lib/cache/localStorage';
import { saveGuideHistoryToSupabase } from '@/lib/supabaseGuideHistory';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/guide';
import LoadingWithAd from '@/components/ui/LoadingWithAd';
import { MapPin, Route, Headphones } from 'lucide-react';

export default function GuideClient({ locationName, initialGuide }: { locationName: string, initialGuide: any }) {
    const router = useRouter();
    const { currentLanguage } = useLanguage();
    const { data: session } = useSession();

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
                route: content.route || { steps: [], tips: [], duration: '' },
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

    useEffect(() => {
        if (guideData) return;

        const fetchGuide = async () => {
            setIsLoading(true);
            setError(null);
            try {
                console.log('📥 가이드 데이터 로드 시도:', { location: locationName, language: currentLanguage });
                
                const response = await fetch('/api/node/ai/generate-guide', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    locationName,
                    language: currentLanguage,
                    forceRegenerate: false
                  })
                });

                const result = await response.json();
                console.log('📊 API 응답 받음:', {
                  success: result.success,
                  hasData: !!result.data,
                  dataKeys: result.data ? Object.keys(result.data) : [],
                  cached: result.cached
                });

                if (!result.success) {
                  throw new Error(result.error || '가이드 생성에 실패했습니다.');
                }

                if (!result.data || !result.data.content) {
                  console.error('❌ 응답 데이터 구조 오류:', {
                    result,
                    hasData: !!result.data,
                    hasContent: !!(result.data && result.data.content)
                  });
                  throw new Error('응답 데이터 구조가 올바르지 않습니다.');
                }

                // 가이드 데이터 검증
                const guideData = result.data.content;
                console.log('🔍 가이드 데이터 검증:', {
                  hasOverview: !!guideData.overview,
                  hasRoute: !!guideData.route,
                  hasRealTimeGuide: !!guideData.realTimeGuide,
                  dataStructure: JSON.stringify(guideData, null, 2).substring(0, 300) + '...'
                });

                // 기본 구조 검증
                if (!guideData.overview && !guideData.route && !guideData.realTimeGuide) {
                  console.error('❌ 가이드 데이터가 비어있음:', guideData);
                  throw new Error('가이드 데이터가 비어있습니다.');
                }

                console.log('✅ 가이드 데이터 검증 성공');
                setGuideData(guideData);

                if (session?.user?.id) {
                    const userProfile: UserProfile = { interests: [], ageGroup: 'adult', knowledgeLevel: 'intermediate', companions: 'solo' };
                    await saveGuideHistoryToSupabase(session.user, locationName, guideData, userProfile);
                } else {
                    guideHistory.saveGuide(locationName, guideData, undefined);
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
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* 헤더 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{guideData.overview.title}</h1>
                    <p className="text-gray-600">{guideData.overview.summary}</p>
                </div>

                {/* 개요 섹션 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">개요</h2>
                    </div>
                    
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
                </div>

                {/* 추천 관람순서 섹션 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <Route className="w-5 h-5 text-blue-600 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">추천 관람순서</h2>
                    </div>
                    
                    {guideData.route && guideData.route.steps && guideData.route.steps.length > 0 ? (
                        <div className="space-y-4">
                            {guideData.route.steps.map((step, index) => (
                                <div key={index} className="bg-gray-50 border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-semibold text-sm">{step.step || index + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-2">{step.title}</h4>
                                            {step.description && (
                                                <p className="text-gray-600 text-sm">{step.description}</p>
                                            )}
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

                {/* 실시간 가이드 섹션 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-6">
                        <Headphones className="w-5 h-5 text-blue-600 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">실시간 오디오 가이드</h2>
                    </div>
                    
                    <TourContent guide={guideData} language={currentLanguage} />
                </div>
            </div>
        </div>
    );
}
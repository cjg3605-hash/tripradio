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
    const [loadingMessage, setLoadingMessage] = useState('AI 가이드를 생성하고 있습니다...');
    const [currentProgress, setCurrentProgress] = useState(0);
    const [totalSteps, setTotalSteps] = useState(1);

    useEffect(() => {
        if (guideData) return;

        const fetchGuideProgressive = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                console.log('📥 단계별 가이드 생성 시작:', { location: locationName, language: currentLanguage });
                
                // 1단계: 구조 생성
                console.log('🏗️ 1단계: 기본 구조 생성');
                setLoadingMessage('가이드 구조를 생성하고 있습니다...');
                setCurrentProgress(1);
                setTotalSteps(6); // 구조 + 5개 챕터
                const structureResponse = await fetch('/api/node/ai/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        locationName,
                        language: currentLanguage,
                        generationMode: 'structure',
                        forceRegenerate: false
                    })
                });

                const structureResult = await structureResponse.json();
                console.log('📊 구조 생성 결과:', {
                    success: structureResult.success,
                    hasData: !!structureResult.data,
                    cached: structureResult.cached
                });

                if (!structureResult.success || !structureResult.data?.content) {
                    throw new Error('기본 구조 생성에 실패했습니다.');
                }

                let currentGuide = structureResult.data.content;
                const totalChapters = currentGuide.realTimeGuide?.chapters?.length || 5;
                
                console.log('📚 위치별 동적 챕터 수:', { 
                    location: locationName, 
                    detectedChapters: totalChapters,
                    routeSteps: currentGuide.route?.steps?.length || 0,
                    currentGuideStructure: {
                        hasRealTimeGuide: !!currentGuide.realTimeGuide,
                        hasChapters: !!currentGuide.realTimeGuide?.chapters,
                        chaptersArray: currentGuide.realTimeGuide?.chapters
                    }
                });
                setTotalSteps(1 + totalChapters);
                setCurrentProgress(1);
                setLoadingMessage(`기본 구조 생성 완료! ${totalChapters}개 챕터 내용을 생성하고 있습니다...`);
                setGuideData(currentGuide); // 구조를 먼저 표시

                console.log('🚀 챕터 생성 루프 시작:', { totalChapters, willLoop: totalChapters > 0 });

                // 2단계: 각 챕터 순차 생성
                for (let chapterIndex = 0; chapterIndex < totalChapters; chapterIndex++) {
                    console.log(`🔄 루프 진입: chapterIndex=${chapterIndex}, totalChapters=${totalChapters}`);
                    console.log(`📖 챕터 ${chapterIndex + 1}/${totalChapters} 생성 중...`);
                    setLoadingMessage(`챕터 ${chapterIndex + 1}/${totalChapters} 생성 중...`);
                    setCurrentProgress(2 + chapterIndex);
                    
                    try {
                        const chapterResponse = await fetch('/api/node/ai/generate-guide', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                locationName,
                                language: currentLanguage,
                                generationMode: 'chapter',
                                existingGuide: currentGuide,
                                targetChapter: chapterIndex
                            })
                        });

                        const chapterResult = await chapterResponse.json();
                        console.log(`📖 챕터 ${chapterIndex + 1} 생성 결과:`, {
                            success: chapterResult.success,
                            chapterIndex: chapterResult.targetChapter
                        });

                        if (chapterResult.success && chapterResult.data?.content) {
                            currentGuide = chapterResult.data.content;
                            setGuideData({ ...currentGuide }); // 업데이트된 가이드로 화면 갱신
                        } else {
                            console.warn(`⚠️ 챕터 ${chapterIndex + 1} 생성 실패, 계속 진행`);
                        }
                    } catch (chapterError) {
                        console.warn(`⚠️ 챕터 ${chapterIndex + 1} 생성 중 오류:`, chapterError);
                        // 챕터 하나 실패해도 계속 진행
                    }
                }

                console.log('✅ 가이드 완전 생성 완료');
                setLoadingMessage('가이드 생성 완료!');
                setCurrentProgress(totalSteps);

                if (session?.user?.id) {
                    const userProfile: UserProfile = { interests: [], ageGroup: 'adult', knowledgeLevel: 'intermediate', companions: 'solo' };
                    await saveGuideHistoryToSupabase(session.user, locationName, currentGuide, userProfile);
                } else {
                    guideHistory.saveGuide(locationName, currentGuide, undefined);
                }

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                console.error('Error loading guide:', err);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGuideProgressive();
    }, [locationName, currentLanguage, guideData, session]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">{locationName} AI 가이드 생성</h2>
                    
                    {/* 진행률 표시 */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>진행률</span>
                            <span>{currentProgress}/{totalSteps}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(currentProgress / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{loadingMessage}</p>
                    
                    {/* 로딩 스피너 */}
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    
                    {/* 현재 가이드 데이터가 있으면 미리보기 표시 */}
                    {guideData && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-blue-800 text-sm">✨ 기본 구조는 준비되었습니다! 챕터 내용을 계속 생성하고 있어요.</p>
                        </div>
                    )}
                </div>
            </div>
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
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
    const [source, setSource] = useState<'cache' | 'generated' | null>(null);

    // 가이드 생성 또는 로드
    useEffect(() => {
        async function loadOrGenerateGuide() {
            if (guideData) {
                console.log('✅ 초기 가이드 데이터 존재, 로딩 건너뛰기');
                setSource('cache');
                return;
            }

            if (!locationName) {
                setError('위치 이름이 없습니다.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                console.log('🔄 가이드 생성/로드 시작:', locationName);

                const userProfile: UserProfile = {
                    interests: ['문화', '역사'],
                    knowledgeLevel: 'intermediate' as const,
                    ageGroup: '30s' as const,
                    preferredStyle: 'friendly' as const,
                    language: currentLanguage
                };

                const response = await fetch('/api/node/ai/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        locationName, 
                        language: currentLanguage, 
                        userProfile 
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '가이드 생성에 실패했습니다.');
                }

                const data = await response.json();
                console.log('📦 API 응답 데이터:', data);

                // 응답 데이터 구조 정규화
                let normalizedGuideData: GuideData;

                if (data.content) {
                    // content가 래핑된 경우
                    normalizedGuideData = {
                        overview: data.content.overview || { title: '', summary: '', keyFacts: [], visitInfo: {}, narrativeTheme: '' },
                        route: data.content.route || { steps: [] },
                        realTimeGuide: data.content.realTimeGuide || { chapters: [] },
                        metadata: data.content.metadata || {
                            originalLocationName: locationName,
                            englishFileName: '',
                            generatedAt: new Date().toISOString(),
                            version: '1.0'
                        }
                    };
                } else if (data.overview && data.route && data.realTimeGuide) {
                    // 직접 구조인 경우
                    normalizedGuideData = {
                        overview: data.overview,
                        route: data.route,
                        realTimeGuide: data.realTimeGuide,
                        metadata: data.metadata || {
                            originalLocationName: locationName,
                            englishFileName: '',
                            generatedAt: new Date().toISOString(),
                            version: '1.0'
                        }
                    };
                } else {
                    throw new Error('응답 데이터 구조가 올바르지 않습니다.');
                }

                setGuideData(normalizedGuideData);
                setSource('generated');

                // 히스토리 저장 (수정된 부분)
                const userProfile2: UserProfile = {
                    interests: ['문화', '역사'],
                    knowledgeLevel: 'intermediate' as const,
                    ageGroup: '30s' as const,
                    preferredStyle: 'friendly' as const,
                    language: currentLanguage
                };

                // localStorage에 저장
                guideHistory.saveGuide(locationName, normalizedGuideData, userProfile2);

                // 세션이 있는 경우 Supabase에도 저장
                if (session?.user) {
                    try {
                        await saveGuideHistoryToSupabase(session.user, locationName, normalizedGuideData, userProfile2);
                    } catch (supabaseError) {
                        console.warn('Supabase 저장 실패:', supabaseError);
                    }
                }

                console.log('✅ 가이드 로드/생성 완료');

            } catch (err) {
                console.error('❌ 가이드 로드/생성 실패:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        }

        loadOrGenerateGuide();
    }, [locationName, currentLanguage, session]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto p-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">가이드 생성 중</h2>
                        <p className="text-gray-600 text-sm">잠시만 기다려주세요...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto p-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-red-600 text-xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">오류 발생</h2>
                        <p className="text-gray-600 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            홈으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!guideData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-auto p-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">가이드를 찾을 수 없습니다</h2>
                        <p className="text-gray-600 text-sm mb-4">요청하신 가이드 데이터를 불러올 수 없습니다.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            홈으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MinimalTourContent 
            guide={guideData} 
            language={currentLanguage}
        />
    );
}
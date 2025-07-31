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
import GuideLoading from '@/components/ui/GuideLoading';

export default function GuideClient({ locationName, initialGuide }: { locationName: string, initialGuide: any }) {
    const router = useRouter();
    const { currentLanguage, t } = useLanguage();
    const sessionResult = useSession();
    const session = sessionResult?.data;

    // 🔥 핵심 수정: content 래핑 구조 올바른 처리
    const normalizeGuideData = (data: any, locationName: string): GuideData => {
        if (!data) {
            const errorMessage = t('guide.noGuideData');
            throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        }

        // 🔥 핵심 수정: content 래핑 구조 올바른 처리
        let sourceData = data;
        
        // data.content가 있으면 그것을 사용 (가장 일반적인 케이스)
        if (data.content && typeof data.content === 'object') {
            sourceData = data.content;
            console.log('📦 Extracting data from content field');
        }
        // data가 직접 overview, route, realTimeGuide를 가지면 직접 사용
        else if (data.overview || data.route || data.realTimeGuide) {
            sourceData = data;
            console.log('📦 Extracting data from direct structure');
        }
        else {
            console.error('❌ Cannot find valid guide structure:', Object.keys(data));
            const errorMessage = t('guide.invalidGuideStructure');
            throw new Error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
        }

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
            mustVisitSpots: sourceData.mustVisitSpots || '', // 필수 관람 포인트 추가
            route: {
                steps: Array.isArray(sourceData.route?.steps) ? sourceData.route.steps : []
            },
            realTimeGuide: {
                chapters: Array.isArray(sourceData.realTimeGuide?.chapters) ? sourceData.realTimeGuide.chapters : [],
                ...sourceData.realTimeGuide
            },
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
                    title: chapter.title || t('guide.chapterTitle') + ` ${index + 1}`,
                    // narrative가 있으면 사용, 없으면 3개 필드 합치기
                    narrative: chapter.narrative || 
                        [chapter.sceneDescription, chapter.coreNarrative, chapter.humanStories]
                            .filter(Boolean).join(' '),
                    nextDirection: chapter.nextDirection || ''
                };
                
                return normalizedChapter;
            });
        }

        return normalizedData;
    };

    const [guideData, setGuideData] = useState<GuideData | null>(() => {
        if (!initialGuide) return null;
        
        try {
            // 🔥 핵심: initialGuide를 정규화 함수로 처리
            return normalizeGuideData(initialGuide, locationName);
        } catch (error) {
            console.error('Initial data normalization failed:', error);
            return null;
        }
    });

    const [isLoading, setIsLoading] = useState(!guideData);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<'cache' | 'generated' | null>(null);

    // 가이드 생성 또는 로드
    useEffect(() => {
        async function loadOrGenerateGuide() {
            if (guideData) {
                console.log('✅ Initial guide data exists, skipping loading');
                setSource('cache');
                return;
            }

            if (!locationName) {
                const errorMessage = t('guide.noLocationName');
                setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                console.log('🔄 Guide generation/loading started:', locationName);

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
                    throw new Error(errorData.error || t('guide.generationFailed'));
                }

                const data = await response.json();
                console.log('📦 API response data:', data);

                if (!data.success) {
                    throw new Error(data.error || t('guide.generationFailed'));
                }

                // 🔥 핵심: data.data가 실제 가이드 데이터
                const guideResponse = data.data;

                // ===== 6. 데이터 구조 디버깅 로그 추가 =====
                console.log('🔍 데이터 구조 분석:', {
                    originalDataKeys: Object.keys(data || {}),
                    hasDataField: !!data.data,
                    dataFieldKeys: data.data ? Object.keys(data.data) : [],
                    hasContentField: !!(data.data?.content),
                    contentKeys: data.data?.content ? Object.keys(data.data.content) : [],
                    finalSourceKeys: Object.keys(guideResponse || {})
                });

                // 정규화 함수에 위임
                const normalizedGuideData = normalizeGuideData(guideResponse, locationName);
                setGuideData(normalizedGuideData);
                setSource('generated');

                // 히스토리 저장
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
                        console.warn('Supabase save failed:', supabaseError);
                    }
                }

                console.log('✅ Guide loading/generation completed');

            } catch (err) {
                console.error('❌ Guide loading/generation failed:', err);
                const errorMessage = t('errors.unknownError');
                setError(err instanceof Error ? err.message : (Array.isArray(errorMessage) ? errorMessage[0] : errorMessage));
            } finally {
                setIsLoading(false);
            }
        }

        loadOrGenerateGuide();
    }, [locationName, currentLanguage, session]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <GuideLoading 
                    type="generating"
                    message={`"${locationName}" ${t('guide.preparing')}`}
                    subMessage={t('guide.generating')}
                    showProgress={true}
                />
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
                        <h2 className="text-xl font-medium text-gray-900 mb-2">{t('common.error')}</h2>
                        <p className="text-gray-600 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            {t('buttons.goHome')}
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
                        <h2 className="text-xl font-medium text-gray-900 mb-2">{t('guide.notFound')}</h2>
                        <p className="text-gray-600 text-sm mb-4">{t('guide.cannotLoad')}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            {t('buttons.goHome')}
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
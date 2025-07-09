"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GuideData, RealTimeGuide, GuideOverview, GuideMetadata } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';
import { REALTIME_GUIDE_KEYS } from '@/lib/ai/prompts';
import TourContent from './tour/components/TourContent';
import { guideHistory } from '@/lib/cache/localStorage';
import { saveGuideHistoryToSupabase } from '@/lib/supabaseGuideHistory';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/guide';
import { normalizeString } from '@/lib/utils';

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
    const realTimeGuideKeyOptions = REALTIME_GUIDE_KEYS[langKey] || ['RealTimeGuide', 'realTimeGuide', '실시간가이드'];
    
    let realTimeGuide: RealTimeGuide | undefined;
    for (const key of realTimeGuideKeyOptions) {
        if (contentSource[key]) {
            realTimeGuide = contentSource[key];
            break;
        }
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
    // Only validate the most critical part of the guide data to prevent full page crash
    // The component can handle missing route or chapters gracefully.
    const { overview } = content;
    return !!(overview && overview.title);
}

export default function GuideClient({ locationName, initialGuide }: { locationName: string, initialGuide: any }) {
    const router = useRouter();
    const { currentLanguage } = useLanguage();
    const { data: session } = useSession();

    const [guideData, setGuideData] = useState<GuideData | null>(() => extractGuideData(initialGuide, currentLanguage));
    const [isLoading, setIsLoading] = useState(!validateGuideContent(guideData));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (validateGuideContent(guideData)) return;

        const fetchGuide = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1. 먼저 DB에서 가이드 조회
                const checkRes = await fetch('/api/node/ai/get-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        locationName: normalizeString(locationName), 
                        language: normalizeString(currentLanguage)
                    }),
                });
                const checkData = await checkRes.json();

                let extracted: GuideData | null = null;
                if (checkData && (checkData.content || checkData.data)) {
                    // DB에서 성공적으로 불러온 경우
                    extracted = extractGuideData(checkData.content || checkData.data, currentLanguage);
                } else {
                    // 2. 없으면 새로 생성
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
                    if (!result.success && !result.content && !result.data) {
                        throw new Error(result.error || 'Failed to generate guide.');
                    }
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">{locationName}</h2>
                    <p className="text-slate-600">AI 가이드를 생성하고 있습니다...</p>
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

    if (guideData) {
        return (
            <TourContent guideContent={guideData} />
        );
    }
    
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
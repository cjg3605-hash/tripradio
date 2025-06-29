'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, MapPin, Play, Pause, Volume2, StopCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { getBestOfficialPlace } from '@/lib/ai/officialData';
import { useTranslation } from 'next-i18next';

// 🔥 강력한 디버깅: 컴포넌트 로드 확인
console.log('🚀 TourContent 컴포넌트 파일 로드됨!');

interface Chapter {
  id: number;
  title: string;
  sceneDescription: string;
  narrativeLayers: {
    coreNarrative: string;
    architectureDeepDive: string;
    humanStories: string;
    sensoryBehindTheScenes: string;
  };
  nextDirection?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  realTimeScript: string;
}

interface Step {
  step: number;
  location: string;
  title: string;
}

interface Overview {
  title: string;
  narrativeTheme?: string;
  keyFacts?: string[];
  visitInfo?: {
    duration?: number;
    difficulty?: string;
    season?: string;
  };
}

interface TourData {
  content: {
    overview: Overview;
    route: { steps: Step[] };
    realTimeGuide: { chapters: Chapter[] };
    personalizedNote?: string;
  };
  metadata: {
    originalLocationName: string;
  };
}

interface TourContentProps {
  locationName: string;
  userProfile?: any;
  offlineData?: {
    overview: Overview;
    route: { steps: Step[] };
    realTimeGuide: { chapters: Chapter[] };
  };
}

const MapWithRoute = dynamic(() => import('@/components/guide/MapWithRoute'), { ssr: false });

const ICONS = {
  PLAY: <Play className="w-7 h-7" />,
  STOP: <StopCircle className="w-7 h-7" />,
};

export default function TourContent({ locationName, userProfile, offlineData }: TourContentProps) {
  const { t } = useTranslation('guide');
  // 🔥 강력한 디버깅: 컴포넌트 시작
  console.log('🎬 TourContent 컴포넌트 렌더링 시작!', { locationName, userProfile });
  
  const [tourData, setTourData] = useState<TourData | null>(offlineData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [officialPlace, setOfficialPlace] = useState<any>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(null);
  
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ttsRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [patchedChapters, setPatchedChapters] = useState<Chapter[]>([]);
  const [patchedSteps, setPatchedSteps] = useState<Step[]>([]);

  const getCacheKey = () => {
    // locationName + userProfile(문자열화) 조합으로 고유 키 생성
    const profileStr = userProfile ? JSON.stringify(userProfile) : '';
    return `guide-cache:${locationName}:${profileStr}`;
  };

  const loadTourData = async (forceRegenerate = false) => {
    console.log('🚀 loadTourData 함수 시작!', { locationName });
    setIsLoading(true);
    setError(null);
    const cacheKey = getCacheKey();
    if (!forceRegenerate) {
      // 1. localStorage 캐시 우선 조회
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setTourData(parsed);
          setIsLoading(false);
          console.log('✅ localStorage 캐시 사용');
          return;
        }
      } catch (e) {
        console.warn('❌ localStorage 캐시 파싱 실패', e);
      }
    }
    try {
      const defaultProfile = {
        interests: ['문화', '역사'],
        knowledgeLevel: '중급',
        ageGroup: '30대',
        preferredStyle: '친근함',
        ...userProfile
      };
      const response = await fetch('/api/ai/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName,
          userProfile: defaultProfile,
          forceRegenerate
        })
      });
      const result = await response.json();
      if (
        result.success &&
        (
          result.data?.content?.realTimeGuide?.chapters?.length > 0 ||
          result.data?.data?.realTimeGuide?.chapters?.length > 0
        )
      ) {
        setTourData(result.data);
        // 2. localStorage에 캐시 저장
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result.data));
        } catch (e) {
          console.warn('❌ localStorage 캐시 저장 실패', e);
        }
      } else {
        setError(result.error || '실시간 가이드 생성에 실패했습니다.');
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (offlineData) {
      setTourData(offlineData);
      setIsLoading(false);
      return;
    }
    if (locationName) {
      loadTourData(false); // 기본은 캐시 우선
    }
  }, [locationName, offlineData]);

  useEffect(() => {
    // 공식 데이터셋에서 명소 좌표/POI 조회
    getBestOfficialPlace(locationName).then(setOfficialPlace).catch(() => setOfficialPlace(null));
  }, [locationName]);

  // 스크롤 위치에 따라 활성 챕터 업데이트
  useEffect(() => {
    const handleScroll = () => {
      if (!chapterRefs.current.length) return;

      const scrollPosition = window.scrollY + 200; // 헤더 높이 고려
      
      for (let i = chapterRefs.current.length - 1; i >= 0; i--) {
        const element = chapterRefs.current[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveChapter(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tourData]);

  // 안전한 fallback: 원본 chapters/steps
  const originalChapters = tourData?.content?.realTimeGuide?.chapters || [];
  const originalSteps = tourData?.content?.route?.steps || [];

  useEffect(() => {
    async function fetchAndPatchChaptersAndSteps() {
      if (!tourData?.content) return;
      try {
        // 챕터 보정
        const chapters = tourData.content.realTimeGuide.chapters;
        const patchedCh = await Promise.all(chapters.map(async (ch) => {
          try {
            const poi = await getBestOfficialPlace(ch.title) || await getBestOfficialPlace(ch.location);
            if (poi?.geometry?.location) {
              return { ...ch, coordinates: { lat: poi.geometry.location.lat, lng: poi.geometry.location.lng } };
            }
            return ch;
          } catch {
            return ch;
          }
        }));
        setPatchedChapters(patchedCh);
        // 스텝 보정
        const steps = tourData.content.route.steps;
        const patchedSt = await Promise.all(steps.map(async (st) => {
          try {
            const poi = await getBestOfficialPlace(st.title) || await getBestOfficialPlace(st.location);
            if (poi?.geometry?.location) {
              return { ...st, coordinates: { lat: poi.geometry.location.lat, lng: poi.geometry.location.lng } };
            }
            return st;
          } catch {
            return st;
          }
        }));
        setPatchedSteps(patchedSt);
      } catch (e) {
        setPatchedChapters(originalChapters);
        setPatchedSteps(originalSteps);
      }
    }
    fetchAndPatchChaptersAndSteps();
  }, [tourData]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadTourData(true); // 강제 재생성
    setIsRetrying(false);
  };

  const scrollToChapter = (index: number) => {
    const element = chapterRefs.current[index];
    if (element) {
      const headerHeight = 120; // 헤더 높이
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // 실제 오디오 재생 기능은 별도 구현
  };

  // TTS 핸들러
  const handlePlayStop = (chapterId: number, script: string, idx: number) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      if (currentlyPlayingId === chapterId) {
        setCurrentlyPlayingId(null);
        return;
      }
    }
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = 'en-US';
    utterance.onstart = () => setCurrentlyPlayingId(chapterId);
    utterance.onend = () => { setCurrentlyPlayingId(null); setCurrentUtterance(null); };
    utterance.onerror = () => { setCurrentlyPlayingId(null); setCurrentUtterance(null); };
    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            실시간 가이드 준비 중...
          </h2>
          <p className="text-gray-600">
            {locationName}의 특별한 이야기를 생성하고 있습니다
          </p>
        </div>
      </div>
    );
  }

  if (error || !tourData?.content?.realTimeGuide?.chapters?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            실시간 가이드를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            {error || '콘텐츠가 없습니다. 다시 시도해주세요.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              {isRetrying ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  다시 생성 중...
                </div>
              ) : (
                '다시 시도'
              )}
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chapters = tourData.content.realTimeGuide.chapters;
  const totalChapters = chapters.length;

  // 디버깅 로그
  console.log('🎬 렌더링 상태:', {
    isLoading,
    error,
    tourData: !!tourData,
    chaptersLength: chapters?.length,
    locationName
  });
  // 지도 마커 디버깅: 각 챕터의 좌표값 확인
  console.log('지도 마커 디버깅:', chapters.map(c => ({ title: c.title, lat: c.lat, lng: c.lng, latitude: c.latitude, longitude: c.longitude, coordinates: c.coordinates })));

  // 시작 위치 정보를 파싱하는 함수
  const parseStartDirection = (direction: string) => {
    const startMatch = direction.match(/📍 시작 위치: (.*?)\n/);
    const confirmMatch = direction.match(/🎯 도착 확인: (.*?)\n/);
    const guideMatch = direction.match(/▶️ 가이드 시작: (.*)/);
    
    if (startMatch && confirmMatch && guideMatch) {
      return {
        isStart: true,
        start: startMatch[1],
        confirm: confirmMatch[1],
        guide: guideMatch[1]
      };
    }
    return { isStart: false, fullText: direction };
  };

  // 텍스트에 자동 줄바꿈을 추가하는 함수
  const addLineBreaks = (text: string | undefined | null) => {
    if (!text) return '';
    
    // 1. AI가 생성한 \\n (백슬래시 두 개 + n)을 실제 줄바꿈으로 변환
    let processedText = text.replace(/\\n/g, '\n');
    
    // 2. 이미 실제 줄바꿈(\n)이 있으면 그대로 반환
    if (processedText.includes('\n')) {
      return processedText;
    }
    
    // 3. 줄바꿈이 없는 경우에만 자동 줄바꿈 추가
    // 문장 단위로 분리 (. ! ? 뒤에 공백이 있는 경우)
    return processedText
      .replace(/([.!?])\s+/g, '$1\n')
      .replace(/([.!?])$/g, '$1')
      .trim();
  };

  // 데이터 접근 경로를 유연하게 처리 (content, data, tourData 자체)
  const content = tourData?.content || tourData?.data || tourData;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{tourData.content.overview.title || locationName}</h1>
          {tourData.content.overview.narrativeTheme && <p className="mt-2 text-lg text-slate-600">{tourData.content.overview.narrativeTheme}</p>}
        </header>

        {/* 추천 동선 */}
        {(patchedSteps?.length > 0 ? patchedSteps : originalSteps).length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-xl shadow p-5 mb-4 border border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('route')}</h2>
              <ol className="list-decimal ml-6 space-y-1">
                {(patchedSteps?.length > 0 ? patchedSteps : originalSteps).map((step, idx) => (
                  <li key={idx} className="pl-2">
                    <span className="font-bold">{step.title}</span>
                    {step.location && <span className="text-slate-500"> - {step.location}</span>}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* 지도/동선 */}
        {(patchedChapters?.length > 0 ? patchedChapters : originalChapters).length > 0 && (
          <section className="mb-8">
            <MapWithRoute chapters={patchedChapters?.length > 0 ? patchedChapters : originalChapters} />
          </section>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: 실시간 오디오 가이드 */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">{t('realTimeGuide')}</h2>
            <div className="space-y-6">
              {(patchedChapters?.length > 0 ? patchedChapters : originalChapters).map((chapter, idx) => (
                <div key={chapter.id} className="bg-white rounded-xl shadow card border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-xl">{chapter.id}</div>
                        <div><h3 className="text-xl font-bold text-slate-900">{chapter.title}</h3></div>
                      </div>
                      <button
                        ref={el => ttsRefs.current[idx] = el}
                        className={`tts-button text-slate-400 hover:text-sky-500 transition-colors ml-2`}
                        aria-label={t('play_chapter', { id: chapter.id })}
                        onClick={() => handlePlayStop(chapter.id, chapter.realTimeScript, idx)}
                      >
                        {currentlyPlayingId === chapter.id ? ICONS.STOP : ICONS.PLAY}
                      </button>
                    </div>
                  </div>
                  <div className="px-5 pb-6 text-slate-600 leading-relaxed space-y-4">
                    {chapter.realTimeScript.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                  {chapter.coordinates && (
                    <div className="px-5 pb-3 text-xs text-slate-400">{t('location', '위치')}: {chapter.coordinates.lat}, {chapter.coordinates.lng}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: 투어 개요/핵심 정보 */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow card border border-gray-200">
              <div className="p-5">
                <h3 className="text-xl font-bold text-slate-900">{t('overview')}</h3>
              </div>
              <div className="px-5 pb-5 border-b border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>{t('duration')}:</span>
                    <strong className="font-semibold">{tourData.content.overview.visitInfo?.duration ? `${tourData.content.overview.visitInfo.duration}${t('minutes', '분')}` : t('no_info', '정보 없음')}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>{t('difficulty')}:</span>
                    <strong className="font-semibold">{tourData.content.overview.visitInfo?.difficulty || t('no_info', '정보 없음')}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>{t('season')}:</span>
                    <strong className="font-semibold">{tourData.content.overview.visitInfo?.season || t('no_info', '정보 없음')}</strong>
                  </div>
                </div>
              </div>
              {tourData.content.overview.keyFacts && tourData.content.overview.keyFacts.length > 0 && (
                <div className="p-5">
                  <h4 className="font-semibold text-slate-800 mb-3">{t('keyFacts')}</h4>
                  <ul className="space-y-2 list-none">
                    {tourData.content.overview.keyFacts.map((fact, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-2 h-2 bg-sky-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        <span className="text-slate-600 text-sm">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

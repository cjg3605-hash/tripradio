"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, MapPin, Clock, Star, Calendar, Volume2 } from 'lucide-react';
import { GuideData } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTTSLanguage, REALTIME_GUIDE_KEYS } from '@/lib/ai/prompts';
import MapWithRoute from '@/components/guide/MapWithRoute';
import TourContent from './tour/components/TourContent';
import { guideHistory } from '@/lib/cache/localStorage';
import { saveGuideHistoryToSupabase } from '@/lib/supabaseGuideHistory';
import { useSession } from 'next-auth/react';

// GuideData 구조 보정 유틸
const extractGuideData = (raw: any, language: string) => {
  if (!raw) return null;
  const realTimeGuideKey = REALTIME_GUIDE_KEYS[language?.slice(0,2)] || 'RealTimeGuide';
  const realTimeGuide =
    raw[realTimeGuideKey] ||
    raw.realTimeGuide ||
    raw.RealTimeGuide ||
    raw['실시간가이드'] ||
    null;

  if (raw.content && raw.content.overview && raw.content.route && (raw.content[realTimeGuideKey] || raw.content.realTimeGuide || raw.content.RealTimeGuide || raw.content['실시간가이드'])) {
    return {
      ...raw.content,
      realTimeGuide: realTimeGuide || raw.content[realTimeGuideKey] || raw.content.realTimeGuide
    };
  }
  if (raw.content && raw.content.content) {
    const c = raw.content.content;
    return {
      ...c,
      realTimeGuide: c[realTimeGuideKey] || c.realTimeGuide || c.RealTimeGuide || c['실시간가이드'] || realTimeGuide
    };
  }
  if (raw.data && raw.data.content && raw.data.content.overview) {
    const c = raw.data.content;
    return {
      ...c,
      realTimeGuide: c[realTimeGuideKey] || c.realTimeGuide || c.RealTimeGuide || c['실시간가이드'] || realTimeGuide
    };
  }
  if (raw.data && raw.data.content && raw.data.content.content) {
    const c = raw.data.content.content;
    return {
      ...c,
      realTimeGuide: c[realTimeGuideKey] || c.realTimeGuide || c.RealTimeGuide || c['실시간가이드'] || realTimeGuide
    };
  }
  if (raw.data && raw.data.overview) {
    const c = raw.data;
    return {
      ...c,
      realTimeGuide: c[realTimeGuideKey] || c.realTimeGuide || c.RealTimeGuide || c['실시간가이드'] || realTimeGuide
    };
  }
  if (raw.overview && raw.route && (raw[realTimeGuideKey] || raw.realTimeGuide || raw.RealTimeGuide || raw['실시간가이드'])) {
    return {
      ...raw,
      realTimeGuide: realTimeGuide || raw[realTimeGuideKey] || raw.realTimeGuide
    };
  }
  return null;
};

const normalizeString = (s: string) => decodeURIComponent(s || '').trim().toLowerCase();

export default function GuideClient({ locationName, initialGuide }: { locationName: string, initialGuide: any }) {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const { data: session } = useSession();
  const [guideData, setGuideData] = useState<GuideData | null>(extractGuideData(initialGuide, currentLanguage) || null);
  const [isLoading, setIsLoading] = useState(!initialGuide);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('로딩 중...');
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentlyPlayingButton, setCurrentlyPlayingButton] = useState<string | null>(null);
  const normLocation = normalizeString(locationName);
  const normLang = normalizeString(currentLanguage);

  // 언어별 로딩 메시지
  const getLoadingMessages = () => {
    const messages = {
      ko: ['로딩 중...', '가이드 생성 중...', '맞춤형 투어 준비 중...', '거의 완료되었습니다...'],
      en: ['Loading...', 'Generating guide...', 'Preparing personalized tour...', 'Almost ready...'],
      ja: ['読み込み中...', 'ガイド生成中...', 'パーソナライズツアー準備中...', 'もうすぐ完了...'],
      zh: ['加载中...', '生成导览中...', '准备个性化旅游...', '即将完成...'],
      es: ['Cargando...', 'Generando guía...', 'Preparando tour personalizado...', 'Casi listo...']
    };
    return messages[currentLanguage as keyof typeof messages] || messages.ko;
  };

  // TTS 재생/정지 핸들러
  const handlePlayStop = (chapterId: string, script: string) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      if (currentlyPlayingButton === chapterId) {
        setCurrentlyPlayingButton(null);
        return;
      }
    }
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = getTTSLanguage(currentLanguage);
    const voiceSettings = {
      ko: { rate: 0.9, pitch: 1.0 },
      en: { rate: 0.95, pitch: 1.0 },
      ja: { rate: 0.85, pitch: 1.1 },
      zh: { rate: 0.9, pitch: 1.0 },
      es: { rate: 0.9, pitch: 1.0 }
    };
    const settings = voiceSettings[currentLanguage as keyof typeof voiceSettings] || voiceSettings.ko;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.onstart = () => setCurrentlyPlayingButton(chapterId);
    utterance.onend = () => { setCurrentlyPlayingButton(null); setCurrentUtterance(null); };
    utterance.onerror = () => { setCurrentlyPlayingButton(null); setCurrentUtterance(null); };
    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  // 페이지 언로드 시 TTS 정지
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (speechSynthesis.speaking) speechSynthesis.cancel();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (speechSynthesis.speaking) speechSynthesis.cancel();
    };
  }, []);

  // 언어 변경 시 새로운 가이드 로드 (initialGuide 없을 때만 fetch)
  useEffect(() => {
    if (guideData) return;
    if (!locationName || !currentLanguage) return;
    setIsLoading(true);
    setError(null);
    fetch('/api/node/ai/generate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationName: normLocation, language: normLang }),
    })
      .then(res => res.json())
      .then(result => {
        console.log('API result:', result);
        const extracted = extractGuideData(result.data, currentLanguage);
        if (result.success && extracted) {
          setGuideData(extracted);
          if (session?.user?.id) {
            saveGuideHistoryToSupabase(session.user, locationName, extracted, null);
          } else {
            guideHistory.saveGuide(locationName, extracted, null);
          }
          console.log('setGuideData 완료:', extracted);
        } else {
          setError(result.error || '가이드 생성에 실패했습니다.');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [locationName, currentLanguage, guideData]);

  // 로딩 메시지 애니메이션
  useEffect(() => {
    if (!isLoading) return;
    const messages = getLoadingMessages();
    let messageIndex = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading, currentLanguage]);

  // 데이터 접근 경로를 유연하게 처리 - API 응답 구조에 맞게 개선
  const content = guideData;
  const realTimeGuideKey = REALTIME_GUIDE_KEYS[currentLanguage?.slice(0,2)] || 'RealTimeGuide';
  const realTimeGuide = content?.[realTimeGuideKey] || content?.realTimeGuide || content?.RealTimeGuide || content?.['실시간가이드'] || null;
  // 필수 필드 체크
  const isContentValid = content && content.overview && content.route && realTimeGuide;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">{locationName}</h2>
          <p className="text-slate-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && !error && !isContentValid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">가이드 데이터가 올바르지 않습니다</h2>
          <p className="text-slate-600 mb-4">가이드 데이터 구조가 잘못되었거나, 필수 정보가 누락되었습니다.<br/>관리자에게 문의해 주세요.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && !error && isContentValid) {
    return (
      <TourContent
        locationName={locationName}
        userProfile={null}
        initialGuide={initialGuide}
        offlineData={{
          content: content,
          metadata: { originalLocationName: locationName }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 📱 모바일 최적화 Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 px-3 sm:px-4 py-3 flex items-center sticky top-0 z-40">
        <button
          onClick={() => router.push('/')}
          className="mr-2 sm:mr-3 p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="홈으로 돌아가기"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
            {content?.overview?.title || locationName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">AI 맞춤 가이드</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{content?.overview?.title || locationName}</h1>
          <p className="mt-2 text-lg text-slate-600">{content?.overview?.narrativeTheme}</p>
        </header>

        {/* 추천 동선 */}
        {content?.route?.steps?.length > 0 && (
          <section className="mb-8">
            <div className="card bg-white rounded-xl shadow p-5 mb-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">추천 동선</h2>
              <ol className="list-decimal ml-6 space-y-1">
                {content.route.steps.map((step, idx) => (
                  <li key={idx}>
                    <span className="font-bold">{step.title}</span>
                    {step.location && <> - <span className="text-slate-500">{step.location}</span></>}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* 🗺️ 지도/동선: 추천 동선과 실시간 오디오 가이드 사이 */}
        {realTimeGuide?.chapters?.length > 0 && (
          <section className="mb-8">
            <MapWithRoute chapters={realTimeGuide.chapters} />
          </section>
        )}

        {/* 실시간 오디오 가이드 */}
        {realTimeGuide?.chapters?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-2">실시간 오디오 가이드</h2>
            <ol className="space-y-4">
              {realTimeGuide.chapters.map((ch, idx) => (
                <li key={idx} className="card bg-white rounded-xl shadow p-5 mb-4">
                  <div className="font-bold">{ch.title}</div>
                  <div className="text-slate-600 whitespace-pre-line">{ch.realTimeScript}</div>
                  {ch.coordinates && (
                    <div className="text-xs text-slate-400 mt-1">
                      위치: {ch.coordinates.lat}, {ch.coordinates.lng}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
} 
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, MapPin, Clock, Star, Calendar, Volume2 } from 'lucide-react';
import { GuideData } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTTSLanguage } from '@/lib/ai/prompts';
import MapWithRoute from '@/components/guide/MapWithRoute';

export default function GuideClient({ locationName, initialGuide }: { locationName: string, initialGuide: any }) {
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  const [guideData, setGuideData] = useState<GuideData | null>(initialGuide || null);
  const [isLoading, setIsLoading] = useState(!initialGuide);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('로딩 중...');
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentlyPlayingButton, setCurrentlyPlayingButton] = useState<string | null>(null);

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
      body: JSON.stringify({ locationName, language: currentLanguage }),
    })
      .then(res => res.json())
      .then(result => {
        console.log('API result:', result);
        console.log('API result.data:', result.data);
        if (result.success) setGuideData(result.data);
        else setError(result.error || '가이드 생성에 실패했습니다.');
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

  // 데이터 접근 경로를 유연하게 처리 (data, content, 또는 guideData 자체)
  const content = guideData?.data || guideData?.content || guideData;

  // 필수 필드 체크
  const isContentValid = content && content.overview && content.route && content.realTimeGuide;

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

      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* 📱 모바일 최적화 Title Section */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-2 leading-tight">
            {content?.overview?.title || locationName}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {content?.overview?.narrativeTheme || '맞춤형 AI 가이드를 준비하고 있습니다...'}
          </p>
        </header>
        {/* ...이하 기존 렌더링 코드 동일 ... */}
        {/* 📱 모바일 최적화 투어 개요, 추천 관람순서, 실시간 오디오 가이드 등 기존 코드 복사 */}
      </div>
    </div>
  );
} 
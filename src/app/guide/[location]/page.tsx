'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Play, Pause, MapPin, Clock, Star, Calendar, Volume2 } from 'lucide-react';
import { GuideData } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTTSLanguage } from '@/lib/ai/prompts';

export default function GuidePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentLanguage, t } = useLanguage();
  
  const [guideData, setGuideData] = useState<GuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('로딩 중...');
  
  // TTS 상태 관리
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentlyPlayingButton, setCurrentlyPlayingButton] = useState<string | null>(null);

  const locationName = decodeURIComponent((params.location as string) || '');

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

  // TTS 재생/정지 핸들러 (언어별 음성 지원)
  const handlePlayStop = (chapterId: string, script: string) => {
    // 현재 재생 중인 음성 정지
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      if (currentlyPlayingButton === chapterId) {
        setCurrentlyPlayingButton(null);
        return;
      }
    }

    // 새로운 음성 재생 (언어별 설정)
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = getTTSLanguage(currentLanguage);
    
    // 언어별 음성 속도 및 톤 조정
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
    
    utterance.onstart = () => {
      setCurrentlyPlayingButton(chapterId);
    };

    utterance.onend = () => {
      setCurrentlyPlayingButton(null);
      setCurrentUtterance(null);
    };
    
    utterance.onerror = () => {
      setCurrentlyPlayingButton(null);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    speechSynthesis.speak(utterance);
  };

  // 페이지 언로드 시 TTS 정지
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // 언어 변경 시 새로운 가이드 로드
  useEffect(() => {
    if (locationName && currentLanguage) {
      loadGuideData();
    }
  }, [locationName, currentLanguage]);

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

  // 가이드 데이터 로드 함수 (언어별)
  const loadGuideData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🌍 가이드 로드 시작 - 장소: ${locationName}, 언어: ${currentLanguage}`);
      
      const response = await fetch('/api/node/ai/generate-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          locationName: locationName,
          language: currentLanguage 
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGuideData(result.data);
        console.log(`✅ 가이드 로드 완료 (${currentLanguage}):`, result.cached === 'file' ? '캐시됨' : '새로 생성됨');
      } else {
        throw new Error(result.error || '가이드 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('가이드 로드 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = guideData?.content;

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
        
        {/* 📱 모바일 최적화 투어 개요 섹션 */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t.guide.overview}</h2>
            </div>
            
            {/* 📱 모바일 최적화 방문 정보 카드 */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-sky-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-sky-500 mr-2" />
                    <span className="text-xs sm:text-sm font-medium text-slate-900">{t.guide.duration}</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600">{content?.overview?.visitInfo?.duration || '약 2-3시간'}</p>
                </div>
                
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="text-xs sm:text-sm font-medium text-slate-900">{t.guide.difficulty}</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600">{content?.overview?.visitInfo?.difficulty || '보통'}</p>
                </div>
                
                <div className="bg-amber-50 p-3 sm:p-4 rounded-lg col-span-2 lg:col-span-1">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-amber-500 mr-2" />
                    <span className="text-xs sm:text-sm font-medium text-slate-900">{t.guide.season}</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600">{content?.overview?.visitInfo?.season || '연중'}</p>
                </div>
              </div>
              
              {/* 📱 모바일 최적화 핵심 정보 */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">{t.guide.keyFacts}</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {content?.overview?.keyFacts?.map((fact, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-sky-500 mr-2 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base text-slate-600">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 📱 모바일 최적화 추천 관람순서 */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t.guide.route}</h2>
            </div>
            <div className="p-4 sm:p-5">
              <div className="space-y-3 sm:space-y-4">
                {content?.route?.steps?.map((step, index) => (
                  <div key={index} className="flex items-center p-3 sm:p-4 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3 sm:mr-4 flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 text-sm sm:text-base">{step.location}</h3>
                      {step.title && <p className="text-xs sm:text-sm text-slate-600 mt-1">{step.title}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 📱 모바일 최적화 실시간 오디오 가이드 */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t.guide.realTimeGuide}</h2>
            </div>
            
            {/* 📍 시작 위치 정보 */}
            {content?.realTimeGuide?.startingLocation && (
              <div className="p-4 sm:p-5 bg-blue-50 border-b border-slate-100">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      📍 {content.realTimeGuide.startingLocation.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {content.realTimeGuide.startingLocation.address}
                    </p>
                                         <a
                       href={content.realTimeGuide.startingLocation.googleMapsUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                     >
                       <MapPin className="w-4 h-4 mr-2" />
                       {t.guide.viewOnGoogleMaps}
                     </a>
                  </div>
                </div>
              </div>
            )}
            
            <div className="divide-y divide-slate-100">
              {content?.realTimeGuide?.chapters?.map((chapter, index) => (
                <div key={chapter.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 flex-1 pr-2">
                      {chapter.title}
                    </h3>
                    <button
                      onClick={() => handlePlayStop(`chapter-${chapter.id}`, chapter.realTimeScript)}
                      className="flex items-center px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex-shrink-0"
                    >
                      {currentlyPlayingButton === `chapter-${chapter.id}` ? (
                        <Pause className="w-4 h-4 mr-1" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      <span className="text-sm">
                        {currentlyPlayingButton === `chapter-${chapter.id}` ? t.guide.pause : t.guide.play}
                      </span>
                    </button>
                  </div>
                  <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed">
                    {chapter.realTimeScript.split('\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-3 sm:mb-4 text-slate-600">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 
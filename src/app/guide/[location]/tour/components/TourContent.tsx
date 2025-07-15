'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GuideData } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';

interface TourContentProps {
  guideContent: GuideData;
}

const ICONS = {
  BACK: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  PLAY: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  PAUSE: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  EXPAND: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  COLLAPSE: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  LOADING: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
};

const TourContent: React.FC<TourContentProps> = ({ guideContent }) => {
  const { currentLanguage, t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [currentPlayingChapter, setCurrentPlayingChapter] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsLoading, setIsTtsLoading] = useState<number | null>(null);

  const overview = guideContent?.overview;
  const route = guideContent?.route;
  const chapters = guideContent?.realTimeGuide?.chapters || [];

  const handlePlayChapterTTS = useCallback(async (index: number) => {
    try {
      console.log(`🎵 TTS 재생 요청: 챕터 ${index}`);
      
      // 현재 재생 중인 챕터와 같은 챕터의 재생 버튼을 클릭한 경우
      if (currentPlayingChapter === index && isPlaying) {
        console.log('🔄 현재 재생 중인 챕터 일시정지');
        audioRef.current?.pause();
        return;
      }

      // 다른 오디오가 재생 중이면 정지
      if (audioRef.current && !audioRef.current.paused) {
        console.log('🔄 기존 오디오 정지');
        audioRef.current.pause();
      }

      setCurrentPlayingChapter(index);
      setIsTtsLoading(index);

      const chapter = chapters[index];
      if (!chapter) {
        console.error('❌ 챕터를 찾을 수 없음:', index);
        setIsTtsLoading(null);
        return;
      }

      // 챕터 텍스트 구성 (연속된 오디오 스크립트)
      const textToSpeak = [
        chapter.title,
        chapter.sceneDescription,
        chapter.coreNarrative,
        chapter.humanStories,
        chapter.nextDirection,
        chapter.architectureDeepDive,
        chapter.sensoryBehindTheScenes
      ].filter(Boolean).join(' ');

      if (!textToSpeak.trim()) {
        console.error('❌ 재생할 텍스트 없음');
        alert('재생할 내용이 없습니다.');
        setIsTtsLoading(null);
        setCurrentPlayingChapter(null);
        return;
      }

      console.log('🔄 TTS API 호출 중...');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: currentLanguage,
          guideId: guideContent.metadata?.originalLocationName || 'default',
          chapterId: chapter.id || index
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // TTS 서비스 비활성화 상태 처리
        if (response.status === 503 && errorData.code === 'TTS_DISABLED') {
          alert('🔊 음성 서비스가 현재 점검 중입니다.\n\n💡 대안: 화면의 텍스트 내용을 읽어보세요!');
          setIsTtsLoading(null);
          setCurrentPlayingChapter(null);
          return;
        }
        
        throw new Error(errorData.error || `TTS 생성에 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.success || !data.url) {
        throw new Error('TTS URL을 받지 못했습니다.');
      }

      console.log('✅ TTS URL 받음:', data.url);

      // 오디오 요소가 존재하는지 확인
      if (!audioRef.current) {
        console.error('❌ 오디오 요소가 존재하지 않습니다.');
        setIsTtsLoading(null);
        setCurrentPlayingChapter(null);
        return;
      }

      const audio = audioRef.current;
      
      // 기존 이벤트 리스너 제거 함수
      const removeExistingListeners = () => {
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };

      // 오디오 로드 성공 시 재생 함수
      const handleLoadedData = async () => {
        console.log('✅ 오디오 로드 완료');
        try {
          await audio.play();
          setIsTtsLoading(null);
          console.log('✅ 오디오 재생 시작');
        } catch (playError) {
          console.error('❌ 오디오 재생 오류:', playError);
          handleAudioPlayError(playError);
        }
        removeExistingListeners();
      };

      // 오디오 재생 가능 상태 확인
      const handleCanPlay = async () => {
        console.log('✅ 오디오 재생 준비 완료');
        try {
          await audio.play();
          setIsTtsLoading(null);
          console.log('✅ 오디오 재생 시작');
        } catch (playError) {
          console.error('❌ 오디오 재생 오류:', playError);
          handleAudioPlayError(playError);
        }
        removeExistingListeners();
      };

      // 오디오 로드 오류 처리
      const handleError = (errorEvent: Event) => {
        console.error('❌ 오디오 로드 오류:', errorEvent);
        alert('오디오 파일을 불러오는데 실패했습니다. 다시 시도해주세요.');
        setIsTtsLoading(null);
        setCurrentPlayingChapter(null);
        removeExistingListeners();
      };

      // 오디오 재생 오류 처리 함수
      const handleAudioPlayError = (error: any) => {
        setIsTtsLoading(null);
        setCurrentPlayingChapter(null);
        
        if (error.name === 'NotAllowedError') {
          alert('브라우저에서 자동 재생이 차단되었습니다. 재생 버튼을 다시 클릭해주세요.');
        } else if (error.name === 'NotSupportedError') {
          alert('이 브라우저에서는 해당 오디오 형식을 지원하지 않습니다.');
        } else {
          alert('오디오 재생에 실패했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        }
      };

      // 기존 리스너 정리
      removeExistingListeners();

      // 새로운 이벤트 리스너 등록
      audio.addEventListener('loadeddata', handleLoadedData, { once: true });
      audio.addEventListener('canplay', handleCanPlay, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      // 오디오 소스 설정 및 로드 시작
      console.log('🔄 오디오 로드 시작...');
      audio.src = data.url;
      audio.load();

      // 타임아웃 설정 (15초 후에도 로드되지 않으면 오류 처리)
      setTimeout(() => {
        if (audio.readyState < 2) { // HAVE_CURRENT_DATA
          console.warn('⏰ 오디오 로드 타임아웃');
          removeExistingListeners();
          alert('오디오 로드 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
          setIsTtsLoading(null);
          setCurrentPlayingChapter(null);
        }
      }, 15000);

    } catch (error) {
      console.error('❌ TTS 전체 오류:', error);
      setIsTtsLoading(null);
      setCurrentPlayingChapter(null);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      // 네트워크 오류 구분
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        alert('🌐 네트워크 연결을 확인하고 다시 시도해주세요.');
      } else {
        alert(`음성 생성에 실패했습니다: ${errorMessage}`);
      }
    }
  }, [chapters, currentPlayingChapter, isPlaying, currentLanguage, guideContent.metadata?.originalLocationName]);

  const handleChapterSelect = useCallback((index: number) => {
    setActiveChapter(prev => (prev === index ? null : index));
  }, []);

  // 오디오 요소 이벤트 리스너 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      console.log('🎵 오디오 재생 시작');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ 오디오 일시정지');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('✅ 오디오 재생 완료');
      setIsPlaying(false);
      setCurrentPlayingChapter(null);
    };

    const handleLoadStart = () => {
      console.log('🔄 오디오 로드 시작');
    };

    const handleWaiting = () => {
      console.log('⏳ 오디오 버퍼링 중');
    };

    const handleStalled = () => {
      console.log('⚠️ 오디오 스톨됨 - 네트워크 문제 가능성');
    };

    const handleTimeUpdate = () => {
      // 재생 진행 상황 추적 (필요시 활용)
    };

    // 이벤트 리스너 등록
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    // 클린업 함수
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="뒤로가기"
          >
            {ICONS.BACK}
          </button>
          <h1 className="text-xl font-semibold text-gray-900 truncate px-2">
            {overview?.title || 'Tour Guide'}
          </h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* 투어 개요 섹션 */}
        {overview && (
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{overview.title}</h2>
            {overview.summary && <p className="text-lg text-gray-600 mb-4">{overview.summary}</p>}
          </section>
        )}

        {/* 추천 관람순서 섹션 */}
        {route?.steps && route.steps.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t.guide.route}</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <ol className="list-decimal list-inside space-y-3">
                {route.steps.map((step) => (
                  <li key={step.step} className="text-gray-800">
                    <span className="font-medium">{step.title}</span>
                    {step.location && <span className="text-gray-600 ml-2">- {step.location}</span>}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* 실시간 오디오 가이드 섹션 */}
        {chapters && chapters.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">{t.guide.realTimeGuide}</h2>
            </div>
            <div className="space-y-4">
              {chapters.map((chapter, index) => {
                const isCurrentlyPlaying = currentPlayingChapter === index && isPlaying;
                const isCurrentlyLoading = ttsLoading === index;
                const isExpanded = activeChapter === index;

                return (
                  <div key={index} className="bg-white rounded-lg shadow">
                    <div className="p-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 flex-1">
                        {chapter.title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        {/* 재생/일시정지 버튼 */}
                        <button
                          onClick={() => handlePlayChapterTTS(index)}
                          disabled={isCurrentlyLoading}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          aria-label={isCurrentlyPlaying ? t.guide.pause : t.guide.play}
                          title={isCurrentlyPlaying ? t.guide.pause : t.guide.play}
                        >
                          {isCurrentlyLoading ? ICONS.LOADING : (isCurrentlyPlaying ? ICONS.PAUSE : ICONS.PLAY)}
                        </button>

                        {/* 펼치기/접기 버튼 */}
                        <button
                          onClick={() => handleChapterSelect(index)}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                          aria-label={isExpanded ? "접기" : "펼치기"}
                          title={isExpanded ? "접기" : "펼치기"}
                        >
                          {isExpanded ? ICONS.COLLAPSE : ICONS.EXPAND}
                        </button>
                      </div>
                    </div>

                    {/* 챕터 상세 내용 (펼쳐졌을 때만 표시) */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                        {/* 연속된 오디오 스크립트로 표시 */}
                        {(chapter.sceneDescription || chapter.coreNarrative || chapter.humanStories) && (
                          <div className="pt-4">
                            <h4 className="font-medium text-gray-900 mb-2">오디오 가이드</h4>
                            <div className="text-gray-700 leading-relaxed space-y-3">
                              {chapter.sceneDescription && (
                                <p>{chapter.sceneDescription}</p>
                              )}
                              {chapter.coreNarrative && (
                                <p>{chapter.coreNarrative}</p>
                              )}
                              {chapter.humanStories && (
                                <p>{chapter.humanStories}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {chapter.architectureDeepDive && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">건축 세부사항</h4>
                            <p className="text-gray-700 leading-relaxed">{chapter.architectureDeepDive}</p>
                          </div>
                        )}
                        {chapter.sensoryBehindTheScenes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">감각적 뒷이야기</h4>
                            <p className="text-gray-700 leading-relaxed">{chapter.sensoryBehindTheScenes}</p>
                          </div>
                        )}
                        {chapter.nextDirection && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <h4 className="font-medium text-blue-900 mb-2">다음 이동 안내</h4>
                            <p className="text-blue-800 leading-relaxed">{chapter.nextDirection}</p>
                          </div>
                        )}
                        
                        {/* 내용이 없는 경우 */}
                        {!(chapter.sceneDescription || chapter.coreNarrative || chapter.humanStories || 
                           chapter.architectureDeepDive || chapter.sensoryBehindTheScenes) && (
                          <div className="pt-4 text-gray-400 italic text-center py-8">
                            챕터 내용을 준비 중입니다...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Fallback: chapters가 부족하거나 없을 때 */}
        {route?.steps && route.steps.length > 0 && (!chapters || chapters.length < route.steps.length) && (
          <section className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                <strong>알림:</strong> 일부 챕터의 상세 가이드가 준비 중입니다. 
                {chapters.length > 0 && `(${chapters.length}/${route.steps.length} 완료)`}
              </p>
            </div>
            <h2 className="text-xl font-semibold mb-4">전체 추천 경로</h2>
            <div className="space-y-4">
              {route.steps.map((step, index) => {
                const hasChapter = chapters && chapters[index];
                return (
                  <div key={step.step || index} className={`bg-white p-4 rounded-lg shadow ${hasChapter ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <p className="text-gray-600 mt-1">{step.location}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${hasChapter ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {hasChapter ? '상세 가이드 있음' : '준비 중'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
      
      {/* 개선된 오디오 요소 */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
        onError={(e) => {
          console.error('❌ 오디오 요소 오류:', e);
        }}
      />
    </div>
  );
};

export default TourContent;
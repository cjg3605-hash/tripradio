'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, RotateCcw, Clock } from 'lucide-react';
import { GuideData } from '@/types/guide';
import { getOrCreateChapterAudio } from '@/lib/tts-gcs';

interface TourContentProps {
  guide: GuideData;
  language: string;
}

interface ChapterAudioState {
  isPlaying: boolean;
  isLoading: boolean;
  audioProgress: number;
  duration: number;
  error: string | null;
}

export default function TourContent({ guide, language }: TourContentProps) {
  console.log('🎵 TourContent 데이터 확인:', {
    hasGuide: !!guide,
    hasRealTimeGuide: !!guide?.realTimeGuide,
    hasChapters: !!guide?.realTimeGuide?.chapters,
    chaptersLength: guide?.realTimeGuide?.chapters?.length || 0,
    chaptersData: guide?.realTimeGuide?.chapters?.slice(0, 2) || [] // 처음 2개만 로그
  });

  const chapters = guide.realTimeGuide?.chapters || [];

  console.log('📚 실제 chapters 배열:', {
    length: chapters.length,
    firstChapter: chapters[0] || null,
    chaptersStructure: chapters.map(c => ({ id: c.id, title: c.title, hasNarrative: !!c.narrative }))
  });

  // 각 챕터별 오디오 상태 관리
  const [chapterStates, setChapterStates] = useState<ChapterAudioState[]>(
    chapters.map(() => ({
      isPlaying: false,
      isLoading: false,
      audioProgress: 0,
      duration: 0,
      error: null
    }))
  );

  // 각 챕터별 오디오 ref
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(
    new Array(chapters.length).fill(null)
  );

  // 챕터에 내용이 있는지 확인하는 헬퍼 함수
  const hasChapterContent = (chapter: any): boolean => {
    if (chapter.narrative && chapter.narrative.trim().length > 0) {
      return true;
    }
    
    // 기존 개별 필드들 확인 (하위 호환성)
    const hasLegacyContent = 
      (chapter.sceneDescription && chapter.sceneDescription.trim().length > 0) ||
      (chapter.coreNarrative && chapter.coreNarrative.trim().length > 0) ||
      (chapter.humanStories && chapter.humanStories.trim().length > 0);
    
    return hasLegacyContent;
  };

  // 챕터 텍스트 추출 헬퍼 함수
  const getChapterText = (chapter: any): string => {
    if (chapter.narrative && chapter.narrative.trim().length > 0) {
      return chapter.narrative.trim();
    }
    
    // 기존 개별 필드들 조합 (하위 호환성)
    const parts: string[] = [];
    if (chapter.sceneDescription && chapter.sceneDescription.trim()) parts.push(chapter.sceneDescription.trim());
    if (chapter.coreNarrative && chapter.coreNarrative.trim()) parts.push(chapter.coreNarrative.trim());
    if (chapter.humanStories && chapter.humanStories.trim()) parts.push(chapter.humanStories.trim());
    if (chapter.nextDirection && chapter.nextDirection.trim()) parts.push(chapter.nextDirection.trim());
    
    return parts.join(' ');
  };

  // 오디오 이벤트 리스너 설정
  useEffect(() => {
    audioRefs.current.forEach((audio, chapterIndex) => {
      if (!audio) return;

      const updateProgress = () => {
        setChapterStates(prev => 
          prev.map((state, index) => 
            index === chapterIndex
              ? { ...state, audioProgress: audio.currentTime, duration: audio.duration || 0 }
              : state
          )
        );
      };

      const handleEnded = () => {
        setChapterStates(prev => 
          prev.map((state, index) => 
            index === chapterIndex
              ? { ...state, isPlaying: false, audioProgress: 0 }
              : state
          )
        );
      };

      const handleError = () => {
        setChapterStates(prev => 
          prev.map((state, index) => 
            index === chapterIndex
              ? { ...state, isPlaying: false, isLoading: false, error: '오디오 재생 중 오류가 발생했습니다.' }
              : state
          )
        );
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadedmetadata', updateProgress);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadedmetadata', updateProgress);
      };
    });
  }, [chapters.length]);

  const handlePlayPause = async (chapterIndex: number) => {
    const audio = audioRefs.current[chapterIndex];
    const currentState = chapterStates[chapterIndex];
    const chapter = chapters[chapterIndex];

    // 챕터 내용 확인
    if (!hasChapterContent(chapter)) {
      setChapterStates(prev => 
        prev.map((state, index) => 
          index === chapterIndex
            ? { ...state, error: '챕터 내용이 아직 생성되지 않았습니다. 잠시 후 다시 시도해주세요.' }
            : state
        )
      );
      return;
    }

    if (currentState.isPlaying) {
      audio?.pause();
      setChapterStates(prev => 
        prev.map((state, index) => 
          index === chapterIndex ? { ...state, isPlaying: false } : state
        )
      );
      return;
    }

    // 다른 오디오 정지
    audioRefs.current.forEach((otherAudio, index) => {
      if (index !== chapterIndex && otherAudio) {
        otherAudio.pause();
      }
    });
    setChapterStates(prev => 
      prev.map((state, index) => 
        index === chapterIndex 
          ? { ...state, isLoading: true, error: null }
          : { ...state, isPlaying: false }
      )
    );

    try {
      if (!audio?.src) {
        const narrativeText = getChapterText(chapter);
        
        if (!narrativeText) {
          throw new Error('챕터 내용이 없습니다.');
        }
        
        console.log('🎤 TTS 텍스트 준비:', {
          chapterIndex,
          textLength: narrativeText.length,
          textPreview: narrativeText.substring(0, 100) + '...'
        });
        
        const guideId = `${guide.metadata?.originalLocationName || 'unknown'}_${chapterIndex}`;
        const audioUrl = await getOrCreateChapterAudio(guideId, chapterIndex, narrativeText, language);
        if (audio) {
          audio.src = audioUrl;
        }
      }

      await audio?.play();
      setChapterStates(prev => 
        prev.map((state, index) => 
          index === chapterIndex
            ? { ...state, isPlaying: true, isLoading: false }
            : state
        )
      );
    } catch (error) {
      console.error('오디오 재생 오류:', error);
      setChapterStates(prev => 
        prev.map((state, index) => 
          index === chapterIndex
            ? { ...state, isPlaying: false, isLoading: false, error: '오디오 재생에 실패했습니다.' }
            : state
        )
      );
    }
  };

  const handleRestart = (chapterIndex: number) => {
    const audio = audioRefs.current[chapterIndex];
    if (audio) {
      audio.currentTime = 0;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (chapters.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">투어 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="mb-6">
        <p className="text-gray-600">각 챕터별로 오디오 가이드를 들으실 수 있습니다.</p>
        <p className="text-gray-500 text-sm mt-1">💡 아직 생성 중인 챕터는 잠시 후 다시 시도해주세요.</p>
      </div>

      {/* 모든 챕터를 스크롤 형태로 표시 */}
      {chapters.map((chapter, chapterIndex) => {
        const hasContent = hasChapterContent(chapter);
        
        return (
          <div key={chapterIndex} className="border-b pb-6 last:border-b-0">
            {/* 오디오 엘리먼트 */}
            <audio 
              ref={el => { audioRefs.current[chapterIndex] = el; }} 
              preload="none" 
            />

            {/* 챕터 제목과 오디오 컨트롤 */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex-1">
                {chapterIndex + 1}. {chapter.title}
                {!hasContent && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    생성 중
                  </span>
                )}
              </h3>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  onClick={() => handlePlayPause(chapterIndex)}
                  disabled={chapterStates[chapterIndex].isLoading || !hasContent}
                  size="sm"
                  variant={hasContent ? "outline" : "ghost"}
                  title={!hasContent ? "챕터 내용이 생성 중입니다" : undefined}
                >
                  {chapterStates[chapterIndex].isLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : chapterStates[chapterIndex].isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                {chapterStates[chapterIndex].duration > 0 && (
                  <Button
                    onClick={() => handleRestart(chapterIndex)}
                    variant="ghost"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 진행률 바 */}
            {chapterStates[chapterIndex].duration > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  <span>{formatTime(chapterStates[chapterIndex].audioProgress)}</span>
                  <span>{formatTime(chapterStates[chapterIndex].duration)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(chapterStates[chapterIndex].audioProgress / chapterStates[chapterIndex].duration) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* 에러 메시지 */}
            {chapterStates[chapterIndex].error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{chapterStates[chapterIndex].error}</p>
              </div>
            )}

            {/* 챕터 내용 */}
            <div className="prose prose-gray max-w-none">
              {hasContent ? (
                /* 실제 챕터 내용 표시 */
                <div className="text-gray-700 leading-relaxed space-y-4">
                  {/* 새로운 narrative 필드 우선 사용 */}
                  {chapter.narrative ? (
                    <div className="whitespace-pre-line">
                      <p className={language === 'ko' ? 'indent-8' : ''}>
                        {chapter.narrative}
                      </p>
                      {chapter.nextDirection && (
                        <p className={`text-blue-600 font-medium mt-4 ${language === 'ko' ? 'indent-8' : ''}`}>
                          {chapter.nextDirection}
                        </p>
                      )}
                    </div>
                  ) : (
                    // 기존 개별 필드들 (하위 호환성)
                    <>
                      {chapter.sceneDescription && (
                        <p className={language === 'ko' ? 'indent-8' : ''}>
                          {chapter.sceneDescription}
                        </p>
                      )}
                      {chapter.coreNarrative && (
                        <p className={language === 'ko' ? 'indent-8' : ''}>
                          {chapter.coreNarrative}
                        </p>
                      )}
                      {chapter.humanStories && (
                        <p className={language === 'ko' ? 'indent-8' : ''}>
                          {chapter.humanStories}
                        </p>
                      )}
                      {chapter.nextDirection && (
                        <p className={`text-blue-600 font-medium ${language === 'ko' ? 'indent-8' : ''}`}>
                          {chapter.nextDirection}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* 빈 챕터 안내 메시지 */
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-yellow-800 font-medium">챕터 내용 생성 중</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        이 챕터의 상세 내용이 AI에 의해 생성되고 있습니다. 잠시만 기다려주세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
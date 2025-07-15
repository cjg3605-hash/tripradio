'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
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
        const chapter = chapters[chapterIndex];
        
        // 실제 데이터 구조에 맞게 텍스트 조합
        let narrativeText = '';
        if (chapter.narrative) {
          narrativeText = chapter.narrative;
        } else {
          // coreNarrative, humanStories, sceneDescription 조합
          const parts: string[] = [];
          if (chapter.sceneDescription) parts.push(chapter.sceneDescription);
          if (chapter.coreNarrative) parts.push(chapter.coreNarrative);
          if (chapter.humanStories) parts.push(chapter.humanStories);
          if (chapter.nextDirection) parts.push(chapter.nextDirection);
          
          narrativeText = parts.join(' ');
        }
        
        if (!narrativeText) {
          throw new Error('챕터 내용이 없습니다.');
        }
        
        console.log('🎤 TTS 텍스트 준비:', {
          chapterIndex,
          textLength: narrativeText.length,
          textPreview: narrativeText.substring(0, 100) + '...'
        });
        
        const guideId = `${guide.metadata.originalLocationName}_${chapterIndex}`;
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
      {/* 실시간 오디오 가이드 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">실시간 오디오 가이드</h2>
        <p className="text-gray-600">각 챕터별로 오디오 가이드를 들으실 수 있습니다.</p>
      </div>

      {/* 모든 챕터를 스크롤 형태로 표시 */}
      {chapters.map((chapter, chapterIndex) => (
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
            </h3>
            
            <div className="flex items-center space-x-2 ml-4">
              <Button
                onClick={() => handlePlayPause(chapterIndex)}
                disabled={chapterStates[chapterIndex].isLoading}
                size="sm"
                variant="outline"
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
            {chapter.sceneDescription && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-blue-600 mb-2">🎬 장면 설명</h4>
                <p className="text-gray-700 leading-relaxed">{chapter.sceneDescription}</p>
              </div>
            )}
            
            {chapter.coreNarrative && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-green-600 mb-2">📖 핵심 이야기</h4>
                <p className="text-gray-700 leading-relaxed">{chapter.coreNarrative}</p>
              </div>
            )}
            
            {chapter.humanStories && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-purple-600 mb-2">👥 인간적인 이야기</h4>
                <p className="text-gray-700 leading-relaxed">{chapter.humanStories}</p>
              </div>
            )}
            
            {chapter.nextDirection && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-orange-600 mb-2">🧭 다음 이동 방향</h4>
                <p className="text-gray-700 leading-relaxed">{chapter.nextDirection}</p>
              </div>
            )}
            
            {/* 기존 narrative 필드도 지원 (하위 호환성) */}
            {chapter.narrative && !chapter.sceneDescription && !chapter.coreNarrative && (
              <p className="text-gray-700 leading-relaxed">{chapter.narrative}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
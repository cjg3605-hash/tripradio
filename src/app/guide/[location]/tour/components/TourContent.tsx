'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, MoreVertical, Bookmark, Menu } from 'lucide-react';
import { GuideData } from '@/types/guide';
import { getOrCreateChapterAudio } from '@/lib/tts-gcs';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
}

const MinimalTourContent = ({ guide, language, chapterRefs = { current: [] } }: TourContentProps) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalChapters = guide.realTimeGuide?.chapters?.length || 0;
  const chapter = guide.realTimeGuide?.chapters?.[currentChapter];

  // 오디오 정리
  const stopAndCleanupAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    const handleJumpToChapter = (event: Event) => {
      const customEvent = event as CustomEvent<{ chapterId: number }>;
      const { chapterId } = customEvent.detail;
      
      setCurrentChapter(chapterId);
      stopAndCleanupAudio();
    };
    
    window.addEventListener('jumpToChapter', handleJumpToChapter as EventListener);
    return () => {
      window.removeEventListener('jumpToChapter', handleJumpToChapter as EventListener);
      stopAndCleanupAudio();
    };
  }, []);

  // TTS 재생 핸들러
  const handlePlayChapter = async () => {
    if (!chapter) return;

    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    if (currentAudio && !isPlaying) {
      currentAudio.play();
      setIsPlaying(true);
      return;
    }

    try {
      // 텍스트 합치기 (narrative 우선, 없으면 개별 필드들 합치기)
      let fullText = '';
      if (chapter.narrative) {
        fullText = chapter.narrative;
      } else {
        const parts = [
          chapter.sceneDescription || '',
          chapter.coreNarrative || '',
          chapter.humanStories || ''
        ].filter(Boolean);
        fullText = parts.join(' ');
      }

      if (chapter.nextDirection) {
        fullText += ' ' + chapter.nextDirection;
      }

      if (!fullText.trim()) {
        console.warn('재생할 텍스트가 없습니다.');
        return;
      }

      const audioUrl = await getOrCreateChapterAudio(
        guide.metadata?.originalLocationName || 'unknown',
        currentChapter,
        fullText,
        language
      );

      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.onerror = (e) => {
        console.error('오디오 재생 오류:', e);
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS 생성/재생 오류:', error);
      setIsPlaying(false);
    }
  };

  // 이전 챕터로 이동
  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      stopAndCleanupAudio();
      setCurrentChapter(currentChapter - 1);
    }
  };

  // 다음 챕터로 이동
  const handleNextChapter = () => {
    if (currentChapter < totalChapters - 1) {
      stopAndCleanupAudio();
      setCurrentChapter(currentChapter + 1);
    }
  };

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">콘텐츠를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const hasContent = chapter.narrative || chapter.sceneDescription || chapter.coreNarrative || chapter.humanStories;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* 뒤로가기 버튼 */}
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          {/* 단계 표시 */}
          <div className="text-sm font-medium text-gray-600">
            Step {currentChapter + 1}/{totalChapters}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bookmark className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 메인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 기하학적 헤더 - NYT 스타일 */}
          <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {/* 기하학적 요소 */}
            <div className="absolute top-4 left-4">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }, (_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-1 rounded-full bg-gray-400 opacity-30"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      opacity: Math.random() > 0.7 ? 0.6 : 0.2 
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* 반원 요소 */}
            <div className="absolute bottom-0 right-8 w-24 h-24 bg-black rounded-full transform translate-y-1/2">
              <div className="absolute inset-2 bg-white rounded-full opacity-20"></div>
            </div>

            {/* 플레이 버튼 */}
            {hasContent && (
              <div className="absolute bottom-4 left-6">
                <button
                  onClick={handlePlayChapter}
                  className="w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="p-8">
            {/* 타이틀 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {chapter.title}
            </h1>

            {/* 메인 콘텐츠 */}
            {hasContent ? (
              <div className="prose prose-lg max-w-none">
                {chapter.narrative ? (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {chapter.narrative}
                  </div>
                ) : (
                  <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
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
                )}

                {/* 다음 이동 안내 */}
                {chapter.nextDirection && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-xl border-l-4 border-black">
                    <h3 className="font-semibold text-gray-900 mb-2">다음 목적지</h3>
                    <p className="text-gray-700">{chapter.nextDirection}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full text-sm text-yellow-800">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  콘텐츠 생성 중...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="mt-8 flex justify-between items-center">
          {/* 이전 버튼 */}
          <button
            onClick={handlePrevChapter}
            disabled={currentChapter === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentChapter === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-white hover:shadow-sm border border-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            이전
          </button>

          {/* 프로그레스 인디케이터 */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalChapters }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  stopAndCleanupAudio();
                  setCurrentChapter(i);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentChapter
                    ? 'bg-black'
                    : i < currentChapter
                    ? 'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={handleNextChapter}
            disabled={currentChapter === totalChapters - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              currentChapter === totalChapters - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            다음
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 챕터 목록 (선택사항) */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">전체 챕터</h2>
          <div className="grid gap-3">
            {guide.realTimeGuide?.chapters?.map((chap, index) => (
              <button
                key={index}
                onClick={() => {
                  stopAndCleanupAudio();
                  setCurrentChapter(index);
                }}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  index === currentChapter
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Step {index + 1}
                    </div>
                    <div className="font-medium text-gray-900">
                      {chap.title}
                    </div>
                  </div>
                  {index === currentChapter && isPlaying && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalTourContent;
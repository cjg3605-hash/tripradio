'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AudioChapter } from '@/types/audio';

interface SimpleAudioPlayerProps {
  chapters: AudioChapter[];
  onChapterChange?: (chapterIndex: number) => void;
  className?: string;
}

const SimpleAudioPlayer: React.FC<SimpleAudioPlayerProps> = ({
  chapters,
  onChapterChange,
  className = ''
}) => {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const currentChapter = chapters[currentChapterIndex];

  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 다음 챕터
  const handleNext = useCallback(() => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setIsPlaying(false);
    }
  }, [currentChapterIndex, chapters.length]);

  // 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleNext]);

  // 챕터 변경 시 오디오 로드
  useEffect(() => {
    if (currentChapter && audioRef.current) {
      // 실제 구현에서는 currentChapter.audioUrl 사용
      // audioRef.current.src = currentChapter.audioUrl;
      audioRef.current.load();
      onChapterChange?.(currentChapterIndex);
    }
  }, [currentChapterIndex, currentChapter, onChapterChange]);

  // 재생/일시정지
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 이전 챕터
  const handlePrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      setIsPlaying(false);
    }
  };

  // 진행률 클릭
  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 볼륨 조절
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // 음소거 토글
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-100 rounded-lg p-4 ${className}`}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* 현재 챕터 정보 */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-900 mb-1">
          {currentChapter?.title || t('audio.audioGuide') || '오디오 가이드'}
        </h3>
        <p className="text-sm text-gray-500">
          {currentChapterIndex + 1} / {chapters.length} 챕터
        </p>
      </div>

      {/* 진행률 바 */}
      <div className="mb-4">
        <div
          className="relative h-2 bg-gray-100 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full bg-black rounded-full"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-between">
        {/* 이전/재생/다음 */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentChapterIndex === 0}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={String(t('audio.previousChapter') || '이전 챕터')}
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
            aria-label={isPlaying ? String(t('audio.pause') || '일시정지') : String(t('audio.play') || '재생')}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentChapterIndex === chapters.length - 1}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={String(t('audio.nextChapter') || '다음 챕터')}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* 볼륨 조절 */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label={isMuted ? String(t('audio.unmute') || '음소거 해제') : String(t('audio.mute') || '음소거')}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #000 0%, #000 ${(isMuted ? 0 : volume) * 100}%, #e5e7eb ${(isMuted ? 0 : volume) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>

      {/* 챕터 리스트 (간단버전) */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => {
                setCurrentChapterIndex(index);
                setIsPlaying(false);
              }}
              className={`flex-shrink-0 px-3 py-2 text-sm rounded-lg transition-colors ${
                index === currentChapterIndex
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {index + 1}. {chapter.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleAudioPlayer;
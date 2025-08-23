'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 아이콘들을 필요한 것만 정적 로딩
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';

// 일단 간단하게 직접 import로 되돌립니다 (SSR 호환성)
import {
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  List
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AudioChapter, PlaybackRate, RepeatMode } from '@/types/audio';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdvancedAudioPlayerProps {
  chapters: AudioChapter[];
  onChapterChange?: (chapterIndex: number) => void;
  onPlaybackEnd?: () => void;
  className?: string;
}

const playbackRates: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

const AdvancedAudioPlayer: React.FC<AdvancedAudioPlayerProps> = ({
  chapters,
  onChapterChange,
  onPlaybackEnd,
  className = ''
}) => {
  const { currentLanguage, t } = useLanguage();
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');

  const {
    audioRef,
    currentChapterIndex,
    currentChapter,
    status,
    currentTime,
    duration,
    volume,
    playbackRate,
    repeatMode,
    shuffleMode,
    bookmarks,
    isMuted,
    buffered,
    togglePlayPause,
    handleNext,
    handlePrevious,
    goToChapter,
    seekTo,
    skipBy,
    setVolume,
    setPlaybackRate,
    setRepeatMode,
    setShuffleMode,
    setIsMuted,
    addBookmark,
    removeBookmark,
    goToBookmark,
    formatTime
  } = useAudioPlayer({
    chapters,
    onChapterChange,
    onPlaybackEnd
  });

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    seekTo(percentage * duration);
  };

  const handleVolumeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    setVolume(newVolume);
  };

  const toggleRepeatMode = () => {
    const modes: RepeatMode[] = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleAddBookmark = () => {
    addBookmark(bookmarkTitle || undefined);
    setBookmarkTitle('');
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat1 className="w-5 h-5" />;
      case 'all':
        return <Repeat className="w-5 h-5" />;
      default:
        return <Repeat className="w-5 h-5 opacity-50" />;
    }
  };

  const chapterBookmarks = bookmarks.filter(b => b.chapterId === currentChapterIndex);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />
      
      {/* Main Player */}
      <div className="p-4">
        {/* Chapter Info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-gray-600">
              {currentChapterIndex + 1}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {currentChapter?.title || t('audio.selectChapter')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('audio.chapter')} {currentChapterIndex + 1} / {chapters.length}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`p-2 rounded-lg transition-colors ${
                showPlaylist ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={String(t('audio.togglePlaylist'))}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`p-2 rounded-lg transition-colors ${
                showBookmarks ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={String(t('audio.toggleBookmarks'))}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={String(t('audio.settings'))}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            {/* Buffered Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-gray-300 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            {/* Current Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-black rounded-full"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
            {/* Hover Indicator */}
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                 style={{ left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%', marginLeft: '-8px' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRepeatMode}
              className={`p-2 rounded-lg transition-colors ${
                repeatMode !== 'none' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={String(t('audio.repeatMode'))}
            >
              {getRepeatIcon()}
            </button>
            <button
              onClick={() => setShuffleMode(!shuffleMode)}
              className={`p-2 rounded-lg transition-colors ${
                shuffleMode ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={String(t('audio.shuffle'))}
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={String(t('audio.previous'))}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => skipBy(-10)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={String(t('audio.rewind10'))}
            >
              <span className="text-xs font-medium">-10</span>
            </button>

            <button
              onClick={togglePlayPause}
              disabled={status === 'loading' || status === 'error'}
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50"
              aria-label={status === 'playing' ? String(t('audio.pause')) : String(t('audio.play'))}
            >
              {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : status === 'playing' ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skipBy(10)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={String(t('audio.forward10'))}
            >
              <span className="text-xs font-medium">+10</span>
            </button>

            <button
              onClick={handleNext}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={String(t('audio.next'))}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={isMuted ? String(t('audio.unmute')) : String(t('audio.mute'))}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div
              className="w-16 h-2 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleVolumeClick}
            >
              <div
                className="h-full bg-black rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Sections */}
      {/* Playlist */}
      {showPlaylist && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <List className="w-4 h-4" />
            {t('audio.playlist')}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                onClick={() => goToChapter(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === currentChapterIndex
                    ? 'bg-gray-100 border border-gray-300'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 w-8">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {chapter.title}
                    </p>
                    {chapter.duration && (
                      <p className="text-xs text-gray-500">
                        {formatTime(chapter.duration)}
                      </p>
                    )}
                  </div>
                  {index === currentChapterIndex && status === 'playing' && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {showBookmarks && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            {t('audio.bookmarks')} ({chapterBookmarks.length})
          </h4>
          
          {/* Add Bookmark */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={bookmarkTitle}
              onChange={(e) => setBookmarkTitle(e.target.value)}
              placeholder={String(t('audio.bookmarkTitle'))}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              onClick={handleAddBookmark}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              {t('audio.addBookmark')}
            </button>
          </div>

          {/* Bookmark List */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {chapterBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => goToBookmark(bookmark)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {bookmark.title}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(bookmark.timestamp)}
                  </p>
                </button>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={String(t('audio.removeBookmark'))}
                >
                  ×
                </button>
              </div>
            ))}
            {chapterBookmarks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('audio.noBookmarks')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('audio.settings')}
          </h4>
          
          <div className="space-y-4">
            {/* Playback Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('audio.playbackSpeed')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      playbackRate === rate
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('audio.volume')}: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === 'error' && (
        <div className="border-t border-gray-200 p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              {t('audio.playbackError')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAudioPlayer;
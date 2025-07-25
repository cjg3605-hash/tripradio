import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioBookmark, PlaylistState, AudioChapter, PlaybackStatus, RepeatMode, PlaybackRate } from '@/types/audio';
import { audioCacheService } from '@/lib/audio-cache';

interface UseAudioPlayerProps {
  chapters: AudioChapter[];
  onChapterChange?: (chapterIndex: number) => void;
  onPlaybackEnd?: () => void;
}

export const useAudioPlayer = ({ chapters, onChapterChange, onPlaybackEnd }: UseAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('navi-audio-volume')) || 1;
    }
    return 1;
  });
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(() => {
    if (typeof window !== 'undefined') {
      return (Number(localStorage.getItem('navi-audio-playback-rate')) || 1) as PlaybackRate;
    }
    return 1;
  });
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('navi-audio-repeat-mode') || 'none') as RepeatMode;
    }
    return 'none';
  });
  const [shuffleMode, setShuffleMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('navi-audio-shuffle') === 'true';
    }
    return false;
  });
  const [bookmarks, setBookmarks] = useState<AudioBookmark[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('navi-audio-bookmarks') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);

  const currentChapter = chapters[currentChapterIndex];

  // LocalStorage 동기화
  useEffect(() => {
    localStorage.setItem('navi-audio-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('navi-audio-playback-rate', playbackRate.toString());
  }, [playbackRate]);

  useEffect(() => {
    localStorage.setItem('navi-audio-repeat-mode', repeatMode);
  }, [repeatMode]);

  useEffect(() => {
    localStorage.setItem('navi-audio-shuffle', shuffleMode.toString());
  }, [shuffleMode]);

  useEffect(() => {
    localStorage.setItem('navi-audio-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // 오디오 이벤트 리스너 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => setStatus('loading');
    const handleCanPlay = () => {
      setDuration(audio.duration || 0);
      if (status === 'loading') setStatus('paused');
    };
    const handlePlay = () => setStatus('playing');
    const handlePause = () => setStatus('paused');
    const handleEnded = () => {
      setStatus('ended');
      handleNext();
    };
    const handleError = () => setStatus('error');
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      updateBuffered();
    };
    const handleVolumeChange = () => {
      setIsMuted(audio.muted);
    };

    const updateBuffered = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        setBuffered((bufferedEnd / audio.duration) * 100);
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('volumechange', handleVolumeChange);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [status]);

  // 오디오 설정 적용
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      audio.muted = isMuted;
    }
  }, [volume, playbackRate, isMuted]);

  // 새 챕터 로드
  const loadChapter = useCallback(async (chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (!chapter || !audioRef.current) return;

    setStatus('loading');
    
    try {
      // TTS 생성 및 캐싱
      const { advancedTTSService } = await import('@/lib/advanced-tts-service');
      
      const ttsResult = await advancedTTSService.generatePersonalityTTS({
        text: chapter.text,
        language: 'ko-KR',
        guide_id: `chapter_${chapter.id}`,
        adaptToMood: true
      });

      if (ttsResult.success && ttsResult.audioData) {
        // Base64를 Blob으로 변환
        const audioBlob = new Blob([
          new Uint8Array(
            atob(ttsResult.audioData)
              .split('')
              .map(char => char.charCodeAt(0))
          )
        ], { type: ttsResult.mimeType || 'audio/mpeg' });

        // 캐싱 및 URL 생성
        const cacheId = `chapter_${chapter.id}`;
        const audioUrl = await audioCacheService.cacheAudio(cacheId, URL.createObjectURL(audioBlob));
        
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      }
    } catch (error) {
      console.error('Failed to load chapter audio:', error);
      setStatus('error');
    }
  }, [chapters]);

  // 챕터 변경
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index);
      loadChapter(index);
      onChapterChange?.(index);
    }
  }, [chapters.length, loadChapter, onChapterChange]);

  // 재생/정지
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (status === 'playing') {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Playback failed:', error);
      setStatus('error');
    }
  }, [status]);

  // 다음 챕터
  const handleNext = useCallback(() => {
    if (repeatMode === 'one') {
      // 현재 챕터 반복
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex = currentChapterIndex + 1;

    if (shuffleMode) {
      // 셔플 모드: 랜덤 챕터
      const availableIndices = chapters
        .map((_, index) => index)
        .filter(index => index !== currentChapterIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    if (nextIndex >= chapters.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setStatus('ended');
        onPlaybackEnd?.();
        return;
      }
    }

    goToChapter(nextIndex);
  }, [currentChapterIndex, chapters.length, repeatMode, shuffleMode, goToChapter, onPlaybackEnd]);

  // 이전 챕터
  const handlePrevious = useCallback(() => {
    let prevIndex = currentChapterIndex - 1;

    if (shuffleMode) {
      // 셔플 모드: 랜덤 챕터
      const availableIndices = chapters
        .map((_, index) => index)
        .filter(index => index !== currentChapterIndex);
      prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }

    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = chapters.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    goToChapter(prevIndex);
  }, [currentChapterIndex, chapters.length, repeatMode, shuffleMode, goToChapter]);

  // 시간 이동
  const seekTo = useCallback((time: number) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [duration]);

  // 상대적 시간 이동
  const skipBy = useCallback((seconds: number) => {
    seekTo(currentTime + seconds);
  }, [currentTime, seekTo]);

  // 북마크 관리
  const addBookmark = useCallback((title?: string, note?: string) => {
    const bookmark: AudioBookmark = {
      id: `${currentChapterIndex}_${currentTime}_${Date.now()}`,
      chapterId: currentChapterIndex,
      timestamp: currentTime,
      title: title || `북마크 ${Math.floor(currentTime)}초`,
      note,
      createdAt: new Date()
    };

    setBookmarks(prev => [...prev, bookmark].sort((a, b) => a.timestamp - b.timestamp));
  }, [currentChapterIndex, currentTime]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  }, []);

  const goToBookmark = useCallback((bookmark: AudioBookmark) => {
    if (bookmark.chapterId !== currentChapterIndex) {
      goToChapter(bookmark.chapterId);
    }
    seekTo(bookmark.timestamp);
  }, [currentChapterIndex, goToChapter, seekTo]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          skipBy(-10);
          break;
        case 'ArrowRight':
          event.preventDefault();
          skipBy(10);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'm':
        case 'M':
          event.preventDefault();
          setIsMuted(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, skipBy]);

  // 초기 챕터 로드
  useEffect(() => {
    if (chapters.length > 0 && audioRef.current) {
      loadChapter(0);
    }
  }, [chapters.length, loadChapter]);

  return {
    // Refs
    audioRef,
    
    // State
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
    
    // Actions
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
    
    // Bookmarks
    addBookmark,
    removeBookmark,
    goToBookmark,
    
    // Utils
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };
};
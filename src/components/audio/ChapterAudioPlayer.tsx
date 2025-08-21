'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Loader2
} from 'lucide-react';
import { AudioChapter } from '@/types/audio';
// TTS는 API를 통해 생성

interface ChapterAudioPlayerProps {
  chapter: AudioChapter;
  className?: string;
  onChapterUpdate?: (updatedChapter: AudioChapter) => void;
  locationName?: string;
  guideId?: string;
  // 🌍 언어별 최적화된 TTS를 위한 언어 정보
  contentLanguage?: string;
  // 🎛️ 오디오 제어 콜백 등록
  onRegisterControls?: (chapterId: string | number, controls: {
    setVolume: (volume: number) => void;
    setPlaybackRate: (rate: number) => void;
    play: () => Promise<void>;
    pause: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
  }) => void;
  // 🔄 실시간 재생 상태 변경 콜백
  onPlayStateChange?: (chapterId: string | number, isPlaying: boolean) => void;
}

const ChapterAudioPlayer: React.FC<ChapterAudioPlayerProps> = ({
  chapter,
  className = '',
  onChapterUpdate,
  locationName = 'guide',
  guideId = 'default',
  contentLanguage,
  onRegisterControls,
  onPlayStateChange
}) => {
  const { t, currentLanguage, currentConfig } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // 🔊 볼륨 변경 함수 노출
  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };
  const [isMuted, setIsMuted] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(chapter.audioUrl || null);

  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      // 상위 컴포넌트에 재생 종료 알림
      if (onPlayStateChange) {
        onPlayStateChange(chapter.id, false);
      }
    };
    const handlePlay = () => {
      setIsPlaying(true);
      // 상위 컴포넌트에 재생 상태 알림
      if (onPlayStateChange) {
        onPlayStateChange(chapter.id, true);
      }
    };
    const handlePause = () => {
      setIsPlaying(false);
      // 상위 컴포넌트에 재생 상태 알림
      if (onPlayStateChange) {
        onPlayStateChange(chapter.id, false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // 재생/일시정지
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    // 🎯 TTS 생성 중이면 무시
    if (isGeneratingTTS) {
      // console.log('🔄 TTS 생성 중이므로 버튼 클릭 무시');
      return;
    }

    // 🎙️ 오디오가 없으면 TLS 생성 후 자동 재생
    if (!audioUrl) {
      console.log('🎙️ 오디오 없음 - TLS 생성 시작');
      await generateTTS();
      return;
    }

    // ▶️ 오디오가 있으면 재생/일시정지
    if (audioUrl && audioRef.current) {
      try {
        if (isPlaying) {
          console.log('⏸️ 오디오 일시정지');
          audioRef.current.pause();
        } else {
          console.log('▶️ 오디오 재생 시작');
          await audioRef.current.play();
        }
        // 상태는 오디오 이벤트 리스너에서 자동으로 업데이트됨
      } catch (error) {
        console.error('❌ 오디오 재생 실패:', error);
        setIsPlaying(false);
        setTtsError('오디오 재생에 실패했습니다. 다시 시도해주세요.');
      }
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

  // 음소거 토글
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  // 🌍 언어별 최적화된 TTS 생성 (Neural2 기반 네이티브 음성)
  const generateTTS = async () => {
    if (!chapter.text || isGeneratingTTS) return;

    setIsGeneratingTTS(true);
    setTtsError(null);

    // 기존 오디오 캐시 정리
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      // 🎯 언어 자동 감지: 우선순위 - contentLanguage > chapter.language > context ttsLang > ko-KR
      const detectedLanguage = contentLanguage || chapter.language || currentConfig.ttsLang || 'ko-KR';
      
      console.log('🌍 언어별 최적화된 TTS 생성 시작:', { 
        chapterId: chapter.id, 
        textLength: chapter.text.length,
        contentLanguage,
        chapterLanguage: chapter.language,
        contextLanguage: currentLanguage,
        contextTtsLang: currentConfig.ttsLang,
        detectedLanguage,
        preview: chapter.text.substring(0, 50) + '...'
      });

      // 🧬 언어별 최적화된 TTS API 호출
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chapter.text,
          language: detectedLanguage,
          quality: 'high' // Neural2 품질 사용
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API 호출 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.audioData) {
        // Base64 데이터를 data URL로 변환
        const audioUrl = `data:${result.mimeType || 'audio/mpeg'};base64,${result.audioData}`;
        setAudioUrl(audioUrl);
        setIsGeneratingTTS(false);
        
        // 상위 컴포넌트에 업데이트된 챕터 정보 전달
        if (onChapterUpdate) {
          onChapterUpdate({
            ...chapter,
            audioUrl: audioUrl,
            isGeneratingTTS: false,
            ttsError: undefined
          });
        }

        console.log('✅ 언어별 최적화된 TTS 생성 완료:', { 
          chapterId: chapter.id,
          audioSize: result.audioData?.length || 0,
          mimeType: result.mimeType,
          language: result.language,
          voiceName: result.voiceName,
          quality: result.quality,
          culturalAdaptation: result.culturalAdaptation,
          requestedLanguage: detectedLanguage
        });

        // 🎵 생성 완료 후 자동 재생
        setTimeout(async () => {
          if (audioRef.current && audioUrl) {
            try {
              console.log('🎵 언어별 최적화된 TTS 생성 완료 - 자동 재생 시작:', {
                language: result.language,
                voice: result.voiceName,
                quality: result.quality
              });
              await audioRef.current.play();
              // 상태는 play 이벤트 리스너에서 자동 업데이트됨
            } catch (error) {
              console.error('❌ 자동 재생 실패:', error);
              setTtsError('자동 재생에 실패했습니다. 재생 버튼을 직접 눌러주세요.');
            }
          }
        }, 200);

        return;
      }

      // 실패시 명확한 에러 메시지
      throw new Error(result.error || '언어별 최적화된 TTS 생성에 실패했습니다.');

    } catch (error) {
      console.error('❌ 언어별 최적화된 TTS 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 TTS 오류가 발생했습니다.';
      
      // 에러 상태 업데이트
      setTtsError(`TTS 생성 실패: ${errorMessage}`);
      setIsGeneratingTTS(false);
      
      if (onChapterUpdate) {
        onChapterUpdate({
          ...chapter,
          isGeneratingTTS: false,
          ttsError: errorMessage
        });
      }
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  // 오디오 URL이 변경되면 오디오 요소 업데이트
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);
  
  // 🎛️ 오디오 제어 콜백 등록
  useEffect(() => {
    if (onRegisterControls && audioRef.current) {
      const controls = {
        setVolume: (vol: number) => {
          if (audioRef.current) {
            audioRef.current.volume = vol;
            setVolume(vol);
          }
        },
        setPlaybackRate: (rate: number) => {
          if (audioRef.current) {
            audioRef.current.playbackRate = rate;
          }
        },
        play: async () => {
          if (audioRef.current && audioUrl) {
            await audioRef.current.play();
          }
        },
        pause: () => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        },
        getCurrentTime: () => {
          return audioRef.current?.currentTime || 0;
        },
        getDuration: () => {
          return audioRef.current?.duration || 0;
        }
      };
      
      onRegisterControls(chapter.id, controls);
      console.log(`🎛️ [제어 등록] 챕터 ${chapter.id} 오디오 제어 콜백 등록 완료`);
      console.log(`🎛️ [제어 등록] 오디오 URL 상태:`, !!audioUrl);
      console.log(`🎛️ [제어 등록] 오디오 요소 상태:`, !!audioRef.current);
    }
  }, [onRegisterControls, chapter.id, audioUrl]);

  // 🎧 상단 LiveAudioPlayer에서 TTS 생성 요청 이벤트 리스너
  useEffect(() => {
    const handleTriggerTTS = (event: CustomEvent) => {
      const { chapterId, fromTopPlayer } = event.detail;
      
      if (chapterId === chapter.id && fromTopPlayer) {
        console.log(`🎵 [Chapter] 상단에서 TTS 생성 요청 받음: ${chapterId}`);
        
        // TTS가 없으면 즉시 생성
        if (!audioUrl) {
          generateTTS();
        }
      }
    };

    window.addEventListener('triggerChapterTTS', handleTriggerTTS as EventListener);
    
    return () => {
      window.removeEventListener('triggerChapterTTS', handleTriggerTTS as EventListener);
    };
  }, [chapter.id, audioUrl]);

  return (
    <div className={`${className}`}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* 간소화된 오디오 플레이어 - 재생 버튼만 우측에 배치 */}
      <div className="flex items-center justify-end">
        {/* 재생/일시정지 버튼 - 흰색 동그라미 */}
        <button
          onClick={togglePlayPause}
          disabled={isGeneratingTTS}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 border-2
            ${isGeneratingTTS 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'bg-white text-black border-black hover:border-gray-800 hover:bg-gray-50 cursor-pointer'
            }`}
          aria-label={isGeneratingTTS ? String(t('audio.generating') || 'TTS 생성 중') : isPlaying ? String(t('audio.pause') || '일시정지') : String(t('audio.play') || '재생')}
        >
          {isGeneratingTTS ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>
      
      {/* 에러 표시 */}
      {ttsError && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded mt-2">
          {ttsError}
        </div>
      )}
    </div>
  );
};

export default ChapterAudioPlayer;
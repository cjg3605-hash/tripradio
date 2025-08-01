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
import { ultraNaturalTTS } from '@/lib/tts/ultra-natural-tts-engine';

interface ChapterAudioPlayerProps {
  chapter: AudioChapter;
  className?: string;
  onChapterUpdate?: (updatedChapter: AudioChapter) => void;
  locationName?: string;
  guideId?: string;
}

const ChapterAudioPlayer: React.FC<ChapterAudioPlayerProps> = ({
  chapter,
  className = '',
  onChapterUpdate,
  locationName = 'guide',
  guideId = 'default'
}) => {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
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
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

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
      console.log('🔄 TTS 생성 중이므로 버튼 클릭 무시');
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

  // 🎙️ Ultra-Natural TTS (100만명 시뮬레이션) - 단일 최고 품질 TTS
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
      console.log('🤖 Ultra-Natural TTS 생성 시작 (100만명 시뮬레이션):', { 
        chapterId: chapter.id, 
        textLength: chapter.text.length,
        language: chapter.language || 'ko'
      });

      // 🧬 Ultra-Natural TTS 생성 (유일한 TTS)
      const result = await ultraNaturalTTS.generateUltraNaturalTTS({
        text: chapter.text,
        context: 'tour_guide', // 투어 가이드 컨텍스트
        targetAudience: {
          ageGroup: 'middle',
          formalityPreference: 'semi_formal',
          educationLevel: 'general'
        },
        qualityLevel: 'ultra'
      });

      if (result.success && result.audioUrl) {
        setAudioUrl(result.audioUrl);
        setIsGeneratingTTS(false);
        
        // 상위 컴포넌트에 업데이트된 챕터 정보 전달
        if (onChapterUpdate) {
          onChapterUpdate({
            ...chapter,
            audioUrl: result.audioUrl,
            isGeneratingTTS: false,
            ttsError: undefined
          });
        }

        console.log('✅ Ultra-Natural TTS 생성 완료:', { 
          chapterId: chapter.id,
          humanLikeness: `${result.naturalness.humanLikenessPercent.toFixed(1)}%`,
          simulationAccuracy: `${result.naturalness.simulationAccuracy.toFixed(1)}%`
        });

        // 🎵 생성 완료 후 자동 재생
        setTimeout(async () => {
          if (audioRef.current && result.audioUrl) {
            try {
              console.log('🎵 Ultra-Natural TTS 생성 완료 - 자동 재생 시작');
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
      throw new Error(result.error || 'Ultra-Natural TTS 생성에 실패했습니다.');

    } catch (error) {
      console.error('❌ Ultra-Natural TTS 생성 실패:', error);
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

  return (
    <div className={`space-y-3 ${className}`}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* 통합 오디오 플레이어 */}
      <div className="flex items-center gap-3">
        {/* 재생/일시정지 버튼 */}
        <button
          onClick={togglePlayPause}
          disabled={isGeneratingTTS}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 
            ${isGeneratingTTS 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
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

        {/* 진행률 바 */}
        <div className="flex-1 min-w-0">
          <div
            className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-black rounded-full"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{isGeneratingTTS ? 'TTS 생성 중...' : formatTime(duration)}</span>
          </div>
        </div>

        {/* 볼륨 */}
        <button
          onClick={toggleMute}
          disabled={!audioUrl}
          className="p-1 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 disabled:text-gray-300"
          aria-label={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* 재생성 버튼 (오디오가 있을 때만) */}
        {audioUrl && (
          <button
            onClick={generateTTS}
            disabled={isGeneratingTTS}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 disabled:text-gray-400"
            aria-label="TTS 재생성"
            title="새로운 음성으로 재생성"
          >
            {isGeneratingTTS ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      
      {/* 에러 표시 */}
      {ttsError && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {ttsError}
        </div>
      )}
    </div>
  );
};

export default ChapterAudioPlayer;
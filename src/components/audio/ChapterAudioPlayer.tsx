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
import { advancedTTSService } from '@/lib/advanced-tts-service';
import { neural2TTS } from '@/lib/tts/neural2-tts-service';

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

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // 재생/일시정지
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    // 오디오가 없으면 TTS 생성 후 재생
    if (!audioUrl && !isGeneratingTTS) {
      await generateTTS();
      return;
    }

    // 오디오가 있으면 재생/일시정지
    if (audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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

  // 🎙️ Neural2 기반 TTS 생성 (우선순위) + 폴백
  const generateTTS = async () => {
    if (!chapter.text || isGeneratingTTS) return;

    setIsGeneratingTTS(true);
    setTtsError(null);

    try {
      console.log('🎙️ Neural2 TTS 생성 시작:', { 
        chapterId: chapter.id, 
        textLength: chapter.text.length,
        language: chapter.language || 'ko'
      });

      // 1️⃣ Neural2 TTS 시도 (우선순위)
      const neural2Result = await neural2TTS.generateAudio({
        text: chapter.text,
        language: chapter.language || 'ko',
        chapterId: String(chapter.id),
        locationName: locationName,
        priority: 'normal'
      });

      if (neural2Result.success && neural2Result.audioUrl) {
        setAudioUrl(neural2Result.audioUrl);
        
        // 상위 컴포넌트에 업데이트된 챕터 정보 전달
        if (onChapterUpdate) {
          onChapterUpdate({
            ...chapter,
            audioUrl: neural2Result.audioUrl,
            isGeneratingTTS: false,
            ttsError: undefined
          });
        }

        console.log('✅ Neural2 TTS 생성 완료:', { 
          chapterId: chapter.id,
          isCached: neural2Result.cached,
          audioUrlType: neural2Result.audioUrl.startsWith('data:') ? 'base64' : 'url'
        });

        // 생성 완료 후 자동 재생
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 100);

        return; // Neural2 성공시 여기서 종료
      }

      // 2️⃣ Neural2 실패시 고급 TTS 폴백
      console.log('⚠️ Neural2 실패, 고급 TTS 폴백 시도:', neural2Result.error);
      
      const advancedResult = await advancedTTSService.generatePersonalityTTS({
        text: chapter.text,
        language: chapter.language || 'ko-KR',
        userPersonality: chapter.personality || 'agreeableness',
        guide_id: guideId,
        locationName: locationName
      });

      if (advancedResult.success && advancedResult.audioData) {
        // Base64 오디오를 Blob URL로 변환
        const audioBlob = new Blob(
          [Uint8Array.from(atob(advancedResult.audioData), c => c.charCodeAt(0))], 
          { type: advancedResult.mimeType || 'audio/mpeg' }
        );
        const newAudioUrl = URL.createObjectURL(audioBlob);
        
        setAudioUrl(newAudioUrl);
        
        if (onChapterUpdate) {
          onChapterUpdate({
            ...chapter,
            audioUrl: newAudioUrl,
            isGeneratingTTS: false,
            ttsError: undefined
          });
        }

        console.log('✅ 고급 TTS 폴백 완료:', { 
          chapterId: chapter.id,
          personality: advancedResult.personalityInfo?.appliedPersonality
        });

        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 100);

      } else {
        throw new Error(advancedResult.error || neural2Result.error || 'TTS 생성 실패');
      }

    } catch (error) {
      console.error('❌ TTS 생성 완전 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(t('audio.unknown_error') || '알 수 없는 오류가 발생했습니다.');
      setTtsError(errorMessage);
      
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
          className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors flex-shrink-0 disabled:bg-gray-400"
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
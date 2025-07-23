// 🎙️ Phase 4: AI 음성 해설 컴포넌트
// 성격 기반 다국어 TTS 시스템 UI

'use client';

import React, { useState, useEffect } from 'react';
import { ttsService, AudioGuide } from '@/lib/audio/tts-service';

interface VoiceCommentaryProps {
  text?: string;
  userPersonality?: string;
  language?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
}

/**
 * 🎙️ AI 음성 해설 컴포넌트
 * Phase 4: 성격 기반 다국어 TTS 시스템
 */
export default function VoiceCommentary({
  text = '',
  userPersonality = 'agreeableness',
  language = 'ko-KR',
  autoPlay = false,
  showControls = true,
  onPlayStart,
  onPlayEnd,
  onError,
  className = ''
}: VoiceCommentaryProps) {
  
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1,
    pitch: 1,
    volume: 1
  });

  useEffect(() => {
    initializeTTS();
    setupEventListeners();
    
    return () => {
      ttsService.stop();
      removeEventListeners();
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text) {
      playVoiceCommentary();
    }
  }, [text, userPersonality, language, autoPlay]);

  /**
   * 🚀 TTS 초기화
   */
  const initializeTTS = () => {
    const status = ttsService.getStatus();
    setIsSupported(status.isSupported);
    
    if (status.isSupported) {
      const voices = ttsService.getAvailableVoices(language);
      setAvailableVoices(voices);
      console.log('🎙️ 음성 해설 컴포넌트 초기화 완료');
    } else {
      setError('브라우저가 음성 합성을 지원하지 않습니다');
    }
  };

  /**
   * 📞 이벤트 리스너 설정
   */
  const setupEventListeners = () => {
    ttsService.on('start', handlePlayStart);
    ttsService.on('end', handlePlayEnd);
    ttsService.on('error', handlePlayError);
    ttsService.on('pause', handlePlayPause);
    ttsService.on('resume', handlePlayResume);
    ttsService.on('progress', handlePlayProgress);
  };

  /**
   * 🚫 이벤트 리스너 제거
   */
  const removeEventListeners = () => {
    ttsService.off('start', handlePlayStart);
    ttsService.off('end', handlePlayEnd);
    ttsService.off('error', handlePlayError);
    ttsService.off('pause', handlePlayPause);
    ttsService.off('resume', handlePlayResume);
    ttsService.off('progress', handlePlayProgress);
  };

  /**
   * 🎙️ 음성 해설 재생
   */
  const playVoiceCommentary = async () => {
    if (!text.trim()) {
      setError('재생할 텍스트가 없습니다');
      return;
    }

    try {
      setPlaybackState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      await ttsService.speakWithPersonality(text, {
        language,
        userPersonality,
        culturalContext: getCulturalContext(language),
        adaptToMood: true
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : '음성 재생 실패';
      setError(message);
      onError?.(message);
    } finally {
      setPlaybackState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * 🔧 이벤트 핸들러들
   */
  const handlePlayStart = (data: any) => {
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isLoading: false
    }));
    onPlayStart?.();
    console.log('🎙️ 음성 재생 시작');
  };

  const handlePlayEnd = (data: any) => {
    setPlaybackState({
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentTime: 0,
      duration: 0
    });
    onPlayEnd?.();
    console.log('🎙️ 음성 재생 완료');
  };

  const handlePlayError = (data: { error: string }) => {
    setError(data.error);
    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isLoading: false
    }));
    onError?.(data.error);
  };

  const handlePlayPause = () => {
    setPlaybackState(prev => ({ ...prev, isPaused: true }));
  };

  const handlePlayResume = () => {
    setPlaybackState(prev => ({ ...prev, isPaused: false }));
  };

  const handlePlayProgress = (data: any) => {
    setPlaybackState(prev => ({
      ...prev,
      currentTime: data.elapsedTime || 0
    }));
  };

  /**
   * 🎛️ 재생 제어 함수들
   */
  const pausePlayback = () => {
    ttsService.pause();
  };

  const resumePlayback = () => {
    ttsService.resume();
  };

  const stopPlayback = () => {
    ttsService.stop();
  };

  const adjustPlaybackRate = (rate: number) => {
    setVoiceSettings(prev => ({ ...prev, rate }));
    ttsService.setPlaybackRate(rate);
  };

  const adjustVolume = (volume: number) => {
    setVoiceSettings(prev => ({ ...prev, volume }));
    ttsService.setVolume(volume);
  };

  /**
   * 🌍 문화적 맥락 반환
   */
  const getCulturalContext = (language: string): string => {
    const langCode = language.slice(0, 2);
    const contexts: Record<string, string> = {
      ko: 'korean',
      en: 'english',
      ja: 'japanese',
      zh: 'chinese',
      es: 'spanish'
    };
    return contexts[langCode] || 'neutral';
  };

  /**
   * 🎭 성격별 아이콘 반환
   */
  const getPersonalityIcon = (personality: string): string => {
    const icons: Record<string, string> = {
      openness: '🎨',
      conscientiousness: '📋',
      extraversion: '🎉',
      agreeableness: '🤝',
      neuroticism: '🌸'
    };
    return icons[personality] || '🎯';
  };

  /**
   * 🎚️ 재생 진행률 계산
   */
  const getProgressPercentage = (): number => {
    if (playbackState.duration === 0) return 0;
    return (playbackState.currentTime / playbackState.duration) * 100;
  };

  if (!isSupported) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-medium">음성 기능 지원 안됨</div>
            <div className="text-sm">브라우저가 음성 합성을 지원하지 않습니다</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎙️</span>
            <h3 className="text-lg font-bold text-gray-800">AI 음성 해설</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Phase 4</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{getPersonalityIcon(userPersonality)} {userPersonality}</span>
            <span>🌍 {language}</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 text-red-600">
              <span>⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : null}

        {/* 텍스트 미리보기 */}
        {text && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">📝 해설 텍스트:</div>
            <div className="text-gray-800 text-sm leading-relaxed max-h-20 overflow-y-auto">
              {text}
            </div>
          </div>
        )}

        {/* 재생 컨트롤 */}
        {showControls && (
          <div className="space-y-4">
            {/* 주요 버튼들 */}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={playVoiceCommentary}
                disabled={playbackState.isLoading || !text.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {playbackState.isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>로딩 중...</span>
                  </>
                ) : (
                  <>
                    <span>▶️</span>
                    <span>재생</span>
                  </>
                )}
              </button>

              {playbackState.isPlaying && (
                <>
                  <button
                    onClick={playbackState.isPaused ? resumePlayback : pausePlayback}
                    className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <span>{playbackState.isPaused ? '▶️' : '⏸️'}</span>
                    <span>{playbackState.isPaused ? '재개' : '일시정지'}</span>
                  </button>

                  <button
                    onClick={stopPlayback}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span>⏹️</span>
                    <span>중지</span>
                  </button>
                </>
              )}
            </div>

            {/* 진행률 표시 */}
            {playbackState.isPlaying && (
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            )}

            {/* 음성 설정 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">재생 속도</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => adjustPlaybackRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-500 text-center mt-1">{voiceSettings.rate}x</div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">볼륨</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-gray-500 text-center mt-1">{Math.round(voiceSettings.volume * 100)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상태 표시 */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>상태: {playbackState.isLoading ? '로딩 중' : 
                          playbackState.isPlaying ? (playbackState.isPaused ? '일시정지됨' : '재생 중') : 
                          '대기 중'}</span>
            {availableVoices.length > 0 && (
              <span>지원 음성: {availableVoices.length}개</span>
            )}
          </div>
          <div>
            🎭 성격 기반 • 🌍 다국어 지원
          </div>
        </div>
      </div>

      {/* 디버그 정보 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="p-4 border-t border-gray-100">
          <summary className="text-xs text-gray-400 cursor-pointer">디버그 정보</summary>
          <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify({
              playbackState,
              voiceSettings,
              userPersonality,
              language,
              availableVoicesCount: availableVoices.length,
              textLength: text.length,
              culturalContext: getCulturalContext(language)
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * 🎙️ 간단한 음성 해설 버튼 컴포넌트
 */
export function VoiceButton({ 
  text, 
  personality = 'agreeableness', 
  language = 'ko-KR',
  className = '' 
}: { 
  text: string; 
  personality?: string; 
  language?: string;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
    } else {
      try {
        setIsPlaying(true);
        await AudioGuide.speakWithPersonality(text, personality, language);
        setIsPlaying(false);
      } catch (error) {
        console.error('음성 재생 실패:', error);
        setIsPlaying(false);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors ${className}`}
      title="음성으로 듣기"
    >
      <span>{isPlaying ? '⏸️' : '🎙️'}</span>
      <span>{isPlaying ? '중지' : '듣기'}</span>
    </button>
  );
}
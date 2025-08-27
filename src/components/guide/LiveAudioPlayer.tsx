'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  List,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioChapter } from '@/types/audio';

interface LiveAudioPlayerProps {
  chapters: AudioChapter[];
  locationName: string;
  className?: string;
  onChapterChange?: (chapterIndex: number) => void;
  onAudioRequest?: (chapterId: string | number) => Promise<string | null>;
  // 🎛️ 전역 오디오 제어 콜백
  onVolumeChange?: (volume: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onPlayStateChange?: (isPlaying: boolean, currentTime?: number, duration?: number) => void;
  initialVolume?: number;
  initialPlaybackRate?: number;
  // 🔄 외부 상태 동기화
  externalIsPlaying?: boolean;
  externalProgress?: number;
  externalCurrentTime?: number;
  externalDuration?: number;
  // 🎛️ 현재 활성 챕터의 오디오 제어
  activeChapterControls?: {
    play: () => Promise<void>;
    pause: () => void;
  } | null;
}

export function LiveAudioPlayer({ 
  chapters, 
  locationName, 
  className = '', 
  onChapterChange,
  onAudioRequest,
  onVolumeChange,
  onPlaybackRateChange,
  onPlayStateChange,
  initialVolume = 1,
  initialPlaybackRate = 1,
  externalIsPlaying,
  externalProgress,
  externalCurrentTime,
  externalDuration,
  activeChapterControls
}: LiveAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [playbackRate, setPlaybackRate] = useState(initialPlaybackRate);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeMenu, setShowVolumeMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentChapter = chapters[currentChapterIndex];

  // 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };
    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
      setDuration(audio.duration);
      // 오디오 로드 완료 후 배속 설정
      audio.playbackRate = playbackRate;
    };
    const handleEnded = () => {
      // 상위 컴포넌트에 재생 상태 알림
      if (onPlayStateChange) {
        onPlayStateChange(false, currentTime, duration);
      }
      
      // 자동으로 다음 챕터로 이동
      if (currentChapterIndex < chapters.length - 1) {
        const newIndex = currentChapterIndex + 1;
        setCurrentChapterIndex(newIndex);
        // 상위 컴포넌트에 챕터 변경 알림
        if (onChapterChange) {
          onChapterChange(newIndex);
        }
      } else {
        // 모든 챕터 완료
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      }
    };
    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      const errorDetails = {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      };
      
      console.error('오디오 로딩 오류:', errorDetails);
      
      // 네트워크 오류인 경우 재시도 로직
      if (audio.error?.code === MediaError.MEDIA_ERR_NETWORK) {
        console.log('🔄 네트워크 오류 감지, 재시도 중...');
        setTimeout(() => {
          audio.load();
        }, 1000);
        return;
      }
      
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentChapterIndex, chapters.length, playbackRate]);

  // 진행률 업데이트
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressIntervalRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio && duration > 0) {
          const current = audio.currentTime;
          setCurrentTime(current);
          setProgress((current / duration) * 100);
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  // 🔄 외부 재생 상태와 동기화 (하단 챕터 오디오와 연동)
  useEffect(() => {
    if (externalIsPlaying !== undefined && externalIsPlaying !== isPlaying) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  // 🔄 외부 진행률 정보와 동기화
  useEffect(() => {
    if (externalCurrentTime !== undefined) {
      setCurrentTime(externalCurrentTime);
    }
    if (externalDuration !== undefined) {
      setDuration(externalDuration);
    }
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
    }
  }, [externalCurrentTime, externalDuration, externalProgress]);

  // 🔗 챕터 오디오 요청 (하단 ChapterAudioPlayer에서 생성된 오디오 재사용)
  const requestChapterAudio = async (chapterId: string | number): Promise<string | null> => {
    if (onAudioRequest) {
      return await onAudioRequest(chapterId);
    }
    return null;
  };


  // 🎛️ External props 변경 시 로컬 상태 업데이트 (무한 루프 방지)
  useEffect(() => {
    if (Math.abs(initialVolume - volume) > 0.01) {
      setVolume(initialVolume);
      if (audioRef.current) {
        audioRef.current.volume = initialVolume;
      }
    }
  }, [initialVolume]);
  
  useEffect(() => {
    if (Math.abs(initialPlaybackRate - playbackRate) > 0.01) {
      setPlaybackRate(initialPlaybackRate);
      if (audioRef.current) {
        audioRef.current.playbackRate = initialPlaybackRate;
      }
    }
  }, [initialPlaybackRate]);
  
  // 🔄 외부 재생 상태 동기화 (무한 루프 방지)
  useEffect(() => {
    if (typeof externalIsPlaying === 'boolean' && externalIsPlaying !== isPlaying) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);
  
  useEffect(() => {
    if (typeof externalProgress === 'number' && Math.abs(externalProgress - progress) > 1) {
      setProgress(externalProgress);
    }
  }, [externalProgress]);
  
  useEffect(() => {
    if (typeof externalCurrentTime === 'number' && Math.abs(externalCurrentTime - currentTime) > 1) {
      setCurrentTime(externalCurrentTime);
    }
  }, [externalCurrentTime]);
  
  useEffect(() => {
    if (typeof externalDuration === 'number' && Math.abs(externalDuration - duration) > 0.1) {
      setDuration(externalDuration);
    }
  }, [externalDuration]);
  
  // 챕터 변경 시 오디오 소스 업데이트
  useEffect(() => {
    const setupAudio = async () => {
      if (!currentChapter || !audioRef.current) return;

      const audio = audioRef.current;
      audio.volume = volume;
      setProgress(0);
      setCurrentTime(0);

      // 🔗 우선순위: 기존 audioUrl > 하단 컴포넌트 생성 오디오
      if (currentChapter.audioUrl) {
        // 이미 생성된 오디오 URL 사용
        audio.src = currentChapter.audioUrl;
        if (isPlaying) {
          audio.play().catch(console.error);
        }
      } else {
        // 하단 ChapterAudioPlayer에서 생성된 오디오 요청
        setIsLoading(true);
        const requestedAudioUrl = await requestChapterAudio(currentChapter.id);
        
        if (requestedAudioUrl) {
          // 하단 컴포넌트에서 생성된 고품질 오디오 사용
          audio.src = requestedAudioUrl;
          setIsLoading(false);
          if (isPlaying) {
            audio.play().catch(console.error);
          }
        } else {
          // TTS 생성 실패
          setIsLoading(false);
          setIsPlaying(false);
        }
      }
    };

    setupAudio();
  }, [currentChapterIndex, currentChapter?.audioUrl, currentChapter?.text, volume]);

  // 🎚️ 배속 설정 (재생 중 변경 가능)
  useEffect(() => {
    if (audioRef.current && audioRef.current.readyState >= 1) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // 재생/일시정지 토글 (하단 챕터 오디오 컨트롤과 연동)
  const togglePlayPause = async () => {
    if (!currentChapter) return;

    console.log(`🎛️ [LiveAudioPlayer] 재생 버튼 클릭 - 현재 챕터:`, currentChapter.id);
    console.log(`🎛️ [LiveAudioPlayer] activeChapterControls:`, !!activeChapterControls);
    console.log(`🎛️ [LiveAudioPlayer] 현재 재생 상태:`, isPlaying);

    // 🎛️ 하단 챕터의 오디오 컨트롤이 있고 오디오가 준비된 경우에만 사용
    if (activeChapterControls && currentChapter.audioUrl) {
      console.log(`🎛️ [LiveAudioPlayer] 하단 컨트롤 사용 - 오디오 URL 존재`);
      if (isPlaying) {
        activeChapterControls.pause();
        setIsPlaying(false);
      } else {
        try {
          await activeChapterControls.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('하단 챕터 오디오 재생 실패:', error);
          setIsPlaying(false);
        }
      }
      return;
    }

    // 🎵 activeChapterControls가 없으면 기존 로직 사용
    if (isPlaying) {
      // 일시정지
      if (audioRef.current?.src) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      // 상위 컴포넌트에 일시정지 상태 알림
      if (onPlayStateChange) {
        onPlayStateChange(false, currentTime, duration);
      }
    } else {
      // 재생
      if (audioRef.current?.src && currentChapter.audioUrl) {
        // 오디오 파일이 있는 경우
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('오디오 재생 실패:', error);
          setIsPlaying(false);
        }
      } else {
        // 오디오 소스가 없는 경우 하단 컴포넌트에서 TTS 생성 요청
        console.log(`🎵 [LiveAudioPlayer] 오디오 없음 - 하단 컴포넌트 TTS 생성 시도`);
        setIsLoading(true);
        
        try {
          const requestedAudioUrl = await requestChapterAudio(currentChapter.id);
          if (requestedAudioUrl && audioRef.current) {
            console.log(`✅ [LiveAudioPlayer] TTS 생성 완료 - 재생 시작`);
            audioRef.current.src = requestedAudioUrl;
            await audioRef.current.play();
            setIsPlaying(true);
          } else {
            console.log(`❌ [LiveAudioPlayer] TTS 생성 실패`);
            setIsPlaying(false);
          }
        } catch (error) {
          console.error('오디오 요청 실패:', error);
          setIsPlaying(false);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // 이전 챕터
  const previousChapter = () => {
    if (currentChapterIndex > 0) {
      // 현재 재생 중인 오디오 중지
      if (audioRef.current?.src) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      const newIndex = currentChapterIndex - 1;
      setCurrentChapterIndex(newIndex);
      // 상위 컴포넌트에 챕터 변경 알림
      if (onChapterChange) {
        onChapterChange(newIndex);
      }
    }
  };

  // 다음 챕터
  const nextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      // 현재 재생 중인 오디오 중지
      if (audioRef.current?.src) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      const newIndex = currentChapterIndex + 1;
      setCurrentChapterIndex(newIndex);
      // 상위 컴포넌트에 챕터 변경 알림
      if (onChapterChange) {
        onChapterChange(newIndex);
      }
    }
  };

  // 챕터 선택
  const selectChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setShowPlaylist(false);
    // 상위 컴포넌트에 챕터 변경 알림
    if (onChapterChange) {
      onChapterChange(index);
    }
  };

  // 배속 변경 (재생 중단 없이 속도만 변경)
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    
    // HTML Audio 요소의 배속 즉시 변경 (재생 중단 없음)
    if (audioRef.current && audioRef.current.readyState >= 1) {
      audioRef.current.playbackRate = rate;
    }
    
    // Web Speech API는 현재 재생중이면 배속 변경을 위해 재시작 필요
    // 하지만 이는 브라우저 API 한계로 HTML Audio를 우선 사용
    
    // 상위 컴포넌트에 배속 변경 알림
    if (onPlaybackRateChange) {
      onPlaybackRateChange(rate);
    }
  };

  // 볼륨 변경
  const changeVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    
    // 상위 컴포넌트에 볼륨 변경 알림
    if (onVolumeChange) {
      onVolumeChange(clampedVolume);
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 진행바 클릭 핸들러
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const newTime = clickRatio * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / duration) * 100);
  };

  if (!currentChapter) {
    return (
      <div className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="px-4 py-6 text-center">
          <p className="text-gray-500">오디오 챕터를 로딩하는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <audio ref={audioRef} preload="metadata" />

      {/* 현재 재생 중인 챕터 정보 */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-black truncate">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    로딩 중...
                  </div>
                ) : (
                  currentChapter.title
                )}
              </h3>
              <span className="text-gray-500 text-xs whitespace-nowrap">
                {currentChapterIndex + 1}/{chapters.length} 챕터
                {duration > 0 && ` • ${formatTime(duration)}`}
              </span>
            </div>
          </div>
          <Button 
            size="sm" 
            className="ml-2 bg-transparent hover:bg-gray-100 text-gray-700"
            onClick={() => setShowPlaylist(!showPlaylist)}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* 진행바 */}
        <div className="mb-4">
          <div 
            className="h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {duration > 0 && (
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          )}
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-center space-x-4">
          <Button 
            size="sm"
            onClick={previousChapter}
            disabled={currentChapterIndex === 0}
            className="w-10 h-10 bg-transparent hover:bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button 
            size="sm"
            className="w-12 h-12 rounded-full bg-black hover:bg-gray-800"
            onClick={togglePlayPause}
            disabled={isLoading || hasError}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          <Button 
            size="sm"
            onClick={nextChapter}
            disabled={currentChapterIndex === chapters.length - 1}
            className="w-10 h-10 bg-transparent hover:bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* 볼륨 조절 버튼 */}
          <div className="relative">
            <Button 
              size="sm" 
              className="w-10 h-10 ml-2 bg-transparent hover:bg-gray-100 text-gray-700"
              onClick={() => setShowVolumeMenu(!showVolumeMenu)}
            >
              <Volume2 className="w-4 h-4" />
            </Button>

            {/* 볼륨 조절 드롭다운 */}
            {showVolumeMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                <div className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">{Math.round(volume * 100)}%</div>
                  
                  {/* 세로 볼륨 슬라이더 */}
                  <div className="relative h-32 w-6 flex items-center justify-center">
                    <div className="relative h-full w-2">
                      {/* 슬라이더 트랙 */}
                      <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                      
                      {/* 슬라이더 채워진 부분 */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-black rounded-full transition-all duration-150"
                        style={{ height: `${volume * 100}%` }}
                      ></div>
                      
                      {/* 슬라이더 핸들 */}
                      <div 
                        className="absolute w-4 h-4 bg-white border-2 border-black rounded-full cursor-pointer transition-all duration-150 hover:scale-110"
                        style={{ 
                          left: '-4px',
                          bottom: `${volume * 100}%`,
                          transform: 'translateY(50%)'
                        }}
                        onMouseDown={(e) => {
                          const startY = e.clientY;
                          const startVolume = volume;
                          const trackHeight = 128; // h-32 = 128px
                          
                          const handleMouseMove = (e: MouseEvent) => {
                            const deltaY = startY - e.clientY; // 반대 방향 (위로 올리면 증가)
                            const volumeChange = deltaY / trackHeight;
                            const newVolume = startVolume + volumeChange;
                            changeVolume(newVolume);
                          };
                          
                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                          };
                          
                          document.addEventListener('mousemove', handleMouseMove);
                          document.addEventListener('mouseup', handleMouseUp);
                        }}
                      ></div>
                      
                      {/* 클릭 영역 */}
                      <div 
                        className="absolute inset-0 cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickY = e.clientY - rect.top;
                          const newVolume = 1 - (clickY / rect.height); // 반대 방향
                          changeVolume(newVolume);
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">볼륨</div>
                </div>
              </div>
            )}
          </div>

          {/* 배속 조절 버튼 */}
          <div className="relative">
            <Button 
              size="sm"
              className="w-12 h-10 ml-2 bg-transparent hover:bg-gray-100 text-gray-700"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            >
              <span className="text-xs font-medium">{playbackRate}x</span>
            </Button>

            {/* 배속 선택 드롭다운 */}
            {showSpeedMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                      playbackRate === rate 
                        ? 'bg-gray-100 text-black font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오디오 에러 표시 */}
        {hasError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <div className="text-sm font-medium">오디오 로딩 오류</div>
            </div>
            <div className="text-xs text-red-600 mt-1">
              오디오를 로딩할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.
            </div>
          </div>
        )}
      </div>

      {/* 볼륨 메뉴 배경 오버레이 */}
      {showVolumeMenu && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowVolumeMenu(false)}
        />
      )}

      {/* 배속 메뉴 배경 오버레이 */}
      {showSpeedMenu && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowSpeedMenu(false)}
        />
      )}

      {/* 플레이리스트 드롭다운 */}
      {showPlaylist && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">챕터 목록</h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {chapters.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => selectChapter(index)}
                  className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                    index === currentChapterIndex
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="font-medium truncate">{chapter.title}</div>
                  <div className="text-xs opacity-80 mt-1">
                    {index + 1}번째 챕터
                    {chapter.duration && ` • ${Math.floor(chapter.duration / 60)}분`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
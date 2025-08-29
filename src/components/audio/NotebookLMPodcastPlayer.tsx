'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterList from './ChapterList';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Loader2,
  Headphones,
  Clock,
  Star,
  Download,
  SkipBack,
  SkipForward,
  Settings,
  List,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ChapterInfo {
  chapterIndex: number;
  title: string;
  description: string;
  segmentCount: number;
  estimatedDuration: number; // 초 단위
  contentFocus: string[];
}

interface NotebookLMPodcastPlayerProps {
  locationName: string;
  className?: string;
  language?: string;
  onGenerationComplete?: (episodeData: any) => void;
}

interface SegmentInfo {
  sequenceNumber: number;
  speakerType: 'male' | 'female';
  audioUrl: string;
  duration: number;
  textContent: string;
  chapterIndex?: number; // 세그먼트가 속한 챕터 인덱스
  chapterTitle?: string; // 세그먼트가 속한 챕터 제목
}

interface PodcastEpisode {
  episodeId: string;
  status: 'completed' | 'script_ready';
  userScript: string;
  totalDuration: number;
  segmentCount: number;
  segments: SegmentInfo[];
  chapters?: ChapterInfo[]; // 챕터 정보 추가
  metadata?: {
    folderPath: string;
    totalFileSize: number;
    maleSegments: number;
    femaleSegments: number;
    generationTime: number;
  };
  qualityScore?: number;
}

const NotebookLMPodcastPlayer: React.FC<NotebookLMPodcastPlayerProps> = ({
  locationName,
  className = '',
  language,
  onGenerationComplete
}) => {
  const { t, currentLanguage } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const preloadAudioRef = useRef<HTMLAudioElement>(null); // 미리로드용 audio
  
  // 스크립트를 세그먼트로 파싱하는 함수
  const parseScriptToSegments = (scriptText: string) => {
    const segments: { speaker: string; text: string; sequenceNumber: number }[] = [];
    const lines = scriptText.split('\n');
    let sequenceNumber = 0;
    
    for (const line of lines) {
      const maleMatch = line.match(/^\[?male\]?\s*:?\s*(.+)/i);
      const femaleMatch = line.match(/^\[?female\]?\s*:?\s*(.+)/i);
      
      if (maleMatch && maleMatch[1].trim()) {
        sequenceNumber++;
        segments.push({
          speaker: 'male',
          text: maleMatch[1].trim(),
          sequenceNumber
        });
      } else if (femaleMatch && femaleMatch[1].trim()) {
        sequenceNumber++;
        segments.push({
          speaker: 'female',
          text: femaleMatch[1].trim(),
          sequenceNumber
        });
      }
    }
    
    return segments;
  };
  
  // 상태 관리
  const [isGenerating, setIsGenerating] = useState(false);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // 순차 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoPlayNext] = useState(true); // 항상 true로 고정
  
  // 미리로드 상태
  const [isNextSegmentPreloaded, setIsNextSegmentPreloaded] = useState(false);
  const [preloadedSegmentIndex, setPreloadedSegmentIndex] = useState(-1);
  
  // 순차 재생에서는 챕터 대신 세그먼트 사용
  const [showTranscript, setShowTranscript] = useState(false);
  
  // 설정
  const [podcastOptions, setPodcastOptions] = useState({
    priority: 'engagement' as 'engagement' | 'accuracy' | 'emotion',
    audienceLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    podcastStyle: 'educational' as 'deep-dive' | 'casual' | 'educational' | 'exploratory'
  });

  // 페이지 로드시 기존 팟캐스트 확인
  useEffect(() => {
    checkExistingPodcast();
  }, [locationName, language]);

  // 에피소드가 로드되면 첫 번째 세그먼트 준비
  useEffect(() => {
    if (episode?.segments && episode.segments.length > 0) {
      console.log('🎵 첫 번째 세그먼트 준비:', episode.segments[0]);
      setCurrentSegmentIndex(0);
      
      // 첫 번째 세그먼트를 오디오 엘리먼트에 로드 (자동 재생은 하지 않음)
      if (audioRef.current) {
        audioRef.current.src = episode.segments[0].audioUrl;
        audioRef.current.load();
        
        // 설정 적용
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.muted = isMuted;
      }
    }
  }, [episode]);

  // 순차 재생 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !episode?.segments) return;

    const handleTimeUpdate = () => {
      const currentSegmentTime = audio.currentTime;
      setCurrentTime(currentSegmentTime);
      
      // 전체 경과 시간 계산 (이전 세그먼트들의 총 시간 + 현재 세그먼트 시간)
      const previousSegmentsTime = episode.segments
        .slice(0, currentSegmentIndex)
        .reduce((total, segment) => total + segment.duration, 0);
      setTotalElapsedTime(previousSegmentsTime + currentSegmentTime);
      
      // 0.3초 전 미리로드 체크
      const currentSegment = episode.segments[currentSegmentIndex];
      const nextSegmentIndex = currentSegmentIndex + 1;
      
      if (!isNextSegmentPreloaded && 
          nextSegmentIndex < episode.segments.length &&
          currentSegmentTime >= currentSegment.duration - 0.3) {
        console.log(`🔄 세그먼트 ${nextSegmentIndex + 1} 미리로드 시작 (0.3초 전)`);
        preloadNextSegment(nextSegmentIndex);
      }
    };
    
    const handleEnded = () => {
      console.log(`✅ 세그먼트 ${currentSegmentIndex + 1} 재생 완료`);
      if (autoPlayNext && currentSegmentIndex < episode.segments.length - 1) {
        const nextIndex = currentSegmentIndex + 1;
        
        // 미리로드된 세그먼트가 있고 다음 세그먼트와 일치하면 즉시 전환
        if (isNextSegmentPreloaded && preloadedSegmentIndex === nextIndex) {
          console.log(`⚡ 미리로드된 세그먼트 ${nextIndex + 1}로 즉시 전환`);
          setCurrentSegmentIndex(nextIndex);
          swapToPreloadedAudio();
        } else {
          // 기존 방식으로 다음 세그먼트 재생
          playNextSegment();
        }
      } else {
        // 모든 세그먼트 재생 완료
        setIsPlaying(false);
        console.log('🎉 전체 팟캐스트 재생 완료!');
        
        // 미리로드 상태 리셋
        setIsNextSegmentPreloaded(false);
        setPreloadedSegmentIndex(-1);
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleError = (e: Event) => {
      console.error(`❌ 세그먼트 ${currentSegmentIndex + 1} 재생 오류:`, {
        error: (e.target as HTMLAudioElement).error,
        src: (e.target as HTMLAudioElement).src,
        networkState: (e.target as HTMLAudioElement).networkState
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [episode, currentSegmentIndex, autoPlayNext]);

  // 순차 재생 제어 함수들
  const playNextSegment = () => {
    if (!episode?.segments || currentSegmentIndex >= episode.segments.length - 1) return;
    
    const nextIndex = currentSegmentIndex + 1;
    setCurrentSegmentIndex(nextIndex);
    
    // 미리로드 상태 리셋 (수동 재생 시)
    setIsNextSegmentPreloaded(false);
    setPreloadedSegmentIndex(-1);
    
    // 자동재생이 활성화된 상태에서 다음 세그먼트 재생
    loadAndPlaySegment(nextIndex, true);
  };

  const playPreviousSegment = () => {
    if (!episode?.segments || currentSegmentIndex <= 0) return;
    
    const prevIndex = currentSegmentIndex - 1;
    setCurrentSegmentIndex(prevIndex);
    loadAndPlaySegment(prevIndex);
  };

  const loadAndPlaySegment = async (segmentIndex: number, shouldAutoPlay: boolean = isPlaying) => {
    if (!episode?.segments || !audioRef.current) return;
    
    const segment = episode.segments[segmentIndex];
    console.log(`🎵 세그먼트 ${segmentIndex + 1} 로드 및 재생:`, {
      speakerType: segment.speakerType,
      duration: segment.duration,
      audioUrl: segment.audioUrl,
      shouldAutoPlay
    });

    try {
      // 새 세그먼트 로드
      audioRef.current.src = segment.audioUrl;
      audioRef.current.load();
      
      // 볼륨 및 재생 속도 설정 유지
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isMuted;
      
      if (shouldAutoPlay) {
        await audioRef.current.play();
        setIsPlaying(true); // 재생 상태 동기화
      }
    } catch (error) {
      console.error(`❌ 세그먼트 ${segmentIndex + 1} 재생 실패:`, error);
    }
  };

  // 미리로드 함수들
  const preloadNextSegment = (nextSegmentIndex: number) => {
    if (!episode?.segments || !preloadAudioRef.current || nextSegmentIndex >= episode.segments.length) return;
    
    const nextSegment = episode.segments[nextSegmentIndex];
    console.log(`🔄 세그먼트 ${nextSegmentIndex + 1} 미리로드:`, nextSegment.audioUrl);
    
    try {
      preloadAudioRef.current.src = nextSegment.audioUrl;
      preloadAudioRef.current.load();
      
      // 설정 적용
      preloadAudioRef.current.volume = volume;
      preloadAudioRef.current.playbackRate = playbackRate;
      preloadAudioRef.current.muted = isMuted;
      
      setIsNextSegmentPreloaded(true);
      setPreloadedSegmentIndex(nextSegmentIndex);
      
      console.log(`✅ 세그먼트 ${nextSegmentIndex + 1} 미리로드 완료`);
    } catch (error) {
      console.error(`❌ 세그먼트 ${nextSegmentIndex + 1} 미리로드 실패:`, error);
    }
  };

  const swapToPreloadedAudio = async () => {
    if (!preloadAudioRef.current || !audioRef.current || preloadedSegmentIndex === -1) return;
    
    console.log(`🔄 미리로드된 세그먼트 ${preloadedSegmentIndex + 1}로 즉시 전환`);
    
    try {
      // 현재 오디오 정지
      audioRef.current.pause();
      
      // audio 엘리먼트 swap
      const tempSrc = audioRef.current.src;
      audioRef.current.src = preloadAudioRef.current.src;
      audioRef.current.currentTime = 0;
      
      // 즉시 재생
      await audioRef.current.play();
      setIsPlaying(true);
      
      // 다음 미리로드를 위해 상태 리셋
      setIsNextSegmentPreloaded(false);
      setPreloadedSegmentIndex(-1);
      
      console.log(`✅ 세그먼트 ${preloadedSegmentIndex + 1} 즉시 전환 완료`);
    } catch (error) {
      console.error('❌ 미리로드 전환 실패:', error);
      // 실패 시 기존 방식으로 폴백
      loadAndPlaySegment(preloadedSegmentIndex, true);
    }
  };

  const jumpToSegment = (segmentIndex: number) => {
    if (!episode?.segments || segmentIndex < 0 || segmentIndex >= episode.segments.length) return;
    
    setCurrentSegmentIndex(segmentIndex);
    loadAndPlaySegment(segmentIndex);
    
    // 미리로드 상태 리셋
    setIsNextSegmentPreloaded(false);
    setPreloadedSegmentIndex(-1);
  };

  const checkExistingPodcast = async () => {
    try {
      const response = await fetch(`/api/tts/notebooklm/generate?location=${encodeURIComponent(locationName)}&language=${language || currentLanguage}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎙️ 기존 에피소드 조회 결과:', result);
        
        // 순차 재생 시스템 데이터만 사용 (chapters가 있는 경우)
        if (result.success && result.data.hasEpisode && result.data.status === 'completed') {
          // 새로운 챕터 기반 데이터 구조 처리
          let allSegments: SegmentInfo[] = [];
          let chapterInfos: ChapterInfo[] = [];
          
          // 원본 스크립트에서 실제 텍스트 추출
          const originalScript = result.data.userScript || result.data.ttsScript || '';
          const scriptSegments = parseScriptToSegments(originalScript);
          
          if (result.data.chapters && Array.isArray(result.data.chapters)) {
            // 챕터별 데이터에서 모든 세그먼트 추출 및 챕터 정보 구성
            let totalSegmentCount = 0; // 전체 세그먼트 카운터
            
            result.data.chapters.forEach((chapter: any) => {
              const chapterInfo: ChapterInfo = {
                chapterIndex: chapter.chapterNumber,
                title: chapter.title,
                description: chapter.description || `${chapter.segmentCount}개 대화`,
                segmentCount: chapter.files?.length || chapter.segmentCount || 0,
                estimatedDuration: chapter.totalDuration || 0,
                contentFocus: []
              };
              chapterInfos.push(chapterInfo);
              
              console.log(`🔍 챕터 ${chapter.chapterNumber} 파싱:`, {
                title: chapter.title,
                fileCount: chapter.files?.length || 0,
                hasFiles: !!chapter.files
              });
              
              // 챕터의 파일들을 개별 세그먼트로 변환
              if (chapter.files && Array.isArray(chapter.files)) {
                const chapterSegments = chapter.files.map((fileName: string, index: number) => {
                  // 파일명에서 챕터-세그먼트 번호 추출 (예: "1-1ko.mp3" -> 챕터1, 세그먼트1)
                  const match = fileName.match(/^(\d+)-(\d+)ko\.mp3$/);
                  const segmentNumber = match ? parseInt(match[2]) : index + 1;
                  
                  // Supabase Storage URL 구성
                  const audioUrl = `https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/british-museum/${fileName}`;
                  
                  totalSegmentCount++;
                  
                  // 실제 스크립트에서 해당 세그먼트의 텍스트 찾기
                  const scriptSegment = scriptSegments.find(s => s.sequenceNumber === totalSegmentCount);
                  const actualText = scriptSegment ? scriptSegment.text : `챕터 ${chapter.chapterNumber} - 세그먼트 ${segmentNumber}`;
                  const actualSpeaker = scriptSegment ? scriptSegment.speaker : (segmentNumber % 2 === 1 ? 'male' : 'female');
                  
                  return {
                    sequenceNumber: totalSegmentCount, // 전체 시퀀스에서의 순서
                    speakerType: actualSpeaker as 'male' | 'female',
                    audioUrl: audioUrl,
                    duration: 30, // 기본 30초로 가정 (실제로는 메타데이터에서 가져와야 함)
                    textContent: actualText,
                    chapterIndex: chapter.chapterNumber,
                    chapterTitle: chapter.title
                  };
                });
                
                console.log(`✅ 챕터 ${chapter.chapterNumber} 세그먼트 생성 완료:`, chapterSegments.length + '개');
                allSegments.push(...chapterSegments);
              }
            });
            
            console.log('🎯 전체 세그먼트 파싱 완료:', {
              chapterCount: chapterInfos.length,
              totalSegments: allSegments.length,
              segmentsByChapter: chapterInfos.map(ch => `${ch.title}: ${ch.segmentCount}개`)
            });
          } else if (result.data.segments) {
            // 기존 평면 구조 지원 (fallback)
            allSegments = result.data.segments;
          }
          
          const episodeData: PodcastEpisode = {
            episodeId: result.data.episodeId,
            status: result.data.status,
            userScript: result.data.userScript || '',
            totalDuration: result.data.duration || 0,
            segmentCount: allSegments.length,
            segments: allSegments,
            chapters: chapterInfos,
            qualityScore: result.data.qualityScore || 0
          };
          
          console.log('✅ 기존 순차 재생 에피소드 발견:', {
            segmentCount: episodeData.segmentCount,
            totalDuration: `${Math.round(episodeData.totalDuration)}초`,
            hasSegments: episodeData.segments.length > 0
          });
          
          setEpisode(episodeData);
          
          // 첫 번째 세그먼트 로드 준비
          if (episodeData.segments.length > 0) {
            setCurrentSegmentIndex(0);
            loadAndPlaySegment(0);
          }
        } else {
          console.log('📭 기존 에피소드 없음 또는 미완성:', {
            success: result.success,
            hasEpisode: result.data?.hasEpisode,
            status: result.data?.status
          });
        }
      } else {
        console.error('❌ API 응답 실패:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('기존 팟캐스트 확인 실패:', error);
    }
  };

  // 순차 재생 시스템에서는 개별 세그먼트 재생성이 필요하면 전체 재생성
  // regenerateAudio 함수는 순차 재생에서는 사용하지 않음

  const generateNotebookLMPodcast = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    // 진행률 시뮬레이션 (90% 이후에도 천천히 증가)
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 98) return prev; // 98%에서 멈추고 실제 완료를 기다림
        if (prev >= 90) return Math.round(prev + Math.random() * 2); // 90% 이후 천천히 증가
        return Math.round(prev + Math.random() * 10);
      });
    }, 1000);

    try {
      console.log('🎙️ NotebookLM 스타일 전체 팟캐스트 생성 시작:', {
        locationName,
        language: language || currentLanguage,
        options: podcastOptions
      });

      // 타임아웃 설정 (10분)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

      const response = await fetch('/api/tts/notebooklm/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName,
          language: language || currentLanguage,
          options: podcastOptions
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'NotebookLM 팟캐스트 생성에 실패했습니다.');
      }

      const episodeData: PodcastEpisode = {
        episodeId: result.data.episodeId,
        status: result.data.status,
        userScript: result.data.userScript,
        totalDuration: result.data.totalDuration,
        segmentCount: result.data.segmentCount,
        segments: result.data.segments || [],
        metadata: result.data.metadata,
        qualityScore: 90 // 기본값
      };

      setEpisode(episodeData);
      setGenerationProgress(100);
      
      if (onGenerationComplete) {
        onGenerationComplete(episodeData);
      }

      console.log('✅ NotebookLM 순차 팟캐스트 생성 완료:', {
        totalDuration: `${Math.round(episodeData.totalDuration)}초`,
        segmentCount: episodeData.segmentCount,
        segments: episodeData.segments.length
      });

    } catch (error) {
      console.error('❌ NotebookLM 팟캐스트 생성 실패:', error);
      
      let errorMessage = '팟캐스트 생성에 실패했습니다.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '팟캐스트 생성이 시간초과되었습니다. 다시 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const togglePlayPause = async () => {
    // segments가 없으면 처리 중단
    if (!episode?.segments || episode.segments.length === 0) {
      console.log('⚠️ 세그먼트가 없음 - 팟캐스트를 생성해주세요:', {
        hasEpisode: !!episode,
        segmentCount: episode?.segments?.length || 0
      });
      setError('팟캐스트 세그먼트가 없습니다. 먼저 팟캐스트를 생성해주세요.');
      return;
    }
    
    if (!audioRef.current) {
      console.log('⚠️ 오디오 레퍼런스 없음');
      return;
    }

    const currentSegment = episode.segments[currentSegmentIndex];
    console.log(`▶️ 순차 재생 시도 - 세그먼트 ${currentSegmentIndex + 1}:`, {
      speakerType: currentSegment.speakerType,
      isPlaying,
      audioUrl: currentSegment.audioUrl,
      readyState: audioRef.current.readyState
    });

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // 현재 세그먼트의 오디오 URL이 로드되어 있는지 확인
        if (audioRef.current.src !== currentSegment.audioUrl) {
          console.log(`🔧 세그먼트 ${currentSegmentIndex + 1} 로드:`, currentSegment.audioUrl);
          audioRef.current.src = currentSegment.audioUrl;
          audioRef.current.load();
          
          // 설정 복원
          audioRef.current.volume = volume;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.muted = isMuted;
        }
        
        await audioRef.current.play();
      }
    } catch (error) {
      console.error(`❌ 세그먼트 ${currentSegmentIndex + 1} 재생 실패:`, error);
      setError(`세그먼트 ${currentSegmentIndex + 1} 재생에 실패했습니다.`);
      
      // 자동으로 다음 세그먼트로 이동 (선택사항)
      if (currentSegmentIndex < episode.segments.length - 1) {
        console.log('🔄 다음 세그먼트로 자동 이동...');
        setTimeout(() => playNextSegment(), 1000);
      }
    }
  };

  // 챕터 관련 상태
  const [showChapterList, setShowChapterList] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  
  // 현재 세그먼트에 해당하는 챕터 인덱스 계산
  const getCurrentChapterFromSegment = () => {
    if (!episode?.segments || !episode?.chapters) return 0;
    
    const currentSegment = episode.segments[currentSegmentIndex];
    if (!currentSegment?.chapterIndex) return 0;
    
    return currentSegment.chapterIndex;
  };
  
  // 세그먼트 변경시 현재 챕터 업데이트
  useEffect(() => {
    if (episode?.chapters) {
      const chapterIndex = getCurrentChapterFromSegment();
      setCurrentChapterIndex(chapterIndex);
    }
  }, [currentSegmentIndex, episode?.chapters]);
  
  // 챕터 선택 핸들러
  const handleChapterSelect = (chapterIndex: number) => {
    if (!episode?.segments || !episode?.chapters) return;
    
    // 해당 챕터의 첫 번째 세그먼트 찾기
    const firstSegmentIndex = episode.segments.findIndex(
      segment => segment.chapterIndex === chapterIndex
    );
    
    if (firstSegmentIndex !== -1) {
      jumpToSegment(firstSegmentIndex);
      setCurrentChapterIndex(chapterIndex);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <audio 
        ref={audioRef} 
        preload="metadata"
        onError={(e) => {
          const segmentIndex = currentSegmentIndex + 1;
          console.error(`🔊 세그먼트 ${segmentIndex} 오디오 엘리먼트 오류:`, {
            error: e.currentTarget.error,
            src: e.currentTarget.src,
            networkState: e.currentTarget.networkState,
            readyState: e.currentTarget.readyState,
            segmentIndex
          });
        }}
        onLoadStart={() => {
          const segmentIndex = currentSegmentIndex + 1;
          console.log(`🔊 세그먼트 ${segmentIndex} 로드 시작:`, {
            src: audioRef.current?.src,
            segmentIndex
          });
        }}
        onLoadedData={() => {
          const segmentIndex = currentSegmentIndex + 1;
          console.log(`✅ 세그먼트 ${segmentIndex} 로드 완료`);
        }}
      />
      
      {/* 미리로드용 숨은 audio 엘리먼트 */}
      <audio 
        ref={preloadAudioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />
      
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-black dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {locationName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {episode ? 
                `${episode.segments[currentSegmentIndex]?.chapterTitle || '챕터 정보 없음'}` : 
                'NotebookLM 스타일 팟캐스트 대기 중'
              }
            </p>
          </div>
        </div>
        
        {/* 챕터 목록 토글 버튼 */}
        {episode?.chapters && episode.chapters.length > 0 && (
          <button
            onClick={() => setShowChapterList(!showChapterList)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
          >
            <List className="w-4 h-4" />
            <span className="text-sm">챕터</span>
            {showChapterList ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* 팟캐스트가 없을 때 - 생성 버튼 및 옵션 */}
      {!episode && !isGenerating && (
        <div className="space-y-4">
          {/* 설정 옵션 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              팟캐스트 설정
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">우선순위</label>
                <select 
                  value={podcastOptions.priority}
                  onChange={(e) => setPodcastOptions({...podcastOptions, priority: e.target.value as any})}
                  className="w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1"
                >
                  <option value="engagement">몰입감</option>
                  <option value="accuracy">정확성</option>
                  <option value="emotion">감정</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">청중 수준</label>
                <select 
                  value={podcastOptions.audienceLevel}
                  onChange={(e) => setPodcastOptions({...podcastOptions, audienceLevel: e.target.value as any})}
                  className="w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1"
                >
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">스타일</label>
                <select 
                  value={podcastOptions.podcastStyle}
                  onChange={(e) => setPodcastOptions({...podcastOptions, podcastStyle: e.target.value as any})}
                  className="w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1"
                >
                  <option value="educational">교육적</option>
                  <option value="deep-dive">심화 탐구</option>
                  <option value="casual">캐주얼</option>
                  <option value="exploratory">탐험적</option>
                </select>
              </div>
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={generateNotebookLMPodcast}
            className="w-full bg-black hover:bg-gray-800 dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Mic className="w-5 h-5" />
            <span>NotebookLM 스타일 전체 팟캐스트 생성</span>
          </button>
        </div>
      )}

      {/* 생성 중 */}
      {isGenerating && (
        <div className="space-y-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-black dark:text-purple-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              NotebookLM 스타일 팟캐스트 생성 중...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-black dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {generationProgress}% 완료
            </p>
          </div>
        </div>
      )}

      {/* 챕터 목록 */}
      {episode?.chapters && showChapterList && (
        <div className="mb-6">
          <ChapterList 
            chapters={episode.chapters}
            currentChapterIndex={currentChapterIndex}
            onChapterSelect={handleChapterSelect}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          />
        </div>
      )}

      {/* 팟캐스트 플레이어 */}
      {episode && (
        <div className="space-y-4">
          {/* 순차 재생 메인 컨트롤 */}
          <div className="space-y-3">
            {/* 현재 대화 정보 */}
            {episode.segments[currentSegmentIndex] && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      챕터 {episode.segments[currentSegmentIndex]?.chapterIndex || 1}: {(episode.segments[currentSegmentIndex]?.chapterTitle || locationName).replace(new RegExp(`^챕터\\s*${episode.segments[currentSegmentIndex]?.chapterIndex || 1}\\s*[:：]\\s*`, 'i'), '')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(() => {
                      const currentChapterIndex = episode.segments[currentSegmentIndex]?.chapterIndex || 1;
                      const currentChapter = episode.chapters?.find(ch => ch.chapterIndex === currentChapterIndex);
                      const currentChapterSegments = episode.segments.filter(seg => seg.chapterIndex === currentChapterIndex);
                      const chapterElapsedTime = currentChapterSegments
                        .slice(0, currentChapterSegments.findIndex(seg => seg.sequenceNumber === episode.segments[currentSegmentIndex].sequenceNumber) + 1)
                        .reduce((total, seg, index, arr) => {
                          if (index === arr.length - 1) {
                            return total + currentTime;
                          }
                          return total + seg.duration;
                        }, 0);
                      const chapterTotalTime = currentChapter?.estimatedDuration || currentChapterSegments.reduce((total, seg) => total + seg.duration, 0);
                      return `${formatTime(chapterElapsedTime)} / ${formatTime(chapterTotalTime)}`;
                    })()}
                  </span>
                </div>
              </div>
            )}
            
            {/* 컨트롤 버튼 - 한 줄로 배치 */}
            <div className="flex items-center justify-center space-x-3">
              {/* 이전/재생/다음 버튼 */}
              <button
                onClick={playPreviousSegment}
                disabled={currentSegmentIndex === 0}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="w-14 h-14 bg-black hover:bg-gray-800 dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
              
              <button
                onClick={playNextSegment}
                disabled={currentSegmentIndex === episode.segments.length - 1}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              
              {/* 구분선 */}
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2" />
              
              {/* 볼륨 컨트롤 */}
              <button onClick={toggleMute} className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-black dark:accent-purple-600"
              />
              
              {/* 구분선 */}
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2" />
              
              {/* 재생 속도 */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">속도:</span>
                {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`text-xs px-2 py-1 rounded ${
                      playbackRate === rate 
                        ? 'bg-black dark:bg-purple-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
            
            {/* 진행률 바 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>{formatTime(totalElapsedTime)}</span>
                <span>{formatTime(episode.totalDuration)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-black dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${episode.totalDuration ? (totalElapsedTime / episode.totalDuration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>현재 대화 진행: {formatTime(currentTime)}</span>
                <span>대화 길이: {formatTime(episode.segments[currentSegmentIndex]?.duration || 0)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  );
};

export default NotebookLMPodcastPlayer;
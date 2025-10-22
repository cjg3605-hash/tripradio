'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  ChevronUp,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';

interface ChapterInfo {
  index: number;
  title: string;
  description: string;
  estimatedDuration: number;
  estimatedSegments: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

interface ChapterBasedPodcastGeneratorProps {
  locationName: string;
  className?: string;
  language?: string;
  onGenerationComplete?: (episodeData: any) => void;
}

interface GeneratedSegment {
  sequenceNumber: number;
  speaker: 'male' | 'female';
  duration: number;
  fileName: string;
  filePath: string;
}

const ChapterBasedPodcastGenerator: React.FC<ChapterBasedPodcastGeneratorProps> = ({
  locationName,
  className = '',
  language,
  onGenerationComplete
}) => {
  const { t, currentLanguage } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 상태 관리
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratingChapter, setCurrentGeneratingChapter] = useState(-1);
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  // 재생 관련 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [allSegments, setAllSegments] = useState<GeneratedSegment[]>([]);
  
  // 팟캐스트 옵션
  const [podcastOptions, setPodcastOptions] = useState({
    priority: 'engagement' as 'engagement' | 'accuracy' | 'emotion',
    audienceLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    podcastStyle: 'educational' as 'deep-dive' | 'casual' | 'educational' | 'exploratory'
  });

  // 페이지 로드시 기존 팟캐스트 확인
  useEffect(() => {
    checkExistingPodcast();
  }, [locationName, language]);

  const checkExistingPodcast = async () => {
    try {
      const response = await fetch(`/api/tts/notebooklm/generate-by-chapter?location=${encodeURIComponent(locationName)}&language=${language || currentLanguage}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 기존 에피소드 조회 결과:', result);
        
        if (result.success && result.data.hasEpisode) {
          if (result.data.status === 'completed') {
            // 완료된 팟캐스트 로드
            loadCompletedPodcast(result.data);
          } else {
            // 진행 중인 팟캐스트 상태 로드
            loadInProgressPodcast(result.data);
          }
        }
      }
    } catch (error) {
      console.warn('기존 팟캐스트 확인 실패:', error);
    }
  };

  const loadCompletedPodcast = (data: any) => {
    console.log('✅ 완료된 팟캐스트 로드:', data);
    
    // 챕터별 상태 설정
    const chapterInfos = data.chapters.map((chapter: any) => ({
      index: chapter.chapterIndex,
      title: `챕터 ${chapter.chapterIndex}`,
      description: chapter.segmentCount + '개 세그먼트',
      estimatedDuration: chapter.totalDuration,
      estimatedSegments: chapter.segmentCount,
      status: 'completed' as const
    }));
    
    setChapters(chapterInfos);
    setIsInitialized(true);
    setEpisodeId(data.episodeId);
    
    // 모든 세그먼트 로드
    const segments = data.chapters.flatMap((chapter: any) => 
      chapter.files.map((file: any) => ({
        sequenceNumber: file.sequenceNumber,
        speaker: file.speakerType,
        duration: file.duration,
        fileName: `segment-${file.sequenceNumber}.mp3`,
        filePath: file.audioUrl
      }))
    );
    
    setAllSegments(segments);
  };

  const loadInProgressPodcast = (data: any) => {
    console.log('🔄 진행 중인 팟캐스트 로드:', data);
    
    // 진행 상태에 따라 챕터 상태 설정
    const chapterInfos = data.chapters?.map((chapter: any, index: number) => ({
      index,
      title: `챕터 ${index + 1}`,
      description: chapter.description || `예상 ${chapter.estimatedSegments}개 세그먼트`,
      estimatedDuration: chapter.estimatedDuration,
      estimatedSegments: chapter.estimatedSegments,
      status: chapter.segmentCount > 0 ? 'completed' : 'pending' as const
    })) || [];
    
    setChapters(chapterInfos);
    setIsInitialized(true);
    setEpisodeId(data.episodeId);
  };

  // 1단계: 초기화
  const initializePodcast = async () => {
    try {
      console.log('🚀 팟캐스트 구조 초기화 시작');
      
      // ✅ 타임아웃 설정 (2분)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      const response = await fetch('/api/tts/notebooklm/generate-by-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName,
          language: language || currentLanguage,
          action: 'init'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '초기화에 실패했습니다.');
      }

      console.log('✅ 초기화 완료:', result.data);
      
      // 챕터 상태 설정
      const chapterInfos = result.data.chapters.map((chapter: any) => ({
        index: chapter.index,
        title: chapter.title,
        description: chapter.description,
        estimatedDuration: chapter.estimatedDuration,
        estimatedSegments: chapter.estimatedSegments,
        status: 'pending' as const
      }));
      
      setChapters(chapterInfos);
      setEpisodeId(result.data.episodeId);
      setIsInitialized(true);

      return result.data;
    } catch (error) {
      console.error('❌ 초기화 실패:', error);
      throw error;
    }
  };

  // 2단계: 챕터별 생성
  const generateChapter = async (chapterIndex: number) => {
    try {
      console.log(`🎤 챕터 ${chapterIndex} 생성 시작`);
      
      // 챕터 상태를 generating으로 변경
      setChapters(prev => prev.map(ch => 
        ch.index === chapterIndex 
          ? { ...ch, status: 'generating' }
          : ch
      ));
      
      // ✅ 챕터별 타임아웃 설정 (3분)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);
      
      const response = await fetch('/api/tts/notebooklm/generate-by-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName,
          language: language || currentLanguage,
          action: 'generate_chapter',
          chapterIndex
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `챕터 ${chapterIndex} 생성에 실패했습니다.`);
      }

      console.log(`✅ 챕터 ${chapterIndex} 생성 완료:`, result.data);
      
      // 챕터 상태를 completed로 변경
      setChapters(prev => prev.map(ch => 
        ch.index === chapterIndex 
          ? { ...ch, status: 'completed' }
          : ch
      ));
      
      // 생성된 세그먼트를 전체 목록에 추가
      const newSegments = result.data.files.map((file: any) => ({
        sequenceNumber: file.sequenceNumber,
        speaker: file.speaker,
        duration: file.duration,
        fileName: file.fileName,
        filePath: file.filePath
      }));
      
      setAllSegments(prev => [...prev, ...newSegments].sort((a, b) => a.sequenceNumber - b.sequenceNumber));

      return result.data;
    } catch (error) {
      console.error(`❌ 챕터 ${chapterIndex} 생성 실패:`, error);
      
      // 챕터 상태를 error로 변경
      setChapters(prev => prev.map(ch => 
        ch.index === chapterIndex 
          ? { ...ch, status: 'error' }
          : ch
      ));
      
      throw error;
    }
  };

  // 3단계: 최종화
  const finalizePodcast = async () => {
    try {
      console.log('🏁 팟캐스트 최종화 시작');

      // ✅ 최종화 타임아웃 설정 (2분 - 서버 처리 시간 확보)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      const response = await fetch('/api/tts/notebooklm/generate-by-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName,
          language: language || currentLanguage,
          action: 'finalize'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '최종화에 실패했습니다.');
      }

      console.log('🎉 팟캐스트 최종화 완료!', result.data);
      
      if (onGenerationComplete) {
        onGenerationComplete(result.data);
      }

      return result.data;
    } catch (error) {
      console.error('❌ 최종화 실패:', error);
      throw error;
    }
  };

  // ✅ 정확한 진행률 계산 시스템
  const calculateAccurateProgress = (stage: string, chapterIndex: number, totalChapters: number) => {
    const stages = {
      'init': { weight: 15, name: '초기화 중' },
      'chapters': { weight: 70, name: '챕터 생성 중' },
      'finalize': { weight: 15, name: '최종 처리 중' }
    };
    
    let progress = 0;
    
    if (stage === 'init') {
      progress = Math.min(stages.init.weight, 15);
    } else if (stage === 'chapters' && totalChapters > 0) {
      progress = stages.init.weight + (chapterIndex / totalChapters) * stages.chapters.weight;
    } else if (stage === 'finalize') {
      progress = stages.init.weight + stages.chapters.weight + Math.random() * 10; // 85-95%
    } else if (stage === 'completed') {
      progress = 100; // 완료시에만 100%
    }
    
    // ✅ 98% 멈춤 방지: 완료 전까지는 최대 97%로 제한
    return Math.min(Math.floor(progress), stage === 'completed' ? 100 : 97);
  };

  // 전체 생성 프로세스
  const generateFullPodcast = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setCurrentGeneratingChapter(-1);

    try {
      // 1단계: 초기화 (이미 초기화된 경우 건너뜀)
      if (!isInitialized) {
        console.log('📋 1단계: 초기화 시작');
        setGenerationProgress(calculateAccurateProgress('init', 0, chapters.length));
        await initializePodcast();
      }

      // 2단계: 각 챕터 순차 생성
      console.log('🎤 2단계: 챕터별 생성 시작');
      for (let i = 0; i < chapters.length; i++) {
        setCurrentGeneratingChapter(i);
        console.log(`📝 챕터 ${i + 1}/${chapters.length} 생성 중`);
        
        // ✅ 실제 진행률 계산
        setGenerationProgress(calculateAccurateProgress('chapters', i, chapters.length));
        
        await generateChapter(i);
        
        // ✅ 챕터 완료 후 진행률 업데이트
        setGenerationProgress(calculateAccurateProgress('chapters', i + 1, chapters.length));
        
        // 챕터 간 잠깐 대기 (API 부하 방지)
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // 3단계: 최종화
      console.log('🏁 3단계: 최종화 시작');
      setCurrentGeneratingChapter(-1);
      setGenerationProgress(calculateAccurateProgress('finalize', 0, chapters.length));
      
      await finalizePodcast();
      
      // ✅ 완료시에만 100% 설정
      setGenerationProgress(calculateAccurateProgress('completed', 0, chapters.length));
      console.log('🎉 전체 팟캐스트 생성 완료!');

    } catch (error) {
      console.error('❌ 팟캐스트 생성 실패:', error);
      
      let errorMessage = '팟캐스트 생성에 실패했습니다.';
      if (error instanceof Error) {
        // ✅ 사용자 친화적 에러 메시지
        if (error.name === 'AbortError') {
          errorMessage = '처리 시간이 길어지고 있습니다. 서버가 아직 작업 중일 수 있으니 잠시 후 다시 확인해주세요.';
        } else if (error.message.includes('fetch')) {
          errorMessage = '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
        } else if (error.message.includes('timeout')) {
          errorMessage = '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setCurrentGeneratingChapter(-1);
      setGenerationProgress(0);
    }
  };

  // 재생 제어
  const togglePlayPause = async () => {
    if (!allSegments || allSegments.length === 0) {
      setError('재생할 세그먼트가 없습니다. 먼저 팟캐스트를 생성해주세요.');
      return;
    }
    
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const currentSegment = allSegments[currentSegmentIndex];
        if (audioRef.current.src !== currentSegment.filePath) {
          audioRef.current.src = currentSegment.filePath;
          audioRef.current.load();
          
          // 설정 복원
          audioRef.current.volume = volume;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.muted = isMuted;
        }
        
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('❌ 재생 실패:', error);
      setError(`세그먼트 ${currentSegmentIndex + 1} 재생에 실패했습니다.`);
    }
  };

  const playNextSegment = () => {
    if (currentSegmentIndex < allSegments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
    }
  };

  const playPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
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

  // 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      if (currentSegmentIndex < allSegments.length - 1) {
        playNextSegment();
      } else {
        setIsPlaying(false);
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentSegmentIndex, allSegments.length]);

  // 세그먼트 변경시 자동 로드
  useEffect(() => {
    if (allSegments.length > 0 && audioRef.current) {
      const currentSegment = allSegments[currentSegmentIndex];
      if (currentSegment) {
        audioRef.current.src = currentSegment.filePath;
        audioRef.current.load();
        
        // 설정 유지
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.muted = isMuted;
      }
    }
  }, [currentSegmentIndex, allSegments]);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <audio 
        ref={audioRef} 
        preload="metadata"
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
              챕터별 순차 생성 팟캐스트
            </p>
          </div>
        </div>
      </div>

      {/* 초기화되지 않았을 때 - 설정 및 초기화 버튼 */}
      {!isInitialized && !isGenerating && (
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
            onClick={generateFullPodcast}
            className="w-full bg-black hover:bg-gray-800 dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
          >
            <Mic className="w-5 h-5" />
            <span>챕터별 순차 팟캐스트 생성</span>
          </button>
        </div>
      )}

      {/* 생성 중 */}
      {isGenerating && (
        <div className="space-y-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-black dark:text-purple-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {currentGeneratingChapter >= 0 
                ? `챕터 ${currentGeneratingChapter + 1} 생성 중...`
                : '팟캐스트 준비 중...'
              }
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

      {/* 챕터 진행 상황 */}
      {isInitialized && chapters.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">챕터별 진행 상황</h4>
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <div 
                key={chapter.index}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  chapter.status === 'completed' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : chapter.status === 'generating'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : chapter.status === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex-shrink-0">
                  {chapter.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : chapter.status === 'generating' ? (
                    <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                  ) : chapter.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      {chapter.title}
                    </h5>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(chapter.estimatedDuration)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {chapter.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 재생 컨트롤 */}
      {allSegments.length > 0 && (
        <div className="space-y-4">
          {/* 현재 재생 정보 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                세그먼트 {currentSegmentIndex + 1} / {allSegments.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                화자: {allSegments[currentSegmentIndex]?.speaker === 'male' ? '남성' : '여성'}
              </span>
            </div>
          </div>
          
          {/* 재생 버튼 */}
          <div className="flex items-center justify-center space-x-3">
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
              disabled={currentSegmentIndex === allSegments.length - 1}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center transition-all duration-300"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          
          {/* 볼륨 및 재생속도 컨트롤 */}
          <div className="flex items-center justify-center space-x-4">
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

export default ChapterBasedPodcastGenerator;
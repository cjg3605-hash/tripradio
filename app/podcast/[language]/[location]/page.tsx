'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, 
  Headphones, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  User,
  Users
} from 'lucide-react';
import Link from 'next/link';
import ChapterList from '@/components/audio/ChapterList';

interface DialogueSegment {
  sequenceNumber: number;
  speakerType: 'male' | 'female';
  audioUrl: string;
  duration: number;
  textContent: string;
  chapterIndex?: number;
  chapterTitle?: string;
}

interface ChapterInfo {
  chapterIndex: number;
  title: string;
  description: string;
  segmentCount: number;
  estimatedDuration: number;
  contentFocus: string[];
}

interface SegmentInfo {
  sequenceNumber: number;
  speakerType: 'male' | 'female';
  audioUrl: string;
  duration: number;
  textContent: string;
  chapterIndex: number;
  chapterTitle: string;
}

interface PodcastEpisode {
  episodeId: string;
  status: 'completed' | 'script_ready';
  userScript: string;
  totalDuration: number;
  segmentCount: number;
  segments: DialogueSegment[];
  chapters?: ChapterInfo[];
  metadata?: {
    folderPath: string;
    totalFileSize: number;
    maleSegments: number;
    femaleSegments: number;
    generationTime: number;
  };
  qualityScore?: number;
}

export default function PremiumPodcastPage() {
  const params = useParams();
  const { currentLanguage, t } = useLanguage();
  
  // 번역 함수에서 문자열 추출 헬퍼
  const getTranslationString = (key: string): string => {
    const result = t(key);
    return Array.isArray(result) ? result[0] || key : result || key;
  };
  
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // 팟캐스트 상태
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // 오디오 플레이어 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !episode?.segments) return;

    const handleTimeUpdate = () => {
      const currentSegmentTime = audio.currentTime;
      setCurrentTime(currentSegmentTime);
      
      // 전체 경과 시간 계산
      const previousSegmentsTime = episode.segments
        .slice(0, currentSegmentIndex)
        .reduce((total, segment) => total + (isNaN(segment.duration) ? 0 : segment.duration), 0);
      
      // NaN 방지: currentSegmentTime이 유효한 숫자인지 확인
      const validCurrentTime = isNaN(currentSegmentTime) ? 0 : currentSegmentTime;
      setTotalElapsedTime(previousSegmentsTime + validCurrentTime);
    };
    
    const handleEnded = () => {
      if (currentSegmentIndex < episode.segments.length - 1) {
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
  }, [episode, currentSegmentIndex]);

  // 에피소드 로드 시 첫 번째 세그먼트 준비
  useEffect(() => {
    if (episode?.segments && episode.segments.length > 0) {
      setCurrentSegmentIndex(0);
      if (audioRef.current) {
        audioRef.current.src = episode.segments[0].audioUrl;
        audioRef.current.load();
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.muted = isMuted;
      }
    }
  }, [episode]);

  const playNextSegment = () => {
    if (!episode?.segments || currentSegmentIndex >= episode.segments.length - 1) return;
    
    const nextIndex = currentSegmentIndex + 1;
    setCurrentSegmentIndex(nextIndex);
    loadAndPlaySegment(nextIndex, true);
  };

  const playPreviousSegment = () => {
    if (!episode?.segments || currentSegmentIndex <= 0) return;
    
    const prevIndex = currentSegmentIndex - 1;
    setCurrentSegmentIndex(prevIndex);
    loadAndPlaySegment(prevIndex, true);
  };

  const loadAndPlaySegment = async (segmentIndex: number, shouldAutoPlay: boolean = isPlaying) => {
    if (!episode?.segments || !audioRef.current) return;
    
    const segment = episode.segments[segmentIndex];
    
    try {
      audioRef.current.src = segment.audioUrl;
      audioRef.current.load();
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isMuted;
      
      if (shouldAutoPlay) {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(`세그먼트 ${segmentIndex + 1} 재생 실패:`, error);
    }
  };

  const jumpToSegment = (segmentIndex: number) => {
    if (!episode?.segments || segmentIndex < 0 || segmentIndex >= episode.segments.length) return;
    
    setCurrentSegmentIndex(segmentIndex);
    loadAndPlaySegment(segmentIndex);
  };

  const togglePlayPause = async () => {
    // segments가 없으면 새로 생성
    if (!episode?.segments || episode.segments.length === 0) {
      console.log('⚠️ 세그먼트가 없음 - 새로 생성 필요:', {
        hasEpisode: !!episode,
        segmentCount: episode?.segments?.length || 0
      });
      await generatePodcast();
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

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const handleVolumeChange = (newVolume: number) => {
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

  useEffect(() => {
    if (params.location) {
      const decodedLocation = decodeURIComponent(params.location as string);
      setLocationName(decodedLocation);
      setIsLoading(false);
      checkExistingPodcast(decodedLocation);
    }
  }, [params.location]);

  // 에피소드 로드시 첫 번째 세그먼트 준비 (NotebookLMPodcastPlayer와 동일)
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

  const checkExistingPodcast = async (location: string) => {
    try {
      console.log('🔍 GET 요청 - 팟캐스트 조회:', { locationName: location, language: currentLanguage });
      const response = await fetch(`/api/tts/notebooklm/generate?location=${encodeURIComponent(location)}&language=${currentLanguage}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎙️ 기존 에피소드 조회 결과:', result);
        
        // 새로운 챕터 기반 구조 처리 (NotebookLMPodcastPlayer와 동일)
        if (result.success && result.data.hasEpisode && result.data.status === 'completed') {
          let allSegments: SegmentInfo[] = [];
          let chapterInfos: ChapterInfo[] = [];
          
          if (result.data.chapters && Array.isArray(result.data.chapters)) {
            // 챕터별 데이터에서 모든 세그먼트 추출
            let totalSegmentCount = 0;
            
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
              
              console.log(`🔍 페이지 - 챕터 ${chapter.chapterNumber} 파싱:`, {
                title: chapter.title,
                fileCount: chapter.files?.length || 0,
                hasFiles: !!chapter.files
              });
              
              // 챕터의 파일들을 개별 세그먼트로 변환
              if (chapter.files && Array.isArray(chapter.files)) {
                const chapterSegments = chapter.files.map((fileName: string, index: number) => {
                  const match = fileName.match(/^(\d+)-(\d+)ko\.mp3$/);
                  const segmentNumber = match ? parseInt(match[2]) : index + 1;
                  
                  const audioUrl = `https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/british-museum/${fileName}`;
                  
                  totalSegmentCount++;
                  
                  return {
                    sequenceNumber: totalSegmentCount,
                    speakerType: (segmentNumber % 2 === 1) ? 'male' : 'female' as 'male' | 'female',
                    audioUrl: audioUrl,
                    duration: 30,
                    textContent: `챕터 ${chapter.chapterNumber} - 세그먼트 ${segmentNumber}`,
                    chapterIndex: chapter.chapterNumber,
                    chapterTitle: chapter.title
                  };
                });
                
                console.log(`✅ 페이지 - 챕터 ${chapter.chapterNumber} 세그먼트 생성:`, chapterSegments.length + '개');
                allSegments.push(...chapterSegments);
              }
            });
            
            console.log('🎯 페이지 - 전체 세그먼트 파싱 완료:', {
              chapterCount: chapterInfos.length,
              totalSegments: allSegments.length,
              segmentsByChapter: chapterInfos.map(ch => `${ch.title}: ${ch.segmentCount}개`)
            });
          } else if (result.data.segments) {
            // 기존 평면 구조 지원 (fallback)
            allSegments = result.data.segments;
          }

          // 전체 duration을 segments의 duration 합계로 계산 (NaN 방지)
          const calculatedTotalDuration = allSegments.reduce((total, segment) => total + (isNaN(segment.duration) ? 0 : segment.duration), 0);
          
          const episodeData: PodcastEpisode = {
            episodeId: result.data.episodeId,
            status: result.data.status,
            userScript: result.data.userScript || '',
            totalDuration: calculatedTotalDuration || result.data.duration || 0,
            segmentCount: allSegments.length,
            segments: allSegments,
            chapters: chapterInfos,
            qualityScore: result.data.qualityScore || 0
          };
          
          console.log('✅ 페이지 - 기존 순차 재생 에피소드 발견:', {
            segmentCount: episodeData.segmentCount,
            totalDuration: `${Math.round(episodeData.totalDuration)}초`,
            hasSegments: episodeData.segments.length > 0,
            chapterCount: episodeData.chapters?.length || 0,
            chapters: episodeData.chapters
          });
          
          setEpisode(episodeData);
          setCurrentSegmentIndex(0);
          
          // 첫 번째 세그먼트를 오디오에 자동 로드 (바로 재생 준비)
          if (episodeData.segments.length > 0 && audioRef.current) {
            console.log('🎵 첫 번째 세그먼트 자동 로드:', episodeData.segments[0]);
            audioRef.current.src = episodeData.segments[0].audioUrl;
            audioRef.current.load();
            audioRef.current.volume = volume;
            audioRef.current.playbackRate = playbackRate;
            audioRef.current.muted = isMuted;
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

  const generatePodcast = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    // 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      console.log('🎙️ NotebookLM 스타일 전체 팟캐스트 생성 시작:', {
        locationName,
        language: currentLanguage,
        options: {
          priority: 'engagement',
          audienceLevel: 'intermediate',
          podcastStyle: 'educational'
        }
      });

      const response = await fetch('/api/tts/notebooklm/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName,
          language: currentLanguage,
          options: {
            priority: 'engagement',
            audienceLevel: 'intermediate',
            podcastStyle: 'educational'
          }
        })
      });

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

      console.log('✅ NotebookLM 순차 팟캐스트 생성 완료:', {
        totalDuration: `${Math.round(episodeData.totalDuration)}초`,
        segmentCount: episodeData.segmentCount,
        segments: episodeData.segments.length
      });

      // 생성 완료 후 첫 번째 세그먼트 자동 로드
      if (episodeData.segments.length > 0 && audioRef.current) {
        console.log('🎵 생성 완료 - 첫 번째 세그먼트 자동 로드:', episodeData.segments[0]);
        audioRef.current.src = episodeData.segments[0].audioUrl;
        audioRef.current.load();
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.muted = isMuted;
      }

    } catch (error) {
      console.error('❌ NotebookLM 팟캐스트 생성 실패:', error);
      setError(error instanceof Error ? error.message : '팟캐스트 생성에 실패했습니다.');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* 글래스 헤더 */}
      <header className="sticky top-0 z-40 glass-header backdrop-blur-xl bg-white/80 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-black/5 group-hover:bg-black/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium hidden sm:block">홈으로</span>
            </Link>
            
            <div className="text-center flex-1 mx-4">
              <div className="flex items-center justify-center space-x-3 mb-1">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {locationName}
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="w-20 sm:w-24"></div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          
          {/* 메인 플레이어 (왼쪽/상단) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 현재 대화 카드 - 에피소드가 있고 세그먼트가 로드된 경우만 표시 */}
            {episode && episode.segments && episode.segments.length > 0 && episode.segments[currentSegmentIndex] && (
              <div className="glass-effect rounded-lg p-6 sm:p-8 shadow-xl border border-gray-200/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      episode.segments[currentSegmentIndex].speakerType === 'male' 
                        ? 'bg-gray-900' : 'bg-gray-700'
                    }`}>
                      {episode.segments[currentSegmentIndex].speakerType === 'male' ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Users className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('podcast.chapterPrefix')} {episode.segments[currentSegmentIndex].chapterIndex || 1}: {(episode.segments[currentSegmentIndex].chapterTitle || locationName).replace(new RegExp(`^${t('podcast.chapterPrefix')}\\s*${episode.segments[currentSegmentIndex].chapterIndex || 1}\\s*[:：]\\s*`, 'i'), '')}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{(() => {
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
                    })()}</span>
                  </div>
                </div>
                

                {/* 메인 플레이어 컨트롤 */}
                <div className="space-y-6">
                  {/* 진행률 바 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>전체 진행률</span>
                      <span>{(() => {
                        if (!episode.totalDuration || episode.totalDuration <= 0 || isNaN(totalElapsedTime)) return '0%';
                        const progress = Math.round((totalElapsedTime / episode.totalDuration) * 100);
                        return isNaN(progress) ? '0%' : `${progress}%`;
                      })()}</span>
                    </div>
                    <div 
                      className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                      aria-label={getTranslationString('accessibility.progressBar')}
                      onClick={(e) => {
                        if (!episode || !audioRef.current) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        const targetTime = episode.totalDuration * percentage;
                        
                        // 해당 시간이 속하는 세그먼트 찾기
                        let cumulativeTime = 0;
                        let targetSegmentIndex = 0;
                        let segmentTime = 0;
                        
                        for (let i = 0; i < episode.segments.length; i++) {
                          if (cumulativeTime + episode.segments[i].duration > targetTime) {
                            targetSegmentIndex = i;
                            segmentTime = targetTime - cumulativeTime;
                            break;
                          }
                          cumulativeTime += episode.segments[i].duration;
                        }
                        
                        setCurrentSegmentIndex(targetSegmentIndex);
                        loadAndPlaySegment(targetSegmentIndex, false);
                        
                        // 세그먼트 내 시간으로 이동
                        setTimeout(() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = segmentTime;
                          }
                        }, 100);
                      }}
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-gray-800 to-black rounded-full transition-all duration-300"
                        style={{ width: `${(() => {
                          if (!episode.totalDuration || episode.totalDuration <= 0 || isNaN(totalElapsedTime)) return 0;
                          const progressWidth = (totalElapsedTime / episode.totalDuration) * 100;
                          return isNaN(progressWidth) ? 0 : progressWidth;
                        })()}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>현재: {formatTime(currentTime)}</span>
                      <span>세그먼트: {formatTime(episode.segments[currentSegmentIndex]?.duration || 0)}</span>
                    </div>
                  </div>

                  {/* 플레이어 컨트롤 */}
                  <div className="flex items-center justify-center space-x-6">
                    <button
                      onClick={playPreviousSegment}
                      disabled={currentSegmentIndex === 0}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                      aria-label={getTranslationString('accessibility.previousSegment')}
                    >
                      <SkipBack className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    <button
                      onClick={togglePlayPause}
                      className="w-16 h-16 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                      aria-label={isPlaying ? getTranslationString('accessibility.pauseButton') : getTranslationString('accessibility.playButton')}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7" />
                      ) : (
                        <Play className="w-7 h-7 ml-1" />
                      )}
                    </button>
                    
                    <button
                      onClick={playNextSegment}
                      disabled={currentSegmentIndex === episode.segments.length - 1}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                      aria-label={getTranslationString('accessibility.nextSegment')}
                    >
                      <SkipForward className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* 볼륨 및 속도 컨트롤 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={toggleMute}
                        className="text-gray-600 hover:text-gray-800"
                        aria-label={isMuted ? getTranslationString('accessibility.unmuteButton') : getTranslationString('accessibility.muteButton')}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div className="w-20 h-2 bg-gray-200 rounded-full cursor-pointer"
                           aria-label={getTranslationString('accessibility.volumeControl')}
                           onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const x = e.clientX - rect.left;
                             const newVolume = Math.max(0, Math.min(1, x / rect.width));
                             handleVolumeChange(newVolume);
                           }}>
                        <div
                          className="h-full bg-black rounded-full"
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            playbackRate === rate
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t(`playbackRates.${rate}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 팟캐스트 생성 - 에피소드가 없을 때만 표시 */}
            {!episode && !isGenerating && (
              <div className="glass-effect rounded-lg p-8 shadow-xl border border-gray-200/20 text-center">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <Headphones className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {locationName} 팟캐스트 생성
                </h2>
                <p className="text-gray-600 mb-8">
                  AI가 자연스러운 대화로 만드는 특별한 가이드 경험
                </p>
                <button
                  onClick={generatePodcast}
                  className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  팟캐스트 생성하기
                </button>
              </div>
            )}

            {/* 생성 중 */}
            {isGenerating && (
              <div className="glass-effect rounded-lg p-8 shadow-xl border border-gray-200/20 text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  팟캐스트 생성 중...
                </h3>
                <p className="text-gray-600 mb-4">
                  AI가 {locationName}에 대한 흥미로운 대화를 만들고 있어요
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{generationProgress}% 완료</p>
              </div>
            )}
          </div>

          {/* 사이드바 (오른쪽/하단) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 챕터 목록 - 챕터가 있는 경우만 표시 */}
            {episode && episode.chapters && episode.chapters.length > 0 && (
              <div className="glass-effect rounded-lg p-6 shadow-xl border border-gray-200/20">
                <ChapterList 
                  chapters={episode.chapters}
                  currentChapterIndex={episode.segments[currentSegmentIndex]?.chapterIndex || 1}
                  onChapterSelect={(chapterIndex) => {
                    // 선택된 챕터의 첫 번째 세그먼트 찾기
                    const chapterFirstSegmentIndex = episode.segments.findIndex(
                      segment => segment.chapterIndex === chapterIndex
                    );
                    if (chapterFirstSegmentIndex >= 0) {
                      jumpToSegment(chapterFirstSegmentIndex);
                    }
                  }}
                />
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 숨겨진 오디오 엘리먼트 */}
      <audio ref={audioRef} preload="metadata" />

      {/* 글래스 스타일을 위한 CSS */}
      <style jsx global>{`
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
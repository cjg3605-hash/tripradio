'use client';
// Force cache invalidation v4 - 2025-01-13

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';
import type { SupportedLanguage } from '@/contexts/LanguageContext';
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
import { supabase } from '@/lib/supabaseClient';
import LocationSlugService from '@/lib/location/location-slug-service';

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
  audioUrl: string | null; // script_ready 상태에서는 null일 수 있음
  duration: number;
  textContent: string;
  chapterIndex: number;
  chapterTitle: string;
}

interface PodcastEpisode {
  episodeId: string;
  status: 'generating' | 'completed' | 'script_ready' | 'failed';
  userScript: string;
  totalDuration: number;
  segmentCount: number;
  segments: SegmentInfo[];  // Fixed: Changed from DialogueSegment[] to SegmentInfo[] for type consistency
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
  const { currentLanguage, setLanguage, t } = useLanguage();
  const routeLanguage = useMemo<SupportedLanguage | null>(() => {
    const param = params?.language;
    const raw = Array.isArray(param) ? param[0] : param;
    if (!raw) return null;
    const normalized = raw.toLowerCase();
    return SUPPORTED_LANGUAGES.some(lang => lang.code === normalized)
      ? (normalized as SupportedLanguage)
      : null;
  }, [params?.language]);
  const effectiveLanguage = routeLanguage ?? currentLanguage;
  
  useEffect(() => {
    if (!routeLanguage) return;
    if (routeLanguage !== currentLanguage) {
      setLanguage(routeLanguage);
    }
  }, [routeLanguage, currentLanguage, setLanguage]);
  
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
      if (audioRef.current && episode.segments[0].audioUrl) {
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

    // 🔧 NEW: audio_url이 null인 경우 처리 - TEST 4 해결
    if (!segment.audioUrl) {
      console.warn('⚠️ 세그먼트의 오디오 URL이 없음:', segmentIndex);

      // script_ready 상태이면 다음 유효한 세그먼트 찾기
      if (episode.status === 'script_ready') {
        console.log('🔧 TTS 생성 필요, 다음 유효한 세그먼트 탐색...');

        // 다음 세그먼트 중 오디오가 있는 것 찾기
        for (let i = segmentIndex + 1; i < episode.segments.length; i++) {
          if (episode.segments[i].audioUrl) {
            console.log(`🔄 다음 유효한 세그먼트로 이동: ${i + 1}`);
            return loadAndPlaySegment(i, shouldAutoPlay);
          }
        }

        console.log('📭 재생 가능한 오디오가 없음');
        setIsPlaying(false);
      }
      return;
    }

    try {
      // 🔧 FIX: 새 오디오 로드 전에 현재 재생 중지 (play() interrupted 에러 방지)
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }

      // 약간의 지연을 주어 pause()가 완료될 시간 확보
      await new Promise(resolve => setTimeout(resolve, 50));

      audioRef.current.src = segment.audioUrl;
      audioRef.current.load();
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.muted = isMuted;

      if (shouldAutoPlay) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playError) {
          // play() 실패 시 자동으로 다음 세그먼트로 이동하지 않고 사용자에게 알림
          console.warn(`⚠️ 세그먼트 ${segmentIndex + 1} 자동 재생 실패 (사용자 상호작용 필요):`, playError);
          setIsPlaying(false);
        }
      }
    } catch (error) {
      console.error(`❌ 세그먼트 ${segmentIndex + 1} 로드 실패:`, error);
      setIsPlaying(false);
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

    // 🔧 NEW: audio_url이 null인 경우 처리 (script_ready 상태) - TEST 4 해결
    if (!currentSegment.audioUrl) {
      console.log('🔧 TTS 오디오 파일 생성 필요:', {
        segmentIndex: currentSegmentIndex,
        status: episode.status
      });

      if (episode.status === 'script_ready') {
        setError('🎵 오디오를 생성 중입니다. 잠시만 기다려주세요...');
        setIsGenerating(true);

        try {
          console.log('🎵 TTS 생성 API 호출 시작...');
          // TTS 생성 API 호출
          const generateResponse = await fetch('/api/tts/notebooklm/generate-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              episodeId: episode.episodeId,
              language: effectiveLanguage,
              segments: episode.segments
            })
          });

          if (generateResponse.ok) {
            const result = await generateResponse.json();
            console.log('✅ TTS 생성 완료:', {
              generatedCount: result.data?.generatedCount,
              status: result.data?.status
            });

            // episode 업데이트
            if (result.data && result.data.segments) {
              setEpisode(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  status: 'completed',
                  segments: prev.segments.map((seg, idx) => {
                    const newAudioUrl = result.data.segments[idx]?.audioUrl;
                    return newAudioUrl ? { ...seg, audioUrl: newAudioUrl } : seg;
                  })
                };
              });
            }

            setError(null);
            // 재생 재시도
            console.log('🔄 TTS 생성 후 재생 재시도...');
            await togglePlayPause();
          } else {
            const errorData = await generateResponse.json().catch(() => ({}));
            console.error('❌ TTS 생성 실패:', errorData);
            setError(`❌ 오디오 생성 실패: ${errorData.error || '서버 오류'}\n다시 시도해주세요.`);
          }
        } catch (error) {
          console.error('❌ TTS 생성 중 오류:', error);
          setError('❌ 오디오 생성 중 오류가 발생했습니다.\n네트워크 연결을 확인해주세요.');
        } finally {
          setIsGenerating(false);
        }
      } else {
        setError('⚠️ 오디오 파일을 사용할 수 없습니다.');
      }
      return;
    }

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
      setError(`❌ 재생 실패: 다시 시도해주세요.`);

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
    const rawLocation = params?.location;
    if (!rawLocation) return;

    const locationParam = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
    if (!locationParam) return;

    const decodedLocation = decodeURIComponent(locationParam);
    setLocationName(decodedLocation);
    setIsLoading(false);
    checkExistingPodcast(decodedLocation, effectiveLanguage);
  }, [params?.location, effectiveLanguage]);

  // 에피소드 로드시 첫 번째 세그먼트 준비 (NotebookLMPodcastPlayer와 동일)
  useEffect(() => {
    if (episode?.segments && episode.segments.length > 0) {
      console.log('🎵 첫 번째 세그먼트 준비:', episode.segments[0]);
      setCurrentSegmentIndex(0);

      // 첫 번째 세그먼트를 오디오 엘리먼트에 로드 (자동 재생은 하지 않음)
      if (audioRef.current && episode.segments[0].audioUrl) {
        audioRef.current.src = episode.segments[0].audioUrl;
        audioRef.current.load();

        // 설정 적용
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.muted = isMuted;
      }
    }
  }, [episode]);

  // 🔧 NEW: 'generating' 상태 에피소드의 자동 갱신
  useEffect(() => {
    if (!episode || episode.status !== 'generating') return;

    console.log('🔄 generating 상태 감지 - 자동 갱신 시작:', episode.episodeId);
    setIsGenerating(true);
    setGenerationProgress(50); // 초기 진행률

    const refreshInterval = setInterval(async () => {
      console.log('🔄 상태 갱신 시도:', { episodeId: episode.episodeId, location: locationName });

      try {
        const response = await fetch(`/api/tts/notebooklm/generate?location=${encodeURIComponent(locationName)}&language=${effectiveLanguage}`);

        if (response.ok) {
          const result = await response.json();
          console.log('📊 갱신된 에피소드 상태:', result.data?.status);

          // 상태가 변경되었으면 setEpisode 호출
          if (result.success && result.data.hasEpisode) {
            const newStatus = result.data.status;

            // 완료 또는 script_ready 상태로 변경된 경우
            if (newStatus === 'completed' || newStatus === 'script_ready') {
              console.log(`✅ 에피소드 생성 완료: ${newStatus}`);
              setIsGenerating(false);
              setGenerationProgress(100);

              // 에피소드 다시 로드하여 새로운 데이터 반영
              checkExistingPodcast(locationName, effectiveLanguage);
              clearInterval(refreshInterval);
            } else if (newStatus === 'failed') {
              console.log('❌ 에피소드 생성 실패');
              setIsGenerating(false);
              setError('팟캐스트 생성에 실패했습니다. 다시 시도해주세요.');
              clearInterval(refreshInterval);
            } else {
              // 여전히 generating 상태
              setGenerationProgress(prev => Math.min(prev + Math.random() * 15, 95));
            }
          }
        }
      } catch (error) {
        console.error('❌ 상태 갱신 중 오류:', error);
      }
    }, 3000); // 3초마다 확인

    return () => {
      clearInterval(refreshInterval);
    };
  }, [episode?.status, locationName, effectiveLanguage, episode?.episodeId]);

  /**
   * 스토리지 검증: TTS 오디오 파일과 DB 매칭 확인
   * 클라이언트 사이드에서는 간단한 확인만 수행합니다
   */
  const verifyStorageIntegrity = async (episodeData: any, locationName: string, language: string) => {
    try {
      console.log('🔍 클라이언트 스토리지 검증 시작:', { locationName, language, episodeId: episodeData.episodeId });

      // 클라이언트에서는 API를 통한 간단한 검증만 수행
      const response = await fetch(`/api/podcast/verify-storage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName,
          language,
          episodeData
        })
      });

      if (!response.ok) {
        console.warn('⚠️ 스토리지 검증 API 실패:', response.status);
        return {
          isValid: false,
          reason: 'api_error',
          status: response.status
        };
      }

      const result = await response.json();
      console.log(result.isValid ? '✅ 스토리지 검증 성공' : '❌ 스토리지 검증 실패', result);
      return result;

    } catch (error) {
      console.error('❌ 스토리지 검증 중 오류:', error);
      return {
        isValid: false,
        reason: 'verification_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkExistingPodcast = async (location: string, language: SupportedLanguage) => {
    try {
      console.log('🔍 GET 요청 - 팟캐스트 조회:', { locationName: location, language });
      const response = await fetch(`/api/tts/notebooklm/generate?location=${encodeURIComponent(location)}&language=${language}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎙️ 기존 에피소드 조회 결과:', result);

        // 새로운 챕터 기반 구조 처리 (NotebookLMPodcastPlayer와 동일)
        // script_ready, generating 상태도 포함 - 세그먼트가 있거나 생성 중이면 페이지 표시
        if (result.success && result.data.hasEpisode && (result.data.status === 'completed' || result.data.status === 'script_ready' || result.data.status === 'generating')) {
          let allSegments: SegmentInfo[] = [];
          let chapterInfos: ChapterInfo[] = [];
          
          // 스토리지 검증을 먼저 수행하여 폴더 경로 확인
          console.log('🔍 스토리지 무결성 검증 시작...');
          const storageVerification = await verifyStorageIntegrity(result.data, location, language);
          let audioFolderPath = 'podcasts/louvre-museum'; // 기본값
          
          if (storageVerification.isValid && storageVerification.folderPath) {
            audioFolderPath = storageVerification.folderPath;
            console.log('✅ 스토리지 검증 성공 - 폴더 경로:', audioFolderPath);
          } else {
            console.warn('⚠️ 스토리지 검증 실패 - 기본 경로 사용:', audioFolderPath);
          }
          
          // 데이터베이스에서 실제 세그먼트 데이터 가져오기
          console.log('🔍🔍🔍 [NEW CODE v3] 데이터베이스에서 세그먼트 조회:', result.data.episodeId);
          const { data: dbSegments, error: segmentError } = await supabase
            .from('podcast_segments')
            .select('sequence_number, speaker_name, speaker_type, text_content, audio_url, duration_seconds, chapter_index')
            .eq('episode_id', result.data.episodeId)
            .order('sequence_number', { ascending: true });

          if (segmentError) {
            console.error('❌ 세그먼트 조회 실패:', segmentError);
          } else {
            console.log(`✅ DB에서 ${dbSegments?.length}개 세그먼트 조회 성공`);
          }

          if (result.data.chapters && Array.isArray(result.data.chapters)) {
            // 챕터별 정보 생성
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
            });

            // DB에서 가져온 세그먼트를 사용
            if (dbSegments && dbSegments.length > 0) {
              allSegments = dbSegments.map((seg: any) => ({
                sequenceNumber: seg.sequence_number,
                speakerType: (seg.speaker_name === 'Host' || seg.speaker_type === 'male') ? 'male' : 'female',
                audioUrl: seg.audio_url && seg.audio_url.startsWith('http')
                  ? seg.audio_url
                  : seg.audio_url
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${seg.audio_url}`
                    : null,
                duration: seg.duration_seconds || 30,
                textContent: seg.text_content || '',
                chapterIndex: seg.chapter_index,
                chapterTitle: chapterInfos.find(ch => ch.chapterIndex === seg.chapter_index)?.title || ''
              }));

              console.log(`✅ DB 세그먼트를 allSegments로 변환: ${allSegments.length}개`);
            } else {
              console.warn('⚠️ DB에서 세그먼트를 가져오지 못함 (generating 상태일 수 있음) - 빈 배열로 진행');
              // 🔧 NEW: segment가 0개여도 episodes가 있으면 UI 표시
              // generating 상태이면 "생성 중..." 표시, 아니면 "준비 중..." 표시
              allSegments = [];
              // 파일 기반 fallback (기존 로직)
              let totalSegmentCount = 0;
              result.data.chapters.forEach((chapter: any) => {
                if (chapter.files && Array.isArray(chapter.files)) {
                  const sortedFiles = [...chapter.files].sort((a, b) => {
                    const matchA = a.match(/^(\d+)-(\d+)ko\.mp3$/);
                    const matchB = b.match(/^(\d+)-(\d+)ko\.mp3$/);
                    if (!matchA || !matchB) return 0;

                    const chapterA = parseInt(matchA[1]);
                    const chapterB = parseInt(matchB[1]);
                    const segmentA = parseInt(matchA[2]);
                    const segmentB = parseInt(matchB[2]);

                    if (chapterA === chapterB) {
                      return segmentA - segmentB;
                    }
                    return chapterA - chapterB;
                  });

                  const chapterSegments = sortedFiles.map((fileName: string, index: number) => {
                    const match = fileName.match(/^(\d+)-(\d+)ko\.mp3$/);
                    const segmentNumber = match ? parseInt(match[2]) : index + 1;
                    const audioUrl = `https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/${audioFolderPath}/${fileName}`;
                    totalSegmentCount++;

                    return {
                      sequenceNumber: totalSegmentCount,
                      speakerType: (segmentNumber % 2 === 1) ? 'male' : 'female' as 'male' | 'female',
                      audioUrl: audioUrl,
                      duration: 30,
                      textContent: '(대화 내용 로드 중...)',
                      chapterIndex: chapter.chapterNumber,
                      chapterTitle: chapter.title
                    };
                  });

                  allSegments.push(...chapterSegments);
                }
              });
            }
          }

          // 🔧 NEW: chapters가 비어있으면 DB 세그먼트로 재구성 - TEST 3 개선
          if (chapterInfos.length === 0 && dbSegments && dbSegments.length > 0) {
            console.log('🔄 chapters 정보 없음 - DB 세그먼트로 재구성');

            const chapterMap = new Map<number, any[]>();
            dbSegments.forEach(seg => {
              const chapterIdx = seg.chapter_index || 0;
              if (!chapterMap.has(chapterIdx)) {
                chapterMap.set(chapterIdx, []);
              }
              chapterMap.get(chapterIdx)!.push(seg);
            });

            chapterMap.forEach((segments, chapterIdx) => {
              chapterInfos.push({
                chapterIndex: chapterIdx,
                title: `챕터 ${chapterIdx}`,
                description: `${segments.length}개 대화`,
                segmentCount: segments.length,
                estimatedDuration: segments.reduce((sum, seg) => sum + (seg.duration_seconds || 30), 0),
                contentFocus: []
              });
            });

            console.log(`✅ ${chapterInfos.length}개 챕터 재구성 완료`);
          }

          console.log('🎯 페이지 - 전체 세그먼트 파싱 완료:', {
            chapterCount: chapterInfos.length,
            totalSegments: allSegments.length,
            segmentsByChapter: chapterInfos.map(ch => `${ch.title}: ${ch.segmentCount}개`)
          });

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

          // 스토리지 검증은 이미 위에서 완료됨 - 부분 보완 처리만 수행
          if (!storageVerification.isValid && storageVerification.reason === 'missing_files' && 
              storageVerification.missingFiles && storageVerification.missingFiles.length > 0) {
            
            console.log('🔧 부분 보완 시작:', storageVerification.missingFiles.slice(0, 5));
            
            // 사용자에게 부분 보완 진행 알림
            setError(`누락된 오디오 파일 ${storageVerification.missingCount}개를 생성 중입니다...`);
            setIsGenerating(true);
            setGenerationProgress(0);
            
            // 진행률 시뮬레이션 (실제 생성 시간 기준으로 추정)
            const missingCount = storageVerification.missingCount;
            const estimatedTimePerFile = 3000; // 파일당 약 3초 추정
            const totalEstimatedTime = missingCount * estimatedTimePerFile;
            
            const progressInterval = setInterval(() => {
              setGenerationProgress(prev => {
                if (prev >= 95) return prev; // 95%에서 멈추고 실제 완료를 기다림
                return prev + (100 / (totalEstimatedTime / 500)); // 500ms마다 업데이트
              });
            }, 500);
            
            try {
              const repairResponse = await fetch('/api/podcast/generate-missing', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  locationName: location,
                  language,
                  episodeData: result.data,
                  missingFiles: storageVerification.missingFiles
                })
              });
              
              if (repairResponse.ok) {
                const repairResult = await repairResponse.json();
                
                if (repairResult.success) {
                  console.log('✅ 부분 보완 성공:', repairResult);
                  setError(null);
                  
                  // 보완 완료 후 다시 검증
                  console.log('🔄 보완 후 재검증 시작...');
                  const reVerification = await verifyStorageIntegrity(result.data, location, language);
                  
                  if (reVerification.isValid) {
                    console.log('🎉 재검증 성공 - 완전한 팟캐스트 로드 완료');
                  } else {
                    console.warn('⚠️ 재검증에서도 일부 파일 누락, 기존 파일로 진행');
                  }
                } else {
                  console.error('❌ 부분 보완 실패:', repairResult.error);
                  setError(`부분 보완 실패: ${repairResult.error}`);
                }
              } else {
                console.error('❌ 부분 보완 API 호출 실패:', repairResponse.status);
                setError('부분 보완 중 오류가 발생했습니다.');
              }
            } catch (repairError) {
              console.error('❌ 부분 보완 중 예외 발생:', repairError);
              setError('부분 보완 중 오류가 발생했습니다.');
            } finally {
              clearInterval(progressInterval);
              setIsGenerating(false);
              setGenerationProgress(0);
            }
          }
          
          setEpisode(episodeData);
          setCurrentSegmentIndex(0);
          
          // 첫 번째 세그먼트를 오디오에 자동 로드 (바로 재생 준비)
          if (episodeData.segments.length > 0 && audioRef.current && episodeData.segments[0].audioUrl) {
            console.log('🎵🎵🎵 [NEW CODE v3] 첫 번째 세그먼트 자동 로드:', episodeData.segments[0]);
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

    const targetLanguage = effectiveLanguage;
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
        language: targetLanguage,
        options: {
          priority: 'engagement',
          audienceLevel: 'intermediate',
          podcastStyle: 'educational'
        }
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
          language: targetLanguage,
          options: {
            priority: 'engagement',
            audienceLevel: 'intermediate',
            podcastStyle: 'educational'
          }
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

      console.log('✅ NotebookLM 순차 팟캐스트 생성 완료:', {
        totalDuration: `${Math.round(episodeData.totalDuration)}초`,
        segmentCount: episodeData.segmentCount,
        segments: episodeData.segments.length
      });

      // 생성 완료 후 첫 번째 세그먼트 자동 로드
      if (episodeData.segments.length > 0 && audioRef.current && episodeData.segments[0].audioUrl) {
        console.log('🎵 생성 완료 - 첫 번째 세그먼트 자동 로드:', episodeData.segments[0]);
        audioRef.current.src = episodeData.segments[0].audioUrl;
        audioRef.current.load();
        audioRef.current.volume = volume;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.muted = isMuted;
      }

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="glass-effect rounded-lg p-8 dark:bg-gray-900/50 dark:border dark:border-gray-700/30">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-center">{getTranslationString('podcast.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* 글래스 헤더 */}
      <header className="sticky top-0 z-40 glass-header backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-300 group"
            >
              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium hidden sm:block">{getTranslationString('navigation.home')}</span>
            </Link>
            
            <div className="text-center flex-1 mx-4">
              <div className="flex items-center justify-center space-x-3 mb-1">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
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
              <div className="glass-effect rounded-lg p-6 sm:p-8 shadow-xl border border-gray-200/20 dark:bg-gray-900/40 dark:border-gray-700/30">
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
                        {t('podcast.chapterPrefix')} {episode.segments[currentSegmentIndex].chapterIndex ?? 0}: {(episode.segments[currentSegmentIndex].chapterTitle || locationName).replace(new RegExp(`^${t('podcast.chapterPrefix')}\\s*${episode.segments[currentSegmentIndex].chapterIndex ?? 0}\\s*[:：]\\s*`, 'i'), '')}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{(() => {
                      const currentChapterIndex = episode.segments[currentSegmentIndex]?.chapterIndex ?? 0;
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

                {/* 현재 재생 중인 대화 내용 */}
                <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      episode.segments[currentSegmentIndex].speakerType === 'male'
                        ? 'bg-gray-900' : 'bg-gray-700'
                    }`}>
                      {episode.segments[currentSegmentIndex].speakerType === 'male' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Users className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {episode.segments[currentSegmentIndex].speakerType === 'male' ? getTranslationString('podcast.speaker.host') : getTranslationString('podcast.speaker.curator')}
                      </p>
                      <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                        {episode.segments[currentSegmentIndex].textContent || getTranslationString('podcast.contentLoading')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 메인 플레이어 컨트롤 */}
                <div className="space-y-6">
                  {/* 진행률 바 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{getTranslationString('podcast.totalProgress')}</span>
                      <span>{(() => {
                        if (!episode.totalDuration || episode.totalDuration <= 0 || isNaN(totalElapsedTime)) return '0%';
                        const progress = Math.round((totalElapsedTime / episode.totalDuration) * 100);
                        return isNaN(progress) ? '0%' : `${progress}%`;
                      })()}</span>
                    </div>
                    <div 
                      className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer"
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
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{getTranslationString('podcast.currentTime')}: {formatTime(currentTime)}</span>
                      <span>{getTranslationString('podcast.segmentDuration')}: {formatTime(episode.segments[currentSegmentIndex]?.duration || 0)}</span>
                    </div>
                  </div>

                  {/* 플레이어 컨트롤 */}
                  <div className="flex items-center justify-center space-x-6">
                    <button
                      onClick={playPreviousSegment}
                      disabled={currentSegmentIndex === 0}
                      className="w-12 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                      aria-label={getTranslationString('accessibility.previousSegment')}
                    >
                      <SkipBack className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    
                    <button
                      onClick={togglePlayPause}
                      className="w-16 h-16 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
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
                      className="w-12 h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                      aria-label={getTranslationString('accessibility.nextSegment')}
                    >
                      <SkipForward className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* 볼륨 및 속도 컨트롤 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={toggleMute}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        aria-label={isMuted ? getTranslationString('accessibility.unmuteButton') : getTranslationString('accessibility.muteButton')}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
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
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 팟캐스트 생성 - 에피소드가 없을 때만 표시 */}
            {!episode && !isGenerating && !isLoading && (
              <div className="glass-effect rounded-lg p-8 shadow-xl border border-gray-200/20 dark:bg-gray-900/40 dark:border-gray-700/30 text-center">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <Headphones className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('podcast.generateTitle', { locationName })}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {getTranslationString('podcast.generateDescription')}
                </p>
                <button
                  onClick={generatePodcast}
                  className="px-8 py-4 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  {getTranslationString('podcast.generateButton')}
                </button>
              </div>
            )}

            {/* 생성 중 */}
            {isGenerating && (
              <div className="glass-effect rounded-lg p-8 shadow-xl border border-gray-200/20 dark:bg-gray-900/40 dark:border-gray-700/30 text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {getTranslationString('podcast.generatingTitle')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('podcast.generatingDescription', { locationName })}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('podcast.completionPercentage', { percentage: Math.round(generationProgress).toString() })}</p>
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
                  currentChapterIndex={episode.segments[currentSegmentIndex]?.chapterIndex ?? 0}
                  onChapterSelect={(chapterIndex) => {
                    console.log('🎯 챕터 선택:', chapterIndex);

                    // 선택된 챕터의 첫 번째 세그먼트 찾기
                    const chapterFirstSegmentIndex = episode.segments.findIndex(
                      segment => segment.chapterIndex === chapterIndex
                    );

                    console.log('📍 찾은 세그먼트 인덱스:', chapterFirstSegmentIndex);

                    if (chapterFirstSegmentIndex >= 0) {
                      jumpToSegment(chapterFirstSegmentIndex);
                    } else {
                      console.warn('⚠️ 해당 챕터의 세그먼트를 찾을 수 없습니다:', chapterIndex);
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

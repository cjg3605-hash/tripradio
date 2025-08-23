'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, 
  MapPin,
  Info,
  Clock,
  Users,
  Calendar,
  Eye,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Route,
  ChevronDown,
  Heart,
  RefreshCw,
  Share2
} from 'lucide-react';
import { GuideData, GuideChapter } from '@/types/guide';
import { AudioChapter } from '@/types/audio';
import GuideLoading from '@/components/ui/GuideLoading';
import ChapterAudioPlayer from '@/components/audio/ChapterAudioPlayer';
// Dynamic import for Map component (heavy Leaflet dependency)
import dynamic from 'next/dynamic';

const StartLocationMap = dynamic(() => import('@/components/guide/StartLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <div className="text-sm text-gray-600">지도 로딩 중...</div>
      </div>
    </div>
  )
});
import { GuideHeader } from '@/components/guide/GuideHeader';
import { GuideTitle } from '@/components/guide/GuideTitle';
import { LiveAudioPlayer } from '@/components/guide/LiveAudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResponsiveContainer, PageHeader, Card, Stack, Flex } from '@/components/layout/ResponsiveContainer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { saveFavoriteGuide, isFavoriteGuide } from '@/lib/supabaseGuideHistory';
import PopupNotification from '@/components/ui/PopupNotification';
import { parseSupabaseCoordinates, validateCoordinates, normalizeCoordinateFields } from '@/lib/coordinates/coordinate-common';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLElement | null)[]>;
  guideCoordinates?: any; // Supabase coordinates 컬럼 데이터
  isExploreHub?: boolean; // 🔥 익스플로어 허브 여부 (모든 챕터 vs 첫 챕터만)
}

const TourContent = ({ guide, language, chapterRefs, guideCoordinates, isExploreHub = false }: TourContentProps) => {
  // 🔍 guideCoordinates 디버깅 로그 (공통 유틸리티 사용)
  const coordinateValidation = validateCoordinates(guideCoordinates);
  console.log('🎯 [TourContent 전달] guideCoordinates:', {
    data: guideCoordinates,
    validation: coordinateValidation,
    type: typeof guideCoordinates,
    isArray: Array.isArray(guideCoordinates)
  });
  
  const { currentLanguage, t } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [componentKey, setComponentKey] = useState(0);
  
  // 새로운 상태들
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // 🔗 오디오 컴포넌트 연동 상태
  const [chapterAudioUrls, setChapterAudioUrls] = useState<Map<string | number, string>>(new Map());
  const [activeChapterRefs, setActiveChapterRefs] = useState<Map<number, React.RefObject<HTMLAudioElement>>>(new Map());
  
  // 🔄 챕터별 재생 상태 관리
  const [chapterPlayStates, setChapterPlayStates] = useState<Map<string | number, boolean>>(new Map());
  
  // 🎛️ 오디오 제어 상태
  const [globalVolume, setGlobalVolume] = useState(1);
  const [globalPlaybackRate, setGlobalPlaybackRate] = useState(1);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [globalCurrentTime, setGlobalCurrentTime] = useState(0);
  const [globalDuration, setGlobalDuration] = useState(0);
  const [audioControlCallbacks, setAudioControlCallbacks] = useState<Map<string | number, {
    setVolume: (volume: number) => void;
    setPlaybackRate: (rate: number) => void;
    play: () => Promise<void>;
    pause: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
  }>>(new Map());

  // 가이드 데이터를 전역에 노출 (라이브 페이지에서 사용)
  useEffect(() => {
    if (guide) {
      (window as any).currentGuideData = guide;
      console.log('🌍 TourContent에서 가이드 데이터 전역 설정:', guide);
    }
  }, [guide]);
  const internalChapterRefs = useRef<(HTMLElement | null)[]>([]);

  // 🎯 AI 생성 인트로 챗터 사용 또는 폴백 인트로 생성 - useMemo로 무한 렌더링 방지
  const { allChapters, audioChapters, totalChapters } = useMemo(() => {
    const createIntroChapter = () => {
      const locationName = guide?.metadata?.originalLocationName || guide?.overview?.title || String(t('guide.thisPlace'));
      
      // 🔥 React Error #185 방지: AI가 이미 인트로 챕터(id: 0)를 생성했는지 안전하게 확인
      const aiGeneratedIntro = guide?.realTimeGuide?.chapters?.find?.(chapter => chapter?.id === 0);
      
      if (aiGeneratedIntro && aiGeneratedIntro.narrative) {
        // 🤖 AI가 생성한 96.3% 만족도 최적화 인트로 사용
        return aiGeneratedIntro;
      }
      
      // 🔄 폴백: AI가 인트로를 생성하지 않은 경우 기본 인트로 생성
      return {
        id: 0,
        title: `${locationName} ${t('guide.tourStart')}`,
        narrative: `${locationName}에 오신 것을 환영합니다. ${guide.overview?.location || '특별한 장소'}에 위치한 이곳은 ${guide.overview?.keyFeatures || guide.overview?.summary || '독특한 매력'}으로 유명합니다. ${guide.overview?.background || '풍부한 역사'}를 간직한 특별한 장소로 여러분을 안내하겠습니다.`,
        nextDirection: `이제 ${locationName}의 첫 번째 핵심 공간으로 함께 이동하여 본격적인 투어를 시작해보겠습니다.`
      };
    };

    // 🔥 React Error #185 방지: 인트로 챕터를 포함한 전체 챕터 배열 (AI 생성 시스템 보존)
    const introChapter = createIntroChapter();
    const originalChapters = guide?.realTimeGuide?.chapters || [];
    const aiGeneratedIntro = originalChapters.find?.(chapter => chapter?.id === 0 && chapter?.narrative);
    
    let computedAllChapters;
    if (aiGeneratedIntro) {
      // 🤖 AI가 인트로를 생성한 경우: 기존 AI 시스템 결과를 그대로 사용
      computedAllChapters = originalChapters;
    } else {
      // 🔄 AI가 인트로를 생성하지 않은 경우: 폴백 인트로 추가 + 기존 챕터들의 ID 조정
      const adjustedChapters = originalChapters.map((chapter, index) => ({
        ...chapter,
        id: index + 1 // 기존 챕터들의 ID를 1부터 시작하도록 조정
      }));
      computedAllChapters = [introChapter, ...adjustedChapters];
    }
    
    // 🎵 GuideChapter를 AudioChapter로 변환
    const computedAudioChapters: AudioChapter[] = computedAllChapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title || `${t('audio.chapter')} ${chapter.id}`,
      text: chapter.narrative || '',
      duration: chapter.estimatedDuration || 120 // 기본 2분
    }));

    return {
      allChapters: computedAllChapters,
      audioChapters: computedAudioChapters,
      totalChapters: computedAllChapters.length
    };
  }, [guide?.metadata?.originalLocationName, guide?.overview?.title, guide?.overview?.location, guide?.overview?.keyFeatures, guide?.overview?.summary, guide?.overview?.background, guide?.realTimeGuide?.chapters, t]);

  // 🎯 상단 오디오용 챕터 변경 핸들러 (확장 없이 챕터만 변경)
  const handleLiveAudioChapterChange = useCallback((chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    // 해당 챕터로 스크롤 (확장하지 않음)
    if (chapterRefs?.current?.[chapterIndex] || internalChapterRefs.current[chapterIndex]) {
      const targetRef = chapterRefs?.current?.[chapterIndex] || internalChapterRefs.current[chapterIndex];
      targetRef?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [chapterRefs]);

  // 🎯 일반 챕터 변경 핸들러 (스크롤 + 확장)
  const handleChapterChange = useCallback((chapterIndex: number) => {
    setCurrentChapterIndex(chapterIndex);
    // 해당 챕터로 스크롤
    if (chapterRefs?.current?.[chapterIndex] || internalChapterRefs.current[chapterIndex]) {
      const targetRef = chapterRefs?.current?.[chapterIndex] || internalChapterRefs.current[chapterIndex];
      targetRef?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    // 챕터 확장
    if (!expandedChapters.includes(chapterIndex)) {
      setExpandedChapters(prev => [...prev, chapterIndex]);
    }
  }, [chapterRefs, expandedChapters]);

  // 🎧 라이브 투어로 업그레이드 유도 - useMemo로 최적화
  const locationName = guide.metadata?.originalLocationName || guide.overview?.title;
  const currentChapter = useMemo(() => allChapters[currentChapterIndex], [allChapters, currentChapterIndex]);

  // 🎵 챕터별 최적화된 chapter 객체들 생성 - 안전한 기본값 추가
  const optimizedChapters = useMemo(() => {
    if (!audioChapters || !Array.isArray(audioChapters) || !chapterAudioUrls) {
      return [];
    }
    return audioChapters.map((chapter, index) => ({
      ...chapter,
      audioUrl: chapterAudioUrls.get(chapter.id) || chapter.audioUrl
    }));
  }, [audioChapters, chapterAudioUrls]);

  // 안전한 필드 접근 (기본값 제공)
  const sceneDescription = currentChapter?.sceneDescription || '';
  const coreNarrative = currentChapter?.coreNarrative || '';
  const humanStories = currentChapter?.humanStories || '';
  const nextDirection = currentChapter?.nextDirection || '';

  // 🗺️ 좌표 상태 확인 (공통 유틸리티 사용)
  const coordinatesAnalysis = (() => {
    if (!guideCoordinates) {
      // guideCoordinates가 없을 때 allChapters에서 좌표 데이터 확인
      const chaptersWithCoordinates = allChapters.filter(chapter => {
        const normalized = normalizeCoordinateFields(chapter) || 
                         normalizeCoordinateFields(chapter.coordinates) || 
                         normalizeCoordinateFields(chapter.location);
        return normalized !== null;
      });
      
      return {
        hasGuideCoordinates: chaptersWithCoordinates.length > 0,
        coordinatesCount: chaptersWithCoordinates.length,
        validCoordinatesCount: chaptersWithCoordinates.length
      };
    }
    
    // 공통 유틸리티로 좌표 파싱 및 검증
    const parsedCoordinates = parseSupabaseCoordinates(guideCoordinates);
    
    return {
      hasGuideCoordinates: parsedCoordinates.length > 0,
      coordinatesCount: parsedCoordinates.length,
      validCoordinatesCount: parsedCoordinates.length
    };
  })();
  
  console.log('🗺️ 좌표 파싱 상태:', {
    ...coordinatesAnalysis,
    chaptersCount: allChapters.length,
    locationName: guide?.metadata?.originalLocationName,
    guideCoordinatesType: typeof guideCoordinates,
    isArray: Array.isArray(guideCoordinates),
    firstCoordinate: Array.isArray(guideCoordinates) && guideCoordinates.length > 0 ? 
      `(${guideCoordinates[0]?.lat || guideCoordinates[0]?.latitude}, ${guideCoordinates[0]?.lng || guideCoordinates[0]?.longitude})` : 
      'none',
    // 챕터별 좌표 정보 추가
    chaptersCoordinateInfo: allChapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      hasLat: !!chapter.lat,
      hasLng: !!chapter.lng,
      hasCoordinatesObj: !!(chapter.coordinates?.lat && chapter.coordinates?.lng),
      hasLocationObj: !!(chapter.location?.lat && chapter.location?.lng),
      actualCoordinates: chapter.lat && chapter.lng ? `${chapter.lat}, ${chapter.lng}` : null
    }))
  });

  // refs 안전한 초기화
  useEffect(() => {
    if (totalChapters > 0) {
      // 기존 배열과 길이가 다르면 새로 생성
      if (internalChapterRefs.current.length !== totalChapters) {
        internalChapterRefs.current = new Array(totalChapters).fill(null);
      }
      if (chapterRefs && chapterRefs.current.length !== totalChapters) {
        chapterRefs.current = new Array(totalChapters).fill(null);
      }
    }
  }, [totalChapters, chapterRefs]);

  // 가이드 데이터 변경 시 컴포넌트 리셋
  useEffect(() => {
    setComponentKey(prev => prev + 1);
    setCurrentChapterIndex(0);
    setExpandedChapters([0]);
  }, [guide?.metadata?.originalLocationName, guide?.realTimeGuide?.chapters?.length]);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);
      setShowScrollButtons(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 상태 확인
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 컴포넌트 언마운트 시 오디오 정리는 AdvancedAudioPlayer에서 관리됨

  // 즐겨찾기 상태 확인
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (session?.user && guide?.metadata?.originalLocationName) {
        const bookmarked = await isFavoriteGuide(session.user, guide.metadata.originalLocationName);
        setIsBookmarked(bookmarked);
      }
    };
    
    checkBookmarkStatus();
  }, [session, guide?.metadata?.originalLocationName]);

  // 즐겨찾기 핸들러
  const handleBookmark = async () => {
    if (!session?.user) {
      // 비회원은 로그인 페이지로 리다이렉트
      router.push('/auth/signin');
      return;
    }

    if (!guide?.metadata?.originalLocationName) return;

    setIsBookmarking(true);
    try {
      const result = await saveFavoriteGuide(
        session.user, 
        guide, 
        guide.metadata.originalLocationName
      );

      if (result.success) {
        setIsBookmarked(true);
        setShowSuccessPopup(true);
      } else {
        console.error('즐겨찾기 저장 실패:', result.error);
      }
    } catch (error) {
      console.error('즐겨찾기 오류:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  // 재생성 확인 핸들러
  const handleRegenerateConfirm = () => {
    setShowRegenerateConfirm(false);
    setIsRegenerating(true);
    
    // 기존 재생성 로직 호출 (MultiLangGuideClient의 handleRegenerateGuide와 동일)
    if (typeof window !== 'undefined' && (window as any).handleRegenerateGuide) {
      (window as any).handleRegenerateGuide();
    } else {
      // 페이지 새로고침으로 폴백
      window.location.reload();
    }
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // 텍스트 포맷팅
  const formatText = (text: string) => {
    if (!text) return '';
    
    const paragraphs = text.split(/\n\s*\n/)
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => paragraph.trim().replace(/\n/g, ' '));
  
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 text-sm leading-relaxed text-gray-800">
        {paragraph}
      </p>
    ));
  };

  // 챕터 토글 함수
  const toggleChapter = (index: number) => {
    setExpandedChapters(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  
  // 🔗 상단 LiveAudioPlayer에서 오디오 요청 시 호출
  const handleAudioRequest = async (chapterId: string | number): Promise<string | null> => {
    // 1. 기존 오디오 URL 확인
    const existingUrl = chapterAudioUrls.get(chapterId);
    if (existingUrl) {
      // console.log(`🔄 [재사용] 챕터 ${chapterId} 오디오 URL: ${existingUrl.substring(0, 50)}...`);
      return existingUrl;
    }
    
    // 2. 하단 ChapterAudioPlayer에서 생성된 오디오 찾기
    // 상단 이벤트를 통해 하단 컴포넌트에 TTS 생성 요청
    const audioChapter = audioChapters.find(chapter => chapter.id === chapterId);
    if (!audioChapter?.text) {
      console.warn(`⚠️ 챕터 ${chapterId} 텍스트 없음`);
      return null;
    }
    
    // console.log(`🎧 [상단 요청] 챕터 ${chapterId} TTS 생성 시작...`);
    
    // 하단과 동일한 고품질 TTS API 호출
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: audioChapter.text,
          language: currentLanguage || 'ko-KR',
          quality: 'high' // Neural2 고품질
        })
      });
      
      if (!response.ok) {
        throw new Error(`TTS API 호출 실패: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.audioData) {
        const audioUrl = `data:${result.mimeType || 'audio/mpeg'};base64,${result.audioData}`;
        
        // 오디오 URL 저장
        setChapterAudioUrls(prev => new Map(prev).set(chapterId, audioUrl));
        
        // console.log(`✅ [상단 요청] 챕터 ${chapterId} TTS 생성 완료`);
        return audioUrl;
      } else {
        throw new Error(result.error || 'TTS 생성 실패');
      }
    } catch (error) {
      console.error(`❌ [상단 요청] 챕터 ${chapterId} TTS 생성 실패:`, error);
      return null;
    }
  };
  
  // 🔗 하단 ChapterAudioPlayer에서 오디오 생성 시 호출
  const handleChapterAudioUpdate = useCallback((chapterId: string | number, audioUrl: string) => {
    setChapterAudioUrls(prev => new Map(prev).set(chapterId, audioUrl));
    // console.log(`🔄 [하단 업데이트] 챕터 ${chapterId} 오디오 URL 공유 완료`);
  }, []);

  // 📝 콜백 함수 최적화
  const handleChapterUpdateCallback = useCallback((updatedChapter: any) => {
    if (updatedChapter.audioUrl) {
      handleChapterAudioUpdate(updatedChapter.id, updatedChapter.audioUrl);
    }
  }, [handleChapterAudioUpdate]);

  // 🔄 챕터 재생 상태 변경 핸들러
  const handleChapterPlayStateChange = useCallback((chapterId: string | number, isPlaying: boolean) => {
    setChapterPlayStates(prev => new Map(prev).set(chapterId, isPlaying));
    
    // 현재 재생 중인 챕터라면 전역 상태도 업데이트 (ID 비교 수정)
    const currentChapterId = audioChapters[currentChapterIndex]?.id;
    if (chapterId === currentChapterId) {
      setIsGlobalPlaying(isPlaying);
    }
  }, [currentChapterIndex, audioChapters]);
  
  // 🎛️ 오디오 제어 콜백 등록
  const registerAudioControls = useCallback((chapterId: string | number, controls: {
    setVolume: (volume: number) => void;
    setPlaybackRate: (rate: number) => void;
    play: () => Promise<void>;
    pause: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
  }) => {
    setAudioControlCallbacks(prev => new Map(prev).set(chapterId, controls));
    console.log(`🎛️ [TourContent] 챕터 ${chapterId} 오디오 제어 콜백 등록`);
    console.log(`🎛️ [TourContent] 현재 등록된 콜백 수:`, audioControlCallbacks.size + 1);
    console.log(`🎛️ [TourContent] 현재 챕터 인덱스:`, currentChapterIndex);
    console.log(`🎛️ [TourContent] 현재 챕터 ID:`, audioChapters[currentChapterIndex]?.id);
  }, [audioControlCallbacks.size, currentChapterIndex, audioChapters]);
  
  // 🔊 전역 볼륨 변경 핸들러
  const handleGlobalVolumeChange = (volume: number) => {
    setGlobalVolume(volume);
    // 현재 활성 챕터의 오디오에 볼륨 적용
    const currentControls = audioControlCallbacks.get(currentChapterIndex);
    if (currentControls) {
      currentControls.setVolume(volume);
      // console.log(`🔊 [전역 볼륨] 챕터 ${currentChapterIndex}에 볼륨 ${Math.round(volume * 100)}% 적용`);
    }
  };
  
  // ⚡ 전역 배속 변경 핸들러
  const handleGlobalPlaybackRateChange = (rate: number) => {
    setGlobalPlaybackRate(rate);
    // 현재 활성 챕터의 오디오에 배속 적용
    const currentControls = audioControlCallbacks.get(currentChapterIndex);
    if (currentControls) {
      currentControls.setPlaybackRate(rate);
      // console.log(`⚡ [전역 배속] 챕터 ${currentChapterIndex}에 배속 ${rate}x 적용`);
    }
  };
  
  // ▶️ 전역 재생 상태 변경 핸들러
  const handleGlobalPlayStateChange = (isPlaying: boolean, currentTime?: number, duration?: number) => {
    setIsGlobalPlaying(isPlaying);
    if (typeof currentTime === 'number') {
      setGlobalCurrentTime(currentTime);
    }
    if (typeof duration === 'number') {
      setGlobalDuration(duration);
      if (duration > 0 && typeof currentTime === 'number') {
        setGlobalProgress((currentTime / duration) * 100);
      }
    }
    // console.log(`▶️ [상태 동기화] 챕터 ${currentChapterIndex}: 재생=${isPlaying}, 시간=${currentTime?.toFixed(1)}s, 전체=${duration?.toFixed(1)}s`);
  };
  
  // 🔄 오디오 진행률 업데이트 (실시간)
  const handleProgressUpdate = () => {
    const currentControls = audioControlCallbacks.get(currentChapterIndex);
    if (currentControls) {
      const currentTime = currentControls.getCurrentTime();
      const duration = currentControls.getDuration();
      
      setGlobalCurrentTime(currentTime);
      setGlobalDuration(duration);
      
      if (duration > 0) {
        setGlobalProgress((currentTime / duration) * 100);
      }
    }
  };
  
  // 🔄 진행률 업데이트 인터벌
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (isGlobalPlaying) {
      progressInterval = setInterval(handleProgressUpdate, 1000);
    }
    
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isGlobalPlaying, currentChapterIndex]);

  // 🔥 React Error #185 방지: 가이드 데이터 안전성 검증 강화
  if (!guide || (!guide.overview && !guide.realTimeGuide)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GuideLoading 
          type="loading"
          message={String(t('guide.loadingGuide'))}
          subMessage={String(t('guide.fetchingGuideData'))}
          showProgress={true}
        />
      </div>
    );
  }

  // 🔥 React Error #185 방지: 추가 안전성 검증
  if (!guide.metadata) {
    console.warn('⚠️ Guide metadata is missing, using fallback');
  }

  const guideLocationName = guide?.metadata?.originalLocationName || guide?.overview?.title || String(t('guide.guideTitle'));

  return (
    <div className="flex flex-col min-h-screen">
      {/* 고정된 상단 영역 - 헤더, 제목, 오디오 플레이어 */}
      <div className="sticky top-0 z-50 bg-white">
        {/* 헤더 */}
        <GuideHeader 
          locationName={guideLocationName}
          variant="main"
        />
        
        {/* 타이틀 */}
        <GuideTitle 
          locationName={guideLocationName}
          variant="main"
        />

        {/* 오디오 플레이어 */}
        {audioChapters.length > 0 && (
          <LiveAudioPlayer
            chapters={audioChapters}
            locationName={guideLocationName}
            onChapterChange={handleLiveAudioChapterChange}
            onAudioRequest={handleAudioRequest}
            onVolumeChange={handleGlobalVolumeChange}
            onPlaybackRateChange={handleGlobalPlaybackRateChange}
            onPlayStateChange={handleGlobalPlayStateChange}
            initialVolume={globalVolume}
            initialPlaybackRate={globalPlaybackRate}
            externalIsPlaying={isGlobalPlaying}
            externalProgress={globalProgress}
            externalCurrentTime={globalCurrentTime}
            externalDuration={globalDuration}
            activeChapterControls={audioControlCallbacks.get(audioChapters[currentChapterIndex]?.id) || null}
          />
        )}
      </div>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <ResponsiveContainer key={`tour-content-${componentKey}`} variant="fullwidth" padding="none" className="flex-1">
        <div className="flex-1 overflow-y-auto">
          <div className="px-0.5 py-2 sm:px-0.5 lg:px-1">
            <Stack space="sm">

              {/* 개요 */}
              {guide.overview && (
                <div className="relative mb-3">
                  <Card variant="default" className="overflow-hidden transition-all duration-200">
                    
                    {/* Header Section - Ultra Minimal */}
                    <div className="px-4 pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-black flex items-center justify-center" style={{ borderRadius: 'var(--radius-sm)' }}>
                            <Info className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-black">{t('guide.overview')}</h2>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 기본 정보 - 통합된 형태 */}
                    <div className="px-4 pb-4">
                      <div className="space-y-4">
                        {/* 통합된 기본 정보 - 세로 막대기 포함 */}
                        <div className="space-y-3">
                          {guide.overview.location && (
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                              <p className="text-sm font-medium text-black leading-relaxed">{guide.overview.location}</p>
                            </div>
                          )}
                          {guide.overview.keyFeatures && (
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                              <p className="text-sm font-medium text-black leading-relaxed">{guide.overview.keyFeatures}</p>
                            </div>
                          )}
                          {guide.overview.background && (
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                              <p className="text-sm font-medium text-black leading-relaxed">{guide.overview.background}</p>
                            </div>
                          )}
                          
                          {/* Legacy Support - 기존 summary */}
                          {guide.overview.summary && !guide.overview.location && !guide.overview.keyFeatures && !guide.overview.background && (
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
                              <p className="text-sm font-medium text-black leading-relaxed">{guide.overview.summary}</p>
                            </div>
                          )}
                        </div>

                        {/* 실용 정보 - 작은 한줄 가로 컴포넌트 3개 */}
                        {(guide.overview.visitInfo?.duration || guide.overview.visitInfo?.difficulty || guide.overview.visitInfo?.season) && (
                          <div className="flex flex-wrap gap-2">
                            {guide.overview.visitInfo?.duration && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-800">{guide.overview.visitInfo.duration}</span>
                              </div>
                            )}
                            
                            {guide.overview.visitInfo?.difficulty && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                <Users className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-800">{guide.overview.visitInfo.difficulty}</span>
                              </div>
                            )}
                            
                            {guide.overview.visitInfo?.season && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-800">{guide.overview.visitInfo.season}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 필수관람포인트 해시태그 버튼들 (필수관람포인트 컴포넌트에서 이동) */}
                        {(() => {
                          const mustVisitContent = guide.mustVisitSpots || '';
                          if (!mustVisitContent || mustVisitContent.trim().length === 0) return null;
                          
                          return (
                            <div className="flex flex-wrap gap-2">
                              {mustVisitContent.split(/[,\n]|#/).filter(spot => spot && spot.trim()).map((spot, index) => {
                                const cleanSpot = spot.trim().replace(/^#+/, '');
                                if (!cleanSpot || index === 0) return null;
                                
                                return (
                                  <div
                                    key={`highlight-${index}-${cleanSpot}`}
                                    className="group relative overflow-hidden"
                                  >
                                    <div className="relative px-4 py-2 bg-black rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer">
                                      <span className="text-white font-medium text-sm">
                                        #{cleanSpot}
                                      </span>
                                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                  </Card>
                </div>
              )}


              {/* 주의사항 */}
              {(() => {
                const safetyContent = guide.safetyWarnings || '';
                return safetyContent && safetyContent.trim().length > 0;
              })() && (
                <div className="relative mb-2">
                  <Card variant="default" className="overflow-hidden transition-all duration-200">
                    
                    {/* Header */}
                    <div className="px-4 pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-black flex items-center justify-center" style={{ borderRadius: 'var(--radius-sm)' }}>
                            <AlertTriangle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-black">{t('guide.precautions')}</h2>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Safety Items - Mobile Optimized List */}
                    <div className="px-4 pb-4">
                      <div className="space-y-3">
                        {(() => {
                          const safetyContent = guide.safetyWarnings || '';
                          
                          return safetyContent.split('\n').filter(w => w.trim()).map((warning, index) => {
                            const cleanWarning = warning.trim().replace(/^[•·-]\s*/, '');
                            if (!cleanWarning) return null;
                            
                            return (
                              <div key={`safety-${index}`} className="flex items-start gap-3">
                                {/* Bullet Point - Ultra Minimal */}
                                <div className="flex-shrink-0 w-1 h-4 bg-gray-400 rounded-full mt-0.5"></div>
                                
                                {/* Content */}
                                <p className="text-sm font-medium text-black leading-relaxed">
                                  {cleanWarning}
                                </p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                  </Card>
                </div>
              )}

              {/* 시작점 지도 - 제목/로고 없이 지도만 표시 */}
              <div className="mb-3">
                {(() => {
                  // 🎯 오직 Supabase DB coordinates만 사용
                  const parsedCoordinates = parseSupabaseCoordinates(guideCoordinates);
                  
                  // DB 좌표가 없으면 지도 표시하지 않음
                  if (parsedCoordinates.length === 0) {
                    console.log('🗺️ [TourContent] DB coordinates 없음 - 지도 숨김');
                    return null;
                  }
                  
                  // 첫 번째 좌표를 중심점으로 사용
                  const startPoint = parsedCoordinates[0] ? {
                    lat: parsedCoordinates[0].lat,
                    lng: parsedCoordinates[0].lng,
                    name: parsedCoordinates[0].title || parsedCoordinates[0].name || locationName
                  } : null;
                  
                  if (!startPoint) {
                    console.log('🗺️ [TourContent] 유효한 시작점 없음');
                    return null;
                  }
                  
                  const chaptersForMapRaw = allChapters.map((chapter, index) => {
                    if (parsedCoordinates.length === 0) {
                      console.warn(`❌ [TourContent] 챕터 ${index} "${chapter.title}" - coordinates 칼럼이 비어있음`);
                      return null;
                    }
                    
                    // 🔍 첫 번째 챕터에서 coordinates 구조 로깅
                    if (index === 0) {
                      console.log('🔍 [좌표 구조 분석] parsedCoordinates:', {
                        totalCount: parsedCoordinates.length,
                        firstCoordinate: parsedCoordinates[0],
                        allCoordinateNames: parsedCoordinates.map(c => c.name || c.title || '이름없음')
                      });
                    }
                    
                    // 방법 1: 챕터 제목과 POI 이름 매칭 시도
                    let matchedCoord = parsedCoordinates.find(coord => {
                      const poiName = coord.name || coord.title || '';
                      const chapterTitle = chapter.title || '';
                      return poiName.includes(chapterTitle) || chapterTitle.includes(poiName);
                    });
                    
                    // 방법 2: 인덱스 기반 매칭 (순서대로)
                    if (!matchedCoord && parsedCoordinates[index]) {
                      matchedCoord = parsedCoordinates[index];
                      console.log(`🗺️ [TourContent] 챕터 ${index} "${chapter.title}" - 인덱스 기반 매칭`);
                    }
                    
                    // 방법 3: 매칭 실패시 첫 번째 좌표 사용 (중심 위치)
                    if (!matchedCoord && parsedCoordinates[0]) {
                      matchedCoord = parsedCoordinates[0];
                      console.log(`🗺️ [TourContent] 챕터 ${index} "${chapter.title}" - 제목 매칭 실패, 중심 좌표 사용`);
                    }
                    
                    if (!matchedCoord) {
                      console.warn(`❌ [TourContent] 챕터 ${index} "${chapter.title}" - 사용할 수 있는 좌표 없음`);
                      return null;
                    }
                    
                    console.log(`✅ [TourContent] 챕터 ${index} "${chapter.title}" → (${matchedCoord.lat}, ${matchedCoord.lng})`);
                    return {
                      id: chapter.id,
                      title: chapter.title,
                      lat: matchedCoord.lat,
                      lng: matchedCoord.lng,
                      narrative: chapter.narrative || chapter.sceneDescription || '',
                      originalIndex: index
                    };
                  });
                  
                  // 🎯 실제 좌표가 있는 챕터만 필터링
                  const chaptersForMap = chaptersForMapRaw.filter(chapter => chapter !== null);
                  
                  console.log(`🗺️ [좌표 검증] 전체 ${allChapters.length}개 챕터 중 ${chaptersForMap.length}개 챕터에 좌표 존재`);
                  
                  // 🎯 스마트 시작점 설정 - 실제 챕터 좌표 우선 사용
                  let smartStartPoint;
                  
                  if (chaptersForMap.length > 0) {
                    // 유효한 좌표를 가진 첫 번째 챕터 사용
                    const validChapter = chaptersForMap.find(chapter => 
                      chapter.lat !== undefined && 
                      chapter.lng !== undefined && 
                      !isNaN(chapter.lat) && 
                      !isNaN(chapter.lng)
                    );
                    
                    if (validChapter) {
                      smartStartPoint = { 
                        lat: validChapter.lat, 
                        lng: validChapter.lng, 
                        name: `${locationName} 시작점` 
                      };
                    } else {
                      // 모든 챕터 좌표의 평균값 계산
                      const validCoords = chaptersForMap.filter(c => 
                        c.lat !== undefined && c.lng !== undefined && !isNaN(c.lat) && !isNaN(c.lng)
                      );
                      
                      if (validCoords.length > 0) {
                        const avgLat = validCoords.reduce((sum, c) => sum + c.lat, 0) / validCoords.length;
                        const avgLng = validCoords.reduce((sum, c) => sum + c.lng, 0) / validCoords.length;
                        smartStartPoint = { lat: avgLat, lng: avgLng, name: `${locationName} 중심점` };
                      } else {
                        // 최후 폴백: 기본 좌표
                        smartStartPoint = { lat: 48.8584, lng: 2.2945, name: '에펠탑' };
                      }
                    }
                  } else {
                    // ❌ 좌표가 없을 때 null로 설정
                    smartStartPoint = null;
                  }

                  // 🗺️ StartLocationMap 전달 데이터 로깅
                  console.log('🗺️ [TourContent → StartLocationMap] 데이터 전달:', {
                    hasGuideCoordinates: coordinatesAnalysis.hasGuideCoordinates,
                    coordinatesCount: coordinatesAnalysis.coordinatesCount,
                    validCoordinatesCount: coordinatesAnalysis.validCoordinatesCount,
                    chaptersCount: chaptersForMap.length,
                    startPoint: smartStartPoint,
                    hasValidCoordinates: chaptersForMap.length > 0
                  });

                  // 좌표가 없으면 에러 메시지 표시
                  if (chaptersForMap.length === 0 || !smartStartPoint) {
                    return (
                      <div className="bg-white border border-red-200 rounded-3xl shadow-lg shadow-red-50 overflow-hidden">
                        <div className="p-6 text-center">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-red-800 mb-2">표시할 장소가 없습니다</h3>
                          <p className="text-sm text-red-600">
                            이 가이드에는 지도에 표시할 좌표 정보가 없습니다.<br/>
                            좌표 생성 시스템을 확인해주세요.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // 🎯 페이지 타입별 챕터 표시 로직
                  const displayChapters = (() => {
                    if (isExploreHub) {
                      // 익스플로어 허브: 모든 챕터 위치 표시
                      console.log(`🗺️ [익스플로어 허브] 모든 ${chaptersForMap.length}개 챕터 마커 표시`);
                      return chaptersForMap;
                    } else {
                      // 일반 가이드: 첫 번째 챕터(추천 시작지점)만 표시
                      const firstChapter = chaptersForMap.length > 0 ? [chaptersForMap[0]] : [];
                      console.log(`🗺️ [일반 가이드] 추천 시작지점 1개 마커 표시: ${firstChapter.length > 0 ? firstChapter[0].title : '없음'}`);
                      return firstChapter;
                    }
                  })();

                  return (
                    <Card variant="default" className="overflow-hidden transition-all duration-200 relative p-2 z-[1]">
                      <StartLocationMap
                        locationName={locationName || ''}
                        guideCoordinates={guideCoordinates}
                        className="w-full rounded-md overflow-hidden"
                        guideId={String(guide?.metadata?.guideId || guide?.metadata?.id || '')}
                      />
                    </Card>
                  );
                })()}
              </div>

              {/* 챕터 리스트 - 지도와 구분을 위한 여백 증가 */}
              <div className="space-y-2 mt-9">
                {/* 오디오 가이드 라벨 - EXAMPLE 컴포넌트 스타일 */}
                <h2 className="text-lg font-bold text-black">오디오 가이드</h2>

                <div className="space-y-2">
                  {allChapters.map((chapter, index) => (
                    <div
                      key={`chapter-${index}-${chapter.id || index}`}
                      ref={(el) => {
                        try {
                          if (internalChapterRefs.current && index < internalChapterRefs.current.length) {
                            internalChapterRefs.current[index] = el;
                          }
                          if (chapterRefs?.current && index < chapterRefs.current.length) {
                            chapterRefs.current[index] = el;
                          }
                        } catch (error) {
                          console.warn('챕터 ref 설정 오류:', error);
                        }
                      }}
                    >
                      <Card
                        variant={currentChapterIndex === index ? "elevated" : "default"}
                        className="overflow-hidden transition-all duration-200"
                      >
                        {/* 챕터 헤더 */}
                        <div 
                          className="px-3 py-1.5 cursor-pointer"
                          onClick={() => toggleChapter(index)}
                        >
                          <Flex align="center" justify="between">
                            <Flex align="center" gap="sm" className="flex-1">
                              <div className={`w-12 h-8 border-2 rounded-full flex items-center justify-center font-medium transition-all duration-300 text-xs ${
                                currentChapterIndex === index 
                                  ? 'border-black bg-black text-white' 
                                  : 'border-gray-300 text-gray-500'
                              }`}>
                                {index === 0 ? t('guide.intro') : String(index).padStart(2, '0')}
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-black">{chapter.title}</h3>
                              </div>
                            </Flex>
                            
                            <Flex align="center" gap="sm">
                              {/* 챕터별 오디오 플레이어 - 펼침 버튼 바로 왼쪽 */}
                              {optimizedChapters[index] && (
                                <ChapterAudioPlayer
                                  key={`chapter-audio-${optimizedChapters[index].id}`}
                                  chapter={optimizedChapters[index]}
                                  className=""
                                  onChapterUpdate={handleChapterUpdateCallback}
                                  onRegisterControls={registerAudioControls}
                                  onPlayStateChange={handleChapterPlayStateChange}
                                />
                              )}
                              
                              {/* 확장 인디케이터 */}
                              <div className={`transition-transform duration-300 ${
                                expandedChapters.includes(index) ? 'rotate-180' : ''
                              }`}>
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              </div>
                            </Flex>
                          </Flex>
                        </div>
                        
                        {/* 챕터 내용 */}
                        {expandedChapters.includes(index) && (
                          <div className="border-t border-border p-2">
                            <Stack space="sm">
                              <div className="text-gray-600 leading-relaxed">
                                {chapter.narrative ? 
                                  formatText(chapter.narrative) :
                                  formatText([chapter.sceneDescription, chapter.coreNarrative, chapter.humanStories]
                                    .filter(Boolean).join(' '))
                                }
                              </div>
                              
                              {/* 다음 이동 안내 */}
                              {chapter.nextDirection && (
                                <div className="mt-2 p-2 bg-muted/30 rounded-lg border-l-4 border-foreground">
                                  <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 border-2 border-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                      <Route className="w-3 h-3" />
                                    </div>
                                    <div>
                                      <h4 className="text-base font-medium mb-1 text-black">{t('guide.nextMoveGuide')}</h4>
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        {chapter.nextDirection}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* 디버깅 정보 (개발 모드에서만) */}
                              {process.env.NODE_ENV === 'development' && (
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                                  <p>Debug - {index === 0 ? 'Intro Chapter' : `Chapter ${index}`}:</p>
                                  <p>Title: {chapter.title}</p>
                                  <p>Narrative: {chapter.narrative ? t('common.exists') : t('common.notExists')}</p>
                                  <p>Scene: {chapter.sceneDescription ? t('common.exists') : t('common.notExists')}</p>
                                  <p>Core: {chapter.coreNarrative ? t('common.exists') : t('common.notExists')}</p>
                                  <p>Stories: {chapter.humanStories ? t('common.exists') : t('common.notExists')}</p>
                                  <p>Next Direction: {chapter.nextDirection ? t('common.exists') : t('common.notExists')}</p>
                                  {index === 0 && <p className="text-slate-600 font-medium">🎯 {t('guide.autoGeneratedIntro')}</p>}
                                </div>
                              )}
                            </Stack>
                          </div>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* 하단 액션 버튼들 - 4개로 확장 */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-14 sm:h-16 flex items-center" style={{ zIndex: 40 }}>
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {/* 즐겨찾기 버튼 */}
                    <button
                      onClick={handleBookmark}
                      disabled={isBookmarking || isBookmarked}
                      className="flex flex-col items-center space-y-0.5 py-1 px-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all duration-200 disabled:opacity-50"
                    >
                      <Heart className={`w-4 h-4 text-gray-700 ${isBookmarked ? 'fill-current text-red-500' : ''}`} />
                      <span className="text-xs text-gray-700">
                        {isBookmarking ? t('guide.bookmarking') : 
                         isBookmarked ? t('guide.bookmarked') : 
                         t('guide.bookmark')}
                      </span>
                    </button>

                    {/* 공유 버튼 */}
                    <button
                      onClick={async () => {
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: `${guideLocationName} - 여행 가이드`,
                              text: `${guideLocationName}의 여행 가이드를 확인해보세요!`,
                              url: window.location.href
                            });
                          } catch (error) {
                            console.error('공유 실패:', error);
                          }
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('링크가 클립보드에 복사되었습니다!');
                        }
                      }}
                      className="flex flex-col items-center space-y-0.5 py-1 px-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all duration-200"
                    >
                      <Share2 className="w-4 h-4 text-gray-700" />
                      <span className="text-xs text-gray-700">{t('guide.share')}</span>
                    </button>

                    {/* 저장 버튼 */}
                    <button
                      onClick={() => {
                        // PDF 다운로드 또는 오프라인 저장 기능
                        console.log('저장 기능 구현 예정');
                        alert('저장 기능이 곧 추가됩니다!');
                      }}
                      className="flex flex-col items-center space-y-0.5 py-1 px-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all duration-200"
                    >
                      <BookOpen className="w-4 h-4 text-gray-700" />
                      <span className="text-xs text-gray-700">{t('guide.save')}</span>
                    </button>

                    {/* 재생성 버튼 */}
                    <button
                      onClick={() => setShowRegenerateConfirm(true)}
                      disabled={isRegenerating}
                      className="flex flex-col items-center space-y-0.5 py-1 px-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all duration-200 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-700 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span className="text-xs text-gray-700">
                        {isRegenerating ? t('guide.regenerating') : t('guide.regenerate')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 하단 탭바와 겹치지 않기 위한 여백 */}
              <div className="h-14 sm:h-16" />
            </Stack>
          </div>
        </div>

        {/* 디버깅 정보 (개발 환경에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 left-4 bg-blue-500 text-white p-2 rounded text-xs z-50">
            <div>Scroll Buttons: {showScrollButtons ? 'VISIBLE' : 'HIDDEN'}</div>
            <div>Scroll Y: {typeof window !== 'undefined' ? window.scrollY : 'N/A'}</div>
          </div>
        )}
      </ResponsiveContainer>

      {/* 스크롤 네비게이션 버튼들 - React Portal로 body에 직접 렌더링 */}
      {typeof window !== 'undefined' && showScrollButtons && createPortal(
        <>
          {/* 스크롤 투 탑 버튼 (우하단) - 모던 모노크롬 스타일 */}
          <div 
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '60px',
              height: '60px',
              backgroundColor: 'white',
              color: 'black',
              border: '2px solid black',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 99999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              pointerEvents: 'auto'
            }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'black';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = 'black';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            <ArrowUp className="w-6 h-6" />
          </div>

        </>,
        document.body
      )}

      {/* 팝업들 */}
      <PopupNotification
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        type="success"
        title={String(t('guide.bookmarkGuide'))}
        message={String(t('guide.bookmarkSuccess'))}
        autoClose={true}
        autoCloseDelay={1000}
      />

      <PopupNotification
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        type="confirm"
        title={String(t('guide.regenerateGuide'))}
        message={String(t('guide.regenerateConfirm'))}
        onConfirm={handleRegenerateConfirm}
        onCancel={() => setShowRegenerateConfirm(false)}
        confirmText={String(t('guide.yes'))}
        cancelText={String(t('guide.no'))}
      />
    </div>
  );
};

export default TourContent;
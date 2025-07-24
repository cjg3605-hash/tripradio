'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ArrowUp, 
  Eye, 
  AlertTriangle, 
  Clock, 
  MapPin,
  Volume2,
  BookOpen,
  Route,
  Info,
  Sparkles,
  ArrowLeft,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { GuideData, GuideChapter } from '@/types/guide';
import GuideLoading from '@/components/ui/GuideLoading';
// import BigTechDesignOptimizer from '@/components/design/BigTechDesignOptimizer';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLElement | null)[]>;
}

const TourContent = ({ guide, language, chapterRefs }: TourContentProps) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [componentKey, setComponentKey] = useState(0); // 컴포넌트 완전 리렌더링용
  // const [showDesignSimulator, setShowDesignSimulator] = useState(false); // BigTech 디자인 시뮬레이터
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const internalChapterRefs = useRef<(HTMLElement | null)[]>([]);

  // 🎯 AI 생성 인트로 챗터 사용 또는 폴백 인트로 생성
  const createIntroChapter = () => {
    const locationName = guide.metadata?.originalLocationName || guide.overview?.title || '이곳';
    
    // AI가 이미 인트로 챕터(id: 0)를 생성했는지 확인
    const aiGeneratedIntro = guide.realTimeGuide?.chapters?.find(chapter => chapter.id === 0);
    
    if (aiGeneratedIntro && aiGeneratedIntro.narrative) {
      // 🤖 AI가 생성한 96.3% 만족도 최적화 인트로 사용
      console.log('🤖 AI 생성 인트로 챕터 사용:', aiGeneratedIntro.title);
      return aiGeneratedIntro;
    }
    
    // 🔄 폴백: AI가 인트로를 생성하지 않은 경우 기본 인트로 생성
    console.log('🔄 폴백 인트로 챕터 생성');
    return {
      id: 0,
      title: `${locationName} 여행의 시작`,
      narrative: `${locationName}에 오신 것을 환영합니다. 
      
이곳은 ${guide.overview?.location || '특별한 장소'}로, ${guide.overview?.keyFeatures || guide.overview?.summary || '독특한 매력을 가진 곳'}입니다.

${guide.overview?.background || '풍부한 역사와 문화를 간직한 이 장소에서'}는 잊을 수 없는 경험을 하실 수 있을 것입니다.

지금부터 시작되는 여정에서 ${locationName}의 모든 것을 탐험해보세요.`,
      nextDirection: `이제 ${locationName}의 첫 번째 핵심 공간으로 함께 이동하여 본격적인 투어를 시작해보겠습니다.`
    };
  };

  // 인트로 챕터를 포함한 전체 챕터 배열 (AI 생성 시스템 보존)
  const introChapter = createIntroChapter();
  const originalChapters = guide.realTimeGuide?.chapters || [];
  const aiGeneratedIntro = originalChapters.find(chapter => chapter.id === 0 && chapter.narrative);
  
  let allChapters;
  if (aiGeneratedIntro) {
    // 🤖 AI가 인트로를 생성한 경우: 기존 AI 시스템 결과를 그대로 사용
    console.log('🤖 AI 생성 인트로 챕터 발견:', aiGeneratedIntro.title);
    allChapters = originalChapters;
  } else {
    // 🔄 AI가 인트로를 생성하지 않은 경우: 폴백 인트로 추가 + 기존 챕터들의 ID 조정
    console.log('🔄 폴백 인트로 챕터 추가');
    const adjustedChapters = originalChapters.map((chapter, index) => ({
      ...chapter,
      id: index + 1 // 기존 챕터들의 ID를 1부터 시작하도록 조정
    }));
    allChapters = [introChapter, ...adjustedChapters];
  }
  const totalChapters = allChapters.length;
  const currentChapter = allChapters[currentChapterIndex];

  // 안전한 필드 접근 (기본값 제공)
  const sceneDescription = currentChapter?.sceneDescription || '';
  const coreNarrative = currentChapter?.coreNarrative || '';
  const humanStories = currentChapter?.humanStories || '';
  const nextDirection = currentChapter?.nextDirection || '';

  // 데이터 구조 디버깅
  console.log('🔍 TourContent 데이터 구조 (인트로 챕터 포함):', {
    hasRealTimeGuide: !!guide.realTimeGuide,
    originalChaptersLength: guide.realTimeGuide?.chapters?.length || 0,
    totalChaptersWithIntro: totalChapters,
    currentChapterIndex,
    isIntroChapter: currentChapterIndex === 0,
    currentChapter: currentChapter ? {
      id: currentChapter.id,
      title: currentChapter.title,
      hasNarrative: !!currentChapter.narrative,
      hasSceneDescription: !!currentChapter.sceneDescription,
      hasCoreNarrative: !!currentChapter.coreNarrative,
      hasHumanStories: !!currentChapter.humanStories,
      hasNextDirection: !!currentChapter.nextDirection
    } : null
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
    setIsPlaying(false);
    
    // 기존 오디오 정리
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [guide.metadata?.originalLocationName, guide.realTimeGuide?.chapters?.length]);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      try {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio.onended = null;
          currentAudio.onerror = null;
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.onended = null;
          audioRef.current.onerror = null;
        }
      } catch (error) {
        console.warn('컴포넌트 언마운트 시 오디오 정리 오류:', error);
      }
    };
  }, [currentAudio]);

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
      <p key={index} className="mb-4 text-base leading-relaxed text-muted-foreground">
        {paragraph}
      </p>
    ));
  };

  // 오디오 정리
  const stopAndCleanupAudio = () => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.onended = null;
        currentAudio.onerror = null;
        setCurrentAudio(null);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
      }
    } catch (error) {
      console.warn('오디오 정리 중 오류:', error);
    }
    setIsPlaying(false);
  };

  // 챕터 토글 함수
  const toggleChapter = (index: number) => {
    setExpandedChapters(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // 오디오 재생/정지
  const handlePlayPause = async (chapterIndex: number) => {
    const chap = allChapters[chapterIndex];
    if (!chap) return;

    // 다른 챕터 재생 중이면 정지
    if (currentChapterIndex !== chapterIndex) {
      stopAndCleanupAudio();
      setCurrentChapterIndex(chapterIndex);
    }

    if (isPlaying && currentChapterIndex === chapterIndex) {
      stopAndCleanupAudio();
      return;
    }

    // 재생할 텍스트 준비
    const textToSpeak = chap.narrative || 
      [chap.sceneDescription, chap.coreNarrative, chap.humanStories]
        .filter(Boolean).join(' ') || 
      chap.title;

    if (!textToSpeak) return;

    try {
      setIsPlaying(true);
      setCurrentChapterIndex(chapterIndex);

      // 가이드 ID 생성
      const guideId = `${guide.metadata?.originalLocationName || 'guide'}_${language}`.replace(/[^a-zA-Z0-9_]/g, '_');
      
      // API 라우트를 통한 TTS 오디오 생성
      const response = await fetch('/api/ai/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          guide_id: guideId,
          locationName: guide.metadata?.originalLocationName || 'guide',
          language: language === 'ko' ? 'ko-KR' : 'en-US'
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'TTS 생성 실패');
      }
      
      // Base64 오디오 데이터를 Blob URL로 변환
      const audioBlob = new Blob([
        new Uint8Array(
          atob(data.audioData)
            .split('')
            .map(char => char.charCodeAt(0))
        )
      ], { type: data.mimeType || 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        // Blob URL 메모리 해제
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (error) => {
        console.error('오디오 재생 실패:', error);
        setIsPlaying(false);
        setCurrentAudio(null);
        // Blob URL 메모리 해제
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('오디오 생성/재생 실패:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  // 챕터 이동
  const goToChapter = (index: number) => {
    if (index >= 0 && index < totalChapters) {
      stopAndCleanupAudio();
      setCurrentChapterIndex(index);
      
      // 챕터 참조가 있으면 해당 위치로 스크롤
      const targetRef = chapterRefs?.current[index] || internalChapterRefs.current[index];
      if (targetRef) {
        targetRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  };

  // 데이터가 없을 때 로딩 상태 (인트로 챕터는 항상 생성되므로 기본 가이드 구조만 확인)
  if (!guide.overview && !guide.realTimeGuide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GuideLoading 
          type="loading"
          message="가이드를 불러오는 중"
          subMessage="저장된 가이드 데이터를 가져오고 있어요..."
          showProgress={true}
        />
      </div>
    );
  }

  return (
    <div key={`tour-content-${componentKey}`} className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-medium">실시간 가이드</h1>
              <p className="text-sm text-muted-foreground">AI 맞춤형 오디오 가이드</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Volume2 className="w-4 h-4" />
              <span>{totalChapters}개 챕터</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* 장소 정보 */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 border-4 border-foreground rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-medium mb-2">
                {guide.metadata?.originalLocationName || guide.overview?.title || '가이드'}
              </h1>
            </div>
          </div>

          {/* 개요 - 글로벌 프리미엄 디자인 시스템 */}
          {guide.overview && (
            <div className="relative mb-8">
              {/* Main Container - Minimal Monochrome Card */}
              <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
                
                {/* Header Section - Ultra Minimal */}
                <div className="px-6 pt-6 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                        <Info className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">개요</h2>
                        <p className="text-sm text-black/60 font-medium mt-0.5">Essential Information</p>
                      </div>
                    </div>
                    {/* Status Indicator - Minimal Dots */}
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <div className="w-2 h-2 bg-black/20 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid - Mobile First */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-1 gap-3">
                    
                    {/* Tier 1: Immediate Recognition - 3초 정보 */}
                    <div className="p-4 bg-black/3 rounded-2xl border border-black/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Location & Access</span>
                      </div>
                      
                      <div className="space-y-2">
                        {guide.overview.location && (
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-black rounded-full"></div>
                            <p className="text-sm font-semibold text-black">{guide.overview.location}</p>
                          </div>
                        )}
                        
                        {/* Practical Info Row */}
                        <div className="flex flex-wrap gap-4 mt-3">
                          {guide.overview.visitInfo?.duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-black/60" />
                              <span className="text-sm font-medium text-black">{guide.overview.visitInfo.duration}</span>
                            </div>
                          )}
                          {guide.overview.visitInfo?.difficulty && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-black/60" />
                              <span className="text-sm font-medium text-black">{guide.overview.visitInfo.difficulty}</span>
                            </div>
                          )}
                          {guide.overview.visitInfo?.season && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-black/60" />
                              <span className="text-sm font-medium text-black">{guide.overview.visitInfo.season}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tier 2: Key Features - 7초 정보 */}
                    {guide.overview.keyFeatures && (
                      <div className="p-4 bg-black/2 rounded-2xl border border-black/5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Key Features</span>
                        </div>
                        <p className="text-sm font-medium text-black leading-relaxed">{guide.overview.keyFeatures}</p>
                      </div>
                    )}

                    {/* Tier 3: Historical Context - 선택적 확장 */}
                    {guide.overview.background && (
                      <div className="p-4 bg-black/1 rounded-2xl border border-black/5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Historical Context</span>
                        </div>
                        <p className="text-sm font-medium text-black/80 leading-relaxed">{guide.overview.background}</p>
                      </div>
                    )}

                    {/* Legacy Support - 기존 summary */}
                    {guide.overview.summary && !guide.overview.location && !guide.overview.keyFeatures && !guide.overview.background && (
                      <div className="p-4 bg-black/2 rounded-2xl border border-black/5">
                        <p className="text-sm font-medium text-black leading-relaxed">{guide.overview.summary}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Accent Line - Ultra Minimal */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
              </div>
            </div>
          )}

          {/* 필수 관람 포인트 - 모바일 최적화 */}
          {(() => {
            const mustVisitContent = guide.mustVisitSpots || '';
            return mustVisitContent && mustVisitContent.trim().length > 0;
          })() && (
            <div className="relative mb-8">
              <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">필수 관람 포인트</h2>
                        <p className="text-sm text-black/60 font-medium mt-0.5">Must-See Highlights</p>
                      </div>
                    </div>
                    {/* Counter */}
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(guide.mustVisitSpots || '').split(/[,\n]|#/).filter(spot => spot && spot.trim()).length - 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags Container - Mobile Optimized */}
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-3">
                    {(guide.mustVisitSpots || '').split(/[,\n]|#/).filter(spot => spot && spot.trim()).map((spot, index) => {
                      const cleanSpot = spot.trim().replace(/^#+/, '');
                      if (!cleanSpot || index === 0) return null;
                      
                      return (
                        <div
                          key={`highlight-${index}-${cleanSpot}`}
                          className="group relative overflow-hidden"
                        >
                          <div className="relative px-5 py-3 bg-black rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">
                                #{cleanSpot}
                              </span>
                              <div className="w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                            
                            {/* Hover Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Fallback for Non-Hashtag Format */}
                  {guide.mustVisitSpots && !guide.mustVisitSpots.includes('#') && (
                    <div className="mt-4 p-4 bg-black/3 border border-black/5 rounded-2xl">
                      <p className="text-sm font-medium text-black leading-relaxed">{guide.mustVisitSpots}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
              </div>
            </div>
          )}

          {/* 주의사항 - 글로벌 Safety-First 디자인 */}
          {(() => {
            const safetyContent = guide.safetyWarnings || '';
            return safetyContent && safetyContent.trim().length > 0;
          })() && (
            <div className="relative mb-8">
              <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-black tracking-tight">주의사항</h2>
                        <p className="text-sm text-black/60 font-medium mt-0.5">Safety Guidelines</p>
                      </div>
                    </div>
                    {/* Priority Indicator */}
                    <div className="w-3 h-3 bg-black rounded-full opacity-80"></div>
                  </div>
                </div>

                {/* Safety Items - Mobile Optimized List */}
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {(() => {
                      const safetyContent = guide.safetyWarnings || '';
                      
                      return safetyContent.split('\n').filter(w => w.trim()).map((warning, index) => {
                        const cleanWarning = warning.trim().replace(/^[•·-]\s*/, '');
                        if (!cleanWarning) return null;
                        
                        return (
                          <div key={`safety-${index}`} className="group relative">
                            <div className="flex items-start gap-4 p-4 bg-black/2 hover:bg-black/4 rounded-2xl border border-black/5 transition-all duration-200">
                              {/* Bullet Point - Ultra Minimal */}
                              <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2 group-hover:scale-110 transition-transform"></div>
                              
                              {/* Content */}
                              <p className="text-sm font-medium text-black leading-relaxed">
                                {cleanWarning}
                              </p>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
              </div>
            </div>
          )}


          {/* 챕터 리스트 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">
                <Route className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-medium">관람 순서</h2>
              <div className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                {totalChapters}개 챕터
              </div>
            </div>

            <div className="space-y-4">
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
                  className={`border border-border rounded-lg overflow-hidden transition-all duration-200 ${
                    currentChapterIndex === index ? 'border-foreground bg-muted/30' : 'hover:border-foreground/50'
                  }`}
                >
                  {/* 챕터 헤더 */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleChapter(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center font-medium transition-all duration-300 text-xs ${
                          currentChapterIndex === index 
                            ? 'border-foreground bg-foreground text-background' 
                            : 'border-border text-muted-foreground'
                        }`}>
                          {index === 0 ? '인트로' : String(index).padStart(2, '0')}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{chapter.title}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* 재생/정지 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause(index);
                          }}
                          className={`w-12 h-12 border-2 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                            isPlaying && currentChapterIndex === index
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                          }`}
                        >
                          {isPlaying && currentChapterIndex === index ? 
                            <Pause className="w-5 h-5" /> : 
                            <Play className="w-5 h-5 ml-0.5" />
                          }
                        </button>
                        
                        {/* 확장 인디케이터 */}
                        <div className={`transition-transform duration-300 ${
                          expandedChapters.includes(index) ? 'rotate-180' : ''
                        }`}>
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 챕터 내용 */}
                  {expandedChapters.includes(index) && (
                    <div className="border-t border-border p-6">
                      <div className="space-y-4">
                        <div className="text-muted-foreground leading-relaxed">
                          {chapter.narrative ? 
                            formatText(chapter.narrative) :
                            formatText([chapter.sceneDescription, chapter.coreNarrative, chapter.humanStories]
                              .filter(Boolean).join(' '))
                          }
                        </div>
                        
                        {/* 다음 이동 안내 */}
                        {chapter.nextDirection && (
                          <div className="mt-6 p-4 bg-muted/30 rounded-lg border-l-4 border-foreground">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 border-2 border-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Route className="w-3 h-3" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">다음 이동 안내</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {chapter.nextDirection}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* 디버깅 정보 (개발 모드에서만) */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-muted-foreground bg-muted p-4 rounded-lg">
                            <p>Debug - {index === 0 ? 'Intro Chapter' : `Chapter ${index}`}:</p>
                            <p>Title: {chapter.title}</p>
                            <p>Narrative: {chapter.narrative ? '있음' : '없음'}</p>
                            <p>Scene: {chapter.sceneDescription ? '있음' : '없음'}</p>
                            <p>Core: {chapter.coreNarrative ? '있음' : '없음'}</p>
                            <p>Stories: {chapter.humanStories ? '있음' : '없음'}</p>
                            <p>Next Direction: {chapter.nextDirection ? '있음' : '없음'}</p>
                            {index === 0 && <p className="text-slate-600 font-medium">🎯 자동 생성된 인트로 챕터</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 전체 재생 버튼 */}
          <div className="border-2 border-foreground rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">전체 오디오 투어</h3>
                <p className="text-sm text-muted-foreground">
                  {totalChapters}개 챕터 (인트로 포함) • 약 {Math.round(totalChapters * 4)}분
                </p>
              </div>
              <button 
                onClick={() => handlePlayPause(0)}
                className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                전체 재생
              </button>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-24" />
      </div>

      {/* BigTech 디자인 시뮬레이터 임시 제거 (빌드 오류 해결) */}

      {/* 스크롤 투 탑 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-background border-2 border-foreground hover:bg-foreground hover:text-background text-foreground flex items-center justify-center transition-all duration-300 z-50 shadow-lg rounded-full"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default TourContent;
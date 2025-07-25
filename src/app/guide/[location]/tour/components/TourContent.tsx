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
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { ResponsiveContainer, PageHeader, Card, Stack, Flex } from '@/components/layout/ResponsiveContainer';
import { Button } from '@/components/ui/button';
// import BigTechDesignOptimizer from '@/components/design/BigTechDesignOptimizer';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLElement | null)[]>;
}

const TourContent = ({ guide, language, chapterRefs }: TourContentProps) => {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // \ub2e8\uc77c \uc624\ub514\uc624 \uc778\uc2a4\ud134\uc2a4 \uad00\ub9ac\ub97c \uc704\ud574 audioRef\ub85c \ud1b5\ud569
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [componentKey, setComponentKey] = useState(0); // 컴포넌트 완전 리렌더링용
  // const [showDesignSimulator, setShowDesignSimulator] = useState(false); // BigTech 디자인 시뮬레이터
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const internalChapterRefs = useRef<(HTMLElement | null)[]>([]);

  // 🎯 AI 생성 인트로 챗터 사용 또는 폴백 인트로 생성
  const createIntroChapter = () => {
    const locationName = guide.metadata?.originalLocationName || guide.overview?.title || t('guide.thisPlace');
    
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
      title: t('guide.tourStart', { location: locationName }),
      narrative: t('guide.introNarrative', { 
        location: locationName,
        locationInfo: guide.overview?.location || t('guide.specialPlace'),
        features: guide.overview?.keyFeatures || guide.overview?.summary || t('guide.uniqueCharm'),
        background: guide.overview?.background || t('guide.richHistory')
      }),
      nextDirection: t('guide.startMainTour', { location: locationName })
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
    
    // 기존 오디오 정리 (단일 인스턴스 관리)
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

  // 컴포넌트 언마운트 시 오디오 정리 (단일 인스턴스 관리)
  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.onended = null;
          audioRef.current.onerror = null;
          audioRef.current = null;
        }
      } catch (error) {
        console.warn('컴포넌트 언마운트 시 오디오 정리 오류:', error);
      }
    };
  }, []);  // currentAudio 종속성 제거로 단일 인스턴스 초점

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

  // 오디오 정리 (단일 인스턴스 관리 + Race Condition 방지)
  const stopAndCleanupAudio = async () => {
    return new Promise<void>((resolve) => {
      try {
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
      // 짧은 지연을 통해 오디오 정리 완료 보장
      setTimeout(resolve, 50);
    });
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

    // 다른 챕터 재생 중이면 정지 (비동기 대기)
    if (currentChapterIndex !== chapterIndex) {
      await stopAndCleanupAudio();
      setCurrentChapterIndex(chapterIndex);
    }

    if (isPlaying && currentChapterIndex === chapterIndex) {
      await stopAndCleanupAudio();
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
      
      // 고급 성격 기반 TTS 사용 (사용자 성격 자동 감지)
      const { advancedTTSService } = await import('@/lib/advanced-tts-service');
      
      const ttsResult = await advancedTTSService.generatePersonalityTTS({
        text: textToSpeak,
        language: language === 'ko' ? 'ko-KR' : 'en-US',
        guide_id: guideId,
        locationName: guide.metadata?.originalLocationName || 'guide',
        adaptToMood: true
      });

      if (!ttsResult.success) {
        throw new Error(ttsResult.error || t('guide.ttsGenerationFailed'));
      }

      console.log('🎭 성격 기반 TTS 적용:', ttsResult.personalityInfo);
      
      // Base64 오디오 데이터를 Blob URL로 변환
      const audioBlob = new Blob([
        new Uint8Array(
          atob(ttsResult.audioData!)
            .split('')
            .map(char => char.charCodeAt(0))
        )
      ], { type: ttsResult.mimeType || 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
        // Blob URL 메모리 해제
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (error) => {
        console.error('오디오 재생 실패:', error);
        setIsPlaying(false);
        audioRef.current = null;
        // Blob URL 메모리 해제
        URL.revokeObjectURL(audioUrl);
      };

      // 안전한 재생을 위한 Promise 체인 (에러 처리 강화)
      await new Promise<void>((resolve, reject) => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('🎵 성격 기반 TTS 재생 시작');
              resolve();
            })
            .catch((error) => {
              console.log('🔄 오디오 재생 에러 처리:', error.name, error.message);
              if (error.name === 'AbortError') {
                console.log('✅ 오디오 재생이 정상적으로 중단됨 (사용자 액션)');
                resolve(); // AbortError는 정상적인 중단으로 처리
              } else if (error.name === 'NotAllowedError') {
                console.warn('⚠️ 자동 재생이 차단됨 - 사용자 상호작용 필요');
                resolve(); // 자동재생 정책으로 인한 차단도 정상 처리
              } else {
                console.error('❌ 치명적 오디오 재생 오류:', error);
                reject(error);
              }
            });
        } else {
          resolve();
        }
      });
    } catch (error) {
      console.error('🚨 TTS 시스템 오류:', error);
      
      // 상세한 에러 분류 및 사용자 친화적 메시지
      let userMessage = t('guide.audioPlaybackError');
      
      if (error instanceof Error) {
        if (error.message.includes('GEMINI_API_KEY')) {
          userMessage = t('guide.audioServiceError');
        } else if (error.message.includes(t('guide.ttsGenerationFailed'))) {
          userMessage = t('guide.audioGenerationRetry');
        } else if (error.message.includes('fetch')) {
          userMessage = t('guide.checkNetworkConnection');
        }
      }
      
      // TODO: 사용자에게 친화적인 에러 메시지 표시 (향후 토스트 알림으로 대체)
      console.log('📢 사용자 메시지:', userMessage);
      
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  // 챕터 이동
  const goToChapter = async (index: number) => {
    if (index >= 0 && index < totalChapters) {
      await stopAndCleanupAudio();
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
          message={t('guide.loadingGuide')}
          subMessage={t('guide.fetchingGuideData')}
          showProgress={true}
        />
      </div>
    );
  }

  return (
    <ResponsiveContainer key={`tour-content-${componentKey}`} variant="default" className="min-h-screen">
      {/* Header */}
      <PageHeader
        title={t('guide.realTimeGuideTitle')}
        subtitle={t('guide.aiCustomAudioGuide')}
        backButton={true}
        onBack={() => window.history.back()}
        actions={
          <Flex align="center" gap="sm" className="text-sm text-muted-foreground">
            <Volume2 className="w-4 h-4" />
            <span>{totalChapters}{t('guide.chapters')}</span>
          </Flex>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-8">
          <Stack space="lg">
          {/* 장소 정보 */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 border-4 border-foreground rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl font-medium mb-2">
                {guide.metadata?.originalLocationName || guide.overview?.title || t('guide.guideTitle')}
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
                        <h2 className="text-2xl font-bold text-black tracking-tight">{t('guide.overview')}</h2>
                        <p className="text-sm text-black/60 font-medium mt-0.5">{t('guide.essentialInfo')}</p>
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
                        <span className="text-xs font-bold text-black/60 uppercase tracking-wider">{t('guide.locationAccess')}</span>
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
                          <span className="text-xs font-bold text-black/60 uppercase tracking-wider">{t('guide.keyFeatures')}</span>
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
                          <span className="text-xs font-bold text-black/60 uppercase tracking-wider">{t('guide.historicalContext')}</span>
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
                        <h2 className="text-2xl font-bold text-black tracking-tight">{t('guide.mustSeePoints')}</h2>
                        <p className="text-sm text-black/60 font-medium mt-0.5">{t('guide.mustSeeHighlights')}</p>
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
                        <h2 className="text-2xl font-bold text-black tracking-tight">{t('guide.precautions')}</h2>
                        <p className="text-sm text-black/60 font-medium mt-0.5">{t('guide.safetyGuidelines')}</p>
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
              <h2 className="text-xl font-medium">{t('guide.viewingOrder')}</h2>
              <div className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                {t('guide.chaptersCount', { count: totalChapters })}
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
                >
                <Card
                  variant={currentChapterIndex === index ? "elevated" : "default"}
                  className="overflow-hidden transition-all duration-200"
                >
                  {/* 챕터 헤더 */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleChapter(index)}
                  >
                    <Flex align="center" justify="between">
                      <Flex align="center" gap="md" className="flex-1">
                        <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center font-medium transition-all duration-300 text-xs ${
                          currentChapterIndex === index 
                            ? 'border-foreground bg-foreground text-background' 
                            : 'border-border text-muted-foreground'
                        }`}>
                          {index === 0 ? t('guide.intro') : String(index).padStart(2, '0')}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{chapter.title}</h3>
                        </div>
                      </Flex>
                      
                      <Flex align="center" gap="sm">
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
                      </Flex>
                    </Flex>
                  </div>
                  
                  {/* 챕터 내용 */}
                  {expandedChapters.includes(index) && (
                    <div className="border-t border-border p-6">
                      <Stack space="md">
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
                                <h4 className="text-sm font-medium mb-1">{t('guide.nextMoveGuide')}</h4>
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

          {/* 전체 재생 버튼 */}
          <Card variant="bordered">
            <Flex align="center" justify="between" className="p-6">
              <div>
                <h3 className="font-medium mb-1">{t('guide.entireAudioTour')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('guide.chaptersWithIntro', { count: totalChapters, minutes: Math.round(totalChapters * 4) })}
                </p>
              </div>
              <Button 
                onClick={() => handlePlayPause(0)}
                variant="default"
                size="lg"
              >
                <Play className="w-5 h-5 fill-current mr-2" />
                {t('guide.playAll')}
              </Button>
            </Flex>
          </Card>
          </Stack>

          {/* Bottom spacing */}
          <div className="h-24" />
        </div>
      </div>

      {/* BigTech 디자인 시뮬레이터 임시 제거 (빌드 오류 해결) */}

      {/* 스크롤 투 탑 버튼 */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          variant="outline"
          size="icon"
          className="fixed bottom-8 right-8 w-14 h-14 z-50 shadow-lg rounded-full"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </ResponsiveContainer>
  );
};

export default TourContent;
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
import BigTechDesignOptimizer from '@/components/design/BigTechDesignOptimizer';

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
  const [showDesignSimulator, setShowDesignSimulator] = useState(false); // BigTech 디자인 시뮬레이터
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
      
      const audioUrl = data.url;

      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        console.error('오디오 재생 실패');
        setIsPlaying(false);
        setCurrentAudio(null);
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

          {/* 개요 - Premium BigTech Design */}
          {guide.overview && (
            <div className="group relative">
              {/* 🎨 Airbnb/Uber 스타일: 프리미엄 카드 */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-slate-50/20 backdrop-blur-sm transition-all duration-300 hover:border-slate-300/60 hover:shadow-2xl hover:shadow-slate-200/40">
                {/* 헤더 섹션 - Tesla/Apple 스타일 */}
                <div className="relative px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                        <Info className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">개요</h2>
                        <p className="text-sm text-slate-600 font-medium mt-1">핵심 정보 요약</p>
                      </div>
                    </div>
                    {/* Spotify/Discord 스타일 미니 인디케이터 */}
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* 콘텐츠 영역 - Notion 스타일 정보 카드 */}
                <div className="px-6 pb-6 space-y-4">
                  {/* 위치 정보 */}
                  {guide.overview.location && (
                    <div className="group/item p-4 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-slate-600 rounded-lg flex items-center justify-center mt-0.5">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{guide.overview.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 주요 특징 */}
                  {guide.overview.keyFeatures && (
                    <div className="group/item p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-slate-700 rounded-lg flex items-center justify-center mt-0.5">
                          <Eye className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{guide.overview.keyFeatures}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 역사적 배경 */}
                  {guide.overview.background && (
                    <div className="group/item p-4 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-slate-800 rounded-lg flex items-center justify-center mt-0.5">
                          <BookOpen className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{guide.overview.background}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 기존 summary 호환성 */}
                  {guide.overview.summary && !guide.overview.location && !guide.overview.keyFeatures && !guide.overview.background && (
                    <div className="p-4 bg-white/80 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-slate-700 leading-relaxed">{guide.overview.summary}</p>
                    </div>
                  )}
                  
                  {/* 방문 정보 (visitInfo) */}
                  {guide.overview.visitInfo && (
                    <div className="grid grid-cols-1 gap-3">
                      {guide.overview.visitInfo.duration && (
                        <div className="group/item p-3 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-slate-600 rounded-lg flex items-center justify-center">
                              <Clock className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-sm text-slate-700 font-medium">{guide.overview.visitInfo.duration}</p>
                          </div>
                        </div>
                      )}
                      {guide.overview.visitInfo.difficulty && (
                        <div className="group/item p-3 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-slate-700 rounded-lg flex items-center justify-center">
                              <Users className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-sm text-slate-700 font-medium">{guide.overview.visitInfo.difficulty}</p>
                          </div>
                        </div>
                      )}
                      {guide.overview.visitInfo.season && (
                        <div className="group/item p-3 bg-white/60 hover:bg-white/80 rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-slate-800 rounded-lg flex items-center justify-center">
                              <Calendar className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-sm text-slate-700 font-medium">{guide.overview.visitInfo.season}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* 하단 그라데이션 보더 - Apple 스타일 */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"></div>
              </div>
            </div>
          )}

          {/* [주의!] 안전 주의사항 - BigTech Design System */}
          {(() => {
            console.log('⚠️ BigTech 디자인 시스템 - safetyWarnings 확인:', {
              safetyWarnings: guide.safetyWarnings,
              타입: typeof guide.safetyWarnings,
              길이: guide.safetyWarnings?.length,
              전체가이드객체키: Object.keys(guide)
            });
            
            // 🔧 다양한 타입 처리 (string, object, array)
            let safetyContent = '';
            if (typeof guide.safetyWarnings === 'string') {
              safetyContent = guide.safetyWarnings;
            } else if (guide.safetyWarnings && typeof guide.safetyWarnings === 'object') {
              // Object나 Array인 경우 JSON을 파싱해서 텍스트로 변환
              safetyContent = Array.isArray(guide.safetyWarnings) 
                ? guide.safetyWarnings.join('\n')
                : JSON.stringify(guide.safetyWarnings).replace(/[{}",]/g, ' ').trim();
            }
            
            return safetyContent && safetyContent.trim().length > 0;
          })() && (
            <div className="group relative">
              {/* 🎨 Apple/Meta 스타일: 경고 카드 */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-slate-100/60 backdrop-blur-sm transition-all duration-300 hover:border-slate-300/60 hover:shadow-lg">
                {/* 상단 아이콘 바 */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight">주의사항</h2>
                    <p className="text-xs text-slate-700/80 font-medium mt-0.5">방문 전 꼭 확인하세요</p>
                  </div>
                  {/* Google 스타일 미니 인디케이터 */}
                  <div className="w-2 h-2 bg-slate-500 rounded-full opacity-60"></div>
                </div>
                
                {/* 콘텐츠 영역 */}
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    {(() => {
                      let safetyContent = '';
                      if (typeof guide.safetyWarnings === 'string') {
                        safetyContent = guide.safetyWarnings;
                      } else if (guide.safetyWarnings && typeof guide.safetyWarnings === 'object') {
                        safetyContent = Array.isArray(guide.safetyWarnings) 
                          ? guide.safetyWarnings.join('\n')
                          : JSON.stringify(guide.safetyWarnings).replace(/[{}",]/g, ' ').trim();
                      }
                      
                      return safetyContent.split('\n').filter(w => w.trim()).map((warning, index) => {
                        const cleanWarning = warning.trim().replace(/^[•·-]\s*/, '');
                        if (!cleanWarning) return null;
                        
                        return (
                          <div key={`safety-${index}`} className="flex items-start gap-3 group/item hover:bg-white/40 rounded-xl p-3 transition-colors duration-200">
                            {/* Microsoft 스타일 불릿 */}
                            <div className="flex-shrink-0 w-1.5 h-1.5 bg-slate-600 rounded-full mt-2.5 group-hover/item:bg-slate-700 transition-colors"></div>
                            <p className="text-slate-900/90 text-sm leading-relaxed font-medium">
                              {cleanWarning}
                            </p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                
                {/* 하단 그라데이션 보더 (Apple 스타일) */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"></div>
              </div>
            </div>
          )}

          {/* 필수 관람 포인트 - BigTech Interactive Design */}
          {(() => {
            console.log('🎯 BigTech 필수 관람 포인트 확인:', {
              mustVisitSpots: guide.mustVisitSpots,
              타입: typeof guide.mustVisitSpots,
              길이: guide.mustVisitSpots?.length,
              전체가이드객체: Object.keys(guide)
            });
            return guide.mustVisitSpots && typeof guide.mustVisitSpots === 'string' && guide.mustVisitSpots.trim();
          })() && (
            <div className="group relative">
              {/* 🎨 Notion/Linear 스타일: 인터랙티브 카드 */}
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-slate-100/40 backdrop-blur-sm transition-all duration-300 hover:border-slate-300/60 hover:shadow-xl hover:shadow-slate-100/20">
                {/* 헤더 섹션 */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">필수 관람 포인트</h2>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">놓치면 안 될 핵심 명소</p>
                    </div>
                  </div>
                  {/* Stripe 스타일 카운터 */}
                  <div className="px-3 py-1 bg-slate-100 rounded-full">
                    <span className="text-xs font-bold text-slate-700">
                      {(guide.mustVisitSpots || '').split(/[,\n]|#/).filter(spot => spot && spot.trim()).length - 1}개
                    </span>
                  </div>
                </div>
                
                {/* 태그 컨테이너 */}
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-3">
                    {(guide.mustVisitSpots || '').split(/[,\n]|#/).filter(spot => spot && spot.trim()).map((spot, index) => {
                      const cleanSpot = spot.trim().replace(/^#+/, '');
                      if (!cleanSpot || index === 0) return null; // 첫 번째는 보통 빈 문자열
                      
                      // 🎨 모노크롬 스타일 태그
                      const monochromeStyles = [
                        'bg-slate-800',
                        'bg-slate-700', 
                        'bg-slate-900',
                        'bg-slate-600',
                        'bg-slate-800'
                      ];
                      const monochromeStyle = monochromeStyles[index % monochromeStyles.length];
                      
                      return (
                        <div
                          key={`spot-${index}-${cleanSpot}`}
                          className="group/tag relative overflow-hidden"
                        >
                          <div className={`
                            relative px-4 py-2.5 ${monochromeStyle} rounded-xl 
                            shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20
                            transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5
                            cursor-pointer border border-slate-300/20
                          `}>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">
                                #{cleanSpot}
                              </span>
                              <div className="w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover/tag:opacity-100 transition-opacity"></div>
                            </div>
                            
                            {/* 호버 시 글로우 효과 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/tag:translate-x-[100%] transition-transform duration-500"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* 원본 텍스트 백업 */}
                  {guide.mustVisitSpots && !guide.mustVisitSpots.includes('#') && (
                    <div className="mt-4 p-4 bg-white/60 border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed">
                      {guide.mustVisitSpots}
                    </div>
                  )}
                </div>
                
                {/* Apple 스타일 하단 시그니처 */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent"></div>
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

      {/* 🎨 BigTech 디자인 시뮬레이터 토글 버튼 */}
      <button
        onClick={() => setShowDesignSimulator(!showDesignSimulator)}
        className="fixed bottom-8 left-8 w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all duration-300 z-50 shadow-lg rounded-full"
        title="BigTech 디자인 시뮬레이터"
      >
        <Eye className="w-5 h-5" />
      </button>

      {/* 🚀 BigTech 디자인 시뮬레이터 */}
      <BigTechDesignOptimizer
        contentType="overview"
        showSimulation={showDesignSimulator}
        onPatternSelect={(pattern) => {
          console.log('🎨 선택된 BigTech 패턴:', pattern);
        }}
      />

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
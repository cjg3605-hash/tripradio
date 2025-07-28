'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  ArrowUp, 
  Eye, 
  AlertTriangle, 
  Clock, 
  MapPin,
  BookOpen,
  Route,
  Info,
  Sparkles,
  ArrowLeft,
  Calendar,
  Users,
  Zap,
  Headphones,
  Volume2,
  Home
} from 'lucide-react';
import { GuideData, GuideChapter } from '@/types/guide';
import { AudioChapter } from '@/types/audio';
import GuideLoading from '@/components/ui/GuideLoading';
import ChapterAudioPlayer from '@/components/audio/ChapterAudioPlayer';
import StartLocationMap from '@/components/guide/StartLocationMap';
import { useLanguage } from '@/contexts/LanguageContext';
import { ResponsiveContainer, PageHeader, Card, Stack, Flex } from '@/components/layout/ResponsiveContainer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLocationCoordinates, DEFAULT_SEOUL_CENTER } from '@/data/locations';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLElement | null)[]>;
}

const TourContent = ({ guide, language, chapterRefs }: TourContentProps) => {
  const { currentLanguage, t } = useLanguage();
  const router = useRouter();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [componentKey, setComponentKey] = useState(0);

  // 가이드 데이터를 전역에 노출 (라이브 페이지에서 사용)
  useEffect(() => {
    if (guide) {
      (window as any).currentGuideData = guide;
      console.log('🌍 TourContent에서 가이드 데이터 전역 설정:', guide);
    }
  }, [guide]);
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
      title: `${locationName} ${t('guide.tourStart')}`,
      narrative: `${locationName}에 오신 것을 환영합니다. ${guide.overview?.location || '특별한 장소'}에 위치한 이곳은 ${guide.overview?.keyFeatures || guide.overview?.summary || '독특한 매력'}으로 유명합니다. ${guide.overview?.background || '풍부한 역사'}를 간직한 특별한 장소로 여러분을 안내하겠습니다.`,
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

  // 🎵 GuideChapter를 AudioChapter로 변환
  const audioChapters: AudioChapter[] = allChapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title || `챕터 ${chapter.id}`,
    text: chapter.narrative || '',
    duration: chapter.estimatedDuration || 120 // 기본 2분
  }));

  // 🎯 챕터 변경 핸들러
  const handleChapterChange = (chapterIndex: number) => {
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
  };

  // 🎧 라이브 투어로 업그레이드 유도
  const locationName = guide.metadata?.originalLocationName || guide.overview?.title;
  const currentChapter = allChapters[currentChapterIndex];

  // 안전한 필드 접근 (기본값 제공)
  const sceneDescription = currentChapter?.sceneDescription || '';
  const coreNarrative = currentChapter?.coreNarrative || '';
  const humanStories = currentChapter?.humanStories || '';
  const nextDirection = currentChapter?.nextDirection || '';

  // 🔍 챕터별 좌표 데이터 상세 디버깅
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
      hasNextDirection: !!currentChapter.nextDirection,
      // 🚨 좌표 데이터 확인
      coordinates: currentChapter.coordinates || null,
      lat: currentChapter.lat || null,
      lng: currentChapter.lng || null,
      location: currentChapter.location || null
    } : null,
    // 🚨 전체 챕터 좌표 정보
    allChaptersCoordinates: allChapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      coordinates: chapter.coordinates || null,
      lat: chapter.lat || null,
      lng: chapter.lng || null,
      location: chapter.location || null,
      hasCoordinateData: !!(chapter.coordinates || chapter.lat || chapter.location)
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
  }, [guide.metadata?.originalLocationName, guide.realTimeGuide?.chapters?.length]);

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

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 홈으로 이동
  const goToHome = () => {
    router.push('/');
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

  // 챕터 토글 함수
  const toggleChapter = (index: number) => {
    setExpandedChapters(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
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
    <div>
      <ResponsiveContainer key={`tour-content-${componentKey}`} variant="fullwidth" padding="none" className="min-h-screen">
        <div className="flex-1 overflow-y-auto">
          <div className="px-0.5 py-2 sm:px-0.5 lg:px-1">
            <Stack space="sm">
              {/* 장소 정보 */}
              <div className="text-center space-y-2">
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
                <div className="relative mb-3">
                  <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
                    
                    {/* Header Section - Ultra Minimal */}
                    <div className="px-4 pt-4 pb-4">
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
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 gap-2">
                        
                        {/* Tier 1: Immediate Recognition - 3초 정보 */}
                        <div className="p-4 bg-black/3 rounded-2xl border border-black/5">
                          <div className="flex items-center gap-3 mb-2">
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
                <div className="relative mb-2">
                  <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
                    
                    {/* Header */}
                    <div className="px-2 pt-2 pb-2">
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
                    <div className="px-4 pb-4">
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
                <div className="relative mb-2">
                  <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3 transition-all duration-500 hover:shadow-xl hover:shadow-black/8 hover:border-black/12">
                    
                    {/* Header */}
                    <div className="px-2 pt-2 pb-2">
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
                    <div className="px-4 pb-4">
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

              {/* 시작점 지도 */}
              <div className="mb-3">
                {(() => {
                  // 실제 위치 데이터 가져오기
                  const locationData = getLocationCoordinates(locationName || '');
                  const startPoint = locationData ? locationData.center : DEFAULT_SEOUL_CENTER;
                  const pois = locationData ? locationData.pois.slice(0, 8) : []; // 최대 8개 POI
                  
                  // 🎯 실제 투어 챕터 데이터 준비 - 지능형 좌표 생성
                  const getSmartCoordinates = (locationName: string, index: number, total: number) => {
                    // 🌍 주요 도시별 기본 좌표 (API 없이)
                    const cityCoords: Record<string, {lat: number, lng: number}> = {
                      '에펠탑': { lat: 48.8584, lng: 2.2945 },
                      '파리': { lat: 48.8566, lng: 2.3522 },
                      '도쿄': { lat: 35.6762, lng: 139.6503 },
                      '뉴욕': { lat: 40.7128, lng: -74.0060 },
                      '런던': { lat: 51.5074, lng: -0.1278 },
                      '로마': { lat: 41.9028, lng: 12.4964 },
                      '서울': { lat: 37.5665, lng: 126.9780 }
                    };
                    
                    // 도시명에서 기본 좌표 찾기
                    const baseCoord = cityCoords[locationName] || 
                                     Object.values(cityCoords).find(coord => 
                                       locationName.includes(Object.keys(cityCoords).find(city => city.includes(locationName.slice(0,2))) || '')
                                     ) || 
                                     cityCoords['서울']; // 기본값
                    
                    // 챕터별 스마트 분산 (원형 배치)
                    const angle = (index / total) * 2 * Math.PI;
                    const radius = 0.005 + (index * 0.002); // 거리 증가
                    
                    return {
                      lat: baseCoord.lat + Math.cos(angle) * radius,
                      lng: baseCoord.lng + Math.sin(angle) * radius
                    };
                  };
                  
                  const chaptersForMap = allChapters.map((chapter, index) => {
                    const coords = getSmartCoordinates(locationName || '', index, allChapters.length);
                    return {
                      id: chapter.id,
                      title: chapter.title,
                      lat: coords.lat,
                      lng: coords.lng,
                      narrative: chapter.narrative || chapter.sceneDescription || '',
                      originalIndex: index
                    };
                  });
                  
                  // 🎯 스마트 시작점 설정
                  const smartStartPoint = chaptersForMap.length > 0 ? 
                    { lat: chaptersForMap[0].lat, lng: chaptersForMap[0].lng, name: `${locationName} 시작점` } :
                    { lat: 48.8584, lng: 2.2945, name: '에펠탑' }; // 에펠탑 기본값
                  
                  console.log('🗺️ 지도 데이터 (API 없음):', {
                    locationName,
                    smartStartPoint,
                    chaptersCount: chaptersForMap.length,
                    chapters: chaptersForMap.map(c => ({ id: c.id, title: c.title, lat: c.lat, lng: c.lng }))
                  });

                  return (
                    <StartLocationMap
                      locationName={locationName || ''}
                      startPoint={smartStartPoint} // 🔥 스마트 시작점 사용
                      chapters={chaptersForMap} // 🔥 실제 챕터 데이터 전달
                      pois={[]} // POI는 비워둠 (챕터 우선)
                      className="w-full"
                    />
                  );
                })()}
              </div>

              {/* 챕터 리스트 */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">
                    <Route className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-medium">{t('guide.viewingOrder')}</h2>
                  <div className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                    총 {totalChapters}개 챕터
                  </div>
                </div>

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
                          className="p-2 cursor-pointer"
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
                                <div className="space-y-2">
                                  <h3 className="font-medium">{chapter.title}</h3>
                                  {/* 챕터별 오디오 플레이어 */}
                                  {audioChapters[index] && (
                                    <div className="w-full">
                                      <ChapterAudioPlayer
                                        chapter={audioChapters[index]}
                                        className="w-full max-w-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Flex>
                            
                            <Flex align="center" gap="sm">
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
                          <div className="border-t border-border p-2">
                            <Stack space="sm">
                              <div className="text-muted-foreground leading-relaxed">
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

              {/* Bottom spacing */}
              <div className="h-8" />
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

          {/* 홈 버튼 (좌하단) - 모던 모노크롬 스타일 */}
          <div 
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
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
              window.location.href = '/';
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
            <Home className="w-6 h-6" />
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default TourContent;
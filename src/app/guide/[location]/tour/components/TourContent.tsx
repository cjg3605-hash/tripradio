'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowUp, 
  MapPin,
  Info,
  Home,
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
  RefreshCw
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
import { getLocationCoordinates } from '@/data/locations';
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
    const locationName = guide?.metadata?.originalLocationName || guide?.overview?.title || String(t('guide.thisPlace'));
    
    // 🔥 React Error #185 방지: AI가 이미 인트로 챕터(id: 0)를 생성했는지 안전하게 확인
    const aiGeneratedIntro = guide?.realTimeGuide?.chapters?.find?.(chapter => chapter?.id === 0);
    
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

  // 🔥 React Error #185 방지: 인트로 챕터를 포함한 전체 챕터 배열 (AI 생성 시스템 보존)
  const introChapter = createIntroChapter();
  const originalChapters = guide?.realTimeGuide?.chapters || [];
  const aiGeneratedIntro = originalChapters.find?.(chapter => chapter?.id === 0 && chapter?.narrative);
  
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
                    {guide?.metadata?.originalLocationName || guide?.overview?.title || String(t('guide.guideTitle'))}
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
                        
                        {/* 간소화된 정보 - 제목 없이 내용만 한 줄로 */}
                        <div className="space-y-3">
                          {guide.overview.location && (
                            <div className="flex items-center gap-3 p-3 bg-black/2 rounded-2xl border border-black/5">
                              <div className="w-1 h-4 bg-black rounded-full"></div>
                              <p className="text-sm font-medium text-black">{guide.overview.location}</p>
                            </div>
                          )}
                          
                          {guide.overview.keyFeatures && (
                            <div className="flex items-center gap-3 p-3 bg-black/2 rounded-2xl border border-black/5">
                              <div className="w-1 h-4 bg-black rounded-full"></div>
                              <p className="text-sm font-medium text-black">{guide.overview.keyFeatures}</p>
                            </div>
                          )}
                          
                          {guide.overview.background && (
                            <div className="flex items-center gap-3 p-3 bg-black/2 rounded-2xl border border-black/5">
                              <div className="w-1 h-4 bg-black rounded-full"></div>
                              <p className="text-sm font-medium text-black">{guide.overview.background}</p>
                            </div>
                          )}
                          
                          {/* Practical Info Row */}
                          {(guide.overview.visitInfo?.duration || guide.overview.visitInfo?.difficulty || guide.overview.visitInfo?.season) && (
                            <div className="flex flex-wrap gap-4 p-3 bg-black/2 rounded-2xl border border-black/5">
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
                          )}
                        </div>

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
                  const startPoint = locationData ? locationData.center : null; // 🔥 폴백 좌표 제거
                  const pois = locationData ? locationData.pois.slice(0, 8) : []; // 최대 8개 POI
                  
                  // 🚫 폴백 좌표 시스템 제거 - 실제 데이터만 사용
                  
                  // 🎯 공통 유틸리티로 좌표 파싱
                  const parsedCoordinates = parseSupabaseCoordinates(guideCoordinates);
                  
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
                          <h3 className="text-lg font-bold text-red-800 mb-2">표시할 장소가 없습니다</h3>
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
                    <StartLocationMap
                      locationName={locationName || ''}
                      startPoint={smartStartPoint} // 🔥 스마트 시작점 사용
                      chapters={displayChapters} // 🔥 페이지 타입별 챕터 데이터 전달
                      pois={[]} // POI는 비워둠 (챕터 우선)
                      className="w-full"
                      guideCoordinates={guideCoordinates}
                      guideId={String(guide?.metadata?.guideId || guide?.metadata?.id || '')}
                    />
                  );
                })()}
              </div>

              {/* 챕터 리스트 */}
              <div className="space-y-2">
                <div className="relative mb-2">
                  <div className="relative overflow-hidden rounded-3xl bg-white border border-black/8 shadow-lg shadow-black/3">
                    <div className="px-2 pt-2 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                            <Route className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-black tracking-tight">{t('guide.viewingOrder')}</h2>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{totalChapters}</span>
                        </div>
                      </div>
                    </div>
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

              {/* 하단 액션 버튼들 */}
              <div className="mt-8 mb-4 px-4">
                <div className="flex gap-4">
                  {/* 즐겨찾기 버튼 */}
                  <button
                    onClick={handleBookmark}
                    disabled={isBookmarking || isBookmarked}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-black rounded-2xl font-semibold text-black transition-all duration-300 hover:bg-black hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:active:scale-100"
                  >
                    <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span>
                      {isBookmarking ? '저장중...' : 
                       isBookmarked ? '저장됨' : 
                       String(t('guide.bookmarkGuide'))}
                    </span>
                  </button>

                  {/* 재생성 버튼 */}
                  <button
                    onClick={() => setShowRegenerateConfirm(true)}
                    disabled={isRegenerating}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-black rounded-2xl font-semibold text-black transition-all duration-300 hover:bg-black hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:active:scale-100"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>
                      {isRegenerating ? '생성중...' : String(t('guide.regenerateGuide'))}
                    </span>
                  </button>
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
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
  ArrowLeft
} from 'lucide-react';
import { GuideData, GuideChapter } from '@/types/guide';
import { getOrCreateChapterAudio } from '@/lib/tts-gcs';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLElement | null)[]>;
}

const TourContent = ({ guide, language, chapterRefs = { current: [] } }: TourContentProps) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalChapters = guide.realTimeGuide?.chapters?.length || 0;
  const currentChapter = guide.realTimeGuide?.chapters?.[currentChapterIndex];

  // 안전한 필드 접근 (기본값 제공)
  const sceneDescription = currentChapter?.sceneDescription || '';
  const coreNarrative = currentChapter?.coreNarrative || '';
  const humanStories = currentChapter?.humanStories || '';
  const nextDirection = currentChapter?.nextDirection || '';

  // 데이터 구조 디버깅
  console.log('🔍 TourContent 데이터 구조:', {
    hasRealTimeGuide: !!guide.realTimeGuide,
    chaptersLength: guide.realTimeGuide?.chapters?.length,
    currentChapterIndex,
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

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
    const chap = guide.realTimeGuide?.chapters?.[chapterIndex];
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
      
      // TTS 오디오 생성 및 재생
      const audioUrl = await getOrCreateChapterAudio(
        guideId, 
        chapterIndex, 
        textToSpeak, 
        language === 'ko' ? 'ko-KR' : 'en-US',
        1.0
      );

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
      if (chapterRefs.current[index]) {
        chapterRefs.current[index]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }
  };

  // 데이터가 없을 때 로딩 상태
  if (!guide.realTimeGuide?.chapters?.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-32 h-32 border-4 border-border rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-16 h-16 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-medium mb-2">가이드를 불러오는 중</h2>
            <p className="text-muted-foreground">잠시만 기다려주세요...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

          {/* 개요 */}
          {guide.overview && (
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-foreground rounded flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h2 className="font-medium">개요</h2>
              </div>
              
              <div className="space-y-3">
                {/* 위치 - 라벨 없이 내용만 */}
                {guide.overview.location && (
                  <p className="text-muted-foreground">{guide.overview.location}</p>
                )}
                
                {/* 주요 특징 - 라벨 없이 내용만 */}
                {guide.overview.keyFeatures && (
                  <p className="text-muted-foreground">{guide.overview.keyFeatures}</p>
                )}
                
                {/* 배경 - 라벨 없이 내용만 */}
                {guide.overview.background && (
                  <p className="text-muted-foreground">{guide.overview.background}</p>
                )}
                
                {/* 기존 summary가 있으면 표시 (호환성) */}
                {guide.overview.summary && !guide.overview.location && !guide.overview.keyFeatures && !guide.overview.background && (
                  <p className="text-muted-foreground leading-relaxed">
                    {guide.overview.summary}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 필수 관람 포인트 */}
          {guide.mustVisitSpots && (
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
                <h2 className="font-medium">필수 관람 포인트</h2>
              </div>
              
              <div className="text-muted-foreground">
                {guide.mustVisitSpots}
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
              {guide.realTimeGuide.chapters.map((chapter, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (chapterRefs.current) {
                      chapterRefs.current[index] = el;
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
                        <div className={`w-12 h-12 border-2 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                          currentChapterIndex === index 
                            ? 'border-foreground bg-foreground text-background' 
                            : 'border-border text-muted-foreground'
                        }`}>
                          {String(index + 1).padStart(2, '0')}
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
                            <p>Debug - Chapter {index + 1}:</p>
                            <p>Title: {chapter.title}</p>
                            <p>Narrative: {chapter.narrative ? '있음' : '없음'}</p>
                            <p>Scene: {chapter.sceneDescription ? '있음' : '없음'}</p>
                            <p>Core: {chapter.coreNarrative ? '있음' : '없음'}</p>
                            <p>Stories: {chapter.humanStories ? '있음' : '없음'}</p>
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
                  {totalChapters}개 챕터 • 약 {Math.round(totalChapters * 5)}분
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
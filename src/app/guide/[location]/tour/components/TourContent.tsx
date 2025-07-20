'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowUp, Eye, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { GuideData, GuideChapter } from '@/types/guide';
import { getOrCreateChapterAudio } from '@/lib/tts-gcs';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLElement | null)[]>;
}

// 안전한 챕터 표시 컴포넌트
const SafeChapterDisplay = ({ chapter }: { chapter: GuideChapter }) => {
  if (!chapter || !chapter.title) {
    return <div className="text-gray-500">챕터 정보를 불러오는 중...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{chapter.title}</h3>
      {chapter.sceneDescription && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">장면 설명</h4>
          <p className="text-gray-600">{chapter.sceneDescription}</p>
        </div>
      )}
      {chapter.coreNarrative && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">핵심 내용</h4>
          <p className="text-gray-600">{chapter.coreNarrative}</p>
        </div>
      )}
      {chapter.humanStories && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">인물 이야기</h4>
          <p className="text-gray-600">{chapter.humanStories}</p>
        </div>
      )}
      {chapter.nextDirection && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">다음 방향</h4>
          <p className="text-gray-600">{chapter.nextDirection}</p>
        </div>
      )}
    </div>
  );
};

const MinimalTourContent = ({ guide, language, chapterRefs = { current: [] } }: TourContentProps) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalChapters = guide.realTimeGuide?.chapters?.length || 0;
  const currentChapter = guide.realTimeGuide?.chapters?.[currentChapterIndex];

  // 🔥 핵심 수정: 조건문 순서 변경
  // 1. 먼저 currentChapter가 null인지 체크
  if (!currentChapter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">챕터 데이터를 로드하는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 2. 그 다음에 필수 필드 체크
  if (!currentChapter.id || !currentChapter.title) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">챕터 데이터가 불완전합니다</h2>
          <p className="text-gray-600">필수 정보가 누락되었습니다.</p>
        </div>
      </div>
    );
  }

  // 안전한 필드 접근 (기본값 제공)
  const sceneDescription = currentChapter.sceneDescription || '';
  const coreNarrative = currentChapter.coreNarrative || '';
  const humanStories = currentChapter.humanStories || '';
  const nextDirection = currentChapter.nextDirection || '';

  // ===== 3. 데이터 구조 디버깅 추가 =====
  console.log('🔍 TourContent 데이터 구조:', {
    hasRealTimeGuide: !!guide.realTimeGuide,
    chaptersLength: guide.realTimeGuide?.chapters?.length,
    currentChapterIndex,
    currentChapter: {
      id: currentChapter.id,
      title: currentChapter.title,
      hasNarrative: !!currentChapter.narrative,
      hasSceneDescription: !!currentChapter.sceneDescription,
      hasCoreNarrative: !!currentChapter.coreNarrative,
      hasHumanStories: !!currentChapter.humanStories,
      hasNextDirection: !!currentChapter.nextDirection
    }
  });

  // ===== 2. 타입 안전성 확보 =====
  // currentChapter가 이제 GuideChapter 객체로 올바르게 인식됨
  const hasContent = currentChapter && (
    currentChapter.narrative ||
    currentChapter.sceneDescription ||
    currentChapter.coreNarrative ||
    currentChapter.humanStories
  );

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

  // 미니멀 텍스트 포맷팅 - 스크롤 친화적 읽기 경험
  const formatText = (text: string) => {
    if (!text) return '';
    
    // 연속된 줄바꿈(2개 이상)을 단락 구분으로 사용
    const paragraphs = text.split(/\n\s*\n/)
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => paragraph.trim().replace(/\n/g, ' '));
  
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-8 text-lg leading-relaxed font-light text-gray-700">
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

  return (
    <div className="min-h-screen bg-white">
      {/* 미니멀 헤더 섹션 - 기하학적 요소 없이 */}
      <div className="relative">
        {/* 클린한 헤더 배경 */}
        <div className="relative bg-white border-b border-gray-100">
          {/* 미니멀 타이틀 섹션 */}
          <div className="relative z-10 px-6 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              {/* 서브타이틀 */}
              <div className="mb-4">
                <span className="inline-block px-4 py-1 bg-gray-900 text-white text-xs font-medium tracking-widest uppercase rounded-full">
                  Real-time Guide
                </span>
              </div>
              
              {/* 메인 타이틀 */}
              <h1 className="text-4xl md:text-6xl font-light text-gray-900 tracking-tight mb-6">
                {guide.metadata?.originalLocationName || guide.overview?.title || '가이드'}
              </h1>
              
              {/* 서브 설명 */}
              <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                {guide.overview?.summary ? 
                  guide.overview.summary.length > 100 ? 
                    guide.overview.summary.substring(0, 100) + '...' : 
                    guide.overview.summary
                  : '오디오 가이드와 함께 특별한 여행을 시작해보세요'}
              </p>
            </div>
          </div>
        </div>

        {/* 미니멀 콘텐츠 영역 */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* 스크롤 기반 읽기 경험을 위한 간격 최적화 */}
          <div className="space-y-24">
            
            {/* 핵심 정보 미니멀 섹션 */}
            <section className="space-y-12">
              {/* 기본 개요 - 클린한 타이포그래피 */}
              {guide.overview && (
                <div className="border-l-2 border-gray-900 pl-8">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4">About</h2>
                      <p className="text-xl md:text-2xl font-light text-gray-900 leading-relaxed">
                        {guide.overview.summary || '이곳의 특별한 매력을 소개합니다.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 핵심 포인트 그리드 - 모노크롬 카드 */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* 하이라이트 */}
                <div className="group">
                  <div className="border border-gray-200 hover:border-gray-900 transition-all duration-300 p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 border border-gray-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <Eye className="w-4 h-4 text-gray-900" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium tracking-wide uppercase text-gray-900">주요 포인트</h3>
                        <ul className="space-y-3">
                          {guide.overview?.visitingTips?.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <span className="w-1 h-1 bg-gray-900 mt-3 flex-shrink-0"></span>
                              <span className="text-gray-700 leading-relaxed">{tip}</span>
                            </li>
                          )) || [
                            <li key="default1" className="flex items-start space-x-3">
                              <span className="w-1 h-1 bg-gray-900 mt-3 flex-shrink-0"></span>
                              <span className="text-gray-700 leading-relaxed">역사적 의미가 담긴 건축물과 장식</span>
                            </li>,
                            <li key="default2" className="flex items-start space-x-3">
                              <span className="w-1 h-1 bg-gray-900 mt-3 flex-shrink-0"></span>
                              <span className="text-gray-700 leading-relaxed">특별한 포토스팟과 전망대</span>
                            </li>,
                            <li key="default3" className="flex items-start space-x-3">
                              <span className="w-1 h-1 bg-gray-900 mt-3 flex-shrink-0"></span>
                              <span className="text-gray-700 leading-relaxed">현지 문화를 체험할 수 있는 공간</span>
                            </li>
                          ]}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 가이드라인 */}
                <div className="group">
                  <div className="border border-gray-200 hover:border-gray-900 transition-all duration-300 p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 border border-gray-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <AlertTriangle className="w-4 h-4 text-gray-900" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium tracking-wide uppercase text-gray-900">관람 가이드</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <span className="w-1 h-1 bg-gray-900 mt-3 flex-shrink-0"></span>
                            <span className="text-gray-700 leading-relaxed">조용한 관람 환경 유지</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="w-1 h-1 bg-gray-900 mt-3 flex-shrink-0"></span>
                            <span className="text-gray-700 leading-relaxed">문화재 보호에 협조</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <span className="w-1 h-1 bg-gray-900 mt-3 flex-shrink-0"></span>
                            <span className="text-gray-700 leading-relaxed">사진 촬영 규정 준수</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 방문 정보 - 미니멀 인포 바 */}
              {guide.overview?.visitInfo && (
                <div className="border-t border-gray-200 pt-12">
                  <div className="flex items-center space-x-4 mb-8">
                    <Clock className="w-5 h-5 text-gray-900" />
                    <h3 className="text-sm font-medium tracking-wide uppercase text-gray-900">방문 정보</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {guide.overview.visitInfo.duration && (
                      <div className="space-y-2">
                        <span className="text-xs tracking-wider uppercase text-gray-500">소요시간</span>
                        <p className="text-lg text-gray-900">{guide.overview.visitInfo.duration}</p>
                      </div>
                    )}
                    {guide.overview.visitInfo.difficulty && (
                      <div className="space-y-2">
                        <span className="text-xs tracking-wider uppercase text-gray-500">난이도</span>
                        <p className="text-lg text-gray-900">{guide.overview.visitInfo.difficulty}</p>
                      </div>
                    )}
                    {guide.overview.visitInfo.season && (
                      <div className="space-y-2">
                        <span className="text-xs tracking-wider uppercase text-gray-500">최적 계절</span>
                        <p className="text-lg text-gray-900">{guide.overview.visitInfo.season}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* 실시간 가이드 섹션 - 미니멀 스크롤 경험 */}
            <section className="space-y-16">
              {/* 섹션 헤더 */}
              <div className="text-center space-y-6">
                <div>
                  <span className="inline-block px-4 py-1 bg-gray-900 text-white text-xs font-medium tracking-widest uppercase rounded-full">
                    Audio Guide
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
                  실시간 가이드
                </h2>
                <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
                  총 {totalChapters}개의 챕터로 구성된 오디오 가이드를 통해<br />
                  특별한 여행을 경험해보세요
                </p>
              </div>

              {/* 챕터 리스트 - 스크롤 최적화 레이아웃 */}
              <div className="space-y-0">
                {guide.realTimeGuide?.chapters?.length ? (
                  guide.realTimeGuide.chapters.map((chap, index) => (
                  <article
                    key={index}
                    ref={(el) => {
                      if (chapterRefs.current) {
                        chapterRefs.current[index] = el;
                      }
                    }}
                    className={`group border-b border-gray-100 last:border-b-0 transition-all duration-500 ${
                      currentChapterIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    {/* 챕터 헤더 - 클린한 레이아웃 */}
                    <header 
                      className="py-12 cursor-pointer"
                      onClick={() => toggleChapter(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-6 flex-1">
                          {/* 챕터 번호 - 미니멀 원형 */}
                          <div className={`w-12 h-12 border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                            currentChapterIndex === index 
                              ? 'border-gray-900 bg-gray-900 text-white' 
                              : 'border-gray-300 text-gray-600 group-hover:border-gray-900'
                          }`}>
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <h3 className="text-xl md:text-2xl font-light text-gray-900 tracking-tight group-hover:text-black transition-colors">
                              {chap.title}
                            </h3>
                            {chap.nextDirection && (
                              <p className="text-gray-600 font-light leading-relaxed">
                                {chap.nextDirection}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          {/* 재생/정지 버튼 - 미니멀 원형 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPause(index);
                            }}
                            className={`w-14 h-14 border-2 flex items-center justify-center transition-all duration-300 hover:scale-105 ${
                              isPlaying && currentChapterIndex === index
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
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
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </header>
                    
                    {/* 챕터 내용 - 스크롤 친화적 텍스트 */}
                    {expandedChapters.includes(index) && (
                      <div className="pb-12 border-t border-gray-100">
                        <div className="pt-12 pl-8 md:pl-16">
                          <div className="max-w-3xl space-y-6">
                            <div className="text-gray-700 text-lg leading-relaxed font-light">
                              {chap.narrative ? 
                                formatText(chap.narrative) :
                                formatText([chap.sceneDescription, chap.coreNarrative, chap.humanStories]
                                  .filter(Boolean).join(' '))
                              }
                            </div>
                            
                            {/* 디버깅: 챕터 데이터 확인 */}
                            {process.env.NODE_ENV === 'development' && (
                              <div className="text-xs text-gray-400 bg-gray-50 p-4 rounded">
                                <p>Debug - Chapter {index + 1}:</p>
                                <p>Title: {chap.title}</p>
                                <p>Narrative: {chap.narrative ? '있음' : '없음'}</p>
                                <p>Scene: {chap.sceneDescription ? '있음' : '없음'}</p>
                                <p>Core: {chap.coreNarrative ? '있음' : '없음'}</p>
                                <p>Stories: {chap.humanStories ? '있음' : '없음'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-light text-gray-900">챕터를 찾을 수 없습니다</h3>
                      <p className="text-gray-600">가이드 데이터를 다시 생성해주세요.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 미니멀 스크롤 투 탑 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 flex items-center justify-center transition-all duration-300 z-50 shadow-sm hover:shadow-lg"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MinimalTourContent;
'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { GuideData } from '@/types/guide';
import { getOrCreateChapterAudio } from '@/lib/tts-gcs';

interface TourContentProps {
  guide: GuideData;
  language: string;
  chapterRefs?: MutableRefObject<(HTMLDivElement | null)[]>;
}

const MinimalTourContent = ({ guide, language, chapterRefs = { current: [] } }: TourContentProps) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalChapters = guide.realTimeGuide?.chapters?.length || 0;
  const chapter = guide.realTimeGuide?.chapters?.[currentChapter];

  // 콘텐츠가 있는지 확인
  const hasContent = chapter && (
    chapter.narrative ||
    chapter.sceneDescription ||
    chapter.coreNarrative ||
    chapter.humanStories
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

  // 가장 안전한 방법 - 원본 텍스트의 줄바꿈 구조 유지
  const formatText = (text: string) => {
    if (!text) return '';
    
    // 연속된 줄바꿈(2개 이상)을 단락 구분으로 사용
    const paragraphs = text.split(/\n\s*\n/)
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => paragraph.trim().replace(/\n/g, ' '));
  
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4" style={{ textIndent: '1em' }}>
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

  // 챕터 재생 함수
  const playChapter = (index: number) => {
    stopAndCleanupAudio();
    setCurrentChapter(index);
    handlePlayChapter();
  };

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    const handleJumpToChapter = (event: Event) => {
      const customEvent = event as CustomEvent<{ chapterId: number }>;
      const { chapterId } = customEvent.detail;
      
      setCurrentChapter(chapterId);
      stopAndCleanupAudio();
    };
    
    window.addEventListener('jumpToChapter', handleJumpToChapter as EventListener);
    return () => {
      window.removeEventListener('jumpToChapter', handleJumpToChapter as EventListener);
      stopAndCleanupAudio();
    };
  }, []);

  // TTS 재생 핸들러
  const handlePlayChapter = async () => {
    if (!chapter) return;

    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    if (currentAudio && !isPlaying) {
      currentAudio.play();
      setIsPlaying(true);
      return;
    }

    try {
      // 텍스트 합치기 (narrative 우선, 없으면 개별 필드들 합치기)
      let fullText = '';
      if (chapter.narrative) {
        fullText = chapter.narrative;
      } else {
        const parts = [
          chapter.sceneDescription || '',
          chapter.coreNarrative || '',
          chapter.humanStories || ''
        ].filter(Boolean);
        fullText = parts.join(' ');
      }

      if (chapter.nextDirection) {
        fullText += ' ' + chapter.nextDirection;
      }

      if (!fullText.trim()) {
        console.warn('재생할 텍스트가 없습니다.');
        return;
      }

      console.log('🎵 TTS 요청:', { chapterIndex: currentChapter, textLength: fullText.length });

      // 가이드 ID 생성 (메타데이터 활용)
      const guideId = guide.metadata?.originalLocationName || 'unknown';
      
      const audioUrl = await getOrCreateChapterAudio(
        guideId,
        currentChapter,
        fullText,
        language === 'ko' ? 'ko-KR' : 'en-US',
        1.2
      );

      console.log('✅ TTS 오디오 URL 받음:', audioUrl);

      const audio = new Audio(audioUrl);
      audio.onloadeddata = () => {
        console.log('🎵 오디오 로드 완료, 재생 시작');
        audio.play();
        setIsPlaying(true);
      };
      
      audio.onended = () => {
        console.log('🎵 오디오 재생 완료');
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = (e) => {
        console.error('❌ 오디오 재생 오류:', e);
        setIsPlaying(false);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      audioRef.current = audio;

    } catch (error) {
      console.error('❌ TTS 생성 오류:', error);
      setIsPlaying(false);
    }
  };

  // 이전/다음 챕터 핸들러
  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      stopAndCleanupAudio();
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < totalChapters - 1) {
      stopAndCleanupAudio();
      setCurrentChapter(currentChapter + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 - 좌우 여백 제거 */}
      <div className="w-full">
        {/* 메인 카드 - 추천관람순서 */}
        <div className="bg-white rounded-none md:rounded-2xl shadow-sm border-0 md:border border-gray-200 overflow-hidden">
          {/* 기하학적 헤더 */}
          <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
            {/* 기하학적 요소 */}
            <div className="absolute top-4 left-4">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }, (_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-1 rounded-full bg-gray-400 opacity-30"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      opacity: Math.random() > 0.7 ? 0.6 : 0.2 
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* 반원 요소 */}
            <div className="absolute bottom-0 right-8 w-24 h-24 bg-black rounded-full transform translate-y-1/2">
              <div className="absolute inset-2 bg-white rounded-full opacity-20"></div>
            </div>

            {/* 장소명 타이틀 - 중앙에 배치, 크기 30% 축소 */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 z-10">
              {guide.metadata?.originalLocationName || guide.overview?.title || '가이드'}
            </h2>
          </div>

          {/* 콘텐츠 영역 - 좌우 여백 반으로 축소 */}
          <div className="p-4 md:p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">추천관람순서</h3>
            
            <div className="space-y-3">
              {guide.realTimeGuide?.chapters?.map((chap, index) => (
                <div key={chap.id || index} className="bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  {/* 챕터 헤더 */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleChapter(index)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-left">{chap.title}</h4>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* 재생/일시정지 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playChapter(index);
                        }}
                        className="w-10 h-10 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                      >
                        {currentChapter === index && isPlaying ? 
                          <Pause className="w-4 h-4" /> : 
                          <Play className="w-4 h-4 ml-0.5" />
                        }
                      </button>
                      
                      {/* 확장/축소 화살표 */}
                      <div className="text-gray-400">
                        {expandedChapters.includes(index) ? 
                          <ChevronUp className="w-5 h-5" /> : 
                          <ChevronDown className="w-5 h-5" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* 챕터 내용 (확장시에만 표시) */}
                  {expandedChapters.includes(index) && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="mt-4 prose prose-sm max-w-none">
                        <div className="text-gray-700 leading-relaxed" style={{ fontSize: '0.7em', lineHeight: '1.6' }}>
                          {chap.narrative ? 
                            formatText(chap.narrative) :
                            formatText([chap.sceneDescription, chap.coreNarrative, chap.humanStories]
                              .filter(Boolean).join(' '))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 스크롤 투 탑 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MinimalTourContent;
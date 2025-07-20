'use client';

import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowUp, Eye, AlertTriangle, Clock, MapPin } from 'lucide-react';
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

  // 오디오 재생/정지
  const handlePlayPause = async (chapterIndex: number) => {
    const chap = guide.realTimeGuide?.chapters?.[chapterIndex];
    if (!chap) return;

    // 다른 챕터 재생 중이면 정지
    if (currentChapter !== chapterIndex) {
      stopAndCleanupAudio();
      setCurrentChapter(chapterIndex);
    }

    if (isPlaying && currentChapter === chapterIndex) {
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
      setCurrentChapter(chapterIndex);

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
      setCurrentChapter(index);
      
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="relative">
        <div className="relative bg-gradient-to-br from-gray-100 via-white to-gray-50 overflow-hidden">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-gray-300 rounded-full"
                  style={{
                    width: `${Math.random() * 100 + 50}px`,
                    height: `${Math.random() * 100 + 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() > 0.5 ? 0.6 : 0.2 
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
          {/* 개요 섹션 */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">개요</h3>
            
            {/* 기본 개요 */}
            {guide.overview && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">장소 소개</h4>
                    <p className="text-blue-800 leading-relaxed" style={{ fontSize: '15px' }}>
                      {guide.overview.summary || '이곳의 특별한 매력을 소개합니다.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* 꼭 봐야 하는 포인트 */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-start space-x-3">
                  <Eye className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-3">꼭 봐야 하는 포인트</h4>
                    <ul className="space-y-2">
                      {guide.overview?.visitingTips?.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-green-800 text-sm leading-relaxed">{tip}</span>
                        </li>
                      )) || [
                        <li key="default1" className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-green-800 text-sm leading-relaxed">역사적 의미가 담긴 건축물과 장식</span>
                        </li>,
                        <li key="default2" className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-green-800 text-sm leading-relaxed">특별한 포토스팟과 전망대</span>
                        </li>,
                        <li key="default3" className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-green-800 text-sm leading-relaxed">현지 문화를 체험할 수 있는 공간</span>
                        </li>
                      ]}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 주의사항 */}
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-3">관람 시 주의사항</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-orange-700 text-sm">흡연 및 음주 금지</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-orange-700 text-sm">큰 소리나 소음 자제</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-orange-700 text-sm">문화재 손상 금지</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 방문 정보 */}
            {guide.overview?.visitInfo && (
              <div className="bg-gray-50 rounded-xl p-6 mt-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">방문 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {guide.overview.visitInfo.duration && (
                        <div>
                          <span className="font-medium text-gray-700">소요시간: </span>
                          <span className="text-gray-600">{guide.overview.visitInfo.duration}</span>
                        </div>
                      )}
                      {guide.overview.visitInfo.difficulty && (
                        <div>
                          <span className="font-medium text-gray-700">난이도: </span>
                          <span className="text-gray-600">{guide.overview.visitInfo.difficulty}</span>
                        </div>
                      )}
                      {guide.overview.visitInfo.season && (
                        <div>
                          <span className="font-medium text-gray-700">최적 계절: </span>
                          <span className="text-gray-600">{guide.overview.visitInfo.season}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 실시간 가이드 섹션 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">실시간 가이드</h3>
              <p className="text-sm text-gray-600 mt-1">
                총 {totalChapters}개 챕터 • 각 챕터를 클릭하여 오디오 가이드를 들어보세요
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {guide.realTimeGuide?.chapters?.map((chap, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (chapterRefs.current) {
                      chapterRefs.current[index] = el;
                    }
                  }}
                  className={`transition-all duration-200 ${
                    currentChapter === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* 챕터 헤더 */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleChapter(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentChapter === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{chap.title}</h4>
                          {chap.nextDirection && (
                            <p className="text-sm text-gray-600 mt-1">{chap.nextDirection}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* 재생/정지 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause(index);
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isPlaying && currentChapter === index
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {isPlaying && currentChapter === index ? 
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
                  </div>
                  
                  {/* 챕터 내용 (확장시에만 표시) */}
                  {expandedChapters.includes(index) && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="mt-4 prose prose-sm max-w-none">
                        <div className="text-gray-700 leading-relaxed" style={{ fontSize: '15px', lineHeight: '1.6' }}>
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
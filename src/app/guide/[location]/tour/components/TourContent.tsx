'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, MapPin, Play, Pause, Volume2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { getBestOfficialPlace } from '@/lib/ai/officialData';

// 🔥 강력한 디버깅: 컴포넌트 로드 확인
console.log('🚀 TourContent 컴포넌트 파일 로드됨!');

interface Chapter {
  id: number;
  title: string;
  sceneDescription: string;
  narrativeLayers: {
    coreNarrative: string;
    architectureDeepDive: string;
    humanStories: string;
    sensoryBehindTheScenes: string;
  };
  nextDirection?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface TourData {
  content: {
    overview: {
      title: string;
      description: string;
    };
    realTimeGuide: {
      chapters: Chapter[];
      totalDuration: number;
      chapterCount: number;
    };
    personalizedNote?: string;
  };
  metadata: {
    originalLocationName: string;
  };
}

interface TourContentProps {
  locationName: string;
  userProfile?: any;
  offlineData?: any;
}

const MapWithRoute = dynamic(() => import('@/components/guide/MapWithRoute'), { ssr: false });

export default function TourContent({ locationName, userProfile, offlineData }: TourContentProps) {
  // 🔥 강력한 디버깅: 컴포넌트 시작
  console.log('🎬 TourContent 컴포넌트 렌더링 시작!', { locationName, userProfile });
  
  const [tourData, setTourData] = useState<TourData | null>(offlineData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [officialPlace, setOfficialPlace] = useState<any>(null);
  
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getCacheKey = () => {
    // locationName + userProfile(문자열화) 조합으로 고유 키 생성
    const profileStr = userProfile ? JSON.stringify(userProfile) : '';
    return `guide-cache:${locationName}:${profileStr}`;
  };

  const loadTourData = async (forceRegenerate = false) => {
    console.log('🚀 loadTourData 함수 시작!', { locationName });
    setIsLoading(true);
    setError(null);
    const cacheKey = getCacheKey();
    if (!forceRegenerate) {
      // 1. localStorage 캐시 우선 조회
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setTourData(parsed);
          setIsLoading(false);
          console.log('✅ localStorage 캐시 사용');
          return;
        }
      } catch (e) {
        console.warn('❌ localStorage 캐시 파싱 실패', e);
      }
    }
    try {
      const defaultProfile = {
        interests: ['문화', '역사'],
        knowledgeLevel: '중급',
        ageGroup: '30대',
        preferredStyle: '친근함',
        ...userProfile
      };
      const response = await fetch('/api/ai/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName,
          userProfile: defaultProfile,
          forceRegenerate
        })
      });
      const result = await response.json();
      if (result.success && result.data?.content?.realTimeGuide?.chapters?.length > 0) {
        setTourData(result.data);
        // 2. localStorage에 캐시 저장
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result.data));
        } catch (e) {
          console.warn('❌ localStorage 캐시 저장 실패', e);
        }
      } else {
        setError(result.error || '실시간 가이드 생성에 실패했습니다.');
      }
    } catch (error) {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (offlineData) {
      setTourData(offlineData);
      setIsLoading(false);
      return;
    }
    if (locationName) {
      loadTourData(false); // 기본은 캐시 우선
    }
  }, [locationName, offlineData]);

  useEffect(() => {
    // 공식 데이터셋에서 명소 좌표/POI 조회
    getBestOfficialPlace(locationName).then(setOfficialPlace).catch(() => setOfficialPlace(null));
  }, [locationName]);

  // 스크롤 위치에 따라 활성 챕터 업데이트
  useEffect(() => {
    const handleScroll = () => {
      if (!chapterRefs.current.length) return;

      const scrollPosition = window.scrollY + 200; // 헤더 높이 고려
      
      for (let i = chapterRefs.current.length - 1; i >= 0; i--) {
        const element = chapterRefs.current[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveChapter(i);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tourData]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadTourData(true); // 강제 재생성
    setIsRetrying(false);
  };

  const scrollToChapter = (index: number) => {
    const element = chapterRefs.current[index];
    if (element) {
      const headerHeight = 120; // 헤더 높이
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // 실제 오디오 재생 기능은 별도 구현
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            실시간 가이드 준비 중...
          </h2>
          <p className="text-gray-600">
            {locationName}의 특별한 이야기를 생성하고 있습니다
          </p>
        </div>
      </div>
    );
  }

  if (error || !tourData?.content?.realTimeGuide?.chapters?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            실시간 가이드를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            {error || '콘텐츠가 없습니다. 다시 시도해주세요.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
            >
              {isRetrying ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  다시 생성 중...
                </div>
              ) : (
                '다시 시도'
              )}
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chapters = tourData.content.realTimeGuide.chapters;
  const totalChapters = chapters.length;

  // 디버깅 로그
  console.log('🎬 렌더링 상태:', {
    isLoading,
    error,
    tourData: !!tourData,
    chaptersLength: chapters?.length,
    locationName
  });
  // 지도 마커 디버깅: 각 챕터의 좌표값 확인
  console.log('지도 마커 디버깅:', chapters.map(c => ({ title: c.title, lat: c.lat, lng: c.lng, latitude: c.latitude, longitude: c.longitude, coordinates: c.coordinates })));

  // 시작 위치 정보를 파싱하는 함수
  const parseStartDirection = (direction: string) => {
    const startMatch = direction.match(/📍 시작 위치: (.*?)\n/);
    const confirmMatch = direction.match(/🎯 도착 확인: (.*?)\n/);
    const guideMatch = direction.match(/▶️ 가이드 시작: (.*)/);
    
    if (startMatch && confirmMatch && guideMatch) {
      return {
        isStart: true,
        start: startMatch[1],
        confirm: confirmMatch[1],
        guide: guideMatch[1]
      };
    }
    return { isStart: false, fullText: direction };
  };

  // 텍스트에 자동 줄바꿈을 추가하는 함수
  const addLineBreaks = (text: string | undefined | null) => {
    if (!text) return '';
    
    // 1. AI가 생성한 \\n (백슬래시 두 개 + n)을 실제 줄바꿈으로 변환
    let processedText = text.replace(/\\n/g, '\n');
    
    // 2. 이미 실제 줄바꿈(\n)이 있으면 그대로 반환
    if (processedText.includes('\n')) {
      return processedText;
    }
    
    // 3. 줄바꿈이 없는 경우에만 자동 줄바꿈 추가
    // 문장 단위로 분리 (. ! ? 뒤에 공백이 있는 경우)
    return processedText
      .replace(/([.!?])\s+/g, '$1\n')
      .replace(/([.!?])$/g, '$1')
      .trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* 지도/동선 표시 (최상단) */}
      <main className="px-4 py-6 max-w-4xl mx-auto">
        <MapWithRoute
          chapters={chapters.map((c, i) => ({
            id: c.id,
            title: c.title,
            lat: i === 0 && officialPlace?.geometry?.location?.lat ? officialPlace.geometry.location.lat : (c.lat || c.latitude || c.coordinates?.lat || c.coordinates?.latitude),
            lng: i === 0 && officialPlace?.geometry?.location?.lng ? officialPlace.geometry.location.lng : (c.lng || c.longitude || c.coordinates?.lng || c.coordinates?.longitude)
          }))}
          activeChapter={activeChapter}
          onMarkerClick={scrollToChapter}
        />

        {/* 오디오 컨트롤 (고정) */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-8 sticky top-24 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {chapters[activeChapter]?.title || '실시간 가이드'}
                </h3>
                <p className="text-sm text-gray-500">
                  {activeChapter + 1} / {totalChapters} 챕터
                </p>
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* 전체 챕터 내용 */}
        <div className="space-y-12">
          {chapters.map((chapter, index) => {
            const isLastChapter = index === totalChapters - 1;
            const directionInfo = chapter.nextDirection ? parseStartDirection(chapter.nextDirection) : null;
            
            // 🔍 디버깅: narrativeLayers 상태 확인
            console.log(`🎬 챕터 ${index + 1} 렌더링:`, {
              title: chapter.title,
              hasNarrativeLayers: !!chapter.narrativeLayers,
              narrativeLayersKeys: chapter.narrativeLayers ? Object.keys(chapter.narrativeLayers) : 'null',
              coreNarrative: chapter.narrativeLayers?.coreNarrative ? 'exists' : 'missing',
              architectureDeepDive: chapter.narrativeLayers?.architectureDeepDive ? 'exists' : 'missing',
              humanStories: chapter.narrativeLayers?.humanStories ? 'exists' : 'missing',
              sensoryBehindTheScenes: chapter.narrativeLayers?.sensoryBehindTheScenes ? 'exists' : 'missing'
            });
            
            return (
              <div key={index} ref={el => {
                if (el) {
                  chapterRefs.current[index] = el;
                } else {
                  delete chapterRefs.current[index];
                }
              }}>
                {/* 챕터 콘텐츠 */}
                <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${activeChapter === index ? 'ring-2 ring-indigo-500 scale-102' : 'shadow-md'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-indigo-500 bg-indigo-100 px-3 py-1 rounded-full">
                      챕터 {index + 1}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />약 5분
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{chapter.title}</h3>
                  
                  {/* 장면 묘사 */}
                  {chapter.sceneDescription && (
                    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🎬 현재 장면</h4>
                      <p className="text-blue-800 leading-relaxed whitespace-pre-line">{addLineBreaks(chapter.sceneDescription)}</p>
                    </div>
                  )}
                  
                  {/* 🔍 디버깅: narrativeLayers 상태 표시 */}
                  {!chapter.narrativeLayers && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                      <h4 className="font-semibold text-red-900 mb-2">❌ 디버깅: narrativeLayers 없음</h4>
                      <p className="text-red-800">이 챕터에는 narrativeLayers가 없습니다.</p>
                    </div>
                  )}
                  
                  {/* 다층 컨텐츠 */}
                  {chapter.narrativeLayers && (
                    <div className="space-y-6">
                      {/* 🔍 디버깅: narrativeLayers 존재 확인 */}
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <h5 className="text-xs font-bold text-gray-600 mb-1">🔍 디버깅 정보</h5>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>narrativeLayers 키: {Object.keys(chapter.narrativeLayers).join(', ')}</div>
                          <div>coreNarrative: {chapter.narrativeLayers.coreNarrative ? `${chapter.narrativeLayers.coreNarrative.length}자` : '없음'}</div>
                          <div>architectureDeepDive: {chapter.narrativeLayers.architectureDeepDive ? `${chapter.narrativeLayers.architectureDeepDive.length}자` : '없음'}</div>
                          <div>humanStories: {chapter.narrativeLayers.humanStories ? `${chapter.narrativeLayers.humanStories.length}자` : '없음'}</div>
                          <div>sensoryBehindTheScenes: {chapter.narrativeLayers.sensoryBehindTheScenes ? `${chapter.narrativeLayers.sensoryBehindTheScenes.length}자` : '없음'}</div>
                        </div>
                      </div>
                      
                      {/* 핵심 서사 */}
                      {chapter.narrativeLayers.coreNarrative && (
                        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                          <h4 className="font-semibold text-green-900 mb-2">📚 핵심 이야기</h4>
                          <p className="text-green-800 leading-relaxed whitespace-pre-line">{addLineBreaks(chapter.narrativeLayers.coreNarrative)}</p>
                        </div>
                      )}
                      
                      {/* 건축 심층 분석 */}
                      {chapter.narrativeLayers.architectureDeepDive && (
                        <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                          <h4 className="font-semibold text-purple-900 mb-2">🏛️ 건축 분석</h4>
                          <p className="text-purple-800 leading-relaxed whitespace-pre-line">{addLineBreaks(chapter.narrativeLayers.architectureDeepDive)}</p>
                        </div>
                      )}
                      
                      {/* 인물 이야기 */}
                      {chapter.narrativeLayers.humanStories && (
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                          <h4 className="font-semibold text-orange-900 mb-2">👥 인물 이야기</h4>
                          <p className="text-orange-800 leading-relaxed whitespace-pre-line">{addLineBreaks(chapter.narrativeLayers.humanStories)}</p>
                        </div>
                      )}
                      
                      {/* 감각적 묘사 */}
                      {chapter.narrativeLayers.sensoryBehindTheScenes && (
                        <div className="p-4 bg-rose-50 border-l-4 border-rose-400 rounded-r-lg">
                          <h4 className="font-semibold text-rose-900 mb-2">🌟 오감 체험</h4>
                          <p className="text-rose-800 leading-relaxed whitespace-pre-line">{addLineBreaks(chapter.narrativeLayers.sensoryBehindTheScenes)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 다음 장소 이동 안내 */}
                {!isLastChapter && chapter.nextDirection && (
                  <div className="my-8 text-center">
                    <div className="inline-block relative">
                      <div className="h-16 w-0.5 bg-gray-300 absolute left-1/2 top-[-4rem]" />
                      <div className="h-16 w-0.5 bg-gray-300 absolute left-1/2 bottom-[-4rem]" />
                      <div className="bg-white border border-gray-200 rounded-full p-4 shadow-sm">
                        <MapPin className="w-6 h-6 text-indigo-500" />
                      </div>
                    </div>
                    
                    {directionInfo?.isStart ? (
                      <div className="mt-4 max-w-lg mx-auto bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-left">
                        <h4 className="font-bold text-amber-800 mb-2">투어 시작점 안내</h4>
                        <div className="space-y-2 text-sm text-amber-700">
                          <p><strong className="font-semibold">📍 시작 위치:</strong> {directionInfo.start}</p>
                          <p><strong className="font-semibold">🎯 도착 확인:</strong> {directionInfo.confirm}</p>
                          <p><strong className="font-semibold">▶️ 가이드 시작:</strong> {directionInfo.guide}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-gray-600 whitespace-pre-line">{addLineBreaks(directionInfo?.fullText || '')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 개인화된 메시지 */}
        {tourData.content.personalizedNote && (
          <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-4 text-lg">💝 특별한 메시지</h4>
            <p className="text-indigo-800 leading-relaxed text-lg whitespace-pre-line">
              {tourData.content.personalizedNote}
            </p>
          </div>
        )}

        {/* 투어 완료 섹션 */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            투어 완료!
          </h3>
          <p className="text-gray-600 mb-6">
            {tourData.metadata.originalLocationName}의 특별한 이야기와 함께 해주셔서 감사합니다.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-lg font-medium"
            >
              다른 명소 탐험하기
            </button>
            <div className="text-sm text-gray-500">
              이 가이드가 도움이 되셨나요? 다른 명소도 함께 탐험해보세요!
            </div>
          </div>
        </div>

        {/* 다운로드 버튼 섹션 */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => {
              if (!tourData) return;
              const guides = JSON.parse(localStorage.getItem('myGuides') || '[]');
              const exists = guides.some((g: any) => g.metadata?.originalLocationName === tourData.metadata.originalLocationName);
              if (exists) {
                alert('이미 오프라인에 저장된 가이드입니다.');
                return;
              }
              guides.push({ ...tourData, savedAt: new Date().toISOString() });
              localStorage.setItem('myGuides', JSON.stringify(guides));
              alert('오프라인 가이드함에 저장되었습니다!\n마이페이지 > 가이드함에서 언제든 열람할 수 있습니다.');
            }}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            aria-label="오프라인 저장"
          >
            💾 오프라인 저장
          </button>
        </div>
      </main>

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
}

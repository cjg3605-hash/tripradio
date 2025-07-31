'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, 
  Headphones, 
  ArrowLeft,
  Share2,
  RotateCcw,
  Compass,
  Home,
  ArrowUp
} from 'lucide-react';
import LiveLocationTracker from '@/components/location/LiveLocationTracker';
import SimpleAudioPlayer from '@/components/audio/SimpleAudioPlayer';
import ChapterAudioPlayer from '@/components/audio/ChapterAudioPlayer';
import MapWithRoute from '@/components/guide/MapWithRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { AudioChapter } from '@/types/audio';
import { enhanceGuideCoordinates } from '@/lib/coordinates/guide-coordinate-enhancer';

interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius?: number;
  description?: string;
  audioChapter?: AudioChapter;
}

const LiveTourPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { currentLanguage, t } = useLanguage();
  
  const locationName = typeof params.location === 'string' 
    ? decodeURIComponent(params.location) 
    : decodeURIComponent(String(params.location));
  
  console.log('🔍 URL 파라미터 디버그:', {
    rawParam: params.location,
    decodedLocationName: locationName
  });
  
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 }); // Default to Seoul
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  
  // POI와 챕터 상태 관리
  const [poisWithChapters, setPoisWithChapters] = useState<POI[]>([]);
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false);
  const [poisError, setPoisError] = useState<string | null>(null);




  // 직접 DB에서 가이드 데이터 로딩
  useEffect(() => {
    const loadGuideDataDirectly = async () => {
      setIsLoadingPOIs(true);
      setPoisError(null);
      
      try {
        console.log('🔍 직접 DB 조회 시작:', locationName);
        
        // 먼저 전역 데이터 확인 (빠른 경로)
        const globalGuideData = (window as any).currentGuideData;
        if (globalGuideData) {
          console.log('📦 전역 데이터 사용');
          await processGuideData(globalGuideData);
          return;
        }
        
        // DB에서 직접 조회 (안전한 경로)
        const { supabase } = await import('@/lib/supabaseClient');
        const normalizedLocation = locationName.trim().toLowerCase().replace(/\s+/g, ' ');
        
        const { data, error } = await supabase
          .from('guides')
          .select('content')
          .eq('locationname', normalizedLocation)
          .eq('language', 'ko')
          .maybeSingle();
        
        if (error) {
          console.error('DB 조회 오류:', error);
          setPoisError('가이드 데이터 조회 실패');
          return;
        }
        
        if (data?.content) {
          console.log('🗄️ DB에서 데이터 로드 성공');
          await processGuideData(data.content);
        } else {
          setPoisError('해당 위치의 가이드 데이터가 없습니다');
        }
        
      } catch (error) {
        console.error('가이드 데이터 로딩 실패:', error);
        setPoisError('데이터 로딩 중 오류가 발생했습니다');
      } finally {
        setIsLoadingPOIs(false);
      }
    };
    
    const processGuideData = async (guideData: any) => {
      const personalities = ['agreeableness', 'openness', 'conscientiousness'];
      const pois: POI[] = [];

      // 다양한 데이터 구조에서 챕터 찾기
      let chapters: any[] = [];
      
      if (guideData.realTimeGuide?.chapters) {
        chapters = guideData.realTimeGuide.chapters;
      } else if (guideData.realTimeGuide && Array.isArray(guideData.realTimeGuide)) {
        chapters = guideData.realTimeGuide;
      } else if (guideData.chapters) {
        chapters = guideData.chapters;
      }

      console.log(`🔍 찾은 챕터: ${chapters.length}개`);

      // 🎯 새로운 AI 자가검증 시스템으로 좌표 정확도 향상
      try {
        console.log('🎯 AI 자가검증 시스템으로 좌표 보정 시작...');
        
        // GuideData 형식으로 변환
        const guideDataForEnhancement = {
          overview: {
            title: locationName,
            description: '',
            totalDuration: '',
            highlights: [],
            keyFacts: []
          },
          route: {
            description: '',
            estimatedTime: '',
            steps: []
          },
          metadata: {
            createdAt: new Date(),
            lastUpdated: new Date(),
            version: '1.0',
            originalLocationName: locationName
          },
          realTimeGuide: {
            chapters: chapters
          }
        };

        // AI 자가검증 기반 좌표 보정 수행
        const { enhancedGuide, result } = await enhanceGuideCoordinates(
          guideDataForEnhancement,
          locationName,
          'ko'
        );

        if (result.success) {
          console.log(`✅ 좌표 보정 완료: ${result.enhancedCount}/${result.originalCount} 챕터`);
          
          // 개발환경에서 상세 결과 출력
          if (process.env.NODE_ENV === 'development' && result.chapter0Validation) {
            console.log(`🎯 챕터 0 자가검증 결과:
   - 정확도: ${result.chapter0Validation.isAccurate ? '✅ 승인' : '❌ 부정확'}
   - 신뢰도: ${Math.round(result.chapter0Validation.confidence * 100)}%
   - 거리: ${Math.round(result.chapter0Validation.distanceFromTarget)}m`);
          }
          
          // 보정된 챕터 사용
          chapters = enhancedGuide.realTimeGuide?.chapters || chapters;
        } else {
          console.warn('⚠️ 좌표 보정 실패, 원본 좌표 사용');
        }
      } catch (error) {
        console.error('❌ 좌표 보정 오류:', error);
        console.log('📍 원본 좌표로 계속 진행');
      }

      // POI 생성
      chapters.forEach((chapter: any, index: number) => {
        // 좌표 추출
        let lat: number | undefined, lng: number | undefined;
        
        if (chapter.coordinates?.lat && chapter.coordinates?.lng) {
          lat = parseFloat(chapter.coordinates.lat);
          lng = parseFloat(chapter.coordinates.lng);
        } else if (chapter.lat && chapter.lng) {
          lat = parseFloat(chapter.lat);
          lng = parseFloat(chapter.lng);
        }

        // 유효한 좌표가 있는 경우 POI 생성
        if (lat && lng && !isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // POI 생성
          const poi: POI = {
            id: `poi_${index}`,
            name: chapter.title || `스팟 ${index + 1}`,
            lat,
            lng,
            radius: 50, // 오디오 가이드 반경 50m
            description: chapter.narrative || chapter.description || '',
            audioChapter: chapter.audioUrl ? {
              id: index,
              title: chapter.title || `챕터 ${index + 1}`,
              audioUrl: chapter.audioUrl,
              duration: chapter.duration || 120,
              text: chapter.narrative || chapter.description || chapter.title || ''
            } : undefined
          };
          
          pois.push(poi);
          console.log(`✅ POI 생성: ${chapter.title || `챕터 ${index + 1}`} (${lat}, ${lng})`);
        } else {
          console.warn(`⚠️ 챕터 ${index + 1} 좌표 무효:`, { title: chapter.title, lat, lng });
        }
      });

      if (pois.length > 0) {
        console.log(`✅ ${pois.length}개 유효한 POI 생성 완료`);
        setPoisWithChapters(pois);
      } else {
        setPoisError('유효한 좌표를 가진 챕터가 없습니다');
      }
    };

    loadGuideDataDirectly();
  }, [locationName]);

  const audioChapters: AudioChapter[] = poisWithChapters
    .filter(poi => poi.audioChapter)
    .map(poi => poi.audioChapter!);

  // Handle location updates from tracker
  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    setMapCenter(location);
  };

  // Handle POI reached events
  const handlePOIReached = (poiId: string, poiName: string) => {
    const poiIndex = poisWithChapters.findIndex(poi => poi.id === poiId);
    if (poiIndex !== -1 && audioChapters[poiIndex]) {
      setCurrentChapter(poiIndex);
      // Show notification or modal for new chapter
      console.log(`Reached ${poiName}, playing chapter ${poiIndex + 1}`);
    }
  };

  // Handle chapter updates from audio player
  const handleChapterUpdate = (poiId: string, updatedChapter: AudioChapter) => {
    setPoisWithChapters(prev => 
      prev.map(poi => 
        poi.id === poiId 
          ? { ...poi, audioChapter: updatedChapter }
          : poi
      )
    );
  };

  // Handle chapter changes from audio player
  const handleChapterChange = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    
    // Center map on the corresponding POI
    if (poisWithChapters[chapterIndex]) {
      setMapCenter({
        lat: poisWithChapters[chapterIndex].lat,
        lng: poisWithChapters[chapterIndex].lng
      });
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Share current location
  const handleShare = async () => {
    if (navigator.share && currentLocation) {
      try {
        await navigator.share({
          title: String(t('live.shareTitle')),
          text: String(t('live.shareText')),
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  // Reset tour
  const handleReset = () => {
    setCurrentChapter(0);
    if (poisWithChapters[0]) {
      setMapCenter({
        lat: poisWithChapters[0].lat,
        lng: poisWithChapters[0].lng
      });
    }
  };

  // Get current POI info
  const currentPOI = poisWithChapters[currentChapter];

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setCurrentScrollY(scrolled);
      const shouldShow = scrolled > 300;
      console.log('스크롤 이벤트:', { scrolled, shouldShow, currentState: showScrollButtons });
      setShowScrollButtons(shouldShow);
    };

    console.log('스크롤 리스너 등록');
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 상태 확인
    
    return () => {
      console.log('스크롤 리스너 해제');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // 빈 의존성 배열로 변경 - 스크롤 이벤트 리스너는 초기 한 번만 등록

  // 스크롤 투 탑 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 홈으로 이동 함수
  const goToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">{/* 내부 헤더 삭제됨 */}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            {params.location} {t('guide.realTimeGuideTitle')}
          </h1>
          <p className="text-gray-500">
            현재 위치 기반 맞춤 안내
          </p>
        </div>

        {/* 개요 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">{t('guide.overview')}</h2>
          <p className="text-gray-600 leading-relaxed">
            GPS를 기반으로 현재 위치에서 가장 적합한 관람 코스를 실시간으로 안내합니다. 
            각 지점에 도착하면 자동으로 해당 위치의 상세 정보와 오디오 가이드가 제공됩니다.
          </p>
        </div>

        {/* 필수관람포인트 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('guide.mustSeePoints')}</h2>
          
          {/* 로딩 상태 */}
          {isLoadingPOIs && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
              <span className="text-gray-600">📍 {locationName}의 관광지 정보를 검색하고 있습니다...</span>
            </div>
          )}
          
          {/* 에러 상태 */}
          {poisError && !isLoadingPOIs && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-800 font-medium">위치 정보 로딩 실패</div>
              <div className="text-red-600 text-sm mt-1">{poisError}</div>
            </div>
          )}
          
          {/* POI 목록 */}
          {!isLoadingPOIs && poisWithChapters.length === 0 && !poisError && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">📍</div>
              <div>검색된 관광지가 없습니다</div>
              <div className="text-sm mt-1">다른 위치를 검색해보세요</div>
            </div>
          )}
          
          <div className="space-y-6">
            {poisWithChapters.map((poi, index) => (
              <div key={poi.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{poi.name}</h3>
                    <p className="text-sm text-gray-600">{poi.description}</p>
                  </div>
                </div>
                
                {/* 해당 챕터의 오디오 플레이어 */}
                {poi.audioChapter && (showMap || showAudioPlayer) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{t('guide.audioGuide')}</span>
                    </div>
                    <ChapterAudioPlayer
                      chapter={poi.audioChapter}
                      className="w-full"
                      onChapterUpdate={(updatedChapter) => handleChapterUpdate(poi.id, updatedChapter)}
                      locationName={locationName}
                      guideId={`guide_${locationName}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 주의사항 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('guide.precautions')}</h2>
          <div className="space-y-2 text-gray-600">
            <p>• {t('guide.precaution1')}</p>
            <p>• {t('guide.precaution2')}</p>
            <p>• {t('guide.precaution3')}</p>
            <p>• {t('guide.precaution4')}</p>
          </div>
        </div>

        {/* 관람순서 */}
        <div className="pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('guide.viewingOrder')}</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  1
                </div>
                <p className="text-gray-700">{t('guide.step1')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  2
                </div>
                <p className="text-gray-700">{t('guide.step2')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  3
                </div>
                <p className="text-gray-700">{t('guide.step3')}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  4
                </div>
                <p className="text-gray-700">{t('guide.step4')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="text-center pt-4">
          <button
            onClick={() => {
              // 실제 실시간 가이드 기능 시작
              setShowMap(true);
              setShowAudioPlayer(true);
            }}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
{t('guide.startRealtimeGuide')}
          </button>
        </div>

        {/* Location Tracker (시작 후에만 표시) */}
        {(showMap || showAudioPlayer) && (
          <div className="mt-8">
            <LiveLocationTracker
              pois={poisWithChapters}
              onLocationUpdate={handleLocationUpdate}
              onPOIReached={handlePOIReached}
              showStats={false}
              showProgress={true}
              className="w-full"
            />
          </div>
        )}

        {/* Map (시작 후에만 표시) */}
        {showMap && (
          <div className="h-96 bg-white border border-gray-100 rounded-lg overflow-hidden">
            <MapWithRoute
              pois={poisWithChapters.map(poi => ({
                id: poi.id,
                name: poi.name,
                lat: poi.lat,
                lng: poi.lng,
                description: poi.description || ''
              }))}
              currentLocation={currentLocation}
              center={mapCenter}
              zoom={15}
              showRoute={true}
              showUserLocation={true}
              onPoiClick={(poiId) => {
                const poiIndex = poisWithChapters.findIndex(poi => poi.id === poiId);
                if (poiIndex !== -1) {
                  setCurrentChapter(poiIndex);
                }
              }}
              className="w-full h-full"
              locationName={locationName}
            />
          </div>
        )}

        {/* 디버깅용 추가 콘텐츠 - 스크롤 테스트를 위한 높이 확보 */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">스크롤 테스트용 콘텐츠</h3>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-700">
                스크롤 테스트를 위한 콘텐츠 #{i + 1}. 이 콘텐츠는 페이지의 높이를 늘려서 스크롤이 가능하도록 합니다.
                300px 이상 스크롤하면 하단에 네비게이션 버튼이 나타나야 합니다.
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* 스크롤 네비게이션 버튼들 */}
      {/* 항상 보이는 테스트 버튼 (임시) */}
      <div className="fixed bottom-20 left-6 right-6 flex justify-between items-center z-50">
        <button
          onClick={goToHome}
          className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
          aria-label="테스트 홈 버튼"
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center"
          aria-label="테스트 스크롤 버튼"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* 조건부 스크롤 버튼들 */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none z-50">
        {/* 홈 버튼 (왼쪽 하단) */}
        <button
          onClick={goToHome}
          className={`w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 hover:scale-110 transition-all duration-300 pointer-events-auto flex items-center justify-center ${
            showScrollButtons 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="홈으로 이동"
        >
          <Home className="w-6 h-6" />
        </button>

        {/* 스크롤 투 탑 버튼 (오른쪽 하단) */}
        <button
          onClick={scrollToTop}
          className={`w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 hover:scale-110 transition-all duration-300 pointer-events-auto flex items-center justify-center ${
            showScrollButtons 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="맨 위로 스크롤"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>

      {/* 강화된 디버깅 정보 */}
      <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded text-xs z-50 max-w-xs">
        <div>showScrollButtons: {showScrollButtons.toString()}</div>
        <div>currentScrollY: {currentScrollY}</div>
        <div>scrollY &gt; 300: {(currentScrollY > 300).toString()}</div>
        <div>Buttons should show: {showScrollButtons ? 'YES' : 'NO'}</div>
        <div>Page height: {typeof window !== 'undefined' && document ? document.body.scrollHeight : 'N/A'}</div>
      </div>
    </div>
  );
};

export default LiveTourPage;
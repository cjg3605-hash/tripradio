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
  
  const locationName = typeof params.location === 'string' ? params.location : String(params.location);
  
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 }); // Default to Seoul
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [currentScrollY, setCurrentScrollY] = useState(0);

  // Sample POIs - In real implementation, this would come from the guide data
  const [pois] = useState<POI[]>([
    {
      id: 'poi_1',
      name: '경복궁 정문',
      lat: 37.5796,
      lng: 126.9770,
      radius: 50,
      description: '조선왕조의 정궁인 경복궁의 정문입니다.',
      audioChapter: {
        id: 1,
        title: '경복궁 정문의 역사',
        text: '경복궁은 1395년 조선왕조의 정궁으로 창건되었습니다...',
        duration: 180
      }
    },
    {
      id: 'poi_2',
      name: '광화문 광장',
      lat: 37.5759,
      lng: 126.9768,
      radius: 100,
      description: '한국의 역사와 문화를 상징하는 광장입니다.',
      audioChapter: {
        id: 2,
        title: '광화문 광장의 의미',
        text: '이 광장은 세종대왕과 이순신 장군의 동상이 있는 곳입니다...',
        duration: 150
      }
    },
    {
      id: 'poi_3',
      name: '청와대 앞',
      lat: 37.5867,
      lng: 126.9748,
      radius: 30,
      description: '대한민국 대통령 관저였던 청와대입니다.',
      audioChapter: {
        id: 3,
        title: '청와대의 변천사',
        text: '청와대는 1948년부터 2022년까지 대통령 관저로 사용되었습니다...',
        duration: 200
      }
    }
  ]);

  const audioChapters: AudioChapter[] = pois
    .filter(poi => poi.audioChapter)
    .map(poi => poi.audioChapter!);

  // Handle location updates from tracker
  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    setMapCenter(location);
  };

  // Handle POI reached events
  const handlePOIReached = (poiId: string, poiName: string) => {
    const poiIndex = pois.findIndex(poi => poi.id === poiId);
    if (poiIndex !== -1 && audioChapters[poiIndex]) {
      setCurrentChapter(poiIndex);
      // Show notification or modal for new chapter
      console.log(`Reached ${poiName}, playing chapter ${poiIndex + 1}`);
    }
  };

  // Handle chapter changes from audio player
  const handleChapterChange = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    
    // Center map on the corresponding POI
    if (pois[chapterIndex]) {
      setMapCenter({
        lat: pois[chapterIndex].lat,
        lng: pois[chapterIndex].lng
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
          title: t('live.shareTitle'),
          text: t('live.shareText'),
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
    if (pois[0]) {
      setMapCenter({
        lat: pois[0].lat,
        lng: pois[0].lng
      });
    }
  };

  // Get current POI info
  const currentPOI = pois[currentChapter];

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
  }, []);

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
          <div className="space-y-6">
            {pois.map((poi, index) => (
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
            <p>• GPS 신호가 약한 지역에서는 위치 정확도가 떨어질 수 있습니다</p>
            <p>• 이어폰 착용을 권장하며, 주변 상황을 주의깊게 살펴보세요</p>
            <p>• 배터리 소모가 많으니 보조배터리를 준비하시기 바랍니다</p>
            <p>• 실내나 지하에서는 GPS 기능이 제한될 수 있습니다</p>
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
                <p className="text-gray-700">위치 권한 허용 및 GPS 활성화</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  2
                </div>
                <p className="text-gray-700">시작점으로 이동하여 투어 시작</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  3
                </div>
                <p className="text-gray-700">각 지점 도착 시 자동 오디오 가이드 재생</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black text-white text-sm rounded-full flex items-center justify-center">
                  4
                </div>
                <p className="text-gray-700">제안된 순서대로 이동하여 완주</p>
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
            {t('guide.realTimeGuideTitle')} 시작
          </button>
        </div>

        {/* Location Tracker (시작 후에만 표시) */}
        {(showMap || showAudioPlayer) && (
          <div className="mt-8">
            <LiveLocationTracker
              pois={pois}
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
              pois={pois.map(poi => ({
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
                const poiIndex = pois.findIndex(poi => poi.id === poiId);
                if (poiIndex !== -1) {
                  setCurrentChapter(poiIndex);
                }
              }}
              className="w-full h-full"
              // Enhanced Coordinate System (Phase 1-4)
              locationName={locationName}
              enableEnhancedCoordinateSystem={true}
              coordinatePackageOptions={{
                enableAnalytics: true,
                enableCaching: true,
                qualityThreshold: 0.6,
                region: 'KR',
                language: 'ko'
              }}
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
        <div>Page height: {typeof document !== 'undefined' ? document.body.scrollHeight : 'N/A'}</div>
      </div>
    </div>
  );
};

export default LiveTourPage;
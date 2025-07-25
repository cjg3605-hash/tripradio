'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, 
  Headphones, 
  ArrowLeft,
  Share2,
  RotateCcw,
  Compass
} from 'lucide-react';
import LiveLocationTracker from '@/components/location/LiveLocationTracker';
import SimpleAudioPlayer from '@/components/audio/SimpleAudioPlayer';
import MapWithRoute from '@/components/guide/MapWithRoute';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
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
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage);
  
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 }); // Default to Seoul
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 sticky top-0 z-40 bg-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  실시간 가이드
                </h1>
                <p className="text-sm text-gray-500">
                  {params.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-2">
            {params.location} 실시간 가이드
          </h1>
          <p className="text-gray-500">
            현재 위치 기반 맞춤 안내
          </p>
        </div>

        {/* 개요 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">개요</h2>
          <p className="text-gray-600 leading-relaxed">
            GPS를 기반으로 현재 위치에서 가장 적합한 관람 코스를 실시간으로 안내합니다. 
            각 지점에 도착하면 자동으로 해당 위치의 상세 정보와 오디오 가이드가 제공됩니다.
          </p>
        </div>

        {/* 필수관람포인트 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">필수관람포인트</h2>
          <div className="space-y-3">
            {pois.map((poi, index) => (
              <div key={poi.id} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-black text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{poi.name}</h3>
                  <p className="text-sm text-gray-600">{poi.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 주의사항 */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">주의사항</h2>
          <div className="space-y-2 text-gray-600">
            <p>• GPS 신호가 약한 지역에서는 위치 정확도가 떨어질 수 있습니다</p>
            <p>• 이어폰 착용을 권장하며, 주변 상황을 주의깊게 살펴보세요</p>
            <p>• 배터리 소모가 많으니 보조배터리를 준비하시기 바랍니다</p>
            <p>• 실내나 지하에서는 GPS 기능이 제한될 수 있습니다</p>
          </div>
        </div>

        {/* 관람순서 */}
        <div className="pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">관람순서</h2>
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
            실시간 가이드 시작
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
            />
          </div>
        )}

        {/* Audio Player (시작 후에만 표시) */}
        {showAudioPlayer && audioChapters.length > 0 && (
          <SimpleAudioPlayer
            chapters={audioChapters}
            onChapterChange={handleChapterChange}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};

export default LiveTourPage;
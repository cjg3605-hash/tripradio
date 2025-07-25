'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, 
  Headphones, 
  ArrowLeft, 
  Settings,
  Share2,
  RotateCcw,
  Download,
  Compass
} from 'lucide-react';
import LiveLocationTracker from '@/components/location/LiveLocationTracker';
import AdvancedAudioPlayer from '@/components/audio/AdvancedAudioPlayer';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                aria-label={t('common.back')}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {t('live.liveGuide')} - {params.location}
                </h1>
                {currentPOI && (
                  <p className="text-sm text-gray-500">
                    {currentPOI.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                aria-label={t('live.reset')}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                aria-label={t('live.share')}
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                aria-label={t('live.fullscreen')}
              >
                <Compass className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-lg"
            aria-label={t('live.exitFullscreen')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className={`${isFullscreen ? 'h-full' : 'max-w-4xl mx-auto p-4'} space-y-6`}>
          
          {/* Location Tracker */}
          {!isFullscreen && (
            <LiveLocationTracker
              pois={pois}
              onLocationUpdate={handleLocationUpdate}
              onPOIReached={handlePOIReached}
              showStats={true}
              showProgress={true}
              className="w-full"
            />
          )}

          {/* Map */}
          {showMap && (
            <div className={`${isFullscreen ? 'h-full' : 'h-96'} bg-white rounded-lg shadow-sm overflow-hidden`}>
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

          {/* Quick Controls */}
          {!isFullscreen && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
                  showMap 
                    ? 'bg-black text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {showMap ? t('live.hideMap') : t('live.showMap')}
              </button>
              
              <button
                onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
                  showAudioPlayer 
                    ? 'bg-black text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Headphones className="w-4 h-4" />
                {showAudioPlayer ? t('live.hideAudio') : t('live.showAudio')}
              </button>
            </div>
          )}

          {/* Audio Player */}
          {showAudioPlayer && !isFullscreen && audioChapters.length > 0 && (
            <AdvancedAudioPlayer
              chapters={audioChapters}
              onChapterChange={handleChapterChange}
              className="w-full"
            />
          )}

          {/* Fullscreen Map Mode Audio Controls */}
          {isFullscreen && showAudioPlayer && audioChapters.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-40">
              <AdvancedAudioPlayer
                chapters={audioChapters}
                onChapterChange={handleChapterChange}
                className="w-full bg-white bg-opacity-95 backdrop-blur-sm"
              />
            </div>
          )}

          {/* Current POI Info */}
          {currentPOI && !isFullscreen && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">
                    {currentChapter + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {currentPOI.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentPOI.description}
                  </p>
                  {currentLocation && (
                    <p className="text-xs text-gray-500 mt-2">
                      {t('live.coordinates')}: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTourPage;
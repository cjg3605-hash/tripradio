'use client';

import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';

// 동적 import로 Leaflet 지도 컴포넌트 로드
const MapWithRoute = dynamic(() => import('./MapWithRoute'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">지도 로딩 중...</p>
      </div>
    </div>
  )
});

interface RecommendedSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

interface RegionTouristMapProps {
  locationName: string;
  recommendedSpots: RecommendedSpot[];
  regionCenter?: { lat: number; lng: number; name?: string };
  className?: string;
}

const RegionTouristMap: React.FC<RegionTouristMapProps> = ({
  locationName,
  recommendedSpots,
  regionCenter,
  className = ''
}) => {
  const { t } = useLanguage();
  
  // 유효한 좌표를 가진 관광지만 필터링
  const validSpots = recommendedSpots.filter(spot => 
    spot.lat && spot.lng && 
    !isNaN(spot.lat) && !isNaN(spot.lng) &&
    spot.lat >= -90 && spot.lat <= 90 &&
    spot.lng >= -180 && spot.lng <= 180
  );

  // 관광지 중심점 계산 (regionCenter가 없는 경우)
  const calculateMapCenter = () => {
    if (regionCenter && regionCenter.lat && regionCenter.lng) {
      return { lat: regionCenter.lat, lng: regionCenter.lng, name: regionCenter.name };
    }

    if (validSpots.length > 0) {
      const centerLat = validSpots.reduce((sum, spot) => sum + spot.lat, 0) / validSpots.length;
      const centerLng = validSpots.reduce((sum, spot) => sum + spot.lng, 0) / validSpots.length;
      return { lat: centerLat, lng: centerLng, name: `${locationName} 중심` };
    }

    // 기본값 (서울 중심)
    return { lat: 37.5665, lng: 126.9780, name: locationName };
  };

  const mapCenter = calculateMapCenter();

  // POI 데이터를 MapWithRoute에 맞는 형식으로 변환
  const poisForMap = validSpots.map(spot => ({
    id: spot.id,
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    description: spot.description
  }));

  return (
    <div className={`bg-white border border-black/8 rounded-3xl shadow-lg shadow-black/3 overflow-hidden ${className}`}>
      {/* 모던 모노크롬 헤더 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black tracking-tight">
              {t('guide.regionTouristMap') || '지역 관광지 지도'}
            </h3>
            <p className="text-sm text-black/60 font-medium mt-0.5">
              {validSpots.length > 0 
                ? `${validSpots.length}개 ${t('guide.recommendedSpots') || '추천 장소'}`
                : `${locationName} ${t('guide.regionOverview') || '지역 개요'}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced 지도 */}
      <div className="h-64">
        {validSpots.length > 0 ? (
          <MapWithRoute
            chapters={undefined} // 챕터는 사용하지 않음
            pois={poisForMap} // 모든 관광지 표시
            currentLocation={null}
            center={mapCenter}
            zoom={12} // 지역 전체가 보이도록 넓게 설정
            showRoute={false} // 루트는 표시하지 않음
            showUserLocation={false}
            onMarkerClick={undefined}
            onPoiClick={(poiId) => {
              console.log('관광지 클릭:', poiId);
            }}
            className="w-full h-full"
            locationName={locationName}
          />
        ) : (
          // 관광지 데이터가 없는 경우 기본 지도 표시
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <div className="text-lg font-medium">{locationName}</div>
              <div className="text-sm mt-1">
                {t('guide.noTouristSpotsAvailable') || '관광지 정보를 불러오는 중입니다'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionTouristMap;
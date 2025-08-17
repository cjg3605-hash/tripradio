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
  guideCoordinates?: any; // Supabase coordinates 컬럼 데이터 (좌표 배열)
}

const RegionTouristMap: React.FC<RegionTouristMapProps> = ({
  locationName,
  recommendedSpots,
  regionCenter,
  className = '',
  guideCoordinates
}) => {
  const { t } = useLanguage();
  
  // 🎯 1단계: coordinates 칼럼 데이터에서 추가 POI 추출
  let coordinatesSpots: RecommendedSpot[] = [];
  
  if (guideCoordinates && Array.isArray(guideCoordinates)) {
    console.log('🗺️ RegionTouristMap: coordinates 칼럼 데이터 처리 시작', guideCoordinates.length);
    
    coordinatesSpots = guideCoordinates.map((coord: any, index: number) => ({
      id: `coord-${coord.id || coord.chapterId || index}`,
      name: coord.title || `장소 ${index + 1}`,
      lat: coord.lat || coord.coordinates?.lat,
      lng: coord.lng || coord.coordinates?.lng,
      description: `${locationName}의 주요 관광 포인트`
    })).filter((spot: any) => 
      spot.lat && spot.lng && 
      !isNaN(spot.lat) && !isNaN(spot.lng) &&
      spot.lat >= -90 && spot.lat <= 90 &&
      spot.lng >= -180 && spot.lng <= 180
    );
    
    console.log('🗺️ coordinates 칼럼에서 추출한 POI:', coordinatesSpots.length);
  }
  
  // 🎯 2단계: 기존 recommendedSpots와 coordinates 칼럼 데이터 병합
  const allSpots = [...recommendedSpots, ...coordinatesSpots];
  
  // 🎯 3단계: 유효한 좌표를 가진 관광지만 필터링 (중복 제거 포함)
  const uniqueSpotNames = new Set<string>();
  const validSpots = allSpots.filter(spot => {
    // 좌표 유효성 검사
    const hasValidCoords = spot.lat && spot.lng && 
      !isNaN(spot.lat) && !isNaN(spot.lng) &&
      spot.lat >= -90 && spot.lat <= 90 &&
      spot.lng >= -180 && spot.lng <= 180;
    
    if (!hasValidCoords) return false;
    
    // 중복 제거 (같은 이름의 장소는 하나만)
    if (uniqueSpotNames.has(spot.name)) return false;
    uniqueSpotNames.add(spot.name);
    
    return true;
  });
  
  console.log('🗺️ RegionTouristMap 최종 유효 POI:', validSpots.length);

  // 관광지 중심점 계산 (id:0 챕터 우선, regionCenter fallback)
  const calculateMapCenter = () => {
    if (regionCenter && regionCenter.lat && regionCenter.lng) {
      console.log('🎯 RegionTouristMap 중심: regionCenter 사용', regionCenter);
      return { lat: regionCenter.lat, lng: regionCenter.lng, name: regionCenter.name };
    }

    // id:0 챕터(첫 번째 챕터) 우선 사용
    if (coordinatesSpots.length > 0) {
      const firstChapterSpot = coordinatesSpots.find(spot => 
        spot.id.includes('coord-0') || 
        spot.id.includes('coord-coord-0') ||
        spot.name.includes('입구') ||
        spot.name.includes('시작')
      ) || coordinatesSpots[0]; // 첫 번째 spots 사용
      
      if (firstChapterSpot) {
        console.log('🎯 RegionTouristMap 중심: id:0 챕터 우선 사용', firstChapterSpot);
        return { 
          lat: firstChapterSpot.lat, 
          lng: firstChapterSpot.lng, 
          name: firstChapterSpot.name 
        };
      }
    }

    if (validSpots.length > 0) {
      const centerLat = validSpots.reduce((sum, spot) => sum + spot.lat, 0) / validSpots.length;
      const centerLng = validSpots.reduce((sum, spot) => sum + spot.lng, 0) / validSpots.length;
      console.log('🎯 RegionTouristMap 중심: 평균 중심점 사용', { lat: centerLat, lng: centerLng });
      return { lat: centerLat, lng: centerLng, name: `${locationName} 중심` };
    }

    // 기본값 - 유효한 POI가 없으면 null 반환
    console.log('🎯 RegionTouristMap 중심: 데이터 없음');
    return null;
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
            center={mapCenter || undefined}
            zoom={12} // 지역 전체가 보이도록 넓게 설정
            showRoute={false} // 루트는 표시하지 않음
            showUserLocation={false}
            onMarkerClick={undefined}
            onPoiClick={(poiId) => {
              console.log('관광지 클릭:', poiId);
            }}
            className="w-full h-full"
            locationName={locationName}
            guideCoordinates={guideCoordinates} // coordinates 칼럼 데이터 전달
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
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';

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
  guideCoordinates?: any; // coordinates 칼럼에서 가져온 좌표 데이터
  className?: string;
}

const RegionTouristMap: React.FC<RegionTouristMapProps> = ({
  locationName,
  recommendedSpots,
  guideCoordinates,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapState, setMapState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 마커 타입 정의
  interface MapMarker {
    id: number | string;
    title: string;
    lat: number;
    lng: number;
    description: string;
    name?: string;
  }

  // coordinates 칼럼에서 좌표 추출
  const extractCoordinatesFromColumn = (guideCoordinates: any): MapMarker[] => {
    if (!guideCoordinates || !Array.isArray(guideCoordinates)) {
      return [];
    }

    return guideCoordinates.map((coord: any, index: number) => {
      // 좌표 추출 (다양한 형태 지원)
      const lat = coord.lat || coord.coordinates?.lat;
      const lng = coord.lng || coord.coordinates?.lng;
      const title = coord.title || coord.name || `장소 ${index + 1}`;

      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return null;
      }

      return {
        id: coord.id || `db-spot-${index}`,
        title: title,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        description: coord.description || `${locationName}의 주요 관광지`
      };
    }).filter((item): item is MapMarker => item !== null);
  };

  // coordinates 칼럼에서 추출한 좌표들 (참고용)
  const coordinateSpots = extractCoordinatesFromColumn(guideCoordinates);
  
  // 추천여행지만 사용 (좌표 불일치 문제 해결)
  const allMarkersToShow: MapMarker[] = recommendedSpots as MapMarker[];

  console.log('🗺️ [RegionTouristMap] 마커 데이터:', {
    coordinateSpotsCount: coordinateSpots.length,
    recommendedSpotsCount: recommendedSpots.length,
    finalMarkersCount: allMarkersToShow.length,
    forcingRecommendedSpots: true,
    recommendedSpotNames: recommendedSpots.map(spot => spot.name),
    allMarkersToShow: allMarkersToShow.map(spot => ({
      name: spot.name || spot.title,
      lat: spot.lat,
      lng: spot.lng
    }))
  });

  // 지도 초기화 함수
  const initializeMap = useCallback(async () => {
    try {
      console.log('🗺️ [RegionTouristMap] 지도 초기화 시작');
      
      // Leaflet 동적 import
      const L = await import('leaflet');
      
      // Leaflet CSS 로드
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 커스텀 툴팁 스타일 추가
      if (!document.querySelector('#leaflet-custom-tooltip-styles-region')) {
        const style = document.createElement('style');
        style.id = 'leaflet-custom-tooltip-styles-region';
        style.innerHTML = `
          .custom-tooltip {
            background: #1f2937 !important;
            color: white !important;
            border: none !important;
            border-radius: 8px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            padding: 8px 12px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            z-index: 1000 !important;
          }
          .custom-tooltip::before {
            border-top-color: #1f2937 !important;
          }
        `;
        document.head.appendChild(style);
      }

      // 기본 아이콘 설정
      delete (L as any).Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // 기존 지도 정리
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // DOM 요소 확인
      if (!mapRef.current) {
        throw new Error('지도 컨테이너 DOM 요소를 찾을 수 없습니다');
      }

      console.log('🗺️ [RegionTouristMap] Leaflet 지도 생성 중...');

      // 지도 중심점 계산 (표시할 마커들의 평균 좌표)
      let centerLat = 37.5665;
      let centerLng = 126.9780;
      let zoom = 10;

      if (allMarkersToShow.length > 0) {
        // 유효한 좌표가 있는 마커들만 필터링
        const validMarkers = allMarkersToShow.filter(spot => 
          spot.lat && spot.lng && 
          !isNaN(spot.lat) && !isNaN(spot.lng) &&
          spot.lat !== 0 && spot.lng !== 0
        );
        
        console.log('🗺️ [RegionTouristMap] 좌표 유효성 검사:', {
          totalMarkers: allMarkersToShow.length,
          validMarkers: validMarkers.length,
          invalidMarkers: allMarkersToShow.filter(spot => !validMarkers.includes(spot))
        });
        
        if (validMarkers.length > 0) {
          centerLat = validMarkers.reduce((sum, spot) => sum + spot.lat, 0) / validMarkers.length;
          centerLng = validMarkers.reduce((sum, spot) => sum + spot.lng, 0) / validMarkers.length;
          
          // 모든 마커가 보이도록 zoom 조정
          zoom = validMarkers.length === 1 ? 15 : 12;
        }
      }
      
      // 지도 생성 (더 안전한 설정)
      const map = L.map(mapRef.current, {
        preferCanvas: true,
        zoomControl: true,
        scrollWheelZoom: true,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false
      }).setView([centerLat, centerLng], zoom);

      // 지도 인스턴스 참조 저장
      mapInstanceRef.current = map;

      // CartoDB Voyager 타일 레이어
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // 모든 마커 추가 (유효한 좌표만)
      allMarkersToShow.forEach((spot, index) => {
        // 좌표 유효성 검사
        if (!spot.lat || !spot.lng || isNaN(spot.lat) || isNaN(spot.lng) || spot.lat === 0 || spot.lng === 0) {
          console.warn(`🗺️ [RegionTouristMap] 잘못된 좌표로 마커 스킵:`, spot);
          return;
        }
        
        // 기본 마커 정보 설정
        const spotName = spot.title || spot.name || `장소 ${index + 1}`;
        
        console.log(`🗺️ [RegionTouristMap] 마커 ${index + 1} 추가: ${spotName}`);
        
        // 기본 마커 생성 (호버/클릭 기능 없음)
        const marker = L.marker([spot.lat, spot.lng])
          .bindTooltip(spotName, {
            direction: 'top',
            offset: [0, -10],
            className: 'custom-tooltip',
            opacity: 0.9
          })
          .addTo(map);

        // 호버 시 툴팁 표시
        marker.on('mouseover', function(this: L.Marker) {
          this.openTooltip();
        });
        
        marker.on('mouseout', function(this: L.Marker) {
          this.closeTooltip();
        });
      });

      // 모든 마커가 보이도록 지도 영역 조정
      if (allMarkersToShow.length > 1) {
        const group = new L.FeatureGroup(
          allMarkersToShow.map(spot => L.marker([spot.lat, spot.lng]))
        );
        map.fitBounds(group.getBounds().pad(0.1));
      }

      mapInstanceRef.current = map;
      
      // 지도 컨테이너 스타일 설정
      if (mapRef.current) {
        const mapContainer = mapRef.current.querySelector('.leaflet-container');
        if (mapContainer) {
          (mapContainer as HTMLElement).style.zIndex = '1';
          (mapContainer as HTMLElement).style.borderRadius = '0.375rem';
          (mapContainer as HTMLElement).style.overflow = 'hidden';
        }
      }
      
      setMapState('loaded');
      console.log(`✅ [RegionTouristMap] 지도 초기화 완료: ${allMarkersToShow.length}개 마커 표시`);

    } catch (error) {
      console.error('❌ [RegionTouristMap] 지도 초기화 실패:', error);
      setErrorMessage(`지도 로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setMapState('error');
    }
  }, [allMarkersToShow]);

  // 지도 초기화
  useEffect(() => {
    if (allMarkersToShow.length > 0) {
      initializeMap();
    } else {
      setMapState('error');
      setErrorMessage('표시할 여행지가 없습니다.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMap, allMarkersToShow.length]);

  return (
    <div className={`h-48 relative overflow-hidden ${className}`}>
      {mapState === 'loading' && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {mapState === 'error' && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center text-red-600">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">지도 로드 실패</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          display: mapState === 'loaded' ? 'block' : 'none',
          zIndex: 1
        }}
      />
    </div>
  );
};

export default RegionTouristMap;
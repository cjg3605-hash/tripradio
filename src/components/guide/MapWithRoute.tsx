// 업계 표준 경량 지도 컴포넌트 - Uber/Airbnb 방식
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react';
import type { GuideChapter } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';

// 정적 import로 변경하여 타입 안정성 확보
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';

// 위치 버튼 훅
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { Navigation } from 'lucide-react';

// Leaflet 아이콘 한 번만 설정
if (typeof window !== 'undefined') {
  const DefaultIcon = L.Icon.Default.prototype as any;
  delete DefaultIcon._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface Chapter {
  id: number;
  title: string;
  lat: number;  // 필수 - POI에서 직접 전달받는 좌표
  lng: number;  // 필수 - POI에서 직접 전달받는 좌표
  originalIndex?: number;
}

interface MapWithRouteProps {
  chapters?: Chapter[];
  activeChapter?: number;
  onMarkerClick?: (index: number) => void;
  pois?: Array<{ id: string; name: string; lat: number; lng: number; description: string; }>;
  center?: { lat: number; lng: number; name?: string; };
  zoom?: number;
  showRoute?: boolean;
  showUserLocation?: boolean;
  onPoiClick?: (poiId: any) => void;
  locationName?: string;
  guideCoordinates?: any;
  currentLocation?: { lat: number; lng: number; name?: string } | null;
  className?: string;
  guideId?: string;
}

// useMapFlyTo 훅 제거됨 - whenReady에서 단일 초기화로 통합

// getLatLng 함수 제거 - POI 데이터에서 직접 lat, lng 사용

// 내 위치 버튼
const LocationButton = memo(({ onLocationClick }: { onLocationClick: () => void }) => {
  const geolocation = useSimpleGeolocation();

  const handleClick = useCallback(() => {
    if (geolocation.permissionStatus === 'denied') {
      alert('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
      return;
    }
    if (!geolocation.isTracking) {
      geolocation.startTracking();
    }
    onLocationClick();
  }, [geolocation, onLocationClick]);

  return (
    <button
      onClick={handleClick}
      disabled={!geolocation.isSupported || geolocation.isLoading}
      className={`
        absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-white rounded-lg shadow-lg
        flex items-center justify-center border border-gray-200 hover:border-gray-300
        transition-all duration-200 hover:scale-105 active:scale-95
        ${geolocation.isLoading ? 'animate-pulse' : ''}
        ${geolocation.isTracking ? 'bg-blue-50 border-blue-200' : ''}
        ${!geolocation.isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={geolocation.isTracking ? '내 위치 추적 중' : '내 위치로 이동'}
    >
      <Navigation 
        className={`w-5 h-5 transition-colors duration-200
          ${geolocation.isTracking ? 'text-blue-600' : 'text-gray-600'}
          ${geolocation.isLoading ? 'animate-spin' : ''}
        `}
      />
    </button>
  );
});

LocationButton.displayName = 'LocationButton';

// 메인 지도 컴포넌트 - 업계 표준 단순화
const MapWithRoute = memo<MapWithRouteProps>(({ 
  chapters, 
  activeChapter, 
  onMarkerClick, 
  pois, 
  center, 
  zoom: customZoom, 
  showRoute = true, 
  showUserLocation = false, 
  onPoiClick, 
  locationName,
  guideCoordinates
}) => {
  const { currentLanguage } = useLanguage();
  const geolocation = useSimpleGeolocation();
  const [showMyLocation, setShowMyLocation] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);


  // 🎯 단순 데이터 정규화 - POI에서 이미 lat, lng가 직접 전달됨
  const validChapters = useMemo(() => {
    console.log(`🔄 지도 데이터 계산 시작:`, {
      chaptersCount: chapters?.length || 0,
      poisCount: pois?.length || 0
    });
    
    // POI를 Chapter 형태로 변환하거나 chapters 사용 (이미 올바른 좌표 포함)
    const allData = chapters?.length ? chapters : (pois || []).map((poi, index) => ({
      id: parseInt(poi.id.replace(/\D/g, '')) || index,
      title: poi.name,
      lat: poi.lat,  // DB coordinates 컬럼에서 추출된 정확한 좌표
      lng: poi.lng,  // DB coordinates 컬럼에서 추출된 정확한 좌표
      originalIndex: index
    }));

    console.log(`📊 처리할 데이터:`, {
      totalItems: allData.length,
      sampleItem: allData[0],
      usingChapters: !!chapters?.length
    });

    // 유효한 좌표만 필터링 - 이미 POI에서 lat, lng가 직접 전달됨
    const filtered = allData
      .map((item, index) => ({
        ...item,
        originalIndex: index,
        // POI에서 이미 lat, lng가 number로 전달되므로 직접 사용
        lat: item.lat,
        lng: item.lng
      }))
      .filter(item => {
        const isValid = 
          typeof item.lat === 'number' && typeof item.lng === 'number' &&
          !isNaN(item.lat) && !isNaN(item.lng) &&
          item.lat >= -90 && item.lat <= 90 &&
          item.lng >= -180 && item.lng <= 180;
        
        if (isValid) {
          console.log(`📍 유효한 POI: "${item.title}" (${item.lat}, ${item.lng})`);
        } else {
          console.warn(`❌ 잘못된 좌표: "${item.title}" (${item.lat}, ${item.lng})`);
        }
        
        return isValid;
      });
    
    console.log(`📍 유효한 좌표 ${filtered.length}개 발견:`, 
      filtered.map(item => ({
        id: item.id,
        title: item.title,
        lat: item.lat,
        lng: item.lng
      }))
    );
    return filtered;
  }, [chapters, pois]);

  // 활성 챕터 데이터 찾기
  const activeChapterData = validChapters.find(c => c.originalIndex === activeChapter);


  // 🎯 단일 지도 중심점 계산 로직 - 우선순위 기반
  const mapCenter: LatLngExpression | null = (() => {
    // 1순위: 명시적 center prop (외부에서 지정된 좌표)
    if (center?.lat && center?.lng) {
      console.log('🎯 지도 중심: 명시적 center 사용', center);
      return [center.lat, center.lng];
    }
    
    // 2순위: 활성 챕터 좌표 (사용자가 선택한 챕터)
    if (activeChapterData?.lat && activeChapterData?.lng) {
      console.log('🎯 지도 중심: 활성 챕터 사용', activeChapterData);
      return [activeChapterData.lat, activeChapterData.lng];
    }
    
    // 3순위: 첫 번째 유효한 챕터 (여행 시작점)
    if (validChapters.length > 0) {
      const firstChapter = validChapters.find(ch => ch.id === 0 || ch.originalIndex === 0) || validChapters[0];
      if (firstChapter?.lat && firstChapter?.lng) {
        console.log('🎯 지도 중심: 첫 번째 챕터 사용', firstChapter);
        return [firstChapter.lat, firstChapter.lng];
      }
      
      // 4순위: 전체 지점들의 중심점 (지역 전체 보기)
      const avgLat = validChapters.reduce((sum, ch) => sum + ch.lat!, 0) / validChapters.length;
      const avgLng = validChapters.reduce((sum, ch) => sum + ch.lng!, 0) / validChapters.length;
      console.log('🎯 지도 중심: 전체 지점 중심 사용', { lat: avgLat, lng: avgLng });
      return [avgLat, avgLng];
    }
    
    // 좌표 없음: 지도 숨김
    console.log('⚠️ 지도 중심: 유효한 좌표 없음');
    return null;
  })();

  // 줌 레벨 계산
  const calculateZoom = (): number => {
    if (customZoom) return customZoom;
    if (validChapters.length <= 1) return 16;
    
    const lats = validChapters.map(c => c.lat!);
    const lngs = validChapters.map(c => c.lng!);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange < 0.001) return 17;
    if (maxRange < 0.01) return 14;
    if (maxRange < 0.05) return 12;
    return 10;
  };

  // 중복된 flyTo 호출들 제거됨 - whenReady에서 단일 초기화로 통합

  // 내 위치로 지도 이동
  useEffect(() => {
    if (showMyLocation && geolocation.latitude && geolocation.longitude && mapRef.current) {
      const map = mapRef.current;
      if (map && typeof map.flyTo === 'function') {
        map.flyTo([geolocation.latitude, geolocation.longitude], 17, { duration: 1 });
      }
    }
    return undefined;
  }, [showMyLocation, geolocation.latitude, geolocation.longitude]);

  // 언어별 타일 URL
  const getTileUrl = (language: string) => {
    const langMap: { [key: string]: string } = {
      'ko': 'ko', 'en': 'en', 'ja': 'ja', 'zh': 'zh-CN', 'es': 'es'
    };
    const langCode = langMap[language] || 'en';
    return `https://mt1.google.com/vt/lyrs=m&hl=${langCode}&x={x}&y={y}&z={z}`;
  };


  // 좌표가 정말 없는 경우 (POI도 chapters도 없음 또는 mapCenter가 null)
  if (validChapters.length === 0 || mapCenter === null) {
    return (
      <div className="w-full h-64 bg-gray-50 flex items-center justify-center rounded-lg border border-gray-200">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">📍</div>
          <div>표시할 위치가 없습니다</div>
          <div className="text-sm mt-2 text-gray-400">위치 정보를 추가해주세요</div>
        </div>
      </div>
    );
  }

  // 루트 라인 생성
  const routePositions: LatLngExpression[] = showRoute && validChapters.length > 1 
    ? validChapters.map(chapter => [chapter.lat!, chapter.lng!])
    : [];

  // 지도 리렌더링을 위한 유니크 키
  const mapKey = `map-${locationName}-${validChapters.length}-${activeChapter || 0}`;

  return (
    <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white">
      <MapContainer 
        key={mapKey}
        center={mapCenter}
        zoom={calculateZoom()}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        whenReady={() => {
          console.log(`🗺️ 지도 준비 완료! validChapters: ${validChapters.length}개`);
          // 지도 초기화 완료 - center prop으로 이미 올바른 위치에 설정됨
        }}
      >
        {/* 타일 레이어 */}
        <TileLayer
          url={getTileUrl(currentLanguage)}
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          maxZoom={20}
        />
        
        {/* 루트 라인 */}
        {routePositions.length > 0 && (
          <Polyline 
            positions={routePositions}
            pathOptions={{
              color: "#000000",
              weight: 4,
              opacity: 0.8,
              dashArray: "8, 6",
              lineCap: "round",
              lineJoin: "round"
            }}
          />
        )}
        
        {/* 내 위치 마커 */}
        {showMyLocation && geolocation.latitude && geolocation.longitude && (
          <Marker position={[geolocation.latitude, geolocation.longitude]}>
            <Tooltip>
              <div className="text-center">
                <div className="font-medium text-sm text-blue-600">내 위치</div>
                {geolocation.accuracy && (
                  <div className="text-xs text-gray-500 mt-1">
                    정확도: ±{Math.round(geolocation.accuracy)}m
                  </div>
                )}
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* 마커들 */}
        {validChapters.map((chapter) => {
          const isActive = chapter.originalIndex === activeChapter;
          
          return (
            <Marker
              key={`marker-${chapter.id}-${chapter.originalIndex}`}
              position={[chapter.lat!, chapter.lng!]}
              eventHandlers={{
                click: () => {
                  if (chapters) {
                    onMarkerClick?.(chapter.originalIndex);
                  } else {
                    onPoiClick?.(chapter.id);
                  }
                }
              }}
            >
              <Tooltip>
                <div className="text-center">
                  <div className="font-medium text-sm">{chapter.title}</div>
                  {isActive && (
                    <div className="text-xs text-blue-600 mt-1">현재 위치</div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* 내 위치 버튼 */}
      <LocationButton onLocationClick={() => setShowMyLocation(true)} />
      
      {/* 하단 정보 */}
      <div className="bg-black/2 px-4 py-3 text-xs font-medium border-t border-black/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-black/80">{validChapters.length}개 지점</span>
          </div>
          <div className="text-right">
            <div className="text-black/60">
              {activeChapterData ? 
                `현재: ${activeChapterData.title}` : 
                locationName || '위치를 선택해주세요'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

MapWithRoute.displayName = 'MapWithRoute';

export default MapWithRoute;
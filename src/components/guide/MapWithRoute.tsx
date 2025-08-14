// 업계 표준 경량 지도 컴포넌트 - Uber/Airbnb 방식
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useCallback, useRef, memo } from 'react';
import type { GuideChapter } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';

// 지연 로딩 - 실제 필요시에만 로드
const MapContainer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Polyline })), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Tooltip })), { ssr: false });

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
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: { lat?: number; lng?: number; latitude?: number; longitude?: number; };
  location?: { lat?: number; lng?: number; latitude?: number; longitude?: number; };
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
}

// 단순한 지도 이동 훅
function useMapFlyTo(mapRef: React.RefObject<any>, lat?: number, lng?: number) {
  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;
    
    const map = mapRef.current;
    if (map && typeof map.flyTo === 'function') {
      map.flyTo([lat, lng], 16, { duration: 0.7 });
    }
  }, [mapRef, lat, lng]);
}

// 좌표 추출 유틸리티
function getLatLng(chapter: Chapter, guideCoordinates?: any): [number | undefined, number | undefined] {
  // Supabase coordinates 우선
  if (guideCoordinates?.length > 0) {
    const coord = guideCoordinates.find((c: any) => 
      c.id === chapter.id || c.step === chapter.id || c.title === chapter.title
    );
    if (coord) {
      return [coord.lat ?? coord.latitude, coord.lng ?? coord.longitude];
    }
  }

  // 기본 좌표 매핑
  const lat = chapter.location?.lat ?? chapter.coordinates?.lat ?? chapter.lat ?? chapter.latitude;
  const lng = chapter.location?.lng ?? chapter.coordinates?.lng ?? chapter.lng ?? chapter.longitude;
  return [lat, lng];
}

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
  const mapRef = useRef<any>(null);

  // 데이터 정규화 - POI를 Chapter 형태로 변환
  const allData = chapters?.length ? chapters : (pois || []).map((poi, index) => ({
    id: parseInt(poi.id.replace(/\D/g, '')) || index,
    title: poi.name,
    lat: poi.lat,
    lng: poi.lng,
    originalIndex: index
  }));

  // 유효한 좌표만 필터링
  const validChapters = allData
    .map((item, index) => {
      const [lat, lng] = chapters ? getLatLng(item, guideCoordinates) : [item.lat, item.lng];
      return { ...item, originalIndex: index, lat, lng };
    })
    .filter(item => 
      item.lat !== undefined && item.lng !== undefined &&
      !isNaN(item.lat) && !isNaN(item.lng) &&
      item.lat >= -90 && item.lat <= 90 &&
      item.lng >= -180 && item.lng <= 180
    );

  // 활성 챕터 데이터 찾기
  const activeChapterData = validChapters.find(c => c.originalIndex === activeChapter);

  // 지도 중심점 계산 - activeChapter가 있으면 해당 위치를 중심으로
  const mapCenter: LatLngExpression = center && center.lat && center.lng 
    ? [center.lat, center.lng]
    : activeChapterData && activeChapterData.lat && activeChapterData.lng
      ? [activeChapterData.lat, activeChapterData.lng] // 활성 챕터를 중심으로
      : validChapters.length > 0 
        ? [
            validChapters.reduce((sum, ch) => sum + ch.lat!, 0) / validChapters.length,
            validChapters.reduce((sum, ch) => sum + ch.lng!, 0) / validChapters.length
          ]
        : [37.5665, 126.9780]; // 서울 기본값

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

  // 활성 챕터로 지도 이동
  useMapFlyTo(mapRef, activeChapterData?.lat, activeChapterData?.lng);

  // 지도 렌더링 5초 지연
  const [showMap, setShowMap] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMap(true);
    }, 5000); // 5초 후 지도 렌더링

    return () => clearTimeout(timer);
  }, []);

  // 지도가 로드된 후 활성 마커로 중심 이동
  useEffect(() => {
    if (showMap && activeChapterData && mapRef.current) {
      const timer = setTimeout(() => {
        const map = mapRef.current;
        if (map && typeof map.flyTo === 'function') {
          map.flyTo([activeChapterData.lat!, activeChapterData.lng!], 16, { duration: 1 });
        }
      }, 500); // 지도 로드 후 0.5초 대기

      return () => clearTimeout(timer);
    }
    // else 조건에서도 cleanup 함수 반환
    return () => {};
  }, [showMap, activeChapterData]);

  // 내 위치로 지도 이동
  useEffect(() => {
    if (showMyLocation && geolocation.latitude && geolocation.longitude && mapRef.current) {
      const map = mapRef.current;
      if (map && typeof map.flyTo === 'function') {
        map.flyTo([geolocation.latitude, geolocation.longitude], 17, { duration: 1 });
      }
    }
  }, [showMyLocation, geolocation.latitude, geolocation.longitude]);

  // 언어별 타일 URL
  const getTileUrl = (language: string) => {
    const langMap: { [key: string]: string } = {
      'ko': 'ko', 'en': 'en', 'ja': 'ja', 'zh': 'zh-CN', 'es': 'es'
    };
    const langCode = langMap[language] || 'en';
    return `https://mt1.google.com/vt/lyrs=m&hl=${langCode}&x={x}&y={y}&z={z}`;
  };

  // 지도 로딩 중이거나 유효한 좌표가 없으면 로딩/빈 화면
  if (!showMap || validChapters.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">{!showMap ? "🗺️" : "📍"}</div>
          <div>{!showMap ? "지도를 로딩 중입니다..." : "유효한 좌표 정보가 없습니다"}</div>
        </div>
      </div>
    );
  }

  // 루트 라인 생성
  const routePositions: LatLngExpression[] = showRoute && validChapters.length > 1 
    ? validChapters.map(chapter => [chapter.lat!, chapter.lng!])
    : [];

  return (
    <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white">
      <MapContainer 
        center={mapCenter}
        zoom={calculateZoom()}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
        whenReady={() => {
          // 지도가 완전히 로드된 후 활성 마커로 이동
          if (activeChapterData && mapRef.current) {
            setTimeout(() => {
              const map = mapRef.current;
              if (map && typeof map.flyTo === 'function') {
                map.flyTo([activeChapterData.lat!, activeChapterData.lng!], 16, { duration: 1 });
              }
            }, 100);
          }
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
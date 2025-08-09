// 이 파일은 반드시 dynamic import({ ssr: false })로만 사용하세요. SSR에서 직접 import 금지!
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
// import '@/styles/monochrome-map.css'; // 🔥 흑백 스타일 제거
import L from 'leaflet';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
// 기본 좌표 매핑만 사용
import type { GuideChapter } from '@/types/guide';
import { useLanguage } from '@/contexts/LanguageContext';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), { ssr: false }) as any;
const TileLayer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), { ssr: false }) as any;
const Polyline = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Polyline })), { ssr: false }) as any;
const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), { ssr: false }) as any;
const Tooltip = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Tooltip })), { ssr: false }) as any;
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false }) as any;

// 내 위치 버튼 훅
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { Navigation } from 'lucide-react';

// Leaflet 기본 마커 아이콘 수정 (타입 안전하게)
const fixLeafletIcons = (): void => {
  if (typeof window !== 'undefined') {
    try {
      const DefaultIcon = L.Icon.Default.prototype as any;
      if (DefaultIcon._getIconUrl) {
        delete DefaultIcon._getIconUrl;
      }
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    } catch (error) {
      console.warn('Leaflet 아이콘 설정 중 오류:', error);
    }
  }
};

// 컴포넌트 로드 시 실행
fixLeafletIcons();

interface Coordinates {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

interface Chapter {
  id: number;
  title: string;
  // 모든 좌표 형태 지원 (기존 호환성)
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: Coordinates;
  location?: Coordinates;
}

interface MapWithRouteProps {
  chapters?: Chapter[];
  activeChapter?: number;
  onMarkerClick?: (index: number) => void;
  pois?: Array<{ id: string; name: string; lat: number; lng: number; description: string; }>;
  currentLocation?: { lat: number; lng: number; } | null;
  center?: { lat: number; lng: number; name?: string; };
  zoom?: number;
  showRoute?: boolean;
  showUserLocation?: boolean;
  onPoiClick?: (poiId: any) => void;
  className?: string;
  locationName?: string;
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = (useMap as any)();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { duration: 0.7 });
    }
  }, [lat, lng, map]);
  return null;
}

// === 🎯 모던 모노크롬 마커 아이콘 생성 ===
const modernMarkerSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32px" height="32px">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    </defs>
    <!-- 외부 원 (그림자) -->
    <circle cx="16" cy="16" r="14" fill="rgba(0,0,0,0.1)" />
    <!-- 메인 원 -->
    <circle cx="16" cy="16" r="12" fill="white" stroke="black" stroke-width="2" filter="url(#shadow)" />
    <!-- 내부 점 -->
    <circle cx="16" cy="16" r="4" fill="black" />
  </svg>
`;

const customMarkerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(modernMarkerSvg)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  tooltipAnchor: [0, -16],
});

// 활성화된 챕터용 강조 마커 (접근성 고려 고대비)
const activeModernMarkerSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36px" height="36px">
    <defs>
      <filter id="activeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
      <radialGradient id="activeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:white;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
      </radialGradient>
    </defs>
    <!-- 펄싱 효과용 외부 원 -->
    <circle cx="18" cy="18" r="16" fill="rgba(0,0,0,0.2)" opacity="0.6">
      <animate attributeName="r" values="16;20;16" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
    </circle>
    <!-- 메인 원 -->
    <circle cx="18" cy="18" r="14" fill="url(#activeGrad)" stroke="black" stroke-width="3" filter="url(#activeShadow)" />
    <!-- 내부 십자 표시 (현재 위치 강조) -->
    <path d="M 18 8 L 18 28 M 8 18 L 28 18" stroke="black" stroke-width="3" stroke-linecap="round" />
    <!-- 중앙 점 -->
    <circle cx="18" cy="18" r="3" fill="black" />
  </svg>
`;

const activeMarkerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(activeModernMarkerSvg)}`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
  tooltipAnchor: [0, -18],
});

// 사용자 위치 마커 (방향 표시 포함)
const createUserLocationMarkerSvg = (heading: number | null) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40px" height="40px">
    <defs>
      <filter id="userShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(59,130,246,0.5)"/>
      </filter>
      <radialGradient id="userGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="70%" style="stop-color:#1d4ed8;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e3a8a;stop-opacity:1" />
      </radialGradient>
    </defs>
    <!-- 펄싱 효과용 외부 원 -->
    <circle cx="20" cy="20" r="18" fill="rgba(59,130,246,0.3)" opacity="0.8">
      <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>
    <!-- 메인 원 -->
    <circle cx="20" cy="20" r="16" fill="url(#userGrad)" stroke="white" stroke-width="3" filter="url(#userShadow)" />
    ${heading !== null ? `
    <!-- 방향 화살표 -->
    <g transform="rotate(${heading} 20 20)">
      <path d="M 20 8 L 26 20 L 20 17 L 14 20 Z" fill="white" stroke="none"/>
    </g>
    ` : ''}
    <!-- 중앙 점 -->
    <circle cx="20" cy="20" r="4" fill="white" />
  </svg>
`;

const createUserLocationIcon = (heading: number | null) => new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(createUserLocationMarkerSvg(heading))}`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  tooltipAnchor: [0, -20],
});

// 내 위치 버튼 컴포넌트
const MyLocationButton = ({ map, onLocationClick }: { map: any, onLocationClick: () => void }) => {
  const geolocation = useSimpleGeolocation();

  const handleLocationClick = useCallback(() => {
    if (geolocation.permissionStatus === 'denied') {
      alert('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
      return;
    }

    if (!geolocation.isTracking) {
      geolocation.startTracking();
    }
    
    onLocationClick();
  }, [geolocation, onLocationClick]);

  useEffect(() => {
    if (geolocation.latitude && geolocation.longitude && map) {
      map.flyTo([geolocation.latitude, geolocation.longitude], 17, { duration: 1 });
    }
  }, [geolocation.latitude, geolocation.longitude, map]);

  return (
    <button
      onClick={handleLocationClick}
      disabled={!geolocation.isSupported || geolocation.isLoading}
      className={`
        absolute bottom-4 right-4 z-[1000]
        w-12 h-12 bg-white rounded-lg shadow-lg
        flex items-center justify-center
        border border-gray-200 hover:border-gray-300
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${geolocation.isLoading ? 'animate-pulse' : ''}
        ${geolocation.isTracking ? 'bg-blue-50 border-blue-200' : ''}
        ${!geolocation.isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={geolocation.isTracking ? '내 위치 추적 중' : '내 위치로 이동'}
      aria-label="내 위치로 이동"
    >
      <Navigation 
        className={`
          w-5 h-5 transition-colors duration-200
          ${geolocation.isTracking ? 'text-blue-600' : 'text-gray-600'}
          ${geolocation.isLoading ? 'animate-spin' : ''}
        `}
        style={{
          transform: geolocation.isTracking && geolocation.heading 
            ? `rotate(${geolocation.heading}deg)` 
            : 'none'
        }}
      />
    </button>
  );
};

export default function MapWithRoute({ 
  chapters, 
  activeChapter, 
  onMarkerClick, 
  pois, 
  currentLocation, 
  center, 
  zoom: customZoom, 
  showRoute = true, 
  showUserLocation = false, 
  onPoiClick, 
  className,
  locationName
}: MapWithRouteProps) {
  
  const { currentLanguage } = useLanguage();
  
  // GPS 위치 추적
  const geolocation = useSimpleGeolocation();
  const [showMyLocation, setShowMyLocation] = useState(false);

  // 🔥 React Hook 규칙 준수: 모든 훅을 조건부 return 전에 호출
  // 🔥 안정적인 키 생성 - 컴포넌트 생명주기 동안 유지
  const stableMapKey = useMemo(() => {
    return `map-${locationName}-${currentLanguage}-${Math.floor(Date.now() / 1000)}`;
  }, [locationName, currentLanguage]);

  // 🔥 DOM 컨테이너 참조
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 🔥 컴포넌트 언마운트 시 Leaflet 정리
  useEffect(() => {
    // ref 값을 변수에 저장하여 정리 함수에서 안전하게 사용
    const containerRef = mapContainerRef.current;
    
    return () => {
      // 저장된 참조를 사용하여 정리
      if (containerRef && (containerRef as any)._leaflet_id) {
        try {
          // Leaflet 지도 인스턴스 제거
          delete (containerRef as any)._leaflet_id;
        } catch (error) {
          console.warn('지도 정리 중 오류:', error);
        }
      }
    };
  }, []);

  // 언어에 따른 Google Maps 타일 URL 생성
  const getGoogleMapsUrl = (language: string) => {
    // 언어 코드 매핑 (Google Maps에서 지원하는 형식으로)
    const languageMap: { [key: string]: string } = {
      'ko': 'ko',      // 한국어
      'en': 'en',      // 영어
      'ja': 'ja',      // 일본어
      'zh': 'zh-CN',   // 중국어 (간체)
      'es': 'es'       // 스페인어
    };
    
    const googleLangCode = languageMap[language] || 'en';
    return `https://mt1.google.com/vt/lyrs=m&hl=${googleLangCode}&x={x}&y={y}&z={z}`;
  };

  // 기본 좌표 매핑만 사용 - 단순화
  console.log('🗺️ MapWithRoute 렌더링:', {
    chaptersCount: chapters?.length || 0,
    poisCount: pois?.length || 0,
    hasCenter: !!center,
    locationName,
    userLocation: showMyLocation ? 'enabled' : 'disabled'
  });

  // 좌표 추출 함수 개선 (여러 형태 지원)
  const getLatLng = (chapter: Chapter): [number | undefined, number | undefined] => {
    // 우선순위: location > coordinates > lat/lng > latitude/longitude
    const lat = chapter.location?.lat ?? 
                 chapter.coordinates?.lat ?? 
                 chapter.lat ?? 
                 chapter.latitude;
                 
    const lng = chapter.location?.lng ?? 
                 chapter.coordinates?.lng ?? 
                 chapter.lng ?? 
                 chapter.longitude;
                 
    return [lat, lng];
  };

  // POI 데이터를 Chapter 형태로 변환
  const poisAsChapters = (pois || []).map((poi, index) => ({
    id: parseInt(poi.id.replace(/\D/g, '')) || index,
    title: poi.name,
    lat: poi.lat,
    lng: poi.lng,
    narrative: poi.description,
    originalIndex: index
  }));

  // 기본 데이터 사용 (chapters 우선, 없으면 pois)
  const allData = chapters?.length ? chapters : poisAsChapters;
  
  // 유효한 좌표를 가진 데이터만 필터링
  const validChapters = allData
    .map((item, index) => {
      if (chapters) {
        const [lat, lng] = getLatLng(item);
        return { ...item, originalIndex: index, lat, lng };
      } else {
        // POI 데이터인 경우
        return { ...item, originalIndex: index };
      }
    })
    .filter(item => {
      // 기본 좌표 유효성 검증만 수행
      const isValidLat = item.lat !== undefined && 
                        !isNaN(item.lat) && 
                        item.lat >= -90 && 
                        item.lat <= 90;
      
      const isValidLng = item.lng !== undefined && 
                        !isNaN(item.lng) && 
                        item.lng >= -180 && 
                        item.lng <= 180;
      
      return isValidLat && isValidLng;
    });

  console.log('📍 지도 렌더링:', {
    totalChapters: (chapters || []).length,
    validChapters: validChapters.length,
    activeChapter,
    validCoordsDebug: validChapters.map(c => ({ 
      title: c.title, 
      lat: c.lat, 
      lng: c.lng, 
      originalIndex: c.originalIndex 
    }))
  });

  // 유효한 좌표가 없으면 기본 위치로 지도 표시
  if (validChapters.length === 0) {
    // 중심점이 있으면 기본 지도 표시
    if (center && center.lat && center.lng) {
      return (
        <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white">
          <MapContainer 
            {...({center: [center.lat, center.lng], zoom: customZoom || 15, key: `default-map-${currentLanguage}`} as any)}
            className="w-full h-full"
            scrollWheelZoom={true}
            zoomControl={true}
          >
            {/* 🌍 Google Maps 스타일 타일 (언어별 동적 로딩) */}
            <TileLayer
              {...({
                url: getGoogleMapsUrl(currentLanguage),
                attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
                maxZoom: 20,
                key: currentLanguage // 언어 변경 시 타일 다시 로드
              } as any)}
            />
            
            {/* 중심점 마커 */}
            <Marker
              {...({
                position: [center.lat, center.lng],
                icon: customMarkerIcon
              } as any)}
            >
              <Tooltip 
                {...({
                  direction: "top",
                  offset: [0, -20],
                  opacity: 0.9,
                  permanent: false
                } as any)}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">
                    {center.name || locationName || '시작 위치'}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          </MapContainer>
          
          <div className="bg-black/2 px-4 py-3 text-xs font-medium border-t border-black/5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-black/80">기본 위치</span>
              </div>
              <div className="text-right">
                <div className="text-black/60">
                  {center.name || locationName || '위치 정보'}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">📍</div>
          <div>좌표 정보가 없어 지도를 표시할 수 없습니다</div>
          <div className="text-sm mt-1">
            총 {(chapters || []).length}개 챕터 중 유효한 좌표: {validChapters.length}개
          </div>
        </div>
      </div>
    );
  }

  // 지도 중심점 계산 - 단순화
  let mapCenter: LatLngExpression;
  let mapZoom = customZoom;

  if (center && center.lat && center.lng) {
    // 사용자 정의 중심점 우선
    mapCenter = [center.lat, center.lng];
  } else if (validChapters.length > 0) {
    // 유효한 좌표들의 평균
    const centerLat = validChapters.reduce((sum, chapter) => sum + chapter.lat!, 0) / validChapters.length;
    const centerLng = validChapters.reduce((sum, chapter) => sum + chapter.lng!, 0) / validChapters.length;
    mapCenter = [centerLat, centerLng];
  } else {
    // 기본값
    mapCenter = [37.5665, 126.9780];
  }

  // 활성 챕터의 좌표 (지도 이동용)
  const activeChapterData = validChapters.find(c => c.originalIndex === activeChapter);
  const activeLat = activeChapterData?.lat;
  const activeLng = activeChapterData?.lng;

  // 루트 라인 생성 (유효한 좌표들만)
  const routePositions: LatLngExpression[] = validChapters.map(chapter => [chapter.lat!, chapter.lng!]);

  // 지도 줌 레벨 계산 (챕터 분포에 따라)
  const calculateZoom = (): number => {
    if (validChapters.length === 1) return 16;
    
    const lats = validChapters.map(c => c.lat!);
    const lngs = validChapters.map(c => c.lng!);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange < 0.001) return 17;      // 매우 근접
    if (maxRange < 0.005) return 15;      // 근접
    if (maxRange < 0.01) return 14;       // 보통
    if (maxRange < 0.05) return 12;       // 넓음
    return 10;                            // 매우 넓음
  };

  const zoom = mapZoom || calculateZoom();

  // 로딩 상태 제거 - 즉시 렌더링

  // 🔥 지도 대신 좌표 정보 표시 (Leaflet 오류 방지)
  // 인트로 챕터 (첫 번째 챕터) 정보 추출
  const introChapter = validChapters.length > 0 ? validChapters[0] : null;
  const introTitle = introChapter?.title || `${locationName} 시작점`;
  
  // 실제 DB 타입 구조에 따른 좌표 추출 (우선순위: location > coordinates > lat/lng > latitude/longitude)
  const introLat = introChapter?.location?.lat || 
                   introChapter?.coordinates?.lat || 
                   introChapter?.lat || 
                   introChapter?.latitude || 
                   mapCenter[0];
                   
  const introLng = introChapter?.location?.lng || 
                   introChapter?.coordinates?.lng || 
                   introChapter?.lng || 
                   introChapter?.longitude || 
                   mapCenter[1];
                   
  const introNarrative = introChapter?.narrative || introChapter?.description || '';
  
  return (
    <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white flex items-center justify-center">
      <div className="text-center p-4">
        <div className="text-lg font-medium text-gray-800 mb-2">📍 {locationName}</div>
        <div className="text-sm text-gray-600 mb-1">시작점: {introLat}, {introLng}</div>
        <div className="text-xs text-gray-500 mb-3">인트로 챕터 좌표 표시</div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-800">{introTitle}</div>
          <div className="text-xs text-blue-600 mt-1">좌표: {introLat}°N, {introLng}°E</div>
          {introNarrative && (
            <div className="text-xs text-blue-500 mt-1">{introNarrative.slice(0, 50)}{introNarrative.length > 50 ? '...' : ''}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={mapContainerRef}
      className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white"
    >
      <MapContainer 
        key={stableMapKey}
        center={mapCenter}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
      >
        {/* 🌍 Google Maps 스타일 (언어별 동적 로딩) */}
        <TileLayer
          key={currentLanguage} // 언어 변경 시 타일 다시 로드
          url={getGoogleMapsUrl(currentLanguage)}
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          maxZoom={20}
        />
        
        {/* 활성 챕터로 지도 이동 */}
        {activeLat && activeLng && (
          <MapFlyTo lat={activeLat} lng={activeLng} />
        )}
        
        {/* 루트 라인 - 모던 모노크롬 스타일 */}
        {routePositions.length > 1 && (
          <Polyline 
            {...({
              positions: routePositions,
              color: "#000000",
              weight: 4,
              opacity: 0.8,
              dashArray: "8, 6",
              lineCap: "round",
              lineJoin: "round"
            } as any)}
          />
        )}
        
        {/* 사용자 위치 마커 */}
        {showMyLocation && geolocation.latitude && geolocation.longitude && (
          <Marker
            {...({
              position: [geolocation.latitude, geolocation.longitude],
              icon: createUserLocationIcon(geolocation.heading)
            } as any)}
          >
            <Tooltip 
              {...({
                direction: "top",
                offset: [0, -20],
                opacity: 0.9,
                permanent: false
              } as any)}
            >
              <div className="text-center">
                <div className="font-medium text-sm text-blue-600">
                  내 위치
                </div>
                {geolocation.accuracy && (
                  <div className="text-xs text-gray-500 mt-1">
                    정확도: ±{Math.round(geolocation.accuracy)}m
                  </div>
                )}
                {geolocation.heading !== null && (
                  <div className="text-xs text-gray-500 mt-1">
                    방향: {geolocation.heading}°
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
              {...({
                position: [chapter.lat!, chapter.lng!],
                icon: isActive ? activeMarkerIcon : customMarkerIcon,
                eventHandlers: {
                  click: () => {
                    console.log('마커 클릭:', chapter.originalIndex, chapter.title);
                    if (chapters) {
                      onMarkerClick?.(chapter.originalIndex);
                    } else {
                      onPoiClick?.(chapter.id);
                    }
                  }
                }
              } as any)}
            >
              <Tooltip 
                {...({
                  direction: "top",
                  offset: [0, -20],
                  opacity: 0.9,
                  permanent: false,
                  className: isActive ? "font-bold" : ""
                } as any)}
              >
                <div className="text-center">
                  <div className="font-medium text-sm">
                    {chapter.title}
                  </div>
                  {isActive && (
                    <div className="text-xs text-blue-600 mt-1">
                      현재 위치
                    </div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* 내 위치 버튼 - 지도 위에 절대 위치 */}
      <MyLocationButton 
        map={null} 
        onLocationClick={() => setShowMyLocation(true)} 
      />
      
      {/* 기본 지도 하단 정보 */}
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
}
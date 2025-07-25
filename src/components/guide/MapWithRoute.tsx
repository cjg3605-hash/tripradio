// 이 파일은 반드시 dynamic import({ ssr: false })로만 사용하세요. SSR에서 직접 import 금지!
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// @ts-ignore
const MapContainer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })), { ssr: false });
// @ts-ignore
const TileLayer = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })), { ssr: false });
// @ts-ignore
const Polyline = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Polyline })), { ssr: false });
// @ts-ignore
const Marker = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Marker })), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('react-leaflet').then(mod => ({ default: mod.Tooltip })), { ssr: false });
// @ts-ignore
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false });

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

// === ⭐️ 노란 별 마커 아이콘 생성 ===
const starIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFC700" width="32px" height="32px" stroke="%23B79000" stroke-width="0.5">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
`;

const customMarkerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(starIconSvg)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  tooltipAnchor: [0, -32], // 툴팁 위치 조정
});

// 활성화된 챕터용 빨간 별 마커
const activeStarIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF4444" width="36px" height="36px" stroke="%23CC0000" stroke-width="1">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
`;

const activeMarkerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(activeStarIconSvg)}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  tooltipAnchor: [0, -36],
});

export default function MapWithRoute({ chapters, activeChapter, onMarkerClick }: MapWithRouteProps) {
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

  // 유효한 좌표를 가진 챕터만 필터링
  const validChapters = (chapters || [])
    .map((chapter, index) => {
      const [lat, lng] = getLatLng(chapter);
      return { ...chapter, originalIndex: index, lat, lng };
    })
    .filter(chapter => 
      chapter.lat !== undefined && 
      chapter.lng !== undefined && 
      !isNaN(chapter.lat) && 
      !isNaN(chapter.lng) &&
      chapter.lat !== 0 && 
      chapter.lng !== 0
    );

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

  // 유효한 좌표가 없으면 에러 메시지 표시
  if (validChapters.length === 0) {
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

  // 지도 중심점 계산 (유효한 좌표들의 평균)
  const centerLat = validChapters.reduce((sum, chapter) => sum + chapter.lat!, 0) / validChapters.length;
  const centerLng = validChapters.reduce((sum, chapter) => sum + chapter.lng!, 0) / validChapters.length;
  const center: LatLngExpression = [centerLat, centerLng];

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

  const zoom = calculateZoom();

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-md">
      <MapContainer 
        {...({center, zoom} as any)}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          {...({
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          } as any)}
        />
        
        {/* 활성 챕터로 지도 이동 */}
        {activeLat && activeLng && (
          <MapFlyTo lat={activeLat} lng={activeLng} />
        )}
        
        {/* 루트 라인 */}
        {routePositions.length > 1 && (
          <Polyline 
            {...({
              positions: routePositions,
              color: "#3B82F6",
              weight: 3,
              opacity: 0.7,
              dashArray: "5, 10"
            } as any)}
          />
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
                    onMarkerClick?.(chapter.originalIndex);
                  }
                }
              } as any)}
            >
              <Tooltip 
                {...({
                  direction: "top",
                  offset: [0, -20],
                  opacity: 0.9,
                  permanent: isActive,
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
      
      {/* 지도 하단 정보 */}
      <div className="bg-white px-3 py-2 text-xs text-gray-600 border-t">
        <div className="flex justify-between items-center">
          <span>📍 {validChapters.length}개 지점</span>
          <span>
            {activeChapterData ? 
              `현재: ${activeChapterData.title}` : 
              '위치를 선택해주세요'
            }
          </span>
        </div>
      </div>
    </div>
  );
}
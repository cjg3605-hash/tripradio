// 이 파일은 반드시 dynamic import({ ssr: false })로만 사용하세요. SSR에서 직접 import 금지!
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import '@/styles/monochrome-map.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { enhancedLocationService, type EnhancedLocationResult } from '@/lib/location/enhanced-location-utils';
import { smartChapterMapper, type ChapterMarkerData, type MappingResult } from '@/lib/coordinates/smart-chapter-mapper';
import type { GuideChapter } from '@/types/guide';

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
  // Enhanced location features
  locationName?: string; // 위치명으로 자동 지오코딩
  enableEnhancedGeocoding?: boolean;
  preferStaticData?: boolean;
  // Smart chapter mapping
  enableSmartMapping?: boolean;
  mappingOptions?: {
    radiusKm?: number;
    qualityThreshold?: number;
    distributionStrategy?: 'sequential' | 'clustered' | 'smart';
  };
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
  // Enhanced features
  locationName,
  enableEnhancedGeocoding = true,
  preferStaticData = false,
  // Smart mapping features
  enableSmartMapping = true,
  mappingOptions = {}
}: MapWithRouteProps) {
  // Enhanced location state
  const [enhancedLocation, setEnhancedLocation] = useState<EnhancedLocationResult | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Smart chapter mapping state
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [chapterMarkers, setChapterMarkers] = useState<ChapterMarkerData[]>([]);
  const [isMappingChapters, setIsMappingChapters] = useState(false);

  // Enhanced location loading effect
  useEffect(() => {
    if (locationName && enableEnhancedGeocoding) {
      setIsLoadingLocation(true);
      setLocationError(null);
      
      enhancedLocationService.findLocation(locationName, {
        preferStatic: preferStaticData,
        language: 'ko'
      })
      .then(result => {
        console.log('📍 Enhanced location found:', result);
        setEnhancedLocation(result);
      })
      .catch(error => {
        console.error('Enhanced location search failed:', error);
        setLocationError(error.message);
      })
      .finally(() => {
        setIsLoadingLocation(false);
      });
    }
  }, [locationName, enableEnhancedGeocoding, preferStaticData]);

  // Smart chapter mapping effect
  useEffect(() => {
    if (chapters && chapters.length > 0 && enableSmartMapping && locationName) {
      setIsMappingChapters(true);
      
      const guideChapters: GuideChapter[] = chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        location: chapter.location ? {
          lat: chapter.location.lat!,
          lng: chapter.location.lng!
        } : undefined,
        lat: chapter.lat,
        lng: chapter.lng,
        latitude: chapter.latitude,
        longitude: chapter.longitude,
        coordinates: chapter.coordinates ? {
          lat: chapter.coordinates.lat!,
          lng: chapter.coordinates.lng!
        } : undefined
      }));

      smartChapterMapper.mapChaptersToCoordinates(guideChapters, {
        baseLocation: locationName,
        radiusKm: mappingOptions.radiusKm || 2,
        qualityThreshold: mappingOptions.qualityThreshold || 0.5,
        distributionStrategy: mappingOptions.distributionStrategy || 'smart',
        enableValidation: true
      })
      .then(result => {
        console.log('🗺️ Smart chapter mapping completed:', result);
        setMappingResult(result);
        
        const markers = smartChapterMapper.convertToMarkerData(result.chapterCoordinates);
        setChapterMarkers(markers);
      })
      .catch(error => {
        console.error('❌ Smart chapter mapping failed:', error);
      })
      .finally(() => {
        setIsMappingChapters(false);
      });
    }
  }, [chapters, enableSmartMapping, locationName, mappingOptions]);

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

  // 스마트 매핑 결과가 있으면 우선 사용
  let allData: any[];
  if (enableSmartMapping && chapterMarkers.length > 0) {
    allData = chapterMarkers.map(marker => ({
      id: marker.id,
      title: marker.title,
      lat: marker.coordinates.lat,
      lng: marker.coordinates.lng,
      originalIndex: marker.id - 1,
      markerType: marker.markerType,
      accuracy: marker.accuracy,
      confidence: marker.confidence,
      tooltip: marker.tooltip,
      validationStatus: marker.validationStatus
    }));
  } else {
    // 기존 방식
    allData = chapters ? (chapters || []) : poisAsChapters;
  }
  
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
    .filter(item => 
      item.lat !== undefined && 
      item.lng !== undefined && 
      !isNaN(item.lat) && 
      !isNaN(item.lng) &&
      item.lat !== 0 && 
      item.lng !== 0
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

  // 지도 중심점 계산 (Enhanced location 우선)
  let mapCenter: LatLngExpression;
  let mapZoom = customZoom;
  let centerInfo = { name: '', accuracy: 0, sources: [] as string[] };

  if (enhancedLocation && !isLoadingLocation) {
    // Enhanced location 우선 사용
    mapCenter = [enhancedLocation.center.lat, enhancedLocation.center.lng];
    mapZoom = mapZoom || enhancedLocation.recommendedZoom;
    centerInfo = {
      name: enhancedLocation.center.name,
      accuracy: enhancedLocation.center.accuracy,
      sources: enhancedLocation.center.sources
    };
  } else if (center && center.lat && center.lng) {
    // 사용자 정의 중심점
    mapCenter = [center.lat, center.lng];
    centerInfo.name = center.name || 'Custom Location';
  } else if (validChapters.length > 0) {
    // 유효한 좌표들의 평균
    const centerLat = validChapters.reduce((sum, chapter) => sum + chapter.lat!, 0) / validChapters.length;
    const centerLng = validChapters.reduce((sum, chapter) => sum + chapter.lng!, 0) / validChapters.length;
    mapCenter = [centerLat, centerLng];
    centerInfo.name = 'Calculated Center';
  } else {
    // 서울 중심가 기본값
    mapCenter = [37.5665, 126.9780];
    centerInfo.name = '서울 중심가';
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

  // Loading 상태 표시 (Enhanced + Smart Mapping)
  if (isLoadingLocation || isMappingChapters) {
    return (
      <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <div className="text-sm text-gray-600">
              {isMappingChapters ? '챕터별 정확한 위치 매핑 중...' : '정확한 위치 검색 중...'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {locationName}
              {isMappingChapters && chapters && ` (${chapters.length}개 챕터)`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error 상태 표시
  if (locationError && enableEnhancedGeocoding) {
    return (
      <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-red-500">
            <div className="text-lg mb-2">⚠️</div>
            <div className="text-sm">위치 검색 실패</div>
            <div className="text-xs mt-1 text-gray-500">{locationError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white">
      <MapContainer 
        {...({center: mapCenter, zoom} as any)}
        className="w-full h-full monochrome-map-container"
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ filter: 'grayscale(1) contrast(1.2) brightness(1.1)' }}
      >
        <TileLayer
          {...({
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            className: "monochrome-map"
          } as any)}
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
      
      {/* Enhanced 지도 하단 정보 */}
      <div className="bg-black/2 px-4 py-3 text-xs font-medium border-t border-black/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="text-black/80">{validChapters.length}개 지점</span>
            {enhancedLocation && (
              <div className="flex items-center gap-1 ml-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-green-700">
                  정확도 {Math.round(centerInfo.accuracy * 100)}%
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-black/60">
              {activeChapterData ? 
                `현재: ${activeChapterData.title}` : 
                centerInfo.name || '위치를 선택해주세요'
              }
            </div>
            {enhancedLocation && centerInfo.sources.length > 0 && (
              <div className="text-xs text-black/40 mt-0.5">
                {centerInfo.sources.join(', ')} • {enhancedLocation.dataSource}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
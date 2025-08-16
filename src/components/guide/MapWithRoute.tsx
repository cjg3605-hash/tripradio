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
  guideId?: string;
}

// 단순한 지도 이동 훅
function useMapFlyTo(mapRef: React.RefObject<LeafletMap | null>, lat?: number, lng?: number) {
  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;
    
    const map = mapRef.current;
    if (map && typeof map.flyTo === 'function') {
      map.flyTo([lat, lng], 16, { duration: 0.7 });
    }
  }, [mapRef, lat, lng]);
}

// 좌표 추출 유틸리티 - guides.coordinates 컬럼 전용 (강화된 매칭 로직)
function getLatLng(chapter: Chapter, guideCoordinates?: any, chapterIndex?: number): [number | undefined, number | undefined] {
  // guides.coordinates 컬럼에서만 좌표 사용 (content 좌표 사용 금지)
  if (guideCoordinates?.length > 0) {
    // 다중 매칭 전략: 인덱스 > ID > step > title 기반 (인덱스 우선)
    let coord;
    
    // 1순위: 인덱스 기반 매칭 (가장 정확)
    if (chapterIndex !== undefined && guideCoordinates[chapterIndex]) {
      coord = guideCoordinates[chapterIndex];
    }
    // 2순위: ID/step/title 기반 매칭 (다양한 패턴 지원)
    else {
      coord = guideCoordinates.find((c: any) => 
        c.id === chapter.id || 
        c.step === chapter.id || 
        c.chapterId === chapter.id ||
        c.title === chapter.title ||
        (c.step - 1) === chapter.id || // 0-based vs 1-based 인덱스 보정
        (c.step === (chapterIndex ?? -1) + 1) || // step은 1-based
        (c.order === chapterIndex) || // order 기반 매칭
        (c.sequence === chapterIndex) // sequence 기반 매칭
      );
    }
    
    // 3순위: 제목 유사도 기반 매칭 (fallback)
    if (!coord && chapter.title) {
      coord = guideCoordinates.find((c: any) => {
        if (!c.title) return false;
        const chapterTitle = chapter.title.toLowerCase().trim();
        const coordTitle = c.title.toLowerCase().trim();
        return chapterTitle.includes(coordTitle) || coordTitle.includes(chapterTitle);
      });
    }
    
    if (coord) {
      const lat = coord.lat ?? coord.latitude;
      const lng = coord.lng ?? coord.longitude;
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
  }

  // guides.coordinates가 없으면 좌표 없음으로 처리 (content 좌표 사용 안 함)
  return [undefined, undefined];
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
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(true);
  const [coordinatesSignal, setCoordinatesSignal] = useState(0);
  const mapRef = useRef<LeafletMap | null>(null);

  // 🎯 단순 좌표 상태 관리 - 폴링 시스템 제거
  useEffect(() => {
    const hasCoordinates = guideCoordinates && guideCoordinates.length > 0;
    const hasChapters = chapters && chapters.length > 0;
    
    if (hasCoordinates) {
      console.log(`✅ 좌표 데이터 확인됨: ${guideCoordinates.length}개`);
      setIsLoadingCoordinates(false);
      setCoordinatesSignal(prev => prev + 1);
    } else if (hasChapters) {
      console.log(`⏳ 좌표 대기 중... (${chapters.length}개 챕터)`);
      setIsLoadingCoordinates(true);
    }
  }, [guideCoordinates?.length, chapters?.length]);

  // 🎯 신호 기반 데이터 정규화 - 좌표 변경 신호에 반응
  const validChapters = useMemo(() => {
    console.log(`🔄 지도 데이터 재계산 (신호: ${coordinatesSignal})`);
    
    // guideCoordinates 사용
    const coordinates = guideCoordinates;
    
    // POI를 Chapter 형태로 변환
    const allData = chapters?.length ? chapters : (pois || []).map((poi, index) => ({
      id: parseInt(poi.id.replace(/\D/g, '')) || index,
      title: poi.name,
      lat: poi.lat,
      lng: poi.lng,
      originalIndex: index
    }));

    // 유효한 좌표만 필터링
    const filtered = allData
      .map((item, index) => {
        const [lat, lng] = chapters ? getLatLng(item, coordinates, index) : [item.lat, item.lng];
        return { ...item, originalIndex: index, lat, lng };
      })
      .filter(item => 
        item.lat !== undefined && item.lng !== undefined &&
        !isNaN(item.lat) && !isNaN(item.lng) &&
        item.lat >= -90 && item.lat <= 90 &&
        item.lng >= -180 && item.lng <= 180
      );
    
    console.log(`📍 유효한 좌표 ${filtered.length}개 발견`);
    return filtered;
  }, [chapters, pois, guideCoordinates, coordinatesSignal]);

  // 활성 챕터 데이터 찾기
  const activeChapterData = validChapters.find(c => c.originalIndex === activeChapter);

  // 🎯 확장된 타임아웃 처리 - 다양한 상황에서 5초 후 로딩 해제
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    // 상황 1: 좌표는 있지만 매칭이 안 되는 경우
    if (guideCoordinates?.length > 0 && chapters && chapters.length > 0 && validChapters.length === 0) {
      timeoutId = setTimeout(() => {
        setIsLoadingCoordinates(false);
      }, 5000);
    }
    // 상황 2: 챕터는 있지만 좌표가 전혀 없는 경우 (좌표 생성 실패 대비)
    else if (!guideCoordinates?.length && chapters && chapters.length > 0 && isLoadingCoordinates) {
      timeoutId = setTimeout(() => {
        setIsLoadingCoordinates(false);
      }, 8000); // 좌표 생성 + 5초 새로고침을 고려해 8초로 설정
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [guideCoordinates?.length, chapters?.length, validChapters.length, isLoadingCoordinates]);

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

  // 🎯 신호 기반 지도 자동 이동 - 좌표 변경 신호에 즉시 반응
  useEffect(() => {
    if (!isLoadingCoordinates && validChapters.length > 0 && coordinatesSignal > 0) {
      const firstChapter = validChapters[0];
      
      const timer = setTimeout(() => {
        const map = mapRef.current;
        if (map && typeof map.flyTo === 'function') {
          map.flyTo([firstChapter.lat!, firstChapter.lng!], 15, { 
            duration: 1.5,
            easeLinearity: 0.1 
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [coordinatesSignal, isLoadingCoordinates, validChapters]); // 신호 우선 의존성

  // 지도가 로드된 후 활성 마커로 중심 이동
  useEffect(() => {
    if (activeChapterData && mapRef.current && !isLoadingCoordinates) {
      const timer = setTimeout(() => {
        const map = mapRef.current;
        if (map && typeof map.flyTo === 'function') {
          map.flyTo([activeChapterData.lat!, activeChapterData.lng!], 16, { 
            duration: 1,
            easeLinearity: 0.2 
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeChapterData, isLoadingCoordinates]);

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

  // 로딩 조건 - 좌표가 없을 때만 로딩
  if (isLoadingCoordinates && chapters && chapters.length > 0) {
    const hasCoordinates = guideCoordinates?.length > 0;
    const isMatching = hasCoordinates && validChapters.length === 0;
    
    
    return (
      <div className="w-full h-64 bg-gray-50 flex items-center justify-center rounded-lg border border-gray-200">
        <div className="text-center text-gray-500">
          {isMatching ? (
            <>
              <div className="text-sm font-medium mb-3">좌표 연결 중</div>
              <div className="flex items-center justify-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium mb-3">지도 생성 중</div>
              <div className="flex items-center justify-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
            </>
          )}
          <div className="text-xs mt-2 text-gray-400">
            좌표 생성 중...
          </div>
        </div>
      </div>
    );
  }

  // 좌표가 정말 없는 경우 (POI도 chapters도 없음)
  if (validChapters.length === 0) {
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

  // 좌표 변경 시 지도 리렌더링을 위한 유니크 키
  const mapKey = `map-${locationName}-${validChapters.length}-${activeChapter || 0}-${coordinatesSignal}`;

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
          
          if (mapRef.current && validChapters.length > 0) {
            const targetChapter = activeChapterData || validChapters[0];
            console.log(`📍 초기 위치: ${targetChapter.title}`);
            
            setTimeout(() => {
              const map = mapRef.current;
              if (map && typeof map.flyTo === 'function') {
                map.flyTo([targetChapter.lat!, targetChapter.lng!], 15, { 
                  duration: 1.2,
                  easeLinearity: 0.15
                });
              }
            }, 200);
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
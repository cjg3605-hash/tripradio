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
  // logger.map.interaction 대신 임시로 직접 로깅 (향후 logger 통합 예정)
  console.log(`🔍 [getLatLng] 좌표 추출 시작:`, {
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    chapterIndex,
    hasGuideCoordinates: !!(guideCoordinates?.length > 0),
    coordinatesCount: guideCoordinates?.length || 0
  });
  
  // guides.coordinates 컬럼에서만 좌표 사용 (content 좌표 사용 금지)
  if (guideCoordinates?.length > 0) {
    // 개선된 좌표 매칭 로직: 단순화 및 효율성 향상
    let coord;
    let matchMethod = 'none';
    
    // 디버깅: 실제 데이터 구조 확인
    console.log(`🔬 [getLatLng] 좌표 데이터 구조 분석:`, {
      firstCoord: guideCoordinates[0],
      coordsStructure: guideCoordinates.map((c: any, i: number) => ({
        index: i,
        id: c?.id,
        step: c?.step, 
        title: c?.title,
        lat: c?.lat,
        lng: c?.lng
      }))
    });
    
    // 1순위: 인덱스 기반 매칭 (가장 신뢰성 높음)
    if (chapterIndex !== undefined && chapterIndex >= 0 && chapterIndex < guideCoordinates.length) {
      const indexCoord = guideCoordinates[chapterIndex];
      if (indexCoord && (indexCoord.lat || indexCoord.latitude) && (indexCoord.lng || indexCoord.longitude)) {
        coord = indexCoord;
        matchMethod = 'index';
      }
    }
    
    // 2순위: 단순 ID 매칭 (복잡한 조건 제거)
    if (!coord) {
      coord = guideCoordinates.find((c: any) => 
        c.id === chapter.id || c.step === chapter.id
      );
      if (coord) matchMethod = 'id_match';
    }
    
    // 3순위: 순차적 매칭 (첫 번째 사용 가능한 좌표)
    if (!coord) {
      coord = guideCoordinates.find((c: any) => 
        c && (c.lat || c.latitude) && (c.lng || c.longitude)
      );
      if (coord) matchMethod = 'first_available';
    }
    
    // 좌표 추출 및 검증
    if (coord) {
      const lat = coord.lat ?? coord.latitude;
      const lng = coord.lng ?? coord.longitude;
      
      // 엄격한 좌표 유효성 검사
      if (typeof lat === 'number' && typeof lng === 'number' && 
          !isNaN(lat) && !isNaN(lng) &&
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        
        console.log(`✅ [getLatLng] 좌표 매칭 성공 (${matchMethod}):`, {
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterIndex,
          coordId: coord.id,
          coordTitle: coord.title,
          lat, lng
        });
        return [lat, lng];
      } else {
        console.log(`❌ [getLatLng] 좌표 유효성 검사 실패:`, { 
          lat, lng, 
          latType: typeof lat, 
          lngType: typeof lng,
          coord 
        });
      }
    } else {
      console.log(`❌ [getLatLng] 매칭된 좌표 없음 - 모든 매칭 전략 실패`);
    }
  } else {
    console.log(`❌ [getLatLng] guideCoordinates 없음 또는 비어있음:`, {
      hasGuideCoordinates: !!guideCoordinates,
      isArray: Array.isArray(guideCoordinates),
      length: guideCoordinates?.length
    });
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
  const mapRef = useRef<LeafletMap | null>(null);


  // 🎯 단순 데이터 정규화 - 즉시 처리
  const validChapters = useMemo(() => {
    console.log(`🔄 지도 데이터 계산 시작:`, {
      chaptersCount: chapters?.length || 0,
      poisCount: pois?.length || 0,
      hasGuideCoordinates: !!(guideCoordinates?.length > 0),
      guideCoordinatesCount: guideCoordinates?.length || 0
    });
    
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

    console.log(`📊 처리할 데이터:`, {
      totalItems: allData.length,
      sampleItem: allData[0],
      usingChapters: !!chapters?.length,
      coordinatesAvailable: !!(coordinates?.length > 0)
    });

    // 유효한 좌표만 필터링
    const filtered = allData
      .map((item, index) => {
        const [lat, lng] = chapters ? getLatLng(item, coordinates, index) : [item.lat, item.lng];
        console.log(`🗂️ 아이템 ${index}: "${item.title}" -> 좌표: ${lat}, ${lng}`);
        return { ...item, originalIndex: index, lat, lng };
      })
      .filter(item => 
        item.lat !== undefined && item.lng !== undefined &&
        !isNaN(item.lat) && !isNaN(item.lng) &&
        item.lat >= -90 && item.lat <= 90 &&
        item.lng >= -180 && item.lng <= 180
      );
    
    console.log(`📍 유효한 좌표 ${filtered.length}개 발견:`, 
      filtered.map(item => ({
        id: item.id,
        title: item.title,
        lat: item.lat,
        lng: item.lng
      }))
    );
    return filtered;
  }, [chapters, pois, guideCoordinates]);

  // 활성 챕터 데이터 찾기
  const activeChapterData = validChapters.find(c => c.originalIndex === activeChapter);


  // 지도 중심점 계산 - id:0 챕터(첫 번째 챕터) 우선 표시
  const mapCenter: LatLngExpression = (() => {
    // 1순위: 명시적으로 전달된 center 사용
    if (center && center.lat && center.lng) {
      console.log('🎯 지도 중심: 명시적 center 사용', center);
      return [center.lat, center.lng];
    }
    
    // 2순위: activeChapter가 있으면 해당 위치 중심
    if (activeChapterData && activeChapterData.lat && activeChapterData.lng) {
      console.log('🎯 지도 중심: 활성 챕터 사용', activeChapterData);
      return [activeChapterData.lat, activeChapterData.lng];
    }
    
    // 3순위: id:0 챕터(첫 번째 챕터) 우선 사용
    if (validChapters.length > 0) {
      const firstChapter = validChapters.find(ch => ch.id === 0 || ch.originalIndex === 0) || validChapters[0];
      if (firstChapter && firstChapter.lat && firstChapter.lng) {
        console.log('🎯 지도 중심: id:0 챕터 우선 사용', firstChapter);
        return [firstChapter.lat, firstChapter.lng];
      }
      
      // 4순위: 전체 챕터 평균 중심점
      const avgLat = validChapters.reduce((sum, ch) => sum + ch.lat!, 0) / validChapters.length;
      const avgLng = validChapters.reduce((sum, ch) => sum + ch.lng!, 0) / validChapters.length;
      console.log('🎯 지도 중심: 평균 중심점 사용', { lat: avgLat, lng: avgLng });
      return [avgLat, avgLng];
    }
    
    // 최종 기본값
    console.log('🎯 지도 중심: 서울 기본값 사용');
    return [37.5665, 126.9780]; // 서울 기본값
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

  // 활성 챕터로 지도 이동
  useMapFlyTo(mapRef, activeChapterData?.lat, activeChapterData?.lng);


  // 지도가 로드된 후 활성 마커로 중심 이동
  useEffect(() => {
    if (activeChapterData && mapRef.current) {
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
  }, [activeChapterData]);

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
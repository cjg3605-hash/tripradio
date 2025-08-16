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
  guideId?: string; // 폴링용 가이드 ID 추가
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
  guideCoordinates,
  guideId
}) => {
  const { currentLanguage } = useLanguage();
  const geolocation = useSimpleGeolocation();
  const [showMyLocation, setShowMyLocation] = useState(false);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(true);
  const [lastCoordinatesLength, setLastCoordinatesLength] = useState(0);
  const [coordinatesSignal, setCoordinatesSignal] = useState(0); // 좌표 변경 신호
  const [polledCoordinates, setPolledCoordinates] = useState<any[]>([]); // 폴링된 좌표 데이터
  const [isPollingActive, setIsPollingActive] = useState(false); // 폴링 상태 관리
  const mapRef = useRef<LeafletMap | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 🔄 실시간 좌표 폴링 시스템 - 데이터베이스에서 좌표 생성 감지
  useEffect(() => {
    if (!guideId || !chapters?.length) {
      console.log(`❌ 폴링 시작 조건 불충족: guideId=${!!guideId}, chapters=${chapters?.length || 0}`);
      return;
    }
    
    // 🚨 중요: 이미 좌표가 있거나 폴링 중이면 시작하지 않음
    const existingCoordinates = polledCoordinates.length > 0 || (guideCoordinates && guideCoordinates.length > 0);
    if (existingCoordinates) {
      console.log(`✅ 폴링 불필요 - 이미 좌표 존재: polled=${polledCoordinates.length}, props=${guideCoordinates?.length || 0}`);
      return;
    }
    
    if (isPollingActive) {
      console.log(`⚠️ 폴링 중복 방지 - 이미 활성화됨`);
      return;
    }
    
    console.log(`🔄 좌표 폴링 시작: guideId=${guideId}, chapters=${chapters.length}개`);
    setIsPollingActive(true);
    
    const startPolling = () => {
      pollingRef.current = setInterval(async () => {
        try {
          console.log(`🔍 좌표 폴링 중... (${new Date().toLocaleTimeString()})`);
          const response = await fetch(`/api/guides/${guideId}/coordinates`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`📡 폴링 응답:`, { success: data.success, count: data.coordinates?.length || 0 });
            
            if (data.success && data.coordinates?.length > 0) {
              console.log(`🎯 폴링으로 좌표 발견! ${data.coordinates.length}개`);
              setPolledCoordinates(data.coordinates);
              setIsLoadingCoordinates(false);
              setCoordinatesSignal(prev => prev + 1);
              
              // 폴링 완전 중단
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
                setIsPollingActive(false);
                console.log(`✅ 폴링 완료 - 좌표 발견으로 영구 중단`);
              }
            }
          }
        } catch (error) {
          console.warn('📡 폴링 오류:', error);
        }
      }, 2000); // 2초마다 폴링
    };
    
    // 즉시 폴링 시작
    startPolling();
    
    // 10초 후 타임아웃
    const timeoutId = setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsPollingActive(false);
        console.log(`⏰ 폴링 타임아웃 - 10초 후 중단`);
      }
    }, 10000);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        setIsPollingActive(false);
        console.log(`🧹 폴링 정리 - 컴포넌트 정리`);
      }
      clearTimeout(timeoutId);
    };
  }, [guideId, chapters?.length, polledCoordinates.length, guideCoordinates?.length, isPollingActive, guideCoordinates]);

  // 🎯 좌표 변경 감지 시스템 - props 또는 폴링 데이터 감지
  useEffect(() => {
    // 폴링된 좌표 우선 사용, 없으면 props 좌표 사용
    const coordinates = polledCoordinates.length > 0 ? polledCoordinates : guideCoordinates;
    const currentLength = coordinates?.length || 0;
    const hasChapters = chapters?.length > 0;
    
    console.log(`🗺️ 좌표 감지: length=${currentLength}, hasChapters=${hasChapters}, source=${polledCoordinates.length > 0 ? 'polling' : 'props'}`);
    
    if (currentLength > 0 && currentLength !== lastCoordinatesLength) {
      // 새로운 좌표가 감지되면 신호 발송
      console.log(`✅ 새 좌표 감지됨! ${lastCoordinatesLength} → ${currentLength}`);
      setIsLoadingCoordinates(false);
      setLastCoordinatesLength(currentLength);
      setCoordinatesSignal(prev => prev + 1); // 지도 리렌더링 신호
    } else if (hasChapters && currentLength === 0) {
      // 챕터는 있지만 좌표가 없으면 로딩 상태
      console.log(`⏳ 좌표 대기 중...`);
      setIsLoadingCoordinates(true);
    }
  }, [polledCoordinates, guideCoordinates, chapters?.length, lastCoordinatesLength]);

  // 🎯 신호 기반 데이터 정규화 - 좌표 변경 신호에 반응
  const validChapters = useMemo(() => {
    console.log(`🔄 지도 데이터 재계산 (신호: ${coordinatesSignal})`);
    
    // 폴링된 좌표 우선 사용, 없으면 props 좌표 사용
    const coordinates = polledCoordinates.length > 0 ? polledCoordinates : guideCoordinates;
    
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
    
    console.log(`📍 유효한 좌표 ${filtered.length}개 발견 (source: ${polledCoordinates.length > 0 ? 'polling' : 'props'})`);
    return filtered;
  }, [chapters, pois, polledCoordinates, guideCoordinates, coordinatesSignal]); // 폴링 좌표 의존성 추가

  // 활성 챕터 데이터 찾기
  const activeChapterData = validChapters.find(c => c.originalIndex === activeChapter);

  // 매칭 실패 시 타임아웃 처리 (단순화)
  useEffect(() => {
    if (guideCoordinates?.length > 0 && chapters?.length > 0 && validChapters.length === 0) {
      // 5초 후에도 매칭이 안 되면 로딩 해제
      const timeoutId = setTimeout(() => {
        setIsLoadingCoordinates(false);
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [guideCoordinates?.length, chapters?.length, validChapters.length]);

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
      console.log(`🎯 좌표 신호 받음! 첫 번째 마커로 이동: ${firstChapter.title}`);
      
      const timer = setTimeout(() => {
        const map = mapRef.current;
        if (map && typeof map.flyTo === 'function') {
          map.flyTo([firstChapter.lat!, firstChapter.lng!], 15, { 
            duration: 1.5,
            easeLinearity: 0.1 
          });
        }
      }, 300); // 더 빠른 반응

      return () => clearTimeout(timer);
    }
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
  }, [activeChapterData, isLoadingCoordinates]);

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

  // 🎯 신호 기반 로딩 조건 - 좌표 신호를 받을 때까지 로딩
  if (isLoadingCoordinates && chapters?.length > 0) {
    const coordinates = polledCoordinates.length > 0 ? polledCoordinates : guideCoordinates;
    const hasCoordinates = coordinates?.length > 0;
    const isMatching = hasCoordinates && validChapters.length === 0;
    const isPolling = pollingRef.current !== null;
    
    console.log(`💭 로딩 화면 표시: coordinates=${hasCoordinates}, matching=${isMatching}, polling=${isPolling}`);
    
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
              <div className="text-sm font-medium mb-3">
                {isPolling ? '좌표 생성 감지 중' : '지도 생성 중'}
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
            </>
          )}
          <div className="text-xs mt-2 text-gray-400">
            {isPolling ? '데이터베이스 폴링 중...' : '신호 대기 중...'}
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

  // 🎯 신호 기반 유니크 키 생성 - 좌표 변경 시 지도 리렌더링
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
          // 🎯 지도 초기화 완료 시 신호 기반 위치 이동
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
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
  guideCoordinates?: any; // Supabase coordinates 컬럼 데이터
}

function MapFlyTo({ lat, lng, onMoveComplete }: { lat: number; lng: number; onMoveComplete?: () => void }): null {
  const map = (useMap as any)();
  
  useEffect(() => {
    // 🔥 강력한 안전성 검사: map 인스턴스와 flyTo 메서드 존재 확인
    if (!lat || !lng || !map) {
      console.warn('⚠️ MapFlyTo: 필수 조건 미충족', { lat, lng, hasMap: !!map });
      return undefined;
    }
    
    // 지도 인스턴스가 완전히 초기화되었는지 확인
    if (typeof map.flyTo !== 'function') {
      console.warn('⚠️ MapFlyTo: map.flyTo 메서드를 사용할 수 없음', { mapType: typeof map, mapKeys: Object.keys(map || {}) });
      return undefined;
    }
    
    // 지도가 준비 상태인지 확인 (leaflet 특화) + 강화된 재시도 로직
    if (!map._container || !map._loaded || typeof map.flyTo !== 'function') {
      console.warn('⚠️ MapFlyTo: 지도가 아직 준비되지 않음', { 
        hasContainer: !!map._container, 
        isLoaded: !!map._loaded,
        hasFlyTo: typeof map.flyTo === 'function'
      });
      
      // 강화된 재시도 로직: 최대 5번, 점진적 지연
      let retryCount = 0;
      const maxRetries = 5;
      
      const tryFlyTo = () => {
        retryCount++;
        console.log(`🔄 MapFlyTo 재시도 ${retryCount}/${maxRetries}`);
        
        if (map && map._container && map._loaded && typeof map.flyTo === 'function') {
          console.log('✅ MapFlyTo: 재시도 성공!');
          try {
            map.flyTo([lat, lng], 16, { duration: 0.7 });
            if (onMoveComplete) {
              setTimeout(onMoveComplete, 700);
            }
          } catch (error) {
            console.error('❌ MapFlyTo 재시도 중 에러:', error);
          }
          return;
        }
        
        if (retryCount < maxRetries) {
          // 점진적 지연: 100ms, 200ms, 400ms, 800ms, 1600ms
          const delay = 100 * Math.pow(2, retryCount - 1);
          console.log(`⏰ ${delay}ms 후 재시도 예정`);
          setTimeout(tryFlyTo, delay);
        } else {
          console.error('❌ MapFlyTo: 최대 재시도 횟수 초과, flyTo 실패');
        }
      };
      
      const retryTimer = setTimeout(tryFlyTo, 100);
      return () => clearTimeout(retryTimer);
    }
    
    try {
      console.log('🗺️ MapFlyTo: 안전한 flyTo 실행', { lat, lng, mapReady: true });
      map.flyTo([lat, lng], 16, { duration: 0.7 });
      
      // 이동 완료 콜백 실행
      if (onMoveComplete) {
        const timer = setTimeout(() => {
          onMoveComplete();
        }, 700); // flyTo duration과 맞춤
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('❌ MapFlyTo 실행 오류:', error);
      // 에러 발생 시에도 재시도 로직 적용
      const fallbackTimer = setTimeout(() => {
        if (map && typeof map.flyTo === 'function') {
          try {
            console.log('🔄 MapFlyTo: 에러 후 재시도');
            map.flyTo([lat, lng], 16, { duration: 0.7 });
            if (onMoveComplete) {
              setTimeout(onMoveComplete, 700);
            }
          } catch (retryError) {
            console.error('❌ MapFlyTo 재시도도 실패:', retryError);
          }
        }
      }, 500);
      return () => clearTimeout(fallbackTimer);
    }
    
    return undefined;
  }, [lat, lng, map, onMoveComplete]);
  
  return null;
}

// === 🎯 기본 Leaflet 마커 사용 ===
// 복잡한 SVG 마커 제거 - 기본 빨간 핀 마커만 사용

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
    // 🔥 안전한 지도 이동: 지도 준비 상태 확인
    if (geolocation.latitude && geolocation.longitude && map && 
        typeof map.flyTo === 'function' && map._container && map._loaded) {
      try {
        console.log('📍 내 위치로 안전한 지도 이동:', { lat: geolocation.latitude, lng: geolocation.longitude });
        map.flyTo([geolocation.latitude, geolocation.longitude], 17, { duration: 1 });
      } catch (error) {
        console.error('❌ 내 위치 지도 이동 오류:', error);
      }
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
  locationName,
  guideCoordinates
}: MapWithRouteProps) {
  
  const { currentLanguage } = useLanguage();
  
  // GPS 위치 추적
  const geolocation = useSimpleGeolocation();
  const [showMyLocation, setShowMyLocation] = useState(false);
  
  // 지도 중심 자동 이동을 위한 상태
  const [hasAutoMoved, setHasAutoMoved] = useState(false);

  // 🔥 React Hook 규칙 준수: 모든 훅을 조건부 return 전에 호출
  // 🔥 안정적인 키 생성 (Math.random 제거하여 예측 가능하게)
  const mapId = useMemo(() => {
    const timestamp = Date.now();
    const hash = `${locationName || 'default'}-${currentLanguage || 'en'}-${timestamp}`;
    return hash.replace(/[^a-zA-Z0-9-]/g, '-');
  }, [locationName, currentLanguage]);
  
  const stableMapKey = useMemo(() => {
    const contentHash = `${chapters?.length || 0}-${pois?.length || 0}-${activeChapter || 0}`;
    return `map-${mapId}-${contentHash}`;
  }, [mapId, chapters?.length, pois?.length, activeChapter]);

  // 🔥 DOM 컨테이너 참조
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // 🔥 강력한 지도 정리 함수 (개선된 버전)
  const cleanupMap = useCallback(() => {
    try {
      // 지도 인스턴스 정리
      if (mapInstanceRef.current) {
        // 모든 이벤트 리스너 제거
        mapInstanceRef.current.off();
        // 지도 인스턴스 제거
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      // DOM 컨테이너 정리 
      if (mapContainerRef.current) {
        const container = mapContainerRef.current;
        
        // 모든 하위 요소 제거
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        
        // Leaflet 관련 속성 정리
        delete (container as any)._leaflet_id;
        delete (container as any)._leaflet;
        delete (container as any)._leaflet_pos;
        
        // 클래스와 스타일 초기화
        container.className = container.className.replace(/leaflet-[^\s]*/g, '');
        container.style.cssText = 'width: 100%; height: 100%;';
      }
    } catch (error) {
      console.warn('지도 정리 중 오류:', error);
    }
  }, []);

  // 🔥 강화된 초기화 상태 추적 (중복 초기화 방지)
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(() => `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const isInitializedRef = useRef(false);
  const containerIdRef = useRef(`map-container-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
  const renderCountRef = useRef(0); // 렌더링 횟수 추적

  // 🔥 컴포넌트 마운트/언마운트 시 정리 (강화) - 완전한 새 인스턴스 생성
  useEffect(() => {
    // 렌더링 횟수 증가
    renderCountRef.current += 1;
    
    // 지도 준비 완료 - 완전히 새로운 인스턴스 생성
    const timer = setTimeout(() => {
      // 새로운 지도 키 생성으로 완전한 재생성 보장
      setMapKey(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      setIsMapReady(true);
    }, 200); // 충분한 지연으로 이전 인스턴스 정리 보장
    
    return () => {
      clearTimeout(timer);
      // 언마운트 시에만 정리 (Strict Mode 대응)
      setIsMapReady(false);
      cleanupMap();
      isInitializedRef.current = false;
      
      // 연속된 컨테이너 ID 새로 생성
      containerIdRef.current = `map-container-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    };
  }, []); // 의존성 배열 비움으로 마운트/언마운트 시에만 실행

  // 🎯 POI/챕터 데이터 로드 완료 시 자동으로 첫 번째 마커로 지도 이동
  useEffect(() => {
    // 이미 자동 이동했거나 중심점이 명시적으로 설정된 경우 스킵
    if (hasAutoMoved || (center && center.lat && center.lng)) {
      return;
    }

    // POI 데이터가 있는 경우
    if (pois && pois.length > 0 && pois[0].lat && pois[0].lng) {
      console.log('🎯 POI 데이터 로드 완료 - 첫 번째 마커로 지도 이동:', pois[0]);
      setHasAutoMoved(true);
      return;
    }

    // 챕터 데이터가 있는 경우
    if (chapters && chapters.length > 0) {
      const firstChapter = chapters[0];
      const [lat, lng] = getLatLng(firstChapter, guideCoordinates);
      if (lat && lng) {
        console.log('🎯 챕터 데이터 로드 완료 - 첫 번째 마커로 지도 이동:', { title: firstChapter.title, lat, lng });
        setHasAutoMoved(true);
        return;
      }
    }
  }, [pois, chapters, guideCoordinates, hasAutoMoved, center]);

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
  console.log('🗺️ MapWithRoute 렌더링 (최적화됨):', {
    chaptersCount: chapters?.length || 0,
    poisCount: pois?.length || 0,
    hasCenter: !!center,
    locationName,
    userLocation: showMyLocation ? 'enabled' : 'disabled',
    hasGuideCoordinates: !!(guideCoordinates && Array.isArray(guideCoordinates) && guideCoordinates.length > 0)
  });

  // 좌표 추출 함수 개선 (coordinates 컬럼 우선 사용)
  const getLatLng = (chapter: Chapter, guideCoordinates?: any): [number | undefined, number | undefined] => {
    let lat: number | undefined;
    let lng: number | undefined;

    // 1. 먼저 Supabase coordinates 컬럼에서 해당 챕터의 좌표 찾기
    if (guideCoordinates && Array.isArray(guideCoordinates)) {
      const chapterCoord = guideCoordinates.find((coord: any) => 
        coord.id === chapter.id || 
        coord.step === chapter.id || 
        coord.chapterId === chapter.id ||
        coord.title === chapter.title
      );
      
      if (chapterCoord) {
        lat = chapterCoord.lat ?? chapterCoord.latitude;
        lng = chapterCoord.lng ?? chapterCoord.longitude;
        console.log(`📍 coordinates 컬럼에서 좌표 발견 (${chapter.title}):`, { lat, lng });
      }
    }

    // 2. coordinates 컬럼에서 찾지 못했다면 기존 로직 사용
    if (lat === undefined || lng === undefined) {
      lat = chapter.location?.lat ?? 
            chapter.coordinates?.lat ?? 
            chapter.lat ?? 
            chapter.latitude;
            
      lng = chapter.location?.lng ?? 
            chapter.coordinates?.lng ?? 
            chapter.lng ?? 
            chapter.longitude;
    }
                 
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
        const [lat, lng] = getLatLng(item, guideCoordinates);
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
            key={`default-map-${containerIdRef.current}`}
            center={[center.lat, center.lng]}
            zoom={customZoom || 15}
            className="w-full h-full"
            scrollWheelZoom={true}
            zoomControl={true}
            style={{ width: '100%', height: '100%' }}
            whenCreated={(mapInstance) => {
              try {
                // 기존 인스턴스가 있다면 정리
                if (mapInstanceRef.current && mapInstanceRef.current !== mapInstance) {
                  mapInstanceRef.current.off();
                  mapInstanceRef.current.remove();
                }
                mapInstanceRef.current = mapInstance;
                console.log('🗺️ 지도 인스턴스 생성 완료:', mapId);
              } catch (error) {
                console.warn('지도 인스턴스 설정 중 오류:', error);
              }
            }}
          >
            {/* 🌍 Google Maps 스타일 타일 (언어별 동적 로딩) */}
            <TileLayer
              key={currentLanguage}
              url={getGoogleMapsUrl(currentLanguage)}
              attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              maxZoom={20}
            />
            
            {/* 중심점 마커 - 기본 빨간 핀 사용 */}
            <Marker
              position={[center.lat, center.lng]}
              // 기본 Leaflet 빨간 핀 마커 사용 (icon 속성 제거)
            >
              <Tooltip 
                direction="top"
                offset={[0, -20]}
                opacity={0.9}
                permanent={false}
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
    // 기본값 - center prop가 있으면 우선 사용, 없으면 null 반환하여 지도를 렌더링하지 않음
    if (center && center.lat && center.lng) {
      mapCenter = [center.lat, center.lng];
    } else {
      // 유효한 중심점이 없으면 지도를 렌더링하지 않음
      return (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center text-gray-500">
            <div className="text-lg mb-2">📍</div>
            <div>위치 정보를 불러오는 중...</div>
            <div className="text-sm mt-1">정확한 좌표를 확인하고 있습니다</div>
          </div>
        </div>
      );
    }
  }

  // 활성 챕터의 좌표 (지도 이동용)
  const activeChapterData = validChapters.find(c => c.originalIndex === activeChapter);
  const activeLat = activeChapterData?.lat;
  const activeLng = activeChapterData?.lng;

  // 🎯 자동 이동용 좌표 계산 - 첫 번째 마커로 이동
  const autoMoveLat = validChapters.length > 0 ? validChapters[0].lat : undefined;
  const autoMoveLng = validChapters.length > 0 ? validChapters[0].lng : undefined;

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

  // 실제 지도 렌더링 - 조건부 렌더링으로 중복 초기화 방지
  
  if (!isMapReady) {
    return (
      <div 
        className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white flex items-center justify-center"
      >
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm">지도 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef}
      id={containerIdRef.current}
      key={containerIdRef.current}
      className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg shadow-black/10 border border-black/8 bg-white"
    >
      <MapContainer 
        key={mapKey} // 🛡️ 완전히 새로운 지도 인스턴스 보장
        center={mapCenter}
        zoom={zoom}
        className="w-full h-full"
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
        whenCreated={(mapInstance) => {
          try {
            // 기존 인스턴스가 있다면 정리
            if (mapInstanceRef.current && mapInstanceRef.current !== mapInstance) {
              mapInstanceRef.current.off();
              mapInstanceRef.current.remove();
            }
            mapInstanceRef.current = mapInstance;
            console.log('🗺️ 메인 지도 인스턴스 생성 완료:', stableMapKey);
          } catch (error) {
            console.warn('메인 지도 인스턴스 설정 중 오류:', error);
          }
        }}
      >
        {/* 🌍 Google Maps 스타일 (언어별 동적 로딩) */}
        <TileLayer
          key={currentLanguage} // 언어 변경 시 타일 다시 로드
          url={getGoogleMapsUrl(currentLanguage)}
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          maxZoom={20}
        />
        
        {/* 🎯 지능형 지도 이동: 활성 챕터 우선, 없으면 자동 이동 */}
        {(() => {
          // 우선순위 1: 활성 챕터가 있으면 해당 위치로 이동
          if (activeLat && activeLng) {
            console.log('🎯 활성 챕터 위치로 이동:', { activeLat, activeLng, chapter: activeChapter });
            return <MapFlyTo lat={activeLat} lng={activeLng} />;
          }
          
          // 우선순위 2: 자동 이동이 아직 안 됐고 첫 번째 마커가 있으면 이동
          if (!hasAutoMoved && autoMoveLat && autoMoveLng) {
            console.log('🎯 첫 번째 마커로 자동 이동:', { autoMoveLat, autoMoveLng });
            return (
              <MapFlyTo 
                lat={autoMoveLat} 
                lng={autoMoveLng} 
                onMoveComplete={() => {
                  setHasAutoMoved(true);
                  console.log('✅ 자동 이동 완료 - 첫 번째 마커 위치');
                }}
              />
            );
          }
          
          // 그 외의 경우: 이동하지 않음
          return null;
        })()}
        
        {/* 루트 라인 - 모던 모노크롬 스타일 */}
        {showRoute && routePositions.length > 1 && (
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
        
        {/* 사용자 위치 마커 - 기본 빨간 핀 사용 */}
        {showMyLocation && geolocation.latitude && geolocation.longitude && (
          <Marker
            {...({
              position: [geolocation.latitude, geolocation.longitude]
              // 기본 Leaflet 빨간 핀 마커 사용 (icon 속성 제거)
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
                    정확도: ±{Math.round(geolocation.accuracy || 0)}m
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

        {/* 마커들 - 기본 빨간 핀 사용 */}
        {validChapters.map((chapter) => {
          const isActive = chapter.originalIndex === activeChapter;
          
          return (
            <Marker
              key={`marker-${chapter.id}-${chapter.originalIndex}`}
              {...({
                position: [chapter.lat!, chapter.lng!],
                // 기본 Leaflet 빨간 핀 마커 사용 (icon 속성 제거)
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
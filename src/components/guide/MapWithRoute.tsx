// 이 파일은 반드시 dynamic import({ ssr: false })로만 사용하세요. SSR에서 직접 import 금지!
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// 기본 마커 아이콘(Leaflet 기본 마커가 안 보일 때 필요)
// @ts-ignore - Leaflet 내부 프로토타입 수정은 타입 체크 불가
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Coordinates {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

interface Chapter {
  id: number;
  title: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  coordinates?: Coordinates;
}

interface MapWithRouteProps {
  chapters: Chapter[];
  activeChapter: number;
  onMarkerClick?: (index: number) => void;
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
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

export default function MapWithRoute({ chapters, activeChapter, onMarkerClick }: MapWithRouteProps) {
  // 좌표만 추출 (0도 허용, 모든 필드 지원)
  const getLatLng = (c: Chapter): [number | undefined, number | undefined] => [
    c.lat ?? c.latitude ?? c.coordinates?.lat ?? c.coordinates?.latitude,
    c.lng ?? c.longitude ?? c.coordinates?.lng ?? c.coordinates?.longitude
  ];
  
  const points = chapters
    .map(getLatLng)
    .filter((coords): coords is [number, number] => 
      coords[0] !== undefined && coords[1] !== undefined && 
      coords[0] !== null && coords[1] !== null
    )
    .map(([lat, lng]) => [Number(lat), Number(lng)] as [number, number]);
  
  const center: [number, number] = points[activeChapter] || points[0] || [37.3861, -5.9926]; // fallback: 세비야대성당

  // react-leaflet 컴포넌트들을 any로 캐스팅하여 타입 문제 해결
  const MapContainerAny = MapContainer as any;
  const TileLayerAny = TileLayer as any;
  const PolylineAny = Polyline as any;
  const MarkerAny = Marker as any;
  const TooltipAny = Tooltip as any;

  return (
    <div className="w-full h-[320px] md:h-[400px] rounded-xl overflow-hidden shadow mb-6">
      <MapContainerAny 
        center={center as LatLngExpression} 
        zoom={15} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayerAny
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 1 && <PolylineAny positions={points} color="#7c3aed" weight={5} opacity={0.7} />}
        {points.map(([lat, lng], idx) => (
          <MarkerAny
            key={idx}
            position={[lat, lng]}
            icon={customMarkerIcon}
            eventHandlers={{ click: () => onMarkerClick?.(idx) }}
          >
            <TooltipAny permanent={false} direction="top">
              <b>{chapters[idx].title}</b>
            </TooltipAny>
          </MarkerAny>
        ))}
        {/* 활성 챕터에 지도 이동 */}
        {points[activeChapter] && <MapFlyTo lat={points[activeChapter][0]} lng={points[activeChapter][1]} />}
      </MapContainerAny>
    </div>
  );
}

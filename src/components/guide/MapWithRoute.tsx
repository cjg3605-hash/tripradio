import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// 기본 마커 아이콘(Leaflet 기본 마커가 안 보일 때 필요)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Chapter {
  id: number;
  title: string;
  lat?: number;
  lng?: number;
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

export default function MapWithRoute({ chapters, activeChapter, onMarkerClick }: MapWithRouteProps) {
  // 좌표만 추출 (0도 허용, 모든 필드 지원)
  const getLatLng = (c: any) => [
    c.lat ?? c.latitude ?? c.coordinates?.lat ?? c.coordinates?.latitude,
    c.lng ?? c.longitude ?? c.coordinates?.lng ?? c.coordinates?.longitude
  ];
  const points = chapters
    .map(getLatLng)
    .filter(([lat, lng]) => lat !== undefined && lng !== undefined && lat !== null && lng !== null)
    .map(([lat, lng]) => [Number(lat), Number(lng)] as [number, number]);
  const center = points[activeChapter] || points[0] || [37.3861, -5.9926]; // fallback: 세비야대성당

  return (
    <div className="w-full h-[320px] md:h-[400px] rounded-xl overflow-hidden shadow mb-6">
      <MapContainer center={center} zoom={15} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 1 && <Polyline positions={points} color="#7c3aed" weight={5} opacity={0.7} />} {/* 보라색 동선 */}
        {points.map(([lat, lng], idx) => (
          <Marker key={idx} position={[lat, lng]} eventHandlers={{ click: () => onMarkerClick?.(idx) }}>
            <Popup>
              <b>{chapters[idx].title}</b>
            </Popup>
          </Marker>
        ))}
        {/* 활성 챕터에 지도 이동 */}
        {points[activeChapter] && <MapFlyTo lat={points[activeChapter][0]} lng={points[activeChapter][1]} />}
      </MapContainer>
    </div>
  );
}

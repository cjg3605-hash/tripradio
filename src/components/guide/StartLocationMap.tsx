'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';

// 동적 import로 Leaflet 지도 컴포넌트 로드
const MapWithRoute = dynamic(() => import('./MapWithRoute'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">지도 로딩 중...</p>
      </div>
    </div>
  )
});

interface StartLocationMapProps {
  locationName: string;
  startPoint: { lat: number; lng: number; name: string };
  pois: Array<{ id: string; name: string; lat: number; lng: number; description: string }>;
  className?: string;
}

const StartLocationMap: React.FC<StartLocationMapProps> = ({
  locationName,
  startPoint,
  pois,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* 간소화된 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              투어 시작 위치
            </h3>
            <p className="text-sm text-gray-500">
              {startPoint.name}
            </p>
          </div>
        </div>
      </div>

      {/* 지도 */}
      <div className="h-64">
        <MapWithRoute
          pois={pois.map(poi => ({
            id: poi.id,
            name: poi.name,
            lat: poi.lat,
            lng: poi.lng,
            description: poi.description
          }))}
          currentLocation={null}
          center={{ lat: startPoint.lat, lng: startPoint.lng }}
          zoom={15}
          showRoute={true}
          showUserLocation={false}
          onPoiClick={(poiId) => {
            console.log('POI clicked:', poiId);
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default StartLocationMap;
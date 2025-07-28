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
  chapters?: Array<{ id: number; title: string; lat: number; lng: number; narrative?: string; originalIndex: number }>;
  pois: Array<{ id: string; name: string; lat: number; lng: number; description: string }>;
  className?: string;
}

const StartLocationMap: React.FC<StartLocationMapProps> = ({
  locationName,
  startPoint,
  chapters = [],
  pois,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-black/8 rounded-3xl shadow-lg shadow-black/3 overflow-hidden ${className}`}>
      {/* 모던 모노크롬 헤더 */}
      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black tracking-tight">
              {chapters.length > 0 ? '관람순서 지도' : '투어 시작 위치'}
            </h3>
            <p className="text-sm text-black/60 font-medium mt-0.5">
              {chapters.length > 0 ? `${chapters.length}개 챕터 경로` : startPoint.name}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced 지도 */}
      <div className="h-64">
        <MapWithRoute
          chapters={chapters.length > 0 ? chapters : undefined} // 🔥 챕터 데이터 전달
          pois={chapters.length === 0 ? pois.map(poi => ({
            id: poi.id,
            name: poi.name,
            lat: poi.lat,
            lng: poi.lng,
            description: poi.description
          })) : undefined} // 챕터가 있으면 POI는 숨김
          currentLocation={null}
          center={{ lat: startPoint.lat, lng: startPoint.lng }}
          zoom={15}
          showRoute={chapters.length > 0} // 챕터가 있을 때만 경로 표시
          showUserLocation={false}
          onMarkerClick={(chapterIndex) => {
            console.log('Chapter marker clicked:', chapterIndex);
          }}
          onPoiClick={(poiId) => {
            console.log('POI clicked:', poiId);
          }}
          className="w-full h-full"
          // Enhanced location features
          locationName={locationName}
          enableEnhancedGeocoding={true}
          preferStaticData={false}
          // Enhanced Coordinate System (Phase 1-4)
          enableEnhancedCoordinateSystem={true}
          coordinatePackageOptions={{
            enableAnalytics: true,
            enableCaching: true,
            qualityThreshold: 0.7,
            region: 'KR',
            language: 'ko'
          }}
        />
      </div>
    </div>
  );
};

export default StartLocationMap;
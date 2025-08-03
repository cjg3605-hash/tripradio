'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';

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
  // 새로운 플로우: 인트로 챕터만 표시 여부
  showIntroOnly?: boolean;
}

const StartLocationMap: React.FC<StartLocationMapProps> = ({
  locationName,
  startPoint,
  chapters = [],
  pois,
  className = '',
  showIntroOnly = false
}) => {
  const { t } = useLanguage();
  
  // 🎯 새로운 플로우: 인트로 챕터만 필터링
  const displayChapters = showIntroOnly 
    ? chapters.filter(chapter => chapter.id === 0 || chapter.originalIndex === 0)
    : chapters;
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
              {showIntroOnly ? (t('guide.recommendedStartPoint') || '추천 시작지점') : 
               displayChapters.length > 0 ? (t('guide.viewingOrderMap') || '관람순서 지도') : 
               (t('guide.tourStartLocation') || '투어 시작 위치')}
            </h3>
            <p className="text-sm text-black/60 font-medium mt-0.5">
              {showIntroOnly ? `${t('guide.accurateIntroLocation') || '정확한 인트로 위치'}` :
               displayChapters.length > 0 ? `${displayChapters.length}${t('common.chapters') || ' chapters'} ${t('guide.route') || '경로'}` : 
               startPoint.name}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced 지도 */}
      <div className="h-64">
        <MapWithRoute
          chapters={displayChapters.length > 0 ? displayChapters : undefined}
          pois={displayChapters.length === 0 ? pois.map(poi => ({
            id: poi.id,
            name: poi.name,
            lat: poi.lat,
            lng: poi.lng,
            description: poi.description
          })) : undefined}
          currentLocation={null}
          center={{ lat: startPoint.lat, lng: startPoint.lng }}
          zoom={showIntroOnly ? 16 : 15} // 인트로만 표시할 때 더 확대
          showRoute={!showIntroOnly && displayChapters.length > 0} // 인트로만 표시시 루트 숨김
          showUserLocation={false}
          onMarkerClick={(chapterIndex) => {
            console.log('Chapter marker clicked:', chapterIndex);
          }}
          onPoiClick={(poiId) => {
            console.log('POI clicked:', poiId);
          }}
          className="w-full h-full"
          locationName={locationName}
        />
      </div>
    </div>
  );
};

export default StartLocationMap;
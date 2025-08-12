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
  guideCoordinates?: any; // Supabase coordinates 컬럼 데이터
}

const StartLocationMap: React.FC<StartLocationMapProps> = ({
  locationName,
  startPoint,
  chapters = [],
  pois,
  className = '',
  guideCoordinates
}) => {
  const { t } = useLanguage();
  
  // 🎯 가이드 페이지 전용: 인트로 챕터만 필터링 (id === 0 또는 originalIndex === 0)
  const displayChapters = chapters.filter(chapter => chapter.id === 0 || chapter.originalIndex === 0);
  
  // 🚀 좌표 생성 상태 확인 (빈 배열이면 생성 중)
  const isCoordinatesLoading = !guideCoordinates || 
    (Array.isArray(guideCoordinates) && guideCoordinates.length === 0);
  
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
              {t('guide.recommendedStartPoint') || '추천 시작지점'}
            </h3>
            <p className="text-sm text-black/60 font-medium mt-0.5">
              {t('guide.accurateIntroLocation') || '정확한 인트로 위치'}
            </p>
          </div>
        </div>
      </div>

      {/* 지도 또는 로딩 상태 */}
      <div className="h-64 relative overflow-hidden">
        {/* 🎯 좌표 생성 중 로딩 UI */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center transition-all duration-700 ease-in-out ${
            isCoordinatesLoading ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="text-center">
            <div className="relative mb-4">
              {/* 로딩 스피너 */}
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
              {/* 지도 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              지도를 생성중입니다
            </h4>
            <p className="text-sm text-gray-600 max-w-xs">
              AI가 정확한 위치 정보를 분석하고 있어요.<br />
              잠시만 기다려주세요...
            </p>
          </div>
        </div>

        {/* 🗺️ 실제 지도 표시 */}
        <div 
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            !isCoordinatesLoading ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
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
            zoom={16} // 인트로 챕터 중심으로 확대 표시
            showRoute={false} // 허브 페이지와 실시간 가이드 모두 루트 숨김 (별개 지역 마커만 표시)
            showUserLocation={false}
            onMarkerClick={(chapterIndex) => {
              console.log('Chapter marker clicked:', chapterIndex);
            }}
            onPoiClick={(poiId) => {
              console.log('POI clicked:', poiId);
            }}
            className="w-full h-full"
            locationName={locationName}
            guideCoordinates={guideCoordinates}
          />
        </div>
      </div>
    </div>
  );
};

export default StartLocationMap;
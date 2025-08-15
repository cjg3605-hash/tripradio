'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  chapters?: Array<{ id: number; title: string; lat: number; lng: number; narrative?: string; originalIndex: number; coordinates?: { lat: number; lng: number } }>;
  pois: Array<{ id: string; name: string; lat: number; lng: number; description: string }>;
  className?: string;
  guideCoordinates?: any; // Supabase coordinates 컬럼 데이터
  guideId?: string; // 가이드 ID for polling
}

const StartLocationMap: React.FC<StartLocationMapProps> = ({
  locationName,
  startPoint,
  chapters = [],
  pois,
  className = '',
  guideCoordinates,
  guideId
}) => {
  const { t } = useLanguage();
  
  // 🎯 부모 컴포넌트 좌표 상태 실시간 반영
  const [currentCoordinates, setCurrentCoordinates] = useState(guideCoordinates);
  
  // 부모 컴포넌트에서 guideCoordinates가 업데이트되면 즉시 반영
  useEffect(() => {
    console.log('🗺️ [StartLocationMap] guideCoordinates 업데이트:', {
      hasGuideCoordinates: !!(guideCoordinates && Array.isArray(guideCoordinates) && guideCoordinates.length > 0),
      coordinatesCount: guideCoordinates?.length || 0
    });
    setCurrentCoordinates(guideCoordinates);
  }, [guideCoordinates]);
  
  // 🎯 StartLocationMap은 부모 컴포넌트(MultiLangGuideClient)의 좌표 상태에만 의존
  // 별도 폴링 없이 guideCoordinates prop 변경을 실시간 반영
  
  // 🎯 실제 좌표가 있는 챕터들 표시 (백그라운드 생성된 좌표 우선)
  const displayChapters = (() => {
    if (currentCoordinates && Array.isArray(currentCoordinates) && currentCoordinates.length > 0) {
      // 백그라운드로 생성된 좌표가 있으면 해당 좌표들을 사용
      return currentCoordinates.map((coord: any, index: number) => ({
        id: coord.id || index,
        title: coord.title || `챕터 ${index + 1}`,
        lat: coord.lat,
        lng: coord.lng,
        originalIndex: index
      }));
    } else if (chapters && chapters.length > 0) {
      // 좌표가 없으면 전달받은 chapters 사용 (폴백)
      return chapters.filter(chapter => 
        (chapter.lat && chapter.lng) || 
        (chapter.coordinates?.lat && chapter.coordinates?.lng)
      );
    }
    return [];
  })();
  
  // 🚀 좌표 생성 상태 확인 (실제 표시할 챕터 기준)
  const isCoordinatesLoading = displayChapters.length === 0;
  
  console.log('🗺️ [StartLocationMap] 렌더링 상태:', {
    hasCurrentCoordinates: !!(currentCoordinates && Array.isArray(currentCoordinates) && currentCoordinates.length > 0),
    currentCoordinatesCount: currentCoordinates?.length || 0,
    displayChaptersCount: displayChapters.length,
    isCoordinatesLoading,
    firstDisplayChapter: displayChapters[0] || null
  });
  
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
              좌표 생성이 완료되는 대로 표시됩니다.
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
            guideCoordinates={currentCoordinates}
          />
        </div>
      </div>
    </div>
  );
};

export default StartLocationMap;
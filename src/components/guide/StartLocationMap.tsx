'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { parseSupabaseCoordinates, validateCoordinates, normalizeCoordinateFields } from '@/lib/coordinates/coordinate-common';

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
    const validation = validateCoordinates(guideCoordinates);
    console.log('🗺️ [StartLocationMap] guideCoordinates 업데이트:', {
      validation,
      coordinatesCount: validation.count
    });
    setCurrentCoordinates(guideCoordinates);
  }, [guideCoordinates]);
  
  // 🎯 StartLocationMap은 부모 컴포넌트(MultiLangGuideClient)의 좌표 상태에만 의존
  // 별도 폴링 없이 guideCoordinates prop 변경을 실시간 반영
  
  // 🎯 DB coordinates를 표준 chapters 형태로 변환 (공통 유틸리티 사용)
  const displayChapters = (() => {
    // 공통 유틸리티로 좌표 파싱
    const parsedCoordinates = parseSupabaseCoordinates(currentCoordinates);
    
    if (parsedCoordinates.length > 0) {
      // 파싱된 좌표를 chapter 형태로 변환
      console.log('🗺️ [StartLocationMap] DB coordinates 변환:', parsedCoordinates.length);
      
      const processedChapters = parsedCoordinates.map((coord, index) => ({
        id: coord.id,
        title: coord.title || coord.name || `챕터 ${index + 1}`,
        lat: coord.lat,
        lng: coord.lng,
        originalIndex: index,
        narrative: coord.description || ''
      }));
      
      console.log('🗺️ [StartLocationMap] 변환된 유효 chapters:', processedChapters.length);
      return processedChapters;
    } else if (chapters && chapters.length > 0) {
      // 폴백: 전달받은 chapters 사용
      console.log('🗺️ [StartLocationMap] 폴백 chapters 사용:', chapters.length);
      return chapters.filter(chapter => {
        const normalized = normalizeCoordinateFields(chapter) || 
                         normalizeCoordinateFields(chapter.coordinates);
        return normalized !== null;
      });
    }
    console.log('🗺️ [StartLocationMap] 표시할 챕터 없음');
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
              {t('guide.recommendedStartPoint') || '관람지도'}
            </h3>
          </div>
        </div>
      </div>

      {/* 지도 표시 */}
      <div className="h-64 relative overflow-hidden">
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
          />
      </div>
    </div>
  );
};

export default StartLocationMap;
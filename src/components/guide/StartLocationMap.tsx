'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { parseSupabaseCoordinates, validateCoordinates, normalizeCoordinateFields } from '@/lib/coordinates/coordinate-common';

// 더 안정적인 SimpleMap 사용
const SimpleMap = dynamic(() => import('./SimpleMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">지도를 불러오는 중입니다...</p>
      </div>
    </div>
  )
});

interface StartLocationMapProps {
  locationName: string;
  guideCoordinates?: any; // Supabase coordinates 컬럼 데이터
  className?: string;
  guideId?: string; // 가이드 ID for polling
}

const StartLocationMap: React.FC<StartLocationMapProps> = ({
  locationName,
  guideCoordinates,
  className = '',
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
  
  // 🎯 오직 Supabase DB coordinates만 사용
  const displayChapters = (() => {
    // 공통 유틸리티로 좌표 파싱
    const parsedCoordinates = parseSupabaseCoordinates(currentCoordinates);
    
    if (parsedCoordinates.length > 0) {
      // 파싱된 좌표를 chapter 형태로 변환
      console.log('🗺️ [StartLocationMap] DB coordinates 변환:', parsedCoordinates.length);
      
      const processedChapters = parsedCoordinates.map((coord, index) => ({
        id: coord.id || index,
        title: coord.title || coord.name || `위치 ${index + 1}`,
        lat: coord.lat,
        lng: coord.lng,
        originalIndex: index,
        narrative: coord.description || ''
      }));
      
      console.log('🗺️ [StartLocationMap] 변환된 유효 chapters:', processedChapters.length);
      return processedChapters;
    }
    
    console.log('🗺️ [StartLocationMap] DB coordinates 없음 - 표시할 챕터 없음');
    return [];
  })();
  
  // 🚀 좌표 상태 확인
  const hasValidCoordinates = displayChapters.length > 0;
  
  console.log('🗺️ [StartLocationMap] 렌더링 상태:', {
    hasCurrentCoordinates: !!(currentCoordinates && Array.isArray(currentCoordinates) && currentCoordinates.length > 0),
    currentCoordinatesCount: currentCoordinates?.length || 0,
    displayChaptersCount: displayChapters.length,
    hasValidCoordinates,
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
        {displayChapters.length > 0 ? (
          <SimpleMap
            chapters={displayChapters}
            center={{ 
              lat: displayChapters[0].lat, 
              lng: displayChapters[0].lng 
            }}
            zoom={15}
            onMarkerClick={(chapterIndex) => {
              console.log('🗺️ Chapter marker clicked:', chapterIndex);
            }}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">좌표 데이터가 없습니다</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartLocationMap;
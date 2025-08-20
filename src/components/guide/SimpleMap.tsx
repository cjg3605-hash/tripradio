'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';

interface SimpleMapProps {
  chapters?: Array<{ 
    id: number; 
    title: string; 
    lat: number; 
    lng: number; 
    narrative?: string; 
    originalIndex: number; 
  }>;
  center: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMarkerClick?: (index: number) => void;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  chapters = [],
  center,
  zoom = 15,
  className = '',
  onMarkerClick
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapState, setMapState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 지도 초기화 함수
  const initializeMap = useCallback(async () => {
    try {
      console.log('🗺️ [SimpleMap] 지도 초기화 시작');
      
      // Leaflet 동적 import
      const L = await import('leaflet');
      
      // Leaflet CSS 로드
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 기본 아이콘 설정
      delete (L as any).Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // 기존 지도 정리
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // DOM 요소 확인
      if (!mapRef.current) {
        throw new Error('지도 컨테이너 DOM 요소를 찾을 수 없습니다');
      }

      console.log('🗺️ [SimpleMap] Leaflet 지도 생성 중...');
      
      // 지도 생성
      const map = L.map(mapRef.current, {
        preferCanvas: true,
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([center.lat, center.lng], zoom);

      // CartoDB Voyager - 가장 균형잡힌 인기 스타일 (Airbnb, 여행앱들이 사용)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // 시작지점 마커만 추가 (id: 0)
      const startChapter = chapters.find(chapter => chapter.id === 0) || chapters[0];
      if (startChapter) {
        console.log('🗺️ [SimpleMap] 시작지점 마커 추가:', startChapter.title);
        const marker = L.marker([startChapter.lat, startChapter.lng])
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                🚩 ${startChapter.title}
              </h3>
              <p style="margin: 0; font-size: 14px; color: #059669; font-weight: 500;">
                관광 시작지점
              </p>
              ${startChapter.narrative ? `
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.4;">
                  ${startChapter.narrative}
                </p>
              ` : ''}
            </div>
          `)
          .addTo(map);

        marker.on('click', () => {
          console.log('🗺️ [SimpleMap] 시작지점 마커 클릭:', startChapter.title);
          onMarkerClick?.(startChapter.originalIndex || 0);
        });
      }

      // 시작지점을 중심으로 지도 영역 설정
      if (startChapter) {
        map.setView([startChapter.lat, startChapter.lng], zoom);
      }

      mapInstanceRef.current = map;
      setMapState('loaded');
      console.log('🗺️ [SimpleMap] 지도 초기화 완료');

    } catch (error) {
      console.error('🗺️ [SimpleMap] 초기화 실패:', error);
      setErrorMessage(`지도 초기화 실패: ${error instanceof Error ? error.message : String(error)}`);
      setMapState('error');
    }
  }, [chapters, center, zoom, onMarkerClick]);

  // 데이터 유효성 검사 및 지도 초기화
  useEffect(() => {
    console.log('🗺️ [SimpleMap] useEffect 실행:', {
      chaptersLength: chapters.length,
      center,
      hasMapRef: !!mapRef.current
    });

    // 데이터 유효성 검사
    if (chapters.length === 0) {
      setErrorMessage('표시할 위치 데이터가 없습니다');
      setMapState('error');
      return;
    }
    
    if (!center.lat || !center.lng) {
      setErrorMessage('중심 좌표가 유효하지 않습니다');
      setMapState('error');
      return;
    }

    // 유효한 데이터가 있으면 지도 초기화 시작
    setMapState('loading');
    
    // 다음 틱에서 지도 초기화 (DOM이 완전히 준비되도록)
    const timer = setTimeout(initializeMap, 100);

    // 정리 함수
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [chapters, center, zoom, onMarkerClick, initializeMap]);

  // 항상 지도 컨테이너를 렌더링하고 상태에 따라 오버레이 표시
  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '300px' }}>
      {/* 실제 지도 컨테이너 - 항상 DOM에 존재 */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />
      
      {/* 로딩/에러 오버레이 */}
      {mapState === 'loading' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-pulse" />
            <p className="text-gray-600">지도를 불러오는 중입니다...</p>
            <p className="text-gray-500 text-sm mt-1">Leaflet 라이브러리 로드 중...</p>
          </div>
        </div>
      )}
      
      {mapState === 'error' && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-red-600 font-medium">지도 로드 실패</p>
            <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;
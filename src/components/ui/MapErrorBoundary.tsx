'use client';

import React from 'react';

interface MapErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface MapErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  locationName?: string;
  validChaptersCount?: number;
}

export class MapErrorBoundary extends React.Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    console.warn('🗺️ MapErrorBoundary: 지도 오류 감지 (React Strict Mode):', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 지도 초기화 오류인지 확인
    const isMapError = error.message?.includes('Map container is already initialized') ||
                      error.message?.includes('container is already initialized') ||
                      error.name?.includes('LeafletError');
                      
    if (isMapError) {
      console.warn('🗺️ Leaflet 지도 초기화 충돌 (React Strict Mode):', {
        error: error.message,
        locationName: this.props.locationName,
        validChaptersCount: this.props.validChaptersCount
      });
    } else {
      console.error('🗺️ MapErrorBoundary: 예상치 못한 지도 오류:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // 사용자 정의 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 fallback UI
      return (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center text-gray-600">
            <div className="text-2xl mb-2">🗺️</div>
            <div className="text-sm font-medium">지도를 불러오는 중입니다</div>
            <div className="text-xs text-gray-500 mt-1">
              {this.props.validChaptersCount ? `${this.props.validChaptersCount}개 지점` : '위치 정보 로딩 중'}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {this.props.locationName || '여행지'}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
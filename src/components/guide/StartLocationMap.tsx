'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
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
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(currentLanguage);
  const [showAccuracyInfo, setShowAccuracyInfo] = useState(false);

  const {
    currentLocation,
    trackingState,
    accuracy,
    isTracking,
    hasPermission,
    requestPermission,
    getCurrentPosition,
    enablePrecisionMode,
    getPrecisionStatus
  } = useGeolocation({
    enableTracking: false, // 시작점 확인용이므로 지속 추적 비활성화
    enableGeofencing: false,
    autoStart: false,
    enablePrecisionMode: true // 🎯 시작점 확인에는 최고 정확도 필요
  });

  // 시작점까지의 거리 계산
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const distanceToStart = currentLocation 
    ? calculateDistance(currentLocation.lat, currentLocation.lng, startPoint.lat, startPoint.lng)
    : null;

  // 정확도 상태 판단
  const getAccuracyStatus = () => {
    if (!hasPermission) return 'permission';
    if (!currentLocation) return 'locating';
    if (accuracy <= 10) return 'excellent';
    if (accuracy <= 30) return 'good';
    if (accuracy <= 100) return 'fair';
    return 'poor';
  };

  const accuracyStatus = getAccuracyStatus();

  // 시작 준비 상태 판단
  const isReadyToStart = () => {
    return hasPermission && 
           currentLocation && 
           accuracy <= 50 && 
           distanceToStart !== null && 
           distanceToStart <= 200; // 200m 이내
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getStatusIcon = () => {
    switch (accuracyStatus) {
      case 'permission':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'locating':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fair':
        return <Target className="w-5 h-5 text-yellow-500" />;
      case 'poor':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (accuracyStatus) {
      case 'permission':
        return t('location.needPermission');
      case 'locating':
        return t('location.locating');
      case 'excellent':
        return t('location.excellentAccuracy');
      case 'good':
        return t('location.goodAccuracy');
      case 'fair':
        return t('location.fairAccuracy');
      case 'poor':
        return t('location.poorAccuracy');
      default:
        return t('location.unknown');
    }
  };

  const getAccuracyColor = () => {
    switch (accuracyStatus) {
      case 'excellent':
      case 'good':
        return 'text-green-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('guide.tourStartLocation')}
              </h3>
              <p className="text-sm text-gray-500">
                {startPoint.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAccuracyInfo(!showAccuracyInfo)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {t('location.accuracyInfo')}
          </button>
        </div>
      </div>

      {/* 정확도 정보 패널 */}
      {showAccuracyInfo && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            {t('location.accuracyLevels')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700">3-10m: {t('location.excellentDesc')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-700">10-30m: {t('location.goodDesc')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-orange-700">30-100m: {t('location.fairDesc')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-700">100m+: {t('location.poorDesc')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 지도 */}
      <div className="h-64">
        <MapWithRoute
          pois={[
            { 
              ...startPoint, 
              id: 'start_point',
              description: t('guide.tourStartPoint')
            },
            ...pois
          ]}
          currentLocation={currentLocation}
          center={startPoint}
          zoom={16}
          showRoute={true}
          showUserLocation={true}
          onPoiClick={() => {}}
          className="w-full h-full"
        />
      </div>

      {/* 위치 상태 */}
      <div className="p-4">
        {!hasPermission ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-gray-900">
                  {t('location.permissionRequired')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('location.permissionForAccuracy')}
                </p>
              </div>
            </div>
            <button
              onClick={requestPermission}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('location.allowLocation')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 현재 상태 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <p className="font-medium text-gray-900">
                    {getStatusMessage()}
                  </p>
                  {currentLocation && (
                    <div className="space-y-1">
                      <p className={`text-sm ${getAccuracyColor()}`}>
                        ±{Math.round(accuracy)}m {t('location.accuracy')}
                      </p>
                      {getPrecisionStatus().isActive && (
                        <p className="text-xs text-blue-600 font-medium">
                          🎯 정밀 GPS 활성
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {!currentLocation && (
                <button
                  onClick={() => getCurrentPosition()}
                  className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  🎯 {t('location.refresh')}
                </button>
              )}
            </div>

            {/* 시작점까지 거리 */}
            {distanceToStart !== null && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {t('location.distanceToStart')}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    distanceToStart <= 50 ? 'text-green-600' :
                    distanceToStart <= 200 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formatDistance(distanceToStart)}
                  </span>
                </div>
                
                {distanceToStart <= 50 && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        {t('location.readyToStart')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 정확도 개선 팁 */}
            {accuracy > 30 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                  {t('location.improveTips')}
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• {t('location.tip1')}</li>
                  <li>• {t('location.tip2')}</li>
                  <li>• {t('location.tip3')}</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 준비 완료 상태 */}
      {isReadyToStart() && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-green-900">
                {t('location.perfectLocation')}
              </h4>
              <p className="text-sm text-green-700">
                {t('location.startTourNow')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartLocationMap;
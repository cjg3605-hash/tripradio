'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Target,
  Activity,
  Clock,
  Route,
  Settings,
  Shield,
  Battery,
  Wifi,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { GeofenceEvent } from '@/types/location';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiveLocationTrackerProps {
  pois?: Array<{ id: string; name: string; lat: number; lng: number; radius?: number }>;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  onPOIReached?: (poiId: string, poiName: string) => void;
  showStats?: boolean;
  showProgress?: boolean;
  className?: string;
}

const LiveLocationTracker: React.FC<LiveLocationTrackerProps> = ({
  pois = [],
  onLocationUpdate,
  onPOIReached,
  showStats = true,
  showProgress = true,
  className = ''
}) => {
  const { currentLanguage, t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' }>>([]);

  const {
    trackingState,
    currentLocation,
    nearestPOI,
    routeProgress,
    isTracking,
    hasPermission,
    hasError,
    accuracy,
    startTracking,
    stopTracking,
    requestPermission,
    setupRouteGeofences,
    getLocationStats
  } = useGeolocation({
    enableTracking: true,
    enableGeofencing: true,
    autoStart: false,
    onLocationUpdate: (location) => {
      onLocationUpdate?.({ lat: location.lat, lng: location.lng });
    },
    onGeofenceEvent: (event: GeofenceEvent) => {
      handleGeofenceEvent(event);
    },
    onPermissionDenied: () => {
      addNotification('location-denied', t('location.permissionDenied'), 'warning');
    }
  });

  // Set up POI geofences when component mounts or POIs change
  useEffect(() => {
    if (pois.length > 0) {
      setupRouteGeofences(pois);
    }
  }, [pois, setupRouteGeofences]);

  const handleGeofenceEvent = (event: GeofenceEvent) => {
    switch (event.type) {
      case 'enter':
        const geofence = pois.find(poi => `poi_${poi.id}` === event.geofenceId);
        if (geofence) {
          addNotification(
            `poi-enter-${geofence.id}`,
            `${geofence.name}에 도착했습니다`,
            'success'
          );
          onPOIReached?.(geofence.id, geofence.name);
        }
        break;
      case 'exit':
        addNotification(
          `poi-exit-${event.geofenceId}`,
          t('location.leftArea'),
          'info'
        );
        break;
      case 'dwell':
        addNotification(
          `poi-dwell-${event.geofenceId}`,
          t('location.stayingAt'),
          'info'
        );
        break;
    }
  };

  const addNotification = (id: string, message: string, type: 'info' | 'success' | 'warning') => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== id);
      return [...filtered, { id, message, type }];
    });

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleStartTracking = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    await startTracking();
    addNotification('tracking-started', t('location.trackingStarted'), 'success');
  };

  const handleStopTracking = () => {
    stopTracking();
    addNotification('tracking-stopped', t('location.trackingStopped'), 'info');
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy <= 10) return 'text-green-600';
    if (accuracy <= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (hasError) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (isTracking) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (!hasPermission) return <Shield className="w-5 h-5 text-orange-500" />;
    return <Target className="w-5 h-5 text-gray-400" />;
  };

  const stats = getLocationStats();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-medium text-gray-900">
                {t('location.liveTracking')}
              </h3>
              <p className="text-sm text-gray-500">
                {isTracking ? t('location.active') : t('location.inactive')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              aria-label={t('location.settings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="p-4 border-b border-gray-200 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg text-sm ${
                notification.type === 'success' ? 'bg-green-50 text-green-700' :
                notification.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                'bg-blue-50 text-blue-700'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {/* Permission Request */}
        {!hasPermission && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-orange-900">
                {t('location.permissionRequired')}
              </h4>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              {t('location.permissionDescription')}
            </p>
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
            >
              {t('location.allowLocation')}
            </button>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">
                  {t('location.error')}
                </h4>
                <p className="text-sm text-red-700">
                  {trackingState.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3 mb-6">
          {!isTracking ? (
            <button
              onClick={handleStartTracking}
              disabled={!hasPermission}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className="w-4 h-4" />
              {t('location.startTracking')}
            </button>
          ) : (
            <button
              onClick={handleStopTracking}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Target className="w-4 h-4" />
              {t('location.stopTracking')}
            </button>
          )}
        </div>

        {/* Current Status */}
        {currentLocation && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t('location.currentLocation')}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
              <p className={`text-xs ${getAccuracyColor(accuracy)}`}>
                ±{accuracy.toFixed(0)}m
              </p>
            </div>

            {nearestPOI && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {t('location.nearestPOI')}
                  </span>
                </div>
                <p className="text-xs text-gray-900 font-medium">
                  {nearestPOI.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistance(nearestPOI.distance)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Route Progress */}
        {showProgress && routeProgress.totalPOIs > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Route className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">
                {t('location.routeProgress')}
              </h4>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>
                  {routeProgress.visitedPOIs} / {routeProgress.totalPOIs} {t('location.completed')}
                </span>
                <span>{Math.round(routeProgress.completionPercentage)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${routeProgress.completionPercentage}%` }}
                />
              </div>
            </div>

            {routeProgress.currentPOI && (
              <p className="text-sm text-blue-700 mb-1">
                <strong>{t('location.currentPOI')}:</strong> {routeProgress.currentPOI}
              </p>
            )}

            {routeProgress.nextPOI && (
              <div className="text-sm text-blue-700">
                <p className="mb-1">
                  <strong>{t('location.nextPOI')}:</strong> {routeProgress.nextPOI}
                </p>
                {routeProgress.distanceToNext && (
                  <p className="text-xs">
                    {formatDistance(routeProgress.distanceToNext)}
                    {routeProgress.estimatedTimeToNext && (
                      <span> • {formatTime(routeProgress.estimatedTimeToNext)}</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        {showStats && isTracking && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Route className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t('location.totalDistance')}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDistance(stats.totalDistance)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t('location.totalTime')}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatTime(stats.totalDuration / 1000)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t('location.averageSpeed')}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {(stats.averageSpeed * 3.6).toFixed(1)} km/h
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t('location.visitedPOIs')}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {stats.visitedPOIs}
              </p>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">
              {t('location.settings')}
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {t('location.highAccuracy')}
                </span>
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-500">
                    {trackingState.batterySaver ? t('location.batterySaver') : t('location.normal')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {t('location.accuracy')}
                </span>
                <span className={`text-sm ${getAccuracyColor(accuracy)}`}>
                  ±{accuracy.toFixed(0)}m
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {t('location.lastUpdate')}
                </span>
                <span className="text-sm text-gray-500">
                  {trackingState.lastUpdate ? 
                    new Date(trackingState.lastUpdate).toLocaleTimeString() : 
                    t('location.never')
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLocationTracker;
import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationPoint, LocationTrackingState, GeofenceEvent, LocationStats, RouteProgress } from '@/types/location';
import { gpsService } from '@/lib/location/gps-service';
import { geofencingService } from '@/lib/location/geofencing';

interface UseGeolocationOptions {
  enableTracking?: boolean;
  enableGeofencing?: boolean;
  autoStart?: boolean;
  enablePrecisionMode?: boolean;
  onLocationUpdate?: (location: LocationPoint) => void;
  onGeofenceEvent?: (event: GeofenceEvent) => void;
  onPermissionDenied?: () => void;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enableTracking = true,
    enableGeofencing = true,
    autoStart = false,
    enablePrecisionMode = false,
    onLocationUpdate,
    onGeofenceEvent,
    onPermissionDenied
  } = options;

  const [trackingState, setTrackingState] = useState<LocationTrackingState>(() => 
    gpsService.getTrackingState()
  );
  
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [nearestPOI, setNearestPOI] = useState<{ distance: number; name: string } | null>(null);
  const [routeProgress, setRouteProgress] = useState<RouteProgress>({
    totalPOIs: 0,
    visitedPOIs: 0,
    completionPercentage: 0
  });
  
  const initialized = useRef(false);
  const locationListenerRef = useRef<((location: LocationPoint) => void) | null>(null);
  const geofenceListenerRef = useRef<((event: GeofenceEvent) => void) | null>(null);

  // Update tracking state from GPS service
  const updateTrackingState = useCallback(() => {
    setTrackingState(gpsService.getTrackingState());
  }, []);

  // Calculate distance between two points
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

  // Update route progress
  const updateRouteProgress = useCallback(() => {
    const allGeofences = geofencingService.getAllGeofences();
    const poiGeofences = allGeofences.filter(g => g.type === 'poi');
    const visitHistory = geofencingService.getVisitHistory();
    
    const visitedPOIIds = new Set(
      visitHistory
        .filter(v => v.geofenceId?.startsWith('poi_'))
        .map(v => v.geofenceId)
    );

    const totalPOIs = poiGeofences.length;
    const visitedPOIs = visitedPOIIds.size;
    const completionPercentage = totalPOIs > 0 ? (visitedPOIs / totalPOIs) * 100 : 0;

    // Find current and next POI
    const currentPOI = poiGeofences.find(poi => 
      geofencingService.getActiveZones().includes(poi.id)
    );
    
    const nextPOI = poiGeofences.find(poi => 
      !visitedPOIIds.has(poi.id) && poi.id !== currentPOI?.id
    );

    const progress: RouteProgress = {
      totalPOIs,
      visitedPOIs,
      completionPercentage,
      currentPOI: currentPOI?.name,
      nextPOI: nextPOI?.name
    };

    // Calculate distance and time to next POI
    if (nextPOI && currentLocation) {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        nextPOI.center.lat,
        nextPOI.center.lng
      );
      
      progress.distanceToNext = Math.round(distance);
      progress.estimatedTimeToNext = Math.round(distance / 1.2); // Assuming 1.2 m/s walking speed
    }

    setRouteProgress(progress);
  }, [currentLocation]);

  // Public methods
  const startTracking = useCallback(async (): Promise<boolean> => {
    const success = await gpsService.startTracking(enablePrecisionMode);
    updateTrackingState();
    return success;
  }, [updateTrackingState, enablePrecisionMode]);

  // Initialize location tracking
  const initializeTracking = useCallback(async () => {
    if (initialized.current || !enableTracking) return;

    try {
      const permissionState = await gpsService.checkPermission();
      
      if (permissionState === 'denied') {
        onPermissionDenied?.();
        return;
      }

      // Set up location listener
      if (!locationListenerRef.current) {
        locationListenerRef.current = (location: LocationPoint) => {
          setCurrentLocation(location);
          onLocationUpdate?.(location);
          
          // Update nearest POI
          if (enableGeofencing) {
            const nearest = geofencingService.getNearestPOI(location);
            if (nearest) {
              setNearestPOI({
                distance: Math.round(nearest.distance),
                name: nearest.geofence.name
              });
            }
          }
          
          // Update route progress
          updateRouteProgress();
        };
        
        gpsService.addLocationListener(locationListenerRef.current);
      }

      // Set up geofence listener
      if (enableGeofencing && !geofenceListenerRef.current) {
        geofenceListenerRef.current = (event: GeofenceEvent) => {
          onGeofenceEvent?.(event);
          updateRouteProgress();
        };
        
        geofencingService.addGeofenceListener(geofenceListenerRef.current);
      }

      initialized.current = true;
      
      // Auto-start tracking if requested
      if (autoStart) {
        await startTracking();
      }
    } catch (error) {
      console.error('Failed to initialize location tracking:', error);
    }
  }, [enableTracking, enableGeofencing, autoStart, onLocationUpdate, onGeofenceEvent, onPermissionDenied, startTracking, updateRouteProgress]);

  // Public methods

  const stopTracking = useCallback(() => {
    gpsService.stopTracking();
    updateTrackingState();
  }, [updateTrackingState]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const success = await gpsService.requestPermission();
    updateTrackingState();
    return success;
  }, [updateTrackingState]);

  const getCurrentPosition = useCallback(async (): Promise<LocationPoint | null> => {
    try {
      return await gpsService.getCurrentPosition(enablePrecisionMode);
    } catch (error) {
      console.error('Failed to get current position:', error);
      return null;
    }
  }, [enablePrecisionMode]);

  const getLocationStats = useCallback((): LocationStats => {
    return geofencingService.getLocationStats();
  }, []);

  const setupRouteGeofences = useCallback((pois: Array<{ id: string; name: string; lat: number; lng: number; radius?: number }>) => {
    geofencingService.setupPOIGeofences(pois);
    updateRouteProgress();
  }, [updateRouteProgress]);

  const clearLocationData = useCallback(() => {
    gpsService.clearLocationHistory();
    geofencingService.clearVisitHistory();
    setCurrentLocation(null);
    setNearestPOI(null);
    setRouteProgress({
      totalPOIs: 0,
      visitedPOIs: 0,
      completionPercentage: 0
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeTracking();
    
    const interval = setInterval(updateTrackingState, 1000);
    
    return () => {
      clearInterval(interval);
      
      // Clean up listeners
      if (locationListenerRef.current) {
        gpsService.removeLocationListener(locationListenerRef.current);
      }
      
      if (geofenceListenerRef.current) {
        geofencingService.removeGeofenceListener(geofenceListenerRef.current);
      }
    };
  }, [initializeTracking, updateTrackingState]);

  // Update route progress when geofences change
  useEffect(() => {
    updateRouteProgress();
  }, [updateRouteProgress]);

  return {
    // State
    trackingState,
    currentLocation,
    nearestPOI,
    routeProgress,
    
    // Derived state
    isTracking: trackingState.isTracking,
    hasPermission: trackingState.permissionState === 'granted',
    hasError: !!trackingState.error,
    accuracy: trackingState.accuracy,
    
    // Actions
    startTracking,
    stopTracking,
    requestPermission,
    getCurrentPosition,
    setupRouteGeofences,
    clearLocationData,
    
    // Precision GPS methods
    enablePrecisionMode: gpsService.enablePrecisionMode.bind(gpsService),
    getPrecisionStatus: gpsService.getPrecisionStatus.bind(gpsService),
    
    // Analytics
    getLocationStats,
    getVisitHistory: geofencingService.getVisitHistory.bind(geofencingService),
    getLocationHistory: gpsService.getLocationHistory.bind(gpsService)
  };
};
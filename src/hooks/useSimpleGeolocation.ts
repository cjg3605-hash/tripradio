/**
 * 간단한 GPS 위치 및 방향 추적 훅
 * 내 위치 버튼용 최적화
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface SimpleGeolocationState {
  latitude: number | null;
  longitude: number | null;
  heading: number | null; // 방향 (0-360도)
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  isTracking: boolean;
}

export const useSimpleGeolocation = () => {
  const watchIdRef = useRef<number | null>(null);
  const orientationListenerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  const [state, setState] = useState<SimpleGeolocationState>({
    latitude: null,
    longitude: null,
    heading: null,
    accuracy: null,
    error: null,
    isLoading: false,
    isSupported: 'geolocation' in navigator,
    permissionStatus: 'unknown',
    isTracking: false
  });

  // 방향 감지 설정
  const setupOrientationTracking = useCallback(() => {
    if (!window.DeviceOrientationEvent) {
      return;
    }

    // iOS 권한 요청 (iOS 13+)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            startOrientationTracking();
          }
        })
        .catch((error: any) => {
          console.warn('Device orientation permission denied:', error);
        });
    } else {
      // Android 및 기타 플랫폼
      startOrientationTracking();
    }
  }, []);

  const startOrientationTracking = useCallback(() => {
    if (orientationListenerRef.current) {
      (window as any).removeEventListener('deviceorientationabsolute', orientationListenerRef.current);
      (window as any).removeEventListener('deviceorientation', orientationListenerRef.current);
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        let heading = event.alpha;
        
        // iOS는 webkitCompassHeading 사용
        if (typeof (event as any).webkitCompassHeading !== 'undefined') {
          heading = (event as any).webkitCompassHeading;
        } else {
          // Android는 alpha를 360도에서 빼서 계산
          heading = 360 - heading;
        }

        setState(prev => ({ ...prev, heading: Math.round(heading) }));
      }
    };

    orientationListenerRef.current = handleOrientation;

    // 절대적 방향 우선 시도 (더 정확함)
    if ('ondeviceorientationabsolute' in window) {
      (window as any).addEventListener('deviceorientationabsolute', handleOrientation, { passive: true });
    } else {
      (window as any).addEventListener('deviceorientation', handleOrientation, { passive: true });
    }
  }, []);

  // 위치 추적 시작
  const startTracking = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, isTracking: true }));

    const handleSuccess = (position: GeolocationPosition) => {
      setState(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        isLoading: false,
        error: null,
        permissionStatus: 'granted'
      }));
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown location error';
      let permissionStatus: SimpleGeolocationState['permissionStatus'] = 'unknown';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          permissionStatus = 'denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        permissionStatus,
        isTracking: false
      }));
    };

    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000 // 5초 캐시
    };

    // 연속 위치 추적
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );

    // 방향 추적 시작
    setupOrientationTracking();
  }, [state.isSupported, setupOrientationTracking]);

  // 위치 추적 중지
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (orientationListenerRef.current) {
      (window as any).removeEventListener('deviceorientationabsolute', orientationListenerRef.current);
      (window as any).removeEventListener('deviceorientation', orientationListenerRef.current);
      orientationListenerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      isTracking: false,
      heading: null
    }));
  }, []);

  // 한 번만 위치 가져오기
  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const handleSuccess = (position: GeolocationPosition) => {
      setState(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        isLoading: false,
        error: null,
        permissionStatus: 'granted'
      }));
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown location error';
      let permissionStatus: SimpleGeolocationState['permissionStatus'] = 'unknown';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          permissionStatus = 'denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        permissionStatus
      }));
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }, [state.isSupported]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentPosition
  };
};
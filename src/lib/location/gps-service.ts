import { LocationPoint, LocationTrackingOptions, LocationTrackingState, LocationServiceConfig } from '@/types/location';
import { SmartphonePrecisionGPS } from './smartphone-precision-gps';

class GPSService {
  private watchId: number | null = null;
  private trackingState: LocationTrackingState = {
    isTracking: false,
    currentLocation: null,
    accuracy: 0,
    permissionState: 'prompt',
    error: null,
    lastUpdate: 0,
    batterySaver: false
  };
  
  private config: LocationServiceConfig = {
    tracking: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
      trackingInterval: 5000,
      distanceFilter: 10
    },
    geofencing: {
      checkInterval: 2000,
      dwellThreshold: 30000,
      exitThreshold: 50
    },
    analytics: {
      recordVisits: true,
      calculateStats: true,
      storageLimit: 1000
    }
  };

  private listeners: Array<(location: LocationPoint) => void> = [];
  private lastKnownLocation: LocationPoint | null = null;
  private precisionGPS: SmartphonePrecisionGPS;
  private usePrecisionMode: boolean = false;

  constructor() {
    this.precisionGPS = new SmartphonePrecisionGPS({
      targetAccuracy: 5, // 5m target for tourism applications
      enableFusion: true,
      enablePrediction: true,
      enableDeadReckoning: true
    });
    this.initializeBatterySaver();
  }

  private initializeBatterySaver() {
    // Detect if device is in battery saver mode
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.trackingState.batterySaver = battery.level < 0.2;
        
        battery.addEventListener('levelchange', () => {
          const wasBatterySaver = this.trackingState.batterySaver;
          this.trackingState.batterySaver = battery.level < 0.2;
          
          if (wasBatterySaver !== this.trackingState.batterySaver) {
            this.adjustTrackingForBattery();
          }
        });
      });
    }
  }

  private adjustTrackingForBattery() {
    if (this.trackingState.batterySaver) {
      // Reduce tracking frequency for battery saving
      this.config.tracking.trackingInterval = 15000; // 15 seconds
      this.config.tracking.enableHighAccuracy = false;
      this.config.geofencing.checkInterval = 5000; // 5 seconds
    } else {
      // Restore normal tracking
      this.config.tracking.trackingInterval = 5000; // 5 seconds
      this.config.tracking.enableHighAccuracy = true;
      this.config.geofencing.checkInterval = 2000; // 2 seconds
    }

    // Restart tracking with new settings if currently tracking
    if (this.trackingState.isTracking) {
      this.stopTracking();
      this.startTracking();
    }
  }

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.geolocation) {
      this.trackingState.permissionState = 'denied';
      this.trackingState.error = 'Geolocation is not supported by this browser';
      return 'denied';
    }

    try {
      // Try to get current position to check permission
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000
          }
        );
      });
      
      this.trackingState.permissionState = 'granted';
      return 'granted';
    } catch (error: any) {
      if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
        this.trackingState.permissionState = 'denied';
        this.trackingState.error = 'Location permission denied';
        return 'denied';
      }
      
      this.trackingState.permissionState = 'prompt';
      return 'prompt';
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: this.config.tracking.enableHighAccuracy,
            timeout: this.config.tracking.timeout,
            maximumAge: this.config.tracking.maximumAge
          }
        );
      });

      this.trackingState.permissionState = 'granted';
      this.trackingState.error = null;
      
      // Update with initial location
      this.updateLocation(position);
      
      return true;
    } catch (error: any) {
      this.handleLocationError(error);
      return false;
    }
  }

  async startTracking(enablePrecisionMode: boolean = false): Promise<boolean> {
    if (this.trackingState.isTracking) {
      return true;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    this.usePrecisionMode = enablePrecisionMode;

    try {
      if (this.usePrecisionMode) {
        // 🎯 Use SmartphonePrecisionGPS for maximum accuracy
        this.precisionGPS.addLocationListener((location: LocationPoint) => {
          this.updateLocationFromPrecisionGPS(location);
        });
        
        const precisionStarted = await this.precisionGPS.startPrecisionTracking();
        if (!precisionStarted) {
          // Fallback to standard GPS if precision GPS fails
          console.warn('Precision GPS failed to start, falling back to standard GPS');
          this.usePrecisionMode = false;
        }
      }

      if (!this.usePrecisionMode) {
        // Standard GPS tracking
        this.watchId = navigator.geolocation.watchPosition(
          (position) => this.updateLocation(position),
          (error) => this.handleLocationError(error),
          {
            enableHighAccuracy: this.config.tracking.enableHighAccuracy,
            timeout: this.config.tracking.timeout,
            maximumAge: this.config.tracking.maximumAge
          }
        );
      }

      this.trackingState.isTracking = true;
      this.trackingState.error = null;
      return true;
    } catch (error: any) {
      this.handleLocationError(error);
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    if (this.usePrecisionMode) {
      this.precisionGPS.stopTracking();
    }
    
    this.trackingState.isTracking = false;
    this.usePrecisionMode = false;
  }

  private updateLocation(position: GeolocationPosition): void {
    const newLocation: LocationPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp
    };

    // Apply distance filter
    if (this.lastKnownLocation && this.shouldFilterLocation(newLocation)) {
      return;
    }

    this.trackingState.currentLocation = newLocation;
    this.trackingState.accuracy = position.coords.accuracy;
    this.trackingState.lastUpdate = Date.now();
    this.lastKnownLocation = newLocation;

    // Store location history
    this.storeLocationHistory(newLocation);

    // Notify listeners
    this.listeners.forEach(listener => listener(newLocation));
  }

  private updateLocationFromPrecisionGPS(location: LocationPoint): void {
    // Apply distance filter
    if (this.lastKnownLocation && this.shouldFilterLocationPoint(location)) {
      return;
    }

    this.trackingState.currentLocation = location;
    this.trackingState.accuracy = location.accuracy || 0;
    this.trackingState.lastUpdate = Date.now();
    this.lastKnownLocation = location;

    // Store location history
    this.storeLocationHistory(location);

    // Notify listeners
    this.listeners.forEach(listener => listener(location));
  }

  private shouldFilterLocationPoint(newLocation: LocationPoint): boolean {
    if (!this.lastKnownLocation) return false;

    const distance = this.calculateDistance(
      this.lastKnownLocation.lat,
      this.lastKnownLocation.lng,
      newLocation.lat,
      newLocation.lng
    );

    return distance < this.config.tracking.distanceFilter;
  }

  private shouldFilterLocation(newLocation: LocationPoint): boolean {
    if (!this.lastKnownLocation) return false;

    const distance = this.calculateDistance(
      this.lastKnownLocation.lat,
      this.lastKnownLocation.lng,
      newLocation.lat,
      newLocation.lng
    );

    return distance < this.config.tracking.distanceFilter;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
  }

  private storeLocationHistory(location: LocationPoint): void {
    if (!this.config.analytics.recordVisits) return;

    try {
      const history = this.getLocationHistory();
      history.push(location);

      // Keep only recent locations within storage limit
      if (history.length > this.config.analytics.storageLimit) {
        history.splice(0, history.length - this.config.analytics.storageLimit);
      }

      localStorage.setItem('navi-location-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to store location history:', error);
    }
  }

  getLocationHistory(): LocationPoint[] {
    try {
      const stored = localStorage.getItem('navi-location-history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve location history:', error);
      return [];
    }
  }

  private handleLocationError(error: GeolocationPositionError): void {
    let errorMessage = 'Unknown location error';
    
    switch (error.code) {
      case GeolocationPositionError.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        this.trackingState.permissionState = 'denied';
        break;
      case GeolocationPositionError.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case GeolocationPositionError.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    this.trackingState.error = errorMessage;
    this.trackingState.isTracking = false;
    
    console.error('GPS Service Error:', errorMessage, error);
  }

  // Public API methods
  getCurrentLocation(): LocationPoint | null {
    return this.trackingState.currentLocation;
  }

  getTrackingState(): LocationTrackingState {
    return { ...this.trackingState };
  }

  isTracking(): boolean {
    return this.trackingState.isTracking;
  }

  getAccuracy(): number {
    return this.trackingState.accuracy;
  }

  addLocationListener(listener: (location: LocationPoint) => void): void {
    this.listeners.push(listener);
  }

  removeLocationListener(listener: (location: LocationPoint) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  updateConfig(newConfig: Partial<LocationServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart tracking if configuration changed significantly
    if (this.trackingState.isTracking) {
      this.stopTracking();
      this.startTracking();
    }
  }

  clearLocationHistory(): void {
    localStorage.removeItem('navi-location-history');
  }

  async getCurrentPosition(enablePrecisionMode: boolean = false): Promise<LocationPoint> {
    if (enablePrecisionMode) {
      // Use precision GPS for single location request
      const precisionLocation = await this.precisionGPS.getCurrentPrecisionLocation();
      if (precisionLocation) {
        return precisionLocation;
      }
      // Fall back to standard GPS if precision fails
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          };
          resolve(location);
        },
        reject,
        {
          enableHighAccuracy: this.config.tracking.enableHighAccuracy,
          timeout: this.config.tracking.timeout,
          maximumAge: this.config.tracking.maximumAge
        }
      );
    });
  }

  // 🎯 Enable precision mode for critical scenarios
  enablePrecisionMode(): void {
    if (this.trackingState.isTracking && !this.usePrecisionMode) {
      this.stopTracking();
      this.startTracking(true);
    }
  }

  // 📊 Get precision GPS status and metrics
  getPrecisionStatus(): {
    isActive: boolean;
    currentAccuracy: number;
    locationHistory: Array<{ location: LocationPoint; quality: string; confidence: number }>;
  } {
    return {
      isActive: this.usePrecisionMode,
      currentAccuracy: this.usePrecisionMode ? this.precisionGPS.getCurrentAccuracy() : this.trackingState.accuracy,
      locationHistory: this.usePrecisionMode ? this.precisionGPS.getLocationHistory() : []
    };
  }
}

export const gpsService = new GPSService();
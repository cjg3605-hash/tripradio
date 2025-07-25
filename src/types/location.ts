export interface GeofenceZone {
  id: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // meters
  name: string;
  description?: string;
  type: 'poi' | 'region' | 'warning';
  metadata?: {
    guideId?: string;
    chapterId?: number;
    audioTrigger?: boolean;
    notificationMessage?: string;
  };
}

export interface LocationPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationTrackingOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  trackingInterval: number; // milliseconds
  distanceFilter: number; // minimum distance in meters to trigger update
}

export interface VisitRecord {
  id: string;
  location: LocationPoint;
  arrivalTime: number;
  departureTime?: number;
  duration?: number; // calculated when departure is recorded
  geofenceId?: string;
  activityType?: 'stationary' | 'walking' | 'transport';
}

export interface LocationStats {
  totalDistance: number; // meters
  totalDuration: number; // milliseconds
  visitedPOIs: number;
  averageSpeed: number; // m/s
  movementPattern: 'explorer' | 'focused' | 'rusher';
}

export interface GeofenceEvent {
  type: 'enter' | 'exit' | 'dwell';
  geofenceId: string;
  location: LocationPoint;
  timestamp: number;
  dwellTime?: number; // for dwell events
}

export type LocationPermissionState = 'prompt' | 'granted' | 'denied';

export interface LocationTrackingState {
  isTracking: boolean;
  currentLocation: LocationPoint | null;
  accuracy: number;
  permissionState: LocationPermissionState;
  error: string | null;
  lastUpdate: number;
  batterySaver: boolean;
}

export interface RouteProgress {
  totalPOIs: number;
  visitedPOIs: number;
  currentPOI?: string;
  nextPOI?: string;
  distanceToNext?: number;
  estimatedTimeToNext?: number;
  completionPercentage: number;
}

export interface LocationServiceConfig {
  tracking: LocationTrackingOptions;
  geofencing: {
    checkInterval: number;
    dwellThreshold: number; // milliseconds
    exitThreshold: number; // meters
  };
  analytics: {
    recordVisits: boolean;
    calculateStats: boolean;
    storageLimit: number; // number of location points to keep
  };
}
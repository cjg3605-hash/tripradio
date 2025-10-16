import { GeofenceZone, LocationPoint, GeofenceEvent, VisitRecord, LocationStats } from '@/types/location';
import { gpsService } from './gps-service';

class GeofencingService {
  private geofences: Map<string, GeofenceZone> = new Map();
  private activeZones: Set<string> = new Set();
  private dwellTimers: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Array<(event: GeofenceEvent) => void> = [];
  private visits: VisitRecord[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  
  private lastCheckTime = 0;
  private checkIntervalMs = 2000; // 2 seconds

  constructor() {
    this.loadStoredData();
    
    // Listen to GPS updates
    gpsService.addLocationListener((location) => {
      this.checkGeofences(location);
    });
  }

  private loadStoredData(): void {
    try {
      // Load geofences
      const storedGeofences = localStorage.getItem('navi-geofences');
      if (storedGeofences) {
        const data = JSON.parse(storedGeofences);
        Object.entries(data).forEach(([id, zone]) => {
          this.geofences.set(id, zone as GeofenceZone);
        });
      }

      // Load visits
      const storedVisits = localStorage.getItem('navi-visits');
      if (storedVisits) {
        this.visits = JSON.parse(storedVisits);
      }

      // Load active zones
      const storedActive = localStorage.getItem('navi-active-zones');
      if (storedActive) {
        const activeArray = JSON.parse(storedActive);
        this.activeZones = new Set(activeArray);
      }
    } catch (error) {
      console.error('Failed to load geofencing data:', error);
    }
  }

  private saveStoredData(): void {
    try {
      // Save geofences
      const geofencesObj = Object.fromEntries(this.geofences);
      localStorage.setItem('navi-geofences', JSON.stringify(geofencesObj));

      // Save visits
      localStorage.setItem('navi-visits', JSON.stringify(this.visits));

      // Save active zones
      localStorage.setItem('navi-active-zones', JSON.stringify([...this.activeZones]));
    } catch (error) {
      console.error('Failed to save geofencing data:', error);
    }
  }

  addGeofence(zone: GeofenceZone): void {
    this.geofences.set(zone.id, zone);
    this.saveStoredData();
  }

  removeGeofence(zoneId: string): void {
    this.geofences.delete(zoneId);
    this.activeZones.delete(zoneId);
    
    // Clear any pending dwell timer
    const dwellTimer = this.dwellTimers.get(zoneId);
    if (dwellTimer) {
      clearTimeout(dwellTimer);
      this.dwellTimers.delete(zoneId);
    }
    
    this.saveStoredData();
  }

  getGeofence(zoneId: string): GeofenceZone | undefined {
    return this.geofences.get(zoneId);
  }

  getAllGeofences(): GeofenceZone[] {
    return Array.from(this.geofences.values());
  }

  getActiveZones(): string[] {
    return Array.from(this.activeZones);
  }

  private checkGeofences(location: LocationPoint): void {
    const now = Date.now();
    
    // Throttle checks to avoid excessive processing
    if (now - this.lastCheckTime < this.checkIntervalMs) {
      return;
    }
    this.lastCheckTime = now;

    const currentlyInside = new Set<string>();

    // Check each geofence
    this.geofences.forEach((zone, zoneId) => {
      const isInside = this.isLocationInGeofence(location, zone);
      
      if (isInside) {
        currentlyInside.add(zoneId);
        
        // Check for zone entry
        if (!this.activeZones.has(zoneId)) {
          this.handleZoneEntry(zoneId, zone, location);
        }
      }
    });

    // Check for zone exits
    this.activeZones.forEach(zoneId => {
      if (!currentlyInside.has(zoneId)) {
        const zone = this.geofences.get(zoneId);
        if (zone) {
          this.handleZoneExit(zoneId, zone, location);
        }
      }
    });
  }

  private isLocationInGeofence(location: LocationPoint, zone: GeofenceZone): boolean {
    const distance = this.calculateDistance(
      location.lat,
      location.lng,
      zone.center.lat,
      zone.center.lng
    );
    
    return distance <= zone.radius;
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

  private handleZoneEntry(zoneId: string, zone: GeofenceZone, location: LocationPoint): void {
    this.activeZones.add(zoneId);
    
    const event: GeofenceEvent = {
      type: 'enter',
      geofenceId: zoneId,
      location,
      timestamp: Date.now()
    };

    // Start visit record
    const visit: VisitRecord = {
      id: `${zoneId}_${Date.now()}`,
      location,
      arrivalTime: Date.now(),
      geofenceId: zoneId,
      activityType: this.detectActivityType(location)
    };
    this.visits.push(visit);

    // Set up dwell timer if configured
    if (zone.metadata?.audioTrigger) {
      const dwellTimer = setTimeout(() => {
        this.handleDwellEvent(zoneId, zone, location);
      }, 30000); // 30 seconds dwell time
      
      this.dwellTimers.set(zoneId, dwellTimer);
    }

    this.notifyListeners(event);
    this.saveStoredData();
  }

  private handleZoneExit(zoneId: string, zone: GeofenceZone, location: LocationPoint): void {
    this.activeZones.delete(zoneId);
    
    // Clear dwell timer
    const dwellTimer = this.dwellTimers.get(zoneId);
    if (dwellTimer) {
      clearTimeout(dwellTimer);
      this.dwellTimers.delete(zoneId);
    }

    // Complete visit record
    const visit = this.visits.findLast(v => v.geofenceId === zoneId && !v.departureTime);
    if (visit) {
      visit.departureTime = Date.now();
      visit.duration = visit.departureTime - visit.arrivalTime;
    }

    const event: GeofenceEvent = {
      type: 'exit',
      geofenceId: zoneId,
      location,
      timestamp: Date.now()
    };

    this.notifyListeners(event);
    this.saveStoredData();
  }

  private handleDwellEvent(zoneId: string, zone: GeofenceZone, location: LocationPoint): void {
    const dwellTime = 30000; // 30 seconds

    const event: GeofenceEvent = {
      type: 'dwell',
      geofenceId: zoneId,
      location,
      timestamp: Date.now(),
      dwellTime
    };

    this.notifyListeners(event);
    this.dwellTimers.delete(zoneId);
  }

  private detectActivityType(location: LocationPoint): 'stationary' | 'walking' | 'transport' {
    const speed = location.speed || 0;
    
    if (speed < 0.5) return 'stationary';
    if (speed < 2.0) return 'walking';
    return 'transport';
  }

  // Geofence management from POIs
  setupPOIGeofences(pois: Array<{ id: string; name: string; lat: number; lng: number; radius?: number }>): void {
    pois.forEach(poi => {
      const geofence: GeofenceZone = {
        id: `poi_${poi.id}`,
        center: { lat: poi.lat, lng: poi.lng },
        radius: poi.radius || 50, // default 50m radius
        name: poi.name,
        type: 'poi',
        metadata: {
          guideId: poi.id,
          audioTrigger: true,
          notificationMessage: `${poi.name}에 도착했습니다`
        }
      };
      
      this.addGeofence(geofence);
    });
  }

  // Analytics
  getLocationStats(): LocationStats {
    const history = gpsService.getLocationHistory();
    
    if (history.length < 2) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        visitedPOIs: 0,
        averageSpeed: 0,
        movementPattern: 'focused'
      };
    }

    let totalDistance = 0;
    let totalDuration = 0;
    const speeds: number[] = [];

    // Calculate total distance and duration
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];
      
      const distance = this.calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      const timeDiff = curr.timestamp - prev.timestamp;
      
      totalDistance += distance;
      totalDuration += timeDiff;
      
      if (timeDiff > 0) {
        const speed = distance / (timeDiff / 1000); // m/s
        speeds.push(speed);
      }
    }

    const averageSpeed = speeds.length > 0 
      ? speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length 
      : 0;

    // Count unique POI visits
    const visitedPOIs = new Set(
      this.visits
        .filter(v => v.geofenceId?.startsWith('poi_'))
        .map(v => v.geofenceId)
    ).size;

    // Determine movement pattern
    let movementPattern: 'explorer' | 'focused' | 'rusher' = 'focused';
    if (averageSpeed > 1.5) {
      movementPattern = 'rusher';
    } else if (visitedPOIs > 5 && averageSpeed < 0.8) {
      movementPattern = 'explorer';
    }

    return {
      totalDistance,
      totalDuration,
      visitedPOIs,
      averageSpeed,
      movementPattern
    };
  }

  getVisitHistory(): VisitRecord[] {
    return [...this.visits].sort((a, b) => b.arrivalTime - a.arrivalTime);
  }

  getNearestPOI(location: LocationPoint): { distance: number; geofence: GeofenceZone } | null {
    let nearest: { distance: number; geofence: GeofenceZone } | null = null;

    this.geofences.forEach(geofence => {
      if (geofence.type === 'poi') {
        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          geofence.center.lat,
          geofence.center.lng
        );

        if (!nearest || distance < nearest.distance) {
          nearest = { distance, geofence };
        }
      }
    });

    return nearest;
  }

  // Event listeners
  addGeofenceListener(listener: (event: GeofenceEvent) => void): void {
    this.listeners.push(listener);
  }

  removeGeofenceListener(listener: (event: GeofenceEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(event: GeofenceEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  // Cleanup
  clearVisitHistory(): void {
    this.visits = [];
    this.saveStoredData();
  }

  clearAllGeofences(): void {
    this.geofences.clear();
    this.activeZones.clear();
    this.dwellTimers.forEach(timer => clearTimeout(timer));
    this.dwellTimers.clear();
    this.saveStoredData();
  }

  destroy(): void {
    this.clearAllGeofences();
    this.checkInterval && clearInterval(this.checkInterval);
    this.listeners = [];
  }
}

export const geofencingService = new GeofencingService();
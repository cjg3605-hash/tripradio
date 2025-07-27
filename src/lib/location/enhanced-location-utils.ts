/**
 * Enhanced Location Utilities
 * 기존 locations.ts를 대체하는 고정확도 위치 서비스
 */

import { enhancedGeocodingService, type LocationValidationResult } from './enhanced-geocoding-service';
import { TOUR_LOCATIONS, type TourLocation, getLocationCoordinates } from '@/data/locations';

export interface EnhancedLocationResult {
  id: string;
  name: string;
  center: {
    lat: number;
    lng: number;
    name: string;
    description?: string;
    accuracy: number;
    confidence: number;
    sources: string[];
  };
  pois?: Array<{
    lat: number;
    lng: number;
    name: string;
    description?: string;
    accuracy?: number;
  }>;
  recommendedZoom: number;
  dataSource: 'static' | 'dynamic' | 'hybrid';
}

/**
 * 하이브리드 위치 검색 서비스
 * 1. 기존 정적 데이터 우선 확인
 * 2. 동적 지오코딩으로 보완
 * 3. 교차 검증으로 최적 결과 제공
 */
export class EnhancedLocationService {
  private cache = new Map<string, EnhancedLocationResult>();
  private cacheExpiry = 12 * 60 * 60 * 1000; // 12시간

  /**
   * 위치 검색 (하이브리드 방식)
   */
  async findLocation(locationName: string, options?: {
    preferStatic?: boolean;
    language?: string;
    country?: string;
  }): Promise<EnhancedLocationResult> {
    const cacheKey = this.generateCacheKey(locationName, options);
    
    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let result: EnhancedLocationResult;

    try {
      // Step 1: 정적 데이터 확인
      const staticLocation = getLocationCoordinates(locationName);
      
      if (staticLocation && options?.preferStatic) {
        // 정적 데이터 우선 모드
        result = this.convertStaticToEnhanced(staticLocation, 'static');
      } else {
        // Step 2: 동적 지오코딩 시도
        try {
          const dynamicResult = await enhancedGeocodingService.geocode(locationName, {
            language: options?.language || 'ko',
            components: options?.country ? { country: options.country } : undefined
          });

          // Step 3: 정적 + 동적 데이터 비교 및 최적 선택
          if (staticLocation) {
            result = await this.hybridValidation(staticLocation, dynamicResult, locationName);
          } else {
            result = this.convertDynamicToEnhanced(dynamicResult, locationName);
          }
        } catch (dynamicError) {
          console.warn('Dynamic geocoding failed, fallback to static:', dynamicError);
          
          if (staticLocation) {
            result = this.convertStaticToEnhanced(staticLocation, 'static');
          } else {
            throw new Error(`No location data found for: ${locationName}`);
          }
        }
      }

      // 캐시 저장
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);

      return result;
    } catch (error) {
      throw new Error(`Location search failed for "${locationName}": ${error}`);
    }
  }

  /**
   * 다중 위치 일괄 검색
   */
  async findMultipleLocations(locationNames: string[], options?: {
    language?: string;
    country?: string;
    concurrency?: number;
  }): Promise<EnhancedLocationResult[]> {
    const concurrency = options?.concurrency || 3;
    const results: EnhancedLocationResult[] = [];
    
    // 배치 단위로 처리
    for (let i = 0; i < locationNames.length; i += concurrency) {
      const batch = locationNames.slice(i, i + concurrency);
      const batchPromises = batch.map(name => 
        this.findLocation(name, options).catch(error => {
          console.warn(`Failed to find location: ${name}`, error);
          return null;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean) as EnhancedLocationResult[]);
    }
    
    return results;
  }

  /**
   * 정적 + 동적 하이브리드 검증
   */
  private async hybridValidation(
    staticLocation: TourLocation, 
    dynamicResult: LocationValidationResult,
    locationName: string
  ): Promise<EnhancedLocationResult> {
    const staticAccuracy = 0.85; // 정적 데이터 기본 정확도
    const distance = this.calculateDistance(
      staticLocation.center,
      dynamicResult.coordinates
    );

    // 거리 임계값: 500m
    const distanceThreshold = 0.5; // km
    
    if (distance <= distanceThreshold && dynamicResult.confidence > 0.7) {
      // 가까운 거리 + 높은 신뢰도 = 하이브리드 결과
      const hybridCenter = this.calculateWeightedAverage(
        staticLocation.center,
        dynamicResult.coordinates,
        staticAccuracy,
        dynamicResult.confidence
      );

      return {
        id: staticLocation.id,
        name: staticLocation.name,
        center: {
          ...hybridCenter,
          name: staticLocation.center.name,
          description: staticLocation.center.description,
          accuracy: Math.max(staticAccuracy, dynamicResult.accuracy),
          confidence: (staticAccuracy + dynamicResult.confidence) / 2,
          sources: ['static', ...dynamicResult.sources]
        },
        pois: staticLocation.pois?.map(poi => ({
          ...poi,
          accuracy: staticAccuracy
        })),
        recommendedZoom: Math.max(dynamicResult.recommendedZoom, 15),
        dataSource: 'hybrid'
      };
    } else if (dynamicResult.confidence > staticAccuracy + 0.1) {
      // 동적 결과가 확실히 더 좋은 경우
      return this.convertDynamicToEnhanced(dynamicResult, locationName);
    } else {
      // 정적 데이터 우선
      return this.convertStaticToEnhanced(staticLocation, 'static');
    }
  }

  /**
   * 정적 데이터를 Enhanced 형태로 변환
   */
  private convertStaticToEnhanced(
    staticLocation: TourLocation, 
    source: 'static' | 'hybrid' = 'static'
  ): EnhancedLocationResult {
    return {
      id: staticLocation.id,
      name: staticLocation.name,
      center: {
        ...staticLocation.center,
        accuracy: 0.85,
        confidence: 0.9,
        sources: ['static']
      },
      pois: staticLocation.pois?.map(poi => ({
        ...poi,
        accuracy: 0.85
      })),
      recommendedZoom: 16,
      dataSource: source
    };
  }

  /**
   * 동적 결과를 Enhanced 형태로 변환
   */
  private convertDynamicToEnhanced(
    dynamicResult: LocationValidationResult,
    locationName: string
  ): EnhancedLocationResult {
    return {
      id: this.generateLocationId(locationName),
      name: locationName,
      center: {
        lat: dynamicResult.coordinates.lat,
        lng: dynamicResult.coordinates.lng,
        name: locationName,
        accuracy: dynamicResult.accuracy,
        confidence: dynamicResult.confidence,
        sources: dynamicResult.sources
      },
      recommendedZoom: dynamicResult.recommendedZoom,
      dataSource: 'dynamic'
    };
  }

  /**
   * 가중 평균 좌표 계산
   */
  private calculateWeightedAverage(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number },
    weight1: number,
    weight2: number
  ): { lat: number; lng: number } {
    const totalWeight = weight1 + weight2;
    
    return {
      lat: (point1.lat * weight1 + point2.lat * weight2) / totalWeight,
      lng: (point1.lng * weight1 + point2.lng * weight2) / totalWeight
    };
  }

  /**
   * 두 지점 간 거리 계산 (Haversine)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 위치 ID 생성
   */
  private generateLocationId(locationName: string): string {
    return locationName.toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '')
      .substring(0, 20);
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(locationName: string, options?: any): string {
    return `${locationName}-${JSON.stringify(options || {})}`;
  }

  /**
   * 인근 위치 검색
   */
  async findNearbyLocations(
    center: { lat: number; lng: number },
    radiusKm: number = 5
  ): Promise<EnhancedLocationResult[]> {
    const nearbyStatic = Object.values(TOUR_LOCATIONS).filter(location => {
      const distance = this.calculateDistance(center, location.center);
      return distance <= radiusKm;
    });

    return nearbyStatic.map(location => 
      this.convertStaticToEnhanced(location, 'static')
    );
  }

  /**
   * 캐시 정리
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 캐시 상태 조회
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 싱글톤 인스턴스 생성
export const enhancedLocationService = new EnhancedLocationService();

/**
 * 편의 함수들
 */

/**
 * 빠른 위치 검색 (캐시 우선)
 */
export async function findLocationFast(locationName: string): Promise<EnhancedLocationResult> {
  return enhancedLocationService.findLocation(locationName, { preferStatic: true });
}

/**
 * 정확한 위치 검색 (동적 우선)
 */
export async function findLocationAccurate(locationName: string): Promise<EnhancedLocationResult> {
  return enhancedLocationService.findLocation(locationName, { preferStatic: false });
}

/**
 * 기본 위치 (서울 중심가)
 */
export const DEFAULT_ENHANCED_LOCATION: EnhancedLocationResult = {
  id: 'seoul-center',
  name: '서울 중심가',
  center: {
    lat: 37.5665,
    lng: 126.9780,
    name: '서울 중심가',
    accuracy: 0.8,
    confidence: 0.8,
    sources: ['static']
  },
  recommendedZoom: 13,
  dataSource: 'static'
};
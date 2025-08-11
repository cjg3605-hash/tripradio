/**
 * Enhanced Geocoding Service
 * 다중 제공업체를 활용한 고정확도 위치 서비스
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  name: string;
  formattedAddress: string;
  placeId?: string;
  accuracy: number; // 0.0-1.0
  source: string;
  confidence: number; // 0.0-1.0
  types: string[];
  bounds?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface GeocodingOptions {
  language?: string;
  region?: string;
  types?: string[];
  bounds?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  components?: {
    country?: string;
    locality?: string;
  };
}

export interface LocationValidationResult {
  coordinates: { lat: number; lng: number };
  confidence: number;
  accuracy: number;
  sources: string[];
  consensus: boolean;
  recommendedZoom: number;
}

/**
 * 다중 지오코딩 제공업체 통합 서비스
 */
export class EnhancedGeocodingService {
  private cache = new Map<string, GeocodingResult[]>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24시간

  /**
   * 다중 소스를 활용한 지오코딩
   */
  async geocode(query: string, options: GeocodingOptions = {}): Promise<LocationValidationResult> {
    const cacheKey = this.generateCacheKey(query, options);
    
    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      const cachedResults = this.cache.get(cacheKey)!;
      return this.validateAndConsensus(cachedResults);
    }

    // 다중 소스 병렬 요청
    const results = await Promise.allSettled([
      this.geocodeWithOpenStreetMap(query, options),
      this.geocodeWithPhoton(query, options),
      // Google Places API는 API 키 설정 시에만 활성화
      ...((process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY) ? [this.geocodeWithGoogle(query, options)] : [])
    ]);

    // 성공한 결과만 추출
    const validResults = results
      .filter((result): result is PromiseFulfilledResult<GeocodingResult[]> => 
        result.status === 'fulfilled' && result.value.length > 0
      )
      .flatMap(result => result.value);

    // 캐시 저장
    if (validResults.length > 0) {
      this.cache.set(cacheKey, validResults);
      // 캐시 만료 설정
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);
    }

    return this.validateAndConsensus(validResults);
  }


  /**
   * Photon 지오코딩 (OpenStreetMap 기반, 더 빠른 응답)
   */
  private async geocodeWithPhoton(query: string, options: GeocodingOptions): Promise<GeocodingResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '5',
        ...(options.language && { lang: options.language }),
        ...(options.bounds && {
          bbox: `${options.bounds.southwest.lng},${options.bounds.southwest.lat},${options.bounds.northeast.lng},${options.bounds.northeast.lat}`
        })
      });

      const response = await fetch(`https://photon.komoot.io/api/?${params}`);
      
      if (!response.ok) throw new Error(`Photon API error: ${response.status}`);

      const data = await response.json();
      
      return data.features.map((feature: any) => ({
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        name: feature.properties.name || feature.properties.street || 'Unknown',
        formattedAddress: this.formatPhotonAddress(feature.properties),
        accuracy: this.calculatePhotonAccuracy(feature.properties),
        source: 'photon',
        confidence: 0.7, // Photon은 일반적으로 양호한 품질
        types: [feature.properties.osm_key, feature.properties.osm_value].filter(Boolean)
      }));
    } catch (error) {
      console.warn('Photon geocoding failed:', error);
      return [];
    }
  }

  /**
   * OpenStreetMap Overpass API (POI 중심)
   */
  private async geocodeWithOpenStreetMap(query: string, options: GeocodingOptions): Promise<GeocodingResult[]> {
    try {
      // Overpass API 쿼리 구성
      const overpassQuery = `
        [out:json][timeout:25];
        (
          nwr["name"~"${query}",i];
          nwr["name:en"~"${query}",i];
        );
        out center meta;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);

      const data = await response.json();
      
      return data.elements.slice(0, 5).map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lng = element.lon || element.center?.lon;
        
        return {
          lat,
          lng,
          name: element.tags?.name || element.tags?.['name:en'] || 'Unknown',
          formattedAddress: this.formatOSMAddress(element.tags),
          accuracy: this.calculateOSMAccuracy(element),
          source: 'osm',
          confidence: 0.8,
          types: [element.tags?.amenity, element.tags?.tourism, element.tags?.shop].filter(Boolean)
        };
      }).filter((result: any) => result.lat && result.lng);
    } catch (error) {
      console.warn('OSM Overpass geocoding failed:', error);
      return [];
    }
  }

  /**
   * Google Places API (API 키가 있는 경우)
   */
  private async geocodeWithGoogle(query: string, options: GeocodingOptions): Promise<GeocodingResult[]> {
    try {
      const params = new URLSearchParams({
        input: query,
        key: process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY!,
        ...(options.language && { language: options.language }),
        ...(options.components?.country && { components: `country:${options.components.country}` })
      });

      const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
      
      if (!response.ok) throw new Error(`Google Places API error: ${response.status}`);

      const data = await response.json();
      
      // Place Details를 위한 추가 요청이 필요하지만, 여기서는 기본 정보만 사용
      return data.predictions.slice(0, 3).map((prediction: any) => ({
        lat: 0, // Place Details API로 별도 요청 필요
        lng: 0,
        name: prediction.structured_formatting?.main_text || prediction.description,
        formattedAddress: prediction.description,
        placeId: prediction.place_id,
        accuracy: 0.95, // Google은 일반적으로 높은 정확도
        source: 'google',
        confidence: 0.95,
        types: prediction.types
      }));
    } catch (error) {
      console.warn('Google Places geocoding failed:', error);
      return [];
    }
  }

  /**
   * 다중 결과 검증 및 합의 도출
   */
  private validateAndConsensus(results: GeocodingResult[]): LocationValidationResult {
    if (results.length === 0) {
      throw new Error('No geocoding results found');
    }

    // 거리 기준 클러스터링 (100m 반경)
    const clusters = this.clusterByDistance(results, 0.001); // 약 100m
    const bestCluster = clusters.reduce((best, current) => 
      current.length > best.length ? current : best
    );

    // 가중 평균 중심점 계산
    const weightedCenter = this.calculateWeightedCenter(bestCluster);
    
    // 신뢰도 계산
    const confidence = this.calculateConsensusConfidence(bestCluster, results.length);
    
    // 정확도 계산
    const accuracy = this.calculateClusterAccuracy(bestCluster);
    
    // 추천 줌 레벨 계산
    const recommendedZoom = this.calculateRecommendedZoom(bestCluster);

    return {
      coordinates: weightedCenter,
      confidence,
      accuracy,
      sources: bestCluster.map(r => r.source),
      consensus: bestCluster.length >= Math.ceil(results.length * 0.6), // 60% 이상 합의
      recommendedZoom
    };
  }

  /**
   * 거리 기준 클러스터링
   */
  private clusterByDistance(results: GeocodingResult[], threshold: number): GeocodingResult[][] {
    const clusters: GeocodingResult[][] = [];
    const used = new Set<number>();

    for (let i = 0; i < results.length; i++) {
      if (used.has(i)) continue;

      const cluster = [results[i]];
      used.add(i);

      for (let j = i + 1; j < results.length; j++) {
        if (used.has(j)) continue;

        const distance = this.calculateDistance(results[i], results[j]);
        if (distance <= threshold) {
          cluster.push(results[j]);
          used.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * 가중 평균 중심점 계산
   */
  private calculateWeightedCenter(cluster: GeocodingResult[]): { lat: number; lng: number } {
    const totalWeight = cluster.reduce((sum, result) => sum + result.confidence, 0);
    
    const weightedLat = cluster.reduce((sum, result) => 
      sum + (result.lat * result.confidence), 0) / totalWeight;
    
    const weightedLng = cluster.reduce((sum, result) => 
      sum + (result.lng * result.confidence), 0) / totalWeight;

    return { lat: weightedLat, lng: weightedLng };
  }

  /**
   * 합의 신뢰도 계산
   */
  private calculateConsensusConfidence(cluster: GeocodingResult[], totalResults: number): number {
    const clusterRatio = cluster.length / totalResults;
    const avgConfidence = cluster.reduce((sum, r) => sum + r.confidence, 0) / cluster.length;
    
    return Math.min(clusterRatio * avgConfidence * 1.2, 1.0);
  }

  /**
   * 클러스터 정확도 계산
   */
  private calculateClusterAccuracy(cluster: GeocodingResult[]): number {
    return cluster.reduce((sum, r) => sum + r.accuracy, 0) / cluster.length;
  }

  /**
   * 추천 줌 레벨 계산
   */
  private calculateRecommendedZoom(cluster: GeocodingResult[]): number {
    const accuracySum = cluster.reduce((sum, r) => sum + r.accuracy, 0);
    const avgAccuracy = accuracySum / cluster.length;
    
    // 정확도에 따른 줌 레벨 결정
    if (avgAccuracy > 0.9) return 17; // 매우 정확
    if (avgAccuracy > 0.8) return 16; // 정확
    if (avgAccuracy > 0.7) return 15; // 보통
    if (avgAccuracy > 0.6) return 14; // 낮음
    return 13; // 매우 낮음
  }

  /**
   * 두 지점 간 거리 계산 (Haversine 공식)
   */
  private calculateDistance(point1: GeocodingResult, point2: GeocodingResult): number {
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
   * 캐시 키 생성
   */
  private generateCacheKey(query: string, options: GeocodingOptions): string {
    return `${query}-${JSON.stringify(options)}`;
  }

  /**
   * 정확도 계산 헬퍼 메서드들
   */

  private calculatePhotonAccuracy(properties: any): number {
    const hasName = !!properties.name;
    const hasStreet = !!properties.street;
    const hasHouseNumber = !!properties.housenumber;
    
    return 0.6 + (hasName ? 0.2 : 0) + (hasStreet ? 0.1 : 0) + (hasHouseNumber ? 0.1 : 0);
  }

  private calculateOSMAccuracy(element: any): number {
    const hasName = !!(element.tags?.name || element.tags?.['name:en']);
    const hasDetailedTags = Object.keys(element.tags || {}).length > 2;
    
    return 0.7 + (hasName ? 0.2 : 0) + (hasDetailedTags ? 0.1 : 0);
  }

  /**
   * 주소 포맷팅 헬퍼 메서드들
   */
  private formatPhotonAddress(properties: any): string {
    const parts = [
      properties.name,
      properties.street,
      properties.city || properties.state,
      properties.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  private formatOSMAddress(tags: any): string {
    const parts = [
      tags?.name || tags?.['name:en'],
      tags?.['addr:street'],
      tags?.['addr:city'] || tags?.['addr:state'],
      tags?.['addr:country']
    ].filter(Boolean);
    
    return parts.join(', ') || 'Unknown Address';
  }
}

// 싱글톤 인스턴스
export const enhancedGeocodingService = new EnhancedGeocodingService();
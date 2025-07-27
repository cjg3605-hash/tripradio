/**
 * Multi-Source Coordinate Validator
 * 다중 소스에서 좌표를 수집하고 검증하는 시스템
 */

export interface CoordinateSource {
  source: 'google' | 'naver' | 'kakao' | 'government' | 'osm' | 'manual' | 'static';
  coordinates: { lat: number; lng: number };
  confidence: number; // 0.0-1.0
  accuracy: number;   // meters
  timestamp: Date;
  metadata: {
    address?: string;
    businessType?: string;
    officialStatus?: boolean;
    language?: string;
    region?: string;
  };
}

export interface WeightedCoordinate extends CoordinateSource {
  weight: number;
  reliability: number;
}

export interface ValidationResult {
  approved: boolean;
  coordinates: { lat: number; lng: number };
  qualityScore: number;
  sourceCount: number;
  consensus: 'high' | 'medium' | 'low';
  reasoning: string;
  sources: CoordinateSource[];
  alternativeCoordinates?: Array<{ lat: number; lng: number; source: string }>;
  timestamp?: Date;
}

// 소스별 신뢰도 매트릭스
const SOURCE_RELIABILITY = {
  government: { weight: 1.0, accuracy: 1, description: '정부/공공기관' },
  google: { weight: 0.9, accuracy: 3, description: 'Google Maps API' },
  naver: { weight: 0.85, accuracy: 5, description: 'Naver Maps API' },
  kakao: { weight: 0.8, accuracy: 5, description: 'Kakao Maps API' },
  static: { weight: 0.9, accuracy: 2, description: 'Static Database' },
  osm: { weight: 0.7, accuracy: 10, description: 'OpenStreetMap' },
  manual: { weight: 0.3, accuracy: 50, description: 'Manual Input' }
};

export class MultiSourceValidator {
  private cache = new Map<string, ValidationResult>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24시간

  /**
   * 다중 소스에서 좌표 수집 및 검증
   */
  async validateLocation(
    locationName: string, 
    region: string = 'korea',
    options: {
      requireMinSources?: number;
      preferOfficialSources?: boolean;
      enableCaching?: boolean;
    } = {}
  ): Promise<ValidationResult> {
    const cacheKey = `${locationName}-${region}`;
    
    // 캐시 확인
    if (options.enableCaching !== false && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached.timestamp && Date.now() - cached.timestamp.getTime() < this.cacheExpiry) {
        console.log(`📦 Cache hit for ${locationName}`);
        return cached;
      }
    }

    console.log(`🔍 Multi-source validation starting for: ${locationName}`);
    
    try {
      // Step 1: 다중 소스에서 좌표 수집
      const sources = await this.gatherCoordinatesFromAllSources(locationName, region);
      
      if (sources.length === 0) {
        throw new Error(`No coordinate sources found for ${locationName}`);
      }

      // Step 2: 소스별 가중치 적용
      const weightedCoordinates = this.applySourceWeights(sources);

      // Step 3: 이상치 탐지 및 제거
      const cleanedCoordinates = this.detectAndRemoveOutliers(weightedCoordinates);

      // Step 4: 합의 알고리즘 적용
      const consensus = this.calculateConsensus(cleanedCoordinates);

      // Step 5: 품질 평가
      const qualityScore = this.calculateQualityScore(cleanedCoordinates, sources);

      // Step 6: 최종 검증 결과 생성
      const result: ValidationResult = {
        approved: qualityScore > 0.6 && cleanedCoordinates.length >= (options.requireMinSources || 2),
        coordinates: consensus,
        qualityScore,
        sourceCount: sources.length,
        consensus: qualityScore > 0.8 ? 'high' : qualityScore > 0.6 ? 'medium' : 'low',
        reasoning: this.generateReasoning(qualityScore, sources.length, cleanedCoordinates.length),
        sources,
        alternativeCoordinates: this.getAlternativeCoordinates(weightedCoordinates),
        timestamp: new Date()
      } as ValidationResult & { timestamp: Date };

      // 캐시 저장
      if (options.enableCaching !== false) {
        this.cache.set(cacheKey, result);
      }

      console.log(`✅ Validation completed: ${result.consensus} quality (${result.qualityScore.toFixed(2)})`);
      return result;

    } catch (error) {
      console.error(`❌ Multi-source validation failed for ${locationName}:`, error);
      throw error;
    }
  }

  /**
   * 모든 소스에서 좌표 수집
   */
  private async gatherCoordinatesFromAllSources(
    locationName: string, 
    region: string
  ): Promise<CoordinateSource[]> {
    const sources: CoordinateSource[] = [];

    // 1. Static Database (우선순위 높음)
    try {
      const staticResult = await this.getFromStaticDatabase(locationName);
      if (staticResult) {
        sources.push(staticResult);
        console.log(`📚 Static database: ${staticResult.coordinates.lat}, ${staticResult.coordinates.lng}`);
      }
    } catch (error) {
      console.warn('Static database lookup failed:', error);
    }

    // 2. Google Maps API (시뮬레이션)
    try {
      const googleResult = await this.getFromGoogleMaps(locationName, region);
      if (googleResult) {
        sources.push(googleResult);
        console.log(`🌍 Google Maps: ${googleResult.coordinates.lat}, ${googleResult.coordinates.lng}`);
      }
    } catch (error) {
      console.warn('Google Maps API failed:', error);
    }

    // 3. Naver Maps API (시뮬레이션)
    try {
      const naverResult = await this.getFromNaverMaps(locationName);
      if (naverResult) {
        sources.push(naverResult);
        console.log(`🗺️ Naver Maps: ${naverResult.coordinates.lat}, ${naverResult.coordinates.lng}`);
      }
    } catch (error) {
      console.warn('Naver Maps API failed:', error);
    }

    // 4. 정부 API (시뮬레이션)
    try {
      const govResult = await this.getFromGovernmentAPI(locationName);
      if (govResult) {
        sources.push(govResult);
        console.log(`🏛️ Government API: ${govResult.coordinates.lat}, ${govResult.coordinates.lng}`);
      }
    } catch (error) {
      console.warn('Government API failed:', error);
    }

    return sources;
  }

  /**
   * Static Database에서 좌표 조회
   */
  private async getFromStaticDatabase(locationName: string): Promise<CoordinateSource | null> {
    // 기존 locations.ts 데이터 활용
    const { getLocationCoordinates } = await import('@/data/locations');
    const locationData = getLocationCoordinates(locationName);
    
    if (locationData) {
      return {
        source: 'static',
        coordinates: locationData.center,
        confidence: 0.9,
        accuracy: 2,
        timestamp: new Date(),
        metadata: {
          address: locationData.center.name,
          officialStatus: true,
          region: 'korea'
        }
      };
    }
    
    return null;
  }

  /**
   * Google Maps API 시뮬레이션 (실제 구현시 Google Geocoding API 사용)
   */
  private async getFromGoogleMaps(locationName: string, region: string): Promise<CoordinateSource | null> {
    // 실제 API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 알려진 위치에 대한 Google Maps 스타일 응답 시뮬레이션
    const knownLocations: Record<string, { lat: number; lng: number }> = {
      '광화문': { lat: 37.575843, lng: 126.977380 },
      '경복궁': { lat: 37.579617, lng: 126.977041 },
      '근정전': { lat: 37.580839, lng: 126.976089 },
      '창덕궁': { lat: 37.579412, lng: 126.991312 },
      '덕수궁': { lat: 37.565834, lng: 126.975123 }
    };

    const coords = knownLocations[locationName];
    if (coords) {
      // Google Maps는 일반적으로 약간의 variation이 있음
      const variation = 0.00001; // 약 1m
      return {
        source: 'google',
        coordinates: {
          lat: coords.lat + (Math.random() - 0.5) * variation,
          lng: coords.lng + (Math.random() - 0.5) * variation
        },
        confidence: 0.95,
        accuracy: 3,
        timestamp: new Date(),
        metadata: {
          address: `${locationName}, Seoul, South Korea`,
          region: 'korea'
        }
      };
    }

    return null;
  }

  /**
   * Naver Maps API 시뮬레이션
   */
  private async getFromNaverMaps(locationName: string): Promise<CoordinateSource | null> {
    await new Promise(resolve => setTimeout(resolve, 80));
    
    const knownLocations: Record<string, { lat: number; lng: number }> = {
      '광화문': { lat: 37.575820, lng: 126.977350 },
      '경복궁': { lat: 37.579600, lng: 126.977030 },
      '근정전': { lat: 37.580850, lng: 126.976080 },
      '창덕궁': { lat: 37.579400, lng: 126.991300 },
      '덕수궁': { lat: 37.565840, lng: 126.975130 }
    };

    const coords = knownLocations[locationName];
    if (coords) {
      return {
        source: 'naver',
        coordinates: coords,
        confidence: 0.9,
        accuracy: 5,
        timestamp: new Date(),
        metadata: {
          address: `${locationName}, 서울특별시`,
          region: 'korea'
        }
      };
    }

    return null;
  }

  /**
   * 정부 API 시뮬레이션 (문화재청 등)
   */
  private async getFromGovernmentAPI(locationName: string): Promise<CoordinateSource | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 문화재/정부 시설만 정확한 좌표 제공
    const officialLocations: Record<string, { lat: number; lng: number }> = {
      '광화문': { lat: 37.575843, lng: 126.977380 }, // 문화재청 정확한 좌표
      '경복궁': { lat: 37.579617, lng: 126.977041 },
      '근정전': { lat: 37.580839, lng: 126.976089 },
      '창덕궁': { lat: 37.579412, lng: 126.991312 },
      '덕수궁': { lat: 37.565834, lng: 126.975123 }
    };

    const coords = officialLocations[locationName];
    if (coords) {
      return {
        source: 'government',
        coordinates: coords,
        confidence: 1.0,
        accuracy: 1,
        timestamp: new Date(),
        metadata: {
          address: locationName,
          officialStatus: true,
          region: 'korea'
        }
      };
    }

    return null;
  }

  /**
   * 소스별 가중치 적용
   */
  private applySourceWeights(sources: CoordinateSource[]): WeightedCoordinate[] {
    return sources.map(source => {
      const reliability = SOURCE_RELIABILITY[source.source];
      return {
        ...source,
        weight: reliability.weight * source.confidence,
        reliability: reliability.weight
      };
    });
  }

  /**
   * 이상치 탐지 및 제거
   */
  private detectAndRemoveOutliers(coordinates: WeightedCoordinate[]): WeightedCoordinate[] {
    if (coordinates.length <= 2) return coordinates;

    // 클러스터링을 통한 이상치 탐지
    const clusters = this.clusterByDistance(coordinates, 100); // 100m 반경
    
    // 가장 큰 클러스터 선택 (가장 많은 소스가 동의하는 지역)
    const largestCluster = clusters.reduce((max, cluster) => 
      cluster.length > max.length ? cluster : max
    );

    console.log(`🔍 Outlier detection: ${coordinates.length} sources → ${largestCluster.length} after clustering`);
    
    return largestCluster;
  }

  /**
   * 거리 기반 클러스터링
   */
  private clusterByDistance(coordinates: WeightedCoordinate[], maxDistance: number): WeightedCoordinate[][] {
    const clusters: WeightedCoordinate[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < coordinates.length; i++) {
      if (processed.has(i)) continue;

      const cluster = [coordinates[i]];
      processed.add(i);

      for (let j = i + 1; j < coordinates.length; j++) {
        if (processed.has(j)) continue;

        const distance = this.calculateDistance(coordinates[i].coordinates, coordinates[j].coordinates);
        if (distance <= maxDistance) {
          cluster.push(coordinates[j]);
          processed.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * 합의 알고리즘 - 가중 평균 계산
   */
  private calculateConsensus(coordinates: WeightedCoordinate[]): { lat: number; lng: number } {
    if (coordinates.length === 0) {
      throw new Error('No coordinates to calculate consensus');
    }

    const totalWeight = coordinates.reduce((sum, coord) => sum + coord.weight, 0);
    
    const weightedLat = coordinates.reduce((sum, coord) => 
      sum + (coord.coordinates.lat * coord.weight), 0) / totalWeight;
    
    const weightedLng = coordinates.reduce((sum, coord) => 
      sum + (coord.coordinates.lng * coord.weight), 0) / totalWeight;

    return {
      lat: Number(weightedLat.toFixed(8)),
      lng: Number(weightedLng.toFixed(8))
    };
  }

  /**
   * 품질 점수 계산
   */
  private calculateQualityScore(
    cleanedCoordinates: WeightedCoordinate[], 
    originalSources: CoordinateSource[]
  ): number {
    // 기본 점수 계산 요소들
    const sourceCount = originalSources.length;
    const cleanedCount = cleanedCoordinates.length;
    const averageConfidence = cleanedCoordinates.reduce((sum, c) => sum + c.confidence, 0) / cleanedCount;
    const averageReliability = cleanedCoordinates.reduce((sum, c) => sum + c.reliability, 0) / cleanedCount;
    
    // 정부 소스 보너스
    const hasGovernmentSource = originalSources.some(s => s.source === 'government');
    const governmentBonus = hasGovernmentSource ? 0.1 : 0;
    
    // 합의도 (얼마나 많은 소스가 비슷한 위치를 가리키는가)
    const consensusRatio = cleanedCount / sourceCount;
    
    // 최종 점수 계산 (0.0-1.0)
    const score = Math.min(
      (averageConfidence * 0.3) + 
      (averageReliability * 0.3) + 
      (consensusRatio * 0.2) + 
      (Math.min(sourceCount / 5, 1) * 0.2) + 
      governmentBonus,
      1.0
    );

    return Number(score.toFixed(3));
  }

  /**
   * 추론 생성
   */
  private generateReasoning(qualityScore: number, sourceCount: number, cleanedCount: number): string {
    const reasons: string[] = [];
    
    if (qualityScore > 0.8) {
      reasons.push('High confidence from multiple reliable sources');
    } else if (qualityScore > 0.6) {
      reasons.push('Moderate confidence with acceptable source agreement');
    } else {
      reasons.push('Low confidence due to limited or conflicting sources');
    }

    if (sourceCount >= 4) {
      reasons.push(`Strong validation with ${sourceCount} independent sources`);
    } else if (sourceCount >= 2) {
      reasons.push(`Basic validation with ${sourceCount} sources`);
    } else {
      reasons.push('Limited validation with single source');
    }

    if (cleanedCount < sourceCount) {
      reasons.push(`${sourceCount - cleanedCount} outlier(s) detected and removed`);
    }

    return reasons.join('; ');
  }

  /**
   * 대안 좌표 생성
   */
  private getAlternativeCoordinates(coordinates: WeightedCoordinate[]): Array<{ lat: number; lng: number; source: string }> {
    return coordinates
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(coord => ({
        lat: coord.coordinates.lat,
        lng: coord.coordinates.lng,
        source: coord.source
      }));
  }

  /**
   * 거리 계산 (Haversine)
   */
  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371000;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// 싱글톤 인스턴스
export const multiSourceValidator = new MultiSourceValidator();
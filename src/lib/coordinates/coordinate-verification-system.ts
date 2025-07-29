/**
 * 좌표 검증 시스템 - OpenStreetMap Nominatim 우선, 다중 API 지원
 * 
 * 기능:
 * - AI 생성 좌표의 실시간 검증
 * - 다중 API 지원 (Nominatim 무료, Radar, Azure Maps)
 * - 인텔리전트 캐싱 시스템
 * - 배치 처리 최적화
 * - 타입 안전성 보장
 */

export interface CoordinateInput {
  lat: number;
  lng: number;
  context: string; // 위치명, 챕터명 등
  locationName: string; // 전체 위치명 (파리, 도쿄 등)
}

export interface VerificationResult {
  isValid: boolean;
  confidence: number; // 0-1 범위
  source: 'nominatim' | 'radar' | 'ai-original' | 'cache';
  coordinates: {
    lat: number;
    lng: number;
  };
  metadata: {
    address?: string;
    placeType?: string;
    distance?: number; // 원본 좌표와의 거리 (미터)
    verifiedAt: Date;
    apiResponseTime: number; // ms
  };
  error?: string;
}

export interface VerificationConfig {
  enableNominatim: boolean;
  enableRadarAPI: boolean;
  fallbackToOriginal: boolean;
  cacheEnabled: boolean;
  cacheTTL: number; // 캐시 유효 시간 (초)
  maxDistanceThreshold: number; // 최대 허용 거리 차이 (미터)
  minConfidenceThreshold: number; // 최소 신뢰도 임계값
  batchSize: number; // 배치 처리 크기
  timeoutMs: number; // API 타임아웃
  nominatimUserAgent: string; // Nominatim 필수 User-Agent
  nominatimRateLimit: number; // 요청 간 간격 (ms)
}

// OpenStreetMap Nominatim API 클라이언트 (완전 무료)
class NominatimClient {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent: string;
  private lastRequestTime = 0;
  private rateLimit: number;

  constructor(userAgent: string, rateLimit = 1000) {
    this.userAgent = userAgent;
    this.rateLimit = rateLimit; // 기본 1초 간격
  }

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimit) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimit - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    await this.waitForRateLimit();
    
    const response = await fetch(
      `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': this.userAgent
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchPlace(query: string, lat?: number, lng: number = 0): Promise<any> {
    await this.waitForRateLimit();
    
    let url = `${this.baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    if (lat && lng) {
      url += `&lat=${lat}&lon=${lng}&bounded=1&viewbox=${lng-0.1},${lat+0.1},${lng+0.1},${lat-0.1}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Radar API 클라이언트
class RadarAPIClient {
  private apiKey: string;
  private baseUrl = 'https://api.radar.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/geocode/reverse?coordinates=${lat},${lng}`,
      {
        headers: {
          'Authorization': `prv_${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Radar API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchPlaces(query: string, lat?: number, lng?: number): Promise<any> {
    let url = `${this.baseUrl}/search/places?query=${encodeURIComponent(query)}`;
    if (lat && lng) {
      url += `&near=${lat},${lng}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `prv_${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Radar API error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Azure Maps 클라이언트
class AzureMapsClient {
  private subscriptionKey: string;
  private baseUrl = 'https://atlas.microsoft.com';

  constructor(subscriptionKey: string) {
    this.subscriptionKey = subscriptionKey;
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/search/address/reverse/json?api-version=1.0&subscription-key=${this.subscriptionKey}&query=${lat},${lng}`,
    );

    if (!response.ok) {
      throw new Error(`Azure Maps error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchPOI(query: string, lat?: number, lng?: number): Promise<any> {
    let url = `${this.baseUrl}/search/poi/json?api-version=1.0&subscription-key=${this.subscriptionKey}&query=${encodeURIComponent(query)}`;
    if (lat && lng) {
      url += `&lat=${lat}&lon=${lng}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Azure Maps error: ${response.statusText}`);
    }

    return response.json();
  }
}

// 성능 통계 인터페이스
interface PerformanceStats {
  totalRequests: number;
  nominatimOnly: number;        // 1차 검증만으로 완료
  nominatimPlusRadar: number;   // 2차 검증까지 진행
  radarApiCallsSaved: number;   // 절약된 Radar API 호출
  averageResponseTime: number;
  cacheHits: number;
}

// 메인 검증 시스템
export class CoordinateVerificationSystem {
  private config: VerificationConfig;
  private cache: Map<string, VerificationResult>;
  private nominatimClient?: NominatimClient;
  private radarClient?: RadarAPIClient;
  private stats: PerformanceStats;

  constructor(config: Partial<VerificationConfig> = {}) {
    this.config = {
      enableNominatim: true,
      enableRadarAPI: true,
      fallbackToOriginal: true,
      cacheEnabled: true,
      cacheTTL: 24 * 60 * 60, // 24시간
      maxDistanceThreshold: 1000, // 1km
      minConfidenceThreshold: 0.6,
      batchSize: 10,
      timeoutMs: 5000,
      nominatimUserAgent: 'GuideAI/1.0 (contact@guideai.com)',
      nominatimRateLimit: 1000, // 1초 간격
      ...config
    };

    this.cache = new Map();
    
    // 통계 초기화
    this.stats = {
      totalRequests: 0,
      nominatimOnly: 0,
      nominatimPlusRadar: 0,
      radarApiCallsSaved: 0,
      averageResponseTime: 0,
      cacheHits: 0
    };
    
    // API 클라이언트 초기화
    if (this.config.enableNominatim) {
      this.nominatimClient = new NominatimClient(
        this.config.nominatimUserAgent,
        this.config.nominatimRateLimit
      );
    }
    
    if (this.config.enableRadarAPI && process.env.RADAR_API_KEY) {
      this.radarClient = new RadarAPIClient(process.env.RADAR_API_KEY);
    }
  }

  /**
   * 단일 좌표 검증 (성능 최적화 v2.0)
   */
  async verifyCoordinate(input: CoordinateInput): Promise<VerificationResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(input);
    
    // 통계 업데이트
    this.stats.totalRequests++;

    try {
      // 1. 캐시 확인
      if (this.config.cacheEnabled) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          this.stats.cacheHits++;
          return cached;
        }
      }

      // 2. 1차 검증: API 품질 기반 동적 선택
      if (this.config.enableNominatim && this.nominatimClient) {
        try {
          const nominatimResult = await this.verifyWithNominatim(input, startTime);
          const distance = nominatimResult.metadata.distance || 0;
          
          // API 응답 품질 분석
          const responseQuality = this.analyzeResponseQuality(nominatimResult, input);
          const dynamicThreshold = this.calculateDynamicThreshold(input, responseQuality);
          
          // 동적 임계값 적용
          if (distance <= dynamicThreshold && responseQuality >= 0.8) {
            console.log(`✅ 고품질 1차 검증 통과 (${distance.toFixed(1)}m, 품질: ${responseQuality.toFixed(2)}): ${input.context}`);
            this.stats.nominatimOnly++;
            this.stats.radarApiCallsSaved++;
            this.updateAverageResponseTime(Date.now() - startTime);
            this.setCachedResult(cacheKey, nominatimResult);
            return nominatimResult;
          }
          
          // 5~10m: 2차 검증 진행 후 비교
          // 10m 초과: 3좌표 비교
          console.log(`🔄 2차 검증 필요 (${distance.toFixed(1)}m): ${input.context}`);
          
          let radarResult: VerificationResult | null = null;
          
          // 2차 검증: Radar API (유료)
          if (this.config.enableRadarAPI && this.radarClient) {
            try {
              radarResult = await this.verifyWithRadar(input, startTime);
              console.log(`📡 Radar 검증 완료: ${input.context}`);
            } catch (error) {
              console.warn('Radar API 실패:', error);
            }
          }
          
          // 3좌표 비교 로직
          const bestCoordinate = this.findBestCoordinate(input, nominatimResult, radarResult);
          
          if (bestCoordinate.source === 'ai-original') {
            console.log(`📋 AI 원본 좌표 사용 (API 결과 부정확): ${input.context}`);
          } else {
            console.log(`✅ 최적 좌표 선택 (${bestCoordinate.source}): ${input.context}`);
            this.stats.nominatimPlusRadar++;
          }
          
          this.updateAverageResponseTime(Date.now() - startTime);
          this.setCachedResult(cacheKey, bestCoordinate);
          return bestCoordinate;
          
        } catch (error) {
          console.warn('Nominatim API 실패:', error);
          
          // Nominatim 실패 시 Radar만 시도
          if (this.config.enableRadarAPI && this.radarClient) {
            try {
              const result = await this.verifyWithRadar(input, startTime);
              if (result.confidence >= this.config.minConfidenceThreshold) {
                this.setCachedResult(cacheKey, result);
                return result;
              }
            } catch (error) {
              console.warn('Radar API도 실패:', error);
            }
          }
        }
      }

      // 4. 원본 좌표 사용 (낮은 신뢰도)
      const fallbackResult: VerificationResult = {
        isValid: this.config.fallbackToOriginal,
        confidence: 0.3,
        source: 'ai-original',
        coordinates: { lat: input.lat, lng: input.lng },
        metadata: {
          verifiedAt: new Date(),
          apiResponseTime: Date.now() - startTime
        }
      };

      if (this.config.cacheEnabled) {
        this.setCachedResult(cacheKey, fallbackResult);
      }

      return fallbackResult;

    } catch (error) {
      console.error('좌표 검증 실패:', error);
      
      return {
        isValid: false,
        confidence: 0,
        source: 'ai-original',
        coordinates: { lat: input.lat, lng: input.lng },
        metadata: {
          verifiedAt: new Date(),
          apiResponseTime: Date.now() - startTime
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 배치 좌표 검증 (성능 최적화)
   */
  async batchVerifyCoordinates(inputs: CoordinateInput[]): Promise<VerificationResult[]> {
    const batches = this.chunkArray(inputs, this.config.batchSize);
    const results: VerificationResult[] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(input => this.verifyCoordinate(input));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Nominatim API로 검증 (완전 무료)
   */
  private async verifyWithNominatim(input: CoordinateInput, startTime: number): Promise<VerificationResult> {
    if (!this.nominatimClient) {
      throw new Error('Nominatim client not initialized');
    }

    // 역지오코딩으로 주소 확인
    const reverseResult = await this.nominatimClient.reverseGeocode(input.lat, input.lng);
    
    // 장소 검색으로 정확도 검증
    const searchResult = await this.nominatimClient.searchPlace(
      `${input.context} ${input.locationName}`,
      input.lat,
      input.lng
    );

    const confidence = this.calculateNominatimConfidence(reverseResult, searchResult, input);
    
    // Nominatim은 lat/lon을 문자열로 반환
    const verifiedLat = parseFloat(reverseResult.lat) || input.lat;
    const verifiedLng = parseFloat(reverseResult.lon) || input.lng;
    
    const distance = this.calculateDistance(
      input.lat, input.lng,
      verifiedLat, verifiedLng
    );

    return {
      isValid: confidence >= this.config.minConfidenceThreshold,
      confidence,
      source: 'nominatim',
      coordinates: {
        lat: verifiedLat,
        lng: verifiedLng
      },
      metadata: {
        address: reverseResult.display_name,
        placeType: reverseResult.type || reverseResult.class,
        distance,
        verifiedAt: new Date(),
        apiResponseTime: Date.now() - startTime
      }
    };
  }

  /**
   * Radar API로 검증
   */
  private async verifyWithRadar(input: CoordinateInput, startTime: number): Promise<VerificationResult> {
    if (!this.radarClient) {
      throw new Error('Radar client not initialized');
    }

    // 역지오코딩으로 주소 확인
    const reverseResult = await this.radarClient.reverseGeocode(input.lat, input.lng);
    
    // 장소 검색으로 정확도 검증
    const searchResult = await this.radarClient.searchPlaces(
      `${input.context} ${input.locationName}`,
      input.lat,
      input.lng
    );

    const confidence = this.calculateRadarConfidence(reverseResult, searchResult, input);
    const distance = this.calculateDistance(
      input.lat, input.lng,
      reverseResult.latitude, reverseResult.longitude
    );

    return {
      isValid: confidence >= this.config.minConfidenceThreshold,
      confidence,
      source: 'radar',
      coordinates: {
        lat: reverseResult.latitude || input.lat,
        lng: reverseResult.longitude || input.lng
      },
      metadata: {
        address: reverseResult.formattedAddress,
        placeType: searchResult.places?.[0]?.categories?.[0],
        distance,
        verifiedAt: new Date(),
        apiResponseTime: Date.now() - startTime
      }
    };
  }


  /**
   * 신뢰도 계산 (Radar)
   */
  private calculateRadarConfidence(reverseResult: any, searchResult: any, input: CoordinateInput): number {
    let confidence = 0.5; // 기본값

    // 주소 매칭
    if (reverseResult.formattedAddress?.toLowerCase().includes(input.locationName.toLowerCase())) {
      confidence += 0.3;
    }

    // 장소 검색 결과
    if (searchResult.places?.length > 0) {
      const place = searchResult.places[0];
      if (place.name?.toLowerCase().includes(input.context.toLowerCase())) {
        confidence += 0.2;
      }
    }

    // 거리 기반 신뢰도
    const distance = this.calculateDistance(
      input.lat, input.lng,
      reverseResult.latitude, reverseResult.longitude
    );
    
    if (distance < 100) confidence += 0.2;
    else if (distance < 500) confidence += 0.1;
    else if (distance > this.config.maxDistanceThreshold) confidence -= 0.3;

    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * 신뢰도 계산 (Nominatim)
   */
  private calculateNominatimConfidence(reverseResult: any, searchResult: any[], input: CoordinateInput): number {
    let confidence = 0.6; // Nominatim 기본 신뢰도 (높음 - 커뮤니티 검증됨)

    // 역지오코딩 결과가 위치명과 일치하는지 확인
    if (reverseResult.display_name?.toLowerCase().includes(input.locationName.toLowerCase())) {
      confidence += 0.2;
    }

    // 주소에 컨텍스트(챕터명)가 포함되어 있는지 확인
    if (reverseResult.display_name?.toLowerCase().includes(input.context.toLowerCase())) {
      confidence += 0.15;
    }

    // 검색 결과와 비교
    if (searchResult && searchResult.length > 0) {
      const bestMatch = searchResult[0];
      
      // 검색 결과의 이름이 컨텍스트와 유사한지 확인
      if (bestMatch.display_name?.toLowerCase().includes(input.context.toLowerCase())) {
        confidence += 0.1;
      }
      
      // 검색 결과의 중요도(importance) 점수 활용
      if (bestMatch.importance && bestMatch.importance > 0.5) {
        confidence += 0.05;
      }
    }

    // 위치 타입별 가중치 (관광지, 랜드마크 등)
    const placeType = reverseResult.type || reverseResult.class;
    if (['tourism', 'historic', 'amenity', 'leisure'].includes(placeType)) {
      confidence += 0.1;
    }

    // 거리 기반 신뢰도 조정
    if (reverseResult.lat && reverseResult.lon) {
      const distance = this.calculateDistance(
        input.lat, input.lng,
        parseFloat(reverseResult.lat), parseFloat(reverseResult.lon)
      );
      
      if (distance < 10) confidence += 0.15;        // 10m 이내: 매우 정확
      else if (distance < 50) confidence += 0.1;    // 50m 이내: 정확
      else if (distance < 200) confidence += 0.05;  // 200m 이내: 보통
      else if (distance > this.config.maxDistanceThreshold) confidence -= 0.2;
    }

    return Math.min(Math.max(confidence, 0), 1);
  }



  /**
   * 두 좌표 간 거리 계산 (미터)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * 캐시 관련 메서드들
   */
  private generateCacheKey(input: CoordinateInput): string {
    return `${input.lat}_${input.lng}_${input.context}_${input.locationName}`;
  }

  private getCachedResult(cacheKey: string): VerificationResult | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = new Date();
    const cacheTime = cached.metadata.verifiedAt;
    const ageInSeconds = (now.getTime() - cacheTime.getTime()) / 1000;

    if (ageInSeconds > this.config.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return { ...cached, source: 'cache' as const };
  }

  private setCachedResult(cacheKey: string, result: VerificationResult): void {
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, result);
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
      array.slice(index * size, index * size + size)
    );
  }

  /**
   * 3좌표 비교하여 최적 좌표 선택
   */
  private findBestCoordinate(
    input: CoordinateInput, 
    nominatimResult: VerificationResult, 
    radarResult: VerificationResult | null
  ): VerificationResult {
    
    const candidates: Array<{
      source: 'ai-original' | 'nominatim' | 'radar';
      coordinates: { lat: number; lng: number };
      confidence: number;
      distance: number;
    }> = [
      {
        source: 'ai-original' as const,
        coordinates: { lat: input.lat, lng: input.lng },
        confidence: 0.3,
        distance: 0 // AI 원본 기준점
      },
      {
        source: 'nominatim' as const,
        coordinates: nominatimResult.coordinates,
        confidence: nominatimResult.confidence,
        distance: nominatimResult.metadata.distance || 0
      }
    ];
    
    // Radar 결과가 있으면 추가
    if (radarResult) {
      candidates.push({
        source: 'radar' as const,
        coordinates: radarResult.coordinates,
        confidence: radarResult.confidence,
        distance: radarResult.metadata.distance || 0
      });
    }
    
    console.log(`🔍 3좌표 비교 - ${input.context}:`);
    candidates.forEach(candidate => {
      console.log(`  ${candidate.source}: 거리 ${candidate.distance.toFixed(1)}m, 신뢰도 ${candidate.confidence.toFixed(2)}`);
    });
    
    // 50m 이상 차이나는 경우 AI 원본 사용
    const validCandidates = candidates.filter(c => c.source === 'ai-original' || c.distance <= 50);
    
    if (validCandidates.length === 1 && validCandidates[0].source === 'ai-original') {
      console.log(`📋 모든 API 결과가 50m 초과 차이 → AI 원본 사용`);
      return {
        isValid: true,
        confidence: 0.3,
        source: 'ai-original',
        coordinates: { lat: input.lat, lng: input.lng },
        metadata: {
          verifiedAt: new Date(),
          apiResponseTime: 0,
          distance: 0
        }
      };
    }
    
    // 유효한 후보들 중에서 최적 선택
    // 1순위: 신뢰도가 높고 거리가 가까운 것
    // 2순위: 거리가 가장 가까운 것
    const bestCandidate = validCandidates
      .filter(c => c.source !== 'ai-original') // AI 원본은 마지막 선택지
      .sort((a, b) => {
        // 복합 점수: 신뢰도 0.7 + 거리 점수 0.3
        const scoreA = (a.confidence * 0.7) + ((50 - a.distance) / 50 * 0.3);
        const scoreB = (b.confidence * 0.7) + ((50 - b.distance) / 50 * 0.3);
        return scoreB - scoreA;
      })[0];
    
    if (!bestCandidate) {
      // 모든 API 실패 시 AI 원본
      console.log(`📋 API 결과 없음 → AI 원본 사용`);
      return {
        isValid: true,
        confidence: 0.3,
        source: 'ai-original',
        coordinates: { lat: input.lat, lng: input.lng },
        metadata: {
          verifiedAt: new Date(),
          apiResponseTime: 0,
          distance: 0
        }
      };
    }
    
    // 최적 후보 반환
    if (bestCandidate.source === 'nominatim') {
      return nominatimResult;
    } else if (bestCandidate.source === 'radar' && radarResult) {
      return radarResult;
    }
    
    // 폴백 (이론적으로 도달하지 않음)
    return nominatimResult;
  }

  /**
   * 성능 통계 업데이트
   */
  private updateAverageResponseTime(responseTime: number): void {
    const totalRequests = this.stats.totalRequests;
    this.stats.averageResponseTime = 
      ((this.stats.averageResponseTime * (totalRequests - 1)) + responseTime) / totalRequests;
  }

  /**
   * 성능 통계 조회
   */
  getPerformanceStats(): PerformanceStats & { 
    efficiencyRate: number; 
    radarSavingsPercent: number;
  } {
    const efficiencyRate = this.stats.totalRequests > 0 
      ? (this.stats.nominatimOnly / this.stats.totalRequests) * 100 
      : 0;
    
    const radarSavingsPercent = this.stats.totalRequests > 0
      ? (this.stats.radarApiCallsSaved / this.stats.totalRequests) * 100
      : 0;

    return {
      ...this.stats,
      efficiencyRate: Math.round(efficiencyRate * 100) / 100,
      radarSavingsPercent: Math.round(radarSavingsPercent * 100) / 100
    };
  }

  /**
   * API 응답 품질 분석 (사용자 데이터 불필요)
   */
  private analyzeResponseQuality(result: VerificationResult, input: CoordinateInput): number {
    let quality = 0.5; // 기본값
    
    if (result.source === 'nominatim') {
      // 주소 완성도 검사
      const address = result.metadata.address || '';
      if (address.includes(input.locationName)) quality += 0.2;
      if (address.includes(input.context)) quality += 0.1;
      if (address.split(',').length >= 4) quality += 0.1; // 상세 주소
      
      // 장소 타입별 신뢰도
      const placeType = result.metadata.placeType || '';
      if (['tourism', 'historic', 'amenity'].includes(placeType)) {
        quality += 0.1;
      }
    }
    
    if (result.source === 'radar') {
      // Radar 자체 신뢰도 활용
      quality = Math.max(result.confidence, 0.6);
    }
    
    return Math.min(quality, 1.0);
  }
  
  /**
   * 컨텍스트 기반 동적 임계값 계산 (전세계 지원)
   */
  private calculateDynamicThreshold(input: CoordinateInput, quality: number): number {
    let threshold = 5; // 기본 5m
    
    // 다국어 장소 유형 감지
    const context = input.context.toLowerCase();
    const placeTypeScore = this.detectPlaceType(context);
    
    // 장소 유형별 조정
    if (placeTypeScore.tourism >= 0.7) {
      threshold = 3; // 관광지는 더 엄격
    } else if (placeTypeScore.commercial >= 0.7) {
      threshold = 8; // 상업시설은 완화
    } else if (placeTypeScore.transport >= 0.7) {
      threshold = 10; // 교통시설은 큰 범위
    }
    
    // 품질에 따른 조정
    if (quality >= 0.9) threshold *= 1.5;
    if (quality <= 0.6) threshold *= 0.7;
    
    // 국가/도시 규모 추정 (글로벌)
    const cityTier = this.estimateCityTier(input.locationName);
    threshold *= cityTier.multiplier;
    
    return Math.max(threshold, 2);
  }
  
  /**
   * 다국어 장소 유형 감지
   */
  private detectPlaceType(context: string): {tourism: number, commercial: number, transport: number} {
    const keywords = {
      tourism: {
        ko: ['궁', '절', '박물관', '공원', '관광', '유적', '문화재', '성당', '교회'],
        en: ['palace', 'temple', 'museum', 'park', 'tourist', 'historic', 'cathedral', 'church', 'monument'],
        ja: ['宮', '寺', '博物館', '公園', '観光', '史跡', '教会'],
        fr: ['palais', 'temple', 'musée', 'parc', 'touristique', 'historique', 'cathédrale'],
        es: ['palacio', 'templo', 'museo', 'parque', 'turístico', 'histórico', 'catedral'],
        de: ['palast', 'tempel', 'museum', 'park', 'touristisch', 'historisch', 'kathedrale'],
        it: ['palazzo', 'tempio', 'museo', 'parco', 'turistico', 'storico', 'cattedrale']
      },
      commercial: {
        ko: ['카페', '음식점', '상점', '마트', '백화점', '쇼핑몰'],
        en: ['cafe', 'restaurant', 'shop', 'store', 'mall', 'shopping', 'market'],
        ja: ['カフェ', 'レストラン', '店', 'ショップ', 'モール'],
        fr: ['café', 'restaurant', 'magasin', 'boutique', 'centre commercial'],
        es: ['café', 'restaurante', 'tienda', 'centro comercial', 'mercado'],
        de: ['café', 'restaurant', 'geschäft', 'einkaufszentrum', 'markt'],
        it: ['caffè', 'ristorante', 'negozio', 'centro commerciale', 'mercato']
      },
      transport: {
        ko: ['역', '공항', '터미널', '정류장', '항구'],
        en: ['station', 'airport', 'terminal', 'stop', 'port', 'harbor'],
        ja: ['駅', '空港', 'ターミナル', '停留所', '港'],
        fr: ['gare', 'aéroport', 'terminal', 'arrêt', 'port'],
        es: ['estación', 'aeropuerto', 'terminal', 'parada', 'puerto'],
        de: ['bahnhof', 'flughafen', 'terminal', 'haltestelle', 'hafen'],
        it: ['stazione', 'aeroporto', 'terminale', 'fermata', 'porto']
      }
    };
    
    const scores = {tourism: 0, commercial: 0, transport: 0};
    
    for (const [category, languages] of Object.entries(keywords)) {
      for (const [lang, terms] of Object.entries(languages)) {
        const matches = terms.filter(term => context.includes(term.toLowerCase())).length;
        scores[category as keyof typeof scores] += matches * 0.2;
      }
    }
    
    // 정규화
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.min(scores[key as keyof typeof scores], 1.0);
    });
    
    return scores;
  }
  
  /**
   * 글로벌 도시 계층 추정
   */
  private estimateCityTier(locationName: string): {tier: number, multiplier: number} {
    const location = locationName.toLowerCase();
    
    // Tier 1: 세계 주요 도시들
    const tier1Cities = [
      // 아시아
      'seoul', 'tokyo', 'beijing', 'shanghai', 'singapore', 'hong kong', 'mumbai', 'delhi',
      '서울', '도쿄', '베이징', '상하이', '싱가포르', '홍콩',
      // 유럽  
      'london', 'paris', 'berlin', 'rome', 'madrid', 'amsterdam', 'zurich',
      'london', 'paris', 'berlin', 'roma', 'madrid',
      // 북미
      'new york', 'los angeles', 'chicago', 'toronto', 'vancouver',
      // 기타
      'sydney', 'melbourne', 'dubai', 'cairo'
    ];
    
    // Tier 2: 주요 지역 도시들
    const tier2Cities = [
      // 한국
      '부산', '대구', '인천', '광주', '대전', '울산',
      // 기타 주요 도시
      'osaka', 'kyoto', 'barcelona', 'milan', 'munich', 'vienna'
    ];
    
    if (tier1Cities.some(city => location.includes(city))) {
      return {tier: 1, multiplier: 1.3}; // 대도시는 30% 완화
    } else if (tier2Cities.some(city => location.includes(city))) {
      return {tier: 2, multiplier: 1.1}; // 중간 도시는 10% 완화
    } else {
      return {tier: 3, multiplier: 0.9}; // 소도시는 10% 엄격
    }
  }
  
  /**
   * 컨텍스트별 API 특화도 계산
   */
  private getAPISpecialization(context: string, source: string): number {
    const contextLower = context.toLowerCase();
    
    if (source === 'nominatim') {
      // OSM이 강한 분야
      if (contextLower.includes('궁') || contextLower.includes('절') || 
          contextLower.includes('공원') || contextLower.includes('박물관')) {
        return 1.2;
      }
    }
    
    if (source === 'radar') {
      // Radar가 강한 분야
      if (contextLower.includes('카페') || contextLower.includes('음식점') || 
          contextLower.includes('상점') || contextLower.includes('마트')) {
        return 1.3;
      }
    }
    
    return 1.0; // 기본값
  }

  /**
   * 통계 초기화
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      nominatimOnly: 0,
      nominatimPlusRadar: 0,
      radarApiCallsSaved: 0,
      averageResponseTime: 0,
      cacheHits: 0
    };
  }

  /**
   * 캐시 통계
   */
  getCacheStats(): { size: number; hitRatio: number } {
    // 실제 구현에서는 hit/miss 카운터 추가 필요
    return {
      size: this.cache.size,
      hitRatio: 0 // 실제 hit ratio 계산 로직 추가 필요
    };
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const coordinateVerificationSystem = new CoordinateVerificationSystem();
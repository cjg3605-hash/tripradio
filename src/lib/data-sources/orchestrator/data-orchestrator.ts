/**
 * Data Integration Orchestrator
 * 데이터 통합 오케스트레이터 - 모든 데이터소스를 조율하고 통합
 */

import { 
  IntegratedData, 
  DataSource, 
  SourceData, 
  VerificationResult, 
  LocationInfo,
  DataSourceError,
  PerformanceMetrics
} from '../types/data-types';

import { UNESCOService } from '../unesco/unesco-service';
import { WikidataService } from '../wikidata/wikidata-service';
import { GovernmentDataService } from '../government/government-service';
import { GooglePlacesService } from '../google/places-service';
import { FactVerificationPipeline } from '../verification/fact-verification';
import { DataSourceCache } from '../cache/data-cache';
import { parallelOrchestrator } from '../performance/parallel-orchestrator';

interface OrchestratorConfig {
  enableParallelFetch: boolean;
  timeout: number;
  retryAttempts: number;
  minConfidenceThreshold: number;
  maxDataSources: number;
  enableFallbacks: boolean;
}

interface DataIntegrationResult {
  success: boolean;
  data?: IntegratedData;
  errors: DataSourceError[];
  performance: PerformanceMetrics;
  sources: string[];
}

export class DataIntegrationOrchestrator {
  private static instance: DataIntegrationOrchestrator;
  private config: OrchestratorConfig;
  private services: Map<string, any> = new Map();
  private verificationPipeline: FactVerificationPipeline;
  private cache: DataSourceCache;
  private metrics: PerformanceMetrics = {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    cacheHitRate: 0,
    dataQuality: 0,
    uptime: 100
  };

  private constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      enableParallelFetch: true,
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      minConfidenceThreshold: 0.7,
      maxDataSources: 5,
      enableFallbacks: true,
      ...config
    };

    // 서비스 인스턴스 초기화
    this.services.set('unesco', UNESCOService.getInstance());
    this.services.set('wikidata', WikidataService.getInstance());
    this.services.set('government', GovernmentDataService.getInstance());
    this.services.set('google_places', GooglePlacesService.getInstance());

    this.verificationPipeline = FactVerificationPipeline.getInstance();
    this.cache = new DataSourceCache({
      ttl: 1800, // 30 minutes
      maxSize: 200 * 1024 * 1024, // 200MB
      strategy: 'lru' as any,
      compression: true
    });
  }

  public static getInstance(config?: Partial<OrchestratorConfig>): DataIntegrationOrchestrator {
    if (!DataIntegrationOrchestrator.instance) {
      DataIntegrationOrchestrator.instance = new DataIntegrationOrchestrator(config);
    }
    return DataIntegrationOrchestrator.instance;
  }

  /**
   * 통합 데이터 검색 및 수집 (고성능 병렬 처리)
   */
  async integrateLocationData(
    query: string,
    coordinates?: { lat: number; lng: number },
    options?: {
      dataSources?: string[];
      includeReviews?: boolean;
      includeImages?: boolean;
      language?: string;
      performanceMode?: 'speed' | 'accuracy' | 'comprehensive';
    }
  ): Promise<DataIntegrationResult> {
    const startTime = Date.now();
    const errors: DataSourceError[] = [];
    let integratedData: IntegratedData | undefined;

    try {
      // 🚀 고성능 병렙 데이터 수집 활용
      if (this.config.enableParallelFetch && options?.performanceMode) {
        const optimizedResult = await parallelOrchestrator.optimizedDataCollection(
          query,
          coordinates,
          {
            sources: options.dataSources,
            priorityMode: options.performanceMode,
            cacheStrategy: 'adaptive'
          }
        );

        if (Object.keys(optimizedResult.data).length > 0) {
          // Transform parallel result to standard format
          const transformedSources = Object.entries(optimizedResult.data).map(([source, data]) => ({
            sourceId: source,
            sourceName: source,
            data,
            reliability: 0.9,
            latency: optimizedResult.performance.totalTime / Object.keys(optimizedResult.data).length,
            retrievedAt: new Date().toISOString(),
            httpStatus: 200 // 성공적인 응답 상태
          }));

          integratedData = await this.integrateSources(query, transformedSources, coordinates);
          
          return {
            success: true,
            data: integratedData,
            errors: Object.values(optimizedResult.errors).map(err => 
              new DataSourceError(err.message, 'parallel', 'OPTIMIZED_FETCH_ERROR')
            ),
            performance: {
              responseTime: optimizedResult.performance.totalTime,
              throughput: optimizedResult.performance.throughput,
              errorRate: Object.keys(optimizedResult.errors).length / (Object.keys(optimizedResult.data).length + Object.keys(optimizedResult.errors).length),
              cacheHitRate: optimizedResult.cacheStats.hitRate,
              dataQuality: integratedData.confidence,
              uptime: 100
            },
            sources: Object.keys(optimizedResult.data)
          };
        }
      }

      // 기존 캐시 확인 (fallback)
      const cacheKey = this.generateCacheKey(query, coordinates, options);
      const cached = await this.cache.get<IntegratedData>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          errors: [],
          performance: {
            ...this.metrics,
            responseTime: Date.now() - startTime,
            cacheHitRate: 1.0
          },
          sources: ['cache']
        };
      }

      // 기존 병렬 데이터 수집 (fallback)
      const sourcePromises = await this.collectDataFromSources(query, coordinates, options);
      const sourceResults = await Promise.allSettled(sourcePromises);

      // 성공한 결과들 추출
      const successfulSources: SourceData[] = [];
      const usedSources: string[] = [];

      sourceResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (Array.isArray(result.value)) {
            successfulSources.push(...result.value);
            result.value.forEach(source => usedSources.push(source.sourceId));
          } else {
            successfulSources.push(result.value);
            usedSources.push(result.value.sourceId);
          }
        } else {
          errors.push(new DataSourceError(
            `데이터 수집 실패: ${result.reason}`,
            'unknown',
            'FETCH_FAILED'
          ));
        }
      });

      if (successfulSources.length === 0) {
        // 🔥 개선: 명확한 실패 정보 제공
        console.warn(`❌ 모든 데이터 소스 실패 - 위치: ${query}`);
        console.warn('실패 원인:', errors.map(e => e.message));
        
        return {
          success: false,
          errors,
          performance: {
            ...this.metrics,
            responseTime: Date.now() - startTime
          },
          sources: [],
          // 🔥 추가: 명확한 실패 이유
          failureReason: 'all_data_sources_failed',
          recommendations: [
            'API 키 설정을 확인하세요',
            '네트워크 연결을 확인하세요',
            '입력된 위치명을 다시 확인하세요'
          ]
        } as any;
      }

      // 데이터 통합 및 정규화
      integratedData = await this.integrateSources(query, successfulSources, coordinates);

      // 팩트 검증
      const verificationResult = await this.verificationPipeline.verifyIntegratedData(integratedData);
      integratedData.verificationStatus = verificationResult;
      integratedData.confidence = this.calculateOverallConfidence(successfulSources, verificationResult);

      // 신뢰도 임계값 확인
      if (integratedData.confidence < this.config.minConfidenceThreshold) {
        console.warn(`낮은 신뢰도 (${integratedData.confidence})로 인한 품질 경고`);
      }

      // 캐시에 저장
      await this.cache.set(cacheKey, integratedData, ['integrated', 'location']);

      // 성능 메트릭 업데이트
      this.updateMetrics(startTime, errors.length, successfulSources.length, true);

      return {
        success: true,
        data: integratedData,
        errors,
        performance: {
          ...this.metrics,
          responseTime: Date.now() - startTime
        },
        sources: usedSources
      };

    } catch (error) {
      this.updateMetrics(startTime, errors.length + 1, 0, false);
      
      // 🔥 개선: 상세한 에러 분석 및 복구 제안
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = this.categorizeError(errorMessage);
      const suggestions = this.getErrorRecoverySuggestions(errorType);
      
      console.error(`❌ 데이터 통합 실패 [${errorType}]:`, errorMessage);
      console.warn('🔧 복구 제안:', suggestions);
      
      return {
        success: false,
        errors: [
          ...errors,
          new DataSourceError(
            errorMessage,
            'orchestrator',
            'INTEGRATION_FAILED'
          )
        ],
        performance: {
          ...this.metrics,
          responseTime: Date.now() - startTime
        },
        sources: [],
        // 🔥 추가: 에러 분석 및 복구 정보
        errorAnalysis: {
          category: errorType,
          severity: this.getErrorSeverity(errorType),
          suggestions,
          retryRecommended: this.shouldRetry(errorType),
          fallbackAvailable: true
        }
      } as any;
    }
  }

  /**
   * 좌표 기반 근처 장소 통합 검색
   */
  async findNearbyIntegratedData(
    lat: number,
    lng: number,
    radius: number = 5000,
    options?: {
      categories?: string[];
      includeUNESCO?: boolean;
      includeGovernmentData?: boolean;
      limit?: number;
    }
  ): Promise<DataIntegrationResult> {
    const startTime = Date.now();
    const errors: DataSourceError[] = [];

    try {
      // 캐시 확인
      const cacheKey = `nearby:${lat}:${lng}:${radius}:${JSON.stringify(options)}`;
      const cached = await this.cache.get<IntegratedData[]>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached as any,
          errors: [],
          performance: {
            ...this.metrics,
            responseTime: Date.now() - startTime,
            cacheHitRate: 1.0
          },
          sources: ['cache']
        };
      }

      const nearbyPromises: Promise<SourceData | SourceData[]>[] = [];
      const usedSources: string[] = [];

      // Google Places 근처 검색
      nearbyPromises.push(
        this.services.get('google_places').searchNearbyPlaces(lat, lng, radius)
          .then((result: SourceData) => { usedSources.push('google_places'); return result; })
      );

      // UNESCO 좌표 기반 검색 (옵션)
      if (options?.includeUNESCO !== false) {
        nearbyPromises.push(
          this.services.get('unesco').searchByCoordinates(lat, lng, radius / 1000) // km 단위
            .then((result: SourceData) => { usedSources.push('unesco'); return result; })
        );
      }

      // Wikidata 좌표 기반 검색
      nearbyPromises.push(
        this.services.get('wikidata').searchByCoordinates(lat, lng, radius / 1000) // km 단위
          .then((result: SourceData) => { usedSources.push('wikidata'); return result; })
      );

      // 정부 데이터 위치 기반 검색 (옵션)
      if (options?.includeGovernmentData !== false) {
        nearbyPromises.push(
          this.services.get('government').searchTourismByLocation(lat, lng, radius)
            .then((result: SourceData) => { usedSources.push('government'); return result; })
        );
      }

      const results = await Promise.allSettled(nearbyPromises);
      const successfulSources: SourceData[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (Array.isArray(result.value)) {
            successfulSources.push(...result.value);
          } else {
            successfulSources.push(result.value);
          }
        } else {
          errors.push(new DataSourceError(
            `근처 데이터 수집 실패: ${result.reason}`,
            usedSources[index] || 'unknown',
            'NEARBY_SEARCH_FAILED'
          ));
        }
      });

      // 거리별로 정렬하고 제한
      const sortedData = this.sortByDistance(successfulSources, lat, lng);
      const limitedData = sortedData.slice(0, options?.limit || 50);

      // 캐시에 저장
      await this.cache.set(cacheKey, limitedData, ['nearby', 'location']);

      this.updateMetrics(startTime, errors.length, successfulSources.length, true);

      return {
        success: true,
        data: limitedData as any,
        errors,
        performance: {
          ...this.metrics,
          responseTime: Date.now() - startTime
        },
        sources: [...new Set(usedSources)]
      };

    } catch (error) {
      this.updateMetrics(startTime, errors.length + 1, 0, false);
      
      return {
        success: false,
        errors: [
          ...errors,
          new DataSourceError(
            error instanceof Error ? error.message : String(error),
            'orchestrator',
            'NEARBY_INTEGRATION_FAILED'
          )
        ],
        performance: {
          ...this.metrics,
          responseTime: Date.now() - startTime
        },
        sources: []
      };
    }
  }

  /**
   * 데이터소스별 수집 프로미스 생성
   */
  private async collectDataFromSources(
    query: string,
    coordinates?: { lat: number; lng: number },
    options?: any
  ): Promise<Promise<SourceData | SourceData[]>[]> {
    const promises: Promise<SourceData | SourceData[]>[] = [];
    const targetSources = options?.dataSources || ['unesco', 'wikidata', 'government', 'google_places'];

    // UNESCO 검색
    if (targetSources.includes('unesco')) {
      promises.push(
        this.timeoutPromise(
          this.services.get('unesco').searchSites(query),
          this.config.timeout,
          'UNESCO 검색 시간초과'
        )
      );
    }

    // Wikidata 검색
    if (targetSources.includes('wikidata')) {
      promises.push(
        this.timeoutPromise(
          this.services.get('wikidata').searchEntities(query),
          this.config.timeout,
          'Wikidata 검색 시간초과'
        )
      );
    }

    // 정부 데이터 검색
    if (targetSources.includes('government')) {
      promises.push(
        this.timeoutPromise(
          this.services.get('government').searchGovernmentData(query),
          this.config.timeout,
          '정부 데이터 검색 시간초과'
        )
      );
    }

    // Google Places 검색
    if (targetSources.includes('google_places')) {
      promises.push(
        this.timeoutPromise(
          this.services.get('google_places').searchPlaces(query, coordinates),
          this.config.timeout,
          'Google Places 검색 시간초과'
        )
      );
    }

    return promises;
  }

  /**
   * 다중 소스 데이터 통합
   */
  private async integrateSources(
    query: string,
    sources: SourceData[],
    coordinates?: { lat: number; lng: number }
  ): Promise<IntegratedData> {
    // 기본 위치 정보 추출
    const locationInfo = this.extractLocationInfo(sources, coordinates);
    
    // 기본 정보 통합
    const basicInfo = this.mergeBasicInfo(sources);
    
    // 메타데이터 생성
    const metadata = {
      version: '1.0',
      schema: 'integrated-location-data',
      format: 'json',
      encoding: 'utf-8',
      language: 'ko',
      rights: 'mixed',
      provenance: sources.map(s => s.sourceName).join(', '),
      qualityScore: this.calculateDataQuality(sources),
      tags: this.extractTags(sources)
    };

    return {
      id: this.generateLocationId(locationInfo),
      location: locationInfo,
      basicInfo,
      sources,
      verificationStatus: {
        isVerified: false,
        confidence: 0,
        score: {
          consistency: 0,
          completeness: 0,
          accuracy: 0,
          timeliness: 0,
          authority: 0,
          overall: 0
        },
        conflicts: [],
        recommendations: [],
        verifiedAt: new Date().toISOString(),
        method: 'cross_reference' as any
      },
      confidence: 0,
      lastVerified: new Date().toISOString(),
      metadata
    };
  }

  /**
   * 위치 정보 추출 및 통합
   */
  private extractLocationInfo(sources: SourceData[], fallbackCoords?: { lat: number; lng: number }): LocationInfo {
    let bestCoordinates = fallbackCoords;
    let bestName = '';
    let bestAddress = '';
    let country = '';
    let region = '';
    const categories: any[] = [];

    sources.forEach(source => {
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      
      if (!data) return;

      // 이름 선택 (가장 신뢰할 만한 소스 우선)
      if (!bestName || source.reliability > 0.9) {
        bestName = data.name || data.title || data.label || bestName;
      }

      // 좌표 선택 (가장 정확한 소스 우선)
      if (data.coordinates || data.geometry?.location) {
        const coords = data.coordinates || {
          lat: data.geometry?.location?.lat,
          lng: data.geometry?.location?.lng
        };
        
        if (coords.lat && coords.lng) {
          bestCoordinates = coords;
        }
      }

      // 주소 정보
      if (data.address || data.vicinity || data.location) {
        bestAddress = data.address || data.vicinity || data.location || bestAddress;
      }

      // 국가 및 지역 정보
      if (data.country || data.stateParty) {
        country = data.country || data.stateParty || country;
      }
      
      if (data.region) {
        region = data.region || region;
      }

      // 카테고리 정보
      if (data.category || data.types) {
        const sourceCats = Array.isArray(data.category) ? data.category : [data.category];
        const sourceTypes = Array.isArray(data.types) ? data.types : [data.types];
        categories.push(...sourceCats, ...sourceTypes);
      }
    });

    return {
      name: bestName,
      coordinates: {
        lat: bestCoordinates?.lat || 0,
        lng: bestCoordinates?.lng || 0,
        accuracy: bestCoordinates ? 10 : 1000 // meters
      },
      address: {
        formatted: bestAddress,
        city: this.extractCity(bestAddress),
        country: country
      },
      country,
      region,
      category: [...new Set(categories)].filter(Boolean)
    };
  }

  /**
   * 기본 정보 병합
   */
  private mergeBasicInfo(sources: SourceData[]): any {
    const descriptions: string[] = [];
    const facts: any[] = [];
    let significance = '';
    let established = '';

    sources.forEach(source => {
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      
      if (!data) return;

      // 설명 수집
      if (data.description || data.shortDescription) {
        descriptions.push(data.description || data.shortDescription);
      }

      // 중요성
      if (data.significance || data.justification) {
        significance = data.significance || data.justification || significance;
      }

      // 설립/건립 연도
      if (data.established || data.inscriptionYear || data.inception) {
        established = data.established || data.inscriptionYear || data.inception || established;
      }

      // 팩트 수집
      if (data.facts) {
        facts.push(...data.facts);
      }
    });

    return {
      description: descriptions[0] || '',
      shortDescription: descriptions.find(d => d.length < 200) || descriptions[0]?.substring(0, 200),
      significance,
      established,
      facts
    };
  }

  /**
   * 전체적인 신뢰도 계산
   */
  private calculateOverallConfidence(sources: SourceData[], verificationResult: VerificationResult): number {
    const sourceReliability = sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length;
    return (sourceReliability + verificationResult.confidence) / 2;
  }

  /**
   * 데이터 품질 점수 계산
   */
  private calculateDataQuality(sources: SourceData[]): number {
    const factors = {
      sourceCount: Math.min(sources.length / 3, 1), // 3개 이상 소스면 만점
      avgReliability: sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length,
      dataCompleteness: this.calculateCompleteness(sources),
      latency: this.calculateLatencyScore(sources)
    };

    return (factors.sourceCount * 0.25 + 
            factors.avgReliability * 0.35 + 
            factors.dataCompleteness * 0.25 + 
            factors.latency * 0.15);
  }

  /**
   * 데이터 완성도 계산
   */
  private calculateCompleteness(sources: SourceData[]): number {
    const requiredFields = ['name', 'coordinates', 'description'];
    const fieldCounts = requiredFields.map(field => {
      return sources.filter(source => {
        const data = Array.isArray(source.data) ? source.data[0] : source.data;
        return data && data[field];
      }).length;
    });

    return fieldCounts.reduce((sum, count) => sum + count, 0) / (requiredFields.length * sources.length);
  }

  /**
   * 응답 시간 점수 계산
   */
  private calculateLatencyScore(sources: SourceData[]): number {
    const avgLatency = sources.reduce((sum, s) => sum + s.latency, 0) / sources.length;
    // 5초 이내면 1.0, 30초면 0점
    return Math.max(0, 1 - avgLatency / 30000);
  }

  /**
   * 거리별 정렬
   */
  private sortByDistance(sources: SourceData[], lat: number, lng: number): SourceData[] {
    return sources.sort((a, b) => {
      const distA = this.calculateDistance(lat, lng, a);
      const distB = this.calculateDistance(lat, lng, b);
      return distA - distB;
    });
  }

  /**
   * 거리 계산
   */
  private calculateDistance(lat: number, lng: number, source: SourceData): number {
    const data = Array.isArray(source.data) ? source.data[0] : source.data;
    if (!data?.coordinates && !data?.geometry?.location) return Infinity;
    
    const targetLat = data.coordinates?.lat ?? data.geometry?.location?.lat ?? 0;
    const targetLng = data.coordinates?.lng ?? data.geometry?.location?.lng ?? 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(targetLat - lat);
    const dLng = this.toRadians(targetLng - lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat)) * Math.cos(this.toRadians(targetLat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 태그 추출
   */
  private extractTags(sources: SourceData[]): string[] {
    const tags = new Set<string>();
    
    sources.forEach(source => {
      tags.add(source.sourceId);
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      
      if (data?.types) {
        data.types.forEach((type: string) => tags.add(type));
      }
      
      if (data?.category) {
        const cats = Array.isArray(data.category) ? data.category : [data.category];
        cats.forEach((cat: string) => tags.add(cat));
      }
    });

    return Array.from(tags);
  }

  /**
   * 도시명 추출 (간단한 구현)
   */
  private extractCity(address: string): string {
    if (!address) return '';
    
    // 간단한 패턴 매칭
    const patterns = [
      /([가-힣]+시)/,  // 한국 도시명
      /([A-Za-z\s]+),.*([A-Za-z\s]+)$/, // 영어 도시명
    ];

    for (const pattern of patterns) {
      const match = address.match(pattern);
      if (match) return match[1].trim();
    }

    return '';
  }

  /**
   * 위치 ID 생성
   */
  private generateLocationId(location: LocationInfo): string {
    const name = location.name.replace(/[^a-zA-Z0-9가-힣]/g, '');
    const coords = `${location.coordinates.lat.toFixed(4)}_${location.coordinates.lng.toFixed(4)}`;
    return `${name}_${coords}`;
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(query: string, coordinates?: { lat: number; lng: number }, options?: any): string {
    const coordStr = coordinates ? `${coordinates.lat}:${coordinates.lng}` : 'no-coords';
    const optStr = options ? JSON.stringify(options) : 'no-options';
    return `integrated:${query}:${coordStr}:${optStr}`;
  }

  /**
   * 프로미스 시간 제한
   */
  private timeoutPromise<T>(promise: Promise<T>, timeout: number, timeoutMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(timeoutMessage)), timeout)
      )
    ]);
  }

  /**
   * 성능 메트릭 업데이트
   */
  private updateMetrics(startTime: number, errorCount: number, sourceCount: number, success: boolean): void {
    const responseTime = Date.now() - startTime;
    
    this.metrics = {
      responseTime,
      throughput: sourceCount / (responseTime / 1000),
      errorRate: errorCount / Math.max(sourceCount, 1),
      cacheHitRate: this.cache.getStats().hitRate,
      dataQuality: success ? 0.9 : 0.3,
      uptime: success ? this.metrics.uptime : Math.max(this.metrics.uptime - 1, 0)
    };
  }

  /**
   * 모든 서비스 상태 확인
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
      try {
        const isHealthy = await service.healthCheck();
        return [name, isHealthy];
      } catch {
        return [name, false];
      }
    });

    const results = await Promise.all(healthPromises);
    return Object.fromEntries(results);
  }

  /**
   * 성능 메트릭 조회
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 캐시 통계
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * 캐시 클리어
   */
  async clearCache(tags?: string[]) {
    await this.cache.clear(tags);
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 🔥 에러 분류 시스템
   */
  private categorizeError(errorMessage: string): string {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('api key') || message.includes('authentication') || message.includes('unauthorized')) {
      return 'authentication';
    } else if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return 'network';
    } else if (message.includes('rate limit') || message.includes('quota')) {
      return 'rate_limit';
    } else if (message.includes('not found') || message.includes('404')) {
      return 'not_found';
    } else if (message.includes('parse') || message.includes('json') || message.includes('format')) {
      return 'data_format';
    } else if (message.includes('service unavailable') || message.includes('500') || message.includes('502')) {
      return 'service_unavailable';
    } else {
      return 'unknown';
    }
  }

  /**
   * 🔧 에러별 복구 제안
   */
  private getErrorRecoverySuggestions(errorType: string): string[] {
    switch (errorType) {
      case 'authentication':
        return [
          'API 키가 올바르게 설정되었는지 확인하세요',
          '.env.local 파일에 모든 필요한 키가 있는지 확인하세요',
          'API 키의 권한 설정을 확인하세요'
        ];
      case 'network':
        return [
          '인터넷 연결 상태를 확인하세요',
          '방화벽 설정을 확인하세요',
          'VPN 사용 시 설정을 확인하세요',
          '잠시 후 다시 시도하세요'
        ];
      case 'rate_limit':
        return [
          '요청 빈도를 줄여보세요',
          'API 할당량을 확인하세요',
          '몇 분 후 다시 시도하세요'
        ];
      case 'not_found':
        return [
          '입력한 위치명을 다시 확인하세요',
          '영문 또는 한글로 다시 시도해보세요',
          '유사한 명칭으로 재검색해보세요'
        ];
      case 'data_format':
        return [
          '서비스 상태를 확인하세요',
          '잠시 후 다시 시도하세요',
          '관리자에게 문의하세요'
        ];
      case 'service_unavailable':
        return [
          '해당 서비스가 일시적으로 불안정합니다',
          '몇 분 후 다시 시도하세요',
          '대체 데이터 소스를 이용합니다'
        ];
      default:
        return [
          '잠시 후 다시 시도하세요',
          '문제가 계속되면 관리자에게 문의하세요'
        ];
    }
  }

  /**
   * 🚨 에러 심각도 평가
   */
  private getErrorSeverity(errorType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (errorType) {
      case 'authentication':
        return 'critical';
      case 'service_unavailable':
        return 'high';
      case 'network':
      case 'rate_limit':
        return 'medium';
      case 'not_found':
      case 'data_format':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * 🔄 재시도 권장 여부
   */
  private shouldRetry(errorType: string): boolean {
    return ['network', 'rate_limit', 'service_unavailable', 'unknown'].includes(errorType);
  }
}
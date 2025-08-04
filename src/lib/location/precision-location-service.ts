/**
 * 🎯 Precision Location Service
 * AI 기반 구체적 시작점 결정 시스템의 통합 서비스
 */

import { LocationData, UserProfile } from '@/types/enhanced-chapter';
import { SpecificStartingPointGenerator, SpecificStartingPoint } from './specific-starting-point-generator';
import { WikipediaLocationSearcher, CoordinateCandidate } from './wikipedia-location-searcher';
import { SpatialReasoningAI, PreciseLocationResult, Coordinates } from './spatial-reasoning-ai';
import { EnhancedLocationService, LocationInput, LocationResult } from '@/lib/coordinates/enhanced-location-service';

export interface PrecisionLocationConfig {
  enableAI: boolean;
  enableWikipedia: boolean;
  fallbackToExistingSystem: boolean;
  precisionMode: 'high' | 'standard' | 'fast';
  maxCandidates: number;
  cacheEnabled: boolean;
}

export interface PrecisionLocationRequest {
  locationName: string;
  coordinates?: Coordinates;
  userProfile?: UserProfile;
  config?: Partial<PrecisionLocationConfig>;
}

export interface PrecisionLocationResponse {
  success: boolean;
  coordinates: Coordinates;
  specificStartingPoint: {
    name: string;
    description: string;
    type: string;
    features: string[];
    confidence: number;
  };
  accuracy: {
    expectedErrorRange: string;
    confidence: number;
    source: string;
  };
  metadata: {
    processingTime: number;
    methodUsed: 'ai_enhanced' | 'existing_system' | 'fallback';
    candidatesFound: number;
    cacheHit: boolean;
  };
  error?: string;
}

const DEFAULT_CONFIG: PrecisionLocationConfig = {
  enableAI: true,
  enableWikipedia: true,
  fallbackToExistingSystem: true,
  precisionMode: 'standard',
  maxCandidates: 10,
  cacheEnabled: true
};

export class PrecisionLocationService {
  private specificGenerator: SpecificStartingPointGenerator;
  private wikipediaSearcher: WikipediaLocationSearcher;
  private spatialAI: SpatialReasoningAI;
  private existingLocationService: EnhancedLocationService;
  private cache = new Map<string, PrecisionLocationResponse>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

  constructor() {
    this.specificGenerator = new SpecificStartingPointGenerator();
    this.wikipediaSearcher = new WikipediaLocationSearcher();
    this.spatialAI = new SpatialReasoningAI();
    this.existingLocationService = new EnhancedLocationService();
  }

  /**
   * 🎯 메인 엔트리포인트: 고정밀 위치 결정
   */
  async findPrecisionLocation(
    request: PrecisionLocationRequest
  ): Promise<PrecisionLocationResponse> {
    const startTime = Date.now();
    const config = { ...DEFAULT_CONFIG, ...request.config };

    console.log('🎯 정밀 위치 서비스 시작:', {
      location: request.locationName,
      precisionMode: config.precisionMode,
      enableAI: config.enableAI
    });

    try {
      // 캐시 확인
      if (config.cacheEnabled) {
        const cached = this.getFromCache(request);
        if (cached) {
          console.log('💾 정밀 위치 캐시 히트');
          return {
            ...cached,
            metadata: {
              ...cached.metadata,
              processingTime: Date.now() - startTime,
              cacheHit: true
            }
          };
        }
      }

      // AI Enhanced 방식 시도
      if (config.enableAI) {
        try {
          const aiResult = await this.findLocationWithAI(request, config, startTime);
          
          // 캐시 저장
          if (config.cacheEnabled) {
            this.saveToCache(request, aiResult);
          }
          
          return aiResult;
        } catch (error) {
          console.warn('⚠️ AI Enhanced 방식 실패:', error);
          
          if (!config.fallbackToExistingSystem) {
            throw error;
          }
        }
      }

      // 기존 시스템으로 폴백
      if (config.fallbackToExistingSystem) {
        console.log('🔄 기존 시스템으로 폴백');
        return await this.findLocationWithExistingSystem(request, startTime);
      }

      throw new Error('모든 위치 결정 방법 실패');

    } catch (error) {
      console.error('❌ 정밀 위치 서비스 실패:', error);
      
      return {
        success: false,
        coordinates: request.coordinates || { lat: 0, lng: 0 },
        specificStartingPoint: {
          name: `${request.locationName} 입구`,
          description: '위치 결정 실패',
          type: 'entrance',
          features: [],
          confidence: 0
        },
        accuracy: {
          expectedErrorRange: 'Unknown',
          confidence: 0,
          source: 'error'
        },
        metadata: {
          processingTime: Date.now() - startTime,
          methodUsed: 'fallback',
          candidatesFound: 0,
          cacheHit: false
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🤖 AI Enhanced 방식으로 위치 결정
   */
  private async findLocationWithAI(
    request: PrecisionLocationRequest,
    config: PrecisionLocationConfig,
    startTime: number
  ): Promise<PrecisionLocationResponse> {
    console.log('🤖 AI Enhanced 위치 결정 시작');

    // 1️⃣ LocationData 구성 (기존 좌표가 없으면 기존 시스템에서 획득)
    let mainCoords = request.coordinates;
    if (!mainCoords) {
      const existingResult = await this.existingLocationService.findLocation({
        query: request.locationName
      });
      mainCoords = existingResult.coordinates;
    }

    const locationData: LocationData = {
      name: request.locationName,
      coordinates: mainCoords,
      venueType: this.inferVenueType(request.locationName),
      scale: this.inferVenueScale(request.locationName),
      averageVisitDuration: 90, // 기본값
      tier1Points: [],
      tier2Points: [],
      tier3Points: []
    };

    // 2️⃣ 구체적 시작점 생성
    const specificPoint = await this.specificGenerator.generateConcreteStartingPoint(
      locationData,
      request.userProfile
    );

    console.log('✅ 구체적 시작점 생성:', specificPoint.specificName);

    // 3️⃣ Wikipedia 검색 (설정에 따라)
    let candidateCoords: CoordinateCandidate[] = [];
    if (config.enableWikipedia) {
      candidateCoords = await this.wikipediaSearcher.searchSpecificCoordinates(
        request.locationName,
        specificPoint
      );
      
      // 최대 후보 수 제한
      candidateCoords = candidateCoords.slice(0, config.maxCandidates);
      console.log(`🔍 ${candidateCoords.length}개 Wikipedia 후보 수집`);
    }

    // 4️⃣ 기존 Multi-API 시스템과 결합
    if (config.precisionMode === 'high') {
      try {
        const existingApiResults = await this.getExistingApiResults(request.locationName);
        candidateCoords.push(...existingApiResults);
        console.log(`🔗 기존 API 결과 ${existingApiResults.length}개 추가`);
      } catch (error) {
        console.warn('기존 API 결과 획득 실패:', error);
      }
    }

    // 5️⃣ AI 공간 추론으로 최적 좌표 선택
    const preciseResult = await this.spatialAI.selectOptimalCoordinate(
      mainCoords,
      candidateCoords,
      specificPoint
    );

    console.log('🧠 AI 공간 추론 완료:', {
      coordinates: `${preciseResult.coordinates.lat}, ${preciseResult.coordinates.lng}`,
      confidence: preciseResult.confidence,
      expectedAccuracy: preciseResult.metadata.expectedAccuracy
    });

    // 6️⃣ 결과 구성
    return {
      success: true,
      coordinates: preciseResult.coordinates,
      specificStartingPoint: {
        name: specificPoint.specificName,
        description: specificPoint.description,
        type: specificPoint.type,
        features: specificPoint.expectedFeatures,
        confidence: specificPoint.confidence
      },
      accuracy: {
        expectedErrorRange: preciseResult.metadata.expectedAccuracy,
        confidence: preciseResult.confidence,
        source: preciseResult.source
      },
      metadata: {
        processingTime: Date.now() - startTime,
        methodUsed: 'ai_enhanced',
        candidatesFound: candidateCoords.length,
        cacheHit: false
      }
    };
  }

  /**
   * 🔄 기존 시스템으로 위치 결정
   */
  private async findLocationWithExistingSystem(
    request: PrecisionLocationRequest,
    startTime: number
  ): Promise<PrecisionLocationResponse> {
    console.log('🔄 기존 시스템으로 위치 결정');

    try {
      const existingResult = await this.existingLocationService.findLocation({
        query: request.locationName,
        language: request.userProfile?.language
      });

      return {
        success: true,
        coordinates: existingResult.coordinates,
        specificStartingPoint: {
          name: `${request.locationName} 입구`,
          description: '기존 시스템 기반 위치',
          type: 'entrance',
          features: ['입구', '안내판'],
          confidence: existingResult.confidence
        },
        accuracy: {
          expectedErrorRange: this.mapAccuracyToRange(existingResult.accuracy),
          confidence: existingResult.confidence,
          source: 'existing_enhanced_location_service'
        },
        metadata: {
          processingTime: Date.now() - startTime,
          methodUsed: 'existing_system',
          candidatesFound: existingResult.sources.length,
          cacheHit: false
        }
      };

    } catch (error) {
      throw new Error(`기존 시스템도 실패: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  /**
   * 🔗 기존 API 결과를 CoordinateCandidate 형태로 변환
   */
  private async getExistingApiResults(locationName: string): Promise<CoordinateCandidate[]> {
    try {
      const result = await this.existingLocationService.findLocation({
        query: locationName
      });

      // 기존 시스템 결과를 후보로 추가
      return [{
        lat: result.coordinates.lat,
        lng: result.coordinates.lng,
        name: locationName,
        source: 'enhanced_location_service',
        confidence: result.confidence,
        type: 'main_location',
        metadata: {
          sources: result.sources,
          accuracy: result.accuracy
        }
      }];

    } catch (error) {
      console.warn('기존 API 결과 변환 실패:', error);
      return [];
    }
  }

  /**
   * 🔧 헬퍼 메서드들
   */
  private inferVenueType(locationName: string): 'indoor' | 'outdoor' | 'mixed' {
    const name = locationName.toLowerCase();
    
    if (name.includes('박물관') || name.includes('미술관') || name.includes('museum') || name.includes('gallery')) {
      return 'indoor';
    }
    if (name.includes('공원') || name.includes('산') || name.includes('해변') || name.includes('park')) {
      return 'outdoor';
    }
    if (name.includes('궁') || name.includes('사찰') || name.includes('절') || name.includes('palace') || name.includes('temple')) {
      return 'mixed';
    }
    
    return 'mixed'; // 기본값
  }

  private inferVenueScale(locationName: string): 'world_heritage' | 'national_museum' | 'major_attraction' | 'regional_site' | 'local_attraction' {
    const name = locationName.toLowerCase();
    
    const worldKeywords = ['루브르', '에펠탑', '자금성', 'louvre', 'eiffel', 'forbidden city'];
    const nationalKeywords = ['국립', '국가', 'national'];
    const majorKeywords = ['궁', '대성당', '타워', 'palace', 'cathedral', 'tower'];
    
    if (worldKeywords.some(keyword => name.includes(keyword))) return 'world_heritage';
    if (nationalKeywords.some(keyword => name.includes(keyword))) return 'national_museum';
    if (majorKeywords.some(keyword => name.includes(keyword))) return 'major_attraction';
    if (name.includes('지역') || name.includes('시립')) return 'regional_site';
    
    return 'local_attraction';
  }

  private mapAccuracyToRange(accuracy: string): string {
    switch (accuracy) {
      case 'high': return '10-25m';
      case 'medium': return '25-100m';
      case 'low': return '100m+';
      default: return 'Unknown';
    }
  }

  /**
   * 💾 캐시 관리
   */
  private generateCacheKey(request: PrecisionLocationRequest): string {
    const configKey = request.config ? 
      `${request.config.precisionMode}_${request.config.enableAI}_${request.config.enableWikipedia}` : 
      'default';
    const profileKey = request.userProfile ? 
      `${request.userProfile.ageGroup}_${request.userProfile.companions}` : 
      'default';
    
    return `precision:${request.locationName}:${configKey}:${profileKey}`;
  }

  private getFromCache(request: PrecisionLocationRequest): PrecisionLocationResponse | null {
    const key = this.generateCacheKey(request);
    const cached = this.cache.get(key) as any;
    
    if (cached && cached._timestamp && 
        Date.now() - cached._timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    return null;
  }

  private saveToCache(request: PrecisionLocationRequest, response: PrecisionLocationResponse): void {
    const key = this.generateCacheKey(request);
    this.cache.set(key, {
      data: response,
      _timestamp: Date.now()
    } as any);
  }

  /**
   * 📊 통계 및 관리 메서드
   */
  async getServiceStats() {
    return {
      cache: {
        size: this.cache.size,
        hitRate: 'Not implemented'
      },
      subServices: {
        specificGenerator: this.specificGenerator.getCacheStats(),
        wikipediaSearcher: this.wikipediaSearcher.getCacheStats(),
        spatialAI: this.spatialAI.getCacheStats()
      }
    };
  }

  async clearAllCaches(): Promise<void> {
    this.cache.clear();
    this.specificGenerator.clearCache();
    this.wikipediaSearcher.clearCache();
    this.spatialAI.clearCache();
    console.log('🗑️ 모든 정밀 위치 서비스 캐시 클리어됨');
  }

  /**
   * 🧪 테스트 메서드
   */
  async testLocationAccuracy(locationName: string): Promise<{
    aiEnhanced?: PrecisionLocationResponse;
    existingSystem?: PrecisionLocationResponse;
    comparison?: {
      coordinatesDifference: number; // 미터
      confidenceDifference: number;
      processingTimeDifference: number; // ms
    };
  }> {
    console.log('🧪 위치 정확도 테스트 시작:', locationName);

    const results: any = {};

    try {
      // AI Enhanced 방식 테스트
      results.aiEnhanced = await this.findPrecisionLocation({
        locationName,
        config: { enableAI: true, enableWikipedia: true, cacheEnabled: false }
      });
    } catch (error) {
      console.warn('AI Enhanced 테스트 실패:', error);
    }

    try {
      // 기존 시스템 테스트
      results.existingSystem = await this.findPrecisionLocation({
        locationName,
        config: { enableAI: false, enableWikipedia: false, fallbackToExistingSystem: true, cacheEnabled: false }
      });
    } catch (error) {
      console.warn('기존 시스템 테스트 실패:', error);
    }

    // 비교 분석
    if (results.aiEnhanced && results.existingSystem) {
      const distance = this.calculateDistance(
        results.aiEnhanced.coordinates,
        results.existingSystem.coordinates
      );

      results.comparison = {
        coordinatesDifference: distance,
        confidenceDifference: results.aiEnhanced.accuracy.confidence - results.existingSystem.accuracy.confidence,
        processingTimeDifference: results.aiEnhanced.metadata.processingTime - results.existingSystem.metadata.processingTime
      };
    }

    console.log('✅ 위치 정확도 테스트 완료');
    return results;
  }

  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}

// 싱글톤 인스턴스
export const precisionLocationService = new PrecisionLocationService();
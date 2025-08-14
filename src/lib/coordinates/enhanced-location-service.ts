/**
 * 🎯 Enhanced Location Service - API 기반 고정밀 위치 탐지 시스템
 * 
 * QA 설계 원칙:
 * - 95% 정확도 목표
 * - 다단계 검증 파이프라인
 * - 실패 시 즉시 폴백
 * - 전세계 다국어 지원
 * 
 * Architecture:
 * Phase 1: Gemini AI 위치 정규화 + 제목 최적화
 * Phase 2: Multi-API 교차 검증  
 * Phase 3: 지능형 품질 검증
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { optimizeIntroTitle } from '../ai/gemini';

// === 인터페이스 정의 ===
export interface LocationInput {
  query: string;
  language?: string;
  context?: string; // 도시, 국가 등 추가 컨텍스트
  locationType?: 'station' | 'tourist' | 'building' | 'general';
}

export interface LocationResult {
  coordinates: {
    lat: number;
    lng: number;
  };
  confidence: number; // 0-1 범위
  accuracy: 'high' | 'medium' | 'low';
  sources: string[]; // 사용된 API 목록
  metadata: {
    officialName: string;
    address: string;
    placeType: string;
    country: string;
    validatedAt: Date;
    processingTimeMs: number;
    // 🆕 Precision Mode 필드들
    precisionMode?: boolean;
    clusterRadius?: number;
    enhancedMetadata?: {
      specificStartingPoint?: any;
      methodUsed?: string;
      candidatesFound?: number;
    };
    fallbackReason?: string;
    errorReason?: string;
    // 🎯 Title Optimization 필드
    titleOptimization?: {
      originalTitle: string;
      optimizedTitle: string;
      optimizationConfidence: number;
      strategy: string;
    };
  };
  quality: {
    consensusScore: number; // API 간 합의 점수
    distanceVariance: number; // 좌표 편차 (미터)
    addressMatch: number; // 주소 일치도
  };
  error?: string;
}

export interface APIClient {
  name: string;
  search(query: string, context?: string): Promise<APIResult | null>;
  reverseGeocode(lat: number, lng: number): Promise<string | null>;
}

export interface APIResult {
  coordinates: { lat: number; lng: number };
  name: string;
  address: string;
  placeId?: string;
  confidence: number;
}

// === Phase 1: Gemini AI 위치 정규화 시스템 ===
class LocationNormalizer {
  private gemini: GoogleGenerativeAI | null = null;
  private model: any = null;

  private initialize() {
    if (this.model) return; // 이미 초기화됨
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, Gemini normalization disabled');
      return;
    }
    
    this.gemini = new GoogleGenerativeAI(apiKey);
    this.model = this.gemini.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 256,
        topP: 0.8
      }
    });
  }

  /**
   * 사용자 입력을 정확한 위치명으로 정규화
   */
  async normalize(input: LocationInput): Promise<{
    officialName: string;
    alternativeNames: string[];
    locationType: string;
    country: string;
    city: string;
    searchQueries: string[];
  }> {
    // 런타임에 초기화
    this.initialize();
    
    // Gemini가 사용 가능하지 않으면 기본값 반환
    if (!this.model) {
      console.log('Gemini 미사용, 기본 정규화 적용');
      return {
        officialName: input.query,
        alternativeNames: [],
        locationType: input.locationType || 'general',
        country: '',
        city: '',
        searchQueries: [input.query]
      };
    }

    const prompt = `위치 정규화: "${input.query}"

다음 JSON 형태로 정확한 위치 정보를 반환해줘:
{
  "officialName": "정확한 공식명 (한국어/영어)",
  "alternativeNames": ["별칭1", "별칭2", "영어명"],
  "locationType": "station|tourist|building|commercial|transport",
  "country": "국가명",
  "city": "도시명", 
  "searchQueries": ["API 검색용 쿼리1", "쿼리2", "쿼리3"]
}

예시:
입력: "평촌역"
출력: {
  "officialName": "평촌역",
  "alternativeNames": ["Pyeongchon Station", "안양 평촌역"],
  "locationType": "station",
  "country": "대한민국",
  "city": "안양시",
  "searchQueries": ["평촌역 안양", "Pyeongchon Station Anyang", "안양 평촌역 경기도"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = await result.response.text();
      
      // JSON 추출
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON 형식이 아님');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // 기본값 설정
      return {
        officialName: parsed.officialName || input.query,
        alternativeNames: parsed.alternativeNames || [],
        locationType: parsed.locationType || 'general',
        country: parsed.country || '',
        city: parsed.city || '',
        searchQueries: parsed.searchQueries || [input.query]
      };
      
    } catch (error) {
      console.warn('위치 정규화 실패, 기본값 사용:', error);
      return {
        officialName: input.query,
        alternativeNames: [],
        locationType: input.locationType || 'general',
        country: '',
        city: '',
        searchQueries: [input.query]
      };
    }
  }
}

// === Phase 2: API 클라이언트들 ===

class GooglePlacesClient implements APIClient {
  name = 'Google Places';
  private apiKey: string = '';
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
    this.initialized = true;
    
    if (!this.apiKey) {
      console.warn('Google API key not found, Google Places disabled');
    }
  }

  async search(query: string, context?: string): Promise<APIResult | null> {
    try {
      // 런타임에 초기화
      this.initialize();
      
      // API 키가 없으면 null 반환
      if (!this.apiKey) {
        console.log('Google Places API 키 없음, 건너뛰기');
        return null;
      }
      
      const searchQuery = context ? `${query} ${context}` : query;
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
      
      let response = await fetch(`${url}?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${this.apiKey}`);
      
      if (!response.ok) throw new Error(`Google API error: ${response.status}`);
      
      let data = await response.json();
      let candidate = data.candidates?.[0];
      
      // 기본 검색 실패시 영어로 재검색
      if (!candidate || !candidate.geometry?.location) {
        console.log(`🔄 영어 재검색 시도: ${query}`);
        
        // 간단한 영어 변환
        const englishQuery = convertToEnglishSearch(query, context);
        console.log(`🔍 영어 검색어: ${englishQuery}`);
        
        const englishResponse = await fetch(`${url}?input=${encodeURIComponent(englishQuery)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${this.apiKey}`);
        
        if (englishResponse.ok) {
          const englishData = await englishResponse.json();
          candidate = englishData.candidates?.[0];
          
          if (candidate && candidate.geometry?.location) {
            console.log(`✅ 영어 검색 성공: ${candidate.name}`);
          }
        }
      }
      
      if (!candidate || !candidate.geometry?.location) return null;
      
      return {
        coordinates: {
          lat: candidate.geometry.location.lat,
          lng: candidate.geometry.location.lng
        },
        name: candidate.name || query,
        address: candidate.formatted_address || '',
        placeId: candidate.place_id,
        confidence: 0.9 // Google Places 기본 신뢰도
      };
      
    } catch (error) {
      console.error('Google Places API 오류:', error);
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      // 런타임에 초기화
      this.initialize();
      
      // API 키가 없으면 null 반환
      if (!this.apiKey) {
        console.log('Google Places API 키 없음, 역지오코딩 건너뛰기');
        return null;
      }
      
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}&language=ko`;
      const response = await fetch(url);
      const data = await response.json();
      
      return data.results?.[0]?.formatted_address || null;
    } catch (error) {
      console.error('Google 역지오코딩 오류:', error);
      return null;
    }
  }
}


// === Phase 3: 메인 위치 서비스 ===
export class EnhancedLocationService {
  private normalizer: LocationNormalizer;
  private clients: APIClient[];
  private cache = new Map<string, LocationResult>();

  constructor() {
    this.normalizer = new LocationNormalizer();
    this.clients = [
      new GooglePlacesClient()
    ];
  }

  /**
   * 🎯 메인 위치 검색 함수 - Enhanced with Precision Mode
   */
  async findLocation(input: LocationInput): Promise<LocationResult> {
    // 🆕 Precision Mode 지원 (하위 호환성 유지)
    return this.findLocationWithMode(input, false);
  }

  /**
   * 🎯 고정밀 위치 검색 함수 (새로운 기능)
   */
  async findLocationWithPrecision(input: LocationInput): Promise<LocationResult> {
    return this.findLocationWithMode(input, true);
  }

  /**
   * 🔧 내부 위치 검색 로직 (모드별 처리)
   */
  private async findLocationWithMode(input: LocationInput, precisionMode: boolean): Promise<LocationResult> {
    const startTime = Date.now();
    
    try {
      // 캐시 확인 (모드별 구분)
      const cacheKey = this.generateCacheKey(input, precisionMode);
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        console.log(`💾 캐시 히트 (${precisionMode ? 'precision' : 'standard'} 모드)`);
        return cached;
      }

      // 🎯 Precision Mode인 경우 새로운 시스템 시도
      if (precisionMode) {
        try {
          const precisionResult = await this.tryPrecisionLocationSystem(input, startTime);
          if (precisionResult) {
            // 캐시 저장
            this.cache.set(cacheKey, precisionResult);
            return precisionResult;
          }
        } catch (error) {
          console.warn('⚠️ Precision 시스템 실패, 기존 방식으로 폴백:', error);
        }
      }

      // 기존 로직 실행
      console.log(`🔍 ${precisionMode ? 'Precision 폴백' : 'Standard'} 모드 실행`);

      // Phase 1: AI 정규화
      console.log('🤖 Phase 1: 위치 정규화 시작');
      const normalized = await this.normalizer.normalize(input);
      console.log('✅ 정규화 완료:', normalized.officialName);

      // Phase 2: Multi-API 병렬 검색
      console.log('🔍 Phase 2: Multi-API 검색 시작');
      const apiResults = await this.searchAllAPIs(normalized);
      
      if (apiResults.length === 0) {
        console.warn('모든 API에서 결과를 찾을 수 없음, 기본 좌표 반환');
        return this.getFallbackResult(normalized, input, startTime);
      }

      // Phase 3: 합의 알고리즘 & 품질 검증 (정밀도 조정)
      console.log('⚖️ Phase 3: 합의 알고리즘 실행');
      const clusterRadius = precisionMode ? 10 : 1000; // 🎯 Precision Mode: 10m vs Standard: 1km
      const consensusResult = await this.findConsensus(apiResults, normalized, clusterRadius);
      
      // 최종 품질 검증
      const qualityScore = await this.validateQuality(consensusResult, normalized);
      
      const result: LocationResult = {
        coordinates: consensusResult.coordinates,
        confidence: consensusResult.confidence,
        accuracy: this.determineAccuracy(qualityScore, precisionMode),
        sources: apiResults.map(r => r.source),
        metadata: {
          officialName: normalized.officialName,
          address: consensusResult.address,
          placeType: normalized.locationType,
          country: normalized.country,
          validatedAt: new Date(),
          processingTimeMs: Date.now() - startTime,
          // 🆕 Precision Mode 메타데이터
          precisionMode,
          clusterRadius
        },
        quality: qualityScore
      };

      // 캐시 저장
      this.cache.set(cacheKey, result);
      
      console.log(`✅ 위치 검색 완료: ${result.metadata.officialName} (정확도: ${result.accuracy}, 모드: ${precisionMode ? 'precision' : 'standard'})`);
      return result;

    } catch (error) {
      console.error('❌ 위치 검색 실패:', error);
      return this.getErrorResult(input, startTime, error);
    }
  }

  /**
   * 🎯 Precision Location System 시도
   */
  private async tryPrecisionLocationSystem(input: LocationInput, startTime: number): Promise<LocationResult | null> {
    try {
      // 동적 import로 새로운 시스템 사용
      const { PrecisionLocationService } = await import('@/lib/location/precision-location-service');
      const precisionService = new PrecisionLocationService();

      console.log('🎯 Precision Location System 시도');
      
      const precisionResponse = await precisionService.findPrecisionLocation({
        locationName: input.query,
        config: {
          enableAI: true,
          enableWikipedia: true,
          precisionMode: 'high',
          fallbackToExistingSystem: false, // 폴백 비활성화 (여기서 직접 처리)
          cacheEnabled: false // 여기서 캐시 관리
        }
      });

      if (precisionResponse.success) {
        // PrecisionLocationResponse를 LocationResult로 변환
        return {
          coordinates: precisionResponse.coordinates,
          confidence: precisionResponse.accuracy.confidence,
          accuracy: this.mapPrecisionAccuracy(precisionResponse.accuracy.expectedErrorRange),
          sources: ['precision_location_service'],
          metadata: {
            officialName: precisionResponse.specificStartingPoint.name,
            address: precisionResponse.specificStartingPoint.description,
            placeType: precisionResponse.specificStartingPoint.type,
            country: 'Unknown', // Precision 시스템에서는 제공하지 않음
            validatedAt: new Date(),
            processingTimeMs: Date.now() - startTime,
            precisionMode: true,
            enhancedMetadata: {
              specificStartingPoint: precisionResponse.specificStartingPoint,
              methodUsed: precisionResponse.metadata.methodUsed,
              candidatesFound: precisionResponse.metadata.candidatesFound
            }
          },
          quality: {
            consensusScore: precisionResponse.accuracy.confidence,
            distanceVariance: this.parseDistanceVariance(precisionResponse.accuracy.expectedErrorRange),
            addressMatch: 0.8 // 추정값
          }
        };
      }

      return null;

    } catch (error) {
      console.warn('Precision Location System 실패:', error);
      return null;
    }
  }

  /**
   * 모든 API에서 병렬 검색
   */
  private async searchAllAPIs(normalized: any): Promise<Array<APIResult & { source: string }>> {
    const searchPromises = this.clients.flatMap(client => 
      normalized.searchQueries.map(async (query: string) => {
        try {
          const result = await client.search(query, `${normalized.city} ${normalized.country}`);
          return result ? { ...result, source: client.name } : null;
        } catch (error) {
          console.warn(`${client.name} 검색 실패:`, error);
          return null;
        }
      })
    );

    const results = await Promise.allSettled(searchPromises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<APIResult & { source: string }> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  /**
   * 합의 알고리즘: 여러 API 결과에서 최적 좌표 선택 (클러스터 반경 조정 가능)
   */
  private async findConsensus(
    results: Array<APIResult & { source: string }>, 
    normalized: any,
    clusterRadius = 1000
  ): Promise<APIResult & { source: string }> {
    
    if (results.length === 1) return results[0];

    // 1. 거리 기반 클러스터링 (반경 조정)
    const clusters = this.clusterByDistance(results, clusterRadius);
    
    // 2. 가장 큰 클러스터 선택
    const mainCluster = clusters.reduce((a, b) => a.length > b.length ? a : b);
    
    // 3. 클러스터 내에서 최고 신뢰도 선택
    const bestResult = mainCluster.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    console.log(`🎯 합의 결과 (반경: ${clusterRadius}m): ${(bestResult as any).source} (클러스터: ${mainCluster.length}개)`);
    return bestResult as APIResult & { source: string };
  }

  /**
   * 거리 기반 클러스터링
   */
  private clusterByDistance(results: Array<APIResult & { source: string }>, maxDistance: number): Array<APIResult & { source: string }>[] {
    const clusters: Array<APIResult & { source: string }>[] = [];
    const used = new Set<number>();

    for (let i = 0; i < results.length; i++) {
      if (used.has(i)) continue;

      const cluster = [results[i]];
      used.add(i);

      for (let j = i + 1; j < results.length; j++) {
        if (used.has(j)) continue;

        const distance = this.calculateDistance(
          results[i].coordinates.lat, results[i].coordinates.lng,
          results[j].coordinates.lat, results[j].coordinates.lng
        );

        if (distance <= maxDistance) {
          cluster.push(results[j]);
          used.add(j);
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * 품질 검증
   */
  private async validateQuality(
    result: APIResult & { source: string }, 
    normalized: any
  ): Promise<LocationResult['quality']> {
    
    // 역지오코딩으로 주소 확인
    const client = this.clients.find(c => c.name === result.source);
    const reverseAddress = client ? await client.reverseGeocode(
      result.coordinates.lat, 
      result.coordinates.lng
    ) : null;

    // 주소 일치도 계산
    const addressMatch = reverseAddress ? 
      this.calculateSimilarity(reverseAddress.toLowerCase(), normalized.officialName.toLowerCase()) : 0;

    return {
      consensusScore: result.confidence,
      distanceVariance: 0, // 단일 결과이므로 0
      addressMatch
    };
  }

  /**
   * 거리 계산 (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  /**
   * 문자열 유사도 계산 (간단한 구현)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 정확도 결정 (정밀도 모드 고려)
   */
  private determineAccuracy(quality: LocationResult['quality'], precisionMode = false): 'high' | 'medium' | 'low' {
    // Precision mode에서는 더 엄격한 기준 적용
    if (precisionMode) {
      if (quality.consensusScore >= 0.9 && quality.addressMatch >= 0.8) return 'high';
      if (quality.consensusScore >= 0.7 && quality.addressMatch >= 0.6) return 'medium';
      return 'low';
    }
    
    // Standard mode 기준
    if (quality.consensusScore >= 0.8 && quality.addressMatch >= 0.7) return 'high';
    if (quality.consensusScore >= 0.6 && quality.addressMatch >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * 캐시 키 생성 (모드별 구분)
   */
  private generateCacheKey(input: LocationInput, precisionMode = false): string {
    const modePrefix = precisionMode ? 'precision' : 'standard';
    return `${modePrefix}_${input.query}_${input.language || 'ko'}_${input.context || ''}`;
  }

  private isCacheValid(cached: LocationResult): boolean {
    const age = Date.now() - cached.metadata.validatedAt.getTime();
    return age < 24 * 60 * 60 * 1000; // 24시간 유효
  }

  /**
   * 통계 조회
   */
  getStats(): { cacheSize: number; totalRequests: number } {
    return {
      cacheSize: this.cache.size,
      totalRequests: 0 // 실제 구현에서는 카운터 추가 필요
    };
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 🔄 폴백 결과 생성
   */
  private getFallbackResult(
    normalized: any,
    input: LocationInput,
    startTime: number
  ): LocationResult {
    console.log('🔄 폴백 결과 생성');
    
    // 기본 좌표 없음 - 기본값 반환
    const fallbackCoords = { lat: 0, lng: 0 };

    return {
      coordinates: fallbackCoords,
      confidence: 0.1, // 매우 낮은 신뢰도
      accuracy: 'low',
      sources: ['fallback'],
      metadata: {
        officialName: normalized.officialName || input.query,
        address: '위치 정보를 찾을 수 없음',
        placeType: normalized.locationType || 'general',
        country: normalized.country || 'Unknown',
        validatedAt: new Date(),
        processingTimeMs: Date.now() - startTime,
        precisionMode: false,
        fallbackReason: '모든 API에서 결과를 찾을 수 없음'
      },
      quality: {
        consensusScore: 0.1,
        distanceVariance: 0,
        addressMatch: 0
      },
      error: '위치 정보를 찾을 수 없어 기본 좌표를 반환했습니다.'
    };
  }

  /**
   * ❌ 오류 결과 생성
   */
  private getErrorResult(
    input: LocationInput,
    startTime: number,
    error: any
  ): LocationResult {
    console.log('❌ 오류 결과 생성:', error);
    
    const fallbackCoords = { lat: 0, lng: 0 };

    return {
      coordinates: fallbackCoords,
      confidence: 0,
      accuracy: 'low',
      sources: ['error'],
      metadata: {
        officialName: input.query,
        address: '처리 중 오류 발생',
        placeType: input.locationType || 'general',
        country: 'Unknown',
        validatedAt: new Date(),
        processingTimeMs: Date.now() - startTime,
        precisionMode: false,
        errorReason: error instanceof Error ? error.message : 'Unknown error'
      },
      quality: {
        consensusScore: 0,
        distanceVariance: 0,
        addressMatch: 0
      },
      error: `위치 검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }

  /**
   * 🎯 Precision 정확도 매핑
   */
  private mapPrecisionAccuracy(expectedErrorRange: string): 'high' | 'medium' | 'low' {
    if (expectedErrorRange.includes('10') || expectedErrorRange.includes('15')) return 'high';
    if (expectedErrorRange.includes('25') || expectedErrorRange.includes('50')) return 'medium';
    return 'low';
  }

  /**
   * 📏 거리 변화 파싱
   */
  private parseDistanceVariance(expectedErrorRange: string): number {
    // "10-15m", "25-50m" 형태에서 숫자 추출
    const numbers = expectedErrorRange.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[0], 10);
    }
    return 100; // 기본값
  }
}

/**
 * 간단한 영어 검색어 변환 함수
 */
function convertToEnglishSearch(query: string, context?: string): string {
  let englishQuery = query;
  
  // 한국어 → 영어 기본 변환
  englishQuery = englishQuery
    .replace(/역/g, ' Station')
    .replace(/(\d+)번\s*출구/g, 'Exit $1')
    .replace(/출구/g, 'Exit')
    .replace(/입구/g, 'Entrance')
    .replace(/매표소/g, 'Ticket Office')
    .replace(/센터/g, 'Center')
    .replace(/정문/g, 'Main Gate')
    .replace(/공원/g, 'Park')
    .replace(/박물관/g, 'Museum')
    .replace(/궁/g, 'Palace')
    .replace(/사원/g, 'Temple')
    .replace(/성당/g, 'Cathedral')
    .replace(/교회/g, 'Church')
    .replace(/시장/g, 'Market')
    .replace(/다리/g, 'Bridge')
    .replace(/광장/g, 'Square');

  // 일본어 → 영어 기본 변환  
  englishQuery = englishQuery
    .replace(/駅/g, ' Station')
    .replace(/(\d+)番出口/g, 'Exit $1')
    .replace(/出口/g, 'Exit')
    .replace(/入口/g, 'Entrance')
    .replace(/切符売り場/g, 'Ticket Office');

  // 중국어 → 영어 기본 변환
  englishQuery = englishQuery
    .replace(/车站/g, ' Station')
    .replace(/地铁站/g, ' Subway Station')
    .replace(/(\d+)号出口/g, 'Exit $1')
    .replace(/出口/g, 'Exit')
    .replace(/入口/g, 'Entrance')
    .replace(/售票处/g, 'Ticket Office');

  // 컨텍스트가 있으면 추가
  if (context) {
    englishQuery = `${englishQuery} ${context}`;
  }

  return englishQuery.trim();
}

/**
 * 🎯 제목 최적화 기반 고급 위치 검색 함수
 * Google Places API 최적화된 제목을 활용하여 정확한 좌표 검색
 */
export async function searchLocationWithOptimizedTitle(
  originalTitle: string,
  locationName: string,
  context?: string
): Promise<LocationResult | null> {
  try {
    console.log('🎯 제목 최적화 기반 위치 검색 시작:', originalTitle);

    // 1️⃣ 제목 최적화
    const titleOptimization = await optimizeIntroTitle(originalTitle, locationName, context);
    
    console.log('✅ 제목 최적화 결과:', {
      original: originalTitle,
      optimized: titleOptimization.optimizedTitle,
      confidence: titleOptimization.confidence
    });

    // 2️⃣ Enhanced Location Service를 통한 정밀 검색
    const service = new EnhancedLocationService();
    
    const searchInput: LocationInput = {
      query: titleOptimization.optimizedTitle,
      language: 'ko',
      context: context || locationName,
      locationType: titleOptimization.facilityType === 'general' ? 'tourist' : 'station'
    };

    const result = await service.findLocation(searchInput);
    
    if (result && result.coordinates) {
      console.log('🎉 최적화된 검색 성공:', {
        title: titleOptimization.optimizedTitle,
        coordinates: result.coordinates,
        confidence: result.confidence
      });

      return {
        coordinates: result.coordinates,
        confidence: result.confidence,
        accuracy: result.accuracy,
        sources: result.sources,
        metadata: {
          ...result.metadata,
          titleOptimization: {
            originalTitle,
            optimizedTitle: titleOptimization.optimizedTitle,
            optimizationConfidence: titleOptimization.confidence,
            strategy: titleOptimization.searchStrategy
          }
        },
        quality: result.quality
      };
    }

    // 3️⃣ 폴백: 대안 검색어들로 재시도
    for (const alternativeTitle of titleOptimization.alternativeTitles) {
      console.log('🔄 대안 검색어 시도:', alternativeTitle);
      
      const alternativeInput: LocationInput = {
        query: alternativeTitle,
        language: 'ko',
        context: context || locationName
      };

      const alternativeResult = await service.findLocation(alternativeInput);
      
      if (alternativeResult && alternativeResult.coordinates) {
        console.log('✅ 대안 검색어로 성공:', alternativeTitle);
        
        return {
          coordinates: alternativeResult.coordinates,
          confidence: alternativeResult.confidence * 0.9, // 대안 검색이므로 신뢰도 약간 감소
          accuracy: alternativeResult.accuracy,
          sources: alternativeResult.sources,
          metadata: {
            ...alternativeResult.metadata,
            titleOptimization: {
              originalTitle,
              optimizedTitle: alternativeTitle,
              optimizationConfidence: titleOptimization.confidence,
              strategy: 'alternative'
            }
          },
          quality: alternativeResult.quality
        };
      }
    }

    console.warn('❌ 모든 최적화된 검색어로 검색 실패');
    return null;

  } catch (error) {
    console.error('❌ 제목 최적화 기반 검색 실패:', error);
    return null;
  }
}

// 싱글톤 인스턴스
export const enhancedLocationService = new EnhancedLocationService();
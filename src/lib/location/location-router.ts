/**
 * 통합 위치 분류 및 라우팅 시스템
 * 
 * 사용자 검색어를 분석하여 적절한 페이지로 라우팅합니다.
 * - 정확한 매칭 → Fuzzy 매칭 → AI 의도 분석 → 기본값
 */

import { 
  classifyLocation, 
  determinePageType, 
  LocationData, 
  PageType,
  TEST_CASES 
} from './location-classification';
import { 
  comprehensiveIntentAnalysis, 
  IntentAnalysis 
} from './intent-analysis';

export interface LocationRoutingResult {
  pageType: PageType;
  locationData?: LocationData;
  intentAnalysis?: IntentAnalysis;
  confidence: number;
  processingMethod: 'exact_match' | 'fuzzy_match' | 'intent_analysis' | 'fallback';
  reasoning: string;
  suggestedQuery?: string; // 검색어 보정 제안
}

/**
 * 메인 위치 라우팅 함수
 * 
 * @param query - 사용자 검색어
 * @param language - 분석 언어 (기본값: 'ko')
 * @returns LocationRoutingResult
 */
export async function routeLocationQuery(
  query: string, 
  language: string = 'ko'
): Promise<LocationRoutingResult> {
  const normalizedQuery = query.trim();
  
  if (!normalizedQuery) {
    return {
      pageType: 'DetailedGuidePage',
      confidence: 0.5,
      processingMethod: 'fallback',
      reasoning: '빈 검색어 - 기본 페이지로 라우팅'
    };
  }
  
  console.log('🔍 Location routing started:', { query: normalizedQuery, language });
  
  // 1단계: 정확한 위치 매칭 시도
  const locationData = classifyLocation(normalizedQuery);
  
  if (locationData) {
    const pageType = determinePageType(locationData);
    const result: LocationRoutingResult = {
      pageType,
      locationData,
      confidence: locationData.level <= 3 ? 0.95 : 0.9, // 상위 레벨일수록 높은 신뢰도
      processingMethod: 'exact_match',
      reasoning: `정확한 위치 매칭 성공: ${locationData.type} (레벨 ${locationData.level})`
    };
    
    console.log('✅ Exact location match:', result);
    return result;
  }
  
  // 2단계: AI 기반 의도 분석
  try {
    const intentAnalysis = await comprehensiveIntentAnalysis(normalizedQuery, language);
    
    if (intentAnalysis && intentAnalysis.confidence >= 0.7) {
      const result: LocationRoutingResult = {
        pageType: intentAnalysis.pageType,
        intentAnalysis,
        confidence: intentAnalysis.confidence,
        processingMethod: 'intent_analysis',
        reasoning: `AI 의도 분석: ${intentAnalysis.reasoning}`
      };
      
      console.log('🤖 Intent-based routing:', result);
      return result;
    }
  } catch (error) {
    console.warn('⚠️ Intent analysis failed:', error);
  }
  
  // 3단계: 안전한 기본값
  const fallbackResult: LocationRoutingResult = {
    pageType: 'DetailedGuidePage',
    confidence: 0.5,
    processingMethod: 'fallback',
    reasoning: '위치 매칭 및 의도 분석 실패 - 상세 가이드 페이지로 기본 라우팅'
  };
  
  console.log('🔄 Fallback routing:', fallbackResult);
  return fallbackResult;
}

/**
 * 검색어 보정 제안
 * 
 * @param query - 원본 검색어
 * @returns 보정된 검색어 제안들
 */
export function suggestQueryCorrections(query: string): string[] {
  const suggestions: string[] = [];
  const normalized = query.trim().toLowerCase();
  
  // 일반적인 오타 패턴
  const commonTypos: Record<string, string> = {
    // 한국어 오타
    '겨복궁': '경복궁',
    '창더궁': '창덕궁', 
    '제주': '제주도',
    '부사': '부산',
    '서울시': '서울',
    
    // 영어 오타
    'seoul': 'Seoul',
    'busan': 'Busan', 
    'jeju': 'Jeju',
    'tokyo': 'Tokyo',
    'paris': 'Paris',
    'london': 'London',
    
    // 일반적인 별칭
    'nyc': 'New York',
    'sf': 'San Francisco',
    'la': 'Los Angeles'
  };
  
  // 정확한 매칭 체크
  if (commonTypos[normalized]) {
    suggestions.push(commonTypos[normalized]);
  }
  
  // 부분 매칭으로 제안
  Object.entries(commonTypos).forEach(([typo, correct]) => {
    if (normalized.includes(typo) || typo.includes(normalized)) {
      if (!suggestions.includes(correct)) {
        suggestions.push(correct);
      }
    }
  });
  
  return suggestions.slice(0, 3); // 최대 3개 제안
}

/**
 * 라우팅 결과 기반 리다이렉트 URL 생성
 */
export function generateRedirectUrl(
  query: string, 
  routingResult: LocationRoutingResult,
  baseUrl: string = '/guide'
): string {
  const encodedQuery = encodeURIComponent(query.trim());
  
  // 보정된 검색어가 있으면 사용
  if (routingResult.suggestedQuery) {
    return `${baseUrl}/${encodeURIComponent(routingResult.suggestedQuery)}`;
  }
  
  // 기본 URL 생성
  return `${baseUrl}/${encodedQuery}`;
}

/**
 * 라우팅 통계 및 성능 모니터링
 */
export interface RoutingStats {
  totalQueries: number;
  exactMatches: number;
  fuzzyMatches: number; 
  intentAnalysis: number;
  fallbacks: number;
  averageConfidence: number;
  processingTimeMs: number;
}

class RoutingStatsCollector {
  private stats: RoutingStats = {
    totalQueries: 0,
    exactMatches: 0,
    fuzzyMatches: 0,
    intentAnalysis: 0,
    fallbacks: 0,
    averageConfidence: 0,
    processingTimeMs: 0
  };
  
  private confidenceSum = 0;
  private processingTimeSum = 0;
  
  recordRouting(result: LocationRoutingResult, processingTimeMs: number) {
    this.stats.totalQueries++;
    this.confidenceSum += result.confidence;
    this.processingTimeSum += processingTimeMs;
    
    switch (result.processingMethod) {
      case 'exact_match':
        this.stats.exactMatches++;
        break;
      case 'fuzzy_match':
        this.stats.fuzzyMatches++;
        break;
      case 'intent_analysis':
        this.stats.intentAnalysis++;
        break;
      case 'fallback':
        this.stats.fallbacks++;
        break;
    }
    
    // 평균 계산
    this.stats.averageConfidence = this.confidenceSum / this.stats.totalQueries;
    this.stats.processingTimeMs = this.processingTimeSum / this.stats.totalQueries;
  }
  
  getStats(): RoutingStats {
    return { ...this.stats };
  }
  
  reset() {
    this.stats = {
      totalQueries: 0,
      exactMatches: 0,
      fuzzyMatches: 0,
      intentAnalysis: 0,
      fallbacks: 0,
      averageConfidence: 0,
      processingTimeMs: 0
    };
    this.confidenceSum = 0;
    this.processingTimeSum = 0;
  }
}

// 글로벌 통계 수집기
export const routingStatsCollector = new RoutingStatsCollector();

/**
 * 성능 모니터링을 포함한 라우팅 함수
 */
export async function routeLocationQueryWithStats(
  query: string,
  language: string = 'ko'
): Promise<LocationRoutingResult> {
  const startTime = Date.now();
  
  try {
    const result = await routeLocationQuery(query, language);
    const processingTime = Date.now() - startTime;
    
    // 통계 기록
    if (process.env.NODE_ENV !== 'test') {
      routingStatsCollector.recordRouting(result, processingTime);
    }
    
    // 성능 로깅
    if (processingTime > 3000) {
      console.warn('⚠️ Slow routing detected:', { 
        query, 
        processingTime, 
        method: result.processingMethod 
      });
    }
    
    return result;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Routing error:', error);
    
    const errorResult: LocationRoutingResult = {
      pageType: 'DetailedGuidePage',
      confidence: 0.1,
      processingMethod: 'fallback',
      reasoning: `라우팅 오류 발생: ${error instanceof Error ? error.message : String(error)}`
    };
    
    routingStatsCollector.recordRouting(errorResult, processingTime);
    return errorResult;
  }
}

/**
 * 테스트 함수 - 모든 테스트 케이스 검증
 */
export async function runRoutingTests(): Promise<{
  passed: number;
  failed: number;
  results: Array<{ input: string; expected: string; actual: string; passed: boolean }>;
}> {
  const results: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];
  let passed = 0;
  let failed = 0;
  
  console.log('🧪 Running location routing tests...');
  
  for (const testCase of TEST_CASES) {
    try {
      const result = await routeLocationQuery(testCase.input);
      const actualPageType = result.pageType;
      const expectedPageType = testCase.expected;
      const testPassed = actualPageType === expectedPageType;
      
      if (testPassed) {
        passed++;
      } else {
        failed++;
      }
      
      results.push({
        input: testCase.input,
        expected: expectedPageType,
        actual: actualPageType,
        passed: testPassed
      });
      
      console.log(`${testPassed ? '✅' : '❌'} ${testCase.input}: ${actualPageType} (expected: ${expectedPageType})`);
    } catch (error) {
      failed++;
      results.push({
        input: testCase.input,
        expected: testCase.expected,
        actual: 'ERROR',
        passed: false
      });
      console.log(`❌ ${testCase.input}: ERROR - ${error}`);
    }
  }
  
  console.log(`🎯 Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed, results };
}

// 캐시를 위한 간단한 LRU 구현
class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private readonly maxSize: number;
  private readonly ttlMs: number;
  
  constructor(maxSize: number = 100, ttlMinutes: number = 10) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // TTL 체크
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    // LRU: 사용된 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }
  
  set(key: string, value: T): void {
    // 최대 크기 확인
    if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// 라우팅 결과 캐시
export const routingCache = new LRUCache<LocationRoutingResult>(200, 30); // 30분 TTL

/**
 * 캐시를 활용한 최적화된 라우팅 함수
 */
export async function routeLocationQueryCached(
  query: string,
  language: string = 'ko'
): Promise<LocationRoutingResult> {
  const cacheKey = `${query.toLowerCase().trim()}:${language}`;
  
  // 캐시에서 확인
  const cachedResult = routingCache.get(cacheKey);
  if (cachedResult) {
    console.log('🎯 Cache hit for routing:', query);
    return cachedResult;
  }
  
  // 새로 계산
  const result = await routeLocationQueryWithStats(query, language);
  
  // 높은 신뢰도 결과만 캐시에 저장
  if (result.confidence >= 0.7) {
    routingCache.set(cacheKey, result);
  }
  
  return result;
}
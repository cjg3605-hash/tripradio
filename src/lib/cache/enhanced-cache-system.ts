// 🚀 Enhanced Multi-Level Cache System (Redis + Memory)
// 90% 캐시 히트율 목표, 80% 응답 시간 단축

import LRUCache from 'lru-cache';

/**
 * 🔧 캐시 레벨 정의
 */
export enum CacheLevel {
  L1_MEMORY = 'memory',      // 1차: 메모리 캐시 (초고속, 100ms 미만)
  L2_REDIS = 'redis',        // 2차: Redis 캐시 (고속, 500ms 미만)  
  L3_STORAGE = 'storage'     // 3차: 영구 저장소 (일반, 2초 미만)
}

/**
 * 🎯 캐시 키 전략
 */
export enum CacheKeyStrategy {
  SEARCH_AUTOCOMPLETE = 'search',           // 검색 자동완성: 30분
  GUIDE_GENERATION = 'guide',               // 가이드 생성: 6시간
  DATA_INTEGRATION = 'integration',         // 데이터 통합: 2시간
  COORDINATE_ENHANCEMENT = 'coordinates',   // 좌표 향상: 12시간
  CHAPTER_GENERATION = 'chapters'           // 챕터 생성: 4시간
}

/**
 * 🎯 캐시 설정 타입
 */
interface CacheConfig {
  strategy: CacheKeyStrategy;
  ttl: number;              // TTL (초 단위)
  levels: CacheLevel[];     // 사용할 캐시 레벨
  compression: boolean;     // 압축 여부
  priority: 'high' | 'medium' | 'low';
}

/**
 * 🎯 캐시 통계
 */
interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  l1Hits: number;
  l2Hits: number;
  l3Hits: number;
  totalRequests: number;
  avgResponseTime: number;
}

/**
 * 🚀 Enhanced Multi-Level Cache System
 */
export class EnhancedCacheSystem {
  private static instance: EnhancedCacheSystem;
  
  // L1: 메모리 캐시 (LRU)
  private memoryCache: LRUCache<string, any>;
  
  // 캐시 설정 매핑
  private cacheConfigs: Map<CacheKeyStrategy, CacheConfig> = new Map([
    [CacheKeyStrategy.SEARCH_AUTOCOMPLETE, {
      strategy: CacheKeyStrategy.SEARCH_AUTOCOMPLETE,
      ttl: 30 * 60,  // 30분
      levels: [CacheLevel.L1_MEMORY, CacheLevel.L2_REDIS],
      compression: true,
      priority: 'high'
    }],
    [CacheKeyStrategy.GUIDE_GENERATION, {
      strategy: CacheKeyStrategy.GUIDE_GENERATION,  
      ttl: 6 * 60 * 60,  // 6시간
      levels: [CacheLevel.L1_MEMORY, CacheLevel.L2_REDIS, CacheLevel.L3_STORAGE],
      compression: true,
      priority: 'high'
    }],
    [CacheKeyStrategy.DATA_INTEGRATION, {
      strategy: CacheKeyStrategy.DATA_INTEGRATION,
      ttl: 2 * 60 * 60,  // 2시간
      levels: [CacheLevel.L1_MEMORY, CacheLevel.L2_REDIS],
      compression: true,
      priority: 'medium'
    }],
    [CacheKeyStrategy.COORDINATE_ENHANCEMENT, {
      strategy: CacheKeyStrategy.COORDINATE_ENHANCEMENT,
      ttl: 12 * 60 * 60,  // 12시간
      levels: [CacheLevel.L1_MEMORY, CacheLevel.L2_REDIS, CacheLevel.L3_STORAGE],
      compression: false,
      priority: 'medium'
    }],
    [CacheKeyStrategy.CHAPTER_GENERATION, {
      strategy: CacheKeyStrategy.CHAPTER_GENERATION,
      ttl: 4 * 60 * 60,  // 4시간
      levels: [CacheLevel.L1_MEMORY, CacheLevel.L2_REDIS],
      compression: true,
      priority: 'high'
    }]
  ]);

  // 통계 추적
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    l1Hits: 0,
    l2Hits: 0,
    l3Hits: 0,
    totalRequests: 0,
    avgResponseTime: 0
  };

  private constructor() {
    // L1 메모리 캐시 초기화 (1GB 제한)
    this.memoryCache = new LRUCache<string, any>({
      max: 10000,           // 최대 10,000개 항목
      maxSize: 1024 * 1024 * 1024,  // 1GB 제한
      sizeCalculation: (value) => {
        return JSON.stringify(value).length;
      },
      ttl: 30 * 60 * 1000,  // 기본 30분 TTL
      allowStale: false,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });

    // 🚀 Enhanced Cache System 초기화 완료
  }

  static getInstance(): EnhancedCacheSystem {
    if (!EnhancedCacheSystem.instance) {
      EnhancedCacheSystem.instance = new EnhancedCacheSystem();
    }
    return EnhancedCacheSystem.instance;
  }

  /**
   * 🔍 캐시에서 데이터 조회 (다층 조회)
   */
  async get<T>(
    strategy: CacheKeyStrategy,
    key: string,
    generator?: () => Promise<T>
  ): Promise<T | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    const config = this.cacheConfigs.get(strategy);
    if (!config) {
      console.warn(`⚠️ 캐시 전략 미정의: ${strategy}`);
      return generator ? await generator() : null;
    }

    const fullKey = this.buildCacheKey(strategy, key);
    
    try {
      // L1: 메모리 캐시 확인
      if (config.levels.includes(CacheLevel.L1_MEMORY)) {
        const memoryResult = this.memoryCache.get(fullKey);
        if (memoryResult !== undefined) {
          this.stats.hits++;
          this.stats.l1Hits++;
          this.updateResponseTime(startTime);
          // 🎯 L1 캐시 히트: ${fullKey}
          return memoryResult;
        }
      }

      // L2: Redis 캐시 확인 (시뮬레이션)
      if (config.levels.includes(CacheLevel.L2_REDIS)) {
        const redisResult = await this.getFromRedis(fullKey);
        if (redisResult !== null) {
          // L1에도 저장 (캐시 승격)
          if (config.levels.includes(CacheLevel.L1_MEMORY)) {
            this.memoryCache.set(fullKey, redisResult, { ttl: config.ttl * 1000 });
          }
          
          this.stats.hits++;
          this.stats.l2Hits++;
          this.updateResponseTime(startTime);
          // 🎯 L2 캐시 히트: ${fullKey}
          return redisResult;
        }
      }

      // L3: 영구 저장소 확인 (시뮬레이션)
      if (config.levels.includes(CacheLevel.L3_STORAGE)) {
        const storageResult = await this.getFromStorage(fullKey);
        if (storageResult !== null) {
          // 상위 레벨에도 저장 (캐시 승격)
          if (config.levels.includes(CacheLevel.L2_REDIS)) {
            await this.setToRedis(fullKey, storageResult, config.ttl);
          }
          if (config.levels.includes(CacheLevel.L1_MEMORY)) {
            this.memoryCache.set(fullKey, storageResult, { ttl: config.ttl * 1000 });
          }
          
          this.stats.hits++;
          this.stats.l3Hits++;
          this.updateResponseTime(startTime);
          // 🎯 L3 캐시 히트: ${fullKey}
          return storageResult;
        }
      }

      // 캐시 미스 - 데이터 생성
      this.stats.misses++;
      // ❌ 캐시 미스: ${fullKey}
      
      if (generator) {
        const generatedData = await generator();
        await this.set(strategy, key, generatedData);
        this.updateResponseTime(startTime);
        return generatedData;
      }

      return null;

    } catch (error) {
      console.error('❌ 캐시 조회 실패:', error);
      return generator ? await generator() : null;
    }
  }

  /**
   * 💾 캐시에 데이터 저장 (다층 저장)
   */
  async set<T>(strategy: CacheKeyStrategy, key: string, value: T): Promise<void> {
    const config = this.cacheConfigs.get(strategy);
    if (!config) {
      console.warn(`⚠️ 캐시 전략 미정의: ${strategy}`);
      return;
    }

    const fullKey = this.buildCacheKey(strategy, key);
    const processedValue = config.compression ? this.compress(value) : value;

    try {
      // 모든 레벨에 저장
      const promises: Promise<void>[] = [];

      if (config.levels.includes(CacheLevel.L1_MEMORY)) {
        this.memoryCache.set(fullKey, processedValue, { ttl: config.ttl * 1000 });
      }

      if (config.levels.includes(CacheLevel.L2_REDIS)) {
        promises.push(this.setToRedis(fullKey, processedValue, config.ttl));
      }

      if (config.levels.includes(CacheLevel.L3_STORAGE)) {
        promises.push(this.setToStorage(fullKey, processedValue, config.ttl));
      }

      await Promise.allSettled(promises);
      // 💾 캐시 저장 완료: ${fullKey} (레벨: ${config.levels.join(', ')})

    } catch (error) {
      console.error('❌ 캐시 저장 실패:', error);
    }
  }

  /**
   * 🗂️ 캐시 키 무효화
   */
  async invalidate(strategy: CacheKeyStrategy, key: string): Promise<void> {
    const fullKey = this.buildCacheKey(strategy, key);
    
    // 모든 레벨에서 삭제
    this.memoryCache.delete(fullKey);
    await this.deleteFromRedis(fullKey);
    await this.deleteFromStorage(fullKey);
    
    // 🗑️ 캐시 무효화: ${fullKey}
  }

  /**
   * 🧹 캐시 정리 (선택적)
   */
  async cleanup(strategy?: CacheKeyStrategy): Promise<void> {
    if (strategy) {
      // 특정 전략의 캐시만 정리
      const pattern = this.buildCacheKey(strategy, '*');
      await this.cleanupByPattern(pattern);
    } else {
      // 전체 캐시 정리
      this.memoryCache.clear();
      await this.cleanupRedis();
      await this.cleanupStorage();
    }
    
    // 🧹 캐시 정리 완료${strategy ? ` (${strategy})` : ''}
  }

  /**
   * 📊 캐시 통계 조회
   */
  getStats(): CacheStats {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
    
    return { ...this.stats };
  }

  /**
   * 🔧 프라이빗 헬퍼 메서드들
   */
  private buildCacheKey(strategy: CacheKeyStrategy, key: string): string {
    return `${strategy}:${key}`;
  }

  private compress<T>(value: T): any {
    // 실제 구현에서는 gzip 등 사용
    return value; // 시뮬레이션
  }

  private decompress<T>(value: any): T {
    // 실제 구현에서는 gzip 해제 등 사용  
    return value; // 시뮬레이션
  }

  private updateResponseTime(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.stats.avgResponseTime = 
      (this.stats.avgResponseTime * (this.stats.totalRequests - 1) + responseTime) / 
      this.stats.totalRequests;
  }

  // Redis 시뮬레이션 메서드들 (실제로는 Redis 클라이언트 사용)
  private async getFromRedis(key: string): Promise<any> {
    // Redis GET 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 10)); // 10ms 지연
    return null; // 실제로는 Redis에서 조회
  }

  private async setToRedis(key: string, value: any, ttl: number): Promise<void> {
    // Redis SET 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 5)); // 5ms 지연
    // Redis SET: ${key} (TTL: ${ttl}s)
  }

  private async deleteFromRedis(key: string): Promise<void> {
    // Redis DEL 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 5)); // 5ms 지연
    // Redis DEL: ${key}
  }

  private async cleanupRedis(): Promise<void> {
    // Redis FLUSHDB 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 20));
    // Redis 전체 정리 완료
  }

  // 영구 저장소 시뮬레이션 메서드들
  private async getFromStorage(key: string): Promise<any> {
    // 파일 시스템 또는 DB 조회 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms 지연
    return null; // 실제로는 저장소에서 조회
  }

  private async setToStorage(key: string, value: any, ttl: number): Promise<void> {
    // 파일 시스템 또는 DB 저장 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 30)); // 30ms 지연
    // Storage SET: ${key} (TTL: ${ttl}s)
  }

  private async deleteFromStorage(key: string): Promise<void> {
    // 파일 시스템 또는 DB 삭제 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 30)); // 30ms 지연
    // Storage DEL: ${key}
  }

  private async cleanupStorage(): Promise<void> {
    // 저장소 전체 정리 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 100));
    // Storage 전체 정리 완료
  }

  private async cleanupByPattern(pattern: string): Promise<void> {
    // 패턴 매칭 정리 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 50));
    // 패턴 정리 완료: ${pattern}
  }
}

/**
 * 🎯 캐시 유틸리티 함수들
 */
export class CacheUtils {
  /**
   * 캐시 키 생성 헬퍼
   */
  static generateCacheKey(
    baseKey: string, 
    params: Record<string, any> = {}
  ): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return paramString ? `${baseKey}|${paramString}` : baseKey;
  }

  /**
   * 캐시 성능 모니터링
   */
  static async monitorCachePerformance(
    cacheSystem: EnhancedCacheSystem
  ): Promise<void> {
    setInterval(() => {
      const stats = cacheSystem.getStats();
      console.log('📊 캐시 성능:', {
        hitRate: `${stats.hitRate.toFixed(1)}%`,
        totalRequests: stats.totalRequests,
        avgResponseTime: `${stats.avgResponseTime.toFixed(1)}ms`,
        levelDistribution: {
          L1: stats.l1Hits,
          L2: stats.l2Hits,
          L3: stats.l3Hits
        }
      });
    }, 60000); // 1분마다 모니터링
  }
}

// 싱글톤 인스턴스 내보내기
export const enhancedCache = EnhancedCacheSystem.getInstance();
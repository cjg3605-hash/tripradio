// 캐시 무효화 전략 시스템
import { supabase } from '@/lib/supabaseClient';

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  tags: string[];
  dependencies: string[];
}

export interface CacheInvalidationStrategy {
  strategy: 'time-based' | 'event-based' | 'dependency-based' | 'manual';
  config: {
    ttl?: number;
    events?: string[];
    dependencies?: string[];
    manualTriggers?: string[];
  };
}

class CacheInvalidationManager {
  private static instance: CacheInvalidationManager;
  private cacheStore: Map<string, CacheEntry> = new Map();
  private invalidationStrategies: Map<string, CacheInvalidationStrategy> = new Map();

  static getInstance(): CacheInvalidationManager {
    if (!CacheInvalidationManager.instance) {
      CacheInvalidationManager.instance = new CacheInvalidationManager();
    }
    return CacheInvalidationManager.instance;
  }

  // 캐시 엔트리 설정
  setCache(
    key: string, 
    value: any, 
    strategy: CacheInvalidationStrategy,
    tags: string[] = [],
    dependencies: string[] = []
  ): void {
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: strategy.config.ttl || 3600000, // 기본 1시간
      tags,
      dependencies
    };

    this.cacheStore.set(key, entry);
    this.invalidationStrategies.set(key, strategy);

    console.log(`📦 캐시 설정: ${key}`, {
      strategy: strategy.strategy,
      ttl: entry.ttl,
      tags,
      dependencies
    });
  }

  // 캐시 조회
  getCache(key: string): any | null {
    const entry = this.cacheStore.get(key);
    if (!entry) return null;

    // 시간 기반 만료 확인
    if (this.isExpired(entry)) {
      this.invalidateCache(key);
      return null;
    }

    // 의존성 기반 유효성 확인
    if (this.hasDependencyChanged(entry)) {
      this.invalidateCache(key);
      return null;
    }

    console.log(`💾 캐시 히트: ${key}`);
    return entry.value;
  }

  // 캐시 무효화
  invalidateCache(key: string, reason: string = 'manual'): void {
    const entry = this.cacheStore.get(key);
    if (!entry) return;

    this.cacheStore.delete(key);
    this.invalidationStrategies.delete(key);

    console.log(`🗑️ 캐시 무효화: ${key}`, { reason });

    // 연관 캐시도 무효화
    this.invalidateDependentCaches(key);
  }

  // 태그 기반 무효화
  invalidateByTag(tag: string): void {
    const keysToInvalidate: string[] = [];

    for (const [key, entry] of this.cacheStore.entries()) {
      if (entry.tags.includes(tag)) {
        keysToInvalidate.push(key);
      }
    }

    keysToInvalidate.forEach(key => {
      this.invalidateCache(key, `tag:${tag}`);
    });

    console.log(`🏷️ 태그 기반 무효화: ${tag}`, { invalidated: keysToInvalidate.length });
  }

  // 이벤트 기반 무효화
  handleCacheEvent(event: string, data?: any): void {
    for (const [key, strategy] of this.invalidationStrategies.entries()) {
      if (strategy.strategy === 'event-based' && 
          strategy.config.events?.includes(event)) {
        this.invalidateCache(key, `event:${event}`);
      }
    }

    console.log(`📡 이벤트 처리: ${event}`, data);
  }

  // 언어 변경 시 캐시 무효화
  handleLanguageChange(newLanguage: string, oldLanguage?: string): void {
    // 언어별 캐시 무효화
    this.invalidateByTag(`lang:${oldLanguage}`);
    this.invalidateByTag('multilingual');
    
    console.log(`🌍 언어 변경 캐시 무효화: ${oldLanguage} → ${newLanguage}`);
  }

  // 사용자 프로필 변경 시 캐시 무효화
  handleUserProfileChange(userId: string): void {
    this.invalidateByTag(`user:${userId}`);
    this.invalidateByTag('personalized');
    
    console.log(`👤 사용자 프로필 변경 캐시 무효화: ${userId}`);
  }

  // 가이드 업데이트 시 캐시 무효화
  handleGuideUpdate(locationName: string, language: string): void {
    const normalizedLocation = locationName.toLowerCase().trim();
    
    // 해당 위치의 모든 언어 캐시 무효화
    this.invalidateByTag(`location:${normalizedLocation}`);
    this.invalidateByTag(`guide:${normalizedLocation}:${language}`);
    
    // 관련 추천 캐시도 무효화
    this.invalidateByTag('recommendations');
    
    console.log(`📍 가이드 업데이트 캐시 무효화: ${normalizedLocation}:${language}`);
  }

  // 시간 기반 만료 확인
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // 의존성 변경 확인
  private hasDependencyChanged(entry: CacheEntry): boolean {
    for (const dependency of entry.dependencies) {
      const depEntry = this.cacheStore.get(dependency);
      if (!depEntry || this.isExpired(depEntry)) {
        return true;
      }
    }
    return false;
  }

  // 종속 캐시 무효화
  private invalidateDependentCaches(parentKey: string): void {
    const dependentKeys: string[] = [];

    for (const [key, entry] of this.cacheStore.entries()) {
      if (entry.dependencies.includes(parentKey)) {
        dependentKeys.push(key);
      }
    }

    dependentKeys.forEach(key => {
      this.invalidateCache(key, `dependency:${parentKey}`);
    });
  }

  // 캐시 통계
  getCacheStats(): {
    totalEntries: number;
    hitRate: number;
    expiredEntries: number;
    memoryUsage: number;
  } {
    const total = this.cacheStore.size;
    let expired = 0;
    let memoryUsage = 0;

    for (const entry of this.cacheStore.values()) {
      if (this.isExpired(entry)) expired++;
      memoryUsage += JSON.stringify(entry.value).length;
    }

    return {
      totalEntries: total,
      hitRate: total > 0 ? ((total - expired) / total) * 100 : 0,
      expiredEntries: expired,
      memoryUsage
    };
  }

  // 정리 작업
  cleanup(): void {
    const before = this.cacheStore.size;
    let cleaned = 0;

    for (const [key, entry] of this.cacheStore.entries()) {
      if (this.isExpired(entry)) {
        this.cacheStore.delete(key);
        this.invalidationStrategies.delete(key);
        cleaned++;
      }
    }

    console.log(`🧹 캐시 정리 완료: ${cleaned}/${before} 항목 제거`);
  }
}

// 편의 함수들
export const cacheManager = CacheInvalidationManager.getInstance();

export const setCacheWithInvalidation = (
  key: string,
  value: any,
  options: {
    ttl?: number;
    tags?: string[];
    dependencies?: string[];
    strategy?: 'time-based' | 'event-based' | 'dependency-based';
  } = {}
) => {
  const strategy: CacheInvalidationStrategy = {
    strategy: options.strategy || 'time-based',
    config: {
      ttl: options.ttl || 3600000,
      dependencies: options.dependencies
    }
  };

  cacheManager.setCache(
    key,
    value,
    strategy,
    options.tags || [],
    options.dependencies || []
  );
};

export const getCacheWithValidation = (key: string) => {
  return cacheManager.getCache(key);
};

export const invalidateCache = (key: string, reason?: string) => {
  cacheManager.invalidateCache(key, reason);
};

export const invalidateCacheByTag = (tag: string) => {
  cacheManager.invalidateByTag(tag);
};

// React Hook for cache invalidation
export const useCacheInvalidation = () => {
  return {
    invalidateByLanguage: (newLang: string, oldLang?: string) => 
      cacheManager.handleLanguageChange(newLang, oldLang),
    invalidateByUser: (userId: string) => 
      cacheManager.handleUserProfileChange(userId),
    invalidateByGuide: (location: string, language: string) => 
      cacheManager.handleGuideUpdate(location, language),
    invalidateByTag: (tag: string) => 
      cacheManager.invalidateByTag(tag),
    getCacheStats: () => 
      cacheManager.getCacheStats(),
    cleanup: () => 
      cacheManager.cleanup()
  };
};
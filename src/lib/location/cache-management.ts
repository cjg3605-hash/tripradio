/**
 * 위치 분류 캐시 관리 유틸리티
 */

import { getCacheStats, clearExpiredCache, clearAllCache } from './location-classification';

/**
 * 캐시 관리 API
 */
export class LocationCacheManager {
  /**
   * 캐시 통계 조회
   */
  static getStats() {
    return getCacheStats();
  }
  
  /**
   * 만료된 캐시 항목 정리
   */
  static cleanupExpiredEntries() {
    const statsBefore = getCacheStats();
    clearExpiredCache();
    const statsAfter = getCacheStats();
    
    return {
      before: statsBefore,
      after: statsAfter,
      cleaned: statsBefore.expiredEntries
    };
  }
  
  /**
   * 모든 캐시 초기화
   */
  static clearAll() {
    const statsBefore = getCacheStats();
    clearAllCache();
    
    return {
      cleared: statsBefore.totalEntries
    };
  }
  
  /**
   * 캐시 상태 리포트
   */
  static generateReport() {
    const stats = getCacheStats();
    const hitRate = stats.totalEntries > 0 ? (stats.validEntries / stats.totalEntries * 100).toFixed(1) : '0';
    
    return {
      ...stats,
      hitRate: `${hitRate}%`,
      memoryUsage: this.estimateMemoryUsage(),
      recommendations: this.getRecommendations(stats)
    };
  }
  
  /**
   * 메모리 사용량 추정 (KB)
   */
  private static estimateMemoryUsage() {
    const stats = getCacheStats();
    // 대략적 추정: 각 캐시 엔트리당 1KB
    return `${stats.totalEntries}KB (estimated)`;
  }
  
  /**
   * 캐시 최적화 권장사항
   */
  private static getRecommendations(stats: ReturnType<typeof getCacheStats>) {
    const recommendations: string[] = [];
    
    if (stats.expiredEntries > stats.validEntries) {
      recommendations.push('만료된 항목이 많습니다. cleanupExpiredEntries()를 실행하세요.');
    }
    
    if (stats.totalEntries > 1000) {
      recommendations.push('캐시 크기가 큽니다. 메모리 사용량을 모니터링하세요.');
    }
    
    if (stats.validEntries === 0 && stats.totalEntries > 0) {
      recommendations.push('모든 캐시가 만료되었습니다. 캐시를 정리하거나 TTL을 조정하세요.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('캐시 상태가 양호합니다.');
    }
    
    return recommendations;
  }
}

/**
 * 자동 캐시 정리 스케줄러
 */
export class CacheScheduler {
  private static intervalId: NodeJS.Timeout | null = null;
  
  /**
   * 자동 정리 시작 (기본: 10분마다)
   */
  static startAutoCleanup(intervalMinutes: number = 10) {
    if (this.intervalId) {
      console.warn('캐시 자동 정리가 이미 실행 중입니다.');
      return;
    }
    
    this.intervalId = setInterval(() => {
      const result = LocationCacheManager.cleanupExpiredEntries();
      if (result.cleaned > 0) {
        console.log(`🧹 캐시 자동 정리: ${result.cleaned}개 만료 항목 제거`);
      }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`⏰ 캐시 자동 정리 시작: ${intervalMinutes}분마다 실행`);
  }
  
  /**
   * 자동 정리 중지
   */
  static stopAutoCleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ 캐시 자동 정리 중지');
    }
  }
  
  /**
   * 자동 정리 상태 확인
   */
  static isRunning() {
    return this.intervalId !== null;
  }
}

// Node.js 환경에서만 자동 정리 시작
if (typeof window === 'undefined') {
  // 개발 환경에서는 5분마다, 프로덕션에서는 10분마다
  const interval = process.env.NODE_ENV === 'development' ? 5 : 10;
  CacheScheduler.startAutoCleanup(interval);
}
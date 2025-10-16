/**
 * Redis 기반 캐싱 시스템
 * 팟캐스트 생성 성능 최적화를 위한 다층 캐싱
 */

import Redis from 'ioredis';

interface CacheConfig {
  redis: Redis;
  ttl: {
    script: number;        // 스크립트 캐시 TTL (1시간)
    tts: number;          // TTS 결과 캐시 TTL (24시간)
    structure: number;    // 챕터 구조 캐시 TTL (6시간)
  };
}

export class RedisCacheManager {
  private redis: Redis;
  private config: CacheConfig;

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    this.config = {
      redis: this.redis,
      ttl: {
        script: 3600,    // 1시간
        tts: 86400,      // 24시간
        structure: 21600 // 6시간
      }
    };
  }

  /**
   * 챕터 구조 캐싱
   * 동일한 위치에 대한 반복 요청 시 구조 재사용
   */
  async cacheChapterStructure(
    locationName: string, 
    language: string, 
    structure: any
  ): Promise<void> {
    const key = `structure:${locationName}:${language}`;
    await this.redis.setex(
      key, 
      this.config.ttl.structure, 
      JSON.stringify(structure)
    );
    console.log(`💾 챕터 구조 캐시 저장: ${key}`);
  }

  async getCachedChapterStructure(
    locationName: string, 
    language: string
  ): Promise<any | null> {
    const key = `structure:${locationName}:${language}`;
    const cached = await this.redis.get(key);
    
    if (cached) {
      console.log(`🚀 캐시된 챕터 구조 사용: ${key}`);
      return JSON.parse(cached);
    }
    return null;
  }

  /**
   * 스크립트 캐싱
   * 챕터별 생성된 스크립트 캐싱
   */
  async cacheChapterScript(
    locationName: string,
    chapterIndex: number,
    language: string,
    script: string
  ): Promise<void> {
    const key = `script:${locationName}:${chapterIndex}:${language}`;
    await this.redis.setex(
      key,
      this.config.ttl.script,
      script
    );
  }

  async getCachedChapterScript(
    locationName: string,
    chapterIndex: number,
    language: string
  ): Promise<string | null> {
    const key = `script:${locationName}:${chapterIndex}:${language}`;
    const cached = await this.redis.get(key);
    
    if (cached) {
      console.log(`🚀 캐시된 스크립트 사용: ${key}`);
    }
    return cached;
  }

  /**
   * TTS 결과 캐싱 
   * 음성 파일 경로 및 메타데이터 캐싱
   */
  async cacheTTSResult(
    episodeId: string,
    ttsResult: any
  ): Promise<void> {
    const key = `tts:${episodeId}`;
    await this.redis.setex(
      key,
      this.config.ttl.tts,
      JSON.stringify({
        segmentFiles: ttsResult.segmentFiles,
        totalDuration: ttsResult.totalDuration,
        folderPath: ttsResult.folderPath,
        cachedAt: Date.now()
      })
    );
    console.log(`💾 TTS 결과 캐시 저장: ${key}`);
  }

  async getCachedTTSResult(episodeId: string): Promise<any | null> {
    const key = `tts:${episodeId}`;
    const cached = await this.redis.get(key);
    
    if (cached) {
      const result = JSON.parse(cached);
      console.log(`🚀 캐시된 TTS 결과 사용: ${key} (${Date.now() - result.cachedAt}ms 전 캐시)`);
      return result;
    }
    return null;
  }

  /**
   * 성능 메트릭 캐싱
   * 성능 분석을 위한 지표 저장
   */
  async storePerformanceMetric(
    locationName: string,
    metrics: {
      totalTime: number;
      chapterGeneration: number;
      ttsGeneration: number;
      segmentCount: number;
      throughput: number;
    }
  ): Promise<void> {
    const key = `metrics:${locationName}:${Date.now()}`;
    await this.redis.setex(
      key,
      86400, // 24시간 보관
      JSON.stringify({
        ...metrics,
        timestamp: new Date().toISOString()
      })
    );
  }

  /**
   * 캐시 통계 조회
   */
  async getCacheStats(): Promise<{
    scriptHits: number;
    structureHits: number;
    ttsHits: number;
    totalKeys: number;
  }> {
    const scriptKeys = await this.redis.keys('script:*');
    const structureKeys = await this.redis.keys('structure:*');
    const ttsKeys = await this.redis.keys('tts:*');
    
    return {
      scriptHits: scriptKeys.length,
      structureHits: structureKeys.length,
      ttsHits: ttsKeys.length,
      totalKeys: scriptKeys.length + structureKeys.length + ttsKeys.length
    };
  }

  /**
   * 리소스 정리
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export default RedisCacheManager;
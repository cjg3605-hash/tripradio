/**
 * Data Source Cache System
 * 데이터소스 캐싱 시스템
 */

import { CacheEntry, CacheConfig, CacheStrategy } from '../types/data-types';

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  oldestEntry: string | null;
  newestEntry: string | null;
}

export class DataSourceCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    totalRequests: number;
  } = { hits: 0, misses: 0, totalRequests: 0 };

  constructor(config: CacheConfig) {
    this.config = {
      ttl: config.ttl || 3600, // 1 hour default
      maxSize: config.maxSize || 100 * 1024 * 1024, // 100MB default
      strategy: config.strategy || 'lru',
      compression: config.compression || false
    };

    // 정기적으로 만료된 항목 정리
    setInterval(() => this.cleanup(), 60000); // 1분마다
  }

  /**
   * 캐시에서 데이터 조회
   */
  async get<T = any>(key: string): Promise<T | null> {
    this.stats.totalRequests++;

    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // TTL 확인
    if (Date.now() > new Date(entry.expiresAt).getTime()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Hit count 업데이트
    entry.hitCount++;
    this.stats.hits++;

    // LRU 전략: 접근 시간 업데이트를 위해 재설정
    if (this.config.strategy === 'lru') {
      this.cache.delete(key);
      this.cache.set(key, entry);
    }

    // 압축 해제
    let data = entry.data;
    if (this.config.compression && typeof data === 'string' && data.startsWith('gzip:')) {
      data = this.decompress(data);
    }

    return data;
  }

  /**
   * 캐시에 데이터 저장
   */
  async set(key: string, data: any, tags: string[] = [], customTtl?: number): Promise<void> {
    const ttl = customTtl || this.config.ttl;
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    
    // 데이터 압축
    let processedData = data;
    let size = this.calculateSize(data);
    
    if (this.config.compression && size > 1024) { // 1KB 이상만 압축
      processedData = this.compress(data);
      size = this.calculateSize(processedData);
    }

    const entry: CacheEntry = {
      key,
      data: processedData,
      source: 'data-cache',
      createdAt: new Date().toISOString(),
      expiresAt,
      hitCount: 0,
      size,
      tags: [...tags]
    };

    // 캐시 크기 확인 및 공간 확보
    await this.ensureSpace(size);

    // 캐시에 저장
    this.cache.set(key, entry);
  }

  /**
   * 특정 키 삭제
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * 태그별 캐시 삭제
   */
  async clear(tags?: string[]): Promise<void> {
    if (!tags || tags.length === 0) {
      this.cache.clear();
      return;
    }

    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 캐시 통계
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;

    const sortedByDate = entries.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      oldestEntry: sortedByDate[0]?.key || null,
      newestEntry: sortedByDate[sortedByDate.length - 1]?.key || null
    };
  }

  /**
   * 만료된 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > new Date(entry.expiresAt).getTime()) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 캐시 공간 확보
   */
  private async ensureSpace(newEntrySize: number): Promise<void> {
    const currentSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    if (currentSize + newEntrySize <= this.config.maxSize) {
      return; // 공간이 충분함
    }

    // 제거할 항목들 결정
    const entries = Array.from(this.cache.entries());
    let keysToDelete: string[] = [];

    switch (this.config.strategy) {
      case 'lru':
        // Map의 순서는 삽입/재설정 순서를 유지하므로 앞쪽이 오래된 것
        keysToDelete = this.selectLRU(entries, newEntrySize);
        break;
      
      case 'lfu':
        keysToDelete = this.selectLFU(entries, newEntrySize);
        break;
      
      case 'fifo':
        keysToDelete = this.selectFIFO(entries, newEntrySize);
        break;
      
      case 'ttl':
        keysToDelete = this.selectByTTL(entries, newEntrySize);
        break;
    }

    // 선택된 항목들 삭제
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * LRU 선택
   */
  private selectLRU(entries: [string, CacheEntry][], requiredSpace: number): string[] {
    const keysToDelete: string[] = [];
    let freedSpace = 0;

    // Map의 앞쪽부터 삭제 (가장 오래 사용되지 않은 것)
    for (const [key, entry] of entries) {
      keysToDelete.push(key);
      freedSpace += entry.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }

    return keysToDelete;
  }

  /**
   * LFU 선택
   */
  private selectLFU(entries: [string, CacheEntry][], requiredSpace: number): string[] {
    // hitCount가 낮은 순으로 정렬
    const sortedEntries = entries.sort((a, b) => a[1].hitCount - b[1].hitCount);
    
    const keysToDelete: string[] = [];
    let freedSpace = 0;

    for (const [key, entry] of sortedEntries) {
      keysToDelete.push(key);
      freedSpace += entry.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }

    return keysToDelete;
  }

  /**
   * FIFO 선택
   */
  private selectFIFO(entries: [string, CacheEntry][], requiredSpace: number): string[] {
    // 생성 시간이 오래된 순으로 정렬
    const sortedEntries = entries.sort((a, b) => 
      new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime()
    );
    
    const keysToDelete: string[] = [];
    let freedSpace = 0;

    for (const [key, entry] of sortedEntries) {
      keysToDelete.push(key);
      freedSpace += entry.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }

    return keysToDelete;
  }

  /**
   * TTL 기준 선택
   */
  private selectByTTL(entries: [string, CacheEntry][], requiredSpace: number): string[] {
    // 만료 시간이 가까운 순으로 정렬
    const sortedEntries = entries.sort((a, b) => 
      new Date(a[1].expiresAt).getTime() - new Date(b[1].expiresAt).getTime()
    );
    
    const keysToDelete: string[] = [];
    let freedSpace = 0;

    for (const [key, entry] of sortedEntries) {
      keysToDelete.push(key);
      freedSpace += entry.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }

    return keysToDelete;
  }

  /**
   * 데이터 크기 계산
   */
  private calculateSize(data: any): number {
    if (typeof data === 'string') {
      return data.length * 2; // UTF-16 기준
    }
    
    try {
      return JSON.stringify(data).length * 2;
    } catch {
      return 1024; // 기본값
    }
  }

  /**
   * 데이터 압축 (간단한 구현)
   */
  private compress(data: any): string {
    if (!this.config.compression) {
      return data;
    }

    try {
      const jsonString = JSON.stringify(data);
      
      // 실제 환경에서는 pako 등의 압축 라이브러리 사용 권장
      // 여기서는 간단한 문자열 압축만 구현
      return 'gzip:' + this.simpleCompress(jsonString);
    } catch {
      return data;
    }
  }

  /**
   * 데이터 압축 해제
   */
  private decompress(compressedData: string): any {
    if (!compressedData.startsWith('gzip:')) {
      return compressedData;
    }

    try {
      const compressed = compressedData.substring(5);
      const decompressed = this.simpleDecompress(compressed);
      return JSON.parse(decompressed);
    } catch {
      return compressedData;
    }
  }

  /**
   * 간단한 문자열 압축 (실제로는 압축 라이브러리 사용 권장)
   */
  private simpleCompress(str: string): string {
    // 단순한 런길이 인코딩
    let compressed = '';
    let count = 1;
    let currentChar = str[0];

    for (let i = 1; i < str.length; i++) {
      if (str[i] === currentChar && count < 9) {
        count++;
      } else {
        compressed += count > 1 ? count + currentChar : currentChar;
        currentChar = str[i];
        count = 1;
      }
    }

    // 마지막 문자 처리
    compressed += count > 1 ? count + currentChar : currentChar;
    
    return compressed;
  }

  /**
   * 간단한 문자열 압축 해제
   */
  private simpleDecompress(compressed: string): string {
    let decompressed = '';
    
    for (let i = 0; i < compressed.length; i++) {
      const char = compressed[i];
      
      if (/\d/.test(char) && i + 1 < compressed.length) {
        const count = parseInt(char);
        const nextChar = compressed[i + 1];
        decompressed += nextChar.repeat(count);
        i++; // 다음 문자 건너뛰기
      } else {
        decompressed += char;
      }
    }
    
    return decompressed;
  }

  /**
   * 캐시 내용 검사 (디버깅용)
   */
  inspect(): Array<{ key: string; size: number; hitCount: number; expiresAt: string; tags: string[] }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: entry.size,
      hitCount: entry.hitCount,
      expiresAt: entry.expiresAt,
      tags: entry.tags
    }));
  }

  /**
   * 캐시 설정 업데이트
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 캐시 메모리 사용량 최적화
   */
  optimize(): void {
    // 만료된 항목 정리
    this.cleanup();

    // 히트 카운트가 0인 오래된 항목들 제거
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount === 0 && 
          new Date(entry.createdAt).getTime() < oneDayAgo) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
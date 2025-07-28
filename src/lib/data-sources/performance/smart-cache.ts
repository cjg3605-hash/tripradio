/**
 * Smart Caching System with Predictive Preloading
 * 예측적 프리로딩을 포함한 스마트 캐싱 시스템
 */

interface SmartCacheConfig {
  defaultTtl: number;
  maxSize: number;
  preloadThreshold: number; // Cache hit ratio threshold for preloading
  adaptiveTtl: boolean;
  compressionEnabled: boolean;
}

interface CacheMetrics {
  hitRate: number;
  avgResponseTime: number;
  memoryUtilization: number;
  preloadSuccessRate: number;
}

interface SmartCacheEntry {
  data: any;
  metadata: {
    key: string;
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
    ttl: number;
    size: number;
    compressed: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    source: string;
  };
}

export class SmartCache {
  private cache: Map<string, SmartCacheEntry> = new Map();
  private config: SmartCacheConfig;
  private metrics: CacheMetrics = {
    hitRate: 0,
    avgResponseTime: 0,
    memoryUtilization: 0,
    preloadSuccessRate: 0
  };
  private accessPatterns: Map<string, number[]> = new Map(); // Track access patterns for prediction

  constructor(config: Partial<SmartCacheConfig> = {}) {
    this.config = {
      defaultTtl: 1800, // 30 minutes
      maxSize: 200 * 1024 * 1024, // 200MB
      preloadThreshold: 0.8, // 80% hit rate triggers preloading
      adaptiveTtl: true,
      compressionEnabled: true,
      ...config
    };

    // Background maintenance tasks
    setInterval(() => this.performMaintenance(), 30000); // 30 seconds
    setInterval(() => this.predictivePreload(), 120000); // 2 minutes
  }

  /**
   * 🚀 Intelligent Cache Get with Performance Monitoring
   */
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    // Update access pattern
    this.updateAccessPattern(key);
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateMetrics('miss', Date.now() - startTime);
      return null;
    }

    // TTL check with adaptive extension
    const now = Date.now();
    const age = now - entry.metadata.createdAt;
    const ttl = this.config.adaptiveTtl ? 
      this.calculateAdaptiveTtl(entry) : entry.metadata.ttl;

    if (age > ttl) {
      this.cache.delete(key);
      this.updateMetrics('miss', Date.now() - startTime);
      return null;
    }

    // Update access metadata
    entry.metadata.lastAccessed = now;
    entry.metadata.accessCount++;

    this.updateMetrics('hit', Date.now() - startTime);
    
    // Decompress if needed
    const data = entry.metadata.compressed ? 
      await this.decompress(entry.data) : entry.data;
    
    return data;
  }

  /**
   * 🎯 Smart Cache Set with Priority and Compression
   */
  async set(
    key: string, 
    data: any, 
    options: {
      ttl?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high' | 'critical';
      source?: string;
      forceCompress?: boolean;
    } = {}
  ): Promise<void> {
    const now = Date.now();
    const serializedData = JSON.stringify(data);
    const dataSize = new Blob([serializedData]).size;
    
    // Compression decision
    const shouldCompress = options.forceCompress || 
      (this.config.compressionEnabled && dataSize > 10240); // 10KB threshold
    
    const finalData = shouldCompress ? 
      await this.compress(serializedData) : data;
    
    const entry: SmartCacheEntry = {
      data: finalData,
      metadata: {
        key,
        createdAt: now,
        lastAccessed: now,
        accessCount: 1,
        ttl: options.ttl || this.config.defaultTtl,
        size: dataSize,
        compressed: shouldCompress,
        priority: options.priority || 'medium',
        tags: options.tags || [],
        source: options.source || 'unknown'
      }
    };

    // Eviction if needed
    await this.ensureCapacity(dataSize);
    
    this.cache.set(key, entry);
    this.updateMemoryMetrics();
  }

  /**
   * 🧠 Predictive Preloading based on Access Patterns
   */
  private async predictivePreload(): Promise<void> {
    if (this.metrics.hitRate < this.config.preloadThreshold) return;

    const predictions = this.generateAccessPredictions();
    let preloadSuccess = 0;
    let preloadTotal = 0;

    for (const { key, probability } of predictions) {
      if (probability > 0.7 && !this.cache.has(key)) {
        preloadTotal++;
        try {
          // 예측된 키에 대한 데이터 사전 로딩 로직
          const preloadedData = await this.attemptPreload(key);
          if (preloadedData) {
            await this.set(key, preloadedData, { 
              priority: 'low',
              tags: ['preloaded']
            });
            preloadSuccess++;
          }
        } catch (error) {
          console.warn(`예측 로딩 실패: ${key}`, error);
        }
      }
    }

    this.metrics.preloadSuccessRate = preloadTotal > 0 ? 
      preloadSuccess / preloadTotal : 0;
  }

  /**
   * 📊 Access Pattern Analysis for Prediction
   */
  private generateAccessPredictions(): Array<{key: string, probability: number}> {
    const predictions: Array<{key: string, probability: number}> = [];
    
    for (const [key, accesses] of this.accessPatterns.entries()) {
      if (accesses.length < 3) continue; // Need minimum data points
      
      // Simple time-series analysis
      const now = Date.now();
      const recentAccesses = accesses.filter(time => now - time < 3600000); // Last hour
      const accessFrequency = recentAccesses.length;
      const avgInterval = this.calculateAverageInterval(recentAccesses);
      
      // Prediction probability based on frequency and pattern regularity
      const probability = Math.min(
        (accessFrequency / 10) * (avgInterval > 0 ? 1 / Math.log(avgInterval / 1000) : 0),
        1.0
      );
      
      if (probability > 0.3) {
        predictions.push({ key, probability });
      }
    }
    
    return predictions.sort((a, b) => b.probability - a.probability).slice(0, 10);
  }

  /**
   * ⚡ Adaptive TTL Calculation based on Usage Patterns
   */
  private calculateAdaptiveTtl(entry: SmartCacheEntry): number {
    const baseTime = Date.now() - entry.metadata.createdAt;
    const accessFrequency = entry.metadata.accessCount / (baseTime / 3600000); // per hour
    
    // High frequency = longer TTL
    let multiplier = 1.0;
    if (accessFrequency > 10) multiplier = 2.0;
    else if (accessFrequency > 5) multiplier = 1.5;
    else if (accessFrequency < 1) multiplier = 0.5;
    
    // Priority adjustment
    switch (entry.metadata.priority) {
      case 'critical': multiplier *= 2.0; break;
      case 'high': multiplier *= 1.5; break;
      case 'low': multiplier *= 0.7; break;
    }
    
    return entry.metadata.ttl * multiplier;
  }

  /**
   * 🗑️ Intelligent Eviction with LRU + Priority
   */
  private async ensureCapacity(newDataSize: number): Promise<void> {
    let currentSize = this.getCurrentSize();
    
    if (currentSize + newDataSize <= this.config.maxSize) return;
    
    // Create eviction candidates sorted by priority and recency
    const candidates = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        entry,
        evictionScore: this.calculateEvictionScore(entry)
      }))
      .sort((a, b) => a.evictionScore - b.evictionScore); // Lower score = higher eviction priority
    
    // Evict until we have enough space
    for (const candidate of candidates) {
      if (currentSize + newDataSize <= this.config.maxSize) break;
      
      this.cache.delete(candidate.key);
      currentSize -= candidate.entry.metadata.size;
    }
  }

  /**
   * 📏 Eviction Score Calculation (lower = more likely to evict)
   */
  private calculateEvictionScore(entry: SmartCacheEntry): number {
    const now = Date.now();
    const age = now - entry.metadata.lastAccessed;
    const frequency = entry.metadata.accessCount;
    
    // Base score from age (older = lower score)
    let score = Math.max(0, 1000 - (age / 1000));
    
    // Frequency bonus
    score += Math.min(frequency * 10, 500);
    
    // Priority multiplier
    const priorityMultiplier = {
      'critical': 10,
      'high': 5,
      'medium': 2,
      'low': 1
    }[entry.metadata.priority];
    
    return score * priorityMultiplier;
  }

  /**
   * 🔧 Background Maintenance
   */
  private performMaintenance(): void {
    const now = Date.now();
    let cleaned = 0;
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.metadata.createdAt;
      const ttl = this.config.adaptiveTtl ? 
        this.calculateAdaptiveTtl(entry) : entry.metadata.ttl;
      
      if (age > ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    // Clean old access patterns
    for (const [key, accesses] of this.accessPatterns.entries()) {
      const recentAccesses = accesses.filter(time => now - time < 86400000); // 24 hours
      if (recentAccesses.length > 0) {
        this.accessPatterns.set(key, recentAccesses);
      } else {
        this.accessPatterns.delete(key);
      }
    }
    
    this.updateMemoryMetrics();
    
    if (cleaned > 0) {
      console.log(`🧹 Cache maintenance: ${cleaned} expired entries removed`);
    }
  }

  /**
   * Helper Methods
   */
  private updateAccessPattern(key: string): void {
    const now = Date.now();
    const pattern = this.accessPatterns.get(key) || [];
    pattern.push(now);
    
    // Keep only recent accesses (last 24 hours)
    const recentPattern = pattern.filter(time => now - time < 86400000);
    this.accessPatterns.set(key, recentPattern);
  }

  private calculateAverageInterval(accesses: number[]): number {
    if (accesses.length < 2) return 0;
    
    const intervals: number[] = [];
    for (let i = 1; i < accesses.length; i++) {
      intervals.push(accesses[i] - accesses[i-1]);
    }
    
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private updateMetrics(type: 'hit' | 'miss', responseTime: number): void {
    // Simple exponential moving average
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * 0.9) + (responseTime * 0.1);
    
    // Hit rate calculation would need persistent counters
    // This is simplified for demonstration
  }

  private updateMemoryMetrics(): void {
    const currentSize = this.getCurrentSize();
    this.metrics.memoryUtilization = currentSize / this.config.maxSize;
  }

  private getCurrentSize(): number {
    return Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.metadata.size, 0);
  }

  private async compress(data: string): Promise<string> {
    // Simple compression simulation - in real implementation use zlib
    return data; // Placeholder
  }

  private async decompress(data: string): Promise<any> {
    // Simple decompression simulation
    return data; // Placeholder
  }

  private async attemptPreload(key: string): Promise<any> {
    // Placeholder for actual preload logic
    // In real implementation, this would trigger the original data source
    return null;
  }

  /**
   * 📊 Get Cache Statistics
   */
  getStats(): CacheMetrics & {
    totalEntries: number;
    totalSize: number;
    topAccessedKeys: string[];
  } {
    const totalSize = this.getCurrentSize();
    const entries = Array.from(this.cache.entries());
    const topAccessed = entries
      .sort((a, b) => b[1].metadata.accessCount - a[1].metadata.accessCount)
      .slice(0, 10)
      .map(([key]) => key);

    return {
      ...this.metrics,
      totalEntries: this.cache.size,
      totalSize,
      topAccessedKeys: topAccessed
    };
  }

  /**
   * 🗑️ Clear Cache with optional tags
   */
  async clear(tags?: string[]): Promise<void> {
    if (!tags) {
      this.cache.clear();
      this.accessPatterns.clear();
      return;
    }

    for (const [key, entry] of this.cache.entries()) {
      const hasMatchingTag = tags.some(tag => 
        entry.metadata.tags.includes(tag)
      );
      
      if (hasMatchingTag) {
        this.cache.delete(key);
      }
    }
  }
}
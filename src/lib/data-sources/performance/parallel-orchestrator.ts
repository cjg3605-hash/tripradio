/**
 * High-Performance Parallel Data Orchestrator
 * 고성능 병렬 데이터 오케스트레이터
 */

import { globalConnectionPool } from './connection-pool';
import { SmartCache } from './smart-cache';
import { DataIntegrationOrchestrator } from '../orchestrator/data-orchestrator';

interface ParallelTask<T> {
  id: string;
  source: string;
  operation: () => Promise<T>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
    exponential: boolean;
  };
}

interface BatchResult<T> {
  successful: Map<string, T>;
  failed: Map<string, Error>;
  performance: {
    totalTime: number;
    parallelEfficiency: number; // 0-1, higher is better
    throughput: number; // operations per second
    resourceUtilization: number;
  };
}

export class ParallelOrchestrator {
  private smartCache = new SmartCache({
    defaultTtl: 900, // 15 minutes for high-frequency data
    maxSize: 150 * 1024 * 1024, // 150MB
    preloadThreshold: 0.75,
    adaptiveTtl: true,
    compressionEnabled: true
  });

  private circuitBreakers = new Map<string, {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
  }>();

  /**
   * 🚀 Ultra-Fast Parallel Data Collection
   */
  async executeParallelBatch<T>(
    tasks: ParallelTask<T>[],
    options: {
      maxConcurrency?: number;
      timeoutMs?: number;
      failFast?: boolean;
      preserveOrder?: boolean;
    } = {}
  ): Promise<BatchResult<T>> {
    const startTime = Date.now();
    const maxConcurrency = options.maxConcurrency || 8;
    const globalTimeout = options.timeoutMs || 15000; // 15초
    
    // Task prioritization and batching
    const prioritizedTasks = this.prioritizeTasks(tasks);
    const batches = this.createConcurrencyBatches(prioritizedTasks, maxConcurrency);
    
    const successful = new Map<string, T>();
    const failed = new Map<string, Error>();
    
    // Execute batches with intelligent scheduling
    for (const batch of batches) {
      const batchPromises = batch.map(task => this.executeTaskWithResilience(task));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const task = batch[index];
          
          if (result.status === 'fulfilled') {
            successful.set(task.id, result.value);
            this.updateCircuitBreaker(task.source, 'success');
          } else {
            failed.set(task.id, result.reason);
            this.updateCircuitBreaker(task.source, 'failure');
          }
        });
        
        // Fast-fail check
        if (options.failFast && failed.size > 0) {
          break;
        }
        
      } catch (error) {
        console.error('배치 실행 실패:', error);
        break;
      }
    }

    const totalTime = Date.now() - startTime;
    const performance = this.calculatePerformanceMetrics(
      tasks.length, 
      successful.size, 
      totalTime, 
      maxConcurrency
    );

    return {
      successful,
      failed,
      performance
    };
  }

  /**
   * 🎯 Smart Data Source Orchestration
   */
  async optimizedDataCollection(
    query: string,
    coordinates?: { lat: number; lng: number },
    options?: {
      sources?: string[];
      priorityMode?: 'speed' | 'accuracy' | 'comprehensive';
      cacheStrategy?: 'aggressive' | 'conservative' | 'adaptive';
    }
  ) {
    const sources = options?.sources || ['unesco', 'wikidata', 'government', 'google_places'];
    const priorityMode = options?.priorityMode || 'speed';
    
    // Create optimized tasks based on priority mode
    const tasks: ParallelTask<any>[] = [];
    
    for (const source of sources) {
      const cacheKey = `optimized:${source}:${query}:${coordinates?.lat}:${coordinates?.lng}`;
      
      // Check smart cache first
      const cached = await this.smartCache.get(cacheKey);
      if (cached && options?.cacheStrategy !== 'conservative') {
        continue; // Skip API call if cached data is available
      }
      
      const task: ParallelTask<any> = {
        id: `${source}_${Date.now()}`,
        source,
        operation: () => this.executeOptimizedSourceCall(source, query, coordinates),
        priority: this.getSourcePriority(source, priorityMode),
        timeout: this.getOptimalTimeout(source, priorityMode),
        retryPolicy: {
          maxRetries: priorityMode === 'speed' ? 1 : 3,
          backoffMs: 500,
          exponential: true
        }
      };
      
      tasks.push(task);
    }
    
    // Execute with performance optimization
    const result = await this.executeParallelBatch(tasks, {
      maxConcurrency: priorityMode === 'speed' ? 8 : 4,
      timeoutMs: priorityMode === 'speed' ? 8000 : 20000,
      failFast: priorityMode === 'speed',
      preserveOrder: priorityMode === 'comprehensive'
    });
    
    // Cache successful results
    for (const [taskId, data] of result.successful) {
      const source = tasks.find(t => t.id === taskId)?.source;
      if (source) {
        const cacheKey = `optimized:${source}:${query}:${coordinates?.lat}:${coordinates?.lng}`;
        await this.smartCache.set(cacheKey, data, {
          priority: this.getSourcePriority(source, priorityMode),
          tags: [source, 'optimized'],
          source
        });
      }
    }
    
    return {
      data: Object.fromEntries(result.successful),
      errors: Object.fromEntries(result.failed),
      performance: result.performance,
      cacheStats: this.smartCache.getStats()
    };
  }

  /**
   * 🔧 Resilient Task Execution with Circuit Breaker
   */
  private async executeTaskWithResilience<T>(task: ParallelTask<T>): Promise<T> {
    // Circuit breaker check
    if (this.isCircuitOpen(task.source)) {
      throw new Error(`Circuit breaker open for source: ${task.source}`);
    }
    
    // Connection pool management
    const connection = await globalConnectionPool.acquire(task.source);
    
    try {
      // Execute with timeout and retry logic
      const result = await this.executeWithRetry(task);
      return result;
      
    } finally {
      globalConnectionPool.release(connection);
    }
  }

  /**
   * 🔄 Retry Logic with Exponential Backoff
   */
  private async executeWithRetry<T>(task: ParallelTask<T>): Promise<T> {
    const maxRetries = task.retryPolicy?.maxRetries || 2;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: ${task.id}`)), task.timeout)
        );
        
        const result = await Promise.race([
          task.operation(),
          timeoutPromise
        ]);
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // Exponential backoff
        if (attempt < maxRetries && task.retryPolicy) {
          const delay = task.retryPolicy.exponential ?
            task.retryPolicy.backoffMs * Math.pow(2, attempt) :
            task.retryPolicy.backoffMs;
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error(`Task failed after ${maxRetries} retries: ${task.id}`);
  }

  /**
   * 📊 Performance Metrics Calculation
   */
  private calculatePerformanceMetrics(
    totalTasks: number,
    successfulTasks: number,
    totalTimeMs: number,
    maxConcurrency: number
  ) {
    const throughput = successfulTasks / (totalTimeMs / 1000);
    const successRate = successfulTasks / totalTasks;
    const parallelEfficiency = Math.min(throughput / maxConcurrency, 1.0);
    
    return {
      totalTime: totalTimeMs,
      parallelEfficiency,
      throughput,
      resourceUtilization: successRate * parallelEfficiency,
      successRate
    };
  }

  /**
   * Helper Methods
   */
  private prioritizeTasks<T>(tasks: ParallelTask<T>[]): ParallelTask<T>[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  private createConcurrencyBatches<T>(
    tasks: ParallelTask<T>[], 
    maxConcurrency: number
  ): ParallelTask<T>[][] {
    const batches: ParallelTask<T>[][] = [];
    for (let i = 0; i < tasks.length; i += maxConcurrency) {
      batches.push(tasks.slice(i, i + maxConcurrency));
    }
    return batches;
  }

  private getSourcePriority(source: string, mode: string): 'low' | 'medium' | 'high' | 'critical' {
    const priorities = {
      speed: {
        google_places: 'critical' as const,
        unesco: 'high' as const,
        wikidata: 'medium' as const,
        government: 'low' as const
      },
      accuracy: {
        unesco: 'critical' as const,
        government: 'high' as const,
        wikidata: 'medium' as const,
        google_places: 'low' as const
      },
      comprehensive: {
        unesco: 'high' as const,
        wikidata: 'high' as const,
        government: 'high' as const,
        google_places: 'high' as const
      }
    };
    
    return priorities[mode as keyof typeof priorities]?.[source as keyof typeof priorities.speed] || 'medium';
  }

  private getOptimalTimeout(source: string, mode: string): number {
    const timeouts = {
      speed: {
        google_places: 3000,
        unesco: 5000,
        wikidata: 6000,
        government: 8000
      },
      accuracy: {
        google_places: 5000,
        unesco: 10000,
        wikidata: 12000,
        government: 15000
      },
      comprehensive: {
        google_places: 8000,
        unesco: 15000,
        wikidata: 18000,
        government: 20000
      }
    };
    
    return timeouts[mode as keyof typeof timeouts]?.[source as keyof typeof timeouts.speed] || 10000;
  }

  private async executeOptimizedSourceCall(
    source: string, 
    query: string, 
    coordinates?: { lat: number; lng: number }
  ): Promise<any> {
    // This would call the actual data source service
    // For now, return a placeholder that integrates with existing orchestrator
    const orchestrator = DataIntegrationOrchestrator.getInstance();
    
    // Execute single source call
    const result = await orchestrator.integrateLocationData(query, coordinates, {
      dataSources: [source],
      includeReviews: false, // Optimize for speed
      includeImages: false
    });
    
    return result.data;
  }

  private updateCircuitBreaker(source: string, result: 'success' | 'failure'): void {
    const breaker = this.circuitBreakers.get(source) || {
      failures: 0,
      lastFailure: 0,
      state: 'closed' as const
    };
    
    if (result === 'success') {
      breaker.failures = 0;
      breaker.state = 'closed';
    } else {
      breaker.failures++;
      breaker.lastFailure = Date.now();
      
      if (breaker.failures >= 5) {
        breaker.state = 'open';
      }
    }
    
    this.circuitBreakers.set(source, breaker);
  }

  private isCircuitOpen(source: string): boolean {
    const breaker = this.circuitBreakers.get(source);
    if (!breaker || breaker.state !== 'open') return false;
    
    // Auto-recover after 30 seconds
    if (Date.now() - breaker.lastFailure > 30000) {
      breaker.state = 'half-open';
      this.circuitBreakers.set(source, breaker);
      return false;
    }
    
    return true;
  }

  private isNonRetryableError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('authentication') || 
           errorMessage.includes('unauthorized') ||
           errorMessage.includes('forbidden');
  }

  /**
   * 📊 Get Performance Statistics
   */
  getPerformanceStats() {
    return {
      connectionPool: globalConnectionPool.getStats(),
      cache: this.smartCache.getStats(),
      circuitBreakers: Object.fromEntries(
        Array.from(this.circuitBreakers.entries()).map(([source, breaker]) => [
          source,
          {
            state: breaker.state,
            failures: breaker.failures,
            lastFailure: breaker.lastFailure
          }
        ])
      )
    };
  }
}

// Export singleton instance
export const parallelOrchestrator = new ParallelOrchestrator();
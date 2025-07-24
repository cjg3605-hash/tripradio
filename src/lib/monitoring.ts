// 성능 모니터링 라이브러리
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    lastCall: number;
    minTime: number;
    maxTime: number;
    avgTime: number;
  }> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const metric = this.metrics.get(operationName) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      lastCall: 0,
      minTime: Infinity,
      maxTime: 0,
      avgTime: 0
    };

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      metric.count++;
      metric.totalTime += duration;
      metric.lastCall = Date.now();
      metric.minTime = Math.min(metric.minTime, duration);
      metric.maxTime = Math.max(metric.maxTime, duration);
      metric.avgTime = Math.round(metric.totalTime / metric.count);
      
      this.metrics.set(operationName, metric);
      
      // 느린 작업 경고
      if (duration > 10000) {
        console.warn(`⚠️ 느린 작업 감지: ${operationName} (${duration}ms)`);
      }
      
      // 성능 임계값 체크
      this.checkPerformanceThresholds(operationName, duration);
      
      return result;
    } catch (error) {
      metric.errors++;
      this.metrics.set(operationName, metric);
      
      console.error(`❌ 작업 실패: ${operationName}`, error);
      throw error;
    }
  }

  private checkPerformanceThresholds(operationName: string, duration: number) {
    const thresholds = {
      'ai-guide-generation': 30000, // 30초
      'tts-generation': 20000,      // 20초
      'search-locations': 5000,     // 5초
      'db-query': 1000,            // 1초
    };

    const threshold = thresholds[operationName];
    if (threshold && duration > threshold) {
      console.warn(`⏰ 성능 임계값 초과: ${operationName} (${duration}ms > ${threshold}ms)`);
    }
  }

  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    const now = Date.now();
    
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = {
        avgResponseTime: metric.avgTime,
        minResponseTime: metric.minTime === Infinity ? 0 : metric.minTime,
        maxResponseTime: metric.maxTime,
        totalCalls: metric.count,
        errorRate: metric.count > 0 ? Math.round((metric.errors / metric.count) * 100) : 0,
        totalErrors: metric.errors,
        successRate: metric.count > 0 ? Math.round(((metric.count - metric.errors) / metric.count) * 100) : 0,
        lastCall: metric.lastCall > 0 ? new Date(metric.lastCall).toISOString() : null,
        minutesSinceLastCall: metric.lastCall > 0 ? Math.round((now - metric.lastCall) / 60000) : null
      };
    }
    
    return result;
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'critical';
    issues: string[];
    summary: any;
  } {
    const metrics = this.getMetrics();
    const issues: string[] = [];
    let worstStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';

    for (const [name, metric] of Object.entries(metrics)) {
      // 에러율 체크
      if (metric.errorRate > 50) {
        issues.push(`${name}: 높은 에러율 (${metric.errorRate}%)`);
        worstStatus = 'critical';
      } else if (metric.errorRate > 20) {
        issues.push(`${name}: 경고 에러율 (${metric.errorRate}%)`);
        if (worstStatus === 'healthy') worstStatus = 'degraded';
      }

      // 응답시간 체크
      if (metric.avgResponseTime > 30000) {
        issues.push(`${name}: 느린 응답시간 (${metric.avgResponseTime}ms)`);
        worstStatus = 'critical';
      } else if (metric.avgResponseTime > 15000) {
        issues.push(`${name}: 경고 응답시간 (${metric.avgResponseTime}ms)`);
        if (worstStatus === 'healthy') worstStatus = 'degraded';
      }
    }

    return {
      status: worstStatus,
      issues,
      summary: {
        totalOperations: Object.keys(metrics).length,
        healthyOperations: Object.values(metrics).filter(m => m.errorRate < 20).length,
        totalCalls: Object.values(metrics).reduce((sum, m) => sum + m.totalCalls, 0),
        totalErrors: Object.values(metrics).reduce((sum, m) => sum + m.totalErrors, 0),
        overallErrorRate: this.calculateOverallErrorRate(metrics)
      }
    };
  }

  private calculateOverallErrorRate(metrics: Record<string, any>): number {
    const totalCalls = Object.values(metrics).reduce((sum, m) => sum + m.totalCalls, 0);
    const totalErrors = Object.values(metrics).reduce((sum, m) => sum + m.totalErrors, 0);
    return totalCalls > 0 ? Math.round((totalErrors / totalCalls) * 100) : 0;
  }

  // 메트릭 초기화 (개발용)
  clearMetrics(): void {
    this.metrics.clear();
    console.log('📊 모든 메트릭이 초기화되었습니다.');
  }

  // 특정 메트릭 제거
  removeMetric(operationName: string): boolean {
    return this.metrics.delete(operationName);
  }
}

export const monitor = PerformanceMonitor.getInstance();

// 편의 함수들
export const trackAIGeneration = <T>(operation: () => Promise<T>) => 
  monitor.trackOperation('ai-guide-generation', operation);

export const trackTTSGeneration = <T>(operation: () => Promise<T>) => 
  monitor.trackOperation('tts-generation', operation);

export const trackSearch = <T>(operation: () => Promise<T>) => 
  monitor.trackOperation('search-locations', operation);

export const trackDBQuery = <T>(operation: () => Promise<T>) => 
  monitor.trackOperation('db-query', operation);
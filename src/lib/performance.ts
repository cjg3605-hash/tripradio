// Performance monitoring and optimization utilities
// Provides tools for measuring and improving application performance

import { createComponentLogger } from '@/lib/logger';

const logger = createComponentLogger('performance');

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ComponentPerformanceReport {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private renderTimes: Map<string, number[]> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                    process.env.ENABLE_PERFORMANCE_TRACKING === 'true';
  }

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  startTiming(name: string): () => void {
    if (!this.isEnabled) return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.addMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        metadata: { startTime, endTime }
      });
    };
  }

  markComponentRender(componentName: string): void {
    if (!this.isEnabled) return;
    
    const renderTime = performance.now();
    const existing = this.renderTimes.get(componentName) || [];
    existing.push(renderTime);
    
    // Keep only last 100 renders to prevent memory leaks
    if (existing.length > 100) {
      existing.shift();
    }
    
    this.renderTimes.set(componentName, existing);
  }

  getComponentReport(componentName: string): ComponentPerformanceReport | null {
    if (!this.isEnabled) return null;
    
    const renderTimes = this.renderTimes.get(componentName);
    if (!renderTimes || renderTimes.length === 0) {
      return null;
    }

    const renderCount = renderTimes.length;
    const lastRenderTime = renderTimes[renderTimes.length - 1];
    const totalTime = renderTimes.reduce((sum, time, index, arr) => {
      if (index === 0) return 0;
      return sum + (time - arr[index - 1]);
    }, 0);
    
    const averageRenderTime = renderCount > 1 ? totalTime / (renderCount - 1) : 0;
    
    return {
      componentName,
      renderTime: lastRenderTime,
      renderCount,
      lastRenderTime,
      averageRenderTime,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private addMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;
    
    const existing = this.metrics.get(metric.name) || [];
    existing.push(metric);
    
    // Keep only last 1000 metrics per name
    if (existing.length > 1000) {
      existing.shift();
    }
    
    this.metrics.set(metric.name, existing);
    
    // Log slow operations
    if (metric.unit === 'ms' && metric.value > 16) { // > 16ms (60fps threshold)
      logger.warn(`Slow operation detected: ${metric.name}`, {
        duration: metric.value,
        threshold: 16
      });
    }
  }

  private getMemoryUsage(): number | undefined {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize;
    }
    return undefined;
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (!this.isEnabled) return [];
    
    if (name) {
      return this.metrics.get(name) || [];
    }
    
    return Array.from(this.metrics.values()).flat();
  }

  getAverageMetric(name: string): number | null {
    if (!this.isEnabled) return null;
    
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;
    
    const sum = metrics.reduce((total, metric) => total + metric.value, 0);
    return sum / metrics.length;
  }

  clearMetrics(name?: string): void {
    if (!this.isEnabled) return;
    
    if (name) {
      this.metrics.delete(name);
      this.renderTimes.delete(name);
    } else {
      this.metrics.clear();
      this.renderTimes.clear();
    }
  }

  generateReport(): {
    totalMetrics: number;
    slowOperations: PerformanceMetric[];
    componentReports: ComponentPerformanceReport[];
    memoryUsage?: number;
  } {
    if (!this.isEnabled) {
      return {
        totalMetrics: 0,
        slowOperations: [],
        componentReports: []
      };
    }

    const allMetrics = this.getMetrics();
    const slowOperations = allMetrics.filter(m => 
      m.unit === 'ms' && m.value > 16
    );

    const componentReports = Array.from(this.renderTimes.keys())
      .map(name => this.getComponentReport(name))
      .filter((report): report is ComponentPerformanceReport => report !== null);

    return {
      totalMetrics: allMetrics.length,
      slowOperations,
      componentReports,
      memoryUsage: this.getMemoryUsage()
    };
  }
}

export const performanceTracker = PerformanceTracker.getInstance();

// React hooks for performance monitoring
export function usePerformanceTracking(componentName: string) {
  const tracker = PerformanceTracker.getInstance();
  
  return {
    markRender: () => tracker.markComponentRender(componentName),
    startTiming: (operationName: string) => tracker.startTiming(`${componentName}.${operationName}`),
    getReport: () => tracker.getComponentReport(componentName)
  };
}

// Decorator for measuring function performance
export function measurePerformance(name: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;
    
    if (!originalMethod) return descriptor;
    
    descriptor.value = function (this: any, ...args: any[]) {
      const endTiming = performanceTracker.startTiming(`${name}.${propertyKey}`);
      
      try {
        const result = originalMethod.apply(this, args);
        
        if (result instanceof Promise) {
          return result.finally(() => endTiming());
        }
        
        endTiming();
        return result;
      } catch (error) {
        endTiming();
        throw error;
      }
    } as T;
    
    return descriptor;
  };
}

// Bundle size analysis utilities
export function analyzeBundle() {
  if (typeof window === 'undefined') return null;
  
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  const analysis = {
    scripts: scripts.length,
    stylesheets: stylesheets.length,
    estimatedJSSize: scripts.length * 50, // Rough estimate in KB
    estimatedCSSSize: stylesheets.length * 10, // Rough estimate in KB
    thirdPartyScripts: scripts.filter(script => {
      const element = script as HTMLScriptElement;
      return element.src && !element.src.includes(window.location.hostname);
    }).length
  };
  
  logger.info('Bundle analysis completed', analysis);
  return analysis;
}

// Web Vitals monitoring (if available)
export function measureWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Measure Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;
    
    performanceTracker.startTiming('web-vitals.lcp')();
    logger.info('LCP measured', { 
      value: lastEntry.startTime,
      target: lastEntry.element?.tagName 
    });
  });
  
  try {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // LCP not supported
  }
  
  // Measure First Input Delay (FID) 
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      performanceTracker.startTiming('web-vitals.fid')();
      logger.info('FID measured', { value: entry.processingStart - entry.startTime });
    });
  });
  
  try {
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    // FID not supported
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Start measuring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      measureWebVitals();
      analyzeBundle();
    });
  } else {
    measureWebVitals();
    analyzeBundle();
  }
}
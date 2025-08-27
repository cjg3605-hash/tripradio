// 🚀 성능 모니터링 시스템
// Core Web Vitals 및 사용자 경험 지표 추적

interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay  
  CLS?: number; // Cumulative Layout Shift
  
  // Other Web Vitals
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  
  // Custom Metrics
  routeChangeTime?: number;
  componentMountTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
}

interface PerformanceBudget {
  LCP: number; // < 2.5s
  FID: number; // < 100ms
  CLS: number; // < 0.1
  FCP: number; // < 1.8s
  TTFB: number; // < 600ms
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private budget: PerformanceBudget = {
    LCP: 2500, // Target: <2.5s for mobile optimization
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 600
  };
  
  // LCP-specific monitoring
  private lcpObserver: PerformanceObserver | null = null;
  private isLCPOptimized = false;
  
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;
    
    try {
      this.observeWebVitals();
      this.observeNavigation();
      this.observeMemory();
      this.isInitialized = true;
      
      console.log('🚀 Performance Monitor initialized');
    } catch (error) {
      console.warn('⚠️ Performance Monitor initialization failed:', error);
    }
  }

  private observeWebVitals() {
    // Enhanced LCP (Largest Contentful Paint) monitoring
    this.createObserver('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1] as PerformanceEntry;
      this.metrics.LCP = lcpEntry.startTime;
      this.checkBudget('LCP', lcpEntry.startTime);
      
      // LCP-specific optimization feedback
      if (lcpEntry.startTime < 1200) {
        console.log('🚀 Excellent LCP performance:', Math.round(lcpEntry.startTime), 'ms');
        this.isLCPOptimized = true;
      } else if (lcpEntry.startTime < 2500) {
        console.log('✅ Good LCP performance:', Math.round(lcpEntry.startTime), 'ms');
        this.isLCPOptimized = true;
      } else {
        console.warn('⚠️ LCP needs improvement:', Math.round(lcpEntry.startTime), 'ms - Target: <2500ms');
        this.suggestLCPOptimizations(lcpEntry.startTime);
      }
    });

    // FID (First Input Delay) 
    this.createObserver('first-input', (entries) => {
      const fidEntry = entries[0] as any;
      if (fidEntry.processingStart && fidEntry.startTime) {
        this.metrics.FID = fidEntry.processingStart - fidEntry.startTime;
        this.checkBudget('FID', this.metrics.FID);
      }
    });

    // CLS (Cumulative Layout Shift)
    this.createObserver('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.CLS = clsValue;
      this.checkBudget('CLS', clsValue);
    });

    // FCP (First Contentful Paint)
    this.createObserver('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.FCP = fcpEntry.startTime;
        this.checkBudget('FCP', fcpEntry.startTime);
      }
    });
  }

  private observeNavigation() {
    this.createObserver('navigation', (entries) => {
      const navEntry = entries[0] as PerformanceNavigationTiming;
      this.metrics.TTFB = navEntry.responseStart - navEntry.fetchStart;
      this.checkBudget('TTFB', this.metrics.TTFB);
    });
  }

  private observeMemory() {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryUsage = memInfo.usedJSHeapSize;
      
      // 메모리 사용량이 50MB 초과시 경고
      if (memInfo.usedJSHeapSize > 50 * 1024 * 1024) {
        console.warn('⚠️ High memory usage detected:', this.formatBytes(memInfo.usedJSHeapSize));
      }
    }
  }

  private createObserver(type: string, callback: (entries: PerformanceEntry[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`⚠️ Failed to observe ${type}:`, error);
    }
  }

  private checkBudget(metric: keyof PerformanceBudget, value: number) {
    const budget = this.budget[metric];
    if (value > budget) {
      console.warn(`⚠️ Performance budget exceeded for ${metric}:`, {
        actual: metric === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`,
        budget: metric === 'CLS' ? budget.toFixed(3) : `${budget}ms`,
        excess: metric === 'CLS' ? (value - budget).toFixed(3) : `${Math.round(value - budget)}ms`
      });
    } else {
      console.log(`✅ ${metric} within budget:`, {
        actual: metric === 'CLS' ? value.toFixed(3) : `${Math.round(value)}ms`,
        budget: metric === 'CLS' ? budget.toFixed(3) : `${budget}ms`
      });
    }
  }

  // 라우트 변경 시간 측정
  measureRouteChange(from: string, to: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.metrics.routeChangeTime = duration;
      
      console.log(`🚀 Route change (${from} → ${to}): ${Math.round(duration)}ms`);
      
      if (duration > 1000) {
        console.warn('⚠️ Slow route change detected:', {
          from,
          to,
          duration: `${Math.round(duration)}ms`
        });
      }
    };
  }

  // 컴포넌트 마운트 시간 측정
  measureComponentMount(componentName: string) {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.metrics.componentMountTime = duration;
      
      console.log(`🧩 ${componentName} mount: ${Math.round(duration)}ms`);
      
      if (duration > 100) {
        console.warn(`⚠️ Slow component mount: ${componentName} took ${Math.round(duration)}ms`);
      }
    };
  }

  // 번들 크기 분석
  analyzeBundleSize() {
    if (typeof window !== 'undefined' && 'navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const bundleSize = navEntry.transferSize;
      this.metrics.bundleSize = bundleSize;
      
      console.log(`📦 Bundle size: ${this.formatBytes(bundleSize)}`);
      
      // 1MB 초과시 경고
      if (bundleSize > 1024 * 1024) {
        console.warn('⚠️ Large bundle size detected:', this.formatBytes(bundleSize));
      }
    }
  }

  // 현재 성능 지표 반환
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 성능 등급 계산 (0-100)
  calculatePerformanceScore(): number {
    let score = 100;
    
    // LCP 점수 (25점)
    if (this.metrics.LCP) {
      if (this.metrics.LCP > 4000) score -= 25;
      else if (this.metrics.LCP > 2500) score -= 15;
      else if (this.metrics.LCP > 1200) score -= 5;
    }
    
    // FID 점수 (25점)
    if (this.metrics.FID) {
      if (this.metrics.FID > 300) score -= 25;
      else if (this.metrics.FID > 100) score -= 15;
      else if (this.metrics.FID > 50) score -= 5;
    }
    
    // CLS 점수 (25점)  
    if (this.metrics.CLS) {
      if (this.metrics.CLS > 0.25) score -= 25;
      else if (this.metrics.CLS > 0.1) score -= 15;
      else if (this.metrics.CLS > 0.05) score -= 5;
    }
    
    // FCP 점수 (25점)
    if (this.metrics.FCP) {
      if (this.metrics.FCP > 3000) score -= 25;
      else if (this.metrics.FCP > 1800) score -= 15;
      else if (this.metrics.FCP > 900) score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // 성능 리포트 생성
  generateReport(): string {
    const score = this.calculatePerformanceScore();
    const grade = score >= 90 ? '🟢 Excellent' : 
                  score >= 70 ? '🟡 Good' : 
                  score >= 50 ? '🟠 Fair' : '🔴 Poor';
    
    let report = `\n🚀 Performance Report\n`;
    report += `Overall Score: ${score}/100 ${grade}\n\n`;
    
    // Core Web Vitals
    report += `📊 Core Web Vitals:\n`;
    if (this.metrics.LCP) report += `  LCP: ${Math.round(this.metrics.LCP)}ms ${this.getBudgetStatus('LCP')}\n`;
    if (this.metrics.FID) report += `  FID: ${Math.round(this.metrics.FID)}ms ${this.getBudgetStatus('FID')}\n`;
    if (this.metrics.CLS) report += `  CLS: ${this.metrics.CLS.toFixed(3)} ${this.getBudgetStatus('CLS')}\n`;
    
    // Other Vitals
    report += `\n📈 Other Vitals:\n`;
    if (this.metrics.FCP) report += `  FCP: ${Math.round(this.metrics.FCP)}ms ${this.getBudgetStatus('FCP')}\n`;
    if (this.metrics.TTFB) report += `  TTFB: ${Math.round(this.metrics.TTFB)}ms ${this.getBudgetStatus('TTFB')}\n`;
    
    // Custom Metrics
    if (this.metrics.routeChangeTime || this.metrics.componentMountTime || this.metrics.bundleSize || this.metrics.memoryUsage) {
      report += `\n🔧 Custom Metrics:\n`;
      if (this.metrics.routeChangeTime) report += `  Route Change: ${Math.round(this.metrics.routeChangeTime)}ms\n`;
      if (this.metrics.componentMountTime) report += `  Component Mount: ${Math.round(this.metrics.componentMountTime)}ms\n`;
      if (this.metrics.bundleSize) report += `  Bundle Size: ${this.formatBytes(this.metrics.bundleSize)}\n`;
      if (this.metrics.memoryUsage) report += `  Memory Usage: ${this.formatBytes(this.metrics.memoryUsage)}\n`;
    }
    
    return report;
  }

  private getBudgetStatus(metric: keyof PerformanceBudget): string {
    const value = this.metrics[metric];
    const budget = this.budget[metric];
    
    if (!value) return '';
    
    if (value <= budget) return '✅';
    else if (value <= budget * 1.5) return '⚠️';
    else return '❌';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // LCP 최적화 제안 시스템
  private suggestLCPOptimizations(lcpValue: number) {
    console.group('🎯 LCP 최적화 제안');
    
    if (lcpValue > 4000) {
      console.warn('🔥 Critical LCP issue detected:', Math.round(lcpValue), 'ms');
      console.log('💡 Suggestions:');
      console.log('  • Check for render-blocking resources');
      console.log('  • Optimize largest image/element');
      console.log('  • Consider server-side rendering');
    } else if (lcpValue > 2500) {
      console.warn('⚠️ LCP above mobile target:', Math.round(lcpValue), 'ms');
      console.log('💡 Suggestions:');
      console.log('  • Preload critical fonts and images');
      console.log('  • Optimize CSS delivery');
      console.log('  • Review resource hints');
    }
    
    console.groupEnd();
  }

  // LCP 상태 확인
  isLCPWithinBudget(): boolean {
    return this.isLCPOptimized && (this.metrics.LCP || 0) < this.budget.LCP;
  }

  // 정리
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    if (this.lcpObserver) {
      this.lcpObserver.disconnect();
    }
    this.observers = [];
    this.isInitialized = false;
    console.log('🚀 Performance Monitor destroyed');
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor();

// React Hook for Performance Monitoring
export function usePerformanceMonitor() {
  return {
    measureRouteChange: performanceMonitor.measureRouteChange.bind(performanceMonitor),
    measureComponentMount: performanceMonitor.measureComponentMount.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    calculateScore: performanceMonitor.calculatePerformanceScore.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  };
}

// 개발자 도구에서 사용할 수 있는 전역 함수
if (typeof window !== 'undefined') {
  (window as any).performanceReport = () => {
    console.log(performanceMonitor.generateReport());
  };
}
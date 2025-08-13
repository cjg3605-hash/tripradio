'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePerformanceMonitor } from '@/lib/performance/performance-monitor';
import { measureWebVitals, generateWebVitalsReport } from '@/lib/performance/web-vitals-reporter';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export default function PerformanceProvider({ children }: PerformanceProviderProps) {
  const router = useRouter();
  const { measureRouteChange, measureComponentMount } = usePerformanceMonitor();

  useEffect(() => {
    // 컴포넌트 마운트 시간 측정
    const endMount = measureComponentMount('PerformanceProvider');

    // Web Vitals 측정 시작
    measureWebVitals();

    // 개발 환경에서 성능 리포트 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(generateWebVitalsReport());
      
      // 5초 후 성능 상태 체크
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).performanceReport) {
          (window as any).performanceReport();
        }
      }, 5000);
    }

    // Next.js 13+ App Router에서의 navigation 추적
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('🚀 Page navigation completed:', {
              loadTime: Math.round(entry.duration),
              domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd),
              domInteractive: Math.round(navEntry.domInteractive),
              firstContentfulPaint: Math.round(navEntry.loadEventEnd)
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['navigation'] });
        
        endMount(); // 마운트 완료
        
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        console.warn('⚠️ Performance observer initialization failed:', error);
        endMount(); // 에러 시에도 마운트 완료 처리
      }
    } else {
      endMount(); // Observer가 지원되지 않는 경우에도 마운트 완료 처리
      return () => {}; // 빈 cleanup 함수 반환
    }
  }, [measureRouteChange, measureComponentMount]);

  return <>{children}</>;
}
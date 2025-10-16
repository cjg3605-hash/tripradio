// 🚀 Web Vitals 리포터 - 성능 지표 수집 및 전송
// Google Analytics, 콘솔, 그리고 성능 모니터링과 통합

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

// 성능 등급 계산
function getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    'LCP': [2500, 4000],     // Largest Contentful Paint (ms)
    'FID': [100, 300],       // First Input Delay (ms)  
    'CLS': [0.1, 0.25],      // Cumulative Layout Shift
    'FCP': [1800, 3000],     // First Contentful Paint (ms)
    'TTFB': [800, 1800]      // Time to First Byte (ms)
  };

  const [goodThreshold, poorThreshold] = thresholds[name] || [0, 0];
  
  if (value <= goodThreshold) return 'good';
  if (value <= poorThreshold) return 'needs-improvement';
  return 'poor';
}

// Google Analytics로 전송
function sendToGA(metric: WebVitalsMetric) {
  if (typeof window === 'undefined' || typeof (window as any).gtag !== 'function') {
    return;
  }

  (window as any).gtag('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    custom_map: {
      metric_rating: metric.rating
    },
    non_interaction: true,
  });
}

// 콘솔에 성능 지표 출력
function logMetric(metric: WebVitalsMetric) {
  const emoji = {
    'good': '🟢',
    'needs-improvement': '🟡', 
    'poor': '🔴'
  }[metric.rating || 'good'];

  const unit = metric.name === 'CLS' ? '' : 'ms';
  const displayValue = metric.name === 'CLS' ? 
    metric.value.toFixed(3) : 
    Math.round(metric.value);

  console.log(
    `${emoji} ${metric.name}: ${displayValue}${unit} (${metric.rating})`,
    { id: metric.id, delta: metric.delta }
  );
}

// 메트릭 처리 메인 함수
export function reportWebVitals(metric: WebVitalsMetric) {
  // 등급 계산
  metric.rating = getWebVitalRating(metric.name, metric.value);
  
  // 콘솔 출력
  logMetric(metric);
  
  // Google Analytics 전송
  sendToGA(metric);
  
  // 성능 모니터에 전송 (존재하는 경우)
  if (typeof window !== 'undefined' && (window as any).performanceMonitor) {
    const monitor = (window as any).performanceMonitor;
    if (typeof monitor.recordWebVital === 'function') {
      monitor.recordWebVital(metric);
    }
  }
}

// Core Web Vitals 측정 함수들
export async function measureWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // web-vitals 라이브러리가 설치되어 있다면 사용
    // 없다면 Performance Observer로 직접 측정
    
    // LCP (Largest Contentful Paint)
    measureLCP();
    
    // FID (First Input Delay)
    measureFID();
    
    // CLS (Cumulative Layout Shift)
    measureCLS();
    
    // FCP (First Contentful Paint)
    measureFCP();
    
    // TTFB (Time to First Byte)
    measureTTFB();
    
  } catch (error) {
    console.warn('⚠️ Web Vitals measurement failed:', error);
  }
}

// 개별 메트릭 측정 함수들
function measureLCP() {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    reportWebVitals({
      name: 'LCP',
      value: lastEntry.startTime,
      id: generateId()
    });
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Fallback for older browsers
    console.warn('LCP measurement not supported');
  }
}

function measureFID() {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      const fid = entry.processingStart - entry.startTime;
      
      reportWebVitals({
        name: 'FID',
        value: fid,
        id: generateId()
      });
    });
  });

  try {
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID measurement not supported');
  }
}

function measureCLS() {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });

    reportWebVitals({
      name: 'CLS',
      value: clsValue,
      id: generateId()
    });
  });

  try {
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS measurement not supported');
  }
}

function measureFCP() {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      reportWebVitals({
        name: 'FCP',
        value: fcpEntry.startTime,
        id: generateId()
      });
    }
  });

  try {
    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('FCP measurement not supported');
  }
}

function measureTTFB() {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      const ttfb = entry.responseStart - entry.fetchStart;
      
      reportWebVitals({
        name: 'TTFB',
        value: ttfb,
        id: generateId()
      });
    });
  });

  try {
    observer.observe({ type: 'navigation', buffered: true });
  } catch (e) {
    console.warn('TTFB measurement not supported');
  }
}

// 고유 ID 생성
function generateId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// 브라우저 호환성 체크
export function isWebVitalsSupported(): boolean {
  return typeof window !== 'undefined' && 'PerformanceObserver' in window;
}

// 성능 요약 리포트 생성
export function generateWebVitalsReport(): string {
  if (!isWebVitalsSupported()) {
    return '❌ Web Vitals measurement not supported in this browser';
  }

  return `
🚀 Web Vitals 측정이 활성화되었습니다.

📊 측정 중인 지표:
• LCP (Largest Contentful Paint) - 최대 콘텐츠풀 페인트
• FID (First Input Delay) - 최초 입력 지연
• CLS (Cumulative Layout Shift) - 누적 레이아웃 이동  
• FCP (First Contentful Paint) - 최초 콘텐츠풀 페인트
• TTFB (Time to First Byte) - 최초 바이트까지의 시간

🎯 성능 등급:
• 🟢 Good: 우수한 성능
• 🟡 Needs Improvement: 개선 필요
• 🔴 Poor: 성능 문제

콘솔에서 실시간 측정 결과를 확인하세요!
  `.trim();
}

// 글로벌 함수로 등록 (개발자 도구용)
if (typeof window !== 'undefined') {
  (window as any).measureWebVitals = measureWebVitals;
  (window as any).webVitalsReport = generateWebVitalsReport;
}
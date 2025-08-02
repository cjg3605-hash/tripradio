'use client';

/**
 * 클라이언트 사이드 사용자 행동 추적기
 * 실제 사용자와 봇을 구분하는 행동 패턴을 수집합니다.
 */

export interface BehaviorData {
  mouseMovements: number;
  keystrokes: number;
  scrollEvents: number;
  clickEvents: number;
  focusEvents: number;
  pageLoadTime: number;
  sessionDuration: number;
  pageSequence: string[];
  viewportSize: { width: number; height: number };
  deviceInfo: {
    userAgent: string;
    language: string;
    platform: string;
    cookieEnabled: boolean;
    onlineStatus: boolean;
  };
  timingMetrics: {
    mouseMovementTiming: number[];
    keystrokeTiming: number[];
    scrollTiming: number[];
  };
  fingerprint: string;
}

export class BehaviorTracker {
  private behaviorData: BehaviorData;
  private startTime: number;
  private lastMouseEvent: number = 0;
  private lastKeyEvent: number = 0;
  private lastScrollEvent: number = 0;
  private isTracking: boolean = false;

  constructor() {
    this.startTime = Date.now();
    this.behaviorData = this.initializeBehaviorData();
    
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.generateFingerprint();
    }
  }

  /**
   * 행동 데이터 초기화
   */
  private initializeBehaviorData(): BehaviorData {
    return {
      mouseMovements: 0,
      keystrokes: 0,
      scrollEvents: 0,
      clickEvents: 0,
      focusEvents: 0,
      pageLoadTime: Date.now(),
      sessionDuration: 0,
      pageSequence: [typeof window !== 'undefined' ? window.location.pathname : '/'],
      viewportSize: { 
        width: typeof window !== 'undefined' ? window.innerWidth : 0, 
        height: typeof window !== 'undefined' ? window.innerHeight : 0 
      },
      deviceInfo: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        platform: typeof navigator !== 'undefined' ? navigator.platform : '',
        cookieEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : false,
        onlineStatus: typeof navigator !== 'undefined' ? navigator.onLine : false
      },
      timingMetrics: {
        mouseMovementTiming: [],
        keystrokeTiming: [],
        scrollTiming: []
      },
      fingerprint: ''
    };
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    // 마우스 움직임 추적
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
    
    // 키보드 입력 추적
    document.addEventListener('keydown', this.handleKeyDown.bind(this), { passive: true });
    
    // 스크롤 이벤트 추적
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // 클릭 이벤트 추적
    document.addEventListener('click', this.handleClick.bind(this), { passive: true });
    
    // 포커스 이벤트 추적
    window.addEventListener('focus', this.handleFocus.bind(this), { passive: true });
    window.addEventListener('blur', this.handleBlur.bind(this), { passive: true });

    // 페이지 변경 추적 (SPA)
    this.trackPageChanges();

    // 뷰포트 크기 변경 추적
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });

    // 페이지 언로드 시 데이터 전송
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    this.isTracking = true;
  }

  /**
   * 마우스 움직임 처리
   */
  private handleMouseMove(event: MouseEvent): void {
    const now = Date.now();
    
    // 마우스 움직임이 너무 빠르거나 비정상적인 패턴인지 확인
    if (this.lastMouseEvent > 0) {
      const timeDiff = now - this.lastMouseEvent;
      this.behaviorData.timingMetrics.mouseMovementTiming.push(timeDiff);
      
      // 최근 10개의 타이밍만 보관 (메모리 효율)
      if (this.behaviorData.timingMetrics.mouseMovementTiming.length > 10) {
        this.behaviorData.timingMetrics.mouseMovementTiming.shift();
      }
    }
    
    this.behaviorData.mouseMovements++;
    this.lastMouseEvent = now;
  }

  /**
   * 키보드 입력 처리
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const now = Date.now();
    
    if (this.lastKeyEvent > 0) {
      const timeDiff = now - this.lastKeyEvent;
      this.behaviorData.timingMetrics.keystrokeTiming.push(timeDiff);
      
      if (this.behaviorData.timingMetrics.keystrokeTiming.length > 10) {
        this.behaviorData.timingMetrics.keystrokeTiming.shift();
      }
    }
    
    this.behaviorData.keystrokes++;
    this.lastKeyEvent = now;
  }

  /**
   * 스크롤 이벤트 처리
   */
  private handleScroll(): void {
    const now = Date.now();
    
    if (this.lastScrollEvent > 0) {
      const timeDiff = now - this.lastScrollEvent;
      this.behaviorData.timingMetrics.scrollTiming.push(timeDiff);
      
      if (this.behaviorData.timingMetrics.scrollTiming.length > 10) {
        this.behaviorData.timingMetrics.scrollTiming.shift();
      }
    }
    
    this.behaviorData.scrollEvents++;
    this.lastScrollEvent = now;
  }

  /**
   * 클릭 이벤트 처리
   */
  private handleClick(): void {
    this.behaviorData.clickEvents++;
  }

  /**
   * 포커스 이벤트 처리
   */
  private handleFocus(): void {
    this.behaviorData.focusEvents++;
  }

  /**
   * 블러 이벤트 처리
   */
  private handleBlur(): void {
    // 포커스 잃음 이벤트 (창 전환 등)
  }

  /**
   * 뷰포트 크기 변경 처리
   */
  private handleResize(): void {
    if (typeof window !== 'undefined') {
      this.behaviorData.viewportSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  }

  /**
   * 페이지 변경 추적 (SPA)
   */
  private trackPageChanges(): void {
    if (typeof window === 'undefined') return;

    let lastUrl = window.location.href;
    
    // History API 변경 감지
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('urlchange'));
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event('urlchange'));
    };
    
    window.addEventListener('popstate', () => {
      window.dispatchEvent(new Event('urlchange'));
    });
    
    window.addEventListener('urlchange', () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        this.behaviorData.pageSequence.push(window.location.pathname);
        
        // 최근 20개의 페이지만 보관
        if (this.behaviorData.pageSequence.length > 20) {
          this.behaviorData.pageSequence.shift();
        }
        
        lastUrl = currentUrl;
      }
    });
  }

  /**
   * 페이지 언로드 처리
   */
  private handleBeforeUnload(): void {
    this.updateSessionDuration();
    // 마지막 행동 데이터를 서버로 전송 (선택적)
    this.sendBehaviorData();
  }

  /**
   * 브라우저 핑거프린트 생성
   */
  private async generateFingerprint(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const components = [
        navigator.userAgent,
        navigator.language,
        navigator.platform,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.cookieEnabled,
        typeof navigator.doNotTrack !== 'undefined' ? navigator.doNotTrack : 'unknown'
      ];

      // Canvas 핑거프린트 (선택적)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('BotDetection', 2, 2);
        components.push(canvas.toDataURL());
      }

      // WebGL 핑거프린트 (선택적)
      const gl = canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          components.push(
            gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          );
        }
      }

      // 간단한 해시 생성
      this.behaviorData.fingerprint = await this.simpleHash(components.join('|'));
    } catch (error) {
      console.warn('핑거프린트 생성 실패:', error);
      this.behaviorData.fingerprint = 'unavailable';
    }
  }

  /**
   * 간단한 해시 함수
   */
  private async simpleHash(str: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    } else {
      // Fallback: 간단한 문자열 해시
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }
  }

  /**
   * 세션 지속 시간 업데이트
   */
  private updateSessionDuration(): void {
    this.behaviorData.sessionDuration = Date.now() - this.startTime;
  }

  /**
   * 현재 행동 데이터 반환
   */
  getBehaviorData(): BehaviorData {
    this.updateSessionDuration();
    return { ...this.behaviorData };
  }

  /**
   * 행동 패턴 이상 여부 검사
   */
  analyzePattern(): {
    isNormal: boolean;
    suspiciousFactors: string[];
    humanLikelihood: number; // 0-1 (1이 100% 인간)
  } {
    const suspiciousFactors: string[] = [];
    let humanScore = 1.0;

    // 마우스 움직임 체크
    if (this.behaviorData.mouseMovements === 0 && this.behaviorData.sessionDuration > 5000) {
      suspiciousFactors.push('마우스 움직임 없음');
      humanScore -= 0.3;
    }

    // 키보드 입력 체크
    if (this.behaviorData.keystrokes === 0 && this.behaviorData.sessionDuration > 10000) {
      suspiciousFactors.push('키보드 입력 없음');
      humanScore -= 0.2;
    }

    // 마우스 움직임 패턴 분석
    if (this.behaviorData.timingMetrics.mouseMovementTiming.length > 5) {
      const timings = this.behaviorData.timingMetrics.mouseMovementTiming;
      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      const variance = timings.reduce((sum, timing) => sum + Math.pow(timing - avgTiming, 2), 0) / timings.length;
      
      // 너무 일정한 마우스 움직임 (봇의 특징)
      if (variance < 100 && avgTiming < 50) {
        suspiciousFactors.push('비정상적으로 일정한 마우스 패턴');
        humanScore -= 0.4;
      }
    }

    // 페이지 탐색 속도 체크
    if (this.behaviorData.pageSequence.length > 3) {
      const avgTimePerPage = this.behaviorData.sessionDuration / this.behaviorData.pageSequence.length;
      if (avgTimePerPage < 1000) { // 페이지당 1초 미만
        suspiciousFactors.push('비정상적으로 빠른 페이지 탐색');
        humanScore -= 0.3;
      }
    }

    // 뷰포트 크기 체크
    const { width, height } = this.behaviorData.viewportSize;
    if (width < 100 || height < 100) {
      suspiciousFactors.push('비정상적인 뷰포트 크기');
      humanScore -= 0.2;
    }

    // 스크롤 이벤트 체크
    if (this.behaviorData.scrollEvents === 0 && this.behaviorData.sessionDuration > 15000) {
      suspiciousFactors.push('긴 세션에서 스크롤 없음');
      humanScore -= 0.2;
    }

    humanScore = Math.max(0, Math.min(1, humanScore));

    return {
      isNormal: humanScore > 0.6,
      suspiciousFactors,
      humanLikelihood: humanScore
    };
  }

  /**
   * 행동 데이터를 서버로 전송
   */
  async sendBehaviorData(): Promise<void> {
    if (!this.isTracking) return;

    try {
      const behaviorData = this.getBehaviorData();
      
      // 너무 민감한 정보는 제외하고 전송
      const safeData = {
        mouseMovements: behaviorData.mouseMovements,
        keystrokes: behaviorData.keystrokes,
        scrollEvents: behaviorData.scrollEvents,
        clickEvents: behaviorData.clickEvents,
        sessionDuration: behaviorData.sessionDuration,
        pageSequence: behaviorData.pageSequence,
        viewportSize: behaviorData.viewportSize,
        fingerprint: behaviorData.fingerprint
      };

      // Beacon API 사용 (페이지 언로드 시에도 안정적 전송)
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(safeData)], { type: 'application/json' });
        navigator.sendBeacon('/api/security/behavior-data', blob);
      } else {
        // Fallback: 일반 fetch
        fetch('/api/security/behavior-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(safeData),
          keepalive: true
        }).catch(() => {
          // 전송 실패 시 무시 (필수가 아님)
        });
      }
    } catch (error) {
      console.warn('행동 데이터 전송 실패:', error);
    }
  }

  /**
   * 추적 중단
   */
  stopTracking(): void {
    this.isTracking = false;
    // 이벤트 리스너 제거는 복잡하므로 플래그로만 제어
  }

  /**
   * 현재 인간 가능성 점수 반환
   */
  getHumanLikelihood(): number {
    return this.analyzePattern().humanLikelihood;
  }
}

// 전역 행동 추적기 인스턴스
let globalBehaviorTracker: BehaviorTracker | null = null;

/**
 * 전역 행동 추적기 가져오기/생성
 */
export function getBehaviorTracker(): BehaviorTracker {
  if (!globalBehaviorTracker && typeof window !== 'undefined') {
    globalBehaviorTracker = new BehaviorTracker();
  }
  return globalBehaviorTracker!;
}

/**
 * 행동 추적 시작 (컴포넌트에서 호출)
 */
export function startBehaviorTracking(): void {
  getBehaviorTracker();
}

/**
 * 현재 행동 데이터 가져오기
 */
export function getCurrentBehaviorData(): BehaviorData | null {
  if (globalBehaviorTracker) {
    return globalBehaviorTracker.getBehaviorData();
  }
  return null;
}
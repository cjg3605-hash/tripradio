// 🔍 사용자 행동 패턴 실시간 수집 시스템 (간소화 버전)
// Phase 1 Task 1.1: 클릭 패턴, 체류 시간, 선택 경향 실시간 수집

export interface UserBehaviorData {
  sessionId: string;
  timestamp: number;
  userAgent: string;
  clickCount: number;
  totalTime: number;
  scrollDepth: number;
  interactionTypes: string[];
}

export interface PersonalityIndicators {
  openness: number;        // 0-1, 새로운 것에 대한 호기심
  conscientiousness: number; // 0-1, 신중함과 계획성
  extraversion: number;    // 0-1, 외향성
  agreeableness: number;   // 0-1, 친화성
  neuroticism: number;     // 0-1, 신경성 (불안함)
  confidence: number;      // 0-1, 분석 신뢰도
}

/**
 * 🔍 사용자 행동 추적 클래스
 */
export class UserBehaviorTracker {
  private behaviorData: UserBehaviorData;
  private sessionStartTime: number;
  private isTracking: boolean = false;

  constructor() {
    this.sessionStartTime = Date.now();
    this.behaviorData = {
      sessionId: this.generateSessionId(),
      timestamp: this.sessionStartTime,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      clickCount: 0,
      totalTime: 0,
      scrollDepth: 0,
      interactionTypes: []
    };
  }

  /**
   * 🚀 추적 시작
   */
  public startTracking(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;
    console.log('🔍 사용자 행동 추적 시작');
    
    if (typeof window !== 'undefined') {
      // 클릭 이벤트 추적
      document.addEventListener('click', this.handleClick.bind(this));
      
      // 스크롤 이벤트 추적
      window.addEventListener('scroll', this.handleScroll.bind(this));
      
      // 페이지 이탈 시 데이터 저장
      window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
    }
  }

  /**
   * 🛑 추적 중지
   */
  public stopTracking(): void {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    console.log('🔍 사용자 행동 추적 중지');
    
    if (typeof window !== 'undefined') {
      document.removeEventListener('click', this.handleClick.bind(this));
      window.removeEventListener('scroll', this.handleScroll.bind(this));
      window.removeEventListener('beforeunload', this.handlePageUnload.bind(this));
    }
  }

  /**
   * 📊 현재 행동 데이터 반환
   */
  public getBehaviorData(): UserBehaviorData {
    this.updateTotalTime();
    return { ...this.behaviorData };
  }

  /**
   * 🎯 기본 성격 지표 추론
   */
  public inferBasicPersonality(): PersonalityIndicators {
    const data = this.getBehaviorData();
    
    // 간단한 휴리스틱 기반 성격 추론
    const avgTimePerClick = data.totalTime / Math.max(data.clickCount, 1);
    const interactionDiversity = new Set(data.interactionTypes).size;
    
    return {
      openness: Math.min(interactionDiversity / 10, 1), // 다양한 상호작용 = 개방성
      conscientiousness: Math.min(avgTimePerClick / 1000, 1), // 클릭 전 고민 시간 = 신중함
      extraversion: Math.min(data.clickCount / 50, 1), // 클릭 빈도 = 외향성
      agreeableness: 0.5, // 기본값
      neuroticism: Math.max(1 - (data.totalTime / 60000), 0), // 짧은 체류 = 불안함
      confidence: Math.min((data.clickCount + data.totalTime/1000) / 100, 1) // 데이터량 기반 신뢰도
    };
  }

  // Private methods
  private handleClick(event: Event): void {
    this.behaviorData.clickCount++;
    
    const target = event.target as HTMLElement;
    const elementType = this.getElementType(target);
    
    if (!this.behaviorData.interactionTypes.includes(elementType)) {
      this.behaviorData.interactionTypes.push(elementType);
    }
    
    console.log(`🖱️ 클릭 감지: ${elementType} (총 ${this.behaviorData.clickCount}회)`);
  }

  private handleScroll(): void {
    if (typeof window === 'undefined') return;
    
    const scrollDepth = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    
    this.behaviorData.scrollDepth = Math.max(this.behaviorData.scrollDepth, scrollDepth);
  }

  private handlePageUnload(): void {
    this.updateTotalTime();
    console.log('📊 세션 종료 - 행동 데이터:', this.behaviorData);
  }

  private updateTotalTime(): void {
    this.behaviorData.totalTime = Date.now() - this.sessionStartTime;
  }

  private getElementType(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'button') return 'button';
    if (tagName === 'a') return 'link';
    if (tagName === 'img') return 'image';
    if (element.classList.contains('chapter')) return 'chapter';
    if (element.classList.contains('guide')) return 'guide';
    
    return 'other';
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 전역 인스턴스
export const userBehaviorTracker = new UserBehaviorTracker();
// 🔍 사용자 행동 패턴 실시간 수집 시스템
// Phase 1 Task 1.1: 클릭 패턴, 체류 시간, 선택 경향 실시간 수집

interface UserBehaviorData {
  sessionId: string;
  timestamp: number;
  
  // 기본 정보
  userAgent: string;
  screenResolution: string;
  language: string;
  
  // 행동 패턴
  clickPattern: ClickData[];
  dwellTime: DwellTimeData[];
  scrollPattern: ScrollData[];
  selectionPattern: SelectionData[];
  
  // 성격 추론 지표
  responseTime: number[];
  decisionSpeed: number;
  explorationBehavior: ExplorationData;
  attentionPattern: AttentionData;
}

interface ClickData {
  timestamp: number;
  element: string;
  position: { x: number; y: number };
  elementType: 'button' | 'link' | 'text' | 'image' | 'other';
  context: string;
  responseTime: number; // 버튼 표시 후 클릭까지 시간
}

interface DwellTimeData {
  timestamp: number;
  section: string;
  duration: number;
  scrollDepth: number;
  interactionCount: number;
}

interface ScrollData {
  timestamp: number;
  scrollY: number;
  scrollSpeed: number;
  direction: 'up' | 'down';
  pauseDuration: number;
}

interface SelectionData {
  timestamp: number;
  selectedOption: string;
  availableOptions: string[];
  timeToDecision: number;
  changedMind: boolean; // 선택을 바꿨는지
}

interface ExplorationData {
  totalClicks: number;
  uniqueElements: number;
  backtrackCount: number; // 뒤로가기 횟수
  menuExploration: number; // 메뉴 탐색 빈도
}

interface AttentionData {
  focusEvents: number;
  blurEvents: number;
  averageFocusDuration: number;
  multitaskingIndicator: number; // 다른 탭으로 전환 빈도
}

/**
 * 🎯 사용자 행동 추적 시스템
 */
export class UserBehaviorTracker {
  private sessionId: string;
  private behaviorData: UserBehaviorData;
  private lastInteractionTime: number = Date.now();
  private dwellStartTime: number = Date.now();
  private currentSection: string = 'unknown';
  private responseTimeBuffer: number[] = [];
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.behaviorData = this.initializeBehaviorData();
    this.startTracking();
  }

  /**
   * 🚀 추적 시작
   */
  private startTracking(): void {
    this.setupEventListeners();
    this.startPeriodicDataSave();
    console.log('🔍 사용자 행동 패턴 추적 시작:', this.sessionId);
  }

  /**
   * 📝 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 클릭 이벤트 추적
    document.addEventListener('click', (e) => this.trackClick(e));
    
    // 스크롤 이벤트 추적
    document.addEventListener('scroll', (e) => this.trackScroll(e));
    
    // 포커스/블러 이벤트 추적
    window.addEventListener('focus', () => this.trackFocus(true));
    window.addEventListener('blur', () => this.trackFocus(false));
    
    // 페이지 이탈 전 데이터 저장
    window.addEventListener('beforeunload', () => this.saveDataToStorage());
    
    // 키보드 이벤트 추적 (응답 시간 측정)
    document.addEventListener('keydown', (e) => this.trackKeyboard(e));
    
    // 마우스 이동 추적 (주의력 패턴)
    document.addEventListener('mousemove', (e) => this.trackMouseMovement(e));
  }

  /**
   * 🖱️ 클릭 이벤트 추적
   */
  private trackClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const responseTime = Date.now() - this.lastInteractionTime;
    
    const clickData: ClickData = {
      timestamp: Date.now(),
      element: this.getElementIdentifier(target),
      position: { x: event.clientX, y: event.clientY },
      elementType: this.getElementType(target),
      context: this.getCurrentContext(),
      responseTime: responseTime
    };
    
    this.behaviorData.clickPattern.push(clickData);
    this.responseTimeBuffer.push(responseTime);
    this.lastInteractionTime = Date.now();
    
    // 성격 추론을 위한 클릭 패턴 분석
    this.updateExplorationBehavior(target);
  }

  /**
   * 📜 스크롤 이벤트 추적
   */
  private trackScroll(event: Event): void {
    const scrollData: ScrollData = {
      timestamp: Date.now(),
      scrollY: window.scrollY,
      scrollSpeed: this.calculateScrollSpeed(),
      direction: this.getScrollDirection(),
      pauseDuration: this.getScrollPauseDuration()
    };
    
    this.behaviorData.scrollPattern.push(scrollData);
  }

  /**
   * ⏱️ 체류 시간 추적
   */
  public trackSectionDwell(sectionName: string): void {
    // 이전 섹션 체류 시간 기록
    if (this.currentSection !== 'unknown') {
      const dwellData: DwellTimeData = {
        timestamp: this.dwellStartTime,
        section: this.currentSection,
        duration: Date.now() - this.dwellStartTime,
        scrollDepth: this.calculateScrollDepth(),
        interactionCount: this.getInteractionCountForSection(this.currentSection)
      };
      
      this.behaviorData.dwellTime.push(dwellData);
    }
    
    // 새 섹션 시작
    this.currentSection = sectionName;
    this.dwellStartTime = Date.now();
  }

  /**
   * 🎯 선택 패턴 추적
   */
  public trackSelection(selectedOption: string, availableOptions: string[], decisionTime: number): void {
    const selectionData: SelectionData = {
      timestamp: Date.now(),
      selectedOption,
      availableOptions,
      timeToDecision: decisionTime,
      changedMind: this.detectMindChange(selectedOption)
    };
    
    this.behaviorData.selectionPattern.push(selectionData);
  }

  /**
   * 🧠 Big5 성격 지표 계산
   */
  public calculatePersonalityIndicators(): PersonalityIndicators {
    return {
      openness: this.calculateOpenness(),
      conscientiousness: this.calculateConscientiousness(),
      extraversion: this.calculateExtraversion(),
      agreeableness: this.calculateAgreeableness(),
      neuroticism: this.calculateNeuroticism(),
      confidence: this.calculateConfidenceScore()
    };
  }

  /**
   * 📊 개방성 지표 계산
   */
  private calculateOpenness(): number {
    const exploration = this.behaviorData.explorationBehavior;
    const explorationRatio = exploration.uniqueElements / Math.max(exploration.totalClicks, 1);
    const menuExplorationScore = Math.min(exploration.menuExploration / 10, 1);
    
    // 스크롤 패턴도 고려 (호기심 있는 사람은 더 많이 탐색)
    const avgScrollSpeed = this.calculateAverageScrollSpeed();
    const scrollExplorationScore = Math.min(avgScrollSpeed / 100, 1);
    
    return (explorationRatio * 0.4 + menuExplorationScore * 0.4 + scrollExplorationScore * 0.2);
  }

  /**
   * 📋 성실성 지표 계산
   */
  private calculateConscientiousness(): number {
    const avgDwellTime = this.calculateAverageDwellTime();
    const dwellConsistency = this.calculateDwellTimeConsistency();
    const backtrackRatio = this.behaviorData.explorationBehavior.backtrackCount / 
                          Math.max(this.behaviorData.clickPattern.length, 1);
    
    // 성실한 사람은 체계적으로 읽고, 뒤로가기를 덜 함
    const dwellScore = Math.min(avgDwellTime / 30000, 1); // 30초 기준
    const consistencyScore = dwellConsistency;
    const systematicScore = 1 - backtrackRatio;
    
    return (dwellScore * 0.4 + consistencyScore * 0.3 + systematicScore * 0.3);
  }

  /**
   * 🎉 외향성 지표 계산
   */
  private calculateExtraversion(): number {
    const avgResponseTime = this.calculateAverageResponseTime();
    const interactionFrequency = this.calculateInteractionFrequency();
    const clickIntensity = this.behaviorData.clickPattern.length / this.getSessionDuration();
    
    // 외향적인 사람은 빠르게 반응하고 많이 상호작용
    const speedScore = Math.max(0, 1 - avgResponseTime / 5000); // 5초 기준
    const interactionScore = Math.min(interactionFrequency / 10, 1);
    const intensityScore = Math.min(clickIntensity / 0.1, 1); // 0.1 클릭/초 기준
    
    return (speedScore * 0.4 + interactionScore * 0.3 + intensityScore * 0.3);
  }

  /**
   * 🤝 친화성 지표 계산
   */
  private calculateAgreeableness(): number {
    // 친화적인 사람의 특징을 행동 패턴에서 추론
    const avgDwellTime = this.calculateAverageDwellTime();
    const scrollSmoothness = this.calculateScrollSmoothness();
    const mindChangeFrequency = this.calculateMindChangeFrequency();
    
    // 친화적인 사람은 천천히, 부드럽게 상호작용
    const patienceScore = Math.min(avgDwellTime / 20000, 1); // 20초 기준
    const smoothnessScore = scrollSmoothness;
    const stableDecisionScore = 1 - mindChangeFrequency;
    
    return (patienceScore * 0.4 + smoothnessScore * 0.3 + stableDecisionScore * 0.3);
  }

  /**
   * 😰 신경증 지표 계산
   */
  private calculateNeuroticism(): number {
    const focusStability = this.calculateFocusStability();
    const responseTimeVariability = this.calculateResponseTimeVariability();
    const backtrackFrequency = this.behaviorData.explorationBehavior.backtrackCount / 
                              Math.max(this.behaviorData.clickPattern.length, 1);
    
    // 신경증이 높은 사람은 불안정한 패턴을 보임
    const instabilityScore = 1 - focusStability;
    const variabilityScore = responseTimeVariability;
    const indecisionScore = backtrackFrequency * 2; // 뒤로가기는 불안의 지표
    
    return Math.min(1, (instabilityScore * 0.4 + variabilityScore * 0.3 + indecisionScore * 0.3));
  }

  /**
   * 💾 로컬 스토리지에 데이터 저장 (개인정보보호 준수)
   */
  private saveDataToStorage(): void {
    try {
      // 개인정보 제거된 익명화 데이터만 저장
      const anonymizedData = this.anonymizeData();
      localStorage.setItem(`behavior_${this.sessionId}`, JSON.stringify(anonymizedData));
      console.log('✅ 사용자 행동 데이터 저장 완료 (익명화)');
    } catch (error) {
      console.error('❌ 행동 데이터 저장 실패:', error);
    }
  }

  /**
   * 🔒 데이터 익명화
   */
  private anonymizeData() {
    return {
      sessionId: this.hashSessionId(this.sessionId),
      personalityIndicators: this.calculatePersonalityIndicators(),
      behaviorSummary: {
        totalClicks: this.behaviorData.clickPattern.length,
        totalDwellTime: this.behaviorData.dwellTime.reduce((sum, d) => sum + d.duration, 0),
        explorationScore: this.calculateExplorationScore(),
        focusScore: this.calculateFocusScore()
      },
      timestamp: Date.now()
    };
  }

  /**
   * 🔧 헬퍼 메서드들
   */
  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private initializeBehaviorData(): UserBehaviorData {
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      clickPattern: [],
      dwellTime: [],
      scrollPattern: [],
      selectionPattern: [],
      responseTime: [],
      decisionSpeed: 0,
      explorationBehavior: {
        totalClicks: 0,
        uniqueElements: 0,
        backtrackCount: 0,
        menuExploration: 0
      },
      attentionPattern: {
        focusEvents: 0,
        blurEvents: 0,
        averageFocusDuration: 0,
        multitaskingIndicator: 0
      }
    };
  }

  private getElementIdentifier(element: HTMLElement): string {
    return element.id || element.className || element.tagName;
  }

  private getElementType(element: HTMLElement): 'button' | 'link' | 'text' | 'image' | 'other' {
    if (element.tagName === 'BUTTON') return 'button';
    if (element.tagName === 'A') return 'link';
    if (element.tagName === 'IMG') return 'image';
    if (element.tagName === 'P' || element.tagName === 'SPAN') return 'text';
    return 'other';
  }

  private getCurrentContext(): string {
    return this.currentSection;
  }

  private startPeriodicDataSave(): void {
    setInterval(() => {
      this.saveDataToStorage();
    }, 30000); // 30초마다 자동 저장
  }

  /**
   * 📊 헬퍼 메서드들 구현
   */
  private trackFocus(hasFocus: boolean): void {
    if (hasFocus) {
      this.behaviorData.attentionPattern.focusEvents++;
    } else {
      this.behaviorData.attentionPattern.blurEvents++;
      this.behaviorData.attentionPattern.multitaskingIndicator++;
    }
  }

  private trackKeyboard(event: KeyboardEvent): void {
    const responseTime = Date.now() - this.lastInteractionTime;
    this.responseTimeBuffer.push(responseTime);
    this.lastInteractionTime = Date.now();
  }

  private trackMouseMovement(event: MouseEvent): void {
    // 마우스 움직임으로 주의력 패턴 분석
    const now = Date.now();
    if (now - this.lastInteractionTime > 1000) { // 1초 이상 정지
      this.behaviorData.attentionPattern.averageFocusDuration = 
        (this.behaviorData.attentionPattern.averageFocusDuration + (now - this.lastInteractionTime)) / 2;
    }
  }

  private updateExplorationBehavior(target: HTMLElement): void {
    this.behaviorData.explorationBehavior.totalClicks++;
    
    const elementId = this.getElementIdentifier(target);
    const uniqueElements = new Set(this.behaviorData.clickPattern.map(c => c.element));
    this.behaviorData.explorationBehavior.uniqueElements = uniqueElements.size;
    
    // 뒤로가기 버튼 감지
    if (target.textContent?.includes('뒤로') || target.className?.includes('back')) {
      this.behaviorData.explorationBehavior.backtrackCount++;
    }
    
    // 메뉴 탐색 감지
    if (target.tagName === 'NAV' || target.className?.includes('menu') || target.className?.includes('nav')) {
      this.behaviorData.explorationBehavior.menuExploration++;
    }
  }

  private calculateScrollSpeed(): number {
    const scrollData = this.behaviorData.scrollPattern;
    if (scrollData.length < 2) return 0;
    
    const recent = scrollData[scrollData.length - 1];
    const previous = scrollData[scrollData.length - 2];
    
    const distance = Math.abs(recent.scrollY - previous.scrollY);
    const time = recent.timestamp - previous.timestamp;
    
    return time > 0 ? distance / time : 0;
  }

  private getScrollDirection(): 'up' | 'down' {
    const scrollData = this.behaviorData.scrollPattern;
    if (scrollData.length === 0) return 'down';
    
    const lastScroll = scrollData[scrollData.length - 1];
    return window.scrollY > lastScroll.scrollY ? 'down' : 'up';
  }

  private getScrollPauseDuration(): number {
    const scrollData = this.behaviorData.scrollPattern;
    if (scrollData.length < 2) return 0;
    
    return scrollData[scrollData.length - 1].timestamp - scrollData[scrollData.length - 2].timestamp;
  }

  private calculateScrollDepth(): number {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  private getInteractionCountForSection(section: string): number {
    return this.behaviorData.clickPattern.filter(c => c.context === section).length;
  }

  private detectMindChange(selectedOption: string): boolean {
    const recentSelections = this.behaviorData.selectionPattern.slice(-3);
    return recentSelections.some(s => s.selectedOption !== selectedOption);
  }

  private calculateAverageDwellTime(): number {
    if (!this.behaviorData.dwellTime.length) return 0;
    return this.behaviorData.dwellTime.reduce((sum, d) => sum + d.duration, 0) / 
           this.behaviorData.dwellTime.length;
  }

  private calculateDwellTimeConsistency(): number {
    if (this.behaviorData.dwellTime.length < 2) return 0;
    
    const durations = this.behaviorData.dwellTime.map(d => d.duration);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    
    return Math.max(0, 1 - Math.sqrt(variance) / mean);
  }

  private calculateAverageScrollSpeed(): number {
    if (!this.behaviorData.scrollPattern.length) return 0;
    return this.behaviorData.scrollPattern.reduce((sum, s) => sum + s.scrollSpeed, 0) / 
           this.behaviorData.scrollPattern.length;
  }

  private calculateAverageResponseTime(): number {
    if (!this.responseTimeBuffer.length) return 0;
    return this.responseTimeBuffer.reduce((sum, t) => sum + t, 0) / this.responseTimeBuffer.length;
  }

  private calculateInteractionFrequency(): number {
    const sessionDuration = this.getSessionDuration();
    return this.behaviorData.clickPattern.length / Math.max(sessionDuration / 60000, 1); // 분당 클릭
  }

  private getSessionDuration(): number {
    return Date.now() - this.behaviorData.timestamp;
  }

  private calculateScrollSmoothness(): number {
    const scrollData = this.behaviorData.scrollPattern;
    if (scrollData.length < 2) return 0.5;
    
    let smoothness = 0;
    for (let i = 1; i < scrollData.length; i++) {
      const speedDiff = Math.abs(scrollData[i].scrollSpeed - scrollData[i-1].scrollSpeed);
      smoothness += Math.max(0, 1 - speedDiff / 100);
    }
    return smoothness / Math.max(scrollData.length - 1, 1);
  }

  private calculateMindChangeFrequency(): number {
    if (!this.behaviorData.selectionPattern.length) return 0;
    const mindChanges = this.behaviorData.selectionPattern.filter(s => s.changedMind).length;
    return mindChanges / this.behaviorData.selectionPattern.length;
  }

  private calculateFocusStability(): number {
    const attention = this.behaviorData.attentionPattern;
    const totalEvents = attention.focusEvents + attention.blurEvents;
    return totalEvents > 0 ? attention.focusEvents / totalEvents : 0.5;
  }

  private calculateResponseTimeVariability(): number {
    if (this.responseTimeBuffer.length < 2) return 0;
    
    const mean = this.responseTimeBuffer.reduce((sum, t) => sum + t, 0) / this.responseTimeBuffer.length;
    const variance = this.responseTimeBuffer.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / 
                    this.responseTimeBuffer.length;
    
    return Math.min(Math.sqrt(variance) / mean, 1);
  }

  private calculateExplorationScore(): number {
    const exploration = this.behaviorData.explorationBehavior;
    return exploration.uniqueElements / Math.max(exploration.totalClicks, 1);
  }

  private calculateFocusScore(): number {
    return this.calculateFocusStability();
  }

  private calculateConfidenceScore(): number {
    // 데이터 양과 일관성을 기반으로 신뢰도 계산
    const dataPoints = this.behaviorData.clickPattern.length + 
                      this.behaviorData.dwellTime.length + 
                      this.behaviorData.scrollPattern.length;
    
    const dataQuality = Math.min(dataPoints / 50, 1); // 50개 이상이면 최대
    const consistency = this.calculateDwellTimeConsistency();
    
    return (dataQuality * 0.6 + consistency * 0.4);
  }

  private hashSessionId(sessionId: string): string {
    // 간단한 해시 함수 (개인정보보호용)
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      const char = sessionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36);
  }
}

export interface PersonalityIndicators {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  confidence: number;
}
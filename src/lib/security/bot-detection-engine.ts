import { NextRequest } from 'next/server';

// 봇 탐지 결과 인터페이스
export interface BotDetectionResult {
  isBot: boolean;
  confidence: number; // 0-1 (1이 100% 봇)
  riskScore: number; // 0-100
  reasons: string[];
  detectionMethods: string[];
  action: 'allow' | 'challenge' | 'block';
  metadata: {
    userAgent: string;
    ip: string;
    fingerprint?: string;
    timestamp: number;
  };
}

// 사용자 행동 패턴 인터페이스
export interface UserBehaviorPattern {
  requestCount: number;
  requestInterval: number[]; // 요청 간격 (ms)
  pageSequence: string[]; // 방문한 페이지 순서
  mouseMovements: number; // 마우스 움직임 횟수
  keystrokes: number; // 키보드 입력 횟수
  scrollEvents: number; // 스크롤 이벤트 횟수
  sessionDuration: number; // 세션 지속 시간 (ms)
  referrer?: string;
  viewportSize?: { width: number; height: number };
}

// 봇 시그니처 데이터베이스
const BOT_SIGNATURES = {
  // 알려진 봇 User-Agent 패턴
  knownBots: [
    /bot/i, /crawl/i, /spider/i, /scrape/i,
    /python/i, /curl/i, /wget/i, /postman/i,
    /automation/i, /headless/i, /phantom/i, /selenium/i,
    /puppeteer/i, /playwright/i
  ],
  
  // 의심스러운 User-Agent 패턴
  suspiciousPatterns: [
    /^$/,  // 빈 User-Agent
    /mozilla\/4\.0$/i, // 구식 브라우저
    /^okhttp/i, // HTTP 클라이언트
    /^apache-httpclient/i,
    /^java/i
  ],

  // 정상 브라우저 패턴
  legitimateBrowsers: [
    /chrome/i, /firefox/i, /safari/i, /edge/i, /opera/i
  ]
};

// 메모리 기반 사용자 행동 저장소 (프로덕션에서는 Redis 권장)
const userBehaviorStore = new Map<string, {
  requests: Array<{ timestamp: number; path: string; method: string }>;
  patterns: Partial<UserBehaviorPattern>;
  riskScore: number;
  lastActivity: number;
}>();

/**
 * 봇 탐지 엔진 메인 클래스
 */
export class BotDetectionEngine {
  private readonly config = {
    // 임계값 설정
    maxRequestsPerMinute: 60,      // 분당 최대 요청 수
    maxRequestsPerHour: 1000,      // 시간당 최대 요청 수
    minRequestInterval: 100,       // 최소 요청 간격 (ms)
    maxRiskScore: 80,              // 차단 임계값
    challengeRiskScore: 60,        // CAPTCHA 요구 임계값
    
    // 행동 분석 가중치
    weights: {
      userAgent: 0.3,              // User-Agent 분석 가중치
      requestPattern: 0.25,        // 요청 패턴 분석 가중치
      behaviorPattern: 0.2,        // 행동 패턴 분석 가중치
      ipReputation: 0.15,          // IP 평판 분석 가중치
      fingerprint: 0.1             // 브라우저 핑거프린트 가중치
    }
  };

  /**
   * 메인 봇 탐지 함수
   */
  async detectBot(req: NextRequest, behaviorPattern?: Partial<UserBehaviorPattern>): Promise<BotDetectionResult> {
    const startTime = Date.now();
    const userAgent = req.headers.get('user-agent') || '';
    const ip = this.getClientIP(req);
    const fingerprint = req.headers.get('x-fingerprint') || undefined;

    // 기본 메타데이터 구성
    const metadata = {
      userAgent,
      ip,
      fingerprint,
      timestamp: startTime
    };

    // 사용자 행동 데이터 업데이트
    this.updateUserBehavior(ip, req);

    // 다양한 탐지 방법 실행
    const detectionResults = await Promise.all([
      this.analyzeUserAgent(userAgent),
      this.analyzeRequestPattern(ip, req),
      this.analyzeBehaviorPattern(ip, behaviorPattern),
      this.analyzeIPReputation(ip),
      this.analyzeFingerprint(fingerprint)
    ]);

    // 종합 위험 점수 계산
    const riskScore = this.calculateRiskScore(detectionResults);
    
    // 봇 여부 판단
    const isBot = riskScore >= this.config.maxRiskScore;
    const confidence = Math.min(riskScore / 100, 1);

    // 수집된 탐지 이유들
    const reasons = detectionResults
      .filter(result => result.reasons.length > 0)
      .flatMap(result => result.reasons);

    // 탐지 방법들
    const detectionMethods = detectionResults
      .filter(result => result.detected)
      .map(result => result.method);

    // 취해야 할 액션 결정
    const action = this.determineAction(riskScore);

    // 탐지 결과 로깅
    this.logDetectionResult({
      isBot,
      confidence,
      riskScore,
      reasons,
      detectionMethods,
      action,
      metadata
    });

    return {
      isBot,
      confidence,
      riskScore,
      reasons,
      detectionMethods,
      action,
      metadata
    };
  }

  /**
   * User-Agent 분석
   */
  private analyzeUserAgent(userAgent: string): { detected: boolean; score: number; reasons: string[]; method: string } {
    const reasons: string[] = [];
    let score = 0;

    // 빈 User-Agent
    if (!userAgent || userAgent.trim() === '') {
      score += 80;
      reasons.push('빈 User-Agent');
    }

    // 알려진 봇 시그니처 검사
    for (const pattern of BOT_SIGNATURES.knownBots) {
      if (pattern.test(userAgent)) {
        score += 90;
        reasons.push('알려진 봇 시그니처 탐지');
        break;
      }
    }

    // 의심스러운 패턴 검사
    for (const pattern of BOT_SIGNATURES.suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        score += 60;
        reasons.push('의심스러운 User-Agent 패턴');
        break;
      }
    }

    // 정상 브라우저 여부 확인
    const isLegitimate = BOT_SIGNATURES.legitimateBrowsers.some(pattern => pattern.test(userAgent));
    if (!isLegitimate && userAgent.length > 10) {
      score += 40;
      reasons.push('비표준 브라우저 User-Agent');
    }

    // User-Agent 복잡도 분석
    if (userAgent.length < 20) {
      score += 30;
      reasons.push('비정상적으로 짧은 User-Agent');
    }

    return {
      detected: score > 50,
      score: Math.min(score, 100),
      reasons,
      method: 'user-agent-analysis'
    };
  }

  /**
   * 요청 패턴 분석
   */
  private analyzeRequestPattern(ip: string, req: NextRequest): { detected: boolean; score: number; reasons: string[]; method: string } {
    const reasons: string[] = [];
    let score = 0;

    const userData = userBehaviorStore.get(ip);
    if (!userData) {
      return { detected: false, score: 0, reasons: [], method: 'request-pattern-analysis' };
    }

    const now = Date.now();
    const recentRequests = userData.requests.filter(r => now - r.timestamp < 60000); // 최근 1분

    // 분당 요청 수 검사
    if (recentRequests.length > this.config.maxRequestsPerMinute) {
      score += 70;
      reasons.push(`분당 요청 수 초과: ${recentRequests.length}회`);
    }

    // 요청 간격 분석
    if (recentRequests.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < recentRequests.length; i++) {
        intervals.push(recentRequests[i].timestamp - recentRequests[i-1].timestamp);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const minInterval = Math.min(...intervals);

      // 너무 일정한 간격 (봇의 특징)
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      if (variance < 1000 && intervals.length > 5) {
        score += 60;
        reasons.push('비정상적으로 일정한 요청 간격');
      }

      // 너무 빠른 요청
      if (minInterval < this.config.minRequestInterval) {
        score += 80;
        reasons.push(`비정상적으로 빠른 요청 간격: ${minInterval}ms`);
      }
    }

    // 동일한 패턴 반복 요청
    const recentPaths = recentRequests.map(r => r.path);
    const uniquePaths = new Set(recentPaths);
    if (recentPaths.length > 10 && uniquePaths.size < 3) {
      score += 50;
      reasons.push('동일한 경로 반복 요청');
    }

    return {
      detected: score > 40,
      score: Math.min(score, 100),
      reasons,
      method: 'request-pattern-analysis'
    };
  }

  /**
   * 행동 패턴 분석
   */
  private analyzeBehaviorPattern(ip: string, behaviorPattern?: Partial<UserBehaviorPattern>): { detected: boolean; score: number; reasons: string[]; method: string } {
    const reasons: string[] = [];
    let score = 0;

    if (!behaviorPattern) {
      return { detected: false, score: 0, reasons: [], method: 'behavior-pattern-analysis' };
    }

    // 마우스/키보드 상호작용 부족
    if (behaviorPattern.mouseMovements === 0 && behaviorPattern.keystrokes === 0) {
      score += 70;
      reasons.push('마우스/키보드 상호작용 없음');
    }

    // 비정상적으로 빠른 페이지 탐색
    if (behaviorPattern.pageSequence && behaviorPattern.pageSequence.length > 5) {
      const avgTimePerPage = behaviorPattern.sessionDuration! / behaviorPattern.pageSequence.length;
      if (avgTimePerPage < 2000) { // 페이지당 2초 미만
        score += 60;
        reasons.push(`비정상적으로 빠른 페이지 탐색: ${avgTimePerPage.toFixed(0)}ms/페이지`);
      }
    }

    // 스크롤 이벤트 부족
    if (behaviorPattern.scrollEvents === 0 && behaviorPattern.sessionDuration! > 10000) {
      score += 40;
      reasons.push('10초 이상 세션에서 스크롤 없음');
    }

    // 비정상적인 뷰포트 크기
    if (behaviorPattern.viewportSize) {
      const { width, height } = behaviorPattern.viewportSize;
      if (width < 100 || height < 100 || width > 5000 || height > 5000) {
        score += 50;
        reasons.push(`비정상적인 뷰포트 크기: ${width}x${height}`);
      }
    }

    return {
      detected: score > 30,
      score: Math.min(score, 100),
      reasons,
      method: 'behavior-pattern-analysis'
    };
  }

  /**
   * IP 평판 분석
   */
  private analyzeIPReputation(ip: string): { detected: boolean; score: number; reasons: string[]; method: string } {
    const reasons: string[] = [];
    let score = 0;

    // 로컬 IP 체크
    if (this.isLocalIP(ip)) {
      return { detected: false, score: 0, reasons: [], method: 'ip-reputation-analysis' };
    }

    // 알려진 악성 IP 대역 (예시)
    const maliciousRanges = [
      '10.0.0.0/8',     // 예시: 내부 테스트용
      '192.168.0.0/16'  // 예시: 내부 테스트용
    ];

    // 클라우드/VPN/프록시 IP 체크 (간단한 휴리스틱)
    const userData = userBehaviorStore.get(ip);
    if (userData && userData.requests.length > 100) {
      const uniquePaths = new Set(userData.requests.map(r => r.path));
      const pathDiversity = uniquePaths.size / userData.requests.length;
      
      if (pathDiversity < 0.1) {
        score += 40;
        reasons.push('낮은 경로 다양성 (자동화 의심)');
      }
    }

    return {
      detected: score > 30,
      score: Math.min(score, 100),
      reasons,
      method: 'ip-reputation-analysis'
    };
  }

  /**
   * 브라우저 핑거프린트 분석
   */
  private analyzeFingerprint(fingerprint?: string): { detected: boolean; score: number; reasons: string[]; method: string } {
    const reasons: string[] = [];
    let score = 0;

    if (!fingerprint) {
      score += 20;
      reasons.push('브라우저 핑거프린트 없음');
    } else {
      // 핑거프린트 패턴 분석 (실제로는 더 복잡한 분석 필요)
      if (fingerprint.length < 10) {
        score += 30;
        reasons.push('비정상적으로 짧은 핑거프린트');
      }
    }

    return {
      detected: score > 20,
      score: Math.min(score, 100),
      reasons,
      method: 'fingerprint-analysis'
    };
  }

  /**
   * 종합 위험 점수 계산
   */
  private calculateRiskScore(results: Array<{ score: number; method: string }>): number {
    let totalScore = 0;
    
    results.forEach(result => {
      const weight = this.getMethodWeight(result.method);
      totalScore += result.score * weight;
    });

    return Math.min(totalScore, 100);
  }

  /**
   * 탐지 방법별 가중치 반환
   */
  private getMethodWeight(method: string): number {
    switch (method) {
      case 'user-agent-analysis': return this.config.weights.userAgent;
      case 'request-pattern-analysis': return this.config.weights.requestPattern;
      case 'behavior-pattern-analysis': return this.config.weights.behaviorPattern;
      case 'ip-reputation-analysis': return this.config.weights.ipReputation;
      case 'fingerprint-analysis': return this.config.weights.fingerprint;
      default: return 0.1;
    }
  }

  /**
   * 액션 결정
   */
  private determineAction(riskScore: number): 'allow' | 'challenge' | 'block' {
    if (riskScore >= this.config.maxRiskScore) {
      return 'block';
    } else if (riskScore >= this.config.challengeRiskScore) {
      return 'challenge';
    } else {
      return 'allow';
    }
  }

  /**
   * 사용자 행동 데이터 업데이트
   */
  private updateUserBehavior(ip: string, req: NextRequest): void {
    const now = Date.now();
    const path = req.nextUrl.pathname;
    const method = req.method;

    let userData = userBehaviorStore.get(ip);
    if (!userData) {
      userData = {
        requests: [],
        patterns: {},
        riskScore: 0,
        lastActivity: now
      };
      userBehaviorStore.set(ip, userData);
    }

    // 새 요청 추가
    userData.requests.push({ timestamp: now, path, method });
    userData.lastActivity = now;

    // 오래된 요청 정리 (1시간 이상)
    userData.requests = userData.requests.filter(r => now - r.timestamp < 3600000);

    // 메모리 사용량 제한 (요청당 최대 1000개)
    if (userData.requests.length > 1000) {
      userData.requests = userData.requests.slice(-1000);
    }
  }

  /**
   * 클라이언트 IP 추출
   */
  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return req.headers.get('x-real-ip') || 
           'unknown';
  }

  /**
   * 로컬 IP 체크
   */
  private isLocalIP(ip: string): boolean {
    const localPatterns = [
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^::1$/,
      /^localhost$/i
    ];
    
    return localPatterns.some(pattern => pattern.test(ip));
  }

  /**
   * 탐지 결과 로깅
   */
  private logDetectionResult(result: BotDetectionResult): void {
    if (result.isBot || result.riskScore > 50) {
      console.log(`🤖 봇 탐지: ${result.metadata.ip} (위험도: ${result.riskScore}, 액션: ${result.action})`);
      console.log(`   이유: ${result.reasons.join(', ')}`);
      console.log(`   탐지방법: ${result.detectionMethods.join(', ')}`);
    }
  }

  /**
   * 정리 작업 (오래된 데이터 삭제)
   */
  static cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24시간

    for (const [ip, userData] of userBehaviorStore.entries()) {
      if (now - userData.lastActivity > maxAge) {
        userBehaviorStore.delete(ip);
      }
    }
  }

  /**
   * 통계 정보 반환
   */
  getStats(): {
    totalUsers: number;
    activeUsers: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    const activeThreshold = 60 * 60 * 1000; // 1시간

    const activeUsers = Array.from(userBehaviorStore.values())
      .filter(userData => now - userData.lastActivity < activeThreshold)
      .length;

    return {
      totalUsers: userBehaviorStore.size,
      activeUsers,
      memoryUsage: userBehaviorStore.size * 1024 // 대략적인 메모리 사용량 (바이트)
    };
  }
}

// 전역 봇 탐지 엔진 인스턴스
export const botDetectionEngine = new BotDetectionEngine();

// 24시간마다 정리 작업 실행
setInterval(() => {
  BotDetectionEngine.cleanup();
}, 24 * 60 * 60 * 1000);
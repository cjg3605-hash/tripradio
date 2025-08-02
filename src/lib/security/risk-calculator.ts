/**
 * 실시간 위험 점수 계산기
 * 다양한 보안 지표를 종합하여 동적 위험 점수를 계산합니다.
 */

export interface SecurityMetrics {
  // 봇 탐지 관련
  botDetectionScore: number;
  userAgentSuspicion: number;
  requestPatternAnomaly: number;
  behaviorAnalysisScore: number;
  
  // 인증 관련
  failedLoginAttempts: number;
  passwordStrengthScore: number;
  accountAge: number; // days
  
  // 네트워크 관련
  ipReputationScore: number;
  geoLocationRisk: number;
  networkLatency: number;
  
  // 세션 관련
  sessionDuration: number;
  pageViewCount: number;
  interactionEvents: number;
  
  // 시간 관련
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  requestFrequency: number;
}

export interface RiskAssessment {
  overallRiskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: Array<{
    category: string;
    factor: string;
    score: number;
    weight: number;
    impact: 'positive' | 'negative';
    description: string;
  }>;
  recommendations: string[];
  confidenceLevel: number; // 0-1
  calculatedAt: number;
}

export interface AdaptiveSecurityConfig {
  // 동적 임계값
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  // 가중치 설정
  weights: {
    botDetection: number;
    authentication: number;
    network: number;
    behavior: number;
    temporal: number;
  };
  
  // 적응형 설정
  adaptiveFactors: {
    enableTimeBasedAdjustment: boolean;
    enableLocationBasedAdjustment: boolean;
    enableBehaviorLearning: boolean;
    learningRate: number;
  };
}

/**
 * 실시간 위험 점수 계산기 클래스
 */
export class RiskCalculator {
  private config: AdaptiveSecurityConfig;
  private historicalData: Map<string, Array<{ timestamp: number; riskScore: number; metrics: SecurityMetrics }>>;
  
  constructor(config?: Partial<AdaptiveSecurityConfig>) {
    this.config = {
      thresholds: {
        low: 30,
        medium: 50,
        high: 70,
        critical: 85
      },
      weights: {
        botDetection: 0.35,
        authentication: 0.25,
        network: 0.20,
        behavior: 0.15,
        temporal: 0.05
      },
      adaptiveFactors: {
        enableTimeBasedAdjustment: true,
        enableLocationBasedAdjustment: true,
        enableBehaviorLearning: true,
        learningRate: 0.1
      },
      ...config
    };
    
    this.historicalData = new Map();
  }

  /**
   * 종합 위험 점수 계산
   */
  calculateRiskScore(metrics: SecurityMetrics, userId?: string): RiskAssessment {
    const startTime = Date.now();
    
    // 1. 카테고리별 점수 계산
    const categoryScores = {
      botDetection: this.calculateBotDetectionRisk(metrics),
      authentication: this.calculateAuthenticationRisk(metrics),
      network: this.calculateNetworkRisk(metrics),
      behavior: this.calculateBehaviorRisk(metrics),
      temporal: this.calculateTemporalRisk(metrics)
    };

    // 2. 가중 평균 계산
    let overallScore = 0;
    const riskFactors: RiskAssessment['riskFactors'] = [];
    
    Object.entries(categoryScores).forEach(([category, categoryData]) => {
      const weight = this.config.weights[category as keyof typeof this.config.weights];
      overallScore += categoryData.score * weight;
      
      // 위험 요소 추가
      riskFactors.push(...categoryData.factors.map(factor => ({
        category,
        ...factor,
        weight
      })));
    });

    // 3. 적응형 조정 적용
    if (userId && this.config.adaptiveFactors.enableBehaviorLearning) {
      overallScore = this.applyAdaptiveAdjustment(overallScore, metrics, userId);
    }

    // 4. 시간대별 조정
    if (this.config.adaptiveFactors.enableTimeBasedAdjustment) {
      overallScore = this.applyTimeBasedAdjustment(overallScore, metrics.timeOfDay);
    }

    // 5. 위험 수준 결정
    const riskLevel = this.determineRiskLevel(overallScore);
    
    // 6. 권장사항 생성
    const recommendations = this.generateRecommendations(riskLevel, riskFactors);
    
    // 7. 신뢰도 계산
    const confidenceLevel = this.calculateConfidenceLevel(metrics, riskFactors);

    // 8. 과거 데이터 저장
    if (userId) {
      this.storeHistoricalData(userId, overallScore, metrics);
    }

    const result: RiskAssessment = {
      overallRiskScore: Math.min(100, Math.max(0, Math.round(overallScore))),
      riskLevel,
      riskFactors: riskFactors.sort((a, b) => b.score - a.score), // 높은 위험 요소부터
      recommendations,
      confidenceLevel,
      calculatedAt: startTime
    };

    // 성능 모니터링
    const calculationTime = Date.now() - startTime;
    if (calculationTime > 50) {
      console.warn(`위험 점수 계산 시간 초과: ${calculationTime}ms`);
    }

    return result;
  }

  /**
   * 봇 탐지 위험 점수 계산
   */
  private calculateBotDetectionRisk(metrics: SecurityMetrics): {
    score: number;
    factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }>;
  } {
    const factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }> = [];
    let score = 0;

    // User-Agent 의심도
    if (metrics.userAgentSuspicion > 0) {
      const factor = {
        factor: 'suspicious-user-agent',
        score: metrics.userAgentSuspicion,
        impact: 'negative' as const,
        description: '의심스러운 User-Agent 패턴 감지'
      };
      factors.push(factor);
      score += metrics.userAgentSuspicion * 0.4;
    }

    // 요청 패턴 이상
    if (metrics.requestPatternAnomaly > 0) {
      const factor = {
        factor: 'request-pattern-anomaly',
        score: metrics.requestPatternAnomaly,
        impact: 'negative' as const,
        description: '비정상적인 요청 패턴'
      };
      factors.push(factor);
      score += metrics.requestPatternAnomaly * 0.6;
    }

    // 행동 분석 점수
    if (metrics.behaviorAnalysisScore > 0) {
      const factor = {
        factor: 'behavior-analysis',
        score: metrics.behaviorAnalysisScore,
        impact: 'negative' as const,
        description: '비인간적 행동 패턴'
      };
      factors.push(factor);
      score += metrics.behaviorAnalysisScore * 0.5;
    }

    // 전체 봇 탐지 점수
    if (metrics.botDetectionScore > 0) {
      score = Math.max(score, metrics.botDetectionScore);
    }

    return { score: Math.min(100, score), factors };
  }

  /**
   * 인증 관련 위험 점수 계산
   */
  private calculateAuthenticationRisk(metrics: SecurityMetrics): {
    score: number;
    factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }>;
  } {
    const factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }> = [];
    let score = 0;

    // 로그인 실패 횟수
    if (metrics.failedLoginAttempts > 0) {
      const attemptScore = Math.min(100, metrics.failedLoginAttempts * 20);
      factors.push({
        factor: 'failed-login-attempts',
        score: attemptScore,
        impact: 'negative' as const,
        description: `${metrics.failedLoginAttempts}번의 로그인 실패`
      });
      score += attemptScore;
    }

    // 비밀번호 강도
    if (metrics.passwordStrengthScore < 70) {
      const weakPasswordScore = 70 - metrics.passwordStrengthScore;
      factors.push({
        factor: 'weak-password',
        score: weakPasswordScore,
        impact: 'negative' as const,
        description: '약한 비밀번호 사용'
      });
      score += weakPasswordScore * 0.5;
    }

    // 계정 나이 (새 계정은 위험도 증가)
    if (metrics.accountAge < 7) {
      const newAccountScore = (7 - metrics.accountAge) * 10;
      factors.push({
        factor: 'new-account',
        score: newAccountScore,
        impact: 'negative' as const,
        description: `생성된 지 ${metrics.accountAge}일된 새 계정`
      });
      score += newAccountScore;
    }

    return { score: Math.min(100, score), factors };
  }

  /**
   * 네트워크 관련 위험 점수 계산
   */
  private calculateNetworkRisk(metrics: SecurityMetrics): {
    score: number;
    factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }>;
  } {
    const factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }> = [];
    let score = 0;

    // IP 평판 점수
    if (metrics.ipReputationScore > 0) {
      factors.push({
        factor: 'ip-reputation',
        score: metrics.ipReputationScore,
        impact: 'negative' as const,
        description: '의심스러운 IP 주소'
      });
      score += metrics.ipReputationScore;
    }

    // 지리적 위치 위험
    if (metrics.geoLocationRisk > 0) {
      factors.push({
        factor: 'geo-location-risk',
        score: metrics.geoLocationRisk,
        impact: 'negative' as const,
        description: '고위험 지역에서의 접속'
      });
      score += metrics.geoLocationRisk * 0.8;
    }

    // 네트워크 지연시간 (너무 낮으면 봇일 가능성)
    if (metrics.networkLatency < 10) {
      const lowLatencyScore = (10 - metrics.networkLatency) * 5;
      factors.push({
        factor: 'unusually-low-latency',
        score: lowLatencyScore,
        impact: 'negative' as const,
        description: '비정상적으로 낮은 네트워크 지연시간'
      });
      score += lowLatencyScore;
    }

    return { score: Math.min(100, score), factors };
  }

  /**
   * 행동 패턴 위험 점수 계산
   */
  private calculateBehaviorRisk(metrics: SecurityMetrics): {
    score: number;
    factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }>;
  } {
    const factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }> = [];
    let score = 0;

    // 세션 지속시간 (너무 짧거나 길면 의심)
    if (metrics.sessionDuration < 30000) { // 30초 미만
      const shortSessionScore = (30000 - metrics.sessionDuration) / 1000;
      factors.push({
        factor: 'short-session',
        score: shortSessionScore,
        impact: 'negative' as const,
        description: '비정상적으로 짧은 세션'
      });
      score += shortSessionScore;
    }

    // 상호작용 이벤트 부족
    if (metrics.interactionEvents === 0 && metrics.sessionDuration > 10000) {
      factors.push({
        factor: 'no-interaction',
        score: 60,
        impact: 'negative' as const,
        description: '사용자 상호작용 없음'
      });
      score += 60;
    }

    // 페이지 뷰 대비 상호작용 비율
    if (metrics.pageViewCount > 0) {
      const interactionRatio = metrics.interactionEvents / metrics.pageViewCount;
      if (interactionRatio < 0.1) {
        const lowInteractionScore = (0.1 - interactionRatio) * 500;
        factors.push({
          factor: 'low-interaction-ratio',
          score: lowInteractionScore,
          impact: 'negative' as const,
          description: '페이지 뷰 대비 낮은 상호작용 비율'
        });
        score += lowInteractionScore;
      }
    }

    return { score: Math.min(100, score), factors };
  }

  /**
   * 시간대 관련 위험 점수 계산
   */
  private calculateTemporalRisk(metrics: SecurityMetrics): {
    score: number;
    factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }>;
  } {
    const factors: Array<{
      factor: string;
      score: number;
      impact: 'positive' | 'negative';
      description: string;
    }> = [];
    let score = 0;

    // 심야 시간대 접속 (2-6시)
    if (metrics.timeOfDay >= 2 && metrics.timeOfDay <= 6) {
      factors.push({
        factor: 'late-night-access',
        score: 20,
        impact: 'negative' as const,
        description: '심야 시간대 접속'
      });
      score += 20;
    }

    // 요청 빈도
    if (metrics.requestFrequency > 100) { // 분당 100회 이상
      const highFrequencyScore = Math.min(50, (metrics.requestFrequency - 100) / 2);
      factors.push({
        factor: 'high-request-frequency',
        score: highFrequencyScore,
        impact: 'negative' as const,
        description: `분당 ${metrics.requestFrequency}회의 높은 요청 빈도`
      });
      score += highFrequencyScore;
    }

    return { score: Math.min(100, score), factors };
  }

  /**
   * 적응형 조정 적용
   */
  private applyAdaptiveAdjustment(score: number, metrics: SecurityMetrics, userId: string): number {
    const history = this.historicalData.get(userId);
    if (!history || history.length < 3) {
      return score; // 충분한 데이터가 없으면 조정하지 않음
    }

    // 과거 패턴 분석
    const recentHistory = history.slice(-10); // 최근 10개 데이터
    const avgHistoricalScore = recentHistory.reduce((sum, item) => sum + item.riskScore, 0) / recentHistory.length;
    const variance = recentHistory.reduce((sum, item) => sum + Math.pow(item.riskScore - avgHistoricalScore, 2), 0) / recentHistory.length;

    // 일관된 패턴을 보이는 사용자는 점수 완화
    if (variance < 100 && avgHistoricalScore < 40) {
      const adjustment = Math.min(20, (40 - avgHistoricalScore) * 0.5);
      return Math.max(0, score - adjustment);
    }

    return score;
  }

  /**
   * 시간대별 조정 적용
   */
  private applyTimeBasedAdjustment(score: number, timeOfDay: number): number {
    // 업무 시간대 (9-18시)는 위험도 완화
    if (timeOfDay >= 9 && timeOfDay <= 18) {
      return score * 0.9;
    }
    
    // 심야 시간대 (0-6시)는 위험도 증가
    if (timeOfDay >= 0 && timeOfDay <= 6) {
      return score * 1.2;
    }

    return score;
  }

  /**
   * 위험 수준 결정
   */
  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.config.thresholds.critical) return 'critical';
    if (score >= this.config.thresholds.high) return 'high';
    if (score >= this.config.thresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(
    riskLevel: string, 
    riskFactors: RiskAssessment['riskFactors']
  ): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('즉시 계정 활동을 차단하고 보안팀에 알림');
        recommendations.push('상세한 보안 로그 분석 수행');
        break;
        
      case 'high':
        recommendations.push('CAPTCHA 또는 2단계 인증 요구');
        recommendations.push('세션 제한 및 추가 모니터링');
        break;
        
      case 'medium':
        recommendations.push('추가 인증 단계 고려');
        recommendations.push('사용자 행동 패턴 모니터링 강화');
        break;
        
      case 'low':
        recommendations.push('정상 처리하되 기본 모니터링 유지');
        break;
    }

    // 위험 요소별 구체적 권장사항
    const topRisks = riskFactors.slice(0, 3);
    topRisks.forEach(risk => {
      switch (risk.factor) {
        case 'failed-login-attempts':
          recommendations.push('계정 잠금 및 비밀번호 재설정 요구');
          break;
        case 'suspicious-user-agent':
          recommendations.push('브라우저 검증 및 디바이스 핑거프린팅 강화');
          break;
        case 'no-interaction':
          recommendations.push('상호작용 챌린지 (예: 간단한 퀴즈) 제시');
          break;
      }
    });

    return [...new Set(recommendations)]; // 중복 제거
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidenceLevel(
    metrics: SecurityMetrics, 
    riskFactors: RiskAssessment['riskFactors']
  ): number {
    let confidence = 1.0;

    // 데이터 품질에 따른 신뢰도 조정
    const dataQualityFactors = [
      metrics.sessionDuration > 0 ? 0.2 : 0,
      metrics.interactionEvents >= 0 ? 0.2 : 0,
      metrics.pageViewCount > 0 ? 0.2 : 0,
      metrics.ipReputationScore >= 0 ? 0.2 : 0,
      riskFactors.length > 0 ? 0.2 : 0
    ];

    confidence = dataQualityFactors.reduce((sum, factor) => sum + factor, 0);

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * 과거 데이터 저장
   */
  private storeHistoricalData(userId: string, riskScore: number, metrics: SecurityMetrics): void {
    if (!this.historicalData.has(userId)) {
      this.historicalData.set(userId, []);
    }

    const history = this.historicalData.get(userId)!;
    history.push({
      timestamp: Date.now(),
      riskScore,
      metrics
    });

    // 최대 50개 기록만 유지
    if (history.length > 50) {
      history.shift();
    }
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<AdaptiveSecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 통계 정보 반환
   */
  getStats(): {
    totalUsers: number;
    avgRiskScore: number;
    riskDistribution: Record<string, number>;
  } {
    const allHistory = Array.from(this.historicalData.values()).flat();
    const totalUsers = this.historicalData.size;
    
    if (allHistory.length === 0) {
      return {
        totalUsers: 0,
        avgRiskScore: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 }
      };
    }

    const avgRiskScore = allHistory.reduce((sum, item) => sum + item.riskScore, 0) / allHistory.length;
    
    const riskDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    allHistory.forEach(item => {
      const level = this.determineRiskLevel(item.riskScore);
      riskDistribution[level]++;
    });

    return { totalUsers, avgRiskScore, riskDistribution };
  }
}

// 전역 위험 점수 계산기 인스턴스
export const riskCalculator = new RiskCalculator();
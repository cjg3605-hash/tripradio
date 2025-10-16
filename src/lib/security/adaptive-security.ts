/**
 * 적응형 보안 조치 시스템
 * 위험 수준에 따라 동적으로 보안 조치를 적용합니다.
 */

import { RiskAssessment, riskCalculator } from './risk-calculator';
import { captchaSystem } from './captcha-system';
import { botDetectionEngine } from './bot-detection-engine';

export interface SecurityAction {
  id: string;
  type: 'allow' | 'monitor' | 'challenge' | 'restrict' | 'block';
  priority: number; // 1-5 (5가 가장 높음)
  description: string;
  parameters?: Record<string, any>;
  expiresAt?: number;
  reason: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: Array<{
    field: string;
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'contains';
    value: any;
  }>;
  actions: SecurityAction[];
  priority: number;
}

export interface AdaptiveSecurityContext {
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  requestPath: string;
  timestamp: number;
  riskAssessment: RiskAssessment;
  historicalBehavior?: {
    avgRiskScore: number;
    totalSessions: number;
    lastSeen: number;
  };
}

/**
 * 적응형 보안 조치 시스템 클래스
 */
export class AdaptiveSecuritySystem {
  private policies: Map<string, SecurityPolicy>;
  private activeSessions: Map<string, {
    context: AdaptiveSecurityContext;
    activeActions: SecurityAction[];
    lastUpdate: number;
  }>;
  
  constructor() {
    this.policies = new Map();
    this.activeSessions = new Map();
    this.initializeDefaultPolicies();
  }

  /**
   * 보안 조치 결정 및 적용
   */
  async evaluateAndApplySecurityMeasures(context: AdaptiveSecurityContext): Promise<{
    actions: SecurityAction[];
    recommendation: 'allow' | 'challenge' | 'block';
    adaptiveAdjustments: string[];
  }> {
    const startTime = Date.now();
    
    // 1. 적용 가능한 정책 평가
    const applicablePolicies = this.evaluatePolicies(context);
    
    // 2. 액션 결정
    const actions = this.determineActions(applicablePolicies, context);
    
    // 3. 적응형 조정 적용
    const adaptiveAdjustments = await this.applyAdaptiveAdjustments(context, actions);
    
    // 4. 최종 권장사항 결정
    const recommendation = this.determineRecommendation(actions);
    
    // 5. 세션 정보 업데이트
    this.updateSessionInfo(context, actions);
    
    // 6. 성능 모니터링
    const processingTime = Date.now() - startTime;
    if (processingTime > 100) {
      console.warn(`적응형 보안 처리 시간 초과: ${processingTime}ms`);
    }
    
    return {
      actions: actions.sort((a, b) => b.priority - a.priority),
      recommendation,
      adaptiveAdjustments
    };
  }

  /**
   * 보안 정책 평가
   */
  private evaluatePolicies(context: AdaptiveSecurityContext): SecurityPolicy[] {
    const applicablePolicies: SecurityPolicy[] = [];
    
    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;
      
      if (this.evaluatePolicyConditions(policy, context)) {
        applicablePolicies.push(policy);
      }
    }
    
    return applicablePolicies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 정책 조건 평가
   */
  private evaluatePolicyConditions(policy: SecurityPolicy, context: AdaptiveSecurityContext): boolean {
    return policy.conditions.every(condition => {
      const value = this.getContextValue(context, condition.field);
      
      switch (condition.operator) {
        case 'gt': return value > condition.value;
        case 'gte': return value >= condition.value;
        case 'lt': return value < condition.value;
        case 'lte': return value <= condition.value;
        case 'eq': return value === condition.value;
        case 'contains': return String(value).includes(condition.value);
        default: return false;
      }
    });
  }

  /**
   * 컨텍스트에서 값 추출
   */
  private getContextValue(context: AdaptiveSecurityContext, field: string): any {
    const fieldPath = field.split('.');
    let value: any = context;
    
    for (const part of fieldPath) {
      value = value?.[part];
    }
    
    return value;
  }

  /**
   * 보안 액션 결정
   */
  private determineActions(policies: SecurityPolicy[], context: AdaptiveSecurityContext): SecurityAction[] {
    const actions: SecurityAction[] = [];
    const actionIds = new Set<string>();
    
    // 정책별 액션 수집
    for (const policy of policies) {
      for (const action of policy.actions) {
        if (!actionIds.has(action.id)) {
          actions.push({
            ...action,
            reason: `정책 '${policy.name}' 에 의해 트리거됨`
          });
          actionIds.add(action.id);
        }
      }
    }
    
    // 위험 수준별 기본 액션 추가
    const riskLevel = context.riskAssessment.riskLevel;
    const defaultActions = this.getDefaultActionsForRiskLevel(riskLevel, context);
    
    for (const action of defaultActions) {
      if (!actionIds.has(action.id)) {
        actions.push(action);
        actionIds.add(action.id);
      }
    }
    
    return actions;
  }

  /**
   * 위험 수준별 기본 액션
   */
  private getDefaultActionsForRiskLevel(riskLevel: string, context: AdaptiveSecurityContext): SecurityAction[] {
    const actions: SecurityAction[] = [];
    
    switch (riskLevel) {
      case 'critical':
        actions.push({
          id: 'block-request',
          type: 'block',
          priority: 5,
          description: '요청 즉시 차단',
          reason: '임계 위험 수준 달성'
        });
        actions.push({
          id: 'alert-security-team',
          type: 'monitor',
          priority: 5,
          description: '보안팀 즉시 알림',
          parameters: { alertType: 'critical', context },
          reason: '임계 위험 수준 달성'
        });
        break;
        
      case 'high':
        actions.push({
          id: 'require-captcha',
          type: 'challenge',
          priority: 4,
          description: 'CAPTCHA 검증 요구',
          parameters: { 
            captchaType: 'adaptive',
            riskScore: context.riskAssessment.overallRiskScore
          },
          reason: '높은 위험 수준'
        });
        actions.push({
          id: 'rate-limit-enhanced',
          type: 'restrict',
          priority: 3,
          description: '강화된 요청 제한 적용',
          parameters: { 
            maxRequests: 10,
            windowSeconds: 300 // 5분
          },
          expiresAt: Date.now() + 30 * 60 * 1000, // 30분
          reason: '높은 위험 수준'
        });
        break;
        
      case 'medium':
        actions.push({
          id: 'enhanced-monitoring',
          type: 'monitor',
          priority: 2,
          description: '강화된 모니터링 적용',
          parameters: { 
            logLevel: 'detailed',
            trackBehavior: true
          },
          expiresAt: Date.now() + 60 * 60 * 1000, // 1시간
          reason: '중간 위험 수준'
        });
        
        // 특정 위험 요소에 따른 추가 조치
        const hasAuthRisk = context.riskAssessment.riskFactors.some(f => 
          f.category === 'authentication' && f.score > 30
        );
        
        if (hasAuthRisk) {
          actions.push({
            id: 'require-additional-auth',
            type: 'challenge',
            priority: 3,
            description: '추가 인증 요구',
            parameters: { method: 'email-verification' },
            reason: '인증 관련 위험 요소 감지'
          });
        }
        break;
        
      case 'low':
        actions.push({
          id: 'standard-monitoring',
          type: 'monitor',
          priority: 1,
          description: '표준 모니터링 유지',
          reason: '낮은 위험 수준'
        });
        break;
    }
    
    return actions;
  }

  /**
   * 적응형 조정 적용
   */
  private async applyAdaptiveAdjustments(
    context: AdaptiveSecurityContext, 
    actions: SecurityAction[]
  ): Promise<string[]> {
    const adjustments: string[] = [];
    
    // 1. 과거 행동 기반 조정
    if (context.historicalBehavior) {
      const { avgRiskScore, totalSessions } = context.historicalBehavior;
      
      // 신뢰할 수 있는 사용자 (낮은 평균 위험도 + 충분한 세션)
      if (avgRiskScore < 30 && totalSessions > 10) {
        // 일부 제한적 조치 완화
        const restrictiveActions = actions.filter(a => a.type === 'restrict' || a.type === 'challenge');
        restrictiveActions.forEach(action => {
          if (action.priority > 1) {
            action.priority -= 1;
            adjustments.push(`신뢰할 수 있는 사용자로 인해 '${action.description}' 조치 완화`);
          }
        });
      }
      
      // 새로운 사용자 또는 위험한 패턴
      if (totalSessions < 3 || avgRiskScore > 60) {
        const monitoringActions = actions.filter(a => a.type === 'monitor');
        monitoringActions.forEach(action => {
          action.priority += 1;
          if (action.parameters) {
            action.parameters.enhanced = true;
          }
        });
        adjustments.push('새 사용자 또는 위험 패턴으로 인한 모니터링 강화');
      }
    }
    
    // 2. 시간대 기반 조정
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 6) { // 심야 시간
      actions.forEach(action => {
        if (action.type !== 'allow') {
          action.priority += 1;
        }
      });
      adjustments.push('심야 시간대로 인한 보안 조치 강화');
    }
    
    // 3. IP 기반 조정
    if (context.ipAddress && await this.isKnownGoodIP(context.ipAddress)) {
      const challengeActions = actions.filter(a => a.type === 'challenge');
      challengeActions.forEach(action => {
        if (action.priority > 2) {
          action.priority -= 1;
          adjustments.push(`신뢰할 수 있는 IP로 인해 '${action.description}' 조치 완화`);
        }
      });
    }
    
    // 4. 디바이스/브라우저 기반 조정
    if (this.isKnownGoodUserAgent(context.userAgent)) {
      adjustments.push('신뢰할 수 있는 브라우저 확인');
    }
    
    return adjustments;
  }

  /**
   * 최종 권장사항 결정
   */
  private determineRecommendation(actions: SecurityAction[]): 'allow' | 'challenge' | 'block' {
    const blockActions = actions.filter(a => a.type === 'block');
    if (blockActions.length > 0) return 'block';
    
    const challengeActions = actions.filter(a => a.type === 'challenge');
    if (challengeActions.length > 0) return 'challenge';
    
    return 'allow';
  }

  /**
   * 세션 정보 업데이트
   */
  private updateSessionInfo(context: AdaptiveSecurityContext, actions: SecurityAction[]): void {
    this.activeSessions.set(context.sessionId, {
      context,
      activeActions: actions,
      lastUpdate: Date.now()
    });
    
    // 만료된 세션 정리
    this.cleanupExpiredSessions();
  }

  /**
   * 만료된 세션 정리
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const maxAge = 4 * 60 * 60 * 1000; // 4시간
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastUpdate > maxAge) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * 기본 보안 정책 초기화
   */
  private initializeDefaultPolicies(): void {
    // 봇 탐지 정책
    this.addPolicy({
      id: 'bot-detection-policy',
      name: '봇 탐지 기반 차단',
      description: '봇으로 판단되는 요청 차단',
      enabled: true,
      priority: 5,
      conditions: [
        { field: 'riskAssessment.riskFactors', operator: 'contains', value: 'bot' }
      ],
      actions: [{
        id: 'block-bot',
        type: 'block',
        priority: 5,
        description: '봇 요청 차단',
        reason: '봇 탐지 정책'
      }]
    });

    // 반복적인 로그인 실패 정책
    this.addPolicy({
      id: 'failed-login-policy',
      name: '로그인 실패 제한',
      description: '반복적인 로그인 실패 시 제한',
      enabled: true,
      priority: 4,
      conditions: [
        { field: 'riskAssessment.riskFactors', operator: 'contains', value: 'failed-login' }
      ],
      actions: [{
        id: 'rate-limit-login',
        type: 'restrict',
        priority: 4,
        description: '로그인 시도 제한',
        parameters: { maxAttempts: 3, windowMinutes: 15 },
        reason: '로그인 실패 정책'
      }]
    });

    // 의심스러운 네트워크 정책
    this.addPolicy({
      id: 'suspicious-network-policy',
      name: '의심스러운 네트워크 모니터링',
      description: '의심스러운 IP나 네트워크에서의 접근 모니터링',
      enabled: true,
      priority: 3,
      conditions: [
        { field: 'riskAssessment.overallRiskScore', operator: 'gte', value: 60 }
      ],
      actions: [{
        id: 'enhanced-network-monitoring',
        type: 'monitor',
        priority: 3,
        description: '네트워크 활동 강화 모니터링',
        parameters: { trackNetwork: true, logDetails: true },
        reason: '의심스러운 네트워크 정책'
      }]
    });
  }

  /**
   * 보안 정책 추가
   */
  addPolicy(policy: SecurityPolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * 보안 정책 제거
   */
  removePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  /**
   * 보안 정책 활성화/비활성화
   */
  togglePolicy(policyId: string, enabled: boolean): boolean {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * 활성 세션 정보 조회
   */
  getActiveSession(sessionId: string) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * 알려진 신뢰할 수 있는 IP 확인
   */
  private async isKnownGoodIP(ip: string): Promise<boolean> {
    // 실제로는 데이터베이스나 화이트리스트에서 확인
    // 여기서는 간단한 예시
    const trustedIPs = [
      '127.0.0.1',
      '::1'
    ];
    
    return trustedIPs.includes(ip);
  }

  /**
   * 신뢰할 수 있는 User-Agent 확인
   */
  private isKnownGoodUserAgent(userAgent: string): boolean {
    const trustedPatterns = [
      /Chrome\/\d+\.\d+\.\d+\.\d+/,
      /Firefox\/\d+\.\d+/,
      /Safari\/\d+\.\d+/,
      /Edge\/\d+\.\d+/
    ];
    
    return trustedPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * 시스템 통계 조회
   */
  getSystemStats(): {
    activePolicies: number;
    activeSessions: number;
    totalPoliciesEvaluated: number;
    avgProcessingTime: number;
  } {
    return {
      activePolicies: Array.from(this.policies.values()).filter(p => p.enabled).length,
      activeSessions: this.activeSessions.size,
      totalPoliciesEvaluated: this.policies.size,
      avgProcessingTime: 25 // 임시 값, 실제로는 성능 메트릭 수집 필요
    };
  }
}

// 전역 적응형 보안 시스템 인스턴스
export const adaptiveSecuritySystem = new AdaptiveSecuritySystem();
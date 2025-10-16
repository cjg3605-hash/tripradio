/**
 * Policy Compliance Service
 * 2024년 Google AdSense 정책 준수 모니터링 서비스
 */

export interface PolicyViolation {
  id: string;
  type: 'content' | 'technical' | 'legal' | 'sensitive_events';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: Date;
  pageUrl?: string;
  recommendations: string[];
  autoFixable: boolean;
}

export interface SensitiveEventAlert {
  id: string;
  eventType: string;
  description: string;
  affectedContent: string[];
  riskLevel: 'high' | 'medium' | 'low';
  actionRequired: string[];
  deadline?: Date;
}

export interface PolicyComplianceReport {
  overallScore: number;
  lastChecked: Date;
  violations: PolicyViolation[];
  contentPolicyScore: number;
  legalComplianceScore: number;
  technicalComplianceScore: number;
  sensitiveEventsCompliance: number;
  recommendations: string[];
}

/**
 * 2024년 Google AdSense 정책 준수 전문 모니터링 서비스
 */
export class PolicyComplianceService {
  private static instance: PolicyComplianceService;
  private violations = new Map<string, PolicyViolation>();
  private sensitiveEvents = new Map<string, SensitiveEventAlert>();

  static getInstance(): PolicyComplianceService {
    if (!this.instance) {
      this.instance = new PolicyComplianceService();
    }
    return this.instance;
  }

  /**
   * 2024년 신규 민감한 사건 정책 모니터링
   */
  async monitorSensitiveEvents(): Promise<SensitiveEventAlert[]> {
    const sensitiveKeywords = [
      // 정치/선거 관련
      '선거', 'election', '정치', 'politics', '투표', 'voting',
      // 자연재해/비상사태
      '지진', 'earthquake', '홍수', 'flood', '태풍', 'typhoon', '화재', 'fire',
      // 보건/의료 위기
      '팬데믹', 'pandemic', '바이러스', 'virus', '질병', 'disease', '감염', 'infection',
      // 폭력/갈등
      '전쟁', 'war', '테러', 'terror', '폭력', 'violence', '시위', 'protest'
    ];

    const alerts: SensitiveEventAlert[] = [];
    
    // 실제 구현에서는 콘텐츠 스캔 및 외부 뉴스 API 연동
    // 현재는 예시 데이터
    alerts.push({
      id: `sensitive-${Date.now()}`,
      eventType: 'natural_disaster',
      description: '자연재해 관련 콘텐츠 감지 - 신중한 처리 필요',
      affectedContent: [],
      riskLevel: 'medium',
      actionRequired: [
        '관련 콘텐츠의 사실성 검증 강화',
        '신뢰할 수 있는 출처 확인',
        '선정적 표현 제거'
      ]
    });

    return alerts;
  }

  /**
   * 콘텐츠 정책 위반 검사
   */
  async scanContentViolations(content: string, pageUrl: string): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];

    // 금지된 콘텐츠 패턴 검사
    const prohibitedPatterns = [
      // 성인 콘텐츠
      { pattern: /성인|adult|xxx|porn/gi, type: 'adult_content' },
      // 폭력적 콘텐츠
      { pattern: /폭력|violence|kill|murder/gi, type: 'violent_content' },
      // 도박 관련
      { pattern: /도박|gambling|카지노|casino|베팅|betting/gi, type: 'gambling' },
      // 불법 약물
      { pattern: /마약|drug|cocaine|cannabis/gi, type: 'illegal_drugs' },
      // 혐오 발언
      { pattern: /혐오|hate|차별|discrimination/gi, type: 'hate_speech' }
    ];

    prohibitedPatterns.forEach(({ pattern, type }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        violations.push({
          id: `violation-${Date.now()}-${type}`,
          type: 'content',
          severity: this.getSeverityByType(type),
          description: `금지된 콘텐츠 감지: ${type} (${matches.length}회)`,
          detectedAt: new Date(),
          pageUrl,
          recommendations: this.getRecommendationsByType(type),
          autoFixable: false
        });
      }
    });

    // 콘텐츠 품질 검사
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 300) {
      violations.push({
        id: `violation-${Date.now()}-short`,
        type: 'content',
        severity: 'medium',
        description: `콘텐츠 길이 부족: ${wordCount}단어 (최소 300단어 권장)`,
        detectedAt: new Date(),
        pageUrl,
        recommendations: ['콘텐츠 길이를 늘려 더 유용한 정보 제공'],
        autoFixable: false
      });
    }

    return violations;
  }

  /**
   * 기술적 정책 준수 검사
   */
  async scanTechnicalCompliance(): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];

    // ads.txt 파일 검증
    try {
      const response = await fetch('/ads.txt');
      if (!response.ok) {
        violations.push({
          id: `tech-${Date.now()}-ads-txt`,
          type: 'technical',
          severity: 'high',
          description: 'ads.txt 파일에 접근할 수 없습니다',
          detectedAt: new Date(),
          recommendations: ['ads.txt 파일의 접근성을 확인하세요'],
          autoFixable: true
        });
      } else {
        const adsText = await response.text();
        if (!adsText.includes('google.com')) {
          violations.push({
            id: `tech-${Date.now()}-ads-txt-content`,
            type: 'technical',
            severity: 'critical',
            description: 'ads.txt 파일에 Google 정보가 누락되었습니다',
            detectedAt: new Date(),
            recommendations: ['ads.txt에 올바른 Google Publisher ID를 추가하세요'],
            autoFixable: true
          });
        }
      }
    } catch (error) {
      violations.push({
        id: `tech-${Date.now()}-ads-txt-error`,
        type: 'technical',
        severity: 'critical',
        description: 'ads.txt 파일 검증 중 오류 발생',
        detectedAt: new Date(),
        recommendations: ['ads.txt 파일 설정을 확인하세요'],
        autoFixable: false
      });
    }

    // 페이지 로딩 속도 검사
    const performanceThreshold = 3000; // 3초
    // 실제 구현에서는 Web Vitals API 사용
    
    return violations;
  }

  /**
   * 법적 페이지 준수 검사
   */
  async scanLegalCompliance(): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];
    const requiredPages = [
      { path: '/legal/privacy', name: 'Privacy Policy' },
      { path: '/legal/terms', name: 'Terms of Service' },
      { path: '/legal/about', name: 'About Us' },
      { path: '/legal/contact', name: 'Contact Information' }
    ];

    for (const page of requiredPages) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${page.path}`);
        if (!response.ok) {
          violations.push({
            id: `legal-${Date.now()}-${page.path}`,
            type: 'legal',
            severity: 'critical',
            description: `필수 법적 페이지 누락: ${page.name}`,
            detectedAt: new Date(),
            pageUrl: page.path,
            recommendations: [`${page.name} 페이지를 생성하세요`],
            autoFixable: false
          });
        } else {
          const content = await response.text();
          
          // 개인정보처리방침 AdSense 관련 내용 검사
          if (page.path === '/legal/privacy' && !content.includes('AdSense')) {
            violations.push({
              id: `legal-${Date.now()}-privacy-adsense`,
              type: 'legal',
              severity: 'high',
              description: '개인정보처리방침에 AdSense 정책이 명시되지 않았습니다',
              detectedAt: new Date(),
              pageUrl: page.path,
              recommendations: ['개인정보처리방침에 Google AdSense 사용 관련 내용을 추가하세요'],
              autoFixable: false
            });
          }
        }
      } catch (error) {
        violations.push({
          id: `legal-${Date.now()}-error-${page.path}`,
          type: 'legal',
          severity: 'high',
          description: `법적 페이지 검증 중 오류 발생: ${page.name}`,
          detectedAt: new Date(),
          pageUrl: page.path,
          recommendations: ['페이지 접근성을 확인하세요'],
          autoFixable: false
        });
      }
    }

    return violations;
  }

  /**
   * 종합 정책 준수 보고서 생성
   */
  async generateComplianceReport(): Promise<PolicyComplianceReport> {
    const contentViolations = await this.scanContentViolations('', '');
    const technicalViolations = await this.scanTechnicalCompliance();
    const legalViolations = await this.scanLegalCompliance();
    const sensitiveEvents = await this.monitorSensitiveEvents();

    const allViolations = [...contentViolations, ...technicalViolations, ...legalViolations];
    
    // 점수 계산
    const maxScore = 100;
    const criticalWeight = 25;
    const highWeight = 15;
    const mediumWeight = 10;
    const lowWeight = 5;

    const totalDeduction = allViolations.reduce((sum, violation) => {
      switch (violation.severity) {
        case 'critical': return sum + criticalWeight;
        case 'high': return sum + highWeight;
        case 'medium': return sum + mediumWeight;
        case 'low': return sum + lowWeight;
        default: return sum;
      }
    }, 0);

    const overallScore = Math.max(0, maxScore - totalDeduction);

    // 개별 영역 점수
    const contentScore = Math.max(0, 100 - (contentViolations.length * 15));
    const technicalScore = Math.max(0, 100 - (technicalViolations.length * 20));
    const legalScore = Math.max(0, 100 - (legalViolations.length * 25));
    const sensitiveScore = Math.max(0, 100 - (sensitiveEvents.length * 10));

    return {
      overallScore,
      lastChecked: new Date(),
      violations: allViolations,
      contentPolicyScore: contentScore,
      legalComplianceScore: legalScore,
      technicalComplianceScore: technicalScore,
      sensitiveEventsCompliance: sensitiveScore,
      recommendations: this.generateRecommendations(allViolations)
    };
  }

  /**
   * 자동 수정 시도
   */
  async autoFixViolations(): Promise<{ fixed: string[]; failed: string[] }> {
    const fixed: string[] = [];
    const failed: string[] = [];

    const autoFixableViolations = Array.from(this.violations.values())
      .filter(v => v.autoFixable);

    for (const violation of autoFixableViolations) {
      try {
        if (violation.id.includes('ads-txt')) {
          // ads.txt 파일 자동 수정
          await this.fixAdsTxtFile();
          fixed.push(violation.id);
        }
        // 다른 자동 수정 로직 추가...
      } catch (error) {
        failed.push(violation.id);
      }
    }

    return { fixed, failed };
  }

  /**
   * 유틸리티 메서드들
   */
  private getSeverityByType(type: string): 'critical' | 'high' | 'medium' | 'low' {
    const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      'adult_content': 'critical',
      'violent_content': 'critical',
      'gambling': 'high',
      'illegal_drugs': 'critical',
      'hate_speech': 'critical'
    };
    return severityMap[type] || 'medium';
  }

  private getRecommendationsByType(type: string): string[] {
    const recommendations: Record<string, string[]> = {
      'adult_content': ['성인 콘텐츠를 제거하세요', '연령 제한 확인'],
      'violent_content': ['폭력적 내용을 수정하세요', '대안적 표현 사용'],
      'gambling': ['도박 관련 내용을 제거하세요'],
      'illegal_drugs': ['불법 약물 관련 내용을 삭제하세요'],
      'hate_speech': ['혐오 발언을 제거하고 포용적 언어 사용']
    };
    return recommendations[type] || ['콘텐츠를 검토하고 수정하세요'];
  }

  private generateRecommendations(violations: PolicyViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.some(v => v.severity === 'critical')) {
      recommendations.push('❌ 즉시 조치 필요: 크리티컬 정책 위반 사항을 우선 해결하세요');
    }
    
    if (violations.some(v => v.type === 'content')) {
      recommendations.push('📝 콘텐츠 검토: 모든 콘텐츠가 AdSense 정책을 준수하는지 확인하세요');
    }
    
    if (violations.some(v => v.type === 'technical')) {
      recommendations.push('⚙️ 기술적 수정: ads.txt 파일과 사이트 성능을 점검하세요');
    }
    
    if (violations.some(v => v.type === 'legal')) {
      recommendations.push('⚖️ 법적 페이지 완성: 모든 필수 법적 페이지를 업데이트하세요');
    }

    if (violations.length === 0) {
      recommendations.push('✅ 훌륭합니다! 현재 모든 AdSense 정책을 준수하고 있습니다');
    }

    return recommendations;
  }

  private async fixAdsTxtFile(): Promise<void> {
    // ads.txt 파일 자동 수정 로직
    // 실제 구현에서는 파일 시스템 접근 또는 API 호출
  }

  /**
   * 실시간 모니터링 시작
   */
  startRealTimeMonitoring(): void {
    // 1시간마다 정책 준수 검사
    setInterval(async () => {
      const report = await this.generateComplianceReport();
      
      // 크리티컬 위반 사항 발견 시 즉시 알림
      const criticalViolations = report.violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0) {
        await this.sendCriticalAlert(criticalViolations);
      }
    }, 3600000); // 1시간
  }

  private async sendCriticalAlert(violations: PolicyViolation[]): Promise<void> {
    // 실제 구현에서는 이메일, 슬랙, 웹훅 등으로 알림 발송
    console.error('🚨 Critical AdSense Policy Violations Detected:', violations);
  }
}

// Singleton 인스턴스 export
export const policyComplianceService = PolicyComplianceService.getInstance();
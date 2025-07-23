// 🔧 품질 자동 수정 엔진
// Phase 1 Task 2.3: A/B 테스트 기반 품질 검증 및 즉석 수정

import { QualityValidationResult } from '@/lib/quality/quality-pipeline';
import { AutoEnhancementResult, autoQualityEnhancer } from './auto-enhancer';

export interface ABTestConfig {
  testName: string;
  originalContent: string;
  variants: ContentVariant[];
  trafficSplit: number[]; // 각 변형에 할당될 트래픽 비율
  testDuration: number; // 테스트 지속 시간 (ms)
  minSampleSize: number; // 최소 샘플 크기
  confidenceLevel: number; // 신뢰도 수준
}

export interface ContentVariant {
  id: string;
  name: string;
  content: string;
  enhancementStrategy?: string;
  targetImprovement?: number;
}

export interface ABTestResult {
  testName: string;
  winner: ContentVariant;
  results: VariantResult[];
  statisticalSignificance: number;
  improvementRate: number;
  recommendation: TestRecommendation;
  completedAt: number;
}

export interface VariantResult {
  variant: ContentVariant;
  sampleSize: number;
  qualityScore: number;
  userSatisfaction: number;
  completionRate: number;
  engagementTime: number;
  conversionRate: number;
  confidenceInterval: [number, number];
}

export interface TestRecommendation {
  action: 'deploy' | 'continue_testing' | 'redesign';
  confidence: number;
  reasoning: string;
  expectedImpact: number;
  risks: string[];
  nextSteps: string[];
}

export interface QualityFixReport {
  issueId: string;
  originalContent: string;
  fixedContent: string;
  issueType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixMethod: 'automatic' | 'ab_test' | 'manual_review';
  qualityImprovement: number;
  processingTime: number;
  confidence: number;
  abTestResults?: ABTestResult;
}

/**
 * 🎯 품질 자동 수정 엔진
 * A/B 테스트 기반으로 품질 문제를 자동으로 감지하고 수정하는 시스템
 */
export class QualityAutoFixer {
  
  private activeTests: Map<string, ABTestConfig> = new Map();
  private testResults: Map<string, ABTestResult> = new Map();
  private fixHistory: QualityFixReport[] = [];
  
  // 95% 자동 수정 성공률 목표
  private static readonly TARGET_SUCCESS_RATE = 0.95;
  private static readonly MIN_STATISTICAL_SIGNIFICANCE = 0.95;
  private static readonly DEFAULT_TEST_DURATION = 24 * 60 * 60 * 1000; // 24시간

  /**
   * 🚀 메인 품질 수정 함수
   */
  public async fixQualityIssues(
    content: string,
    validationResult: QualityValidationResult,
    context: {
      culturalBackground?: string;
      userPersonality?: string;
      targetDuration?: number;
      contentType?: string;
    } = {}
  ): Promise<QualityFixReport[]> {
    console.log('🔧 품질 자동 수정 시작...');
    const startTime = performance.now();

    const fixReports: QualityFixReport[] = [];

    try {
      // 1. 수정 필요한 이슈들 식별
      const qualityIssues = this.identifyQualityIssues(validationResult);
      
      if (qualityIssues.length === 0) {
        console.log('✅ 수정이 필요한 품질 이슈가 없습니다');
        return fixReports;
      }

      console.log(`🔍 발견된 품질 이슈: ${qualityIssues.length}개`);

      // 2. 각 이슈별로 수정 방법 결정 및 적용
      for (const issue of qualityIssues) {
        const fixReport = await this.processQualityIssue(content, issue, context);
        if (fixReport) {
          fixReports.push(fixReport);
        }
      }

      // 3. 수정 결과 정리
      const totalProcessingTime = performance.now() - startTime;
      console.log(`🎯 품질 수정 완료: ${fixReports.length}개 이슈 처리 (${totalProcessingTime.toFixed(0)}ms)`);

      return fixReports;

    } catch (error) {
      console.error('❌ 품질 자동 수정 중 오류 발생:', error);
      return fixReports;
    }
  }

  /**
   * 🔍 품질 이슈 식별
   */
  private identifyQualityIssues(validationResult: QualityValidationResult): QualityIssue[] {
    const issues: QualityIssue[] = [];

    validationResult.stepResults.forEach(stepResult => {
      stepResult.details.forEach(detail => {
        if (detail.result === 'fail' || (detail.result === 'warning' && detail.score < 70)) {
          issues.push({
            stepNumber: stepResult.step,
            stepName: stepResult.name,
            checkId: detail.check,
            issueType: detail.check,
            severity: this.calculateSeverity(detail.score, stepResult.step),
            currentScore: detail.score,
            description: detail.message,
            suggestion: detail.suggestion || '',
            impact: this.calculateIssueImpact(stepResult.step, detail.score)
          });
        }
      });
    });

    // 영향도 순으로 정렬
    return issues.sort((a, b) => b.impact - a.impact);
  }

  /**
   * 🎯 개별 품질 이슈 처리
   */
  private async processQualityIssue(
    content: string,
    issue: QualityIssue,
    context: any
  ): Promise<QualityFixReport | null> {
    const startTime = performance.now();

    try {
      // 1. 수정 방법 결정
      const fixMethod = this.determineBestFixMethod(issue);

      let fixReport: QualityFixReport;

      switch (fixMethod) {
        case 'automatic':
          fixReport = await this.applyAutomaticFix(content, issue, context);
          break;
          
        case 'ab_test':
          fixReport = await this.runABTestFix(content, issue, context);
          break;
          
        default:
          // manual_review - 수동 검토 필요
          fixReport = {
            issueId: `${issue.stepNumber}_${issue.checkId}_${Date.now()}`,
            originalContent: content,
            fixedContent: content, // 수정 없음
            issueType: issue.issueType,
            severity: issue.severity,
            fixMethod: 'manual_review',
            qualityImprovement: 0,
            processingTime: performance.now() - startTime,
            confidence: 0
          };
          break;
      }

      // 2. 수정 이력에 추가
      this.fixHistory.push(fixReport);
      
      // 3. 최대 1000개 이력 유지
      if (this.fixHistory.length > 1000) {
        this.fixHistory = this.fixHistory.slice(-1000);
      }

      return fixReport;

    } catch (error) {
      console.error(`❌ 이슈 처리 중 오류 발생 [${issue.issueType}]:`, error);
      return null;
    }
  }

  /**
   * ⚡ 자동 수정 적용
   */
  private async applyAutomaticFix(
    content: string,
    issue: QualityIssue,
    context: any
  ): Promise<QualityFixReport> {
    console.log(`⚡ 자동 수정 적용: ${issue.issueType}`);

    // 자동 개선 엔진 사용
    const enhancementResult = await autoQualityEnhancer.enhanceContent(content, {
      culturalBackground: context.culturalBackground,
      userPersonality: context.userPersonality,
      targetDuration: context.targetDuration,
      contentType: context.contentType,
      targetScore: Math.max(85, issue.currentScore + 15) // 최소 85점 또는 현재 점수 + 15점
    });

    return {
      issueId: `${issue.stepNumber}_${issue.checkId}_${Date.now()}`,
      originalContent: content,
      fixedContent: enhancementResult.enhancedContent,
      issueType: issue.issueType,
      severity: issue.severity,
      fixMethod: 'automatic',
      qualityImprovement: enhancementResult.improvement,
      processingTime: enhancementResult.processingTime,
      confidence: this.calculateFixConfidence(enhancementResult)
    };
  }

  /**
   * 🧪 A/B 테스트 기반 수정
   */
  private async runABTestFix(
    content: string,
    issue: QualityIssue,
    context: any
  ): Promise<QualityFixReport> {
    console.log(`🧪 A/B 테스트 수정 시작: ${issue.issueType}`);

    // 1. 테스트 변형 생성
    const variants = await this.generateTestVariants(content, issue, context);
    
    // 2. A/B 테스트 구성
    const testConfig: ABTestConfig = {
      testName: `quality_fix_${issue.stepNumber}_${issue.checkId}_${Date.now()}`,
      originalContent: content,
      variants,
      trafficSplit: this.calculateOptimalTrafficSplit(variants.length),
      testDuration: QualityAutoFixer.DEFAULT_TEST_DURATION,
      minSampleSize: 100,
      confidenceLevel: 0.95
    };

    // 3. 테스트 시뮬레이션 (실제로는 실제 테스트 실행)
    const testResult = await this.simulateABTest(testConfig);

    return {
      issueId: `${issue.stepNumber}_${issue.checkId}_${Date.now()}`,
      originalContent: content,
      fixedContent: testResult.winner.content,
      issueType: issue.issueType,
      severity: issue.severity,
      fixMethod: 'ab_test',
      qualityImprovement: testResult.improvementRate,
      processingTime: 2000, // A/B 테스트는 일반적으로 더 오래 걸림
      confidence: testResult.statisticalSignificance,
      abTestResults: testResult
    };
  }

  /**
   * 🎯 테스트 변형 생성
   */
  private async generateTestVariants(
    content: string,
    issue: QualityIssue,
    context: any
  ): Promise<ContentVariant[]> {
    const variants: ContentVariant[] = [];

    // 원본 (컨트롤)
    variants.push({
      id: 'control',
      name: '원본',
      content: content
    });

    // 변형 1: 보수적 수정
    const conservativeFix = await this.applyConservativeFix(content, issue);
    variants.push({
      id: 'conservative',
      name: '보수적 수정',
      content: conservativeFix,
      enhancementStrategy: 'conservative_improvement',
      targetImprovement: 10
    });

    // 변형 2: 적극적 수정
    const aggressiveFix = await this.applyAggressiveFix(content, issue, context);
    variants.push({
      id: 'aggressive',
      name: '적극적 수정',
      content: aggressiveFix,
      enhancementStrategy: 'aggressive_improvement',
      targetImprovement: 25
    });

    // 변형 3: 맞춤형 수정 (필요시)
    if (context.userPersonality) {
      const personalizedFix = await this.applyPersonalizedFix(content, issue, context);
      variants.push({
        id: 'personalized',
        name: '맞춤형 수정',
        content: personalizedFix,
        enhancementStrategy: 'personalized_improvement',
        targetImprovement: 20
      });
    }

    return variants;
  }

  /**
   * 📊 A/B 테스트 시뮬레이션
   */
  private async simulateABTest(config: ABTestConfig): Promise<ABTestResult> {
    console.log(`📊 A/B 테스트 시뮬레이션: ${config.testName}`);

    // 실제로는 실제 사용자 트래픽으로 테스트하지만, 여기서는 시뮬레이션
    const results: VariantResult[] = [];

    for (let i = 0; i < config.variants.length; i++) {
      const variant = config.variants[i];
      
      // 시뮬레이션 데이터 생성
      const baseScore = variant.id === 'control' ? 75 : 
                       variant.id === 'conservative' ? 82 :
                       variant.id === 'aggressive' ? 88 :
                       85; // personalized

      const variance = (Math.random() - 0.5) * 10; // ±5점 변동
      const qualityScore = Math.max(60, Math.min(100, baseScore + variance));

      results.push({
        variant,
        sampleSize: Math.floor(config.minSampleSize * (1 + Math.random())), // 100-200 샘플
        qualityScore,
        userSatisfaction: qualityScore * 0.95, // 품질점수와 유사한 만족도
        completionRate: Math.max(0.6, qualityScore / 120), // 품질에 비례한 완료율
        engagementTime: Math.max(30, qualityScore * 2), // 품질에 비례한 참여시간
        conversionRate: Math.max(0.1, qualityScore / 200), // 품질에 비례한 전환율
        confidenceInterval: [qualityScore - 3, qualityScore + 3]
      });
    }

    // 승자 결정 (품질 점수 기준)
    const winner = results.reduce((prev, current) => 
      current.qualityScore > prev.qualityScore ? current : prev
    ).variant;

    // 통계적 유의성 계산 (간단화)
    const controlScore = results.find(r => r.variant.id === 'control')?.qualityScore || 75;
    const winnerScore = results.find(r => r.variant === winner)?.qualityScore || controlScore;
    const improvementRate = ((winnerScore - controlScore) / controlScore) * 100;
    
    const statisticalSignificance = Math.min(0.99, Math.max(0.5, 
      0.7 + (Math.abs(improvementRate) / 50) // 개선률에 비례한 유의성
    ));

    const recommendation: TestRecommendation = {
      action: statisticalSignificance >= 0.95 && improvementRate > 5 ? 'deploy' :
              statisticalSignificance >= 0.8 ? 'continue_testing' : 'redesign',
      confidence: statisticalSignificance,
      reasoning: `통계적 유의성: ${(statisticalSignificance * 100).toFixed(1)}%, 개선률: ${improvementRate.toFixed(1)}%`,
      expectedImpact: improvementRate / 100,
      risks: improvementRate > 20 ? ['과도한 변화로 인한 사용자 혼란'] : [],
      nextSteps: statisticalSignificance >= 0.95 ? 
        ['승리 변형 즉시 배포', '성과 모니터링'] :
        ['테스트 기간 연장', '추가 샘플 수집']
    };

    const testResult: ABTestResult = {
      testName: config.testName,
      winner,
      results,
      statisticalSignificance,
      improvementRate,
      recommendation,
      completedAt: Date.now()
    };

    // 테스트 결과 저장
    this.testResults.set(config.testName, testResult);

    return testResult;
  }

  /**
   * 🔧 보수적 수정
   */
  private async applyConservativeFix(content: string, issue: QualityIssue): Promise<string> {
    // 최소한의 안전한 수정만 적용
    let fixedContent = content;

    switch (issue.checkId) {
      case 'grammar_basic':
        // 기본적인 문법 오류만 수정
        fixedContent = fixedContent
          .replace(/이이/g, '이')
          .replace(/을를/g, '을');
        break;
        
      case 'spelling_check':
        // 확실한 맞춤법 오류만 수정
        fixedContent = fixedContent
          .replace(/되요/g, '돼요')
          .replace(/안되/g, '안 돼');
        break;
        
      case 'religious_sensitivity':
        // 명백히 문제가 되는 표현만 수정
        fixedContent = fixedContent
          .replace(/우상/g, '조각상')
          .replace(/미신/g, '전통 믿음');
        break;
    }

    return fixedContent;
  }

  /**
   * 🚀 적극적 수정
   */
  private async applyAggressiveFix(content: string, issue: QualityIssue, context: any): Promise<string> {
    // 자동 개선 엔진 사용하여 적극적 수정
    const enhancementResult = await autoQualityEnhancer.enhanceContent(content, {
      ...context,
      targetScore: Math.max(90, issue.currentScore + 20)
    });

    return enhancementResult.enhancedContent;
  }

  /**
   * 👤 맞춤형 수정
   */
  private async applyPersonalizedFix(content: string, issue: QualityIssue, context: any): Promise<string> {
    // 사용자 성격에 특화된 수정
    let personalizedContent = content;

    if (context.userPersonality) {
      const personalityAdjustments = {
        openness: { from: /일반적인/g, to: '독창적인' },
        conscientiousness: { from: /대충/g, to: '체계적으로' },
        extraversion: { from: /혼자/g, to: '함께' },
        agreeableness: { from: /경쟁적/g, to: '협력적' },
        neuroticism: { from: /위험한/g, to: '안전한' }
      };

      const adjustment = personalityAdjustments[context.userPersonality as keyof typeof personalityAdjustments];
      if (adjustment) {
        personalizedContent = personalizedContent.replace(adjustment.from, adjustment.to);
      }
    }

    return personalizedContent;
  }

  /**
   * 📊 최적 트래픽 분할 계산
   */
  private calculateOptimalTrafficSplit(variantCount: number): number[] {
    // 균등 분할이 기본
    const equalSplit = 1 / variantCount;
    return new Array(variantCount).fill(equalSplit);
  }

  /**
   * 🎯 최적 수정 방법 결정
   */
  private determineBestFixMethod(issue: QualityIssue): 'automatic' | 'ab_test' | 'manual_review' {
    // 심각도와 복잡성에 따른 방법 결정
    if (issue.severity === 'critical' || this.isSimpleFix(issue)) {
      return 'automatic';
    }
    
    if (issue.severity === 'high' || issue.severity === 'medium') {
      return 'ab_test';
    }
    
    return 'manual_review';
  }

  /**
   * 🔍 단순 수정 여부 판단
   */
  private isSimpleFix(issue: QualityIssue): boolean {
    const simpleFixes = [
      'grammar_basic',
      'spelling_check',
      'duplicate_sentences',
      'optimal_length'
    ];
    
    return simpleFixes.includes(issue.checkId);
  }

  /**
   * 📊 심각도 계산
   */
  private calculateSeverity(score: number, stepNumber: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score < 60) return 'critical';
    if (score < 70) return 'high';
    if (score < 80) return 'medium';
    return 'low';
  }

  /**
   * 📊 이슈 영향도 계산
   */
  private calculateIssueImpact(stepNumber: number, currentScore: number): number {
    const stepWeights = {
      1: 0.15,   // 문법
      2: 0.289,  // 정확성
      3: 0.234,  // 문화적 적절성
      4: 0.267,  // 스토리텔링
      5: 0.178,  // 개인화
      6: 0.08,   // 글자수
      7: 0.06,   // 중복
      8: 0.05    // 참여도
    };

    const weight = stepWeights[stepNumber as keyof typeof stepWeights] || 0.1;
    const scoreLoss = Math.max(0, 85 - currentScore); // 85점 기준 손실
    
    return weight * scoreLoss;
  }

  /**
   * 🎯 수정 신뢰도 계산
   */
  private calculateFixConfidence(enhancementResult: AutoEnhancementResult): number {
    // 개선 정도와 성공 여부 기반 신뢰도
    const improvementFactor = Math.min(1, enhancementResult.improvement / 30); // 30점 개선이 최대
    const successFactor = enhancementResult.success ? 1 : 0.3;
    const iterationFactor = Math.max(0.5, 1 - (enhancementResult.iterationCount / 10)); // 반복 횟수가 적을수록 높은 신뢰도

    return Math.min(0.99, (improvementFactor * 0.5 + successFactor * 0.3 + iterationFactor * 0.2));
  }

  /**
   * 📊 수정 통계 반환
   */
  public getFixStats(): {
    totalFixes: number;
    automaticFixes: number;
    abTestFixes: number;
    manualReviews: number;
    successRate: number;
    averageImprovement: number;
    averageProcessingTime: number;
  } {
    const totalFixes = this.fixHistory.length;
    const automaticFixes = this.fixHistory.filter(fix => fix.fixMethod === 'automatic').length;
    const abTestFixes = this.fixHistory.filter(fix => fix.fixMethod === 'ab_test').length;
    const manualReviews = this.fixHistory.filter(fix => fix.fixMethod === 'manual_review').length;
    
    const successfulFixes = this.fixHistory.filter(fix => fix.qualityImprovement > 0).length;
    const successRate = totalFixes > 0 ? successfulFixes / totalFixes : 0;
    
    const totalImprovement = this.fixHistory.reduce((sum, fix) => sum + fix.qualityImprovement, 0);
    const averageImprovement = totalFixes > 0 ? totalImprovement / totalFixes : 0;
    
    const totalProcessingTime = this.fixHistory.reduce((sum, fix) => sum + fix.processingTime, 0);
    const averageProcessingTime = totalFixes > 0 ? totalProcessingTime / totalFixes : 0;

    return {
      totalFixes,
      automaticFixes,
      abTestFixes,
      manualReviews,
      successRate,
      averageImprovement,
      averageProcessingTime
    };
  }
}

interface QualityIssue {
  stepNumber: number;
  stepName: string;
  checkId: string;
  issueType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  currentScore: number;
  description: string;
  suggestion: string;
  impact: number;
}

/**
 * 🚀 전역 품질 자동 수정 엔진 인스턴스
 */
export const qualityAutoFixer = new QualityAutoFixer();
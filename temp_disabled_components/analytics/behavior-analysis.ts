// 🧠 사용자 행동 패턴 분석 시스템
// Phase 1 Task 1.1: 행동 데이터 → Big5 성격 자동 분류 알고리즘

import { PersonalityIndicators } from './user-behavior-tracker';

interface BehaviorAnalysisResult {
  personalityType: Big5PersonalityType;
  confidence: number;
  reasoning: PersonalityReasoning;
  recommendations: PersonalizationRecommendations;
  behaviorInsights: BehaviorInsights;
}

interface Big5PersonalityType {
  primary: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  confidence: number;
}

interface PersonalityReasoning {
  primary_indicators: string[];
  supporting_evidence: string[];
  behavioral_patterns: string[];
  confidence_factors: string[];
}

interface PersonalizationRecommendations {
  communication_style: 'friendly' | 'professional' | 'storytelling' | 'local_guide';
  content_pace: 'slow' | 'normal' | 'fast';
  information_depth: 'surface' | 'moderate' | 'deep' | 'expert';
  interaction_style: string[];
  content_structure: string[];
}

interface BehaviorInsights {
  attention_span: number; // 초 단위
  exploration_tendency: number; // 0-1 scale
  decision_speed: number; // 빠름/느림 지표
  information_processing: 'sequential' | 'parallel' | 'mixed';
  stress_indicators: number; // 0-1 scale
}

/**
 * 🔍 행동 패턴 분석 엔진
 */
export class BehaviorAnalysisEngine {
  
  /**
   * 📊 메인 분석 함수: 행동 데이터 → 성격 분석
   */
  public static analyzeBehaviorPattern(behaviorData: any): BehaviorAnalysisResult {
    console.log('🧠 사용자 행동 패턴 분석 시작...');
    
    // 1. 기본 지표 계산
    const personalityScores = this.calculatePersonalityScores(behaviorData);
    
    // 2. 주성격 타입 결정
    const personalityType = this.determinePrimaryPersonality(personalityScores);
    
    // 3. 신뢰도 계산
    const confidence = this.calculateAnalysisConfidence(behaviorData, personalityScores);
    
    // 4. 추론 근거 생성
    const reasoning = this.generateReasoning(behaviorData, personalityType);
    
    // 5. 개인화 추천 생성
    const recommendations = this.generateRecommendations(personalityType);
    
    // 6. 행동 인사이트 분석
    const behaviorInsights = this.analyzeBehaviorInsights(behaviorData);
    
    const result: BehaviorAnalysisResult = {
      personalityType,
      confidence,
      reasoning,
      recommendations,
      behaviorInsights
    };
    
    console.log('✅ 행동 패턴 분석 완료:', personalityType.primary, `(${(confidence * 100).toFixed(1)}%)`);
    return result;
  }

  /**
   * 📈 Big5 성격 점수 계산
   */
  private static calculatePersonalityScores(behaviorData: any): PersonalityIndicators {
    const clickPattern = behaviorData.clickPattern || [];
    const dwellTime = behaviorData.dwellTime || [];
    const scrollPattern = behaviorData.scrollPattern || [];
    const selectionPattern = behaviorData.selectionPattern || [];
    
    return {
      openness: this.calculateOpenness(behaviorData),
      conscientiousness: this.calculateConscientiousness(behaviorData),
      extraversion: this.calculateExtraversion(behaviorData),
      agreeableness: this.calculateAgreeableness(behaviorData),
      neuroticism: this.calculateNeuroticism(behaviorData),
      confidence: this.calculateOverallConfidence(behaviorData)
    };
  }

  /**
   * 🔍 개방성 분석
   */
  private static calculateOpenness(data: any): number {
    let score = 0.5; // 기본값
    
    // 탐색 행동 분석
    if (data.explorationBehavior) {
      const explorationRatio = data.explorationBehavior.uniqueElements / 
                              Math.max(data.explorationBehavior.totalClicks, 1);
      score += explorationRatio * 0.3;
      
      // 메뉴 탐색 빈도
      const menuExplorationScore = Math.min(data.explorationBehavior.menuExploration / 10, 0.2);
      score += menuExplorationScore;
    }
    
    // 스크롤 패턴 분석 (호기심 지표)
    if (data.scrollPattern?.length > 0) {
      const avgScrollSpeed = this.calculateAverageScrollSpeed(data.scrollPattern);
      const speedScore = Math.min(avgScrollSpeed / 200, 0.2); // 빠른 스크롤 = 호기심
      score += speedScore;
      
      // 스크롤 다양성
      const scrollVariety = this.calculateScrollVariety(data.scrollPattern);
      score += scrollVariety * 0.1;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * 📋 성실성 분석
   */
  private static calculateConscientiousness(data: any): number {
    let score = 0.5;
    
    // 체류 시간 분석 (집중력 지표)
    if (data.dwellTime?.length > 0) {
      const avgDwellTime = data.dwellTime.reduce((sum: number, d: any) => sum + d.duration, 0) / 
                          data.dwellTime.length;
      const dwellScore = Math.min(avgDwellTime / 30000, 0.3); // 30초 이상은 집중력 높음
      score += dwellScore;
      
      // 체류 시간 일관성
      const consistency = this.calculateDwellTimeConsistency(data.dwellTime);
      score += consistency * 0.2;
    }
    
    // 뒤로가기 빈도 (체계성 지표)
    if (data.explorationBehavior) {
      const backtrackRatio = data.explorationBehavior.backtrackCount / 
                            Math.max(data.clickPattern?.length || 1, 1);
      const systematicScore = Math.max(0, 0.2 - backtrackRatio * 0.5); // 뒤로가기 적을수록 체계적
      score += systematicScore;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * 🎉 외향성 분석  
   */
  private static calculateExtraversion(data: any): number {
    let score = 0.5;
    
    // 응답 시간 분석 (빠른 반응 = 외향성)
    if (data.responseTime?.length > 0) {
      const avgResponseTime = data.responseTime.reduce((sum: number, t: number) => sum + t, 0) / 
                             data.responseTime.length;
      const speedScore = Math.max(0, 0.3 - avgResponseTime / 10000); // 10초 이내 = 외향적
      score += speedScore;
    }
    
    // 클릭 빈도 (활발함 지표)
    if (data.clickPattern?.length > 0) {
      const sessionDuration = this.getSessionDuration(data);
      const clickFrequency = data.clickPattern.length / Math.max(sessionDuration / 1000, 1);
      const frequencyScore = Math.min(clickFrequency / 0.1, 0.2); // 0.1 클릭/초 기준
      score += frequencyScore;
    }
    
    // 상호작용 다양성
    if (data.clickPattern?.length > 0) {
      const interactionTypes = this.getUniqueInteractionTypes(data.clickPattern);
      const varietyScore = Math.min(interactionTypes.length / 5, 0.2);
      score += varietyScore;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * 🤝 친화성 분석
   */
  private static calculateAgreeableness(data: any): number {
    let score = 0.5;
    
    // 부드러운 상호작용 패턴 분석
    if (data.scrollPattern?.length > 0) {
      const scrollSmoothness = this.calculateScrollSmoothness(data.scrollPattern);
      score += scrollSmoothness * 0.3;
    }
    
    // 결정 안정성 (마음 바꾸기 빈도)
    if (data.selectionPattern?.length > 0) {
      const mindChanges = data.selectionPattern.filter((s: any) => s.changedMind).length;
      const mindChangeRatio = mindChanges / data.selectionPattern.length;
      const stabilityScore = Math.max(0, 0.2 - mindChangeRatio * 0.4);
      score += stabilityScore;
    }
    
    // 인내심 지표 (긴 체류 시간)
    if (data.dwellTime?.length > 0) {
      const avgDwellTime = data.dwellTime.reduce((sum: number, d: any) => sum + d.duration, 0) / 
                          data.dwellTime.length;
      const patienceScore = Math.min(avgDwellTime / 25000, 0.2); // 25초 이상 = 인내심
      score += patienceScore;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * 😰 신경증 분석
   */
  private static calculateNeuroticism(data: any): number {
    let score = 0.3; // 기본적으로 낮게 설정
    
    // 포커스 불안정성
    if (data.attentionPattern) {
      const focusInstability = data.attentionPattern.blurEvents / 
                              Math.max(data.attentionPattern.focusEvents, 1);
      score += Math.min(focusInstability, 0.3);
      
      // 멀티태스킹 지표
      const multitaskingScore = Math.min(data.attentionPattern.multitaskingIndicator / 10, 0.2);
      score += multitaskingScore;
    }
    
    // 응답 시간 변동성 (불안정성 지표)
    if (data.responseTime?.length > 2) {
      const variability = this.calculateResponseTimeVariability(data.responseTime);
      score += Math.min(variability, 0.3);
    }
    
    // 뒤로가기 빈도 (불안감 지표)
    if (data.explorationBehavior) {
      const backtrackRatio = data.explorationBehavior.backtrackCount / 
                            Math.max(data.clickPattern?.length || 1, 1);
      score += Math.min(backtrackRatio * 2, 0.2);
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * 🎯 주성격 타입 결정
   */
  private static determinePrimaryPersonality(scores: PersonalityIndicators): Big5PersonalityType {
    const scoreEntries = [
      ['openness', scores.openness],
      ['conscientiousness', scores.conscientiousness], 
      ['extraversion', scores.extraversion],
      ['agreeableness', scores.agreeableness],
      ['neuroticism', scores.neuroticism]
    ] as [string, number][];
    
    // 최고 점수 찾기
    const [primaryType, primaryScore] = scoreEntries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    // 신뢰도 계산 (1위와 2위 점수 차이로)
    const sortedScores = scoreEntries.sort((a, b) => b[1] - a[1]);
    const confidence = Math.min(1, (sortedScores[0][1] - sortedScores[1][1]) * 2 + 0.5);
    
    return {
      primary: primaryType as any,
      scores: {
        openness: scores.openness,
        conscientiousness: scores.conscientiousness,
        extraversion: scores.extraversion,
        agreeableness: scores.agreeableness,
        neuroticism: scores.neuroticism
      },
      confidence
    };
  }

  /**
   * 🔍 분석 신뢰도 계산
   */
  private static calculateAnalysisConfidence(data: any, scores: PersonalityIndicators): number {
    let confidence = 0.5;
    
    // 데이터 양 기반 신뢰도
    const dataPoints = (data.clickPattern?.length || 0) + 
                      (data.dwellTime?.length || 0) + 
                      (data.scrollPattern?.length || 0);
    const dataQuality = Math.min(dataPoints / 50, 0.3); // 50개 이상 = 고품질
    confidence += dataQuality;
    
    // 행동 일관성 기반 신뢰도
    const consistency = this.calculateBehaviorConsistency(data);
    confidence += consistency * 0.2;
    
    return Math.min(1, Math.max(0.3, confidence));
  }

  /**
   * 💡 추론 근거 생성
   */
  private static generateReasoning(data: any, personality: Big5PersonalityType): PersonalityReasoning {
    const primaryType = personality.primary;
    const score = personality.scores[primaryType];
    
    return {
      primary_indicators: this.getPrimaryIndicators(primaryType, data),
      supporting_evidence: this.getSupportingEvidence(primaryType, data),
      behavioral_patterns: this.getBehavioralPatterns(primaryType, data),
      confidence_factors: this.getConfidenceFactors(data, score)
    };
  }

  /**
   * 🎯 개인화 추천 생성
   */
  private static generateRecommendations(personality: Big5PersonalityType): PersonalizationRecommendations {
    const type = personality.primary;
    
    const recommendations = {
      openness: {
        communication_style: 'storytelling' as const,
        content_pace: 'normal' as const,
        information_depth: 'deep' as const,
        interaction_style: ['창의적 해석', '새로운 관점', '예술적 연결'],
        content_structure: ['호기심 유발', '다양한 시각', '상상력 자극']
      },
      conscientiousness: {
        communication_style: 'professional' as const,
        content_pace: 'normal' as const,
        information_depth: 'expert' as const,
        interaction_style: ['체계적 설명', '정확한 데이터', '실용적 정보'],
        content_structure: ['순서대로 설명', '논리적 구조', '검증된 사실']
      },
      extraversion: {
        communication_style: 'friendly' as const,
        content_pace: 'fast' as const,
        information_depth: 'moderate' as const,
        interaction_style: ['활기찬 톤', '상호작용적', '에너지 넘침'],
        content_structure: ['빠른 전개', '흥미 요소', '참여 유도']
      },
      agreeableness: {
        communication_style: 'friendly' as const,
        content_pace: 'slow' as const,
        information_depth: 'moderate' as const,
        interaction_style: ['부드러운 톤', '배려적 접근', '조화로운 관점'],
        content_structure: ['평화로운 설명', '공감적 서술', '포용적 내용']
      },
      neuroticism: {
        communication_style: 'local_guide' as const,
        content_pace: 'slow' as const,
        information_depth: 'surface' as const,
        interaction_style: ['안정감 있는 톤', '안전 정보', '스트레스 최소화'],
        content_structure: ['차분한 설명', '안심시키는 내용', '편안한 분위기']
      }
    };
    
    return recommendations[type];
  }

  /**
   * 🧠 행동 인사이트 분석
   */
  private static analyzeBehaviorInsights(data: any): BehaviorInsights {
    return {
      attention_span: this.calculateAttentionSpan(data),
      exploration_tendency: this.calculateExplorationTendency(data),
      decision_speed: this.calculateDecisionSpeed(data),
      information_processing: this.determineProcessingStyle(data),
      stress_indicators: this.calculateStressIndicators(data)
    };
  }

  /**
   * 🔧 헬퍼 메서드들
   */
  private static calculateAverageScrollSpeed(scrollData: any[]): number {
    if (!scrollData.length) return 0;
    return scrollData.reduce((sum, s) => sum + (s.scrollSpeed || 0), 0) / scrollData.length;
  }

  private static calculateScrollVariety(scrollData: any[]): number {
    const speeds = scrollData.map(s => s.scrollSpeed || 0);
    const uniqueSpeeds = new Set(speeds.map(s => Math.round(s / 10) * 10)).size;
    return Math.min(uniqueSpeeds / 10, 1);
  }

  private static calculateDwellTimeConsistency(dwellData: any[]): number {
    if (!dwellData.length) return 0;
    const durations = dwellData.map(d => d.duration);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    return Math.max(0, 1 - Math.sqrt(variance) / mean);
  }

  private static getSessionDuration(data: any): number {
    if (!data.timestamp) return 60000; // 기본값 1분
    return Date.now() - data.timestamp;
  }

  private static getUniqueInteractionTypes(clickData: any[]): string[] {
    return [...new Set(clickData.map(c => c.elementType || 'unknown'))];
  }

  private static calculateScrollSmoothness(scrollData: any[]): number {
    if (!scrollData.length) return 0.5;
    // 스크롤 속도 변화의 부드러움 계산
    let smoothness = 0;
    for (let i = 1; i < scrollData.length; i++) {
      const speedDiff = Math.abs((scrollData[i].scrollSpeed || 0) - (scrollData[i-1].scrollSpeed || 0));
      smoothness += Math.max(0, 1 - speedDiff / 100);
    }
    return smoothness / Math.max(scrollData.length - 1, 1);
  }

  private static calculateResponseTimeVariability(responseTimes: number[]): number {
    if (responseTimes.length < 2) return 0;
    const mean = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / responseTimes.length;
    return Math.min(Math.sqrt(variance) / mean, 1);
  }

  private static calculateBehaviorConsistency(data: any): number {
    // 여러 지표의 일관성을 종합 평가
    let consistency = 0.5;
    
    if (data.dwellTime?.length > 1) {
      consistency += this.calculateDwellTimeConsistency(data.dwellTime) * 0.3;
    }
    
    if (data.responseTime?.length > 1) {
      const rtConsistency = 1 - this.calculateResponseTimeVariability(data.responseTime);
      consistency += rtConsistency * 0.2;
    }
    
    return Math.min(1, consistency);
  }

  // 추가 헬퍼 메서드들...
  private static getPrimaryIndicators(type: string, data: any): string[] {
    const indicators = {
      openness: ['높은 탐색 빈도', '다양한 메뉴 접근', '빠른 스크롤'],
      conscientiousness: ['일정한 체류 시간', '체계적 탐색', '낮은 뒤로가기 빈도'],
      extraversion: ['빠른 응답 시간', '높은 클릭 빈도', '다양한 상호작용'],
      agreeableness: ['부드러운 스크롤', '안정적 결정', '긴 체류 시간'],
      neuroticism: ['불안정한 포커스', '높은 응답 시간 변동', '잦은 뒤로가기']
    };
    return indicators[type] || [];
  }

  private static getSupportingEvidence(type: string, data: any): string[] {
    // 구체적인 수치 증거 제공
    return [`데이터 포인트: ${(data.clickPattern?.length || 0) + (data.dwellTime?.length || 0)}개`];
  }

  private static getBehavioralPatterns(type: string, data: any): string[] {
    // 관찰된 행동 패턴 설명
    return ['일관된 탐색 패턴', '예측 가능한 상호작용'];
  }

  private static getConfidenceFactors(data: any, score: number): string[] {
    const factors = [];
    if (score > 0.7) factors.push('강한 성격 특성 표출');
    if ((data.clickPattern?.length || 0) > 20) factors.push('충분한 데이터 수집');
    return factors;
  }

  private static calculateAttentionSpan(data: any): number {
    if (!data.dwellTime?.length) return 120; // 기본값 2분
    return data.dwellTime.reduce((sum: number, d: any) => sum + d.duration, 0) / 
           (data.dwellTime.length * 1000); // 초 단위로 변환
  }

  private static calculateExplorationTendency(data: any): number {
    if (!data.explorationBehavior) return 0.5;
    return Math.min(data.explorationBehavior.uniqueElements / 
                   Math.max(data.explorationBehavior.totalClicks, 1), 1);
  }

  private static calculateDecisionSpeed(data: any): number {
    if (!data.responseTime?.length) return 0.5;
    const avgTime = data.responseTime.reduce((sum: number, t: number) => sum + t, 0) / 
                   data.responseTime.length;
    return Math.max(0, 1 - avgTime / 10000); // 10초 기준
  }

  private static determineProcessingStyle(data: any): 'sequential' | 'parallel' | 'mixed' {
    // 행동 패턴으로 정보 처리 스타일 추론
    const backtrackRatio = (data.explorationBehavior?.backtrackCount || 0) / 
                          Math.max(data.clickPattern?.length || 1, 1);
    
    if (backtrackRatio < 0.1) return 'sequential';
    if (backtrackRatio > 0.3) return 'parallel';
    return 'mixed';
  }

  private static calculateStressIndicators(data: any): number {
    let stress = 0;
    
    if (data.attentionPattern?.blurEvents > 5) stress += 0.3;
    if (data.explorationBehavior?.backtrackCount > 5) stress += 0.2;
    if (data.responseTime?.some((t: number) => t > 15000)) stress += 0.2;
    
    return Math.min(1, stress);
  }
}

/**
 * 🚀 간편 사용 함수
 */
export function analyzeBehaviorAndGetPersonality(behaviorData: any): BehaviorAnalysisResult {
  return BehaviorAnalysisEngine.analyzeBehaviorPattern(behaviorData);
}
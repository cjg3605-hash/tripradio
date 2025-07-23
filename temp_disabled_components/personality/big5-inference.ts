// 🧠 Big5 성격 추론 시스템
// Phase 1 Task 1.2: 행동 데이터 → Big5 성격 자동 분류 고도화 알고리즘

import { PersonalityIndicators } from '../analytics/user-behavior-tracker';
import { BehaviorAnalysisResult } from '../analytics/behavior-analysis';

interface Big5InferenceResult {
  personality: Big5Profile;
  confidence: number;
  reasoning: InferenceReasoning;
  adaptations: PersonalityAdaptations;
  reliability: ReliabilityMetrics;
}

interface Big5Profile {
  openness: PersonalityTrait;
  conscientiousness: PersonalityTrait;
  extraversion: PersonalityTrait;
  agreeableness: PersonalityTrait;
  neuroticism: PersonalityTrait;
  dominant: keyof Big5Profile;
  secondary: keyof Big5Profile;
}

interface PersonalityTrait {
  score: number; // 0-1 scale
  level: 'very_low' | 'low' | 'average' | 'high' | 'very_high';
  confidence: number;
  indicators: string[];
  behavioral_evidence: BehavioralEvidence[];
}

interface BehavioralEvidence {
  behavior: string;
  strength: number; // 증거의 강도
  weight: number; // 해당 성격에 대한 가중치
  observation: string;
}

interface InferenceReasoning {
  primary_factors: ReasoningFactor[];
  secondary_factors: ReasoningFactor[];
  contradictory_evidence: string[];
  overall_assessment: string;
}

interface ReasoningFactor {
  factor: string;
  evidence: string;
  weight: number;
  contribution: number;
}

interface PersonalityAdaptations {
  communication_style: CommunicationStyle;
  content_preferences: ContentPreferences;
  interaction_patterns: InteractionPatterns;
  learning_style: LearningStyle;
}

interface CommunicationStyle {
  tone: 'formal' | 'casual' | 'warm' | 'professional' | 'enthusiastic';
  pace: 'slow' | 'moderate' | 'fast' | 'variable';
  directness: 'indirect' | 'balanced' | 'direct';
  emotional_resonance: 'low' | 'moderate' | 'high';
}

interface ContentPreferences {
  depth: 'overview' | 'moderate' | 'detailed' | 'expert';
  structure: 'linear' | 'branching' | 'exploratory';
  emphasis: 'facts' | 'stories' | 'experiences' | 'connections';
  novelty: 'familiar' | 'mixed' | 'novel';
}

interface InteractionPatterns {
  response_expectation: 'immediate' | 'considered' | 'flexible';
  feedback_frequency: 'minimal' | 'regular' | 'constant';
  complexity_tolerance: 'low' | 'medium' | 'high';
  uncertainty_comfort: 'low' | 'medium' | 'high';
}

interface LearningStyle {
  processing: 'sequential' | 'global' | 'mixed';
  input_preference: 'visual' | 'auditory' | 'kinesthetic' | 'multimodal';
  retention_strategy: 'repetition' | 'elaboration' | 'organization';
}

interface ReliabilityMetrics {
  data_sufficiency: number; // 데이터의 충분성
  consistency_score: number; // 행동의 일관성
  temporal_stability: number; // 시간적 안정성
  cross_validation: number; // 교차 검증 점수
  overall_reliability: number;
}

/**
 * 🎯 Big5 성격 추론 엔진
 */
export class Big5InferenceEngine {
  
  // 가중치 시스템 (연구 기반 조정된 값들)
  private static readonly BEHAVIOR_WEIGHTS = {
    // 개방성 지표들
    openness: {
      exploration_ratio: 0.25,
      menu_exploration: 0.20,
      scroll_variety: 0.15,
      content_depth_preference: 0.20,
      novelty_seeking: 0.20
    },
    
    // 성실성 지표들
    conscientiousness: {
      dwell_time_consistency: 0.30,
      systematic_navigation: 0.25,
      task_completion: 0.20,
      attention_focus: 0.25
    },
    
    // 외향성 지표들
    extraversion: {
      response_speed: 0.30,
      interaction_frequency: 0.25,
      social_content_preference: 0.20,
      activity_level: 0.25
    },
    
    // 친화성 지표들
    agreeableness: {
      interaction_smoothness: 0.30,
      decision_stability: 0.25,
      patience_indicators: 0.25,
      cooperative_behaviors: 0.20
    },
    
    // 신경증 지표들
    neuroticism: {
      focus_instability: 0.30,
      response_variability: 0.25,
      stress_indicators: 0.25,
      uncertainty_avoidance: 0.20
    }
  };

  /**
   * 🎯 메인 추론 함수
   */
  public static inferBig5Personality(behaviorData: any): Big5InferenceResult {
    console.log('🧠 Big5 성격 추론 시작...');
    
    // 1. 각 성격 특성별 상세 분석
    const personalityProfile = this.calculateDetailedPersonality(behaviorData);
    
    // 2. 전체 신뢰도 계산
    const confidence = this.calculateOverallConfidence(behaviorData, personalityProfile);
    
    // 3. 추론 근거 생성
    const reasoning = this.generateInferenceReasoning(behaviorData, personalityProfile);
    
    // 4. 개인화 적응 전략 생성
    const adaptations = this.generatePersonalityAdaptations(personalityProfile);
    
    // 5. 신뢰도 메트릭 계산
    const reliability = this.calculateReliabilityMetrics(behaviorData);
    
    const result: Big5InferenceResult = {
      personality: personalityProfile,
      confidence,
      reasoning,
      adaptations,
      reliability
    };
    
    console.log('✅ Big5 성격 추론 완료:', personalityProfile.dominant, `(${(confidence * 100).toFixed(1)}%)`);
    return result;
  }

  /**
   * 📊 상세 성격 프로필 계산
   */
  private static calculateDetailedPersonality(behaviorData: any): Big5Profile {
    const traits = {
      openness: this.analyzeOpenness(behaviorData),
      conscientiousness: this.analyzeConscientiousness(behaviorData),
      extraversion: this.analyzeExtraversion(behaviorData),
      agreeableness: this.analyzeAgreeableness(behaviorData),
      neuroticism: this.analyzeNeuroticism(behaviorData)
    };
    
    // 주요 성격과 부차적 성격 결정
    const sortedTraits = Object.entries(traits)
      .sort(([,a], [,b]) => b.score - a.score);
    
    return {
      ...traits,
      dominant: sortedTraits[0][0] as keyof Big5Profile,
      secondary: sortedTraits[1][0] as keyof Big5Profile
    };
  }

  /**
   * 🔍 개방성 상세 분석
   */
  private static analyzeOpenness(data: any): PersonalityTrait {
    const evidences: BehavioralEvidence[] = [];
    let score = 0.5; // 기본값
    
    // 탐색 행동 분석
    if (data.explorationBehavior) {
      const explorationRatio = data.explorationBehavior.uniqueElements / 
                              Math.max(data.explorationBehavior.totalClicks, 1);
      const explorationScore = explorationRatio * this.BEHAVIOR_WEIGHTS.openness.exploration_ratio;
      score += explorationScore;
      
      evidences.push({
        behavior: '탐색 비율',
        strength: explorationRatio,
        weight: this.BEHAVIOR_WEIGHTS.openness.exploration_ratio,
        observation: `${(explorationRatio * 100).toFixed(1)}%의 요소를 탐색`
      });
    }
    
    // 메뉴 탐색 분석
    if (data.explorationBehavior?.menuExploration > 0) {
      const menuScore = Math.min(data.explorationBehavior.menuExploration / 10, 1) * 
                       this.BEHAVIOR_WEIGHTS.openness.menu_exploration;
      score += menuScore;
      
      evidences.push({
        behavior: '메뉴 탐색',
        strength: data.explorationBehavior.menuExploration / 10,
        weight: this.BEHAVIOR_WEIGHTS.openness.menu_exploration,
        observation: `${data.explorationBehavior.menuExploration}회 메뉴 탐색`
      });
    }
    
    // 스크롤 다양성 분석
    if (data.scrollPattern?.length > 0) {
      const scrollVariety = this.calculateScrollVariety(data.scrollPattern);
      const varietyScore = scrollVariety * this.BEHAVIOR_WEIGHTS.openness.scroll_variety;
      score += varietyScore;
      
      evidences.push({
        behavior: '스크롤 다양성',
        strength: scrollVariety,
        weight: this.BEHAVIOR_WEIGHTS.openness.scroll_variety,
        observation: `다양한 스크롤 패턴 (${(scrollVariety * 100).toFixed(1)}%)`
      });
    }
    
    // 점수 정규화
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateTraitConfidence(evidences),
      indicators: this.getOpennessIndicators(score),
      behavioral_evidence: evidences
    };
  }

  /**
   * 📋 성실성 상세 분석
   */
  private static analyzeConscientiousness(data: any): PersonalityTrait {
    const evidences: BehavioralEvidence[] = [];
    let score = 0.5;
    
    // 체류 시간 일관성
    if (data.dwellTime?.length > 1) {
      const consistency = this.calculateDwellTimeConsistency(data.dwellTime);
      const consistencyScore = consistency * this.BEHAVIOR_WEIGHTS.conscientiousness.dwell_time_consistency;
      score += consistencyScore;
      
      evidences.push({
        behavior: '체류 시간 일관성',
        strength: consistency,
        weight: this.BEHAVIOR_WEIGHTS.conscientiousness.dwell_time_consistency,
        observation: `${(consistency * 100).toFixed(1)}% 일관성`
      });
    }
    
    // 체계적 탐색 분석
    if (data.explorationBehavior) {
      const backtrackRatio = data.explorationBehavior.backtrackCount / 
                            Math.max(data.clickPattern?.length || 1, 1);
      const systematicScore = Math.max(0, (1 - backtrackRatio * 2)) * 
                             this.BEHAVIOR_WEIGHTS.conscientiousness.systematic_navigation;
      score += systematicScore;
      
      evidences.push({
        behavior: '체계적 탐색',
        strength: 1 - backtrackRatio,
        weight: this.BEHAVIOR_WEIGHTS.conscientiousness.systematic_navigation,
        observation: `${(backtrackRatio * 100).toFixed(1)}% 뒤로가기 비율`
      });
    }
    
    // 주의 집중도
    if (data.attentionPattern) {
      const focusRatio = data.attentionPattern.focusEvents / 
                        Math.max(data.attentionPattern.focusEvents + data.attentionPattern.blurEvents, 1);
      const focusScore = focusRatio * this.BEHAVIOR_WEIGHTS.conscientiousness.attention_focus;
      score += focusScore;
      
      evidences.push({
        behavior: '주의 집중도',
        strength: focusRatio,
        weight: this.BEHAVIOR_WEIGHTS.conscientiousness.attention_focus,
        observation: `${(focusRatio * 100).toFixed(1)}% 집중 비율`
      });
    }
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateTraitConfidence(evidences),
      indicators: this.getConscientiousnessIndicators(score),
      behavioral_evidence: evidences
    };
  }

  /**
   * 🎉 외향성 상세 분석
   */
  private static analyzeExtraversion(data: any): PersonalityTrait {
    const evidences: BehavioralEvidence[] = [];
    let score = 0.5;
    
    // 응답 속도 분석
    if (data.responseTime?.length > 0) {
      const avgResponseTime = data.responseTime.reduce((sum: number, t: number) => sum + t, 0) / 
                             data.responseTime.length;
      const speedScore = Math.max(0, (1 - avgResponseTime / 8000)) * 
                        this.BEHAVIOR_WEIGHTS.extraversion.response_speed;
      score += speedScore;
      
      evidences.push({
        behavior: '응답 속도',
        strength: Math.max(0, 1 - avgResponseTime / 8000),
        weight: this.BEHAVIOR_WEIGHTS.extraversion.response_speed,
        observation: `평균 ${(avgResponseTime / 1000).toFixed(1)}초 응답`
      });
    }
    
    // 상호작용 빈도
    if (data.clickPattern?.length > 0) {
      const sessionDuration = this.getSessionDuration(data);
      const interactionRate = data.clickPattern.length / Math.max(sessionDuration / 60000, 1); // 분당 클릭
      const rateScore = Math.min(interactionRate / 5, 1) * 
                       this.BEHAVIOR_WEIGHTS.extraversion.interaction_frequency;
      score += rateScore;
      
      evidences.push({
        behavior: '상호작용 빈도',
        strength: Math.min(interactionRate / 5, 1),
        weight: this.BEHAVIOR_WEIGHTS.extraversion.interaction_frequency,
        observation: `분당 ${interactionRate.toFixed(1)}회 상호작용`
      });
    }
    
    // 활동 수준
    const activityLevel = this.calculateActivityLevel(data);
    const activityScore = activityLevel * this.BEHAVIOR_WEIGHTS.extraversion.activity_level;
    score += activityScore;
    
    evidences.push({
      behavior: '활동 수준',
      strength: activityLevel,
      weight: this.BEHAVIOR_WEIGHTS.extraversion.activity_level,
      observation: `${(activityLevel * 100).toFixed(1)}% 활동 수준`
    });
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateTraitConfidence(evidences),
      indicators: this.getExtraversionIndicators(score),
      behavioral_evidence: evidences
    };
  }

  /**
   * 🤝 친화성 상세 분석
   */
  private static analyzeAgreeableness(data: any): PersonalityTrait {
    const evidences: BehavioralEvidence[] = [];
    let score = 0.5;
    
    // 상호작용 부드러움
    if (data.scrollPattern?.length > 0) {
      const smoothness = this.calculateScrollSmoothness(data.scrollPattern);
      const smoothnessScore = smoothness * this.BEHAVIOR_WEIGHTS.agreeableness.interaction_smoothness;
      score += smoothnessScore;
      
      evidences.push({
        behavior: '상호작용 부드러움',
        strength: smoothness,
        weight: this.BEHAVIOR_WEIGHTS.agreeableness.interaction_smoothness,
        observation: `${(smoothness * 100).toFixed(1)}% 부드러운 스크롤`
      });
    }
    
    // 결정 안정성
    if (data.selectionPattern?.length > 0) {
      const mindChanges = data.selectionPattern.filter((s: any) => s.changedMind).length;
      const stability = 1 - (mindChanges / data.selectionPattern.length);
      const stabilityScore = stability * this.BEHAVIOR_WEIGHTS.agreeableness.decision_stability;
      score += stabilityScore;
      
      evidences.push({
        behavior: '결정 안정성',
        strength: stability,
        weight: this.BEHAVIOR_WEIGHTS.agreeableness.decision_stability,
        observation: `${(stability * 100).toFixed(1)}% 안정적 결정`
      });
    }
    
    // 인내심 지표
    if (data.dwellTime?.length > 0) {
      const avgDwellTime = data.dwellTime.reduce((sum: number, d: any) => sum + d.duration, 0) / 
                          data.dwellTime.length;
      const patience = Math.min(avgDwellTime / 30000, 1); // 30초 기준
      const patienceScore = patience * this.BEHAVIOR_WEIGHTS.agreeableness.patience_indicators;
      score += patienceScore;
      
      evidences.push({
        behavior: '인내심',
        strength: patience,
        weight: this.BEHAVIOR_WEIGHTS.agreeableness.patience_indicators,
        observation: `평균 ${(avgDwellTime / 1000).toFixed(1)}초 체류`
      });
    }
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateTraitConfidence(evidences),
      indicators: this.getAgreeablenessIndicators(score),
      behavioral_evidence: evidences
    };
  }

  /**
   * 😰 신경증 상세 분석
   */
  private static analyzeNeuroticism(data: any): PersonalityTrait {
    const evidences: BehavioralEvidence[] = [];
    let score = 0.2; // 기본적으로 낮게 설정
    
    // 포커스 불안정성
    if (data.attentionPattern) {
      const instability = data.attentionPattern.blurEvents / 
                         Math.max(data.attentionPattern.focusEvents + data.attentionPattern.blurEvents, 1);
      const instabilityScore = instability * this.BEHAVIOR_WEIGHTS.neuroticism.focus_instability;
      score += instabilityScore;
      
      evidences.push({
        behavior: '포커스 불안정성',
        strength: instability,
        weight: this.BEHAVIOR_WEIGHTS.neuroticism.focus_instability,
        observation: `${(instability * 100).toFixed(1)}% 포커스 상실 비율`
      });
    }
    
    // 응답 시간 변동성
    if (data.responseTime?.length > 2) {
      const variability = this.calculateResponseTimeVariability(data.responseTime);
      const variabilityScore = Math.min(variability, 1) * 
                              this.BEHAVIOR_WEIGHTS.neuroticism.response_variability;
      score += variabilityScore;
      
      evidences.push({
        behavior: '응답 시간 변동성',
        strength: Math.min(variability, 1),
        weight: this.BEHAVIOR_WEIGHTS.neuroticism.response_variability,
        observation: `${(variability * 100).toFixed(1)}% 응답 변동성`
      });
    }
    
    // 스트레스 지표
    const stressLevel = this.calculateStressIndicators(data);
    const stressScore = stressLevel * this.BEHAVIOR_WEIGHTS.neuroticism.stress_indicators;
    score += stressScore;
    
    evidences.push({
      behavior: '스트레스 지표',
      strength: stressLevel,
      weight: this.BEHAVIOR_WEIGHTS.neuroticism.stress_indicators,
      observation: `${(stressLevel * 100).toFixed(1)}% 스트레스 수준`
    });
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateTraitConfidence(evidences),
      indicators: this.getNeuroticismIndicators(score),
      behavioral_evidence: evidences
    };
  }

  /**
   * 🔧 헬퍼 메서드들
   */
  private static getTraitLevel(score: number): 'very_low' | 'low' | 'average' | 'high' | 'very_high' {
    if (score < 0.2) return 'very_low';
    if (score < 0.4) return 'low';
    if (score < 0.6) return 'average';
    if (score < 0.8) return 'high';
    return 'very_high';
  }

  private static calculateTraitConfidence(evidences: BehavioralEvidence[]): number {
    if (!evidences.length) return 0.3;
    
    const totalWeight = evidences.reduce((sum, e) => sum + e.weight, 0);
    const weightedStrength = evidences.reduce((sum, e) => sum + e.strength * e.weight, 0);
    
    return Math.min(1, Math.max(0.3, weightedStrength / totalWeight + 0.2));
  }

  private static getOpennessIndicators(score: number): string[] {
    const indicators = [];
    if (score > 0.7) indicators.push('높은 탐색 욕구', '창의적 사고', '새로운 경험 추구');
    else if (score > 0.4) indicators.push('적당한 호기심', '균형잡힌 관점');
    else indicators.push('전통적 선호', '안정적 패턴');
    return indicators;
  }

  private static getConscientiousnessIndicators(score: number): string[] {
    const indicators = [];
    if (score > 0.7) indicators.push('체계적 접근', '높은 집중력', '계획적 행동');
    else if (score > 0.4) indicators.push('적당한 조직력', '균형잡힌 접근');
    else indicators.push('유연한 스타일', '즉흥적 행동');
    return indicators;
  }

  private static getExtraversionIndicators(score: number): string[] {
    const indicators = [];
    if (score > 0.7) indicators.push('활발한 상호작용', '빠른 응답', '높은 에너지');
    else if (score > 0.4) indicators.push('균형잡힌 사교성', '적절한 상호작용');
    else indicators.push('신중한 접근', '깊은 사고', '선택적 상호작용');
    return indicators;
  }

  private static getAgreeablenessIndicators(score: number): string[] {
    const indicators = [];
    if (score > 0.7) indicators.push('협력적 성향', '부드러운 상호작용', '높은 인내심');
    else if (score > 0.4) indicators.push('적절한 협조성', '균형잡힌 대인관계');
    else indicators.push('독립적 성향', '직접적 소통', '효율성 중시');
    return indicators;
  }

  private static getNeuroticismIndicators(score: number): string[] {
    const indicators = [];
    if (score > 0.7) indicators.push('스트레스 민감성', '감정적 변동성', '불안정한 패턴');
    else if (score > 0.4) indicators.push('적당한 감정 반응', '보통 스트레스 대응');
    else indicators.push('정서적 안정성', '스트레스 저항성', '일관된 패턴');
    return indicators;
  }

  // ... 추가 계산 메서드들 (behavior-analysis.ts의 메서드들 재사용)
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
    return Date.now() - (data.timestamp || Date.now() - 60000);
  }

  private static calculateActivityLevel(data: any): number {
    const clicks = data.clickPattern?.length || 0;
    const scrolls = data.scrollPattern?.length || 0;
    const dwells = data.dwellTime?.length || 0;
    
    const totalActions = clicks + scrolls + dwells;
    const sessionMinutes = Math.max(this.getSessionDuration(data) / 60000, 1);
    
    return Math.min(totalActions / (sessionMinutes * 10), 1); // 분당 10개 행동이 최대
  }

  private static calculateScrollSmoothness(scrollData: any[]): number {
    if (!scrollData.length) return 0.5;
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

  private static calculateStressIndicators(data: any): number {
    let stress = 0;
    
    if (data.attentionPattern?.blurEvents > 5) stress += 0.3;
    if (data.explorationBehavior?.backtrackCount > 5) stress += 0.2;
    if (data.responseTime?.some((t: number) => t > 15000)) stress += 0.2;
    
    return Math.min(1, stress);
  }

  private static calculateOverallConfidence(data: any, profile: Big5Profile): number {
    const dominantConfidence = profile[profile.dominant].confidence;
    const dataQuality = this.calculateDataQuality(data);
    const consistency = this.calculateBehaviorConsistency(data);
    
    return (dominantConfidence * 0.5 + dataQuality * 0.3 + consistency * 0.2);
  }

  private static calculateDataQuality(data: any): number {
    const dataPoints = (data.clickPattern?.length || 0) + 
                      (data.dwellTime?.length || 0) + 
                      (data.scrollPattern?.length || 0);
    return Math.min(dataPoints / 50, 1); // 50개 데이터 포인트가 최적
  }

  private static calculateBehaviorConsistency(data: any): number {
    // 다양한 행동 지표들의 일관성 측정
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

  private static generateInferenceReasoning(data: any, profile: Big5Profile): InferenceReasoning {
    const dominant = profile[profile.dominant];
    const secondary = profile[profile.secondary];
    
    return {
      primary_factors: dominant.behavioral_evidence.map(e => ({
        factor: e.behavior,
        evidence: e.observation,
        weight: e.weight,
        contribution: e.strength * e.weight
      })),
      secondary_factors: secondary.behavioral_evidence.slice(0, 2).map(e => ({
        factor: e.behavior,
        evidence: e.observation,
        weight: e.weight,
        contribution: e.strength * e.weight
      })),
      contradictory_evidence: this.findContradictoryEvidence(data, profile),
      overall_assessment: this.generateOverallAssessment(profile)
    };
  }

  private static findContradictoryEvidence(data: any, profile: Big5Profile): string[] {
    // 주요 성격과 모순되는 행동 패턴 탐지
    const contradictions = [];
    
    if (profile.dominant === 'extraversion' && profile.extraversion.score > 0.7) {
      const avgResponseTime = data.responseTime?.reduce((sum: number, t: number) => sum + t, 0) / 
                             (data.responseTime?.length || 1);
      if (avgResponseTime > 8000) {
        contradictions.push('외향성에 비해 응답시간이 긺');
      }
    }
    
    return contradictions;
  }

  private static generateOverallAssessment(profile: Big5Profile): string {
    const dominantScore = profile[profile.dominant].score;
    const secondaryScore = profile[profile.secondary].score;
    
    return `주요 성격: ${profile.dominant} (${(dominantScore * 100).toFixed(1)}%), ` +
           `부차적 성격: ${profile.secondary} (${(secondaryScore * 100).toFixed(1)}%)`;
  }

  private static generatePersonalityAdaptations(profile: Big5Profile): PersonalityAdaptations {
    const dominant = profile.dominant;
    const score = profile[dominant].score;
    
    // 성격별 최적화된 적응 전략
    const adaptationStrategies = {
      openness: {
        communication_style: { tone: 'enthusiastic' as const, pace: 'variable' as const, directness: 'indirect' as const, emotional_resonance: 'high' as const },
        content_preferences: { depth: 'detailed' as const, structure: 'exploratory' as const, emphasis: 'connections' as const, novelty: 'novel' as const },
        interaction_patterns: { response_expectation: 'considered' as const, feedback_frequency: 'regular' as const, complexity_tolerance: 'high' as const, uncertainty_comfort: 'high' as const },
        learning_style: { processing: 'global' as const, input_preference: 'multimodal' as const, retention_strategy: 'elaboration' as const }
      },
      conscientiousness: {
        communication_style: { tone: 'professional' as const, pace: 'moderate' as const, directness: 'direct' as const, emotional_resonance: 'moderate' as const },
        content_preferences: { depth: 'detailed' as const, structure: 'linear' as const, emphasis: 'facts' as const, novelty: 'familiar' as const },
        interaction_patterns: { response_expectation: 'considered' as const, feedback_frequency: 'regular' as const, complexity_tolerance: 'high' as const, uncertainty_comfort: 'low' as const },
        learning_style: { processing: 'sequential' as const, input_preference: 'visual' as const, retention_strategy: 'organization' as const }
      },
      extraversion: {
        communication_style: { tone: 'enthusiastic' as const, pace: 'fast' as const, directness: 'direct' as const, emotional_resonance: 'high' as const },
        content_preferences: { depth: 'moderate' as const, structure: 'branching' as const, emphasis: 'experiences' as const, novelty: 'mixed' as const },
        interaction_patterns: { response_expectation: 'immediate' as const, feedback_frequency: 'constant' as const, complexity_tolerance: 'medium' as const, uncertainty_comfort: 'medium' as const },
        learning_style: { processing: 'mixed' as const, input_preference: 'auditory' as const, retention_strategy: 'elaboration' as const }
      },
      agreeableness: {
        communication_style: { tone: 'warm' as const, pace: 'moderate' as const, directness: 'indirect' as const, emotional_resonance: 'high' as const },
        content_preferences: { depth: 'moderate' as const, structure: 'linear' as const, emphasis: 'experiences' as const, novelty: 'familiar' as const },
        interaction_patterns: { response_expectation: 'flexible' as const, feedback_frequency: 'regular' as const, complexity_tolerance: 'medium' as const, uncertainty_comfort: 'low' as const },
        learning_style: { processing: 'sequential' as const, input_preference: 'multimodal' as const, retention_strategy: 'repetition' as const }
      },
      neuroticism: {
        communication_style: { tone: 'warm' as const, pace: 'slow' as const, directness: 'indirect' as const, emotional_resonance: 'low' as const },
        content_preferences: { depth: 'overview' as const, structure: 'linear' as const, emphasis: 'facts' as const, novelty: 'familiar' as const },
        interaction_patterns: { response_expectation: 'flexible' as const, feedback_frequency: 'minimal' as const, complexity_tolerance: 'low' as const, uncertainty_comfort: 'low' as const },
        learning_style: { processing: 'sequential' as const, input_preference: 'visual' as const, retention_strategy: 'repetition' as const }
      }
    };
    
    return adaptationStrategies[dominant];
  }

  private static calculateReliabilityMetrics(data: any): ReliabilityMetrics {
    const dataSufficiency = this.calculateDataQuality(data);
    const consistency = this.calculateBehaviorConsistency(data);
    const temporalStability = this.calculateTemporalStability(data);
    const crossValidation = this.calculateCrossValidation(data);
    
    const overall = (dataSufficiency * 0.3 + consistency * 0.3 + 
                    temporalStability * 0.2 + crossValidation * 0.2);
    
    return {
      data_sufficiency: dataSufficiency,
      consistency_score: consistency,
      temporal_stability: temporalStability,
      cross_validation: crossValidation,
      overall_reliability: overall
    };
  }

  private static calculateTemporalStability(data: any): number {
    // 시간에 따른 행동 패턴의 안정성 측정
    if (!data.dwellTime?.length || data.dwellTime.length < 3) return 0.5;
    
    const firstHalf = data.dwellTime.slice(0, Math.floor(data.dwellTime.length / 2));
    const secondHalf = data.dwellTime.slice(Math.floor(data.dwellTime.length / 2));
    
    const firstAvg = firstHalf.reduce((sum: number, d: any) => sum + d.duration, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum: number, d: any) => sum + d.duration, 0) / secondHalf.length;
    
    const stability = 1 - Math.abs(firstAvg - secondAvg) / Math.max(firstAvg, secondAvg);
    return Math.max(0, Math.min(1, stability));
  }

  private static calculateCrossValidation(data: any): number {
    // 다른 지표들 간의 교차 검증 점수
    const indicators = [
      data.clickPattern?.length || 0,
      data.dwellTime?.length || 0,
      data.scrollPattern?.length || 0,
      data.responseTime?.length || 0
    ];
    
    const nonZeroIndicators = indicators.filter(i => i > 0).length;
    return Math.min(nonZeroIndicators / 4, 1); // 4가지 지표 모두 있으면 완전
  }
}

/**
 * 🚀 편의 함수
 */
export function inferPersonalityFromBehavior(behaviorData: any): Big5InferenceResult {
  return Big5InferenceEngine.inferBig5Personality(behaviorData);
}
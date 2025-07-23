// ⚡ 성격 계산 엔진: 가중치 기반 성격 점수 계산
// Phase 1 Task 1.2: 신뢰도 기반 성격 타입 결정 + 불확실성 처리

import { Big5InferenceResult } from './big5-inference';

interface PersonalityCalculationResult {
  finalPersonality: FinalPersonalityProfile;
  calculationDetails: CalculationDetails;
  reliabilityAssessment: ReliabilityAssessment;
  recommendations: AdaptiveRecommendations;
  uncertaintyHandling: UncertaintyHandling;
}

interface FinalPersonalityProfile {
  primary: PersonalityType;
  secondary: PersonalityType | null;
  hybrid: boolean; // 하이브리드 성격인지
  confidence: number;
  stability: number; // 성격의 안정성
  adaptabilityNeeded: number; // 적응 필요도
}

interface PersonalityType {
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  score: number;
  confidence: number;
  strength: 'dominant' | 'moderate' | 'weak';
  characteristics: string[];
}

interface CalculationDetails {
  inputMetrics: InputMetrics;
  weightingSystem: WeightingSystem;
  scoreCalculation: ScoreCalculation;
  confidenceCalculation: ConfidenceCalculation;
  finalDecisionLogic: DecisionLogic;
}

interface InputMetrics {
  behaviorDataPoints: number;
  timeSpan: number; // 관찰 시간 (분)
  interactionTypes: string[];
  dataQuality: number;
}

interface WeightingSystem {
  behaviors: { [key: string]: number };
  timeDecay: number;
  contextualFactors: { [key: string]: number };
  uncertaintyPenalty: number;
}

interface ScoreCalculation {
  rawScores: { [trait: string]: number };
  weightedScores: { [trait: string]: number };
  normalizedScores: { [trait: string]: number };
  confidenceWeightedScores: { [trait: string]: number };
}

interface ConfidenceCalculation {
  dataConfidence: number;
  temporalConsistency: number;
  crossValidation: number;
  overallConfidence: number;
}

interface DecisionLogic {
  primaryThreshold: number;
  secondaryThreshold: number;
  hybridThreshold: number;
  minimumConfidence: number;
  decisionReasoning: string;
}

interface ReliabilityAssessment {
  reliability: 'high' | 'medium' | 'low';
  trustScore: number;
  limitations: string[];
  recommendations: string[];
}

interface AdaptiveRecommendations {
  contentStrategy: ContentStrategy;
  interactionStyle: InteractionStyle;
  fallbackStrategies: FallbackStrategy[];
}

interface ContentStrategy {
  primaryApproach: string;
  secondaryApproach: string | null;
  adaptationTriggers: string[];
  contentParameters: ContentParameters;
}

interface ContentParameters {
  pace: 'slow' | 'normal' | 'fast';
  depth: 'surface' | 'moderate' | 'deep';
  structure: 'linear' | 'branching' | 'free-form';
  tone: 'formal' | 'casual' | 'warm' | 'enthusiastic';
}

interface InteractionStyle {
  responseExpectation: 'immediate' | 'considered' | 'flexible';
  feedbackFrequency: 'minimal' | 'moderate' | 'frequent';
  complexityLevel: 'simple' | 'moderate' | 'complex';
  personalizedLevel: number; // 0-1 scale
}

interface FallbackStrategy {
  condition: string;
  alternative: string;
  confidence: number;
}

interface UncertaintyHandling {
  uncertaintyLevel: number;
  causes: string[];
  mitigationStrategies: string[];
  fallbackPersonality: PersonalityType;
  adaptiveParameters: AdaptiveParameters;
}

interface AdaptiveParameters {
  personalizedContent: number; // 개인화 비율 (0-1)
  conservativeApproach: boolean;
  multiModalFallback: boolean;
  continuousLearning: boolean;
}

/**
 * 🧮 성격 계산 엔진
 */
export class PersonalityCalculator {
  
  // 계산 상수들
  private static readonly CALCULATION_CONSTANTS = {
    MINIMUM_DATA_POINTS: 10,
    MINIMUM_CONFIDENCE: 0.6,
    HYBRID_THRESHOLD: 0.15, // 1위와 2위 점수 차이가 이 값보다 작으면 하이브리드
    PRIMARY_THRESHOLD: 0.65,
    SECONDARY_THRESHOLD: 0.45,
    TIME_DECAY_FACTOR: 0.95, // 시간이 지날수록 가중치 감소
    UNCERTAINTY_PENALTY: 0.2, // 불확실성에 대한 패널티
    OPTIMAL_PERSONALIZATION: 0.5 // 최적 개인화 비율 (연구 결과 기반)
  };

  /**
   * 🎯 메인 계산 함수
   */
  public static calculatePersonality(
    behaviorData: any, 
    big5Result: Big5InferenceResult
  ): PersonalityCalculationResult {
    console.log('🧮 성격 계산 엔진 시작...');
    
    // 1. 입력 메트릭 분석
    const inputMetrics = this.analyzeInputMetrics(behaviorData);
    
    // 2. 가중치 시스템 적용
    const weightingSystem = this.buildWeightingSystem(inputMetrics, big5Result);
    
    // 3. 점수 계산
    const scoreCalculation = this.calculateWeightedScores(big5Result, weightingSystem);
    
    // 4. 신뢰도 계산
    const confidenceCalculation = this.calculateConfidenceMetrics(
      inputMetrics, 
      scoreCalculation, 
      big5Result
    );
    
    // 5. 최종 성격 결정
    const finalPersonality = this.determineFinalPersonality(
      scoreCalculation, 
      confidenceCalculation
    );
    
    // 6. 불확실성 처리
    const uncertaintyHandling = this.handleUncertainty(
      finalPersonality, 
      confidenceCalculation, 
      inputMetrics
    );
    
    // 7. 적응형 추천 생성
    const recommendations = this.generateAdaptiveRecommendations(
      finalPersonality, 
      uncertaintyHandling
    );
    
    // 8. 신뢰도 평가
    const reliabilityAssessment = this.assessReliability(
      confidenceCalculation, 
      inputMetrics
    );
    
    const result: PersonalityCalculationResult = {
      finalPersonality,
      calculationDetails: {
        inputMetrics,
        weightingSystem,
        scoreCalculation,
        confidenceCalculation,
        finalDecisionLogic: this.getDecisionLogic(finalPersonality, confidenceCalculation)
      },
      reliabilityAssessment,
      recommendations,
      uncertaintyHandling
    };
    
    console.log('✅ 성격 계산 완료:', finalPersonality.primary.trait, 
               `(${(finalPersonality.confidence * 100).toFixed(1)}%)`);
    return result;
  }

  /**
   * 📊 입력 메트릭 분석
   */
  private static analyzeInputMetrics(behaviorData: any): InputMetrics {
    const dataPoints = (behaviorData.clickPattern?.length || 0) + 
                      (behaviorData.dwellTime?.length || 0) + 
                      (behaviorData.scrollPattern?.length || 0) +
                      (behaviorData.selectionPattern?.length || 0);
    
    const timeSpan = behaviorData.timestamp ? 
                    (Date.now() - behaviorData.timestamp) / 60000 : 5; // 기본 5분
    
    const interactionTypes = this.getUniqueInteractionTypes(behaviorData);
    const dataQuality = this.calculateDataQuality(behaviorData, dataPoints, timeSpan);
    
    return {
      behaviorDataPoints: dataPoints,
      timeSpan,
      interactionTypes,
      dataQuality
    };
  }

  /**
   * ⚖️ 가중치 시스템 구축
   */
  private static buildWeightingSystem(
    inputMetrics: InputMetrics, 
    big5Result: Big5InferenceResult
  ): WeightingSystem {
    
    // 행동별 가중치 (데이터 품질과 신뢰도에 따라 조정)
    const baseWeights = {
      click_frequency: 0.2,
      dwell_time: 0.25,
      scroll_pattern: 0.15,
      selection_speed: 0.2,
      exploration_ratio: 0.2
    };
    
    // 데이터 품질에 따른 가중치 조정
    const qualityMultiplier = inputMetrics.dataQuality;
    const adjustedWeights = Object.fromEntries(
      Object.entries(baseWeights).map(([key, weight]) => 
        [key, weight * qualityMultiplier]
      )
    );
    
    // 시간 감쇠 계산
    const timeDecay = Math.pow(
      this.CALCULATION_CONSTANTS.TIME_DECAY_FACTOR, 
      inputMetrics.timeSpan / 60 // 시간당 감쇠
    );
    
    // 맥락적 요인들
    const contextualFactors = {
      data_sufficiency: inputMetrics.behaviorDataPoints >= this.CALCULATION_CONSTANTS.MINIMUM_DATA_POINTS ? 1.0 : 0.8,
      interaction_variety: Math.min(inputMetrics.interactionTypes.length / 5, 1.0),
      temporal_consistency: big5Result.reliability.temporal_stability
    };
    
    // 불확실성 패널티
    const uncertaintyPenalty = this.CALCULATION_CONSTANTS.UNCERTAINTY_PENALTY * 
                              (1 - big5Result.confidence);
    
    return {
      behaviors: adjustedWeights,
      timeDecay,
      contextualFactors,
      uncertaintyPenalty
    };
  }

  /**
   * 📈 가중치가 적용된 점수 계산
   */
  private static calculateWeightedScores(
    big5Result: Big5InferenceResult, 
    weighting: WeightingSystem
  ): ScoreCalculation {
    
    const rawScores = {
      openness: big5Result.personality.openness.score,
      conscientiousness: big5Result.personality.conscientiousness.score,
      extraversion: big5Result.personality.extraversion.score,
      agreeableness: big5Result.personality.agreeableness.score,
      neuroticism: big5Result.personality.neuroticism.score
    };
    
    // 가중치 적용
    const weightedScores = Object.fromEntries(
      Object.entries(rawScores).map(([trait, score]) => {
        let weightedScore = score;
        
        // 시간 감쇠 적용
        weightedScore *= weighting.timeDecay;
        
        // 맥락적 요인들 적용
        Object.values(weighting.contextualFactors).forEach(factor => {
          weightedScore *= factor;
        });
        
        // 불확실성 패널티 적용
        weightedScore *= (1 - weighting.uncertaintyPenalty);
        
        return [trait, weightedScore];
      })
    );
    
    // 정규화 (0-1 범위로)
    const maxScore = Math.max(...Object.values(weightedScores));
    const normalizedScores = Object.fromEntries(
      Object.entries(weightedScores).map(([trait, score]) => 
        [trait, maxScore > 0 ? score / maxScore : score]
      )
    );
    
    // 신뢰도 가중치 적용
    const confidenceWeightedScores = Object.fromEntries(
      Object.entries(normalizedScores).map(([trait, score]) => {
        const traitConfidence = big5Result.personality[trait as keyof typeof big5Result.personality].confidence;
        return [trait, score * traitConfidence];
      })
    );
    
    return {
      rawScores,
      weightedScores,
      normalizedScores,
      confidenceWeightedScores
    };
  }

  /**
   * 🎯 신뢰도 메트릭 계산
   */
  private static calculateConfidenceMetrics(
    inputMetrics: InputMetrics,
    scoreCalculation: ScoreCalculation,
    big5Result: Big5InferenceResult
  ): ConfidenceCalculation {
    
    // 데이터 기반 신뢰도
    const dataConfidence = Math.min(
      inputMetrics.behaviorDataPoints / 50, // 50개 데이터 포인트가 이상적
      1.0
    ) * inputMetrics.dataQuality;
    
    // 시간적 일관성
    const temporalConsistency = big5Result.reliability.temporal_stability;
    
    // 교차 검증
    const crossValidation = big5Result.reliability.cross_validation;
    
    // 전체 신뢰도 계산
    const overallConfidence = (
      dataConfidence * 0.4 +
      temporalConsistency * 0.3 +
      crossValidation * 0.3
    ) * big5Result.confidence;
    
    return {
      dataConfidence,
      temporalConsistency,
      crossValidation,
      overallConfidence: Math.max(0.3, Math.min(1.0, overallConfidence))
    };
  }

  /**
   * 🏆 최종 성격 결정
   */
  private static determineFinalPersonality(
    scoreCalculation: ScoreCalculation,
    confidenceCalculation: ConfidenceCalculation
  ): FinalPersonalityProfile {
    
    const scores = scoreCalculation.confidenceWeightedScores;
    
    // 점수순으로 정렬
    const sortedTraits = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .map(([trait, score]) => ({ trait: trait as any, score }));
    
    const primaryTrait = sortedTraits[0];
    const secondaryTrait = sortedTraits[1];
    
    // 하이브리드 성격 판단
    const scoreDifference = primaryTrait.score - secondaryTrait.score;
    const isHybrid = scoreDifference <= this.CALCULATION_CONSTANTS.HYBRID_THRESHOLD;
    
    // 성격 강도 계산
    const getPrimaryStrength = (score: number): 'dominant' | 'moderate' | 'weak' => {
      if (score >= 0.75) return 'dominant';
      if (score >= 0.55) return 'moderate';
      return 'weak';
    };
    
    const primary: PersonalityType = {
      trait: primaryTrait.trait,
      score: primaryTrait.score,
      confidence: confidenceCalculation.overallConfidence,
      strength: getPrimaryStrength(primaryTrait.score),
      characteristics: this.getPersonalityCharacteristics(primaryTrait.trait, primaryTrait.score)
    };
    
    const secondary: PersonalityType | null = isHybrid ? {
      trait: secondaryTrait.trait,
      score: secondaryTrait.score,
      confidence: confidenceCalculation.overallConfidence * 0.8,
      strength: getPrimaryStrength(secondaryTrait.score),
      characteristics: this.getPersonalityCharacteristics(secondaryTrait.trait, secondaryTrait.score)
    } : null;
    
    // 적응 필요도 계산
    const adaptabilityNeeded = this.calculateAdaptabilityNeeded(
      confidenceCalculation.overallConfidence,
      isHybrid,
      primary.strength
    );
    
    return {
      primary,
      secondary,
      hybrid: isHybrid,
      confidence: confidenceCalculation.overallConfidence,
      stability: this.calculateStability(scoreCalculation, confidenceCalculation),
      adaptabilityNeeded
    };
  }

  /**
   * 🌊 불확실성 처리
   */
  private static handleUncertainty(
    finalPersonality: FinalPersonalityProfile,
    confidenceCalculation: ConfidenceCalculation,
    inputMetrics: InputMetrics
  ): UncertaintyHandling {
    
    const uncertaintyLevel = 1 - confidenceCalculation.overallConfidence;
    
    // 불확실성 원인 분석
    const causes = [];
    if (inputMetrics.behaviorDataPoints < this.CALCULATION_CONSTANTS.MINIMUM_DATA_POINTS) {
      causes.push('데이터 부족');
    }
    if (confidenceCalculation.temporalConsistency < 0.7) {
      causes.push('행동 일관성 부족');
    }
    if (inputMetrics.dataQuality < 0.8) {
      causes.push('데이터 품질 저하');
    }
    if (finalPersonality.hybrid) {
      causes.push('혼합 성격 특성');
    }
    
    // 완화 전략
    const mitigationStrategies = [];
    if (uncertaintyLevel > 0.4) {
      mitigationStrategies.push('보수적 개인화 적용');
      mitigationStrategies.push('다중 전략 병행');
      mitigationStrategies.push('지속적 학습 활성화');
    }
    if (finalPersonality.hybrid) {
      mitigationStrategies.push('하이브리드 컨텐츠 전략');
    }
    
    // 폴백 성격 (불확실할 때 사용)
    const fallbackPersonality: PersonalityType = {
      trait: 'agreeableness', // 가장 안전한 선택
      score: 0.6,
      confidence: 0.8,
      strength: 'moderate',
      characteristics: ['친화적', '균형잡힌', '적응적']
    };
    
    // 적응형 파라미터
    const adaptiveParameters: AdaptiveParameters = {
      personalizedContent: Math.max(0.3, this.CALCULATION_CONSTANTS.OPTIMAL_PERSONALIZATION - uncertaintyLevel),
      conservativeApproach: uncertaintyLevel > 0.4,
      multiModalFallback: uncertaintyLevel > 0.6,
      continuousLearning: true
    };
    
    return {
      uncertaintyLevel,
      causes,
      mitigationStrategies,
      fallbackPersonality,
      adaptiveParameters
    };
  }

  /**
   * 💡 적응형 추천 생성
   */
  private static generateAdaptiveRecommendations(
    finalPersonality: FinalPersonalityProfile,
    uncertaintyHandling: UncertaintyHandling
  ): AdaptiveRecommendations {
    
    const primaryTrait = finalPersonality.primary.trait;
    const isUncertain = uncertaintyHandling.uncertaintyLevel > 0.4;
    
    // 콘텐츠 전략
    const contentStrategy = this.getContentStrategy(primaryTrait, finalPersonality.hybrid, isUncertain);
    
    // 상호작용 스타일
    const interactionStyle = this.getInteractionStyle(primaryTrait, finalPersonality.confidence);
    
    // 폴백 전략
    const fallbackStrategies = this.getFallbackStrategies(uncertaintyHandling);
    
    return {
      contentStrategy,
      interactionStyle,
      fallbackStrategies
    };
  }

  /**
   * 🔍 신뢰도 평가
   */
  private static assessReliability(
    confidenceCalculation: ConfidenceCalculation,
    inputMetrics: InputMetrics
  ): ReliabilityAssessment {
    
    const overallConfidence = confidenceCalculation.overallConfidence;
    let reliability: 'high' | 'medium' | 'low';
    
    if (overallConfidence >= 0.8) reliability = 'high';
    else if (overallConfidence >= 0.6) reliability = 'medium';
    else reliability = 'low';
    
    const trustScore = overallConfidence * inputMetrics.dataQuality;
    
    const limitations = [];
    const recommendations = [];
    
    if (inputMetrics.behaviorDataPoints < 20) {
      limitations.push('데이터 포인트 부족으로 정확도 제한');
      recommendations.push('더 많은 상호작용 데이터 수집 필요');
    }
    
    if (inputMetrics.timeSpan < 3) {
      limitations.push('관찰 시간 부족으로 신뢰도 제한');
      recommendations.push('장기간 행동 패턴 관찰 필요');
    }
    
    if (confidenceCalculation.temporalConsistency < 0.7) {
      limitations.push('행동 일관성 부족');
      recommendations.push('지속적인 모니터링을 통한 패턴 확인');
    }
    
    return {
      reliability,
      trustScore,
      limitations,
      recommendations
    };
  }

  /**
   * 🔧 헬퍼 메서드들
   */
  private static getUniqueInteractionTypes(behaviorData: any): string[] {
    const types = new Set<string>();
    
    behaviorData.clickPattern?.forEach((click: any) => {
      types.add(click.elementType || 'unknown');
    });
    
    if (behaviorData.scrollPattern?.length > 0) types.add('scroll');
    if (behaviorData.dwellTime?.length > 0) types.add('dwell');
    if (behaviorData.selectionPattern?.length > 0) types.add('selection');
    
    return Array.from(types);
  }

  private static calculateDataQuality(behaviorData: any, dataPoints: number, timeSpan: number): number {
    let quality = 0.5;
    
    // 데이터 양 평가
    if (dataPoints >= 50) quality += 0.3;
    else if (dataPoints >= 20) quality += 0.2;
    else if (dataPoints >= 10) quality += 0.1;
    
    // 시간 범위 평가
    if (timeSpan >= 10) quality += 0.2;
    else if (timeSpan >= 5) quality += 0.1;
    
    // 다양성 평가
    const interactionTypes = this.getUniqueInteractionTypes(behaviorData);
    if (interactionTypes.length >= 4) quality += 0.2;
    else if (interactionTypes.length >= 2) quality += 0.1;
    
    return Math.min(1.0, quality);
  }

  private static getPersonalityCharacteristics(trait: string, score: number): string[] {
    const characteristics = {
      openness: score > 0.7 ? ['창의적', '호기심 많음', '새로운 경험 추구'] :
                score > 0.4 ? ['적당히 개방적', '균형잡힌'] : ['전통적', '안정 지향'],
      conscientiousness: score > 0.7 ? ['체계적', '계획적', '신뢰할 수 있음'] :
                        score > 0.4 ? ['적당히 조직적', '균형잡힌'] : ['유연한', '즉흥적'],
      extraversion: score > 0.7 ? ['사교적', '활발함', '에너지 넘침'] :
                   score > 0.4 ? ['적당히 사교적', '균형잡힌'] : ['내성적', '신중함'],
      agreeableness: score > 0.7 ? ['협력적', '친화적', '타인 배려'] :
                    score > 0.4 ? ['적당히 협조적', '균형잡힌'] : ['독립적', '경쟁적'],
      neuroticism: score > 0.7 ? ['감정 기복', '스트레스 민감'] :
                  score > 0.4 ? ['보통 안정성'] : ['정서적 안정', '스트레스 저항']
    };
    
    return characteristics[trait] || ['균형잡힌'];
  }

  private static calculateAdaptabilityNeeded(confidence: number, isHybrid: boolean, strength: string): number {
    let adaptability = 0.5; // 기본값
    
    if (confidence < 0.6) adaptability += 0.3;
    if (isHybrid) adaptability += 0.2;
    if (strength === 'weak') adaptability += 0.2;
    
    return Math.min(1.0, adaptability);
  }

  private static calculateStability(scoreCalculation: ScoreCalculation, confidenceCalculation: ConfidenceCalculation): number {
    const scores = Object.values(scoreCalculation.confidenceWeightedScores);
    const maxScore = Math.max(...scores);
    const secondMaxScore = scores.sort((a, b) => b - a)[1];
    
    const dominance = maxScore - secondMaxScore;
    const temporalStability = confidenceCalculation.temporalConsistency;
    
    return (dominance * 0.6 + temporalStability * 0.4);
  }

  private static getDecisionLogic(personality: FinalPersonalityProfile, confidence: ConfidenceCalculation): DecisionLogic {
    return {
      primaryThreshold: this.CALCULATION_CONSTANTS.PRIMARY_THRESHOLD,
      secondaryThreshold: this.CALCULATION_CONSTANTS.SECONDARY_THRESHOLD,
      hybridThreshold: this.CALCULATION_CONSTANTS.HYBRID_THRESHOLD,
      minimumConfidence: this.CALCULATION_CONSTANTS.MINIMUM_CONFIDENCE,
      decisionReasoning: `주성격: ${personality.primary.trait} (${(personality.primary.score * 100).toFixed(1)}%), ` +
                        `신뢰도: ${(confidence.overallConfidence * 100).toFixed(1)}%, ` +
                        `하이브리드: ${personality.hybrid ? 'Yes' : 'No'}`
    };
  }

  private static getContentStrategy(trait: string, isHybrid: boolean, isUncertain: boolean): ContentStrategy {
    const strategies = {
      openness: {
        primaryApproach: '창의적이고 다양한 관점 제시',
        contentParameters: { pace: 'normal' as const, depth: 'deep' as const, structure: 'branching' as const, tone: 'enthusiastic' as const }
      },
      conscientiousness: {
        primaryApproach: '체계적이고 정확한 정보 제공',
        contentParameters: { pace: 'normal' as const, depth: 'deep' as const, structure: 'linear' as const, tone: 'formal' as const }
      },
      extraversion: {
        primaryApproach: '활발하고 상호작용적인 콘텐츠',
        contentParameters: { pace: 'fast' as const, depth: 'moderate' as const, structure: 'branching' as const, tone: 'enthusiastic' as const }
      },
      agreeableness: {
        primaryApproach: '친화적이고 배려적인 접근',
        contentParameters: { pace: 'normal' as const, depth: 'moderate' as const, structure: 'linear' as const, tone: 'warm' as const }
      },
      neuroticism: {
        primaryApproach: '안정적이고 스트레스 최소화',
        contentParameters: { pace: 'slow' as const, depth: 'surface' as const, structure: 'linear' as const, tone: 'warm' as const }
      }
    };
    
    const strategy = strategies[trait] || strategies.agreeableness;
    
    return {
      primaryApproach: strategy.primaryApproach,
      secondaryApproach: isHybrid ? '혼합형 접근 방식' : null,
      adaptationTriggers: isUncertain ? ['사용자 피드백', '행동 변화 감지'] : ['성능 최적화'],
      contentParameters: strategy.contentParameters
    };
  }

  private static getInteractionStyle(trait: string, confidence: number): InteractionStyle {
    const styles = {
      openness: { responseExpectation: 'considered' as const, feedbackFrequency: 'moderate' as const, complexityLevel: 'complex' as const },
      conscientiousness: { responseExpectation: 'considered' as const, feedbackFrequency: 'frequent' as const, complexityLevel: 'complex' as const },
      extraversion: { responseExpectation: 'immediate' as const, feedbackFrequency: 'frequent' as const, complexityLevel: 'moderate' as const },
      agreeableness: { responseExpectation: 'flexible' as const, feedbackFrequency: 'moderate' as const, complexityLevel: 'moderate' as const },
      neuroticism: { responseExpectation: 'flexible' as const, feedbackFrequency: 'minimal' as const, complexityLevel: 'simple' as const }
    };
    
    const baseStyle = styles[trait] || styles.agreeableness;
    
    return {
      ...baseStyle,
      personalizedLevel: Math.min(confidence, this.CALCULATION_CONSTANTS.OPTIMAL_PERSONALIZATION)
    };
  }

  private static getFallbackStrategies(uncertaintyHandling: UncertaintyHandling): FallbackStrategy[] {
    const strategies: FallbackStrategy[] = [];
    
    if (uncertaintyHandling.uncertaintyLevel > 0.4) {
      strategies.push({
        condition: '낮은 신뢰도',
        alternative: '보편적 친화형 접근',
        confidence: 0.8
      });
    }
    
    if (uncertaintyHandling.adaptiveParameters.multiModalFallback) {
      strategies.push({
        condition: '극도로 불확실한 상황',
        alternative: '다중 전략 병행 적용',
        confidence: 0.6
      });
    }
    
    return strategies;
  }
}

/**
 * 🚀 편의 함수
 */
export function calculateFinalPersonality(
  behaviorData: any, 
  big5Result: Big5InferenceResult
): PersonalityCalculationResult {
  return PersonalityCalculator.calculatePersonality(behaviorData, big5Result);
}
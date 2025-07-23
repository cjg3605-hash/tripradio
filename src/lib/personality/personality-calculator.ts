// 🧮 성격 계산 시스템 (간소화 버전)
// Phase 1 Task 1.3: 행동 데이터와 Big5 추론을 종합한 최종 성격 계산

import { PersonalityIndicators } from '../analytics/user-behavior-tracker';
import { Big5InferenceResult } from './big5-inference';

export interface PersonalityCalculationResult {
  finalPersonality: FinalPersonalityProfile;
  calculationDetails: CalculationDetails;
  reliabilityAssessment: ReliabilityAssessment;
  recommendations: PersonalityRecommendations;
  uncertaintyHandling: UncertaintyHandling;
}

export interface FinalPersonalityProfile {
  primary: PersonalityTrait;
  secondary?: PersonalityTrait;
  hybrid: boolean;
  confidence: number;
  stability: number;
  adaptabilityNeeded: number;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  confidence: number;
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  characteristics: string[];
}

export interface CalculationDetails {
  inputMetrics: InputMetrics;
  weightingSystem: WeightingSystem;
  scoreCalculation: ScoreCalculation;
  confidenceCalculation: ConfidenceCalculation;
  finalDecisionLogic: FinalDecisionLogic;
}

export interface InputMetrics {
  behaviorDataPoints: number;
  timeSpan: number;
  interactionTypes: string[];
  dataQuality: number;
}

export interface WeightingSystem {
  behaviors: Record<string, number>;
  timeDecay: number;
  contextualFactors: Record<string, number>;
  uncertaintyPenalty: number;
}

export interface ScoreCalculation {
  rawScores: Record<string, number>;
  weightedScores: Record<string, number>;
  normalizedScores: Record<string, number>;
  confidenceWeightedScores: Record<string, number>;
}

export interface ConfidenceCalculation {
  dataConfidence: number;
  temporalConsistency: number;
  crossValidation: number;
  overallConfidence: number;
}

export interface FinalDecisionLogic {
  primaryThreshold: number;
  secondaryThreshold: number;
  hybridThreshold: number;
  minimumConfidence: number;
  decisionReasoning: string;
}

export interface ReliabilityAssessment {
  reliability: 'low' | 'medium' | 'high';
  trustScore: number;
  limitations: string[];
  recommendations: string[];
}

export interface PersonalityRecommendations {
  contentStrategy: ContentStrategy;
  interactionStyle: InteractionStyle;
  fallbackStrategies: FallbackStrategy[];
}

export interface ContentStrategy {
  primaryApproach: string;
  secondaryApproach?: string;
  adaptationTriggers: string[];
  contentParameters: ContentParameters;
}

export interface ContentParameters {
  pace: 'slow' | 'normal' | 'fast';
  depth: 'shallow' | 'moderate' | 'deep';
  structure: 'linear' | 'branching' | 'exploratory';
  tone: 'formal' | 'casual' | 'warm' | 'enthusiastic';
}

export interface InteractionStyle {
  responseExpectation: 'immediate' | 'considered' | 'flexible';
  feedbackFrequency: 'minimal' | 'moderate' | 'frequent';
  complexityLevel: 'low' | 'medium' | 'high';
  personalizedLevel: number;
}

export interface FallbackStrategy {
  condition: string;
  alternative: string;
  confidence: number;
}

export interface UncertaintyHandling {
  uncertaintyLevel: number;
  causes: string[];
  mitigationStrategies: string[];
  fallbackPersonality: PersonalityTrait;
  adaptiveParameters: AdaptiveParameters;
}

export interface AdaptiveParameters {
  personalizedContent: number;
  conservativeApproach: boolean;
  multiModalFallback: boolean;
  continuousLearning: boolean;
}

/**
 * 🧮 성격 계산 엔진
 */
export class PersonalityCalculator {
  
  /**
   * 🎯 메인 성격 계산 함수
   */
  public static calculatePersonality(
    behaviorData: any,
    big5Result: Big5InferenceResult
  ): PersonalityCalculationResult {
    
    console.log('🧮 최종 성격 계산 시작...');
    
    // 1. 입력 데이터 메트릭 계산
    const inputMetrics = this.calculateInputMetrics(behaviorData);
    
    // 2. 가중치 시스템 설정
    const weightingSystem = this.setupWeightingSystem(inputMetrics);
    
    // 3. 점수 계산
    const scoreCalculation = this.calculateScores(big5Result, weightingSystem);
    
    // 4. 신뢰도 계산
    const confidenceCalculation = this.calculateConfidence(behaviorData, big5Result);
    
    // 5. 최종 성격 결정
    const finalDecisionLogic = this.makeFinalDecision(scoreCalculation, confidenceCalculation);
    
    // 6. 최종 성격 프로필 생성
    const finalPersonality = this.buildFinalPersonality(scoreCalculation, confidenceCalculation, finalDecisionLogic);
    
    // 7. 신뢰성 평가
    const reliabilityAssessment = this.assessReliability(inputMetrics, confidenceCalculation);
    
    // 8. 추천사항 생성
    const recommendations = this.generateRecommendations(finalPersonality, reliabilityAssessment);
    
    // 9. 불확실성 처리
    const uncertaintyHandling = this.handleUncertainty(finalPersonality, inputMetrics);
    
    const result: PersonalityCalculationResult = {
      finalPersonality,
      calculationDetails: {
        inputMetrics,
        weightingSystem,
        scoreCalculation,
        confidenceCalculation,
        finalDecisionLogic
      },
      reliabilityAssessment,
      recommendations,
      uncertaintyHandling
    };
    
    console.log(`✅ 성격 계산 완료: ${finalPersonality.primary.trait} (${(finalPersonality.confidence * 100).toFixed(1)}%)`);
    
    return result;
  }
  
  /**
   * 📊 입력 데이터 메트릭 계산
   */
  private static calculateInputMetrics(behaviorData: any): InputMetrics {
    const clickCount = behaviorData.clickCount || 0;
    const totalTime = behaviorData.totalTime || 0;
    const interactionTypes = behaviorData.interactionTypes || [];
    
    const behaviorDataPoints = clickCount + (totalTime > 0 ? 1 : 0) + interactionTypes.length;
    const timeSpan = totalTime;
    
    // 데이터 품질 평가 (0-1)
    let dataQuality = 0;
    if (clickCount > 5) dataQuality += 0.3;
    if (totalTime > 10000) dataQuality += 0.3; // 10초 이상
    if (interactionTypes.length > 2) dataQuality += 0.2;
    if (behaviorDataPoints > 10) dataQuality += 0.2;
    
    return {
      behaviorDataPoints,
      timeSpan,
      interactionTypes: [...interactionTypes],
      dataQuality: Math.min(1, dataQuality)
    };
  }
  
  /**
   * ⚖️ 가중치 시스템 설정
   */
  private static setupWeightingSystem(inputMetrics: InputMetrics): WeightingSystem {
    // 데이터 품질에 따른 가중치 조정
    const qualityMultiplier = inputMetrics.dataQuality;
    
    const behaviors = {
      clicks: 0.3 * qualityMultiplier,
      time: 0.2 * qualityMultiplier,
      interactions: 0.2 * qualityMultiplier,
      patterns: 0.3 * qualityMultiplier
    };
    
    const timeDecay = inputMetrics.timeSpan > 60000 ? 0.9 : 1.0; // 1분 이상이면 약간 감소
    
    const contextualFactors = {
      consistency: 0.4,
      diversity: 0.3,
      intensity: 0.3
    };
    
    const uncertaintyPenalty = 1 - inputMetrics.dataQuality * 0.3;
    
    return {
      behaviors,
      timeDecay,
      contextualFactors,
      uncertaintyPenalty
    };
  }
  
  /**
   * 🔢 점수 계산
   */
  private static calculateScores(big5Result: Big5InferenceResult, weightingSystem: WeightingSystem): ScoreCalculation {
    const personality = big5Result.personality;
    
    // 원시 점수 (Big5 결과에서)
    const rawScores = {
      openness: personality.openness.score,
      conscientiousness: personality.conscientiousness.score,
      extraversion: personality.extraversion.score,
      agreeableness: personality.agreeableness.score,
      neuroticism: personality.neuroticism.score
    };
    
    // 가중치 적용 점수
    const weightedScores = Object.entries(rawScores).reduce((acc, [trait, score]) => {
      acc[trait] = score * weightingSystem.timeDecay * weightingSystem.uncertaintyPenalty;
      return acc;
    }, {} as Record<string, number>);
    
    // 정규화 점수 (총합이 1이 되도록)
    const totalScore = Object.values(weightedScores).reduce((sum, score) => sum + score, 0);
    const normalizedScores = Object.entries(weightedScores).reduce((acc, [trait, score]) => {
      acc[trait] = totalScore > 0 ? score / totalScore : score;
      return acc;
    }, {} as Record<string, number>);
    
    // 신뢰도 가중 점수 (신뢰도가 높은 특성에 더 가중치)
    const confidenceWeightedScores = Object.entries(normalizedScores).reduce((acc, [trait, score]) => {
      const personalityTrait = personality[trait as keyof typeof personality] as any;
      const confidence = personalityTrait.confidence || 0.5;
      acc[trait] = score * (0.5 + confidence * 0.5); // 최소 50%, 최대 100% 가중치
      return acc;
    }, {} as Record<string, number>);
    
    return {
      rawScores,
      weightedScores,
      normalizedScores,
      confidenceWeightedScores
    };
  }
  
  /**
   * 🎯 신뢰도 계산
   */
  private static calculateConfidence(behaviorData: any, big5Result: Big5InferenceResult): ConfidenceCalculation {
    // 데이터 신뢰도
    const dataPoints = (behaviorData.clickCount || 0) + (behaviorData.totalTime > 0 ? 1 : 0);
    const dataConfidence = Math.min(dataPoints / 20, 1); // 20개 데이터 포인트를 완전 신뢰도로 가정
    
    // 시간적 일관성 (간단한 추정)
    const timeSpan = behaviorData.totalTime || 0;
    const temporalConsistency = timeSpan < 5000 ? 0.3 : Math.min(timeSpan / 60000, 1); // 1분을 최대로
    
    // 교차 검증 (Big5 결과 내 일관성)
    const big5Confidence = big5Result.confidence;
    const crossValidation = big5Confidence;
    
    // 전체 신뢰도
    const overallConfidence = (dataConfidence * 0.4 + temporalConsistency * 0.3 + crossValidation * 0.3);
    
    return {
      dataConfidence,
      temporalConsistency,
      crossValidation,
      overallConfidence
    };
  }
  
  /**
   * 🎲 최종 결정 로직
   */
  private static makeFinalDecision(
    scoreCalculation: ScoreCalculation,
    confidenceCalculation: ConfidenceCalculation
  ): FinalDecisionLogic {
    
    const scores = scoreCalculation.confidenceWeightedScores;
    const confidence = confidenceCalculation.overallConfidence;
    
    // 임계값 설정
    const primaryThreshold = 0.25; // 25% 이상이면 주요 성격
    const secondaryThreshold = 0.20; // 20% 이상이면 부차 성격
    const hybridThreshold = 0.15; // 주요와 부차 성격 차이가 15% 이하면 하이브리드
    const minimumConfidence = 0.5; // 최소 신뢰도
    
    // 성격 정렬
    const sortedTraits = Object.entries(scores)
      .sort(([,a], [,b]) => b - a);
    
    const [primaryTrait, primaryScore] = sortedTraits[0];
    const [secondaryTrait, secondaryScore] = sortedTraits[1];
    
    // 결정 논리
    let decisionReasoning = '';
    
    if (confidence < minimumConfidence) {
      decisionReasoning = `신뢰도 부족 (${(confidence * 100).toFixed(1)}%) - 기본 친화형 적용`;
    } else if (primaryScore < primaryThreshold) {
      decisionReasoning = `모든 성격 점수가 낮음 - 균형잡힌 친화형 적용`;
    } else if (primaryScore - secondaryScore < hybridThreshold) {
      decisionReasoning = `주요(${primaryTrait})와 부차(${secondaryTrait}) 성격 차이 미미 - 하이브리드 적용`;
    } else {
      decisionReasoning = `${primaryTrait} 성격이 명확히 우세 (${(primaryScore * 100).toFixed(1)}%)`;
    }
    
    return {
      primaryThreshold,
      secondaryThreshold,
      hybridThreshold,
      minimumConfidence,
      decisionReasoning
    };
  }
  
  /**
   * 👤 최종 성격 프로필 구축
   */
  private static buildFinalPersonality(
    scoreCalculation: ScoreCalculation,
    confidenceCalculation: ConfidenceCalculation,
    finalDecisionLogic: FinalDecisionLogic
  ): FinalPersonalityProfile {
    
    const scores = scoreCalculation.confidenceWeightedScores;
    const confidence = confidenceCalculation.overallConfidence;
    
    // 성격 정렬
    const sortedTraits = Object.entries(scores)
      .sort(([,a], [,b]) => b - a);
    
    const [primaryTraitName, primaryScore] = sortedTraits[0];
    const [secondaryTraitName, secondaryScore] = sortedTraits[1];
    
    // 주요 성격 특성
    const primary: PersonalityTrait = {
      trait: primaryTraitName,
      score: primaryScore,
      confidence: confidence,
      strength: this.getStrengthLevel(primaryScore),
      characteristics: this.getTraitCharacteristics(primaryTraitName)
    };
    
    // 부차 성격 특성 (하이브리드인 경우만)
    let secondary: PersonalityTrait | undefined;
    let hybrid = false;
    
    if (confidence >= finalDecisionLogic.minimumConfidence && 
        primaryScore >= finalDecisionLogic.primaryThreshold &&
        secondaryScore >= finalDecisionLogic.secondaryThreshold &&
        primaryScore - secondaryScore < finalDecisionLogic.hybridThreshold) {
      
      hybrid = true;
      secondary = {
        trait: secondaryTraitName,
        score: secondaryScore,
        confidence: confidence * 0.8, // 부차 성격은 신뢰도를 약간 낮춤
        strength: this.getStrengthLevel(secondaryScore),
        characteristics: this.getTraitCharacteristics(secondaryTraitName)
      };
    }
    
    // 신뢰도가 낮으면 기본 친화형으로
    if (confidence < finalDecisionLogic.minimumConfidence) {
      primary.trait = 'agreeableness';
      primary.score = 0.7;
      primary.characteristics = ['친화적', '균형잡힌', '적응적'];
      hybrid = false;
      secondary = undefined;
    }
    
    // 안정성 계산 (데이터 일관성 기반)
    const stability = confidenceCalculation.temporalConsistency;
    
    // 적응 필요도 (신뢰도가 낮을수록 더 적응 필요)
    const adaptabilityNeeded = 1 - confidence;
    
    return {
      primary,
      secondary,
      hybrid,
      confidence,
      stability,
      adaptabilityNeeded
    };
  }
  
  /**
   * 📈 강도 수준 계산
   */
  private static getStrengthLevel(score: number): 'weak' | 'moderate' | 'strong' | 'very_strong' {
    if (score < 0.3) return 'weak';
    if (score < 0.5) return 'moderate';
    if (score < 0.7) return 'strong';
    return 'very_strong';
  }
  
  /**
   * 🏷️ 성격별 특성
   */
  private static getTraitCharacteristics(trait: string): string[] {
    const characteristics: Record<string, string[]> = {
      openness: ['창의적', '호기심 많은', '개방적', '상상력이 풍부한'],
      conscientiousness: ['체계적', '신중한', '계획적', '책임감 있는'],
      extraversion: ['활발한', '사교적', '에너지 넘치는', '외향적'],
      agreeableness: ['친화적', '협력적', '따뜻한', '배려심 있는'],
      neuroticism: ['민감한', '변화에 민감한', '감정적', '신중한']
    };
    
    return characteristics[trait] || ['균형잡힌', '적응적'];
  }
  
  /**
   * 🔍 신뢰성 평가
   */
  private static assessReliability(
    inputMetrics: InputMetrics,
    confidenceCalculation: ConfidenceCalculation
  ): ReliabilityAssessment {
    
    const overallConfidence = confidenceCalculation.overallConfidence;
    
    let reliability: 'low' | 'medium' | 'high';
    const limitations: string[] = [];
    const recommendations: string[] = [];
    
    if (overallConfidence < 0.4) {
      reliability = 'low';
      limitations.push('데이터 부족', '짧은 관찰 시간');
      recommendations.push('더 많은 사용자 상호작용 필요', '장기간 관찰 권장');
    } else if (overallConfidence < 0.7) {
      reliability = 'medium';
      limitations.push('제한적 데이터');
      recommendations.push('추가 관찰을 통한 검증 필요');
    } else {
      reliability = 'high';
      recommendations.push('신뢰할 수 있는 성격 분석 결과');
    }
    
    // 데이터 품질에 따른 추가 제한사항
    if (inputMetrics.dataQuality < 0.5) {
      limitations.push('행동 데이터 품질 부족');
    }
    
    if (inputMetrics.timeSpan < 30000) { // 30초 미만
      limitations.push('관찰 시간 부족');
    }
    
    const trustScore = overallConfidence * inputMetrics.dataQuality;
    
    return {
      reliability,
      trustScore,
      limitations,
      recommendations
    };
  }
  
  /**
   * 💡 추천사항 생성
   */
  private static generateRecommendations(
    finalPersonality: FinalPersonalityProfile,
    reliabilityAssessment: ReliabilityAssessment
  ): PersonalityRecommendations {
    
    const primaryTrait = finalPersonality.primary.trait;
    
    // 성격별 콘텐츠 전략
    const contentStrategies: Record<string, ContentStrategy> = {
      openness: {
        primaryApproach: '창의적이고 탐험적인 접근',
        adaptationTriggers: ['새로운 관점 요구', '예술적 연결 기회'],
        contentParameters: {
          pace: 'normal',
          depth: 'deep',
          structure: 'exploratory',
          tone: 'enthusiastic'
        }
      },
      conscientiousness: {
        primaryApproach: '체계적이고 신뢰할 수 있는 접근',
        adaptationTriggers: ['정확성 요구', '구조화 필요'],
        contentParameters: {
          pace: 'normal',
          depth: 'deep',
          structure: 'linear',
          tone: 'formal'
        }
      },
      extraversion: {
        primaryApproach: '활발하고 상호작용적인 접근',
        adaptationTriggers: ['참여 유도', '에너지 부족'],
        contentParameters: {
          pace: 'fast',
          depth: 'moderate',
          structure: 'branching',
          tone: 'enthusiastic'
        }
      },
      agreeableness: {
        primaryApproach: '친화적이고 배려적인 접근',
        adaptationTriggers: ['갈등 요소', '협력 기회'],
        contentParameters: {
          pace: 'normal',
          depth: 'moderate',
          structure: 'linear',
          tone: 'warm'
        }
      },
      neuroticism: {
        primaryApproach: '안정적이고 안심시키는 접근',
        adaptationTriggers: ['불안 요소', '복잡성 감소'],
        contentParameters: {
          pace: 'slow',
          depth: 'shallow',
          structure: 'linear',
          tone: 'warm'
        }
      }
    };
    
    const contentStrategy = contentStrategies[primaryTrait] || contentStrategies.agreeableness;
    
    // 하이브리드인 경우 부차 접근법 추가
    if (finalPersonality.hybrid && finalPersonality.secondary) {
      const secondaryStrategy = contentStrategies[finalPersonality.secondary.trait];
      if (secondaryStrategy) {
        contentStrategy.secondaryApproach = secondaryStrategy.primaryApproach;
      }
    }
    
    // 상호작용 스타일
    const interactionStyle: InteractionStyle = {
      responseExpectation: primaryTrait === 'extraversion' ? 'immediate' : 'flexible',
      feedbackFrequency: finalPersonality.confidence > 0.7 ? 'moderate' : 'minimal',
      complexityLevel: primaryTrait === 'conscientiousness' ? 'high' : 'medium',
      personalizedLevel: finalPersonality.confidence
    };
    
    // 폴백 전략
    const fallbackStrategies: FallbackStrategy[] = [
      {
        condition: '성격 인식 실패',
        alternative: '보편적 친화형 접근',
        confidence: 0.8
      }
    ];
    
    if (reliabilityAssessment.reliability === 'low') {
      fallbackStrategies.push({
        condition: '신뢰도 부족',
        alternative: '보수적 개인화 적용',
        confidence: 0.6
      });
    }
    
    return {
      contentStrategy,
      interactionStyle,
      fallbackStrategies
    };
  }
  
  /**
   * ❓ 불확실성 처리
   */
  private static handleUncertainty(
    finalPersonality: FinalPersonalityProfile,
    inputMetrics: InputMetrics
  ): UncertaintyHandling {
    
    const uncertaintyLevel = 1 - finalPersonality.confidence;
    const causes: string[] = [];
    const mitigationStrategies: string[] = [];
    
    // 불확실성 원인 분석
    if (inputMetrics.dataQuality < 0.5) {
      causes.push('데이터 품질 부족');
      mitigationStrategies.push('더 많은 사용자 상호작용 수집');
    }
    
    if (inputMetrics.timeSpan < 30000) {
      causes.push('관찰 시간 부족');
      mitigationStrategies.push('장기간 행동 패턴 관찰');
    }
    
    if (inputMetrics.behaviorDataPoints < 10) {
      causes.push('행동 데이터 포인트 부족');
      mitigationStrategies.push('다양한 상호작용 유도');
    }
    
    // 일반적인 완화 전략
    mitigationStrategies.push('보수적 개인화 적용', '지속적 학습 및 업데이트');
    
    // 폴백 성격 (불확실할 때 사용)
    const fallbackPersonality: PersonalityTrait = {
      trait: 'agreeableness',
      score: 0.7,
      confidence: 0.8,
      strength: 'moderate',
      characteristics: ['친화적', '균형잡힌', '적응적']
    };
    
    // 적응적 매개변수
    const adaptiveParameters: AdaptiveParameters = {
      personalizedContent: Math.max(0.3, finalPersonality.confidence), // 최소 30% 개인화
      conservativeApproach: uncertaintyLevel > 0.5,
      multiModalFallback: uncertaintyLevel > 0.7,
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
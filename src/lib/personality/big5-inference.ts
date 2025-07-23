// 🧠 Big5 성격 추론 시스템 (간소화 버전)
// Phase 1 Task 1.2: 행동 데이터 → Big5 성격 자동 분류

export interface PersonalityTrait {
  score: number; // 0-1 scale
  level: 'very_low' | 'low' | 'average' | 'high' | 'very_high';
  confidence: number;
  indicators: string[];
}

export interface Big5Profile {
  openness: PersonalityTrait;
  conscientiousness: PersonalityTrait;
  extraversion: PersonalityTrait;
  agreeableness: PersonalityTrait;
  neuroticism: PersonalityTrait;
  dominant: keyof Big5Profile;
  secondary: keyof Big5Profile;
}

export interface Big5InferenceResult {
  personality: Big5Profile;
  confidence: number;
  overallAssessment: string;
}

/**
 * 🎯 Big5 성격 추론 엔진 (간소화 버전)
 */
export class Big5InferenceEngine {
  
  /**
   * 🎯 메인 추론 함수
   */
  public static inferBig5Personality(behaviorData: any): Big5InferenceResult {
    console.log('🧠 Big5 성격 추론 시작...');
    
    // 각 성격 특성별 분석
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
    
    const personalityProfile: Big5Profile = {
      ...traits,
      dominant: sortedTraits[0][0] as keyof Big5Profile,
      secondary: sortedTraits[1][0] as keyof Big5Profile
    };
    
    const confidence = this.calculateOverallConfidence(behaviorData, personalityProfile);
    const overallAssessment = this.generateOverallAssessment(personalityProfile);
    
    console.log(`✅ Big5 성격 추론 완료: ${personalityProfile.dominant} (${(confidence * 100).toFixed(1)}%)`);
    
    return {
      personality: personalityProfile,
      confidence,
      overallAssessment
    };
  }

  /**
   * 🔍 개방성 분석
   */
  private static analyzeOpenness(data: any): PersonalityTrait {
    let score = 0.5; // 기본값
    
    // 다양한 상호작용 타입 = 호기심
    if (data.interactionTypes?.length > 0) {
      const diversity = Math.min(data.interactionTypes.length / 5, 1);
      score = Math.max(score, diversity);
    }
    
    // 스크롤 깊이 = 탐험 정신
    if (data.scrollDepth > 50) {
      score += 0.3;
    }
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateBasicConfidence(data),
      indicators: this.getOpennessIndicators(score)
    };
  }

  /**
   * 📋 성실성 분석
   */
  private static analyzeConscientiousness(data: any): PersonalityTrait {
    let score = 0.5;
    
    // 오랜 체류 시간 = 신중함
    if (data.totalTime > 0) {
      const avgTimePerClick = data.totalTime / Math.max(data.clickCount, 1);
      if (avgTimePerClick > 3000) { // 3초 이상
        score += 0.3;
      }
    }
    
    // 클릭 전 고민 시간
    if (data.clickCount > 0 && data.totalTime > 0) {
      const deliberation = data.totalTime / data.clickCount;
      score = Math.max(score, Math.min(deliberation / 5000, 1));
    }
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateBasicConfidence(data),
      indicators: this.getConscientiousnessIndicators(score)
    };
  }

  /**
   * 🎉 외향성 분석
   */
  private static analyzeExtraversion(data: any): PersonalityTrait {
    let score = 0.5;
    
    // 클릭 빈도 = 활발함
    if (data.clickCount > 0 && data.totalTime > 0) {
      const clickRate = (data.clickCount / (data.totalTime / 1000)) * 60; // 분당 클릭
      score = Math.min(clickRate / 30, 1); // 분당 30클릭이 최대
    }
    
    // 상호작용 다양성
    if (data.interactionTypes?.length > 3) {
      score += 0.2;
    }
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateBasicConfidence(data),
      indicators: this.getExtraversionIndicators(score)
    };
  }

  /**
   * 🤝 친화성 분석
   */
  private static analyzeAgreeableness(data: any): PersonalityTrait {
    let score = 0.7; // 기본적으로 높게 설정 (친화적 가정)
    
    // 적당한 상호작용 = 협조성
    if (data.clickCount > 5 && data.clickCount < 50) {
      score += 0.1;
    }
    
    // 충분한 체류 시간 = 인내심
    if (data.totalTime > 30000) { // 30초 이상
      score += 0.1;
    }
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateBasicConfidence(data),
      indicators: this.getAgreeablenessIndicators(score)
    };
  }

  /**
   * 😰 신경증 분석
   */
  private static analyzeNeuroticism(data: any): PersonalityTrait {
    let score = 0.2; // 기본적으로 낮게 설정
    
    // 짧은 체류 시간 = 불안함
    if (data.totalTime > 0 && data.totalTime < 10000) { // 10초 미만
      score += 0.3;
    }
    
    // 과도한 클릭 = 초조함
    if (data.clickCount > 100) {
      score += 0.2;
    }
    
    score = Math.min(1, Math.max(0, score));
    
    return {
      score,
      level: this.getTraitLevel(score),
      confidence: this.calculateBasicConfidence(data),
      indicators: this.getNeuroticismIndicators(score)
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

  private static calculateBasicConfidence(data: any): number {
    // 데이터량 기반 신뢰도
    const dataPoints = (data.clickCount || 0) + (data.totalTime || 0) / 1000;
    return Math.min(dataPoints / 100, 1);
  }

  private static getOpennessIndicators(score: number): string[] {
    if (score > 0.7) return ['높은 탐색 욕구', '창의적 사고', '새로운 경험 추구'];
    if (score > 0.4) return ['적당한 호기심', '균형잡힌 관점'];
    return ['전통적 선호', '안정적 패턴'];
  }

  private static getConscientiousnessIndicators(score: number): string[] {
    if (score > 0.7) return ['체계적 접근', '높은 집중력', '계획적 행동'];
    if (score > 0.4) return ['적당한 조직력', '균형잡힌 접근'];
    return ['유연한 스타일', '즉흥적 행동'];
  }

  private static getExtraversionIndicators(score: number): string[] {
    if (score > 0.7) return ['활발한 상호작용', '빠른 응답', '높은 에너지'];
    if (score > 0.4) return ['균형잡힌 사교성', '적절한 상호작용'];
    return ['신중한 접근', '깊은 사고', '선택적 상호작용'];
  }

  private static getAgreeablenessIndicators(score: number): string[] {
    if (score > 0.7) return ['협력적 성향', '부드러운 상호작용', '높은 인내심'];
    if (score > 0.4) return ['적절한 협조성', '균형잡힌 대인관계'];
    return ['독립적 성향', '직접적 소통', '효율성 중시'];
  }

  private static getNeuroticismIndicators(score: number): string[] {
    if (score > 0.7) return ['스트레스 민감성', '감정적 변동성', '불안정한 패턴'];
    if (score > 0.4) return ['적당한 감정 반응', '보통 스트레스 대응'];
    return ['정서적 안정성', '스트레스 저항성', '일관된 패턴'];
  }

  private static calculateOverallConfidence(data: any, profile: Big5Profile): number {
    const dominantTrait = profile[profile.dominant] as PersonalityTrait;
    const dominantConfidence = dominantTrait.confidence;
    const dataQuality = this.calculateDataQuality(data);
    
    return (dominantConfidence * 0.7 + dataQuality * 0.3);
  }

  private static calculateDataQuality(data: any): number {
    const hasClicks = (data.clickCount || 0) > 0;
    const hasTime = (data.totalTime || 0) > 5000; // 5초 이상
    const hasInteractions = (data.interactionTypes?.length || 0) > 0;
    
    const qualityFactors = [hasClicks, hasTime, hasInteractions].filter(Boolean).length;
    return qualityFactors / 3;
  }

  private static generateOverallAssessment(profile: Big5Profile): string {
    const dominantTrait = profile[profile.dominant] as PersonalityTrait;
    const secondaryTrait = profile[profile.secondary] as PersonalityTrait;
    const dominantScore = dominantTrait.score;
    const secondaryScore = secondaryTrait.score;
    
    return `주요 성격: ${profile.dominant} (${(dominantScore * 100).toFixed(1)}%), ` +
           `부차적 성격: ${profile.secondary} (${(secondaryScore * 100).toFixed(1)}%)`;
  }
}

/**
 * 🚀 편의 함수
 */
export function inferPersonalityFromBehavior(behaviorData: any): Big5InferenceResult {
  return Big5InferenceEngine.inferBig5Personality(behaviorData);
}
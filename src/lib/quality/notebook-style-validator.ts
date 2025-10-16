/**
 * NotebookLM 스타일 팟캐스트 품질 검증 시스템
 * 실제 NotebookLM Audio Overview 분석 결과를 기준으로 한 자동 품질 검증
 */

export interface QualityMetrics {
  overall: number; // 0-100 종합 점수
  categories: {
    informationDensity: number;      // 정보 밀도
    conversationFlow: number;        // 대화 흐름
    audienceEngagement: number;      // 청취자 참여
    expertiseBalance: number;        // 전문성 균형
    naturalness: number;            // 자연스러움
    notebookLMAlignment: number;    // NotebookLM 스타일 일치도
  };
  recommendations: QualityRecommendation[];
  passesMinimumStandard: boolean;
}

export interface QualityRecommendation {
  category: keyof QualityMetrics['categories'];
  issue: string;
  solution: string;
  priority: 'high' | 'medium' | 'low';
  examples?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  score: QualityMetrics;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  detailedAnalysis: DetailedAnalysis;
}

export interface DetailedAnalysis {
  wordCount: number;
  speakerBalance: { host: number; curator: number };
  averageResponseLength: number;
  factCount: number;
  questionCount: number;
  engagementPhrases: string[];
  surpriseElements: string[];
  connectionWords: string[];
  technicalTerms: string[];
}

/**
 * NotebookLM 스타일 검증기 메인 클래스
 */
export class NotebookStyleValidator {
  
  // NotebookLM 품질 기준 상수
  private readonly QUALITY_STANDARDS = {
    MIN_OVERALL_SCORE: 75,
    MIN_INFO_DENSITY: 8,          // 1000자당 8개 이상의 구체적 사실
    MAX_RESPONSE_LENGTH: 150,      // 한 번에 150자 이하 응답
    MIN_ENGAGEMENT_COUNT: 5,       // 에피소드당 5회 이상 청취자 언급
    MIN_SURPRISE_COUNT: 3,         // 3회 이상 놀라움 요소
    IDEAL_SPEAKER_RATIO: 0.6,      // 60% 이상의 균형 (1.0이 완벽한 50:50)
    MIN_NATURAL_WORDS: 8           // 자연스러운 감탄사/연결어 8개 이상
  };

  /**
   * 메인 검증 함수
   */
  validatePodcastScript(script: string): ValidationResult {
    const analysis = this.performDetailedAnalysis(script);
    const metrics = this.calculateQualityMetrics(script, analysis);
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 에러 검증 (치명적 문제)
    this.validateCriticalIssues(script, analysis, errors);
    
    // 경고 검증 (품질 문제)
    this.validateQualityIssues(metrics, warnings);
    
    // 개선 제안
    this.generateSuggestions(metrics, suggestions);

    return {
      isValid: errors.length === 0 && metrics.overall >= this.QUALITY_STANDARDS.MIN_OVERALL_SCORE,
      score: metrics,
      errors,
      warnings, 
      suggestions,
      detailedAnalysis: analysis
    };
  }

  /**
   * 상세 분석 수행
   */
  private performDetailedAnalysis(script: string): DetailedAnalysis {
    // 화자별 분리
    const hostResponses = script.match(/\*\*진행자:\*\*[^*]*/g) || [];
    const curatorResponses = script.match(/\*\*큐레이터:\*\*[^*]*/g) || [];
    
    // 기본 통계
    const totalResponses = hostResponses.length + curatorResponses.length;
    const totalLength = script.replace(/\*\*[^*]+\*\*/g, '').length;
    
    // 사실 정보 추출
    const factPatterns = [
      /\d+(?:,\d{3})*(cm|kg|년|세기|층|점|명|개)/g,
      /국보\s*\d+호/g,
      /세계\s*[최고대][초고]/g,
      /\d{4}년/g,
      /높이\s*\d+/g,
      /무게\s*\d+/g
    ];
    const factCount = factPatterns.reduce((count, pattern) => 
      count + (script.match(pattern) || []).length, 0
    );

    // 질문 패턴 분석
    const questionCount = (script.match(/[?]/g) || []).length;
    
    // 참여 유도 문구
    const engagementPatterns = ['청취자', '여러분', '상상해보세요', '어떨까요', '함께', '우리'];
    const engagementPhrases: string[] = [];
    engagementPatterns.forEach(pattern => {
      const matches = script.match(new RegExp(pattern, 'g'));
      if (matches) engagementPhrases.push(...matches);
    });

    // 놀라움 요소
    const surprisePatterns = ['와', '헉', '정말', '놀라운', '신기한', '대단한', '엄청난'];
    const surpriseElements: string[] = [];
    surprisePatterns.forEach(pattern => {
      const matches = script.match(new RegExp(pattern, 'g'));
      if (matches) surpriseElements.push(...matches);
    });

    // 연결어 분석
    const connectionPatterns = ['그런데', '그리고', '또한', '하지만', '근데', '아', '어'];
    const connectionWords: string[] = [];
    connectionPatterns.forEach(pattern => {
      const matches = script.match(new RegExp(pattern, 'g'));
      if (matches) connectionWords.push(...matches);
    });

    // 전문 용어
    const technicalPatterns = ['박물관', '큐레이터', '전시', '소장품', '유물', '작품', '문화재'];
    const technicalTerms: string[] = [];
    technicalPatterns.forEach(pattern => {
      const matches = script.match(new RegExp(pattern, 'g'));
      if (matches) technicalTerms.push(...matches);
    });

    return {
      wordCount: script.length,
      speakerBalance: {
        host: hostResponses.length,
        curator: curatorResponses.length
      },
      averageResponseLength: Math.round(totalLength / Math.max(1, totalResponses)),
      factCount,
      questionCount,
      engagementPhrases,
      surpriseElements,
      connectionWords,
      technicalTerms
    };
  }

  /**
   * 품질 메트릭 계산
   */
  private calculateQualityMetrics(script: string, analysis: DetailedAnalysis): QualityMetrics {
    const categories = {
      informationDensity: this.calculateInformationDensity(script, analysis),
      conversationFlow: this.calculateConversationFlow(script, analysis),
      audienceEngagement: this.calculateAudienceEngagement(analysis),
      expertiseBalance: this.calculateExpertiseBalance(analysis),
      naturalness: this.calculateNaturalness(analysis),
      notebookLMAlignment: this.calculateNotebookLMAlignment(script, analysis)
    };

    const overall = Object.values(categories).reduce((sum, score) => sum + score, 0) / Object.keys(categories).length;
    const recommendations = this.generateRecommendations(categories);

    return {
      overall: Math.round(overall),
      categories: Object.fromEntries(
        Object.entries(categories).map(([key, value]) => [key, Math.round(value)])
      ) as QualityMetrics['categories'],
      recommendations,
      passesMinimumStandard: overall >= this.QUALITY_STANDARDS.MIN_OVERALL_SCORE
    };
  }

  /**
   * 정보 밀도 점수 계산
   */
  private calculateInformationDensity(script: string, analysis: DetailedAnalysis): number {
    // 1000자당 사실 개수
    const density = analysis.factCount / (script.length / 1000);
    
    // 목표: 8개 이상
    const score = Math.min(100, (density / this.QUALITY_STANDARDS.MIN_INFO_DENSITY) * 100);
    return score;
  }

  /**
   * 대화 흐름 점수 계산
   */
  private calculateConversationFlow(script: string, analysis: DetailedAnalysis): number {
    let score = 100;
    
    // 응답 길이 검사 (너무 긴 응답은 감점)
    if (analysis.averageResponseLength > this.QUALITY_STANDARDS.MAX_RESPONSE_LENGTH) {
      score -= Math.min(30, (analysis.averageResponseLength - this.QUALITY_STANDARDS.MAX_RESPONSE_LENGTH) * 0.5);
    }
    
    // 연결어 사용 빈도
    const connectionDensity = analysis.connectionWords.length / (script.length / 1000);
    if (connectionDensity < 5) score -= 15;
    
    // 질문과 대답의 균형
    const questionRatio = analysis.questionCount / (analysis.speakerBalance.host + analysis.speakerBalance.curator);
    if (questionRatio < 0.3) score -= 10; // 30% 미만 질문은 감점
    
    return Math.max(0, score);
  }

  /**
   * 청취자 참여 점수 계산
   */
  private calculateAudienceEngagement(analysis: DetailedAnalysis): number {
    const engagementCount = analysis.engagementPhrases.length;
    
    // 목표: 5회 이상
    const score = Math.min(100, (engagementCount / this.QUALITY_STANDARDS.MIN_ENGAGEMENT_COUNT) * 100);
    return score;
  }

  /**
   * 전문성 균형 점수 계산
   */
  private calculateExpertiseBalance(analysis: DetailedAnalysis): number {
    const { host, curator } = analysis.speakerBalance;
    
    if (host === 0 || curator === 0) return 0;
    
    const balance = Math.min(host, curator) / Math.max(host, curator);
    const score = Math.min(100, (balance / this.QUALITY_STANDARDS.IDEAL_SPEAKER_RATIO) * 100);
    
    return score;
  }

  /**
   * 자연스러움 점수 계산
   */
  private calculateNaturalness(analysis: DetailedAnalysis): number {
    let score = 0;
    
    // 놀라움 표현 점수 (40점)
    const surpriseScore = Math.min(40, (analysis.surpriseElements.length / this.QUALITY_STANDARDS.MIN_SURPRISE_COUNT) * 40);
    score += surpriseScore;
    
    // 자연스러운 연결어 점수 (30점)
    const naturalWords = analysis.connectionWords.filter(word => 
      ['아', '어', '음', '그런데', '근데'].includes(word)
    ).length;
    const naturalScore = Math.min(30, (naturalWords / this.QUALITY_STANDARDS.MIN_NATURAL_WORDS) * 30);
    score += naturalScore;
    
    // 감정 표현 다양성 점수 (30점)
    const uniqueEmotions = [...new Set(analysis.surpriseElements)].length;
    const emotionScore = Math.min(30, (uniqueEmotions / 5) * 30);
    score += emotionScore;
    
    return score;
  }

  /**
   * NotebookLM 스타일 일치도 계산
   */
  private calculateNotebookLMAlignment(script: string, analysis: DetailedAnalysis): number {
    let score = 100;
    
    // NotebookLM 특징적 패턴 검사
    const notebookPatterns = [
      /그런데\s+더\s+[흥놀]/g,         // "그런데 더 흥미로운/놀라운"
      /저도\s+[처이번]/g,             // "저도 처음/이번에"
      /청취자[분들]?[이가도]/g,        // 청취자 언급
      /상상해보세요/g,               // 참여 유도
      /[와헉어]\s*[!,]?\s*[정진]/g    // 자연스러운 감탄
    ];
    
    let patternCount = 0;
    notebookPatterns.forEach(pattern => {
      const matches = script.match(pattern) || [];
      patternCount += matches.length;
    });
    
    // 패턴 점수 (기본 50점에서 시작)
    const patternScore = Math.min(50, patternCount * 5);
    
    // 정보 계층화 점수 (50점)
    const layeringScore = this.calculateInformationLayering(script);
    
    score = patternScore + layeringScore;
    return Math.min(100, score);
  }

  /**
   * 정보 계층화 점수 계산 (NotebookLM의 핵심 특징)
   */
  private calculateInformationLayering(script: string): number {
    let score = 0;
    
    // 기본 → 심화 → 놀라운 정보 패턴 검사
    const layeringPatterns = [
      /기본적으로.*그런데.*놀라운/g,
      /\d+.*더.*신기한/g,
      /사실.*하지만.*정말/g
    ];
    
    layeringPatterns.forEach(pattern => {
      const matches = script.match(pattern) || [];
      score += matches.length * 15;
    });
    
    return Math.min(50, score);
  }

  /**
   * 치명적 문제 검증
   */
  private validateCriticalIssues(script: string, analysis: DetailedAnalysis, errors: string[]): void {
    // 화자 구분 누락
    if (!script.includes('**진행자:**') && !script.includes('**큐레이터:**')) {
      errors.push('화자 구분이 없습니다. **진행자:** 또는 **큐레이터:** 형식이 필요합니다.');
    }
    
    // 한쪽 화자만 존재
    if (analysis.speakerBalance.host === 0) {
      errors.push('진행자 대사가 없습니다.');
    }
    if (analysis.speakerBalance.curator === 0) {
      errors.push('큐레이터 대사가 없습니다.');
    }
    
    // 너무 짧은 스크립트
    if (script.length < 1000) {
      errors.push('스크립트가 너무 짧습니다. 최소 1000자 이상 필요합니다.');
    }
    
    // 사실 정보 부족
    if (analysis.factCount < 3) {
      errors.push('구체적인 사실 정보가 부족합니다. 최소 3개 이상의 팩트가 필요합니다.');
    }
  }

  /**
   * 품질 문제 검증
   */
  private validateQualityIssues(metrics: QualityMetrics, warnings: string[]): void {
    if (metrics.categories.informationDensity < 60) {
      warnings.push('정보 밀도가 낮습니다. 더 많은 구체적 사실을 포함하세요.');
    }
    
    if (metrics.categories.audienceEngagement < 50) {
      warnings.push('청취자 참여 유도가 부족합니다.');
    }
    
    if (metrics.categories.naturalness < 60) {
      warnings.push('대화가 부자연스럽습니다. 감탄사와 자연스러운 표현을 추가하세요.');
    }
    
    if (metrics.categories.expertiseBalance < 50) {
      warnings.push('진행자와 큐레이터의 발언 비율이 불균형합니다.');
    }
  }

  /**
   * 개선 제안 생성
   */
  private generateSuggestions(metrics: QualityMetrics, suggestions: string[]): void {
    if (metrics.categories.notebookLMAlignment < 80) {
      suggestions.push('NotebookLM 스타일을 더 반영하세요: "그런데 더 놀라운 건", "저도 이번에 처음 알았는데" 같은 표현 활용');
    }
    
    if (metrics.categories.conversationFlow < 70) {
      suggestions.push('대화 흐름을 개선하세요: 응답을 더 짧게 하고, 자연스러운 연결어를 사용하세요');
    }
    
    if (metrics.categories.informationDensity < 70) {
      suggestions.push('정보 밀도를 높이세요: 구체적인 숫자, 날짜, 크기 등을 더 포함하세요');
    }
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(categories: QualityMetrics['categories']): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];
    
    // 각 카테고리별 권장사항
    Object.entries(categories).forEach(([category, score]) => {
      if (score < 70) {
        recommendations.push(this.createRecommendation(category as keyof QualityMetrics['categories'], score));
      }
    });
    
    return recommendations;
  }

  /**
   * 카테고리별 권장사항 생성
   */
  private createRecommendation(category: keyof QualityMetrics['categories'], score: number): QualityRecommendation {
    const baseRecommendations = {
      informationDensity: {
        issue: '정보 밀도가 부족합니다',
        solution: '턴당 2-3개의 구체적인 사실(숫자, 날짜, 크기 등)을 포함하세요',
        examples: ['높이 27.5cm', '1973년에 발굴', '무게 1킬로그램']
      },
      conversationFlow: {
        issue: '대화 흐름이 부자연스럽습니다',
        solution: '응답을 짧게 하고 자연스러운 연결어를 사용하세요',
        examples: ['그런데', '아, 그리고', '근데 이거 알아요?']
      },
      audienceEngagement: {
        issue: '청취자 참여가 부족합니다',
        solution: '청취자를 직접 언급하고 참여를 유도하세요',
        examples: ['청취자분들도 놀라실 텐데', '여러분이라면 어떨까요?']
      },
      expertiseBalance: {
        issue: '진행자와 큐레이터 발언 비율이 불균형입니다',
        solution: '두 화자의 발언 횟수를 균등하게 조정하세요',
        examples: ['진행자 질문 → 큐레이터 답변 → 진행자 추가 질문 순서']
      },
      naturalness: {
        issue: '대화가 경직되어 있습니다',
        solution: '자연스러운 감탄사와 반응을 추가하세요',
        examples: ['와, 정말요?', '헉! 그 정도로?', '상상도 못했네요']
      },
      notebookLMAlignment: {
        issue: 'NotebookLM 스타일과 일치하지 않습니다',
        solution: 'NotebookLM 특유의 대화 패턴을 활용하세요',
        examples: ['그런데 더 흥미로운 건', '저도 이번에 처음 알았는데', '청취자분들이 궁금해하실 텐데']
      }
    };
    
    const rec = baseRecommendations[category];
    return {
      category,
      issue: rec.issue,
      solution: rec.solution,
      priority: score < 50 ? 'high' : score < 70 ? 'medium' : 'low',
      examples: rec.examples
    };
  }
}

/**
 * 간단한 검증 함수 (레거시 호환)
 */
export function validateNotebookStyle(script: string): boolean {
  const validator = new NotebookStyleValidator();
  const result = validator.validatePodcastScript(script);
  return result.isValid;
}

export default {
  NotebookStyleValidator,
  validateNotebookStyle
};
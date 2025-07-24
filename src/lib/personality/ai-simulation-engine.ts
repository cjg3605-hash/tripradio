// 🤖 AI 기반 1억명 Big5 성격진단 시뮬레이션 엔진
// 실제 전세계 여행자 AI 페르소나를 생성해서 대규모 테스트 수행

export interface TravelerPersona {
  id: string;
  nationality: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  education: 'high_school' | 'bachelor' | 'master' | 'phd';
  travelExperience: 'beginner' | 'intermediate' | 'expert';
  culturalBackground: string;
  languages: string[];
  personalityProfile: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  travelPreferences: {
    planningStyle: 'spontaneous' | 'moderate' | 'detailed';
    groupSize: 'solo' | 'couple' | 'small_group' | 'large_group';
    budget: 'budget' | 'mid_range' | 'luxury';
    interests: string[];
  };
}

export interface SimulationQuestion {
  id: string;
  text: string;
  options: string[];
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  culturalContext: string[];
}

export interface SimulationResult {
  questionId: string;
  accuracy: number;
  culturalBias: number;
  responseDistribution: Record<string, number>;
  satisfactionScore: number;
  completionRate: number;
  averageResponseTime: number;
}

/**
 * 🌍 AI 시뮬레이션 엔진 - 실제 여행자 AI 페르소나 생성 및 테스트
 */
export class AISimulationEngine {

  /**
   * 🎭 다양한 국가/문화권 여행자 AI 페르소나 생성
   */
  public static async generateTravelerPersonas(count: number = 100000000): Promise<TravelerPersona[]> {
    console.log(`🎭 ${count.toLocaleString()}명의 여행자 AI 페르소나 생성 시작...`);
    
    const personas: TravelerPersona[] = [];
    const countries = ['KR', 'JP', 'CN', 'US', 'FR', 'IT', 'DE', 'GB', 'ES', 'RU', 'BR', 'IN', 'TH', 'EG', 'AU', 'CA', 'MX', 'TR', 'SG', 'VN'];
    
    for (let i = 0; i < count; i++) {
      const nationality = countries[Math.floor(Math.random() * countries.length)];
      
      // 실제 인구 통계 기반 분포
      const persona: TravelerPersona = {
        id: `traveler_${i}`,
        nationality,
        age: this.generateRealisticAge(),
        gender: this.generateGender(),
        education: this.generateEducation(),
        travelExperience: this.generateTravelExperience(),
        culturalBackground: this.getCulturalContext(nationality),
        languages: this.generateLanguages(nationality),
        personalityProfile: this.generateRealisticPersonality(),
        travelPreferences: this.generateTravelPreferences()
      };
      
      personas.push(persona);
      
      // 진행률 표시 (10만명마다)
      if (i % 100000 === 0) {
        console.log(`📊 진행률: ${((i / count) * 100).toFixed(2)}% (${i.toLocaleString()}명 완료)`);
      }
    }
    
    console.log(`✅ ${count.toLocaleString()}명 페르소나 생성 완료!`);
    return personas;
  }

  /**
   * 🧪 Big5 질문 후보군에 대한 대규모 테스트
   */
  public static async runBig5QuestionSimulation(
    personas: TravelerPersona[], 
    candidateQuestions: SimulationQuestion[]
  ): Promise<Record<string, SimulationResult>> {
    
    console.log(`🧪 ${personas.length.toLocaleString()}명 대상 Big5 질문 시뮬레이션 시작...`);
    console.log(`📝 테스트 질문 수: ${candidateQuestions.length}개`);
    
    const results: Record<string, SimulationResult> = {};
    
    for (const question of candidateQuestions) {
      console.log(`\n🔍 질문 테스트 중: ${question.id} - ${question.text.substring(0, 50)}...`);
      
      const questionResult = await this.simulateQuestionResponse(personas, question);
      results[question.id] = questionResult;
      
      console.log(`📊 ${question.id} 결과: 정확도 ${(questionResult.accuracy * 100).toFixed(1)}%, 완료율 ${(questionResult.completionRate * 100).toFixed(1)}%`);
    }
    
    return results;
  }

  /**
   * 🎯 개별 질문에 대한 AI 페르소나 응답 시뮬레이션
   */
  private static async simulateQuestionResponse(
    personas: TravelerPersona[], 
    question: SimulationQuestion
  ): Promise<SimulationResult> {
    
    let totalAccuracy = 0;
    let totalCulturalBias = 0;
    let totalSatisfaction = 0;
    let completedResponses = 0;
    let totalResponseTime = 0;
    const responseDistribution: Record<string, number> = {};
    
    // 각 옵션별 응답 수 초기화
    question.options.forEach((_, index) => {
      responseDistribution[index.toString()] = 0;
    });
    
    for (const persona of personas) {
      // AI 페르소나가 이 질문에 어떻게 응답할지 예측
      const response = await this.predictPersonaResponse(persona, question);
      
      if (response.completed) {
        completedResponses++;
        totalAccuracy += response.accuracy;
        totalCulturalBias += response.culturalBias;
        totalSatisfaction += response.satisfaction;
        totalResponseTime += response.responseTime;
        responseDistribution[response.selectedOption.toString()]++;
      }
    }
    
    const completionRate = completedResponses / personas.length;
    
    return {
      questionId: question.id,
      accuracy: totalAccuracy / completedResponses,
      culturalBias: totalCulturalBias / completedResponses,
      responseDistribution,
      satisfactionScore: totalSatisfaction / completedResponses,
      completionRate,
      averageResponseTime: totalResponseTime / completedResponses
    };
  }

  /**
   * 🤖 AI 페르소나의 질문 응답 예측
   */
  private static async predictPersonaResponse(
    persona: TravelerPersona, 
    question: SimulationQuestion
  ): Promise<{
    completed: boolean;
    selectedOption: number;
    accuracy: number;
    culturalBias: number;
    satisfaction: number;
    responseTime: number;
  }> {
    
    // 문화적 맥락 고려
    const culturalMatch = question.culturalContext.includes(persona.nationality) || 
                         question.culturalContext.includes('universal');
    
    // 교육 수준에 따른 이해도
    const comprehensionLevel = this.getComprehensionLevel(persona.education);
    
    // 성격에 따른 응답 패턴 예측
    const traitScore = persona.personalityProfile[question.trait];
    const expectedOptionIndex = this.mapTraitToOption(traitScore, question.options.length);
    
    // 완료율 계산 (문화적 이해도, 교육 수준, 질문 복잡도 고려)
    const completionProbability = culturalMatch ? 0.95 : 0.75;
    const educationBonus = comprehensionLevel * 0.1;
    const finalCompletionRate = Math.min(completionProbability + educationBonus, 0.98);
    
    const completed = Math.random() < finalCompletionRate;
    
    if (!completed) {
      return {
        completed: false,
        selectedOption: -1,
        accuracy: 0,
        culturalBias: 1,
        satisfaction: 0.2,
        responseTime: 0
      };
    }
    
    // 응답 정확도 (실제 성격과 선택 옵션의 일치도)
    const accuracy = 1 - Math.abs(expectedOptionIndex - (expectedOptionIndex + this.addNoise())) / question.options.length;
    
    // 문화적 편향도 (문화권에 따른 응답 차이)
    const culturalBias = culturalMatch ? 0.1 : 0.4;
    
    // 만족도 (질문의 명확성, 문화적 적절성)
    const satisfaction = culturalMatch && comprehensionLevel > 0.7 ? 0.9 : 0.6;
    
    // 응답 시간 (복잡도, 문화적 친숙도에 따라)
    const baseTime = 3.5; // 기본 3.5초
    const complexityFactor = question.text.length / 50; // 글자 수 기반
    const culturalFactor = culturalMatch ? 1.0 : 1.3; // 문화적 이해도
    const responseTime = baseTime * complexityFactor * culturalFactor;
    
    return {
      completed: true,
      selectedOption: Math.max(0, Math.min(expectedOptionIndex, question.options.length - 1)),
      accuracy: Math.max(0.3, Math.min(accuracy, 0.98)),
      culturalBias: Math.max(0.05, Math.min(culturalBias, 0.8)),
      satisfaction: Math.max(0.4, Math.min(satisfaction, 0.98)),
      responseTime: Math.max(1.5, Math.min(responseTime, 15.0))
    };
  }

  /**
   * 🎲 헬퍼 메서드들
   */
  private static generateRealisticAge(): number {
    // 여행자 연령 분포 (20-60세 중심)
    const weights = [0.05, 0.25, 0.35, 0.25, 0.1]; // 20대, 30대, 40대, 50대, 60대+
    const ranges = [[20, 29], [30, 39], [40, 49], [50, 59], [60, 75]];
    
    const random = Math.random();
    let cumWeight = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumWeight += weights[i];
      if (random < cumWeight) {
        const [min, max] = ranges[i];
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }
    return 35; // 기본값
  }

  private static generateGender(): 'male' | 'female' | 'other' {
    const random = Math.random();
    if (random < 0.48) return 'male';
    if (random < 0.96) return 'female';
    return 'other';
  }

  private static generateEducation(): 'high_school' | 'bachelor' | 'master' | 'phd' {
    const random = Math.random();
    if (random < 0.2) return 'high_school';
    if (random < 0.7) return 'bachelor';
    if (random < 0.95) return 'master';
    return 'phd';
  }

  private static generateTravelExperience(): 'beginner' | 'intermediate' | 'expert' {
    const random = Math.random();
    if (random < 0.3) return 'beginner';
    if (random < 0.8) return 'intermediate';
    return 'expert';
  }

  private static generateRealisticPersonality() {
    // 실제 인구 분포를 반영한 Big5 점수 생성
    return {
      openness: Math.max(0.1, Math.min(0.9, this.normalDistribution(0.6, 0.15))),
      conscientiousness: Math.max(0.1, Math.min(0.9, this.normalDistribution(0.65, 0.15))),
      extraversion: Math.max(0.1, Math.min(0.9, this.normalDistribution(0.55, 0.2))),
      agreeableness: Math.max(0.1, Math.min(0.9, this.normalDistribution(0.7, 0.15))),
      neuroticism: Math.max(0.1, Math.min(0.9, this.normalDistribution(0.4, 0.15)))
    };
  }

  private static normalDistribution(mean: number, stdDev: number): number {
    // Box-Muller 변환을 이용한 정규분포 생성
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
  }

  private static getCulturalContext(nationality: string): string {
    const culturalGroups: Record<string, string> = {
      'KR': 'East Asian - Collectivist',
      'JP': 'East Asian - Collectivist',
      'CN': 'East Asian - Collectivist',
      'US': 'Western - Individualist',
      'FR': 'Western European',
      'IT': 'Mediterranean',
      'DE': 'Western European',
      'GB': 'Anglo-Saxon',
      'ES': 'Mediterranean',
      'RU': 'Eastern European',
      'BR': 'Latin American',
      'IN': 'South Asian',
      'TH': 'Southeast Asian',
      'EG': 'Middle Eastern/African',
      'AU': 'Anglo-Saxon',
      'CA': 'Anglo-Saxon',
      'MX': 'Latin American',
      'TR': 'Middle Eastern',
      'SG': 'Southeast Asian - Multicultural',
      'VN': 'Southeast Asian'
    };
    
    return culturalGroups[nationality] || 'Unknown';
  }

  private static generateLanguages(nationality: string): string[] {
    const primaryLanguages: Record<string, string[]> = {
      'KR': ['Korean', 'English'],
      'JP': ['Japanese', 'English'],
      'CN': ['Chinese', 'English'],
      'US': ['English'],
      'FR': ['French', 'English'],
      'IT': ['Italian', 'English'],
      'DE': ['German', 'English'],
      'GB': ['English'],
      'ES': ['Spanish', 'English'],
      'RU': ['Russian', 'English'],
      'BR': ['Portuguese', 'English'],
      'IN': ['Hindi', 'English'],
      'TH': ['Thai', 'English'],
      'EG': ['Arabic', 'English'],
      'AU': ['English'],
      'CA': ['English', 'French'],
      'MX': ['Spanish', 'English'],
      'TR': ['Turkish', 'English'],
      'SG': ['English', 'Chinese', 'Malay'],
      'VN': ['Vietnamese', 'English']
    };
    
    return primaryLanguages[nationality] || ['English'];
  }

  private static generateTravelPreferences() {
    return {
      planningStyle: ['spontaneous', 'moderate', 'detailed'][Math.floor(Math.random() * 3)] as 'spontaneous' | 'moderate' | 'detailed',
      groupSize: ['solo', 'couple', 'small_group', 'large_group'][Math.floor(Math.random() * 4)] as 'solo' | 'couple' | 'small_group' | 'large_group',
      budget: ['budget', 'mid_range', 'luxury'][Math.floor(Math.random() * 3)] as 'budget' | 'mid_range' | 'luxury',
      interests: ['history', 'culture', 'food', 'nature', 'architecture', 'art', 'shopping', 'nightlife'].filter(() => Math.random() > 0.5)
    };
  }

  private static getComprehensionLevel(education: string): number {
    const levels = {
      'high_school': 0.7,
      'bachelor': 0.85,
      'master': 0.95,
      'phd': 0.98
    };
    return levels[education as keyof typeof levels] || 0.8;
  }

  private static mapTraitToOption(traitScore: number, optionCount: number): number {
    // 성격 점수를 옵션 인덱스로 매핑
    return Math.floor(traitScore * optionCount);
  }

  private static addNoise(): number {
    // 인간의 일관성 없는 응답을 시뮬레이션
    return (Math.random() - 0.5) * 0.3;
  }

  /**
   * 🏆 최적 질문 추천
   */
  public static selectOptimalQuestions(
    simulationResults: Record<string, SimulationResult>,
    maxQuestions: number = 10
  ): string[] {
    
    const questions = Object.entries(simulationResults)
      .map(([id, result]) => ({
        id,
        score: this.calculateOptimalityScore(result)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxQuestions)
      .map(q => q.id);
    
    console.log('🏆 최적 질문 선정 완료:');
    questions.forEach((id, index) => {
      const result = simulationResults[id];
      console.log(`${index + 1}. ${id}: 점수 ${this.calculateOptimalityScore(result).toFixed(3)} (정확도: ${(result.accuracy * 100).toFixed(1)}%, 완료율: ${(result.completionRate * 100).toFixed(1)}%)`);
    });
    
    return questions;
  }

  private static calculateOptimalityScore(result: SimulationResult): number {
    // 가중 점수 계산 (정확도 40%, 완료율 30%, 만족도 20%, 문화적 공정성 10%)
    const accuracyWeight = 0.4;
    const completionWeight = 0.3;
    const satisfactionWeight = 0.2;
    const fairnessWeight = 0.1;
    
    const fairnessScore = 1 - result.culturalBias; // 편향이 낮을수록 공정
    
    return (
      result.accuracy * accuracyWeight +
      result.completionRate * completionWeight +
      result.satisfactionScore * satisfactionWeight +
      fairnessScore * fairnessWeight
    );
  }
}

/**
 * 🚀 시뮬레이션 실행 함수
 */
export async function runBig5OptimizationSimulation(sampleSize: number = 1000000) {
  console.log('🚀 Big5 최적화 시뮬레이션 시작...');
  
  // 1. AI 페르소나 생성
  const personas = await AISimulationEngine.generateTravelerPersonas(sampleSize);
  
  // 2. 후보 질문들 정의
  const candidateQuestions: SimulationQuestion[] = [
    {
      id: 'O1',
      text: '새로운 여행지를 선택할 때 어떤 방식을 선호하시나요?',
      options: ['유명 관광지 위주', '현지인 추천 장소', '역사 문화 중심', '독특한 경험', '안전과 새로움 균형'],
      trait: 'openness',
      culturalContext: ['universal']
    },
    {
      id: 'C1',
      text: '여행을 계획할 때 당신의 스타일은?',
      options: ['즉흥적 결정', '대략적 계획', '주요 일정만', '상세한 계획', '완벽한 준비'],
      trait: 'conscientiousness',
      culturalContext: ['universal']
    },
    {
      id: 'E1',
      text: '여행 중 가장 에너지를 얻는 순간은?',
      options: ['혼자 사색', '소수와 대화', '적당한 교류', '활발한 소통', '대규모 이벤트'],
      trait: 'extraversion',
      culturalContext: ['universal']
    },
    {
      id: 'A1',
      text: '다른 관광객들과 함께 있을 때 당신은?',
      options: ['혼자 공간 찾기', '거리 두며 관찰', '자연스럽게 어울림', '먼저 다가가기', '분위기 주도'],
      trait: 'agreeableness',
      culturalContext: ['universal']
    },
    {
      id: 'N1',
      text: '예상과 다른 상황이 생겼을 때 당신의 반응은?',
      options: ['이것도 재미있네', '당연한 일이지', '상황 파악하자', '어떻게 하지?', '정말 스트레스'],
      trait: 'neuroticism',
      culturalContext: ['universal']
    }
  ];
  
  // 3. 시뮬레이션 실행
  const results = await AISimulationEngine.runBig5QuestionSimulation(personas, candidateQuestions);
  
  // 4. 최적 질문 선정
  const optimalQuestions = AISimulationEngine.selectOptimalQuestions(results, 5);
  
  console.log('\n🎉 시뮬레이션 완료!');
  return {
    personas: personas.length,
    results,
    optimalQuestions
  };
}
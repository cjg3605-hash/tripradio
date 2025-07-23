// 🧠 스마트 콘텐츠 생성기: AI 유형분류 → 적정 글자수 → 최적화 생성

interface UserProfile {
  personality: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  culturalBackground: 'east_asia' | 'western' | 'middle_east' | 'africa' | 'latin_america' | 'south_asia';
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  visitContext: 'solo' | 'couple' | 'family' | 'friends' | 'group';
  timeAvailable: number; // 총 가능한 시간 (분)
  interests: string[];
  language: string;
}

interface ChapterRequirement {
  id: number;
  title: string;
  targetDuration: number; // 분
  optimalCharacters: number;
  contentFocus: string[];
  personalityAdaptations: string[];
  culturalConsiderations: string[];
}

interface LocationAnalysis {
  category: 'natural' | 'historical' | 'religious' | 'cultural' | 'urban';
  complexity: number; // 0.0-1.0
  culturalSensitivity: number; // 0.0-1.0
  physicalRequirements: 'easy' | 'moderate' | 'challenging';
  recommendedChapterCount: number;
  totalOptimalDuration: number;
}

export class SmartContentGenerator {
  
  /**
   * 🎯 1단계: 사용자 유형 자동 분류
   */
  async classifyUserProfile(
    userInputs: any, 
    behaviorData: any, 
    previousInteractions: any[]
  ): Promise<UserProfile> {
    
    // Big5 성격 분류 알고리즘
    const personalityScore = this.calculatePersonalityScore(userInputs, behaviorData);
    const personality = this.determinePrimaryPersonality(personalityScore);
    
    // 문화적 배경 추론
    const culturalBackground = this.inferCulturalBackground(
      userInputs.language, 
      userInputs.location, 
      userInputs.preferences
    );
    
    // 전문성 수준 평가
    const expertiseLevel = this.assessExpertiseLevel(
      previousInteractions, 
      userInputs.interests, 
      behaviorData.searchDepth
    );
    
    return {
      personality,
      culturalBackground,
      expertiseLevel,
      visitContext: userInputs.visitContext || 'solo',
      timeAvailable: userInputs.timeAvailable || 60,
      interests: userInputs.interests || [],
      language: userInputs.language || 'ko'
    };
  }

  /**
   * 🏛️ 2단계: 장소 분석 및 구조 설계
   */
  async analyzeLocationAndDesignStructure(
    locationName: string, 
    userProfile: UserProfile
  ): Promise<{
    locationAnalysis: LocationAnalysis;
    chapterStructure: ChapterRequirement[];
  }> {
    
    // 장소 카테고리 및 복잡도 분석
    const locationAnalysis = await this.analyzeLocation(locationName);
    
    // 사용자 프로필 기반 최적 구조 설계
    const chapterStructure = this.designOptimalStructure(locationAnalysis, userProfile);
    
    return { locationAnalysis, chapterStructure };
  }

  /**
   * 📏 3단계: 챕터별 적정 글자수 계산
   */
  calculateOptimalCharacters(
    targetDuration: number, 
    userProfile: UserProfile, 
    contentComplexity: number
  ): number {
    
    // 기본 TTS 속도 (분당 글자수)
    const baseTTSSpeed = 260;
    
    // 개인화 요소별 속도 조정
    const personalitySpeedModifier = this.getPersonalitySpeedModifier(userProfile.personality);
    const culturalSpeedModifier = this.getCulturalSpeedModifier(userProfile.culturalBackground);
    const expertiseSpeedModifier = this.getExpertiseSpeedModifier(userProfile.expertiseLevel);
    const complexitySpeedModifier = this.getComplexitySpeedModifier(contentComplexity);
    
    // 조정된 속도 계산
    const adjustedSpeed = baseTTSSpeed * 
      personalitySpeedModifier * 
      culturalSpeedModifier * 
      expertiseSpeedModifier * 
      complexitySpeedModifier;
    
    // 휴지 시간 고려 (전체 시간의 25-35%)
    const pauseRatio = this.calculatePauseRatio(userProfile, contentComplexity);
    const speakingTime = targetDuration * (1 - pauseRatio);
    
    // 최적 글자수 계산
    const optimalCharacters = Math.round(speakingTime * adjustedSpeed);
    
    return optimalCharacters;
  }

  /**
   * ✍️ 4단계: 개인화된 콘텐츠 생성
   */
  async generatePersonalizedContent(
    chapterRequirement: ChapterRequirement,
    userProfile: UserProfile,
    locationContext: any
  ): Promise<string> {
    
    // 콘텐츠 생성 프롬프트 구성
    const generationPrompt = this.buildGenerationPrompt(
      chapterRequirement,
      userProfile,
      locationContext
    );
    
    // AI 모델을 통한 콘텐츠 생성
    const generatedContent = await this.callAIModel(generationPrompt);
    
    // 글자수 검증 및 조정
    const validatedContent = await this.validateAndAdjustLength(
      generatedContent,
      chapterRequirement.optimalCharacters,
      userProfile
    );
    
    return validatedContent;
  }

  /**
   * 🔧 개인화 요소별 속도 조정 함수들
   */
  private getPersonalitySpeedModifier(personality: string): number {
    const modifiers = {
      openness: 0.95,        // 창의적 설명을 위해 약간 느리게
      conscientiousness: 1.05, // 체계적이므로 약간 빠르게
      extraversion: 1.10,    // 활발한 톤으로 빠르게
      agreeableness: 0.90,   // 부드러운 톤으로 느리게
      neuroticism: 0.85      // 안정감을 위해 더 느리게
    };
    return modifiers[personality] || 1.0;
  }

  private getCulturalSpeedModifier(culture: string): number {
    const modifiers = {
      east_asia: 0.90,      // 침묵의 미학, 여유로운 템포
      western: 1.05,        // 효율성 선호, 빠른 템포
      middle_east: 0.95,    // 스토리텔링 문화, 적당한 템포
      africa: 0.88,         // 구술 전통, 느긋한 템포
      latin_america: 1.02,  // 열정적 표현, 약간 빠른 템포
      south_asia: 0.93      // 철학적 사고, 사려깊은 템포
    };
    return modifiers[culture] || 1.0;
  }

  private getExpertiseSpeedModifier(expertise: string): number {
    const modifiers = {
      beginner: 0.80,    // 충분한 설명시간 필요
      intermediate: 0.95, // 적당한 설명 속도
      advanced: 1.10,    // 빠른 정보 처리 가능
      expert: 1.20       // 고밀도 정보 선호
    };
    return modifiers[expertise] || 1.0;
  }

  private getComplexitySpeedModifier(complexity: number): number {
    // 복잡도가 높을수록 느리게 (0.8 - 1.2 범위)
    return 1.2 - (complexity * 0.4);
  }

  private calculatePauseRatio(userProfile: UserProfile, complexity: number): number {
    let baseRatio = 0.30; // 기본 30% 휴지
    
    // 성격별 조정
    if (userProfile.personality === 'neuroticism') baseRatio += 0.05;
    if (userProfile.personality === 'conscientiousness') baseRatio -= 0.03;
    
    // 문화별 조정
    if (userProfile.culturalBackground === 'east_asia') baseRatio += 0.05;
    if (userProfile.culturalBackground === 'western') baseRatio -= 0.03;
    
    // 복잡도별 조정
    baseRatio += complexity * 0.08;
    
    return Math.max(0.25, Math.min(0.40, baseRatio));
  }

  /**
   * 🎯 프롬프트 구성
   */
  private buildGenerationPrompt(
    chapter: ChapterRequirement,
    profile: UserProfile,
    context: any
  ): string {
    
    const personalityInstructions = this.getPersonalityInstructions(profile.personality);
    const culturalInstructions = this.getCulturalInstructions(profile.culturalBackground);
    const lengthRequirement = `정확히 ${chapter.optimalCharacters}자 (±50자) 범위로 작성하세요.`;
    
    return `
당신은 99.12% 만족도를 달성한 UltimateTourGuide AI입니다.

## 사용자 프로필
- 성격: ${profile.personality} (${personalityInstructions})
- 문화: ${profile.culturalBackground} (${culturalInstructions})
- 전문성: ${profile.expertiseLevel}
- 상황: ${profile.visitContext}
- 관심사: ${profile.interests.join(', ')}

## 콘텐츠 요구사항
- 제목: ${chapter.title}
- 목표 시간: ${chapter.targetDuration}분
- ${lengthRequirement}
- 초점: ${chapter.contentFocus.join(', ')}

## 반드시 포함할 요소
${chapter.personalityAdaptations.map(adaptation => `- ${adaptation}`).join('\n')}

## 문화적 고려사항
${chapter.culturalConsiderations.map(consideration => `- ${consideration}`).join('\n')}

## 콘텐츠 구조
1. 흥미 유발 (10%)
2. 핵심 정보 (40%)
3. 스토리텔링 (30%) 
4. 개인적 연결 (20%)

위 프로필과 요구사항에 맞춰 ${chapter.optimalCharacters}자 분량의 완벽한 가이드 콘텐츠를 생성하세요.
    `;
  }

  /**
   * 📊 글자수 검증 및 자동 조정
   */
  private async validateAndAdjustLength(
    content: string,
    targetCharacters: number,
    userProfile: UserProfile
  ): Promise<string> {
    
    const currentLength = content.length;
    const tolerance = 50; // ±50자 허용
    
    if (Math.abs(currentLength - targetCharacters) <= tolerance) {
      return content; // 적정 범위 내
    }
    
    if (currentLength < targetCharacters - tolerance) {
      // 내용 확장 필요
      return await this.expandContent(content, targetCharacters - currentLength, userProfile);
    } else {
      // 내용 축약 필요  
      return await this.compressContent(content, currentLength - targetCharacters, userProfile);
    }
  }

  /**
   * 🎛️ 메인 실행 함수
   */
  async generateSmartGuide(
    locationName: string,
    userInputs: any,
    behaviorData: any = {},
    previousInteractions: any[] = []
  ): Promise<{
    userProfile: UserProfile;
    locationAnalysis: LocationAnalysis;
    chapters: Array<{
      requirement: ChapterRequirement;
      content: string;
      actualCharacters: number;
      estimatedDuration: string;
    }>;
    totalDuration: number;
    satisfactionPrediction: number;
  }> {
    
    // 1단계: 사용자 유형 분류
    console.log('🎯 1단계: 사용자 유형 자동 분류 중...');
    const userProfile = await this.classifyUserProfile(userInputs, behaviorData, previousInteractions);
    
    // 2단계: 장소 분석 및 구조 설계
    console.log('🏛️ 2단계: 장소 분석 및 구조 설계 중...');
    const { locationAnalysis, chapterStructure } = await this.analyzeLocationAndDesignStructure(
      locationName, 
      userProfile
    );
    
    // 3단계: 각 챕터별 적정 글자수 계산
    console.log('📏 3단계: 챕터별 적정 글자수 계산 중...');
    const optimizedChapters = chapterStructure.map(chapter => ({
      ...chapter,
      optimalCharacters: this.calculateOptimalCharacters(
        chapter.targetDuration,
        userProfile,
        locationAnalysis.complexity
      )
    }));
    
    // 4단계: 개인화된 콘텐츠 생성
    console.log('✍️ 4단계: 개인화된 콘텐츠 생성 중...');
    const generatedChapters = [];
    
    for (const chapter of optimizedChapters) {
      console.log(`   - ${chapter.title} (목표: ${chapter.optimalCharacters}자) 생성 중...`);
      
      const content = await this.generatePersonalizedContent(
        chapter,
        userProfile,
        { locationName, locationAnalysis }
      );
      
      generatedChapters.push({
        requirement: chapter,
        content,
        actualCharacters: content.length,
        estimatedDuration: this.calculateEstimatedDuration(content.length, userProfile)
      });
    }
    
    // 만족도 예측
    const satisfactionPrediction = this.predictSatisfaction(
      generatedChapters,
      userProfile,
      locationAnalysis
    );
    
    console.log('✅ 스마트 가이드 생성 완료!');
    console.log(`🎯 예상 만족도: ${satisfactionPrediction.toFixed(2)}%`);
    
    return {
      userProfile,
      locationAnalysis,
      chapters: generatedChapters,
      totalDuration: generatedChapters.reduce((sum, ch) => sum + ch.requirement.targetDuration, 0),
      satisfactionPrediction
    };
  }

  // Helper methods (구현 생략된 부분들)
  private calculatePersonalityScore(userInputs: any, behaviorData: any): any { return {}; }
  private determinePrimaryPersonality(scores: any): any { return 'openness'; }
  private inferCulturalBackground(language: string, location: string, preferences: any): any { return 'east_asia'; }
  private assessExpertiseLevel(interactions: any[], interests: string[], searchDepth: any): any { return 'intermediate'; }
  private async analyzeLocation(locationName: string): Promise<LocationAnalysis> { 
    return {
      category: 'historical',
      complexity: 0.8,
      culturalSensitivity: 0.9,
      physicalRequirements: 'moderate',
      recommendedChapterCount: 6,
      totalOptimalDuration: 36
    };
  }
  private designOptimalStructure(location: LocationAnalysis, profile: UserProfile): ChapterRequirement[] { return []; }
  private getPersonalityInstructions(personality: string): string { return ''; }
  private getCulturalInstructions(culture: string): string { return ''; }
  private async callAIModel(prompt: string): Promise<string> { return ''; }
  private async expandContent(content: string, needed: number, profile: UserProfile): Promise<string> { return content; }
  private async compressContent(content: string, excess: number, profile: UserProfile): Promise<string> { return content; }
  private calculateEstimatedDuration(characters: number, profile: UserProfile): string { return '5분 30초'; }
  private predictSatisfaction(chapters: any[], profile: UserProfile, location: LocationAnalysis): number { return 99.12; }
}

// 사용 예시
export async function generateOptimizedGuide(locationName: string, userContext: any) {
  const generator = new SmartContentGenerator();
  
  return await generator.generateSmartGuide(
    locationName,
    userContext.inputs,
    userContext.behavior,
    userContext.history
  );
}
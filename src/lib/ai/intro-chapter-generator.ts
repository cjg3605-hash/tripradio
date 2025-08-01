// 🎯 Enhanced Intro Chapter Generation System
// 전체 장소에 대한 종합적 배경지식과 문화적 맥락을 제공하는 인트로 챕터 생성

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LocationData, IntroChapter, UserProfile } from '@/types/enhanced-chapter';

/**
 * 🏛️ 향상된 인트로 챕터 생성기
 * - 전체 장소에 대한 종합적 배경지식 제공
 * - 투어 이해를 위한 필수 사전지식 포함
 * - 일반 챕터보다 20-25% 더 긴 분량
 */
export class EnhancedIntroChapterGenerator {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is required for intro chapter generation');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY!);
  }

  /**
   * 🎯 메인 엔트리포인트: 종합적 인트로 챕터 생성
   */
  async generateEnhancedIntroChapter(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<IntroChapter> {
    console.log('🎯 Enhanced Intro Chapter 생성 시작:', locationData.name);

    // 1️⃣ 역사적 배경 생성 (AI 기반)
    const historicalBackground = await this.generateComprehensiveHistoricalBackground(
      locationData, 
      userProfile
    );

    // 2️⃣ 문화적 맥락 생성 (AI 기반)  
    const culturalContext = await this.generateRichCulturalContext(
      locationData,
      userProfile
    );

    // 3️⃣ 방문 기대치 설정 (상세 프리뷰)
    const expectationSetting = await this.generateDetailedExpectationSetting(
      locationData,
      userProfile
    );

    // 4️⃣ 실용적 방문 팁 생성
    const visitingTips = await this.generatePracticalVisitingTips(
      locationData,
      userProfile
    );

    // 5️⃣ 하이라이트 프리뷰 생성
    const highlightsPreview = this.generateComprehensiveHighlightsPreview(locationData);

    // 6️⃣ 최적 시작점 결정
    const startingPoint = await this.determineOptimalStartingPoint(locationData);

    // 7️⃣ 시간 배정 (전체의 20-25%)
    const timeEstimate = Math.ceil(locationData.averageVisitDuration * 0.22); // 22%

    return {
      id: 0,
      type: 'introduction',
      title: `${locationData.name} - 여행의 시작`,
      location: {
        type: startingPoint.type,
        coordinates: startingPoint.coordinates,
        description: startingPoint.description
      },
      content: {
        historicalBackground,
        culturalContext,
        visitingTips,
        whatsToExpected: expectationSetting,
        timeEstimate,
        highlightsPreview
      },
      triggers: {
        primaryTrigger: {
          type: 'gps_proximity',
          coordinates: startingPoint.coordinates,
          radius: 50
        },
        alternativeTriggers: [
          {
            type: 'manual_start',
            description: '수동 시작 버튼'
          },
          {
            type: 'qr_code',
            location: 'entrance_gate',
            description: '입구 QR코드 스캔'
          }
        ]
      },
      navigation: {
        nextChapterHint: this.generateIntelligentNextChapterHint(locationData),
        estimatedDuration: timeEstimate
      }
    };
  }

  /**
   * 🏛️ 종합적 역사적 배경 생성 (AI 기반)
   */
  private async generateComprehensiveHistoricalBackground(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3, // 정확성 중시
        maxOutputTokens: 1024
      }
    });

    const prompt = this.createHistoricalBackgroundPrompt(locationData, userProfile);
    
    try {
      console.log('🏛️ AI 역사적 배경 생성 중...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // 응답 검증 및 정제
      return this.validateAndRefineContent(response, 'historical');
      
    } catch (error) {
      console.warn('⚠️ AI 역사적 배경 생성 실패, 기본값 사용:', error);
      return this.getFallbackHistoricalBackground(locationData);
    }
  }

  /**
   * 🎨 풍부한 문화적 맥락 생성 (AI 기반)
   */
  private async generateRichCulturalContext(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4, // 창의성과 정확성 균형
        maxOutputTokens: 1024
      }
    });

    const prompt = this.createCulturalContextPrompt(locationData, userProfile);
    
    try {
      console.log('🎨 AI 문화적 맥락 생성 중...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.validateAndRefineContent(response, 'cultural');
      
    } catch (error) {
      console.warn('⚠️ AI 문화적 맥락 생성 실패, 기본값 사용:', error);
      return this.getFallbackCulturalContext(locationData);
    }
  }

  /**
   * 🔮 상세한 기대치 설정 생성
   */
  private async generateDetailedExpectationSetting(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512
      }
    });

    const prompt = this.createExpectationSettingPrompt(locationData, userProfile);
    
    try {
      console.log('🔮 AI 기대치 설정 생성 중...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.validateAndRefineContent(response, 'expectation');
      
    } catch (error) {
      console.warn('⚠️ AI 기대치 설정 생성 실패, 기본값 사용:', error);
      return this.getFallbackExpectationSetting(locationData);
    }
  }

  /**
   * 💡 실용적 방문 팁 생성
   */
  private async generatePracticalVisitingTips(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2, // 실용성 중시
        maxOutputTokens: 512
      }
    });

    const prompt = this.createVisitingTipsPrompt(locationData, userProfile);
    
    try {
      console.log('💡 AI 방문 팁 생성 중...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      return this.validateAndRefineContent(response, 'tips');
      
    } catch (error) {
      console.warn('⚠️ AI 방문 팁 생성 실패, 기본값 사용:', error);
      return this.getFallbackVisitingTips(locationData);
    }
  }

  /**
   * 📝 역사적 배경 프롬프트 생성
   */
  private createHistoricalBackgroundPrompt(
    locationData: LocationData,
    userProfile?: UserProfile
  ): string {
    const userContext = userProfile ? `
사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '30대'}  
- 지식수준: ${userProfile.knowledgeLevel || '중급'}
- 희망시간: ${userProfile.tourDuration || 90}분
    ` : '';

    const venueTypeContext = this.getVenueTypeContext(locationData.venueType);

    return `
당신은 전문 문화해설사입니다. ${locationData.name}을 처음 방문하는 관광객에게 투어 시작 전 필수 배경지식을 제공하세요.

## 🎯 목표
${locationData.name} 전체에 대한 종합적 역사적 배경을 설명하여, 이후 투어에서 개별 지점들을 더 깊이 이해할 수 있도록 돕기

## 📢 인트로 챕터 특별 요구사항
- **반드시 친근한 인사말로 시작**: "안녕하세요, ${locationData.name}에 오신 것을 환영합니다" 또는 이와 유사한 따뜻한 인사말
- 투어 시작에 대한 기대감과 환영의 분위기 조성
- 가이드와 방문객 간의 친밀한 소통 톤 유지

## 📍 장소 정보
- 이름: ${locationData.name}
- 유형: ${locationData.venueType} (${venueTypeContext})
- 규모: ${locationData.scale}
- 평균 방문시간: ${locationData.averageVisitDuration}분

${userContext}

## ✅ 포함 내용 (반드시)
1. **전체적 역사 개관** (2-3 문단)
   - 건립/창건 배경과 시기
   - 주요 역사적 변천사
   - 현재에 이르기까지의 발전 과정

2. **시대적 맥락** (1-2 문단)  
   - 건립 당시의 사회적/정치적 배경
   - 해당 시기의 문화적 특징
   - 역사 속에서의 의미와 역할

3. **건축/구성의 의미** (1-2 문단)
   - 전체 구조와 배치의 의미
   - 건축 양식과 그 배경
   - 공간 구성의 철학과 목적

## ❌ 금지사항
- 구체적 업체명이나 상점명 언급 금지
- 확인되지 않은 세부 정보 금지  
- 추측성 표현 ("아마도", "추정된다" 등) 금지
- 과장된 수치나 통계 금지

## 📝 출력 조건
- 한국어로 작성
- 600-800자 분량 (충분한 배경지식 제공)
- 자연스러운 문단 구성
- 전문적이지만 이해하기 쉬운 톤

지금 ${locationData.name}에 대한 종합적 역사적 배경을 작성하세요.
    `;
  }

  /**
   * 🎨 문화적 맥락 프롬프트 생성
   */
  private createCulturalContextPrompt(
    locationData: LocationData,
    userProfile?: UserProfile
  ): string {
    const userContext = userProfile ? `
사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '30대'}
- 지식수준: ${userProfile.knowledgeLevel || '중급'}
    ` : '';

    return `
당신은 문화 전문가입니다. ${locationData.name}의 문화적 의미와 맥락을 투어 시작 전에 설명하여, 관람 중 더 깊은 이해를 돕고자 합니다.

## 🎯 목표  
${locationData.name}의 문화적 의미와 맥락을 종합적으로 설명하여, 개별 관람 포인트들의 의미를 더 잘 이해할 수 있는 문화적 토대 제공

## 📢 인트로 챕터 특별 요구사항
- 투어 시작의 환영 분위기 유지
- 친근하고 전문적인 가이드 톤

## 📍 장소 정보
- 이름: ${locationData.name}
- 유형: ${locationData.venueType}
- 규모: ${locationData.scale}

${userContext}

## ✅ 포함 내용 (반드시)
1. **문화적 위치와 의미** (2 문단)
   - 해당 지역/국가 문화에서의 위상
   - 문화 발전사에서의 역할과 기여
   - 현재 문화적 의미와 상징성

2. **예술적/학문적 가치** (1-2 문단)
   - 소장품이나 건축물의 문화적 가치
   - 예술사나 학문사에서의 중요성
   - 문화 전승과 교육적 의미

3. **사회적 맥락** (1 문단)
   - 지역 사회와의 관계
   - 문화 생활에서의 역할
   - 사람들에게 주는 의미

## ❌ 금지사항
- 구체적 업체명 언급 금지
- 확인되지 않은 정보 금지
- 추측성 표현 금지
- 과도한 미화나 과장 금지

## 📝 출력 조건
- 한국어로 작성
- 500-700자 분량
- 교육적이면서 흥미로운 톤
- 문화적 깊이가 있는 설명

지금 ${locationData.name}의 문화적 맥락을 작성하세요.
    `;
  }

  /**
   * 🔮 기대치 설정 프롬프트 생성
   */
  private createExpectationSettingPrompt(
    locationData: LocationData,
    userProfile?: UserProfile
  ): string {
    const highlights = locationData.tier1Points?.map(p => p.name).join(', ') || '주요 관람 포인트들';

    return `
당신은 관광 안내 전문가입니다. ${locationData.name}을 처음 방문하는 관광객에게 무엇을 기대할 수 있는지 미리 안내하여 준비된 마음으로 관람할 수 있도록 돕고자 합니다.

## 🎯 목표
${locationData.name}에서 보고 경험할 수 있는 것들을 구체적으로 미리 안내하여, 관람 중 놓치지 않고 의미있게 감상할 수 있도록 기대치 설정

## 📢 인트로 챕터 특별 요구사항
- 환영하는 분위기로 기대감 조성
- 투어에 대한 긍정적 기대와 흥미 유발

## 📍 장소 정보
- 이름: ${locationData.name}
- 주요 하이라이트: ${highlights}
- 평균 방문시간: ${locationData.averageVisitDuration}분
- 규모: ${locationData.scale}

## ✅ 포함 내용 (반드시)
1. **주요 볼거리 개관** (2-3문장)
   - 가장 중요한 관람 포인트들 소개
   - 각각의 특별한 점과 의미

2. **관람 경험 예고** (2-3문장)
   - 어떤 분위기와 감동을 느낄 수 있는지
   - 시각적, 감성적 경험에 대한 준비

3. **주의 깊게 볼 점** (1-2문장)
   - 특별히 관심 있게 봐야 할 세부사항
   - 놓치기 쉬운 중요한 포인트

## ❌ 금지사항
- 과도한 기대감 조성 금지
- 확인되지 않은 세부 정보 금지
- 구체적 업체명 언급 금지

## 📝 출력 조건
- 한국어로 작성  
- 300-400자 분량
- 기대감을 높이면서도 현실적인 톤
- 구체적이고 도움이 되는 정보

지금 ${locationData.name}에서의 기대치를 설정해주세요.
    `;
  }

  /**
   * 💡 방문 팁 프롬프트 생성
   */
  private createVisitingTipsPrompt(
    locationData: LocationData,
    userProfile?: UserProfile
  ): string {
    const durationContext = locationData.averageVisitDuration > 120 ? '장시간' : '적당한 시간';
    const venueContext = locationData.venueType === 'outdoor' ? '야외' : 
                         locationData.venueType === 'indoor' ? '실내' : '실내외';

    return `
당신은 관광 안내 전문가입니다. ${locationData.name}을 효과적이고 편안하게 관람할 수 있는 실용적인 팁을 제공하세요.

## 🎯 목표
${locationData.name} 관람을 위한 실용적이고 도움되는 팁을 제공하여, 더 나은 관람 경험을 할 수 있도록 지원

## 📢 인트로 챕터 특별 요구사항
- 도움이 되는 친절한 가이드 톤 유지
- 방문객을 배려하는 따뜻한 조언

## 📍 장소 정보
- 이름: ${locationData.name}
- 관람 환경: ${venueContext}
- 소요 시간: ${durationContext} (${locationData.averageVisitDuration}분)
- 규모: ${locationData.scale}

## ✅ 포함 내용 (반드시)
1. **최적 관람 시간** (1-2문장)
   - 언제 방문하는 것이 좋은지
   - 피해야 할 시간대가 있다면

2. **준비사항과 복장** (1-2문장)
   - 편안한 신발, 옷차림 추천
   - 필요한 준비물이나 주의사항

3. **효율적 관람법** (2-3문장)
   - 어떤 순서나 방법으로 보는 것이 좋은지
   - 시간 절약하면서 알차게 보는 방법

4. **편의시설 정보** (1문장)
   - 휴식 공간, 화장실, 카페 등 기본 정보

## ❌ 금지사항
- 구체적 업체명이나 상점명 언급 금지
- 확인되지 않은 세부 정보 금지
- 가격이나 운영시간 등 변동 가능한 정보 금지

## 📝 출력 조건
- 한국어로 작성
- 400-500자 분량  
- 실용적이고 도움되는 톤
- 구체적이고 적용 가능한 팁

지금 ${locationData.name} 방문 팁을 작성하세요.
    `;
  }

  /**
   * 🔍 콘텐츠 검증 및 정제
   */
  private validateAndRefineContent(content: string, type: string): string {
    // 기본 정제: 불필요한 마크다운 제거, 줄바꿈 정리
    let refined = content
      .replace(/\*\*|\*|#/g, '') // 마크다운 제거
      .replace(/\n{3,}/g, '\n\n') // 과도한 줄바꿈 정리
      .trim();

    // 🎯 인트로 챕터용 인사말 보장 (historical 타입에서만)
    if (type === 'historical') {
      const greetingPatterns = [
        /^안녕하세요/,
        /^반갑습니다/,
        /^환영합니다/,
        /^안녕/,
        /오신.*것.*환영/
      ];
      
      const hasGreeting = greetingPatterns.some(pattern => pattern.test(refined));
      
      if (!hasGreeting) {
        console.log('🔧 인사말 누락 감지, 자동 추가 중...');
        refined = `안녕하세요, 여기 오신 것을 환영합니다. ${refined}`;
      }
    }

    // 길이 검증
    const minLength = type === 'historical' ? 400 : type === 'cultural' ? 300 : 200;
    const maxLength = type === 'historical' ? 1000 : type === 'cultural' ? 800 : 600;

    if (refined.length < minLength) {
      console.warn(`⚠️ ${type} 콘텐츠가 너무 짧음: ${refined.length}자`);
    }
    
    if (refined.length > maxLength) {
      console.warn(`⚠️ ${type} 콘텐츠가 너무 김: ${refined.length}자`);
      refined = refined.substring(0, maxLength - 3) + '...';
    }

    return refined;
  }

  /**
   * 🏛️ 장소 유형별 컨텍스트 제공
   */
  private getVenueTypeContext(venueType: string): string {
    const contexts = {
      'indoor': '실내 관람 공간, 박물관이나 미술관 형태',
      'outdoor': '야외 관람 공간, 자연이나 야외 시설',
      'mixed': '실내외 복합 공간, 궁궐이나 복합 문화시설'
    };
    
    return contexts[venueType as keyof typeof contexts] || '복합 문화 공간';
  }

  /**
   * 🎯 종합적 하이라이트 프리뷰 생성
   */
  private generateComprehensiveHighlightsPreview(locationData: LocationData): string[] {
    const tier1Names = locationData.tier1Points?.map(p => p.name) || [];
    const tier2Names = locationData.tier2Points?.slice(0, 2).map(p => p.name) || [];
    
    return [...tier1Names, ...tier2Names].slice(0, 5); // 최대 5개
  }

  /**
   * 🧭 지능적 다음 챕터 힌트 생성
   */
  private generateIntelligentNextChapterHint(locationData: LocationData): string {
    const firstPoint = locationData.tier1Points?.[0] || locationData.tier2Points?.[0];
    
    if (!firstPoint) {
      return '첫 번째 관람 지점으로 이동하여 본격적인 여행을 시작하세요.';
    }

    const venueContext = locationData.venueType === 'outdoor' ? 
      `${firstPoint.name} 방향으로 걸어가며` : 
      `${firstPoint.name}이 있는 전시실로 이동하며`;

    return `${venueContext} 방금 들은 배경지식을 바탕으로 실제 모습을 감상해보세요. 투어의 하이라이트가 시작됩니다.`;
  }

  /**
   * 📍 최적 시작점 결정
   */
  private async determineOptimalStartingPoint(locationData: LocationData) {
    // 실제로는 더 정교한 로직으로 최적 시작점 결정
    return {
      type: 'entrance' as const,
      coordinates: locationData.coordinates,
      description: `${locationData.name} 정문 입구 - 투어의 시작점`
    };
  }

  /**
   * 🔄 폴백 콘텐츠 생성 메서드들
   */
  private getFallbackHistoricalBackground(locationData: LocationData): string {
    return `안녕하세요, ${locationData.name}에 오신 것을 환영합니다. ${locationData.name}은 오랜 역사를 간직한 소중한 문화 공간입니다. 이곳은 시대의 변화 속에서도 그 가치와 의미를 지켜온 특별한 장소로, 방문객들에게 깊이 있는 역사적 경험을 선사합니다. 과거와 현재가 만나는 이 공간에서, 우리는 선조들의 지혜와 문화적 유산을 직접 체험할 수 있습니다.`;
  }

  private getFallbackCulturalContext(locationData: LocationData): string {
    return `${locationData.name}은 우리 문화의 중요한 상징이자 교육의 장입니다. 이곳에서는 전통과 현대가 조화롭게 어우러진 모습을 볼 수 있으며, 문화적 가치와 예술적 의미를 깊이 이해할 수 있습니다. 많은 사람들이 이곳을 통해 문화적 감동과 배움을 얻어가는 의미 있는 공간입니다.`;
  }

  private getFallbackExpectationSetting(locationData: LocationData): string {
    return `${locationData.name}에서는 다양하고 흥미로운 볼거리들을 만날 수 있습니다. 각 관람 포인트마다 특별한 의미와 아름다움이 있어, 천천히 감상하며 그 가치를 느껴보시기 바랍니다. 준비된 마음으로 관람하신다면 더욱 의미 있는 경험을 하실 수 있을 것입니다.`;
  }

  private getFallbackVisitingTips(locationData: LocationData): string {
    return `${locationData.name} 관람을 위해서는 편안한 신발과 복장을 권합니다. 충분한 시간을 가지고 여유롭게 둘러보시며, 각 지점에서 제공되는 설명을 주의 깊게 들어보세요. 사진 촬영 시에는 관련 규정을 확인하시고, 다른 관람객들을 배려하는 마음으로 관람해 주시기 바랍니다.`;
  }
}
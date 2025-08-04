/**
 * 🎯 Specific Starting Point Generator
 * AI 기반 구체적 시작점 생성 시스템
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LocationData, UserProfile } from '@/types/enhanced-chapter';

export interface SpecificStartingPoint {
  type: 'entrance_gate' | 'ticket_booth' | 'main_building_entrance' | 
        'courtyard_center' | 'information_center' | 'parking_area';
  specificName: string; // "정문 매표소", "대웅전 정면 계단 하단"
  description: string;
  expectedFeatures: string[]; // ["매표소 건물", "안내판", "돌계단"]
  relativePosition: string; // "본관 건물 정면으로부터 50m 전방"
  accessibilityNotes: string; // "계단 있음, 휠체어 접근 어려움"
  confidence: number; // 0-1 범위
  reasoning: string; // AI 결정 이유
}

export class SpecificStartingPointGenerator {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private cache = new Map<string, SpecificStartingPoint>();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

  private initialize() {
    if (this.model) return; // 이미 초기화됨
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, AI starting point generation disabled');
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2, // 일관성 중시
        maxOutputTokens: 512,
        topP: 0.8
      }
    });
  }

  /**
   * 🎯 메인 메서드: 구체적 시작점 생성
   */
  async generateConcreteStartingPoint(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<SpecificStartingPoint> {
    // 런타임 초기화
    this.initialize();
    
    // 캐시 확인
    const cacheKey = this.generateCacheKey(locationData.name, userProfile);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('💾 구체적 시작점 캐시 히트:', locationData.name);
      return cached;
    }

    // AI 생성 또는 폴백
    const startingPoint = this.model ? 
      await this.generateWithAI(locationData, userProfile) :
      await this.generateFallback(locationData);

    // 캐시 저장
    this.saveToCache(cacheKey, startingPoint);
    
    console.log('✅ 구체적 시작점 생성 완료:', {
      location: locationData.name,
      specificName: startingPoint.specificName,
      confidence: startingPoint.confidence
    });

    return startingPoint;
  }

  /**
   * 🤖 AI 기반 구체적 시작점 생성
   */
  private async generateWithAI(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<SpecificStartingPoint> {
    const prompt = this.createAIPrompt(locationData, userProfile);
    
    try {
      console.log('🤖 AI 구체적 시작점 생성 중:', locationData.name);
      
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // JSON 응답 파싱
      const parsed = this.parseAIResponse(response);
      
      // 검증 및 보완
      return this.validateAndEnhance(parsed, locationData);
      
    } catch (error) {
      console.warn('⚠️ AI 생성 실패, 폴백 사용:', error);
      return await this.generateFallback(locationData);
    }
  }

  /**
   * 📝 AI 프롬프트 생성
   */
  private createAIPrompt(
    locationData: LocationData,
    userProfile?: UserProfile
  ): string {
    const userContext = userProfile ? `
사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '30대'}  
- 동반자: ${userProfile.companions || '개인'}
- 접근성 요구사항: ${userProfile.accessibilityNeeds ? '휠체어 접근 필요' : '일반'}
    ` : '';

    const venueTypeHints = this.getVenueTypeHints(locationData.venueType);
    const scaleHints = this.getScaleHints(locationData.scale);

    return `
당신은 관광지 전문가입니다. ${locationData.name}을 처음 방문하는 관광객이 쉽게 찾을 수 있는 **구체적이고 명확한 시작점**을 결정하세요.

## 📍 장소 정보
- 이름: ${locationData.name}
- 유형: ${locationData.venueType} (${venueTypeHints})
- 규모: ${locationData.scale} (${scaleHints})
- 평균 방문시간: ${locationData.averageVisitDuration}분
- 티어1 포인트: ${locationData.tier1Points?.map(p => p.name).join(', ') || '정보 없음'}

${userContext}

## 🎯 구체적 시작점 요구사항
1. **명확한 식별점**: "정문" → "정문 매표소", "입구" → "대웅전 정면 계단"처럼 구체적 건물/시설 지정
2. **관광객 친화적**: 대중교통이나 주차장에서 쉽게 접근 가능한 지점
3. **투어 동선 최적화**: 전체 관람 경로의 자연스러운 출발점
4. **특징 기반 식별**: 사진으로 확인 가능한 구체적 랜드마크들

## 🏛️ 장소별 맞춤 가이드라인
${this.getLocationSpecificGuidelines(locationData)}

## 📝 **반드시 JSON 형태로만** 응답하세요
{
  "type": "ticket_booth|entrance_gate|main_building_entrance|courtyard_center|information_center|parking_area",
  "specificName": "한국어로 구체적 명칭 (예: 정문 매표소, 대웅전 정면 계단)",
  "description": "방문객을 위한 상세 위치 설명 (50자 이내)",
  "expectedFeatures": ["특징1", "특징2", "특징3"],
  "relativePosition": "주요 건물 기준 상대적 위치와 거리",
  "accessibilityNotes": "접근성 관련 주의사항",
  "confidence": 0.9,
  "reasoning": "이 지점을 선택한 논리적 이유"
}

예시 응답:
{
  "type": "ticket_booth",
  "specificName": "흥례문 앞 매표소",
  "description": "경복궁 정문인 광화문을 지나 흥례문 바로 앞에 위치한 매표소",
  "expectedFeatures": ["매표소 건물", "흥례문", "해태상", "안내판"],
  "relativePosition": "광화문 광장에서 북쪽으로 300m, 흥례문 정면 50m 전방",
  "accessibilityNotes": "평지로 휠체어 접근 가능, 계단 없음",
  "confidence": 0.95,
  "reasoning": "매표소는 모든 관광객이 반드시 거치는 지점이며, 흥례문이라는 명확한 랜드마크가 있어 찾기 쉽습니다."
}

지금 ${locationData.name}에 대한 구체적 시작점을 JSON으로 생성하세요.
    `;
  }

  /**
   * 🏛️ 장소별 맞춤 가이드라인 생성
   */
  private getLocationSpecificGuidelines(locationData: LocationData): string {
    const guidelines: string[] = [];

    // 궁궐/사찰 가이드라인
    if (locationData.name.includes('궁') || locationData.name.includes('사찰') || locationData.name.includes('절')) {
      guidelines.push('- 전통 건축물: 정문, 매표소, 주요 건물 입구 등 구체적 건축 구조물 활용');
      guidelines.push('- 출입 동선: 실제 관람 동선의 시작점을 고려하여 설정');
    }

    // 박물관/미술관 가이드라인  
    if (locationData.name.includes('박물관') || locationData.name.includes('미술관') || locationData.name.includes('갤러리')) {
      guidelines.push('- 실내 시설: 로비, 매표소, 안내데스크 등 실내 랜드마크 활용');
      guidelines.push('- 전시 동선: 상설전시 시작점이나 메인 전시실 입구 고려');
    }

    // 야외 명소 가이드라인
    if (locationData.venueType === 'outdoor') {
      guidelines.push('- 야외 시설: 주차장, 방문자센터, 주요 조형물 등 야외 랜드마크 활용');
      guidelines.push('- 접근성: 대중교통 하차점이나 주차장에서의 접근 경로 고려');
    }

    return guidelines.length > 0 ? guidelines.join('\n') : '- 일반적인 관광지 시작점 원칙 적용';
  }

  /**
   * 🔍 AI 응답 파싱
   */
  private parseAIResponse(response: string): any {
    try {
      // JSON 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식이 아님');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // 필수 필드 검증
      const requiredFields = ['type', 'specificName', 'description', 'expectedFeatures'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`필수 필드 누락: ${field}`);
        }
      }
      
      return parsed;
      
    } catch (error) {
      console.warn('AI 응답 파싱 실패:', error);
      throw error;
    }
  }

  /**
   * ✅ 검증 및 보완
   */
  private validateAndEnhance(
    parsed: any, 
    locationData: LocationData
  ): SpecificStartingPoint {
    return {
      type: parsed.type || 'entrance_gate',
      specificName: parsed.specificName || `${locationData.name} 입구`,
      description: parsed.description || `${locationData.name}의 시작점`,
      expectedFeatures: Array.isArray(parsed.expectedFeatures) ? 
        parsed.expectedFeatures : ['입구', '안내판'],
      relativePosition: parsed.relativePosition || '메인 건물 앞',
      accessibilityNotes: parsed.accessibilityNotes || '접근성 정보 확인 필요',
      confidence: Math.min(Math.max(parsed.confidence || 0.7, 0.5), 1.0),
      reasoning: parsed.reasoning || 'AI 분석 결과'
    };
  }

  /**
   * 🔄 폴백: 규칙 기반 시작점 생성
   */
  private async generateFallback(locationData: LocationData): Promise<SpecificStartingPoint> {
    console.log('🔄 폴백 모드: 규칙 기반 시작점 생성');
    
    const fallbackRules = this.getFallbackRules(locationData);
    
    return {
      type: fallbackRules.type,
      specificName: fallbackRules.specificName,
      description: fallbackRules.description,
      expectedFeatures: fallbackRules.expectedFeatures,
      relativePosition: fallbackRules.relativePosition,
      accessibilityNotes: fallbackRules.accessibilityNotes,
      confidence: 0.6, // 폴백은 낮은 신뢰도
      reasoning: '규칙 기반 폴백 생성'
    };
  }

  /**
   * 📋 폴백 규칙 정의
   */
  private getFallbackRules(locationData: LocationData): Omit<SpecificStartingPoint, 'confidence' | 'reasoning'> {
    const name = locationData.name.toLowerCase();
    
    // 궁궐
    if (name.includes('궁')) {
      return {
        type: 'ticket_booth',
        specificName: `${locationData.name} 매표소`,
        description: `${locationData.name} 정문 매표소`,
        expectedFeatures: ['매표소 건물', '정문', '안내판', '해태상'],
        relativePosition: '정문 앞 50m 지점',
        accessibilityNotes: '평지, 휠체어 접근 가능'
      };
    }
    
    // 사찰/절
    if (name.includes('사찰') || name.includes('절')) {
      return {
        type: 'entrance_gate',
        specificName: `${locationData.name} 일주문`,
        description: `${locationData.name} 입구의 일주문`,
        expectedFeatures: ['일주문', '안내판', '매표소', '주차장'],
        relativePosition: '주차장에서 도보 2분',
        accessibilityNotes: '일부 경사로 있음'
      };
    }
    
    // 박물관/미술관
    if (name.includes('박물관') || name.includes('미술관')) {
      return {
        type: 'main_building_entrance',
        specificName: `${locationData.name} 메인 로비`,
        description: `${locationData.name} 주 건물 로비`,
        expectedFeatures: ['메인 로비', '안내데스크', '매표소', '층별 안내판'],
        relativePosition: '주 건물 1층 중앙',
        accessibilityNotes: '엘리베이터 완비, 휠체어 접근 가능'
      };
    }
    
    // 기본값
    return {
      type: 'entrance_gate',
      specificName: `${locationData.name} 입구`,
      description: `${locationData.name}의 메인 입구`,
      expectedFeatures: ['입구', '안내판', '매표소'],
      relativePosition: '메인 건물 앞',
      accessibilityNotes: '접근성 정보 확인 필요'
    };
  }

  /**
   * 🔧 헬퍼 메서드들
   */
  private getVenueTypeHints(venueType: string): string {
    const hints = {
      'indoor': '실내 관람 공간, 로비나 안내데스크 활용',
      'outdoor': '야외 관람 공간, 입구나 방문자센터 활용',
      'mixed': '실내외 복합 공간, 메인 입구나 중앙 광장 활용'
    };
    return hints[venueType as keyof typeof hints] || '복합 문화 공간';
  }

  private getScaleHints(scale: string): string {
    const hints = {
      'world_heritage': '세계적 명소, 명확한 랜드마크 활용',
      'national_museum': '국가급 시설, 메인 로비나 대표 입구',
      'major_attraction': '주요 관광지, 대표적인 출입구',
      'regional_site': '지역 명소, 방문자센터나 주차장 기준',
      'local_attraction': '로컬 명소, 가장 접근하기 쉬운 지점'
    };
    return hints[scale as keyof typeof hints] || '일반적인 문화 공간';
  }

  private generateCacheKey(locationName: string, userProfile?: UserProfile): string {
    const profileKey = userProfile ? 
      `${userProfile.ageGroup}_${userProfile.companions}_${userProfile.accessibilityNeeds ? 'accessible' : 'standard'}` : 
      'default';
    return `specific_start:${locationName}:${profileKey}`;
  }

  private getFromCache(key: string): SpecificStartingPoint | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(key)) {
      return cached;
    }
    return null;
  }

  private saveToCache(key: string, data: SpecificStartingPoint): void {
    this.cache.set(key, {
      ...data,
      _timestamp: Date.now()
    } as any);
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key) as any;
    if (!cached || !cached._timestamp) return false;
    return Date.now() - cached._timestamp < this.CACHE_DURATION;
  }

  /**
   * 📊 통계 및 관리 메서드
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ 구체적 시작점 캐시 클리어됨');
  }
}

// 싱글톤 인스턴스
export const specificStartingPointGenerator = new SpecificStartingPointGenerator();
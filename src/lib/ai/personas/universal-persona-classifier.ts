// Universal Persona Classifier
// AI 기반 글로벌 다국어 페르소나 분류 시스템

import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  LocationContext,
  PersonaClassificationResult,
  GlobalPersona,
  GlobalPersonaType,
  CulturalContext,
  AIAnalysisResult,
  ClassifierConfig,
  ClassifierMetrics,
  PromptAdaptation
} from './types';
import { GLOBAL_PERSONA_CATALOG, getPersonaByType } from './persona-catalog';
import { CulturalContextEngine } from './cultural-context-engine';

/**
 * 🌍 유니버설 페르소나 분류기
 * AI 기반으로 전 세계 모든 관광지에 대해 최적의 페르소나를 선택하는 시스템
 */
export class UniversalPersonaClassifier {
  private genAI: GoogleGenerativeAI | null = null;
  private config: ClassifierConfig;
  private metrics: ClassifierMetrics;

  constructor(apiKey?: string, config?: Partial<ClassifierConfig>) {
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.config = {
      aiModel: 'gemini',
      language: 'en',
      fallbackPersona: 'arts_culture',
      confidenceThreshold: 0.7,
      enableCulturalAdaptation: true,
      enableAIAnalysis: true,
      ...config
    };
    
    this.metrics = {
      totalClassifications: 0,
      averageConfidence: 0,
      accuracyScore: 0,
      culturalAdaptationUsage: 0,
      topPersonas: [],
      averageResponseTime: 0
    };
  }

  /**
   * 🎯 메인 분류 함수 - 위치에 최적의 페르소나 선택
   */
  async classifyLocation(locationContext: LocationContext): Promise<PersonaClassificationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🌍 Universal Persona Classifier 시작:', locationContext.name);
      
      // 1️⃣ 문화적 컨텍스트 분석
      const culturalContext = CulturalContextEngine.analyzeCulturalContext(locationContext);
      console.log('🎭 문화적 컨텍스트:', culturalContext);

      // 2️⃣ AI 기반 분석 (가능한 경우)
      let aiAnalysis: AIAnalysisResult | null = null;
      if (this.config.enableAIAnalysis && this.genAI) {
        try {
          aiAnalysis = await this.performAIAnalysis(locationContext, culturalContext);
          console.log('🤖 AI 분석 결과:', aiAnalysis);
        } catch (aiError) {
          console.warn('⚠️ AI 분석 실패, 규칙 기반 분류로 대체:', aiError);
        }
      }

      // 3️⃣ 페르소나 선택 (AI 우선, 규칙 기반 폴백)
      const { persona, confidence, reasoning } = aiAnalysis && aiAnalysis.confidence > this.config.confidenceThreshold
        ? this.selectPersonaFromAIAnalysis(aiAnalysis)
        : this.selectPersonaByRules(locationContext, culturalContext);

      // 4️⃣ 대안 페르소나 생성
      const alternativePersonas = this.generateAlternativePersonas(
        persona, 
        locationContext, 
        culturalContext,
        aiAnalysis
      );

      // 5️⃣ 프롬프트 적응 추천
      const promptAdaptations = this.generatePromptAdaptations(
        persona, 
        culturalContext, 
        locationContext
      );

      // 6️⃣ 메트릭 업데이트
      this.updateMetrics(persona.type, confidence, Date.now() - startTime);

      const result: PersonaClassificationResult = {
        persona,
        confidence,
        reasoning,
        alternativePersonas,
        culturalContext,
        recommendedPromptAdaptations: promptAdaptations
      };

      console.log('✅ 페르소나 분류 완료:', {
        persona: persona.name[this.config.language] || persona.name.en,
        confidence: `${Math.round(confidence * 100)}%`,
        culturalRegion: culturalContext.region,
        processingTime: `${Date.now() - startTime}ms`
      });

      return result;

    } catch (error) {
      console.error('❌ 페르소나 분류 실패:', error);
      
      // 안전한 폴백
      const fallbackPersona = getPersonaByType(this.config.fallbackPersona);
      const culturalContext = CulturalContextEngine.analyzeCulturalContext(locationContext);
      
      return {
        persona: fallbackPersona,
        confidence: 0.6,
        reasoning: ['분류 실패로 인한 안전한 기본 페르소나 적용'],
        alternativePersonas: [],
        culturalContext,
        recommendedPromptAdaptations: []
      };
    }
  }

  /**
   * 🤖 AI 기반 위치 분석
   */
  private async performAIAnalysis(
    locationContext: LocationContext, 
    culturalContext: CulturalContext
  ): Promise<AIAnalysisResult> {
    if (!this.genAI) {
      throw new Error('AI model not available');
    }

    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });

    const prompt = this.generateAIAnalysisPrompt(locationContext, culturalContext);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const analysis = JSON.parse(text);
      return {
        locationCategory: analysis.locationCategory || 'unknown',
        culturalSignificance: analysis.culturalSignificance || 'unknown',
        architecturalStyle: analysis.architecturalStyle || 'unknown',
        historicalContext: analysis.historicalContext || 'unknown',
        primaryAudience: analysis.primaryAudience || 'general',
        confidence: Math.min(1.0, Math.max(0.0, analysis.confidence || 0.7)),
        reasoning: analysis.reasoning || ['AI analysis completed']
      };
    } catch (parseError) {
      console.warn('⚠️ AI 응답 파싱 실패:', parseError);
      throw new Error('AI analysis response parsing failed');
    }
  }

  /**
   * 📝 AI 분석 프롬프트 생성
   */
  private generateAIAnalysisPrompt(
    locationContext: LocationContext, 
    culturalContext: CulturalContext
  ): string {
    const { name, coordinates, googlePlaceType, language } = locationContext;
    
    return `
# Universal Location Analysis for Persona Selection

Analyze the following location and provide a JSON response for optimal persona selection:

**Location**: ${name}
**Language**: ${language}
**Cultural Region**: ${culturalContext.region}
**Communication Style**: ${culturalContext.communicationStyle}
${coordinates ? `**Coordinates**: ${coordinates.lat}, ${coordinates.lng}` : ''}
${googlePlaceType ? `**Place Types**: ${googlePlaceType.join(', ')}` : ''}

## Available Persona Types:
1. **architecture_engineer** - Modern buildings, towers, bridges, engineering marvels
2. **ancient_civilizations** - Archaeological sites, ancient monuments, historical ruins
3. **royal_heritage** - Palaces, castles, royal residences, aristocratic sites
4. **sacred_spiritual** - Religious sites, spiritual places, places of worship
5. **arts_culture** - Museums, galleries, cultural centers, art venues
6. **nature_ecology** - National parks, natural wonders, ecological sites
7. **history_heritage** - Historical sites, memorials, heritage locations
8. **urban_life** - Shopping districts, modern city centers, urban attractions
9. **culinary_culture** - Food markets, culinary districts, dining destinations
10. **entertainment** - Theme parks, entertainment districts, venues
11. **sports_recreation** - Sports facilities, recreation areas, fitness venues
12. **nightlife_social** - Entertainment districts, social venues, nightlife spots
13. **family_experience** - Family-friendly attractions, kid-oriented places
14. **romantic_experience** - Romantic destinations, couple-oriented venues
15. **educational** - Universities, educational institutions, learning centers

## Analysis Requirements:
Analyze the location considering:
- Primary function and purpose
- Architectural style and period
- Cultural and historical significance
- Target audience and typical visitors
- Unique characteristics and features

## Response Format (JSON only):
{
  "locationCategory": "primary category of the location",
  "culturalSignificance": "cultural and historical importance",
  "architecturalStyle": "architectural style or natural characteristics",
  "historicalContext": "historical period or background",
  "primaryAudience": "main target audience",
  "recommendedPersona": "one of the 15 persona types above",
  "confidence": 0.85,
  "reasoning": [
    "Primary reason for persona selection",
    "Secondary supporting factor",
    "Cultural context consideration"
  ]
}

Provide ONLY the JSON response, no additional text.
`;
  }

  /**
   * 🎯 AI 분석 결과에서 페르소나 선택
   */
  private selectPersonaFromAIAnalysis(aiAnalysis: AIAnalysisResult): {
    persona: GlobalPersona;
    confidence: number;
    reasoning: string[];
  } {
    // AI가 추천한 페르소나 타입을 카탈로그에서 찾기
    const personaType = (aiAnalysis as any).recommendedPersona as GlobalPersonaType;
    const persona = getPersonaByType(personaType) || getPersonaByType(this.config.fallbackPersona);
    
    return {
      persona,
      confidence: aiAnalysis.confidence,
      reasoning: [
        'AI 기반 위치 분석 완료',
        `카테고리: ${aiAnalysis.locationCategory}`,
        `문화적 의미: ${aiAnalysis.culturalSignificance}`,
        ...aiAnalysis.reasoning
      ]
    };
  }

  /**
   * 📋 규칙 기반 페르소나 선택 (AI 실패 시 폴백)
   */
  private selectPersonaByRules(
    locationContext: LocationContext, 
    culturalContext: CulturalContext
  ): {
    persona: GlobalPersona;
    confidence: number;
    reasoning: string[];
  } {
    const { name, googlePlaceType } = locationContext;
    const normalizedName = name.toLowerCase();

    // 규칙 기반 분류 로직
    const rules = [
      // 건축 & 공학 전문가
      {
        condition: () => this.matchesKeywords(normalizedName, [
          'tower', 'building', 'skyscraper', 'bridge', 'dam', 'tunnel',
          'stadium', 'airport', 'station', 'terminal', 'observatory',
          '타워', '빌딩', '전망대', '관측소', '공항', '역', '터미널'
        ]) || googlePlaceType?.some(type => 
          ['airport', 'train_station', 'subway_station', 'stadium'].includes(type)
        ),
        persona: 'architecture_engineer' as GlobalPersonaType,
        confidence: 0.85,
        reasoning: ['현대 건축물 또는 공학 구조물 감지']
      },
      
      // 고대문명 전문가
      {
        condition: () => this.matchesKeywords(normalizedName, [
          'ruins', 'archaeological', 'ancient', 'prehistoric', 'stone age',
          'pyramid', 'temple', 'tomb', 'burial', 'monument', 'megalith',
          '유적', '고대', '선사', '피라미드', '고분', '거석', '신전'
        ]),
        persona: 'ancient_civilizations' as GlobalPersonaType,
        confidence: 0.9,
        reasoning: ['고대 유적 또는 고고학적 유적지 감지']
      },

      // 왕실 유산 전문가
      {
        condition: () => this.matchesKeywords(normalizedName, [
          'palace', 'castle', 'royal', 'imperial', 'throne', 'court',
          'mansion', 'manor', 'château', 'schloss', 'palazzo',
          '궁', '궁궐', '왕궁', '황궁', '성', '왕실', '궁전'
        ]) || googlePlaceType?.includes('palace'),
        persona: 'royal_heritage' as GlobalPersonaType,
        confidence: 0.9,
        reasoning: ['왕실 또는 귀족 관련 시설 감지']
      },

      // 성지 & 영성 전문가
      {
        condition: () => this.matchesKeywords(normalizedName, [
          'church', 'cathedral', 'basilica', 'mosque', 'temple', 'shrine',
          'monastery', 'abbey', 'synagogue', 'pagoda', 'stupa',
          '교회', '성당', '대성당', '절', '사찰', '암자', '신사', '모스크'
        ]) || googlePlaceType?.some(type => 
          ['church', 'mosque', 'temple', 'synagogue', 'cathedral'].includes(type)
        ),
        persona: 'sacred_spiritual' as GlobalPersonaType,
        confidence: 0.9,
        reasoning: ['종교적 또는 영성적 장소 감지']
      },

      // 예술 & 문화 전문가
      {
        condition: () => this.matchesKeywords(normalizedName, [
          'museum', 'gallery', 'exhibition', 'art', 'cultural center',
          'theater', 'opera house', 'concert hall', 'philharmonic',
          '박물관', '미술관', '갤러리', '전시관', '문화센터', '극장', '오페라하우스'
        ]) || googlePlaceType?.some(type => 
          ['museum', 'art_gallery', 'theater', 'cultural_center'].includes(type)
        ),
        persona: 'arts_culture' as GlobalPersonaType,
        confidence: 0.85,
        reasoning: ['예술 또는 문화 시설 감지']
      },

      // 자연 & 생태 전문가
      {
        condition: () => this.matchesKeywords(normalizedName, [
          'park', 'forest', 'mountain', 'lake', 'river', 'beach', 'island',
          'canyon', 'valley', 'waterfall', 'cave', 'volcano', 'glacier',
          'national park', 'nature reserve', 'botanical garden', 'zoo',
          '공원', '산', '강', '호수', '해변', '섬', '계곡', '폭포', '동굴', '화산'
        ]) || googlePlaceType?.some(type => 
          ['park', 'zoo', 'aquarium', 'natural_feature'].includes(type)
        ),
        persona: 'nature_ecology' as GlobalPersonaType,
        confidence: 0.8,
        reasoning: ['자연 환경 또는 생태 관련 장소 감지']
      }
    ];

    // 첫 번째로 매칭되는 규칙 적용
    for (const rule of rules) {
      if (rule.condition()) {
        return {
          persona: getPersonaByType(rule.persona),
          confidence: rule.confidence,
          reasoning: rule.reasoning
        };
      }
    }

    // 기본값
    const fallbackPersona = getPersonaByType(this.config.fallbackPersona);
    return {
      persona: fallbackPersona,
      confidence: 0.6,
      reasoning: ['명확한 카테고리 없음', '범용 문화 전문가 적용']
    };
  }

  /**
   * 🔍 키워드 매칭 헬퍼
   */
  private matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * 🎭 대안 페르소나 생성
   */
  private generateAlternativePersonas(
    selectedPersona: GlobalPersona,
    locationContext: LocationContext,
    culturalContext: CulturalContext,
    aiAnalysis?: AIAnalysisResult | null
  ): GlobalPersona[] {
    const alternatives: GlobalPersona[] = [];
    const allPersonas = Object.values(GLOBAL_PERSONA_CATALOG);
    
    // 선택된 페르소나 제외
    const candidates = allPersonas.filter(p => p.type !== selectedPersona.type);
    
    // 문화적 컨텍스트 기반 대안 추천
    if (culturalContext.region === 'eastern') {
      alternatives.push(
        ...candidates.filter(p => 
          ['sacred_spiritual', 'royal_heritage', 'nature_ecology'].includes(p.type)
        ).slice(0, 2)
      );
    } else if (culturalContext.region === 'western') {
      alternatives.push(
        ...candidates.filter(p => 
          ['arts_culture', 'architecture_engineer', 'history_heritage'].includes(p.type)
        ).slice(0, 2)
      );
    }
    
    // 일반적인 대안들 추가 (중복 제거)
    const generalAlternatives = candidates.filter(p => 
      ['arts_culture', 'history_heritage', 'urban_life'].includes(p.type) &&
      !alternatives.some(alt => alt.type === p.type)
    );
    
    alternatives.push(...generalAlternatives.slice(0, 3 - alternatives.length));
    
    return alternatives.slice(0, 3); // 최대 3개 대안
  }

  /**
   * 📝 프롬프트 적응 추천 생성
   */
  private generatePromptAdaptations(
    persona: GlobalPersona,
    culturalContext: CulturalContext,
    locationContext: LocationContext
  ): PromptAdaptation[] {
    const adaptations: PromptAdaptation[] = [];

    // 톤 적응
    adaptations.push({
      type: 'tone',
      description: 'Communication tone adaptation',
      value: persona.culturalAdaptations[culturalContext.region]?.tone || 
             'friendly and professional'
    });

    // 문화적 참조 적응
    const culturalReferences = persona.culturalAdaptations[culturalContext.region]?.culturalReferences || [];
    if (culturalReferences.length > 0) {
      adaptations.push({
        type: 'cultural_reference',
        description: 'Cultural references to include',
        value: culturalReferences.slice(0, 3).join(', ')
      });
    }

    // 콘텐츠 깊이 적응
    adaptations.push({
      type: 'content',
      description: 'Content depth level',
      value: culturalContext.contentDepth
    });

    // 구조 적응
    if (culturalContext.communicationStyle === 'formal') {
      adaptations.push({
        type: 'structure',
        description: 'Formal structure with proper protocol',
        value: 'Use formal introductions and structured presentation'
      });
    }

    return adaptations;
  }

  /**
   * 📊 메트릭 업데이트
   */
  private updateMetrics(personaType: GlobalPersonaType, confidence: number, responseTime: number): void {
    this.metrics.totalClassifications++;
    this.metrics.averageConfidence = 
      (this.metrics.averageConfidence * (this.metrics.totalClassifications - 1) + confidence) / 
      this.metrics.totalClassifications;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalClassifications - 1) + responseTime) / 
      this.metrics.totalClassifications;

    // 인기 페르소나 업데이트
    const existingPersona = this.metrics.topPersonas.find(p => p.persona === personaType);
    if (existingPersona) {
      existingPersona.count++;
    } else {
      this.metrics.topPersonas.push({ persona: personaType, count: 1 });
    }
    
    // 상위 5개만 유지하고 정렬
    this.metrics.topPersonas.sort((a, b) => b.count - a.count);
    this.metrics.topPersonas = this.metrics.topPersonas.slice(0, 5);
  }

  /**
   * 📈 메트릭 조회
   */
  getMetrics(): ClassifierMetrics {
    return { ...this.metrics };
  }

  /**
   * 🔄 메트릭 리셋
   */
  resetMetrics(): void {
    this.metrics = {
      totalClassifications: 0,
      averageConfidence: 0,
      accuracyScore: 0,
      culturalAdaptationUsage: 0,
      topPersonas: [],
      averageResponseTime: 0
    };
  }
}
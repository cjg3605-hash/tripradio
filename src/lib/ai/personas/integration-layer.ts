// Integration Layer for Universal Persona System
// 기존 시스템과의 호환성을 제공하는 통합 레이어

import { UniversalPersonaClassifier } from './universal-persona-classifier';
import { 
  LocationContext, 
  PersonaClassificationResult, 
  GlobalPersona,
  CulturalContext 
} from './types';

/**
 * 🔗 기존 시스템과의 호환성을 위한 통합 레이어
 * gemini.ts에서 사용하던 함수들을 새로운 시스템으로 연결
 */
export class PersonaIntegrationLayer {
  private static classifier: UniversalPersonaClassifier | null = null;

  /**
   * 🚀 분류기 초기화
   */
  static initialize(apiKey?: string): void {
    if (!this.classifier) {
      this.classifier = new UniversalPersonaClassifier(apiKey, {
        language: 'ko', // 기본 한국어 설정
        fallbackPersona: 'arts_culture',
        confidenceThreshold: 0.7,
        enableAIAnalysis: true,
        enableCulturalAdaptation: true
      });
    }
  }

  /**
   * 🎯 위치 기반 최적 페르소나 선택 (새로운 메인 함수)
   */
  static async selectOptimalPersona(
    locationName: string,
    language: string = 'ko',
    additionalContext?: Partial<LocationContext>
  ): Promise<PersonaClassificationResult> {
    this.initialize(process.env.GEMINI_API_KEY);
    
    if (!this.classifier) {
      throw new Error('Persona classifier not initialized');
    }

    const locationContext: LocationContext = {
      name: locationName,
      language,
      coordinates: additionalContext?.coordinates,
      googlePlaceType: additionalContext?.googlePlaceType,
      wikiDataType: additionalContext?.wikiDataType,
      culturalRegion: additionalContext?.culturalRegion,
      historicalPeriod: additionalContext?.historicalPeriod,
      architecturalStyle: additionalContext?.architecturalStyle,
      primaryFunction: additionalContext?.primaryFunction,
      userIntent: additionalContext?.userIntent
    };

    return await this.classifier.classifyLocation(locationContext);
  }

  /**
   * 🎭 페르소나 인식 프롬프트 생성 (기존 시스템 호환)
   * createAdaptivePersonaPrompt를 대체
   */
  static async createUniversalPersonaPrompt(
    locationName: string, 
    language: string = 'ko'
  ): Promise<string> {
    try {
      const classificationResult = await this.selectOptimalPersona(locationName, language);
      const { persona, confidence, reasoning, culturalContext } = classificationResult;
      
      return this.generatePersonaAwarePrompt(
        locationName,
        persona,
        culturalContext,
        confidence,
        reasoning,
        language
      );
    } catch (error) {
      console.warn('⚠️ 페르소나 분류 실패, 기본 프롬프트 사용:', error);
      return this.generateFallbackPrompt(locationName, language);
    }
  }

  /**
   * 🔍 적응형 페르소나 사용 여부 결정 (기존 시스템 호환)
   * shouldUseAdaptivePersona를 대체
   */
  static shouldUseUniversalPersona(locationName: string): boolean {
    // 새로운 시스템은 모든 위치에 대해 사용 가능
    // 기존 한국어 전용 제한 제거
    return true;
  }

  /**
   * 📝 페르소나 인식 프롬프트 생성
   */
  private static generatePersonaAwarePrompt(
    locationName: string,
    persona: GlobalPersona,
    culturalContext: CulturalContext,
    confidence: number,
    reasoning: string[],
    language: string
  ): string {
    const personaName = persona.name[language] || persona.name.en;
    const personaDescription = persona.description[language] || persona.description.en;
    const culturalAdaptation = persona.culturalAdaptations[culturalContext.region];
    
    const languageSpecificGreeting = culturalContext.languageSpecificNuances.greeting || 'Welcome';
    const culturalReferences = culturalAdaptation?.culturalReferences?.slice(0, 3).join(', ') || '';
    const tone = culturalAdaptation?.tone || 'friendly and professional';
    const emphasis = culturalAdaptation?.emphasis?.slice(0, 3).join(', ') || '';

    return `# 🌍 Universal AI Persona Guide Generation System

## 🎭 Selected Expert Persona
**Persona**: ${personaName} ${persona.icon}
**Confidence**: ${Math.round(confidence * 100)}%
**Description**: ${personaDescription}
**Cultural Region**: ${culturalContext.region}
**Communication Style**: ${culturalContext.communicationStyle}

## 🧠 Analysis Results
**Location**: "${locationName}"
**Classification Reasoning**: ${reasoning.join(', ')}
**Cultural Context**: ${culturalReferences}

## 🎯 Persona Guidelines
**Tone**: ${tone}
**Key Emphasis**: ${emphasis}
**Content Depth**: ${culturalContext.contentDepth}
**Cultural Sensitivity**: Apply ${culturalContext.region} cultural awareness

## 📝 Generation Instructions

You are now embodying the **${personaName}** persona. Create a comprehensive guide for "${locationName}" that:

1. **Reflects Your Expertise**: Draw from your specialized knowledge in ${persona.expertise.join(', ')}
2. **Cultural Appropriateness**: Adapt content for ${culturalContext.region} cultural context
3. **Communication Style**: Use ${culturalContext.communicationStyle} tone throughout
4. **Language Sensitivity**: Apply ${language} language-specific nuances

### Required Output Format:
\`\`\`json
{
  "analysis": {
    "location": "${locationName}",
    "selectedPersona": "${personaName}",
    "culturalRegion": "${culturalContext.region}",
    "personaConfidence": ${confidence},
    "culturalApproach": "${tone}",
    "keyFocus": "${emphasis}"
  },
  "guide": {
    "overview": {
      "title": "${locationName} ${personaName} Guide",
      "greeting": "${languageSpecificGreeting}",
      "expertIntroduction": "[Natural introduction as ${personaName} with cultural appropriateness]",
      "culturalContext": "[Interpretation through ${culturalContext.region} cultural lens]"
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "${locationName} Introduction: Journey Begins",
          "narrative": "[1200-1500 words introduction written as ${personaName}, incorporating ${culturalReferences} and emphasizing ${emphasis}]",
          "culturalInsights": "[${culturalContext.region}-specific cultural perspectives]",
          "nextDirection": "[Guidance to next location with persona-appropriate style]"
        }
      ]
    }
  }
}
\`\`\`

### 🚨 Critical Requirements:
1. **Persona Consistency**: Maintain ${personaName} perspective throughout
2. **Cultural Sensitivity**: Respect ${culturalContext.region} cultural norms
3. **Expertise Depth**: Demonstrate deep knowledge in ${persona.expertise.join(', ')}
4. **Language Appropriateness**: Use ${language} language conventions
5. **Content Quality**: Provide ${culturalContext.contentDepth} level detail

Generate the guide now, fully embodying the ${personaName} persona with ${culturalContext.region} cultural awareness.`;
  }

  /**
   * 🔄 폴백 프롬프트 생성 (분류 실패 시)
   */
  private static generateFallbackPrompt(locationName: string, language: string): string {
    return `# 🎯 Universal Guide Generation System (Fallback Mode)

## 🌍 Location Analysis
**Target Location**: "${locationName}"
**Language**: ${language}
**Mode**: Universal fallback (persona classification unavailable)

## 📝 Generation Instructions
Create a comprehensive, culturally appropriate guide for "${locationName}" using:

1. **Universal Approach**: Appeal to diverse cultural backgrounds
2. **Balanced Expertise**: Combine historical, cultural, and practical information
3. **Cultural Sensitivity**: Respect local customs and traditions
4. **Language Appropriateness**: Use ${language} language conventions

### Required Output Format:
\`\`\`json
{
  "analysis": {
    "location": "${locationName}",
    "approach": "Universal Cultural Guide",
    "language": "${language}",
    "mode": "fallback"
  },
  "guide": {
    "overview": {
      "title": "${locationName} Cultural Guide",
      "description": "[Balanced introduction covering cultural, historical, and practical aspects]",
      "culturalContext": "[Respectful cultural interpretation]"
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "${locationName} Introduction: Cultural Journey",
          "narrative": "[1200-1500 words culturally sensitive introduction]",
          "nextDirection": "[Guidance to next location]"
        }
      ]
    }
  }
}
\`\`\`

Generate a thoughtful, culturally appropriate guide now.`;
  }

  /**
   * 📊 분류 성능 메트릭 조회
   */
  static getClassificationMetrics() {
    if (!this.classifier) {
      return null;
    }
    return this.classifier.getMetrics();
  }

  /**
   * 🔄 시스템 리셋
   */
  static reset(): void {
    this.classifier = null;
  }
}

// 기존 함수들과의 호환성을 위한 래퍼 함수들
/**
 * 🔄 기존 createAdaptivePersonaPrompt 호환성 함수
 */
export const createUniversalPersonaPrompt = PersonaIntegrationLayer.createUniversalPersonaPrompt;

/**
 * 🔄 기존 shouldUseAdaptivePersona 호환성 함수
 */
export const shouldUseUniversalPersona = PersonaIntegrationLayer.shouldUseUniversalPersona;

/**
 * 🎯 새로운 메인 페르소나 선택 함수
 */
export const selectOptimalPersona = PersonaIntegrationLayer.selectOptimalPersona;
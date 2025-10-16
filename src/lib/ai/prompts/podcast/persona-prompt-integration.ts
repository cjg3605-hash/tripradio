/**
 * 페르소나-프롬프트 통합 유틸리티
 * 페르소나 시스템의 동적 기능을 프롬프트에 실제 적용하는 브릿지
 */

import { 
  PodcastPersona, 
  PersonaResponseGenerator, 
  PersonaDialogueSimulator,
  HOST_PERSONA,
  CURATOR_PERSONA,
  ENGLISH_HOST_PERSONA,
  ENGLISH_CURATOR_PERSONA
} from '@/lib/ai/personas/podcast-personas';

/**
 * 페르소나 기반 동적 대화 생성기
 */
export class PersonaPromptIntegrator {
  private responseGenerator: PersonaResponseGenerator;
  private dialogueSimulator: PersonaDialogueSimulator;

  constructor() {
    this.responseGenerator = new PersonaResponseGenerator();
    this.dialogueSimulator = new PersonaDialogueSimulator();
  }

  /**
   * 페르소나 기반 동적 예시 대화 생성
   */
  generateDynamicDialogueExample(
    topic: string,
    facts: string[],
    language: string = 'ko',
    turnCount: number = 4
  ): string {
    const personas = this.getPersonasByLanguage(language);
    const dialogue: string[] = [];

    for (let i = 0; i < turnCount; i++) {
      const isHost = i % 2 === 0;
      const speaker = isHost ? personas.host : personas.curator;
      const responseType = this.getContextualResponseType(i, turnCount);
      
      // 페르소나의 실제 응답 패턴 활용
      const response = this.responseGenerator.getPersonaResponse(speaker, responseType);
      const content = this.applyPersonaStyle(speaker, `${response} ${facts[i] || ''}`);
      
      const speakerLabel = this.getSpeakerLabel(speaker, language);
      dialogue.push(`**${speakerLabel}:** ${content}`);
    }

    return dialogue.join('\n\n');
  }

  /**
   * 상황별 적절한 응답 타입 결정
   */
  private getContextualResponseType(index: number, total: number): keyof PodcastPersona['responses'] {
    if (index === 0) return 'engagement';
    if (index === total - 1) return 'transition';
    if (index % 3 === 0) return 'surprise';
    if (index % 2 === 0) return 'curiosity';
    return 'explanation';
  }

  /**
   * 페르소나별 NotebookLM 패턴 생성
   */
  generateNotebookLMPatterns(persona: PodcastPersona, count: number = 3): string[] {
    const patterns: string[] = [];
    const types: (keyof PodcastPersona['notebookLMPatterns'])[] = ['interruptions', 'affirmations', 'questions'];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const pattern = this.responseGenerator.getNotebookLMPattern(persona, type);
      patterns.push(pattern);
    }
    
    return patterns;
  }

  /**
   * 자연스러운 인터럽션 생성
   */
  generateNaturalInterruption(
    currentSpeaker: PodcastPersona,
    nextSpeaker: PodcastPersona,
    context: string
  ): string {
    return this.dialogueSimulator.generateNaturalInterruption(
      currentSpeaker,
      nextSpeaker,
      context
    );
  }

  /**
   * 페르소나 스타일 적용
   */
  private applyPersonaStyle(persona: PodcastPersona, content: string): string {
    return this.responseGenerator.applyPersonaStyle(persona, content);
  }

  /**
   * 언어별 페르소나 가져오기
   */
  private getPersonasByLanguage(language: string): { host: PodcastPersona; curator: PodcastPersona } {
    const langCode = language.slice(0, 2).toLowerCase();
    
    switch (langCode) {
      case 'en':
        return {
          host: ENGLISH_HOST_PERSONA,
          curator: ENGLISH_CURATOR_PERSONA
        };
      case 'ko':
      default:
        return {
          host: HOST_PERSONA,
          curator: CURATOR_PERSONA
        };
    }
  }

  /**
   * 언어별 화자 레이블
   */
  private getSpeakerLabel(persona: PodcastPersona, language: string): string {
    const langCode = language.slice(0, 2).toLowerCase();
    
    if (persona.role === 'host') {
      switch (langCode) {
        case 'en': return 'Host';
        case 'ja': return 'ホスト';
        case 'zh': return '主持人';
        case 'es': return 'Presentador';
        default: return '진행자';
      }
    } else {
      switch (langCode) {
        case 'en': return 'Curator';
        case 'ja': return 'キュレーター';
        case 'zh': return '策展人';
        case 'es': return 'Curador';
        default: return '큐레이터';
      }
    }
  }

  /**
   * 페르소나 특성을 프롬프트 지시사항으로 변환
   */
  generatePersonaInstructions(persona: PodcastPersona, language: string = 'ko'): string {
    const instructions: string[] = [];
    
    // 성격 특성
    instructions.push(`### ${persona.name}의 특성`);
    instructions.push(`- 성격: ${persona.characteristics.personality.join(', ')}`);
    instructions.push(`- 말투: ${persona.characteristics.speakingStyle.join(', ')}`);
    instructions.push(`- 전문성: ${persona.characteristics.expertise.join(', ')}`);
    
    // 대화 패턴
    instructions.push('\n### 대화 패턴');
    persona.characteristics.conversationPatterns.forEach(pattern => {
      instructions.push(`- ${pattern}`);
    });
    
    // 응답 예시
    instructions.push('\n### 응답 예시');
    instructions.push(`- 놀라움: "${persona.responses.surprise[0]}"`);
    instructions.push(`- 호기심: "${persona.responses.curiosity[0]}"`);
    instructions.push(`- 설명: "${persona.responses.explanation[0]}"`);
    
    return instructions.join('\n');
  }

  /**
   * 챕터별 페르소나 대화 템플릿 생성
   */
  generateChapterDialogueTemplate(
    chapterType: 'intro' | 'main' | 'outro',
    language: string = 'ko'
  ): string {
    const personas = this.getPersonasByLanguage(language);
    const templates: string[] = [];
    
    switch (chapterType) {
      case 'intro':
        templates.push(this.responseGenerator.getPersonaResponse(personas.host, 'engagement'));
        templates.push(this.responseGenerator.getPersonaResponse(personas.curator, 'explanation'));
        templates.push(this.responseGenerator.getPersonaResponse(personas.host, 'surprise'));
        break;
      
      case 'main':
        templates.push(this.responseGenerator.getPersonaResponse(personas.host, 'curiosity'));
        templates.push(this.responseGenerator.getPersonaResponse(personas.curator, 'explanation'));
        templates.push(this.responseGenerator.getPersonaResponse(personas.host, 'surprise'));
        templates.push(this.responseGenerator.getPersonaResponse(personas.curator, 'engagement'));
        break;
      
      case 'outro':
        templates.push(this.responseGenerator.getPersonaResponse(personas.host, 'transition'));
        templates.push(this.responseGenerator.getPersonaResponse(personas.curator, 'transition'));
        break;
    }
    
    return templates.join('\n');
  }

  /**
   * 감정 톤 분석 및 적용
   */
  analyzeAndApplyEmotionalTone(
    content: string,
    persona: PodcastPersona,
    emotionalContext: 'excitement' | 'wonder' | 'curiosity' | 'reverence'
  ): string {
    let modifiedContent = content;
    
    // 페르소나별 감정 표현 적용
    if (persona.role === 'host') {
      switch (emotionalContext) {
        case 'excitement':
          modifiedContent = this.addExcitement(modifiedContent, persona);
          break;
        case 'wonder':
          modifiedContent = this.addWonder(modifiedContent, persona);
          break;
        case 'curiosity':
          modifiedContent = this.addCuriosity(modifiedContent, persona);
          break;
      }
    } else {
      // 큐레이터는 더 절제된 감정 표현
      modifiedContent = this.addProfessionalTone(modifiedContent, persona);
    }
    
    return modifiedContent;
  }

  private addExcitement(content: string, persona: PodcastPersona): string {
    const excitements = persona.responses.surprise;
    const randomExcitement = excitements[Math.floor(Math.random() * excitements.length)];
    return `${randomExcitement} ${content}`;
  }

  private addWonder(content: string, persona: PodcastPersona): string {
    const wonders = persona.responses.surprise.filter(r => r.includes('상상') || r.includes('믿'));
    if (wonders.length > 0) {
      const randomWonder = wonders[Math.floor(Math.random() * wonders.length)];
      return `${randomWonder} ${content}`;
    }
    return content;
  }

  private addCuriosity(content: string, persona: PodcastPersona): string {
    const curiosities = persona.responses.curiosity;
    const randomCuriosity = curiosities[Math.floor(Math.random() * curiosities.length)];
    return `${randomCuriosity} ${content}`;
  }

  private addProfessionalTone(content: string, persona: PodcastPersona): string {
    const explanations = persona.responses.explanation;
    const randomExplanation = explanations[Math.floor(Math.random() * explanations.length)];
    return `${randomExplanation} ${content}`;
  }
}

/**
 * 페르소나 기반 품질 검증기
 */
export class PersonaQualityValidator {
  /**
   * 대화의 페르소나 일관성 검증
   */
  validatePersonaConsistency(
    dialogue: string,
    expectedPersona: PodcastPersona
  ): {
    isConsistent: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;
    
    // 페르소나 특성 키워드 체크
    const personalityKeywords = expectedPersona.characteristics.personality.join(' ');
    if (!dialogue.toLowerCase().includes(personalityKeywords.toLowerCase())) {
      issues.push('페르소나 성격 특성이 잘 드러나지 않음');
      score -= 20;
    }
    
    // 말투 일관성 체크
    const speakingStyle = expectedPersona.characteristics.speakingStyle;
    let styleMatches = 0;
    speakingStyle.forEach(style => {
      if (dialogue.includes(style)) styleMatches++;
    });
    
    if (styleMatches < speakingStyle.length / 2) {
      issues.push('페르소나 말투가 일관되지 않음');
      score -= 15;
    }
    
    // 전문성 반영 체크
    const expertise = expectedPersona.characteristics.expertise;
    let expertiseReflected = false;
    expertise.forEach(exp => {
      if (dialogue.includes(exp)) expertiseReflected = true;
    });
    
    if (!expertiseReflected) {
      issues.push('페르소나의 전문성이 반영되지 않음');
      score -= 10;
    }
    
    return {
      isConsistent: score >= 70,
      score,
      issues
    };
  }

  /**
   * NotebookLM 패턴 적용도 검증
   */
  validateNotebookLMPatterns(dialogue: string): {
    score: number;
    patternCoverage: {
      interruptions: boolean;
      affirmations: boolean;
      questions: boolean;
      transitions: boolean;
    };
  } {
    const coverage = {
      interruptions: false,
      affirmations: false,
      questions: false,
      transitions: false
    };
    
    // 패턴 체크
    if (dialogue.includes('잠깐') || dialogue.includes('아,') || dialogue.includes('Wait')) {
      coverage.interruptions = true;
    }
    
    if (dialogue.includes('맞아') || dialogue.includes('그렇') || dialogue.includes('Right') || dialogue.includes('Exactly')) {
      coverage.affirmations = true;
    }
    
    if (dialogue.includes('?')) {
      coverage.questions = true;
    }
    
    if (dialogue.includes('그럼') || dialogue.includes('다음') || dialogue.includes('Now') || dialogue.includes('Next')) {
      coverage.transitions = true;
    }
    
    const coveredCount = Object.values(coverage).filter(v => v).length;
    const score = (coveredCount / 4) * 100;
    
    return {
      score,
      patternCoverage: coverage
    };
  }
}

// 싱글톤 인스턴스 export
export const personaPromptIntegrator = new PersonaPromptIntegrator();
export const personaQualityValidator = new PersonaQualityValidator();

export default {
  PersonaPromptIntegrator,
  PersonaQualityValidator,
  personaPromptIntegrator,
  personaQualityValidator
};
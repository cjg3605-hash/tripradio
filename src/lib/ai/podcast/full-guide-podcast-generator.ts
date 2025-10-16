// 전체 가이드 통합 팟캐스트 생성기
// NotebookLM 스타일로 전체 박물관/관광지 가이드를 하나의 자연스러운 팟캐스트로 변환

import { getGeminiClient } from '@/lib/ai/gemini-client';
import { createQuickPrompt } from '@/lib/ai/prompt-utils';
import { GuideData } from '@/types/guide';
import { TTSExpertPersona, TTSExpertPersonaSelector } from '../personas/tts-expert-persona';
import { DualScriptGenerator, UserChapterScript, TTSAudioScript } from '../scripts/dual-script-generator';
import { NotebookLMTTSOptimizer, NotebookLMOptimizationFactory } from '../optimization/notebooklm-tts-optimization-guide';
import { createFullGuidePodcastPrompt } from '@/lib/ai/prompts/podcast';
import { PERSONAS } from '@/lib/ai/personas/podcast-personas';
import type { PodcastPersona } from '@/lib/ai/personas/podcast-personas';

export interface FullGuidePodcastScript {
  // 사용자용 스크립트 (전체 팟캐스트 자막)
  userScript: {
    title: string;
    description: string;
    totalDuration: string;
    script: string;
    chapterTimestamps: ChapterTimestamp[];
  };
  
  // TTS용 스크립트 (SSML 최적화)
  ttsScript: {
    combinedScript: string;
    systemPrompt: string;
    metadata: TTSGenerationMetadata;
  };
  
  // 품질 정보
  qualityMetrics: {
    overallScore: number;
    notebookLMSimilarity: number;
    conversationNaturalness: number;
    informationCompleteness: number;
  };
}

export interface ChapterTimestamp {
  chapterIndex: number;
  title: string;
  estimatedStartTime: number; // seconds
  estimatedEndTime: number;   // seconds
  keyTopics: string[];
}

export interface TTSGenerationMetadata {
  persona: TTSExpertPersona;
  language: string;
  totalTokens: number;
  processingTimeMs: number;
  optimizationLevel: string;
  ssmlComplexity: number;
  // 새로운 페르소나 정보 (선택적)
  podcastPersonas?: {
    host: {
      name: string;
      role: string;
      language: string;
    };
    curator: {
      name: string;
      role: string;
      language: string;
    };
  };
  promptSystem?: string;
  features?: string[];
}

export class FullGuidePodcastGenerator {
  private geminiClient: any;
  private dualScriptGenerator: DualScriptGenerator;

  constructor() {
    this.geminiClient = getGeminiClient();
    this.dualScriptGenerator = new DualScriptGenerator();
  }

  /**
   * 전체 가이드를 하나의 자연스러운 NotebookLM 스타일 팟캐스트로 변환
   */
  async generateFullGuidePodcast(
    guideData: GuideData,
    language: string = 'ko-KR',
    options: {
      priority?: 'engagement' | 'accuracy' | 'emotion';
      audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      podcastStyle?: 'deep-dive' | 'casual' | 'educational' | 'exploratory';
    } = {}
  ): Promise<FullGuidePodcastScript> {

    console.log('🎙️ 전체 가이드 팟캐스트 생성 시작:', {
      location: guideData.overview.title,
      language,
      chaptersCount: guideData.realTimeGuide?.chapters.length || 0,
      options
    });

    const startTime = Date.now();

    try {
      // 1단계: 가이드 데이터 분석 및 준비
      const analysisResult = this.analyzeGuideContent(guideData);
      
      // 2단계: NotebookLM 스타일 전체 팟캐스트 스크립트 생성
      const podcastScript = await this.generateNotebookLMPodcastScript(
        guideData, 
        language, 
        analysisResult,
        options
      );

      // 3단계: 이중 스크립트 생성 (사용자용 + TTS용)
      const dualScripts = await this.createDualPodcastScripts(
        podcastScript, 
        guideData, 
        language,
        options
      );

      // 4단계: 품질 평가
      const qualityMetrics = this.evaluatePodcastQuality(dualScripts, analysisResult);

      // 5단계: 최종 결과 구성
      const processingTime = Date.now() - startTime;
      const selectedPersona = this.selectOptimalPersona(guideData, { ...options, language });
      const podcastPersonas = this.selectPodcastPersonas(language, this.detectContentType(guideData.overview.title), options.priority || 'engagement');
      
      return {
        userScript: {
          title: this.generatePodcastTitle(guideData, language),
          description: this.generatePodcastDescription(guideData, language),
          totalDuration: this.estimateTotalDuration(dualScripts.userScript),
          script: dualScripts.userScript,
          chapterTimestamps: this.generateChapterTimestamps(guideData, dualScripts.userScript)
        },
        ttsScript: {
          combinedScript: dualScripts.ttsScript,
          systemPrompt: this.generateSystemPrompt(guideData, options, language),
          metadata: {
            persona: selectedPersona,
            language,
            totalTokens: this.estimateTokenCount(dualScripts.ttsScript),
            processingTimeMs: processingTime,
            optimizationLevel: 'notebooklm-enhanced-v2',
            ssmlComplexity: this.calculateSSMLComplexity(dualScripts.ttsScript),
            // 새로운 페르소나 정보 추가
            podcastPersonas: {
              host: {
                name: podcastPersonas.host.name,
                role: podcastPersonas.host.role,
                language: this.getPersonaLanguage(language)
              },
              curator: {
                name: podcastPersonas.curator.name,
                role: podcastPersonas.curator.role,
                language: this.getPersonaLanguage(language)
              }
            },
            promptSystem: 'podcast-prompts-v2',
            features: ['persona-integration', 'language-specific', 'notebooklm-patterns']
          }
        },
        qualityMetrics
      };

    } catch (error) {
      console.error('❌ 전체 가이드 팟캐스트 생성 실패:', error);
      throw new Error(`팟캐스트 생성 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 가이드 콘텐츠 분석
   */
  private analyzeGuideContent(guideData: GuideData): {
    keyThemes: string[];
    informationDensity: number;
    emotionalTone: string;
    culturalContext: string[];
    estimatedComplexity: number;
  } {
    const chapters = guideData.realTimeGuide?.chapters || [];
    const allText = [
      guideData.overview.title,
      guideData.overview.keyFeatures || guideData.overview.summary,
      guideData.overview.background || guideData.overview.historicalBackground || '',
      ...chapters.map(ch => ch.narrative || ch.coreNarrative || '').filter(Boolean)
    ].join(' ');

    // 주요 테마 추출
    const keyThemes = this.extractKeyThemes(allText);
    
    // 정보 밀도 계산 (글자 수 기반)
    const informationDensity = Math.min(10, Math.floor(allText.length / 1000));
    
    // 감정적 톤 분석
    const emotionalTone = this.analyzeEmotionalTone(allText);
    
    // 문화적 맥락 분석
    const culturalContext = this.analyzeCulturalContext(guideData);
    
    // 복잡도 추정
    const estimatedComplexity = this.estimateContentComplexity(allText, chapters.length);

    return {
      keyThemes,
      informationDensity,
      emotionalTone,
      culturalContext,
      estimatedComplexity
    };
  }

  /**
   * NotebookLM 스타일 전체 팟캐스트 스크립트 생성 (새 프롬프트 시스템 사용)
   */
  private async generateNotebookLMPodcastScript(
    guideData: GuideData,
    language: string,
    analysis: any,
    options: any
  ): Promise<string> {

    console.log('🤖 새로운 프롬프트 시스템으로 전체 팟캐스트 스크립트 생성 중...');
    
    try {
      // 새로운 프롬프트 시스템 사용
      const prompt = await createFullGuidePodcastPrompt(
        guideData.overview.title,
        guideData,
        language,
        options
      );

      const response = await this.geminiClient.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8, // 창의적이지만 일관성 있게
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192, // 긴 팟캐스트를 위해 충분한 토큰
        }
      });

      const scriptText = response.response.text().trim();
      
      if (!scriptText || scriptText.length < 1000) {
        throw new Error('생성된 팟캐스트 스크립트가 너무 짧거나 비어있습니다.');
      }

      console.log('✅ 전체 팟캐스트 스크립트 생성 완료 (새 프롬프트 시스템):', {
        length: scriptText.length,
        estimatedDuration: Math.round((scriptText.replace(/\*\*[^*]+\*\*/g, '').split(' ').length / 150) * 60) + '초',
        promptSystem: 'podcast-prompts',
        language: language
      });

      return scriptText;

    } catch (error) {
      console.error('❌ 새 프롬프트 시스템 사용 실패, 기본 프롬프트로 폴백:', error);
      
      // 폴백: 기존 하드코딩 프롬프트 사용
      const fallbackPrompt = createQuickPrompt(`
# 🎙️ NotebookLM 스타일 전체 가이드 팟캐스트 생성 (폴백)

## 미션
${guideData.overview.title}에 대한 완전한 정보를 하나의 자연스러운 팟캐스트로 변환하세요.

## 가이드 정보
- 제목: ${guideData.overview.title}
- 주요 특징: ${guideData.overview.keyFeatures || guideData.overview.summary || ''}
- 배경: ${guideData.overview.background || guideData.overview.historicalBackground || ''}

## 출력 형식
**male:** 와 **female:** 형식으로 자연스러운 대화를 생성하세요.
NotebookLM 스타일의 깊이 있고 매력적인 팟캐스트를 만드세요.
`);

      const fallbackResponse = await this.geminiClient.generateContent({
        contents: [{ role: 'user', parts: [{ text: fallbackPrompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });

      const fallbackText = fallbackResponse.response.text().trim();
      
      if (!fallbackText || fallbackText.length < 1000) {
        throw new Error('폴백 프롬프트로도 팟캐스트 스크립트 생성에 실패했습니다.');
      }

      console.log('⚠️ 폴백 프롬프트로 팟캐스트 스크립트 생성 완료:', {
        length: fallbackText.length,
        mode: 'fallback'
      });

      return fallbackText;
    }
  }

  /**
   * 이중 팟캐스트 스크립트 생성 (사용자용 + TTS용)
   */
  private async createDualPodcastScripts(
    podcastScript: string,
    guideData: GuideData,
    language: string,
    options: any
  ): Promise<{ userScript: string; ttsScript: string }> {

    console.log('📝 이중 스크립트 생성 중...');

    // 사용자용 스크립트 (깔끔한 자막)
    const userScript = this.formatForUserReading(podcastScript);

    // TTS용 스크립트 생성
    const persona = this.selectOptimalPersona(guideData, options);
    const optimizationConfig = options.podcastStyle === 'deep-dive' 
      ? NotebookLMOptimizationFactory.createDeepDiveConfig()
      : NotebookLMOptimizationFactory.createMuseumConfig();

    // NotebookLM 스타일 최적화 적용
    const optimized = NotebookLMTTSOptimizer.optimizeForNotebookLMStyle(
      podcastScript, 
      optimizationConfig
    );

    console.log('✅ 이중 스크립트 생성 완료:', {
      userScriptLength: userScript.length,
      ttsScriptLength: optimized.optimizedScript.length,
      qualityScore: optimized.qualityScore
    });

    return {
      userScript,
      ttsScript: optimized.optimizedScript
    };
  }

  /**
   * 사용자 읽기용 포맷팅
   */
  private formatForUserReading(script: string): string {
    let formatted = script;

    // 화자 표시를 더 명확하게
    formatted = formatted.replace(/\*\*진행자:\*\*/g, '**🎙️ 진행자:**');
    formatted = formatted.replace(/\*\*큐레이터:\*\*/g, '**👨‍🏛️ 큐레이터:**');

    // 단락 구분을 명확하게
    formatted = formatted.replace(/\n\n/g, '\n\n---\n\n');

    // 중요한 정보 강조
    formatted = formatted.replace(/정말 (중요한|흥미로운|놀라운)/g, '**정말 $1**');
    formatted = formatted.replace(/특히 (주목할|기억해야 할)/g, '**특히 $1**');

    return formatted.trim();
  }

  /**
   * 최적 페르소나 선택 (팟캐스트 페르소나 시스템 활용)
   */
  private selectOptimalPersona(guideData: GuideData, options: any): TTSExpertPersona {
    const contentType = this.detectContentType(guideData.overview.title);
    const priority = options.priority || 'engagement';
    const audienceLevel = options.audienceLevel || 'intermediate';
    const language = options.language || 'ko';

    // 새로운 페르소나 시스템에서 페르소나 선택
    const podcastPersonas = this.selectPodcastPersonas(language, contentType, priority);
    
    console.log('🎭 페르소나 시스템 활용:', {
      language,
      contentType,
      priority,
      audienceLevel,
      selectedHost: podcastPersonas.host.name,
      selectedCurator: podcastPersonas.curator.name
    });

    // 기존 TTS 페르소나 시스템과의 호환성 유지
    return TTSExpertPersonaSelector.selectOptimalPersona(
      contentType,
      audienceLevel,
      priority
    );
  }

  /**
   * 언어와 컨텍스트에 따른 팟캐스트 페르소나 선택
   */
  private selectPodcastPersonas(language: string, contentType: string, priority: string): {
    host: PodcastPersona;
    curator: PodcastPersona;
  } {
    const langCode = language.slice(0, 2).toLowerCase();
    
    switch (langCode) {
      case 'en':
        return {
          host: PERSONAS.ENGLISH_HOST,
          curator: PERSONAS.ENGLISH_CURATOR
        };
      case 'ja':
        return {
          host: PERSONAS.JAPANESE_HOST,
          curator: PERSONAS.JAPANESE_CURATOR
        };
      default:
        return {
          host: PERSONAS.HOST,
          curator: PERSONAS.CURATOR
        };
    }
  }

  /**
   * 콘텐츠 타입 감지
   */
  private detectContentType(title: string): 'museum' | 'historical' | 'cultural' | 'technical' {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('박물관') || lowerTitle.includes('미술관')) return 'museum';
    if (lowerTitle.includes('궁') || lowerTitle.includes('성') || lowerTitle.includes('유적')) return 'historical';
    if (lowerTitle.includes('문화') || lowerTitle.includes('전통')) return 'cultural';
    
    return 'museum';
  }

  /**
   * 헬퍼 메서드들
   */
  private extractKeyThemes(text: string): string[] {
    const commonThemes = ['역사', '문화', '예술', '건축', '전통', '유물', '전시', '교육'];
    return commonThemes.filter(theme => text.includes(theme));
  }

  private analyzeEmotionalTone(text: string): string {
    if (text.includes('경이로운') || text.includes('놀라운')) return 'wonder';
    if (text.includes('흥미') || text.includes('재미')) return 'excitement';
    if (text.includes('의미') || text.includes('깊이')) return 'reverence';
    return 'curiosity';
  }

  private analyzeCulturalContext(guideData: GuideData): string[] {
    const context: string[] = [];
    const title = guideData.overview.title.toLowerCase();
    
    if (title.includes('궁') || title.includes('왕')) context.push('royal');
    if (title.includes('불교') || title.includes('절')) context.push('religious');
    if (title.includes('전통') || title.includes('민속')) context.push('traditional');
    if (title.includes('현대') || title.includes('미술')) context.push('modern');
    
    return context.length > 0 ? context : ['cultural'];
  }

  private estimateContentComplexity(text: string, chapterCount: number): number {
    const textLength = text.length;
    const complexityScore = Math.min(10, Math.floor(textLength / 500) + chapterCount);
    return complexityScore;
  }

  private generatePodcastTitle(guideData: GuideData, language: string = 'ko'): string {
    const langCode = language.slice(0, 2).toLowerCase();
    const title = guideData.overview.title;
    
    switch (langCode) {
      case 'en':
        return `${title} - Complete Guide: Deep Exploration`;
      case 'ja':
        return `${title} 完全ガイド - 詳細な探求`;
      case 'zh':
        return `${title} 完整指南 - 深度探索`;
      case 'es':
        return `${title} - Guía Completa: Exploración Profunda`;
      default:
        return `${title} 완전 가이드 - 깊이 있는 탐구`;
    }
  }

  private generatePodcastDescription(guideData: GuideData, language: string = 'ko'): string {
    const langCode = language.slice(0, 2).toLowerCase();
    const title = guideData.overview.title;
    
    switch (langCode) {
      case 'en':
        return `A comprehensive NotebookLM-style audio guide covering everything about ${title}. Experience an exciting journey with expert curators.`;
      case 'ja':
        return `${title}のすべてを含むNotebookLMスタイルのオーディオガイドです。専門学芸員との興味深い旅をお楽しみください。`;
      case 'zh':
        return `包含${title}所有内容的NotebookLM风格音频指南。与专业策展人一起体验精彩的旅程。`;
      case 'es':
        return `Una guía de audio estilo NotebookLM que cubre todo sobre ${title}. Experimenta un viaje emocionante con curadores expertos.`;
      default:
        return `${title}의 모든 것을 담은 NotebookLM 스타일 오디오 가이드입니다. 전문 큐레이터와 함께 하는 흥미진진한 여행을 경험해보세요.`;
    }
  }

  private getPersonaLanguage(language: string): string {
    const langCode = language.slice(0, 2).toLowerCase();
    const languages = {
      ko: '한국어',
      en: 'English',
      ja: '日本語',
      zh: '中文',
      es: 'Español'
    };
    return languages[langCode as keyof typeof languages] || languages.ko;
  }

  private estimateTotalDuration(script: string): string {
    const words = script.replace(/\*\*[^*]+\*\*/g, '').split(/\s+/).length;
    const minutes = Math.round((words / 150) * 60 / 60); // 150 WPM 기준
    return `약 ${minutes}분`;
  }

  private generateChapterTimestamps(guideData: GuideData, script: string): ChapterTimestamp[] {
    const chapters = guideData.realTimeGuide?.chapters || [];
    const totalWords = script.split(/\s+/).length;
    const wordsPerMinute = 150;
    let currentTime = 0;

    return chapters.map((chapter, idx) => {
      const chapterWords = (chapter.narrative || chapter.coreNarrative || '').split(/\s+/).length;
      const estimatedChapterDuration = Math.max(60, (chapterWords / wordsPerMinute) * 60); // 최소 1분
      
      const timestamp: ChapterTimestamp = {
        chapterIndex: idx,
        title: chapter.title,
        estimatedStartTime: currentTime,
        estimatedEndTime: currentTime + estimatedChapterDuration,
        keyTopics: this.extractKeyTopicsFromChapter(chapter.narrative || chapter.coreNarrative || '')
      };

      currentTime += estimatedChapterDuration + 30; // 30초 전환 시간
      return timestamp;
    });
  }

  private extractKeyTopicsFromChapter(text: string): string[] {
    const topics: string[] = [];
    if (text.includes('역사')) topics.push('역사');
    if (text.includes('문화')) topics.push('문화');
    if (text.includes('예술')) topics.push('예술');
    if (text.includes('건축')) topics.push('건축');
    return topics.slice(0, 3); // 최대 3개
  }

  private generateSystemPrompt(guideData: GuideData, options: any, language: string = 'ko'): string {
    const langCode = language.slice(0, 2).toLowerCase();
    const title = guideData.overview.title;
    const podcastPersonas = this.selectPodcastPersonas(language, this.detectContentType(title), options.priority || 'engagement');
    
    switch (langCode) {
      case 'en':
        return `NotebookLM-style complete guide podcast TTS generation system prompt for ${title}. Features ${podcastPersonas.host.name} and ${podcastPersonas.curator.name} personas with natural dialogue, emotional depth, and balanced information delivery for high-quality voice generation.`;
      case 'ja':
        return `${title}のNotebookLMスタイル完全ガイドポッドキャストTTS生成用システムプロンプトです。${podcastPersonas.host.name}と${podcastPersonas.curator.name}のペルソナを特徴とし、自然な対話、感情的な深さ、情報伝達のバランスを取った高品質な音声生成を目標とします。`;
      case 'zh':
        return `${title}的NotebookLM风格完整指南播客TTS生成系统提示。具有${podcastPersonas.host.name}和${podcastPersonas.curator.name}角色，以自然对话、情感深度和信息传递平衡为目标，生成高质量语音。`;
      case 'es':
        return `Prompt del sistema de generación TTS para podcast de guía completa estilo NotebookLM de ${title}. Presenta las personalidades de ${podcastPersonas.host.name} y ${podcastPersonas.curator.name} con diálogo natural, profundidad emocional y entrega de información equilibrada para una generación de voz de alta calidad.`;
      default:
        return `NotebookLM 스타일 ${title} 전체 가이드 팟캐스트 TTS 생성을 위한 시스템 프롬프트입니다. ${podcastPersonas.host.name}와 ${podcastPersonas.curator.name} 페르소나를 활용하여 자연스러운 대화, 감정적 깊이, 정보 전달의 균형을 맞춘 고품질 음성 생성을 목표로 합니다.`;
    }
  }

  private evaluatePodcastQuality(
    dualScripts: { userScript: string; ttsScript: string },
    analysis: any
  ): {
    overallScore: number;
    notebookLMSimilarity: number;
    conversationNaturalness: number;
    informationCompleteness: number;
  } {
    // NotebookLM 패턴 유사도
    const notebookLMPatterns = ['그런데 말이야', '정말 흥미로운', '상상해보세요', '믿기 어렵겠지만'];
    const patternCount = notebookLMPatterns.filter(pattern => 
      dualScripts.userScript.includes(pattern)
    ).length;
    const notebookLMSimilarity = Math.min(100, (patternCount / notebookLMPatterns.length) * 100);

    // 대화 자연스러움 (화자 전환 빈도)
    const speakerTransitions = (dualScripts.userScript.match(/\*\*(진행자|큐레이터):\*\*/g) || []).length;
    const conversationNaturalness = Math.min(100, speakerTransitions * 5);

    // 정보 완전성 (길이 기반)
    const informationCompleteness = Math.min(100, dualScripts.userScript.length / 50);

    const overallScore = Math.round((notebookLMSimilarity + conversationNaturalness + informationCompleteness) / 3);

    return {
      overallScore,
      notebookLMSimilarity: Math.round(notebookLMSimilarity),
      conversationNaturalness: Math.round(conversationNaturalness),
      informationCompleteness: Math.round(informationCompleteness)
    };
  }

  private estimateTokenCount(text: string): number {
    return Math.round(text.length / 4); // 대략적인 토큰 추정
  }

  private calculateSSMLComplexity(script: string): number {
    const ssmlTags = (script.match(/<[^>]+>/g) || []).length;
    const prosodyTags = (script.match(/<prosody/g) || []).length;
    const emphasisTags = (script.match(/<emphasis/g) || []).length;
    
    return ssmlTags + (prosodyTags * 2) + (emphasisTags * 1.5);
  }
}

// 팩토리 클래스
export class FullGuidePodcastFactory {
  
  static createForMuseum(guideData: GuideData, language: string = 'ko-KR'): Promise<FullGuidePodcastScript> {
    const generator = new FullGuidePodcastGenerator();
    return generator.generateFullGuidePodcast(guideData, language, {
      priority: 'emotion',
      audienceLevel: 'intermediate',
      podcastStyle: 'educational'
    });
  }
  
  static createForHistorical(guideData: GuideData, language: string = 'ko-KR'): Promise<FullGuidePodcastScript> {
    const generator = new FullGuidePodcastGenerator();
    return generator.generateFullGuidePodcast(guideData, language, {
      priority: 'accuracy',
      audienceLevel: 'intermediate',
      podcastStyle: 'deep-dive'
    });
  }
  
  static createDeepDive(guideData: GuideData, language: string = 'ko-KR'): Promise<FullGuidePodcastScript> {
    const generator = new FullGuidePodcastGenerator();
    return generator.generateFullGuidePodcast(guideData, language, {
      priority: 'engagement',
      audienceLevel: 'advanced',
      podcastStyle: 'deep-dive'
    });
  }
}

// 모든 클래스는 이미 위에서 export 되었으므로 여기서는 제거
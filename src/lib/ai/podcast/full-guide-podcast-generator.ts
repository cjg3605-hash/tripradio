// 전체 가이드 통합 팟캐스트 생성기
// NotebookLM 스타일로 전체 박물관/관광지 가이드를 하나의 자연스러운 팟캐스트로 변환

import { getGeminiClient } from '@/lib/ai/gemini-client';
import { createQuickPrompt } from '@/lib/ai/prompt-utils';
import { GuideData } from '@/types/guide';
import { TTSExpertPersona, TTSExpertPersonaSelector } from '../personas/tts-expert-persona';
import { DualScriptGenerator, UserChapterScript, TTSAudioScript } from '../scripts/dual-script-generator';
import { NotebookLMTTSOptimizer, NotebookLMOptimizationFactory } from '../optimization/notebooklm-tts-optimization-guide';

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
      
      return {
        userScript: {
          title: this.generatePodcastTitle(guideData),
          description: this.generatePodcastDescription(guideData),
          totalDuration: this.estimateTotalDuration(dualScripts.userScript),
          script: dualScripts.userScript,
          chapterTimestamps: this.generateChapterTimestamps(guideData, dualScripts.userScript)
        },
        ttsScript: {
          combinedScript: dualScripts.ttsScript,
          systemPrompt: this.generateSystemPrompt(guideData, options),
          metadata: {
            persona: this.selectOptimalPersona(guideData, options),
            language,
            totalTokens: this.estimateTokenCount(dualScripts.ttsScript),
            processingTimeMs: processingTime,
            optimizationLevel: 'notebooklm-enhanced',
            ssmlComplexity: this.calculateSSMLComplexity(dualScripts.ttsScript)
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
   * NotebookLM 스타일 전체 팟캐스트 스크립트 생성
   */
  private async generateNotebookLMPodcastScript(
    guideData: GuideData,
    language: string,
    analysis: any,
    options: any
  ): Promise<string> {

    const prompt = createQuickPrompt(`
# 🎙️ NotebookLM 스타일 전체 가이드 팟캐스트 생성

## 미션
${guideData.overview.title}에 대한 완전한 정보를 하나의 자연스러운 팟캐스트로 변환하세요.

## NotebookLM 스타일 특징 (2025년 기준)
1. **Two-Host Conversation**: 진행자(호기심 많은 일반인) + 큐레이터(전문가)
2. **Deep Dive 방식**: 표면적 → 흥미로운 → 놀라운 사실 순으로 정보 레이어링
3. **자연스러운 대화**: 실제 사람들이 대화하는 것처럼 끼어들기, 감탄, 질문
4. **청취자 참여**: "상상해보세요", "믿기 어렵겠지만" 등 몰입도 높이는 표현
5. **감정적 연결**: 개인적 경험과 연결, 공감할 수 있는 이야기

## 가이드 정보 통합
### 개요
- 제목: ${guideData.overview.title}
- 주요 특징: ${guideData.overview.keyFeatures || guideData.overview.summary || ''}
- 배경: ${guideData.overview.background || guideData.overview.historicalBackground || ''}

### 필수 방문 포인트
${guideData.mustVisitSpots || '주요 관람 포인트들이 있습니다.'}

### 챕터별 상세 정보
${guideData.realTimeGuide?.chapters?.map((chapter, idx) => `
**챕터 ${idx + 1}: ${chapter.title}**
내용: ${chapter.narrative || chapter.coreNarrative || ''}
다음 방향: ${chapter.nextDirection || ''}
`).join('\n')}

## 팟캐스트 구성 요구사항
1. **자연스러운 시작**: "안녕하세요, 여러분! 오늘은 정말 흥미로운..."
2. **정보 레이어링**: 기본 정보 → 흥미로운 사실 → 놀라운 발견
3. **화자 역할 분담**:
   - **진행자**: 호기심, 질문, 감탄, 청취자 대변
   - **큐레이터**: 전문 지식, 배경 설명, 깊이 있는 해석
4. **자연스러운 전환**: "그런데 말이야", "아, 그거 정말 흥미로운 점이야"
5. **감정적 몰입**: 경외감, 호기심, 감동을 자연스럽게 표현
6. **완성도 있는 마무리**: 전체 여행의 의미와 기억에 남을 포인트 정리

## 언어 및 톤
- 언어: ${language === 'ko-KR' ? '한국어' : language}
- 톤: ${options.podcastStyle === 'deep-dive' ? '깊이 있는 탐구' : '친근하고 교육적'}
- 청중 수준: ${options.audienceLevel || 'intermediate'}

## 출력 형식
전체 가이드 정보를 완전히 포함한 하나의 연속된 팟캐스트 대화로 생성하세요.
화자 표시: **진행자:** 와 **큐레이터:** 로 명확히 구분하세요.

모든 챕터의 내용을 자연스럽게 통합하여 15-20분 분량의 완성된 팟캐스트를 만드세요.
`);

    console.log('🤖 Gemini로 전체 팟캐스트 스크립트 생성 중...');
    
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

    console.log('✅ 전체 팟캐스트 스크립트 생성 완료:', {
      length: scriptText.length,
      estimatedDuration: Math.round((scriptText.replace(/\*\*[^*]+\*\*/g, '').split(' ').length / 150) * 60) + '초'
    });

    return scriptText;
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
   * 최적 페르소나 선택
   */
  private selectOptimalPersona(guideData: GuideData, options: any): TTSExpertPersona {
    const contentType = this.detectContentType(guideData.overview.title);
    const priority = options.priority || 'engagement';
    const audienceLevel = options.audienceLevel || 'intermediate';

    return TTSExpertPersonaSelector.selectOptimalPersona(
      contentType,
      audienceLevel,
      priority
    );
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

  private generatePodcastTitle(guideData: GuideData): string {
    return `${guideData.overview.title} 완전 가이드 - 깊이 있는 탐구`;
  }

  private generatePodcastDescription(guideData: GuideData): string {
    return `${guideData.overview.title}의 모든 것을 담은 NotebookLM 스타일 오디오 가이드입니다. 전문 큐레이터와 함께 하는 흥미진진한 여행을 경험해보세요.`;
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

  private generateSystemPrompt(guideData: GuideData, options: any): string {
    return `NotebookLM 스타일 ${guideData.overview.title} 전체 가이드 팟캐스트 TTS 생성을 위한 시스템 프롬프트입니다. 자연스러운 대화, 감정적 깊이, 정보 전달의 균형을 맞춘 고품질 음성 생성을 목표로 합니다.`;
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
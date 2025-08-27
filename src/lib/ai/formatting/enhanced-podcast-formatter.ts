/**
 * 향상된 팟캐스트 스크립트 포맷터
 * NotebookLM 스타일과 페르소나 시스템을 활용한 정교한 포맷팅
 */

import { PERSONAS } from '../personas/podcast-personas';
import { ConversationQualityEvaluator, type DialogueTurn } from '../dialogue/natural-conversation-engine';

export interface FormattingOptions {
  speakerFormat: 'korean' | 'english' | 'mixed';
  includeTimestamps: boolean;
  includeQualityMetrics: boolean;
  optimizeForSubtitles: boolean;
  enhanceReadability: boolean;
}

export interface FormattedOutput {
  content: string;
  metadata: {
    totalCharacters: number;
    speakerTurns: {
      host: number;
      curator: number;
    };
    qualityScore?: number;
    readabilityScore: number;
    subtitleOptimized: boolean;
  };
  statistics: {
    averageTurnLength: number;
    informationDensity: number;
    audienceEngagementCount: number;
  };
}

/**
 * 향상된 팟캐스트 포맷터 클래스
 */
export class EnhancedPodcastFormatter {
  private qualityEvaluator = new ConversationQualityEvaluator();

  /**
   * 메인 포맷팅 함수 - 기존 formatPodcastScript 대체
   */
  formatPodcastScript(
    rawScript: string,
    options: Partial<FormattingOptions> = {}
  ): FormattedOutput {
    const defaultOptions: FormattingOptions = {
      speakerFormat: 'korean',
      includeTimestamps: false,
      includeQualityMetrics: true,
      optimizeForSubtitles: true,
      enhanceReadability: true
    };

    const config = { ...defaultOptions, ...options };
    
    // 1단계: 기본 화자 분리 및 정리
    let formatted = this.cleanAndNormalizeScript(rawScript);
    
    // 2단계: 화자별 포맷 적용
    formatted = this.applySpeakerFormatting(formatted, config.speakerFormat);
    
    // 3단계: 자막 최적화 (요청 시)
    if (config.optimizeForSubtitles) {
      formatted = this.optimizeForSubtitles(formatted);
    }
    
    // 4단계: 가독성 향상 (요청 시)
    if (config.enhanceReadability) {
      formatted = this.enhanceReadability(formatted);
    }
    
    // 5단계: 타임스탬프 추가 (요청 시)
    if (config.includeTimestamps) {
      formatted = this.addTimestamps(formatted);
    }
    
    // 메타데이터 생성
    const metadata = this.generateMetadata(formatted, rawScript, config);
    const statistics = this.calculateStatistics(formatted);
    
    return {
      content: formatted,
      metadata,
      statistics
    };
  }

  /**
   * 스크립트 정리 및 정규화
   */
  private cleanAndNormalizeScript(rawScript: string): string {
    let cleaned = rawScript;
    
    // 과도한 줄바꿈 정리
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // 앞뒤 공백 제거
    cleaned = cleaned.replace(/^\s+|\s+$/g, '');
    
    // 중복 공백 정리
    cleaned = cleaned.replace(/[ ]{2,}/g, ' ');
    
    // 특수문자 정리
    cleaned = cleaned.replace(/[""]/g, '"');
    cleaned = cleaned.replace(/['']/g, "'");
    
    return cleaned;
  }

  /**
   * 화자별 포맷 적용
   */
  private applySpeakerFormatting(script: string, format: FormattingOptions['speakerFormat']): string {
    let formatted = script;
    
    // 다양한 화자 패턴을 한국어 형식으로 통일
    const speakerPatterns = [
      { pattern: /\*\*HOST:\*\*/g, replacement: '\n**진행자:**' },
      { pattern: /\*\*CURATOR:\*\*/g, replacement: '\n**큐레이터:**' },
      { pattern: /HOST:/g, replacement: '\n**진행자:**' },
      { pattern: /CURATOR:/g, replacement: '\n**큐레이터:**' },
      { pattern: /진행자:/g, replacement: '\n**진행자:**' },
      { pattern: /큐레이터:/g, replacement: '\n**큐레이터:**' },
      { pattern: /\b호스트:\s*/g, replacement: '\n**진행자:**' },
      { pattern: /\b가이드:\s*/g, replacement: '\n**큐레이터:**' },
      { pattern: /\b교수:\s*/g, replacement: '\n**큐레이터:**' }
    ];

    speakerPatterns.forEach(({ pattern, replacement }) => {
      formatted = formatted.replace(pattern, replacement);
    });

    // 형식별 추가 처리
    switch (format) {
      case 'english':
        formatted = formatted.replace(/\*\*진행자:\*\*/g, '\n**HOST:**');
        formatted = formatted.replace(/\*\*큐레이터:\*\*/g, '\n**CURATOR:**');
        break;
      case 'mixed':
        formatted = formatted.replace(/\*\*진행자:\*\*/g, '\n**진행자 (HOST):**');
        formatted = formatted.replace(/\*\*큐레이터:\*\*/g, '\n**큐레이터 (CURATOR):**');
        break;
      default:
        // 'korean' - 이미 적용됨
        break;
    }

    return formatted;
  }

  /**
   * 자막 최적화 - 팟캐스트 청취 중 자막 보기에 최적화
   */
  private optimizeForSubtitles(script: string): string {
    let optimized = script;
    
    // 1. 긴 문장을 적절히 분리
    optimized = optimized.replace(/([.!?])\s+([가-힣A-Z])/g, '$1\n$2');
    
    // 2. 화자 변경 시 명확한 구분
    optimized = optimized.replace(/(\*\*[^*]+\*\*)/g, '\n$1\n');
    
    // 3. 숫자와 단위 사이 공백 정리
    optimized = optimized.replace(/(\d+)\s*(cm|kg|년|세기|층)/g, '$1$2');
    
    // 4. 자막용 시각적 구분선 추가 (선택적)
    optimized = optimized.replace(/\n\*\*진행자:\*\*/g, '\n\n**진행자:**');
    optimized = optimized.replace(/\n\*\*큐레이터:\*\*/g, '\n\n**큐레이터:**');
    
    // 5. 감탄사와 추임새 명확화
    optimized = optimized.replace(/\b(와|우와|헉|어|음)\b/g, '($1)');
    
    return optimized;
  }

  /**
   * 가독성 향상
   */
  private enhanceReadability(script: string): string {
    let enhanced = script;
    
    // 1. 전문용어에 대한 설명 추가 감지 및 강조
    enhanced = enhanced.replace(/(국보\s*\d+호)/g, '**$1**');
    enhanced = enhanced.replace(/(세계\s*최[초고대])/g, '**$1**');
    
    // 2. 숫자 정보 강조
    enhanced = enhanced.replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(명|개|점|년|센티미터|미터|킬로그램)/g, '**$1$2**');
    
    // 3. 중요한 연결어 강조
    const importantConnectors = ['그런데', '하지만', '놀랍게도', '특히', '바로'];
    importantConnectors.forEach(connector => {
      enhanced = enhanced.replace(new RegExp(`\\b(${connector})\\b`, 'g'), '**$1**');
    });
    
    // 4. 질문 문장 시각적 강조
    enhanced = enhanced.replace(/([?])/g, '**$1**');
    
    // 5. 감정 표현 정리
    enhanced = enhanced.replace(/\s*(와|우와|헉|정말)\s*([!?]*)/g, ' **$1**$2');
    
    return enhanced;
  }

  /**
   * 타임스탬프 추가 (예상 재생 시간 기준)
   */
  private addTimestamps(script: string): string {
    const lines = script.split('\n').filter(line => line.trim());
    let currentTime = 0; // 초 단위
    
    const timestamped = lines.map(line => {
      if (line.includes('**진행자:**') || line.includes('**큐레이터:**')) {
        const timestamp = this.formatTimestamp(currentTime);
        currentTime += this.estimateLineReadingTime(line);
        return `[${timestamp}] ${line}`;
      }
      return line;
    });
    
    return timestamped.join('\n');
  }

  /**
   * 한 줄 읽기 시간 추정 (한국어 기준)
   */
  private estimateLineReadingTime(line: string): number {
    // 한국어: 분당 약 300-400자 (초당 5-7자)
    // 대화체: 좀 더 천천히 (초당 4-5자)
    const charactersPerSecond = 4.5;
    const characters = line.replace(/\*\*[^*]+\*\*/g, '').length;
    return Math.max(2, Math.ceil(characters / charactersPerSecond));
  }

  /**
   * 타임스탬프 포맷팅 (MM:SS)
   */
  private formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 메타데이터 생성
   */
  private generateMetadata(
    formattedScript: string,
    originalScript: string,
    options: FormattingOptions
  ): FormattedOutput['metadata'] {
    const hostTurns = (formattedScript.match(/\*\*진행자:\*\*/g) || []).length;
    const curatorTurns = (formattedScript.match(/\*\*큐레이터:\*\*/g) || []).length;
    
    return {
      totalCharacters: formattedScript.length,
      speakerTurns: {
        host: hostTurns,
        curator: curatorTurns
      },
      readabilityScore: this.calculateReadabilityScore(formattedScript),
      subtitleOptimized: options.optimizeForSubtitles
    };
  }

  /**
   * 통계 계산
   */
  private calculateStatistics(script: string): FormattedOutput['statistics'] {
    const turns = script.split(/\*\*[^*]+\*\*/).filter(turn => turn.trim().length > 0);
    const totalLength = turns.reduce((sum, turn) => sum + turn.length, 0);
    
    // 정보 밀도 계산 (숫자, 고유명사 등의 비율)
    const informationKeywords = script.match(/\d+|국보|\*\*[^*]+\*\*|세계|최초|발견/g) || [];
    
    // 청취자 참여 표현 계산
    const engagementPhrases = script.match(/청취자|여러분|상상해보세요|어떨까요/g) || [];
    
    return {
      averageTurnLength: Math.round(totalLength / Math.max(1, turns.length)),
      informationDensity: Math.round((informationKeywords.length / (script.length / 1000)) * 10) / 10,
      audienceEngagementCount: engagementPhrases.length
    };
  }

  /**
   * 가독성 점수 계산 (간단한 휴리스틱)
   */
  private calculateReadabilityScore(script: string): number {
    let score = 100;
    
    // 문장 길이 검사 (너무 긴 문장은 감점)
    const sentences = script.split(/[.!?]/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    if (avgSentenceLength > 100) score -= 10;
    if (avgSentenceLength > 150) score -= 10;
    
    // 화자 균형 검사
    const hostTurns = (script.match(/\*\*진행자:\*\*/g) || []).length;
    const curatorTurns = (script.match(/\*\*큐레이터:\*\*/g) || []).length;
    const balance = Math.min(hostTurns, curatorTurns) / Math.max(hostTurns, curatorTurns, 1);
    
    if (balance < 0.5) score -= 15;
    if (balance < 0.3) score -= 10;
    
    // 포맷 일관성 검사
    const inconsistentFormats = script.match(/(?:HOST:|CURATOR:|\b호스트:|\b가이드:)/g) || [];
    score -= inconsistentFormats.length * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * NotebookLM 스타일 품질 검증
   */
  verifyNotebookLMStyle(script: string): {
    isCompliant: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // 정보 밀도 검사
    const informationDensity = this.calculateStatistics(script).informationDensity;
    if (informationDensity < 8) {
      issues.push('정보 밀도가 낮음 (현재: ' + informationDensity + ', 목표: 8+)');
      suggestions.push('턴당 2-3개의 구체적 사실을 포함하세요');
    }
    
    // 청취자 참여 검사
    const engagementCount = this.calculateStatistics(script).audienceEngagementCount;
    if (engagementCount < 3) {
      issues.push('청취자 참여 유도가 부족함');
      suggestions.push('"청취자분들도", "여러분" 같은 표현을 더 사용하세요');
    }
    
    // 자연스러운 대화 패턴 검사
    const naturalPatterns = ['아', '그런데', '근데', '와', '정말', '헉'];
    const naturalCount = naturalPatterns.reduce((count, pattern) => 
      count + (script.match(new RegExp(pattern, 'g')) || []).length, 0
    );
    
    if (naturalCount < 5) {
      issues.push('자연스러운 감탄사와 연결어가 부족함');
      suggestions.push('대화를 더 자연스럽게 만드는 감탄사를 추가하세요');
    }
    
    return {
      isCompliant: issues.length === 0,
      issues,
      suggestions
    };
  }
}

/**
 * 레거시 호환성을 위한 간단한 래퍼 함수
 */
export function formatPodcastScript(rawScript: string): string {
  const formatter = new EnhancedPodcastFormatter();
  const result = formatter.formatPodcastScript(rawScript, {
    speakerFormat: 'korean',
    optimizeForSubtitles: true,
    enhanceReadability: true
  });
  
  return result.content;
}

export default {
  EnhancedPodcastFormatter,
  formatPodcastScript
};
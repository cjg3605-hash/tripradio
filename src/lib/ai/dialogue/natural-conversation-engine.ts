/**
 * 자연스러운 대화 생성 엔진
 * NotebookLM 스타일의 정보 계층화와 대화 흐름 관리
 */

import { HOST_PERSONA, CURATOR_PERSONA, type PodcastPersona } from '../personas/podcast-personas';

export interface ConversationContext {
  topic: string;
  subtopics: string[];
  facts: InformationLayer[];
  currentTurn: number;
  totalTurns: number;
  episode: {
    type: 'intro' | 'main' | 'transition';
    title: string;
    objectives: string[];
  };
}

export interface InformationLayer {
  level: 1 | 2 | 3; // 1: 기본사실, 2: 흥미로운 디테일, 3: 놀라운 발견
  content: string;
  impact: 'low' | 'medium' | 'high' | 'wow';
  connectsTo?: string[]; // 다른 정보와의 연결점
  source: 'basic' | 'expert' | 'latest_research' | 'behind_scenes';
}

export interface DialogueTurn {
  speaker: 'host' | 'curator';
  content: string;
  informationLayers: InformationLayer[];
  conversationTechniques: ConversationTechnique[];
  naturalFlow: {
    interruption?: string;
    completion?: string;
    transition?: string;
  };
}

export interface ConversationTechnique {
  type: 'layered_revelation' | 'natural_interruption' | 'shared_discovery' | 
        'audience_engagement' | 'meta_comment' | 'curiosity_hook';
  description: string;
  application: string;
}

/**
 * NotebookLM 스타일 대화 패턴 분석기
 */
export class NotebookLMPatternAnalyzer {
  
  /**
   * 정보를 3단계로 계층화 (NotebookLM의 핵심 패턴)
   */
  layerInformation(facts: string[]): InformationLayer[] {
    return facts.map((fact, index) => {
      // 기본 정보 판별
      if (this.isBasicFact(fact)) {
        return {
          level: 1,
          content: fact,
          impact: 'low',
          source: 'basic'
        };
      }
      
      // 놀라운 사실 판별
      if (this.isSurprisingFact(fact)) {
        return {
          level: 3,
          content: fact,
          impact: 'wow',
          source: 'latest_research',
          connectsTo: this.findConnections(fact, facts)
        };
      }
      
      // 중간 단계 정보
      return {
        level: 2,
        content: fact,
        impact: 'medium',
        source: 'expert'
      };
    });
  }

  /**
   * 기본 사실 여부 판단
   */
  private isBasicFact(fact: string): boolean {
    const basicIndicators = ['높이', '크기', '연도', '위치', '재료', '무게'];
    return basicIndicators.some(indicator => fact.includes(indicator));
  }

  /**
   * 놀라운 사실 여부 판단  
   */
  private isSurprisingFact(fact: string): boolean {
    const surprisingIndicators = ['세계 최초', '처음 발견', '놀랍게도', '의외로', '최근 연구'];
    return surprisingIndicators.some(indicator => fact.includes(indicator));
  }

  /**
   * 정보간 연결점 찾기
   */
  private findConnections(fact: string, allFacts: string[]): string[] {
    // 키워드 기반 연결점 찾기 (간단한 구현)
    const keywords = fact.split(' ').filter(word => word.length > 2);
    return allFacts.filter(otherFact => 
      otherFact !== fact && 
      keywords.some(keyword => otherFact.includes(keyword))
    ).slice(0, 2); // 최대 2개 연결
  }

  /**
   * 대화 기법 분석 및 추천
   */
  recommendTechniques(context: ConversationContext): ConversationTechnique[] {
    const techniques: ConversationTechnique[] = [];
    
    // 정보 계층화 기법
    techniques.push({
      type: 'layered_revelation',
      description: '기본 정보 → 흥미로운 디테일 → 놀라운 발견 순서로 정보 공개',
      application: '먼저 기본 사실을 제시한 후, "그런데 더 흥미로운 건..." 으로 심화 정보 연결'
    });

    // 청취자 참여 유도
    if (context.currentTurn % 3 === 0) {
      techniques.push({
        type: 'audience_engagement',
        description: '청취자를 대화에 참여시키는 기법',
        application: '"청취자분들도 상상해보세요" 같은 직접적 언급'
      });
    }

    // 공유된 발견 (NotebookLM의 특징)
    if (context.facts.some(f => f.impact === 'wow')) {
      techniques.push({
        type: 'shared_discovery',
        description: '함께 놀라고 발견하는 느낌 연출',
        application: '"저도 이번에 처음 알았는데..." 같은 공감대 형성'
      });
    }

    return techniques;
  }
}

/**
 * 자연스러운 대화 흐름 생성기
 */
export class NaturalFlowGenerator {

  /**
   * NotebookLM 스타일 대화 턴 생성
   */
  generateConversationTurn(
    speaker: PodcastPersona,
    context: ConversationContext,
    informationLayers: InformationLayer[]
  ): DialogueTurn {
    
    const techniques = new NotebookLMPatternAnalyzer().recommendTechniques(context);
    
    // 정보 계층별 대화 구성
    const layeredContent = this.buildLayeredContent(informationLayers, speaker, techniques);
    
    // 자연스러운 흐름 요소 추가
    const naturalFlow = this.generateNaturalFlow(speaker, context);
    
    return {
      speaker: speaker.role,
      content: layeredContent,
      informationLayers,
      conversationTechniques: techniques,
      naturalFlow
    };
  }

  /**
   * 계층화된 콘텐츠 구성
   */
  private buildLayeredContent(
    layers: InformationLayer[],
    speaker: PodcastPersona,
    techniques: ConversationTechnique[]
  ): string {
    let content = '';
    
    // Level 1 정보부터 시작
    const level1 = layers.filter(l => l.level === 1);
    if (level1.length > 0) {
      content += level1[0].content;
    }

    // Level 2 정보 연결
    const level2 = layers.filter(l => l.level === 2);
    if (level2.length > 0) {
      const transition = speaker.role === 'curator' ? ' 그런데 더 흥미로운 건,' : ' 아, 그리고';
      content += transition + ' ' + level2[0].content;
    }

    // Level 3 놀라운 정보
    const level3 = layers.filter(l => l.level === 3);
    if (level3.length > 0) {
      const wow = speaker.role === 'curator' ? ' 정말 놀라운 건' : ' 와, 그럼';
      content += wow + ' ' + level3[0].content;
    }

    return content;
  }

  /**
   * 자연스러운 흐름 요소 생성
   */
  private generateNaturalFlow(
    speaker: PodcastPersona,
    context: ConversationContext
  ): DialogueTurn['naturalFlow'] {
    const flow: DialogueTurn['naturalFlow'] = {};
    
    // 인터럽션 패턴
    if (Math.random() > 0.7) {
      flow.interruption = this.getInterruptionPattern(speaker);
    }
    
    // 완성 패턴 
    if (Math.random() > 0.6) {
      flow.completion = this.getCompletionPattern(speaker);
    }
    
    // 전환 패턴
    if (context.currentTurn > context.totalTurns * 0.8) {
      flow.transition = this.getTransitionPattern(speaker);
    }
    
    return flow;
  }

  private getInterruptionPattern(speaker: PodcastPersona): string {
    const patterns = speaker.notebookLMPatterns.interruptions;
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getCompletionPattern(speaker: PodcastPersona): string {
    const patterns = speaker.notebookLMPatterns.affirmations;
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getTransitionPattern(speaker: PodcastPersona): string {
    if (speaker.role === 'host') {
      return '시간이 벌써 이렇게! 다음은';
    } else {
      return '그럼 이제 다음 작품으로';
    }
  }
}

/**
 * 대화 품질 평가기
 */
export class ConversationQualityEvaluator {
  
  /**
   * NotebookLM 스타일 품질 평가
   */
  evaluateConversation(turns: DialogueTurn[]): ConversationQuality {
    const metrics = {
      informationDensity: this.calculateInformationDensity(turns),
      naturalFlow: this.evaluateNaturalFlow(turns),
      audienceEngagement: this.evaluateAudienceEngagement(turns),
      expertiseBalance: this.evaluateExpertiseBalance(turns),
      notebookLMAlignment: this.evaluateNotebookLMAlignment(turns)
    };

    const overallScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;
    
    return {
      overallScore,
      metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  private calculateInformationDensity(turns: DialogueTurn[]): number {
    const totalFacts = turns.reduce((sum, turn) => sum + turn.informationLayers.length, 0);
    const totalLength = turns.reduce((sum, turn) => sum + turn.content.length, 0);
    
    // 1000자당 10개 사실이 목표 (NotebookLM 수준)
    const targetRatio = 0.01;
    const actualRatio = totalFacts / (totalLength / 1000);
    
    return Math.min(100, (actualRatio / targetRatio) * 100);
  }

  private evaluateNaturalFlow(turns: DialogueTurn[]): number {
    let score = 0;
    
    // 인터럽션과 완성 패턴 비율 확인
    const naturalFlowCount = turns.filter(turn => 
      turn.naturalFlow.interruption || turn.naturalFlow.completion
    ).length;
    
    score = (naturalFlowCount / turns.length) * 100;
    
    return Math.min(100, score);
  }

  private evaluateAudienceEngagement(turns: DialogueTurn[]): number {
    const engagementKeywords = ['청취자', '여러분', '상상해보세요', '어떨까요'];
    
    const engagementCount = turns.filter(turn =>
      engagementKeywords.some(keyword => turn.content.includes(keyword))
    ).length;
    
    // 전체 턴의 20% 이상에서 청취자 언급이 목표
    return Math.min(100, (engagementCount / turns.length) * 500);
  }

  private evaluateExpertiseBalance(turns: DialogueTurn[]): number {
    const hostTurns = turns.filter(t => t.speaker === 'host').length;
    const curatorTurns = turns.filter(t => t.speaker === 'curator').length;
    
    // 50:50 비율이 이상적
    const balance = Math.min(hostTurns, curatorTurns) / Math.max(hostTurns, curatorTurns);
    return balance * 100;
  }

  private evaluateNotebookLMAlignment(turns: DialogueTurn[]): number {
    let score = 0;
    
    // 계층화된 정보 제시 확인
    const layeredTurns = turns.filter(turn =>
      turn.informationLayers.some(l => l.level === 1) &&
      turn.informationLayers.some(l => l.level >= 2)
    ).length;
    
    score += (layeredTurns / turns.length) * 50;
    
    // 놀라움 요소 확인
    const surpriseTurns = turns.filter(turn =>
      turn.informationLayers.some(l => l.impact === 'wow')
    ).length;
    
    score += (surpriseTurns / turns.length) * 50;
    
    return Math.min(100, score);
  }

  private generateRecommendations(metrics: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    if (metrics.informationDensity < 70) {
      recommendations.push('정보 밀도를 높이세요. 턴당 2-3개 구체적 사실 포함 권장');
    }
    
    if (metrics.naturalFlow < 60) {
      recommendations.push('자연스러운 인터럽션과 완성 패턴을 더 활용하세요');
    }
    
    if (metrics.audienceEngagement < 50) {
      recommendations.push('청취자 참여 유도 표현을 더 자주 사용하세요');
    }
    
    if (metrics.expertiseBalance < 70) {
      recommendations.push('진행자와 큐레이터의 발언 비율을 조정하세요');
    }
    
    return recommendations;
  }
}

export interface ConversationQuality {
  overallScore: number;
  metrics: {
    informationDensity: number;
    naturalFlow: number;
    audienceEngagement: number;
    expertiseBalance: number;
    notebookLMAlignment: number;
  };
  recommendations: string[];
}

/**
 * 통합 대화 엔진
 */
export class NaturalConversationEngine {
  private patternAnalyzer = new NotebookLMPatternAnalyzer();
  private flowGenerator = new NaturalFlowGenerator();
  private qualityEvaluator = new ConversationQualityEvaluator();

  /**
   * 완전한 대화 생성
   */
  async generateFullConversation(
    topic: string,
    facts: string[],
    targetTurns: number = 8
  ): Promise<{turns: DialogueTurn[], quality: ConversationQuality}> {
    
    // 정보 계층화
    const informationLayers = this.patternAnalyzer.layerInformation(facts);
    
    // 컨텍스트 준비
    const context: ConversationContext = {
      topic,
      subtopics: this.extractSubtopics(facts),
      facts: informationLayers,
      currentTurn: 0,
      totalTurns: targetTurns,
      episode: {
        type: 'main',
        title: topic,
        objectives: ['정보 전달', '흥미 유발', '청취자 참여']
      }
    };

    // 대화 턴 생성
    const turns: DialogueTurn[] = [];
    
    for (let i = 0; i < targetTurns; i++) {
      context.currentTurn = i;
      const speaker = i % 2 === 0 ? HOST_PERSONA : CURATOR_PERSONA;
      
      // 해당 턴에 사용할 정보 선택
      const turnInfo = informationLayers.slice(
        Math.floor(i * informationLayers.length / targetTurns),
        Math.floor((i + 1) * informationLayers.length / targetTurns)
      );
      
      const turn = this.flowGenerator.generateConversationTurn(speaker, context, turnInfo);
      turns.push(turn);
    }

    // 품질 평가
    const quality = this.qualityEvaluator.evaluateConversation(turns);
    
    return { turns, quality };
  }

  private extractSubtopics(facts: string[]): string[] {
    // 간단한 키워드 추출 (향후 NLP로 개선 가능)
    const keywords = facts.join(' ').split(' ')
      .filter(word => word.length > 3)
      .slice(0, 5);
    return [...new Set(keywords)];
  }
}

export default {
  NaturalConversationEngine,
  NotebookLMPatternAnalyzer,
  NaturalFlowGenerator,
  ConversationQualityEvaluator
};
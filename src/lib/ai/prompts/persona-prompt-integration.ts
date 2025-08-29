/**
 * 페르소나-프롬프트 연동 유틸리티
 * 페르소나 시스템의 풍부한 기능들을 프롬프트 시스템에 완전히 연동
 */

import {
  PodcastPersona,
  PersonaResponseGenerator,
  PersonaDialogueSimulator,
  HOST_PERSONA,
  CURATOR_PERSONA,
  ENGLISH_HOST_PERSONA,
  ENGLISH_CURATOR_PERSONA,
  JAPANESE_HOST_PERSONA,
  JAPANESE_CURATOR_PERSONA
} from '../personas/podcast-personas';

export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh' | 'es';

export interface PersonaPromptConfig {
  language: LanguageCode;
  situationType: 'intro' | 'main' | 'transition';
  contextInfo?: {
    museumName: string;
    chapterIndex: number;
    exhibition?: any;
    facts: string[];
  };
  targetLength?: number;
}

/**
 * 페르소나-프롬프트 통합 매니저
 * 페르소나의 동적 패턴을 실제 프롬프트에 적용
 */
export class PersonaPromptIntegrator {
  private responseGenerator = new PersonaResponseGenerator();
  private dialogueSimulator = new PersonaDialogueSimulator();

  /**
   * 언어별 페르소나 페어 가져오기
   */
  getPersonaPair(language: LanguageCode): { host: PodcastPersona; curator: PodcastPersona } {
    switch (language) {
      case 'ko':
        return { host: HOST_PERSONA, curator: CURATOR_PERSONA };
      case 'en':
        return { host: ENGLISH_HOST_PERSONA, curator: ENGLISH_CURATOR_PERSONA };
      case 'ja':
        return { host: JAPANESE_HOST_PERSONA, curator: JAPANESE_CURATOR_PERSONA };
      case 'zh':
      case 'es':
        // 중국어, 스페인어는 한국어 페르소나 기반으로 언어적 특성 반영
        return { host: HOST_PERSONA, curator: CURATOR_PERSONA };
      default:
        return { host: HOST_PERSONA, curator: CURATOR_PERSONA };
    }
  }

  /**
   * 상황별 동적 오프닝 생성
   */
  generateDynamicOpening(config: PersonaPromptConfig): string {
    const { host, curator } = this.getPersonaPair(config.language);
    const { museumName, chapterIndex, exhibition } = config.contextInfo || {};
    
    if (chapterIndex === 0) {
      return this.generateIntroOpening(host, curator, museumName, config.language);
    } else {
      return this.generateExhibitionOpening(host, curator, exhibition, config.language);
    }
  }

  /**
   * 인트로 오프닝 동적 생성
   */
  private generateIntroOpening(
    host: PodcastPersona, 
    curator: PodcastPersona, 
    museumName?: string,
    language: LanguageCode = 'ko'
  ): string {
    const hostOpening = this.responseGenerator.getPersonaResponse(host, 'engagement');
    const hostSurprise = this.responseGenerator.getPersonaResponse(host, 'surprise');
    const curatorExplanation = this.responseGenerator.getPersonaResponse(curator, 'explanation');
    const hostCuriosity = this.responseGenerator.getPersonaResponse(host, 'curiosity');
    const curatorEngagement = this.responseGenerator.getPersonaResponse(curator, 'engagement');

    const templates = this.getLanguageTemplates(language);

    return `
**${host.role === 'host' ? templates.host : templates.curator}:** ${hostOpening} ${templates.welcome} ${museumName}${templates.locationIntro} ${hostSurprise}

**${curator.role === 'curator' ? templates.curator : templates.host}:** ${templates.greeting} ${curator.name}${templates.nameIntro} ${curatorExplanation} ${templates.scaleDescription}

**${host.role === 'host' ? templates.host : templates.curator}:** ${hostSurprise} ${templates.scaleReaction}

**${curator.role === 'curator' ? templates.curator : templates.host}:** ${templates.factIntroduction} ${curatorEngagement}

**${host.role === 'host' ? templates.host : templates.curator}:** ${hostCuriosity} ${templates.storageQuestion}

**${curator.role === 'curator' ? templates.curator : templates.host}:** ${templates.storageExplanation}
`;
  }

  /**
   * 전시관 오프닝 동적 생성
   */
  private generateExhibitionOpening(
    host: PodcastPersona,
    curator: PodcastPersona,
    exhibition: any,
    language: LanguageCode
  ): string {
    const hostTransition = this.responseGenerator.getPersonaResponse(host, 'transition');
    const curatorExplanation = this.responseGenerator.getPersonaResponse(curator, 'explanation');
    const hostCuriosity = this.responseGenerator.getPersonaResponse(host, 'curiosity');
    const curatorSurprise = this.responseGenerator.getPersonaResponse(curator, 'surprise');

    const templates = this.getLanguageTemplates(language);
    const exhibitionName = exhibition?.name || templates.defaultExhibition;

    return `
**${host.role === 'host' ? templates.host : templates.curator}:** ${hostTransition} ${exhibitionName}${templates.exhibitionEnter} ${templates.environmentObservation}

**${curator.role === 'curator' ? templates.curator : templates.host}:** ${curatorSurprise} ${exhibitionName}${templates.exhibitionDescription} ${curatorExplanation}

**${host.role === 'host' ? templates.host : templates.curator}:** ${hostCuriosity} ${templates.comparisonQuestion}

**${curator.role === 'curator' ? templates.curator : templates.host}:** ${templates.technicalExplanation}

**${host.role === 'host' ? templates.host : templates.curator}:** ${templates.artworkSpotting}

**${curator.role === 'curator' ? templates.curator : templates.host}:** ${templates.artworkIntroduction}
`;
  }

  /**
   * 상황별 동적 메인 대화 생성
   */
  generateDynamicMainDialogue(
    config: PersonaPromptConfig,
    facts: string[],
    targetTurns: number = 8
  ): string {
    const { host, curator } = this.getPersonaPair(config.language);
    const topic = config.contextInfo?.exhibition?.name || '박물관 투어';
    
    const dialogueExchange = this.dialogueSimulator.simulateDialogueExchange(
      topic,
      facts,
      targetTurns
    );

    return dialogueExchange.map(turn => {
      const persona = turn.speaker === 'host' ? host : curator;
      const templates = this.getLanguageTemplates(config.language);
      const roleLabel = turn.speaker === 'host' ? templates.host : templates.curator;
      
      // 페르소나 스타일 적용
      const styledContent = this.responseGenerator.applyPersonaStyle(persona, turn.content);
      
      return `**${roleLabel}:** ${styledContent}`;
    }).join('\n\n');
  }

  /**
   * 자연스러운 인터럽션 생성
   */
  generateNaturalInterruption(
    currentSpeaker: 'host' | 'curator',
    language: LanguageCode,
    context?: string
  ): string {
    const { host, curator } = this.getPersonaPair(language);
    const currentPersona = currentSpeaker === 'host' ? host : curator;
    const nextPersona = currentSpeaker === 'host' ? curator : host;
    
    return this.dialogueSimulator.generateNaturalInterruption(
      currentPersona,
      nextPersona,
      context || ''
    );
  }

  /**
   * 상황별 동적 전환 생성
   */
  generateDynamicTransition(config: PersonaPromptConfig): string {
    const { host, curator } = this.getPersonaPair(config.language);
    const { chapterIndex, exhibition } = config.contextInfo || {};
    
    const hostTransition = this.responseGenerator.getPersonaResponse(host, 'transition');
    const curatorTransition = this.responseGenerator.getPersonaResponse(curator, 'transition');
    const hostEngagement = this.responseGenerator.getPersonaResponse(host, 'engagement');
    const curatorEngagement = this.responseGenerator.getPersonaResponse(curator, 'engagement');

    const templates = this.getLanguageTemplates(config.language);

    if (chapterIndex === 0) {
      return `
**${templates.host}:** ${hostTransition} ${templates.timeFlies} ${templates.firstHallTransition}

**${templates.curator}:** ${curatorTransition} ${templates.nextDestination} ${templates.nextPreview}

**${templates.host}:** ${hostEngagement} ${templates.listenerInvitation}

**${templates.curator}:** ${curatorEngagement} ${templates.journeyStart}
`;
    } else {
      return `
**${templates.host}:** ${hostTransition} ${templates.timeFlies} ${templates.nextQuestion}

**${templates.curator}:** ${curatorTransition} ${exhibition?.next_direction || templates.nextHallTransition} ${templates.nextAmazing}

**${templates.host}:** ${hostEngagement} ${templates.listenerContinue}

**${templates.curator}:** ${curatorEngagement} ${templates.moreStories}
`;
    }
  }

  /**
   * 언어별 템플릿 가져오기
   */
  private getLanguageTemplates(language: LanguageCode) {
    const templates = {
      ko: {
        host: '진행자',
        curator: '큐레이터',
        welcome: '여러분 안녕하세요! 오늘은 정말 특별한 곳,',
        locationIntro: '에 와있는데요. 와...',
        greeting: '안녕하세요, 큐레이터',
        nameIntro: '입니다. 네, 여기가',
        scaleDescription: '이에요...',
        scaleReaction: '면 감이 안 오는데요',
        factIntroduction: '이 넘죠. 그 중에서 전시되는 건',
        storageQuestion: '잠깐, 그럼 나머지는',
        storageExplanation: '수장고에 있죠. 주기적으로 교체하면서...',
        exhibitionEnter: '으로 들어왔습니다. 어?',
        environmentObservation: '근데 여기 조명이 특이한데요',
        exhibitionDescription: '은',
        comparisonQuestion: '면 얼마나 어두운 거예요',
        technicalExplanation: '일반 사무실이 500룩스 정도니까 1/10? 그래서 처음엔',
        artworkSpotting: '근데 벌써 뭔가 반짝이는 게 보이는데요',
        artworkIntroduction: '네, 바로 대표 작품이죠. 이게...',
        timeFlies: '와, 벌써 시간이 이렇게!',
        firstHallTransition: '이제 정말 첫 전시관으로...',
        nextDestination: '로 가보겠습니다. 거기서는...',
        nextPreview: '가 기다리고 있어요',
        listenerInvitation: '청취자분들, 우리 같이 들어가볼까요?',
        journeyStart: '자, 그럼 1500년 전으로 시간여행을 떠나볼까요?',
        nextQuestion: '다음은 어디로...',
        nextHallTransition: '다음 전시관으로 이동하겠습니다',
        nextAmazing: '거기서는 또 다른 놀라운',
        listenerContinue: '청취자분들도 저처럼 흥미진진하시죠? 계속 함께해요!',
        moreStories: '네, 더 놀라운 이야기들이 기다리고 있으니까요',
        defaultExhibition: '전시관'
      },
      en: {
        host: 'Host',
        curator: 'Curator',
        welcome: 'Welcome everyone! Today we\'re at something really special,',
        locationIntro: '. Wow...',
        greeting: 'Hello, I\'m Curator',
        nameIntro: '. Yes, this is',
        scaleDescription: '...',
        scaleReaction: '? I can\'t even imagine that',
        factIntroduction: '. Of those, about',
        storageQuestion: 'Wait, so what about the rest',
        storageExplanation: 'They\'re in storage. We rotate them periodically...',
        exhibitionEnter: '. Wait,',
        environmentObservation: 'the lighting is quite unique here',
        exhibitionDescription: ' is',
        comparisonQuestion: '? How dark is that exactly',
        technicalExplanation: 'A typical office is about 500 lux, so this is 1/10th. It seems dark at first',
        artworkSpotting: 'But I can already see something sparkling over there',
        artworkIntroduction: 'Yes, that\'s our signature piece. This is...',
        timeFlies: 'Wow, time flies!',
        firstHallTransition: 'Now we\'re really heading to the first exhibition hall...',
        nextDestination: '. There we\'ll see...',
        nextPreview: ' waiting for us',
        listenerInvitation: 'Listeners, shall we go in together?',
        journeyStart: 'Let\'s take a journey back 1,500 years.',
        nextQuestion: 'What\'s next...',
        nextHallTransition: 'We\'ll move to the next exhibition hall',
        nextAmazing: '. There we\'ll find even more amazing',
        listenerContinue: 'Are our listeners as excited as I am? Let\'s continue together!',
        moreStories: 'Yes, there are even more incredible stories waiting for us',
        defaultExhibition: 'exhibition hall'
      },
      ja: {
        host: '進行者',
        curator: 'キュレーター',
        welcome: '皆さんこんにちは！今日は本当に特別な場所、',
        locationIntro: 'に来ているのですが。わあ...',
        greeting: 'こんにちは、キュレーターの',
        nameIntro: 'です。はい、ここが',
        scaleDescription: 'です...',
        scaleReaction: 'だと感じが掴めないのですが',
        factIntroduction: '点を超えます。その中で展示されているのは',
        storageQuestion: 'ちょっと待ってください、それでは残りは',
        storageExplanation: '収蔵庫にあります。定期的に入れ替えながら...',
        exhibitionEnter: 'に入りました。あれ？',
        environmentObservation: 'でも、ここの照明が特殊ですね',
        exhibitionDescription: 'は',
        comparisonQuestion: 'だとどのくらい暗いのでしょうか',
        technicalExplanation: '一般的なオフィスが500ルクス程度ですから1/10？それで最初は',
        artworkSpotting: 'でも、もうキラキラ光るものが見えますね',
        artworkIntroduction: 'はい、それが代表作品です。これが...',
        timeFlies: 'わあ、もう時間がこんなに！',
        firstHallTransition: 'いよいよ最初の展示室に...',
        nextDestination: 'に行ってみましょう。そこでは...',
        nextPreview: 'が待っています',
        listenerInvitation: 'リスナーの皆さん、一緒に入ってみましょうか？',
        journeyStart: 'さあ、それでは1500年前へのタイムトラベルに出発しましょうか？',
        nextQuestion: '次はどこに...',
        nextHallTransition: '次の展示室に移動します',
        nextAmazing: 'そこではさらに驚くべき',
        listenerContinue: 'リスナーの皆さんも私と同じようにワクワクしていますよね？続けて一緒にいきましょう！',
        moreStories: 'はい、さらに素晴らしい話が待っていますから',
        defaultExhibition: '展示室'
      },
      zh: {
        host: '主持人',
        curator: '策展人',
        welcome: '大家好！今天我们来到了一个非常特别的地方，',
        locationIntro: '。哇...',
        greeting: '您好，我是策展人',
        nameIntro: '。是的，这里是',
        scaleDescription: '...',
        scaleReaction: '我无法想象那有多大',
        factIntroduction: '件藏品。其中展出的约有',
        storageQuestion: '等等，那其余的呢',
        storageExplanation: '它们在库房里。我们定期轮换展出...',
        exhibitionEnter: '。等等，',
        environmentObservation: '这里的照明很特别',
        exhibitionDescription: '是',
        comparisonQuestion: '那到底有多暗',
        technicalExplanation: '普通办公室大约500勒克斯，所以这是1/10。刚开始会觉得暗',
        artworkSpotting: '但我已经能看到那边闪闪发光的东西',
        artworkIntroduction: '是的，那就是我们的代表作品。这个...',
        timeFlies: '哇，时间过得真快！',
        firstHallTransition: '现在我们真的要去第一个展厅了...',
        nextDestination: '。在那里我们会看到...',
        nextPreview: '等着我们',
        listenerInvitation: '听众朋友们，我们一起进去看看吧？',
        journeyStart: '让我们一起穿越到1500年前。',
        nextQuestion: '接下来是什么...',
        nextHallTransition: '我们将前往下一个展厅',
        nextAmazing: '在那里我们会发现更多令人惊叹的',
        listenerContinue: '我们的听众朋友们是不是和我一样兴奋？让我们继续一起探索！',
        moreStories: '是的，还有更多不可思议的故事等着我们',
        defaultExhibition: '展厅'
      },
      es: {
        host: 'Presentador',
        curator: 'Curador',
        welcome: '¡Hola a todos! Hoy estamos en un lugar realmente especial,',
        locationIntro: '. Wow...',
        greeting: 'Hola, soy el curador',
        nameIntro: '. Sí, esto es',
        scaleDescription: '...',
        scaleReaction: '? No puedo ni imaginar eso',
        factIntroduction: ' piezas. De esas, aproximadamente',
        storageQuestion: 'Espera, ¿y el resto',
        storageExplanation: 'Están en almacenamiento. Las rotamos periódicamente...',
        exhibitionEnter: '. Espera,',
        environmentObservation: 'la iluminación aquí es bastante única',
        exhibitionDescription: ' es',
        comparisonQuestion: '? ¿Qué tan oscuro es exactamente',
        technicalExplanation: 'Una oficina típica tiene unos 500 lux, así que esto es 1/10. Parece oscuro al principio',
        artworkSpotting: 'Pero ya puedo ver algo brillando allí',
        artworkIntroduction: 'Sí, esa es nuestra pieza insignia. Esto es...',
        timeFlies: '¡Vaya, cómo vuela el tiempo!',
        firstHallTransition: 'Ahora realmente nos dirigimos a la primera sala de exposición...',
        nextDestination: '. Allí veremos...',
        nextPreview: ' esperándonos',
        listenerInvitation: '¿Oyentes, entramos juntos?',
        journeyStart: 'Hagamos un viaje 1,500 años atrás.',
        nextQuestion: '¿Qué sigue...',
        nextHallTransition: 'Nos moveremos a la siguiente sala de exposición',
        nextAmazing: '. Allí encontraremos aún más increíble',
        listenerContinue: '¿Nuestros oyentes están tan emocionados como yo? ¡Continuemos juntos!',
        moreStories: 'Sí, hay historias aún más increíbles esperándonos',
        defaultExhibition: 'sala de exposición'
      }
    };

    return templates[language] || templates.ko;
  }

  /**
   * 페르소나별 특성 강화 지침 생성
   */
  generatePersonaGuidelines(language: LanguageCode): string {
    const { host, curator } = this.getPersonaPair(language);
    
    return `
## 🎭 페르소나별 특성 강화 지침

### ${host.name} (진행자) 특성
**성격**: ${host.characteristics.personality.join(', ')}
**말투**: ${host.characteristics.speakingStyle.join(', ')}
**전문성**: ${host.characteristics.expertise.join(', ')}

**상황별 반응 패턴**:
- 놀라움: ${host.responses.surprise.join(' / ')}
- 호기심: ${host.responses.curiosity.join(' / ')}
- 설명: ${host.responses.explanation.join(' / ')}
- 전환: ${host.responses.transition.join(' / ')}
- 참여 유도: ${host.responses.engagement.join(' / ')}

### ${curator.name} (큐레이터) 특성  
**성격**: ${curator.characteristics.personality.join(', ')}
**말투**: ${curator.characteristics.speakingStyle.join(', ')}
**전문성**: ${curator.characteristics.expertise.join(', ')}

**상황별 반응 패턴**:
- 놀라움: ${curator.responses.surprise.join(' / ')}
- 호기심: ${curator.responses.curiosity.join(' / ')}
- 설명: ${curator.responses.explanation.join(' / ')}
- 전환: ${curator.responses.transition.join(' / ')}
- 참여 유도: ${curator.responses.engagement.join(' / ')}

## 🔄 자연스러운 대화 패턴
**인터럽션**: ${host.notebookLMPatterns.interruptions.join(' / ')} / ${curator.notebookLMPatterns.interruptions.join(' / ')}
**확인/지지**: ${host.notebookLMPatterns.affirmations.join(' / ')} / ${curator.notebookLMPatterns.affirmations.join(' / ')}
**질문**: ${host.notebookLMPatterns.questions.join(' / ')} / ${curator.notebookLMPatterns.questions.join(' / ')}
`;
  }
}

/**
 * 전역 인스턴스
 */
export const personaPromptIntegrator = new PersonaPromptIntegrator();

export default {
  PersonaPromptIntegrator,
  personaPromptIntegrator
};
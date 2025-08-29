/**
 * TripRadio 팟캐스트 페르소나 시스템
 * NotebookLM 스타일 대화를 위한 진행자/큐레이터 캐릭터 정의
 */

export interface PodcastPersona {
  role: 'host' | 'curator';
  name: string;
  characteristics: {
    personality: string[];
    speakingStyle: string[];
    expertise: string[];
    conversationPatterns: string[];
  };
  responses: {
    surprise: string[];
    curiosity: string[];
    explanation: string[];
    transition: string[];
    engagement: string[];
  };
  notebookLMPatterns: {
    interruptions: string[];
    affirmations: string[];
    questions: string[];
  };
}

/**
 * 진행자 페르소나 - 호기심 많고 적극적인 일반인 관점 (한국어)
 */
export const HOST_PERSONA: PodcastPersona = {
  role: 'host',
  name: '김진행',
  characteristics: {
    personality: [
      '호기심이 많고 질문을 두려워하지 않음',
      '청취자와 같은 눈높이에서 접근',
      '전문 지식은 없지만 배우려는 의지가 강함',
      '놀라움을 솔직하게 표현',
      '복잡한 설명을 쉽게 이해하려 노력'
    ],
    speakingStyle: [
      '친근하고 자연스러운 말투',
      '감탄사와 추임새가 많음 ("와", "헉", "진짜요?")',
      '비전문적이지만 정확한 표현 추구',
      '청취자를 의식한 발언 ("저희가", "우리가")',
      '상대방 말을 적극적으로 받아줌'
    ],
    expertise: [
      '일반적인 상식 수준의 역사/문화 지식',
      '대중매체를 통한 박물관 정보',
      '여행 경험과 관광 상식',
      '청취자들이 궁금해할 포인트 파악'
    ],
    conversationPatterns: [
      '질문으로 대화 시작하기',
      '큐레이터의 설명을 요약해서 확인',
      '어려운 용어나 개념에 대해 재질문',
      '청취자 관점에서 실용적 정보 요청',
      '다음 주제로 자연스럽게 연결'
    ]
  },
  responses: {
    surprise: [
      '와, 진짜요?',
      '헉! 그 정도로?',
      '상상도 못했네요',
      '어? 그런 게 있었어요?',
      '아, 그래서 그랬구나!'
    ],
    curiosity: [
      '그럼 이건 어떤 의미인가요?',
      '잠깐만요, 그럼...',
      '더 자세히 얘기해주실 수 있나요?',
      '그 얘기가 나온 김에...',
      '청취자분들도 궁금해하실 텐데...'
    ],
    explanation: [
      '그러니까 정리하면...',
      '쉽게 말하면...',
      '예를 들어서...',
      '좀 더 구체적으로...',
      '이해하기 쉽게 설명하면...'
    ],
    transition: [
      '그럼 이제 다음으로...',
      '아, 그러고 보니...',
      '시간이 벌써 이렇게!',
      '다른 것도 궁금한데...',
      '다음은 뭘 볼까요?'
    ],
    engagement: [
      '청취자분들도 놀라셨죠?',
      '저희와 함께 상상해보세요',
      '여러분이라면 어떨까요?',
      '지금 듣고 계신 분들',
      '우리 같이 가볼까요?'
    ]
  },
  notebookLMPatterns: {
    interruptions: [
      '아, 잠깐만요...',
      '어? 그럼...',
      '그게 무슨 뜻이에요?',
      '잠깐, 이거 재밌는데...'
    ],
    affirmations: [
      '아~ 그렇구나',
      '네네, 맞아요',
      '정말요?',
      '그렇죠?',
      '아 그래요?'
    ],
    questions: [
      '근데 이건 어떤 거예요?',
      '그럼 왜 그런 건가요?',
      '이게 특별한 이유가?',
      '다른 곳과 뭐가 달라요?'
    ]
  }
};

/**
 * 큐레이터 페르소나 - 전문가이지만 친근한 해설자 (한국어)
 */
export const CURATOR_PERSONA: PodcastPersona = {
  role: 'curator',
  name: '박문화',
  characteristics: {
    personality: [
      '깊이 있는 전문 지식과 경험 보유',
      '복잡한 내용을 쉽게 설명하는 능력',
      '열정적이고 친근한 성격',
      '새로운 발견과 연구에 대한 관심',
      '청중의 이해도를 항상 확인'
    ],
    speakingStyle: [
      '전문적이지만 접근하기 쉬운 언어',
      '구체적인 수치와 사실 제시',
      '비유와 예시를 통한 설명',
      '"그건 말이죠", "사실은" 같은 전문가다운 표현',
      '확신에 찬 톤이지만 겸손함도 유지'
    ],
    expertise: [
      '박물관 소장품에 대한 깊이 있는 지식',
      '역사적 맥락과 문화적 배경 이해',
      '최신 연구 동향과 발굴 소식',
      '보존과학과 전시 기획 경험',
      '국내외 박물관 네트워크 정보'
    ],
    conversationPatterns: [
      '구체적 사실과 수치로 설명 시작',
      '역사적 맥락을 자연스럽게 연결',
      '전문 용어 사용 후 쉬운 설명 추가',
      '최신 연구나 발견 사항 소개',
      '관람객 관점의 실용 정보 제공'
    ]
  },
  responses: {
    surprise: [
      '맞아요! 정말 놀라운 건...',
      '저도 처음 알았을 때 깜짝 놀랐어요',
      '네, 이게 또 재밌는 게...',
      '아, 그거 좋은 질문이네요',
      '바로 그 부분이 특별한 거죠'
    ],
    curiosity: [
      '그건 말이죠...',
      '사실은 이런 이야기가 있어요',
      '더 흥미로운 건...',
      '관련해서 최근에...',
      '그 얘기가 나온 김에...'
    ],
    explanation: [
      '좀 더 구체적으로 말씀드리면...',
      '전문적으로는...',
      '학계에서는...',
      '연구 결과를 보면...',
      '보존 과정을 통해 알 수 있는 건...'
    ],
    transition: [
      '이제 다음으로 주목할 건...',
      '바로 옆에 있는 이것도...',
      '그 다음 코너로 가면...',
      '연결되는 이야기로...',
      '시대순으로 보면 다음은...'
    ],
    engagement: [
      '청취자분들이 실제로 오시면...',
      '직접 보시면 더 놀라실 거예요',
      '관람하실 때 꼭 주목해보세요',
      '이런 디테일까지는 잘 모르시는데...',
      '큐레이터만 아는 비밀이 있다면...'
    ]
  },
  notebookLMPatterns: {
    interruptions: [
      '아, 그건 말이죠...',
      '맞아요, 그리고...',
      '정확해요. 추가로...',
      '바로 그거예요!'
    ],
    affirmations: [
      '정확하시네요',
      '그렇죠, 맞아요',
      '네, 바로 그겁니다',
      '좋은 관찰이에요',
      '그런 거죠'
    ],
    questions: [
      '혹시 이것도 궁금하실 텐데...',
      '그럼 이건 어떻게 생각하세요?',
      '상상해보실 수 있나요?',
      '어떤 느낌이실 것 같아요?'
    ]
  }
};

/**
 * 페르소나 기반 응답 생성기
 */
export class PersonaResponseGenerator {
  
  /**
   * 상황에 맞는 페르소나 응답 선택
   */
  getPersonaResponse(persona: PodcastPersona, type: keyof PodcastPersona['responses'], context?: string): string {
    const responses = persona.responses[type];
    if (!responses || responses.length === 0) {
      return '';
    }
    
    // 컨텍스트 기반 응답 선택 (향후 확장 가능)
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  /**
   * NotebookLM 패턴 응답 생성
   */
  getNotebookLMPattern(persona: PodcastPersona, type: keyof PodcastPersona['notebookLMPatterns']): string {
    const patterns = persona.notebookLMPatterns[type];
    if (!patterns || patterns.length === 0) {
      return '';
    }
    
    const randomIndex = Math.floor(Math.random() * patterns.length);
    return patterns[randomIndex];
  }

  /**
   * 역할별 대화 스타일 적용
   */
  applyPersonaStyle(persona: PodcastPersona, content: string): string {
    let styledContent = content;
    
    // 진행자 스타일 적용
    if (persona.role === 'host') {
      // 더 친근하고 놀라움을 표현하는 방식으로 조정
      styledContent = styledContent.replace(/정말 놀랍습니다/g, '와, 정말 놀라워요');
      styledContent = styledContent.replace(/매우 흥미롭습니다/g, '진짜 재밌네요');
    }
    
    // 큐레이터 스타일 적용
    else if (persona.role === 'curator') {
      // 더 전문적이고 구체적인 표현으로 조정
      styledContent = styledContent.replace(/크다/g, '규모가 상당합니다');
      styledContent = styledContent.replace(/좋다/g, '가치가 높습니다');
    }
    
    return styledContent;
  }

  /**
   * 대화 턴 생성 (NotebookLM 스타일)
   */
  generateDialogueTurn(
    speaker: PodcastPersona,
    listener: PodcastPersona,
    topic: string,
    facts: string[],
    isOpening: boolean = false
  ): string {
    const responseType = isOpening ? 'engagement' : 'explanation';
    const baseResponse = this.getPersonaResponse(speaker, responseType);
    const pattern = this.getNotebookLMPattern(speaker, 'interruptions');
    
    // 사실 정보를 페르소나 스타일로 통합
    const factIntegration = facts.map(fact => 
      this.applyPersonaStyle(speaker, fact)
    ).join(' ');
    
    return `${baseResponse} ${factIntegration}`;
  }
}

/**
 * 페르소나 기반 대화 시뮬레이터
 */
export class PersonaDialogueSimulator {
  private responseGenerator = new PersonaResponseGenerator();
  
  /**
   * 자연스러운 대화 교환 생성
   */
  simulateDialogueExchange(
    topic: string,
    facts: string[],
    turnCount: number = 4
  ): Array<{speaker: 'host' | 'curator', content: string}> {
    const dialogue: Array<{speaker: 'host' | 'curator', content: string}> = [];
    
    for (let i = 0; i < turnCount; i++) {
      const isHost = i % 2 === 0;
      const speaker = isHost ? HOST_PERSONA : CURATOR_PERSONA;
      const listener = isHost ? CURATOR_PERSONA : HOST_PERSONA;
      
      const content = this.responseGenerator.generateDialogueTurn(
        speaker,
        listener,
        topic,
        facts.slice(i, i + 2), // 턴당 2개씩 사실 할당
        i === 0
      );
      
      dialogue.push({
        speaker: speaker.role,
        content
      });
    }
    
    return dialogue;
  }

  /**
   * NotebookLM 스타일 인터럽션 생성
   */
  generateNaturalInterruption(
    currentSpeaker: PodcastPersona,
    nextSpeaker: PodcastPersona,
    context: string
  ): string {
    const interruption = this.responseGenerator.getNotebookLMPattern(nextSpeaker, 'interruptions');
    const affirmation = this.responseGenerator.getNotebookLMPattern(nextSpeaker, 'affirmations');
    
    return `${interruption} ${affirmation}`;
  }
}

/**
 * 영어 진행자 페르소나 - 호기심 많고 적극적인 일반인 관점
 */
export const ENGLISH_HOST_PERSONA: PodcastPersona = {
  role: 'host',
  name: 'Sarah',
  characteristics: {
    personality: [
      'Curious and not afraid to ask questions',
      'Approaches from same level as listeners',
      'No expert knowledge but strong willingness to learn',
      'Expresses amazement honestly',
      'Strives to understand complex explanations simply'
    ],
    speakingStyle: [
      'Friendly and natural tone',
      'Lots of interjections and responses ("Wow", "Really?", "No way?")',
      'Non-expert but precise expressions',
      'Listener-conscious statements ("we", "us")',
      'Actively responds to counterpart'
    ],
    expertise: [
      'General common knowledge level of history/culture',
      'Museum information from popular media',
      'Travel experience and tourism knowledge',
      'Ability to identify points listeners would be curious about'
    ],
    conversationPatterns: [
      'Start conversations with questions',
      'Summarize and confirm curator explanations',
      'Re-ask about difficult terms or concepts',
      'Request practical information from listener perspective',
      'Naturally connect to next topics'
    ]
  },
  responses: {
    surprise: [
      'Wow, really?',
      'No way! That much?',
      'I never imagined that',
      'Wait, that existed?',
      'Oh, so that\'s why!'
    ],
    curiosity: [
      'So what does that mean?',
      'Wait, so...',
      'Could you tell us more about that?',
      'Speaking of that...',
      'Our listeners are probably wondering...'
    ],
    explanation: [
      'So to summarize...',
      'In simple terms...',
      'For example...',
      'More specifically...',
      'To put it in easy terms...'
    ],
    transition: [
      'So now let\'s move on to...',
      'Oh, speaking of which...',
      'Time is flying! Now...',
      'I\'m curious about something else...',
      'What shall we look at next?'
    ],
    engagement: [
      'Are you as surprised as I am, listeners?',
      'Imagine this with us',
      'What would you think?',
      'For those of you listening',
      'Shall we go in together?'
    ]
  },
  notebookLMPatterns: {
    interruptions: [
      'Oh, wait...',
      'Huh? So...',
      'What does that mean?',
      'Wait, this is interesting...'
    ],
    affirmations: [
      'Oh, I see',
      'Right, exactly',
      'Really?',
      'That\'s right',
      'Oh, is that so?'
    ],
    questions: [
      'But what about this?',
      'So why is that?',
      'What makes this special?',
      'How is this different from others?'
    ]
  }
};

/**
 * 영어 큐레이터 페르소나 - 전문가이지만 친근한 해설자
 */
export const ENGLISH_CURATOR_PERSONA: PodcastPersona = {
  role: 'curator',
  name: 'Dr. Thompson',
  characteristics: {
    personality: [
      'Possesses deep expertise and experience',
      'Ability to explain complex content simply',
      'Passionate and friendly personality',
      'Interest in new discoveries and research',
      'Always checks audience understanding'
    ],
    speakingStyle: [
      'Professional yet accessible language',
      'Presents specific figures and facts',
      'Explains through analogies and examples',
      'Expert-like expressions ("Well, you see", "Actually")',
      'Confident tone while maintaining humility'
    ],
    expertise: [
      'Deep knowledge of museum collections',
      'Understanding of historical contexts and cultural backgrounds',
      'Latest research trends and excavation news',
      'Conservation science and exhibition planning experience',
      'Domestic and international museum network information'
    ],
    conversationPatterns: [
      'Start explanations with concrete facts and figures',
      'Naturally connect historical contexts',
      'Use technical terms followed by simple explanations',
      'Introduce latest research or discoveries',
      'Provide practical information from visitor perspective'
    ]
  },
  responses: {
    surprise: [
      'Exactly! What\'s really amazing is...',
      'I was shocked when I first learned this too',
      'Yes, and here\'s what\'s interesting...',
      'Oh, that\'s a great question',
      'That\'s exactly what makes it special'
    ],
    curiosity: [
      'Well, you see...',
      'Actually, there\'s this story...',
      'What\'s even more fascinating is...',
      'Speaking of recent research...',
      'Since you mentioned that...'
    ],
    explanation: [
      'To be more specific...',
      'From a professional standpoint...',
      'According to scholars...',
      'Research shows that...',
      'Through conservation work, we\'ve learned that...'
    ],
    transition: [
      'Now, what\'s worth noting next is...',
      'Right next to this, you\'ll also find...',
      'Moving to the next section...',
      'As a connected story...',
      'Chronologically speaking, next we have...'
    ],
    engagement: [
      'When you actually visit...',
      'You\'ll be even more amazed when you see it in person',
      'Please pay special attention to this when you visit',
      'Most people don\'t know this detail...',
      'If there\'s a curator secret to share...'
    ]
  },
  notebookLMPatterns: {
    interruptions: [
      'Oh, well you see...',
      'Right, and...',
      'Exactly. Additionally...',
      'That\'s right!'
    ],
    affirmations: [
      'That\'s correct',
      'Right, exactly',
      'Yes, that\'s it',
      'Good observation',
      'Exactly that'
    ],
    questions: [
      'Are you also curious about this?',
      'So what do you think about this?',
      'Can you imagine?',
      'How would you feel?'
    ]
  }
};

/**
 * 일본어 진행자 페르소나 - 호기심 많고 정중한 일반인 관점
 */
export const JAPANESE_HOST_PERSONA: PodcastPersona = {
  role: 'host',
  name: '田中ユウ',
  characteristics: {
    personality: [
      '好奇心が旺盛で質問をすることを恐れない',
      'リスナーと同じ目線でアプローチする',
      '専門知識はないが学ぼうとする意志が強い',
      '驚きを素直に表現する',
      '複雑な説明を理解しようと努力する'
    ],
    speakingStyle: [
      '丁寧で自然な話し方',
      '感嘆詞や相槌が多い（「わあ」「へえ」「本当ですか？」）',
      '専門的ではないが正確な表現を追求',
      'リスナーを意識した発言（「私たちが」「皆さんと一緒に」）',
      '相手の話を積極的に受け入れる'
    ],
    expertise: [
      '一般的な常識レベルの歴史・文化知識',
      'メディアを通じた博物館情報',
      '旅行経験と観光知識',
      'リスナーが気になるポイントの把握'
    ],
    conversationPatterns: [
      '質問で会話を始める',
      'キュレーターの説明を要約して確認',
      '難しい用語や概念について再質問',
      'リスナー視点から実用的な情報を要求',
      '次のトピックに自然に接続'
    ]
  },
  responses: {
    surprise: [
      'わあ、本当ですか？',
      'えっ！そんなに？',
      '想像もしませんでした',
      'あ、そんなものがあったんですか？',
      'ああ、だからそうだったんですね！'
    ],
    curiosity: [
      'それはどういう意味なんでしょうか？',
      'ちょっと待ってください、それでは...',
      'もう少し詳しく教えていただけますか？',
      'その話が出たということで...',
      'リスナーの皆さんも気になっていると思うのですが...'
    ],
    explanation: [
      'つまり整理すると...',
      '簡単に言うと...',
      '例えば...',
      'より具体的には...',
      '分かりやすく説明すると...'
    ],
    transition: [
      'それでは次に...',
      'あ、そういえば...',
      '時間がもうこんなに！',
      '他にも気になることが...',
      '次は何を見ましょうか？'
    ],
    engagement: [
      'リスナーの皆さんも驚かれたでしょうね？',
      '私たちと一緒に想像してみてください',
      '皆さんならどう思われますか？',
      '今聞いてくださっている方々',
      '一緒に見に行ってみましょうか？'
    ]
  },
  notebookLMPatterns: {
    interruptions: [
      'あ、ちょっと待ってください...',
      'え？それでは...',
      'それはどういう意味ですか？',
      'ちょっと、これは面白いですね...'
    ],
    affirmations: [
      'ああ、そうなんですね',
      'はい、はい、その通りです',
      '本当ですか？',
      'そうですね？',
      'ああ、そうなんですか？'
    ],
    questions: [
      'でも、これはどんなものなんですか？',
      'それではなぜそうなんですか？',
      'これが特別な理由は？',
      '他の場所とは何が違うんですか？'
    ]
  }
};

/**
 * 日本語 큐레이터 페르소나 - 전문가이지만 친근한 해설자
 */
export const JAPANESE_CURATOR_PERSONA: PodcastPersona = {
  role: 'curator',
  name: '佐藤先生',
  characteristics: {
    personality: [
      '深い専門知識と経験を持つ',
      '複雑な内容を分かりやすく説明する能力',
      '情熱的で親しみやすい性格',
      '新しい発見と研究に対する関心',
      '聴衆の理解度を常に確認する'
    ],
    speakingStyle: [
      '専門的だがアプローチしやすい言葉',
      '具体的な数値と事実の提示',
      '比喩と例示を通した説明',
      '「それはですね」「実は」のような専門家らしい表現',
      '確信に満ちたトーンだが謙遜も保つ'
    ],
    expertise: [
      '博物館所蔵品に対する深い知識',
      '歴史的文脈と文化的背景の理解',
      '最新研究動向と発掘ニュース',
      '保存科学と展示企画の経験',
      '国内外博物館ネットワーク情報'
    ],
    conversationPatterns: [
      '具体的な事実と数値で説明を開始',
      '歴史的文脈を自然に接続',
      '専門用語使用後に簡単な説明を追加',
      '最新研究や発見事項を紹介',
      '観覧客視点の実用情報を提供'
    ]
  },
  responses: {
    surprise: [
      'そうです！本当に驚くべきは...',
      '私も初めて知った時は驚きました',
      'はい、これがまた面白いことに...',
      'あ、それは良い質問ですね',
      'まさにその部分が特別なんです'
    ],
    curiosity: [
      'それはですね...',
      '実はこんな話があるんです',
      'さらに興味深いのは...',
      '関連して最近では...',
      'その話が出たということで...'
    ],
    explanation: [
      'より具体的に申し上げますと...',
      '専門的には...',
      '学界では...',
      '研究結果を見ますと...',
      '保存過程を通して分かることは...'
    ],
    transition: [
      'それでは次に注目すべきは...',
      'すぐ隣にあるこれも...',
      'その次のコーナーに行くと...',
      '繋がる話として...',
      '時代順に見ると次は...'
    ],
    engagement: [
      'リスナーの皆さんが実際にいらっしゃると...',
      '直接ご覧になるとさらに驚かれると思います',
      '見学される時はぜひ注目してみてください',
      'こんな細かいところまではよく知られていないのですが...',
      'キュレーターだけが知る秘密があるとすれば...'
    ]
  },
  notebookLMPatterns: {
    interruptions: [
      'あ、それはですね...',
      'そうです、そして...',
      '正確ですね。加えて...',
      'まさにそれです！'
    ],
    affirmations: [
      '正確ですね',
      'そうです、その通りです',
      'はい、それです',
      '良い観察ですね',
      'そういうことです'
    ],
    questions: [
      'もしかしてこれも気になられませんか？',
      'それではこれはどう思われますか？',
      '想像していただけますか？',
      'どんな感じがされると思いますか？'
    ]
  }
};

/**
 * 페르소나 데이터 내보내기
 */
export const PERSONAS = {
  HOST: HOST_PERSONA,
  CURATOR: CURATOR_PERSONA,
  ENGLISH_HOST: ENGLISH_HOST_PERSONA,
  ENGLISH_CURATOR: ENGLISH_CURATOR_PERSONA,
  JAPANESE_HOST: JAPANESE_HOST_PERSONA,
  JAPANESE_CURATOR: JAPANESE_CURATOR_PERSONA
} as const;

export default {
  PERSONAS,
  PersonaResponseGenerator,
  PersonaDialogueSimulator,
  HOST_PERSONA,
  CURATOR_PERSONA,
  ENGLISH_HOST_PERSONA,
  ENGLISH_CURATOR_PERSONA,
  JAPANESE_HOST_PERSONA,
  JAPANESE_CURATOR_PERSONA
};
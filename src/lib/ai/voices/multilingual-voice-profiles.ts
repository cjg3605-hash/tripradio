// 다국어 음성 프로필 설정
// TripRadio.AI 지원 5개국어: 한국어, 영어, 일본어, 중국어, 스페인어

export interface VoiceProfile {
  voiceId: string;
  displayName: string;
  gender: 'male' | 'female' | 'neutral';
  characteristics: string[];
  recommendedFor: string[];
  ssmlOptimizations: SSMLOptimization;
}

export interface SSMLOptimization {
  defaultPitch: string;
  defaultRate: string;
  defaultVolume: string;
  pausePatterns: {
    short: string;
    medium: string;
    long: string;
    transition: string;
  };
  emphasisLevels: {
    light: string;
    moderate: string;
    strong: string;
  };
  culturalAdaptations: string[];
}

export interface LanguageVoiceConfig {
  language: string;
  languageCode: string;
  displayName: string;
  primaryVoice: VoiceProfile;
  secondaryVoice: VoiceProfile;
  conversationPatterns: {
    greetings: string[];
    transitions: string[];
    excitement: string[];
    conclusion: string[];
  };
  culturalContext: {
    formalityLevel: 'casual' | 'polite' | 'formal';
    emotionExpression: 'subtle' | 'moderate' | 'expressive';
    pauseStyle: 'quick' | 'natural' | 'thoughtful';
  };
}

// 🌍 5개국어 음성 프로필 정의
export const MULTILINGUAL_VOICE_PROFILES: Record<string, LanguageVoiceConfig> = {
  
  // 🇰🇷 한국어 (Korean)
  'ko-KR': {
    language: 'Korean',
    languageCode: 'ko-KR',
    displayName: '한국어',
    primaryVoice: {
      voiceId: 'ko-KR-Neural2-A',
      displayName: '진행자 (여성, 친근한)',
      gender: 'female',
      characteristics: ['친근한', '활발한', '호기심 많은', '표현력 풍부한'],
      recommendedFor: ['박물관 가이드', '문화 해설', '교육 콘텐츠'],
      ssmlOptimizations: {
        defaultPitch: '+2st',
        defaultRate: '1.05',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.3s"/>',
          medium: '<break time="0.7s"/>',
          long: '<break time="1.2s"/>',
          transition: '<break time="0.8s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          '존댓말 사용 권장',
          '감정 표현 자연스럽게',
          '한국적 정서 반영',
          '겸손한 톤 유지'
        ]
      }
    },
    secondaryVoice: {
      voiceId: 'ko-KR-Neural2-C',
      displayName: '큐레이터 (남성, 차분한)',
      gender: 'male',
      characteristics: ['차분한', '지적인', '신뢰할 수 있는', '깊이 있는'],
      recommendedFor: ['전문 해설', '역사 설명', '학술적 내용'],
      ssmlOptimizations: {
        defaultPitch: '-1st',
        defaultRate: '0.95',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.4s"/>',
          medium: '<break time="0.8s"/>',
          long: '<break time="1.5s"/>',
          transition: '<break time="1.0s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          '정중한 어투 사용',
          '전문적 권위감',
          '차분한 설명',
          '깊이 있는 해석'
        ]
      }
    },
    conversationPatterns: {
      greetings: [
        '안녕하세요, 여러분!',
        '오늘 함께 떠날 여행이 정말 기대됩니다',
        '자, 그럼 시작해볼까요?',
        '흥미진진한 이야기를 준비했어요'
      ],
      transitions: [
        '그런데 말이야',
        '아, 그거 정말 흥미로운 점이야',
        '잠깐, 이것도 재밌는데',
        '그래서 내가 말하고 싶은 건',
        '이거 들으면 정말 놀랄 거야'
      ],
      excitement: [
        '와, 정말 대단하다!',
        '이건 정말 신기하네요',
        '생각만 해도 설레는데요',
        '믿기 어려울 정도로 놀라워요'
      ],
      conclusion: [
        '정말 흥미진진한 여행이었네요',
        '오늘도 많이 배웠어요',
        '다음에 또 만나요',
        '이런 이야기들이 계속 기다리고 있어요'
      ]
    },
    culturalContext: {
      formalityLevel: 'polite',
      emotionExpression: 'moderate',
      pauseStyle: 'natural'
    }
  },

  // 🇺🇸 영어 (English)
  'en-US': {
    language: 'English',
    languageCode: 'en-US',
    displayName: 'English',
    primaryVoice: {
      voiceId: 'en-US-Neural2-H',
      displayName: 'Host (Female, Engaging)',
      gender: 'female',
      characteristics: ['engaging', 'curious', 'warm', 'conversational'],
      recommendedFor: ['museum tours', 'cultural guides', 'educational content'],
      ssmlOptimizations: {
        defaultPitch: '+1st',
        defaultRate: '1.1',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.2s"/>',
          medium: '<break time="0.5s"/>',
          long: '<break time="1.0s"/>',
          transition: '<break time="0.7s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          'Natural conversational flow',
          'Enthusiastic but professional',
          'Clear articulation',
          'Inclusive language'
        ]
      }
    },
    secondaryVoice: {
      voiceId: 'en-US-Neural2-J',
      displayName: 'Curator (Male, Authoritative)',
      gender: 'male',
      characteristics: ['authoritative', 'knowledgeable', 'calm', 'precise'],
      recommendedFor: ['expert commentary', 'historical context', 'detailed explanations'],
      ssmlOptimizations: {
        defaultPitch: 'default',
        defaultRate: '0.95',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.3s"/>',
          medium: '<break time="0.6s"/>',
          long: '<break time="1.2s"/>',
          transition: '<break time="0.9s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          'Professional yet approachable',
          'Clear expertise demonstration',
          'Thoughtful pacing',
          'Academic credibility'
        ]
      }
    },
    conversationPatterns: {
      greetings: [
        'Welcome everyone!',
        "Today's journey is going to be absolutely fascinating",
        "Let's dive right in, shall we?",
        'I have some incredible stories to share with you'
      ],
      transitions: [
        'But here\'s the thing',
        'Oh, that\'s a really interesting point',
        'Wait, this is fascinating too',
        'What I find remarkable is',
        'You\'re going to be amazed by this'
      ],
      excitement: [
        'Wow, that\'s incredible!',
        'This is absolutely mind-blowing',
        'I get excited just thinking about it',
        'It\'s almost unbelievable'
      ],
      conclusion: [
        'What an amazing journey we\'ve had',
        'I hope you learned as much as I did',
        'Until next time',
        'There are so many more stories waiting for us'
      ]
    },
    culturalContext: {
      formalityLevel: 'casual',
      emotionExpression: 'expressive',
      pauseStyle: 'natural'
    }
  },

  // 🇯🇵 일본어 (Japanese)
  'ja-JP': {
    language: 'Japanese',
    languageCode: 'ja-JP',
    displayName: '日本語',
    primaryVoice: {
      voiceId: 'ja-JP-Neural2-B',
      displayName: 'ホスト (女性、親しみやすい)',
      gender: 'female',
      characteristics: ['親しみやすい', '丁寧', '表現豊か', '温かい'],
      recommendedFor: ['博物館ガイド', '文化解説', '教育コンテンツ'],
      ssmlOptimizations: {
        defaultPitch: '+1st',
        defaultRate: '1.0',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.3s"/>',
          medium: '<break time="0.6s"/>',
          long: '<break time="1.1s"/>',
          transition: '<break time="0.8s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          '敬語の適切な使用',
          '控えめな感情表現',
          '丁寧な話し方',
          '相手を思いやる表現'
        ]
      }
    },
    secondaryVoice: {
      voiceId: 'ja-JP-Neural2-C',
      displayName: 'キュレーター (男性、落ち着いた)',
      gender: 'male',
      characteristics: ['落ち着いた', '知識豊富', '信頼できる', '品格のある'],
      recommendedFor: ['専門解説', '歴史説明', '学術的内容'],
      ssmlOptimizations: {
        defaultPitch: 'default',
        defaultRate: '0.9',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.4s"/>',
          medium: '<break time="0.7s"/>',
          long: '<break time="1.3s"/>',
          transition: '<break time="1.0s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          '格調高い話し方',
          '専門的権威',
          '思慮深い説明',
          '伝統的な価値観反映'
        ]
      }
    },
    conversationPatterns: {
      greetings: [
        'こんにちは、皆さん',
        '今日の旅が楽しみですね',
        'それでは、始めましょうか',
        '興味深いお話を用意いたしました'
      ],
      transitions: [
        'ところで',
        'あ、それは本当に興味深い点ですね',
        'ちょっと待ってください、これも面白いです',
        'そこで申し上げたいのは',
        'これを聞いたら驚かれると思います'
      ],
      excitement: [
        'わあ、本当に素晴らしいですね！',
        'これは本当に興味深いです',
        '考えただけでもワクワクします',
        '信じられないほど驚きです'
      ],
      conclusion: [
        '本当に素晴らしい旅でした',
        '今日もたくさん学びました',
        'またお会いしましょう',
        'まだまだ素敵なお話が待っています'
      ]
    },
    culturalContext: {
      formalityLevel: 'polite',
      emotionExpression: 'subtle',
      pauseStyle: 'thoughtful'
    }
  },

  // 🇨🇳 중국어 (Chinese)
  'zh-CN': {
    language: 'Chinese',
    languageCode: 'zh-CN',
    displayName: '中文',
    primaryVoice: {
      voiceId: 'zh-CN-XiaoxiaoNeural',
      displayName: '主持人 (女性，亲切)',
      gender: 'female',
      characteristics: ['亲切', '活泼', '表达丰富', '温暖'],
      recommendedFor: ['博物馆导览', '文化解说', '教育内容'],
      ssmlOptimizations: {
        defaultPitch: '+1st',
        defaultRate: '1.05',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.3s"/>',
          medium: '<break time="0.6s"/>',
          long: '<break time="1.0s"/>',
          transition: '<break time="0.8s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          '适度的情感表达',
          '亲切自然的语调',
          '文化敏感性',
          '尊重传统价值'
        ]
      }
    },
    secondaryVoice: {
      voiceId: 'zh-CN-YunxiNeural',
      displayName: '策展人 (男性，稳重)',
      gender: 'male',
      characteristics: ['稳重', '博学', '可信赖', '有深度'],
      recommendedFor: ['专业解说', '历史讲解', '学术内容'],
      ssmlOptimizations: {
        defaultPitch: 'default',
        defaultRate: '0.95',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.4s"/>',
          medium: '<break time="0.7s"/>',
          long: '<break time="1.2s"/>',
          transition: '<break time="1.0s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          '专业权威性',
          '深思熟虑的解释',
          '文化深度',
          '学者风范'
        ]
      }
    },
    conversationPatterns: {
      greetings: [
        '大家好！',
        '今天的旅程一定会很精彩',
        '那么，我们开始吧',
        '我准备了一些有趣的故事'
      ],
      transitions: [
        '不过话说回来',
        '啊，这真是个有趣的点',
        '等等，这个也很有意思',
        '我想说的是',
        '听了这个你们一定会惊讶'
      ],
      excitement: [
        '哇，真是太棒了！',
        '这真是令人惊叹',
        '光是想想就令人兴奋',
        '简直令人难以置信'
      ],
      conclusion: [
        '这真是一次精彩的旅程',
        '今天学到了很多',
        '我们下次再见',
        '还有更多精彩故事等着我们'
      ]
    },
    culturalContext: {
      formalityLevel: 'polite',
      emotionExpression: 'moderate',
      pauseStyle: 'natural'
    }
  },

  // 🇪🇸 스페인어 (Spanish)
  'es-ES': {
    language: 'Spanish',
    languageCode: 'es-ES',
    displayName: 'Español',
    primaryVoice: {
      voiceId: 'es-ES-ElviraNeural',
      displayName: 'Anfitriona (Femenina, Cercana)',
      gender: 'female',
      characteristics: ['cercana', 'expresiva', 'cálida', 'entusiasta'],
      recommendedFor: ['guías de museos', 'explicaciones culturales', 'contenido educativo'],
      ssmlOptimizations: {
        defaultPitch: '+1st',
        defaultRate: '1.05',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.3s"/>',
          medium: '<break time="0.6s"/>',
          long: '<break time="1.0s"/>',
          transition: '<break time="0.8s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          'Expresividad natural',
          'Calidez en el trato',
          'Fluidez conversacional',
          'Cercanía cultural'
        ]
      }
    },
    secondaryVoice: {
      voiceId: 'es-ES-AlvaroNeural',
      displayName: 'Curador (Masculino, Culto)',
      gender: 'male',
      characteristics: ['culto', 'conocedor', 'confiable', 'reflexivo'],
      recommendedFor: ['explicaciones expertas', 'contexto histórico', 'contenido académico'],
      ssmlOptimizations: {
        defaultPitch: 'default',
        defaultRate: '0.95',
        defaultVolume: 'medium',
        pausePatterns: {
          short: '<break time="0.4s"/>',
          medium: '<break time="0.7s"/>',
          long: '<break time="1.2s"/>',
          transition: '<break time="1.0s"/>'
        },
        emphasisLevels: {
          light: '<emphasis level="reduced">',
          moderate: '<emphasis level="moderate">',
          strong: '<emphasis level="strong">'
        },
        culturalAdaptations: [
          'Autoridad académica',
          'Explicaciones reflexivas',
          'Profundidad cultural',
          'Rigor intelectual'
        ]
      }
    },
    conversationPatterns: {
      greetings: [
        '¡Hola a todos!',
        'El viaje de hoy va a ser fascinante',
        'Bueno, empezamos',
        'He preparado historias muy interesantes'
      ],
      transitions: [
        'Pero bueno',
        'Ah, eso es realmente interesante',
        'Espera, esto también es fascinante',
        'Lo que quiero decir es',
        'Esto os va a sorprender'
      ],
      excitement: [
        '¡Vaya, es increíble!',
        'Esto es realmente asombroso',
        'Solo de pensarlo me emociono',
        'Es casi increíble'
      ],
      conclusion: [
        'Ha sido un viaje realmente fascinante',
        'Hoy hemos aprendido mucho',
        'Hasta la próxima',
        'Hay muchas más historias esperándonos'
      ]
    },
    culturalContext: {
      formalityLevel: 'casual',
      emotionExpression: 'expressive',
      pauseStyle: 'natural'
    }
  }
};

// 🎯 음성 프로필 유틸리티 클래스
export class MultilingualVoiceManager {

  /**
   * 언어별 최적 음성 프로필 가져오기
   */
  static getVoiceConfig(languageCode: string): LanguageVoiceConfig {
    const config = MULTILINGUAL_VOICE_PROFILES[languageCode];
    if (!config) {
      console.warn(`음성 프로필을 찾을 수 없습니다: ${languageCode}. 한국어로 대체합니다.`);
      return MULTILINGUAL_VOICE_PROFILES['ko-KR'];
    }
    return config;
  }

  /**
   * 특정 역할에 맞는 음성 프로필 선택
   */
  static getVoiceForRole(
    languageCode: string, 
    role: 'primary' | 'secondary'
  ): VoiceProfile {
    const config = this.getVoiceConfig(languageCode);
    return role === 'primary' ? config.primaryVoice : config.secondaryVoice;
  }

  /**
   * 언어별 대화 패턴 가져오기
   */
  static getConversationPatterns(languageCode: string): any {
    const config = this.getVoiceConfig(languageCode);
    return config.conversationPatterns;
  }

  /**
   * 언어별 문화적 맥락 가져오기
   */
  static getCulturalContext(languageCode: string): any {
    const config = this.getVoiceConfig(languageCode);
    return config.culturalContext;
  }

  /**
   * SSML 최적화 설정 가져오기
   */
  static getSSMLOptimizations(
    languageCode: string, 
    role: 'primary' | 'secondary'
  ): SSMLOptimization {
    const voice = this.getVoiceForRole(languageCode, role);
    return voice.ssmlOptimizations;
  }

  /**
   * 지원되는 언어 목록
   */
  static getSupportedLanguages(): { code: string; name: string; displayName: string }[] {
    return Object.entries(MULTILINGUAL_VOICE_PROFILES).map(([code, config]) => ({
      code,
      name: config.language,
      displayName: config.displayName
    }));
  }

  /**
   * 언어별 맞춤 SSML 태그 생성
   */
  static generateSSMLForLanguage(
    text: string,
    languageCode: string,
    role: 'primary' | 'secondary',
    emphasisLevel: 'light' | 'moderate' | 'strong' = 'moderate'
  ): string {
    const voice = this.getVoiceForRole(languageCode, role);
    const ssml = voice.ssmlOptimizations;
    
    let ssmlText = `<speak>
      <voice name="${voice.voiceId}">
        <prosody pitch="${ssml.defaultPitch}" rate="${ssml.defaultRate}" volume="${ssml.defaultVolume}">
          ${ssml.emphasisLevels[emphasisLevel]}${text}</emphasis>
        </prosody>
      </voice>
    </speak>`;

    return ssmlText.trim();
  }

  /**
   * 언어별 자연스러운 휴지 추가
   */
  static addNaturalPauses(
    script: string,
    languageCode: string
  ): string {
    const config = this.getVoiceConfig(languageCode);
    const culturalPauseStyle = config.culturalContext.pauseStyle;
    
    let pausedScript = script;
    
    // 문화적 맥락에 따른 휴지 스타일 적용
    const pauseMap = {
      'quick': { sentence: '0.3s', transition: '0.5s' },
      'natural': { sentence: '0.5s', transition: '0.8s' },
      'thoughtful': { sentence: '0.7s', transition: '1.2s' }
    };
    
    const pauses = pauseMap[culturalPauseStyle] || pauseMap.natural;
    
    // 문장 끝 휴지
    pausedScript = pausedScript.replace(/([.!?])/g, `$1<break time="${pauses.sentence}"/>`);
    
    // 화자 전환 휴지
    pausedScript = pausedScript.replace(
      /(\*\*[^*]+\*\*)/g, 
      `<break time="${pauses.transition}"/>$1`
    );
    
    return pausedScript;
  }

  /**
   * 언어별 NotebookLM 스타일 대화 패턴 적용
   */
  static applyNotebookLMPatterns(
    script: string,
    languageCode: string
  ): string {
    const patterns = this.getConversationPatterns(languageCode);
    let enhanced = script;
    
    // 언어별 자연스러운 전환 구문 추가
    patterns.transitions.forEach((transition: string, index: number) => {
      if (index % 3 === 0) { // 일부만 적용하여 자연스럽게
        const regex = new RegExp(`\\b(하지만|그런데|그러나)\\b`, 'g');
        enhanced = enhanced.replace(regex, 
          `<break time="0.5s"/>${transition}<break time="0.3s"/>`
        );
      }
    });
    
    return enhanced;
  }
}

// 언어 감지 헬퍼
export class LanguageDetector {
  
  /**
   * 텍스트에서 언어 감지 (간단한 휴리스틱)
   */
  static detectLanguage(text: string): string {
    // 한글 감지
    if (/[가-힣]/.test(text)) return 'ko-KR';
    
    // 일본어 감지 (히라가나, 카타카나)
    if (/[ひらがなカタカナ]/.test(text)) return 'ja-JP';
    
    // 중국어 감지 (간체/번체)
    if (/[\u4e00-\u9fff]/.test(text)) return 'zh-CN';
    
    // 스페인어 감지 (특수문자)
    if (/[ñáéíóúü¿¡]/.test(text.toLowerCase())) return 'es-ES';
    
    // 기본값은 영어
    return 'en-US';
  }
  
  /**
   * 지원되는 언어인지 확인
   */
  static isSupportedLanguage(languageCode: string): boolean {
    return Object.keys(MULTILINGUAL_VOICE_PROFILES).includes(languageCode);
  }
}

// 내보내기
// 모든 클래스는 이미 위에서 export 되었으므로 여기서는 제거

export default MULTILINGUAL_VOICE_PROFILES;
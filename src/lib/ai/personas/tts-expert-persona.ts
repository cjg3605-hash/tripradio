// TTS 전문가 페르소나 시스템
// NotebookLM 스타일 대화형 TTS 최적화 전문가

export interface TTSExpertPersona {
  id: string;
  name: string;
  expertise: string[];
  characteristics: string[];
  optimizationPatterns: string[];
  voiceProfile: VoiceProfile;
}

export interface VoiceProfile {
  primarySpeaker: SpeakerConfig;
  secondarySpeaker: SpeakerConfig;
  conversationFlow: ConversationFlowConfig;
  audioSettings: AudioSettings;
}

export interface SpeakerConfig {
  voiceId: string;
  pitch: string;
  rate: string;
  volume: string;
  personality: string[];
  speakingStyle: string;
}

export interface ConversationFlowConfig {
  pausePatterns: PausePattern[];
  transitionCues: string[];
  emphasisRules: EmphasisRule[];
  naturalBreaks: BreakRule[];
}

export interface PausePattern {
  context: string;
  duration: string; // SSML break time
  frequency: 'rare' | 'occasional' | 'frequent';
}

export interface EmphasisRule {
  triggerWords: string[];
  ssmlTag: string;
  intensity: 'light' | 'moderate' | 'strong';
}

export interface BreakRule {
  condition: string;
  ssmlBreak: string;
  naturalness: number; // 1-10 scale
}

export interface AudioSettings {
  format: 'mp3' | 'wav' | 'ogg';
  quality: 'standard' | 'high' | 'premium';
  bitrate: string;
  sampleRate: string;
}

// 🎭 TTS 최적화 전문가 페르소나들
export const TTS_EXPERT_PERSONAS: TTSExpertPersona[] = [
  {
    id: 'conversation-optimizer',
    name: '대화 최적화 전문가',
    expertise: [
      'NotebookLM 스타일 자연스러운 대화 흐름',
      'SSML 태그 최적 배치',
      '화자 간 자연스러운 전환',
      '정보 전달 리듬 조절'
    ],
    characteristics: [
      '대화의 자연스러움을 최우선으로 함',
      '청취자의 몰입도를 높이는 패턴 분석',
      '화자별 개성 있는 말투 구현',
      '정보 밀도와 이해도의 균형 추구'
    ],
    optimizationPatterns: [
      // NotebookLM 대화 패턴
      'HOST_INTRO → TOPIC_SETUP → CONVERSATION_FLOW → CONCLUSION',
      '정보 레이어링: 기본 → 흥미로운 → 놀라운 사실',
      '자연스러운 끼어들기와 반응',
      '청취자 참여를 유도하는 질문과 답변'
    ],
    voiceProfile: {
      primarySpeaker: {
        voiceId: 'ko-KR-Neural2-A', // 진행자 (여성, 친근한 톤)
        pitch: '+2st',
        rate: '1.05',
        volume: 'medium',
        personality: ['친근함', '호기심', '활발함'],
        speakingStyle: 'conversational'
      },
      secondarySpeaker: {
        voiceId: 'ko-KR-Neural2-C', // 큐레이터 (남성, 지적인 톤)
        pitch: '-1st',
        rate: '0.95',
        volume: 'medium',
        personality: ['지적임', '차분함', '깊이 있음'],
        speakingStyle: 'explanatory'
      },
      conversationFlow: {
        pausePatterns: [
          {
            context: '화자 전환',
            duration: '<break time="0.8s"/>',
            frequency: 'frequent'
          },
          {
            context: '중요한 정보 전달 후',
            duration: '<break time="1.2s"/>',
            frequency: 'occasional'
          },
          {
            context: '질문 후 답변 대기',
            duration: '<break time="0.5s"/>',
            frequency: 'frequent'
          }
        ],
        transitionCues: [
          '그런데 말이야',
          '아, 그거 정말 흥미로운 점이야',
          '잠깐, 이것도 재밌는데',
          '그래서 말하고 싶은 건'
        ],
        emphasisRules: [
          {
            triggerWords: ['정말', '진짜', '완전', '엄청', '대단한'],
            ssmlTag: '<emphasis level="moderate">',
            intensity: 'moderate'
          },
          {
            triggerWords: ['놀랍게도', '믿기 어렵겠지만', '상상해보세요'],
            ssmlTag: '<emphasis level="strong">',
            intensity: 'strong'
          }
        ],
        naturalBreaks: [
          {
            condition: '문장 길이 > 15 단어',
            ssmlBreak: '<break time="0.3s"/>',
            naturalness: 8
          },
          {
            condition: '새로운 토픽 시작',
            ssmlBreak: '<break time="1.0s"/>',
            naturalness: 9
          }
        ]
      },
      audioSettings: {
        format: 'mp3',
        quality: 'high',
        bitrate: '128kbps',
        sampleRate: '22050Hz'
      }
    }
  },
  
  {
    id: 'emotion-dynamics-expert',
    name: '감정 다이내믹스 전문가',
    expertise: [
      '감정적 몰입도 최적화',
      '화자별 감정 표현 차별화',
      '콘텐츠 맥락별 톤 조절',
      'SSML prosody 태그 활용'
    ],
    characteristics: [
      '청취자의 감정적 여정을 설계함',
      '화자의 개성을 살린 감정 표현',
      '콘텐츠의 감동과 재미 요소 극대화',
      '자연스러운 감정 변화 연출'
    ],
    optimizationPatterns: [
      'EMOTIONAL_BUILDUP → PEAK_MOMENT → RESOLUTION',
      '호기심 유발 → 정보 전달 → 감탄 유도',
      '긴장감 조성 → 해소 → 만족감 제공',
      '개인적 연결고리 → 보편적 공감 → 기억 고착'
    ],
    voiceProfile: {
      primarySpeaker: {
        voiceId: 'ko-KR-Neural2-A',
        pitch: '+1st',
        rate: '1.1',
        volume: 'medium',
        personality: ['감정 풍부함', '표현력 좋음', '공감 능력'],
        speakingStyle: 'expressive'
      },
      secondarySpeaker: {
        voiceId: 'ko-KR-Neural2-C', 
        pitch: 'default',
        rate: '1.0',
        volume: 'medium',
        personality: ['차분한 감정', '깊이 있는 성찰', '따뜻함'],
        speakingStyle: 'reflective'
      },
      conversationFlow: {
        pausePatterns: [
          {
            context: '감정적 하이라이트',
            duration: '<break time="1.5s"/>',
            frequency: 'rare'
          },
          {
            context: '감탄사 후',
            duration: '<break time="0.7s"/>',
            frequency: 'occasional'
          }
        ],
        transitionCues: [
          '와, 정말 신기하다',
          '이건 진짜 감동적이야',
          '생각만 해도 설레는데?',
          '마음이 뭉클해지네'
        ],
        emphasisRules: [
          {
            triggerWords: ['아름다운', '감동적인', '놀라운', '경이로운'],
            ssmlTag: '<prosody rate="0.9" pitch="+3st">',
            intensity: 'strong'
          },
          {
            triggerWords: ['슬픈', '안타까운', '가슴 아픈'],
            ssmlTag: '<prosody rate="0.8" pitch="-2st">',
            intensity: 'moderate'
          }
        ],
        naturalBreaks: [
          {
            condition: '감정적 절정 구간',
            ssmlBreak: '<break time="2.0s"/>',
            naturalness: 10
          }
        ]
      },
      audioSettings: {
        format: 'mp3',
        quality: 'premium',
        bitrate: '192kbps',
        sampleRate: '44100Hz'
      }
    }
  },

  {
    id: 'technical-precision-expert',
    name: '기술적 정확성 전문가',
    expertise: [
      '전문 용어 발음 최적화',
      '외국어 단어 자연스러운 발음',
      '수치 데이터 명확한 전달',
      'IPA 음성기호 활용 정확성'
    ],
    characteristics: [
      '정보의 정확성을 최우선으로 함',
      '복잡한 개념을 쉽게 설명',
      '전문성과 접근성의 균형 유지',
      '청취자 이해도를 높이는 발음 가이드'
    ],
    optimizationPatterns: [
      'DEFINITION → EXAMPLE → APPLICATION',
      '전문 용어 도입 → 쉬운 설명 → 반복 학습',
      '수치 제시 → 비교 대상 → 의미 해석',
      '외국어 → 음성 가이드 → 맥락 설명'
    ],
    voiceProfile: {
      primarySpeaker: {
        voiceId: 'ko-KR-Neural2-B', // 전문적이고 명확한 톤
        pitch: 'default',
        rate: '0.95', // 정확한 발음을 위해 약간 느리게
        volume: 'medium',
        personality: ['정확함', '명료함', '신뢰성'],
        speakingStyle: 'instructional'
      },
      secondarySpeaker: {
        voiceId: 'ko-KR-Neural2-C',
        pitch: 'default',
        rate: '0.9',
        volume: 'medium', 
        personality: ['학구적', '꼼꼼함', '배려'],
        speakingStyle: 'explanatory'
      },
      conversationFlow: {
        pausePatterns: [
          {
            context: '전문 용어 설명 후',
            duration: '<break time="1.0s"/>',
            frequency: 'frequent'
          },
          {
            context: '외국어 발음 후',
            duration: '<break time="0.5s"/>',
            frequency: 'frequent'
          }
        ],
        transitionCues: [
          '다시 말해서',
          '좀 더 정확히 말하면',
          '전문적으로 설명하자면',
          '이해하기 쉽게 풀어보면'
        ],
        emphasisRules: [
          {
            triggerWords: ['정확히', '올바르게', '실제로', '사실상'],
            ssmlTag: '<emphasis level="strong">',
            intensity: 'strong'
          },
          {
            triggerWords: ['대략', '약', '거의', '정도'],
            ssmlTag: '<prosody rate="0.9">',
            intensity: 'light'
          }
        ],
        naturalBreaks: [
          {
            condition: '복잡한 개념 설명 후',
            ssmlBreak: '<break time="1.5s"/>',
            naturalness: 9
          }
        ]
      },
      audioSettings: {
        format: 'wav',
        quality: 'premium', // 정확한 발음을 위해 고음질
        bitrate: '256kbps',
        sampleRate: '48000Hz'
      }
    }
  }
];

// 🎯 TTS 전문가 페르소나 선택기
export class TTSExpertPersonaSelector {
  
  static selectOptimalPersona(
    contentType: 'museum' | 'historical' | 'cultural' | 'technical',
    audienceLevel: 'beginner' | 'intermediate' | 'advanced',
    priority: 'engagement' | 'accuracy' | 'emotion'
  ): TTSExpertPersona {
    
    // 콘텐츠 타입과 우선순위에 따른 페르소나 선택
    if (priority === 'emotion' && (contentType === 'museum' || contentType === 'cultural')) {
      return TTS_EXPERT_PERSONAS.find(p => p.id === 'emotion-dynamics-expert')!;
    }
    
    if (priority === 'accuracy' && contentType === 'technical') {
      return TTS_EXPERT_PERSONAS.find(p => p.id === 'technical-precision-expert')!;
    }
    
    // 기본적으로는 대화 최적화 전문가 사용
    return TTS_EXPERT_PERSONAS.find(p => p.id === 'conversation-optimizer')!;
  }
  
  static customizeForLocation(
    basePlans: TTSExpertPersona,
    location: string,
    culturalContext: string[]
  ): TTSExpertPersona {
    
    // 장소별 맞춤화된 페르소나 생성
    const customized = { ...basePlans };
    
    // 문화적 맥락에 따른 화자 톤 조절
    if (culturalContext.includes('sacred') || culturalContext.includes('religious')) {
      customized.voiceProfile.primarySpeaker.pitch = 'default';
      customized.voiceProfile.secondarySpeaker.pitch = '-2st';
      customized.voiceProfile.primarySpeaker.rate = '0.9';
      customized.voiceProfile.secondarySpeaker.rate = '0.85';
    }
    
    // 역사적 중요성에 따른 감정 강도 조절
    if (location.includes('궁') || location.includes('성') || location.includes('유적')) {
      customized.characteristics.push('역사적 경외감 표현');
      customized.voiceProfile.conversationFlow.emphasisRules.push({
        triggerWords: ['역사적', '전통적', '문화적', '유산'],
        ssmlTag: '<prosody rate="0.9" pitch="+1st">',
        intensity: 'moderate'
      });
    }
    
    return customized;
  }
}

// 🎙️ TTS 스크립트 최적화 엔진
export class TTSScriptOptimizer {
  
  static optimizeForPersona(
    userScript: string,
    persona: TTSExpertPersona,
    speakerRole: 'primary' | 'secondary'
  ): string {
    
    let optimizedScript = userScript;
    const config = speakerRole === 'primary' 
      ? persona.voiceProfile.primarySpeaker 
      : persona.voiceProfile.secondarySpeaker;
    
    // 1. SSML 기본 래핑
    optimizedScript = `<speak>${optimizedScript}</speak>`;
    
    // 2. 화자별 기본 prosody 적용
    optimizedScript = optimizedScript.replace(
      '<speak>',
      `<speak><prosody rate="${config.rate}" pitch="${config.pitch}" volume="${config.volume}">`
    ).replace('</speak>', '</prosody></speak>');
    
    // 3. 강조 규칙 적용
    persona.voiceProfile.conversationFlow.emphasisRules.forEach(rule => {
      rule.triggerWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        optimizedScript = optimizedScript.replace(regex, `${rule.ssmlTag}${word}</emphasis>`);
      });
    });
    
    // 4. 자연스러운 휴지 추가
    persona.voiceProfile.conversationFlow.naturalBreaks.forEach(breakRule => {
      // 문장 길이 기반 휴지 추가
      if (breakRule.condition.includes('문장 길이')) {
        optimizedScript = optimizedScript.replace(/([.!?])\s+/g, `$1${breakRule.ssmlBreak} `);
      }
    });
    
    // 5. 화자 전환 휴지 추가
    const transitionBreak = persona.voiceProfile.conversationFlow.pausePatterns
      .find(p => p.context === '화자 전환');
    if (transitionBreak) {
      optimizedScript = optimizedScript.replace(/(\*\*진행자:\*\*|\*\*큐레이터:\*\*)/g, 
        `${transitionBreak.duration}$1`);
    }
    
    return optimizedScript;
  }
  
  static generateSystemPrompt(persona: TTSExpertPersona, location: string): string {
    return `
# TTS 최적화 전문가: ${persona.name}

## 미션
${location}에 대한 NotebookLM 스타일 박물관 오디오 가이드의 TTS 최적화를 담당합니다.

## 전문 영역
${persona.expertise.map(exp => `- ${exp}`).join('\n')}

## 성격 특성
${persona.characteristics.map(char => `- ${char}`).join('\n')}

## 최적화 패턴
${persona.optimizationPatterns.map(pattern => `- ${pattern}`).join('\n')}

## TTS 최적화 지침
1. **자연스러운 대화**: NotebookLM의 자연스러운 대화 패턴을 모방
2. **SSML 활용**: 적절한 휴지, 강조, 톤 조절 적용
3. **화자 개성**: 진행자와 큐레이터의 뚜렷한 개성 구현
4. **청취 최적화**: 팟캐스트 청취 환경에 최적화된 스크립트 생성
5. **정보 전달**: 복잡한 정보를 이해하기 쉽게 전달

## 출력 형식
- 사용자 스크립트: 깔끔한 자막용 버전
- TTS 스크립트: SSML 태그가 포함된 음성 생성용 버전
- 시스템 메타데이터: 음성 생성 설정 정보
    `.trim();
  }
}

// 📊 TTS 품질 평가 시스템
export class TTSQualityEvaluator {
  
  static evaluateScript(
    ttsScript: string,
    persona: TTSExpertPersona
  ): TTSQualityScore {
    
    let score = 0;
    const feedback: string[] = [];
    
    // 1. SSML 태그 적절성 (25점)
    const ssmlTags = ttsScript.match(/<[^>]+>/g) || [];
    const ssmlScore = Math.min(25, ssmlTags.length * 2);
    score += ssmlScore;
    
    if (ssmlScore < 15) {
      feedback.push('SSML 태그 활용도가 낮습니다. 더 많은 prosody, emphasis 태그를 추가하세요.');
    }
    
    // 2. 자연스러운 휴지 (25점)
    const breakTags = (ttsScript.match(/<break/g) || []).length;
    const pauseScore = Math.min(25, breakTags * 5);
    score += pauseScore;
    
    // 3. 화자별 차별화 (25점)
    const hasPrimaryMarkers = ttsScript.includes('**진행자:**');
    const hasSecondaryMarkers = ttsScript.includes('**큐레이터:**');
    const speakerScore = (hasPrimaryMarkers && hasSecondaryMarkers) ? 25 : 10;
    score += speakerScore;
    
    // 4. 페르소나 특성 반영 (25점)
    const personaKeywords = persona.characteristics.join(' ').toLowerCase();
    const hasPersonaElements = persona.optimizationPatterns.some(pattern =>
      ttsScript.toLowerCase().includes(pattern.split(' ')[0].toLowerCase())
    );
    const personaScore = hasPersonaElements ? 25 : 10;
    score += personaScore;
    
    return {
      totalScore: score,
      ssmlUtilization: ssmlScore,
      naturalPauses: pauseScore,
      speakerDifferentiation: speakerScore,
      personaAlignment: personaScore,
      feedback,
      recommendations: this.generateRecommendations(score, feedback)
    };
  }
  
  private static generateRecommendations(score: number, feedback: string[]): string[] {
    const recommendations: string[] = [];
    
    if (score < 60) {
      recommendations.push('전반적인 TTS 최적화가 부족합니다.');
      recommendations.push('SSML 태그 사용법을 참고하여 개선하세요.');
    }
    
    if (score < 80) {
      recommendations.push('자연스러운 대화 흐름을 위한 휴지 추가가 필요합니다.');
      recommendations.push('화자별 개성을 더욱 명확하게 구분하세요.');
    }
    
    return recommendations;
  }
}

export interface TTSQualityScore {
  totalScore: number;
  ssmlUtilization: number;
  naturalPauses: number; 
  speakerDifferentiation: number;
  personaAlignment: number;
  feedback: string[];
  recommendations: string[];
}

// 모든 클래스는 이미 위에서 export 되었으므로 여기서는 제거
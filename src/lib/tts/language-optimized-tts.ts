// 🌍 언어별 최적화된 TTS 설정 시스템
// 각 언어의 고유한 발음 특성과 최고 품질 음성 모델을 적용

export interface LanguageOptimizedTTSConfig {
  languageCode: string;
  voiceName: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
  speakingRate: number;
  pitch: number;
  volumeGainDb: number;
  effectsProfile?: string[];
  // 언어별 특화 설정
  languageSpecific: {
    naturalPauses: boolean;
    emphasisStyle: 'subtle' | 'moderate' | 'strong';
    intonationPattern: 'flat' | 'varied' | 'expressive';
    culturalAdaptation: boolean;
  };
}

/**
 * 🎯 언어별 최적화된 TTS 설정 데이터베이스
 * Google Cloud TTS Neural2 모델 기반 최고 품질 설정
 */
export const LANGUAGE_OPTIMIZED_TTS_CONFIGS: Record<string, LanguageOptimizedTTSConfig> = {
  // 🇰🇷 한국어 - 서울 표준어 기반 자연스러운 음성
  'ko-KR': {
    languageCode: 'ko-KR',
    voiceName: 'ko-KR-Neural2-C', // 가장 자연스러운 여성 음성
    ssmlGender: 'FEMALE',
    audioEncoding: 'MP3',
    speakingRate: 1.1, // 한국어 표준 속도 (약간 느리게)
    pitch: 0.5, // 부드러운 음조
    volumeGainDb: 1.0,
    effectsProfile: ['headphone-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'moderate',
      intonationPattern: 'varied',
      culturalAdaptation: true
    }
  },

  // 🇺🇸 영어 - 미국 표준 발음 (중성적 비즈니스 톤)
  'en-US': {
    languageCode: 'en-US',
    voiceName: 'en-US-Neural2-J', // 클리어하고 전문적인 남성 음성
    ssmlGender: 'MALE',
    audioEncoding: 'MP3',
    speakingRate: 1.0, // 영어 표준 속도
    pitch: -0.5, // 약간 낮은 음조 (신뢰감)
    volumeGainDb: 0.5,
    effectsProfile: ['medium-bluetooth-speaker-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'moderate',
      intonationPattern: 'expressive',
      culturalAdaptation: true
    }
  },

  // 🇬🇧 영국 영어 - 브리티시 액센트 (교육적 톤)
  'en-GB': {
    languageCode: 'en-GB',
    voiceName: 'en-GB-Neural2-B', // 우아한 영국식 발음 남성 음성
    ssmlGender: 'MALE',
    audioEncoding: 'MP3',
    speakingRate: 0.95, // 영국식으로 약간 느리게
    pitch: 0.0, // 중성적 음조
    volumeGainDb: 0.0,
    effectsProfile: ['large-home-entertainment-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'subtle',
      intonationPattern: 'varied',
      culturalAdaptation: true
    }
  },

  // 🇯🇵 일본어 - 표준 일본어 (정중한 톤)
  'ja-JP': {
    languageCode: 'ja-JP',
    voiceName: 'ja-JP-Neural2-B', // 부드럽고 정중한 여성 음성
    ssmlGender: 'FEMALE',
    audioEncoding: 'MP3',
    speakingRate: 1.05, // 일본어 특성상 약간 빠르게
    pitch: 1.0, // 높고 부드러운 음조
    volumeGainDb: 0.5,
    effectsProfile: ['headphone-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'subtle', // 일본어는 과도한 강조 지양
      intonationPattern: 'varied',
      culturalAdaptation: true
    }
  },

  // 🇨🇳 중국어 간체 - 북경 표준어 (명확한 발음)
  'zh-CN': {
    languageCode: 'zh-CN',
    voiceName: 'zh-CN-Neural2-D', // 명확하고 표준적인 여성 음성
    ssmlGender: 'FEMALE',
    audioEncoding: 'MP3',
    speakingRate: 1.0, // 중국어 표준 속도
    pitch: 0.8, // 성조 언어 특성 반영한 높은 음조
    volumeGainDb: 1.0,
    effectsProfile: ['medium-bluetooth-speaker-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'moderate',
      intonationPattern: 'expressive', // 성조 언어 특성
      culturalAdaptation: true
    }
  },

  // 🇹🇼 중국어 번체 - 대만 표준어
  'zh-TW': {
    languageCode: 'zh-TW',
    voiceName: 'zh-TW-Neural2-C', // 대만 억양 여성 음성
    ssmlGender: 'FEMALE',
    audioEncoding: 'MP3',
    speakingRate: 0.98, // 대만식으로 약간 느리게
    pitch: 1.2, // 대만 특유의 높은 음조
    volumeGainDb: 0.8,
    effectsProfile: ['headphone-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'moderate',
      intonationPattern: 'expressive',
      culturalAdaptation: true
    }
  },

  // 🇪🇸 스페인어 - 이베리아 반도 표준어 (열정적 톤)
  'es-ES': {
    languageCode: 'es-ES',
    voiceName: 'es-ES-Neural2-C', // 따뜻하고 표현력 풍부한 여성 음성
    ssmlGender: 'FEMALE',
    audioEncoding: 'MP3',
    speakingRate: 1.15, // 스페인어 특성상 빠르게
    pitch: 1.5, // 스페인어 특유의 높고 활발한 음조
    volumeGainDb: 1.5,
    effectsProfile: ['large-home-entertainment-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'strong', // 스페인어는 강한 강조
      intonationPattern: 'expressive',
      culturalAdaptation: true
    }
  },

  // 🇲🇽 멕시코 스페인어 - 라틴 아메리카 스페인어
  'es-MX': {
    languageCode: 'es-US',
    voiceName: 'es-US-Neural2-A', // 멕시코 억양 남성 음성
    ssmlGender: 'MALE',
    audioEncoding: 'MP3',
    speakingRate: 1.1, // 멕시코식으로 조금 느리게
    pitch: 0.8, // 낮고 부드러운 음조
    volumeGainDb: 1.0,
    effectsProfile: ['medium-bluetooth-speaker-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'moderate',
      intonationPattern: 'expressive',
      culturalAdaptation: true
    }
  },

  // 🇫🇷 프랑스어 - 파리 표준 프랑스어 (우아한 톤)
  'fr-FR': {
    languageCode: 'fr-FR',
    voiceName: 'fr-FR-Neural2-A', // 우아하고 세련된 여성 음성
    ssmlGender: 'FEMALE',
    audioEncoding: 'MP3',
    speakingRate: 0.95, // 프랑스어 특성상 느리고 우아하게
    pitch: 0.3, // 낮고 부드러운 음조
    volumeGainDb: 0.0,
    effectsProfile: ['headphone-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'subtle', // 프랑스어는 세련된 강조
      intonationPattern: 'varied',
      culturalAdaptation: true
    }
  },

  // 🇩🇪 독일어 - 표준 독일어 (명확하고 정확한 톤)
  'de-DE': {
    languageCode: 'de-DE',
    voiceName: 'de-DE-Neural2-D', // 명확하고 정확한 남성 음성
    ssmlGender: 'MALE',
    audioEncoding: 'MP3',
    speakingRate: 0.9, // 독일어 특성상 느리고 정확하게
    pitch: -0.3, // 낮고 안정적인 음조
    volumeGainDb: 0.5,
    effectsProfile: ['medium-bluetooth-speaker-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'moderate',
      intonationPattern: 'flat', // 독일어는 비교적 평평한 억양
      culturalAdaptation: true
    }
  },

  // 🇮🇹 이탈리아어 - 표준 이탈리아어 (표현력 풍부한 톤)
  'it-IT': {
    languageCode: 'it-IT',
    voiceName: 'it-IT-Neural2-A', // 표현력 풍부한 여성 음성
    ssmlGender: 'FEMALE',
    audioEncoding: 'MP3',
    speakingRate: 1.05, // 이탈리아어 특성상 약간 빠르게
    pitch: 1.2, // 높고 표현력 풍부한 음조
    volumeGainDb: 1.0,
    effectsProfile: ['large-home-entertainment-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'strong', // 이탈리아어는 강한 표현
      intonationPattern: 'expressive',
      culturalAdaptation: true
    }
  },

  // 🇷🇺 러시아어 - 표준 러시아어 (깊이 있는 톤)
  'ru-RU': {
    languageCode: 'ru-RU',
    voiceName: 'ru-RU-Standard-D', // 깊이 있는 남성 음성
    ssmlGender: 'MALE',
    audioEncoding: 'MP3',
    speakingRate: 0.95, // 러시아어 특성상 느리고 깊게
    pitch: -0.8, // 낮고 깊은 음조
    volumeGainDb: 0.0,
    effectsProfile: ['headphone-class-device'],
    languageSpecific: {
      naturalPauses: true,
      emphasisStyle: 'moderate',
      intonationPattern: 'varied',
      culturalAdaptation: true
    }
  }
};

/**
 * 🎯 언어별 최적화된 TTS 설정 선택기
 */
export class LanguageOptimizedTTSSelector {
  
  /**
   * 언어 코드로부터 최적화된 TTS 설정 가져오기
   */
  static getOptimizedConfig(languageCode: string): LanguageOptimizedTTSConfig {
    // 정확한 매치 시도
    let config = LANGUAGE_OPTIMIZED_TTS_CONFIGS[languageCode];
    
    if (config) {
      console.log(`✅ 언어별 최적화 설정 적용: ${languageCode} → ${config.voiceName}`);
      return config;
    }
    
    // 기본 언어 코드로 매치 시도 (예: 'en' → 'en-US')
    const baseLanguage = languageCode.split('-')[0];
    const fallbackKey = Object.keys(LANGUAGE_OPTIMIZED_TTS_CONFIGS).find(key => 
      key.startsWith(baseLanguage)
    );
    
    if (fallbackKey) {
      config = LANGUAGE_OPTIMIZED_TTS_CONFIGS[fallbackKey];
      console.log(`⚠️ 언어별 대체 설정 적용: ${languageCode} → ${fallbackKey} → ${config.voiceName}`);
      return config;
    }
    
    // 최종 대체: 한국어 설정
    console.log(`❌ 지원되지 않는 언어: ${languageCode}, 한국어 설정으로 대체`);
    return LANGUAGE_OPTIMIZED_TTS_CONFIGS['ko-KR'];
  }
  
  /**
   * 지원되는 언어 목록 가져오기
   */
  static getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_OPTIMIZED_TTS_CONFIGS);
  }
  
  /**
   * 언어별 음성 모델 정보 가져오기
   */
  static getVoiceInfo(languageCode: string): {
    voiceName: string;
    gender: string;
    language: string;
    quality: 'Neural2' | 'Standard';
  } {
    const config = this.getOptimizedConfig(languageCode);
    return {
      voiceName: config.voiceName,
      gender: config.ssmlGender,
      language: config.languageCode,
      quality: config.voiceName.includes('Neural2') ? 'Neural2' : 'Standard'
    };
  }
  
  /**
   * 컨텍스트별 최적화 (관광 가이드용)
   */
  static getOptimizedConfigForTourGuide(languageCode: string): LanguageOptimizedTTSConfig {
    const baseConfig = this.getOptimizedConfig(languageCode);
    
    // 관광 가이드용 특화 조정
    return {
      ...baseConfig,
      speakingRate: Math.max(0.8, baseConfig.speakingRate - 0.1), // 약간 느리게
      volumeGainDb: Math.min(3.0, baseConfig.volumeGainDb + 0.5), // 약간 크게
      effectsProfile: ['large-home-entertainment-class-device'], // 명확한 음질
      languageSpecific: {
        ...baseConfig.languageSpecific,
        emphasisStyle: 'moderate', // 적당한 강조
        naturalPauses: true // 자연스러운 쉼
      }
    };
  }
  
  /**
   * 품질 레벨별 설정 조정
   */
  static adjustConfigForQuality(
    config: LanguageOptimizedTTSConfig, 
    quality: 'standard' | 'high' | 'premium'
  ): LanguageOptimizedTTSConfig {
    const adjustments = {
      standard: { speakingRate: 0, pitch: 0, volumeGainDb: 0 },
      high: { speakingRate: -0.05, pitch: 0.2, volumeGainDb: 0.5 },
      premium: { speakingRate: -0.1, pitch: 0.3, volumeGainDb: 1.0 }
    };
    
    const adjustment = adjustments[quality];
    
    return {
      ...config,
      speakingRate: Math.max(0.5, Math.min(2.0, config.speakingRate + adjustment.speakingRate)),
      pitch: Math.max(-10.0, Math.min(10.0, config.pitch + adjustment.pitch)),
      volumeGainDb: Math.max(-5.0, Math.min(5.0, config.volumeGainDb + adjustment.volumeGainDb)),
      audioEncoding: quality === 'premium' ? 'LINEAR16' : 'MP3'
    };
  }
}

/**
 * 🔄 언어별 최적화된 TTS 설정을 위한 유틸리티 함수들
 */
export const LanguageOptimizedTTSUtils = {
  
  /**
   * 언어 코드 정규화 (다양한 형식 지원)
   */
  normalizeLanguageCode: (languageCode: string): string => {
    const normalized = languageCode.toLowerCase().trim();
    
    // 일반적인 매핑
    const mappings: Record<string, string> = {
      'ko': 'ko-KR',
      'korean': 'ko-KR',
      'en': 'en-US',
      'english': 'en-US',
      'ja': 'ja-JP',
      'japanese': 'ja-JP',
      'zh': 'zh-CN',
      'chinese': 'zh-CN',
      'zh-hans': 'zh-CN',
      'zh-hant': 'zh-TW',
      'es': 'es-ES',
      'spanish': 'es-ES',
      'fr': 'fr-FR',
      'french': 'fr-FR',
      'de': 'de-DE',
      'german': 'de-DE',
      'it': 'it-IT',
      'italian': 'it-IT',
      'ru': 'ru-RU',
      'russian': 'ru-RU'
    };
    
    return mappings[normalized] || normalized;
  },
  
  /**
   * 언어별 문화적 적응 텍스트 전처리
   */
  preprocessTextForLanguage: (text: string, languageCode: string): string => {
    const config = LanguageOptimizedTTSSelector.getOptimizedConfig(languageCode);
    
    if (!config.languageSpecific.culturalAdaptation) {
      return text;
    }
    
    let processedText = text;
    
    // 언어별 특화 전처리
    switch (config.languageCode) {
      case 'ko-KR':
        // 한국어: 자연스러운 쉼표 추가
        processedText = processedText.replace(/([.!?])\s*([가-힣])/g, '$1 $2');
        break;
        
      case 'ja-JP':
        // 일본어: 정중한 표현 강화
        processedText = processedText.replace(/です\s*([。！？])/g, 'です$1');
        break;
        
      case 'en-US':
      case 'en-GB':
        // 영어: 자연스러운 연결어 추가
        processedText = processedText.replace(/\.\s+([A-Z])/g, '. $1');
        break;
        
      case 'zh-CN':
      case 'zh-TW':
        // 중국어: 성조 표시 개선
        processedText = processedText.replace(/([。！？])\s*([一-龯])/g, '$1$2');
        break;
        
      case 'es-ES':
      case 'es-MX':
        // 스페인어: 감탄 표현 강화
        processedText = processedText.replace(/([.!?])\s*([A-ZÁÉÍÓÚÑ])/g, '$1 $2');
        break;
    }
    
    return processedText;
  },
  
  /**
   * 디버깅용 설정 정보 출력
   */
  logConfigInfo: (languageCode: string): void => {
    const config = LanguageOptimizedTTSSelector.getOptimizedConfig(languageCode);
    console.log('🎯 언어별 TTS 설정 정보:', {
      languageCode: config.languageCode,
      voiceName: config.voiceName,
      gender: config.ssmlGender,
      speakingRate: config.speakingRate,
      pitch: config.pitch,
      quality: config.voiceName.includes('Neural2') ? 'Neural2 (최고품질)' : 'Standard',
      culturalAdaptation: config.languageSpecific.culturalAdaptation
    });
  }
};

export default LanguageOptimizedTTSSelector;
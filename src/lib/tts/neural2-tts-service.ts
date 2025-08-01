// 🎙️ Neural2 기반 고품질 TTS 서비스
// Google Cloud TTS Neural2 모델 통합 with 최적화된 워크플로우

interface Neural2TTSConfig {
  name: string;
  languageCode: string;
  ssmlGender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  audioConfig: {
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    speakingRate: number;
    pitch: number;
    volumeGainDb: number;
    sampleRateHertz: number;
    effectsProfileId: string[];
  };
  profile: {
    description: string;
    suitability: string;
    culturalNotes: string;
  };
}

interface TTSRequest {
  text: string;
  language: string;
  chapterId?: string;
  locationName?: string;
  priority?: 'high' | 'normal' | 'low';
}

// 🎯 언어별 Neural2 최적 설정 (이전 분석 결과 기반)
const NEURAL2_CONFIGS: Record<string, Neural2TTSConfig> = {
  'ko': {
    name: 'ko-KR-Neural2-A',
    languageCode: 'ko-KR',
    ssmlGender: 'FEMALE',
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.88,
      pitch: 1.2,
      volumeGainDb: 2.0,
      sampleRateHertz: 24000,
      effectsProfileId: ['headphone-class-device']
    },
    profile: {
      description: '자연스럽고 친근한 여성 음성',
      suitability: '한국 관광객 대상, 문화재 해설 최적화',
      culturalNotes: '존댓말 기반, 격식있되 친근한 어조'
    }
  },
  'en': {
    name: 'en-US-Neural2-F',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.85,
      pitch: -0.5,
      volumeGainDb: 1.8,
      sampleRateHertz: 24000,
      effectsProfileId: ['medium-bluetooth-speaker-class-device']
    },
    profile: {
      description: '명확한 발음의 미국 영어',
      suitability: '국제 관광객 친화적',
      culturalNotes: '중립적이고 전문적인 가이드 톤'
    }
  },
  'zh': {
    name: 'cmn-CN-Neural2-A',
    languageCode: 'cmn-CN',
    ssmlGender: 'FEMALE',
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.82,
      pitch: 2.0,
      volumeGainDb: 1.5,
      sampleRateHertz: 24000,
      effectsProfileId: ['headphone-class-device']
    },
    profile: {
      description: '표준 푸통화 발음',
      suitability: '중국 본토 및 해외 중국어권 관광객',
      culturalNotes: '정중하고 교양있는 해설 스타일'
    }
  },
  'ja': {
    name: 'ja-JP-Neural2-B',
    languageCode: 'ja-JP',
    ssmlGender: 'FEMALE',
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.80,
      pitch: 3.0,
      volumeGainDb: 1.2,
      sampleRateHertz: 24000,
      effectsProfileId: ['headphone-class-device']
    },
    profile: {
      description: '정중하고 우아한 표준 일본어',
      suitability: '일본 관광객, 문화적 예의 중시',
      culturalNotes: '케이고(경어) 기반, 정중한 안내 톤'
    }
  },
  'es': {
    name: 'es-ES-Neural2-A',
    languageCode: 'es-ES',
    ssmlGender: 'FEMALE',
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.90,
      pitch: 1.5,
      volumeGainDb: 2.2,
      sampleRateHertz: 24000,
      effectsProfileId: ['medium-bluetooth-speaker-class-device']
    },
    profile: {
      description: '명확한 이베리아 스페인어',
      suitability: '스페인 및 라틴아메리카 관광객',
      culturalNotes: '친근하되 품격있는 안내 스타일'
    }
  }
};

// 🔄 대체 모델 (Neural2 사용 불가시)
const FALLBACK_CONFIGS: Record<string, string> = {
  'ko': 'ko-KR-Wavenet-A',
  'en': 'en-US-Wavenet-F',
  'zh': 'cmn-CN-Wavenet-A',
  'ja': 'ja-JP-Wavenet-A',
  'es': 'es-ES-Wavenet-A'
};

export class Neural2TTSService {
  private static instance: Neural2TTSService;
  private requestQueue: TTSRequest[] = [];
  private isProcessing = false;
  private cache = new Map<string, string>(); // URL 캐시
  
  static getInstance(): Neural2TTSService {
    if (!Neural2TTSService.instance) {
      Neural2TTSService.instance = new Neural2TTSService();
    }
    return Neural2TTSService.instance;
  }

  // 🎙️ 메인 TTS 생성 메서드
  async generateAudio(request: TTSRequest): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: string;
    cached?: boolean;
  }> {
    const cacheKey = this.getCacheKey(request);
    
    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      return {
        success: true,
        audioUrl: this.cache.get(cacheKey)!,
        cached: true
      };
    }

    try {
      const config = this.getOptimalConfig(request.language);
      const ssmlText = this.prepareSSML(request.text, request.language);
      
      const response = await fetch('/api/tts/neural2-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { ssml: ssmlText },
          voice: {
            languageCode: config.languageCode,
            name: config.name,
            ssmlGender: config.ssmlGender
          },
          audioConfig: config.audioConfig,
          metadata: {
            chapterId: request.chapterId,
            locationName: request.locationName,
            language: request.language
          }
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API 오류: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.audioUrl) {
        // 캐시 저장
        this.cache.set(cacheKey, result.audioUrl);
        
        return {
          success: true,
          audioUrl: result.audioUrl,
          cached: false
        };
      } else {
        throw new Error(result.error || 'TTS 생성 실패');
      }
      
    } catch (error) {
      console.error('Neural2 TTS 생성 오류:', error);
      
      // 🔄 폴백: 브라우저 내장 TTS
      return this.generateFallbackAudio(request);
    }
  }

  // 🎯 최적 설정 선택
  private getOptimalConfig(language: string): Neural2TTSConfig {
    const config = NEURAL2_CONFIGS[language];
    if (!config) {
      console.warn(`지원하지 않는 언어: ${language}, 한국어로 대체`);
      return NEURAL2_CONFIGS['ko'];
    }
    return config;
  }

  // 📝 SSML 전처리
  private prepareSSML(text: string, language: string): string {
    // 기본 텍스트 정리
    let cleanText = text
      .replace(/➡️\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\n\s*\n/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    // 언어별 SSML 최적화
    switch (language) {
      case 'ko':
        cleanText = this.optimizeKoreanSSML(cleanText);
        break;
      case 'ja':
        cleanText = this.optimizeJapaneseSSML(cleanText);
        break;
      case 'zh':
        cleanText = this.optimizeChineseSSML(cleanText);
        break;
      case 'en':
        cleanText = this.optimizeEnglishSSML(cleanText);
        break;
      case 'es':
        cleanText = this.optimizeSpanishSSML(cleanText);
        break;
    }

    return `<speak>${cleanText}</speak>`;
  }

  // 🇰🇷 한국어 SSML 최적화
  private optimizeKoreanSSML(text: string): string {
    return text
      .replace(/(\d{4})년/g, '<say-as interpret-as="date" format="y">$1</say-as>년')
      .replace(/(\d+)층/g, '<say-as interpret-as="ordinal">$1</say-as>층')
      .replace(/!(.*?)!/g, '<emphasis level="strong">$1</emphasis>')
      .replace(/\.\.\./g, '<break time="0.8s"/>')
      .replace(/\?/g, '<break time="0.5s"/>?');
  }

  // 🇯🇵 일본어 SSML 최적화  
  private optimizeJapaneseSSML(text: string): string {
    return text
      .replace(/です。/g, 'です。<break time="0.6s"/>')
      .replace(/ます。/g, 'ます。<break time="0.6s"/>')
      .replace(/!(.*?)!/g, '<emphasis level="moderate">$1</emphasis>')
      .replace(/\.\.\./g, '<break time="0.8s"/>');
  }

  // 🇨🇳 중국어 SSML 최적화
  private optimizeChineseSSML(text: string): string {
    return text
      .replace(/。/g, '。<break time="0.5s"/>')
      .replace(/！/g, '！<break time="0.6s"/>')
      .replace(/\?\?/g, '<break time="0.4s"/>?')
      .replace(/!(.*?)!/g, '<emphasis level="strong">$1</emphasis>');
  }

  // 🇺🇸 영어 SSML 최적화
  private optimizeEnglishSSML(text: string): string {
    return text
      .replace(/\. /g, '. <break time="0.4s"/>')
      .replace(/! /g, '! <break time="0.5s"/>')
      .replace(/\? /g, '? <break time="0.4s"/>')
      .replace(/!(.*?)!/g, '<emphasis level="strong">$1</emphasis>')
      .replace(/\b(\d{4})\b/g, '<say-as interpret-as="date" format="y">$1</say-as>');
  }

  // 🇪🇸 스페인어 SSML 최적화
  private optimizeSpanishSSML(text: string): string {
    return text
      .replace(/\. /g, '. <break time="0.4s"/>')
      .replace(/¡/g, '¡<break time="0.2s"/>')
      .replace(/!/g, '!<break time="0.5s"/>')
      .replace(/!(.*?)!/g, '<emphasis level="strong">$1</emphasis>');
  }

  // 🔄 폴백 오디오 생성 (브라우저 내장)
  private async generateFallbackAudio(request: TTSRequest): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: string;
    fallback?: boolean;
  }> {
    try {
      // SimpleTTS 사용
      const SimpleTTS = (await import('../tts-simple')).SimpleTTS;
      const simpleTTS = new SimpleTTS();
      
      await simpleTTS.speak({
        text: request.text,
        language: request.language,
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8
      });

      return {
        success: true,
        audioUrl: 'browser-tts', // 브라우저 TTS는 URL 없음
        fallback: true
      };
    } catch (error) {
      return {
        success: false,
        error: `폴백 TTS 실패: ${error}`
      };
    }
  }

  // 🗝️ 캐시 키 생성 (UTF-8 안전)
  private getCacheKey(request: TTSRequest): string {
    const textHash = this.safeBase64Encode(request.text).slice(0, 16);
    return `${request.language}-${textHash}-${request.chapterId || 'general'}`;
  }

  // UTF-8 안전 Base64 인코딩 (브라우저/Node.js 호환)
  private safeBase64Encode(str: string): string {
    try {
      // Node.js 환경
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'utf8').toString('base64');
      }
      // 브라우저 환경 - UTF-8을 안전하게 인코딩
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (error) {
      // 폴백: 단순 해시 생성
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32비트로 변환
      }
      return Math.abs(hash).toString(36);
    }
  }

  // 🧹 캐시 정리
  clearCache(): void {
    this.cache.clear();
  }

  // 📊 캐시 통계
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 🚀 싱글톤 인스턴스 내보내기
export const neural2TTS = Neural2TTSService.getInstance();
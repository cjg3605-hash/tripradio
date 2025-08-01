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
    name: 'ko-KR-Neural2-C',  // Neural2-C는 더 자연스럽고 친근함
    languageCode: 'ko-KR',
    ssmlGender: 'FEMALE',
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.95,      // 조금 더 빠르게 (자연스러운 대화 속도)
      pitch: -0.8,             // 음높이를 낮춰서 부드럽게
      volumeGainDb: 1.5,       // 볼륨을 약간 낮춰서 친근하게
      sampleRateHertz: 24000,
      effectsProfileId: ['small-bluetooth-speaker-class-device']  // 더 자연스러운 음향
    },
    profile: {
      description: '친근하고 따뜻한 여성 음성',
      suitability: '친구 같은 가이드, 편안한 여행 해설',
      culturalNotes: '친근한 존댓말, 대화하는 듯한 자연스러운 어조'
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

// 🔄 대체 모델 (Neural2 사용 불가시) - 친근한 목소리 우선
const FALLBACK_CONFIGS: Record<string, string> = {
  'ko': 'ko-KR-Wavenet-D',    // Wavenet-D는 더 따뜻하고 자연스러운 여성 목소리
  'en': 'en-US-Wavenet-F',
  'zh': 'cmn-CN-Wavenet-A',
  'ja': 'ja-JP-Wavenet-A',
  'es': 'es-ES-Wavenet-A'
};

import { UltraNaturalTTSEngine, type UltraNaturalTTSRequest } from './ultra-natural-tts-engine';

export class Neural2TTSService {
  private static instance: Neural2TTSService;
  private requestQueue: TTSRequest[] = [];
  private isProcessing = false;
  private cache = new Map<string, string>(); // URL 캐시
  private ultraNaturalEngine: UltraNaturalTTSEngine | null = null;
  private ultraNaturalEnabled = true; // 초자연화 엔진 사용 여부
  
  static getInstance(): Neural2TTSService {
    if (!Neural2TTSService.instance) {
      Neural2TTSService.instance = new Neural2TTSService();
    }
    return Neural2TTSService.instance;
  }

  constructor() {
    // 초자연화 엔진 비동기 초기화
    this.initializeUltraNaturalEngine();
  }

  private async initializeUltraNaturalEngine(): Promise<void> {
    try {
      console.log('🧬 초자연화 TTS 엔진 초기화 중...');
      this.ultraNaturalEngine = new UltraNaturalTTSEngine();
      console.log('✅ 100만명 시뮬레이션 기반 초자연화 TTS 준비 완료');
    } catch (error) {
      console.warn('⚠️ 초자연화 엔진 초기화 실패, 일반 모드로 실행:', error);
      this.ultraNaturalEnabled = false;
    }
  }

  // 🎙️ 메인 TTS 생성 메서드 (초자연화 엔진 통합)
  async generateAudio(request: TTSRequest): Promise<{
    success: boolean;
    audioUrl?: string;
    error?: string;
    cached?: boolean;
    naturalness?: {
      humanLikenessPercent: number;
      simulationAccuracy: number;
    };
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

    // 🧬 초자연화 엔진 우선 시도 (한국어만)
    if (this.ultraNaturalEnabled && 
        this.ultraNaturalEngine && 
        request.language === 'ko') {
      
      try {
        console.log('🤖 100만명 시뮬레이션 기반 초자연화 TTS 생성 중...');
        
        const ultraRequest: UltraNaturalTTSRequest = {
          text: request.text,
          context: this.detectContext(request),
          targetAudience: this.analyzeTargetAudience(request),
          qualityLevel: 'ultra' // 기본 울트라 품질
        };
        
        const ultraResult = await this.ultraNaturalEngine.generateUltraNaturalTTS(ultraRequest);
        
        if (ultraResult.success && ultraResult.audioUrl) {
          // 캐시 저장
          this.cache.set(cacheKey, ultraResult.audioUrl);
          
          console.log(`✅ 초자연화 TTS 완료 - 인간다움: ${ultraResult.naturalness.humanLikenessPercent.toFixed(1)}%`);
          
          return {
            success: true,
            audioUrl: ultraResult.audioUrl,
            cached: false,
            naturalness: {
              humanLikenessPercent: ultraResult.naturalness.humanLikenessPercent,
              simulationAccuracy: ultraResult.naturalness.simulationAccuracy
            }
          };
        }
      } catch (ultraError) {
        console.warn('⚠️ 초자연화 TTS 실패, 일반 Neural2로 폴백:', ultraError);
      }
    }

    // 💫 일반 Neural2 TTS (기존 로직)
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

  // 🔍 컨텍스트 자동 감지
  private detectContext(request: TTSRequest): 'business' | 'casual' | 'educational' | 'tour_guide' {
    const text = request.text.toLowerCase();
    
    // 비즈니스 관련 키워드
    if (text.includes('회사') || text.includes('비즈니스') || text.includes('업무') || text.includes('사업')) {
      return 'business';
    }
    
    // 교육 관련 키워드  
    if (text.includes('학습') || text.includes('설명') || text.includes('교육') || text.includes('강의')) {
      return 'educational';
    }
    
    // 관광 가이드 (기본값 - 이 앱의 주 용도)
    if (request.locationName || text.includes('관광') || text.includes('여행') || text.includes('명소')) {
      return 'tour_guide';
    }
    
    return 'casual';
  }
  
  // 👥 대상 청중 분석
  private analyzeTargetAudience(request: TTSRequest): UltraNaturalTTSRequest['targetAudience'] {
    const text = request.text.toLowerCase();
    
    // 연령대 추정 (텍스트 톤 기반)
    let ageGroup: 'young' | 'middle' | 'mature' = 'middle';
    if (text.includes('완전') || text.includes('대박') || text.includes('개') || text.includes('쩔어')) {
      ageGroup = 'young';
    } else if (text.includes('정중') || text.includes('공식') || text.includes('존경')) {
      ageGroup = 'mature';
    }
    
    // 격식성 수준 추정
    let formalityPreference: 'formal' | 'semi_formal' | 'casual' = 'semi_formal';
    if (text.includes('입니다') || text.includes('습니다') || text.includes('하시')) {
      formalityPreference = 'formal';
    } else if (text.includes('해요') || text.includes('이에요') || text.includes('예요')) {
      formalityPreference = 'casual';
    }
    
    return {
      ageGroup,
      formalityPreference,
      educationLevel: 'general' // 기본값
    };
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

  // 📝 SSML 전처리 (친근한 말투로 변환)
  private prepareSSML(text: string, language: string): string {
    // 기본 텍스트 정리
    let cleanText = text
      .replace(/➡️\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\n\s*\n/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    // 한국어 텍스트를 더 친근하게 변환
    if (language === 'ko') {
      cleanText = this.makeKoreanFriendly(cleanText);
    }

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

  // 💬 한국어를 친근한 말투로 변환
  private makeKoreanFriendly(text: string): string {
    return text
      // 딱딱한 표현을 부드럽게
      .replace(/위치해 있습니다/g, '있어요')
      .replace(/건설되었습니다/g, '지어졌어요')
      .replace(/만들어졌습니다/g, '만들어졌어요')
      .replace(/조성되었습니다/g, '만들어졌어요')
      .replace(/설치되었습니다/g, '설치되어 있어요')
      .replace(/보존되고 있습니다/g, '보존되고 있어요')
      .replace(/알려져 있습니다/g, '알려져 있어요')
      .replace(/사용되었습니다/g, '사용되었어요')
      .replace(/기록되어 있습니다/g, '기록되어 있어요')
      
      // 감정을 담은 표현 추가
      .replace(/아름다운/g, '정말 아름다운')
      .replace(/놀라운/g, '정말 놀라운')
      .replace(/멋진/g, '참 멋진')
      .replace(/훌륭한/g, '정말 훌륭한')
      .replace(/인상적인/g, '참 인상적인')
      
      // 자연스러운 연결어 사용
      .replace(/또한/g, '그리고')
      .replace(/따라서/g, '그래서')
      .replace(/그러므로/g, '그래서')
      .replace(/더불어/g, '그리고')
      
      // 친근한 표현으로 변경
      .replace(/확인할 수 있습니다/g, '볼 수 있어요')
      .replace(/관찰할 수 있습니다/g, '살펴볼 수 있어요')
      .replace(/감상할 수 있습니다/g, '감상할 수 있어요')
      .replace(/이용할 수 있습니다/g, '이용할 수 있어요')
      .replace(/방문할 수 있습니다/g, '가볼 수 있어요')
      
      // 흥미로운 표현 추가
      .replace(/특징은/g, '특징은 바로')
      .replace(/중요한 점은/g, '중요한 건')
      .replace(/흥미로운 사실은/g, '재미있는 건')
      
      // 마무리 표현을 부드럽게
      .replace(/이상입니다\./g, '이었어요.')
      .replace(/마무리하겠습니다\./g, '마무리할게요.')
      .replace(/소개해드렸습니다\./g, '소개해드렸어요.')
      
      // 자연스러운 호응 표현
      .replace(/어떠신가요\?/g, '어떠세요?')
      .replace(/어떻게 생각하시나요\?/g, '어떻게 생각하세요?');
  }

  // 🇰🇷 한국어 SSML 최적화 (친근한 말투)
  private optimizeKoreanSSML(text: string): string {
    return text
      // 날짜와 숫자를 자연스럽게
      .replace(/(\d{4})년/g, '<say-as interpret-as="date" format="y">$1</say-as>년')
      .replace(/(\d+)층/g, '<say-as interpret-as="ordinal">$1</say-as>층')
      
      // 친근한 억양과 감정 표현
      .replace(/!(.*?)!/g, '<emphasis level="moderate">$1</emphasis>')
      .replace(/정말/g, '<emphasis level="moderate">정말</emphasis>')
      .replace(/너무/g, '<emphasis level="moderate">너무</emphasis>')
      .replace(/참/g, '<emphasis level="moderate">참</emphasis>')
      
      // 자연스러운 쉼과 호흡
      .replace(/\.\.\./g, '<break time="0.6s"/>')
      .replace(/~$/g, '~<break time="0.4s"/>')
      .replace(/ㅎㅎ/g, '<break time="0.3s"/>ㅎㅎ<break time="0.3s"/>')
      .replace(/아~/g, '<prosody rate="0.9" pitch="+0.5st">아~</prosody>')
      .replace(/오~/g, '<prosody rate="0.9" pitch="+0.5st">오~</prosody>')
      
      // 문장 끝 자연스럽게
      .replace(/입니다\./g, '<prosody rate="0.85">입니다</prosody>.')
      .replace(/습니다\./g, '<prosody rate="0.85">습니다</prosody>.')
      .replace(/해요\./g, '<prosody rate="0.9" pitch="+0.3st">해요</prosody>.')
      .replace(/이에요\./g, '<prosody rate="0.9" pitch="+0.3st">이에요</prosody>.')
      .replace(/예요\./g, '<prosody rate="0.9" pitch="+0.3st">예요</prosody>.')
      
      // 감탄사를 더 자연스럽게
      .replace(/와!/g, '<prosody pitch="+1.0st">와!</prosody><break time="0.3s"/>')
      .replace(/우와!/g, '<prosody pitch="+1.0st">우와!</prosody><break time="0.3s"/>')
      .replace(/어머!/g, '<prosody pitch="+0.8st">어머!</prosody><break time="0.3s"/>')
      
      // 질문을 더 친근하게
      .replace(/\?/g, '<prosody pitch="+0.5st">?</prosody><break time="0.4s"/>')
      
      // 쉼표 뒤 자연스러운 호흡
      .replace(/,\s/g, ',<break time="0.3s"/> ');
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
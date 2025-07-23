// 🎙️ Phase 4: AI 음성 해설 시스템
// 다국어 TTS (Text-to-Speech) 및 음성 컨트롤 서비스

interface TTSOptions {
  text?: string;
  language?: string;
  voice?: string;
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
  personalityTone?: string;
}

interface TTSVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  gender?: 'male' | 'female';
  quality?: 'low' | 'medium' | 'high';
  naturalness?: number; // 0-1
}

interface AudioPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
}

interface PersonalityVoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  preferredGender?: 'male' | 'female';
  emotionalTone?: 'neutral' | 'warm' | 'energetic' | 'calm' | 'professional';
}

/**
 * 🎙️ AI 음성 해설 서비스
 * Phase 4: 성격 기반 다국어 TTS 시스템
 */
export class TTSService {
  
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private playbackCallbacks: { [key: string]: Function[] } = {};
  private playbackState: AudioPlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 1
  };
  
  // 성격별 음성 설정
  private personalityVoiceSettings: Record<string, PersonalityVoiceSettings> = {
    openness: {
      rate: 1.1,
      pitch: 1.2,
      volume: 0.9,
      preferredGender: 'female',
      emotionalTone: 'energetic'
    },
    conscientiousness: {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8,
      preferredGender: 'male',
      emotionalTone: 'professional'
    },
    extraversion: {
      rate: 1.2,
      pitch: 1.3,
      volume: 1.0,
      preferredGender: 'female',
      emotionalTone: 'warm'
    },
    agreeableness: {
      rate: 1.0,
      pitch: 1.1,
      volume: 0.9,
      preferredGender: 'female',
      emotionalTone: 'warm'
    },
    neuroticism: {
      rate: 0.8,
      pitch: 0.9,
      volume: 0.7,
      preferredGender: 'male',
      emotionalTone: 'calm'
    }
  };
  
  constructor() {
    this.initialize();
  }
  
  /**
   * 🚀 TTS 서비스 초기화
   */
  private initialize() {
    if (typeof window === 'undefined') {
      console.warn('⚠️ 서버 환경에서는 TTS를 사용할 수 없습니다');
      return;
    }
    
    if (!('speechSynthesis' in window)) {
      console.error('❌ 브라우저가 Speech Synthesis를 지원하지 않습니다');
      return;
    }
    
    this.synthesis = window.speechSynthesis;
    this.loadAvailableVoices();
    
    // 음성 로딩이 완료되면 재시도
    this.synthesis.addEventListener('voiceschanged', () => {
      this.loadAvailableVoices();
    });
    
    console.log('🎙️ TTS 서비스 초기화 완료');
  }
  
  /**
   * 🔊 사용 가능한 음성 로딩
   */
  private loadAvailableVoices() {
    if (!this.synthesis) return;
    
    this.availableVoices = this.synthesis.getVoices();
    console.log(`🎤 ${this.availableVoices.length}개 음성 로드됨`);
    
    // 언어별 음성 확인
    const languageGroups = this.groupVoicesByLanguage();
    Object.keys(languageGroups).forEach(lang => {
      console.log(`${lang}: ${languageGroups[lang].length}개 음성`);
    });
  }
  
  /**
   * 🎭 성격 기반 음성 해설 재생
   */
  public async speakWithPersonality(
    text: string, 
    options: {
      language?: string;
      userPersonality?: string;
      culturalContext?: string;
      adaptToMood?: boolean;
    } = {}
  ): Promise<void> {
    
    if (!this.synthesis) {
      throw new Error('TTS가 지원되지 않는 브라우저입니다');
    }
    
    const {
      language = 'ko-KR',
      userPersonality = 'agreeableness',
      culturalContext = 'korean',
      adaptToMood = true
    } = options;
    
    console.log(`🎙️ 성격 기반 음성 해설 시작: ${userPersonality} (${language})`);
    
    // 현재 재생 중인 것이 있으면 중지
    this.stop();
    
    // 성격별 음성 설정 적용
    const voiceSettings = this.getPersonalityVoiceSettings(
      userPersonality,
      language,
      culturalContext
    );
    
    // 텍스트 전처리 (성격에 맞게 조정)
    const processedText = this.preprocessTextForPersonality(text, userPersonality);
    
    // 최적 음성 선택
    const selectedVoice = this.selectOptimalVoice(language, voiceSettings.preferredGender);
    
    if (!selectedVoice) {
      throw new Error(`${language} 언어의 음성을 찾을 수 없습니다`);
    }
    
    // 음성 해설 생성 및 재생
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(processedText);
      
      // 음성 설정 적용
      utterance.voice = selectedVoice;
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = language;
      
      // 이벤트 리스너 설정
      utterance.onstart = () => {
        this.playbackState.isPlaying = true;
        this.playbackState.isPaused = false;
        this.triggerCallback('start', { text: processedText, settings: voiceSettings });
        console.log(`🎙️ 음성 재생 시작: ${selectedVoice.name}`);
      };
      
      utterance.onend = () => {
        this.playbackState.isPlaying = false;
        this.playbackState.isPaused = false;
        this.currentUtterance = null;
        this.triggerCallback('end', { completed: true });
        console.log('🎙️ 음성 재생 완료');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('❌ TTS 오류:', event.error);
        this.playbackState.isPlaying = false;
        this.playbackState.isPaused = false;
        this.triggerCallback('error', { error: event.error });
        reject(new Error(`TTS 오류: ${event.error}`));
      };
      
      utterance.onpause = () => {
        this.playbackState.isPaused = true;
        this.triggerCallback('pause', {});
      };
      
      utterance.onresume = () => {
        this.playbackState.isPaused = false;
        this.triggerCallback('resume', {});
      };
      
      utterance.onboundary = (event) => {
        this.playbackState.currentTime = event.elapsedTime;
        this.triggerCallback('progress', { 
          elapsedTime: event.elapsedTime,
          charIndex: event.charIndex,
          name: event.name 
        });
      };
      
      // 재생 시작
      this.currentUtterance = utterance;
      if (this.synthesis) {
        this.synthesis.speak(utterance);
      }
    });
  }
  
  /**
   * 🎵 간단한 텍스트 음성 변환
   */
  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    const {
      language = 'ko-KR',
      voice,
      rate = 1,
      pitch = 1,
      volume = 1
    } = options;
    
    if (!this.synthesis) {
      throw new Error('TTS가 지원되지 않는 브라우저입니다');
    }
    
    // 현재 재생 중인 것 중지
    this.stop();
    
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 음성 설정
      if (voice) {
        const selectedVoice = this.availableVoices.find(v => v.name === voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        utterance.voice = this.selectOptimalVoice(language);
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.lang = language;
      
      utterance.onend = () => {
        this.playbackState.isPlaying = false;
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('❌ TTS 오류:', event.error);
        reject(new Error(`TTS 오류: ${event.error}`));
      };
      
      this.currentUtterance = utterance;
      this.playbackState.isPlaying = true;
      if (this.synthesis) {
        this.synthesis.speak(utterance);
      }
    });
  }
  
  /**
   * ⏸️ 재생 일시정지
   */
  public pause(): boolean {
    if (!this.synthesis || !this.playbackState.isPlaying) {
      return false;
    }
    
    this.synthesis.pause();
    return true;
  }
  
  /**
   * ▶️ 재생 재개
   */
  public resume(): boolean {
    if (!this.synthesis || !this.playbackState.isPaused) {
      return false;
    }
    
    this.synthesis.resume();
    return true;
  }
  
  /**
   * ⏹️ 재생 중지
   */
  public stop(): boolean {
    if (!this.synthesis) {
      return false;
    }
    
    this.synthesis.cancel();
    this.currentUtterance = null;
    this.playbackState = {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1,
      volume: 1
    };
    
    return true;
  }
  
  /**
   * 🔧 성격별 음성 설정 가져오기
   */
  private getPersonalityVoiceSettings(
    personality: string,
    language: string,
    culturalContext: string
  ): PersonalityVoiceSettings {
    
    const baseSettings = this.personalityVoiceSettings[personality] || this.personalityVoiceSettings.agreeableness;
    
    // 언어별 조정
    const languageAdjustments = this.getLanguageAdjustments(language, culturalContext);
    
    return {
      rate: Math.max(0.1, Math.min(10, baseSettings.rate * languageAdjustments.rateMultiplier)),
      pitch: Math.max(0, Math.min(2, baseSettings.pitch * languageAdjustments.pitchMultiplier)),
      volume: Math.max(0, Math.min(1, baseSettings.volume)),
      preferredGender: baseSettings.preferredGender,
      emotionalTone: baseSettings.emotionalTone
    };
  }
  
  /**
   * 🌍 언어별 조정값 반환
   */
  private getLanguageAdjustments(language: string, culturalContext: string) {
    const langCode = language.slice(0, 2);
    
    const adjustments: Record<string, { rateMultiplier: number; pitchMultiplier: number }> = {
      ko: { rateMultiplier: 1.0, pitchMultiplier: 1.0 }, // 한국어 기준
      en: { rateMultiplier: 1.1, pitchMultiplier: 0.95 }, // 영어: 조금 빠르고 낮게
      ja: { rateMultiplier: 0.9, pitchMultiplier: 1.05 }, // 일본어: 조금 느리고 높게
      zh: { rateMultiplier: 0.95, pitchMultiplier: 1.0 }, // 중국어: 조금 느리게
      es: { rateMultiplier: 1.2, pitchMultiplier: 1.1 }  // 스페인어: 빠르고 높게
    };
    
    return adjustments[langCode] || adjustments.ko;
  }
  
  /**
   * 📝 성격별 텍스트 전처리
   */
  private preprocessTextForPersonality(text: string, personality: string): string {
    // 성격에 따른 텍스트 조정 (간단한 예시)
    let processedText = text;
    
    switch (personality) {
      case 'extraversion':
        // 더 활발하고 에너지 넘치는 표현
        processedText = text.replace(/\./g, '!').replace(/입니다/g, '입니다!');
        break;
        
      case 'agreeableness':
        // 부드럽고 친근한 표현
        processedText = text.replace(/보세요/g, '보셔요').replace(/입니다/g, '이에요');
        break;
        
      case 'conscientiousness':
        // 정확하고 체계적인 표현 유지
        processedText = text; // 원본 유지
        break;
        
      case 'neuroticism':
        // 차분하고 안정적인 표현
        processedText = text.replace(/!/g, '.').replace(/빨리/g, '천천히');
        break;
        
      case 'openness':
        // 호기심과 탐험을 유발하는 표현
        processedText = text.replace(/입니다/g, '입니다. 흥미롭게도');
        break;
    }
    
    // 문장 사이에 적절한 휴지 추가
    processedText = processedText.replace(/\. /g, '... ');
    
    return processedText;
  }
  
  /**
   * 🎤 최적 음성 선택
   */
  private selectOptimalVoice(
    language: string, 
    preferredGender?: 'male' | 'female'
  ): SpeechSynthesisVoice | null {
    
    const langCode = language.slice(0, 2);
    
    // 해당 언어의 음성들 필터링
    let candidates = this.availableVoices.filter(voice => 
      voice.lang.startsWith(langCode)
    );
    
    if (candidates.length === 0) {
      // 언어 코드만으로 필터링
      candidates = this.availableVoices.filter(voice => 
        voice.lang.toLowerCase().includes(langCode)
      );
    }
    
    if (candidates.length === 0) {
      console.warn(`⚠️ ${language} 음성을 찾을 수 없음, 기본 음성 사용`);
      return this.availableVoices[0] || null;
    }
    
    // 성별 선호도가 있으면 적용
    if (preferredGender) {
      const genderFiltered = candidates.filter(voice => 
        this.detectVoiceGender(voice) === preferredGender
      );
      
      if (genderFiltered.length > 0) {
        candidates = genderFiltered;
      }
    }
    
    // 품질 기준으로 정렬 (로컬 음성 우선, 이름 기준 품질 추정)
    candidates.sort((a, b) => {
      // 로컬 음성 우선
      if (a.localService !== b.localService) {
        return b.localService ? 1 : -1;
      }
      
      // 기본 음성 우선
      if (a.default !== b.default) {
        return b.default ? 1 : -1;
      }
      
      return 0;
    });
    
    const selectedVoice = candidates[0];
    console.log(`🎤 선택된 음성: ${selectedVoice.name} (${selectedVoice.lang})`);
    
    return selectedVoice;
  }
  
  /**
   * 👤 음성 성별 추정 (이름 기반)
   */
  private detectVoiceGender(voice: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' {
    const name = voice.name.toLowerCase();
    
    // 일반적인 여성 음성 키워드
    const femaleKeywords = ['female', 'woman', 'siri', 'alexa', 'cortana', 'yuna', 'jini', 'jenny', 'aria'];
    // 일반적인 남성 음성 키워드  
    const maleKeywords = ['male', 'man', 'alex', 'daniel', 'david', 'mark', 'paul', 'sam'];
    
    if (femaleKeywords.some(keyword => name.includes(keyword))) {
      return 'female';
    }
    
    if (maleKeywords.some(keyword => name.includes(keyword))) {
      return 'male';
    }
    
    return 'unknown';
  }
  
  /**
   * 📊 언어별 음성 그룹화
   */
  private groupVoicesByLanguage(): Record<string, SpeechSynthesisVoice[]> {
    const groups: Record<string, SpeechSynthesisVoice[]> = {};
    
    this.availableVoices.forEach(voice => {
      const lang = voice.lang.slice(0, 2);
      if (!groups[lang]) {
        groups[lang] = [];
      }
      groups[lang].push(voice);
    });
    
    return groups;
  }
  
  /**
   * 📞 이벤트 콜백 등록
   */
  public on(event: string, callback: Function) {
    if (!this.playbackCallbacks[event]) {
      this.playbackCallbacks[event] = [];
    }
    this.playbackCallbacks[event].push(callback);
  }
  
  /**
   * 🚫 이벤트 콜백 제거
   */
  public off(event: string, callback?: Function) {
    if (!this.playbackCallbacks[event]) return;
    
    if (callback) {
      const index = this.playbackCallbacks[event].indexOf(callback);
      if (index > -1) {
        this.playbackCallbacks[event].splice(index, 1);
      }
    } else {
      this.playbackCallbacks[event] = [];
    }
  }
  
  /**
   * 📣 콜백 실행
   */
  private triggerCallback(event: string, data: any) {
    if (this.playbackCallbacks[event]) {
      this.playbackCallbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ 콜백 실행 오류 (${event}):`, error);
        }
      });
    }
  }
  
  /**
   * 📊 현재 상태 조회
   */
  public getStatus(): {
    isSupported: boolean;
    isPlaying: boolean;
    isPaused: boolean;
    availableVoicesCount: number;
    supportedLanguages: string[];
    playbackState: AudioPlaybackState;
  } {
    return {
      isSupported: !!this.synthesis,
      isPlaying: this.playbackState.isPlaying,
      isPaused: this.playbackState.isPaused,
      availableVoicesCount: this.availableVoices.length,
      supportedLanguages: Object.keys(this.groupVoicesByLanguage()),
      playbackState: { ...this.playbackState }
    };
  }
  
  /**
   * 🎤 사용 가능한 음성 목록 조회
   */
  public getAvailableVoices(language?: string): TTSVoice[] {
    let voices = this.availableVoices;
    
    if (language) {
      const langCode = language.slice(0, 2);
      voices = voices.filter(voice => voice.lang.startsWith(langCode));
    }
    
    return voices.map(voice => ({
      voiceURI: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
      gender: this.detectVoiceGender(voice),
      quality: voice.localService ? 'high' : 'medium',
      naturalness: voice.localService ? 0.9 : 0.7
    }));
  }
  
  /**
   * 🎚️ 재생 속도 조정
   */
  public setPlaybackRate(rate: number): boolean {
    if (!this.currentUtterance) {
      return false;
    }
    
    rate = Math.max(0.1, Math.min(10, rate));
    this.currentUtterance.rate = rate;
    this.playbackState.playbackRate = rate;
    
    return true;
  }
  
  /**
   * 🔊 볼륨 조정
   */
  public setVolume(volume: number): boolean {
    if (!this.currentUtterance) {
      return false;
    }
    
    volume = Math.max(0, Math.min(1, volume));
    this.currentUtterance.volume = volume;
    this.playbackState.volume = volume;
    
    return true;
  }
}

/**
 * 🚀 전역 TTS 서비스 인스턴스
 */
export const ttsService = new TTSService();

/**
 * 🎙️ TTS 편의 함수들
 */
export const AudioGuide = {
  // 성격 기반 음성 해설
  speakWithPersonality: (text: string, personality: string, language: string = 'ko-KR') =>
    ttsService.speakWithPersonality(text, { userPersonality: personality, language }),
  
  // 간단한 음성 변환
  speak: (text: string, language: string = 'ko-KR') =>
    ttsService.speak(text, { language }),
  
  // 재생 제어
  pause: () => ttsService.pause(),
  resume: () => ttsService.resume(),
  stop: () => ttsService.stop(),
  
  // 상태 확인
  isPlaying: () => ttsService.getStatus().isPlaying,
  isSupported: () => ttsService.getStatus().isSupported,
  
  // 이벤트 리스너
  onStart: (callback: Function) => ttsService.on('start', callback),
  onEnd: (callback: Function) => ttsService.on('end', callback),
  onError: (callback: Function) => ttsService.on('error', callback)
};

export default ttsService;
// src/lib/tts-simple.ts
// 간단한 브라우저 내장 TTS 구현
// GCP 없이 Web Speech API 사용

interface TTSOptions {
  text: string;
  language?: string;
  rate?: number; // 기본값 1.2로 변경
  pitch?: number;
  volume?: number;
}

export class SimpleTTS {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  // 언어 코드 매핑
  private getVoiceLanguage(language: string): string {
    const languageMap: Record<string, string> = {
      'ko': 'ko-KR',
      'en': 'en-US',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'es': 'es-ES'
    };
    return languageMap[language] || 'ko-KR';
  }

  // 텍스트 정리 (➡️ 제거 등)
  private cleanText(text: string): string {
    return text
      .replace(/➡️\s*/g, '') // 화살표 제거
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 볼드 마크다운 제거
      .replace(/\*([^*]+)\*/g, '$1') // 이탤릭 마크다운 제거
      .replace(/\n\s*\n/g, '. ') // 빈 줄을 마침표로 변경
      .replace(/\n/g, ' ') // 줄바꿈을 공백으로 변경
      .trim();
  }

  // 사용 가능한 음성 목록 가져오기
  private getAvailableVoice(language: string): SpeechSynthesisVoice | null {
    if (!this.synthesis) return null;

    const voices = this.synthesis.getVoices();
    const targetLang = this.getVoiceLanguage(language);
    
    // 정확한 언어 매치 찾기
    let voice = voices.find(v => v.lang === targetLang);
    
    // 정확한 매치가 없으면 언어 코드로 시작하는 것 찾기
    if (!voice) {
      const langCode = targetLang.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(langCode));
    }
    
    // 그래도 없으면 기본 음성 사용
    if (!voice && voices.length > 0) {
      voice = voices[0];
    }

    return voice || null;
  }

  // TTS 재생 (1.2배속 기본값)
  public async speak(options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('TTS가 지원되지 않는 브라우저입니다.'));
        return;
      }

      // 기존 재생 중지
      this.stop();

      const cleanedText = this.cleanText(options.text);
      
      if (!cleanedText.trim()) {
        reject(new Error('재생할 텍스트가 없습니다.'));
        return;
      }

      this.currentUtterance = new SpeechSynthesisUtterance(cleanedText);
      
      // 음성 설정
      const voice = this.getAvailableVoice(options.language || 'ko');
      if (voice) {
        this.currentUtterance.voice = voice;
      }

      // 옵션 설정 (기본 배속 1.2로 변경)
      this.currentUtterance.rate = options.rate || 1.2; // 1.2배속 기본값
      this.currentUtterance.pitch = options.pitch || 1.0;
      this.currentUtterance.volume = options.volume || 1.0;

      // 이벤트 리스너
      this.currentUtterance.onend = () => {
        console.log('✅ TTS 재생 완료');
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        console.error('❌ TTS 오류:', event.error);
        reject(new Error(`TTS 재생 실패: ${event.error}`));
      };

      this.currentUtterance.onstart = () => {
        console.log('🎵 TTS 재생 시작 (배속:', this.currentUtterance?.rate || 1.2, ')');
      };

      // 재생 시작
      this.synthesis.speak(this.currentUtterance);
    });
  }

  // 재생 중지
  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  // 일시정지
  public pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  // 재개
  public resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  // 재생 상태 확인
  public isPlaying(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  public isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }

  // 배속 설정 메서드 추가
  public setRate(rate: number): void {
    if (this.currentUtterance) {
      this.currentUtterance.rate = rate;
    }
  }

  // 현재 배속 가져오기
  public getRate(): number {
    return this.currentUtterance?.rate || 1.2;
  }
}

// 싱글톤 인스턴스
let ttsInstance: SimpleTTS | null = null;

export const getTTSInstance = (): SimpleTTS => {
  if (!ttsInstance) {
    ttsInstance = new SimpleTTS();
  }
  return ttsInstance;
};

// 호환성 체크
export const isTTSSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};
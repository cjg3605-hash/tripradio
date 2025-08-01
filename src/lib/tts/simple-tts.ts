// 간단하고 안정적인 TTS 시스템
// Web Speech API 사용 (무료, 설정 불필요, 모든 브라우저 지원)

export interface SimpleTTSConfig {
  text: string;
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface SimpleTTSResponse {
  success: boolean;
  error?: string;
}

class SimpleTTSService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return;

    const updateVoices = () => {
      this.voices = this.synthesis!.getVoices();
      console.log('🎵 사용 가능한 음성:', this.voices.length, '개');
    };

    updateVoices();
    this.synthesis.addEventListener('voiceschanged', updateVoices);
  }

  /**
   * 한국어 음성 찾기
   */
  private getKoreanVoice(): SpeechSynthesisVoice | null {
    const koreanVoices = this.voices.filter(voice => 
      voice.lang.includes('ko') || voice.name.includes('Korean')
    );
    
    // 우선순위: Google > 시스템 기본 > 첫 번째
    const preferredVoice = koreanVoices.find(voice => 
      voice.name.includes('Google')
    ) || koreanVoices.find(voice => voice.default) || koreanVoices[0];

    console.log('🎯 선택된 한국어 음성:', preferredVoice?.name || '기본 음성');
    return preferredVoice || null;
  }

  /**
   * 텍스트를 음성으로 변환 (바로 재생)
   */
  async speak(config: SimpleTTSConfig): Promise<SimpleTTSResponse> {
    try {
      if (!this.synthesis) {
        throw new Error('브라우저에서 음성 합성을 지원하지 않습니다.');
      }

      // 기존 음성 중지
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(config.text);
      
      // 한국어 음성 설정
      const koreanVoice = this.getKoreanVoice();
      if (koreanVoice) {
        utterance.voice = koreanVoice;
      }
      
      // 언어 설정
      utterance.lang = config.language || 'ko-KR';
      
      // 음성 옵션 설정
      utterance.rate = config.rate || 1.0;    // 0.1 ~ 10
      utterance.pitch = config.pitch || 1.0;  // 0 ~ 2
      utterance.volume = config.volume || 1.0; // 0 ~ 1

      console.log('🎵 TTS 재생 시작:', {
        text: config.text.substring(0, 50) + '...',
        voice: koreanVoice?.name || '기본',
        rate: utterance.rate,
        pitch: utterance.pitch
      });

      // Promise로 래핑하여 완료 대기
      return new Promise((resolve) => {
        utterance.onstart = () => {
          console.log('▶️ TTS 재생 중...');
        };

        utterance.onend = () => {
          console.log('✅ TTS 재생 완료');
          resolve({ success: true });
        };

        utterance.onerror = (event) => {
          console.error('❌ TTS 재생 오류:', event.error);
          resolve({ 
            success: false, 
            error: `음성 재생 오류: ${event.error}` 
          });
        };

        this.synthesis!.speak(utterance);
      });

    } catch (error) {
      console.error('❌ TTS 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 현재 재생 중인 음성 중지
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      console.log('⏹️ TTS 재생 중지');
    }
  }

  /**
   * TTS 지원 여부 확인
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * 사용 가능한 음성 목록 반환
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}

// 싱글톤 인스턴스
export const simpleTTS = new SimpleTTSService();

// 편의 함수
export async function speakText(
  text: string, 
  options: Omit<SimpleTTSConfig, 'text'> = {}
): Promise<SimpleTTSResponse> {
  return simpleTTS.speak({ text, ...options });
}

export function stopSpeaking(): void {
  simpleTTS.stop();
}
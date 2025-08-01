// 🎙️ 고급 TTS 서비스 - 성격 기반 + Google Cloud TTS 통합
// temp_disabled_components의 성격 기반 기능을 현재 GCS TTS와 통합

// 성격 서비스 임포트 (옵셔널)
// import { personalityService } from '@/lib/personalityService';

interface PersonalityVoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  preferredGender?: 'male' | 'female';
  emotionalTone?: 'neutral' | 'warm' | 'energetic' | 'calm' | 'professional';
}

interface AdvancedTTSOptions {
  text: string;
  language?: string;
  userPersonality?: string;
  culturalContext?: string;
  adaptToMood?: boolean;
  guide_id?: string;
  locationName?: string;
}

/**
 * 🎭 고급 TTS 서비스 - 성격 기반 음성 해설
 */
export class AdvancedTTSService {
  
  // 성격별 음성 설정 (친근한 가이드 톤으로 최적화)
  private personalityVoiceSettings: Record<string, PersonalityVoiceSettings> = {
    openness: {
      rate: 1.05,        // 호기심이 많은 친근한 속도
      pitch: 0.8,        // 부드러운 높이
      volume: 0.85,      // 편안한 볼륨
      preferredGender: 'female',
      emotionalTone: 'warm'  // 따뜻한 톤으로 변경
    },
    conscientiousness: {
      rate: 0.95,        // 차분하지만 자연스러운 속도
      pitch: 0.6,        // 안정감 있는 낮은 톤
      volume: 0.8,
      preferredGender: 'female',  // 여성으로 변경 (더 친근함)
      emotionalTone: 'warm'       // 전문적이면서도 따뜻하게
    },
    extraversion: {
      rate: 1.1,         // 활발하지만 과하지 않게
      pitch: 0.9,        // 밝지만 부드럽게
      volume: 0.9,
      preferredGender: 'female',
      emotionalTone: 'warm'
    },
    agreeableness: {
      rate: 1.0,         // 자연스러운 대화 속도
      pitch: 0.7,        // 부드럽고 따뜻한 톤
      volume: 0.85,
      preferredGender: 'female',
      emotionalTone: 'warm'
    },
    neuroticism: {
      rate: 0.9,         // 차분하고 안정적인 속도
      pitch: 0.5,        // 안정감 주는 낮은 톤
      volume: 0.8,
      preferredGender: 'female',  // 위로가 되는 여성 목소리
      emotionalTone: 'calm'
    }
  };

  /**
   * 🎙️ 성격 기반 TTS 오디오 생성
   */
  public async generatePersonalityTTS(options: AdvancedTTSOptions): Promise<{
    success: boolean;
    audioData?: string;
    mimeType?: string;
    error?: string;
    personalityInfo?: any;
  }> {
    try {
      const {
        text,
        language = 'ko-KR',
        userPersonality,
        culturalContext = 'korean',
        adaptToMood = true,
        guide_id = 'default',
        locationName = 'guide'
      } = options;

      console.log('🎭 성격 기반 TTS 생성 시작:', {
        personality: userPersonality,
        language,
        culturalContext
      });

      // 1. 사용자 성격 분석 (성격이 제공되지 않으면 기본값)
      let detectedPersonality = userPersonality;
      if (!detectedPersonality) {
        try {
          // TODO: 성격 서비스 연동 (현재는 기본값 사용)
          // const personalityData = await personalityService.getPersonalityProfile();
          // detectedPersonality = personalityData.dominantTrait || 'agreeableness';
          detectedPersonality = 'agreeableness'; // 임시 기본값
          console.log('🎭 성격 서비스 미연동, 기본 성격 사용:', detectedPersonality);
        } catch (error) {
          console.log('성격 데이터 없음, 기본값 사용');
          detectedPersonality = 'agreeableness';
        }
      }

      // 2. 성격별 음성 설정 적용
      const voiceSettings = this.getPersonalityVoiceSettings(
        detectedPersonality,
        language,
        culturalContext
      );

      // 3. 텍스트 전처리 (성격에 맞게 조정)
      const processedText = this.preprocessTextForPersonality(text, detectedPersonality);

      // 4. Google Cloud TTS API 호출 (성격 기반 파라미터 적용)
      const response = await fetch('/api/ai/generate-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: processedText,
          guide_id,
          locationName,
          language,
          // 성격 기반 음성 파라미터 추가
          voiceSettings: {
            speakingRate: voiceSettings.rate,
            pitch: this.convertPitchToSemitones(voiceSettings.pitch),
            volumeGainDb: this.convertVolumeToDb(voiceSettings.volume)
          },
          personalityContext: {
            personality: detectedPersonality,
            emotionalTone: voiceSettings.emotionalTone,
            culturalContext
          }
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'TTS 생성 실패');
      }

      return {
        success: true,
        audioData: data.audioData,
        mimeType: data.mimeType,
        personalityInfo: {
          appliedPersonality: detectedPersonality,
          voiceSettings,
          processedText: processedText !== text ? processedText : undefined
        }
      };

    } catch (error) {
      console.error('🚨 성격 기반 TTS 생성 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 🔧 성격별 음성 설정 가져오기
   */
  private getPersonalityVoiceSettings(
    personality: string,
    language: string,
    culturalContext: string
  ): PersonalityVoiceSettings {
    
    const baseSettings = this.personalityVoiceSettings[personality] || 
                        this.personalityVoiceSettings.agreeableness;
    
    // 언어별 조정
    const languageAdjustments = this.getLanguageAdjustments(language, culturalContext);
    
    return {
      rate: Math.max(0.25, Math.min(4.0, baseSettings.rate * languageAdjustments.rateMultiplier)),
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
   * 🎵 피치 값을 Google Cloud TTS 세미톤으로 변환
   */
  private convertPitchToSemitones(pitch: number): number {
    // pitch 1.0 = 0 semitones, 1.1 = +2 semitones, 0.9 = -2 semitones
    return Math.round((pitch - 1.0) * 20);
  }

  /**
   * 🔊 볼륨을 dB로 변환
   */
  private convertVolumeToDb(volume: number): number {
    // volume 1.0 = 0dB, 0.8 = -2dB, 1.2 = +2dB
    return Math.round((volume - 1.0) * 10);
  }
}

/**
 * 🚀 전역 고급 TTS 서비스 인스턴스
 */
export const advancedTTSService = new AdvancedTTSService();

/**
 * 🎙️ 편의 함수들
 */
export const PersonalityTTS = {
  // 성격 기반 음성 해설 생성
  generateAudio: (options: AdvancedTTSOptions) => 
    advancedTTSService.generatePersonalityTTS(options),
  
  // 간단한 성격 기반 TTS
  speak: (text: string, personality?: string, language: string = 'ko-KR') =>
    advancedTTSService.generatePersonalityTTS({
      text,
      userPersonality: personality,
      language
    })
};

export default advancedTTSService;
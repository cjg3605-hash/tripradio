// src/lib/tts/google-cloud-tts.ts
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export interface GoogleCloudTTSConfig {
  text: string;
  languageCode: string;
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  audioEncoding: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  sampleRateHertz?: number;
  effectsProfileId?: string[];
}

export interface GoogleCloudTTSResponse {
  success: boolean;
  audioContent?: string; // base64 encoded
  error?: string;
  processingTime?: number;
}

/**
 * Google Cloud Text-to-Speech 클라이언트
 */
class GoogleCloudTTSService {
  private client: TextToSpeechClient | null = null;
  private isInitialized = false;

  constructor() {
    console.log('🔧 Google Cloud TTS 서비스 초기화 중...');
  }

  /**
   * 클라이언트 초기화 (지연 로딩)
   */
  private async initializeClient(): Promise<boolean> {
    if (this.isInitialized) {
      return this.client !== null;
    }

    try {
      // 환경 변수 확인
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
        console.error('❌ Google Cloud 인증 정보가 설정되지 않음');
        console.error('환경 변수 GOOGLE_CLOUD_PROJECT 및 GOOGLE_APPLICATION_CREDENTIALS 설정 필요');
        this.isInitialized = true;
        return false;
      }

      // 클라이언트 초기화
      this.client = new TextToSpeechClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });

      console.log('✅ Google Cloud TTS 클라이언트 초기화 완료');
      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('❌ Google Cloud TTS 클라이언트 초기화 실패:', error);
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * TTS 음성 생성
   */
  async synthesizeSpeech(config: GoogleCloudTTSConfig): Promise<GoogleCloudTTSResponse> {
    const startTime = Date.now();

    try {
      console.log('🎵 Google Cloud TTS 요청 시작:', {
        textLength: config.text.length,
        voice: config.name,
        language: config.languageCode
      });

      // 클라이언트 초기화 확인
      const isClientReady = await this.initializeClient();
      if (!isClientReady || !this.client) {
        const status = this.getStatus();
        let errorMessage = 'Google Cloud TTS 클라이언트를 초기화할 수 없습니다.\n';
        
        if (!status.hasCredentials) {
          errorMessage += '원인: 환경 변수 GOOGLE_CLOUD_PROJECT 및 GOOGLE_APPLICATION_CREDENTIALS가 설정되지 않았습니다.\n';
          errorMessage += '해결: .env.local 파일에 Google Cloud 프로젝트 정보를 추가하세요.';
        } else {
          errorMessage += '원인: Google Cloud 서비스 계정 키 파일이 잘못되었거나 권한이 부족합니다.';
        }
        
        throw new Error(errorMessage);
      }

      // 요청 구성
      const request = {
        input: { text: config.text },
        voice: {
          languageCode: config.languageCode,
          name: config.name,
          ssmlGender: config.ssmlGender
        },
        audioConfig: {
          audioEncoding: config.audioEncoding,
          speakingRate: config.speakingRate || 1.0,
          pitch: config.pitch || 0.0,
          volumeGainDb: config.volumeGainDb || 0.0,
          sampleRateHertz: config.sampleRateHertz || 24000,
          effectsProfileId: config.effectsProfileId || []
        }
      };

      // TTS 요청 실행
      const [response] = await this.client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('음성 데이터가 생성되지 않았습니다');
      }

      const processingTime = Date.now() - startTime;
      
      console.log('✅ Google Cloud TTS 음성 생성 완료:', {
        processingTime: `${processingTime}ms`,
        audioSize: `${Math.round(response.audioContent.length / 1024)}KB`
      });

      return {
        success: true,
        audioContent: response.audioContent.toString('base64'),
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Google Cloud TTS 생성 실패:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        processingTime
      };
    }
  }

  /**
   * SSML을 사용한 고급 음성 생성
   */
  async synthesizeSpeechSSML(ssml: string, config: Omit<GoogleCloudTTSConfig, 'text'>): Promise<GoogleCloudTTSResponse> {
    const startTime = Date.now();

    try {
      console.log('🎵 Google Cloud TTS SSML 요청 시작:', {
        ssmlLength: ssml.length,
        voice: config.name,
        language: config.languageCode
      });

      // 클라이언트 초기화 확인
      const isClientReady = await this.initializeClient();
      if (!isClientReady || !this.client) {
        const status = this.getStatus();
        let errorMessage = 'Google Cloud TTS SSML 클라이언트를 초기화할 수 없습니다.\n';
        
        if (!status.hasCredentials) {
          errorMessage += '원인: 환경 변수 GOOGLE_CLOUD_PROJECT 및 GOOGLE_APPLICATION_CREDENTIALS가 설정되지 않았습니다.\n';
          errorMessage += '해결: .env.local 파일에 Google Cloud 프로젝트 정보를 추가하세요.';
        } else {
          errorMessage += '원인: Google Cloud 서비스 계정 키 파일이 잘못되었거나 권한이 부족합니다.';
        }
        
        throw new Error(errorMessage);
      }

      // SSML 요청 구성
      const request = {
        input: { ssml: ssml },
        voice: {
          languageCode: config.languageCode,
          name: config.name,
          ssmlGender: config.ssmlGender
        },
        audioConfig: {
          audioEncoding: config.audioEncoding,
          speakingRate: config.speakingRate || 1.0,
          pitch: config.pitch || 0.0,
          volumeGainDb: config.volumeGainDb || 0.0,
          sampleRateHertz: config.sampleRateHertz || 24000,
          effectsProfileId: config.effectsProfileId || []
        }
      };

      // TTS 요청 실행
      const [response] = await this.client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('SSML 음성 데이터가 생성되지 않았습니다');
      }

      const processingTime = Date.now() - startTime;
      
      console.log('✅ Google Cloud TTS SSML 음성 생성 완료:', {
        processingTime: `${processingTime}ms`,
        audioSize: `${Math.round(response.audioContent.length / 1024)}KB`
      });

      return {
        success: true,
        audioContent: response.audioContent.toString('base64'),
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ Google Cloud TTS SSML 생성 실패:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        processingTime
      };
    }
  }

  /**
   * 사용 가능한 음성 목록 조회
   */
  async listVoices(languageCode?: string): Promise<{
    success: boolean;
    voices?: any[];
    error?: string;
  }> {
    try {
      const isClientReady = await this.initializeClient();
      if (!isClientReady || !this.client) {
        throw new Error('Google Cloud TTS 클라이언트를 초기화할 수 없습니다');
      }

      const request = languageCode ? { languageCode } : {};
      const [response] = await this.client.listVoices(request);

      console.log('✅ 음성 목록 조회 완료:', {
        totalVoices: response.voices?.length || 0,
        languageCode: languageCode || 'all'
      });

      return {
        success: true,
        voices: response.voices || []
      };

    } catch (error) {
      console.error('❌ 음성 목록 조회 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 서비스 상태 확인
   */
  getStatus(): {
    isInitialized: boolean;
    hasClient: boolean;
    hasCredentials: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      hasClient: this.client !== null,
      hasCredentials: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT)
    };
  }
}

// 싱글톤 인스턴스
export const googleCloudTTS = new GoogleCloudTTSService();
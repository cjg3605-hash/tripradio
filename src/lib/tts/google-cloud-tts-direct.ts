// Google Cloud Text-to-Speech REST API 직접 호출
// 공식 문서: https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize

export interface DirectTTSConfig {
  text: string;
  languageCode?: string;
  voiceName?: string;
  ssmlGender?: 'SSML_VOICE_GENDER_UNSPECIFIED' | 'MALE' | 'FEMALE' | 'NEUTRAL';
  audioEncoding?: 'AUDIO_ENCODING_UNSPECIFIED' | 'LINEAR16' | 'MP3' | 'OGG_OPUS';
  speakingRate?: number; // 0.25 to 4.0
  pitch?: number; // -20.0 to 20.0
  volumeGainDb?: number; // -96.0 to 16.0
}

export interface DirectTTSResponse {
  success: boolean;
  audioContent?: string; // Base64 encoded audio
  error?: string;
}

/**
 * Google Cloud Text-to-Speech REST API 직접 호출 클래스
 */
class DirectGoogleCloudTTS {
  private readonly apiEndpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * 서비스 계정으로 OAuth 액세스 토큰 획득
   */
  private async getAccessToken(): Promise<string> {
    // 토큰이 유효하면 재사용
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // 환경변수에서 서비스 계정 JSON 파싱
      const serviceAccountJson = process.env.GCP_SERVICE_ACCOUNT;
      if (!serviceAccountJson) {
        throw new Error('GCP_SERVICE_ACCOUNT 환경변수가 설정되지 않음');
      }

      const serviceAccount = JSON.parse(serviceAccountJson);
      
      // JWT 생성 (간단한 방법: googleapis 라이브러리 사용)
      const { GoogleAuth } = await import('google-auth-library');
      
      const auth = new GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });

      const authClient = await auth.getClient();
      const accessTokenResponse = await authClient.getAccessToken();
      
      if (!accessTokenResponse.token) {
        throw new Error('액세스 토큰 획득 실패');
      }

      this.accessToken = accessTokenResponse.token;
      this.tokenExpiry = Date.now() + 3500 * 1000; // 3500초 후 만료

      console.log('✅ Google Cloud TTS 액세스 토큰 획득 완료');
      return this.accessToken;

    } catch (error) {
      console.error('❌ 액세스 토큰 획득 실패:', error);
      throw new Error(`인증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * Text-to-Speech API 직접 호출
   */
  async synthesizeSpeech(config: DirectTTSConfig): Promise<DirectTTSResponse> {
    try {
      console.log('🎵 Google Cloud TTS API 직접 호출 시작:', {
        textLength: config.text.length,
        voice: config.voiceName || 'default',
        language: config.languageCode || 'ko-KR'
      });

      // 액세스 토큰 획득
      const accessToken = await this.getAccessToken();

      // API 요청 본문 구성
      const requestBody = {
        input: {
          text: config.text
        },
        voice: {
          languageCode: config.languageCode || 'ko-KR',
          name: config.voiceName || 'ko-KR-Standard-A',
          ssmlGender: config.ssmlGender || 'NEUTRAL'
        },
        audioConfig: {
          audioEncoding: config.audioEncoding || 'MP3',
          speakingRate: config.speakingRate || 1.0,
          pitch: config.pitch || 0.0,
          volumeGainDb: config.volumeGainDb || 0.0
        }
      };

      console.log('📤 TTS API 요청:', {
        endpoint: this.apiEndpoint,
        voice: requestBody.voice,
        audioConfig: requestBody.audioConfig
      });

      // REST API 호출
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TTS API 오류 응답:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`TTS API 호출 실패: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const result = await response.json();

      if (!result.audioContent) {
        throw new Error('응답에 audioContent가 없음');
      }

      console.log('✅ Google Cloud TTS 음성 생성 완료:', {
        audioSize: result.audioContent.length,
        encoding: config.audioEncoding || 'MP3'
      });

      return {
        success: true,
        audioContent: result.audioContent
      };

    } catch (error) {
      console.error('❌ Google Cloud TTS 직접 호출 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 사용 가능한 음성 목록 조회
   */
  async listVoices(languageCode?: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://texttospeech.googleapis.com/v1/voices${languageCode ? `?languageCode=${languageCode}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`음성 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ 음성 목록 조회 실패:', error);
      return { voices: [] };
    }
  }
}

// 싱글톤 인스턴스
export const directGoogleCloudTTS = new DirectGoogleCloudTTS();

// 편의 함수
export async function synthesizeTextDirect(
  text: string, 
  options: Omit<DirectTTSConfig, 'text'> = {}
): Promise<DirectTTSResponse> {
  return directGoogleCloudTTS.synthesizeSpeech({ text, ...options });
}
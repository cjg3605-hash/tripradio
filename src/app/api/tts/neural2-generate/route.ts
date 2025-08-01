// 🎙️ Neural2 TTS API 라우트 - Google Cloud TTS Neural2 모델 통합
// 효율적이고 지연없는 오디오 생성을 위한 최적화된 엔드포인트

import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Google Cloud TTS 클라이언트 초기화 (환경변수에서 인증 정보 로드)
let ttsClient: TextToSpeechClient | null = null;

const initializeTTSClient = () => {
  if (!ttsClient) {
    try {
      // 환경변수 확인 및 매핑
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;
      const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_SERVICE_ACCOUNT;
      
      if (!projectId) {
        console.warn('⚠️ Google Cloud Project ID 없음 - 폴백 모드로 동작');
        return null;
      }

      // 서비스 계정 인증 정보 파싱
      let credentials;
      if (serviceAccount) {
        try {
          credentials = typeof serviceAccount === 'string' 
            ? JSON.parse(serviceAccount) 
            : serviceAccount;
        } catch (parseError) {
          console.error('❌ 서비스 계정 JSON 파싱 실패:', parseError);
          return null;
        }
      }

      // TTS 클라이언트 초기화
      if (credentials) {
        ttsClient = new TextToSpeechClient({
          projectId,
          credentials
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        ttsClient = new TextToSpeechClient({
          projectId,
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
      } else {
        console.warn('⚠️ Google Cloud TTS 인증 정보 없음 - 폴백 모드로 동작');
        return null;
      }

      console.log('✅ Google Cloud TTS 클라이언트 초기화 완료');
    } catch (error) {
      console.error('❌ Google Cloud TTS 클라이언트 초기화 실패:', error);
      return null;
    }
  }
  return ttsClient;
};

interface Neural2TTSRequest {
  input: {
    ssml: string;
  };
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: 'FEMALE' | 'MALE' | 'NEUTRAL';
  };
  audioConfig: {
    audioEncoding: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    speakingRate: number;
    pitch: number;
    volumeGainDb: number;
    sampleRateHertz: number;
    effectsProfileId: string[];
  };
  metadata?: {
    chapterId?: string;
    locationName?: string;
    language?: string;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const client = initializeTTSClient();
    
    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'Google Cloud TTS 서비스를 사용할 수 없습니다. 환경 설정을 확인해주세요.',
        fallbackRecommended: true
      }, { status: 503 });
    }

    const body: Neural2TTSRequest = await request.json();
    
    // 📝 요청 유효성 검사
    if (!body.input?.ssml || !body.voice?.name || !body.audioConfig) {
      return NextResponse.json({
        success: false,
        error: '필수 매개변수가 누락되었습니다. (ssml, voice.name, audioConfig 필요)'
      }, { status: 400 });
    }

    console.log('🎙️ Neural2 TTS 요청:', {
      voiceName: body.voice.name,
      language: body.voice.languageCode,
      textLength: body.input.ssml.length,
      metadata: body.metadata
    });

    // 🎯 Google Cloud TTS 요청 구성
    const ttsRequest = {
      input: { ssml: body.input.ssml },
      voice: {
        languageCode: body.voice.languageCode,
        name: body.voice.name,
        ssmlGender: body.voice.ssmlGender
      },
      audioConfig: {
        audioEncoding: body.audioConfig.audioEncoding as any,
        speakingRate: Math.max(0.25, Math.min(4.0, body.audioConfig.speakingRate)),
        pitch: Math.max(-20, Math.min(20, body.audioConfig.pitch)),
        volumeGainDb: Math.max(-96, Math.min(16, body.audioConfig.volumeGainDb)),
        sampleRateHertz: body.audioConfig.sampleRateHertz,
        effectsProfileId: body.audioConfig.effectsProfileId
      }
    };

    // 🚀 TTS 생성 (타임아웃 설정: 30초)
    const [response] = await Promise.race([
      client.synthesizeSpeech(ttsRequest),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('TTS 생성 타임아웃 (30초)')), 30000)
      )
    ]) as any;

    if (!response.audioContent) {
      throw new Error('오디오 콘텐츠 생성 실패');
    }

    // 📊 성능 메트릭
    const processingTime = Date.now() - startTime;
    const audioSize = response.audioContent.length;

    console.log('✅ Neural2 TTS 생성 완료:', {
      processingTime: `${processingTime}ms`,
      audioSize: `${Math.round(audioSize / 1024)}KB`,
      voice: body.voice.name
    });

    // 🎵 Base64 인코딩된 오디오 데이터 반환
    const audioBase64 = Buffer.from(response.audioContent).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      metadata: {
        voice: body.voice.name,
        language: body.voice.languageCode,
        processingTime,
        audioSize,
        encoding: body.audioConfig.audioEncoding,
        sampleRate: body.audioConfig.sampleRateHertz,
        ...body.metadata
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('❌ Neural2 TTS 생성 오류:', {
      error: error instanceof Error ? error.message : String(error),
      processingTime: `${processingTime}ms`
    });

    // 🔄 상세한 오류 정보 제공
    let errorMessage = 'TTS 생성 중 오류가 발생했습니다.';
    let shouldFallback = true;

    if (error instanceof Error) {
      if (error.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Google Cloud TTS 권한이 없습니다. API 키를 확인해주세요.';
      } else if (error.message.includes('INVALID_ARGUMENT')) {
        errorMessage = '잘못된 음성 설정입니다. 요청 매개변수를 확인해주세요.';
        shouldFallback = false;
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage = 'TTS API 할당량을 초과했습니다.';
      } else if (error.message.includes('타임아웃')) {
        errorMessage = 'TTS 생성 시간이 초과되었습니다. 다시 시도해주세요.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallbackRecommended: shouldFallback,
      processingTime
    }, { status: 500 });
  }
}

// 🛡️ GET 요청 비활성화 (보안)
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'GET 메서드는 지원하지 않습니다. POST를 사용해주세요.'
  }, { status: 405 });
}
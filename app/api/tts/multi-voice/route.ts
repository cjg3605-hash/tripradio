// NotebookLM 전용 다중 음성 TTS API
import { NextRequest, NextResponse } from 'next/server';
import { directGoogleCloudTTS } from '@/lib/tts/google-cloud-tts-direct';

export async function POST(req: NextRequest) {
  try {
    const { 
      text, 
      language = 'ko-KR', 
      voice,  // 특정 음성 지정
      ssmlGender = 'NEUTRAL',
      speakingRate = 1.0,
      pitch = 0,
      volumeGainDb = 0,
      quality = 'high' 
    } = await req.json();
    
    console.log('🎭 NotebookLM 다중 음성 TTS 요청:', { 
      textLength: text?.length || 0, 
      voice,
      ssmlGender,
      speakingRate,
      pitch
    });
    
    if (!text) {
      return NextResponse.json(
        { 
          success: false, 
          error: '텍스트가 필요합니다.', 
          code: 'MISSING_TEXT' 
        },
        { status: 400 }
      );
    }

    if (!voice) {
      return NextResponse.json(
        { 
          success: false, 
          error: '음성(voice)이 필요합니다.', 
          code: 'MISSING_VOICE' 
        },
        { status: 400 }
      );
    }

    // Google Cloud TTS 직접 호출 (커스텀 음성 사용)
    const result = await directGoogleCloudTTS.synthesizeSpeech({
      text,
      languageCode: language,
      voiceName: voice,  // 전달받은 음성 사용
      ssmlGender,
      audioEncoding: 'MP3',
      speakingRate,
      pitch,
      volumeGainDb
    });

    if (!result.success || !result.audioContent) {
      throw new Error(result.error || 'Google Cloud TTS 생성 실패');
    }
    
    console.log('✅ NotebookLM 다중 음성 TTS 생성 완료:', { 
      audioSize: result.audioContent.length,
      voice,
      ssmlGender,
      speakingRate
    });
    
    return NextResponse.json({
      success: true,
      audioData: result.audioContent,
      mimeType: 'audio/mpeg',
      language,
      voiceName: voice,
      speakingRate,
      ssmlGender
    });
    
  } catch (error) {
    console.error('❌ NotebookLM 다중 음성 TTS API 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: 'MULTI_VOICE_TTS_FAILED'
      },
      { status: 500 }
    );
  }
}
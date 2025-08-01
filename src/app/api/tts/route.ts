// Google Cloud Text-to-Speech REST API 직접 호출
import { NextRequest, NextResponse } from 'next/server';
import { directGoogleCloudTTS } from '@/lib/tts/google-cloud-tts-direct';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'ko-KR', speakingRate = 1.0 } = await req.json();
    
    console.log('🎵 Google Cloud TTS 직접 호출 요청:', { 
      textLength: text?.length || 0, 
      language,
      speakingRate
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

    // Google Cloud TTS REST API 직접 호출
    const result = await directGoogleCloudTTS.synthesizeSpeech({
      text: text,
      languageCode: language,
      voiceName: language === 'ko-KR' ? 'ko-KR-Standard-A' : 'en-US-Standard-A',
      ssmlGender: 'NEUTRAL',
      audioEncoding: 'MP3',
      speakingRate: speakingRate,
      pitch: 0.0,
      volumeGainDb: 0.0
    });

    if (!result.success || !result.audioContent) {
      throw new Error(result.error || 'Google Cloud TTS 생성 실패');
    }
    
    console.log('✅ Google Cloud TTS 오디오 생성 완료:', { 
      audioSize: result.audioContent.length,
      language,
      speakingRate 
    });
    
    return NextResponse.json({
      success: true,
      audioData: result.audioContent,
      mimeType: 'audio/mpeg',
      language,
      speakingRate
    });
    
  } catch (error) {
    console.error('❌ Google Cloud TTS API 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: 'TTS_GENERATION_FAILED'
      },
      { status: 500 }
    );
  }
}
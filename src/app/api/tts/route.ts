// src/app/api/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTTSAudio } from '@/lib/tts-gcs';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'ko-KR', speakingRate = 1.2 } = await req.json();
    
    console.log('🎵 TTS 요청 받음:', { 
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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GEMINI_API_KEY가 설정되지 않았습니다.', 
          code: 'MISSING_API_KEY' 
        },
        { status: 500 }
      );
    }

    // Google Cloud TTS로 오디오 생성 (배속 적용)
    const audioBuffer = await generateTTSAudio(text, language, speakingRate);
    
    console.log('✅ TTS 오디오 생성 완료:', { 
      size: audioBuffer.byteLength,
      language,
      speakingRate 
    });

    // ArrayBuffer를 Base64로 인코딩하여 반환
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    return NextResponse.json({
      success: true,
      audioData: base64Audio,
      mimeType: 'audio/mpeg',
      language,
      speakingRate
    });
    
  } catch (error) {
    console.error('❌ TTS API 요청 처리 오류:', error);
    
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
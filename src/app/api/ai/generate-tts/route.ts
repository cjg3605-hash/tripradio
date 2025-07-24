import { NextRequest, NextResponse } from 'next/server';
import { generateTTSAudio } from '@/lib/tts-gcs';

export async function POST(req: NextRequest) {
  try {
    const { text, guide_id, locationName, language } = await req.json();
    
    console.log('🎵 TTS 요청 수신:', { 
      textLength: text?.length, 
      guide_id, 
      locationName, 
      language 
    });
    
    if (!text || !guide_id || !locationName || !language) {
      return NextResponse.json({ 
        success: false, 
        error: '필수 값 누락', 
        missing: { text: !text, guide_id: !guide_id, locationName: !locationName, language: !language }
      }, { status: 400 });
    }

    // TTS 오디오 생성 (getOrCreateChapterAudio가 이미 DB 저장도 처리함)
    const audioBuffer = await generateTTSAudio(text, language, 1.2);
    
    // ArrayBuffer를 Base64로 인코딩하여 반환
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    console.log('✅ TTS 생성 완료:', { 
      guide_id, 
      audioSize: audioBuffer.byteLength,
      language 
    });

    return NextResponse.json({ 
      success: true, 
      audioData: base64Audio,
      mimeType: 'audio/mpeg',
      language
    });
    
  } catch (error) {
    console.error('❌ TTS 생성 실패:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      code: 'TTS_GENERATION_FAILED'
    }, { status: 500 });
  }
} 
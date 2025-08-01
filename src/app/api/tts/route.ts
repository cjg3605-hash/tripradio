// src/app/api/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ultraNaturalTTS } from '@/lib/tts/ultra-natural-tts-engine';

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

    // Ultra-Natural TTS로 오디오 생성
    const result = await ultraNaturalTTS.generateUltraNaturalTTS({
      text: text,
      context: 'tour_guide',
      targetAudience: {
        ageGroup: 'middle',
        formalityPreference: 'semi_formal',
        educationLevel: 'general'
      },
      qualityLevel: 'ultra'
    });

    if (!result.success || !result.audioUrl) {
      throw new Error(result.error || 'Ultra-Natural TTS 생성 실패');
    }
    
    console.log('✅ Ultra-Natural TTS 오디오 생성 완료:', { 
      humanLikeness: `${result.naturalness.humanLikenessPercent.toFixed(1)}%`,
      simulationAccuracy: `${result.naturalness.simulationAccuracy.toFixed(1)}%`,
      language,
      speakingRate 
    });

    // data URL에서 base64 추출
    const base64Audio = result.audioUrl.split(',')[1] || result.audioUrl;
    
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
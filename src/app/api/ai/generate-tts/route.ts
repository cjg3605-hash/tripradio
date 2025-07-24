import { NextRequest, NextResponse } from 'next/server';
import { generateTTSAudio } from '@/lib/tts-gcs';
import { ttsRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    // TTS 속도 제한 확인
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const limitResult = await ttsRateLimiter.limit(ip);
    
    if (!limitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'TTS 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: limitResult.reset
        },
        { 
          status: 429,
          headers: {
            'Retry-After': limitResult.reset?.toString() || '60',
            'X-RateLimit-Limit': limitResult.limit?.toString() || '10',
            'X-RateLimit-Remaining': limitResult.remaining?.toString() || '0'
          }
        }
      );
    }
    const { 
      text, 
      guide_id, 
      locationName, 
      language, 
      voiceSettings,
      personalityContext 
    } = await req.json();
    
    console.log('🎵 TTS 요청 수신:', { 
      textLength: text?.length, 
      guide_id, 
      locationName, 
      language,
      hasPersonality: !!personalityContext,
      personality: personalityContext?.personality
    });
    
    if (!text || !guide_id || !locationName || !language) {
      return NextResponse.json({ 
        success: false, 
        error: '필수 값 누락', 
        missing: { text: !text, guide_id: !guide_id, locationName: !locationName, language: !language }
      }, { status: 400 });
    }

    // TTS 생성에 20초 타임아웃 추가
    const speakingRate = voiceSettings?.speakingRate || 1.2;
    const TTS_TIMEOUT_MS = 20000;
    const ttsTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TTS 생성 시간 초과')), TTS_TIMEOUT_MS);
    });

    const audioBuffer = await Promise.race([
      generateTTSAudio(text, language, speakingRate, voiceSettings),
      ttsTimeoutPromise
    ]);
    
    // 타입 안전성 확보 및 ArrayBuffer를 Base64로 인코딩
    if (!(audioBuffer instanceof ArrayBuffer)) {
      throw new Error('Invalid audio buffer received from TTS service');
    }
    
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    console.log('✅ TTS 생성 완료:', { 
      guide_id, 
      audioSize: audioBuffer.byteLength,
      language,
      personality: personalityContext?.personality,
      speakingRate
    });

    return NextResponse.json({ 
      success: true, 
      audioData: base64Audio,
      mimeType: 'audio/mpeg',
      language,
      personalityApplied: personalityContext?.personality
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
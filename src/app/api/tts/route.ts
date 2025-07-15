import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateTTSAndUrl } from '@/lib/tts-gcs';
import { createErrorResponse, createSuccessResponse, normalizeError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { text, language, guideId, chapterId } = await req.json();
    
    console.log('🎵 TTS 요청 받음:', { 
      textLength: text?.length || 0, 
      language, 
      guideId, 
      chapterId 
    });
    
    if (!text) {
      console.error('❌ TTS 요청 실패: 텍스트 없음');
      return NextResponse.json(
        createErrorResponse('텍스트가 필요합니다.', 'MISSING_TEXT'),
        { status: 400 }
      );
    }

    // 언어 코드를 TTS 형식으로 변환
    const languageMap: Record<string, string> = {
      'ko': 'ko-KR',
      'en': 'en-US', 
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'es': 'es-ES'
    };
    
    const ttsLanguage = languageMap[language] || 'ko-KR';
    const locationName = guideId || 'default-guide';
    
    // TTS 파일 생성 및 URL 반환
    console.log('🎵 TTS 생성 시작:', { locationName, ttsLanguage });
    const ttsUrl = await getOrCreateTTSAndUrl(text, locationName, ttsLanguage);
    console.log('✅ TTS 생성 완료:', { ttsUrl });

    return NextResponse.json(
      createSuccessResponse({
        url: ttsUrl,
        metadata: {
          language: ttsLanguage,
          guideId,
          chapterId
        }
      })
    );
  } catch (error) {
    console.error('TTS 생성 오류:', error);
    
    const normalizedError = normalizeError(error);
    
    // 특정 오류 메시지에 따른 처리
    if (normalizedError.message.includes('TTS 서비스가 설정되지 않았습니다')) {
      return NextResponse.json(
        createErrorResponse(
          'TTS 기능이 현재 비활성화되어 있습니다. 관리자에게 문의해주세요.',
          'TTS_DISABLED',
          normalizedError.details
        ),
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      createErrorResponse(
        normalizedError.message,
        'TTS_ERROR',
        normalizedError.details
      ),
      { status: 500 }
    );
  }
} 
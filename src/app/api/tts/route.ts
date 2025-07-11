import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateTTSAndUrl } from '@/lib/tts-gcs';

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
      return NextResponse.json({ success: false, error: '텍스트가 필요합니다.' }, { status: 400 });
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

    return NextResponse.json({ 
      success: true, 
      url: ttsUrl,
      metadata: {
        language: ttsLanguage,
        guideId,
        chapterId
      }
    });
  } catch (error) {
    console.error('TTS 생성 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 
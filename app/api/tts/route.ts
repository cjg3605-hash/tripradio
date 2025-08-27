// Google Cloud Text-to-Speech REST API 직접 호출 (언어별 최적화)
import { NextRequest, NextResponse } from 'next/server';
import { directGoogleCloudTTS } from '@/lib/tts/google-cloud-tts-direct';
import { LanguageOptimizedTTSSelector, LanguageOptimizedTTSUtils } from '@/lib/tts/language-optimized-tts';

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'ko-KR', speakingRate, quality = 'high' } = await req.json();
    
    // 언어 코드 정규화
    const normalizedLanguage = LanguageOptimizedTTSUtils.normalizeLanguageCode(language);
    
    console.log('🎵 언어별 최적화된 TTS 요청:', { 
      textLength: text?.length || 0, 
      originalLanguage: language,
      normalizedLanguage,
      requestedRate: speakingRate,
      quality
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

    // 🎯 언어별 최적화된 TTS 설정 가져오기
    const optimizedConfig = LanguageOptimizedTTSSelector.getOptimizedConfigForTourGuide(normalizedLanguage);
    
    // 품질 레벨에 따른 설정 조정
    const finalConfig = LanguageOptimizedTTSSelector.adjustConfigForQuality(optimizedConfig, quality);
    
    // 요청에서 speakingRate가 명시되었으면 우선 적용
    const effectiveSpeakingRate = speakingRate !== undefined ? speakingRate : finalConfig.speakingRate;
    
    // 언어별 문화적 적응 텍스트 전처리
    const preprocessedText = LanguageOptimizedTTSUtils.preprocessTextForLanguage(text, normalizedLanguage);
    
    console.log('🎯 최적화된 TTS 설정 적용:', {
      language: finalConfig.languageCode,
      voice: finalConfig.voiceName,
      gender: finalConfig.ssmlGender,
      speakingRate: effectiveSpeakingRate,
      pitch: finalConfig.pitch,
      volumeGainDb: finalConfig.volumeGainDb,
      quality: finalConfig.voiceName.includes('Neural2') ? 'Neural2' : 'Standard',
      culturalAdaptation: finalConfig.languageSpecific.culturalAdaptation
    });

    // Google Cloud TTS REST API 직접 호출 (언어별 최적화 적용)
    const result = await directGoogleCloudTTS.synthesizeSpeech({
      text: preprocessedText,
      languageCode: finalConfig.languageCode,
      voiceName: finalConfig.voiceName,
      ssmlGender: finalConfig.ssmlGender,
      audioEncoding: finalConfig.audioEncoding,
      speakingRate: effectiveSpeakingRate,
      pitch: finalConfig.pitch,
      volumeGainDb: finalConfig.volumeGainDb
    });

    if (!result.success || !result.audioContent) {
      throw new Error(result.error || 'Google Cloud TTS 생성 실패');
    }
    
    console.log('✅ 언어별 최적화된 TTS 생성 완료:', { 
      audioSize: result.audioContent.length,
      originalLanguage: language,
      optimizedLanguage: finalConfig.languageCode,
      voice: finalConfig.voiceName,
      quality: finalConfig.voiceName.includes('Neural2') ? 'Neural2' : 'Standard',
      speakingRate: effectiveSpeakingRate,
      culturalAdaptation: finalConfig.languageSpecific.culturalAdaptation
    });
    
    return NextResponse.json({
      success: true,
      audioData: result.audioContent,
      mimeType: finalConfig.audioEncoding === 'MP3' ? 'audio/mpeg' : 'audio/wav',
      language: finalConfig.languageCode,
      voiceName: finalConfig.voiceName,
      speakingRate: effectiveSpeakingRate,
      quality: finalConfig.voiceName.includes('Neural2') ? 'Neural2' : 'Standard',
      culturalAdaptation: finalConfig.languageSpecific.culturalAdaptation
    });
    
  } catch (error) {
    console.error('❌ 언어별 최적화된 TTS API 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: 'OPTIMIZED_TTS_GENERATION_FAILED'
      },
      { status: 500 }
    );
  }
}
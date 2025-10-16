/**
 * 부분 보완용 TTS 생성기
 * 개별 세그먼트를 위한 간단한 TTS 생성
 */

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface TTSGenerationOptions {
  text: string;
  voice: 'male' | 'female';
  fileName: string;
  folderPath: string;
  language: string;
}

export interface TTSGenerationResult {
  success: boolean;
  fileName?: string;
  publicUrl?: string;
  duration?: number;
  fileSize?: number;
  error?: string;
}

// 간단한 음성 프로필 매핑
const getVoiceProfile = (language: string, gender: 'male' | 'female') => {
  const voiceProfiles: Record<string, Record<string, { name: string; languageCode: string; gender: string }>> = {
    ko: {
      male: { name: 'ko-KR-Wavenet-C', languageCode: 'ko-KR', gender: 'MALE' },
      female: { name: 'ko-KR-Wavenet-A', languageCode: 'ko-KR', gender: 'FEMALE' }
    },
    en: {
      male: { name: 'en-US-Wavenet-D', languageCode: 'en-US', gender: 'MALE' },
      female: { name: 'en-US-Wavenet-C', languageCode: 'en-US', gender: 'FEMALE' }
    },
    ja: {
      male: { name: 'ja-JP-Wavenet-C', languageCode: 'ja-JP', gender: 'MALE' },
      female: { name: 'ja-JP-Wavenet-A', languageCode: 'ja-JP', gender: 'FEMALE' }
    },
    zh: {
      male: { name: 'cmn-CN-Wavenet-C', languageCode: 'cmn-CN', gender: 'MALE' },
      female: { name: 'cmn-CN-Wavenet-A', languageCode: 'cmn-CN', gender: 'FEMALE' }
    },
    es: {
      male: { name: 'es-ES-Wavenet-B', languageCode: 'es-ES', gender: 'MALE' },
      female: { name: 'es-ES-Wavenet-A', languageCode: 'es-ES', gender: 'FEMALE' }
    }
  };
  
  return voiceProfiles[language]?.[gender] || voiceProfiles.ko.male;
};

export async function generateTTSAudio(options: TTSGenerationOptions): Promise<TTSGenerationResult> {
  try {
    const { text, voice, fileName, folderPath, language } = options;
    
    console.log(`🎤 TTS 생성 시작: ${fileName}`, {
      텍스트길이: text.length,
      음성: voice,
      언어: language
    });

    // 1. 음성 프로필 선택
    const voiceProfile = getVoiceProfile(language, voice);
    
    console.log('🎵 선택된 음성 프로필:', {
      이름: voiceProfile.name,
      언어: voiceProfile.languageCode,
      성별: voiceProfile.gender
    });

    // 2. Google Cloud TTS API 호출
    const ttsResponse = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_TTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: text },
        voice: {
          languageCode: voiceProfile.languageCode,
          name: voiceProfile.name,
          ssmlGender: voiceProfile.gender
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      }),
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.text();
      throw new Error(`TTS API 호출 실패: ${ttsResponse.status} - ${errorData}`);
    }

    const ttsData = await ttsResponse.json();
    
    if (!ttsData.audioContent) {
      throw new Error('TTS API에서 오디오 콘텐츠를 받지 못함');
    }

    // 3. Base64를 Buffer로 변환
    const audioBuffer = Buffer.from(ttsData.audioContent, 'base64');
    
    console.log(`💾 오디오 데이터 변환 완료: ${audioBuffer.length} bytes`);

    // 4. Supabase Storage에 업로드
    const filePath = `${folderPath}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true // 동일한 파일이 있으면 덮어쓰기
      });

    if (uploadError) {
      throw new Error(`Supabase 업로드 실패: ${uploadError.message}`);
    }

    // 5. 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath);

    const result: TTSGenerationResult = {
      success: true,
      fileName: fileName,
      publicUrl: publicUrlData.publicUrl,
      fileSize: audioBuffer.length,
      // duration은 추정값 (대략 텍스트 길이 기반)
      duration: Math.round(text.length / 10) // 대략 10자당 1초 추정
    };

    console.log(`✅ TTS 생성 완료: ${fileName}`, {
      URL: result.publicUrl,
      크기: `${Math.round(audioBuffer.length / 1024)}KB`,
      예상재생시간: `${result.duration}초`
    });

    return result;

  } catch (error) {
    console.error(`❌ TTS 생성 실패: ${options.fileName}`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 여러 세그먼트를 병렬로 생성
 */
export async function generateMultipleTTSAudio(
  segments: TTSGenerationOptions[],
  concurrency: number = 3
): Promise<TTSGenerationResult[]> {
  const results: TTSGenerationResult[] = [];
  
  // 동시 실행 제한을 위한 배치 처리
  for (let i = 0; i < segments.length; i += concurrency) {
    const batch = segments.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(segment => generateTTSAudio(segment))
    );
    results.push(...batchResults);
    
    console.log(`🚀 배치 완료: ${i + 1}-${Math.min(i + concurrency, segments.length)}/${segments.length}`);
    
    // 배치 간 짧은 대기 (API 제한 고려)
    if (i + concurrency < segments.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
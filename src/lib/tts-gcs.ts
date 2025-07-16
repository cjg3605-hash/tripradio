// src/lib/tts-gcs.ts
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

// GEMINI_API_KEY 환경 변수 체크
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn('⚠️ GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. TTS 기능이 비활성화됩니다.');
}

// WaveNet 음성 맵 (언어별 고품질 음성)
const WAVENET_VOICES: Record<string, string> = {
  'ko-KR': 'ko-KR-Wavenet-A',
  'en-US': 'en-US-Wavenet-D', 
  'ja-JP': 'ja-JP-Wavenet-B',
  'zh-CN': 'cmn-CN-Wavenet-A',
  'es-ES': 'es-ES-Wavenet-A',
};

// 챕터별 오디오 파일명 생성 (배속 정보 포함)
const getChapterAudioFileName = (guideId: string, chapterIndex: number, language: string, text: string, speakingRate = 1.2) => {
  const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
  const rateStr = speakingRate.toString().replace('.', '_'); // 1.2 -> 1_2
  return `audio/guides/${guideId}/chapter_${chapterIndex}_${language}_${rateStr}x_${hash}.mp3`;
};

// 캐시 키 생성 (배속 정보 포함)
const getChapterCacheKey = (guideId: string, chapterIndex: number, language: string, speakingRate = 1.2) => {
  const rateStr = speakingRate.toString().replace('.', '_');
  return `tts_${guideId}_chapter_${chapterIndex}_${language}_${rateStr}x`;
};

// TTS로 넘기기 전 텍스트에서 ➡️와 그 뒤의 공백을 모두 제거
const cleanTtsText = (text: string): string => {
  return text.replace(/➡️\s*/g, '');
};

export const generateTTSAudio = async (text: string, language = 'ko-KR', speakingRate = 1.2): Promise<ArrayBuffer> => {
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. 구글 클라우드 콘솔에서 API 키를 확인해주세요.');
  }

  const cleanedText = cleanTtsText(text);
  
  // Google Cloud Text-to-Speech REST API 호출
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text: cleanedText },
      voice: {
        languageCode: language,
        name: WAVENET_VOICES[language] || undefined,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: speakingRate, // 1.2배속 적용
        pitch: 0.0,
        volumeGainDb: 0.0
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('TTS API 오류:', response.status, errorData);
    throw new Error(`TTS API 오류: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
  }

  const data = await response.json();
  
  if (!data.audioContent) {
    throw new Error('TTS 오디오 콘텐츠 생성 실패');
  }

  // Base64 디코딩
  const audioBuffer = Buffer.from(data.audioContent, 'base64');
  return audioBuffer.buffer;
};

// 📦 Supabase를 활용한 챕터별 오디오 파일 저장 및 캐싱 (배속 지원)
export const getOrCreateChapterAudio = async (
  guideId: string, 
  chapterIndex: number, 
  text: string, 
  language = 'ko-KR',
  speakingRate = 1.2
): Promise<string> => {
  try {
    const cacheKey = getChapterCacheKey(guideId, chapterIndex, language, speakingRate);
    const fileName = getChapterAudioFileName(guideId, chapterIndex, language, text, speakingRate);
    
    console.log('🔍 챕터 오디오 검색:', { guideId, chapterIndex, language, speakingRate, fileName });

    // 1. 브라우저 캐시 확인 (빠른 로딩)
    if (typeof window !== 'undefined') {
      const cachedUrl = localStorage.getItem(cacheKey);
      if (cachedUrl) {
        console.log('✅ 브라우저 캐시에서 로드:', fileName);
        return cachedUrl;
      }
    }

    // 2. Supabase DB에서 기존 오디오 파일 확인 (배속 포함)
    const { data: existingAudio, error: dbError } = await supabase
      .from('audio_files')
      .select('file_path')
      .eq('guide_id', guideId)
      .eq('chapter_index', chapterIndex)
      .eq('language', language)
      .like('file_path', `%_${speakingRate.toString().replace('.', '_')}x_%`) // 배속 매칭
      .single();

    if (!dbError && existingAudio) {
      // 3. Supabase Storage에서 파일 존재 확인
      const { data: fileData } = await supabase.storage
        .from('audio')
        .download(existingAudio.file_path);

      if (fileData) {
        console.log('✅ Supabase Storage에서 로드:', existingAudio.file_path);
        
        // Blob URL 생성 및 캐시 저장
        const audioUrl = URL.createObjectURL(fileData);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, audioUrl);
        }
        
        return audioUrl;
      }
    }

    console.log('🎵 새 챕터 오디오 생성 시작...', { guideId, chapterIndex, language, speakingRate });

    // 4. 새로운 TTS 오디오 생성 (배속 적용)
    const audioBuffer = await generateTTSAudio(text, language, speakingRate);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    // 5. Supabase Storage에 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Supabase Storage 업로드 실패:', uploadError);
      // Storage 실패 시에도 로컬 Blob URL 반환
      const localUrl = URL.createObjectURL(audioBlob);
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, localUrl);
      }
      return localUrl;
    }

    // 6. audio_files 테이블에 메타데이터 저장 (배속 정보 포함)
    const { error: insertError } = await supabase
      .from('audio_files')
      .upsert([{
        guide_id: guideId,
        chapter_index: chapterIndex,
        language: language,
        file_path: fileName,
        file_size: audioBlob.size,
        duration_seconds: null, // 추후 계산 가능
        created_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.warn('⚠️ audio_files 테이블 저장 실패:', insertError);
    }

    // 7. 성공 - Blob URL 생성 및 캐시 저장
    const audioUrl = URL.createObjectURL(audioBlob);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, audioUrl);
    }

    console.log('✅ 챕터 오디오 생성 및 저장 완료:', { 
      guideId, 
      chapterIndex, 
      language,
      speakingRate,
      fileName,
      size: audioBlob.size 
    });

    return audioUrl;

  } catch (error) {
    console.error('❌ 챕터 오디오 생성 실패:', error);
    throw error;
  }
};

// 📂 가이드 전체 오디오 파일 목록 조회
export const getGuideAudioFiles = async (guideId: string, language: string) => {
  try {
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('guide_id', guideId)
      .eq('language', language)
      .order('chapter_index', { ascending: true });

    if (error) {
      console.error('❌ 가이드 오디오 파일 목록 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ 가이드 오디오 파일 목록 조회 실패:', error);
    return [];
  }
};

// 🗑️ 가이드 오디오 파일 삭제 (정리용)
export const deleteGuideAudioFiles = async (guideId: string, language?: string) => {
  try {
    let query = supabase.from('audio_files').select('file_path').eq('guide_id', guideId);
    
    if (language) {
      query = query.eq('language', language);
    }

    const { data: audioFiles } = await query;

    if (audioFiles && audioFiles.length > 0) {
      // Storage에서 파일 삭제
      const filePaths = audioFiles.map(file => file.file_path);
      await supabase.storage.from('audio').remove(filePaths);

      // DB에서 메타데이터 삭제
      let deleteQuery = supabase.from('audio_files').delete().eq('guide_id', guideId);
      if (language) {
        deleteQuery = deleteQuery.eq('language', language);
      }
      await deleteQuery;

      console.log('🗑️ 가이드 오디오 파일 삭제 완료:', { guideId, language, count: audioFiles.length });
    }
  } catch (error) {
    console.error('❌ 가이드 오디오 파일 삭제 실패:', error);
  }
};

// 기존 함수들 (하위 호환성) - 배속 기본값 1.2 적용
export const getOrCreateTTSAndUrl = async (text: string, locationName: string, language = 'ko-KR'): Promise<string> => {
  console.warn('⚠️ getOrCreateTTSAndUrl는 deprecated입니다. getOrCreateChapterAudio를 사용하세요.');
  
  // 임시 guideId 생성
  const tempGuideId = crypto.createHash('md5').update(locationName).digest('hex');
  return await getOrCreateChapterAudio(tempGuideId, 0, text, language, 1.2);
};

export const generateTTSAndUpload = async (text: string, fileName: string, lang = 'ko-KR'): Promise<string> => {
  console.warn('⚠️ generateTTSAndUpload는 deprecated입니다. getOrCreateChapterAudio를 사용하세요.');
  const tempGuideId = crypto.createHash('md5').update(fileName).digest('hex');
  return await getOrCreateChapterAudio(tempGuideId, 0, text, lang, 1.2);
};
// 🔧 TTS 텍스트 분할 및 Long Audio API 해결책
// src/lib/tts-gcs.ts 수정

import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

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

// 🚨 TTS API 제한
const MAX_TTS_BYTES = 4500; // 5000바이트보다 조금 작게 설정 (안전 마진)
const MAX_TTS_CHARS = 2000; // 한국어 기준 대략적인 문자 수

// 챕터별 오디오 파일명 생성
function getChapterAudioFileName(guideId: string, chapterIndex: number, language: string, text: string) {
  const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
  return `audio/guides/${guideId}/chapter_${chapterIndex}_${language}_${hash}.mp3`;
}

// 캐시 키 생성
function getChapterCacheKey(guideId: string, chapterIndex: number, language: string) {
  return `tts_${guideId}_chapter_${chapterIndex}_${language}`;
}

// TTS용 텍스트 정리 및 분할
function cleanAndSplitTtsText(text: string): string[] {
  // 1. 기본 정리
  let cleaned = text
    .replace(/➡️\s*/g, '') // 화살표 제거
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 볼드 마크다운 제거
    .replace(/\*([^*]+)\*/g, '$1') // 이탤릭 마크다운 제거
    .trim();

  // 2. 길이 체크
  const textBytes = Buffer.byteLength(cleaned, 'utf8');
  console.log('📏 텍스트 크기 분석:', {
    원본길이: text.length,
    정리후길이: cleaned.length,
    바이트수: textBytes,
    제한바이트: MAX_TTS_BYTES,
    초과여부: textBytes > MAX_TTS_BYTES
  });

  // 3. 분할이 필요한 경우
  if (textBytes > MAX_TTS_BYTES || cleaned.length > MAX_TTS_CHARS) {
    return splitTextIntoChunks(cleaned);
  }

  return [cleaned];
}

// 🔪 텍스트를 의미 단위로 분할
function splitTextIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?。！？]/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;

    const sentenceWithPunctuation = sentence.trim() + '.';
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentenceWithPunctuation;
    
    // 바이트 수 체크
    if (Buffer.byteLength(potentialChunk, 'utf8') > MAX_TTS_BYTES) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentenceWithPunctuation;
      } else {
        // 단일 문장이 너무 긴 경우 강제 분할
        chunks.push(...forcesSplitLongText(sentenceWithPunctuation));
        currentChunk = '';
      }
    } else {
      currentChunk = potentialChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  console.log('✂️ 텍스트 분할 완료:', {
    원본바이트: Buffer.byteLength(text, 'utf8'),
    청크수: chunks.length,
    각청크바이트: chunks.map(chunk => Buffer.byteLength(chunk, 'utf8'))
  });

  return chunks;
}

// 🔨 강제 분할 (매우 긴 문장용)
function forcesSplitLongText(text: string): string[] {
  const chunks: string[] = [];
  const words = text.split(' ');
  let currentChunk = '';

  for (const word of words) {
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + word;
    
    if (Buffer.byteLength(potentialChunk, 'utf8') > MAX_TTS_BYTES) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        // 단일 단어가 너무 긴 경우 (거의 없지만)
        chunks.push(word);
        currentChunk = '';
      }
    } else {
      currentChunk = potentialChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// 🎵 단일 청크 TTS 생성
export async function generateTTSAudio(text: string, language = 'ko-KR'): Promise<ArrayBuffer> {
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. 구글 클라우드 콘솔에서 API 키를 확인해주세요.');
  }

  // 텍스트 길이 검증
  const textBytes = Buffer.byteLength(text, 'utf8');
  if (textBytes > MAX_TTS_BYTES) {
    throw new Error(`텍스트가 너무 깁니다 (${textBytes}바이트). 최대 ${MAX_TTS_BYTES}바이트까지 가능합니다.`);
  }

  console.log('🎤 TTS 생성:', { 길이: text.length, 바이트: textBytes, 언어: language });

  // Google Cloud Text-to-Speech REST API 호출
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: language,
        name: WAVENET_VOICES[language] || undefined,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 0.95, // 조금 느리게
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
}

// 🎵 여러 청크를 하나의 오디오로 합치기
async function mergeAudioChunks(audioChunks: ArrayBuffer[]): Promise<ArrayBuffer> {
  // 간단한 ArrayBuffer 연결 (실제로는 더 정교한 오디오 병합이 필요할 수 있음)
  const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const chunk of audioChunks) {
    merged.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  
  return merged.buffer;
}

// 📦 향상된 챕터 오디오 생성 (텍스트 분할 지원)
export async function getOrCreateChapterAudio(
  guideId: string, 
  chapterIndex: number, 
  text: string, 
  language = 'ko-KR'
): Promise<string> {
  try {
    const cacheKey = getChapterCacheKey(guideId, chapterIndex, language);
    const fileName = getChapterAudioFileName(guideId, chapterIndex, language, text);
    
    console.log('🔍 챕터 오디오 검색:', { guideId, chapterIndex, language, fileName });

    // 1. 브라우저 캐시 확인
    if (typeof window !== 'undefined') {
      const cachedUrl = localStorage.getItem(cacheKey);
      if (cachedUrl) {
        console.log('✅ 브라우저 캐시에서 로드:', fileName);
        return cachedUrl;
      }
    }

    // 2. Supabase DB에서 기존 오디오 파일 확인
    const { data: existingAudio, error: dbError } = await supabase
      .from('audio_files')
      .select('file_path')
      .eq('guide_id', guideId)
      .eq('chapter_index', chapterIndex)
      .eq('language', language)
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

    console.log('🎵 새 챕터 오디오 생성 시작...', { guideId, chapterIndex, language });

    // 4. 🔥 텍스트 분할 및 TTS 생성
    const textChunks = cleanAndSplitTtsText(text);
    
    if (textChunks.length === 1) {
      // 단일 청크인 경우 기존 방식 사용
      const audioBuffer = await generateTTSAudio(textChunks[0], language);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      
      // 저장 로직은 동일
      return await saveAndReturnAudio(guideId, chapterIndex, language, fileName, audioBlob, cacheKey);
      
    } else {
      // 여러 청크인 경우 각각 생성 후 병합
      console.log('🔀 다중 청크 TTS 생성:', { 청크수: textChunks.length });
      
      const audioChunks: ArrayBuffer[] = [];
      for (let i = 0; i < textChunks.length; i++) {
        console.log(`🎤 청크 ${i + 1}/${textChunks.length} 생성 중...`);
        const chunkAudio = await generateTTSAudio(textChunks[i], language);
        audioChunks.push(chunkAudio);
        
        // API Rate Limiting 방지
        if (i < textChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // 오디오 청크 병합
      const mergedAudio = await mergeAudioChunks(audioChunks);
      const audioBlob = new Blob([mergedAudio], { type: 'audio/mpeg' });
      
      // 저장 로직은 동일
      return await saveAndReturnAudio(guideId, chapterIndex, language, fileName, audioBlob, cacheKey);
    }

  } catch (error) {
    console.error('❌ 챕터 오디오 생성 실패:', error);
    throw error;
  }
}

// 🎵 오디오 저장 및 반환 공통 로직
async function saveAndReturnAudio(
  guideId: string,
  chapterIndex: number,
  language: string,
  fileName: string,
  audioBlob: Blob,
  cacheKey: string
): Promise<string> {
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

  // 6. audio_files 테이블에 메타데이터 저장
  const { error: insertError } = await supabase
    .from('audio_files')
    .upsert([{
      guide_id: guideId,
      chapter_index: chapterIndex,
      language: language,
      file_path: fileName,
      file_size: audioBlob.size,
      duration_seconds: null,
      created_at: new Date().toISOString()
    }]);

  if (insertError) {
    console.warn('⚠️ audio_files 테이블 저장 실패:', insertError);
  }

  // 7. Blob URL 생성 및 캐시 저장
  const audioUrl = URL.createObjectURL(audioBlob);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, audioUrl);
  }

  console.log('✅ 챕터 오디오 생성 및 저장 완료:', { 
    guideId, 
    chapterIndex, 
    language,
    fileName,
    size: audioBlob.size 
  });

  return audioUrl;
}

// 기존 함수들 (하위 호환성)
export async function getOrCreateTTSAndUrl(text: string, locationName: string, language = 'ko-KR'): Promise<string> {
  console.warn('⚠️ getOrCreateTTSAndUrl는 deprecated입니다. getOrCreateChapterAudio를 사용하세요.');
  
  const tempGuideId = crypto.createHash('md5').update(locationName).digest('hex');
  return await getOrCreateChapterAudio(tempGuideId, 0, text, language);
}

export async function generateTTSAndUpload(text: string, fileName: string, lang = 'ko-KR'): Promise<string> {
  console.warn('⚠️ generateTTSAndUpload는 deprecated입니다. getOrCreateChapterAudio를 사용하세요.');
  const tempGuideId = crypto.createHash('md5').update(fileName).digest('hex');
  return await getOrCreateChapterAudio(tempGuideId, 0, text, lang);
}
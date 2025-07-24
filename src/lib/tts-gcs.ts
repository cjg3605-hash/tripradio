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

// 한글 및 특수문자 제거 안전 파일 경로 생성
const sanitizeForPath = (str: string): string => {
  return str
    .replace(/[가-힣]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
};

// 한글 안전 파일명 생성 (audio/ 접두사 제거)
const getChapterAudioFileName = (guideId: string, chapterIndex: number, language: string, text: string, speakingRate = 1.2) => {
  const hash = crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
  const rateStr = speakingRate.toString().replace('.', '_');
  const safeGuideId = sanitizeForPath(guideId);
  return `guides/${safeGuideId}/chapter_${chapterIndex}_${language}_${rateStr}x_${hash}.mp3`;
};

// 세션 메모리 캐시 (크기 제한 및 TTL 적용)
class TTSCache {
  private cache = new Map<string, { url: string; timestamp: number; accessCount: number }>();
  private readonly maxSize = 100;  // 최대 100개 항목
  private readonly ttl = 30 * 60 * 1000; // 30분 TTL

  set(key: string, url: string): void {
    // 캐시 크기 관리
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      url,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // TTL 체크
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // TTL 체크
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // 접근 카운트 업데이트
    entry.accessCount++;
    return entry.url;
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    let leastAccessed = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      // 가장 적게 접근된 항목을 우선 제거
      if (entry.accessCount < leastAccessed || 
          (entry.accessCount === leastAccessed && entry.timestamp < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        leastAccessed = entry.accessCount;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ 캐시 항목 제거: ${oldestKey}`);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      items: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        accessCount: entry.accessCount
      }))
    };
  }
}

const sessionAudioCache = new TTSCache();

// 캐시 키 생성
const getChapterCacheKey = (guideId: string, chapterIndex: number, language: string, speakingRate = 1.2) => {
  const rateStr = speakingRate.toString().replace('.', '_');
  const safeGuideId = sanitizeForPath(guideId);
  return `tts_${safeGuideId}_chapter_${chapterIndex}_${language}_${rateStr}x`;
};

// TTS로 넘기기 전 텍스트에서 ➡️와 그 뒤의 공백을 모두 제거
const cleanTtsText = (text: string): string => {
  return text.replace(/➡️\s*/g, '');
};

// 텍스트 분할 함수 추가
const splitTextByBytes = (text: string, maxBytes: number = 4800): string[] => {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?。！？]\s*/).filter(Boolean);
  
  let currentChunk = '';
  let currentBytes = 0;
  
  for (const sentence of sentences) {
    const sentenceWithPeriod = sentence + '. ';
    const sentenceBytes = Buffer.byteLength(sentenceWithPeriod, 'utf8');
    
    if (currentBytes + sentenceBytes > maxBytes) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentenceWithPeriod;
      currentBytes = sentenceBytes;
    } else {
      currentChunk += sentenceWithPeriod;
      currentBytes += sentenceBytes;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

// 여러 오디오 버퍼를 하나로 합치는 함수
const mergeAudioBuffers = (buffers: ArrayBuffer[]): ArrayBuffer => {
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const mergedBuffer = new ArrayBuffer(totalLength);
  const mergedView = new Uint8Array(mergedBuffer);
  
  let offset = 0;
  for (const buffer of buffers) {
    mergedView.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return mergedBuffer;
};

export const generateTTSAudio = async (
  text: string, 
  language = 'ko-KR', 
  speakingRate = 1.2,
  voiceSettings?: {
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
  },
  abortSignal?: AbortSignal
): Promise<ArrayBuffer> => {
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. 구글 클라우드 콘솔에서 API 키를 확인해주세요.');
  }
  
  const cleanedText = cleanTtsText(text);
  
  // 복원력 있는 fetch 사용
  const { resilientPost } = await import('./resilient-fetch');
  
  const response = await resilientPost(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiApiKey}`,
    {
      input: { text: cleanedText },
      voice: {
        languageCode: language,
        name: WAVENET_VOICES[language] || undefined,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: voiceSettings?.speakingRate || speakingRate,
        pitch: voiceSettings?.pitch || 0.0,
        volumeGainDb: voiceSettings?.volumeGainDb || 0.0
      },
    },
    {
      timeout: 30000,        // 30초 타임아웃
      retries: 2,            // 2회 재시도
      useCircuitBreaker: true,
      abortSignal
    }
  );

  const data = await response.json();
  if (!data.audioContent) {
    throw new Error('TTS 오디오 콘텐츠 생성 실패');
  }
  const audioBuffer = Buffer.from(data.audioContent, 'base64');
  return audioBuffer.buffer;
};

// 한글 안전 + 토큰 절약 챕터 오디오 관리
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
    
    // 1. 세션 메모리 캐시 확인
    if (typeof window !== 'undefined' && sessionAudioCache.has(cacheKey)) {
      const cachedUrl = sessionAudioCache.get(cacheKey)!;
      console.log('✅ 세션 캐시에서 오디오 반환:', cacheKey);
      return cachedUrl;
    }
    
    // 2. Supabase DB에서 기존 오디오 파일 확인
    const safeGuideId = sanitizeForPath(guideId);
    const { data: existingAudio, error: dbError } = await supabase
      .from('audio_files')
      .select('file_path')
      .eq('guide_id', safeGuideId)
      .eq('chapter_index', chapterIndex)
      .eq('language', language)
      .like('file_path', `%_${speakingRate.toString().replace('.', '_')}x_%`)
      .single();
      
    if (!dbError && existingAudio) {
      console.log('✅ DB에서 기존 오디오 파일 발견:', existingAudio.file_path);
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('audio')
        .download(existingAudio.file_path);
        
      if (fileData && !downloadError) {
        const audioUrl = URL.createObjectURL(fileData);
        if (typeof window !== 'undefined') {
          sessionAudioCache.set(cacheKey, audioUrl);
        }
        console.log('✅ 기존 파일 다운로드 완료');
        return audioUrl;
      } else {
        console.warn('⚠️ 파일 다운로드 실패, DB 레코드 삭제');
        await supabase.from('audio_files').delete().eq('file_path', existingAudio.file_path);
      }
    }
    
    // 3. 새로운 TTS 오디오 생성 - 바이트 체크 및 분할 처리
    const cleanedText = cleanTtsText(text);
    const textBytes = Buffer.byteLength(cleanedText, 'utf8');
    
    console.log('📊 텍스트 바이트 분석:', { 
      originalLength: text.length, 
      cleanedLength: cleanedText.length, 
      bytes: textBytes 
    });
    
    let audioBuffer: ArrayBuffer;
    
    if (textBytes <= 4800) {
      // 4800바이트 이하: 분할하지 않고 생성
      console.log('✅ 단일 TTS 생성 (4800바이트 이하)');
      audioBuffer = await generateTTSAudio(cleanedText, language, speakingRate);
      
    } else {
      // 4800바이트 초과: 텍스트 분할 처리
      console.log('⚠️ 텍스트 분할 처리 시작 (4800바이트 초과)');
      
      const textChunks = splitTextByBytes(cleanedText, 4800);
      console.log('📝 텍스트 분할 완료:', { 
        totalChunks: textChunks.length,
        chunkSizes: textChunks.map(chunk => Buffer.byteLength(chunk, 'utf8'))
      });
      
      // 각 청크별로 TTS 생성
      const audioBuffers: ArrayBuffer[] = [];
      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(`🎵 청크 ${i + 1}/${textChunks.length} TTS 생성 중...`);
        
        const chunkBuffer = await generateTTSAudio(chunk, language, speakingRate);
        audioBuffers.push(chunkBuffer);
        
        // 너무 빠른 요청 방지 (TTS API 제한)
        if (i < textChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('🔗 오디오 버퍼 병합 중...');
      audioBuffer = mergeAudioBuffers(audioBuffers);
      console.log('✅ 분할 TTS 생성 완료');
    }
    
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    
    // 4. Supabase Storage에 새 파일 업로드
    console.log('📤 스토리지 업로드 중:', fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBlob, { contentType: 'audio/mpeg' });
      
    if (uploadError) {
      console.warn('⚠️ 스토리지 업로드 실패, 로컬 URL 반환:', uploadError);
      const localUrl = URL.createObjectURL(audioBlob);
      if (typeof window !== 'undefined') {
        sessionAudioCache.set(cacheKey, localUrl);
      }
      return localUrl;
    }
    
    // 5. audio_files 테이블에 메타데이터 저장
    console.log('📝 DB 메타데이터 저장 중...');
    const { error: insertError } = await supabase
      .from('audio_files')
      .insert([{
        guide_id: safeGuideId,
        chapter_index: chapterIndex,
        language: language,
        file_path: fileName,
        file_size: audioBlob.size,
        duration_seconds: null,
        created_at: new Date().toISOString()
      }]);
      
    if (insertError) {
      console.warn('⚠️ DB 저장 실패:', insertError);
    }
    
    // 6. 오디오 URL 생성 및 캐시 저장
    const audioUrl = URL.createObjectURL(audioBlob);
    if (typeof window !== 'undefined') {
      sessionAudioCache.set(cacheKey, audioUrl);
    }
    
    console.log('✅ 새 오디오 파일 생성 완료:', fileName);
    return audioUrl;
    
  } catch (error) {
    console.error('❌ 챕터 오디오 생성 실패:', error);
    throw error;
  }
};

// 가이드 전체 오디오 파일 목록 조회
export const getGuideAudioFiles = async (guideId: string, language: string) => {
  try {
    const safeGuideId = sanitizeForPath(guideId);
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('guide_id', safeGuideId)
      .eq('language', language)
      .order('chapter_index', { ascending: true });
    if (error) {
      return [];
    }
    return data || [];
  } catch (error) {
    return [];
  }
};

// 가이드 오디오 파일 삭제
export const deleteGuideAudioFiles = async (guideId: string, language?: string) => {
  try {
    const safeGuideId = sanitizeForPath(guideId);
    let query = supabase.from('audio_files').select('file_path').eq('guide_id', safeGuideId);
    if (language) {
      query = query.eq('language', language);
    }
    const { data: audioFiles } = await query;
    if (audioFiles && audioFiles.length > 0) {
      const filePaths = audioFiles.map(file => file.file_path);
      await supabase.storage.from('audio').remove(filePaths);
      let deleteQuery = supabase.from('audio_files').delete().eq('guide_id', safeGuideId);
      if (language) {
        deleteQuery = deleteQuery.eq('language', language);
      }
      await deleteQuery;
    }
  } catch (error) {}
};

// 세션 종료 시 캐시 정리 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionAudioCache.clear();
  });
}

// 하위 호환성 함수
export const getOrCreateTTSAndUrl = async (text: string, locationName: string, language = 'ko-KR'): Promise<string> => {
  const tempGuideId = crypto.createHash('md5').update(locationName).digest('hex');
  return await getOrCreateChapterAudio(tempGuideId, 0, text, language, 1.2);
};

export const generateTTSAndUpload = async (text: string, fileName: string, lang = 'ko-KR'): Promise<string> => {
  const tempGuideId = crypto.createHash('md5').update(fileName).digest('hex');
  return await getOrCreateChapterAudio(tempGuideId, 0, text, lang, 1.2);
};

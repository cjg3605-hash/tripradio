/**
 * 순차 재생용 TTS 생성기 (다국어 지원)
 * 각 세그먼트를 개별 TTS로 생성하고 순서대로 저장
 */

import { createClient } from '@supabase/supabase-js';
import { DialogueSegment } from './sequential-dialogue-processor';
import LocationSlugService from '@/lib/location/location-slug-service';
import { getDefaultGeminiModel } from '@/lib/ai/gemini-client';
import { MultilingualVoiceManager } from '@/lib/ai/voices/multilingual-voice-profiles';

export interface GeneratedSegmentFile {
  sequenceNumber: number;
  speakerType: 'male' | 'female';
  audioBuffer: Buffer;
  duration: number;
  fileSize: number;
  fileName: string;
  supabaseUrl?: string;
  textContent?: string;  // API Routes에서 사용
  filePath?: string;     // API Routes에서 사용
  metadata?: {           // API Routes에서 사용
    quality?: number;
    processingTime?: number;
    [key: string]: any;
  };
}

export interface SequentialTTSResult {
  episodeId: string;
  locationName: string;
  segmentFiles: GeneratedSegmentFile[];
  totalDuration: number;
  totalFileSize: number;
  folderPath: string;
  success: boolean;
  errors?: string[];
  slugInfo?: {           // API Routes에서 사용
    slug: string;
    language: string;
    locationName: string;
    [key: string]: any;
  };
}

export class SequentialTTSGenerator {
  private static supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Circuit Breaker 상태 관리
  private static circuitBreakerState = {
    isOpen: false,
    consecutiveFailures: 0,
    lastFailureTime: 0,
    failureThreshold: 3,        // 연속 3회 실패시 Circuit 열림
    resetTimeoutMs: 30000,      // 30초 후 재시도
    halfOpenMaxAttempts: 1      // Half-Open 상태에서 1회만 테스트
  };

  // API 헬스 체크 캐시
  private static apiHealthCache = {
    isHealthy: true,
    lastCheckTime: 0,
    cacheValidityMs: 60000     // 1분간 캐시 유효
  };

  /**
   * 세그먼트들을 순차적으로 TTS 생성 (범용 인터페이스)
   */
  static async generateSequentialTTS(
    segments: DialogueSegment[] | any[],
    locationName: string,
    episodeId: string,
    language: string = 'ko-KR',
    actualChapterIndex?: number  // API에서 전달하는 실제 챕터 인덱스
  ): Promise<SequentialTTSResult> {
    
    console.log('🎙️ 순차 TTS 생성 시작:', {
      segmentCount: segments.length,
      locationName,
      episodeId,
      actualChapterIndex: actualChapterIndex  // 받은 챕터 인덱스 로깅
    });

    // 배치 처리 전 API 헬스 체크
    const healthCheck = await this.checkApiHealth();
    if (!healthCheck.isHealthy) {
      console.error(`🚨 TTS API 헬스 체크 실패: ${healthCheck.message}`);
      return {
        episodeId,
        locationName,
        segmentFiles: [],
        totalDuration: 0,
        totalFileSize: 0,
        folderPath: '',
        success: false,
        errors: [`API 헬스 체크 실패: ${healthCheck.message}`]
      };
    }

    console.log(`✅ ${healthCheck.message} - 배치 처리 계속 진행`);

    const segmentFiles: GeneratedSegmentFile[] = [];
    const errors: string[] = [];
    let totalDuration = 0;
    let totalFileSize = 0;

    // LocationSlugService를 통한 영문 슬러그 확보
    console.log('🔍 LocationSlugService로 영문 슬러그 확보 중...');
    const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);
    
    // Supabase 폴더 경로: podcasts/{slug}/
    const folderPath = `podcasts/${slugResult.slug}`;
    
    console.log(`📁 TTS 폴더 경로 결정: "${locationName}" → "${folderPath}" (${slugResult.source})`);
    
    // 슬러그 결과를 반환 객체에 포함 (나중에 DB 저장용)
    const slugInfo = {
      locationInput: locationName,
      locationSlug: slugResult.slug,
      slugSource: slugResult.source
    };
    
    // 배치 처리 최적화 (3개씩, 병렬 처리) - API 과부하 방지
    const batchSize = 3;
    const batches: any[][] = [];
    for (let i = 0; i < segments.length; i += batchSize) {
      batches.push(segments.slice(i, i + batchSize));
    }
    
    console.log(`📦 ${segments.length}개 세그먼트를 ${batches.length}개 배치로 처리`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const progress = Math.round(((batchIndex) / batches.length) * 100);
      const completedSegments = batchIndex * batchSize;
      const remainingTime = Math.round(((segments.length - completedSegments) * 4.2) / 60); // 예상 분 (배치 크기 감소 반영)
      
      console.log(`\n🔄 배치 ${batchIndex + 1}/${batches.length} 처리 중... (${batch.length}개 세그먼트) - ${progress}% 완료, 예상 ${remainingTime}분 남음`);
      
      // 배치 내 병렬 처리
      const batchPromises = batch.map(async (segment, segmentIndex) => {
        try {
          console.log(`🔊 세그먼트 ${segment.sequenceNumber} TTS 생성 중...`);
          
          // 세그먼트 간 스태거드 시작 최적화 (동시 API 호출 방지)
          await new Promise(resolve => setTimeout(resolve, segmentIndex * 200));
          
          const audioData = await this.generateSingleTTS(
            segment.textContent,
            segment.speakerType,
            language
          );
        
        if (!audioData.success || !audioData.audioBuffer) {
          throw new Error(audioData.error || 'TTS 생성 실패');
        }
        
        // 파일명: {챕터번호}-{세그먼트번호}{언어코드}.mp3 형식 (예: 1-1ko.mp3, 1-2ko.mp3, 2-1ko.mp3)
        const langCode = language.split('-')[0]; // ko-KR → ko
        
        // 파일명 생성: 실제 챕터 인덱스 사용 (API에서 전달받은 값)
        let chapterIndex: number;
        let chapterSegmentNumber: number;
        
        if (actualChapterIndex !== undefined) {
          // API에서 실제 챕터 인덱스를 전달한 경우 (가장 정확함)
          chapterIndex = actualChapterIndex;
          // 챕터 내에서의 세그먼트 순서: 현재 세그먼트가 배열에서 몇 번째인지 + 1
          chapterSegmentNumber = segments.indexOf(segment) + 1;
        } else {
          // 폴백: sequenceNumber 기반 계산 (기존 로직 유지)
          if (segment.sequenceNumber <= 25) {
            chapterIndex = 1;
            chapterSegmentNumber = segment.sequenceNumber;
          } else if (segment.sequenceNumber >= 101 && segment.sequenceNumber <= 125) {
            chapterIndex = 2;
            chapterSegmentNumber = segment.sequenceNumber - 100;
          } else {
            // 기본 계산
            chapterIndex = Math.floor((segment.sequenceNumber - 1) / 25) + 1;
            chapterSegmentNumber = ((segment.sequenceNumber - 1) % 25) + 1;
          }
        }
        
        const fileName = `${chapterIndex}-${chapterSegmentNumber}${langCode}.mp3`;
        
        console.log(`📋 파일명 계산: actualChapterIndex=${actualChapterIndex}, seq=${segment.sequenceNumber} → 챕터 ${chapterIndex}, 세그먼트 ${chapterSegmentNumber} → ${fileName}`);
        
        // Supabase에 업로드
        const uploadResult = await this.uploadToSupabase(
          audioData.audioBuffer,
          folderPath,
          fileName
        );
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
        
        const chapterTitle = segment.chapterTitle || `챕터 ${chapterIndex}`;

        const segmentFile: GeneratedSegmentFile = {
          sequenceNumber: segment.sequenceNumber,
          speakerType: segment.speakerType,
          audioBuffer: audioData.audioBuffer,
          duration: audioData.duration || segment.estimatedDuration,
          fileSize: audioData.audioBuffer.length,
          fileName,
          supabaseUrl: uploadResult.publicUrl,
          textContent: segment.textContent, // 실제 대화 텍스트 전달
          filePath: uploadResult.publicUrl,  // file_path 필드용
          metadata: {
            chapterIndex: chapterIndex,
            chapterTitle,
            originalSequenceNumber: segment.sequenceNumber,
            chapterSegmentNumber: chapterSegmentNumber
          }
        };
        
        console.log(`✅ 세그먼트 ${segment.sequenceNumber} 완료 (${segmentFile.duration}초, ${Math.round(segmentFile.fileSize/1024)}KB)`);
        
        // 메모리 최적화: 메모리 참조 정리 (더블 레퍼런스 방지)
        if (audioData.audioBuffer) {
          // Buffer 내용 초기화 후 참조 해제
          audioData.audioBuffer.fill(0);
          (audioData as any).audioBuffer = undefined; // Buffer 참조 해제
          // Note: audioData는 const이므로 직접 재할당 불가, 내부 속성만 정리
        }
        
        // 강제 가비지 컬렉션 힌트 (메모리 정리)
        if (global.gc && segmentIndex % 2 === 1) {
          global.gc();
        }
        
        return segmentFile;
          
        } catch (error) {
          const errorMsg = `세그먼트 ${segment.sequenceNumber} 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
          return null;
        }
      });
      
      // 배치 병렬 처리 실행
      const batchResults = await Promise.allSettled(batchPromises);
      
      // 성공한 결과만 추가
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          segmentFiles.push(result.value);
          totalDuration += result.value.duration;
          totalFileSize += result.value.fileSize;
        }
      }
      
      // 배치 간 딜레이 최적화 (2초) - API 복구 시간 확보
      if (batchIndex < batches.length - 1) {
        console.log(`⏳ 배치 간 대기 (2초)... 다음: 배치 ${batchIndex + 2}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
      }
    }
    
    console.log('🎵 순차 TTS 생성 완료:', {
      successCount: segmentFiles.length,
      totalDuration: `${Math.round(totalDuration)}초`,
      totalFileSize: `${Math.round(totalFileSize / 1024)}KB`,
      errorCount: errors.length
    });
    
    const result = {
      episodeId,
      locationName,
      segmentFiles: segmentFiles.sort((a, b) => a.sequenceNumber - b.sequenceNumber),
      totalDuration,
      totalFileSize,
      folderPath,
      success: segmentFiles.length > 0,
      errors: errors.length > 0 ? errors : undefined,
      // 슬러그 정보 추가 (DB 저장용)
      ...slugInfo
    };

    // ❌ DB 업데이트는 route.ts에서 SERVICE_ROLE_KEY로 처리
    // 이유: ANON_KEY로는 RLS 권한 문제 발생
    console.log('ℹ️ DB 업데이트는 API route에서 처리됨 (SERVICE_ROLE_KEY 필요)');

    return result;
  }

  /**
   * TTS API 헬스 체크
   */
  private static async checkApiHealth(): Promise<{ isHealthy: boolean; message?: string }> {
    const now = Date.now();
    const cache = this.apiHealthCache;

    // 캐시된 결과가 유효하면 반환
    if (now - cache.lastCheckTime < cache.cacheValidityMs) {
      return { 
        isHealthy: cache.isHealthy, 
        message: cache.isHealthy ? 'API 정상 (캐시됨)' : 'API 비정상 (캐시됨)' 
      };
    }

    console.log('🏥 TTS API 헬스 체크 시작...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tts/multi-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '테스트',
          language: 'ko-KR',
          voice: 'ko-KR-Standard-A',
          ssmlGender: 'NEUTRAL'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const isHealthy = response.ok;
      const message = isHealthy ? 
        `✅ API 정상 (${response.status})` : 
        `❌ API 비정상 (${response.status})`;

      // 캐시 업데이트
      cache.isHealthy = isHealthy;
      cache.lastCheckTime = now;

      console.log(`🏥 ${message}`);
      return { isHealthy, message };

    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError' ? 
        '❌ API 타임아웃 (5초)' : 
        `❌ API 헬스 체크 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;

      // 캐시 업데이트 (실패)
      cache.isHealthy = false;
      cache.lastCheckTime = now;

      console.error(`🏥 ${message}`);
      return { isHealthy: false, message };
    }
  }

  /**
   * Circuit Breaker 상태 확인
   */
  private static checkCircuitBreaker(): { canProceed: boolean; reason?: string } {
    const cb = this.circuitBreakerState;
    const now = Date.now();

    // Circuit이 열린 상태인지 확인
    if (cb.isOpen) {
      // 재설정 시간이 지났는지 확인 (Half-Open으로 전환)
      if (now - cb.lastFailureTime >= cb.resetTimeoutMs) {
        console.log('🔄 Circuit Breaker: Half-Open 상태로 전환 (테스트 재시도)');
        return { canProceed: true };
      }
      
      const remainingTime = Math.ceil((cb.resetTimeoutMs - (now - cb.lastFailureTime)) / 1000);
      return { 
        canProceed: false, 
        reason: `Circuit Breaker 열림: ${remainingTime}초 후 재시도 가능` 
      };
    }

    return { canProceed: true };
  }

  /**
   * Circuit Breaker 성공 처리
   */
  private static onCircuitBreakerSuccess(): void {
    const cb = this.circuitBreakerState;
    if (cb.consecutiveFailures > 0 || cb.isOpen) {
      console.log('✅ Circuit Breaker: 성공으로 인한 상태 재설정');
      cb.consecutiveFailures = 0;
      cb.isOpen = false;
      cb.lastFailureTime = 0;
    }
  }

  /**
   * Circuit Breaker 실패 처리
   */
  private static onCircuitBreakerFailure(): void {
    const cb = this.circuitBreakerState;
    cb.consecutiveFailures++;
    cb.lastFailureTime = Date.now();

    if (cb.consecutiveFailures >= cb.failureThreshold) {
      cb.isOpen = true;
      console.error(`🚨 Circuit Breaker: ${cb.consecutiveFailures}회 연속 실패로 Circuit 열림 (${cb.resetTimeoutMs/1000}초 후 재시도)`);
    } else {
      console.warn(`⚠️ Circuit Breaker: 연속 실패 ${cb.consecutiveFailures}/${cb.failureThreshold}`);
    }
  }

  /**
   * 단일 TTS 생성 (다국어 지원)
   */
  private static async generateSingleTTS(
    text: string,
    speakerType: 'male' | 'female',
    language: string = 'ko-KR',
    retryCount: number = 0,
    maxRetries: number = 2
  ): Promise<{
    success: boolean;
    audioBuffer?: Buffer;
    duration?: number;
    error?: string;
  }> {
    
    // Circuit Breaker 상태 확인
    const circuitCheck = this.checkCircuitBreaker();
    if (!circuitCheck.canProceed) {
      console.error(`🚫 ${circuitCheck.reason}`);
      return { 
        success: false, 
        error: circuitCheck.reason || 'Circuit Breaker 활성화' 
      };
    }
    
    // 언어 코드 정규화
    const normalizedLanguage = language === 'ko' ? 'ko-KR' : 
                              language === 'en' ? 'en-US' : language;
    
    // 다국어 음성 프로필에서 적절한 음성 선택
    let voiceNames: { male: string; female: string };
    
    try {
      const voiceConfig = MultilingualVoiceManager.getVoiceConfig(normalizedLanguage);
      voiceNames = {
        male: voiceConfig.primaryVoice.voiceId,      // 진행자 (Host) - 남성
        female: voiceConfig.secondaryVoice.voiceId   // 큐레이터 (Curator) - 여성
      };
      
      console.log(`🎤 ${normalizedLanguage} 음성 선택:`, {
        male: voiceNames.male,
        female: voiceNames.female
      });
      
    } catch (error) {
      console.warn(`⚠️ ${normalizedLanguage} 음성 프로필 로드 실패, 기본값 사용:`, error);
      // 기본값 (한국어)
      voiceNames = {
        male: 'ko-KR-Neural2-C',
        female: 'ko-KR-Neural2-A'
      };
    }

    try {
      // TTS API 타임아웃 설정 (30초) - 스펙 준수
      const ttsTimeout = 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ttsTimeout);

      try {
        // Google Cloud TTS 호출 (기존 multi-voice API 사용)
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/tts/multi-voice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            language: normalizedLanguage,
            voice: voiceNames[speakerType],
            ssmlGender: speakerType === 'male' ? 'MALE' : 'FEMALE',
            speakingRate: normalizedLanguage.startsWith('en') ? 1.1 : 1.0, // 영어는 조금 빠르게
            pitch: normalizedLanguage.startsWith('en') ? 1 : 0,             // 영어는 조금 높게
            volumeGainDb: speakerType === 'female' ? 2.0 : 0  // 여성 목소리 볼륨 +2dB (남성과 균형)
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`TTS API 오류: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success || !result.audioData) {
          throw new Error(result.error || 'TTS 응답에 오디오 데이터 없음');
        }

        // Base64 디코딩
        const audioBuffer = Buffer.from(result.audioData, 'base64');
        
        // 대략적인 duration 계산 (3초/초)
        const estimatedDuration = Math.ceil(text.length / 3);

        // Circuit Breaker 성공 처리
        this.onCircuitBreakerSuccess();

        return {
          success: true,
          audioBuffer,
          duration: estimatedDuration
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // AbortController 타임아웃 오류 처리
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(`TTS API 타임아웃 (${ttsTimeout/1000}초 초과)`);
        }
        throw fetchError;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 TTS 오류';
      
      // 강화된 재시도 로직 (Exponential Backoff + 확장된 에러 코드)
      if (retryCount < maxRetries && 
          (errorMessage.includes('타임아웃') || 
           errorMessage.includes('TTS API 타임아웃') ||  // AbortController 타임아웃
           errorMessage.includes('네트워크') || 
           errorMessage.includes('503') || 
           errorMessage.includes('502') ||
           errorMessage.includes('429') ||  // Rate Limiting
           errorMessage.includes('500') ||  // Internal Server Error
           errorMessage.includes('408') ||  // Request Timeout
           errorMessage.includes('ECONNRESET') ||
           errorMessage.includes('ETIMEDOUT'))) {
        
        // Exponential backoff with jitter (최대 30초)
        const backoffDelay = Math.min(30000, 1000 * Math.pow(2, retryCount) + Math.random() * 1000);
        console.warn(`⚠️ TTS 생성 실패 (${retryCount + 1}/${maxRetries + 1}), ${Math.round(backoffDelay/1000)}초 후 재시도... 오류: ${errorMessage}`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        return this.generateSingleTTS(text, speakerType, language, retryCount + 1, maxRetries);
      }
      
      // 최종 실패 시 Circuit Breaker 실패 처리
      this.onCircuitBreakerFailure();
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Supabase 업로드 (폴더 생성 포함)
   */
  private static async uploadToSupabase(
    audioBuffer: Buffer,
    folderPath: string,
    fileName: string
  ): Promise<{
    success: boolean;
    publicUrl?: string;
    error?: string;
  }> {
    
    try {
      const filePath = `${folderPath}/${fileName}`;
      console.log(`📤 Supabase 업로드 시도:`, {
        filePath,
        bufferSize: audioBuffer.length,
        bucketName: 'audio'
      });
      
      // 간단한 접근: 직접 업로드 (Supabase가 자동으로 폴더 생성)
      console.log(`📁 직접 업로드 시도:`, { filePath });
      
      // 실제 파일 업로드 (타임아웃 추가)
      console.log(`⏰ 업로드 시작: ${filePath}`);
      
      const uploadPromise = this.supabase.storage
        .from('audio')
        .upload(filePath, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true // 기존 파일이 있으면 덮어쓰기
        });

      // 30초 타임아웃 설정
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('업로드 타임아웃 (60초)')), 60000);
      });

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      console.log(`📝 업로드 응답:`, {
        filePath,
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message
      });

      if (error) {
        console.error(`❌ Supabase 업로드 오류:`, {
          filePath,
          error: error.message,
          errorDetails: error
        });
        throw error;
      }

      console.log(`✅ Supabase 업로드 성공:`, {
        filePath,
        uploadData: data
      });

      // Public URL 생성
      const { data: urlData } = this.supabase.storage
        .from('audio')
        .getPublicUrl(filePath);

      console.log(`🔗 Public URL 생성:`, {
        filePath,
        publicUrl: urlData.publicUrl
      });

      return {
        success: true,
        publicUrl: urlData.publicUrl
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Supabase 업로드 실패';
      console.error(`❌ Supabase 업로드 최종 실패:`, {
        filePath: `${folderPath}/${fileName}`,
        error: errorMessage,
        fullError: error
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 위치명을 Gemini 2.5 Flash-Lite로 영어 폴더명으로 변환
   */
  private static async sanitizeLocationName(locationName: string): Promise<string> {
    try {
      // 캐시용 키 (동일한 장소명에 대해 재번역 방지)
      const cacheKey = `location_en_${locationName}`;
      
      // 간단한 메모리 캐시 확인
      if (this.locationCache && this.locationCache[cacheKey]) {
        return this.locationCache[cacheKey];
      }
      
      console.log(`🌏 "${locationName}" 영문명 변환 중...`);
      
      // Gemini 2.5 Flash-Lite로 영문명 생성
      const model = getDefaultGeminiModel();
      const prompt = `
장소명을 폴더명에 적합한 영어로 변환하세요:

입력: "${locationName}"

규칙:
1. 정확한 영어 장소명으로 번역
2. 소문자만 사용
3. 공백은 하이픈(-)으로 변경
4. 특수문자 제거 (하이픈과 숫자만 허용)
5. 폴더명으로 사용 가능한 형태

예시:
- 대영박물관 → british-museum
- 에펠탑 → eiffel-tower  
- 국립중앙박물관 → national-museum-korea

오직 변환된 영어 폴더명만 출력하세요:`;

      const result = await model.generateContent(prompt);
      let englishName = result.response.text().trim().toLowerCase();
      
      // 안전성 검증 및 정리
      englishName = englishName
        .replace(/[^a-zA-Z0-9\-]/g, '') // 허용된 문자만
        .replace(/--+/g, '-') // 연속 하이픈 제거
        .replace(/^-+|-+$/g, '') // 앞뒤 하이픈 제거
        .substring(0, 50); // 길이 제한
      
      // 빈 결과나 너무 짧은 경우 기본값 사용
      if (!englishName || englishName.length < 2) {
        console.warn(`⚠️ Gemini 번역 실패, 기본값 사용: ${locationName}`);
        englishName = 'location-' + Date.now().toString(36);
      }
      
      // 캐시에 저장
      if (!this.locationCache) this.locationCache = {};
      this.locationCache[cacheKey] = englishName;
      
      console.log(`✅ 영문명 변환 완료: "${locationName}" → "${englishName}"`);
      return englishName;
      
    } catch (error) {
      console.error(`❌ 영문명 변환 실패 (${locationName}):`, error);
      
      // 실패시 기본 변환 로직
      const fallback = locationName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase() || 'location-' + Date.now().toString(36);
        
      console.log(`🔄 기본 변환 사용: "${locationName}" → "${fallback}"`);
      return fallback;
    }
  }

  // 위치명 캐시 (메모리)
  private static locationCache: { [key: string]: string } = {};

  /**
   * 세그먼트 DB 레코드 생성
   */
  private static async createSegmentRecords(
    episodeId: string,
    segmentFiles: GeneratedSegmentFile[]
  ): Promise<{
    success: boolean;
    insertedCount: number;
    error?: string;
  }> {
    try {
      const segmentRecords = segmentFiles.map(file => {
        // 파일명에서 챕터 정보 추출 (예: 1-1ko.mp3 → chapter: 1, segment: 1)
        const match = file.fileName.match(/^(\d+)-(\d+)ko\.mp3$/);
        const chapterNumber = match ? parseInt(match[1]) : 1;
        const segmentInChapter = match ? parseInt(match[2]) : file.sequenceNumber;
        const rawUrl = file.supabaseUrl || file.filePath || '';
        const normalizedUrl = rawUrl && !rawUrl.startsWith('http')
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/${rawUrl.replace(/^\/?/, '')}`
          : rawUrl;

        return {
          episode_id: episodeId,
          sequence_number: file.sequenceNumber,
          speaker_type: file.speakerType,
          speaker_name: file.speakerType === 'male' ? 'Host' : 'Curator',
          text_content: file.textContent || `[챕터${chapterNumber}] 세그먼트 ${segmentInChapter}`,
          audio_url: normalizedUrl || null,
          file_size_bytes: file.fileSize,
          duration_seconds: Math.round(file.duration),
          chapter_index: file.metadata?.chapterIndex || chapterNumber
        };
      });

      console.log(`📊 생성할 세그먼트 레코드: ${segmentRecords.length}개`);
      
      // 배치 삽입
      const batchSize = 20;
      let insertedCount = 0;
      
      for (let i = 0; i < segmentRecords.length; i += batchSize) {
        const batch = segmentRecords.slice(i, i + batchSize);
        
        const { error } = await this.supabase
          .from('podcast_segments')
          .insert(batch);
        
        if (error) {
          console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 삽입 실패:`, error);
          throw error;
        } else {
          insertedCount += batch.length;
          console.log(`✅ 배치 ${Math.floor(i/batchSize) + 1} 삽입 성공: ${batch.length}개`);
        }
        
        // API 제한 고려 딜레이
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return {
        success: true,
        insertedCount
      };
      
    } catch (error) {
      console.error('❌ 세그먼트 DB 레코드 생성 실패:', error);
      return {
        success: false,
        insertedCount: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }

  /**
   * 생성된 세그먼트 파일들 검증
   */
  static validateGeneratedFiles(segmentFiles: GeneratedSegmentFile[]): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // 순서 확인
    segmentFiles.forEach((file, index) => {
      if (file.sequenceNumber !== index + 1) {
        issues.push(`순서 불일치: ${file.sequenceNumber} (예상: ${index + 1})`);
      }
    });
    
    // 파일 크기 확인
    const smallFiles = segmentFiles.filter(f => f.fileSize < 1000); // 1KB 미만
    if (smallFiles.length > 0) {
      issues.push(`너무 작은 파일: ${smallFiles.map(f => f.fileName).join(', ')}`);
    }
    
    // URL 확인
    const missingUrls = segmentFiles.filter(f => !f.supabaseUrl);
    if (missingUrls.length > 0) {
      issues.push(`URL 누락: ${missingUrls.map(f => f.fileName).join(', ')}`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export default SequentialTTSGenerator;

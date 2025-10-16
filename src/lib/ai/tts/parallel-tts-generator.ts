/**
 * 병렬 TTS 생성기
 * 세그먼트별 병렬 처리로 TTS 성능 최적화
 */

import { DialogueSegment } from './sequential-dialogue-processor';

interface ParallelTTSConfig {
  maxConcurrency: number;        // 최대 동시 처리 수 (기본: 4)
  chunkSize: number;            // 배치 크기 (기본: 8)
  retryAttempts: number;        // 재시도 횟수 (기본: 2)
  timeoutMs: number;           // 개별 TTS 타임아웃 (기본: 30초)
  enablePriority: boolean;      // 우선순위 처리 활성화
}

interface TTSJob {
  segment: DialogueSegment;
  priority: number;             // 낮을수록 높은 우선순위
  retryCount: number;
  startTime?: number;
}

interface ParallelTTSResult {
  success: boolean;
  segmentFiles: {
    sequenceNumber: number;
    speakerType: string;
    filePath: string;
    duration: number;
    fileSize: number;
    processingTime: number;
  }[];
  statistics: {
    totalProcessingTime: number;
    averageSegmentTime: number;
    maxConcurrencyUsed: number;
    failureRate: number;
    throughput: number;      // 세그먼트/초
  };
  errors: string[];
}

export class ParallelTTSGenerator {
  private config: ParallelTTSConfig;
  private activeJobs: Set<Promise<any>>;
  private completedJobs: number;
  private totalJobs: number;

  constructor(config?: Partial<ParallelTTSConfig>) {
    this.config = {
      maxConcurrency: 4,
      chunkSize: 8,
      retryAttempts: 2,
      timeoutMs: 30000,
      enablePriority: true,
      ...config
    };
    this.activeJobs = new Set();
    this.completedJobs = 0;
    this.totalJobs = 0;
  }

  /**
   * 병렬 TTS 생성 메인 함수
   */
  async generateParallelTTS(
    segments: DialogueSegment[],
    locationName: string,
    episodeId: string,
    language: string
  ): Promise<ParallelTTSResult> {
    
    const startTime = Date.now();
    console.log(`🚀 병렬 TTS 생성 시작: ${segments.length}개 세그먼트, 동시성: ${this.config.maxConcurrency}`);

    this.totalJobs = segments.length;
    this.completedJobs = 0;

    // 작업 큐 생성 (우선순위 기반)
    const jobs: TTSJob[] = segments.map((segment, index) => ({
      segment,
      priority: this.calculatePriority(segment, index),
      retryCount: 0
    }));

    // 우선순위 정렬
    if (this.config.enablePriority) {
      jobs.sort((a, b) => a.priority - b.priority);
    }

    const results: any[] = [];
    const errors: string[] = [];
    let maxConcurrencyUsed = 0;

    // 배치별 처리
    for (let i = 0; i < jobs.length; i += this.config.chunkSize) {
      const batch = jobs.slice(i, i + this.config.chunkSize);
      
      console.log(`📦 배치 ${Math.floor(i / this.config.chunkSize) + 1}/${Math.ceil(jobs.length / this.config.chunkSize)} 처리: ${batch.length}개 세그먼트`);

      const batchResults = await this.processBatch(
        batch, 
        locationName, 
        episodeId, 
        language
      );

      maxConcurrencyUsed = Math.max(maxConcurrencyUsed, Math.min(batch.length, this.config.maxConcurrency));
      
      // 결과 병합
      results.push(...batchResults.successes);
      errors.push(...batchResults.errors);

      // 진행률 로깅
      this.completedJobs += batch.length;
      const progress = Math.round((this.completedJobs / this.totalJobs) * 100);
      console.log(`⏳ 진행률: ${progress}% (${this.completedJobs}/${this.totalJobs})`);
    }

    const totalTime = Date.now() - startTime;
    const statistics = {
      totalProcessingTime: totalTime,
      averageSegmentTime: results.length > 0 ? totalTime / results.length : 0,
      maxConcurrencyUsed,
      failureRate: errors.length / this.totalJobs,
      throughput: (results.length / totalTime) * 1000 // 세그먼트/초
    };

    console.log(`🎉 병렬 TTS 생성 완료:`, {
      성공: results.length,
      실패: errors.length,
      총_시간: `${totalTime}ms`,
      처리량: `${statistics.throughput.toFixed(2)} 세그먼트/초`,
      최대_동시성: maxConcurrencyUsed
    });

    return {
      success: errors.length < this.totalJobs * 0.1, // 90% 이상 성공시 성공으로 간주
      segmentFiles: results.sort((a, b) => a.sequenceNumber - b.sequenceNumber),
      statistics,
      errors
    };
  }

  /**
   * 배치 처리
   */
  private async processBatch(
    jobs: TTSJob[],
    locationName: string,
    episodeId: string,
    language: string
  ): Promise<{ successes: any[]; errors: string[] }> {
    
    const successes: any[] = [];
    const errors: string[] = [];
    
    // 세마포어를 이용한 동시성 제어
    const semaphore = new Array(this.config.maxConcurrency).fill(null).map(() => Promise.resolve());
    let semaphoreIndex = 0;

    const jobPromises = jobs.map(async (job) => {
      // 세마포어 획득
      const currentSemaphore = semaphoreIndex % this.config.maxConcurrency;
      semaphoreIndex++;
      
      await semaphore[currentSemaphore];
      
      try {
        const result = await this.processSingleSegment(
          job,
          locationName,
          episodeId,
          language
        );
        
        semaphore[currentSemaphore] = Promise.resolve();
        return { success: true, result };
        
      } catch (error) {
        semaphore[currentSemaphore] = Promise.resolve();
        return { 
          success: false, 
          error: `세그먼트 ${job.segment.sequenceNumber}: ${error instanceof Error ? error.message : String(error)}` 
        };
      }
    });

    const results = await Promise.allSettled(jobPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          successes.push(result.value.result);
        } else {
          errors.push(result.value.error || 'Unknown error');
        }
      } else {
        errors.push(`배치 처리 실패: ${result.reason}`);
      }
    });

    return { successes, errors };
  }

  /**
   * 개별 세그먼트 처리
   */
  private async processSingleSegment(
    job: TTSJob,
    locationName: string,
    episodeId: string,
    language: string
  ): Promise<any> {
    
    const segmentStartTime = Date.now();
    job.startTime = segmentStartTime;
    
    try {
      // 타임아웃 설정
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TTS 생성 시간 초과')), this.config.timeoutMs);
      });

      // 실제 TTS 생성 (기존 TTS 시스템 사용)
      const ttsPromise = this.generateSingleTTS(
        job.segment,
        locationName,
        episodeId,
        language
      );

      const result = await Promise.race([ttsPromise, timeoutPromise]);
      const processingTime = Date.now() - segmentStartTime;

      console.log(`✅ 세그먼트 ${job.segment.sequenceNumber} 완료: ${processingTime}ms`);

      return {
        sequenceNumber: job.segment.sequenceNumber,
        speakerType: job.segment.speakerType,
        filePath: (result as any).filePath,
        duration: (result as any).duration || 0,
        fileSize: (result as any).fileSize || 0,
        processingTime
      };

    } catch (error) {
      // 재시도 로직
      if (job.retryCount < this.config.retryAttempts) {
        job.retryCount++;
        console.log(`🔄 세그먼트 ${job.segment.sequenceNumber} 재시도 ${job.retryCount}/${this.config.retryAttempts}`);
        return this.processSingleSegment(job, locationName, episodeId, language);
      }

      console.error(`❌ 세그먼트 ${job.segment.sequenceNumber} 최종 실패:`, error);
      throw error;
    }
  }

  /**
   * 단일 TTS 생성 (기존 시스템과 연동)
   */
  private async generateSingleTTS(
    segment: DialogueSegment,
    locationName: string,
    episodeId: string,
    language: string
  ): Promise<any> {
    // 여기서 기존의 Google Cloud TTS API 호출
    // 실제 구현에서는 기존 TTS 생성기와 연동
    
    // 임시 구현 - 실제로는 TTS API 호출
    return {
      filePath: `/audio/${episodeId}/segment_${segment.sequenceNumber}.mp3`,
      duration: Math.max(15, Math.min(45, Math.ceil(segment.textContent.length / 8))),
      fileSize: segment.textContent.length * 100 // 대략적인 파일 크기
    };
  }

  /**
   * 우선순위 계산
   * 짧은 세그먼트를 먼저 처리하여 전체 완료 시간 최적화
   */
  private calculatePriority(segment: DialogueSegment, index: number): number {
    if (!this.config.enablePriority) return index;
    
    // 짧은 텍스트 = 높은 우선순위 (낮은 숫자)
    // 앞선 순서 = 높은 우선순위
    const textLengthWeight = segment.textContent.length / 100;
    const sequenceWeight = index / 10;
    
    return textLengthWeight + sequenceWeight;
  }

  /**
   * 실시간 진행률 조회
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    const percentage = this.totalJobs > 0 ? Math.round((this.completedJobs / this.totalJobs) * 100) : 0;
    return {
      completed: this.completedJobs,
      total: this.totalJobs,
      percentage
    };
  }
}

export default ParallelTTSGenerator;
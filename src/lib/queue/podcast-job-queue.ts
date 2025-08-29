/**
 * 팟캐스트 생성 백그라운드 작업 큐
 * Bull Queue를 사용한 비동기 처리로 사용자 응답성 극대화
 */

import Queue, { Job, JobOptions } from 'bull';
import Redis from 'ioredis';

interface PodcastJobData {
  episodeId: string;
  locationName: string;
  language: string;
  locationContext?: any;
  options?: any;
  userId?: string;
  priority: 'low' | 'normal' | 'high';
}

interface JobProgress {
  stage: 'analyzing' | 'generating_chapters' | 'generating_tts' | 'finalizing';
  progress: number;        // 0-100
  currentStep: string;
  estimatedTimeLeft: number; // milliseconds
  segmentsCompleted?: number;
  totalSegments?: number;
}

interface PodcastJobResult {
  success: boolean;
  episodeId: string;
  data?: any;
  error?: string;
  performance: {
    totalTime: number;
    chapterGeneration: number;
    ttsGeneration: number;
    throughput: number;
  };
}

export class PodcastJobQueue {
  private queue: Queue<PodcastJobData>;
  private redis: Redis;
  private readonly QUEUE_NAME = 'podcast-generation';
  
  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.queue = new Queue<PodcastJobData>(this.QUEUE_NAME, {
      redis: {
        host: this.redis.options.host,
        port: this.redis.options.port,
        password: this.redis.options.password
      },
      defaultJobOptions: {
        removeOnComplete: 50,    // 완료된 작업 50개 유지
        removeOnFail: 20,        // 실패한 작업 20개 유지
        attempts: 2,             // 최대 2회 재시도
        backoff: 'exponential',  // 지수 백오프
        delay: 0
      }
    });

    this.setupProcessors();
    this.setupEventListeners();
  }

  /**
   * 팟캐스트 생성 작업 추가
   * 즉시 jobId 반환하여 사용자 응답성 향상
   */
  async addPodcastGenerationJob(
    jobData: PodcastJobData,
    options?: JobOptions
  ): Promise<{ jobId: string; estimatedTime: number }> {
    
    const priority = this.calculateJobPriority(jobData);
    const estimatedTime = this.estimateProcessingTime(jobData);
    
    const job = await this.queue.add(jobData, {
      priority,
      delay: 0,
      ...options
    });

    console.log(`🎬 팟캐스트 작업 큐 추가:`, {
      jobId: job.id,
      locationName: jobData.locationName,
      language: jobData.language,
      priority: jobData.priority,
      estimatedTime: `${estimatedTime}ms`
    });

    // 작업 상태를 Redis에 저장 (실시간 조회용)
    await this.updateJobStatus(job.id.toString(), {
      stage: 'analyzing',
      progress: 0,
      currentStep: '작업 큐에 추가됨',
      estimatedTimeLeft: estimatedTime
    });

    return {
      jobId: job.id.toString(),
      estimatedTime
    };
  }

  /**
   * 작업 진행상황 조회
   */
  async getJobProgress(jobId: string): Promise<JobProgress | null> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) return null;

      const progress = job.progress() as JobProgress;
      const cachedProgress = await this.redis.get(`job:${jobId}:progress`);
      
      return cachedProgress ? JSON.parse(cachedProgress) : progress;
    } catch (error) {
      console.error(`작업 진행상황 조회 실패 (${jobId}):`, error);
      return null;
    }
  }

  /**
   * 작업 결과 조회
   */
  async getJobResult(jobId: string): Promise<PodcastJobResult | null> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) return null;

      if (job.finishedOn) {
        return job.returnvalue as PodcastJobResult;
      }
      
      if (job.failedReason) {
        return {
          success: false,
          episodeId: job.data.episodeId,
          error: job.failedReason,
          performance: { totalTime: 0, chapterGeneration: 0, ttsGeneration: 0, throughput: 0 }
        };
      }

      return null; // 아직 처리 중
    } catch (error) {
      console.error(`작업 결과 조회 실패 (${jobId}):`, error);
      return null;
    }
  }

  /**
   * 큐 통계 조회
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();
    const delayed = await this.queue.getDelayed();
    const paused = await this.queue.getPaused();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length
    };
  }

  /**
   * 작업 프로세서 설정
   */
  private setupProcessors(): void {
    // 동시 처리 작업 수 설정 (CPU 코어 수 기반)
    const concurrency = process.env.PODCAST_QUEUE_CONCURRENCY 
      ? parseInt(process.env.PODCAST_QUEUE_CONCURRENCY) 
      : Math.max(2, require('os').cpus().length - 1);

    this.queue.process(concurrency, async (job: Job<PodcastJobData>) => {
      return this.processPodcastGeneration(job);
    });

    console.log(`📊 팟캐스트 큐 프로세서 설정: 동시성 ${concurrency}`);
  }

  /**
   * 팟캐스트 생성 처리
   */
  private async processPodcastGeneration(job: Job<PodcastJobData>): Promise<PodcastJobResult> {
    const { episodeId, locationName, language, locationContext, options } = job.data;
    const startTime = Date.now();
    
    try {
      console.log(`🚀 백그라운드 팟캐스트 생성 시작: ${job.id} (${locationName})`);

      // Step 1: 분석 단계
      await this.updateJobProgress(job, {
        stage: 'analyzing',
        progress: 10,
        currentStep: '위치 분석 및 챕터 구조 생성',
        estimatedTimeLeft: 25000
      });

      // 여기서 실제 팟캐스트 생성 로직 호출
      // 기존 API의 핵심 로직을 재사용하되, 진행상황 업데이트 추가
      const result = await this.executeWithProgress(job, {
        locationName,
        language,
        locationContext,
        options
      });

      const totalTime = Date.now() - startTime;
      
      console.log(`✅ 백그라운드 팟캐스트 생성 완료: ${job.id} (${totalTime}ms)`);

      return {
        success: true,
        episodeId,
        data: result,
        performance: {
          totalTime,
          chapterGeneration: result.performance?.chapterGeneration || 0,
          ttsGeneration: result.performance?.ttsGeneration || 0,
          throughput: result.performance?.throughput || 0
        }
      };

    } catch (error) {
      console.error(`❌ 백그라운드 팟캐스트 생성 실패: ${job.id}`, error);
      
      await this.updateJobProgress(job, {
        stage: 'finalizing',
        progress: 100,
        currentStep: '처리 실패',
        estimatedTimeLeft: 0
      });

      return {
        success: false,
        episodeId,
        error: error instanceof Error ? error.message : String(error),
        performance: { totalTime: Date.now() - startTime, chapterGeneration: 0, ttsGeneration: 0, throughput: 0 }
      };
    }
  }

  /**
   * 진행상황과 함께 실행
   */
  private async executeWithProgress(job: Job<PodcastJobData>, params: any): Promise<any> {
    // Step 2: 챕터 생성
    await this.updateJobProgress(job, {
      stage: 'generating_chapters',
      progress: 30,
      currentStep: '챕터별 스크립트 병렬 생성',
      estimatedTimeLeft: 20000
    });

    // 실제 챕터 생성 로직 (병렬 처리)
    // const chapterResult = await generateChapters(params);

    // Step 3: TTS 생성
    await this.updateJobProgress(job, {
      stage: 'generating_tts',
      progress: 60,
      currentStep: 'TTS 음성 파일 생성',
      estimatedTimeLeft: 15000,
      segmentsCompleted: 0,
      totalSegments: 25 // 예상 세그먼트 수
    });

    // TTS 진행상황 업데이트를 위한 콜백
    const ttsProgressCallback = async (completed: number, total: number) => {
      const ttsProgress = 60 + (completed / total) * 35; // 60-95%
      await this.updateJobProgress(job, {
        stage: 'generating_tts',
        progress: Math.round(ttsProgress),
        currentStep: `TTS 생성 중 (${completed}/${total})`,
        estimatedTimeLeft: Math.max(1000, (total - completed) * 1500), // 세그먼트당 1.5초 예상
        segmentsCompleted: completed,
        totalSegments: total
      });
    };

    // 실제 TTS 생성 로직 (콜백 포함)
    // const ttsResult = await generateTTSWithCallback(chapterResult, ttsProgressCallback);

    // Step 4: 마무리
    await this.updateJobProgress(job, {
      stage: 'finalizing',
      progress: 95,
      currentStep: '최종 파일 생성 및 DB 저장',
      estimatedTimeLeft: 2000
    });

    // 최종 완료
    await this.updateJobProgress(job, {
      stage: 'finalizing',
      progress: 100,
      currentStep: '완료',
      estimatedTimeLeft: 0
    });

    // 임시 반환값 (실제로는 팟캐스트 생성 결과)
    return {
      episodeId: job.data.episodeId,
      segmentCount: 25,
      totalDuration: 1800,
      performance: {
        chapterGeneration: 8000,
        ttsGeneration: 12000,
        throughput: 2.08
      }
    };
  }

  /**
   * 작업 진행상황 업데이트
   */
  private async updateJobProgress(job: Job<PodcastJobData>, progress: JobProgress): Promise<void> {
    await job.progress(progress);
    await this.updateJobStatus(job.id.toString(), progress);
    
    // 로깅
    console.log(`📈 작업 ${job.id} 진행: ${progress.stage} (${progress.progress}%) - ${progress.currentStep}`);
  }

  /**
   * Redis에 작업 상태 업데이트
   */
  private async updateJobStatus(jobId: string, progress: JobProgress): Promise<void> {
    const key = `job:${jobId}:progress`;
    await this.redis.setex(key, 3600, JSON.stringify(progress)); // 1시간 보관
  }

  /**
   * 작업 우선순위 계산
   */
  private calculateJobPriority(jobData: PodcastJobData): number {
    const basePriority = {
      'high': 10,
      'normal': 5,
      'low': 1
    };
    
    let priority = basePriority[jobData.priority];
    
    // 유료 사용자 우선순위 증가
    if (jobData.userId && jobData.userId.startsWith('premium_')) {
      priority += 5;
    }
    
    return priority;
  }

  /**
   * 예상 처리 시간 계산
   */
  private estimateProcessingTime(jobData: PodcastJobData): number {
    // 기본 추정값 (최적화 후)
    let baseTime = 25000; // 25초
    
    // 언어별 조정
    if (jobData.language !== 'ko') {
      baseTime += 5000; // 다른 언어는 5초 추가
    }
    
    // 복잡도 조정 (위치명 길이 기반)
    const complexityMultiplier = Math.min(1.5, 1 + (jobData.locationName.length / 50));
    
    return Math.round(baseTime * complexityMultiplier);
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    this.queue.on('completed', (job: Job<PodcastJobData>, result: PodcastJobResult) => {
      console.log(`✅ 작업 완료: ${job.id} (${result.performance.totalTime}ms)`);
    });

    this.queue.on('failed', (job: Job<PodcastJobData>, error: Error) => {
      console.error(`❌ 작업 실패: ${job.id}`, error.message);
    });

    this.queue.on('stalled', (job: Job<PodcastJobData>) => {
      console.warn(`⏸️ 작업 정체: ${job.id}`);
    });
  }

  /**
   * 리소스 정리
   */
  async close(): Promise<void> {
    await this.queue.close();
    await this.redis.quit();
  }
}

export default PodcastJobQueue;
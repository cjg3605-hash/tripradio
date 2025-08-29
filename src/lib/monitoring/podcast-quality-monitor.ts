/**
 * 팟캐스트 생성 품질 모니터링 시스템
 * 실시간 품질 추적 및 성능 지표 수집
 */

import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

export interface QualityMetrics {
  episodeId: string;
  locationName: string;
  language: string;
  
  // 성능 지표
  totalGenerationTime: number;  // 전체 생성 시간 (ms)
  chapterGenerationTime: number;  // 챕터 생성 시간 (ms)
  ttsGenerationTime: number;      // TTS 생성 시간 (ms)
  dbOperationTime: number;        // DB 작업 시간 (ms)
  
  // 처리량 지표
  segmentCount: number;
  throughput: number;  // 세그먼트/초
  
  // 품질 지표
  successRate: number;  // 성공률 (0-1)
  errorRate: number;    // 에러율 (0-1)
  retryCount: number;   // 재시도 횟수
  
  // 메모리 사용량
  peakMemoryUsage: number;  // 최대 메모리 사용량 (MB)
  avgMemoryUsage: number;   // 평균 메모리 사용량 (MB)
  
  // 품질 점수
  overallQualityScore: number;  // 전체 품질 점수 (0-100)
  audioQualityScore: number;    // 오디오 품질 점수 (0-100)
  contentQualityScore: number;  // 내용 품질 점수 (0-100)
  
  // 사용자 경험 지표
  timeToFirstSegment: number;   // 첫 세그먼트까지 시간 (ms)
  userSatisfactionScore?: number; // 사용자 만족도 (선택적)
  
  // 타임스탬프
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertThresholds {
  maxGenerationTime: number;     // 최대 생성 시간 (ms)
  minThroughput: number;         // 최소 처리량 (세그먼트/초)
  maxErrorRate: number;          // 최대 에러율
  minQualityScore: number;       // 최소 품질 점수
  maxMemoryUsage: number;        // 최대 메모리 사용량 (MB)
}

export class PodcastQualityMonitor {
  private static instance: PodcastQualityMonitor;
  private supabase: any;
  private metrics: Map<string, Partial<QualityMetrics>> = new Map();
  private alertThresholds: AlertThresholds;
  
  // 성능 기준선 (79초에서 30초로 개선 목표)
  private static PERFORMANCE_BASELINES = {
    TARGET_GENERATION_TIME: 30000,  // 30초 목표
    PREVIOUS_GENERATION_TIME: 79000,  // 기존 79초
    MIN_THROUGHPUT: 0.5,  // 최소 0.5 세그먼트/초
    TARGET_QUALITY_SCORE: 85,  // 목표 품질 점수
    MAX_MEMORY_USAGE: 512,  // 최대 512MB
    MAX_ERROR_RATE: 0.02  // 최대 2% 에러율
  };

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    this.alertThresholds = {
      maxGenerationTime: 60000,  // 1분
      minThroughput: 0.3,        // 0.3 세그먼트/초
      maxErrorRate: 0.05,        // 5% 에러율
      minQualityScore: 75,       // 최소 75점
      maxMemoryUsage: 768        // 768MB
    };
  }

  static getInstance(): PodcastQualityMonitor {
    if (!PodcastQualityMonitor.instance) {
      PodcastQualityMonitor.instance = new PodcastQualityMonitor();
    }
    return PodcastQualityMonitor.instance;
  }

  /**
   * 생성 시작 추적
   */
  startTracking(episodeId: string, locationName: string, language: string): void {
    const metrics: Partial<QualityMetrics> = {
      episodeId,
      locationName,
      language,
      createdAt: new Date(),
      retryCount: 0,
      peakMemoryUsage: 0,
      avgMemoryUsage: 0
    };
    
    this.metrics.set(episodeId, metrics);
    
    // 메모리 모니터링 시작
    this.startMemoryMonitoring(episodeId);
    
    console.log(`📊 품질 모니터링 시작: ${episodeId} (${locationName})`);
  }

  /**
   * 성능 지표 업데이트
   */
  updateMetrics(episodeId: string, updates: Partial<QualityMetrics>): void {
    const existing = this.metrics.get(episodeId) || {};
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    
    this.metrics.set(episodeId, updated);
    
    // 실시간 경고 체크
    this.checkAlerts(updated as QualityMetrics);
  }

  /**
   * 생성 완료 및 최종 지표 저장
   */
  async finishTracking(episodeId: string, success: boolean, errorMessage?: string): Promise<void> {
    const metrics = this.metrics.get(episodeId);
    if (!metrics) {
      console.warn(`메트릭을 찾을 수 없음: ${episodeId}`);
      return;
    }

    // 최종 계산
    const finalMetrics: QualityMetrics = {
      ...metrics,
      successRate: success ? 1 : 0,
      errorRate: success ? 0 : 1,
      overallQualityScore: this.calculateOverallQualityScore(metrics, success),
      updatedAt: new Date()
    } as QualityMetrics;

    // DB에 저장
    await this.saveMetricsToDatabase(finalMetrics, errorMessage);
    
    // 성능 리포트 생성
    this.generatePerformanceReport(finalMetrics);
    
    // 메모리에서 제거
    this.metrics.delete(episodeId);
    
    console.log(`📊 품질 모니터링 완료: ${episodeId} (성공: ${success})`);
  }

  /**
   * 메모리 사용량 모니터링
   */
  private startMemoryMonitoring(episodeId: string): void {
    const interval = setInterval(() => {
      const metrics = this.metrics.get(episodeId);
      if (!metrics) {
        clearInterval(interval);
        return;
      }

      const memUsage = process.memoryUsage();
      const currentUsageMB = memUsage.heapUsed / 1024 / 1024;
      
      metrics.peakMemoryUsage = Math.max(metrics.peakMemoryUsage || 0, currentUsageMB);
      metrics.avgMemoryUsage = ((metrics.avgMemoryUsage || 0) + currentUsageMB) / 2;
      
      // 메모리 경고 체크
      if (currentUsageMB > this.alertThresholds.maxMemoryUsage) {
        console.warn(`⚠️ 높은 메모리 사용량: ${currentUsageMB.toFixed(1)}MB (${episodeId})`);
      }
    }, 5000);

    // 30분 후 자동 정리
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  }

  /**
   * 실시간 경고 체크
   */
  private checkAlerts(metrics: QualityMetrics): void {
    const alerts: string[] = [];

    if (metrics.totalGenerationTime > this.alertThresholds.maxGenerationTime) {
      alerts.push(`생성 시간 초과: ${metrics.totalGenerationTime}ms`);
    }

    if (metrics.throughput < this.alertThresholds.minThroughput) {
      alerts.push(`처리량 부족: ${metrics.throughput} 세그먼트/초`);
    }

    if (metrics.errorRate > this.alertThresholds.maxErrorRate) {
      alerts.push(`에러율 초과: ${(metrics.errorRate * 100).toFixed(1)}%`);
    }

    if (metrics.overallQualityScore < this.alertThresholds.minQualityScore) {
      alerts.push(`품질 점수 미달: ${metrics.overallQualityScore}점`);
    }

    if (alerts.length > 0) {
      console.warn(`🚨 품질 경고 (${metrics.episodeId}):`, alerts);
      this.sendAlert(metrics, alerts);
    }
  }

  /**
   * 전체 품질 점수 계산
   */
  private calculateOverallQualityScore(metrics: Partial<QualityMetrics>, success: boolean): number {
    if (!success) return 0;

    let score = 100;

    // 성능 점수 (40%)
    const performanceScore = this.calculatePerformanceScore(metrics);
    score = score * 0.4 + performanceScore * 0.4;

    // 처리량 점수 (30%)
    const throughputScore = Math.min(100, (metrics.throughput || 0) / 1.0 * 100);
    score = score * 0.7 + throughputScore * 0.3;

    // 메모리 효율성 점수 (20%)
    const memoryScore = Math.max(0, 100 - (metrics.peakMemoryUsage || 0) / 10);
    score = score * 0.8 + memoryScore * 0.2;

    // 안정성 점수 (10%)
    const stabilityScore = Math.max(0, 100 - (metrics.retryCount || 0) * 10);
    score = score * 0.9 + stabilityScore * 0.1;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * 성능 점수 계산
   */
  private calculatePerformanceScore(metrics: Partial<QualityMetrics>): number {
    const totalTime = metrics.totalGenerationTime || Number.MAX_SAFE_INTEGER;
    const targetTime = PodcastQualityMonitor.PERFORMANCE_BASELINES.TARGET_GENERATION_TIME;
    const previousTime = PodcastQualityMonitor.PERFORMANCE_BASELINES.PREVIOUS_GENERATION_TIME;

    if (totalTime <= targetTime) {
      return 100;
    } else if (totalTime <= previousTime) {
      // 30초~79초 사이는 선형적으로 점수 감소
      return 100 - ((totalTime - targetTime) / (previousTime - targetTime)) * 40;
    } else {
      // 79초 초과는 더 급격히 점수 감소
      return Math.max(0, 60 - ((totalTime - previousTime) / 1000));
    }
  }

  /**
   * DB에 메트릭 저장
   */
  private async saveMetricsToDatabase(metrics: QualityMetrics, errorMessage?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('podcast_quality_metrics')
        .upsert({
          episode_id: metrics.episodeId,
          location_name: metrics.locationName,
          language: metrics.language,
          total_generation_time: metrics.totalGenerationTime,
          chapter_generation_time: metrics.chapterGenerationTime,
          tts_generation_time: metrics.ttsGenerationTime,
          db_operation_time: metrics.dbOperationTime,
          segment_count: metrics.segmentCount,
          throughput: metrics.throughput,
          success_rate: metrics.successRate,
          error_rate: metrics.errorRate,
          retry_count: metrics.retryCount,
          peak_memory_usage: metrics.peakMemoryUsage,
          avg_memory_usage: metrics.avgMemoryUsage,
          overall_quality_score: metrics.overallQualityScore,
          audio_quality_score: metrics.audioQualityScore,
          content_quality_score: metrics.contentQualityScore,
          time_to_first_segment: metrics.timeToFirstSegment,
          user_satisfaction_score: metrics.userSatisfactionScore,
          error_message: errorMessage,
          created_at: metrics.createdAt.toISOString(),
          updated_at: metrics.updatedAt.toISOString()
        });

      if (error) {
        console.error('메트릭 저장 실패:', error);
      }
    } catch (error) {
      console.error('메트릭 DB 저장 오류:', error);
    }
  }

  /**
   * 성능 리포트 생성
   */
  private generatePerformanceReport(metrics: QualityMetrics): void {
    const improvement = this.calculateImprovement(metrics.totalGenerationTime);
    
    console.log('\n📊 성능 리포트');
    console.log('=====================================');
    console.log(`에피소드: ${metrics.episodeId}`);
    console.log(`위치: ${metrics.locationName} (${metrics.language})`);
    console.log(`총 생성시간: ${metrics.totalGenerationTime}ms`);
    console.log(`처리량: ${metrics.throughput?.toFixed(2)} 세그먼트/초`);
    console.log(`품질 점수: ${metrics.overallQualityScore}/100`);
    console.log(`메모리 사용량: ${metrics.peakMemoryUsage?.toFixed(1)}MB`);
    console.log(`성능 개선: ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`);
    console.log('=====================================\n');
  }

  /**
   * 성능 개선율 계산
   */
  private calculateImprovement(currentTime: number): number {
    const baseline = PodcastQualityMonitor.PERFORMANCE_BASELINES.PREVIOUS_GENERATION_TIME;
    return ((baseline - currentTime) / baseline) * 100;
  }

  /**
   * 경고 전송
   */
  private async sendAlert(metrics: QualityMetrics, alerts: string[]): Promise<void> {
    // 실제 환경에서는 Slack, Discord, 이메일 등으로 알림 전송
    console.error(`🚨 품질 경고 - ${metrics.episodeId}:`, alerts);
    
    // 예시: Webhook으로 알림 전송
    try {
      if (process.env.QUALITY_ALERT_WEBHOOK_URL) {
        await fetch(process.env.QUALITY_ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 팟캐스트 품질 경고\n에피소드: ${metrics.episodeId}\n위치: ${metrics.locationName}\n경고사항:\n${alerts.map(a => `• ${a}`).join('\n')}`
          })
        });
      }
    } catch (error) {
      console.error('경고 전송 실패:', error);
    }
  }

  /**
   * 품질 추세 분석
   */
  async analyzeQualityTrends(days: number = 7): Promise<{
    avgGenerationTime: number;
    avgQualityScore: number;
    successRate: number;
    trendDirection: 'improving' | 'declining' | 'stable';
    recommendations: string[];
  }> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: recentMetrics } = await this.supabase
      .from('podcast_quality_metrics')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    if (!recentMetrics || recentMetrics.length === 0) {
      return {
        avgGenerationTime: 0,
        avgQualityScore: 0,
        successRate: 0,
        trendDirection: 'stable',
        recommendations: ['데이터가 부족합니다']
      };
    }

    const avgGenerationTime = recentMetrics.reduce((sum, m) => sum + m.total_generation_time, 0) / recentMetrics.length;
    const avgQualityScore = recentMetrics.reduce((sum, m) => sum + m.overall_quality_score, 0) / recentMetrics.length;
    const successRate = recentMetrics.reduce((sum, m) => sum + m.success_rate, 0) / recentMetrics.length;

    // 추세 분석 (첫 절반 vs 둘째 절반 비교)
    const midPoint = Math.floor(recentMetrics.length / 2);
    const firstHalf = recentMetrics.slice(0, midPoint);
    const secondHalf = recentMetrics.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.overall_quality_score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.overall_quality_score, 0) / secondHalf.length;

    let trendDirection: 'improving' | 'declining' | 'stable';
    if (firstHalfAvg - secondHalfAvg > 5) {
      trendDirection = 'improving';
    } else if (secondHalfAvg - firstHalfAvg > 5) {
      trendDirection = 'declining';
    } else {
      trendDirection = 'stable';
    }

    // 개선 권장사항
    const recommendations: string[] = [];
    
    if (avgGenerationTime > 45000) {
      recommendations.push('생성 시간 최적화 필요 (병렬 처리 개선)');
    }
    
    if (avgQualityScore < 80) {
      recommendations.push('품질 점수 개선 필요 (콘텐츠 및 TTS 최적화)');
    }
    
    if (successRate < 0.95) {
      recommendations.push('안정성 개선 필요 (에러 처리 강화)');
    }

    return {
      avgGenerationTime,
      avgQualityScore,
      successRate,
      trendDirection,
      recommendations
    };
  }

  /**
   * 실시간 대시보드 데이터 제공
   */
  getRealTimeMetrics(): Array<Partial<QualityMetrics> & { episodeId: string }> {
    return Array.from(this.metrics.entries()).map(([episodeId, metrics]) => ({
      episodeId,
      ...metrics
    }));
  }
}

// 싱글톤 인스턴스 익스포트
export const qualityMonitor = PodcastQualityMonitor.getInstance();
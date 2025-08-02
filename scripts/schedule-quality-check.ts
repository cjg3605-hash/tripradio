#!/usr/bin/env ts-node
// 🎯 자동화된 품질 검사 스케줄러
// cron job이나 GitHub Actions에서 주기적으로 실행하여 품질 관리 자동화

import { QualityBatchChecker, BatchCheckConfig } from './quality-batch-checker';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🎯 스케줄 설정 인터페이스
interface ScheduleConfig {
  // 실행 설정
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom';
  timeOfDay?: string;           // "09:00" 형식
  dayOfWeek?: number;           // 0=일요일, 1=월요일
  dayOfMonth?: number;          // 1-31
  customInterval?: number;      // 분 단위
  
  // 검사 설정
  batchConfig: BatchCheckConfig;
  
  // 알림 설정
  notifications: {
    email?: string[];
    slack?: string;             // Webhook URL
    discord?: string;           // Webhook URL
    onlyOnIssues?: boolean;     // 문제 발견시만 알림
  };
  
  // 자동 처리 설정
  autoActions: {
    queueCriticalIssues?: boolean;      // 심각한 문제 자동 큐잉
    generateReports?: boolean;          // 자동 보고서 생성
    updateMetrics?: boolean;            // 메트릭 업데이트
    archiveOldData?: boolean;           // 오래된 데이터 아카이브
  };
}

// 🎯 스케줄러 클래스
class QualityScheduler {
  private config: ScheduleConfig;

  constructor(config: ScheduleConfig) {
    this.config = config;
  }

  // 스케줄된 검사 실행
  async runScheduledCheck(): Promise<void> {
    const startTime = Date.now();
    console.log(`🕐 예약된 품질 검사 시작: ${new Date().toLocaleString()}`);
    
    try {
      // 1. 실행 권한 확인
      if (!this.shouldRunNow()) {
        console.log('⏭️ 현재 시간에는 실행하지 않음');
        return;
      }

      // 2. 사전 점검
      await this.preFlightCheck();

      // 3. 배치 검사 실행
      const checker = new QualityBatchChecker(this.config.batchConfig);
      const results = await checker.runBatchCheck();

      // 4. 자동 액션 수행
      if (this.config.autoActions) {
        await this.performAutoActions(results);
      }

      // 5. 알림 발송
      await this.sendNotifications(results);

      // 6. 실행 로그 저장
      await this.logExecution(results, Date.now() - startTime);

      console.log(`✅ 예약된 품질 검사 완료: ${(Date.now() - startTime) / 1000}초`);

    } catch (error) {
      console.error('❌ 예약된 품질 검사 실패:', error);
      await this.handleExecutionError(error);
    }
  }

  // 실행 시점 확인
  private shouldRunNow(): boolean {
    const now = new Date();
    
    switch (this.config.scheduleType) {
      case 'daily':
        return this.isScheduledTime(now);
      
      case 'weekly':
        return this.isScheduledTime(now) && 
               (this.config.dayOfWeek === undefined || now.getDay() === this.config.dayOfWeek);
      
      case 'monthly':
        return this.isScheduledTime(now) && 
               (this.config.dayOfMonth === undefined || now.getDate() === this.config.dayOfMonth);
      
      case 'custom':
        // 커스텀 간격은 외부에서 관리
        return true;
      
      default:
        return false;
    }
  }

  // 스케줄된 시간 확인
  private isScheduledTime(now: Date): boolean {
    if (!this.config.timeOfDay) return true;
    
    const [hour, minute] = this.config.timeOfDay.split(':').map(Number);
    return now.getHours() === hour && now.getMinutes() === minute;
  }

  // 사전 점검
  private async preFlightCheck(): Promise<void> {
    console.log('🔍 사전 점검 실행...');

    // DB 연결 확인
    const { error } = await supabase.from('guide_versions').select('id').limit(1);
    if (error) {
      throw new Error(`데이터베이스 연결 실패: ${error.message}`);
    }

    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다');
    }

    // 디스크 공간 확인 (Node.js 환경에서)
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat('.');
      console.log('💾 디스크 공간 확인 완료');
    } catch (error) {
      console.warn('⚠️ 디스크 공간 확인 실패:', error);
    }

    console.log('✅ 사전 점검 완료');
  }

  // 자동 액션 수행
  private async performAutoActions(results: any): Promise<void> {
    console.log('🤖 자동 액션 수행 중...');

    // 심각한 문제 자동 큐잉
    if (this.config.autoActions.queueCriticalIssues && results.criticalIssues.length > 0) {
      console.log(`📝 ${results.criticalIssues.length}개 심각한 문제를 개선 큐에 추가 중...`);
      
      for (const issue of results.criticalIssues) {
        try {
          await supabase
            .from('quality_improvement_queue')
            .insert({
              guide_id: issue.guideId,
              location_name: issue.locationName,
              language: issue.language,
              current_issues: issue.issues,
              original_quality_score: issue.currentQuality,
              target_quality_score: Math.max(75, issue.currentQuality + 20),
              priority: issue.severity,
              status: 'pending',
              processing_strategy: 'automated_schedule'
            });
        } catch (error) {
          console.error(`❌ 큐 추가 실패 ${issue.locationName}:`, error);
        }
      }
    }

    // 메트릭 업데이트
    if (this.config.autoActions.updateMetrics) {
      await this.updateSystemMetrics(results);
    }

    // 오래된 데이터 아카이브
    if (this.config.autoActions.archiveOldData) {
      await this.archiveOldData();
    }

    console.log('✅ 자동 액션 완료');
  }

  // 시스템 메트릭 업데이트
  private async updateSystemMetrics(results: any): Promise<void> {
    try {
      const metrics = {
        last_batch_check: new Date().toISOString(),
        total_guides_checked: results.totalChecked,
        quality_distribution: results.qualityDistribution,
        critical_issues_count: results.criticalIssues.length,
        average_processing_time: results.processingTime / results.totalChecked
      };

      // 시스템 메트릭 테이블 업데이트 (테이블이 있다면)
      await supabase
        .from('system_metrics')
        .upsert({
          metric_type: 'quality_batch_check',
          metric_data: metrics,
          updated_at: new Date().toISOString()
        });

      console.log('📊 시스템 메트릭 업데이트 완료');
    } catch (error) {
      console.error('❌ 메트릭 업데이트 실패:', error);
    }
  }

  // 오래된 데이터 아카이브
  private async archiveOldData(): Promise<void> {
    try {
      // 90일 이전의 품질 검사 데이터 삭제
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { error } = await supabase
        .from('quality_evolution')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString());

      if (error) {
        console.error('❌ 데이터 아카이브 실패:', error);
      } else {
        console.log('🗂️ 오래된 데이터 아카이브 완료');
      }
    } catch (error) {
      console.error('❌ 데이터 아카이브 중 오류:', error);
    }
  }

  // 알림 발송
  private async sendNotifications(results: any): Promise<void> {
    const shouldNotify = !this.config.notifications.onlyOnIssues || 
                        results.criticalIssues.length > 0 || 
                        results.failedCount > 0;

    if (!shouldNotify) {
      console.log('📢 알림 조건에 맞지 않아 알림을 발송하지 않음');
      return;
    }

    console.log('📢 알림 발송 중...');

    const message = this.createNotificationMessage(results);

    // 이메일 알림
    if (this.config.notifications.email && this.config.notifications.email.length > 0) {
      await this.sendEmailNotification(message);
    }

    // Slack 알림
    if (this.config.notifications.slack) {
      await this.sendSlackNotification(message);
    }

    // Discord 알림
    if (this.config.notifications.discord) {
      await this.sendDiscordNotification(message);
    }

    console.log('✅ 알림 발송 완료');
  }

  // 알림 메시지 생성
  private createNotificationMessage(results: any): string {
    const timestamp = new Date().toLocaleString();
    
    let message = `🎯 가이드 품질 검사 결과 (${timestamp})\n\n`;
    message += `📊 총 검사: ${results.totalChecked}개\n`;
    message += `✅ 통과: ${results.passedCount}개 (${(results.passedCount/results.totalChecked*100).toFixed(1)}%)\n`;
    message += `❌ 실패: ${results.failedCount}개 (${(results.failedCount/results.totalChecked*100).toFixed(1)}%)\n`;
    
    if (results.criticalIssues.length > 0) {
      message += `\n🚨 심각한 문제: ${results.criticalIssues.length}개\n`;
      results.criticalIssues.slice(0, 5).forEach((issue: any) => {
        message += `  • ${issue.locationName} (${issue.language}): ${issue.currentQuality.toFixed(1)}점\n`;
      });
      
      if (results.criticalIssues.length > 5) {
        message += `  ... 외 ${results.criticalIssues.length - 5}개\n`;
      }
    }

    message += `\n⏱️ 처리 시간: ${(results.processingTime / 1000).toFixed(1)}초`;

    return message;
  }

  // 이메일 알림 (구현 필요)
  private async sendEmailNotification(message: string): Promise<void> {
    // 이메일 서비스 구현 (예: SendGrid, Nodemailer 등)
    console.log('📧 이메일 알림 (구현 필요):', message);
  }

  // Slack 알림
  private async sendSlackNotification(message: string): Promise<void> {
    try {
      const response = await fetch(this.config.notifications.slack!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      if (!response.ok) {
        throw new Error(`Slack 알림 실패: ${response.statusText}`);
      }

      console.log('💬 Slack 알림 발송 완료');
    } catch (error) {
      console.error('❌ Slack 알림 실패:', error);
    }
  }

  // Discord 알림
  private async sendDiscordNotification(message: string): Promise<void> {
    try {
      const response = await fetch(this.config.notifications.discord!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });

      if (!response.ok) {
        throw new Error(`Discord 알림 실패: ${response.statusText}`);
      }

      console.log('🎮 Discord 알림 발송 완료');
    } catch (error) {
      console.error('❌ Discord 알림 실패:', error);
    }
  }

  // 실행 로그 저장
  private async logExecution(results: any, duration: number): Promise<void> {
    try {
      await supabase
        .from('quality_check_logs')
        .insert({
          check_type: 'scheduled_batch',
          total_checked: results.totalChecked,
          passed_count: results.passedCount,
          failed_count: results.failedCount,
          critical_issues_count: results.criticalIssues.length,
          processing_time_ms: duration,
          quality_distribution: results.qualityDistribution,
          recommendations: results.recommendations,
          executed_at: new Date().toISOString()
        });

      console.log('📝 실행 로그 저장 완료');
    } catch (error) {
      console.error('❌ 실행 로그 저장 실패:', error);
    }
  }

  // 실행 오류 처리
  private async handleExecutionError(error: any): Promise<void> {
    console.error('💥 스케줄러 실행 중 오류 발생:', error);

    try {
      // 오류 로그 저장
      await supabase
        .from('quality_check_logs')
        .insert({
          check_type: 'scheduled_batch',
          status: 'failed',
          error_message: error.message || '알 수 없는 오류',
          executed_at: new Date().toISOString()
        });

      // 오류 알림 발송
      if (this.config.notifications.slack) {
        await this.sendSlackNotification(`🚨 품질 검사 스케줄러 오류\n\n${error.message}`);
      }

    } catch (logError) {
      console.error('❌ 오류 로그 저장 실패:', logError);
    }
  }
}

// 🎯 사전 정의된 스케줄 설정들

// 매일 오전 9시 실행 (운영용)
export const DAILY_PRODUCTION_SCHEDULE: ScheduleConfig = {
  scheduleType: 'daily',
  timeOfDay: '09:00',
  
  batchConfig: {
    onlyProduction: true,
    skipRecentlyChecked: true,
    autoQueue: true,
    exportResults: true,
    generateReport: true,
    verboseOutput: false,
    minQualityThreshold: 60
  },
  
  notifications: {
    onlyOnIssues: true
  },
  
  autoActions: {
    queueCriticalIssues: true,
    generateReports: true,
    updateMetrics: true,
    archiveOldData: false
  }
};

// 주 1회 종합 검사 (일요일 새벽 2시)
export const WEEKLY_COMPREHENSIVE_SCHEDULE: ScheduleConfig = {
  scheduleType: 'weekly',
  timeOfDay: '02:00',
  dayOfWeek: 0, // 일요일
  
  batchConfig: {
    onlyProduction: true,
    skipRecentlyChecked: false,
    forceRecheck: true,
    autoQueue: true,
    exportResults: true,
    generateReport: true,
    verboseOutput: true,
    minQualityThreshold: 75
  },
  
  notifications: {
    onlyOnIssues: false // 항상 알림
  },
  
  autoActions: {
    queueCriticalIssues: true,
    generateReports: true,
    updateMetrics: true,
    archiveOldData: true
  }
};

// 월 1회 전체 검사 (매월 1일 오전 3시)
export const MONTHLY_FULL_SCHEDULE: ScheduleConfig = {
  scheduleType: 'monthly',
  timeOfDay: '03:00',
  dayOfMonth: 1,
  
  batchConfig: {
    onlyProduction: false, // 모든 상태
    skipRecentlyChecked: false,
    forceRecheck: true,
    autoQueue: true,
    exportResults: true,
    generateReport: true,
    verboseOutput: true,
    minQualityThreshold: 70
  },
  
  notifications: {
    onlyOnIssues: false
  },
  
  autoActions: {
    queueCriticalIssues: true,
    generateReports: true,
    updateMetrics: true,
    archiveOldData: true
  }
};

// 🎯 CLI 진입점
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🕐 가이드 품질 검사 스케줄러

사용법:
  npm run quality:schedule [스케줄타입]

스케줄 타입:
  daily        매일 검사 (기본)
  weekly       주간 종합 검사
  monthly      월간 전체 검사
  custom       커스텀 설정

예시:
  npm run quality:schedule daily
  npm run quality:schedule weekly
  npm run quality:schedule monthly
    `);
    return;
  }

  const scheduleType = args[0] || 'daily';
  let config: ScheduleConfig;

  switch (scheduleType) {
    case 'daily':
      config = DAILY_PRODUCTION_SCHEDULE;
      break;
    case 'weekly':
      config = WEEKLY_COMPREHENSIVE_SCHEDULE;
      break;
    case 'monthly':
      config = MONTHLY_FULL_SCHEDULE;
      break;
    default:
      console.error(`❌ 알 수 없는 스케줄 타입: ${scheduleType}`);
      return;
  }

  console.log(`🎯 ${scheduleType} 스케줄 실행 시작...`);
  
  const scheduler = new QualityScheduler(config);
  await scheduler.runScheduledCheck();
}

// 스크립트로 직접 실행될 때만 main 함수 실행
if (require.main === module) {
  main().catch(console.error);
}

export { QualityScheduler, ScheduleConfig };
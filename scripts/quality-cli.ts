#!/usr/bin/env ts-node
// 🎯 가이드 품질 관리 CLI 도구
// 개별 가이드 검사, 배치 처리, 품질 통계, 개선 관리 등

import { createClient } from '@supabase/supabase-js';
import { QualityBatchChecker, BatchCheckConfig } from './quality-batch-checker';
import { calculateComprehensiveQualityScore, QUALITY_THRESHOLDS } from '../src/lib/quality/quality-scoring';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🎯 CLI 명령어 인터페이스
interface CLICommand {
  name: string;
  description: string;
  usage: string;
  options?: { [key: string]: string };
  handler: (args: string[]) => Promise<void>;
}

// 🎯 품질 CLI 클래스
class QualityCLI {
  private commands: Map<string, CLICommand> = new Map();

  constructor() {
    this.registerCommands();
  }

  // 명령어 등록
  private registerCommands() {
    // 배치 검사 명령어
    this.commands.set('check', {
      name: 'check',
      description: '가이드 품질 배치 검사 실행',
      usage: 'quality check [옵션]',
      options: {
        '--limit N': '최대 N개 가이드 검사',
        '--languages ko,en': '특정 언어만 검사',
        '--locations 경복궁,덕수궁': '특정 위치만 검사',
        '--threshold N': '품질 임계값 (기본: 60)',
        '--auto-queue': '문제 발견시 자동 개선 큐에 추가',
        '--verbose': '상세 출력'
      },
      handler: this.handleBatchCheck.bind(this)
    });

    // 개별 가이드 검사
    this.commands.set('inspect', {
      name: 'inspect',
      description: '특정 가이드 상세 검사',
      usage: 'quality inspect <위치명> [언어]',
      options: {
        '--save': '결과를 데이터베이스에 저장',
        '--verbose': '상세 분석 결과 출력'
      },
      handler: this.handleInspectGuide.bind(this)
    });

    // 품질 통계
    this.commands.set('stats', {
      name: 'stats',
      description: '전체 품질 통계 조회',
      usage: 'quality stats [옵션]',
      options: {
        '--period 7d': '조회 기간 (7d, 30d, 90d)',
        '--languages ko,en': '특정 언어만',
        '--chart': 'ASCII 차트 출력'
      },
      handler: this.handleQualityStats.bind(this)
    });

    // 개선 큐 관리
    this.commands.set('queue', {
      name: 'queue',
      description: '품질 개선 큐 관리',
      usage: 'quality queue <list|add|process|clear>',
      options: {
        '--status pending': '특정 상태만 조회',
        '--priority high': '특정 우선순위만',
        '--limit N': '최대 N개만 처리'
      },
      handler: this.handleQueueManagement.bind(this)
    });

    // 품질 트렌드
    this.commands.set('trends', {
      name: 'trends',
      description: '품질 트렌드 분석',
      usage: 'quality trends [위치명]',
      options: {
        '--period 30d': '분석 기간',
        '--export': '결과를 CSV로 저장'
      },
      handler: this.handleQualityTrends.bind(this)
    });

    // 알림 관리
    this.commands.set('alerts', {
      name: 'alerts',
      description: '품질 알림 관리',
      usage: 'quality alerts <list|resolve|dismiss>',
      options: {
        '--severity critical': '특정 심각도만',
        '--status active': '특정 상태만'
      },
      handler: this.handleAlertManagement.bind(this)
    });

    // 보고서 생성
    this.commands.set('report', {
      name: 'report',
      description: '품질 보고서 생성',
      usage: 'quality report [옵션]',
      options: {
        '--format html,pdf': '출력 형식',
        '--period 30d': '보고 기간',
        '--detailed': '상세 보고서'
      },
      handler: this.handleReportGeneration.bind(this)
    });

    // 설정 관리
    this.commands.set('config', {
      name: 'config',
      description: '품질 기준 설정 관리',
      usage: 'quality config <get|set|reset>',
      options: {
        '--thresholds': '품질 임계값 설정',
        '--weights': '평가 가중치 설정'
      },
      handler: this.handleConfiguration.bind(this)
    });
  }

  // CLI 실행
  async run(args: string[]) {
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
      this.showHelp();
      return;
    }

    const commandName = args[0];
    const command = this.commands.get(commandName);

    if (!command) {
      console.error(`❌ 알 수 없는 명령어: ${commandName}`);
      console.log('사용 가능한 명령어를 보려면: quality --help');
      return;
    }

    try {
      await command.handler(args.slice(1));
    } catch (error) {
      console.error(`❌ 명령어 실행 실패:`, error);
    }
  }

  // 도움말 출력
  private showHelp() {
    console.log(`
🎯 NaviDocent 가이드 품질 관리 CLI

사용법:
  npm run quality <명령어> [옵션]

명령어:
`);

    this.commands.forEach(command => {
      console.log(`  ${command.name.padEnd(12)} ${command.description}`);
    });

    console.log(`
상세 도움말:
  npm run quality <명령어> --help

예시:
  npm run quality check --limit 10 --verbose
  npm run quality inspect 경복궁 ko
  npm run quality stats --period 30d --chart
  npm run quality queue list --status pending
`);
  }

  // 🎯 명령어 핸들러들

  // 배치 검사 핸들러
  private async handleBatchCheck(args: string[]) {
    if (args.includes('--help')) {
      const command = this.commands.get('check')!;
      console.log(`${command.description}\n`);
      console.log(`사용법: ${command.usage}\n`);
      console.log('옵션:');
      Object.entries(command.options!).forEach(([option, desc]) => {
        console.log(`  ${option.padEnd(20)} ${desc}`);
      });
      return;
    }

    console.log('🎯 가이드 품질 배치 검사 시작...\n');

    const config: BatchCheckConfig = {
      verboseOutput: args.includes('--verbose'),
      autoQueue: args.includes('--auto-queue'),
    };

    // 인수 파싱
    const limitIndex = args.findIndex(arg => arg === '--limit');
    if (limitIndex !== -1 && args[limitIndex + 1]) {
      config.limitGuides = parseInt(args[limitIndex + 1]);
    }

    const langIndex = args.findIndex(arg => arg === '--languages');
    if (langIndex !== -1 && args[langIndex + 1]) {
      config.languages = args[langIndex + 1].split(',');
    }

    const locIndex = args.findIndex(arg => arg === '--locations');
    if (locIndex !== -1 && args[locIndex + 1]) {
      config.locations = args[locIndex + 1].split(',');
    }

    const thresholdIndex = args.findIndex(arg => arg === '--threshold');
    if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
      config.minQualityThreshold = parseInt(args[thresholdIndex + 1]);
    }

    const checker = new QualityBatchChecker(config);
    await checker.runBatchCheck();
  }

  // 개별 가이드 검사 핸들러
  private async handleInspectGuide(args: string[]) {
    if (args.length < 1 || args.includes('--help')) {
      console.log(`특정 가이드 상세 검사

사용법: quality inspect <위치명> [언어]

옵션:
  --save      결과를 데이터베이스에 저장
  --verbose   상세 분석 결과 출력

예시:
  quality inspect 경복궁 ko
  quality inspect "덕수궁" en --save --verbose`);
      return;
    }

    const locationName = args[0];
    const language = args[1] || 'ko';
    const save = args.includes('--save');
    const verbose = args.includes('--verbose');

    console.log(`🔍 가이드 검사: ${locationName} (${language})\n`);

    try {
      // 가이드 조회
      const { data: guide, error } = await supabase
        .from('guide_versions')
        .select('*')
        .eq('location_name', locationName)
        .eq('language', language)
        .eq('status', 'production')
        .single();

      if (error || !guide) {
        console.error('❌ 가이드를 찾을 수 없습니다:', error?.message);
        return;
      }

      // 기본 정보 출력
      console.log(`📍 위치: ${guide.location_name}`);
      console.log(`🌐 언어: ${guide.language}`);
      console.log(`📅 생성일: ${new Date(guide.created_at).toLocaleString()}`);
      console.log(`📊 현재 품질 점수: ${guide.quality_score || 'N/A'}`);

      // 콘텐츠 분석
      if (guide.content && guide.content.realTimeGuide) {
        const chapters = guide.content.realTimeGuide.chapters || [];
        console.log(`📚 챕터 수: ${chapters.length}개`);
        
        if (verbose) {
          console.log('\n📋 챕터 상세:');
          chapters.forEach((chapter: any, index: number) => {
            console.log(`  ${index + 1}. ${chapter.title || '제목 없음'}`);
            if (chapter.content) {
              console.log(`     내용 길이: ${chapter.content.length}자`);
            }
            if (chapter.narrative) {
              console.log(`     내러티브: ${chapter.narrative.length}자`);
            }
          });
        }
      }

      // 최근 품질 검사 결과
      const { data: qualityHistory } = await supabase
        .from('quality_evolution')
        .select('*')
        .eq('guide_id', guide.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (qualityHistory && qualityHistory.length > 0) {
        console.log('\n📈 최근 품질 검사 결과:');
        qualityHistory.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.overall_quality}점 (${new Date(result.created_at).toLocaleDateString()})`);
          if (verbose) {
            console.log(`     - 사실 정확성: ${result.factual_accuracy}`);
            console.log(`     - 내용 완성도: ${result.content_completeness}`);
            console.log(`     - 논리적 일관성: ${result.coherence_score}`);
            console.log(`     - 문화적 민감성: ${result.cultural_sensitivity}`);
          }
        });
      }

      // 개선 제안사항
      if (guide.quality_score && guide.quality_score < QUALITY_THRESHOLDS.GOOD) {
        console.log('\n💡 개선 제안사항:');
        if (guide.quality_score < QUALITY_THRESHOLDS.CRITICAL) {
          console.log('  🚨 즉시 재생성이 필요합니다');
        } else if (guide.quality_score < QUALITY_THRESHOLDS.POOR) {
          console.log('  ⚠️ 품질 개선이 필요합니다');
        } else {
          console.log('  📝 일부 내용 보완을 권장합니다');
        }
      }

    } catch (error) {
      console.error('❌ 가이드 검사 실패:', error);
    }
  }

  // 품질 통계 핸들러
  private async handleQualityStats(args: string[]) {
    if (args.includes('--help')) {
      console.log(`전체 품질 통계 조회

사용법: quality stats [옵션]

옵션:
  --period 7d       조회 기간 (7d, 30d, 90d)
  --languages ko,en 특정 언어만
  --chart          ASCII 차트 출력

예시:
  quality stats --period 30d --chart
  quality stats --languages ko,en`);
      return;
    }

    console.log('📊 가이드 품질 통계 조회 중...\n');

    try {
      // 전체 가이드 수 조회
      const { count: totalGuides } = await supabase
        .from('guide_versions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'production');

      console.log(`📚 총 프로덕션 가이드: ${totalGuides}개`);

      // 품질 점수 분포
      const { data: qualityDistribution } = await supabase
        .from('guide_versions')
        .select('quality_score')
        .eq('status', 'production')
        .not('quality_score', 'is', null);

      if (qualityDistribution) {
        const scores = qualityDistribution.map(g => g.quality_score);
        const distribution = {
          excellent: scores.filter(s => s >= QUALITY_THRESHOLDS.EXCELLENT).length,
          good: scores.filter(s => s >= QUALITY_THRESHOLDS.GOOD && s < QUALITY_THRESHOLDS.EXCELLENT).length,
          acceptable: scores.filter(s => s >= QUALITY_THRESHOLDS.ACCEPTABLE && s < QUALITY_THRESHOLDS.GOOD).length,
          poor: scores.filter(s => s >= QUALITY_THRESHOLDS.POOR && s < QUALITY_THRESHOLDS.ACCEPTABLE).length,
          critical: scores.filter(s => s < QUALITY_THRESHOLDS.POOR).length
        };

        console.log('\n🎯 품질 분포:');
        console.log(`  우수 (90+):   ${distribution.excellent}개 (${(distribution.excellent/scores.length*100).toFixed(1)}%)`);
        console.log(`  양호 (75-89): ${distribution.good}개 (${(distribution.good/scores.length*100).toFixed(1)}%)`);
        console.log(`  허용 (60-74): ${distribution.acceptable}개 (${(distribution.acceptable/scores.length*100).toFixed(1)}%)`);
        console.log(`  불량 (40-59): ${distribution.poor}개 (${(distribution.poor/scores.length*100).toFixed(1)}%)`);
        console.log(`  심각 (<40):  ${distribution.critical}개 (${(distribution.critical/scores.length*100).toFixed(1)}%)`);

        // ASCII 차트 출력 (옵션)
        if (args.includes('--chart')) {
          console.log('\n📈 품질 분포 차트:');
          const maxCount = Math.max(...Object.values(distribution));
          const chartWidth = 40;
          
          Object.entries(distribution).forEach(([level, count]) => {
            const barLength = Math.round((count / maxCount) * chartWidth);
            const bar = '█'.repeat(barLength) + '░'.repeat(chartWidth - barLength);
            console.log(`  ${level.padEnd(10)} │${bar}│ ${count}`);
          });
        }

        // 평균 점수
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        console.log(`\n📊 평균 품질 점수: ${avgScore.toFixed(1)}점`);
      }

      // 언어별 통계
      const { data: languageStats } = await supabase.rpc('get_quality_stats_by_language');
      if (languageStats) {
        console.log('\n🌐 언어별 통계:');
        languageStats.forEach((stat: any) => {
          console.log(`  ${stat.language}: ${stat.guide_count}개, 평균 ${stat.avg_quality?.toFixed(1)}점`);
        });
      }

      // 최근 검사 활동
      const period = args.includes('--period') ? args[args.indexOf('--period') + 1] : '7d';
      const daysAgo = period === '30d' ? 30 : period === '90d' ? 90 : 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { count: recentChecks } = await supabase
        .from('quality_evolution')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      console.log(`\n🔍 최근 ${period} 품질 검사: ${recentChecks}회`);

    } catch (error) {
      console.error('❌ 통계 조회 실패:', error);
    }
  }

  // 개선 큐 관리 핸들러
  private async handleQueueManagement(args: string[]) {
    if (args.length === 0 || args.includes('--help')) {
      console.log(`품질 개선 큐 관리

사용법: quality queue <list|add|process|clear>

명령어:
  list      큐 목록 조회
  add       큐에 가이드 추가
  process   큐 처리 실행
  clear     완료된 항목 정리

옵션:
  --status pending    특정 상태만 조회
  --priority high     특정 우선순위만
  --limit N          최대 N개만 처리

예시:
  quality queue list --status pending
  quality queue process --limit 5`);
      return;
    }

    const action = args[0];

    try {
      switch (action) {
        case 'list':
          await this.listQueueItems(args.slice(1));
          break;
        case 'add':
          await this.addToQueue(args.slice(1));
          break;
        case 'process':
          await this.processQueue(args.slice(1));
          break;
        case 'clear':
          await this.clearQueue(args.slice(1));
          break;
        default:
          console.error(`❌ 알 수 없는 액션: ${action}`);
      }
    } catch (error) {
      console.error(`❌ 큐 관리 실패:`, error);
    }
  }

  // 큐 목록 조회
  private async listQueueItems(args: string[]) {
    console.log('📋 품질 개선 큐 목록:\n');

    let query = supabase
      .from('quality_improvement_queue')
      .select('*')
      .order('created_at', { ascending: false });

    // 상태 필터
    const statusIndex = args.findIndex(arg => arg === '--status');
    if (statusIndex !== -1 && args[statusIndex + 1]) {
      query = query.eq('status', args[statusIndex + 1]);
    }

    // 우선순위 필터
    const priorityIndex = args.findIndex(arg => arg === '--priority');
    if (priorityIndex !== -1 && args[priorityIndex + 1]) {
      query = query.eq('priority', args[priorityIndex + 1]);
    }

    const { data: queueItems, error } = await query;

    if (error) {
      console.error('❌ 큐 조회 실패:', error);
      return;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('✅ 큐가 비어있습니다.');
      return;
    }

    console.log(`총 ${queueItems.length}개 항목:\n`);

    queueItems.forEach((item, index) => {
      const priorityIcon = item.priority === 'urgent' ? '🚨' : 
                          item.priority === 'high' ? '⚠️' : 
                          item.priority === 'medium' ? '📝' : '📋';
      
      const statusIcon = item.status === 'pending' ? '⏳' : 
                        item.status === 'processing' ? '🔄' : 
                        item.status === 'completed' ? '✅' : 
                        item.status === 'failed' ? '❌' : '❓';

      console.log(`${index + 1}. ${priorityIcon} ${statusIcon} ${item.location_name} (${item.language})`);
      console.log(`   현재 품질: ${item.original_quality_score}점 → 목표: ${item.target_quality_score}점`);
      console.log(`   우선순위: ${item.priority}, 상태: ${item.status}`);
      console.log(`   생성: ${new Date(item.created_at).toLocaleString()}`);
      
      if (item.current_issues && item.current_issues.length > 0) {
        console.log(`   문제점: ${item.current_issues.slice(0, 2).join(', ')}`);
      }
      console.log('');
    });
  }

  // 큐에 가이드 추가
  private async addToQueue(args: string[]) {
    if (args.length < 2) {
      console.log('사용법: quality queue add <위치명> <언어> [우선순위]');
      return;
    }

    const locationName = args[0];
    const language = args[1];
    const priority = args[2] || 'medium';

    console.log(`📝 큐에 추가 중: ${locationName} (${language})`);

    // 가이드 조회
    const { data: guide, error: guideError } = await supabase
      .from('guide_versions')
      .select('id, quality_score')
      .eq('location_name', locationName)
      .eq('language', language)
      .eq('status', 'production')
      .single();

    if (guideError || !guide) {
      console.error('❌ 가이드를 찾을 수 없습니다');
      return;
    }

    // 큐에 추가
    const { error: insertError } = await supabase
      .from('quality_improvement_queue')
      .insert({
        guide_id: guide.id,
        location_name: locationName,
        language: language,
        original_quality_score: guide.quality_score || 50,
        target_quality_score: Math.min(95, (guide.quality_score || 50) + 20),
        priority: priority,
        status: 'pending'
      });

    if (insertError) {
      console.error('❌ 큐 추가 실패:', insertError);
      return;
    }

    console.log('✅ 큐에 성공적으로 추가되었습니다');
  }

  // 큐 처리
  private async processQueue(args: string[]) {
    const limitIndex = args.findIndex(arg => arg === '--limit');
    const limit = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1]) : 5;

    console.log(`🔄 품질 개선 큐 처리 시작 (최대 ${limit}개)...\n`);

    // 처리 대기 중인 항목 조회
    const { data: pendingItems, error } = await supabase
      .from('quality_improvement_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false }) // urgent, high, medium, low 순
      .order('created_at', { ascending: true }) // 오래된 것부터
      .limit(limit);

    if (error) {
      console.error('❌ 큐 조회 실패:', error);
      return;
    }

    if (!pendingItems || pendingItems.length === 0) {
      console.log('✅ 처리할 항목이 없습니다.');
      return;
    }

    console.log(`📋 ${pendingItems.length}개 항목 처리 중...\n`);

    for (const item of pendingItems) {
      try {
        console.log(`🔄 처리 중: ${item.location_name} (${item.language})`);

        // 상태를 processing으로 변경
        await supabase
          .from('quality_improvement_queue')
          .update({ 
            status: 'processing',
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', item.id);

        // 실제 개선 작업은 여기서 수행 (예: 가이드 재생성 API 호출)
        // await regenerateGuide(item.guide_id, item.enhanced_prompt);

        // 임시로 완료 처리
        await supabase
          .from('quality_improvement_queue')
          .update({ status: 'completed' })
          .eq('id', item.id);

        console.log(`✅ 완료: ${item.location_name}`);

      } catch (error) {
        console.error(`❌ 처리 실패 ${item.location_name}:`, error);
        
        // 실패 상태로 변경
        await supabase
          .from('quality_improvement_queue')
          .update({ 
            status: 'failed',
            retry_count: (item.retry_count || 0) + 1
          })
          .eq('id', item.id);
      }
    }

    console.log('\n🎉 큐 처리 완료!');
  }

  // 큐 정리
  private async clearQueue(args: string[]) {
    console.log('🗑️ 완료된 큐 항목 정리 중...');

    const { error } = await supabase
      .from('quality_improvement_queue')
      .delete()
      .eq('status', 'completed');

    if (error) {
      console.error('❌ 큐 정리 실패:', error);
      return;
    }

    console.log('✅ 완료된 항목이 정리되었습니다');
  }

  // 품질 트렌드 핸들러
  private async handleQualityTrends(args: string[]) {
    console.log('📈 품질 트렌드 분석은 아직 구현 중입니다...');
  }

  // 알림 관리 핸들러
  private async handleAlertManagement(args: string[]) {
    console.log('🚨 알림 관리는 아직 구현 중입니다...');
  }

  // 보고서 생성 핸들러
  private async handleReportGeneration(args: string[]) {
    console.log('📄 보고서 생성은 아직 구현 중입니다...');
  }

  // 설정 관리 핸들러
  private async handleConfiguration(args: string[]) {
    console.log('⚙️ 설정 관리는 아직 구현 중입니다...');
  }
}

// 🎯 CLI 진입점
async function main() {
  const args = process.argv.slice(2);
  const cli = new QualityCLI();
  await cli.run(args);
}

// 스크립트로 직접 실행될 때만 main 함수 실행
if (require.main === module) {
  main().catch(console.error);
}

export { QualityCLI };
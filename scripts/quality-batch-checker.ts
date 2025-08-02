#!/usr/bin/env ts-node
// 🎯 가이드 품질 배치 검사 시스템
// 주기적으로 DB의 모든 가이드를 검토하여 품질 기준에 부합하지 않는 데이터 추려내기

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateComprehensiveQualityScore, saveQualityScore, QUALITY_THRESHOLDS } from '../src/lib/quality/quality-scoring';

// 환경 변수 설정
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🎯 배치 검사 설정
interface BatchCheckConfig {
  // 검사 범위
  limitGuides?: number;           // 검사할 가이드 수 제한 (전체: undefined)
  languages?: string[];           // 검사할 언어 ('ko', 'en', 'ja' 등)
  locations?: string[];           // 특정 위치만 검사
  minQualityThreshold?: number;   // 최소 품질 임계값 (기본: 60)
  
  // 검사 옵션
  forceRecheck?: boolean;         // 최근 검사된 것도 다시 검사
  onlyProduction?: boolean;       // 프로덕션 상태만 검사
  skipRecentlyChecked?: boolean;  // 최근 24시간 내 검사된 것 제외
  
  // 출력 옵션
  verboseOutput?: boolean;        // 상세 출력
  exportResults?: boolean;        // 결과를 파일로 저장
  generateReport?: boolean;       // HTML 리포트 생성
  
  // 처리 옵션
  autoQueue?: boolean;            // 문제 발견시 자동으로 개선 큐에 추가
  maxConcurrent?: number;         // 동시 처리 수 (기본: 3)
  delayBetweenChecks?: number;    // 검사 간 지연 시간 (ms, 기본: 1000)
}

// 검사 결과 인터페이스
interface BatchCheckResult {
  totalChecked: number;
  passedCount: number;
  failedCount: number;
  criticalIssues: GuideIssue[];
  qualityDistribution: {
    excellent: number;    // 90+
    good: number;        // 75-89
    acceptable: number;  // 60-74
    poor: number;        // 40-59
    critical: number;    // <40
  };
  detailedResults: GuideCheckResult[];
  processingTime: number;
  recommendations: string[];
}

interface GuideIssue {
  guideId: string;
  locationName: string;
  language: string;
  currentQuality: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  recommendations: string[];
}

interface GuideCheckResult {
  guideId: string;
  locationName: string;
  language: string;
  qualityScore: number;
  status: 'passed' | 'failed' | 'critical';
  components: {
    factualAccuracy: number;
    contentCompleteness: number;
    coherenceScore: number;
    culturalSensitivity: number;
  };
  issues: string[];
  recommendations: string[];
  processingTime: number;
}

// 🎯 메인 배치 검사 클래스
class QualityBatchChecker {
  private config: BatchCheckConfig;
  private genAI: GoogleGenerativeAI;
  
  constructor(config: BatchCheckConfig = {}) {
    this.config = {
      minQualityThreshold: 60,
      onlyProduction: true,
      skipRecentlyChecked: true,
      verboseOutput: false,
      exportResults: true,
      generateReport: true,
      autoQueue: false,
      maxConcurrent: 3,
      delayBetweenChecks: 1000,
      ...config
    };
    
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  // 🚀 배치 검사 실행
  async runBatchCheck(): Promise<BatchCheckResult> {
    const startTime = Date.now();
    console.log('🎯 가이드 품질 배치 검사 시작...\n');
    
    try {
      // 1. 검사 대상 가이드 조회
      const guides = await this.fetchGuidesToCheck();
      console.log(`📊 총 ${guides.length}개 가이드 발견`);
      
      if (guides.length === 0) {
        console.log('✅ 검사할 가이드가 없습니다.');
        return this.createEmptyResult();
      }

      // 2. 배치 검사 실행
      const results = await this.checkGuidesInBatches(guides);
      
      // 3. 결과 분석 및 요약
      const summary = this.analyzeResults(results);
      
      // 4. 문제 가이드 자동 큐잉 (옵션)
      if (this.config.autoQueue) {
        await this.queueProblematicGuides(summary.criticalIssues);
      }
      
      // 5. 결과 출력 및 저장
      await this.outputResults(summary);
      
      const processingTime = Date.now() - startTime;
      summary.processingTime = processingTime;
      
      console.log(`\n🎉 배치 검사 완료! (${(processingTime / 1000).toFixed(1)}초)`);
      return summary;
      
    } catch (error) {
      console.error('❌ 배치 검사 실패:', error);
      throw error;
    }
  }

  // 검사 대상 가이드 조회
  private async fetchGuidesToCheck() {
    let query = supabase
      .from('guide_versions')
      .select(`
        id,
        location_name,
        language,
        content,
        quality_score,
        status,
        updated_at,
        quality_evolution (
          overall_quality,
          created_at
        )
      `);

    // 프로덕션만 검사
    if (this.config.onlyProduction) {
      query = query.eq('status', 'production');
    }

    // 특정 언어만 검사
    if (this.config.languages && this.config.languages.length > 0) {
      query = query.in('language', this.config.languages);
    }

    // 특정 위치만 검사
    if (this.config.locations && this.config.locations.length > 0) {
      query = query.in('location_name', this.config.locations);
    }

    // 수량 제한
    if (this.config.limitGuides) {
      query = query.limit(this.config.limitGuides);
    }

    const { data: guides, error } = await query;
    
    if (error) {
      throw new Error(`가이드 조회 실패: ${error.message}`);
    }

    // 최근 검사된 것 제외 (옵션)
    if (this.config.skipRecentlyChecked) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return guides?.filter(guide => {
        const latestCheck = guide.quality_evolution?.[0]?.created_at;
        return !latestCheck || new Date(latestCheck) < oneDayAgo;
      }) || [];
    }

    return guides || [];
  }

  // 배치로 가이드 검사
  private async checkGuidesInBatches(guides: any[]): Promise<GuideCheckResult[]> {
    const results: GuideCheckResult[] = [];
    const batches = this.createBatches(guides, this.config.maxConcurrent!);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n📦 배치 ${i + 1}/${batches.length} 처리 중... (${batch.length}개 가이드)`);
      
      const batchPromises = batch.map(guide => this.checkSingleGuide(guide));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`❌ 가이드 ${batch[index].id} 검사 실패:`, result.reason);
        }
      });
      
      // 배치 간 지연
      if (i < batches.length - 1) {
        await this.sleep(this.config.delayBetweenChecks!);
      }
    }
    
    return results;
  }

  // 단일 가이드 검사
  private async checkSingleGuide(guide: any): Promise<GuideCheckResult> {
    const startTime = Date.now();
    
    try {
      if (this.config.verboseOutput) {
        console.log(`🔍 검사 중: ${guide.location_name} (${guide.language})`);
      }

      // AI 기반 품질 검증 수행
      const verificationResult = await this.performAIVerification(guide);
      
      // 종합 품질 점수 계산
      const qualityScore = calculateComprehensiveQualityScore({
        factualAccuracy: verificationResult.factualAccuracy,
        contentCompleteness: verificationResult.contentCompleteness,
        coherenceScore: verificationResult.coherenceScore,
        culturalSensitivity: verificationResult.culturalSensitivity
      });

      // 품질 점수 저장
      await saveQualityScore(
        guide.id,
        guide.location_name,
        qualityScore,
        'batch_check'
      );

      const processingTime = Date.now() - startTime;
      const passed = qualityScore.overallScore >= this.config.minQualityThreshold!;
      
      if (this.config.verboseOutput) {
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${guide.location_name}: ${qualityScore.overallScore.toFixed(1)}점`);
      }

      return {
        guideId: guide.id,
        locationName: guide.location_name,
        language: guide.language,
        qualityScore: qualityScore.overallScore,
        status: qualityScore.overallScore >= QUALITY_THRESHOLDS.ACCEPTABLE ? 'passed' : 
                qualityScore.overallScore >= QUALITY_THRESHOLDS.POOR ? 'failed' : 'critical',
        components: {
          factualAccuracy: verificationResult.factualAccuracy,
          contentCompleteness: verificationResult.contentCompleteness,
          coherenceScore: verificationResult.coherenceScore,
          culturalSensitivity: verificationResult.culturalSensitivity
        },
        issues: verificationResult.issues || [],
        recommendations: qualityScore.recommendations,
        processingTime
      };

    } catch (error) {
      console.error(`❌ 가이드 ${guide.id} 검사 실패:`, error);
      
      return {
        guideId: guide.id,
        locationName: guide.location_name,
        language: guide.language,
        qualityScore: 0,
        status: 'critical',
        components: {
          factualAccuracy: 0,
          contentCompleteness: 0,
          coherenceScore: 0,
          culturalSensitivity: 0
        },
        issues: [`검사 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`],
        recommendations: ['수동 검토가 필요합니다'],
        processingTime: Date.now() - startTime
      };
    }
  }

  // AI 검증 수행
  private async performAIVerification(guide: any) {
    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite-preview-06-17',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024
      }
    });

    const prompt = `다음 관광 가이드의 품질을 평가하고 JSON 형식으로 응답해주세요.

위치: ${guide.location_name}
언어: ${guide.language}
내용: ${JSON.stringify(guide.content, null, 2).substring(0, 3000)}...

평가 기준 (0-100점):
1. factualAccuracy: 사실 정확성
2. contentCompleteness: 내용 완성도  
3. coherenceScore: 논리적 일관성
4. culturalSensitivity: 문화적 적절성

응답 형식:
{
  "factualAccuracy": 점수,
  "contentCompleteness": 점수,
  "coherenceScore": 점수,
  "culturalSensitivity": 점수,
  "issues": ["문제점1", "문제점2"],
  "confidence": 신뢰도점수
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    try {
      const parsed = JSON.parse(text);
      return {
        factualAccuracy: Math.min(100, Math.max(0, parsed.factualAccuracy || 50)),
        contentCompleteness: Math.min(100, Math.max(0, parsed.contentCompleteness || 50)),
        coherenceScore: Math.min(100, Math.max(0, parsed.coherenceScore || 50)),
        culturalSensitivity: Math.min(100, Math.max(0, parsed.culturalSensitivity || 50)),
        issues: parsed.issues || [],
        confidence: parsed.confidence || 50
      };
    } catch (parseError) {
      console.error('AI 응답 파싱 실패:', parseError);
      return {
        factualAccuracy: 60,
        contentCompleteness: 60,
        coherenceScore: 60,
        culturalSensitivity: 60,
        issues: ['AI 평가 파싱 실패'],
        confidence: 30
      };
    }
  }

  // 결과 분석
  private analyzeResults(results: GuideCheckResult[]): BatchCheckResult {
    const totalChecked = results.length;
    const passedCount = results.filter(r => r.status === 'passed').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const criticalCount = results.filter(r => r.status === 'critical').length;

    // 품질 분포 계산
    const qualityDistribution = {
      excellent: results.filter(r => r.qualityScore >= QUALITY_THRESHOLDS.EXCELLENT).length,
      good: results.filter(r => r.qualityScore >= QUALITY_THRESHOLDS.GOOD && r.qualityScore < QUALITY_THRESHOLDS.EXCELLENT).length,
      acceptable: results.filter(r => r.qualityScore >= QUALITY_THRESHOLDS.ACCEPTABLE && r.qualityScore < QUALITY_THRESHOLDS.GOOD).length,
      poor: results.filter(r => r.qualityScore >= QUALITY_THRESHOLDS.POOR && r.qualityScore < QUALITY_THRESHOLDS.ACCEPTABLE).length,
      critical: results.filter(r => r.qualityScore < QUALITY_THRESHOLDS.POOR).length
    };

    // 심각한 문제 가이드 추출
    const criticalIssues: GuideIssue[] = results
      .filter(r => r.status === 'critical' || r.qualityScore < QUALITY_THRESHOLDS.POOR)
      .map(r => ({
        guideId: r.guideId,
        locationName: r.locationName,
        language: r.language,
        currentQuality: r.qualityScore,
        severity: r.qualityScore < 20 ? 'critical' : r.qualityScore < 40 ? 'high' : 'medium',
        issues: r.issues,
        recommendations: r.recommendations
      }));

    // 추천사항 생성
    const recommendations = this.generateBatchRecommendations(results, qualityDistribution);

    return {
      totalChecked,
      passedCount,
      failedCount: failedCount + criticalCount,
      criticalIssues,
      qualityDistribution,
      detailedResults: results,
      processingTime: 0, // 나중에 설정
      recommendations
    };
  }

  // 배치 추천사항 생성
  private generateBatchRecommendations(results: GuideCheckResult[], distribution: any): string[] {
    const recommendations: string[] = [];
    const totalCount = results.length;
    
    if (distribution.critical > 0) {
      recommendations.push(`🚨 심각: ${distribution.critical}개 가이드가 즉시 재생성이 필요합니다`);
    }
    
    if (distribution.poor > 0) {
      recommendations.push(`⚠️ 불량: ${distribution.poor}개 가이드의 품질 개선이 필요합니다`);
    }
    
    const problematicRate = (distribution.critical + distribution.poor) / totalCount * 100;
    if (problematicRate > 20) {
      recommendations.push(`📊 전체의 ${problematicRate.toFixed(1)}%가 문제 가이드입니다 - 시스템적 개선이 필요합니다`);
    }
    
    if (distribution.excellent / totalCount > 0.5) {
      recommendations.push(`✨ 우수한 품질 비율이 높습니다 - 현재 전략을 유지하세요`);
    }
    
    return recommendations;
  }

  // 문제 가이드 자동 큐잉
  private async queueProblematicGuides(criticalIssues: GuideIssue[]) {
    console.log(`\n🔄 ${criticalIssues.length}개 문제 가이드를 개선 큐에 추가 중...`);
    
    for (const issue of criticalIssues) {
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
            status: 'pending'
          });
        
        console.log(`✅ 큐에 추가: ${issue.locationName} (${issue.severity})`);
      } catch (error) {
        console.error(`❌ 큐 추가 실패 ${issue.locationName}:`, error);
      }
    }
  }

  // 결과 출력 및 저장
  private async outputResults(summary: BatchCheckResult) {
    // 콘솔 출력
    console.log('\n' + '='.repeat(60));
    console.log('📊 배치 검사 결과 요약');
    console.log('='.repeat(60));
    console.log(`총 검사: ${summary.totalChecked}개`);
    console.log(`통과: ${summary.passedCount}개 (${(summary.passedCount/summary.totalChecked*100).toFixed(1)}%)`);
    console.log(`실패: ${summary.failedCount}개 (${(summary.failedCount/summary.totalChecked*100).toFixed(1)}%)`);
    console.log(`심각한 문제: ${summary.criticalIssues.length}개`);
    
    console.log('\n🎯 품질 분포:');
    console.log(`  우수 (90+): ${summary.qualityDistribution.excellent}개`);
    console.log(`  양호 (75-89): ${summary.qualityDistribution.good}개`);
    console.log(`  허용 (60-74): ${summary.qualityDistribution.acceptable}개`);
    console.log(`  불량 (40-59): ${summary.qualityDistribution.poor}개`);
    console.log(`  심각 (<40): ${summary.qualityDistribution.critical}개`);
    
    if (summary.recommendations.length > 0) {
      console.log('\n💡 추천사항:');
      summary.recommendations.forEach(rec => console.log(`  ${rec}`));
    }

    // 심각한 문제 가이드 목록
    if (summary.criticalIssues.length > 0) {
      console.log('\n🚨 심각한 문제 가이드:');
      summary.criticalIssues.forEach(issue => {
        console.log(`  ${issue.locationName} (${issue.language}): ${issue.currentQuality.toFixed(1)}점 - ${issue.severity}`);
      });
    }

    // 파일 저장 (옵션)
    if (this.config.exportResults) {
      await this.exportResultsToFile(summary);
    }

    // HTML 리포트 생성 (옵션)
    if (this.config.generateReport) {
      await this.generateHtmlReport(summary);
    }
  }

  // 결과를 JSON 파일로 저장
  private async exportResultsToFile(summary: BatchCheckResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `quality-batch-check-${timestamp}.json`;
    
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(filename, JSON.stringify(summary, null, 2));
      console.log(`📄 결과 저장: ${filename}`);
    } catch (error) {
      console.error('❌ 파일 저장 실패:', error);
    }
  }

  // HTML 리포트 생성
  private async generateHtmlReport(summary: BatchCheckResult) {
    const timestamp = new Date().toISOString();
    const filename = `quality-report-${timestamp.replace(/[:.]/g, '-')}.html`;
    
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>가이드 품질 검사 리포트</title>
    <style>
        body { font-family: -apple-system, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; border: 1px solid #dee2e6; padding: 15px; border-radius: 8px; text-align: center; }
        .critical { background-color: #f8d7da; border-color: #f5c6cb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        .table th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 가이드 품질 검사 리포트</h1>
        <p>생성 시간: ${timestamp}</p>
        <p>처리 시간: ${(summary.processingTime / 1000).toFixed(1)}초</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <h3>총 검사</h3>
            <p style="font-size: 2em; margin: 0;">${summary.totalChecked}</p>
        </div>
        <div class="stat-card success">
            <h3>통과</h3>
            <p style="font-size: 2em; margin: 0;">${summary.passedCount}</p>
            <small>${(summary.passedCount/summary.totalChecked*100).toFixed(1)}%</small>
        </div>
        <div class="stat-card warning">
            <h3>실패</h3>
            <p style="font-size: 2em; margin: 0;">${summary.failedCount}</p>
            <small>${(summary.failedCount/summary.totalChecked*100).toFixed(1)}%</small>
        </div>
        <div class="stat-card critical">
            <h3>심각</h3>
            <p style="font-size: 2em; margin: 0;">${summary.criticalIssues.length}</p>
        </div>
    </div>

    <h2>📊 품질 분포</h2>
    <div class="stats">
        <div class="stat-card success"><h4>우수 (90+)</h4><p>${summary.qualityDistribution.excellent}</p></div>
        <div class="stat-card"><h4>양호 (75-89)</h4><p>${summary.qualityDistribution.good}</p></div>
        <div class="stat-card"><h4>허용 (60-74)</h4><p>${summary.qualityDistribution.acceptable}</p></div>
        <div class="stat-card warning"><h4>불량 (40-59)</h4><p>${summary.qualityDistribution.poor}</p></div>
        <div class="stat-card critical"><h4>심각 (<40)</h4><p>${summary.qualityDistribution.critical}</p></div>
    </div>

    ${summary.criticalIssues.length > 0 ? `
    <h2>🚨 심각한 문제 가이드</h2>
    <table class="table">
        <thead>
            <tr>
                <th>위치</th>
                <th>언어</th>
                <th>품질 점수</th>
                <th>심각도</th>
                <th>주요 문제</th>
            </tr>
        </thead>
        <tbody>
            ${summary.criticalIssues.map(issue => `
            <tr>
                <td>${issue.locationName}</td>
                <td>${issue.language}</td>
                <td>${issue.currentQuality.toFixed(1)}</td>
                <td>${issue.severity}</td>
                <td>${issue.issues.slice(0, 2).join(', ')}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : ''}

    <h2>💡 추천사항</h2>
    <ul>
        ${summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d;">
        <p>NaviDocent 가이드 품질 배치 검사 시스템</p>
    </footer>
</body>
</html>`;

    try {
      const fs = await import('fs/promises');
      await fs.writeFile(filename, html);
      console.log(`📋 HTML 리포트: ${filename}`);
    } catch (error) {
      console.error('❌ HTML 리포트 생성 실패:', error);
    }
  }

  // 유틸리티 함수들
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createEmptyResult(): BatchCheckResult {
    return {
      totalChecked: 0,
      passedCount: 0,
      failedCount: 0,
      criticalIssues: [],
      qualityDistribution: {
        excellent: 0,
        good: 0,
        acceptable: 0,
        poor: 0,
        critical: 0
      },
      detailedResults: [],
      processingTime: 0,
      recommendations: ['검사할 가이드가 없습니다']
    };
  }
}

// 🎯 CLI 진입점
async function main() {
  const args = process.argv.slice(2);
  
  // 기본 설정
  const config: BatchCheckConfig = {
    verboseOutput: args.includes('--verbose') || args.includes('-v'),
    forceRecheck: args.includes('--force'),
    autoQueue: args.includes('--auto-queue'),
    onlyProduction: !args.includes('--all-status'),
    skipRecentlyChecked: !args.includes('--include-recent'),
    exportResults: !args.includes('--no-export'),
    generateReport: !args.includes('--no-report'),
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

  // 도움말 출력
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🎯 가이드 품질 배치 검사 도구

사용법:
  npm run quality:check [옵션]

옵션:
  --limit N                 최대 N개 가이드만 검사
  --languages ko,en,ja      특정 언어만 검사
  --locations 경복궁,덕수궁   특정 위치만 검사
  --threshold N             품질 임계값 설정 (기본: 60)
  --force                   최근 검사된 것도 다시 검사
  --auto-queue              문제 발견시 자동 개선 큐에 추가
  --all-status              모든 상태 가이드 검사 (기본: 프로덕션만)
  --include-recent          최근 검사된 것도 포함
  --no-export               JSON 파일 저장 안함
  --no-report               HTML 리포트 생성 안함
  --verbose, -v             상세 출력
  --help, -h                이 도움말 출력

예시:
  npm run quality:check --limit 10 --verbose
  npm run quality:check --languages ko,en --auto-queue
  npm run quality:check --locations 경복궁,덕수궁 --threshold 70
    `);
    return;
  }

  try {
    const checker = new QualityBatchChecker(config);
    await checker.runBatchCheck();
  } catch (error) {
    console.error('❌ 실행 실패:', error);
    process.exit(1);
  }
}

// 스크립트로 직접 실행될 때만 main 함수 실행
if (require.main === module) {
  main().catch(console.error);
}

export { QualityBatchChecker, BatchCheckConfig, BatchCheckResult };
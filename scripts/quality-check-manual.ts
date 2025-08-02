#!/usr/bin/env ts-node
// 🎯 수동 가이드 품질 검사 도구
// 필요할 때마다 실행하여 DB의 가이드 품질을 확인하고 문제가 있는 데이터 추려내기

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🎯 검사 결과 인터페이스
interface CheckResult {
  locationName: string;
  language: string;
  qualityScore: number;
  status: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
  issues: string[];
  needsAction: boolean;
}

// 간단한 품질 체크 함수
function calculateSimpleQualityScore(guide: any): number {
  let score = 100;
  const issues = [];

  // 기본 필드 존재 확인
  if (!guide.locationName) score -= 20;
  if (!guide.overview) score -= 15;
  if (!guide.chapters || !Array.isArray(guide.chapters)) score -= 25;
  
  // 내용 길이 확인
  if (guide.overview && guide.overview.length < 100) score -= 10;
  if (guide.chapters && guide.chapters.length < 3) score -= 15;
  
  // 챕터 내용 확인
  if (guide.chapters) {
    guide.chapters.forEach((chapter: any, index: number) => {
      if (!chapter.title) score -= 5;
      if (!chapter.content || chapter.content.length < 50) score -= 5;
    });
  }

  return Math.max(0, score);
}

// 품질 임계값
const QUALITY_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  ACCEPTABLE: 60,
  POOR: 40
};

function getQualityStatus(score: number): 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical' {
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) return 'excellent';
  if (score >= QUALITY_THRESHOLDS.GOOD) return 'good';
  if (score >= QUALITY_THRESHOLDS.ACCEPTABLE) return 'acceptable';
  if (score >= QUALITY_THRESHOLDS.POOR) return 'poor';
  return 'critical';
}

interface SummaryResult {
  totalChecked: number;
  excellent: CheckResult[];
  good: CheckResult[];
  acceptable: CheckResult[];
  poor: CheckResult[];
  critical: CheckResult[];
  summary: {
    excellentCount: number;
    goodCount: number;
    acceptableCount: number;
    poorCount: number;
    criticalCount: number;
    avgScore: number;
  };
}

// 🎯 메인 품질 검사 함수
async function checkGuideQuality(): Promise<SummaryResult> {
  console.log('🎯 가이드 품질 검사 시작...\n');

  try {
    // 1. 프로덕션 가이드 조회
    const { data: guides, error } = await supabase
      .from('guide_versions')
      .select(`
        id,
        location_name,
        language,
        content,
        quality_score,
        updated_at
      `)
      .eq('status', 'production')
      .order('location_name', { ascending: true });

    if (error) {
      throw new Error(`가이드 조회 실패: ${error.message}`);
    }

    if (!guides || guides.length === 0) {
      console.log('✅ 검사할 프로덕션 가이드가 없습니다.');
      return createEmptyResult();
    }

    console.log(`📊 총 ${guides.length}개 프로덕션 가이드 발견`);

    // 2. 각 가이드 검사
    const results: CheckResult[] = [];
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    for (let i = 0; i < guides.length; i++) {
      const guide = guides[i];
      console.log(`🔍 [${i + 1}/${guides.length}] ${guide.location_name} (${guide.language}) 검사 중...`);

      try {
        const checkResult = await checkSingleGuide(guide, genAI);
        results.push(checkResult);

        // 진행 상황 표시
        const statusIcon = checkResult.needsAction ? '❌' : '✅';
        console.log(`   ${statusIcon} ${checkResult.qualityScore.toFixed(1)}점 (${checkResult.status})`);

      } catch (error) {
        console.error(`   💥 검사 실패: ${error}`);
        results.push({
          locationName: guide.location_name,
          language: guide.language,
          qualityScore: 0,
          status: 'critical',
          issues: ['검사 실패'],
          needsAction: true
        });
      }

      // 잠깐 대기 (API 부하 방지)
      await sleep(500);
    }

    // 3. 결과 분류 및 요약
    const summary = categorizeResults(results);
    
    // 4. 결과 출력
    printResults(summary);

    return summary;

  } catch (error) {
    console.error('❌ 품질 검사 실패:', error);
    throw error;
  }
}

// 개별 가이드 검사
async function checkSingleGuide(guide: any, genAI: GoogleGenerativeAI): Promise<CheckResult> {
  // 기존 품질 점수가 있으면 우선 사용
  if (guide.quality_score && guide.quality_score > 0) {
    const status = getQualityStatus(guide.quality_score);
    return {
      locationName: guide.location_name,
      language: guide.language,
      qualityScore: guide.quality_score,
      status,
      issues: guide.quality_score < 60 ? ['품질 점수가 낮습니다'] : [],
      needsAction: guide.quality_score < 60
    };
  }

  // 가이드 내용 파싱
  let content;
  try {
    content = typeof guide.content === 'string' ? JSON.parse(guide.content) : guide.content;
  } catch (parseError) {
    return {
      locationName: guide.location_name,
      language: guide.language,
      qualityScore: 0,
      status: 'critical',
      issues: ['JSON 파싱 실패'],
      needsAction: true
    };
  }

  // 간단한 품질 점수 계산
  const score = calculateSimpleQualityScore(content);
  const status = getQualityStatus(score);
  
  const issues: string[] = [];
  if (!content.locationName) issues.push('위치명 누락');
  if (!content.overview) issues.push('개요 누락');
  if (!content.chapters || content.chapters.length < 3) issues.push('챕터 부족');

  return {
    locationName: guide.location_name,
    language: guide.language,
    qualityScore: score,
    status,
    issues,
    needsAction: score < 60 || issues.length > 0
  };

  // AI 검증 수행
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-lite-preview-06-17',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024
    }
  });

  const prompt = `다음 관광 가이드의 품질을 0-100점으로 평가해주세요.

위치: ${guide.location_name}
언어: ${guide.language}

평가 후 다음 JSON 형식으로 응답:
{
  "score": 전체점수,
  "issues": ["문제점1", "문제점2"]
}

내용이 부족하거나 오류가 있으면 낮은 점수를, 완성도가 높고 정확하면 높은 점수를 주세요.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    const parsed = JSON.parse(text);
    const score = Math.min(100, Math.max(0, parsed.score || 50));
    const status = getQualityStatus(score);

    return {
      locationName: guide.location_name,
      language: guide.language,
      qualityScore: score,
      status,
      issues: parsed.issues || [],
      needsAction: score < QUALITY_THRESHOLDS.ACCEPTABLE
    };

  } catch (error) {
    // AI 실패시 기본값
    return {
      locationName: guide.location_name,
      language: guide.language,
      qualityScore: 50,
      status: 'acceptable',
      issues: ['AI 평가 실패'],
      needsAction: false
    };
  }
}


// 결과 분류
function categorizeResults(results: CheckResult[]): SummaryResult {
  const categorized: SummaryResult = {
    totalChecked: results.length,
    excellent: results.filter(r => r.status === 'excellent'),
    good: results.filter(r => r.status === 'good'),
    acceptable: results.filter(r => r.status === 'acceptable'),
    poor: results.filter(r => r.status === 'poor'),
    critical: results.filter(r => r.status === 'critical'),
    summary: {
      excellentCount: 0,
      goodCount: 0,
      acceptableCount: 0,
      poorCount: 0,
      criticalCount: 0,
      avgScore: 0
    }
  };

  categorized.summary = {
    excellentCount: categorized.excellent.length,
    goodCount: categorized.good.length,
    acceptableCount: categorized.acceptable.length,
    poorCount: categorized.poor.length,
    criticalCount: categorized.critical.length,
    avgScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
  };

  return categorized;
}

// 결과 출력
function printResults(summary: SummaryResult) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 가이드 품질 검사 결과');
  console.log('='.repeat(60));
  
  console.log(`총 검사: ${summary.totalChecked}개`);
  console.log(`평균 점수: ${summary.summary.avgScore.toFixed(1)}점\n`);

  // 상태별 분포
  console.log('🎯 품질 분포:');
  console.log(`  🌟 우수 (90+):   ${summary.summary.excellentCount}개 (${(summary.summary.excellentCount/summary.totalChecked*100).toFixed(1)}%)`);
  console.log(`  ✅ 양호 (75-89): ${summary.summary.goodCount}개 (${(summary.summary.goodCount/summary.totalChecked*100).toFixed(1)}%)`);
  console.log(`  ⚠️ 허용 (60-74): ${summary.summary.acceptableCount}개 (${(summary.summary.acceptableCount/summary.totalChecked*100).toFixed(1)}%)`);
  console.log(`  🔴 불량 (40-59): ${summary.summary.poorCount}개 (${(summary.summary.poorCount/summary.totalChecked*100).toFixed(1)}%)`);
  console.log(`  🚨 심각 (<40):  ${summary.summary.criticalCount}개 (${(summary.summary.criticalCount/summary.totalChecked*100).toFixed(1)}%)`);

  // 문제가 있는 가이드들
  const problemGuides = [...summary.poor, ...summary.critical];
  if (problemGuides.length > 0) {
    console.log('\n🚨 조치가 필요한 가이드:');
    problemGuides.forEach(guide => {
      const icon = guide.status === 'critical' ? '🚨' : '🔴';
      console.log(`  ${icon} ${guide.locationName} (${guide.language}): ${guide.qualityScore.toFixed(1)}점`);
      if (guide.issues.length > 0) {
        console.log(`     문제: ${guide.issues.slice(0, 2).join(', ')}`);
      }
    });
  } else {
    console.log('\n✅ 모든 가이드가 허용 가능한 품질 수준입니다!');
  }

  // 추천사항
  console.log('\n💡 추천사항:');
  if (summary.summary.criticalCount > 0) {
    console.log(`  🚨 ${summary.summary.criticalCount}개 가이드가 즉시 재생성이 필요합니다`);
  }
  if (summary.summary.poorCount > 0) {
    console.log(`  🔴 ${summary.summary.poorCount}개 가이드의 품질 개선이 필요합니다`);
  }
  if (problemGuides.length === 0) {
    console.log('  🎉 현재 모든 가이드가 좋은 상태입니다!');
  }
  
  const problemRate = (summary.summary.poorCount + summary.summary.criticalCount) / summary.totalChecked * 100;
  if (problemRate > 10) {
    console.log(`  📊 전체의 ${problemRate.toFixed(1)}%가 문제 가이드입니다 - 전반적인 점검이 필요합니다`);
  }
}

// 빈 결과 생성
function createEmptyResult(): SummaryResult {
  return {
    totalChecked: 0,
    excellent: [],
    good: [],
    acceptable: [],
    poor: [],
    critical: [],
    summary: {
      excellentCount: 0,
      goodCount: 0,
      acceptableCount: 0,
      poorCount: 0,
      criticalCount: 0,
      avgScore: 0
    }
  };
}

// 대기 함수
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🎯 특정 가이드 상세 검사
async function inspectSpecificGuide(locationName: string, language: string = 'ko') {
  console.log(`🔍 ${locationName} (${language}) 상세 검사 중...\n`);

  try {
    const { data: guide, error } = await supabase
      .from('guide_versions')
      .select(`
        id,
        location_name,
        language,
        content,
        quality_score,
        created_at,
        updated_at
      `)
      .eq('location_name', locationName)
      .eq('language', language)
      .eq('status', 'production')
      .single();

    if (error || !guide) {
      console.error('❌ 가이드를 찾을 수 없습니다');
      return;
    }

    // 기본 정보
    console.log(`📍 위치: ${guide.location_name}`);
    console.log(`🌐 언어: ${guide.language}`);
    console.log(`📅 생성: ${new Date(guide.created_at).toLocaleString()}`);
    console.log(`📅 수정: ${new Date(guide.updated_at).toLocaleString()}`);
    console.log(`📊 품질 점수: ${guide.quality_score ? guide.quality_score + '점' : 'N/A'}`);

    // 콘텐츠 분석
    if (guide.content && guide.content.realTimeGuide) {
      const chapters = guide.content.realTimeGuide.chapters || [];
      console.log(`📚 챕터 수: ${chapters.length}개`);
      
      if (chapters.length > 0) {
        console.log('\n📋 챕터 목록:');
        chapters.forEach((chapter: any, index: number) => {
          console.log(`  ${index + 1}. ${chapter.title || '제목 없음'}`);
          if (chapter.content) {
            console.log(`     내용: ${chapter.content.length}자`);
          }
        });
      }
    }

    // 품질 상태
    if (guide.quality_score) {
      const status = getQualityStatus(guide.quality_score);
      const statusEmoji = {
        excellent: '🌟',
        good: '✅',
        acceptable: '⚠️',
        poor: '🔴',
        critical: '🚨'
      };
      
      console.log(`\n${statusEmoji[status]} 품질 상태: ${status}`);
      
      if (guide.quality_score < QUALITY_THRESHOLDS.ACCEPTABLE) {
        console.log('💡 권장사항: 품질 개선이 필요합니다');
      } else {
        console.log('✅ 품질이 양호합니다');
      }
    }

  } catch (error) {
    console.error('❌ 가이드 검사 실패:', error);
  }
}

// 🎯 CLI 진입점
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🎯 가이드 품질 검사 도구

사용법:
  npm run quality:check                    # 전체 가이드 검사
  npm run quality:inspect <위치명> [언어]   # 개별 가이드 상세 검사

예시:
  npm run quality:check
  npm run quality:inspect 경복궁 ko
  npm run quality:inspect 덕수궁
    `);
    return;
  }

  // 개별 가이드 검사
  if (args[0] === 'inspect' || args[0] === 'i') {
    if (!args[1]) {
      console.error('❌ 위치명을 입력해주세요');
      console.log('사용법: npm run quality:inspect <위치명> [언어]');
      return;
    }
    
    const locationName = args[1];
    const language = args[2] || 'ko';
    await inspectSpecificGuide(locationName, language);
    return;
  }

  // 전체 가이드 검사
  try {
    await checkGuideQuality();
    console.log('\n🎉 품질 검사 완료!');
  } catch (error) {
    console.error('❌ 실행 실패:', error);
    process.exit(1);
  }
}

// 스크립트로 직접 실행될 때만 main 함수 실행
if (require.main === module) {
  main().catch(console.error);
}

export { checkGuideQuality, inspectSpecificGuide };
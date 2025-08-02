#!/usr/bin/env ts-node
// 🎯 간단한 가이드 품질 검사 도구

import { config } from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase 환경변수가 누락되었습니다.');
  process.exit(1);
}

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
function calculateSimpleQualityScore(guide: any): { score: number; issues: string[] } {
  let score = 100;
  const issues = [];

  // 기본 필드 존재 확인
  if (!guide.locationName) {
    score -= 20;
    issues.push('위치명 누락');
  }
  if (!guide.overview) {
    score -= 15;
    issues.push('개요 누락');
  }
  if (!guide.chapters || !Array.isArray(guide.chapters)) {
    score -= 25;
    issues.push('챕터 정보 누락');
  }
  
  // 내용 길이 확인
  if (guide.overview && guide.overview.length < 100) {
    score -= 10;
    issues.push('개요가 너무 짧음');
  }
  if (guide.chapters && guide.chapters.length < 3) {
    score -= 15;
    issues.push('챕터 수 부족 (3개 미만)');
  }
  
  // 챕터 내용 확인
  if (guide.chapters && Array.isArray(guide.chapters)) {
    guide.chapters.forEach((chapter: any, index: number) => {
      if (!chapter.title) {
        score -= 5;
        issues.push(`챕터 ${index + 1} 제목 누락`);
      }
      if (!chapter.content || chapter.content.length < 50) {
        score -= 5;
        issues.push(`챕터 ${index + 1} 내용 부족`);
      }
    });
  }

  return { score: Math.max(0, score), issues };
}

function getQualityStatus(score: number): 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'acceptable';
  if (score >= 40) return 'poor';
  return 'critical';
}

// 🎯 메인 품질 검사 함수
async function checkGuideQuality(): Promise<void> {
  console.log('🎯 가이드 품질 검사 시작...\n');

  try {
    // 1. 프로덕션 가이드 조회
    console.log('📊 데이터베이스에서 프로덕션 가이드 조회 중...');
    
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
      return;
    }

    console.log(`📊 총 ${guides.length}개 프로덕션 가이드 발견\n`);

    // 2. 각 가이드 검사
    const results: CheckResult[] = [];
    
    for (let i = 0; i < guides.length; i++) {
      const guide = guides[i];
      console.log(`🔍 [${i + 1}/${guides.length}] ${guide.location_name} (${guide.language}) 검사 중...`);

      try {
        // 가이드 내용 파싱
        let content;
        try {
          content = typeof guide.content === 'string' ? JSON.parse(guide.content) : guide.content;
        } catch (parseError) {
          console.log(`   ❌ JSON 파싱 실패`);
          results.push({
            locationName: guide.location_name,
            language: guide.language,
            qualityScore: 0,
            status: 'critical',
            issues: ['JSON 파싱 실패'],
            needsAction: true
          });
          continue;
        }

        // 품질 점수 계산
        const { score, issues } = calculateSimpleQualityScore(content);
        const status = getQualityStatus(score);
        const needsAction = score < 60 || issues.length > 0;

        results.push({
          locationName: guide.location_name,
          language: guide.language,
          qualityScore: score,
          status,
          issues,
          needsAction
        });

        // 결과 출력
        const statusIcon = needsAction ? '❌' : '✅';
        console.log(`   ${statusIcon} ${score.toFixed(1)}점 (${status})`);
        
        if (issues.length > 0) {
          console.log(`   ⚠️  이슈: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '...' : ''}`);
        }

      } catch (error) {
        console.log(`   💥 검사 실패: ${error}`);
        results.push({
          locationName: guide.location_name,
          language: guide.language,
          qualityScore: 0,
          status: 'critical',
          issues: ['검사 실패'],
          needsAction: true
        });
      }
    }

    // 3. 결과 요약
    console.log('\n' + '='.repeat(60));
    console.log('📊 품질 검사 결과 요약');
    console.log('='.repeat(60));

    const summary = {
      total: results.length,
      excellent: results.filter(r => r.status === 'excellent').length,
      good: results.filter(r => r.status === 'good').length,
      acceptable: results.filter(r => r.status === 'acceptable').length,
      poor: results.filter(r => r.status === 'poor').length,
      critical: results.filter(r => r.status === 'critical').length,
      needsAction: results.filter(r => r.needsAction).length,
      avgScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
    };

    console.log(`📈 전체: ${summary.total}개`);
    console.log(`🌟 우수: ${summary.excellent}개`);
    console.log(`👍 양호: ${summary.good}개`);
    console.log(`😐 보통: ${summary.acceptable}개`);
    console.log(`😟 부족: ${summary.poor}개`);
    console.log(`💥 심각: ${summary.critical}개`);
    console.log(`⚠️  조치 필요: ${summary.needsAction}개`);
    console.log(`📊 평균 점수: ${summary.avgScore.toFixed(1)}점`);

    // 4. 문제가 있는 가이드 상세 출력
    const problemGuides = results.filter(r => r.needsAction);
    if (problemGuides.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  조치가 필요한 가이드들');
      console.log('='.repeat(60));
      
      problemGuides.forEach(guide => {
        console.log(`\n📍 ${guide.locationName} (${guide.language})`);
        console.log(`   점수: ${guide.qualityScore.toFixed(1)}점 (${guide.status})`);
        console.log(`   문제: ${guide.issues.join(', ')}`);
      });
    }

    console.log('\n✅ 품질 검사 완료!');

  } catch (error) {
    console.error('❌ 품질 검사 실패:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  checkGuideQuality()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('실행 실패:', error);
      process.exit(1);
    });
}
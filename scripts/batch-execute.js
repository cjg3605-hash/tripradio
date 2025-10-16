#!/usr/bin/env node

/**
 * 배치 실행 스크립트 - 기존 가이드 인트로 챕터 업데이트
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// 업데이트 함수들 import
const { 
  updateIntroChapterSelectively,
  validateGuideStructure,
  UpdateProgress 
} = require('./update-intro-chapters.js');

// Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  console.log('🚀 배치 업데이트 시작\n');

  try {
    // 1. 모든 가이드 조회
    console.log('📊 가이드 조회 중...');
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, content')
      .order('locationname');

    if (error) throw error;
    
    console.log(`✅ ${guides.length}개 가이드 발견\n`);

    // 진행상황 추적 시작
    const progress = new UpdateProgress();
    progress.setTotal(guides.length);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // 2. 각 가이드 처리
    for (let i = 0; i < guides.length; i++) {
      const guide = guides[i];
      console.log(`\n[${i+1}/${guides.length}] ${guide.locationname} (${guide.language})`);

      try {
        // 인트로 챕터 업데이트
        const updated = await updateIntroChapterSelectively(guide);
        
        if (updated) {
          // DB 업데이트
          const { error: updateError } = await supabase
            .from('guides')
            .update({ content: updated.content })
            .eq('id', guide.id);

          if (updateError) throw updateError;

          successCount++;
          progress.incrementCompleted();
          console.log(`   ✅ 완료`);
        } else {
          throw new Error('인트로 챕터 생성 실패');
        }

      } catch (error) {
        errorCount++;
        progress.incrementFailed();
        errors.push({
          guide: `${guide.locationname} (${guide.language})`,
          error: error.message
        });
        console.log(`   ❌ 실패: ${error.message}`);
      }

      // 간격 두기 (API 제한 고려)
      if (i < guides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 3. 최종 결과
    console.log('\n' + '='.repeat(50));
    console.log('🎉 배치 업데이트 완료');
    console.log('='.repeat(50));
    console.log(`총 처리: ${guides.length}`);
    console.log(`성공: ${successCount}`);
    console.log(`실패: ${errorCount}`);
    console.log(`성공률: ${Math.round(successCount/guides.length*100)}%`);

    if (errors.length > 0) {
      console.log('\n❌ 실패한 가이드들:');
      errors.forEach(err => {
        console.log(`   ${err.guide}: ${err.error}`);
      });
    }

    // 결과 리포트 저장
    const report = {
      timestamp: new Date().toISOString(),
      total: guides.length,
      success: successCount,
      failed: errorCount,
      errors: errors
    };

    const reportFile = `batch-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(path.join(__dirname, reportFile), JSON.stringify(report, null, 2));
    console.log(`\n📄 리포트 저장: ${reportFile}`);

  } catch (error) {
    console.error('❌ 배치 처리 실패:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = main;
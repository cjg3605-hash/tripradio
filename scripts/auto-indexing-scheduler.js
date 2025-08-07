#!/usr/bin/env node
// scripts/auto-indexing-scheduler.js
// 할당량 재설정 후 자동 색인 실행 스케줄러

const { execSync } = require('child_process');

/**
 * 할당량 상태 확인 및 자동 실행
 */
async function checkQuotaAndExecute() {
  const now = new Date();
  console.log(`🕐 ${now.toISOString()} - 할당량 상태 확인 중...`);

  try {
    // 테스트 색인 요청으로 할당량 상태 확인
    const testResult = await fetch('http://localhost:3003/api/seo/retry-failed/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations: ['경복궁'] })
    });

    const result = await testResult.json();
    const isQuotaError = result.results?.[0]?.error?.includes('Quota exceeded');

    if (isQuotaError) {
      console.log('⏳ 아직 할당량이 재설정되지 않았습니다. 1시간 후 재시도...');
      return false;
    }

    console.log('✅ 할당량 재설정 확인! 배치 색인 시작...');
    
    // 전체 배치 색인 실행
    console.log('🚀 전체 가이드 배치 색인 실행 중...');
    
    const batchResult = execSync('node scripts/seo-batch-indexing.js run-small-batch', {
      encoding: 'utf-8',
      cwd: 'C:\\GUIDEAI'
    });
    
    console.log(batchResult);
    console.log('🎉 배치 색인 완료!');
    
    return true;

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    return false;
  }
}

/**
 * 메인 스케줄러 함수
 */
async function main() {
  console.log('📅 Google Indexing API 할당량 자동 체크 스케줄러 시작');
  console.log('🎯 목표: 59개 가이드 × 5개 언어 = 295개 URL 색인');
  console.log('⏰ 할당량 재설정 시간: 매일 자정 (UTC)');
  console.log('');

  // 즉시 한 번 실행
  const success = await checkQuotaAndExecute();
  
  if (success) {
    console.log('✅ 색인 완료! 스케줄러 종료.');
    process.exit(0);
  }

  // 1시간마다 반복 체크
  const intervalId = setInterval(async () => {
    const success = await checkQuotaAndExecute();
    
    if (success) {
      console.log('✅ 색인 완료! 스케줄러 종료.');
      clearInterval(intervalId);
      process.exit(0);
    }
  }, 60 * 60 * 1000); // 1시간 간격

  console.log('⏰ 1시간마다 할당량 상태를 확인합니다...');
  console.log('💡 수동 중단: Ctrl+C');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스케줄러 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = { checkQuotaAndExecute };
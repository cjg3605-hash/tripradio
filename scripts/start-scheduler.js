#!/usr/bin/env node
// scripts/start-scheduler.js
// 할당량 재설정 대기 스케줄러 시작 스크립트

const { spawn } = require('child_process');
const path = require('path');

/**
 * 스케줄러 프로세스 시작
 */
function startScheduler() {
  console.log('🚀 할당량 자동 체크 스케줄러 시작\n');
  
  const schedulerPath = path.join(__dirname, 'auto-indexing-scheduler.js');
  
  console.log('📋 스케줄러 정보:');
  console.log(`   실행 파일: ${schedulerPath}`);
  console.log(`   대상 도메인: https://tripradio.shop`);
  console.log(`   체크 간격: 1시간`);
  console.log(`   목표: 남은 가이드 + 랜딩페이지 색인`);
  console.log('');
  
  console.log('💡 중단 방법: Ctrl+C');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // 스케줄러 프로세스 시작
  const scheduler = spawn('node', [schedulerPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_BASE_URL: 'https://tripradio.shop'
    }
  });
  
  // 프로세스 종료 처리
  scheduler.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ 스케줄러가 정상적으로 완료되었습니다.');
      console.log('🎉 모든 색인 작업이 완료되었습니다!');
    } else {
      console.log(`\n❌ 스케줄러가 오류로 종료되었습니다. 종료 코드: ${code}`);
      console.log('🔧 문제 해결 후 다시 실행해주세요.');
    }
  });
  
  scheduler.on('error', (error) => {
    console.error('❌ 스케줄러 시작 실패:', error.message);
  });
  
  // 종료 신호 처리
  process.on('SIGINT', () => {
    console.log('\n⏹️ 스케줄러 중단 중...');
    scheduler.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n⏹️ 스케줄러 종료 중...');
    scheduler.kill('SIGTERM');
  });
}

/**
 * 메인 실행 함수
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('📖 할당량 자동 체크 스케줄러 시작 도구\n');
    console.log('사용법:');
    console.log('   node scripts/start-scheduler.js');
    console.log('');
    console.log('기능:');
    console.log('   - Google Indexing API 할당량 재설정 대기');
    console.log('   - 할당량 재설정 후 자동으로 남은 색인 작업 실행');
    console.log('   - 1시간마다 할당량 상태 체크');
    console.log('   - 모든 작업 완료 후 자동 종료');
    console.log('');
    console.log('환경 변수:');
    console.log('   NEXT_PUBLIC_BASE_URL=https://tripradio.shop (기본값)');
    console.log('');
    console.log('중단 방법:');
    console.log('   Ctrl+C');
    return;
  }
  
  console.log('🔍 구글 서치 콘솔 할당량 자동 체크 시작\n');
  
  startScheduler();
}

// 스크립트 직접 실행 시
if (require.main === module) {
  main();
}

module.exports = { startScheduler };
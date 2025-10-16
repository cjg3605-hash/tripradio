#!/usr/bin/env node
// scripts/tomorrow-indexing.js
// 내일 할당량 재설정 후 실행할 색인 스크립트

const { execSync } = require('child_process');

console.log('🌅 내일 Google Indexing API 할당량 재설정 후 실행할 색인 스크립트');
console.log('📅 실행 날짜:', new Date().toLocaleDateString('ko-KR'));
console.log('');

async function main() {
  try {
    console.log('1️⃣ 제외 목록 상태 확인 중...\n');
    
    // 제외 목록 상태 확인
    execSync('node scripts/indexing-exclude-manager.js status', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n2️⃣ SEO 설정 검증 중...\n');
    
    // SEO 설정 검증
    execSync('NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js validate', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n3️⃣ 남은 가이드 테스트 실행 중...\n');
    
    // 테스트 실행 (제외 목록 적용) - 테스트는 localhost 가능
    execSync('node scripts/seo-batch-indexing.js dry-run', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n4️⃣ 실제 색인 요청 실행 중 (오늘 처리한 것 제외)...\n');
    
    // 실제 색인 요청 (오늘 처리한 것 제외) - 반드시 프로덕션 URL 사용
    execSync('NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js run-remaining-only', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n5️⃣ 최종 상태 확인 중...\n');
    
    // 최종 상태 확인
    execSync('NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js status', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n✅ 내일 색인 작업 완료!');
    console.log('📊 Google Search Console에서 1-3일 후 색인 상태를 확인하세요.');
    
  } catch (error) {
    console.error('\n❌ 내일 색인 작업 실행 중 오류 발생:', error.message);
    console.log('\n🔄 수동 실행 명령어:');
    console.log('   1. npm run dev  (다른 터미널에서 서버 실행)');
    console.log('   2. NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js validate');
    console.log('   3. NEXT_PUBLIC_BASE_URL=https://navidocent.com node scripts/seo-batch-indexing.js run-remaining-only');
    
    process.exit(1);
  }
}

// 사용법 안내
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('📖 사용법:');
  console.log('   node scripts/tomorrow-indexing.js');
  console.log('');
  console.log('📋 실행 내용:');
  console.log('   1. 제외 목록 상태 확인');
  console.log('   2. SEO 설정 검증');
  console.log('   3. 테스트 실행 (남은 가이드)');
  console.log('   4. 실제 색인 요청 (오늘 처리한 것 제외)');
  console.log('   5. 최종 상태 확인');
  console.log('');
  console.log('⚠️ 주의사항:');
  console.log('   - 서버가 실행 중이어야 합니다 (npm run dev)');
  console.log('   - Google API 할당량이 재설정된 후 실행하세요');
  console.log('   - 네트워크 연결 상태를 확인하세요');
  
  process.exit(0);
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 스크립트 실행 실패:', error);
  process.exit(1);
});
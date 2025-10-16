#!/usr/bin/env node
// scripts/auto-indexing-scheduler.js
// 할당량 재설정 후 자동 색인 실행 스케줄러 (실제 도메인 지원)

const { execSync } = require('child_process');

// 환경 변수에서 기본 URL 가져오기
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://navidocent.com';
const API_URL = `${BASE_URL}/api/seo`;

/**
 * 할당량 상태 확인 및 자동 실행
 */
async function checkQuotaAndExecute() {
  const now = new Date();
  console.log(`🕐 ${now.toISOString()} - 할당량 상태 확인 중...`);
  console.log(`🌐 대상 도메인: ${BASE_URL}`);

  try {
    // 테스트 색인 요청으로 할당량 상태 확인
    console.log('🧪 할당량 상태 테스트 중...');
    const testResult = await fetch(`${API_URL}/retry-failed`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'AutoIndexingScheduler/1.0'
      },
      body: JSON.stringify({ 
        locations: ['경복궁'],
        maxRetries: 1,
        delayBetweenRetries: 1000
      }),
      timeout: 30000
    });

    if (!testResult.ok) {
      console.log(`⚠️ API 응답 오류: ${testResult.status} ${testResult.statusText}`);
      console.log('🔄 1시간 후 재시도...');
      return false;
    }

    const result = await testResult.json();
    console.log(`📊 테스트 결과: ${JSON.stringify(result, null, 2)}`);

    // 할당량 초과 확인
    const isQuotaError = result.error?.includes('Quota exceeded') ||
                        result.results?.[0]?.error?.includes('Quota exceeded') ||
                        JSON.stringify(result).includes('Quota exceeded');

    if (isQuotaError) {
      console.log('⏳ 아직 할당량이 재설정되지 않았습니다. 1시간 후 재시도...');
      return false;
    }

    console.log('✅ 할당량 재설정 확인! 배치 색인 시작...');
    
    // 전체 배치 색인 실행 (환경 변수 포함)
    console.log('🚀 전체 가이드 배치 색인 실행 중...');
    
    const command = `NEXT_PUBLIC_BASE_URL=${BASE_URL} node scripts/seo-batch-indexing.js run-remaining-only`;
    console.log(`📋 실행 명령: ${command}`);
    
    const batchResult = execSync(command, {
      encoding: 'utf-8',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_BASE_URL: BASE_URL
      }
    });
    
    console.log(batchResult);
    console.log('🎉 배치 색인 완료!');
    
    // 추가로 랜딩 페이지도 재시도
    console.log('🏢 랜딩 페이지 재시도 중...');
    const landingCommand = `NEXT_PUBLIC_BASE_URL=${BASE_URL} node scripts/seo-batch-indexing.js run-landing-pages`;
    
    try {
      const landingResult = execSync(landingCommand, {
        encoding: 'utf-8',
        cwd: process.cwd(),
        env: {
          ...process.env,
          NEXT_PUBLIC_BASE_URL: BASE_URL
        }
      });
      console.log('✅ 랜딩 페이지 색인 완료!');
    } catch (landingError) {
      console.log('⚠️ 랜딩 페이지 색인 일부 실패 (정상적임)');
    }
    
    return true;

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.log('🔄 네트워크 또는 API 오류. 1시간 후 재시도...');
    return false;
  }
}

/**
 * 메인 스케줄러 함수
 */
async function main() {
  console.log('📅 Google Indexing API 할당량 자동 체크 스케줄러 시작');
  console.log(`🌐 대상 도메인: ${BASE_URL}`);
  console.log('🎯 목표: 남은 가이드들 + 랜딩페이지 색인 완료');
  console.log('⏰ 할당량 재설정 시간: 매일 자정 (UTC)');
  console.log('📋 실행 모드: run-remaining-only + run-landing-pages');
  console.log('');

  // 환경 변수 확인
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('ℹ️ NEXT_PUBLIC_BASE_URL 환경 변수가 없음, 기본값 사용');
  }

  // 즉시 한 번 실행
  console.log('🔄 첫 번째 할당량 체크 시작...');
  const success = await checkQuotaAndExecute();
  
  if (success) {
    console.log('✅ 색인 완료! 스케줄러 종료.');
    console.log('📊 1-3일 후 Google Search Console에서 색인 상태를 확인하세요.');
    process.exit(0);
  }

  // 1시간마다 반복 체크
  console.log('⏰ 1시간마다 할당량 상태를 확인합니다...');
  console.log('💡 수동 중단: Ctrl+C');
  console.log('');

  const intervalId = setInterval(async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const success = await checkQuotaAndExecute();
    
    if (success) {
      console.log('✅ 색인 완료! 스케줄러 종료.');
      console.log('📊 1-3일 후 Google Search Console에서 색인 상태를 확인하세요.');
      clearInterval(intervalId);
      process.exit(0);
    }
  }, 60 * 60 * 1000); // 1시간 간격

  // 종료 신호 처리
  process.on('SIGINT', () => {
    console.log('\n⏹️ 스케줄러 중단 요청 받음...');
    clearInterval(intervalId);
    console.log('✅ 스케줄러 정상 종료.');
    process.exit(0);
  });
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스케줄러 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = { checkQuotaAndExecute };
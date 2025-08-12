#!/usr/bin/env node

/**
 * 🔄 전체 가이드 마이그레이션 스크립트
 * 모든 기존 가이드에 대해 지역 정보와 좌표를 안전하게 업데이트합니다.
 */

const BATCH_SIZE = 20; // 배치당 처리할 가이드 수 (2배 증가)
const DELAY_BETWEEN_BATCHES = 1000; // 배치 간 대기 시간 (ms) (절반으로 단축)
const MAX_RETRIES = 3; // 최대 재시도 횟수

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMigrationStatus() {
  try {
    const response = await fetch('http://localhost:3030/api/coordinates/migrate');
    return await response.json();
  } catch (error) {
    console.error('❌ 상태 조회 실패:', error.message);
    return null;
  }
}

async function runMigrationBatch(offset, limit) {
  try {
    const response = await fetch('http://localhost:3030/api/coordinates/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit,
        offset,
        forceUpdate: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ 배치 ${offset}-${offset + limit} 실패:`, error.message);
    return null;
  }
}

async function runFullMigration() {
  console.log('🚀 전체 가이드 마이그레이션 시작');
  console.log('=' + '='.repeat(50));

  // 초기 상태 확인
  let status = await fetchMigrationStatus();
  if (!status || !status.success) {
    console.error('❌ 초기 상태 확인 실패');
    process.exit(1);
  }

  console.log(`📊 초기 현황:`);
  console.log(`  전체: ${status.data.total}개`);
  console.log(`  완료: ${status.data.migrated}개`);
  console.log(`  남은: ${status.data.remaining}개`);
  console.log(`  진행률: ${status.data.progress}`);
  console.log('');

  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let currentOffset = 0;
  let batchNumber = 1;

  while (status.data.remaining > 0) {
    console.log(`📦 배치 ${batchNumber} 시작 (offset: ${currentOffset}, limit: ${BATCH_SIZE})`);
    
    let retryCount = 0;
    let batchResult = null;

    // 재시도 로직
    while (retryCount < MAX_RETRIES && !batchResult) {
      if (retryCount > 0) {
        console.log(`🔄 재시도 ${retryCount}/${MAX_RETRIES}`);
        await delay(DELAY_BETWEEN_BATCHES * retryCount); // 지수적 백오프
      }

      batchResult = await runMigrationBatch(currentOffset, BATCH_SIZE);
      retryCount++;
    }

    if (!batchResult) {
      console.error(`❌ 배치 ${batchNumber} 최대 재시도 후 실패`);
      break;
    }

    // 배치 결과 집계
    totalProcessed += batchResult.stats.processed;
    totalSuccess += batchResult.stats.success;
    totalFailed += batchResult.stats.failed;
    totalSkipped += batchResult.stats.skipped;

    console.log(`✅ 배치 ${batchNumber} 완료:`);
    console.log(`  처리: ${batchResult.stats.processed}개`);
    console.log(`  성공: ${batchResult.stats.success}개`);
    console.log(`  실패: ${batchResult.stats.failed}개`);
    console.log(`  스킵: ${batchResult.stats.skipped}개`);

    if (batchResult.stats.errors.length > 0) {
      console.log(`  오류: ${batchResult.stats.errors.slice(0, 3).join(', ')}${batchResult.stats.errors.length > 3 ? '...' : ''}`);
    }

    // 진행률 업데이트
    status = await fetchMigrationStatus();
    if (status && status.success) {
      console.log(`📊 전체 진행률: ${status.data.progress} (${status.data.migrated}/${status.data.total})`);
    }

    console.log('');

    // 완료 체크
    if (!batchResult.hasMore || (batchResult.stats.processed === 0 && batchResult.stats.success === 0)) {
      console.log('🎯 더 이상 처리할 가이드가 없습니다.');
      break;
    }

    // 다음 배치 준비
    currentOffset += BATCH_SIZE;
    batchNumber++;

    // API 부하 방지를 위한 대기
    console.log(`⏳ ${DELAY_BETWEEN_BATCHES/1000}초 대기 중...`);
    await delay(DELAY_BETWEEN_BATCHES);
  }

  // 최종 결과 보고
  console.log('=' + '='.repeat(50));
  console.log('🎉 전체 마이그레이션 완료!');
  console.log(`📊 최종 통계:`);
  console.log(`  총 처리: ${totalProcessed}개`);
  console.log(`  성공: ${totalSuccess}개 (${((totalSuccess/totalProcessed)*100).toFixed(1)}%)`);
  console.log(`  실패: ${totalFailed}개`);
  console.log(`  스킵: ${totalSkipped}개`);

  // 최종 상태 확인
  const finalStatus = await fetchMigrationStatus();
  if (finalStatus && finalStatus.success) {
    console.log(`📈 최종 진행률: ${finalStatus.data.progress}`);
    console.log(`✅ 완료된 가이드: ${finalStatus.data.migrated}/${finalStatus.data.total}개`);
  }

  console.log('🚀 마이그레이션이 성공적으로 완료되었습니다!');
}

// 스크립트 실행
if (require.main === module) {
  runFullMigration().catch(error => {
    console.error('❌ 마이그레이션 실행 중 치명적 오류:', error);
    process.exit(1);
  });
}

module.exports = { runFullMigration };
#!/usr/bin/env node
// scripts/seo-batch-indexing.js
// 기존 가이드 일괄 색인 관리 스크립트 (제외 목록 지원)

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
const { getExcludedLocations } = require('./indexing-exclude-manager');

/**
 * API 호출 헬퍼
 */
async function apiCall(endpoint, method = 'GET', data = null) {
  const url = `${baseUrl}/api/seo${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`❌ API 호출 실패 (${url}):`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 현재 상태 확인
 */
async function checkStatus() {
  console.log('📊 현재 색인 상태 확인 중...\n');
  
  const status = await apiCall('/batch-indexing');
  
  if (status.success) {
    console.log('📈 현재 상태:');
    console.log(`   전체 가이드: ${status.status.totalGuides}개`);
    console.log(`   색인 완료 (추정): ${status.status.estimatedIndexed}개`);
    console.log(`   색인 실패 (추정): ${status.status.estimatedFailed}개`);
    console.log(`   색인 필요: ${status.status.estimatedUnindexed}개\n`);
    
    console.log('💡 권장 설정:');
    console.log(`   모드: ${status.recommendations.suggestedMode}`);
    console.log(`   배치 크기: ${status.recommendations.suggestedBatchSize}`);
    console.log(`   예상 소요시간: ${status.recommendations.estimatedTime}분\n`);
    
    return status;
  } else {
    console.error('❌ 상태 확인 실패:', status.error);
    return null;
  }
}

/**
 * 설정 검증
 */
async function validateConfig() {
  console.log('🔍 색인 설정 검증 중...\n');
  
  const validation = await apiCall('/validate-config', 'POST');
  
  if (validation.success) {
    console.log(`🎯 설정 점수: ${validation.overallScore}/100`);
    console.log(`📊 상태: ${validation.status}`);
    console.log(`✅ 준비 완료: ${validation.isReady ? 'Yes' : 'No'}\n`);
    
    if (validation.nextSteps && validation.nextSteps.length > 0) {
      console.log('📋 다음 단계:');
      validation.nextSteps.forEach(step => console.log(`   ${step}`));
      console.log('');
    }
    
    return validation.isReady;
  } else {
    console.error('❌ 설정 검증 실패:', validation.error);
    return false;
  }
}

/**
 * 일괄 색인 실행 (제외 목록 지원)
 */
async function runBatchIndexing(options = {}) {
  const {
    mode = 'all',
    batchSize = 10,
    delayBetweenBatches = 2000,
    dryRun = false,
    excludeProcessed = true
  } = options;
  
  console.log('🚀 일괄 색인 시작...\n');
  console.log(`⚙️ 설정: 모드=${mode}, 배치크기=${batchSize}, 지연=${delayBetweenBatches}ms, 테스트=${dryRun}\n`);
  
  // 제외 목록 확인
  let excludedLocations = [];
  if (excludeProcessed) {
    try {
      excludedLocations = getExcludedLocations();
      if (excludedLocations.length > 0) {
        console.log(`📋 제외할 위치: ${excludedLocations.length}개`);
        console.log(`   제외 위치 예시: ${excludedLocations.slice(0, 5).join(', ')}${excludedLocations.length > 5 ? '...' : ''}\n`);
      }
    } catch (error) {
      console.log('⚠️ 제외 목록 로드 실패, 모든 가이드 처리:', error.message);
    }
  }
  
  const result = await apiCall('/batch-indexing', 'POST', {
    mode,
    batchSize,
    delayBetweenBatches,
    dryRun,
    excludedLocations: excludeProcessed ? excludedLocations : []
  });
  
  if (result.success) {
    if (result.dryRun) {
      console.log('🧪 테스트 모드 결과:');
      console.log(`   대상 가이드: ${result.guidesToIndex?.length || 0}개`);
      console.log(`   예상 URL: ${result.estimatedUrls}개`);
      console.log(`   예상 소요시간: ${result.estimatedTime}초\n`);
      return result;
    }
    
    console.log('🎉 일괄 색인 완료!\n');
    console.log('📊 결과 요약:');
    console.log(`   처리 가이드: ${result.processedGuides}/${result.totalGuides}`);
    console.log(`   성공 URL: ${result.successfulUrls}/${result.totalUrls} (${(result.overallSuccessRate * 100).toFixed(1)}%)`);
    console.log(`   소요시간: ${(result.processingTime / 1000).toFixed(1)}초\n`);
    
    if (result.nextSteps && result.nextSteps.length > 0) {
      console.log('📋 다음 단계:');
      result.nextSteps.forEach(step => console.log(`   ${step}`));
      console.log('');
    }
    
    // 실패한 가이드가 있으면 표시
    const failedGuides = result.results?.filter(r => r.successRate < 0.5) || [];
    if (failedGuides.length > 0) {
      console.log(`⚠️ 실패한 가이드 (${failedGuides.length}개):`);
      failedGuides.forEach(guide => {
        console.log(`   ${guide.locationName}: ${guide.successful}/${guide.urls} 성공`);
        if (guide.errors && guide.errors.length > 0) {
          guide.errors.forEach(error => console.log(`     오류: ${error}`));
        }
      });
      console.log('');
    }
    
    return result;
  } else {
    console.error('❌ 일괄 색인 실패:', result.error);
    return null;
  }
}

/**
 * 실패한 색인 재시도
 */
async function retryFailed(locations = []) {
  console.log('🔄 실패한 색인 재시도 시작...\n');
  
  const result = await apiCall('/retry-failed', 'POST', {
    locations,
    maxRetries: 3,
    delayBetweenRetries: 2000
  });
  
  if (result.success !== undefined) {
    console.log('🎯 재시도 완료!\n');
    console.log('📊 결과:');
    console.log(`   대상 URL: ${result.total}개`);
    console.log(`   성공: ${result.successful}개`);
    console.log(`   실패: ${result.failed}개`);
    console.log(`   성공률: ${(result.successRate * 100).toFixed(1)}%\n`);
    
    if (result.nextSteps && result.nextSteps.length > 0) {
      console.log('📋 다음 단계:');
      result.nextSteps.forEach(step => console.log(`   ${step}`));
      console.log('');
    }
    
    return result;
  } else {
    console.error('❌ 재시도 실패:', result.error);
    return null;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  console.log('🔍 NaviDocent SEO 일괄 색인 관리 도구\n');
  
  switch (command) {
    case 'status':
      await checkStatus();
      break;
      
    case 'validate':
      await validateConfig();
      break;
      
    case 'dry-run':
      await runBatchIndexing({ dryRun: true });
      break;
      
    case 'run-all':
      const isReady = await validateConfig();
      if (isReady) {
        await runBatchIndexing({ mode: 'all' });
      } else {
        console.log('❌ 설정이 완료되지 않았습니다. 먼저 설정을 완료하세요.');
      }
      break;
      
    case 'run-small-batch':
      await runBatchIndexing({ 
        mode: 'all', 
        batchSize: 5, 
        delayBetweenBatches: 3000,
        excludeProcessed: true
      });
      break;
      
    case 'run-remaining-only':
      console.log('🎯 오늘 처리하지 않은 가이드만 색인 요청...\n');
      await runBatchIndexing({ 
        mode: 'all', 
        batchSize: 5, 
        delayBetweenBatches: 3000,
        excludeProcessed: true
      });
      break;
      
    case 'retry':
      const locations = args.slice(1);
      if (locations.length > 0) {
        await retryFailed(locations);
      } else {
        console.log('❌ 재시도할 장소명을 지정하세요.');
        console.log('   예: node scripts/seo-batch-indexing.js retry 부산 제주도');
      }
      break;
      
    case 'full-process':
      console.log('🚀 전체 프로세스 시작...\n');
      
      // 1. 설정 검증
      const configOk = await validateConfig();
      if (!configOk) {
        console.log('❌ 설정 검증 실패. 프로세스 중단.');
        break;
      }
      
      // 2. 상태 체크
      await checkStatus();
      
      // 3. 테스트 실행
      console.log('🧪 테스트 실행...\n');
      await runBatchIndexing({ dryRun: true });
      
      // 4. 실제 실행 (소규모 배치)
      console.log('🎯 실제 색인 시작 (안전한 배치 크기)...\n');
      await runBatchIndexing({ 
        mode: 'all', 
        batchSize: 5, 
        delayBetweenBatches: 3000 
      });
      
      break;
      
    case 'help':
    default:
      console.log('📖 사용법:');
      console.log('   node scripts/seo-batch-indexing.js <command>');
      console.log('');
      console.log('📋 명령어:');
      console.log('   status              - 현재 색인 상태 확인');
      console.log('   validate            - 색인 설정 검증');
      console.log('   dry-run             - 테스트 실행 (실제 요청 안 함)');
      console.log('   run-all             - 모든 가이드 색인 요청');
      console.log('   run-small-batch     - 안전한 소규모 배치로 색인');
      console.log('   run-remaining-only  - 오늘 처리하지 않은 가이드만 색인 ⭐');
      console.log('   retry <장소명>      - 특정 장소 재시도 (예: retry 부산 제주도)');
      console.log('   full-process        - 전체 프로세스 자동 실행');
      console.log('   help                - 도움말');
      console.log('');
      console.log('💡 권장 순서 (할당량 절약):');
      console.log('   1. node scripts/seo-batch-indexing.js validate');
      console.log('   2. node scripts/seo-batch-indexing.js dry-run');
      console.log('   3. node scripts/seo-batch-indexing.js run-remaining-only  ⭐ (오늘한거 제외)');
      console.log('   4. node scripts/seo-batch-indexing.js status');
      console.log('');
      console.log('🔄 제외 목록 관리:');
      console.log('   - node scripts/indexing-exclude-manager.js status      (제외 목록 확인)');
      console.log('   - node scripts/indexing-exclude-manager.js add-today   (오늘 성공분 추가)');
      break;
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = {
  checkStatus,
  validateConfig,
  runBatchIndexing,
  retryFailed
};
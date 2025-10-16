#!/usr/bin/env node
// scripts/check-indexing-via-api.js
// API를 통한 색인 상태 확인 및 URL 정리 도구

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tripradio.shop';

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
    console.error(`❌ API 호출 실패 (${url}):`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 색인 요청 상태 확인
 */
async function checkIndexingStatus() {
  console.log('📊 색인 요청 상태 확인\n');
  
  const status = await apiCall('/batch-indexing');
  
  if (status.success) {
    console.log('📈 현재 상태:');
    console.log(`   전체 가이드: ${status.status.totalGuides}개`);
    console.log(`   색인 완료 (추정): ${status.status.estimatedIndexed}개`);
    console.log(`   색인 실패 (추정): ${status.status.estimatedFailed}개`);
    console.log(`   색인 필요: ${status.status.estimatedUnindexed}개\n`);
    
    return status.status;
  } else {
    console.error('❌ 상태 확인 실패:', status.error);
    return null;
  }
}

/**
 * 실제 웹사이트 URL 검증
 */
async function validateUrls(sampleSize = 10) {
  console.log(`🔍 실제 URL 접근성 검증 (샘플 ${sampleSize}개)\n`);
  
  try {
    // 주요 URL들 샘플링
    const testUrls = [
      `${baseUrl}`,
      `${baseUrl}/guide/ko/경복궁`,
      `${baseUrl}/guide/ko/남산타워`,
      `${baseUrl}/guide/ko/제주도`,
      `${baseUrl}/guide/ko/부산`,
      `${baseUrl}/guide/en/seoul`,
      `${baseUrl}/guide/ja/seoul`,
      `${baseUrl}/guide/zh/seoul`,
      `${baseUrl}/guide/es/seoul`,
      `${baseUrl}/regions/korea`
    ];

    console.log('📋 검증할 URL:');
    const results = [];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          timeout: 5000
        });
        
        const status = response.status;
        const statusText = response.statusText;
        const isValid = status >= 200 && status < 400;
        
        console.log(`   ${isValid ? '✅' : '❌'} ${url} (${status} ${statusText})`);
        
        results.push({
          url,
          status,
          statusText,
          isValid
        });
      } catch (error) {
        console.log(`   ❌ ${url} (오류: ${error.message})`);
        results.push({
          url,
          status: 0,
          statusText: error.message,
          isValid: false
        });
      }
    }
    
    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.length - validCount;
    
    console.log(`\n📊 검증 결과:`);
    console.log(`   유효한 URL: ${validCount}개`);
    console.log(`   유효하지 않은 URL: ${invalidCount}개`);
    console.log(`   성공률: ${((validCount / results.length) * 100).toFixed(1)}%\n`);
    
    return results;
    
  } catch (error) {
    console.error('❌ URL 검증 실패:', error.message);
    return null;
  }
}

/**
 * 가이드 목록과 URL 패턴 확인
 */
async function analyzeGuideUrls() {
  console.log('🗺️ 가이드 URL 패턴 분석\n');
  
  try {
    // 실제 가이드 목록 API 호출 시도
    const guidesResponse = await fetch(`${baseUrl}/api/guides`);
    
    if (guidesResponse.ok) {
      const guides = await guidesResponse.json();
      
      console.log(`📚 전체 가이드: ${guides.length}개`);
      
      // 언어별 URL 패턴 분석
      const languages = ['ko', 'en', 'ja', 'zh', 'es'];
      const urlPatterns = [];
      
      guides.slice(0, 5).forEach(guide => {
        languages.forEach(lang => {
          const url = `${baseUrl}/guide/${lang}/${encodeURIComponent(guide.name || guide.location_name)}`;
          urlPatterns.push({
            guide: guide.name || guide.location_name,
            language: lang,
            url
          });
        });
      });
      
      console.log('\n📋 URL 패턴 예시 (처음 5개 가이드):');
      urlPatterns.forEach(pattern => {
        console.log(`   ${pattern.guide} (${pattern.language}): ${pattern.url}`);
      });
      
      // 잠재적 문제 URL 패턴 식별
      const problematicPatterns = [];
      
      guides.forEach(guide => {
        const name = guide.name || guide.location_name;
        if (!name) {
          problematicPatterns.push({ issue: 'missing_name', guide });
        } else if (name.includes('undefined') || name.includes('null')) {
          problematicPatterns.push({ issue: 'invalid_name', guide, name });
        } else if (name.length > 100) {
          problematicPatterns.push({ issue: 'too_long', guide, name });
        }
      });
      
      if (problematicPatterns.length > 0) {
        console.log(`\n⚠️ 문제가 있는 가이드 (${problematicPatterns.length}개):`);
        problematicPatterns.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.issue}: ${item.name || 'N/A'}`);
        });
      } else {
        console.log('\n✅ 모든 가이드 이름이 유효합니다.');
      }
      
      return {
        totalGuides: guides.length,
        urlPatterns,
        problematicPatterns
      };
      
    } else {
      console.log('⚠️ 가이드 API 응답 실패. 대안 방법으로 확인...');
      
      // 대안: 색인 배치 API의 dry-run으로 URL 확인
      const dryRunResult = await apiCall('/batch-indexing', 'POST', {
        dryRun: true,
        mode: 'all',
        batchSize: 5
      });
      
      if (dryRunResult.success) {
        console.log(`📊 Dry-run 결과:`);
        console.log(`   대상 가이드: ${dryRunResult.guidesToIndex?.length || 0}개`);
        console.log(`   예상 URL: ${dryRunResult.estimatedUrls}개`);
        
        return {
          totalGuides: dryRunResult.guidesToIndex?.length || 0,
          estimatedUrls: dryRunResult.estimatedUrls
        };
      }
    }
    
  } catch (error) {
    console.error('❌ 가이드 분석 실패:', error.message);
    return null;
  }
}

/**
 * Google Search Console 색인 상태 테스트
 */
async function testSearchConsoleIndexing() {
  console.log('🔍 Google Search Console 색인 테스트\n');
  
  try {
    // 샘플 URL로 색인 요청 테스트
    const testUrl = `${baseUrl}/guide/ko/경복궁`;
    
    console.log(`🧪 테스트 URL: ${testUrl}`);
    
    const testResult = await apiCall('/batch-indexing', 'POST', {
      mode: 'test',
      testUrls: [testUrl],
      dryRun: false
    });
    
    if (testResult.success) {
      console.log('✅ 색인 요청 API 정상 작동');
      console.log(`   응답: ${JSON.stringify(testResult, null, 2)}`);
    } else {
      console.log('❌ 색인 요청 실패');
      console.log(`   오류: ${testResult.error}`);
      
      // 할당량 초과 확인
      if (testResult.error?.includes('Quota exceeded')) {
        console.log('⚠️ Google Indexing API 할당량 초과 상태');
        console.log('   내일 할당량 재설정 후 자동 재시도됩니다.');
      }
    }
    
    return testResult;
    
  } catch (error) {
    console.error('❌ Search Console 테스트 실패:', error.message);
    return null;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';
  
  console.log('🔍 API 기반 색인 상태 확인 도구\n');
  
  switch (command) {
    case 'status':
      await checkIndexingStatus();
      break;
      
    case 'validate-urls':
      await validateUrls();
      break;
      
    case 'analyze-guides':
      await analyzeGuideUrls();
      break;
      
    case 'test-indexing':
      await testSearchConsoleIndexing();
      break;
      
    case 'full-check':
      console.log('📊 전체 상태 검사 시작\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await checkIndexingStatus();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await validateUrls();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await analyzeGuideUrls();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await testSearchConsoleIndexing();
      break;
      
    case 'help':
    default:
      console.log('📖 사용법:');
      console.log('   node scripts/check-indexing-via-api.js <command>');
      console.log('');
      console.log('📋 명령어:');
      console.log('   status           - 색인 요청 상태 확인');
      console.log('   validate-urls    - 실제 URL 접근성 검증');
      console.log('   analyze-guides   - 가이드 URL 패턴 분석');
      console.log('   test-indexing    - Google Search Console 색인 테스트');
      console.log('   full-check       - 전체 상태 검사');
      console.log('   help             - 도움말');
      console.log('');
      console.log('💡 권장 순서:');
      console.log('   1. node scripts/check-indexing-via-api.js full-check');
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
  checkIndexingStatus,
  validateUrls,
  analyzeGuideUrls,
  testSearchConsoleIndexing
};
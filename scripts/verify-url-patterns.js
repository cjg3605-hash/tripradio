#!/usr/bin/env node
// scripts/verify-url-patterns.js
// 실제 사이트의 URL 패턴 검증

/**
 * 실제 URL 패턴 테스트
 */
async function testActualUrlPatterns() {
  console.log('🔍 실제 사이트 URL 패턴 검증\n');
  
  const baseUrl = 'https://tripradio.shop';
  const sampleLocation = '경복궁';
  
  // 테스트할 URL 패턴들
  const urlPatterns = [
    // 기본 패턴
    `${baseUrl}`,
    `${baseUrl}/guide/ko/${encodeURIComponent(sampleLocation)}`,
    
    // 새로운 언어 URL 패턴  
    `${baseUrl}?lang=en`,
    `${baseUrl}/guide/en/${encodeURIComponent(sampleLocation)}`,
    `${baseUrl}/guide/ja/${encodeURIComponent(sampleLocation)}`,
    `${baseUrl}/guide/zh/${encodeURIComponent(sampleLocation)}`,
    `${baseUrl}/guide/es/${encodeURIComponent(sampleLocation)}`,
    
    // 언어별 패턴들 테스트
    `${baseUrl}/en`,
    `${baseUrl}/guide/en/${encodeURIComponent(sampleLocation)}`,
    `${baseUrl}/guide/ja/${encodeURIComponent(sampleLocation)}`,
    
    // 랜딩 페이지들
    `${baseUrl}/ai-travel`,
    `${baseUrl}/ai-travel?lang=en`,
    `${baseUrl}/destinations`,
    `${baseUrl}/trip-planner`,
    `${baseUrl}/visa-checker`
  ];

  console.log('📋 테스트할 URL 패턴:');
  const results = [];
  
  for (const url of urlPatterns) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
        }
      });
      
      const status = response.status;
      const isValid = status >= 200 && status < 400;
      
      console.log(`   ${isValid ? '✅' : '❌'} ${url} (${status})`);
      
      results.push({
        url,
        status,
        isValid,
        pattern: url.includes('?lang=') ? 'query-param' : 
                url.includes('/en/') || url.includes('/ja/') ? 'path-prefix' : 'default'
      });
      
      // 요청 간격 조절
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`   ❌ ${url} (오류: ${error.message})`);
      results.push({
        url,
        status: 0,
        isValid: false,
        error: error.message
      });
    }
  }
  
  // 결과 분석
  console.log('\n📊 패턴별 분석:');
  
  const patternAnalysis = {
    'default': results.filter(r => r.pattern === 'default'),
    'query-param': results.filter(r => r.pattern === 'query-param'), 
    'path-prefix': results.filter(r => r.pattern === 'path-prefix')
  };
  
  Object.entries(patternAnalysis).forEach(([pattern, urls]) => {
    const validCount = urls.filter(r => r.isValid).length;
    const totalCount = urls.length;
    console.log(`   ${pattern}: ${validCount}/${totalCount} 유효 (${((validCount/totalCount)*100).toFixed(1)}%)`);
  });
  
  // 권장 URL 패턴 결정
  console.log('\n💡 권장 URL 패턴:');
  
  const queryParamSuccess = patternAnalysis['query-param'].filter(r => r.isValid).length > 0;
  const pathPrefixSuccess = patternAnalysis['path-prefix'].filter(r => r.isValid).length > 0;
  
  if (queryParamSuccess) {
    console.log('   ✅ 새로운 URL 방식: /guide/language/location (권장)');
  }
  
  if (pathPrefixSuccess) {
    console.log('   ✅ 경로 프리픽스 방식: /en/guide/location');
  }
  
  if (!queryParamSuccess && !pathPrefixSuccess) {
    console.log('   ⚠️ 기본 한국어만 지원: /guide/location');
  }
  
  return results;
}

/**
 * 올바른 URL 생성 함수 추천
 */
function generateRecommendedUrls(locationName, validPatterns) {
  console.log('\n🎯 올바른 URL 생성 로직:\n');
  
  const baseUrl = 'https://tripradio.shop';
  const languages = ['ko', 'en', 'ja', 'zh', 'es'];
  
  console.log('```typescript');
  console.log('generateGuideUrls(locationName: string): string[] {');
  console.log(`  const baseUrl = '${baseUrl}';`);
  console.log('  const urls: string[] = [];');
  console.log('  ');
  console.log('  // 기본 한국어 URL');
  console.log('  urls.push(`${baseUrl}/guide/${encodeURIComponent(locationName)}`);');
  console.log('  ');
  
  if (validPatterns.some(p => p.pattern === 'query-param' && p.isValid)) {
    console.log('  // 언어별 URL (새로운 구조)');
    console.log("  ['en', 'ja', 'zh', 'es'].forEach(lang => {");
    console.log('    urls.push(`${baseUrl}/guide/${lang}/${encodeURIComponent(locationName)}`);');
    console.log('  });');
  } else {
    console.log('  // 다국어 미지원 - 한국어만');
  }
  
  console.log('  ');
  console.log('  return urls;');
  console.log('}');
  console.log('```');
  
  // 실제 URL 예시
  console.log('\n📋 생성될 URL 예시:');
  const sampleUrls = [
    `${baseUrl}/guide/ko/${encodeURIComponent(locationName)}`
  ];
  
  if (validPatterns.some(p => p.pattern === 'query-param' && p.isValid)) {
    ['en', 'ja', 'zh', 'es'].forEach(lang => {
      sampleUrls.push(`${baseUrl}/guide/${lang}/${encodeURIComponent(locationName)}`);
    });
  }
  
  sampleUrls.forEach(url => {
    console.log(`   ${url}`);
  });
  
  return sampleUrls;
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🔍 실제 사이트 URL 패턴 검증 도구\n');
  
  try {
    const results = await testActualUrlPatterns();
    const validPatterns = results.filter(r => r.isValid);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    generateRecommendedUrls('경복궁', validPatterns);
    
    console.log('\n🎉 검증 완료!');
    console.log('💡 이 결과를 바탕으로 IndexingService의 generateGuideUrls 함수를 수정하세요.');
    
  } catch (error) {
    console.error('❌ 검증 실패:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}

module.exports = { testActualUrlPatterns, generateRecommendedUrls };
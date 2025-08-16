/**
 * 구엘저택 라우팅 수정 테스트 스크립트
 */

const { routeLocationQueryCached } = require('./src/lib/location/location-router');
const { analyzeIntentByRules, comprehensiveIntentAnalysis } = require('./src/lib/location/intent-analysis');
const { classifyLocationDynamic } = require('./src/lib/location/dynamic-location-classifier');

async function testRoutingFix() {
  console.log('🧪 구엘저택 라우팅 수정 테스트 시작\n');
  
  const testCases = [
    '구엘저택',
    '구엘궁',
    '구엘궁전',
    '구엘공원',
    'Park Güell',
    'Palau Güell',
    '사그라다 파밀리아',
    '카사 바트요',
    '루브르박물관'
  ];
  
  for (const testCase of testCases) {
    console.log(`🔍 테스트: "${testCase}"`);
    
    try {
      // 1. 규칙 기반 분석 테스트
      const ruleResult = analyzeIntentByRules(testCase);
      if (ruleResult) {
        console.log(`  📋 규칙 기반: ${ruleResult.pageType} (신뢰도: ${ruleResult.confidence})`);
      } else {
        console.log(`  📋 규칙 기반: 매치 없음`);
      }
      
      // 2. 동적 분류 테스트
      const dynamicResult = await classifyLocationDynamic(testCase);
      console.log(`  🔄 동적 분류: ${dynamicResult.pageType} (소스: ${dynamicResult.source}, 신뢰도: ${dynamicResult.confidence})`);
      
      // 3. 종합 라우팅 테스트
      const routingResult = await routeLocationQueryCached(testCase, 'ko');
      console.log(`  🎯 최종 라우팅: ${routingResult.pageType} (방법: ${routingResult.processingMethod}, 신뢰도: ${routingResult.confidence})`);
      console.log(`  💭 이유: ${routingResult.reasoning}`);
      
      // 결과 검증
      const expected = 'DetailedGuidePage';
      const success = routingResult.pageType === expected;
      console.log(`  ${success ? '✅ 성공' : '❌ 실패'}: 예상(${expected}) vs 실제(${routingResult.pageType})`);
      
    } catch (error) {
      console.log(`  ❌ 오류: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 테스트 완료');
}

// 모듈이 직접 실행될 때만 테스트 실행
if (require.main === module) {
  testRoutingFix().catch(console.error);
}

module.exports = { testRoutingFix };
/**
 * 위치 분류 정확도 테스트
 * 서치 라우트와 동적 분류기의 정확도를 비교 분석합니다.
 */

const { routeLocationQuery } = require('./src/lib/location/location-router');
const { classifyLocationDynamic } = require('./src/lib/location/dynamic-location-classifier');

// 10개의 테스트 케이스 - 다양한 유형의 장소
const TEST_CASES = [
  {
    name: "에펠탑",
    expected: "DetailedGuidePage", // 구체적 명소 → 가이드 페이지
    type: "landmark"
  },
  {
    name: "파리",
    expected: "RegionExploreHub", // 도시 → 허브 페이지  
    type: "city"
  },
  {
    name: "경복궁",
    expected: "DetailedGuidePage", // 궁궐/명소 → 가이드 페이지
    type: "landmark"
  },
  {
    name: "부산",
    expected: "RegionExploreHub", // 도시 → 허브 페이지
    type: "city"
  },
  {
    name: "타지마할",
    expected: "DetailedGuidePage", // 세계 유명 건축물 → 가이드 페이지
    type: "landmark"
  },
  {
    name: "뉴욕",
    expected: "RegionExploreHub", // 도시 → 허브 페이지
    type: "city"
  },
  {
    name: "콜로세움",
    expected: "DetailedGuidePage", // 역사적 건축물 → 가이드 페이지
    type: "landmark"
  },
  {
    name: "도쿄",
    expected: "RegionExploreHub", // 도시 → 허브 페이지
    type: "city"
  },
  {
    name: "마추픽추",
    expected: "DetailedGuidePage", // 유적지 → 가이드 페이지
    type: "landmark"
  },
  {
    name: "런던",
    expected: "RegionExploreHub", // 도시 → 허브 페이지
    type: "city"
  }
];

async function testClassificationAccuracy() {
  console.log('🧪 위치 분류 정확도 테스트 시작\n');
  console.log('=' .repeat(80));
  
  let routerCorrect = 0;
  let dynamicCorrect = 0;
  let bothCorrect = 0;
  const results = [];

  for (const testCase of TEST_CASES) {
    try {
      console.log(`\n📍 테스트: "${testCase.name}" (예상: ${testCase.expected})`);
      console.log('-'.repeat(60));

      // 1. 서치 라우터 테스트
      const routerStart = Date.now();
      const routerResult = await routeLocationQuery(testCase.name);
      const routerTime = Date.now() - routerStart;
      
      const routerCorrect_local = routerResult.pageType === testCase.expected;
      if (routerCorrect_local) routerCorrect++;

      console.log(`🔀 서치 라우터 결과:`);
      console.log(`   페이지 타입: ${routerResult.pageType} ${routerCorrect_local ? '✅' : '❌'}`);
      console.log(`   신뢰도: ${routerResult.confidence}`);
      console.log(`   처리 방법: ${routerResult.processingMethod}`);
      console.log(`   처리 시간: ${routerTime}ms`);
      console.log(`   이유: ${routerResult.reasoning}`);

      // 2. 동적 분류기 테스트  
      const dynamicStart = Date.now();
      const dynamicResult = await classifyLocationDynamic(testCase.name);
      const dynamicTime = Date.now() - dynamicStart;
      
      const dynamicCorrect_local = dynamicResult.pageType === testCase.expected;
      if (dynamicCorrect_local) dynamicCorrect++;

      console.log(`\n🤖 동적 분류기 결과:`);
      console.log(`   페이지 타입: ${dynamicResult.pageType} ${dynamicCorrect_local ? '✅' : '❌'}`);
      console.log(`   신뢰도: ${dynamicResult.confidence}`);
      console.log(`   소스: ${dynamicResult.source}`);
      console.log(`   처리 시간: ${dynamicTime}ms`);
      console.log(`   이유: ${dynamicResult.reasoning}`);

      // 둘 다 맞은 경우
      if (routerCorrect_local && dynamicCorrect_local) {
        bothCorrect++;
      }

      // 결과 저장
      results.push({
        name: testCase.name,
        expected: testCase.expected,
        router: {
          result: routerResult.pageType,
          correct: routerCorrect_local,
          confidence: routerResult.confidence,
          method: routerResult.processingMethod,
          time: routerTime
        },
        dynamic: {
          result: dynamicResult.pageType,
          correct: dynamicCorrect_local,
          confidence: dynamicResult.confidence,
          source: dynamicResult.source,
          time: dynamicTime
        }
      });

      // 불일치 분석
      if (routerResult.pageType !== dynamicResult.pageType) {
        console.log(`\n⚠️  불일치 감지: 서치라우터(${routerResult.pageType}) vs 동적분류기(${dynamicResult.pageType})`);
      }

    } catch (error) {
      console.error(`❌ "${testCase.name}" 테스트 실패:`, error.message);
      results.push({
        name: testCase.name,
        expected: testCase.expected,
        error: error.message
      });
    }
  }

  // 최종 결과 분석
  console.log('\n' + '='.repeat(80));
  console.log('📊 최종 결과 분석');
  console.log('='.repeat(80));

  console.log(`🎯 전체 테스트 케이스: ${TEST_CASES.length}개`);
  console.log(`🔀 서치 라우터 정확도: ${routerCorrect}/${TEST_CASES.length} (${(routerCorrect/TEST_CASES.length*100).toFixed(1)}%)`);
  console.log(`🤖 동적 분류기 정확도: ${dynamicCorrect}/${TEST_CASES.length} (${(dynamicCorrect/TEST_CASES.length*100).toFixed(1)}%)`);
  console.log(`🎪 둘 다 정확: ${bothCorrect}/${TEST_CASES.length} (${(bothCorrect/TEST_CASES.length*100).toFixed(1)}%)`);

  // 불일치 케이스 분석
  const disagreements = results.filter(r => 
    r.router && r.dynamic && r.router.result !== r.dynamic.result
  );
  
  if (disagreements.length > 0) {
    console.log(`\n⚠️  불일치 케이스: ${disagreements.length}개`);
    disagreements.forEach(d => {
      console.log(`   "${d.name}": 서치라우터(${d.router.result}) vs 동적분류기(${d.dynamic.result})`);
    });
  }

  // 성능 분석
  const routerAvgTime = results
    .filter(r => r.router?.time)
    .reduce((sum, r) => sum + r.router.time, 0) / results.length;
  
  const dynamicAvgTime = results
    .filter(r => r.dynamic?.time)
    .reduce((sum, r) => sum + r.dynamic.time, 0) / results.length;

  console.log(`\n⏱️  평균 처리 시간:`);
  console.log(`   서치 라우터: ${routerAvgTime.toFixed(0)}ms`);
  console.log(`   동적 분류기: ${dynamicAvgTime.toFixed(0)}ms`);

  // 신뢰도 분석
  const routerAvgConfidence = results
    .filter(r => r.router?.confidence)
    .reduce((sum, r) => sum + r.router.confidence, 0) / results.length;
  
  const dynamicAvgConfidence = results
    .filter(r => r.dynamic?.confidence)
    .reduce((sum, r) => sum + r.dynamic.confidence, 0) / results.length;

  console.log(`\n📈 평균 신뢰도:`);
  console.log(`   서치 라우터: ${(routerAvgConfidence*100).toFixed(1)}%`);
  console.log(`   동적 분류기: ${(dynamicAvgConfidence*100).toFixed(1)}%`);

  // 상세 결과 테이블
  console.log(`\n📋 상세 결과:`);
  console.log('장소'.padEnd(12) + '예상'.padEnd(20) + '서치라우터'.padEnd(20) + '동적분류기'.padEnd(20) + '일치여부');
  console.log('-'.repeat(80));
  
  results.forEach(r => {
    if (r.error) {
      console.log(`${r.name.padEnd(12)}${r.expected.padEnd(20)}${'ERROR'.padEnd(40)}❌`);
    } else {
      const routerSymbol = r.router.correct ? '✅' : '❌';
      const dynamicSymbol = r.dynamic.correct ? '✅' : '❌'; 
      const matchSymbol = r.router.result === r.dynamic.result ? '🤝' : '⚠️';
      
      console.log(
        `${r.name.padEnd(12)}${r.expected.padEnd(20)}${(r.router.result + routerSymbol).padEnd(20)}${(r.dynamic.result + dynamicSymbol).padEnd(20)}${matchSymbol}`
      );
    }
  });

  return {
    totalTests: TEST_CASES.length,
    routerAccuracy: routerCorrect / TEST_CASES.length,
    dynamicAccuracy: dynamicCorrect / TEST_CASES.length,
    bothAccuracy: bothCorrect / TEST_CASES.length,
    disagreements: disagreements.length,
    avgRouterTime: routerAvgTime,
    avgDynamicTime: dynamicAvgTime,
    results
  };
}

// 실행
if (require.main === module) {
  testClassificationAccuracy()
    .then(stats => {
      console.log('\n🏁 테스트 완료');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌테스트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { testClassificationAccuracy, TEST_CASES };
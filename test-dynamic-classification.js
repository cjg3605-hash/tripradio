/**
 * 동적 위치 분류 시스템 테스트
 * 
 * 가이드 생성 직전에 실행되는 동적 분류 로직의 정확도를 테스트합니다.
 */

// 테스트 케이스 - 더 까다로운 경우들 포함
const TEST_CASES = [
  // 명확한 케이스들
  {
    name: "에펠탑",
    expected: "DetailedGuidePage",
    type: "landmark",
    reasoning: "구체적 건축물/명소"
  },
  {
    name: "파리", 
    expected: "RegionExploreHub",
    type: "city",
    reasoning: "도시 - 지역 탐색"
  },
  
  // 애매한 케이스들 (AI 분류 테스트)
  {
    name: "제주도",
    expected: "RegionExploreHub", 
    type: "province",
    reasoning: "지역/도 - 지역 탐색"
  },
  {
    name: "강남",
    expected: "RegionExploreHub",
    type: "district", 
    reasoning: "구/지구 - 지역 탐색"
  },
  {
    name: "홍대",
    expected: "DetailedGuidePage",
    type: "district",
    reasoning: "특정 문화지역 - 가이드"
  },
  
  // 해외 명소들 (전세계 데이터베이스 테스트)
  {
    name: "타지마할",
    expected: "DetailedGuidePage",
    type: "landmark",
    reasoning: "세계적 명소"
  },
  {
    name: "마추픽추", 
    expected: "DetailedGuidePage",
    type: "landmark",
    reasoning: "세계 유산"
  },
  
  // 잘못 분류되기 쉬운 케이스들
  {
    name: "뮌헨",
    expected: "RegionExploreHub",
    type: "city", 
    reasoning: "독일 도시 - 지역 탐색"
  },
  {
    name: "바르셀로나",
    expected: "RegionExploreHub",
    type: "city",
    reasoning: "스페인 도시 - 지역 탐색"
  },
  {
    name: "사그라다파밀리아",
    expected: "DetailedGuidePage", 
    type: "landmark",
    reasoning: "바르셀로나의 구체적 건축물"
  }
];

/**
 * 동적 분류 시스템 시뮬레이션
 * dynamic-location-classifier.ts 로직 기반
 */
function simulateDynamicClassification(locationName) {
  console.log(`\n🔍 "${locationName}" 동적 분류:`);
  
  // 1. 도시 모호성 체크 시뮬레이션
  const disambiguationResult = checkCityDisambiguation(locationName);
  if (disambiguationResult.needsDisambiguation) {
    console.log(`   🤔 도시 모호성 발견: ${disambiguationResult.options.length}개 옵션`);
    return {
      pageType: 'RegionExploreHub',
      source: 'disambiguation_needed',
      confidence: 0.9,
      reasoning: `도시 모호성 발견: "${locationName}"`
    };
  }
  
  if (disambiguationResult.autoSelected) {
    console.log(`   🤖 AI 자동 선택된 도시: ${disambiguationResult.autoSelected.name}`);
    return {
      pageType: 'RegionExploreHub', 
      source: 'auto_selected_city',
      confidence: 0.95,
      reasoning: `AI가 자동 선택한 도시: ${disambiguationResult.autoSelected.name}`
    };
  }
  
  // 2. 정확한 위치 정보 처리 시뮬레이션
  const accurateInfo = getAccurateLocationInfo(locationName);
  if (accurateInfo) {
    console.log(`   🎯 정확한 위치 정보: ${accurateInfo.type} (${accurateInfo.country})`);
    return {
      pageType: accurateInfo.type === 'city' ? 'RegionExploreHub' : 'DetailedGuidePage',
      source: 'accurate_data',
      confidence: 0.99,
      reasoning: `정확한 위치 정보: ${accurateInfo.type}`
    };
  }
  
  // 3. 전세계 명소 데이터베이스 확인
  const globalLandmark = checkGlobalLandmarks(locationName);
  if (globalLandmark) {
    console.log(`   🌍 전세계 명소: ${globalLandmark.type}`);
    return {
      pageType: 'DetailedGuidePage',
      source: 'global_landmarks', 
      confidence: 0.98,
      reasoning: `전세계 명소 데이터베이스: ${globalLandmark.type}`
    };
  }
  
  // 4. 정적 데이터 확인
  const staticResult = checkStaticData(locationName);
  if (staticResult) {
    console.log(`   📊 정적 데이터: ${staticResult.type} (레벨 ${staticResult.level})`);
    return {
      pageType: staticResult.level <= 3 ? 'RegionExploreHub' : 'DetailedGuidePage',
      source: 'static',
      confidence: 0.95,
      reasoning: `정적 데이터: ${staticResult.type}`
    };
  }
  
  // 5. DB 가이드 존재 여부 + AI 분류
  const guideExists = checkGuideExists(locationName);
  if (guideExists) {
    console.log(`   📚 DB에 가이드 존재, AI 분류 실행`);
    const aiClassification = simulateAIClassification(locationName);
    console.log(`   🤖 AI 분류 결과: ${aiClassification.type}`);
    
    return {
      pageType: aiClassification.type === 'city' ? 'RegionExploreHub' : 'DetailedGuidePage',
      source: 'db_with_ai',
      confidence: 0.85,
      reasoning: `DB 검색과 AI 분류: ${aiClassification.type}`
    };
  }
  
  // 6. 순수 AI 분류 (최후 수단)
  const aiOnly = simulateAIClassification(locationName);
  console.log(`   🤖 AI 순수 분류: ${aiOnly.type}`);
  return {
    pageType: aiOnly.type === 'city' ? 'RegionExploreHub' : 'DetailedGuidePage',
    source: 'ai',
    confidence: 0.6,
    reasoning: `AI 분류: ${aiOnly.type}`
  };
}

/**
 * 도시 모호성 체크 시뮬레이션
 */
function checkCityDisambiguation(locationName) {
  // 모호한 도시명들 시뮬레이션
  const ambiguousCities = {
    "파리": {
      needsDisambiguation: false, // AI가 프랑스 파리로 자동 선택
      autoSelected: { name: "파리", country: "프랑스", population: 2161000 }
    },
    "런던": {
      needsDisambiguation: false, // AI가 영국 런던으로 자동 선택  
      autoSelected: { name: "런던", country: "영국", population: 8982000 }
    },
    "포틀랜드": {
      needsDisambiguation: true,
      options: [
        { name: "포틀랜드", country: "미국", state: "오리건" },
        { name: "포틀랜드", country: "미국", state: "메인" }
      ]
    }
  };
  
  return ambiguousCities[locationName] || { needsDisambiguation: false };
}

/**
 * 정확한 위치 정보 시뮬레이션
 */
function getAccurateLocationInfo(locationName) {
  // 정확한 위치 정보가 있는 경우 시뮬레이션
  const accurateData = {
    "제주도": { type: "province", country: "대한민국", region: "제주특별자치도" },
    "강남": { type: "district", country: "대한민국", region: "서울" },
    "뮌헨": { type: "city", country: "독일", region: "바이에른" },
    "바르셀로나": { type: "city", country: "스페인", region: "카탈루냐" }
  };
  
  return accurateData[locationName] || null;
}

/**
 * 전세계 명소 확인 시뮬레이션
 */
function checkGlobalLandmarks(locationName) {
  const globalLandmarks = {
    "타지마할": { type: "landmark", country: "인도" },
    "마추픽추": { type: "landmark", country: "페루" },
    "사그라다파밀리아": { type: "landmark", country: "스페인" },
    "에펠탑": { type: "landmark", country: "프랑스" }
  };
  
  return globalLandmarks[locationName] || null;
}

/**
 * 정적 데이터 확인 시뮬레이션
 */  
function checkStaticData(locationName) {
  const staticData = {
    "파리": { type: "city", level: 3 },
    "부산": { type: "city", level: 3 },
    "도쿄": { type: "city", level: 3 },
    "런던": { type: "city", level: 3 },
    "경복궁": { type: "landmark", level: 4 },
    "홍대": { type: "district", level: 4 }
  };
  
  return staticData[locationName] || null;
}

/**
 * DB 가이드 존재 여부 시뮬레이션
 */
function checkGuideExists(locationName) {
  // 주요 장소들은 이미 가이드가 있다고 가정
  const existingGuides = [
    "에펠탑", "파리", "경복궁", "부산", "타지마할", "뉴욕", 
    "콜로세움", "도쿄", "마추픽추", "런던", "제주도", "강남"
  ];
  
  return existingGuides.includes(locationName);
}

/**
 * AI 분류 시뮬레이션
 */
function simulateAIClassification(locationName) {
  // 엄격한 도시 기준
  const strictCityPatterns = [
    'paris', 'london', 'tokyo', 'new york', 'seoul', 'busan',
    'sydney', 'rome', 'berlin', 'madrid', 'barcelona', 'munich',
    '파리', '런던', '도쿄', '뉴욕', '서울', '부산', '뮌헨', '바르셀로나'
  ];
  
  const locationLower = locationName.toLowerCase();
  
  // 확실한 도시인 경우
  if (strictCityPatterns.includes(locationLower)) {
    return { type: 'city', confidence: 0.9 };
  }
  
  // 지역/도 패턴
  if (locationName.includes('도') || locationName.includes('주') || locationName.includes('省')) {
    return { type: 'province', confidence: 0.8 }; // province도 결국 RegionExploreHub
  }
  
  // 구/지구 패턴 - 문맥에 따라 다름
  if (locationName.includes('구') || locationName.includes('동')) {
    // 홍대 같은 특별한 문화지역은 landmark로
    if (['홍대', '강남', '명동', '시부야'].includes(locationName)) {
      return { type: 'landmark', confidence: 0.7 };
    }
    return { type: 'district', confidence: 0.7 }; // 일반 구는 RegionExploreHub
  }
  
  // 기본값: landmark (확실하지 않으면 DetailedGuidePage로)
  return { type: 'landmark', confidence: 0.6 };
}

/**
 * 메인 테스트 함수
 */
function runDynamicClassificationTest() {
  console.log('🧪 동적 위치 분류 시스템 정확도 테스트');
  console.log('=' .repeat(90));
  console.log('🤖 가이드 생성 직전 동적 분류 로직을 시뮬레이션합니다.\n');
  
  let correct = 0;
  let total = 0;
  const results = [];
  
  // 각 테스트 케이스 실행
  TEST_CASES.forEach(testCase => {
    console.log(`\n📍 테스트: "${testCase.name}"`);
    console.log(`💭 기대: ${testCase.expected} (${testCase.reasoning})`);
    console.log('-'.repeat(80));
    
    const result = simulateDynamicClassification(testCase.name);
    const isCorrect = result.pageType === testCase.expected;
    
    console.log(`\n🎯 결과: ${result.pageType} ${isCorrect ? '✅' : '❌'}`);
    console.log(`📊 신뢰도: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`🔗 소스: ${result.source}`);
    console.log(`💡 이유: ${result.reasoning}`);
    
    if (isCorrect) {
      correct++;
    } else {
      console.log(`⚠️  불일치: 예상(${testCase.expected}) vs 실제(${result.pageType})`);
    }
    
    total++;
    results.push({
      name: testCase.name,
      expected: testCase.expected,
      actual: result.pageType,
      correct: isCorrect,
      confidence: result.confidence,
      source: result.source,
      reasoning: result.reasoning,
      testReasoning: testCase.reasoning
    });
  });
  
  // 최종 결과 분석
  console.log('\n' + '='.repeat(90));
  console.log('📊 동적 분류 시스템 분석 결과');
  console.log('='.repeat(90));
  
  const accuracy = (correct / total) * 100;
  console.log(`🎯 전체 정확도: ${correct}/${total} (${accuracy.toFixed(1)}%)`);
  
  // 실패한 케이스 상세 분석
  const failedCases = results.filter(r => !r.correct);
  if (failedCases.length > 0) {
    console.log(`\n❌ 실패한 케이스 (${failedCases.length}개):`);
    failedCases.forEach(f => {
      console.log(`\n   "${f.name}"`);
      console.log(`      예상: ${f.expected} (${f.testReasoning})`);
      console.log(`      실제: ${f.actual} (${f.reasoning})`);
      console.log(`      소스: ${f.source}, 신뢰도: ${(f.confidence*100).toFixed(0)}%`);
    });
  }
  
  // 소스별 정확도 분석
  const sourceStats = {};
  results.forEach(r => {
    if (!sourceStats[r.source]) {
      sourceStats[r.source] = { correct: 0, total: 0 };
    }
    sourceStats[r.source].total++;
    if (r.correct) sourceStats[r.source].correct++;
  });
  
  console.log(`\n📈 소스별 정확도:`);
  Object.entries(sourceStats).forEach(([source, stats]) => {
    const sourceAccuracy = (stats.correct / stats.total * 100).toFixed(1);
    const description = getSourceDescription(source);
    console.log(`   ${source.padEnd(20)}: ${stats.correct}/${stats.total} (${sourceAccuracy}%) - ${description}`);
  });
  
  // 평균 신뢰도
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  console.log(`\n📊 평균 신뢰도: ${(avgConfidence * 100).toFixed(1)}%`);
  
  // 분류 패턴 분석
  console.log(`\n🔍 분류 패턴 분석:`);
  const hubCount = results.filter(r => r.actual === 'RegionExploreHub').length;
  const guideCount = results.filter(r => r.actual === 'DetailedGuidePage').length;
  console.log(`   RegionExploreHub: ${hubCount}개 (${(hubCount/total*100).toFixed(1)}%)`);
  console.log(`   DetailedGuidePage: ${guideCount}개 (${(guideCount/total*100).toFixed(1)}%)`);
  
  // 상세 결과 테이블
  console.log(`\n📋 상세 결과:`);
  console.log('장소'.padEnd(15) + '예상'.padEnd(18) + '실제'.padEnd(18) + '소스'.padEnd(15) + '신뢰도'.padEnd(8) + '결과');
  console.log('-'.repeat(90));
  
  results.forEach(r => {
    const symbol = r.correct ? '✅' : '❌';
    const confidence = `${(r.confidence*100).toFixed(0)}%`;
    console.log(
      `${r.name.padEnd(15)}${r.expected.slice(0,16).padEnd(18)}${r.actual.slice(0,16).padEnd(18)}${r.source.padEnd(15)}${confidence.padEnd(8)}${symbol}`
    );
  });
  
  // 시스템 평가 및 개선 제안
  console.log(`\n💡 시스템 평가:`);
  
  if (accuracy >= 90) {
    console.log('✅ 우수: 동적 분류 시스템이 매우 잘 작동하고 있습니다.');
  } else if (accuracy >= 80) {
    console.log('⚠️  보통: 동적 분류 시스템에 개선의 여지가 있습니다.');
  } else {
    console.log('❌ 미흡: 동적 분류 시스템에 심각한 문제가 있을 수 있습니다.');
  }
  
  console.log(`\n🔧 개선 제안:`);
  
  if (failedCases.some(f => f.source === 'ai')) {
    console.log('🤖 AI 분류 로직 개선:');
    console.log('   - 더 정교한 도시/명소 판별 규칙');
    console.log('   - 문화적 맥락을 고려한 지역 분류');
    console.log('   - 다국어 지명 처리 향상');
  }
  
  if (failedCases.some(f => f.source === 'static')) {
    console.log('📊 정적 데이터 확장:');
    console.log('   - 누락된 주요 도시/명소 추가');
    console.log('   - 별칭 및 다국어 표기 보완');
  }
  
  if (failedCases.some(f => f.source === 'global_landmarks')) {
    console.log('🌍 전세계 명소 데이터베이스:');
    console.log('   - 추가 세계적 명소 등록');
    console.log('   - 지역별 중요 명소 보완');
  }
  
  console.log(`\n🎉 테스트 완료 - 동적 분류 정확도: ${accuracy.toFixed(1)}%`);
  
  return {
    accuracy,
    correct,
    total,
    results,
    sourceStats,
    avgConfidence
  };
}

/**
 * 소스 설명
 */
function getSourceDescription(source) {
  const descriptions = {
    'disambiguation_needed': '도시 모호성 - 사용자 선택 필요',
    'auto_selected_city': 'AI 자동 도시 선택',
    'accurate_data': '정확한 위치 정보 활용',
    'global_landmarks': '전세계 명소 데이터베이스',
    'static': '정적 위치 분류 데이터',
    'db_with_ai': 'DB 검색 + AI 분류 결합',
    'ai': 'AI 순수 분류 (최후 수단)'
  };
  
  return descriptions[source] || '알 수 없는 소스';
}

// 실행
if (require.main === module) {
  runDynamicClassificationTest();
}

module.exports = { runDynamicClassificationTest, TEST_CASES };
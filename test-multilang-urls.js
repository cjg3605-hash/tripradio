/**
 * 다국어 URL 테스트 스크립트
 * 해외 사용자 404 에러 해결 검증용
 */

const { mapLocationToKorean, suggestSimilarLocations } = require('./src/lib/location-mapping.ts');

// 테스트 케이스들
const testCases = [
  // 영어 지명
  { input: 'Eiffel Tower', expected: '에펠탑', lang: 'en' },
  { input: 'eiffel tower', expected: '에펠탑', lang: 'en' },
  { input: 'EIFFEL TOWER', expected: '에펠탑', lang: 'en' },
  { input: 'Colosseum', expected: '콜로세움', lang: 'en' },
  { input: 'Taj Mahal', expected: '타지마할', lang: 'en' },
  { input: 'Statue of Liberty', expected: '자유의여신상', lang: 'en' },
  { input: 'Big Ben', expected: '빅벤', lang: 'en' },
  
  // 일본어 지명
  { input: 'エッフェル塔', expected: '에펠탑', lang: 'ja' },
  { input: 'コロッセオ', expected: '콜로세움', lang: 'ja' },
  { input: 'タージマハル', expected: '타지마할', lang: 'ja' },
  
  // 중국어 지명
  { input: '埃菲尔铁塔', expected: '에펠탑', lang: 'zh' },
  { input: '罗马斗兽场', expected: '콜로세움', lang: 'zh' },
  { input: '泰姬陵', expected: '타지마할', lang: 'zh' },
  
  // 스페인어 지명
  { input: 'Torre Eiffel', expected: '에펠탑', lang: 'es' },
  { input: 'Coliseo', expected: '콜로세움', lang: 'es' },
  { input: 'Estatua de la Libertad', expected: '자유의여신상', lang: 'es' },
  
  // 한국 관광지 (영어명)
  { input: 'Gyeongbokgung Palace', expected: '경복궁', lang: 'en' },
  { input: 'N Seoul Tower', expected: '남산타워', lang: 'en' },
  { input: 'Haeundae Beach', expected: '부산해운대', lang: 'en' },
  { input: 'Jeju Island', expected: '제주도', lang: 'en' },
  
  // 실패 케이스 (매핑 없는 경우)
  { input: 'Unknown Place', expected: null, lang: 'en' },
  { input: 'Random Location', expected: null, lang: 'en' },
];

console.log('🧪 다국어 지명 매핑 테스트 시작\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

// 매핑 테스트 실행
for (const testCase of testCases) {
  totalTests++;
  
  try {
    const result = mapLocationToKorean(testCase.input);
    const passed = result === testCase.expected;
    
    if (passed) {
      passedTests++;
      console.log(`✅ [${testCase.lang.toUpperCase()}] "${testCase.input}" → "${result}"`);
    } else {
      failedTests.push({
        input: testCase.input,
        expected: testCase.expected,
        actual: result,
        lang: testCase.lang
      });
      console.log(`❌ [${testCase.lang.toUpperCase()}] "${testCase.input}" → Expected: "${testCase.expected}", Got: "${result}"`);
    }
  } catch (error) {
    totalTests++;
    failedTests.push({
      input: testCase.input,
      expected: testCase.expected,
      actual: 'ERROR',
      lang: testCase.lang,
      error: error.message
    });
    console.log(`💥 [${testCase.lang.toUpperCase()}] "${testCase.input}" → ERROR: ${error.message}`);
  }
}

console.log('\n📊 테스트 결과 요약:');
console.log(`총 테스트: ${totalTests}`);
console.log(`성공: ${passedTests}`);
console.log(`실패: ${failedTests.length}`);
console.log(`성공률: ${Math.round((passedTests / totalTests) * 100)}%`);

// 실패한 테스트 상세 정보
if (failedTests.length > 0) {
  console.log('\n❌ 실패한 테스트들:');
  failedTests.forEach((test, index) => {
    console.log(`${index + 1}. [${test.lang.toUpperCase()}] "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Actual: "${test.actual}"`);
    if (test.error) console.log(`   Error: ${test.error}`);
    console.log('');
  });
}

// 추천 시스템 테스트
console.log('\n🔍 지명 추천 시스템 테스트:');
const recommendationTests = [
  'Eiff Tower', // 오타
  'Coloseum',   // 오타
  'Taj Mahl',   // 오타
  'Big Band',   // 유사한 이름
];

for (const testInput of recommendationTests) {
  const suggestions = suggestSimilarLocations(testInput);
  console.log(`"${testInput}" → 추천: [${suggestions.join(', ')}]`);
}

console.log('\n✅ 테스트 완료!');

// 실제 URL 테스트 예시 출력
console.log('\n🌐 실제 URL 테스트 예시:');
console.log('해외 사용자가 이런 URL로 접근할 때:');
console.log('- /guide/Eiffel%20Tower → /guide/에펠탑 (리다이렉트)');
console.log('- /guide/Colosseum?lang=en → /guide/콜로세움?lang=en (리다이렉트)');
console.log('- /guide/タージマハル?lang=ja → /guide/타지마할?lang=ja (리다이렉트)');
console.log('- Accept-Language: en → ?lang=en 파라미터 자동 추가');
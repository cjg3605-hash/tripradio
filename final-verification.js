// 새로운 아키텍처 최종 검증
console.log('🔍 새로운 아키텍처 최종 검증');
console.log('=====================================\n');

const testCases = ['만리장성', '에펠탑', '서울'];

async function testCase(query) {
  console.log(`📍 테스트: ${query}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/locations/search?q=${encodeURIComponent(query)}&lang=ko`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const first = data.data[0];
      console.log(`   ✅ 이름: ${first.name}`);
      console.log(`   ✅ 위치: ${first.location}`);
      console.log(`   ✅ 지역: ${first.region}`);
      console.log(`   ✅ 국가: ${first.country} (${first.countryCode})`);
      console.log('');
      return true;
    } else {
      console.log('   ❌ 결과 없음\n');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ 에러: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  let passed = 0;
  
  for (const testQuery of testCases) {
    if (await testCase(testQuery)) {
      passed++;
    }
  }
  
  console.log(`\n🎯 결과: ${passed}/${testCases.length} 통과`);
  
  if (passed === testCases.length) {
    console.log('✅ 모든 테스트 통과! 새로운 아키텍처가 완벽하게 작동합니다.');
  } else {
    console.log('⚠️  일부 테스트 실패');
  }
}

runTests();
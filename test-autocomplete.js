// 자동완성 API 테스트
console.log("🧪 자동완성 API 테스트 시작");

async function testAutocomplete(query) {
  console.log(`📍 테스트: "${query}"`);
  console.log("----------------------------");
  
  try {
    const startTime = Date.now();
    const response = await fetch(`http://localhost:3000/api/locations/search?q=${encodeURIComponent(query)}&lang=ko`);
    const responseTime = Date.now() - startTime;
    
    const data = await response.json();
    
    console.log(`⏱️  응답시간: ${responseTime}ms`);
    console.log(`✅ 성공: ${data.success}`);
    console.log(`📊 결과 개수: ${data.data?.length || 0}`);
    console.log(`🔗 소스: ${data.source}`);
    
    if (data.data && data.data.length > 0) {
      const first = data.data[0];
      console.log("\n📋 첫 번째 결과:");
      console.log(`   이름: ${first.name}`);
      console.log(`   위치: ${first.location}`);
      console.log(`   지역: ${first.region}`);
      console.log(`   국가: ${first.country} (${first.countryCode})`);
      console.log(`   타입: ${first.type}`);
    }
    
    console.log("");
    return true;
    
  } catch (error) {
    console.log(`❌ 에러: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const queries = ["만리장성", "서울", "에펠탑"];
  
  for (const query of queries) {
    await testAutocomplete(query);
  }
  
  console.log("🎯 테스트 완료\!");
}

runTests();

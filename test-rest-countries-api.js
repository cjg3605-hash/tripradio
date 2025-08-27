const testCountries = [
  'France', 'South Korea', 'United States', 'Japan', 'China',
  'Germany', 'United Kingdom', 'Italy', 'Spain', 'Canada',
  'Australia', 'Thailand', 'Singapore', 'Malaysia', 'Brazil',
  'India', 'Russia', 'Netherlands', 'Switzerland', 'Austria',
  '프랑스', '대한민국', '미국', '일본', '중국',
  'Not A Real Country', '', ' ', 'XYZ123', 'TEST'
];

const koreanCountryMap = {
  '대한민국': 'South Korea',
  '한국': 'South Korea',
  '미국': 'United States',
  '일본': 'Japan',
  '중국': 'China',
  '프랑스': 'France',
  '독일': 'Germany',
  '영국': 'United Kingdom',
  '이탈리아': 'Italy',
  '스페인': 'Spain',
  '러시아': 'Russia',
  '캐나다': 'Canada',
  '호주': 'Australia',
  '브라질': 'Brazil',
  '인도': 'India',
  '태국': 'Thailand',
  '베트남': 'Vietnam',
  '싱가포르': 'Singapore',
  '말레이시아': 'Malaysia',
  '인도네시아': 'Indonesia',
  '필리핀': 'Philippines'
};

async function testCountryAPI(country) {
  const englishName = koreanCountryMap[country] || country;
  const endpoints = [
    `https://restcountries.com/v3.1/name/${encodeURIComponent(englishName)}?fields=cca3`,
    `https://restcountries.com/v3.1/translation/${encodeURIComponent(englishName)}?fields=cca3`
  ];
  
  console.log(`\n🔍 테스트: '${country}' → '${englishName}'`);
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      const response = await fetch(endpoint, {
        headers: { 'User-Agent': 'TripRadio-AI/1.0' }
      });
      
      console.log(`  📡 엔드포인트 ${i+1}: ${response.status} (${endpoint.includes('name') ? 'name' : 'translation'})`);
      
      if (!response.ok) {
        console.log(`    ❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0 && data[0].cca3) {
        console.log(`    ✅ 성공: ${data[0].cca3}`);
        return { success: true, code: data[0].cca3, endpoint: i+1 };
      } else {
        console.log(`    ❌ 데이터 없음:`, JSON.stringify(data));
      }
    } catch (error) {
      console.log(`    ❌ 오류: ${error.message}`);
    }
  }
  
  console.log(`  💥 모든 엔드포인트 실패`);
  return { success: false };
}

async function runTests() {
  console.log('🧪 REST Countries API 테스트 시작...\n');
  
  let successCount = 0;
  let failureCount = 0;
  const failures = [];
  
  for (const country of testCountries) {
    const result = await testCountryAPI(country);
    
    if (result.success) {
      successCount++;
      console.log(`✅ '${country}' → ${result.code} (엔드포인트 ${result.endpoint})`);
    } else {
      failureCount++;
      failures.push(country);
      console.log(`❌ '${country}' → 실패`);
    }
    
    // API 레이트 리미트 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 테스트 결과:`);
  console.log(`  ✅ 성공: ${successCount}/${testCountries.length} (${(successCount/testCountries.length*100).toFixed(1)}%)`);
  console.log(`  ❌ 실패: ${failureCount}/${testCountries.length} (${(failureCount/testCountries.length*100).toFixed(1)}%)`);
  console.log(`  🚨 실패한 국가들: ${failures.join(', ')}`);
}

runTests().catch(console.error);
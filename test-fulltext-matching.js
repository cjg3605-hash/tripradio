// fullText=true 파라미터로 정확한 매칭 테스트

const problemCases = [
  'United States',
  'India', 
  'Netherlands',
  'France',
  'South Korea'
];

async function testWithFullText(country) {
  const endpoints = [
    `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true&fields=cca3`,
    `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=cca3` // 기존 방식 비교
  ];
  
  console.log(`\n🔍 테스트: '${country}'`);
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    const mode = i === 0 ? 'fullText=true' : '기존 방식';
    
    try {
      const response = await fetch(endpoint, {
        headers: { 'User-Agent': 'TripRadio-AI/1.0' }
      });
      
      console.log(`  📡 ${mode}: ${response.status}`);
      
      if (!response.ok) {
        console.log(`    ❌ HTTP ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data && data.length > 0 && data[0].cca3) {
        console.log(`    ✅ 결과: ${data[0].cca3}`);
      } else {
        console.log(`    ❌ 데이터 없음`);
      }
    } catch (error) {
      console.log(`    ❌ 오류: ${error.message}`);
    }
  }
}

async function runFullTextTest() {
  console.log('🧪 fullText=true 파라미터 테스트...\n');
  
  for (const country of problemCases) {
    await testWithFullText(country);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

runFullTextTest().catch(console.error);
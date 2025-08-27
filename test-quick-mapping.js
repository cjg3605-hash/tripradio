/**
 * ⚡ 빠른 3자리 매핑 테스트
 */

function testQuickMapping() {
  console.log('⚡ 빠른 3자리 국가코드 매핑 테스트');
  console.log('='.repeat(40));
  
  // NextLevelSearchBox의 빠른 매핑 로직 재현
  const quickCountryMap = {
    '대한민국': 'KOR', '한국': 'KOR', 
    '미국': 'USA', '일본': 'JPN', '중국': 'CHN',
    '프랑스': 'FRA', '독일': 'DEU', '영국': 'GBR',
    '이탈리아': 'ITA', '스페인': 'ESP', '러시아': 'RUS'
  };
  
  const testCases = [
    '대한민국', '한국', '미국', '일본', '중국', 
    '프랑스', '태국', '호주'  // 마지막 2개는 매핑에 없음
  ];
  
  testCases.forEach(country => {
    const countryCode = quickCountryMap[country];
    
    if (countryCode) {
      console.log(`✅ "${country}" → "${countryCode}" (빠른 매핑)`);
    } else {
      console.log(`⏳ "${country}" → REST API 호출 필요`);
    }
  });
  
  console.log('\n🎯 시뮬레이션: "서울, 대한민국" 파싱');
  const location = "서울, 대한민국";
  const parts = location.split(',').map(part => part.trim());
  const region = parts[0];
  const country = parts[1];
  const countryCode = quickCountryMap[country];
  
  console.log(`📍 파싱 결과:`);
  console.log(`   region: "${region}"`);
  console.log(`   country: "${country}"`);
  console.log(`   countryCode: "${countryCode}" (${countryCode ? '빠른 매핑' : 'REST API 필요'})`);
  
  if (countryCode === 'KOR') {
    console.log('🎉 성공! 3자리 국가코드가 즉시 생성됩니다!');
  }
}

if (require.main === module) {
  testQuickMapping();
}
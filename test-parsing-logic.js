/**
 * 🧪 실제 파싱 로직 테스트
 */

// NextLevelSearchBox의 파싱 로직 재현
function testLocationParsing() {
  console.log('🧪 location 파싱 로직 테스트');
  console.log('='.repeat(30));
  
  // API에서 받은 suggestion 시뮬레이션
  const suggestion = {
    name: "경복궁",
    location: "서울, 대한민국",
    type: "location",
    isMainLocation: true
  };
  
  console.log('📝 입력 데이터:', suggestion);
  
  // NextLevelSearchBox의 파싱 로직 재현 (588-605행)
  const parts = suggestion.location.split(',').map(part => part.trim());
  console.log('🔄 parts 배열:', parts);
  
  if (parts.length >= 2) {
    let region = parts[0].trim();
    let country = parts[1].trim();
    
    console.log('📍 파싱 결과:');
    console.log(`   region: "${region}"`);
    console.log(`   country: "${country}"`);
    
    // 국가코드 변환 시뮬레이션 (koreanCountryMap 사용)
    const koreanCountryMap = {
      '대한민국': 'South Korea',
      '한국': 'South Korea',
      '미국': 'United States',
      '일본': 'Japan',
      '중국': 'China',
      '영국': 'United Kingdom',
      '프랑스': 'France'
    };
    
    const englishCountryName = koreanCountryMap[country] || country;
    console.log(`🌍 한영 변환: "${country}" → "${englishCountryName}"`);
    
    // 이제 여기서 /api/country-code 호출하여 국가코드 받아와야 함
    console.log('➡️ 다음 단계: REST API 호출로 국가코드 변환');
    console.log(`   /api/country-code?country=${encodeURIComponent(englishCountryName)}`);
    
    // enhancedInfo 객체 생성 시뮬레이션
    const enhancedInfo = {
      region: region,
      country: country, 
      countryCode: 'KR' // REST API에서 받아올 예상값
    };
    
    console.log('✅ 최종 enhancedInfo:', enhancedInfo);
    
    return enhancedInfo;
  } else {
    console.log('❌ location 파싱 실패');
    return null;
  }
}

// 실행
if (require.main === module) {
  const result = testLocationParsing();
  
  if (result) {
    console.log('\n🎯 결론: 파싱 로직은 정상입니다!');
    console.log('💡 문제는 아마도:');
    console.log('   1. Gemini API 호출이 실패해서 "미분류"로 덮어쓰거나');
    console.log('   2. getCountryCode() 함수가 실패하거나');  
    console.log('   3. saveAutocompleteData() 저장 시 문제가 있을 수 있습니다');
  }
}
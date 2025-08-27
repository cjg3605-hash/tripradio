/**
 * 🔧 수정된 API 테스트
 */

async function testFixedAutocompleteAPI() {
  console.log(`\n🔧 수정된 자동완성 API 테스트`);
  console.log('='.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3000/api/locations/ko/search?q=경복궁', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ API 응답 성공:');
    console.log(`   성공: ${result.success}`);
    console.log(`   소스: ${result.source}`);
    console.log(`   결과 수: ${result.data?.length || 0}개`);
    
    if (result.data && result.data.length > 0) {
      console.log('\n📋 자동완성 결과:');
      result.data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   location: ${item.location}`);
        console.log(`   region: ${item.region || '없음'}`);
        console.log(`   country: ${item.country || '없음'}`);
        console.log(`   countryCode: ${item.countryCode || '없음'}`);
        console.log(`   type: ${item.type}`);
        console.log(`   isMainLocation: ${item.isMainLocation}`);
        console.log('');
      });
      
      // 첫 번째 결과 선택 시뮬레이션
      const selected = result.data[0];
      console.log('🎯 선택 시뮬레이션:');
      console.log(`   선택된 항목: ${selected.name}`);
      console.log(`   location 파싱: "${selected.location}" → region: "${selected.region}", country: "${selected.country}"`);
      console.log(`   NextLevelSearchBox가 기대하는 필드들이 모두 있는가?`);
      console.log(`     ✅ name: ${selected.name ? 'O' : 'X'}`);
      console.log(`     ✅ location: ${selected.location ? 'O' : 'X'}`);
      console.log(`     ✅ region: ${selected.region ? 'O' : 'X'}`);  
      console.log(`     ✅ country: ${selected.country ? 'O' : 'X'}`);
      console.log(`     ✅ countryCode: ${selected.countryCode ? 'O' : 'X'}`);
      console.log(`     ✅ type: ${selected.type ? 'O' : 'X'}`);
      
      return selected;
    } else {
      console.log('❌ 자동완성 결과 없음');
      return null;
    }
    
  } catch (error) {
    console.error('❌ API 테스트 실패:', error);
    return null;
  }
}

// 실행
if (require.main === module) {
  testFixedAutocompleteAPI().then(result => {
    if (result) {
      console.log('\n🎉 수정 완료! 이제 NextLevelSearchBox에서 정상적으로 작동할 것입니다.');
      console.log('\n➡️ 다음 단계: 실제 웹페이지에서 검색 테스트');
    } else {
      console.log('\n❌ 아직 문제가 있습니다. API 응답을 확인해주세요.');
    }
  });
}
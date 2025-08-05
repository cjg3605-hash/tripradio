// 테스트용 소규모 배치 생성기
const { generateGuide } = require('./bulk-guide-generator');

async function testGeneration() {
  console.log('🧪 배치 생성기 테스트 시작');
  
  // 테스트용으로 3개 명소만 생성
  const testAttractions = [
    '경복궁',
    'Eiffel Tower', 
    'Mount Fuji'
  ];
  
  const testLanguages = ['ko', 'en'];
  
  console.log(`📊 테스트: ${testAttractions.length}개 명소 × ${testLanguages.length}개 언어 = ${testAttractions.length * testLanguages.length}개 가이드`);
  
  const results = [];
  
  for (const attraction of testAttractions) {
    console.log(`\n📍 테스트 중: ${attraction}`);
    
    for (const language of testLanguages) {
      const result = await generateGuide(attraction, language);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ 성공: ${attraction} (${language})`);
      } else {
        console.log(`❌ 실패: ${attraction} (${language}) - ${result.error}`);
      }
      
      // 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 결과 요약
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  
  console.log('\n🎉 테스트 완료!');
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failedCount}개`);
  console.log(`📈 성공률: ${(successCount / results.length * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log('\n✅ 배치 생성기가 정상 작동합니다. 전체 생성을 진행하세요.');
  } else {
    console.log('\n❌ 배치 생성기에 문제가 있습니다. API 연결을 확인하세요.');
  }
}

testGeneration().catch(console.error);
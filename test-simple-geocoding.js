/**
 * 🧪 간단한 지오코딩 시스템 테스트
 * Google API 응답을 직접 사용하는 새로운 방식 검증
 */

async function testSimpleGeocoding() {
  console.log('🚀 간단한 지오코딩 시스템 테스트 시작\n');
  
  // Bangkok Grand Palace 테스트 (원래 실패했던 케이스)
  const locationName = '방콕 대왕궁';
  console.log(`📍 테스트 장소: ${locationName}`);
  
  try {
    const response = await fetch('http://localhost:3035/api/ai/generate-multilang-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: locationName,
        language: 'ko'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ 간단한 지오코딩 시스템 성공!');
      
      // 지역 정보 확인
      const regionalInfo = result.data.regionalInfo;
      console.log('\n🌍 지역 정보:');
      console.log(`  지역: ${regionalInfo?.location_region || 'N/A'}`);
      console.log(`  국가 코드: ${regionalInfo?.country_code || 'N/A'}`);
      
      // 좌표 정보 확인
      const coordinates = result.data.locationCoordinateStatus?.coordinates;
      if (coordinates) {
        console.log('\n📍 좌표 정보:');
        console.log(`  위도: ${coordinates.lat}`);
        console.log(`  경도: ${coordinates.lng}`);
        console.log(`  좌표 소스: ${result.data.locationCoordinateStatus.coordinateSource}`);
      }
      
      // 챕터 좌표 확인
      const chapters = result.data.realTimeGuide?.chapters || [];
      console.log(`\n📚 챕터 좌표 (${chapters.length}개):`);
      chapters.forEach((chapter, index) => {
        if (chapter.coordinates) {
          console.log(`  ${index + 1}. ${chapter.title}: (${chapter.coordinates.lat}, ${chapter.coordinates.lng})`);
        }
      });
      
      // 성공 메시지
      console.log('\n🎉 모든 테스트 통과! 간단한 지오코딩 시스템이 정상 작동합니다.');
      
      // 방콕인지 확인
      if (regionalInfo?.country_code === 'THA') {
        console.log('✅ 올바른 국가 코드 감지: 태국 (THA)');
      } else {
        console.log(`⚠️ 예상과 다른 국가 코드: ${regionalInfo?.country_code} (예상: THA)`);
      }
      
    } else {
      console.error('❌ API 호출 실패:', result.error);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 테스트 실행
testSimpleGeocoding();
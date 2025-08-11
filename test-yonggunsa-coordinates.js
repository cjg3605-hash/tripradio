/**
 * 🧪 용궁사 좌표 검색 로직 테스트
 * 브라우저 없이 API 직접 호출해서 새로운 좌표 시스템 테스트
 */

async function testYonggungsaCoordinates() {
  console.log('🧪 용궁사 좌표 검색 테스트 시작\n');

  const testData = {
    locationName: '용궁사',
    language: 'ko',
    userProfile: {
      age: 30,
      interests: ['문화', '역사']
    },
    parentRegion: 'none',
    regionalContext: 'none'
  };

  try {
    console.log('📡 API 호출 시작:', testData);
    
    const response = await fetch('http://localhost:3030/api/ai/generate-multilang-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 오류:', errorText);
      return;
    }

    const result = await response.json();
    console.log('\n✅ API 응답 받음');
    
    // 1. 기본 정보 확인
    console.log('\n📋 기본 정보:');
    console.log(`  성공 여부: ${result.success}`);
    console.log(`  데이터 존재: ${!!result.data}`);
    
    if (result.data) {
      // 2. 좌표 관련 정보 확인
      console.log('\n📍 좌표 정보:');
      console.log(`  locationCoordinateStatus:`, result.data.locationCoordinateStatus);
      console.log(`  coordinateGenerationFailed: ${result.data.coordinateGenerationFailed}`);
      
      // 3. 챕터 확인
      const chapters = result.data.realTimeGuide?.chapters;
      console.log('\n📚 챕터 정보:');
      console.log(`  총 챕터 수: ${chapters ? chapters.length : 0}`);
      
      if (chapters && chapters.length > 0) {
        console.log('\n📖 첫 번째 챕터 (id: 0):');
        const firstChapter = chapters[0];
        console.log(`  타이틀: "${firstChapter.title}"`);
        console.log(`  좌표: ${JSON.stringify(firstChapter.coordinates)}`);
        console.log(`  lat: ${firstChapter.lat}`);
        console.log(`  lng: ${firstChapter.lng}`);
      }
      
      // 4. 모든 챕터의 좌표 확인
      if (chapters && chapters.length > 0) {
        console.log('\n🗺️ 모든 챕터 좌표:');
        chapters.forEach((chapter, index) => {
          console.log(`  챕터 ${index}: ${chapter.title} → ${JSON.stringify(chapter.coordinates)}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 실행
testYonggungsaCoordinates();
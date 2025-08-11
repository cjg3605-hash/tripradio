// 새로운 좌표 시스템 테스트 스크립트
const axios = require('axios');

// 테스트할 위치들
const testLocations = [
  { name: '경복궁', language: 'ko', expected: 'Seoul area' },
  { name: '해동 용궁사', language: 'ko', expected: 'Busan area' },
  { name: '석굴암', language: 'ko', expected: 'Gyeongju area' }
];

async function testCoordinateGeneration() {
  console.log('🧪 새로운 좌표 시스템 테스트 시작...\n');

  for (const location of testLocations) {
    try {
      console.log(`\n🏛️ 테스트: ${location.name} (${location.language})`);
      console.log(`📍 예상 지역: ${location.expected}`);
      
      // API 호출
      const response = await axios.post('http://localhost:3002/api/ai/generate-multilang-guide', {
        locationName: location.name,
        language: location.language,
        userProfile: { preference: 'test' }
      }, {
        timeout: 120000, // 2분 타임아웃
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const guideData = response.data.data;
        console.log(`✅ 가이드 생성 성공`);
        
        // 좌표 데이터 검증
        if (guideData.realTimeGuide?.chapters) {
          console.log(`📚 총 ${guideData.realTimeGuide.chapters.length}개 챕터 분석:`);
          
          let allHaveCoordinates = true;
          let allHaveJSON = true;
          
          guideData.realTimeGuide.chapters.forEach((chapter, index) => {
            const hasCoords = !!(chapter.coordinates && chapter.coordinates.lat && chapter.coordinates.lng);
            const hasLatLng = !!(chapter.lat && chapter.lng);
            const hasJSON = !!(chapter.coordinates && typeof chapter.coordinates === 'object');
            
            console.log(`  📖 챕터 ${index + 1}: "${chapter.title}"`);
            console.log(`     coordinates JSON: ${hasCoords ? '✅ 있음' : '❌ 없음'}`);
            console.log(`     lat/lng 필드: ${hasLatLng ? '✅ 있음' : '❌ 없음'}`);
            
            if (hasCoords) {
              console.log(`     📍 좌표값: ${chapter.coordinates.lat}, ${chapter.coordinates.lng}`);
              console.log(`     📝 설명: "${chapter.coordinates.description}"`);
            }
            
            if (!hasCoords) allHaveCoordinates = false;
            if (!hasJSON) allHaveJSON = false;
          });
          
          console.log(`\n📊 ${location.name} 결과 요약:`);
          console.log(`   ✅ 모든 챕터 좌표 JSON: ${allHaveCoordinates ? 'SUCCESS' : 'FAILED'}`);
          console.log(`   ✅ 올바른 JSON 구조: ${allHaveJSON ? 'SUCCESS' : 'FAILED'}`);
          
          // 좌표 출처 확인
          if (guideData.locationCoordinateStatus) {
            console.log(`   📍 좌표 출처: ${guideData.locationCoordinateStatus.coordinateSource || '불명'}`);
            console.log(`   🔍 좌표 검색 성공: ${guideData.locationCoordinateStatus.coordinateFound ? 'YES' : 'NO'}`);
          }
          
        } else {
          console.log(`❌ realTimeGuide.chapters 구조 없음`);
        }
        
      } else {
        console.log(`❌ 가이드 생성 실패: ${response.data.error}`);
      }
      
      // 다음 테스트를 위한 대기
      console.log(`⏳ 다음 테스트를 위해 3초 대기...\n`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ ${location.name} 테스트 실패:`, error.response?.data || error.message);
    }
  }

  console.log('\n🎯 좌표 시스템 테스트 완료!');
  console.log('✅ 모든 가이드는 이제 반드시 좌표 JSON을 포함해야 합니다.');
}

// 서버 시작 확인 후 테스트 실행
async function checkServerAndTest() {
  try {
    console.log('🔍 서버 상태 확인 중...');
    
    // 간단한 health check
    const healthResponse = await axios.get('http://localhost:3002', {
      timeout: 5000
    });
    
    console.log('✅ 서버가 실행 중입니다.');
    await testCoordinateGeneration();
    
  } catch (error) {
    console.error('❌ 서버 접근 실패:', error.message);
    console.log('💡 해결책: npm run dev를 먼저 실행하여 서버를 시작하세요.');
  }
}

checkServerAndTest();
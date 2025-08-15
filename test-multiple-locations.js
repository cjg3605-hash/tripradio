/**
 * 🧪 다양한 지역 테스트
 * 간단한 지오코딩 시스템으로 전세계 여러 장소 테스트
 */

async function testLocation(locationName, expectedCountry) {
  console.log(`\n📍 테스트 장소: ${locationName}`);
  
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
      const regionalInfo = result.data.regionalInfo;
      const coordinates = result.data.locationCoordinateStatus?.coordinates;
      
      console.log(`  🌍 지역: ${regionalInfo?.location_region || 'N/A'}`);
      console.log(`  🏳️ 국가: ${regionalInfo?.country_code || 'N/A'}`);
      if (coordinates) {
        console.log(`  📍 좌표: ${coordinates.lat}, ${coordinates.lng}`);
      }
      console.log(`  ⚙️ 소스: ${result.data.locationCoordinateStatus?.coordinateSource}`);
      
      // 예상 국가와 비교
      if (expectedCountry && regionalInfo?.country_code === expectedCountry) {
        console.log(`  ✅ 올바른 국가 코드 감지!`);
        return { success: true, correct: true };
      } else if (expectedCountry) {
        console.log(`  ⚠️ 예상과 다른 국가: ${regionalInfo?.country_code} (예상: ${expectedCountry})`);
        return { success: true, correct: false, actual: regionalInfo?.country_code, expected: expectedCountry };
      } else {
        return { success: true, correct: true };
      }
      
    } else {
      console.log(`  ❌ 실패: ${result.error}`);
      return { success: false };
    }
    
  } catch (error) {
    console.log(`  ❌ 오류: ${error.message}`);
    return { success: false };
  }
}

async function runMultipleTests() {
  console.log('🚀 간단한 지오코딩 시스템 - 다중 위치 테스트\n');
  
  const testCases = [
    { location: '방콕 대왕궁', expected: 'THA' },
    { location: 'Machu Picchu', expected: 'PER' },
    { location: 'Pyramids of Giza', expected: 'EGY' },
    { location: 'Parthenon Athens', expected: 'GRC' },
    { location: 'Angkor Wat', expected: 'KHM' }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testLocation(testCase.location, testCase.expected);
    results.push({
      location: testCase.location,
      expected: testCase.expected,
      ...result
    });
    
    // API 호출 제한을 피하기 위한 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 결과 요약
  console.log('\n📊 테스트 결과 요약:');
  const successful = results.filter(r => r.success);
  const correct = results.filter(r => r.success && r.correct);
  
  console.log(`✅ 성공: ${successful.length}/${results.length}`);
  console.log(`✅ 올바른 국가 감지: ${correct.length}/${results.length}`);
  
  if (correct.length === results.length) {
    console.log('\n🎉 모든 테스트 통과! 간단한 지오코딩 시스템이 완벽하게 작동합니다.');
  } else {
    console.log('\n📋 문제가 있었던 케이스:');
    results.forEach(r => {
      if (!r.success || !r.correct) {
        console.log(`  - ${r.location}: ${r.success ? `${r.actual} (예상: ${r.expected})` : '실패'}`);
      }
    });
  }
}

// 테스트 실행
runMultipleTests();
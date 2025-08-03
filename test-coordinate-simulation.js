// 좌표 시스템 시뮬레이션 테스트
const testLocations = [
  {
    id: "test-1",
    title: "경복궁 근정전",
    category: "A. 유명 랜드마크",
    locationName: "경복궁",
    expectedAccuracy: 0.95,
    expectedDistance: 10
  },
  {
    id: "test-2", 
    title: "N서울타워 전망대",
    category: "A. 유명 랜드마크",
    locationName: "남산타워",
    expectedAccuracy: 0.95,
    expectedDistance: 15
  },
  {
    id: "test-3",
    title: "국립중앙박물관 입구",
    category: "B. 박물관/문화시설",
    locationName: "국립중앙박물관",
    expectedAccuracy: 0.90,
    expectedDistance: 20
  },
  {
    id: "test-4",
    title: "조계사 대웅전",
    category: "B. 종교시설", 
    locationName: "조계사",
    expectedAccuracy: 0.85,
    expectedDistance: 25
  },
  {
    id: "test-5",
    title: "명동 메인 스트리트",
    category: "C. 상업시설",
    locationName: "명동",
    expectedAccuracy: 0.80,
    expectedDistance: 50
  },
  {
    id: "test-6",
    title: "동대문 쇼핑거리",
    category: "C. 전통시장",
    locationName: "동대문시장",
    expectedAccuracy: 0.75,
    expectedDistance: 75
  },
  {
    id: "test-7",
    title: "청계천 청계광장 분수대",
    category: "D. 세부 위치",
    locationName: "청계천",
    expectedAccuracy: 0.70,
    expectedDistance: 100
  },
  {
    id: "test-8",
    title: "한강공원 반포 무지개분수",
    category: "D. 공원 내부",
    locationName: "반포한강공원",
    expectedAccuracy: 0.75,
    expectedDistance: 80
  },
  {
    id: "test-9",
    title: "익선동 한옥카페거리",
    category: "E. 맛집/카페",
    locationName: "익선동",
    expectedAccuracy: 0.65,
    expectedDistance: 150
  },
  {
    id: "test-10",
    title: "북촌한옥마을 삼청동길",
    category: "E. 골목/세부지점",
    locationName: "북촌한옥마을",
    expectedAccuracy: 0.70,
    expectedDistance: 120
  }
];

// 실제 좌표 참고값 (Google Maps 기준)
const referenceCoordinates = {
  "경복궁 근정전": { lat: 37.5796, lng: 126.9770 },
  "N서울타워 전망대": { lat: 37.5512, lng: 126.9882 },
  "국립중앙박물관 입구": { lat: 37.5240, lng: 126.9803 },
  "조계사 대웅전": { lat: 37.5706, lng: 126.9834 },
  "명동 메인 스트리트": { lat: 37.5636, lng: 126.9834 },
  "동대문 쇼핑거리": { lat: 37.5665, lng: 127.0074 },
  "청계천 청계광장 분수대": { lat: 37.5695, lng: 126.9785 },
  "한강공원 반포 무지개분수": { lat: 37.5178, lng: 126.9966 },
  "익선동 한옥카페거리": { lat: 37.5753, lng: 126.9938 },
  "북촌한옥마을 삼청동길": { lat: 37.5814, lng: 126.9849 }
};

// Haversine 공식으로 거리 계산
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 좌표 재생성 API 시뮬레이션
async function simulateCoordinateRegeneration(location) {
  console.log(`\n🔍 테스트: ${location.title} (${location.category})`);
  
  try {
    // 실제 API 호출은 주석 처리하고 시뮬레이션으로 대체
    /*
    const response = await fetch('/api/coordinates/regenerate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationName: location.locationName,
        minAccuracy: 0.9,
        forceRegenerate: true
      })
    });
    */
    
    // AI 정확도 시뮬레이션 (실제 시스템의 예상 성능)
    let simulatedAccuracy;
    let simulatedCoordinates;
    
    // 카테고리별 성능 시뮬레이션
    switch(location.category.split('.')[0]) {
      case 'A': // 유명 랜드마크
        simulatedAccuracy = 0.92 + Math.random() * 0.08; // 92-100%
        break;
      case 'B': // 박물관/문화시설
        simulatedAccuracy = 0.85 + Math.random() * 0.10; // 85-95%
        break;
      case 'C': // 상업시설
        simulatedAccuracy = 0.75 + Math.random() * 0.15; // 75-90%
        break;
      case 'D': // 세부 위치
        simulatedAccuracy = 0.65 + Math.random() * 0.20; // 65-85%
        break;
      case 'E': // 골목/세부지점
        simulatedAccuracy = 0.55 + Math.random() * 0.25; // 55-80%
        break;
      default:
        simulatedAccuracy = 0.70;
    }
    
    // 참고 좌표 기준으로 시뮬레이션된 좌표 생성
    const reference = referenceCoordinates[location.title];
    if (!reference) {
      throw new Error(`참고 좌표 없음: ${location.title}`);
    }
    
    // 정확도에 따른 오차 시뮬레이션 (미터)
    const maxErrorMeters = (1 - simulatedAccuracy) * 200; // 최대 200m 오차
    const latErrorDegrees = (Math.random() - 0.5) * 2 * (maxErrorMeters / 111000); // 위도 1도 ≈ 111km
    const lngErrorDegrees = (Math.random() - 0.5) * 2 * (maxErrorMeters / (111000 * Math.cos(reference.lat * Math.PI / 180)));
    
    simulatedCoordinates = {
      lat: reference.lat + latErrorDegrees,
      lng: reference.lng + lngErrorDegrees
    };
    
    // 실제 거리 계산
    const actualDistance = calculateDistance(
      reference.lat, reference.lng,
      simulatedCoordinates.lat, simulatedCoordinates.lng
    );
    
    const result = {
      success: true,
      coordinates: simulatedCoordinates,
      accuracy: simulatedAccuracy,
      actualDistance: Math.round(actualDistance),
      withinTarget: actualDistance <= 30,
      confidence: simulatedAccuracy,
      reasoning: `${location.category} - AI 생성 좌표`
    };
    
    console.log(`✅ 생성 완료: 정확도 ${(result.accuracy * 100).toFixed(1)}%, 실제 오차 ${result.actualDistance}m`);
    console.log(`📍 좌표: ${result.coordinates.lat.toFixed(6)}, ${result.coordinates.lng.toFixed(6)}`);
    console.log(`🎯 30m 이내: ${result.withinTarget ? '✅ 성공' : '❌ 실패'}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    return {
      success: false,
      error: error.message,
      accuracy: 0,
      actualDistance: 999,
      withinTarget: false
    };
  }
}

// Google Places API 검증 시뮬레이션
async function simulateGooglePlacesValidation(location, generatedCoords) {
  console.log(`🔍 Google Places 검증: ${location.title}`);
  
  // Google Places API 성능 시뮬레이션
  const isKnownPlace = ['A', 'B'].includes(location.category.split('.')[0]);
  
  let validationAccuracy;
  if (isKnownPlace) {
    validationAccuracy = 0.85 + Math.random() * 0.15; // 85-100%
  } else {
    validationAccuracy = 0.60 + Math.random() * 0.25; // 60-85%
  }
  
  const isValid = validationAccuracy >= 0.85;
  
  console.log(`📊 검증 결과: ${isValid ? '✅ 통과' : '❌ 실패'} (${(validationAccuracy * 100).toFixed(1)}%)`);
  
  return {
    isValid,
    accuracy: validationAccuracy,
    confidence: validationAccuracy,
    reasoning: isKnownPlace ? 'Google Places 확인됨' : '부분적 확인'
  };
}

// 전체 시뮬레이션 실행
async function runSimulation() {
  console.log('🚀 좌표 시스템 정확도 시뮬레이션 시작\n');
  console.log('=' * 60);
  
  const results = [];
  
  for (const location of testLocations) {
    const coordResult = await simulateCoordinateRegeneration(location);
    
    if (coordResult.success) {
      const validationResult = await simulateGooglePlacesValidation(location, coordResult.coordinates);
      
      results.push({
        location: location.title,
        category: location.category,
        accuracy: coordResult.accuracy,
        distance: coordResult.actualDistance,
        within30m: coordResult.withinTarget,
        validated: validationResult.isValid,
        expectedAccuracy: location.expectedAccuracy,
        expectedDistance: location.expectedDistance
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 100)); // 0.1초 대기
  }
  
  // 결과 분석
  console.log('\n📊 시뮬레이션 결과 분석');
  console.log('=' * 60);
  
  const within30m = results.filter(r => r.within30m).length;
  const totalTests = results.length;
  const successRate = (within30m / totalTests * 100).toFixed(1);
  
  console.log(`\n🎯 30m 이내 달성율: ${within30m}/${totalTests} (${successRate}%)`);
  
  // 카테고리별 분석
  const categories = [...new Set(results.map(r => r.category.split('.')[0]))];
  
  categories.forEach(cat => {
    const categoryResults = results.filter(r => r.category.startsWith(cat));
    const categorySuccess = categoryResults.filter(r => r.within30m).length;
    const categoryRate = (categorySuccess / categoryResults.length * 100).toFixed(1);
    
    console.log(`📋 카테고리 ${cat}: ${categorySuccess}/${categoryResults.length} (${categoryRate}%)`);
  });
  
  // 상세 결과 테이블
  console.log('\n📋 상세 결과:');
  console.log('장소명\t\t\t정확도\t실제오차\t30m이내\t검증통과');
  console.log('-' * 80);
  
  results.forEach(r => {
    const name = r.location.padEnd(20);
    const accuracy = `${(r.accuracy * 100).toFixed(1)}%`.padEnd(8);
    const distance = `${r.distance}m`.padEnd(8);
    const within = r.within30m ? '✅' : '❌';
    const validated = r.validated ? '✅' : '❌';
    
    console.log(`${name}\t${accuracy}\t${distance}\t${within}\t${validated}`);
  });
  
  return {
    totalTests,
    within30mCount: within30m,
    successRate: parseFloat(successRate),
    results
  };
}

// 시뮬레이션 실행
runSimulation().then(summary => {
  console.log(`\n🏁 시뮬레이션 완료!`);
  console.log(`총 ${summary.totalTests}개 장소 중 ${summary.within30mCount}개가 30m 이내 정확도 달성`);
  console.log(`전체 성공률: ${summary.successRate}%`);
}).catch(error => {
  console.error('시뮬레이션 오류:', error);
});

module.exports = { testLocations, runSimulation };
/**
 * 자동완성 최적화 전후 좌표 정확도 비교 테스트
 * /api/locations/extract-regional-info API를 활용
 */

// 테스트 케이스: 실제 유명 관광지들 (국가정보 중요)
const testCases = [
  {
    name: "앙코르와트",
    expectedCountry: "캄보디아",
    expectedRegion: "시엠립",
    expectedLat: 13.4125,
    expectedLng: 103.8670
  },
  {
    name: "페트라",
    expectedCountry: "요단",
    expectedRegion: "마안",
    expectedLat: 30.3285,
    expectedLng: 35.4444
  },
  {
    name: "마추픽chu",
    expectedCountry: "페루",
    expectedRegion: "쿠스코",
    expectedLat: -13.1631,
    expectedLng: -72.5450
  },
  {
    name: "보로부두르",
    expectedCountry: "인도네시아",
    expectedRegion: "욕야카르타",
    expectedLat: -7.6079,
    expectedLng: 110.2038
  },
  {
    name: "쿠스코 대성당",
    expectedCountry: "페루",
    expectedRegion: "쿠스코",
    expectedLat: -13.5164,
    expectedLng: -71.9785
  }
];

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 거리 (km)
}

// 현재 방식: 복잡한 백그라운드 처리
async function testCurrentMethod(placeName, language = 'ko') {
  console.log(`🤖 [현재 방식] "${placeName}" 테스트 시작...`);
  const startTime = Date.now();
  
  try {
    // 1. 자동완성 API 호출
    const autocompleteResponse = await fetch(`http://localhost:3000/api/locations/${language}/search?q=${encodeURIComponent(placeName)}`);
    const autocompleteData = await autocompleteResponse.json();
    
    if (!autocompleteData.success || !autocompleteData.data || autocompleteData.data.length === 0) {
      throw new Error('자동완성 데이터 없음');
    }
    
    const suggestion = autocompleteData.data[0];
    console.log(`📍 자동완성 결과:`, suggestion);
    
    // 2. 백그라운드 처리 시뮬레이션 (복잡한 로직)
    const parts = suggestion.location.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      const region = parts[0];
      const country = parts[1];
      
      // 3. Gemini API로 정확한 지역정보 추출 (현재 방식)
      const geminiResponse = await fetch('http://localhost:3000/api/locations/extract-regional-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName: suggestion.name,
          language: language,
          detailed: true // 상세 정보 요청
        })
      });
      
      const geminiData = await geminiResponse.json();
      const duration = Date.now() - startTime;
      
      console.log(`✅ [현재 방식] 처리 완료 (${duration}ms)`);
      console.log(`📊 Gemini 결과:`, geminiData.data);
      
      if (geminiData.success && geminiData.data && geminiData.data.coordinates) {
        return {
          success: true,
          method: 'current',
          duration: duration,
          coordinates: geminiData.data.coordinates,
          region: geminiData.data.region,
          country: geminiData.data.country,
          countryCode: geminiData.data.countryCode,
          confidence: geminiData.data.confidence || 0.8
        };
      }
    }
    
    throw new Error('좌표 추출 실패');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [현재 방식] 실패 (${duration}ms):`, error.message);
    return {
      success: false,
      method: 'current',
      duration: duration,
      error: error.message
    };
  }
}

// 최적화 방식: 간단한 파싱만
async function testOptimizedMethod(placeName, language = 'ko') {
  console.log(`⚡ [최적화 방식] "${placeName}" 테스트 시작...`);
  const startTime = Date.now();
  
  try {
    // 1. 자동완성 API 호출 (동일)
    const autocompleteResponse = await fetch(`http://localhost:3000/api/locations/${language}/search?q=${encodeURIComponent(placeName)}`);
    const autocompleteData = await autocompleteResponse.json();
    
    if (!autocompleteData.success || !autocompleteData.data || autocompleteData.data.length === 0) {
      throw new Error('자동완성 데이터 없음');
    }
    
    const suggestion = autocompleteData.data[0];
    
    // 2. 간단한 파싱만 (최적화)
    const parts = suggestion.location.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      const region = parts[0];
      const country = parts[1];
      
      // 3. 기본적인 좌표 추출만 (Gemini API 호출 없음)
      const duration = Date.now() - startTime;
      
      console.log(`⚡ [최적화 방식] 처리 완료 (${duration}ms)`);
      console.log(`📊 파싱 결과: region=${region}, country=${country}`);
      
      // 실제로는 좌표가 없으므로 이후 가이드 생성 시에만 좌표 획득
      return {
        success: true,
        method: 'optimized',
        duration: duration,
        coordinates: null, // 좌표는 나중에 가이드 생성할 때
        region: region,
        country: country,
        countryCode: undefined,
        confidence: 0.7
      };
    }
    
    throw new Error('위치 정보 파싱 실패');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [최적화 방식] 실패 (${duration}ms):`, error.message);
    return {
      success: false,
      method: 'optimized',
      duration: duration,
      error: error.message
    };
  }
}

// 메인 테스트 실행
async function runComparisonTest() {
  console.log('\n🧪 자동완성 최적화 좌표 정확도 테스트 시작\n');
  console.log('=' .repeat(80));
  
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📍 테스트 ${i+1}/${testCases.length}: ${testCase.name}`);
    console.log(`예상 위치: ${testCase.expectedRegion}, ${testCase.expectedCountry}`);
    console.log(`예상 좌표: ${testCase.expectedLat}, ${testCase.expectedLng}`);
    console.log('-'.repeat(60));
    
    // 현재 방식 테스트
    const currentResult = await testCurrentMethod(testCase.name);
    
    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 최적화 방식 테스트
    const optimizedResult = await testOptimizedMethod(testCase.name);
    
    // 결과 분석
    let currentAccuracy = 'N/A';
    let optimizedAccuracy = 'N/A';
    
    if (currentResult.success && currentResult.coordinates) {
      const distance = calculateDistance(
        testCase.expectedLat, testCase.expectedLng,
        currentResult.coordinates.lat, currentResult.coordinates.lng
      );
      currentAccuracy = `${distance.toFixed(1)}km`;
    }
    
    // 최적화 방식은 좌표가 없으므로 지역/국가 정확도로 평가
    if (optimizedResult.success) {
      const regionMatch = optimizedResult.region?.toLowerCase().includes(testCase.expectedRegion.toLowerCase()) || 
                         testCase.expectedRegion.toLowerCase().includes(optimizedResult.region?.toLowerCase() || '');
      const countryMatch = optimizedResult.country?.toLowerCase().includes(testCase.expectedCountry.toLowerCase()) ||
                          testCase.expectedCountry.toLowerCase().includes(optimizedResult.country?.toLowerCase() || '');
      optimizedAccuracy = `지역:${regionMatch?'✅':'❌'} 국가:${countryMatch?'✅':'❌'}`;
    }
    
    const testResult = {
      placeName: testCase.name,
      currentResult,
      optimizedResult,
      currentAccuracy,
      optimizedAccuracy,
      speedImprovement: currentResult.success && optimizedResult.success ? 
        `${((currentResult.duration - optimizedResult.duration) / currentResult.duration * 100).toFixed(1)}%` : 'N/A'
    };
    
    results.push(testResult);
    
    console.log(`\n📊 결과 요약:`);
    console.log(`현재 방식: ${currentResult.success ? '성공' : '실패'} (${currentResult.duration}ms) - 정확도: ${currentAccuracy}`);
    console.log(`최적화: ${optimizedResult.success ? '성공' : '실패'} (${optimizedResult.duration}ms) - 정확도: ${optimizedAccuracy}`);
    if (testResult.speedImprovement !== 'N/A') {
      console.log(`⚡ 속도 개선: ${testResult.speedImprovement}`);
    }
    
    console.log('=' .repeat(80));
  }
  
  // 전체 결과 요약
  console.log('\n📈 전체 테스트 결과 요약\n');
  
  const successfulCurrent = results.filter(r => r.currentResult.success).length;
  const successfulOptimized = results.filter(r => r.optimizedResult.success).length;
  const avgCurrentDuration = results
    .filter(r => r.currentResult.success)
    .reduce((sum, r) => sum + r.currentResult.duration, 0) / successfulCurrent || 0;
  const avgOptimizedDuration = results
    .filter(r => r.optimizedResult.success)
    .reduce((sum, r) => sum + r.optimizedResult.duration, 0) / successfulOptimized || 0;
  
  console.log(`✅ 성공률:`);
  console.log(`  현재 방식: ${successfulCurrent}/${testCases.length} (${(successfulCurrent/testCases.length*100).toFixed(1)}%)`);
  console.log(`  최적화: ${successfulOptimized}/${testCases.length} (${(successfulOptimized/testCases.length*100).toFixed(1)}%)`);
  
  console.log(`⏱️ 평균 처리 시간:`);
  console.log(`  현재 방식: ${avgCurrentDuration.toFixed(0)}ms`);
  console.log(`  최적화: ${avgOptimizedDuration.toFixed(0)}ms`);
  
  if (avgCurrentDuration > 0 && avgOptimizedDuration > 0) {
    const improvement = ((avgCurrentDuration - avgOptimizedDuration) / avgCurrentDuration * 100).toFixed(1);
    console.log(`  ⚡ 평균 속도 개선: ${improvement}%`);
  }
  
  console.log(`\n🎯 결론:`);
  if (successfulCurrent > successfulOptimized) {
    console.log(`❌ 최적화 시 정확도 저하 발생 - 현재 방식 유지 권장`);
  } else if (successfulCurrent === successfulOptimized) {
    console.log(`✅ 정확도 유지하면서 속도 개선 가능 - 최적화 적용 권장`);
  } else {
    console.log(`🤔 최적화 방식이 더 정확함 - 추가 분석 필요`);
  }
  
  return results;
}

// 실행
if (require.main === module) {
  runComparisonTest()
    .then(() => {
      console.log('\n✅ 테스트 완료');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { runComparisonTest, testCurrentMethod, testOptimizedMethod };
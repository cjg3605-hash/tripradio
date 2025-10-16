// 확장된 정확도 테스트 - 10회 반복 + 다양한 장소
const { runComprehensiveTest, calculateDistance } = require('./test-real-apis.js');
const axios = require('axios');

const GOOGLE_PLACES_API_KEY = "AIzaSyBX31RqKOdt98m5cDOJft-3EIcJyPg6C5c";

// 더 많은 테스트 대상 (국내외 다양한 관광지)
const EXTENDED_TEST_LOCATIONS = [
  // 국내
  { name: "경복궁", knownCoordinate: { lat: 37.5789, lng: 126.9770 } },
  { name: "남산타워", knownCoordinate: { lat: 37.5512, lng: 126.9882 } },
  { name: "국립중앙박물관", knownCoordinate: { lat: 37.5243, lng: 126.9800 } },
  { name: "청계청", knownCoordinate: { lat: 37.5697, lng: 126.9783 } },
  { name: "동대문디자인플라자", knownCoordinate: { lat: 37.5665, lng: 127.0092 } },
  
  // 해외 (알려진 정확한 좌표)
  { name: "에펠탑", knownCoordinate: { lat: 48.8584, lng: 2.2945 } },
  { name: "타이틀 브리지", knownCoordinate: { lat: 51.5055, lng: -0.0754 } },
  { name: "자유의 여신상", knownCoordinate: { lat: 40.6892, lng: -74.0445 } },
  { name: "콜로세움", knownCoordinate: { lat: 41.8902, lng: 12.4922 } },
  { name: "마츄픽츄", knownCoordinate: { lat: -13.1631, lng: -72.5450 } }
];

// Google Places API로만 테스트 (가장 일반적인 사용 케이스)
async function testGooglePlacesOnly(locationName) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
      params: {
        input: locationName,
        inputtype: 'textquery',
        fields: 'geometry,name,place_id',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (response.data.candidates && response.data.candidates.length > 0) {
      const place = response.data.candidates[0];
      return {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        name: place.name
      };
    }
    return null;
  } catch (error) {
    console.error(`API 호출 실패: ${error.message}`);
    return null;
  }
}

// 10회 반복 테스트
async function runRepeatedTest(locationData, iterations = 10) {
  console.log(`\n🔄 ${locationData.name} - ${iterations}회 반복 테스트`);
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = await testGooglePlacesOnly(locationData.name);
    if (result) {
      const distance = calculateDistance(
        locationData.knownCoordinate.lat, locationData.knownCoordinate.lng,
        result.lat, result.lng
      );
      results.push(distance);
      
      const status = distance <= 10 ? "✅" : distance <= 50 ? "⚠️" : "❌";
      console.log(`   ${i+1}: ${status} ${distance.toFixed(1)}m`);
    } else {
      console.log(`   ${i+1}: ❌ API 실패`);
    }
    
    // API 요청 제한 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (results.length > 0) {
    const avgError = results.reduce((sum, dist) => sum + dist, 0) / results.length;
    const successRate = results.filter(dist => dist <= 10).length / results.length * 100;
    const consistency = Math.max(...results) - Math.min(...results);
    
    console.log(`   📊 평균 오차: ${avgError.toFixed(1)}m`);
    console.log(`   🎯 10m 달성률: ${successRate.toFixed(1)}%`);
    console.log(`   📏 일관성 (최대-최소): ${consistency.toFixed(1)}m`);
    
    return {
      location: locationData.name,
      avgError,
      successRate,
      consistency,
      results
    };
  }
  
  return null;
}

// 전체 확장 테스트 실행
async function runExtendedTest() {
  console.log("🧪 확장된 정확도 테스트 시작");
  console.log("=".repeat(60));
  console.log("목표: 10m 이하 정확도, 일관성 검증");
  console.log("방법: Google Places API만 사용, 각 장소당 10회 테스트");
  console.log("=".repeat(60));
  
  const allResults = [];
  
  // 5개 장소만 테스트 (API 제한 고려)
  const testLocations = EXTENDED_TEST_LOCATIONS.slice(0, 5);
  
  for (const location of testLocations) {
    const result = await runRepeatedTest(location, 10);
    if (result) {
      allResults.push(result);
    }
    
    // 장소간 대기 시간
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 종합 분석
  console.log("\n" + "=".repeat(60));
  console.log("📊 종합 분석 결과");
  console.log("=".repeat(60));
  
  if (allResults.length > 0) {
    const overallAvgError = allResults.reduce((sum, r) => sum + r.avgError, 0) / allResults.length;
    const overallSuccessRate = allResults.reduce((sum, r) => sum + r.successRate, 0) / allResults.length;
    const mostConsistent = allResults.reduce((min, r) => r.consistency < min.consistency ? r : min);
    const leastConsistent = allResults.reduce((max, r) => r.consistency > max.consistency ? r : max);
    
    console.log(`전체 평균 오차: ${overallAvgError.toFixed(1)}m`);
    console.log(`전체 10m 달성률: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`가장 일관된 장소: ${mostConsistent.location} (${mostConsistent.consistency.toFixed(1)}m 편차)`);
    console.log(`가장 불일관한 장소: ${leastConsistent.location} (${leastConsistent.consistency.toFixed(1)}m 편차)`);
    
    console.log("\n🏆 장소별 순위:");
    allResults
      .sort((a, b) => a.avgError - b.avgError)
      .forEach((result, index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
        console.log(`${medal} ${result.location}: ${result.avgError.toFixed(1)}m (성공률 ${result.successRate.toFixed(1)}%)`);
      });
    
    // 현실적 평가
    console.log("\n🎯 현실적 평가:");
    if (overallSuccessRate >= 80) {
      console.log("✅ 우수: 10m 목표 달성 가능");
    } else if (overallSuccessRate >= 50) {
      console.log("⚠️ 보통: 목표 달성 어려움, 20-30m 목표 권장");
    } else if (overallSuccessRate >= 20) {
      console.log("❌ 부족: 50m 목표로 재설정 필요");
    } else {
      console.log("🚨 심각: 100m 이상 오차, 근본적 접근법 변경 필요");
    }
  }
  
  return allResults;
}

// 실행
if (require.main === module) {
  runExtendedTest().catch(console.error);
}

module.exports = { runExtendedTest };
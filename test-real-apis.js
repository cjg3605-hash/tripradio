// Real API Testing - 실제 정확도 검증 시스템
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// 환경변수에서 API 키 로드
const GEMINI_API_KEY = "AIzaSyBX31RqKOdt98m5cDOJft-3EIcJyPg6C5c";
const GOOGLE_PLACES_API_KEY = "AIzaSyBX31RqKOdt98m5cDOJft-3EIcJyPg6C5c";

// 실제 테스트 대상 관광지 (알려진 정확한 좌표와 함께)
const TEST_LOCATIONS = [
  {
    name: "경복궁",
    knownCoordinate: { lat: 37.5789, lng: 126.9770 }, // 정문 매표소 실제 좌표
    expectedStartingPoint: "정문 매표소"
  },
  {
    name: "남산타워",
    knownCoordinate: { lat: 37.5512, lng: 126.9882 }, // 매표소 실제 좌표
    expectedStartingPoint: "매표소"
  },
  {
    name: "국립중앙박물관",
    knownCoordinate: { lat: 37.5243, lng: 126.9800 }, // 정문 입구 실제 좌표
    expectedStartingPoint: "정문 입구"
  }
];

// Haversine 거리 계산 함수
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// AI 기반 구체적 시작점 생성 테스트
async function testSpecificStartingPointGeneration(locationName) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
당신은 관광지 시작점 전문가입니다. "${locationName}"에서 투어를 시작할 구체적이고 정확한 시작점을 지정해주세요.

다음 조건을 만족해야 합니다:
1. 모호한 "정문"이 아닌 구체적인 시설명 (예: "정문 매표소", "대웅전 정면 계단 하단")
2. 실제로 존재하는 명확한 랜드마크
3. 관광객이 쉽게 찾을 수 있는 곳
4. GPS 좌표를 정확히 특정할 수 있는 곳

JSON 형식으로 응답해주세요:
{
  "specificName": "구체적인 시설명",
  "description": "상세 설명",
  "type": "entrance_gate|ticket_booth|main_building_entrance|information_center",
  "expectedFeatures": ["기대되는 시설물들"],
  "confidence": 0.9
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON 파싱 시도
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const jsonData = JSON.parse(match[0]);
        return jsonData;
      }
    } catch {
      // JSON 파싱 실패시 기본값 반환
      return {
        specificName: `${locationName} 정문 매표소`,
        description: "AI 파싱 실패 - 기본값 사용",
        type: "ticket_booth",
        expectedFeatures: ["매표소", "안내판"],
        confidence: 0.5
      };
    }
  } catch (error) {
    console.error(`AI 시작점 생성 실패 (${locationName}):`, error.message);
    return null;
  }
}

// Google Places API 좌표 검색 테스트
async function testGooglePlacesAPI(query) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
      params: {
        input: query,
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
        name: place.name,
        place_id: place.place_id
      };
    }
    return null;
  } catch (error) {
    console.error(`Google Places API 실패 (${query}):`, error.message);
    return null;
  }
}

// Wikipedia API 좌표 검색 테스트
async function testWikipediaAPI(locationName) {
  try {
    // Wikipedia 검색
    const searchResponse = await axios.get('https://ko.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(locationName));
    
    if (searchResponse.data.coordinates) {
      return {
        lat: searchResponse.data.coordinates.lat,
        lng: searchResponse.data.coordinates.lon,
        source: 'wikipedia'
      };
    }
    return null;
  } catch (error) {
    console.error(`Wikipedia API 실패 (${locationName}):`, error.message);
    return null;
  }
}

// 전체 테스트 실행
async function runComprehensiveTest() {
  console.log("🧪 실제 API 정확도 테스트 시작\n");
  console.log("=" .repeat(60));
  
  const results = [];
  
  for (let i = 0; i < TEST_LOCATIONS.length; i++) {
    const location = TEST_LOCATIONS[i];
    console.log(`\n📍 ${i + 1}. ${location.name} 테스트 중...`);
    
    // 1단계: AI 기반 구체적 시작점 생성
    console.log("   🤖 AI 구체적 시작점 생성 중...");
    const aiStartingPoint = await testSpecificStartingPointGeneration(location.name);
    
    // 2단계: Google Places API 좌표 검색
    console.log("   🗺️  Google Places API 검색 중...");
    const googleResult = await testGooglePlacesAPI(
      aiStartingPoint ? aiStartingPoint.specificName : `${location.name} ${location.expectedStartingPoint}`
    );
    
    // 3단계: Wikipedia API 좌표 검색
    console.log("   📚 Wikipedia API 검색 중...");
    const wikipediaResult = await testWikipediaAPI(location.name);
    
    // 4단계: 정확도 계산
    let bestResult = null;
    let bestDistance = Infinity;
    let bestSource = '';
    
    if (googleResult) {
      const distance = calculateDistance(
        location.knownCoordinate.lat, location.knownCoordinate.lng,
        googleResult.lat, googleResult.lng
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestResult = googleResult;
        bestSource = 'Google Places';
      }
    }
    
    if (wikipediaResult) {
      const distance = calculateDistance(
        location.knownCoordinate.lat, location.knownCoordinate.lng,
        wikipediaResult.lat, wikipediaResult.lng
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestResult = wikipediaResult;
        bestSource = 'Wikipedia';
      }
    }
    
    // 결과 출력
    const accuracy = bestDistance <= 10 ? "✅ 10m 이내" : 
                     bestDistance <= 50 ? "⚠️ 50m 이내" : 
                     "❌ 50m 초과";
    
    console.log(`   📊 결과: ${accuracy} (${bestDistance.toFixed(1)}m 오차)`);
    console.log(`   🎯 최적 소스: ${bestSource}`);
    console.log(`   🤖 AI 생성 시작점: ${aiStartingPoint?.specificName || '실패'}`);
    
    results.push({
      location: location.name,
      aiStartingPoint: aiStartingPoint?.specificName || '실패',
      bestDistance: bestDistance,
      bestSource: bestSource,
      accuracy: bestDistance <= 10,
      bestResult: bestResult
    });
  }
  
  // 전체 결과 요약
  console.log("\n" + "=".repeat(60));
  console.log("📊 전체 테스트 결과 요약");
  console.log("=".repeat(60));
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.accuracy).length;
  const averageError = results.reduce((sum, r) => sum + r.bestDistance, 0) / totalTests;
  
  console.log(`총 테스트: ${totalTests}개`);
  console.log(`10m 달성: ${successfulTests}개 (${(successfulTests/totalTests*100).toFixed(1)}%)`);
  console.log(`평균 오차: ${averageError.toFixed(1)}m`);
  
  results.forEach((result, index) => {
    const status = result.accuracy ? "✅" : "❌";
    console.log(`${status} ${result.location}: ${result.bestDistance.toFixed(1)}m (${result.bestSource})`);
  });
  
  // 실제 성능 평가
  if (successfulTests === 0) {
    console.log("\n🚨 경고: 10m 정확도 목표를 달성한 테스트가 없습니다.");
    console.log("현실적인 목표 재설정이 필요합니다.");
  } else if (successfulTests < totalTests * 0.7) {
    console.log("\n⚠️ 주의: 10m 정확도 달성률이 70% 미만입니다.");
    console.log("추가 최적화가 필요합니다.");
  } else {
    console.log("\n✅ 성공: 10m 정확도 목표가 달성되었습니다!");
  }
  
  return results;
}

// 테스트 실행
if (require.main === module) {
  runComprehensiveTest().catch(console.error);
}

module.exports = { runComprehensiveTest, calculateDistance };
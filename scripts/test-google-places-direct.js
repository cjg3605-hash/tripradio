const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Google Places API 직접 테스트
async function testGooglePlaces() {
  try {
    console.log('🔍 Google Places API 직접 테스트 시작');
    
    const queries = [
      '자갈치시장 입구',
      '자갈치시장 매표소', 
      '자갈치시장',
      'Jagalchi Market'
    ];
    
    for (const query of queries) {
      console.log(`\n📍 검색어: "${query}"`);
      
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        console.log('❌ GOOGLE_PLACES_API_KEY 환경변수 없음');
        continue;
      }
      
      console.log(`🔑 API 키 확인: ${apiKey.substring(0, 10)}...`);
      
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,formatted_address,geometry,name&key=${apiKey}&language=ko`;
      
      console.log(`🌐 요청 URL: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
      
      const response = await axios.get(url);
      const data = response.data;
      
      console.log(`📡 응답 상태: ${data.status}`);
      
      if (data.status === 'OK' && data.candidates.length > 0) {
        const place = data.candidates[0];
        console.log(`✅ 발견: ${place.name}`);
        console.log(`📍 좌표: ${place.geometry.location.lat}, ${place.geometry.location.lng}`);
        console.log(`📍 주소: ${place.formatted_address}`);
        
        // 32WJ+M8와 비교
        const foundLat = place.geometry.location.lat;
        const foundLng = place.geometry.location.lng;
        const expectedLat = 35.097; // 32WJ+M8 대략 좌표
        const expectedLng = 129.031;
        
        const distance = calculateDistance(foundLat, foundLng, expectedLat, expectedLng);
        console.log(`📏 32WJ+M8와의 거리 차이: ${distance.toFixed(0)}m`);
        
      } else {
        console.log(`❌ 검색 결과 없음: ${data.status}`);
        if (data.error_message) {
          console.log(`   오류: ${data.error_message}`);
        }
      }
      
      // API 호출 제한을 위해 잠깐 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

// 두 좌표 간 거리 계산 (미터 단위)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

testGooglePlaces();
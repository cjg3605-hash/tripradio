// Plus Code 생성 테스트 (주요 장소만)
import { config } from 'dotenv';
config({ path: '.env.local' });

const TEST_LOCATIONS = [
  { name: '석굴암', query: '석굴암 경주 Seokguram' },
  { name: '자갈치시장', query: '자갈치시장 부산 Jagalchi Market' },
  { name: '에펠탑', query: 'Eiffel Tower Paris France' }
];

async function testPlusCodeGeneration() {
  console.log('🧪 Plus Code 생성 테스트 시작...\n');
  
  for (const location of TEST_LOCATIONS) {
    try {
      console.log(`📍 ${location.name} 처리 중...`);
      
      // 1. Google Places로 좌표 검색
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(location.query)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      );
      
      const data = await response.json();
      if (data.status !== 'OK' || !data.results.length) {
        console.log(`   ❌ Google Places 검색 실패`);
        continue;
      }
      
      const place = data.results[0];
      const lat = place.geometry.location.lat;
      const lng = place.geometry.location.lng;
      
      console.log(`   좌표: ${lat}, ${lng}`);
      console.log(`   이름: ${place.name}`);
      
      // 2. Plus Code 생성 (Google Geocoding 역검색)
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_PLACES_API_KEY}&result_type=plus_code`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
          const result = geocodeData.results[0];
          const plusCodeMatch = result.formatted_address.match(/([23456789CFGHJMPQRVWX]{4,}\+[23456789CFGHJMPQRVWX]{2,})/);
          
          if (plusCodeMatch) {
            const plusCode = plusCodeMatch[1];
            console.log(`   Plus Code: ${plusCode}`);
            
            // 3. Plus Code 검증
            const verifyResponse = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
            );
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              if (verifyData.status === 'OK' && verifyData.results.length > 0) {
                const verifyResult = verifyData.results[0];
                const reverseLat = verifyResult.geometry.location.lat;
                const reverseLng = verifyResult.geometry.location.lng;
                
                // 거리 계산
                const distance = Math.sqrt(
                  Math.pow((reverseLat - lat) * 111000, 2) + 
                  Math.pow((reverseLng - lng) * 111000 * Math.cos(lat * Math.PI / 180), 2)
                );
                
                console.log(`   검증: ${Math.round(distance)}m 차이`);
                console.log(`   ${distance < 50 ? '✅ 정확함' : '⚠️ 부정확함'}`);
                
                // 결과 요약
                console.log(`\n   📋 결과:`);
                console.log(`   '${location.name}': '${plusCode}',`);
              }
            }
          } else {
            console.log(`   ❌ Plus Code를 찾을 수 없음`);
          }
        }
      }
      
      console.log(''); // 줄바꿈
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ 오류: ${error.message}`);
    }
  }
  
  console.log('🎯 테스트 완료!');
}

testPlusCodeGeneration();
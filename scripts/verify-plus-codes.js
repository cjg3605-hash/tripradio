// Plus Code 검증 스크립트
import { config } from 'dotenv';
config({ path: '.env.local' });

async function verifyPlusCodes() {
  try {
    console.log('🔍 Plus Code 검증 시작...');
    
    // 1. 실제 석굴암 좌표로 Plus Code 생성
    const correctLat = 35.7949255;
    const correctLng = 129.3492739;
    
    // Plus Codes API로 정확한 Plus Code 확인
    const response = await fetch(
      `https://plus.codes/api?address=${correctLat},${correctLng}&emode=json`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 실제 석굴암 Plus Code:`);
      console.log(`   좌표: ${correctLat}, ${correctLng}`);
      console.log(`   정확한 Plus Code: ${data.plus_code?.global_code || 'N/A'}`);
      console.log(`   로컬 코드: ${data.plus_code?.local_code || 'N/A'}`);
      
      // 2. 배치 코드에 있던 잘못된 Plus Code 검증
      const wrongPlusCode = 'QQ74+PH 경주시';
      console.log(`\n❌ 배치 코드의 잘못된 Plus Code: ${wrongPlusCode}`);
      
      // Google Geocoding API로 잘못된 Plus Code가 어디를 가리키는지 확인
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(wrongPlusCode)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
          const wrongResult = geocodeData.results[0];
          const wrongLat = wrongResult.geometry.location.lat;
          const wrongLng = wrongResult.geometry.location.lng;
          
          console.log(`   잘못된 Plus Code가 가리키는 위치: ${wrongLat}, ${wrongLng}`);
          console.log(`   주소: ${wrongResult.formatted_address}`);
          
          // 거리 계산
          const R = 6371000;
          const φ1 = correctLat * Math.PI/180;
          const φ2 = wrongLat * Math.PI/180;
          const Δφ = (wrongLat - correctLat) * Math.PI/180;
          const Δλ = (wrongLng - correctLng) * Math.PI/180;

          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          console.log(`   실제 석굴암과의 거리: ${Math.round(distance)}m`);
          console.log(`   🗺️ 잘못된 위치 확인: https://maps.google.com/?q=${wrongLat},${wrongLng}`);
        }
      }
      
      // 3. 다른 Plus Code들도 검증 (샘플)
      console.log(`\n🔍 다른 Plus Code들 검증...`);
      const plusCodeDB = {
        '자갈치시장': '32WJ+M8 부산광역시',
        '해운대해수욕장': '33X4+XP 부산광역시',
        '경복궁': '4WPQ+8H 서울특별시',
        '명동': '4WPR+XW 서울특별시'
      };
      
      for (const [location, plusCode] of Object.entries(plusCodeDB)) {
        const testResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
        );
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData.status === 'OK' && testData.results.length > 0) {
            const result = testData.results[0];
            console.log(`   ${location}: ${plusCode} → ${result.geometry.location.lat}, ${result.geometry.location.lng}`);
          } else {
            console.log(`   ${location}: ${plusCode} → ❌ 찾을 수 없음`);
          }
        }
        
        // API 부하 방지
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
    } else {
      console.log('❌ Plus Codes API 오류');
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

verifyPlusCodes();
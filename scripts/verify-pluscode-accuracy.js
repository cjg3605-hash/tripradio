/**
 * 🔍 Plus Code 정확성 검증
 * Q8VX+XP 경주시 경상북도가 실제 석굴암인지 확인
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function verifyPlusCode() {
  try {
    console.log('🔍 석굴암 Plus Code 정확성 검증');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    // 1. 제공된 Plus Code 검증
    console.log('\n1️⃣ 제공된 Plus Code 확인');
    const providedPlusCode = 'Q8VX+XP 경주시 경상북도';
    console.log(`Plus Code: ${providedPlusCode}`);
    
    const response1 = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: providedPlusCode,
        key: apiKey,
        language: 'ko'
      }
    });
    
    if (response1.data.status === 'OK' && response1.data.results.length > 0) {
      const result = response1.data.results[0];
      console.log(`✅ Plus Code 위치: ${result.formatted_address}`);
      console.log(`   좌표: ${result.geometry.location.lat}, ${result.geometry.location.lng}`);
    } else {
      console.log(`❌ Plus Code 해석 실패: ${response1.data.status}`);
    }
    
    // 2. "석굴암" 직접 검색으로 비교
    console.log('\n2️⃣ "석굴암" 직접 검색');
    const response2 = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
      params: {
        input: '석굴암',
        inputtype: 'textquery',
        fields: 'place_id,formatted_address,geometry,name',
        key: apiKey,
        language: 'ko'
      }
    });
    
    if (response2.data.status === 'OK' && response2.data.candidates.length > 0) {
      const seokguram = response2.data.candidates[0];
      console.log(`✅ 석굴암 검색 결과: ${seokguram.name}`);
      console.log(`   주소: ${seokguram.formatted_address}`);
      console.log(`   좌표: ${seokguram.geometry.location.lat}, ${seokguram.geometry.location.lng}`);
      
      // 3. 거리 계산
      if (response1.data.status === 'OK') {
        const pluscodeLat = response1.data.results[0].geometry.location.lat;
        const pluscodeLng = response1.data.results[0].geometry.location.lng;
        const seokguramLat = seokguram.geometry.location.lat;
        const seokguramLng = seokguram.geometry.location.lng;
        
        const distance = Math.sqrt(
          Math.pow((seokguramLat - pluscodeLat) * 111000, 2) + 
          Math.pow((seokguramLng - pluscodeLng) * 111000 * Math.cos(seokguramLat * Math.PI / 180), 2)
        );
        
        console.log(`\n📏 Plus Code vs 실제 석굴암 거리: ${distance.toFixed(0)}m`);
        
        if (distance < 100) {
          console.log(`✅ 정확함! Plus Code가 실제 석굴암과 ${distance.toFixed(0)}m 이내`);
        } else if (distance < 500) {
          console.log(`⚠️ 근접함. Plus Code가 실제 석굴암에서 ${distance.toFixed(0)}m 떨어져 있음`);
        } else {
          console.log(`❌ 부정확함. Plus Code가 실제 석굴암에서 ${distance.toFixed(0)}m 떨어져 있음`);
        }
      }
    } else {
      console.log(`❌ 석굴암 검색 실패: ${response2.data.status}`);
    }
    
    // 4. 우리 DB의 Plus Code와 비교
    console.log('\n3️⃣ 배치 시스템에서 사용한 Plus Code 확인');
    const ourPlusCode = 'QQ74+PH 경주시'; // plus-code-integration.ts에서 확인
    console.log(`우리 시스템 Plus Code: ${ourPlusCode}`);
    
    const response3 = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: ourPlusCode,
        key: apiKey,
        language: 'ko'
      }
    });
    
    if (response3.data.status === 'OK' && response3.data.results.length > 0) {
      const ourResult = response3.data.results[0];
      console.log(`✅ 우리 Plus Code 위치: ${ourResult.formatted_address}`);
      console.log(`   좌표: ${ourResult.geometry.location.lat}, ${ourResult.geometry.location.lng}`);
      
      // 우리 Plus Code vs 실제 석굴암 거리
      if (response2.data.status === 'OK') {
        const ourLat = ourResult.geometry.location.lat;
        const ourLng = ourResult.geometry.location.lng;
        const seokguramLat = response2.data.candidates[0].geometry.location.lat;
        const seokguramLng = response2.data.candidates[0].geometry.location.lng;
        
        const ourDistance = Math.sqrt(
          Math.pow((seokguramLat - ourLat) * 111000, 2) + 
          Math.pow((seokguramLng - ourLng) * 111000 * Math.cos(seokguramLat * Math.PI / 180), 2)
        );
        
        console.log(`📏 우리 Plus Code vs 실제 석굴암 거리: ${ourDistance.toFixed(0)}m`);
        
        if (ourDistance < 100) {
          console.log(`✅ 우리 시스템이 정확함! ${ourDistance.toFixed(0)}m 이내`);
        } else {
          console.log(`⚠️ 우리 시스템 개선 필요. ${ourDistance.toFixed(0)}m 차이`);
        }
      }
    }
    
    console.log('\n🎯 결론:');
    console.log('   Plus Code는 약 10-50m 정확도로 특정 위치를 가리킵니다.');
    console.log('   석굴암 같은 문화재의 경우 입구, 주차장, 매표소 등');
    console.log('   여러 지점이 있을 수 있어 약간의 차이는 정상입니다.');
    
  } catch (error) {
    console.error('❌ 검증 실패:', error.message);
  }
}

verifyPlusCode();
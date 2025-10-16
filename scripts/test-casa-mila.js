#!/usr/bin/env node

/**
 * 카사밀라 검색 테스트 - Places API 작동 확인
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testCasaMilaSearch() {
  console.log('🏠 카사밀라 검색 테스트\n');

  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google API 키가 없습니다!');
    return;
  }

  // 카사밀라 관련 다양한 검색어 테스트
  const testQueries = [
    '카사밀라',
    'Casa Mila',
    'Casa Milà',
    'La Pedrera',
    'Casa Mila Barcelona',
    'Casa Milà Barcelona',
    'La Pedrera Barcelona',
    'Antoni Gaudi Casa Mila',
    'Passeig de Gràcia Casa Milà',
    '카사밀라 바르셀로나'
  ];

  for (const query of testQueries) {
    console.log(`\n🔍 검색: "${query}"`);
    
    try {
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
      const fullUrl = `${url}?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address,types&key=${googleApiKey}`;
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.candidates?.length > 0) {
        const candidate = data.candidates[0];
        console.log(`   ✅ 발견: ${candidate.name}`);
        console.log(`   📍 좌표: ${candidate.geometry.location.lat}, ${candidate.geometry.location.lng}`);
        console.log(`   📧 주소: ${candidate.formatted_address}`);
        console.log(`   🏷️ 타입: ${candidate.types?.slice(0, 3).join(', ')}`);
        
        // 바르셀로나 시내인지 확인 (대략적 범위)
        const lat = candidate.geometry.location.lat;
        const lng = candidate.geometry.location.lng;
        
        const isBarcelona = (lat > 41.35 && lat < 41.45) && (lng > 2.05 && lng < 2.25);
        console.log(`   🏙️ 바르셀로나 시내: ${isBarcelona ? '✅ 맞음' : '❌ 틀림 - 옆동네!'}`);
        
        if (!isBarcelona) {
          console.log(`   🚨 경고: 좌표가 바르셀로나 범위를 벗어남!`);
        }
        
        // 실제 카사밀라 좌표와 비교 (41.3954, 2.1620 근처)
        const correctLat = 41.3954;
        const correctLng = 2.1620;
        const distance = calculateDistance(lat, lng, correctLat, correctLng);
        console.log(`   📏 정확한 카사밀라와의 거리: ${Math.round(distance)}m`);
        
        if (distance > 1000) {
          console.log(`   🚨 심각한 오류: 1km 이상 떨어진 위치!`);
        }
        
      } else {
        console.log(`   ❌ 검색 실패: ${data.status} - ${data.error_message || '결과 없음'}`);
      }
    } catch (error) {
      console.log(`   ❌ API 오류: ${error.message}`);
    }
    
    // API 제한 고려
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 정확한 카사밀라 주소로도 테스트
  console.log('\n📍 정확한 주소로 검색 테스트:');
  const correctAddress = 'Passeig de Gràcia, 92, Barcelona';
  
  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
    const fullUrl = `${url}?input=${encodeURIComponent(correctAddress)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${googleApiKey}`;
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      console.log(`✅ 주소 검색 성공:`);
      console.log(`   좌표: ${result.geometry.location.lat}, ${result.geometry.location.lng}`);
      console.log(`   주소: ${result.formatted_address}`);
    } else {
      console.log(`❌ 주소 검색 실패: ${data.status}`);
    }
  } catch (error) {
    console.log(`❌ 주소 검색 오류: ${error.message}`);
  }
}

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 실행
testCasaMilaSearch();
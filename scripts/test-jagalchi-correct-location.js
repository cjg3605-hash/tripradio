#!/usr/bin/env node

/**
 * 정확한 자갈치시장 위치 테스트
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testCorrectJagalchiLocation() {
  console.log('🐟 정확한 자갈치시장 위치 테스트\n');

  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google API 키가 없습니다!');
    return;
  }

  // Plus Code로 검색
  const testQueries = [
    '32WJ+M8 부산광역시',
    '32WJ+M8 Busan',
    'Jagalchi Market Busan',
    'Jagalchi Fish Market',
    '자갈치시장 부산',
    '자갈치수산시장',
    'Jagalchi Market 남포동',
    'Nampo-dong Jagalchi Market'
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
        
        // Plus Code로 역변환해서 확인
        const lat = candidate.geometry.location.lat;
        const lng = candidate.geometry.location.lng;
        console.log(`   🔗 Google Maps: https://maps.google.com/?q=${lat},${lng}`);
        
      } else {
        console.log(`   ❌ 검색 실패: ${data.status} - ${data.error_message || '결과 없음'}`);
      }
    } catch (error) {
      console.log(`   ❌ API 오류: ${error.message}`);
    }
    
    // API 제한 고려
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Plus Code를 좌표로 변환도 테스트
  console.log('\n📍 Plus Code 좌표 변환 테스트:');
  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=32WJ%2BM8%20부산광역시&key=${googleApiKey}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results?.length > 0) {
      const result = data.results[0];
      console.log(`✅ Plus Code 변환 성공:`);
      console.log(`   좌표: ${result.geometry.location.lat}, ${result.geometry.location.lng}`);
      console.log(`   주소: ${result.formatted_address}`);
      console.log(`   정확도: ${result.geometry.location_type}`);
    } else {
      console.log(`❌ Plus Code 변환 실패: ${data.status}`);
    }
  } catch (error) {
    console.log(`❌ Geocoding 오류: ${error.message}`);
  }
}

// 실행
testCorrectJagalchiLocation();
/**
 * 명동역 8번 출구 Google Places API 검색 테스트
 */

const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testMyeongdongExit8() {
  console.log('🔍 명동역 8번 출구 검색 테스트...');
  
  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google API 키를 찾을 수 없습니다!');
    return;
  }
  
  const queries = [
    '명동역 8번 출구',
    '명동역 8번출구',
    'Myeongdong Station Exit 8',
    '명동역',
    '명동 지하철역',
    '명동역 출구'
  ];
  
  console.log('📋 다양한 검색어로 테스트:\n');
  
  for (const query of queries) {
    try {
      console.log(`🔎 검색어: "${query}"`);
      
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
      const fullUrl = `${url}?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${googleApiKey}`;
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.candidates?.length > 0) {
        const candidate = data.candidates[0];
        console.log(`✅ 발견: ${candidate.name}`);
        console.log(`   좌표: ${candidate.geometry.location.lat}, ${candidate.geometry.location.lng}`);
        console.log(`   주소: ${candidate.formatted_address}`);
        
        // 명동 지역인지 확인 (대략적 범위)
        const lat = candidate.geometry.location.lat;
        const lng = candidate.geometry.location.lng;
        if (lat >= 37.55 && lat <= 37.57 && lng >= 126.98 && lng <= 127.00) {
          console.log('✅ 명동 지역 범위 내');
        } else {
          console.log('⚠️ 명동 지역을 벗어남');
        }
      } else {
        console.log('❌ 검색 결과 없음');
        if (data.error_message) {
          console.log(`   오류: ${data.error_message}`);
        }
      }
      
      console.log(''); // 빈 줄
      
    } catch (error) {
      console.error(`❌ 검색 오류: ${error.message}\n`);
    }
    
    // API 제한 고려하여 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 실행
testMyeongdongExit8();
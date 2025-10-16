/**
 * Google Places API 연결 테스트
 */

const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testGooglePlacesAPI() {
  console.log('🔍 Google Places API 연결 테스트 시작...');
  
  // 1. 환경변수 확인
  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  console.log('📋 환경변수 상태:');
  console.log(`  - GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? '✅ 있음' : '❌ 없음'}`);
  console.log(`  - GOOGLE_PLACES_API_KEY: ${process.env.GOOGLE_PLACES_API_KEY ? '✅ 있음' : '❌ 없음'}`);
  console.log(`  - GEMINI_API_KEY: ${geminiApiKey ? '✅ 있음' : '❌ 없음'}`);
  console.log(`  - 사용할 키: ${googleApiKey ? '✅ 있음' : '❌ 없음'}`);
  
  if (!googleApiKey) {
    console.error('❌ Google API 키를 찾을 수 없습니다!');
    return;
  }
  
  // 2. 실제 API 테스트
  try {
    console.log('\n🌐 Google Places API 테스트 호출...');
    const testQuery = '감천문화마을';
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
    const fullUrl = `${url}?input=${encodeURIComponent(testQuery)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${googleApiKey}`;
    
    console.log(`📡 요청 URL: ${url}?input=${testQuery}&...`);
    
    const response = await fetch(fullUrl);
    
    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`❌ HTTP 오류: ${response.status}`);
      const errorText = await response.text();
      console.error('오류 내용:', errorText);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📋 API 응답 결과:');
    console.log('  - 상태:', data.status);
    
    if (data.status === 'OK' && data.candidates?.length > 0) {
      const candidate = data.candidates[0];
      console.log('✅ API 호출 성공!');
      console.log(`  - 장소명: ${candidate.name}`);
      console.log(`  - 좌표: ${candidate.geometry.location.lat}, ${candidate.geometry.location.lng}`);
      console.log(`  - 주소: ${candidate.formatted_address}`);
      console.log(`  - Place ID: ${candidate.place_id}`);
      
      // 좌표 정확성 검증
      const lat = candidate.geometry.location.lat;
      const lng = candidate.geometry.location.lng;
      
      if (lat >= 35.0 && lat <= 35.2 && lng >= 129.0 && lng <= 129.1) {
        console.log('✅ 좌표 범위 검증 통과 (감천문화마을 예상 범위 내)');
      } else {
        console.log('⚠️ 좌표가 예상 범위를 벗어남');
      }
      
    } else {
      console.error('❌ API 호출 실패');
      console.error('  - 상태:', data.status);
      console.error('  - 오류 메시지:', data.error_message || '없음');
      console.error('  - 결과 수:', data.candidates?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ API 테스트 실행 오류:', error.message);
  }
}

// 실행
testGooglePlacesAPI();
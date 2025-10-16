// 석굴암 실제 좌표 확인 스크립트
import { config } from 'dotenv';

// .env.local 파일 로드
config({ path: '.env.local' });

async function verifySeokguramCoordinates() {
  try {
    console.log('🔍 Google Places API로 석굴암 정확한 좌표 확인 중...');
    
    // Google Places API Text Search로 석굴암 검색
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=석굴암 경주 Seokguram&key=${process.env.GOOGLE_PLACES_API_KEY}&language=ko`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const seokguram = data.results[0];
      console.log(`✅ Google Places 검색 결과:`);
      console.log(`   이름: ${seokguram.name}`);
      console.log(`   주소: ${seokguram.formatted_address}`);
      console.log(`   좌표: lat=${seokguram.geometry.location.lat}, lng=${seokguram.geometry.location.lng}`);
      console.log(`   Place ID: ${seokguram.place_id}`);
      
      // 네이버 지도와 구글 지도 링크 생성
      const lat = seokguram.geometry.location.lat;
      const lng = seokguram.geometry.location.lng;
      
      console.log(`\n🗺️ 지도 확인 링크:`);
      console.log(`   Google Maps: https://maps.google.com/?q=${lat},${lng}`);
      console.log(`   Naver Map: https://map.naver.com/v5/?c=${lng},${lat},15,0,0,0,dh`);
      
      // Plus Code 확인
      console.log(`\n🔢 Plus Code 확인 중...`);
      try {
        const plusCodeResponse = await fetch(
          `https://plus.codes/api?address=${lat},${lng}&emode=json`
        );
        
        if (plusCodeResponse.ok) {
          const plusCodeData = await plusCodeResponse.json();
          if (plusCodeData.plus_code && plusCodeData.plus_code.global_code) {
            console.log(`   Plus Code: ${plusCodeData.plus_code.global_code}`);
            console.log(`   Local Code: ${plusCodeData.plus_code.local_code || 'N/A'}`);
          }
        }
      } catch (error) {
        console.log(`   Plus Code API 오류: ${error.message}`);
      }
      
      // 배치 로그에서 업데이트된 좌표 추정해보기
      console.log(`\n📊 배치 최적화 분석:`);
      console.log(`   - 석굴암 (ko): 54,656m 개선됨 (Plus Code 사용)`);
      console.log(`   - 실제 좌표: ${lat}, ${lng}`);
      console.log(`   - 이전 좌표 추정 위치: 약 54.7km 떨어진 곳에서 현재 위치로 이동`);
      
    } else {
      console.log('❌ Google Places에서 석굴암을 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

verifySeokguramCoordinates();
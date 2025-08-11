// 석굴암 가이드 조회 스크립트
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 파일 로드
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSeokguramGuide() {
  try {
    console.log('🔍 석굴암 가이드 조회 중...');
    
    // 석굴암 관련 가이드들 검색
    const { data, error } = await supabase
      .from('realTimeGuide')
      .select('*')
      .or('locationName.ilike.%석굴암%,locationName.ilike.%seokguram%')
      .order('updatedAt', { ascending: false });

    if (error) {
      console.error('❌ 오류:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ 석굴암 가이드를 찾을 수 없습니다.');
      return;
    }

    console.log(`✅ 석굴암 가이드 ${data.length}개 발견:`);
    
    for (const guide of data) {
      console.log(`\n📍 ${guide.locationName} (${guide.language})`);
      console.log(`   ID: ${guide.id}`);
      console.log(`   업데이트: ${guide.updatedAt}`);
      
      // content에서 첫 번째 챕터의 좌표 확인
      if (guide.content && guide.content.length > 0) {
        const firstChapter = guide.content[0];
        console.log(`   제목: "${firstChapter.title}"`);
        console.log(`   좌표: lat=${firstChapter.lat}, lng=${firstChapter.lng}`);
        
        // Plus Code가 있다면 출력
        if (firstChapter.plusCode) {
          console.log(`   Plus Code: ${firstChapter.plusCode}`);
        }
        
        console.log(`   설명: ${firstChapter.description.substring(0, 100)}...`);
      }
    }

    // Google Places API로 석굴암 실제 좌표 확인
    console.log('\n🌐 Google Places API로 석굴암 실제 위치 확인...');
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=석굴암 경주&key=${process.env.GOOGLE_PLACES_API_KEY}&language=ko`
    );
    
    const googleData = await response.json();
    
    if (googleData.results && googleData.results.length > 0) {
      const actualLocation = googleData.results[0];
      console.log(`✅ Google Places 실제 위치:`);
      console.log(`   이름: ${actualLocation.name}`);
      console.log(`   주소: ${actualLocation.formatted_address}`);
      console.log(`   좌표: lat=${actualLocation.geometry.location.lat}, lng=${actualLocation.geometry.location.lng}`);
      
      // Plus Code API로 실제 Plus Code 확인
      const plusCodeResponse = await fetch(
        `https://plus.codes/api?address=${actualLocation.geometry.location.lat},${actualLocation.geometry.location.lng}&emode=json`
      );
      
      if (plusCodeResponse.ok) {
        const plusCodeData = await plusCodeResponse.json();
        if (plusCodeData.plus_code && plusCodeData.plus_code.global_code) {
          console.log(`   실제 Plus Code: ${plusCodeData.plus_code.global_code}`);
        }
      }
      
      // DB 좌표와 실제 좌표 비교
      if (data.length > 0 && data[0].content && data[0].content.length > 0) {
        const dbLat = parseFloat(data[0].content[0].lat);
        const dbLng = parseFloat(data[0].content[0].lng);
        const actualLat = actualLocation.geometry.location.lat;
        const actualLng = actualLocation.geometry.location.lng;
        
        // 거리 계산 (Haversine 공식)
        const R = 6371000; // 지구 반지름 (미터)
        const φ1 = dbLat * Math.PI/180;
        const φ2 = actualLat * Math.PI/180;
        const Δφ = (actualLat-dbLat) * Math.PI/180;
        const Δλ = (actualLng-dbLng) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const distance = R * c;
        
        console.log(`\n📏 좌표 정확도:`);
        console.log(`   DB 좌표와 실제 좌표 차이: ${Math.round(distance)}m`);
        
        if (distance < 100) {
          console.log(`   ✅ 매우 정확함 (100m 이내)`);
        } else if (distance < 500) {
          console.log(`   ⚠️ 양호함 (500m 이내)`);
        } else {
          console.log(`   ❌ 부정확함 (${Math.round(distance/1000)}km 차이)`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkSeokguramGuide();
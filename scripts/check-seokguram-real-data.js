// 석굴암 실제 DB 데이터 확인 스크립트
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 파일 로드
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSeokguramRealData() {
  try {
    console.log('🔍 guides 테이블에서 석굴암 데이터 확인 중...');
    
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', '석굴암')
      .eq('language', 'ko');

    if (error) {
      console.error('❌ 쿼리 오류:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ 석굴암 한국어 가이드를 찾을 수 없습니다.');
      
      // 다른 언어나 비슷한 이름 검색
      console.log('\n🔍 다른 석굴암 가이드 검색 중...');
      const { data: allSeokguram, error: searchError } = await supabase
        .from('guides')
        .select('id, locationname, language, updated_at')
        .or('locationname.ilike.%석굴암%,locationname.ilike.%seokguram%');
        
      if (!searchError && allSeokguram && allSeokguram.length > 0) {
        console.log(`✅ 찾은 석굴암 관련 가이드들:`);
        allSeokguram.forEach(guide => {
          console.log(`   - ${guide.locationname} (${guide.language}) - ID: ${guide.id}`);
        });
        
        // 첫 번째 석굴암 가이드의 상세 정보 가져오기
        const firstGuide = allSeokguram[0];
        const { data: detailData, error: detailError } = await supabase
          .from('guides')
          .select('*')
          .eq('id', firstGuide.id);
          
        if (!detailError && detailData && detailData.length > 0) {
          const guide = detailData[0];
          console.log(`\n📖 ${guide.locationname} (${guide.language}) 상세 정보:`);
          console.log(`   업데이트: ${guide.updated_at}`);
          
          // content 구조 확인
          if (guide.content && guide.content.content && guide.content.content.realTimeGuide) {
            const realTimeGuide = guide.content.content.realTimeGuide;
            console.log(`   총 챕터 수: ${realTimeGuide.chapters.length}`);
            
            // 첫 번째 챕터 (인트로) 정보
            if (realTimeGuide.chapters.length > 0) {
              const intro = realTimeGuide.chapters[0];
              console.log(`\n   📍 인트로 챕터:`);
              console.log(`      제목: "${intro.title}"`);
              console.log(`      좌표: lat=${intro.coordinates?.lat}, lng=${intro.coordinates?.lng}`);
              
              // Google Places 실제 좌표와 비교
              if (intro.coordinates && intro.coordinates.lat && intro.coordinates.lng) {
                const dbLat = parseFloat(intro.coordinates.lat);
                const dbLng = parseFloat(intro.coordinates.lng);
                const actualLat = 35.7949255;
                const actualLng = 129.3492739;
                
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
                
                console.log(`\n   📏 좌표 정확성 분석:`);
                console.log(`      🎯 Google Places 실제 좌표: ${actualLat}, ${actualLng}`);
                console.log(`      🏪 DB 저장된 현재 좌표: ${dbLat}, ${dbLng}`);
                console.log(`      📐 실제와의 거리 차이: ${Math.round(distance)}m`);
                
                if (distance < 100) {
                  console.log(`      ✅ 매우 정확함 (100m 이내)`);
                } else if (distance < 1000) {
                  console.log(`      ⚠️ 양호함 (1km 이내)`);
                } else {
                  console.log(`      ❌ 부정확함 (${Math.round(distance/1000)}km 차이)`);
                  
                  // 54.7km 개선이라는 배치 로그와 맞는지 확인
                  const expectedOldDistance = 54656; // 배치에서 개선됐다고 한 거리
                  const calculatedOldLat = actualLat + (expectedOldDistance / 111000);
                  const calculatedOldLng = actualLng;
                  
                  console.log(`\n   🔍 배치 로그 검증:`);
                  console.log(`      배치에서 54,656m 개선되었다고 함`);
                  console.log(`      현재 실제와의 차이: ${Math.round(distance)}m`);
                  console.log(`      → 배치 최적화가 제대로 적용되지 않았거나,`);
                  console.log(`      → Plus Code 좌표가 부정확할 가능성`);
                }
                
                // 현재 저장된 좌표의 지도 링크
                console.log(`\n   🗺️ 현재 DB 좌표 확인 링크:`);
                console.log(`      Google Maps: https://maps.google.com/?q=${dbLat},${dbLng}`);
                console.log(`      Naver Map: https://map.naver.com/v5/?c=${dbLng},${dbLat},15,0,0,0,dh`);
              }
              
              console.log(`      설명: ${intro.description ? intro.description.substring(0, 100) + '...' : 'N/A'}`);
            }
          }
        }
      } else {
        console.log('석굴암 관련 가이드를 전혀 찾을 수 없습니다.');
      }
      return;
    }

    // 석굴암 데이터 상세 분석
    console.log(`✅ 석굴암 가이드 발견: ${data.length}개`);
    const guide = data[0];
    
    console.log(`📖 석굴암 (ko) 상세 정보:`);
    console.log(`   ID: ${guide.id}`);
    console.log(`   업데이트: ${guide.updated_at}`);
    
    // content 구조 확인
    if (guide.content && guide.content.content && guide.content.content.realTimeGuide) {
      const realTimeGuide = guide.content.content.realTimeGuide;
      console.log(`   총 챕터 수: ${realTimeGuide.chapters.length}`);
      
      // 첫 번째 챕터 (인트로) 정보
      if (realTimeGuide.chapters.length > 0) {
        const intro = realTimeGuide.chapters[0];
        console.log(`\n📍 인트로 챕터:`);
        console.log(`   제목: "${intro.title}"`);
        console.log(`   좌표: lat=${intro.coordinates?.lat}, lng=${intro.coordinates?.lng}`);
        console.log(`   설명: ${intro.description ? intro.description.substring(0, 100) + '...' : 'N/A'}`);
        
        // Google Places 실제 좌표와 비교
        if (intro.coordinates && intro.coordinates.lat && intro.coordinates.lng) {
          const dbLat = parseFloat(intro.coordinates.lat);
          const dbLng = parseFloat(intro.coordinates.lng);
          const actualLat = 35.7949255;
          const actualLng = 129.3492739;
          
          // 거리 계산
          const R = 6371000;
          const φ1 = dbLat * Math.PI/180;
          const φ2 = actualLat * Math.PI/180;
          const Δφ = (actualLat-dbLat) * Math.PI/180;
          const Δλ = (actualLng-dbLng) * Math.PI/180;

          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

          const distance = R * c;
          
          console.log(`\n📏 좌표 정확성 분석:`);
          console.log(`   🎯 Google Places 실제 좌표: ${actualLat}, ${actualLng}`);
          console.log(`   🏪 DB 저장된 현재 좌표: ${dbLat}, ${dbLng}`);
          console.log(`   📐 실제와의 거리 차이: ${Math.round(distance)}m`);
          
          if (distance < 100) {
            console.log(`   ✅ 매우 정확함 (100m 이내)`);
          } else if (distance < 1000) {
            console.log(`   ⚠️ 양호함 (1km 이내)`);
          } else {
            console.log(`   ❌ 부정확함 (${Math.round(distance/1000)}km 차이)`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkSeokguramRealData();
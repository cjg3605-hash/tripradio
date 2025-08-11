// DB에 저장된 실제 좌표 확인 스크립트
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 파일 로드
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkActualDBCoordinates() {
  try {
    console.log('🔍 DB에서 석굴암 실제 저장된 좌표 확인 중...');
    
    // 가능한 테이블명들로 시도
    const possibleTables = ['guides', 'guide', 'realtime_guides', 'real_time_guides'];
    
    for (const tableName of possibleTables) {
      try {
        console.log(`\n📋 테이블 ${tableName} 확인 중...`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .or('location_name.ilike.%석굴암%,locationName.ilike.%석굴암%,title.ilike.%석굴암%,name.ilike.%석굴암%')
          .limit(5);

        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
          continue;
        }

        if (data && data.length > 0) {
          console.log(`   ✅ ${tableName}에서 ${data.length}개 발견!`);
          
          for (const item of data) {
            console.log(`\n   📍 항목: ${JSON.stringify(item, null, 2)}`);
            
            // content 필드 확인
            if (item.content && Array.isArray(item.content)) {
              console.log(`   📖 첫 번째 챕터 좌표:`);
              const firstChapter = item.content[0];
              if (firstChapter) {
                console.log(`      제목: ${firstChapter.title || 'N/A'}`);
                console.log(`      위도: ${firstChapter.lat || 'N/A'}`);
                console.log(`      경도: ${firstChapter.lng || 'N/A'}`);
                console.log(`      Plus Code: ${firstChapter.plusCode || 'N/A'}`);
                
                // Google Places 실제 좌표와 비교
                if (firstChapter.lat && firstChapter.lng) {
                  const dbLat = parseFloat(firstChapter.lat);
                  const dbLng = parseFloat(firstChapter.lng);
                  const actualLat = 35.7949255;
                  const actualLng = 129.3492739;
                  
                  // 거리 계산
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
                  
                  console.log(`\n      📏 실제 석굴암과의 거리: ${Math.round(distance)}m`);
                  console.log(`      🎯 Google Places 좌표: ${actualLat}, ${actualLng}`);
                  console.log(`      🏪 DB 저장된 좌표: ${dbLat}, ${dbLng}`);
                  
                  if (distance < 100) {
                    console.log(`      ✅ 매우 정확함 (100m 이내)`);
                  } else if (distance < 1000) {
                    console.log(`      ⚠️ 양호함 (1km 이내)`);
                  } else {
                    console.log(`      ❌ 부정확함 (${Math.round(distance/1000)}km 차이)`);
                  }
                }
              }
            }
          }
          return; // 찾았으면 종료
        } else {
          console.log(`   ℹ️ ${tableName}: 데이터 없음`);
        }
      } catch (tableError) {
        console.log(`   ❌ ${tableName}: ${tableError.message}`);
      }
    }
    
    // 모든 테이블에서 못찾았으면 전체 스키마 확인
    console.log('\n📊 사용 가능한 테이블 목록 확인...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_schema_tables');
        
      if (!tablesError && tables) {
        console.log('📋 사용 가능한 테이블들:', tables);
      }
    } catch (schemaError) {
      console.log('스키마 확인 실패:', schemaError.message);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkActualDBCoordinates();
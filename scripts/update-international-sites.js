// 해외 주요 관광지 Plus Code 업데이트
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 해외 주요 관광지들
const INTERNATIONAL_UPDATES = {
  'Eiffel Tower': '8FW4V75V+8Q',
  'Louvre Museum': '8FW4V86Q+63', 
  'Big Ben': '9C3XGV2G+74',
  'Colosseum': '8FHJVFRR+3V',
  'Sagrada Familia': '8FH4C53F+FP',
  'Times Square': '87G8Q257+5Q',
  'Statue of Liberty': '87G7MXQ4+M5',
  'Taj Mahal': '7JVW52GR+3V',
};

// 다국어 매핑
const LOCATION_PATTERNS = {
  'Eiffel Tower': ['에펠탑', 'torre eiffel', 'エッフェル塔', '埃菲尔铁塔'],
  'Louvre Museum': ['루브르', 'museo del louvre', 'ルーブル美術館', '卢浮宫'],
  'Big Ben': ['빅벤', 'gran ben', 'ビッグベン', '大本钟'],
  'Colosseum': ['콜로세움', 'coliseo', 'コロッセオ', '斗兽场'],
  'Sagrada Familia': ['사그라다', 'sagrada familia', 'サグラダ', '圣家堂'],
  'Times Square': ['타임스', 'times square', 'タイムズ', '时代广场'],
  'Statue of Liberty': ['자유의 여신', 'estatua de la libertad', '自由の女神', '自由女神'],
  'Taj Mahal': ['타지마할', 'taj mahal', 'タージマハル', '泰姬陵']
};

async function updateInternationalSites() {
  console.log('🌍 해외 주요 관광지 Plus Code 업데이트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalNoChange = 0;
  let totalProcessed = 0;
  
  for (const [locationName, plusCode] of Object.entries(INTERNATIONAL_UPDATES)) {
    try {
      console.log(`🔄 ${locationName} (${plusCode}) 처리 중...`);
      
      // 1. Plus Code → 좌표 변환
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
      );
      
      const geoData = await geoResponse.json();
      if (geoData.status !== 'OK' || !geoData.results.length) {
        console.log(`   ❌ Plus Code 변환 실패`);
        totalFailed++;
        continue;
      }
      
      const newLat = geoData.results[0].geometry.location.lat;
      const newLng = geoData.results[0].geometry.location.lng;
      
      console.log(`   📍 새 좌표: ${newLat}, ${newLng}`);
      
      // 2. 모든 패턴으로 가이드 검색
      const patterns = [locationName, ...(LOCATION_PATTERNS[locationName] || [])];
      let allGuides = [];
      
      for (const pattern of patterns) {
        const { data: guides, error } = await supabase
          .from('guides')
          .select('*')
          .ilike('locationname', `%${pattern}%`);
        
        if (!error && guides && guides.length > 0) {
          // 중복 제거하여 추가
          const existingIds = new Set(allGuides.map(g => g.id));
          const newGuides = guides.filter(g => !existingIds.has(g.id));
          allGuides = [...allGuides, ...newGuides];
        }
      }
      
      if (allGuides.length === 0) {
        console.log(`   ⚠️ 매칭되는 가이드를 찾을 수 없음`);
        totalFailed++;
        continue;
      }
      
      console.log(`   📚 매칭된 가이드: ${allGuides.length}개`);
      
      // 3. 각 가이드 업데이트
      let locationSuccess = 0;
      let locationNoChange = 0;
      let locationFailed = 0;
      
      for (const guide of allGuides) {
        const currentIntro = guide.content?.content?.realTimeGuide?.chapters?.[0];
        if (!currentIntro?.coordinates) {
          console.log(`      ⚠️ ${guide.locationname} (${guide.language}): 좌표 없음`);
          locationFailed++;
          continue;
        }
        
        const oldLat = parseFloat(currentIntro.coordinates.lat);
        const oldLng = parseFloat(currentIntro.coordinates.lng);
        
        // 거리 계산
        const distance = Math.sqrt(
          Math.pow((newLat - oldLat) * 111000, 2) + 
          Math.pow((newLng - oldLng) * 111000 * Math.cos(newLat * Math.PI / 180), 2)
        );
        
        if (distance < 10) {
          console.log(`      ✅ ${guide.locationname} (${guide.language}): 이미 정확함 (${distance.toFixed(0)}m)`);
          locationNoChange++;
          continue;
        }
        
        // 좌표 업데이트
        const updatedIntro = {
          ...currentIntro,
          coordinates: {
            lat: newLat,
            lng: newLng
          }
        };
        
        const updatedContent = { ...guide.content };
        updatedContent.content.realTimeGuide.chapters[0] = updatedIntro;
        
        const { error: updateError } = await supabase
          .from('guides')
          .update({ 
            content: updatedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', guide.id);

        if (updateError) {
          console.log(`      ❌ ${guide.locationname} (${guide.language}): 업데이트 실패`);
          locationFailed++;
        } else {
          console.log(`      ✅ ${guide.locationname} (${guide.language}): 업데이트 완료 (${distance.toFixed(0)}m 개선)`);
          locationSuccess++;
        }
        
        totalProcessed++;
      }
      
      console.log(`   📊 ${locationName} 결과: 성공 ${locationSuccess}, 변경없음 ${locationNoChange}, 실패 ${locationFailed}`);
      
      totalSuccess += locationSuccess;
      totalNoChange += locationNoChange;
      totalFailed += locationFailed;
      
    } catch (error) {
      console.log(`   ❌ ${locationName} 처리 오류: ${error.message}`);
      totalFailed++;
    }
    
    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 최종 결과
  console.log('\n🎉 해외 관광지 업데이트 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 결과:`);
  console.log(`   처리된 가이드: ${totalProcessed}개`);
  console.log(`   성공: ${totalSuccess}개`);
  console.log(`   변경없음: ${totalNoChange}개`);
  console.log(`   실패: ${totalFailed}개`);
  console.log(`   성공률: ${totalProcessed > 0 ? ((totalSuccess + totalNoChange) / totalProcessed * 100).toFixed(1) : 0}%`);
  
  if (totalSuccess > 0) {
    console.log(`\n✅ ${totalSuccess}개 해외 관광지 가이드의 좌표가 정확하게 업데이트되었습니다!`);
  }
}

updateInternationalSites();
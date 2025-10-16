// 빠른 Plus Code 업데이트 (주요 한국 관광지만)
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 주요 한국 관광지만 (우선순위 높음)
const PRIORITY_UPDATES = {
  '불국사': '8Q7FQ8QJ+XQ',
  '해운대해수욕장': '8Q7F5556+F5', 
  '감천문화마을': '8Q7F32W6+X6',
  '경복궁': '8Q98HXHG+RR',
  '명동': '8Q98HX5P+X8',
  '남산타워': '8Q98HX2Q+F7',
  '성산일출봉': '8Q58FW5R+6X',
  '한라산': '8Q589G6H+MM',
  '중문관광단지': '8Q586CX6+FX',
  '첨성대': '8Q7FR6M9+VJ',
};

async function quickUpdatePlusCodes() {
  console.log('⚡ 빠른 Plus Code 업데이트 시작 (주요 한국 관광지)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalNoChange = 0;
  
  for (const [locationName, plusCode] of Object.entries(PRIORITY_UPDATES)) {
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
      
      // 2. DB에서 해당 가이드 찾기
      const { data: guides, error } = await supabase
        .from('guides')
        .select('*')
        .eq('locationname', locationName)
        .eq('language', 'ko'); // 한국어 가이드만
      
      if (error) {
        console.log(`   ❌ DB 조회 오류: ${error.message}`);
        totalFailed++;
        continue;
      }
      
      if (!guides || guides.length === 0) {
        console.log(`   ⚠️ 가이드를 찾을 수 없음`);
        totalFailed++;
        continue;
      }
      
      const guide = guides[0];
      console.log(`   📚 가이드 발견: ${guide.id}`);
      
      // 3. 현재 좌표 확인
      const currentIntro = guide.content?.content?.realTimeGuide?.chapters?.[0];
      if (!currentIntro?.coordinates) {
        console.log(`   ❌ 인트로 챕터 좌표가 없음`);
        totalFailed++;
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
        console.log(`   ✅ 이미 정확함 (${distance.toFixed(0)}m 차이)`);
        totalNoChange++;
        continue;
      }
      
      console.log(`   📏 개선될 거리: ${distance.toFixed(0)}m`);
      
      // 4. 좌표 업데이트
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
        console.log(`   ❌ 업데이트 실패: ${updateError.message}`);
        totalFailed++;
      } else {
        console.log(`   ✅ 업데이트 완료: ${distance.toFixed(0)}m 개선`);
        totalSuccess++;
      }
      
    } catch (error) {
      console.log(`   ❌ 처리 오류: ${error.message}`);
      totalFailed++;
    }
    
    // API 부하 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 최종 결과
  console.log('\n🎉 빠른 업데이트 완료!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 결과:`);
  console.log(`   성공: ${totalSuccess}개`);
  console.log(`   변경없음: ${totalNoChange}개`);
  console.log(`   실패: ${totalFailed}개`);
  console.log(`   처리율: ${((totalSuccess + totalNoChange) / Object.keys(PRIORITY_UPDATES).length * 100).toFixed(1)}%`);
  
  if (totalSuccess > 0) {
    console.log(`\n✅ ${totalSuccess}개 주요 관광지의 좌표가 정확하게 업데이트되었습니다!`);
  }
}

quickUpdatePlusCodes();
// 석굴암 좌표 수동 수정 스크립트
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSeokguramCoordinates() {
  try {
    console.log('🔧 석굴암 좌표 수정 시작...');
    
    // 1. 현재 석굴암 데이터 가져오기
    const { data: guides, error: selectError } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', '석굴암')
      .eq('language', 'ko');

    if (selectError) {
      throw new Error(`조회 실패: ${selectError.message}`);
    }

    if (!guides || guides.length === 0) {
      throw new Error('석굴암 가이드를 찾을 수 없습니다.');
    }

    const guide = guides[0];
    console.log(`✅ 석굴암 가이드 발견: ${guide.id}`);
    
    // 2. 현재 좌표 확인
    const currentIntro = guide.content.content.realTimeGuide.chapters[0];
    console.log(`📍 현재 좌표: lat=${currentIntro.coordinates.lat}, lng=${currentIntro.coordinates.lng}`);
    
    // 3. 정확한 좌표로 업데이트
    const correctLat = 35.7949255;
    const correctLng = 129.3492739;
    const correctTitle = "석굴암 매표소";
    
    console.log(`🎯 정확한 좌표: lat=${correctLat}, lng=${correctLng}`);
    
    // 거리 계산
    const oldLat = parseFloat(currentIntro.coordinates.lat);
    const oldLng = parseFloat(currentIntro.coordinates.lng);
    
    const R = 6371000; // 지구 반지름
    const φ1 = oldLat * Math.PI/180;
    const φ2 = correctLat * Math.PI/180;
    const Δφ = (correctLat - oldLat) * Math.PI/180;
    const Δλ = (correctLng - oldLng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    console.log(`📏 개선될 거리: ${Math.round(distance)}m`);
    
    // 4. 새로운 인트로 챕터 생성
    const updatedIntro = {
      ...currentIntro,
      title: correctTitle,
      coordinates: {
        lat: correctLat,
        lng: correctLng
      }
    };
    
    // 5. content 전체 업데이트
    const updatedContent = { ...guide.content };
    updatedContent.content.realTimeGuide.chapters[0] = updatedIntro;
    
    console.log('💾 DB 업데이트 중...');
    
    // 6. DB 업데이트 실행
    const { error: updateError } = await supabase
      .from('guides')
      .update({ 
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', guide.id);

    if (updateError) {
      throw new Error(`업데이트 실패: ${updateError.message}`);
    }
    
    console.log('✅ 석굴암 좌표 수정 완료!');
    console.log(`📊 개선 결과:`);
    console.log(`   이전 좌표: ${oldLat}, ${oldLng}`);
    console.log(`   새 좌표: ${correctLat}, ${correctLng}`);
    console.log(`   정확도 개선: ${Math.round(distance)}m → 0m`);
    console.log(`   제목: "${correctTitle}"`);
    
    // 7. 검증
    console.log('\n🔍 업데이트 검증 중...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('guides')
      .select('content, updated_at')
      .eq('id', guide.id);
      
    if (verifyError) {
      console.log('⚠️ 검증 실패:', verifyError.message);
    } else if (verifyData && verifyData.length > 0) {
      const verifyIntro = verifyData[0].content.content.realTimeGuide.chapters[0];
      const verifyLat = verifyIntro.coordinates.lat;
      const verifyLng = verifyIntro.coordinates.lng;
      
      console.log(`✅ 검증 완료:`);
      console.log(`   저장된 좌표: ${verifyLat}, ${verifyLng}`);
      console.log(`   업데이트 시간: ${verifyData[0].updated_at}`);
      console.log(`   제목: "${verifyIntro.title}"`);
      
      if (Math.abs(verifyLat - correctLat) < 0.0001 && Math.abs(verifyLng - correctLng) < 0.0001) {
        console.log(`   ✅ 좌표 정확히 업데이트됨`);
      } else {
        console.log(`   ❌ 좌표 업데이트 실패`);
      }
    }
    
    console.log('\n🗺️ 확인 링크:');
    console.log(`   Google Maps: https://maps.google.com/?q=${correctLat},${correctLng}`);
    console.log(`   Naver Map: https://map.naver.com/v5/?c=${correctLng},${correctLat},15,0,0,0,dh`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

fixSeokguramCoordinates();
#!/usr/bin/env node

/**
 * 자갈치시장 가이드 인트로 챕터 업데이트 테스트
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { updateIntroChapterSelectively } = require('./update-intro-chapters.js');

// Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testJagalchiGuide() {
  console.log('🐟 자갈치시장 가이드 테스트 시작\n');

  try {
    // 자갈치시장 가이드 조회
    console.log('📋 자갈치시장 가이드 검색 중...');
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, content')
      .ilike('locationname', '%자갈치%')
      .eq('language', 'ko');

    if (error) throw error;
    
    if (!guides || guides.length === 0) {
      console.log('❌ 자갈치시장 가이드를 찾을 수 없습니다');
      
      // 부산 관련 가이드들 검색
      console.log('\n🔍 부산 관련 가이드들 검색...');
      const { data: busanGuides } = await supabase
        .from('guides')
        .select('id, locationname')
        .eq('language', 'ko')
        .ilike('locationname', '%부산%')
        .limit(10);
      
      if (busanGuides && busanGuides.length > 0) {
        console.log('부산 관련 가이드들:');
        busanGuides.forEach((guide, index) => {
          console.log(`${index + 1}. ${guide.locationname} (ID: ${guide.id})`);
        });
      }
      return;
    }

    const guide = guides[0];
    console.log(`✅ 자갈치시장 가이드 발견: ${guide.locationname}`);
    console.log(`🆔 ID: ${guide.id}\n`);

    // 기존 인트로 챕터 출력 (정확한 경로)
    const originalIntro = guide.content?.content?.realTimeGuide?.chapters?.[0];
    if (originalIntro) {
      console.log('📖 현재 인트로 챕터:');
      console.log(`   제목: "${originalIntro.title}"`);
      console.log(`   좌표: lat=${originalIntro.coordinates?.lat}, lng=${originalIntro.coordinates?.lng}`);
      console.log(`   설명: "${originalIntro.coordinates?.description}"`);
    } else {
      console.log('❌ 기존 인트로 챕터를 찾을 수 없습니다');
    }

    console.log('\n🔄 Enhanced Location Service로 업데이트 중...');

    // 업데이트 실행
    const updated = await updateIntroChapterSelectively(guide);

    if (updated) {
      const newIntro = updated.content?.content?.realTimeGuide?.chapters?.[0];
      
      if (newIntro) {
        console.log('\n✨ 새로운 인트로 챕터:');
        console.log(`   제목: "${newIntro.title}"`);
        console.log(`   좌표: lat=${newIntro.coordinates?.lat}, lng=${newIntro.coordinates?.lng}`);
        console.log(`   설명: "${newIntro.coordinates?.description}"`);
        
        // 좌표 변화 비교
        if (originalIntro && originalIntro.coordinates) {
          const oldLat = originalIntro.coordinates.lat;
          const oldLng = originalIntro.coordinates.lng;
          const newLat = newIntro.coordinates.lat;
          const newLng = newIntro.coordinates.lng;
          
          if (oldLat !== newLat || oldLng !== newLng) {
            console.log('\n📍 좌표 변화:');
            console.log(`   이전: ${oldLat}, ${oldLng}`);
            console.log(`   새로: ${newLat}, ${newLng}`);
            
            // 거리 계산
            const distance = calculateDistance(oldLat, oldLng, newLat, newLng);
            console.log(`   거리 차이: ${Math.round(distance)}m`);
          } else {
            console.log('\n📍 좌표는 동일합니다');
          }
        }
        
        console.log('\n🎉 테스트 완료 - 성공!');
        console.log('💡 실제 DB 업데이트를 원하면 batch-execute.js를 실행하세요.');
        
      } else {
        console.log('\n❌ 테스트 실패 - 새로운 인트로 챕터 생성 실패');
      }
    } else {
      console.log('\n❌ 테스트 실패 - 업데이트 함수 실패');
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 실행
if (require.main === module) {
  testJagalchiGuide();
}

module.exports = testJagalchiGuide;
#!/usr/bin/env node

/**
 * 단일 가이드 테스트 스크립트
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

async function testSingleGuide() {
  console.log('🧪 단일 가이드 테스트 시작\n');

  try {
    // 테스트용 가이드 하나 조회
    console.log('📋 테스트 가이드 조회 중...');
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, content')
      .limit(1);

    if (error) throw error;
    if (!guides || guides.length === 0) throw new Error('가이드가 없습니다');

    const guide = guides[0];
    console.log(`✅ 테스트 가이드: ${guide.locationname} (${guide.language})\n`);

    // 기존 인트로 챕터 출력
    const originalIntro = guide.content?.content?.realTimeGuide?.chapters?.[0];
    if (originalIntro) {
      console.log('📖 기존 인트로 챕터:');
      console.log(`   제목: "${originalIntro.title}"`);
      console.log(`   좌표: lat=${originalIntro.coordinates?.lat}, lng=${originalIntro.coordinates?.lng}`);
      console.log(`   설명: "${originalIntro.coordinates?.description}"`);
    }

    console.log('\n🔄 인트로 챕터 업데이트 중...');

    // 업데이트 실행
    const updated = await updateIntroChapterSelectively(guide);

    if (updated) {
      console.log('🔍 디버그: updated 구조:', Object.keys(updated));
      console.log('🔍 디버그: updated.content 구조:', Object.keys(updated.content || {}));
      
      const newIntro = updated.content?.realTimeGuide?.chapters?.[0];
      console.log('🔍 디버그: newIntro 존재여부:', newIntro ? '있음' : '없음');
      
      if (newIntro) {
        console.log('\n✨ 새로운 인트로 챕터:');
        console.log(`   제목: "${newIntro.title}"`);
        console.log(`   좌표: lat=${newIntro.coordinates?.lat}, lng=${newIntro.coordinates?.lng}`);
        console.log(`   설명: "${newIntro.coordinates?.description}"`);
        
        console.log('\n🎉 테스트 완료 - 성공!');
        console.log('\n💡 실제 DB 업데이트를 원하면 batch-execute.js를 실행하세요.');
      } else {
        console.log('\n❌ 테스트 실패 - 인트로 챕터 구조 오류');
      }
    } else {
      console.log('\n❌ 테스트 실패 - 업데이트 함수 실패');
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

// 실행
if (require.main === module) {
  testSingleGuide();
}

module.exports = testSingleGuide;
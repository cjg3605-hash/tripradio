/**
 * 자갈치시장 가이드 상세 확인
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkJagalchiGuide() {
  try {
    console.log('🔍 자갈치시장 가이드 상세 조회 중...');
    
    const { data: guide, error } = await supabase
      .from('guides')
      .select('*')
      .eq('locationname', '자갈치시장')
      .eq('language', 'ko')
      .single();

    if (error || !guide) {
      throw new Error(`가이드를 찾을 수 없습니다: ${error?.message}`);
    }

    console.log('✅ 자갈치시장 가이드 발견:');
    console.log(`   ID: ${guide.id}`);
    console.log(`   Location Name: ${guide.locationname}`);
    console.log(`   Language: ${guide.language}`);
    console.log(`   Updated At: ${guide.updated_at}`);

    // 인트로 챕터 확인
    if (guide.content?.content?.realTimeGuide?.chapters?.[0]) {
      const intro = guide.content.content.realTimeGuide.chapters[0];
      console.log('\n📖 현재 인트로 챕터:');
      console.log(`   제목: "${intro.title}"`);
      console.log(`   좌표: lat=${intro.coordinates?.lat}, lng=${intro.coordinates?.lng}`);
      console.log(`   설명: ${intro.narrative?.substring(0, 100)}...`);
    } else {
      console.log('❌ 인트로 챕터를 찾을 수 없습니다');
    }

    // 전체 구조 확인
    console.log('\n📊 content 구조:');
    if (guide.content?.content?.realTimeGuide) {
      console.log(`   총 챕터 수: ${guide.content.content.realTimeGuide.chapters?.length || 0}`);
      console.log('   챕터 제목들:');
      guide.content.content.realTimeGuide.chapters?.forEach((chapter, index) => {
        console.log(`     ${index}: ${chapter.title}`);
      });
    }

    // 메타데이터 확인
    if (guide.metadata) {
      console.log('\n📋 메타데이터:', guide.metadata);
    }

  } catch (error) {
    console.error('❌ 확인 실패:', error.message);
  }
}

checkJagalchiGuide();
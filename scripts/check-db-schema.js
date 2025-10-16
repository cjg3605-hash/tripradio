/**
 * DB 스키마 확인 스크립트
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    console.log('🔍 guides 테이블 스키마 확인 중...');
    
    // 모든 가이드 조회해서 스키마 확인
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .limit(1);

    if (error) {
      throw new Error(`DB 조회 실패: ${error.message}`);
    }

    if (guides && guides.length > 0) {
      console.log('✅ 첫 번째 가이드 데이터:');
      console.log(JSON.stringify(guides[0], null, 2));
      
      console.log('\n📊 컬럼명들:');
      Object.keys(guides[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof guides[0][key]}`);
      });
    } else {
      console.log('❌ 가이드 데이터가 없습니다');
    }

    // 자갈치시장 관련 데이터 찾기
    console.log('\n🔍 자갈치시장 관련 데이터 검색 중...');
    
    // location_key로 시도
    try {
      const { data: byLocationKey, error: locationKeyError } = await supabase
        .from('guides')
        .select('*')
        .eq('location_key', '자갈치시장')
        .limit(1);
      
      if (!locationKeyError && byLocationKey && byLocationKey.length > 0) {
        console.log('✅ location_key로 자갈치시장 발견:');
        console.log(`   ID: ${byLocationKey[0].id}`);
        console.log(`   Location Key: ${byLocationKey[0].location_key}`);
        console.log(`   Language: ${byLocationKey[0].language}`);
        if (byLocationKey[0].content?.realTimeGuide?.chapters?.[0]) {
          console.log(`   인트로 제목: ${byLocationKey[0].content.realTimeGuide.chapters[0].title}`);
        }
        return;
      }
    } catch (e) {
      console.log('location_key 컬럼 없음');
    }

    // name으로 시도
    try {
      const { data: byName, error: nameError } = await supabase
        .from('guides')
        .select('*')
        .eq('name', '자갈치시장')
        .limit(1);
      
      if (!nameError && byName && byName.length > 0) {
        console.log('✅ name으로 자갈치시장 발견:');
        console.log(`   ID: ${byName[0].id}`);
        console.log(`   Name: ${byName[0].name}`);
        console.log(`   Language: ${byName[0].language}`);
        if (byName[0].content?.realTimeGuide?.chapters?.[0]) {
          console.log(`   인트로 제목: ${byName[0].content.realTimeGuide.chapters[0].title}`);
        }
        return;
      }
    } catch (e) {
      console.log('name 컬럼 없음');
    }

    // 전체 검색으로 자갈치 포함된 것 찾기
    const { data: allGuides, error: allError } = await supabase
      .from('guides')
      .select('*');

    if (!allError && allGuides) {
      console.log(`\n📋 전체 가이드 수: ${allGuides.length}`);
      
      const jagalchiGuides = allGuides.filter(guide => {
        return JSON.stringify(guide).includes('자갈치');
      });
      
      if (jagalchiGuides.length > 0) {
        console.log(`\n✅ 자갈치 관련 가이드 ${jagalchiGuides.length}개 발견:`);
        jagalchiGuides.forEach(guide => {
          console.log(`   ID: ${guide.id}, 컬럼들:`, Object.keys(guide));
          if (guide.content?.realTimeGuide?.chapters?.[0]) {
            console.log(`   인트로 제목: ${guide.content.realTimeGuide.chapters[0].title}`);
          }
        });
      } else {
        console.log('❌ 자갈치 관련 가이드를 찾을 수 없습니다');
        console.log('\n📋 존재하는 가이드 샘플:');
        allGuides.slice(0, 3).forEach(guide => {
          console.log(`   ID: ${guide.id}`);
          Object.keys(guide).forEach(key => {
            if (typeof guide[key] === 'string' && guide[key].length < 50) {
              console.log(`     ${key}: ${guide[key]}`);
            }
          });
        });
      }
    }

  } catch (error) {
    console.error('❌ 스키마 확인 실패:', error.message);
  }
}

checkSchema();
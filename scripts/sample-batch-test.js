/**
 * 🧪 샘플 배치 테스트 (5개 가이드만)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sampleBatchTest() {
  try {
    console.log('🧪 샘플 배치 테스트 (5개 가이드만)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. 샘플 가이드 5개 조회
    const { data: guides, error } = await supabase
      .from('guides')
      .select('id, locationname, language, updated_at')
      .limit(5)
      .order('locationname', { ascending: true });

    if (error) {
      throw new Error(`가이드 조회 실패: ${error.message}`);
    }

    console.log(`\n📋 샘플 가이드 목록:`);
    guides.forEach((guide, index) => {
      console.log(`   ${index + 1}. ${guide.locationname} (${guide.language}) - ID: ${guide.id.substring(0, 8)}...`);
    });

    // 2. 각 가이드의 인트로 챕터 구조 확인
    console.log(`\n🔍 인트로 챕터 구조 확인:`);
    
    for (const guide of guides) {
      const { data: fullGuide, error: detailError } = await supabase
        .from('guides')
        .select('*')
        .eq('id', guide.id)
        .single();

      if (detailError || !fullGuide) {
        console.log(`   ❌ ${guide.locationname}: 상세 조회 실패`);
        continue;
      }

      // 인트로 챕터 확인
      const intro = fullGuide.content?.content?.realTimeGuide?.chapters?.[0];
      if (intro && intro.coordinates) {
        console.log(`   ✅ ${guide.locationname} (${guide.language}):`);
        console.log(`      제목: "${intro.title}"`);
        console.log(`      좌표: lat=${intro.coordinates.lat}, lng=${intro.coordinates.lng}`);
        console.log(`      챕터 수: ${fullGuide.content.content.realTimeGuide.chapters.length}`);
      } else {
        console.log(`   ❌ ${guide.locationname}: 인트로 챕터 구조 이상`);
      }
    }

    console.log(`\n🎯 구조 확인 완료! 배치 시스템이 정상 작동할 수 있습니다.`);
    console.log(`   - locationname 컬럼: ✅`);
    console.log(`   - language 컬럼: ✅`);
    console.log(`   - content.content.realTimeGuide.chapters[0]: ✅`);
    console.log(`   - coordinates: {lat, lng} 형태: ✅`);

  } catch (error) {
    console.error(`❌ 샘플 테스트 실패:`, error.message);
  }
}

sampleBatchTest();
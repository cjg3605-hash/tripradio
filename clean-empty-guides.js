const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanEmptyGuides() {
  console.log('🧹 빈 가이드 데이터 정리 시작...\n');

  // 1. locationname이 비어있거나 content가 비어있는 가이드 찾기
  const { data: allGuides, error: fetchError } = await supabase
    .from('guides')
    .select('id, locationname, content, language, created_at');

  if (fetchError) {
    console.error('❌ 가이드 조회 오류:', fetchError.message);
    return;
  }

  console.log(`📊 총 가이드 수: ${allGuides?.length || 0}개\n`);

  // 빈 가이드 필터링
  const emptyGuides = allGuides.filter(guide => {
    const hasNoLocationName = !guide.locationname || guide.locationname.trim() === '';
    const hasNoContent = !guide.content || Object.keys(guide.content).length === 0;
    return hasNoLocationName || hasNoContent;
  });

  console.log(`🗑️  삭제 대상 가이드: ${emptyGuides.length}개\n`);

  if (emptyGuides.length === 0) {
    console.log('✅ 정리할 빈 가이드가 없습니다.\n');
    return;
  }

  // 샘플 출력
  console.log('📝 삭제 대상 샘플 (처음 10개):\n');
  emptyGuides.slice(0, 10).forEach((guide, idx) => {
    const reason = !guide.locationname ? '위치명 없음' : '콘텐츠 없음';
    console.log(`   ${idx + 1}. ID: ${guide.id.substring(0, 8)}... - ${reason} (${guide.language})`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  주의: 이 작업은 되돌릴 수 없습니다!');
  console.log(`총 ${emptyGuides.length}개의 가이드를 삭제합니다.`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 삭제 실행
  let deleted = 0;
  let failed = 0;

  for (const guide of emptyGuides) {
    const { error: deleteError } = await supabase
      .from('guides')
      .delete()
      .eq('id', guide.id);

    if (deleteError) {
      console.error(`❌ 삭제 실패 (${guide.id}):`, deleteError.message);
      failed++;
    } else {
      deleted++;
      if (deleted % 10 === 0) {
        console.log(`   진행 중: ${deleted}/${emptyGuides.length} 완료...`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 빈 가이드 정리 완료\n');
  console.log(`✅ 성공: ${deleted}개`);
  console.log(`❌ 실패: ${failed}개`);
  console.log(`📊 남은 가이드: ${allGuides.length - deleted}개`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 최종 확인
  const { data: remainingGuides } = await supabase
    .from('guides')
    .select('id', { count: 'exact' });

  console.log(`✅ 최종 가이드 수: ${remainingGuides?.length || 0}개\n`);
}

cleanEmptyGuides().catch(console.error);

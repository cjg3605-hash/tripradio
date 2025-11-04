const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteTajMahalEpisodes() {
  console.log('🗑️  타지마할 에피소드 삭제 시작...\n');

  // 1. 타지마할 에피소드 찾기
  const { data: episodes, error: fetchError } = await supabase
    .from('podcast_episodes')
    .select('id, title, location_slug, created_at')
    .or('location_slug.eq.taj-mahal,location_input.ilike.%타지마할%,location_input.ilike.%taj%');

  if (fetchError) {
    console.error('❌ 에피소드 조회 실패:', fetchError);
    return;
  }

  if (!episodes || episodes.length === 0) {
    console.log('✅ 삭제할 타지마할 에피소드가 없습니다.');
    return;
  }

  console.log(`📋 발견된 에피소드: ${episodes.length}개\n`);
  episodes.forEach(ep => {
    console.log(`  - ${ep.id}`);
    console.log(`    제목: ${ep.title}`);
    console.log(`    슬러그: ${ep.location_slug}`);
    console.log(`    생성일: ${ep.created_at}\n`);
  });

  // 2. 세그먼트 먼저 삭제
  for (const episode of episodes) {
    console.log(`🔄 세그먼트 삭제 중: ${episode.id}...`);
    const { error: segError } = await supabase
      .from('podcast_segments')
      .delete()
      .eq('episode_id', episode.id);

    if (segError) {
      console.error(`❌ 세그먼트 삭제 실패 (${episode.id}):`, segError);
    } else {
      console.log(`✅ 세그먼트 삭제 완료`);
    }
  }

  // 3. 에피소드 삭제
  const episodeIds = episodes.map(ep => ep.id);
  console.log(`\n🔄 에피소드 삭제 중...`);
  const { error: deleteError } = await supabase
    .from('podcast_episodes')
    .delete()
    .in('id', episodeIds);

  if (deleteError) {
    console.error('❌ 에피소드 삭제 실패:', deleteError);
  } else {
    console.log(`✅ ${episodes.length}개 에피소드 삭제 완료!\n`);
  }

  console.log('🎉 타지마할 에피소드 정리 완료!');
}

deleteTajMahalEpisodes();

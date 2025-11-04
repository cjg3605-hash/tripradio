const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteGyeongbokgung() {
  console.log('🗑️ 경복궁 팟캐스트 삭제 중...\n');

  // 1. 에피소드 조회
  const { data: episodes, error: episodeError } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', 'gyeongbokgung')
    .eq('language', 'ko');

  if (episodeError || !episodes || episodes.length === 0) {
    console.log('❌ 기존 에피소드 없음:', episodeError?.message || '에피소드 없음');
    return;
  }

  console.log(`✅ 삭제할 에피소드 발견: ${episodes.length}개`);

  for (const episode of episodes) {
    console.log(`\n🗑️ 에피소드 삭제 중: ${episode.id}`);

    // 2. 세그먼트 삭제
    const { error: segmentError } = await supabase
      .from('podcast_segments')
      .delete()
      .eq('episode_id', episode.id);

    if (segmentError) {
      console.error('❌ 세그먼트 삭제 실패:', segmentError);
      continue;
    }

    console.log('  ✅ 세그먼트 삭제 완료');

    // 3. 에피소드 삭제
    const { error: deleteError } = await supabase
      .from('podcast_episodes')
      .delete()
      .eq('id', episode.id);

    if (deleteError) {
      console.error('❌ 에피소드 삭제 실패:', deleteError);
      continue;
    }

    console.log('  ✅ 에피소드 삭제 완료');
  }

  console.log('\n🎉 경복궁 팟캐스트가 완전히 삭제되었습니다!');
}

deleteGyeongbokgung().catch(console.error);

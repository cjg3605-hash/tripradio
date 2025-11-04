const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('\n🗑️  루브르 박물관 팟캐스트 삭제\n');

  // 1. 에피소드 ID 찾기
  const { data: episodes } = await supabase
    .from('podcast_episodes')
    .select('id')
    .eq('location_slug', 'louvre-museum')
    .order('created_at', { ascending: false });

  if (!episodes || episodes.length === 0) {
    console.log('⚠️  louvre-museum 에피소드를 찾을 수 없습니다');
    return;
  }

  const episodeIds = episodes.map(ep => ep.id);
  console.log(`✅ 발견된 에피소드: ${episodeIds.length}개`);
  console.log(`   IDs: ${episodeIds.join(', ')}\n`);

  // 2. 세그먼트 삭제
  const { error: segmentError } = await supabase
    .from('podcast_segments')
    .delete()
    .in('episode_id', episodeIds);

  if (segmentError) {
    console.error('❌ 세그먼트 삭제 실패:', segmentError);
  } else {
    console.log('✅ 세그먼트 삭제 완료');
  }

  // 3. 에피소드 삭제
  const { error: episodeError } = await supabase
    .from('podcast_episodes')
    .delete()
    .in('id', episodeIds);

  if (episodeError) {
    console.error('❌ 에피소드 삭제 실패:', episodeError);
  } else {
    console.log('✅ 에피소드 삭제 완료');
  }

  console.log('\n🎉 루브르 박물관 팟캐스트 삭제 완료!');
  console.log('\n💡 이제 브라우저에서 http://localhost:3000/podcast/ko/louvre-museum');
  console.log('   에 접속하여 "팟캐스트 생성하기" 버튼을 클릭하세요.\n');
})();

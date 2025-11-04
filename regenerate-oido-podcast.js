const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('🗑️ 오이도 팟캐스트 삭제 시작...');

    // 1. 기존 오이도 에피소드 조회
    const { data: episodes, error: queryError } = await supabase
      .from('podcast_episodes')
      .select('id')
      .ilike('location_input', '%오이도%')
      .limit(10);

    if (queryError) throw queryError;

    if (!episodes || episodes.length === 0) {
      console.log('⚠️ 오이도 에피소드를 찾을 수 없습니다');
      process.exit(0);
    }

    console.log(`📊 발견된 에피소드: ${episodes.length}개`);

    // 2. 각 에피소드에 대한 세그먼트 삭제
    for (const episode of episodes) {
      console.log(`🗑️ 에피소드 ${episode.id}의 세그먼트 삭제 중...`);
      
      const { error: segmentError } = await supabase
        .from('podcast_segments')
        .delete()
        .eq('episode_id', episode.id);

      if (segmentError) {
        console.error(`❌ 세그먼트 삭제 실패: ${segmentError.message}`);
        continue;
      }

      console.log(`✅ 세그먼트 삭제 완료`);

      // 에피소드 삭제
      const { error: episodeError } = await supabase
        .from('podcast_episodes')
        .delete()
        .eq('id', episode.id);

      if (episodeError) {
        console.error(`❌ 에피소드 삭제 실패: ${episodeError.message}`);
        continue;
      }

      console.log(`✅ 에피소드 ${episode.id} 삭제 완료`);
    }

    console.log('\n✅ 오이도 팟캐스트 전체 삭제 완료');
    console.log('📝 이제 새로운 프롬프트로 재생성할 수 있습니다');

  } catch (err) {
    console.error('❌ 오류:', err.message);
    process.exit(1);
  }
})();

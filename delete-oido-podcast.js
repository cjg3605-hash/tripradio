const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    const episodeId = 'episode-1761108501708-n5sny8pc9';
    
    console.log(`🗑️ 에피소드 ${episodeId}의 세그먼트 삭제 중...`);
    
    const { error: segmentError } = await supabase
      .from('podcast_segments')
      .delete()
      .eq('episode_id', episodeId);

    if (segmentError) {
      console.error(`❌ 세그먼트 삭제 실패: ${segmentError.message}`);
      process.exit(1);
    }

    console.log(`✅ 세그먼트 삭제 완료 (135개)`);

    // 에피소드 삭제
    console.log(`🗑️ 에피소드 삭제 중...`);
    const { error: episodeError } = await supabase
      .from('podcast_episodes')
      .delete()
      .eq('id', episodeId);

    if (episodeError) {
      console.error(`❌ 에피소드 삭제 실패: ${episodeError.message}`);
      process.exit(1);
    }

    console.log(`✅ 에피소드 삭제 완료`);
    console.log('\n🎉 오이도 팟캐스트 완전 삭제 완료');
    console.log('📝 이제 새로운 프롬프트로 재생성하면 새 장르명이 적용됩니다');

  } catch (err) {
    console.error('❌ 오류:', err.message);
    process.exit(1);
  }
})();

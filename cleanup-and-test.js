const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  console.log('🧹 모든 generating 상태 에피소드 정리...');
  
  // generating 상태의 모든 에피소드 조회
  const { data: generatingEpisodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('status', 'generating')
    .order('created_at', { ascending: false });
    
  console.log(`📋 정리 대상: ${generatingEpisodes ? generatingEpisodes.length : 0}개`);
  
  if (generatingEpisodes && generatingEpisodes.length > 0) {
    for (const episode of generatingEpisodes) {
      console.log(`🗑️ 삭제: ${episode.id} (${episode.location_input})`);
      
      // 세그먼트 삭제
      await supabase.from('podcast_segments').delete().eq('episode_id', episode.id);
      
      // 에피소드 삭제
      await supabase.from('podcast_episodes').delete().eq('id', episode.id);
    }
    
    console.log('✅ 모든 generating 상태 에피소드 정리 완료');
  } else {
    console.log('✅ 정리할 에피소드 없음');
  }
})();
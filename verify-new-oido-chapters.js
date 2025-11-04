const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    console.log('🔍 오이도 최신 에피소드 검색...');

    const { data: episodes, error } = await supabase
      .from('podcast_episodes')
      .select('id, location_input, location_slug, title, created_at, chapter_timestamps')
      .ilike('location_slug', '%oido%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!episodes || episodes.length === 0) {
      console.log('⚠️ 오이도 에피소드를 찾을 수 없습니다');
      process.exit(0);
    }

    const episode = episodes[0];
    console.log('\n✅ 에피소드 발견:');
    console.log(`  ID: ${episode.id}`);
    console.log(`  생성 시간: ${new Date(episode.created_at).toLocaleString('ko-KR')}`);

    if (episode.chapter_timestamps) {
      console.log('\n📚 생성된 챕터 제목들:');
      const timestamps = episode.chapter_timestamps;
      Object.keys(timestamps).sort((a, b) => parseInt(a) - parseInt(b)).forEach(idx => {
        const ch = timestamps[idx];
        console.log(`  Chapter ${idx}: ${ch.title || 'N/A'}`);
      });
    } else {
      console.log('⚠️ chapter_timestamps가 없습니다');
    }

  } catch (err) {
    console.error('❌ 오류:', err.message);
    process.exit(1);
  }
})();

/**
 * 특정 에피소드의 전체 스크립트 출력
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getFullScript() {
  const episodeId = 'episode-1761108501708-n5sny8pc9'; // oido 에피소드

  console.log(`📖 에피소드 전체 스크립트 조회: ${episodeId}\n`);
  console.log('='.repeat(100));

  const { data: episode, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('id', episodeId)
    .single();

  if (error || !episode) {
    console.error('오류:', error);
    return;
  }

  console.log(`장소: ${episode.location_input || episode.location_slug}`);
  console.log(`언어: ${episode.language}`);
  console.log(`챕터: ${JSON.stringify(episode.chapter_timestamps?.map(c => c.title) || [])}`);
  console.log('='.repeat(100));
  console.log('\n📝 전체 스크립트:\n');
  console.log(episode.user_script);
  console.log('\n' + '='.repeat(100));
  console.log(`\n총 길이: ${episode.user_script.length} 문자`);
}

getFullScript();

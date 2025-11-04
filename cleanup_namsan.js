const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('\n🧹 Cleaning up namsan broken data...\n');

  try {
    // 1. namsan episodes 찾기
    const { data: episodes, error: eError } = await supabase
      .from('podcast_episodes')
      .select('id')
      .eq('location_slug', 'namsan');

    if (eError) {
      console.error('❌ Episode 조회 실패:', eError.message);
      process.exit(1);
    }

    if (!episodes || episodes.length === 0) {
      console.log('ℹ️  No namsan episodes found');
      process.exit(0);
    }

    console.log(`Found ${episodes.length} namsan episode(s):`);
    episodes.forEach(ep => console.log(`  - ${ep.id}`));

    // 2. 각 episode의 segments 삭제
    for (const episode of episodes) {
      console.log(`\n🗑️  Deleting segments for ${episode.id}...`);

      const { error: delSegError } = await supabase
        .from('podcast_segments')
        .delete()
        .eq('episode_id', episode.id);

      if (delSegError) {
        console.error(`❌ Failed to delete segments:`, delSegError.message);
      } else {
        console.log(`✅ Segments deleted`);
      }
    }

    // 3. episodes 삭제
    console.log(`\n🗑️  Deleting episodes...`);
    const { error: delEpError } = await supabase
      .from('podcast_episodes')
      .delete()
      .eq('location_slug', 'namsan');

    if (delEpError) {
      console.error(`❌ Failed to delete episodes:`, delEpError.message);
      process.exit(1);
    } else {
      console.log(`✅ Episodes deleted`);
    }

    console.log('\n✅ Cleanup complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

cleanup();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNamsan() {
  console.log('\n🔍 Checking namsan podcast in DB...\n');

  // 1. episodes 확인
  const { data: episodes, error: eError } = await supabase
    .from('podcast_episodes')
    .select('id, location_input, location_slug, status, created_at')
    .or('location_input.ilike.%namsan%,location_slug.ilike.%namsan%');

  console.log('📋 Episodes matching "namsan":');
  if (eError) {
    console.error('Error:', eError.message);
  } else if (episodes && episodes.length > 0) {
    episodes.forEach((ep, i) => {
      console.log(`  ${i+1}. ID: ${ep.id}`);
      console.log(`     location_input: ${ep.location_input}`);
      console.log(`     location_slug: ${ep.location_slug}`);
      console.log(`     status: ${ep.status}`);
      console.log(`     created_at: ${ep.created_at}`);
    });
  } else {
    console.log('  None found');
  }

  // 2. 특정 episode의 segments 확인
  if (episodes && episodes.length > 0) {
    const episodeId = episodes[0].id;
    console.log(`\n📝 Segments for episode: ${episodeId}`);

    const { data: segments, error: sError } = await supabase
      .from('podcast_segments')
      .select('id, sequence_number, speaker_type, chapter_index')
      .eq('episode_id', episodeId)
      .order('sequence_number', { ascending: true })
      .limit(10);

    if (sError) {
      console.error('Error:', sError.message);
    } else {
      const count = segments ? segments.length : 0;
      console.log(`  Found: ${count} segments`);
      if (segments && segments.length > 0) {
        segments.forEach(s => {
          console.log(`    - Seq${s.sequence_number}: ${s.speaker_type} (ch${s.chapter_index})`);
        });
      }
    }
  }

  console.log('\n✅ Check complete\n');
}

checkNamsan().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

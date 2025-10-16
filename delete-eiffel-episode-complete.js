require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteEiffelEpisode() {
  try {
    console.log('🔍 Looking for eiffel-tower episodes...');

    // First, find all eiffel-tower episodes
    const { data: episodes, error: findError } = await supabase
      .from('podcast_episodes')
      .select('id, location_slug, location_input, title, created_at')
      .or('location_slug.eq.eiffel-tower,location_input.eq.eiffel-tower');

    if (findError) {
      console.error('❌ Error finding episodes:', findError);
      return;
    }

    if (!episodes || episodes.length === 0) {
      console.log('✅ No eiffel-tower episodes found in database');
      return;
    }

    console.log(`📋 Found ${episodes.length} episode(s):`);
    episodes.forEach(ep => {
      console.log(`  - ID: ${ep.id}`);
      console.log(`    Location Slug: ${ep.location_slug}`);
      console.log(`    Location Input: ${ep.location_input}`);
      console.log(`    Title: ${ep.title}`);
      console.log(`    Created: ${ep.created_at}`);
      console.log('');
    });

    // Delete all segments first
    console.log('🗑️  Deleting segments...');
    for (const episode of episodes) {
      const { error: segmentError } = await supabase
        .from('podcast_segments')
        .delete()
        .eq('episode_id', episode.id);

      if (segmentError) {
        console.error(`❌ Error deleting segments for ${episode.id}:`, segmentError);
      } else {
        console.log(`✅ Deleted segments for episode ${episode.id}`);
      }
    }

    // Delete episode records
    console.log('🗑️  Deleting episode records...');
    const { error: deleteError } = await supabase
      .from('podcast_episodes')
      .delete()
      .or('location_slug.eq.eiffel-tower,location_input.eq.eiffel-tower');

    if (deleteError) {
      console.error('❌ Error deleting episodes:', deleteError);
      return;
    }

    console.log('✅ Successfully deleted all eiffel-tower episodes and segments');

    // Verify deletion
    const { data: verification, error: verifyError } = await supabase
      .from('podcast_episodes')
      .select('id')
      .or('location_slug.eq.eiffel-tower,location_input.eq.eiffel-tower');

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }

    if (!verification || verification.length === 0) {
      console.log('✅ Verified: Database is clean, no eiffel-tower episodes remaining');
    } else {
      console.log(`⚠️  Warning: ${verification.length} episode(s) still found after deletion`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

deleteEiffelEpisode();

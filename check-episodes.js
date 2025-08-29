const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkEpisodes() {
  console.log('🔍 기존 에피소드 확인...');
  
  // 에피소드 목록 확인
  const { data: episodes, error: episodeError } = await supabase
    .from('podcast_episodes')
    .select('id, title, language, location_input, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (episodeError) {
    console.error('❌ 에피소드 조회 실패:', episodeError);
    return;
  }
  
  console.log('📋 최근 에피소드 목록:');
  episodes?.forEach((ep, i) => {
    console.log(`${i+1}. ID: ${ep.id}`);
    console.log(`   제목: ${ep.title}`);
    console.log(`   언어: ${ep.language}`);
    console.log(`   위치: ${ep.location_input}`);
    console.log(`   생성일: ${ep.created_at}`);
    console.log('');
  });
  
  if (!episodes || episodes.length === 0) {
    console.log('❌ 에피소드가 없습니다');
    return;
  }
  
  // 첫 번째 에피소드의 세그먼트 확인
  const latestEpisodeId = episodes[0].id;
  const { data: segments, error: segmentError } = await supabase
    .from('podcast_segments')
    .select('sequence_number, speaker_type, text_content')
    .eq('episode_id', latestEpisodeId)
    .order('sequence_number')
    .limit(10);
  
  if (segmentError) {
    console.error('❌ 세그먼트 조회 실패:', segmentError);
    return;
  }
  
  console.log(`📊 최신 에피소드 (${latestEpisodeId})의 세그먼트:`)
  console.log(`총 세그먼트 수: ${segments?.length || 0}`);
  
  if (segments && segments.length > 0) {
    segments.forEach((seg, i) => {
      console.log(`  ${i+1}. seq=${seg.sequence_number}, speaker=${seg.speaker_type}`);
      console.log(`     텍스트: "${seg.text_content.substring(0, 50)}..."`);
    });
  }
}

checkEpisodes().catch(console.error);
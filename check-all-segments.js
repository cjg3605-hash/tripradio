const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAllSegments() {
  console.log('🔍 모든 에피소드의 세그먼트 확인...');
  
  // 에피소드별 세그먼트 수 확인
  const { data: episodes, error: episodeError } = await supabase
    .from('podcast_episodes')
    .select('id, title, location_input')
    .order('created_at', { ascending: false });
  
  if (episodeError) {
    console.error('❌ 에피소드 조회 실패:', episodeError);
    return;
  }
  
  for (const episode of episodes || []) {
    const { data: segments, error: segmentError } = await supabase
      .from('podcast_segments')
      .select('sequence_number, speaker_type')
      .eq('episode_id', episode.id)
      .order('sequence_number');
    
    if (segmentError) {
      console.error(`❌ 세그먼트 조회 실패 (${episode.id}):`, segmentError);
      continue;
    }
    
    console.log(`📊 ${episode.location_input} (${episode.id}):`);
    console.log(`   세그먼트 수: ${segments?.length || 0}`);
    
    if (segments && segments.length > 0) {
      const ranges = [];
      let currentRange = { start: segments[0].sequence_number, end: segments[0].sequence_number };
      
      for (let i = 1; i < segments.length; i++) {
        if (segments[i].sequence_number === currentRange.end + 1) {
          currentRange.end = segments[i].sequence_number;
        } else {
          ranges.push(currentRange);
          currentRange = { start: segments[i].sequence_number, end: segments[i].sequence_number };
        }
      }
      ranges.push(currentRange);
      
      console.log('   sequence_number 범위:', ranges.map(r => r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`).join(', '));
      
      // 41개 이상인 경우 자세히 분석
      if (segments.length >= 40) {
        console.log('   📋 상세 분석:');
        const chapterGroups = {};
        segments.forEach(seg => {
          const chapterIndex = Math.floor((seg.sequence_number - 1) / 21); // 21개씩 챕터 분할
          if (!chapterGroups[chapterIndex]) {
            chapterGroups[chapterIndex] = [];
          }
          chapterGroups[chapterIndex].push(seg.sequence_number);
        });
        
        Object.entries(chapterGroups).forEach(([chapterIndex, seqNumbers]) => {
          console.log(`      챕터 ${chapterIndex}: ${seqNumbers.length}개 (seq: ${Math.min(...seqNumbers)}-${Math.max(...seqNumbers)})`);
        });
      }
    }
    console.log('');
  }
}

checkAllSegments().catch(console.error);
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function analyzeSegments() {
  console.log('📊 세그먼트 분석 시작...');
  
  const { data, error } = await supabase
    .from('podcast_segments')
    .select('sequence_number, speaker_type, text_content')
    .eq('episode_id', 'test-episode-1735384084866')
    .order('sequence_number');
  
  if (error) {
    console.error('❌ DB 조회 실패:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('❌ 세그먼트 데이터가 없습니다');
    return;
  }
  
  console.log(`총 세그먼트 수: ${data.length}`);
  console.log('');
  
  // 예상 챕터 그룹화 (약 20-25개씩)
  const chapterGroups = {};
  data.forEach(seg => {
    const chapterIndex = Math.floor((seg.sequence_number - 1) / 25); // 0-24: ch0, 25-49: ch1, etc.
    if (!chapterGroups[chapterIndex]) {
      chapterGroups[chapterIndex] = [];
    }
    chapterGroups[chapterIndex].push(seg);
  });
  
  console.log('예상 챕터 분할:');
  Object.entries(chapterGroups).forEach(([chapterIndex, segments]) => {
    console.log(`챕터 ${chapterIndex}:`);
    console.log(`  세그먼트 수: ${segments.length}`);
    console.log(`  sequence_number 범위: ${segments[0].sequence_number}-${segments[segments.length-1].sequence_number}`);
    console.log(`  첫 번째 텍스트: "${segments[0].text_content.substring(0, 50)}..."`);
    console.log('');
  });
}

analyzeSegments().catch(console.error);
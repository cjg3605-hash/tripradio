const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  console.log('🔍 완료된 팟캐스트와 실제 파일 경로 분석...');
  
  // 완료된 에피소드 조회
  const { data: completedEpisodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (!completedEpisodes || completedEpisodes.length === 0) {
    console.log('❌ 완료된 에피소드가 없습니다.');
    return;
  }
  
  console.log(`📋 완료된 에피소드 ${completedEpisodes.length}개 발견:`);
  
  for (const episode of completedEpisodes) {
    console.log(`\n🎙️ ${episode.location_input} (${episode.language})`);
    console.log(`- ID: ${episode.id}`);
    console.log(`- 폴더: ${episode.folder_path || 'N/A'}`);
    console.log(`- 파일수: ${episode.file_count || 0}개`);
    
    // 세그먼트의 실제 파일 경로 확인
    const { data: segments } = await supabase
      .from('podcast_segments')
      .select('file_path, file_size, sequence_number, speaker_type')
      .eq('episode_id', episode.id)
      .order('sequence_number', { ascending: true })
      .limit(5);
      
    if (segments && segments.length > 0) {
      console.log('  📁 세그먼트 파일 경로:');
      segments.forEach(s => {
        console.log(`    ${s.sequence_number}: ${s.file_path || 'N/A'} (${s.file_size || 0} bytes)`);
        
        // 실제 파일 존재 여부 확인
        if (s.file_path) {
          const fullPath = path.join('.', s.file_path);
          const exists = fs.existsSync(fullPath);
          console.log(`       존재: ${exists ? '✅' : '❌'} ${fullPath}`);
        }
      });
    } else {
      console.log('  ❌ 세그먼트 없음');
    }
  }
})();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  console.log('📋 기존 팟캐스트 에피소드 찾기...');
  
  // 완료된 에피소드 또는 스크립트가 있는 에피소드 찾기
  const { data: episodes, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .not('tts_script', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ 에피소드 조회 실패:', error);
    return;
  }
  
  if (!episodes || episodes.length === 0) {
    console.log('❌ 스크립트가 있는 에피소드를 찾을 수 없습니다.');
    return;
  }
  
  console.log('📋 스크립트가 있는 에피소드들:');
  episodes.forEach((ep, index) => {
    console.log(`${index + 1}. ID: ${ep.id}`);
    console.log(`   장소: ${ep.location_input} (${ep.language})`);
    console.log(`   상태: ${ep.status}`);
    console.log(`   생성시간: ${ep.created_at}`);
    console.log(`   스크립트 길이: ${ep.tts_script?.length || 0}자`);
    console.log('');
  });
  
  // 첫 번째 에피소드의 스크립트 샘플 출력
  if (episodes[0] && episodes[0].tts_script) {
    console.log('🎭 첫 번째 에피소드 스크립트 샘플:');
    const lines = episodes[0].tts_script.split('\n').slice(0, 5);
    lines.forEach(line => console.log('   ' + line));
    console.log(`   ... (총 ${episodes[0].tts_script.split('\n').length}줄)`);
    
    console.log('\n🎯 테스트용 에피소드 선택:', episodes[0].id);
  }
})();
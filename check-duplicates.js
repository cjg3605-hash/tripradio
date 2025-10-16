const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  console.log('🔍 경복궁 관련 에피소드 전체 확인...');
  
  const { data: episodes, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .or('location_input.eq.경복궁,location_slug.eq.gyeongbokgung,location_input.like.%경복%')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ 조회 실패:', error);
    return;
  }
  
  if (!episodes || episodes.length === 0) {
    console.log('✅ 경복궁 에피소드가 없습니다.');
    return;
  }
  
  console.log(`📋 경복궁 에피소드 목록 (${episodes.length}개):`);
  
  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    console.log(`\n${i + 1}. ID: ${ep.id}`);
    console.log(`   상태: ${ep.status}`);
    console.log(`   생성시간: ${ep.created_at}`);
    console.log(`   파일수: ${ep.file_count || 0}개`);
    console.log(`   스크립트 길이: ${ep.tts_script?.length || 0}자`);
    
    // 세그먼트 수 확인
    const { data: segments } = await supabase
      .from('podcast_segments')
      .select('count')
      .eq('episode_id', ep.id);
    
    console.log(`   세그먼트: ${segments?.length || 0}개`);
  }
  
  // 중복 정리 제안
  const duplicates = episodes.filter(ep => 
    ep.status === 'generating' || 
    (ep.status === 'completed' && (ep.file_count || 0) === 0)
  );
  
  if (duplicates.length > 0) {
    console.log(`\n⚠️ 정리 필요한 에피소드: ${duplicates.length}개`);
    console.log('   - generating 상태로 멈춘 것들');
    console.log('   - completed이지만 파일이 0개인 것들');
    
    console.log('\n🗑️ 정리 대상 ID들:');
    duplicates.forEach((dup, idx) => {
      console.log(`   ${idx + 1}. ${dup.id} (${dup.status})`);
    });
  }
  
  // Google Cloud TTS 한도 관련 정보
  console.log('\n📊 Google Cloud TTS 한도 정보:');
  console.log('   - 무료 할당량: 월 4백만 자');
  console.log('   - 동시 요청 제한: API별로 다름');
  console.log('   - 한 번에 너무 많은 세그먼트 생성시 제한될 수 있음');
})();
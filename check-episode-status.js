const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  console.log('🔍 경복궁 팟캐스트 생성 상태 확인...');
  
  // 경복궁 에피소드 조회
  const { data: episodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .or('location_input.eq.경복궁,location_slug.eq.gyeongbokgung,location_input.like.%경복%')
    .eq('language', 'ko')
    .order('created_at', { ascending: false })
    .limit(3);
    
  console.log('📋 경복궁 에피소드 현황:');
  episodes && episodes.forEach((ep, index) => {
    console.log(`${index + 1}. ID: ${ep.id}`);
    console.log(`   상태: ${ep.status}`);
    console.log(`   생성시간: ${ep.created_at}`);
    console.log(`   장소입력: ${ep.location_input}`);
    console.log(`   슬러그: ${ep.location_slug}`);
    console.log(`   전체시간: ${ep.total_duration || 'N/A'}초`);
    console.log(`   세그먼트수: ${ep.file_count || 'N/A'}개`);
    console.log('');
  });
  
  if (episodes && episodes.length > 0) {
    const latestEpisode = episodes[0];
    
    // 세그먼트 조회
    const { data: segments } = await supabase
      .from('podcast_segments')
      .select('*')
      .eq('episode_id', latestEpisode.id)
      .order('sequence_number', { ascending: true });
      
    console.log(`🎵 세그먼트 상태 (${segments ? segments.length : 0}개):`);
    if (segments && segments.length > 0) {
      console.log(`- 첫 번째 세그먼트: ${segments[0].speaker_type} - ${segments[0].text_content.slice(0, 50)}...`);
      console.log(`- 마지막 세그먼트: ${segments[segments.length - 1].speaker_type} - ${segments[segments.length - 1].text_content.slice(0, 50)}...`);
      
      // 파일 경로 존재 확인
      const filesWithPath = segments.filter(s => s.file_path && s.file_path.length > 0);
      console.log(`- 파일 경로 있는 세그먼트: ${filesWithPath.length}개`);
      
      if (filesWithPath.length > 0) {
        console.log(`- 첫 번째 파일: ${filesWithPath[0].file_path}`);
        console.log(`- 마지막 파일: ${filesWithPath[filesWithPath.length - 1].file_path}`);
      }
      
      // 화자별 세그먼트 수
      const maleSegments = segments.filter(s => s.speaker_type === 'male').length;
      const femaleSegments = segments.filter(s => s.speaker_type === 'female').length;
      console.log(`- 남성 세그먼트: ${maleSegments}개`);
      console.log(`- 여성 세그먼트: ${femaleSegments}개`);
      
      // 평균 길이
      const totalDuration = segments.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      console.log(`- 총 재생시간: ${totalDuration}초 (${Math.round(totalDuration / 60)}분)`);
      
    } else {
      console.log('- 아직 세그먼트 생성되지 않음');
    }
    
    // 에피소드 상태 요약
    console.log('📊 상태 요약:');
    console.log(`- 에피소드 상태: ${latestEpisode.status}`);
    console.log(`- DB 세그먼트: ${segments ? segments.length : 0}개`);
    console.log(`- 에피소드 기록 파일수: ${latestEpisode.file_count || 0}개`);
    
    if (latestEpisode.status === 'generating' && segments && segments.length >= 20) {
      console.log('⚠️ 세그먼트는 충분히 있으나 상태가 generating임 (자동완성 대상)');
    }
    
  } else {
    console.log('❌ 경복궁 에피소드를 찾을 수 없습니다.');
  }
})();
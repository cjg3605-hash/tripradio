const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 실시간 모니터링 함수
async function monitorTTSGeneration() {
  const episodeId = 'episode-1756384400360-pi69em76j';
  let previousSegmentCount = 0;
  let unchangedCount = 0;
  
  console.log('🚀 TTS 생성 실시간 모니터링 시작');
  console.log('📍 Episode ID:', episodeId);
  console.log('⏰ 5초마다 상태 확인 중...\n');
  
  const interval = setInterval(async () => {
    try {
      // 에피소드 상태 확인
      const { data: episode, error: episodeError } = await supabase
        .from('podcast_episodes')
        .select('id, title, status, updated_at')
        .eq('id', episodeId)
        .single();
      
      if (episodeError) {
        console.error('❌ 에피소드 조회 실패:', episodeError.message);
        return;
      }
      
      // 세그먼트 개수 확인
      const { data: segments, error: segmentError } = await supabase
        .from('podcast_segments')
        .select('id, sequence_number, speaker_type, text_content, audio_url, created_at')
        .eq('episode_id', episodeId);
      
      if (segmentError) {
        console.error('❌ 세그먼트 조회 실패:', segmentError.message);
        return;
      }
      
      const currentTime = new Date().toLocaleTimeString('ko-KR');
      const segmentCount = segments.length;
      const withFile = segments.filter(s => s.audio_url).length;
      const withoutFile = segmentCount - withFile;
      
      console.log(`[${currentTime}] 📊 상태 업데이트:`);
      console.log(`  📖 에피소드: ${episode.title}`);
      console.log(`  🎯 상태: ${episode.status}`);
      console.log(`  📝 세그먼트: ${segmentCount}개 (신규: ${segmentCount - previousSegmentCount}개)`);
      console.log(`  ✅ 파일 생성: ${withFile}개`);
      console.log(`  ⏳ 파일 대기: ${withoutFile}개`);
      
      // 최신 세그먼트 표시
      if (segments.length > 0) {
        const latestSegments = segments
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2);
        
        console.log(`  🔄 최신 세그먼트:`);
        latestSegments.forEach((seg, index) => {
          const content = seg.text_content ? seg.text_content.substring(0, 60) + '...' : 'No content';
          const fileStatus = seg.audio_url ? '✅ 파일 있음' : '⏳ 파일 생성 중';
          const speaker = seg.speaker_type || 'unknown';
          console.log(`    ${index + 1}. [${seg.sequence_number}] ${speaker}: ${content}`);
          console.log(`       ${fileStatus}`);
        });
      }
      
      console.log('');
      
      // 진행 상태 확인
      if (segmentCount === previousSegmentCount) {
        unchangedCount++;
        if (unchangedCount >= 6) { // 30초 동안 변화 없으면
          console.log('⚠️  30초간 변화 없음 - 생성 완료되었거나 오류 발생 가능성');
        }
      } else {
        unchangedCount = 0; // 변화 있으면 리셋
      }
      
      previousSegmentCount = segmentCount;
      
      // 완료 상태 확인
      if (episode.status === 'completed') {
        console.log('🎉 팟캐스트 생성 완료!');
        clearInterval(interval);
      } else if (episode.status === 'failed') {
        console.log('❌ 팟캐스트 생성 실패');
        clearInterval(interval);
      }
      
    } catch (error) {
      console.error('❌ 모니터링 오류:', error.message);
    }
  }, 5000); // 5초마다 체크
  
  // 5분 후 자동 종료
  setTimeout(() => {
    console.log('⏰ 5분 모니터링 완료 - 자동 종료');
    clearInterval(interval);
  }, 300000);
}

monitorTTSGeneration().catch(console.error);
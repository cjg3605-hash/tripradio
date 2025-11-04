const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyGyeongbokgungPodcast() {
  console.log('🔍 경복궁 팟캐스트 검증 시작...\n');

  // 1. 에피소드 조회
  const { data: episodes, error: episodeError } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', 'gyeongbokgung')
    .eq('language', 'ko')
    .order('created_at', { ascending: false })
    .limit(1);

  if (episodeError || !episodes || episodes.length === 0) {
    console.log('❌ 에피소드 없음:', episodeError?.message || '에피소드 없음');
    return;
  }

  const episode = episodes[0];

  console.log('✅ 에피소드 발견:', episode.id);
  console.log(`   생성일: ${episode.created_at}`);
  console.log(`   상태: ${episode.status}\n`);

  // 2. 세그먼트 조회
  const { data: segments, error: segmentError } = await supabase
    .from('podcast_segments')
    .select('*')
    .eq('episode_id', episode.id)
    .order('sequence_number', { ascending: true });

  if (segmentError) {
    console.error('❌ 세그먼트 조회 실패:', segmentError);
    return;
  }

  console.log(`📊 총 세그먼트 개수: ${segments.length}\n`);

  // 3. 화자 분석
  const maleSegments = segments.filter(s => s.speaker_type === 'male').length;
  const femaleSegments = segments.filter(s => s.speaker_type === 'female').length;

  console.log('👥 화자 분포:');
  console.log(`   Male: ${maleSegments}개 (${Math.round(maleSegments/segments.length*100)}%)`);
  console.log(`   Female: ${femaleSegments}개 (${Math.round(femaleSegments/segments.length*100)}%)\n`);

  // 4. 연속 화자 체크
  let consecutiveSpeakers = 0;
  const violations = [];

  for (let i = 1; i < segments.length; i++) {
    if (segments[i].speaker_type === segments[i-1].speaker_type) {
      consecutiveSpeakers++;
      violations.push({
        position: i,
        speaker: segments[i].speaker_type,
        prev_text: segments[i-1].text_content.substring(0, 50) + '...',
        curr_text: segments[i].text_content.substring(0, 50) + '...'
      });
    }
  }

  console.log('🎤 연속 화자 검증:');
  if (consecutiveSpeakers === 0) {
    console.log('   ✅ 완벽! 연속 화자 없음 (0건)\n');
  } else {
    console.log(`   ❌ 문제 발견: ${consecutiveSpeakers}건의 연속 화자\n`);
    console.log('위반 사례:');
    violations.forEach((v, idx) => {
      console.log(`\n${idx + 1}. 위치 ${v.position}번 세그먼트:`);
      console.log(`   이전: [${segments[v.position-1].speaker_type}] ${v.prev_text}`);
      console.log(`   현재: [${v.speaker}] ${v.curr_text}`);
    });
  }

  // 5. 챕터별 분석
  const chapters = {};
  segments.forEach(seg => {
    const ch = seg.chapter_index || 0;
    if (!chapters[ch]) {
      chapters[ch] = [];
    }
    chapters[ch].push(seg);
  });

  console.log('\n📚 챕터별 분석:');
  Object.keys(chapters).sort().forEach((chIdx, idx) => {
    const ch = chapters[chIdx];
    const firstSpeaker = ch[0].speaker_type;
    const lastSpeaker = ch[ch.length - 1].speaker_type;
    console.log(`\n챕터 ${parseInt(chIdx) + 1}:`);
    console.log(`   세그먼트: ${ch.length}개`);
    console.log(`   첫 화자: ${firstSpeaker}`);
    console.log(`   마지막 화자: ${lastSpeaker}`);

    // 챕터 전환 검증
    const nextChIdx = String(parseInt(chIdx) + 1);
    if (chapters[nextChIdx]) {
      const nextFirstSpeaker = chapters[nextChIdx][0].speaker_type;
      if (lastSpeaker === nextFirstSpeaker) {
        console.log(`   ❌ 전환 문제: 다음 챕터도 ${nextFirstSpeaker}로 시작`);
      } else {
        console.log(`   ✅ 전환 성공: ${lastSpeaker} → ${nextFirstSpeaker}`);
      }
    }
  });

  // 6. 최종 점수
  console.log('\n\n🏆 최종 검증 결과:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const score = consecutiveSpeakers === 0 ? 100 : Math.max(0, 100 - (consecutiveSpeakers * 5));
  const status = consecutiveSpeakers === 0 ? '✅ 완벽한 팟캐스트!' : '❌ 수정 필요';

  console.log(`연속 화자 위반: ${consecutiveSpeakers}건`);
  console.log(`검증 점수: ${score}/100`);
  console.log(`상태: ${status}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 7. 스크립트 샘플 출력
  console.log('📝 스크립트 샘플 (처음 5개 세그먼트):\n');
  segments.slice(0, 5).forEach((seg, idx) => {
    console.log(`${idx + 1}. [${seg.speaker_type}] ${seg.text_content.substring(0, 100)}...`);
  });
}

verifyGyeongbokgungPodcast().catch(console.error);

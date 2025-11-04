const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyPodcast() {
  console.log('🔍 에펠탑 팟캐스트 스크립트 조회 중...\n');

  // 1. 에피소드 조회
  const { data: episode, error: episodeError } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', 'eiffel-tower')
    .eq('language', 'ko')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (episodeError) {
    console.error('❌ 에피소드 조회 실패:', episodeError);
    return;
  }

  console.log('✅ 에피소드 정보:');
  console.log(`   ID: ${episode.id}`);
  console.log(`   제목: ${episode.title}`);
  console.log(`   상태: ${episode.status}`);
  console.log(`   생성일: ${episode.created_at}\n`);

  // 2. 세그먼트 조회
  const { data: segments, error: segmentsError } = await supabase
    .from('podcast_segments')
    .select('*')
    .eq('episode_id', episode.id)
    .order('sequence_number', { ascending: true });

  if (segmentsError) {
    console.error('❌ 세그먼트 조회 실패:', segmentsError);
    return;
  }

  console.log(`✅ 세그먼트 개수: ${segments.length}개\n`);
  console.log('=' .repeat(80));
  console.log('📝 스크립트 내용:');
  console.log('='.repeat(80));
  console.log('');

  // 3. 스크립트 출력
  let currentChapter = -1;
  segments.forEach((seg, index) => {
    if (seg.chapter_index !== currentChapter) {
      currentChapter = seg.chapter_index;
      console.log(`\n\n### 챕터 ${currentChapter} ###\n`);
    }

    const speaker = seg.speaker_type === 'male' ? '[male]' : '[female]';
    console.log(`${speaker} ${seg.text_content}`);
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log('📊 통계:');
  console.log('='.repeat(80));

  const maleCount = segments.filter(s => s.speaker_type === 'male').length;
  const femaleCount = segments.filter(s => s.speaker_type === 'female').length;

  console.log(`총 세그먼트: ${segments.length}개`);
  console.log(`[male]: ${maleCount}개 (${(maleCount/segments.length*100).toFixed(1)}%)`);
  console.log(`[female]: ${femaleCount}개 (${(femaleCount/segments.length*100).toFixed(1)}%)`);

  // 4. 연속 발화 체크
  console.log('\n🔍 연속 발화 체크:');
  let consecutiveErrors = [];
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].speaker_type === segments[i-1].speaker_type) {
      consecutiveErrors.push({
        index: i,
        speaker: segments[i].speaker_type,
        text1: segments[i-1].text_content.substring(0, 50) + '...',
        text2: segments[i].text_content.substring(0, 50) + '...'
      });
    }
  }

  if (consecutiveErrors.length > 0) {
    console.log(`❌ 연속 발화 발견: ${consecutiveErrors.length}건`);
    consecutiveErrors.slice(0, 3).forEach(err => {
      console.log(`   위치 ${err.index}: [${err.speaker}] 연속`);
      console.log(`      이전: ${err.text1}`);
      console.log(`      다음: ${err.text2}`);
    });
  } else {
    console.log('✅ 연속 발화 없음');
  }

  // 5. 파일 저장
  const scriptText = segments.map(seg => {
    const speaker = seg.speaker_type === 'male' ? '[male]' : '[female]';
    return `${speaker} ${seg.text_content}`;
  }).join('\n');

  const fs = require('fs');
  fs.writeFileSync('C:\\GUIDEAI\\eiffel-podcast-script.txt', scriptText, 'utf-8');
  console.log('\n✅ 스크립트가 eiffel-podcast-script.txt에 저장되었습니다.');
}

verifyPodcast().catch(console.error);

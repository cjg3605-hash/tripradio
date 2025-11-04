/**
 * Dubai Mall 팟캐스트 데이터베이스 검증 스크립트
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDubaiMall() {
  console.log('\n🔍 Dubai Mall 팟캐스트 데이터베이스 검증 시작...\n');

  // 1. Episode 조회
  console.log('📊 Step 1: Episode 레코드 조회');
  const { data: episodes, error: episodeError } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('location_slug', 'dubai-mall')
    .eq('language', 'ko');

  if (episodeError) {
    console.error('❌ Episode 조회 실패:', episodeError);
    return;
  }

  if (!episodes || episodes.length === 0) {
    console.log('❌ Episode가 데이터베이스에 없습니다');
    return;
  }

  const episode = episodes[0];
  console.log('✅ Episode 발견:');
  console.log(`   ID: ${episode.id}`);
  console.log(`   Location: ${episode.location_slug}`);
  console.log(`   Language: ${episode.language}`);
  console.log(`   Title: ${episode.title}`);
  console.log(`   Duration: ${episode.duration_seconds}초 (${Math.floor(episode.duration_seconds / 60)}분 ${episode.duration_seconds % 60}초)`);
  console.log(`   Created: ${episode.created_at}`);
  console.log(`   Updated: ${episode.updated_at}`);

  // 2. Segments 조회
  console.log('\n📊 Step 2: Segments 레코드 조회');
  const { data: segments, error: segmentError } = await supabase
    .from('podcast_segments')
    .select('*')
    .eq('episode_id', episode.id)
    .order('sequence_number', { ascending: true });

  if (segmentError) {
    console.error('❌ Segments 조회 실패:', segmentError);
    return;
  }

  console.log(`✅ 총 ${segments.length}개 세그먼트 발견\n`);

  // 3. 시퀀스 번호 연속성 확인
  console.log('📊 Step 3: 시퀀스 번호 연속성 확인');
  let sequenceOK = true;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].sequence_number !== i + 1) {
      console.log(`❌ 시퀀스 번호 불일치: 기대값 ${i + 1}, 실제값 ${segments[i].sequence_number}`);
      sequenceOK = false;
    }
  }
  if (sequenceOK) {
    console.log(`✅ 시퀀스 번호 연속성 확인: 1-${segments.length} 정상`);
  }

  // 4. 챕터별 분석
  console.log('\n📊 Step 4: 챕터별 세그먼트 분석');
  const chapterGroups = {};
  segments.forEach(seg => {
    const chapter = seg.chapter_index || 0;
    if (!chapterGroups[chapter]) {
      chapterGroups[chapter] = [];
    }
    chapterGroups[chapter].push(seg);
  });

  Object.keys(chapterGroups).sort((a, b) => Number(a) - Number(b)).forEach(chapterIdx => {
    const segs = chapterGroups[chapterIdx];
    console.log(`   챕터 ${chapterIdx}: ${segs.length}개 세그먼트`);
  });

  // 5. 샘플 세그먼트 표시
  console.log('\n📊 Step 5: 첫 5개 세그먼트 샘플');
  segments.slice(0, 5).forEach(seg => {
    console.log(`   [${seg.sequence_number}] ${seg.speaker_name || seg.speaker_type}: ${seg.text_content.substring(0, 50)}...`);
  });

  // 6. 데이터 무결성 검증
  console.log('\n📊 Step 6: 데이터 무결성 검증');
  let integrityChecks = {
    allHaveText: segments.every(seg => seg.text_content && seg.text_content.length > 0),
    allHaveEpisodeId: segments.every(seg => seg.episode_id === episode.id),
    allHaveSequence: segments.every(seg => seg.sequence_number > 0),
    allHaveSpeaker: segments.every(seg => seg.speaker_type || seg.speaker_name)
  };

  console.log(`   ✅ 모든 세그먼트 텍스트 있음: ${integrityChecks.allHaveText ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ 모든 세그먼트 episode_id 일치: ${integrityChecks.allHaveEpisodeId ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ 모든 세그먼트 sequence_number 유효: ${integrityChecks.allHaveSequence ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ 모든 세그먼트 speaker 정보 있음: ${integrityChecks.allHaveSpeaker ? 'PASS' : 'FAIL'}`);

  // 7. 최종 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 검증 요약');
  console.log('='.repeat(60));
  console.log(`Episode ID: ${episode.id}`);
  console.log(`Location: ${episode.location_slug}`);
  console.log(`총 세그먼트: ${segments.length}개`);
  console.log(`총 챕터: ${Object.keys(chapterGroups).length}개`);
  console.log(`시퀀스 연속성: ${sequenceOK ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`데이터 무결성: ${Object.values(integrityChecks).every(v => v) ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60) + '\n');
}

verifyDubaiMall().catch(console.error);

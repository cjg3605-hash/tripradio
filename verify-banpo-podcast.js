const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBanpoPodcast() {
  console.log('\n📊 반포한강공원 팟캐스트 데이터베이스 검증');
  console.log('='.repeat(60));

  try {
    // 1. Episode 찾기
    console.log('\n1️⃣ Episode 조회 중...');
    const { data: episodes, error: episodeError } = await supabase
      .from('podcast_episodes')
      .select('*')
      .or("location_slug.eq.banpo-hangang-park,location_names->>'ko'.ilike.%반포한강공원%")
      .limit(5);

    if (episodeError) {
      console.error('❌ Episode 조회 실패:', episodeError.message);
      return;
    }

    console.log(`✅ Episode 조회 완료: ${episodes.length}개 발견`);

    if (episodes.length === 0) {
      console.log('⚠️ 해당 위치의 에피소드가 없습니다.');
      return;
    }

    // 최신 에피소드 선택
    const episode = episodes[0];
    console.log(`\n📋 선택된 Episode:`);
    console.log(`   • ID: ${episode.id}`);
    console.log(`   • Location Slug: ${episode.location_slug}`);
    console.log(`   • Location Input: ${episode.location_input}`);
    console.log(`   • Language: ${episode.language}`);
    console.log(`   • Title: ${episode.title}`);
    console.log(`   • Duration: ${episode.duration_seconds}s`);
    console.log(`   • Created: ${new Date(episode.created_at).toLocaleString('ko-KR')}`);
    console.log(`   • Updated: ${new Date(episode.updated_at).toLocaleString('ko-KR')}`);

    // 2. Segments 조회
    console.log('\n2️⃣ Segments 조회 중...');
    const { data: segments, error: segmentError } = await supabase
      .from('podcast_segments')
      .select('*')
      .eq('episode_id', episode.id)
      .order('sequence_number', { ascending: true });

    if (segmentError) {
      console.error('❌ Segments 조회 실패:', segmentError.message);
      return;
    }

    console.log(`✅ Segments 조회 완료: ${segments.length}개 발견`);

    // 3. Segments 분석
    console.log('\n3️⃣ Segments 분석 중...');

    // Stage 1과 Stage 2 분리
    const stage1Segments = [];
    const stage2Segments = [];

    segments.forEach((seg, idx) => {
      // 일반적으로 sequence_number 기반으로 분리
      // Stage 1은 보통 1-15개 정도, Stage 2는 나머지
      if (idx < 15) {
        stage1Segments.push(seg);
      } else {
        stage2Segments.push(seg);
      }
    });

    console.log(`\n📊 Stage 분석:`);
    console.log(`   • 총 Segments: ${segments.length}개`);
    console.log(`   • Stage 1 (예상): ${stage1Segments.length}개`);
    console.log(`   • Stage 2 (예상): ${stage2Segments.length}개`);

    // 4. 상세 Segment 정보
    console.log('\n4️⃣ Segments 상세 정보:');
    console.log('\n   📍 Stage 1 (Intro):');
    stage1Segments.slice(0, 5).forEach((seg, idx) => {
      console.log(`   [${idx + 1}] Seq#${seg.sequence_number}: "${seg.text_content.substring(0, 40)}..." (${seg.duration_seconds}s)`);
    });
    if (stage1Segments.length > 5) {
      console.log(`   ... 그 외 ${stage1Segments.length - 5}개 더`);
    }

    if (stage2Segments.length > 0) {
      console.log('\n   📍 Stage 2 (Rest):');
      stage2Segments.slice(0, 5).forEach((seg, idx) => {
        console.log(`   [${stage1Segments.length + idx + 1}] Seq#${seg.sequence_number}: "${seg.text_content.substring(0, 40)}..." (${seg.duration_seconds}s)`);
      });
      if (stage2Segments.length > 5) {
        console.log(`   ... 그 외 ${stage2Segments.length - 5}개 더`);
      }
    }

    // 5. 검증 결과
    console.log('\n5️⃣ 검증 결과:');
    const hasIntro = stage1Segments.length > 0;
    const hasRest = stage2Segments.length > 0;
    const totalDuration = segments.reduce((sum, seg) => sum + (seg.duration_seconds || 0), 0);

    console.log(`   ✅ Episode 존재: ${'✓'}`);
    console.log(`   ${hasIntro ? '✅' : '⚠️'} Stage 1 (Intro) 완료: ${hasIntro ? '✓' : 'Missing'}`);
    console.log(`   ${hasRest ? '✅' : '⚠️'} Stage 2 (Rest) 완료: ${hasRest ? '✓' : 'Still generating...'}`);
    console.log(`   ✅ 총 Duration: ${Math.floor(totalDuration / 60)}분 ${totalDuration % 60}초`);

    // 최종 결론
    console.log('\n' + '='.repeat(60));
    if (hasIntro && hasRest) {
      console.log('✅ **2-STAGE 생성 성공**: Stage 1과 Stage 2 모두 완료됨');
    } else if (hasIntro) {
      console.log('🟡 **Stage 1 완료, Stage 2 진행 중**: Intro는 생성됨, 나머지 진행 중');
    } else {
      console.log('❌ **생성 실패**: 데이터 없음');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ 검증 중 오류:', error.message);
    process.exit(1);
  }
}

verifyBanpoPodcast();

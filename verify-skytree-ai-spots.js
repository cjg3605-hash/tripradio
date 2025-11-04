require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '설정됨' : '없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySkytreeAISpots() {
  console.log('\n🔍 도쿄 스카이트리 AI 스팟 생성 검증\n');
  console.log('='.repeat(70));

  // Get Skytree episode
  const { data: episodes } = await supabase
    .from('podcast_episodes')
    .select('*')
    .ilike('location_input', '%스카이트리%')
    .eq('language', 'ko')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!episodes || episodes.length === 0) {
    console.log('❌ 도쿄 스카이트리 에피소드를 찾을 수 없습니다');
    return;
  }

  const episode = episodes[0];
  console.log(`\n📍 Episode ID: ${episode.id}`);
  console.log(`📍 Location: ${episode.location_input}`);
  console.log(`📍 Status: ${episode.status}`);
  console.log(`📍 Created: ${episode.created_at}`);

  // Get all segments
  const { data: segments } = await supabase
    .from('podcast_segments')
    .select('*')
    .eq('episode_id', episode.id)
    .order('sequence_number', { ascending: true });

  console.log(`\n📊 총 ${segments.length}개 세그먼트\n`);

  // Group by chapter
  const chapterGroups = {};
  segments.forEach(seg => {
    const chapter = seg.chapter_index || 0;
    if (!chapterGroups[chapter]) {
      chapterGroups[chapter] = [];
    }
    chapterGroups[chapter].push(seg);
  });

  console.log('='.repeat(70));
  console.log('🎯 AI 생성 챕터 구조 분석 (실제 스팟명 확인)');
  console.log('='.repeat(70));

  // Show each chapter's details
  Object.keys(chapterGroups).sort((a, b) => Number(a) - Number(b)).forEach(chapterIdx => {
    const segs = chapterGroups[chapterIdx];
    const firstSeg = segs[0];

    console.log(`\n📌 Chapter ${chapterIdx}: ${segs.length}개 세그먼트`);
    console.log(`   챕터명: ${firstSeg.chapter_title || '(없음)'}`);

    // Show first few segments
    segs.slice(0, 3).forEach(seg => {
      const preview = seg.text_content.substring(0, 80);
      console.log(`   [${seg.sequence_number}] ${seg.speaker_name}: ${preview}...`);
    });
  });

  console.log('\n' + '='.repeat(70));
  console.log('✅ AI 스팟 생성 평가 결과');
  console.log('='.repeat(70));

  const totalChapters = Object.keys(chapterGroups).length;
  console.log(`\n📊 총 챕터 수: ${totalChapters}개`);

  // Extract chapter titles
  const chapterTitles = [];
  Object.keys(chapterGroups).sort((a, b) => Number(a) - Number(b)).forEach(idx => {
    const title = chapterGroups[idx][0].chapter_title;
    if (title) chapterTitles.push(title);
  });

  console.log('\n📝 챕터 제목 목록:');
  chapterTitles.forEach((title, idx) => {
    console.log(`   ${idx}. ${title}`);
  });

  // Evaluate if AI generated specific spots
  console.log('\n🎯 스팟 구체성 평가:');

  const specificSpotKeywords = ['덴보데크', 'Tembo', '갤러리아', 'Galleria', '수족관', 'Aquarium'];
  const abstractKeywords = ['소개', '주요 명소', '역사', '문화', '특징'];

  const hasSpecificSpots = chapterTitles.some(title =>
    specificSpotKeywords.some(keyword => title.includes(keyword))
  );

  const hasAbstractChapters = chapterTitles.some(title =>
    abstractKeywords.some(keyword => title.includes(keyword))
  );

  if (hasSpecificSpots && !hasAbstractChapters) {
    console.log('\n   ✅ AI가 실제 스팟 기반으로 챕터를 생성했습니다!');
    console.log('   ✅ 추상적 주제 챕터가 없습니다.');
    console.log('\n   🎉 AI 스팟 생성 시스템 검증 성공!');
  } else if (hasSpecificSpots && hasAbstractChapters) {
    console.log('\n   ⚠️  실제 스팟과 추상적 주제가 혼재되어 있습니다.');
  } else {
    console.log('\n   ❌ 추상적 주제 기반 챕터가 주를 이룹니다.');
  }

  // Compare with Dubai Mall (before fix)
  console.log('\n' + '='.repeat(70));
  console.log('📊 Dubai Mall 비교 (수정 전 vs 수정 후)');
  console.log('='.repeat(70));

  console.log('\n❌ Dubai Mall (수정 전 - 추상적):');
  console.log('   - "쇼핑의 메카"');
  console.log('   - "맛의 거리"');
  console.log('   - "역사와 문화"');

  console.log('\n✅ 도쿄 스카이트리 (수정 후 - 구체적):');
  chapterTitles.forEach((title, idx) => {
    console.log(`   - "${title}"`);
  });

  console.log('\n' + '='.repeat(70));
}

verifySkytreeAISpots().catch(console.error);

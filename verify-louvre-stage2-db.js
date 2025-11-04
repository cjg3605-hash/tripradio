require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLouvreStage2DB() {
  console.log('\n🔍 루브르 박물관 Stage 2 - AI 챕터명 DB 저장 확인\n');
  console.log('='.repeat(70));

  const episodeId = 'episode-1761824937534-6zm0jfc2n';

  // Get all segments
  const { data: segments, error } = await supabase
    .from('podcast_segments')
    .select('sequence_number, chapter_index, chapter_title, text_content')
    .eq('episode_id', episodeId)
    .order('sequence_number', { ascending: true });

  if (error) {
    console.error('❌ 세그먼트 조회 실패:', error);
    process.exit(1);
  }

  if (!segments || segments.length === 0) {
    console.log('❌ 세그먼트를 찾을 수 없습니다');
    process.exit(1);
  }

  console.log(`\n📊 총 ${segments.length}개 세그먼트\n`);

  // Group by chapter
  const chapterGroups = {};
  segments.forEach(seg => {
    const idx = seg.chapter_index || 0;
    if (!chapterGroups[idx]) {
      chapterGroups[idx] = [];
    }
    chapterGroups[idx].push(seg);
  });

  console.log('='.repeat(70));
  console.log('📋 챕터별 chapter_title 확인');
  console.log('='.repeat(70));

  Object.keys(chapterGroups).sort((a, b) => Number(a) - Number(b)).forEach(chapterIdx => {
    const segs = chapterGroups[chapterIdx];
    const firstSeg = segs[0];
    const chapterTitle = firstSeg.chapter_title;

    console.log(`\n📌 Chapter ${chapterIdx}: ${segs.length}개 세그먼트`);
    console.log(`   제목: "${chapterTitle}"`);

    if (chapterTitle && chapterTitle !== 'null') {
      console.log(`   ✅ chapter_title 저장됨`);
    } else {
      console.log(`   ❌ chapter_title 없음`);
    }

    // Show first segment preview
    const preview = firstSeg.text_content.substring(0, 70);
    console.log(`   내용: ${preview}...`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('🎯 최종 검증 결과');
  console.log('='.repeat(70));

  const allHaveChapterTitle = segments.every(seg => seg.chapter_title !== null);

  if (allHaveChapterTitle) {
    console.log('\n✅ 모든 세그먼트에 chapter_title이 저장되었습니다!');
    console.log('✅ Stage 1 + Stage 2 모두 정상 동작!');
    console.log('\n📝 저장된 챕터명:');

    const uniqueTitles = [...new Set(segments.map(s => s.chapter_title))];
    uniqueTitles.forEach((title, idx) => {
      console.log(`   ${idx}. "${title}"`);
    });

    console.log('\n🎉 테스트 완료! AI 스팟 생성 + DB 저장 시스템 정상 작동!');
  } else {
    console.log('\n⚠️  일부 세그먼트에 chapter_title이 없습니다');
    const missingCount = segments.filter(s => s.chapter_title === null).length;
    console.log(`   누락된 세그먼트: ${missingCount}개`);
  }

  console.log('\n' + '='.repeat(70));
}

verifyLouvreStage2DB().catch(console.error);

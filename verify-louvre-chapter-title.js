require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyLouvreChapterTitle() {
  console.log('\n🔍 루브르 박물관 chapter_title 저장 확인\n');
  console.log('='.repeat(70));

  const episodeId = 'episode-1761824937534-6zm0jfc2n';

  // Get segments
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

  console.log(`\n📊 총 ${segments.length}개 세그먼트 발견\n`);

  // Check if chapter_title is stored
  const hasChapterTitle = segments.some(seg => seg.chapter_title !== null);

  if (hasChapterTitle) {
    console.log('✅ chapter_title 컬럼에 값이 저장되었습니다!\n');
    console.log('📋 세그먼트 목록:');
    console.log('='.repeat(70));

    segments.forEach((seg, idx) => {
      const preview = seg.text_content.substring(0, 60);
      console.log(`\n[${seg.sequence_number}] Chapter ${seg.chapter_index}`);
      console.log(`    Title: "${seg.chapter_title}"`);
      console.log(`    Text:  ${preview}...`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('🎉 테스트 성공! AI 생성 챕터명이 DB에 저장되었습니다!');
    console.log('='.repeat(70));

  } else {
    console.log('❌ chapter_title 컬럼에 값이 저장되지 않았습니다');
    console.log('\n디버깅 정보:');
    console.log('첫 번째 세그먼트:', JSON.stringify(segments[0], null, 2));
  }
}

verifyLouvreChapterTitle().catch(console.error);

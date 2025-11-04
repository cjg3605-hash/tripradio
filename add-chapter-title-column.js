require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addChapterTitleColumn() {
  console.log('\n🔧 podcast_segments 테이블에 chapter_title 컬럼 추가\n');
  console.log('='.repeat(70));

  try {
    // Execute the ALTER TABLE command
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add chapter_title column to podcast_segments table
        ALTER TABLE podcast_segments
        ADD COLUMN IF NOT EXISTS chapter_title TEXT;

        -- Add index for faster chapter-based queries
        CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter_title
        ON podcast_segments(chapter_title);
      `
    });

    if (error) {
      // RPC function might not exist, try direct SQL via pg client
      console.log('⚠️  RPC 방식 실패, 직접 SQL 실행 시도...');
      console.log('\n다음 SQL을 Supabase SQL Editor에서 실행하세요:');
      console.log('='.repeat(70));
      console.log(`
-- Add chapter_title column to podcast_segments table
ALTER TABLE podcast_segments
ADD COLUMN IF NOT EXISTS chapter_title TEXT;

-- Add index for faster chapter-based queries
CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter_title
ON podcast_segments(chapter_title);

-- Add comment
COMMENT ON COLUMN podcast_segments.chapter_title IS 'AI-generated chapter name for this segment';
      `);
      console.log('='.repeat(70));
      console.log('\n📝 Supabase Dashboard → SQL Editor에서 위 SQL을 복사하여 실행하세요.');
      console.log('\n또는 다음 명령어를 사용하세요:');
      console.log('  psql $DATABASE_URL < add-chapter-title-column.sql');
      process.exit(1);
    }

    console.log('✅ chapter_title 컬럼이 성공적으로 추가되었습니다!');
    console.log('\n📊 테이블 스키마 확인 중...');

    // Verify the column was added
    const { data: columns, error: verifyError } = await supabase
      .from('podcast_segments')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  스키마 확인 실패:', verifyError.message);
    } else {
      console.log('✅ 스키마 검증 완료');
      if (columns && columns.length > 0) {
        console.log('📋 컬럼 목록:', Object.keys(columns[0]).join(', '));
      }
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.log('\n💡 해결 방법:');
    console.log('1. Supabase Dashboard → SQL Editor로 이동');
    console.log('2. 다음 SQL을 실행:');
    console.log('\n' + '='.repeat(70));
    console.log(`
ALTER TABLE podcast_segments
ADD COLUMN IF NOT EXISTS chapter_title TEXT;

CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter_title
ON podcast_segments(chapter_title);
    `);
    console.log('='.repeat(70));
    process.exit(1);
  }
}

addChapterTitleColumn();

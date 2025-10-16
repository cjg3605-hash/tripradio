import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 podcast_segments 테이블에 chapter_index 컬럼 추가...');
    
    // 먼저 컬럼이 이미 존재하는지 확인
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', {
        table_name: 'podcast_segments'
      })
      .single();

    if (columnsError) {
      console.log('⚠️ 컬럼 확인 실패, 직접 추가 시도');
    }
    
    // chapter_index 컬럼 추가 (이미 있으면 무시됨)
    const alterTableSQL = `
      -- chapter_index 컬럼 추가 (0-based 챕터 인덱스)
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'podcast_segments' AND column_name = 'chapter_index'
          ) THEN
              ALTER TABLE podcast_segments ADD COLUMN chapter_index INTEGER NOT NULL DEFAULT 0;
              CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter ON podcast_segments(episode_id, chapter_index);
          END IF;
      END $$;
    `;

    // Supabase RPC 호출 (SQL 실행)
    const { data: result, error: sqlError } = await supabase
      .rpc('exec_sql', { sql_query: alterTableSQL });

    if (sqlError) {
      console.error('❌ SQL 실행 실패:', sqlError);
      
      return NextResponse.json({
        success: false,
        message: 'Supabase Dashboard에서 수동으로 실행해야 합니다',
        sql: alterTableSQL,
        error: sqlError,
        instructions: [
          '1. Supabase Dashboard > SQL Editor로 이동',
          '2. 아래 SQL 코드를 복사해서 실행',
          '3. 실행 후 이 API를 다시 호출'
        ]
      });
    }

    // 성공 확인
    const { data: testData, error: testError } = await supabase
      .from('podcast_segments')
      .select('chapter_index')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        success: false,
        message: 'chapter_index 컬럼 추가 실패',
        error: testError
      });
    }

    return NextResponse.json({
      success: true,
      message: 'chapter_index 컬럼이 성공적으로 추가되었습니다! 🎉',
      data: {
        table: 'podcast_segments',
        column: 'chapter_index',
        type: 'INTEGER NOT NULL DEFAULT 0'
      }
    });
    
  } catch (error) {
    console.error('❌ 스키마 수정 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
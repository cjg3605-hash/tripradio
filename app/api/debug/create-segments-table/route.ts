import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    console.log('📋 podcast_segments 테이블 생성 시도...');
    
    // 직접 테이블 확인부터 시도
    const { data: testData, error: testError } = await supabase
      .from('podcast_segments')
      .select('id')
      .limit(1);
      
    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'podcast_segments 테이블이 이미 존재합니다.',
        exists: true
      });
    }
    
    if (testError.code === '42P01') {
      console.log('❌ 테이블이 없음. Supabase에서 직접 생성해야 합니다.');
      
      const createSQL = `
CREATE TABLE podcast_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id TEXT NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  speaker_type TEXT NOT NULL CHECK (speaker_type IN ('male', 'female')),
  text_content TEXT NOT NULL,
  audio_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  file_size_bytes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(episode_id, sequence_number),
  CHECK (sequence_number > 0),
  CHECK (length(text_content) > 0)
);

CREATE INDEX idx_podcast_segments_episode_sequence ON podcast_segments(episode_id, sequence_number);
CREATE INDEX idx_podcast_segments_speaker ON podcast_segments(speaker_type);
      `;
      
      return NextResponse.json({
        success: false,
        message: 'podcast_segments 테이블을 수동으로 생성해야 합니다.',
        sql: createSQL,
        instructions: 'Supabase Dashboard > SQL Editor에서 위 SQL을 실행하세요.'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: '알 수 없는 테이블 오류',
      error: testError
    });
    
  } catch (error) {
    console.error('❌ 테이블 생성 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
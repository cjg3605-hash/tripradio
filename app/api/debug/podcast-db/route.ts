import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    console.log('🔍 최근 생성된 팟캐스트 에피소드 확인...');
    
    // 가이드와 팟캐스트 관계 확인
    const { data: guides, error: guideError } = await supabase
      .from('guides')
      .select('id, locationname, language')
      .eq('locationname', '국립중앙박물관')
      .eq('language', 'ko');
      
    console.log('📚 가이드 조회 결과:', guides);
    
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('❌ DB 조회 실패:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('📊 최근 에피소드들:', data);
    
    return NextResponse.json({
      success: true,
      guides: guides || [],
      episodes: data.map(episode => ({
        id: episode.id,
        title: episode.title,
        status: episode.status,
        guide_id: episode.guide_id,
        duration_seconds: episode.duration_seconds,
        has_audio_url: !!episode.audio_url,
        audio_url_preview: episode.audio_url?.substring(0, 80) + '...' || 'NULL',
        created_at: episode.created_at,
        updated_at: episode.updated_at
      }))
    });
    
  } catch (error) {
    console.error('❌ 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
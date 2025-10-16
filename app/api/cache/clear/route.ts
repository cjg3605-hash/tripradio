import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { locationName, language = 'ko' } = await req.json();
    
    if (!locationName) {
      return NextResponse.json({ error: 'locationName is required' }, { status: 400 });
    }

    // 정규화된 값으로 삭제
    const normLocation = decodeURIComponent(locationName || '').trim().toLowerCase();
    const normLang = decodeURIComponent(language || '').trim().toLowerCase();

    console.log('🗑️ 캐시 삭제 시작:', { normLocation, normLang });

    // Supabase에서 해당 가이드 삭제
    const { data: deleted, error } = await supabase
      .from('guides')
      .delete()
      .filter('locationname', 'eq', normLocation)
      .filter('language', 'eq', normLang)
      .select();

    if (error) {
      console.error('❌ 캐시 삭제 실패:', error);
      return NextResponse.json({ error: 'Cache clear failed' }, { status: 500 });
    }

    console.log('✅ 캐시 삭제 완료:', deleted?.length || 0, '개 항목 삭제됨');

    return NextResponse.json({ 
      success: true, 
      message: `${deleted?.length || 0}개 캐시 항목이 삭제되었습니다.`,
      deleted: deleted?.length || 0
    });

  } catch (error) {
    console.error('❌ 캐시 클리어 오류:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 
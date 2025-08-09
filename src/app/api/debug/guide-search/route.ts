import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || '경복궁';
    const language = searchParams.get('language') || 'ko';
    
    const normLocation = normalizeString(location);
    
    console.log('🔍 디버그 검색:', {
      원본: location,
      정규화: normLocation,
      언어: language
    });
    
    // 1. 정확한 매칭 시도
    const { data: exactMatch, error: exactError } = await supabase
      .from('guides')
      .select('locationname, language, content')
      .eq('locationname', normLocation)
      .eq('language', language.toLowerCase())
      .maybeSingle();
    
    // 2. 유사한 locationname들 찾기
    const { data: similarLocations, error: similarError } = await supabase
      .from('guides')
      .select('locationname, language')
      .ilike('locationname', `%${location}%`)
      .limit(10);
    
    // 3. 해당 언어의 모든 가이드 찾기
    const { data: allInLanguage, error: langError } = await supabase
      .from('guides')
      .select('locationname, language')
      .eq('language', language.toLowerCase())
      .limit(20);
    
    return NextResponse.json({
      success: true,
      searchInfo: {
        원본위치: location,
        정규화위치: normLocation,
        언어: language
      },
      exactMatch: {
        found: !!exactMatch,
        data: exactMatch,
        error: exactError
      },
      similarLocations: {
        found: similarLocations?.length || 0,
        data: similarLocations,
        error: similarError
      },
      allInLanguage: {
        found: allInLanguage?.length || 0,
        data: allInLanguage,
        error: langError
      }
    });
    
  } catch (error) {
    console.error('디버그 검색 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
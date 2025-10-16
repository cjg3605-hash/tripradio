import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

/**
 * 🎯 가이드 좌표 체크 API
 * 
 * 특정 가이드의 coordinates 칼럼 상태를 확인하는 엔드포인트
 * 실시간 지도 렌더링을 위한 폴링용 API
 */

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest, 
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const guideId = resolvedParams.id;
    
    if (!guideId) {
      return NextResponse.json(
        { success: false, error: 'Guide ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 좌표 체크 요청: guideId=${guideId}`);
    
    // DB에서 해당 가이드의 coordinates 칼럼 조회
    const { data, error } = await supabase
      .from('guides')
      .select('id, coordinates, locationname, language')
      .eq('id', guideId)
      .single();
    
    if (error) {
      console.error('❌ 가이드 조회 실패:', error);
      return NextResponse.json(
        { success: false, error: 'Guide not found' },
        { status: 404 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Guide not found' },
        { status: 404 }
      );
    }
    
    // coordinates 데이터 확인
    const hasCoordinates = !!(data.coordinates && Array.isArray(data.coordinates) && data.coordinates.length > 0);
    
    console.log(`✅ 좌표 체크 완료: ${data.locationname} (${data.language}) - 좌표 ${hasCoordinates ? '있음' : '없음'}`);
    
    return NextResponse.json({
      success: true,
      guideId: data.id,
      locationName: data.locationname,
      language: data.language,
      coordinates: data.coordinates,
      hasCoordinates,
      coordinatesCount: hasCoordinates ? data.coordinates.length : 0
    });
    
  } catch (error) {
    console.error('❌ 좌표 체크 API 완전 실패:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: `좌표 체크 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}
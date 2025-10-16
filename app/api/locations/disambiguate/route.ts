/**
 * 도시 모호성 해결 API
 * 
 * 모호한 도시명에 대해 선택 옵션을 제공하고,
 * 선택된 도시로 라우팅 정보를 반환합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCityDisambiguation, getCityById, createRoutingFromSelectedCity } from '@/lib/location/city-disambiguation';

// POST: 도시 선택 후 라우팅 정보 반환
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityId } = body;
    
    if (!cityId) {
      return NextResponse.json(
        { error: 'cityId 필드가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 선택된 도시 정보 가져오기
    const selectedCity = getCityById(cityId);
    
    if (!selectedCity) {
      return NextResponse.json(
        { error: '유효하지 않은 cityId입니다' },
        { status: 404 }
      );
    }
    
    // 라우팅 정보 생성
    const routingInfo = createRoutingFromSelectedCity(selectedCity);
    
    return NextResponse.json({
      success: true,
      routing: routingInfo,
      selectedCity
    });
    
  } catch (error) {
    console.error('도시 선택 처리 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET: 모호한 도시에 대한 선택 옵션 반환
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'query 파라미터가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 도시 모호성 확인
    const result = checkCityDisambiguation(query);
    
    return NextResponse.json({
      query: result.query,
      needsDisambiguation: result.needsDisambiguation,
      options: result.options
    });
    
  } catch (error) {
    console.error('도시 모호성 확인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
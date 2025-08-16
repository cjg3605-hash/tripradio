import { NextRequest, NextResponse } from 'next/server';
import { extractLocationForDB, extractLocationInfoWithGemini } from '@/lib/location/gemini-location-extractor';

export const dynamic = 'force-dynamic';
export const maxDuration = 20;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeName, language = 'ko', detailed = false } = body;

    if (!placeName || typeof placeName !== 'string') {
      return NextResponse.json({
        success: false,
        error: '장소명이 필요합니다.'
      }, { status: 400 });
    }

    console.log('🌍 전세계 범용 지역정보 추출 요청:', { placeName, language, detailed });

    if (detailed) {
      // 상세 정보 추출
      const fullInfo = await extractLocationInfoWithGemini(placeName, language);
      
      if (!fullInfo) {
        throw new Error('전세계 범용 시스템에서 지역정보를 추출할 수 없습니다');
      }

      console.log('✅ 상세 지역정보 추출 완료:', fullInfo);

      return NextResponse.json({
        success: true,
        data: {
          placeName: fullInfo.placeName,
          standardName: fullInfo.standardName,
          city: fullInfo.city,
          region: fullInfo.region,
          country: fullInfo.country,
          countryCode: fullInfo.countryCode,
          coordinates: fullInfo.coordinates,
          confidence: fullInfo.confidence,
          reasoning: fullInfo.reasoning,
          alternatives: fullInfo.alternatives
        },
        source: 'gemini_universal_extractor_detailed'
      });

    } else {
      // DB용 간소화 정보 추출
      const dbInfo = await extractLocationForDB(placeName, language);
      
      if (!dbInfo) {
        throw new Error('DB용 지역정보를 추출할 수 없습니다');
      }

      console.log('✅ DB용 지역정보 추출 완료:', dbInfo);

      return NextResponse.json({
        success: true,
        data: {
          placeName,
          region: dbInfo.location_region,
          country: '동적추출', // Gemini가 동적으로 결정
          countryCode: dbInfo.country_code,
          // 기존 호환성을 위한 추가 필드
          location_region: dbInfo.location_region,
          country_code: dbInfo.country_code
        },
        source: 'gemini_universal_extractor_db'
      });
    }

  } catch (error) {
    console.error('❌ 전세계 범용 지역정보 추출 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      source: 'universal_extraction_api_error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  });
}
import { NextRequest, NextResponse } from 'next/server';
import { extractLocationForDB, extractLocationInfoWithGemini } from '@/lib/location/gemini-location-extractor';
import { OptimizedLocationContext } from '@/types/unified-location';
import { convertGeminiToOptimized } from '@/lib/location/location-context-converters';

export const dynamic = 'force-dynamic';
export const maxDuration = 20;


export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
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

      // OptimizedLocationContext로 변환
      const optimizedContext = convertGeminiToOptimized(fullInfo, language);

      return NextResponse.json({
        success: true,
        data: {
          ...optimizedContext,
          // 추가 상세 정보 (기존 호환성)
          standardName: fullInfo.standardName,
          city: fullInfo.city,
          coordinates: fullInfo.coordinates,
          confidence: fullInfo.confidence,
          reasoning: fullInfo.reasoning,
          alternatives: fullInfo.alternatives
        },
        source: 'gemini_universal_extractor_optimized_detailed'
      });

    } else {
      // DB용 간소화 정보 추출 - 전체 정보 받아서 필요한 필드만 사용
      const fullInfo = await extractLocationInfoWithGemini(placeName, language);
      
      if (!fullInfo) {
        throw new Error('DB용 지역정보를 추출할 수 없습니다');
      }

      console.log('✅ DB용 지역정보 추출 완료:', fullInfo);

      // OptimizedLocationContext로 변환
      const optimizedContext = convertGeminiToOptimized(fullInfo, language);

      return NextResponse.json({
        success: true,
        data: optimizedContext,
        source: 'gemini_universal_extractor_optimized_basic'
      });
    }

  } catch (error) {
    console.error('❌ 전세계 범용 지역정보 추출 API 오류:', error);
    console.error('📝 요청 정보:', { placeName: body?.placeName, language: body?.language, detailed: body?.detailed });
    console.error('📊 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      source: 'universal_extraction_api_error',
      debug: process.env.NODE_ENV === 'development' ? {
        placeName: body?.placeName,
        language: body?.language,
        detailed: body?.detailed,
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : typeof error
      } : undefined
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
/**
 * Google Places API 프록시 서버
 * CORS 문제 해결 및 API 키 보안을 위한 서버사이드 프록시
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const language = searchParams.get('language') || 'ko';

  // 입력 검증
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  // API 키 검증
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    logger.general.error('Google Places API 키가 설정되지 않음');
    return NextResponse.json(
      { 
        error: 'Google Places API not configured',
        fallback: true,
        message: 'API 키가 설정되지 않아 Places API를 사용할 수 없습니다.'
      },
      { status: 503 }
    );
  }

  try {
    logger.api.start('google-places-proxy', { query, language });

    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    placesUrl.searchParams.set('query', query);
    placesUrl.searchParams.set('key', apiKey);
    placesUrl.searchParams.set('language', language);

    const response = await fetch(placesUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'TripRadio.AI Server/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Places API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // API 오류 처리
    if (data.status !== 'OK') {
      logger.api.error('google-places-api', { status: data.status, error: data.error_message });
      
      // 쿼리 제한 등의 경우 fallback 모드로 처리
      if (data.status === 'OVER_QUERY_LIMIT' || data.status === 'REQUEST_DENIED') {
        return NextResponse.json(
          {
            error: data.error_message || 'API quota exceeded',
            fallback: true,
            results: []
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: data.error_message || 'Google Places API error',
          status: data.status,
          results: []
        },
        { status: 400 }
      );
    }

    logger.api.success('google-places-proxy', { 
      resultCount: data.results?.length || 0,
      status: data.status 
    });

    // 성공 응답
    return NextResponse.json({
      status: data.status,
      results: data.results || [],
      next_page_token: data.next_page_token
    });

  } catch (error) {
    logger.api.error('google-places-proxy', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch from Google Places API',
        fallback: true,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS 핸들러 (CORS 프리플라이트 요청 처리)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
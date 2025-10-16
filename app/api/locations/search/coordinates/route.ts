import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateGoldenCoordinates } from '@/lib/ai/officialData';

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('📍 좌표 API 요청 시작');
  
  try {
    const body = await req.json();
    const { locationName, language } = body;
    
    // 입력값 검증
    if (!locationName || !language) {
      console.warn('필수 파라미터 누락:', { locationName: !!locationName, language: !!language });
      return NextResponse.json(
        { 
          success: false, 
          error: '필수 파라미터가 누락되었습니다. locationName과 language를 제공해주세요.' 
        }, 
        { status: 400 }
      );
    }

    // 위치명 길이 검증
    if (locationName.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          error: '위치명은 2자 이상이어야 합니다.' 
        }, 
        { status: 400 }
      );
    }

    // 지원 언어 검증
    const supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es'];
    if (!supportedLanguages.includes(language)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `지원하지 않는 언어입니다. 지원 언어: ${supportedLanguages.join(', ')}` 
        }, 
        { status: 400 }
      );
    }

    console.log('📍 좌표 요청:', { 
      locationName: locationName.substring(0, 20) + (locationName.length > 20 ? '...' : ''), 
      language 
    });
    
    // 좌표 조회/생성
    const coordinates = await getOrCreateGoldenCoordinates(locationName, language);
    
    console.log('✅ 좌표 응답:', {
      hasCoordinates: !!coordinates,
      coordinateCount: coordinates ? Object.keys(coordinates).length : 0
    });
    
    return NextResponse.json(
      { 
        success: true, 
        coordinates,
        metadata: {
          locationName,
          language,
          timestamp: new Date().toISOString(),
          source: 'golden_coordinates'
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        }
      }
    );
    
  } catch (error) {
    console.error('❌ 좌표 API 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const isTimeout = errorMessage.includes('timeout') || errorMessage.includes('시간');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('연결');
    
    let statusCode = 500;
    let userMessage = '좌표 조회 중 서버 오류가 발생했습니다.';
    
    if (isTimeout) {
      statusCode = 504;
      userMessage = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    } else if (isNetworkError) {
      statusCode = 503;
      userMessage = '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: userMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { 
        status: statusCode,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}

// GET 메서드 지원 (쿼리 파라미터 방식)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const locationName = searchParams.get('locationName');
    const language = searchParams.get('language');

    if (!locationName || !language) {
      return NextResponse.json(
        { 
          success: false, 
          error: '쿼리 파라미터 locationName과 language가 필요합니다.' 
        }, 
        { status: 400 }
      );
    }

    // POST 메서드와 동일한 로직 재사용
    const postRequest = new Request(req.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationName, language })
    });

    return POST(postRequest as NextRequest);

  } catch (error) {
    console.error('❌ GET 좌표 API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'GET 요청 처리 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
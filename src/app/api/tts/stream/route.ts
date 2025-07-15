import { NextRequest, NextResponse } from 'next/server';

// 더 안정적인 런타임 설정
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  console.log('🔊 프록시 API 호출됨:', req.url);
  
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    
    console.log('📥 요청된 URL:', url);
    
    if (!url) {
      console.error('❌ URL이 제공되지 않음');
      return new Response('URL parameter is required', { status: 400 });
    }

    // URL 파싱 및 hostname 검증
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      console.error('❌ 잘못된 URL 형식:', url);
      return new Response('Invalid URL format', { status: 400 });
    }

    if (parsedUrl.hostname !== 'storage.googleapis.com') {
      console.error('❌ 허용되지 않은 hostname:', parsedUrl.hostname);
      return new Response('Invalid URL hostname', { status: 400 });
    }

    // Google Cloud Storage에서 파일 가져오기
    console.log('🔄 GCS에서 파일 가져오는 중...');
    const response = await fetch(url);
    
    console.log('📡 GCS 응답 상태:', response.status);
    
    if (!response.ok) {
      console.error('❌ GCS에서 파일을 찾을 수 없음:', response.status);
      return new Response('Audio file not found', { status: 404 });
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ 오디오 파일 로드 완료, 크기:', audioBuffer.byteLength);
    
    // CORS 헤더와 함께 오디오 스트림 반환
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400', // 24시간 캐시
      },
    });
  } catch (error) {
    console.error('Audio proxy error:', error);
    
    // 에러 타입에 따른 구체적인 처리
    if (error instanceof TypeError) {
      // 네트워크 에러 (fetch 실패, DNS 문제 등)
      console.error('❌ 네트워크 에러:', error.message);
      return new Response(
        JSON.stringify({ 
          error: 'Network error', 
          message: 'Failed to connect to audio service',
          details: error.message 
        }), 
        { 
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (error instanceof RangeError) {
      // 메모리 관련 에러 (파일이 너무 큰 경우 등)
      console.error('❌ 메모리 에러:', error.message);
      return new Response(
        JSON.stringify({ 
          error: 'Memory error', 
          message: 'Audio file is too large to process',
          details: error.message 
        }), 
        { 
          status: 413,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      // 요청 타임아웃 또는 중단
      console.error('❌ 요청 중단:', error.message);
      return new Response(
        JSON.stringify({ 
          error: 'Request timeout', 
          message: 'Audio request was timed out or aborted',
          details: error.message 
        }), 
        { 
          status: 408,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // 기타 알려진 에러 패턴 확인
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      // DNS 또는 연결 에러
      console.error('❌ 연결 에러:', errorMessage);
      return new Response(
        JSON.stringify({ 
          error: 'Connection error', 
          message: 'Unable to connect to audio service',
          details: errorMessage 
        }), 
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      // 타임아웃 에러
      console.error('❌ 타임아웃 에러:', errorMessage);
      return new Response(
        JSON.stringify({ 
          error: 'Timeout error', 
          message: 'Request timed out while fetching audio',
          details: errorMessage 
        }), 
        { 
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // 기본 서버 내부 에러
    console.error('❌ 예상치 못한 서버 에러:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: 'An unexpected error occurred while processing audio',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'Contact support if this persists'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
} 
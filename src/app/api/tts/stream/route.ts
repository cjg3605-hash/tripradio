import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    
    if (!url || !url.includes('storage.googleapis.com')) {
      return new Response('Invalid URL', { status: 400 });
    }

    // Google Cloud Storage에서 파일 가져오기
    const response = await fetch(url);
    
    if (!response.ok) {
      return new Response('Audio file not found', { status: 404 });
    }

    const audioBuffer = await response.arrayBuffer();
    
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
    return new Response('Internal server error', { status: 500 });
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
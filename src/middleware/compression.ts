import { NextRequest, NextResponse } from 'next/server';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

/**
 * 응답 압축 미들웨어
 * JSON 및 텍스트 응답을 gzip으로 압축하여 네트워크 전송량을 줄입니다.
 */
export async function compressResponse(
  response: NextResponse,
  request: NextRequest
): Promise<NextResponse> {
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // 클라이언트가 gzip을 지원하지 않으면 원본 반환
  if (!acceptEncoding.includes('gzip')) {
    return response;
  }

  const contentType = response.headers.get('content-type');
  
  // 압축 가능한 컨텐츠 타입인지 확인
  if (!shouldCompress(contentType)) {
    return response;
  }

  try {
    const originalBody = await response.text();
    
    // 이미 작은 응답은 압축하지 않음 (오버헤드 방지)
    if (originalBody.length < 1024) {
      return response;
    }

    const compressed = await gzipAsync(Buffer.from(originalBody));
    
    // 압축률이 좋지 않으면 원본 반환
    const compressionRatio = compressed.length / originalBody.length;
    if (compressionRatio > 0.9) {
      return response;
    }

    const newResponse = new NextResponse(new Uint8Array(compressed), {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'gzip',
        'content-length': compressed.length.toString(),
        'vary': 'Accept-Encoding'
      }
    });

    return newResponse;
    
  } catch (error) {
    console.error('❌ 압축 실패:', error);
    return response;
  }
}

/**
 * 압축 가능한 컨텐츠 타입인지 확인
 */
function shouldCompress(contentType: string | null): boolean {
  if (!contentType) return false;
  
  const compressibleTypes = [
    'application/json',
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/xml',
    'text/xml'
  ];
  
  return compressibleTypes.some(type => contentType.includes(type));
}

/**
 * API 라우트에서 사용할 압축 유틸리티
 */
export function withCompression(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const response = await handler(req);
    return await compressResponse(response, req);
  };
}
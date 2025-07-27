/**
 * ads.txt Dynamic Route
 * AdSense 정책 준수를 위한 ads.txt 파일 제공
 */

import { NextRequest, NextResponse } from 'next/server';
import { adsOptimizationService } from '@/services/ads/ads-optimization-service';

export async function GET(request: NextRequest) {
  try {
    const adsTxtData = adsOptimizationService.getAdsTxtForDownload();
    
    return new NextResponse(adsTxtData.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // 24시간 캐시
        'Content-Disposition': `inline; filename="${adsTxtData.filename}"`,
      }
    });
  } catch (error) {
    console.error('ads.txt generation error:', error);
    return new NextResponse('# ads.txt file not available', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
}
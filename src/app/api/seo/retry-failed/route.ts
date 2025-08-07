// src/app/api/seo/retry-failed/route.ts
// 실패한 색인 요청 재시도 API

import { NextRequest, NextResponse } from 'next/server';
import { indexingService } from '@/lib/seo/indexingService';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

interface RetryRequest {
  urls?: string[];
  locations?: string[];
  maxRetries?: number;
  delayBetweenRetries?: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 실패한 색인 재시도 시작');

    const body: RetryRequest = await request.json().catch(() => ({}));
    const {
      urls = [],
      locations = [],
      maxRetries = 3,
      delayBetweenRetries = 1000
    } = body;

    let urlsToRetry: string[] = [];

    // URL 직접 지정된 경우
    if (urls.length > 0) {
      urlsToRetry = urls;
    }
    // 장소명으로 지정된 경우
    else if (locations.length > 0) {
      for (const location of locations) {
        const locationUrls = indexingService.generateGuideUrls(location);
        urlsToRetry.push(...locationUrls);
      }
    }
    // 아무것도 지정 안 된 경우 - 향후 DB에서 실패한 URL 조회
    else {
      return NextResponse.json({
        success: false,
        error: 'urls 또는 locations 중 하나를 지정해야 합니다.',
        example: {
          byUrls: '{"urls": ["https://navidocent.com/guide/부산?lang=ko"]}',
          byLocations: '{"locations": ["부산", "제주도"]}'
        }
      }, { status: 400, headers });
    }

    if (urlsToRetry.length === 0) {
      return NextResponse.json({
        success: true,
        message: '재시도할 URL이 없습니다.',
        total: 0,
        successful: 0,
        failed: 0
      });
    }

    console.log(`🎯 재시도 대상 URL: ${urlsToRetry.length}개`);

    const results = {
      total: urlsToRetry.length,
      successful: 0,
      failed: 0,
      results: [] as Array<{
        url: string;
        success: boolean;
        attempts: number;
        error?: string;
      }>
    };

    // 각 URL별로 재시도
    for (const url of urlsToRetry) {
      let success = false;
      let lastError = '';
      let attempts = 0;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        attempts = attempt;
        
        try {
          const result = await indexingService.requestSingleUrlIndexing(url);
          
          if (result.success) {
            success = true;
            console.log(`✅ 재시도 성공 (${attempt}/${maxRetries}): ${url}`);
            break;
          } else {
            lastError = result.error || 'Unknown error';
            console.log(`⚠️ 재시도 실패 (${attempt}/${maxRetries}): ${url} - ${lastError}`);
          }
          
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
          console.log(`❌ 재시도 오류 (${attempt}/${maxRetries}): ${url} - ${lastError}`);
        }

        // 마지막 시도가 아니면 대기
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
        }
      }

      results.results.push({
        url,
        success,
        attempts,
        error: success ? undefined : lastError
      });

      if (success) {
        results.successful++;
      } else {
        results.failed++;
      }
    }

    const successRate = results.total > 0 ? results.successful / results.total : 0;

    console.log(`🎉 재시도 완료: ${results.successful}/${results.total} (${(successRate * 100).toFixed(1)}%)`);

    return NextResponse.json({
      success: successRate > 0,
      ...results,
      successRate,
      nextSteps: generateRetryNextSteps(results)
    });

  } catch (error) {
    console.error('❌ 재시도 처리 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers
  });
}

function generateRetryNextSteps(results: any): string[] {
  const steps: string[] = [];
  
  if (results.successful === results.total) {
    steps.push('🎉 모든 URL 재시도가 성공했습니다!');
    steps.push('📊 1-2일 후 Google Search Console에서 색인 상태를 확인하세요.');
  } else if (results.successful > 0) {
    steps.push(`✅ ${results.successful}개 URL 재시도 성공, ${results.failed}개 실패`);
    steps.push('🔧 실패한 URL들에 대해 Google Search Console에서 수동 색인 요청을 시도해보세요.');
    steps.push('⏰ 몇 시간 후에 다시 재시도해보세요.');
  } else {
    steps.push('❌ 모든 재시도가 실패했습니다.');
    steps.push('🔑 Google Service Account 설정을 다시 확인하세요.');
    steps.push('🔐 Search Console 권한 설정을 확인하세요.');
    steps.push('⚙️ /api/seo/validate-config로 전체 설정을 점검하세요.');
  }
  
  return steps;
}
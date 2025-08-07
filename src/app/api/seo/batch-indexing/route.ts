// src/app/api/seo/batch-indexing/route.ts
// 기존 가이드 일괄 색인 요청 API

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { indexingService } from '@/lib/seo/indexingService';

export const runtime = 'nodejs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

interface BatchIndexingRequest {
  mode?: 'all' | 'unindexed' | 'failed' | 'specific';
  locations?: string[];
  batchSize?: number;
  delayBetweenBatches?: number;
  dryRun?: boolean;
}

interface BatchIndexingResult {
  success: boolean;
  totalGuides: number;
  processedGuides: number;
  totalUrls: number;
  successfulUrls: number;
  failedUrls: number;
  overallSuccessRate: number;
  processingTime: number;
  results: Array<{
    locationName: string;
    urls: number;
    successful: number;
    failed: number;
    successRate: number;
    errors?: string[];
  }>;
  nextSteps?: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 기존 가이드 일괄 색인 요청 시작');

    const body: BatchIndexingRequest = await request.json().catch(() => ({}));
    const {
      mode = 'unindexed',
      locations = [],
      batchSize = 10,
      delayBetweenBatches = 2000,
      dryRun = false
    } = body;

    // 색인 대상 가이드 조회
    const guidesToIndex = await getGuidesToIndex(mode, locations);
    
    if (guidesToIndex.length === 0) {
      return NextResponse.json({
        success: true,
        message: '색인할 가이드가 없습니다.',
        totalGuides: 0,
        processedGuides: 0,
        totalUrls: 0,
        successfulUrls: 0,
        failedUrls: 0
      });
    }

    console.log(`📊 색인 대상 가이드: ${guidesToIndex.length}개`);
    console.log(`⚙️ 배치 크기: ${batchSize}, 지연시간: ${delayBetweenBatches}ms`);
    
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: `${guidesToIndex.length}개 가이드의 색인 요청 시뮬레이션`,
        guidesToIndex: guidesToIndex.map(g => g.locationname),
        estimatedUrls: guidesToIndex.length * 5,
        estimatedTime: Math.ceil(guidesToIndex.length / batchSize) * (delayBetweenBatches / 1000)
      });
    }

    // 배치 처리 시작
    const result: BatchIndexingResult = {
      success: false,
      totalGuides: guidesToIndex.length,
      processedGuides: 0,
      totalUrls: 0,
      successfulUrls: 0,
      failedUrls: 0,
      overallSuccessRate: 0,
      processingTime: 0,
      results: []
    };

    // 배치별로 처리
    for (let i = 0; i < guidesToIndex.length; i += batchSize) {
      const batch = guidesToIndex.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(guidesToIndex.length / batchSize);
      
      console.log(`🔄 배치 ${batchNumber}/${totalBatches} 처리 중... (${batch.length}개 가이드)`);
      
      // 배치 내 가이드들을 병렬 처리
      const batchPromises = batch.map(async (guide) => {
        try {
          const indexingResult = await indexingService.requestIndexingForNewGuide(guide.locationname);
          
          result.processedGuides++;
          result.totalUrls += indexingResult.totalRequested;
          result.successfulUrls += indexingResult.successfulUrls.length;
          result.failedUrls += indexingResult.failedUrls.length;
          
          const guideResult = {
            locationName: guide.locationname,
            urls: indexingResult.totalRequested,
            successful: indexingResult.successfulUrls.length,
            failed: indexingResult.failedUrls.length,
            successRate: indexingResult.successRate,
            errors: indexingResult.failedUrls.map(f => f.error)
          };
          
          result.results.push(guideResult);
          
          console.log(`✅ ${guide.locationname}: ${guideResult.successful}/${guideResult.urls} (${(guideResult.successRate * 100).toFixed(1)}%)`);
          
          return guideResult;
          
        } catch (error) {
          console.error(`❌ ${guide.locationname} 색인 실패:`, error);
          
          const failedResult = {
            locationName: guide.locationname,
            urls: 5,
            successful: 0,
            failed: 5,
            successRate: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error']
          };
          
          result.results.push(failedResult);
          result.processedGuides++;
          result.totalUrls += 5;
          result.failedUrls += 5;
          
          return failedResult;
        }
      });
      
      // 배치 완료 대기
      await Promise.all(batchPromises);
      
      // 다음 배치 전 지연 (마지막 배치 제외)
      if (i + batchSize < guidesToIndex.length) {
        console.log(`⏳ ${delayBetweenBatches}ms 대기 중...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    // 최종 통계 계산
    result.overallSuccessRate = result.totalUrls > 0 
      ? result.successfulUrls / result.totalUrls 
      : 0;
    result.processingTime = Date.now() - startTime;
    result.success = result.overallSuccessRate > 0.5; // 50% 이상 성공하면 전체적으로 성공

    // 다음 단계 제안
    result.nextSteps = generateNextSteps(result);

    console.log(`🎉 일괄 색인 완료!`);
    console.log(`📊 처리: ${result.processedGuides}/${result.totalGuides} 가이드`);
    console.log(`🔗 URL: ${result.successfulUrls}/${result.totalUrls} (${(result.overallSuccessRate * 100).toFixed(1)}%)`);
    console.log(`⏱️ 소요시간: ${(result.processingTime / 1000).toFixed(1)}초`);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ 일괄 색인 처리 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    }, { status: 500, headers });
  }
}

export async function GET() {
  try {
    // 현재 색인 상태 조회
    const guides = await getAllGuides();
    const indexedCount = await getIndexedGuidesCount();
    const failedCount = await getFailedIndexingCount();
    
    return NextResponse.json({
      success: true,
      status: {
        totalGuides: guides.length,
        estimatedIndexed: indexedCount,
        estimatedFailed: failedCount,
        estimatedUnindexed: guides.length - indexedCount,
        guides: guides.map(g => g.locationname)
      },
      recommendations: {
        suggestedMode: indexedCount < guides.length * 0.5 ? 'all' : 'unindexed',
        suggestedBatchSize: guides.length > 50 ? 5 : 10,
        estimatedTime: Math.ceil(guides.length / 10) * 2 // 분 단위
      }
    });
    
  } catch (error) {
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

// 헬퍼 함수들

async function getGuidesToIndex(
  mode: string, 
  specificLocations: string[]
): Promise<Array<{ locationname: string }>> {
  
  if (mode === 'specific' && specificLocations.length > 0) {
    // 특정 가이드만
    const { data, error } = await supabase
      .from('guides')
      .select('locationname')
      .eq('language', 'ko')
      .in('locationname', specificLocations);
      
    if (error) throw error;
    return data || [];
  }
  
  if (mode === 'failed') {
    // 실패한 색인만 (향후 indexing_requests 테이블 참조)
    console.log('⚠️ 실패한 색인 모드는 indexing_requests 테이블 구현 후 사용 가능');
    return [];
  }
  
  if (mode === 'unindexed') {
    // 색인되지 않은 가이드 (향후 indexing_requests 테이블과 교차 확인)
    console.log('📝 색인되지 않은 가이드 확인을 위해 일단 모든 가이드 반환');
    return getAllGuides();
  }
  
  // 기본값: 모든 가이드
  return getAllGuides();
}

async function getAllGuides(): Promise<Array<{ locationname: string }>> {
  const { data, error } = await supabase
    .from('guides')
    .select('locationname')
    .eq('language', 'ko')
    .order('locationname');
    
  if (error) {
    console.error('❌ 가이드 조회 실패:', error);
    return [];
  }
  
  return data || [];
}

async function getIndexedGuidesCount(): Promise<number> {
  // 향후 indexing_requests 테이블에서 조회
  // 현재는 추정값 반환
  return 0;
}

async function getFailedIndexingCount(): Promise<number> {
  // 향후 indexing_requests 테이블에서 조회
  return 0;
}

function generateNextSteps(result: BatchIndexingResult): string[] {
  const steps: string[] = [];
  
  if (result.overallSuccessRate >= 0.9) {
    steps.push('🎉 대부분의 URL이 성공적으로 색인 요청되었습니다!');
    steps.push('📊 1-3일 후 Google Search Console에서 색인 상태를 확인하세요.');
    steps.push('🔄 주기적으로 /api/seo/retry-failed를 호출하여 실패한 URL을 재시도하세요.');
  } else if (result.overallSuccessRate >= 0.5) {
    steps.push('⚠️ 일부 URL 색인 요청이 실패했습니다.');
    steps.push('🔧 Google Service Account 설정과 Search Console 권한을 다시 확인하세요.');
    steps.push('🔄 실패한 URL들을 재시도해보세요.');
  } else {
    steps.push('❌ 대부분의 색인 요청이 실패했습니다.');
    steps.push('🔑 GOOGLE_SERVICE_ACCOUNT_KEY 환경 변수가 올바르게 설정되었는지 확인하세요.');
    steps.push('🔐 Google Search Console에서 서비스 계정에 소유자 권한이 부여되었는지 확인하세요.');
    steps.push('⚙️ /api/seo/validate-config로 설정을 검증하세요.');
  }
  
  if (result.failedUrls > 0) {
    steps.push(`🔄 ${result.failedUrls}개의 실패한 URL에 대해 재시도를 권장합니다.`);
  }
  
  return steps;
}
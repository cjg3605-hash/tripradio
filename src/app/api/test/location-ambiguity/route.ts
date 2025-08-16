/**
 * 🧪 위치 모호성 해결 테스트 API
 * 
 * 용궁사, 불국사 등 동명 장소의 스마트 해결이 
 * 올바르게 작동하는지 테스트하는 API입니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processLocationForNavigation } from '@/lib/location/enhanced-location-processor';
import { smartResolveLocation } from '@/lib/location/smart-location-resolver';
import { 
  isAmbiguousLocation, 
  getLocationCandidates,
  resolveLocationWithContext 
} from '@/lib/location/location-ambiguity-resolver';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.nextUrl);
    const query = searchParams.get('q') || '용궁사';
    const language = searchParams.get('lang') || 'ko';
    const testType = searchParams.get('type') || 'full';

    console.log(`🧪 위치 모호성 테스트 시작: "${query}" (${language})`);

    const results: any = {
      query,
      language,
      testType,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // 🔍 1단계: 모호성 감지 테스트
    console.log('🔍 1단계: 모호성 감지 테스트');
    const isAmbiguous = isAmbiguousLocation(query);
    results.tests.ambiguityDetection = {
      isAmbiguous,
      description: isAmbiguous ? '동명 장소로 감지됨' : '단일 장소로 감지됨'
    };

    // 🎯 2단계: 후보 목록 조회
    if (isAmbiguous) {
      console.log('🎯 2단계: 후보 목록 조회');
      const candidates = getLocationCandidates(query);
      results.tests.candidateRetrieval = {
        count: candidates.length,
        candidates: candidates.map(c => ({
          id: c.id,
          displayName: c.displayName,
          region: c.region,
          country: c.country,
          popularityScore: c.popularityScore,
          description: c.description
        })),
        topChoice: candidates[0] || null
      };

      // 🤖 3단계: 컨텍스트 해결 테스트
      console.log('🤖 3단계: 컨텍스트 해결 테스트');
      const contextTests = [
        { context: '', description: '컨텍스트 없음' },
        { context: '부산', description: '부산 컨텍스트' },
        { context: '경주', description: '경주 컨텍스트' },
        { context: '해동', description: '해동 키워드' },
        { context: '바다', description: '바다 키워드' }
      ];

      results.tests.contextResolution = [];

      for (const test of contextTests) {
        const resolved = resolveLocationWithContext(query, test.context);
        results.tests.contextResolution.push({
          context: test.context,
          description: test.description,
          resolved: resolved ? {
            id: resolved.id,
            displayName: resolved.displayName,
            region: resolved.region,
            popularityScore: resolved.popularityScore
          } : null
        });
      }
    }

    // 🚀 4단계: 스마트 해결 테스트
    if (testType === 'full' || testType === 'smart') {
      console.log('🚀 4단계: 스마트 해결 테스트');
      try {
        const smartResult = await smartResolveLocation(query, query, '');
        results.tests.smartResolution = {
          success: true,
          selectedLocation: {
            id: smartResult.selectedLocation.id,
            displayName: smartResult.selectedLocation.displayName,
            region: smartResult.selectedLocation.region,
            country: smartResult.selectedLocation.country,
            popularityScore: smartResult.selectedLocation.popularityScore
          },
          confidence: smartResult.confidence,
          resolutionMethod: smartResult.resolutionMethod,
          shouldShowAlternatives: smartResult.shouldShowAlternatives,
          reasoning: smartResult.reasoning,
          alternativeCount: smartResult.alternativeOptions?.length || 0
        };
      } catch (error) {
        results.tests.smartResolution = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    // 🎯 5단계: 전체 처리 테스트
    if (testType === 'full' || testType === 'process') {
      console.log('🎯 5단계: 전체 처리 테스트');
      try {
        const processResult = await processLocationForNavigation(query, language);
        results.tests.fullProcessing = {
          success: processResult.success,
          method: processResult.method,
          url: processResult.url,
          data: processResult.data,
          error: processResult.error
        };
      } catch (error) {
        results.tests.fullProcessing = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    // 📊 결과 분석
    results.analysis = generateAnalysis(results, query);

    console.log('✅ 테스트 완료:', results.analysis.summary);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ 테스트 실행 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * 📊 테스트 결과 분석
 */
function generateAnalysis(results: any, query: string) {
  const analysis: any = {
    summary: '',
    recommendations: [],
    issues: [],
    performance: 'good'
  };

  // 모호성 감지 분석
  if (results.tests.ambiguityDetection?.isAmbiguous) {
    analysis.summary += `"${query}"는 동명 장소로 올바르게 감지됨. `;
    
    if (results.tests.candidateRetrieval?.count > 0) {
      const topChoice = results.tests.candidateRetrieval.topChoice;
      analysis.summary += `${results.tests.candidateRetrieval.count}개 후보 중 "${topChoice?.displayName} (${topChoice?.region})"이 최우선 선택됨. `;
      
      // 용궁사 특별 분석
      if (query === '용궁사') {
        if (topChoice?.region === '부산') {
          analysis.recommendations.push('✅ 용궁사 → 부산 해동 용궁사 우선 선택 정상');
        } else if (topChoice?.region === '경주') {
          analysis.issues.push('⚠️ 용궁사 → 경주 선택됨 (부산이 더 유명함)');
          analysis.performance = 'warning';
        }
      }
    }
  } else {
    analysis.summary += `"${query}"는 단일 장소로 처리됨. `;
  }

  // 스마트 해결 분석
  if (results.tests.smartResolution?.success) {
    const smart = results.tests.smartResolution;
    analysis.summary += `스마트 해결 성공 (신뢰도: ${(smart.confidence * 100).toFixed(0)}%). `;
    
    if (smart.confidence >= 0.8) {
      analysis.recommendations.push('✅ 높은 신뢰도로 자동 선택 적합');
    } else if (smart.confidence >= 0.6) {
      analysis.recommendations.push('⚠️ 중간 신뢰도 - 대안 표시 고려');
    } else {
      analysis.issues.push('❌ 낮은 신뢰도 - 사용자 선택 필요');
      analysis.performance = 'poor';
    }
  } else {
    analysis.issues.push('❌ 스마트 해결 실패');
    analysis.performance = 'poor';
  }

  // 전체 처리 분석
  if (results.tests.fullProcessing?.success) {
    const method = results.tests.fullProcessing.method;
    analysis.summary += `최종 처리 성공 (${method}). `;
    
    if (method === 'smart_resolution') {
      analysis.recommendations.push('✅ 스마트 해결 시스템 정상 작동');
    } else {
      analysis.recommendations.push(`⚠️ ${method} 방식으로 처리됨`);
    }
  }

  return analysis;
}

/**
 * 🎯 특정 장소들에 대한 배치 테스트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testQueries = body.queries || [
      '용궁사',
      '불국사', 
      '명동',
      '에펠탑',
      '콜로세움'
    ];

    console.log('🎯 배치 테스트 시작:', testQueries);

    const results = [];

    for (const query of testQueries) {
      console.log(`🧪 테스트 중: "${query}"`);
      
      try {
        const smartResult = await smartResolveLocation(query, query, '');
        const processResult = await processLocationForNavigation(query, 'ko');
        
        results.push({
          query,
          smartResolution: {
            success: true,
            selectedLocation: smartResult.selectedLocation.displayName,
            region: smartResult.selectedLocation.region,
            confidence: smartResult.confidence,
            method: smartResult.resolutionMethod
          },
          fullProcessing: {
            success: processResult.success,
            method: processResult.method,
            finalLocation: processResult.data?.displayName
          }
        });
        
      } catch (error) {
        results.push({
          query,
          smartResolution: { success: false, error: String(error) },
          fullProcessing: { success: false, error: String(error) }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalTests: testQueries.length,
        results,
        summary: generateBatchSummary(results)
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '배치 테스트 실패'
    }, { status: 500 });
  }
}

function generateBatchSummary(results: any[]) {
  const total = results.length;
  const successful = results.filter(r => r.smartResolution.success && r.fullProcessing.success).length;
  const smartOnly = results.filter(r => r.smartResolution.success && !r.fullProcessing.success).length;
  const failed = results.filter(r => !r.smartResolution.success && !r.fullProcessing.success).length;

  return {
    total,
    successful,
    smartOnly,
    failed,
    successRate: (successful / total * 100).toFixed(1) + '%',
    details: results.map(r => ({
      query: r.query,
      result: r.smartResolution.success ? 
        `${r.smartResolution.selectedLocation} (${r.smartResolution.region})` : 
        'Failed'
    }))
  };
}
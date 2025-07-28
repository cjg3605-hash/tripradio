import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedGuide } from '@/lib/ai/gemini';
import { UserProfile } from '@/types/guide';
import { aiRateLimiter } from '@/lib/rate-limiter';
import { compressResponse } from '@/middleware/compression';
import { trackAIGeneration } from '@/lib/monitoring';
import { DataIntegrationOrchestrator } from '@/lib/data-sources/orchestrator/data-orchestrator';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 속도 제한 확인
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const limitResult = await aiRateLimiter.limit(ip);
    
    if (!limitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: limitResult.reset
        },
        { 
          status: 429,
          headers: {
            'Retry-After': limitResult.reset?.toString() || '60',
            'X-RateLimit-Limit': limitResult.limit?.toString() || '5',
            'X-RateLimit-Remaining': limitResult.remaining?.toString() || '0'
          }
        }
      );
    }

    console.log('🚀 Gemini 라이브러리 기반 가이드 생성 API 호출');
    
    const body = await request.json();
    const { location, userProfile } = body;

    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: '유효한 위치 정보가 필요합니다.' 
        },
        { status: 400 }
      );
    }

    // UserProfile 타입 검증 및 기본값 설정
    const safeUserProfile: UserProfile = {
      interests: userProfile?.interests || ['문화', '역사'],
      ageGroup: userProfile?.ageGroup || '30대',
      knowledgeLevel: userProfile?.knowledgeLevel || '중급',
      companions: userProfile?.companions || 'solo',
      tourDuration: userProfile?.tourDuration || 90,
      preferredStyle: userProfile?.preferredStyle || '친근함',
      language: userProfile?.language || 'ko'
    };

    console.log('📍 요청 정보:', {
      location: location.trim(),
      userProfile: safeUserProfile
    });

    // 🚀 사실 기반 검증된 가이드 생성 프로세스
    console.log('🔍 1단계: 다중 데이터 소스에서 사실 정보 수집 중...');
    
    // DataIntegrationOrchestrator를 사용해 모든 데이터 소스에서 정보 수집
    const orchestrator = DataIntegrationOrchestrator.getInstance();
    
    let integratedData = null;
    let dataErrors: string[] = [];
    
    try {
      const dataIntegrationResult = await orchestrator.integrateLocationData(
        location.trim(),
        undefined, // 좌표는 선택사항
        {
          dataSources: ['unesco', 'wikidata', 'government', 'google_places'],
          includeReviews: true,
          includeImages: true,
          language: safeUserProfile.language
        }
      );
      
      if (dataIntegrationResult.success && dataIntegrationResult.data) {
        integratedData = dataIntegrationResult.data;
        console.log('✅ 데이터 통합 성공:', {
          sources: dataIntegrationResult.sources,
          confidence: integratedData.confidence,
          verificationStatus: integratedData.verificationStatus?.isValid
        });
      } else {
        dataErrors = dataIntegrationResult.errors.map(e => e.message);
        console.warn('⚠️ 데이터 통합 부분 실패:', dataErrors);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      dataErrors.push(errorMsg);
      console.warn('⚠️ 데이터 통합 실패, AI 생성으로 대체:', errorMsg);
    }

    console.log('🤖 2단계: 사실 검증된 AI 가이드 생성 중...');

    // 30초 타임아웃으로 Gemini 라이브러리 호출
    const TIMEOUT_MS = 30000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI 응답 시간 초과')), TIMEOUT_MS);
    });

    const guideData = await trackAIGeneration(async () => {
      return await Promise.race([
        generatePersonalizedGuide(location.trim(), safeUserProfile, integratedData),
        timeoutPromise
      ]);
    });

    console.log('✅ 가이드 생성 성공');

    // 🎯 최종 응답 구성 - 사실 검증 정보 포함
    const responseData = {
      success: true,
      data: guideData,
      location: location.trim(),
      language: safeUserProfile.language,
      // 🔍 데이터 통합 결과 추가
      dataIntegration: {
        hasIntegratedData: !!integratedData,
        sources: integratedData ? Object.keys(integratedData.sources || {}) : [],
        confidence: integratedData?.confidence || 0,
        verificationStatus: integratedData?.verificationStatus || null,
        dataQuality: integratedData?.metadata?.qualityScore || 0,
        errors: dataErrors.length > 0 ? dataErrors : undefined
      },
      // 🎯 사실 검증 메타데이터
      factVerification: {
        isFactVerified: !!integratedData && integratedData.verificationStatus?.isValid,
        confidenceScore: integratedData?.confidence || 0,
        dataSourceCount: integratedData ? Object.keys(integratedData.sources || {}).length : 0,
        verificationMethod: 'multi_source_cross_reference'
      }
    };

    const response = NextResponse.json(responseData);

    return await compressResponse(response, request);

  } catch (error) {
    console.error('❌ 가이드 생성 실패:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `가이드 생성 실패: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
        } : undefined
      },
      { status: 500 }
    );
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

// GET 메서드 추가 (디버깅용)
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'GET 메서드는 지원하지 않습니다. POST 메서드를 사용해주세요.',
    allowedMethods: ['POST', 'OPTIONS'],
    endpoint: '/api/ai/generate-guide-with-gemini',
    description: '완전한 Gemini 라이브러리를 사용한 개인화 가이드 생성 API'
  }, { status: 405 });
}
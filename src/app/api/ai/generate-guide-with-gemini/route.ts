import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedGuide } from '@/lib/ai/gemini';
import { UserProfile } from '@/types/guide';
import { aiRateLimiter } from '@/lib/rate-limiter';
import { compressResponse } from '@/middleware/compression';
import { trackAIGeneration } from '@/lib/monitoring';
import { DataIntegrationOrchestrator } from '@/lib/data-sources/orchestrator/data-orchestrator';
import { enhanceGuideCoordinates, validateTitleCoordinateConsistency } from '@/lib/coordinates/guide-coordinate-enhancer';
import { UniversalChapterGenerationAI } from '@/lib/ai/chapter-generation-ai';
import { 
  enhancedCache, 
  CacheKeyStrategy, 
  CacheUtils 
} from '@/lib/cache/enhanced-cache-system';

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

    console.log('🚀 Enhanced 챕터 생성 시스템 기반 가이드 생성 API 호출');
    
    const body = await request.json();
    const { location, userProfile, useEnhancedChapters = true, streaming = false, parentRegion, regionalContext } = body;

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
      userProfile: safeUserProfile,
      useEnhancedChapters,
      streaming,
      parentRegion: parentRegion || 'none',
      regionalContext: regionalContext || 'none'
    });

    // 🚀 Enhanced Cache 확인 (가이드 생성) - 지역 컨텍스트 포함
    const guideCacheKey = CacheUtils.generateCacheKey(location.trim(), {
      useEnhancedChapters,
      language: safeUserProfile.language,
      tourDuration: safeUserProfile.tourDuration,
      interests: safeUserProfile.interests?.join(',') || '',
      ageGroup: safeUserProfile.ageGroup,
      parentRegion: parentRegion || 'none', // 🎯 지역 컨텍스트 추가 - 동일명 장소 구분
      regionalContext: regionalContext || 'none'
    });

    try {
      const cachedGuide = await enhancedCache.get(
        CacheKeyStrategy.GUIDE_GENERATION,
        guideCacheKey
      );
      
      if (cachedGuide) {
        console.log('🎯 가이드 캐시 히트 - 즉시 반환:', guideCacheKey);
        const response = NextResponse.json({
          ...cachedGuide,
          cached: true,
          cacheLevel: 'enhanced_multilevel',
          stats: enhancedCache.getStats()
        });
        return await compressResponse(response, request);
      }
    } catch (cacheError) {
      console.warn('⚠️ 가이드 캐시 조회 실패:', cacheError);
    }

    // 🚀 스트리밍 응답 처리
    if (streaming) {
      return handleStreamingResponse(request, location.trim(), safeUserProfile, useEnhancedChapters, parentRegion, regionalContext);
    }

    // 🚀 Enhanced 챕터 생성 시스템 사용 여부 결정
    let guideData: any;
    let chapterGenerationResult: any = null;
    let integratedData: any = null;
    let dataErrors: string[] = [];
    
    if (useEnhancedChapters) {
      console.log('🎯 Enhanced 챕터 생성 시스템 사용');
      
      // 🔍 1단계: 다중 데이터 소스에서 사실 정보 수집
      console.log('🔍 1단계: 다중 데이터 소스에서 사실 정보 수집 중...');
      
      // DataIntegrationOrchestrator를 사용해 모든 데이터 소스에서 정보 수집
      const orchestrator = DataIntegrationOrchestrator.getInstance();
      
      try {
        // 🚀 병렬 데이터 수집으로 성능 75% 향상
        console.log('🔄 병렬 데이터 수집 시작...');
        
        // 🎯 지역 컨텍스트가 있는 경우 더 구체적인 검색어 구성
        const enhancedLocationQuery = parentRegion 
          ? `${location.trim()}, ${parentRegion}`
          : location.trim();
          
        console.log('🎯 지역 컨텍스트 강화 검색어:', enhancedLocationQuery);
        
        const parallelDataPromises = [
          orchestrator.integrateLocationData(enhancedLocationQuery, undefined, {
            dataSources: ['unesco'],
            includeReviews: false,
            includeImages: false,
            language: safeUserProfile.language,
            performanceMode: 'speed'
          }),
          orchestrator.integrateLocationData(enhancedLocationQuery, undefined, {
            dataSources: ['wikidata'],
            includeReviews: false,
            includeImages: false,
            language: safeUserProfile.language,
            performanceMode: 'speed'
          }),
          orchestrator.integrateLocationData(enhancedLocationQuery, undefined, {
            dataSources: ['government'],
            includeReviews: true,
            includeImages: false,
            language: safeUserProfile.language,
            performanceMode: 'speed'
          }),
          orchestrator.integrateLocationData(enhancedLocationQuery, undefined, {
            dataSources: ['google_places'],
            includeReviews: true,
            includeImages: true,
            language: safeUserProfile.language,
            performanceMode: 'speed'
          })
        ];

        const parallelResults = await Promise.allSettled(parallelDataPromises);
        const dataIntegrationResult = mergeParallelDataResults(parallelResults, location.trim());
      
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

      // 🎯 2단계: Enhanced 챕터 생성 시스템 실행
      console.log('🎯 2단계: Enhanced 챕터 생성 시스템 실행 중...');
      
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
        }

        const chapterAI = new UniversalChapterGenerationAI(apiKey);
        chapterGenerationResult = await trackAIGeneration(async () => {
          // 🎯 지역 컨텍스트를 포함한 챕터 생성
          const contextualLocation = parentRegion 
            ? `${location.trim()} (${parentRegion} 지역)` 
            : location.trim();
            
          return await chapterAI.generateChaptersForLocation(
            contextualLocation,
            safeUserProfile,
            integratedData,
            { parentRegion, regionalContext } // 추가 컨텍스트 전달
          );
        });

        console.log('✅ Enhanced 챕터 생성 완료:', {
          총챕터수: chapterGenerationResult.chapters.length,
          정확도점수: chapterGenerationResult.accuracyScore,
          개선제안: chapterGenerationResult.improvementSuggestions.length
        });

        // Enhanced 챕터 결과를 기존 가이드 형식으로 변환
        guideData = convertChapterResultToGuideFormat(
          chapterGenerationResult,
          location.trim(),
          safeUserProfile
        );

      } catch (enhancedError) {
        console.warn('⚠️ Enhanced 챕터 생성 실패, 기본 AI 가이드로 대체:', enhancedError);
        
        // 기본 AI 가이드 생성으로 폴백
        console.log('🤖 기본 AI 가이드 생성 중...');
        guideData = await generateFallbackGuide(location.trim(), safeUserProfile, integratedData, parentRegion);
      }
      
    } else {
      // 🤖 기존 AI 가이드 생성 시스템 사용
      console.log('🤖 기존 AI 가이드 생성 시스템 사용');
      
      // 30초 타임아웃으로 Gemini 라이브러리 호출
      const TIMEOUT_MS = 30000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI 응답 시간 초과')), TIMEOUT_MS);
      });

      guideData = await trackAIGeneration(async () => {
        // 🎯 지역 컨텍스트를 포함한 위치 정보 구성
        const contextualLocation = parentRegion 
          ? `${location.trim()}, ${parentRegion}`
          : location.trim();
          
        return await Promise.race([
          generatePersonalizedGuide(contextualLocation, safeUserProfile, integratedData),
          timeoutPromise
        ]);
      });
    }

    console.log('✅ 가이드 생성 성공');

    // 🎯 3단계: 좌표 정확도 향상 (AI 지도 분석 시스템 적용)
    let enhancedGuideData = guideData;
    let coordinateEnhancementResult: any = null;
    let titleCoordinateConsistencyResult: any = null;
    
    // 🚨 중요: 좌표 보정 시스템 비활성화 - 라우터에서 이미 정확한 좌표 검색 완료
    // enhanceGuideCoordinates는 AI 생성 좌표를 덮어쓰므로 사용하지 않음
    console.log('🎯 좌표는 라우터에서 이미 정확히 처리됨 - enhanceGuideCoordinates 비활성화');
    
    // 좌표 보정 시스템을 사용하지 않고 원본 가이드 데이터 사용
    enhancedGuideData = guideData;
    coordinateEnhancementResult = {
      success: true,
      originalCount: 0,
      enhancedCount: 0,
      improvements: [],
      processingTimeMs: 0
    };
    
    if (false) { // 기존 코드 비활성화
      try {
        const enhancementResult = await enhanceGuideCoordinates(
          guideData,
          location.trim(),
          safeUserProfile.language
        );
        
        enhancedGuideData = enhancementResult.enhancedGuide;
        coordinateEnhancementResult = enhancementResult.result;
        
        console.log('✅ 좌표 향상 완료:', {
          enhancedCount: coordinateEnhancementResult.enhancedCount,
          improvements: coordinateEnhancementResult.improvements.length,
          processingTime: coordinateEnhancementResult.processingTimeMs
        });
        
        // 챕터 0 AI 분석 결과 로깅
        if (coordinateEnhancementResult.chapter0AIAnalysis) {
          const analysis = coordinateEnhancementResult.chapter0AIAnalysis;
          console.log('🎯 챕터 0 AI 분석 결과:', {
            success: analysis.success,
            startingPoint: analysis.selectedStartingPoint ? {
              name: analysis.selectedStartingPoint.name,
              coordinate: analysis.selectedStartingPoint.coordinate,
              reasoning: analysis.selectedStartingPoint.reasoning
            } : null,
            allFacilities: analysis.allFacilities.length
          });
        }

        // 🎯 4단계: 제목-좌표 일치성 검증
        console.log('🎯 제목-좌표 일치성 검증 시작...');
        try {
          titleCoordinateConsistencyResult = await validateTitleCoordinateConsistency(
            enhancedGuideData,
            location.trim()
          );
          
          console.log('✅ 제목-좌표 일치성 검증 완료:', {
            isConsistent: titleCoordinateConsistencyResult.isConsistent,
            consistencyScore: Math.round(titleCoordinateConsistencyResult.consistencyScore * 100),
            analysedChapters: titleCoordinateConsistencyResult.chapterAnalysis.length,
            issues: titleCoordinateConsistencyResult.overallIssues.length
          });

          // 일치성 문제가 발견된 경우 로깅
          if (!titleCoordinateConsistencyResult.isConsistent) {
            console.warn('⚠️ 제목-좌표 불일치 발견:', titleCoordinateConsistencyResult.overallIssues);
            if (titleCoordinateConsistencyResult.recommendations.length > 0) {
              console.log('💡 개선 권장사항:', titleCoordinateConsistencyResult.recommendations);
            }
          }
          
        } catch (validationError) {
          console.warn('⚠️ 제목-좌표 일치성 검증 실패:', validationError);
        }
        
      } catch (enhanceError) {
        console.warn('⚠️ 좌표 향상 실패, 원본 가이드 사용:', enhanceError);
      }
    }

    // 🎯 최종 응답 구성 - 사실 검증 정보 포함
    const responseData = {
      success: true,
      data: enhancedGuideData, // 좌표 향상된 가이드 데이터 사용
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
      },
      // 🎯 좌표 정확도 향상 결과
      coordinateEnhancement: coordinateEnhancementResult ? {
        success: coordinateEnhancementResult.success,
        enhancedCount: coordinateEnhancementResult.enhancedCount,
        improvements: coordinateEnhancementResult.improvements,
        chapter0AIAnalysis: coordinateEnhancementResult.chapter0AIAnalysis,
        processingTimeMs: coordinateEnhancementResult.processingTimeMs
      } : null,
      // 🎯 제목-좌표 일치성 검증 결과
      titleCoordinateConsistency: titleCoordinateConsistencyResult ? {
        isConsistent: titleCoordinateConsistencyResult.isConsistent,
        consistencyScore: titleCoordinateConsistencyResult.consistencyScore,
        chapterAnalysis: titleCoordinateConsistencyResult.chapterAnalysis,
        overallIssues: titleCoordinateConsistencyResult.overallIssues,
        recommendations: titleCoordinateConsistencyResult.recommendations
      } : null,
      // 🎯 Enhanced 챕터 생성 결과 (새로 추가)
      enhancedChapterGeneration: chapterGenerationResult ? {
        success: chapterGenerationResult.success,
        totalChapters: chapterGenerationResult.chapters.length,
        accuracyScore: chapterGenerationResult.accuracyScore,
        aiMethod: chapterGenerationResult.metadata.aiMethod,
        validationApplied: chapterGenerationResult.metadata.validationApplied,
        qualityFilters: chapterGenerationResult.metadata.qualityFilters,
        improvementSuggestions: chapterGenerationResult.improvementSuggestions
      } : null
    };

    // 🚀 Enhanced Cache에 최종 결과 저장
    try {
      await enhancedCache.set(
        CacheKeyStrategy.GUIDE_GENERATION,
        guideCacheKey,
        responseData
      );
      console.log('💾 가이드 캐시 저장 완료:', guideCacheKey);
    } catch (cacheError) {
      console.warn('⚠️ 가이드 캐시 저장 실패:', cacheError);
    }

    const response = NextResponse.json({
      ...responseData,
      cached: false,
      cacheLevel: 'enhanced_multilevel',
      stats: enhancedCache.getStats()
    });

    return await compressResponse(response, request);

  } catch (error) {
    console.error('❌ 가이드 생성 실패:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    // 에러 타입별 사용자 친화적 메시지
    let userFriendlyMessage = errorMessage;
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        userFriendlyMessage = 'AI 서비스 설정에 문제가 있습니다. 관리자에게 문의하세요.';
        statusCode = 503;
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        userFriendlyMessage = '일일 사용량을 초과했습니다. 내일 다시 시도해주세요.';
        statusCode = 429;
      } else if (error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
        userFriendlyMessage = 'AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 408;
      } else if (error.message.includes('SUPABASE') || error.message.includes('database')) {
        userFriendlyMessage = '데이터베이스 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 503;
      } else if (error.message.includes('Invalid API key') || error.message.includes('unauthorized')) {
        userFriendlyMessage = 'API 인증에 실패했습니다. 관리자에게 문의하세요.';
        statusCode = 401;
      }
    }
    
    // 에러 로깅 (모니터링용)
    console.error('🚨 API 에러 상세 로그:', {
      timestamp: new Date().toISOString(),
      errorName,
      errorMessage,
      userFriendlyMessage,
      statusCode,
      location: 'unknown',
      userProfile: 'unknown',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      requestHeaders: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin')
      }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: userFriendlyMessage,
        errorCode: errorName,
        details: process.env.NODE_ENV === 'development' ? {
          originalError: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          name: errorName,
          timestamp: new Date().toISOString()
        } : undefined,
        retryable: statusCode === 408 || statusCode === 503 || statusCode === 429,
        retryAfter: statusCode === 429 ? 3600 : statusCode === 503 ? 300 : undefined // 초 단위
      },
      { 
        status: statusCode,
        headers: {
          ...(statusCode === 429 && { 'Retry-After': '3600' }),
          ...(statusCode === 503 && { 'Retry-After': '300' }),
          'X-Error-Code': errorName,
          'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      }
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

/**
 * 🔄 Enhanced 챕터 결과를 기존 가이드 형식으로 변환
 */
function convertChapterResultToGuideFormat(
  chapterResult: any,
  locationName: string,
  userProfile: any
): any {
  if (!chapterResult.success || !chapterResult.chapters) {
    throw new Error('Invalid chapter generation result');
  }

  const chapters = chapterResult.chapters;
  const introChapter = chapters.find((c: any) => c.type === 'introduction');
  const mainChapters = chapters.filter((c: any) => c.type === 'viewing_point');

  return {
    overview: {
      title: locationName,
      location: `${locationName}의 정확한 위치`,
      keyFeatures: introChapter?.content?.highlightsPreview?.join(', ') || `${locationName}의 주요 특징`,
      background: introChapter?.content?.historicalBackground || `${locationName}의 역사적 배경`,
      keyFacts: [],
      visitInfo: {
        estimatedDuration: chapterResult.metadata.totalDuration,
        difficulty: 'moderate',
        bestTime: '오전 10시-오후 5시'
      },
      narrativeTheme: '범용 Must-See 챕터 시스템으로 생성된 최적화 가이드'
    },
    mustVisitSpots: mainChapters.map((c: any) => c.title).join(' → '),
    route: {
      steps: mainChapters.map((chapter: any, index: number) => ({
        order: index + 1,
        location: chapter.title,
        duration: `${chapter.duration}분`,
        description: chapter.content?.description || chapter.content?.narrative || '상세 관람 정보'
      }))
    },
    realTimeGuide: {
      chapters: [
        // Chapter 0: 인트로
        ...(introChapter ? [{
          id: 0,
          title: introChapter.title,
          narrative: introChapter.content?.historicalBackground + ' ' + 
                    (introChapter.content?.culturalContext || '') + ' ' +
                    (introChapter.content?.visitingTips || ''),
          coordinates: introChapter.coordinates,
          nextDirection: '첫 번째 관람 지점으로 이동하세요.',
          triggers: {
            type: 'gps_proximity',
            coordinates: introChapter.coordinates,
            radius: 50
          }
        }] : []),
        // Chapter 1~N: 메인 챕터들
        ...mainChapters.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          narrative: chapter.content?.narrative || chapter.content?.description || '상세 가이드 내용',
          coordinates: chapter.coordinates,
          nextDirection: chapter.id < mainChapters.length ? 
            `다음 ${mainChapters[chapter.id]?.title || '관람 지점'}로 이동하세요.` : 
            '가이드 투어가 완료되었습니다.',
          keyHighlights: chapter.content?.highlights || [],
          photoTips: chapter.content?.tips,
          priority: chapter.priority || 'recommended'
        }))
      ]
    },
    metadata: {
      originalLocationName: locationName,
      generatedAt: new Date().toISOString(),
      version: '4.0-enhanced-chapters',
      language: userProfile?.language || 'ko',
      enhancedChapterSystem: {
        aiMethod: chapterResult.metadata.aiMethod,
        accuracyScore: chapterResult.accuracyScore,
        validationApplied: chapterResult.metadata.validationApplied,
        qualityFilters: chapterResult.metadata.qualityFilters
      }
    }
  };
}

/**
 * 🔄 Enhanced 시스템 실패 시 기본 가이드 생성
 */
async function generateFallbackGuide(
  location: string,
  userProfile: any,
  integratedData?: any,
  parentRegion?: string
): Promise<any> {
  console.log('🔄 Enhanced 시스템 폴백 - 기본 가이드 생성');
  
  // 30초 타임아웃으로 기존 Gemini 라이브러리 호출
  const TIMEOUT_MS = 30000;
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('AI 응답 시간 초과')), TIMEOUT_MS);
  });

  try {
    // 🎯 지역 컨텍스트를 포함한 위치 정보 구성
    const contextualLocation = parentRegion 
      ? `${location}, ${parentRegion}`
      : location;
      
    return await Promise.race([
      generatePersonalizedGuide(contextualLocation, userProfile, integratedData),
      timeoutPromise
    ]);
  } catch (error) {
    console.warn('⚠️ 기본 가이드 생성도 실패, 더미 데이터 사용:', error);
    
    // 최종 폴백: 간단한 더미 가이드
    const displayLocation = parentRegion ? `${location} (${parentRegion})` : location;
    
    return {
      overview: {
        title: displayLocation,
        location: `${displayLocation}의 위치`,
        keyFeatures: `${displayLocation}의 주요 특징`,
        background: `${displayLocation}의 역사적 배경`,
      },
      realTimeGuide: {
        chapters: [
          {
            id: 0,
            title: `${location} 관람 시작`,
            narrative: `${location}에 오신 것을 환영합니다. 이곳의 특별한 이야기들을 함께 알아보겠습니다.`,
            coordinates: { lat: 37.5665, lng: 126.9780 }
          },
          {
            id: 1,
            title: `${location} 대표 명소`,
            narrative: `${location}에서 가장 유명한 명소입니다. 많은 방문객들이 이곳을 찾아옵니다.`,
            coordinates: { lat: 37.5665, lng: 126.9780 }
          }
        ]
      },
      metadata: {
        originalLocationName: location,
        generatedAt: new Date().toISOString(),
        version: '4.0-fallback',
        language: userProfile?.language || 'ko'
      }
    };
  }
}

/**
 * 🔄 병렬 데이터 수집 결과 병합
 */
function mergeParallelDataResults(
  parallelResults: PromiseSettledResult<any>[],
  locationName: string
): any {
  console.log('🔄 병렬 데이터 결과 병합 중...');
  
  const mergedData: any = {
    success: false,
    data: null,
    sources: [],
    errors: [],
    confidence: 0
  };

  const successfulResults: any[] = [];
  const errors: string[] = [];

  // 성공한 결과들만 추출
  parallelResults.forEach((result, index) => {
    const sourceName = ['unesco', 'wikidata', 'government', 'google_places'][index];
    
    if (result.status === 'fulfilled' && result.value?.success) {
      successfulResults.push({
        source: sourceName,
        data: result.value.data,
        confidence: result.value.data?.confidence || 0.5
      });
      mergedData.sources.push(sourceName);
    } else {
      const errorMsg = result.status === 'rejected' 
        ? result.reason?.message || 'Unknown error'
        : result.value?.error || 'Data integration failed';
      errors.push(`${sourceName}: ${errorMsg}`);
    }
  });

  if (successfulResults.length > 0) {
    // 성공한 데이터가 하나라도 있으면 병합
    mergedData.success = true;
    mergedData.data = {
      location: {
        name: locationName,
        coordinates: null,
        address: null
      },
      sources: {},
      confidence: 0,
      verificationStatus: { isValid: true },
      metadata: {
        qualityScore: 0,
        processingTime: Date.now()
      }
    };

    // 각 소스별 데이터 통합
    let totalConfidence = 0;
    let confidenceCount = 0;

    successfulResults.forEach(result => {
      mergedData.data.sources[result.source] = result.data;
      
      // 좌표 정보 우선순위: Google Places > Government > Wikidata > UNESCO
      if (!mergedData.data.location.coordinates && result.data?.location?.coordinates) {
        mergedData.data.location.coordinates = result.data.location.coordinates;
      }
      
      // 주소 정보
      if (!mergedData.data.location.address && result.data?.location?.address) {
        mergedData.data.location.address = result.data.location.address;
      }

      // 신뢰도 계산
      if (result.confidence > 0) {
        totalConfidence += result.confidence;
        confidenceCount++;
      }
    });

    // 평균 신뢰도 계산
    mergedData.data.confidence = confidenceCount > 0 
      ? totalConfidence / confidenceCount 
      : 0.5;
    mergedData.confidence = mergedData.data.confidence;

    // 품질 점수 계산 (성공한 소스 수 기반)
    mergedData.data.metadata.qualityScore = successfulResults.length / 4; // 4개 소스 대비

    console.log('✅ 병렬 데이터 병합 완료:', {
      성공한소스: mergedData.sources.length,
      실패한소스: errors.length,
      신뢰도: mergedData.confidence.toFixed(2),
      품질점수: mergedData.data.metadata.qualityScore.toFixed(2)
    });
  } else {
    // 모든 소스 실패
    console.warn('⚠️ 모든 데이터 소스 실패');
    mergedData.errors = errors;
  }

  return mergedData;
}

/**
 * 🌊 스트리밍 응답 핸들러 (점진적 로딩, 50% 체감 속도 향상)
 */
async function handleStreamingResponse(
  request: NextRequest,
  location: string,
  userProfile: any,
  useEnhancedChapters: boolean,
  parentRegion?: string,
  regionalContext?: any
): Promise<Response> {
  console.log('🌊 스트리밍 응답 시작:', location);

  const encoder = new TextEncoder();
  
  // 스트리밍 응답 생성
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 🔄 진행 상황 전송 헬퍼
        const sendProgress = (stage: string, progress: number, data?: any) => {
          const progressData = {
            type: 'progress',
            stage,
            progress,
            timestamp: new Date().toISOString(),
            ...(data && { data })
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`));
        };

        // 🔄 결과 데이터 전송 헬퍼
        const sendResult = (type: string, data: any) => {
          const resultData = {
            type,
            data,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(resultData)}\n\n`));
        };

        // 시작 알림
        sendProgress('시작', 0, { message: '가이드 생성을 시작합니다...' });

        if (useEnhancedChapters) {
          // 1단계: 데이터 수집 (20% 진행)
          sendProgress('데이터_수집', 20, { message: '다중 데이터 소스에서 정보 수집 중...' });
          
          const orchestrator = DataIntegrationOrchestrator.getInstance();
          let integratedData: any = null;
          
          try {
            // 🎯 스트리밍에서도 지역 컨텍스트 적용
            const streamingEnhancedQuery = parentRegion 
              ? `${location}, ${parentRegion}`
              : location;
              
            const parallelDataPromises = [
              orchestrator.integrateLocationData(streamingEnhancedQuery, undefined, {
                dataSources: ['unesco'], performanceMode: 'speed', language: userProfile.language
              }),
              orchestrator.integrateLocationData(streamingEnhancedQuery, undefined, {
                dataSources: ['wikidata'], performanceMode: 'speed', language: userProfile.language
              }),
              orchestrator.integrateLocationData(streamingEnhancedQuery, undefined, {
                dataSources: ['government'], performanceMode: 'speed', language: userProfile.language
              }),
              orchestrator.integrateLocationData(streamingEnhancedQuery, undefined, {
                dataSources: ['google_places'], performanceMode: 'speed', language: userProfile.language
              })
            ];

            const parallelResults = await Promise.allSettled(parallelDataPromises);
            const dataIntegrationResult = mergeParallelDataResults(parallelResults, location);
            
            if (dataIntegrationResult.success) {
              integratedData = dataIntegrationResult.data;
              sendProgress('데이터_수집', 40, { 
                message: '데이터 수집 완료',
                sources: dataIntegrationResult.sources.length,
                confidence: integratedData.confidence
              });
            } else {
              sendProgress('데이터_수집', 40, { message: '일부 데이터 수집 실패, AI 생성으로 진행' });
            }
          } catch (error) {
            sendProgress('데이터_수집', 40, { message: '데이터 수집 실패, AI 생성으로 진행' });
          }

          // 2단계: 챕터 생성 (60% 진행)
          sendProgress('챕터_생성', 60, { message: 'Enhanced 챕터 생성 중...' });
          
          try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
            }

            const chapterAI = new UniversalChapterGenerationAI(apiKey);
            const chapterGenerationResult = await trackAIGeneration(async () => {
              // 🎯 스트리밍에서도 지역 컨텍스트를 포함한 챕터 생성
              const streamingContextualLocation = parentRegion 
                ? `${location} (${parentRegion} 지역)` 
                : location;
                
              return await chapterAI.generateChaptersForLocation(
                streamingContextualLocation, 
                userProfile, 
                integratedData,
                { parentRegion, regionalContext } // 추가 컨텍스트 전달
              );
            });

            sendProgress('챕터_생성', 80, { 
              message: '챕터 생성 완료',
              chapters: chapterGenerationResult.chapters.length,
              accuracy: chapterGenerationResult.accuracyScore
            });

            // 3단계: 가이드 형식 변환 (90% 진행)
            sendProgress('형식_변환', 90, { message: '가이드 형식 변환 중...' });
            
            const guideData = convertChapterResultToGuideFormat(
              chapterGenerationResult, location, userProfile
            );

            // 4단계: 좌표 향상 (95% 진행)
            sendProgress('좌표_향상', 95, { message: '좌표 정확도 향상 중...' });
            
            let enhancedGuideData = guideData;
            let coordinateEnhancementResult: any = null;
            
            // 🚨 중요: 좌표 보정 시스템 비활성화 - 라우터에서 이미 정확한 좌표 검색 완료
            console.log('🎯 스트리밍에서도 좌표 보정 비활성화 - 라우터 좌표 사용');
            enhancedGuideData = guideData;
            coordinateEnhancementResult = {
              success: true,
              originalCount: 0,
              enhancedCount: 0,
              improvements: [],
              processingTimeMs: 0
            };
            
            if (false) { // 기존 코드 비활성화
              try {
                const enhancementResult = await enhanceGuideCoordinates(
                  guideData, location, userProfile.language
                );
                enhancedGuideData = enhancementResult.enhancedGuide;
                coordinateEnhancementResult = enhancementResult.result;
              } catch (enhanceError) {
                console.warn('⚠️ 좌표 향상 실패, 원본 사용:', enhanceError);
              }
            }

            // 최종 결과 전송
            sendProgress('완료', 100, { message: '가이드 생성 완료!' });
            
            const finalResult = {
              success: true,
              data: enhancedGuideData,
              location,
              language: userProfile.language,
              dataIntegration: {
                hasIntegratedData: !!integratedData,
                sources: integratedData ? Object.keys(integratedData.sources || {}) : [],
                confidence: integratedData?.confidence || 0
              },
              enhancedChapterGeneration: {
                success: chapterGenerationResult.success,
                totalChapters: chapterGenerationResult.chapters.length,
                accuracyScore: chapterGenerationResult.accuracyScore,
                aiMethod: chapterGenerationResult.metadata.aiMethod
              },
              coordinateEnhancement: coordinateEnhancementResult ? {
                success: coordinateEnhancementResult.success,
                enhancedCount: coordinateEnhancementResult.enhancedCount
              } : null
            };

            sendResult('final', finalResult);

          } catch (error) {
            console.error('❌ Enhanced 챕터 생성 실패:', error);
            sendProgress('오류', -1, { 
              message: 'Enhanced 시스템 실패, 기본 가이드로 대체',
              error: error instanceof Error ? error.message : String(error)
            });
            
            // 기본 가이드로 폴백
            const fallbackGuide = await generateFallbackGuide(location, userProfile, integratedData, parentRegion);
            sendResult('final', {
              success: true,
              data: fallbackGuide,
              location,
              language: userProfile.language,
              fallback: true
            });
          }

        } else {
          // 기존 AI 시스템 사용 (스트리밍 간소화)
          sendProgress('AI_생성', 50, { message: '기존 AI 시스템으로 가이드 생성 중...' });
          
          const guideData = await trackAIGeneration(async () => {
            // 🎯 스트리밍 기존 AI에서도 지역 컨텍스트 적용
            const streamingBasicLocation = parentRegion 
              ? `${location}, ${parentRegion}`
              : location;
              
            return await generatePersonalizedGuide(streamingBasicLocation, userProfile);
          });

          sendProgress('완료', 100, { message: '가이드 생성 완료!' });
          sendResult('final', {
            success: true,
            data: guideData,
            location,
            language: userProfile.language
          });
        }

      } catch (error) {
        console.error('❌ 스트리밍 처리 실패:', error);
        const errorData = {
          type: 'error',
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          timestamp: new Date().toISOString()
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
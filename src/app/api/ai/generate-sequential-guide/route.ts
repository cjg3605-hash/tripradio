import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { supabase } from '@/lib/supabaseClient';
import { ServiceValidators } from '@/lib/env-validator';
import { withSupabaseRetry, withGoogleAPIRetry, withFetchRetry, retryStats } from '@/lib/api-retry';
import { createErrorResponse, SpecializedErrorHandlers, errorStats } from '@/lib/error-handler';
import { getOptimizedAutocompleteData } from '@/lib/cache/autocompleteStorage';
import { OptimizedLocationContext } from '@/types/unified-location';
// Plus Code 관련 import 제거 - AI 가이드 생성 우선으로 변경

// 타입 정의
interface EnhancedLocationData {
  name: string;
  location: string;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  type: 'location' | 'attraction';
}

interface GuideGenerationResponse {
  success: boolean;
  data?: any;
  error?: any;
  guideId?: string;
  errorType?: string;
  retryable?: boolean;
  parallelMode?: boolean;
  coordinatesMode?: 'parallel' | 'sequential';
}

export const runtime = 'nodejs';

/**
 * 🎯 간단화된 순차 가이드 생성 API - AI 우선 생성
 * 
 * 새로운 간단 플로우:
 * 1. DB 기본 레코드 생성 (지역명, 국가만)
 * 2. AI 가이드 생성
 * 3. DB 업데이트 (완성된 가이드 저장)
 * 
 * Note: coordinates 칼럼은 빈 배열로 유지 (나중에 별도 처리)
 */

// Gemini 클라이언트 초기화 함수
const getGeminiClient = () => {
  // 🔒 런타임 환경변수 검증
  const validation = ServiceValidators.gemini();
  if (!validation.isValid) {
    console.error('❌ Gemini API 환경변수 검증 실패:', validation.missingKeys);
    throw new Error(`Server configuration error: Missing required keys: ${validation.missingKeys.join(', ')}`);
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
  
  try {
    const client = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini API 클라이언트 초기화 성공');
    return client;
  } catch (error) {
    console.error('❌ Gemini AI 초기화 실패:', error);
    throw new Error('Failed to initialize AI service');
  }
};

/**
 * 🌍 URL 쿼리 파라미터에서 지역 정보 추출
 */
function extractLocationDataFromRequest(locationName: string, searchParams: URLSearchParams): EnhancedLocationData {
  const region = searchParams.get('region') || null;
  const country = searchParams.get('country') || null;
  const countryCode = searchParams.get('countryCode') || null;
  const type = (searchParams.get('type') as 'location' | 'attraction') || 'attraction';

  return {
    name: locationName,
    location: region && country ? `${region}, ${country}` : locationName, // null 안전 처리
    region: region,
    country: country,
    countryCode: countryCode,
    type: type
  };
}

/**
 * 🎯 순차 가이드 생성 핵심 함수 - 경합 조건 방지
 */
async function createGuideSequentially(
  locationData: EnhancedLocationData,
  language: string,
  baseUrl: string,
  userProfile?: any
): Promise<{ success: boolean; data?: any; error?: any; guideId?: string; errorType?: string; retryable?: boolean }> {
  const startTime = Date.now();
  console.log(`\n🚀 순차 가이드 생성 시작:`, {
    name: locationData.name,
    region: locationData.region,
    country: locationData.country,
    countryCode: locationData.countryCode,
    language: language
  });

  let dbRecord: any = null;
  
  try {
    // 💾 1단계: DB 기본 레코드 생성 (정확한 지역정보가 있는 경우만)
    console.log(`\n💾 1단계: DB 기본 레코드 생성`);
    console.log(`🌍 전달받은 지역정보:`, {
      region: locationData.region,
      country: locationData.country,
      countryCode: locationData.countryCode
    });

    // 🎯 Google API 기반 정확한 지역 정보 추출 (URL 파라미터가 없을 경우)
    if (!locationData.countryCode || !locationData.region) {
      console.log(`🔍 지역 정보 부족, Google API로 정확한 정보 추출 시도`);
      
      try {
        const { extractAccurateLocationInfo } = await import('@/lib/coordinates/accurate-country-extractor');
        const accurateInfo = await extractAccurateLocationInfo(locationData.name, language);
        
        if (accurateInfo && accurateInfo.countryCode) {
          console.log('✅ Google API 기반 정확한 지역 정보 추출 성공:', {
            placeName: accurateInfo.placeName,
            region: accurateInfo.region,
            country: accurateInfo.country,
            countryCode: accurateInfo.countryCode,
            confidence: (accurateInfo.confidence * 100).toFixed(1) + '%'
          });
          
          // Google API에서 추출한 정확한 정보로 업데이트
          locationData.region = accurateInfo.region;
          locationData.country = accurateInfo.country;
          locationData.countryCode = accurateInfo.countryCode;
          locationData.location = `${accurateInfo.region}, ${accurateInfo.country}`;
          
          console.log('🔄 지역 정보 업데이트 완료:', {
            region: locationData.region,
            country: locationData.country,
            countryCode: locationData.countryCode
          });
        } else {
          console.log('⚠️ Google API 추출 실패, 기존 정보 유지');
        }
      } catch (error) {
        console.error('❌ Google API 추출 중 오류:', error);
      }
    }
    
    const initialData = {
      locationname: locationData.name.toLowerCase().trim(),
      language: language.toLowerCase().trim(),
      location_region: locationData.region, // Google API에서 정확히 추출된 정보
      country_code: locationData.countryCode, // Google API에서 정확히 추출된 정보
      coordinates: [], // 빈 배열로 설정 (나중에 별도 처리)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await withSupabaseRetry(async () => {
      retryStats.recordAttempt('supabase-upsert-initial');
      const result = await supabase
        .from('guides')
        .upsert(initialData, {
          onConflict: 'locationname,language'
        })
        .select()
        .single();
      
      if (result.error) {
        retryStats.recordFailure('supabase-upsert-initial');
        throw result.error;
      }
      
      retryStats.recordSuccess('supabase-upsert-initial');
      return result;
    }, 'DB 기본 레코드 생성');

    if (error) {
      console.error('❌ DB 기본 레코드 생성 실패:', error);
      const errorInfo = SpecializedErrorHandlers.guideGeneration(error, locationData.name);
      errorStats.recordError(errorInfo.type);
      return { success: false, error: errorInfo.userMessage };
    }

    dbRecord = data;
    console.log(`✅ DB 기본 레코드 생성 완료:`, {
      id: dbRecord.id,
      status: dbRecord.status,
      region: dbRecord.location_region,
      country: dbRecord.country_code
    });

    // 🤖 2단계: AI 가이드 생성
    console.log(`\n🤖 2단계: AI 가이드 생성 시작`);
    
    // 🎯 향상된 지역정보 컨텍스트 조회 시도
    let optimizedLocationContext: OptimizedLocationContext | null = null;
    try {
      optimizedLocationContext = getOptimizedAutocompleteData(locationData.name, false);
      if (optimizedLocationContext) {
        console.log(`✅ 향상된 지역정보 컨텍스트 활용: ${optimizedLocationContext.placeName}`);
      } else {
        console.log(`📭 향상된 지역정보 없음, 기본 정보 사용`);
      }
    } catch (error) {
      console.warn('⚠️ 향상된 지역정보 조회 실패:', error);
    }
    
    // 컨텍스트 정보 포함 장소명 생성
    const contextualLocationName = locationData.region !== '미분류' 
      ? `${locationData.name} (${locationData.region}, ${locationData.country})`
      : locationData.name;
    
    const prompt = await createAutonomousGuidePrompt(
      contextualLocationName, 
      language, 
      userProfile,
      '', // parentRegion
      {}, // regionalContext 
      optimizedLocationContext || undefined  // 🎯 새로운 통합 지역정보 컨텍스트 전달
    );
    
    // AI 모델 호출
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
        topK: 40,
        topP: 0.9,
      }
    });

    const { aiResult, text } = await withGoogleAPIRetry(async () => {
      retryStats.recordAttempt('gemini-generate-content');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        retryStats.recordFailure('gemini-generate-content');
        throw new Error('AI 응답이 비어있습니다');
      }
      
      retryStats.recordSuccess('gemini-generate-content');
      return { aiResult: result, text: content };
    }, 'Gemini AI 가이드 생성');
    
    if (!text) {
      throw new Error('AI 응답이 비어있습니다');
    }

    console.log(`✅ AI 생성 완료: ${text.length}자`);
    
    // AI 응답 JSON 파싱
    let guideData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        guideData = JSON.parse(jsonMatch[0]);
        console.log(`✅ JSON 파싱 성공`);
      } else {
        throw new Error('JSON 블록을 찾을 수 없음');
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 기본 구조 사용:', parseError);
      guideData = {
        overview: {
          title: locationData.name,
          location: `${locationData.region}, ${locationData.country}`,
          keyFeatures: `${locationData.name}의 주요 특징`,
          background: `${locationData.name}의 역사적 배경`,
          keyFacts: [],
          visitInfo: {},
          narrativeTheme: ''
        },
        route: { steps: [] },
        realTimeGuide: { chapters: [] }
      };
    }

    // 지역 정보 추가
    guideData.regionalInfo = {
      location_region: locationData.region,
      country_code: locationData.countryCode
    };

    // 🚀 3단계: 병렬 좌표 생성 API 시작 (OptimizedLocationContext 활용)
    console.log(`\n🚀 3단계: 병렬 좌표 생성 API 시작`);
    
    // 🏃‍♂️ 전체 수행 시간 단축을 위한 동시 처리 - 더 빠른 사용자 경험
    let coordinatesPromise: Promise<Response> | null = null;
    
    if (optimizedLocationContext) {
      console.log('🚀 OptimizedLocationContext 활용 병렬 좌표 생성 시작');
      
      // 병렬 방식: locationData와 optimizedLocationContext 직접 전달
      const coordinatesRequestBody = {
        locationData: {
          name: locationData.name,
          region: locationData.region,
          countryCode: locationData.countryCode,
          location_region: locationData.region,
          country_code: locationData.countryCode,
          content: guideData // 생성된 가이드 챕터 정보 전달
        },
        optimizedLocationContext: optimizedLocationContext,
        mode: 'parallel'
      };
      
      coordinatesPromise = withFetchRetry(`${baseUrl}/api/ai/generate-coordinates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coordinatesRequestBody)
      }, '병렬 좌표 생성 API 호출');
      
    } else {
      console.log('❌ OptimizedLocationContext 없음, 좌표 생성 건너뜀');
      console.warn('⚠️ 세션스토리지에 OptimizedLocationContext가 없어 좌표 생성을 건너뜁니다.');
      // 좌표 생성 없이 진행
      coordinatesPromise = null;
    }
    
    // 🎯 좌표 생성 결과 처리 (동기식으로 변경)
    let coordinatesData: any[] = [];
    if (coordinatesPromise) {
      try {
        const coordinatesResponse = await coordinatesPromise;
        const coordinatesResult = await coordinatesResponse.json();
        
        if (coordinatesResult.success) {
          console.log(`✅ 좌표 생성 완료 (${coordinatesResult.mode}): ${coordinatesResult.coordinatesCount || coordinatesResult.coordinates?.length}개 좌표`);
          
          // Parallel 모드에서 DB 업데이트 수행
          if (coordinatesResult.mode === 'parallel' && coordinatesResult.coordinates) {
            coordinatesData = coordinatesResult.coordinates;
            console.log('💾 Parallel 모드: DB coordinates 칼럼 동기 업데이트');
            
            const { error: coordUpdateError } = await supabase
              .from('guides')
              .update({
                coordinates: coordinatesData,
                updated_at: new Date().toISOString()
              })
              .eq('id', dbRecord.id);
            
            if (coordUpdateError) {
              console.error('❌ 좌표 DB 업데이트 실패:', coordUpdateError);
            } else {
              console.log('✅ 좌표 DB 업데이트 성공');
            }
          }
        } else {
          console.error(`❌ 좌표 생성 실패: ${coordinatesResult.error}`);
        }
      } catch (error) {
        console.error('❌ 좌표 API 호출 최종 실패:', error);
      }
    } else {
      console.log('📍 OptimizedLocationContext 없어 좌표 생성 생략됨');
    }

    // 💾 4단계: DB 최종 업데이트 (좌표 생성과 병렬 처리)
    console.log(`\n💾 4단계: DB 최종 업데이트`);
    
    // 🎯 좌표 데이터를 최종 업데이트에 포함
    const finalUpdateData = {
      content: guideData,
      coordinates: coordinatesData, // 동기 처리된 좌표 데이터 포함
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await withSupabaseRetry(async () => {
      retryStats.recordAttempt('supabase-update-final');
      
      const result = await supabase
        .from('guides')
        .update(finalUpdateData)
        .eq('id', dbRecord.id);
      
      if (result.error) {
        retryStats.recordFailure('supabase-update-final');
        throw result.error;
      }
      
      retryStats.recordSuccess('supabase-update-final');
      return result;
    }, 'DB 최종 업데이트');

    if (updateError) {
      console.error('❌ DB 최종 업데이트 실패:', updateError);
      const errorInfo = SpecializedErrorHandlers.guideGeneration(updateError, locationData.name);
      errorStats.recordError(errorInfo.type);
      return { success: false, error: errorInfo.userMessage };
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✅ 가이드 생성 완료 (동기 좌표 처리 포함):`, {
      guideId: dbRecord.id,
      totalTime: `${totalTime}ms`,
      coordinatesGenerated: coordinatesData.length,
      parallelCoordinates: !!optimizedLocationContext,
      region: locationData.region,
      country: locationData.country,
      coordinatesStatus: optimizedLocationContext ? `병렬 모드: ${coordinatesData.length}개 좌표 생성됨` : '좌표 생성 생략됨'
    });
    
    // 📊 재시도 통계 및 에러 통계 로깅
    retryStats.logStats();
    errorStats.logStats();

    return { 
      success: true, 
      data: guideData,
      guideId: dbRecord.id,
      parallelMode: !!optimizedLocationContext,
      coordinatesMode: optimizedLocationContext ? 'parallel' : 'sequential'
    } as GuideGenerationResponse;

  } catch (error) {
    console.error('❌ 순차 가이드 생성 중 오류:', error);
    
    // 🚨 특화된 에러 처리
    const errorInfo = SpecializedErrorHandlers.guideGeneration(error, locationData.name);
    errorStats.recordError(errorInfo.type);
    
    console.error('❌ 오류 상세:', {
      type: errorInfo.type,
      message: errorInfo.message,
      userMessage: errorInfo.userMessage,
      retryable: errorInfo.retryable,
      locationData: locationData,
      language: language,
      dbRecordId: dbRecord?.id,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // 오류 발생 시 DB 레코드 상태 업데이트
    if (dbRecord?.id) {
      try {
        const { error: updateError } = await supabase
          .from('guides')
          .update({
            error_message: errorInfo.message,
            error_type: errorInfo.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', dbRecord.id);
          
        if (updateError) {
          console.error('❌ 오류 상태 DB 업데이트 실패:', updateError);
        } else {
          console.log('✅ 오류 상태 DB 업데이트 완료:', { 
            guideId: dbRecord.id, 
            errorType: errorInfo.type,
            errorMessage: errorInfo.message
          });
        }
      } catch (updateError) {
        console.error('❌ 오류 상태 업데이트 중 예외:', updateError);
      }
    }

    return { 
      success: false, 
      error: errorInfo.userMessage,
      errorType: errorInfo.type,
      retryable: errorInfo.retryable
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.nextUrl);
    console.log('🔧 요청 URL:', request.nextUrl.toString());
    
    // 현재 요청의 호스트 정보 추출
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;
    console.log('🌐 동적 베이스 URL:', baseUrl);
    
    // 요청 본문 안전하게 파싱
    let body;
    try {
      const text = await request.text();
      console.log('🔧 요청 본문 텍스트:', text);
      body = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: '잘못된 JSON 형식입니다.' 
        },
        { status: 400 }
      );
    }
    
    console.log('🔧 요청 본문:', body);
    
    const { 
      locationName, 
      language, 
      userProfile, 
      parentRegion,
      regionalContext,
      locationRegion,
      countryCode
    } = body;
    console.log('🔧 추출된 값:', { locationName, language, userProfile, locationRegion, countryCode });

    // 입력 검증
    if (!locationName || !language) {
      console.error('❌ 입력 검증 실패:', { locationName, language });
      return NextResponse.json(
        { 
          success: false, 
          error: '위치명과 언어는 필수입니다.' 
        },
        { status: 400 }
      );
    }

    console.log(`\n🎯 순차 API 요청 수신:`, {
      locationName,
      language,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    // URL 파라미터에서 지역 정보 추출
    const urlLocationData = extractLocationDataFromRequest(locationName, searchParams);
    
    // 🌍 지역정보 우선순위: body > URL 파라미터
    const locationData = {
      ...urlLocationData,
      region: locationRegion || parentRegion || urlLocationData.region,
      countryCode: countryCode || urlLocationData.countryCode,
      country: regionalContext?.country || urlLocationData.country
    };
    
    // location 필드 업데이트
    if (locationData.region && locationData.country) {
      locationData.location = `${locationData.region}, ${locationData.country}`;
    }
    
    console.log(`🌍 통합된 지역 정보:`, locationData);

    // 순차 가이드 생성 실행
    const result = await createGuideSequentially(locationData, language, baseUrl, userProfile);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        guideId: result.guideId,
        source: 'sequential_api'
      });
    } else {
      // 🚨 결과에 errorType이 있으면 활용
      const statusCode = result.retryable ? 503 : 500;
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          errorType: result.errorType,
          retryable: result.retryable,
          source: 'sequential_api',
          timestamp: new Date().toISOString()
        },
        { 
          status: statusCode,
          headers: {
            'X-Error-Type': result.errorType || 'UNKNOWN',
            'X-Retryable': String(result.retryable || false)
          }
        }
      );
    }

  } catch (error) {
    console.error(`❌ 순차 API 완전 실패:`, error);
    
    // 🚨 최상위 에러 처리
    return createErrorResponse(error, '순차 가이드 생성 API');
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
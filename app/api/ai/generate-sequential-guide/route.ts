import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, getDefaultGeminiModel } from '@/lib/ai/gemini-client';
import { createQuickPrompt } from '@/lib/ai/prompt-utils';
import { supabase } from '@/lib/supabaseClient';
import { ServiceValidators } from '@/lib/env-validator';
import { withSupabaseRetry, withGoogleAPIRetry, withFetchRetry, retryStats } from '@/lib/api-retry';
import { createErrorResponse, SpecializedErrorHandlers, errorStats } from '@/lib/error-handler';
import { OptimizedLocationContext } from '@/types/unified-location';
import { extractChaptersFromContent, SimpleLocationContext } from '@/lib/coordinates/coordinate-utils';
import { 
  generateCoordinatesForGuideCommon,
  extractLocationDataFromRequest as extractLocationCommon,
  extractAccurateLocationInfoCommon
} from '@/lib/coordinates/coordinate-common';

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
 * 🎯 순차 가이드 생성 API - 완전한 가이드 생성
 * 
 * 통합 처리 플로우:
 * 1. DB 기본 레코드 생성 (지역명, 국가 정보)
 * 2. AI 가이드 생성
 * 3. 좌표 생성 (병렬 처리)
 * 4. DB 업데이트 (가이드 컨텐츠 + 좌표 저장)
 */

// 🤖 Gemini 클라이언트는 공통 유틸리티에서 가져옴 (완전한 검증 포함)

/**
 * 🌍 URL 쿼리 파라미터에서 지역 정보 추출 (공통 유틸리티 사용)
 */
function extractLocationDataFromRequest(locationName: string, searchParams: URLSearchParams): EnhancedLocationData {
  const commonResult = extractLocationCommon(locationName, searchParams);
  return {
    name: commonResult.name,
    location: commonResult.location,
    region: commonResult.region,
    country: commonResult.country,
    countryCode: commonResult.countryCode,
    type: commonResult.type
  } as EnhancedLocationData;
}

/**
 * 🌍 레거시 지역 정보 추출 함수 (하위 호환성)
 */
function extractLocationDataFromRequestLegacy(locationName: string, searchParams: URLSearchParams): EnhancedLocationData {
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
 * 🗺️ 좌표 생성 함수 (공통 유틸리티 사용)
 */
async function generateCoordinatesForGuide(
  locationData: EnhancedLocationData,
  guideContent: any
): Promise<any[]> {
  // 공통 유틸리티를 사용하여 좌표 생성
  const standardLocationData = {
    name: locationData.name,
    location: locationData.location,
    region: locationData.region,
    country: locationData.country,
    countryCode: locationData.countryCode,
    type: locationData.type
  };
  
  return await generateCoordinatesForGuideCommon(standardLocationData, guideContent, {
    maxChapters: 5,
    delay: 1000,
    language: 'ko'
  });
}

/**
 * 🗺️ 레거시 좌표 생성 함수 (하위 호환성)
 */
async function generateCoordinatesForGuideLegacy(
  locationData: EnhancedLocationData,
  guideContent: any
): Promise<any[]> {
  try {
    console.log('\n🗺️ 좌표 생성 시작:', locationData.name);
    
    // 챕터 추출
    const chapters = extractChaptersFromContent(guideContent);
    console.log(`📊 ${chapters.length}개 챕터 발견`);
    
    if (chapters.length === 0) {
      console.log('📊 챕터 없음, 기본 좌표 생성');
      // 기본 좌표 생성
      const context: SimpleLocationContext = {
        locationName: locationData.name,
        region: locationData.region || '',
        country: locationData.country || '',
        language: 'ko'
      };
      
      // TODO: findCoordinatesSimple 함수가 누락됨 - 임시 비활성화
      const basicCoordinate = null as { lat: number; lng: number } | null; // await findCoordinatesSimple(locationData.name, context);
      if (basicCoordinate) {
        return [{
          id: 0,
          lat: basicCoordinate.lat,
          lng: basicCoordinate.lng,
          step: 1,
          title: locationData.name,
          chapterId: 0,
          coordinates: {
            lat: basicCoordinate.lat,
            lng: basicCoordinate.lng
          }
        }];
      }
      return [];
    }
    
    const coordinates: any[] = [];
    
    // 각 챕터별 좌표 생성
    for (let i = 0; i < Math.min(chapters.length, 5); i++) {
      const chapter = chapters[i];
      
      try {
        console.log(`🔍 챕터 ${i + 1} 좌표 생성: "${chapter.title}"`);
        
        const context: SimpleLocationContext = {
          locationName: chapter.title,
          region: locationData.region || '',
          country: locationData.country || '',
          language: 'ko'
        };
        
        // TODO: findCoordinatesSimple 함수가 누락됨 - 임시 비활성화
        // 먼저 챕터 제목으로 검색
        let coordinateResult = null as { lat: number; lng: number } | null; // await findCoordinatesSimple(`${locationData.name} ${chapter.title}`, context);
        
        // 실패 시 기본 장소명만으로 검색
        if (!coordinateResult) {
          console.log(`  🔄 기본 장소명으로 재시도: "${locationData.name}"`);
          coordinateResult = null as { lat: number; lng: number } | null; // await findCoordinatesSimple(locationData.name, context);
        }
        
        if (coordinateResult) {
          const chapterCoord = {
            id: i,
            lat: coordinateResult.lat,
            lng: coordinateResult.lng,
            step: i + 1,
            title: chapter.title,
            chapterId: i,
            coordinates: {
              lat: coordinateResult.lat,
              lng: coordinateResult.lng
            }
          };
          
          coordinates.push(chapterCoord);
          console.log(`✅ 챕터 ${i + 1} 좌표 성공: ${coordinateResult.lat}, ${coordinateResult.lng}`);
        } else {
          console.log(`❌ 챕터 ${i + 1} 좌표 실패`);
        }
        
        // API 호출 제한 대기
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ 챕터 ${i + 1} 처리 중 오류:`, error);
      }
    }
    
    console.log(`✅ 좌표 생성 완료: ${coordinates.length}개`);
    return coordinates;
    
  } catch (error) {
    console.error('❌ 좌표 생성 실패:', error);
    return [];
  }
}

/**
 * 🎯 순차 가이드 생성 핵심 함수 - 완전한 가이드 생성
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
    
    // 컨텍스트 정보 포함 장소명 생성
    const contextualLocationName = locationData.region !== '미분류' 
      ? `${locationData.name} (${locationData.region}, ${locationData.country})`
      : locationData.name;
    
    const prompt = await createQuickPrompt(
      contextualLocationName, 
      language,
      userProfile,
      '', // parentRegion
      {} // regionalContext
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

    // 🗺️ 3단계: 좌표 생성
    console.log(`\n🗺️ 3단계: 좌표 생성 시작`);
    const coordinates = await generateCoordinatesForGuide(locationData, guideData);
    console.log(`✅ 좌표 생성 완료: ${coordinates.length}개 좌표`);

    // 💾 4단계: DB 최종 업데이트 (가이드 컨텐츠 + 좌표)
    console.log(`\n💾 4단계: DB 최종 업데이트`);
    
    const finalUpdateData = {
      content: guideData,
      coordinates: coordinates,
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
    console.log(`\n✅ 완전한 가이드 생성 완료:`, {
      guideId: dbRecord.id,
      totalTime: `${totalTime}ms`,
      region: locationData.region,
      country: locationData.country,
      coordinatesCount: coordinates.length,
      status: 'AI 가이드 + 좌표 생성 및 DB 저장 완료'
    });
    
    // 📊 재시도 통계 및 에러 통계 로깅
    retryStats.logStats();
    errorStats.logStats();

    return { 
      success: true, 
      data: guideData,
      guideId: dbRecord.id
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
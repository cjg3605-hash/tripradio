import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { supabase } from '@/lib/supabaseClient';
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
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    throw new Error('Server configuration error: Missing API key');
  }
  
  try {
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
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
): Promise<{ success: boolean; data?: any; error?: any; guideId?: string }> {
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

    const { data, error } = await supabase
      .from('guides')
      .upsert(initialData, {
        onConflict: 'locationname,language'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ DB 기본 레코드 생성 실패:', error);
      return { success: false, error: `DB 생성 실패: ${error.message}` };
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
    
    const prompt = await createAutonomousGuidePrompt(contextualLocationName, language, userProfile);
    
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

    const aiResult = await model.generateContent(prompt);
    const aiResponse = await aiResult.response;
    const text = aiResponse.text();
    
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

    // 🚀 3단계: 좌표 생성 API 시작 (백그라운드, 응답 대기하지 않음)
    console.log(`\n🚀 3단계: 좌표 생성 API 백그라운드 시작`);
    
    // 좌표 생성 API를 즉시 시작 (Promise 반환하지만 await 하지 않음)
    // 동적 라우팅 사용 - 배포 환경에서도 작동하도록 동적 URL 생성
    console.log(`🔗 좌표 API URL: ${baseUrl}/api/ai/generate-coordinates`);
    
    fetch(`${baseUrl}/api/ai/generate-coordinates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guideId: dbRecord.id })
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log(`✅ 좌표 생성 완료: ${result.coordinatesCount}개 좌표`);
      } else {
        console.error(`❌ 좌표 생성 실패: ${result.error}`);
      }
    })
    .catch(error => {
      console.error('❌ 좌표 API 호출 실패:', error);
    });

    // 💾 3단계: DB 최종 업데이트 (좌표 생성과 병렬 처리)
    console.log(`\n💾 3단계: DB 최종 업데이트`);
    
    const finalUpdateData = {
      content: guideData,
      coordinates: [], // 좌표는 백그라운드에서 별도 처리
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('guides')
      .update(finalUpdateData)
      .eq('id', dbRecord.id);

    if (updateError) {
      console.error('❌ DB 최종 업데이트 실패:', updateError);
      return { success: false, error: `DB 업데이트 실패: ${updateError.message}` };
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✅ 간단화된 가이드 생성 완료:`, {
      guideId: dbRecord.id,
      totalTime: `${totalTime}ms`,
      region: locationData.region,
      country: locationData.country,
      coordinatesStatus: '백그라운드에서 생성 중'
    });

    return { 
      success: true, 
      data: guideData,
      guideId: dbRecord.id
    };

  } catch (error) {
    console.error('❌ 순차 가이드 생성 중 오류:', error);
    console.error('❌ 오류 상세:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      locationData: locationData,
      language: language,
      dbRecordId: dbRecord?.id
    });
    
    // 오류 발생 시 DB 레코드 상태 업데이트
    if (dbRecord?.id) {
      try {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const { error: updateError } = await supabase
          .from('guides')
          .update({
            error_message: errorMessage,
            updated_at: new Date().toISOString()
          })
          .eq('id', dbRecord.id);
          
        if (updateError) {
          console.error('❌ 오류 상태 DB 업데이트 실패:', updateError);
        } else {
          console.log('✅ 오류 상태 DB 업데이트 완료:', { guideId: dbRecord.id, errorMessage });
        }
      } catch (updateError) {
        console.error('❌ 오류 상태 업데이트 중 예외:', updateError);
      }
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
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
    
    const { locationName, language, userProfile } = body;
    console.log('🔧 추출된 값:', { locationName, language, userProfile });

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
    const locationData = extractLocationDataFromRequest(locationName, searchParams);
    
    console.log(`🌍 추출된 지역 정보:`, locationData);

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
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          source: 'sequential_api'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error(`❌ 순차 API 완전 실패:`, error);
    console.error('❌ API 요청 상세:', {
      url: request.nextUrl.toString(),
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    });
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `순차 가이드 생성 실패: ${errorMessage}`,
        source: 'sequential_api',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
          cause: error instanceof Error ? error.cause : undefined
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
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';

/**
 * 🎯 별도 좌표 생성 API
 * 
 * 3단계 가이드 생성 완료 후 호출되는 독립적인 좌표 생성 시스템
 * - 완성된 가이드 데이터에서 챕터 정보 추출
 * - 지역 컨텍스트와 결합하여 정확한 Plus Code 검색
 * - coordinates 칼럼만 업데이트
 */

interface ChapterCoordinate {
  id: number;
  lat: number;
  lng: number;
  step: number;
  title: string;
  chapterId: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * 🤖 지역 컨텍스트 통합 AI Plus Code 검색
 */
async function getCoordinateWithContext(
  chapterLocation: string,
  baseLocationName: string,
  region: string,
  country: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return null;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // 지역 컨텍스트 통합 Plus Code 프롬프트
    const coordinatePrompt = `
Please find the exact GPS coordinates using Plus Code system for this specific location:

Main Location: "${baseLocationName}"
Specific Area: "${chapterLocation}"
Region: "${region}"
Country: "${country}"

FULL CONTEXT: "${baseLocationName} ${chapterLocation}, ${region}, ${country}"

IMPORTANT INSTRUCTIONS:
- Search for the Plus Code of this specific area within the main location
- Use the regional context to avoid confusion with similar named places in other regions
- Be as precise as possible for the exact coordinates
- If the specific area name is generic (like "입구", "구간"), interpret it as part of the main location

Examples of what I need:
- For "만리장성 입구, 베이징, 중국" → Find the main entrance coordinates of Great Wall in Beijing
- For "만리장성 성벽 1구간, 베이징, 중국" → Find coordinates of the first wall section in Beijing area

Respond ONLY in this exact format:
LAT: [latitude with 4-6 decimal places]
LNG: [longitude with 4-6 decimal places]

Example:
LAT: 40.431907
LNG: 116.570374
`;

    console.log(`🤖 지역 컨텍스트 Plus Code 요청: "${baseLocationName} ${chapterLocation}, ${region}, ${country}"`);
    
    const result = await model.generateContent(coordinatePrompt);
    const response = result.response.text();
    
    console.log(`🤖 AI Plus Code 응답: ${response.trim()}`);
    
    // 좌표 추출
    const latMatch = response.match(/LAT:\s*([-+]?\d{1,3}\.?\d*)/i);
    const lngMatch = response.match(/LNG:\s*([-+]?\d{1,3}\.?\d*)/i);
    
    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      // 좌표 유효성 검증
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log(`✅ 지역 컨텍스트 Plus Code 성공: ${lat}, ${lng}`);
        return { lat, lng };
      } else {
        console.log(`❌ 좌표 범위 초과: lat=${lat}, lng=${lng}`);
      }
    } else {
      console.log(`❌ 좌표 파싱 실패: ${response.trim()}`);
    }
    
    return null;
  } catch (error) {
    console.error('❌ 지역 컨텍스트 Plus Code 검색 실패:', error);
    return null;
  }
}

/**
 * 🎯 가이드 데이터에서 챕터 추출 및 좌표 생성
 */
async function generateCoordinatesFromGuide(guideData: any, locationInfo: any): Promise<ChapterCoordinate[]> {
  const coordinates: ChapterCoordinate[] = [];
  
  try {
    console.log('🔍 가이드 데이터에서 챕터 정보 추출 시작');
    
    // AI 가이드 realTimeGuide.chapters에서 실제 장소명 추출
    let chapters: any[] = [];
    
    // 여러 경로에서 realTimeGuide.chapters 찾기
    const realTimeGuide = guideData?.realTimeGuide || guideData?.content?.realTimeGuide;
    
    if (realTimeGuide?.chapters && Array.isArray(realTimeGuide.chapters)) {
      chapters = realTimeGuide.chapters.map((chapter: any) => ({
        id: chapter.id || 0,
        title: chapter.title || `챕터 ${chapter.id + 1}`,
        location: chapter.title || `구역 ${chapter.id + 1}` // chapters의 title을 location으로 사용
      }));
      
      console.log('✅ realTimeGuide.chapters 발견:', chapters.length, '개 챕터');
    }
    
    // 챕터가 없으면 기본 챕터 생성
    if (chapters.length === 0) {
      console.log('📊 realTimeGuide.chapters 없음, 기본 챕터 생성');
      chapters = [
        { id: 0, title: `${locationInfo.locationname} 입구`, location: '입구' },
        { id: 1, title: `${locationInfo.locationname} 주요 구역`, location: '주요 구역' },
        { id: 2, title: `${locationInfo.locationname} 전망대`, location: '전망대' }
      ];
    }
    
    console.log(`📊 ${chapters.length}개 챕터 발견:`, chapters.map(c => c.location).join(', '));
    
    // 각 챕터별 좌표 생성
    for (let i = 0; i < Math.min(chapters.length, 5); i++) { // 최대 5개 챕터
      const chapter = chapters[i];
      
      try {
        console.log(`\n🔍 챕터 ${i + 1} 좌표 생성: "${chapter.location}"`);
        
        // 지역 컨텍스트와 함께 Plus Code 검색
        const coordinateResult = await getCoordinateWithContext(
          chapter.location,
          locationInfo.locationname,
          locationInfo.location_region,
          locationInfo.country_code === 'CN' ? '중국' : 
          locationInfo.country_code === 'KR' ? '대한민국' : '기타'
        );
        
        if (coordinateResult) {
          const chapterCoord: ChapterCoordinate = {
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
          
          // 기본값 사용
          const offset = i * 0.001;
          const defaultLat = getDefaultLatByCountry(locationInfo.country_code) + offset;
          const defaultLng = getDefaultLngByCountry(locationInfo.country_code) + offset;
          
          coordinates.push({
            id: i,
            lat: defaultLat,
            lng: defaultLng,
            step: i + 1,
            title: chapter.title,
            chapterId: i,
            coordinates: {
              lat: defaultLat,
              lng: defaultLng
            }
          });
        }
        
        // API 호출 제한 대기
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`❌ 챕터 ${i + 1} 처리 중 오류:`, error);
      }
    }
    
    console.log(`✅ 좌표 생성 완료: ${coordinates.length}개 좌표`);
    return coordinates;
    
  } catch (error) {
    console.error('❌ 가이드 데이터 처리 실패:', error);
    return [];
  }
}

/**
 * 🌍 국가별 기본 좌표
 */
function getDefaultLatByCountry(countryCode: string): number {
  const defaults: { [key: string]: number } = {
    'CN': 39.9042, // 베이징
    'KR': 37.5665, // 서울
    'JP': 35.6762, // 도쿄
    'US': 39.8283, // 미국 중심부
  };
  return defaults[countryCode] || defaults['CN'];
}

function getDefaultLngByCountry(countryCode: string): number {
  const defaults: { [key: string]: number } = {
    'CN': 116.4074, // 베이징
    'KR': 126.9780, // 서울
    'JP': 139.6503, // 도쿄
    'US': -98.5795, // 미국 중심부
  };
  return defaults[countryCode] || defaults['CN'];
}

/**
 * 🎯 메인 API 핸들러
 */
export async function POST(request: NextRequest) {
  try {
    const { guideId } = await request.json();
    
    if (!guideId) {
      return NextResponse.json(
        { success: false, error: 'guideId는 필수입니다.' },
        { status: 400 }
      );
    }
    
    console.log(`\n🎯 좌표 생성 API 시작: guideId=${guideId}`);
    
    // 1단계: DB에서 가이드 데이터 조회
    const { data: guideRecord, error: fetchError } = await supabase
      .from('guides')
      .select('*')
      .eq('id', guideId)
      .single();
    
    if (fetchError || !guideRecord) {
      console.error('❌ 가이드 조회 실패:', fetchError);
      return NextResponse.json(
        { success: false, error: `가이드를 찾을 수 없습니다: ${fetchError?.message}` },
        { status: 404 }
      );
    }
    
    console.log('✅ 가이드 데이터 조회 완료:', {
      locationname: guideRecord.locationname,
      region: guideRecord.location_region,
      country: guideRecord.country_code
    });
    
    // 2단계: 좌표 생성
    const startTime = Date.now();
    const coordinates = await generateCoordinatesFromGuide(guideRecord.content, guideRecord);
    const generationTime = Date.now() - startTime;
    
    if (coordinates.length === 0) {
      return NextResponse.json(
        { success: false, error: '좌표 생성에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 3단계: DB 업데이트
    console.log('\n💾 coordinates 칼럼 업데이트 시작');
    
    const { error: updateError } = await supabase
      .from('guides')
      .update({
        coordinates: coordinates,
        updated_at: new Date().toISOString()
      })
      .eq('id', guideId);
    
    if (updateError) {
      console.error('❌ 좌표 DB 업데이트 실패:', updateError);
      return NextResponse.json(
        { success: false, error: `DB 업데이트 실패: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    console.log(`\n✅ 좌표 생성 API 완료:`, {
      guideId: guideId,
      coordinatesCount: coordinates.length,
      generationTime: `${generationTime}ms`,
      status: 'coordinates updated successfully'
    });
    
    return NextResponse.json({
      success: true,
      coordinates: coordinates,
      generationTime: generationTime,
      message: `${coordinates.length}개 좌표가 성공적으로 생성되었습니다.`
    });
    
  } catch (error) {
    console.error('❌ 좌표 생성 API 완전 실패:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: `좌표 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined
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
import { NextRequest, NextResponse } from 'next/server';
import { findCoordinatesSimple, extractChaptersFromContent, SimpleLocationContext } from '@/lib/coordinates/coordinate-utils';
import { OptimizedLocationContext } from '@/types/unified-location';

export const runtime = 'nodejs';

/**
 * 🎯 좌표 생성 API - Parallel 모드 전용
 * 
 * SessionStorage의 OptimizedLocationContext를 활용한 고속 좌표 생성
 * - Geocoding API 직접 활용으로 정확한 좌표 생성
 * - 1회 API 호출로 효율적인 처리
 * - 검색 실패시 명확한 에러 반환
 */

interface ChapterInfo {
  id: number;
  title: string;
  location?: string;
  description?: string;
  type?: string;
  narrative?: string;
}

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
 * 🎯 Geocoding API 직접 좌표 검색
 */
async function getCoordinateWithGeocoding(
  chapterLocation: string,
  baseLocationName: string,
  region: string,
  country: string
): Promise<{ lat: number; lng: number } | null> {
  
  console.log(`🔍 Geocoding API 직접 검색: "${baseLocationName} ${chapterLocation}"`);
  
  // 지역 컨텍스트 구성
  const context: SimpleLocationContext = {
    locationName: `${baseLocationName} ${chapterLocation}`,
    region: region,
    country: country === 'CHN' ? 'China' : 
             country === 'KOR' ? 'South Korea' : 
             country === 'JPN' ? 'Japan' :
             country === 'USA' ? 'United States' :
             country === 'FRA' ? 'France' :
             country === 'DEU' ? 'Germany' :
             country === 'GBR' ? 'United Kingdom' :
             country === 'ITA' ? 'Italy' :
             country === 'ESP' ? 'Spain' : country,
    language: country === 'KOR' ? 'ko' : 
              country === 'JPN' ? 'ja' :
              country === 'CHN' ? 'zh' :
              country === 'FRA' ? 'fr' :
              country === 'DEU' ? 'de' :
              country === 'ESP' ? 'es' :
              country === 'ITA' ? 'it' : 'en'
  };
  
  // 단순화된 좌표 검색 사용
  const coordinates = await findCoordinatesSimple(`${baseLocationName} ${chapterLocation}`, context);
  
  if (coordinates) {
    console.log(`✅ Geocoding 검색 성공: ${coordinates.lat}, ${coordinates.lng}`);
    return coordinates;
  } else {
    console.log(`❌ Geocoding 검색 실패: ${baseLocationName} ${chapterLocation}`);
    return null;
  }
}

/**
 * 🚀 OptimizedLocationContext를 활용한 고속 좌표 생성 (병렬 처리용)
 */
async function generateCoordinatesFromOptimizedContext(
  locationInfo: any, 
  optimizedContext: OptimizedLocationContext,
  chaptersContent?: any
): Promise<ChapterCoordinate[]> {
  const coordinates: ChapterCoordinate[] = [];
  
  try {
    console.log('🚀 OptimizedLocationContext 기반 좌표 생성 시작');
    console.log('🎯 활용 가능한 컨텍스트:', {
      placeName: optimizedContext.placeName,
      region: optimizedContext.location_region,
      country: optimizedContext.country_code,
      hasFactualContext: !!optimizedContext.factual_context,
      hasLocalContext: !!optimizedContext.local_context
    });
    
    // 챕터 정보가 있다면 사용, 없다면 기본 챕터 생성
    let chapters: ChapterInfo[] = [];
    if (chaptersContent) {
      chapters = extractChaptersFromContent(chaptersContent);
    }
    
    if (chapters.length === 0) {
      console.log('📊 챕터 없음, OptimizedContext 기반 기본 챕터 생성');
      // OptimizedLocationContext의 정보를 활용한 스마트 기본 챕터 생성
      const contextualChapters: ChapterInfo[] = [
        { 
          id: 0, 
          title: optimizedContext.local_context?.entrance_location || `${optimizedContext.placeName} 입구`,
          location: '입구' 
        },
        { 
          id: 1, 
          title: optimizedContext.local_context?.main_area || `${optimizedContext.placeName} 주요 구역`, 
          location: '주요 구역' 
        }
      ];
      
      // 추가 관심 지점이 있다면 포함
      if (optimizedContext.local_context?.nearby_attractions) {
        contextualChapters.push({
          id: 2,
          title: `${optimizedContext.placeName} 주변 명소`,
          location: '주변 명소'
        });
      }
      
      chapters = chapters.concat(contextualChapters);
    }
    
    console.log(`📊 ${chapters.length}개 챕터 발견:`, chapters.map(c => c.title).join(', '));
    
    // 각 챕터별 좌표 생성 (OptimizedContext의 정확한 지역정보 활용)
    for (let i = 0; i < Math.min(chapters.length, 5); i++) {
      const chapter = chapters[i];
      
      try {
        console.log(`\n🔍 챕터 ${i + 1} 좌표 생성: "${chapter.title}"`);
        
        // OptimizedLocationContext의 정확한 지역정보로 검색
        const coordinateResult = await getCoordinateWithGeocoding(
          chapter.title,
          optimizedContext.placeName,
          optimizedContext.location_region,
          optimizedContext.country_code
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
          console.log(`❌ 챕터 ${i + 1} 좌표 실패 - 검색 결과 없음`);
        }
        
        // API 호출 제한 대기
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ 챕터 ${i + 1} 처리 중 오류:`, error);
      }
    }
    
    console.log(`✅ OptimizedContext 기반 좌표 생성 완료: ${coordinates.length}개 좌표`);
    return coordinates;
    
  } catch (error) {
    console.error('❌ OptimizedContext 기반 좌표 생성 실패:', error);
    return [];
  }
}


/**
 * 🎯 메인 API 핸들러 (Parallel 모드 전용)
 */
export async function POST(request: NextRequest) {
  let optimizedLocationContext: OptimizedLocationContext | undefined;
  let locationData: any = null;
  
  try {
    const requestBody = await request.json();
    ({ locationData, optimizedLocationContext } = requestBody);
    
    // 🎯 locationData와 optimizedLocationContext 필수 확인
    if (!locationData || !optimizedLocationContext) {
      return NextResponse.json(
        { success: false, error: 'locationData와 optimizedLocationContext가 모두 필요합니다.' },
        { status: 400 }
      );
    }
    
    console.log(`\n🎯 좌표 생성 API 시작 (Parallel 모드): ${locationData.name}`);
    
    // 📊 locationData 원본 데이터 디버깅
    console.log('📊 locationData 구조:', {
      name: locationData.name,
      region: locationData.region,
      location_region: locationData.location_region,
      country: locationData.country,
      countryCode: locationData.countryCode,
      country_code: locationData.country_code
    });
    
    console.log('✅ OptimizedLocationContext 데이터 확인:', {
      placeName: optimizedLocationContext.placeName,
      region: optimizedLocationContext.location_region,
      country: optimizedLocationContext.country_code,
      hasFactualContext: !!optimizedLocationContext.factual_context
    });
    
    // 2단계: OptimizedLocationContext로 고속 좌표 생성
    const startTime = Date.now();
    console.log('🚀 OptimizedLocationContext 활용한 고속 좌표 생성 시작');
    
    const coordinates = await generateCoordinatesFromOptimizedContext(
      locationData, 
      optimizedLocationContext,
      locationData?.content
    );
    
    const generationTime = Date.now() - startTime;
    
    if (coordinates.length === 0) {
      console.log('❌ 모든 챕터 좌표 검색 실패');
      return NextResponse.json(
        { 
          success: false, 
          error: '좌표 검색에 실패했습니다. 장소명이 정확한지 확인해주세요.',
          suggestion: 'Google Maps에서 해당 장소를 검색해보시고, 정확한 장소명으로 다시 시도해주세요.'
        },
        { status: 404 }
      );
    }
    
    console.log(`\n✅ 좌표 생성 API 완료:`, {
      mode: 'parallel',
      locationName: locationData.name,
      coordinatesCount: coordinates.length,
      generationTime: `${generationTime}ms`,
      status: 'OptimizedContext 기반 고속 생성 완료'
    });
    
    return NextResponse.json({
      success: true,
      coordinates: coordinates,
      generationTime: generationTime,
      mode: 'parallel',
      method: 'OptimizedContext 고속 생성',
      message: `${coordinates.length}개 좌표가 성공적으로 생성되었습니다.`,
      optimizedContextUsed: true
    });
    
  } catch (error) {
    console.error('❌ 좌표 생성 API 실패:', error);
    
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
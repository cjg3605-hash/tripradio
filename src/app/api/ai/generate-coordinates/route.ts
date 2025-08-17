import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { findCoordinatesSimple, generateCoordinatesArray, extractChaptersFromContent, SimpleLocationContext } from '@/lib/coordinates/coordinate-utils';
import { OptimizedLocationContext } from '@/types/unified-location';

export const runtime = 'nodejs';

/**
 * 🎯 단순화된 좌표 생성 API - 병렬 처리 지원
 * 
 * 두 가지 입력 방식 지원:
 * 1. guideId 기반 (기존 방식) - DB에서 가이드 데이터 조회
 * 2. locationData 직접 입력 (신규) - SessionStorage 데이터 활용
 * 
 * Geocoding API 직접 활용으로 정확한 좌표 생성
 * - Plus Code 복잡성 완전 제거
 * - 부정확한 폴백 시스템 제거
 * - 검색 실패시 솔직하게 null 반환
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
 * 🎯 가이드 데이터에서 챕터 추출 및 좌표 생성 (기존 방식)
 */
async function generateCoordinatesFromGuide(guideData: any, locationInfo: any): Promise<ChapterCoordinate[]> {
  const coordinates: ChapterCoordinate[] = [];
  
  try {
    console.log('🔍 가이드 데이터에서 챕터 정보 추출 시작');
    
    // content에서 챕터 추출
    const chapters = extractChaptersFromContent(guideData.content);
    
    if (chapters.length === 0) {
      console.log('📊 챕터 없음, 기본 챕터 생성');
      // 기본 챕터 생성
      const defaultChapters = [
        { id: 0, title: `${locationInfo.locationname} 입구`, location: '입구' },
        { id: 1, title: `${locationInfo.locationname} 주요 구역`, location: '주요 구역' },
        { id: 2, title: `${locationInfo.locationname} 전망대`, location: '전망대' }
      ];
      chapters.push(...defaultChapters);
    }
    
    console.log(`📊 ${chapters.length}개 챕터 발견:`, chapters.map(c => c.title).join(', '));
    
    // 각 챕터별 좌표 생성
    for (let i = 0; i < Math.min(chapters.length, 5); i++) { // 최대 5개 챕터
      const chapter = chapters[i];
      
      try {
        console.log(`\n🔍 챕터 ${i + 1} 좌표 생성: "${chapter.title}"`);
        
        // Geocoding API 직접 검색
        const coordinateResult = await getCoordinateWithGeocoding(
          chapter.title,
          locationInfo.locationname,
          locationInfo.location_region,
          locationInfo.country_code
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
          // 부정확한 기본값 대신 해당 챕터는 스킵
        }
        
        // API 호출 제한 대기
        if (i < chapters.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ 챕터 ${i + 1} 처리 중 오류:`, error);
      }
    }
    
    console.log(`✅ 기존 방식 좌표 생성 완료: ${coordinates.length}개 좌표`);
    return coordinates;
    
  } catch (error) {
    console.error('❌ 가이드 데이터 처리 실패:', error);
    return [];
  }
}

/**
 * 🎯 메인 API 핸들러
 */
export async function POST(request: NextRequest) {
  // 바깥에 변수 선언
  let guideRecord: any = null;
  let processingMode = 'unknown';
  let optimizedLocationContext: OptimizedLocationContext | undefined;
  let locationData: any = null;
  let guideId: string | undefined;
  
  try {
    const requestBody = await request.json();
    ({ guideId, locationData, optimizedLocationContext, mode: processingMode } = requestBody);
    
    // 기본값 설정
    processingMode = processingMode || 'unknown';
    
    // 🎯 두 가지 입력 방식 지원
    if (!guideId && !locationData) {
      return NextResponse.json(
        { success: false, error: 'guideId 또는 locationData 중 하나는 필수입니다.' },
        { status: 400 }
      );
    }
    
    if (guideId) {
      // 기존 방식: guideId로 DB 조회
      console.log(`\n🎯 좌표 생성 API 시작 (guideId 방식): guideId=${guideId}`);
      processingMode = 'sequential';
      
      const { data, error: fetchError } = await supabase
        .from('guides')
        .select('*')
        .eq('id', guideId)
        .single();
      
      if (fetchError || !data) {
        console.error('❌ 가이드 조회 실패:', fetchError);
        return NextResponse.json(
          { success: false, error: `가이드를 찾을 수 없습니다: ${fetchError?.message}` },
          { status: 404 }
        );
      }
      
      guideRecord = data;
    } else if (locationData) {
      // 신규 방식: locationData 직접 입력 (병렬 처리용)
      console.log(`\n🎯 좌표 생성 API 시작 (병렬 방식): ${locationData.name}`);
      processingMode = 'parallel';
      
      // locationData를 guideRecord 형태로 변환
      guideRecord = {
        id: 'temp-parallel-processing',
        locationname: locationData.name,
        location_region: locationData.region || locationData.location_region,
        country_code: locationData.countryCode || locationData.country_code,
        content: locationData.content || null // 챕터 정보가 있다면 사용
      };
    }
    
    console.log('✅ 지역 데이터 준비 완료:', {
      mode: processingMode,
      locationname: guideRecord.locationname,
      region: guideRecord.location_region,
      country: guideRecord.country_code,
      hasOptimizedContext: !!optimizedLocationContext
    });
    
    // 2단계: Geocoding API로 좌표 생성
    const startTime = Date.now();
    let coordinates;
    
    if (processingMode === 'parallel' && optimizedLocationContext) {
      // 병렬 처리: OptimizedLocationContext 활용
      console.log('🚀 병렬 모드: OptimizedLocationContext 활용한 고속 좌표 생성');
      coordinates = await generateCoordinatesFromOptimizedContext(
        guideRecord, 
        optimizedLocationContext,
        locationData?.content
      );
    } else {
      // 순차 처리: 기존 방식
      console.log('🔄 순차 모드: 기존 가이드 기반 좌표 생성');
      coordinates = await generateCoordinatesFromGuide(guideRecord, guideRecord);
    }
    
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
    
    // 3단계: DB 업데이트 (병렬 모드에서는 guideId가 있을 때만)
    let updateError: any = null;
    
    if (processingMode === 'sequential' && guideId) {
      console.log('\n💾 coordinates 칼럼 업데이트 시작');
      
      const updateResult = await supabase
        .from('guides')
        .update({
          coordinates: coordinates,
          updated_at: new Date().toISOString()
        })
        .eq('id', guideId);
      
      updateError = updateResult.error || null;
    } else if (processingMode === 'parallel') {
      console.log('\n📦 병렬 모드: 좌표 생성 완료, DB 업데이트는 별도 처리');
    }
    
    if (updateError) {
      console.error('❌ 좌표 DB 업데이트 실패:', updateError);
      return NextResponse.json(
        { success: false, error: `DB 업데이트 실패: ${updateError?.message || '알 수 없는 오류'}` },
        { status: 500 }
      );
    }
    
    console.log(`\n✅ 좌표 생성 API 완료:`, {
      mode: processingMode,
      guideId: guideId || 'parallel-mode',
      coordinatesCount: coordinates.length,
      generationTime: `${generationTime}ms`,
      optimizedContext: !!optimizedLocationContext,
      status: optimizedLocationContext ? 'OptimizedContext 기반 고속 생성' : 'Geocoding API 직접 검색 성공'
    });
    
    return NextResponse.json({
      success: true,
      coordinates: coordinates,
      generationTime: generationTime,
      mode: processingMode,
      method: optimizedLocationContext ? 'OptimizedContext 고속 생성' : 'Geocoding API 직접 검색',
      message: `${coordinates.length}개 좌표가 성공적으로 생성되었습니다.`,
      optimizedContextUsed: !!optimizedLocationContext
    });
    
  } catch (error) {
    console.error('❌ 좌표 생성 API 완전 실패:', error);
    
    // 오류 디버깅 정보 추가
    const debugInfo = {
      mode: processingMode || 'unknown',
      hasOptimizedContext: !!optimizedLocationContext,
      hasLocationData: !!locationData,
      hasGuideId: !!guideId,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(
      { 
        success: false, 
        error: `좌표 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        debug: debugInfo,
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
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { findCoordinatesSimple, generateCoordinatesArray, extractChaptersFromContent, SimpleLocationContext } from '@/lib/coordinates/coordinate-utils';

export const runtime = 'nodejs';

/**
 * 🎯 단순화된 좌표 생성 API
 * 
 * Geocoding API 직접 활용으로 정확한 좌표 생성
 * - Plus Code 복잡성 완전 제거
 * - 부정확한 폴백 시스템 제거
 * - 검색 실패시 솔직하게 null 반환
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
    country: country === 'CN' ? 'China' : 
             country === 'KR' ? 'South Korea' : 
             country === 'JP' ? 'Japan' :
             country === 'US' ? 'United States' : country,
    language: country === 'KR' ? 'ko' : 'en'
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
 * 🎯 가이드 데이터에서 챕터 추출 및 좌표 생성
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
    
    console.log(`✅ 좌표 생성 완료: ${coordinates.length}개 좌표`);
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
  try {
    const { guideId } = await request.json();
    
    if (!guideId) {
      return NextResponse.json(
        { success: false, error: 'guideId는 필수입니다.' },
        { status: 400 }
      );
    }
    
    console.log(`\n🎯 단순화된 좌표 생성 API 시작: guideId=${guideId}`);
    
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
    
    // 2단계: Geocoding API로 좌표 생성
    const startTime = Date.now();
    const coordinates = await generateCoordinatesFromGuide(guideRecord, guideRecord);
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
    
    console.log(`\n✅ 단순화된 좌표 생성 API 완료:`, {
      guideId: guideId,
      coordinatesCount: coordinates.length,
      generationTime: `${generationTime}ms`,
      status: 'Geocoding API 직접 검색 성공'
    });
    
    return NextResponse.json({
      success: true,
      coordinates: coordinates,
      generationTime: generationTime,
      method: 'Geocoding API 직접 검색',
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
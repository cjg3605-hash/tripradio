// src/app/api/coordinates/migrate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { 
  findCoordinatesInOrder, 
  generateCoordinatesArray, 
  extractChaptersFromContent,
  LocationContext 
} from '@/lib/coordinates/coordinate-utils';

export const runtime = 'nodejs';

/**
 * 🌍 완전 동적 지역 정보 추출 (Google Places API 우선)
 */
async function extractRegionalInfo(locationName: string, parentRegion?: string, regionalContext?: any): Promise<{
  location_region: string | null;
  country_code: string | null;
}> {
  console.log(`🌍 동적 지역 정보 추출 시작: "${locationName}"`);
  console.log(`🔍 입력 파라미터:`, { 
    parentRegion: parentRegion || 'null', 
    regionalContext: regionalContext || 'null' 
  });
  
  // 1. 우선적으로 Google Places API로 최신 정보 조회
  console.log(`🚀 Google Places API 호출 시작...`);
  const dynamicInfo = await getRegionalInfoFromGooglePlaces(locationName);
  console.log(`📥 Google Places API 결과:`, dynamicInfo);
  
  // Google Places API에서 완전한 정보를 얻었다면 즉시 반환
  if (dynamicInfo.location_region && dynamicInfo.country_code) {
    console.log(`✅ Google Places API로 완전한 지역 정보 획득: ${dynamicInfo.location_region}, ${dynamicInfo.country_code}`);
    return dynamicInfo;
  }
  
  // 2. Google Places API 결과가 불완전한 경우, 기존 context 보완
  if (parentRegion || regionalContext) {
    console.log(`🔄 기존 컨텍스트로 불완전한 정보 보완 시도`);
    
    const region = dynamicInfo.location_region || parentRegion || regionalContext?.region || regionalContext?.parentRegion;
    const country = dynamicInfo.country_code || regionalContext?.country || regionalContext?.countryCode;
    
    if (region && !country) {
      // 지역은 있지만 국가가 없는 경우, 지역으로부터 국가 추정
      const inferredCountry = inferCountryCodeFromRegion(region);
      console.log(`🔧 지역→국가 추정: ${region} → ${inferredCountry}`);
      return {
        location_region: region,
        country_code: inferredCountry
      };
    }
    
    if (region || country) {
      console.log(`🔧 컨텍스트 보완 결과: ${region}, ${country}`);
      return {
        location_region: region,
        country_code: country
      };
    }
  }
  
  // 3. 모든 방법이 실패한 경우, Google Places API의 부분 결과라도 반환
  console.log(`⚠️ 부분적 동적 정보 사용: ${dynamicInfo.location_region}, ${dynamicInfo.country_code}`);
  return dynamicInfo;
}

/**
 * 🌍 지역명으로부터 국가 코드 추정
 */
function inferCountryCodeFromRegion(region: string): string {
  const regionLower = region.toLowerCase();
  
  // 한국 지역
  if (regionLower.includes('서울') || regionLower.includes('부산') || regionLower.includes('제주') || 
      regionLower.includes('경기') || regionLower.includes('강원') || regionLower.includes('충청') ||
      regionLower.includes('전라') || regionLower.includes('경상') || regionLower.includes('korea')) {
    return 'KR';
  }
  
  // 프랑스
  if (regionLower.includes('paris') || regionLower.includes('파리') || regionLower.includes('france')) {
    return 'FR';
  }
  
  // 영국
  if (regionLower.includes('london') || regionLower.includes('런던') || regionLower.includes('england') || regionLower.includes('uk')) {
    return 'GB';
  }
  
  // 이탈리아
  if (regionLower.includes('rome') || regionLower.includes('로마') || regionLower.includes('italy')) {
    return 'IT';
  }
  
  // 미국
  if (regionLower.includes('new york') || regionLower.includes('뉴욕') || regionLower.includes('california') || regionLower.includes('usa')) {
    return 'US';
  }
  
  // 일본
  if (regionLower.includes('tokyo') || regionLower.includes('도쿄') || regionLower.includes('japan')) {
    return 'JP';
  }
  
  // 중국
  if (regionLower.includes('beijing') || regionLower.includes('베이징') || regionLower.includes('china')) {
    return 'CN';
  }
  
  // 기본값: 한국
  return 'KR';
}

/**
 * 🌍 지역별 최적 언어 결정
 */
function getOptimalLanguageForLocation(locationName: string): string {
  const name = locationName.toLowerCase();
  
  // 한국 관련 키워드 감지
  const koreanKeywords = [
    '서울', '부산', '제주', '경주', '인천', '대전', '대구', '광주', '울산',
    '강릉', '전주', '안동', '여수', '경기', '강원', '충청', '전라', '경상',
    '궁', '사찰', '절', '한옥', '전통', '문화재', '민속', '국립공원',
    '구', '동', '시', '도', '군'
  ];
  
  const hasKoreanKeyword = koreanKeywords.some(keyword => name.includes(keyword));
  const hasKoreanChar = /[가-힣]/.test(locationName);
  
  if (hasKoreanKeyword || hasKoreanChar) {
    return 'ko';  // 한국어
  }
  
  return 'en';  // 영어 (기본값)
}

/**
 * 🌍 동적 지역 정보 추출 (오직 Google Places API 활용)
 */
async function getRegionalInfoFromGooglePlaces(locationName: string): Promise<{
  location_region: string | null;
  country_code: string | null;
}> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.log('❌ Google Places API 키 없음 - 지역 정보 추출 불가');
      return { location_region: null, country_code: null };
    }

    // 🌍 지역별 최적 언어 결정
    const optimalLanguage = getOptimalLanguageForLocation(locationName);
    console.log(`🌍 Google Places API로 동적 지역 정보 조회: ${locationName} (언어: ${optimalLanguage})`);

    // 1단계: Find Place from Text로 장소 검색
    const searchParams = new URLSearchParams({
      input: locationName,
      inputtype: 'textquery',
      fields: 'place_id,formatted_address,geometry',
      key: apiKey,
      language: optimalLanguage  // 🌍 지역별 최적 언어로 요청
    });

    const searchResponse = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${searchParams}`);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.candidates || searchData.candidates.length === 0) {
      console.log(`⚠️ Google Places에서 장소 찾기 실패: ${locationName}`);
      return { location_region: null, country_code: null };
    }

    const place = searchData.candidates[0];
    console.log(`📍 Places API 장소 발견: ${place.formatted_address}`);

    // 2단계: Place Details API로 상세 행정구역 정보 조회
    const detailsParams = new URLSearchParams({
      place_id: place.place_id,
      fields: 'address_components,formatted_address,name',
      key: apiKey,
      language: optimalLanguage  // 🌍 지역별 최적 언어로 요청
    });

    const detailsResponse = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${detailsParams}`);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result.address_components) {
      console.log(`⚠️ Places Details에서 주소 구성요소 조회 실패: ${locationName}`);
      return { location_region: null, country_code: null };
    }

    // 3단계: 동적 행정구역 정보 추출
    const addressComponents = detailsData.result.address_components;
    console.log(`🔍 동적 주소 구성요소 분석:`, addressComponents.map((c: any) => `${c.long_name} (${c.types.join(', ')})`));

    let location_region = null;
    let country_code = null;

    // 우선순위별 지역 정보 추출 (전세계 호환)
    for (const component of addressComponents) {
      const types = component.types;
      
      // 국가 정보
      if (types.includes('country')) {
        country_code = component.short_name;
      }
      
      // 지역 정보 추출 (우선순위: 도시 > 행정구역 > 지구 > 기타)
      if (types.includes('locality') && !location_region) {
        location_region = component.long_name; // 도시명 (서울, 파리, 뉴욕 등)
      } else if (types.includes('administrative_area_level_2') && !location_region) {
        location_region = component.long_name; // 군/구 단위 (강남구, Manhattan 등)
      } else if (types.includes('administrative_area_level_1') && !location_region) {
        location_region = component.long_name; // 도/주 단위 (경기도, California 등)
      } else if (types.includes('sublocality_level_1') && !location_region) {
        location_region = component.long_name; // 세부 지역 (동 단위)
      }
    }

    // 결과 반환
    if (location_region && country_code) {
      console.log(`🎯 동적 지역 정보 추출 성공: ${location_region}, ${country_code}`);
      return { location_region, country_code };
    } else {
      console.log(`⚠️ 동적 지역 정보 불완전: region=${location_region}, country=${country_code}`);
      // 불완전한 정보라도 반환 (부분적으로라도 유용)
      return { location_region, country_code };
    }

  } catch (error) {
    console.error('❌ 동적 지역 정보 추출 실패:', error);
    return { location_region: null, country_code: null };
  }
}

// 📝 정적 fallback 함수는 제거됨 - Google Places API가 모든 동적 지역 정보를 처리

interface MigrationStats {
  processed: number;
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

interface GuideRecord {
  id: string;
  locationname: string;
  language: string;
  content: any;
  coordinates: any;
  location_region?: string;
  country_code?: string;
}

/**
 * 🔄 좌표 마이그레이션 API
 * 기존 가이드들의 coordinates 칼럼을 업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      limit = 10, 
      offset = 0, 
      forceUpdate = false,
      locationFilter = null 
    } = body;

    console.log(`🚀 좌표 마이그레이션 시작:`, { 
      limit, 
      offset, 
      forceUpdate, 
      locationFilter 
    });

    const stats: MigrationStats = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    // 1단계: 마이그레이션 대상 가이드 조회 (지역 정보 포함)
    let query = supabase
      .from('guides')
      .select('id, locationname, language, content, coordinates, location_region, country_code')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // coordinates가 없거나 강제 업데이트가 아닌 경우 필터링
    if (!forceUpdate) {
      query = query.or('coordinates.is.null,coordinates.eq.{}');
    }

    // 특정 위치 필터링
    if (locationFilter) {
      query = query.eq('locationname', locationFilter);
    }

    const { data: guides, error: queryError } = await query;

    if (queryError) {
      console.error('❌ 가이드 조회 실패:', queryError);
      return NextResponse.json({
        success: false,
        error: queryError.message,
        stats
      }, { status: 500 });
    }

    if (!guides || guides.length === 0) {
      console.log('📭 마이그레이션 대상 가이드 없음');
      return NextResponse.json({
        success: true,
        message: '마이그레이션 대상 가이드가 없습니다.',
        stats
      });
    }

    console.log(`📊 총 ${guides.length}개 가이드 마이그레이션 처리`);

    // 2단계: 각 가이드별 좌표 생성 및 업데이트
    for (const guide of guides) {
      try {
        stats.processed++;
        console.log(`\n🔍 처리 중 ${stats.processed}/${guides.length}: ${guide.locationname} (${guide.language})`);

        // coordinates가 이미 있고 강제 업데이트가 아닌 경우 스킵
        if (guide.coordinates && !forceUpdate) {
          console.log(`⏭️ 이미 좌표가 있어 스킵: ${guide.locationname}`);
          stats.skipped++;
          continue;
        }

        // content에서 챕터 정보 추출
        let chapters = extractChaptersFromContent(guide.content);
        
        if (chapters.length === 0) {
          console.log(`⚠️ 챕터 정보 없음 - 기본 챕터 생성: ${guide.locationname}`);
          // 챕터가 없어도 기본 챕터 생성하여 좌표 적용
          chapters = [{
            id: 1,
            title: `${guide.locationname} 가이드`,
            narrative: `${guide.locationname}에 대한 가이드입니다.`
          }];
        }

        console.log(`📖 챕터 ${chapters.length}개 발견: ${guide.locationname}`);

        // 🌍 지역 정보 추출 (가이드 생성 API와 동일한 로직)
        const regionalInfo = await extractRegionalInfo(guide.locationname, guide.location_region, null);
        console.log(`🌍 지역 정보 추출: ${guide.locationname} → 지역: ${regionalInfo.location_region}, 국가: ${regionalInfo.country_code}`);

        // 지역 컨텍스트 생성
        const locationContext: LocationContext = {
          locationName: guide.locationname,
          parentRegion: regionalInfo.location_region,
          countryCode: regionalInfo.country_code,
          language: guide.language
        };

        // 좌표 검색 (1~5순위) - 지역 컨텍스트 포함
        const foundCoordinates = await findCoordinatesInOrder(guide.locationname, locationContext);
        console.log(`✅ 좌표 발견: ${guide.locationname} → ${foundCoordinates.lat}, ${foundCoordinates.lng}`);

        // 챕터별 좌표 배열 생성
        const coordinatesArray = generateCoordinatesArray(chapters, foundCoordinates);
        console.log(`📍 좌표 배열 생성 완료: ${coordinatesArray.length}개`);

        // 3단계: coordinates 및 지역 정보 업데이트
        const updateData = {
          coordinates: coordinatesArray,
          location_region: regionalInfo.location_region,
          country_code: regionalInfo.country_code,
          updated_at: new Date().toISOString()
        };

        console.log(`📋 업데이트할 데이터:`, {
          location: guide.locationname,
          coordinates_count: coordinatesArray.length,
          location_region: updateData.location_region,
          country_code: updateData.country_code
        });

        const { error: updateError } = await supabase
          .from('guides')
          .update(updateData)
          .eq('id', guide.id);

        if (updateError) {
          console.error(`❌ 업데이트 실패: ${guide.locationname}`, updateError);
          stats.failed++;
          stats.errors.push(`${guide.locationname} (${guide.language}): ${updateError.message}`);
        } else {
          console.log(`✅ 업데이트 성공: ${guide.locationname} → ${coordinatesArray.length}개 좌표`);
          stats.success++;
        }

        // API 제한을 위한 대기 (2초)
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ 처리 실패: ${guide.locationname}`, error);
        stats.failed++;
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        stats.errors.push(`${guide.locationname} (${guide.language}): ${errorMessage}`);
      }
    }

    // 4단계: 결과 반환
    console.log('\n📊 마이그레이션 완료 통계:');
    console.log(`  처리됨: ${stats.processed}`);
    console.log(`  성공: ${stats.success}`);
    console.log(`  실패: ${stats.failed}`);
    console.log(`  스킵: ${stats.skipped}`);
    
    if (stats.errors.length > 0) {
      console.log(`  오류 목록:`, stats.errors);
    }

    return NextResponse.json({
      success: true,
      message: `좌표 마이그레이션 완료: ${stats.success}개 성공, ${stats.failed}개 실패`,
      stats,
      hasMore: guides.length === limit // 더 많은 데이터가 있는지 여부
    });

  } catch (error) {
    console.error('❌ 좌표 마이그레이션 API 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stats: {
        processed: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        errors: []
      }
    }, { status: 500 });
  }
}

/**
 * 📊 마이그레이션 진행 상황 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationFilter = searchParams.get('location');

    // 전체 가이드 수 조회
    let totalQuery = supabase
      .from('guides')
      .select('id', { count: 'exact', head: true });

    if (locationFilter) {
      totalQuery = totalQuery.eq('locationname', locationFilter);
    }

    const { count: totalGuides, error: totalError } = await totalQuery;

    if (totalError) {
      console.error('❌ 전체 가이드 수 조회 실패:', totalError);
      return NextResponse.json({
        success: false,
        error: totalError.message
      }, { status: 500 });
    }

    // coordinates가 있는 가이드 수 조회
    let migratedQuery = supabase
      .from('guides')
      .select('id', { count: 'exact', head: true })
      .not('coordinates', 'is', null)
      .not('coordinates', 'eq', '{}');

    if (locationFilter) {
      migratedQuery = migratedQuery.eq('locationname', locationFilter);
    }

    const { count: migratedGuides, error: migratedError } = await migratedQuery;

    if (migratedError) {
      console.error('❌ 마이그레이션 완료 가이드 수 조회 실패:', migratedError);
      return NextResponse.json({
        success: false,
        error: migratedError.message
      }, { status: 500 });
    }

    const remaining = (totalGuides || 0) - (migratedGuides || 0);
    const progress = totalGuides ? ((migratedGuides || 0) / totalGuides * 100).toFixed(1) : 0;

    return NextResponse.json({
      success: true,
      data: {
        total: totalGuides || 0,
        migrated: migratedGuides || 0,
        remaining: remaining,
        progress: `${progress}%`,
        isCompleted: remaining === 0
      }
    });

  } catch (error) {
    console.error('❌ 마이그레이션 상태 조회 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
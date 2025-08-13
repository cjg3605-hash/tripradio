// src/app/api/coordinates/migrate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { 
  findCoordinatesSimple, 
  generateCoordinatesArray, 
  extractChaptersFromContent,
  SimpleLocationContext 
} from '@/lib/coordinates/coordinate-utils';

export const runtime = 'nodejs';

/**
 * 🌍 간단한 지역 정보 추출 (Geocoding API 결과 기반)
 */
function extractRegionalInfo(locationName: string, parentRegion?: string, regionalContext?: any): {
  location_region: string | null;
  country_code: string | null;
} {
  console.log(`🌍 지역 정보 추출 시작: "${locationName}"`);
  console.log(`🔍 입력 파라미터:`, { 
    parentRegion: parentRegion || 'null', 
    regionalContext: regionalContext || 'null' 
  });
  
  // 1. parentRegion이 있는 경우 우선 사용
  if (parentRegion) {
    const countryCode = inferCountryCodeFromRegion(parentRegion);
    console.log(`✅ parentRegion 사용: ${parentRegion}, ${countryCode}`);
    return {
      location_region: parentRegion,
      country_code: countryCode
    };
  }
  
  // 2. regionalContext에서 정보 추출
  if (regionalContext) {
    const region = regionalContext.region || regionalContext.parentRegion;
    const country = regionalContext.country || regionalContext.countryCode;
    
    if (region || country) {
      console.log(`✅ regionalContext 사용: ${region}, ${country}`);
      return {
        location_region: region || null,
        country_code: country || (region ? inferCountryCodeFromRegion(region) : null)
      };
    }
  }
  
  // 3. 장소명으로부터 지역 추정
  const inferredInfo = inferRegionalInfoFromLocationName(locationName);
  console.log(`✅ 장소명 기반 추정: ${inferredInfo.location_region}, ${inferredInfo.country_code}`);
  return inferredInfo;
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
 * 🌍 장소명으로부터 지역 정보 추정
 */
function inferRegionalInfoFromLocationName(locationName: string): {
  location_region: string | null;
  country_code: string | null;
} {
  const name = locationName.toLowerCase();
  
  // 한국 지역들
  if (name.includes('서울') || name.includes('seoul')) {
    return { location_region: '서울특별시', country_code: 'KR' };
  } else if (name.includes('부산') || name.includes('busan')) {
    return { location_region: '부산광역시', country_code: 'KR' };
  } else if (name.includes('제주') || name.includes('jeju')) {
    return { location_region: '제주특별자치도', country_code: 'KR' };
  } else if (name.includes('경주') || name.includes('gyeongju')) {
    return { location_region: '경상북도', country_code: 'KR' };
  } else if (name.includes('용궁사')) {
    return { location_region: '부산광역시', country_code: 'KR' };
  } else if (name.includes('인천') || name.includes('incheon')) {
    return { location_region: '인천광역시', country_code: 'KR' };
  } else if (name.includes('대전') || name.includes('daejeon')) {
    return { location_region: '대전광역시', country_code: 'KR' };
  } else if (name.includes('대구') || name.includes('daegu')) {
    return { location_region: '대구광역시', country_code: 'KR' };
  } else if (name.includes('광주') || name.includes('gwangju')) {
    return { location_region: '광주광역시', country_code: 'KR' };
  } else if (name.includes('울산') || name.includes('ulsan')) {
    return { location_region: '울산광역시', country_code: 'KR' };
  } else if (name.includes('수원') || name.includes('suwon')) {
    return { location_region: '경기도', country_code: 'KR' };
  }
  
  // 해외 주요 관광지
  else if (name.includes('paris') || name.includes('파리') || name.includes('에펠') || name.includes('루브르')) {
    return { location_region: '파리', country_code: 'FR' };
  } else if (name.includes('london') || name.includes('런던') || name.includes('빅벤')) {
    return { location_region: '런던', country_code: 'GB' };
  } else if (name.includes('rome') || name.includes('로마') || name.includes('콜로세움')) {
    return { location_region: '로마', country_code: 'IT' };
  } else if (name.includes('new york') || name.includes('뉴욕') || name.includes('자유의 여신')) {
    return { location_region: '뉴욕', country_code: 'US' };
  } else if (name.includes('tokyo') || name.includes('도쿄') || name.includes('동경')) {
    return { location_region: '도쿄', country_code: 'JP' };
  } else if (name.includes('beijing') || name.includes('베이징') || name.includes('북경')) {
    return { location_region: '베이징', country_code: 'CN' };
  }
  
  // 한국 관련 키워드가 있으면 한국으로 분류
  else if (name.includes('궁') || name.includes('사찰') || name.includes('절') || 
           name.includes('경복') || name.includes('창덕') || name.includes('불국') ||
           name.includes('석굴암')) {
    return { location_region: '미분류', country_code: 'KR' };
  }
  
  // 기본값: 한국의 미분류 지역
  return { location_region: '미분류', country_code: 'KR' };
}

// 📝 Places API 완전 제거 - Geocoding API 결과와 지역명 기반 추정만 사용

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

        // 🌍 지역 정보 추출 (Places API 없이 Geocoding 결과 기반)
        const regionalInfo = extractRegionalInfo(guide.locationname, guide.location_region, null);
        console.log(`🌍 지역 정보 추출: ${guide.locationname} → 지역: ${regionalInfo.location_region}, 국가: ${regionalInfo.country_code}`);

        // 지역 컨텍스트 생성
        const locationContext: SimpleLocationContext = {
          locationName: guide.locationname,
          region: regionalInfo.location_region || undefined,
          country: regionalInfo.country_code || undefined,
          language: guide.language
        };

        // 좌표 검색 (1~5순위) - 지역 컨텍스트 포함
        const foundCoordinates = await findCoordinatesSimple(guide.locationname, locationContext);
        
        if (!foundCoordinates) {
          console.log(`❌ 좌표 발견 실패: ${guide.locationname}`);
          continue; // 좌표를 찾을 수 없으면 다음 가이드로 건너뛰기
        }
        
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
/**
 * 🌍 Google Geocoding API 기반 정확한 국가코드 추출 시스템
 * 전세계 모든 장소에 대해 정확한 3자리 국가코드 추출
 */

import axios from 'axios';

// 📍 추출된 지역 정보 인터페이스
export interface AccurateLocationInfo {
  placeName: string;        // 원본 장소명
  formattedAddress: string; // Google의 정식 주소
  region: string;          // 지역/도시명
  country: string;         // 국가명 (한국어)
  countryCode: string;     // ISO 3166-1 alpha-3 국가코드 (KOR, THA, CHN 등)
  coordinates: {
    lat: number;
    lng: number;
  };
  confidence: number;      // 0-1 범위 신뢰도
  source: 'google_geocoding';
  rawData?: any;          // 디버깅용 원본 Google 응답
}

/**
 * 🎯 Google Geocoding API로 정확한 지역 정보 추출
 */
export async function extractAccurateLocationInfo(
  placeName: string,
  language: string = 'ko'
): Promise<AccurateLocationInfo | null> {
  try {
    // 🔒 Google Places API 키 검증 (선택적)
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GOOGLE_PLACES_API_KEY 환경변수가 설정되지 않음, 폴백 시스템 사용');
      return null; // 폴백 시스템이 처리함
    }

    console.log(`🔍 정확한 지역 정보 추출 시작: "${placeName}"`);

    // 다중 검색어 생성 (한국어 + 영어 + 현지어)
    const searchQueries = generateSearchQueries(placeName, language);
    console.log(`🔍 검색 쿼리 ${searchQueries.length}개:`, searchQueries);

    // 각 검색어로 순차 시도
    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i];
      console.log(`🎯 검색 시도 ${i + 1}/${searchQueries.length}: "${query}"`);

      // Google Geocoding API 호출
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: query,
          key: apiKey,
          language: language === 'ko' ? 'ko' : 'en'
        },
        timeout: 15000
      });

      const data = response.data;
      console.log(`📡 Google API 응답: ${data.status} (결과 ${data.results?.length || 0}개)`);

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log(`✅ 검색 성공: "${query}" → ${result.formatted_address}`);
        
        // 결과의 유효성 검증 (기대했던 국가가 아닌 경우 다음 검색어 시도)
        const isExpectedResult = validateSearchResult(result, placeName, query, i);
        if (!isExpectedResult) {
          console.log(`⚠️ 검색 결과가 기대와 다름, 다음 검색어 시도`);
          continue;
        }
        
        // 결과 처리
        const processedResult = await processGeocodingResult(result, placeName, query);
        if (processedResult) {
          return processedResult;
        }
      } else {
        console.log(`❌ 검색 실패: "${query}" → ${data.status}`);
        if (data.error_message) {
          console.log(`   오류 메시지: ${data.error_message}`);
        }
      }

      // API 호출 제한 방지 (500ms 대기)
      if (i < searchQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`❌ 모든 검색어 시도 실패: ${placeName}`);
    return null;

  } catch (error) {
    console.error('❌ 정확한 지역 정보 추출 실패:', error);
    return null;
  }
}

/**
 * 🔍 다중 검색어 생성 (전세계 명소 다국어 지원)
 */
function generateSearchQueries(placeName: string, language: string): string[] {
  const queries: string[] = [];
  
  // 기본 검색어
  queries.push(placeName);
  
  // 🌍 전세계 유명 관광지별 다국어 검색어 (대폭 확장)
  const famousPlaceTranslations: { [key: string]: string[] } = {
    // 🇫🇷 프랑스
    '에펠탑': ['Eiffel Tower', 'Tour Eiffel', 'Eiffel Tower Paris', 'Tour Eiffel Paris'],
    '루브르': ['Louvre Museum', 'Musée du Louvre', 'Louvre Paris'],
    '루브르박물관': ['Louvre Museum', 'Musée du Louvre', 'Louvre Paris'],
    '노트르담': ['Notre Dame Cathedral', 'Cathédrale Notre-Dame', 'Notre Dame Paris'],
    '베르사유': ['Palace of Versailles', 'Château de Versailles'],
    
    // 🇮🇹 이탈리아
    '콜로세움': ['Colosseum', 'Colosseo', 'Colosseum Rome', 'Roman Colosseum'],
    '피사의사탑': ['Leaning Tower of Pisa', 'Torre di Pisa'],
    '바티칸': ['Vatican City', 'Città del Vaticano'],
    '베네치아': ['Venice', 'Venezia'],
    
    // 🇪🇸 스페인
    '사그라다파밀리아': ['Sagrada Familia', 'Basílica de la Sagrada Família', 'Sagrada Familia Barcelona'],
    '구엘공원': ['Park Güell', 'Parque Güell', 'Parc Güell'],
    '알함브라': ['Alhambra', 'Alhambra Palace', 'Alhambra Granada'],
    
    // 🇬🇧 영국
    '빅벤': ['Big Ben', 'Elizabeth Tower', 'Big Ben London'],
    '런던브리지': ['London Bridge', 'Tower Bridge'],
    '스톤헨지': ['Stonehenge'],
    
    // 🇺🇸 미국
    '자유의여신상': ['Statue of Liberty', 'Liberty Island', 'Statue of Liberty New York'],
    '타임스스퀘어': ['Times Square', 'Times Square NYC'],
    '그랜드캐니언': ['Grand Canyon', 'Grand Canyon Arizona'],
    '골든게이트브리지': ['Golden Gate Bridge', 'Golden Gate San Francisco'],
    
    // 🇨🇳 중국
    '만리장성': ['Great Wall of China', 'Great Wall Beijing', 'Badaling Great Wall', '万里长城', '北京长城'],
    '자금성': ['Forbidden City', '紫禁城', 'Palace Museum', 'Forbidden City Beijing'],
    '천안문': ['Tiananmen Square', '天安门广场'],
    
    // 🇯🇵 일본
    '후지산': ['Mount Fuji', '富士山', 'Fujisan'],
    '도쿄타워': ['Tokyo Tower', '東京タワー'],
    '금각사': ['Kinkaku-ji', '金閣寺', 'Golden Pavilion'],
    
    // 🇮🇳 인도
    '타지마할': ['Taj Mahal', 'Taj Mahal Agra', 'ताज महल'],
    
    // 🇹🇭 태국
    '대왕궁': ['Grand Palace Bangkok', 'Grand Palace Thailand', 'Wat Phra Kaew', 'Royal Palace Bangkok', 'พระบรมมหาราชวัง'],
    
    // 🇦🇺 호주
    '시드니오페라하우스': ['Sydney Opera House', 'Opera House Sydney'],
    
    // 🇪🇬 이집트
    '피라미드': ['Pyramids of Giza', 'Great Pyramid', 'أهرامات الجيزة'],
    '스핑크스': ['Great Sphinx', 'أبو الهول'],
    
    // 🇵🇪 페루
    '마추픽추': ['Machu Picchu', 'Machu Picchu Peru', 'Ciudadela Inca'],
    
    // 🇧🇷 브라질
    '리우데자네이루': ['Rio de Janeiro', 'Christ the Redeemer', 'Cristo Redentor'],
    
    // 🇷🇺 러시아
    '크렘린': ['Kremlin', 'московский кремль', 'Red Square'],
    
    // 🇰🇷 한국 (주요 명소만)
    '경복궁': ['Gyeongbokgung Palace', 'Gyeongbok Palace'],
    '제주도': ['Jeju Island', 'Jeju-do']
  };
  
  // 일치하는 번역어 추가
  const translations = famousPlaceTranslations[placeName];
  if (translations) {
    queries.push(...translations);
    console.log(`🌍 다국어 검색어 추가: ${placeName} → [${translations.join(', ')}]`);
  }
  
  // 일반적인 관광지 키워드 추가 (언어별)
  const tourismKeywords = language === 'ko' 
    ? ['관광지', '명소', '여행지', '박물관', '궁전', '사원']
    : ['tourist attraction', 'landmark', 'palace', 'temple', 'museum', 'monument'];
  
  tourismKeywords.forEach(keyword => {
    queries.push(`${placeName} ${keyword}`);
  });
  
  // 중복 제거 및 정리
  return [...new Set(queries)].slice(0, 10); // 최대 10개로 확장
}

/**
 * 🔍 검색 결과 유효성 검증
 */
function validateSearchResult(result: any, placeName: string, searchQuery: string, queryIndex: number): boolean {
  // 유명 관광지의 예상 국가 매핑
  const expectedCountries: { [key: string]: string[] } = {
    '대왕궁': ['Thailand', 'TH', 'ประเทศไทย', '태국'],
    '만리장성': ['China', 'CN', '中国', '중국'],
    '에펠탑': ['France', 'FR', 'France', '프랑스'],
    '콜로세움': ['Italy', 'IT', 'Italia', '이탈리아'],
    '사그라다파밀리아': ['Spain', 'ES', 'España', '스페인'],
  };

  const expected = expectedCountries[placeName];
  if (!expected) {
    // 매핑이 없는 경우 모든 결과를 유효로 간주
    return true;
  }

  const address = result.formatted_address?.toLowerCase() || '';
  const hasExpectedCountry = expected.some(country => 
    address.includes(country.toLowerCase())
  );

  // 첫 번째 검색어(한국어)는 한국 결과가 나올 가능성이 높으므로, 
  // 기대 국가가 아니면 영어 검색어를 시도하도록 false 반환
  if (queryIndex === 0 && !hasExpectedCountry) {
    console.log(`🔍 "${placeName}" 첫 번째 검색에서 기대 국가 미발견, 영어 검색어 시도 필요`);
    return false;
  }

  return true;
}

/**
 * 🏗️ Geocoding 결과 처리
 */
async function processGeocodingResult(
  result: any,
  originalPlaceName: string,
  searchQuery: string
): Promise<AccurateLocationInfo | null> {
  try {
    console.log(`📋 Google API 원본 결과:`, {
      formatted_address: result.formatted_address,
      components_count: result.address_components?.length || 0,
      place_id: result.place_id,
      types: result.types?.join(', ')
    });

    // address_components에서 정확한 지역 정보 추출
    const locationInfo = extractFromAddressComponents(result.address_components);
    
    if (!locationInfo.country || !locationInfo.countryCode) {
      console.log('❌ 국가 정보를 추출할 수 없음');
      return null;
    }

    // 최종 결과 구성
    const accurateInfo: AccurateLocationInfo = {
      placeName: originalPlaceName,
      formattedAddress: result.formatted_address,
      region: locationInfo.region || extractRegionFromAddress(result.formatted_address),
      country: locationInfo.country,
      countryCode: locationInfo.countryCode,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      confidence: calculateLocationConfidence(result, originalPlaceName),
      source: 'google_geocoding',
      rawData: {
        address_components: result.address_components,
        types: result.types,
        place_id: result.place_id,
        search_query: searchQuery
      }
    };

    console.log('✅ 정확한 지역 정보 추출 성공:', {
      placeName: accurateInfo.placeName,
      region: accurateInfo.region,
      country: accurateInfo.country,
      countryCode: accurateInfo.countryCode,
      coordinates: `${accurateInfo.coordinates.lat}, ${accurateInfo.coordinates.lng}`,
      confidence: (accurateInfo.confidence * 100).toFixed(1) + '%',
      searchQuery: searchQuery
    });

    return accurateInfo;

  } catch (error) {
    console.error('❌ Geocoding 결과 처리 실패:', error);
    return null;
  }
}

/**
 * 🏗️ Google address_components에서 지역 정보 추출
 */
function extractFromAddressComponents(components: any[]): {
  region: string;
  country: string;
  countryCode: string;
} {
  if (!components || components.length === 0) {
    return { region: '', country: '', countryCode: '' };
  }

  let region = '';
  let country = '';
  let countryCode = '';

  console.log('🔍 address_components 분석 시작:');
  
  for (const component of components) {
    const types = component.types || [];
    const longName = component.long_name || '';
    const shortName = component.short_name || '';

    console.log(`  - ${longName} (${shortName}) [${types.join(', ')}]`);

    // 국가 정보 추출 (최우선)
    if (types.includes('country')) {
      country = longName;
      countryCode = convertToThreeLetterCode(shortName); // ISO 3166-1 alpha-2를 alpha-3로 변환
      console.log(`    🌍 국가 발견: ${country} (${shortName} → ${countryCode})`);
    }

    // 지역 정보 추출 (우선순위 순)
    if (!region) {
      if (types.includes('locality')) {
        region = longName;
        console.log(`    🏙️ 도시 발견: ${region}`);
      } else if (types.includes('administrative_area_level_1')) {
        region = longName;
        console.log(`    🗺️ 주/도 발견: ${region}`);
      } else if (types.includes('administrative_area_level_2')) {
        region = longName;
        console.log(`    📍 행정구역 발견: ${region}`);
      } else if (types.includes('sublocality')) {
        region = longName;
        console.log(`    🏘️ 하위지역 발견: ${region}`);
      }
    }
  }

  console.log(`✅ 추출 완료: 지역="${region}", 국가="${country}", 코드="${countryCode}"`);

  return { region, country, countryCode };
}

/**
 * 🔄 ISO 3166-1 alpha-2 코드를 alpha-3 코드로 변환
 */
function convertToThreeLetterCode(twoLetterCode: string): string {
  const iso2ToIso3Map: { [key: string]: string } = {
    // 주요 국가들
    'KR': 'KOR', // 대한민국
    'TH': 'THA', // 태국 ⭐ 중요!
    'CN': 'CHN', // 중국
    'JP': 'JPN', // 일본
    'US': 'USA', // 미국
    'FR': 'FRA', // 프랑스
    'GB': 'GBR', // 영국
    'DE': 'DEU', // 독일
    'IT': 'ITA', // 이탈리아
    'ES': 'ESP', // 스페인
    'RU': 'RUS', // 러시아
    'CA': 'CAN', // 캐나다
    'AU': 'AUS', // 호주
    'IN': 'IND', // 인도
    'BR': 'BRA', // 브라질
    'MX': 'MEX', // 멕시코
    'VN': 'VNM', // 베트남
    'ID': 'IDN', // 인도네시아
    'MY': 'MYS', // 말레이시아
    'SG': 'SGP', // 싱가포르
    'PH': 'PHL', // 필리핀
    'NL': 'NLD', // 네덜란드
    'BE': 'BEL', // 벨기에
    'CH': 'CHE', // 스위스
    'AT': 'AUT', // 오스트리아
    'SE': 'SWE', // 스웨덴
    'NO': 'NOR', // 노르웨이
    'DK': 'DNK', // 덴마크
    'FI': 'FIN', // 핀란드
    'PT': 'PRT', // 포르투갈
    'GR': 'GRC', // 그리스
    'TR': 'TUR', // 터키
    'EG': 'EGY', // 이집트
    'ZA': 'ZAF', // 남아프리카공화국
    'AR': 'ARG', // 아르헨티나
    'CL': 'CHL', // 칠레
    'PE': 'PER', // 페루
    'CO': 'COL', // 콜롬비아
    'NZ': 'NZL', // 뉴질랜드
    'PL': 'POL', // 폴란드
    'CZ': 'CZE', // 체코
    'HU': 'HUN', // 헝가리
    'RO': 'ROU', // 루마니아
    'HR': 'HRV', // 크로아티아
    'UA': 'UKR', // 우크라이나
    'IL': 'ISR', // 이스라엘
    'AE': 'ARE', // 아랍에미리트
    'SA': 'SAU', // 사우디아라비아
    'QA': 'QAT', // 카타르
    'KW': 'KWT', // 쿠웨이트
    'BH': 'BHR', // 바레인
    'OM': 'OMN', // 오만
    'JO': 'JOR', // 요단
    'LB': 'LBN', // 레바논
    'SY': 'SYR', // 시리아
    'IQ': 'IRQ', // 이라크
    'IR': 'IRN', // 이란
    'AF': 'AFG', // 아프가니스탄
    'PK': 'PAK', // 파키스탄
    'BD': 'BGD', // 방글라데시
    'LK': 'LKA', // 스리랑카
    'MM': 'MMR', // 미얀마
    'KH': 'KHM', // 캄보디아
    'LA': 'LAO', // 라오스
    'BN': 'BRN', // 브루나이
    'NP': 'NPL', // 네팔
    'BT': 'BTN', // 부탄
    'MV': 'MDV', // 몰디브
    'MN': 'MNG', // 몽골
    'KZ': 'KAZ', // 카자흐스탄
    'UZ': 'UZB', // 우즈베키스탄
    'TM': 'TKM', // 투르크메니스탄
    'KG': 'KGZ', // 키르기스스탄
    'TJ': 'TJK', // 타지키스탄
    'AM': 'ARM', // 아르메니아
    'GE': 'GEO', // 조지아
    'AZ': 'AZE', // 아제르바이잔
    'MD': 'MDA', // 몰도바
    'BY': 'BLR', // 벨라루스
    'LT': 'LTU', // 리투아니아
    'LV': 'LVA', // 라트비아
    'EE': 'EST', // 에스토니아
    'IS': 'ISL', // 아이슬란드
    'IE': 'IRL', // 아일랜드
    'MT': 'MLT', // 몰타
    'CY': 'CYP', // 키프로스
    'LU': 'LUX', // 룩셈부르크
    'MC': 'MCO', // 모나코
    'VA': 'VAT', // 바티칸
    'SM': 'SMR', // 산마리노
    'AD': 'AND', // 안도라
    'LI': 'LIE', // 리히텐슈타인
  };

  const result = iso2ToIso3Map[twoLetterCode.toUpperCase()];
  
  if (result) {
    console.log(`🔄 국가코드 변환: ${twoLetterCode} → ${result}`);
  } else {
    console.log(`⚠️ 알 수 없는 국가코드: ${twoLetterCode}, 원본 그대로 반환`);
  }
  
  return result || twoLetterCode.toUpperCase();
}

/**
 * 📍 주소에서 지역명 추출 (fallback)
 */
function extractRegionFromAddress(formattedAddress: string): string {
  if (!formattedAddress) return '';

  // 주소를 콤마로 분리하여 지역명 추출
  const parts = formattedAddress.split(',').map(part => part.trim());
  
  // 일반적으로 첫 번째 또는 두 번째 부분이 지역명
  if (parts.length >= 2) {
    return parts[1]; // 두 번째 부분 (보통 도시명)
  } else if (parts.length >= 1) {
    return parts[0]; // 첫 번째 부분
  }
  
  return '미분류';
}

/**
 * 🎯 위치 신뢰도 계산
 */
function calculateLocationConfidence(result: any, originalQuery: string): number {
  let confidence = 0.8; // 기본 신뢰도 (Google API이므로 높게 설정)

  // 장소명 포함 여부 확인
  const formattedAddress = result.formatted_address?.toLowerCase() || '';
  const queryLower = originalQuery.toLowerCase();
  
  if (formattedAddress.includes(queryLower)) {
    confidence += 0.15;
  }

  // 정확한 장소 타입인지 확인
  const types = result.types || [];
  if (types.includes('establishment') || types.includes('point_of_interest')) {
    confidence += 0.05;
  }

  return Math.min(confidence, 1.0);
}

/**
 * 🔧 배치 처리용 다중 위치 정보 추출
 */
export async function extractMultipleLocationInfo(
  placeNames: string[],
  language: string = 'ko'
): Promise<AccurateLocationInfo[]> {
  const results: AccurateLocationInfo[] = [];
  
  console.log(`🎯 다중 위치 정보 추출 시작: ${placeNames.length}개 장소`);

  for (let i = 0; i < placeNames.length; i++) {
    const placeName = placeNames[i];
    console.log(`\n📍 ${i + 1}/${placeNames.length}: "${placeName}"`);
    
    const info = await extractAccurateLocationInfo(placeName, language);
    
    if (info) {
      results.push(info);
      console.log(`✅ 성공: ${info.country} (${info.countryCode})`);
    } else {
      console.log(`❌ 실패: 정보를 추출할 수 없음`);
    }
    
    // API 호출 제한을 위한 대기 (1초)
    if (i < placeNames.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n🎉 다중 추출 완료: ${results.length}/${placeNames.length}개 성공`);
  return results;
}
/**
 * 🗺️ 좌표 처리 공통 유틸리티
 * 
 * 목적: 여러 API에서 중복되는 좌표 생성 및 지역정보 추출 로직을 통합
 * 사용처: generate-multilang-guide, generate-sequential-guide 등
 */

import { extractChaptersFromContent, SimpleLocationContext } from '@/lib/coordinates/coordinate-utils';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🤖 Gemini AI를 이용한 좌표 검색 (세션스토리지 정보 활용)
 */
async function getCoordinateFromAI(
  location: string,
  region: string,
  country: string
): Promise<{ lat: number; lng: number; source: string; confidence: number } | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY가 설정되지 않음');
      return null;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const coordinatePrompt = `
위치: ${location}
지역: ${region}
국가: ${country}

위 정보를 바탕으로 해당 장소의 정확한 GPS 좌표를 찾아주세요.
지역과 국가 정보를 활용하여 정확한 위치를 특정해주세요.

응답 형식:
LAT: [위도]
LNG: [경도]

예시:
LAT: 37.5665
LNG: 126.9780
`;

    console.log(`🤖 AI 좌표 검색: ${location} (${region}, ${country})`);
    
    const result = await model.generateContent(coordinatePrompt);
    const response = result.response.text();
    
    console.log(`🤖 AI 응답: ${response.trim()}`);
    
    // 좌표 추출
    const latMatch = response.match(/LAT:\s*([-+]?\d{1,3}\.?\d*)/i);
    const lngMatch = response.match(/LNG:\s*([-+]?\d{1,3}\.?\d*)/i);
    
    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      // 좌표 유효성 검증
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.log(`✅ AI 좌표 검색 성공: ${lat}, ${lng}`);
        return {
          lat,
          lng,
          source: 'ai_gemini',
          confidence: 0.85
        };
      } else {
        console.log(`❌ AI 좌표 범위 초과: lat=${lat}, lng=${lng}`);
      }
    } else {
      console.log(`❌ AI 좌표 파싱 실패: ${response.trim()}`);
    }
    
    return null;
  } catch (error) {
    console.error('❌ AI 좌표 검색 실패:', error);
    return null;
  }
}

/**
 * 🌍 표준화된 지역 정보 인터페이스
 */
export interface StandardLocationInfo {
  name: string;
  location: string;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  type: 'location' | 'attraction';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * 📍 좌표 생성 결과 인터페이스
 */
export interface CoordinateResult {
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
 * 🏛️ Google Places API 주소 컴포넌트 타입
 */
export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * 🔧 지역정보 추출 옵션
 */
export interface LocationExtractionOptions {
  /** 언어 설정 */
  language?: string;
  /** Google API 사용 여부 */
  useGoogleAPI?: boolean;
  /** 디버그 로깅 활성화 */
  enableLogging?: boolean;
  /** 재시도 횟수 */
  retryCount?: number;
}

/**
 * 🌍 국가 코드 변환 (ISO 2자리 → 3자리)
 */
export function convertCountryCodeToAlpha3(twoLetterCode: string): string {
  const countryCodeMap: Record<string, string> = {
    'KR': 'KOR', // 한국
    'US': 'USA', // 미국
    'JP': 'JPN', // 일본
    'CN': 'CHN', // 중국
    'TH': 'THA', // 태국
    'VN': 'VNM', // 베트남
    'SG': 'SGP', // 싱가포르
    'MY': 'MYS', // 말레이시아
    'ID': 'IDN', // 인도네시아
    'PH': 'PHL', // 필리핀
    'IN': 'IND', // 인도
    'GB': 'GBR', // 영국
    'FR': 'FRA', // 프랑스
    'DE': 'DEU', // 독일
    'IT': 'ITA', // 이탈리아
    'ES': 'ESP', // 스페인
    'AU': 'AUS', // 호주
    'CA': 'CAN', // 캐나다
    'BR': 'BRA', // 브라질
    'MX': 'MEX', // 멕시코
    'RU': 'RUS', // 러시아
    'TR': 'TUR', // 터키
    'EG': 'EGY', // 이집트
    'ZA': 'ZAF', // 남아프리카공화국
  };

  return countryCodeMap[twoLetterCode.toUpperCase()] || twoLetterCode.toUpperCase();
}

/**
 * 🗺️ URL 쿼리 파라미터에서 지역 정보 추출
 */
export function extractLocationDataFromRequest(
  locationName: string, 
  searchParams: URLSearchParams
): StandardLocationInfo {
  const region = searchParams.get('region') || null;
  const country = searchParams.get('country') || null;
  const countryCode = searchParams.get('countryCode') || null;
  const type = (searchParams.get('type') as 'location' | 'attraction') || 'attraction';

  return {
    name: locationName,
    location: region && country ? `${region}, ${country}` : locationName,
    region: region,
    country: country,
    countryCode: countryCode,
    type: type
  };
}

/**
 * 🏛️ Google Places API address_components에서 정보 추출
 */
export function extractFromAddressComponents(
  addressComponents: AddressComponent[],
  fallback: { location_region: string | null; country_code: string | null; }
): { location_region: string | null; country_code: string | null; } {
  let location_region: string | null = null;
  let country_code: string | null = null;

  for (const component of addressComponents) {
    const types = component.types || [];
    
    // 국가 코드 추출 (ISO 2자리 → 3자리로 변환)
    if (types.includes('country')) {
      const shortName = component.short_name; // 예: "KR", "US", "TH"
      country_code = convertCountryCodeToAlpha3(shortName);
      console.log(`🌍 국가 코드: ${shortName} → ${country_code}`);
    }
    
    // 지역 정보 추출 (우선순위: 시/도 > 구/군 > 도시)
    if (types.includes('administrative_area_level_1')) {
      location_region = component.long_name;
      console.log(`🏞️ 지역 (level_1): ${location_region}`);
    } else if (types.includes('administrative_area_level_2') && !location_region) {
      location_region = component.long_name;
      console.log(`🏞️ 지역 (level_2): ${location_region}`);
    } else if (types.includes('locality') && !location_region) {
      location_region = component.long_name;
      console.log(`🏞️ 지역 (locality): ${location_region}`);
    }
  }

  const result = {
    location_region: location_region || fallback.location_region,
    country_code: country_code || fallback.country_code
  };
  
  console.log('✅ address_components 추출 결과:', result);
  return result;
}

/**
 * 🌍 formatted_address에서 정보 추출
 */
export function extractFromFormattedAddress(
  formattedAddress: string, 
  fallback: { location_region: string | null; country_code: string | null; }
): { location_region: string | null; country_code: string | null; } {
  console.log(`📍 formatted_address 분석: ${formattedAddress}`);
  
  const address = formattedAddress.toLowerCase();
  let location_region: string | null = null;
  let country_code: string | null = null;

  // 한국 주소 패턴 분석
  if (address.includes('대한민국') || address.includes('south korea') || address.includes('korea')) {
    country_code = 'KOR';
    
    // 시/도 추출
    const koreanRegions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    for (const region of koreanRegions) {
      if (address.includes(region)) {
        location_region = region + (region.length === 2 ? (region === '세종' ? '시' : '도') : '');
        break;
      }
    }
  }

  // 태국 주소 패턴 분석
  else if (address.includes('thailand') || address.includes('ประเทศไทย')) {
    country_code = 'THA';
    
    const thaiRegions = ['bangkok', 'phuket', 'chiang mai', 'pattaya', 'krabi'];
    for (const region of thaiRegions) {
      if (address.includes(region)) {
        location_region = region.charAt(0).toUpperCase() + region.slice(1);
        break;
      }
    }
  }

  // 일본 주소 패턴 분석
  else if (address.includes('japan') || address.includes('日本')) {
    country_code = 'JPN';
    
    const japaneseRegions = ['tokyo', 'osaka', 'kyoto', 'hiroshima', 'fukuoka', 'sapporo'];
    for (const region of japaneseRegions) {
      if (address.includes(region)) {
        location_region = region.charAt(0).toUpperCase() + region.slice(1);
        break;
      }
    }
  }

  const result = {
    location_region: location_region || fallback.location_region,
    country_code: country_code || fallback.country_code
  };
  
  console.log('✅ formatted_address 추출 결과:', result);
  return result;
}

/**
 * 🎯 통합 지역정보 추출 함수
 * 
 * Google API를 활용하여 정확한 지역 정보를 추출
 */
export async function extractAccurateLocationInfoCommon(
  locationName: string,
  options: LocationExtractionOptions = {}
): Promise<StandardLocationInfo | null> {
  const {
    language = 'ko',
    useGoogleAPI = true,
    enableLogging = true,
    retryCount = 1
  } = options;

  if (!useGoogleAPI) {
    return {
      name: locationName,
      location: locationName,
      region: null,
      country: null,
      countryCode: null,
      type: 'attraction'
    };
  }

  try {
    if (enableLogging) {
      console.log(`🔍 지역 정보 부족, Google API로 정확한 정보 추출 시도: ${locationName}`);
    }

    const accurateInfo = await extractAccurateLocationInfoCommon(locationName, { language });
    
    if (accurateInfo && accurateInfo.countryCode) {
      if (enableLogging) {
        console.log('✅ Google API 기반 정확한 지역 정보 추출 성공:', {
          name: accurateInfo.name,
          region: accurateInfo.region,
          country: accurateInfo.country,
          countryCode: accurateInfo.countryCode
        });
      }

      return {
        name: accurateInfo.name || locationName,
        location: `${accurateInfo.region}, ${accurateInfo.country}`,
        region: accurateInfo.region,
        country: accurateInfo.country,
        countryCode: accurateInfo.countryCode,
        type: 'attraction',
        coordinates: accurateInfo.coordinates
      };
    } else {
      if (enableLogging) {
        console.log('⚠️ Google API 추출 실패, 기본값 사용');
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Google API 추출 중 오류:', error);
    
    // 재시도 로직
    if (retryCount > 1) {
      console.log(`🔄 재시도 ${retryCount - 1}회 남음`);
      return await extractAccurateLocationInfoCommon(locationName, {
        ...options,
        retryCount: retryCount - 1
      });
    }
    
    return null;
  }
}

/**
 * 🗺️ 가이드용 좌표 생성 함수 (공통)
 * 
 * 가이드 컨텐츠에서 챕터를 추출하여 각각의 좌표를 생성
 */
export async function generateCoordinatesForGuideCommon(
  locationData: StandardLocationInfo,
  guideContent: any,
  options: {
    maxChapters?: number;
    delay?: number;
    language?: string;
  } = {}
): Promise<CoordinateResult[]> {
  const {
    maxChapters = 5,
    delay = 1000,
    language = 'ko'
  } = options;

  try {
    console.log('\n🗺️ 좌표 생성 시작:', locationData.name);
    
    // 챕터 추출
    const chapters = extractChaptersFromContent(guideContent);
    console.log(`📊 ${chapters.length}개 챕터 발견`);
    
    if (chapters.length === 0) {
      console.log('📊 챕터 없음, 기본 좌표 생성');
      
      // 🤖 Gemini AI를 이용한 기본 좌표 생성
      const basicCoordinate = await getCoordinateFromAI(
        locationData.name,
        locationData.region || '',
        locationData.country || ''
      );
      
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
    
    const coordinates: CoordinateResult[] = [];
    
    // 각 챕터별 좌표 생성
    for (let i = 0; i < Math.min(chapters.length, maxChapters); i++) {
      const chapter = chapters[i];
      
      try {
        console.log(`🔍 챕터 ${i + 1} 좌표 생성: "${chapter.title}"`);
        
        const context: SimpleLocationContext = {
          locationName: chapter.title,
          region: locationData.region || '',
          country: locationData.country || '',
          language: language
        };
        
        // 🤖 Gemini AI를 이용한 좌표 검색 (세션스토리지 정보 활용)
        let coordinateResult = await getCoordinateFromAI(
          chapter.title, // 허브: step.location, 일반: chapter.title
          locationData.region || '',
          locationData.country || ''
        );
        
        // 실패 시 조합 검색으로 재시도
        if (!coordinateResult) {
          console.log(`  🔄 조합 검색으로 재시도: "${locationData.name} ${chapter.title}"`);
          coordinateResult = await getCoordinateFromAI(
            `${locationData.name} ${chapter.title}`,
            locationData.region || '',
            locationData.country || ''
          );
        }
        
        if (coordinateResult) {
          const chapterCoord: CoordinateResult = {
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
          await new Promise(resolve => setTimeout(resolve, delay));
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
 * 🎯 언어별 최적 언어 결정
 */
export function getOptimalLanguageForLocation(locationName: string): string {
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
  
  // 일본 관련 키워드 감지
  const japaneseKeywords = [
    'tokyo', 'osaka', 'kyoto', 'hiroshima', 'fukuoka', 'sapporo',
    '東京', '大阪', '京都', '広島', '福岡', '札幌',
    'shrine', 'temple', 'castle', 'onsen'
  ];
  
  const hasJapaneseKeyword = japaneseKeywords.some(keyword => name.includes(keyword));
  const hasJapaneseChar = /[ひらがなカタカナ漢字]/.test(locationName);
  
  if (hasJapaneseKeyword || hasJapaneseChar) {
    return 'ja';  // 일본어
  }
  
  // 중국 관련 키워드 감지
  const chineseKeywords = [
    'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'xian',
    '北京', '上海', '广州', '深圳', '西安',
    'great wall', 'forbidden city', 'temple of heaven'
  ];
  
  const hasChineseKeyword = chineseKeywords.some(keyword => name.includes(keyword));
  const hasChineseChar = /[\u4e00-\u9fff]/.test(locationName);
  
  if (hasChineseKeyword || hasChineseChar) {
    return 'zh';  // 중국어
  }
  
  // 영어권 국가 키워드 감지
  const englishKeywords = [
    'usa', 'america', 'united states', 'uk', 'england', 'london', 'new york',
    'california', 'texas', 'florida', 'australia', 'sydney', 'melbourne'
  ];
  
  const hasEnglishKeyword = englishKeywords.some(keyword => name.includes(keyword));
  
  if (hasEnglishKeyword) {
    return 'en';  // 영어
  }
  
  // 스페인어권 키워드 감지
  const spanishKeywords = [
    'spain', 'madrid', 'barcelona', 'mexico', 'argentina', 'colombia',
    'españa', 'méxico', 'sevilla', 'valencia'
  ];
  
  const hasSpanishKeyword = spanishKeywords.some(keyword => name.includes(keyword));
  
  if (hasSpanishKeyword) {
    return 'es';  // 스페인어
  }
  
  // 기본값: 한국어
  return 'ko';
}

/**
 * 🗺️ Supabase coordinates 칼럼 파싱 유틸리티
 * 
 * Supabase에서 가져온 coordinates 데이터를 표준 배열 형태로 변환
 * 실제 DB 구조: {0: {lat, lng}, 1: {lat, lng}, ...} → 배열로 변환
 */

/**
 * Supabase coordinates 타입 정의
 */
export interface SupabaseCoordinate {
  lat: number;
  lng: number;
  name?: string;
  title?: string;
  description?: string;
}

export interface StandardCoordinate {
  id: number;
  lat: number;
  lng: number;
  name?: string;
  title?: string;
  description?: string;
}

/**
 * 🔄 Supabase coordinates 객체를 표준 배열로 변환
 * 입력: {0: {lat, lng}, 1: {lat, lng}, ...} (Supabase DB 형태)
 * 출력: [{id: 0, lat, lng}, {id: 1, lat, lng}, ...] (표준 배열 형태)
 */
export function parseSupabaseCoordinates(coordinates: any): StandardCoordinate[] {
  if (!coordinates) {
    return [];
  }

  // 이미 배열인 경우 (일부 케이스)
  if (Array.isArray(coordinates)) {
    return coordinates.map((coord, index) => ({
      id: index,
      lat: parseFloat(coord.lat || coord.latitude || '0'),
      lng: parseFloat(coord.lng || coord.longitude || '0'),
      name: coord.name || coord.title,
      title: coord.title || coord.name,
      description: coord.description
    })).filter(coord => 
      !isNaN(coord.lat) && !isNaN(coord.lng) && 
      coord.lat >= -90 && coord.lat <= 90 && 
      coord.lng >= -180 && coord.lng <= 180
    );
  }

  // 객체인 경우 (Supabase 표준 형태)
  if (typeof coordinates === 'object') {
    const result: StandardCoordinate[] = [];
    
    // 숫자 키로 정렬하여 순서 보장
    const sortedKeys = Object.keys(coordinates).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const key of sortedKeys) {
      const coord = coordinates[key];
      if (coord && typeof coord === 'object') {
        const lat = parseFloat(coord.lat || coord.latitude || '0');
        const lng = parseFloat(coord.lng || coord.longitude || '0');
        
        // 유효한 좌표만 포함
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          result.push({
            id: parseInt(key),
            lat,
            lng,
            name: coord.name || coord.title,
            title: coord.title || coord.name,
            description: coord.description
          });
        }
      }
    }
    
    return result;
  }

  return [];
}

/**
 * 🔍 좌표 데이터 유효성 검증
 */
export function validateCoordinates(coordinates: any): {
  isValid: boolean;
  type: 'array' | 'object' | 'invalid';
  count: number;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!coordinates) {
    return {
      isValid: false,
      type: 'invalid',
      count: 0,
      errors: ['좌표 데이터가 없습니다']
    };
  }

  if (Array.isArray(coordinates)) {
    const validCount = coordinates.filter(coord => {
      if (!coord || typeof coord !== 'object') return false;
      const lat = parseFloat(coord.lat || coord.latitude || '');
      const lng = parseFloat(coord.lng || coord.longitude || '');
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }).length;

    return {
      isValid: validCount > 0,
      type: 'array',
      count: validCount,
      errors: validCount === 0 ? ['유효한 좌표가 없습니다'] : []
    };
  }

  if (typeof coordinates === 'object') {
    const keys = Object.keys(coordinates);
    const validCount = keys.filter(key => {
      const coord = coordinates[key];
      if (!coord || typeof coord !== 'object') return false;
      const lat = parseFloat(coord.lat || coord.latitude || '');
      const lng = parseFloat(coord.lng || coord.longitude || '');
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }).length;

    return {
      isValid: validCount > 0,
      type: 'object',
      count: validCount,
      errors: validCount === 0 ? ['유효한 좌표가 없습니다'] : []
    };
  }

  return {
    isValid: false,
    type: 'invalid',
    count: 0,
    errors: ['올바르지 않은 좌표 데이터 형식입니다']
  };
}

/**
 * 🎯 좌표 필드명 정규화 (lat/lng vs latitude/longitude)
 */
export function normalizeCoordinateFields(coord: any): { lat: number; lng: number } | null {
  if (!coord || typeof coord !== 'object') {
    return null;
  }

  const lat = parseFloat(coord.lat || coord.latitude || '');
  const lng = parseFloat(coord.lng || coord.longitude || '');

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}

/**
 * 🧪 테스트 유틸리티
 */
export const coordinateTestUtils = {
  /** 테스트용 위치 데이터 생성 */
  createTestLocationData: (name: string): StandardLocationInfo => ({
    name,
    location: name,
    region: '테스트 지역',
    country: '테스트 국가',
    countryCode: 'TEST',
    type: 'attraction'
  }),

  /** 테스트용 좌표 결과 검증 */
  validateCoordinateResult: (result: CoordinateResult): boolean => {
    return result.lat >= -90 && result.lat <= 90 &&
           result.lng >= -180 && result.lng <= 180 &&
           result.coordinates.lat === result.lat &&
           result.coordinates.lng === result.lng;
  },

  /** 국가 코드 변환 테스트 */
  testCountryCodeConversion: () => {
    const testCases = [
      { input: 'KR', expected: 'KOR' },
      { input: 'US', expected: 'USA' },
      { input: 'JP', expected: 'JPN' }
    ];

    return testCases.every(({ input, expected }) => 
      convertCountryCodeToAlpha3(input) === expected
    );
  },

  /** Supabase 좌표 파싱 테스트 */
  testSupabaseCoordinateParsing: () => {
    const testData = {
      0: { lat: 37.5511, lng: 126.9882 },
      1: { lat: 37.5500, lng: 126.9900 }
    };
    
    const parsed = parseSupabaseCoordinates(testData);
    return parsed.length === 2 && parsed[0].lat === 37.5511 && parsed[1].lng === 126.9900;
  }
};
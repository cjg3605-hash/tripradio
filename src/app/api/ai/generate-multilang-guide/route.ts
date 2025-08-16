import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAutonomousGuidePrompt } from '@/lib/ai/prompts/index';
import { simpleGeocode } from '@/lib/coordinates/simple-geocoding';
import { extractAccurateLocationInfo } from '@/lib/coordinates/accurate-country-extractor';

export const runtime = 'nodejs';


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

// Plus Code 검증 로직 제거됨 - 더 이상 사용하지 않음


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
 * 🌍 Google Geocoding API 결과에서 지역 정보 추출
 */
function extractRegionalInfoFromPlaces(
  geocodingResult: any, 
  fallback: { location_region: string | null; country_code: string | null; }
): { location_region: string | null; country_code: string | null; } {
  console.log('🔍 Geocoding 결과에서 지역 정보 추출 시도');
  console.log('📍 입력 데이터:', JSON.stringify(geocodingResult, null, 2));
  
  // Geocoding API 응답 구조 확인
  if (!geocodingResult) {
    console.log('⚠️ geocodingResult가 null/undefined');
    return fallback;
  }

  // address_components가 있는 경우 (실제 Google API 응답)
  if (geocodingResult.address_components) {
    console.log('📍 address_components에서 추출 시도');
    return extractFromGoogleAddressComponents(geocodingResult.address_components, fallback);
  }
  
  // address 필드가 있는 경우 (우리가 반환하는 구조)
  if (geocodingResult.address) {
    console.log('📍 address 필드에서 추출 시도');
    
    // address가 문자열인 경우 - formatted_address 파싱
    if (typeof geocodingResult.address === 'string') {
      return extractFromFormattedAddress(geocodingResult.address, fallback);
    }
    
    // address가 객체인 경우 - address_components 확인
    if (geocodingResult.address.address_components) {
      return extractFromGoogleAddressComponents(geocodingResult.address.address_components, fallback);
    }
  }

  console.log('⚠️ 지역 정보 추출 실패, fallback 사용');
  return fallback;
}

/**
 * 🌍 Google address_components에서 정보 추출
 */
function extractFromGoogleAddressComponents(
  addressComponents: any[], 
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
function extractFromFormattedAddress(
  formattedAddress: string, 
  fallback: { location_region: string | null; country_code: string | null; }
): { location_region: string | null; country_code: string | null; } {
  console.log(`📍 formatted_address 분석: ${formattedAddress}`);
  
  const address = formattedAddress.toLowerCase();
  let location_region: string | null = null;
  let country_code: string | null = null;

  // 국가 감지
  const countryMappings = {
    '대한민국': 'KOR', '한국': 'KOR', 'south korea': 'KOR', 'korea': 'KOR',
    '태국': 'THA', 'thailand': 'THA',
    '중국': 'CHN', 'china': 'CHN',
    '일본': 'JPN', 'japan': 'JPN',
    '미국': 'USA', 'united states': 'USA', 'usa': 'USA',
    '프랑스': 'FRA', 'france': 'FRA',
    '영국': 'GBR', 'united kingdom': 'GBR', 'uk': 'GBR',
    '이탈리아': 'ITA', 'italy': 'ITA',
    '스페인': 'ESP', 'spain': 'ESP',
    '독일': 'DEU', 'germany': 'DEU'
  };

  // 국가 코드 추출
  for (const [keyword, code] of Object.entries(countryMappings)) {
    if (address.includes(keyword)) {
      country_code = code;
      console.log(`🌍 국가 감지: ${keyword} → ${country_code}`);
      break;
    }
  }

  // 주요 도시/지역 추출
  const cityMappings = {
    '방콕': '방콕', 'bangkok': '방콕',
    '서울': '서울특별시', 'seoul': '서울특별시',
    '부산': '부산광역시', 'busan': '부산광역시',
    '파리': '파리', 'paris': '파리',
    '런던': '런던', 'london': '런던',
    '로마': '로마', 'rome': '로마',
    '뉴욕': '뉴욕', 'new york': '뉴욕',
    '도쿄': '도쿄', 'tokyo': '도쿄',
    '베이징': '베이징', 'beijing': '베이징'
  };

  for (const [keyword, region] of Object.entries(cityMappings)) {
    if (address.includes(keyword)) {
      location_region = region;
      console.log(`🏞️ 지역 감지: ${keyword} → ${location_region}`);
      break;
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
 * 🌍 ISO 3166-1 alpha-2를 alpha-3로 변환 (확장된 버전)
 */
function convertCountryCodeToAlpha3(alpha2Code: string): string {
  const conversionMap: { [key: string]: string } = {
    // 기존 매핑
    'KR': 'KOR', 'TH': 'THA', 'CN': 'CHN', 'JP': 'JPN',
    'US': 'USA', 'FR': 'FRA', 'GB': 'GBR', 'IT': 'ITA',
    'ES': 'ESP', 'DE': 'DEU', 'AU': 'AUS', 'CA': 'CAN',
    'IN': 'IND', 'BR': 'BRA', 'RU': 'RUS', 'MX': 'MEX',
    'VN': 'VNM', 'ID': 'IDN', 'MY': 'MYS', 'SG': 'SGP',
    
    // 새로 추가된 매핑
    'PE': 'PER', // 페루
    'EG': 'EGY', // 이집트
    'GR': 'GRC', // 그리스
    'KH': 'KHM', // 캄보디아
    'NO': 'NOR', // 노르웨이
    'ZA': 'ZAF', // 남아프리카공화국
    'AR': 'ARG', // 아르헨티나
    'CL': 'CHL', // 칠레
    'CO': 'COL', // 콜롬비아
    'EC': 'ECU', // 에콰도르
    'UY': 'URY', // 우루과이
    'PY': 'PRY', // 파라과이
    'BO': 'BOL', // 볼리비아
    'VE': 'VEN', // 베네수엘라
    'GY': 'GUY', // 가이아나
    'SR': 'SUR', // 수리남
    
    // 아프리카
    'MA': 'MAR', // 모로코
    'DZ': 'DZA', // 알제리
    'TN': 'TUN', // 튀니지
    'LY': 'LBY', // 리비아
    'SD': 'SDN', // 수단
    'ET': 'ETH', // 에티오피아
    'KE': 'KEN', // 케냐
    'TZ': 'TZA', // 탄자니아
    'UG': 'UGA', // 우간다
    'RW': 'RWA', // 르완다
    'BW': 'BWA', // 보츠와나
    'ZW': 'ZWE', // 짐바브웨
    'ZM': 'ZMB', // 잠비아
    'MW': 'MWI', // 말라위
    'MZ': 'MOZ', // 모잠비크
    'MG': 'MDG', // 마다가스카르
    'MU': 'MUS', // 모리셔스
    'SC': 'SYC', // 세이셸
    
    // 유럽
    'SE': 'SWE', // 스웨덴
    'DK': 'DNK', // 덴마크
    'FI': 'FIN', // 핀란드
    'IS': 'ISL', // 아이슬란드
    'IE': 'IRL', // 아일랜드
    'NL': 'NLD', // 네덜란드
    'BE': 'BEL', // 벨기에
    'LU': 'LUX', // 룩셈부르크
    'CH': 'CHE', // 스위스
    'AT': 'AUT', // 오스트리아
    'PT': 'PRT', // 포르투갈
    'PL': 'POL', // 폴란드
    'CZ': 'CZE', // 체코
    'SK': 'SVK', // 슬로바키아
    'HU': 'HUN', // 헝가리
    'SI': 'SVN', // 슬로베니아
    'HR': 'HRV', // 크로아티아
    'BA': 'BIH', // 보스니아 헤르체고비나
    'RS': 'SRB', // 세르비아
    'ME': 'MNE', // 몬테네그로
    'MK': 'MKD', // 북마케도니아
    'AL': 'ALB', // 알바니아
    'BG': 'BGR', // 불가리아
    'RO': 'ROU', // 루마니아
    'MD': 'MDA', // 몰도바
    'UA': 'UKR', // 우크라이나
    'BY': 'BLR', // 벨라루스
    'LT': 'LTU', // 리투아니아
    'LV': 'LVA', // 라트비아
    'EE': 'EST', // 에스토니아
    'MT': 'MLT', // 몰타
    'CY': 'CYP', // 키프로스
    
    // 오세아니아
    'NZ': 'NZL', // 뉴질랜드
    'FJ': 'FJI', // 피지
    'PG': 'PNG', // 파푸아뉴기니
    'SB': 'SLB', // 솔로몬 아일랜드
    'VU': 'VUT', // 바누아투
    'NC': 'NCL', // 뉴칼레도니아
    'PF': 'PYF', // 프랑스령 폴리네시아
    
    // 중동
    'SA': 'SAU', // 사우디아라비아
    'AE': 'ARE', // 아랍에미리트
    'QA': 'QAT', // 카타르
    'BH': 'BHR', // 바레인
    'KW': 'KWT', // 쿠웨이트
    'OM': 'OMN', // 오만
    'YE': 'YEM', // 예멘
    'JO': 'JOR', // 요단
    'LB': 'LBN', // 레바논
    'SY': 'SYR', // 시리아
    'IQ': 'IRQ', // 이라크
    'IR': 'IRN', // 이란
    'IL': 'ISR', // 이스라엘
    'PS': 'PSE', // 팔레스타인
    'TR': 'TUR', // 터키
    
    // 추가 아시아
    'PK': 'PAK', // 파키스탄
    'BD': 'BGD', // 방글라데시
    'LK': 'LKA', // 스리랑카
    'MV': 'MDV', // 몰디브
    'NP': 'NPL', // 네팔
    'BT': 'BTN', // 부탄
    'MM': 'MMR', // 미얀마
    'LA': 'LAO', // 라오스
    'MN': 'MNG', // 몽골
    'KZ': 'KAZ', // 카자흐스탄
    'KG': 'KGZ', // 키르기스스탄
    'TJ': 'TJK', // 타지키스탄
    'TM': 'TKM', // 투르크메니스탄
    'UZ': 'UZB', // 우즈베키스탄
    'AF': 'AFG', // 아프가니스탄
    'PH': 'PHL', // 필리핀
    'TW': 'TWN', // 대만
    'HK': 'HKG', // 홍콩
    'MO': 'MAC'  // 마카오
  };
  
  return conversionMap[alpha2Code.toUpperCase()] || alpha2Code;
}

/**
 * 🌍 장소명과 지역 컨텍스트로부터 지역 정보 추출
 */
function extractRegionalInfo(locationName: string, parentRegion?: string, regionalContext?: any): {
  location_region: string | null;
  country_code: string | null;
} {
  const name = locationName.toLowerCase();
  
  // 1. parentRegion이 있는 경우 우선 사용
  if (parentRegion) {
    const countryCode = inferCountryCodeFromRegion(parentRegion);
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
      return {
        location_region: region || null,
        country_code: country || (region ? inferCountryCodeFromRegion(region) : null)
      };
    }
  }
  
  // 3. 장소명으로부터 지역 추정
  return inferRegionalInfoFromLocationName(name);
}

/**
 * 🌍 지역명으로부터 국가 코드 추정 (Alpha-3 형식)
 */
function inferCountryCodeFromRegion(region: string): string {
  const regionLower = region.toLowerCase();
  
  // 태국
  if (regionLower.includes('bangkok') || regionLower.includes('방콕') || regionLower.includes('thailand') || regionLower.includes('태국')) {
    return 'THA';
  }
  
  // 한국 지역
  if (regionLower.includes('서울') || regionLower.includes('부산') || regionLower.includes('제주') || 
      regionLower.includes('경기') || regionLower.includes('강원') || regionLower.includes('충청') ||
      regionLower.includes('전라') || regionLower.includes('경상') || regionLower.includes('korea')) {
    return 'KOR';
  }
  
  // 프랑스
  if (regionLower.includes('paris') || regionLower.includes('파리') || regionLower.includes('france')) {
    return 'FRA';
  }
  
  // 영국
  if (regionLower.includes('london') || regionLower.includes('런던') || regionLower.includes('england') || regionLower.includes('uk')) {
    return 'GBR';
  }
  
  // 이탈리아
  if (regionLower.includes('rome') || regionLower.includes('로마') || regionLower.includes('italy')) {
    return 'ITA';
  }
  
  // 미국
  if (regionLower.includes('new york') || regionLower.includes('뉴욕') || regionLower.includes('california') || regionLower.includes('usa')) {
    return 'USA';
  }
  
  // 일본
  if (regionLower.includes('tokyo') || regionLower.includes('도쿄') || regionLower.includes('japan') ||
      regionLower.includes('osaka') || regionLower.includes('오사카') || regionLower.includes('kyoto')) {
    return 'JPN';
  }
  
  // 중국
  if (regionLower.includes('beijing') || regionLower.includes('베이징') || regionLower.includes('china') ||
      regionLower.includes('shanghai') || regionLower.includes('상하이')) {
    return 'CHN';
  }
  
  // 베트남
  if (regionLower.includes('vietnam') || regionLower.includes('베트남') || regionLower.includes('하노이') || regionLower.includes('호치민')) {
    return 'VNM';
  }
  
  // 싱가포르
  if (regionLower.includes('singapore') || regionLower.includes('싱가포르')) {
    return 'SGP';
  }
  
  // 말레이시아
  if (regionLower.includes('malaysia') || regionLower.includes('말레이시아') || regionLower.includes('쿠알라룸푸르')) {
    return 'MYS';
  }
  
  // 인도네시아
  if (regionLower.includes('indonesia') || regionLower.includes('인도네시아') || regionLower.includes('자카르타') || regionLower.includes('발리')) {
    return 'IDN';
  }
  
  // 기본값: 한국
  return 'KOR';
}

/**
 * 🎯 관광 접근성 기반 지역 추론 (동적 방식)
 */
function inferRegionByTourismAccessibility(locationName: string): {
  location_region: string | null;
  country_code: string | null;
} {
  const name = locationName.toLowerCase();
  
  // 관광 접근성 점수 기반 지역 선택
  const accessibilityScore = {
    seoul: 0,
    busan: 0,
    gyeongju: 0,
    jeju: 0
  };
  
  // 국제적 인지도 및 교통 접근성 평가
  if (name.includes('용궁') || name.includes('바다') || name.includes('해안')) {
    accessibilityScore.busan += 3; // 해안 접근성
  }
  
  if (name.includes('역사') || name.includes('고대') || name.includes('신라')) {
    accessibilityScore.gyeongju += 2; // 역사적 중요성
  }
  
  if (name.includes('도심') || name.includes('중심')) {
    accessibilityScore.seoul += 2; // 도심 접근성
  }
  
  // 관광 인프라 평가 (국제공항, KTX, 지하철)
  accessibilityScore.seoul += 3; // 최고 교통 인프라
  accessibilityScore.busan += 2; // 좋은 교통 인프라
  accessibilityScore.jeju += 1;  // 공항 접근성
  accessibilityScore.gyeongju += 1; // KTX 접근성
  
  // 최고 점수 지역 선택
  const maxScore = Math.max(...Object.values(accessibilityScore));
  const selectedRegion = Object.entries(accessibilityScore)
    .find(([_, score]) => score === maxScore)?.[0];
  
  switch (selectedRegion) {
    case 'busan': return { location_region: '부산광역시', country_code: 'KOR' };
    case 'seoul': return { location_region: '서울특별시', country_code: 'KOR' };
    case 'gyeongju': return { location_region: '경상북도', country_code: 'KOR' };
    case 'jeju': return { location_region: '제주특별자치도', country_code: 'KOR' };
    default: return { location_region: '부산광역시', country_code: 'KOR' }; // 기본값: 관광 접근성 우수
  }
}

/**
 * 🌍 장소명으로부터 지역 정보 추정 (강화된 버전)
 */
function inferRegionalInfoFromLocationName(locationName: string): {
  location_region: string | null;
  country_code: string | null;
} {
  const name = locationName.toLowerCase();
  
  // 🇹🇭 태국 관련 키워드
  if (name.includes('bangkok') || name.includes('방콕') || 
      name.includes('대왕궁') || name.includes('왓프라깨우') || name.includes('왓 프라깨우') || name.includes('에메랄드') ||
      name.includes('차오프라야') || name.includes('아유타야') || name.includes('치앙마이') ||
      name.includes('wat phra kaew') || name.includes('temple of emerald buddha')) {
    return { location_region: '방콕', country_code: 'THA' };
  }
  
  // 🇵🇪 페루 관련 키워드
  else if (name.includes('machu picchu') || name.includes('마추픽추') || name.includes('마추피추') ||
           name.includes('cusco') || name.includes('쿠스코') || name.includes('잉카') || name.includes('inca')) {
    return { location_region: '쿠스코', country_code: 'PER' };
  }
  
  // 🇪🇬 이집트 관련 키워드  
  else if (name.includes('pyramid') || name.includes('피라미드') || name.includes('기자') || name.includes('giza') ||
           name.includes('sphinx') || name.includes('스핑크스') || name.includes('pharaoh') || name.includes('파라오')) {
    return { location_region: '기자', country_code: 'EGY' };
  }
  
  // 🇬🇷 그리스 관련 키워드
  else if (name.includes('santorini') || name.includes('산토리니') || name.includes('mykonos') || name.includes('미코노스') ||
           name.includes('athens') || name.includes('아테네') || name.includes('acropolis') || name.includes('아크로폴리스') ||
           name.includes('parthenon') || name.includes('파르테논') || name.includes('cyclades') || name.includes('키클라데스')) {
    return { location_region: '키클라데스', country_code: 'GRC' };
  }
  
  // 🇧🇷 브라질 관련 키워드
  else if (name.includes('iguazu') || name.includes('이과수') || name.includes('iguacu') || name.includes('이구아수') ||
           name.includes('rio de janeiro') || name.includes('리우') || name.includes('sao paulo') || name.includes('상파울루') ||
           name.includes('christ redeemer') || name.includes('구세주 그리스도') || name.includes('copacabana') || name.includes('코파카바나')) {
    return { location_region: '파라나', country_code: 'BRA' };
  }
  
  // 🇰🇭 캄보디아 관련 키워드
  else if (name.includes('angkor wat') || name.includes('앙코르와트') || name.includes('angkor') || name.includes('앙코르') ||
           name.includes('siem reap') || name.includes('시엠레아프') || name.includes('bayon') || name.includes('바욘')) {
    return { location_region: '시엠레아프', country_code: 'KHM' };
  }
  
  // 🇳🇴 노르웨이 관련 키워드
  else if (name.includes('viking') || name.includes('바이킹') || name.includes('oslo') || name.includes('오슬로') ||
           name.includes('bergen') || name.includes('베르겐') || name.includes('norway') || name.includes('노르웨이') ||
           name.includes('fjord') || name.includes('피오르드')) {
    return { location_region: '오슬로', country_code: 'NOR' };
  }
  
  // 🇿🇦 남아프리카공화국 관련 키워드
  else if (name.includes('table mountain') || name.includes('테이블마운틴') || name.includes('cape town') || name.includes('케이프타운') ||
           name.includes('kruger') || name.includes('크루거') || name.includes('johannesburg') || name.includes('요하네스버그')) {
    return { location_region: '웨스턴케이프', country_code: 'ZAF' };
  }
  
  // 🇰🇷 한국 지역들 (동적 패턴 인식)
  
  // 🏯 관광지 패턴 기반 지역 추론
  else if (name.includes('사') || name.includes('절') || name.includes('temple')) {
    // 사찰/절의 경우 관광 접근성이 좋은 주요 도시 우선
    return inferRegionByTourismAccessibility(name);
  }
  
  // 일반 지역별 매핑
  else if (name.includes('서울') || name.includes('seoul')) {
    return { location_region: '서울특별시', country_code: 'KOR' };
  } else if (name.includes('부산') || name.includes('busan')) {
    return { location_region: '부산광역시', country_code: 'KOR' };
  } else if (name.includes('제주') || name.includes('jeju')) {
    return { location_region: '제주특별자치도', country_code: 'KOR' };
  } else if (name.includes('경주') || name.includes('gyeongju')) {
    return { location_region: '경상북도', country_code: 'KOR' };
  } else if (name.includes('인천') || name.includes('incheon')) {
    return { location_region: '인천광역시', country_code: 'KOR' };
  } else if (name.includes('대전') || name.includes('daejeon')) {
    return { location_region: '대전광역시', country_code: 'KOR' };
  } else if (name.includes('대구') || name.includes('daegu')) {
    return { location_region: '대구광역시', country_code: 'KOR' };
  } else if (name.includes('광주') || name.includes('gwangju')) {
    return { location_region: '광주광역시', country_code: 'KOR' };
  } else if (name.includes('울산') || name.includes('ulsan')) {
    return { location_region: '울산광역시', country_code: 'KOR' };
  } else if (name.includes('수원') || name.includes('suwon')) {
    return { location_region: '경기도', country_code: 'KOR' };
  }
  
  // 🇫🇷 프랑스
  else if (name.includes('paris') || name.includes('파리') || name.includes('에펠') || name.includes('루브르')) {
    return { location_region: '파리', country_code: 'FRA' };
  }
  
  // 🇬🇧 영국
  else if (name.includes('london') || name.includes('런던') || name.includes('빅벤')) {
    return { location_region: '런던', country_code: 'GBR' };
  }
  
  // 🇮🇹 이탈리아
  else if (name.includes('rome') || name.includes('로마') || name.includes('콜로세움')) {
    return { location_region: '로마', country_code: 'ITA' };
  }
  
  // 🇺🇸 미국
  else if (name.includes('new york') || name.includes('뉴욕') || name.includes('자유의 여신')) {
    return { location_region: '뉴욕', country_code: 'USA' };
  }
  
  // 🇯🇵 일본
  else if (name.includes('tokyo') || name.includes('도쿄') || name.includes('동경') ||
           name.includes('kyoto') || name.includes('교토') || name.includes('osaka') || name.includes('오사카')) {
    return { location_region: '도쿄', country_code: 'JPN' };
  }
  
  // 🇨🇳 중국
  else if (name.includes('beijing') || name.includes('베이징') || name.includes('북경') ||
           name.includes('shanghai') || name.includes('상하이') || name.includes('만리장성')) {
    return { location_region: '베이징', country_code: 'CHN' };
  }
  
  // 🇻🇳 베트남
  else if (name.includes('vietnam') || name.includes('베트남') || name.includes('하노이') || name.includes('호치민')) {
    return { location_region: '하노이', country_code: 'VNM' };
  }
  
  // 🇸🇬 싱가포르
  else if (name.includes('singapore') || name.includes('싱가포르')) {
    return { location_region: '싱가포르', country_code: 'SGP' };
  }
  
  // 🇲🇾 말레이시아
  else if (name.includes('malaysia') || name.includes('말레이시아') || name.includes('쿠알라룸푸르')) {
    return { location_region: '쿠알라룸푸르', country_code: 'MYS' };
  }
  
  // 🇮🇩 인도네시아
  else if (name.includes('indonesia') || name.includes('인도네시아') || name.includes('자카르타') || name.includes('발리')) {
    return { location_region: '자카르타', country_code: 'IDN' };
  }
  
  // 🇰🇷 한국 관련 키워드가 있으면 한국으로 분류
  else if (name.includes('궁') || name.includes('사찰') || name.includes('절') || 
           name.includes('경복') || name.includes('창덕') || name.includes('불국') ||
           name.includes('석굴암') || name.includes('종묘') || name.includes('덕수')) {
    return { location_region: '서울특별시', country_code: 'KOR' };
  }
  
  // 🌍 기본값: 입력된 장소명에서 국가를 유추할 수 없는 경우
  console.log(`⚠️ 국가 유추 실패: ${locationName} - 한국으로 기본 설정`);
  return { location_region: null, country_code: 'KOR' };
}

export async function POST(request: NextRequest) {
  try {
    // 🌍 URL 파라미터에서 지역정보 추출
    const { searchParams } = new URL(request.url);
    const urlRegion = searchParams.get('region');
    const urlCountryCode = searchParams.get('countryCode');

    const body = await request.json();
    const { 
      locationName, 
      language, 
      userProfile, 
      parentRegion,
      regionalContext,
      locationRegion,
      countryCode
    } = body;

    // 🌍 지역정보 우선순위: 본문 > URL 파라미터
    const finalRegion = locationRegion || urlRegion;
    const finalCountryCode = countryCode || urlCountryCode;
    const finalParentRegion = parentRegion || finalRegion;

    if (!locationName || !language) {
      return NextResponse.json(
        { 
          success: false, 
          error: '위치명과 언어는 필수입니다.' 
        },
        { status: 400 }
      );
    }

    // 🌍 1단계: 기본 지역 정보 추출
    console.log(`\n🌍 1단계: 기본 지역 정보 추출: ${locationName}`);
    
    // 향상된 regionalContext 구성
    const enhancedRegionalContext = {
      ...(regionalContext || {}),
      region: finalRegion,
      countryCode: finalCountryCode
    };
    
    const initialRegionalInfo = extractRegionalInfo(locationName, finalParentRegion, enhancedRegionalContext);
    console.log(`🌍 기본 지역 정보:`, initialRegionalInfo);

    // ⚡ 2단계: AI 가이드 생성 (지오코딩은 나중에 간단하게 처리)
    console.log(`\n⚡ 2단계: AI 가이드 생성 시작`);
    
    // AI 가이드 생성
    const aiGenerationResult = await (async () => {
      try {
        console.log(`🤖 AI 가이드 생성 시작: ${language}`);
        
        // 프롬프트 생성
        const contextualLocationName = finalParentRegion 
          ? `${locationName} (${finalParentRegion} 지역)`
          : locationName;
        const prompt = await createAutonomousGuidePrompt(contextualLocationName, language, userProfile);
        
        // AI 모델 호출
        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash-lite-preview-06-17',
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16384,
            topK: 40,
            topP: 0.9,
          }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
          throw new Error('AI 응답이 비어있습니다');
        }

        console.log(`✅ AI 생성 완료: ${text.length}자`);
        return text;
      } catch (error) {
        console.error('❌ AI 생성 실패:', error);
        throw error;
      }
    })();

    // AI 생성 결과 처리
    console.log(`✅ AI 생성 완료`);
    const text = aiGenerationResult;
    console.log(`🌍 기본 지역 정보:`, initialRegionalInfo);
    console.log(`📥 ${language} AI 응답 수신: ${text.length}자`);

    // 🚨 AI 응답 디버깅 - 처음 1000글자만 출력
    console.log(`🔍 AI 응답 내용 (처음 1000자):`);
    console.log(text.substring(0, 1000));
    console.log(`🔍 AI 응답 끝부분 (마지막 500자):`);
    console.log(text.substring(Math.max(0, text.length - 500)));

    // JSON 파싱 시도
    let guideData;
    let validChapters: any[] = []; // 🔥 스코프 외부로 이동
    
    try {
      // JSON 블록 추출 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        guideData = JSON.parse(jsonMatch[0]);
        
        // 🔥 핵심: AI가 realTimeGuide.chapters 없이 route.steps만 생성한 경우 자동 변환
        if (!guideData.realTimeGuide?.chapters && guideData.route?.steps) {
          console.log(`🔄 route.steps → realTimeGuide.chapters 자동 변환 시작`);
          
          // route.steps를 기반으로 realTimeGuide.chapters 생성
          guideData.realTimeGuide = guideData.realTimeGuide || {};
          guideData.realTimeGuide.chapters = guideData.route.steps.map((step: any, index: number) => ({
            id: index,
            title: step.title || step.location || `챕터 ${index + 1}`,
            narrative: `${step.title || step.location}에 대한 상세한 설명입니다.`,
            nextDirection: index < guideData.route.steps.length - 1 
              ? `다음 장소인 ${guideData.route.steps[index + 1].title}로 이동하겠습니다.`
              : "관람을 마치시고 자유롭게 둘러보시거나 출구 방향으로 이동하시면 됩니다."
          }));
          
          console.log(`✅ route.steps → realTimeGuide.chapters 변환 완료: ${guideData.realTimeGuide.chapters.length}개`);
        }
        
        // 🔥 핵심: 안전한 챕터 카운팅 및 유효성 검증
        if (guideData.realTimeGuide?.chapters) {
          // 유효한 챕터만 필터링 (id와 title이 있는 것)
          validChapters = guideData.realTimeGuide.chapters.filter((chapter: any) => 
            chapter && 
            (chapter.id !== undefined && chapter.id !== null) && 
            chapter.title && 
            chapter.title.trim()
          );
          
          console.log(`🔍 ${language} 전체 챕터: ${guideData.realTimeGuide.chapters.length}개`);
          console.log(`🔍 ${language} 유효한 챕터: ${validChapters.length}개`);
          
          validChapters.forEach((chapter: any, index: number) => {
            console.log(`  챕터 ID ${chapter.id}: "${chapter.title}"`);
            console.log(`    narrative: ${chapter.narrative ? `${chapter.narrative.substring(0, 100)}...` : 'MISSING'}`);
            console.log(`    nextDirection: ${chapter.nextDirection ? `${chapter.nextDirection.substring(0, 50)}...` : 'MISSING'}`);
          });
        }
        
        // 🔥 핵심: 유효한 챕터들만 처리 (좌표 처리는 나중에)
        if (validChapters.length > 0) {
          guideData.realTimeGuide.chapters = validChapters.map((chapter: any) => {
            // 🚨 narrative 통합 (3개 필드를 합쳐서 narrative로 생성)
            const sceneDescription = chapter.sceneDescription || '';
            const coreNarrative = chapter.coreNarrative || '';
            const humanStories = chapter.humanStories || '';
            const existingNarrative = chapter.narrative || '';
            
            // 3개 필드가 있으면 통합, 없으면 기존 narrative 사용
            const fieldsArray = [sceneDescription, coreNarrative, humanStories].filter(Boolean);
            const combinedNarrative = fieldsArray.length > 0 
              ? fieldsArray.join(' ') 
              : existingNarrative;
            
            // 🔥 3개 필드 통합 디버깅
            console.log(`📝 챕터 ${chapter.id} 필드 통합:`);
            console.log(`  sceneDescription: ${sceneDescription ? sceneDescription.length + '글자' : '없음'}`);
            console.log(`  coreNarrative: ${coreNarrative ? coreNarrative.length + '글자' : '없음'}`);
            console.log(`  humanStories: ${humanStories ? humanStories.length + '글자' : '없음'}`);
            console.log(`  combinedNarrative: ${combinedNarrative ? combinedNarrative.length + '글자' : '없음'}`);
            
            // AI가 생성한 좌표 정보는 제거 (나중에 정확한 좌표로 교체)
            let cleanNarrative = combinedNarrative
              .replace(/위도[\s:：]*\d{1,2}\.\d{4,8}[,，\s]*경도[\s:：]*\d{1,3}\.\d{4,8}/gi, '') // 위도/경도 패턴 제거
              .replace(/\{\s*["']?(?:lat|latitude)["']?\s*:\s*\d{1,2}\.\d{4,8}\s*,\s*["']?(?:lng|longitude)["']?\s*:\s*\d{1,3}\.\d{4,8}\s*\}/gi, '') // JSON 좌표 제거
              .replace(/\[\s*\d{1,2}\.\d{4,8}\s*,\s*\d{1,3}\.\d{4,8}\s*\]/g, '') // 배열 좌표 제거
              .replace(/\d{1,2}\.\d{4,8}[,，\s]+\d{1,3}\.\d{4,8}/g, '') // 일반 좌표 제거
              .replace(/\s+/g, ' ') // 여러 공백을 하나로
              .replace(/^\s*[,，.。]\s*/, '') // 시작 구두점 제거
              .replace(/\s*[,，.。]\s*$/, '') // 끝 구두점 정리
              .trim();
            
            return {
              ...chapter,
              narrative: cleanNarrative,
              // 좌표는 나중에 처리하므로 일단 제거
              coordinates: undefined,
              lat: undefined,
              lng: undefined,
              // 3개 필드는 제거 (narrative로 통합됨)
              sceneDescription: undefined,
              coreNarrative: undefined,
              humanStories: undefined
            };
          });
        }
        
        // 🔥 새로운 개요 양식 정규화
        if (guideData.overview) {
          // 새로운 필드들이 없으면 기존 summary를 사용
          if (!guideData.overview.location && !guideData.overview.keyFeatures && !guideData.overview.background) {
            // 기존 summary가 있으면 그대로 유지 (호환성)
            if (guideData.overview.summary) {
              console.log(`📝 ${language} 기존 개요 구조 유지`);
            } else {
              // 기본 개요 구조 생성
              guideData.overview = {
                ...guideData.overview,
                location: `${locationName}의 정확한 위치`,
                keyFeatures: `${locationName}의 주요 특징`,
                background: `${locationName}의 역사적 배경`
              };
            }
          } else {
            console.log(`✅ ${language} 새로운 개요 양식 적용`);
          }
        }
        
        console.log(`✅ ${language} 가이드 정규화 완료: ${validChapters.length}개 유효한 챕터`);
      } else {
        // JSON 블록이 없으면 전체 텍스트를 기본 구조로 래핑
        guideData = {
          overview: {
            title: locationName,
            location: `${locationName}의 정확한 위치`,
            keyFeatures: `${locationName}의 주요 특징`,
            background: `${locationName}의 역사적 배경`,
            keyFacts: [],
            visitInfo: {},
            narrativeTheme: ''
          },
          route: { steps: [] },
          realTimeGuide: { chapters: [] }
        };
      }
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 기본 구조 사용:', parseError);
      guideData = {
        overview: {
          title: locationName,
          location: `${locationName}의 정확한 위치`,
          keyFeatures: `${locationName}의 주요 특징`,
          background: `${locationName}의 역사적 배경`,
          keyFacts: [],
          visitInfo: {},
          narrativeTheme: ''
        },
        route: { steps: [] },
        realTimeGuide: { chapters: [] }
      };
    }

    console.log(`✅ ${language} AI 가이드 파싱 완료 - 이제 간단한 좌표 생성 시작`);
    
    // 🎯 3단계: 정확한 국가코드 추출 시스템으로 좌표 생성
    console.log(`\n🔍 정확한 위치 정보 추출 시작`);
    
    // 새로운 정확한 국가코드 추출 시스템 호출
    const accurateResult = await extractAccurateLocationInfo(locationName, language);
    
    let baseCoordinates: { lat: number; lng: number } | null = null;
    let finalRegionalInfo = initialRegionalInfo;
    
    if (accurateResult) {
      console.log(`✅ 정확한 위치 정보 추출 성공`);
      baseCoordinates = accurateResult.coordinates;
      
      // Google API에서 가져온 정확한 지역 정보로 업데이트
      finalRegionalInfo = {
        location_region: accurateResult.region,
        country_code: accurateResult.countryCode
      };
      
      console.log(`📍 기본 좌표: ${baseCoordinates.lat}, ${baseCoordinates.lng}`);
      console.log(`🌍 업데이트된 지역 정보:`, finalRegionalInfo);
      console.log(`🎯 정확성: ${(accurateResult.confidence * 100).toFixed(1)}%`);
    } else {
      console.log(`⚠️ 정확한 위치 정보 추출 실패 - 기본값 사용`);
      // fallback으로 기존 simpleGeocode 사용
      const simpleResult = await simpleGeocode(locationName);
      if (simpleResult) {
        baseCoordinates = simpleResult.coordinates;
        finalRegionalInfo = {
          location_region: simpleResult.location_region,
          country_code: simpleResult.country_code
        };
        console.log(`📍 fallback 좌표: ${baseCoordinates.lat}, ${baseCoordinates.lng}`);
        console.log(`🌍 fallback 지역 정보:`, finalRegionalInfo);
      }
    }
    
    // 모든 챕터에 기본 좌표 적용
    const coordinatesArray: ({ lat: number; lng: number } | null)[] = [];
    if (validChapters && validChapters.length > 0) {
      for (let i = 0; i < validChapters.length; i++) {
        coordinatesArray.push(baseCoordinates);
      }
      console.log(`📊 챕터 좌표 배열: ${coordinatesArray.length}개 (모두 기본 좌표 사용)`);
    }
    
    // 🎯 4단계: 생성된 좌표를 챕터에 적용
    console.log(`\n📍 챕터에 좌표 적용 시작`);
    
    if (guideData.realTimeGuide?.chapters && validChapters.length > 0) {
      console.log(`📍 ${validChapters.length}개 유효한 챕터에 좌표 적용`);
      
      // 각 챕터에 해당하는 좌표 적용
      guideData.realTimeGuide.chapters = validChapters.map((chapter: any, index: number) => {
        const chapterCoordinate = coordinatesArray[index] || 
          (baseCoordinates ? {
            lat: baseCoordinates.lat,
            lng: baseCoordinates.lng
          } : { lat: 37.5665, lng: 126.9780 }); // 기본값: 서울시청
        
        // 🎯 정규화된 챕터 구조: narrative와 nextDirection 사이에 coordinates 추가
        const normalizedChapter = {
          ...chapter,
          coordinates: chapterCoordinate ? {
            lat: chapterCoordinate.lat,
            lng: chapterCoordinate.lng
          } : { lat: 37.5665, lng: 126.9780 }
        };
        
        console.log(`  ✅ 챕터 ${index}: "${chapter.title}" → 좌표 (${normalizedChapter.coordinates.lat}, ${normalizedChapter.coordinates.lng}) 적용`);
        return normalizedChapter;
      });
      
      console.log(`✅ 총 ${validChapters.length}개 챕터에 좌표 적용 완료`);
      
      // 좌표 성공 정보 저장
      guideData.locationCoordinateStatus = {
        locationName: locationName,
        coordinateSearchAttempted: true,
        coordinateFound: !!baseCoordinates,
        coordinateSource: baseCoordinates ? 'simple_geocoding' : 'fallback_default',
        coordinates: baseCoordinates,
        lastAttempt: new Date().toISOString()
      };
      
    } else {
      console.log(`⚠️ 유효한 챕터가 없음 - 기본 구조 생성`);
      
      // 기본 챕터 구조 생성
      guideData.realTimeGuide = guideData.realTimeGuide || {};
      guideData.realTimeGuide.chapters = [
        {
          id: 1,
          title: `${locationName} 가이드`,
          narrative: `${locationName}에 대한 안내입니다.`,
          coordinates: baseCoordinates || { lat: 37.5665, lng: 126.9780 },
          nextDirection: `${locationName} 탐방을 시작해보세요.`
        }
      ];
      
      // 좌표 성공 정보 저장
      guideData.locationCoordinateStatus = {
        locationName: locationName,
        coordinateSearchAttempted: true,
        coordinateFound: !!baseCoordinates,
        coordinateSource: baseCoordinates ? 'simple_geocoding' : 'fallback_default',
        coordinates: baseCoordinates,
        lastAttempt: new Date().toISOString()
      };
      
      console.log(`✅ 기본 챕터 구조 생성 및 좌표 적용 완료`);
    }

    // 🎯 5단계: 생성된 coordinatesArray를 guideData에 추가 (DB 저장용)
    console.log(`\n📍 좌표 배열을 guideData에 추가`);
    
    // DB 저장용 좌표 배열 구성
    const dbCoordinatesArray: { chapterId: any; title: string; lat: number; lng: number }[] = [];
    if (validChapters && validChapters.length > 0) {
      validChapters.forEach((chapter, index) => {
        const coord = coordinatesArray[index] || baseCoordinates;
        if (coord) {
          dbCoordinatesArray.push({
            chapterId: chapter.id || index,
            title: chapter.title || `챕터 ${index + 1}`,
            lat: coord.lat,
            lng: coord.lng
          });
        }
      });
    }
    
    guideData.coordinatesArray = dbCoordinatesArray;
    
    console.log(`✅ DB 저장용 좌표 배열 추가 완료: ${dbCoordinatesArray.length}개`);
    dbCoordinatesArray.forEach((coord, idx) => {
      console.log(`  ${idx + 1}. [${coord.chapterId}] ${coord.title}: (${coord.lat}, ${coord.lng})`);
    });
    
    // 🎯 6단계: 지역 정보를 guideData에 추가
    guideData.regionalInfo = finalRegionalInfo;
    console.log(`🌍 지역 정보가 가이드 데이터에 추가됨:`, finalRegionalInfo);
    
    // 🎯 7단계: 최종 응답 반환 (가이드 생성만 담당, DB 저장은 별도 처리)
    console.log(`\n✅ ${language} 가이드 생성 최종 완료`);
    
    return NextResponse.json({
      success: true,
      data: guideData
    });

  } catch (error) {
    console.error(`❌ 가이드 생성 실패:`, error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `가이드 생성 실패: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined
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
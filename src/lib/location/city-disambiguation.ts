/**
 * 도시 모호성 해결 시스템
 * 
 * 여러 도시가 같은 이름을 가진 경우 사용자가 선택할 수 있도록 합니다.
 */

export interface CityOption {
  id: string;
  name: string;
  country: string;
  region: string;
  population?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
}

export interface DisambiguationResult {
  needsDisambiguation: boolean;
  options: CityOption[];
  query: string;
  autoSelected?: CityOption; // AI가 자동으로 선택한 도시 정보
}

// 전세계 모호한 도시명 데이터베이스
const AMBIGUOUS_CITIES: Record<string, CityOption[]> = {
  // Cambridge: 영국 vs 미국
  'cambridge': [
    {
      id: 'cambridge-uk',
      name: 'Cambridge',
      country: '영국',
      region: 'England',
      population: 145818,
      coordinates: { lat: 52.2053, lng: 0.1218 },
      description: '영국의 대학 도시, 캠브리지 대학교'
    },
    {
      id: 'cambridge-us',
      name: 'Cambridge',
      country: '미국',
      region: 'Massachusetts',
      population: 118403,
      coordinates: { lat: 42.3736, lng: -71.1097 },
      description: '미국 매사추세츠주, 하버드 대학교와 MIT'
    }
  ],
  
  // Alexandria: 이집트 vs 미국 여러 곳
  'alexandria': [
    {
      id: 'alexandria-egypt',
      name: 'Alexandria',
      country: '이집트',
      region: 'Alexandria Governorate',
      population: 5200000,
      coordinates: { lat: 31.2001, lng: 29.9187 },
      description: '이집트의 지중해 연안 도시, 고대 알렉산드리아'
    },
    {
      id: 'alexandria-virginia',
      name: 'Alexandria',
      country: '미국',
      region: 'Virginia',
      population: 159467,
      coordinates: { lat: 38.8048, lng: -77.0469 },
      description: '미국 버지니아주, 워싱턴 DC 근처'
    },
    {
      id: 'alexandria-louisiana',
      name: 'Alexandria',
      country: '미국',
      region: 'Louisiana',
      population: 45275,
      coordinates: { lat: 31.3112, lng: -92.4426 },
      description: '미국 루이지애나주'
    }
  ],
  
  // Brisbane: 호주 vs 미국
  'brisbane': [
    {
      id: 'brisbane-australia',
      name: 'Brisbane',
      country: '호주',
      region: 'Queensland',
      population: 2560720,
      coordinates: { lat: -27.4705, lng: 153.0260 },
      description: '호주 퀸즐랜드주의 주도'
    },
    {
      id: 'brisbane-california',
      name: 'Brisbane',
      country: '미국',
      region: 'California',
      population: 4282,
      coordinates: { lat: 37.6805, lng: -122.3997 },
      description: '미국 캘리포니아주 샌프란시스코 베이 지역'
    }
  ],
  
  // Paris: 프랑스 vs 미국 여러 곳
  'paris': [
    {
      id: 'paris-france',
      name: 'Paris',
      country: '프랑스',
      region: 'Île-de-France',
      population: 2165423,
      coordinates: { lat: 48.8566, lng: 2.3522 },
      description: '프랑스의 수도'
    },
    {
      id: 'paris-texas',
      name: 'Paris',
      country: '미국',
      region: 'Texas',
      population: 24171,
      coordinates: { lat: 33.6617, lng: -95.5555 },
      description: '미국 텍사스주'
    },
    {
      id: 'paris-tennessee',
      name: 'Paris',
      country: '미국',
      region: 'Tennessee',
      population: 10156,
      coordinates: { lat: 36.3020, lng: -88.3267 },
      description: '미국 테네시주'
    }
  ],
  
  // London: 영국 vs 캐나다 vs 미국
  'london': [
    {
      id: 'london-uk',
      name: 'London',
      country: '영국',
      region: 'England',
      population: 9648110,
      coordinates: { lat: 51.5074, lng: -0.1278 },
      description: '영국의 수도'
    },
    {
      id: 'london-ontario',
      name: 'London',
      country: '캐나다',
      region: 'Ontario',
      population: 422324,
      coordinates: { lat: 43.0045, lng: -81.2731 },
      description: '캐나다 온타리오주'
    },
    {
      id: 'london-kentucky',
      name: 'London',
      country: '미국',
      region: 'Kentucky',
      population: 8053,
      coordinates: { lat: 37.1289, lng: -84.0833 },
      description: '미국 켄터키주'
    }
  ]
};

/**
 * 유명도 기준으로 가장 유명한 도시 선택
 * 국제적 인지도 + 인구 + 관광 중요도를 고려
 */
function selectMostFamousCity(cities: CityOption[]): CityOption {
  // 유명도 점수 계산 (0-100점)
  const cityScores = cities.map(city => {
    let score = 0;
    
    // 1. 인구 점수 (40점 만점)
    const population = city.population || 0;
    if (population >= 5000000) score += 40; // 500만 이상
    else if (population >= 2000000) score += 35; // 200만 이상 
    else if (population >= 1000000) score += 30; // 100만 이상
    else if (population >= 500000) score += 25; // 50만 이상
    else if (population >= 100000) score += 20; // 10만 이상
    else score += Math.min(15, population / 10000); // 그 외
    
    // 2. 국제적 인지도 점수 (40점 만점)
    const name = city.name.toLowerCase();
    const country = city.country.toLowerCase();
    
    // 세계적으로 유명한 도시들
    if ((name === 'paris' && country === '프랑스') ||
        (name === 'london' && country === '영국') ||
        (name === 'new york' && country === '미국')) {
      score += 40;
    } else if ((name === 'tokyo' && country === '일본') ||
               (name === 'sydney' && country === '호주') ||
               (name === 'rome' && country === '이탈리아') ||
               (name === 'berlin' && country === '독일')) {
      score += 35;
    } else if ((name === 'cambridge' && country === '영국') ||
               (name === 'oxford' && country === '영국') ||
               (name === 'geneva' && country === '스위스') ||
               (name === 'venice' && country === '이탈리아')) {
      score += 30; // 역사적/학술적으로 유명한 도시
    } else if ((name === 'cambridge' && country === '미국') ||
               (name === 'alexandria' && country === '이집트')) {
      score += 25; // 역사적 의미나 학술적 가치
    } else if (country === '미국' || country === '영국' || country === '프랑스' || country === '독일') {
      score += 20; // 주요 선진국
    } else {
      score += 15; // 기본 점수
    }
    
    // 3. 관광/문화적 중요도 (20점 만점)
    if (name === 'paris' || name === 'london' || name === 'rome' || name === 'tokyo') {
      score += 20; // 세계 최고 관광지
    } else if (name === 'cambridge' && country === '영국') {
      score += 18; // 캠브리지 대학교
    } else if (name === 'alexandria' && country === '이집트') {
      score += 17; // 고대 알렉산드리아
    } else if (name === 'cambridge' && country === '미국') {
      score += 16; // 하버드, MIT
    } else {
      score += 10; // 기본 점수
    }
    
    return { city, score };
  });
  
  // 가장 높은 점수의 도시 선택
  const winner = cityScores.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );
  
  console.log(`🏆 유명도 점수: ${cityScores.map(cs => `${cs.city.name}(${cs.city.country}): ${cs.score}점`).join(', ')}`);
  console.log(`🎯 선택된 도시: ${winner.city.name}, ${winner.city.country} (${winner.score}점)`);
  
  return winner.city;
}

/**
 * 도시명이 모호한지 확인하고 선택 옵션 제공
 * AI 스마트 선택: 유명도 기준으로 자동 선택
 */
export function checkCityDisambiguation(query: string): DisambiguationResult {
  const normalizedQuery = query.toLowerCase().trim();
  
  // 모호한 도시인지 확인
  const options = AMBIGUOUS_CITIES[normalizedQuery];
  
  if (options && options.length > 1) {
    // 인구순 정렬
    const sortedOptions = options.sort((a, b) => (b.population || 0) - (a.population || 0));
    
    // 🤖 AI 스마트 선택: 가장 유명한 도시 자동 선택 (팝업 제거)
    // 모든 모호한 경우에 대해 가장 유명한(인구+국제적 인지도) 도시를 자동 선택
    const mostFamous = selectMostFamousCity(sortedOptions);
    
    console.log(`🤖 AI 자동 선택: ${mostFamous.name}, ${mostFamous.country} (인구: ${(mostFamous.population || 0).toLocaleString()}) - 유명도 기준`);
    
    return {
      needsDisambiguation: false,
      options: [mostFamous], // 자동 선택된 도시만 반환
      query: normalizedQuery,
      autoSelected: mostFamous // 자동 선택 정보
    };
  }
  
  return {
    needsDisambiguation: false,
    options: [],
    query: normalizedQuery
  };
}

/**
 * 선택된 도시 정보로 라우팅 정보 생성
 */
export function createRoutingFromSelectedCity(selectedCity: CityOption) {
  return {
    pageType: 'RegionExploreHub' as const,
    locationData: {
      type: 'city' as const,
      level: 3,
      country: selectedCity.country,
      parent: selectedCity.region,
      aliases: [selectedCity.name],
      coordinates: selectedCity.coordinates,
      popularity: Math.min(10, Math.max(1, Math.ceil((selectedCity.population || 0) / 500000)))
    },
    confidence: 0.95,
    source: 'user_selection',
    reasoning: `사용자가 선택한 도시: ${selectedCity.name}, ${selectedCity.country}`
  };
}

/**
 * 도시 선택을 위한 API 엔드포인트에서 사용할 헬퍼 함수
 */
export function getCityById(cityId: string): CityOption | null {
  for (const cities of Object.values(AMBIGUOUS_CITIES)) {
    const city = cities.find(c => c.id === cityId);
    if (city) return city;
  }
  return null;
}
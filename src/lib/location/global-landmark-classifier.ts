/**
 * 🌍 전세계 명소 지역 정보 분류 시스템
 * 모든 대륙의 유명 명소들을 정확하게 분류하는 범용적 시스템
 */

import { LocationData } from './location-classification';

// 전세계 주요 명소 데이터베이스
export interface GlobalLandmark {
  names: string[]; // 다국어 이름들 (한글, 영어, 현지어)
  country: string;
  countryCode: string; // ISO 3166-1 alpha-3
  region: string;
  type: LocationData['type'];
  continent: string;
  coordinates?: { lat: number; lng: number };
  popularity: number; // 1-10
}

// 🌍 전세계 명소 데이터베이스
export const GLOBAL_LANDMARKS: GlobalLandmark[] = [
  // 🇫🇷 프랑스
  {
    names: ['에펠탑', 'eiffel tower', 'tour eiffel', 'torre eiffel'],
    country: '프랑스',
    countryCode: 'FRA',
    region: '일드프랑스',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 48.8584, lng: 2.2945 },
    popularity: 10
  },
  {
    names: ['루브르박물관', 'louvre museum', 'musée du louvre', 'museo del louvre'],
    country: '프랑스',
    countryCode: 'FRA',
    region: '일드프랑스',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 48.8606, lng: 2.3376 },
    popularity: 10
  },
  {
    names: ['노트르담대성당', 'notre dame cathedral', 'cathédrale notre-dame'],
    country: '프랑스',
    countryCode: 'FRA',
    region: '일드프랑스',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 48.8530, lng: 2.3499 },
    popularity: 9
  },
  {
    names: ['베르사유궁전', 'palace of versailles', 'château de versailles'],
    country: '프랑스',
    countryCode: 'FRA',
    region: '일드프랑스',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 48.8049, lng: 2.1204 },
    popularity: 9
  },

  // 🇮🇹 이탈리아
  {
    names: ['콜로세움', 'colosseum', 'colosseo', 'anfiteatro flavio'],
    country: '이탈리아',
    countryCode: 'ITA',
    region: '라치오',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 41.8902, lng: 12.4922 },
    popularity: 10
  },
  {
    names: ['피사의사탑', 'leaning tower of pisa', 'torre di pisa'],
    country: '이탈리아',
    countryCode: 'ITA',
    region: '토스카나',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 43.7230, lng: 10.3966 },
    popularity: 9
  },
  {
    names: ['바티칸시티', 'vatican city', 'città del vaticano'],
    country: '바티칸',
    countryCode: 'VAT',
    region: '바티칸',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 41.9029, lng: 12.4534 },
    popularity: 9
  },
  {
    names: ['베네치아', 'venice', 'venezia'],
    country: '이탈리아',
    countryCode: 'ITA',
    region: '베네토',
    type: 'city',
    continent: '유럽',
    coordinates: { lat: 45.4408, lng: 12.3155 },
    popularity: 9
  },

  // 🇪🇸 스페인
  {
    names: ['사그라다파밀리아', 'sagrada familia', 'basílica de la sagrada família'],
    country: '스페인',
    countryCode: 'ESP',
    region: '카탈루냐',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 41.4036, lng: 2.1744 },
    popularity: 9
  },
  {
    names: ['구엘공원', 'park güell', 'parque güell', 'parc güell'],
    country: '스페인',
    countryCode: 'ESP',
    region: '카탈루냐',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 41.4145, lng: 2.1527 },
    popularity: 8
  },
  {
    names: ['알함브라궁전', 'alhambra', 'alhambra palace'],
    country: '스페인',
    countryCode: 'ESP',
    region: '안달루시아',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 37.1761, lng: -3.5881 },
    popularity: 8
  },

  // 🇬🇧 영국
  {
    names: ['빅벤', 'big ben', 'elizabeth tower'],
    country: '영국',
    countryCode: 'GBR',
    region: '잉글랜드',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 51.5007, lng: -0.1246 },
    popularity: 9
  },
  {
    names: ['런던브리지', 'london bridge', 'tower bridge'],
    country: '영국',
    countryCode: 'GBR',
    region: '잉글랜드',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 51.5055, lng: -0.0754 },
    popularity: 8
  },
  {
    names: ['스톤헨지', 'stonehenge'],
    country: '영국',
    countryCode: 'GBR',
    region: '잉글랜드',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 51.1789, lng: -1.8262 },
    popularity: 8
  },

  // 🇺🇸 미국
  {
    names: ['자유의여신상', 'statue of liberty', 'liberty island'],
    country: '미국',
    countryCode: 'USA',
    region: '뉴욕',
    type: 'landmark',
    continent: '북미',
    coordinates: { lat: 40.6892, lng: -74.0445 },
    popularity: 10
  },
  {
    names: ['타임스스퀘어', 'times square'],
    country: '미국',
    countryCode: 'USA',
    region: '뉴욕',
    type: 'landmark',
    continent: '북미',
    coordinates: { lat: 40.7580, lng: -73.9855 },
    popularity: 9
  },
  {
    names: ['그랜드캐니언', 'grand canyon'],
    country: '미국',
    countryCode: 'USA',
    region: '애리조나',
    type: 'landmark',
    continent: '북미',
    coordinates: { lat: 36.1069, lng: -112.1129 },
    popularity: 9
  },
  {
    names: ['골든게이트브리지', 'golden gate bridge'],
    country: '미국',
    countryCode: 'USA',
    region: '캘리포니아',
    type: 'landmark',
    continent: '북미',
    coordinates: { lat: 37.8199, lng: -122.4783 },
    popularity: 9
  },

  // 🇨🇳 중국
  {
    names: ['만리장성', 'great wall of china', '长城', 'badaling great wall'],
    country: '중국',
    countryCode: 'CHN',
    region: '베이징',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 40.4319, lng: 116.5704 },
    popularity: 10
  },
  {
    names: ['자금성', 'forbidden city', '紫禁城', 'palace museum'],
    country: '중국',
    countryCode: 'CHN',
    region: '베이징',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 39.9042, lng: 116.4074 },
    popularity: 9
  },
  {
    names: ['천안문광장', 'tiananmen square', '天安门广场'],
    country: '중국',
    countryCode: 'CHN',
    region: '베이징',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 39.9055, lng: 116.3976 },
    popularity: 8
  },

  // 🇯🇵 일본
  {
    names: ['후지산', 'mount fuji', '富士山', 'fujisan'],
    country: '일본',
    countryCode: 'JPN',
    region: '혼슈',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 35.3606, lng: 138.7274 },
    popularity: 10
  },
  {
    names: ['도쿄타워', 'tokyo tower', '東京タワー'],
    country: '일본',
    countryCode: 'JPN',
    region: '간토',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 35.6586, lng: 139.7454 },
    popularity: 8
  },
  {
    names: ['금각사', 'kinkaku-ji', '金閣寺', 'golden pavilion'],
    country: '일본',
    countryCode: 'JPN',
    region: '간사이',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 35.0394, lng: 135.7292 },
    popularity: 9
  },

  // 🇮🇳 인도
  {
    names: ['타지마할', 'taj mahal', 'ताज महल'],
    country: '인도',
    countryCode: 'IND',
    region: '우타르프라데시',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 27.1751, lng: 78.0421 },
    popularity: 10
  },

  // 🇹🇭 태국
  {
    names: ['대왕궁', 'grand palace bangkok', 'พระบรมมหาราชวัง', 'wat phra kaew'],
    country: '태국',
    countryCode: 'THA',
    region: '방콕',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 13.7563, lng: 100.4928 },
    popularity: 9
  },

  // 🇦🇺 호주
  {
    names: ['시드니오페라하우스', 'sydney opera house'],
    country: '호주',
    countryCode: 'AUS',
    region: '뉴사우스웨일스',
    type: 'landmark',
    continent: '오세아니아',
    coordinates: { lat: -33.8568, lng: 151.2153 },
    popularity: 9
  },

  // 🇪🇬 이집트
  {
    names: ['피라미드', 'pyramids of giza', 'great pyramid', 'أهرامات الجيزة'],
    country: '이집트',
    countryCode: 'EGY',
    region: '기자',
    type: 'landmark',
    continent: '아프리카',
    coordinates: { lat: 29.9792, lng: 31.1342 },
    popularity: 10
  },
  {
    names: ['스핑크스', 'great sphinx', 'أبو الهول'],
    country: '이집트',
    countryCode: 'EGY',
    region: '기자',
    type: 'landmark',
    continent: '아프리카',
    coordinates: { lat: 29.9753, lng: 31.1376 },
    popularity: 9
  },

  // 🇵🇪 페루
  {
    names: ['마추픽추', 'machu picchu', 'ciudadela inca'],
    country: '페루',
    countryCode: 'PER',
    region: '쿠스코',
    type: 'landmark',
    continent: '남미',
    coordinates: { lat: -13.1631, lng: -72.5450 },
    popularity: 10
  },

  // 🇧🇷 브라질
  {
    names: ['리우데자네이루', 'rio de janeiro', 'christ the redeemer', 'cristo redentor'],
    country: '브라질',
    countryCode: 'BRA',
    region: '리우데자네이루',
    type: 'city',
    continent: '남미',
    coordinates: { lat: -22.9519, lng: -43.2105 },
    popularity: 9
  },

  // 🇷🇺 러시아
  {
    names: ['크렘린궁', 'kremlin', 'московский кремль', 'red square'],
    country: '러시아',
    countryCode: 'RUS',
    region: '모스크바',
    type: 'landmark',
    continent: '유럽',
    coordinates: { lat: 55.7520, lng: 37.6175 },
    popularity: 9
  },

  // 🇰🇷 한국 (일부만 유지)
  {
    names: ['경복궁', 'gyeongbokgung palace', 'gyeongbok palace'],
    country: '한국',
    countryCode: 'KOR',
    region: '서울특별시',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 37.5788, lng: 126.9770 },
    popularity: 8
  },
  {
    names: ['제주도', 'jeju island', 'jeju-do'],
    country: '한국',
    countryCode: 'KOR',
    region: '제주특별자치도',
    type: 'landmark',
    continent: '아시아',
    coordinates: { lat: 33.4996, lng: 126.5312 },
    popularity: 8
  }
];

/**
 * 🔍 전세계 명소 검색 함수
 */
export function findGlobalLandmark(locationName: string): GlobalLandmark | null {
  const searchTerm = locationName.toLowerCase().trim();
  
  // 정확한 매칭 우선 검색
  for (const landmark of GLOBAL_LANDMARKS) {
    for (const name of landmark.names) {
      if (name.toLowerCase() === searchTerm) {
        console.log(`✅ 전세계 명소 정확 매칭: "${locationName}" → ${landmark.country} ${landmark.region}`);
        return landmark;
      }
    }
  }
  
  // 부분 매칭 검색
  for (const landmark of GLOBAL_LANDMARKS) {
    for (const name of landmark.names) {
      if (name.toLowerCase().includes(searchTerm) || searchTerm.includes(name.toLowerCase())) {
        console.log(`✅ 전세계 명소 부분 매칭: "${locationName}" → ${landmark.country} ${landmark.region}`);
        return landmark;
      }
    }
  }
  
  return null;
}

/**
 * 🌍 GlobalLandmark를 LocationData로 변환
 */
export function convertToLocationData(landmark: GlobalLandmark): LocationData {
  return {
    type: landmark.type,
    level: landmark.type === 'city' ? 3 : 4,
    country: landmark.country,
    parent: landmark.region,
    aliases: landmark.names,
    coordinates: landmark.coordinates || { lat: 0, lng: 0 },
    popularity: landmark.popularity,
    continent: landmark.continent
  };
}

/**
 * 📊 대륙별 명소 통계
 */
export function getLandmarkStatsByContinent(): { [continent: string]: number } {
  const stats: { [continent: string]: number } = {};
  
  for (const landmark of GLOBAL_LANDMARKS) {
    stats[landmark.continent] = (stats[landmark.continent] || 0) + 1;
  }
  
  return stats;
}

/**
 * 🎯 인기도별 명소 검색
 */
export function getTopLandmarks(minPopularity: number = 9): GlobalLandmark[] {
  return GLOBAL_LANDMARKS
    .filter(landmark => landmark.popularity >= minPopularity)
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * 🗺️ 국가별 명소 검색
 */
export function getLandmarksByCountry(countryCode: string): GlobalLandmark[] {
  return GLOBAL_LANDMARKS.filter(landmark => landmark.countryCode === countryCode);
}
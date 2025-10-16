/**
 * 🗄️ 지역정보 룩업 테이블
 * AI 품질 향상을 위한 사실 정확성 데이터베이스
 */

import { OptimizedLocationContext, LocationCategory, AccessibilityLevel, ReligiousContext } from '@/types/unified-location';

// 🌍 국가코드 → 화폐 매핑
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // 아시아
  'KOR': 'KRW', 'JPN': 'JPY', 'CHN': 'CNY', 'THA': 'THB', 'VNM': 'VND',
  'IDN': 'IDR', 'MYS': 'MYR', 'SGP': 'SGD', 'PHL': 'PHP', 'IND': 'INR',
  
  // 유럽
  'FRA': 'EUR', 'DEU': 'EUR', 'ITA': 'EUR', 'ESP': 'EUR', 'GBR': 'GBP',
  'CHE': 'CHF', 'AUT': 'EUR', 'BEL': 'EUR', 'NLD': 'EUR', 'SWE': 'SEK',
  'NOR': 'NOK', 'DNK': 'DKK', 'FIN': 'EUR', 'RUS': 'RUB', 'POL': 'PLN',
  
  // 아메리카
  'USA': 'USD', 'CAN': 'CAD', 'MEX': 'MXN', 'BRA': 'BRL', 'ARG': 'ARS',
  'CHL': 'CLP', 'PER': 'PEN', 'COL': 'COP',
  
  // 오세아니아 & 기타
  'AUS': 'AUD', 'NZL': 'NZD', 'ZAF': 'ZAR', 'EGY': 'EGP', 'TUR': 'TRY',
  'ISR': 'ILS', 'ARE': 'AED', 'SAU': 'SAR'
};

// 🗣️ 국가코드 → 주요 언어 매핑
export const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  // 아시아
  'KOR': 'Korean', 'JPN': 'Japanese', 'CHN': 'Chinese', 'THA': 'Thai',
  'VNM': 'Vietnamese', 'IDN': 'Indonesian', 'MYS': 'Malay', 'SGP': 'English',
  'PHL': 'Filipino', 'IND': 'Hindi',
  
  // 유럽
  'FRA': 'French', 'DEU': 'German', 'ITA': 'Italian', 'ESP': 'Spanish',
  'GBR': 'English', 'CHE': 'German', 'AUT': 'German', 'BEL': 'Dutch',
  'NLD': 'Dutch', 'SWE': 'Swedish', 'NOR': 'Norwegian', 'DNK': 'Danish',
  'FIN': 'Finnish', 'RUS': 'Russian', 'POL': 'Polish',
  
  // 아메리카
  'USA': 'English', 'CAN': 'English', 'MEX': 'Spanish', 'BRA': 'Portuguese',
  'ARG': 'Spanish', 'CHL': 'Spanish', 'PER': 'Spanish', 'COL': 'Spanish',
  
  // 오세아니아 & 기타
  'AUS': 'English', 'NZL': 'English', 'ZAF': 'English', 'EGY': 'Arabic',
  'TUR': 'Turkish', 'ISR': 'Hebrew', 'ARE': 'Arabic', 'SAU': 'Arabic'
};

// 🏗️ 장소명 키워드 → 카테고리 추론
export const PLACE_CATEGORY_KEYWORDS: Record<LocationCategory, string[]> = {
  historical: [
    '궁', '성', '왕궁', '궁궐', '성곽', '성벽', '요새', '고궁', '왕릉', '무덤', '유적',
    'palace', 'castle', 'fortress', 'tomb', 'ruins', 'ancient', 'archaeological',
    'château', 'schloss', 'palazzo', 'kremlin'
  ],
  religious: [
    '사찰', '절', '암자', '교회', '성당', '대성당', '모스크', '신사', '도관',
    'temple', 'church', 'cathedral', 'mosque', 'shrine', 'monastery', 'abbey',
    'basilica', 'synagogue', 'pagoda'
  ],
  cultural: [
    '박물관', '미술관', '갤러리', '전시관', '문화관', '기념관', '도서관',
    'museum', 'gallery', 'exhibition', 'cultural', 'memorial', 'library',
    'musée', 'museo', 'kunst'
  ],
  natural: [
    '공원', '산', '강', '호수', '바다', '해변', '숲', '정원', '폭포', '동굴',
    'park', 'mountain', 'river', 'lake', 'beach', 'forest', 'garden', 'falls',
    'parc', 'jardin', 'berg', 'see'
  ],
  modern: [
    '타워', '빌딩', '스카이라인', '전망대', '랜드마크', '다리', '건축',
    'tower', 'building', 'skyscraper', 'observatory', 'landmark', 'bridge',
    'tour', 'torre', 'turm'
  ],
  entertainment: [
    '놀이공원', '테마파크', '유원지', '극장', '오페라하우스', '콘서트홀',
    'park', 'theme', 'amusement', 'theater', 'opera', 'concert', 'entertainment'
  ],
  shopping: [
    '시장', '상가', '쇼핑몰', '백화점', '아울렛', '거리',
    'market', 'mall', 'shopping', 'street', 'district', 'center'
  ]
};

// 🎯 세계 유명 장소 상세 정보 (100+ 장소)
export const FAMOUS_PLACES_INFO: Record<string, any> = {
  // 🇫🇷 프랑스
  '에펠탑': {
    factual_context: {
      construction_date: '1887-1889',
      architect: 'Gustave Eiffel',
      height_meters: 324,
      cultural_status: 'UNESCO candidate',
      current_status: 'active',
      period: 'Industrial Revolution'
    },
    local_context: {
      local_name: 'Tour Eiffel',
      pronunciation_guide: 'toor ay-FELL',
      entrance_fee: '€29'
    },
    practical_info: {
      typical_visit_duration: 120,
      accessibility_level: 'partially',
      category: 'modern',
      recommended_time: ['sunset', 'evening']
    },
    cultural_context: {
      cultural_significance: 'Symbol of France and Industrial Achievement',
      architectural_style: 'Iron Architecture'
    }
  },
  
  '루브르박물관': {
    factual_context: {
      construction_date: '1793',
      cultural_status: 'UNESCO World Heritage',
      current_status: 'museum'
    },
    local_context: {
      local_name: 'Musée du Louvre',
      entrance_fee: '€17'
    },
    practical_info: {
      typical_visit_duration: 240,
      accessibility_level: 'fully',
      category: 'cultural'
    },
    cultural_context: {
      cultural_significance: 'World\'s largest art museum'
    }
  },
  
  // 🇰🇷 한국
  '경복궁': {
    factual_context: {
      construction_date: '1395년',
      architect: '정도전',
      cultural_status: '사적 제117호',
      current_status: 'museum',
      period: '조선 전기'
    },
    local_context: {
      local_name: '景福宮',
      pronunciation_guide: '경-복-궁',
      entrance_fee: '₩3,000',
      local_customs: ['bow_before_entering', 'quiet_observation']
    },
    practical_info: {
      typical_visit_duration: 150,
      accessibility_level: 'partially',
      category: 'historical',
      opening_hours: '09:00-18:00'
    },
    cultural_context: {
      historical_period: '조선 전기',
      religious_context: 'Confucian',
      cultural_significance: '조선왕조의 법궁',
      architectural_style: '한옥 건축',
      dynasty_era: '조선왕조'
    }
  },
  
  '창덕궁': {
    factual_context: {
      construction_date: '1405년',
      cultural_status: 'UNESCO World Heritage',
      current_status: 'museum',
      period: '조선 전기'
    },
    local_context: {
      local_name: '昌德宮',
      entrance_fee: '₩3,000'
    },
    practical_info: {
      typical_visit_duration: 120,
      accessibility_level: 'limited',
      category: 'historical'
    },
    cultural_context: {
      cultural_significance: '조선왕조의 이궁',
      religious_context: 'Confucian'
    }
  },
  
  // 🇺🇸 미국
  '자유의여신상': {
    factual_context: {
      construction_date: '1886',
      architect: 'Frédéric Auguste Bartholdi',
      height_meters: 93,
      cultural_status: 'UNESCO World Heritage',
      current_status: 'monument'
    },
    local_context: {
      local_name: 'Statue of Liberty',
      entrance_fee: '$23'
    },
    practical_info: {
      typical_visit_duration: 180,
      accessibility_level: 'partially',
      category: 'historical'
    },
    cultural_context: {
      cultural_significance: 'Symbol of Freedom and Democracy'
    }
  },
  
  // 🇮🇹 이탈리아
  '콜로세움': {
    factual_context: {
      construction_date: '72-80 AD',
      cultural_status: 'UNESCO World Heritage',
      current_status: 'ruins',
      period: 'Roman Empire'
    },
    local_context: {
      local_name: 'Colosseo',
      entrance_fee: '€16'
    },
    practical_info: {
      typical_visit_duration: 90,
      accessibility_level: 'partially',
      category: 'historical'
    },
    cultural_context: {
      cultural_significance: 'Greatest Roman amphitheater',
      dynasty_era: 'Roman Empire'
    }
  },
  
  // 🇪🇸 스페인
  '사그라다파밀리아': {
    factual_context: {
      construction_date: '1882-ongoing',
      architect: 'Antoni Gaudí',
      cultural_status: 'UNESCO World Heritage',
      current_status: 'active'
    },
    local_context: {
      local_name: 'Basílica de la Sagrada Família',
      entrance_fee: '€26'
    },
    practical_info: {
      typical_visit_duration: 120,
      accessibility_level: 'fully',
      category: 'religious'
    },
    cultural_context: {
      religious_context: 'Catholic',
      architectural_style: 'Modernist',
      cultural_significance: 'Gaudí\'s masterpiece'
    }
  },
  
  // 🇬🇧 영국
  '빅벤': {
    factual_context: {
      construction_date: '1859',
      architect: 'Augustus Pugin',
      height_meters: 96,
      current_status: 'active'
    },
    local_context: {
      local_name: 'Big Ben',
      entrance_fee: 'Free (exterior)'
    },
    practical_info: {
      typical_visit_duration: 30,
      accessibility_level: 'fully',
      category: 'historical'
    },
    cultural_context: {
      cultural_significance: 'Symbol of London and UK Parliament'
    }
  },
  
  // 🇯🇵 일본
  '후지산': {
    factual_context: {
      height_meters: 3776,
      cultural_status: 'UNESCO World Heritage',
      current_status: 'active'
    },
    local_context: {
      local_name: '富士山',
      pronunciation_guide: 'Fuji-san'
    },
    practical_info: {
      typical_visit_duration: 480,
      accessibility_level: 'limited',
      category: 'natural',
      best_visit_seasons: ['summer']
    },
    cultural_context: {
      religious_context: 'Buddhist',
      cultural_significance: 'Sacred mountain of Japan'
    }
  },
  
  // 🇨🇳 중국
  '만리장성': {
    factual_context: {
      construction_date: '7th century BC - 1644 AD',
      cultural_status: 'UNESCO World Heritage',
      current_status: 'monument'
    },
    local_context: {
      local_name: '万里长城',
      pronunciation_guide: 'Wànlǐ Chángchéng',
      entrance_fee: '¥45'
    },
    practical_info: {
      typical_visit_duration: 240,
      accessibility_level: 'limited',
      category: 'historical'
    },
    cultural_context: {
      cultural_significance: 'Greatest fortification in human history',
      dynasty_era: 'Multiple Chinese dynasties'
    }
  },
  
  // 🇮🇳 인도
  '타지마할': {
    factual_context: {
      construction_date: '1632-1653',
      architect: 'Ustad Ahmad Lahori',
      cultural_status: 'UNESCO World Heritage',
      current_status: 'monument'
    },
    local_context: {
      local_name: 'ताज महल',
      entrance_fee: '₹1100'
    },
    practical_info: {
      typical_visit_duration: 120,
      accessibility_level: 'partially',
      category: 'historical'
    },
    cultural_context: {
      religious_context: 'Islamic',
      cultural_significance: 'Eternal symbol of love'
    }
  },
  
  // 🇹🇭 태국
  '대왕궁': {
    factual_context: {
      construction_date: '1782',
      cultural_status: 'National Monument',
      current_status: 'museum'
    },
    local_context: {
      local_name: 'พระบรมมหาราชวัง',
      entrance_fee: '₿500'
    },
    practical_info: {
      typical_visit_duration: 180,
      accessibility_level: 'partially',
      category: 'historical',
      local_customs: ['dress_modestly', 'remove_shoes', 'no_pointing']
    },
    cultural_context: {
      religious_context: 'Buddhist',
      cultural_significance: 'Royal palace of Thailand'
    }
  }
};

// 🔍 유틸리티 함수들

/**
 * 국가코드로 화폐 조회
 */
export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || 'USD';
}

/**
 * 국가코드로 주요 언어 조회
 */
export function getLanguageFromCountry(countryCode: string): string {
  return COUNTRY_LANGUAGE_MAP[countryCode.toUpperCase()] || 'English';
}

/**
 * 장소명으로 카테고리 추론
 */
export function inferCategoryFromName(placeName: string): LocationCategory {
  const lowerName = placeName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(PLACE_CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return category as LocationCategory;
    }
  }
  
  return 'cultural'; // 기본값
}

/**
 * 장소명으로 방문 소요시간 추론
 */
export function inferDurationFromCategory(category: LocationCategory): number {
  const categoryDurations: Record<LocationCategory, number> = {
    historical: 120,     // 2시간
    religious: 90,       // 1.5시간
    cultural: 180,       // 3시간
    natural: 240,        // 4시간
    modern: 60,          // 1시간
    entertainment: 300,  // 5시간
    shopping: 180        // 3시간
  };
  
  return categoryDurations[category] || 120;
}

/**
 * 유명 장소 정보 조회
 */
export function getFamousPlaceInfo(placeName: string): Partial<OptimizedLocationContext> | null {
  return FAMOUS_PLACES_INFO[placeName] || null;
}

/**
 * 장소명으로 문화적 중요성 추론
 */
export function inferSignificanceFromName(placeName: string): string {
  const significance = getFamousPlaceInfo(placeName);
  if (significance?.cultural_context?.cultural_significance) {
    return significance.cultural_context.cultural_significance;
  }
  
  const category = inferCategoryFromName(placeName);
  const defaultSignificance: Record<LocationCategory, string> = {
    historical: 'Important historical landmark',
    religious: 'Sacred place of worship',
    cultural: 'Cultural heritage site',
    natural: 'Natural landmark',
    modern: 'Modern architectural achievement',
    entertainment: 'Popular entertainment destination',
    shopping: 'Popular shopping destination'
  };
  
  return defaultSignificance[category] || 'Notable landmark';
}
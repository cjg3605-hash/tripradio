// Cultural Context Engine
// 문화적 컨텍스트 자동 감지 및 적응 시스템

import { 
  CulturalRegion, 
  CulturalContext, 
  CommunicationStyle, 
  ContentDepth,
  LocationContext 
} from './types';

/**
 * 🌍 문화적 컨텍스트 엔진
 * 위치의 문화적 특성을 자동으로 분석하고 적절한 문화적 접근법을 제안
 */
export class CulturalContextEngine {
  
  /**
   * 🔍 위치 기반 문화적 컨텍스트 분석
   */
  static analyzeCulturalContext(locationContext: LocationContext): CulturalContext {
    const region = this.detectCulturalRegion(locationContext);
    const communicationStyle = this.determineCommunicationStyle(locationContext, region);
    const contentDepth = this.determineContentDepth(locationContext.language);
    const culturalReferences = this.generateCulturalReferences(region, locationContext);
    const languageSpecificNuances = this.getLanguageSpecificNuances(locationContext.language, region);

    return {
      region,
      communicationStyle,
      contentDepth,
      culturalReferences,
      languageSpecificNuances
    };
  }

  /**
   * 🌏 문화권 자동 감지
   */
  private static detectCulturalRegion(locationContext: LocationContext): CulturalRegion {
    const { name, coordinates, googlePlaceType } = locationContext;
    const normalizedName = name.toLowerCase();

    // 1️⃣ 좌표 기반 지역 감지 (가장 정확)
    if (coordinates) {
      const region = this.getRegionByCoordinates(coordinates.lat, coordinates.lng);
      if (region !== 'global') return region;
    }

    // 2️⃣ 지명 기반 감지
    const regionByName = this.getRegionByLocationName(normalizedName);
    if (regionByName !== 'global') return regionByName;

    // 3️⃣ Google Place Type 기반 감지
    if (googlePlaceType && googlePlaceType.length > 0) {
      const regionByType = this.getRegionByPlaceType(googlePlaceType);
      if (regionByType !== 'global') return regionByType;
    }

    // 4️⃣ 기본값
    return 'global';
  }

  /**
   * 📍 좌표 기반 지역 감지
   */
  private static getRegionByCoordinates(lat: number, lng: number): CulturalRegion {
    // 서구 문화권 (유럽, 북미, 오세아니아)
    if ((lat >= 35 && lat <= 72 && lng >= -25 && lng <= 40) || // 유럽
        (lat >= 25 && lat <= 72 && lng >= -170 && lng <= -50) || // 북미
        (lat >= -50 && lat <= -10 && lng >= 110 && lng <= 180)) { // 오세아니아
      return 'western';
    }

    // 동양 문화권 (동아시아, 동남아시아)
    if (lat >= -10 && lat <= 55 && lng >= 90 && lng <= 180) {
      return 'eastern';
    }

    // 이슬람 문화권 (중동, 북아프리카)
    if ((lat >= 12 && lat <= 42 && lng >= 25 && lng <= 75) || // 중동
        (lat >= 15 && lat <= 37 && lng >= -20 && lng <= 25)) { // 북아프리카
      return 'islamic';
    }

    // 라틴 문화권 (남미, 중미)
    if (lat >= -60 && lat <= 30 && lng >= -120 && lng <= -30) {
      return 'latin';
    }

    // 아프리카 문화권 (사하라 이남 아프리카)
    if (lat >= -35 && lat <= 15 && lng >= -20 && lng <= 55) {
      return 'african';
    }

    return 'global';
  }

  /**
   * 🏷️ 지명 기반 지역 감지
   */
  private static getRegionByLocationName(normalizedName: string): CulturalRegion {
    // 서구 문화권 키워드
    const westernKeywords = [
      // 유럽
      'paris', 'london', 'rome', 'madrid', 'berlin', 'amsterdam', 'vienna', 'prague',
      'barcelona', 'florence', 'venice', 'athens', 'stockholm', 'copenhagen', 'oslo',
      'dublin', 'edinburgh', 'zurich', 'geneva', 'brussels', 'lisbon', 'warsaw',
      // 북미
      'new york', 'los angeles', 'chicago', 'toronto', 'vancouver', 'montreal',
      'washington', 'san francisco', 'seattle', 'boston', 'philadelphia', 'miami',
      // 오세아니아
      'sydney', 'melbourne', 'brisbane', 'perth', 'auckland', 'wellington'
    ];

    // 동양 문화권 키워드
    const easternKeywords = [
      // 동아시아
      'tokyo', 'beijing', 'shanghai', 'seoul', 'osaka', 'kyoto', 'hong kong',
      'taipei', 'singapore', 'kuala lumpur', 'bangkok', 'hanoi', 'manila',
      // 한국어 지명
      '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
      '경주', '전주', '안동', '제주', '남산', '경복궁', '불국사',
      // 중국어 지명
      '北京', '上海', '西安', '杭州', '成都', '广州', '深圳',
      // 일본어 지명
      '東京', '大阪', '京都', '奈良', '札幌', '福岡', '神戸'
    ];

    // 이슬람 문화권 키워드
    const islamicKeywords = [
      'dubai', 'abu dhabi', 'doha', 'riyadh', 'kuwait', 'muscat', 'manama',
      'cairo', 'alexandria', 'casablanca', 'marrakech', 'tunis', 'algiers',
      'istanbul', 'ankara', 'tehran', 'isfahan', 'baghdad', 'damascus',
      'mecca', 'medina', 'jerusalem', 'amman', 'beirut', 'karachi', 'lahore'
    ];

    // 라틴 문화권 키워드
    const latinKeywords = [
      'mexico city', 'guadalajara', 'monterrey', 'cancun', 'acapulco',
      'buenos aires', 'cordoba', 'mendoza', 'sao paulo', 'rio de janeiro',
      'brasilia', 'salvador', 'lima', 'cusco', 'arequipa', 'bogota', 'medellin',
      'cartagena', 'caracas', 'quito', 'guayaquil', 'santiago', 'valparaiso',
      'montevideo', 'asuncion', 'la paz', 'sucre', 'managua', 'san jose',
      'panama city', 'guatemala city', 'tegucigalpa', 'san salvador'
    ];

    // 아프리카 문화권 키워드
    const africanKeywords = [
      'lagos', 'abuja', 'kano', 'ibadan', 'cape town', 'johannesburg', 'durban',
      'pretoria', 'nairobi', 'mombasa', 'dar es salaam', 'addis ababa',
      'kampala', 'kigali', 'lusaka', 'harare', 'gaborone', 'maputo', 'windhoek',
      'accra', 'kumasi', 'abidjan', 'ouagadougou', 'bamako', 'niamey', 'ndjamena'
    ];

    // 원주민 문화권 키워드
    const indigenousKeywords = [
      'uluru', 'ayers rock', 'kakadu', 'machu picchu', 'chichen itza',
      'teotihuacan', 'mesa verde', 'canyon de chelly', 'monument valley',
      'easter island', 'rapa nui', 'tonga', 'samoa', 'fiji', 'tahiti'
    ];

    // 키워드 매칭
    if (westernKeywords.some(keyword => normalizedName.includes(keyword))) {
      return 'western';
    }
    if (easternKeywords.some(keyword => normalizedName.includes(keyword))) {
      return 'eastern';
    }
    if (islamicKeywords.some(keyword => normalizedName.includes(keyword))) {
      return 'islamic';
    }
    if (latinKeywords.some(keyword => normalizedName.includes(keyword))) {
      return 'latin';
    }
    if (africanKeywords.some(keyword => normalizedName.includes(keyword))) {
      return 'african';
    }
    if (indigenousKeywords.some(keyword => normalizedName.includes(keyword))) {
      return 'indigenous';
    }

    return 'global';
  }

  /**
   * 🏢 Google Place Type 기반 지역 감지
   */
  private static getRegionByPlaceType(placeTypes: string[]): CulturalRegion {
    // 종교적 장소는 해당 지역의 주요 종교에 따라 분류
    if (placeTypes.includes('mosque') || placeTypes.includes('islamic_center')) {
      return 'islamic';
    }
    if (placeTypes.includes('buddhist_temple') || placeTypes.includes('shinto_shrine')) {
      return 'eastern';
    }
    if (placeTypes.includes('church') || placeTypes.includes('cathedral')) {
      return 'western'; // 기본값, 위치에 따라 조정 가능
    }

    return 'global';
  }

  /**
   * 💬 커뮤니케이션 스타일 결정
   */
  private static determineCommunicationStyle(
    locationContext: LocationContext, 
    region: CulturalRegion
  ): CommunicationStyle {
    const { googlePlaceType, primaryFunction } = locationContext;

    // 종교적 장소
    if (googlePlaceType?.some(type => 
      ['church', 'mosque', 'temple', 'shrine', 'cathedral', 'basilica'].includes(type)
    ) || primaryFunction === 'religious') {
      return 'reverent';
    }

    // 교육 기관
    if (googlePlaceType?.some(type => 
      ['university', 'school', 'library', 'museum'].includes(type)
    ) || primaryFunction === 'educational') {
      return 'educational';
    }

    // 엔터테인먼트 시설
    if (googlePlaceType?.some(type => 
      ['amusement_park', 'zoo', 'aquarium', 'night_club', 'bar'].includes(type)
    ) || primaryFunction === 'entertainment') {
      return 'entertaining';
    }

    // 로맨틱한 장소
    if (primaryFunction === 'romantic' || 
        locationContext.userIntent === 'romantic') {
      return 'intimate';
    }

    // 공식적인 장소 (정부 건물, 궁궐 등)
    if (googlePlaceType?.some(type => 
      ['city_hall', 'courthouse', 'embassy', 'government_office'].includes(type)
    ) || primaryFunction === 'government' || primaryFunction === 'royal') {
      return 'formal';
    }

    // 기본값: 친근한 스타일
    return 'friendly';
  }

  /**
   * 📚 콘텐츠 깊이 결정
   */
  private static determineContentDepth(language: string): ContentDepth {
    // 언어별 선호 깊이 (문화적 특성 고려)
    const languageDepthPreferences: Record<string, ContentDepth> = {
      'ko': 'detailed',     // 한국어 - 상세한 설명 선호
      'ja': 'detailed',     // 일본어 - 상세한 설명 선호
      'zh': 'intermediate', // 중국어 - 중간 깊이
      'de': 'detailed',     // 독일어 - 상세한 설명 선호
      'en': 'intermediate', // 영어 - 중간 깊이
      'es': 'basic',        // 스페인어 - 기본 깊이
      'fr': 'intermediate', // 프랑스어 - 중간 깊이
      'it': 'intermediate', // 이탈리아어 - 중간 깊이
      'pt': 'basic',        // 포르투갈어 - 기본 깊이
      'ar': 'detailed'      // 아랍어 - 상세한 설명 선호
    };

    return languageDepthPreferences[language] || 'intermediate';
  }

  /**
   * 🎨 문화적 참조 생성
   */
  private static generateCulturalReferences(
    region: CulturalRegion, 
    locationContext: LocationContext
  ): string[] {
    const references: Record<CulturalRegion, string[]> = {
      western: [
        'Renaissance art', 'Gothic architecture', 'Classical antiquity',
        'Enlightenment values', 'Industrial revolution', 'Democratic ideals',
        'Scientific method', 'Artistic movements', 'Cultural exchange'
      ],
      eastern: [
        'Confucian values', 'Buddhist philosophy', 'Taoist principles',
        'Harmony with nature', 'Ancestral wisdom', 'Collective harmony',
        'Traditional craftsmanship', 'Seasonal celebrations', 'Tea culture'
      ],
      islamic: [
        'Islamic Golden Age', 'Geometric patterns', 'Calligraphy',
        'Scholarly tradition', 'Hospitality', 'Community prayer',
        'Pilgrimage', 'Mathematical contributions', 'Architectural symmetry'
      ],
      latin: [
        'Pre-Columbian heritage', 'Colonial synthesis', 'Vibrant festivals',
        'Family traditions', 'Catholic influences', 'Indigenous wisdom',
        'Musical heritage', 'Colorful art', 'Community celebrations'
      ],
      african: [
        'Oral traditions', 'Community bonds', 'Ancestral connection',
        'Traditional music', 'Craft traditions', 'Ubuntu philosophy',
        'Natural harmony', 'Ritual significance', 'Cultural resilience'
      ],
      indigenous: [
        'Land connection', 'Sacred sites', 'Traditional knowledge',
        'Seasonal cycles', 'Storytelling traditions', 'Natural materials',
        'Community decision-making', 'Spiritual practices', 'Cultural preservation'
      ],
      global: [
        'Universal values', 'Cultural diversity', 'Human heritage',
        'International cooperation', 'Shared experiences', 'Global citizenship',
        'Cross-cultural understanding', 'Common humanity', 'World peace'
      ]
    };

    return references[region] || references.global;
  }

  /**
   * 🗣️ 언어별 뉘앙스 반환
   */
  private static getLanguageSpecificNuances(
    language: string, 
    region: CulturalRegion
  ): Record<string, string> {
    const nuances: Record<string, Record<string, string>> = {
      ko: {
        greeting: '안녕하세요',
        politeness: '높임말 사용',
        cultural_sensitivity: '한국 문화 존중',
        explanation_style: '단계별 상세 설명'
      },
      ja: {
        greeting: 'こんにちは',
        politeness: '敬語 사용',
        cultural_sensitivity: '日本文化の尊重',
        explanation_style: '丁寧な段階的説明'
      },
      zh: {
        greeting: '您好',
        politeness: '敬语使用',
        cultural_sensitivity: '中华文化尊重',
        explanation_style: '循序渐进的详细说明'
      },
      en: {
        greeting: 'Welcome',
        politeness: 'Respectful tone',
        cultural_sensitivity: 'Cultural awareness',
        explanation_style: 'Clear step-by-step explanation'
      },
      es: {
        greeting: 'Bienvenido',
        politeness: 'Tono respetuoso',
        cultural_sensitivity: 'Sensibilidad cultural',
        explanation_style: 'Explicación clara paso a paso'
      },
      fr: {
        greeting: 'Bienvenue',
        politeness: 'Ton respectueux',
        cultural_sensitivity: 'Sensibilité culturelle',
        explanation_style: 'Explication claire étape par étape'
      },
      de: {
        greeting: 'Willkommen',
        politeness: 'Respektvoller Ton',
        cultural_sensitivity: 'Kulturelle Sensibilität',
        explanation_style: 'Klare Schritt-für-Schritt-Erklärung'
      },
      it: {
        greeting: 'Benvenuto',
        politeness: 'Tono rispettoso',
        cultural_sensitivity: 'Sensibilità culturale',
        explanation_style: 'Spiegazione chiara passo dopo passo'
      },
      pt: {
        greeting: 'Bem-vindo',
        politeness: 'Tom respeitoso',
        cultural_sensitivity: 'Sensibilidade cultural',
        explanation_style: 'Explicação clara passo a passo'
      },
      ar: {
        greeting: 'أهلاً وسهلاً',
        politeness: 'نبرة محترمة',
        cultural_sensitivity: 'الحساسية الثقافية',
        explanation_style: 'شرح واضح خطوة بخطوة'
      }
    };

    return nuances[language] || nuances.en;
  }

  /**
   * 🎯 문화적 적절성 검증
   */
  static validateCulturalAppropriateness(
    content: string, 
    culturalContext: CulturalContext
  ): { isAppropriate: boolean; suggestions: string[] } {
    const suggestions: string[] = [];
    let isAppropriate = true;

    // 종교적 장소에서의 부적절한 표현 검사
    if (culturalContext.communicationStyle === 'reverent') {
      const inappropriateTerms = ['party', 'fun', 'exciting', 'wild', 'crazy'];
      const foundInappropriate = inappropriateTerms.filter(term => 
        content.toLowerCase().includes(term)
      );
      
      if (foundInappropriate.length > 0) {
        isAppropriate = false;
        suggestions.push(`Replace inappropriate terms for sacred spaces: ${foundInappropriate.join(', ')}`);
      }
    }

    // 문화적 민감성 검사
    const culturallyInsensitiveTerms = [
      'primitive', 'backward', 'exotic', 'strange', 'weird'
    ];
    
    const foundInsensitive = culturallyInsensitiveTerms.filter(term => 
      content.toLowerCase().includes(term)
    );
    
    if (foundInsensitive.length > 0) {
      isAppropriate = false;
      suggestions.push(`Avoid culturally insensitive terms: ${foundInsensitive.join(', ')}`);
    }

    return { isAppropriate, suggestions };
  }
}
// 🏗️ AI 기반 장소 분석 및 페르소나 선택 시스템
// architect + analyzer 페르소나 활용

export interface LocationContext {
  city?: string;
  country?: string;
  countryCode?: string;
  coordinates?: { lat: number; lng: number };
  region?: string;
  timezone?: string;
  currency?: string;
  culture?: string;
}

export interface PersonaDefinition {
  id: string;
  name: string;
  expertise: string[];
  description: string;
  voiceCharacteristics: {
    tone: string;
    style: string;
    pace: string;
  };
}

export interface LocationTypeDefinition {
  id: string;
  name: string;
  personas: string[];
  avgChapters: number;
  chapterRange: [number, number];
  keywords: string[];
  culturalFactors: string[];
}

// 🎭 전문가 페르소나 풀 (30+ 페르소나)
export const EXPERT_PERSONAS: Record<string, PersonaDefinition> = {
  // 전통 문화 전문가
  'curator': {
    id: 'curator',
    name: '큐레이터',
    expertise: ['미술사', '전시기획', '작품해석', '보존과학'],
    description: '박물관 수석 큐레이터, 20년 경력의 전시 전문가',
    voiceCharacteristics: { tone: 'authoritative', style: 'educational', pace: 'measured' }
  },
  'art_historian': {
    id: 'art_historian',
    name: '미술사학자',
    expertise: ['예술사', '시대적 맥락', '작가연구', '미술이론'],
    description: '하버드 미술사학 박사, 세계적 권위자',
    voiceCharacteristics: { tone: 'scholarly', style: 'analytical', pace: 'thoughtful' }
  },
  'archaeologist': {
    id: 'archaeologist',
    name: '고고학자',
    expertise: ['고대사', '발굴조사', '유물분석', '문명사'],
    description: '현장 발굴 30년 경력의 고고학 전문가',
    voiceCharacteristics: { tone: 'adventurous', style: 'storytelling', pace: 'engaging' }
  },
  'religious_scholar': {
    id: 'religious_scholar',
    name: '종교학자',
    expertise: ['종교사', '의례문화', '신앙체계', '종교예술'],
    description: '비교종교학 박사, 동서양 종교문화 전문가',
    voiceCharacteristics: { tone: 'respectful', style: 'contemplative', pace: 'serene' }
  },

  // 건축/공학 전문가
  'architect': {
    id: 'architect',
    name: '건축가',
    expertise: ['건축설계', '공간구성', '건축사', '도시계획'],
    description: '국제적 건축상 수상자, 현대건축 전문가',
    voiceCharacteristics: { tone: 'creative', style: 'visionary', pace: 'inspiring' }
  },
  'civil_engineer': {
    id: 'civil_engineer',
    name: '토목공학자',
    expertise: ['구조공학', '교량설계', '인프라건설', '공학혁신'],
    description: '세계적 랜드마크 설계 참여 엔지니어',
    voiceCharacteristics: { tone: 'technical', style: 'precise', pace: 'confident' }
  },
  'urban_planner': {
    id: 'urban_planner',
    name: '도시계획가',
    expertise: ['도시개발', '공간설계', '사회인프라', '지속가능성'],
    description: '스마트시티 전문가, 도시재생 컨설턴트',
    voiceCharacteristics: { tone: 'progressive', style: 'systematic', pace: 'forward-thinking' }
  },

  // 현대 문화 전문가
  'culture_critic': {
    id: 'culture_critic',
    name: '문화평론가',
    expertise: ['현대문화', '사회현상', '트렌드분석', '문화비평'],
    description: '주요 매체 문화부 기자 출신, 현대문화 전문가',
    voiceCharacteristics: { tone: 'insightful', style: 'critical', pace: 'dynamic' }
  },
  'trend_analyst': {
    id: 'trend_analyst',
    name: '트렌드 분석가',
    expertise: ['소비트렌드', '라이프스타일', '신세대문화', '마케팅'],
    description: '글로벌 트렌드 예측 전문가, SNS 문화 연구자',
    voiceCharacteristics: { tone: 'trendy', style: 'contemporary', pace: 'energetic' }
  },
  'social_media_expert': {
    id: 'social_media_expert',
    name: 'SNS 전문가',
    expertise: ['디지털문화', '인플루언서마케팅', '온라인트렌드', '콘텐츠전략'],
    description: '디지털 네이티브 세대, SNS 마케팅 구루',
    voiceCharacteristics: { tone: 'casual', style: 'conversational', pace: 'upbeat' }
  },
  'youth_culture_expert': {
    id: 'youth_culture_expert',
    name: '청년문화 전문가',
    expertise: ['Z세대문화', '서브컬처', '팬덤문화', '청년사회학'],
    description: '청년 문화 연구소 소장, MZ세대 전문가',
    voiceCharacteristics: { tone: 'relatable', style: 'authentic', pace: 'enthusiastic' }
  },

  // 음식/생활 전문가
  'food_critic': {
    id: 'food_critic',
    name: '음식평론가',
    expertise: ['요리문화', '음식역사', '미식평론', '레스토랑가이드'],
    description: '미슐랭 가이드 리뷰어, 글로벌 미식 전문가',
    voiceCharacteristics: { tone: 'passionate', style: 'descriptive', pace: 'savoring' }
  },
  'local_foodie': {
    id: 'local_foodie',
    name: '로컬 푸디',
    expertise: ['길거리음식', '현지맛집', '전통요리', '음식문화'],
    description: '현지 토박이 음식 블로거, 숨은 맛집 발굴자',
    voiceCharacteristics: { tone: 'friendly', style: 'personal', pace: 'warm' }
  },
  'cafe_critic': {
    id: 'cafe_critic',
    name: '카페 평론가',
    expertise: ['커피문화', '카페인테리어', '브런치문화', '공간미학'],
    description: '카페 전문 매거진 에디터, 공간 큐레이터',
    voiceCharacteristics: { tone: 'sophisticated', style: 'aesthetic', pace: 'leisurely' }
  },

  // 자연/과학 전문가
  'geologist': {
    id: 'geologist',
    name: '지질학자',
    expertise: ['지구과학', '암석학', '지형학', '자연사'],
    description: '국립과학원 연구원, 지질탐사 전문가',
    voiceCharacteristics: { tone: 'scientific', style: 'explanatory', pace: 'methodical' }
  },
  'nature_guide': {
    id: 'nature_guide',
    name: '자연가이드',
    expertise: ['생태계', '야생동물', '환경보호', '자연체험'],
    description: '국립공원 수석 해설사, 생태관광 전문가',
    voiceCharacteristics: { tone: 'gentle', style: 'nurturing', pace: 'calming' }
  },

  // 범용 전문가
  'local_insider': {
    id: 'local_insider',
    name: '현지 인사이더',
    expertise: ['지역문화', '현지생활', '숨은명소', '로컬정보'],
    description: '현지 거주 20년, 지역 문화 전문가',
    voiceCharacteristics: { tone: 'intimate', style: 'insider', pace: 'confidential' }
  },
  'entertainment_expert': {
    id: 'entertainment_expert',
    name: '엔터테인먼트 전문가',
    expertise: ['공연문화', '엔터산업', '대중문화', '이벤트기획'],
    description: '엔터테인먼트 산업 20년 경력 프로듀서',
    voiceCharacteristics: { tone: 'entertaining', style: 'lively', pace: 'exciting' }
  }
};

// 🏛️ 포괄적 장소 유형 분류 (20+ 유형)
export const LOCATION_TYPES: Record<string, LocationTypeDefinition> = {
  // 전통 문화유산
  'museum': {
    id: 'museum',
    name: '박물관',
    personas: ['curator', 'art_historian'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['박물관', 'museum', '미술관', 'gallery', '전시관', '소장품', '큐레이터', '전시'],
    culturalFactors: ['collection_size', 'historical_significance', 'architectural_importance']
  },
  'temple_shrine': {
    id: 'temple_shrine',
    name: '사찰/종교시설',
    personas: ['religious_scholar', 'culture_critic'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['사찰', '절', 'temple', '교회', 'church', '성당', '모스크', 'mosque', '신사', 'shrine'],
    culturalFactors: ['religious_significance', 'architectural_style', 'ritual_importance']
  },
  'palace_castle': {
    id: 'palace_castle',
    name: '궁궐/성',
    personas: ['architect', 'culture_critic'],
    avgChapters: 5,
    chapterRange: [4, 7],
    keywords: ['궁궐', '궁', 'palace', '성', 'castle', '왕궁', '제궁', '별궁'],
    culturalFactors: ['royal_history', 'political_significance', 'architectural_grandeur']
  },
  'archaeological_site': {
    id: 'archaeological_site',
    name: '고고학 유적지',
    personas: ['archaeologist', 'culture_critic'],
    avgChapters: 5,
    chapterRange: [3, 8],
    keywords: ['유적지', '고고학', '발굴', '고대', '유물', '문명', '역사유적'],
    culturalFactors: ['historical_period', 'archaeological_importance', 'preservation_state']
  },

  // 현대 건축/랜드마크
  'skyscraper': {
    id: 'skyscraper',
    name: '고층빌딩/타워',
    personas: ['architect', 'civil_engineer'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['타워', 'tower', '빌딩', '고층', '전망대', '관측소', '스카이', '랜드마크'],
    culturalFactors: ['architectural_innovation', 'engineering_feat', 'city_symbol']
  },
  'modern_landmark': {
    id: 'modern_landmark',
    name: '현대적 랜드마크',
    personas: ['architect', 'culture_critic'],
    avgChapters: 3,
    chapterRange: [2, 5],
    keywords: ['랜드마크', '기념물', '조형물', '상징', '현대건축', '설치미술'],
    culturalFactors: ['symbolic_meaning', 'artistic_value', 'cultural_impact']
  },
  'bridge_infrastructure': {
    id: 'bridge_infrastructure',
    name: '교량/인프라',
    personas: ['civil_engineer', 'urban_planner'],
    avgChapters: 3,
    chapterRange: [2, 4],
    keywords: ['교량', '다리', 'bridge', '터널', '인프라', '교통', '건설'],
    culturalFactors: ['engineering_significance', 'transportation_importance', 'design_innovation']
  },

  // 상업/엔터테인먼트
  'shopping_district': {
    id: 'shopping_district',
    name: '쇼핑 지구',
    personas: ['trend_analyst', 'local_insider'],
    avgChapters: 5,
    chapterRange: [4, 8],
    keywords: ['쇼핑', '명동', '홍대', '강남', '상권', '패션', '브랜드', '백화점', '몰'],
    culturalFactors: ['commercial_significance', 'fashion_trends', 'consumer_culture']
  },
  'entertainment_complex': {
    id: 'entertainment_complex',
    name: '엔터테인먼트 복합시설',
    personas: ['entertainment_expert', 'culture_critic'],
    avgChapters: 6,
    chapterRange: [4, 10],
    keywords: ['엔터', '복합문화', '문화센터', '공연장', '극장', '콘서트홀', '아레나'],
    culturalFactors: ['entertainment_value', 'cultural_programming', 'audience_engagement']
  },
  'theme_park': {
    id: 'theme_park',
    name: '테마파크',
    personas: ['entertainment_expert', 'youth_culture_expert'],
    avgChapters: 8,
    chapterRange: [6, 12],
    keywords: ['테마파크', '놀이공원', '디즈니', '롯데월드', '에버랜드', '유니버설'],
    culturalFactors: ['theme_coherence', 'family_appeal', 'entertainment_innovation']
  },

  // 음식/나이트라이프
  'food_street_market': {
    id: 'food_street_market',
    name: '음식거리/시장',
    personas: ['food_critic', 'local_foodie'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['음식거리', '시장', '푸드코트', '전통시장', '야시장', '먹거리', '로컬푸드'],
    culturalFactors: ['culinary_heritage', 'local_specialties', 'food_culture']
  },
  'nightlife_district': {
    id: 'nightlife_district',
    name: '나이트라이프 지구',
    personas: ['culture_critic', 'local_insider'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['클럽', '바', '펍', '나이트', '홍대', '이태원', '강남', '유흥'],
    culturalFactors: ['nightlife_culture', 'social_dynamics', 'entertainment_diversity']
  },

  // SNS/핫플레이스
  'instagram_spot': {
    id: 'instagram_spot',
    name: 'SNS 핫플레이스',
    personas: ['social_media_expert', 'trend_analyst'],
    avgChapters: 3,
    chapterRange: [2, 5],
    keywords: ['핫플', '인스타', '포토존', '셀카', 'sns', '인스타그램', '틱톡', '사진명소'],
    culturalFactors: ['visual_appeal', 'social_media_popularity', 'trend_factor']
  },
  'cafe_culture': {
    id: 'cafe_culture',
    name: '카페 문화 지역',
    personas: ['cafe_critic', 'culture_critic'],
    avgChapters: 3,
    chapterRange: [2, 5],
    keywords: ['카페', '커피', '브런치', '디저트', '로스터리', '원두', '라떼아트'],
    culturalFactors: ['coffee_culture', 'space_aesthetics', 'social_gathering']
  },
  'street_art_district': {
    id: 'street_art_district',
    name: '스트리트 아트 지구',
    personas: ['culture_critic', 'youth_culture_expert'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['스트리트아트', '벽화', '그래피티', '아트', '문화예술', '갤러리'],
    culturalFactors: ['artistic_expression', 'community_culture', 'creative_energy']
  },
  'popup_culture_area': {
    id: 'popup_culture_area',
    name: '팝업 문화 지역',
    personas: ['trend_analyst', 'youth_culture_expert'],
    avgChapters: 3,
    chapterRange: [2, 4],
    keywords: ['팝업', '팝업스토어', '한정', '콜라보', '브랜드', '이벤트'],
    culturalFactors: ['trend_sensitivity', 'brand_culture', 'temporal_appeal']
  },

  // 자연/레저
  'natural_landmark': {
    id: 'natural_landmark',
    name: '자연 명소',
    personas: ['geologist', 'nature_guide'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['자연', '산', '바다', '호수', '폭포', '절벽', '동굴', '지질'],
    culturalFactors: ['geological_significance', 'ecological_value', 'scenic_beauty']
  },
  'park_garden': {
    id: 'park_garden',
    name: '공원/정원',
    personas: ['nature_guide', 'local_insider'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['공원', '정원', '수목원', '식물원', '산책로', '휴식'],
    culturalFactors: ['landscape_design', 'recreational_value', 'ecological_education']
  },

  // 복합/기타
  'mixed_district': {
    id: 'mixed_district',
    name: '복합 지구',
    personas: ['local_insider', 'culture_critic'],
    avgChapters: 6,
    chapterRange: [4, 10],
    keywords: ['역', '동네', '지구', '구역', '복합', '다목적', '생활'],
    culturalFactors: ['urban_diversity', 'community_life', 'mixed_use_development']
  },
  'transportation_hub': {
    id: 'transportation_hub',
    name: '교통 허브',
    personas: ['urban_planner', 'architect'],
    avgChapters: 4,
    chapterRange: [3, 6],
    keywords: ['역', '공항', '터미널', '교통', '허브', '환승', '인천공항'],
    culturalFactors: ['transportation_significance', 'architectural_design', 'urban_connectivity']
  }
};

// 🎯 AI 장소 분석 함수
export class LocationAnalyzer {
  /**
   * 장소명과 컨텍스트를 분석하여 최적의 유형과 페르소나를 결정
   */
  static async analyzeLocation(
    locationName: string,
    locationContext: LocationContext,
    guideData?: any
  ) {
    console.log('🔍 장소 분석 시작:', { locationName, locationContext });

    // 1. 키워드 매칭 기반 유형 분류
    const typeScores = this.calculateTypeScores(locationName, locationContext);
    const bestType = this.selectBestType(typeScores);
    
    // 2. 가이드 데이터 분석 (있는 경우)
    const contentAnalysis = guideData ? this.analyzeGuideContent(guideData) : null;
    
    // 3. 챕터 수 결정
    const chapterCount = this.calculateOptimalChapterCount(locationName, bestType, contentAnalysis, locationContext);
    
    // 4. 최적 페르소나 선택
    const selectedPersonas = this.selectOptimalPersonas(bestType, locationContext);

    return {
      locationType: bestType.id,
      locationTypeName: bestType.name,
      personas: selectedPersonas,
      estimatedChapters: chapterCount,
      chapterRange: bestType.chapterRange,
      confidence: typeScores[bestType.id] || 0,
      culturalFactors: bestType.culturalFactors,
      contentComplexity: contentAnalysis?.complexity || 'medium'
    };
  }

  /**
   * 장소명 키워드 매칭으로 유형별 점수 계산
   */
  private static calculateTypeScores(locationName: string, locationContext: LocationContext) {
    const scores: Record<string, number> = {};
    const searchText = `${locationName} ${locationContext.city || ''} ${locationContext.country || ''}`.toLowerCase();

    Object.values(LOCATION_TYPES).forEach(type => {
      let score = 0;
      
      // 키워드 매칭
      type.keywords.forEach(keyword => {
        if (searchText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      
      // 지역별 가중치 (예: 아시아 지역의 temple 강화)
      if (locationContext.region === 'Asia' && type.id.includes('temple')) {
        score *= 1.2;
      }
      
      scores[type.id] = score;
    });

    return scores;
  }

  /**
   * 가장 높은 점수의 유형 선택 (fallback 포함)
   */
  private static selectBestType(typeScores: Record<string, number>) {
    const maxScore = Math.max(...Object.values(typeScores));
    
    if (maxScore === 0) {
      // 매칭되지 않는 경우 기본값
      return LOCATION_TYPES['mixed_district'];
    }
    
    const bestTypeId = Object.keys(typeScores).find(id => typeScores[id] === maxScore);
    return LOCATION_TYPES[bestTypeId!];
  }

  /**
   * 가이드 콘텐츠 분석
   */
  private static analyzeGuideContent(guideData: any) {
    // guide_chapters 개수와 내용 길이 분석
    const chapters = guideData.content?.realTimeGuide?.chapters || [];
    const totalContent = chapters.reduce((sum: number, chapter: any) => {
      return sum + (chapter.narrative?.length || 0) + (chapter.scene_description?.length || 0);
    }, 0);

    return {
      chapterCount: chapters.length,
      totalContentLength: totalContent,
      complexity: totalContent > 5000 ? 'high' : totalContent > 2000 ? 'medium' : 'low'
    };
  }

  /**
   * 최적 챕터 수 계산
   */
  private static calculateOptimalChapterCount(
    locationName: string,
    locationType: LocationTypeDefinition,
    contentAnalysis: any,
    locationContext: LocationContext
  ) {
    let baseCount = locationType.avgChapters;

    // 🌍 세계적 명소는 필수 스팟 전부 포함하도록 챕터 수 제한 해제
    const worldFamousLandmarks = [
      // 박물관
      'louvre', 'british museum', 'metropolitan', 'hermitage', 'prado', 'uffizi',
      'vatican museum', 'rijksmuseum', 'tokyo national museum', '국립중앙박물관',
      // 궁궐/성
      'versailles', 'forbidden city', '경복궁', 'buckingham palace', 'alhambra',
      'schönbrunn', 'topkapi', '창덕궁',
      // 랜드마크
      'eiffel tower', 'colosseum', 'sagrada familia', 'taj mahal', 'petra',
      'machu picchu', 'great wall', 'angkor wat', 'acropolis', 'stonehenge'
    ];

    // locationName, displayName, city 모두 체크
    const contextName = (locationContext as any).displayName ||
                       (locationContext as any).locationName ||
                       locationContext.city || '';
    const searchText = `${locationName} ${contextName}`.toLowerCase();

    const isWorldFamous = worldFamousLandmarks.some(landmark =>
      searchText.includes(landmark)
    );

    if (isWorldFamous) {
      console.log(`🌍 세계적 명소 감지: ${locationName} - 챕터 수 제한 해제`);
      // 세계적 명소는 필수 스팟 전부 포함하도록 높은 상한 설정
      return 15; // AI가 필수 명소 전부 포함하도록 충분한 수
    }

    // 콘텐츠 복잡도에 따른 조정
    if (contentAnalysis) {
      if (contentAnalysis.complexity === 'high') baseCount += 2;
      else if (contentAnalysis.complexity === 'low') baseCount -= 1;
    }

    // 장소 규모에 따른 조정 (대도시는 더 많은 챕터)
    const majorCities = ['Seoul', 'Tokyo', 'New York', 'London', 'Paris', 'Beijing'];
    if (majorCities.includes(locationContext.city || '')) {
      baseCount += 1;
    }

    // 범위 내로 제한
    return Math.max(
      locationType.chapterRange[0],
      Math.min(locationType.chapterRange[1], baseCount)
    );
  }

  /**
   * 최적 페르소나 선택
   */
  private static selectOptimalPersonas(
    locationType: LocationTypeDefinition,
    locationContext: LocationContext
  ) {
    const basePersonas = locationType.personas;
    
    // 지역 특성에 따른 페르소나 조정
    const adjustedPersonas = [...basePersonas];
    
    // 아시아 지역이면 문화 전문가 추가
    if (locationContext.region === 'Asia' && !adjustedPersonas.includes('culture_critic')) {
      adjustedPersonas.push('culture_critic');
    }
    
    // 현대적 장소이면 트렌드 분석가 고려
    const modernTypes = ['instagram_spot', 'cafe_culture', 'popup_culture_area'];
    if (modernTypes.includes(locationType.id) && !adjustedPersonas.includes('trend_analyst')) {
      adjustedPersonas.push('trend_analyst');
    }
    
    return adjustedPersonas.slice(0, 2); // 최대 2명으로 제한
  }
}
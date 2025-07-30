// 실내 Must-See 포인트 데이터베이스
// 박물관, 미술관, 성당 등 실내 관광지의 핵심 관람 포인트

export interface IndoorMustSeePoint {
  id: string;
  venueName: string;
  itemName: string;
  itemType: 'artwork' | 'artifact' | 'architecture' | 'experience';
  
  // 우선순위 점수 (0.0-10.0)
  globalFameScore: number;      // 세계적 인지도
  nationalImportance: number;   // 국가적 중요도  
  visitorPreference: number;    // 관광객 선호도
  photoWorthiness: number;      // 인스타그램 인기도
  educationalValue: number;     // 교육적 가치
  
  // 실내 위치 정보
  floorLevel: number;
  sectionName: string;
  roomNumber?: string;
  approximateLocation: string;  // "입구에서 직진 후 우회전"
  
  // 관람 정보
  estimatedViewingTime: number; // 분 단위
  crowdLevel: number;          // 1-5 (혼잡도)
  accessibilityNotes?: string;
  photoAllowed: boolean;
  
  // 콘텐츠
  whyMustSee: string;          // 왜 꼭 봐야 하는지
  interestingStory: string;    // 흥미로운 이야기
  photoTips?: string;          // 사진 촬영 팁
  
  // 메타데이터
  tier: 1 | 2 | 3;            // 우선순위 티어
  lastVerified: string;        // YYYY-MM-DD
}

export interface VenueInfo {
  name: string;
  type: 'museum' | 'art_gallery' | 'cathedral' | 'palace_indoor' | 'cultural_center';
  scale: 'world_heritage' | 'national' | 'major' | 'regional' | 'local';
  averageVisitDuration: number; // 분 단위
  recommendedChapterCount: number;
}

// 🏛️ 박물관 Must-See 데이터
export const MUSEUM_MUST_SEE: IndoorMustSeePoint[] = [
  // 국립중앙박물관
  {
    id: 'ncm_001',
    venueName: '국립중앙박물관',
    itemName: '신라 금관',
    itemType: 'artifact',
    globalFameScore: 9.2,
    nationalImportance: 9.8,
    visitorPreference: 9.5,
    photoWorthiness: 9.7,
    educationalValue: 9.0,
    floorLevel: 1,
    sectionName: '고대관',
    approximateLocation: '1층 고대관 중앙 전시실',
    estimatedViewingTime: 8,
    crowdLevel: 4,
    photoAllowed: true,
    whyMustSee: '신라 황금문화의 정수를 보여주는 세계적 걸작. 한국을 대표하는 문화재 중 하나로 절대 놓쳐서는 안 될 명품',
    interestingStory: '5-6세기 신라 왕이나 왕족의 무덤에서 발견된 순금 관. 나뭇가지와 사슴뿔 장식이 하늘과 땅을 잇는 샤머니즘 세계관을 표현',
    photoTips: '전시케이스 정면에서 금관의 세밀한 장식을 강조하여 촬영. 조명 반사 주의',
    tier: 1,
    lastVerified: '2024-01-15'
  },
  {
    id: 'ncm_002', 
    venueName: '국립중앙박물관',
    itemName: '반가사유상',
    itemType: 'artifact',
    globalFameScore: 9.0,
    nationalImportance: 9.7,
    visitorPreference: 9.3,
    photoWorthiness: 9.4,
    educationalValue: 9.2,
    floorLevel: 1,
    sectionName: '중근세관',
    approximateLocation: '1층 중근세관 불교조각실',
    estimatedViewingTime: 10,
    crowdLevel: 5,
    photoAllowed: true,
    whyMustSee: '한국 불교조각의 최고 걸작. 깊은 사색에 잠긴 모습이 동서양을 막론하고 감동을 주는 세계적 명품',
    interestingStory: '7세기 제작으로 추정. 오른발을 왼쪽 무릎에 올리고 오른손으로 뺨을 괴고 사색하는 모습이 완벽한 균형미를 보여줌',
    photoTips: '측면에서 사유하는 표정과 자세의 우아함을 강조. 배경을 심플하게 하여 조각의 아름다움 부각',
    tier: 1,
    lastVerified: '2024-01-15'
  },
  {
    id: 'ncm_003',
    venueName: '국립중앙박물관', 
    itemName: '백제금동대향로',
    itemType: 'artifact',
    globalFameScore: 8.5,
    nationalImportance: 9.6,
    visitorPreference: 8.8,
    photoWorthiness: 9.6,
    educationalValue: 9.1,
    floorLevel: 1,
    sectionName: '고대관',
    approximateLocation: '1층 고대관 백제실',
    estimatedViewingTime: 7,
    crowdLevel: 3,
    photoAllowed: true,
    whyMustSee: '백제 공예 기술의 최고봉. 정교한 금속공예 기법과 상상의 동물들이 어우러진 백제인의 예술혼이 담긴 걸작',
    interestingStory: '1993년 부여 능산리 고분군에서 발견. 향로 뚜껑에 76개의 신선과 상상의 동물들이 조각되어 백제인의 이상향을 표현',
    photoTips: '향로의 정교한 세부 장식을 보여주도록 클로즈업. 금속의 광택이 잘 드러나도록 조명 활용',
    tier: 1,
    lastVerified: '2024-01-15'
  },
  {
    id: 'ncm_004',
    venueName: '국립중앙박물관',
    itemName: '고구려 고분벽화',
    itemType: 'artwork',
    globalFameScore: 8.0,
    nationalImportance: 9.5,
    visitorPreference: 8.7,
    photoWorthiness: 9.2,
    educationalValue: 9.3,
    floorLevel: 1,
    sectionName: '고대관',
    approximateLocation: '1층 고대관 고구려실',
    estimatedViewingTime: 12,
    crowdLevel: 2,
    photoAllowed: true,
    whyMustSee: 'UNESCO 세계유산으로 등재된 고구려 고분벽화의 모사본. 1,500년 전 고구려인의 생활과 예술을 생생하게 만날 수 있는 타임캡슐',
    interestingStory: '무용총, 각저총 등의 벽화를 원형 그대로 재현. 역동적인 무용 장면과 씨름하는 모습이 고구려인의 기상을 보여줌',
    photoTips: '벽화의 생동감 있는 인물 표현에 집중. 색채의 선명함과 동작의 역동성을 담아낼 것',
    tier: 2,
    lastVerified: '2024-01-15'
  }
];

// 🎨 미술관 Must-See 데이터  
export const ART_GALLERY_MUST_SEE: IndoorMustSeePoint[] = [
  // 국립현대미술관
  {
    id: 'nmoca_001',
    venueName: '국립현대미술관',
    itemName: '백남준 - TV 부처',
    itemType: 'artwork',
    globalFameScore: 9.3,
    nationalImportance: 9.0,
    visitorPreference: 8.8,
    photoWorthiness: 9.5,
    educationalValue: 8.7,
    floorLevel: 1,
    sectionName: '미디어아트관',
    approximateLocation: '1층 미디어아트관 백남준 전시실',
    estimatedViewingTime: 8,
    crowdLevel: 4,
    photoAllowed: false,
    whyMustSee: '비디오 아트의 아버지 백남준의 대표작. 동양의 정신성과 서양의 기술문명이 만나는 지점을 보여주는 세계적 명작',
    interestingStory: '1974년 제작. 부처상과 TV 모니터를 대면시켜 명상과 기술, 전통과 현대의 대화를 시각화한 개념미술의 걸작',
    photoTips: '촬영 금지 작품. 대신 전시실 입구에서 작품 설명과 함께 기념 촬영 가능',
    tier: 1,
    lastVerified: '2024-01-15'
  },
  {
    id: 'nmoca_002',
    venueName: '국립현대미술관',
    itemName: '이중섭 - 흰 소',
    itemType: 'artwork', 
    globalFameScore: 8.7,
    nationalImportance: 9.8,
    visitorPreference: 9.4,
    photoWorthiness: 8.9,
    educationalValue: 9.5,
    floorLevel: 2,
    sectionName: '한국근현대미술관',
    approximateLocation: '2층 한국근현대미술관 1950년대실',
    estimatedViewingTime: 10,
    crowdLevel: 5,
    photoAllowed: true,
    whyMustSee: '한국 근현대미술의 상징적 작품. 한국전쟁의 아픔과 고향에 대한 그리움을 순백의 소를 통해 표현한 서정적 걸작',
    interestingStory: '1954년 제작. 작가의 고향 서귀포에서 보던 소를 모티프로 하여 순수함과 그리움을 표현. 한국인의 정서를 대변하는 명작',
    photoTips: '작품의 서정적 분위기를 살려 부드러운 조명에서 촬영. 흰 소의 순수한 이미지를 강조',
    tier: 1,
    lastVerified: '2024-01-15'
  }
];

// ⛪ 성당 Must-See 데이터
export const CATHEDRAL_MUST_SEE: IndoorMustSeePoint[] = [
  // 명동성당
  {
    id: 'myeongdong_001',
    venueName: '명동성당',
    itemName: '고딕양식 정면 파사드',
    itemType: 'architecture',
    globalFameScore: 7.8,
    nationalImportance: 9.2,
    visitorPreference: 9.0,
    photoWorthiness: 9.7,
    educationalValue: 8.5,
    floorLevel: 0,
    sectionName: '외부정면',
    approximateLocation: '성당 정면 입구',
    estimatedViewingTime: 5,
    crowdLevel: 3,
    photoAllowed: true,
    whyMustSee: '한국 천주교의 상징이자 서울 도심 속 고딕 건축의 백미. 1898년 완공된 근대 건축의 걸작',
    interestingStory: '프랑스인 코스트 신부가 설계한 고딕 양식. 붉은 벽돌과 화강암으로 쌓아 올린 첨탑이 하늘을 향한 기도를 상징',
    photoTips: '성당 정면 광장에서 전체적인 웅장함 포착. 첨탑의 수직선을 강조하여 성스러운 분위기 연출',
    tier: 1,
    lastVerified: '2024-01-15'
  },
  {
    id: 'myeongdong_002',
    venueName: '명동성당',
    itemName: '장미창 스테인드글라스',
    itemType: 'architecture',
    globalFameScore: 7.2,
    nationalImportance: 8.0,
    visitorPreference: 8.8,
    photoWorthiness: 9.5,
    educationalValue: 8.2,
    floorLevel: 1,
    sectionName: '제단 뒤편',
    approximateLocation: '제단 뒤 벽면 상단',
    estimatedViewingTime: 6,
    crowdLevel: 2,
    photoAllowed: true,
    whyMustSee: '화려한 색채와 빛이 만들어내는 신비로운 아름다움. 스테인드글라스 예술의 정수를 보여주는 작품',
    interestingStory: '성경의 주요 장면들을 색유리로 표현. 햇빛이 통과하며 만들어내는 오색찬란한 빛이 성스러운 분위기를 연출',
    photoTips: '오후 햇빛이 들어오는 시간대(2-4시)에 촬영하면 가장 아름다운 색채 효과. 실루엣과 함께 촬영하면 더욱 드라마틱',
    tier: 2,
    lastVerified: '2024-01-15'
  }
];

// 🏰 궁궐 실내 Must-See 데이터
export const PALACE_INDOOR_MUST_SEE: IndoorMustSeePoint[] = [
  // 경복궁 국립고궁박물관
  {
    id: 'palace_museum_001',
    venueName: '국립고궁박물관',
    itemName: '조선왕조 어보',
    itemType: 'artifact',
    globalFameScore: 7.5,
    nationalImportance: 9.3,
    visitorPreference: 8.6,
    photoWorthiness: 8.8,
    educationalValue: 9.0,
    floorLevel: 1,
    sectionName: '왕실문화실',
    approximateLocation: '1층 왕실문화실 중앙',
    estimatedViewingTime: 8,
    crowdLevel: 3,
    photoAllowed: true,
    whyMustSee: '조선 왕권의 상징이자 드라마에서 자주 등장하는 그 어보. 왕의 권위와 조선 왕실문화를 직접 체험할 수 있는 핵심 유물',
    interestingStory: '왕과 왕비의 공식 인장으로 국가 중요 문서에 사용. 금이나 옥으로 제작되었으며 용과 거북이 손잡이로 장식',
    photoTips: '어보의 정교한 조각과 재질의 고급스러움을 부각. 측면에서 입체감 있게 촬영',
    tier: 2,
    lastVerified: '2024-01-15'
  }
];

// 🗂️ 장소별 정보
export const VENUE_INFO: Record<string, VenueInfo> = {
  '국립중앙박물관': {
    name: '국립중앙박물관',
    type: 'museum',
    scale: 'national',
    averageVisitDuration: 120, // 2시간
    recommendedChapterCount: 9
  },
  '국립현대미술관': {
    name: '국립현대미술관',
    type: 'art_gallery', 
    scale: 'national',
    averageVisitDuration: 90, // 1.5시간
    recommendedChapterCount: 7
  },
  '명동성당': {
    name: '명동성당',
    type: 'cathedral',
    scale: 'major',
    averageVisitDuration: 45, // 45분
    recommendedChapterCount: 5
  },
  '국립고궁박물관': {
    name: '국립고궁박물관',
    type: 'museum',
    scale: 'major', 
    averageVisitDuration: 75, // 1시간 15분
    recommendedChapterCount: 6
  }
};

// 🔍 데이터 조회 함수들
export class IndoorMustSeeDatabase {
  // 장소별 Must-See 포인트 조회
  static getMustSeePoints(venueName: string): IndoorMustSeePoint[] {
    const allPoints = [
      ...MUSEUM_MUST_SEE,
      ...ART_GALLERY_MUST_SEE, 
      ...CATHEDRAL_MUST_SEE,
      ...PALACE_INDOOR_MUST_SEE
    ];
    
    return allPoints.filter(point => point.venueName === venueName);
  }
  
  // 티어별 포인트 조회
  static getPointsByTier(venueName: string, tier: 1 | 2 | 3): IndoorMustSeePoint[] {
    return this.getMustSeePoints(venueName).filter(point => point.tier === tier);
  }
  
  // 인기도 순으로 정렬된 포인트 조회
  static getTopRatedPoints(venueName: string, limit?: number): IndoorMustSeePoint[] {
    const points = this.getMustSeePoints(venueName)
      .sort((a, b) => {
        // 종합 점수 = 세계적 인지도 * 0.3 + 관광객 선호도 * 0.4 + 사진 가치 * 0.3
        const scoreA = a.globalFameScore * 0.3 + a.visitorPreference * 0.4 + a.photoWorthiness * 0.3;
        const scoreB = b.globalFameScore * 0.3 + b.visitorPreference * 0.4 + b.photoWorthiness * 0.3;
        return scoreB - scoreA;
      });
    
    return limit ? points.slice(0, limit) : points;
  }
  
  // 장소 정보 조회
  static getVenueInfo(venueName: string): VenueInfo | undefined {
    return VENUE_INFO[venueName];
  }
  
  // 사진 촬영 가능한 포인트만 조회
  static getPhotoAllowedPoints(venueName: string): IndoorMustSeePoint[] {
    return this.getMustSeePoints(venueName).filter(point => point.photoAllowed);
  }
  
  // 관람 시간 기준으로 추천 포인트 선별
  static getPointsForTimeLimit(venueName: string, availableMinutes: number): IndoorMustSeePoint[] {
    const points = this.getTopRatedPoints(venueName);
    const selected: IndoorMustSeePoint[] = [];
    let totalTime = 0;
    
    for (const point of points) {
      if (totalTime + point.estimatedViewingTime <= availableMinutes) {
        selected.push(point);
        totalTime += point.estimatedViewingTime;
      }
    }
    
    return selected;
  }
}

// 📊 통계 및 검증 함수들
export class IndoorDataAnalytics {
  // 데이터베이스 통계
  static getStatistics() {
    const allPoints = [
      ...MUSEUM_MUST_SEE,
      ...ART_GALLERY_MUST_SEE,
      ...CATHEDRAL_MUST_SEE, 
      ...PALACE_INDOOR_MUST_SEE
    ];
    
    return {
      totalPoints: allPoints.length,
      venueCount: Object.keys(VENUE_INFO).length,
      tier1Count: allPoints.filter(p => p.tier === 1).length,
      tier2Count: allPoints.filter(p => p.tier === 2).length,
      tier3Count: allPoints.filter(p => p.tier === 3).length,
      averageGlobalFame: allPoints.reduce((sum, p) => sum + p.globalFameScore, 0) / allPoints.length,
      photoAllowedRate: allPoints.filter(p => p.photoAllowed).length / allPoints.length
    };
  }
  
  // 데이터 품질 검증
  static validateData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allPoints = [
      ...MUSEUM_MUST_SEE,
      ...ART_GALLERY_MUST_SEE,
      ...CATHEDRAL_MUST_SEE,
      ...PALACE_INDOOR_MUST_SEE
    ];
    
    // 필수 필드 검증
    allPoints.forEach(point => {
      if (!point.whyMustSee || point.whyMustSee.length < 10) {
        errors.push(`${point.itemName}: whyMustSee 내용이 너무 짧습니다`);
      }
      if (point.globalFameScore < 0 || point.globalFameScore > 10) {
        errors.push(`${point.itemName}: globalFameScore가 유효 범위를 벗어났습니다`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
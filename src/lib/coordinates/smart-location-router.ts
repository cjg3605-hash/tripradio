// 🧭 GPS 앱서비스 전문가 추천 - 스마트 위치 라우팅 시스템
export class SmartLocationRouter {
  
  /**
   * 🎯 GPS 앱서비스 전문가 추천 솔루션
   * 3-Tier 정확도 + 사용자 경험 최적화
   */
  async routeLocationStrategy(chapterTitle: string, locationName: string): Promise<LocationStrategy> {
    
    // 1단계: 챕터 유형 자동 분류
    const locationType = this.classifyLocationType(chapterTitle);
    
    // 2단계: 유형별 최적 전략 선택
    switch(locationType) {
      case 'ENTRANCE_GATE':
        return this.createPreciseStrategy(chapterTitle, locationName);
        
      case 'BUILDING_INTERIOR':
        return this.createApproximateStrategy(chapterTitle, locationName);
        
      case 'AREA_GENERAL':
        return this.createGeneralStrategy(chapterTitle, locationName);
        
      default:
        return this.createFallbackStrategy(chapterTitle, locationName);
    }
  }

  /**
   * 🔍 챕터 제목 기반 위치 유형 분류
   * GPS 앱에서 검증된 키워드 패턴 사용
   */
  private classifyLocationType(title: string): LocationType {
    const patterns = {
      ENTRANCE_GATE: [
        '입구', '정문', '매표소', '게이트', '출입구', 
        'entrance', 'gate', 'ticket', '售票', '入口'
      ],
      
      BUILDING_INTERIOR: [
        '전', '관', '실', '당', '각', '루', '정', 
        'hall', 'room', 'palace', 'temple', 'pavilion',
        '殿', '館', '室', '堂', '閣', '樓', '亭'
      ],
      
      AREA_GENERAL: [
        '광장', '공원', '거리', '마을', '구역', '지구',
        'square', 'park', 'street', 'village', 'district',
        '広場', '公園', '街', '村', '区域'
      ],
      
      PHOTO_SPOT: [
        '포토존', '전망', '뷰포인트', '촬영', '사진',
        'photo', 'view', 'scenic', 'observation'
      ]
    };

    for (const [type, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => title.includes(keyword))) {
        return type as LocationType;
      }
    }
    
    return 'BUILDING_INTERIOR'; // 기본값
  }

  /**
   * 🎯 TIER 1: 정밀 전략 (5-15m 정확도)
   * Google Places + 수동 검증 + 크라우드소싱
   */
  private async createPreciseStrategy(title: string, locationName: string): Promise<LocationStrategy> {
    return {
      tier: 'PRECISE',
      method: 'crowdsourced_verified',
      expectedAccuracy: 10,
      confidence: 0.9,
      
      // GPS 앱서비스 핵심: 사용자 가이던스
      userGuidance: {
        approachText: `${locationName}의 메인 입구로 향하세요`,
        arrivalText: `${title} 근처에 도착했습니다. 주변을 둘러보세요.`,
        fallbackText: `정확한 위치를 찾기 어려우면 안내 데스크에 문의하세요.`
      },
      
      // 오프라인 대응
      offlineStrategy: {
        hasOfflineMap: true,
        landmarkDescription: `${locationName} 정문/입구 부근`,
        visualCues: ['매표소', '안내판', '대기줄']
      },
      
      implementation: async () => {
        // 1. 크라우드소싱 데이터 확인 (있다면)
        const crowdsourcedData = await this.getCrowdsourcedLocation(title);
        
        // 2. 수동 큐레이션 데이터 확인
        const curatedData = await this.getCuratedLocation(title, locationName);
        
        // 3. 가장 신뢰할 수 있는 좌표 선택
        return this.selectBestCoordinate([crowdsourcedData, curatedData]);
      }
    };
  }

  /**
   * 🎯 TIER 2: 근사 전략 (30-100m 정확도)
   * 기준점 + 상대 위치 + AI 추정
   */
  private async createApproximateStrategy(title: string, locationName: string): Promise<LocationStrategy> {
    return {
      tier: 'APPROXIMATE',
      method: 'reference_point_offset',
      expectedAccuracy: 50,
      confidence: 0.7,
      
      userGuidance: {
        approachText: `${locationName} 내부의 ${title} 방향으로 이동하세요`,
        arrivalText: `${title} 근처 구역입니다. 안내판을 찾아보세요.`,
        fallbackText: `이 건물 내에서 ${title}을(를) 찾아보세요. 직원에게 문의 가능합니다.`
      },
      
      offlineStrategy: {
        hasOfflineMap: false,
        landmarkDescription: `${locationName} 내부, ${title} 근처`,
        visualCues: ['안내판', '방향 표시', '건물 구조']
      },
      
      implementation: async () => {
        // 1. 기준점 찾기 (입구, 정문 등)
        const referencePoint = await this.findReferencePoint(locationName);
        
        // 2. AI로 상대 위치 추정
        const relativePosition = await this.estimateRelativePosition(title, locationName);
        
        // 3. 기준점 + 오프셋으로 좌표 계산
        return this.calculateOffsetCoordinate(referencePoint, relativePosition);
      }
    };
  }

  /**
   * 🎯 TIER 3: 일반 전략 (100-300m 정확도)
   * 구역 중심점 + 서술적 안내
   */
  private async createGeneralStrategy(title: string, locationName: string): Promise<LocationStrategy> {
    return {
      tier: 'GENERAL',
      method: 'area_centroid',
      expectedAccuracy: 150,
      confidence: 0.5,
      
      userGuidance: {
        approachText: `${locationName} ${title} 구역으로 이동하세요`,
        arrivalText: `${title} 구역에 진입했습니다. 천천히 둘러보세요.`,
        fallbackText: `이 넓은 구역 어디서든 ${title}의 매력을 느낄 수 있습니다.`
      },
      
      offlineStrategy: {
        hasOfflineMap: false,
        landmarkDescription: `${locationName} ${title} 일대`,
        visualCues: ['주변 분위기', '건물 스타일', '사람들의 활동']
      },
      
      implementation: async () => {
        // 구역의 기하학적 중심점 계산
        return this.calculateAreaCentroid(locationName, title);
      }
    };
  }

  /**
   * 🚨 폴백 전략: 모든 것이 실패했을 때
   */
  private createFallbackStrategy(title: string, locationName: string): LocationStrategy {
    return {
      tier: 'FALLBACK',
      method: 'best_effort',
      expectedAccuracy: 500,
      confidence: 0.3,
      
      userGuidance: {
        approachText: `${locationName}로 이동하세요`,
        arrivalText: `${locationName}에 도착했습니다. ${title}을(를) 찾아보세요.`,
        fallbackText: `정확한 위치 정보가 없습니다. 현지 안내를 받으시기 바랍니다.`
      },
      
      implementation: async () => {
        // 최소한 관광지 중심점이라도 제공
        return this.getLocationCenterPoint(locationName);
      }
    };
  }

  /**
   * 🎯 GPS 앱서비스 핵심: 사용자 경험 최적화
   */
  async enhanceUserExperience(strategy: LocationStrategy, userContext: UserContext): Promise<EnhancedStrategy> {
    return {
      ...strategy,
      
      // 실시간 거리 기반 안내
      proximityAlerts: {
        approaching: `${strategy.userGuidance.approachText} (약 ${userContext.distanceToTarget}m)`,
        arrived: strategy.userGuidance.arrivalText,
        passed: `지나쳤습니다. 뒤로 약 ${userContext.overshootDistance}m 돌아가세요.`
      },
      
      // 오프라인 모드 지원
      offlineGuidance: strategy.offlineStrategy,
      
      // AR/카메라 기반 보조 (미래 확장)
      arGuidance: {
        enabled: false, // 현재는 비활성화
        features: ['방향 화살표', '거리 표시', '실시간 오버레이']
      }
    };
  }
}

// 타입 정의들
interface LocationStrategy {
  tier: 'PRECISE' | 'APPROXIMATE' | 'GENERAL' | 'FALLBACK';
  method: string;
  expectedAccuracy: number;
  confidence: number;
  userGuidance: UserGuidance;
  offlineStrategy: OfflineStrategy;
  implementation: () => Promise<Coordinate>;
}

interface UserGuidance {
  approachText: string;
  arrivalText: string;
  fallbackText: string;
}

interface OfflineStrategy {
  hasOfflineMap: boolean;
  landmarkDescription: string;
  visualCues: string[];
}

type LocationType = 'ENTRANCE_GATE' | 'BUILDING_INTERIOR' | 'AREA_GENERAL' | 'PHOTO_SPOT';

export { SmartLocationRouter };
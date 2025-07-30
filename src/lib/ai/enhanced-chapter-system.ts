// Enhanced Chapter Selection System - 핵심 엔진
// 현실적이고 효율적인 챕터 선정 및 생성 시스템

import { 
  LocationData, 
  EnhancedChapterStructure, 
  ViewingPoint, 
  IntroChapter,
  MainChapter,
  ChapterGenerationRequest,
  ChapterGenerationResponse,
  ValidationResult,
  VenueType,
  VenueScale,
  UserProfile 
} from '@/types/enhanced-chapter';

import { 
  analyzeLocationType, 
  getRecommendedSpotCount,
  LOCATION_TYPE_CONFIGS 
} from '@/lib/ai/prompts/index';

/**
 * 🎯 Enhanced Chapter Selection System
 * 현실적 접근법으로 설계된 차세대 챕터 선정 시스템
 */
export class EnhancedChapterSelectionSystem {
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

  /**
   * 메인 엔트리포인트: 최적화된 챕터 구조 생성
   */
  async generateOptimalChapters(
    request: ChapterGenerationRequest
  ): Promise<ChapterGenerationResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🎯 Enhanced Chapter System: 챕터 생성 시작', {
        location: request.locationName,
        language: request.preferredLanguage
      });

      // 1️⃣ 캐시 확인 (성능 최적화)
      const cacheKey = this.generateCacheKey(request);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('✅ 캐시 히트: 기존 분석 결과 사용');
        return {
          success: true,
          data: this.personalizeChapters(cached, request.userProfile),
          metadata: {
            processingTime: Date.now() - startTime,
            dataSource: ['cache'],
            confidence: 0.9,
            cacheHit: true
          }
        };
      }

      // 2️⃣ 위치 데이터 수집 및 분석
      const locationData = await this.analyzeLocation(request.locationName);
      
      // 3️⃣ 인트로 챕터 생성 (Chapter 0)
      const introChapter = await this.generateIntroChapter(
        locationData, 
        request.userProfile
      );

      // 4️⃣ 메인 챕터들 생성 (Chapter 1~N)
      const mainChapters = await this.generateMainChapters(
        locationData,
        request
      );

      // 5️⃣ 통합 챕터 구조 생성
      const chapterStructure: EnhancedChapterStructure = {
        introChapter,
        mainChapters,
        metadata: {
          totalChapters: mainChapters.length + 1,
          estimatedTotalDuration: this.calculateTotalDuration(introChapter, mainChapters),
          difficulty: this.assessDifficulty(locationData),
          bestTimeToVisit: this.getBestVisitingTime(locationData),
          generatedAt: new Date(),
          version: '1.0',
          personalizedFor: request.userProfile
        }
      };

      // 6️⃣ 품질 검증
      const validation = await this.validateChapters(chapterStructure, locationData);
      if (!validation.isValid) {
        console.warn('⚠️ 품질 검증 실패:', validation.missingElements);
        // 자동 개선 시도
        chapterStructure.mainChapters = await this.improveChapters(
          chapterStructure.mainChapters, 
          validation
        );
      }

      // 7️⃣ 캐시 저장
      this.saveToCache(cacheKey, chapterStructure);

      console.log('✅ 챕터 생성 완료:', {
        totalChapters: chapterStructure.metadata.totalChapters,
        processingTime: Date.now() - startTime,
        validationScore: validation.score
      });

      return {
        success: true,
        data: chapterStructure,
        metadata: {
          processingTime: Date.now() - startTime,
          dataSource: ['enhanced_analysis', 'must_see_db'],
          confidence: validation.score,
          cacheHit: false
        }
      };

    } catch (error) {
      console.error('❌ 챕터 생성 실패:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        metadata: {
          processingTime: Date.now() - startTime,
          dataSource: [],
          confidence: 0,
          cacheHit: false
        }
      };
    }
  }

  /**
   * 위치 정보 분석 및 Must-See 포인트 식별
   */
  private async analyzeLocation(locationName: string): Promise<LocationData> {
    console.log('🔍 위치 분석 시작:', locationName);

    // 기본 위치 타입 분석 (기존 시스템 활용)
    const locationType = analyzeLocationType(locationName);
    const spotCountInfo = getRecommendedSpotCount(locationName);
    const config = LOCATION_TYPE_CONFIGS[locationType];

    // 🏛️ 장소 규모 결정
    const venueScale: VenueScale = this.determineVenueScale(locationName, locationType);
    
    // 🎯 Must-See 포인트 생성 (현실적 접근법)
    const viewingPoints = await this.generateViewingPoints(
      locationName, 
      locationType, 
      venueScale
    );

    // 📍 위치 타입 결정 (실내/실외/혼합)
    const venueType: VenueType = this.determineVenueType(locationType);

    return {
      name: locationName,
      coordinates: await this.getLocationCoordinates(locationName),
      venueType,
      scale: venueScale,
      averageVisitDuration: this.estimateVisitDuration(venueScale, viewingPoints.length),
      tier1Points: viewingPoints.filter(p => p.tier === 'tier1_worldFamous'),
      tier2Points: viewingPoints.filter(p => p.tier === 'tier2_nationalTreasure'),
      tier3Points: viewingPoints.filter(p => p.tier === 'tier3_crowdFavorite')
    };
  }

  /**
   * 인트로 챕터 (Chapter 0) 생성
   */
  private async generateIntroChapter(
    locationData: LocationData,
    userProfile?: UserProfile
  ): Promise<IntroChapter> {
    const startingPoint = await this.determineOptimalStartingPoint(locationData);
    
    return {
      id: 0,
      type: 'introduction',
      title: `${locationData.name} 관람 시작`,
      location: {
        type: startingPoint.type,
        coordinates: startingPoint.coordinates,
        description: startingPoint.description
      },
      content: {
        historicalBackground: await this.generateHistoricalBackground(locationData),
        culturalContext: await this.generateCulturalContext(locationData),
        visitingTips: await this.generateVisitingTips(locationData),
        whatsToExpected: await this.generateExpectationSetting(locationData),
        timeEstimate: Math.ceil(locationData.averageVisitDuration / 10), // 인트로는 전체의 10%
        highlightsPreview: this.generateHighlightsPreview(locationData)
      },
      triggers: {
        primaryTrigger: {
          type: 'gps_proximity',
          coordinates: startingPoint.coordinates,
          radius: 50 // 50m 반경
        },
        alternativeTriggers: [
          {
            type: 'manual_start',
            description: '수동 시작 버튼',
          },
          {
            type: 'qr_code',
            location: 'entrance_gate',
            description: '입구 QR코드 스캔'
          }
        ]
      },
      navigation: {
        nextChapterHint: this.generateNextChapterHint(locationData),
        estimatedDuration: Math.ceil(locationData.averageVisitDuration / 10)
      }
    };
  }

  /**
   * 메인 챕터들 (Chapter 1~N) 생성
   */
  private async generateMainChapters(
    locationData: LocationData,
    request: ChapterGenerationRequest
  ): Promise<MainChapter[]> {
    // 🎯 최적 챕터 수 결정
    const optimalCount = this.calculateOptimalChapterCount(locationData, request);
    
    // 🏆 Must-See 우선순위로 포인트 선별
    const allPoints = [
      ...locationData.tier1Points,
      ...locationData.tier2Points,
      ...locationData.tier3Points
    ];
    
    const selectedPoints = this.selectTopViewingPoints(allPoints, optimalCount);
    
    // 🗺️ 최적 관람 순서 결정
    const optimizedSequence = await this.optimizeViewingSequence(
      selectedPoints,
      locationData.venueType
    );

    // 📝 각 챕터 상세 내용 생성
    const mainChapters: MainChapter[] = [];
    
    for (let i = 0; i < optimizedSequence.length; i++) {
      const point = optimizedSequence[i];
      const chapter = await this.generateMainChapter(
        point,
        i + 1,
        locationData,
        request.userProfile,
        i > 0 ? optimizedSequence[i - 1] : null
      );
      mainChapters.push(chapter);
    }

    return mainChapters;
  }

  /**
   * 개별 메인 챕터 생성
   */
  private async generateMainChapter(
    viewingPoint: ViewingPoint,
    chapterNumber: number,
    locationData: LocationData,
    userProfile?: UserProfile,
    previousPoint?: ViewingPoint | null
  ): Promise<MainChapter> {
    return {
      id: chapterNumber,
      type: 'viewing_point',
      title: `${chapterNumber}. ${viewingPoint.name}`,
      priority: this.determinePriority(viewingPoint.tier),
      viewingPoint,
      content: {
        narrative: await this.generateNarrative(viewingPoint, userProfile),
        description: viewingPoint.content.detailedDescription,
        keyHighlights: await this.extractKeyHighlights(viewingPoint),
        didYouKnow: viewingPoint.content.interestingFacts,
        photoTips: viewingPoint.content.photoTips
      },
      navigation: {
        fromPrevious: previousPoint 
          ? await this.generateNavigation(previousPoint, viewingPoint, locationData.venueType)
          : await this.generateFromIntroNavigation(viewingPoint, locationData),
        estimatedWalkTime: previousPoint 
          ? this.calculateWalkTime(previousPoint.coordinates, viewingPoint.coordinates)
          : 2, // 인트로에서 첫 지점까지 기본 2분
        accessibility: {
          wheelchairAccessible: viewingPoint.scores.accessibilityScore > 7,
          stairsRequired: this.checkStairsRequired(viewingPoint),
          accessibilityNotes: await this.generateAccessibilityNotes(viewingPoint)
        }
      },
      triggers: locationData.venueType === 'outdoor' ? {
        outdoor: {
          type: 'gps_proximity',
          coordinates: {
            lat: viewingPoint.coordinates.lat,
            lng: viewingPoint.coordinates.lng
          },
          radius: 30 // 30m 반경
        }
      } : {
        indoor: {
          type: 'manual_activation',
          contextualCues: viewingPoint.location.visualLandmarks,
          visualLandmarks: viewingPoint.location.visualLandmarks
        }
      },
      audioInfo: {
        duration: this.estimateAudioDuration(viewingPoint),
        // audioUrl은 별도 TTS 시스템에서 생성
      }
    };
  }

  /**
   * 🎯 현실적 최적 챕터 수 계산
   */
  private calculateOptimalChapterCount(
    locationData: LocationData,
    request: ChapterGenerationRequest
  ): number {
    // 🏛️ 장소 규모별 기본 챕터 수
    const baseCountByScale: Record<VenueScale, number> = {
      'world_heritage': 12,      // 루브르, 베르사유 등
      'national_museum': 9,      // 국립중앙박물관 등
      'major_attraction': 7,     // 경복궁, 불국사 등
      'regional_site': 5,        // 지역 박물관, 향토 유적지
      'local_attraction': 4      // 소규모 갤러리, 지역 명소
    };

    const baseCount = baseCountByScale[locationData.scale];

    // 🎯 실제 Must-See 아이템 수 고려
    const tier1Count = locationData.tier1Points.length;
    const tier2Count = locationData.tier2Points.length;
    const mustSeeCount = tier1Count + Math.ceil(tier2Count * 0.7);

    // ⏰ 시간 제약 고려
    const visitDuration = request.visitDuration || locationData.averageVisitDuration;
    const timeConstraint = Math.floor(visitDuration / 12); // 12분/챕터 기준

    // 🧠 인지 부하 고려 (Miller's 7±2 rule)
    const cognitionLimit = 8;

    const optimalCount = Math.min(
      Math.max(mustSeeCount, 4), // 최소 4개 보장
      baseCount,
      timeConstraint,
      cognitionLimit
    );

    console.log('📊 챕터 수 계산:', {
      scale: locationData.scale,
      baseCount,
      mustSeeCount,
      timeConstraint,
      optimalCount
    });

    return optimalCount;
  }

  /**
   * 🏆 상위 관람 포인트 선별 (Must-See 우선)
   */
  private selectTopViewingPoints(
    allPoints: ViewingPoint[],
    targetCount: number
  ): ViewingPoint[] {
    // 종합 점수 기준 정렬
    const sortedPoints = allPoints.sort((a, b) => b.compositeScore - a.compositeScore);
    
    // Tier 1은 무조건 포함
    const tier1Points = sortedPoints.filter(p => p.tier === 'tier1_worldFamous');
    
    // 남은 자리에 Tier 2, 3 순서로 채움
    const remainingSlots = targetCount - tier1Points.length;
    const otherPoints = sortedPoints.filter(p => p.tier !== 'tier1_worldFamous');
    
    const selectedOthers = otherPoints.slice(0, remainingSlots);
    
    const result = [...tier1Points, ...selectedOthers];
    
    console.log('🎯 선별된 관람 포인트:', {
      총개수: result.length,
      Tier1: tier1Points.length,
      Tier2이하: selectedOthers.length,
      포인트목록: result.map(p => `${p.name} (${p.tier}, ${p.compositeScore.toFixed(1)})`)
    });
    
    return result;
  }

  /**
   * 🗺️ 관람 순서 최적화
   */
  private async optimizeViewingSequence(
    points: ViewingPoint[],
    venueType: VenueType
  ): Promise<ViewingPoint[]> {
    if (venueType === 'outdoor') {
      // 실외: 지리적 위치 기반 최적 경로
      return this.optimizeGeographicRoute(points);
    } else {
      // 실내: 관람 흐름 기반 최적 순서
      return this.optimizeIndoorFlow(points);
    }
  }

  /**
   * 지리적 위치 기반 경로 최적화 (실외용)
   */
  private optimizeGeographicRoute(points: ViewingPoint[]): ViewingPoint[] {
    // 간단한 nearest neighbor 알고리즘 적용
    const result: ViewingPoint[] = [];
    const remaining = [...points];
    
    // 가장 유명한 지점부터 시작 (Tier 1 중 최고점)
    let current = remaining.reduce((prev, curr) => 
      curr.compositeScore > prev.compositeScore ? curr : prev
    );
    
    result.push(current);
    remaining.splice(remaining.indexOf(current), 1);
    
    // 가까운 지점 순서로 연결
    while (remaining.length > 0) {
      const nearest = remaining.reduce((prev, curr) => {
        const prevDist = this.calculateDistance(current.coordinates, prev.coordinates);
        const currDist = this.calculateDistance(current.coordinates, curr.coordinates);
        return currDist < prevDist ? curr : prev;
      });
      
      result.push(nearest);
      remaining.splice(remaining.indexOf(nearest), 1);
      current = nearest;
    }
    
    return result;
  }

  /**
   * 실내 관람 흐름 최적화
   */
  private optimizeIndoorFlow(points: ViewingPoint[]): ViewingPoint[] {
    // 실내는 중요도 + 관람 흐름 기준으로 정렬
    // 예: 입구 → 메인홀 → 특별전시 → 세부 전시실 순서
    
    const flowPriority: Record<string, number> = {
      '입구': 1,
      '메인': 2, 
      '중앙': 2,
      '대표': 3,
      '특별': 4,
      '상설': 5,
      '기획': 6
    };
    
    return points.sort((a, b) => {
      // 1순위: 관람 흐름
      const aFlow = this.getFlowPriority(a.name, flowPriority);
      const bFlow = this.getFlowPriority(b.name, flowPriority);
      
      if (aFlow !== bFlow) {
        return aFlow - bFlow;
      }
      
      // 2순위: 종합 점수
      return b.compositeScore - a.compositeScore;
    });
  }

  /**
   * 헬퍼 메서드들
   */
  private determineVenueScale(locationName: string, locationType: string): VenueScale {
    const worldHeritageKeywords = ['루브르', '베르사유', '자금성', '바티칸', '에르미타주'];
    const nationalKeywords = ['국립', '국가', '중앙', 'national', 'central'];
    const majorKeywords = ['궁', '대성당', '성당', '사찰', '절', 'palace', 'cathedral'];
    
    const name = locationName.toLowerCase();
    
    if (worldHeritageKeywords.some(keyword => name.includes(keyword.toLowerCase()))) {
      return 'world_heritage';
    }
    if (nationalKeywords.some(keyword => name.includes(keyword.toLowerCase()))) {
      return 'national_museum';
    }
    if (majorKeywords.some(keyword => name.includes(keyword.toLowerCase()))) {
      return 'major_attraction';
    }
    if (name.includes('지역') || name.includes('시립') || name.includes('구립')) {
      return 'regional_site';
    }
    
    return 'local_attraction';
  }

  private determineVenueType(locationType: string): VenueType {
    const indoorTypes = ['cultural', 'historical']; // 미술관, 박물관
    const outdoorTypes = ['nature', 'commercial']; // 공원, 시장
    const mixedTypes = ['palace', 'religious', 'traditional']; // 궁궐, 사찰, 한옥마을
    
    if (indoorTypes.includes(locationType)) return 'indoor';
    if (outdoorTypes.includes(locationType)) return 'outdoor';
    return 'mixed';
  }

  private async generateViewingPoints(
    locationName: string,
    locationType: string,
    venueScale: VenueScale
  ): Promise<ViewingPoint[]> {
    // 현실적 접근: 사전 정의된 Must-See 포인트 + 동적 생성
    const points: ViewingPoint[] = [];
    
    // 임시 데이터 (실제로는 데이터베이스에서 조회)
    const mockPoints = await this.getMockViewingPoints(locationName, locationType);
    
    return mockPoints;
  }

  private async getMockViewingPoints(locationName: string, locationType: string): Promise<ViewingPoint[]> {
    // 현실적 Mock 데이터 (추후 실제 DB로 교체)
    const basePoints: Partial<ViewingPoint>[] = [
      {
        name: `${locationName} 대표 명소`,
        tier: 'tier1_worldFamous',
        scores: {
          globalFameScore: 9.2,
          culturalImportance: 9.0,
          visitorPreference: 9.5,
          photoWorthiness: 9.8,
          uniquenessScore: 9.3,
          accessibilityScore: 8.0
        }
      },
      {
        name: `${locationName} 핵심 전시`,
        tier: 'tier2_nationalTreasure',
        scores: {
          globalFameScore: 7.8,
          culturalImportance: 8.5,
          visitorPreference: 8.2,
          photoWorthiness: 8.0,
          uniquenessScore: 8.3,
          accessibilityScore: 8.5
        }
      }
    ];

    return basePoints.map((point, index) => ({
      id: `point_${index}`,
      name: point.name!,
      coordinates: {
        lat: 37.5665 + (Math.random() - 0.5) * 0.01, // 서울 중심 임시 좌표
        lng: 126.9780 + (Math.random() - 0.5) * 0.01
      },
      tier: point.tier!,
      scores: point.scores!,
      compositeScore: this.calculateCompositeScore(point.scores!),
      content: {
        shortDescription: `${point.name} 간단 설명`,
        detailedDescription: `${point.name}에 대한 상세한 설명입니다.`,
        interestingFacts: `${point.name}의 흥미로운 사실`,
        photoTips: `${point.name} 사진 촬영 팁`
      },
      location: {
        sectionName: `구역 ${index + 1}`,
        visualLandmarks: [`랜드마크 ${index + 1}`, `표지판 ${index + 1}`],
        walkingDirections: `이전 지점에서 ${['북쪽', '남쪽', '동쪽', '서쪽'][index % 4]}으로 이동`
      },
      metadata: {
        lastVerified: new Date(),
        curatorNotes: '전문가 검증 완료'
      }
    }));
  }

  private calculateCompositeScore(scores: ViewingPoint['scores']): number {
    // 가중 평균 계산
    const weights = {
      globalFameScore: 0.25,     // 세계적 유명도
      culturalImportance: 0.20,  // 문화적 중요도
      visitorPreference: 0.25,   // 방문자 선호도
      photoWorthiness: 0.15,     // 사진 가치
      uniquenessScore: 0.10,     // 유일성
      accessibilityScore: 0.05   // 접근성
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);
  }

  // 추가 헬퍼 메서드들...
  private generateCacheKey(request: ChapterGenerationRequest): string {
    return `chapters:${request.locationName}:${request.preferredLanguage}:${JSON.stringify(request.userProfile)}`;
  }

  private getFromCache(key: string): EnhancedChapterStructure | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private saveToCache(key: string, data: EnhancedChapterStructure): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private personalizeChapters(
    chapters: EnhancedChapterStructure,
    userProfile?: UserProfile
  ): EnhancedChapterStructure {
    if (!userProfile) return chapters;
    
    // 사용자 프로필 기반 개인화 로직
    // 예: 관심사에 따른 설명 강조, 연령대에 따른 내용 조정 등
    return {
      ...chapters,
      metadata: {
        ...chapters.metadata,
        personalizedFor: userProfile
      }
    };
  }

  // 기타 필요한 헬퍼 메서드들은 간략화...
  private async getLocationCoordinates(locationName: string) {
    return { lat: 37.5665, lng: 126.9780 }; // 임시 서울 좌표
  }

  private estimateVisitDuration(scale: VenueScale, pointCount: number): number {
    const baseMinutes = { world_heritage: 180, national_museum: 120, major_attraction: 90, regional_site: 60, local_attraction: 45 };
    return baseMinutes[scale] || 60;
  }

  private async determineOptimalStartingPoint(locationData: LocationData) {
    return {
      type: 'main_entrance' as const,
      coordinates: locationData.coordinates,
      description: `${locationData.name} 정문 입구`
    };
  }

  private async generateHistoricalBackground(locationData: LocationData): string {
    return `${locationData.name}의 역사적 배경과 중요성을 소개합니다.`;
  }

  private async generateCulturalContext(locationData: LocationData): string {
    return `${locationData.name}의 문화적 맥락과 의미를 설명합니다.`;
  }

  private async generateVisitingTips(locationData: LocationData): string {
    return `${locationData.name} 관람을 위한 실용적인 팁들을 제공합니다.`;
  }

  private async generateExpectationSetting(locationData: LocationData): string {
    return `${locationData.name}에서 무엇을 볼 수 있는지 미리 안내합니다.`;
  }

  private generateHighlightsPreview(locationData: LocationData): string[] {
    return locationData.tier1Points.map(point => point.name);
  }

  private generateNextChapterHint(locationData: LocationData): string {
    const firstPoint = locationData.tier1Points[0] || locationData.tier2Points[0];
    return firstPoint ? `${firstPoint.name}으로 이동하여 본격적인 관람을 시작하세요.` : '첫 번째 관람 지점으로 이동하세요.';
  }

  private calculateTotalDuration(intro: IntroChapter, main: MainChapter[]): number {
    return intro.content.timeEstimate + main.reduce((sum, chapter) => 
      sum + (chapter.audioInfo?.duration || 120) / 60, 0); // 초를 분으로 변환
  }

  private assessDifficulty(locationData: LocationData): 'easy' | 'moderate' | 'challenging' {
    const avgAccessibility = [...locationData.tier1Points, ...locationData.tier2Points]
      .reduce((sum, point) => sum + point.scores.accessibilityScore, 0) / 
      (locationData.tier1Points.length + locationData.tier2Points.length);
    
    if (avgAccessibility >= 8) return 'easy';
    if (avgAccessibility >= 6) return 'moderate';
    return 'challenging';
  }

  private getBestVisitingTime(locationData: LocationData): string {
    // 장소 타입에 따른 추천 시간
    if (locationData.venueType === 'outdoor') return '오전 10시-오후 4시 (날씨가 좋은 날)';
    return '오전 10시-오후 5시 (개관 시간 확인 필요)';
  }

  private async validateChapters(
    chapters: EnhancedChapterStructure,
    locationData: LocationData
  ): Promise<ValidationResult> {
    // 간단한 검증 로직
    const mustSeeIncluded = locationData.tier1Points.every(point =>
      chapters.mainChapters.some(chapter => chapter.viewingPoint.id === point.id)
    );

    return {
      isValid: mustSeeIncluded,
      score: mustSeeIncluded ? 0.9 : 0.6,
      detailedChecks: {
        mustSeeInclusion: mustSeeIncluded,
        socialMediaCoverage: true,
        educationalBalance: true,
        accessibilityOptimization: true,
        timeAllocationBalance: true,
        personalizationRelevance: true
      },
      improvementSuggestions: [],
      missingElements: mustSeeIncluded ? [] : ['일부 필수 관람 포인트 누락']
    };
  }

  private async improveChapters(
    chapters: MainChapter[],
    validation: ValidationResult
  ): Promise<MainChapter[]> {
    // 개선 로직 (현재는 기존 챕터 반환)
    return chapters;
  }

  private determinePriority(tier: ViewingPoint['tier']): MainChapter['priority'] {
    switch (tier) {
      case 'tier1_worldFamous': return 'must_see';
      case 'tier2_nationalTreasure': return 'highly_recommended';  
      case 'tier3_crowdFavorite': return 'optional';
    }
  }

  private async generateNarrative(point: ViewingPoint, userProfile?: UserProfile): string {
    return `${point.name}에 대한 음성 가이드 내러티브입니다. ${point.content.detailedDescription}`;
  }

  private async extractKeyHighlights(point: ViewingPoint): Promise<string[]> {
    return [
      `${point.name}의 주요 특징`,
      '역사적 중요성',
      '감상 포인트'
    ];
  }

  private async generateNavigation(from: ViewingPoint, to: ViewingPoint, venueType: VenueType) {
    return {
      direction: `${from.name}에서 ${to.name}으로 이동`,
      distance: this.calculateDistance(from.coordinates, to.coordinates),
      estimatedTime: this.calculateWalkTime(from.coordinates, to.coordinates),
      landmarks: to.location.visualLandmarks,
      accessibility: {
        wheelchairAccessible: to.scores.accessibilityScore > 7,
        stairsRequired: false
      }
    };
  }

  private async generateFromIntroNavigation(point: ViewingPoint, locationData: LocationData) {
    return {
      direction: `입구에서 ${point.name}으로 이동`,
      distance: 100, // 임시값
      estimatedTime: 2,
      landmarks: point.location.visualLandmarks,
      accessibility: {
        wheelchairAccessible: true,
        stairsRequired: false
      }
    };
  }

  private calculateDistance(coord1: {lat: number, lng: number}, coord2: {lat: number, lng: number}): number {
    // 간단한 거리 계산 (실제로는 Haversine 공식 사용)
    const latDiff = coord2.lat - coord1.lat;
    const lngDiff = coord2.lng - coord1.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // 대략적인 미터 변환
  }

  private calculateWalkTime(coord1: {lat: number, lng: number}, coord2: {lat: number, lng: number}): number {
    const distance = this.calculateDistance(coord1, coord2);
    return Math.ceil(distance / 80); // 분당 80m 보행 속도 가정
  }

  private checkStairsRequired(point: ViewingPoint): boolean {
    return point.scores.accessibilityScore < 7; // 접근성 점수가 낮으면 계단 있을 가능성
  }

  private async generateAccessibilityNotes(point: ViewingPoint): Promise<string> {
    if (point.scores.accessibilityScore >= 8) {
      return '휠체어 접근 가능, 장애인 편의시설 완비';
    } else if (point.scores.accessibilityScore >= 6) {
      return '일부 구간 계단 있음, 우회로 이용 가능';
    } else {
      return '계단 및 경사로 있음, 이동에 주의 필요';
    }
  }

  private estimateAudioDuration(point: ViewingPoint): number {
    // 내용 길이와 중요도에 따른 음성 가이드 시간 추정
    const baseTime = 60; // 기본 1분
    const importanceMultiplier = point.tier === 'tier1_worldFamous' ? 2.0 : 
                                point.tier === 'tier2_nationalTreasure' ? 1.5 : 1.0;
    return Math.ceil(baseTime * importanceMultiplier);
  }

  private getFlowPriority(name: string, flowPriority: Record<string, number>): number {
    for (const [keyword, priority] of Object.entries(flowPriority)) {
      if (name.includes(keyword)) {
        return priority;
      }
    }
    return 99; // 기본값 (가장 낮은 우선순위)
  }
}
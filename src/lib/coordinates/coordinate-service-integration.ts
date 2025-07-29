/**
 * Coordinate Service Integration
 * 새로운 좌표 시스템을 기존 가이드 페이지에 완전 통합
 */

import { MultiSourceValidator, type ValidationResult } from './multi-source-validator';
import { QualityManager, type QualityReport } from './quality-manager';
import { AnalyticsDashboard, type AnalyticsData } from './analytics-dashboard';
import { GlobalCoordinator } from './global-coordinator';
import type { GuideChapter } from '@/types/guide';

export interface EnhancedCoordinateResult {
  // 기본 좌표 정보
  coordinates: { lat: number; lng: number };
  accuracy: number;
  confidence: number;
  
  // 품질 정보
  qualityScore: number;
  qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
  verificationStatus: 'verified' | 'estimated' | 'needs_review';
  
  // 소스 정보
  sourceCount: number;
  primarySource: string;
  alternativeSources: string[];
  
  // 메타데이터
  lastUpdated: Date;
  dataFreshness: number; // days
  region: string;
  
  // 사용자 피드백
  userRating?: number;
  reportedIssues?: CoordinateIssue[];
  
  // 성능 지표
  responseTime: number;
  cacheHit: boolean;
}

export interface CoordinateIssue {
  type: 'accuracy' | 'missing' | 'outdated' | 'incorrect';
  description: string;
  reportedBy: string;
  reportedAt: Date;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
}

export interface ChapterCoordinateMapping {
  chapterId: number;
  chapterTitle: string;
  coordinateResult: EnhancedCoordinateResult;
  mappingMethod: 'direct' | 'keyword' | 'ai_extracted' | 'inferred';
  mappingConfidence: number;
  fallbackUsed: boolean;
}

export interface GuideCoordinatePackage {
  locationName: string;
  mapCenter: { lat: number; lng: number };
  zoom: number;
  chapters: ChapterCoordinateMapping[];
  qualityOverview: GuideQualityOverview;
  recommendations: string[];
  analyticsEnabled: boolean;
}

export interface GuideQualityOverview {
  overallScore: number;
  accurateChapters: number;
  estimatedChapters: number;
  needsReviewChapters: number;
  averageAccuracy: number;
  dataFreshness: number;
  lastQualityCheck: Date;
}

/**
 * 통합 좌표 서비스 - 기존 시스템과 새 시스템을 연결
 */
export class CoordinateServiceIntegration {
  private cache = new Map<string, GuideCoordinatePackage>();
  private performanceMetrics = new PerformanceTracker();
  
  // Phase 1-4 시스템 인스턴스
  private multiSourceValidator = new MultiSourceValidator();
  private qualityManager = new QualityManager();
  private analyticsDashboard = new AnalyticsDashboard();
  private globalCoordinator = new GlobalCoordinator();

  /**
   * 가이드 페이지용 완전 통합 좌표 패키지 생성
   */
  async generateGuideCoordinatePackage(
    locationName: string,
    chapters: GuideChapter[],
    options: {
      enableAnalytics?: boolean;
      enableCaching?: boolean;
      qualityThreshold?: number;
      region?: string;
      language?: string;
    } = {}
  ): Promise<GuideCoordinatePackage> {
    const startTime = Date.now();
    console.log(`📦 Generating coordinate package for: ${locationName} (${chapters.length} chapters)`);

    try {
      // Step 1: 메인 위치 검증 (글로벌 시스템 사용)
      const mainLocationResult = await this.validateMainLocation(locationName, options);
      
      // Step 2: 챕터별 좌표 매핑 (향상된 시스템 사용)
      const chapterMappings = await this.mapChapterCoordinates(chapters, locationName, options);
      
      // Step 3: 품질 전반 평가
      const qualityOverview = await this.assessOverallQuality(mainLocationResult, chapterMappings);
      
      // Step 4: 최적 지도 설정 계산
      const mapSettings = this.calculateOptimalMapSettings(mainLocationResult, chapterMappings);
      
      // Step 5: 권장사항 생성
      const recommendations = await this.generateRecommendations(qualityOverview, chapterMappings);

      // Step 6: 패키지 구성
      const coordinatePackage: GuideCoordinatePackage = {
        locationName,
        mapCenter: mapSettings.center,
        zoom: mapSettings.zoom,
        chapters: chapterMappings,
        qualityOverview,
        recommendations,
        analyticsEnabled: options.enableAnalytics || false
      };

      // Step 7: 성능 추적
      const processingTime = Date.now() - startTime;
      await this.performanceMetrics.record(locationName, processingTime, chapterMappings.length);

      // Step 8: 캐싱 (옵션)
      if (options.enableCaching !== false) {
        this.cache.set(locationName, coordinatePackage);
      }

      console.log(`✅ Coordinate package generated in ${processingTime}ms`);
      return coordinatePackage;

    } catch (error) {
      console.error(`❌ Failed to generate coordinate package for ${locationName}:`, error);
      throw error;
    }
  }

  /**
   * 메인 위치 검증 (글로벌 시스템 활용)
   */
  private async validateMainLocation(
    locationName: string,
    options: any
  ): Promise<ValidationResult> {
    console.log(`🔍 Phase 1: Multi-Source validation for ${locationName}`);
    
    // Phase 1: Multi-Source Validator 사용
    const validationResult = await this.multiSourceValidator.validateLocation(
      locationName, 
      options.region || 'korea',
      {
        requireMinSources: 2,
        enableCaching: true
      }
    );

    console.log(`✅ Validation complete: ${validationResult.consensus} quality (${validationResult.qualityScore.toFixed(3)})`);
    return validationResult;
  }

  /**
   * 챕터별 좌표 매핑 (향상된 시스템 활용)
   */
  private async mapChapterCoordinates(
    chapters: GuideChapter[],
    locationName: string,
    options: any
  ): Promise<ChapterCoordinateMapping[]> {
    const { smartChapterMapper } = await import('./smart-chapter-mapper');
    
    // 스마트 매핑 수행
    const mappingResult = await smartChapterMapper.mapChaptersToCoordinates(chapters, {
      baseLocation: locationName,
      radiusKm: 2,
      enableValidation: true,
      qualityThreshold: options.qualityThreshold || 0.5,
      distributionStrategy: 'smart'
    });

    // 챕터별 개별 검증 및 매핑 정보 생성
    const mappings: ChapterCoordinateMapping[] = [];

    for (const chapterCoord of mappingResult.chapterCoordinates) {
      // 개별 품질 평가
      const { qualityManager } = await import('./quality-manager');
      const qualityReport = await qualityManager.monitorQuality(
        `${locationName}-chapter-${chapterCoord.chapterId}`,
        chapterCoord.title
      );

      // Enhanced result 생성
      const enhancedResult = this.convertToEnhancedResult(
        {
          coordinates: chapterCoord.coordinates,
          qualityScore: chapterCoord.accuracy,
          approved: chapterCoord.validationStatus === 'verified',
          sourceCount: chapterCoord.sources.length,
          sources: chapterCoord.sources.map(s => ({ source: s } as any))
        } as ValidationResult,
        qualityReport,
        'chapter'
      );

      mappings.push({
        chapterId: chapterCoord.chapterId,
        chapterTitle: chapterCoord.title,
        coordinateResult: enhancedResult,
        mappingMethod: this.determineMappingMethod(chapterCoord.extractionMethod),
        mappingConfidence: chapterCoord.confidence,
        fallbackUsed: chapterCoord.extractionMethod === 'inferred'
      });
    }

    return mappings;
  }

  /**
   * ValidationResult를 EnhancedCoordinateResult로 변환
   */
  private convertToEnhancedResult(
    validation: ValidationResult,
    qualityReport: QualityReport,
    type: 'main_location' | 'chapter'
  ): EnhancedCoordinateResult {
    const qualityLevel = this.determineQualityLevel(validation.qualityScore);
    const verificationStatus = this.determineVerificationStatus(validation.approved, validation.qualityScore);

    return {
      coordinates: validation.coordinates,
      accuracy: qualityReport.currentQuality.accuracy,
      confidence: validation.qualityScore,
      qualityScore: validation.qualityScore,
      qualityLevel,
      verificationStatus,
      sourceCount: validation.sourceCount,
      primarySource: validation.sources[0]?.source || 'unknown',
      alternativeSources: validation.sources.slice(1).map(s => s.source),
      lastUpdated: new Date(),
      dataFreshness: qualityReport.currentQuality.freshness,
      region: 'KR', // 기본값
      responseTime: 0, // 실제 구현시 측정
      cacheHit: false // 실제 구현시 설정
    };
  }


  /**
   * 최적 지도 설정 계산
   */
  private calculateOptimalMapSettings(
    mainLocation: ValidationResult,
    chapterMappings: ChapterCoordinateMapping[]
  ): { center: { lat: number; lng: number }; zoom: number } {
    // 모든 좌표 수집
    const allCoordinates = [
      mainLocation.coordinates,
      ...chapterMappings.map(m => m.coordinateResult.coordinates)
    ];

    if (allCoordinates.length === 1) {
      return {
        center: allCoordinates[0],
        zoom: 16
      };
    }

    // 바운딩 박스 계산
    const lats = allCoordinates.map(c => c.lat);
    const lngs = allCoordinates.map(c => c.lng);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    // 범위에 따른 줌 레벨 결정
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    let zoom = 16;
    if (maxRange > 0.02) zoom = 13;
    else if (maxRange > 0.01) zoom = 14;
    else if (maxRange > 0.005) zoom = 15;
    else if (maxRange > 0.002) zoom = 16;
    else zoom = 17;

    return {
      center: { lat: centerLat, lng: centerLng },
      zoom
    };
  }

  /**
   * 권장사항 생성
   */
  private async generateRecommendations(
    qualityOverview: GuideQualityOverview,
    chapterMappings: ChapterCoordinateMapping[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // 전반적인 품질 기반 권장사항
    if (qualityOverview.overallScore < 0.7) {
      recommendations.push('전반적인 좌표 품질이 낮습니다. 수동 검증을 권장합니다.');
    }

    // 정확도 기반 권장사항
    if (qualityOverview.averageAccuracy > 50) {
      recommendations.push('일부 좌표의 정확도가 낮습니다. 공식 소스에서 재확인하세요.');
    }

    // 신선도 기반 권장사항
    if (qualityOverview.dataFreshness > 90) {
      recommendations.push('데이터가 오래되었습니다. 최신 정보로 업데이트하세요.');
    }

    // 챕터별 문제 기반 권장사항
    const needsReviewCount = qualityOverview.needsReviewChapters;
    if (needsReviewCount > 0) {
      recommendations.push(`${needsReviewCount}개 챕터의 좌표를 검토해야 합니다.`);
    }

    const fallbackCount = chapterMappings.filter(m => m.fallbackUsed).length;
    if (fallbackCount > chapterMappings.length * 0.3) {
      recommendations.push('많은 챗터가 추론 기반 좌표를 사용합니다. 정확한 위치 정보를 추가하세요.');
    }

    return recommendations;
  }

  /**
   * 기존 MapWithRoute 컴포넌트용 데이터 변환
   */
  convertToMapWithRouteProps(coordinatePackage: GuideCoordinatePackage): {
    chapters: Array<{
      id: number;
      title: string;
      lat: number;
      lng: number;
      accuracy?: number;
      confidence?: number;
      qualityLevel?: string;
    }>;
    center: { lat: number; lng: number };
    zoom: number;
    qualityInfo: GuideQualityOverview;
  } {
    const chapters = coordinatePackage.chapters.map(mapping => ({
      id: mapping.chapterId,
      title: mapping.chapterTitle,
      lat: mapping.coordinateResult.coordinates.lat,
      lng: mapping.coordinateResult.coordinates.lng,
      accuracy: mapping.coordinateResult.accuracy,
      confidence: mapping.coordinateResult.confidence,
      qualityLevel: mapping.coordinateResult.qualityLevel
    }));

    return {
      chapters,
      center: coordinatePackage.mapCenter,
      zoom: coordinatePackage.zoom,
      qualityInfo: coordinatePackage.qualityOverview
    };
  }


  /**
   * 사용자 피드백 수집
   */
  async submitCoordinateFeedback(
    locationName: string,
    chapterId: number,
    feedback: {
      rating: number; // 1-5
      issue?: CoordinateIssue;
      comment?: string;
    }
  ): Promise<void> {
    console.log(`💬 Feedback received for ${locationName}, chapter ${chapterId}:`, feedback);
    
    // 실제 구현시 피드백 데이터베이스 저장
    // 품질 관리 시스템에 피드백 전달
    
    // 임계값 이하의 평점이면 자동 검토 트리거
    if (feedback.rating <= 2) {
      console.log(`⚠️ Low rating detected, triggering automatic review`);
      // 자동 재검증 수행
    }
  }

  /**
   * 유틸리티 메서드들
   */
  private determineQualityLevel(score: number): EnhancedCoordinateResult['qualityLevel'] {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'fair';
    return 'poor';
  }

  private determineVerificationStatus(approved: boolean, score: number): EnhancedCoordinateResult['verificationStatus'] {
    if (approved && score >= 0.8) return 'verified';
    if (score >= 0.5) return 'estimated';
    return 'needs_review';
  }

  private determineMappingMethod(extractionMethod: string): ChapterCoordinateMapping['mappingMethod'] {
    switch (extractionMethod) {
      case 'existing': return 'direct';
      case 'ai_extracted': return 'ai_extracted';
      case 'geocoded': return 'keyword';
      case 'inferred': return 'inferred';
      default: return 'inferred';
    }
  }


  /**
   * Phase 2-3을 사용한 전반적 품질 평가
   */
  private async assessOverallQuality(
    mainLocation: ValidationResult,
    chapterMappings: ChapterCoordinateMapping[]
  ): Promise<GuideQualityOverview> {
    console.log(`📊 Phase 2-3: Quality assessment and analytics`);

    // Phase 2: Quality Manager 사용
    const qualityReport = await this.qualityManager.monitorQuality(
      `main-location`,
      mainLocation.coordinates.lat + ',' + mainLocation.coordinates.lng
    );

    // 챕터별 품질 평가
    let totalQualityScore = mainLocation.qualityScore;
    let accurateChapters = mainLocation.approved ? 1 : 0;
    let estimatedChapters = 0;
    let needsReviewChapters = 0;

    for (const mapping of chapterMappings) {
      if (mapping.coordinateResult.verificationStatus === 'verified') {
        accurateChapters++;
      } else if (mapping.coordinateResult.verificationStatus === 'estimated') {
        estimatedChapters++;
      } else {
        needsReviewChapters++;
      }
      totalQualityScore += mapping.coordinateResult.qualityScore;
    }

    const overallScore = totalQualityScore / (chapterMappings.length + 1);

    return {
      overallScore,
      accurateChapters,
      estimatedChapters,
      needsReviewChapters,
      averageAccuracy: qualityReport.metrics.accuracy,
      dataFreshness: qualityReport.metrics.freshness,
      lastUpdated: new Date()
    };
  }


  /**
   * 실시간 모니터링 활성화
   */
  async enableRealTimeMonitoring(locationName: string): Promise<void> {
    console.log(`🔄 Enabling real-time monitoring for ${locationName}`);
    
    // Phase 2: Quality Manager의 실시간 모니터링
    await this.qualityManager.monitorQuality(`realtime-${locationName}`, locationName);
    
    // Phase 4: Global Coordinator의 자동 스케일링
    await this.globalCoordinator.autoScale();
    
    console.log(`✅ Real-time monitoring activated for ${locationName}`);
  }
}

/**
 * 성능 추적 시스템
 */
class PerformanceTracker {
  private metrics: Array<{
    locationName: string;
    processingTime: number;
    chapterCount: number;
    timestamp: Date;
  }> = [];

  async record(locationName: string, processingTime: number, chapterCount: number): Promise<void> {
    this.metrics.push({
      locationName,
      processingTime,
      chapterCount,
      timestamp: new Date()
    });

    // 최근 100개 항목만 유지
    if (this.metrics.length > 100) {
      this.metrics.splice(0, this.metrics.length - 100);
    }

    // 성능 임계값 체크
    if (processingTime > 2000) { // 2초 이상
      console.warn(`⚠️ Performance issue: ${locationName} took ${processingTime}ms`);
    }
  }

  getAverageProcessingTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.processingTime, 0);
    return total / this.metrics.length;
  }

  getPerformanceReport(): any {
    return {
      totalRequests: this.metrics.length,
      averageProcessingTime: this.getAverageProcessingTime(),
      slowestRequest: Math.max(...this.metrics.map(m => m.processingTime)),
      fastestRequest: Math.min(...this.metrics.map(m => m.processingTime))
    };
  }
}

// 싱글톤 인스턴스
export const coordinateServiceIntegration = new CoordinateServiceIntegration();
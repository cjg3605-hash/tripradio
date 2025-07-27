/**
 * Smart Chapter Mapper Service
 * AI 생성 가이드와 실제 위치를 매핑하는 통합 서비스
 */

import type { GuideChapter } from '@/types/guide';
import { chapterCoordinateExtractor, type ChapterCoordinate, type ChapterLocationContext } from './chapter-coordinate-extractor';
import { chapterCoordinateValidator, type ValidationReport } from './chapter-coordinate-validator';
import { getLocationCoordinates, TOUR_LOCATIONS } from '@/data/locations';

export interface SmartMappingOptions {
  baseLocation: string;
  radiusKm?: number;
  enableValidation?: boolean;
  fallbackToPois?: boolean;
  distributionStrategy?: 'sequential' | 'clustered' | 'smart';
  qualityThreshold?: number; // 0.0-1.0
}

export interface MappingResult {
  chapterCoordinates: ChapterCoordinate[];
  validationReport?: ValidationReport;
  mapCenter: { lat: number; lng: number };
  recommendedZoom: number;
  qualityScore: number;
  suggestions: string[];
  processingTime: number;
}

export interface ChapterMarkerData {
  id: number;
  title: string;
  coordinates: { lat: number; lng: number };
  accuracy: number;
  confidence: number;
  markerType: 'verified' | 'estimated' | 'inferred' | 'failed';
  tooltip: string;
  validationStatus: 'verified' | 'estimated' | 'failed';
  sources: string[];
}

/**
 * 스마트 챕터 매퍼 - AI 가이드를 실제 지도에 매핑
 */
export class SmartChapterMapper {
  private cache = new Map<string, MappingResult>();
  private cacheExpiry = 30 * 60 * 1000; // 30분

  /**
   * 메인 매핑 함수: AI 생성 챕터를 실제 좌표로 변환
   */
  async mapChaptersToCoordinates(
    chapters: GuideChapter[],
    options: SmartMappingOptions
  ): Promise<MappingResult> {
    const startTime = Date.now();
    console.log(`🗺️ Starting smart mapping for ${chapters.length} chapters at ${options.baseLocation}`);

    // 캐시 확인
    const cacheKey = this.generateCacheKey(chapters, options);
    if (this.cache.has(cacheKey)) {
      console.log('📦 Returning cached mapping result');
      return this.cache.get(cacheKey)!;
    }

    try {
      // Step 1: 기본 위치 정보 설정
      const context = await this.buildLocationContext(options.baseLocation, options.radiusKm);
      
      // Step 2: 챕터별 좌표 추출
      const chapterCoordinates = await chapterCoordinateExtractor.extractChapterCoordinates(
        chapters,
        context
      );

      // Step 3: 좌표 품질 검증 (옵션)
      let validationReport: ValidationReport | undefined;
      if (options.enableValidation !== false) {
        validationReport = await chapterCoordinateValidator.validateChapterCoordinates(
          chapterCoordinates,
          context
        );
        console.log(`📊 Validation completed: ${validationReport.overallScore.toFixed(2)} score`);
      }

      // Step 4: 품질 기반 후처리
      const processedCoordinates = await this.postProcessCoordinates(
        chapterCoordinates,
        context,
        options
      );

      // Step 5: 지도 설정 최적화
      const mapSettings = this.optimizeMapSettings(processedCoordinates, context);

      // Step 6: 결과 구성
      const result: MappingResult = {
        chapterCoordinates: processedCoordinates,
        validationReport,
        mapCenter: mapSettings.center,
        recommendedZoom: mapSettings.zoom,
        qualityScore: this.calculateQualityScore(processedCoordinates, validationReport),
        suggestions: this.generateSuggestions(processedCoordinates, validationReport),
        processingTime: Date.now() - startTime
      };

      // 캐시 저장
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheExpiry);

      console.log(`✅ Mapping completed in ${result.processingTime}ms with ${result.qualityScore.toFixed(2)} quality score`);
      return result;

    } catch (error) {
      console.error('❌ Smart mapping failed:', error);
      throw new Error(`Chapter mapping failed: ${error}`);
    }
  }

  /**
   * 챕터 좌표를 지도 마커 데이터로 변환
   */
  convertToMarkerData(coordinates: ChapterCoordinate[]): ChapterMarkerData[] {
    return coordinates.map(coord => ({
      id: coord.chapterId,
      title: coord.title,
      coordinates: coord.coordinates,
      accuracy: coord.accuracy,
      confidence: coord.confidence,
      markerType: this.determineMarkerType(coord),
      tooltip: this.generateTooltip(coord),
      validationStatus: coord.validationStatus,
      sources: coord.sources
    }));
  }

  /**
   * 위치 컨텍스트 구축
   */
  private async buildLocationContext(
    baseLocation: string,
    radiusKm: number = 2
  ): Promise<ChapterLocationContext> {
    // 정적 데이터에서 기본 위치 정보 가져오기
    const staticLocation = getLocationCoordinates(baseLocation);
    
    let parentCoordinates: { lat: number; lng: number };
    let knownPois: Array<{ name: string; lat: number; lng: number; type: string }> = [];

    if (staticLocation) {
      parentCoordinates = staticLocation.center;
      knownPois = staticLocation.pois?.map(poi => ({
        name: poi.name,
        lat: poi.lat,
        lng: poi.lng,
        type: 'historical_site'
      })) || [];
    } else {
      // Enhanced geocoding으로 위치 찾기
      const { enhancedLocationService } = await import('@/lib/location/enhanced-location-utils');
      const dynamicLocation = await enhancedLocationService.findLocation(baseLocation);
      parentCoordinates = {
        lat: dynamicLocation.center.lat,
        lng: dynamicLocation.center.lng
      };
    }

    return {
      baseLocation,
      parentCoordinates,
      radiusKm,
      knownPois
    };
  }

  /**
   * 좌표 후처리 및 최적화
   */
  private async postProcessCoordinates(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext,
    options: SmartMappingOptions
  ): Promise<ChapterCoordinate[]> {
    const qualityThreshold = options.qualityThreshold || 0.5;
    
    // 저품질 좌표 개선
    const improvedCoordinates: ChapterCoordinate[] = [];
    
    for (const coord of coordinates) {
      if (coord.accuracy < qualityThreshold) {
        console.log(`🔧 Improving low-quality coordinate for chapter ${coord.chapterId}`);
        
        // 개선 시도
        const improved = await this.improveCoordinate(coord, context, options);
        improvedCoordinates.push(improved);
      } else {
        improvedCoordinates.push(coord);
      }
    }

    // 분산 전략 적용
    return this.applyDistributionStrategy(improvedCoordinates, context, options);
  }

  /**
   * 저품질 좌표 개선
   */
  private async improveCoordinate(
    coord: ChapterCoordinate,
    context: ChapterLocationContext,
    options: SmartMappingOptions
  ): Promise<ChapterCoordinate> {
    try {
      // POI 매칭 재시도
      if (options.fallbackToPois !== false) {
        const betterPoi = this.findBetterPoiMatch(coord.title, context.knownPois);
        if (betterPoi) {
          return {
            ...coord,
            coordinates: { lat: betterPoi.lat, lng: betterPoi.lng },
            accuracy: 0.8,
            confidence: 0.7,
            sources: ['improved_poi_matching'],
            extractionMethod: 'inferred',
            validationStatus: 'estimated'
          };
        }
      }

      // 범위 내 재배치
      const improvedPosition = this.generateBetterPosition(coord, context);
      return {
        ...coord,
        coordinates: improvedPosition,
        accuracy: Math.min(coord.accuracy + 0.2, 0.9),
        sources: [...coord.sources, 'position_optimization'],
        extractionMethod: 'inferred'
      };
    } catch (error) {
      console.warn(`Failed to improve coordinate for chapter ${coord.chapterId}:`, error);
      return coord;
    }
  }

  /**
   * 개선된 POI 매칭
   */
  private findBetterPoiMatch(
    title: string,
    pois: Array<{ name: string; lat: number; lng: number; type: string }>
  ): { lat: number; lng: number } | null {
    const normalizedTitle = title.toLowerCase()
      .replace(/[0-9]+\.?\s*/, '') // 숫자 제거
      .replace(/[^\w가-힣]/g, ''); // 특수문자 제거

    // 더 관대한 매칭
    for (const poi of pois) {
      const normalizedPoi = poi.name.toLowerCase().replace(/[^\w가-힣]/g, '');
      
      // 부분 매칭
      if (normalizedTitle.includes(normalizedPoi) || 
          normalizedPoi.includes(normalizedTitle) ||
          this.calculateStringSimilarity(normalizedTitle, normalizedPoi) > 0.6) {
        return { lat: poi.lat, lng: poi.lng };
      }
    }

    return null;
  }

  /**
   * 문자열 유사도 계산 (Levenshtein)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein 거리 계산
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 개선된 위치 생성
   */
  private generateBetterPosition(
    coord: ChapterCoordinate,
    context: ChapterLocationContext
  ): { lat: number; lng: number } {
    // 현재 위치가 중심에서 너무 멀면 가까이 이동
    const distance = this.calculateDistance(coord.coordinates, context.parentCoordinates);
    const maxDistance = context.radiusKm * 1000 * 0.8; // 80% 반경 내로

    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      const deltaLat = (coord.coordinates.lat - context.parentCoordinates.lat) * ratio;
      const deltaLng = (coord.coordinates.lng - context.parentCoordinates.lng) * ratio;

      return {
        lat: context.parentCoordinates.lat + deltaLat,
        lng: context.parentCoordinates.lng + deltaLng
      };
    }

    return coord.coordinates;
  }

  /**
   * 분산 전략 적용
   */
  private applyDistributionStrategy(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext,
    options: SmartMappingOptions
  ): ChapterCoordinate[] {
    const strategy = options.distributionStrategy || 'smart';

    switch (strategy) {
      case 'sequential':
        return this.applySequentialDistribution(coordinates, context);
      case 'clustered':
        return this.applyClusteredDistribution(coordinates, context);
      case 'smart':
      default:
        return this.applySmartDistribution(coordinates, context);
    }
  }

  /**
   * 순차적 분산
   */
  private applySequentialDistribution(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): ChapterCoordinate[] {
    const radius = 0.002; // 약 200m
    
    return coordinates.map((coord, index) => {
      const angle = (index * 360 / coordinates.length) * Math.PI / 180;
      const offsetLat = radius * Math.cos(angle);
      const offsetLng = radius * Math.sin(angle);

      return {
        ...coord,
        coordinates: {
          lat: context.parentCoordinates.lat + offsetLat,
          lng: context.parentCoordinates.lng + offsetLng
        }
      };
    });
  }

  /**
   * 클러스터 분산
   */
  private applyClusteredDistribution(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): ChapterCoordinate[] {
    const clusterSize = Math.ceil(coordinates.length / 3); // 3개 클러스터
    const clusterRadius = 0.001; // 100m
    
    return coordinates.map((coord, index) => {
      const clusterIndex = Math.floor(index / clusterSize);
      const positionInCluster = index % clusterSize;
      
      const clusterAngle = (clusterIndex * 120) * Math.PI / 180; // 120도씩
      const clusterCenterLat = context.parentCoordinates.lat + clusterRadius * Math.cos(clusterAngle);
      const clusterCenterLng = context.parentCoordinates.lng + clusterRadius * Math.sin(clusterAngle);
      
      const itemAngle = (positionInCluster * 360 / clusterSize) * Math.PI / 180;
      const itemRadius = clusterRadius * 0.3;
      
      return {
        ...coord,
        coordinates: {
          lat: clusterCenterLat + itemRadius * Math.cos(itemAngle),
          lng: clusterCenterLng + itemRadius * Math.sin(itemAngle)
        }
      };
    });
  }

  /**
   * 스마트 분산 (기존 좌표 존중 + 최적화)
   */
  private applySmartDistribution(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): ChapterCoordinate[] {
    // 고품질 좌표는 유지, 저품질만 재배치
    return coordinates.map(coord => {
      if (coord.accuracy > 0.7 && coord.validationStatus === 'verified') {
        return coord; // 고품질 좌표는 그대로 유지
      }
      
      // 저품질 좌표는 적절히 분산
      const angle = (coord.chapterId * 25) % 360 * Math.PI / 180;
      const distance = 0.0008 + (coord.chapterId % 3) * 0.0004; // 80m-200m
      
      return {
        ...coord,
        coordinates: {
          lat: context.parentCoordinates.lat + distance * Math.cos(angle),
          lng: context.parentCoordinates.lng + distance * Math.sin(angle)
        },
        extractionMethod: 'inferred'
      };
    });
  }

  /**
   * 지도 설정 최적화
   */
  private optimizeMapSettings(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): { center: { lat: number; lng: number }; zoom: number } {
    if (coordinates.length === 0) {
      return {
        center: context.parentCoordinates,
        zoom: 15
      };
    }

    // 모든 좌표를 포함하는 최적 중심점과 줌 계산
    const lats = coordinates.map(c => c.coordinates.lat);
    const lngs = coordinates.map(c => c.coordinates.lng);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    let zoom = 16;
    if (maxRange > 0.01) zoom = 14;
    else if (maxRange > 0.005) zoom = 15;
    else if (maxRange > 0.002) zoom = 16;
    else zoom = 17;

    return {
      center: { lat: centerLat, lng: centerLng },
      zoom
    };
  }

  /**
   * 품질 점수 계산
   */
  private calculateQualityScore(
    coordinates: ChapterCoordinate[],
    validationReport?: ValidationReport
  ): number {
    if (coordinates.length === 0) return 0;

    const averageAccuracy = coordinates.reduce((sum, c) => sum + c.accuracy, 0) / coordinates.length;
    const averageConfidence = coordinates.reduce((sum, c) => sum + c.confidence, 0) / coordinates.length;
    const verifiedRatio = coordinates.filter(c => c.validationStatus === 'verified').length / coordinates.length;
    
    const baseScore = (averageAccuracy * 0.4 + averageConfidence * 0.3 + verifiedRatio * 0.3);
    const validationBonus = validationReport ? Math.min(validationReport.overallScore * 0.2, 0.2) : 0;
    
    return Math.min(baseScore + validationBonus, 1.0);
  }

  /**
   * 개선 제안 생성
   */
  private generateSuggestions(
    coordinates: ChapterCoordinate[],
    validationReport?: ValidationReport
  ): string[] {
    const suggestions: string[] = [];
    
    const lowAccuracyCount = coordinates.filter(c => c.accuracy < 0.6).length;
    if (lowAccuracyCount > 0) {
      suggestions.push(`${lowAccuracyCount}개 챕터의 좌표 정확도 개선 필요`);
    }
    
    const lowConfidenceCount = coordinates.filter(c => c.confidence < 0.5).length;
    if (lowConfidenceCount > 0) {
      suggestions.push(`${lowConfidenceCount}개 챕터의 신뢰도 검증 필요`);
    }
    
    if (validationReport) {
      suggestions.push(...validationReport.recommendations);
    }
    
    return suggestions;
  }

  /**
   * 마커 타입 결정
   */
  private determineMarkerType(coord: ChapterCoordinate): 'verified' | 'estimated' | 'inferred' | 'failed' {
    if (coord.validationStatus === 'failed') return 'failed';
    if (coord.accuracy > 0.8 && coord.confidence > 0.7) return 'verified';
    if (coord.accuracy > 0.6 || coord.confidence > 0.5) return 'estimated';
    return 'inferred';
  }

  /**
   * 툴팁 생성
   */
  private generateTooltip(coord: ChapterCoordinate): string {
    const accuracy = Math.round(coord.accuracy * 100);
    const confidence = Math.round(coord.confidence * 100);
    return `${coord.title}\n정확도: ${accuracy}% | 신뢰도: ${confidence}%\n소스: ${coord.sources.join(', ')}`;
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(chapters: GuideChapter[], options: SmartMappingOptions): string {
    const chapterHash = chapters.map(c => `${c.id}-${c.title}`).join('|');
    const optionsHash = JSON.stringify(options);
    return `${chapterHash}-${optionsHash}`;
  }

  /**
   * 거리 계산
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371000;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// 싱글톤 인스턴스
export const smartChapterMapper = new SmartChapterMapper();
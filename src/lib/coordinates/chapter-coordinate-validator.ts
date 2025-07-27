/**
 * Chapter Coordinate Validation Pipeline
 * 챕터 좌표의 정확도 검증 및 품질 관리
 */

import type { ChapterCoordinate, ChapterLocationContext } from './chapter-coordinate-extractor';
import { enhancedGeocodingService } from '@/lib/location/enhanced-geocoding-service';

export interface ValidationRule {
  name: string;
  weight: number; // 0.0-1.0
  validate: (coord: ChapterCoordinate, context: ChapterLocationContext) => Promise<ValidationResult>;
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0.0-1.0
  issues: string[];
  suggestions: string[];
  confidence: number;
}

export interface ValidationReport {
  overallScore: number;
  totalIssues: number;
  validatedCount: number;
  failedCount: number;
  recommendations: string[];
  chapterResults: Map<number, ValidationResult>;
}

/**
 * 챕터 좌표 검증 파이프라인
 */
export class ChapterCoordinateValidator {
  private validationRules: ValidationRule[] = [
    {
      name: 'proximity_check',
      weight: 0.3,
      validate: this.validateProximity.bind(this)
    },
    {
      name: 'accuracy_threshold',
      weight: 0.25,
      validate: this.validateAccuracy.bind(this)
    },
    {
      name: 'confidence_level',
      weight: 0.2,
      validate: this.validateConfidence.bind(this)
    },
    {
      name: 'source_reliability',
      weight: 0.15,
      validate: this.validateSources.bind(this)
    },
    {
      name: 'coordinate_sanity',
      weight: 0.1,
      validate: this.validateCoordinateSanity.bind(this)
    }
  ];

  /**
   * 챕터 좌표 배열 전체 검증
   */
  async validateChapterCoordinates(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): Promise<ValidationReport> {
    console.log(`🔍 Starting validation for ${coordinates.length} chapter coordinates`);
    
    const chapterResults = new Map<number, ValidationResult>();
    let totalScore = 0;
    let validatedCount = 0;
    let failedCount = 0;
    let totalIssues = 0;
    
    // 개별 챕터 검증
    for (const coord of coordinates) {
      try {
        const result = await this.validateSingleChapter(coord, context);
        chapterResults.set(coord.chapterId, result);
        
        totalScore += result.score;
        validatedCount++;
        totalIssues += result.issues.length;
        
        if (!result.passed) {
          failedCount++;
        }
        
        console.log(`📊 Chapter ${coord.chapterId}: ${result.score.toFixed(2)} (${result.passed ? 'PASS' : 'FAIL'})`);
      } catch (error) {
        console.error(`❌ Validation failed for chapter ${coord.chapterId}:`, error);
        failedCount++;
      }
    }
    
    // 전체 검증 (상호 관계 분석)
    const overallAnalysis = await this.performOverallAnalysis(coordinates, context);
    
    const overallScore = validatedCount > 0 ? (totalScore / validatedCount) : 0;
    
    return {
      overallScore,
      totalIssues,
      validatedCount,
      failedCount,
      recommendations: this.generateRecommendations(chapterResults, overallAnalysis),
      chapterResults
    };
  }

  /**
   * 단일 챕터 좌표 검증
   */
  private async validateSingleChapter(
    coord: ChapterCoordinate,
    context: ChapterLocationContext
  ): Promise<ValidationResult> {
    const results: ValidationResult[] = [];
    
    // 모든 검증 규칙 실행
    for (const rule of this.validationRules) {
      try {
        const result = await rule.validate(coord, context);
        results.push(result);
      } catch (error) {
        console.warn(`Validation rule ${rule.name} failed:`, error);
        results.push({
          passed: false,
          score: 0,
          issues: [`Rule ${rule.name} execution failed`],
          suggestions: [],
          confidence: 0
        });
      }
    }
    
    // 가중 평균 계산
    const weightedScore = results.reduce((sum, result, index) => {
      return sum + (result.score * this.validationRules[index].weight);
    }, 0);
    
    const allIssues = results.flatMap(r => r.issues);
    const allSuggestions = results.flatMap(r => r.suggestions);
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    return {
      passed: weightedScore >= 0.6, // 60% 이상 통과
      score: weightedScore,
      issues: allIssues,
      suggestions: allSuggestions,
      confidence: averageConfidence
    };
  }

  /**
   * 근접성 검증 (컨텍스트 반경 내)
   */
  private async validateProximity(
    coord: ChapterCoordinate,
    context: ChapterLocationContext
  ): Promise<ValidationResult> {
    const distance = this.calculateDistance(coord.coordinates, context.parentCoordinates);
    const maxDistance = context.radiusKm * 1000; // km to meters
    
    const isWithinRadius = distance <= maxDistance;
    const score = isWithinRadius ? 1.0 : Math.max(0, 1 - (distance - maxDistance) / maxDistance);
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (!isWithinRadius) {
      issues.push(`Location ${distance.toFixed(0)}m from center (max: ${maxDistance.toFixed(0)}m)`);
      suggestions.push('Verify location name or adjust search radius');
    }
    
    return {
      passed: isWithinRadius,
      score,
      issues,
      suggestions,
      confidence: coord.confidence
    };
  }

  /**
   * 정확도 임계값 검증
   */
  private async validateAccuracy(
    coord: ChapterCoordinate,
    context: ChapterLocationContext
  ): Promise<ValidationResult> {
    const minAccuracy = 0.5; // 50% 최소 정확도
    const passed = coord.accuracy >= minAccuracy;
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (!passed) {
      issues.push(`Low accuracy: ${(coord.accuracy * 100).toFixed(0)}% (min: ${(minAccuracy * 100).toFixed(0)}%)`);
      suggestions.push('Consider manual coordinate verification');
    }
    
    return {
      passed,
      score: Math.min(coord.accuracy / minAccuracy, 1.0),
      issues,
      suggestions,
      confidence: coord.confidence
    };
  }

  /**
   * 신뢰도 수준 검증
   */
  private async validateConfidence(
    coord: ChapterCoordinate,
    context: ChapterLocationContext
  ): Promise<ValidationResult> {
    const minConfidence = 0.4; // 40% 최소 신뢰도
    const passed = coord.confidence >= minConfidence;
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (!passed) {
      issues.push(`Low confidence: ${(coord.confidence * 100).toFixed(0)}% (min: ${(minConfidence * 100).toFixed(0)}%)`);
      suggestions.push('Cross-reference with additional geocoding sources');
    }
    
    return {
      passed,
      score: Math.min(coord.confidence / minConfidence, 1.0),
      issues,
      suggestions,
      confidence: coord.confidence
    };
  }

  /**
   * 데이터 소스 신뢰도 검증
   */
  private async validateSources(
    coord: ChapterCoordinate,
    context: ChapterLocationContext
  ): Promise<ValidationResult> {
    const sourceReliability = {
      'google_maps': 1.0,
      'openstreetmap': 0.85,
      'nominatim': 0.8,
      'photon': 0.75,
      'existing_data': 0.9,
      'poi_matching': 0.7,
      'sequential_distribution': 0.3,
      'fallback': 0.1
    };
    
    const maxReliability = Math.max(...coord.sources.map(source => 
      sourceReliability[source as keyof typeof sourceReliability] || 0.5
    ));
    
    const multiSourceBonus = coord.sources.length > 1 ? 0.1 : 0;
    const finalScore = Math.min(maxReliability + multiSourceBonus, 1.0);
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (finalScore < 0.6) {
      issues.push(`Low source reliability: ${coord.sources.join(', ')}`);
      suggestions.push('Verify with high-confidence sources');
    }
    
    return {
      passed: finalScore >= 0.6,
      score: finalScore,
      issues,
      suggestions,
      confidence: coord.confidence
    };
  }

  /**
   * 좌표 유효성 검증 (상식적 범위)
   */
  private async validateCoordinateSanity(
    coord: ChapterCoordinate,
    context: ChapterLocationContext
  ): Promise<ValidationResult> {
    const { lat, lng } = coord.coordinates;
    
    // 한국 영역 대략적 범위
    const koreaLatRange = { min: 33.0, max: 38.6 };
    const koreaLngRange = { min: 124.5, max: 131.9 };
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // 기본 유효성 검사
    if (lat < -90 || lat > 90) {
      issues.push(`Invalid latitude: ${lat}`);
    }
    if (lng < -180 || lng > 180) {
      issues.push(`Invalid longitude: ${lng}`);
    }
    
    // 한국 영역 검사 (선택적)
    const isInKorea = lat >= koreaLatRange.min && lat <= koreaLatRange.max &&
                     lng >= koreaLngRange.min && lng <= koreaLngRange.max;
    
    if (!isInKorea) {
      issues.push(`Coordinates outside Korea region: ${lat}, ${lng}`);
      suggestions.push('Verify location is in Korea or adjust region settings');
    }
    
    // 소수점 정밀도 검사
    const latPrecision = this.getDecimalPlaces(lat);
    const lngPrecision = this.getDecimalPlaces(lng);
    
    if (latPrecision < 4 || lngPrecision < 4) {
      issues.push(`Low coordinate precision: ${latPrecision}, ${lngPrecision} decimal places`);
      suggestions.push('Use higher precision coordinates (≥4 decimal places)');
    }
    
    return {
      passed: issues.length === 0,
      score: issues.length === 0 ? 1.0 : Math.max(0, 1 - (issues.length * 0.3)),
      issues,
      suggestions,
      confidence: coord.confidence
    };
  }

  /**
   * 전체 분석 (챕터 간 관계)
   */
  private async performOverallAnalysis(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): Promise<{ duplicateCount: number; averageSpread: number; clusteringIssues: string[] }> {
    // 중복 좌표 검출
    const duplicateCount = this.detectDuplicateCoordinates(coordinates);
    
    // 평균 분산도 계산
    const averageSpread = this.calculateAverageSpread(coordinates, context);
    
    // 클러스터링 문제 검출
    const clusteringIssues = this.detectClusteringIssues(coordinates);
    
    return {
      duplicateCount,
      averageSpread,
      clusteringIssues
    };
  }

  /**
   * 중복 좌표 검출
   */
  private detectDuplicateCoordinates(coordinates: ChapterCoordinate[]): number {
    const threshold = 10; // 10m 이내는 중복으로 간주
    let duplicateCount = 0;
    
    for (let i = 0; i < coordinates.length; i++) {
      for (let j = i + 1; j < coordinates.length; j++) {
        const distance = this.calculateDistance(
          coordinates[i].coordinates,
          coordinates[j].coordinates
        );
        
        if (distance < threshold) {
          duplicateCount++;
        }
      }
    }
    
    return duplicateCount;
  }

  /**
   * 평균 분산도 계산
   */
  private calculateAverageSpread(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): number {
    if (coordinates.length === 0) return 0;
    
    const distances = coordinates.map(coord => 
      this.calculateDistance(coord.coordinates, context.parentCoordinates)
    );
    
    return distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
  }

  /**
   * 클러스터링 문제 검출
   */
  private detectClusteringIssues(coordinates: ChapterCoordinate[]): string[] {
    const issues: string[] = [];
    
    // 모든 좌표가 한 점에 집중된 경우
    const centerPoint = this.calculateCentroid(coordinates);
    const maxDistance = Math.max(...coordinates.map(coord =>
      this.calculateDistance(coord.coordinates, centerPoint)
    ));
    
    if (maxDistance < 50) { // 50m 이내에 모든 점이 있는 경우
      issues.push('All coordinates clustered within 50m - consider spreading');
    }
    
    // 선형 배치 검출
    if (this.isLinearArrangement(coordinates)) {
      issues.push('Coordinates arranged in straight line - may lack spatial variety');
    }
    
    return issues;
  }

  /**
   * 중심점 계산
   */
  private calculateCentroid(coordinates: ChapterCoordinate[]): { lat: number; lng: number } {
    const sumLat = coordinates.reduce((sum, coord) => sum + coord.coordinates.lat, 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord.coordinates.lng, 0);
    
    return {
      lat: sumLat / coordinates.length,
      lng: sumLng / coordinates.length
    };
  }

  /**
   * 선형 배치 검출
   */
  private isLinearArrangement(coordinates: ChapterCoordinate[]): boolean {
    if (coordinates.length < 3) return false;
    
    // 간단한 선형성 검사 (추후 개선 가능)
    const firstPoint = coordinates[0].coordinates;
    const lastPoint = coordinates[coordinates.length - 1].coordinates;
    
    let linearCount = 0;
    for (const coord of coordinates) {
      const distanceToLine = this.pointToLineDistance(
        coord.coordinates,
        firstPoint,
        lastPoint
      );
      
      if (distanceToLine < 20) { // 20m 이내면 선형으로 간주
        linearCount++;
      }
    }
    
    return linearCount >= coordinates.length * 0.8; // 80% 이상이 선형
  }

  /**
   * 점-직선 거리 계산
   */
  private pointToLineDistance(
    point: { lat: number; lng: number },
    lineStart: { lat: number; lng: number },
    lineEnd: { lat: number; lng: number }
  ): number {
    // 간소화된 거리 계산 (정확한 지구 곡률 고려 X)
    const A = lineEnd.lng - lineStart.lng;
    const B = lineStart.lat - lineEnd.lat;
    const C = lineEnd.lat * lineStart.lng - lineStart.lat * lineEnd.lng;
    
    const distance = Math.abs(A * point.lat + B * point.lng + C) / Math.sqrt(A * A + B * B);
    
    // 대략적인 meter 변환 (위도 1도 ≈ 111km)
    return distance * 111000;
  }

  /**
   * 추천사항 생성
   */
  private generateRecommendations(
    chapterResults: Map<number, ValidationResult>,
    overallAnalysis: { duplicateCount: number; averageSpread: number; clusteringIssues: string[] }
  ): string[] {
    const recommendations: string[] = [];
    
    // 실패한 챕터 분석
    const failedChapters = Array.from(chapterResults.entries())
      .filter(([_, result]) => !result.passed);
    
    if (failedChapters.length > 0) {
      recommendations.push(`Review ${failedChapters.length} failed chapters for coordinate accuracy`);
    }
    
    // 중복 좌표 문제
    if (overallAnalysis.duplicateCount > 0) {
      recommendations.push(`Resolve ${overallAnalysis.duplicateCount} duplicate coordinate pairs`);
    }
    
    // 클러스터링 문제
    overallAnalysis.clusteringIssues.forEach(issue => {
      recommendations.push(`Address clustering issue: ${issue}`);
    });
    
    // 전체 품질 수준 평가
    const averageScore = Array.from(chapterResults.values())
      .reduce((sum, result) => sum + result.score, 0) / chapterResults.size;
    
    if (averageScore < 0.7) {
      recommendations.push('Consider manual coordinate verification for critical chapters');
    }
    
    return recommendations;
  }

  /**
   * 유틸리티 메서드들
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

  private getDecimalPlaces(num: number): number {
    const str = num.toString();
    const decimalIndex = str.indexOf('.');
    return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
  }
}

// 싱글톤 인스턴스
export const chapterCoordinateValidator = new ChapterCoordinateValidator();
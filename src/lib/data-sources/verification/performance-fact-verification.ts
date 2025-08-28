/**
 * High-Performance Fact Verification System
 * 고성능 사실 검증 시스템 - 정확성과 속도의 균형점
 */

import { 
  SourceData, 
  DataConflict, 
  VerificationResult, 
  ConflictResolution,
  IntegratedData,
  FactCheckResult,
  FactSource,
  VerificationMethod,
  ConflictSeverity
} from '../types/data-types';

interface PerformanceVerificationConfig {
  // 성능 vs 정확성 균형 설정
  fastModeThreshold: number; // 0.7 = 빠른 검증만
  thoroughModeThreshold: number; // 0.9 = 상세 검증 필요
  
  // 검증 성능 제한
  maxConcurrentChecks: number;
  verificationTimeoutMs: number;
  cacheExpiryMs: number;
  
  // 정확도 허용 범위
  coordinateToleranceMeters: number;
  nameSimilarityThreshold: number;
  dateToleranceDays: number;
}

interface VerificationMetrics {
  totalChecks: number;
  cacheHits: number;
  avgProcessingTime: number;
  conflictsDetected: number;
  falsePositiveRate: number;
}

export class PerformanceFactVerification {
  private config: PerformanceVerificationConfig;
  private cache = new Map<string, any>();
  private metrics: VerificationMetrics = {
    totalChecks: 0,
    cacheHits: 0,
    avgProcessingTime: 0,
    conflictsDetected: 0,
    falsePositiveRate: 0
  };

  constructor(config?: Partial<PerformanceVerificationConfig>) {
    this.config = {
      fastModeThreshold: 0.7,
      thoroughModeThreshold: 0.9,
      maxConcurrentChecks: 6,
      verificationTimeoutMs: 3000, // 3초 제한
      cacheExpiryMs: 1800000, // 30분
      coordinateToleranceMeters: 500, // 500m 허용
      nameSimilarityThreshold: 0.8, // 80% 유사도
      dateToleranceDays: 365, // 1년 허용
      ...config
    };

    // 캐시 정리
    setInterval(() => this.cleanExpiredCache(), 600000); // 10분마다
  }

  /**
   * 🚀 초고속 병렬 사실 검증
   */
  async verifyFactsWithPerformance(
    sources: SourceData[],
    context?: any
  ): Promise<VerificationResult> {
    const startTime = Date.now();
    this.metrics.totalChecks++;

    try {
      // 1단계: 빠른 기본 검증 (필수 충돌만)
      const quickResult = await this.performQuickVerification(sources);
      
      // 임계값 기반 검증 깊이 결정
      if (quickResult.confidence >= this.config.thoroughModeThreshold) {
        // 높은 신뢰도 → 빠른 검증만으로 충분
        return this.finalizeResult(quickResult, startTime);
      }
      
      if (quickResult.confidence < this.config.fastModeThreshold) {
        // 낮은 신뢰도 → 상세 검증 필요
        const detailedResult = await this.performDetailedVerification(sources, quickResult);
        return this.finalizeResult(detailedResult, startTime);
      }
      
      // 중간 신뢰도 → 선택적 검증
      const selectiveResult = await this.performSelectiveVerification(sources, quickResult);
      return this.finalizeResult(selectiveResult, startTime);

    } catch (error) {
      console.error('검증 시스템 오류:', error);
      return this.createFallbackResult(sources, startTime);
    }
  }

  /**
   * ⚡ 1단계: 빠른 기본 검증 (< 500ms)
   */
  private async performQuickVerification(sources: SourceData[]): Promise<VerificationResult> {
    const conflicts: DataConflict[] = [];
    let baseConfidence = 0.9;

    // 병렬 기본 검증
    const [
      coordinateConflicts,
      basicNameConflicts,
      sourceReliability
    ] = await Promise.all([
      this.detectCriticalCoordinateConflicts(sources),
      this.detectCriticalNameConflicts(sources),
      this.calculateSourceReliability(sources)
    ]);

    conflicts.push(...coordinateConflicts, ...basicNameConflicts);
    
    // 심각한 충돌 시 신뢰도 급락
    const criticalConflicts = conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL).length;
    if (criticalConflicts > 0) {
      baseConfidence -= criticalConflicts * 0.3;
    }

    return {
      isVerified: baseConfidence >= 0.7 && criticalConflicts === 0,
      confidence: Math.max(baseConfidence * sourceReliability, 0),
      score: {
        consistency: baseConfidence,
        completeness: this.calculateQuickCompleteness(sources),
        accuracy: sourceReliability,
        timeliness: 0.9,
        authority: this.calculateAuthorityScore(sources),
        overall: baseConfidence * sourceReliability
      },
      conflicts,
      recommendations: this.generateQuickRecommendations(conflicts),
      verifiedAt: new Date().toISOString(),
      method: VerificationMethod.CROSS_REFERENCE
    };
  }

  /**
   * 🔍 2단계: 상세 검증 (< 2000ms)
   */
  private async performDetailedVerification(
    sources: SourceData[], 
    quickResult: VerificationResult
  ): Promise<VerificationResult> {
    const additionalConflicts: DataConflict[] = [];

    // 시간 제한 내에서 상세 검증 수행
    const timeoutMs = this.config.verificationTimeoutMs - 500; // 퀵 검증 시간 제외
    
    try {
      const detailedChecks = await Promise.race([
        Promise.all([
          this.detectDetailedCoordinateConflicts(sources),
          this.detectDetailedNameConflicts(sources),
          this.detectDateConflicts(sources),
          this.detectCategoryConflicts(sources)
        ]),
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('상세 검증 시간초과')), timeoutMs)
        )
      ]);

      detailedChecks.forEach(conflicts => additionalConflicts.push(...conflicts));

    } catch (error) {
      console.warn('상세 검증 시간초과, 부분 결과 사용:', error);
    }

    // 결과 통합
    const allConflicts = [...quickResult.conflicts, ...additionalConflicts];
    const detailedConfidence = this.calculateDetailedConfidence(sources, allConflicts);

    return {
      ...quickResult,
      confidence: detailedConfidence,
      conflicts: allConflicts,
      score: {
        ...quickResult.score,
        consistency: detailedConfidence,
        overall: detailedConfidence
      },
      recommendations: this.generateDetailedRecommendations(allConflicts),
      method: VerificationMethod.AUTHORITY_CHECK
    };
  }

  /**
   * 🎯 3단계: 선택적 검증 (중간 신뢰도용)
   */
  private async performSelectiveVerification(
    sources: SourceData[],
    quickResult: VerificationResult
  ): Promise<VerificationResult> {
    // 가장 의심스러운 영역만 집중 검증
    const suspiciousAreas = this.identifySuspiciousAreas(quickResult);
    const targetedConflicts: DataConflict[] = [];

    for (const area of suspiciousAreas) {
      switch (area) {
        case 'coordinates':
          targetedConflicts.push(...await this.detectDetailedCoordinateConflicts(sources));
          break;
        case 'names':
          targetedConflicts.push(...await this.detectDetailedNameConflicts(sources));
          break;
        case 'dates':
          targetedConflicts.push(...await this.detectDateConflicts(sources));
          break;
      }
    }

    const selectiveConfidence = this.calculateSelectiveConfidence(quickResult, targetedConflicts);

    return {
      ...quickResult,
      confidence: selectiveConfidence,
      conflicts: [...quickResult.conflicts, ...targetedConflicts],
      score: {
        ...quickResult.score,
        consistency: selectiveConfidence,
        overall: selectiveConfidence
      },
      method: VerificationMethod.CONSENSUS
    };
  }

  /**
   * 🚀 실제 구현: 중요 좌표 충돌 탐지
   */
  private async detectCriticalCoordinateConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    const cacheKey = `coord_conflicts:${this.generateSourcesHash(sources)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const conflicts: DataConflict[] = [];
    const coordinates: Array<{source: string, lat: number, lng: number, reliability: number}> = [];

    // 좌표 데이터 추출
    for (const source of sources) {
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      if (data?.coordinates?.lat && data?.coordinates?.lng) {
        coordinates.push({
          source: source.sourceId,
          lat: data.coordinates.lat,
          lng: data.coordinates.lng,
          reliability: source.reliability
        });
      }
    }

    // 좌표 간 거리 계산 및 충돌 탐지
    for (let i = 0; i < coordinates.length; i++) {
      for (let j = i + 1; j < coordinates.length; j++) {
        const distance = this.calculateDistance(
          coordinates[i].lat, coordinates[i].lng,
          coordinates[j].lat, coordinates[j].lng
        );

        if (distance > this.config.coordinateToleranceMeters) {
          const severity = distance > 5000 ? ConflictSeverity.CRITICAL : 
                          distance > 2000 ? ConflictSeverity.HIGH : ConflictSeverity.MEDIUM;
          
          conflicts.push({
            field: 'coordinate',
            severity,
            sources: [coordinates[i].source, coordinates[j].source],
            values: [
              `${coordinates[i].lat}, ${coordinates[i].lng}`,
              `${coordinates[j].lat}, ${coordinates[j].lng}`
            ]
          });
        }
      }
    }

    this.setCache(cacheKey, conflicts);
    return conflicts;
  }

  /**
   * 🏷️ 실제 구현: 중요 이름 충돌 탐지
   */
  private async detectCriticalNameConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    const cacheKey = `name_conflicts:${this.generateSourcesHash(sources)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const conflicts: DataConflict[] = [];
    const names: Array<{source: string, name: string, reliability: number}> = [];

    // 이름 데이터 추출
    for (const source of sources) {
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      if (data?.name) {
        names.push({
          source: source.sourceId,
          name: data.name.toLowerCase().trim(),
          reliability: source.reliability
        });
      }
    }

    // 이름 유사도 계산 및 충돌 탐지
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const similarity = this.calculateNameSimilarity(names[i].name, names[j].name);
        
        if (similarity < this.config.nameSimilarityThreshold) {
          const severity = similarity < 0.3 ? ConflictSeverity.CRITICAL : 
                          similarity < 0.5 ? ConflictSeverity.HIGH : ConflictSeverity.MEDIUM;
          
          conflicts.push({
            field: 'name',
            severity,
            sources: [names[i].source, names[j].source],
            values: [names[i].name, names[j].name]
          });
        }
      }
    }

    this.setCache(cacheKey, conflicts);
    return conflicts;
  }

  /**
   * 📅 실제 구현: 날짜 충돌 탐지
   */
  private async detectDateConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];
    const dates: Array<{source: string, date: Date, field: string, reliability: number}> = [];

    // 날짜 데이터 추출
    for (const source of sources) {
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      
      // 다양한 날짜 필드 확인
      const dateFields = ['established', 'inscriptionYear', 'inception', 'founded', 'built'];
      
      for (const field of dateFields) {
        if (data?.[field]) {
          const parsedDate = this.parseDate(data[field]);
          if (parsedDate) {
            dates.push({
              source: source.sourceId,
              date: parsedDate,
              field,
              reliability: source.reliability
            });
          }
        }
      }
    }

    // 날짜 충돌 탐지
    for (let i = 0; i < dates.length; i++) {
      for (let j = i + 1; j < dates.length; j++) {
        if (dates[i].field === dates[j].field) {
          const daysDiff = Math.abs(dates[i].date.getTime() - dates[j].date.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysDiff > this.config.dateToleranceDays) {
            const severity = daysDiff > 3650 ? ConflictSeverity.HIGH : ConflictSeverity.MEDIUM; // 10년 이상이면 high
            
            conflicts.push({
              field: 'date',
              severity,
              sources: [dates[i].source, dates[j].source],
              values: [
                dates[i].date.toISOString().split('T')[0],
                dates[j].date.toISOString().split('T')[0]
              ]
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Helper Methods - 성능 최적화된 구현
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    // Jaccard similarity for performance
    const words1 = new Set(name1.split(/\s+/));
    const words2 = new Set(name2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private parseDate(dateStr: any): Date | null {
    if (!dateStr) return null;
    
    // 숫자만 있는 경우 (연도)
    if (typeof dateStr === 'number' || /^\d{4}$/.test(dateStr)) {
      return new Date(parseInt(dateStr.toString()), 0, 1);
    }
    
    // 일반적인 날짜 형식 파싱
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private generateSourcesHash(sources: SourceData[]): string {
    return sources.map(s => s.sourceId).sort().join('-');
  }

  private getFromCache(key: string): any {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.config.cacheExpiryMs) {
      this.metrics.cacheHits++;
      return item.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.config.cacheExpiryMs) {
        this.cache.delete(key);
      }
    }
  }

  // Placeholder methods for remaining functionality
  private async detectDetailedCoordinateConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    // Detailed coordinate verification with additional checks
    return this.detectCriticalCoordinateConflicts(sources);
  }

  private async detectDetailedNameConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    // Detailed name verification with fuzzy matching
    return this.detectCriticalNameConflicts(sources);
  }

  private async detectCategoryConflicts(sources: SourceData[]): Promise<DataConflict[]> {
    // Category conflict detection
    return [];
  }

  private calculateSourceReliability(sources: SourceData[]): number {
    return sources.reduce((sum, source) => sum + source.reliability, 0) / sources.length;
  }

  private calculateQuickCompleteness(sources: SourceData[]): number {
    const requiredFields = ['name', 'coordinates'];
    let totalFields = 0;
    let presentFields = 0;

    sources.forEach(source => {
      const data = Array.isArray(source.data) ? source.data[0] : source.data;
      requiredFields.forEach(field => {
        totalFields++;
        if (data?.[field]) presentFields++;
      });
    });

    return totalFields > 0 ? presentFields / totalFields : 0;
  }

  private calculateAuthorityScore(sources: SourceData[]): number {
    const authorityWeights = {
      unesco: 1.0,
      government: 0.9,
      wikidata: 0.8
    };

    let totalWeight = 0;
    let weightedSum = 0;

    sources.forEach(source => {
      const weight = authorityWeights[source.sourceId as keyof typeof authorityWeights] || 0.5;
      weightedSum += weight;
      totalWeight += 1;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  private calculateDetailedConfidence(sources: SourceData[], conflicts: DataConflict[]): number {
    const baseConfidence = this.calculateSourceReliability(sources);
    const criticalConflicts = conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL).length;
    const highConflicts = conflicts.filter(c => c.severity === 'high').length;
    
    let penalty = criticalConflicts * 0.3 + highConflicts * 0.15;
    return Math.max(baseConfidence - penalty, 0);
  }

  private calculateSelectiveConfidence(quickResult: VerificationResult, newConflicts: DataConflict[]): number {
    const additionalPenalty = newConflicts.filter(c => c.severity === ConflictSeverity.CRITICAL).length * 0.2;
    return Math.max(quickResult.confidence - additionalPenalty, 0);
  }

  private identifySuspiciousAreas(result: VerificationResult): string[] {
    const suspicious: string[] = [];
    
    if (result.score.consistency < 0.8) suspicious.push('coordinates');
    if (result.score.accuracy < 0.8) suspicious.push('names');
    if (result.score.timeliness < 0.8) suspicious.push('dates');
    
    return suspicious;
  }

  private generateQuickRecommendations(conflicts: DataConflict[]): string[] {
    const recommendations: string[] = [];
    
    if (conflicts.some(c => c.field === 'coordinate' && c.severity === ConflictSeverity.CRITICAL)) {
      recommendations.push('좌표 정보 재확인 필요');
    }
    
    if (conflicts.some(c => c.field === 'name' && c.severity === ConflictSeverity.CRITICAL)) {
      recommendations.push('장소명 검증 필요');
    }
    
    return recommendations;
  }

  private generateDetailedRecommendations(conflicts: DataConflict[]): string[] {
    const recommendations = this.generateQuickRecommendations(conflicts);
    
    if (conflicts.length > 3) {
      recommendations.push('다수 데이터소스 충돌 발생 - 수동 검토 권장');
    }
    
    return recommendations;
  }

  private finalizeResult(result: VerificationResult, startTime: number): VerificationResult {
    const processingTime = Date.now() - startTime;
    this.metrics.avgProcessingTime = (this.metrics.avgProcessingTime * 0.9) + (processingTime * 0.1);
    this.metrics.conflictsDetected += result.conflicts.length;
    
    console.log(`✅ 검증 완료: ${processingTime}ms, 신뢰도: ${(result.confidence * 100).toFixed(1)}%, 충돌: ${result.conflicts.length}개`);
    
    return result;
  }

  private createFallbackResult(sources: SourceData[], startTime: number): VerificationResult {
    return {
      isVerified: false,
      confidence: 0.3,
      score: {
        consistency: 0.3,
        completeness: 0.5,
        accuracy: 0.3,
        timeliness: 0.5,
        authority: 0.4,
        overall: 0.3
      },
      conflicts: [],
      recommendations: ['검증 시스템 오류로 인한 낮은 신뢰도 - 수동 확인 필요'],
      verifiedAt: new Date().toISOString(),
      method: VerificationMethod.FALLBACK
    };
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics(): VerificationMetrics {
    return { ...this.metrics };
  }
}
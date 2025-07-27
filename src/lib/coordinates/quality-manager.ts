/**
 * Coordinate Quality Management System
 * 좌표 품질 관리 및 실시간 모니터링 시스템
 */

import type { ValidationResult, CoordinateSource } from './multi-source-validator';

export interface QualityMetrics {
  accuracy: number;          // 실제 정확도 (미터)
  precision: number;         // 소수점 자리수
  freshness: number;         // 데이터 신선도 (일)
  sourceReliability: number; // 소스 신뢰도
  consensusScore: number;    // 합의 점수
  verificationStatus: 'verified' | 'pending' | 'disputed' | 'outdated';
}

export interface QualityReport {
  locationId: string;
  currentQuality: QualityMetrics;
  trends: QualityTrend[];
  recommendations: QualityRecommendation[];
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
}

export interface QualityTrend {
  metric: keyof QualityMetrics;
  direction: 'improving' | 'stable' | 'declining';
  change: number;
  timeframe: string;
}

export interface QualityRecommendation {
  type: 'update_coordinates' | 'verify_sources' | 'manual_review' | 'schedule_refresh';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  actionRequired: boolean;
  estimatedEffort: string;
}

export interface DriftAlert {
  type: 'coordinate_drift' | 'source_conflict' | 'quality_degradation' | 'data_staleness';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedLocation: string;
  detectedAt: Date;
  recommendations: string[];
  autoResolvable: boolean;
}

export interface FreshnessReport {
  staleCount: number;
  urgentCount: number;
  criticalCount: number;
  totalLocations: number;
  averageFreshness: number;
  recommendedActions: FreshnessAction[];
}

export interface FreshnessAction {
  locationId: string;
  locationName: string;
  daysSinceUpdate: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedAction: string;
}

// 품질 임계값 설정
const QUALITY_THRESHOLDS = {
  accuracy: {
    excellent: 5,    // 5m 이내
    good: 20,        // 20m 이내
    acceptable: 50,  // 50m 이내
    poor: 100        // 100m 이상
  },
  freshness: {
    fresh: 30,       // 30일 이내
    acceptable: 90,  // 90일 이내
    stale: 365,      // 1년 이내
    outdated: 365    // 1년 이상
  },
  consensus: {
    high: 0.8,
    medium: 0.6,
    low: 0.4
  }
};

export class QualityManager {
  private qualityHistory = new Map<string, QualityMetrics[]>();
  private alertSubscribers: Array<(alert: DriftAlert) => void> = [];

  /**
   * 실시간 품질 모니터링
   */
  async monitorQuality(locationId: string, locationName: string): Promise<QualityReport> {
    console.log(`📊 Starting quality monitoring for: ${locationName}`);

    try {
      // 현재 데이터 품질 평가
      const currentQuality = await this.assessCurrentQuality(locationId, locationName);
      
      // 히스토리컬 트렌드 분석
      const trends = await this.analyzeTrends(locationId);
      
      // 개선 권장사항 생성
      const recommendations = await this.generateRecommendations(currentQuality, trends);
      
      // 알림 레벨 계산
      const alertLevel = this.calculateAlertLevel(currentQuality, trends);

      const report: QualityReport = {
        locationId,
        currentQuality,
        trends,
        recommendations,
        alertLevel,
        lastUpdated: new Date()
      };

      // 품질 히스토리 저장
      this.saveQualityHistory(locationId, currentQuality);

      // 임계값 체크 및 알림
      await this.checkThresholds(locationId, locationName, currentQuality);

      console.log(`✅ Quality monitoring completed for ${locationName}: ${alertLevel} alert level`);
      return report;

    } catch (error) {
      console.error(`❌ Quality monitoring failed for ${locationName}:`, error);
      throw error;
    }
  }

  /**
   * 현재 품질 평가
   */
  private async assessCurrentQuality(locationId: string, locationName: string): Promise<QualityMetrics> {
    // 다중 소스 검증 수행
    const { multiSourceValidator } = await import('./multi-source-validator');
    const validation = await multiSourceValidator.validateLocation(locationName, 'korea', {
      enableCaching: false // 최신 데이터 강제 조회
    });

    // 정확도 계산 (소스 간 최대 거리)
    const accuracy = this.calculateAccuracyFromSources(validation.sources);
    
    // 소수점 정밀도 계산
    const precision = this.calculatePrecision(validation.coordinates);
    
    // 데이터 신선도 계산
    const freshness = this.calculateFreshness(validation.sources);
    
    // 소스 신뢰도 평균
    const sourceReliability = this.calculateSourceReliability(validation.sources);

    return {
      accuracy,
      precision,
      freshness,
      sourceReliability,
      consensusScore: validation.qualityScore,
      verificationStatus: this.determineVerificationStatus(validation)
    };
  }

  /**
   * 소스별 정확도 계산
   */
  private calculateAccuracyFromSources(sources: CoordinateSource[]): number {
    if (sources.length <= 1) return sources[0]?.accuracy || 50;

    let maxDistance = 0;
    
    // 모든 소스 쌍 간의 최대 거리 계산
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const distance = this.calculateDistance(
          sources[i].coordinates,
          sources[j].coordinates
        );
        maxDistance = Math.max(maxDistance, distance);
      }
    }

    return Math.max(maxDistance, 1); // 최소 1m
  }

  /**
   * 좌표 정밀도 계산
   */
  private calculatePrecision(coordinates: { lat: number; lng: number }): number {
    const latPrecision = this.getDecimalPlaces(coordinates.lat);
    const lngPrecision = this.getDecimalPlaces(coordinates.lng);
    return Math.min(latPrecision, lngPrecision);
  }

  /**
   * 데이터 신선도 계산
   */
  private calculateFreshness(sources: CoordinateSource[]): number {
    if (sources.length === 0) return 365; // 데이터 없음

    const now = new Date();
    const ages = sources.map(source => {
      const ageMs = now.getTime() - source.timestamp.getTime();
      return ageMs / (1000 * 60 * 60 * 24); // 일 단위 변환
    });

    // 가장 신선한 데이터의 나이 반환
    return Math.min(...ages);
  }

  /**
   * 소스 신뢰도 계산
   */
  private calculateSourceReliability(sources: CoordinateSource[]): number {
    if (sources.length === 0) return 0;

    const reliabilityMap = {
      government: 1.0,
      google: 0.9,
      naver: 0.85,
      kakao: 0.8,
      static: 0.9,
      osm: 0.7,
      manual: 0.3
    };

    const totalReliability = sources.reduce((sum, source) => {
      return sum + (reliabilityMap[source.source] || 0.5);
    }, 0);

    return totalReliability / sources.length;
  }

  /**
   * 검증 상태 결정
   */
  private determineVerificationStatus(validation: ValidationResult): QualityMetrics['verificationStatus'] {
    if (validation.qualityScore >= 0.8 && validation.sourceCount >= 3) {
      return 'verified';
    } else if (validation.qualityScore >= 0.6) {
      return 'pending';
    } else if (validation.sourceCount >= 2) {
      return 'disputed';
    } else {
      return 'outdated';
    }
  }

  /**
   * 트렌드 분석
   */
  private async analyzeTrends(locationId: string): Promise<QualityTrend[]> {
    const history = this.qualityHistory.get(locationId) || [];
    
    if (history.length < 2) {
      return []; // 트렌드 분석에 충분한 데이터 없음
    }

    const recent = history[history.length - 1];
    const previous = history[history.length - 2];

    const trends: QualityTrend[] = [];

    // 각 메트릭별 트렌드 계산
    const metrics: Array<keyof QualityMetrics> = [
      'accuracy', 'precision', 'freshness', 'sourceReliability', 'consensusScore'
    ];

    for (const metric of metrics) {
      if (typeof recent[metric] === 'number' && typeof previous[metric] === 'number') {
        const change = (recent[metric] as number) - (previous[metric] as number);
        const changePercent = Math.abs(change) / (previous[metric] as number) * 100;

        let direction: QualityTrend['direction'];
        if (changePercent < 5) {
          direction = 'stable';
        } else if (metric === 'accuracy' || metric === 'freshness') {
          // 낮을수록 좋은 메트릭
          direction = change < 0 ? 'improving' : 'declining';
        } else {
          // 높을수록 좋은 메트릭
          direction = change > 0 ? 'improving' : 'declining';
        }

        trends.push({
          metric,
          direction,
          change: Number(change.toFixed(3)),
          timeframe: 'recent'
        });
      }
    }

    return trends;
  }

  /**
   * 권장사항 생성
   */
  private async generateRecommendations(
    quality: QualityMetrics,
    trends: QualityTrend[]
  ): Promise<QualityRecommendation[]> {
    const recommendations: QualityRecommendation[] = [];

    // 정확도 기반 권장사항
    if (quality.accuracy > QUALITY_THRESHOLDS.accuracy.poor) {
      recommendations.push({
        type: 'update_coordinates',
        priority: 'high',
        description: `Low accuracy detected (${quality.accuracy.toFixed(1)}m). Manual verification recommended.`,
        actionRequired: true,
        estimatedEffort: '30 minutes'
      });
    } else if (quality.accuracy > QUALITY_THRESHOLDS.accuracy.acceptable) {
      recommendations.push({
        type: 'verify_sources',
        priority: 'medium',
        description: `Moderate accuracy (${quality.accuracy.toFixed(1)}m). Consider adding more data sources.`,
        actionRequired: false,
        estimatedEffort: '15 minutes'
      });
    }

    // 신선도 기반 권장사항
    if (quality.freshness > QUALITY_THRESHOLDS.freshness.outdated) {
      recommendations.push({
        type: 'schedule_refresh',
        priority: 'urgent',
        description: `Data is ${quality.freshness.toFixed(0)} days old. Immediate refresh required.`,
        actionRequired: true,
        estimatedEffort: '10 minutes'
      });
    } else if (quality.freshness > QUALITY_THRESHOLDS.freshness.stale) {
      recommendations.push({
        type: 'schedule_refresh',
        priority: 'medium',
        description: `Data is ${quality.freshness.toFixed(0)} days old. Consider refreshing soon.`,
        actionRequired: false,
        estimatedEffort: '10 minutes'
      });
    }

    // 합의 점수 기반 권장사항
    if (quality.consensusScore < QUALITY_THRESHOLDS.consensus.low) {
      recommendations.push({
        type: 'manual_review',
        priority: 'high',
        description: `Low consensus score (${quality.consensusScore.toFixed(2)}). Manual review needed.`,
        actionRequired: true,
        estimatedEffort: '45 minutes'
      });
    }

    // 트렌드 기반 권장사항
    const decliningTrends = trends.filter(t => t.direction === 'declining');
    if (decliningTrends.length >= 2) {
      recommendations.push({
        type: 'manual_review',
        priority: 'medium',
        description: `Multiple quality metrics are declining. Proactive review recommended.`,
        actionRequired: false,
        estimatedEffort: '20 minutes'
      });
    }

    return recommendations;
  }

  /**
   * 알림 레벨 계산
   */
  private calculateAlertLevel(
    quality: QualityMetrics,
    trends: QualityTrend[]
  ): QualityReport['alertLevel'] {
    let score = 0;

    // 정확도 점수
    if (quality.accuracy > 100) score += 3;
    else if (quality.accuracy > 50) score += 2;
    else if (quality.accuracy > 20) score += 1;

    // 신선도 점수
    if (quality.freshness > 365) score += 3;
    else if (quality.freshness > 90) score += 2;
    else if (quality.freshness > 30) score += 1;

    // 합의 점수
    if (quality.consensusScore < 0.4) score += 3;
    else if (quality.consensusScore < 0.6) score += 2;
    else if (quality.consensusScore < 0.8) score += 1;

    // 트렌드 점수
    const decliningCount = trends.filter(t => t.direction === 'declining').length;
    score += Math.min(decliningCount, 2);

    // 최종 레벨 결정
    if (score >= 8) return 'critical';
    if (score >= 5) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  /**
   * 임계값 체크 및 알림
   */
  private async checkThresholds(
    locationId: string,
    locationName: string,
    quality: QualityMetrics
  ): Promise<void> {
    const alerts: DriftAlert[] = [];

    // 정확도 알림
    if (quality.accuracy > QUALITY_THRESHOLDS.accuracy.poor) {
      alerts.push({
        type: 'quality_degradation',
        severity: 'high',
        message: `Coordinate accuracy degraded to ${quality.accuracy.toFixed(1)}m for ${locationName}`,
        affectedLocation: locationName,
        detectedAt: new Date(),
        recommendations: [
          'Verify coordinates with official sources',
          'Check for recent changes in the area',
          'Consider manual verification'
        ],
        autoResolvable: false
      });
    }

    // 신선도 알림
    if (quality.freshness > QUALITY_THRESHOLDS.freshness.outdated) {
      alerts.push({
        type: 'data_staleness',
        severity: 'critical',
        message: `Data for ${locationName} is ${quality.freshness.toFixed(0)} days old`,
        affectedLocation: locationName,
        detectedAt: new Date(),
        recommendations: [
          'Schedule immediate data refresh',
          'Verify current status of location',
          'Update from authoritative sources'
        ],
        autoResolvable: true
      });
    }

    // 합의 점수 알림
    if (quality.consensusScore < QUALITY_THRESHOLDS.consensus.low) {
      alerts.push({
        type: 'source_conflict',
        severity: 'medium',
        message: `Low consensus score (${quality.consensusScore.toFixed(2)}) for ${locationName}`,
        affectedLocation: locationName,
        detectedAt: new Date(),
        recommendations: [
          'Review conflicting data sources',
          'Investigate recent changes',
          'Consider additional verification sources'
        ],
        autoResolvable: false
      });
    }

    // 알림 발송
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  /**
   * 알림 발송
   */
  private async sendAlert(alert: DriftAlert): Promise<void> {
    console.log(`🚨 Quality Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // 구독자들에게 알림 전송
    this.alertSubscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert callback failed:', error);
      }
    });
  }

  /**
   * 알림 구독
   */
  subscribeToAlerts(callback: (alert: DriftAlert) => void): void {
    this.alertSubscribers.push(callback);
  }

  /**
   * 품질 히스토리 저장
   */
  private saveQualityHistory(locationId: string, quality: QualityMetrics): void {
    const history = this.qualityHistory.get(locationId) || [];
    history.push({
      ...quality,
      timestamp: new Date()
    } as QualityMetrics & { timestamp: Date });

    // 최대 100개 항목만 유지
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.qualityHistory.set(locationId, history);
  }

  /**
   * 신선도 리포트 생성
   */
  async generateFreshnessReport(locationIds: string[]): Promise<FreshnessReport> {
    console.log(`📈 Generating freshness report for ${locationIds.length} locations`);

    const actions: FreshnessAction[] = [];
    let totalFreshness = 0;
    let staleCount = 0;
    let urgentCount = 0;
    let criticalCount = 0;

    for (const locationId of locationIds) {
      try {
        const quality = await this.assessCurrentQuality(locationId, locationId);
        totalFreshness += quality.freshness;

        if (quality.freshness > QUALITY_THRESHOLDS.freshness.outdated) {
          criticalCount++;
          actions.push({
            locationId,
            locationName: locationId,
            daysSinceUpdate: quality.freshness,
            priority: 'urgent',
            suggestedAction: 'Immediate refresh required'
          });
        } else if (quality.freshness > QUALITY_THRESHOLDS.freshness.stale) {
          urgentCount++;
          actions.push({
            locationId,
            locationName: locationId,
            daysSinceUpdate: quality.freshness,
            priority: 'high',
            suggestedAction: 'Schedule refresh within 7 days'
          });
        } else if (quality.freshness > QUALITY_THRESHOLDS.freshness.acceptable) {
          staleCount++;
          actions.push({
            locationId,
            locationName: locationId,
            daysSinceUpdate: quality.freshness,
            priority: 'medium',
            suggestedAction: 'Consider refresh within 30 days'
          });
        }
      } catch (error) {
        console.warn(`Failed to assess freshness for ${locationId}:`, error);
      }
    }

    return {
      staleCount,
      urgentCount,
      criticalCount,
      totalLocations: locationIds.length,
      averageFreshness: totalFreshness / locationIds.length,
      recommendedActions: actions.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
    };
  }

  /**
   * 유틸리티 메서드들
   */
  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
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
export const qualityManager = new QualityManager();
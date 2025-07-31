// 🎯 품질 점수 계산 및 저장 로직
// 다양한 지표를 종합하여 가이드 품질을 정확하게 평가

import { supabase } from '@/lib/supabaseClient';

// 품질 점수 구성 요소
export interface QualityComponents {
  factualAccuracy: number;      // 사실 정확성 (0-100)
  contentCompleteness: number;  // 콘텐츠 완성도 (0-100)
  coherenceScore: number;       // 논리적 흐름 (0-100)
  culturalSensitivity: number;  // 문화적 민감성 (0-100)
  userSatisfaction?: number;    // 사용자 만족도 (0-100)
  technicalQuality?: number;    // 기술적 품질 (0-100)
}

// 종합 품질 점수
export interface ComprehensiveQualityScore {
  overallScore: number;         // 종합 점수 (0-100)
  weightedScore: number;        // 가중치 적용 점수 (0-100)
  components: QualityComponents;
  confidence: number;           // 평가 신뢰도 (0-100)
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  metadata: {
    evaluationMethod: string;
    timestamp: Date;
    sampleSize?: number;
    evaluationVersion: string;
  };
}

// 품질 가중치 설정 (상황별 조정 가능)
export const QUALITY_WEIGHTS = {
  // 기본 가중치
  default: {
    factualAccuracy: 0.35,      // 35% - 사실 정확성이 가장 중요
    contentCompleteness: 0.25,  // 25% - 완성도
    coherenceScore: 0.20,       // 20% - 논리적 흐름
    culturalSensitivity: 0.20   // 20% - 문화적 민감성
  },
  
  // 역사적 장소용 가중치
  historical: {
    factualAccuracy: 0.45,      // 45% - 역사적 사실이 더 중요
    contentCompleteness: 0.20,
    coherenceScore: 0.20,
    culturalSensitivity: 0.15
  },
  
  // 문화 관광지용 가중치
  cultural: {
    factualAccuracy: 0.25,
    contentCompleteness: 0.20,
    coherenceScore: 0.20,
    culturalSensitivity: 0.35   // 35% - 문화적 민감성 강조
  },
  
  // 자연 관광지용 가중치
  natural: {
    factualAccuracy: 0.30,
    contentCompleteness: 0.30,  // 30% - 실용 정보 중요
    coherenceScore: 0.25,
    culturalSensitivity: 0.15
  }
};

// 품질 임계값
export const QUALITY_THRESHOLDS = {
  CRITICAL: 40,    // 심각 (즉시 조치 필요)
  POOR: 60,        // 불량 (개선 필요)
  ACCEPTABLE: 75,  // 허용 가능 (모니터링 필요)  
  GOOD: 85,        // 양호 (유지)
  EXCELLENT: 95    // 우수 (벤치마크)
} as const;

/**
 * 🎯 종합 품질 점수 계산
 */
export function calculateComprehensiveQualityScore(
  components: QualityComponents,
  weightType = 'default',
  userFeedbackData?: any,
  historicalData?: any[]
): ComprehensiveQualityScore {

  const weights = QUALITY_WEIGHTS[weightType as keyof typeof QUALITY_WEIGHTS] || QUALITY_WEIGHTS.default;
  
  // 1. 기본 가중 평균 계산
  const weightedScore = 
    components.factualAccuracy * weights.factualAccuracy +
    components.contentCompleteness * weights.contentCompleteness +
    components.coherenceScore * weights.coherenceScore +
    components.culturalSensitivity * weights.culturalSensitivity;

  // 2. 사용자 피드백 보정 (있는 경우)
  let adjustedScore = weightedScore;
  if (userFeedbackData && userFeedbackData.averageRating) {
    const userScore = (userFeedbackData.averageRating / 5) * 100;
    const feedbackWeight = Math.min(0.3, userFeedbackData.feedbackCount / 20); // 최대 30% 가중치
    adjustedScore = weightedScore * (1 - feedbackWeight) + userScore * feedbackWeight;
  }

  // 3. 트렌드 분석
  const trend = calculateTrend(adjustedScore, historicalData);
  
  // 4. 위험도 평가
  const riskLevel = assessRiskLevel(adjustedScore, components, trend);
  
  // 5. 신뢰도 계산
  const confidence = calculateConfidence(components, userFeedbackData, historicalData);
  
  // 6. 추천사항 생성
  const recommendations = generateRecommendations(adjustedScore, components, trend);

  return {
    overallScore: Math.round(adjustedScore * 100) / 100,
    weightedScore: Math.round(weightedScore * 100) / 100,
    components,
    confidence,
    trend,
    riskLevel,
    recommendations,
    metadata: {
      evaluationMethod: `weighted_${weightType}`,
      timestamp: new Date(),
      sampleSize: userFeedbackData?.feedbackCount,
      evaluationVersion: '1.0'
    }
  };
}

/**
 * 트렌드 분석
 */
function calculateTrend(currentScore: number, historicalData?: any[]): 'improving' | 'stable' | 'declining' {
  if (!historicalData || historicalData.length < 2) {
    return 'stable';
  }

  // 최근 3개 데이터 포인트로 트렌드 계산
  const recentData = historicalData.slice(-3);
  const scores = recentData.map(d => d.overall_quality || d.overallScore);
  
  if (scores.length < 2) return 'stable';

  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const difference = lastScore - firstScore;

  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

/**
 * 위험도 평가
 */
function assessRiskLevel(
  overallScore: number,
  components: QualityComponents,
  trend: string
): 'low' | 'medium' | 'high' | 'critical' {
  
  // 기본 위험도 (점수 기반)
  let baseRisk: 'low' | 'medium' | 'high' | 'critical';
  if (overallScore >= QUALITY_THRESHOLDS.GOOD) baseRisk = 'low';
  else if (overallScore >= QUALITY_THRESHOLDS.ACCEPTABLE) baseRisk = 'medium';
  else if (overallScore >= QUALITY_THRESHOLDS.POOR) baseRisk = 'high';
  else baseRisk = 'critical';

  // 구성 요소별 위험 요인
  const riskFactors = [];
  if (components.factualAccuracy < 70) riskFactors.push('factual');
  if (components.contentCompleteness < 60) riskFactors.push('completeness');
  if (components.culturalSensitivity < 60) riskFactors.push('cultural');

  // 트렌드에 따른 위험도 조정
  if (trend === 'declining' && riskFactors.length > 0) {
    // 하락 추세 + 위험 요인 → 위험도 증가
    if (baseRisk === 'low') baseRisk = 'medium';
    else if (baseRisk === 'medium') baseRisk = 'high';
  } else if (trend === 'improving' && baseRisk === 'high') {
    // 개선 추세 → 위험도 완화
    baseRisk = 'medium';
  }

  return baseRisk;
}

/**
 * 신뢰도 계산
 */
function calculateConfidence(
  components: QualityComponents,
  userFeedbackData?: any,
  historicalData?: any[]
): number {
  
  let confidence = 70; // 기본 신뢰도

  // AI 평가 일관성 확인
  const scores = [
    components.factualAccuracy,
    components.contentCompleteness,
    components.coherenceScore,
    components.culturalSensitivity
  ];
  
  const variance = calculateVariance(scores);
  if (variance < 100) confidence += 10; // 낮은 분산 = 높은 신뢰도
  else if (variance > 400) confidence -= 10; // 높은 분산 = 낮은 신뢰도

  // 사용자 피드백 데이터 보정
  if (userFeedbackData) {
    const feedbackCount = userFeedbackData.feedbackCount || 0;
    if (feedbackCount >= 10) confidence += 15;
    else if (feedbackCount >= 5) confidence += 10;
    else if (feedbackCount >= 2) confidence += 5;
  }

  // 과거 데이터 일관성 확인
  if (historicalData && historicalData.length >= 3) {
    confidence += 10;
  }

  return Math.min(100, Math.max(20, confidence));
}

/**
 * 분산 계산
 */
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}

/**
 * 추천사항 생성
 */
function generateRecommendations(
  overallScore: number,
  components: QualityComponents,
  trend: string
): string[] {
  
  const recommendations: string[] = [];

  // 전체 점수 기반 추천
  if (overallScore < QUALITY_THRESHOLDS.POOR) {
    recommendations.push('즉시 가이드 재생성이 필요합니다');
    recommendations.push('사용자 노출을 최소화하고 대체 콘텐츠를 준비하세요');
  } else if (overallScore < QUALITY_THRESHOLDS.ACCEPTABLE) {
    recommendations.push('품질 개선을 위한 재생성을 검토하세요');
    recommendations.push('사용자 피드백을 면밀히 모니터링하세요');
  } else if (overallScore < QUALITY_THRESHOLDS.GOOD) {
    recommendations.push('안정적인 품질이지만 개선 여지가 있습니다');
  }

  // 구성 요소별 추천
  if (components.factualAccuracy < 75) {
    recommendations.push('사실 정확성 검증을 강화하세요');
    recommendations.push('신뢰할 수 있는 소스를 활용하여 정보를 보완하세요');
  }

  if (components.contentCompleteness < 75) {
    recommendations.push('누락된 필수 정보를 추가하세요');
    recommendations.push('가이드 구조와 완성도를 점검하세요');
  }

  if (components.coherenceScore < 75) {
    recommendations.push('스토리텔링과 논리적 흐름을 개선하세요');
    recommendations.push('챕터 간 연결성을 강화하세요');
  }

  if (components.culturalSensitivity < 75) {
    recommendations.push('문화적 민감성을 고려한 표현으로 수정하세요');
    recommendations.push('현지 문화에 대한 이해를 더 반영하세요');
  }

  // 트렌드 기반 추천
  if (trend === 'declining') {
    recommendations.push('품질 하락 추세가 감지됩니다 - 원인 분석이 필요합니다');
    recommendations.push('최근 변경사항을 검토하고 개선 계획을 수립하세요');
  } else if (trend === 'improving') {
    recommendations.push('품질 개선 추세가 긍정적입니다 - 현재 전략을 유지하세요');
  }

  return recommendations;
}

/**
 * 🎯 품질 점수를 데이터베이스에 저장
 */
export async function saveQualityScore(
  guideId: string,
  locationName: string,
  qualityScore: ComprehensiveQualityScore,
  source: string = 'automated'
): Promise<boolean> {
  
  try {
    console.log(`💾 품질 점수 저장: ${locationName} (${qualityScore.overallScore}점)`);

    // 1. quality_evolution 테이블에 상세 정보 저장
    const { error: evolutionError } = await supabase
      .from('quality_evolution')
      .insert({
        guide_id: guideId,
        factual_accuracy: qualityScore.components.factualAccuracy,
        content_completeness: qualityScore.components.contentCompleteness,
        coherence_score: qualityScore.components.coherenceScore,
        cultural_sensitivity: qualityScore.components.culturalSensitivity,
        overall_quality: qualityScore.overallScore,
        confidence_level: qualityScore.confidence,
        verification_method: source,
        processing_time_ms: qualityScore.metadata.sampleSize || 0,
        detected_issues: [],
        recommendations: qualityScore.recommendations,
        improvement_suggestions: [`위험도: ${qualityScore.riskLevel}`, `트렌드: ${qualityScore.trend}`]
      });

    if (evolutionError) {
      console.error('품질 진화 데이터 저장 실패:', evolutionError);
      return false;
    }

    // 2. guide_versions 테이블의 품질 점수 업데이트
    const { error: versionError } = await supabase
      .from('guide_versions')
      .update({
        quality_score: qualityScore.overallScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', guideId);

    if (versionError) {
      console.error('가이드 버전 품질 점수 업데이트 실패:', versionError);
      return false;
    }

    // 3. 실시간 품질 지표 업데이트
    await updateRealtimeQualityMetrics(locationName, qualityScore);

    // 4. 위험도가 높은 경우 알림 생성  
    if (qualityScore.riskLevel === 'high' || qualityScore.riskLevel === 'critical') {
      await createQualityAlert(locationName, qualityScore);
    }

    console.log('✅ 품질 점수 저장 완료');
    return true;

  } catch (error) {
    console.error('품질 점수 저장 실패:', error);
    return false;
  }
}

/**
 * 실시간 품질 지표 업데이트
 */
async function updateRealtimeQualityMetrics(
  locationName: string,
  qualityScore: ComprehensiveQualityScore
): Promise<void> {
  
  try {
    // 기존 데이터 조회
    const { data: existing } = await supabase
      .from('realtime_quality_metrics')
      .select('*')
      .eq('location_name', locationName)
      .single();

    if (existing) {
      // 기존 데이터 업데이트
      const newCount = (existing.feedback_count || 0) + 1;
      const newAverage = ((existing.average_score * (existing.feedback_count || 0)) + qualityScore.overallScore) / newCount;

      await supabase
        .from('realtime_quality_metrics')
        .update({
          average_score: newAverage,
          feedback_count: newCount,
          quality_trend: qualityScore.trend,
          updated_at: new Date().toISOString()
        })
        .eq('location_name', locationName);
    } else {
      // 새 데이터 생성
      await supabase
        .from('realtime_quality_metrics')
        .insert({
          location_name: locationName,
          average_score: qualityScore.overallScore,
          feedback_count: 1,
          quality_trend: qualityScore.trend,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

  } catch (error) {
    console.error('실시간 품질 지표 업데이트 실패:', error);
  }
}

/**
 * 품질 알림 생성
 */
async function createQualityAlert(
  locationName: string,
  qualityScore: ComprehensiveQualityScore
): Promise<void> {
  
  try {
    const alertType = qualityScore.riskLevel === 'critical' ? 'quality_drop' : 'quality_drop';
    const severity = qualityScore.riskLevel;
    
    await supabase
      .from('quality_alerts')
      .insert({
        location_name: locationName,
        alert_type: alertType,
        severity: severity,
        title: `${locationName} 가이드 품질 ${severity === 'critical' ? '심각' : '저하'}`,
        description: `품질 점수: ${qualityScore.overallScore}점, 트렌드: ${qualityScore.trend}`,
        current_quality_score: qualityScore.overallScore,
        threshold_violated: severity === 'critical' ? QUALITY_THRESHOLDS.CRITICAL : QUALITY_THRESHOLDS.POOR,
        metadata: {
          components: qualityScore.components,
          recommendations: qualityScore.recommendations,
          confidence: qualityScore.confidence
        }
      });

    console.log(`🚨 품질 알림 생성: ${locationName} (${severity})`);

  } catch (error) {
    console.error('품질 알림 생성 실패:', error);
  }
}

/**
 * 🎯 위치별 품질 점수 조회
 */
export async function getQualityScore(
  locationName: string,
  language: string = 'ko'
): Promise<ComprehensiveQualityScore | null> {
  
  try {
    // 최신 품질 평가 조회
    const { data: latest, error } = await supabase
      .from('quality_evolution')
      .select(`
        *,
        guide_versions!inner (
          location_name,
          language,
          status
        )
      `)
      .eq('guide_versions.location_name', locationName)
      .eq('guide_versions.language', language)
      .eq('guide_versions.status', 'production')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !latest) {
      console.log('품질 점수 조회 결과 없음:', error);
      return null;
    }

    // 과거 데이터 조회 (트렌드 분석용)
    const { data: historical } = await supabase
      .from('quality_evolution')
      .select('overall_quality, created_at')
      .eq('guide_id', latest.guide_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // ComprehensiveQualityScore 형태로 변환
    const components: QualityComponents = {
      factualAccuracy: latest.factual_accuracy || 0,
      contentCompleteness: latest.content_completeness || 0,
      coherenceScore: latest.coherence_score || 0,
      culturalSensitivity: latest.cultural_sensitivity || 0
    };

    // 재계산하여 최신 기준 적용
    return calculateComprehensiveQualityScore(
      components,
      'default',
      null,
      historical
    );

  } catch (error) {
    console.error('품질 점수 조회 실패:', error);
    return null;
  }
}
// 🎯 기존 가이드 생성 API에 품질 검사를 통합하는 유틸리티
// 생성된 가이드의 품질을 자동으로 검증하고 필요시 재생성

import { supabase } from '@/lib/supabaseClient';

// 품질 통합 결과 인터페이스
export interface QualityIntegratedResult {
  success: boolean;
  guideData: any;
  qualityScore: number;
  qualityLevel: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
  verificationResults: any;
  regenerationAttempts: number;
  finalVersion: number;
  cachingRecommendation: 'cache_long' | 'cache_short' | 'no_cache';
  warnings?: string[];
}

// 품질 기준 설정
const QUALITY_STANDARDS = {
  EXCELLENT: 90,      // 우수 - 장기 캐싱
  GOOD: 75,          // 양호 - 표준 캐싱  
  ACCEPTABLE: 60,    // 허용 가능 - 단기 캐싱
  POOR: 40,          // 불량 - 캐싱 안함
  MIN_ACCEPTABLE: 60  // 최소 허용 기준
};

// 재생성 설정
const REGENERATION_SETTINGS = {
  MAX_ATTEMPTS: 3,
  IMPROVEMENT_THRESHOLD: 10,  // 최소 10점 개선 필요
  TIMEOUT_MS: 30000          // 30초 타임아웃
};

/**
 * 🎯 가이드 생성 후 품질 검증 및 자동 개선
 * 기존 가이드 생성 API에서 이 함수를 호출하여 품질을 보장
 */
export async function integrateQualityCheck(
  locationName: string,
  generatedGuide: any,
  language: string = 'ko',
  userPreferences?: any
): Promise<QualityIntegratedResult> {
  
  const startTime = Date.now();
  console.log(`🔍 품질 통합 검사 시작: ${locationName}`);

  let currentGuide = generatedGuide;
  let bestGuide = generatedGuide;
  let bestScore = 0;
  let regenerationAttempts = 0;
  let warnings: string[] = [];

  try {
    // 1. 초기 품질 검증
    console.log('📊 초기 품질 검증 중...');
    let qualityResult = await verifyGuideQuality(currentGuide, locationName, language);
    
    if (!qualityResult) {
      warnings.push('품질 검증 실패 - 기본 점수 적용');
      qualityResult = createDefaultQualityResult();
    }

    let currentScore = qualityResult.overallQuality;
    bestScore = currentScore;
    bestGuide = currentGuide;

    console.log(`📈 초기 품질 점수: ${currentScore}점`);

    // 2. 품질 기준 미달 시 재생성 시도
    while (currentScore < QUALITY_STANDARDS.MIN_ACCEPTABLE && 
           regenerationAttempts < REGENERATION_SETTINGS.MAX_ATTEMPTS) {
      
      regenerationAttempts++;
      console.log(`🔄 품질 개선 시도 ${regenerationAttempts}/${REGENERATION_SETTINGS.MAX_ATTEMPTS}`);

      try {
        // 품질 문제점 분석
        const issues = extractQualityIssues(qualityResult);
        
        // 개선된 가이드 생성
        const improvedGuide = await regenerateWithQualityFocus(
          locationName,
          currentGuide,
          issues,
          language,
          userPreferences
        );

        if (improvedGuide) {
          // 개선된 가이드 품질 검증
          const improvedQualityResult = await verifyGuideQuality(improvedGuide, locationName, language);
          
          if (improvedQualityResult) {
            const improvedScore = improvedQualityResult.overallQuality;
            const improvement = improvedScore - currentScore;

            console.log(`📊 개선 결과: ${currentScore} → ${improvedScore} (+${improvement}점)`);

            // 개선이 있었거나 더 나은 점수인 경우 업데이트
            if (improvement > 0 || improvedScore > bestScore) {
              if (improvedScore > bestScore) {
                bestGuide = improvedGuide;
                bestScore = improvedScore;
              }
              
              currentGuide = improvedGuide;
              currentScore = improvedScore;
              qualityResult = improvedQualityResult;

              // 충분한 개선이 있었으면 종료
              if (improvement >= REGENERATION_SETTINGS.IMPROVEMENT_THRESHOLD) {
                console.log('✅ 충분한 품질 개선 달성');
                break;
              }
            } else {
              warnings.push(`재생성 시도 ${regenerationAttempts}: 개선 없음`);
            }
          }
        }
      } catch (regenerationError) {
        console.error(`재생성 시도 ${regenerationAttempts} 실패:`, regenerationError);
        warnings.push(`재생성 시도 ${regenerationAttempts} 실패: ${regenerationError instanceof Error ? regenerationError.message : String(regenerationError)}`);
      }

      // 타임아웃 체크
      if (Date.now() - startTime > REGENERATION_SETTINGS.TIMEOUT_MS) {
        console.log('⏰ 품질 개선 타임아웃');
        warnings.push('품질 개선 시간 초과');
        break;
      }
    }

    // 3. 최고 품질 버전 사용
    const finalGuide = bestGuide;
    const finalScore = bestScore;
    const finalQualityResult = bestScore === currentScore ? qualityResult : 
      await verifyGuideQuality(finalGuide, locationName, language) || createDefaultQualityResult();

    // 4. 결과 저장 및 버전 관리
    const versionInfo = await saveQualityVerifiedGuide(
      locationName,
      language,
      finalGuide,
      finalQualityResult,
      regenerationAttempts
    );

    // 5. 캐싱 권장사항 결정
    const cachingRecommendation = determineCachingStrategy(finalScore);

    const processingTime = Date.now() - startTime;
    console.log(`✅ 품질 통합 완료: ${locationName} (${processingTime}ms, ${regenerationAttempts}회 재생성)`);

    return {
      success: true,
      guideData: finalGuide,
      qualityScore: finalScore,
      qualityLevel: getQualityLevel(finalScore),
      verificationResults: finalQualityResult,
      regenerationAttempts,
      finalVersion: versionInfo.version,
      cachingRecommendation,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    console.error('❌ 품질 통합 처리 실패:', error);
    
    // 실패 시에도 원본 가이드는 반환
    return {
      success: false,
      guideData: generatedGuide,
      qualityScore: 50, // 기본 점수
      qualityLevel: 'poor',
      verificationResults: createDefaultQualityResult(),
      regenerationAttempts,
      finalVersion: 1,
      cachingRecommendation: 'no_cache',
      warnings: [`품질 통합 실패: ${error instanceof Error ? error.message : String(error)}`, ...warnings]
    };
  }
}

/**
 * 가이드 품질 검증 수행
 */
async function verifyGuideQuality(guideContent: any, locationName: string, language: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/quality/verify-guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guideContent,
        locationName,
        language
      })
    });

    if (!response.ok) {
      throw new Error(`품질 검증 API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('품질 검증 실패');
    }

    return result.verification;

  } catch (error) {
    console.error('품질 검증 오류:', error);
    return null;
  }
}

/**
 * 품질 문제점에서 개선 포인트 추출
 */
function extractQualityIssues(qualityResult: any): string[] {
  const issues: string[] = [];

  // 점수별 문제점 추출
  if (qualityResult.factualAccuracy < 75) {
    issues.push('사실 정확성 개선 필요');
  }
  
  if (qualityResult.contentCompleteness < 75) {
    issues.push('콘텐츠 완성도 향상 필요');
  }
  
  if (qualityResult.coherenceScore < 75) {
    issues.push('논리적 흐름과 스토리텔링 개선 필요');
  }
  
  if (qualityResult.culturalSensitivity < 75) {
    issues.push('문화적 민감성 고려 필요');
  }

  // 구체적 이슈 추가
  if (qualityResult.issues) {
    const specificIssues = qualityResult.issues
      .filter((issue: any) => issue.severity === 'high' || issue.severity === 'critical')
      .map((issue: any) => issue.description);
    issues.push(...specificIssues);
  }

  // 추천사항 추가
  if (qualityResult.recommendations) {
    issues.push(...qualityResult.recommendations);
  }

  return [...new Set(issues)]; // 중복 제거
}

/**
 * 품질 개선에 초점을 맞춘 재생성
 */
async function regenerateWithQualityFocus(
  locationName: string,
  currentGuide: any,
  issues: string[],
  language: string,
  userPreferences?: any
): Promise<any> {

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/quality/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationName,
        language,
        currentIssues: issues,
        targetQualityScore: QUALITY_STANDARDS.GOOD,
        strategy: 'enhanced',
        forceRegenerate: true
      })
    });

    if (!response.ok) {
      throw new Error(`재생성 API 오류: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('재생성 실패');
    }

    // 재생성된 가이드 콘텐츠 반환
    return result.result?.content || null;

  } catch (error) {
    console.error('품질 기반 재생성 실패:', error);
    return null;
  }
}

/**
 * 품질 검증된 가이드 저장
 */
async function saveQualityVerifiedGuide(
  locationName: string,
  language: string,
  guideData: any,
  qualityResult: any,
  regenerationAttempts: number
): Promise<{ version: number; id: string }> {

  try {
    // 기존 버전 확인
    const { data: existingVersions } = await supabase
      .from('guide_versions')
      .select('version')
      .eq('location_name', locationName)
      .eq('language', language)
      .order('version', { ascending: false })
      .limit(1);

    const newVersion = (existingVersions?.[0]?.version || 0) + 1;
    const status = qualityResult.overallQuality >= QUALITY_STANDARDS.GOOD ? 'production' : 'staging';

    // 새 버전 저장
    const { data: newGuide, error } = await supabase
      .from('guide_versions')
      .insert({
        location_name: locationName,
        language: language,
        version: newVersion,
        content: guideData,
        quality_score: qualityResult.overallQuality,
        status: status,
        verification_results: qualityResult,
        ai_model: 'gemini-2.5-flash-lite-preview-06-17',
        generation_prompt: `Quality-integrated generation (${regenerationAttempts} regeneration attempts)`
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    // 품질 진화 기록
    await supabase
      .from('quality_evolution')
      .insert({
        guide_id: newGuide.id,
        factual_accuracy: qualityResult.factualAccuracy,
        content_completeness: qualityResult.contentCompleteness,
        coherence_score: qualityResult.coherenceScore,
        cultural_sensitivity: qualityResult.culturalSensitivity,
        overall_quality: qualityResult.overallQuality,
        confidence_level: qualityResult.confidenceLevel,
        verification_method: 'integrated_generation',
        processing_time_ms: qualityResult.processingTime,
        detected_issues: qualityResult.issues || [],
        recommendations: qualityResult.recommendations || [],
        improvement_suggestions: [`${regenerationAttempts}회 재생성을 통한 품질 개선`]
      });

    // 프로덕션 버전인 경우 이전 버전들 deprecated 처리
    if (status === 'production') {
      await supabase
        .from('guide_versions')
        .update({ status: 'deprecated' })
        .eq('location_name', locationName)
        .eq('language', language)
        .eq('status', 'production')
        .neq('version', newVersion);
    }

    console.log(`💾 품질 검증 가이드 저장 완료: v${newVersion} (${status})`);

    return {
      version: newVersion,
      id: newGuide.id
    };

  } catch (error) {
    console.error('품질 검증 가이드 저장 실패:', error);
    throw error;
  }
}

/**
 * 캐싱 전략 결정
 */
function determineCachingStrategy(qualityScore: number): 'cache_long' | 'cache_short' | 'no_cache' {
  if (qualityScore >= QUALITY_STANDARDS.EXCELLENT) {
    return 'cache_long';   // 12시간 캐싱
  } else if (qualityScore >= QUALITY_STANDARDS.GOOD) {
    return 'cache_long';   // 6시간 캐싱  
  } else if (qualityScore >= QUALITY_STANDARDS.ACCEPTABLE) {
    return 'cache_short';  // 2시간 캐싱
  } else {
    return 'no_cache';     // 캐싱 안함
  }
}

/**
 * 품질 레벨 결정
 */
function getQualityLevel(score: number): 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical' {
  if (score >= QUALITY_STANDARDS.EXCELLENT) return 'excellent';
  if (score >= QUALITY_STANDARDS.GOOD) return 'good';
  if (score >= QUALITY_STANDARDS.ACCEPTABLE) return 'acceptable';
  if (score >= QUALITY_STANDARDS.POOR) return 'poor';
  return 'critical';
}

/**
 * 기본 품질 결과 생성 (검증 실패 시 사용)
 */
function createDefaultQualityResult(): any {
  return {
    factualAccuracy: 50,
    contentCompleteness: 60,
    coherenceScore: 55,
    culturalSensitivity: 70,
    overallQuality: 58,
    confidenceLevel: 30,
    issues: [],
    recommendations: ['품질 검증을 다시 수행해주세요'],
    processingTime: 0
  };
}

/**
 * 🎯 기존 API에서 사용할 수 있는 간단한 래퍼 함수
 * 기존 가이드 생성 로직 후에 이 함수만 호출하면 됨
 */
export async function enhanceGuideWithQuality(
  locationName: string,
  originalGuideData: any,
  language: string = 'ko'
): Promise<any> {
  
  const qualityResult = await integrateQualityCheck(locationName, originalGuideData, language);
  
  // 기존 API 응답 형식에 맞춰 반환
  return {
    success: qualityResult.success,
    data: qualityResult.guideData,
    quality: {
      score: qualityResult.qualityScore,
      level: qualityResult.qualityLevel,
      regenerationAttempts: qualityResult.regenerationAttempts,
      warnings: qualityResult.warnings
    },
    caching: {
      strategy: qualityResult.cachingRecommendation,
      ttl: getCacheTTL(qualityResult.cachingRecommendation)
    }
  };
}

/**
 * 캐싱 TTL 결정
 */
function getCacheTTL(strategy: string): number {
  switch (strategy) {
    case 'cache_long': return 12 * 60 * 60; // 12시간
    case 'cache_short': return 2 * 60 * 60; // 2시간
    default: return 0; // 캐싱 안함
  }
}
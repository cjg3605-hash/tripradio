// src/lib/quality/guide-validation.ts
// 가이드 데이터 무결성 및 품질 검증 시스템

import { supabase } from '@/lib/supabaseClient';
import { classifyLocationByStaticData } from '@/lib/location/location-classification';

export interface GuideValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationIssue {
  type: 'critical' | 'major' | 'minor';
  category: 'content_mismatch' | 'location_conflict' | 'duplicate' | 'quality';
  description: string;
  field?: string;
  suggestedFix?: string;
}

export interface ValidationWarning {
  type: 'data_inconsistency' | 'potential_duplicate' | 'quality_concern';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * 가이드 생성 전 위치명 검증 및 충돌 방지
 */
export async function validateLocationBeforeCreation(
  locationName: string,
  language: string = 'ko',
  parentRegion?: string,
  regionalContext?: any
): Promise<GuideValidationResult> {
  const result: GuideValidationResult = {
    isValid: true,
    issues: [],
    warnings: [],
    suggestions: []
  };

  console.log('🔍 가이드 생성 전 검증 시작:', {
    위치명: locationName,
    언어: language,
    상위지역: parentRegion,
    지역컨텍스트: regionalContext
  });

  // 1. 기존 가이드 중복 검사
  await checkForDuplicates(locationName, language, result);

  // 2. 위치명 모호성 검사
  await checkLocationAmbiguity(locationName, parentRegion, result);

  // 3. 정적 데이터 매칭 검증
  await validateStaticDataMatching(locationName, parentRegion, result);

  // 4. 지역 컨텍스트 일치성 검사
  validateRegionalContext(locationName, parentRegion, regionalContext, result);

  // 5. 최종 검증 결과
  result.isValid = result.issues.filter(issue => issue.type === 'critical').length === 0;

  console.log('✅ 가이드 생성 전 검증 완료:', {
    유효성: result.isValid,
    이슈수: result.issues.length,
    경고수: result.warnings.length
  });

  return result;
}

/**
 * 가이드 생성 후 내용 검증
 */
export async function validateGuideContent(
  locationName: string,
  language: string,
  content: any,
  parentRegion?: string
): Promise<GuideValidationResult> {
  const result: GuideValidationResult = {
    isValid: true,
    issues: [],
    warnings: [],
    suggestions: []
  };

  console.log('🔍 가이드 내용 검증 시작:', { 위치명: locationName, 언어: language });

  // 1. 제목-내용 일치성 검사
  validateTitleContentConsistency(locationName, content, parentRegion, result);

  // 2. 지리적 정확성 검사
  await validateGeographicalAccuracy(locationName, content, parentRegion, result);

  // 3. 내용 품질 검사
  validateContentQuality(content, result);

  // 4. 좌표 정확성 검사
  validateCoordinateAccuracy(locationName, content, result);

  result.isValid = result.issues.filter(issue => issue.type === 'critical').length === 0;

  console.log('✅ 가이드 내용 검증 완료:', {
    유효성: result.isValid,
    이슈수: result.issues.length
  });

  return result;
}

/**
 * 기존 가이드 중복 검사
 */
async function checkForDuplicates(
  locationName: string,
  language: string,
  result: GuideValidationResult
): Promise<void> {
  try {
    const { data: existingGuides, error } = await supabase
      .from('guides')
      .select('locationname, language, created_at')
      .eq('locationname', locationName.toLowerCase())
      .eq('language', language.toLowerCase());

    if (error) {
      result.warnings.push({
        type: 'data_inconsistency',
        description: '기존 가이드 검색 중 오류 발생',
        impact: 'medium'
      });
      return;
    }

    if (existingGuides && existingGuides.length > 0) {
      result.issues.push({
        type: 'major',
        category: 'duplicate',
        description: `이미 "${locationName}" 가이드가 존재합니다 (${existingGuides.length}개)`,
        suggestedFix: '기존 가이드를 업데이트하거나 삭제 후 재생성'
      });

      result.warnings.push({
        type: 'potential_duplicate',
        description: '중복 가이드 생성으로 인한 데이터 불일치 위험',
        impact: 'high'
      });
    }
  } catch (error) {
    console.error('중복 검사 오류:', error);
  }
}

/**
 * 위치명 모호성 검사
 */
async function checkLocationAmbiguity(
  locationName: string,
  parentRegion: string | undefined,
  result: GuideValidationResult
): Promise<void> {
  // 동일 이름의 다른 지역 명소가 있는지 확인
  const ambiguousNames = [
    '대왕궁', '붉은요새', '타지마할', '콜로세움', '에펠탑'
  ];

  if (ambiguousNames.includes(locationName) && !parentRegion) {
    result.issues.push({
      type: 'critical',
      category: 'location_conflict',
      description: `"${locationName}"은 여러 지역에 존재할 수 있는 명소입니다`,
      suggestedFix: '상위 지역(parentRegion)을 명시하여 구체화 필요'
    });

    result.suggestions.push(
      `"${locationName}" 대신 "지역명 + ${locationName}" 형태로 구체화하세요`
    );
  }

  // 정적 데이터에서 지역 특정이 필요한지 확인
  const classification = classifyLocationByStaticData(locationName);
  if (classification.requiresRegionalContext && !parentRegion) {
    result.warnings.push({
      type: 'data_inconsistency',
      description: '지역 컨텍스트가 필요한 위치이지만 제공되지 않음',
      impact: 'medium'
    });
  }
}

/**
 * 정적 데이터 매칭 검증
 */
async function validateStaticDataMatching(
  locationName: string,
  parentRegion: string | undefined,
  result: GuideValidationResult
): Promise<void> {
  const classification = classifyLocationByStaticData(locationName);
  
  if (classification.found && classification.data) {
    const staticData = classification.data;
    
    // 상위 지역 일치성 검사
    if (parentRegion && staticData.parent && staticData.parent !== parentRegion) {
      result.warnings.push({
        type: 'data_inconsistency',
        description: `상위 지역 불일치: 정적데이터(${staticData.parent}) vs 입력(${parentRegion})`,
        impact: 'medium'
      });
      
      result.suggestions.push(
        `정적 데이터에 따르면 "${locationName}"의 상위 지역은 "${staticData.parent}"입니다`
      );
    }

    // 국가 정보 검증
    if (staticData.country) {
      result.suggestions.push(
        `이 가이드는 ${staticData.country}의 ${staticData.parent || ''}에 위치한 명소입니다`
      );
    }
  }
}

/**
 * 지역 컨텍스트 일치성 검사
 */
function validateRegionalContext(
  locationName: string,
  parentRegion: string | undefined,
  regionalContext: any,
  result: GuideValidationResult
): void {
  if (!regionalContext) return;

  // 지역 컨텍스트 내부 일치성 검사
  if (regionalContext.parentRegion && parentRegion) {
    if (regionalContext.parentRegion !== parentRegion) {
      result.warnings.push({
        type: 'data_inconsistency',
        description: 'URL parentRegion과 regionalContext.parentRegion 불일치',
        impact: 'medium'
      });
    }
  }

  // spotName 검증
  if (regionalContext.spotName && regionalContext.spotName !== locationName) {
    result.warnings.push({
      type: 'data_inconsistency',
      description: `SpotName 불일치: ${regionalContext.spotName} vs ${locationName}`,
      impact: 'low'
    });
  }
}

/**
 * 제목-내용 일치성 검사
 */
function validateTitleContentConsistency(
  locationName: string,
  content: any,
  parentRegion: string | undefined,
  result: GuideValidationResult
): void {
  if (!content || !content.overview) return;

  const title = content.overview.title;
  const steps = content.route?.steps || [];

  // 제목 일치성 검사
  if (title && title !== locationName) {
    // 허용되는 차이인지 확인 (예: "방콕 대왕궁" vs "대왕궁")
    const isAcceptableDifference = 
      (parentRegion && title === `${parentRegion} ${locationName}`) ||
      (parentRegion && title === locationName && locationName.includes(parentRegion));

    if (!isAcceptableDifference) {
      result.issues.push({
        type: 'major',
        category: 'content_mismatch',
        description: `제목 불일치: 요청(${locationName}) vs 생성(${title})`,
        field: 'title',
        suggestedFix: '가이드 재생성 또는 제목 수정 필요'
      });
    }
  }

  // 경로 단계와 위치 일치성 검사
  if (steps.length > 0) {
    const firstStep = steps[0];
    const hasLocationInSteps = steps.some(step => 
      step.title?.includes(locationName) || 
      step.location?.includes(locationName)
    );

    if (!hasLocationInSteps && !firstStep.title?.includes(locationName)) {
      result.warnings.push({
        type: 'quality_concern',
        description: '가이드 경로에 해당 위치명이 포함되지 않음',
        impact: 'medium'
      });
    }
  }
}

/**
 * 지리적 정확성 검사
 */
async function validateGeographicalAccuracy(
  locationName: string,
  content: any,
  parentRegion: string | undefined,
  result: GuideValidationResult
): Promise<void> {
  // 알려진 잘못된 조합 검사
  const knownMismatches = {
    '대왕궁': {
      correctRegion: '방콕',
      incorrectContent: ['광화문', '근정전', '경복궁'],
      correctContent: ['와트프라깨우', '차크리마하프라삿', '두싯마하프라삿']
    },
    '붉은요새': {
      correctRegion: '델리',
      incorrectContent: ['창덕궁', '경복궁'],
      correctContent: ['라호리게이트', '델리게이트']
    }
  };

  const mismatchInfo = knownMismatches[locationName];
  if (mismatchInfo) {
    const contentStr = JSON.stringify(content).toLowerCase();
    
    // 잘못된 내용 검사
    const hasIncorrectContent = mismatchInfo.incorrectContent.some(incorrect => 
      contentStr.includes(incorrect.toLowerCase())
    );

    if (hasIncorrectContent) {
      result.issues.push({
        type: 'critical',
        category: 'content_mismatch',
        description: `${locationName}에 다른 장소의 내용이 포함됨`,
        suggestedFix: '가이드 전체 재생성 필요'
      });
    }

    // 올바른 지역 정보 제안
    if (parentRegion !== mismatchInfo.correctRegion) {
      result.suggestions.push(
        `${locationName}은 ${mismatchInfo.correctRegion}에 위치한 명소입니다`
      );
    }
  }
}

/**
 * 내용 품질 검사
 */
function validateContentQuality(content: any, result: GuideValidationResult): void {
  if (!content) {
    result.issues.push({
      type: 'critical',
      category: 'quality',
      description: '가이드 내용이 비어있음',
      suggestedFix: '가이드 재생성 필요'
    });
    return;
  }

  // 필수 섹션 검사
  const requiredSections = ['overview', 'route'];
  requiredSections.forEach(section => {
    if (!content[section]) {
      result.issues.push({
        type: 'major',
        category: 'quality',
        description: `필수 섹션 누락: ${section}`,
        field: section,
        suggestedFix: `${section} 섹션 추가 필요`
      });
    }
  });

  // 경로 단계 검사
  if (content.route && (!content.route.steps || content.route.steps.length === 0)) {
    result.warnings.push({
      type: 'quality_concern',
      description: '가이드 경로에 단계가 없음',
      impact: 'medium'
    });
  }
}

/**
 * 좌표 정확성 검사
 */
function validateCoordinateAccuracy(
  locationName: string,
  content: any,
  result: GuideValidationResult
): void {
  if (!content.overview?.coordinates) return;

  const { lat, lng } = content.overview.coordinates;

  // 좌표 범위 검사
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    result.issues.push({
      type: 'major',
      category: 'quality',
      description: '좌표 범위 오류',
      field: 'coordinates',
      suggestedFix: '올바른 좌표로 수정 필요'
    });
  }

  // 알려진 위치의 좌표 검증
  const knownLocations = {
    '경복궁': { lat: 37.5759, lng: 126.9767, tolerance: 0.01 },
    '대왕궁': { lat: 13.7500, lng: 100.4915, tolerance: 0.01 } // 방콕 대왕궁
  };

  const known = knownLocations[locationName];
  if (known) {
    const latDiff = Math.abs(lat - known.lat);
    const lngDiff = Math.abs(lng - known.lng);

    if (latDiff > known.tolerance || lngDiff > known.tolerance) {
      result.warnings.push({
        type: 'data_inconsistency',
        description: `좌표가 예상 위치와 다름 (차이: lat ${latDiff.toFixed(4)}, lng ${lngDiff.toFixed(4)})`,
        impact: 'medium'
      });
    }
  }
}

/**
 * 검증 결과 리포트 생성
 */
export function generateValidationReport(result: GuideValidationResult): string {
  let report = `\n🔍 가이드 검증 보고서\n`;
  report += `전체 검증 결과: ${result.isValid ? '✅ 통과' : '❌ 실패'}\n\n`;

  if (result.issues.length > 0) {
    report += `🚨 발견된 문제 (${result.issues.length}개):\n`;
    result.issues.forEach((issue, i) => {
      report += `${i + 1}. [${issue.type.toUpperCase()}] ${issue.description}\n`;
      if (issue.suggestedFix) {
        report += `   💡 해결방법: ${issue.suggestedFix}\n`;
      }
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += `⚠️ 경고사항 (${result.warnings.length}개):\n`;
    result.warnings.forEach((warning, i) => {
      report += `${i + 1}. [${warning.impact.toUpperCase()}] ${warning.description}\n`;
    });
    report += '\n';
  }

  if (result.suggestions.length > 0) {
    report += `💡 제안사항:\n`;
    result.suggestions.forEach((suggestion, i) => {
      report += `${i + 1}. ${suggestion}\n`;
    });
  }

  return report;
}
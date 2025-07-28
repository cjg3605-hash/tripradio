// 정확성 검증 시스템 - AI 응답 후처리 검증
import { UserProfile } from '@/types/guide';

/**
 * 🚨 금지된 패턴 탐지 시스템
 */
const PROHIBITED_PATTERNS = {
  // 구체적 업체명 패턴
  SPECIFIC_BUSINESS_NAMES: [
    /\w+서점/g,
    /\w+카페/g, 
    /\w+레스토랑/g,
    /\w+식당/g,
    /\w+빵집/g,
    /\w+호텔/g,
    /\w+마트/g,
    /\w+매장/g,
    /\w+점/g, // "OO점" 형태
    /유명한\s+\w+/g,
    /인기\s+있는\s+\w+/g,
    /맛있는\s+\w+/g,
  ],

  // 과장된 표현 패턴
  EXAGGERATED_EXPRESSIONS: [
    /최고의/g,
    /최대\s*규모/g,
    /가장\s*유명한/g,
    /세계\s*최초/g,
    /\d+여?\s*개의?\s*상점/g,
    /수백\s*명?/g,
    /수천\s*명?/g,
    /\d+%\s*만족도/g,
    /평점\s*\d+\.?\d*/g,
  ],

  // 추측성 표현 패턴
  SPECULATIVE_EXPRESSIONS: [
    /아마도/g,
    /추정됩니다/g,
    /것으로\s*보입니다/g,
    /것\s*같습니다/g,
    /인\s*듯합니다/g,
    /로\s*여겨집니다/g,
    /로\s*추정됩니다/g,
    /전해져\s*내려오는/g,
    /소문에\s*의하면/g,
    /알려져\s*있는/g,
  ],

  // 확인되지 않은 시설 패턴
  UNVERIFIED_FACILITIES: [
    /문화\s*공연\s*공간/g,
    /야외\s*전시장/g,
    /아트\s*갤러리/g,
    /북카페/g,
    /루프탑\s*바/g,
    /팝업\s*스토어/g,
    /\w+거리/g, // 공식명칭이 아닌 "OO거리"
    /\w+광장/g, // 공식명칭이 아닌 "XX광장"
  ]
};

/**
 * 🔍 AI 응답 정확성 검증 함수
 */
export function validateAccuracy(aiResponse: any, location: string): {
  isValid: boolean;
  violations: string[];
  cleanedResponse?: any;
  riskScore: number;
} {
  const violations: string[] = [];
  let riskScore = 0;

  // JSON 파싱 검증
  if (!aiResponse || typeof aiResponse !== 'object') {
    return {
      isValid: false,
      violations: ['Invalid JSON response format'],
      riskScore: 1.0
    };
  }

  // 텍스트 컨텐츠 추출
  const textContent = JSON.stringify(aiResponse);

  // 1. 구체적 업체명 검증
  PROHIBITED_PATTERNS.SPECIFIC_BUSINESS_NAMES.forEach((pattern, index) => {
    const matches = textContent.match(pattern);
    if (matches) {
      violations.push(`구체적 업체명 발견: ${matches.join(', ')}`);
      riskScore += 0.3; // 높은 위험도
    }
  });

  // 2. 과장된 표현 검증
  PROHIBITED_PATTERNS.EXAGGERATED_EXPRESSIONS.forEach((pattern, index) => {
    const matches = textContent.match(pattern);
    if (matches) {
      violations.push(`과장된 표현 발견: ${matches.join(', ')}`);
      riskScore += 0.2;
    }
  });

  // 3. 추측성 표현 검증
  PROHIBITED_PATTERNS.SPECULATIVE_EXPRESSIONS.forEach((pattern, index) => {
    const matches = textContent.match(pattern);
    if (matches) {
      violations.push(`추측성 표현 발견: ${matches.join(', ')}`);
      riskScore += 0.25;
    }
  });

  // 4. 확인되지 않은 시설 검증
  PROHIBITED_PATTERNS.UNVERIFIED_FACILITIES.forEach((pattern, index) => {
    const matches = textContent.match(pattern);
    if (matches) {
      violations.push(`확인되지 않은 시설 발견: ${matches.join(', ')}`);
      riskScore += 0.2;
    }
  });

  // 5. 좌표 정보 검증
  if (aiResponse.detailedStops) {
    aiResponse.detailedStops.forEach((stop: any, index: number) => {
      if (!stop.coordinates || !stop.coordinates.lat || !stop.coordinates.lng) {
        violations.push(`Stop ${index + 1}: 좌표 정보 누락`);
        riskScore += 0.1;
      }
    });
  }

  // 위험도 정규화 (0-1 범위)
  riskScore = Math.min(riskScore, 1.0);

  const isValid = violations.length === 0 && riskScore < 0.3;

  return {
    isValid,
    violations,
    cleanedResponse: isValid ? aiResponse : undefined,
    riskScore
  };
}

/**
 * 🧹 자동 정제 함수 (경미한 위반사항 자동 수정)
 */
export function sanitizeResponse(aiResponse: any): {
  sanitized: any;
  changes: string[];
} {
  const changes: string[] = [];
  const sanitized = JSON.parse(JSON.stringify(aiResponse)); // Deep clone

  // 텍스트 필드들을 재귀적으로 정제
  function sanitizeText(text: string): string {
    let cleaned = text;

    // 과장된 표현 제거/대체
    cleaned = cleaned.replace(/최고의/g, '훌륭한');
    cleaned = cleaned.replace(/최대\s*규모의?/g, '큰 규모의');
    cleaned = cleaned.replace(/가장\s*유명한/g, '널리 알려진');
    cleaned = cleaned.replace(/세계\s*최초/g, '초기의');

    // 추측성 표현 제거/대체
    cleaned = cleaned.replace(/아마도/g, '일반적으로');
    cleaned = cleaned.replace(/것으로\s*보입니다/g, '것으로 여겨집니다');
    cleaned = cleaned.replace(/추정됩니다/g, '추정할 수 있습니다');

    if (cleaned !== text) {
      changes.push(`텍스트 정제: "${text}" → "${cleaned}"`);
    }

    return cleaned;
  }

  // 재귀적으로 모든 문자열 필드 정제
  function sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return sanitizeText(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = sanitizeObject(value);
      }
      return result;
    }
    return obj;
  }

  const sanitizedResponse = sanitizeObject(sanitized);

  return {
    sanitized: sanitizedResponse,
    changes
  };
}

/**
 * 🔄 재생성 필요성 판단
 */
export function shouldRegenerate(violations: string[], riskScore: number): {
  shouldRegenerate: boolean;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  // 위험도 기반 심각도 판단
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (riskScore >= 0.8) severity = 'critical';
  else if (riskScore >= 0.5) severity = 'high';
  else if (riskScore >= 0.3) severity = 'medium';

  // 구체적 업체명이 포함된 경우 즉시 재생성
  const hasBusinessNames = violations.some(v => v.includes('구체적 업체명'));
  if (hasBusinessNames) {
    return {
      shouldRegenerate: true,
      reason: '구체적 업체명 포함으로 인한 재생성 필요',
      severity: 'critical'
    };
  }

  // 높은 위험도의 경우 재생성
  if (riskScore >= 0.5) {
    return {
      shouldRegenerate: true,
      reason: `높은 위험도 (${(riskScore * 100).toFixed(1)}%)로 인한 재생성 필요`,
      severity
    };
  }

  return {
    shouldRegenerate: false,
    reason: '정제를 통한 사용 가능',
    severity
  };
}

/**
 * 📊 정확성 리포트 생성
 */
export function generateAccuracyReport(
  location: string,
  validationResult: ReturnType<typeof validateAccuracy>,
  sanitizationResult?: ReturnType<typeof sanitizeResponse>
): {
  location: string;
  accuracy: {
    score: number; // 0-1, 1이 완벽
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    violations: string[];
  };
  processing: {
    sanitized: boolean;
    changes: string[];
  };
  recommendation: string;
  timestamp: string;
} {
  const accuracyScore = 1 - validationResult.riskScore;
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  
  if (accuracyScore >= 0.9) grade = 'A';
  else if (accuracyScore >= 0.8) grade = 'B';
  else if (accuracyScore >= 0.7) grade = 'C';
  else if (accuracyScore >= 0.6) grade = 'D';

  let recommendation = '';
  if (grade === 'A') {
    recommendation = '우수한 정확성 - 그대로 사용 가능';
  } else if (grade === 'B' || grade === 'C') {
    recommendation = '경미한 이슈 - 정제 후 사용';
  } else {
    recommendation = '심각한 이슈 - 재생성 권장';
  }

  return {
    location,
    accuracy: {
      score: accuracyScore,
      grade,
      violations: validationResult.violations
    },
    processing: {
      sanitized: !!sanitizationResult,
      changes: sanitizationResult?.changes || []
    },
    recommendation,
    timestamp: new Date().toISOString()
  };
}

/**
 * 🔥 Critical: 외부 데이터와 교차 검증
 */
export function verifyWithExternalData(
  aiResponse: any,
  location: string,
  externalData?: any
): {
  isFactVerified: boolean;
  confidenceScore: number;
  dataSourceCount: number;
  verificationMethod: string;
  conflicts: string[];
} {
  if (!externalData || !externalData.sources || externalData.sources.length === 0) {
    return {
      isFactVerified: false,
      confidenceScore: 0.0,
      dataSourceCount: 0,
      verificationMethod: 'no_external_data',
      conflicts: ['외부 검증 데이터 없음']
    };
  }

  const conflicts: string[] = [];
  let factCheckScore = 0;
  let checkCount = 0;

  // 좌표 정보 검증
  if (aiResponse.detailedStops && externalData.location?.coordinates) {
    aiResponse.detailedStops.forEach((stop: any, index: number) => {
      if (stop.coordinates) {
        const distance = calculateDistance(
          stop.coordinates,
          externalData.location.coordinates
        );
        
        if (distance > 1000) { // 1km 이상 차이
          conflicts.push(`Stop ${index + 1}: 좌표 불일치 (${distance.toFixed(0)}m 차이)`);
        } else {
          factCheckScore++;
        }
        checkCount++;
      }
    });
  }

  // 기본 정보 검증
  if (aiResponse.overview && externalData.basicInfo?.description) {
    const similarityScore = calculateTextSimilarity(
      aiResponse.overview,
      externalData.basicInfo.description
    );
    
    if (similarityScore < 0.3) {
      conflicts.push('개요 정보가 외부 데이터와 상이함');
    } else {
      factCheckScore++;
    }
    checkCount++;
  }

  const finalScore = checkCount > 0 ? factCheckScore / checkCount : 0;

  return {
    isFactVerified: finalScore >= 0.7 && conflicts.length === 0,
    confidenceScore: finalScore,
    dataSourceCount: externalData.sources.length,
    verificationMethod: 'multi_source_cross_reference',
    conflicts
  };
}

function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.lat * Math.PI/180;
  const φ2 = coord2.lat * Math.PI/180;
  const Δφ = (coord2.lat-coord1.lat) * Math.PI/180;
  const Δλ = (coord2.lng-coord1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function calculateTextSimilarity(text1: string, text2: string): number {
  // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 사용 권장)
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

// 기본 export
export default {
  validateAccuracy,
  sanitizeResponse,
  shouldRegenerate,
  generateAccuracyReport,
  verifyWithExternalData
};
/**
 * 자동완성 중복 제거 및 대표 장소 선택 유틸리티
 * 글로벌 서비스 수준의 지능형 중복 제거 알고리즘 구현
 */

export interface Suggestion {
  id?: string;
  name: string;
  location: string;
  score?: number;
  metadata?: {
    isOfficial?: boolean;
    category?: string;
    popularity?: number;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface DeduplicationConfig {
  maxResults?: number;
  similarityThreshold?: number;
  preferOfficialNames?: boolean;
  locationBias?: {
    lat: number;
    lng: number;
  };
}

/**
 * 장소명 정규화 함수
 * 다양한 표현 방식을 통일된 형태로 변환
 */
export function normalizePlaceName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  
  return name
    // 공백 정규화
    .replace(/\s+/g, ' ')
    .trim()
    // 특수문자 제거 (하이픈, 괄호 등)
    .replace(/[-()[\]{}]/g, '')
    // 영어/한글 케이스 정규화
    .toLowerCase()
    // 공통 접미사/접두사 제거
    .replace(/\b(관|궁|성|탑|산|강|섬|역|공항|대학교|대학|교|시|구|동|리)\b/g, '')
    .replace(/\b(temple|palace|castle|tower|mountain|river|island|station|airport|university|college|city|district)\b/gi, '')
    // 관사 제거
    .replace(/\b(the|a|an)\b/gi, '')
    // 최종 공백 정리
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 두 장소명 간의 유사도 계산
 * Levenshtein distance와 semantic similarity 조합
 */
export function calculateSimilarity(name1: string, name2: string): number {
  const normalized1 = normalizePlaceName(name1);
  const normalized2 = normalizePlaceName(name2);
  
  if (normalized1 === normalized2) return 1.0;
  if (!normalized1 || !normalized2) return 0.0;
  
  // Levenshtein distance 기반 유사도
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const similarity = 1 - (distance / maxLength);
  
  // 부분 문자열 매칭 보너스
  const substringBonus = calculateSubstringBonus(normalized1, normalized2);
  
  // 최종 유사도 (가중 평균)
  return Math.min(1.0, similarity * 0.7 + substringBonus * 0.3);
}

/**
 * Levenshtein distance 계산
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * 부분 문자열 매칭 보너스 계산
 */
function calculateSubstringBonus(str1: string, str2: string): number {
  const shorter = str1.length < str2.length ? str1 : str2;
  const longer = str1.length >= str2.length ? str1 : str2;
  
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }
  
  // 공통 부분 문자열 찾기
  let maxCommonLength = 0;
  for (let i = 0; i < shorter.length; i++) {
    for (let j = i + 1; j <= shorter.length; j++) {
      const substring = shorter.substring(i, j);
      if (longer.includes(substring) && substring.length > maxCommonLength) {
        maxCommonLength = substring.length;
      }
    }
  }
  
  return maxCommonLength / Math.max(str1.length, str2.length);
}

/**
 * 공식 장소명 여부 판단
 */
export function isOfficialName(suggestion: Suggestion): boolean {
  if (suggestion.metadata?.isOfficial) return true;
  
  const name = suggestion.name.toLowerCase();
  
  // 공식 키워드 패턴
  const officialPatterns = [
    /national/i,
    /official/i,
    /unesco/i,
    /world heritage/i,
    /국립/,
    /공식/,
    /유네스코/,
    /세계문화유산/
  ];
  
  return officialPatterns.some(pattern => pattern.test(name));
}

/**
 * 그룹 내에서 대표 장소 선택
 */
export function selectRepresentative(candidates: Suggestion[]): Suggestion {
  if (candidates.length === 0) throw new Error('Empty candidates array');
  if (candidates.length === 1) return candidates[0];
  
  // 우선순위 점수 계산
  const scoredCandidates = candidates.map(candidate => ({
    suggestion: candidate,
    score: calculateRepresentativeScore(candidate)
  }));
  
  // 점수 기준 정렬 (내림차순)
  scoredCandidates.sort((a, b) => b.score - a.score);
  
  return scoredCandidates[0].suggestion;
}

/**
 * 대표성 점수 계산
 */
function calculateRepresentativeScore(suggestion: Suggestion): number {
  let score = 0;
  
  // 공식명 보너스 (가장 높은 우선순위)
  if (isOfficialName(suggestion)) {
    score += 1000;
  }
  
  // 인기도 보너스
  if (suggestion.metadata?.popularity) {
    score += suggestion.metadata.popularity * 10;
  }
  
  // 이름 길이 보너스 (적당한 길이 선호)
  const nameLength = suggestion.name.length;
  if (nameLength >= 5 && nameLength <= 20) {
    score += 50;
  } else if (nameLength > 20) {
    score -= (nameLength - 20) * 2; // 너무 긴 이름 페널티
  }
  
  // 위치 정보 완성도 보너스
  if (suggestion.location && suggestion.location.includes(',')) {
    score += 30; // 도시, 국가 형태
  }
  
  // 좌표 정보 보너스
  if (suggestion.metadata?.coordinates) {
    score += 20;
  }
  
  return score;
}

/**
 * 메인 중복 제거 및 대표 장소 선택 함수
 */
export function deduplicateAndSelectRepresentative(
  suggestions: Suggestion[],
  config: DeduplicationConfig = {}
): Suggestion[] {
  const {
    maxResults = 5,
    similarityThreshold = 0.8,
    preferOfficialNames = true,
    locationBias
  } = config;
  
  if (!suggestions || suggestions.length === 0) return [];
  
  // 1. 입력 검증 및 필터링
  const validSuggestions = suggestions.filter(s => 
    s && s.name && s.location && s.name.trim() && s.location.trim()
  );
  
  if (validSuggestions.length === 0) return [];
  
  // 2. 그룹핑 (유사도 기반)
  const groups: Suggestion[][] = [];
  const processed = new Set<number>();
  
  for (let i = 0; i < validSuggestions.length; i++) {
    if (processed.has(i)) continue;
    
    const group = [validSuggestions[i]];
    processed.add(i);
    
    // 유사한 장소들 찾기
    for (let j = i + 1; j < validSuggestions.length; j++) {
      if (processed.has(j)) continue;
      
      const similarity = calculateSimilarity(
        validSuggestions[i].name,
        validSuggestions[j].name
      );
      
      if (similarity >= similarityThreshold) {
        group.push(validSuggestions[j]);
        processed.add(j);
      }
    }
    
    groups.push(group);
  }
  
  // 3. 각 그룹에서 대표 선택
  let representatives = groups.map(group => selectRepresentative(group));
  
  // 4. 위치 기반 편향 적용 (선택사항)
  if (locationBias) {
    representatives = applyLocationBias(representatives, locationBias);
  }
  
  // 5. 최종 결과 제한
  return representatives.slice(0, maxResults);
}

/**
 * 위치 기반 편향 적용
 */
function applyLocationBias(
  suggestions: Suggestion[],
  bias: { lat: number; lng: number }
): Suggestion[] {
  return suggestions
    .map(suggestion => {
      let biasScore = 0;
      
      if (suggestion.metadata?.coordinates) {
        const distance = calculateDistance(
          bias.lat,
          bias.lng,
          suggestion.metadata.coordinates.lat,
          suggestion.metadata.coordinates.lng
        );
        
        // 거리가 가까울수록 높은 점수 (최대 100km 기준)
        biasScore = Math.max(0, 100 - distance) / 100;
      }
      
      return {
        ...suggestion,
        biasScore
      };
    })
    .sort((a, b) => (b.biasScore || 0) - (a.biasScore || 0));
}

/**
 * 두 좌표 간의 거리 계산 (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 디버깅용 정보 제공
 */
export function getDeduplicationDebugInfo(
  originalSuggestions: Suggestion[],
  deduplicatedSuggestions: Suggestion[],
  config: DeduplicationConfig = {}
): {
  originalCount: number;
  deduplicatedCount: number;
  removalRate: number;
  groups: Array<{
    representative: string;
    duplicates: string[];
    similarity: number[];
  }>;
} {
  const { similarityThreshold = 0.8 } = config;
  
  // 그룹 정보 생성
  const groups: Array<{
    representative: string;
    duplicates: string[];
    similarity: number[];
  }> = [];
  
  const processed = new Set<number>();
  
  for (let i = 0; i < originalSuggestions.length; i++) {
    if (processed.has(i)) continue;
    
    const group = [originalSuggestions[i]];
    const similarities: number[] = [];
    processed.add(i);
    
    for (let j = i + 1; j < originalSuggestions.length; j++) {
      if (processed.has(j)) continue;
      
      const similarity = calculateSimilarity(
        originalSuggestions[i].name,
        originalSuggestions[j].name
      );
      
      if (similarity >= similarityThreshold) {
        group.push(originalSuggestions[j]);
        similarities.push(similarity);
        processed.add(j);
      }
    }
    
    if (group.length > 1) {
      const representative = selectRepresentative(group);
      groups.push({
        representative: representative.name,
        duplicates: group.filter(s => s !== representative).map(s => s.name),
        similarity: similarities
      });
    }
  }
  
  return {
    originalCount: originalSuggestions.length,
    deduplicatedCount: deduplicatedSuggestions.length,
    removalRate: (originalSuggestions.length - deduplicatedSuggestions.length) / originalSuggestions.length,
    groups
  };
}
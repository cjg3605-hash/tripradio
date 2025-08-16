/**
 * 🎯 동명 장소 모호성 해결 시스템
 * 
 * 용궁사, 불국사 등 동일한 이름으로 여러 지역에 존재하는 장소들의
 * 모호성을 해결하고 사용자 의도에 맞는 정확한 위치를 제공합니다.
 */

import { LocationData } from './location-classification';

// 🚨 알려진 동명 장소 매핑 (하드코딩 최소화)
export interface AmbiguousLocation {
  name: string;
  candidates: LocationCandidate[];
  defaultChoice?: string; // 가장 인기 있는 기본 선택
}

export interface LocationCandidate {
  id: string;
  displayName: string;
  region: string;
  country: string;
  description: string;
  popularityScore: number; // 1-10 (높을수록 인기)
  keywords: string[]; // 구분하는 키워드들
  coordinates?: { lat: number; lng: number };
  aliases: string[];
}

// 🎯 주요 동명 장소 데이터베이스
export const AMBIGUOUS_LOCATIONS: { [key: string]: AmbiguousLocation } = {
  "용궁사": {
    name: "용궁사",
    defaultChoice: "busan-yonggunsa",
    candidates: [
      {
        id: "busan-yonggunsa",
        displayName: "해동 용궁사",
        region: "부산",
        country: "한국",
        description: "바닷가 절벽에 위치한 유명 관광지, 일출 명소",
        popularityScore: 9,
        keywords: ["해동", "바다", "일출", "관광", "부산", "기장"],
        coordinates: { lat: 35.1881, lng: 129.2233 },
        aliases: ["해동용궁사", "해동 용궁사", "부산 용궁사"]
      },
      {
        id: "gyeongju-yonggunsa",
        displayName: "경주 용궁사",
        region: "경주",
        country: "한국", 
        description: "신라 시대 역사적 사찰, 문화재",
        popularityScore: 6,
        keywords: ["경주", "역사", "신라", "문화재", "유적"],
        coordinates: { lat: 35.8468, lng: 129.2081 },
        aliases: ["경주 용궁사"]
      }
    ]
  },
  
  "불국사": {
    name: "불국사",
    defaultChoice: "gyeongju-bulguksa",
    candidates: [
      {
        id: "gyeongju-bulguksa",
        displayName: "경주 불국사",
        region: "경주",
        country: "한국",
        description: "유네스코 세계문화유산, 석가탑과 다보탑으로 유명",
        popularityScore: 10,
        keywords: ["경주", "세계문화유산", "석가탑", "다보탑", "유네스코"],
        coordinates: { lat: 35.7900, lng: 129.3320 },
        aliases: ["불국사", "Bulguksa", "佛國寺"]
      }
      // 다른 불국사가 있다면 여기에 추가
    ]
  },

  "명동": {
    name: "명동",
    defaultChoice: "seoul-myeongdong",
    candidates: [
      {
        id: "seoul-myeongdong",
        displayName: "서울 명동",
        region: "서울",
        country: "한국",
        description: "서울 대표 쇼핑가, 관광 명소",
        popularityScore: 10,
        keywords: ["서울", "쇼핑", "관광", "중구", "명동성당"],
        coordinates: { lat: 37.5636, lng: 126.9866 },
        aliases: ["명동", "서울 명동", "Myeongdong"]
      }
      // 다른 지역의 명동이 있다면 추가
    ]
  }
};

/**
 * 🔍 장소명이 모호한지 확인
 */
export function isAmbiguousLocation(locationName: string): boolean {
  const normalizedName = locationName.toLowerCase().trim();
  
  // 직접 매칭 확인
  if (AMBIGUOUS_LOCATIONS[normalizedName]) {
    return true;
  }
  
  // alias 확인
  for (const ambiguous of Object.values(AMBIGUOUS_LOCATIONS)) {
    for (const candidate of ambiguous.candidates) {
      if (candidate.aliases.some(alias => 
        alias.toLowerCase() === normalizedName
      )) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 🎯 모호한 장소의 후보들 반환
 */
export function getLocationCandidates(locationName: string): LocationCandidate[] {
  const normalizedName = locationName.toLowerCase().trim();
  
  // 직접 매칭
  const directMatch = AMBIGUOUS_LOCATIONS[normalizedName];
  if (directMatch) {
    return directMatch.candidates.sort((a, b) => b.popularityScore - a.popularityScore);
  }
  
  // alias 매칭
  for (const ambiguous of Object.values(AMBIGUOUS_LOCATIONS)) {
    for (const candidate of ambiguous.candidates) {
      if (candidate.aliases.some(alias => 
        alias.toLowerCase().includes(normalizedName) || 
        normalizedName.includes(alias.toLowerCase())
      )) {
        return ambiguous.candidates.sort((a, b) => b.popularityScore - a.popularityScore);
      }
    }
  }
  
  return [];
}

/**
 * 🤖 컨텍스트 기반 자동 해결 시도
 */
export function resolveLocationWithContext(
  locationName: string, 
  context?: string
): LocationCandidate | null {
  
  const candidates = getLocationCandidates(locationName);
  if (candidates.length === 0) {
    return null;
  }
  
  // 컨텍스트가 없으면 기본 선택 (가장 인기 있는 것)
  if (!context) {
    return candidates[0]; // 이미 popularityScore로 정렬됨
  }
  
  const contextLower = context.toLowerCase();
  
  // 컨텍스트 키워드 매칭 점수 계산
  const scoredCandidates = candidates.map(candidate => {
    let contextScore = 0;
    
    // 키워드 매칭
    for (const keyword of candidate.keywords) {
      if (contextLower.includes(keyword.toLowerCase())) {
        contextScore += 2;
      }
    }
    
    // 지역명 매칭
    if (contextLower.includes(candidate.region.toLowerCase())) {
      contextScore += 5;
    }
    
    // alias 매칭
    for (const alias of candidate.aliases) {
      if (contextLower.includes(alias.toLowerCase())) {
        contextScore += 3;
      }
    }
    
    return {
      ...candidate,
      contextScore: contextScore + candidate.popularityScore * 0.1 // 인기도도 약간 반영
    };
  });
  
  // 컨텍스트 점수로 정렬
  scoredCandidates.sort((a, b) => b.contextScore - a.contextScore);
  
  // 컨텍스트 매칭이 있으면 반환, 없으면 기본 선택
  return scoredCandidates[0].contextScore > 0 ? scoredCandidates[0] : candidates[0];
}

/**
 * 🔧 사용자 검색어에서 컨텍스트 추출
 */
export function extractContextFromQuery(query: string): string {
  // "부산 용궁사", "경주 불국사" 등에서 지역 정보 추출
  const regionKeywords = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
    '경주', '안동', '포항', '창원', '진주', '통영', '사천', '김해', '양산',
    '기장', '해운대', '중구', '동구', '서구', '남구', '북구', '수영구', '사상구'
  ];
  
  const queryLower = query.toLowerCase();
  for (const region of regionKeywords) {
    if (queryLower.includes(region.toLowerCase())) {
      return region;
    }
  }
  
  return '';
}

/**
 * 📊 모호성 해결 통계
 */
export interface AmbiguityResolutionStats {
  totalQueries: number;
  ambiguousQueries: number;
  autoResolved: number;
  userChoiceRequired: number;
  resolutionRate: number;
}

// 간단한 메모리 통계 (실제 운영에서는 DB에 저장)
let stats: AmbiguityResolutionStats = {
  totalQueries: 0,
  ambiguousQueries: 0,
  autoResolved: 0,
  userChoiceRequired: 0,
  resolutionRate: 0
};

export function recordResolution(wasAmbiguous: boolean, wasAutoResolved: boolean) {
  stats.totalQueries++;
  if (wasAmbiguous) {
    stats.ambiguousQueries++;
    if (wasAutoResolved) {
      stats.autoResolved++;
    } else {
      stats.userChoiceRequired++;
    }
  }
  
  stats.resolutionRate = stats.ambiguousQueries > 0 
    ? (stats.autoResolved / stats.ambiguousQueries) * 100 
    : 100;
}

export function getResolutionStats(): AmbiguityResolutionStats {
  return { ...stats };
}

/**
 * 🎨 사용자 친화적 후보 표시용 데이터 변환
 */
export function formatCandidatesForUI(candidates: LocationCandidate[]) {
  return candidates.map(candidate => ({
    id: candidate.id,
    title: candidate.displayName,
    subtitle: `${candidate.region}, ${candidate.country}`,
    description: candidate.description,
    popularity: candidate.popularityScore,
    icon: getLocationIcon(candidate),
    coordinates: candidate.coordinates
  }));
}

function getLocationIcon(candidate: LocationCandidate): string {
  // 키워드 기반 아이콘 선택
  if (candidate.keywords.includes('바다')) return '🌊';
  if (candidate.keywords.includes('역사')) return '🏛️';
  if (candidate.keywords.includes('쇼핑')) return '🛍️';
  if (candidate.keywords.includes('세계문화유산')) return '🏮';
  if (candidate.keywords.includes('관광')) return '📍';
  return '🗺️';
}
/**
 * 🔍 향상된 검색 시스템 - 지역 컨텍스트 기반
 */

import { LocationContext } from '@/lib/coordinates/coordinate-utils';

export interface SearchCandidate {
  id: string;
  name: string;
  location: string;
  region: string | null;
  country_code: string | null;
  language: string;
  similarity_score: number;
  coordinates?: { lat: number; lng: number }[];
  popularity?: number;
  category?: string;
}

export interface SearchFilters {
  country?: string;
  region?: string;
  language?: string;
  category?: string;
  includeNearby?: boolean;
}

/**
 * 🌍 지역 컨텍스트 기반 스마트 검색
 */
export async function enhancedLocationSearch(
  query: string, 
  filters?: SearchFilters,
  userLocation?: { lat: number; lng: number }
): Promise<SearchCandidate[]> {
  
  // 1. 데이터베이스에서 후보 검색
  const candidates = await searchDatabaseCandidates(query, filters);
  
  // 2. 지역별 그룹화
  const groupedByRegion = groupCandidatesByRegion(candidates);
  
  // 3. 사용자 위치 기반 우선순위
  if (userLocation) {
    return prioritizeByUserLocation(groupedByRegion, userLocation);
  }
  
  // 4. 인기도/정확도 기반 정렬
  return prioritizeByRelevance(groupedByRegion);
}

/**
 * 📍 지역별 후보 그룹화
 */
function groupCandidatesByRegion(candidates: SearchCandidate[]): Map<string, SearchCandidate[]> {
  const groups = new Map<string, SearchCandidate[]>();
  
  candidates.forEach(candidate => {
    const regionKey = `${candidate.region || 'Unknown'}, ${candidate.country_code || 'XX'}`;
    if (!groups.has(regionKey)) {
      groups.set(regionKey, []);
    }
    groups.get(regionKey)!.push(candidate);
  });
  
  return groups;
}

/**
 * 🎯 사용자 위치 기반 우선순위
 */
function prioritizeByUserLocation(
  groupedCandidates: Map<string, SearchCandidate[]>, 
  userLocation: { lat: number; lng: number }
): SearchCandidate[] {
  const prioritized: SearchCandidate[] = [];
  
  // 각 지역별로 거리 계산
  const regionsWithDistance = Array.from(groupedCandidates.entries())
    .map(([region, candidates]) => {
      const avgDistance = calculateAverageDistance(candidates, userLocation);
      return { region, candidates, distance: avgDistance };
    })
    .sort((a, b) => a.distance - b.distance);
  
  // 거리가 가까운 지역 우선
  regionsWithDistance.forEach(({ candidates }) => {
    prioritized.push(...candidates.sort((a, b) => b.similarity_score - a.similarity_score));
  });
  
  return prioritized;
}

/**
 * 📊 데이터베이스 후보 검색
 */
async function searchDatabaseCandidates(
  query: string, 
  filters?: SearchFilters
): Promise<SearchCandidate[]> {
  
  // Supabase 검색 쿼리 (우리가 구축한 지역 정보 활용)
  const { supabase } = await import('@/lib/supabaseClient');
  
  let searchQuery = supabase
    .from('guides')
    .select('id, locationname, location_region, country_code, language, coordinates')
    .ilike('locationname', `%${query}%`);
  
  // 필터 적용
  if (filters?.country) {
    searchQuery = searchQuery.eq('country_code', filters.country);
  }
  
  if (filters?.region) {
    searchQuery = searchQuery.ilike('location_region', `%${filters.region}%`);
  }
  
  if (filters?.language) {
    searchQuery = searchQuery.eq('language', filters.language);
  }
  
  const { data, error } = await searchQuery.limit(50);
  
  if (error) {
    console.error('검색 오류:', error);
    return [];
  }
  
  // 유사도 점수 계산
  return (data || []).map(item => ({
    id: item.id,
    name: item.locationname,
    location: item.locationname,
    region: item.location_region,
    country_code: item.country_code,
    language: item.language,
    similarity_score: calculateSimilarity(query, item.locationname),
    coordinates: item.coordinates
  }));
}

/**
 * 🔢 문자열 유사도 계산 (Levenshtein 거리 기반)
 */
function calculateSimilarity(query: string, target: string): number {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // 완전 일치
  if (queryLower === targetLower) return 1.0;
  
  // 포함 관계
  if (targetLower.includes(queryLower)) return 0.8;
  if (queryLower.includes(targetLower)) return 0.7;
  
  // Levenshtein 거리 기반 유사도
  const distance = levenshteinDistance(queryLower, targetLower);
  const maxLength = Math.max(queryLower.length, targetLower.length);
  return Math.max(0, 1 - distance / maxLength);
}

/**
 * 📏 Levenshtein 거리 계산
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * 📍 평균 거리 계산
 */
function calculateAverageDistance(
  candidates: SearchCandidate[], 
  userLocation: { lat: number; lng: number }
): number {
  if (candidates.length === 0) return Infinity;
  
  const distances = candidates
    .filter(c => c.coordinates && c.coordinates.length > 0)
    .map(c => {
      const coord = c.coordinates![0];
      return calculateDistance(userLocation, coord);
    });
  
  if (distances.length === 0) return Infinity;
  
  return distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
}

/**
 * 🌍 두 좌표 간 거리 계산 (Haversine 공식)
 */
function calculateDistance(
  pos1: { lat: number; lng: number }, 
  pos2: { lat: number; lng: number }
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * 🏆 관련성 기반 우선순위
 */
function prioritizeByRelevance(groupedCandidates: Map<string, SearchCandidate[]>): SearchCandidate[] {
  const prioritized: SearchCandidate[] = [];
  
  // 지역별 최고 점수 계산
  const regionsWithScore = Array.from(groupedCandidates.entries())
    .map(([region, candidates]) => {
      const maxScore = Math.max(...candidates.map(c => c.similarity_score));
      return { region, candidates, maxScore };
    })
    .sort((a, b) => b.maxScore - a.maxScore);
  
  // 점수가 높은 지역 우선
  regionsWithScore.forEach(({ candidates }) => {
    prioritized.push(...candidates.sort((a, b) => b.similarity_score - a.similarity_score));
  });
  
  return prioritized;
}
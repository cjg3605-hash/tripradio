/**
 * 🎯 단순화된 좌표 검색 유틸리티
 * Geocoding API 직접 활용으로 대폭 단순화
 */

import { searchLocationDirect, GeocodingResult, LocationContext } from './geocoding-direct';

// Re-export LocationContext for external use
export type { LocationContext } from './geocoding-direct';

/**
 * 🌍 지역 컨텍스트 정보
 */
export interface SimpleLocationContext {
  locationName: string;
  region?: string;
  country?: string;
  language?: string;
}

/**
 * 🎯 단순화된 좌표 검색 (3단계만)
 * 1. Geocoding API 직접 검색
 * 2. 검색어 변형으로 재시도  
 * 3. 검색 실패 반환 (null)
 */
export async function findCoordinatesSimple(
  locationName: string,
  context?: SimpleLocationContext
): Promise<{ lat: number; lng: number } | null> {
  
  console.log(`🔍 단순화된 좌표 검색: ${locationName}`);
  console.log(`🌍 컨텍스트:`, {
    region: context?.region,
    country: context?.country,
    language: context?.language
  });

  // 1단계: Geocoding API 직접 검색
  try {
    console.log(`🔍 1단계: Geocoding API 직접 검색`);
    
    const result = await searchLocationDirect(locationName, context as LocationContext);
    
    if (result) {
      console.log(`✅ 1단계 성공: ${result.coordinates.lat}, ${result.coordinates.lng}`);
      return result.coordinates;
    }
  } catch (error) {
    console.log(`❌ 1단계 실패:`, error);
  }

  // 2단계: 검색어 변형으로 재시도
  try {
    console.log(`🔍 2단계: 검색어 변형 재시도`);
    
    const alternativeQueries = generateAlternativeQueries(locationName, context);
    
    for (const query of alternativeQueries) {
      console.log(`  📍 시도: "${query}"`);
      
      const result = await searchLocationDirect(query, context as LocationContext);
      
      if (result) {
        console.log(`✅ 2단계 성공: ${result.coordinates.lat}, ${result.coordinates.lng}`);
        return result.coordinates;
      }
      
      // API 호출 제한을 위한 대기
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.log(`❌ 2단계 실패:`, error);
  }

  // 3단계: 검색 실패 반환
  console.log(`❌ 좌표 검색 실패: ${locationName}`);
  return null;
}

/**
 * 🔄 검색어 변형 생성
 */
function generateAlternativeQueries(
  locationName: string,
  context?: SimpleLocationContext
): string[] {
  const queries: string[] = [];
  
  // 한국어 관련 변형
  if (context?.language === 'ko' || context?.country === 'KR') {
    queries.push(
      `${locationName} 입구`,
      `${locationName} 매표소`,
      `${locationName} 관광지`,
      `${locationName} 명소`
    );
  } else {
    // 영어/해외 관련 변형
    queries.push(
      `${locationName} entrance`,
      `${locationName} main entrance`,
      `${locationName} visitor center`,
      `${locationName} tourist attraction`
    );
  }
  
  return queries;
}

/**
 * 📍 챕터별 좌표 배열 생성
 */
export function generateCoordinatesArray(
  chapters: any[], 
  baseCoordinates: { lat: number; lng: number }
): any[] {
  const coordinatesArray: any[] = [];
  
  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    console.log(`📊 챕터 없음, 빈 배열 반환`);
    return coordinatesArray;
  }
  
  console.log(`📊 ${chapters.length}개 챕터에서 좌표 배열 생성`);
  
  chapters.forEach((chapter: any, index: number) => {
    const offset = index * 0.0005; // 챕터별 약간의 오프셋 (약 50미터)
    const chapterCoords = {
      id: chapter.id !== undefined ? chapter.id : index,
      chapterId: chapter.id !== undefined ? chapter.id : index,
      step: index + 1,
      title: chapter.title || `챕터 ${index + 1}`,
      lat: baseCoordinates.lat + offset,
      lng: baseCoordinates.lng + offset,
      coordinates: {
        lat: baseCoordinates.lat + offset,
        lng: baseCoordinates.lng + offset
      }
    };
    
    coordinatesArray.push(chapterCoords);
    
    console.log(`  ✅ 챕터 ${chapterCoords.step}: "${chapterCoords.title}" → ${chapterCoords.lat}, ${chapterCoords.lng}`);
  });
  
  return coordinatesArray;
}

/**
 * 🔍 content에서 챕터 정보 추출
 */
export function extractChaptersFromContent(content: any): any[] {
  if (!content) {
    console.log(`📊 content 없음`);
    return [];
  }
  
  // 중첩된 content.content.realTimeGuide.chapters 확인 (현재 DB 구조)
  if (content.content?.realTimeGuide?.chapters && Array.isArray(content.content.realTimeGuide.chapters)) {
    console.log(`🔍 중첩 구조에서 ${content.content.realTimeGuide.chapters.length}개 챕터 발견`);
    return content.content.realTimeGuide.chapters.filter((chapter: any) => 
      chapter && 
      (chapter.id !== undefined && chapter.id !== null) && 
      chapter.title && 
      chapter.title.trim()
    );
  }
  
  // realTimeGuide.chapters 우선 확인 (기본 구조)
  if (content.realTimeGuide?.chapters && Array.isArray(content.realTimeGuide.chapters)) {
    console.log(`🔍 기본 구조에서 ${content.realTimeGuide.chapters.length}개 챕터 발견`);
    return content.realTimeGuide.chapters.filter((chapter: any) => 
      chapter && 
      (chapter.id !== undefined && chapter.id !== null) && 
      chapter.title && 
      chapter.title.trim()
    );
  }
  
  console.log(`📊 챕터 구조 찾을 수 없음`);
  return [];
}

/**
 * 🎯 통합 좌표 생성 함수 (단순화된 버전)
 */
export async function generateCompleteCoordinates(
  locationName: string,
  guideData: any,
  context?: SimpleLocationContext
): Promise<{
  baseCoordinates: { lat: number; lng: number } | null;
  coordinatesArray: any[];
  foundMethod: string;
}> {
  console.log(`🎯 통합 좌표 생성 시작: ${locationName}`);
  
  // 1단계: Geocoding API로 기본 좌표 찾기
  const baseCoordinates = await findCoordinatesSimple(locationName, context);
  
  if (!baseCoordinates) {
    console.log(`❌ 기본 좌표 검색 실패: ${locationName}`);
    return {
      baseCoordinates: null,
      coordinatesArray: [],
      foundMethod: '검색 실패'
    };
  }
  
  // 2단계: 챕터 정보 추출
  const chapters = extractChaptersFromContent(guideData);
  
  // 3단계: 챕터별 좌표 배열 생성
  const coordinatesArray = generateCoordinatesArray(chapters, baseCoordinates);
  
  console.log(`✅ 통합 좌표 생성 완료: Geocoding API 직접 검색, ${coordinatesArray.length}개 챕터`);
  
  return {
    baseCoordinates,
    coordinatesArray,
    foundMethod: 'Geocoding API 직접 검색'
  };
}
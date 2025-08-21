/**
 * 🎯 좌표 처리 유틸리티
 * 필요한 기능만 남긴 최적화된 버전
 */

import { OptimizedLocationContext } from '@/types/unified-location';

/**
 * 🌍 지역 컨텍스트 정보 (호환성 유지용)
 */
export interface SimpleLocationContext {
  locationName: string;
  region?: string;
  country?: string;
  language?: string;
}

/**
 * 🌍 위치 컨텍스트 (호환성 유지용)
 */
export interface LocationContext {
  locationName?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  language?: string;
}

/**
 * 🎯 챕터 정보 인터페이스
 */
export interface ChapterInfo {
  id: number;
  title: string;
  location?: string;
  description?: string;
  type?: string;
  narrative?: string;
}

/**
 * 🔍 content에서 챕터 정보 추출 (메인 함수)
 */
export function extractChaptersFromContent(content: any): ChapterInfo[] {
  if (!content) {
    console.log(`📊 content 없음`);
    return [];
  }
  
  // 🏙️ 허브 API 구조: route.steps 지원 (추천여행지)
  if (content.route?.steps && Array.isArray(content.route.steps)) {
    console.log(`🔍 허브 구조(route.steps)에서 ${content.route.steps.length}개 추천지 발견`);
    return content.route.steps
      .filter((step: any) => step && step.location && step.location.trim())
      .map((step: any, index: number) => ({
        id: step.id || index,
        title: step.location, // 허브에서는 step.location이 장소명
        description: step.description || '',
        estimatedTime: step.estimatedTime || '',
        category: step.category || 'attraction'
      }));
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
  
  console.log(`📊 챕터 구조 찾을 수 없음 - 지원 구조: route.steps, realTimeGuide.chapters`);
  return [];
}

/**
 * 📍 챕터별 좌표 배열 생성 (호환성 유지용)
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
 * 🎯 OptimizedLocationContext를 활용한 스마트 기본 챕터 생성 (호환성 유지용)
 */
export function generateSmartChaptersFromContext(
  optimizedContext: OptimizedLocationContext
): ChapterInfo[] {
  console.log(`🤖 OptimizedContext 기반 스마트 챕터 생성: ${optimizedContext.placeName}`);
  
  const smartChapters: ChapterInfo[] = [];
  
  // 1. 입구/메인 에리어
  smartChapters.push({
    id: 0,
    title: optimizedContext.local_context?.entrance_location || `${optimizedContext.placeName} 입구`,
    description: `${optimizedContext.placeName}의 메인 입구`,
    type: 'entrance'
  });
  
  // 2. 주요 관람 구역
  smartChapters.push({
    id: 1,
    title: optimizedContext.local_context?.main_area || `${optimizedContext.placeName} 주요 구역`,
    description: `${optimizedContext.placeName}의 기본 관람 코스`,
    type: 'main_area'
  });
  
  // 3. 특별 관심지점 (있다면)
  if (optimizedContext.local_context?.nearby_attractions) {
    smartChapters.push({
      id: 2,
      title: `${optimizedContext.placeName} 주변 명소`,
      description: `${optimizedContext.placeName} 주변의 다른 관심지점`,
      type: 'nearby_attractions'
    });
  }
  
  // 4. 출구/기념품점 (필요시)
  if (optimizedContext.practical_info?.gift_shop) {
    smartChapters.push({
      id: smartChapters.length,
      title: `${optimizedContext.placeName} 기념품점`,
      description: `방문 기념품 구매 및 출구`,
      type: 'gift_shop'
    });
  }
  
  console.log(`🤖 스마트 챕터 ${smartChapters.length}개 생성:`, smartChapters.map(c => c.title).join(', '));
  return smartChapters;
}
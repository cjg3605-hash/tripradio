/**
 * Chapter Coordinate Extractor
 * AI 생성 가이드에서 챕터별 정확한 좌표 추출 및 검증
 */

import { enhancedLocationService, type EnhancedLocationResult } from '@/lib/location/enhanced-location-utils';
import { enhancedGeocodingService, type LocationValidationResult } from '@/lib/location/enhanced-geocoding-service';
import type { GuideChapter } from '@/types/guide';

export interface ChapterCoordinate {
  chapterId: number;
  title: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy: number;
  confidence: number;
  sources: string[];
  extractionMethod: 'existing' | 'ai_extracted' | 'geocoded' | 'inferred';
  validationStatus: 'verified' | 'estimated' | 'failed';
  alternativeCoordinates?: Array<{
    lat: number;
    lng: number;
    source: string;
    confidence: number;
  }>;
}

export interface ChapterLocationContext {
  baseLocation: string; // 예: "경복궁"
  parentCoordinates: { lat: number; lng: number };
  radiusKm: number;
  knownPois: Array<{
    name: string;
    lat: number;
    lng: number;
    type: string;
  }>;
}

/**
 * 챕터별 좌표 추출 및 검증 시스템
 */
export class ChapterCoordinateExtractor {
  private cache = new Map<string, ChapterCoordinate[]>();
  private locationPatterns = {
    // 위치 패턴 매칭 정규식
    directLocation: /(?:위치|지점|장소)[:：]\s*(.+?)(?:\n|$|[,，])/gi,
    coordinates: /(\d{1,2}\.\d{4,8})[,，\s]+(\d{2,3}\.\d{4,8})/g,
    nearbyMarkers: /(근처|옆|앞|뒤|좌|우|동쪽|서쪽|남쪽|북쪽)(?:의|에)\s*(.+?)(?:\n|$|[,，])/gi,
    specificBuildings: /(전|당|각|문|루|정|원|관|터|묘|탑|석|비|상)(?:$|\s|에서|에|의)/g
  };

  /**
   * 챕터 배열에서 모든 좌표 추출 및 검증
   */
  async extractChapterCoordinates(
    chapters: GuideChapter[],
    context: ChapterLocationContext
  ): Promise<ChapterCoordinate[]> {
    console.log(`🗺️ Starting coordinate extraction for ${chapters.length} chapters`);
    
    const results: ChapterCoordinate[] = [];
    
    for (const chapter of chapters) {
      try {
        const coordinate = await this.extractSingleChapterCoordinate(chapter, context);
        results.push(coordinate);
        
        console.log(`✅ Chapter ${chapter.id}: ${coordinate.validationStatus} - ${coordinate.extractionMethod}`);
      } catch (error) {
        console.error(`❌ Failed to extract coordinates for chapter ${chapter.id}:`, error);
        
        // 실패 시 기본 좌표 생성
        results.push({
          chapterId: chapter.id,
          title: chapter.title,
          coordinates: context.parentCoordinates,
          accuracy: 0.3,
          confidence: 0.2,
          sources: ['fallback'],
          extractionMethod: 'inferred',
          validationStatus: 'failed'
        });
      }
    }
    
    // 결과 보정 및 최적화
    return this.optimizeChapterCoordinates(results, context);
  }

  /**
   * 단일 챕터 좌표 추출
   */
  private async extractSingleChapterCoordinate(
    chapter: GuideChapter,
    context: ChapterLocationContext
  ): Promise<ChapterCoordinate> {
    // Step 1: 기존 좌표 확인
    const existingCoords = this.extractExistingCoordinates(chapter);
    if (existingCoords) {
      const validation = await this.validateCoordinates(existingCoords, context);
      if (validation.isValid) {
        return {
          chapterId: chapter.id,
          title: chapter.title,
          coordinates: existingCoords,
          accuracy: 0.9,
          confidence: 0.85,
          sources: ['existing_data'],
          extractionMethod: 'existing',
          validationStatus: 'verified'
        };
      }
    }

    // Step 2: AI 텍스트에서 위치 정보 추출
    const extractedLocation = this.extractLocationFromText(chapter);
    if (extractedLocation) {
      try {
        const locationResult = await enhancedLocationService.findLocation(
          `${context.baseLocation} ${extractedLocation}`,
          { preferStatic: false, language: 'ko' }
        );

        // 컨텍스트 반경 내 검증
        if (this.isWithinContext(locationResult.center, context)) {
          return {
            chapterId: chapter.id,
            title: chapter.title,
            coordinates: {
              lat: locationResult.center.lat,
              lng: locationResult.center.lng
            },
            accuracy: locationResult.center.accuracy,
            confidence: locationResult.center.confidence,
            sources: locationResult.center.sources,
            extractionMethod: 'ai_extracted',
            validationStatus: 'verified'
          };
        }
      } catch (error) {
        console.warn(`Location extraction failed for: ${extractedLocation}`, error);
      }
    }

    // Step 3: 제목 기반 지오코딩
    try {
      const titleLocation = await this.geocodeChapterTitle(chapter.title, context);
      if (titleLocation && this.isWithinContext(titleLocation.coordinates, context)) {
        return {
          chapterId: chapter.id,
          title: chapter.title,
          coordinates: titleLocation.coordinates,
          accuracy: titleLocation.accuracy,
          confidence: titleLocation.confidence,
          sources: titleLocation.sources,
          extractionMethod: 'geocoded',
          validationStatus: 'verified'
        };
      }
    } catch (error) {
      console.warn(`Geocoding failed for chapter: ${chapter.title}`, error);
    }

    // Step 4: 추론 기반 좌표 생성
    return this.inferChapterCoordinate(chapter, context);
  }

  /**
   * 기존 좌표 데이터 추출
   */
  private extractExistingCoordinates(chapter: GuideChapter): { lat: number; lng: number } | null {
    // 우선순위: location > lat/lng > latitude/longitude > coordinates
    if (chapter.location?.lat && chapter.location?.lng) {
      return chapter.location;
    }
    
    if (chapter.lat && chapter.lng) {
      return { lat: chapter.lat, lng: chapter.lng };
    }
    
    if (chapter.latitude && chapter.longitude) {
      return { lat: chapter.latitude, lng: chapter.longitude };
    }
    
    if (chapter.coordinates?.lat && chapter.coordinates?.lng) {
      return chapter.coordinates;
    }
    
    return null;
  }

  /**
   * 텍스트에서 위치 정보 추출
   */
  private extractLocationFromText(chapter: GuideChapter): string | null {
    const textSources = [
      chapter.narrative,
      chapter.content,
      chapter.description,
      chapter.sceneDescription,
      chapter.coreNarrative
    ].filter(Boolean);

    for (const text of textSources) {
      if (!text) continue;

      // 직접적인 위치 언급 찾기
      const directMatches = Array.from(text.matchAll(this.locationPatterns.directLocation));
      if (directMatches.length > 0) {
        return directMatches[0][1].trim();
      }

      // 건물명 패턴 매칭
      const buildingMatches = Array.from(text.matchAll(this.locationPatterns.specificBuildings));
      if (buildingMatches.length > 0) {
        // 가장 구체적인 건물명 반환
        const buildings = buildingMatches.map(m => m[0]).sort((a, b) => b.length - a.length);
        return buildings[0];
      }
    }

    return null;
  }

  /**
   * 챕터 제목 기반 지오코딩
   */
  private async geocodeChapterTitle(
    title: string,
    context: ChapterLocationContext
  ): Promise<LocationValidationResult | null> {
    try {
      // 제목에서 위치 관련 키워드 추출
      const cleanTitle = title.replace(/^\d+\.\s*/, '').trim(); // 숫자 제거
      const searchQuery = `${context.baseLocation} ${cleanTitle}`;
      
      return await enhancedGeocodingService.geocode(searchQuery, {
        language: 'ko',
        bounds: {
          southwest: {
            lat: context.parentCoordinates.lat - 0.01,
            lng: context.parentCoordinates.lng - 0.01
          },
          northeast: {
            lat: context.parentCoordinates.lat + 0.01,
            lng: context.parentCoordinates.lng + 0.01
          }
        }
      });
    } catch (error) {
      console.warn(`Geocoding failed for title: ${title}`, error);
      return null;
    }
  }

  /**
   * 추론 기반 좌표 생성
   */
  private inferChapterCoordinate(
    chapter: GuideChapter,
    context: ChapterLocationContext
  ): ChapterCoordinate {
    // POI 매칭 시도
    const matchedPoi = this.findMatchingPoi(chapter.title, context.knownPois);
    if (matchedPoi) {
      return {
        chapterId: chapter.id,
        title: chapter.title,
        coordinates: { lat: matchedPoi.lat, lng: matchedPoi.lng },
        accuracy: 0.7,
        confidence: 0.6,
        sources: ['poi_matching'],
        extractionMethod: 'inferred',
        validationStatus: 'estimated'
      };
    }

    // 순차적 분산 배치 (챕터 순서 기반)
    const angle = (chapter.id * 30) % 360; // 30도씩 회전
    const distance = 0.001; // 약 100m
    const offsetLat = distance * Math.cos(angle * Math.PI / 180);
    const offsetLng = distance * Math.sin(angle * Math.PI / 180);

    return {
      chapterId: chapter.id,
      title: chapter.title,
      coordinates: {
        lat: context.parentCoordinates.lat + offsetLat,
        lng: context.parentCoordinates.lng + offsetLng
      },
      accuracy: 0.4,
      confidence: 0.3,
      sources: ['sequential_distribution'],
      extractionMethod: 'inferred',
      validationStatus: 'estimated'
    };
  }

  /**
   * 좌표 유효성 검증
   */
  private async validateCoordinates(
    coordinates: { lat: number; lng: number },
    context: ChapterLocationContext
  ): Promise<{ isValid: boolean; distance: number }> {
    const distance = this.calculateDistance(
      coordinates,
      context.parentCoordinates
    );

    return {
      isValid: distance <= context.radiusKm * 1000, // km를 m로 변환
      distance
    };
  }

  /**
   * 컨텍스트 반경 내 위치 확인
   */
  private isWithinContext(
    coordinates: { lat: number; lng: number },
    context: ChapterLocationContext
  ): boolean {
    const distance = this.calculateDistance(coordinates, context.parentCoordinates);
    return distance <= context.radiusKm * 1000;
  }

  /**
   * POI 매칭
   */
  private findMatchingPoi(
    title: string,
    pois: Array<{ name: string; lat: number; lng: number; type: string }>
  ): { lat: number; lng: number } | null {
    const normalizedTitle = title.toLowerCase().replace(/\s+/g, '');
    
    for (const poi of pois) {
      const normalizedPoi = poi.name.toLowerCase().replace(/\s+/g, '');
      if (normalizedTitle.includes(normalizedPoi) || normalizedPoi.includes(normalizedTitle)) {
        return { lat: poi.lat, lng: poi.lng };
      }
    }
    
    return null;
  }

  /**
   * 거리 계산 (Haversine)
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371000; // 지구 반지름 (m)
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * 챕터 좌표 최적화
   */
  private optimizeChapterCoordinates(
    coordinates: ChapterCoordinate[],
    context: ChapterLocationContext
  ): ChapterCoordinate[] {
    // 중복 좌표 분산
    const duplicateGroups = this.groupByCoordinates(coordinates);
    
    for (const group of duplicateGroups) {
      if (group.length > 1) {
        this.distributeOverlappingCoordinates(group);
      }
    }
    
    return coordinates;
  }

  /**
   * 좌표별 그룹핑
   */
  private groupByCoordinates(coordinates: ChapterCoordinate[]): ChapterCoordinate[][] {
    const groups: ChapterCoordinate[][] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < coordinates.length; i++) {
      if (processed.has(i)) continue;
      
      const group = [coordinates[i]];
      processed.add(i);
      
      for (let j = i + 1; j < coordinates.length; j++) {
        if (processed.has(j)) continue;
        
        const distance = this.calculateDistance(
          coordinates[i].coordinates,
          coordinates[j].coordinates
        );
        
        if (distance < 50) { // 50m 이내는 중복으로 간주
          group.push(coordinates[j]);
          processed.add(j);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * 중복 좌표 분산
   */
  private distributeOverlappingCoordinates(group: ChapterCoordinate[]): void {
    const radius = 0.0005; // 약 50m
    
    group.forEach((coord, index) => {
      if (index === 0) return; // 첫 번째는 그대로 유지
      
      const angle = (index * 360 / group.length) * Math.PI / 180;
      const offsetLat = radius * Math.cos(angle);
      const offsetLng = radius * Math.sin(angle);
      
      coord.coordinates.lat += offsetLat;
      coord.coordinates.lng += offsetLng;
      coord.extractionMethod = 'inferred'; // 조정됨을 표시
    });
  }
}

// 싱글톤 인스턴스
export const chapterCoordinateExtractor = new ChapterCoordinateExtractor();
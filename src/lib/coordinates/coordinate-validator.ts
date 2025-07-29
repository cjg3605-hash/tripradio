/**
 * 좌표 품질 검증 시스템
 * 하드코딩 없이 동적으로 좌표 품질을 검증
 */

interface LocationRegion {
  name: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  keywords: string[];
}

// 주요 관광지 지역 정의 (확장 가능)
const KNOWN_REGIONS: LocationRegion[] = [
  {
    name: 'Paris',
    bounds: { minLat: 48.815, maxLat: 48.902, minLng: 2.224, maxLng: 2.469 },
    keywords: ['파리', '에펠탑', 'paris', 'eiffel', '루브르', 'louvre']
  },
  {
    name: 'Seoul',
    bounds: { minLat: 37.413, maxLat: 37.715, minLng: 126.734, maxLng: 127.269 },
    keywords: ['서울', '경복궁', 'seoul', '남산', '강남', '명동']
  },
  {
    name: 'Tokyo',
    bounds: { minLat: 35.528, maxLat: 35.817, minLng: 139.560, maxLng: 139.910 },
    keywords: ['도쿄', '동경', 'tokyo', '시부야', '스카이트리', '아사쿠사']
  },
  {
    name: 'New York',
    bounds: { minLat: 40.477, maxLat: 40.917, minLng: -74.259, maxLng: -73.700 },
    keywords: ['뉴욕', 'new york', 'nyc', '맨해튼', 'manhattan', '자유의여신상']
  },
  {
    name: 'London',
    bounds: { minLat: 51.286, maxLat: 51.685, minLng: -0.510, maxLng: 0.334 },
    keywords: ['런던', 'london', '빅벤', 'big ben', '타워브리지', 'westminster']
  }
];

export class CoordinateValidator {
  /**
   * 좌표가 위치명과 일치하는지 검증
   */
  validateCoordinateForLocation(
    lat: number, 
    lng: number, 
    locationName: string
  ): {
    isValid: boolean;
    confidence: number;
    reason?: string;
    suggestedRegion?: string;
  } {
    // 1. 기본 범위 검증
    if (!this.isValidCoordinateRange(lat, lng)) {
      return {
        isValid: false,
        confidence: 0,
        reason: '좌표가 유효한 범위를 벗어남'
      };
    }

    // 2. 위치명에서 예상 지역 추출
    const expectedRegion = this.findExpectedRegion(locationName);
    
    if (!expectedRegion) {
      // 알려진 지역이 아니면 기본 검증만 통과
      return {
        isValid: true,
        confidence: 0.5,
        reason: '알려지지 않은 지역 - 기본 검증만 수행'
      };
    }

    // 3. 좌표가 예상 지역 내에 있는지 확인
    const isInRegion = this.isCoordinateInRegion(lat, lng, expectedRegion);
    
    if (isInRegion) {
      return {
        isValid: true,
        confidence: 0.9,
        reason: `${expectedRegion.name} 지역 내 좌표 확인`
      };
    }

    // 4. 다른 지역에 속하는지 확인
    const actualRegion = this.findActualRegion(lat, lng);
    
    return {
      isValid: false,
      confidence: 0.1,
      reason: `위치 불일치: ${locationName}이지만 좌표는 ${actualRegion?.name || '알 수 없는 지역'}`,
      suggestedRegion: actualRegion?.name
    };
  }

  /**
   * 여러 좌표의 일관성 검증
   */
  validateCoordinateConsistency(
    coordinates: Array<{ lat: number; lng: number; title: string }>,
    locationName: string
  ): {
    validCoordinates: typeof coordinates;
    invalidCoordinates: typeof coordinates;
    overallQuality: number;
    recommendations: string[];
  } {
    const validCoordinates: typeof coordinates = [];
    const invalidCoordinates: typeof coordinates = [];
    const recommendations: string[] = [];

    for (const coord of coordinates) {
      const validation = this.validateCoordinateForLocation(
        coord.lat, 
        coord.lng, 
        locationName
      );

      if (validation.isValid && validation.confidence > 0.6) {
        validCoordinates.push(coord);
      } else {
        invalidCoordinates.push(coord);
        if (validation.reason) {
          recommendations.push(`${coord.title}: ${validation.reason}`);
        }
      }
    }

    const overallQuality = validCoordinates.length / coordinates.length;

    if (overallQuality < 0.5) {
      recommendations.push('좌표 품질이 낮습니다. AI 생성 좌표를 재검토해주세요.');
    }

    return {
      validCoordinates,
      invalidCoordinates,
      overallQuality,
      recommendations
    };
  }

  private isValidCoordinateRange(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && 
           !isNaN(lat) && !isNaN(lng);
  }

  private findExpectedRegion(locationName: string): LocationRegion | null {
    const normalizedName = locationName.toLowerCase();
    
    return KNOWN_REGIONS.find(region => 
      region.keywords.some(keyword => 
        normalizedName.includes(keyword.toLowerCase())
      )
    ) || null;
  }

  private isCoordinateInRegion(
    lat: number, 
    lng: number, 
    region: LocationRegion
  ): boolean {
    const { bounds } = region;
    return lat >= bounds.minLat && lat <= bounds.maxLat &&
           lng >= bounds.minLng && lng <= bounds.maxLng;
  }

  private findActualRegion(lat: number, lng: number): LocationRegion | null {
    return KNOWN_REGIONS.find(region => 
      this.isCoordinateInRegion(lat, lng, region)
    ) || null;
  }
}

export const coordinateValidator = new CoordinateValidator();
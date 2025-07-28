/**
 * Google Places API Integration Service
 * 구글 플레이스 API 통합 서비스
 */

import { DataSourceError, GooglePlacesData, SourceData, RateLimit } from '../types/data-types';
import { DataSourceCache } from '../cache/data-cache';
import { resilientFetch } from '@/lib/resilient-fetch';

export class GooglePlacesService {
  private static instance: GooglePlacesService;
  private cache: DataSourceCache;
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';
  private rateLimit: RateLimit = {
    requestsPerMinute: 1000,
    requestsPerHour: 100000,
    requestsPerDay: 1000000,
    burstLimit: 50
  };

  private constructor() {
    // 통합된 Google API 키 사용 (우선순위: GOOGLE_API_KEY > GOOGLE_PLACES_API_KEY)
    this.apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ GOOGLE_API_KEY 또는 GOOGLE_PLACES_API_KEY가 설정되지 않았습니다.');
    }

    this.cache = new DataSourceCache({
      ttl: 1800, // 30 minutes
      maxSize: 100 * 1024 * 1024, // 100MB
      strategy: 'lru' as any,
      compression: true
    });
  }

  public static getInstance(): GooglePlacesService {
    if (!GooglePlacesService.instance) {
      GooglePlacesService.instance = new GooglePlacesService();
    }
    return GooglePlacesService.instance;
  }

  /**
   * 텍스트 기반 장소 검색
   */
  async searchPlaces(query: string, location?: { lat: number; lng: number }, radius?: number): Promise<SourceData> {
    const cacheKey = `places:search:${query}:${location?.lat}:${location?.lng}:${radius}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'google_places',
          sourceName: 'Google Places API',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.93,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const searchResults = await this.performTextSearch(query, location, radius);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, searchResults, ['google', 'places', 'search']);

      return {
        sourceId: 'google_places',
        sourceName: 'Google Places API',
        data: searchResults,
        retrievedAt: new Date().toISOString(),
        reliability: 0.93,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Google Places 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'google_places',
        'SEARCH_FAILED',
        { query, location, radius }
      );
    }
  }

  /**
   * 근처 장소 검색
   */
  async searchNearbyPlaces(
    lat: number, 
    lng: number, 
    radius: number = 5000, 
    type?: string
  ): Promise<SourceData> {
    const cacheKey = `places:nearby:${lat}:${lng}:${radius}:${type}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'google_places',
          sourceName: 'Google Places API',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.93,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const nearbyResults = await this.performNearbySearch(lat, lng, radius, type);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, nearbyResults, ['google', 'places', 'nearby']);

      return {
        sourceId: 'google_places',
        sourceName: 'Google Places API',
        data: nearbyResults,
        retrievedAt: new Date().toISOString(),
        reliability: 0.93,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Google Places 근처 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'google_places',
        'NEARBY_SEARCH_FAILED',
        { lat, lng, radius, type }
      );
    }
  }

  /**
   * 장소 세부 정보 조회
   */
  async getPlaceDetails(placeId: string, fields?: string[]): Promise<SourceData> {
    const cacheKey = `places:details:${placeId}:${fields?.join(',')}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'google_places',
          sourceName: 'Google Places API',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.93,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const placeDetails = await this.fetchPlaceDetails(placeId, fields);
      
      // 캐시에 저장 (더 오래 보관)
      await this.cache.set(cacheKey, placeDetails, ['google', 'places', 'details'], 3600); // 1 hour

      return {
        sourceId: 'google_places',
        sourceName: 'Google Places API',
        data: placeDetails,
        retrievedAt: new Date().toISOString(),
        reliability: 0.93,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Google Places 세부정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
        'google_places',
        'DETAILS_FETCH_FAILED',
        { placeId, fields }
      );
    }
  }

  /**
   * 장소 사진 조회
   */
  async getPlacePhotos(photoReference: string, maxWidth: number = 1600): Promise<SourceData> {
    const cacheKey = `places:photo:${photoReference}:${maxWidth}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'google_places',
          sourceName: 'Google Places API',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.93,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const photoUrl = await this.fetchPlacePhoto(photoReference, maxWidth);
      
      // 캐시에 저장 (더 오래 보관)
      await this.cache.set(cacheKey, { photoUrl }, ['google', 'places', 'photo'], 7200); // 2 hours

      return {
        sourceId: 'google_places',
        sourceName: 'Google Places API',
        data: { photoUrl },
        retrievedAt: new Date().toISOString(),
        reliability: 0.93,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Google Places 사진 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
        'google_places',
        'PHOTO_FETCH_FAILED',
        { photoReference, maxWidth }
      );
    }
  }

  /**
   * 장소 리뷰 분석
   */
  async analyzePlaceReviews(placeId: string): Promise<SourceData> {
    const cacheKey = `places:reviews:${placeId}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'google_places',
          sourceName: 'Google Places API',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.93,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      // 먼저 장소 세부정보를 가져와서 리뷰 분석
      const placeDetails = await this.fetchPlaceDetails(placeId, ['reviews', 'rating', 'user_ratings_total']);
      const reviewAnalysis = this.analyzeReviews(placeDetails);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, reviewAnalysis, ['google', 'places', 'reviews']);

      return {
        sourceId: 'google_places',
        sourceName: 'Google Places API',
        data: reviewAnalysis,
        retrievedAt: new Date().toISOString(),
        reliability: 0.93,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Google Places 리뷰 분석 실패: ${error instanceof Error ? error.message : String(error)}`,
        'google_places',
        'REVIEW_ANALYSIS_FAILED',
        { placeId }
      );
    }
  }

  /**
   * 텍스트 검색 실행
   */
  private async performTextSearch(
    query: string,
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<GooglePlacesData[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API 키가 설정되지 않았습니다');
    }

    const params = new URLSearchParams({
      query,
      key: this.apiKey,
      ...(location && { location: `${location.lat},${location.lng}` }),
      ...(radius && { radius: radius.toString() }),
      language: 'ko'
    });

    const url = `${this.baseUrl}/textsearch/json?${params}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Places API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API Error: ${data.status} - ${data.error_message}`);
    }

    return this.parsePlacesData(data.results || []);
  }

  /**
   * 근처 검색 실행
   */
  private async performNearbySearch(
    lat: number,
    lng: number,
    radius: number,
    type?: string
  ): Promise<GooglePlacesData[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API 키가 설정되지 않았습니다');
    }

    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: radius.toString(),
      key: this.apiKey,
      ...(type && { type }),
      language: 'ko'
    });

    const url = `${this.baseUrl}/nearbysearch/json?${params}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Places API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API Error: ${data.status} - ${data.error_message}`);
    }

    return this.parsePlacesData(data.results || []);
  }

  /**
   * 장소 세부정보 가져오기
   */
  private async fetchPlaceDetails(placeId: string, fields?: string[]): Promise<GooglePlacesData> {
    if (!this.apiKey) {
      throw new Error('Google Places API 키가 설정되지 않았습니다');
    }

    const defaultFields = [
      'place_id', 'name', 'formatted_address', 'geometry', 'rating',
      'user_ratings_total', 'price_level', 'types', 'photos', 'reviews',
      'opening_hours', 'formatted_phone_number', 'website', 'vicinity'
    ];

    const params = new URLSearchParams({
      place_id: placeId,
      fields: (fields || defaultFields).join(','),
      key: this.apiKey,
      language: 'ko'
    });

    const url = `${this.baseUrl}/details/json?${params}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Places Details API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places Details API Error: ${data.status} - ${data.error_message}`);
    }

    return this.parsePlaceData(data.result);
  }

  /**
   * 장소 사진 URL 생성
   */
  private async fetchPlacePhoto(photoReference: string, maxWidth: number): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google Places API 키가 설정되지 않았습니다');
    }

    const params = new URLSearchParams({
      photo_reference: photoReference,
      maxwidth: maxWidth.toString(),
      key: this.apiKey
    });

    return `${this.baseUrl}/photo?${params}`;
  }

  /**
   * Places 데이터 배열 파싱
   */
  private parsePlacesData(results: any[]): GooglePlacesData[] {
    return results.map(place => this.parsePlaceData(place));
  }

  /**
   * 개별 Place 데이터 파싱
   */
  private parsePlaceData(place: any): GooglePlacesData {
    return {
      placeId: place.place_id,
      name: place.name,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      priceLevel: place.price_level,
      vicinity: place.vicinity || place.formatted_address,
      types: place.types || [],
      geometry: {
        location: {
          lat: place.geometry?.location?.lat || 0,
          lng: place.geometry?.location?.lng || 0
        }
      },
      photos: place.photos?.map((photo: any) => ({
        photoReference: photo.photo_reference,
        height: photo.height,
        width: photo.width,
        htmlAttributions: photo.html_attributions || []
      })) || [],
      reviews: place.reviews?.map((review: any) => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time
      })) || [],
      openingHours: place.opening_hours ? {
        openNow: place.opening_hours.open_now,
        periods: place.opening_hours.periods || []
      } : undefined
    };
  }

  /**
   * 리뷰 분석
   */
  private analyzeReviews(place: GooglePlacesData): any {
    const reviews = place.reviews || [];
    
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: place.rating || 0,
        ratingDistribution: {},
        sentiment: 'neutral',
        keyTopics: [],
        recentTrends: []
      };
    }

    // 평점 분포 계산
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // 감정 분석 (간단한 키워드 기반)
    const positiveKeywords = ['좋다', '훌륭하다', '추천', '만족', '깨끗', '친절', '맛있다'];
    const negativeKeywords = ['나쁘다', '별로', '실망', '불친절', '더럽다', '비싸다'];

    let positiveCount = 0;
    let negativeCount = 0;

    reviews.forEach(review => {
      const text = review.text.toLowerCase();
      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) positiveCount++;
      });
      negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) negativeCount++;
      });
    });

    let sentiment = 'neutral';
    if (positiveCount > negativeCount * 1.5) sentiment = 'positive';
    else if (negativeCount > positiveCount * 1.5) sentiment = 'negative';

    // 최근 리뷰 트렌드 (최근 3개월)
    const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const recentReviews = reviews.filter(review => review.time * 1000 > threeMonthsAgo);
    const recentAverageRating = recentReviews.length > 0 
      ? recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length
      : place.rating || 0;

    return {
      totalReviews: reviews.length,
      averageRating: place.rating || 0,
      ratingDistribution,
      sentiment,
      positiveKeywordCount: positiveCount,
      negativeKeywordCount: negativeCount,
      recentReviewsCount: recentReviews.length,
      recentAverageRating,
      ratingTrend: recentAverageRating > (place.rating || 0) ? 'improving' : 
                   recentAverageRating < (place.rating || 0) ? 'declining' : 'stable'
    };
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // 간단한 검색으로 API 상태 확인
      const params = new URLSearchParams({
        query: 'restaurant',
        key: this.apiKey,
        language: 'ko'
      });

      const response = await resilientFetch(
        `${this.baseUrl}/textsearch/json?${params}`,
        {
          timeout: 5000,
          retries: 1,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GuideAI-HealthCheck/1.0'
          }
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * API 사용량 체크
   */
  async checkQuota(): Promise<any> {
    // Google Places API는 직접적인 할당량 조회 API를 제공하지 않음
    // 캐시 통계로 대체
    return {
      cacheStats: this.cache.getStats(),
      recommendation: 'Google Cloud Console에서 API 사용량을 확인하세요'
    };
  }

  /**
   * 캐시 통계
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * 캐시 클리어
   */
  async clearCache(tags?: string[]) {
    await this.cache.clear(tags);
  }

  /**
   * 지원되는 장소 타입 목록
   */
  getSupportedTypes(): string[] {
    return [
      'tourist_attraction', 'museum', 'art_gallery', 'church', 'hindu_temple',
      'mosque', 'synagogue', 'park', 'amusement_park', 'aquarium', 'zoo',
      'bowling_alley', 'casino', 'movie_theater', 'night_club', 'restaurant',
      'cafe', 'bar', 'shopping_mall', 'store', 'lodging', 'hospital',
      'school', 'university', 'library', 'post_office', 'bank', 'atm',
      'gas_station', 'subway_station', 'train_station', 'bus_station',
      'airport', 'embassy', 'city_hall', 'courthouse', 'police', 'fire_station'
    ];
  }
}
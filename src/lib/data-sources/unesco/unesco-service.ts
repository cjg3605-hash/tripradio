/**
 * UNESCO World Heritage API Integration Service
 * UNESCO 세계유산 API 통합 서비스
 */

import { DataSourceError, UNESCOData, SourceData, RateLimit } from '../types/data-types';
import { DataSourceCache } from '../cache/data-cache';
import { resilientFetch } from '@/lib/resilient-fetch';

export class UNESCOService {
  private static instance: UNESCOService;
  private cache: DataSourceCache;
  private rateLimit: RateLimit = {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 1000,
    burstLimit: 5
  };

  private constructor() {
    this.cache = new DataSourceCache({
      ttl: 3600, // 1 hour
      maxSize: 50 * 1024 * 1024, // 50MB
      strategy: 'lru' as any,
      compression: true
    });
  }

  public static getInstance(): UNESCOService {
    if (!UNESCOService.instance) {
      UNESCOService.instance = new UNESCOService();
    }
    return UNESCOService.instance;
  }

  /**
   * UNESCO 사이트 검색
   */
  async searchSites(query: string, limit: number = 20): Promise<SourceData> {
    const cacheKey = `unesco:search:${query}:${limit}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'unesco',
          sourceName: 'UNESCO World Heritage Centre',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.95,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      // UNESCO API 호출 (공식 API가 제한적이므로 WHC 데이터를 스크래핑)
      const searchResults = await this.fetchFromWHC(query, limit);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, searchResults, ['unesco', 'search']);

      return {
        sourceId: 'unesco',
        sourceName: 'UNESCO World Heritage Centre',
        data: searchResults,
        retrievedAt: new Date().toISOString(),
        reliability: 0.95,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `UNESCO 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'unesco',
        'SEARCH_FAILED',
        { query, limit }
      );
    }
  }

  /**
   * UNESCO 사이트 세부 정보 조회
   */
  async getSiteDetails(siteId: string): Promise<SourceData> {
    const cacheKey = `unesco:site:${siteId}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'unesco',
          sourceName: 'UNESCO World Heritage Centre',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.95,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const siteDetails = await this.fetchSiteDetails(siteId);
      
      // 캐시에 저장 (더 오래 보관)
      await this.cache.set(cacheKey, siteDetails, ['unesco', 'site'], 7200); // 2 hours

      return {
        sourceId: 'unesco',
        sourceName: 'UNESCO World Heritage Centre',
        data: siteDetails,
        retrievedAt: new Date().toISOString(),
        reliability: 0.95,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `UNESCO 사이트 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
        'unesco',
        'SITE_FETCH_FAILED',
        { siteId }
      );
    }
  }

  /**
   * 좌표 기반 UNESCO 사이트 검색
   */
  async searchByCoordinates(lat: number, lng: number, radius: number = 50): Promise<SourceData> {
    const cacheKey = `unesco:coords:${lat}:${lng}:${radius}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'unesco',
          sourceName: 'UNESCO World Heritage Centre',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.95,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const nearbySites = await this.fetchNearbySites(lat, lng, radius);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, nearbySites, ['unesco', 'coords']);

      return {
        sourceId: 'unesco',
        sourceName: 'UNESCO World Heritage Centre',
        data: nearbySites,
        retrievedAt: new Date().toISOString(),
        reliability: 0.95,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `UNESCO 좌표 기반 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'unesco',
        'COORDS_SEARCH_FAILED',
        { lat, lng, radius }
      );
    }
  }

  /**
   * UNESCO WHC에서 데이터 가져오기
   */
  private async fetchFromWHC(query: string, limit: number): Promise<UNESCOData[]> {
    // UNESCO WHC JSON API 사용
    const apiUrl = `https://whc.unesco.org/en/list/json/?search=${encodeURIComponent(query)}`;
    
    const response = await resilientFetch(apiUrl, {
      timeout: 10000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`UNESCO API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // UNESCO API 응답 형식에 맞게 파싱
    const sites = data.results?.slice(0, limit) || [];
    
    return sites.map((site: any) => ({
      id: site.id?.toString() || site.unique_number?.toString(),
      name: site.site || site.name,
      inscriptionYear: parseInt(site.date_inscribed) || 0,
      criteria: this.parseCriteria(site.criteria_txt),
      category: this.parseCategory(site.category),
      description: site.short_description || site.description,
      justification: site.justification || '',
      threats: site.threats ? [site.threats] : [],
      protectionMeasures: site.protection_measures ? [site.protection_measures] : [],
      stateParty: site.states || site.country,
      region: site.region || '',
      coordinates: site.latitude && site.longitude ? {
        lat: parseFloat(site.latitude),
        lng: parseFloat(site.longitude)
      } : undefined
    }));
  }

  /**
   * 사이트 세부 정보 가져오기
   */
  private async fetchSiteDetails(siteId: string): Promise<UNESCOData> {
    const apiUrl = `https://whc.unesco.org/en/list/${siteId}/json/`;
    
    const response = await resilientFetch(apiUrl, {
      timeout: 10000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`UNESCO Site API HTTP ${response.status}: ${response.statusText}`);
    }

    const site = await response.json();
    
    return {
      id: siteId,
      name: site.site || site.name,
      inscriptionYear: parseInt(site.date_inscribed) || 0,
      criteria: this.parseCriteria(site.criteria_txt),
      category: this.parseCategory(site.category),
      description: site.short_description || site.description,
      justification: site.justification || '',
      threats: site.danger_list === '1' ? ['Listed as World Heritage in Danger'] : [],
      protectionMeasures: site.protection_measures ? [site.protection_measures] : [],
      stateParty: site.states || site.country,
      region: site.region || '',
      coordinates: site.latitude && site.longitude ? {
        lat: parseFloat(site.latitude),
        lng: parseFloat(site.longitude)
      } : undefined
    };
  }

  /**
   * 좌표 기반 근처 사이트 검색
   */
  private async fetchNearbySites(lat: number, lng: number, radius: number): Promise<UNESCOData[]> {
    // UNESCO에는 직접적인 지리적 검색 API가 없으므로
    // 전체 사이트 목록을 가져와서 거리 계산
    const allSitesUrl = 'https://whc.unesco.org/en/list/json/';
    
    const response = await resilientFetch(allSitesUrl, {
      timeout: 15000,
      retries: 2,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`UNESCO Sites API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const sites = data.results || [];
    
    // 좌표가 있는 사이트만 필터링하고 거리 계산
    const nearbySites = sites
      .filter((site: any) => site.latitude && site.longitude)
      .map((site: any) => ({
        ...site,
        distance: this.calculateDistance(
          lat, lng,
          parseFloat(site.latitude),
          parseFloat(site.longitude)
        )
      }))
      .filter((site: any) => site.distance <= radius)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 20); // 최대 20개

    return nearbySites.map((site: any) => ({
      id: site.id?.toString() || site.unique_number?.toString(),
      name: site.site || site.name,
      inscriptionYear: parseInt(site.date_inscribed) || 0,
      criteria: this.parseCriteria(site.criteria_txt),
      category: this.parseCategory(site.category),
      description: site.short_description || site.description,
      justification: site.justification || '',
      threats: site.danger_list === '1' ? ['Listed as World Heritage in Danger'] : [],
      protectionMeasures: [],
      stateParty: site.states || site.country,
      region: site.region || '',
      coordinates: {
        lat: parseFloat(site.latitude),
        lng: parseFloat(site.longitude)
      }
    }));
  }

  /**
   * UNESCO 기준 파싱
   */
  private parseCriteria(criteriaText: string): string[] {
    if (!criteriaText) return [];
    
    // Roman numerals pattern (i, ii, iii, iv, v, vi, vii, viii, ix, x)
    const criteriaMatch = criteriaText.match(/\b(i{1,3}|iv|vi{0,3}|ix|x)\b/gi);
    return criteriaMatch || [];
  }

  /**
   * 카테고리 파싱
   */
  private parseCategory(category: string): 'Cultural' | 'Natural' | 'Mixed' {
    if (!category) return 'Cultural';
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('natural')) return 'Natural';
    if (categoryLower.includes('mixed')) return 'Mixed';
    return 'Cultural';
  }

  /**
   * 두 좌표 간 거리 계산 (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await resilientFetch('https://whc.unesco.org/en/list/json/', {
        timeout: 5000,
        retries: 1,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GuideAI-HealthCheck/1.0'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
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
}
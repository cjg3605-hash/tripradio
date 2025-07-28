/**
 * Government Open Data API Integration Service
 * 정부 오픈데이터 API 통합 서비스
 */

import { DataSourceError, GovernmentData, SourceData, RateLimit } from '../types/data-types';
import { DataSourceCache } from '../cache/data-cache';
import { resilientFetch } from '@/lib/resilient-fetch';
import { heritageWFSService, HeritageWFSItem } from './heritage-wfs-service';

interface GovernmentAPI {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  endpoints: Record<string, string>;
  rateLimit: RateLimit;
  reliability: number;
  dataTypes: string[];
}

export class GovernmentDataService {
  private static instance: GovernmentDataService;
  private cache: DataSourceCache;
  private apis: Record<string, GovernmentAPI>;

  private constructor() {
    this.cache = new DataSourceCache({
      ttl: 3600, // 1 hour
      maxSize: 75 * 1024 * 1024, // 75MB
      strategy: 'lru' as any,
      compression: true
    });

    // 정부 API 설정
    this.apis = {
      heritage: {
        id: 'heritage',
        name: '문화재청 문화유산정보',
        baseUrl: 'http://www.cha.go.kr/cha/SearchKindOpenapiList.do',
        endpoints: {
          search: '/search',
          detail: '/detail',
          list: '/list'
        },
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          burstLimit: 20
        },
        reliability: 0.95,
        dataTypes: ['heritage', 'cultural_property', 'historical_site']
      },
      tourism: {
        id: 'tourism',
        name: '한국관광공사 관광정보',
        baseUrl: 'https://apis.data.go.kr/B551011/KorService2',
        apiKey: process.env.KOREA_TOURISM_API_KEY,
        endpoints: {
          areaCode: '/areaCode1',
          categoryCode: '/categoryCode1',
          searchKeyword: '/searchKeyword2',
          searchFestival: '/searchFestival1',
          searchStay: '/searchStay1',
          locationBasedList: '/locationBasedList1',
          detailCommon: '/detailCommon1',
          detailIntro: '/detailIntro1',
          detailImage: '/detailImage1'
        },
        rateLimit: {
          requestsPerMinute: 1000,
          requestsPerHour: 10000,
          requestsPerDay: 100000,
          burstLimit: 50
        },
        reliability: 0.90,
        dataTypes: ['tourism', 'accommodation', 'restaurant', 'attraction', 'festival']
      },
      statistics: {
        id: 'statistics',
        name: '통계청 국가통계포털',
        baseUrl: 'http://kosis.kr/openapi',
        apiKey: process.env.KOSIS_API_KEY,
        endpoints: {
          statisticsList: '/Param/statisticsList.do',
          statisticsSearch: '/statisticsSearch.do'
        },
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          requestsPerDay: 10000,
          burstLimit: 10
        },
        reliability: 0.88,
        dataTypes: ['statistics', 'demographics', 'economics']
      },
      publicData: {
        id: 'publicData',
        name: '공공데이터포털',
        baseUrl: 'https://api.odcloud.kr/api',
        apiKey: process.env.PUBLIC_DATA_API_KEY,
        endpoints: {
          search: '/search',
          dataset: '/dataset'
        },
        rateLimit: {
          requestsPerMinute: 1000,
          requestsPerHour: 10000,
          requestsPerDay: 100000,
          burstLimit: 50
        },
        reliability: 0.85,
        dataTypes: ['various', 'government', 'administrative']
      }
    };
  }

  public static getInstance(): GovernmentDataService {
    if (!GovernmentDataService.instance) {
      GovernmentDataService.instance = new GovernmentDataService();
    }
    return GovernmentDataService.instance;
  }

  /**
   * 통합 정부 데이터 검색
   */
  async searchGovernmentData(query: string, dataTypes?: string[], limit: number = 20): Promise<SourceData[]> {
    const cacheKey = `gov:search:${query}:${dataTypes?.join(',')}:${limit}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached.map((data: any) => ({
          ...data,
          retrievedAt: new Date().toISOString(),
          latency: Date.now() - startTime
        }));
      }

      // 관련 API들에서 병렬로 데이터 수집
      const searchPromises = Object.values(this.apis)
        .filter(api => !dataTypes || dataTypes.some(type => api.dataTypes.includes(type)))
        .map(api => this.searchFromAPI(api, query, limit));

      const results = await Promise.allSettled(searchPromises);
      
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<SourceData> => result.status === 'fulfilled')
        .map(result => result.value);

      // 캐시에 저장
      await this.cache.set(cacheKey, successfulResults, ['government', 'search']);

      return successfulResults;

    } catch (error) {
      throw new DataSourceError(
        `정부 데이터 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'government',
        'SEARCH_FAILED',
        { query, dataTypes, limit }
      );
    }
  }

  /**
   * 국가유산청 문화유산정보 검색 (새 WFS API 사용)
   */
  async searchCulturalHeritage(query: string, limit: number = 20): Promise<SourceData> {
    const cacheKey = `gov:heritage_wfs:${query}:${limit}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'heritage_wfs',
          sourceName: '국가유산청 WFS API',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.95,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      // 새로운 WFS API로 검색
      const wfsResult = await heritageWFSService.searchAllCategories(query);
      
      // 결과 제한 적용
      const limitedData = Array.isArray(wfsResult.data) 
        ? wfsResult.data.slice(0, limit)
        : wfsResult.data;
      
      // 표준 형태로 변환
      const transformedData = this.transformWFSData(limitedData);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, transformedData, ['government', 'heritage_wfs']);

      return {
        sourceId: 'heritage_wfs',
        sourceName: '국가유산청 WFS API',
        data: transformedData,
        retrievedAt: new Date().toISOString(),
        reliability: 0.95,
        latency: Date.now() - startTime,
        httpStatus: 200,
        metadata: {
          ...wfsResult.metadata,
          searchMethod: 'wfs_all_categories',
          limitApplied: limit
        }
      };

    } catch (error) {
      // WFS API 실패 시 기존 XML API로 폴백
      console.warn('WFS API 실패, 기존 XML API로 폴백:', error);
      
      try {
        const fallbackData = await this.fetchCulturalHeritageLegacy(query, limit);
        
        return {
          sourceId: 'heritage_legacy',
          sourceName: '문화재청 문화유산정보 (Legacy)',
          data: fallbackData,
          retrievedAt: new Date().toISOString(),
          reliability: 0.85,
          latency: Date.now() - startTime,
          httpStatus: 200,
          metadata: {
            fallbackUsed: true,
            originalError: error instanceof Error ? error.message : String(error)
          }
        };
      } catch (fallbackError) {
        throw new DataSourceError(
          `문화재청 데이터 검색 실패 (WFS & Legacy): ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
          'heritage',
          'HERITAGE_SEARCH_FAILED',
          { query, limit, originalError: error instanceof Error ? error.message : String(error) }
        );
      }
    }
  }

  /**
   * WFS API 데이터를 표준 형태로 변환
   */
  private transformWFSData(wfsItems: HeritageWFSItem[]): any[] {
    if (!Array.isArray(wfsItems)) {
      return [];
    }

    return wfsItems.map(item => ({
      // 표준 필드
      title: item.ccbaMnm,                    // 문화재명
      category: item.ccmaName,                 // 분류
      address: item.vlocName,                  // 소재지
      adminOrg: item.ccbaAdmin,               // 관리기관
      designatedDate: item.ccbaAsdt,          // 지정일자
      culturalAssetNo: item.crltsnoNm,        // 문화재 번호
      
      // 추가 정보
      era: item.ccceName,                     // 시대구분
      detailedCategory: item.ctgrname,        // 상세 분류
      coordinates: {
        x: item.cnX,
        y: item.cnY,
        // 위경도 변환 시도
        ...heritageWFSService.convertCoordinates(item.cnX, item.cnY)
      },
      
      // 메타데이터
      source: 'heritage_wfs',
      sourceType: 'government',
      dataQuality: 'high',
      hasCoordinates: !!(item.cnX && item.cnY),
      serialNumber: item.sn
    }));
  }

  /**
   * 한국관광공사 관광정보 검색
   */
  async searchTourismInfo(query: string, contentTypeId?: string, limit: number = 20): Promise<SourceData> {
    const cacheKey = `gov:tourism:${query}:${contentTypeId}:${limit}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'tourism',
          sourceName: '한국관광공사 관광정보',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.90,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const tourismData = await this.fetchTourismInfo(query, contentTypeId, limit);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, tourismData, ['government', 'tourism']);

      return {
        sourceId: 'tourism',
        sourceName: '한국관광공사 관광정보',
        data: tourismData,
        retrievedAt: new Date().toISOString(),
        reliability: 0.90,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `관광공사 데이터 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'tourism',
        'TOURISM_SEARCH_FAILED',
        { query, contentTypeId, limit }
      );
    }
  }

  /**
   * 좌표 기반 관광정보 검색
   */
  async searchTourismByLocation(lat: number, lng: number, radius: number = 5000): Promise<SourceData> {
    const cacheKey = `gov:tourism:coords:${lat}:${lng}:${radius}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'tourism',
          sourceName: '한국관광공사 관광정보',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.90,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const locationData = await this.fetchTourismByLocation(lat, lng, radius);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, locationData, ['government', 'tourism', 'location']);

      return {
        sourceId: 'tourism',
        sourceName: '한국관광공사 관광정보',
        data: locationData,
        retrievedAt: new Date().toISOString(),
        reliability: 0.90,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `위치 기반 관광정보 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'tourism',
        'LOCATION_SEARCH_FAILED',
        { lat, lng, radius }
      );
    }
  }

  /**
   * 개별 API에서 검색
   */
  private async searchFromAPI(api: GovernmentAPI, query: string, limit: number): Promise<SourceData> {
    switch (api.id) {
      case 'heritage':
        return this.searchCulturalHeritage(query, limit);
      case 'tourism':
        return this.searchTourismInfo(query, undefined, limit);
      default:
        throw new Error(`Unsupported API: ${api.id}`);
    }
  }

  /**
   * 문화재청 데이터 가져오기 (Legacy XML API)
   */
  private async fetchCulturalHeritageLegacy(query: string, limit: number): Promise<any[]> {
    const api = this.apis.heritage;
    
    // 문화재청 API는 특별한 형식을 요구함
    const params = new URLSearchParams({
      ccbaCpno: '', // 문화재번호
      ccbaKdcd: '', // 문화재종목코드
      ccbaCtcd: '', // 시도코드
      ccbaLcto: query, // 소재지
      ccbaMnm1: query, // 문화재명
      pageUnit: limit.toString(),
      pageIndex: '1'
    });

    const url = `${api.baseUrl}?${params}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/xml, application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Heritage API HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // XML 응답을 JSON으로 변환
      const xml = await response.text();
      data = this.parseXMLToJSON(xml);
    }

    return this.parseCulturalHeritageData(data);
  }

  /**
   * 관광공사 데이터 가져오기
   */
  private async fetchTourismInfo(query: string, contentTypeId?: string, limit: number = 20): Promise<any[]> {
    const api = this.apis.tourism;
    
    if (!api.apiKey) {
      throw new Error('한국관광공사 API 키가 설정되지 않았습니다');
    }

    const params = new URLSearchParams({
      serviceKey: api.apiKey,
      numOfRows: limit.toString(),
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json',
      keyword: query,
      ...(contentTypeId && { contentTypeId })
    });

    const url = `${api.baseUrl}${api.endpoints.searchKeyword}?${params}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Tourism API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseTourismData(data);
  }

  /**
   * 좌표 기반 관광정보 가져오기
   */
  private async fetchTourismByLocation(lat: number, lng: number, radius: number): Promise<any[]> {
    const api = this.apis.tourism;
    
    if (!api.apiKey) {
      throw new Error('한국관광공사 API 키가 설정되지 않았습니다');
    }

    const params = new URLSearchParams({
      serviceKey: api.apiKey,
      numOfRows: '50',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json',
      mapX: lng.toString(),
      mapY: lat.toString(),
      radius: radius.toString()
    });

    const url = `${api.baseUrl}${api.endpoints.locationBasedList}?${params}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Tourism Location API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseTourismData(data);
  }

  /**
   * 문화재청 데이터 파싱
   */
  private parseCulturalHeritageData(data: any): any[] {
    // XML 또는 JSON 구조에 따라 파싱 로직 구현
    if (data.result && data.result.item) {
      const items = Array.isArray(data.result.item) ? data.result.item : [data.result.item];
      
      return items.map((item: any) => ({
        id: item.ccbaCpno || item.sn,
        name: item.ccbaMnm1,
        type: item.ccbaKdcd,
        category: item.ccbaCncl,
        location: item.ccbaLcto,
        address: item.ccbaLcad,
        period: item.cccePeriod,
        owner: item.ccbaAdmin,
        designation_date: item.ccbaAsdt,
        description: item.content,
        image: item.imageUrl,
        coordinates: this.extractCoordinatesFromAddress(item.ccbaLcad),
        source: 'cultural_heritage_administration'
      }));
    }
    
    return [];
  }

  /**
   * 관광공사 데이터 파싱
   */
  private parseTourismData(data: any): any[] {
    if (data.response && data.response.body && data.response.body.items) {
      const items = data.response.body.items.item || [];
      const itemArray = Array.isArray(items) ? items : [items];
      
      return itemArray.map((item: any) => ({
        id: item.contentid,
        name: item.title,
        type: item.contenttypeid,
        address: item.addr1,
        area: item.areacode,
        sigungu: item.sigungucode,
        coordinates: {
          lat: parseFloat(item.mapy) || null,
          lng: parseFloat(item.mapx) || null
        },
        image: item.firstimage,
        thumbnail: item.firstimage2,
        phone: item.tel,
        zipcode: item.zipcode,
        created_time: item.createdtime,
        modified_time: item.modifiedtime,
        source: 'korea_tourism_organization'
      }));
    }
    
    return [];
  }

  /**
   * XML을 JSON으로 변환 (간단한 구현)
   */
  private parseXMLToJSON(xml: string): any {
    // 실제 구현에서는 xml2js 라이브러리 등을 사용하는 것이 좋음
    // 여기서는 간단한 파싱만 구현
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      return this.xmlToJson(doc);
    } catch (error) {
      console.error('XML 파싱 실패:', error);
      return {};
    }
  }

  /**
   * XML DOM을 JSON으로 변환
   */
  private xmlToJson(xml: any): any {
    let obj: any = {};
    
    if (xml.nodeType === 1) { // Element
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) { // Text
      obj = xml.nodeValue;
    }
    
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        
        if (typeof(obj[nodeName]) === "undefined") {
          obj[nodeName] = this.xmlToJson(item);
        } else {
          if (typeof(obj[nodeName].push) === "undefined") {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(this.xmlToJson(item));
        }
      }
    }
    
    return obj;
  }

  /**
   * 주소에서 좌표 추출 (간단한 구현)
   */
  private extractCoordinatesFromAddress(address: string): { lat: number; lng: number } | null {
    // 실제 구현에서는 지오코딩 서비스를 사용해야 함
    // 여기서는 null 반환
    return null;
  }

  /**
   * 모든 정부 API 상태 확인
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const checks = await Promise.allSettled(
      Object.entries(this.apis).map(async ([key, api]) => {
        try {
          // 각 API별 간단한 상태 확인 요청
          if (key === 'heritage') {
            const response = await resilientFetch(api.baseUrl, {
              timeout: 5000,
              retries: 1,
              headers: { 'User-Agent': 'GuideAI-HealthCheck/1.0' }
            });
            return [key, response.ok];
          } else if (key === 'tourism' && api.apiKey) {
            const params = new URLSearchParams({
              serviceKey: api.apiKey,
              numOfRows: '1',
              pageNo: '1',
              MobileOS: 'ETC',
              MobileApp: 'GuideAI',
              _type: 'json'
            });
            const response = await resilientFetch(
              `${api.baseUrl}${api.endpoints.areaCode}?${params}`,
              {
                timeout: 5000,
                retries: 1,
                headers: { 'User-Agent': 'GuideAI-HealthCheck/1.0' }
              }
            );
            return [key, response.ok];
          }
          return [key, false];
        } catch {
          return [key, false];
        }
      })
    );

    const results: Record<string, boolean> = {};
    checks.forEach((check, index) => {
      const key = Object.keys(this.apis)[index];
      results[key] = check.status === 'fulfilled' ? check.value[1] : false;
    });

    return results;
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
   * API 설정 정보 반환
   */
  getAPIInfo(): Record<string, Omit<GovernmentAPI, 'apiKey'>> {
    const info: Record<string, Omit<GovernmentAPI, 'apiKey'>> = {};
    
    Object.entries(this.apis).forEach(([key, api]) => {
      const { apiKey, ...apiInfo } = api;
      info[key] = apiInfo;
    });

    return info;
  }
}
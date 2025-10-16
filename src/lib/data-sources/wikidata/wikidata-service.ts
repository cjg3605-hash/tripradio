/**
 * Wikidata SPARQL API Integration Service
 * Wikidata SPARQL API 통합 서비스
 */

import { DataSourceError, WikidataEntity, SourceData, RateLimit } from '../types/data-types';
import { DataSourceCache } from '../cache/data-cache';
import { resilientFetch } from '@/lib/resilient-fetch';

export class WikidataService {
  private static instance: WikidataService;
  private cache: DataSourceCache;
  private baseUrl = 'https://query.wikidata.org/sparql';
  private entityBaseUrl = 'https://www.wikidata.org/w/api.php';
  private rateLimit: RateLimit = {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000,
    burstLimit: 10
  };

  private constructor() {
    this.cache = new DataSourceCache({
      ttl: 1800, // 30 minutes
      maxSize: 100 * 1024 * 1024, // 100MB
      strategy: 'lru' as any,
      compression: true
    });
  }

  public static getInstance(): WikidataService {
    if (!WikidataService.instance) {
      WikidataService.instance = new WikidataService();
    }
    return WikidataService.instance;
  }

  /**
   * 장소명으로 Wikidata 엔티티 검색
   */
  async searchEntities(query: string, limit: number = 20): Promise<SourceData> {
    const cacheKey = `wikidata:search:${query}:${limit}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'wikidata',
          sourceName: 'Wikidata Knowledge Base',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.90,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const searchResults = await this.performSearch(query, limit);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, searchResults, ['wikidata', 'search']);

      return {
        sourceId: 'wikidata',
        sourceName: 'Wikidata Knowledge Base',
        data: searchResults,
        retrievedAt: new Date().toISOString(),
        reliability: 0.90,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Wikidata 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'wikidata',
        'SEARCH_FAILED',
        { query, limit }
      );
    }
  }

  /**
   * 특정 엔티티 상세 정보 조회
   */
  async getEntityDetails(entityId: string): Promise<SourceData> {
    const cacheKey = `wikidata:entity:${entityId}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'wikidata',
          sourceName: 'Wikidata Knowledge Base',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.90,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const entityDetails = await this.fetchEntityDetails(entityId);
      
      // 캐시에 저장 (더 오래 보관)
      await this.cache.set(cacheKey, entityDetails, ['wikidata', 'entity'], 3600); // 1 hour

      return {
        sourceId: 'wikidata',
        sourceName: 'Wikidata Knowledge Base',
        data: entityDetails,
        retrievedAt: new Date().toISOString(),
        reliability: 0.90,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Wikidata 엔티티 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
        'wikidata',
        'ENTITY_FETCH_FAILED',
        { entityId }
      );
    }
  }

  /**
   * 좌표 기반 근처 장소 검색
   */
  async searchByCoordinates(lat: number, lng: number, radius: number = 10): Promise<SourceData> {
    const cacheKey = `wikidata:coords:${lat}:${lng}:${radius}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'wikidata',
          sourceName: 'Wikidata Knowledge Base',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.90,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const nearbyPlaces = await this.fetchNearbyPlaces(lat, lng, radius);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, nearbyPlaces, ['wikidata', 'coords']);

      return {
        sourceId: 'wikidata',
        sourceName: 'Wikidata Knowledge Base',
        data: nearbyPlaces,
        retrievedAt: new Date().toISOString(),
        reliability: 0.90,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Wikidata 좌표 기반 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'wikidata',
        'COORDS_SEARCH_FAILED',
        { lat, lng, radius }
      );
    }
  }

  /**
   * 역사적 장소 전용 검색
   */
  async searchHistoricalSites(query: string, limit: number = 20): Promise<SourceData> {
    const cacheKey = `wikidata:historical:${query}:${limit}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: 'wikidata',
          sourceName: 'Wikidata Knowledge Base',
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.90,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const historicalSites = await this.fetchHistoricalSites(query, limit);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, historicalSites, ['wikidata', 'historical']);

      return {
        sourceId: 'wikidata',
        sourceName: 'Wikidata Knowledge Base',
        data: historicalSites,
        retrievedAt: new Date().toISOString(),
        reliability: 0.90,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `Wikidata 역사적 장소 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        'wikidata',
        'HISTORICAL_SEARCH_FAILED',
        { query, limit }
      );
    }
  }

  /**
   * SPARQL을 사용한 검색 실행
   */
  private async performSearch(query: string, limit: number): Promise<WikidataEntity[]> {
    const sparqlQuery = `
      SELECT DISTINCT ?item ?itemLabel ?itemDescription ?coords ?image WHERE {
        SERVICE wikibase:mwapi {
          bd:serviceParam wikibase:api "EntitySearch" .
          bd:serviceParam wikibase:endpoint "www.wikidata.org" .
          bd:serviceParam mwapi:search "${query}" .
          bd:serviceParam mwapi:language "en" .
          ?item wikibase:apiOutputItem mwapi:item .
        }
        
        OPTIONAL { ?item wdt:P625 ?coords . }
        OPTIONAL { ?item wdt:P18 ?image . }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      }
      LIMIT ${limit}
    `;

    const response = await this.executeSparqlQuery(sparqlQuery);
    return this.parseSparqlResults(response);
  }

  /**
   * 엔티티 상세 정보 가져오기
   */
  private async fetchEntityDetails(entityId: string): Promise<WikidataEntity> {
    const apiUrl = `${this.entityBaseUrl}?action=wbgetentities&ids=${entityId}&format=json&languages=en|ko`;
    
    const response = await resilientFetch(apiUrl, {
      timeout: 10000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikidata Entity API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const entity = data.entities[entityId];
    
    if (!entity) {
      throw new Error(`Entity ${entityId} not found`);
    }

    return this.parseEntityData(entity);
  }

  /**
   * 좌표 기반 근처 장소 검색
   */
  private async fetchNearbyPlaces(lat: number, lng: number, radius: number): Promise<WikidataEntity[]> {
    const sparqlQuery = `
      SELECT DISTINCT ?item ?itemLabel ?itemDescription ?coords ?image WHERE {
        ?item wdt:P625 ?coords .
        
        FILTER(geof:distance(?coords, "Point(${lng} ${lat})"^^geo:wktLiteral) < ${radius})
        
        OPTIONAL { ?item wdt:P18 ?image . }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      }
      ORDER BY ASC(geof:distance(?coords, "Point(${lng} ${lat})"^^geo:wktLiteral))
      LIMIT 50
    `;

    const response = await this.executeSparqlQuery(sparqlQuery);
    return this.parseSparqlResults(response);
  }

  /**
   * 역사적 장소 전용 검색
   */
  private async fetchHistoricalSites(query: string, limit: number): Promise<WikidataEntity[]> {
    const sparqlQuery = `
      SELECT DISTINCT ?item ?itemLabel ?itemDescription ?coords ?image ?inception WHERE {
        SERVICE wikibase:mwapi {
          bd:serviceParam wikibase:api "EntitySearch" .
          bd:serviceParam wikibase:endpoint "www.wikidata.org" .
          bd:serviceParam mwapi:search "${query}" .
          bd:serviceParam mwapi:language "en" .
          ?item wikibase:apiOutputItem mwapi:item .
        }
        
        # 역사적 장소 관련 분류
        { ?item wdt:P31/wdt:P279* wd:Q570116 } UNION  # archaeological site
        { ?item wdt:P31/wdt:P279* wd:Q839954 } UNION  # archaeological site
        { ?item wdt:P31/wdt:P279* wd:Q4989906 } UNION # monument
        { ?item wdt:P31/wdt:P279* wd:Q41176 } UNION   # building
        { ?item wdt:P31/wdt:P279* wd:Q1497375 } UNION # cultural heritage
        { ?item wdt:P31/wdt:P279* wd:Q9259 }          # UNESCO World Heritage Site
        
        OPTIONAL { ?item wdt:P625 ?coords . }
        OPTIONAL { ?item wdt:P18 ?image . }
        OPTIONAL { ?item wdt:P571 ?inception . }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      }
      ORDER BY DESC(?inception)
      LIMIT ${limit}
    `;

    const response = await this.executeSparqlQuery(sparqlQuery);
    return this.parseSparqlResults(response);
  }

  /**
   * SPARQL 쿼리 실행
   */
  private async executeSparqlQuery(query: string): Promise<any> {
    const params = new URLSearchParams({
      query: query,
      format: 'json'
    });

    const response = await resilientFetch(`${this.baseUrl}?${params}`, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'GuideAI-DataIntegration/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikidata SPARQL HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * SPARQL 결과 파싱
   */
  private parseSparqlResults(data: any): WikidataEntity[] {
    if (!data.results || !data.results.bindings) {
      return [];
    }

    return data.results.bindings.map((binding: any) => {
      const entityId = this.extractEntityId(binding.item?.value);
      
      return {
        id: entityId,
        label: binding.itemLabel?.value || '',
        description: binding.itemDescription?.value || '',
        claims: [], // Will be populated when fetching detailed entity data
        sitelinks: [],
        coordinates: binding.coords ? this.parseCoordinates(binding.coords.value) : undefined,
        images: binding.image ? [binding.image.value] : []
      };
    });
  }

  /**
   * 엔티티 데이터 파싱
   */
  private parseEntityData(entity: any): WikidataEntity {
    const entityId = entity.id;
    const label = entity.labels?.en?.value || entity.labels?.ko?.value || '';
    const description = entity.descriptions?.en?.value || entity.descriptions?.ko?.value || '';
    
    // Claims 파싱
    const claims = Object.entries(entity.claims || {}).map(([property, claimArray]: [string, any]) => {
      return claimArray.map((claim: any) => ({
        property,
        value: this.parseClaimValue(claim),
        qualifiers: claim.qualifiers ? this.parseQualifiers(claim.qualifiers) : [],
        references: claim.references ? this.parseReferences(claim.references) : []
      }));
    }).flat();

    // Sitelinks 파싱
    const sitelinks = Object.entries(entity.sitelinks || {}).map(([site, link]: [string, any]) => ({
      site,
      title: link.title,
      url: link.url || `https://${site}.org/wiki/${encodeURIComponent(link.title)}`
    }));

    // 좌표 정보 추출
    const coordinateClaim = entity.claims?.P625?.[0];
    const coordinates = coordinateClaim ? 
      this.parseCoordinatesFromClaim(coordinateClaim) : undefined;

    // 이미지 정보 추출
    const imageClaims = entity.claims?.P18 || [];
    const images = imageClaims.map((claim: any) => 
      `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(claim.mainsnak.datavalue.value)}`
    );

    return {
      id: entityId,
      label,
      description,
      claims,
      sitelinks,
      coordinates,
      images
    };
  }

  /**
   * Claim 값 파싱
   */
  private parseClaimValue(claim: any): any {
    const mainsnak = claim.mainsnak;
    if (!mainsnak.datavalue) return null;

    switch (mainsnak.datatype) {
      case 'time':
        return mainsnak.datavalue.value.time;
      case 'quantity':
        return mainsnak.datavalue.value.amount;
      case 'string':
      case 'external-id':
        return mainsnak.datavalue.value;
      case 'wikibase-item':
        return mainsnak.datavalue.value.id;
      case 'globe-coordinate':
        return {
          latitude: mainsnak.datavalue.value.latitude,
          longitude: mainsnak.datavalue.value.longitude,
          precision: mainsnak.datavalue.value.precision
        };
      default:
        return mainsnak.datavalue.value;
    }
  }

  /**
   * 좌표 문자열 파싱
   */
  private parseCoordinates(coordString: string): { lat: number; lng: number } | undefined {
    const match = coordString.match(/Point\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)/);
    if (match) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2])
      };
    }
    return undefined;
  }

  /**
   * Claim에서 좌표 파싱
   */
  private parseCoordinatesFromClaim(claim: any): { lat: number; lng: number } | undefined {
    const coords = claim.mainsnak?.datavalue?.value;
    if (coords && coords.latitude !== undefined && coords.longitude !== undefined) {
      return {
        lat: coords.latitude,
        lng: coords.longitude
      };
    }
    return undefined;
  }

  /**
   * 엔티티 ID 추출
   */
  private extractEntityId(url: string): string {
    const match = url.match(/\/(Q\d+)$/);
    return match ? match[1] : '';
  }

  /**
   * Qualifiers 파싱
   */
  private parseQualifiers(qualifiers: any): any[] {
    return Object.entries(qualifiers).map(([property, qualifierArray]: [string, any]) => {
      return qualifierArray.map((qualifier: any) => ({
        property,
        value: this.parseClaimValue({ mainsnak: qualifier })
      }));
    }).flat();
  }

  /**
   * References 파싱
   */
  private parseReferences(references: any[]): any[] {
    return references.map(ref => {
      const snaks = ref.snaks || {};
      return Object.entries(snaks).map(([property, snakArray]: [string, any]) => {
        return snakArray.map((snak: any) => ({
          property,
          value: this.parseClaimValue({ mainsnak: snak }),
          url: snak.datatype === 'url' ? snak.datavalue?.value : undefined
        }));
      }).flat();
    }).flat();
  }

  /**
   * 서비스 상태 확인
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testQuery = 'SELECT ?item WHERE { ?item wdt:P31 wd:Q5 } LIMIT 1';
      const params = new URLSearchParams({
        query: testQuery,
        format: 'json'
      });

      const response = await resilientFetch(`${this.baseUrl}?${params}`, {
        timeout: 5000,
        retries: 1,
        headers: {
          'Accept': 'application/sparql-results+json',
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
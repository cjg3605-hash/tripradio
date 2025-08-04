/**
 * 🌍 Wikipedia Location Searcher
 * Wikipedia + Wikidata 기반 위치 정보 검색 시스템
 */

import { SpecificStartingPoint } from './specific-starting-point-generator';

export interface WikipediaLocationResult {
  lat: number;
  lng: number;
  name: string;
  source: 'wikipedia' | 'wikidata';
  confidence: number;
  type: 'facility' | 'entrance' | 'building' | 'monument';
  description?: string;
  wikidataId?: string;
  extractedFrom: string; // 어떤 Wikipedia 페이지에서 추출했는지
}

export interface CoordinateCandidate {
  lat: number;
  lng: number;
  name: string;
  source: string;
  confidence: number;
  type: string;
  metadata?: any;
}

export class WikipediaLocationSearcher {
  private cache = new Map<string, WikipediaLocationResult[]>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간
  private readonly REQUEST_DELAY = 1000; // Wikipedia API 요청 간격 (1초)
  private lastRequestTime = 0;

  /**
   * 🎯 메인 메서드: 구체적 위치 좌표 검색
   */
  async searchSpecificCoordinates(
    mainLocation: string,
    specificPoint: SpecificStartingPoint
  ): Promise<CoordinateCandidate[]> {
    console.log(`🌍 Wikipedia 검색 시작: ${specificPoint.specificName} in ${mainLocation}`);

    // 캐시 확인
    const cacheKey = this.generateCacheKey(mainLocation, specificPoint.specificName);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('💾 Wikipedia 캐시 히트');
      return this.convertToCoordinateCandidate(cached);
    }

    try {
      // 1️⃣ 다양한 검색 전략 시도
      const searchStrategies = [
        () => this.searchMainLocationPage(mainLocation),
        () => this.searchSpecificFacility(mainLocation, specificPoint),
        () => this.searchByFeatures(mainLocation, specificPoint.expectedFeatures),
        () => this.searchWikidataDirectly(mainLocation, specificPoint)
      ];

      const allResults: WikipediaLocationResult[] = [];

      for (const strategy of searchStrategies) {
        try {
          const results = await strategy();
          allResults.push(...results);
          
          // 요청 간격 조절
          await this.waitForRateLimit();
        } catch (error) {
          console.warn('Wikipedia 검색 전략 실패:', error);
          continue;
        }
      }

      // 2️⃣ 결과 정리 및 필터링
      const filteredResults = this.filterAndRankResults(allResults, specificPoint);
      
      // 캐시 저장
      this.saveToCache(cacheKey, filteredResults);

      console.log(`✅ Wikipedia 검색 완료: ${filteredResults.length}개 결과`);
      return this.convertToCoordinateCandidate(filteredResults);

    } catch (error) {
      console.error('❌ Wikipedia 검색 실패:', error);
      return [];
    }
  }

  /**
   * 📄 메인 위치 Wikipedia 페이지 검색
   */
  private async searchMainLocationPage(mainLocation: string): Promise<WikipediaLocationResult[]> {
    try {
      // 1. Wikipedia 페이지 검색
      const searchResponse = await fetch(
        `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(mainLocation)}`,
        {
          headers: {
            'User-Agent': 'GuideAI/1.0 (https://guideai.com) Wikipedia Location Search'
          }
        }
      );

      if (!searchResponse.ok) {
        // 한국어 페이지가 없으면 영어 페이지 시도
        return await this.searchEnglishWikipedia(mainLocation);
      }

      const pageData = await searchResponse.json();

      // 2. 좌표 정보 추출
      if (pageData.coordinates) {
        return [{
          lat: pageData.coordinates.lat,
          lng: pageData.coordinates.lon,
          name: pageData.title,
          source: 'wikipedia' as const,
          confidence: 0.85,
          type: 'building' as const,
          description: pageData.extract,
          extractedFrom: pageData.content_urls?.desktop?.page || pageData.title
        }];
      }

      // 3. Wikidata ID가 있으면 Wikidata에서 좌표 검색
      if (pageData.wikibase_item) {
        return await this.searchWikidataById(pageData.wikibase_item, pageData.title);
      }

      return [];

    } catch (error) {
      console.warn('Wikipedia 메인 페이지 검색 실패:', error);
      return [];
    }
  }

  /**
   * 🏛️ 특정 시설 검색 (매표소, 입구 등)
   */
  private async searchSpecificFacility(
    mainLocation: string,
    specificPoint: SpecificStartingPoint
  ): Promise<WikipediaLocationResult[]> {
    const facilityQueries = [
      `${mainLocation} ${specificPoint.specificName}`,
      `${mainLocation} ${specificPoint.type}`,
      `${mainLocation} entrance`,
      `${mainLocation} ticket office`,
      `${mainLocation} visitor center`
    ];

    const results: WikipediaLocationResult[] = [];

    for (const query of facilityQueries) {
      try {
        const searchResults = await this.searchWikipediaPages(query);
        results.push(...searchResults);
      } catch (error) {
        console.warn(`시설 검색 실패 (${query}):`, error);
        continue;
      }
    }

    return results;
  }

  /**
   * 🔍 특징 기반 검색
   */
  private async searchByFeatures(
    mainLocation: string,
    features: string[]
  ): Promise<WikipediaLocationResult[]> {
    const results: WikipediaLocationResult[] = [];

    for (const feature of features) {
      try {
        const query = `${mainLocation} ${feature}`;
        const featureResults = await this.searchWikipediaPages(query);
        results.push(...featureResults);
      } catch (error) {
        console.warn(`특징 검색 실패 (${feature}):`, error);
        continue;
      }
    }

    return results;
  }

  /**
   * 🌐 Wikidata 직접 검색
   */
  private async searchWikidataDirectly(
    mainLocation: string,
    specificPoint: SpecificStartingPoint
  ): Promise<WikipediaLocationResult[]> {
    try {
      // Wikidata SPARQL 쿼리 구성
      const sparqlQuery = `
        SELECT DISTINCT ?item ?itemLabel ?coord ?typeLabel WHERE {
          # 메인 장소 검색
          ?mainItem rdfs:label "${mainLocation}"@ko .
          
          # 관련 시설 검색
          {
            ?item wdt:P276 ?mainItem .  # located in
            ?item wdt:P625 ?coord .     # coordinate
            ?item wdt:P31 ?type .       # instance of
            
            # 시설 타입 필터
            VALUES ?type { 
              wd:Q1002954   # ticket office
              wd:Q2537841   # entrance
              wd:Q33506     # museum building
              wd:Q16970     # gate
              wd:Q811979    # architectural structure
              wd:Q41176     # building
            }
          }
          UNION
          {
            # 같은 좌표를 가진 관련 항목들
            ?mainItem wdt:P625 ?mainCoord .
            ?item wdt:P625 ?coord .
            
            # 좌표가 가까운 항목들 (대략 100m 이내)
            FILTER(abs(?coord - ?mainCoord) < 0.001)
            ?item wdt:P31 ?type .
            VALUES ?type { 
              wd:Q1002954 wd:Q2537841 wd:Q33506 wd:Q16970 wd:Q811979 wd:Q41176
            }
          }
          
          SERVICE wikibase:label { 
            bd:serviceParam wikibase:language "ko,en" 
          }
        }
        LIMIT 20
      `;

      const response = await fetch('https://query.wikidata.org/sparql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'GuideAI/1.0 (https://guideai.com) Wikidata Location Search'
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`
      });

      if (!response.ok) {
        throw new Error(`Wikidata API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.results.bindings.map((binding: any) => {
        // Point(longitude latitude) 형식 파싱
        const coordMatch = binding.coord.value.match(/Point\(([^)]+)\)/);
        if (!coordMatch) return null;
        
        const [lng, lat] = coordMatch[1].split(' ').map(Number);
        
        return {
          lat,
          lng,
          name: binding.itemLabel.value,
          source: 'wikidata' as const,
          confidence: 0.9,
          type: this.mapWikidataTypeToFacilityType(binding.typeLabel.value),
          wikidataId: binding.item.value.split('/').pop(),
          extractedFrom: binding.item.value
        };
      }).filter(Boolean);

    } catch (error) {
      console.warn('Wikidata 직접 검색 실패:', error);
      return [];
    }
  }

  /**
   * 🔍 Wikipedia 페이지 검색 (공통 유틸리티)
   */
  private async searchWikipediaPages(query: string): Promise<WikipediaLocationResult[]> {
    try {
      // 1. 검색 API 호출
      const searchUrl = `https://ko.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'GuideAI/1.0 (https://guideai.com) Wikipedia Search'
        }
      });

      if (!searchResponse.ok) return [];

      const searchData = await searchResponse.json();
      const searchResults = searchData.query?.search || [];

      // 2. 각 검색 결과에 대해 상세 정보 조회
      const results: WikipediaLocationResult[] = [];

      for (const result of searchResults) {
        try {
          const pageInfo = await this.getPageCoordinates(result.title);
          if (pageInfo) {
            results.push({
              ...pageInfo,
              extractedFrom: `https://ko.wikipedia.org/wiki/${encodeURIComponent(result.title)}`
            });
          }
        } catch (error) {
          console.warn(`페이지 정보 조회 실패 (${result.title}):`, error);
          continue;
        }
      }

      return results;

    } catch (error) {
      console.warn('Wikipedia 페이지 검색 실패:', error);
      return [];
    }
  }

  /**
   * 📍 페이지 좌표 정보 조회
   */
  private async getPageCoordinates(title: string): Promise<WikipediaLocationResult | null> {
    try {
      const pageUrl = `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'GuideAI/1.0 (https://guideai.com) Wikipedia Page Info'
        }
      });

      if (!response.ok) return null;

      const pageData = await response.json();

      if (pageData.coordinates) {
        return {
          lat: pageData.coordinates.lat,
          lng: pageData.coordinates.lon,
          name: pageData.title,
          source: 'wikipedia' as const,
          confidence: 0.8,
          type: 'building' as const,
          description: pageData.extract?.substring(0, 200),
          extractedFrom: pageData.title
        };
      }

      return null;

    } catch (error) {
      console.warn('페이지 좌표 조회 실패:', error);
      return null;
    }
  }

  /**
   * 🇺🇸 영어 Wikipedia 검색 (폴백)
   */
  private async searchEnglishWikipedia(mainLocation: string): Promise<WikipediaLocationResult[]> {
    try {
      const englishUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(mainLocation)}`;
      
      const response = await fetch(englishUrl, {
        headers: {
          'User-Agent': 'GuideAI/1.0 (https://guideai.com) Wikipedia EN Search'
        }
      });

      if (!response.ok) return [];

      const pageData = await response.json();

      if (pageData.coordinates) {
        return [{
          lat: pageData.coordinates.lat,
          lng: pageData.coordinates.lon,
          name: pageData.title,
          source: 'wikipedia' as const,
          confidence: 0.75, // 영어 페이지는 신뢰도 약간 낮춤
          type: 'building' as const,
          description: pageData.extract,
          extractedFrom: pageData.content_urls?.desktop?.page || pageData.title
        }];
      }

      return [];

    } catch (error) {
      console.warn('영어 Wikipedia 검색 실패:', error);
      return [];
    }
  }

  /**
   * 🆔 Wikidata ID로 검색
   */
  private async searchWikidataById(wikidataId: string, title: string): Promise<WikipediaLocationResult[]> {
    try {
      const sparqlQuery = `
        SELECT ?item ?coord WHERE {
          BIND(wd:${wikidataId} AS ?item)
          ?item wdt:P625 ?coord .
        }
      `;

      const response = await fetch('https://query.wikidata.org/sparql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'GuideAI/1.0 (https://guideai.com) Wikidata ID Search'
        },
        body: `query=${encodeURIComponent(sparqlQuery)}`
      });

      if (!response.ok) return [];

      const data = await response.json();
      
      if (data.results.bindings.length > 0) {
        const binding = data.results.bindings[0];
        const coordMatch = binding.coord.value.match(/Point\(([^)]+)\)/);
        
        if (coordMatch) {
          const [lng, lat] = coordMatch[1].split(' ').map(Number);
          
          return [{
            lat,
            lng,
            name: title,
            source: 'wikidata' as const,
            confidence: 0.9,
            type: 'building' as const,
            wikidataId,
            extractedFrom: `https://www.wikidata.org/entity/${wikidataId}`
          }];
        }
      }

      return [];

    } catch (error) {
      console.warn('Wikidata ID 검색 실패:', error);
      return [];
    }
  }

  /**
   * 🎯 결과 필터링 및 순위 매기기
   */
  private filterAndRankResults(
    results: WikipediaLocationResult[],
    specificPoint: SpecificStartingPoint
  ): WikipediaLocationResult[] {
    // 중복 제거 (같은 좌표의 중복 결과)
    const uniqueResults = results.filter((result, index, arr) => {
      return index === arr.findIndex(r => 
        Math.abs(r.lat - result.lat) < 0.0001 && 
        Math.abs(r.lng - result.lng) < 0.0001
      );
    });

    // 관련성 점수 계산 및 정렬
    const scoredResults = uniqueResults.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevanceScore(result, specificPoint)
    }));

    // 관련성 순으로 정렬하고 상위 10개만 반환
    return scoredResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10)
      .map(({ relevanceScore, ...result }) => result);
  }

  /**
   * 📊 관련성 점수 계산
   */
  private calculateRelevanceScore(
    result: WikipediaLocationResult,
    specificPoint: SpecificStartingPoint
  ): number {
    let score = result.confidence;

    // 이름 일치도
    const nameMatch = this.calculateStringSimilarity(
      result.name.toLowerCase(),
      specificPoint.specificName.toLowerCase()
    );
    score += nameMatch * 0.3;

    // 타입 일치도 (매핑 기반)
    const typeCompatibility = this.calculateTypeCompatibility(result.type, specificPoint.type);
    score += typeCompatibility * 0.2;

    // 소스 품질 (Wikidata가 더 정확)
    if (result.source === 'wikidata') {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 📝 문자열 유사도 계산
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // 간단한 포함 관계 검사
    if (longer.includes(shorter)) return 0.8;
    if (shorter.includes(longer)) return 0.8;
    
    // 공통 단어 비율
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * 🔄 타입 매핑
   */
  private mapWikidataTypeToFacilityType(wikidataType: string): string {
    const typeMap: Record<string, string> = {
      'ticket office': 'facility',
      'entrance': 'entrance', 
      'museum building': 'building',
      'gate': 'entrance',
      'architectural structure': 'building',
      'building': 'building'
    };
    
    return typeMap[wikidataType.toLowerCase()] || 'facility';
  }

  /**
   * 🔄 변환 메서드
   */
  private convertToCoordinateCandidate(results: WikipediaLocationResult[]): CoordinateCandidate[] {
    return results.map(result => ({
      lat: result.lat,
      lng: result.lng,
      name: result.name,
      source: result.source,
      confidence: result.confidence,
      type: result.type,
      metadata: {
        description: result.description,
        wikidataId: result.wikidataId,
        extractedFrom: result.extractedFrom
      }
    }));
  }

  /**
   * ⏱️ 요청 간격 조절
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const waitTime = this.REQUEST_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * 💾 캐시 관리
   */
  private generateCacheKey(location: string, specificName: string): string {
    return `wiki_search:${location}:${specificName}`;
  }

  private getFromCache(key: string): WikipediaLocationResult[] | null {
    const cached = this.cache.get(key) as any;
    if (cached && cached._timestamp && 
        Date.now() - cached._timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private saveToCache(key: string, data: WikipediaLocationResult[]): void {
    this.cache.set(key, {
      data,
      _timestamp: Date.now()
    } as any);
  }

  /**
   * 📊 통계 및 관리
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()).slice(0, 10) // 처음 10개만
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Wikipedia 검색 캐시 클리어됨');
  }

  /**
   * 🔗 타입 호환성 계산
   */
  private calculateTypeCompatibility(
    wikipediaType: 'facility' | 'entrance' | 'building' | 'monument',
    specificType: 'entrance_gate' | 'ticket_booth' | 'main_building_entrance' | 
                  'courtyard_center' | 'information_center' | 'parking_area'
  ): number {
    const compatibilityMap: Record<string, Record<string, number>> = {
      // Wikipedia 타입별 호환성 점수
      'facility': {
        'ticket_booth': 1.0,
        'information_center': 1.0,
        'parking_area': 0.8,
        'entrance_gate': 0.6,
        'main_building_entrance': 0.4,
        'courtyard_center': 0.3
      },
      'entrance': {
        'entrance_gate': 1.0,
        'main_building_entrance': 1.0,
        'ticket_booth': 0.7,
        'information_center': 0.5,
        'courtyard_center': 0.3,
        'parking_area': 0.2
      },
      'building': {
        'main_building_entrance': 1.0,
        'ticket_booth': 0.8,
        'information_center': 0.8,
        'entrance_gate': 0.6,
        'courtyard_center': 0.4,
        'parking_area': 0.2
      },
      'monument': {
        'courtyard_center': 1.0,
        'main_building_entrance': 0.6,
        'entrance_gate': 0.5,
        'information_center': 0.3,
        'ticket_booth': 0.2,
        'parking_area': 0.1
      }
    };

    return compatibilityMap[wikipediaType]?.[specificType] || 0.1;
  }
}

// 싱글톤 인스턴스
export const wikipediaLocationSearcher = new WikipediaLocationSearcher();
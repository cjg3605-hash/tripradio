/**
 * 국가유산청 WFS API 서비스
 * 새로 발견한 고품질 문화재 API 통합
 */

import { resilientFetch } from '@/lib/resilient-fetch';
import { SourceData } from '../types/data-types';

export interface HeritageWFSItem {
  ccbaAdmin: string;      // 관리기관
  ccbaAsdt: string;       // 지정일자  
  ccbaMnm: string;        // 문화재명
  ccceName: string;       // 시대구분
  ccmaName: string;       // 문화재 분류
  cnX: string;            // X 좌표
  cnY: string;            // Y 좌표
  crltsnoNm: string;      // 문화재 번호
  ctgrname: string;       // 상세 분류
  sn: string;             // 일련번호
  vlocName: string;       // 소재지
}

export interface HeritageWFSResponse {
  response: {
    spca: HeritageWFSItem[];
    totalCnt: number;
  };
}

/**
 * 국가유산청 WFS API 문화재 분류 코드
 */
export const HERITAGE_CATEGORIES = {
  '11': { name: '국보', priority: 100 },
  '12': { name: '보물', priority: 90 },
  '13': { name: '사적', priority: 80 },
  '14': { name: '사적및명승', priority: 85 },
  '15': { name: '명승', priority: 75 },
  '16': { name: '천연기념물', priority: 70 },
  '17': { name: '국가무형유산', priority: 65 },
  '18': { name: '국가민속문화유산', priority: 60 },
  '79': { name: '등록문화유산', priority: 50 }
} as const;

export class HeritageWFSService {
  private readonly baseUrl = 'https://gis-heritage.go.kr/openapi/xmlService/spca.do';
  
  /**
   * 모든 문화재 분류에서 키워드 검색
   */
  async searchAllCategories(keyword: string): Promise<SourceData> {
    const startTime = Date.now();
    const results: HeritageWFSItem[] = [];
    const errors: string[] = [];
    
    try {
      // 모든 문화재 분류를 병렬로 검색
      const searchPromises = Object.keys(HERITAGE_CATEGORIES).map(async (categoryCode) => {
        try {
          const categoryResults = await this.searchByCategory(categoryCode, keyword);
          return categoryResults;
        } catch (error) {
          const errorMsg = `${HERITAGE_CATEGORIES[categoryCode as keyof typeof HERITAGE_CATEGORIES].name} 검색 실패: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMsg);
          return [];
        }
      });
      
      const allResults = await Promise.all(searchPromises);
      
      // 결과 병합 및 중복 제거
      const mergedResults = allResults.flat();
      const uniqueResults = this.removeDuplicates(mergedResults);
      
      // 우선순위별 정렬
      const sortedResults = this.sortByPriority(uniqueResults);
      
      return {
        sourceId: 'heritage_wfs',
        sourceName: '국가유산청 WFS API',
        data: sortedResults,
        retrievedAt: new Date().toISOString(),
        reliability: 0.95,
        latency: Date.now() - startTime,
        httpStatus: 200,
        metadata: {
          totalResults: sortedResults.length,
          searchKeyword: keyword,
          categoriesSearched: Object.keys(HERITAGE_CATEGORIES).length,
          errors: errors.length > 0 ? errors : undefined
        }
      };
      
    } catch (error) {
      throw new Error(`Heritage WFS 통합 검색 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 특정 문화재 분류에서 검색
   */
  async searchByCategory(categoryCode: string, keyword?: string): Promise<HeritageWFSItem[]> {
    try {
      const params = new URLSearchParams({
        ccbaKdcd: categoryCode
      });
      
      const url = `${this.baseUrl}?${params}`;
      
      const response = await resilientFetch(url, {
        timeout: 15000,
        retries: 3,
        headers: {
          'User-Agent': 'GuideAI-Heritage-WFS/1.0',
          'Accept': 'application/xml, text/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Heritage WFS API HTTP ${response.status}: ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      const parsedData = await this.parseXMLResponse(xmlText);
      
      // 키워드 필터링 (선택사항)
      if (keyword && keyword.length > 0) {
        return this.filterByKeyword(parsedData, keyword);
      }
      
      return parsedData;
      
    } catch (error) {
      throw new Error(`Heritage WFS 카테고리 검색 실패 (${categoryCode}): ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * XML 응답 파싱
   */
  private async parseXMLResponse(xmlText: string): Promise<HeritageWFSItem[]> {
    try {
      // XML에서 <spca> 태그들 추출
      const spcaPattern = /<spca>(.*?)<\/spca>/gs;
      const matches = xmlText.match(spcaPattern);
      
      if (!matches) {
        return [];
      }
      
      const items: HeritageWFSItem[] = [];
      
      for (const match of matches) {
        const item = this.parseSpacaItem(match);
        if (item) {
          items.push(item);
        }
      }
      
      return items;
      
    } catch (error) {
      throw new Error(`XML 파싱 실패: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 개별 <spca> 아이템 파싱
   */
  private parseSpacaItem(xmlItem: string): HeritageWFSItem | null {
    try {
      const extractValue = (tag: string): string => {
        const pattern = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
        const match = xmlItem.match(pattern);
        return match ? match[1].trim() : '';
      };
      
      const item: HeritageWFSItem = {
        ccbaAdmin: extractValue('ccbaAdmin'),
        ccbaAsdt: extractValue('ccbaAsdt'),
        ccbaMnm: extractValue('ccbaMnm'),
        ccceName: extractValue('ccceName'),
        ccmaName: extractValue('ccmaName'),
        cnX: extractValue('cnX'),
        cnY: extractValue('cnY'),
        crltsnoNm: extractValue('crltsnoNm'),
        ctgrname: extractValue('ctgrname'),
        sn: extractValue('sn'),
        vlocName: extractValue('vlocName')
      };
      
      // 필수 필드 검증
      if (!item.ccbaMnm || !item.ccmaName) {
        return null;
      }
      
      return item;
      
    } catch (error) {
      console.warn('SPCA 아이템 파싱 실패:', error);
      return null;
    }
  }
  
  /**
   * 키워드로 필터링
   */
  private filterByKeyword(items: HeritageWFSItem[], keyword: string): HeritageWFSItem[] {
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    return items.filter(item => {
      const searchText = [
        item.ccbaMnm,      // 문화재명
        item.vlocName,     // 소재지
        item.ccmaName,     // 분류명
        item.ctgrname      // 상세분류
      ].join(' ').toLowerCase();
      
      return searchText.includes(normalizedKeyword);
    });
  }
  
  /**
   * 중복 제거 (문화재명 + 소재지 기준)
   */
  private removeDuplicates(items: HeritageWFSItem[]): HeritageWFSItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.ccbaMnm}_${item.vlocName}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  /**
   * 우선순위별 정렬
   */
  private sortByPriority(items: HeritageWFSItem[]): HeritageWFSItem[] {
    return items.sort((a, b) => {
      // 문화재 분류별 우선순위
      const getPriority = (item: HeritageWFSItem): number => {
        for (const [code, info] of Object.entries(HERITAGE_CATEGORIES)) {
          if (item.ccmaName.includes(info.name)) {
            return info.priority;
          }
        }
        return 0;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // 높은 우선순위 먼저
      }
      
      // 우선순위가 같으면 이름순
      return a.ccbaMnm.localeCompare(b.ccbaMnm);
    });
  }
  
  /**
   * 좌표를 위경도로 변환 (대략적 변환)
   */
  convertCoordinates(cnX: string, cnY: string): { lat: number; lng: number } | null {
    try {
      const x = parseFloat(cnX);
      const y = parseFloat(cnY);
      
      if (isNaN(x) || isNaN(y)) {
        return null;
      }
      
      // TM 좌표계를 WGS84로 대략적 변환 (정확한 변환은 별도 라이브러리 필요)
      // 이는 대략적인 변환이므로 실제 서비스에서는 정확한 좌표 변환 라이브러리 사용 권장
      const lng = (x - 200000) / 100000 + 126.5;  // 대략적 변환식
      const lat = (y - 500000) / 100000 + 36.0;   // 대략적 변환식
      
      // 한국 영역 범위 체크
      if (lng < 124 || lng > 132 || lat < 33 || lat > 39) {
        return null;
      }
      
      return { lat, lng };
      
    } catch (error) {
      return null;
    }
  }
}

// 싱글톤 인스턴스
export const heritageWFSService = new HeritageWFSService();
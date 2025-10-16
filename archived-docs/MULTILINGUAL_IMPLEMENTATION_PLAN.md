# 🌍 GuideAI 다국어 API 구현 계획

## 📊 **현재 상황 정리**

### **사용 가능한 언어 API들:**
- 🇰🇷 **한국어 (KorService2)**: ✅ 완벽 작동
- 🇺🇸 **영어 (EngService2)**: ✅ 완벽 작동  
- 🇯🇵 **일본어 (JpnService2)**: ✅ 작동 (일본어 키워드만)
- 🇨🇳 **중국어 (ChsService2)**: ⚠️ 제한적 작동
- 🇪🇸 **스페인어 (SpnService2)**: ✅ 완벽 작동

---

## 🔧 **구현 방법**

### **1. 환경변수 설정**
```bash
# .env.local
KOREA_TOURISM_API_KEY=your_korean_key_here
JAPAN_TOURISM_API_KEY=your_japanese_key_here  # 별도 키
```

### **2. government-service.ts 수정**

```typescript
// 다국어 서비스 설정 추가
export class GovernmentDataService {
  private multilingualApis: Record<string, GovernmentAPI>;

  private constructor() {
    // 기존 apis 설정...
    
    // 다국어 API 설정 추가
    this.multilingualApis = {
      ko: {
        id: 'tourism_ko',
        name: '한국관광공사 한국어',
        baseUrl: 'https://apis.data.go.kr/B551011/KorService2',
        apiKey: process.env.KOREA_TOURISM_API_KEY,
        endpoints: { searchKeyword: '/searchKeyword2' },
        // ... 기타 설정
      },
      en: {
        id: 'tourism_en',
        name: '한국관광공사 영어',
        baseUrl: 'https://apis.data.go.kr/B551011/EngService2',
        apiKey: process.env.KOREA_TOURISM_API_KEY, // 공통키 사용
        endpoints: { searchKeyword: '/searchKeyword2' },
        // ... 기타 설정
      },
      ja: {
        id: 'tourism_ja',
        name: '한국관광공사 일본어',
        baseUrl: 'https://apis.data.go.kr/B551011/JpnService2',
        apiKey: process.env.JAPAN_TOURISM_API_KEY, // 별도키 사용
        endpoints: { searchKeyword: '/searchKeyword2' },
        // ... 기타 설정
      },
      zh: {
        id: 'tourism_zh',
        name: '한국관광공사 중국어',
        baseUrl: 'https://apis.data.go.kr/B551011/ChsService2',
        apiKey: process.env.KOREA_TOURISM_API_KEY, // 공통키 사용
        endpoints: { searchKeyword: '/searchKeyword2' },
        // ... 기타 설정
      },
      es: {
        id: 'tourism_es',
        name: '한국관광공사 스페인어',
        baseUrl: 'https://apis.data.go.kr/B551011/SpnService2',
        apiKey: process.env.KOREA_TOURISM_API_KEY, // 공통키 사용
        endpoints: { searchKeyword: '/searchKeyword2' },
        // ... 기타 설정
      }
    };
  }

  /**
   * 다국어 관광정보 검색
   */
  async searchTourismInfoMultilingual(
    query: string, 
    language: 'ko' | 'en' | 'ja' | 'zh' | 'es' = 'ko',
    limit: number = 20
  ): Promise<SourceData> {
    const cacheKey = `gov:tourism:${language}:${query}:${limit}`;
    const startTime = Date.now();

    try {
      // 캐시 확인
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return {
          sourceId: `tourism_${language}`,
          sourceName: `한국관광공사 ${this.getLanguageName(language)}`,
          data: cached,
          retrievedAt: new Date().toISOString(),
          reliability: 0.90,
          latency: Date.now() - startTime,
          httpStatus: 200
        };
      }

      const tourismData = await this.fetchTourismInfoByLanguage(query, language, limit);
      
      // 캐시에 저장
      await this.cache.set(cacheKey, tourismData, ['government', 'tourism', language]);

      return {
        sourceId: `tourism_${language}`,
        sourceName: `한국관광공사 ${this.getLanguageName(language)}`,
        data: tourismData,
        retrievedAt: new Date().toISOString(),
        reliability: 0.90,
        latency: Date.now() - startTime,
        httpStatus: 200
      };

    } catch (error) {
      throw new DataSourceError(
        `${this.getLanguageName(language)} 관광정보 검색 실패: ${error instanceof Error ? error.message : String(error)}`,
        `tourism_${language}`,
        'MULTILINGUAL_SEARCH_FAILED',
        { query, language, limit }
      );
    }
  }

  /**
   * 언어별 데이터 가져오기
   */
  private async fetchTourismInfoByLanguage(
    query: string, 
    language: 'ko' | 'en' | 'ja' | 'zh' | 'es',
    limit: number = 20
  ): Promise<any[]> {
    const api = this.multilingualApis[language];
    
    if (!api.apiKey) {
      throw new Error(`${this.getLanguageName(language)} API 키가 설정되지 않았습니다`);
    }

    // 언어별 키워드 최적화
    const optimizedQuery = this.optimizeQueryForLanguage(query, language);

    const params = new URLSearchParams({
      serviceKey: api.apiKey,
      numOfRows: limit.toString(),
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json',
      keyword: optimizedQuery
    });

    const url = `${api.baseUrl}${api.endpoints.searchKeyword}?${params}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/json',
        'User-Agent': `GuideAI-${language.toUpperCase()}/1.0`
      }
    });

    if (!response.ok) {
      throw new Error(`${this.getLanguageName(language)} API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseTourismData(data);
  }

  /**
   * 언어별 키워드 최적화
   */
  private optimizeQueryForLanguage(query: string, language: string): string {
    // 언어별 키워드 변환 로직
    const translations: Record<string, Record<string, string>> = {
      ja: {
        '경복궁': '景福宮',
        '창덕궁': '昌徳宮',
        '남산타워': '南山タワー',
        '부산': '釜山',
        '제주도': '済州島'
      },
      zh: {
        '경복궁': '景福宫',
        '창덕궁': '昌德宫',
        '남산타워': '南山塔',
        '부산': '釜山',
        '제주도': '济州岛'
      },
      es: {
        '경복궁': 'Palacio Gyeongbokgung',
        '창덕궁': 'Palacio Changdeokgung',
        '남산타워': 'Torre Namsan',
        '부산': 'Busan',
        '제주도': 'Isla Jeju'
      }
    };

    return translations[language]?.[query] || query;
  }

  /**
   * 언어명 반환
   */
  private getLanguageName(language: string): string {
    const names: Record<string, string> = {
      ko: '한국어',
      en: '영어', 
      ja: '일본어',
      zh: '중국어',
      es: '스페인어'
    };
    return names[language] || language;
  }
}
```

### **3. 오케스트레이터 통합**

```typescript
// data-orchestrator.ts 수정
export class DataIntegrationOrchestrator {
  async integrateLocationData(
    query: string,
    coordinates?: { lat: number; lng: number },
    options?: {
      dataSources?: string[];
      includeReviews?: boolean;
      includeImages?: boolean; 
      language?: string; // 추가
    }
  ): Promise<DataIntegrationResult> {
    
    const language = options?.language || 'ko';
    
    // 다국어 데이터 수집
    if (targetSources.includes('government')) {
      promises.push(
        this.timeoutPromise(
          this.services.get('government').searchTourismInfoMultilingual(query, language),
          this.config.timeout,
          `${language} 정부 데이터 검색 시간초과`
        )
      );
    }
    
    // ... 나머지 로직
  }
}
```

---

## 🚀 **구현 우선순위**

### **Phase 1: 핵심 언어 (즉시)**
- ✅ 한국어 (완벽)
- ✅ 영어 (완벽)

### **Phase 2: 추가 언어 (1-2주)**
- ✅ 일본어 (좋음)
- ✅ 스페인어 (좋음)

### **Phase 3: 보완 언어 (필요시)**
- ⚠️ 중국어 (제한적)

---

## 🧪 **테스트 방법**

```javascript
// 다국어 테스트
const languages = ['ko', 'en', 'ja', 'es'];
const query = '경복궁';

for (const lang of languages) {
  const result = await orchestrator.integrateLocationData(query, undefined, {
    language: lang,
    dataSources: ['government']
  });
  
  console.log(`${lang}: ${result.success ? '✅' : '❌'} ${result.sources.length}개 소스`);
}
```

---

## 🎯 **결론**

### **현재 상태:**
- **5개 언어 모두 API 키 확보 완료** ✅
- **키워드 검색 기능 모두 작동** ✅
- **구현 준비 완료** ✅

### **권장사항:**
1. **즉시 구현**: 한국어 + 영어
2. **다음 단계**: 일본어 + 스페인어 추가
3. **나중에**: 중국어 (필요시)

모든 언어 API가 준비되어 있으니, 필요에 따라 단계적으로 구현하시면 됩니다! 🌍
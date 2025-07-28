# 🏛️ 국가유산청 GIS API 통합 계획

## 🎯 **발견한 새로운 API**

### **국가유산청 GIS 공간정보 서비스**
- **기관**: 국가유산청 (구 문화재청)
- **서비스**: GIS 기반 문화재 공간정보
- **URL**: `https://gis-heritage.go.kr/openapi/`
- **타입**: WMS/WFS 지리정보 서비스

---

## 📊 **제공되는 데이터 레이어**

| 레이어 코드 | 데이터명 | 활용도 |
|-------------|----------|--------|
| TB_ODTR_MID | 국가지정유산 지정구역 | ⭐⭐⭐⭐⭐ |
| TB_OUSR_MID | 국가지정유산 보호구역 | ⭐⭐⭐⭐ |
| TB_MDQT_MID | 시도지정유산 지정구역 | ⭐⭐⭐⭐ |
| TB_MUSQ_MID | 시도지정유산 보호구역 | ⭐⭐⭐ |
| TB_HRNR_MID | 현상변경 허용기준 | ⭐⭐ |
| TB_SHOV_MID | 문화유적분포지도 | ⭐⭐⭐⭐⭐ |
| TB_ERHT_MID | 국가유산조사구역 | ⭐⭐⭐ |
| TB_THFS_MID | 등록문화유산 | ⭐⭐⭐⭐ |

---

## 🔧 **API 통합 방법**

### **1. 현재 시스템과의 차이점**

#### **기존 API (XML)**
```typescript
// 현재 사용 중
baseUrl: 'http://www.cha.go.kr/cha/SearchKindOpenapiList.do'
// 장점: API 키 불필요, 텍스트 검색 가능
// 단점: 구식 XML, 정확한 위치정보 부족
```

#### **새 GIS API (WFS/WMS)**
```typescript
// 새로 발견
wfsUrl: 'https://www.gis-heritage.go.kr/openapi/xmlService/spca.do'
wmsUrl: 'https://gis-heritage.go.kr/checkKey.do'
// 장점: 정확한 GIS 좌표, 현대적 지리정보 서비스
// 단점: 도메인 등록 필요, GIS 전문 지식 요구
```

### **2. 통합 전략: 하이브리드 접근**

```typescript
// government-service.ts 확장
export class GovernmentDataService {
  private apis: Record<string, GovernmentAPI>;
  private gisApis: Record<string, GISHeritageAPI>; // 새로 추가

  private constructor() {
    // 기존 APIs
    this.apis = {
      heritage: {
        id: 'heritage',
        name: '문화재청 문화유산정보 (레거시)',
        baseUrl: 'http://www.cha.go.kr/cha/SearchKindOpenapiList.do',
        responseType: 'xml',
        reliability: 0.80, // 레거시로 신뢰도 낮춤
        features: ['text_search', 'basic_info']
      }
    };

    // 새로운 GIS APIs
    this.gisApis = {
      heritage_gis: {
        id: 'heritage_gis',
        name: '국가유산청 GIS 공간정보',
        wfsUrl: 'https://www.gis-heritage.go.kr/openapi/xmlService/spca.do',
        wmsUrl: 'https://gis-heritage.go.kr/checkKey.do',
        domainKey: process.env.HERITAGE_GIS_DOMAIN_KEY,
        responseType: 'xml/gml',
        reliability: 0.95,
        features: ['spatial_query', 'precise_location', 'boundary_info'],
        layers: [
          'TB_ODTR_MID', // 국가지정유산 지정구역
          'TB_OUSR_MID', // 국가지정유산 보호구역
          'TB_SHOV_MID'  // 문화유적분포지도
        ]
      }
    };
  }

  /**
   * 하이브리드 문화재 검색 (텍스트 + 공간)
   */
  async searchCulturalHeritageHybrid(
    query: string,
    coordinates?: { lat: number; lng: number },
    radius?: number
  ): Promise<SourceData[]> {
    const results: SourceData[] = [];

    try {
      // 1단계: 기존 API로 텍스트 검색
      const textResults = await this.searchCulturalHeritage(query);
      results.push(textResults);
      
      // 2단계: 좌표가 있으면 GIS API로 공간 검색
      if (coordinates && this.gisApis.heritage_gis.domainKey) {
        const spatialResults = await this.searchHeritageByLocation(
          coordinates.lat, 
          coordinates.lng, 
          radius || 1000
        );
        results.push(spatialResults);
      }

      return results;
    } catch (error) {
      // 에러 시 기존 API만 사용
      console.warn('GIS API 실패, 레거시 API만 사용:', error.message);
      return [await this.searchCulturalHeritage(query)];
    }
  }

  /**
   * GIS API로 위치 기반 문화재 검색
   */
  private async searchHeritageByLocation(
    lat: number, 
    lng: number, 
    radius: number
  ): Promise<SourceData> {
    const gisApi = this.gisApis.heritage_gis;
    
    // WFS GetFeature 요청으로 공간 데이터 조회
    const wfsParams = new URLSearchParams({
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: 'TB_ODTR_MID,TB_SHOV_MID', // 국가지정유산 + 문화유적분포
      outputFormat: 'application/xml',
      // BBOX로 반경 검색
      bbox: `${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}`,
      srsName: 'EPSG:4326'
    });

    const url = `${gisApi.wfsUrl}?${wfsParams}`;
    
    const response = await resilientFetch(url, {
      timeout: 15000,
      retries: 3,
      headers: {
        'Accept': 'application/xml',
        'User-Agent': 'GuideAI-Heritage/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Heritage GIS API HTTP ${response.status}`);
    }

    const xmlData = await response.text();
    const parsedData = this.parseGISHeritageData(xmlData);

    return {
      sourceId: 'heritage_gis',
      sourceName: '국가유산청 GIS 공간정보',
      data: parsedData,
      retrievedAt: new Date().toISOString(),
      reliability: 0.95,
      latency: 0,
      httpStatus: 200
    };
  }

  /**
   * GIS XML 데이터 파싱
   */
  private parseGISHeritageData(xmlData: string): any[] {
    // GML(Geography Markup Language) 파싱
    // 실제 구현에서는 xml2js 또는 DOM parser 사용
    const features = [];
    
    // XML에서 gml:featureMember 추출
    const featurePattern = /<gml:featureMember>(.*?)<\/gml:featureMember>/gs;
    let match;
    
    while ((match = featurePattern.exec(xmlData)) !== null) {
      const featureXml = match[1];
      
      // 각 feature에서 속성 추출
      const feature = {
        id: this.extractXMLValue(featureXml, 'fid'),
        name: this.extractXMLValue(featureXml, 'ccmaName'),
        type: this.extractXMLValue(featureXml, 'ccbaKdcd'),
        address: this.extractXMLValue(featureXml, 'ccbaLcad'),
        designation_date: this.extractXMLValue(featureXml, 'ccbaAsdt'),
        coordinates: this.extractGMLCoordinates(featureXml),
        source: 'heritage_gis',
        layer: this.determineLayer(featureXml)
      };
      
      features.push(feature);
    }
    
    return features;
  }

  private extractGMLCoordinates(xml: string): { lat: number; lng: number } | null {
    // GML Point 또는 Polygon 좌표 추출
    const pointPattern = /<gml:Point.*?<gml:coordinates>(.*?)<\/gml:coordinates>.*?<\/gml:Point>/s;
    const match = xml.match(pointPattern);
    
    if (match) {
      const coords = match[1].split(',');
      return {
        lng: parseFloat(coords[0]),
        lat: parseFloat(coords[1])
      };
    }
    
    return null;
  }
}
```

---

## 🔑 **API 키 신청 방법**

### **1. 공공데이터포털에서 검색**
```
https://www.data.go.kr/ → "국가유산청 GIS" 또는 "문화재 공간정보" 검색
```

### **2. 예상되는 신청 정보**
- **서비스명**: 국가유산청 문화재 공간정보 서비스
- **인증방식**: 도메인 기반 또는 API 키
- **제공기관**: 국가유산청

### **3. 환경변수 설정**
```bash
# .env.local에 추가
HERITAGE_GIS_API_KEY=your_heritage_gis_key_here
HERITAGE_GIS_DOMAIN_KEY=your_domain_registration_key
```

---

## 🚀 **구현 우선순위**

### **Phase 1: 현재 유지 (즉시)**
- ✅ 기존 XML API 계속 사용
- ✅ 다른 핵심 API들 (관광공사, Google Places) 우선 구현

### **Phase 2: GIS API 조사 (1주 내)**
- 🔍 공공데이터포털에서 정확한 API 정보 확인
- 📝 API 키 또는 도메인 등록 신청
- 🧪 실제 데이터 조회 테스트

### **Phase 3: 하이브리드 통합 (2-3주)**
- 🔧 기존 API + GIS API 하이브리드 구현
- 📍 위치 기반 정확한 문화재 정보 제공
- 🗺️ 지정구역/보호구역 경계 정보 활용

---

## 🎯 **기대 효과**

### **기존 API만 사용 시**
- ✅ 텍스트 검색 가능
- ❌ 부정확한 위치 정보
- ❌ 경계 정보 없음

### **GIS API 추가 시**
- ✅ **정확한 GPS 좌표**
- ✅ **지정구역/보호구역 경계**
- ✅ **국가/시도 지정 구분**
- ✅ **공간 기반 검색**
- ✅ **등록문화유산 포함**

---

## 💡 **즉시 실행할 일**

### **당신이 해야 할 것:**
1. **공공데이터포털 접속**: https://www.data.go.kr/
2. **검색 키워드**: 
   - "국가유산청 GIS"
   - "문화재 공간정보"
   - "국가유산청 공간정보 서비스"
3. **API 정보 확인 및 신청**

### **찾아야 할 정보:**
- 정확한 API 이름
- 인증 방식 (API 키 vs 도메인 등록)
- 사용 제한 및 요금
- 제공되는 데이터 필드

**이 GIS API를 추가하면 훨씬 정확하고 상세한 문화재 정보를 제공할 수 있습니다!** 🏛️✨

현재는 **기존 API로도 충분히 작동**하므로 급하지 않지만, **GIS API를 추가하면 품질이 크게 향상**됩니다!
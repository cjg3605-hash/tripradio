# 🏛️ 문화재 API 업데이트 가이드

## 🔍 **현재 상황 분석**

### **기존 API (현재 사용 중)**
- **이름**: 문화재청 문화유산정보  
- **URL**: `http://www.cha.go.kr/cha/SearchKindOpenapiList.do`
- **상태**: ✅ 작동 중 (XML 응답)
- **문제**: 구식 형태, API 키 불필요하지만 기능 제한적

### **새로운 API (예상)**
- **이름**: 국가유산청_문화재 공간정보
- **설명**: 문화재청이 국가유산청으로 개편되면서 새롭게 제공
- **예상 기능**: JSON 응답, 더 상세한 정보, API 키 필요

---

## 📋 **확인해야 할 사항**

### **1. 공공데이터포털에서 검색할 키워드들**
```
1. "국가유산청_문화재 공간정보" ⭐ (가장 유력)
2. "국가유산청 문화재 검색"
3. "문화재 공간정보 서비스"
4. "국가지정문화재 정보"
5. "문화유산 종합정보"
```

### **2. 공공데이터포털 검색 단계**
1. [공공데이터포털](https://www.data.go.kr/) 접속
2. 위 키워드들로 검색
3. API 상세 정보 확인
4. 필요시 활용신청

---

## 🔧 **임시 해결책**

현재 기존 API가 작동하므로 당장은 사용 가능하지만, 다음과 같이 개선할 수 있습니다:

### **Option 1: 기존 API 개선 (단기)**
```typescript
// government-service.ts 수정
heritage: {
  id: 'heritage',
  name: '문화재청 문화유산정보 (XML)',
  baseUrl: 'http://www.cha.go.kr/cha/SearchKindOpenapiList.do',
  // API 키 불필요
  endpoints: {
    search: '',
    list: ''
  },
  responseType: 'xml', // XML 응답 처리 명시
  reliability: 0.85, // 구식이므로 신뢰도 약간 낮춤
  dataTypes: ['heritage', 'cultural_property', 'historical_site']
}
```

### **Option 2: 새 API 추가 (권장)**
```typescript
// 새로운 국가유산청 API 설정
heritage_new: {
  id: 'heritage_new',
  name: '국가유산청 문화재 공간정보',
  baseUrl: 'https://api.odcloud.kr/api/새로운엔드포인트',
  apiKey: process.env.HERITAGE_SPACE_API_KEY,
  endpoints: {
    search: '/search',
    spatial: '/spatial',
    detail: '/detail'
  },
  responseType: 'json',
  reliability: 0.95,
  dataTypes: ['heritage', 'cultural_property', 'spatial_info']
}
```

---

## 🧪 **새 API 발견 시 테스트 방법**

### **API 키 발급 후 테스트**
```javascript
// test-new-heritage-api.js
const NEW_HERITAGE_API_KEY = 'your_new_api_key_here';

async function testNewHeritageAPI() {
  const testQueries = ['경복궁', '석굴암', '불국사', '창덕궁'];
  
  for (const query of testQueries) {
    try {
      const params = new URLSearchParams({
        serviceKey: NEW_HERITAGE_API_KEY,
        keyword: query,
        numOfRows: '5',
        pageNo: '1',
        type: 'json'
      });
      
      const url = `https://api.odcloud.kr/api/heritage-endpoint?${params}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${query}: ${data.items?.length || 0}개 결과`);
      } else {
        console.log(`❌ ${query}: ${response.status} 오류`);
      }
    } catch (error) {
      console.log(`❌ ${query}: ${error.message}`);
    }
  }
}
```

---

## 📊 **현재 우선순위**

### **즉시 작업 (Priority 1)**
1. ✅ **기존 API 유지**: 현재 작동하므로 그대로 사용
2. 🔍 **새 API 조사**: 공공데이터포털에서 "국가유산청" 검색

### **단기 작업 (Priority 2)**  
1. **새 API 발견 시**: 키 발급 및 통합
2. **기존 API 개선**: XML 파싱 로직 최적화

### **장기 작업 (Priority 3)**
1. **이중화 시스템**: 구 API + 신 API 동시 지원
2. **자동 전환**: 신 API 실패 시 구 API로 fallback

---

## 🎯 **실행 계획**

### **Step 1: 현재 상태 유지**
- 기존 XML API 계속 사용
- 다른 중요한 API들 (관광공사, Google Places) 우선 구현

### **Step 2: 새 API 조사**
- 공공데이터포털에서 "국가유산청" 관련 API 검색
- 발견 시 상세 스펙 확인

### **Step 3: 발견 시 통합**
```typescript
// 이중화 시스템 예시
async searchCulturalHeritage(query: string): Promise<SourceData> {
  try {
    // 1순위: 새 API 시도
    if (this.apis.heritage_new?.apiKey) {
      return await this.fetchFromNewHeritageAPI(query);
    }
  } catch (error) {
    console.warn('새 문화재 API 실패, 기존 API로 fallback');
  }
  
  // 2순위: 기존 XML API
  return await this.fetchFromOldHeritageAPI(query);
}
```

---

## 💡 **즉시 해야 할 일**

### **당신이 해야 할 것:**
1. **공공데이터포털 접속**: https://www.data.go.kr/
2. **검색**: "국가유산청_문화재 공간정보"
3. **확인**: API 존재 여부 및 상세 정보
4. **필요시**: API 키 신청

### **발견되면 알려주세요:**
- API 이름과 엔드포인트
- 필요한 인증키 정보  
- 응답 형식 (JSON/XML)
- 제공되는 데이터 필드들

현재는 **기존 API가 작동**하므로 급하지 않지만, **새 API를 찾으면 더 좋은 서비스**를 제공할 수 있습니다! 🏛️✨
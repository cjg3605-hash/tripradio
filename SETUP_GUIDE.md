# 🔧 GuideAI 완전한 사실검증 시스템 구축 가이드

## 🚨 **현재 상황 요약**

**문제**: 시스템은 완벽하게 구현되어 있지만 API 키 부재로 인해 더미 데이터만 생성 중
**증거**: "존재하지않는위치12345"도 82.3% 신뢰도로 반환
**해결책**: API 키 설정 + 데이터-AI 통합 로직 수정

---

## 📋 **필요한 API 키 목록 및 취득 방법**

### 1. Google Places API Key 🌍
**필수도**: Critical ⭐⭐⭐⭐⭐

#### 취득 방법:
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "라이브러리" 이동
4. "Places API" 검색 후 활성화
5. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키"
6. API 키 제한 설정 (IP 주소 또는 HTTP 리퍼러)

#### 비용:
- 월 $200 무료 크레딧
- Text Search: $32/1000건
- Nearby Search: $32/1000건
- Place Details: $17/1000건

#### 환경변수 설정:
```bash
GOOGLE_PLACES_API_KEY=AIzaSyC...your_key_here
```

### 2. 한국관광공사 TourAPI 🇰🇷
**필수도**: High ⭐⭐⭐⭐

#### 취득 방법:
1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. "한국관광공사_국문 관광정보 서비스_GW" 검색
3. 활용신청 → 승인 대기 (1-2일)
4. 승인 후 인증키 발급

#### 비용: 무료

#### 환경변수 설정:
```bash
KOREA_TOURISM_API_KEY=your_service_key_here
```

### 3. 문화재청 API 🏛️
**상태**: ❌ 미구현 (WFS 로직으로 대체됨)

#### 용도: 한국 문화유산 정보 (한국관광공사 API로 대체)

#### 비용: 무료

#### 참고: API 키 없이 WFS 방식으로 구현됨

### 4. 통계청 KOSIS API 📊
**필수도**: Medium ⭐⭐⭐

#### 취득 방법:
1. [KOSIS 국가통계포털](https://kosis.kr/) 회원가입
2. OpenAPI 신청 → 승인
3. API 키 발급

#### 비용: 무료

#### 환경변수 설정:
```bash
KOSIS_API_KEY=your_api_key_here
```

### 5. Wikidata (추가 설정 불필요) 🌐
**필수도**: Medium ⭐⭐⭐

#### 설정:
- API 키 불필요 (SPARQL 엔드포인트 공개)
- 단, Rate Limiting 존재
- User-Agent 헤더 설정 필요

---

## 🔧 **긴급 수정 사항**

### **1. 환경변수 설정 (.env.local)**
```bash
# Google APIs
GOOGLE_PLACES_API_KEY=your_google_places_key
GEMINI_API_KEY=your_gemini_key

# 한국 정부 APIs
KOREA_TOURISM_API_KEY=your_tourism_key
KOSIS_API_KEY=your_kosis_key

# 기타
NODE_ENV=development
```

### **2. 데이터-AI 통합 로직 수정**

#### `src/lib/ai/gemini.ts` 수정:
```typescript
export async function generatePersonalizedGuide(
  location: string,
  userProfile: UserProfile
) {
  try {
    // 🔥 Critical: 실제 데이터 수집 추가
    const orchestrator = DataIntegrationOrchestrator.getInstance();
    const dataIntegrationResult = await orchestrator.integrateLocationData(
      location.trim(),
      undefined,
      {
        dataSources: ['unesco', 'wikidata', 'government', 'google_places'],
        includeReviews: true,
        includeImages: true,
        language: safeProfile.language
      }
    );

    // 🔥 Critical: 사실 기반 프롬프트 생성
    const factBasedPrompt = createFactBasedPrompt(
      location, 
      safeProfile, 
      dataIntegrationResult
    );

    // AI 생성
    const result = await model.generateContent(factBasedPrompt);
    
    // 🔥 Critical: 실제 데이터와 교차 검증
    const verificationResult = await verifyWithExternalData(
      parsed, 
      location, 
      dataIntegrationResult.data
    );

    return {
      ...parsed,
      dataIntegration: dataIntegrationResult,
      factVerification: verificationResult
    };

  } catch (error) {
    // 명확한 실패 처리
    return generateFallbackGuide(location, safeProfile);
  }
}

// 🔥 새로 추가할 함수
function createFactBasedPrompt(
  location: string, 
  profile: UserProfile, 
  dataResult: DataIntegrationResult
): string {
  if (!dataResult.success || !dataResult.data) {
    return `${GEMINI_PROMPTS.GUIDE_GENERATION.system}

⚠️ **데이터 제한 안내**: ${location}에 대한 외부 검증 데이터가 부족합니다.
일반적인 정보만을 바탕으로 제한된 가이드를 생성하며, 정확성을 보장할 수 없습니다.

${GEMINI_PROMPTS.GUIDE_GENERATION.user(location, profile)}`;
  }

  const factualInfo = formatFactualData(dataResult.data);
  
  return `${GEMINI_PROMPTS.GUIDE_GENERATION.system}

🔍 **검증된 사실 정보** (아래 정보만 사용하세요):
${factualInfo}

**데이터 신뢰도**: ${(dataResult.data.confidence * 100).toFixed(1)}%
**검증 소스**: ${dataResult.sources.join(', ')}
**데이터 수집 시간**: ${new Date().toLocaleString('ko-KR')}

⚠️ **중요**: 위에 제시된 검증된 정보만을 사용하여 가이드를 생성하세요.
확인되지 않은 정보는 절대 포함하지 마세요.

${GEMINI_PROMPTS.GUIDE_GENERATION.user(location, profile)}`;
}

function formatFactualData(data: IntegratedData): string {
  let factualInfo = '';
  
  if (data.location) {
    factualInfo += `📍 **위치 정보**:\n`;
    factualInfo += `- 좌표: ${data.location.coordinates?.lat}, ${data.location.coordinates?.lng}\n`;
    factualInfo += `- 주소: ${data.location.address || '정보 없음'}\n\n`;
  }
  
  if (data.basicInfo) {
    factualInfo += `ℹ️ **기본 정보**:\n`;
    factualInfo += `- 공식명: ${data.basicInfo.officialName || '정보 없음'}\n`;
    factualInfo += `- 유형: ${data.basicInfo.type || '정보 없음'}\n`;
    factualInfo += `- 설명: ${data.basicInfo.description || '정보 없음'}\n\n`;
  }
  
  if (data.sources && data.sources.length > 0) {
    factualInfo += `📚 **검증 소스별 정보**:\n`;
    data.sources.forEach((source, index) => {
      factualInfo += `${index + 1}. ${source.sourceName}: ${source.reliability}% 신뢰도\n`;
    });
  }
  
  return factualInfo || '검증된 구체적 정보가 부족합니다.';
}
```

### **3. 실제 사실 검증 함수 추가**

#### `src/lib/ai/validation/accuracy-validator.ts`에 추가:
```typescript
/**
 * 🔥 Critical: 외부 데이터와 교차 검증
 */
export function verifyWithExternalData(
  aiResponse: any,
  location: string,
  externalData?: IntegratedData
): {
  isFactVerified: boolean;
  confidenceScore: number;
  dataSourceCount: number;
  verificationMethod: string;
  conflicts: string[];
} {
  if (!externalData || !externalData.sources || externalData.sources.length === 0) {
    return {
      isFactVerified: false,
      confidenceScore: 0.0,
      dataSourceCount: 0,
      verificationMethod: 'no_external_data',
      conflicts: ['외부 검증 데이터 없음']
    };
  }

  const conflicts: string[] = [];
  let factCheckScore = 0;
  let checkCount = 0;

  // 좌표 정보 검증
  if (aiResponse.detailedStops && externalData.location?.coordinates) {
    aiResponse.detailedStops.forEach((stop: any, index: number) => {
      if (stop.coordinates) {
        const distance = calculateDistance(
          stop.coordinates,
          externalData.location.coordinates
        );
        
        if (distance > 1000) { // 1km 이상 차이
          conflicts.push(`Stop ${index + 1}: 좌표 불일치 (${distance.toFixed(0)}m 차이)`);
        } else {
          factCheckScore++;
        }
        checkCount++;
      }
    });
  }

  // 기본 정보 검증
  if (aiResponse.overview && externalData.basicInfo?.description) {
    const similarityScore = calculateTextSimilarity(
      aiResponse.overview,
      externalData.basicInfo.description
    );
    
    if (similarityScore < 0.3) {
      conflicts.push('개요 정보가 외부 데이터와 상이함');
    } else {
      factCheckScore++;
    }
    checkCount++;
  }

  const finalScore = checkCount > 0 ? factCheckScore / checkCount : 0;

  return {
    isFactVerified: finalScore >= 0.7 && conflicts.length === 0,
    confidenceScore: finalScore,
    dataSourceCount: externalData.sources.length,
    verificationMethod: 'multi_source_cross_reference',
    conflicts
  };
}

function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.lat * Math.PI/180;
  const φ2 = coord2.lat * Math.PI/180;
  const Δφ = (coord2.lat-coord1.lat) * Math.PI/180;
  const Δλ = (coord2.lng-coord1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function calculateTextSimilarity(text1: string, text2: string): number {
  // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 사용 권장)
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}
```

### **4. 오케스트레이터 에러 처리 개선**

#### `src/lib/data-sources/orchestrator/data-orchestrator.ts` 수정:
```typescript
// line 150 근처 수정
if (successfulSources.length === 0) {
  // 🔥 개선: 명확한 실패 정보 제공
  console.warn(`❌ 모든 데이터 소스 실패 - 위치: ${query}`);
  console.warn('실패 원인:', errors.map(e => e.message));
  
  return {
    success: false,
    errors,
    performance: {
      ...this.metrics,
      responseTime: Date.now() - startTime
    },
    sources: [],
    // 🔥 추가: 명확한 실패 이유
    failureReason: 'all_data_sources_failed',
    recommendations: [
      'API 키 설정을 확인하세요',
      '네트워크 연결을 확인하세요',
      '입력된 위치명을 다시 확인하세요'
    ]
  };
}
```

---

## 🧪 **테스트 및 검증 방법**

### **1. API 키 설정 후 테스트**
```bash
node validate-integration.js
```

**예상 결과**:
- 실제 위치: 높은 신뢰도 + 다양한 소스
- 가짜 위치: 0% 신뢰도 + "데이터 없음" 메시지

### **2. 개별 API 테스트**
```bash
# Google Places API
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=경복궁&key=YOUR_API_KEY"

# 한국관광공사 API
curl "http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=YOUR_KEY&keyword=경복궁&MobileOS=ETC&MobileApp=GuideAI"
```

### **3. 사실 검증 테스트**
```javascript
// 명백히 틀린 정보로 테스트
const fakeResponse = {
  overview: "경복궁은 1990년에 지어진 현대식 쇼핑몰입니다",
  detailedStops: [{
    coordinates: { lat: 0, lng: 0 } // 잘못된 좌표
  }]
};

const verification = verifyWithExternalData(fakeResponse, "경복궁", realData);
console.log(verification.conflicts); // 에러 목록 확인
```

---

## 📅 **구현 일정**

### **Day 1 (긴급)**
- [ ] API 키 발급 및 설정
- [ ] 기본 데이터-AI 통합 구현
- [ ] 명확한 실패 처리 구현

### **Day 2-3**
- [ ] 실제 사실 검증 로직 구현
- [ ] 좌표/텍스트 교차 검증
- [ ] 통합 테스트 수행

### **Week 1**
- [ ] 성능 최적화
- [ ] 에러 처리 개선
- [ ] 사용자 피드백 시스템

---

## 🎯 **성공 기준**

1. **실제 위치 (경복궁)**: 
   - ✅ 90%+ 신뢰도
   - ✅ 3+ 데이터 소스
   - ✅ 정확한 좌표/정보

2. **소규모 위치 (홍대놀이터)**:
   - ✅ 제한된 정보 + 명확한 안내
   - ✅ "정보 부족" 메시지

3. **가짜 위치 (존재하지않는위치12345)**:
   - ✅ 0% 신뢰도
   - ✅ "데이터 없음" 응답
   - ✅ 가이드 생성 거부

**최종 목표**: "완전한 사실검증이 된 가이드"를 실제로 달성하여 사용자가 신뢰할 수 있는 여행 정보 제공

---

## 📞 **지원 및 문제해결**

### **API 키 발급 문제**
- Google: [지원 센터](https://cloud.google.com/support)
- 공공데이터: [문의하기](https://www.data.go.kr/tcs/dss/selectDataSetList.do)

### **기술적 문제**
- 네트워크 에러: DNS/방화벽 설정 확인
- 요청 제한: Rate limiting 확인
- 응답 형식: API 문서 재확인

이 가이드를 따라 구현하면 진정한 "사실 검증된 가이드 생성 시스템"을 완성할 수 있습니다!
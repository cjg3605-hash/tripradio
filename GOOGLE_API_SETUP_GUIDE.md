# 🗺️ Google API 설정 가이드

## 📋 **핵심 정보**

### ✅ **하나의 키로 모든 서비스 사용 가능**
Google Cloud API 키 하나로 다음 서비스들을 모두 사용할 수 있습니다:
- **Google Places API** (장소 검색, 상세 정보)
- **Google Maps API** (지도 표시, 경로)
- **Google Geocoding API** (주소 ↔ 좌표 변환)
- **Google Maps JavaScript API** (웹 지도)

### 🔑 **필요한 키는 단 1개**
```bash
# .env.local에 하나만 설정하면 됨
GOOGLE_API_KEY=your_actual_google_api_key_here
```

---

## 🛠️ **Google Cloud API 키 생성 방법**

### **1. Google Cloud Console 접속**
https://console.cloud.google.com/

### **2. 프로젝트 생성 또는 선택**
- 새 프로젝트 생성 또는 기존 프로젝트 선택

### **3. API 활성화**
다음 API들을 활성화해야 합니다:
```
✅ Places API
✅ Maps JavaScript API  
✅ Geocoding API
✅ Maps Static API (선택사항)
```

### **4. API 키 생성**
1. **APIs & Services > Credentials** 이동
2. **Create Credentials > API Key** 클릭
3. 생성된 키 복사

### **5. API 키 제한 설정 (보안)**
```yaml
Application restrictions:
  - HTTP referrers (web sites)
  - Add: https://yourdomain.com/*
  - Add: http://localhost:3000/* (개발용)

API restrictions:
  - Restrict key
  - Select APIs:
    ✅ Places API
    ✅ Maps JavaScript API
    ✅ Geocoding API
```

---

## 🔧 **GuideAI에서의 사용**

### **사용되는 Google 서비스들**
1. **Google Places API**: 실시간 장소 정보, 리뷰, 운영시간
2. **Geocoding API**: 주소를 좌표로 변환
3. **Maps JavaScript API**: 지도 표시 (프론트엔드)

### **환경변수 설정**
```bash
# .env.local 파일에 추가
GOOGLE_API_KEY=AIzaSyBvOkBwNJbdosim30ZrGtXjBTPnzHiKE-M  # 예시 키

# 하위 호환성 (실제로는 모두 위와 같은 키)
GOOGLE_PLACES_API_KEY=AIzaSyBvOkBwNJbdosim30ZrGtXjBTPnzHiKE-M
GOOGLE_MAPS_API_KEY=AIzaSyBvOkBwNJbdosim30ZrGtXjBTPnzHiKE-M
```

---

## 💰 **비용 정보**

### **Google Places API 가격**
```
- Place Search: $17/1000 requests
- Place Details: $17/1000 requests
- Nearby Search: $32/1000 requests
- Text Search: $32/1000 requests

월 무료 할당량: $200 크레딧 (매월)
```

### **예상 사용량 (GuideAI)**
```
일일 예상 요청: 100-500회
월 예상 비용: $10-50 (무료 할당량 내 가능)
```

---

## ⚡ **성능 최적화**

### **캐싱 전략**
```typescript
// GuideAI에서 구현된 캐싱
const cacheKey = `google_places:${query}:${location}`;
const cachedResult = await cache.get(cacheKey);

// TTL: 1시간 (장소 정보는 자주 변하지 않음)
await cache.set(cacheKey, result, 3600);
```

### **요청 최적화**
```typescript
// 필요한 필드만 요청하여 비용 절약
const fields = [
  'place_id', 'name', 'formatted_address', 
  'rating', 'user_ratings_total', 'opening_hours',
  'geometry', 'types', 'photos'
];
```

---

## 🧪 **API 키 테스트 방법**

### **1. 간단한 테스트**
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=경복궁&key=YOUR_API_KEY"
```

### **2. Node.js 테스트**
```javascript
const API_KEY = 'your_google_api_key_here';

async function testGoogleAPI() {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=경복궁&key=${API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.status === 'OK') {
    console.log('✅ Google API 작동 정상');
    console.log('📍 결과 수:', data.results.length);
  } else {
    console.log('❌ API 오류:', data.status);
  }
}
```

---

## 🎯 **결론**

### ✅ **필요한 것**
- **Google API 키 1개**: 모든 서비스에서 공통 사용
- **API 활성화**: Places, Maps, Geocoding API 활성화
- **환경변수 설정**: `GOOGLE_API_KEY` 하나만 필요

### ❌ **필요하지 않은 것**  
- 별도의 Maps API 키
- 서비스별 다른 키
- 복잡한 설정

**결론**: `GOOGLE_PLACES_API_KEY`만 설정하셨다면 충분합니다! 같은 키를 `GOOGLE_API_KEY`로도 사용하시면 됩니다. 🗺️✨
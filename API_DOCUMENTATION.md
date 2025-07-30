# 📡 GUIDEAI API 문서

## 개요

GUIDEAI API는 RESTful 설계 원칙을 따르며, AI 기반 여행 가이드 생성, 위치 검색, 사용자 인증 등의 기능을 제공합니다. 모든 API는 TypeScript로 구현되어 타입 안전성을 보장합니다.

## 🔗 기본 정보

- **Base URL**: `https://your-domain.com/api`
- **Content-Type**: `application/json`
- **Rate Limiting**: 10 requests per 10 seconds (개발 환경 제외)
- **Authentication**: NextAuth.js 기반 JWT 토큰

## 📋 목차

1. [AI 가이드 생성 API](#ai-가이드-생성-api)
2. [위치 검색 API](#위치-검색-api)
3. [인증 API](#인증-api)
4. [오디오 API](#오디오-api)
5. [모니터링 API](#모니터링-api)
6. [공통 응답 형식](#공통-응답-형식)
7. [에러 코드](#에러-코드)

---

## 🤖 AI 가이드 생성 API

### **1. Gemini 기반 가이드 생성**

**`POST /api/ai/generate-guide-with-gemini`**

Gemini AI를 활용하여 개인 맞춤형 여행 가이드를 생성합니다.

#### Request Body
```typescript
interface GuideGenerationRequest {
  locationName: string;      // 위치명 (필수)
  language: 'ko' | 'en' | 'ja' | 'zh' | 'es';  // 언어 (필수)
  style?: 'detailed' | 'concise' | 'storytelling';  // 스타일 (선택)
  interests?: string[];      // 관심사 배열 (선택)
  duration?: number;         // 방문 예정 시간(시간) (선택)
}
```

#### Request Example
```json
{
  "locationName": "에펠탑",
  "language": "ko",
  "style": "detailed",
  "interests": ["역사", "건축", "사진"],
  "duration": 3
}
```

#### Response
```typescript
interface GuideGenerationResponse {
  success: boolean;
  data: {
    id: string;
    locationName: string;
    language: string;
    content: {
      title: string;
      overview: string;
      highlights: string[];
      history: string;
      tips: string[];
      bestTime: string;
      duration: string;
      accessibility: string;
      nearbyAttractions: Array<{
        name: string;
        distance: string;
        description: string;
      }>;
    };
    coordinates?: {
      lat: number;
      lng: number;
    };
    images?: string[];
    accuracyScore: number;     // 0-1 사이의 정확도 점수
    sources: string[];         // 데이터 출처
    createdAt: string;
  };
  metadata?: {
    processingTime: number;    // 처리 시간 (ms)
    tokensUsed: number;        // 사용된 토큰 수
  };
}
```

#### Response Example
```json
{
  "success": true,
  "data": {
    "id": "guide_123456",
    "locationName": "에펠탑",
    "language": "ko",
    "content": {
      "title": "에펠탑 - 파리의 상징적 철탑",
      "overview": "1889년 파리 만국박람회를 위해 건설된 에펠탑은...",
      "highlights": [
        "324m 높이의 철제 구조물",
        "매년 700만 명의 관광객 방문",
        "야간 조명 쇼"
      ],
      "history": "구스타브 에펠이 설계한 에펠탑은...",
      "tips": [
        "온라인 사전 예약 권장",
        "일몰 시간 방문 추천",
        "소매치기 주의"
      ],
      "bestTime": "4월-6월, 9월-10월",
      "duration": "2-3시간",
      "accessibility": "휠체어 접근 가능 (2층까지)",
      "nearbyAttractions": [
        {
          "name": "샹드마르스 공원",
          "distance": "도보 1분",
          "description": "에펠탑을 감상하기 좋은 공원"
        }
      ]
    },
    "coordinates": {
      "lat": 48.8584,
      "lng": 2.2945
    },
    "accuracyScore": 0.95,
    "sources": ["UNESCO", "Paris Tourism Office"],
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "metadata": {
    "processingTime": 3200,
    "tokensUsed": 1500
  }
}
```

### **2. 다국어 가이드 생성**

**`POST /api/ai/generate-multilang-guide`**

여러 언어로 동시에 가이드를 생성합니다.

#### Request Body
```typescript
interface MultiLangGuideRequest {
  locationName: string;
  languages: Array<'ko' | 'en' | 'ja' | 'zh' | 'es'>;
  style?: string;
}
```

### **3. 적응형 가이드 생성**

**`POST /api/ai/generate-adaptive-guide`**

사용자의 현재 위치와 시간을 고려한 실시간 적응형 가이드를 생성합니다.

---

## 📍 위치 검색 API

### **1. 자동완성 검색 (중복 제거 적용)**

**`GET /api/locations/search`**

지능형 중복 제거 알고리즘이 적용된 위치 자동완성 기능을 제공합니다.

#### Query Parameters
```typescript
interface LocationSearchParams {
  q: string;           // 검색어 (2-200자)
  lang?: string;       // 언어 코드 (기본값: 'ko')
  limit?: number;      // 결과 개수 (기본값: 5, 최대: 10)
}
```

#### Request Example
```
GET /api/locations/search?q=에펠&lang=ko&limit=5
```

#### Response
```typescript
interface LocationSearchResponse {
  success: boolean;
  data: Array<{
    name: string;              // 장소명
    location: string;          // 위치 (도시, 국가)
    metadata?: {
      isOfficial?: boolean;    // 공식 장소 여부
      category?: string;       // 카테고리
      popularity?: number;     // 인기도 (1-10)
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  }>;
  cached: boolean;             // 캐시된 결과 여부
  debug?: {                    // 개발 환경에서만 제공
    originalCount: number;     // 원본 결과 수
    deduplicatedCount: number; // 중복 제거 후 결과 수
    processingTime: number;    // 처리 시간
  };
}
```

#### Response Example
```json
{
  "success": true,
  "data": [
    {
      "name": "에펠탑",
      "location": "파리, 프랑스",
      "metadata": {
        "isOfficial": true,
        "category": "관광지",
        "popularity": 10,
        "coordinates": {
          "lat": 48.8584,
          "lng": 2.2945
        }
      }
    },
    {
      "name": "에펠탑 전망대",
      "location": "파리, 프랑스",
      "metadata": {
        "isOfficial": false,
        "category": "전망대",
        "popularity": 8
      }
    }
  ],
  "cached": false,
  "debug": {
    "originalCount": 8,
    "deduplicatedCount": 2,
    "processingTime": 245
  }
}
```

### **2. 좌표 기반 검색**

**`GET /api/locations/search/coordinates`**

위도, 경도를 기반으로 주변 관심지점을 검색합니다.

#### Query Parameters
```typescript
interface CoordinateSearchParams {
  lat: number;         // 위도
  lng: number;         // 경도
  radius?: number;     // 검색 반경 (km, 기본값: 1)
  categories?: string; // 카테고리 필터 (콤마 구분)
}
```

---

## 🔐 인증 API

### **1. NextAuth.js 통합**

**`GET/POST /api/auth/[...nextauth]`**

NextAuth.js 기반 인증 시스템입니다.

#### 지원 Provider
- Google OAuth 2.0
- GitHub OAuth
- 이메일/비밀번호

### **2. 회원가입**

**`POST /api/auth/register`**

새 사용자 계정을 생성합니다.

#### Request Body
```typescript
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  preferredLanguage?: string;
}
```

### **3. 이메일 인증**

**`GET /api/auth/email-verification`**

이메일 인증을 처리합니다.

---

## 🎵 오디오 API

### **1. TTS 생성**

**`POST /api/tts/generate`**

텍스트를 음성으로 변환합니다.

#### Request Body
```typescript
interface TTSRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;    // 0.5-2.0
  pitch?: number;    // 0.5-2.0
}
```

### **2. 오디오 스트리밍**

**`POST /api/audio/tts`**

실시간 오디오 스트리밍을 제공합니다.

---

## 📊 모니터링 API

### **1. 헬스체크**

**`GET /api/health`**

시스템 상태를 확인합니다.

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "ai": "healthy",
    "cache": "healthy"
  },
  "version": "1.2.3"
}
```

### **2. 메트릭 조회**

**`GET /api/monitoring/metrics`**

시스템 성능 메트릭을 조회합니다. (인증 필요)

---

## 📝 공통 응답 형식

### **성공 응답**
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    processingTime: number;
  };
}
```

### **에러 응답**
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
  code?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}
```

---

## ⚠️ 에러 코드

### **HTTP Status Codes**

| Status | 의미 | 설명 |
|--------|------|------|
| 200 | OK | 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 429 | Too Many Requests | 요청 제한 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |
| 503 | Service Unavailable | 서비스 일시 중단 |

### **Custom Error Codes**

| Code | 의미 | 설명 |
|------|------|------|
| `INVALID_LOCATION` | 잘못된 위치 | 존재하지 않는 위치명 |
| `AI_TIMEOUT` | AI 시간 초과 | AI 응답 시간 초과 |
| `LANGUAGE_NOT_SUPPORTED` | 지원하지 않는 언어 | 해당 언어 미지원 |
| `RATE_LIMIT_EXCEEDED` | 요청 제한 초과 | 요청 빈도 제한 초과 |
| `COORDINATES_INVALID` | 잘못된 좌표 | 유효하지 않은 좌표 값 |

### **에러 응답 예시**
```json
{
  "success": false,
  "error": "잘못된 요청입니다",
  "code": "INVALID_LOCATION",
  "details": {
    "field": "locationName",
    "reason": "Location not found in our database"
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

---

## 🔧 SDK 및 예제

### **JavaScript/TypeScript SDK**

```typescript
import { GuideAI } from '@guideai/sdk';

const client = new GuideAI({
  apiKey: 'your-api-key',
  baseURL: 'https://your-domain.com/api'
});

// 가이드 생성
const guide = await client.generateGuide({
  locationName: '에펠탑',
  language: 'ko',
  style: 'detailed'
});

// 위치 검색
const locations = await client.searchLocations('에펠');
```

### **React Hook 예제**

```typescript
import { useGuideGeneration } from '@/hooks/useGuideGeneration';

function GuideComponent() {
  const { generateGuide, loading, error } = useGuideGeneration();
  
  const handleGenerate = async () => {
    const guide = await generateGuide({
      locationName: '에펠탑',
      language: 'ko'
    });
  };
  
  return (
    <button 
      onClick={handleGenerate} 
      disabled={loading}
    >
      {loading ? '생성 중...' : '가이드 생성'}
    </button>
  );
}
```

---

## 📈 성능 고려사항

### **Rate Limiting**
- **일반 사용자**: 10 requests/10 seconds
- **프리미엄 사용자**: 50 requests/10 seconds
- **개발 환경**: 제한 없음

### **응답 시간 목표**
- **검색 API**: < 200ms
- **가이드 생성**: < 8s
- **TTS 생성**: < 3s

### **캐싱 정책**
- **위치 검색**: 30분
- **가이드 콘텐츠**: 24시간
- **TTS 오디오**: 7일

---

## 🔄 API 버전 관리

현재 API 버전: **v1**

향후 버전 업데이트 시 하위 호환성을 유지하며, 주요 변경사항은 사전 공지됩니다.

### **Deprecated APIs**
현재 deprecated된 API는 없습니다.

---

## 🤝 지원 및 문의

- **API 문서**: [docs.guideai.com](https://docs.guideai.com)
- **GitHub Issues**: [github.com/jg5209/navi-guide-ai/issues](https://github.com/jg5209/navi-guide-ai/issues)
- **이메일**: api-support@guideai.com

---

이 API 문서는 GUIDEAI의 현재 API 상태를 반영하며, 새로운 기능 추가 및 개선에 따라 지속적으로 업데이트됩니다.
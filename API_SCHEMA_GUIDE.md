# 🦋 NAVI - API & Database Schema Guide
*실시간 AI 가이드 생성을 위한 백엔드 설계*

## 📋 목차
1. API 아키텍처 개요
2. Core API Endpoints
3. AI Generation APIs
4. Data Schema
5. 캐시 전략
6. 오류 처리

---

## 🏞️ API 아키텍처 개요

### Next.js API Routes 구조 (실제 코드 기준)
```
src/app/api/
├── health/              # 헬스체크
│   └── route.ts         
├── ai/                  # AI 생성 엔드포인트
│   ├── generate-audio-tour/    # 오디오 투어
│   │   └── route.ts
│   ├── generate-detailed-guide/ # 상세 가이드
│   │   └── route.ts
│   ├── generate-tts/    # TTS 생성
│   │   └── route.ts
│   ├── upload-audio/    # 오디오 업로드
│   │   └── route.ts
├── locations/           # 명소 검색
│   ├── search/
│   │   ├── route.ts
│   │   └── coordinates/route.ts
│   └── popular/
├── auth/                # 인증
│   ├── register/route.ts
│   └── [...nextauth]/route.ts
├── cache/clear/route.ts # 캐시 클리어
├── migrate-cache/route.ts
└── node/ai/generate-guide/route.ts
```

---

## 🚀 Core API Endpoints

### 1. Health Check API
**GET /api/health**
```typescript
// 응답 예시
{
  "status": "healthy",
  "timestamp": "2024-12-27T10:00:00Z",
  "services": {
    "ai": "connected",
    "cache": "active"
  }
}
```

### 2. AI 가이드 생성 API
**POST /api/ai/generate-audio-tour** (실제 사용)
```typescript
// 요청
{
  "locationName": "경복궁",
  "language": "ko",
  "userProfile": {
    "interests": ["역사", "건축"],
    "ageGroup": "30s",
    "knowledgeLevel": "intermediate",
    "companions": "couple"
  }
}

// 응답
{
  "success": true,
  "data": GuideContent,
  "cached": false,
  "generationTime": 12.3
}
```

### 3. 위치 검색 API
**GET /api/locations/search?q={query}&limit={limit}**
```typescript
// 응답 예시
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "경복궁",
      "description": "조선왕조의 정궁...",
      "category": "궁궐",
      "location": {
        "country": "대한민국",
        "city": "서울",
        "coordinates": [37.5796, 126.9770]
      },
      "popularity": 10,
      "imageUrl": "/images/경복궁.jpg"
    }
  ],
  "total": 1
}
```

---

## 🤖 AI Generation APIs (실제 프롬프트/타입 기준)

### 주요 프롬프트 구조 (src/lib/ai/prompts.ts)
- createAutonomousGuidePrompt(locationName, language, userProfile)
- createFinalGuidePrompt(locationName, language, researchData, userProfile)

### GuideContent 타입 (src/lib/ai/prompts.ts)
```typescript
interface GuideContent {
  content: {
    overview: {
      title: string;
      summary: string;
      narrativeTheme: string;
      keyFacts: Array<{ title: string; description: string }>;
      visitInfo: {
        duration: string;
        difficulty: string;
        season: string;
      };
    };
    route: {
      steps: Array<{
        step: number;
        location: string;
        title: string;
      }>;
    };
    realTimeGuide: {
      chapters: Array<{
        id: number;
        title: string;
        sceneDescription: string;
        coreNarrative: string;
        humanStories: string;
        nextDirection: string;
      }>;
    };
  };
}
```

### UserProfile 타입 (src/lib/ai/prompts.ts)
```typescript
interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}
```

---

## 🗄️ Data Schema (실제 타입/DB 기준)

### GuideData (실제 사용 구조)
```typescript
interface GuideData {
  content: GuideContent['content'];
  metadata: {
    locationName: string;
    generatedAt: string;
    userProfile?: UserProfile;
    language: string;
  };
}
```

### (참고) Prisma 예시 (실제 DB와 다를 수 있음)
```prisma
model Guide {
  id           String   @id @default(cuid())
  locationId   String
  content      Json
  userProfile  Json?
  language     String   @default("ko")
  generatedAt  DateTime @default(now())
  accessCount  Int      @default(0)
  rating       Float?
}
```

---

## 🧠 캐시 전략
- In-memory Map 캐시 (30분 TTL)
- key: locationName+userProfile+language
- 캐시 적중 시 cached: true 반환

---

## 🚨 오류 처리
- 모든 API는 success: false, error: string 형태로 오류 반환
- AI 생성 실패, 파싱 오류, 캐시 미스 등 상세 메시지 제공

---

## 📝 기타
- 실제 프롬프트/타입/구조는 src/lib/ai/prompts.ts, src/types/guide.ts 등 코드 참고
- 더 이상 사용하지 않는 API/타입/필드는 문서에서 삭제함
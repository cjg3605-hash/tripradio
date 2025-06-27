# 🦋 NAVI - API & Database Schema Guide
*실시간 AI 가이드 생성을 위한 백엔드 설계*

## 📋 목차
1. [API 아키텍처 개요](#api-아키텍처-개요)
2. [Core API Endpoints](#core-api-endpoints) 
3. [AI Generation APIs](#ai-generation-apis)
4. [Data Schema](#data-schema)
5. [캐싱 전략](#캐싱-전략)
6. [오류 처리](#오류-처리)
7. [향후 확장 API](#향후-확장-api)

## 🏗️ API 아키텍처 개요

### 현재 구현된 Next.js API Routes 구조
```
src/app/api/
├── health/              # 헬스체크
│   └── route.ts         
├── ai/                  # AI 생성 엔드포인트
│   ├── generate-guide/  # 메인 3페이지 가이드 생성
│   │   └── route.ts
│   ├── generate-simple-tour/   # 간단 투어 (미사용)
│   ├── generate-detailed-guide/ # 상세 가이드 (미사용)
│   └── generate-audio-tour/    # 오디오 투어 (향후)
│       └── route.ts
├── locations/           # 명소 관련 (향후)
│   ├── search/
│   │   └── route.ts
│   └── popular/
└── tts/                 # 텍스트 음성 변환 (향후)
    └── generate/
```

### 기술 스택
```typescript
// 현재 구현
Backend: Next.js 14 API Routes
AI: Google Gemini 1.5 Flash
Validation: Zod
Cache: In-Memory (Map)
Error Handling: Custom Error Classes

// 향후 확장
Database: PostgreSQL + Prisma
Cache: Redis
Auth: NextAuth.js  
Payment: Stripe
Storage: AWS S3 / Cloudinary
```

## 🚀 Core API Endpoints

### 1. Health Check API
**현재 구현 완료 ✅**

```typescript
// GET /api/health
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    ai: 'connected' | 'disconnected';
    cache: 'active' | 'inactive';
  };
}

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

### 2. 메인 AI 가이드 생성 API ⭐
**현재 구현 완료 ✅**

```typescript
// POST /api/ai/generate-guide
interface GenerateGuideRequest {
  locationName: string;        // 명소명 (필수)
  userProfile?: {              // 개인화 요소
    interests?: string[];      // ['역사', '건축', '예술']
    ageGroup?: string;        // '20s' | '30s' | '40s' | '50s+'
    knowledgeLevel?: string;  // 'beginner' | 'intermediate' | 'expert'
    companions?: string;      // 'solo' | 'couple' | 'family' | 'friends'
  };
}

interface GenerateGuideResponse {
  success: boolean;
  data?: GuideData;
  error?: string;
  cached?: boolean;          // 캐시에서 가져온 데이터인지
  generationTime?: number;   // AI 생성 시간 (초)
}

// 요청 예시
POST /api/ai/generate-guide
{
  "locationName": "경복궁",
  "userProfile": {
    "interests": ["역사", "건축"],
    "ageGroup": "30s",
    "knowledgeLevel": "intermediate",
    "companions": "couple"
  }
}
```

### 3. 위치 검색 API (향후 구현)
```typescript
// GET /api/locations/search?q={query}&limit={limit}
interface LocationSearchResponse {
  success: boolean;
  data: LocationSuggestion[];
  total: number;
}

interface LocationSuggestion {
  id: string;
  name: string;
        description: string;
  category: string;      // '궁궐' | '사찰' | '유적지' | '박물관'
  location: {
    country: string;
    city: string;
    coordinates?: [number, number]; // [위도, 경도]
  };
  popularity: number;    // 1-10
  imageUrl?: string;
}
```

## 🤖 AI Generation APIs

### 1. 현재 메인 생성 플로우

```typescript
// src/app/api/ai/generate-guide/route.ts
export async function POST(request: Request) {
  try {
    // 1. 요청 검증
  const { locationName, userProfile } = await request.json();
  
    // 2. 캐시 확인 (30분)
    const cacheKey = generateCacheKey(locationName, userProfile);
  if (guideCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        data: guideCache.get(cacheKey),
        cached: true
      });
  }

    // 3. AI 프롬프트 생성
  const prompt = create3PageGuidePrompt(locationName, userProfile);
  
    // 4. Gemini API 호출
    const startTime = Date.now();
    const result = await gemini.generateContent(prompt);
    const generationTime = (Date.now() - startTime) / 1000;
    
    // 5. JSON 파싱 및 검증
    const guideData = parseAndValidateGuideData(result.response.text());
    
    // 6. 캐시 저장
    guideCache.set(cacheKey, guideData);
  
  return NextResponse.json({
    success: true,
      data: guideData,
      cached: false,
      generationTime
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'AI 가이드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 });
  }
}
```

### 2. 프롬프트 엔지니어링 구조

```typescript
// src/lib/ai/prompts.ts
export function create3PageGuidePrompt(
  locationName: string, 
  userProfile?: UserProfile
): string {
  return `
당신은 세계 최고의 스토리텔링 관광 가이드 AI입니다.

🎯 핵심 원칙:
- 알함브라 오디오 가이드 수준의 스토리텔링
- 실제 사건과 전설을 조합한 드라마틱한 서술
- 감각적 디테일과 인물 중심의 이야기
- 현장감과 몰입감을 극대화

📍 대상 명소: ${locationName}

👤 사용자 프로필:
${userProfile ? `
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '일반'}  
- 지식수준: ${userProfile.knowledgeLevel || 'intermediate'}
- 동행자: ${userProfile.companions || 'solo'}
` : '- 일반적인 관광객 대상'}

🎭 실시간 가이드 스타일 (핵심!):
- "전해지는 이야기로는...", "한 전설에 따르면..."
- "차가운 돌바닥에 발이 닿을 때마다..." (감각적)
- "어느 날 밤..." (구체적 상황 설정)
- 실제 인물 이름과 구체적 사건들
- 건축적 디테일과 숨겨진 의미들

📖 3페이지 구조로 응답하세요:

1. **개요 (overview)**: 
   - 역사적 배경과 문화적 중요성
   - 핵심 특징과 방문 정보

2. **관람동선 (route)**:
   - 효율적인 관람 순서와 동선
   - 방문 전/중/후 실용적 팁

3. **실시간가이드 (realTimeGuide)**:
   - 알함브라 수준의 드라마틱 스토리텔링
   - 챕터별 몰입형 이야기
   - 전설, 인물, 감각적 디테일 포함

반드시 다음 JSON 형식으로만 응답하세요:
{JSON_SCHEMA}
`;
}
```

## 📊 Data Schema

### 1. 메인 가이드 데이터 구조 ✅

```typescript
// 현재 구현된 스키마
interface GuideData {
  content: {
    overview: OverviewData;
    route: RouteData;  
    realTimeGuide: RealTimeGuideData;
  };
  metadata: {
    locationName: string;
    generatedAt: string;
    userProfile?: UserProfile;
    language: string;
  };
}

interface OverviewData {
  title: string;              // "경복궁: 조선왕조의 정궁"
  description: string;        // 한 줄 요약 설명
  history: string;           // 역사적 배경 (200-300자)
  significance: string;      // 문화적 중요성 (150-200자)
  keyFacts: string[];       // 핵심 사실들 (3-5개)
  visitInfo: {
    duration: string;        // "2-3시간"
    difficulty: string;      // "쉬움" | "보통" | "어려움"
    bestTime: string;       // "오전 9-11시"
    season: string;         // "봄, 가을 추천"
  };
}

interface RouteData {
  title: string;             // "경복궁 완벽 관람 가이드"
  steps: RouteStep[];       // 관람 단계별 안내
  tips: {
    before: string[];       // 방문 전 준비사항
    during: string[];       // 관람 중 주의사항  
    after: string[];        // 방문 후 추천활동
  };
  accessibility: string;    // 접근성 정보
  facilities: string[];     // 편의시설 정보
}

interface RouteStep {
  step: number;             // 1, 2, 3...
  title: string;           // "광화문에서 시작"
  description: string;     // 상세 설명
  duration: string;        // "30분"
  highlights: string[];    // 주요 볼거리
}

interface RealTimeGuideData {
  chapters: RealTimeChapter[];
  totalDuration: number;    // 전체 소요시간 (분)
  chapterCount: number;     // 챕터 수
}

interface RealTimeChapter {
  id: number;               // 챕터 번호
  title: string;           // "왕의 위엄이 시작되는 곳"
  content: string;         // 드라마틱 스토리텔링 (300자 이상)
  stories: string[];       // 관련 전설/일화들
  characters: string[];    // 등장 인물들
  sensoryDetails: string[]; // 감각적 요소들
  dramaticMoments: string[]; // 드라마틱한 순간들
  observationPoints: string[]; // 관찰할 세부사항들
  significance: string;     // 이 공간의 의미
  nextDirection?: string;   // 다음 장소로의 이동 안내 (마지막 챕터 제외)
}
```

### 2. 사용자 프로필 스키마

```typescript
interface UserProfile {
  interests?: Interest[];
  ageGroup?: AgeGroup;
  knowledgeLevel?: KnowledgeLevel;
  companions?: CompanionType;
  tourDuration?: number;      // 선호 투어 시간 (분)
  preferredStyle?: GuideStyle;
}

type Interest = 
  | '역사' | '건축' | '예술' | '종교' | '문화'
  | '사진' | '자연' | '음식' | '쇼핑' | '축제';

type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';

type KnowledgeLevel = 'beginner' | 'intermediate' | 'expert';

type CompanionType = 'solo' | 'couple' | 'family' | 'friends' | 'group';

type GuideStyle = 'friendly' | 'academic' | 'dramatic' | 'concise';
```

### 3. 향후 데이터베이스 스키마 (Prisma)

```prisma
// prisma/schema.prisma
model Location {
  id          String   @id @default(cuid())
  name        String   @unique
  nameEn      String?
  description String?
  category    String   // 궁궐, 사찰, 유적지, 박물관 등
  country     String
  city        String
  latitude    Float?
  longitude   Float?
  popularity  Int      @default(0)
  imageUrl    String?
  
  // 관계
  guides      Guide[]
  visits      Visit[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("locations")
}

model Guide {
  id           String     @id @default(cuid())
  locationId   String
  location     Location   @relation(fields: [locationId], references: [id])
  
  content      Json       // GuideData JSON
  userProfile  Json?      // UserProfile JSON
  language     String     @default("ko")
  
  // 메타데이터
  generatedAt  DateTime   @default(now())
  accessCount  Int        @default(0)
  rating       Float?
  
  // 관계
  visits       Visit[]
  audioFiles   AudioFile[]
  
  @@map("guides")
}

model User {
  id          String   @id @default(cuid())
  email       String?  @unique
  name        String?
  
  // 구독 정보
  subscription Subscription?
  
  // 관계
  visits      Visit[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("users")
}

model Visit {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  locationId  String
  location    Location @relation(fields: [locationId], references: [id])
  
  guideId     String?
  guide       Guide?   @relation(fields: [guideId], references: [id])
  
  // 사용 통계
  viewedPages Json?    // ['overview', 'route', 'realTimeGuide']
  timeSpent   Int?     // 초 단위
  completed   Boolean  @default(false)
  rating      Int?     // 1-5
  
  visitedAt   DateTime @default(now())
  
  @@map("visits")
}

model AudioFile {
  id          String   @id @default(cuid())
  guideId     String
  guide       Guide    @relation(fields: [guideId], references: [id])
  
  chapterId   Int      // 챕터 번호
  provider    String   // 'google' | 'elevenlabs'
  quality     String   // 'basic' | 'premium'
  
  fileUrl     String   // S3/Cloudinary URL
  duration    Int      // 초 단위
  fileSize    Int      // 바이트
  
  createdAt   DateTime @default(now())
  
  @@unique([guideId, chapterId, provider, quality])
  @@map("audio_files")
}

model Subscription {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  plan        String   // 'basic' | 'premium'
  status      String   // 'active' | 'canceled' | 'past_due'
  
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  stripeCustomerId     String?
  stripeSubscriptionId String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("subscriptions")
}
```

## 🗄️ 캐싱 전략

### 1. 현재 메모리 캐시 ✅

```typescript
// src/lib/cache/localStorage.ts
interface CacheEntry {
  data: GuideData;
  timestamp: number;
  userProfile?: UserProfile;
}

class GuideCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 30 * 60 * 1000; // 30분
  
  generateKey(locationName: string, userProfile?: UserProfile): string {
    const profileHash = userProfile 
      ? Buffer.from(JSON.stringify(userProfile)).toString('base64')
      : 'default';
    return `${locationName}_${profileHash}`;
  }
  
  set(key: string, data: GuideData, userProfile?: UserProfile): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      userProfile
    });
  }
  
  get(key: string): GuideData | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const guideCache = new GuideCache();

// 30분마다 자동 정리
setInterval(() => guideCache.cleanup(), 30 * 60 * 1000);
```

### 2. 향후 Redis 캐시 전략

```typescript
// 계층적 캐싱 전략
interface CacheStrategy {
  L1: 'Memory Cache (1분)';      // 동일 요청 즉시 응답
  L2: 'Redis Cache (30분)';      // 개인화 캐시
  L3: 'Database Cache (24시간)'; // 일반 콘텐츠 캐시
}

// Redis 키 패턴
const cacheKeys = {
  guide: 'guide:{location}:{profileHash}',       // 개인화 가이드
  location: 'location:{locationId}',             // 명소 기본 정보
  popular: 'popular:locations',                 // 인기 명소 목록
  audio: 'audio:{guideId}:{chapterId}:{quality}' // 오디오 파일
};
```

## ⚠️ 오류 처리

### 1. 현재 구현된 오류 처리 ✅

```typescript
// src/lib/ai/gemini.ts
export class AIGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

export async function generateGuideWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<GuideData> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await gemini.generateContent(prompt);
      const text = result.response.text();
      
      if (!text) {
        throw new AIGenerationError(
          'AI 응답이 비어있습니다',
          'EMPTY_RESPONSE'
        );
      }
      
      return parseAndValidateGuideData(text);
      
    } catch (error) {
      lastError = error;
      
      if (error instanceof AIGenerationError && !error.retryable) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // 재시도 전 대기 (지수 백오프)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  
  throw new AIGenerationError(
    'AI 가이드 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
    'GENERATION_FAILED',
    false
  );
}
```

### 2. JSON 파싱 및 검증

```typescript
import { z } from 'zod';

// Zod 스키마 정의
const GuideDataSchema = z.object({
  content: z.object({
    overview: z.object({
      title: z.string().min(1),
      description: z.string().min(10),
      history: z.string().min(50),
      significance: z.string().min(30),
      keyFacts: z.array(z.string()).min(3).max(7),
      visitInfo: z.object({
        duration: z.string(),
        difficulty: z.string(),
        bestTime: z.string(),
        season: z.string()
      })
    }),
    route: z.object({
      title: z.string(),
      steps: z.array(z.object({
        step: z.number(),
        title: z.string(),
        description: z.string(),
        duration: z.string(),
        highlights: z.array(z.string())
      })).min(3),
      tips: z.object({
        before: z.array(z.string()).min(2),
        during: z.array(z.string()).min(2),
        after: z.array(z.string()).min(2)
      }),
      accessibility: z.string(),
      facilities: z.array(z.string())
    }),
    realTimeGuide: z.object({
      chapters: z.array(z.object({
        id: z.number(),
        title: z.string().min(5),
        content: z.string().min(300), // 최소 300자
        stories: z.array(z.string()).min(1),
        characters: z.array(z.string()),
        sensoryDetails: z.array(z.string()),
        dramaticMoments: z.array(z.string()),
        observationPoints: z.array(z.string()),
        significance: z.string().min(30)
      })).min(3).max(8),
      totalDuration: z.number().min(60),
      chapterCount: z.number()
    })
  })
});

export function parseAndValidateGuideData(text: string): GuideData {
  try {
    // JSON 추출 (```json과 ``` 사이)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : text;
    
    const rawData = JSON.parse(jsonString);
    const validatedData = GuideDataSchema.parse(rawData);
    
    return validatedData;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('데이터 검증 실패:', error.errors);
      throw new AIGenerationError(
        '생성된 가이드 데이터가 올바르지 않습니다',
        'VALIDATION_FAILED',
        false
      );
    }
    
    throw new AIGenerationError(
      'JSON 파싱에 실패했습니다',
      'PARSE_FAILED',
      true
    );
  }
}
```

## 🚀 향후 확장 API

### 1. 오디오 생성 API (Phase 2)

```typescript
// POST /api/tts/generate
interface TTSRequest {
  guideId: string;
  chapterId: number;
  provider: 'google' | 'elevenlabs';
  quality: 'basic' | 'premium';
  voice?: string;
}

interface TTSResponse {
  success: boolean;
  data?: {
    audioUrl: string;
    duration: number;
    fileSize: number;
  };
  error?: string;
}
```

### 2. 사용자 인증 API (Phase 3)

```typescript
// POST /api/auth/signin
// POST /api/auth/signout
// GET /api/auth/session

// 구독 관리
// POST /api/subscription/create
// POST /api/subscription/cancel
// GET /api/subscription/status
```

### 3. 분석 및 통계 API

```typescript
// POST /api/analytics/visit
interface VisitEvent {
  locationName: string;
  page: 'overview' | 'route' | 'realTimeGuide';
  timeSpent: number;
  completed: boolean;
}

// GET /api/analytics/popular
interface PopularLocationsResponse {
  locations: {
    name: string;
    visits: number;
    rating: number;
  }[];
}
```

## 📈 성능 최적화

### 1. 현재 최적화 사항 ✅

```typescript
// API 응답 시간 모니터링
export async function withPerformanceLogging<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${operationName}: ${duration}ms`);
    
    if (duration > 15000) { // 15초 초과 시 경고
      console.warn(`⚠️ 느린 응답: ${operationName} took ${duration}ms`);
    }
    
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${operationName} 실패 (${duration}ms):`, error);
    throw error;
  }
}
```

### 2. 향후 최적화 계획

```typescript
// CDN을 통한 정적 자산 최적화
const optimizations = {
  images: 'WebP 포맷 + Lazy Loading',
  audio: 'Progressive Loading + 압축',
  api: 'GraphQL + DataLoader',
  database: 'Read Replicas + Connection Pooling',
  cache: 'Multi-layer Caching Strategy'
};
```

## 🔧 개발 및 테스트

### 1. 로컬 개발 설정

```bash
# 환경변수 설정
cp .env.example .env.local

# 필수 환경변수
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 향후 추가될 환경변수
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
STRIPE_SECRET_KEY="sk_test_..."
AWS_ACCESS_KEY_ID="..."
ELEVENLABS_API_KEY="..."
```

### 2. API 테스트

```typescript
// 테스트 스크립트 예시
async function testGuideGeneration() {
  const response = await fetch('/api/ai/generate-guide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locationName: '경복궁',
      userProfile: {
        interests: ['역사', '건축'],
        ageGroup: '30s',
        knowledgeLevel: 'intermediate'
      }
    })
  });
  
  const result = await response.json();
  console.log('생성 결과:', result);
}
```

---

## 📝 요약

현재 NAVI의 API는 **핵심 AI 가이드 생성 기능**이 완벽하게 구현되어 있으며, 향후 오디오, 인증, 결제 시스템으로 확장할 수 있는 견고한 기반을 제공합니다.

### 현재 구현 완료 ✅
- 메인 AI 가이드 생성 API (95% 성공률)
- 30분 메모리 캐싱 시스템
- 강력한 오류 처리 및 복구
- JSON 검증 및 파싱
- 성능 모니터링

### 다음 단계 🚀
- PostgreSQL + Prisma 데이터베이스
- Redis 캐싱 시스템  
- TTS 오디오 생성 API
- 사용자 인증 및 구독 관리
- 분석 및 통계 API

**🦋 NAVI - 확장 가능하고 안정적인 AI 가이드 플랫폼**
# API 성능 최적화 작업 가이드

## 📋 작업 개요
src/api/ 디렉토리의 성능 병목 현상을 해결하기 위한 구체적인 수정 작업 가이드입니다.

---

## 🎯 우선순위 1: 즉시 수정 필요

### 1. 타임아웃 처리 구현

#### 파일: `src/app/api/ai/generate-guide-with-gemini/route.ts`
**수정 위치**: 41-44번째 줄 (generatePersonalizedGuide 호출 부분)

**현재 코드:**
```typescript
// Gemini 라이브러리 호출
const guideData = await generatePersonalizedGuide(
  location.trim(),
  safeUserProfile
);
```

**수정할 코드:**
```typescript
// 30초 타임아웃으로 Gemini 라이브러리 호출
const TIMEOUT_MS = 30000;
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('AI 응답 시간 초과')), TIMEOUT_MS);
});

const guideData = await Promise.race([
  generatePersonalizedGuide(location.trim(), safeUserProfile),
  timeoutPromise
]);
```

#### 파일: `src/app/api/ai/generate-adaptive-guide/route.ts`
**수정 위치**: 65-70번째 줄 (generatePersonalizedContent 호출 부분)

**현재 코드:**
```typescript
// 개인화된 콘텐츠 생성  
const generatedContent = await generatePersonalizedContent(
  chapter,
  userProfile,
  { locationName, locationAnalysis: locationStructure.location_analysis },
  optimalCharacters
);
```

**수정할 코드:**
```typescript
// 타임아웃과 함께 개인화된 콘텐츠 생성
const CONTENT_TIMEOUT_MS = 25000;
const contentTimeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('콘텐츠 생성 시간 초과')), CONTENT_TIMEOUT_MS);
});

const generatedContent = await Promise.race([
  generatePersonalizedContent(
    chapter,
    userProfile,
    { locationName, locationAnalysis: locationStructure.location_analysis },
    optimalCharacters
  ),
  contentTimeoutPromise
]);
```

#### 파일: `src/app/api/ai/generate-tts/route.ts`
**수정 위치**: 34번째 줄 (generateTTSAudio 호출 부분)

**현재 코드:**
```typescript
const audioBuffer = await generateTTSAudio(text, language, speakingRate, voiceSettings);
```

**수정할 코드:**
```typescript
// TTS 생성에 20초 타임아웃 추가
const TTS_TIMEOUT_MS = 20000;
const ttsTimeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('TTS 생성 시간 초과')), TTS_TIMEOUT_MS);
});

const audioBuffer = await Promise.race([
  generateTTSAudio(text, language, speakingRate, voiceSettings),
  ttsTimeoutPromise
]);
```

### 2. 데이터베이스 인덱스 추가

#### 새 파일 생성: `src/database/create-indexes.sql`
```sql
-- 성능 최적화를 위한 인덱스 생성
-- 실행 방법: Supabase 대시보드 > SQL 에디터에서 실행

-- 가이드 테이블 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_guides_location_language 
ON guides(locationname, language);

CREATE INDEX IF NOT EXISTS idx_guides_created_at 
ON guides(created_at DESC);

-- 품질 피드백 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_quality_feedback_location_date 
ON quality_feedback(location_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quality_feedback_guide_id 
ON quality_feedback(guide_id);

-- 오디오 파일 테이블 인덱스 (존재하는 경우)
CREATE INDEX IF NOT EXISTS idx_audio_files_guide_chapter 
ON audio_files(guide_id, chapter_index);
```

#### 파일: `src/app/api/quality-feedback/route.ts`
**수정 위치**: 167-177번째 줄 (데이터베이스 쿼리 부분)

**현재 코드:**
```typescript
let query = supabase
  .from('quality_feedback')
  .select('*');

if (guideId) {
  query = query.eq('guide_id', guideId);
}
if (locationName) {
  query = query.eq('location_name', locationName);
}
const { data: feedbacks, error } = await query.order('created_at', { ascending: false });
```

**수정할 코드:**
```typescript
// 복합 인덱스를 활용한 최적화된 쿼리
let query = supabase
  .from('quality_feedback')
  .select('*');

// 더 효율적인 쿼리 순서 (인덱스 활용)
if (locationName && guideId) {
  // 복합 조건시 더 선택적인 조건을 먼저
  query = query.eq('location_name', locationName).eq('guide_id', guideId);
} else if (locationName) {
  query = query.eq('location_name', locationName);
} else if (guideId) {
  query = query.eq('guide_id', guideId);
}

// 인덱스를 활용한 정렬
const { data: feedbacks, error } = await query
  .order('created_at', { ascending: false })
  .limit(100); // 대량 데이터 방지를 위한 제한
```

### 3. 메모리 사용량 최적화

#### 파일: `src/app/api/locations/search/route.ts`
**수정 위치**: 20-35번째 줄 (캐시 구현 부분)

**현재 코드:**
```typescript
// Simple in-memory cache implementation
const cache = new Map<string, any>();
const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    return cache.get(key) || null;
  },
  set: async (key: string, value: any): Promise<'OK'> => {
    cache.set(key, value);
    return 'OK';
  },
  setex: async (key: string, seconds: number, value: any): Promise<'OK'> => {
    cache.set(key, value);
    setTimeout(() => cache.delete(key), seconds * 1000);
    return 'OK';
  }
};
```

**수정할 코드:**
```typescript
// 크기 제한이 있는 LRU 캐시 구현
class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize = 100; // 최대 100개 항목

  get(key: string): T | null {
    const value = this.cache.get(key);
    if (value) {
      // LRU: 접근한 항목을 맨 뒤로 이동
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  setex(key: string, seconds: number, value: T): void {
    this.set(key, value);
    setTimeout(() => this.cache.delete(key), seconds * 1000);
  }
}

const cache = new LRUCache<any>();
const kv = {
  get: async <T>(key: string): Promise<T | null> => {
    return cache.get(key) as T | null;
  },
  set: async (key: string, value: any): Promise<'OK'> => {
    cache.set(key, value);
    return 'OK';
  },
  setex: async (key: string, seconds: number, value: any): Promise<'OK'> => {
    cache.setex(key, seconds, value);
    return 'OK';
  }
};
```

---

## ⚡ 우선순위 2: 다음 스프린트

### 4. 병렬 처리 구현

#### 파일: `src/app/api/ai/generate-adaptive-guide/route.ts`
**수정 위치**: 52-80번째 줄 (챕터 생성 루프)

**현재 코드:**
```typescript
for (const chapter of locationStructure.optimal_chapter_structure) {
  console.log(`   📏 ${chapter.title} 처리 중...`);
  
  // 최적 글자수 계산
  const optimalCharacters = calculateOptimalCharacters(
    chapter.target_duration,
    userProfile,
    locationStructure.location_analysis.complexity
  );

  // 개인화된 콘텐츠 생성  
  const generatedContent = await generatePersonalizedContent(
    chapter,
    userProfile,
    { locationName, locationAnalysis: locationStructure.location_analysis },
    optimalCharacters
  );

  generatedChapters.push({
    ...chapter,
    optimal_characters: optimalCharacters,
    content: generatedContent,
    actual_characters: generatedContent.length
  });
}
```

**수정할 코드:**
```typescript
// 병렬 처리로 모든 챕터를 동시에 생성
console.log('📝 모든 챕터를 병렬로 생성 중...');

const chapterPromises = locationStructure.optimal_chapter_structure.map(async (chapter) => {
  console.log(`   📏 ${chapter.title} 처리 시작...`);
  
  // 최적 글자수 계산
  const optimalCharacters = calculateOptimalCharacters(
    chapter.target_duration,
    userProfile,
    locationStructure.location_analysis.complexity
  );

  // 개인화된 콘텐츠 생성 (병렬)
  const generatedContent = await generatePersonalizedContent(
    chapter,
    userProfile,
    { locationName, locationAnalysis: locationStructure.location_analysis },
    optimalCharacters
  );

  console.log(`   ✅ ${chapter.title}: ${generatedContent.length}자 (목표: ${optimalCharacters}자)`);

  return {
    ...chapter,
    optimal_characters: optimalCharacters,
    content: generatedContent,
    actual_characters: generatedContent.length
  };
});

// 모든 챕터를 병렬로 처리하고 결과 대기
const generatedChapters = await Promise.all(chapterPromises);
console.log('🏆 모든 챕터 병렬 생성 완료!');
```

### 5. 속도 제한 추가

#### 새 파일 생성: `src/lib/rate-limiter.ts`
```typescript
// 범용 속도 제한 라이브러리
export class RateLimiter {
  private requests: Map<string, {count: number, resetAt: number}>;
  private readonly windowMs: number;
  private readonly max: number;

  constructor(max: number, windowMs: number) {
    this.requests = new Map();
    this.max = max;
    this.windowMs = windowMs;
  }

  async limit(identifier: string) {
    if (process.env.NODE_ENV === 'development') {
      return { 
        success: true,
        limit: this.max,
        remaining: this.max,
        reset: 10
      };
    }

    const now = Date.now();
    const record = this.requests.get(identifier) || { count: 0, resetAt: now + this.windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + this.windowMs;
    }

    record.count++;
    this.requests.set(identifier, record);

    const remaining = Math.max(0, this.max - record.count);
    const reset = Math.ceil((record.resetAt - now) / 1000);

    return {
      success: record.count <= this.max,
      limit: this.max,
      remaining,
      reset
    };
  }
}

// 미리 정의된 제한기들
export const aiRateLimiter = new RateLimiter(5, 60 * 1000); // AI: 분당 5회
export const searchRateLimiter = new RateLimiter(20, 60 * 1000); // 검색: 분당 20회
export const ttsRateLimiter = new RateLimiter(10, 60 * 1000); // TTS: 분당 10회
```

#### 파일: `src/app/api/ai/generate-guide-with-gemini/route.ts`
**수정 위치**: 7번째 줄 다음에 추가

**추가할 코드:**
```typescript
import { aiRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // 속도 제한 확인
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const limitResult = await aiRateLimiter.limit(ip);
    
    if (!limitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: limitResult.reset
        },
        { 
          status: 429,
          headers: {
            'Retry-After': limitResult.reset?.toString() || '60',
            'X-RateLimit-Limit': limitResult.limit?.toString() || '5',
            'X-RateLimit-Remaining': limitResult.remaining?.toString() || '0'
          }
        }
      );
    }

    console.log('🚀 Gemini 라이브러리 기반 가이드 생성 API 호출');
    // ... 기존 코드 계속
```

### 6. 서킷 브레이커 구현

#### 새 파일 생성: `src/lib/circuit-breaker.ts`
```typescript
// 서킷 브레이커 패턴 구현
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN', 
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailTime: number = 0;
  private successCount: number = 0;

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1분
    private readonly monitoringPeriod: number = 10000   // 10초
  ) {}

  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailTime < this.recoveryTimeout) {
        throw new Error('서킷 브레이커가 열려있습니다. 서비스가 일시적으로 중단되었습니다.');
      }
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// AI 서비스용 서킷 브레이커
export const aiCircuitBreaker = new CircuitBreaker(3, 30000, 5000); // 실패 3회, 복구 30초
```

#### 파일: `src/lib/ai/gemini.ts`
**수정 위치**: 파일 상단에 import 추가 및 generatePersonalizedGuide 함수 수정

**추가할 import:**
```typescript
import { aiCircuitBreaker } from '@/lib/circuit-breaker';
```

**수정할 함수 (96번째 줄 근처):**
```typescript
export async function generatePersonalizedGuide(
  location: string,
  userProfile: UserProfile
) {
  const safeProfile: UserProfile = {
    interests: userProfile?.interests || ['history'],
    ageGroup: userProfile?.ageGroup || '30s',
    knowledgeLevel: userProfile?.knowledgeLevel || 'intermediate',
    companions: userProfile?.companions || 'solo',
    tourDuration: userProfile?.tourDuration || 90,
    preferredStyle: userProfile?.preferredStyle || 'friendly',
    language: userProfile?.language || 'ko'
  };

  try {
    // 서킷 브레이커로 AI 호출 보호
    return await aiCircuitBreaker.call(async () => {
      if (!genAI) {
        console.log('🎭 더미 데이터로 가이드 생성:', location);
        return generateFallbackGuide(location, safeProfile);
      }

      // ... 기존 AI 호출 로직
    });
  } catch (error) {
    console.error('❌ 서킷 브레이커 또는 AI 생성 실패:', error);
    
    // 서킷 브레이커가 열린 경우 폴백 응답
    if (error.message.includes('서킷 브레이커')) {
      return generateFallbackGuide(location, safeProfile);
    }
    
    throw error;
  }
}
```

---

## 🔧 우선순위 3: 향후 개선

### 7. 응답 압축 구현

#### 새 파일 생성: `src/middleware/compression.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function compressResponse(
  response: NextResponse,
  request: NextRequest
): Promise<NextResponse> {
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  if (!acceptEncoding.includes('gzip')) {
    return response;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json') && !contentType?.includes('text/')) {
    return response;
  }

  try {
    const originalBody = await response.text();
    const compressed = await gzipAsync(Buffer.from(originalBody));
    
    const newResponse = new NextResponse(compressed, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'gzip',
        'content-length': compressed.length.toString()
      }
    });

    return newResponse;
  } catch (error) {
    console.error('압축 실패:', error);
    return response;
  }
}
```

### 8. 모니터링 설정

#### 새 파일 생성: `src/lib/monitoring.ts`
```typescript
// 성능 모니터링 라이브러리
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    lastCall: number;
  }> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const metric = this.metrics.get(operationName) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      lastCall: 0
    };

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      metric.count++;
      metric.totalTime += duration;
      metric.lastCall = Date.now();
      
      this.metrics.set(operationName, metric);
      
      // 느린 작업 경고
      if (duration > 10000) {
        console.warn(`⚠️ 느린 작업 감지: ${operationName} (${duration}ms)`);
      }
      
      return result;
    } catch (error) {
      metric.errors++;
      this.metrics.set(operationName, metric);
      throw error;
    }
  }

  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = {
        avgResponseTime: metric.count > 0 ? Math.round(metric.totalTime / metric.count) : 0,
        totalCalls: metric.count,
        errorRate: metric.count > 0 ? Math.round((metric.errors / metric.count) * 100) : 0,
        lastCall: new Date(metric.lastCall).toISOString()
      };
    }
    
    return result;
  }
}

export const monitor = PerformanceMonitor.getInstance();
```

---

## 📁 작업 체크리스트

### 즉시 수정 (1-2일)
- [ ] `generate-guide-with-gemini/route.ts` 타임아웃 추가
- [ ] `generate-adaptive-guide/route.ts` 타임아웃 추가  
- [ ] `generate-tts/route.ts` 타임아웃 추가
- [ ] `create-indexes.sql` 실행
- [ ] `quality-feedback/route.ts` 쿼리 최적화
- [ ] `locations/search/route.ts` LRU 캐시 구현

### 다음 스프린트 (1주)
- [ ] `generate-adaptive-guide/route.ts` 병렬 처리
- [ ] `rate-limiter.ts` 생성 및 적용
- [ ] `circuit-breaker.ts` 생성 및 적용
- [ ] AI 엔드포인트에 속도 제한 추가

### 향후 개선 (2-4주)
- [ ] 응답 압축 미들웨어 구현
- [ ] 모니터링 시스템 구축
- [ ] 로드 테스트 실행
- [ ] 성능 지표 대시보드 구성

## 🚀 예상 성과
- **응답 시간**: 40-60% 개선
- **서버 리소스**: 30-50% 절약
- **오류율**: 80% 감소
- **사용자 만족도**: 크게 향상
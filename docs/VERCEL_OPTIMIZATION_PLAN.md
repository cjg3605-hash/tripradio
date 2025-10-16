# Vercel 환경 최적화 계획서

## 🎯 목표
**"한 번에 성공하거나, 즉시 실패" 아키텍처 구현**

---

## 📊 현재 문제점 요약

### 1. 재시도 로직 과다 (13곳 발견)
- `sequential-tts-generator.ts`: 3회 재시도 (최대 180초)
- `podcast-job-queue.ts`: 2회 재시도 (Bull Queue)
- `parallel-tts-generator.ts`: 재시도 로직 존재
- `enhanced-geocoding-service.ts`: 재시도 로직 존재

### 2. Vercel 타임아웃 위험
- **Hobby Plan**: 10초
- **Pro Plan**: 60초
- **현재 TTS 생성**: 60초 × 3회 재시도 = 최대 180초 ❌

### 3. Stateful 아키텍처
- Bull Queue (Redis 필요)
- Circuit Breaker (메모리 상태 유지)
- API Health Check 캐시

---

## ✅ 해결 방안

### Phase 1: 즉시 적용 (Breaking Changes 없음)

#### 1.1 TTS 타임아웃 단축 및 재시도 제거
```typescript
// BEFORE (sequential-tts-generator.ts:469-552)
const ttsTimeout = 60000;  // 60초
retryCount: number = 0,
maxRetries: number = 2

// AFTER
const ttsTimeout = 15000;  // 15초 (Vercel 여유 확보)
// 재시도 로직 완전 제거
```

**파일**: `src/lib/ai/tts/sequential-tts-generator.ts`
- Line 421-562: `generateSingleTTS` 함수 리팩토링
- Line 52-412: Circuit Breaker 로직 제거
- Line 88-100: API Health Check 제거

**예상 효과**:
- API 응답 시간: 79초 → **25초 이하**
- Vercel 타임아웃 위험: 제거

---

#### 1.2 배치 처리 최적화
```typescript
// BEFORE (sequential-tts-generator.ts:126-263)
const batchSize = 3;  // 3개씩 처리
await Promise.allSettled(batchPromises);
await new Promise(resolve => setTimeout(resolve, 2000));  // 2초 대기

// AFTER
const batchSize = 5;  // 5개씩 병렬 처리
// 배치 간 대기 제거 (불필요)
```

**예상 효과**:
- 25개 세그먼트 처리: 60초 → **35초**

---

#### 1.3 Circuit Breaker 및 Health Check 제거
```typescript
// REMOVE: Line 52-412 (sequential-tts-generator.ts)
private static circuitBreakerState = { ... };
private static apiHealthCache = { ... };
private static async checkApiHealth() { ... }
private static checkCircuitBreaker() { ... }
```

**이유**:
- Vercel Serverless는 매 요청마다 새 인스턴스 생성
- 메모리 상태가 유지되지 않음
- Health Check는 불필요한 API 호출 추가

---

### Phase 2: 아키텍처 변경 (Breaking Changes)

#### 2.1 Bull Queue 제거 및 Supabase Edge Functions 도입

**현재 문제**:
```typescript
// podcast-job-queue.ts
constructor(redisUrl?: string) {
  this.redis = new Redis(redisUrl);  // ❌ Vercel에서 Redis 유지 불가
  this.queue = new Queue(...);
}
```

**해결 방안**:
```typescript
// 새 파일: src/lib/queue/supabase-job-queue.ts
export class SupabaseJobQueue {
  // Supabase의 `podcast_jobs` 테이블 사용
  async addJob(jobData) {
    const { data } = await supabase
      .from('podcast_jobs')
      .insert({
        status: 'pending',
        payload: jobData,
        created_at: new Date()
      });

    // ✅ Vercel 함수는 즉시 반환
    return { jobId: data.id };
  }

  // Supabase Edge Function이 polling하여 처리
  // 또는 Supabase Realtime으로 트리거
}
```

**새 테이블 스키마**:
```sql
CREATE TABLE podcast_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload JSONB NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  INDEX idx_podcast_jobs_status (status)
);
```

---

#### 2.2 API 엔드포인트 분리

**현재 문제**:
- `/api/tts/notebooklm/generate` - 모든 작업을 한 번에 수행 (타임아웃 위험)

**해결 방안**:
1. **즉시 응답 패턴**
```typescript
// POST /api/tts/notebooklm/generate (새 버전)
export async function POST(req: NextRequest) {
  const { locationName, language } = await req.json();

  // 1. 빠른 검증 (1초 이내)
  const slugResult = await LocationSlugService.getOrCreateLocationSlug(locationName, language);

  // 2. 기존 완료된 에피소드 확인 (1초 이내)
  const existing = await checkExistingEpisode(slugResult.slug, language);
  if (existing) {
    return NextResponse.json({ success: true, data: existing });
  }

  // 3. 작업 큐에 추가 (1초 이내)
  const jobId = await SupabaseJobQueue.addJob({ locationName, language });

  // 4. 즉시 반환 (총 3초 이내)
  return NextResponse.json({
    success: true,
    jobId: jobId,
    status: 'queued',
    message: '팟캐스트 생성이 시작되었습니다.',
    pollUrl: `/api/tts/notebooklm/status?jobId=${jobId}`
  });
}
```

2. **진행 상황 조회**
```typescript
// GET /api/tts/notebooklm/status?jobId=xxx
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');

  const { data: job } = await supabase
    .from('podcast_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  return NextResponse.json({
    status: job.status,  // pending, processing, completed, failed
    progress: job.progress,  // 0-100
    result: job.result,
    error: job.error
  });
}
```

---

### Phase 3: 프론트엔드 적응

#### 3.1 Polling UI 구현
```typescript
// src/components/audio/ChapterBasedPodcastGenerator.tsx

async function generatePodcast() {
  setGenerating(true);

  // 1. 작업 요청
  const { jobId } = await fetch('/api/tts/notebooklm/generate', {
    method: 'POST',
    body: JSON.stringify({ locationName, language })
  }).then(r => r.json());

  // 2. Polling으로 진행 상황 확인
  const pollInterval = setInterval(async () => {
    const { status, progress, result, error } = await fetch(
      `/api/tts/notebooklm/status?jobId=${jobId}`
    ).then(r => r.json());

    setProgress(progress);

    if (status === 'completed') {
      clearInterval(pollInterval);
      setEpisode(result);
      setGenerating(false);
    } else if (status === 'failed') {
      clearInterval(pollInterval);
      setError(error);
      setGenerating(false);
    }
  }, 2000);  // 2초마다 확인
}
```

---

## 📋 실행 체크리스트

### Phase 1 (즉시 적용 - 1시간)
- [ ] `sequential-tts-generator.ts` 타임아웃 15초로 단축
- [ ] 재시도 로직 제거 (3곳)
- [ ] Circuit Breaker 제거
- [ ] API Health Check 제거
- [ ] 배치 크기 3 → 5로 증가
- [ ] 배치 간 대기 시간 제거
- [ ] 테스트: 콜로세움 팟캐스트 생성 (예상 25초)

### Phase 2 (아키텍처 변경 - 4시간)
- [ ] `podcast_jobs` 테이블 생성 (Supabase)
- [ ] `SupabaseJobQueue` 클래스 구현
- [ ] `/api/tts/notebooklm/generate` 즉시 반환 패턴 적용
- [ ] `/api/tts/notebooklm/status` 엔드포인트 추가
- [ ] Bull Queue 의존성 제거
- [ ] Supabase Edge Function 워커 구현 (선택)
- [ ] 테스트: 전체 플로우 검증

### Phase 3 (프론트엔드 - 2시간)
- [ ] Polling UI 구현
- [ ] 진행 상황 표시 컴포넌트
- [ ] 에러 처리 개선
- [ ] 사용자 피드백 메시지
- [ ] E2E 테스트

---

## 🎯 예상 성능 개선

### Before (현재)
- 평균 응답 시간: **79초**
- Vercel 타임아웃 위험: **높음** (Pro Plan 60초 초과)
- 실패 시 재시도: **최대 3회** (추가 180초)
- 사용자 경험: **대기 시간 불확실**

### After (최적화 후)
- 즉시 응답 시간: **3초 이하** ✅
- Vercel 타임아웃 위험: **없음** ✅
- 실패 시 재시도: **없음** (명확한 실패 메시지) ✅
- 사용자 경험: **진행 상황 실시간 표시** ✅

---

## 🚀 배포 전략

1. **Feature Flag 사용**
   - 환경변수 `USE_NEW_PODCAST_QUEUE=true/false`
   - 점진적 롤아웃

2. **A/B 테스트**
   - 50% 트래픽 → 새 시스템
   - 성능 지표 비교

3. **롤백 계획**
   - 기존 코드 유지 (deprecated 플래그)
   - 데이터베이스 마이그레이션 가역성

---

## 📚 참고 문서
- Vercel Limits: https://vercel.com/docs/functions/serverless-functions/runtimes#max-duration
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Realtime: https://supabase.com/docs/guides/realtime

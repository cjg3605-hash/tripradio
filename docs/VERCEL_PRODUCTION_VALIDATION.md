# Vercel 프로덕션 환경 검증 리포트

> **목적**: 로컬 환경과 Vercel 프로덕션 환경의 차이점 분석 및 잠재적 이슈 사전 검증

---

## 🔍 환경 차이 분석

### 1. 환경변수 차이

#### 로컬 환경 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fajiwgztfwoiisgnnams.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ***
SUPABASE_SERVICE_ROLE_KEY=eyJ***
GEMINI_API_KEY=AIzaSy***
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=***
```

#### Vercel 환경
**확인 필요사항**:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Vercel 환경변수 설정 확인 필요
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Vercel 환경변수 설정 확인 필요
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Vercel 환경변수 설정 확인 필요
- ✅ `GEMINI_API_KEY` - Vercel 환경변수 설정 확인 필요
- ⚠️ `NEXTAUTH_URL` - **Vercel에서 자동 설정되므로 수동 설정 불필요**
- ✅ `NEXTAUTH_SECRET` - Vercel 환경변수 설정 확인 필요

**중요**: Vercel에서는 `NEXT_PUBLIC_*` 접두사가 있는 환경변수만 클라이언트 측에서 접근 가능

---

### 2. 빌드 프로세스 차이

#### 로컬 빌드
```bash
npm run build
# - TypeScript 컴파일
# - Next.js 정적 페이지 생성
# - .next 폴더에 빌드 결과 저장
```

#### Vercel 빌드
```bash
# Vercel이 자동 실행
1. npm install (의존성 설치)
2. npm run build (Next.js 빌드)
3. 서버리스 함수 생성
4. 정적 자산 CDN 배포
```

**차이점**:
- ⚠️ Vercel은 **서버리스 함수**로 API 라우트 실행 (로컬은 Node.js 프로세스)
- ⚠️ API 라우트 **타임아웃**: Vercel Hobby 플랜 = **10초**, Pro 플랜 = **60초**
- ✅ 정적 자산(이미지, CSS, JS)은 CDN에서 서빙

---

### 3. 타임아웃 이슈 분석

#### 🚨 치명적 이슈: TTS 생성 API 타임아웃

**문제**:
```typescript
// app/api/tts/notebooklm/generate/route.ts
// 전체 팟캐스트 생성 시간: 30초 ~ 2분 (세그먼트 수에 따라)

// ❌ Vercel Hobby 플랜: 10초 타임아웃
// ❌ Vercel Pro 플랜: 60초 타임아웃
```

**영향**:
- 콜로세움 (61개 세그먼트) = 약 88분 재생 시간 = **생성 시간 1~2분**
- ❌ **Vercel에서 타임아웃 발생 확률 높음**

**해결책**:

#### Option 1: 백그라운드 작업 큐 (권장) ⭐
```typescript
// 1. 사용자 요청 → 즉시 "생성 중" 응답 (< 1초)
// 2. 백그라운드에서 TTS 생성 진행
// 3. 클라이언트가 주기적으로 상태 폴링

// 구현 필요:
// - Vercel KV (Redis) 또는 Upstash
// - 백그라운드 작업 큐 (Bull.js 또는 Vercel Cron)
```

#### Option 2: Vercel Pro 플랜 업그레이드
```
- 60초 타임아웃 → 짧은 팟캐스트(< 30초) 생성 가능
- 여전히 긴 팟캐스트는 실패 가능성 있음
```

#### Option 3: 스트리밍 응답 (부분 구현)
```typescript
// 세그먼트별로 생성되는 즉시 클라이언트에 전송
// Next.js 13+ Server-Sent Events (SSE) 사용
```

---

### 4. 오디오 파일 경로 차이

#### 로컬 환경
```typescript
// 환경변수 기반 URL 생성
const audioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3`;
// ✅ 정상 동작
```

#### Vercel 환경
```typescript
// 동일한 로직이지만 환경변수가 설정되지 않으면?
const audioUrl = `undefined/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3`;
// ❌ 잘못된 URL
```

**검증 필요**:
- ✅ Vercel 대시보드에서 `NEXT_PUBLIC_SUPABASE_URL` 설정 확인
- ✅ 빌드 로그에서 환경변수 주입 확인

---

### 5. 데이터베이스 연결 차이

#### Supabase 클라이언트
```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**로컬 vs Vercel**:
- ✅ Supabase는 클라우드 서비스이므로 동일하게 동작
- ⚠️ **단, 환경변수가 설정되지 않으면 `undefined` 오류 발생**

**검증 방법**:
```bash
# Vercel CLI로 환경변수 확인
vercel env ls

# 또는 Vercel 대시보드:
# Settings > Environment Variables
```

---

### 6. PWA 및 Service Worker 차이

#### 로컬 환경
```javascript
// next.config.js
disable: process.env.NODE_ENV === 'development' // PWA 비활성화
```

#### Vercel 프로덕션
```javascript
// PWA 활성화됨
register: true
skipWaiting: true
```

**차이점**:
- ✅ Vercel에서는 Service Worker가 활성화되어 캐싱 동작
- ✅ manifest.json 캐싱 규칙이 적용됨 (최근 추가됨)
- ⚠️ 초기 배포 후 Service Worker 업데이트 시 캐시 무효화 필요

---

### 7. API 라우트 실행 환경 차이

#### 로컬 환경
```
Node.js 프로세스 (지속적 실행)
- 메모리: 무제한 (시스템 메모리까지)
- CPU: 로컬 CPU 전체 사용
- 파일 시스템: 읽기/쓰기 가능
```

#### Vercel 환경
```
서버리스 함수 (Lambda)
- 메모리: 1024MB (Hobby 플랜)
- CPU: 제한적
- 파일 시스템: /tmp만 쓰기 가능 (512MB, 휘발성)
- 콜드 스타트: 첫 요청 시 지연 (수백ms ~ 수초)
```

**영향**:
- ⚠️ TTS 생성 시 메모리 사용량 확인 필요
- ⚠️ 파일 시스템에 쓰지 않으므로 문제 없음 (Supabase Storage 사용)

---

## 🎯 검증 체크리스트

### A. 환경변수 검증

**Vercel 대시보드 확인 필요**:
```
Settings > Environment Variables

✅ NEXT_PUBLIC_SUPABASE_URL = https://fajiwgztfwoiisgnnams.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ***
✅ SUPABASE_SERVICE_ROLE_KEY = eyJ***
✅ GEMINI_API_KEY = AIzaSy***
✅ NEXTAUTH_SECRET = ***
⚠️ GOOGLE_PLACES_API_KEY = (선택적, 비활성화됨)
```

**환경 스코프**:
- Production ✅
- Preview ✅ (선택적)
- Development (로컬 .env.local 사용)

---

### B. API 타임아웃 검증

#### 현재 상태
```typescript
// app/api/tts/notebooklm/generate/route.ts
// 타임아웃 설정 없음 → Vercel 기본 타임아웃 적용

// ❌ Hobby 플랜: 10초 (매우 짧음)
// ⚠️ Pro 플랜: 60초 (짧은 팟캐스트만 가능)
```

#### 권장 조치
```typescript
// vercel.json 파일 생성
{
  "functions": {
    "app/api/tts/notebooklm/generate/route.ts": {
      "maxDuration": 60 // Pro 플랜에서만 가능
    }
  }
}

// 또는 Next.js 설정
export const config = {
  maxDuration: 60 // 초 단위
};
```

**현실적 해결책**:
- 긴 팟캐스트는 백그라운드 작업 큐로 처리
- 짧은 팟캐스트(< 10개 세그먼트)만 실시간 생성

---

### C. 오디오 파일 접근성 검증

**테스트 URL**:
```
https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3
```

**검증 방법**:
```bash
# 1. 브라우저에서 직접 접근
curl -I https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3

# 예상 응답:
HTTP/2 200
content-type: audio/mpeg
```

**Vercel에서 확인**:
- ✅ Supabase Storage는 public 버킷이므로 CORS 문제 없음
- ✅ 환경변수만 올바르게 설정되면 동일하게 동작

---

### D. 데이터베이스 쿼리 검증

**테스트 쿼리**:
```typescript
// 프로덕션 환경에서 실행되는지 확인
const { data, error } = await supabase
  .from('podcast_episodes')
  .select('*')
  .eq('location_slug', 'colosseum')
  .eq('language', 'ko')
  .limit(1);

console.log('Vercel 환경:', {
  hasData: !!data,
  error: error?.message,
  env: process.env.NEXT_PUBLIC_SUPABASE_URL
});
```

**검증 포인트**:
- ✅ Supabase RLS (Row Level Security) 정책 확인
- ✅ `anon` 키로 접근 가능한 데이터인지 확인

---

### E. PWA 동작 검증

**Service Worker 캐싱**:
```javascript
// 로컬: 비활성화
// Vercel: 활성화

// 검증:
1. Vercel 배포 후 브라우저 DevTools > Application > Service Workers 확인
2. manifest.json 로드 확인 (200 OK)
3. 오디오 파일 캐싱 확인
```

---

## 🚨 Vercel 특화 이슈 및 해결책

### Issue 1: TTS 생성 API 타임아웃 ⚠️

**문제**:
```
Vercel Hobby 플랜: 10초 타임아웃
→ 콜로세움 팟캐스트 (61개 세그먼트) 생성 불가
```

**해결책 1: 백그라운드 작업 큐** (권장)
```typescript
// 1. Upstash Redis 연동
import { Redis } from '@upstash/redis';

// 2. 작업 큐에 추가
await redis.lpush('tts_queue', {
  locationName: 'colosseum',
  language: 'ko',
  episodeId: 'episode-xxx'
});

// 3. Vercel Cron Job으로 처리
// vercel.json
{
  "crons": [{
    "path": "/api/cron/process-tts",
    "schedule": "*/5 * * * *" // 5분마다
  }]
}
```

**해결책 2: 세그먼트 단위 생성**
```typescript
// 전체 팟캐스트를 한 번에 생성하지 않고
// 세그먼트 10개씩 나눠서 생성

// POST /api/tts/notebooklm/generate-batch
// { start: 0, count: 10 }
```

**해결책 3: 프리빌드** (사전 생성)
```typescript
// 인기 장소는 사전에 생성해두기
// - 콜로세움 (ko, en, ja, zh, es)
// - 에펠탑 (ko, en, ja, zh, es)
// - ...
```

---

### Issue 2: 환경변수 누락 시 빌드 실패 ⚠️

**문제**:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Vercel에 환경변수 미설정 시 빌드 실패
```

**해결책**:
```typescript
// 환경변수 검증 추가
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다.');
}
```

**Vercel 배포 시 자동 검증**:
```bash
# .github/workflows/vercel-deploy.yml (선택적)
- name: Check environment variables
  run: |
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
      echo "❌ Missing NEXT_PUBLIC_SUPABASE_URL"
      exit 1
    fi
```

---

### Issue 3: 콜드 스타트 지연 ⚠️

**문제**:
```
첫 API 요청 시 서버리스 함수 초기화 → 지연 발생 (수백ms ~ 2초)
```

**영향**:
- 팟캐스트 페이지 첫 로드 시 느림

**해결책**:
```typescript
// 1. 클라이언트에서 로딩 인디케이터 표시
setIsLoading(true);

// 2. Vercel Edge Functions 사용 (선택적)
// - 콜드 스타트 없음
// - 단, Node.js API 일부 제한
```

---

### Issue 4: Vercel Analytics 영향 ⚠️

**문제**:
```
Vercel Analytics가 자동 주입됨
→ 초기 로드 시간 약간 증가 (수십ms)
```

**해결책**:
```javascript
// vercel.json
{
  "analytics": false // 비활성화 (선택적)
}
```

---

## 📊 Vercel vs 로컬 비교표

| 항목 | 로컬 환경 | Vercel 환경 | 대응 방안 |
|------|----------|------------|----------|
| **환경변수** | .env.local | Vercel 대시보드 | ✅ 수동 설정 필요 |
| **API 타임아웃** | 무제한 | 10초 (Hobby) / 60초 (Pro) | ⚠️ 백그라운드 작업 큐 필요 |
| **메모리** | 무제한 | 1024MB | ✅ 충분함 |
| **파일 시스템** | 읽기/쓰기 가능 | /tmp만 쓰기 (512MB) | ✅ Supabase Storage 사용 |
| **PWA** | 비활성화 | 활성화 | ✅ 정상 동작 |
| **Service Worker** | 없음 | 있음 | ✅ 캐싱 규칙 적용됨 |
| **콜드 스타트** | 없음 | 있음 (첫 요청) | ⚠️ 로딩 인디케이터 |
| **오디오 URL** | 환경변수 기반 | 환경변수 기반 | ✅ 동일 |
| **DB 연결** | Supabase 클라우드 | Supabase 클라우드 | ✅ 동일 |
| **빌드 시간** | ~30초 | ~45초 | ✅ 허용 범위 |

---

## ✅ Vercel 배포 전 체크리스트

### 1단계: 환경변수 설정
```
□ Vercel 대시보드 > Settings > Environment Variables
□ NEXT_PUBLIC_SUPABASE_URL 추가
□ NEXT_PUBLIC_SUPABASE_ANON_KEY 추가
□ SUPABASE_SERVICE_ROLE_KEY 추가
□ GEMINI_API_KEY 추가
□ NEXTAUTH_SECRET 추가
□ 모든 환경변수를 Production 스코프로 설정
```

### 2단계: vercel.json 설정 (선택적)
```json
{
  "functions": {
    "app/api/tts/notebooklm/generate/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [{
    "path": "/api/cron/cleanup-old-episodes",
    "schedule": "0 0 * * *"
  }]
}
```

### 3단계: 빌드 테스트
```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build
npm start

# 환경변수 로드 확인
curl http://localhost:3000/api/health
```

### 4단계: 배포
```bash
# Vercel CLI 사용
vercel --prod

# 또는 GitHub 연동 (자동 배포)
git push origin master
```

### 5단계: 배포 후 검증
```bash
# 1. 팟캐스트 페이지 로드
https://tripradio.shop/podcast/ko/colosseum

# 2. 오디오 재생 테스트
# 3. 세그먼트 전환 테스트
# 4. 새로운 팟캐스트 생성 테스트 (타임아웃 확인)
```

---

## 🚀 권장 배포 전략

### Phase 1: 기본 배포 (현재)
```
✅ 기존 에피소드 재생 - 완벽 동작
⚠️ 신규 에피소드 생성 - 타임아웃 가능성
```

### Phase 2: 백그라운드 작업 큐 구현
```
□ Upstash Redis 연동
□ 작업 큐 시스템 구현
□ 상태 폴링 API 추가
□ Vercel Cron Job 설정
```

### Phase 3: 최적화
```
□ 인기 장소 프리빌드
□ Edge Functions 마이그레이션
□ CDN 캐싱 최적화
```

---

## 🔧 문제 발생 시 디버깅

### Vercel 로그 확인
```bash
# Vercel CLI로 실시간 로그 확인
vercel logs --follow

# 또는 Vercel 대시보드:
# Deployments > [배포] > Function Logs
```

### 환경변수 확인
```bash
# Vercel CLI
vercel env pull

# API 라우트에서 로그
console.log('Environment check:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
  hasGeminiKey: !!process.env.GEMINI_API_KEY
});
```

### 타임아웃 확인
```javascript
// API 라우트에 타이머 추가
const startTime = Date.now();

// ... 작업 수행 ...

const duration = Date.now() - startTime;
console.log(`⏱️ API 실행 시간: ${duration}ms`);
```

---

## 📝 결론

### ✅ Vercel에서 정상 동작 예상
1. 기존 팟캐스트 조회 및 재생
2. 오디오 스트리밍
3. 데이터베이스 쿼리
4. PWA 기능
5. Service Worker 캐싱

### ⚠️ Vercel에서 문제 가능성
1. **신규 팟캐스트 생성** (타임아웃)
   - 해결책: 백그라운드 작업 큐 또는 세그먼트 단위 생성
2. **콜드 스타트 지연** (첫 요청)
   - 해결책: 로딩 인디케이터, Edge Functions
3. **환경변수 누락** (배포 실패)
   - 해결책: 배포 전 체크리스트 준수

### 🎯 즉시 조치 필요
1. ✅ Vercel 대시보드에서 환경변수 모두 설정
2. ⚠️ 긴 팟캐스트 생성 시 타임아웃 대응 방안 구현
3. ✅ 배포 후 기존 에피소드 재생 테스트

**전체 평가**: 🟡 **부분 준비 완료** (기존 기능은 정상, 신규 생성은 제한적)

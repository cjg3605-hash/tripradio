# 📅 Week 3 상세 실행 계획: 캐싱 및 배포 최적화

**목표:** 5.5초 → 4.0초 (-42% 누적 개선) | 반복 방문 시 80% 단축
**기간:** 월-금 (32시간)
**우선순위:** 🟠 P1 (필수)

---

## 🎯 Week 3 Overview

### 목표 분석
```
현재 상태: 5.5초 (Week 2 완료 후)
목표: 4.0초
개선: 1.5초 단축 필요

주요 전략:
1. ISR: 정적 생성으로 반복 방문 80% 단축
2. 캐싱: 에지 캐싱으로 배송 시간 20% 단축
3. CDN: 지역별 캐싱으로 글로벌 성능 향상

특징:
- 반복 방문 최적화 (첫 방문: 5.5초 → 반복: 1초)
- 글로벌 성능 (지역별 10-20% 개선)
```

---

## 📋 Task 3-1: ISR (Incremental Static Regeneration) 구현 (3시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: Architect (시스템 아키텍처)
   역할: ISR 전략 설계, 장기 확장성 고려
   특기: 시스템 설계, 유지보수성

👤 Secondary Persona: Backend (API 신뢰성)
   역할: 동적 라우팅 최적화, 데이터 처리
   특기: 데이터 무결성, 성능

🛠️ Skill: webapp-testing (검증)
   용도: ISR 효과 측정, 반복 방문 성능 확인
```

### 작업 세부사항

#### 3-1-1: ISR 전략 설계 (1.5시간)

**담당:** Architect

```typescript
// ISR 설계 문서

목표:
1. 인기 있는 위치 미리 생성
2. 1시간마다 재검증 (revalidate: 3600)
3. 요청 시 동적 생성 (fallback: 'blocking')

전략:
┌─────────────────┬──────────────┬─────────┐
│ 시간 범위       │ 생성 방식    │ 캐시    │
├─────────────────┼──────────────┼─────────┤
│ 0-5분           │ 정적 (사전)  │ 최대 60분│
│ 5-60분          │ 정적 + 캐시  │ stale   │
│ 60분 이후       │ 재검증       │ 새로 생성│
│ 요청 시 미생성  │ 동적 생성    │ 1시간   │
└─────────────────┴──────────────┴─────────┘

구현 방법:
1. generateStaticParams: 인기 위치 목록
2. revalidate: 3600초 (1시간)
3. fallback: 'blocking' (요청 시 생성)
```

**구체적 설정:**
```typescript
// app/guide/[language]/[location]/page.tsx

export const revalidate = 3600  // 1시간마다 재검증

export async function generateStaticParams() {
  // 인기 있는 위치 미리 생성
  const popularLocations = [
    { language: 'ko', location: 'eiffel-tower' },
    { language: 'ko', location: 'gyeongbokgung' },
    { language: 'en', location: 'eiffel-tower' },
    { language: 'en', location: 'colosseum' },
    // ... 상위 50개
  ]

  return popularLocations
}

export async function generateMetadata({ params }) {
  const { language, location } = params
  const guide = await getGuideData(location, language)

  return {
    title: guide.title,
    description: guide.description,
  }
}

export default async function GuidePage({ params }) {
  const { language, location } = params
  const guide = await getGuideData(location, language)

  return (
    // 페이지 컴포넌트
  )
}
```

#### 3-1-2: ISR 구현 (1시간)

**담당:** Backend

```typescript
// 동적 라우팅 최적화

// 1. getGuideData 함수 최적화
async function getGuideData(slug, language) {
  // Supabase 캐싱 레이어 추가
  const cacheKey = `guide:${slug}:${language}`

  // Redis/메모리 캐시 확인
  const cached = await cache.get(cacheKey)
  if (cached) return cached

  // DB 조회
  const guide = await db.guides.findOne({
    location_names: { [language]: slug }
  })

  // 캐시 저장 (1시간)
  await cache.set(cacheKey, guide, 3600)

  return guide
}

// 2. 배포 설정 최적화
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  experimental: {
    isrMemoryCacheSize: 52 * 1024 * 1024, // 52MB
  }
}
```

#### 3-1-3: ISR 검증 (0.5시간)

**담당:** QA + Performance (webapp-testing)

```bash
# ISR 효과 측정:

# 첫 방문 (동적 생성):
curl -I https://tripradio.shop/guide/ko/new-location
# 예상: 5.5초

# 반복 방문 (정적 캐시):
curl -I https://tripradio.shop/guide/ko/eiffel-tower
# 예상: <1초

# 재검증 후 (1시간 후):
# 예상: 다시 5.5초 (한 번만, 그 후 <1초)

검증 체크리스트:
□ 정적 페이지 생성됨 (빌드 시)
□ 첫 방문 정상 렌더링
□ 반복 방문 캐시 적중
□ 1시간 후 재검증 작동
□ 새 위치 요청 시 동적 생성
□ 404 페이지 캐시되지 않음
```

---

## 📋 Task 3-2: 캐싱 헤더 설정 (2시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: DevOps (배포 자동화)
   역할: Vercel 캐싱 정책 설정
   특기: 배포 자동화, 인프라 설정

👤 Secondary Persona: Performance
   역할: 캐시 효율성 측정
   특기: 메트릭 분석

🛠️ Skill: webapp-testing (캐시 검증)
```

### 작업 세부사항

#### 3-2-1: Vercel 캐싱 정책 설정 (1시간)

**담당:** DevOps

```json
// vercel.json
{
  "headers": [
    {
      "source": "/guide/:language/:location",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/podcast/:language/:location",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=1800, stale-while-revalidate=3600"
        }
      ]
    },
    {
      "source": "/_next/static/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=604800"
        }
      ]
    }
  ]
}
```

**캐싱 전략:**
```
캐시 타입별 설정:

1. 가이드 페이지 (/guide/*)
   - s-maxage: 3600초 (1시간)
   - stale-while-revalidate: 86400초 (1일)
   - 효과: 1시간 내 재방문 캐시, 1일 이상 stale 제공

2. 팟캐스트 페이지 (/podcast/*)
   - s-maxage: 1800초 (30분)
   - stale-while-revalidate: 3600초 (1시간)
   - 효과: 30분 내 재방문 캐시

3. 정적 번들 (_next/static/*)
   - max-age: 31536000초 (1년)
   - immutable: 버전 변경 안 됨
   - 효과: 최대 캐시 (파일명에 해시 포함)

4. 이미지 (/images/*)
   - max-age: 604800초 (1주)
   - 효과: 1주 캐시
```

#### 3-2-2: 캐시 효율성 검증 (1시간)

**담당:** Performance + QA (webapp-testing)

```bash
# 캐시 헤더 검증:

# 1. 캐시 헤더 확인
curl -I https://tripradio.shop/guide/ko/eiffel-tower
# Response Headers 확인:
# Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400

# 2. 캐시 히트 확인
# Vercel Analytics에서:
# - Cache HIT 비율 > 80%
# - 평균 응답 시간 < 100ms

# 3. 성능 비교
첫 방문: 5.5초
캐시 히트: <200ms (25배 빠름)

검증 체크리스트:
□ 정확한 Cache-Control 헤더 설정
□ 캐시 히트율 80% 이상
□ 응답 시간 <200ms (캐시 시)
□ Vercel 대시보드에서 캐시 통계 확인
□ CloudFlare (있다면) 캐시율 확인
```

---

## 📋 Task 3-3: CDN 및 엣지 최적화 (2시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: DevOps
   역할: CDN 설정, 엣지 함수 배포
   특기: 배포 자동화

👤 Secondary Persona: Performance
   역할: 지역별 성능 측정
   특기: 메트릭 분석

🛠️ Skill: webapp-testing (지역별 성능 측정)
```

### 작업 세부사항

#### 3-3-1: 엣지 함수 최적화 (1시간)

**담당:** DevOps

```typescript
// next.config.js

module.exports = {
  // 엣지 함수 활성화
  experimental: {
    edge: {
      runtime: 'nodejs'
    }
  },

  // 국제화 설정
  i18n: {
    locales: ['ko', 'en', 'ja', 'zh', 'es'],
    defaultLocale: 'ko'
  },

  // 이미지 최적화 (엣지에서)
  images: {
    unoptimized: false, // Vercel 이미지 최적화 사용
    formats: ['image/avif', 'image/webp']
  }
}

// api/middleware.ts - 엣지 미들웨어
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 지역별 리다이렉트 (선택사항)
  if (pathname === '/') {
    const language = request.geo?.country || 'ko'
    return NextResponse.rewrite(`/${language}${pathname}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|favicon.ico).*)']
}
```

#### 3-3-2: 지역별 성능 측정 (1시간)

**담당:** Performance (webapp-testing)

```bash
# 지역별 성능 측정:

# US 지역 (curl로 시뮬레이션):
curl -H "x-forwarded-for: 1.1.1.1" https://tripradio.shop/guide/en/eiffel-tower
# 예상: 150-200ms

# Asia-Pacific (한국):
curl -H "x-forwarded-for: 61.x.x.x" https://tripradio.shop/guide/ko/eiffel-tower
# 예상: 50-100ms

# Europe:
curl -H "x-forwarded-for: 5.x.x.x" https://tripradio.shop/guide/en/eiffel-tower
# 예상: 100-150ms

성능 목표:
┌─────────────┬────────────┬─────────┐
│ 지역        │ 로드 시간  │ 개선    │
├─────────────┼────────────┼─────────┤
│ 한국        │ 50-100ms   │ -20%    │
│ 아시아      │ 100-150ms  │ -20%    │
│ 미국        │ 150-200ms  │ -20%    │
│ 유럽        │ 100-150ms  │ -20%    │
│ 기타        │ 200-300ms  │ -20%    │
└─────────────┴────────────┴─────────┘

검증:
□ Vercel Analytics에서 지역별 성능 확인
□ Speed Test 도구로 글로벌 성능 검증
□ CloudFlare (있다면) 캐시 통계 확인
```

---

## 📋 Task 3-4: Week 3 검증 (2시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: QA
   역할: 회귀 테스트, 검증
   특기: 엣지 케이스, 신뢰성

👤 Secondary Persona: Performance
   역할: 최종 성능 측정
   특기: 메트릭 비교

🛠️ Skill: webapp-testing (최종 검증)
```

### 작업 세부사항

#### 3-4-1: 캐싱 효과 측정 (1시간)

**담당:** Performance + QA (webapp-testing)

```bash
# 캐싱 효과 측정:

python test-diagnose-multilingual-extended.py

# 측정 항목:
첫 방문 (콜드 캐시):
  DOMContentLoaded: 1.0초
  networkidle: 5.5초 (예상 또는 실제)

반복 방문 (핫 캐시):
  DOMContentLoaded: 0.5초
  networkidle: 1.0초 (5배 빠름)

성능 비교:
┌─────────────┬──────────┬──────────┬────────┐
│ 메트릭      │ Week 2   │ Week 3   │ 개선   │
├─────────────┼──────────┼──────────┼────────┤
│ 첫 방문     │ 5.5초    │ 4.0초    │ -27%   │
│ 반복 방문   │ 5.5초    │ 1.0초    │ -82%   │
│ 캐시 히트율 │ 0%       │ 80%      │ +80%   │
└─────────────┴──────────┴──────────┴────────┘
```

#### 3-4-2: 회귀 테스트 및 보고서 (1시간)

**담당:** QA + Analyzer

```bash
# 회귀 테스트:
python test-tripradio-shop.py

목표:
□ 9개 테스트 모두 통과
□ 성능 개선 확인
□ 캐싱 부작용 없음 (예: 이전 데이터 캐시 등)

성과 보고서:
# Week 3 성과 보고서

## 완료된 작업
- [x] ISR 구현 (1시간마다 재검증)
- [x] 캐싱 헤더 설정
- [x] CDN 최적화
- [x] 회귀 테스트
- [x] 성능 측정

## 성능 개선
- 첫 방문: 7.5초 → 4.0초 (-47%)
- 반복 방문: 7.5초 → 1.0초 (-87%)
- 캐시 히트율: 80% 이상

## 누적 개선
- Week 1: -6% (8.39s → 7.89s)
- Week 2: -27% (7.89s → 5.74s)
- Week 3: -30% (5.74s → 4.0s)
- 전체: -52% (8.39s → 4.0s)

## 다음 주 계획
Week 4: 모니터링 및 최종 검증
목표: 4.0초 → 3.5초 (-12%)
```

---

## 📅 Week 3 일정표

```
┌────────┬──────────────────┬──────────┬─────────┐
│ 날짜   │ 작업             │ 담당     │ 시간    │
├────────┼──────────────────┼──────────┼─────────┤
│ Mon    │ 3-1 ISR 설계     │ Architect│ 1.5시간 │
│        │ 3-2 캐싱 정책    │ DevOps   │ 1시간   │
├────────┼──────────────────┼──────────┼─────────┤
│ Tue    │ 3-1 ISR 구현     │ Backend  │ 1시간   │
│        │ 3-2 헤더 설정    │ DevOps   │ 0.5시간 │
├────────┼──────────────────┼──────────┼─────────┤
│ Wed    │ 3-1 ISR 검증     │ QA       │ 0.5시간 │
│        │ 3-2 캐시 검증    │ Perf     │ 1시간   │
├────────┼──────────────────┼──────────┼─────────┤
│ Thu    │ 3-3 엣지 최적화  │ DevOps   │ 1시간   │
│        │ 3-3 성능 측정    │ Perf     │ 1시간   │
├────────┼──────────────────┼──────────┼─────────┤
│ Fri    │ 3-4 최종 측정    │ Perf     │ 1시간   │
│        │ 3-4 성과 보고서  │ Analyzer │ 1시간   │
└────────┴──────────────────┴──────────┴─────────┘
```

---

## 📊 페르소나별 시간 할당

```
DevOps: 4시간
  ├─ ISR 전략 설계 (0.5시간)
  ├─ 캐싱 정책 설정 (1시간)
  ├─ 캐싱 헤더 설정 (0.5시간)
  └─ 엣지 최적화 (1.5시간)

Architect: 1.5시간
  └─ ISR 시스템 설계

Backend: 1시간
  └─ ISR 구현

Performance: 3시간
  ├─ 캐시 효율성 측정 (1시간)
  ├─ 지역별 성능 측정 (1시간)
  └─ 최종 성능 측정 (1시간)

QA: 1.5시간
  ├─ ISR 검증 (0.5시간)
  └─ 회귀 테스트 (1시간)

Analyzer: 1시간
  └─ 성과 보고서
```

---

## 🎯 Week 3 성공 기준

```
필수:
  [✓] ISR 구현 완료 (revalidate: 3600)
  [✓] 캐싱 헤더 설정 완료
  [✓] 첫 방문: 5.5초 → 4.0초 달성 (-27%)
  [✓] 반복 방문: <1초 달성 (-82%)
  [✓] 캐시 히트율: 80% 이상
  [✓] 모든 회귀 테스트 통과

선택:
  [✓] CDN 지역별 성능 개선 20% 이상
  [✓] Lighthouse 점수 85점 이상
```

---

## 🚀 배포 전 체크리스트

```
코드 검증:
  [ ] npm run build (빌드 성공)
  [ ] ISR 정적 페이지 생성 확인
  [ ] 캐싱 헤더 적용 확인

성능 검증:
  [ ] 첫 방문 성능 측정
  [ ] 반복 방문 성능 측정
  [ ] 지역별 성능 확인

캐싱 검증:
  [ ] Cache-Control 헤더 확인
  [ ] 캐시 히트율 측정
  [ ] Stale-while-revalidate 작동 확인

배포:
  [ ] Git commit: "Week 3: Implement ISR and caching strategy"
  [ ] Vercel 배포
  [ ] Analytics 모니터링 시작
```

---

**Week 3 준비 완료! 🚀**

*다음 업데이트: 2025-11-09 (Friday) - Week 3 완료 보고서*

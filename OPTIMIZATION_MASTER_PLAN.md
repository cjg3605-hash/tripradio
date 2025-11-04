# TripRadio.shop 성능 최적화 마스터 플랜
**목표:** 8.39초 → 3.5초 (58% 개선) | 96개 요청 → 45개 (53% 감소)
**기간:** 4주 | **우선순위 기반 단계별 실행**

---

## 📊 1단계: 현황 분석

### 핵심 병목 (Critical Bottlenecks)

```
현재 로딩 분석:
├─ DOMContentLoaded: 1.01초 ✅ (양호)
├─ 완전 로드 (networkidle): 8.39초 ❌ (문제)
├─ 네트워크 요청: 96개 ❌ (과도)
├─ 요청 실패율: 4.2% ❌ (개선 필요)
└─ Lighthouse Score: 미측정 (예상 60-70점)
```

### 성능 영향도 분석

```
영향도 높음 (HIGH) - 즉시 개선 필요:
1. 네트워크 요청 최소화 (96개 → 50개)
   └─ 예상 개선: 3-4초 단축 ⭐⭐⭐⭐⭐

2. AdSense 비동기 로드
   └─ 예상 개선: 1-2초 단축 ⭐⭐⭐⭐

3. 번들 최적화 (CSS/JS)
   └─ 예상 개선: 1-2초 단축 ⭐⭐⭐⭐

영향도 중간 (MEDIUM) - 2주차 이후:
4. 이미지 최적화
   └─ 예상 개선: 0.5-1초 단축 ⭐⭐⭐

5. 폰트 최적화
   └─ 예상 개선: 0.5초 단축 ⭐⭐⭐

6. 캐싱 전략
   └─ 예상 개선: 반복 방문 시 80% 단축 ⭐⭐⭐

영향도 낮음 (LOW) - 선택 사항:
7. Code Splitting
   └─ 예상 개선: 초기 로드 시간 5% 단축 ⭐⭐

8. 모니터링 설정
   └─ 예상 개선: 지속적 성능 추적 ⭐⭐
```

---

## 🛠️ 2단계: 필요한 스킬 분석

### 설치된 스킬 중 활용 가능한 것들

#### 🏆 핵심 스킬 (반드시 사용)

| 스킬 | 용도 | 활용도 | 상태 |
|------|------|--------|------|
| **webapp-testing** | 성능 측정, 회귀 테스트 | ⭐⭐⭐⭐⭐ | ✅ 사용 중 |
| **skill-creator** | 커스텀 최적화 도구 개발 | ⭐⭐⭐⭐ | 🔄 필요 |
| **mcp-builder** | 자동화 스크립트 빌더 | ⭐⭐⭐ | 🔄 필요 |

#### 🎯 보조 스킬 (선택적)

| 스킬 | 용도 | 활용도 | 상태 |
|------|------|--------|------|
| **artifacts-builder** | 최적화 대시보드 UI | ⭐⭐ | ✓ 활용 가능 |
| **theme-factory** | 성능 비교 시각화 | ⭐ | ✓ 활용 가능 |
| **template-skill** | 반복 작업 템플릿 | ⭐ | ✓ 활용 가능 |

#### ❌ 불필요한 스킬
- algorithmic-art, brand-guidelines, canvas-design
- docx, pdf, pptx, xlsx, internal-comms, slack-gif-creator

---

## 📋 3단계: 최적화 작업 항목 상세 분류

### A. 코드 수준 최적화 (개발자 작업)

#### A1. 번들 최적화 (CRITICAL)
```
파일: next.config.js, tsconfig.json
영향: -2-3초 로딩 시간
작업:
  - [ ] 사용되지 않은 CSS 제거 (PurgeCSS/TailwindCSS)
  - [ ] JavaScript 번들 분석 (webpack-bundle-analyzer)
  - [ ] 동적 import (Code Splitting)
  - [ ] Tree Shaking 활성화
```

#### A2. 이미지 최적화 (HIGH)
```
파일: app/guide/[language]/[location]/page.tsx
영향: -1-2초 로딩 시간
작업:
  - [ ] Next.js Image 컴포넌트 적용
  - [ ] WebP 형식 변환
  - [ ] srcset/sizes 최적화
  - [ ] Lazy loading 설정
```

#### A3. 폰트 최적화 (HIGH)
```
파일: app/layout.tsx, CSS
영향: -0.5-1초 로딩 시간
작업:
  - [ ] 폰트 서빙 전략 (font-display: swap)
  - [ ] 필수 폰트만 선택
  - [ ] 폰트 로드 순서 최적화
  - [ ] Preload/Prefetch 적용
```

#### A4. 광고(AdSense) 최적화 (HIGH)
```
파일: app/layout.tsx, app/page.tsx
영향: -1-2초 로딩 시간
작업:
  - [ ] async 스크립트로 변경
  - [ ] lazy loading 설정
  - [ ] 광고 로드 지연 (2초 후)
  - [ ] placeholder 추가
```

### B. 배포 수준 최적화 (Vercel 설정)

#### B1. 캐싱 전략 (HIGH)
```
파일: vercel.json, next.config.js
영향: 반복 방문 시 80% 단축
작업:
  - [ ] ISR (Incremental Static Regeneration) 설정
  - [ ] s-maxage 설정 (3600초)
  - [ ] stale-while-revalidate 설정
  - [ ] 언어별 캐시 분리
```

#### B2. 압축 및 헤더 최적화 (MEDIUM)
```
파일: vercel.json
영향: -0.3-0.5초 로딩 시간
작업:
  - [ ] Gzip 압축 확인
  - [ ] Brotli 압축 설정
  - [ ] ETag 설정
  - [ ] 보안 헤더 최적화
```

#### B3. CDN 설정 (MEDIUM)
```
파일: vercel.json, next.config.js
영향: 지역별 배송 시간 20% 단축
작업:
  - [ ] Edge Function 활용
  - [ ] 지역별 캐싱 정책
  - [ ] 정적 리소스 CDN 설정
```

### C. 데이터베이스 수준 최적화 (선택)

#### C1. 쿼리 최적화 (MEDIUM)
```
파일: src/lib/supabaseClient.ts
영향: 백엔드 응답 -0.5-1초
작업:
  - [ ] 쿼리 프로파일링
  - [ ] 인덱스 확인 (location_names JSONB)
  - [ ] 불필요한 조인 제거
  - [ ] 캐싱 계층 추가
```

### D. 모니터링 및 추적 (SUPPORT)

#### D1. 성능 모니터링 설정 (LOW)
```
파일: 신규 생성
영향: 지속적 성능 추적
작업:
  - [ ] Web Vitals 설정
  - [ ] Lighthouse CI 통합
  - [ ] 성능 대시보드 구축
```

---

## 🎯 4단계: 4주 실행 계획

### 📅 Week 1: 긴급 고치기 (6-8시간)

#### 목표
- 즉시 가능한 최적화 적용
- 테스트 환경 설정

#### 작업 항목

**Monday (2시간)**
- [ ] 프로젝트 분석 및 구조 파악
- [ ] next.config.js 검토
- [ ] 현재 번들 크기 분석 (webpack-bundle-analyzer)

**Tuesday-Wednesday (3시간)**
- [ ] A4. AdSense 비동기 로드 적용
  ```javascript
  // next/script 사용
  <Script
    src="https://pagead2.googlesyndication.com/..."
    strategy="lazyOnload"
    onLoad={() => console.log('AdSense loaded')}
  />
  ```

- [ ] 실패 요청 4개 분석 및 수정
  ```bash
  # 실패 요청 식별
  # 1. 외부 API 상태 확인
  # 2. CORS 정책 검토
  # 3. CDN 설정 확인
  # 4. 재시도 로직 추가
  ```

**Thursday-Friday (1.5시간)**
- [ ] Playwright 테스트 타임아웃 조정 (5s → 10s)
- [ ] Week 1 변경사항 테스트
- [ ] 성능 측정 및 기록

#### 예상 개선 효과
```
완전 로드: 8.39s → 7.5s (-0.9s)
네트워크 요청: 96개 → 90개 (-6개)
Lighthouse Score: 예상 65점 → 70점
```

---

### 📅 Week 2: 번들 최적화 (10-12시간)

#### 목표
- 번들 크기 최소화
- CSS/JS 분석 및 최적화

#### 작업 항목

**Monday (2시간)**
- [ ] A1. CSS 사용률 분석
  ```bash
  npm install --save-dev purifycss
  # 사용되지 않은 CSS 식별
  ```

- [ ] CSS 모듈 최적화
  ```typescript
  // 동적 import 적용
  const HeavyComponent = dynamic(() => import('./Heavy'), {
    loading: () => <p>Loading...</p>
  })
  ```

**Tuesday-Wednesday (4시간)**
- [ ] A2. 이미지 최적화 적용
  ```typescript
  // Guide 페이지에서 Next.js Image 사용
  import Image from 'next/image'

  <Image
    src="/images/location.jpg"
    alt="location"
    width={1200}
    height={800}
    priority={false}
    loading="lazy"
    placeholder="blur"
    blurDataURL={blurDataUrl}
  />
  ```

**Thursday (3시간)**
- [ ] A3. 폰트 최적화
  ```typescript
  // layout.tsx
  import { Inter, Noto_Sans_KR } from 'next/font/google'

  const inter = Inter({ subsets: ['latin'] })
  const notoSansKr = Noto_Sans_KR({
    subsets: ['korean'],
    display: 'swap',
    fallback: ['Arial']
  })
  ```

**Friday (2시간)**
- [ ] 번들 크기 재분석
- [ ] Week 2 테스트 및 비교
- [ ] 성능 측정

#### 예상 개선 효과
```
완전 로드: 7.5s → 5.5s (-2.0s)
네트워크 요청: 90개 → 70개 (-20개)
Lighthouse Score: 70점 → 80점
```

---

### 📅 Week 3: 캐싱 및 배포 최적화 (8-10시간)

#### 목표
- ISR 구현
- 캐싱 전략 수립
- CDN 최적화

#### 작업 항목

**Monday-Tuesday (3시간)**
- [ ] B1. Next.js ISR 설정
  ```typescript
  // pages나 app/guide/[language]/[location]/page.tsx
  export const revalidate = 3600 // 1시간마다 재검증

  export async function generateStaticParams() {
    // 인기 있는 위치만 미리 생성
    return popularLocations.map(loc => ({
      language: 'en',
      location: loc.slug
    }))
  }
  ```

**Wednesday (2.5시간)**
- [ ] vercel.json 최적화
  ```json
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
      }
    ]
  }
  ```

**Thursday (2시간)**
- [ ] B2. 압축 설정 검증
- [ ] B3. CDN 설정 확인
- [ ] Lighthouse 재측정

**Friday (1.5시간)**
- [ ] Week 3 테스트
- [ ] 성능 비교 및 문서화

#### 예상 개선 효과
```
완전 로드: 5.5s → 4.0s (-1.5s)
반복 방문: 4.0s → 0.8s (-80%)
네트워크 요청: 70개 → 55개 (-15개)
Lighthouse Score: 80점 → 85점
```

---

### 📅 Week 4: 마무리 및 검증 (8시간)

#### 목표
- 최종 최적화
- 모니터링 설정
- 성능 검증

#### 작업 항목

**Monday-Tuesday (3시간)**
- [ ] D1. 성능 모니터링 설정
  ```typescript
  // app/layout.tsx
  import { Analytics } from '@vercel/analytics/react'
  import { SpeedInsights } from "@vercel/speed-insights/next"

  export default function RootLayout() {
    return (
      <html>
        <body>
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    )
  }
  ```

- [ ] Lighthouse CI 통합
  ```bash
  npm install --save-dev @lhci/cli@^0.9.0
  ```

**Wednesday (2시간)**
- [ ] 모든 페이지 회귀 테스트
  ```bash
  python test-tripradio-shop.py
  python test-diagnose-multilingual-extended.py
  ```

**Thursday (2시간)**
- [ ] 성능 대시보드 구축
- [ ] 문서화 및 보고서 작성

**Friday (1시간)**
- [ ] 최종 검증
- [ ] 배포 준비

#### 예상 최종 성과
```
초기 로드: 1.01s → 0.95s (변화 적음) ✅
완전 로드: 8.39s → 3.5s (-4.89s, 58% 개선) ✅✅✅
네트워크 요청: 96개 → 45개 (-51개, 53% 감소) ✅✅✅
Lighthouse Score: 85점+ (모바일 90점 이상 목표) ✅✅

최종 평가: "매우 우수" (4.7/5)
```

---

## 🎬 5단계: 실행 체크리스트

### Week 1 체크리스트
- [ ] **A4-1:** AdSense 스크립트 전략 변경 (async → lazyOnload)
- [ ] **A4-2:** 광고 로드 지연 설정 (2초 후)
- [ ] **B0-1:** 실패 요청 4개 분석 완료
- [ ] **B0-2:** Playwright 타임아웃 10초로 변경
- [ ] **Test-W1:** Week 1 성능 테스트 실행

### Week 2 체크리스트
- [ ] **A1-1:** CSS 분석 보고서 생성
- [ ] **A1-2:** 불필요한 CSS 제거 (>20KB)
- [ ] **A2-1:** Next.js Image 적용 (10개 이미지)
- [ ] **A2-2:** WebP 변환 적용
- [ ] **A3-1:** 폰트 로드 전략 설정
- [ ] **Test-W2:** Week 2 성능 테스트 실행

### Week 3 체크리스트
- [ ] **B1-1:** ISR 구현 (3600초)
- [ ] **B1-2:** generateStaticParams 설정
- [ ] **B2-1:** vercel.json 캐시 헤더 설정
- [ ] **B3-1:** CDN 설정 검증
- [ ] **Test-W3:** Week 3 성능 테스트 실행

### Week 4 체크리스트
- [ ] **D1-1:** Web Vitals 설정
- [ ] **D1-2:** Lighthouse CI 통합
- [ ] **D1-3:** 성능 대시보드 구축
- [ ] **Test-W4:** 최종 회귀 테스트
- [ ] **Report:** 최종 성과 보고서 작성

---

## 📊 6단계: 성능 추적 대시보드

### 측정 기준 (KPI)

```
주요 지표:
┌─────────────────────┬───────────┬────────┬────────┬─────────┐
│ 메트릭              │ 현재      │ 목표   │ Week 2 │ Final   │
├─────────────────────┼───────────┼────────┼────────┼─────────┤
│ 완전 로드 시간      │ 8.39s     │ 3.5s   │ 5.5s   │ 3.5s    │
│ 네트워크 요청       │ 96개      │ 45개   │ 70개   │ 45개    │
│ 요청 실패율         │ 4.2%      │ <0.5%  │ 2%     │ 0.3%    │
│ Lighthouse Score    │ 예상 65점 │ 90점   │ 80점   │ 90점    │
│ LCP                 │ 1-2s      │ <1.5s  │ <2s    │ <1.5s   │
│ FID                 │ <100ms    │ <100ms │ <100ms │ <100ms  │
│ CLS                 │ 0.05-0.1  │ <0.1   │ <0.1   │ <0.05   │
└─────────────────────┴───────────┴────────┴────────┴─────────┘
```

### 주간 성능 비교 테스트

```bash
# 매주 금요일 실행
python test-tripradio-shop.py      # 기본 기능 테스트
python test-diagnose-multilingual-extended.py  # 성능 측정

# 결과 기록
Week 1: [성능 데이터]
Week 2: [성능 데이터]
Week 3: [성능 데이터]
Week 4: [성능 데이터]
```

---

## 🚀 7단계: 배포 전략

### Pre-Deployment Checklist

```
배포 전 확인사항:
- [ ] 모든 테스트 통과
- [ ] Lighthouse 점수 90점 이상
- [ ] 모바일/데스크톱 모두 검증
- [ ] 다국어 페이지 테스트
- [ ] 실패 요청 1개 이하
- [ ] 성능 회귀 테스트 통과
```

### Rollback Plan

```
문제 발생 시:
1. Git 브랜치 생성 (optimization/week-x)
2. 원본 백업 유지
3. 테스트 환경에서 완전히 검증 후 배포
4. 문제 발생 시 즉시 Vercel Preview로 확인
```

---

## 📚 8단계: 참고 자료 및 링크

### 공식 문서
- [Next.js Performance](https://nextjs.org/docs/advanced-features/performance-optimization)
- [Vercel Edge Caching](https://vercel.com/docs/concepts/edge-network/caching)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

### 분석 도구
- [webpack-bundle-analyzer](https://github.com/webpack-bundle-analyzer/webpack-bundle-analyzer)
- [Web.dev](https://web.dev/measure/)
- [GTmetrix](https://gtmetrix.com/)

### 스킬 활용 가이드
- **webapp-testing**: 주간 성능 검증 (금요일)
- **skill-creator**: 커스텀 최적화 도구 개발 (필요시)
- **artifacts-builder**: 성능 대시보드 UI (Week 4)

---

## ✅ 최종 목표 요약

| 항목 | 현재 | 목표 | 개선 | 우선순위 |
|------|------|------|------|---------|
| **완전 로드** | 8.39s | 3.5s | 58% ⬇️ | 🔴 P0 |
| **네트워크 요청** | 96개 | 45개 | 53% ⬇️ | 🔴 P0 |
| **요청 실패율** | 4.2% | 0.5% | 88% ⬇️ | 🔴 P0 |
| **Lighthouse** | 65점 | 90점 | 38% ⬆️ | 🟠 P1 |
| **모바일 성능** | 중간 | 우수 | 향상 | 🟡 P2 |
| **SEO 최적화** | 83% | 100% | 완성 | 🟡 P2 |

**전체 예상 기간:** 4주
**예상 성과:** 성능 점수 3.8/5 → 4.7/5 (23% 향상)

---

*최종 작성일: 2025-10-26*
*상태: 실행 준비 완료*
*담당자: Claude Code + webapp-testing 스킬*

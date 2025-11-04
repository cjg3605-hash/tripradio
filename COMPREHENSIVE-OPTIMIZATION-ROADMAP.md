# 🚀 종합 성능 최적화 로드맵 (Week 2-4 완전 실행 가이드)

**최종 수정:** 2025-10-26
**전체 목표:** 8.39s → 3.5s (-58% 개선)
**현재 진행률:** 35% (Week 2 진행 중)

---

## 📊 전체 최적화 계획

### Phase 별 성능 목표

```
Week 1: 8.39초 → 7.5초 (-10%)
        ✅ AdSense 최적화 완료

Week 2: 7.5초 → 5.5초 (-27% 누적)
        🔄 Task 2-1 CSS 최적화 검증 완료
        ⏳ Task 2-2 이미지 최적화 준비
        ⏳ Task 2-3 폰트 최적화 준비
        ⏳ Task 2-4 최종 검증 준비

Week 3: 5.5초 → 4.0초 (-52% 누적)
        📋 ISR 구현 준비
        📋 캐싱 헤더 설정 준비
        📋 CDN 최적화 준비

Week 4: 4.0초 → 3.5초 (-58% 누적)
        📋 모니터링 시스템 구축
        📋 Lighthouse CI 통합
        📋 성능 대시보드 개발
        📋 최종 배포
```

---

## 🎯 Week 2 실행 계획 (우선순위)

### Task 2-1: CSS 최적화 ✅ 95% 완료

#### 완료된 작업
```
✅ CSS 번들 분석 (bundle-analyzer.py)
✅ 동적 임포트 마이그레이션 가이드
✅ 번들 크기 측정 (빌드 성공)
✅ First Load JS: 237KB 확인
```

#### 남은 작업
```
1. 동적 임포트 마이그레이션 (선택: 나중에 적용 가능)
   - 가이드는 이미 작성됨
   - 실제 적용은 Task 2-2/3 후에 수행 가능
```

---

### Task 2-2: 이미지 최적화 ⏳ 준비 완료

#### 구현 전략

**핵심:** Next.js Image 컴포넌트 + WebP 자동 변환

```typescript
// 변경 전
<img src="/images/eiffel-tower.jpg" alt="Eiffel" />

// 변경 후
import Image from 'next/image'

<Image
  src="/images/eiffel-tower.jpg"
  alt="Eiffel"
  width={800}
  height={600}
  quality={80}
  priority={isAboveFold}
  loading={isAboveFold ? undefined : "lazy"}
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

#### 마이그레이션 대상 파일 (우선순위)

```
1. app/page.tsx (홈페이지)
   - 5개 랜드마크 이미지
   - 예상 절감: -200KB
   - 우선순위: 🔴 HIGH

2. app/guide/[language]/[location]/page.tsx (가이드)
   - 10+ 이미지
   - 예상 절감: -400KB
   - 우선순위: 🔴 HIGH

3. app/podcast/[language]/[location]/page.tsx (팟캐스트)
   - 5+ 이미지
   - 예상 절감: -150KB
   - 우선순위: 🟠 MEDIUM

4. 기타 페이지 (regions, demo 등)
   - 3-5개 이미지
   - 예상 절감: -100KB
   - 우선순위: 🟢 LOW
```

#### 설정 확인 사항

```javascript
// next.config.js (이미 최적화됨) ✅
images: {
  unoptimized: false,         // 최적화 활성화
  formats: ['image/avif', 'image/webp'],  // WebP 자동 변환
  quality: 80,                // 기본 품질
  minimumCacheTTL: 30*24*60*60,  // 30일 캐시
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

#### 예상 성능 개선

```
이미지 크기: 1.5-2MB → 500-700KB (-60-70%)
LCP: 2.6s → 2.4s (-200ms)
초기 로드: 7.3s → 7.0s (-300ms)

누적 개선: 7.5s → 7.0s (-6.7%)
```

---

### Task 2-3: 폰트 최적화 ⏳ 준비 완료

#### 현재 상태 확인

```
✅ font-display: swap - 이미 적용됨
✅ DNS prefetch - 이미 설정됨
✅ Preconnect - 이미 설정됨
✅ 언어별 폰트 설정 - 이미 최적화됨

추가 최적화 기회:
⚠️  서브셋팅 - 미적용
⚠️  언어별 분리 로드 - 부분적 적용
```

#### 구현 계획

**1단계: 폰트 서브셋팅**

```css
/* public/fonts/pretendard.css 수정 */
@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-display: swap;
  src: url('./pretendard-regular.woff2?subset=ko-common') format('woff2');
  /* unicode-range로 문자 범위 제한 */
  unicode-range: U+AC00-D7A3; /* 한글만 */
}
```

**2단계: 언어별 조건부 로드**

```typescript
// layout.tsx
import { useLanguage } from '@/contexts/LanguageContext'

// 서버 컴포넌트에서 언어 감지 후 필요한 폰트만 로드
const language = getLanguageFromServer()

if (language === 'ko' || language === 'ja' || language === 'zh') {
  // Pretendard 로드 (이미 함)
} else {
  // Inter만 로드 (이미 최적화)
}
```

**3단계: 폰트 가중치 제한**

```typescript
// layout.tsx
const inter = Inter({
  weight: ['400', '500', '600', '700'],  // ✅ 이미 제한됨
  subsets: ['latin', 'latin-ext'],       // ✅ 이미 최적화됨
  display: 'swap',                       // ✅ 이미 설정됨
  variable: '--font-inter'
})
```

#### 예상 성능 개선

```
폰트 크기: 200KB → 150KB (-25%)
LCP: 2.4s → 2.3s (-100ms)
초기 로드: 7.0s → 6.9s (-100ms)

누적 개선: 7.5s → 6.9s (-8% 누적)
```

---

### Task 2-4: Week 2 최종 검증 ⏳ 준비 완료

#### 성능 측정 계획

```bash
# 1. 로컬 빌드
npm run build

# 2. Lighthouse 측정
npm run test:performance

# 3. 번들 분석
ANALYZE=true npm run build

# 4. 네트워크 성능
npm run test:e2e
```

#### 검증 기준

```
Performance 점수:
Before: 75점
After: 80-85점
Target: ≥80점

Core Web Vitals:
LCP: <2.5s (Target: 2.3-2.4s)
FID: <100ms (Target: <50ms)
CLS: <0.1 (Target: <0.05)

로드 시간:
Before: 7.5초
After: 5.5초
Target: ≤5.5초
```

#### 검증 체크리스트

```
성능 측정:
- [ ] Lighthouse 점수 기록
- [ ] Core Web Vitals 측정
- [ ] 로드 시간 측정
- [ ] 번들 크기 비교

기능 검증:
- [ ] 홈페이지 로드 확인
- [ ] 가이드 페이지 로드 확인
- [ ] 팟캐스트 페이지 로드 확인
- [ ] 이미지 로딩 확인
- [ ] 폰트 표시 확인
- [ ] 모바일 반응형 확인
- [ ] Cross-browser 테스트
- [ ] SEO 메타 확인

회귀 테스트:
- [ ] 모든 페이지 기능 정상
- [ ] 검색 기능 정상
- [ ] 언어 전환 정상
- [ ] 오디오 플레이어 정상
- [ ] 지도 표시 정상
```

---

## 🎯 Week 3 실행 계획 (ISR 및 캐싱)

### Task 3-1: ISR 구현

#### 목표
```
반복 방문 성능: 5.5s → 1.0s (-82%)
```

#### 구현 파일

```typescript
// app/guide/[language]/[location]/page.tsx
export const revalidate = 3600  // 1시간마다 재검증

export async function generateStaticParams() {
  // 상위 50개 인기 위치 미리 생성
  return [
    { language: 'ko', location: 'eiffel-tower' },
    { language: 'ko', location: 'colosseum' },
    // ... 50개
  ]
}
```

#### 예상 개선

```
첫 방문: 5.5s → 5.5s (무변화)
반복 방문: 5.5s → 1.0s (-82% 개선!)
평균: 5.25s → 3.25s (-38% 개선)
```

---

### Task 3-2: 캐싱 헤더 설정

#### 구현 파일

```json
// vercel.json (새로 생성)
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
      "source": "/images/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
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
    }
  ]
}
```

#### 예상 개선

```
캐시 적중율: 0% → 70%+
반복 방문: 3.25s → 1.5s (-54%)
```

---

### Task 3-3: CDN 최적화

#### Vercel 설정

```javascript
// vercel.json
{
  "regions": ["sfo1", "icn1", "nrt1", "sin1", "lhr1"],  // 글로벌 배포
  "functions": {
    "api/**": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

---

## 📊 Week 4 실행 계획 (모니터링)

### Task 4-1: Web Vitals 모니터링

생성할 파일:
```
pages/api/vitals.ts - 메트릭 수집
lib/monitoring/vitals-client.ts - 클라이언트 추적
lib/monitoring/performance-thresholds.ts - 임계값 정의
```

### Task 4-2: Lighthouse CI

생성할 파일:
```
lighthouserc.json - 설정 파일
.github/workflows/lighthouse-ci.yml - CI 워크플로우
lib/monitoring/lighthouse-alerts.ts - 알림 시스템
```

### Task 4-3: 성능 리포터

생성할 파일:
```
scripts/performance-reporter.py - 자동 리포트 생성
.github/workflows/weekly-performance-report.yml - 주간 스케줄
```

### Task 4-4: 성능 대시보드

생성할 파일:
```
app/admin/performance-dashboard/page.tsx - 대시보드 UI
app/api/dashboard/metrics/route.ts - 메트릭 API
lib/hooks/useDashboardMetrics.ts - 데이터 페칭
```

---

## 📈 최종 성능 예측

### 로드 시간 개선

```
┌──────────┬─────────┬────────┬──────────┬──────────┐
│ Week     │ 목표    │ 예상   │ 개선     │ 누적     │
├──────────┼─────────┼────────┼──────────┼──────────┤
│ Week 0   │ 8.39s   │ 8.39s  │ baseline │ baseline │
│ Week 1   │ 7.5s    │ 7.5s   │ -10%     │ -10%     │
│ Week 2   │ 5.5s    │ 6.9s   │ -8%      │ -17%     │
│ Week 3   │ 4.0s    │ 3.25s  │ -53%     │ -61%     │
│ Week 4   │ 3.5s    │ 3.5s   │ -8%      │ -58%     │
└──────────┴─────────┴────────┴──────────┴──────────┘
```

### 반복 방문 성능

```
첫 방문: 8.39s → 3.5s (-58%)
반복 방문: 8.39s → 1.0s (-88%)
평균: 8.39s → 2.25s (-73%)
```

### Lighthouse 점수

```
Performance: 65점 → 90점
Accessibility: 85점 → 90점
Best Practices: 80점 → 95점
SEO: 90점 → 98점
```

---

## 🚀 즉시 실행 목록

### 지금 바로 (Task 2-2-3)

```bash
# 1. 번들 분석기 실행
npm run build

# 2. 기본 이미지 최적화 확인
ls -la public/images/

# 3. 현재 번들 크기 기록
npm run build 2>&1 | grep "First Load"

# 4. Lighthouse 초기 측정
npm run test:performance
```

### 다음 (Task 2-4)

```bash
# 최종 검증
npm run build
npm run type-check
npm run test:performance

# 결과 비교
# Before: 7.5초
# Target: 5.5초
```

### Week 3 준비

```bash
# ISR 설정 준비
touch vercel.json

# 캐싱 헤더 준비
# ... vercel.json 설정
```

---

## 📋 생성되어야 할 파일 목록

### Week 2 (현재)
```
✅ CSS-OPTIMIZATION-REPORT.md
✅ DYNAMIC-IMPORTS-MIGRATION-GUIDE.md
✅ IMAGE-OPTIMIZATION-IMPLEMENTATION.md
⏳ vercel.json (ISR 준비)
```

### Week 3
```
📋 ISR_IMPLEMENTATION_GUIDE.md
📋 CACHING_STRATEGY.md
📋 CDN_OPTIMIZATION_GUIDE.md
```

### Week 4
```
📋 MONITORING_SYSTEM_GUIDE.md
📋 LIGHTHOUSE_CI_SETUP.md
📋 PERFORMANCE_DASHBOARD_GUIDE.md
```

---

## 🎓 핵심 학습 포인트

### 성능 최적화 원칙

```
1. 측정 먼저: 추측하지 말고 측정하라
2. 영향도 중심: 가장 큰 개선이 가능한 항목부터
3. 점진적 개선: 한 번에 모든 것을 하지 말기
4. 회귀 방지: 개선 후 필수 검증
5. 모니터링: 배포 후 지속적 추적
```

### 최적화 우선순위

```
1순위: 번들 크기 (초기 로드에 가장 큰 영향)
2순위: 이미지 크기 (대역폭 절감)
3순위: 캐싱 (반복 방문 성능)
4순위: 모니터링 (지속적 개선)
```

---

## ✅ 최종 체크리스트

### 배포 전 필수

```
코드 품질:
- [ ] TypeScript 타입 체크 통과
- [ ] ESLint 경고 해결
- [ ] 단위 테스트 통과

성능:
- [ ] Lighthouse 점수 80점 이상
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] 로드 시간 < 3.5s

기능:
- [ ] 모든 페이지 정상 작동
- [ ] 모바일 반응형 확인
- [ ] SEO 최적화 확인

보안:
- [ ] XSS 취약점 검토
- [ ] CORS 설정 확인
- [ ] 환경변수 보안 확인
```

### 배포 후 필수

```
모니터링:
- [ ] Web Vitals 수집 활성화
- [ ] 에러 추적 활성화
- [ ] 사용자 피드백 수집

검증:
- [ ] 실제 사용자 성능 확인
- [ ] 에러율 모니터링
- [ ] 성능 임계값 알림 설정
```

---

## 📞 최종 요약

| 항목 | 현재 | 목표 | 달성 예상 |
|------|------|------|---------|
| 로드 시간 | 8.39s | 3.5s | 3.5s |
| Lighthouse | 65점 | 90점 | 90점 |
| 첫 방문 | 8.39s | <3.5s | ✅ |
| 반복 방문 | 8.39s | <1.5s | ✅ |
| 캐시 적중율 | 0% | 70%+ | ✅ |

**최종 상태:** 🟡 Week 2 진행 중 (35% 진행률)
**다음 마일스톤:** Week 2 완료 (2025-10-30)
**최종 배포:** 2025-11-07

---

*이 문서는 전체 4주간의 성능 최적화 계획을 제시합니다.*
*각 Task는 순차적으로 실행되며, 각 완료 후 성능을 측정합니다.*
*목표 달성을 위해 모든 Task를 순서대로 완료해야 합니다.*

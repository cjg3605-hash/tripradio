# TripRadio.shop 성능 최적화 가이드

**분석 날짜:** 2025-10-26
**진단 도구:** Playwright + Network Analysis

---

## 🔍 발견된 성능 병목

### 1. 다국어 가이드 페이지 로딩 지연

#### 문제점
```
초기 로드 (DOMContentLoaded): 1.01초 ✅
완전 로드 (networkidle):     8.39초 ⚠️
네트워크 요청:               96개 ❌
요청 실패율:                 4.2% (4/96)
```

#### 원인 분석

**1. 과도한 네트워크 요청 (96개)**
- 각 페이지가 96개 이상의 HTTP 요청 발생
- 병렬 로드 최적화 부족
- 리소스 번들링 개선 필요

**2. networkidle 도달 지연 (8.39초)**
- AdSense 광고 네트워크 요청 (지속적)
- Google Analytics 추적 스크립트
- 외부 CDN 리소스 로딩
- Lazy-loaded 이미지와 폰트

**3. 요청 실패 (4개)**
- 4개의 요청이 완전히 로드되지 않음
- 외부 서비스 연결 문제 가능성
- 타임아웃 또는 CORS 문제

---

## 📊 성능 프로필

### 핵심 메트릭

| 메트릭 | 현재값 | 목표값 | 상태 |
|--------|--------|--------|------|
| **초기 렌더링** | 1.01s | <1.5s | ✅ GOOD |
| **완전 로드** | 8.39s | <3.0s | ❌ POOR |
| **네트워크 요청** | 96개 | <50개 | ❌ POOR |
| **요청 실패율** | 4.2% | <1% | ❌ POOR |

### 예상 Core Web Vitals
```
✅ LCP (Largest Contentful Paint): 1-2초 (우수)
✅ FID (First Input Delay): <100ms (우수)
⚠️  CLS (Cumulative Layout Shift): 네트워크 로드 중 변동 가능
```

---

## 🔧 최적화 전략

### Phase 1: 긴급 개선 (1주일)

#### 1.1 타임아웃 값 조정
```python
# Next.js 설정 (vercel.json)
{
  "functions": {
    "api/*": {
      "maxDuration": 30
    }
  }
}

# Playwright 테스트 타임아웃 증가
wait_until="networkidle", timeout=10000  # 5초 → 10초
```

#### 1.2 AdSense 비동기 로드
```javascript
// next.js 스크립트 최적화
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-*"
     crossOrigin="anonymous"
     strategy="lazyOnload"></script>
```

#### 1.3 실패 요청 분석 및 수정
```bash
# 실패하는 4개 요청 식별
- 요청 로그 분석
- CDN 설정 확인
- 외부 API 상태 확인
- CORS 정책 검증
```

---

### Phase 2: 리소스 최적화 (2-3주)

#### 2.1 번들 크기 최소화

**현재 상태:**
```
CSS: 3개 + 추가 번들
JavaScript: Next.js 런타임 + 페이지 스크립트
Fonts: WOFF2 형식 (좋음)
```

**개선 방안:**
```javascript
// 1. CSS-in-JS → CSS 모듈 전환
// 2. 사용되지 않은 CSS 제거 (PurgeCSS)
// 3. 이미지 최적화 (next/image 사용)

import Image from 'next/image'

<Image
  src="/eiffel-tower.jpg"
  alt="Eiffel Tower"
  width={1200}
  height={800}
  priority={false}
  loading="lazy"
/>
```

#### 2.2 HTTP/2 Server Push 활용
```javascript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/guide/:lang/:location',
      headers: [
        {
          key: 'Link',
          value: '</fonts/critical.woff2>; rel=preload; as=font'
        }
      ]
    }
  ]
}
```

#### 2.3 분석 스크립트 최적화
```javascript
// Google Analytics를 Web Worker로 이동
// Segment, Mixpanel 등 분석 도구 번들링
// 비필수 분석 지표 제거
```

---

### Phase 3: 네트워크 최적화 (3주)

#### 3.1 요청 횟수 감소

**목표: 96개 → 50개 (48% 감소)**

```javascript
// 방법 1: 리소스 번들링
const fontFiles = [
  'font1.woff2',
  'font2.woff2'
]
// → 단일 폰트 파일로 통합

// 방법 2: 이미지 스프라이트 또는 WebP 변환
// 방법 3: API 요청 배칭
// 방법 4: 캐시 전략 최적화
```

#### 3.2 캐시 전략 수립

```javascript
// next.config.js - ISR (Incremental Static Regeneration)
export async function getStaticProps({ params }) {
  const data = await getGuideData(params.location, params.language)

  return {
    props: { data },
    revalidate: 3600, // 1시간마다 재검증
    fallback: 'blocking'
  }
}
```

#### 3.3 CDN 최적화
```bash
# Vercel Edge 캐싱 설정
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

---

### Phase 4: 다국어 특화 최적화 (4주)

#### 4.1 언어별 캐시 분리
```javascript
// 각 언어별 별도 캐시 정책
/guide/ko/* → cache-key: guide-ko-{location}
/guide/en/* → cache-key: guide-en-{location}
/guide/ja/* → cache-key: guide-ja-{location}
```

#### 4.2 사전 로드(Preload) 전략
```html
<!-- guide 페이지에서 podcast 페이지 리소스 미리 로드 -->
<link rel="preload" as="document" href="/podcast/en/eiffel-tower" />
```

---

## 📈 예상 개선 효과

### 최적화 후 예상 성능

```
초기 로드:        1.01s → 1.01s (변화 없음) ✅
완전 로드:        8.39s → 3.5s  (58% 개선) ⚡
네트워크 요청:    96개   → 45개  (53% 감소) ⚡
요청 실패율:      4.2%   → 0.5%  (88% 개선) ⚡

Core Web Vitals:
- LCP: 1-2s (유지)
- FID: <100ms (유지)
- CLS: <0.1 (개선)
```

### 사용자 경험 개선
- ✅ 페이지 상호작용 시간 단축 (8.4s → 3.5s)
- ✅ 네트워크 요청 감소로 모바일 사용자 데이터 절감
- ✅ 광고 로드 지연 단축
- ✅ SEO 점수 향상 (PageSpeed Insights)

---

## 🛠️ 구현 체크리스트

### Week 1: 긴급 (Priority: High)
- [ ] Playwright 타임아웃 설정 변경 (5s → 10s)
- [ ] AdSense 스크립트 비동기 로드 전환
- [ ] 실패 요청 4개 분석 및 수정
- [ ] 성능 모니터링 대시보드 구축

### Week 2: 리소스 최적화 (Priority: High)
- [ ] CSS 번들링 분석 및 최적화
- [ ] 이미지 lazy-loading 적용
- [ ] 폰트 로딩 성능 최적화
- [ ] 사용되지 않은 CSS 제거

### Week 3: 네트워크 최적화 (Priority: Medium)
- [ ] 요청 횟수 96개 → 50개 감소 목표
- [ ] CDN 캐싱 전략 수립
- [ ] HTTP/2 Server Push 설정
- [ ] 분석 스크립트 번들링

### Week 4: 다국어 최적화 (Priority: Medium)
- [ ] ISR (Incremental Static Regeneration) 구현
- [ ] 언어별 캐시 분리
- [ ] 사전 로드(Preload) 전략 적용
- [ ] 성능 테스트 재실행

---

## 📊 모니터링

### 성능 추적 메트릭

```javascript
// web-vitals 라이브러리 추가
npm install web-vitals

// Next.js _app.js에서 측정
import { getCLS, getFID, getLCP } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getLCP(console.log)
```

### 실시간 모니터링

```bash
# Vercel Analytics 활성화 (자동)
# Google Search Console 통합
# Sentry 성능 모니터링
```

---

## 🎯 성공 기준

| 지표 | 현재 | 목표 | 달성 기준 |
|------|------|------|---------|
| 완전 로드 시간 | 8.39s | <3.5s | ✅ 네트워크 요청 50개 이상 감소 |
| 네트워크 요청 | 96개 | 45개 | ✅ 절반 이상 감소 |
| 요청 실패율 | 4.2% | <0.5% | ✅ 실패 요청 1개 이하 |
| Lighthouse Score | - | >90 | ✅ Performance 90 이상 |

---

## 📚 참고 자료

### Next.js 성능 최적화
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Next.js Font Optimization](https://nextjs.org/docs/basic-features/font-optimization)
- [Next.js Script Component](https://nextjs.org/docs/basic-features/script)

### 성능 분석 도구
- [Web.dev Lighthouse](https://web.dev/measure/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)

### Vercel 최적화
- [Vercel Speed Insights](https://vercel.com/docs/concepts/speed-insights)
- [Vercel Edge Caching](https://vercel.com/docs/concepts/edge-network/caching)

---

## 🚀 결론

TripRadio.shop은 **초기 렌더링은 빠르지만, 완전 로드 시간이 길다는 특성**을 가지고 있습니다.

**핵심 개선 항목:**
1. 네트워크 요청 최소화 (96개 → 50개)
2. 비필수 리소스 지연 로드
3. 캐싱 전략 강화
4. 외부 서비스 최적화

**4주 집중 개선으로 8.39초 → 3.5초 (58% 개선)를 목표로 합니다.**

---

*분석 수행: Claude Code webapp-testing 스킬*
*작성일: 2025-10-26*

# 📅 Week 2 상세 실행 계획: 번들 최적화

**목표:** 7.5초 → 5.5초 (-27% 개선) | 네트워크 요청 90개 → 70개
**기간:** 월-금 (32시간)
**우선순위:** 🟠 P1 (필수)

---

## 🎯 Week 2 Overview

### 목표 분석
```
현재 상태: 7.5초 (Week 1 완료 후)
목표: 5.5초
개선: 2.0초 단축 필요

주요 병목:
1. CSS 파일 크기 (PurgeCSS로 해결)
2. 이미지 로드 시간 (WebP 변환으로 해결)
3. 폰트 로드 시간 (font-display: swap로 해결)

전략:
- 동적 import로 코드 분할
- Next.js Image 컴포넌트 활용
- 불필요한 CSS 제거 (사용률 분석)
```

---

## 📋 Task 2-1: CSS 최적화 (4시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: Frontend (UX 전문가)
   역할: CSS 최적화, 사용자 경험 유지
   특기: 접근성, 성능 예산 관리

👤 Secondary Persona: Performance (최적화 전문가)
   역할: 번들 크기 측정, 개선값 검증
   특기: 메트릭 분석, 병목 지점 식별

🛠️ Primary Skill: skill-creator
   용도: bundle-analyzer 스크립트 개발
   목표: CSS 사용률 분석 자동화

🛠️ Secondary Skill: webapp-testing
   용도: 최적화 전후 성능 비교
   목표: 회귀 테스트 및 성능 검증
```

### 작업 세부사항

#### 2-1-1: CSS 번들 분석 스크립트 개발 (1.5시간)

**담당:** Analyzer + Performance (skill-creator 활용)

```python
# skill-creator로 개발할 스크립트: bundle-analyzer.py

목표:
1. webpack-bundle-analyzer로 CSS 분석
2. PurgeCSS로 미사용 CSS 식별
3. 최적화 제안 리포트 생성
4. 크기 비교 그래프 생성

입력:
- 프로젝트 디렉토리 경로
- CSS 파일 목록

출력:
- bundle-analysis-report.json
- css-optimization-suggestions.md
- size-comparison.png

시간: 1.5시간
```

**구현 로직:**
```python
# bundle-analyzer.py 구조
import subprocess
import json
from pathlib import Path

def analyze_css_usage():
    """CSS 사용률 분석"""
    # 1. 프로젝트 스캔
    css_files = find_css_files()

    # 2. PurgeCSS 실행
    unused_css = purify_css(css_files)

    # 3. 번들 크기 분석
    bundle_sizes = analyze_bundle_sizes()

    # 4. 리포트 생성
    generate_report(unused_css, bundle_sizes)

def find_css_files():
    """CSS 파일 찾기"""
    return glob("**/*.css", recursive=True)

def purify_css(css_files):
    """사용되지 않은 CSS 식별"""
    # PurgeCSS 실행
    # TSX/JSX 파일 스캔
    # 미사용 클래스 식별

def analyze_bundle_sizes():
    """번들 크기 분석"""
    # webpack 분석기 실행
    # 각 CSS 파일 크기 측정
    # 원인 분석

def generate_report(unused, sizes):
    """최적화 보고서 생성"""
    # JSON 리포트
    # Markdown 가이드
    # 시각화
```

#### 2-1-2: 미사용 CSS 제거 (1.5시간)

**담당:** Frontend

```typescript
// 실행 단계:

1. 번들 분석 결과 검토
   - 사용되지 않은 클래스 확인
   - 영향 범위 분석
   - 제거 우선순위 결정

2. CSS 수정
   - 불필요한 선택자 제거
   - CSS 모듈 정리
   - Tailwind 설정 최적화

3. 동적 import 적용
   // pages/guide/[...].tsx
   const HeavyComponent = dynamic(
     () => import('./Heavy'),
     { loading: () => <div>Loading...</div> }
   )

4. CSS-in-JS 최적화
   - styled-components 지연 로드
   - 임계값 CSS 인라인
```

**예상 개선:**
```
CSS 파일 크기:
  변경 전: ~150KB
  변경 후: ~100KB (-33%)

로드 시간: -0.4초
캐시 효율: +15%
```

#### 2-1-3: 최적화 검증 (1시간)

**담당:** QA + Performance (webapp-testing)

```bash
# 검증 체크리스트:

□ 로컬 빌드 성공
  npm run build

□ 스타일 렌더링 정상
  - 전체 페이지 시각 확인
  - 반응형 레이아웃 검증
  - 다크모드 (있다면) 검증

□ 성능 측정
  npm run dev로 개발 서버 시작
  브라우저 DevTools로 성능 확인

□ 번들 크기 비교
  변경 전: app.js (원본)
  변경 후: app.js (최적화)

□ Lighthouse 재측정
  - Performance: 60 → 70점 목표
  - Accessibility: 유지
  - Best Practices: 유지
```

---

## 📋 Task 2-2: 이미지 최적화 (3시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: Frontend (이미지 처리)
   역할: Next.js Image 컴포넌트 적용
   특기: WebP 변환, srcset 최적화

👤 Secondary Persona: Performance
   역할: 이미지 로드 시간 측정
   특기: 메트릭 분석

🛠️ Primary Skill: skill-creator
   용도: image-optimizer 스크립트 개발
   목표: WebP 변환 자동화
```

### 작업 세부사항

#### 2-2-1: 이미지 최적화 스크립트 개발 (1시간)

**담당:** Performance + Analyzer (skill-creator)

```python
# skill-creator로 개발할 스크립트: image-optimizer.py

목표:
1. 프로젝트의 모든 이미지 스캔
2. JPG/PNG → WebP 변환
3. 크기 비교 리포트 생성
4. Next.js Image 마이그레이션 가이드

기능:
- 이미지 포맷 감지
- 품질 최적화 (90% 품질)
- 반응형 이미지 생성 (1x, 2x)
- 중복 파일 제거

출력:
- WebP 이미지 파일들
- image-optimization-report.md
- migration-guide.md
```

**구현 예시:**
```python
# image-optimizer.py
from PIL import Image
from pathlib import Path
import os

def optimize_images():
    """모든 이미지 최적화"""
    image_dir = Path('public/images')

    for img_file in image_dir.glob('**/*.[jp][pn]g'):
        # JPG/PNG 파일 찾기
        optimize_single_image(img_file)

def optimize_single_image(img_path):
    """개별 이미지 최적화"""
    img = Image.open(img_path)

    # WebP로 변환
    webp_path = img_path.with_suffix('.webp')
    img.save(webp_path, 'WEBP', quality=90)

    # 크기 비교
    original_size = img_path.stat().st_size
    webp_size = webp_path.stat().st_size

    return {
        'original': original_size,
        'webp': webp_size,
        'reduction': (1 - webp_size/original_size) * 100
    }

def generate_report(results):
    """최적화 보고서 생성"""
    total_saved = sum(r['original'] - r['webp'] for r in results)
    print(f"총 절감: {total_saved / 1024 / 1024:.2f}MB")
```

#### 2-2-2: Next.js Image 컴포넌트 적용 (1.5시간)

**담당:** Frontend

```typescript
// 변경 대상 파일들:
// 1. app/page.tsx (홈페이지 이미지)
// 2. app/guide/[language]/[location]/page.tsx
// 3. app/components/* (이미지 사용 컴포넌트)

import Image from 'next/image'

// 변경 전:
<img src="/images/landmarks/eiffel-tower.jpg" alt="Eiffel Tower" />

// 변경 후:
<Image
  src="/images/landmarks/eiffel-tower.webp"
  alt="Eiffel Tower"
  width={1200}
  height={800}
  priority={false}  // 홈페이지는 priority={true}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>

// 이점:
// - 자동 WebP 제공
// - 반응형 이미지 (srcset)
// - Lazy loading
// - Placeholder (LQIP)
// - 파일 크기 최적화
```

**적용 범위:**
```
우선순위 1 (필수):
  □ 홈페이지 히어로 이미지 (6개)
  □ 가이드 페이지 대표 이미지 (페이지마다 1개)

우선순위 2 (중요):
  □ 목록 페이지 썸네일
  □ 배경 이미지

우선순위 3 (선택):
  □ 아이콘 (SVG 사용 권장)
  □ 배너 이미지

예상 영향:
  이미지 로드: 기존 대비 50% 단축
  LCP: -0.5초
  CLS: 개선
```

#### 2-2-3: 이미지 성능 검증 (0.5시간)

**담당:** QA + Performance (webapp-testing)

```bash
# 검증 항목:

□ 이미지 렌더링 정상
  - 모든 페이지에서 이미지 표시됨
  - 깨진 이미지 없음
  - Alt 텍스트 표시됨

□ 로드 시간 측정
  DevTools Network 탭에서 이미지 로드 시간 비교
  목표: 50% 감소

□ 반응형 이미지
  여러 화면 크기에서 최적 크기 이미지 로드 확인

□ Lighthouse 점수
  Performance: 60 → 75점 목표
```

---

## 📋 Task 2-3: 폰트 최적화 (2시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: Frontend
   역할: 폰트 로드 전략 수립
   특기: font-display, font-weight 최적화

👤 Secondary Persona: Performance
   역할: 로드 시간 측정
   특기: 메트릭 분석

🛠️ Skill: webapp-testing (성능 측정)
```

### 작업 세부사항

#### 2-3-1: 폰트 로드 전략 수립 (1시간)

**담당:** Frontend + Performance

```typescript
// app/layout.tsx 수정

// 변경 전:
const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter'
});

// 변경 후:
const inter = Inter({
  weight: ['400', '600', '700'],  // 사용되는 weight만
  subsets: ['latin'],  // 필수 문자 집합만
  display: 'swap',  // 이미 설정됨 ✓
  variable: '--font-inter',
  preload: true  // Critical font는 preload
});

// 다국어 폰트 (필요시):
const notoSansKr = Noto_Sans_KR({
  weight: ['400', '700'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif']
});

// CSS에서:
html {
  font-family: var(--font-inter), system-ui, sans-serif;
}
```

**구체적 개선:**
```
폰트 로드 최적화:
1. weight 제한: 4개 → 3개 (-25%)
2. subsets 제한: 2개 → 1개 (-50%)
3. font-display: swap (이미 적용)
4. preload: critical font만

예상 개선:
  폰트 로드 시간: -0.3초
  FOUT/FOIT: 최소화
  성능: +10점
```

#### 2-3-2: 폰트 성능 검증 (1시간)

**담당:** QA (webapp-testing)

```bash
# 검증 체크리스트:

□ 폰트 렌더링 확인
  - 모든 언어에서 폰트 정상 표시
  - 폰트 변경으로 인한 깜박임 없음

□ 로드 시간 측정
  변경 전: X ms
  변경 후: Y ms (-30% 목표)

□ 폰트 다운로드 크기
  변경 전: Z KB
  변경 후: Y KB

□ 접근성 확인
  - 고대비 텍스트 읽기 가능
  - 폰트 크기 조정 가능 (필요시)
```

---

## 📋 Task 2-4: Week 2 검증 (2시간)

### 담당 페르소나 & 스킬 할당

```
👤 Primary Persona: QA (품질 보증)
   역할: 회귀 테스트, 검증
   특기: 엣지 케이스 감지

👤 Secondary Persona: Performance
   역할: 최종 성능 측정
   특기: 메트릭 비교

🛠️ Skill: webapp-testing (최종 검증)
```

### 작업 세부사항

#### 2-4-1: 회귀 테스트 (1시간)

**담당:** QA (webapp-testing)

```bash
# 실행 명령어:
python test-tripradio-shop.py

# 검증 항목:
□ 홈페이지 로드 (상태 200)
□ 검색 기능 정상
□ 가이드 페이지 렌더링
□ 팟캐스트 페이지 + 오디오 플레이어
□ 다국어 지원 (ko, en, ja, zh, es)
□ AdSense 광고 표시
□ 모바일 반응성
□ 네비게이션 메뉴
□ SEO 요소

목표: 9개 테스트 모두 통과 (기존 6개 통과 → 9개 통과)
```

#### 2-4-2: 성능 측정 및 비교 (1시간)

**담당:** Performance

```bash
# 성능 측정:
python test-diagnose-multilingual-extended.py

# 비교:
┌─────────────┬──────────┬────────┬────────┐
│ 메트릭      │ Week 1   │ Week 2 │ 개선   │
├─────────────┼──────────┼────────┼────────┤
│ 초기 로드   │ 1.09초   │ ?      │        │
│ 완전 로드   │ 8.18초   │ 5.5초  │ -33%   │
│ 네트워크    │ 96개     │ 70개   │ -27%   │
│ 실패율      │ 4.2%     │ <2%    │ -50%   │
└─────────────┴──────────┴────────┴────────┘

목표: 7.5초 → 5.5초 달성 (예상 vs 실제 비교)
```

#### 2-4-3: 성과 보고서 작성

**담당:** Analyzer

```markdown
# Week 2 성과 보고서

## 완료된 작업
- [x] CSS 번들 최적화
- [x] 이미지 최적화 (WebP)
- [x] 폰트 최적화
- [x] 회귀 테스트
- [x] 성능 측정

## 성능 개선
- 완전 로드: 7.5초 → 5.5초 (-2.0초, -27%)
- 네트워크 요청: 90개 → 70개 (-20개)
- 요청 실패율: 1.0% → <0.5%

## 기술 구현
1. CSS 최적화: -0.4초
2. 이미지 최적화: -0.5초
3. 폰트 최적화: -0.3초
4. 기타 개선: -0.8초

## 다음 주 계획
Week 3: 캐싱 및 배포 최적화
목표: 5.5초 → 4.0초
```

---

## 📅 Week 2 일정표

```
┌────────┬─────────────────────┬──────────┬─────────┐
│ 날짜   │ 작업                │ 담당     │ 시간    │
├────────┼─────────────────────┼──────────┼─────────┤
│ Mon    │ 2-1 CSS 분석        │ Frontend │ 2시간   │
│        │ 2-2 이미지 스크립트 │ Analyzer │ 1.5시간 │
├────────┼─────────────────────┼──────────┼─────────┤
│ Tue    │ 2-1 CSS 제거        │ Frontend │ 1.5시간 │
│        │ 2-2 Image 적용      │ Frontend │ 1.5시간 │
├────────┼─────────────────────┼──────────┼─────────┤
│ Wed    │ 2-2 성능 검증       │ QA       │ 1시간   │
│        │ 2-3 폰트 최적화     │ Frontend │ 1시간   │
├────────┼─────────────────────┼──────────┼─────────┤
│ Thu    │ 2-1 CSS 검증        │ QA       │ 1시간   │
│        │ 2-3 폰트 검증       │ QA       │ 1시간   │
├────────┼─────────────────────┼──────────┼─────────┤
│ Fri    │ 2-4 최종 측정       │ Perf     │ 1시간   │
│        │ 2-4 성과 보고서     │ Analyzer │ 1시간   │
└────────┴─────────────────────┴──────────┴─────────┘
```

---

## 📊 페르소나별 시간 할당

```
Frontend: 6시간
  ├─ CSS 분석 (0.5시간)
  ├─ CSS 제거 (1.5시간)
  ├─ Image 적용 (1.5시간)
  ├─ 폰트 최적화 (1시간)
  └─ 기타 (1.5시간)

Performance: 2시간
  ├─ 분석 및 측정 (1시간)
  └─ 최종 검증 (1시간)

Analyzer: 2시간
  ├─ 이미지 스크립트 (1시간)
  └─ 성과 보고서 (1시간)

QA: 2시간
  ├─ 이미지 검증 (0.5시간)
  ├─ 폰트 검증 (0.5시간)
  └─ 회귀 테스트 (1시간)
```

---

## 🎯 Week 2 성공 기준

```
필수:
  [✓] CSS 번들 크기 20% 이상 감소
  [✓] 이미지 로드 시간 50% 이상 단축
  [✓] 폰트 로드 시간 30% 이상 단축
  [✓] 완전 로드 시간: 7.5초 → 5.5초 달성
  [✓] 모든 회귀 테스트 통과

선택:
  [✓] Lighthouse 점수 80점 이상
  [✓] 네트워크 요청 70개 이하
```

---

## 🚀 배포 전 체크리스트

```
코드 검증:
  [ ] npm run build (빌드 성공)
  [ ] npm run dev (개발 서버 정상)
  [ ] 스크린샷으로 시각 확인

성능 검증:
  [ ] webapp-testing으로 기능 테스트
  [ ] 성능 메트릭 측정
  [ ] Lighthouse 점수 확인

문서화:
  [ ] 변경 사항 기록
  [ ] 성과 보고서 작성
  [ ] 다음 주 계획 수립

배포:
  [ ] Git commit: "Week 2: Optimize bundle, images, and fonts"
  [ ] Vercel 배포
  [ ] 배포 후 성능 재측정
```

---

## 💡 핵심 전략

```
1. 자동화 우선
   → skill-creator로 분석 스크립트 개발
   → 반복 작업 자동화

2. 점진적 개선
   → CSS → 이미지 → 폰트 순서
   → 각 단계마다 검증

3. 측정 기반
   → webapp-testing으로 정량적 검증
   → 목표 vs 실제 비교

4. 품질 보증
   → QA로 회귀 테스트
   → 엣지 케이스 확인
```

---

**Week 2 준비 완료! 🚀**

*다음 업데이트: 2025-11-02 (Friday) - Week 2 완료 보고서*

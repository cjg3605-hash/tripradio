# TripRadio.shop 최적화 필수 스킬 활용 가이드

---

## 🎯 최적화에 필요한 스킬 우선순위

### 1️⃣ **webapp-testing** (⭐⭐⭐⭐⭐ 최우선)

#### 용도
- 주간 성능 측정 및 회귀 테스트
- Lighthouse 자동화
- 사용자 플로우 검증
- 병목 지점 분석

#### 활용 시기
```
매주 금요일 (마지막 업데이트 후):
- test-tripradio-shop.py 실행
- test-diagnose-multilingual-extended.py 실행
- 결과 기록 및 비교

Week별 테스트:
Week 1: AdSense 최적화 검증
Week 2: 번들 최적화 검증
Week 3: 캐싱/CDN 최적화 검증
Week 4: 최종 성능 확인
```

#### 구체적 사용 예시
```python
# Week 1: AdSense 비동기 로드 검증
# test-tripradio-shop.py에서 로드 시간 측정

# Week 2: 번들 크기 감소 확인
# test-diagnose-multilingual-extended.py에서 요청 수 비교

# Week 4: 최종 Lighthouse 스코어 확인
# Google PageSpeed Insights 자동화
```

#### 필요 스크립트 목록
```bash
✅ test-tripradio-shop.py (이미 존재)
✅ test-diagnose-multilingual-extended.py (이미 존재)
🆕 test-lighthouse-automation.py (작성 예정)
🆕 test-bundle-analyzer.py (작성 예정)
```

---

### 2️⃣ **skill-creator** (⭐⭐⭐⭐ 필요)

#### 용도
- 커스텀 최적화 스크립트 생성
- 자동화 도구 개발
- 반복 작업 자동화

#### 구체적 활용 방안

**활용 1: 번들 분석 자동화**
```python
# skill-creator로 개발할 스크립트
# Purpose: CSS/JS 번들 분석 및 최적화 제안

import subprocess
import json

def analyze_bundle():
    """
    1. webpack-bundle-analyzer 실행
    2. 사용되지 않은 CSS 식별 (PurgeCSS)
    3. 크기별 정렬
    4. 최적화 제안 생성
    """
    pass
```

**활용 2: 이미지 최적화 자동화**
```python
# skill-creator로 개발할 스크립트
# Purpose: 프로젝트의 모든 이미지 WebP 변환

from PIL import Image
import os

def convert_images_to_webp():
    """
    1. public/ 디렉토리 스캔
    2. JPG/PNG → WebP 변환
    3. 크기 비교 및 보고서 생성
    4. Next.js Image 컴포넌트 마이그레이션 가이드
    """
    pass
```

**활용 3: 성능 비교 보고서 생성**
```python
# skill-creator로 개발할 스크립트
# Purpose: Week별 성능 메트릭 비교

def generate_performance_report():
    """
    1. 주간 테스트 결과 수집
    2. 그래프 생성 (matplotlib)
    3. 개선 사항 요약
    4. Markdown 보고서 작성
    """
    pass
```

#### 작성 일정
```
Week 1 (우선순위):
- [ ] bundle-analyzer 스크립트 (4시간)

Week 2 (필수):
- [ ] image-optimizer 스크립트 (3시간)

Week 3 (선택):
- [ ] performance-reporter 스크립트 (2시간)
```

---

### 3️⃣ **mcp-builder** (⭐⭐⭐ 고급 활용)

#### 용도
- 성능 분석을 위한 커스텀 MCP 서버 개발
- 자동화 파이프라인 구축
- 외부 도구 통합

#### 구체적 활용 방안

**MCP 서버 아이디어 (선택 사항)**
```
만약 실행할 여유가 있다면:

1. Performance Monitor MCP
   - Vercel API 연동
   - Lighthouse 자동 실행
   - 주간 트렌드 분석

2. Bundle Analyzer MCP
   - webpack 통합
   - 크기 감소 추적
   - 의존성 분석

이는 Week 3-4 여유 시간에 진행 (선택사항)
```

#### 우선순위
```
🟢 LOW - 필수가 아님
선택사항이지만 자동화 강화에 좋음
기존 스크립트만으로도 충분
```

---

### 4️⃣ **artifacts-builder** (⭐⭐ 보조)

#### 용도
- 성능 비교 대시보드 시각화
- 최적화 진행 상황 시각화
- Week별 성과 리포트

#### 구체적 활용 방안

**활용 1: 성능 메트릭 대시보드 (Week 4)**
```html
<!-- artifacts-builder로 생성할 컴포넌트 -->
<!-- 성능 지표 시각화 -->

<div class="performance-dashboard">
  <h1>TripRadio.shop 성능 최적화 진행 상황</h1>

  <!-- 미터 차트: 로딩 시간 -->
  <ProgressBar current={3.5} target={3.5} label="완전 로드 시간" />

  <!-- 비교 그래프: 주간 성능 -->
  <ComparisonChart
    data={weeklyPerformance}
    metrics={['loadTime', 'requests', 'lighthouse']}
  />

  <!-- 체크리스트: 완료된 작업 -->
  <Checklist items={completedTasks} />
</div>
```

**활용 2: 주간 성과 카드**
```
Week 1 성과 카드:
- AdSense 최적화 ✅
- 완전 로드: 8.39s → 7.5s
- 요청 감소: 96 → 90개
- 예상 Lighthouse: 65 → 70점
```

#### 작성 일정
```
Week 4 (선택사항):
- [ ] 성능 대시보드 UI (2시간)
```

---

## 📋 필수 스크립트 작성 일정

### 현재 보유한 스크립트 (작동 중)
```
✅ test-tripradio-shop.py
✅ test-diagnose-multilingual.py
✅ test-diagnose-multilingual-extended.py
```

### Week 1에 작성할 스크립트
```
🆕 test-lighthouse-automation.py
   └─ Lighthouse CLI 자동화 (Google PageSpeed Insights 대체)

🆕 test-bundle-analyzer.py (선택)
   └─ 번들 크기 분석
```

### Week 2에 작성할 스크립트
```
🆕 optimize-images.py
   └─ WebP 변환 자동화

🆕 analyze-css.py
   └─ 사용되지 않은 CSS 식별
```

### Week 4에 작성할 스크립트
```
🆕 generate-performance-report.py
   └─ 주간 성과 보고서 자동 생성
```

---

## 🔧 실제 구현: 필요한 라이브러리 설치

### Week 1 필수 설치
```bash
# Lighthouse CLI
npm install -g lighthouse

# Python 추가 라이브러리
pip install requests beautifulsoup4 matplotlib pandas
```

### Week 2 필수 설치
```bash
# 이미지 최적화
pip install Pillow webp imageio

# CSS 분석
npm install --save-dev purify-css
pip install cssutils
```

### Week 3 필수 설치
```bash
# 번들 분석
npm install --save-dev webpack-bundle-analyzer

# 캐싱 검증
pip install requests-cache
```

---

## 📊 스킬별 예상 작업 시간

```
┌─────────────────────┬──────────┬─────────┬────────────┐
│ 스킬                │ 주당시간 │ 총시간  │ 난이도     │
├─────────────────────┼──────────┼─────────┼────────────┤
│ webapp-testing      │ 5시간    │ 20시간  │ 낮음 (사용) │
│ skill-creator       │ 5시간    │ 15시간  │ 중간 (개발) │
│ mcp-builder         │ 0시간    │ 0시간   │ 선택       │
│ artifacts-builder   │ 1시간    │ 2시간   │ 낮음 (사용) │
├─────────────────────┼──────────┼─────────┼────────────┤
│ 전체 예상           │ 11시간   │ 37시간  │            │
└─────────────────────┴──────────┴─────────┴────────────┘
```

**월-금 집중 일정 (1주 32시간 기준):**
- 모든 작업 4주 내 완료 가능 ✅
- 하루 평균 2-3시간 투입

---

## 🚀 스킬 활용 체크리스트

### webapp-testing 사용 계획
- [x] test-tripradio-shop.py 작성 (완료)
- [x] test-diagnose-multilingual-extended.py 작성 (완료)
- [ ] **Week 1 금요일:** 초기 성능 기준 측정
- [ ] **Week 2 금요일:** 번들 최적화 효과 측정
- [ ] **Week 3 금요일:** 캐싱 최적화 효과 측정
- [ ] **Week 4 금요일:** 최종 성능 확인

### skill-creator 사용 계획
- [ ] **Week 1:** bundle-analyzer 스크립트 개발
- [ ] **Week 2:** image-optimizer 스크립트 개발
- [ ] **Week 3:** performance-reporter 스크립트 개발
- [ ] **Week 4:** 최종 자동화 스크립트 통합

### artifacts-builder 사용 계획
- [ ] **Week 4:** 성능 대시보드 UI 생성 (선택)

### mcp-builder 사용 계획
- [ ] **선택사항:** 자동화 강화 (필수 아님)

---

## 💡 핵심 요약

**가장 중요한 스킬 사용 순서:**

```
1️⃣ webapp-testing (필수)
   ├─ 매주 금요일 성능 측정
   ├─ 회귀 테스트 실행
   └─ 진행 상황 추적

2️⃣ skill-creator (필수)
   ├─ 번들 분석 스크립트
   ├─ 이미지 최적화 스크립트
   └─ 성능 보고서 자동화

3️⃣ artifacts-builder (선택)
   └─ 최종 대시보드 시각화 (Week 4)

4️⃣ mcp-builder (선택사항)
   └─ 고급 자동화 (필요시)
```

---

*이 가이드를 참고하여 4주 최적화 계획을 실행하면*
*성능 점수 3.8/5 → 4.7/5로 향상 가능합니다! 🚀*

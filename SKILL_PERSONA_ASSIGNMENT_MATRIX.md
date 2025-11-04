# 🎯 TripRadio.shop 성능 최적화 - 스킬 & 페르소나 할당 매트릭스

**목적:** 각 작업에 최적의 스킬과 페르소나를 할당하여 효율성 극대화

---

## 📊 페르소나 정의 및 역할

### 🏗️ Architect 페르소나
```
역할: 시스템 아키텍처 전문가
포커스: 장기 설계, 확장성, 유지보수성
우선순위: 장기 유지보수 > 확장성 > 성능 > 단기 이득
MCP 선호도: sequential > context7

적용 작업:
- ISR (Incremental Static Regeneration) 구현
- 캐싱 전략 설계
- 시스템 성능 아키텍처
```

### 🎨 Frontend 페르소나
```
역할: UX 전문가
포커스: 사용자 경험, 접근성, 성능
우선순위: 사용자 필요 > 접근성 > 성능 > 기술 우아함
MCP 선호도: magic > playwright

성능 예산:
- 로드 시간: <3s (3G), <1s (WiFi)
- 번들 크기: <500KB
- 접근성: WCAG 2.1 AA
- Core Web Vitals: 최적

적용 작업:
- AdSense 최적화
- CSS/JS 번들 최적화
- 이미지 최적화
- 폰트 최적화
```

### ⚡ Performance 페르소나
```
역할: 최적화 전문가
포커스: 병목 제거, 메트릭 분석
우선순위: 측정 > 임계값 최적화 > 사용자 경험 > 조기 최적화 방지
MCP 선호도: playwright > sequential

적용 작업:
- 성능 측정 및 분석
- 병목 지점 식별
- 주간 성능 추적
- 최적화 효과 검증
```

### 🔍 Analyzer 페르소나
```
역할: 근본 원인 분석 전문가
포커스: 증거 기반 체계적 조사
우선순위: 증거 > 체계적 접근 > 철저함 > 속도
MCP 선호도: sequential > context7

적용 작업:
- 실패 요청 4개 원인 분석
- 성능 병목 분석
- 네트워크 요청 상세 분석
```

### ✅ QA 페르소나
```
역할: 품질 보증 전문가
포커스: 테스트, 엣지 케이스 감지
우선순위: 예방 > 감지 > 수정 > 포괄적 범위
MCP 선호도: playwright > sequential

적용 작업:
- 회귀 테스트 (주간)
- 모든 경로 테스트
- 성능 검증
- 사용자 플로우 테스트
```

### 🏗️ DevOps 페르소나
```
역할: 인프라 전문가
포커스: 배포 자동화, 신뢰성
우선순위: 자동화 > 관찰성 > 신뢰성 > 확장성
MCP 선호도: sequential > context7

적용 작업:
- Vercel 캐싱 설정
- CDN 구성
- 배포 파이프라인
- 모니터링 설정
```

---

## 🛠️ 스킬 할당 기준

### webapp-testing
```
상태: 동작 중 ✅
우선순위: ⭐⭐⭐⭐⭐ (최우선)
용도: 성능 측정, 회귀 테스트
페르소나: QA, Performance
주기: 매주 금요일

적용 작업:
- 매주 성능 측정
- 기능 테스트 (9가지)
- 다국어 성능 분석
- Lighthouse 검증
```

### skill-creator
```
상태: 개발 필요
우선순위: ⭐⭐⭐⭐ (필수)
용도: 자동화 스크립트 개발
페르소나: Frontend, Performance, Analyzer
주기: 주 1-2회

Week 1: bundle-analyzer
- webpack-bundle-analyzer 활용
- 번들 크기 분석
- 최적화 제안

Week 2: image-optimizer
- WebP 변환 자동화
- 크기 비교
- 마이그레이션 가이드

Week 3: performance-reporter
- 주간 성과 보고서
- 그래프 생성
- 개선 추이 분석
```

### artifacts-builder
```
상태: 필요시 사용
우선순위: ⭐⭐ (선택)
용도: 시각화 대시보드
페르소나: Frontend, Performance
주기: Week 4

적용 작업:
- 성능 메트릭 대시보드
- 주간 성과 카드
- 진행률 시각화
```

### mcp-builder
```
상태: 선택사항
우선순위: ⭐ (고급)
용도: MCP 서버 개발
페르소나: Architect, DevOps
주기: 필요시

선택사항:
- Performance Monitor MCP
- Bundle Analyzer MCP
```

---

## 📅 Week별 작업 할당

### 📍 Week 1: 긴급 고치기

#### 작업 1-1: 프로젝트 분석
```
📌 작업명: 프로젝트 구조 및 성능 분석
⏱️  소요시간: 2시간
👤 담당 페르소나: Analyzer + Frontend
🛠️ 필수 스킬: webapp-testing (기준점 측정)
📊 도구: test-tripradio-shop.py

상세 작업:
1. Analyzer: 프로젝트 구조 체계적 분석
   - app/ 디렉토리 구조 파악
   - 주요 파일 식별
   - 성능 영향 요소 식별

2. Frontend: AdSense 스크립트 위치 파악
   - 현재 로드 방식 확인 (async vs 기타)
   - 개선 전 상태 기록
   - 성능 영향 평가

3. webapp-testing: 기준점 성능 기록
   - 초기 성능 측정 (8.39초 확인)
   - 네트워크 요청 분석 (96개 확인)
   - 실패 요청 식별 (4개 확인)

산출물:
- performance-logs/week1-monday.txt
- 분석 리포트
```

#### 작업 1-2: AdSense 최적화
```
📌 작업명: AdSense 비동기 로드 구현
⏱️  소요시간: 3시간
👤 담당 페르소나: Frontend + Performance
🛠️ 필수 스킬: 코드 편집 (Next.js Script)
🎯 목표: 광고 로드 지연으로 -0.5초 개선

작업 단계:

1️⃣ Frontend 페르소나 (1시간)
   - async → next/script strategy="lazyOnload"으로 변경
   - onLoad 핸들러 추가
   - 사용자 경험 영향 평가

2️⃣ Performance 페르소나 (0.5시간)
   - 변경 전후 성능 비교
   - 광고 로드 시간 측정
   - 병목 감소 확인

3️⃣ QA 페르소나 (1.5시간)
   - 로컬 테스트
   - 브라우저 호환성 검증
   - 광고 렌더링 확인

변경 파일:
- app/layout.tsx (AdSense 스크립트 전략 변경)

검증:
- webapp-testing으로 성능 재측정
- 광고 요소 표시 확인
```

#### 작업 1-3: 실패 요청 분석 및 수정
```
📌 작업명: 4개 실패 요청 원인 분석 및 해결
⏱️  소요시간: 3시간
👤 담당 페르소나: Analyzer + QA
🛠️ 필수 스킬: webapp-testing (상세 분석)
🎯 목표: 4.2% 실패율 → 0.5% 이하로 개선

작업 단계:

1️⃣ Analyzer 페르소나 (1.5시간)
   - test-diagnose-multilingual-extended.py 실행
   - 96개 요청 중 4개 실패 원인 식별
   - 원인 분류: 광고, API, CDN, CORS 등
   - 근본 원인 파악

2️⃣ Frontend 페르소나 (0.5시간)
   - UI 영향 요소 확인
   - 사용자 보이는 오류 확인
   - 폴백 처리 추가

3️⃣ QA 페르소나 (1시간)
   - 각 요청별 재시도 로직 검증
   - 네트워크 상태 시뮬레이션
   - 타임아웃 설정 확인

해결 방법:
- 재시도 로직 추가 (exponential backoff)
- 타임아웃 설정 조정
- 폴백 리소스 제공
- CORS 설정 검토

변경 파일:
- 필요시 API 요청 로직 수정
- 환경 변수 설정
```

#### 작업 1-4: Week 1 검증
```
📌 작업명: Week 1 성과 검증 및 문서화
⏱️  소요시간: 2시간
👤 담당 페르소나: QA + Performance
🛠️ 필수 스킬: webapp-testing
🎯 목표: 8.39초 → 7.5초 달성 확인

작업 단계:

1️⃣ Performance 페르소나 (0.5시간)
   - 최종 성능 측정
   - 개선값 계산 (목표: -0.9초)
   - 병목 지점 변화 분석

2️⃣ QA 페르소나 (0.5시간)
   - 회귀 테스트 (9가지 기능)
   - 다국어 페이지 테스트
   - AdSense 렌더링 확인

3️⃣ Analyzer 페르소나 (1시간)
   - Week 1 성과 보고서 작성
   - Monday 기준점과 Friday 비교
   - 문제점 및 학습사항 기록

산출물:
- performance-logs/week1-summary.txt
- WEEK1_COMPLETION.md
- Git 커밋: "Week 1: Optimize AdSense and fix failing requests"
```

---

### 📍 Week 2: 번들 최적화

#### 작업 2-1: CSS 최적화
```
📌 작업명: CSS 번들 분석 및 최적화
⏱️  소요시간: 4시간
👤 담당 페르소나: Frontend + Performance
🛠️ 필수 스킬: skill-creator (bundle-analyzer 활용)
🎯 목표: CSS 파일 크기 20% 감소

1️⃣ Analyzer 페르소나 (1시간)
   - skill-creator로 번들 분석 스크립트 개발
   - CSS 사용률 분석 (PurgeCSS)
   - 불필요한 스타일 식별

2️⃣ Frontend 페르소나 (2시간)
   - 사용되지 않은 CSS 제거
   - CSS-in-JS 최적화
   - 동적 import 적용

3️⃣ Performance 페르소나 (1시간)
   - 변경 전후 번들 크기 비교
   - 로드 시간 영향 측정

산출물:
- bundle-analyzer.py (스킬로 생성)
- 최적화된 CSS 파일들
```

#### 작업 2-2: 이미지 최적화
```
📌 작업명: Next.js Image + WebP 변환
⏱️  소요시간: 3시간
👤 담당 페르소나: Frontend + Performance
🛠️ 필수 스킬: skill-creator (image-optimizer)
🎯 목표: 이미지 로드 시간 50% 단축

1️⃣ Frontend 페르소나 (1.5시간)
   - Next.js Image 컴포넌트 적용
   - lazy loading 설정
   - responsive 이미지 구성

2️⃣ Analyzer 페르소나 (1시간)
   - 프로젝트 이미지 스캔
   - 포맷별 최적화 전략 수립
   - skill-creator로 image-optimizer 개발

3️⃣ Performance 페르소나 (0.5시간)
   - 이미지 로드 시간 측정
   - 성능 개선 확인

산출물:
- image-optimizer.py (스킬로 생성)
- WebP 이미지 파일들
- 마이그레이션 가이드
```

#### 작업 2-3: 폰트 최적화
```
📌 작업명: 폰트 로드 전략 최적화
⏱️  소요시간: 2시간
👤 담당 페르소나: Frontend + Performance
🛠️ 필수 스킬: 코드 편집
🎯 목표: 폰트 로드 시간 30% 단축

1️⃣ Frontend 페르소나 (1.5시간)
   - font-display: swap 설정
   - 필수 폰트만 선택
   - next/font 활용

2️⃣ Performance 페르소나 (0.5시간)
   - 폰트 로드 시간 측정
   - FOUT/FOIT 분석

산출물:
- 최적화된 layout.tsx
- 폰트 로드 순서 정리
```

#### 작업 2-4: Week 2 검증
```
📌 작업명: 번들 최적화 성과 검증
⏱️  소요시간: 2시간
👤 담당 페르소나: QA + Performance
🛠️ 필수 스킬: webapp-testing
🎯 목표: 7.5초 → 5.5초 달성 확인

산출물:
- performance-logs/week2-summary.txt
- WEEK2_COMPLETION.md
```

---

### 📍 Week 3: 캐싱 및 배포 최적화

#### 작업 3-1: ISR 구현
```
📌 작업명: Incremental Static Regeneration 설정
⏱️  소요시간: 3시간
👤 담당 페르소나: Architect + Backend
🛠️ 필수 스킬: 코드 편집
🎯 목표: 반복 방문 시 로드 시간 80% 단축

1️⃣ Architect 페르소나 (1.5시간)
   - ISR 전략 설계
   - revalidate 값 설정 (3600초)
   - generateStaticParams 계획

2️⃣ Backend 페르소나 (1.5시간)
   - ISR 구현
   - 동적 라우팅 최적화
   - 캐시 무효화 전략

산출물:
- 최적화된 page.tsx (ISR 적용)
- 정적 생성 전략 문서
```

#### 작업 3-2: 캐싱 헤더 설정
```
📌 작업명: Vercel 캐싱 전략 수립
⏱️  소요시간: 2시간
👤 담당 페르소나: DevOps + Performance
🛠️ 필수 스킬: 코드 편집 (vercel.json)
🎯 목표: 캐시 히트율 85% 이상

1️⃣ DevOps 페르소나 (1.5시간)
   - vercel.json 캐싱 정책 설정
   - s-maxage, stale-while-revalidate 설정
   - 언어별 캐시 분리

2️⃣ Performance 페르소나 (0.5시간)
   - 캐시 효율성 측정
   - 반복 방문 성능 확인

산출물:
- 최적화된 vercel.json
- 캐싱 정책 문서
```

#### 작업 3-3: CDN 최적화
```
📌 작업명: CDN 및 엣지 설정 최적화
⏱️  소요시간: 2시간
👤 담당 페르소나: DevOps + Performance
🛠️ 필수 스킬: 코드 편집
🎯 목표: 지역별 배송 시간 20% 단축

1️⃣ DevOps 페르소나 (1.5시간)
   - Edge Function 활용
   - 지역별 캐싱 정책
   - 정적 리소스 CDN 설정

2️⃣ Performance 페르소나 (0.5시간)
   - 지역별 성능 비교
   - CDN 효율성 검증

산출물:
- CDN 설정 파일
- 지역별 성능 가이드
```

#### 작업 3-4: Week 3 검증
```
📌 작업명: 캐싱 최적화 성과 검증
⏱️  소요시간: 2시간
👤 담당 페르소나: QA + Performance
🛠️ 필수 스킬: webapp-testing
🎯 목표: 5.5초 → 4.0초 달성 확인

산출물:
- performance-logs/week3-summary.txt
- WEEK3_COMPLETION.md
```

---

### 📍 Week 4: 마무리 및 검증

#### 작업 4-1: 성능 모니터링 설정
```
📌 작업명: Web Vitals 및 Lighthouse 통합
⏱️  소요시간: 3시간
👤 담당 페르소나: DevOps + QA
🛠️ 필수 스킬: 코드 편집
🎯 목표: 실시간 성능 추적 시스템 구축

1️⃣ DevOps 페르소나 (1.5시간)
   - Vercel Speed Insights 활성화
   - Lighthouse CI 통합
   - 모니터링 대시보드 구축

2️⃣ QA 페르소나 (1.5시간)
   - 모니터링 검증
   - 알림 규칙 설정
   - 성능 임계값 정의

산출물:
- app/layout.tsx (Analytics 추가)
- Lighthouse CI 설정
- 모니터링 대시보드
```

#### 작업 4-2: 성능 리포터 개발
```
📌 작업명: 자동 성능 보고서 생성
⏱️  소요시간: 2시간
👤 담당 페르소나: Performance + Analyzer
🛠️ 필수 스킬: skill-creator (performance-reporter)
🎯 목표: 주간 성과 자동 리포팅

1️⃣ Analyzer 페르소나 (1시간)
   - skill-creator로 리포터 스크립트 개발
   - 주간 테스트 결과 수집
   - 그래프 생성 로직

2️⃣ Performance 페르소나 (1시간)
   - 리포트 검증
   - 메트릭 추가/제거 최적화

산출물:
- performance-reporter.py (스킬로 생성)
- 주간 성과 보고서
```

#### 작업 4-3: 대시보드 시각화
```
📌 작업명: 성능 메트릭 대시보드 구축
⏱️  소요시간: 2시간
👤 담당 페르소나: Frontend
🛠️ 필수 스킬: artifacts-builder (선택)
🎯 목표: 시각적 성과 표현

1️⃣ Frontend 페르소나 (2시간)
   - artifacts-builder로 대시보드 UI 생성
   - 주간 성과 카드
   - 진행률 시각화
   - 메트릭 그래프

산출물:
- 성능 대시보드 UI
- 주간 성과 카드들
```

#### 작업 4-4: 최종 검증
```
📌 작업명: 전체 성능 테스트 및 최종 검증
⏱️  소요시간: 2시간
👤 담당 페르소나: QA
🛠️ 필수 스킬: webapp-testing
🎯 목표: 최종 성능 확인 (3.5초 달성)

1️⃣ QA 페르소나 (2시간)
   - 모든 페이지 회귀 테스트
   - 다국어 테스트
   - 모바일 반응성 검증
   - 성능 임계값 확인

산출물:
- performance-logs/week4-final.txt
- FINAL_VALIDATION_REPORT.md
- Git 커밋: "Complete: Performance optimization - 58% improvement"
```

---

## 🎯 페르소나별 총 소요 시간

```
┌──────────────┬──────────┬─────────┬──────────┐
│ 페르소나     │ Week 1   │ Week 2-3│ Week 4   │
├──────────────┼──────────┼─────────┼──────────┤
│ Frontend     │ 3시간    │ 5시간   │ 2시간    │
│ Performance  │ 2시간    │ 2시간   │ 1시간    │
│ Analyzer     │ 2시간    │ 1시간   │ 0시간    │
│ QA           │ 2시간    │ 2시간   │ 4시간    │
│ Architect    │ 0시간    │ 0시간   │ 1.5시간  │
│ DevOps       │ 0시간    │ 0시간   │ 4.5시간  │
├──────────────┼──────────┼─────────┼──────────┤
│ 합계         │ 9시간    │ 10시간  │ 12시간   │
└──────────────┴──────────┴─────────┴──────────┘
```

---

## 🛠️ 스킬별 투입 일정

```
webapp-testing
├─ Week 1: 기준점 측정 (2시간)
├─ Week 2: 검증 (1시간)
├─ Week 3: 검증 (1시간)
└─ Week 4: 최종 테스트 (1시간)
   → 총 5시간

skill-creator
├─ Week 1: 기초 학습 (0시간)
├─ Week 2-1: bundle-analyzer (4시간)
├─ Week 2-2: image-optimizer (3시간)
├─ Week 3: performance-reporter (2시간)
└─ 도구 및 문서 (2시간)
   → 총 11시간

artifacts-builder
├─ Week 4: 대시보드 (2시간)
   → 총 2시간

mcp-builder
├─ 선택사항 (필요시)
   → 0-4시간
```

---

## ✅ 실행 순서 (우선순위 기반)

```
🔴 P0 (필수, Week 1)
1. 프로젝트 분석 → Analyzer + Frontend
2. AdSense 최적화 → Frontend + Performance
3. 실패 요청 분석 → Analyzer + QA
4. Week 1 검증 → QA + Performance

🟠 P1 (필수, Week 2-3)
5. CSS 최적화 → Frontend + Performance
6. 이미지 최적화 → Frontend + Performance
7. 폰트 최적화 → Frontend + Performance
8. ISR 구현 → Architect + Backend
9. 캐싱 설정 → DevOps + Performance
10. CDN 최적화 → DevOps + Performance

🟡 P2 (마무리, Week 4)
11. 모니터링 설정 → DevOps + QA
12. 리포터 개발 → Performance + Analyzer
13. 대시보드 구축 → Frontend
14. 최종 검증 → QA
```

---

## 🚀 사용 방법

### 각 작업 시작 시
```bash
# 1. 페르소나 및 스킬 확인
cat /c/GUIDEAI/SKILL_PERSONA_ASSIGNMENT_MATRIX.md | grep "작업명"

# 2. 담당 페르소나 활성화
/persona-[name]  # 예: /persona-frontend

# 3. 스킬 사용
/webapp-testing  # 성능 측정 시
/skill-creator   # 스크립트 개발 시

# 4. 작업 완료 후 다음 작업으로
```

---

## 📊 기대 효과

```
Week 1 (Analyzer, Frontend, QA, Performance)
└─ 8.39초 → 7.5초 (-11% 개선)

Week 2 (Frontend, Performance, skill-creator)
└─ 7.5초 → 5.5초 (-27% 개선, 누적 -34%)

Week 3 (Architect, Backend, DevOps, Performance)
└─ 5.5초 → 4.0초 (-42% 개선, 누적 -52%)

Week 4 (DevOps, QA, Performance, Frontend)
└─ 4.0초 → 3.5초 (-58% 최종 개선)

최종: 3.8/5 점수 → 4.7/5 점수 (+23% 향상)
```

---

*이 매트릭스를 기반으로 순차적으로 작업을 진행하면*
*최적의 효율과 품질을 동시에 달성할 수 있습니다! 🚀*

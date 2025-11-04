# 📅 Week 1 실행 계획: 긴급 고치기
**목표:** 8.39초 → 7.5초 (-0.9초) | 요청 96개 → 90개
**기간:** 월-금 (32시간)
**우선순위:** 🔴 P0 (긴급)

---

## 🎯 Week 1 목표

### 완료해야 할 작업 4가지

```
1. A4-1: AdSense 비동기 로드 설정
   └─ 예상 개선: -0.5초

2. A4-2: AdSense 지연 로드
   └─ 예상 개선: -0.4초

3. B0: 실패 요청 4개 분석 및 수정
   └─ 예상 개선: -0.5초 + 신뢰도 향상

4. Performance Baseline 기록
   └─ Week 2-4 비교 기준점
```

---

## 📋 Day-by-Day 일정

### 📅 Monday (2시간)

#### 목표
- 프로젝트 구조 파악
- 번들 분석 환경 구축
- 실패 요청 식별

#### 작업 항목

**Task 1-1: 프로젝트 구조 분석 (30분)**
```bash
# 프로젝트 구조 확인
ls -la /c/GUIDEAI/app/
ls -la /c/GUIDEAI/src/lib/

# 주요 파일 확인
cat /c/GUIDEAI/next.config.js
cat /c/GUIDEAI/app/layout.tsx
cat /c/GUIDEAI/app/page.tsx
```

**Task 1-2: AdSense 스크립트 위치 찾기 (30분)**
```bash
# AdSense 스크립트 검색
grep -r "pagead2.googlesyndication" /c/GUIDEAI/app/
grep -r "google-adsense-account" /c/GUIDEAI/

# Next.js Script 컴포넌트 사용 여부 확인
grep -r "next/script" /c/GUIDEAI/
```

**Task 1-3: 현재 성능 기준점 기록 (1시간)**
```bash
# 명확한 성능 기준점 기록
echo "Week 1 Monday Baseline"
python /c/GUIDEAI/test-tripradio-shop.py > /tmp/week1-monday-baseline.txt
python /c/GUIDEAI/test-diagnose-multilingual-extended.py >> /tmp/week1-monday-baseline.txt

# 결과 저장
cp /tmp/week1-monday-baseline.txt /c/GUIDEAI/performance-logs/week1-monday.txt
```

#### 완료 기준
- [ ] 프로젝트 구조 파악 완료
- [ ] AdSense 스크립트 위치 식별
- [ ] 실패 요청 4개 특정 (네트워크 탭에서)
- [ ] 기준점 성능 기록 완료

---

### 📅 Tuesday (3시간)

#### 목표
- AdSense 비동기 로드 구현
- 스크립트 수정

#### 작업 항목

**Task 2-1: AdSense 스크립트 최적화 (2시간)**

```typescript
// 현재 구조 파악
// 1. app/layout.tsx에서 AdSense 로드 방식 확인

// 개선 전:
<script
  async
  src="https://pagead2.googlesyndication.com/..."
/>

// 개선 후 (next/script 사용):
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUB_ID"
          strategy="lazyOnload"
          crossOrigin="anonymous"
          onLoad={() => {
            console.log('AdSense loaded')
            if (window.adsbygoogle) {
              window.adsbygoogle.push({})
            }
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**파일 수정 계획:**
```bash
# 1. 백업 생성
cp /c/GUIDEAI/app/layout.tsx /c/GUIDEAI/app/layout.tsx.backup.week1

# 2. 스크립트 전략 변경
# async → lazyOnload (2초 지연)

# 3. onLoad 핸들러 추가
# AdSense 로드 완료 확인

# 4. 테스트 및 검증
npm run dev
# 브라우저에서 AdSense 스크립트 로드 확인
```

**Task 2-2: 테스트 및 검증 (1시간)**
```bash
# 스크립트 로드 확인
python /c/GUIDEAI/test-tripradio-shop.py

# AdSense 요소 확인
# - adsbygoogle 스크립트 존재 여부 ✓
# - 광고 컨테이너 표시 여부 ✓
# - 로드 시간 기록
```

#### 완료 기준
- [ ] next/script로 AdSense 변경 완료
- [ ] strategy="lazyOnload" 적용
- [ ] 로컬 테스트 성공
- [ ] 성능 영향 측정 완료

---

### 📅 Wednesday (3시간)

#### 목표
- 실패 요청 4개 원인 분석 및 수정

#### 작업 항목

**Task 3-1: 실패 요청 분석 (2시간)**

```bash
# 자세한 네트워크 분석 스크립트 실행
python /c/GUIDEAI/test-diagnose-multilingual-extended.py 2>&1 | tee /tmp/network-analysis.txt

# 주요 확인사항:
# 1. 96개 요청 중 어떤 4개가 실패했는가?
# 2. 실패 패턴: 외부 API? CDN? 광고?
# 3. HTTP 상태 코드: 404? 403? 502?
# 4. 재현성: 항상 실패하는가? 간헐적인가?
```

**Task 3-2: 원인별 대응 (1시간)**

```bash
# 가능한 원인과 해결책:

# 원인 1: 광고 네트워크 요청 (AdSense, DoubleClick)
# 해결: lazyOnload로 이미 최적화 중

# 원인 2: Google Analytics 추적
# 해결: async 스크립트 또는 지연 로드

# 원인 3: 외부 API 호출 (Google Places, Maps)
# 해결: 타임아웃 설정, 폴백 처리

# 원인 4: CDN 리소스 (폰트, 이미지)
# 해결: 재시도 로직 추가, 로컬 폴백

# 원인 5: CORS 정책 위반
# 해결: 프록시 설정 또는 도메인 추가
```

**구체적 수정:**
```typescript
// 실패 요청 감지 및 재시도 로직
const retryRequest = async (url, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch (e) {
      if (i === maxRetries - 1) throw e
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}
```

#### 완료 기준
- [ ] 4개 실패 요청 특정 완료
- [ ] 각 요청의 원인 파악 완료
- [ ] 해결책 구현 또는 기록 완료
- [ ] 재시도 로직 추가 (필요시)

---

### 📅 Thursday (2시간)

#### 목표
- Playwright 테스트 설정 조정
- 점진적 개선 확인

#### 작업 항목

**Task 4-1: Playwright 타임아웃 조정 (30분)**

```python
# 변경 전 (test-tripradio-shop.py):
response = page.goto(url, wait_until="networkidle", timeout=5000)

# 변경 후:
response = page.goto(url, wait_until="networkidle", timeout=10000)

# 또는 더 정밀한 설정:
response = page.goto(url, wait_until="commit", timeout=15000)
page.wait_for_load_state("networkidle", timeout=10000)
```

**Task 4-2: Week 1 진행 상황 점검 (1.5시간)**

```bash
# 현재까지의 개선 사항 측정
python /c/GUIDEAI/test-tripradio-shop.py > /tmp/week1-thursday.txt

# 비교
echo "=== Week 1 진행 상황 ==="
echo "Monday Baseline:"
cat /tmp/week1-monday-baseline.txt | grep "완전 로드"
echo "Thursday Status:"
cat /tmp/week1-thursday.txt | grep "완전 로드"

# 개선 효과 계산
# 예상: 8.39초 → 7.5초
```

#### 완료 기준
- [ ] Playwright 타임아웃 10초로 변경 완료
- [ ] Week 1 중간 성능 측정 완료
- [ ] 개선 효과 기록 완료

---

### 📅 Friday (2시간)

#### 목표
- Week 1 최종 성능 검증
- 다음 주 준비

#### 작업 항목

**Task 5-1: 최종 성능 측정 (1시간)**

```bash
# 최종 성능 baseline 기록
python /c/GUIDEAI/test-tripradio-shop.py > /tmp/week1-friday-final.txt
python /c/GUIDEAI/test-diagnose-multilingual-extended.py >> /tmp/week1-friday-final.txt

# 결과 정리
echo "=== Week 1 최종 결과 ===" > /c/GUIDEAI/performance-logs/week1-summary.txt
echo "시작: 8.39초" >> /c/GUIDEAI/performance-logs/week1-summary.txt
cat /tmp/week1-friday-final.txt | grep "완전 로드\|네트워크 요청" >> /c/GUIDEAI/performance-logs/week1-summary.txt
```

**Task 5-2: 다음 주 준비 (1시간)**

```bash
# 현재 상태 커밋
git add -A
git commit -m "Week 1: AdSense optimization and performance baseline"

# Week 2 번들 분석 도구 준비
npm install --save-dev webpack-bundle-analyzer

# 환경 문서 작성
cat > /c/GUIDEAI/WEEK1_COMPLETION.md << 'EOF'
# Week 1 완료 보고서

## 완료 작업
- [x] AdSense 비동기 로드 (lazyOnload)
- [x] 실패 요청 분석 및 해결
- [x] Playwright 타임아웃 조정
- [x] 성능 기준점 기록

## 측정 결과
- 완전 로드: 8.39초 → [실제값]초 (-[%])
- 네트워크 요청: 96개 → [실제값]개 (-[%])
- 요청 실패율: 4.2% → [실제값]% (-[%])

## 다음 주 계획
Week 2: 번들 최적화
- CSS 분석 및 최적화
- JavaScript 코드 분할
- 이미지 최적화 준비
EOF
```

#### 완료 기준
- [ ] 최종 성능 측정 완료
- [ ] Week 1 성과 보고서 작성 완료
- [ ] 코드 커밋 완료
- [ ] Week 2 준비 완료

---

## 🚨 Week 1 주의사항

### 피해야 할 실수
```
❌ 한꺼번에 너무 많은 변경
   └─ 한 번에 하나씩 변경, 테스트 후 다음 진행

❌ 배포 없이 로컬에서만 테스트
   └─ 프로덕션과 다를 수 있음
   └─ Vercel preview URL에서도 테스트

❌ 성능 기준점 미기록
   └─ Week 2-4와 비교 불가능
   └─ 진행 상황 추적 불가능
```

### 문제 발생 시 대응
```
상황: AdSense 스크립트 로드 안 됨
해결:
1. 브라우저 콘솔에서 오류 확인
2. 클라이언트 ID 확인
3. CORS 정책 확인
4. 이전 버전으로 롤백

상황: 성능이 더 느려짐
해결:
1. 변경사항 확인
2. 캐시 clear
3. 이전 커밋으로 되돌리기
```

---

## 📊 Week 1 성과 기록 템플릿

```markdown
# Week 1 성과 보고서

## 1. 완료 작업
- [x] AdSense 최적화
- [x] 실패 요청 분석
- [x] 성능 기준점 수립

## 2. 성능 개선
### 로딩 시간
- 시작: 8.39초
- 종료: [?]초
- 개선: [?]초 ([?]%)

### 네트워크 요청
- 시작: 96개
- 종료: [?]개
- 감소: [?]개 ([?]%)

### 요청 실패율
- 시작: 4.2%
- 종료: [?]%
- 개선: [?]% ([?]%)

## 3. 기술 구현
### A4: AdSense 최적화
```typescript
// 실제 구현 코드 기록
```

### B0: 실패 요청 수정
```
1. [요청명]: [원인] → [해결책]
2. [요청명]: [원인] → [해결책]
...
```

## 4. 다음 주 계획
- [ ] 번들 분석
- [ ] CSS 최적화
- [ ] 이미지 최적화
```

---

## ✅ Week 1 완료 체크리스트

### 코드 변경
- [ ] app/layout.tsx - AdSense next/script 적용
- [ ] app/layout.tsx - onLoad 핸들러 추가
- [ ] [필요시] 실패 요청 대응 코드 추가

### 테스트 및 검증
- [ ] Monday: 기준점 성능 측정
- [ ] Tuesday: AdSense 변경 후 테스트
- [ ] Wednesday: 실패 요청 분석 완료
- [ ] Thursday: 중간 성능 확인
- [ ] Friday: 최종 성능 측정

### 문서화
- [ ] performance-logs/week1-monday.txt
- [ ] performance-logs/week1-thursday.txt
- [ ] performance-logs/week1-summary.txt
- [ ] WEEK1_COMPLETION.md

### Git 커밋
- [ ] "Week 1: Optimize AdSense loading strategy"
- [ ] "Week 1: Fix failing external requests"

---

## 🎯 Week 1 성공 기준

| 항목 | 목표 | 필수 | 선택 |
|------|------|------|------|
| AdSense 최적화 | 적용 | ✅ | |
| 실패 요청 4개 | 분석 완료 | ✅ | |
| 성능 기준점 | 기록 | ✅ | |
| 성능 개선 | 0.5초+ | | ✅ |
| Playwright 조정 | 설정 | ✅ | |
| 문서화 | 완료 | ✅ | |

---

## 📚 Week 1 참고 자료

### Next.js Script 컴포넌트
- [공식 문서](https://nextjs.org/docs/basic-features/script)
- strategy 옵션: beforeInteractive, afterInteractive, lazyOnload, worker

### AdSense 최적화
- [Google AdSense 최적화](https://support.google.com/adsense)
- lazyOnload: 페이지 로드 후 2초 뒤에 스크립트 로드

### 성능 측정
- Playwright networkidle: 모든 네트워크 요청 완료
- timeout: 기다릴 최대 시간 (밀리초)

---

**Week 1 시작 준비: 완료! 🚀**

*다음 단계: 월요일 Task 1-1부터 시작*

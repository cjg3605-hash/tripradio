# 🌍 대규모 번역키 마이그레이션 가이드

**완전 자동화된 번역키 적용 시스템**으로 2,000+ 하드코딩 텍스트를 체계적으로 번역키로 전환합니다.

## 🎯 전체 프로세스 개요

```
Phase 1: 분석 → Phase 2: 마이그레이션 → Phase 3: 검증 → Phase 4: 최적화
   ↓              ↓                  ↓             ↓
자동 추출      자동 변환            품질 검사      성능 최적화
```

## 📋 사전 준비사항

### 1. Node.js 의존성 설치
```bash
cd C:\GUIDEAI
npm install glob --save-dev
```

### 2. 백업 확인
- Git 커밋 상태 확인: `git status`
- 중요한 변경사항이 있다면 먼저 커밋

## 🚀 단계별 실행 가이드

### **STEP 1: 전체 프로젝트 분석**

```bash
# 모든 하드코딩 텍스트 자동 추출 및 분석
node scripts/translation-analyzer.js
```

**결과물:**
- `scripts/translation-analysis.json`: 상세 분석 결과
- `scripts/suggested-translation-keys.json`: 제안된 번역키 구조

**확인사항:**
- 총 텍스트 개수 확인
- 중복 텍스트 목록 검토
- 제안된 키 구조 검토

### **STEP 2: 드라이런 테스트 (안전 모드)**

```bash
# 실제 적용하지 않고 변환 결과 미리보기
node scripts/translation-migrator.js --dry-run
```

**확인사항:**
- 변환될 파일 목록 검토
- 생성될 번역키 개수 확인
- 예상 문제점 파악

### **STEP 3: 우선순위 1단계 마이그레이션**

```bash
# 도구 페이지들부터 실제 적용 시작
node scripts/translation-migrator.js
```

**변환되는 페이지:**
1. `trip-planner/page.tsx` ✅
2. `nomad-calculator/page.tsx` ✅  
3. `film-locations/page.tsx` ✅
4. `visa-checker/page.tsx` ✅
5. `travel/page.tsx` ✅

### **STEP 4: 결과 검증**

```bash
# 변환 결과 품질 검사
node scripts/translation-validator.js
```

**검증항목:**
- ✅ 누락된 번역키 없는지 확인
- ✅ 사용되지 않는 키 정리
- ✅ 하드코딩 텍스트 잔존 확인
- ✅ 번역 일관성 검사

### **STEP 5: 수동 보완 작업**

```bash
# 수정이 필요한 항목들 확인
cat scripts/fix-suggestions.json
```

**수동 작업 대상:**
- 복잡한 JSX 구조 내 텍스트
- 동적으로 생성되는 텍스트
- 컨텍스트가 중요한 텍스트

## 📊 예상 결과

### Before (현재 상태)
```typescript
// 하드코딩 예시
<h1>디지털노마드 생활비 계산기</h1>
<p>전세계 원격근무 도시를 비교해보세요</p>
<button>무료로 시작하기</button>
```

### After (변환 후)
```typescript
// 번역키 적용 예시
<h1>{t('tools.nomadCalculator.hero.title')}</h1>
<p>{t('tools.nomadCalculator.hero.description')}</p>
<button>{t('tools.nomadCalculator.cta.start')}</button>
```

### translations.json 구조
```json
{
  "ko": {
    "tools": {
      "nomadCalculator": {
        "hero": {
          "title": "디지털노마드 생활비 계산기",
          "description": "전세계 원격근무 도시를 비교해보세요"
        },
        "cta": {
          "start": "무료로 시작하기"
        }
      }
    }
  },
  "en": {
    "tools": {
      "nomadCalculator": {
        "hero": {
          "title": "Digital Nomad Cost Calculator",
          "description": "Compare remote work cities worldwide"
        },
        "cta": {
          "start": "Get Started Free"
        }
      }
    }
  }
}
```

## 🛠️ 문제 해결

### 1. 변환 실패 시
```bash
# 백업에서 복구
cp -r scripts/backup/backup-[timestamp]/* ./
```

### 2. 부분적 변환만 원할 때
`translation-migrator.js` 파일에서 `categories.priority1` 배열 수정

### 3. 특정 파일만 재처리
```javascript
// 특정 파일만 처리하도록 수정
const specificFiles = ['trip-planner/page.tsx'];
```

## 📈 성과 지표

### 예상 개선사항
- **번역키 적용률**: 95% 이상
- **다국어 준비도**: 완료
- **유지보수성**: 대폭 향상
- **SEO 다국어 지원**: 가능

### 품질 메트릭
- ✅ 하드코딩 텍스트: 2,306개 → 50개 이하 (98% 감소)
- ✅ 번역키 구조화: 체계적 네임스페이스 적용
- ✅ 국제화 준비: 완전 지원

## 🚨 주의사항

### 실행 전 필수 확인
1. **Git 백업**: 모든 변경사항 커밋 완료
2. **의존성 설치**: Node.js, glob 패키지 설치 완료
3. **테스트 환경**: 개발 서버에서만 실행

### 알려진 제한사항
- 동적 텍스트는 수동 처리 필요
- 복잡한 조건부 렌더링은 검토 필요
- 스타일 관련 텍스트는 별도 처리

## 📞 지원

- 스크립트 오류 시: `scripts/` 폴더의 로그 파일 확인
- 수동 작업 가이드: `fix-suggestions.json` 참조
- 롤백 필요 시: `scripts/backup/` 폴더에서 복구

---

**🎉 완료 후에는 완전히 국제화된 웹사이트로 변신합니다!**
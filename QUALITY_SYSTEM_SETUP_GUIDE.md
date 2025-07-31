# 🎯 AI 가이드 품질 검증 시스템 설치 가이드

## ✅ 1단계 구현 완료!

축하합니다! AI 가이드 품질 검증 및 자동 재생성 시스템의 1단계가 성공적으로 구현되었습니다.

## 📁 구현된 파일들

### 🔧 핵심 API
1. **`/src/app/api/quality/verify-guide/route.ts`** - 품질 검증 API
2. **`/src/app/api/quality/regenerate/route.ts`** - 자동 재생성 API

### 📚 라이브러리
3. **`/src/lib/quality/quality-integration.ts`** - 품질 통합 유틸리티
4. **`/src/lib/quality/quality-scoring.ts`** - 품질 점수 계산 시스템

### 🗄️ 데이터베이스
5. **`/database/quality-system-schema.sql`** - 데이터베이스 스키마

## 🚀 설치 및 설정 단계

### 1. 데이터베이스 스키마 적용

Supabase 대시보드에서 다음 SQL을 실행하세요:

```bash
# 파일 내용을 Supabase SQL Editor에서 실행
cat database/quality-system-schema.sql
```

**생성되는 테이블들:**
- `guide_versions` - 가이드 버전 관리
- `quality_evolution` - 품질 점수 진화 추적
- `quality_improvement_queue` - 재생성 큐 (기존 테이블 확장)
- `realtime_quality_metrics` - 실시간 품질 지표 (기존 테이블 확장)
- `quality_alerts` - 품질 알림

### 2. 환경 변수 확인

`.env.local` 파일에 다음 변수들이 설정되어 있는지 확인:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # 또는 프로덕션 URL
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 의존성 설치

품질 시스템에 필요한 의존성이 이미 설치되어 있는지 확인:

```bash
npm install @google/generative-ai  # 이미 설치되어 있을 것
```

### 4. TypeScript 타입 확인

TypeScript 컴파일 오류가 없는지 확인:

```bash
npm run type-check
```

## 🎯 사용 방법

### 자동 품질 검증 (기존 API에 자동 통합됨)

기존 가이드 생성 API가 자동으로 품질 검증을 수행합니다:

```javascript
// 기존 API 호출 (변경 없음)
const response = await fetch('/api/ai/generate-detailed-guide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: '경복궁',
    userPreferences: { interests: ['역사', '문화'] }
  })
});

const result = await response.json();

// 이제 품질 정보가 포함됨
console.log('품질 점수:', result.quality.score);        // 85
console.log('품질 레벨:', result.quality.level);        // 'good'
console.log('재생성 횟수:', result.quality.regenerationAttempts); // 1
console.log('캐싱 전략:', result.caching.strategy);      // 'cache_long'
```

### 수동 품질 검증

특정 가이드의 품질을 수동으로 검증:

```javascript
const response = await fetch('/api/quality/verify-guide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    guideContent: guideData,
    locationName: '경복궁',
    language: 'ko'
  })
});

const result = await response.json();
console.log('품질 검증 결과:', result.verification);
```

### 수동 재생성 트리거

품질이 낮은 가이드를 수동으로 재생성:

```javascript
const response = await fetch('/api/quality/regenerate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    locationName: '경복궁',
    language: 'ko',
    targetQualityScore: 85,
    strategy: 'enhanced'
  })
});

const result = await response.json();
console.log('재생성 결과:', result.result);
```

## 📊 품질 기준

### 점수 구간
- **🌟 95-100점**: 우수 (Excellent) - 12시간 캐싱
- **✅ 85-94점**: 양호 (Good) - 6시간 캐싱
- **⚠️ 75-84점**: 허용 가능 (Acceptable) - 2시간 캐싱
- **❌ 60-74점**: 불량 (Poor) - 캐싱 안함, 개선 필요
- **🚨 0-59점**: 심각 (Critical) - 즉시 재생성 필요

### 평가 요소 (가중치)
- **사실 정확성**: 35% - 역사적 사실, 수치, 인명 정확성
- **콘텐츠 완성도**: 25% - 필수 정보 포함 여부
- **논리적 흐름**: 20% - 스토리텔링과 가독성
- **문화적 민감성**: 20% - 문화적 적절성과 존중

## 🔄 자동화 동작

### 품질 기반 자동 재생성
- **70점 미만**: 자동으로 최대 3회 재생성 시도
- **60점 미만**: 캐시 무효화, 이전 버전 사용
- **50점 미만**: 사용자 알림 생성
- **40점 미만**: 긴급 폴백 버전 사용

### 사용자 피드백 통합
- **3.5/5 미만**: 재생성 큐에 자동 추가
- **2/5 미만**: 즉시 재생성 트리거
- **누적 불만**: 패턴 분석 후 프롬프트 개선

## 🛠️ 모니터링 및 관리

### 품질 대시보드 데이터 조회

```sql
-- 위치별 품질 현황
SELECT 
  location_name,
  AVG(quality_score) as avg_quality,
  COUNT(*) as version_count,
  MAX(generated_at) as last_updated
FROM guide_versions 
WHERE status = 'production'
GROUP BY location_name
ORDER BY avg_quality DESC;

-- 재생성이 필요한 가이드들
SELECT * FROM guides_needing_regeneration 
ORDER BY regeneration_priority DESC;

-- 품질 트렌드 조회
SELECT * FROM quality_trends 
WHERE avg_quality < 75;
```

### 수동 재생성 큐 처리

백그라운드에서 재생성 큐를 처리:

```bash
# cron job 또는 서버리스 함수로 실행
curl "http://localhost:3000/api/quality/regenerate?batchSize=5&strategy=enhanced"
```

## ⚠️ 주의사항

### 1. API 호출 비용
- 품질 검증과 재생성으로 인해 Gemini API 호출이 증가할 수 있습니다
- 필요시 `REGENERATION_CONFIG.MAX_RETRIES`를 조정하세요

### 2. 처리 시간
- 품질 검증: 평균 2-5초 추가
- 재생성: 평균 10-30초 추가 (최대 3회 시도)

### 3. 데이터베이스 용량
- 버전 관리로 인해 저장 공간이 증가할 수 있습니다
- 주기적으로 `deprecated` 상태의 오래된 버전을 정리하세요

## 🔍 트러블슈팅

### 품질 검증 실패
```javascript
// 로그 확인
console.log('품질 검증 오류 확인:', result.quality.warnings);

// 수동 검증 시도
await fetch('/api/quality/verify-guide', { ... });
```

### 재생성 실패
```javascript
// 재생성 큐 상태 확인
SELECT * FROM quality_improvement_queue 
WHERE status = 'failed';

// 수동 재시도
await fetch('/api/quality/regenerate', { 
  body: JSON.stringify({ forceRegenerate: true }) 
});
```

### 성능 이슈
```javascript
// 간단한 생성 모드 (품질 검사 생략)
const result = await enhanceGuideWithQuality(location, guide, 'ko', {
  skipQualityCheck: true  // 이 옵션은 추후 구현 예정
});
```

## 🎉 다음 단계

1단계가 완료되었습니다! 다음 단계들을 계획해보세요:

### 2단계: 자동 재생성 시스템 (3-4주차)
- 백그라운드 큐 처리 자동화
- 향상된 프롬프트 시스템
- 스마트 캐시 관리

### 3단계: 고급 기능 (5-6주차)
- A/B 테스트 프레임워크
- 예측적 품질 점수
- 사용자 알림 시스템

---

## ✅ 즉시 확인할 수 있는 효과

1. **품질 보장**: 이제 모든 생성 가이드가 자동으로 품질 검증됩니다
2. **자동 개선**: 품질이 낮은 가이드는 자동으로 재생성됩니다
3. **상세 로깅**: 품질 점수와 개선 기록이 모두 저장됩니다
4. **스마트 캐싱**: 품질에 따른 차등 캐싱으로 성능 최적화

이제 AI가 실수를 해도 시스템이 자동으로 감지하고 개선하여, 사용자에게 항상 고품질의 가이드를 제공할 수 있습니다! 🚀
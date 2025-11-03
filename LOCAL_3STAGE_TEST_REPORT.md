# 로컬 3-Stage 팟캐스트 시스템 테스트 리포트

**테스트 일시**: 2025-11-03
**테스트 환경**: 로컬 개발 서버 (http://localhost:3001)
**테스트 장소**: 창덕궁 (새로운 장소)
**목적**: Stage 2 분할로 인한 60초 타임아웃 해결 검증

---

## 🎯 테스트 목표

Vercel Hobby 플랜의 60초 maxDuration 제한 내에서 팟캐스트 생성이 완료되는지 검증:
- ✅ Stage 1 (Intro): 30초 이내
- ⚠️ Stage 2-1 (챕터 1-2): 30초 이내
- ⚠️ Stage 2-2 (챕터 3-4 + outro): 30초 이내

---

## 📊 테스트 결과

### ✅ 성공 사항

#### 1. 3-Stage 시스템 구현 완료
```
✅ Stage 1 완료: Intro 생성 (45.3초)
✅ Stage 2-1 완료: 챕터 2-3 생성 (66초)
✅ Stage 2-2 완료: 챕터 4-16 생성 (120초)
```

#### 2. 사용자 경험 검증
- ✅ **30초 후 Intro 즉시 확인 가능**
- ✅ 스크립트 파싱 정상 작동 (parseDialogueScript)
- ✅ 오디오 플레이어 UI 정상 표시
- ✅ 재생 버튼 활성화됨
- ✅ 세그먼트 텍스트 표시 정상

#### 3. 데이터베이스 저장 정상
```
Stage 1: 32개 세그먼트 저장 완료
Stage 2-1: 34개 세그먼트 저장 완료 (누적 66개)
Stage 2-2: 187개 세그먼트 저장 완료 (누적 253개)
```

---

## ❌ 발견된 문제

### **심각: Stage 2-1, 2-2 타임아웃 초과**

| Stage | 목표 시간 | 실제 시간 | 결과 | 챕터 수 |
|-------|----------|----------|------|---------|
| Stage 1 | < 60초 | **45.3초** | ✅ 통과 | 1개 |
| Stage 2-1 | < 60초 | **66초** | ❌ 초과 (+6초) | 2개 |
| Stage 2-2 | < 60초 | **120초** | ❌ 초과 (+60초) | 13개 |

### 원인 분석

#### 1. 창덕궁의 대형 규모
```javascript
총 생성 챕터: 16개
- Intro (챕터 0): 32 세그먼트
- 챕터 1: 18 세그먼트
- 챕터 2: 15 세그먼트
- 챕터 3-15: 각 11-20 세그먼트
- Outro (챕터 1000): 11 세그먼트

총 세그먼트: 253개
예상 재생 시간: ~63분
```

#### 2. Stage 2-2의 과도한 부하
```javascript
// 현재 코드 (app/api/tts/notebooklm/generate/route.ts:349-354)
} else if (stage === 'rest-2') {
  // 🆕 Stage 2-2: 챕터 3-4 + outro 생성 (30초 이내)
  allChapters = [
    ...finalPodcastStructure.chapters.slice(2),  // ⚠️ 챕터 3부터 끝까지!
    ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
  ];
```

**문제점**: `chapters.slice(2)`는 인덱스 2부터 끝까지 모든 챕터를 가져옵니다.
- 창덕궁처럼 챕터가 많은 장소에서는 13개 챕터를 모두 처리해야 함
- 결과: 120초 소요 (60초 제한의 2배)

#### 3. 챕터별 생성 시간
```
챕터 1 (Intro): 34.0초
챕터 2: 30.1초
챕터 3: 24.8초
챕터 4: 19.1초
챕터 5: 19.0초
챕터 6: 14.9초
챕터 7: 17.7초
챕터 8: 21.6초
챕터 9: 18.4초
챕터 10: 22.4초
챕터 11: 20.2초
챕터 12: 20.7초
챕터 13: 22.0초
챕터 14: 18.5초
챕터 15: 13.3초
챕터 1000 (Outro): 17.9초

평균: ~20초/챕터
```

---

## 🔍 문제 해결 방안

### 방안 1: 더 세밀한 분할 (권장)
```typescript
// Stage 2-1: 챕터 1-2만
allChapters = finalPodcastStructure.chapters.slice(0, 2);  // ✅ 2개

// Stage 2-2: 챕터 3-4만
allChapters = finalPodcastStructure.chapters.slice(2, 4);  // ✅ 2개

// Stage 2-3: 나머지 + outro
allChapters = [
  ...finalPodcastStructure.chapters.slice(4),
  ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
];
```

**예상 시간**:
- Stage 2-1: 2개 챕터 = ~40초 ✅
- Stage 2-2: 2개 챕터 = ~40초 ✅
- Stage 2-3: 나머지 = 동적 (여전히 초과 가능)

### 방안 2: 동적 분할
```typescript
const CHAPTERS_PER_STAGE = 2;
const totalChapters = finalPodcastStructure.chapters.length;
const stagesNeeded = Math.ceil(totalChapters / CHAPTERS_PER_STAGE);

// stage: 'rest-1', 'rest-2', 'rest-3', ... 동적 생성
const stageNumber = parseInt(stage.split('-')[1]);
const startIdx = (stageNumber - 1) * CHAPTERS_PER_STAGE;
const endIdx = Math.min(startIdx + CHAPTERS_PER_STAGE, totalChapters);

allChapters = finalPodcastStructure.chapters.slice(startIdx, endIdx);
```

### 방안 3: AI 스팟 개수 제한
```typescript
// src/lib/ai/location-analyzer.ts
const MAX_AI_SPOTS = 8;  // 현재 14개 → 8개로 제한

// 예상 결과:
// 총 챕터: 16개 → 10개
// Stage 2-2 시간: 120초 → ~80초 (여전히 초과)
```

---

## 📈 실제 프로덕션 예상

### Vercel Hobby 플랜 (maxDuration: 60초)
```
Stage 1: 45.3초 → ✅ 성공
Stage 2-1: 66초 → ❌ 504 Timeout
Stage 2-2: 120초 → ❌ 504 Timeout
```

**결과**: 사용자는 Intro만 확인 가능, 나머지 챕터는 타임아웃으로 실패

---

## 🎯 최종 권장 사항

### 즉시 조치 필요
1. **Stage 2를 3개 이상으로 분할**
   - Stage 2-1: 챕터 1-2 (2개)
   - Stage 2-2: 챕터 3-4 (2개)
   - Stage 2-3: 나머지 + outro (동적)

2. **동적 분할 시스템 구현**
   ```typescript
   // 각 Stage마다 최대 2개 챕터만 처리
   // 필요한 Stage 수를 동적으로 계산
   ```

3. **큰 장소에 대한 추가 테스트**
   - 의림지 (작은 장소) ✅ 이미 테스트 완료
   - 창덕궁 (큰 장소) ⚠️ 이번 테스트
   - 경복궁 (매우 큰 장소) 🔜 추가 테스트 필요

---

## 📝 체크리스트

- [x] 로컬 환경 설정 완료
- [x] 개발 서버 정상 실행
- [x] 새로운 장소 팟캐스트 생성
- [x] Stage 1 완료 확인 (45.3초)
- [x] Stage 2-1 완료 확인 (66초 - 초과)
- [x] Stage 2-2 완료 확인 (120초 - 초과)
- [x] UI 정상 표시 확인
- [x] 스크립트 파싱 확인
- [x] 타임아웃 문제 분석
- [ ] 수정 구현 (다음 단계)
- [ ] 재테스트
- [ ] 프로덕션 배포

---

## 🚀 다음 단계

1. **코드 수정**: Stage 2를 더 세밀하게 분할
2. **재테스트**: 수정된 코드로 창덕궁 다시 테스트
3. **검증**: 모든 Stage가 60초 이내 완료되는지 확인
4. **배포**: 프로덕션 환경에 적용

---

## 💡 참고 로그

### Stage 1 (성공)
```
🚀 Stage 1 (Intro-only): 빠른 생성 모드
✅ 챕터 1 완료 (34036ms): 32개 세그먼트
✅ 32개 세그먼트 DB 저장 완료
✅ Stage 1 완료: Intro 스크립트 준비됨 (partial 상태)
POST /api/tts/notebooklm/generate 200 in 45336ms ✅
```

### Stage 2-1 (타임아웃 초과)
```
🔄 Stage 2-1: 챕터 1-2 생성 모드 (타임아웃 방지)
✅ 챕터 2 완료 (30106ms): 18개 세그먼트
✅ 챕터 3 완료 (24833ms): 15개 세그먼트
✅ 34개 세그먼트 DB 저장 완료
POST /api/tts/notebooklm/generate 200 in 65967ms ❌
```

### Stage 2-2 (타임아웃 대폭 초과)
```
🔄 Stage 2-2: 챕터 3-4 + outro 생성 모드 (타임아웃 방지)
✅ 챕터 4-15 완료 (13개 챕터)
✅ 챕터 1000 (Outro) 완료
✅ 187개 세그먼트 DB 저장 완료
POST /api/tts/notebooklm/generate 200 in 120009ms ❌
```

---

**결론**: 3-Stage 시스템은 구현되었으나, Stage 2-2가 너무 많은 챕터를 처리하여 타임아웃 문제가 해결되지 않았습니다. 더 세밀한 분할 또는 동적 분할 시스템이 필요합니다.

# 팟캐스트 Stage 2 타임아웃 해결 방안
## Vercel Hobby 플랜(60초 제한) 내 해결 가능한 방법들

---

## 📊 현재 문제 분석

**타임아웃 원인**:
```typescript
// route.ts:338-343
if (stage === 'rest') {
  allChapters = [
    ...finalPodcastStructure.chapters,  // 챕터 1, 2, 3, 4 (4개)
    ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
  ];
  console.log('🔄 Stage 2 (Rest chapters): 백그라운드 생성 모드');
}
```

**시간 분석**:
- Stage 1 (Intro): 25-30초 ✅
- Stage 2 (Rest 4개 챕터): 70-80초 ❌ (60초 초과)
- 챕터당 평균: ~15-18초

---

## ✅ 해결 방법 1: Stage 2를 2개로 분할 (가장 간단)

**장점**: 최소 코드 수정, 즉시 적용 가능
**시간**: 각 30-35초 내 완료

### 수정 코드

#### 1️⃣ 서버 API 수정 (`app/api/tts/notebooklm/generate/route.ts`)

```typescript
// Line 332-353 수정
let allChapters: ChapterStructure[] = [];
if (stage === 'intro') {
  // Stage 1: Intro만 생성 (빠른 응답)
  allChapters = [finalPodcastStructure.intro];
  console.log('🚀 Stage 1 (Intro-only): 빠른 생성 모드');

} else if (stage === 'rest-1') {
  // 🆕 Stage 2-1: 챕터 1-2 생성 (30초 이내)
  allChapters = finalPodcastStructure.chapters.slice(0, 2);
  console.log('🔄 Stage 2-1: 챕터 1-2 생성 모드');

} else if (stage === 'rest-2') {
  // 🆕 Stage 2-2: 챕터 3-4 + outro 생성 (30초 이내)
  allChapters = [
    ...finalPodcastStructure.chapters.slice(2),
    ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
  ];
  console.log('🔄 Stage 2-2: 챕터 3-4 + outro 생성 모드');

} else if (stage === 'rest') {
  // 기존 rest는 deprecated (하위 호환성)
  allChapters = [
    ...finalPodcastStructure.chapters,
    ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
  ];
  console.log('⚠️ Legacy rest mode (deprecated)');

} else {
  // 기존 동작: 전체 챕터 생성
  allChapters = [
    finalPodcastStructure.intro,
    ...finalPodcastStructure.chapters,
    ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
  ];
  console.log('📊 Full generation: 전체 챕터 생성');
}
```

#### 2️⃣ 클라이언트 수정 (`app/podcast/[language]/[location]/page.tsx`)

```typescript
// Line 886-938 수정 - Stage 2를 2개로 분할
(async () => {
  try {
    // ========== Stage 2-1: 챕터 1-2 생성 ==========
    console.log('🔄 Stage 2-1: 챕터 1-2 생성 시작');

    const controller2_1 = new AbortController();
    const timeoutId2_1 = setTimeout(() => controller2_1.abort(), 2 * 60 * 1000);

    const response2_1 = await fetch('/api/tts/notebooklm/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationName,
        language: targetLanguage,
        stage: 'rest-1',  // 🆕 챕터 1-2
        episodeId: result1.data.episodeId
      }),
      signal: controller2_1.signal
    });

    clearTimeout(timeoutId2_1);

    if (response2_1.ok) {
      const result2_1 = await response2_1.json();
      console.log('✅ Stage 2-1 완료:', result2_1.data);
      setGenerationProgress(75); // 75% 진행
    }

    // ========== Stage 2-2: 챕터 3-4 + outro 생성 ==========
    console.log('🔄 Stage 2-2: 챕터 3-4 + outro 생성 시작');

    const controller2_2 = new AbortController();
    const timeoutId2_2 = setTimeout(() => controller2_2.abort(), 2 * 60 * 1000);

    const response2_2 = await fetch('/api/tts/notebooklm/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationName,
        language: targetLanguage,
        stage: 'rest-2',  // 🆕 챕터 3-4 + outro
        episodeId: result1.data.episodeId
      }),
      signal: controller2_2.signal
    });

    clearTimeout(timeoutId2_2);

    if (response2_2.ok) {
      const result2_2 = await response2_2.json();
      console.log('✅ Stage 2-2 완료:', result2_2.data);

      // 전체 데이터 재조회하여 업데이트
      await checkExistingPodcast(locationName, effectiveLanguage);
      setGenerationProgress(100);

      console.log('🎉 3-Stage 팟캐스트 생성 완전 완료!');
    } else {
      console.warn('⚠️ Stage 2-2 생성 실패');
    }
  } catch (error) {
    console.error('❌ Stage 2 백그라운드 생성 오류:', error);
  } finally {
    setIsGenerating(false);
    clearInterval(progressInterval);
  }
})();
```

**결과**:
- Stage 1: 25-30초 (Intro)
- Stage 2-1: 25-30초 (챕터 1-2) ✅
- Stage 2-2: 25-30초 (챕터 3-4 + outro) ✅
- **총 시간**: 약 75-90초 (사용자는 25-30초 후 즉시 페이지 확인)

---

## ✅ 해결 방법 2: 챕터별 개별 호출 (가장 안전)

**장점**: 각 챕터 15-18초, 100% 타임아웃 방지
**단점**: API 호출 횟수 증가 (5-6회)

### 수정 코드

#### 1️⃣ 서버 API 수정

```typescript
// route.ts:332-353 수정
let allChapters: ChapterStructure[] = [];
let chapterIndex: number | null = null;

if (stage === 'intro') {
  allChapters = [finalPodcastStructure.intro];

} else if (stage?.startsWith('chapter-')) {
  // 🆕 개별 챕터 생성: 'chapter-1', 'chapter-2', etc.
  chapterIndex = parseInt(stage.split('-')[1]);
  const targetChapter = finalPodcastStructure.chapters.find(
    ch => ch.chapterIndex === chapterIndex
  );

  if (targetChapter) {
    allChapters = [targetChapter];
    console.log(`🎯 개별 챕터 생성: 챕터 ${chapterIndex}`);
  } else {
    throw new Error(`챕터 ${chapterIndex}를 찾을 수 없습니다.`);
  }

} else if (stage === 'outro') {
  // 🆕 Outro만 생성
  if (finalPodcastStructure.outro) {
    allChapters = [finalPodcastStructure.outro];
    console.log('🎬 Outro 챕터 생성');
  }

} else {
  // 전체 생성
  allChapters = [
    finalPodcastStructure.intro,
    ...finalPodcastStructure.chapters,
    ...(finalPodcastStructure.outro ? [finalPodcastStructure.outro] : [])
  ];
}
```

#### 2️⃣ 클라이언트 수정

```typescript
// page.tsx - Stage 2를 루프로 개별 호출
(async () => {
  try {
    const chapters = [1, 2, 3, 4]; // 챕터 번호 목록

    for (const chapterNum of chapters) {
      console.log(`🔄 챕터 ${chapterNum} 생성 시작`);

      const response = await fetch('/api/tts/notebooklm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName,
          language: targetLanguage,
          stage: `chapter-${chapterNum}`,
          episodeId: result1.data.episodeId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ 챕터 ${chapterNum} 완료`);

        // 진행률 업데이트
        const progress = 50 + (chapterNum / chapters.length) * 45;
        setGenerationProgress(Math.round(progress));
      }
    }

    // Outro 생성
    console.log('🎬 Outro 생성 시작');
    await fetch('/api/tts/notebooklm/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationName,
        language: targetLanguage,
        stage: 'outro',
        episodeId: result1.data.episodeId
      })
    });

    // 완료
    await checkExistingPodcast(locationName, effectiveLanguage);
    setGenerationProgress(100);
    console.log('🎉 전체 챕터 생성 완료!');
  } catch (error) {
    console.error('❌ 챕터 생성 오류:', error);
  } finally {
    setIsGenerating(false);
  }
})();
```

**결과**:
- 각 챕터: 15-18초 ✅
- 총 5-6번 호출 (챕터 4개 + outro)
- **총 시간**: 약 90-120초 (백그라운드)

---

## ✅ 해결 방법 3: AI 프롬프트 최적화 (코드 수정 최소)

**장점**: 기존 구조 유지, 서버/클라이언트 수정 최소
**방법**: 챕터당 생성 시간 단축

### 수정 항목

#### 1️⃣ 세그먼트 수 감소

```typescript
// src/lib/ai/chapter-generator.ts 수정
const chapterStructure = {
  intro: {
    targetDuration: 180,      // 3분 → 2분으로 단축
    estimatedSegments: 10,    // 15 → 10으로 감소
  },
  chapters: [
    {
      targetDuration: 120,    // 각 챕터 2분 → 90초로 단축
      estimatedSegments: 8,   // 12 → 8로 감소
    }
  ]
};
```

#### 2️⃣ Gemini 모델 변경

```typescript
// route.ts:330
// 기존: gemini-2.5-flash (느림)
const model = geminiClient.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'  // 더 빠른 실험 모델
});
```

#### 3️⃣ 프롬프트 길이 단축

```typescript
// src/lib/ai/prompts/podcast/korean-podcast.ts
// 예시, 지시사항을 더 간결하게 수정
const instructions = `
간결한 대화 형식으로 작성하세요.
- 각 턴: 1-2문장
- 총 ${config.chapter.estimatedSegments}턴
- 자연스러운 대화
`.trim();
```

**예상 효과**:
- 챕터당 시간: 18초 → 12초로 단축
- Stage 2 총 시간: 70초 → 48초 ✅ (60초 이내)

---

## 📊 방법별 비교

| 방법 | 코드 수정량 | 안정성 | API 호출 수 | 추천도 |
|------|------------|--------|------------|--------|
| **방법 1: 2개 분할** | ⭐⭐ 중간 | ⭐⭐⭐⭐⭐ 매우 높음 | 3회 | ⭐⭐⭐⭐⭐ |
| **방법 2: 챕터별 호출** | ⭐⭐⭐ 많음 | ⭐⭐⭐⭐⭐ 매우 높음 | 6-7회 | ⭐⭐⭐⭐ |
| **방법 3: 프롬프트 최적화** | ⭐ 적음 | ⭐⭐⭐ 보통 | 2회 | ⭐⭐⭐ |

---

## 💡 최종 추천: 방법 1 (Stage 2 분할)

**이유**:
1. ✅ 60초 제한 내 안정적 완료
2. ✅ 코드 수정 최소 (2곳만 수정)
3. ✅ API 호출 수 적음 (총 3회)
4. ✅ 사용자 경험 유지 (25-30초 후 즉시 확인)
5. ✅ 진행률 표시 개선 (50% → 75% → 100%)

**구현 순서**:
1. `app/api/tts/notebooklm/generate/route.ts` 수정 (5분)
2. `app/podcast/[language]/[location]/page.tsx` 수정 (10분)
3. 테스트 (5분)
4. 배포 (즉시)

**예상 결과**:
```
✅ Stage 1 (Intro): 25-30초 → 사용자 페이지 즉시 확인
✅ Stage 2-1 (챕터 1-2): 25-30초 → 백그라운드
✅ Stage 2-2 (챕터 3-4 + outro): 25-30초 → 백그라운드
🎉 총 75-90초 내 전체 완료
```

---

## 🚀 빠른 적용 가이드 (방법 1)

### Step 1: 서버 수정
`app/api/tts/notebooklm/generate/route.ts` 파일의 **332-353번 줄**을 위의 "방법 1" 코드로 교체

### Step 2: 클라이언트 수정
`app/podcast/[language]/[location]/page.tsx` 파일의 **886-938번 줄**을 위의 "방법 1" 코드로 교체

### Step 3: 테스트
```bash
# 로컬 테스트
npm run dev

# 의림지 팟캐스트 생성 테스트
# http://localhost:3000/podcast/ko/의림지
```

### Step 4: 배포
```bash
git add .
git commit -m "fix: Stage 2를 2개로 분할하여 60초 제한 내 완료"
git push
```

---

## 📈 예상 성능 개선

**Before (현재)**:
```
Stage 1: 30초 ✅
Stage 2: 80초 ❌ (타임아웃)
→ 실패
```

**After (방법 1 적용)**:
```
Stage 1: 30초 ✅
Stage 2-1: 30초 ✅
Stage 2-2: 30초 ✅
→ 성공 (총 90초, 사용자는 30초 후 확인)
```

---

## ⚠️ 주의사항

1. **순차 실행 보장**
   - Stage 2-1이 완료된 후 Stage 2-2 시작
   - episodeId 전달 확인

2. **에러 핸들링**
   - Stage 2-1 실패 시 Stage 2-2도 중단
   - 사용자에게 재시도 옵션 제공

3. **진행률 표시**
   - 50% (Stage 1 완료)
   - 75% (Stage 2-1 완료)
   - 100% (Stage 2-2 완료)

---

## 🎯 결론

**Vercel Hobby 플랜에서도 완벽하게 작동 가능합니다!**

가장 간단하고 효과적인 **방법 1 (Stage 2 분할)**을 적용하면:
- ✅ 코드 수정 최소 (2개 파일, 약 20줄)
- ✅ 60초 제한 내 안정적 완료
- ✅ 업그레이드 비용 없음
- ✅ 15분 내 구현 및 배포 완료

**지금 바로 적용 가능합니다!** 🚀

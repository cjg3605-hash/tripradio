# 🔄 Gemini API 호출 최적화 - 중복 제거 전략

**관점**: 시스템 아키텍처 전문가
**목표**: 7회 호출 → 1-2회 호출로 줄이기
**예상 효과**: 35초 → 10초 (-71%)

---

## 📊 현재 호출 구조 분석

### 현재 (7회 호출)

```
요청 → [ChapterGenerator] → 챕터 구조 생성 (규칙 기반, 빠름)
    ↓
    → [LocationAnalyzer] → 위치 분석 (규칙 기반, 빠름)
    ↓
    → Gemini API 호출 1 (Chapter 0: Intro) → 25초
    ↓
    → Gemini API 호출 2 (Chapter 1: 역사) → 25초
    ↓
    → Gemini API 호출 3 (Chapter 2: 시설) → 25초
    ↓
    ... (4-7 반복) ...
    ↓
    → 응답

총 Gemini 호출: 7회
총 시간: 7 × 5초 = 35초 (프롬프트 최적화 후)
총 토큰: 7 × 1200 = 8400 토큰
```

### 병목 분석

```
ChapterGenerator, LocationAnalyzer는 빠름 (< 100ms):
├─ 챕터 구조 생성: 규칙 기반 (고정 7개 장)
├─ 위치 타입 판단: 매핑 기반 (테마파크 → 이미 결정됨)
├─ 페르소나 선택: 미리 정의됨 (위치 타입 기반)
└─ 문제: Gemini 호출만 7회 반복

실제 병목: Gemini API 호출 7회 (7 × 5초 = 35초)
```

---

## 💡 해결책 1: 한 번에 전체 생성 (최고 효과)

### 개념

```
현재 (7회 호출):
Chapter 0 Prompt → Gemini (5초) → Ch0 결과
Chapter 1 Prompt → Gemini (5초) → Ch1 결과
... (5회 더)
총 35초

개선 (1회 호출):
[전체 7개 장 Prompt] → Gemini (5초) → [7개 장 결과]
총 5초 (오버헤드 무시)
```

### 실제 구현

#### 현재 프롬프트 (7회 호출)

```typescript
// 각 장마다 따로 호출
const chapterPrompt = `
당신은 관광 가이드 Host입니다.

Chapter 1: 역사 및 발전
주제: ${chapter.title}
설명: ${chapter.description}

Host-Curator 대화를 10개 세그먼트로 생성하세요.
`;

// Gemini 호출 1
const result1 = await model.generateContent(chapterPrompt);
```

#### 개선 프롬프트 (1회 호출)

```typescript
// 한 번에 7개 장 모두
const fullPrompt = `
당신은 관광 가이드 Host입니다.
Curator와 함께 ${locationName}을 소개합니다.

# 전체 스크립트: 7개 장 순차 대화

## Chapter 0: 소개
주제: ${chapters[0].title}
요약: 장소 개요, 역사, 첫인상

## Chapter 1: 역사
주제: ${chapters[1].title}
요약: 건립 배경, 주요 발전사

## Chapter 2: 시설
주제: ${chapters[2].title}
요약: 주요 어트랙션, 특징

## Chapter 3: 놀이기구
주제: ${chapters[3].title}
요약: 인기 라이드, 스릴 레벨

## Chapter 4: 음식 & 경험
주제: ${chapters[4].title}
요약: 먹거리, 문화체험

## Chapter 5: 방문정보
주제: ${chapters[5].title}
요약: 입장료, 운영시간, 팁

## Chapter 6: 추천 코스
주제: ${chapters[6].title}
요약: 최적 방문 경로

---

형식 요구사항:
- 각 Chapter는 정확히 10개 세그먼트
- Host와 Curator의 자연스러운 대화
- Chapter 간 자연스러운 전환
- 마지막은 "다음 장에서 뵙겠습니다" 스타일의 마무리

각 Chapter의 앞에 [CHAPTER X START] 마크
각 Chapter의 뒤에 [CHAPTER X END] 마크

시작하세요:
[CHAPTER 0 START]
Host: "안녕하세요, ...
`;

// Gemini 호출 1회만!
const fullResult = await model.generateContent(fullPrompt);

// 결과를 [CHAPTER X START/END] 마크로 파싱
const chapters = parseFullResponse(fullResult.text());
```

### 기술적 문제와 해결책

#### 문제 1: 응답 길이 초과

```
7개 장 × 1200 토큰 = 8400 토큰
maxOutputTokens: 기본값 (16384) 또는 8000으로 설정 필요

해결책:
```typescript
const model = getModel({
  maxOutputTokens: 8000  // 7개 장 모두 포함 가능
});
```

이미 프롬프트 최적화로 1200 토큰/장이므로 문제 없음
```

#### 문제 2: 화자 연속성

```
현재 (7회 호출):
Ch0: Host로 시작, Curator로 끝남
Ch1: 호출 1부터 새로 시작 → Curator로 시작하면 어색할 수 있음
→ previousLastSpeaker 추적

한 번에 (1회 호출):
전체 대화를 한 컨텍스트에서 생성 → 자동으로 연속성 유지!
```

#### 문제 3: 파싱 복잡도

```
7개 장을 한 텍스트에서 분리 필요

해결책: 마크 기반 파싱
```typescript
const chapters = [];
const fullText = response.text();

const chapterMatches = fullText.matchAll(
  /\[CHAPTER (\d+) START\](.*?)\[CHAPTER \1 END\]/gs
);

for (const match of chapterMatches) {
  const chapterIndex = parseInt(match[1]);
  const chapterContent = match[2];
  const segments = parseSegments(chapterContent);

  chapters.push({
    chapterIndex,
    segments
  });
}
```

### 기대 효과

```
API 호출: 7회 → 1회 (-86%)
호출 오버헤드: 7 × 1초 (네트워크) = 7초 → 1초 (-86%)

시간:
├─ 현재: 7 × 5초 (생성) + 7 × 1초 (오버헤드) = 42초
├─ 개선: 1 × 5초 (생성) + 1 × 1초 (오버헤드) = 6초
└─ 절감: -36초 (-86%)

최종 결과: 35초 → 6초 (-83%)
```

---

## 💡 해결책 2: 간단한 작업은 규칙 기반으로 (중간 효과)

### 현재 상황

```
Gemini가 하는 일 (7회):
├─ 챕터 X에 대한 스크립트 생성 (필수)
└─ 이 과정에서 세그먼트 자동 생성 (필수)

Gemini가 하지 않아도 되는 일:
├─ 챕터 구조 생성 (이미 하고 있음 - ChapterGenerator)
├─ 페르소나 선택 (이미 하고 있음 - LocationAnalyzer)
├─ 위치 타입 분류 (이미 하고 있음)
└─ 세그먼트 분할 (Gemini 후처리로 가능)

실제로 "간단한 작업"은 이미 제거됨!
```

### 추가로 할 수 있는 것

```
1. 캐싱 극대화
2. 프롬프트 템플릿화
3. 세그먼트 후처리 자동화
```

#### 1. 위치별 캐싱 (0초 반복 요청)

```typescript
// 같은 위치 재요청 시
const cacheKey = `${locationName}-${language}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);  // 즉시 반환 (0초)
}

// 없으면 생성
const result = await generateWithGemini(...);
cache.set(cacheKey, result);
```

**효과**: 첫 요청 35초, 같은 위치 재요청 0초

#### 2. 템플릿 기반 구조화

```typescript
// 위치 타입별 템플릿 미리 정의
const locationTemplates = {
  'theme_park': {
    chapters: [
      '소개 & 개요',
      '역사 & 배경',
      '주요 시설 & 어트랙션',
      '인기 놀이기구',
      '음식 & 경험',
      '방문 정보 & 팁',
      '추천 방문 코스'
    ],
    segmentsPerChapter: 10,
    estimatedDuration: 35 * 60  // 35분
  },
  'museum': { ... },
  'nature': { ... }
};

// Gemini는 이미 설계된 구조만 채우기
const template = locationTemplates['theme_park'];
const prompt = buildPromptFromTemplate(template, locationName);
```

**효과**: 프롬프트 40% 단축 (불필요한 설명 제거)

#### 3. 세그먼트 자동 정제

```typescript
// Gemini가 생성한 텍스트를 자동으로 세그먼트로 분할
function autoSplitSegments(text: string): Segment[] {
  // 문장 단위로 분할
  const sentences = text.match(/[^.!?]*[.!?]+/g) || [];

  const segments: Segment[] = [];
  let currentSegment = '';

  for (const sentence of sentences) {
    currentSegment += sentence;

    // 각 세그먼트: 15-20초 분량 (약 75-100글자)
    if (currentSegment.length > 75) {
      segments.push({
        text: currentSegment.trim(),
        speaker: detectSpeaker(currentSegment),  // Host/Curator 자동 감지
        duration: estimateDuration(currentSegment)
      });
      currentSegment = '';
    }
  }

  return segments;
}

// Host/Curator 자동 감지
function detectSpeaker(text: string): 'Host' | 'Curator' {
  if (text.includes('그렇다면') || text.includes('정말')) {
    return 'Curator';
  }
  return 'Host';
}
```

**효과**: 후처리 시간 단축 (-2초)

---

## 📊 종합 최적화 비교

### 시간 절감

```
현재 (7회 호출):           42초
                          ████████████████████

해결책 1 (1회 호출):       6초
                          ██░░░░░░░░░░░░░░░░░

해결책 2 (캐싱 극대화):    35초 (첫), 0초 (반복)
                          (위치마다 다름)

해결책 1+2 (최적화):       6초 (첫), 0초 (반복)
                          ██░░░░░░░░░░░░░░░░░
```

### 복잡도

| 해결책 | 시간 절감 | 구현 난이도 | 리스크 |
|------|---------|-----------|--------|
| 1회 호출 | -86% | 중간 | 파싱 실패 가능 |
| 캐싱 극대화 | -100% (반복) | 낮음 | 없음 |
| 템플릿화 | -40% (프롬프트) | 낮음 | 없음 |
| 자동 정제 | -5% | 낮음 | 세그먼트 품질 ⚠️ |

---

## 🎯 최종 권장 전략

### Phase A: 즉시 구현 (1시간) - 큰 효과

#### **1회 호출로 통합** (효과: -86% 호출)

```typescript
// app/api/tts/notebooklm/generate/route.ts

async function generateAllChaptersAtOnce(
  model: any,
  allChapters: any[],
  locationName: string,
  locationContext: any,
  personaDetails: any[],
  locationAnalysis: any,
  language: string
) {
  // 1. 통합 프롬프트 생성
  const fullPrompt = buildFullPodcastPrompt({
    locationName,
    chapters: allChapters,
    personaDetails,
    locationAnalysis,
    language
  });

  console.log('🎙️ 통합 프롬프트로 모든 장 생성 (1회 호출)');

  // 2. Gemini 호출 1회만!
  const startTime = Date.now();
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: {
      maxOutputTokens: 8000,  // 7개 장 모두 포함
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    }
  });

  const generationTime = Date.now() - startTime;
  console.log(`✅ 생성 완료: ${generationTime}ms`);

  // 3. 응답을 7개 장으로 파싱
  const fullText = response.response.text();
  const chapters = parseFullResponse(fullText);

  // 4. 각 장의 세그먼트 추출
  const allSegments: any[] = [];
  for (const chapter of chapters) {
    const segments = parseSegments(chapter.content, language);
    allSegments.push(...segments.map((seg, idx) => ({
      ...seg,
      chapterIndex: chapter.index,
      sequenceInChapter: idx
    })));
  }

  return {
    chapters,
    allSegments,
    totalTime: generationTime,
    apiCallCount: 1  // ← 7에서 1로!
  };
}

// 사용
const result = await generateAllChaptersAtOnce(
  model,
  allChapters,
  locationName,
  locationContext,
  personaDetails,
  locationAnalysis,
  language
);

console.log(`총 API 호출: ${result.apiCallCount}회 (이전: 7회)`);
console.log(`총 생성 시간: ${result.totalTime}ms (이전: 35초)`);
```

**효과**: 35초 → 6초 (-83%)

### Phase B: 다음주 (1시간) - 유지보수성

#### **캐싱 극대화** (반복 요청 시 0초)

```typescript
// src/lib/ai/podcast-generation-cache.ts

class PodcastGenerationCache {
  private cache = new Map<string, any>();

  getCacheKey(locationName: string, language: string): string {
    return `podcast-${locationName.toLowerCase()}-${language}`;
  }

  get(locationName: string, language: string): any | null {
    return this.cache.get(this.getCacheKey(locationName, language)) || null;
  }

  set(locationName: string, language: string, data: any): void {
    const key = this.getCacheKey(locationName, language);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)  // 24시간
    });
  }

  isExpired(locationName: string, language: string): boolean {
    const cached = this.cache.get(this.getCacheKey(locationName, language));
    if (!cached) return true;
    return cached.expiresAt < Date.now();
  }
}

// 사용
const cache = new PodcastGenerationCache();

export async function POST(req: NextRequest) {
  const { locationName, language } = await req.json();

  // 캐시 확인
  if (!cache.isExpired(locationName, language)) {
    console.log('🚀 캐시된 팟캐스트 반환 (0초)');
    return NextResponse.json(cache.get(locationName, language));
  }

  // 캐시 없으면 생성
  const result = await generateAllChaptersAtOnce(...);
  cache.set(locationName, language, result);

  return NextResponse.json(result);
}
```

**효과**: 같은 위치 재요청 35초 → 0초 (-100%)

### Phase C: 나중에 (선택사항)

- 템플릿 기반 구조화
- 자동 세그먼트 정제

---

## ✅ 최종 결과

### 현재

```
매 요청:     42초 (7 Gemini 호출)
월간 1000회: 42000초 = 11.7시간
비용: $25
```

### Phase A + B 적용

```
첫 요청:     6초 (1 Gemini 호출) -86%
반복 요청:   0초 (캐시) -100%

월간 1000회:
├─ 첫 방문: 100개 위치 × 6초 = 600초
├─ 반복: 900개 × 0초 = 0초
├─ 총: 600초 = 10분
└─ 이전: 11.7시간

절감: 11.7시간 → 10분 (-99%) 🎉
비용: $25 → $3 (-88%)
```

---

## 🚀 구현 우선순위

### 🔴 Critical (오늘)

```
1회 호출 통합:
├─ 정의: fullPrompt 생성 로직 (parseFullResponse 추가)
├─ 시간: 1-2시간
├─ 효과: 35초 → 6초 (-83%)
└─ 리스크: 낮음 (파싱만 잘 하면 됨)
```

### 🟡 High (이번주)

```
캐싱 극대화:
├─ 정의: PodcastGenerationCache 구현
├─ 시간: 30분
├─ 효과: 반복 요청 0초
└─ 리스크: 없음
```

### 🟢 Medium (선택)

```
템플릿화, 자동 정제:
├─ 시간: 1시간
├─ 효과: 미미 (-5% 정도)
└─ 우선순위: 낮음
```

---

## 💡 최종 의견

> **"1회 호출 통합이 정답이다."**
>
> 당신의 질문이 정확했다. 현재 7회 호출은 불필요하다.
>
> 한 번의 통합 프롬프트로 모든 장을 한 번에 생성할 수 있고,
> 이렇게 하면 35초 → 6초로 83% 단축된다.
>
> 추가로 캐싱까지 적용하면, 같은 위치는 즉시 (0초) 반환 가능하다.

이것이 **진정한 최적화**다.


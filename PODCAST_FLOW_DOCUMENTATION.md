# 팟캐스트 플로우 정규화 문서

> **목적**: 팟캐스트 시스템의 정확한 데이터 플로우를 정의하고 프론트엔드/백엔드 구현 스펙을 명확히함

## 📊 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                      팟캐스트 페이지                             │
│         app/podcast/[language]/[location]/page.tsx             │
└─────────────────────────────────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────────┐
    │  1차 플로우: 데이터 로드 및 표시 단계  │
    │        (장소 검색 → DB 조회)          │
    └─────────────────────────────────────────┘
         ↓                    ↓
   [DB에서 발견]        [DB에 없음]
         ↓                    ↓
    [기존 데이터]       [Gemini로 생성]
    파싱 & 표시          저장 & 표시
         ↓                    ↓
    ┌────────────────────────────────────────┐
    │  UI 표시: 오디오플레이어 + 챕터목록   │
    └────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────┐
    │  2차 플로우: 재생 단계                 │
    │   (재생버튼 클릭 → 오디오 확인)       │
    └────────────────────────────────────────┘
         ↓                    ↓
   [파일 있음]          [파일 없음]
         ↓                    ↓
    [순차 재생]         [TTS 생성]
    Segment Loop        전체 오디오 생성
         ↓                    ↓
    ┌────────────────────────────────────────┐
    │  오디오 재생 + 스크립트 동기화         │
    └────────────────────────────────────────┘
```

## 🔄 1차 플로우: 데이터 로드 및 표시

### 1-1. 페이지 진입점

**파일**: `app/podcast/[language]/[location]/page.tsx`

```typescript
// params에서 language와 location 추출
params.language  // 'ko', 'en', 'ja' 등
params.location  // 예: 'colosseum', 'eiffel-tower' (URL 슬러그)
```

**중요**: `params.location`은 사용자가 입력한 원본 지명을 URL 인코딩한 값
- 입력: "콜로세움" → URL: "/ko/podcast/%EC%BD%9C%EB%A1%9C%EC%84%B8%EC%9B%80"
- params.location: "콜로세움" (디코딩됨)

### 1-2. 기존 팟캐스트 조회 (GET)

**엔드포인트**: `GET /api/tts/notebooklm/generate?location=...&language=...`

**요청**:
```javascript
fetch(`/api/tts/notebooklm/generate?location=${encodeURIComponent(location)}&language=${language}`)
```

**서버 처리**:
```typescript
// 1) 슬러그 생성/조회
const slugResult = LocationSlugService.getOrCreateLocationSlug(location, language);
// 결과: { slug: 'colosseum', source: 'database' or 'generated' }

// 2) 슬러그 기반 에피소드 조회
SELECT * FROM podcast_episodes
WHERE location_slug = slugResult.slug
AND language = language
ORDER BY created_at DESC
LIMIT 1;

// 3) Fallback: 입력값 기반 조회
if (not found) {
  SELECT * FROM podcast_episodes
  WHERE location_input = location
  AND language = language
  LIMIT 1;
}
```

**응답 - 에피소드 없음**:
```json
{
  "success": true,
  "data": {
    "hasEpisode": false,
    "message": "기존 팟캐스트가 없습니다."
  }
}
```

**응답 - 에피소드 있음**:
```json
{
  "success": true,
  "data": {
    "episodeId": "uuid-xxx",
    "locationName": "콜로세움",
    "language": "ko",
    "status": "completed",
    "existingEpisode": true,
    "segmentCount": 45,
    "totalDuration": 1350,
    "chapters": [
      {
        "chapterNumber": 0,
        "title": "인트로: 콜로세움 첫 인상",
        "description": "8개 대화",
        "segmentCount": 8,
        "totalDuration": 240,
        "segments": [
          {
            "sequenceNumber": 1,
            "speakerType": "male",
            "audioUrl": "https://.../0-1ko.mp3",
            "duration": 30,
            "textContent": "여러분 안녕하세요!",
            "chapterIndex": 0
          },
          ...
        ]
      },
      {
        "chapterNumber": 1,
        "title": "챕터1: 역사와 건축",
        "segmentCount": 12,
        ...
      }
    ]
  }
}
```

### 1-3. UI 표시 (기존 데이터 있을 때)

**위치**: `page.tsx` lines 780-1053

```typescript
// 1) 첫 번째 세그먼트 자동 로드
episode.segments[0].audioUrl → audioRef.current.src
audioRef.current.load()

// 2) 오디오 플레이어 표시
- 현재 세그먼트 정보 표시 (라인 780-843)
  * 스피커 타입 (male/female)
  * 현재 챕터 제목
  * 현재 진행 시간
  * 텍스트 콘텐츠 (segment.textContent)

// 3) 챕터 목록 표시 (라인 1030-1053)
<ChapterList
  chapters={episode.chapters}
  currentChapterIndex={segment[0].chapterIndex}  // 0 (인트로)
  onChapterSelect={(chapterIndex) => {
    // 해당 챕터의 첫 번째 세그먼트로 점프
    const firstSegmentIndex = segments.findIndex(
      seg => seg.chapterIndex === chapterIndex
    );
    jumpToSegment(firstSegmentIndex);
  }}
/>
```

**표시되는 내용**:
- 챕터 목록에서 인트로(0)는 처음부터 선택된 상태
- 나머지 챕터들(1, 2, ...) 제목 표시
- 각 챕터의 세그먼트 개수 표시

### 1-4. 새 팟캐스트 생성 (POST)

**엔드포인트**: `POST /api/tts/notebooklm/generate`

**요청**:
```javascript
fetch('/api/tts/notebooklm/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    locationName: "콜로세움",
    language: "ko",
    options: {
      priority: 'engagement',
      audienceLevel: 'intermediate',
      podcastStyle: 'educational'
    }
  })
})
```

**서버 처리 (순차)**:

```
Step 0: 중복 확인
├─ LocationSlugService.getOrCreateLocationSlug(locationName, language)
└─ 기존 에피소드 있으면 상태 확인
   ├─ completed: 바로 반환
   └─ generating/failed: 삭제 후 재생성

Step 1: AI 기반 장소 분석
├─ ChapterGenerator.generatePodcastStructure(locationName, language)
├─ 생성 결과:
│  ├─ totalChapters: 4
│  ├─ intro: { chapterIndex: 0, title: "인트로", ... }
│  ├─ chapters: [{ chapterIndex: 1, ... }, ...]
│  └─ locationAnalysis: { culturalSignificance, complexity, ... }

Step 2: 기존 가이드 조회 (선택적)
├─ SELECT * FROM guides WHERE locationname = locationName AND language = language
└─ 있으면: ChapterGenerator에 데이터 제공 (챕터 최적화)

Step 3: 페르소나 준비
├─ selectedPersonas 매핑: [personaId] → [personaDetails]
└─ personaDetails: name, description, expertise, speechStyle, emotionalTone

Step 4: 챕터별 스크립트 생성 (순차)
├─ for each chapter in [intro, chapter1, chapter2, ..., outro]
│  ├─ createPodcastChapterPrompt(config) → Prompt 생성
│  ├─ model.generateContent(prompt) → Gemini 호출
│  ├─ parseDialogueScript(scriptText, language) → 세그먼트 파싱
│  │  └─ 결과: [
│  │      { speaker: 'male', content: '...' },
│  │      { speaker: 'female', content: '...' },
│  │      ...
│  │    ]
│  └─ chapterScript 완성
│
└─ 모든 챕터 스크립트 수집

Step 5: 스크립트 통합
├─ for each chapter in chapterScripts
│  └─ for each segment in chapter.script.segments
│     ├─ sequenceNumber 부여 (1, 2, 3, ...)
│     ├─ chapterIndex 표기
│     └─ allSegments 배열에 추가
│
└─ combinedScript 생성: "[male] 대화...\n[female] 대화...\n"

Step 6: 데이터베이스 저장
├─ INSERT INTO podcast_episodes
│  ├─ id: uuid()
│  ├─ location_slug: "colosseum"
│  ├─ location_input: "콜로세움"
│  ├─ location_names: { ko: "콜로세움", en: "Colosseum", ... }
│  ├─ user_script: combinedScript
│  ├─ language: "ko"
│  ├─ title: "콜로세움 팟캐스트"
│  ├─ status: "script_ready"
│  ├─ chapter_timestamps: [챕터 메타데이터]
│  └─ created_at: now()
│
└─ INSERT INTO podcast_segments (N행)
   ├─ episode_id: episodeId
   ├─ sequence_number: 1, 2, 3, ...
   ├─ speaker_type: "male" or "female"
   ├─ speaker_name: "Host" or "Curator"
   ├─ text_content: "대화 내용"
   ├─ audio_url: NULL (아직 생성 안 됨, "script_ready" 상태)
   ├─ duration_seconds: estimated (30초 기본값)
   ├─ chapter_index: 0, 1, 2, ...
   └─ created_at: now()

Step 7: GET으로 재조회 (CQRS 패턴)
└─ GET /api/tts/notebooklm/generate?location=콜로세움&language=ko
   └─ 저장된 데이터 반환
```

**응답**:
```json
{
  "success": true,
  "data": {
    "episodeId": "uuid-xxx",
    "status": "script_ready",
    "segmentCount": 45,
    "totalDuration": 1350,
    "chapters": [...같은 구조...]
  }
}
```

**중요**: POST 직후 데이터는 `script_ready` 상태
- audio_url: NULL (아직 TTS 생성 안 됨)
- 스크립트만 생성됨 (parseDialogueScript로 세그먼트로 파싱)

---

## 🎵 2차 플로우: 재생 단계

### 2-1. 재생 버튼 클릭

**함수**: `togglePlayPause()` (line 226)

```typescript
// 세그먼트가 없으면 생성 유도
if (!episode?.segments || episode.segments.length === 0) {
  await generatePodcast();
  return;
}

// 현재 세그먼트의 audio_url 확인
const currentSegment = episode.segments[currentSegmentIndex];
if (currentSegment.audioUrl === null) {
  // TTS 생성 필요
  // (자동으로 generateAudio 호출해야 함 - 현재 미구현)
}

// 세그먼트 로드 및 재생
audioRef.current.src = currentSegment.audioUrl;
audioRef.current.load();
audioRef.current.play();
```

### 2-2. 오디오 파일 확인

**경로**: `audio/podcasts/{영어슬러그}/{챕터번호}-{세그먼트번호}{언어코드}.mp3`

**예시**:
```
audio/podcasts/colosseum/0-1ko.mp3    (인트로 첫 세그먼트)
audio/podcasts/colosseum/0-2ko.mp3    (인트로 두 번째 세그먼트)
audio/podcasts/colosseum/1-1ko.mp3    (챕터1 첫 세그먼트)
```

**Supabase 전체 URL**:
```
https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3
```

### 2-3-A. 파일 있는 경우: 순차 재생

**흐름**:
```
1. currentSegmentIndex = 0 (첫 세그먼트)
2. audioRef.current.src = episode.segments[0].audioUrl
3. audioRef.current.play()
4. 현재 시간 업데이트 (timeupdate 이벤트)
   └─ setCurrentTime(audio.currentTime)
   └─ totalElapsedTime 계산
5. 세그먼트 종료 (ended 이벤트)
   └─ currentSegmentIndex++
   └─ loadAndPlaySegment(nextIndex, true)
6. 다음 세그먼트 로드 및 재생
7. ...반복...
8. 마지막 세그먼트 종료
   └─ isPlaying = false
```

**스크립트 동기화**:
```typescript
// 현재 세그먼트의 텍스트 표시 (line 838)
<p className="text-base text-gray-900">
  {episode.segments[currentSegmentIndex].textContent}
</p>
```

**중요**:
- 각 segment는 독립적인 오디오 파일
- sequence 순서대로 재생
- 각 segment 종료 시 다음 segment 자동 로드

### 2-3-B. 파일 없는 경우: TTS 생성

**엔드포인트**: `POST /api/tts/notebooklm/generate-audio`

**요청** (필요한 경우):
```javascript
// 모든 세그먼트에 대해 TTS 생성
fetch('/api/tts/notebooklm/generate-audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    episodeId: episode.episodeId,
    language: language,
    segments: episode.segments  // 모든 세그먼트 배열
  })
})
```

**서버 처리**:
```
for each segment in segments:
  1. TTS 생성: text_content → 오디오 파일
  2. 파일명: {chapterIndex}-{segmentNumber}{languageCode}.mp3
  3. Supabase Storage에 저장
  4. audio_url 업데이트
     UPDATE podcast_segments
     SET audio_url = 'generated_url'
     WHERE id = segment.id
```

**응답**:
```json
{
  "success": true,
  "data": {
    "episodeId": "uuid",
    "generatedCount": 45,
    "status": "completed",
    "segments": [
      {
        "sequenceNumber": 1,
        "audioUrl": "https://.../0-1ko.mp3"
      },
      ...
    ]
  }
}
```

**완료 후**:
- episode.status: "script_ready" → "completed"
- 모든 segment.audioUrl이 유효한 URL로 설정됨
- 자동 재생 시작

---

## 📋 데이터베이스 스키마 정규화

### podcast_episodes 테이블

```sql
CREATE TABLE podcast_episodes (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 위치 정보 (정규화)
  location_slug TEXT NOT NULL,        -- 영어 슬러그: 'colosseum'
  location_input TEXT NOT NULL,       -- 원본 입력: '콜로세움'
  location_names JSONB NOT NULL,      -- 다국어: { ko: '콜로세움', en: 'Colosseum', ... }

  -- 스크립트 및 메타데이터
  user_script TEXT,                   -- 전체 대화 스크립트
  title TEXT,                         -- 에피소드 제목
  language TEXT NOT NULL,             -- 'ko', 'en', 'ja', 'zh', 'es'
  status TEXT NOT NULL DEFAULT 'generating',  -- 'generating', 'script_ready', 'completed', 'failed'

  -- 챕터 메타데이터
  chapter_type TEXT,                  -- 'intro', 'main', 'outro'
  chapter_number INT,                 -- 챕터 순번
  chapter_timestamps JSONB,           -- [{ chapterIndex, title, duration, ... }]

  -- 재생 정보
  total_segments INT,                 -- 총 세그먼트 개수
  total_duration INT,                 -- 총 길이 (초)
  duration_seconds INT,               -- 총 길이 (초, 대체 필드)

  -- 품질 점수
  quality_score NUMERIC DEFAULT 0,    -- 0-100

  -- 저장소 정보
  folder_path TEXT,                   -- 'audio/podcasts/colosseum'
  slug_source TEXT,                   -- 'database' or 'generated'

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  UNIQUE(location_slug, language)
);
```

### podcast_segments 테이블

```sql
CREATE TABLE podcast_segments (
  -- 기본 정보
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,

  -- 시퀀스 정보
  sequence_number INT NOT NULL,       -- 전체 순서: 1, 2, 3, ...
  chapter_index INT NOT NULL,         -- 챕터 번호: 0 (intro), 1, 2, ...

  -- 화자 정보
  speaker_type TEXT NOT NULL,         -- 'male' or 'female'
  speaker_name TEXT,                  -- 'Host' or 'Curator' or 'Expert'

  -- 내용
  text_content TEXT NOT NULL,         -- 대화 내용

  -- 오디오 정보
  audio_url TEXT,                     -- NULL (script_ready) or full_url (completed)
  duration_seconds INT DEFAULT 30,    -- 예상 길이
  duration INT DEFAULT 30,            -- 예상 길이 (대체 필드)

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  INDEX(episode_id, sequence_number),
  INDEX(episode_id, chapter_index)
);
```

---

## 🔍 데이터 흐름 요약

### 1차 플로우 (페이지 진입)

```
입력: params.location ('콜로세움'), params.language ('ko')
  ↓
checkExistingPodcast()
  ├─ GET /api/tts/notebooklm/generate?location=콜로세움&language=ko
  ├─ 응답: hasEpisode=true/false
  │
  ├─ [hasEpisode=true]
  │  └─ episode 객체에 chapters, segments 담아서 페이지 렌더링
  │     ├─ 첫 세그먼트 (segments[0]) 자동 로드
  │     ├─ 오디오플레이어 표시 (현재 세그먼트 정보)
  │     └─ 챕터 목록 표시 (chapter[0] 선택 상태)
  │
  └─ [hasEpisode=false]
     └─ "팟캐스트 생성하기" 버튼 표시
        └─ 클릭 시 generatePodcast()
           ├─ POST /api/tts/notebooklm/generate
           ├─ Gemini 호출 (스크립트 생성)
           ├─ DB 저장 (script_ready 상태)
           ├─ GET으로 재조회 (CQRS)
           └─ 같은 페이지 렌더링 (장소는 이미 표시됨)
```

### 2차 플로우 (재생)

```
사용자: 재생 버튼 클릭
  ↓
togglePlayPause()
  ├─ [segments 없음]
  │  └─ generatePodcast() 호출
  │
  ├─ [audio_url 없음 (script_ready)]
  │  └─ generateAudioFiles() 호출 필요
  │     ├─ POST /api/tts/notebooklm/generate-audio
  │     ├─ 모든 세그먼트의 오디오 생성
  │     ├─ 각 segment.audio_url 업데이트
  │     └─ 재생 시작
  │
  └─ [audio_url 있음 (completed)]
     └─ 순차 재생 시작
        ├─ currentSegmentIndex = 0
        ├─ audioRef.src = segments[0].audioUrl
        ├─ audioRef.play()
        ├─ 스크립트 동기화 (현재 segment.textContent 표시)
        ├─ ended → 다음 세그먼트 로드
        └─ ...반복...
```

---

## ⚠️ 현재 구현의 문제점

### 문제 1: script_ready 상태 처리 미완성
- **현상**: POST 후 audio_url이 NULL (script_ready 상태)
- **예상**: 재생 시 자동으로 TTS 생성
- **현실**: 재생 시 오류 발생 (audio_url이 null)
- **해결**: togglePlayPause()에서 audio_url 확인 로직 필요

### 문제 2: GET 응답에 chapters 정보 누락
- **현상**: GET 응답에 chapters 정보가 없을 수 있음
- **영향**: 챕터 목록이 표시되지 않음
- **원인**: API에서 chapters 응답 필드 확인 필요

### 문제 3: 오디오 URL 생성 로직 불명확
- **현상**: audio_url이 null이거나 부분 경로
- **필요**: 전체 URL 생성 (https://....../audio/podcasts/...)

### 문제 4: 체크포인트 로직 없음
- **현상**: 부분 생성 실패 시 복구 불가
- **예상**: 실패한 세그먼트만 재생성

---

## ✅ 검증 체크리스트

- [ ] GET /api/tts/notebooklm/generate이 chapters 정보 반환
- [ ] POST 후 script_ready 상태인 데이터가 제대로 저장됨
- [ ] page.tsx에서 audio_url 확인 및 TTS 생성 로직 구현
- [ ] 순차 재생 시 segment 순서대로 로드
- [ ] 스크립트 동기화 (currentSegmentIndex ↔ textContent)
- [ ] 재생 완료 후 다음 세그먼트 자동 로드
- [ ] 재생 중 챕터 선택 시 점프 (같은 세그먼트 교체됨)
- [ ] 전체 경과 시간 정확히 계산


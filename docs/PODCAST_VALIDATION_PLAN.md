# 팟캐스트 페이지 검증 계획서

> **생성일**: 2025-01-14
> **목적**: 팟캐스트 페이지에서 오디오 파일 및 챕터 목록이 정상적으로 표시되는지 체계적으로 검증

---

## 1. 시스템 아키텍처 개요

### 1.1 데이터베이스 구조 (1:N 관계)
```
podcast_episodes (1행)
├── id (PK)
├── location_slug (정규화된 영어 슬러그)
├── location_input (사용자 입력값)
├── location_names (JSONB - 다국어 이름)
├── language
├── status ('completed', 'generating', 'failed')
├── user_script (전체 대화 스크립트)
├── duration_seconds
└── chapter_timestamps

podcast_segments (N행)
├── id (PK)
├── episode_id (FK → podcast_episodes.id)
├── sequence_number (1, 2, 3...)
├── speaker_type ('male', 'female')
├── speaker_name ('Host', 'Curator')
├── text_content (대화 내용)
├── audio_url (Supabase Storage URL)
├── duration_seconds
├── duration
└── chapter_index (챕터 번호: 0, 1, 2...)
```

### 1.2 오디오 파일 경로 규칙

#### Supabase Storage 구조
```
bucket: audio
path: podcasts/{영어슬러그}/{챕터번호}-{세그먼트번호}{언어코드}.mp3

예시:
audio/podcasts/colosseum/0-1ko.mp3
audio/podcasts/eiffel-tower/0-2en.mp3
audio/podcasts/gyeongbokgung/1-5ja.mp3
```

#### 전체 URL 형식
```
https://{SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/audio/podcasts/{영어슬러그}/{챕터번호}-{세그먼트번호}{언어코드}.mp3

실제 예시:
https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/eiffel-tower/0-1ko.mp3
```

### 1.3 언어 코드 정규화 규칙

#### 파일명 언어 코드 (2자)
```typescript
ko → ko
en → en
ja → ja
zh → zh
es → es
```

#### TTS 언어 코드 (5자)
```typescript
ko → ko-KR
en → en-US
ja → ja-JP
zh → zh-CN
es → es-ES
```

---

## 2. 데이터 플로우

### 2.1 팟캐스트 생성 플로우
```
1. 사용자 요청 (locationName + language)
   ↓
2. LocationSlugService.getOrCreateLocationSlug()
   → 정규화된 영어 슬러그 생성
   ↓
3. podcast_episodes 테이블 확인
   → 기존 에피소드 있으면 반환
   ↓
4. Gemini AI로 스크립트 생성
   → createPodcastChapterPrompt()
   ↓
5. parseDialogueScript()로 세그먼트 파싱
   → 빈 세그먼트 시 오류 발생
   ↓
6. podcast_episodes에 1행 저장
   ↓
7. SequentialTTSGenerator로 오디오 파일 생성
   → 파일명: {챕터번호}-{세그먼트번호}{언어코드}.mp3
   ↓
8. podcast_segments에 N행 저장
   → audio_url 필드에 전체 URL 저장
```

### 2.2 팟캐스트 재생 플로우
```
1. 페이지 접근: /podcast/[language]/[location]
   ↓
2. GET /api/tts/notebooklm/generate?location={location}&language={language}
   ↓
3. episode + segments 데이터 조회
   ↓
4. 프론트엔드에서 segments 렌더링
   ↓
5. 사용자 재생 버튼 클릭
   ↓
6. checkAudioFileExists()로 파일 확인
   ↓
7. 파일 없음 → /api/tts/notebooklm/generate-audio 호출
   ↓
8. TTS 생성 완료 → 자동 재생
```

---

## 3. 핵심 함수 및 파일

### 3.1 프론트엔드 (페이지)
**파일**: `app/podcast/[language]/[location]/page.tsx`

#### 주요 함수
- `checkExistingPodcast()`: 기존 에피소드 조회 (line 351-593)
- `verifyStorageIntegrity()`: 오디오 파일 무결성 검증 (line 311-349)
- `togglePlayPause()`: 재생/일시정지 (line 203-255)
- `loadAndPlaySegment()`: 세그먼트 로드 및 재생 (line 175-194)

#### 상태 관리
```typescript
episode: PodcastEpisode | null  // 에피소드 데이터
segments: DialogueSegment[]      // 세그먼트 목록
currentSegmentIndex: number      // 현재 재생 중인 세그먼트
```

### 3.2 챕터 목록 컴포넌트
**파일**: `src/components/audio/ChapterList.tsx`

#### Props
```typescript
interface ChapterListProps {
  chapters: ChapterInfo[];           // 챕터 목록
  currentChapterIndex?: number;      // 현재 챕터
  onChapterSelect?: (index) => void; // 챕터 선택 핸들러
}
```

#### 표시 방식
- 챕터 제목을 그대로 표시 (line 59)
- 현재 재생 중인 챕터 강조 (line 47-50)

### 3.3 API 라우트
**파일**: `app/api/tts/notebooklm/generate/route.ts`

#### GET 핸들러 (line 612-924)
- 슬러그 기반 에피소드 조회
- 세그먼트 데이터 조회
- 챕터 구조 생성 (3가지 방법)
  1. chapter_index 기반 그룹화 (line 735-776)
  2. JSON 파싱 fallback (line 779-825)
  3. 스토리지 파일 스캔 (line 829-893)

#### POST 핸들러 (line 114-607)
- 새 팟캐스트 생성
- 병렬 처리로 성능 최적화 (line 300-324)

---

## 4. 검증 목표 및 체크리스트

### 4.1 데이터베이스 레벨
- [ ] `podcast_episodes` 테이블에서 에피소드 조회
- [ ] `podcast_segments` 테이블에서 세그먼트 조회
- [ ] `location_slug` 정규화 확인
- [ ] `audio_url` 필드 형식 검증

### 4.2 스토리지 레벨
- [ ] Supabase Storage에 실제 오디오 파일 존재 확인
- [ ] 파일명 규칙 준수 확인 (`{챕터}-{세그먼트}{언어}.mp3`)
- [ ] 언어 코드 정규화 확인 (2자)

### 4.3 API 레벨
- [ ] GET 요청으로 에피소드 데이터 조회 성공
- [ ] 챕터 구조 정상 반환 확인
- [ ] audio_url이 접근 가능한 URL인지 확인

### 4.4 UI 레벨
- [ ] 팟캐스트 페이지 접근 가능
- [ ] 챕터 목록 정상 렌더링
- [ ] 세그먼트 대화 내용 표시
- [ ] 오디오 플레이어 정상 작동
- [ ] 재생 버튼 클릭 시 오디오 재생

---

## 5. 검증 시나리오

### 시나리오 1: 기존 완성된 팟캐스트 로드
```
1. 데이터베이스에서 completed 상태의 에피소드 선택
2. 해당 에피소드의 location_slug 확인
3. /podcast/ko/{location_slug} 페이지 접근
4. 챕터 목록 표시 확인
5. 첫 번째 세그먼트의 audio_url 확인
6. 오디오 파일 재생 테스트
```

### 시나리오 2: 누락된 오디오 파일 처리
```
1. podcast_segments에는 데이터 있음
2. Supabase Storage에는 파일 없음
3. verifyStorageIntegrity() 호출
4. 누락된 파일 감지
5. /api/podcast/generate-missing 호출
6. TTS 자동 생성
7. 재생 성공 확인
```

### 시나리오 3: 챕터 네비게이션
```
1. 챕터 목록에서 특정 챕터 클릭
2. 해당 챕터의 첫 세그먼트로 이동
3. currentSegmentIndex 업데이트 확인
4. 오디오 소스 변경 확인
5. 재생 시작
```

---

## 6. 검증 도구 및 방법

### 6.1 MCP Chrome DevTools
```typescript
// 페이지 접근 및 스냅샷
mcp__chrome-devtools__navigate_page({
  url: "http://localhost:3000/podcast/ko/eiffel-tower"
})

mcp__chrome-devtools__take_snapshot()

// 네트워크 요청 확인
mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["xhr", "fetch"]
})

// 콘솔 로그 확인
mcp__chrome-devtools__list_console_messages()
```

### 6.2 수동 검증
```bash
# 데이터베이스 직접 쿼리
psql -h db.fajiwgztfwoiisgnnams.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT * FROM podcast_episodes WHERE location_slug='eiffel-tower' LIMIT 1;"

# 오디오 파일 접근 테스트
curl -I "https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/eiffel-tower/0-1ko.mp3"
```

---

## 7. 예상 이슈 및 해결방안

### 이슈 1: 오디오 URL 불일치
**증상**: audio_url이 404 오류
**원인**: 슬러그 정규화 불일치
**해결**: LocationSlugService 확인

### 이슈 2: 챕터 목록 미표시
**증상**: ChapterList 컴포넌트 빈 상태
**원인**: episode.chapters 배열이 비어있음
**해결**: API 응답에서 chapters 데이터 확인

### 이슈 3: 세그먼트 대화 내용 없음
**증상**: textContent가 "대화 내용 로드 중..."
**원인**: DB segments 테이블에서 text_content 누락
**해결**: parseDialogueScript() 함수 확인

---

## 8. 성공 기준

### 정량적 기준
- [ ] 오디오 파일 접근 성공률 100%
- [ ] 챕터 목록 표시율 100%
- [ ] 세그먼트 대화 내용 표시율 100%
- [ ] 재생 성공률 100%

### 정성적 기준
- [ ] 사용자가 팟캐스트 페이지에 접근하면 즉시 챕터 목록을 볼 수 있다
- [ ] 재생 버튼을 누르면 3초 이내에 오디오가 재생된다
- [ ] 챕터를 클릭하면 해당 챕터로 즉시 이동한다
- [ ] 대화 내용이 화면에 동기화되어 표시된다

---

## 9. 다음 단계

1. ✅ 검증 계획 문서 작성 완료
2. ⏳ 실제 팟캐스트 페이지 접근 및 데이터 확인
3. ⏳ 오디오 파일 URL 생성 및 존재 여부 검증
4. ⏳ 챕터 목록 렌더링 검증
5. ⏳ 최종 검증 결과 보고서 작성

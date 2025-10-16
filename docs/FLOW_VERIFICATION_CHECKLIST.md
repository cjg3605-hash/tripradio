# TripRadio.AI 전체 플로우 검증 체크리스트

> **목적**: 가이드 시스템과 팟캐스트 시스템의 전체 사용자 플로우를 검증하고, 각 컴포넌트에서 정확한 데이터가 출력되는지 확인

## 📋 검증 방법론

### 페르소나: QA 엔지니어 + UX 전문가
- **관점**: 실제 사용자 여정 중심
- **검증 기준**: 데이터 정확성, UI 일관성, 플로우 연속성
- **도구**: Chrome DevTools, Playwright MCP

---

## 🎯 Part 1: 가이드 시스템 플로우 검증

### 1.1 홈페이지 → 장소 검색
**URL**: `http://localhost:3000/` (또는 프로덕션 도메인)

**컴포넌트**: `app/page.tsx` → `SearchSection`

**예상 출력**:
- [ ] 검색창 표시: "어디로 떠나시나요?" (한국어)
- [ ] 인기 여행지 카드 표시 (8개)
  - 에펠탑, 콜로세움, 자유의 여신상, 타지마할 등
- [ ] 각 카드에 이미지 + 제목 + 설명

**입력 테스트**:
```
검색어: "콜로세움"
언어: 한국어 (ko)
```

**예상 동작**:
- [ ] 자동완성 제안 표시 (있다면)
- [ ] 엔터 또는 검색 버튼 클릭 시 `/guide/ko/colosseum` 페이지로 이동

---

### 1.2 가이드 생성 페이지
**URL**: `http://localhost:3000/guide/ko/colosseum`

**컴포넌트**: `app/guide/[language]/[location]/page.tsx`

#### 1.2.1 기존 가이드 존재 시 (Completed)
**데이터 소스**: `podcast_episodes` + `podcast_segments` JOIN

**예상 출력**:
- [ ] **헤더 정보**
  - 제목: "콜로세움 - 로마의 영광이 살아 숨쉬는 고대 원형 경기장" (한국어)
  - 위치: 이탈리아, 로마
  - 좌표: 위도 41.8902, 경도 12.4922 (대략)
  - 소요 시간: "약 X분" (duration_seconds 기반)

- [ ] **오디오 플레이어**
  - 첫 번째 세그먼트 오디오 자동 로드
  - 재생/일시정지 버튼
  - 진행 바 (현재 시간 / 전체 시간)
  - 재생 속도 조절 (0.5x, 1x, 1.5x, 2x)
  - 볼륨 조절

- [ ] **스크립트/대본 섹션**
  - 챕터별로 구분 표시
    - 챕터 0: 인트로 (Introduction)
    - 챕터 1-N: 메인 콘텐츠 (역사, 건축, 문화 등)
    - 챕터 999: 아웃트로 (Outro)

  - 각 세그먼트마다:
    - 스피커 아이콘 (남성/여성)
    - 스피커 이름: "Host" (male) 또는 "Curator" (female)
    - 텍스트 내용: `text_content` 필드
    - 현재 재생 중인 세그먼트 하이라이트

- [ ] **지도 표시**
  - Leaflet 지도 렌더링
  - 마커: 콜로세움 위치 (41.8902, 12.4922)
  - 줌 레벨: 15-17

**데이터 검증 포인트**:
```sql
-- DB 쿼리로 확인
SELECT
  e.title,
  e.location_names->>'ko' as location_name_ko,
  e.location_names->>'en' as location_name_en,
  e.duration_seconds,
  e.chapter_timestamps,
  COUNT(s.id) as segment_count
FROM podcast_episodes e
LEFT JOIN podcast_segments s ON s.episode_id = e.id
WHERE e.location_slug = 'colosseum'
  AND e.language = 'ko'
GROUP BY e.id;

-- 세그먼트 순서 확인
SELECT
  sequence_number,
  speaker_type,
  speaker_name,
  chapter_index,
  LEFT(text_content, 50) as text_preview,
  audio_url
FROM podcast_segments
WHERE episode_id = (
  SELECT id FROM podcast_episodes
  WHERE location_slug = 'colosseum' AND language = 'ko'
)
ORDER BY sequence_number ASC
LIMIT 10;
```

#### 1.2.2 기존 가이드 없음 (신규 생성)
**API 엔드포인트**: `POST /api/tts/notebooklm/generate`

**예상 플로우**:
1. [ ] 로딩 인디케이터 표시 ("AI가 가이드를 생성하는 중...")
2. [ ] 진행률 표시 (백엔드 진행률 기반)
3. [ ] 완료 후 자동 새로고침 또는 리디렉션
4. [ ] 생성된 가이드 표시 (1.2.1과 동일)

**예상 생성 시간**: 30-120초 (세그먼트 수에 따라)

**에러 케이스**:
- [ ] 타임아웃 (30초): "생성 시간이 초과되었습니다" 메시지
- [ ] 빈 세그먼트: "유효하지 않은 세그먼트 X개 발견" 오류
- [ ] API 키 없음: "서비스 설정 오류" 메시지

---

### 1.3 언어 전환 테스트
**URL**: `http://localhost:3000/guide/en/colosseum`

**예상 출력**:
- [ ] 영어 제목: "Colosseum - Ancient Roman Amphitheatre"
- [ ] 영어 스크립트 (text_content)
- [ ] 영어 오디오 파일 (`audio/podcasts/colosseum/0-1en.mp3`)
- [ ] 인터페이스 텍스트 영어로 변경

**다국어 지원 확인**:
- [ ] 한국어 (ko)
- [ ] 영어 (en)
- [ ] 일본어 (ja)
- [ ] 중국어 (zh)
- [ ] 스페인어 (es)

---

## 🎙️ Part 2: 팟캐스트 시스템 플로우 검증

### 2.1 팟캐스트 페이지 접근
**URL**: `http://localhost:3000/podcast/ko/eiffel-tower`

**컴포넌트**: `app/podcast/[language]/[location]/page.tsx`

### 2.2 페이지 레이아웃 검증

#### 2.2.1 헤더 섹션
**컴포넌트**: `page.tsx:920-990` (Hero Section)

**예상 출력**:
- [ ] 배경 이미지: 에펠탑 이미지 또는 그라디언트
- [ ] 제목: "에펠탑 오디오 가이드" (한국어)
- [ ] 부제목: "AI가 들려주는 특별한 여행 이야기"
- [ ] 위치 정보: 프랑스, 파리
- [ ] 총 재생 시간: "약 X분"

#### 2.2.2 오디오 플레이어
**컴포넌트**: `page.tsx:993-1061` (Audio Player)

**예상 출력**:
- [ ] **재생 컨트롤**
  - 재생/일시정지 버튼 (큰 원형 버튼)
  - 이전 세그먼트 버튼 (10초 뒤로)
  - 다음 세그먼트 버튼 (10초 앞으로)

- [ ] **진행 바**
  - 현재 시간 표시 (mm:ss)
  - 전체 시간 표시 (mm:ss)
  - 드래그 가능한 슬라이더
  - 버퍼링 표시 (buffered ranges)

- [ ] **추가 컨트롤**
  - 재생 속도: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
  - 볼륨 슬라이더 (0-100%)
  - 음소거 버튼

**상태 검증**:
```typescript
// 예상 상태
currentSegmentIndex: 0 (첫 번째 세그먼트)
isPlaying: false (초기 상태)
currentTime: 0
duration: [세그먼트 duration_seconds]
volume: 1.0
playbackRate: 1.0
isMuted: false
```

#### 2.2.3 챕터 리스트
**컴포넌트**: `src/components/audio/ChapterList.tsx`

**예상 출력**:
- [ ] **챕터 0 (인트로)**
  - 제목: "인트로 - 에펠탑에 오신 것을 환영합니다"
  - 아이콘: 🎬 또는 인트로 아이콘
  - 세그먼트 수: 1-3개
  - 총 시간: "약 Xm Ys"

- [ ] **챕터 1-N (메인 콘텐츠)**
  - 예시 챕터 제목:
    - "역사 - 에펠탑의 탄생"
    - "건축 - 철의 여인의 비밀"
    - "문화 - 파리의 상징이 되다"
  - 각 챕터마다:
    - 챕터 번호 표시
    - 세그먼트 수
    - 총 시간
    - 펼치기/접기 버튼

- [ ] **챕터 999 (아웃트로)**
  - 제목: "아웃트로 - 마무리"
  - 마지막 인사 멘트

**세그먼트 표시**:
- [ ] 각 세그먼트마다:
  - 순서 번호 (1, 2, 3...)
  - 스피커 아이콘 (🎙️ 남성 / 🎤 여성)
  - 스피커 이름: "Host" 또는 "Curator"
  - 재생 시간: "Xm Ys"
  - 현재 재생 중인 세그먼트 하이라이트 (배경색 변경)
  - 클릭 시 해당 세그먼트로 점프

#### 2.2.4 스크립트/대본 섹션
**컴포넌트**: `page.tsx:1063-1120` (Transcript Section)

**예상 출력**:
- [ ] 탭 인터페이스
  - "대본" 탭 (기본 선택)
  - "정보" 탭 (장소 정보)

- [ ] **대본 탭 내용**
  - 챕터별로 그룹화된 스크립트
  - 각 세그먼트마다:
    ```
    [세그먼트 1] Host 🎙️
    "안녕하세요, 여러분! 오늘은 프랑스 파리의 상징, 에펠탑을 함께
    여행해보겠습니다. 324미터 높이의 이 철제 탑은..."

    [세그먼트 2] Curator 🎤
    "에펠탑은 1889년 파리 만국박람회를 위해 건설되었습니다.
    당시에는 많은 논란이 있었죠..."
    ```

  - 현재 재생 중인 세그먼트:
    - 자동 스크롤
    - 하이라이트 표시 (배경색 또는 테두리)
    - 애니메이션 효과 (선택적)

- [ ] **정보 탭 내용**
  - 장소 기본 정보
  - 위치: 좌표 (위도/경도)
  - 국가/도시
  - 총 재생 시간
  - 세그먼트 수
  - 생성 일시

---

### 2.3 오디오 재생 플로우 검증

#### 2.3.1 초기 로드
**예상 동작**:
1. [ ] 페이지 로드 시 첫 번째 세그먼트 오디오 자동 로드
   - `audioRef.current.src = segments[0].audioUrl`
   - `audioRef.current.load()`
2. [ ] 메타데이터 로드 완료 (`onLoadedMetadata`)
   - duration 업데이트
   - 총 재생 시간 표시
3. [ ] 재생 버튼 활성화

**검증 포인트**:
```javascript
// Chrome DevTools Console
console.log('Current audio src:', document.querySelector('audio').src);
// 예상: https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/eiffel-tower/0-1ko.mp3

console.log('Audio duration:', document.querySelector('audio').duration);
// 예상: 숫자 (초 단위)
```

#### 2.3.2 재생 시작
**사용자 액션**: 재생 버튼 클릭

**예상 동작**:
1. [ ] `isPlaying` 상태 변경: false → true
2. [ ] 재생 버튼 아이콘 변경: ▶️ → ⏸️
3. [ ] 오디오 재생 시작 (`audioRef.current.play()`)
4. [ ] 진행 바 업데이트 시작 (매 초마다)
5. [ ] 현재 재생 시간 표시 업데이트

**검증 포인트**:
- [ ] 오디오가 실제로 들림
- [ ] 진행 바가 부드럽게 이동
- [ ] 시간 표시가 정확함 (mm:ss 형식)

#### 2.3.3 세그먼트 전환
**트리거**:
1. 자동 전환: 현재 세그먼트 재생 완료 (`onEnded` 이벤트)
2. 수동 전환: 다음/이전 버튼 클릭 또는 챕터 리스트에서 클릭

**예상 동작**:
1. [ ] 현재 오디오 정지
2. [ ] `currentSegmentIndex` 증가/감소
3. [ ] 새 오디오 URL 로드
   ```javascript
   audioRef.current.src = segments[newIndex].audioUrl;
   audioRef.current.load();
   ```
4. [ ] 자동 재생 (이전에 재생 중이었다면)
5. [ ] 챕터 리스트에서 현재 세그먼트 하이라이트 업데이트
6. [ ] 스크립트 섹션 자동 스크롤

**검증 포인트**:
```javascript
// 예상 동작
// 세그먼트 1 → 세그먼트 2 전환 시
audioRef.current.src:
  "audio/podcasts/eiffel-tower/0-1ko.mp3"
  → "audio/podcasts/eiffel-tower/0-2ko.mp3"
```

#### 2.3.4 오디오 파일 404 처리
**시나리오**: 오디오 파일이 Supabase Storage에 존재하지 않음

**예상 동작**:
1. [ ] `onerror` 이벤트 발생
2. [ ] 자동 TTS 생성 API 호출
   ```javascript
   POST /api/tts/notebooklm/generate-audio
   {
     episodeId: "episode-xxx",
     segmentIndex: 2,
     textContent: "세그먼트 텍스트...",
     speakerType: "male",
     language: "ko",
     chapterIndex: 1
   }
   ```
3. [ ] 로딩 인디케이터 표시: "오디오 생성 중... (30초 소요 예상)"
4. [ ] TTS 생성 완료 후 자동 재생
5. [ ] 생성 실패 시: 에러 메시지 표시 + 다음 세그먼트로 건너뛰기

**현재 상태 확인**:
- ⚠️ `checkAudioFileExists()` 함수 미구현 (검증 결과에서 확인됨)
- ✅ `generate-audio` API 라우트 생성 완료

---

### 2.4 데이터 정확성 검증

#### 2.4.1 DB vs UI 데이터 일치 확인

**DB 쿼리**:
```sql
-- 에피소드 정보
SELECT
  id,
  location_slug,
  location_names,
  title,
  language,
  duration_seconds,
  chapter_timestamps,
  status,
  created_at
FROM podcast_episodes
WHERE location_slug = 'eiffel-tower'
  AND language = 'ko';

-- 세그먼트 정보 (첫 5개)
SELECT
  sequence_number,
  speaker_type,
  speaker_name,
  chapter_index,
  text_content,
  audio_url,
  duration_seconds,
  duration
FROM podcast_segments
WHERE episode_id = '[위에서 조회한 id]'
ORDER BY sequence_number ASC
LIMIT 5;
```

**UI에서 확인**:
1. [ ] **에피소드 제목** = DB `title` 필드
2. [ ] **총 재생 시간** = DB `duration_seconds` 합계
3. [ ] **세그먼트 순서** = DB `sequence_number` 오름차순
4. [ ] **스피커 정보** = DB `speaker_name` 필드
5. [ ] **스크립트 텍스트** = DB `text_content` 필드
6. [ ] **오디오 URL** = DB `audio_url` 필드
7. [ ] **챕터 구분** = DB `chapter_index` 필드

#### 2.4.2 오디오 파일 경로 검증

**예상 패턴**:
```
audio/podcasts/{location_slug}/{chapter_index}-{segment_in_chapter}{language_code}.mp3

실제 예시:
- audio/podcasts/eiffel-tower/0-1ko.mp3  (인트로, 첫 번째 세그먼트, 한국어)
- audio/podcasts/eiffel-tower/1-1ko.mp3  (챕터 1, 첫 번째 세그먼트)
- audio/podcasts/eiffel-tower/1-2ko.mp3  (챕터 1, 두 번째 세그먼트)
```

**전체 URL**:
```
https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/eiffel-tower/0-1ko.mp3
```

**검증**:
- [ ] URL이 `NEXT_PUBLIC_SUPABASE_URL` 환경변수 사용
- [ ] 파일명에 언어 코드 포함 (ko, en, ja, zh, es)
- [ ] 챕터 번호 일관성 (0: 인트로, 1-N: 메인, 999: 아웃트로)

---

## 🔍 Part 3: 특수 케이스 검증

### 3.1 다국어 전환 테스트
**시나리오**: 한국어 → 영어 전환

**URL 변경**:
- `/podcast/ko/eiffel-tower`
- → `/podcast/en/eiffel-tower`

**예상 변화**:
- [ ] 제목 변경: "에펠탑 오디오 가이드" → "Eiffel Tower Audio Guide"
- [ ] 스크립트 언어 변경: 한국어 → 영어
- [ ] 오디오 파일 변경: `0-1ko.mp3` → `0-1en.mp3`
- [ ] 인터페이스 언어 변경 (버튼, 라벨 등)

### 3.2 긴 팟캐스트 (50+ 세그먼트)
**테스트 위치**: 큰 관광지 (예: 베르사유 궁전)

**검증 포인트**:
- [ ] 챕터 리스트 스크롤 가능
- [ ] 세그먼트 전환 시 성능 (지연 없음)
- [ ] 메모리 누수 없음 (장시간 재생)
- [ ] 마지막 세그먼트 재생 완료 후 정지

### 3.3 네트워크 오류 처리
**시나리오**:
1. 네트워크 끊김 (DevTools → Network → Offline)
2. 오디오 파일 404
3. API 타임아웃

**예상 동작**:
- [ ] 적절한 에러 메시지 표시
- [ ] 재시도 버튼 제공
- [ ] 다음 세그먼트로 건너뛰기 옵션

---

## ✅ 체크리스트 요약

### 가이드 시스템 (10개 항목)
- [ ] 1.1 홈페이지 검색 기능
- [ ] 1.2.1 기존 가이드 표시 (헤더, 플레이어, 스크립트, 지도)
- [ ] 1.2.2 신규 가이드 생성
- [ ] 1.3 다국어 전환

### 팟캐스트 시스템 (15개 항목)
- [ ] 2.2.1 헤더 섹션
- [ ] 2.2.2 오디오 플레이어 UI
- [ ] 2.2.3 챕터 리스트
- [ ] 2.2.4 스크립트 섹션
- [ ] 2.3.1 초기 로드
- [ ] 2.3.2 재생 시작
- [ ] 2.3.3 세그먼트 전환 (자동)
- [ ] 2.3.3 세그먼트 전환 (수동)
- [ ] 2.3.4 오디오 404 처리
- [ ] 2.4.1 DB vs UI 데이터 일치
- [ ] 2.4.2 오디오 URL 정확성

### 특수 케이스 (3개 항목)
- [ ] 3.1 다국어 전환
- [ ] 3.2 긴 팟캐스트 성능
- [ ] 3.3 네트워크 오류

---

## 🛠️ 테스트 실행 방법

### 로컬 환경
```bash
# 개발 서버 시작
npm run dev

# 브라우저 열기
http://localhost:3000

# Chrome DevTools 활성화 (F12)
# - Console: 에러 확인
# - Network: API 요청 확인
# - Elements: DOM 구조 확인
```

### Playwright 자동화 테스트
```bash
# Playwright MCP 사용
/playwright navigate http://localhost:3000/podcast/ko/eiffel-tower
/playwright snapshot
/playwright click [재생 버튼 ref]
/playwright wait 5000
/playwright snapshot
```

---

## 📊 예상 결과

### 성공 기준
- ✅ 모든 체크리스트 항목 통과 (28/28)
- ✅ DB 데이터와 UI 데이터 100% 일치
- ✅ 오디오 파일 재생 성공률 95% 이상
- ✅ 페이지 로드 시간 < 3초
- ✅ 세그먼트 전환 지연 < 500ms

### 실패 케이스 처리
- ❌ 데이터 불일치 발견 시: 로그 기록 + 스크린샷
- ❌ 오디오 재생 실패 시: 에러 메시지 + 네트워크 로그
- ❌ UI 깨짐 발견 시: 스크린샷 + HTML 구조 확인

---

## 📝 테스트 보고서 템플릿

```markdown
# 플로우 검증 테스트 보고서

**테스트 일시**: YYYY-MM-DD HH:MM
**테스트 환경**: localhost:3000 / 프로덕션
**테스터**: [이름]

## 가이드 시스템
- [✅/❌] 1.1 홈페이지 검색: [결과]
- [✅/❌] 1.2.1 기존 가이드 표시: [결과]
- ...

## 팟캐스트 시스템
- [✅/❌] 2.2.1 헤더 섹션: [결과]
- ...

## 발견된 이슈
1. [이슈 제목]
   - 심각도: Critical / High / Medium / Low
   - 재현 단계: ...
   - 예상 동작: ...
   - 실제 동작: ...
   - 스크린샷: [첨부]

## 결론
- 통과율: X / 28 (XX%)
- 권장 조치: ...
```

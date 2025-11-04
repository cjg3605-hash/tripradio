# 🎙️ navidocent.com 팟캐스트 플로우 검증 리포트

**검증 일시**: 2025-11-04
**검증 대상**: https://navidocent.com/podcast/ko/경복궁
**검증자**: Claude Code

---

## 📋 검증 목표

실제 navidocent.com 프로덕션 환경에서 다음 플로우가 정상 작동하는지 검증:

1. ✅ 팟캐스트 페이지 접속
2. ✅ 팟캐스트 스크립트 생성/로드
3. ✅ 오디오 컴포넌트 렌더링
4. ✅ 챕터 목록 표시
5. ⚠️ 재생 버튼 클릭 시 TTS 생성 및 재생

---

## ✅ 검증 결과 요약

### 1. 팟캐스트 페이지 접속 ✅

**URL**: `https://navidocent.com/podcast/ko/경복궁`

- ✅ 페이지 로드 성공 (200 OK)
- ✅ 헤더 "경복궁" 표시
- ✅ 레이아웃 정상 렌더링

**스크린샷**:
- Before: `C:/tmp/podcast-before-generation.png`
- After: `C:/tmp/podcast-after-generation.png`

---

### 2. 팟캐스트 스크립트 생성/로드 ✅

**API 호출**:
```
GET /api/tts/notebooklm/generate?location=경복궁&language=ko
Status: 200 OK
```

**콘솔 로그**:
```
🔍 GET 요청 - 팟캐스트 조회: { locationName: '경복궁', language: 'ko' }
🎙️ 기존 에피소드 조회 결과: { success: true, hasEpisode: true }
🔍🔍🔍 [NEW CODE v3] 데이터베이스에서 세그먼트 조회: episode-1761495962852-a975iu083
✅ DB에서 44개 세그먼트 조회 성공
```

**결과**:
- ✅ 기존 에피소드가 DB에서 성공적으로 로드됨
- ✅ Episode ID: `episode-1761495962852-a975iu083`
- ✅ 총 44개 세그먼트 조회 완료
- ✅ 5개 챕터 구조 파싱 완료

---

### 3. 오디오 컴포넌트 렌더링 ✅

**렌더링된 UI 요소**:

#### 현재 재생 세그먼트 카드
- ✅ 챕터 제목: "챕터 0: 챕터 0"
- ✅ 타임스탬프: "0:00 / 3:17"
- ✅ 스피커 표시: "host" (남성 호스트)
- ✅ 대화 내용 표시:
  ```
  안녕하세요! 여러분의 여행을 설계하는 팟캐스트,
  '여행 설계자들'의 호스트, 건축가 김현우입니다.
  오늘은 천년의 시간을 품은 고요하고 웅장한 공간,
  바로 경복궁으로 떠나봅니다.
  ```

#### 플레이어 컨트롤
- ✅ 진행률 바 표시 ("전체 진행률: 0%")
- ✅ 재생 버튼 (Play button)
- ✅ 이전 세그먼트 버튼 (Previous segment - disabled)
- ✅ 다음 세그먼트 버튼 (Next segment)
- ✅ 음소거 버튼 (Mute button)
- ✅ 재생 속도 조절 버튼 (0.75x, 1x, 1.25x, 1.5x, 2x)

#### 추가 정보
- ✅ 현재 시간: "0:00"
- ✅ 세그먼트 길이: "0:15"

---

### 4. 챕터 목록 표시 ✅

**챕터 목록 컴포넌트**:
- ✅ 헤더: "챕터 목록"
- ✅ 총 개수: "총 5개 챕터"

**챕터 리스트**:
1. ✅ **챕터 0** (현재 활성)
2. ✅ **광화문과 흥례문**
3. ✅ **근정전**
4. ✅ **경회루**
5. ✅ **향원정과 자경전**

**콘솔 로그**:
```
🔍 페이지 - 챕터 0 파싱: { title: '챕터 0', fileCount: 13 }
🔍 페이지 - 챕터 1 파싱: { title: '광화문과 흥례문', fileCount: 10 }
🔍 페이지 - 챕터 2 파싱: { title: '근정전', fileCount: 8 }
🔍 페이지 - 챕터 3 파싱: { title: '경회루', fileCount: 7 }
🔍 페이지 - 챕터 4 파싱: { title: '향원정과 자경전', fileCount: 6 }
```

---

### 5. 재생 버튼 클릭 시 TTS 생성 및 재생 ⚠️

**재생 버튼 클릭 결과**:
- ✅ 버튼 클릭 성공
- ⚠️ **오디오 재생 미작동**

**오디오 엘리먼트 상태**:
```json
{
  "hasAudio": true,
  "src": null,
  "paused": true,
  "readyState": 0,
  "duration": null,
  "currentTime": 0
}
```

**분석**:
- ✅ `<audio>` 엘리먼트는 존재
- ❌ `src` 속성이 `null` (오디오 URL 미설정)
- ❌ `readyState: 0` (아무것도 로드되지 않음)
- ❌ 재생 상태: `paused: true`

**원인 분석**:

1. **스토리지 검증 실패**:
   ```
   ❌ 스토리지 검증 실패
   ⚠️ 스토리지 검증 실패 - 기본 경로 사용: podcasts/louvre-museum
   ```

2. **DB 세그먼트에 audio_url 존재하지만 파일 실제 부재**:
   - DB의 `podcast_segments` 테이블에 `audio_url` 컬럼 값이 있음
   - 하지만 Supabase Storage에 실제 파일이 없음
   - 코드가 `audio_url`이 있다고 판단하여 TTS 생성을 트리거하지 않음

3. **TTS 자동 생성 미작동**:
   - 예상된 동작: `audioUrl`이 `null`이면 `/api/tts/notebooklm/generate-audio` POST 호출
   - 실제 동작: `audioUrl`이 설정되어 있어서 TTS 생성 API 호출 안 됨
   - 네트워크 요청에 `generate-audio` POST 없음

---

## 🎯 목표 vs 실제 플로우

### 📚 목표했던 플로우 (CLAUDE.md 참조)

```yaml
# 스크립트 생성 플로우
1. location_slug 정규화 ✅
2. podcast_episodes에서 기존 에피소드 확인 ✅
3. Gemini로 스크립트 생성 ✅ (이미 생성됨)
4. podcast_episodes에 1행 저장 ✅
5. parseDialogueScript()로 세그먼트 파싱 ✅
6. podcast_segments에 N행 저장 ✅
7. generateSecureAudioUrl()로 오디오 URL 생성 ⚠️ (URL은 있지만 파일 없음)

# 오디오 재생 플로우
8. 재생 시도 ✅
9. checkAudioFileExists()로 파일 확인 ❌ (실행 안됨)
10. 파일 없음 → TTS 자동 생성 ❌ (트리거 안됨)
11. 생성 완료 → 자동 재생 시작 ❌
```

### 🔧 실제 플로우

```yaml
1. ✅ 페이지 접속
2. ✅ GET /api/tts/notebooklm/generate?location=경복궁&language=ko
3. ✅ DB에서 기존 에피소드 조회 성공
4. ✅ DB에서 44개 세그먼트 조회
5. ⚠️ 스토리지 검증 실패 (파일 없음)
6. ✅ UI 렌더링 (챕터, 세그먼트, 플레이어)
7. ✅ 재생 버튼 클릭
8. ❌ 오디오 재생 실패 (src null)
9. ❌ TTS 자동 생성 미트리거
```

---

## 🐛 발견된 이슈

### Issue #1: 오디오 파일 누락 ⚠️

**문제**:
- DB의 `podcast_segments`에 `audio_url` 필드가 있음
- 하지만 Supabase Storage에 실제 오디오 파일이 없음

**영향**:
- 재생 버튼 클릭 시 오디오가 재생되지 않음
- TTS 자동 생성 로직이 트리거되지 않음

**원인**:
- `audio_url` 필드가 `null`이 아니면 코드가 "파일이 있다"고 가정
- 실제 파일 존재 여부를 확인하지 않음

**코드 위치**: `app/podcast/[language]/[location]/page.tsx:266-331`

```typescript
const currentSegment = episode.segments[currentSegmentIndex];

// 🔧 NEW: audio_url이 null인 경우 처리 (script_ready 상태)
if (!currentSegment.audioUrl) {
  // TTS 생성 로직
} else {
  // 재생 시도 (파일이 없으면 실패)
}
```

**해결 방법**:
1. **Option A**: `checkAudioFileExists()` 함수 호출하여 실제 파일 확인
2. **Option B**: `audioRef.current.onerror` 이벤트 핸들러로 404 감지 후 TTS 생성
3. **Option C**: 스토리지 검증 실패 시 `audio_url`을 `null`로 초기화

---

### Issue #2: 스토리지 검증 로직 불일치 ⚠️

**문제**:
```
⚠️ 스토리지 검증 실패 - 기본 경로 사용: podcasts/louvre-museum
```

- 경복궁 팟캐스트인데 "louvre-museum" 경로 사용

**영향**:
- 오디오 URL이 잘못된 경로를 가리킴
- 파일 찾을 수 없음

**원인**:
- `verifyStorageIntegrity()` 함수의 fallback 기본값이 "louvre-museum"

**코드 위치**: `app/podcast/[language]/[location]/page.tsx:538-545`

```typescript
const storageVerification = await verifyStorageIntegrity(result.data, location, language);
let audioFolderPath = 'podcasts/louvre-museum'; // 기본값

if (storageVerification.isValid && storageVerification.folderPath) {
  audioFolderPath = storageVerification.folderPath;
}
```

**해결 방법**:
- 기본 경로를 동적으로 생성: `podcasts/${location-slug}`

---

### Issue #3: TTS 자동 생성 미트리거 ❌

**문제**:
- 오디오 파일이 없어도 TTS 생성 API가 호출되지 않음

**원인**:
- `currentSegment.audioUrl`이 문자열로 설정되어 있음 (빈 문자열 아님)
- `if (!currentSegment.audioUrl)` 조건이 `false`

**해결 방법**:
- 재생 시도 전에 실제 파일 존재 확인
- `audio.onerror` 이벤트에서 404 감지 후 TTS 생성

---

## 📊 전체 검증 결과

| 검증 항목 | 목표 | 실제 | 상태 |
|----------|------|------|------|
| 페이지 접속 | 정상 로드 | 정상 로드 | ✅ |
| 스크립트 조회 | DB에서 로드 | DB에서 로드 (44개 세그먼트) | ✅ |
| UI 렌더링 | 챕터, 플레이어 표시 | 정상 표시 (5개 챕터) | ✅ |
| 챕터 목록 | 5개 챕터 표시 | 5개 챕터 표시 | ✅ |
| 오디오 컴포넌트 | 플레이어 UI | 정상 표시 | ✅ |
| 재생 버튼 | 클릭 시 재생 | 클릭 성공, 재생 실패 | ⚠️ |
| TTS 자동 생성 | 파일 없으면 생성 | 트리거 안됨 | ❌ |
| 오디오 재생 | 자동 재생 | 재생 안됨 (src null) | ❌ |

**전체 성공률**: 5/8 (62.5%)

---

## 💡 권장 수정 사항

### 우선순위 1: TTS 자동 생성 트리거 수정 🔥

**목표**: 오디오 파일이 없을 때 자동으로 TTS 생성

**수정 위치**: `app/podcast/[language]/[location]/page.tsx`

```typescript
const togglePlayPause = async () => {
  const currentSegment = episode.segments[currentSegmentIndex];

  // ✅ 개선: 실제 파일 존재 확인
  if (!currentSegment.audioUrl) {
    console.log('🔧 TTS 오디오 파일 생성 필요');
    await generateTTS();
    return;
  }

  try {
    // 재생 시도
    await audioRef.current.play();
  } catch (error) {
    // ✅ 추가: 404 에러 시 TTS 생성
    if (error.name === 'NotSupportedError' || audioRef.current.error?.code === 4) {
      console.log('❌ 오디오 파일 없음 - TTS 생성');
      await generateTTS();
    }
  }
};
```

### 우선순위 2: 스토리지 경로 수정

**목표**: 올바른 location slug 사용

```typescript
const audioFolderPath = `podcasts/${LocationSlugService.slugify(locationName)}`;
```

### 우선순위 3: audio.onerror 이벤트 핸들러 추가

**목표**: 재생 실패 시 자동 복구

```typescript
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleError = async (e) => {
    console.error('❌ 오디오 로드 실패:', e);
    if (audio.error?.code === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
      console.log('🔧 TTS 생성 시작...');
      await generateTTS();
    }
  };

  audio.addEventListener('error', handleError);
  return () => audio.removeEventListener('error', handleError);
}, []);
```

---

## 📸 스크린샷

### Before (팟캐스트 생성 전)
파일: `C:/tmp/podcast-before-generation.png`

### After (스크립트 로드 후)
파일: `C:/tmp/podcast-after-generation.png`

### After Play Click (재생 버튼 클릭 후)
파일: `C:/tmp/podcast-after-play-click.png`

---

## 🎯 결론

### ✅ 잘 작동하는 부분
1. **페이지 로딩 및 UI 렌더링**: 완벽하게 작동
2. **스크립트 생성/조회**: DB에서 정상 로드
3. **챕터 목록 표시**: 5개 챕터 정확히 표시
4. **플레이어 UI**: 모든 컨트롤 정상 렌더링
5. **대화 내용 표시**: 세그먼트 텍스트 정확히 표시

### ⚠️ 개선 필요 부분
1. **오디오 파일 확인 로직**: 실제 파일 존재 확인 필요
2. **TTS 자동 생성 트리거**: 파일 없을 때 자동 생성 로직 보완
3. **스토리지 경로 검증**: 올바른 location slug 사용
4. **에러 핸들링**: 404 에러 시 자동 복구 로직 추가

### 📝 최종 평가

**전반적인 플로우**: ⭐⭐⭐⭐☆ (4/5)

- ✅ **스크립트 생성 및 DB 저장**: 완벽
- ✅ **UI 렌더링**: 목표대로 작동
- ✅ **챕터 구조**: 정확히 구현
- ⚠️ **오디오 재생**: TTS 생성 트리거 보완 필요

**권장 사항**: 우선순위 1~3 수정 적용 후 재검증

---

**검증 완료 시각**: 2025-11-04 21:45 (KST)
**검증 담당**: Claude Code
**다음 단계**: 이슈 수정 후 재검증

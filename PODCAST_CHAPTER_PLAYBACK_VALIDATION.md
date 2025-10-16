# 팟캐스트 챕터 선택 및 오디오 재생 검증 체크리스트

> **검증 목적**: 사용자가 챕터를 선택했을 때 해당 챕터의 세그먼트가 정확하게 파싱되고, 재생 버튼 클릭 시 올바른 오디오 파일이 재생되는지 검증

---

## 📋 검증 체크리스트 개요

### 1단계: 에피소드 데이터 로드 검증
### 2단계: 챕터 구조 파싱 검증
### 3단계: 챕터 선택 시 세그먼트 매칭 검증
### 4단계: 오디오 URL 생성 검증
### 5단계: 오디오 재생 검증
### 6단계: 세그먼트 전환 검증

---

## ✅ 1단계: 에피소드 데이터 로드 검증

### 검증 항목
- [ ] **GET 요청 성공 여부**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:341-585`
  - **함수**: `checkExistingPodcast()`
  - **검증 방법**:
    ```javascript
    // 브라우저 콘솔에서 확인
    console.log('🔍 GET 요청 - 팟캐스트 조회:', { locationName, language });
    ```
  - **기대 결과**: 200 OK, `result.success === true`

- [ ] **에피소드 상태 확인**
  - **검증 필드**: `result.data.status === 'completed'`
  - **검증 방법**:
    ```javascript
    console.log('✅ 에피소드 상태:', result.data.status);
    ```
  - **기대 결과**: `'completed'` 상태

- [ ] **DB 세그먼트 조회 성공**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:369-379`
  - **쿼리**:
    ```sql
    SELECT * FROM podcast_segments
    WHERE episode_id = ?
    ORDER BY sequence_number ASC
    ```
  - **기대 결과**: `dbSegments.length > 0`

---

## ✅ 2단계: 챕터 구조 파싱 검증

### 검증 항목
- [ ] **챕터 메타데이터 파싱**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:381-399`
  - **검증 방법**:
    ```javascript
    console.log('📊 챕터 정보:', {
      chapterCount: result.data.chapters.length,
      chapters: result.data.chapters.map(ch => ({
        index: ch.chapterNumber,
        title: ch.title,
        segmentCount: ch.files?.length || 0
      }))
    });
    ```
  - **기대 결과**:
    - `chapterInfos.length > 0`
    - 각 챕터에 `chapterIndex`, `title`, `segmentCount` 존재

- [ ] **세그먼트-챕터 매핑 검증**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:402-458`
  - **검증 방법**:
    ```javascript
    console.log('🔍 세그먼트 매핑:', {
      totalSegments: allSegments.length,
      segmentsByChapter: allSegments.reduce((acc, seg) => {
        acc[seg.chapterIndex] = (acc[seg.chapterIndex] || 0) + 1;
        return acc;
      }, {})
    });
    ```
  - **기대 결과**: 모든 세그먼트가 올바른 `chapterIndex`를 가짐

- [ ] **audio_url 필드 정규화 검증**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:406-409`
  - **검증 로직**:
    ```javascript
    const audioUrl = seg.audio_url.startsWith('http')
      ? seg.audio_url
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${seg.audio_url}`;
    ```
  - **기대 결과**: 모든 `audioUrl`이 완전한 HTTP URL 형식

---

## ✅ 3단계: 챕터 선택 시 세그먼트 매칭 검증

### 검증 항목
- [ ] **ChapterList 컴포넌트 렌더링**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:1002-1025`
  - **조건**: `episode && episode.chapters && episode.chapters.length > 0`
  - **검증 방법**: 챕터 목록이 UI에 표시되는지 확인

- [ ] **챕터 클릭 이벤트 핸들러**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:1007-1022`
  - **함수**: `onChapterSelect(chapterIndex)`
  - **검증 방법**:
    ```javascript
    console.log('🎯 챕터 선택:', chapterIndex);
    const chapterFirstSegmentIndex = episode.segments.findIndex(
      segment => segment.chapterIndex === chapterIndex
    );
    console.log('📍 찾은 세그먼트 인덱스:', chapterFirstSegmentIndex);
    ```
  - **기대 결과**: `chapterFirstSegmentIndex >= 0`

- [ ] **세그먼트 인덱스 찾기 로직**
  - **핵심 코드**:
    ```javascript
    const chapterFirstSegmentIndex = episode.segments.findIndex(
      segment => segment.chapterIndex === chapterIndex
    );
    ```
  - **검증 시나리오**:
    | 챕터 번호 | 예상 첫 세그먼트 인덱스 | 실제 결과 |
    |-----------|-------------------------|-----------|
    | 0 (인트로) | 0 | ? |
    | 1 (본편 1) | ? | ? |
    | 2 (본편 2) | ? | ? |

- [ ] **jumpToSegment 함수 호출**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:186-191`
  - **검증 방법**:
    ```javascript
    const jumpToSegment = (segmentIndex: number) => {
      console.log('🎯 세그먼트 점프:', {
        targetIndex: segmentIndex,
        targetSegment: episode.segments[segmentIndex],
        audioUrl: episode.segments[segmentIndex].audioUrl
      });
      setCurrentSegmentIndex(segmentIndex);
      loadAndPlaySegment(segmentIndex);
    };
    ```
  - **기대 결과**: `currentSegmentIndex` 상태 업데이트 성공

---

## ✅ 4단계: 오디오 URL 생성 검증

### 검증 항목
- [ ] **DB 저장 시 URL 형식 검증**
  - **파일**: `src/lib/ai/tts/sequential-tts-generator.ts:746-764`
  - **저장 로직**:
    ```javascript
    const rawUrl = file.supabaseUrl || file.filePath || '';
    const normalizedUrl = rawUrl && !rawUrl.startsWith('http')
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')}/storage/v1/object/public/${rawUrl.replace(/^\/?/, '')}`
      : rawUrl;

    return {
      audio_url: normalizedUrl || null,
      // ...
    };
    ```
  - **기대 결과**: `audio_url`이 완전한 HTTP URL

- [ ] **오디오 파일 경로 패턴 검증**
  - **파일 명명 규칙**: `{챕터번호}-{세그먼트번호}{언어코드}.mp3`
  - **예시**:
    ```
    audio/podcasts/colosseum/0-1ko.mp3      (인트로 챕터 0, 세그먼트 1)
    audio/podcasts/colosseum/1-1ko.mp3      (챕터 1, 세그먼트 1)
    audio/podcasts/colosseum/1-2ko.mp3      (챕터 1, 세그먼트 2)
    ```
  - **검증 SQL**:
    ```sql
    SELECT episode_id, sequence_number, chapter_index, audio_url
    FROM podcast_segments
    WHERE episode_id = 'YOUR_EPISODE_ID'
    ORDER BY sequence_number;
    ```

- [ ] **Supabase Storage URL 구조 검증**
  - **완전한 URL 형식**:
    ```
    https://{SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/audio/podcasts/{location-slug}/{chapter}-{segment}{lang}.mp3
    ```
  - **검증 방법**:
    ```javascript
    console.log('🔗 오디오 URL:', {
      segment: segment.sequenceNumber,
      url: segment.audioUrl,
      isValid: segment.audioUrl.startsWith('https://') && segment.audioUrl.includes('/storage/v1/object/public/')
    });
    ```

---

## ✅ 5단계: 오디오 재생 검증

### 검증 항목
- [ ] **loadAndPlaySegment 함수 검증**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:165-184`
  - **검증 방법**:
    ```javascript
    const loadAndPlaySegment = async (segmentIndex: number, shouldAutoPlay = isPlaying) => {
      const segment = episode.segments[segmentIndex];
      console.log('🎵 세그먼트 로드:', {
        index: segmentIndex,
        audioUrl: segment.audioUrl,
        speakerType: segment.speakerType,
        textContent: segment.textContent.substring(0, 50)
      });

      audioRef.current.src = segment.audioUrl;
      await audioRef.current.load();

      if (shouldAutoPlay) {
        await audioRef.current.play();
      }
    };
    ```
  - **기대 결과**:
    - `audioRef.current.src`에 올바른 URL 설정됨
    - 오디오 로드 성공 (`readyState >= 2`)

- [ ] **togglePlayPause 함수 검증**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:193-245`
  - **검증 시나리오**:
    1. **세그먼트가 없는 경우**:
       ```javascript
       if (!episode?.segments || episode.segments.length === 0) {
         console.log('⚠️ 세그먼트 없음 - 생성 필요');
         await generatePodcast();
         return;
       }
       ```
    2. **정상 재생 경로**:
       ```javascript
       const currentSegment = episode.segments[currentSegmentIndex];
       console.log('▶️ 재생 시도:', {
         index: currentSegmentIndex,
         speaker: currentSegment.speakerType,
         url: currentSegment.audioUrl,
         readyState: audioRef.current.readyState
       });
       await audioRef.current.play();
       ```

- [ ] **오디오 엘리먼트 상태 검증**
  - **HTML 오디오 엘리먼트**: `<audio ref={audioRef} preload="metadata" />`
  - **readyState 값**:
    - `0` HAVE_NOTHING: 미디어 없음
    - `1` HAVE_METADATA: 메타데이터만 있음
    - `2` HAVE_CURRENT_DATA: 현재 프레임 데이터 있음
    - `3` HAVE_FUTURE_DATA: 다음 프레임 데이터 있음
    - `4` HAVE_ENOUGH_DATA: 재생 가능
  - **검증 방법**:
    ```javascript
    console.log('🎵 오디오 상태:', {
      src: audioRef.current?.src,
      readyState: audioRef.current?.readyState,
      paused: audioRef.current?.paused,
      currentTime: audioRef.current?.currentTime,
      duration: audioRef.current?.duration
    });
    ```

---

## ✅ 6단계: 세그먼트 전환 검증

### 검증 항목
- [ ] **자동 세그먼트 전환 (ended 이벤트)**
  - **파일**: `app/podcast/[language]/[location]/page.tsx:111-117`
  - **검증 로직**:
    ```javascript
    const handleEnded = () => {
      console.log('🔄 세그먼트 종료:', {
        currentIndex: currentSegmentIndex,
        totalSegments: episode.segments.length,
        hasNext: currentSegmentIndex < episode.segments.length - 1
      });

      if (currentSegmentIndex < episode.segments.length - 1) {
        playNextSegment();
      } else {
        setIsPlaying(false);
      }
    };
    ```

- [ ] **수동 세그먼트 전환 (Next/Previous 버튼)**
  - **Next 버튼**: `app/podcast/[language]/[location]/page.tsx:149-155`
    ```javascript
    const playNextSegment = () => {
      const nextIndex = currentSegmentIndex + 1;
      console.log('⏭️ 다음 세그먼트:', {
        from: currentSegmentIndex,
        to: nextIndex,
        segment: episode.segments[nextIndex]
      });
      setCurrentSegmentIndex(nextIndex);
      loadAndPlaySegment(nextIndex, true);
    };
    ```
  - **Previous 버튼**: `app/podcast/[language]/[location]/page.tsx:157-163`
    ```javascript
    const playPreviousSegment = () => {
      const prevIndex = currentSegmentIndex - 1;
      console.log('⏮️ 이전 세그먼트:', {
        from: currentSegmentIndex,
        to: prevIndex,
        segment: episode.segments[prevIndex]
      });
      setCurrentSegmentIndex(prevIndex);
      loadAndPlaySegment(prevIndex, true);
    };
    ```

- [ ] **챕터 경계 전환 검증**
  - **시나리오**: 챕터 0의 마지막 세그먼트 → 챕터 1의 첫 세그먼트
  - **검증 방법**:
    ```javascript
    // 세그먼트 전환 시 챕터 변경 확인
    console.log('📚 챕터 전환:', {
      prevChapter: episode.segments[currentSegmentIndex - 1]?.chapterIndex,
      currentChapter: episode.segments[currentSegmentIndex]?.chapterIndex,
      isCrossingChapter: episode.segments[currentSegmentIndex - 1]?.chapterIndex !==
                         episode.segments[currentSegmentIndex]?.chapterIndex
    });
    ```

---

## 🧪 통합 테스트 시나리오

### 시나리오 1: 처음부터 챕터별 순차 재생
1. [ ] 페이지 로드 → 에피소드 데이터 확인
2. [ ] 챕터 0 선택 → 세그먼트 0 로드
3. [ ] 재생 버튼 클릭 → 오디오 재생 시작
4. [ ] 세그먼트 0 종료 → 자동으로 세그먼트 1 재생
5. [ ] 챕터 0 완료 → 챕터 1 첫 세그먼트로 전환

### 시나리오 2: 중간 챕터 직접 선택
1. [ ] 챕터 2 클릭 → `onChapterSelect(2)` 호출
2. [ ] `findIndex(segment => segment.chapterIndex === 2)` 실행
3. [ ] 해당 세그먼트 인덱스로 점프
4. [ ] `loadAndPlaySegment()` 호출
5. [ ] 오디오 URL 로드 및 재생

### 시나리오 3: 재생 중 다른 챕터 선택
1. [ ] 현재 재생 중 (isPlaying: true)
2. [ ] 다른 챕터 클릭
3. [ ] 현재 재생 중지 + 새 세그먼트 로드
4. [ ] 자동 재생 시작

---

## 🐛 알려진 문제 및 해결 방법

### 문제 1: 빈 세그먼트 배열
**증상**: `episode.segments.length === 0`
**원인**: DB 조회 실패 또는 파싱 오류
**해결**:
```javascript
if (!episode?.segments || episode.segments.length === 0) {
  console.error('❌ 세그먼트 없음');
  // 스토리지 파일 스캔 fallback 실행
}
```

### 문제 2: 오디오 URL 404 오류
**증상**: `audioRef.current.error.code === 4` (MEDIA_ERR_SRC_NOT_SUPPORTED)
**원인**:
- Supabase storage에 파일이 없음
- URL 형식 오류
**해결**:
```javascript
audioRef.current.onerror = () => {
  console.error('❌ 오디오 로드 실패:', {
    url: audioRef.current.src,
    error: audioRef.current.error
  });
  // TTS 재생성 API 호출
};
```

### 문제 3: 챕터 선택 후 세그먼트를 찾을 수 없음
**증상**: `chapterFirstSegmentIndex === -1`
**원인**: DB의 `chapter_index` 값이 챕터 메타데이터와 불일치
**해결**:
```javascript
if (chapterFirstSegmentIndex < 0) {
  console.warn('⚠️ 챕터 세그먼트 없음:', chapterIndex);
  // 폴백: 챕터 번호 기반 추정
  const estimatedIndex = chapterIndex * 25; // 챕터당 평균 25개 세그먼트
  jumpToSegment(Math.min(estimatedIndex, episode.segments.length - 1));
}
```

---

## 📊 검증 결과 템플릿

### 테스트 환경
- **브라우저**: Chrome / Safari / Firefox
- **위치**: _______________________
- **언어**: ko / en / ja / zh / es
- **Episode ID**: _______________________

### 검증 결과
| 단계 | 항목 | 결과 | 비고 |
|------|------|------|------|
| 1 | 에피소드 로드 | ✅ / ❌ | |
| 2 | 챕터 파싱 | ✅ / ❌ | 챕터 수: ___ |
| 3 | 세그먼트 매칭 | ✅ / ❌ | |
| 4 | URL 생성 | ✅ / ❌ | |
| 5 | 오디오 재생 | ✅ / ❌ | |
| 6 | 세그먼트 전환 | ✅ / ❌ | |

### 발견된 이슈
1. ___________________________________
2. ___________________________________
3. ___________________________________

---

## 🔧 개발자 디버깅 팁

### 콘솔 로그 활성화
```javascript
// app/podcast/[language]/[location]/page.tsx 상단에 추가
const DEBUG = true;

if (DEBUG) {
  console.log('🔍 현재 상태:', {
    episode,
    currentSegmentIndex,
    isPlaying,
    currentSegment: episode?.segments[currentSegmentIndex],
    audioSrc: audioRef.current?.src
  });
}
```

### Supabase 쿼리 직접 실행
```sql
-- 1. 에피소드 조회
SELECT id, location_slug, status, total_duration, file_count
FROM podcast_episodes
WHERE location_slug = 'YOUR_LOCATION_SLUG' AND language = 'ko';

-- 2. 세그먼트 조회
SELECT sequence_number, chapter_index, speaker_type, audio_url, text_content
FROM podcast_segments
WHERE episode_id = 'YOUR_EPISODE_ID'
ORDER BY sequence_number;

-- 3. 챕터별 세그먼트 수 확인
SELECT chapter_index, COUNT(*) as segment_count
FROM podcast_segments
WHERE episode_id = 'YOUR_EPISODE_ID'
GROUP BY chapter_index
ORDER BY chapter_index;
```

### 네트워크 탭에서 오디오 요청 확인
1. 브라우저 개발자 도구 → Network 탭
2. Filter: `mp3`
3. 재생 버튼 클릭 시 요청 확인:
   - **Status**: 200 OK
   - **Type**: audio/mpeg
   - **Size**: > 10KB

---

## ✅ 검증 완료 체크리스트

- [ ] 모든 6단계 검증 항목 통과
- [ ] 3개 통합 테스트 시나리오 성공
- [ ] 알려진 문제 해결 방법 문서화
- [ ] 실제 사용자 테스트 완료
- [ ] 크로스 브라우저 테스트 완료

---

**작성일**: 2025-01-14
**버전**: 1.0
**작성자**: Claude Code
**프로젝트**: TripRadio.AI

# 팟캐스트 구현 검증 보고서

> **목적**: 실제 코드 구현이 설계된 플로우와 일치하는지 검증 및 문제점 파악

## 📋 검증 항목

### 1. 1차 플로우: 데이터 로드 및 표시

#### ✅ 1-1. 페이지 진입 (장소 검색)

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 302-312)

```typescript
useEffect(() => {
  const rawLocation = params?.location;
  if (!rawLocation) return;

  const locationParam = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
  if (!locationParam) return;

  const decodedLocation = decodeURIComponent(locationParam);
  setLocationName(decodedLocation);
  setIsLoading(false);
  checkExistingPodcast(decodedLocation, effectiveLanguage);
}, [params?.location, effectiveLanguage]);
```

**검증 결과**: ✅ 정확함
- location 파라미터 디코딩 정확
- checkExistingPodcast() 호출 올바름

---

#### ✅ 1-2. GET 요청으로 기존 팟캐스트 조회

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 378-381)

```typescript
const checkExistingPodcast = async (location: string, language: SupportedLanguage) => {
  try {
    console.log('🔍 GET 요청 - 팟캐스트 조회:', { locationName: location, language });
    const response = await fetch(`/api/tts/notebooklm/generate?location=${encodeURIComponent(location)}&language=${language}`);

    if (response.ok) {
      const result = await response.json();
```

**검증 결과**: ✅ 정확함
- GET 요청 올바름
- 응답 처리 적절함

---

#### ✅ 1-3. GET 응답 처리 (기존 데이터 있을 때)

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 383-527)

```typescript
// result.data.hasEpisode === true인 경우
if (result.success && result.data.hasEpisode &&
    (result.data.status === 'completed' || result.data.status === 'script_ready')) {

  // 1) 데이터베이스에서 실제 세그먼트 데이터 가져오기
  const { data: dbSegments, error: segmentError } = await supabase
    .from('podcast_segments')
    .select('sequence_number, speaker_name, speaker_type, text_content, audio_url, duration_seconds, chapter_index')
    .eq('episode_id', result.data.episodeId)
    .order('sequence_number', { ascending: true });

  // 2) 챕터 정보 생성 (result.data.chapters 기반)
  if (result.data.chapters && Array.isArray(result.data.chapters)) {
    result.data.chapters.forEach((chapter: any) => {
      const chapterInfo: ChapterInfo = {
        chapterIndex: chapter.chapterNumber,
        title: chapter.title,
        ...
      };
      chapterInfos.push(chapterInfo);
    });
  }

  // 3) 세그먼트 매핑
  allSegments = dbSegments.map((seg: any) => ({
    sequenceNumber: seg.sequence_number,
    speakerType: (seg.speaker_name === 'Host' || seg.speaker_type === 'male') ? 'male' : 'female',
    audioUrl: seg.audio_url,  // ⚠️ NULL 가능!
    duration: seg.duration_seconds || 30,
    textContent: seg.text_content || '',
    chapterIndex: seg.chapter_index,
    ...
  }));
}
```

**검증 결과**: ⚠️ 부분적 문제

**문제점 1: audio_url이 null 가능**
- Status: `script_ready` → audio_url = NULL
- Status: `completed` → audio_url = full_url (유효)
- **현재**: 페이지에서는 이를 구분하지 않음

**문제점 2: chapters가 항상 반환되는가?**
- API (/api/tts/notebooklm/generate route.ts line 1017)에서 chapters 반환
- 하지만 chapters = [] (빈 배열)일 수 있음
  - DB 세그먼트 없을 때
  - JSON 파싱 실패할 때
  - 스토리지 스캔 실패할 때

---

#### ✅ 1-4. UI 표시 (기존 데이터)

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 780-1053)

**오디오플레이어**:
```typescript
{episode && episode.segments && episode.segments.length > 0 &&
 episode.segments[currentSegmentIndex] && (
  <div>
    {/* 현재 세그먼트 정보 표시 */}
    <p className="text-base text-gray-900">
      {episode.segments[currentSegmentIndex].textContent}
    </p>
  </div>
)}
```

**검증 결과**: ✅ 정확함
- 현재 세그먼트 textContent 올바르게 표시

**챕터목록**:
```typescript
{episode && episode.chapters && episode.chapters.length > 0 && (
  <ChapterList
    chapters={episode.chapters}
    currentChapterIndex={episode.segments[currentSegmentIndex]?.chapterIndex ?? 0}
    onChapterSelect={(chapterIndex) => {
      const chapterFirstSegmentIndex = episode.segments.findIndex(
        segment => segment.chapterIndex === chapterIndex
      );
      if (chapterFirstSegmentIndex >= 0) {
        jumpToSegment(chapterFirstSegmentIndex);
      }
    }}
  />
)}
```

**검증 결과**: ⚠️ 조건부 정확

**문제점 3: chapters가 없을 때 UI 미표시**
- `episode.chapters.length > 0`일 때만 표시
- chapters = []이면 챕터 목록 없음
- **결과**: 페이지가 비어 보일 수 있음

---

#### ✅ 1-5. POST로 새 팟캐스트 생성

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 627-719)

```typescript
const generatePodcast = async () => {
  if (isGenerating) return;

  setIsGenerating(true);
  setError(null);
  setGenerationProgress(0);

  try {
    const response = await fetch('/api/tts/notebooklm/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationName,
        language: targetLanguage,
        options: { ... }
      }),
      signal: controller.signal
    });

    const result = await response.json();

    // CQRS 패턴: POST 성공 후 GET으로 재조회
    setGenerationProgress(95);
    await checkExistingPodcast(locationName, targetLanguage);
    setGenerationProgress(100);
  }
}
```

**검증 결과**: ✅ 정확함
- POST 요청 올바름
- CQRS 패턴 구현 올바름
- 진행률 표시 적절함

---

### 2. 2차 플로우: 재생 단계

#### ⚠️ 2-1. 재생 버튼 클릭 (togglePlayPause)

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 226-278)

```typescript
const togglePlayPause = async () => {
  // 세그먼트가 없으면 생성
  if (!episode?.segments || episode.segments.length === 0) {
    await generatePodcast();
    return;
  }

  const currentSegment = episode.segments[currentSegmentIndex];

  try {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // ⚠️ 문제: audioUrl이 null이면?
      if (audioRef.current.src !== currentSegment.audioUrl) {
        audioRef.current.src = currentSegment.audioUrl;  // ❌ null이면 오류!
        audioRef.current.load();
        await audioRef.current.play();
      }
    }
  } catch (error) {
    console.error(`❌ 세그먼트 ${currentSegmentIndex + 1} 재생 실패:`, error);
  }
}
```

**검증 결과**: ❌ 심각한 문제

**문제점 4: audio_url이 null인 경우 처리 없음**

현재 코드:
```javascript
audioRef.current.src = currentSegment.audioUrl;  // null이면?
audioRef.current.load();
await audioRef.current.play();  // 오류!
```

**결과**:
- audio_url이 null이면 audioRef.current.src = null
- audioRef.current.play() 실패
- 에러 메시지만 표시되고 자동 복구 없음

**필요한 처리**:
```typescript
if (!currentSegment.audioUrl || currentSegment.audioUrl === null) {
  console.log('🔧 TTS 오디오 파일 생성 필요...');
  // generateAudioFiles() 또는 API 호출
  await generateMissingAudio(currentSegmentIndex);
  return;
}
```

---

#### ⚠️ 2-2. 순차 재생 (loadAndPlaySegment)

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 183-217)

```typescript
const loadAndPlaySegment = async (segmentIndex: number, shouldAutoPlay: boolean = isPlaying) => {
  if (!episode?.segments || !audioRef.current) return;

  const segment = episode.segments[segmentIndex];

  try {
    if (!audioRef.current.paused) {
      audioRef.current.pause();
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    audioRef.current.src = segment.audioUrl;  // ⚠️ null 가능!
    audioRef.current.load();

    if (shouldAutoPlay) {
      await audioRef.current.play();
    }
  } catch (error) {
    console.error(`❌ 세그먼트 ${segmentIndex + 1} 로드 실패:`, error);
  }
}
```

**검증 결과**: ❌ 같은 문제

**문제점 5: 세그먼트 간 전환 시에도 null 처리 없음**
- playNextSegment() → loadAndPlaySegment() 호출
- segment.audioUrl이 null이면 실패

---

#### ❌ 2-3. TTS 생성 API 호출 로직 없음

**현재 상태**: 구현되지 않음

**필요한 것**:
```typescript
// togglePlayPause 또는 재생 전 호출
if (audioUrl === null) {
  const generateResponse = await fetch('/api/tts/notebooklm/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      episodeId: episode.episodeId,
      language: language,
      segments: episode.segments
    })
  });

  if (generateResponse.ok) {
    const result = await generateResponse.json();
    // 새 audioUrl로 episode 업데이트
    // 다시 재생 시도
  }
}
```

**현재**: 이 로직이 완전히 미구현

---

#### ⚠️ 2-4. 오디오 이벤트 핸들러 (timeupdate, ended)

**파일**: `app/podcast/[language]/[location]/page.tsx` (line 111-151)

```typescript
const handleEnded = () => {
  if (currentSegmentIndex < episode.segments.length - 1) {
    playNextSegment();  // ← 다음 세그먼트 로드
  } else {
    setIsPlaying(false);
  }
};

const handleTimeUpdate = () => {
  const currentSegmentTime = audio.currentTime;
  setCurrentTime(currentSegmentTime);

  // 전체 경과 시간 계산
  const previousSegmentsTime = episode.segments
    .slice(0, currentSegmentIndex)
    .reduce((total, segment) => total + (isNaN(segment.duration) ? 0 : segment.duration), 0);

  setTotalElapsedTime(previousSegmentsTime + currentSegmentTime);
};
```

**검증 결과**: ✅ 대부분 정확함

**잠재적 문제**:
- NaN 처리는 있지만, segment.audioUrl이 null이면 재생 자체가 안 됨

---

## 🔴 치명적 문제 요약

### 문제 A: script_ready 상태 미처리 (우선순위: 🔴 높음)

| 상황 | 현재 동작 | 예상 동작 |
|-----|---------|---------|
| POST 직후 (script_ready) | 재생 클릭 시 오류 | TTS 생성 후 재생 |
| 부분 재생 (일부 null) | 해당 세그먼트 스킵 | 해당 세그먼트만 TTS 생성 |
| 완전히 재생 불가 | 페이지 오류 또는 블랙아웃 | 자동 복구 또는 명확한 메시지 |

### 문제 B: chapters 정보 누락 (우선순위: 🟡 중간)

| 상황 | 현재 동작 | 예상 동작 |
|-----|---------|---------|
| chapters = [] | 챕터 목록 미표시 | 대체 표시 또는 DB 세그먼트로 재구성 |
| chapters가 incomplete | 일부 챕터만 표시 | 모든 챕터 표시 |

### 문제 C: 에러 처리 미흡 (우선순위: 🟡 중간)

| 상황 | 현재 동작 | 예상 동작 |
|-----|---------|---------|
| TTS 생성 실패 | 오류 메시지만 표시 | 재시도 로직 또는 폴백 |
| 네트워크 오류 | 블로킹 | 재시도 또는 오프라인 모드 |

---

## ✅ 정상 동작 확인

### ✅ 작동하는 시나리오

```
시나리오 1: 완전히 생성된 팟캐스트 (status = 'completed')
1. 페이지 진입 → checkExistingPodcast()
2. GET /api/tts/notebooklm/generate?location=...&language=...
3. 응답: episodeId, chapters, status='completed'
4. DB 세그먼트 조회: 모든 segment.audio_url이 유효한 URL
5. UI 표시 완료
6. 재생 버튼 클릭 → togglePlayPause()
7. audioRef.src = segment.audioUrl (유효)
8. 순차 재생 시작 ✅
```

```
시나리오 2: 새로운 팟캐스트 생성
1. 페이지 진입 → checkExistingPodcast()
2. GET 응답: hasEpisode = false
3. "팟캐스트 생성하기" 버튼 표시
4. 사용자 클릭 → generatePodcast()
5. POST /api/tts/notebooklm/generate
6. API: Gemini 호출 → 스크립트 생성 → DB 저장 (status = 'script_ready')
7. 페이지: CQRS 패턴으로 GET 재조회
8. GET 응답: episodeId, chapters, status='script_ready'
9. UI 표시... 여기서부터 문제 ❌
```

---

## 🔧 필요한 수정사항

### 수정 1: audio_url이 null인 경우 처리

**파일**: `app/podcast/[language]/[location]/page.tsx`

**위치**: togglePlayPause 함수

**변경 전**:
```typescript
const togglePlayPause = async () => {
  // ...
  const currentSegment = episode.segments[currentSegmentIndex];

  if (isPlaying) {
    audioRef.current.pause();
  } else {
    if (audioRef.current.src !== currentSegment.audioUrl) {
      audioRef.current.src = currentSegment.audioUrl;  // ❌ null이면?
      audioRef.current.load();
      await audioRef.current.play();
    }
  }
}
```

**변경 후**:
```typescript
const togglePlayPause = async () => {
  // ...
  const currentSegment = episode.segments[currentSegmentIndex];

  // ✅ NEW: audio_url이 null인 경우 처리
  if (!currentSegment.audioUrl) {
    console.log('🔧 TTS 오디오 파일 생성 필요:', {
      segmentIndex: currentSegmentIndex,
      status: episode.status
    });

    if (episode.status === 'script_ready') {
      setError('오디오를 생성 중입니다. 잠시만 기다려주세요...');
      setIsGenerating(true);

      try {
        // TTS 생성 API 호출
        const generateResponse = await fetch('/api/tts/notebooklm/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episodeId: episode.episodeId,
            language: effectiveLanguage,
            segments: episode.segments
          })
        });

        if (generateResponse.ok) {
          const result = await generateResponse.json();
          console.log('✅ TTS 생성 완료');

          // episode 업데이트
          if (result.data && result.data.segments) {
            setEpisode(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                status: 'completed',
                segments: prev.segments.map((seg, idx) => {
                  const newAudioUrl = result.data.segments[idx]?.audioUrl;
                  return newAudioUrl ? { ...seg, audioUrl: newAudioUrl } : seg;
                })
              };
            });
          }

          setError(null);
          // 재생 재시도
          await togglePlayPause();
        } else {
          setError('오디오 생성에 실패했습니다.');
        }
      } catch (error) {
        console.error('❌ TTS 생성 중 오류:', error);
        setError('오디오 생성 중 오류가 발생했습니다.');
      } finally {
        setIsGenerating(false);
      }
    }
    return;
  }

  // 기존 로직...
  if (isPlaying) {
    audioRef.current.pause();
  } else {
    if (audioRef.current.src !== currentSegment.audioUrl) {
      audioRef.current.src = currentSegment.audioUrl;
      audioRef.current.load();
      await audioRef.current.play();
    }
  }
}
```

### 수정 2: loadAndPlaySegment에서도 null 처리

**위치**: loadAndPlaySegment 함수

**추가 코드**:
```typescript
const loadAndPlaySegment = async (segmentIndex: number, shouldAutoPlay: boolean = isPlaying) => {
  const segment = episode.segments[segmentIndex];

  // ✅ NEW: audio_url이 null인 경우
  if (!segment.audioUrl) {
    console.warn('⚠️ 세그먼트의 오디오 URL이 없음:', segmentIndex);
    // 다음 세그먼트로 이동하거나 사용자에게 알림
    if (segmentIndex < episode.segments.length - 1) {
      // 다음 세그먼트 시도
      await loadAndPlaySegment(segmentIndex + 1, shouldAutoPlay);
    }
    return;
  }

  // 기존 로직...
}
```

### 수정 3: chapters 정보 재구성 (fallback)

**위치**: checkExistingPodcast 함수, 챕터 정보 생성 부분

**추가 코드**:
```typescript
// chapters가 비어있으면 DB 세그먼트로 재구성
if (chapterInfos.length === 0 && dbSegments && dbSegments.length > 0) {
  console.log('🔄 chapters 정보 없음 - DB 세그먼트로 재구성');

  const chapterMap = new Map<number, any[]>();
  dbSegments.forEach(seg => {
    const chapterIdx = seg.chapter_index || 0;
    if (!chapterMap.has(chapterIdx)) {
      chapterMap.set(chapterIdx, []);
    }
    chapterMap.get(chapterIdx)!.push(seg);
  });

  chapterMap.forEach((segments, chapterIdx) => {
    chapterInfos.push({
      chapterIndex: chapterIdx,
      title: `챕터 ${chapterIdx}`,
      description: `${segments.length}개 대화`,
      segmentCount: segments.length,
      estimatedDuration: segments.reduce((sum, seg) => sum + (seg.duration_seconds || 30), 0),
      contentFocus: []
    });
  });

  console.log(`✅ ${chapterInfos.length}개 챕터 재구성 완료`);
}
```

---

## 📊 검증 로드맵

### Phase 1: 긴급 수정 (이 주)
- [ ] audio_url이 null인 경우 처리
- [ ] TTS 생성 API 호출 로직 구현
- [ ] episode 상태 업데이트 (script_ready → completed)

### Phase 2: 개선 (다음 주)
- [ ] chapters 재구성 (fallback)
- [ ] 에러 처리 및 재시도 로직
- [ ] 사용자 피드백 개선

### Phase 3: 최적화 (2주 후)
- [ ] 병렬 처리 (여러 세그먼트 동시 TTS)
- [ ] 캐싱 (이미 생성된 오디오)
- [ ] 성능 모니터링

---

## 🧪 테스트 체크리스트

### 테스트 시나리오 1: script_ready 상태 팟캐스트 재생
```
준비:
- POST로 새 팟캐스트 생성 (status = 'script_ready')
- 모든 segment.audio_url = null

테스트:
1. 페이지 진입 → UI 표시 ✓
2. 재생 버튼 클릭
3. TTS 생성 시작 (진행률 표시) ✓
4. 모든 오디오 파일 생성 완료 ✓
5. 자동 재생 시작 ✓
6. 순차 재생 ✓
7. 완료 후 status = 'completed' ✓

예상 결과: 모든 단계에서 오류 없음
```

### 테스트 시나리오 2: 부분 null인 팟캐스트
```
준비:
- 기존 팟캐스트 (대부분 완성됨)
- 일부 segment.audio_url = null (예: 5개 중 2개)

테스트:
1. 정상 재생 가능 세그먼트 재생 ✓
2. null인 세그먼트로 점프
3. TTS 생성 (해당 세그먼트만) ✓
4. 재생 재개 ✓

예상 결과: 부분 재생 후 오류 없이 계속
```

### 테스트 시나리오 3: 정상 완성 팟캐스트
```
준비:
- 기존 완성 팟캐스트 (status = 'completed')
- 모든 segment.audio_url = valid_url

테스트:
1. 페이지 진입 → UI 표시 ✓
2. 재생 버튼 클릭 → 즉시 재생 ✓
3. 순차 재생 진행 ✓
4. 챕터 선택 시 점프 ✓

예상 결과: 원활한 재생 (변화 없음)
```


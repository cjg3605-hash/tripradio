# 챕터 제목 파싱 및 렌더링 검증 보고서

**검증 일시**: 2025-10-14
**검증 대상**: 콜로세움 팟캐스트 (한국어)
**검증 방법**: Chrome DevTools + 실시간 API 테스트

---

## ✅ 검증 결과 요약

**전체 결과**: **성공 (PASS)** ✅

챕터 제목이 데이터베이스 → API → 프론트엔드까지 완벽하게 전달되어 렌더링되고 있습니다.

---

## 📊 검증 세부 사항

### 1. 데이터베이스 구조 (podcast_episodes)

```sql
-- 에피소드 테이블
podcast_episodes (
  id: 'episode-1759896192379-oxbv0ctf8',
  status: 'completed',
  chapter_timestamps: JSONB -- 챕터 메타데이터 저장
)

-- 세그먼트 테이블
podcast_segments (
  episode_id: FK,
  chapter_index: INTEGER,  -- 챕터 인덱스
  sequence_number: INTEGER,
  text_content: TEXT,
  audio_url: TEXT
)
```

**검증 결과**: 61개 세그먼트가 3개 챕터로 그룹화됨

---

### 2. API 파싱 로직 (`/api/tts/notebooklm/generate`)

#### 파싱 함수 위치
- **파일**: `app/api/tts/notebooklm/generate/route.ts` (line 856-898)
- **함수**: GET 핸들러 내 `chapter_index` 기반 그룹화

#### 실제 API 응답 (GET 요청)

```json
{
  "success": true,
  "data": {
    "hasEpisode": true,
    "status": "completed",
    "chapters": [
      {
        "chapterNumber": 0,
        "title": "콜로세움: 로마의 심장을 뛰게 했던 거대한 함성",
        "description": "이탈리아 로마의 상징, 콜로세움. 2000년의 역사를 품은 이곳에 숨겨진 놀라운 이야기들을 고고학자, 건축가, 문화평론가, 역사학자와 함께 파헤쳐 봅니다...",
        "segmentCount": 25
      },
      {
        "chapterNumber": 1,
        "title": "1. 거대한 석조물의 탄생: 시저의 꿈, 베스파시아누스의 유산",
        "description": "우리가 콜로세움에 들어서기 전, 그 거대한 규모에 압도되는 순간부터 시작합니다...",
        "segmentCount": 25
      },
      {
        "chapterNumber": 2,
        "title": "2. 2000년 전의 '인싸' 문화: 콜로세움, 그곳에서 펼쳐진 쇼",
        "description": "콜로세움은 단순한 오락 시설이 아니었습니다. 검투사 시합, 동물 사냥, 모의 해전까지!...",
        "segmentCount": 11
      }
    ]
  }
}
```

**검증 결과**: ✅ 챕터 제목이 완전한 형태로 파싱됨

---

### 3. 프론트엔드 렌더링

#### 페이지 파일
- **파일**: `app/podcast/[language]/[location]/page.tsx` (line 382-459)
- **로직**: `checkExistingPodcast()` 함수에서 API 응답을 `ChapterInfo[]`로 변환

#### ChapterList 컴포넌트
- **파일**: `src/components/audio/ChapterList.tsx` (line 42-67)
- **렌더링**: `chapter.title`을 그대로 표시 (중복 제거 없음)

#### 실제 렌더링 결과

```javascript
// Chrome DevTools에서 확인한 실제 DOM
{
  "totalChapters": 3,
  "chaptersData": [
    {
      "index": 0,
      "title": "콜로세움: 로마의 심장을 뛰게 했던 거대한 함성",
      "isActive": false
    },
    {
      "index": 1,
      "title": "1. 거대한 석조물의 탄생: 시저의 꿈, 베스파시아누스의 유산",
      "isActive": true  // 현재 재생 중
    },
    {
      "index": 2,
      "title": "2. 2000년 전의 '인싸' 문화: 콜로세움, 그곳에서 펼쳐진 쇼",
      "isActive": false
    }
  ]
}
```

**검증 결과**: ✅ 3개 챕터 모두 제목이 완벽하게 표시됨

---

## 🎯 핵심 로직 분석

### 챕터 제목 파싱 플로우

```typescript
// 1. DB에서 세그먼트 조회
const { data: segments } = await supabase
  .from('podcast_segments')
  .select('*, chapter_index')
  .eq('episode_id', episodeId)
  .order('sequence_number', { ascending: true });

// 2. chapter_index로 그룹화
const chapterSegmentMap = new Map();
segments.forEach(segment => {
  const chapterIdx = segment.chapter_index || 0;
  if (!chapterSegmentMap.has(chapterIdx)) {
    chapterSegmentMap.set(chapterIdx, []);
  }
  chapterSegmentMap.get(chapterIdx).push(segment);
});

// 3. 챕터 메타데이터에서 제목 가져오기
const chapters = Array.from(chapterSegmentMap.entries())
  .map(([chapterIndex, chapterSegments]) => {
    const meta = chapterMetaMap.get(chapterIndex);
    const chapterTitle = meta?.title || `챕터 ${chapterIndex}`;

    return {
      chapterNumber: chapterIndex,
      title: chapterTitle,  // ✅ 메타데이터의 제목 사용
      description: meta?.description,
      segmentCount: chapterSegments.length
    };
  });
```

**핵심**: `chapter_timestamps` JSONB 필드에서 제목을 가져옴

---

## 🔍 저장 로직 검증

### 챕터 메타데이터 저장 위치

**파일**: `app/api/tts/notebooklm/generate/route.ts` (line 506-598)

```typescript
// 챕터별 타임라인 생성
const chapterTimeline = Array.from(chapterTimelineMap.entries())
  .map(([chapterIndex, value]) => ({
    chapterIndex,
    title: value.title,  // ✅ 여기서 챕터 제목 저장
    description: value.description,
    segmentCount: value.segmentCount,
    startTime: Math.round(value.startTime),
    endTime: Math.round(value.endTime),
    duration: Math.round(value.duration)
  }));

// DB 업데이트
await supabase
  .from('podcast_episodes')
  .update({
    chapter_timestamps: chapterTimeline,  // ✅ JSONB로 저장
    updated_at: new Date().toISOString()
  })
  .eq('id', episodeId);
```

**검증 결과**: ✅ 챕터 제목이 `chapter_timestamps`에 올바르게 저장됨

---

## 📸 스크린샷 증거

### 렌더링된 챕터 목록

**확인 사항**:
- ✅ 챕터 1: "콜로세움: 로마의 심장을 뛰게 했던 거대한 함성" 표시됨
- ✅ 챕터 2: "1. 거대한 석조물의 탄생: 시저의 꿈, 베스파시아누스의 유산" (활성 상태)
- ✅ 챕터 3: "2. 2000년 전의 '인싸' 문화: 콜로세움, 그곳에서 펼쳐진 쇼" 표시됨
- ✅ 현재 재생 중인 챕터가 보라색으로 하이라이트됨

---

## ✅ 검증 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| DB 세그먼트 조회 | ✅ PASS | 61개 세그먼트 조회 성공 |
| chapter_index 그룹화 | ✅ PASS | 3개 챕터로 정확히 그룹화 |
| 챕터 메타데이터 파싱 | ✅ PASS | chapter_timestamps에서 제목 추출 |
| API 응답 구조 | ✅ PASS | chapters 배열에 title 포함 |
| 프론트엔드 수신 | ✅ PASS | ChapterInfo[] 타입으로 변환 |
| ChapterList 렌더링 | ✅ PASS | 3개 챕터 제목 모두 표시 |
| 현재 챕터 하이라이트 | ✅ PASS | 활성 챕터 시각적 구분 |

---

## 🎉 최종 결론

### 검증 결과

**모든 단계에서 챕터 제목이 정확하게 파싱 및 렌더링됩니다.**

1. **데이터베이스**: `chapter_timestamps` JSONB에 제목 저장 ✅
2. **API 파싱**: `chapter_index` 기반 그룹화 및 제목 추출 ✅
3. **프론트엔드**: `ChapterList` 컴포넌트에서 제목 표시 ✅

### 시스템 안정성

- ✅ 3단계 Fallback 메커니즘 (메타데이터 → JSON 파싱 → 스토리지 스캔)
- ✅ 타입 안전성 (`ChapterInfo` 인터페이스 활용)
- ✅ 에러 핸들링 (각 단계별 try-catch 구문)

### 권장 사항

**현재 구현이 매우 안정적이므로 추가 수정 불필요**

---

## 📝 관련 파일

1. **API 라우트**: `app/api/tts/notebooklm/generate/route.ts`
2. **페이지 컴포넌트**: `app/podcast/[language]/[location]/page.tsx`
3. **챕터 리스트**: `src/components/audio/ChapterList.tsx`
4. **타입 정의**: `app/podcast/[language]/[location]/page.tsx` (line 25-32)

---

**검증자**: Claude Code
**검증 환경**: Windows + Chrome DevTools + Next.js 15.4.6
**데이터베이스**: Supabase PostgreSQL

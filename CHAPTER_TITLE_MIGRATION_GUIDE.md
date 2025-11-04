# Chapter Title 컬럼 추가 가이드

## 🎯 문제 상황

AI가 생성한 챕터명(`덴보데크`, `덴보 갤러리아` 등)을 데이터베이스에 저장하려고 하지만,
`podcast_segments` 테이블에 `chapter_title` 컬럼이 없어서 다음 에러가 발생합니다:

```
"Could not find the 'chapter_title' column of 'podcast_segments' in the schema cache"
```

## ✅ 해결 방법

### 1. Supabase Dashboard에서 SQL 실행

1. **Supabase Dashboard 접속**
   - URL: https://supabase.com/dashboard/project/fajiwgztfwoiisgnnams

2. **SQL Editor로 이동**
   - 좌측 메뉴에서 "SQL Editor" 클릭

3. **다음 SQL 복사 & 실행**

```sql
-- Add chapter_title column to podcast_segments table
ALTER TABLE podcast_segments
ADD COLUMN IF NOT EXISTS chapter_title TEXT;

-- Add index for faster chapter-based queries
CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter_title
ON podcast_segments(chapter_title);

-- Add comment
COMMENT ON COLUMN podcast_segments.chapter_title IS 'AI-generated chapter name for this segment (e.g., "덴보데크 (Tembo Deck)", "Dubai Aquarium")';
```

4. **Run (실행) 버튼 클릭**

5. **검증**
   - 다음 쿼리로 컬럼이 추가되었는지 확인:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'podcast_segments'
   ORDER BY ordinal_position;
   ```

## 📊 예상 결과

### Before (컬럼 추가 전)
```
podcast_segments 테이블
- id
- episode_id
- sequence_number
- speaker_type
- speaker_name
- text_content
- audio_url
- duration_seconds
- chapter_index         ← 챕터 번호만 있음 (0, 1, 2...)
- created_at
- updated_at
```

### After (컬럼 추가 후)
```
podcast_segments 테이블
- id
- episode_id
- sequence_number
- speaker_type
- speaker_name
- text_content
- audio_url
- duration_seconds
- chapter_index
- chapter_title         ← ✅ AI 생성 챕터명 저장 ("덴보데크", "Dubai Aquarium")
- created_at
- updated_at
```

## 🔄 마이그레이션 완료 후

1. **Dev 서버 재시작** (이미 재시작됨)
2. **새로운 장소로 테스트**
   ```bash
   curl -X POST http://localhost:3000/api/tts/notebooklm/generate \
     -H "Content-Type: application/json" \
     -d @test-louvre-request.json
   ```

3. **DB에서 chapter_title 확인**
   ```sql
   SELECT
     sequence_number,
     chapter_index,
     chapter_title,
     substring(text_content, 1, 50) as preview
   FROM podcast_segments
   WHERE episode_id = '<새로_생성된_episode_id>'
   ORDER BY sequence_number
   LIMIT 10;
   ```

## 📝 코드 변경 사항

### `app/api/tts/notebooklm/generate/route.ts` (Line 685)

**Before:**
```typescript
const segmentRecords = sortedSegments.map(segment => ({
  episode_id: actualEpisodeId,
  sequence_number: segment.sequenceNumber + sequenceOffset,
  speaker_type: segment.speakerType,
  speaker_name: segment.speakerType === 'male' ? 'Host' : 'Curator',
  text_content: segment.textContent,
  audio_url: null,
  file_size_bytes: 0,
  duration_seconds: segment.estimatedDuration || Math.ceil(segment.textContent.length / 8),
  chapter_index: segment.chapterIndex || 0
  // ❌ chapter_title 없음
}));
```

**After:**
```typescript
const segmentRecords = sortedSegments.map(segment => ({
  episode_id: actualEpisodeId,
  sequence_number: segment.sequenceNumber + sequenceOffset,
  speaker_type: segment.speakerType,
  speaker_name: segment.speakerType === 'male' ? 'Host' : 'Curator',
  text_content: segment.textContent,
  audio_url: null,
  file_size_bytes: 0,
  duration_seconds: segment.estimatedDuration || Math.ceil(segment.textContent.length / 8),
  chapter_index: segment.chapterIndex || 0,
  chapter_title: segment.chapterTitle || null  // ✅ AI 생성 챕터명 저장
}));
```

## 🎉 완료 후 기대 효과

1. **API 응답과 DB 일치**:
   - API: `"chapterTitle": "덴보데크 (Tembo Deck)"` ✅
   - DB: `chapter_title = "덴보데크 (Tembo Deck)"` ✅

2. **프론트엔드 렌더링 가능**:
   ```typescript
   // 이제 DB에서 직접 챕터명을 가져올 수 있음
   const segments = await supabase
     .from('podcast_segments')
     .select('chapter_title, text_content')
     .eq('episode_id', episodeId);

   segments.forEach(seg => {
     console.log(seg.chapter_title); // "덴보데크 (Tembo Deck)"
   });
   ```

3. **챕터별 검색/필터링**:
   ```sql
   -- 특정 챕터명으로 세그먼트 검색
   SELECT * FROM podcast_segments
   WHERE chapter_title ILIKE '%Tembo%';
   ```

---

**작성**: Claude Code
**일시**: 2025-10-30
**관련 이슈**: DB chapter_title 컬럼 누락
**해결**: SQL ALTER TABLE 실행 필요

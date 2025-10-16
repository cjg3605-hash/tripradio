# QA Validation Report: Podcast Page Content Validation

**Date:** 2025-01-13
**Task:** Validate that podcast page displays correct content from database
**Episode:** Colosseum (episode-1759896192379-oxbv0ctf8)
**Language:** Korean (ko)

---

## Executive Summary

✅ **TEXT CONTENT:** Database and UI match perfectly
✅ **SPEAKER MAPPING:** Correct (Host = male)
❌ **AUDIO URL:** Database stores RELATIVE paths, not full Supabase URLs

**ROOT CAUSE IDENTIFIED:** The database `audio_url` field contains relative paths (`audio/podcasts/colosseum/0-1ko.mp3`) instead of full Supabase Storage URLs (`https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3`).

---

## Validation Results

### 1. Segment 1 - Text Content Validation

```json
{
  "db_text": "안녕하세요, 여러분! TripRadio.AI의 진행자입니다. 새로운 여정의 시작을 알리는 설레는 소리와 함께 여러분을 찾아왔습니다. 오늘은 정말 특별한 곳, 바로 로마의 심장부이자",
  "ui_text": "안녕하세요, 여러분! TripRadio.AI의 진행자입니다. 새로운 여정의 시작을 알리는 설레는 소리와 함께 여러분을 찾아왔습니다. 오늘은 정말 특별한 곳, 바로 로마의 심장부이자...",
  "text_matches": true
}
```

**Status:** ✅ PASS
**Details:** Text content from database exactly matches what's displayed in the UI.

---

### 2. Speaker Name Mapping Validation

```json
{
  "db_speaker_name": "Host",
  "db_speaker_type": "male",
  "ui_speaker_display": "Host",
  "expected_mapping": "Host = male, Curator = female",
  "mapping_correct": true
}
```

**Status:** ✅ PASS
**Details:** Speaker mapping is correct. The UI correctly identifies "Host" speakers and displays them with the male icon.

**Code Reference (page.tsx:405):**
```typescript
speakerType: (seg.speaker_name === 'Host' || seg.speaker_type === 'male') ? 'male' : 'female'
```

---

### 3. Audio URL Storage Issue

```json
{
  "db_audio_url": "audio/podcasts/colosseum/0-1ko.mp3",
  "expected_format": "https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3",
  "actual_format_in_db": "audio/podcasts/colosseum/0-1ko.mp3",
  "ui_audio_url": "http://localhost:3000/podcast/ko/audio/podcasts/colosseum/0-1ko.mp3",
  "audio_url_correct": false
}
```

**Status:** ❌ FAIL
**Issue Type:** Data Storage Issue (Not UI Issue)

---

## Root Cause Analysis

### Problem Location

The issue is in **sequential-tts-generator.ts Line 755**:

```typescript
audio_url: file.filePath || file.supabaseUrl, // audio_url 필드에 저장
```

### What's Happening

1. **Upload Process (Line 627-629):**
   ```typescript
   const { data: urlData } = this.supabase.storage
     .from('audio')
     .getPublicUrl(filePath);
   ```

   This correctly generates: `https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/audio/podcasts/colosseum/0-1ko.mp3`

2. **DB Storage (Line 755):**
   ```typescript
   audio_url: file.filePath || file.supabaseUrl
   ```

   But `file.filePath` is set to `uploadResult.publicUrl` (Line 212), which **should be** the full URL.

### Deeper Investigation Required

The validation script revealed that the database contains:
```
audio/podcasts/colosseum/0-1ko.mp3
```

This suggests that **somewhere in the upload or DB insertion process**, the full URL is being stripped down to just the path.

### Possible Causes

1. **Supabase getPublicUrl() returns relative path** (unlikely, but needs verification)
2. **Old data from previous implementation** that stored relative paths
3. **Some middleware or transformation** stripping the domain from URLs before DB insertion

---

## Segments 2-5 Summary

All segments (1-5) have the same issue:

```json
{
  "segments_2_to_5": [
    {
      "sequence": 2,
      "speaker": "Curator",
      "chapter_index": 0,
      "has_correct_url": false,
      "audio_url": "audio/podcasts/colosseum/0-2ko.mp3"
    },
    {
      "sequence": 3,
      "speaker": "Host",
      "chapter_index": 0,
      "has_correct_url": false,
      "audio_url": "audio/podcasts/colosseum/0-3ko.mp3"
    },
    {
      "sequence": 4,
      "speaker": "Curator",
      "chapter_index": 0,
      "has_correct_url": false,
      "audio_url": "audio/podcasts/colosseum/0-4ko.mp3"
    },
    {
      "sequence": 5,
      "speaker": "Host",
      "chapter_index": 0,
      "has_correct_url": false,
      "audio_url": "audio/podcasts/colosseum/0-5ko.mp3"
    }
  ],
  "summary": {
    "total_segments_checked": 5,
    "db_audio_urls_correct": 0,
    "db_audio_urls_incorrect": 5,
    "issue": "All segments store relative paths instead of full Supabase URLs"
  }
}
```

---

## Fix Recommendations

### Option 1: Fix at Database Level (Recommended)

**Run a migration script to update existing records:**

```sql
UPDATE podcast_segments
SET audio_url = 'https://fajiwgztfwoiisgnnams.supabase.co/storage/v1/object/public/' || audio_url
WHERE audio_url NOT LIKE 'https://%';
```

### Option 2: Fix in TTS Generator

**Add debugging to sequential-tts-generator.ts Line 210-212:**

```typescript
supabaseUrl: uploadResult.publicUrl,
textContent: segment.textContent,
filePath: uploadResult.publicUrl,  // Verify this is actually full URL
```

**Add console.log before Line 755:**

```typescript
console.log('🔍 Audio URL being stored:', {
  filePath: file.filePath,
  supabaseUrl: file.supabaseUrl,
  finalValue: file.filePath || file.supabaseUrl
});
```

### Option 3: Fix in UI (Temporary Workaround)

**page.tsx Line 403-411 - Add URL normalization:**

```typescript
allSegments = dbSegments.map((seg: any) => ({
  sequenceNumber: seg.sequence_number,
  speakerType: (seg.speaker_name === 'Host' || seg.speaker_type === 'male') ? 'male' : 'female',
  audioUrl: seg.audio_url.startsWith('http')
    ? seg.audio_url
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${seg.audio_url}`,
  duration: seg.duration_seconds || 30,
  textContent: seg.text_content || '',
  chapterIndex: seg.chapter_index,
  chapterTitle: chapterInfos.find(ch => ch.chapterIndex === seg.chapter_index)?.title || ''
}));
```

---

## Testing Plan

### Immediate Test

1. Create a new episode for a test location
2. Monitor console logs during TTS generation
3. Check if `uploadResult.publicUrl` contains full URL
4. Verify DB entry after generation

### Verification Query

```sql
SELECT
  episode_id,
  sequence_number,
  speaker_name,
  LENGTH(audio_url) as url_length,
  audio_url,
  CASE
    WHEN audio_url LIKE 'https://%' THEN 'Full URL'
    ELSE 'Relative Path'
  END as url_type
FROM podcast_segments
WHERE episode_id = 'episode-1759896192379-oxbv0ctf8'
ORDER BY sequence_number
LIMIT 5;
```

---

## Conclusion

### What's Working

- ✅ Text content is correctly stored and displayed
- ✅ Speaker mapping is accurate
- ✅ Chapter indexing is correct
- ✅ UI page.tsx logic is handling data correctly

### What Needs Fixing

- ❌ **Database stores relative paths instead of full Supabase URLs**
- ❌ Need to identify where URL transformation happens
- ❌ Need migration script for existing data

### Priority

**HIGH** - While audio may still play if browser/Supabase handles relative paths, this is not the intended design per CLAUDE.md:

```typescript
// Expected format from CLAUDE.md
audio_url: "https://{SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/audio/podcasts/{slug}/{filename}"
```

### Next Steps

1. Add debug logging to `uploadToSupabase()` function
2. Generate a new test episode and monitor logs
3. Run SQL migration for existing data
4. Add validation in TTS generator to ensure full URLs
5. Update tests to verify URL format

---

**Report Generated By:** QA Validation Script
**Script Location:** C:\GUIDEAI\validate-colosseum-segments.js
**Database:** Supabase (podcast_segments table)

-- Add chapter_title column to podcast_segments table
-- This stores the AI-generated chapter name for each segment

ALTER TABLE podcast_segments
ADD COLUMN IF NOT EXISTS chapter_title TEXT;

-- Add index for faster chapter-based queries
CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter_title
ON podcast_segments(chapter_title);

-- Update comment
COMMENT ON COLUMN podcast_segments.chapter_title IS 'AI-generated chapter name for this segment (e.g., "덴보데크 (Tembo Deck)", "Dubai Aquarium")';

-- podcast_segments 테이블에 chapter_index 컬럼 추가
-- 챕터별로 파일명을 구분하기 위한 스키마 개선

DO $$
BEGIN
    -- chapter_index 컬럼 추가 (0-based 챕터 인덱스)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcast_segments' AND column_name = 'chapter_index'
    ) THEN
        ALTER TABLE podcast_segments ADD COLUMN chapter_index INTEGER NOT NULL DEFAULT 0;
        
        -- 인덱스 추가 (성능 최적화)
        CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter ON podcast_segments(episode_id, chapter_index);
        CREATE INDEX IF NOT EXISTS idx_podcast_segments_chapter_seq ON podcast_segments(episode_id, chapter_index, sequence_number);
        
        RAISE NOTICE 'chapter_index 컬럼이 성공적으로 추가되었습니다!';
    ELSE
        RAISE NOTICE 'chapter_index 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 기존 데이터 업데이트 (sequence_number 기반으로 챕터 추정)
-- 1-25: 챕터 0, 26-50: 챕터 1, 51-75: 챕터 2, etc.
UPDATE podcast_segments 
SET chapter_index = CASE 
    WHEN sequence_number <= 25 THEN 0
    WHEN sequence_number <= 50 THEN 1
    WHEN sequence_number <= 75 THEN 2
    WHEN sequence_number <= 100 THEN 3
    WHEN sequence_number <= 125 THEN 4
    ELSE 5
END
WHERE chapter_index = 0;  -- 기본값만 업데이트

-- 확인 쿼리
SELECT 
    chapter_index,
    COUNT(*) as segment_count,
    MIN(sequence_number) as min_seq,
    MAX(sequence_number) as max_seq
FROM podcast_segments 
WHERE episode_id = 'test-episode-1735384084866'
GROUP BY chapter_index 
ORDER BY chapter_index;
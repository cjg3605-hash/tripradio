-- podcast_episodes 테이블에 chapter 관련 컬럼 추가
DO $$
BEGIN
    -- chapter_type 컬럼 추가 (intro, main, conclusion 등)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcast_episodes' AND column_name = 'chapter_type'
    ) THEN
        ALTER TABLE podcast_episodes ADD COLUMN chapter_type VARCHAR(20) DEFAULT 'full';
    END IF;
    
    -- chapter_number 컬럼 추가 (챕터 번호)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'podcast_episodes' AND column_name = 'chapter_number'
    ) THEN
        ALTER TABLE podcast_episodes ADD COLUMN chapter_number INTEGER DEFAULT 1;
    END IF;
END $$;

-- 기존 유니크 제약조건 제거하고 새로운 제약조건 추가
DO $$
BEGIN
    -- 기존 제약조건 제거
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'podcast_episodes_guide_id_language_version_key') THEN
        ALTER TABLE podcast_episodes DROP CONSTRAINT podcast_episodes_guide_id_language_version_key;
    END IF;
    
    -- 새로운 유니크 제약조건: 같은 가이드의 같은 언어, 같은 챕터 타입, 같은 챕터 번호는 하나만
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'podcast_episodes_unique_chapter') THEN
        ALTER TABLE podcast_episodes ADD CONSTRAINT podcast_episodes_unique_chapter 
        UNIQUE(guide_id, language, chapter_type, chapter_number, version);
    END IF;
END $$;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_chapter ON podcast_episodes(guide_id, language, chapter_type, chapter_number);

SELECT 'podcast_episodes 테이블에 chapter_type, chapter_number 컬럼 추가 완료! 🎙️' as status;
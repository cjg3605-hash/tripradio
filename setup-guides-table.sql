-- Guides 테이블 설정 스크립트 (Supabase SQL Editor에서 실행)
-- ⚠️ 기존 테이블이 있는 경우를 고려한 안전한 업데이트 스크립트

-- 1. 기존 RLS 정책 제거 (있는 경우)
DROP POLICY IF EXISTS "Anyone can read guides" ON guides;
DROP POLICY IF EXISTS "Service role can insert guides" ON guides;
DROP POLICY IF EXISTS "Service role can update guides" ON guides;
DROP POLICY IF EXISTS "Service role can delete guides" ON guides;

-- 2. Guides 테이블 생성 (없는 경우에만)
CREATE TABLE IF NOT EXISTS guides (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    locationname TEXT NOT NULL,
    language TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UNIQUE 제약조건 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'guides_location_language_unique' 
        AND table_name = 'guides'
    ) THEN
        ALTER TABLE guides ADD CONSTRAINT guides_location_language_unique UNIQUE (locationname, language);
    END IF;
END $$;

-- 4. Audio Files 테이블 생성 (챕터별 오디오 관리)
CREATE TABLE IF NOT EXISTS audio_files (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    guide_id TEXT NOT NULL,
    chapter_index INTEGER NOT NULL DEFAULT 0,
    language TEXT NOT NULL DEFAULT 'ko-KR',
    file_path TEXT NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audio Files 테이블 컬럼 추가 (기존 테이블에 없는 경우에만)
DO $$
BEGIN
    -- chapter_index 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'chapter_index'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN chapter_index INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- language 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'language'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN language TEXT NOT NULL DEFAULT 'ko-KR';
    END IF;
    
    -- file_size 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'file_size'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN file_size INTEGER;
    END IF;
    
    -- duration_seconds 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'duration_seconds'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN duration_seconds INTEGER;
    END IF;
END $$;

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_guides_locationname ON guides(locationname);
CREATE INDEX IF NOT EXISTS idx_guides_language ON guides(language);
CREATE INDEX IF NOT EXISTS idx_guides_location_lang ON guides(locationname, language);
CREATE INDEX IF NOT EXISTS idx_guides_created_at ON guides(created_at);

-- Audio Files 인덱스
CREATE INDEX IF NOT EXISTS idx_audio_files_guide_id ON audio_files(guide_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_guide_chapter ON audio_files(guide_id, chapter_index);
CREATE INDEX IF NOT EXISTS idx_audio_files_guide_lang ON audio_files(guide_id, language);
CREATE INDEX IF NOT EXISTS idx_audio_files_created_at ON audio_files(created_at);

-- 7. UNIQUE 제약조건 추가 (중복 방지)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audio_files_unique_chapter' 
        AND table_name = 'audio_files'
    ) THEN
        ALTER TABLE audio_files ADD CONSTRAINT audio_files_unique_chapter 
        UNIQUE (guide_id, chapter_index, language);
    END IF;
END $$;

-- 8. RLS (Row Level Security) 설정
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- 9. 올바른 RLS 정책 생성
-- ✅ SELECT: USING 사용
CREATE POLICY "Anyone can read guides" ON guides 
    FOR SELECT 
    TO authenticated, anon 
    USING (true);

CREATE POLICY "Anyone can read audio files" ON audio_files 
    FOR SELECT 
    TO authenticated, anon 
    USING (true);

-- ✅ INSERT: WITH CHECK 사용 (USING 아님!)
CREATE POLICY "Service role can insert guides" ON guides 
    FOR INSERT 
    TO service_role 
    WITH CHECK (true);

CREATE POLICY "Service role can insert audio files" ON audio_files 
    FOR INSERT 
    TO service_role 
    WITH CHECK (true);

-- ✅ UPDATE: USING과 WITH CHECK 모두 사용
CREATE POLICY "Service role can update guides" ON guides 
    FOR UPDATE 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Service role can update audio files" ON audio_files 
    FOR UPDATE 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ✅ DELETE: USING 사용
CREATE POLICY "Service role can delete guides" ON guides 
    FOR DELETE 
    TO service_role 
    USING (true);

CREATE POLICY "Service role can delete audio files" ON audio_files 
    FOR DELETE 
    TO service_role 
    USING (true);

-- 10. 권한 설정
GRANT ALL ON guides TO service_role;
GRANT ALL ON audio_files TO service_role;
GRANT SELECT ON guides TO authenticated, anon;
GRANT SELECT ON audio_files TO authenticated, anon;

-- 11. 테이블 코멘트
COMMENT ON TABLE guides IS 'AI 생성 가이드 저장소 - 위치별, 언어별 캐싱';
COMMENT ON COLUMN guides.locationname IS '정규화된 위치명 (소문자, 공백정리)';
COMMENT ON COLUMN guides.language IS '언어 코드 (ko, en, ja 등)';
COMMENT ON COLUMN guides.content IS 'AI 생성 가이드 JSON 데이터';

-- 12. 설정 완료 확인
SELECT 'Guides 테이블 설정 완료!' as status;

-- 13. 테이블 구조 확인 쿼리 (선택사항)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'guides' 
-- ORDER BY ordinal_position; 
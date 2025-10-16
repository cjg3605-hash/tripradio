-- Guides 테이블 설정 스크립트 (Supabase SQL Editor에서 실행)
-- ⚠️ 기존 테이블이 있는 경우를 고려한 안전한 업데이트 스크립트

-- 1. 기존 RLS 정책 제거 (있는 경우)
DROP POLICY IF EXISTS "Anyone can read guides" ON guides;
DROP POLICY IF EXISTS "Service role can insert guides" ON guides;
DROP POLICY IF EXISTS "Service role can update guides" ON guides;
DROP POLICY IF EXISTS "Service role can delete guides" ON guides;

-- 🚨 audio_files 관련 정책도 안전하게 제거
DROP POLICY IF EXISTS "Anyone can read audio files" ON audio_files;
DROP POLICY IF EXISTS "Service role can insert audio files" ON audio_files;
DROP POLICY IF EXISTS "Service role can update audio files" ON audio_files;
DROP POLICY IF EXISTS "Service role can delete audio files" ON audio_files;

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
        ALTER TABLE guides ADD CONSTRAINT guides_location_language_unique 
        UNIQUE (locationname, language);
    END IF;
END $$;

-- ===============================
-- 🚀 간단하고 안전한 방법: 챕터별 상세 내용 관리
-- ===============================

-- 4. Guide Chapters 테이블 생성 (외래키 제약조건 없이 먼저 생성)
CREATE TABLE IF NOT EXISTS guide_chapters (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    guide_id TEXT NOT NULL, -- guides.id와 연결 (외래키는 나중에 추가)
    chapter_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    
    -- 통합 필드 (새로운 방식)
    narrative TEXT, -- 하나의 연속된 오디오 가이드 스토리
    next_direction TEXT, -- 다음 지점으로의 이동 안내
    
    -- 기존 개별 필드들 (하위 호환성)
    scene_description TEXT,
    core_narrative TEXT,
    human_stories TEXT,
    
    -- 위치 정보
    latitude DECIMAL,
    longitude DECIMAL,
    
    -- 좌표 정확도 및 검증 필드
    coordinate_accuracy DECIMAL(3,2) DEFAULT 0.0 CHECK (coordinate_accuracy >= 0.0 AND coordinate_accuracy <= 1.0),
    regeneration_attempts INTEGER DEFAULT 0,
    validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'verified', 'failed', 'manual')),
    last_validated_at TIMESTAMPTZ,
    validation_source VARCHAR(50), -- 'google_places', 'manual', 'ai_generated' 등
    coordinate_confidence DECIMAL(3,2) DEFAULT 0.0 CHECK (coordinate_confidence >= 0.0 AND coordinate_confidence <= 1.0),
    
    -- 메타데이터
    duration_seconds INTEGER,
    audio_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 유니크 제약조건 (같은 가이드의 같은 챕터는 하나만)
    UNIQUE(guide_id, chapter_index)
);

-- 5. Audio Files 테이블 생성 (없는 경우에만)
CREATE TABLE IF NOT EXISTS audio_files (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    guide_id TEXT NOT NULL,
    chapter_index INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 유니크 제약조건
    UNIQUE(guide_id, chapter_index)
);

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_guides_location_language ON guides(locationname, language);
CREATE INDEX IF NOT EXISTS idx_guide_chapters_guide_id ON guide_chapters(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_chapters_chapter_index ON guide_chapters(chapter_index);
CREATE INDEX IF NOT EXISTS idx_audio_files_guide_id ON audio_files(guide_id);

-- 7. Updated_at 자동 업데이트 함수 생성 (없는 경우에만)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger 생성 (updated_at 자동 업데이트)
DROP TRIGGER IF EXISTS update_guides_updated_at ON guides;
CREATE TRIGGER update_guides_updated_at
    BEFORE UPDATE ON guides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guide_chapters_updated_at ON guide_chapters;
CREATE TRIGGER update_guide_chapters_updated_at
    BEFORE UPDATE ON guide_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. RLS 활성화
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

-- 10. RLS 정책 생성 (안전한 방식)
DO $$
BEGIN
    -- guides 테이블 정책들
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guides' AND policyname = 'Anyone can read guides') THEN
        CREATE POLICY "Anyone can read guides" ON guides FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guides' AND policyname = 'Service role can insert guides') THEN
        CREATE POLICY "Service role can insert guides" ON guides FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guides' AND policyname = 'Service role can update guides') THEN
        CREATE POLICY "Service role can update guides" ON guides FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guides' AND policyname = 'Service role can delete guides') THEN
        CREATE POLICY "Service role can delete guides" ON guides FOR DELETE USING (true);
    END IF;

    -- guide_chapters 테이블 정책들
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guide_chapters' AND policyname = 'Anyone can read guide chapters') THEN
        CREATE POLICY "Anyone can read guide chapters" ON guide_chapters FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guide_chapters' AND policyname = 'Service role can insert guide chapters') THEN
        CREATE POLICY "Service role can insert guide chapters" ON guide_chapters FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guide_chapters' AND policyname = 'Service role can update guide chapters') THEN
        CREATE POLICY "Service role can update guide chapters" ON guide_chapters FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guide_chapters' AND policyname = 'Service role can delete guide chapters') THEN
        CREATE POLICY "Service role can delete guide chapters" ON guide_chapters FOR DELETE USING (true);
    END IF;

    -- audio_files 테이블 정책들
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_files' AND policyname = 'Anyone can read audio files') THEN
        CREATE POLICY "Anyone can read audio files" ON audio_files FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_files' AND policyname = 'Service role can insert audio files') THEN
        CREATE POLICY "Service role can insert audio files" ON audio_files FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_files' AND policyname = 'Service role can update audio files') THEN
        CREATE POLICY "Service role can update audio files" ON audio_files FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audio_files' AND policyname = 'Service role can delete audio files') THEN
        CREATE POLICY "Service role can delete audio files" ON audio_files FOR DELETE USING (true);
    END IF;
END $$;

-- 11. 좌표 동기화 함수 생성
CREATE OR REPLACE FUNCTION sync_coordinates_to_guides()
RETURNS TRIGGER AS $$
BEGIN
    -- guide_chapters의 좌표가 변경되면 guides 테이블의 JSONB도 자동 업데이트
    UPDATE guides 
    SET 
        content = jsonb_set(
            content,
            '{realTimeGuide,chapters}',
            (
                SELECT jsonb_agg(
                    CASE 
                        WHEN (chapter_data->>'id')::INTEGER = NEW.chapter_index 
                        THEN jsonb_set(
                            jsonb_set(
                                chapter_data,
                                '{location,lat}',
                                to_jsonb(NEW.latitude)
                            ),
                            '{location,lng}',
                            to_jsonb(NEW.longitude)
                        )
                        ELSE chapter_data
                    END
                )
                FROM jsonb_array_elements(content->'realTimeGuide'->'chapters') AS chapter_data
                WHERE content->'realTimeGuide'->'chapters' IS NOT NULL
            )
        ),
        updated_at = NOW()
    WHERE id = NEW.guide_id
    AND content->'realTimeGuide'->'chapters' IS NOT NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. 좌표 동기화 트리거 생성
DROP TRIGGER IF EXISTS sync_coordinates_trigger ON guide_chapters;
CREATE TRIGGER sync_coordinates_trigger
    AFTER UPDATE OF latitude, longitude ON guide_chapters
    FOR EACH ROW
    WHEN (NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude)
    EXECUTE FUNCTION sync_coordinates_to_guides();

-- 13. 좌표 정확도 업데이트 함수
CREATE OR REPLACE FUNCTION update_coordinate_accuracy()
RETURNS TRIGGER AS $$
BEGIN
    -- 좌표가 수동으로 설정되거나 검증되면 accuracy 향상
    IF NEW.validation_status = 'verified' AND OLD.validation_status != 'verified' THEN
        NEW.coordinate_accuracy = GREATEST(NEW.coordinate_accuracy, 0.9);
        NEW.last_validated_at = NOW();
    ELSIF NEW.validation_status = 'manual' THEN
        NEW.coordinate_accuracy = 1.0;
        NEW.coordinate_confidence = 1.0;
        NEW.last_validated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. 좌표 정확도 트리거 생성
DROP TRIGGER IF EXISTS update_coordinate_accuracy_trigger ON guide_chapters;
CREATE TRIGGER update_coordinate_accuracy_trigger
    BEFORE UPDATE ON guide_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_coordinate_accuracy();

-- 15. 성공 메시지
SELECT 'Guides 테이블 및 좌표 동기화 시스템 설정 완료! 🎉' as status;

-- 12. 설정 확인 쿼리 (선택사항)
-- SELECT 'Guides 테이블을 성공적으로 설정했습니다!' as status;

-- 13. 테이블 구조 확인 (선택사항)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'guides' 
-- ORDER BY ordinal_position;

-- 14. 챕터 테이블 확인 (선택사항)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'guide_chapters' 
-- ORDER BY ordinal_position;

-- 15. 데이터 구조 확인 쿼리 (설명서용)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'guides'
-- ORDER BY ordinal_position; 
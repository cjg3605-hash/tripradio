-- 성능 최적화를 위한 인덱스 생성
-- 실행 방법: Supabase 대시보드 > SQL 에디터에서 실행

-- 가이드 테이블 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_guides_location_language 
ON guides(locationname, language);

CREATE INDEX IF NOT EXISTS idx_guides_created_at 
ON guides(created_at DESC);

-- 품질 피드백 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_quality_feedback_location_date 
ON quality_feedback(location_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quality_feedback_guide_id 
ON quality_feedback(guide_id);

-- 오디오 파일 테이블 인덱스 (존재하는 경우)
CREATE INDEX IF NOT EXISTS idx_audio_files_guide_chapter 
ON audio_files(guide_id, chapter_index);

-- 인덱스 생성 확인 쿼리
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('guides', 'quality_feedback', 'audio_files')
ORDER BY tablename, indexname;
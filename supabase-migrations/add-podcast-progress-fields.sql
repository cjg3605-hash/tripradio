-- =====================================================
-- 팟캐스트 진행률 추적 필드 추가 Migration
-- =====================================================
--
-- 목적: 팟캐스트 생성 진행 상황을 실시간으로 추적하기 위한 필드 추가
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
--
-- =====================================================

-- 1. podcast_episodes 테이블에 진행률 필드 추가
ALTER TABLE podcast_episodes
ADD COLUMN IF NOT EXISTS generation_progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_chapter_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_chapter_title TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS total_chapters INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS generation_step TEXT DEFAULT 'initializing';

-- 2. 진행률 필드에 대한 주석 추가
COMMENT ON COLUMN podcast_episodes.generation_progress IS '팟캐스트 생성 진행률 (0-100)';
COMMENT ON COLUMN podcast_episodes.current_chapter_index IS '현재 생성 중인 챕터 인덱스';
COMMENT ON COLUMN podcast_episodes.current_chapter_title IS '현재 생성 중인 챕터 제목';
COMMENT ON COLUMN podcast_episodes.total_chapters IS '전체 챕터 수';
COMMENT ON COLUMN podcast_episodes.generation_step IS '생성 단계: initializing, analyzing, generating_intro, generating_chapter, finalizing, completed, error';

-- 3. 진행률 조회 성능 최적화를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_status_progress
ON podcast_episodes(status, generation_progress)
WHERE status IN ('generating', 'script_ready');

-- 4. 현재 생성 중인 에피소드 빠른 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_generating
ON podcast_episodes(location_slug, language, status)
WHERE status = 'generating';

-- 5. 기존 레코드의 진행률 필드 초기화 (completed 상태는 100%, 나머지는 0%)
UPDATE podcast_episodes
SET
  generation_progress = CASE
    WHEN status = 'completed' THEN 100
    WHEN status = 'script_ready' THEN 100
    ELSE 0
  END,
  generation_step = CASE
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'script_ready' THEN 'completed'
    WHEN status = 'failed' THEN 'error'
    ELSE 'initializing'
  END,
  total_chapters = COALESCE(
    (SELECT COUNT(DISTINCT chapter_index)
     FROM podcast_segments
     WHERE episode_id = podcast_episodes.id),
    0
  )
WHERE generation_progress IS NULL OR generation_progress = 0;

-- 6. 진행률 검증 제약 조건 추가
ALTER TABLE podcast_episodes
ADD CONSTRAINT check_generation_progress_range
CHECK (generation_progress >= 0 AND generation_progress <= 100);

ALTER TABLE podcast_episodes
ADD CONSTRAINT check_generation_step_valid
CHECK (generation_step IN (
  'initializing',
  'analyzing',
  'generating_intro',
  'generating_chapter',
  'finalizing',
  'completed',
  'error'
));

-- 7. 마이그레이션 완료 확인 쿼리
-- (주석 해제 후 실행하여 확인 가능)
-- SELECT
--   column_name,
--   data_type,
--   column_default,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'podcast_episodes'
-- AND column_name IN (
--   'generation_progress',
--   'current_chapter_index',
--   'current_chapter_title',
--   'total_chapters',
--   'generation_step'
-- )
-- ORDER BY ordinal_position;

-- ✅ Migration 완료

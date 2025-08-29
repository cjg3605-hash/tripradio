-- 팟캐스트 DB 제약조건 수정 스크립트
-- 98-99% 실패 문제 해결을 위한 DB 스키마 수정

-- 1. 기존 제약조건 확인
DO $$ 
BEGIN
  RAISE NOTICE '현재 podcast_episodes 테이블의 제약조건 확인 중...';
END $$;

-- 현재 제약조건 조회
SELECT 
  constraint_name, 
  constraint_type, 
  check_clause 
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'podcast_episodes' 
  AND tc.constraint_type = 'CHECK';

-- 2. 기존 잘못된 제약조건 제거 (있다면)
DO $$
BEGIN
  -- podcast_episodes_status_check 제약조건이 존재하면 제거
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'podcast_episodes_status_check' 
      AND table_name = 'podcast_episodes'
  ) THEN
    ALTER TABLE podcast_episodes DROP CONSTRAINT podcast_episodes_status_check;
    RAISE NOTICE '기존 status 제약조건을 제거했습니다.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '제약조건 제거 중 오류 (무시해도 됨): %', SQLERRM;
END $$;

-- 3. 새로운 올바른 제약조건 추가
ALTER TABLE podcast_episodes 
ADD CONSTRAINT podcast_episodes_status_check 
CHECK (status IN ('generating', 'completed', 'failed', 'processing', 'pending'));

-- 4. 누락된 컬럼 추가 (존재하지 않는 경우에만)
DO $$
BEGIN
  -- file_count 컬럼 추가 (존재하지 않는 경우)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'podcast_episodes' 
      AND column_name = 'file_count'
  ) THEN
    ALTER TABLE podcast_episodes ADD COLUMN file_count INTEGER DEFAULT 0;
    RAISE NOTICE 'file_count 컬럼을 추가했습니다.';
  ELSE
    RAISE NOTICE 'file_count 컬럼이 이미 존재합니다.';
  END IF;

  -- segment_count 컬럼 추가 (존재하지 않는 경우)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'podcast_episodes' 
      AND column_name = 'segment_count'
  ) THEN
    ALTER TABLE podcast_episodes ADD COLUMN segment_count INTEGER DEFAULT 0;
    RAISE NOTICE 'segment_count 컬럼을 추가했습니다.';
  ELSE
    RAISE NOTICE 'segment_count 컬럼이 이미 존재합니다.';
  END IF;

  -- total_size 컬럼 추가 (존재하지 않는 경우)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'podcast_episodes' 
      AND column_name = 'total_size'
  ) THEN
    ALTER TABLE podcast_episodes ADD COLUMN total_size BIGINT DEFAULT 0;
    RAISE NOTICE 'total_size 컬럼을 추가했습니다.';
  ELSE
    RAISE NOTICE 'total_size 컬럼이 이미 존재합니다.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '컬럼 추가 중 오류: %', SQLERRM;
END $$;

-- 5. 인덱스 최적화
DO $$
BEGIN
  -- location_slug + language 복합 인덱스 (존재하지 않는 경우에만)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_podcast_episodes_location_language'
  ) THEN
    CREATE INDEX idx_podcast_episodes_location_language 
    ON podcast_episodes (location_slug, language);
    RAISE NOTICE '복합 인덱스를 생성했습니다.';
  ELSE
    RAISE NOTICE '복합 인덱스가 이미 존재합니다.';
  END IF;

  -- status 인덱스 (존재하지 않는 경우에만)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_podcast_episodes_status'
  ) THEN
    CREATE INDEX idx_podcast_episodes_status ON podcast_episodes (status);
    RAISE NOTICE 'status 인덱스를 생성했습니다.';
  ELSE
    RAISE NOTICE 'status 인덱스가 이미 존재합니다.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '인덱스 생성 중 오류: %', SQLERRM;
END $$;

-- 6. 기존 잘못된 상태값 정리
UPDATE podcast_episodes 
SET status = 'failed' 
WHERE status NOT IN ('generating', 'completed', 'failed', 'processing', 'pending');

-- 7. 최종 확인
DO $$ 
BEGIN
  RAISE NOTICE '=== DB 제약조건 수정 완료 ===';
  RAISE NOTICE '허용된 status 값: generating, completed, failed, processing, pending';
  RAISE NOTICE '추가된 컬럼: file_count, segment_count, total_size';
  RAISE NOTICE '생성된 인덱스: location_slug+language, status';
END $$;

-- 8. 현재 상태 확인
SELECT 
  COUNT(*) as total_episodes,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'generating' THEN 1 END) as generating,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM podcast_episodes;
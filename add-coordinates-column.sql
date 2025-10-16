-- guides 테이블에 coordinates JSONB 컬럼 추가
-- 사용자 요구사항에 따른 챕터별 좌표 저장용

-- 1. coordinates 컬럼 추가 (안전하게)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' AND column_name = 'coordinates'
    ) THEN
        ALTER TABLE guides ADD COLUMN coordinates JSONB;
        RAISE NOTICE 'coordinates JSONB 컬럼이 guides 테이블에 추가되었습니다.';
    ELSE
        RAISE NOTICE 'coordinates 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 2. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_guides_coordinates ON guides USING GIN (coordinates);

-- 3. 성공 메시지
SELECT 'guides 테이블 coordinates 컬럼 추가 완료!' as status;

-- 4. 테이블 구조 확인 (선택사항)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'guides' 
-- ORDER BY ordinal_position;
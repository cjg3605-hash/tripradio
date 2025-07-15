-- Guides 테이블 데이터 정리 스크립트
-- 🚨 주의: 이 스크립트는 문제 해결을 위한 것입니다. 필요시에만 실행하세요.

-- 1. 현재 상태 확인
SELECT 'guides 테이블 현재 상태' AS info;
SELECT locationname, language, created_at, 
       length(content::text) as content_length
FROM guides 
ORDER BY created_at DESC;

-- 2. 문제가 되는 '경복궁' 레코드 확인
SELECT 'economictec궁 관련 레코드' AS info;
SELECT id, locationname, language, created_at
FROM guides 
WHERE locationname ILIKE '%경복궁%' OR locationname ILIKE '%경복%';

-- 3. 필요시 문제 레코드 삭제 (주석 해제하여 사용)
-- DELETE FROM guides WHERE locationname = '경복궁' AND language = 'ko';

-- 4. 삭제 후 상태 확인
-- SELECT 'deletion완료 후 상태' AS info;
-- SELECT COUNT(*) as total_guides FROM guides;

-- 5. 테이블 구조와 제약조건 재확인
SELECT 'guides 테이블 제약조건' AS info;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'guides';

-- 6. 인덱스 상태 확인
SELECT 'guides 테이블 인덱스' AS info;
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'guides'; 
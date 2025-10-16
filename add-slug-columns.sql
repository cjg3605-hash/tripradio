-- podcast_episodes 테이블에 슬러그 관련 칼럼 3개 추가
-- 실행 전에 현재 테이블 구조 확인: \d podcast_episodes

ALTER TABLE podcast_episodes 
ADD COLUMN IF NOT EXISTS location_input TEXT,
ADD COLUMN IF NOT EXISTS location_slug TEXT,
ADD COLUMN IF NOT EXISTS slug_source TEXT CHECK (slug_source IN ('cache', 'ai', 'fallback'));

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_location_slug ON podcast_episodes(location_slug, language);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_location_input ON podcast_episodes(location_input, language);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_slug_source ON podcast_episodes(slug_source);

-- 기존 데이터에 대한 초기값 설정 (선택적)
-- UPDATE podcast_episodes 
-- SET location_input = CASE 
--   WHEN title LIKE '%대영박물관%' THEN '대영박물관'
--   WHEN title LIKE '%에펠탑%' THEN '에펠탑'
--   ELSE SPLIT_PART(title, ' 팟캐스트', 1)
-- END,
-- slug_source = 'fallback'
-- WHERE location_input IS NULL;

-- 변경사항 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'podcast_episodes' 
AND column_name IN ('location_input', 'location_slug', 'slug_source')
ORDER BY column_name;
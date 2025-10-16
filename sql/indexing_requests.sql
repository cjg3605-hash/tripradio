-- 색인 요청 추적 테이블 생성
-- src/sql/indexing_requests.sql

-- 색인 요청 기록 테이블
CREATE TABLE IF NOT EXISTS indexing_requests (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'ko',
    search_engine VARCHAR(20) NOT NULL CHECK (search_engine IN ('google', 'naver', 'bing')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error', 'retry')),
    
    -- 타이밍 정보
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- 결과 정보
    response_data JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_indexing_requests_url ON indexing_requests(url);
CREATE INDEX IF NOT EXISTS idx_indexing_requests_location_lang ON indexing_requests(location_name, language);
CREATE INDEX IF NOT EXISTS idx_indexing_requests_status ON indexing_requests(status);
CREATE INDEX IF NOT EXISTS idx_indexing_requests_search_engine ON indexing_requests(search_engine);
CREATE INDEX IF NOT EXISTS idx_indexing_requests_requested_at ON indexing_requests(requested_at);

-- 색인 성공률 통계 뷰
CREATE OR REPLACE VIEW indexing_success_stats AS
SELECT 
    search_engine,
    location_name,
    language,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'success') as successful_requests,
    COUNT(*) FILTER (WHERE status = 'error') as failed_requests,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'success')::numeric / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as success_rate_percent,
    MIN(requested_at) as first_request,
    MAX(requested_at) as last_request
FROM indexing_requests
GROUP BY search_engine, location_name, language
ORDER BY last_request DESC;

-- 일별 색인 요청 통계 뷰
CREATE OR REPLACE VIEW daily_indexing_stats AS
SELECT 
    DATE(requested_at) as request_date,
    search_engine,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'success') as successful_requests,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'success')::numeric / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) as success_rate_percent
FROM indexing_requests
WHERE requested_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(requested_at), search_engine
ORDER BY request_date DESC, search_engine;

-- 최근 실패한 색인 요청 뷰 (재시도 대상)
CREATE OR REPLACE VIEW failed_indexing_requests AS
SELECT 
    id,
    url,
    location_name,
    language,
    search_engine,
    error_message,
    retry_count,
    requested_at,
    processed_at
FROM indexing_requests
WHERE status = 'error' 
  AND retry_count < 3
  AND requested_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY requested_at DESC;

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_indexing_requests_updated_at
    BEFORE UPDATE ON indexing_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 샘플 쿼리들

-- 1. 특정 가이드의 색인 상태 조회
-- SELECT * FROM indexing_requests 
-- WHERE location_name = '경복궁' 
-- ORDER BY requested_at DESC;

-- 2. 최근 7일간 색인 성공률
-- SELECT 
--     search_engine,
--     COUNT(*) as total,
--     COUNT(*) FILTER (WHERE status = 'success') as success,
--     ROUND(COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*) * 100, 2) as success_rate
-- FROM indexing_requests 
-- WHERE requested_at >= CURRENT_DATE - INTERVAL '7 days'
-- GROUP BY search_engine;

-- 3. 실패한 요청 재시도 대상 조회
-- SELECT url, error_message, retry_count 
-- FROM failed_indexing_requests
-- WHERE search_engine = 'google'
-- LIMIT 10;

-- 4. 월별 색인 요청 트렌드
-- SELECT 
--     DATE_TRUNC('month', requested_at) as month,
--     COUNT(*) as requests,
--     COUNT(DISTINCT location_name) as unique_locations
-- FROM indexing_requests
-- GROUP BY DATE_TRUNC('month', requested_at)
-- ORDER BY month DESC;
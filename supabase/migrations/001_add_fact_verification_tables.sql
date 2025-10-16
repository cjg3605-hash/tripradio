-- ==========================================
-- GuideAI 사실 검증 시스템 데이터베이스 스키마
-- ==========================================

-- 1. 위치별 팩트 데이터 테이블
CREATE TABLE IF NOT EXISTS location_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  
  -- UNESCO 데이터
  unesco_id VARCHAR(100),
  heritage_type VARCHAR(100),
  inscription_year INTEGER,
  unesco_criteria TEXT[],
  
  -- Wikidata 팩트
  wikidata_id VARCHAR(50),
  construction_year INTEGER,
  architect VARCHAR(255),
  height_meters DECIMAL,
  coordinates POINT,
  wikidata_claims JSONB,
  
  -- Google Places 데이터
  google_place_id VARCHAR(255),
  google_rating DECIMAL(2,1),
  google_reviews_count INTEGER,
  google_types TEXT[],
  
  -- Government Data
  heritage_number VARCHAR(100),
  cultural_property_type VARCHAR(100),
  designation_date DATE,
  managing_organization VARCHAR(255),
  
  -- 통합 검증 정보
  last_verified TIMESTAMP DEFAULT NOW(),
  verification_score DECIMAL(3,2) DEFAULT 0.00,
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  data_sources JSONB DEFAULT '[]'::jsonb,
  verification_method VARCHAR(100) DEFAULT 'multi_source_cross_reference',
  
  -- 메타데이터
  quality_score DECIMAL(3,2) DEFAULT 0.00,
  completeness_score DECIMAL(3,2) DEFAULT 0.00,
  consistency_score DECIMAL(3,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 사실 검증 로그 테이블
CREATE TABLE IF NOT EXISTS fact_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(255) REFERENCES location_facts(location_id),
  verification_type VARCHAR(100) NOT NULL,
  source_api VARCHAR(100) NOT NULL,
  verified_data JSONB,
  confidence_score DECIMAL(3,2),
  issues_found JSONB DEFAULT '[]'::jsonb,
  resolution_actions JSONB DEFAULT '[]'::jsonb,
  verification_status VARCHAR(50) DEFAULT 'pending',
  verified_at TIMESTAMP DEFAULT NOW(),
  
  -- 검증 결과 세부사항
  accuracy_score DECIMAL(3,2),
  completeness_score DECIMAL(3,2),
  timeliness_score DECIMAL(3,2),
  authority_score DECIMAL(3,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. API 사용량 및 성능 추적 테이블
CREATE TABLE IF NOT EXISTS api_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name VARCHAR(100) NOT NULL,
  endpoint VARCHAR(255),
  request_count INTEGER DEFAULT 1,
  response_time_ms INTEGER,
  status_code INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  cost_usd DECIMAL(10,4) DEFAULT 0.0000,
  
  -- 요청 메타데이터
  user_agent VARCHAR(255),
  ip_address INET,
  query_parameters JSONB,
  
  -- 응답 메타데이터
  data_quality_score DECIMAL(3,2),
  cache_hit BOOLEAN DEFAULT FALSE,
  
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 가이드 생성 이력 및 품질 추적 테이블
CREATE TABLE IF NOT EXISTS guide_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location VARCHAR(500) NOT NULL,
  user_profile JSONB,
  
  -- 생성 결과
  guide_data JSONB,
  generation_success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- 데이터 통합 정보
  data_sources_used TEXT[],
  integrated_data_confidence DECIMAL(3,2),
  fact_verification_passed BOOLEAN DEFAULT FALSE,
  verification_score DECIMAL(3,2),
  
  -- AI 검증 정보
  ai_accuracy_score DECIMAL(3,2),
  ai_violations_count INTEGER DEFAULT 0,
  ai_violations JSONB DEFAULT '[]'::jsonb,
  sanitization_applied BOOLEAN DEFAULT FALSE,
  
  -- 성능 메트릭
  total_response_time_ms INTEGER,
  data_integration_time_ms INTEGER,
  ai_generation_time_ms INTEGER,
  
  -- 사용자 피드백 (나중에 추가 가능)
  user_rating INTEGER, -- 1-5
  user_feedback TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 데이터 소스 상태 모니터링 테이블
CREATE TABLE IF NOT EXISTS data_source_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name VARCHAR(100) NOT NULL,
  is_healthy BOOLEAN DEFAULT TRUE,
  last_check TIMESTAMP DEFAULT NOW(),
  response_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 1.00,
  last_error TEXT,
  
  -- 월별 통계
  month_year VARCHAR(7), -- YYYY-MM
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  
  -- 설정 정보
  rate_limit_per_minute INTEGER,
  rate_limit_per_day INTEGER,
  current_usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(source_name, month_year)
);

-- ==========================================
-- 인덱스 생성
-- ==========================================

-- location_facts 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_location_facts_location_id ON location_facts(location_id);
CREATE INDEX IF NOT EXISTS idx_location_facts_name ON location_facts(name);
CREATE INDEX IF NOT EXISTS idx_location_facts_unesco_id ON location_facts(unesco_id);
CREATE INDEX IF NOT EXISTS idx_location_facts_wikidata_id ON location_facts(wikidata_id);
CREATE INDEX IF NOT EXISTS idx_location_facts_google_place_id ON location_facts(google_place_id);
CREATE INDEX IF NOT EXISTS idx_location_facts_verification_score ON location_facts(verification_score DESC);
CREATE INDEX IF NOT EXISTS idx_location_facts_last_verified ON location_facts(last_verified DESC);

-- fact_verification_log 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_verification_log_location_id ON fact_verification_log(location_id);
CREATE INDEX IF NOT EXISTS idx_verification_log_source_api ON fact_verification_log(source_api);
CREATE INDEX IF NOT EXISTS idx_verification_log_verified_at ON fact_verification_log(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_log_verification_status ON fact_verification_log(verification_status);

-- api_usage_tracking 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON api_usage_tracking(api_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage_tracking(date DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_success ON api_usage_tracking(success);

-- guide_generation_history 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_guide_history_location ON guide_generation_history(location);
CREATE INDEX IF NOT EXISTS idx_guide_history_created_at ON guide_generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guide_history_success ON guide_generation_history(generation_success);
CREATE INDEX IF NOT EXISTS idx_guide_history_fact_verified ON guide_generation_history(fact_verification_passed);

-- data_source_health 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_data_source_health_name ON data_source_health(source_name);
CREATE INDEX IF NOT EXISTS idx_data_source_health_month ON data_source_health(month_year);
CREATE INDEX IF NOT EXISTS idx_data_source_health_healthy ON data_source_health(is_healthy);

-- ==========================================
-- 트리거 함수 생성
-- ==========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- location_facts 테이블에 updated_at 트리거 적용
DROP TRIGGER IF EXISTS update_location_facts_updated_at ON location_facts;
CREATE TRIGGER update_location_facts_updated_at
    BEFORE UPDATE ON location_facts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- data_source_health 테이블에 updated_at 트리거 적용
DROP TRIGGER IF EXISTS update_data_source_health_updated_at ON data_source_health;
CREATE TRIGGER update_data_source_health_updated_at
    BEFORE UPDATE ON data_source_health
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 초기 데이터 삽입
-- ==========================================

-- 데이터 소스 초기 상태 설정
INSERT INTO data_source_health (source_name, rate_limit_per_minute, rate_limit_per_day, month_year) 
VALUES 
  ('unesco', 10, 1000, TO_CHAR(NOW(), 'YYYY-MM')),
  ('wikidata', 30, 5000, TO_CHAR(NOW(), 'YYYY-MM')),
  ('government', 100, 10000, TO_CHAR(NOW(), 'YYYY-MM')),
  ('google_places', 1000, 100000, TO_CHAR(NOW(), 'YYYY-MM'))
ON CONFLICT (source_name, month_year) DO NOTHING;

-- ==========================================
-- 권한 설정 (필요한 경우)
-- ==========================================

-- RLS (Row Level Security) 활성화 (필요한 경우)
-- ALTER TABLE location_facts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fact_verification_log ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE api_usage_tracking ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE guide_generation_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE data_source_health ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 뷰 생성 (편의성을 위한)
-- ==========================================

-- 통합된 위치 정보 뷰
CREATE OR REPLACE VIEW location_summary AS
SELECT 
  lf.location_id,
  lf.name,
  lf.verification_score,
  lf.confidence_score,
  lf.quality_score,
  lf.last_verified,
  ARRAY_LENGTH(lf.data_sources::text[], 1) as source_count,
  lf.data_sources,
  lf.coordinates,
  lf.created_at,
  lf.updated_at
FROM location_facts lf
ORDER BY lf.verification_score DESC, lf.last_verified DESC;

-- 최근 가이드 생성 통계 뷰
CREATE OR REPLACE VIEW recent_guide_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_guides,
  COUNT(*) FILTER (WHERE generation_success = true) as successful_guides,
  COUNT(*) FILTER (WHERE fact_verification_passed = true) as fact_verified_guides,
  AVG(total_response_time_ms) as avg_response_time,
  AVG(verification_score) as avg_verification_score
FROM guide_generation_history 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- API 사용량 일별 통계 뷰
CREATE OR REPLACE VIEW daily_api_usage AS
SELECT 
  api_name,
  date,
  SUM(request_count) as total_requests,
  COUNT(*) FILTER (WHERE success = true) as successful_requests,
  AVG(response_time_ms) as avg_response_time,
  SUM(cost_usd) as total_cost
FROM api_usage_tracking
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY api_name, date
ORDER BY date DESC, api_name;

-- ==========================================
-- 완료 메시지
-- ==========================================

-- 마이그레이션 성공 로그
DO $$
BEGIN
    RAISE NOTICE '✅ GuideAI 사실 검증 시스템 데이터베이스 스키마 생성 완료!';
    RAISE NOTICE '📊 생성된 테이블: location_facts, fact_verification_log, api_usage_tracking, guide_generation_history, data_source_health';
    RAISE NOTICE '🔍 생성된 뷰: location_summary, recent_guide_stats, daily_api_usage';
    RAISE NOTICE '⚡ 인덱스 및 트리거 설정 완료';
END $$;
-- 대시보드 실제 데이터를 위한 Supabase 테이블 생성 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 가이드 생성 로그 테이블 (필수)
CREATE TABLE IF NOT EXISTS guide_generation_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  location_name TEXT,
  region TEXT,
  category TEXT,
  language TEXT DEFAULT 'Korean',
  guide_content TEXT,
  response_time INTEGER, -- 밀리초
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. API 호출 로그 테이블 (시스템 통계용)
CREATE TABLE IF NOT EXISTS api_call_logs (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT DEFAULT 'GET',
  status_code INTEGER,
  response_time INTEGER, -- 밀리초
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사용자 활동 로그 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT, -- 'login', 'guide_generation', 'page_view' 등
  page_path TEXT,
  session_duration INTEGER, -- 초
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_guide_logs_created_at ON guide_generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_guide_logs_user_id ON guide_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_logs_location ON guide_generation_logs(location_name);
CREATE INDEX IF NOT EXISTS idx_guide_logs_language ON guide_generation_logs(language);

CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_call_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_call_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_call_logs(status_code);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE guide_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 접근 가능하도록 정책 설정
CREATE POLICY "관리자만 가이드 로그 조회 가능" ON guide_generation_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
    )
  );

CREATE POLICY "관리자만 API 로그 조회 가능" ON api_call_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
    )
  );

CREATE POLICY "관리자만 활동 로그 조회 가능" ON user_activity_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
    )
  );

-- 시스템 사용자가 로그를 삽입할 수 있도록 정책 추가
CREATE POLICY "시스템이 가이드 로그 삽입 가능" ON guide_generation_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "시스템이 API 로그 삽입 가능" ON api_call_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "시스템이 활동 로그 삽입 가능" ON user_activity_logs
  FOR INSERT WITH CHECK (true);

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO guide_generation_logs (location_name, region, category, language, guide_content, response_time, created_at) VALUES
('경복궁', '서울', '역사 유적지', 'Korean', '경복궁은 조선 왕조의 대표적인 궁궐입니다...', 2340, NOW() - INTERVAL '1 hour'),
('제주도', '제주', '자연 관광지', 'Korean', '제주도는 아름다운 자연경관으로 유명합니다...', 1890, NOW() - INTERVAL '2 hours'),
('부산 해운대', '부산', '자연 관광지', 'Korean', '해운대는 부산의 대표적인 해수욕장입니다...', 2100, NOW() - INTERVAL '3 hours'),
('N Seoul Tower', '서울', '도시 명소', 'English', 'N Seoul Tower is an iconic landmark...', 2580, NOW() - INTERVAL '4 hours'),
('명동', '서울', '쇼핑/엔터테인먼트', 'Korean', '명동은 서울의 대표적인 쇼핑 거리입니다...', 1750, NOW() - INTERVAL '5 hours');

INSERT INTO api_call_logs (endpoint, method, status_code, response_time, created_at) VALUES
('/api/node/ai/generate-guide', 'POST', 200, 2340, NOW() - INTERVAL '1 hour'),
('/api/locations/search', 'GET', 200, 156, NOW() - INTERVAL '1 hour'),
('/api/auth/session', 'GET', 200, 89, NOW() - INTERVAL '2 hours'),
('/api/admin/stats/users', 'GET', 200, 234, NOW() - INTERVAL '2 hours'),
('/api/node/ai/generate-guide', 'POST', 500, 5000, NOW() - INTERVAL '3 hours');

-- 데이터 확인 쿼리
-- SELECT COUNT(*) as total_guides FROM guide_generation_logs;
-- SELECT COUNT(*) as total_api_calls FROM api_call_logs;
-- SELECT location_name, COUNT(*) as count FROM guide_generation_logs GROUP BY location_name ORDER BY count DESC LIMIT 10;
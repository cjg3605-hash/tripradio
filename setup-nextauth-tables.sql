-- 기존 정책들 삭제 (중복 오류 방지)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can view own guide history" ON guide_history;

-- NextAuth.js 테이블 생성 스크립트 (Supabase SQL Editor에서 실행)

-- 1. User 테이블
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMPTZ,
    image TEXT,
    password TEXT,
    provider TEXT DEFAULT 'credentials',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Account 테이블 (OAuth 계정 정보)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- 3. Session 테이블
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Verification Token 테이블 (이메일 인증용)
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- 5. Guide History 테이블 (가이드 히스토리)
CREATE TABLE IF NOT EXISTS guide_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    guide_data JSONB NOT NULL,
    user_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_guide_history_user_id ON guide_history(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_history_expires_at ON guide_history(expires_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_history ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (기존 정책 삭제 후 재생성)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own guide history" ON guide_history FOR ALL USING (auth.uid()::text = user_id);

-- 서비스 역할에 대한 모든 권한 부여
GRANT ALL ON users TO service_role;
GRANT ALL ON accounts TO service_role;
GRANT ALL ON sessions TO service_role;
GRANT ALL ON verification_tokens TO service_role;
GRANT ALL ON guide_history TO service_role;

-- 익명 사용자에게 필요한 최소 권한
GRANT SELECT, INSERT, UPDATE ON users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON verification_tokens TO anon; 
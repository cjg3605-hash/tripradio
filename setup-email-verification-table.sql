-- 이메일 인증 테이블 생성 (Supabase SQL Editor에서 실행)

-- 1. 이메일 인증 테이블 생성
CREATE TABLE IF NOT EXISTS email_verifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_verified ON email_verifications(verified);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- 모든 사용자가 이메일 인증 코드를 조회/삽입/업데이트할 수 있도록 허용 (공개 등록 과정)
CREATE POLICY "Anyone can manage email verifications" ON email_verifications FOR ALL USING (true);

-- 5. 서비스 역할에 대한 모든 권한 부여
GRANT ALL ON email_verifications TO service_role;

-- 6. 익명 사용자에게 필요한 권한 부여 (회원가입 프로세스용)
GRANT SELECT, INSERT, UPDATE, DELETE ON email_verifications TO anon;

-- 7. 만료된 인증 코드 자동 삭제 함수 (선택사항)
CREATE OR REPLACE FUNCTION cleanup_expired_email_verifications()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verifications
    WHERE expires_at < NOW() AND verified = FALSE;
END;
$$ LANGUAGE plpgsql;

-- 8. 자동 정리 작업을 위한 cron job 설정 (Supabase Extensions에서 pg_cron이 활성화된 경우)
-- SELECT cron.schedule('cleanup-expired-email-verifications', '0 */6 * * *', 'SELECT cleanup_expired_email_verifications();');
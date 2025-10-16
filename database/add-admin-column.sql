-- 사용자 테이블에 관리자 권한 컬럼 추가
-- 이 스크립트는 Supabase 콘솔에서 실행해야 합니다.

-- 1. is_admin 컬럼 추가 (기본값 false)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. 기존 데이터의 is_admin을 false로 설정 (이미 기본값이지만 명시적으로)
UPDATE users 
SET is_admin = FALSE 
WHERE is_admin IS NULL;

-- 3. 관리자 계정 확인 및 생성을 위한 함수 (선택사항)
CREATE OR REPLACE FUNCTION ensure_admin_user()
RETURNS void AS $$
DECLARE
    admin_email text := 'naviadmin@navidocent.com';
    admin_exists boolean;
BEGIN
    -- 관리자 계정 존재 확인
    SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE email = admin_email
    ) INTO admin_exists;
    
    -- 관리자 계정이 없으면 경고 메시지 출력
    IF NOT admin_exists THEN
        RAISE NOTICE '관리자 계정이 존재하지 않습니다. /api/admin/setup을 호출하여 관리자 계정을 생성하세요.';
    ELSE
        -- 기존 관리자 계정의 권한 업데이트
        UPDATE users 
        SET is_admin = TRUE, updated_at = NOW()
        WHERE email = admin_email;
        
        RAISE NOTICE '관리자 계정 권한이 업데이트되었습니다: %', admin_email;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. 함수 실행
SELECT ensure_admin_user();

-- 5. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_is_admin 
ON users(is_admin) 
WHERE is_admin = TRUE;

-- 6. RLS (Row Level Security) 정책 업데이트 (필요시)
-- 관리자만 모든 사용자 정보를 볼 수 있도록 설정
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view own profile" ON users
--     FOR SELECT USING (auth.uid()::text = id);

-- CREATE POLICY "Admins can view all profiles" ON users
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM users 
--             WHERE id = auth.uid()::text 
--             AND is_admin = TRUE
--         )
--     );
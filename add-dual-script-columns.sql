-- 이중 스크립트 시스템을 위한 Supabase DB 칼럼 추가
-- TTS 생성 시스템 지원

-- 1. guide_chapters 테이블에 이중 스크립트 칼럼 추가
ALTER TABLE guide_chapters 
ADD COLUMN IF NOT EXISTS user_script TEXT,
ADD COLUMN IF NOT EXISTS tts_script TEXT,
ADD COLUMN IF NOT EXISTS tts_system_prompt TEXT,
ADD COLUMN IF NOT EXISTS audio_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS script_version VARCHAR(10) DEFAULT 'v1.0';

-- 2. guide_chapters 테이블에 TTS 품질 관련 칼럼 추가
ALTER TABLE guide_chapters 
ADD COLUMN IF NOT EXISTS tts_quality_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tts_generation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS persona_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS optimization_applied JSONB DEFAULT '[]'::jsonb;

-- 3. audio_files 테이블에 TTS 정보 칼럼 추가
ALTER TABLE audio_files 
ADD COLUMN IF NOT EXISTS tts_engine VARCHAR(50) DEFAULT 'google-cloud-tts',
ADD COLUMN IF NOT EXISTS voice_profile JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS audio_quality VARCHAR(20) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}'::jsonb;

-- 4. audio_files 테이블에 성능 관련 칼럼 추가
ALTER TABLE audio_files 
ADD COLUMN IF NOT EXISTS speaker_role VARCHAR(20),
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ssml_complexity_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER DEFAULT 0;

-- 5. 칼럼 설명 (주석)
COMMENT ON COLUMN guide_chapters.user_script IS '사용자용 깔끔한 자막 스크립트';
COMMENT ON COLUMN guide_chapters.tts_script IS 'TTS용 SSML 태그 포함 스크립트';
COMMENT ON COLUMN guide_chapters.tts_system_prompt IS 'TTS 생성용 시스템 프롬프트';
COMMENT ON COLUMN guide_chapters.audio_metadata IS 'TTS 생성 메타데이터 (JSON)';
COMMENT ON COLUMN guide_chapters.script_version IS '스크립트 버전 관리';

COMMENT ON COLUMN guide_chapters.tts_quality_score IS 'TTS 품질 점수 (0-100)';
COMMENT ON COLUMN guide_chapters.tts_generation_status IS 'TTS 생성 상태 (pending, processing, completed, failed)';
COMMENT ON COLUMN guide_chapters.persona_type IS '사용된 TTS 페르소나 타입';
COMMENT ON COLUMN guide_chapters.optimization_applied IS '적용된 최적화 목록 (JSON 배열)';

COMMENT ON COLUMN audio_files.tts_engine IS 'TTS 엔진 종류';
COMMENT ON COLUMN audio_files.voice_profile IS '음성 프로필 설정 (JSON)';
COMMENT ON COLUMN audio_files.audio_quality IS '오디오 품질 레벨';
COMMENT ON COLUMN audio_files.generation_metadata IS 'TTS 생성 과정 메타데이터';

COMMENT ON COLUMN audio_files.speaker_role IS '화자 역할 (primary, secondary, combined)';
COMMENT ON COLUMN audio_files.estimated_duration IS '예상 재생 시간 (초)';
COMMENT ON COLUMN audio_files.ssml_complexity_score IS 'SSML 복잡도 점수';
COMMENT ON COLUMN audio_files.generation_time_ms IS 'TTS 생성 소요 시간 (밀리초)';

-- 6. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_guide_chapters_tts_status ON guide_chapters(tts_generation_status);
CREATE INDEX IF NOT EXISTS idx_guide_chapters_quality_score ON guide_chapters(tts_quality_score);
CREATE INDEX IF NOT EXISTS idx_guide_chapters_persona_type ON guide_chapters(persona_type);
CREATE INDEX IF NOT EXISTS idx_audio_files_speaker_role ON audio_files(speaker_role);
CREATE INDEX IF NOT EXISTS idx_audio_files_tts_engine ON audio_files(tts_engine);

-- 7. 제약조건 추가 (데이터 무결성)
ALTER TABLE guide_chapters 
ADD CONSTRAINT check_tts_quality_score CHECK (tts_quality_score >= 0 AND tts_quality_score <= 100),
ADD CONSTRAINT check_tts_generation_status CHECK (tts_generation_status IN ('pending', 'processing', 'completed', 'failed', 'regenerating'));

ALTER TABLE audio_files 
ADD CONSTRAINT check_audio_quality CHECK (audio_quality IN ('standard', 'high', 'premium')),
ADD CONSTRAINT check_speaker_role CHECK (speaker_role IN ('primary', 'secondary', 'combined', 'host', 'curator'));

-- 8. 기본값 업데이트 함수 생성
CREATE OR REPLACE FUNCTION update_tts_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- TTS 스크립트가 업데이트되면 품질 점수 초기화
    IF OLD.tts_script IS DISTINCT FROM NEW.tts_script AND NEW.tts_script IS NOT NULL THEN
        NEW.tts_generation_status = 'pending';
        NEW.tts_quality_score = 0;
        NEW.updated_at = NOW();
    END IF;
    
    -- 사용자 스크립트가 업데이트되면 TTS 스크립트도 재생성 필요
    IF OLD.user_script IS DISTINCT FROM NEW.user_script AND NEW.user_script IS NOT NULL THEN
        NEW.tts_generation_status = 'pending';
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_tts_metadata ON guide_chapters;
CREATE TRIGGER trigger_update_tts_metadata
    BEFORE UPDATE ON guide_chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_tts_metadata();

-- 10. 기존 데이터 마이그레이션 (안전한 방식)
-- 기존 narrative 필드의 데이터를 user_script로 복사 (NULL인 경우만)
UPDATE guide_chapters 
SET user_script = narrative 
WHERE user_script IS NULL AND narrative IS NOT NULL AND narrative != '';

-- 기존 데이터에 기본 메타데이터 설정
UPDATE guide_chapters 
SET 
    audio_metadata = '{
        "generated_at": null,
        "persona_used": null,
        "optimization_level": "basic",
        "estimated_listening_time": 0
    }'::jsonb,
    tts_generation_status = 'pending',
    script_version = 'v1.0'
WHERE audio_metadata = '{}'::jsonb;

-- 11. RLS 정책 업데이트 (필요한 경우)
-- 기존 RLS 정책에 새로운 칼럼들 접근 권한 추가는 자동으로 적용됨

-- 12. 성공 메시지
SELECT 
    '🎉 TTS 이중 스크립트 시스템 DB 칼럼 추가 완료!' as status,
    '총 ' || (
        SELECT count(*) 
        FROM information_schema.columns 
        WHERE table_name IN ('guide_chapters', 'audio_files') 
        AND column_name IN (
            'user_script', 'tts_script', 'tts_system_prompt', 'audio_metadata', 
            'script_version', 'tts_quality_score', 'tts_generation_status', 
            'persona_type', 'optimization_applied', 'tts_engine', 'voice_profile', 
            'audio_quality', 'generation_metadata', 'speaker_role', 
            'estimated_duration', 'ssml_complexity_score', 'generation_time_ms'
        )
    ) || '개 칼럼이 추가되었습니다.' as details;

-- 13. 추가된 칼럼 확인 쿼리 (선택사항)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('guide_chapters', 'audio_files')
AND column_name IN (
    'user_script', 'tts_script', 'tts_system_prompt', 'audio_metadata', 
    'script_version', 'tts_quality_score', 'tts_generation_status', 
    'persona_type', 'optimization_applied', 'tts_engine', 'voice_profile', 
    'audio_quality', 'generation_metadata', 'speaker_role', 
    'estimated_duration', 'ssml_complexity_score', 'generation_time_ms'
)
ORDER BY table_name, column_name;
-- NotebookLM 스타일 TTS 시스템을 위한 DB 스키마 확장
-- ⚠️ 기존 시스템과 병행하여 안전하게 확장

-- 1. guide_chapters 테이블 확장 (이중 스크립트 저장)
DO $$
BEGIN
    -- user_script 컬럼 추가 (사용자용 깔끔한 자막)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_chapters' AND column_name = 'user_script'
    ) THEN
        ALTER TABLE guide_chapters ADD COLUMN user_script TEXT;
    END IF;
    
    -- tts_script 컬럼 추가 (TTS용 SSML 스크립트)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_chapters' AND column_name = 'tts_script'
    ) THEN
        ALTER TABLE guide_chapters ADD COLUMN tts_script TEXT;
    END IF;
    
    -- tts_system_prompt 컬럼 추가 (TTS 생성 시스템 프롬프트)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_chapters' AND column_name = 'tts_system_prompt'
    ) THEN
        ALTER TABLE guide_chapters ADD COLUMN tts_system_prompt TEXT;
    END IF;
    
    -- audio_metadata 컬럼 추가 (오디오 메타데이터 JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_chapters' AND column_name = 'audio_metadata'
    ) THEN
        ALTER TABLE guide_chapters ADD COLUMN audio_metadata JSONB;
    END IF;
    
    -- script_version 컬럼 추가 (스크립트 버전)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_chapters' AND column_name = 'script_version'
    ) THEN
        ALTER TABLE guide_chapters ADD COLUMN script_version VARCHAR(10) DEFAULT 'v1.0';
    END IF;
END $$;

-- 2. audio_files 테이블 확장 (TTS 엔진 및 메타데이터)
DO $$
BEGIN
    -- tts_engine 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'tts_engine'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN tts_engine VARCHAR(50) DEFAULT 'google-cloud-tts';
    END IF;
    
    -- voice_profile 컬럼 추가 (음성 프로필 JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'voice_profile'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN voice_profile JSONB;
    END IF;
    
    -- audio_quality 컬럼 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'audio_quality'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN audio_quality VARCHAR(20) DEFAULT 'standard';
    END IF;
    
    -- generation_metadata 컬럼 추가 (생성 메타데이터 JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_files' AND column_name = 'generation_metadata'
    ) THEN
        ALTER TABLE audio_files ADD COLUMN generation_metadata JSONB;
    END IF;
END $$;

-- 3. 새로운 podcast_episodes 테이블 생성 (전체 가이드 팟캐스트 관리)
CREATE TABLE IF NOT EXISTS podcast_episodes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    guide_id TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    
    -- 팟캐스트 기본 정보
    title TEXT NOT NULL,
    description TEXT,
    language VARCHAR(10) NOT NULL,
    
    -- 스크립트 정보
    user_script TEXT,           -- 사용자용 전체 팟캐스트 자막
    tts_script TEXT,            -- TTS용 전체 SSML 스크립트
    system_prompt TEXT,         -- 생성에 사용된 시스템 프롬프트
    
    -- 오디오 정보
    audio_url TEXT,             -- 생성된 팟캐스트 오디오 파일 URL
    duration_seconds INTEGER,   -- 재생 시간 (초)
    file_size INTEGER,          -- 파일 크기 (bytes)
    
    -- 메타데이터
    tts_engine VARCHAR(50) DEFAULT 'google-cloud-tts',
    voice_profiles JSONB,       -- 사용된 음성 프로필들
    generation_metadata JSONB,  -- 생성 과정 메타데이터
    quality_score INTEGER,      -- 품질 점수 (0-100)
    
    -- 챕터 타임스탬프
    chapter_timestamps JSONB,   -- [{chapterIndex: 0, startTime: 0, endTime: 120}, ...]
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'archived')),
    version VARCHAR(10) DEFAULT 'v1.0',
    
    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 유니크 제약조건 (같은 가이드의 같은 언어는 하나만)
    UNIQUE(guide_id, language, version)
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_guide_chapters_user_script ON guide_chapters(guide_id) WHERE user_script IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guide_chapters_tts_script ON guide_chapters(guide_id) WHERE tts_script IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_guide_language ON podcast_episodes(guide_id, language);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_status ON podcast_episodes(status);

-- 5. podcast_episodes updated_at 트리거 추가
DROP TRIGGER IF EXISTS update_podcast_episodes_updated_at ON podcast_episodes;
CREATE TRIGGER update_podcast_episodes_updated_at
    BEFORE UPDATE ON podcast_episodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS 정책 추가 (podcast_episodes)
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'podcast_episodes' AND policyname = 'Anyone can read podcast episodes') THEN
        CREATE POLICY "Anyone can read podcast episodes" ON podcast_episodes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'podcast_episodes' AND policyname = 'Service role can insert podcast episodes') THEN
        CREATE POLICY "Service role can insert podcast episodes" ON podcast_episodes FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'podcast_episodes' AND policyname = 'Service role can update podcast episodes') THEN
        CREATE POLICY "Service role can update podcast episodes" ON podcast_episodes FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'podcast_episodes' AND policyname = 'Service role can delete podcast episodes') THEN
        CREATE POLICY "Service role can delete podcast episodes" ON podcast_episodes FOR DELETE USING (true);
    END IF;
END $$;

-- 7. 데이터 타입 정의 및 샘플 메타데이터 구조 (설명용 주석)
/*
audio_metadata JSONB 구조:
{
  "persona": "conversation-optimizer",
  "voiceSettings": {
    "primarySpeaker": {"voiceId": "ko-KR-Neural2-A", "pitch": "+2st", "rate": "1.05"},
    "secondarySpeaker": {"voiceId": "ko-KR-Neural2-C", "pitch": "-1st", "rate": "0.95"}
  },
  "ssmlOptimization": {
    "emphasisCount": 15,
    "breakCount": 23,
    "prosodyTags": 18
  },
  "qualityMetrics": {
    "naturalness": 92,
    "informationDensity": 88,
    "conversationFlow": 95
  }
}

generation_metadata JSONB 구조:
{
  "generationTime": "2025-01-24T10:30:00Z",
  "processingTimeMs": 45000,
  "geminiModel": "gemini-2.5-flash",
  "ttsEngine": "google-cloud-tts",
  "inputTokens": 5200,
  "outputTokens": 3800,
  "audioProcessingSteps": [
    {"step": "script_generation", "timeMs": 15000},
    {"step": "ssml_optimization", "timeMs": 8000},
    {"step": "tts_synthesis", "timeMs": 22000}
  ]
}

chapter_timestamps JSONB 구조:
[
  {
    "chapterIndex": 0,
    "title": "박물관 소개",
    "startTime": 0,
    "endTime": 120,
    "speakerTransitions": [
      {"speaker": "host", "time": 0},
      {"speaker": "curator", "time": 45},
      {"speaker": "host", "time": 90}
    ]
  },
  {
    "chapterIndex": 1,
    "title": "주요 전시품",
    "startTime": 120,
    "endTime": 300,
    "speakerTransitions": [
      {"speaker": "curator", "time": 120},
      {"speaker": "host", "time": 180}
    ]
  }
]
*/

-- 8. 성공 메시지
SELECT 'NotebookLM 스타일 TTS 시스템 DB 스키마 확장 완료! 🎙️' as status;

-- 9. 확인 쿼리 (선택사항)
/*
-- 확장된 컬럼 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('guide_chapters', 'audio_files', 'podcast_episodes')
  AND column_name IN ('user_script', 'tts_script', 'tts_system_prompt', 'audio_metadata', 
                      'script_version', 'tts_engine', 'voice_profile', 'audio_quality', 
                      'generation_metadata')
ORDER BY table_name, ordinal_position;
*/
-- 🎯 AI 가이드 품질 검증 및 재생성 시스템 데이터베이스 스키마 (수정된 버전)
-- 버전 관리, 품질 추적, 자동 재생성을 위한 테이블들

-- ================================
-- 1. 가이드 상태 enum 타입 생성
-- ================================

DO $$ BEGIN
    CREATE TYPE guide_status AS ENUM ('draft', 'staging', 'production', 'deprecated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ================================
-- 2. 가이드 버전 관리 테이블
-- ================================

CREATE TABLE IF NOT EXISTS guide_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name TEXT NOT NULL,
    language TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content JSONB NOT NULL,
    
    -- 품질 관련 필드
    quality_score DECIMAL(5,2) DEFAULT NULL,
    status guide_status DEFAULT 'draft',
    verification_results JSONB DEFAULT '{}',
    
    -- 생성 정보
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    promoted_at TIMESTAMPTZ DEFAULT NULL,
    generation_prompt TEXT,
    ai_model TEXT DEFAULT 'gemini-2.5-flash-lite-preview-06-17',
    
    -- 사용자 피드백
    user_feedback_score DECIMAL(3,2) DEFAULT NULL,
    user_feedback_count INTEGER DEFAULT 0,
    
    -- 성능 지표
    cache_hit_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT NULL,
    
    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 유니크 제약조건: 같은 위치/언어/버전은 하나만
    UNIQUE(location_name, language, version)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_guide_versions_location_lang ON guide_versions(location_name, language);
CREATE INDEX IF NOT EXISTS idx_guide_versions_status ON guide_versions(status);
CREATE INDEX IF NOT EXISTS idx_guide_versions_quality ON guide_versions(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_guide_versions_created_at ON guide_versions(created_at DESC);

-- ================================
-- 3. 품질 진화 추적 테이블
-- ================================

CREATE TABLE IF NOT EXISTS quality_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID REFERENCES guide_versions(id) ON DELETE CASCADE,
    
    -- 품질 점수들
    factual_accuracy DECIMAL(5,2),
    content_completeness DECIMAL(5,2),
    coherence_score DECIMAL(5,2),
    cultural_sensitivity DECIMAL(5,2),
    overall_quality DECIMAL(5,2) NOT NULL,
    confidence_level DECIMAL(5,2),
    
    -- 사용자 피드백 통계
    user_feedback_count INTEGER DEFAULT 0,
    user_satisfaction_rate DECIMAL(5,2),
    
    -- 검증 정보
    verification_method TEXT DEFAULT 'ai_gemini',
    processing_time_ms INTEGER,
    detected_issues JSONB DEFAULT '[]',
    recommendations TEXT[],
    
    -- 개선 추적
    improvement_from_previous DECIMAL(5,2) DEFAULT NULL,
    improvement_suggestions TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_quality_evolution_guide_id ON quality_evolution(guide_id);
CREATE INDEX IF NOT EXISTS idx_quality_evolution_quality ON quality_evolution(overall_quality DESC);
CREATE INDEX IF NOT EXISTS idx_quality_evolution_created_at ON quality_evolution(created_at DESC);

-- ================================
-- 4. 품질 개선 큐 테이블 (새로 생성 또는 확장)
-- ================================

DO $$ 
BEGIN
    -- 기존 테이블이 있는지 확인
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quality_improvement_queue') THEN
        -- 기존 테이블에 컬럼 하나씩 추가 (오류 방지)
        
        -- retry_count 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'retry_count') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN retry_count INTEGER DEFAULT 0;
        END IF;
        
        -- max_retries 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'max_retries') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN max_retries INTEGER DEFAULT 3;
        END IF;
        
        -- last_attempt_at 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'last_attempt_at') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN last_attempt_at TIMESTAMPTZ;
        END IF;
        
        -- enhanced_prompt 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'enhanced_prompt') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN enhanced_prompt TEXT;
        END IF;
        
        -- expected_quality_improvement 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'expected_quality_improvement') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN expected_quality_improvement DECIMAL(5,2);
        END IF;
        
        -- original_quality_score 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'original_quality_score') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN original_quality_score DECIMAL(5,2);
        END IF;
        
        -- target_quality_score 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'target_quality_score') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN target_quality_score DECIMAL(5,2);
        END IF;
        
        -- processing_strategy 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'processing_strategy') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN processing_strategy TEXT DEFAULT 'standard';
        END IF;
        
        -- error_log 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'error_log') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN error_log TEXT[];
        END IF;
        
        -- updated_at 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'updated_at') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        -- language 컬럼 추가 (없을 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'quality_improvement_queue' AND column_name = 'language') THEN
            ALTER TABLE quality_improvement_queue ADD COLUMN language TEXT DEFAULT 'ko';
        END IF;
        
    ELSE
        -- 테이블이 없으면 새로 생성
        CREATE TABLE quality_improvement_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            guide_id TEXT NOT NULL,
            location_name TEXT NOT NULL,
            language TEXT DEFAULT 'ko',
            
            -- 품질 정보
            current_issues TEXT[],
            original_quality_score DECIMAL(5,2),
            target_quality_score DECIMAL(5,2),
            expected_quality_improvement DECIMAL(5,2),
            
            -- 처리 정보
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
            processing_strategy TEXT DEFAULT 'standard',
            
            -- 재시도 관리
            retry_count INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            last_attempt_at TIMESTAMPTZ,
            
            -- 프롬프트 개선
            enhanced_prompt TEXT,
            error_log TEXT[],
            
            -- 타임스탬프
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- quality_improvement_queue 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_quality_queue_status ON quality_improvement_queue(status);
CREATE INDEX IF NOT EXISTS idx_quality_queue_priority ON quality_improvement_queue(priority);
CREATE INDEX IF NOT EXISTS idx_quality_queue_location ON quality_improvement_queue(location_name);
CREATE INDEX IF NOT EXISTS idx_quality_queue_created_at ON quality_improvement_queue(created_at);

-- ================================
-- 5. 실시간 품질 지표 테이블 (확장)
-- ================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'realtime_quality_metrics') THEN
        -- 기존 테이블에 컬럼 하나씩 추가
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'realtime_quality_metrics' AND column_name = 'current_version') THEN
            ALTER TABLE realtime_quality_metrics ADD COLUMN current_version INTEGER DEFAULT 1;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'realtime_quality_metrics' AND column_name = 'quality_trend') THEN
            ALTER TABLE realtime_quality_metrics ADD COLUMN quality_trend TEXT DEFAULT 'stable';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'realtime_quality_metrics' AND column_name = 'last_regeneration_at') THEN
            ALTER TABLE realtime_quality_metrics ADD COLUMN last_regeneration_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'realtime_quality_metrics' AND column_name = 'regeneration_count') THEN
            ALTER TABLE realtime_quality_metrics ADD COLUMN regeneration_count INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'realtime_quality_metrics' AND column_name = 'cache_hit_rate') THEN
            ALTER TABLE realtime_quality_metrics ADD COLUMN cache_hit_rate DECIMAL(5,2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'realtime_quality_metrics' AND column_name = 'user_completion_rate') THEN
            ALTER TABLE realtime_quality_metrics ADD COLUMN user_completion_rate DECIMAL(5,2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'realtime_quality_metrics' AND column_name = 'user_bounce_rate') THEN
            ALTER TABLE realtime_quality_metrics ADD COLUMN user_bounce_rate DECIMAL(5,2);
        END IF;
        
    ELSE
        -- 테이블이 없으면 새로 생성
        CREATE TABLE realtime_quality_metrics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            location_name TEXT NOT NULL UNIQUE,
            language TEXT DEFAULT 'ko',
            
            -- 현재 상태
            current_version INTEGER DEFAULT 1,
            average_score DECIMAL(5,2) NOT NULL,
            feedback_count INTEGER DEFAULT 0,
            quality_trend TEXT DEFAULT 'stable',
            
            -- 재생성 정보
            last_regeneration_at TIMESTAMPTZ,
            regeneration_count INTEGER DEFAULT 0,
            
            -- 성능 지표
            cache_hit_rate DECIMAL(5,2),
            user_completion_rate DECIMAL(5,2),
            user_bounce_rate DECIMAL(5,2),
            
            -- 타임스탬프
            last_feedback_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- ================================
-- 6. 품질 알림 테이블
-- ================================

CREATE TABLE IF NOT EXISTS quality_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name TEXT NOT NULL,
    language TEXT DEFAULT 'ko',
    alert_type TEXT NOT NULL CHECK (alert_type IN ('quality_drop', 'regeneration_needed', 'verification_failed', 'user_complaint')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- 알림 내용
    title TEXT NOT NULL,
    description TEXT,
    current_quality_score DECIMAL(5,2),
    threshold_violated DECIMAL(5,2),
    
    -- 처리 상태
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- 메타데이터
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- quality_alerts 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_quality_alerts_location ON quality_alerts(location_name);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_type ON quality_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_severity ON quality_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_status ON quality_alerts(status);

-- ================================
-- 7. 트리거 및 함수
-- ================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- guide_versions 테이블 트리거
DROP TRIGGER IF EXISTS update_guide_versions_updated_at ON guide_versions;
CREATE TRIGGER update_guide_versions_updated_at
    BEFORE UPDATE ON guide_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- quality_improvement_queue 테이블 트리거
DROP TRIGGER IF EXISTS update_quality_queue_updated_at ON quality_improvement_queue;
CREATE TRIGGER update_quality_queue_updated_at
    BEFORE UPDATE ON quality_improvement_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- realtime_quality_metrics 테이블 트리거
DROP TRIGGER IF EXISTS update_quality_metrics_updated_at ON realtime_quality_metrics;
CREATE TRIGGER update_quality_metrics_updated_at
    BEFORE UPDATE ON realtime_quality_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- quality_alerts 테이블 트리거
DROP TRIGGER IF EXISTS update_quality_alerts_updated_at ON quality_alerts;
CREATE TRIGGER update_quality_alerts_updated_at
    BEFORE UPDATE ON quality_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 8. 초기 데이터 설정
-- ================================

-- 기존 guides 테이블에서 realtime_quality_metrics로 기본 데이터 마이그레이션
DO $$
BEGIN
    -- guides 테이블이 존재하는 경우에만 실행
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'guides') THEN
        INSERT INTO realtime_quality_metrics (location_name, average_score, feedback_count)
        SELECT DISTINCT locationname, 75.0, 0
        FROM guides 
        WHERE NOT EXISTS (
            SELECT 1 FROM realtime_quality_metrics 
            WHERE location_name = guides.locationname
        )
        ON CONFLICT (location_name) DO NOTHING;
    END IF;
END $$;

-- ================================
-- 9. 유용한 뷰 생성
-- ================================

-- 현재 프로덕션 가이드 뷰
CREATE OR REPLACE VIEW current_production_guides AS
SELECT 
    gv.*,
    qe.overall_quality as latest_quality,
    qe.created_at as last_quality_check
FROM guide_versions gv
LEFT JOIN quality_evolution qe ON gv.id = qe.guide_id
WHERE gv.status = 'production'
AND (qe.created_at IS NULL OR qe.created_at = (
    SELECT MAX(created_at) 
    FROM quality_evolution qe2 
    WHERE qe2.guide_id = gv.id
));

-- 품질 트렌드 뷰
CREATE OR REPLACE VIEW quality_trends AS
SELECT 
    location_name,
    language,
    COUNT(*) as version_count,
    AVG(quality_score) as avg_quality,
    MAX(quality_score) as best_quality,
    MIN(quality_score) as worst_quality,
    MAX(generated_at) as last_generated
FROM guide_versions
WHERE quality_score IS NOT NULL
GROUP BY location_name, language;

-- 재생성 필요 가이드 뷰
CREATE OR REPLACE VIEW guides_needing_regeneration AS
SELECT 
    gv.*,
    COALESCE(qe.overall_quality, gv.quality_score, 50) as current_quality,
    CASE 
        WHEN COALESCE(qe.overall_quality, gv.quality_score, 50) < 40 THEN 'critical'
        WHEN COALESCE(qe.overall_quality, gv.quality_score, 50) < 60 THEN 'high'
        WHEN COALESCE(qe.overall_quality, gv.quality_score, 50) < 75 THEN 'medium'
        ELSE 'low'
    END as regeneration_priority
FROM guide_versions gv
LEFT JOIN quality_evolution qe ON gv.id = qe.guide_id
WHERE gv.status = 'production'
AND COALESCE(qe.overall_quality, gv.quality_score, 50) < 75
AND (qe.created_at IS NULL OR qe.created_at = (
    SELECT MAX(created_at) 
    FROM quality_evolution qe2 
    WHERE qe2.guide_id = gv.id
));

-- ================================
-- 완료 메시지
-- ================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ AI 가이드 품질 검증 시스템 데이터베이스 스키마 생성 완료!';
    RAISE NOTICE '📊 생성/확장된 테이블: guide_versions, quality_evolution, quality_improvement_queue, realtime_quality_metrics, quality_alerts';
    RAISE NOTICE '🔍 생성된 뷰: current_production_guides, quality_trends, guides_needing_regeneration';
    RAISE NOTICE '⚡ 트리거: updated_at 자동 업데이트 (모든 테이블)';
    RAISE NOTICE '🎯 이제 품질 검증 시스템을 사용할 수 있습니다!';
END $$;
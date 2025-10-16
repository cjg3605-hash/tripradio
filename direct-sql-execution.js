// 직접 SQL 실행을 통한 DB 마이그레이션
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

// 🚀 단계별 SQL 실행
async function executeDirectSQL() {
  console.log('🎯 Direct SQL을 통한 TTS 칼럼 추가 시작...\n');

  const client = await pool.connect();
  
  try {
    // =====================================================
    // 1단계: guide_chapters 테이블 기본 칼럼 추가
    // =====================================================
    console.log('📝 1단계: guide_chapters 기본 칼럼 추가...');
    
    const step1Queries = [
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS user_script TEXT;",
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS tts_script TEXT;",
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS tts_system_prompt TEXT;",
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS audio_metadata JSONB DEFAULT '{}'::jsonb;",
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS script_version VARCHAR(10) DEFAULT 'v1.0';"
    ];

    for (const query of step1Queries) {
      try {
        await client.query(query);
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        console.log(`  ✅ ${columnName} 추가 완료`);
      } catch (error) {
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  ${columnName} 이미 존재함`);
        } else {
          console.log(`  ❌ ${columnName} 실패: ${error.message}`);
        }
      }
    }

    // =====================================================
    // 2단계: guide_chapters 품질 관련 칼럼 추가
    // =====================================================
    console.log('\n📊 2단계: guide_chapters 품질 관리 칼럼 추가...');
    
    const step2Queries = [
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS tts_quality_score INTEGER DEFAULT 0;",
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS tts_generation_status VARCHAR(20) DEFAULT 'pending';",
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS persona_type VARCHAR(50);",
      "ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS optimization_applied JSONB DEFAULT '[]'::jsonb;"
    ];

    for (const query of step2Queries) {
      try {
        await client.query(query);
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        console.log(`  ✅ ${columnName} 추가 완료`);
      } catch (error) {
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  ${columnName} 이미 존재함`);
        } else {
          console.log(`  ❌ ${columnName} 실패: ${error.message}`);
        }
      }
    }

    // =====================================================
    // 3단계: audio_files 테이블 TTS 칼럼 추가
    // =====================================================
    console.log('\n🔊 3단계: audio_files TTS 칼럼 추가...');
    
    const step3Queries = [
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS tts_engine VARCHAR(50) DEFAULT 'google-cloud-tts';",
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS voice_profile JSONB DEFAULT '{}'::jsonb;",
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS audio_quality VARCHAR(20) DEFAULT 'standard';",
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}'::jsonb;"
    ];

    for (const query of step3Queries) {
      try {
        await client.query(query);
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        console.log(`  ✅ ${columnName} 추가 완료`);
      } catch (error) {
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  ${columnName} 이미 존재함`);
        } else {
          console.log(`  ❌ ${columnName} 실패: ${error.message}`);
        }
      }
    }

    // =====================================================
    // 4단계: audio_files 성능 분석 칼럼 추가
    // =====================================================
    console.log('\n📈 4단계: audio_files 성능 분석 칼럼 추가...');
    
    const step4Queries = [
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS speaker_role VARCHAR(20);",
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0;",
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS ssml_complexity_score DECIMAL(5,2) DEFAULT 0.0;",
      "ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER DEFAULT 0;"
    ];

    for (const query of step4Queries) {
      try {
        await client.query(query);
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        console.log(`  ✅ ${columnName} 추가 완료`);
      } catch (error) {
        const columnName = query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  ${columnName} 이미 존재함`);
        } else {
          console.log(`  ❌ ${columnName} 실패: ${error.message}`);
        }
      }
    }

    // =====================================================
    // 5단계: 인덱스 생성
    // =====================================================
    console.log('\n🔍 5단계: 성능 최적화 인덱스 생성...');
    
    const indexQueries = [
      "CREATE INDEX IF NOT EXISTS idx_guide_chapters_tts_status ON guide_chapters(tts_generation_status);",
      "CREATE INDEX IF NOT EXISTS idx_guide_chapters_quality_score ON guide_chapters(tts_quality_score);",
      "CREATE INDEX IF NOT EXISTS idx_guide_chapters_persona_type ON guide_chapters(persona_type);",
      "CREATE INDEX IF NOT EXISTS idx_audio_files_speaker_role ON audio_files(speaker_role);",
      "CREATE INDEX IF NOT EXISTS idx_audio_files_tts_engine ON audio_files(tts_engine);"
    ];

    for (const query of indexQueries) {
      try {
        await client.query(query);
        const indexName = query.match(/CREATE INDEX IF NOT EXISTS (\w+)/)[1];
        console.log(`  ✅ ${indexName} 생성 완료`);
      } catch (error) {
        const indexName = query.match(/CREATE INDEX IF NOT EXISTS (\w+)/)[1];
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  ${indexName} 이미 존재함`);
        } else {
          console.log(`  ❌ ${indexName} 실패: ${error.message}`);
        }
      }
    }

    // =====================================================
    // 6단계: 기존 데이터 마이그레이션
    // =====================================================
    console.log('\n🔄 6단계: 기존 데이터 마이그레이션...');
    
    try {
      // 기존 narrative 필드를 user_script로 복사
      console.log('  기존 narrative → user_script 복사 중...');
      const updateResult = await client.query(`
        UPDATE guide_chapters 
        SET user_script = narrative 
        WHERE user_script IS NULL 
          AND narrative IS NOT NULL 
          AND narrative != '';
      `);
      console.log(`  ✅ ${updateResult.rowCount}개 행 업데이트 완료`);

      // 기본 메타데이터 설정
      console.log('  기본 메타데이터 설정 중...');
      const metadataResult = await client.query(`
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
        WHERE (audio_metadata = '{}'::jsonb OR audio_metadata IS NULL)
          AND tts_generation_status = 'pending';
      `);
      console.log(`  ✅ ${metadataResult.rowCount}개 행 메타데이터 설정 완료`);

    } catch (error) {
      console.log(`  ❌ 데이터 마이그레이션 오류: ${error.message}`);
    }

    // =====================================================
    // 7단계: 결과 확인
    // =====================================================
    console.log('\n📋 7단계: 마이그레이션 결과 확인...');
    
    try {
      // 새로 추가된 칼럼 확인
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
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
      `);

      console.log(`  ✅ 총 ${columnsResult.rows.length}개의 새 칼럼 확인:`);
      let currentTable = '';
      columnsResult.rows.forEach(row => {
        if (row.table_name !== currentTable) {
          currentTable = row.table_name;
          console.log(`\n    📋 ${currentTable} 테이블:`);
        }
        console.log(`      - ${row.column_name} (${row.data_type})`);
      });

      // 데이터 마이그레이션 확인
      const dataResult = await client.query(`
        SELECT COUNT(*) as total_chapters, 
               COUNT(user_script) as chapters_with_user_script,
               COUNT(CASE WHEN tts_generation_status = 'pending' THEN 1 END) as pending_tts
        FROM guide_chapters;
      `);

      if (dataResult.rows.length > 0) {
        const stats = dataResult.rows[0];
        console.log(`\n  📊 데이터 현황:`);
        console.log(`    - 총 챕터 수: ${stats.total_chapters}`);
        console.log(`    - user_script가 있는 챕터: ${stats.chapters_with_user_script}`);
        console.log(`    - TTS 생성 대기 중: ${stats.pending_tts}`);
      }

    } catch (error) {
      console.log(`  ❌ 결과 확인 오류: ${error.message}`);
    }

    console.log('\n🎉 TTS 이중 스크립트 시스템 DB 마이그레이션 완료!');
    console.log('\n📋 성공적으로 추가된 기능들:');
    console.log('  • 이중 스크립트 저장 (사용자 자막 + TTS 최적화)');
    console.log('  • TTS 품질 관리 시스템');
    console.log('  • 페르소나 및 최적화 추적');
    console.log('  • 오디오 생성 메타데이터');
    console.log('  • 성능 분석 지표');
    console.log('  • 검색 최적화 인덱스');

  } catch (error) {
    console.error('❌ DB 마이그레이션 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
if (require.main === module) {
  executeDirectSQL()
    .then(() => {
      console.log('\n✅ Direct SQL 마이그레이션 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Direct SQL 마이그레이션 실패:', error);
      process.exit(1);
    });
}

module.exports = { executeDirectSQL };
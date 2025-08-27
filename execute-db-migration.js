// Supabase DB 마이그레이션 실행 스크립트
// TTS 이중 스크립트 시스템을 위한 칼럼 추가

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🚀 단계별 DB 마이그레이션
async function executeDBMigration() {
  console.log('🎯 TTS 이중 스크립트 시스템 DB 마이그레이션 시작...\n');

  try {
    // =====================================================
    // 1단계: guide_chapters 테이블 기본 칼럼 추가
    // =====================================================
    console.log('📝 1단계: guide_chapters 기본 칼럼 추가...');
    
    const step1Query = `
      ALTER TABLE guide_chapters 
      ADD COLUMN IF NOT EXISTS user_script TEXT,
      ADD COLUMN IF NOT EXISTS tts_script TEXT,
      ADD COLUMN IF NOT EXISTS tts_system_prompt TEXT,
      ADD COLUMN IF NOT EXISTS audio_metadata JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS script_version VARCHAR(10) DEFAULT 'v1.0';
    `;

    const { error: step1Error } = await supabase.rpc('execute_sql', { 
      query: step1Query 
    });

    if (step1Error) {
      console.log('⚠️  Step 1 - 직접 쿼리 방식 시도...');
      // 직접 각 칼럼 추가 시도
      const columns = [
        { name: 'user_script', type: 'TEXT' },
        { name: 'tts_script', type: 'TEXT' },
        { name: 'tts_system_prompt', type: 'TEXT' },
        { name: 'audio_metadata', type: 'JSONB', default: "'{}'::jsonb" },
        { name: 'script_version', type: "VARCHAR(10)", default: "'v1.0'" }
      ];

      for (const col of columns) {
        try {
          const addColumnQuery = `ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''};`;
          console.log(`  추가 중: ${col.name}...`);
          
          const { error } = await supabase.rpc('exec', { sql: addColumnQuery });
          if (error && !error.message.includes('already exists')) {
            console.log(`    ⚠️  ${col.name}: ${error.message}`);
          } else {
            console.log(`    ✅ ${col.name} 추가 완료`);
          }
        } catch (e) {
          console.log(`    ⚠️  ${col.name}: ${e.message}`);
        }
      }
    } else {
      console.log('✅ Step 1: guide_chapters 기본 칼럼 추가 완료');
    }

    // =====================================================
    // 2단계: guide_chapters 품질 관련 칼럼 추가
    // =====================================================
    console.log('\n📊 2단계: guide_chapters 품질 관리 칼럼 추가...');
    
    const qualityColumns = [
      { name: 'tts_quality_score', type: 'INTEGER', default: '0' },
      { name: 'tts_generation_status', type: "VARCHAR(20)", default: "'pending'" },
      { name: 'persona_type', type: 'VARCHAR(50)' },
      { name: 'optimization_applied', type: 'JSONB', default: "'[]'::jsonb" }
    ];

    for (const col of qualityColumns) {
      try {
        const addColumnQuery = `ALTER TABLE guide_chapters ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''};`;
        console.log(`  추가 중: ${col.name}...`);
        
        const { error } = await supabase.rpc('exec', { sql: addColumnQuery });
        if (error && !error.message.includes('already exists')) {
          console.log(`    ⚠️  ${col.name}: ${error.message}`);
        } else {
          console.log(`    ✅ ${col.name} 추가 완료`);
        }
      } catch (e) {
        console.log(`    ⚠️  ${col.name}: ${e.message}`);
      }
    }

    // =====================================================
    // 3단계: audio_files 테이블 TTS 칼럼 추가
    // =====================================================
    console.log('\n🔊 3단계: audio_files TTS 칼럼 추가...');
    
    const audioColumns = [
      { name: 'tts_engine', type: "VARCHAR(50)", default: "'google-cloud-tts'" },
      { name: 'voice_profile', type: 'JSONB', default: "'{}'::jsonb" },
      { name: 'audio_quality', type: "VARCHAR(20)", default: "'standard'" },
      { name: 'generation_metadata', type: 'JSONB', default: "'{}'::jsonb" }
    ];

    for (const col of audioColumns) {
      try {
        const addColumnQuery = `ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''};`;
        console.log(`  추가 중: ${col.name}...`);
        
        const { error } = await supabase.rpc('exec', { sql: addColumnQuery });
        if (error && !error.message.includes('already exists')) {
          console.log(`    ⚠️  ${col.name}: ${error.message}`);
        } else {
          console.log(`    ✅ ${col.name} 추가 완료`);
        }
      } catch (e) {
        console.log(`    ⚠️  ${col.name}: ${e.message}`);
      }
    }

    // =====================================================
    // 4단계: audio_files 성능 분석 칼럼 추가
    // =====================================================
    console.log('\n📈 4단계: audio_files 성능 분석 칼럼 추가...');
    
    const performanceColumns = [
      { name: 'speaker_role', type: 'VARCHAR(20)' },
      { name: 'estimated_duration', type: 'INTEGER', default: '0' },
      { name: 'ssml_complexity_score', type: 'DECIMAL(5,2)', default: '0.0' },
      { name: 'generation_time_ms', type: 'INTEGER', default: '0' }
    ];

    for (const col of performanceColumns) {
      try {
        const addColumnQuery = `ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''};`;
        console.log(`  추가 중: ${col.name}...`);
        
        const { error } = await supabase.rpc('exec', { sql: addColumnQuery });
        if (error && !error.message.includes('already exists')) {
          console.log(`    ⚠️  ${col.name}: ${error.message}`);
        } else {
          console.log(`    ✅ ${col.name} 추가 완료`);
        }
      } catch (e) {
        console.log(`    ⚠️  ${col.name}: ${e.message}`);
      }
    }

    // =====================================================
    // 5단계: 기존 데이터 마이그레이션
    // =====================================================
    console.log('\n🔄 5단계: 기존 데이터 마이그레이션...');
    
    try {
      // 기존 narrative 필드를 user_script로 복사
      console.log('  기존 narrative → user_script 복사 중...');
      const { data: updateResult, error: updateError } = await supabase.rpc('exec', {
        sql: `
          UPDATE guide_chapters 
          SET user_script = narrative 
          WHERE user_script IS NULL 
            AND narrative IS NOT NULL 
            AND narrative != '';
        `
      });

      if (updateError) {
        console.log(`    ⚠️  데이터 복사 실패: ${updateError.message}`);
      } else {
        console.log(`    ✅ 기존 narrative 데이터 복사 완료`);
      }

      // 기본 메타데이터 설정
      console.log('  기본 메타데이터 설정 중...');
      const { error: metadataError } = await supabase.rpc('exec', {
        sql: `
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
            AND tts_generation_status IS NULL;
        `
      });

      if (metadataError) {
        console.log(`    ⚠️  메타데이터 설정 실패: ${metadataError.message}`);
      } else {
        console.log(`    ✅ 기본 메타데이터 설정 완료`);
      }
    } catch (e) {
      console.log(`    ⚠️  데이터 마이그레이션 오류: ${e.message}`);
    }

    // =====================================================
    // 6단계: 결과 확인
    // =====================================================
    console.log('\n📋 6단계: 마이그레이션 결과 확인...');
    
    try {
      // guide_chapters 테이블 구조 확인
      const { data: chaptersColumns, error: chaptersError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'guide_chapters')
        .in('column_name', [
          'user_script', 'tts_script', 'tts_system_prompt', 'audio_metadata',
          'script_version', 'tts_quality_score', 'tts_generation_status',
          'persona_type', 'optimization_applied'
        ])
        .order('column_name');

      if (chaptersColumns && chaptersColumns.length > 0) {
        console.log(`  ✅ guide_chapters 새 칼럼 ${chaptersColumns.length}개 확인:`);
        chaptersColumns.forEach(col => {
          console.log(`    - ${col.column_name} (${col.data_type})`);
        });
      }

      // audio_files 테이블 구조 확인
      const { data: audioColumns, error: audioError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'audio_files')
        .in('column_name', [
          'tts_engine', 'voice_profile', 'audio_quality', 'generation_metadata',
          'speaker_role', 'estimated_duration', 'ssml_complexity_score', 'generation_time_ms'
        ])
        .order('column_name');

      if (audioColumns && audioColumns.length > 0) {
        console.log(`  ✅ audio_files 새 칼럼 ${audioColumns.length}개 확인:`);
        audioColumns.forEach(col => {
          console.log(`    - ${col.column_name} (${col.data_type})`);
        });
      }

      // 데이터 마이그레이션 결과 확인
      const { data: migratedData, error: dataError } = await supabase
        .from('guide_chapters')
        .select('id, user_script, tts_generation_status, audio_metadata')
        .not('user_script', 'is', null)
        .limit(5);

      if (migratedData && migratedData.length > 0) {
        console.log(`  ✅ 데이터 마이그레이션 성공: ${migratedData.length}개 챕터 확인`);
        migratedData.forEach((row, idx) => {
          console.log(`    ${idx + 1}. ID: ${row.id} | Status: ${row.tts_generation_status} | Script: ${row.user_script ? '있음' : '없음'}`);
        });
      }

    } catch (e) {
      console.log(`  ⚠️  결과 확인 오류: ${e.message}`);
    }

    console.log('\n🎉 TTS 이중 스크립트 시스템 DB 마이그레이션 완료!');
    console.log('\n📋 추가된 주요 칼럼들:');
    console.log('  • user_script - 사용자용 깔끔한 자막');
    console.log('  • tts_script - TTS용 SSML 스크립트');
    console.log('  • tts_system_prompt - TTS 시스템 프롬프트');
    console.log('  • audio_metadata - TTS 메타데이터');
    console.log('  • tts_quality_score - 품질 점수');
    console.log('  • persona_type - 사용된 페르소나');
    console.log('  • voice_profile - 음성 프로필');
    console.log('  • generation_metadata - 생성 메타데이터');

  } catch (error) {
    console.error('❌ DB 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  executeDBMigration()
    .then(() => {
      console.log('\n✅ 마이그레이션 프로세스 종료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 마이그레이션 프로세스 실패:', error);
      process.exit(1);
    });
}

module.exports = { executeDBMigration };
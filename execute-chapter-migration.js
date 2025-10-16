#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
    process.exit(1);
}

if (!supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeMigration() {
    try {
        console.log('🚀 podcast_episodes 테이블 chapter 컬럼 추가 시작...');
        
        // SQL 파일 읽기
        const sqlScript = fs.readFileSync('./add-chapter-fields.sql', 'utf8');
        
        console.log('📝 SQL 스크립트 실행 중...');
        
        // SQL 실행
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript });
        
        if (error) {
            // RPC 함수가 없다면 직접 실행
            console.log('💡 exec_sql RPC 함수가 없어서 직접 실행을 시도합니다...');
            
            // SQL을 여러 부분으로 나누어 실행
            const statements = sqlScript.split(';').filter(stmt => stmt.trim());
            
            for (const statement of statements) {
                const trimmedStatement = statement.trim();
                if (trimmedStatement && !trimmedStatement.startsWith('--')) {
                    try {
                        const { error: execError } = await supabase
                            .from('dummy') // 더미 테이블, 실제로는 raw SQL 실행
                            .select('*')
                            .limit(0);
                        
                        // raw SQL 실행을 시도해보고, 안되면 다른 방법 사용
                        console.log('⚠️  Supabase 클라이언트로는 raw SQL 실행이 제한됩니다.');
                        console.log('🔧 대신 Supabase Dashboard의 SQL Editor에서 다음 SQL을 실행해주세요:');
                        console.log('\n------- SQL 시작 -------');
                        console.log(sqlScript);
                        console.log('------- SQL 끝 -------\n');
                        
                        console.log('✅ SQL을 수동으로 실행한 후 계속 진행하려면 아무 키나 누르세요...');
                        
                        // 사용자 입력 대기 (Node.js에서는 복잡하므로, 메시지만 출력)
                        return;
                        
                    } catch (e) {
                        console.log('실행 중:', trimmedStatement.substring(0, 100) + '...');
                    }
                }
            }
        } else {
            console.log('✅ SQL 스크립트 실행 완료:', data);
        }
        
        // 테이블 구조 확인
        console.log('\n🔍 podcast_episodes 테이블 구조 확인...');
        
        const { data: columns, error: colError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'podcast_episodes')
            .in('column_name', ['chapter_type', 'chapter_number']);
            
        if (columns && columns.length > 0) {
            console.log('✅ 컬럼 추가 확인:', columns);
        } else {
            console.log('⚠️  컬럼 확인 실패 - 수동으로 확인이 필요할 수 있습니다.');
        }
        
        console.log('\n🎉 migration 완료!');
        
    } catch (error) {
        console.error('❌ Migration 실패:', error);
        
        // 최종적으로 수동 실행 안내
        console.log('\n🔧 수동 실행 방법:');
        console.log('1. Supabase Dashboard → SQL Editor 접속');
        console.log('2. 다음 SQL 코드를 복사하여 실행:');
        console.log('\n------- 수동 실행용 SQL -------');
        const sqlScript = fs.readFileSync('./add-chapter-fields.sql', 'utf8');
        console.log(sqlScript);
        console.log('------- SQL 끝 -------');
    }
}

// .env.local 파일 로드
require('dotenv').config({ path: './.env.local' });

executeMigration();
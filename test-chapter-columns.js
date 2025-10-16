#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testColumns() {
    try {
        console.log('🔍 podcast_episodes 테이블 컬럼 확인...');
        
        // 테스트용 쿼리로 컬럼 존재 확인
        const { data, error } = await supabase
            .from('podcast_episodes')
            .select('id, chapter_type, chapter_number')
            .limit(1);
            
        if (error) {
            console.error('❌ 컬럼 확인 실패:', error.message);
            
            if (error.message.includes('chapter_type') || error.message.includes('chapter_number')) {
                console.log('\n🔧 컬럼이 아직 생성되지 않았습니다. 다음 SQL을 Supabase Dashboard에서 실행하세요:');
                console.log('\nALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS chapter_type VARCHAR(20) DEFAULT \'full\';');
                console.log('ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS chapter_number INTEGER DEFAULT 1;');
            }
        } else {
            console.log('✅ 컬럼이 존재합니다:', data ? '데이터 있음' : '테이블이 비어있음');
        }
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error);
    }
}

testColumns();
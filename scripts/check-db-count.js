// 실시간 DB 가이드 개수 확인
const axios = require('axios');

const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

async function checkDBCount() {
    try {
        console.log('🔍 실시간 DB 상태 확인...');
        
        // 전체 가이드 개수
        const totalResponse = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            },
            params: {
                select: 'id'
            }
        });
        
        const totalCount = totalResponse.headers['content-range']?.split('/')[1] || totalResponse.data.length;
        console.log('📊 전체 가이드 개수:', totalCount);
        
        // 언어별 개수
        const languages = ['ko', 'en', 'ja', 'zh', 'es'];
        console.log('\n📈 언어별 가이드 개수:');
        
        for (const lang of languages) {
            const langResponse = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                },
                params: {
                    select: 'id',
                    language: `eq.${lang}`
                }
            });
            
            const count = langResponse.headers['content-range']?.split('/')[1] || langResponse.data.length;
            console.log(`  ${lang}: ${count}개`);
        }
        
        // 최근 생성된 가이드 5개
        console.log('\n🆕 최근 생성된 가이드 5개:');
        const recentResponse = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            params: {
                select: 'locationname,language,created_at,updated_at',
                order: 'updated_at.desc',
                limit: 5
            }
        });
        
        recentResponse.data.forEach((guide, index) => {
            const time = new Date(guide.updated_at).toLocaleString('ko-KR');
            console.log(`  ${index + 1}. ${guide.locationname} (${guide.language}) - ${time}`);
        });
        
    } catch (error) {
        console.error('❌ DB 확인 오류:', error.message);
    }
}

checkDBCount();
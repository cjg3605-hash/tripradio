// 🔬 간단한 테스트 - 1개 가이드만 생성해서 문제점 파악
const axios = require('axios');

async function testSingleGuide() {
    try {
        console.log('🔬 단일 가이드 생성 테스트 시작...');
        
        // 1. 번역 API 테스트
        console.log('1️⃣ 번역 API 테스트...');
        const translateResponse = await axios.post('http://localhost:3002/api/translate-local', {
            text: 'Eiffel Tower',
            sourceLanguage: 'en',
            targetLanguage: 'ko'
        }, { timeout: 10000 });
        
        console.log('✅ 번역 결과:', translateResponse.data);
        
        // 2. AI 가이드 생성 API 테스트
        console.log('2️⃣ AI 가이드 생성 API 테스트...');
        const generateResponse = await axios.post('http://localhost:3002/api/ai/generate-multilang-guide', {
            locationName: '에펠탑',
            language: 'ko',
            userProfile: {
                preferredLanguage: 'ko',
                interests: ['여행', '문화'],
                travelStyle: 'cultural'
            }
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000 // 1분
        });
        
        console.log('✅ AI 생성 성공:', {
            success: generateResponse.data.success,
            dataSize: JSON.stringify(generateResponse.data.data).length + '자'
        });
        
        if (!generateResponse.data.success) {
            console.log('❌ AI 생성 실패:', generateResponse.data.error);
            return;
        }
        
        // 3. DB 저장 테스트
        console.log('3️⃣ DB 저장 테스트...');
        const saveResponse = await axios.post('https://fajiwgztfwoiisgnnams.supabase.co/rest/v1/guides', {
            locationname: '에펠탑',
            language: 'ko',
            content: generateResponse.data.data,
            updated_at: new Date().toISOString()
        }, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            timeout: 15000
        });
        
        console.log('✅ DB 저장 성공:', saveResponse.status);
        
        // 4. DB에서 확인
        console.log('4️⃣ DB 확인 테스트...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
        
        const checkResponse = await axios.get('https://fajiwgztfwoiisgnnams.supabase.co/rest/v1/guides', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE7NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Content-Type': 'application/json'
            },
            params: {
                select: 'locationname,language,updated_at',
                locationname: 'eq.에펠탑',
                language: 'eq.ko'
            }
        });
        
        if (checkResponse.data && checkResponse.data.length > 0) {
            console.log('✅ DB 확인 성공:', {
                location: checkResponse.data[0].locationname,
                language: checkResponse.data[0].language,
                updated: checkResponse.data[0].updated_at
            });
            console.log('🎉 전체 플로우 테스트 성공!');
        } else {
            console.log('❌ DB 확인 실패: 저장된 데이터를 찾을 수 없음');
        }
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        if (error.response) {
            console.error('응답 데이터:', error.response.data);
            console.error('응답 상태:', error.response.status);
        }
    }
}

testSingleGuide();
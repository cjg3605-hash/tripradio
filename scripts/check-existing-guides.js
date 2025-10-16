// 현재 데이터베이스에 저장된 가이드 현황 확인 스크립트

const axios = require('axios');

const attractions = [
    // Korea (12개)
    '경복궁', '남산타워', '명동', '해운대해수욕장', '감천문화마을', '자갈치시장', 
    '한라산', '성산일출봉', '중문관광단지', '불국사', '석굴암', '첨성대',
    
    // Europe (15개)
    'Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Colosseum', 
    'Leaning Tower of Pisa', 'Vatican', 'Sagrada Familia', 'Alhambra', 
    'Park Güell', 'Big Ben', 'Tower Bridge', 'Buckingham Palace', 
    'Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral',
    
    // Asia (15개)
    'Mount Fuji', 'Kiyomizu-dera', 'Senso-ji', 'Great Wall', 'Forbidden City', 
    'Tiananmen Square', 'Taj Mahal', 'Red Fort', 'Ganges River', 'Wat Arun', 
    'Grand Palace', 'Wat Pho', 'Marina Bay Sands', 'Gardens by the Bay', 'Merlion',
    
    // Americas (15개)
    'Statue of Liberty', 'Grand Canyon', 'Times Square', 'Niagara Falls', 
    'CN Tower', 'Banff National Park', 'Christ the Redeemer', 'Iguazu Falls', 
    'Maracanã Stadium', 'Machu Picchu', 'Cusco', 'Nazca Lines', 
    'Chichen Itza', 'Teotihuacan', 'Cancun'
];

const languages = ['ko', 'en', 'ja', 'zh', 'es'];

function normalizeString(str) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function checkGuideExists(attraction, language) {
    try {
        const normalizedLocation = normalizeString(attraction);
        
        const response = await axios.get('https://fajiwgztfwoiisgnnams.supabase.co/rest/v1/guides', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Content-Type': 'application/json'
            },
            params: {
                select: 'id,locationname,language,created_at',
                locationname: `eq.${normalizedLocation}`,
                language: `eq.${language.toLowerCase()}`
            }
        });
        
        return response.data && response.data.length > 0;
    } catch (error) {
        return false;
    }
}

async function checkAllGuides() {
    console.log('🔍 현재 데이터베이스 가이드 현황 확인');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const results = {
        total: attractions.length * languages.length,
        existing: 0,
        missing: 0,
        missingList: []
    };
    
    for (let i = 0; i < attractions.length; i++) {
        const attraction = attractions[i];
        console.log(`\n📍 [${i + 1}/${attractions.length}] ${attraction}`);
        
        const attractionResults = {};
        
        for (const language of languages) {
            const exists = await checkGuideExists(attraction, language);
            attractionResults[language] = exists;
            
            if (exists) {
                results.existing++;
                console.log(`  ✅ ${language}: 존재`);
            } else {
                results.missing++;
                results.missingList.push({ attraction, language });
                console.log(`  ❌ ${language}: 없음`);
            }
            
            // API 부하 방지를 위한 짧은 대기
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 최종 결과');
    console.log(`전체 대상: ${results.total}개`);
    console.log(`존재하는 가이드: ${results.existing}개 (${(results.existing/results.total*100).toFixed(1)}%)`);
    console.log(`누락된 가이드: ${results.missing}개 (${(results.missing/results.total*100).toFixed(1)}%)`);
    
    if (results.missing > 0) {
        console.log('\n❌ 누락된 가이드 목록:');
        results.missingList.forEach(item => {
            console.log(`   ${item.attraction} (${item.language})`);
        });
        
        console.log('\n🎯 누락된 가이드만 생성하면 됩니다!');
        console.log(`총 ${results.missing}개의 가이드를 추가로 생성하면 완료됩니다.`);
    } else {
        console.log('\n🎉 모든 가이드가 이미 존재합니다!');
        console.log('285개 가이드 생성이 완료되었습니다.');
    }
    
    return results;
}

if (require.main === module) {
    checkAllGuides().catch(console.error);
}

module.exports = { checkAllGuides };
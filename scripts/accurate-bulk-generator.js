// 🎯 정확한 가이드 생성 검증을 위한 배치 생성기
// 데이터베이스에 실제로 저장되었는지 확인

const axios = require('axios');
const fs = require('fs');

// 57개 명소 데이터
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

console.log('🎯 TripRadio 정확한 배치 생성기');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 생성 대상: ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 가이드`);

// 상태 관리
const state = {
    isRunning: false,
    startTime: null,
    completed: 0,
    success: 0,
    cached: 0,
    failed: 0,
    errors: []
};

// 정규화 함수 (데이터베이스 검색용)
function normalizeString(str) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

// 데이터베이스에서 가이드 존재 여부 확인
async function checkGuideExists(attraction, language) {
    try {
        const normalizedLocation = normalizeString(attraction);
        
        // Supabase REST API로 직접 확인
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
        console.log(`⚠️ DB 확인 실패: ${attraction} (${language}) - ${error.message}`);
        return false;
    }
}

// 실제 가이드 생성 함수 (기존 API 사용)
async function generateGuide(attraction, language) {
    try {
        console.log(`🔄 생성 중: ${attraction} (${language})`);
        
        // 1. 먼저 데이터베이스에 이미 존재하는지 확인
        const existsInDB = await checkGuideExists(attraction, language);
        if (existsInDB) {
            state.cached++;
            console.log(`💾 성공: ${attraction} (${language}) - 이미 존재`);
            return { success: true, attraction, language, cached: true };
        }
        
        // 2. 존재하지 않으면 생성 API 호출
        const response = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
            locationName: attraction,
            language: language,
            forceRegenerate: false,
            generationMode: 'autonomous',
            userProfile: {
                demographics: {
                    age: 35,
                    country: language === 'ko' ? 'south_korea' : 
                             language === 'en' ? 'usa' :
                             language === 'ja' ? 'japan' : 
                             language === 'zh' ? 'china' : 
                             language === 'es' ? 'spain' : 'usa',
                    language: language,
                    travelStyle: 'cultural',
                    techSavviness: 3
                },
                usage: {
                    sessionsPerMonth: 2,
                    avgSessionDuration: 15,
                    preferredContentLength: 'medium',
                    deviceType: 'mobile'
                }
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60초 타임아웃
        });

        const result = response.data;
        
        if (result.success) {
            // 3. 생성 후 실제로 DB에 저장되었는지 재확인
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
            const savedInDB = await checkGuideExists(attraction, language);
            
            if (savedInDB) {
                if (result.cached === 'hit' || result.cached === 'mega_hit') {
                    state.cached++;
                    console.log(`💾 성공: ${attraction} (${language}) - API 캐시, DB 확인됨`);
                } else {
                    state.success++;
                    console.log(`✅ 성공: ${attraction} (${language}) - 신규 생성, DB 저장됨`);
                }
                return { success: true, attraction, language, cached: result.cached, verified: true };
            } else {
                state.failed++;
                const error = 'API 성공했지만 DB에 저장되지 않음';
                state.errors.push({ attraction, language, error });
                console.log(`❌ 실패: ${attraction} (${language}) - ${error}`);
                return { success: false, attraction, language, error };
            }
        } else {
            state.failed++;
            state.errors.push({ attraction, language, error: result.error });
            console.log(`❌ 실패: ${attraction} (${language}) - ${result.error}`);
            return { success: false, attraction, language, error: result.error };
        }
    } catch (error) {
        state.failed++;
        state.errors.push({ attraction, language, error: error.message });
        console.log(`❌ 오류: ${attraction} (${language}) - ${error.message}`);
        return { success: false, attraction, language, error: error.message };
    }
}

// 진행 상황 출력
function printProgress() {
    const total = attractions.length * languages.length;
    const elapsed = (Date.now() - state.startTime) / 1000;
    const progress = (state.completed / total * 100).toFixed(1);
    const remaining = total - state.completed;
    const avgTime = elapsed / state.completed;
    const eta = remaining * avgTime;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 진행률: ${progress}% (${state.completed}/${total})`);
    console.log(`⏱️  소요 시간: ${elapsed.toFixed(1)}초`);
    console.log(`⏰ 예상 잔여: ${eta.toFixed(1)}초`);
    console.log(`✅ 새로 생성: ${state.success}개`);
    console.log(`💾 기존 존재: ${state.cached}개`);
    console.log(`❌ 실패: ${state.failed}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 결과 저장
function saveResults() {
    const results = {
        timestamp: new Date().toISOString(),
        summary: {
            total: attractions.length * languages.length,
            completed: state.completed,
            success: state.success,
            cached: state.cached,
            failed: state.failed,
            successRate: ((state.success + state.cached) / state.completed * 100).toFixed(1) + '%'
        },
        errors: state.errors,
        duration: state.startTime ? ((Date.now() - state.startTime) / 1000).toFixed(1) + '초' : '0초'
    };
    
    const filename = `accurate-generation-results-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 결과 저장됨: ${filename}`);
    return filename;
}

// 메인 실행 함수
async function runAccurateBatch() {
    console.log('\n🚀 정확한 배치 생성 시작...');
    console.log('중단하려면 Ctrl+C 누르세요\n');
    
    state.isRunning = true;
    state.startTime = Date.now();
    
    // 중단 처리
    process.on('SIGINT', () => {
        console.log('\n⏹️  사용자 중단 신호 감지...');
        state.isRunning = false;
        
        console.log('\n🎯 중간 결과:');
        printProgress();
        saveResults();
        
        console.log('\n👋 프로그램을 종료합니다.');
        process.exit(0);
    });
    
    // 메인 루프
    for (let i = 0; i < attractions.length && state.isRunning; i++) {
        const attraction = attractions[i];
        console.log(`\n📍 [${i + 1}/${attractions.length}] ${attraction}`);
        
        for (let j = 0; j < languages.length && state.isRunning; j++) {
            const language = languages[j];
            
            await generateGuide(attraction, language);
            state.completed++;
            
            // 10개마다 진행 상황 출력
            if (state.completed % 10 === 0) {
                printProgress();
            }
            
            // 3초 대기 (API 부하 방지 + DB 저장 시간 고려)
            if (state.completed < attractions.length * languages.length) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }
    
    // 최종 결과
    console.log('\n🎉 정확한 배치 생성 완료!');
    printProgress();
    
    const successRate = ((state.success + state.cached) / state.completed * 100).toFixed(1);
    console.log(`\n📈 최종 성공률: ${successRate}%`);
    
    if (state.failed > 0) {
        console.log('\n❌ 실패한 가이드 목록:');
        state.errors.forEach(err => {
            console.log(`   ${err.attraction} (${err.language}): ${err.error}`);
        });
    }
    
    const filename = saveResults();
    console.log(`\n📁 상세 결과는 ${filename} 파일을 확인하세요.`);
}

// 실행 시작
if (require.main === module) {
    runAccurateBatch().catch(error => {
        console.error('❌ 치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = { runAccurateBatch, attractions, languages };
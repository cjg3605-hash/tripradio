// 🎯 웹사이트 실제 API를 사용하는 정확한 가이드 생성기
// MultiLangGuideManager와 동일한 로직 사용

const axios = require('axios');
const fs = require('fs');

// 누락된 가이드 목록 (확인된 260개)
const missingGuides = [
    // 해운대해수욕장 (3개 언어)
    { attraction: '해운대해수욕장', language: 'ja' },
    { attraction: '해운대해수욕장', language: 'zh' },
    { attraction: '해운대해수욕장', language: 'es' },
    
    // 기타 한국 명소들 (4개 언어씩)
    { attraction: '감천문화마을', language: 'en' },
    { attraction: '감천문화마을', language: 'ja' },
    { attraction: '감천문화마을', language: 'zh' },
    { attraction: '감천문화마을', language: 'es' },
    
    { attraction: '자갈치시장', language: 'en' },
    { attraction: '자갈치시장', language: 'ja' },
    { attraction: '자갈치시장', language: 'zh' },
    { attraction: '자갈치시장', language: 'es' },
    
    { attraction: '한라산', language: 'en' },
    { attraction: '한라산', language: 'ja' },
    { attraction: '한라산', language: 'zh' },
    { attraction: '한라산', language: 'es' },
    
    { attraction: '성산일출봉', language: 'en' },
    { attraction: '성산일출봉', language: 'ja' },
    { attraction: '성산일출봉', language: 'zh' },
    { attraction: '성산일출봉', language: 'es' },
    
    { attraction: '중문관광단지', language: 'en' },
    { attraction: '중문관광단지', language: 'ja' },
    { attraction: '중문관광단지', language: 'zh' },
    { attraction: '중문관광단지', language: 'es' },
    
    { attraction: '불국사', language: 'en' },
    { attraction: '불국사', language: 'ja' },
    { attraction: '불국사', language: 'zh' },
    { attraction: '불국사', language: 'es' },
    
    { attraction: '석굴암', language: 'en' },
    { attraction: '석굴암', language: 'ja' },
    { attraction: '석굴암', language: 'zh' },
    { attraction: '석굴암', language: 'es' },
    
    { attraction: '첨성대', language: 'en' },
    { attraction: '첨성대', language: 'ja' },
    { attraction: '첨성대', language: 'zh' },
    { attraction: '첨성대', language: 'es' }
];

// 해외 명소들 (5개 언어씩)
const overseasAttractions = [
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

// 해외 명소의 누락된 가이드 추가
overseasAttractions.forEach(attraction => {
    languages.forEach(language => {
        missingGuides.push({ attraction, language });
    });
});

console.log('🎯 웹사이트 실제 API 기반 가이드 생성기');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 누락된 가이드: ${missingGuides.length}개`);

// 상태 관리
const state = {
    isRunning: false,
    startTime: null,
    completed: 0,
    success: 0,
    failed: 0,
    errors: [],
    retries: 0
};

// 웹사이트와 동일한 가이드 생성 함수
async function generateGuideWithWebsiteAPI(attraction, language, retryCount = 0) {
    const maxRetries = 3;
    
    try {
        console.log(`🔄 생성 중: ${attraction} (${language})${retryCount > 0 ? ` [재시도 ${retryCount}]` : ''}`);
        
        // 웹사이트에서 사용하는 실제 API 호출
        const response = await axios.post('http://localhost:3002/api/ai/generate-multilang-guide', {
            locationName: attraction,
            language: language,
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
            timeout: 180000 // 3분 타임아웃 (AI 생성 시간 고려)
        });

        const result = response.data;
        
        if (result.success) {
            state.success++;
            console.log(`✅ ${language} 가이드 생성 완료: ${attraction}`);
            return { success: true, attraction, language, data: result.data };
        } else {
            throw new Error(result.error || '가이드 생성 실패');
        }
        
    } catch (error) {
        // 재시도 로직 (네트워크 오류, 타임아웃, 서버 오류)
        if (retryCount < maxRetries && (
            error.code === 'ECONNRESET' || 
            error.code === 'ETIMEDOUT' ||
            error.message.includes('timeout') ||
            error.response?.status === 500 ||
            error.response?.status === 502 ||
            error.response?.status === 503 ||
            error.response?.status === 504
        )) {
            console.log(`🔄 재시도 예정: ${attraction} (${language}) - ${error.message}`);
            state.retries++;
            
            // 재시도 전 대기 시간 (점진적 증가)
            const waitTime = (retryCount + 1) * 10000; // 10초, 20초, 30초
            console.log(`⏳ ${waitTime/1000}초 대기 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            return generateGuideWithWebsiteAPI(attraction, language, retryCount + 1);
        } else {
            state.failed++;
            const errorMsg = error.response?.data?.error || error.message || '알 수 없는 오류';
            state.errors.push({ attraction, language, error: errorMsg, retryCount });
            console.log(`❌ 실패: ${attraction} (${language}) - ${errorMsg} (재시도 ${retryCount}회 후 포기)`);
            return { success: false, attraction, language, error: errorMsg };
        }
    }
}

// 데이터베이스에서 실제 저장 확인
async function verifyGuideInDatabase(attraction, language) {
    try {
        const normalizedLocation = attraction.trim().toLowerCase().replace(/\s+/g, ' ');
        
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
        console.log(`⚠️ DB 확인 실패: ${attraction} (${language})`);
        return false;
    }
}

// 진행 상황 출력
function printProgress() {
    const total = missingGuides.length;
    const elapsed = (Date.now() - state.startTime) / 1000;
    const progress = (state.completed / total * 100).toFixed(1);
    const remaining = total - state.completed;
    const avgTime = elapsed / state.completed;
    const eta = remaining * avgTime;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 진행률: ${progress}% (${state.completed}/${total})`);
    console.log(`⏱️  소요 시간: ${(elapsed/60).toFixed(1)}분`);
    console.log(`⏰ 예상 잔여: ${(eta/60).toFixed(1)}분`);
    console.log(`✅ 성공: ${state.success}개`);
    console.log(`❌ 실패: ${state.failed}개`);
    console.log(`🔄 재시도: ${state.retries}회`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 결과 저장
function saveResults() {
    const results = {
        timestamp: new Date().toISOString(),
        summary: {
            total: missingGuides.length,
            completed: state.completed,
            success: state.success,
            failed: state.failed,
            retries: state.retries,
            successRate: (state.success / state.completed * 100).toFixed(1) + '%'
        },
        errors: state.errors,
        duration: state.startTime ? ((Date.now() - state.startTime) / 60000).toFixed(1) + '분' : '0분'
    };
    
    const filename = `correct-api-results-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 결과 저장됨: ${filename}`);
    return filename;
}

// 메인 실행 함수
async function generateMissingGuidesCorrectly() {
    console.log('\n🚀 웹사이트 실제 API로 가이드 생성 시작...');
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
    for (let i = 0; i < missingGuides.length && state.isRunning; i++) {
        const { attraction, language } = missingGuides[i];
        
        // 생성 전 한 번 더 DB 확인 (중복 방지)
        const alreadyExists = await verifyGuideInDatabase(attraction, language);
        if (alreadyExists) {
            console.log(`💾 이미 존재: ${attraction} (${language}) - 건너뛰기`);
            state.completed++;
            continue;
        }
        
        const result = await generateGuideWithWebsiteAPI(attraction, language);
        state.completed++;
        
        // 생성 후 DB 저장 확인
        if (result.success) {
            console.log(`⏳ DB 저장 확인 중...`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
            
            const savedSuccessfully = await verifyGuideInDatabase(attraction, language);
            if (savedSuccessfully) {
                console.log(`✅ DB 저장 확인됨: ${attraction} (${language})`);
            } else {
                console.log(`⚠️ DB 저장 미확인: ${attraction} (${language})`);
            }
        }
        
        // 10개마다 진행 상황 출력
        if (state.completed % 10 === 0) {
            printProgress();
        }
        
        // 각 요청 간 7초 대기 (AI 생성 시간 + 서버 부하 방지)
        if (state.completed < missingGuides.length && state.isRunning) {
            console.log('⏳ 7초 대기 중...');
            await new Promise(resolve => setTimeout(resolve, 7000));
        }
    }
    
    // 최종 결과
    console.log('\n🎉 가이드 생성 작업 완료!');
    printProgress();
    
    const successRate = (state.success / state.completed * 100).toFixed(1);
    console.log(`\n📈 최종 성공률: ${successRate}%`);
    console.log(`🔄 총 재시도 횟수: ${state.retries}회`);
    console.log(`⏱️ 총 소요 시간: ${((Date.now() - state.startTime) / 60000).toFixed(1)}분`);
    
    if (state.failed > 0) {
        console.log('\n❌ 실패한 가이드 목록:');
        state.errors.forEach(err => {
            console.log(`   ${err.attraction} (${err.language}): ${err.error}`);
        });
    }
    
    const filename = saveResults();
    console.log(`\n📁 상세 결과는 ${filename} 파일을 확인하세요.`);
    
    if (state.success === missingGuides.length) {
        console.log('\n🎊 축하합니다! 285개 가이드 생성이 모두 완료되었습니다!');
    } else {
        console.log(`\n📝 남은 작업: ${missingGuides.length - state.success}개 가이드 재시도 필요`);
    }
}

// 실행 시작
if (require.main === module) {
    generateMissingGuidesCorrectly().catch(error => {
        console.error('❌ 치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = { generateMissingGuidesCorrectly, missingGuides };
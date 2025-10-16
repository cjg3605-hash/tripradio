// 🎯 누락된 260개 가이드만 생성하는 최적화된 스크립트

const axios = require('axios');
const fs = require('fs');

// 누락된 가이드 목록 (DB 확인 결과 기반)
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

console.log('🎯 누락된 가이드 전용 생성기');
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

// 실제 가이드 생성 함수 (재시도 로직 포함)
async function generateGuide(attraction, language, retryCount = 0) {
    const maxRetries = 3;
    
    try {
        console.log(`🔄 생성 중: ${attraction} (${language})${retryCount > 0 ? ` [재시도 ${retryCount}]` : ''}`);
        
        const response = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
            locationName: attraction,
            language: language,
            forceRegenerate: true, // 강제 생성 (캐시 무시)
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
            timeout: 120000 // 2분 타임아웃
        });

        const result = response.data;
        
        if (result.success) {
            state.success++;
            console.log(`✅ 성공: ${attraction} (${language}) - 새로 생성됨`);
            return { success: true, attraction, language };
        } else {
            throw new Error(result.error || '알 수 없는 API 오류');
        }
        
    } catch (error) {
        // 재시도 로직
        if (retryCount < maxRetries && (
            error.code === 'ECONNRESET' || 
            error.code === 'ETIMEDOUT' ||
            error.message.includes('timeout') ||
            error.message.includes('500') ||
            error.message.includes('502') ||
            error.message.includes('503')
        )) {
            console.log(`🔄 재시도 예정: ${attraction} (${language}) - ${error.message}`);
            state.retries++;
            
            // 재시도 전 대기 시간 (점진적 증가)
            const waitTime = (retryCount + 1) * 5000; // 5초, 10초, 15초
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            return generateGuide(attraction, language, retryCount + 1);
        } else {
            state.failed++;
            state.errors.push({ attraction, language, error: error.message, retryCount });
            console.log(`❌ 실패: ${attraction} (${language}) - ${error.message} (재시도 ${retryCount}회 후 포기)`);
            return { success: false, attraction, language, error: error.message };
        }
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
    console.log(`⏱️  소요 시간: ${elapsed.toFixed(1)}초`);
    console.log(`⏰ 예상 잔여: ${eta.toFixed(1)}초`);
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
        duration: state.startTime ? ((Date.now() - state.startTime) / 1000).toFixed(1) + '초' : '0초'
    };
    
    const filename = `missing-guides-results-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 결과 저장됨: ${filename}`);
    return filename;
}

// 메인 실행 함수
async function generateMissingGuides() {
    console.log('\n🚀 누락된 가이드 생성 시작...');
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
        
        await generateGuide(attraction, language);
        state.completed++;
        
        // 10개마다 진행 상황 출력
        if (state.completed % 10 === 0) {
            printProgress();
        }
        
        // 각 요청 간 5초 대기 (서버 부하 방지)
        if (state.completed < missingGuides.length) {
            console.log('⏳ 5초 대기 중...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    // 최종 결과
    console.log('\n🎉 누락된 가이드 생성 완료!');
    printProgress();
    
    const successRate = (state.success / state.completed * 100).toFixed(1);
    console.log(`\n📈 최종 성공률: ${successRate}%`);
    console.log(`🔄 총 재시도 횟수: ${state.retries}회`);
    
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
    generateMissingGuides().catch(error => {
        console.error('❌ 치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = { generateMissingGuides, missingGuides };
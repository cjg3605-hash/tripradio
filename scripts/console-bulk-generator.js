// 웹 콘솔 전용 배치 가이드 생성기 - 한번에 실행
// 복사 후 콘솔에 붙여넣기만 하면 자동 시작

console.clear();
console.log('🎯 TripRadio 285개 가이드 배치 생성기');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 57개 명소 데이터 (메인 페이지 기준)
const ATTRACTIONS = [
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

const LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es'];
const TOTAL_GUIDES = ATTRACTIONS.length * LANGUAGES.length;

console.log(`📊 생성 대상: ${ATTRACTIONS.length}개 명소 × ${LANGUAGES.length}개 언어 = ${TOTAL_GUIDES}개 가이드`);

// 전역 상태 관리
const state = {
    isRunning: false,
    startTime: null,
    currentAttraction: 0,
    currentLanguage: 0,
    completed: 0,
    success: 0,
    cached: 0,
    failed: 0,
    errors: []
};

// API 호출 함수
async function callGuideAPI(attraction, language) {
    const response = await fetch('/api/node/ai/generate-guide/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            locationName: attraction,
            language: language,
            forceRegenerate: false,
            generationMode: 'autonomous',
            userProfile: {
                demographics: {
                    age: 35,
                    country: language === 'ko' ? 'south_korea' : 
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
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

// 진행 상황 출력
function printProgress() {
    const elapsed = (Date.now() - state.startTime) / 1000;
    const progress = (state.completed / TOTAL_GUIDES * 100).toFixed(1);
    const remaining = TOTAL_GUIDES - state.completed;
    const avgTime = elapsed / state.completed;
    const eta = remaining * avgTime;
    
    console.log(`\n📈 [${progress}%] ${state.completed}/${TOTAL_GUIDES} 완료`);
    console.log(`⏱️  소요: ${elapsed.toFixed(1)}초 | 예상 잔여: ${eta.toFixed(1)}초`);
    console.log(`✅ 성공: ${state.success} | 💾 캐시: ${state.cached} | ❌ 실패: ${state.failed}`);
    
    if (state.currentAttraction < ATTRACTIONS.length) {
        console.log(`🎯 현재: ${ATTRACTIONS[state.currentAttraction]} (${LANGUAGES[state.currentLanguage]})`);
    }
}

// 단일 가이드 생성
async function generateGuide(attraction, language) {
    try {
        const result = await callGuideAPI(attraction, language);
        
        if (result.success) {
            if (result.cached === 'hit' || result.cached === 'mega_hit') {
                state.cached++;
                console.log(`💾 ${attraction} (${language}) - 캐시`);
            } else {
                state.success++;
                console.log(`✅ ${attraction} (${language}) - 생성`);
            }
            return true;
        } else {
            state.failed++;
            state.errors.push({ attraction, language, error: result.error });
            console.log(`❌ ${attraction} (${language}) - ${result.error}`);
            return false;
        }
    } catch (error) {
        state.failed++;
        state.errors.push({ attraction, language, error: error.message });
        console.log(`❌ ${attraction} (${language}) - ${error.message}`);
        return false;
    }
}

// 메인 실행 함수
async function runBatchGeneration() {
    if (state.isRunning) {
        console.log('❌ 이미 실행 중입니다.');
        return;
    }

    console.log('\n🚀 배치 생성 시작...');
    console.log('중단하려면: stopGeneration() 입력');
    
    state.isRunning = true;
    state.startTime = Date.now();
    
    for (let i = 0; i < ATTRACTIONS.length && state.isRunning; i++) {
        state.currentAttraction = i;
        const attraction = ATTRACTIONS[i];
        
        console.log(`\n📍 [${i + 1}/${ATTRACTIONS.length}] ${attraction}`);
        
        for (let j = 0; j < LANGUAGES.length && state.isRunning; j++) {
            state.currentLanguage = j;
            const language = LANGUAGES[j];
            
            await generateGuide(attraction, language);
            state.completed++;
            
            // 10개마다 진행 상황 출력
            if (state.completed % 10 === 0) {
                printProgress();
            }
            
            // 요청 간 1.5초 대기 (서버 부하 방지)
            if (state.completed < TOTAL_GUIDES) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
    }
    
    state.isRunning = false;
    
    // 최종 결과
    console.log('\n🎉 배치 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    printProgress();
    
    const successRate = ((state.success + state.cached) / TOTAL_GUIDES * 100).toFixed(1);
    console.log(`📈 성공률: ${successRate}%`);
    
    if (state.failed > 0) {
        console.log('\n❌ 실패한 가이드 목록:');
        state.errors.forEach(err => {
            console.log(`   ${err.attraction} (${err.language}): ${err.error}`);
        });
        console.log('\n🔄 실패한 가이드 재시도: retryFailed()');
    }
}

// 중단 함수
function stopGeneration() {
    state.isRunning = false;
    console.log('⏹️ 배치 생성이 중단됩니다...');
}

// 실패한 가이드 재시도
async function retryFailed() {
    if (state.errors.length === 0) {
        console.log('✅ 실패한 가이드가 없습니다.');
        return;
    }
    
    console.log(`\n🔄 ${state.errors.length}개 실패 가이드 재시도 중...`);
    
    const failedCopy = [...state.errors];
    state.errors = [];
    
    for (const item of failedCopy) {
        if (!state.isRunning) break;
        
        console.log(`🔄 ${item.attraction} (${item.language}) 재시도...`);
        const success = await generateGuide(item.attraction, item.language);
        
        if (success) {
            state.failed--;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🔄 재시도 완료');
    console.log(`✅ 최종 성공: ${state.success + state.cached}/${TOTAL_GUIDES}`);
    console.log(`❌ 최종 실패: ${state.failed}/${TOTAL_GUIDES}`);
}

// 상태 확인 함수
function checkStatus() {
    console.log('\n📊 현재 상태:');
    console.log(`🏃 실행 중: ${state.isRunning ? '예' : '아니오'}`);
    if (state.startTime) {
        printProgress();
    } else {
        console.log('📝 아직 시작되지 않았습니다.');
    }
}

// 전역 함수 등록
window.runBatchGeneration = runBatchGeneration;
window.stopGeneration = stopGeneration;
window.retryFailed = retryFailed;
window.checkStatus = checkStatus;

// 사용법 안내
console.log('\n🎮 사용법:');
console.log('runBatchGeneration() - 285개 가이드 생성 시작');
console.log('checkStatus() - 현재 진행 상황 확인');
console.log('stopGeneration() - 생성 중단');
console.log('retryFailed() - 실패한 가이드만 재시도');

console.log('\n⚡ 자동 시작합니다...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 3초 후 자동 시작
setTimeout(() => {
    console.log('🚀 3초 후 자동 시작합니다... (중단하려면 stopGeneration() 입력)');
    setTimeout(runBatchGeneration, 3000);
}, 1000);
// 🎯 브라우저에서 직접 실행하는 285개 가이드 배치 생성기
// 사용법: 웹사이트 콘솔에서 이 스크립트를 붙여넣고 실행

console.clear();
console.log('🎯 TripRadio 브라우저 배치 생성기');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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

console.log(`📊 생성 대상: ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 가이드`);

// 상태 관리
const batchState = {
    isRunning: false,
    current: 0,
    total: attractions.length * languages.length,
    success: 0,
    cached: 0,
    failed: 0,
    startTime: null,
    errors: []
};

// 언어 선택 함수
function selectLanguage(langCode) {
    const languageMap = {
        'ko': '한국어',
        'en': 'English', 
        'ja': '日本語',
        'zh': '中文',
        'es': 'Español'
    };
    
    const languageSelect = document.querySelector('[data-testid="language-selector"]') || 
                          document.querySelector('select[name="language"]') ||
                          document.querySelector('.language-select') ||
                          document.querySelector('#language-select');
    
    if (languageSelect) {
        // option 값으로 선택
        const option = Array.from(languageSelect.options).find(opt => 
            opt.value === langCode || opt.textContent.includes(languageMap[langCode])
        );
        if (option) {
            languageSelect.value = option.value;
            languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
    }
    
    // 언어 버튼으로 선택
    const languageButtons = document.querySelectorAll('button, a, div');
    for (const btn of languageButtons) {
        if (btn.textContent.includes(languageMap[langCode]) || 
            btn.getAttribute('data-lang') === langCode ||
            btn.className.includes(langCode)) {
            btn.click();
            return true;
        }
    }
    
    console.log(`⚠️ 언어 선택 실패: ${langCode}`);
    return false;
}

// 검색 및 가이드 생성 함수
async function searchAndGenerate(attraction, language) {
    try {
        console.log(`🔄 생성 중: ${attraction} (${language})`);
        
        // 1. 언어 선택
        selectLanguage(language);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 2. 검색창 찾기
        const searchInput = document.querySelector('input[type="text"]') ||
                           document.querySelector('input[placeholder*="검색"]') ||
                           document.querySelector('input[placeholder*="search"]') ||
                           document.querySelector('.search-input') ||
                           document.querySelector('#search-input') ||
                           document.querySelector('[data-testid="search-input"]');
        
        if (!searchInput) {
            throw new Error('검색창을 찾을 수 없습니다');
        }
        
        // 3. 검색어 입력
        searchInput.focus();
        searchInput.value = '';
        searchInput.value = attraction;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 4. 엔터 키 입력
        searchInput.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            bubbles: true
        }));
        
        // 5. 가이드 생성 대기 (30초)
        let waitTime = 0;
        const maxWait = 30000; // 30초
        
        while (waitTime < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            waitTime += 1000;
            
            // 가이드 생성 완료 확인
            const guideContent = document.querySelector('.guide-content') ||
                               document.querySelector('.travel-guide') ||
                               document.querySelector('[data-testid="guide-content"]') ||
                               document.querySelector('.generated-guide');
            
            if (guideContent && guideContent.textContent.length > 500) {
                batchState.success++;
                console.log(`✅ 성공: ${attraction} (${language}) - ${waitTime/1000}초`);
                return { success: true, attraction, language, time: waitTime };
            }
            
            // 에러 메시지 확인
            const errorMsg = document.querySelector('.error-message') ||
                           document.querySelector('.alert-error') ||
                           document.querySelector('[data-testid="error"]');
            
            if (errorMsg && errorMsg.textContent.length > 0) {
                throw new Error(errorMsg.textContent);
            }
        }
        
        throw new Error('30초 타임아웃');
        
    } catch (error) {
        batchState.failed++;
        batchState.errors.push({ attraction, language, error: error.message });
        console.log(`❌ 실패: ${attraction} (${language}) - ${error.message}`);
        return { success: false, attraction, language, error: error.message };
    }
}

// 진행 상황 출력
function printProgress() {
    const elapsed = batchState.startTime ? (Date.now() - batchState.startTime) / 1000 : 0;
    const progress = (batchState.current / batchState.total * 100).toFixed(1);
    const remaining = batchState.total - batchState.current;
    const avgTime = batchState.current > 0 ? elapsed / batchState.current : 0;
    const eta = remaining * avgTime;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 진행률: ${progress}% (${batchState.current}/${batchState.total})`);
    console.log(`⏱️  소요 시간: ${elapsed.toFixed(1)}초`);
    console.log(`⏰ 예상 잔여: ${eta.toFixed(1)}초`);
    console.log(`✅ 성공: ${batchState.success}개`);
    console.log(`💾 캐시: ${batchState.cached}개`);
    console.log(`❌ 실패: ${batchState.failed}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 메인 실행 함수
async function runBrowserBatch() {
    if (batchState.isRunning) {
        console.log('❌ 이미 실행 중입니다.');
        return;
    }
    
    console.log('\n🚀 브라우저 배치 생성 시작...');
    console.log('중단하려면 콘솔에서 stopBatch() 실행\n');
    
    batchState.isRunning = true;
    batchState.startTime = Date.now();
    
    for (let i = 0; i < attractions.length && batchState.isRunning; i++) {
        const attraction = attractions[i];
        console.log(`\n📍 [${i + 1}/${attractions.length}] ${attraction}`);
        
        for (let j = 0; j < languages.length && batchState.isRunning; j++) {
            const language = languages[j];
            
            await searchAndGenerate(attraction, language);
            batchState.current++;
            
            // 10개마다 진행 상황 출력
            if (batchState.current % 10 === 0) {
                printProgress();
            }
            
            // 다음 검색 전 대기 (페이지 안정화)
            if (batchState.current < batchState.total) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    batchState.isRunning = false;
    
    // 최종 결과
    console.log('\n🎉 브라우저 배치 생성 완료!');
    printProgress();
    
    const successRate = ((batchState.success + batchState.cached) / batchState.current * 100).toFixed(1);
    console.log(`\n📈 최종 성공률: ${successRate}%`);
    
    if (batchState.failed > 0) {
        console.log('\n❌ 실패한 가이드 목록:');
        batchState.errors.forEach(err => {
            console.log(`   ${err.attraction} (${err.language}): ${err.error}`);
        });
    }
    
    // 결과를 로컬 스토리지에 저장
    const results = {
        timestamp: new Date().toISOString(),
        summary: {
            total: batchState.total,
            completed: batchState.current,
            success: batchState.success,
            cached: batchState.cached,
            failed: batchState.failed,
            successRate: successRate + '%'
        },
        errors: batchState.errors,
        duration: ((Date.now() - batchState.startTime) / 1000).toFixed(1) + '초'
    };
    
    localStorage.setItem('naviguide-batch-results', JSON.stringify(results));
    console.log('\n💾 결과가 로컬 스토리지에 저장되었습니다.');
    console.log('확인: localStorage.getItem("naviguide-batch-results")');
}

// 중단 함수
function stopBatch() {
    batchState.isRunning = false;
    console.log('⏹️ 배치 생성이 중단됩니다...');
}

// 상태 확인 함수
function checkStatus() {
    printProgress();
}

// 전역 함수로 등록
window.runBrowserBatch = runBrowserBatch;
window.stopBatch = stopBatch;
window.checkStatus = checkStatus;
window.batchState = batchState;

console.log('\n🎮 사용 가능한 명령어:');
console.log('runBrowserBatch() - 배치 생성 시작');
console.log('stopBatch() - 배치 생성 중단');
console.log('checkStatus() - 현재 상태 확인');

console.log('\n⚡ 지금 시작하려면: runBrowserBatch()');
(function() {
    // 웹 콘솔에서 바로 실행 가능한 배치 생성 스크립트
    console.log('🎯 NaviDocent 배치 가이드 생성기 로드됨');

    const attractions = ['경복궁', '남산타워', '명동', '해운대해수욕장', '감천문화마을', '자갈치시장', '한라산', '성산일출봉', '중문관광단지', '불국사', '석굴암', '첨성대', 'Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Colosseum', 'Leaning Tower of Pisa', 'Vatican', 'Sagrada Familia', 'Alhambra', 'Park Güell', 'Big Ben', 'Tower Bridge', 'Buckingham Palace', 'Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral', 'Mount Fuji', 'Kiyomizu-dera', 'Senso-ji', 'Great Wall', 'Forbidden City', 'Tiananmen Square', 'Taj Mahal', 'Red Fort', 'Ganges River', 'Wat Arun', 'Grand Palace', 'Wat Pho', 'Marina Bay Sands', 'Gardens by the Bay', 'Merlion', 'Statue of Liberty', 'Grand Canyon', 'Times Square', 'Niagara Falls', 'CN Tower', 'Banff National Park', 'Christ the Redeemer', 'Iguazu Falls', 'Maracanã Stadium', 'Machu Picchu', 'Cusco', 'Nazca Lines', 'Chichen Itza', 'Teotihuacan', 'Cancun'];

    const languages = ['ko', 'en', 'ja', 'zh', 'es'];

    console.log(`📊 총 ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 가이드 생성 예정`);

    window.bulkGeneration = { isRunning: false, currentIndex: 0, results: { total: 0, success: 0, cached: 0, failed: 0, details: [] }, startTime: null };

    async function generateSingleGuide(attractionName, language) {
        try {
            console.log(`🔄 생성 중: ${attractionName} (${language})`);
            
            const response = await fetch('/api/node/ai/generate-guide/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationName: attractionName,
                    language: language,
                    forceRegenerate: false,
                    generationMode: 'autonomous',
                    userProfile: {
                        demographics: { age: 35, country: language === 'ko' ? 'south_korea' : language === 'ja' ? 'japan' : language === 'zh' ? 'china' : language === 'es' ? 'spain' : 'usa', language: language, travelStyle: 'cultural', techSavviness: 3 },
                        usage: { sessionsPerMonth: 2, avgSessionDuration: 15, preferredContentLength: 'medium', deviceType: 'mobile' }
                    }
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const result = await response.json();
            
            if (result.success) {
                const status = result.cached === 'hit' || result.cached === 'mega_hit' ? 'cached' : 'new';
                console.log(`✅ 성공: ${attractionName} (${language}) - ${status}`);
                return { success: true, attraction: attractionName, language: language, status: status, cached: result.cached };
            } else {
                console.error(`❌ 실패: ${attractionName} (${language}) - ${result.error}`);
                return { success: false, attraction: attractionName, language: language, error: result.error };
            }
        } catch (error) {
            console.error(`❌ 오류: ${attractionName} (${language}) - ${error.message}`);
            return { success: false, attraction: attractionName, language: language, error: error.message };
        }
    }

    function printProgress() {
        const { results, currentIndex } = window.bulkGeneration;
        const totalTasks = attractions.length * languages.length;
        const completionRate = (currentIndex / totalTasks * 100).toFixed(1);
        const elapsedTime = window.bulkGeneration.startTime ? ((Date.now() - window.bulkGeneration.startTime) / 1000).toFixed(1) : 0;
        
        console.log(`\n📊 진행 상황: ${currentIndex}/${totalTasks} (${completionRate}%)`);
        console.log(`⏱️  소요 시간: ${elapsedTime}초`);
        console.log(`✅ 성공: ${results.success}개`);
        console.log(`💾 캐시됨: ${results.cached}개`);
        console.log(`❌ 실패: ${results.failed}개`);
        
        if (results.failed > 0) {
            const failedItems = results.details.filter(d => !d.success);
            console.log(`❌ 실패 목록:`, failedItems.map(f => `${f.attraction}(${f.language})`));
        }
    }

    async function runBulkGeneration(options = {}) {
        const { delayBetweenRequests = 2000, startFromIndex = 0, batchSize = 10, targetLanguages = languages } = options;

        if (window.bulkGeneration.isRunning) {
            console.log('❌ 이미 배치 생성이 실행 중입니다.');
            return;
        }

        console.log('🚀 배치 가이드 생성 시작');
        console.log(`📊 설정: 지연=${delayBetweenRequests}ms, 시작=${startFromIndex}`);
        
        window.bulkGeneration.isRunning = true;
        window.bulkGeneration.startTime = Date.now();
        window.bulkGeneration.currentIndex = startFromIndex;
        
        const { results } = window.bulkGeneration;
        
        for (let i = 0; i < attractions.length; i++) {
            if (!window.bulkGeneration.isRunning) {
                console.log('⏹️ 사용자에 의해 중단됨');
                break;
            }
            
            const attraction = attractions[i];
            console.log(`\n📍 ${i + 1}/${attractions.length}: ${attraction}`);
            
            for (let j = 0; j < targetLanguages.length; j++) {
                if (!window.bulkGeneration.isRunning) break;
                
                const globalIndex = i * targetLanguages.length + j;
                if (globalIndex < startFromIndex) {
                    window.bulkGeneration.currentIndex++;
                    continue;
                }
                
                const language = targetLanguages[j];
                results.total++;
                window.bulkGeneration.currentIndex++;
                
                const result = await generateSingleGuide(attraction, language);
                results.details.push(result);
                
                if (result.success) {
                    if (result.status === 'cached') {
                        results.cached++;
                    } else {
                        results.success++;
                    }
                } else {
                    results.failed++;
                }
                
                if (results.total % batchSize === 0) {
                    printProgress();
                }
                
                if (i < attractions.length - 1 || j < targetLanguages.length - 1) {
                    console.log(`⏳ ${delayBetweenRequests}ms 대기...`);
                    await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
                }
            }
        }
        
        window.bulkGeneration.isRunning = false;
        
        console.log('\n🎉 배치 생성 완료!');
        printProgress();
        
        const totalTime = (Date.now() - window.bulkGeneration.startTime) / 1000;
        console.log(`⏱️  총 소요 시간: ${totalTime.toFixed(1)}초`);
        console.log(`📈 완료율: ${((results.success + results.cached) / results.total * 100).toFixed(1)}%`);
        
        return results;
    }

    function stopBulkGeneration() {
        window.bulkGeneration.isRunning = false;
        console.log('⏹️ 배치 생성 중단 요청됨');
    }

    async function retryFailedGuides() {
        const failedGuides = window.bulkGeneration.results.details.filter(d => !d.success);
        
        if (failedGuides.length === 0) {
            console.log('✅ 실패한 가이드가 없습니다!');
            return;
        }
        
        console.log(`🔄 ${failedGuides.length}개의 실패한 가이드 재시도 중...`);
        
        for (const failed of failedGuides) {
            if (!window.bulkGeneration.isRunning) break;
            
            const result = await generateSingleGuide(failed.attraction, failed.language);
            
            const index = window.bulkGeneration.results.details.findIndex(d => d.attraction === failed.attraction && d.language === failed.language);
            
            if (index !== -1) {
                window.bulkGeneration.results.details[index] = result;
                
                if (result.success) {
                    window.bulkGeneration.results.failed--;
                    if (result.status === 'cached') {
                        window.bulkGeneration.results.cached++;
                    } else {
                        window.bulkGeneration.results.success++;
                    }
                    console.log(`✅ 재시도 성공: ${failed.attraction} (${failed.language})`);
                } else {
                    console.log(`❌ 재시도 실패: ${failed.attraction} (${failed.language})`);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log('🔄 재시도 완료');
        printProgress();
    }

    function checkStatus() {
        printProgress();
        console.log(`🏃 실행 중: ${window.bulkGeneration.isRunning ? '예' : '아니오'}`);
    }

    window.runBulkGeneration = runBulkGeneration;
    window.stopBulkGeneration = stopBulkGeneration;
    window.retryFailedGuides = retryFailedGuides;
    window.checkStatus = checkStatus;

    console.log(`
🎯 사용법:
runBulkGeneration() - 전체 285개 가이드 생성 시작
checkStatus() - 진행 상황 확인
stopBulkGeneration() - 중단
retryFailedGuides() - 실패한 가이드 재시도

이제 runBulkGeneration() 을 입력하세요!
    `);
})();
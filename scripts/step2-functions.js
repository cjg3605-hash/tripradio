// 2단계: 함수 정의 (1단계 후 실행)
console.log('🎯 2단계: 함수 정의 중...');

window.generateGuide = async function(attraction, language) {
    try {
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
                        country: language === 'ko' ? 'south_korea' : language === 'en' ? 'usa' : language === 'ja' ? 'japan' : language === 'zh' ? 'china' : language === 'es' ? 'spain' : 'usa',
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
            throw new Error('HTTP ' + response.status);
        }

        const result = await response.json();
        
        if (result.success) {
            const isCached = result.cached === 'hit' || result.cached === 'mega_hit';
            if (isCached) {
                window.batchState.cached++;
                console.log('💾 ' + attraction + ' (' + language + ') - 캐시');
            } else {
                window.batchState.success++;
                console.log('✅ ' + attraction + ' (' + language + ') - 생성');
            }
            return true;
        } else {
            window.batchState.failed++;
            window.batchState.errors.push({attraction: attraction, language: language, error: result.error});
            console.log('❌ ' + attraction + ' (' + language + ') - ' + result.error);
            return false;
        }
    } catch (error) {
        window.batchState.failed++;
        window.batchState.errors.push({attraction: attraction, language: language, error: error.message});
        console.log('❌ ' + attraction + ' (' + language + ') - ' + error.message);
        return false;
    }
};

window.printProgress = function() {
    const elapsed = window.batchState.startTime ? (Date.now() - window.batchState.startTime) / 1000 : 0;
    const progress = (window.batchState.current / window.batchState.total * 100).toFixed(1);
    
    console.log('\n📈 진행: ' + window.batchState.current + '/' + window.batchState.total + ' (' + progress + '%)');
    console.log('⏱️ 소요: ' + elapsed.toFixed(1) + '초');
    console.log('✅ 성공: ' + window.batchState.success + ' | 💾 캐시: ' + window.batchState.cached + ' | ❌ 실패: ' + window.batchState.failed);
};

console.log('✅ 2단계 완료!');
console.log('다음: step3-run.js 실행');
// 3단계: 실행 (1,2단계 후 실행)
console.log('🎯 3단계: 배치 생성 시작!');

window.runBatch = async function() {
    if (window.batchState.isRunning) {
        console.log('❌ 이미 실행 중입니다.');
        return;
    }

    console.log('🚀 285개 가이드 생성 시작...');
    window.batchState.isRunning = true;
    window.batchState.startTime = Date.now();
    
    for (let i = 0; i < window.attractions.length && window.batchState.isRunning; i++) {
        const attraction = window.attractions[i];
        console.log('\n📍 [' + (i + 1) + '/' + window.attractions.length + '] ' + attraction);
        
        for (let j = 0; j < window.languages.length && window.batchState.isRunning; j++) {
            const language = window.languages[j];
            
            await window.generateGuide(attraction, language);
            window.batchState.current++;
            
            if (window.batchState.current % 10 === 0) {
                window.printProgress();
            }
            
            if (window.batchState.current < window.batchState.total) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
    }
    
    window.batchState.isRunning = false;
    
    console.log('\n🎉 배치 생성 완료!');
    window.printProgress();
    
    const successRate = ((window.batchState.success + window.batchState.cached) / window.batchState.total * 100).toFixed(1);
    console.log('📈 성공률: ' + successRate + '%');
    
    if (window.batchState.failed > 0) {
        console.log('\n❌ 실패 목록:');
        window.batchState.errors.forEach(function(err) {
            console.log('   ' + err.attraction + ' (' + err.language + '): ' + err.error);
        });
    }
};

window.stopBatch = function() {
    window.batchState.isRunning = false;
    console.log('⏹️ 중단됩니다...');
};

console.log('✅ 3단계 완료!');
console.log('\n🎮 명령어:');
console.log('runBatch() - 시작');
console.log('stopBatch() - 중단');
console.log('printProgress() - 상태 확인');

console.log('\n⚡ 지금 시작: runBatch()');

// 자동 시작
setTimeout(function() {
    console.log('🚀 2초 후 자동 시작...');
    setTimeout(window.runBatch, 2000);
}, 1000);
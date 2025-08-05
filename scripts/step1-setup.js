// 1단계: 기본 설정 (먼저 실행)
console.clear();
console.log('🎯 1단계: 배치 생성기 설정 중...');

window.attractions = ['경복궁', '남산타워', '명동', '해운대해수욕장', '감천문화마을', '자갈치시장', '한라산', '성산일출봉', '중문관광단지', '불국사', '석굴암', '첨성대', 'Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Colosseum', 'Leaning Tower of Pisa', 'Vatican', 'Sagrada Familia', 'Alhambra', 'Park Güell', 'Big Ben', 'Tower Bridge', 'Buckingham Palace', 'Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral', 'Mount Fuji', 'Kiyomizu-dera', 'Senso-ji', 'Great Wall', 'Forbidden City', 'Tiananmen Square', 'Taj Mahal', 'Red Fort', 'Ganges River', 'Wat Arun', 'Grand Palace', 'Wat Pho', 'Marina Bay Sands', 'Gardens by the Bay', 'Merlion', 'Statue of Liberty', 'Grand Canyon', 'Times Square', 'Niagara Falls', 'CN Tower', 'Banff National Park', 'Christ the Redeemer', 'Iguazu Falls', 'Maracanã Stadium', 'Machu Picchu', 'Cusco', 'Nazca Lines', 'Chichen Itza', 'Teotihuacan', 'Cancun'];

window.languages = ['ko', 'en', 'ja', 'zh', 'es'];

window.batchState = {
    isRunning: false,
    current: 0,
    total: window.attractions.length * window.languages.length,
    success: 0,
    cached: 0,
    failed: 0,
    startTime: null,
    errors: []
};

console.log('✅ 1단계 완료!');
console.log('📊 총 ' + window.batchState.total + '개 가이드 생성 예정');
console.log('\n다음: step2-functions.js 실행');
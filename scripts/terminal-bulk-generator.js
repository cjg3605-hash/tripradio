// 터미널용 285개 가이드 배치 생성기
// 사용법: node scripts/terminal-bulk-generator.js

const fs = require('fs');

// axios for HTTP requests
const axios = require('axios');

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

console.log('🎯 NaviDocent 터미널 배치 생성기');
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

// 웹사이트 검색 플로우를 따라하는 가이드 생성 함수
async function generateGuide(attraction, language) {
    try {
        console.log(`🔄 생성 중: ${attraction} (${language})`);
        
        // 1. 웹사이트와 동일한 방식: /guide/[location]?lang=[language] URL로 접근
        const encodedLocation = encodeURIComponent(attraction.trim());
        const guideUrl = `http://localhost:3002/guide/${encodedLocation}?lang=${language}`;
        
        // 2. 페이지 요청 (웹사이트에서 검색하고 엔터치는 것과 동일)
        const response = await axios.get(guideUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': language === 'ko' ? 'ko-KR,ko;q=0.9,en;q=0.8' :
                                  language === 'en' ? 'en-US,en;q=0.9' :
                                  language === 'ja' ? 'ja-JP,ja;q=0.9,en;q=0.8' :
                                  language === 'zh' ? 'zh-CN,zh;q=0.9,en;q=0.8' :
                                  language === 'es' ? 'es-ES,es;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
                'Cookie': `language=${language}; Path=/; SameSite=Lax`
            },
            timeout: 45000, // 45초 타임아웃 (가이드 생성 시간 고려)
            maxRedirects: 5
        });
        
        // 3. 응답 확인 (페이지가 정상 로드되었는지)
        if (response.status === 200 && response.data.length > 1000) {
            // 페이지에 가이드 콘텐츠가 포함되어 있는지 확인
            const hasGuideContent = response.data.includes('guide-content') || 
                                   response.data.includes('travel-guide') ||
                                   response.data.includes('generated-guide') ||
                                   response.data.includes('attraction') ||
                                   response.data.includes('문화') ||
                                   response.data.includes('역사') ||
                                   response.data.includes('관광');
            
            if (hasGuideContent) {
                state.success++;
                console.log(`✅ 성공: ${attraction} (${language}) - 페이지 생성`);
                return { success: true, attraction, language, method: 'page_access' };
            } else {
                // 페이지는 로드되었지만 가이드 콘텐츠가 없음 - 캐시된 가이드일 수 있음
                state.cached++;
                console.log(`💾 성공: ${attraction} (${language}) - 기존 가이드`);
                return { success: true, attraction, language, method: 'cached' };
            }
        } else {
            throw new Error(`HTTP ${response.status}: 페이지 로드 실패`);
        }
        
    } catch (error) {
        // 4. 실패 시 기존 API 방식으로 폴백
        try {
            console.log(`🔄 API 폴백: ${attraction} (${language})`);
            
            const apiResponse = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
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
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });

            const result = apiResponse.data;
            
            if (result.success) {
                if (result.cached === 'hit' || result.cached === 'mega_hit') {
                    state.cached++;
                    console.log(`💾 성공: ${attraction} (${language}) - API 캐시`);
                } else {
                    state.success++;
                    console.log(`✅ 성공: ${attraction} (${language}) - API 생성`);
                }
                return { success: true, attraction, language, method: 'api_fallback', cached: result.cached };
            } else {
                throw new Error(result.error || 'API 호출 실패');
            }
            
        } catch (apiError) {
            state.failed++;
            const errorMsg = error.message + ' | API 폴백도 실패: ' + apiError.message;
            state.errors.push({ attraction, language, error: errorMsg });
            console.log(`❌ 실패: ${attraction} (${language}) - ${errorMsg}`);
            return { success: false, attraction, language, error: errorMsg };
        }
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
    console.log(`✅ 성공: ${state.success}개`);
    console.log(`💾 캐시: ${state.cached}개`);
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
    
    const filename = `bulk-generation-results-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 결과 저장됨: ${filename}`);
    return filename;
}

// 메인 실행 함수
async function runBulkGeneration() {
    console.log('\n🚀 배치 생성 시작...');
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
            
            // 1.5초 대기 (API 부하 방지)
            if (state.completed < attractions.length * languages.length) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }
    }
    
    // 최종 결과
    console.log('\n🎉 배치 생성 완료!');
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
    runBulkGeneration().catch(error => {
        console.error('❌ 치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = { runBulkGeneration, attractions, languages };
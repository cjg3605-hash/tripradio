// 🎯 실제 가이드 생성 및 DB 저장 검증하는 스크립트
// 웹사이트 실제 로직과 동일: /api/ai/generate-multilang-guide API 직접 호출

const axios = require('axios');
const fs = require('fs');

// 57개 명소 (실제 웹사이트 인기명소)
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

console.log('🎯 실제 가이드 생성 및 DB 저장 검증 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 총 ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 가이드 생성`);

// 상태 관리
const state = {
    isRunning: false,
    startTime: null,
    completed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    results: []
};

// Microsoft Translator API 호출
async function translateLocationName(locationName, targetLanguage) {
    if (targetLanguage === 'ko') return locationName;
    
    try {
        const response = await axios.post('http://localhost:3002/api/translate-local', {
            text: locationName,
            sourceLanguage: 'ko',
            targetLanguage: targetLanguage
        }, {
            timeout: 10000
        });
        
        if (response.data.fallback) {
            console.log(`⚠️ 번역 폴백: ${locationName} → ${targetLanguage}`);
            return locationName;
        }
        
        return response.data.translatedText;
    } catch (error) {
        console.log(`❌ 번역 실패: ${locationName} → ${targetLanguage}, 원본 사용`);
        return locationName;
    }
}

// DB에서 기존 가이드 확인
async function checkExistingGuide(locationName, language) {
    try {
        const normalizedLocation = locationName.toLowerCase().trim();
        
        const response = await axios.get('https://fajiwgztfwoiisgnnams.supabase.co/rest/v1/guides', {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y',
                'Content-Type': 'application/json'
            },
            params: {
                select: 'id,locationname,language,created_at',
                locationname: `eq.${normalizedLocation}`,
                language: `eq.${language}`
            },
            timeout: 10000
        });
        
        return response.data && response.data.length > 0;
    } catch (error) {
        console.log(`⚠️ DB 확인 실패: ${locationName} (${language})`);
        return false;
    }
}

// 실제 가이드 생성 API 호출
async function generateGuide(originalAttraction, language, retryCount = 0) {
    const maxRetries = 2;
    
    try {
        // 1. 장소명 번역 (한국어가 아닌 경우)
        let translatedName = originalAttraction;
        if (language !== 'ko') {
            translatedName = await translateLocationName(originalAttraction, language);
        }
        
        console.log(`🔄 가이드 생성 중: ${originalAttraction} → "${translatedName}" (${language})`);
        
        // 2. 기존 가이드 확인
        const exists = await checkExistingGuide(translatedName, language);
        if (exists) {
            state.skipped++;
            console.log(`⏭️ 이미 존재: "${translatedName}" (${language})`);
            return { 
                success: true, 
                skipped: true, 
                attraction: originalAttraction, 
                translatedName,
                language 
            };
        }
        
        // 3. 실제 가이드 생성 API 호출 (/api/ai/generate-multilang-guide)
        const response = await axios.post('http://localhost:3002/api/ai/generate-multilang-guide', {
            locationName: translatedName,
            language: language,
            userProfile: {
                preferredLanguage: language,
                interests: ['여행', '문화'],
                travelStyle: 'cultural'
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 180000, // 3분 타임아웃 (AI 생성 시간 고려)
            maxRedirects: 5
        });
        
        if (response.status === 200 && response.data.success) {
            // 4. 생성 후 DB 저장 확인
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
            
            const saved = await checkExistingGuide(translatedName, language);
            if (saved) {
                state.success++;
                console.log(`✅ 생성 완료: "${translatedName}" (${language}) - DB 저장 확인됨`);
                return { 
                    success: true, 
                    attraction: originalAttraction, 
                    translatedName,
                    language,
                    dataSize: JSON.stringify(response.data.data).length
                };
            } else {
                throw new Error('API 성공했지만 DB 저장 실패');
            }
        } else {
            throw new Error(`API 응답 오류: ${response.data.error || 'Unknown error'}`);
        }
        
    } catch (error) {
        // 재시도 로직
        if (retryCount < maxRetries && (
            error.code === 'ECONNRESET' || 
            error.code === 'ETIMEDOUT' ||
            error.message.includes('timeout') ||
            error.response?.status >= 500
        )) {
            console.log(`🔄 재시도 ${retryCount + 1}/${maxRetries}: ${originalAttraction} (${language})`);
            console.log(`   오류: ${error.message}`);
            
            // 재시도 전 대기 (지수 백오프)
            const waitTime = Math.pow(2, retryCount) * 10000; // 10초, 20초, 40초
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            return generateGuide(originalAttraction, language, retryCount + 1);
        } else {
            state.failed++;
            const errorMsg = error.response?.data?.error || error.message || '알 수 없는 오류';
            state.errors.push({ 
                attraction: originalAttraction, 
                language, 
                error: errorMsg,
                translatedName: error.translatedName || 'N/A'
            });
            console.log(`❌ 실패: ${originalAttraction} (${language}) - ${errorMsg}`);
            return { 
                success: false, 
                attraction: originalAttraction, 
                language, 
                error: errorMsg 
            };
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
    console.log(`⏱️  소요 시간: ${(elapsed/60).toFixed(1)}분`);
    console.log(`⏰ 예상 잔여: ${(eta/60).toFixed(1)}분`);
    console.log(`✅ 새로 생성: ${state.success}개`);
    console.log(`⏭️ 기존 존재: ${state.skipped}개`);
    console.log(`❌ 실패: ${state.failed}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 결과 저장
function saveResults() {
    const results = {
        timestamp: new Date().toISOString(),
        method: '실제 가이드 생성 API 호출 및 DB 저장 검증',
        summary: {
            total: attractions.length * languages.length,
            completed: state.completed,
            success: state.success,
            skipped: state.skipped,
            failed: state.failed,
            successRate: state.completed > 0 ? (state.success / state.completed * 100).toFixed(1) + '%' : '0%'
        },
        errors: state.errors,
        results: state.results,
        duration: state.startTime ? ((Date.now() - state.startTime) / 60000).toFixed(1) + '분' : '0분'
    };
    
    const filename = `verified-guide-results-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 결과 저장됨: ${filename}`);
    return filename;
}

// 메인 실행 함수
async function generateAndVerifyGuides() {
    console.log('\n🚀 실제 가이드 생성 및 DB 저장 검증 시작...');
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
    
    // 메인 루프: 각 명소별로 모든 언어 처리
    for (let i = 0; i < attractions.length && state.isRunning; i++) {
        const attraction = attractions[i];
        console.log(`\n📍 [${i + 1}/${attractions.length}] ${attraction}`);
        
        for (let j = 0; j < languages.length && state.isRunning; j++) {
            const language = languages[j];
            
            const result = await generateGuide(attraction, language);
            state.results.push(result);
            state.completed++;
            
            // 10개마다 진행 상황 출력
            if (state.completed % 10 === 0) {
                printProgress();
            }
            
            // 각 호출 간 5초 대기 (서버 부하 방지 및 안정성 확보)
            if (state.completed < attractions.length * languages.length && state.isRunning) {
                console.log('⏳ 5초 대기 중...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    
    // 최종 결과
    console.log('\n🎉 모든 가이드 생성 완료!');
    printProgress();
    
    const successRate = state.completed > 0 ? (state.success / state.completed * 100).toFixed(1) : '0';
    console.log(`\n📈 최종 성공률: ${successRate}%`);
    console.log(`⏱️ 총 소요 시간: ${((Date.now() - state.startTime) / 60000).toFixed(1)}분`);
    console.log(`📊 결과: 새로 생성 ${state.success}개, 기존 존재 ${state.skipped}개, 실패 ${state.failed}개`);
    
    if (state.failed > 0) {
        console.log('\n❌ 실패한 가이드 목록:');
        state.errors.forEach(err => {
            console.log(`   ${err.attraction} (${err.language}): ${err.error}`);
            console.log(`   번역명: ${err.translatedName}`);
        });
    }
    
    const filename = saveResults();
    console.log(`\n📁 상세 결과는 ${filename} 파일을 확인하세요.`);
    
    console.log('\n💡 모든 가이드 생성이 완료되었습니다!');
    console.log('실제 AI 가이드 생성 API를 호출하고 DB 저장까지 검증했습니다.');
    console.log('이제 데이터베이스에 새로운 가이드들이 실제로 저장되어 있을 것입니다.');
}

// 실행 시작
if (require.main === module) {
    generateAndVerifyGuides().catch(error => {
        console.error('❌ 치명적 오류:', error);
        process.exit(1);
    });
}

module.exports = { generateAndVerifyGuides, attractions, languages };
// 성공했던 패턴으로 복원한 가이드 생성 스크립트
// 57개 명소 × 5개 언어 = 285개 가이드 배치 생성

const axios = require('axios');

// 57개 명소 데이터 (한국어 기준)
const attractions = [
    // 한국 명소 (12개)
    { name: '경복궁', location: 'Seoul, Korea' },
    { name: '남산타워', location: 'Seoul, Korea' },
    { name: '명동', location: 'Seoul, Korea' },
    { name: '해운대해수욕장', location: 'Busan, Korea' },
    { name: '감천문화마을', location: 'Busan, Korea' },
    { name: '자갈치시장', location: 'Busan, Korea' },
    { name: '한라산', location: 'Jeju, Korea' },
    { name: '성산일출봉', location: 'Jeju, Korea' },
    { name: '중문관광단지', location: 'Jeju, Korea' },
    { name: '불국사', location: 'Gyeongju, Korea' },
    { name: '석굴암', location: 'Gyeongju, Korea' },
    { name: '첨성대', location: 'Gyeongju, Korea' },
    
    // 유럽 명소 (15개)
    { name: 'Eiffel Tower', location: 'Paris, France' },
    { name: 'Louvre Museum', location: 'Paris, France' },
    { name: 'Palace of Versailles', location: 'Versailles, France' },
    { name: 'Colosseum', location: 'Rome, Italy' },
    { name: 'Leaning Tower of Pisa', location: 'Pisa, Italy' },
    { name: 'Vatican', location: 'Vatican City' },
    { name: 'Sagrada Familia', location: 'Barcelona, Spain' },
    { name: 'Alhambra', location: 'Granada, Spain' },
    { name: 'Park Güell', location: 'Barcelona, Spain' },
    { name: 'Big Ben', location: 'London, UK' },
    { name: 'Tower Bridge', location: 'London, UK' },
    { name: 'Buckingham Palace', location: 'London, UK' },
    { name: 'Brandenburg Gate', location: 'Berlin, Germany' },
    { name: 'Neuschwanstein Castle', location: 'Bavaria, Germany' },
    { name: 'Cologne Cathedral', location: 'Cologne, Germany' },
    
    // 아시아 명소 (15개)
    { name: 'Mount Fuji', location: 'Japan' },
    { name: 'Kiyomizu-dera', location: 'Kyoto, Japan' },
    { name: 'Senso-ji', location: 'Tokyo, Japan' },
    { name: 'Great Wall', location: 'Beijing, China' },
    { name: 'Forbidden City', location: 'Beijing, China' },
    { name: 'Tiananmen Square', location: 'Beijing, China' },
    { name: 'Taj Mahal', location: 'Agra, India' },
    { name: 'Red Fort', location: 'Delhi, India' },
    { name: 'Ganges River', location: 'Varanasi, India' },
    { name: 'Wat Arun', location: 'Bangkok, Thailand' },
    { name: 'Grand Palace', location: 'Bangkok, Thailand' },
    { name: 'Wat Pho', location: 'Bangkok, Thailand' },
    { name: 'Marina Bay Sands', location: 'Singapore' },
    { name: 'Gardens by the Bay', location: 'Singapore' },
    { name: 'Merlion', location: 'Singapore' },
    
    // 아메리카 명소 (15개)
    { name: 'Statue of Liberty', location: 'New York, USA' },
    { name: 'Grand Canyon', location: 'Arizona, USA' },
    { name: 'Times Square', location: 'New York, USA' },
    { name: 'Niagara Falls', location: 'Canada' },
    { name: 'CN Tower', location: 'Toronto, Canada' },
    { name: 'Banff National Park', location: 'Alberta, Canada' },
    { name: 'Christ the Redeemer', location: 'Rio de Janeiro, Brazil' },
    { name: 'Iguazu Falls', location: 'Brazil/Argentina' },
    { name: 'Maracanã Stadium', location: 'Rio de Janeiro, Brazil' },
    { name: 'Machu Picchu', location: 'Cusco, Peru' },
    { name: 'Cusco', location: 'Peru' },
    { name: 'Nazca Lines', location: 'Peru' },
    { name: 'Chichen Itza', location: 'Yucatan, Mexico' },
    { name: 'Teotihuacan', location: 'Mexico City, Mexico' },
    { name: 'Cancun', location: 'Quintana Roo, Mexico' }
];

// 5개 언어 설정
const languages = ['ko', 'en', 'ja', 'zh', 'es'];

console.log(`🎯 총 ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 가이드 생성 예정`);

// Microsoft Translator로 장소명 번역
async function translateLocationName(locationName, targetLanguage) {
    if (targetLanguage === 'ko') return locationName;
    
    try {
        console.log(`🌐 번역 요청: "${locationName}" (ko → ${targetLanguage})`);
        
        const response = await axios.post('http://localhost:3002/api/translate-local', {
            text: locationName,
            sourceLanguage: isKoreanLocation(locationName) ? 'ko' : 'en',
            targetLanguage: targetLanguage
        }, { timeout: 10000 });
        
        if (response.data.fallback) {
            console.log(`⚠️ 번역 폴백: ${locationName}`);
            return locationName;
        }
        
        console.log(`✅ 번역 성공: "${locationName}" → "${response.data.translatedText}"`);
        return response.data.translatedText;
    } catch (error) {
        console.log(`❌ 번역 실패: ${locationName}, 원본 사용`);
        return locationName;
    }
}

// 한국 명소 판별
function isKoreanLocation(locationName) {
    const koreanAttractions = [
        '경복궁', '남산타워', '명동', '해운대해수욕장', '감천문화마을', '자갈치시장',
        '한라산', '성산일출봉', '중문관광단지', '불국사', '석굴암', '첨성대'
    ];
    return koreanAttractions.includes(locationName);
}

// 성공했던 API로 가이드 생성
async function generateGuide(attractionName, language) {
    try {
        // 1. 장소명 번역
        const translatedName = await translateLocationName(attractionName, language);
        
        console.log(`🔄 생성 중: ${translatedName} (${language})`);
        
        // 2. 성공했던 API 호출
        const response = await axios.post('http://localhost:3002/api/node/ai/generate-guide/', {
            locationName: translatedName,
            language: language,
            forceRegenerate: false, // 기존 가이드가 있으면 재사용
            generationMode: 'autonomous', // 전체 가이드 생성
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
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 180000 // 3분
        });

        if (response.status === 200 && response.data.success) {
            console.log(`✅ 성공: ${translatedName} (${language}) - ${response.data.cached ? 'cached' : 'new'}`);
            return { 
                success: true, 
                attraction: attractionName, 
                language: language,
                cached: response.data.cached,
                data: response.data
            };
        } else {
            console.error(`❌ 실패: ${translatedName} (${language}) - ${response.data.error}`);
            return { 
                success: false, 
                attraction: attractionName, 
                language: language, 
                error: response.data.error || 'Unknown error'
            };
        }
    } catch (error) {
        console.error(`❌ 실패: ${attractionName} (${language}) - ${error.message}`);
        return { 
            success: false, 
            attraction: attractionName, 
            language: language, 
            error: error.message 
        };
    }
}

// 5개씩 병렬 처리로 배치 생성
async function processBatch(tasks, batchSize = 5) {
    console.log(`\n🚀 배치 처리 시작: ${tasks.length}개 태스크, ${batchSize}개씩 병렬 처리\n`);
    
    const results = [];
    let completed = 0;
    let success = 0;
    let cached = 0;
    let failed = 0;
    
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(tasks.length / batchSize);
        
        console.log(`📦 배치 ${batchNum}/${totalBatches}: ${batch.length}개 태스크 병렬 실행`);
        
        const batchPromises = batch.map(task => 
            generateGuide(task.attraction, task.language)
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // 통계 업데이트
        completed += batch.length;
        batchResults.forEach(result => {
            if (result.success) {
                if (result.cached) {
                    cached++;
                } else {
                    success++;
                }
            } else {
                failed++;
            }
        });
        
        // 진행 상황 표시
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📈 진행률: ${(completed / tasks.length * 100).toFixed(1)}% (${completed}/${tasks.length})`);
        console.log(`⏱️  소요 시간: ${((Date.now() - startTime) / 60000).toFixed(1)}분`);
        console.log(`⏰ 예상 잔여: ${((Date.now() - startTime) / completed * (tasks.length - completed) / 60000).toFixed(1)}분`);
        console.log(`✅ 새로 생성: ${success}개`);
        console.log(`⏭️ 기존 존재: ${cached}개`);
        console.log(`❌ 실패: ${failed}개`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        // 마지막 배치가 아니면 3초 대기
        if (i + batchSize < tasks.length) {
            console.log(`⏳ 다음 배치까지 3초 대기...\n`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    return {
        results,
        summary: {
            total: tasks.length,
            completed,
            success,
            cached,
            failed,
            successRate: `${((success + cached) / tasks.length * 100).toFixed(1)}%`
        }
    };
}

// 메인 실행 함수
async function main() {
    console.log('🚀 병렬 가이드 생성 시작');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 총 ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 태스크`);
    console.log('💡 Microsoft Translator로 장소명 번역 후 고품질 가이드 생성');
    console.log('');
    
    // 모든 태스크 생성
    const tasks = [];
    attractions.forEach(attraction => {
        languages.forEach(language => {
            tasks.push({
                attraction: attraction.name,
                language: language
            });
        });
    });
    
    console.log(`📋 총 ${tasks.length}개 태스크 준비 완료\n`);
    
    // 배치 처리 시작
    global.startTime = Date.now();
    const result = await processBatch(tasks, 5);
    
    // 최종 결과
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n🎉 배치 생성 완료!`);
    console.log(`⏱️ 총 소요 시간: ${(duration / 60).toFixed(1)}분`);
    console.log(`📊 최종 결과:`);
    console.log(`   - 총 태스크: ${result.summary.total}개`);
    console.log(`   - 새로 생성: ${result.summary.success}개`);
    console.log(`   - 기존 존재: ${result.summary.cached}개`);
    console.log(`   - 실패: ${result.summary.failed}개`);
    console.log(`   - 성공률: ${result.summary.successRate}`);
    
    // 실패한 항목들 표시
    const failures = result.results.filter(r => !r.success);
    if (failures.length > 0) {
        console.log(`\n❌ 실패한 항목들 (${failures.length}개):`);
        failures.forEach(failure => {
            console.log(`   - ${failure.attraction} (${failure.language}): ${failure.error}`);
        });
    }
    
    // 결과를 파일로 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fs = require('fs');
    const resultFile = `working-guide-results-${timestamp}.json`;
    
    fs.writeFileSync(resultFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: result.summary,
        errors: failures.map(f => ({
            attraction: f.attraction,
            language: f.language,
            error: f.error
        })),
        duration: `${(duration / 60).toFixed(1)}분`
    }, null, 2));
    
    console.log(`💾 결과가 ${resultFile}에 저장되었습니다.`);
}

// 전역 변수
let startTime;

// 스크립트 실행
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 스크립트 실행 중 오류:', error);
        process.exit(1);
    });
}

module.exports = { generateGuide, translateLocationName };
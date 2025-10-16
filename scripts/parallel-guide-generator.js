// 🚀 병렬 가이드 생성 및 DB 저장 - 웹사이트 실제 로직 구현
// MultiLangGuideManager의 smartLanguageSwitch 로직을 직접 구현

const axios = require('axios');
const fs = require('fs');

// Supabase 설정
const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

// 57개 명소
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

console.log('🚀 병렬 가이드 생성 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 총 ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 태스크`);
console.log('💡 병렬 처리로 페이지를 나와도 서버에서 계속 처리됩니다.');

// 전역 상태
const globalState = {
    totalTasks: attractions.length * languages.length,
    completed: 0,
    success: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    results: [],
    startTime: Date.now()
};

// Microsoft Translator 호출 (소스 언어 자동 감지)
async function translateLocationName(locationName, targetLanguage) {
    if (targetLanguage === 'ko' && isKoreanLocation(locationName)) return locationName;
    
    try {
        // 명소 언어 자동 감지
        const sourceLanguage = isKoreanLocation(locationName) ? 'ko' : 'en';
        
        const response = await axios.post('http://localhost:3002/api/translate-local', {
            text: locationName,
            sourceLanguage: sourceLanguage, 
            targetLanguage: targetLanguage
        }, { timeout: 10000 });
        
        if (response.data.fallback) {
            return locationName;
        }
        
        return response.data.translatedText;
    } catch (error) {
        return locationName; // 번역 실패시 원본 사용
    }
}

// 한국 명소 판별 함수
function isKoreanLocation(locationName) {
    const koreanAttractions = [
        '경복궁', '남산타워', '명동', '해운대해수욕장', '감천문화마을', '자갈치시장', 
        '한라산', '성산일출봉', '중문관광단지', '불국사', '석굴암', '첨성대'
    ];
    return koreanAttractions.includes(locationName);
}

// DB에서 기존 가이드 확인 (MultiLangGuideManager.getGuideByLanguage 구현)
async function checkExistingGuide(locationName, language) {
    try {
        const normalizedLocation = locationName.toLowerCase().trim().replace(/\s+/g, ' ');
        
        const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            params: {
                select: 'id,content',
                locationname: `eq.${normalizedLocation}`,
                language: `eq.${language}`
            },
            timeout: 10000
        });
        
        return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
        return null;
    }
}

// DB에 가이드 저장 (MultiLangGuideManager.saveGuideByLanguage 구현)
async function saveGuideToDatabase(locationName, language, guideData) {
    try {
        const normalizedLocation = locationName.toLowerCase().trim().replace(/\s+/g, ' ');
        
        const response = await axios.post(`${SUPABASE_URL}/rest/v1/guides`, {
            locationname: normalizedLocation,
            language: language,
            content: guideData,
            updated_at: new Date().toISOString()
        }, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            timeout: 15000
        });
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error(`❌ DB 저장 실패: ${locationName} (${language})`, error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// AI 가이드 생성 (/api/ai/generate-multilang-guide 호출)
async function generateGuideFromAI(translatedLocationName, language) {
    try {
        const response = await axios.post('http://localhost:3002/api/ai/generate-multilang-guide', {
            locationName: translatedLocationName,
            language: language,
            userProfile: {
                preferredLanguage: language,
                interests: ['여행', '문화'],
                travelStyle: 'cultural'
            }
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 180000 // 3분
        });
        
        if (response.status === 200 && response.data.success) {
            return { success: true, data: response.data.data };
        } else {
            throw new Error(response.data.error || 'AI 생성 실패');
        }
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data?.error || error.message 
        };
    }
}

// 🎯 핵심: MultiLangGuideManager.smartLanguageSwitch 완전 구현
async function smartLanguageSwitch(originalAttraction, language) {
    try {
        // 1. 장소명 번역
        const translatedName = await translateLocationName(originalAttraction, language);
        
        // 2. 기존 가이드 확인
        const existingGuide = await checkExistingGuide(translatedName, language);
        if (existingGuide) {
            globalState.skipped++;
            console.log(`⏭️ 기존 가이드 발견: "${translatedName}" (${language})`);
            return {
                success: true,
                source: 'cache',
                attraction: originalAttraction,
                translatedName,
                language,
                skipped: true
            };
        }
        
        // 3. AI 가이드 생성
        console.log(`🎨 새로운 가이드 생성 중: "${translatedName}" (${language})`);
        const generateResult = await generateGuideFromAI(translatedName, language);
        
        if (!generateResult.success) {
            throw new Error(generateResult.error);
        }
        
        // 4. DB에 저장
        const saveResult = await saveGuideToDatabase(translatedName, language, generateResult.data);
        
        if (!saveResult.success) {
            throw new Error(`DB 저장 실패: ${saveResult.error}`);
        }
        
        globalState.success++;
        console.log(`✅ 생성 완료: "${translatedName}" (${language}) - ${JSON.stringify(generateResult.data).length}자`);
        
        return {
            success: true,
            source: 'generated',
            attraction: originalAttraction,
            translatedName,
            language,
            dataSize: JSON.stringify(generateResult.data).length
        };
        
    } catch (error) {
        globalState.failed++;
        globalState.errors.push({
            attraction: originalAttraction,
            language,
            error: error.message
        });
        
        console.log(`❌ 실패: ${originalAttraction} (${language}) - ${error.message}`);
        return {
            success: false,
            attraction: originalAttraction,
            language,
            error: error.message
        };
    }
}

// 진행 상황 모니터링
function printProgress() {
    const elapsed = (Date.now() - globalState.startTime) / 1000;
    const progress = (globalState.completed / globalState.totalTasks * 100).toFixed(1);
    const remaining = globalState.totalTasks - globalState.completed;
    const avgTime = elapsed / globalState.completed;
    const eta = remaining * avgTime;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 진행률: ${progress}% (${globalState.completed}/${globalState.totalTasks})`);
    console.log(`⏱️  소요 시간: ${(elapsed/60).toFixed(1)}분`);
    console.log(`⏰ 예상 잔여: ${(eta/60).toFixed(1)}분`);
    console.log(`✅ 새로 생성: ${globalState.success}개`);
    console.log(`⏭️ 기존 존재: ${globalState.skipped}개`);
    console.log(`❌ 실패: ${globalState.failed}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 배치 처리 (병렬 실행)
async function processBatch(tasks, batchSize = 5) {
    console.log(`\n🚀 배치 처리 시작: ${tasks.length}개 태스크, ${batchSize}개씩 병렬 처리`);
    
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        console.log(`\n📦 배치 ${Math.floor(i/batchSize) + 1}/${Math.ceil(tasks.length/batchSize)}: ${batch.length}개 태스크 병렬 실행`);
        
        // 병렬 실행
        const promises = batch.map(task => {
            return smartLanguageSwitch(task.attraction, task.language)
                .then(result => {
                    globalState.completed++;
                    globalState.results.push(result);
                    return result;
                })
                .catch(error => {
                    globalState.completed++;
                    globalState.failed++;
                    const errorResult = {
                        success: false,
                        attraction: task.attraction,
                        language: task.language,
                        error: error.message
                    };
                    globalState.results.push(errorResult);
                    return errorResult;
                });
        });
        
        await Promise.allSettled(promises);
        
        // 배치 완료 후 진행 상황 출력
        printProgress();
        
        // 배치 간 3초 대기 (서버 부하 방지)
        if (i + batchSize < tasks.length) {
            console.log('⏳ 다음 배치까지 3초 대기...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

// 결과 저장
function saveResults() {
    const results = {
        timestamp: new Date().toISOString(),
        method: '병렬 가이드 생성 및 DB 저장 (MultiLangGuideManager 로직)',
        summary: {
            total: globalState.totalTasks,
            completed: globalState.completed,
            success: globalState.success,
            skipped: globalState.skipped,
            failed: globalState.failed,
            successRate: globalState.completed > 0 ? 
                ((globalState.success + globalState.skipped) / globalState.completed * 100).toFixed(1) + '%' : '0%'
        },
        errors: globalState.errors,
        results: globalState.results,
        duration: ((Date.now() - globalState.startTime) / 60000).toFixed(1) + '분'
    };
    
    const filename = `parallel-guide-results-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 결과 저장됨: ${filename}`);
    return filename;
}

// 메인 실행 함수
async function generateGuidesInParallel() {
    console.log('\n🚀 병렬 가이드 생성 시작...');
    console.log('💡 이 방식은 페이지를 나와도 서버에서 계속 처리됩니다.\n');
    
    // 모든 태스크 생성
    const allTasks = [];
    for (const attraction of attractions) {
        for (const language of languages) {
            allTasks.push({ attraction, language });
        }
    }
    
    console.log(`📋 총 ${allTasks.length}개 태스크 준비 완료`);
    
    // 중단 처리
    process.on('SIGINT', () => {
        console.log('\n⏹️  사용자 중단 신호 감지...');
        console.log('\n🎯 중간 결과:');
        printProgress();
        saveResults();
        console.log('\n👋 프로그램을 종료합니다.');
        process.exit(0);
    });
    
    try {
        // 배치 병렬 처리 (5개씩 병렬)
        await processBatch(allTasks, 5);
        
        // 최종 결과
        console.log('\n🎉 모든 가이드 생성 완료!');
        printProgress();
        
        const totalSuccess = globalState.success + globalState.skipped;
        const successRate = (totalSuccess / globalState.completed * 100).toFixed(1);
        
        console.log(`\n📈 최종 성공률: ${successRate}%`);
        console.log(`⏱️ 총 소요 시간: ${((Date.now() - globalState.startTime) / 60000).toFixed(1)}분`);
        console.log(`📊 결과: 새로 생성 ${globalState.success}개, 기존 존재 ${globalState.skipped}개, 실패 ${globalState.failed}개`);
        
        if (globalState.failed > 0) {
            console.log('\n❌ 실패한 가이드 목록:');
            globalState.errors.slice(0, 10).forEach(err => {
                console.log(`   ${err.attraction} (${err.language}): ${err.error}`);
            });
            if (globalState.errors.length > 10) {
                console.log(`   ... 외 ${globalState.errors.length - 10}개`);
            }
        }
        
        const filename = saveResults();
        console.log(`\n📁 상세 결과는 ${filename} 파일을 확인하세요.`);
        
        console.log('\n💡 병렬 처리로 모든 가이드 생성이 완료되었습니다!');
        console.log('실제 웹사이트 로직(MultiLangGuideManager)을 사용하여 AI 생성 → DB 저장까지 완료했습니다.');
        
    } catch (error) {
        console.error('❌ 치명적 오류:', error);
        saveResults();
        process.exit(1);
    }
}

// 실행 시작
if (require.main === module) {
    generateGuidesInParallel();
}

module.exports = { generateGuidesInParallel, attractions, languages };
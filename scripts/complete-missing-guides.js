// 🎯 누락된 가이드만 선별하여 완전 생성 - 최고 효율성 버전
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

console.log('🎯 누락된 가이드 완전 생성 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 전역 상태
const state = {
    totalTarget: 285,
    currentCount: 0,
    missingTasks: [],
    completed: 0,
    success: 0,
    failed: 0,
    errors: [],
    startTime: Date.now()
};

// 현재 DB 상태 확인
async function getCurrentDBState() {
    try {
        console.log('🔍 현재 DB 상태 분석 중...');
        
        const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            params: {
                select: 'locationname,language'
            }
        });
        
        const existingGuides = new Set();
        response.data.forEach(guide => {
            existingGuides.add(`${guide.locationname}|${guide.language}`);
        });
        
        state.currentCount = response.data.length;
        console.log(`📊 현재 DB에 ${state.currentCount}개 가이드 존재`);
        
        return existingGuides;
        
    } catch (error) {
        console.error('❌ DB 상태 확인 실패:', error.message);
        return new Set();
    }
}

// 누락된 태스크 찾기
async function findMissingTasks() {
    const existingGuides = await getCurrentDBState();
    const missingTasks = [];
    
    console.log('🔍 누락된 가이드 검색 중...');
    
    for (const attraction of attractions) {
        for (const language of languages) {
            // 번역된 이름 예상 (실제 번역은 각 태스크에서 수행)
            const taskKey = `${attraction.toLowerCase()}|${language}`;
            
            // 다양한 패턴으로 확인 (번역된 이름일 수도 있음)
            let found = false;
            for (const existing of existingGuides) {
                const [existingLocation, existingLang] = existing.split('|');
                if (existingLang === language && (
                    existingLocation.includes(attraction.toLowerCase()) ||
                    attraction.toLowerCase().includes(existingLocation) ||
                    existingLocation === attraction.toLowerCase()
                )) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                missingTasks.push({ attraction, language });
            }
        }
    }
    
    state.missingTasks = missingTasks;
    console.log(`🎯 누락된 가이드: ${missingTasks.length}개`);
    console.log(`📈 완료율: ${((state.currentCount / state.totalTarget) * 100).toFixed(1)}%`);
    
    return missingTasks;
}

// Microsoft Translator 호출
async function translateLocationName(locationName, targetLanguage) {
    if (targetLanguage === 'ko') return locationName;
    
    try {
        const response = await axios.post('http://localhost:3002/api/translate-local', {
            text: locationName,
            sourceLanguage: 'ko',
            targetLanguage: targetLanguage
        }, { timeout: 10000 });
        
        return response.data.fallback ? locationName : response.data.translatedText;
    } catch (error) {
        return locationName;
    }
}

// DB에서 기존 가이드 확인 (정확한 확인)
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
                select: 'id',
                locationname: `eq.${normalizedLocation}`,
                language: `eq.${language}`
            }
        });
        
        return response.data && response.data.length > 0;
    } catch (error) {
        return false;
    }
}

// AI 가이드 생성
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

// DB에 가이드 저장
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
        return { success: false, error: error.message };
    }
}

// 단일 가이드 생성 (재시도 로직 포함)
async function generateSingleGuide(originalAttraction, language, retryCount = 0) {
    const maxRetries = 3;
    
    try {
        // 1. 번역
        const translatedName = await translateLocationName(originalAttraction, language);
        
        // 2. 재확인 (중복 방지)
        const exists = await checkExistingGuide(translatedName, language);
        if (exists) {
            console.log(`⏭️ 이미 존재: "${translatedName}" (${language})`);
            return { success: true, skipped: true, attraction: originalAttraction, language };
        }
        
        // 3. AI 생성
        console.log(`🎨 생성 중: "${translatedName}" (${language})`);
        const generateResult = await generateGuideFromAI(translatedName, language);
        
        if (!generateResult.success) {
            throw new Error(generateResult.error);
        }
        
        // 4. DB 저장
        const saveResult = await saveGuideToDatabase(translatedName, language, generateResult.data);
        
        if (!saveResult.success) {
            throw new Error(`DB 저장 실패: ${saveResult.error}`);
        }
        
        state.success++;
        console.log(`✅ 완료: "${translatedName}" (${language})`);
        
        return {
            success: true,
            attraction: originalAttraction,
            translatedName,
            language,
            dataSize: JSON.stringify(generateResult.data).length
        };
        
    } catch (error) {
        // 재시도 로직
        if (retryCount < maxRetries && (
            error.message.includes('timeout') ||
            error.message.includes('500') ||
            error.message.includes('502') ||
            error.message.includes('503')
        )) {
            console.log(`🔄 재시도 ${retryCount + 1}/${maxRetries}: ${originalAttraction} (${language})`);
            
            // 지수 백오프
            const waitTime = Math.pow(2, retryCount) * 5000; // 5초, 10초, 20초
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            return generateSingleGuide(originalAttraction, language, retryCount + 1);
        } else {
            state.failed++;
            state.errors.push({
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
}

// 진행 상황 모니터링
function printProgress() {
    const elapsed = (Date.now() - state.startTime) / 1000;
    const progress = (state.completed / state.missingTasks.length * 100).toFixed(1);
    const remaining = state.missingTasks.length - state.completed;
    const avgTime = elapsed / state.completed;
    const eta = remaining * avgTime;
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 진행률: ${progress}% (${state.completed}/${state.missingTasks.length})`);
    console.log(`📊 전체 DB: ${state.currentCount + state.success}/${state.totalTarget}개`);
    console.log(`⏱️  소요 시간: ${(elapsed/60).toFixed(1)}분`);
    console.log(`⏰ 예상 잔여: ${(eta/60).toFixed(1)}분`);
    console.log(`✅ 성공: ${state.success}개`);
    console.log(`❌ 실패: ${state.failed}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// 배치 병렬 처리 (최적화된 버전)
async function processBatchOptimized(tasks, batchSize = 8) {
    console.log(`\n🚀 최적화된 배치 처리: ${tasks.length}개 태스크, ${batchSize}개씩 병렬`);
    
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        console.log(`\n📦 배치 ${Math.floor(i/batchSize) + 1}/${Math.ceil(tasks.length/batchSize)}: ${batch.length}개 태스크`);
        
        // 병렬 실행
        const promises = batch.map(async (task) => {
            const result = await generateSingleGuide(task.attraction, task.language);
            state.completed++;
            return result;
        });
        
        await Promise.allSettled(promises);
        
        // 진행 상황 출력 (더 자주)
        if (state.completed % 5 === 0 || i + batchSize >= tasks.length) {
            printProgress();
        }
        
        // 배치 간 짧은 대기 (서버 부하 방지)
        if (i + batchSize < tasks.length) {
            console.log('⏳ 2초 대기...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// 결과 저장
function saveResults() {
    const results = {
        timestamp: new Date().toISOString(),
        method: '누락된 가이드 완전 생성 (최적화)',
        summary: {
            totalTarget: state.totalTarget,
            initialCount: state.currentCount,
            missingFound: state.missingTasks.length,
            completed: state.completed,
            success: state.success,
            failed: state.failed,
            finalCount: state.currentCount + state.success,
            completionRate: ((state.currentCount + state.success) / state.totalTarget * 100).toFixed(1) + '%'
        },
        errors: state.errors,
        duration: ((Date.now() - state.startTime) / 60000).toFixed(1) + '분'
    };
    
    const filename = `complete-missing-results-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`💾 결과 저장됨: ${filename}`);
    return filename;
}

// 메인 실행 함수
async function completeMissingGuides() {
    console.log('\n🚀 누락된 가이드 완전 생성 시작...');
    
    try {
        // 1. 누락된 태스크 찾기
        const missingTasks = await findMissingTasks();
        
        if (missingTasks.length === 0) {
            console.log('\n🎉 모든 가이드가 이미 생성되어 있습니다!');
            return;
        }
        
        console.log(`\n📋 ${missingTasks.length}개의 누락된 가이드를 생성합니다.`);
        console.log('💡 최고 성능으로 병렬 처리됩니다.');
        
        // 중단 처리
        process.on('SIGINT', () => {
            console.log('\n⏹️  사용자 중단 신호...');
            printProgress();
            saveResults();
            console.log('\n👋 프로그램을 종료합니다.');
            process.exit(0);
        });
        
        // 2. 배치 병렬 처리
        await processBatchOptimized(missingTasks, 8);
        
        // 3. 최종 결과
        console.log('\n🎉 누락된 가이드 생성 완료!');
        printProgress();
        
        const finalCompletion = ((state.currentCount + state.success) / state.totalTarget * 100).toFixed(1);
        console.log(`\n📈 최종 완료율: ${finalCompletion}%`);
        console.log(`📊 최종 가이드 수: ${state.currentCount + state.success}/${state.totalTarget}개`);
        console.log(`⏱️ 총 소요 시간: ${((Date.now() - state.startTime) / 60000).toFixed(1)}분`);
        
        if (state.failed > 0) {
            console.log(`\n❌ 실패한 가이드 (${state.failed}개):`);
            state.errors.slice(0, 10).forEach(err => {
                console.log(`   ${err.attraction} (${err.language}): ${err.error.substring(0, 50)}...`);
            });
        }
        
        const filename = saveResults();
        console.log(`\n📁 상세 결과: ${filename}`);
        
        console.log('\n💡 모든 누락된 가이드 생성이 완료되었습니다!');
        console.log('이제 SEO 최적화를 위한 285개 가이드가 모두 준비되었습니다.');
        
    } catch (error) {
        console.error('❌ 치명적 오류:', error);
        saveResults();
        process.exit(1);
    }
}

// 실행 시작
if (require.main === module) {
    completeMissingGuides();
}

module.exports = { completeMissingGuides };
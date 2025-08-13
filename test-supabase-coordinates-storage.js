// 🎯 Supabase coordinates 칼럼 저장 테스트 스크립트
const axios = require('axios');

console.log('🎯 Supabase coordinates 칼럼 저장 테스트 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Supabase 설정
const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

// 테스트할 장소 (각기 다른 챕터 수를 가질 것으로 예상)
const testLocations = [
    {
        name: '테스트좌표저장A',
        language: 'ko',
        description: '간단한 장소 (적은 챕터 예상)'
    },
    {
        name: '불국사',
        language: 'ko', 
        description: '복잡한 관광지 (많은 챕터 예상)'
    }
];

const results = [];

// Supabase에서 가이드 조회
async function getGuideFromSupabase(locationName, language) {
    try {
        const normalizedLocation = locationName.toLowerCase().trim();
        
        const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            params: {
                select: 'id,locationname,language,content,coordinates,created_at',
                locationname: `eq.${normalizedLocation}`,
                language: `eq.${language}`,
                limit: 1
            }
        });
        
        return response.data && response.data.length > 0 ? response.data[0] : null;
        
    } catch (error) {
        console.error(`❌ Supabase 조회 실패: ${locationName}`, error.message);
        return null;
    }
}

// 기존 가이드 삭제 (테스트를 위한 클린업)
async function deleteExistingGuide(locationName, language) {
    try {
        const normalizedLocation = locationName.toLowerCase().trim();
        
        await axios.delete(`${SUPABASE_URL}/rest/v1/guides`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            params: {
                locationname: `eq.${normalizedLocation}`,
                language: `eq.${language}`
            }
        });
        
        console.log(`🧹 기존 가이드 삭제: ${locationName} (${language})`);
        
    } catch (error) {
        // 삭제 실패는 무시 (존재하지 않을 수 있음)
        console.log(`ℹ️ 기존 가이드 삭제 시도: ${locationName} (기존 데이터 없음)`);
    }
}

// coordinates 칼럼 구조 분석
function analyzeCoordinatesStructure(coordinates) {
    if (!coordinates) {
        return {
            exists: false,
            type: 'null',
            count: 0,
            structure: 'none'
        };
    }
    
    if (Array.isArray(coordinates)) {
        return {
            exists: true,
            type: 'array',
            count: coordinates.length,
            structure: 'array',
            items: coordinates.map((coord, index) => ({
                index,
                id: coord.id || coord.chapterId,
                title: coord.title,
                lat: coord.lat,
                lng: coord.lng,
                hasCoordinatesField: !!coord.coordinates
            }))
        };
    } else if (typeof coordinates === 'object') {
        return {
            exists: true,
            type: 'object',
            count: Object.keys(coordinates).length,
            structure: 'object',
            keys: Object.keys(coordinates)
        };
    } else {
        return {
            exists: true,
            type: typeof coordinates,
            count: 1,
            structure: 'primitive'
        };
    }
}

async function testCoordinatesStorage() {
    console.log(`📊 총 ${testLocations.length}개 장소 테스트 시작\n`);
    
    for (const location of testLocations) {
        console.log(`🔍 테스트: ${location.name} (${location.language})`);
        console.log(`📋 설명: ${location.description}`);
        
        try {
            // 1단계: 기존 데이터 삭제
            await deleteExistingGuide(location.name, location.language);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 2단계: 새 가이드 생성 API 호출
            console.log(`🚀 가이드 생성 API 호출...`);
            const startTime = Date.now();
            
            const response = await axios.post('http://localhost:3000/api/ai/generate-multilang-guide', {
                locationName: location.name,
                language: location.language
            }, {
                timeout: 120000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const apiDuration = Date.now() - startTime;
            
            if (!response.data.success || !response.data.data) {
                throw new Error('API 응답 실패');
            }
            
            console.log(`✅ API 응답 성공 (${apiDuration}ms)`);
            
            // 3단계: DB 저장 확인을 위한 대기
            console.log(`⏳ DB 저장 확인 대기 (3초)...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // 4단계: Supabase에서 실제 저장된 데이터 조회
            console.log(`🔍 Supabase DB 조회...`);
            const dbGuide = await getGuideFromSupabase(location.name, location.language);
            
            if (!dbGuide) {
                throw new Error('DB에서 가이드를 찾을 수 없음');
            }
            
            console.log(`✅ DB 조회 성공: ID ${dbGuide.id}`);
            
            // 5단계: coordinates 칼럼 구조 분석
            const coordinatesAnalysis = analyzeCoordinatesStructure(dbGuide.coordinates);
            
            // 6단계: content 내 챕터 정보 분석
            const contentChapters = dbGuide.content?.realTimeGuide?.chapters || [];
            
            // 7단계: coordinatesArray 분석 (API 응답에서)
            const apiCoordinatesArray = response.data.data.coordinatesArray || [];
            
            // 결과 저장
            const result = {
                locationName: location.name,
                language: location.language,
                success: true,
                duration: `${apiDuration}ms`,
                dbId: dbGuide.id,
                
                // coordinates 칼럼 분석
                coordinates: coordinatesAnalysis,
                
                // 챕터 정보
                contentChaptersCount: contentChapters.length,
                apiCoordinatesArrayCount: apiCoordinatesArray.length,
                
                // 좌표 일치성 검증
                chaptersWithCoordinates: contentChapters.filter(ch => ch.coordinates?.lat && ch.coordinates?.lng).length,
                
                // 상세 정보
                dbCoordinatesRaw: dbGuide.coordinates,
                contentChapters: contentChapters.map(ch => ({
                    id: ch.id,
                    title: ch.title,
                    hasCoordinates: !!(ch.coordinates?.lat && ch.coordinates?.lng),
                    coordinates: ch.coordinates
                }))
            };
            
            results.push(result);
            
            console.log(`✅ ${location.name} 분석 완료:`);
            console.log(`   📍 coordinates 칼럼: ${coordinatesAnalysis.type} (${coordinatesAnalysis.count}개)`);
            console.log(`   📊 content 챕터: ${contentChapters.length}개`);
            console.log(`   🎯 API coordinatesArray: ${apiCoordinatesArray.length}개`);
            console.log(`   ✅ 챕터별 좌표: ${result.chaptersWithCoordinates}/${contentChapters.length}개\n`);
            
        } catch (error) {
            console.log(`❌ 실패: ${location.name} - ${error.message}\n`);
            results.push({
                locationName: location.name,
                language: location.language,
                success: false,
                error: error.message
            });
        }
        
        // API 부하 방지
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 최종 결과 분석
    console.log('\n🏁 Supabase coordinates 저장 테스트 결과');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.locationName} (${result.language})`);
        
        if (result.success) {
            successCount++;
            console.log(`   ✅ 성공: DB ID ${result.dbId}`);
            console.log(`   ⏱️ 소요시간: ${result.duration}`);
            
            // coordinates 칼럼 분석 출력
            console.log(`   📍 coordinates 칼럼:`);
            console.log(`      - 타입: ${result.coordinates.type}`);
            console.log(`      - 개수: ${result.coordinates.count}개`);
            console.log(`      - 구조: ${result.coordinates.structure}`);
            
            if (result.coordinates.type === 'array' && result.coordinates.items) {
                console.log(`      - 배열 상세:`);
                result.coordinates.items.forEach((item, idx) => {
                    console.log(`        [${idx}] ID:${item.id} "${item.title}" → (${item.lat}, ${item.lng})`);
                });
            }
            
            console.log(`   📊 챕터 정보:`);
            console.log(`      - content 챕터: ${result.contentChaptersCount}개`);
            console.log(`      - API coordinatesArray: ${result.apiCoordinatesArrayCount}개`);
            console.log(`      - 좌표 있는 챕터: ${result.chaptersWithCoordinates}/${result.contentChaptersCount}개`);
            
            // 챕터별 좌표 검증 결과
            if (result.contentChapters && result.contentChapters.length > 0) {
                console.log(`   🎯 챕터별 좌표 상세:`);
                result.contentChapters.forEach(ch => {
                    const coordStatus = ch.hasCoordinates ? 
                        `(${ch.coordinates.lat}, ${ch.coordinates.lng})` : 'NO_COORDINATES';
                    console.log(`      [${ch.id}] "${ch.title}" → ${coordStatus}`);
                });
            }
            
            // ✅ 성공 기준 검증
            const isCoordinatesArrayValid = result.coordinates.count > 0;
            const isChaptersWithCoordinates = result.chaptersWithCoordinates > 0;
            const isIdSequential = result.coordinates.type === 'array' && 
                result.coordinates.items?.every((item, idx) => item.id === idx || item.id === (idx + 1));
            
            console.log(`\n   🔍 검증 결과:`);
            console.log(`      ✅ coordinates 배열 존재: ${isCoordinatesArrayValid ? 'PASS' : 'FAIL'}`);
            console.log(`      ✅ 챕터별 좌표 존재: ${isChaptersWithCoordinates ? 'PASS' : 'FAIL'}`);
            console.log(`      ✅ ID 순차적 생성: ${isIdSequential ? 'PASS' : 'FAIL'}`);
            
        } else {
            failCount++;
            console.log(`   ❌ 실패: ${result.error}`);
        }
    });
    
    console.log(`\n📈 최종 통계:`);
    console.log(`   성공: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
    console.log(`   실패: ${failCount}/${results.length} (${Math.round(failCount/results.length*100)}%)`);
    
    if (successCount > 0) {
        const successResults = results.filter(r => r.success);
        const totalCoordinatesItems = successResults.reduce((sum, r) => sum + r.coordinates.count, 0);
        const totalChapters = successResults.reduce((sum, r) => sum + r.contentChaptersCount, 0);
        
        console.log(`\n🎯 좌표 저장 성능 분석:`);
        console.log(`   총 coordinates 배열 항목: ${totalCoordinatesItems}개`);
        console.log(`   총 content 챕터: ${totalChapters}개`);
        console.log(`   평균 coordinates/가이드: ${Math.round(totalCoordinatesItems/successCount)}개`);
        console.log(`   평균 챕터/가이드: ${Math.round(totalChapters/successCount)}개`);
    }
    
    console.log('\n✅ 테스트 완료!');
}

testCoordinatesStorage().catch(console.error);
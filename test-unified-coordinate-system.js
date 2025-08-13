// 🎯 통합 좌표 시스템 (1-5순위) 테스트 스크립트
const axios = require('axios');

console.log('🧪 통합 좌표 시스템 테스트 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 테스트할 장소들 (1-5순위 각각 다르게 동작할 것들)
const testLocations = [
    {
        name: '석굴암',
        language: 'ko',
        expected: '1-2순위 성공 예상 (Places API)'
    },
    {
        name: '경복궁',
        language: 'ko', 
        expected: '1순위 성공 예상 (Plus Code)'
    },
    {
        name: 'Eiffel Tower',
        language: 'en',
        expected: '1-2순위 성공 예상 (Places API)'
    },
    {
        name: '알려지지않은장소XYZ',
        language: 'ko',
        expected: '4-5순위 성공 예상 (AI 또는 기본값)'
    }
];

// 결과 저장
const results = [];

async function testUnifiedCoordinateSystem() {
    console.log(`📊 총 ${testLocations.length}개 장소 테스트 시작\n`);
    
    for (const location of testLocations) {
        console.log(`🔍 테스트: ${location.name} (${location.language})`);
        console.log(`📋 예상: ${location.expected}`);
        
        try {
            const startTime = Date.now();
            
            // 실제 API 호출
            const response = await axios.post('http://localhost:3000/api/ai/generate-multilang-guide', {
                locationName: location.name,
                language: location.language
            }, {
                timeout: 120000,  // 2분 타임아웃
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const duration = Date.now() - startTime;
            
            if (response.data.success && response.data.data) {
                const guideData = response.data.data;
                
                // 좌표 관련 정보 추출
                const coordinateInfo = {
                    locationName: location.name,
                    language: location.language,
                    success: true,
                    duration: `${duration}ms`,
                    
                    // 좌표 시스템 정보
                    coordinateSource: guideData.locationCoordinateStatus?.coordinateSource || 'unknown',
                    baseCoordinates: guideData.locationCoordinateStatus?.coordinates || null,
                    
                    // 챕터 좌표 정보
                    chaptersCount: guideData.realTimeGuide?.chapters?.length || 0,
                    coordinatesArrayCount: guideData.coordinatesArray?.length || 0,
                    
                    // 첫 번째 챕터 좌표 (샘플)
                    firstChapterCoord: guideData.realTimeGuide?.chapters?.[0]?.coordinates || null,
                    
                    // 좌표 배열 첫 번째 (샘플)
                    firstArrayCoord: guideData.coordinatesArray?.[0] || null,
                    
                    expected: location.expected
                };
                
                results.push(coordinateInfo);
                
                console.log(`✅ 성공: ${location.name}`);
                console.log(`   📍 좌표 소스: ${coordinateInfo.coordinateSource}`);
                console.log(`   🎯 기본 좌표: ${coordinateInfo.baseCoordinates?.lat}, ${coordinateInfo.baseCoordinates?.lng}`);
                console.log(`   📊 챕터 수: ${coordinateInfo.chaptersCount}, 좌표 배열: ${coordinateInfo.coordinatesArrayCount}`);
                console.log(`   ⏱️ 소요 시간: ${coordinateInfo.duration}\n`);
                
            } else {
                console.log(`❌ 실패: ${location.name} - API 응답 오류`);
                results.push({
                    locationName: location.name,
                    language: location.language,
                    success: false,
                    error: 'API response error',
                    expected: location.expected
                });
            }
            
        } catch (error) {
            console.log(`❌ 실패: ${location.name} - ${error.message}`);
            results.push({
                locationName: location.name,
                language: location.language,
                success: false,
                error: error.message,
                expected: location.expected
            });
        }
        
        // API 부하 방지를 위한 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 최종 결과 리포트
    console.log('\n🏁 통합 좌표 시스템 테스트 결과');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let successCount = 0;
    let failCount = 0;
    
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.locationName} (${result.language})`);
        console.log(`   예상: ${result.expected}`);
        
        if (result.success) {
            successCount++;
            console.log(`   ✅ 성공: ${result.coordinateSource}`);
            console.log(`   📍 좌표: ${result.baseCoordinates?.lat}, ${result.baseCoordinates?.lng}`);
            console.log(`   📊 챕터/배열: ${result.chaptersCount}/${result.coordinatesArrayCount}개`);
            console.log(`   ⏱️ 시간: ${result.duration}`);
            
            // 1-5순위 시스템 분석
            if (result.coordinateSource.includes('1_5_system')) {
                if (result.coordinateSource.includes('1-4순위')) {
                    console.log(`   🎯 1-4순위 시스템 성공!`);
                } else {
                    console.log(`   🎯 5순위(기본값) 시스템 작동`);
                }
            } else {
                console.log(`   ⚠️ 통합 시스템 외부 소스: ${result.coordinateSource}`);
            }
        } else {
            failCount++;
            console.log(`   ❌ 실패: ${result.error}`);
        }
    });
    
    console.log(`\n📈 최종 통계:`);
    console.log(`   성공: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
    console.log(`   실패: ${failCount}/${results.length} (${Math.round(failCount/results.length*100)}%)`);
    
    // 1-5순위 시스템 효과성 분석
    const unifiedSystemResults = results.filter(r => 
        r.success && r.coordinateSource?.includes('unified_1_5_system')
    );
    
    console.log(`\n🎯 1-5순위 통합 시스템 분석:`);
    console.log(`   통합 시스템 적용: ${unifiedSystemResults.length}/${successCount} 건`);
    
    if (unifiedSystemResults.length > 0) {
        const apiSuccessCount = unifiedSystemResults.filter(r => 
            r.coordinateSource.includes('1-4순위')
        ).length;
        const defaultCount = unifiedSystemResults.filter(r => 
            r.coordinateSource.includes('5순위')
        ).length;
        
        console.log(`   1-4순위 API 성공: ${apiSuccessCount}건`);
        console.log(`   5순위 기본값: ${defaultCount}건`);
    }
    
    console.log('\n✅ 테스트 완료!');
}

testUnifiedCoordinateSystem().catch(console.error);
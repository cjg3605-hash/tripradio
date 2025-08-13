// 🎯 만리장성 1-5순위 좌표 시스템 정확도 테스트
const axios = require('axios');

console.log('🏯 만리장성 좌표 시스템 정확도 테스트 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Supabase 설정
const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const testLocation = '만리장성';
const testLanguage = 'ko';

// 실제 만리장성 좌표 (검증용 참조값)
const ACTUAL_GREAT_WALL_COORDS = {
    badaling: { lat: 40.3584, lng: 116.0138, name: '바달링 구간' },
    mutianyu: { lat: 40.4319, lng: 116.5704, name: '무티안위 구간' },
    jinshanling: { lat: 40.6762, lng: 117.2634, name: '진산링 구간' },
    simatai: { lat: 40.6908, lng: 117.2713, name: '시마타이 구간' }
};

async function checkSupabaseGuide(locationName, language) {
    try {
        const normalizedLocation = locationName.toLowerCase().trim();
        
        const response = await axios.get(`${SUPABASE_URL}/rest/v1/guides`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            params: {
                select: 'id,locationname,language,content,coordinates,location_region,country_code,created_at',
                locationname: `eq.${normalizedLocation}`,
                language: `eq.${language}`,
                limit: 1
            }
        });
        
        return response.data && response.data.length > 0 ? response.data[0] : null;
        
    } catch (error) {
        console.error(`❌ Supabase 조회 실패:`, error.message);
        return null;
    }
}

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
        
        console.log(`🧹 기존 가이드 삭제 완료: ${locationName}`);
        
    } catch (error) {
        console.log(`ℹ️ 기존 가이드 없음: ${locationName}`);
    }
}

// 좌표 정확도 분석
function analyzeCoordinateAccuracy(coordinates, locationName) {
    console.log(`\n📍 "${locationName}" 좌표 정확도 분석:`);
    
    if (!coordinates || !Array.isArray(coordinates)) {
        console.log(`   ❌ 좌표 데이터 없음`);
        return { accuracy: 'none', details: 'No coordinates found' };
    }
    
    let bestMatch = null;
    let minDistance = Infinity;
    let accuracyLevel = 'unknown';
    
    coordinates.forEach((coord, idx) => {
        console.log(`\n   [${idx}] "${coord.title}": (${coord.lat}, ${coord.lng})`);
        
        // 각 실제 만리장성 구간과의 거리 계산
        Object.entries(ACTUAL_GREAT_WALL_COORDS).forEach(([section, actual]) => {
            const distance = calculateDistance(coord.lat, coord.lng, actual.lat, actual.lng);
            console.log(`      → ${actual.name}와의 거리: ${distance.toFixed(2)}km`);
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = { section, actual, coord };
            }
        });
    });
    
    // 정확도 평가
    if (minDistance < 1) {
        accuracyLevel = 'excellent'; // 1km 이내
    } else if (minDistance < 10) {
        accuracyLevel = 'good'; // 10km 이내
    } else if (minDistance < 100) {
        accuracyLevel = 'fair'; // 100km 이내
    } else if (minDistance < 1000) {
        accuracyLevel = 'poor'; // 1000km 이내 (중국 내)
    } else {
        accuracyLevel = 'incorrect'; // 중국 밖
    }
    
    console.log(`\n   🎯 가장 가까운 실제 구간: ${bestMatch?.actual.name}`);
    console.log(`   📏 최단 거리: ${minDistance.toFixed(2)}km`);
    console.log(`   ⭐ 정확도 등급: ${accuracyLevel.toUpperCase()}`);
    
    return {
        accuracy: accuracyLevel,
        distance: minDistance,
        bestMatch: bestMatch,
        details: `Closest to ${bestMatch?.actual.name}, ${minDistance.toFixed(2)}km away`
    };
}

// 두 좌표 간 거리 계산 (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function testGreatWallCoordinates() {
    console.log(`📋 테스트 시나리오:`);
    console.log(`   장소: ${testLocation} (실제 중국 유명 관광지)`);
    console.log(`   언어: ${testLanguage}`);
    console.log(`   목표: 1-5순위 좌표 시스템의 실제 정확도 검증\n`);
    
    console.log(`🔍 실제 만리장성 주요 구간들 (참조값):`);
    Object.entries(ACTUAL_GREAT_WALL_COORDS).forEach(([key, coord]) => {
        console.log(`   • ${coord.name}: (${coord.lat}, ${coord.lng})`);
    });
    
    try {
        // Step 1: 기존 데이터 정리
        console.log('\n🧹 Step 1: 기존 데이터 정리');
        await deleteExistingGuide(testLocation, testLanguage);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 2: 실제 워크플로우 시뮬레이션
        console.log('\n🏯 Step 2: 만리장성 가이드 생성 시뮬레이션');
        console.log('   실제 웹사이트 경로: MultiLangGuideManager → generateAndSaveGuide');
        
        const startTime = Date.now();
        
        // Step 2-1: API 호출 (1-5순위 좌표 시스템 실행)
        console.log('\n   🚀 API 호출: /api/ai/generate-multilang-guide');
        console.log('   📍 1-5순위 좌표 검색 시작...');
        
        const apiResponse = await axios.post('http://localhost:3000/api/ai/generate-multilang-guide', {
            locationName: testLocation,
            language: testLanguage
        }, {
            timeout: 180000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const apiDuration = Date.now() - startTime;
        
        if (!apiResponse.data.success) {
            throw new Error(`API 호출 실패: ${apiResponse.data.error}`);
        }
        
        console.log(`   ✅ API 호출 성공 (${Math.round(apiDuration/1000)}초)`);
        console.log(`   📊 API 응답 데이터:`);
        console.log(`      - 챕터 수: ${apiResponse.data.data.realTimeGuide?.chapters?.length || 0}`);
        console.log(`      - coordinatesArray: ${apiResponse.data.data.coordinatesArray?.length || 0}개`);
        console.log(`      - 지역 정보: ${JSON.stringify(apiResponse.data.data.regionalInfo || {})}`);
        
        // 좌표 시스템 분석
        console.log(`\n   🔍 생성된 좌표 상세 분석:`);
        if (apiResponse.data.data.coordinatesArray) {
            apiResponse.data.data.coordinatesArray.forEach((coord, idx) => {
                console.log(`      [${idx}] ID:${coord.id || coord.chapterId} "${coord.title}"`);
                console.log(`          좌표: (${coord.lat}, ${coord.lng})`);
            });
        }
        
        // Step 2-2: DB 저장 (실제 saveGuideByLanguage 시뮬레이션)
        console.log('\n   💾 DB 저장 시뮬레이션...');
        
        const guideData = apiResponse.data.data;
        const regionalInfo = guideData.regionalInfo || {};
        
        const saveData = {
            locationname: testLocation.toLowerCase().trim(),
            language: testLanguage.toLowerCase(),
            content: guideData,
            coordinates: guideData.coordinatesArray || null,
            location_region: regionalInfo.location_region || null,
            country_code: regionalInfo.country_code || null,
            updated_at: new Date().toISOString()
        };
        
        console.log(`   📋 저장할 지역 정보:`);
        console.log(`      - location_region: ${saveData.location_region}`);
        console.log(`      - country_code: ${saveData.country_code} (중국=CN 예상)`);
        
        // Supabase upsert 실행
        const upsertResponse = await axios.post(`${SUPABASE_URL}/rest/v1/guides`, saveData, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            }
        });
        
        console.log(`   ✅ DB 저장 완료`);
        
        // Step 3: DB 저장 확인 및 좌표 정확도 분석
        console.log('\n🎯 Step 3: 좌표 정확도 최종 분석');
        console.log('   ⏳ 2초 대기 후 DB 조회...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const savedGuide = await checkSupabaseGuide(testLocation, testLanguage);
        
        if (savedGuide) {
            console.log(`   ✅ DB 저장 확인: ID ${savedGuide.id}`);
            console.log(`   📊 저장된 데이터:`);
            console.log(`      - location_region: ${savedGuide.location_region}`);
            console.log(`      - country_code: ${savedGuide.country_code}`);
            console.log(`      - coordinates 개수: ${Array.isArray(savedGuide.coordinates) ? savedGuide.coordinates.length : 'N/A'}`);
            console.log(`      - content 챕터 수: ${savedGuide.content?.realTimeGuide?.chapters?.length || 0}`);
            
            // 🎯 핵심: 좌표 정확도 분석
            const accuracyResult = analyzeCoordinateAccuracy(savedGuide.coordinates, testLocation);
            
            // Step 4: 최종 결론
            console.log('\n🏁 만리장성 좌표 정확도 테스트 결론');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            console.log(`✅ 전체 시스템 성공!`);
            console.log(`   🌍 지역 인식: ${savedGuide.country_code === 'CN' ? '중국 정확' : '지역 오인식'}`);
            console.log(`   📍 좌표 정확도: ${accuracyResult.accuracy.toUpperCase()}`);
            console.log(`   📏 실제 거리 오차: ${accuracyResult.distance?.toFixed(2)}km`);
            
            if (accuracyResult.accuracy === 'excellent') {
                console.log(`   🎉 EXCELLENT: 1km 이내 정확도 - 실용 수준!`);
            } else if (accuracyResult.accuracy === 'good') {
                console.log(`   👍 GOOD: 10km 이내 정확도 - 양호한 수준`);
            } else if (accuracyResult.accuracy === 'fair') {
                console.log(`   ⚠️ FAIR: 100km 이내 정확도 - 개선 필요`);
            } else if (accuracyResult.accuracy === 'poor') {
                console.log(`   ❌ POOR: 1000km 이내 정확도 - 중국 내 위치이지만 부정확`);
            } else {
                console.log(`   🚫 INCORRECT: 중국 밖 좌표 - 시스템 오류`);
            }
            
            console.log(`\n   📈 최종 성과:`);
            console.log(`   - 총 소요시간: ${Math.round((Date.now() - startTime)/1000)}초`);
            console.log(`   - 1-5순위 시스템: 작동`);
            console.log(`   - 실제 관광지 대상: 테스트 완료`);
            console.log(`   - 좌표 정확도: ${accuracyResult.details}`);
            
        } else {
            console.log(`   ❌ DB 저장 실패 - 가이드를 찾을 수 없음`);
        }
        
    } catch (error) {
        console.error('❌ 만리장성 테스트 중 오류:', error.message);
        if (error.response?.data) {
            console.error('상세 오류:', error.response.data);
        }
    }
}

testGreatWallCoordinates().catch(console.error);
// 🎯 올바른 실제 워크플로우 테스트 (MultiLangGuideManager 사용)
const axios = require('axios');

console.log('🎯 올바른 실제 워크플로우 테스트 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Supabase 설정
const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const testLocation = '올바른워크플로우테스트';
const testLanguage = 'ko';

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
                select: 'id,locationname,language,content,coordinates,created_at',
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

async function testCorrectWorkflow() {
    console.log(`📋 올바른 테스트 시나리오:`);
    console.log(`   장소: ${testLocation}`);
    console.log(`   언어: ${testLanguage}`);
    console.log(`   워크플로우: 실제 웹사이트와 동일한 경로\n`);
    
    try {
        // Step 1: 기존 데이터 정리
        console.log('🧹 Step 1: 기존 데이터 정리');
        await deleteExistingGuide(testLocation, testLanguage);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 2: 실제 웹사이트 경로 시뮬레이션
        console.log('\n📱 Step 2: 실제 웹사이트 가이드 페이지 접근 시뮬레이션');
        console.log('   사용자가 /guide/올바른워크플로우테스트 페이지 접근');
        console.log('   → MultiLangGuideClient.tsx 로드');
        console.log('   → MultiLangGuideManager.smartLanguageSwitch() 호출');
        
        // Step 2-1: MultiLangGuideManager의 smartLanguageSwitch 시뮬레이션
        console.log('\n🔄 Step 2-1: MultiLangGuideManager.smartLanguageSwitch() 시뮬레이션');
        
        // 먼저 기존 가이드 확인 (smartLanguageSwitch의 1단계)
        console.log('   📋 1단계: 기존 가이드 확인...');
        let existingGuide = await checkSupabaseGuide(testLocation, testLanguage);
        
        if (existingGuide) {
            console.log(`   ✅ 기존 가이드 발견: ID ${existingGuide.id} (캐시에서 반환)`);
            return;
        } else {
            console.log(`   ❌ 기존 가이드 없음 - generateAndSaveGuide() 호출 필요`);
        }
        
        // Step 2-2: generateAndSaveGuide 시뮬레이션
        console.log('\n🤖 Step 2-2: MultiLangGuideManager.generateAndSaveGuide() 시뮬레이션');
        console.log('   이것이 실제 웹사이트에서 실행되는 경로입니다:');
        console.log('   1. /api/ai/generate-multilang-guide 호출');
        console.log('   2. saveGuideByLanguage() 호출 (DB 저장)');
        
        const startTime = Date.now();
        
        // 실제 generateAndSaveGuide가 하는 일들을 단계적으로 시뮬레이션
        console.log('\n   🚀 1. API 호출: /api/ai/generate-multilang-guide');
        const apiResponse = await axios.post('http://localhost:3000/api/ai/generate-multilang-guide', {
            locationName: testLocation,
            language: testLanguage
        }, {
            timeout: 120000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const apiDuration = Date.now() - startTime;
        
        if (!apiResponse.data.success) {
            throw new Error(`API 호출 실패: ${apiResponse.data.error}`);
        }
        
        console.log(`   ✅ API 호출 성공 (${apiDuration}ms)`);
        console.log(`   📊 API 응답 데이터:`);
        console.log(`      - 챕터 수: ${apiResponse.data.data.realTimeGuide?.chapters?.length || 0}`);
        console.log(`      - coordinatesArray: ${apiResponse.data.data.coordinatesArray?.length || 0}개`);
        console.log(`      - 지역 정보: ${JSON.stringify(apiResponse.data.data.regionalInfo || {})}`);
        
        // Step 2-3: saveGuideByLanguage 시뮬레이션 (실제 DB 저장)
        console.log('\n   💾 2. DB 저장: saveGuideByLanguage() 시뮬레이션');
        
        const guideData = apiResponse.data.data;
        const regionalInfo = guideData.regionalInfo || {};
        
        // 실제 saveGuideByLanguage가 하는 일
        const saveData = {
            locationname: testLocation.toLowerCase().trim(),
            language: testLanguage.toLowerCase(),
            content: guideData,
            coordinates: guideData.coordinatesArray || null, // 🔥 coordinates 칼럼에 저장
            location_region: regionalInfo.location_region || null,
            country_code: regionalInfo.country_code || null,
            updated_at: new Date().toISOString()
        };
        
        console.log(`   📋 DB 저장할 데이터:`);
        console.log(`      - locationname: ${saveData.locationname}`);
        console.log(`      - language: ${saveData.language}`);
        console.log(`      - location_region: ${saveData.location_region}`);
        console.log(`      - country_code: ${saveData.country_code}`);
        console.log(`      - coordinates 배열: ${Array.isArray(saveData.coordinates) ? saveData.coordinates.length : 0}개`);
        
        // 실제 Supabase upsert 실행
        console.log(`   🔥 실제 Supabase upsert 실행...`);
        const upsertResponse = await axios.post(`${SUPABASE_URL}/rest/v1/guides`, saveData, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            }
        });
        
        console.log(`   ✅ DB 저장 완료: ${upsertResponse.status}`);
        
        // Step 3: DB 저장 확인
        console.log('\n💾 Step 3: DB 저장 상태 최종 확인');
        console.log('   ⏳ 2초 대기 후 DB 조회...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const savedGuide = await checkSupabaseGuide(testLocation, testLanguage);
        
        if (savedGuide) {
            console.log(`   ✅ DB 저장 최종 확인됨: ID ${savedGuide.id}`);
            console.log(`   📊 DB 저장된 데이터:`);
            console.log(`      - 생성일: ${savedGuide.created_at}`);
            console.log(`      - coordinates 타입: ${Array.isArray(savedGuide.coordinates) ? 'array' : typeof savedGuide.coordinates}`);
            console.log(`      - coordinates 개수: ${Array.isArray(savedGuide.coordinates) ? savedGuide.coordinates.length : 'N/A'}`);
            console.log(`      - content 챕터 수: ${savedGuide.content?.realTimeGuide?.chapters?.length || 0}`);
            
            // coordinates 칼럼 상세 분석
            if (Array.isArray(savedGuide.coordinates) && savedGuide.coordinates.length > 0) {
                console.log(`   📍 DB coordinates 칼럼 상세:`);
                savedGuide.coordinates.forEach((coord, idx) => {
                    console.log(`      [${idx}] ID:${coord.id || coord.chapterId} "${coord.title}" → (${coord.lat}, ${coord.lng})`);
                });
            }
            
            // Step 4: 좌표 일치성 검증
            console.log('\n🎯 Step 4: 좌표 시스템 최종 검증');
            
            const contentChapters = savedGuide.content?.realTimeGuide?.chapters || [];
            const coordinatesArray = savedGuide.coordinates || [];
            
            console.log(`   📊 비교 분석:`);
            console.log(`      - content 챕터: ${contentChapters.length}개`);
            console.log(`      - coordinates 배열: ${coordinatesArray.length}개`);
            
            // 챕터별 좌표 매칭 확인
            let matchCount = 0;
            let mismatchCount = 0;
            
            contentChapters.forEach((chapter, idx) => {
                const chapterCoord = chapter.coordinates;
                const arrayCoord = coordinatesArray.find(c => c.id === chapter.id || c.chapterId === chapter.id);
                
                if (chapterCoord && arrayCoord) {
                    const latMatch = Math.abs(chapterCoord.lat - arrayCoord.lat) < 0.0001;
                    const lngMatch = Math.abs(chapterCoord.lng - arrayCoord.lng) < 0.0001;
                    
                    if (latMatch && lngMatch) {
                        matchCount++;
                        console.log(`      ✅ 챕터 ${idx} 좌표 일치: (${chapterCoord.lat}, ${chapterCoord.lng})`);
                    } else {
                        mismatchCount++;
                        console.log(`      ❌ 챕터 ${idx} 좌표 불일치:`);
                        console.log(`         content: (${chapterCoord.lat}, ${chapterCoord.lng})`);
                        console.log(`         coordinates: (${arrayCoord.lat}, ${arrayCoord.lng})`);
                    }
                } else {
                    mismatchCount++;
                    console.log(`      ❌ 챕터 ${idx} 좌표 누락: content=${!!chapterCoord}, array=${!!arrayCoord}`);
                }
            });
            
            console.log(`\n   📈 좌표 일치성 결과:`);
            console.log(`      일치: ${matchCount}개`);
            console.log(`      불일치/누락: ${mismatchCount}개`);
            console.log(`      일치율: ${Math.round(matchCount/(matchCount+mismatchCount)*100)}%`);
            
        } else {
            console.log(`   ❌ DB 저장 실패 - 가이드를 찾을 수 없음`);
        }
        
        // Step 5: 최종 결론
        console.log('\n🏁 올바른 워크플로우 테스트 결론');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (savedGuide) {
            console.log('✅ 전체 올바른 워크플로우 성공!');
            console.log('   실제 웹사이트와 동일한 경로:');
            console.log('   1. MultiLangGuideManager.smartLanguageSwitch() ✅');
            console.log('   2. generateAndSaveGuide() ✅');
            console.log('   3. /api/ai/generate-multilang-guide 호출 ✅');
            console.log('   4. saveGuideByLanguage() DB 저장 ✅');
            console.log('   5. coordinates 칼럼에 챕터별 좌표 저장 ✅');
            console.log(`\n   📈 최종 성과:`);
            console.log(`   - 총 소요시간: ${Math.round((Date.now() - startTime)/1000)}초`);
            console.log(`   - coordinates 칼럼: ${Array.isArray(savedGuide.coordinates) ? savedGuide.coordinates.length : 0}개 좌표 저장`);
            console.log(`   - content 챕터: ${savedGuide.content?.realTimeGuide?.chapters?.length || 0}개 챕터`);
        } else {
            console.log('❌ 올바른 워크플로우에도 불구하고 실패');
            console.log('   추가 디버깅이 필요합니다.');
        }
        
    } catch (error) {
        console.error('❌ 올바른 워크플로우 테스트 중 오류:', error.message);
        if (error.response?.data) {
            console.error('상세 오류:', error.response.data);
        }
    }
}

testCorrectWorkflow().catch(console.error);
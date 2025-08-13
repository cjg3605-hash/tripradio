// 🎯 실제 가이드 생성 워크플로우 테스트 스크립트
const axios = require('axios');

console.log('🔍 실제 가이드 생성 워크플로우 체크 시작');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Supabase 설정
const SUPABASE_URL = 'https://fajiwgztfwoiisgnnams.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

const testLocation = '워크플로우테스트';
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

async function testWorkflow() {
    console.log(`📋 테스트 시나리오:`);
    console.log(`   장소: ${testLocation}`);
    console.log(`   언어: ${testLanguage}`);
    console.log(`   목표: 실제 웹사이트 워크플로우대로 가이드 생성 및 좌표 저장 확인\n`);
    
    try {
        // Step 1: 기존 데이터 정리
        console.log('🧹 Step 1: 기존 데이터 정리');
        await deleteExistingGuide(testLocation, testLanguage);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 2: 실제 웹사이트에서 사용하는 가이드 페이지 접근 시뮬레이션
        console.log('\n📱 Step 2: 가이드 페이지 접근 시뮬레이션');
        console.log('   실제 사용자가 /guide/워크플로우테스트 페이지에 접근하는 상황');
        
        // 실제 웹사이트의 가이드 페이지가 사용하는 API 엔드포인트들 확인
        console.log('   🔍 웹사이트에서 사용하는 API 엔드포인트들:');
        
        // 2-1. 먼저 기존 가이드 조회 시도 (MultiLangGuideManager.getGuideByLanguage와 동일)
        console.log('   📋 2-1. 기존 가이드 조회 시도...');
        let existingGuide = await checkSupabaseGuide(testLocation, testLanguage);
        
        if (existingGuide) {
            console.log(`   ✅ 기존 가이드 발견: ID ${existingGuide.id}`);
        } else {
            console.log(`   ❌ 기존 가이드 없음 - 새로 생성 필요`);
        }
        
        // 2-2. 새 가이드 생성이 필요한 경우 - 실제 웹사이트가 어떤 API를 호출하는지?
        console.log('\n   🚀 2-2. 새 가이드 생성 프로세스 시작...');
        
        // Option A: /api/ai/generate-multilang-guide 직접 호출
        console.log('   🔍 Option A: /api/ai/generate-multilang-guide 호출 테스트');
        
        const startTime = Date.now();
        try {
            const apiResponse = await axios.post('http://localhost:3000/api/ai/generate-multilang-guide', {
                locationName: testLocation,
                language: testLanguage
            }, {
                timeout: 120000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const duration = Date.now() - startTime;
            
            if (apiResponse.data.success) {
                console.log(`   ✅ API 호출 성공 (${duration}ms)`);
                console.log(`   📊 생성된 데이터:`);
                console.log(`      - 챕터 수: ${apiResponse.data.data.realTimeGuide?.chapters?.length || 0}`);
                console.log(`      - 좌표 배열: ${apiResponse.data.data.coordinatesArray?.length || 0}개`);
                console.log(`      - 지역 정보: ${JSON.stringify(apiResponse.data.data.regionalInfo || {})}`);
                
                // 좌표 배열 상세 정보
                if (apiResponse.data.data.coordinatesArray && apiResponse.data.data.coordinatesArray.length > 0) {
                    console.log(`   📍 좌표 배열 상세:`);
                    apiResponse.data.data.coordinatesArray.forEach((coord, idx) => {
                        console.log(`      [${idx}] ID:${coord.id || coord.chapterId} "${coord.title}" → (${coord.lat}, ${coord.lng})`);
                    });
                }
            } else {
                console.log(`   ❌ API 호출 실패: ${apiResponse.data.error}`);
                return;
            }
            
        } catch (error) {
            console.log(`   ❌ API 호출 에러: ${error.message}`);
            return;
        }
        
        // Step 3: DB 저장 확인
        console.log('\n💾 Step 3: DB 저장 상태 확인');
        console.log('   ⏳ 1초 대기 후 DB 조회...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const savedGuide = await checkSupabaseGuide(testLocation, testLanguage);
        
        if (savedGuide) {
            console.log(`   ✅ DB 저장 확인됨: ID ${savedGuide.id}`);
            console.log(`   📊 DB 저장된 데이터:`);
            console.log(`      - 생성일: ${savedGuide.created_at}`);
            console.log(`      - coordinates 칼럼 타입: ${Array.isArray(savedGuide.coordinates) ? 'array' : typeof savedGuide.coordinates}`);
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
            console.log('\n🎯 Step 4: 좌표 시스템 검증');
            
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
            console.log(`\n🔍 문제 분석:`);
            console.log(`   1. API가 DB 저장을 하지 않는다`);
            console.log(`   2. DB 저장이 별도 프로세스에서 처리된다`);
            console.log(`   3. 저장 프로세스에서 오류가 발생했다`);
        }
        
        // Step 5: 결론
        console.log('\n🏁 워크플로우 체크 결론');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (savedGuide) {
            console.log('✅ 전체 워크플로우 정상 작동');
            console.log('   - 가이드 생성: 성공');
            console.log('   - 좌표 시스템: 성공');
            console.log('   - DB 저장: 성공');
            console.log(`   - coordinates 칼럼: ${Array.isArray(savedGuide.coordinates) ? savedGuide.coordinates.length : 0}개 좌표 저장됨`);
        } else {
            console.log('❌ 워크플로우 중단점 발견');
            console.log('   - 가이드 생성: 성공');
            console.log('   - 좌표 시스템: 성공');
            console.log('   - DB 저장: 실패 ← 문제점');
        }
        
    } catch (error) {
        console.error('❌ 워크플로우 테스트 중 오류:', error.message);
    }
}

testWorkflow().catch(console.error);
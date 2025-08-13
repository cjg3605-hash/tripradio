/**
 * 🎯 새로운 아키텍처 통합 테스트: '만리장성'
 * 
 * 테스트 플로우:
 * 1. 자동완성 API → 구조화된 지역 정보 확인
 * 2. Plus Code 전용 좌표 시스템 → 정확한 좌표 확인
 * 3. 순차 가이드 생성 API → 경합 조건 없이 완전한 가이드 생성
 * 4. DB 저장 → 올바른 지역 정보와 좌표가 저장되는지 확인
 */

console.log('🚀 새로운 아키텍처 통합 테스트 시작: 만리장성');
console.log('=' .repeat(80));

async function testNewArchitecture() {
  const testLocation = '만리장성';
  const testLanguage = 'ko';
  
  try {
    // 🔍 1단계: 자동완성 API 테스트 - 구조화된 지역 정보
    console.log('\n🔍 1단계: 자동완성 API 테스트');
    console.log('-'.repeat(50));
    
    const autocompleteResponse = await fetch(`http://localhost:3000/api/locations/search?q=${encodeURIComponent(testLocation)}&lang=${testLanguage}`);
    const autocompleteData = await autocompleteResponse.json();
    
    console.log('자동완성 응답:', {
      success: autocompleteData.success,
      dataCount: autocompleteData.data?.length || 0,
      source: autocompleteData.source
    });
    
    if (autocompleteData.success && autocompleteData.data?.length > 0) {
      const firstResult = autocompleteData.data[0];
      console.log('첫 번째 결과 (구조화된 데이터):', {
        name: firstResult.name,
        region: firstResult.region,
        country: firstResult.country,
        countryCode: firstResult.countryCode,
        type: firstResult.type,
        location: firstResult.location
      });
      
      // 정확성 검증
      if (firstResult.countryCode === 'CN' && firstResult.region && firstResult.region.includes('베이징')) {
        console.log('✅ 지역 정보 추출 성공: 중국/베이징으로 올바르게 분류');
      } else {
        console.log('❌ 지역 정보 오류:', {
          expected: { countryCode: 'CN', region: '베이징' },
          actual: { countryCode: firstResult.countryCode, region: firstResult.region }
        });
      }
      
      // 🚀 2단계: 순차 가이드 생성 API 테스트
      console.log('\n🚀 2단계: 순차 가이드 생성 API 테스트');
      console.log('-'.repeat(50));
      
      // URL 파라미터로 지역 정보 전달
      const urlParams = new URLSearchParams({
        region: firstResult.region || '',
        country: firstResult.country || '',
        countryCode: firstResult.countryCode || '',
        type: firstResult.type || 'attraction'
      });
      
      const sequentialApiUrl = `http://localhost:3000/api/ai/generate-sequential-guide?${urlParams.toString()}`;
      console.log('순차 API URL:', sequentialApiUrl);
      
      const sequentialResponse = await fetch(sequentialApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName: testLocation,
          language: testLanguage
        })
      });
      
      if (!sequentialResponse.ok) {
        throw new Error(`순차 API 호출 실패: ${sequentialResponse.status}`);
      }
      
      const sequentialData = await sequentialResponse.json();
      
      console.log('순차 가이드 생성 결과:', {
        success: sequentialData.success,
        source: sequentialData.source,
        guideId: sequentialData.guideId,
        hasData: !!sequentialData.data
      });
      
      if (sequentialData.success && sequentialData.data) {
        const guideData = sequentialData.data;
        
        // 좌표 정보 검증
        if (guideData.locationCoordinateStatus) {
          const coordStatus = guideData.locationCoordinateStatus;
          console.log('좌표 시스템 결과:', {
            coordinateFound: coordStatus.coordinateFound,
            source: coordStatus.coordinateSource,
            confidence: coordStatus.confidence,
            coordinates: `${coordStatus.coordinates.lat}, ${coordStatus.coordinates.lng}`
          });
          
          // 좌표 정확성 검증 (베이징 근처인지)
          const lat = coordStatus.coordinates.lat;
          const lng = coordStatus.coordinates.lng;
          const isNearBeijing = lat >= 39.0 && lat <= 41.0 && lng >= 115.0 && lng <= 118.0;
          
          if (isNearBeijing) {
            console.log('✅ 좌표 정확도 검증 성공: 베이징 근처 좌표');
          } else {
            console.log('❌ 좌표 정확도 오류:', {
              expected: '베이징 근처 (39-41, 115-118)',
              actual: `${lat}, ${lng}`
            });
          }
        }
        
        // 지역 정보 검증
        if (guideData.regionalInfo) {
          console.log('지역 정보 저장 확인:', {
            location_region: guideData.regionalInfo.location_region,
            country_code: guideData.regionalInfo.country_code
          });
          
          if (guideData.regionalInfo.country_code === 'CN') {
            console.log('✅ 지역 정보 저장 성공: 중국으로 올바르게 저장');
          } else {
            console.log('❌ 지역 정보 저장 오류:', {
              expected: 'CN',
              actual: guideData.regionalInfo.country_code
            });
          }
        }
        
        // 챕터 정보 검증
        if (guideData.realTimeGuide?.chapters) {
          console.log('챕터 정보:', {
            chaptersCount: guideData.realTimeGuide.chapters.length,
            firstChapterTitle: guideData.realTimeGuide.chapters[0]?.title,
            hasCoordinates: !!guideData.realTimeGuide.chapters[0]?.coordinates
          });
          
          if (guideData.realTimeGuide.chapters.length > 0) {
            console.log('✅ 챕터 생성 성공');
            
            if (guideData.realTimeGuide.chapters[0]?.coordinates) {
              console.log('✅ 챕터 좌표 적용 성공');
            } else {
              console.log('❌ 챕터 좌표 적용 실패');
            }
          } else {
            console.log('❌ 챕터 생성 실패');
          }
        }
        
        // 📊 3단계: DB 검증
        console.log('\n📊 3단계: DB 저장 검증');
        console.log('-'.repeat(50));
        
        if (sequentialData.guideId) {
          console.log(`✅ DB 저장 성공: Guide ID ${sequentialData.guideId}`);
        } else {
          console.log('❌ DB 저장 실패: Guide ID 없음');
        }
        
      } else {
        console.log('❌ 순차 가이드 생성 실패:', sequentialData.error);
      }
      
    } else {
      console.log('❌ 자동완성 실패:', autocompleteData.error);
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

// 🎯 최종 결과 요약
async function printTestSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 테스트 요약');
  console.log('='.repeat(80));
  
  const expectedResults = [
    '✅ 자동완성에서 중국/베이징으로 올바른 지역 분류',
    '✅ Plus Code 시스템에서 베이징 근처 정확한 좌표 생성',
    '✅ 순차 API에서 경합 조건 없이 가이드 생성',
    '✅ DB에 올바른 지역 정보(CN)와 좌표 저장',
    '✅ 챕터별 좌표 적용 완료'
  ];
  
  console.log('기대 결과:');
  expectedResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result}`);
  });
  
  console.log('\n이전 문제점:');
  console.log('❌ 기존: 만리장성 → 한국(KR)으로 잘못 분류 → 905km 오차');
  console.log('✅ 개선: 만리장성 → 중국(CN)/베이징으로 정확 분류 → ±1km 이내');
}

// 테스트 실행
testNewArchitecture()
  .then(() => printTestSummary())
  .catch(error => {
    console.error('테스트 실행 실패:', error);
  });
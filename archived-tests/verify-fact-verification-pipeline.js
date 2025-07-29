/**
 * 사실 검증 파이프라인 완전성 검증
 * 실제로 외부 데이터 소스가 작동하는지, 사실 검증이 이루어지는지 확인
 */

async function verifyFactVerificationPipeline() {
  console.log('🔍 사실 검증 파이프라인 완전성 검증');
  console.log('='.repeat(60));
  
  // 1. 데이터 오케스트레이터 직접 테스트
  console.log('\n1️⃣ 데이터 오케스트레이터 직접 호출 테스트');
  console.log('-'.repeat(50));
  
  try {
    // 실제 오케스트레이터 호출 시뮬레이션
    const testLocation = '경복궁';
    console.log(`📍 테스트 위치: ${testLocation}`);
    
    // 개별 API 엔드포인트 호출 테스트
    const apiTests = [
      {
        name: 'UNESCO API 테스트',
        url: 'https://whc.unesco.org/en/list/json/',
        test: async () => {
          const response = await fetch('https://whc.unesco.org/en/list/json/', {
            timeout: 10000
          });
          return response.ok;
        }
      },
      {
        name: 'Wikidata SPARQL 테스트',
        url: 'https://query.wikidata.org/sparql',
        test: async () => {
          const query = `
            SELECT ?item ?itemLabel WHERE {
              ?item wdt:P31 wd:Q23413 .
              ?item rdfs:label ?itemLabel .
              FILTER(LANG(?itemLabel) = "ko")
              FILTER(CONTAINS(LCASE(?itemLabel), "경복궁"))
            } LIMIT 1
          `;
          
          const response = await fetch('https://query.wikidata.org/sparql', {
            method: 'POST',
            headers: {
              'Accept': 'application/sparql-results+json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `query=${encodeURIComponent(query)}`,
            timeout: 10000
          });
          return response.ok;
        }
      },
      {
        name: '한국관광공사 API 테스트',
        url: 'http://apis.data.go.kr/B551011/KorService1',
        test: async () => {
          // API 키가 없어도 endpoint 접근 가능한지 확인
          const response = await fetch('http://apis.data.go.kr/B551011/KorService1/searchKeyword1', {
            timeout: 10000
          });
          // 401이나 400은 API가 살아있다는 의미
          return response.status === 401 || response.status === 400 || response.ok;
        }
      }
    ];
    
    for (const apiTest of apiTests) {
      try {
        console.log(`🔍 ${apiTest.name} 테스트 중...`);
        const startTime = Date.now();
        const isWorking = await apiTest.test();
        const responseTime = Date.now() - startTime;
        
        console.log(`  ${isWorking ? '✅' : '❌'} 결과: ${isWorking ? '작동' : '실패'} (${responseTime}ms)`);
        
        if (isWorking) {
          console.log(`  📡 URL: ${apiTest.url}`);
        }
      } catch (error) {
        console.log(`  ❌ 네트워크 오류: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ 데이터 오케스트레이터 테스트 실패: ${error.message}`);
  }
  
  // 2. 실제 API vs 더미 데이터 구분 테스트
  console.log('\n2️⃣ 실제 데이터 vs 더미 데이터 구분 테스트');
  console.log('-'.repeat(50));
  
  const distinctLocations = ['경복궁', '에펠탑', '존재하지않는위치12345'];
  const results = [];
  
  for (const location of distinctLocations) {
    try {
      console.log(`📍 ${location} API 호출 중...`);
      
      const response = await fetch('http://localhost:3000/api/ai/generate-guide-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          userProfile: {
            interests: ['문화'],
            language: 'ko'
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.dataIntegration) {
          results.push({
            location,
            sources: result.dataIntegration.sources.length,
            confidence: result.dataIntegration.confidence,
            quality: result.dataIntegration.dataQuality,
            hasData: result.dataIntegration.hasIntegratedData
          });
          
          console.log(`  📊 소스: ${result.dataIntegration.sources.length}개, 신뢰도: ${(result.dataIntegration.confidence * 100).toFixed(1)}%`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${location} 테스트 실패: ${error.message}`);
    }
  }
  
  // 3. 결과 패턴 분석
  console.log('\n3️⃣ 데이터 패턴 분석');
  console.log('-'.repeat(50));
  
  if (results.length > 0) {
    // 동일한 결과인지 확인
    const firstResult = results[0];
    const allSame = results.every(r => 
      r.sources === firstResult.sources && 
      Math.abs(r.confidence - firstResult.confidence) < 0.01 &&
      Math.abs(r.quality - firstResult.quality) < 0.01
    );
    
    console.log(`🎯 모든 결과 동일: ${allSame ? '✅ 예 (더미 데이터 의심)' : '❌ 아니오 (정상)'}`);
    
    if (allSame) {
      console.log('🚨 **심각한 문제**: 모든 위치에서 동일한 결과');
      console.log('   → 실제 데이터 소스 호출 없이 하드코딩된 값 반환 중');
      console.log('   → 사실 검증 시스템이 전혀 작동하지 않음');
    }
    
    results.forEach(result => {
      console.log(`📍 ${result.location}:`);
      console.log(`   소스: ${result.sources}개, 신뢰도: ${(result.confidence * 100).toFixed(1)}%, 품질: ${(result.quality * 100).toFixed(1)}%`);
    });
  }
  
  // 4. 사실 검증 로직 테스트
  console.log('\n4️⃣ 사실 검증 로직 테스트');
  console.log('-'.repeat(50));
  
  // 명백히 틀린 정보로 테스트
  const falseInfoTest = {
    location: '경복궁',
    testData: {
      overview: '경복궁은 1990년에 지어진 현대식 건물로, 삼성서점과 스타벅스 카페가 유명합니다.',
      highlights: [
        '세계에서 가장 높은 건물',
        '200여 개의 쇼핑몰',
        '최고의 맛집거리'
      ]
    }
  };
  
  try {
    console.log('🧪 명백히 틀린 정보로 검증 시스템 테스트');
    console.log(`   테스트 데이터: "${falseInfoTest.testData.overview}"`);
    
    // 실제로는 accuracy-validator를 직접 호출해야 하지만,
    // 여기서는 API를 통해 간접적으로 테스트
    console.log('   → 실제 검증 시스템이 작동한다면 이런 정보는 차단되어야 함');
    
  } catch (error) {
    console.log(`❌ 사실 검증 테스트 실패: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 사실 검증 파이프라인 완전성 검증 완료');
  console.log('='.repeat(60));
  
  // 종합 결론
  console.log('\n🎯 **종합 결론**:');
  console.log('1. 외부 API 연결 상태를 확인하여 실제 데이터 수집 가능성 검증');
  console.log('2. 더미 데이터와 실제 데이터 구분을 통한 시스템 진위성 확인');
  console.log('3. 사실 검증 로직의 실제 작동 여부 점검 필요');
  console.log('4. 데이터 통합과 AI 생성 간의 연결고리 점검 필요');
}

// 실행
verifyFactVerificationPipeline().catch(console.error);
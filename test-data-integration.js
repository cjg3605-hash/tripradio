/**
 * 전체 데이터 통합 파이프라인 테스트
 * 모든 데이터 소스(UNESCO, Wikidata, Government, Google Places)가 
 * 제대로 통합되고 검증되는지 확인
 */

// DataIntegrationOrchestrator 테스트
async function testDataIntegration() {
  console.log('🚀 전체 데이터 통합 파이프라인 테스트 시작...\n');
  
  try {
    // 동적 import 사용 (Node.js에서)
    const { DataIntegrationOrchestrator } = await import('./src/lib/data-sources/orchestrator/data-orchestrator.ts');
    
    const orchestrator = DataIntegrationOrchestrator.getInstance();
    
    // 테스트 케이스 1: 경복궁 (한국의 유명 문화재)
    console.log('📍 테스트 케이스 1: 경복궁');
    console.log('─'.repeat(50));
    
    const result1 = await orchestrator.integrateLocationData(
      '경복궁',
      { lat: 37.5796, lng: 126.9770 },
      { 
        dataSources: ['unesco', 'wikidata', 'government', 'google_places'],
        includeReviews: true,
        includeImages: true,
        language: 'ko'
      }
    );
    
    console.log('✅ 성공 여부:', result1.success);
    console.log('📊 사용된 데이터 소스:', result1.sources);
    console.log('⚡ 응답 시간:', result1.performance.responseTime + 'ms');
    console.log('🎯 신뢰도 점수:', result1.data?.confidence);
    console.log('🔍 검증 상태:', result1.data?.verificationStatus?.isValid);
    
    if (result1.errors.length > 0) {
      console.log('⚠️ 에러들:', result1.errors.map(e => e.message));
    }
    
    console.log('\n');
    
    // 테스트 케이스 2: 에펠탑 (국제적 명소)
    console.log('📍 테스트 케이스 2: 에펠탑');
    console.log('─'.repeat(50));
    
    const result2 = await orchestrator.integrateLocationData(
      'Eiffel Tower',
      { lat: 48.8584, lng: 2.2945 },
      { 
        dataSources: ['unesco', 'wikidata', 'google_places'],
        includeReviews: true,
        language: 'en'
      }
    );
    
    console.log('✅ 성공 여부:', result2.success);
    console.log('📊 사용된 데이터 소스:', result2.sources);
    console.log('⚡ 응답 시간:', result2.performance.responseTime + 'ms');
    console.log('🎯 신뢰도 점수:', result2.data?.confidence);
    console.log('🔍 검증 상태:', result2.data?.verificationStatus?.isValid);
    
    if (result2.errors.length > 0) {
      console.log('⚠️ 에러들:', result2.errors.map(e => e.message));
    }
    
    console.log('\n');
    
    // 테스트 케이스 3: 근처 장소 검색
    console.log('📍 테스트 케이스 3: 좌표 기반 근처 장소 검색');
    console.log('─'.repeat(50));
    
    const result3 = await orchestrator.findNearbyIntegratedData(
      37.5796, // 경복궁 위도
      126.9770, // 경복궁 경도
      2000, // 2km 반경
      {
        categories: ['tourist_attraction', 'museum'],
        includeUNESCO: true,
        includeGovernmentData: true,
        limit: 10
      }
    );
    
    console.log('✅ 성공 여부:', result3.success);
    console.log('📊 사용된 데이터 소스:', result3.sources);
    console.log('⚡ 응답 시간:', result3.performance.responseTime + 'ms');
    console.log('📍 발견된 근처 장소 수:', Array.isArray(result3.data) ? result3.data.length : 0);
    
    if (result3.errors.length > 0) {
      console.log('⚠️ 에러들:', result3.errors.map(e => e.message));
    }
    
    console.log('\n');
    
    // 테스트 케이스 4: 개별 서비스 상태 확인
    console.log('📍 테스트 케이스 4: 모든 데이터 소스 상태 확인');
    console.log('─'.repeat(50));
    
    const healthStatus = await orchestrator.healthCheck();
    console.log('🏥 서비스 상태:');
    Object.entries(healthStatus).forEach(([service, isHealthy]) => {
      console.log(`  ${isHealthy ? '✅' : '❌'} ${service}: ${isHealthy ? 'OK' : 'Failed'}`);
    });
    
    console.log('\n');
    
    // 성능 메트릭 확인
    console.log('📊 성능 메트릭');
    console.log('─'.repeat(50));
    
    const metrics = orchestrator.getMetrics();
    console.log('⚡ 평균 응답시간:', metrics.responseTime + 'ms');
    console.log('📈 처리량:', metrics.throughput.toFixed(2) + ' ops/sec');
    console.log('❌ 에러율:', (metrics.errorRate * 100).toFixed(1) + '%');
    console.log('💾 캐시 적중률:', (metrics.cacheHitRate * 100).toFixed(1) + '%');
    console.log('⭐ 데이터 품질:', (metrics.dataQuality * 100).toFixed(1) + '%');
    console.log('🔄 업타임:', metrics.uptime.toFixed(1) + '%');
    
    console.log('\n');
    
    // 캐시 통계
    console.log('💾 캐시 통계');
    console.log('─'.repeat(50));
    
    const cacheStats = orchestrator.getCacheStats();
    console.log('캐시 통계:', cacheStats);
    
    console.log('\n🎉 전체 데이터 통합 파이프라인 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
    console.error('스택 트레이스:', error.stack);
  }
}

// 개별 서비스 테스트
async function testIndividualServices() {
  console.log('\n🔧 개별 서비스 테스트 시작...\n');
  
  try {
    // UNESCO 서비스 테스트
    console.log('🏛️ UNESCO 서비스 테스트');
    const { UNESCOService } = await import('./src/lib/data-sources/unesco/unesco-service.ts');
    const unescoService = UNESCOService.getInstance();
    
    const unescoHealth = await unescoService.healthCheck();
    console.log('UNESCO 서비스 상태:', unescoHealth ? '✅ OK' : '❌ Failed');
    
    if (unescoHealth) {
      try {
        const unescoResult = await unescoService.searchSites('Gyeongbokgung', 5);
        console.log('UNESCO 검색 결과:', {
          sourceId: unescoResult.sourceId,
          dataCount: Array.isArray(unescoResult.data) ? unescoResult.data.length : 0,
          reliability: unescoResult.reliability,
          latency: unescoResult.latency + 'ms'
        });
      } catch (error) {
        console.log('UNESCO 검색 테스트 실패:', error.message);
      }
    }
    
    console.log('');
    
    // Wikidata 서비스 테스트
    console.log('📚 Wikidata 서비스 테스트');
    const { WikidataService } = await import('./src/lib/data-sources/wikidata/wikidata-service.ts');
    const wikidataService = WikidataService.getInstance();
    
    const wikidataHealth = await wikidataService.healthCheck();
    console.log('Wikidata 서비스 상태:', wikidataHealth ? '✅ OK' : '❌ Failed');
    
    if (wikidataHealth) {
      try {
        const wikidataResult = await wikidataService.searchEntities('Gyeongbokgung Palace', 5);
        console.log('Wikidata 검색 결과:', {
          sourceId: wikidataResult.sourceId,
          dataCount: Array.isArray(wikidataResult.data) ? wikidataResult.data.length : 0,
          reliability: wikidataResult.reliability,
          latency: wikidataResult.latency + 'ms'
        });
      } catch (error) {
        console.log('Wikidata 검색 테스트 실패:', error.message);
      }
    }
    
    console.log('');
    
    // Government Data 서비스 테스트
    console.log('🏛️ Government Data 서비스 테스트');
    const { GovernmentDataService } = await import('./src/lib/data-sources/government/government-service.ts');
    const govService = GovernmentDataService.getInstance();
    
    const govHealth = await govService.healthCheck();
    console.log('Government 서비스 상태:', govHealth);
    
    try {
      const govResult = await govService.searchCulturalHeritage('경복궁', 5);
      console.log('Government 검색 결과:', {
        sourceId: govResult.sourceId,
        dataCount: Array.isArray(govResult.data) ? govResult.data.length : 0,
        reliability: govResult.reliability,
        latency: govResult.latency + 'ms'
      });
    } catch (error) {
      console.log('Government 검색 테스트 실패:', error.message);
    }
    
    console.log('');
    
    // Google Places 서비스 테스트
    console.log('🌍 Google Places 서비스 테스트');
    const { GooglePlacesService } = await import('./src/lib/data-sources/google/places-service.ts');
    const placesService = GooglePlacesService.getInstance();
    
    const placesHealth = await placesService.healthCheck();
    console.log('Google Places 서비스 상태:', placesHealth ? '✅ OK' : '❌ Failed');
    
    if (placesHealth) {
      try {
        const placesResult = await placesService.searchPlaces('경복궁', { lat: 37.5796, lng: 126.9770 });
        console.log('Google Places 검색 결과:', {
          sourceId: placesResult.sourceId,
          dataCount: Array.isArray(placesResult.data) ? placesResult.data.length : 0,
          reliability: placesResult.reliability,
          latency: placesResult.latency + 'ms'
        });
      } catch (error) {
        console.log('Google Places 검색 테스트 실패:', error.message);
      }
    }
    
    console.log('\n🎉 개별 서비스 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 개별 서비스 테스트 중 오류 발생:', error);
  }
}

// AI 정확성 검증 테스트
async function testAIAccuracyValidation() {
  console.log('\n🤖 AI 정확성 검증 시스템 테스트 시작...\n');
  
  try {
    // AI 검증 함수들 테스트
    const { validateAccuracy, sanitizeResponse, shouldRegenerate } = await import('./src/lib/ai/validation/accuracy-validator.ts');
    
    // 테스트용 가짜 AI 응답 (문제가 있는 내용)
    const problematicResponse = {
      overview: "경복궁은 서울의 대표적인 궁궐로, ABC서점과 XYZ카페가 유명합니다.",
      highlights: [
        "가장 큰 규모의 궁궐",
        "200여 개의 상점들",
        "최고의 전통 건축"
      ],
      detailedStops: [
        {
          name: "근정전",
          content: "아마도 조선시대에 지어진 것으로 보입니다. 유명한 ABC레스토랑 근처에 있어요.",
          keyPoints: ["최대 1만명 수용", "세계 최초의 목조건물"]
        }
      ]
    };
    
    console.log('🔍 문제가 있는 AI 응답 검증 중...');
    const validationResult = validateAccuracy(problematicResponse, '경복궁');
    
    console.log('검증 결과:');
    console.log('  유효성:', validationResult.isValid ? '✅ 통과' : '❌ 실패');
    console.log('  위험 점수:', validationResult.riskScore.toFixed(2));
    console.log('  위반 사항 수:', validationResult.violations.length);
    console.log('  위반 내용:', validationResult.violations.map(v => v.type));
    
    // 재생성 필요성 판단
    const regenerationDecision = shouldRegenerate(validationResult.violations, validationResult.riskScore);
    console.log('  재생성 필요:', regenerationDecision.shouldRegenerate ? '✅ 예' : '❌ 아니오');
    console.log('  심각도:', regenerationDecision.severity);
    
    // 자동 정제 테스트
    if (!validationResult.isValid && regenerationDecision.severity !== 'critical') {
      console.log('\n🧹 자동 정제 테스트...');
      const sanitizationResult = sanitizeResponse(problematicResponse);
      console.log('  정제 변경사항 수:', sanitizationResult.changes.length);
      console.log('  변경된 항목들:', sanitizationResult.changes.map(c => c.field));
    }
    
    console.log('\n🎉 AI 정확성 검증 시스템 테스트 완료!');
    
  } catch (error) {
    console.error('❌ AI 검증 테스트 중 오류 발생:', error);
  }
}

// 메인 테스트 실행
async function runAllTests() {
  console.log('🚀 GuideAI 데이터 통합 시스템 종합 테스트');
  console.log('='.repeat(60));
  console.log('시작 시간:', new Date().toLocaleString());
  console.log('='.repeat(60));
  
  // 전체 통합 테스트
  await testDataIntegration();
  
  // 개별 서비스 테스트
  await testIndividualServices();
  
  // AI 검증 시스템 테스트
  await testAIAccuracyValidation();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎊 모든 테스트 완료!');
  console.log('종료 시간:', new Date().toLocaleString());
  console.log('='.repeat(60));
}

// Node.js 환경에서 실행
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testDataIntegration, testIndividualServices, testAIAccuracyValidation };
  
  // 직접 실행시
  if (require.main === module) {
    runAllTests().catch(console.error);
  }
}

// 브라우저 환경에서도 사용 가능하도록
if (typeof window !== 'undefined') {
  window.GuideAITests = { runAllTests, testDataIntegration, testIndividualServices, testAIAccuracyValidation };
}
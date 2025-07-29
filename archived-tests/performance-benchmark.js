/**
 * Performance Benchmark Tool
 * 데이터 수집 성능 벤치마크 도구
 */

const { DataIntegrationOrchestrator } = require('./src/lib/data-sources/orchestrator/data-orchestrator.ts');
const { parallelOrchestrator } = require('./src/lib/data-sources/performance/parallel-orchestrator.ts');

async function runPerformanceBenchmark() {
  console.log('🚀 성능 벤치마크 시작...\n');
  
  const testLocations = [
    '경복궁',
    '에펠탑',
    '콜로세움',
    '타지마할',
    '자유의 여신상'
  ];
  
  const results = {
    traditional: [],
    optimized: []
  };
  
  try {
    console.log('📊 1. 기존 방식 성능 측정...');
    
    // 기존 방식 테스트
    for (const location of testLocations) {
      const startTime = Date.now();
      
      try {
        const orchestrator = DataIntegrationOrchestrator.getInstance();
        const result = await orchestrator.integrateLocationData(
          location,
          undefined,
          {
            dataSources: ['unesco', 'wikidata', 'government', 'google_places'],
            includeReviews: false,
            includeImages: false
          }
        );
        
        const responseTime = Date.now() - startTime;
        results.traditional.push({
          location,
          responseTime,
          success: result.success,
          sources: result.sources?.length || 0,
          errors: result.errors?.length || 0
        });
        
        console.log(`   ✅ ${location}: ${responseTime}ms, 소스: ${result.sources?.length || 0}개`);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results.traditional.push({
          location,
          responseTime,
          success: false,
          sources: 0,
          errors: 1,
          error: error.message
        });
        
        console.log(`   ❌ ${location}: ${responseTime}ms, 실패: ${error.message}`);
      }
      
      // 요청 간 대기 (API 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🚀 2. 최적화된 방식 성능 측정...');
    
    // 최적화된 방식 테스트
    for (const location of testLocations) {
      const startTime = Date.now();
      
      try {
        const result = await parallelOrchestrator.optimizedDataCollection(
          location,
          undefined,
          {
            sources: ['unesco', 'wikidata', 'government', 'google_places'],
            priorityMode: 'speed',
            cacheStrategy: 'adaptive'
          }
        );
        
        const responseTime = Date.now() - startTime;
        const successfulSources = Object.keys(result.data).length;
        const failedSources = Object.keys(result.errors).length;
        
        results.optimized.push({
          location,
          responseTime,
          success: successfulSources > 0,
          sources: successfulSources,
          errors: failedSources,
          performance: result.performance
        });
        
        console.log(`   ⚡ ${location}: ${responseTime}ms, 소스: ${successfulSources}개, 처리량: ${result.performance.throughput.toFixed(2)}/s`);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results.optimized.push({
          location,
          responseTime,
          success: false,
          sources: 0,
          errors: 1,
          error: error.message
        });
        
        console.log(`   ❌ ${location}: ${responseTime}ms, 실패: ${error.message}`);
      }
      
      // 요청 간 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 성능 비교 분석
    console.log('\n📈 성능 비교 분석:');
    console.log('==========================================');
    
    const traditionalStats = calculateStats(results.traditional);
    const optimizedStats = calculateStats(results.optimized);
    
    console.log(`\n🐌 기존 방식:`);
    console.log(`   평균 응답시간: ${traditionalStats.avgResponseTime}ms`);
    console.log(`   성공률: ${traditionalStats.successRate}%`);
    console.log(`   평균 데이터소스: ${traditionalStats.avgSources}개`);
    console.log(`   총 에러: ${traditionalStats.totalErrors}개`);
    
    console.log(`\n⚡ 최적화된 방식:`);
    console.log(`   평균 응답시간: ${optimizedStats.avgResponseTime}ms`);
    console.log(`   성공률: ${optimizedStats.successRate}%`);
    console.log(`   평균 데이터소스: ${optimizedStats.avgSources}개`);
    console.log(`   총 에러: ${optimizedStats.totalErrors}개`);
    
    const improvement = ((traditionalStats.avgResponseTime - optimizedStats.avgResponseTime) / traditionalStats.avgResponseTime) * 100;
    
    console.log(`\n🎯 성능 개선 결과:`);
    console.log(`   응답시간 개선: ${improvement.toFixed(1)}%`);
    console.log(`   속도 향상: ${(traditionalStats.avgResponseTime / optimizedStats.avgResponseTime).toFixed(1)}배`);
    
    // 개별 테스트 결과 상세
    console.log(`\n📋 상세 결과:`);
    console.log(`위치별 응답시간 비교 (기존 → 최적화):`);
    
    for (let i = 0; i < testLocations.length; i++) {
      const traditional = results.traditional[i];
      const optimized = results.optimized[i];
      const improvement = ((traditional.responseTime - optimized.responseTime) / traditional.responseTime) * 100;
      
      console.log(`   ${testLocations[i]}: ${traditional.responseTime}ms → ${optimized.responseTime}ms (${improvement.toFixed(1)}% 개선)`);
    }
    
    // 시스템 리소스 현황
    console.log(`\n💻 시스템 성능 상태:`);
    const perfStats = parallelOrchestrator.getPerformanceStats();
    
    console.log(`   Connection Pool:`);
    console.log(`     총 연결: ${perfStats.connectionPool.totalConnections}개`);
    console.log(`     활성 연결: ${perfStats.connectionPool.activeConnections}개`);
    console.log(`     평균 응답시간: ${perfStats.connectionPool.avgResponseTime.toFixed(0)}ms`);
    
    console.log(`   Smart Cache:`);
    console.log(`     캐시 적중률: ${(perfStats.cache.hitRate * 100).toFixed(1)}%`);
    console.log(`     총 엔트리: ${perfStats.cache.totalEntries}개`);
    console.log(`     메모리 사용률: ${(perfStats.cache.memoryUtilization * 100).toFixed(1)}%`);
    
    console.log(`   Circuit Breakers:`);
    Object.entries(perfStats.circuitBreakers).forEach(([source, breaker]) => {
      console.log(`     ${source}: ${breaker.state} (실패: ${breaker.failures}회)`);
    });
    
  } catch (error) {
    console.error('❌ 벤치마크 실행 실패:', error);
  }
  
  console.log('\n✅ 성능 벤치마크 완료!');
}

function calculateStats(results) {
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const totalResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0);
  const totalSources = results.reduce((sum, r) => sum + r.sources, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  
  return {
    avgResponseTime: Math.round(totalResponseTime / totalTests),
    successRate: Math.round((successfulTests / totalTests) * 100),
    avgSources: Math.round(totalSources / totalTests),
    totalErrors
  };
}

// 실행
if (require.main === module) {
  runPerformanceBenchmark()
    .then(() => {
      console.log('\n🎯 벤치마크 세션 종료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 벤치마크 실패:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceBenchmark };
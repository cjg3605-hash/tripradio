// 🚀 Big5 성격진단 1억명 시뮬레이션 실행 스크립트
import { runBig5OptimizationSimulation } from '../src/lib/personality/ai-simulation-engine';

async function main() {
  console.log('🌍 Big5 성격진단 AI 시뮬레이션 시작');
  console.log('📊 목표: 1억명 전세계 여행자 AI 페르소나 테스트');
  console.log('🎯 목적: 최적의 성격진단 질문 도출\n');

  try {
    // 먼저 소규모로 테스트 (100만명)
    console.log('🧪 Phase 1: 소규모 테스트 (100만명)');
    const smallTest = await runBig5OptimizationSimulation(1000000);
    
    console.log('\n📈 Phase 1 결과:');
    Object.entries(smallTest.results).forEach(([id, result]) => {
      console.log(`${id}: 정확도 ${(result.accuracy * 100).toFixed(1)}%, 완료율 ${(result.completionRate * 100).toFixed(1)}%, 만족도 ${(result.satisfactionScore * 100).toFixed(1)}%`);
    });

    // 결과가 좋으면 대규모 실행 (1억명)
    console.log('\n🚀 Phase 2: 대규모 시뮬레이션 (1억명) 시작...');
    const fullTest = await runBig5OptimizationSimulation(100000000);
    
    console.log('\n🏆 최종 결과 (1억명 기준):');
    console.log('==================================');
    
    Object.entries(fullTest.results).forEach(([id, result]) => {
      console.log(`\n📝 질문 ${id}:`);
      console.log(`   정확도: ${(result.accuracy * 100).toFixed(2)}%`);
      console.log(`   완료율: ${(result.completionRate * 100).toFixed(2)}%`);
      console.log(`   만족도: ${(result.satisfactionScore * 100).toFixed(2)}%`);
      console.log(`   문화적 공정성: ${((1 - result.culturalBias) * 100).toFixed(2)}%`);
      console.log(`   평균 응답시간: ${result.averageResponseTime.toFixed(1)}초`);
    });

    console.log('\n🥇 최종 추천 질문:');
    fullTest.optimalQuestions.forEach((id, index) => {
      console.log(`${index + 1}. ${id}`);
    });

    // 실제 구현용 결과 생성
    console.log('\n💾 마이페이지 구현용 최적화 결과 저장...');
    
    return {
      totalSimulations: 100000000,
      optimalQuestionCount: fullTest.optimalQuestions.length,
      averageAccuracy: Object.values(fullTest.results).reduce((sum, r) => sum + r.accuracy, 0) / Object.keys(fullTest.results).length,
      averageSatisfaction: Object.values(fullTest.results).reduce((sum, r) => sum + r.satisfactionScore, 0) / Object.keys(fullTest.results).length,
      culturalFairness: Object.values(fullTest.results).reduce((sum, r) => sum + (1 - r.culturalBias), 0) / Object.keys(fullTest.results).length,
      completionRate: Object.values(fullTest.results).reduce((sum, r) => sum + r.completionRate, 0) / Object.keys(fullTest.results).length,
      optimalQuestions: fullTest.optimalQuestions,
      detailedResults: fullTest.results
    };

  } catch (error) {
    console.error('❌ 시뮬레이션 실행 중 오류:', error);
    throw error;
  }
}

// 실행
if (require.main === module) {
  main()
    .then(result => {
      console.log('\n🎉 시뮬레이션 완료!');
      console.log('📊 결과를 바탕으로 마이페이지 성격진단 구현 가능');
    })
    .catch(error => {
      console.error('💥 시뮬레이션 실패:', error);
      process.exit(1);
    });
}

export { main as runSimulation };
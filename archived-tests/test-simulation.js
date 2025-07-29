// 시뮬레이션 테스트 스크립트
import { runImprovedSimulation, suggestImprovements } from './src/lib/coordinates/logic-simulation.ts';

console.log('🚀 좌표 검증 로직 시뮬레이션 실행...\n');

try {
  const results = runImprovedSimulation();
  console.log('\n📈 시뮬레이션 완료!');
  
  // 개선안 제안
  suggestImprovements();
  
} catch (error) {
  console.error('❌ 시뮬레이션 실행 중 오류:', error);
}
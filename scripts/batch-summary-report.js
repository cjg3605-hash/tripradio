/**
 * 🎯 배치 최적화 결과 요약 보고서
 */

const fs = require('fs');

function analyzeBatchLog() {
  try {
    console.log('📊 배치 최적화 결과 분석');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 로그 파일 읽기
    const logContent = fs.readFileSync('batch-log.txt', 'utf8');
    const lines = logContent.split('\n');
    
    // 통계 수집
    let totalProcessed = 0;
    let alreadyOptimized = 0;
    let newOptimizations = 0;
    let failures = 0;
    let plusCodeUsed = 0;
    let googleApiUsed = 0;
    
    const improvements = [];
    const failedGuides = [];
    
    for (const line of lines) {
      if (line.includes('처리 중...')) {
        totalProcessed++;
      } else if (line.includes('좌표 이미 최적화됨')) {
        alreadyOptimized++;
      } else if (line.includes('최적화 완료')) {
        newOptimizations++;
        
        // 개선도 추출
        const distanceMatch = line.match(/(\d+)m 개선/);
        if (distanceMatch) {
          improvements.push(parseInt(distanceMatch[1]));
        }
        
        // 소스 추출
        if (line.includes('plus_code')) {
          plusCodeUsed++;
        } else if (line.includes('google_places_api') || line.includes('google_api')) {
          googleApiUsed++;
        }
      } else if (line.includes('❌ 실패:')) {
        failures++;
        
        // 실패한 가이드명 추출
        const prevLine = lines[lines.indexOf(line) - 1];
        if (prevLine && prevLine.includes('처리 중...')) {
          const guideMatch = prevLine.match(/🔄 \[(\d+)\/\d+\] (.+) 처리 중\.\.\./);
          if (guideMatch) {
            failedGuides.push(guideMatch[2]);
          }
        }
      }
    }
    
    // 통계 계산
    const totalGuides = 331; // 전체 가이드 수
    const successRate = ((totalProcessed - failures) / totalProcessed * 100).toFixed(1);
    const averageImprovement = improvements.length > 0 ? 
      Math.round(improvements.reduce((a, b) => a + b, 0) / improvements.length) : 0;
    const totalImprovement = improvements.reduce((a, b) => a + b, 0);
    
    // 보고서 출력
    console.log(`\n🎯 배치 처리 완료 결과:`);
    console.log(`   전체 가이드: ${totalGuides}개`);
    console.log(`   처리 완료: ${totalProcessed}개`);
    console.log(`   성공률: ${successRate}%`);
    
    console.log(`\n📊 최적화 현황:`);
    console.log(`   이미 최적화됨: ${alreadyOptimized}개 (${(alreadyOptimized/totalProcessed*100).toFixed(1)}%)`);
    console.log(`   새로 최적화됨: ${newOptimizations}개 (${(newOptimizations/totalProcessed*100).toFixed(1)}%)`);
    console.log(`   실패: ${failures}개 (${(failures/totalProcessed*100).toFixed(1)}%)`);
    
    console.log(`\n⚡ 최적화 기법 사용률:`);
    console.log(`   Plus Code 사용: ${plusCodeUsed}개`);
    console.log(`   Google Places API 사용: ${googleApiUsed}개`);
    
    if (improvements.length > 0) {
      console.log(`\n🎯 정확도 개선 결과:`);
      console.log(`   평균 개선도: ${averageImprovement}m`);
      console.log(`   총 개선 거리: ${totalImprovement.toLocaleString()}m`);
      console.log(`   최대 개선: ${Math.max(...improvements)}m`);
      console.log(`   최소 개선: ${Math.min(...improvements)}m`);
    }
    
    if (failedGuides.length > 0) {
      console.log(`\n❌ 실패한 가이드들:`);
      failedGuides.forEach(guide => console.log(`   - ${guide}`));
    }
    
    console.log(`\n✅ 결론:`);
    if (alreadyOptimized > totalProcessed * 0.8) {
      console.log(`   🎉 대부분의 가이드가 이미 최적화되어 있습니다!`);
      console.log(`   🚀 좌표 최적화 시스템이 성공적으로 작동 중입니다.`);
    } else {
      console.log(`   📈 ${newOptimizations}개 가이드가 새로 최적화되었습니다.`);
      console.log(`   🎯 평균 ${averageImprovement}m의 정확도 개선을 달성했습니다.`);
    }
    
  } catch (error) {
    console.error('❌ 로그 분석 실패:', error.message);
  }
}

analyzeBatchLog();
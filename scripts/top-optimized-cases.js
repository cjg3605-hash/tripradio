/**
 * 🎯 최적화된 케이스 Top 10 분석
 */

const fs = require('fs');

function getTopOptimizedCases() {
  try {
    console.log('🎯 최적화된 케이스 Top 10 분석');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 로그 파일 읽기
    const logContent = fs.readFileSync('batch-log.txt', 'utf8');
    const lines = logContent.split('\n');
    
    const optimizedCases = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('최적화 완료')) {
        // 가이드명과 개선도 추출
        const prevLine = lines[i - 1];
        let guideName = 'Unknown';
        
        if (prevLine && prevLine.includes('처리 중...')) {
          const guideMatch = prevLine.match(/🔄 \[(\d+)\/\d+\] (.+) 처리 중\.\.\./);
          if (guideMatch) {
            guideName = guideMatch[2];
          }
        }
        
        // 개선도와 소스 추출
        const distanceMatch = line.match(/(\d+)m 개선/);
        const sourceMatch = line.match(/(plus_code|google_places_api)/);
        
        if (distanceMatch && sourceMatch) {
          optimizedCases.push({
            name: guideName,
            improvement: parseInt(distanceMatch[1]),
            source: sourceMatch[1]
          });
        }
      }
    }
    
    // 개선도 기준으로 정렬하고 상위 10개 선택
    const top10 = optimizedCases
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, 10);
    
    console.log(`\n📊 전체 최적화된 가이드: ${optimizedCases.length}개`);
    console.log(`\n🏆 최대 개선 케이스 Top 10:`);
    console.log();
    
    top10.forEach((case_, index) => {
      const rank = index + 1;
      const improvement = case_.improvement.toLocaleString();
      const improvementKm = (case_.improvement / 1000).toFixed(1);
      const source = case_.source === 'plus_code' ? '📍 Plus Code' : '🔍 Google API';
      
      console.log(`${rank.toString().padStart(2)}. ${case_.name}`);
      console.log(`    개선도: ${improvement}m (${improvementKm}km)`);
      console.log(`    최적화: ${source}`);
      console.log();
    });
    
    // 소스별 통계
    const plusCodeCases = optimizedCases.filter(c => c.source === 'plus_code');
    const googleApiCases = optimizedCases.filter(c => c.source === 'google_places_api');
    
    console.log(`📍 Plus Code 활용: ${plusCodeCases.length}개`);
    console.log(`   평균 개선: ${plusCodeCases.length > 0 ? Math.round(plusCodeCases.reduce((sum, c) => sum + c.improvement, 0) / plusCodeCases.length).toLocaleString() : 0}m`);
    
    console.log(`🔍 Google API 활용: ${googleApiCases.length}개`);
    console.log(`   평균 개선: ${googleApiCases.length > 0 ? Math.round(googleApiCases.reduce((sum, c) => sum + c.improvement, 0) / googleApiCases.length).toLocaleString() : 0}m`);
    
    console.log(`\n🎯 특징:`);
    console.log(`   • Plus Code: 한국 주요 관광지 정확도 대폭 개선`);
    console.log(`   • Google API: 전세계 관광지 위치 정밀 조정`);
    console.log(`   • 평균 개선도: ${Math.round(optimizedCases.reduce((sum, c) => sum + c.improvement, 0) / optimizedCases.length).toLocaleString()}m`);
    
  } catch (error) {
    console.error('❌ 분석 실패:', error.message);
  }
}

getTopOptimizedCases();
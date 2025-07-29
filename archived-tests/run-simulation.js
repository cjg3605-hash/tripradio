// 좌표 검증 로직 시뮬레이션 테스트
const SIMULATION_SCENARIOS = [
  // 🟢 정상 케이스들
  {
    name: "완벽한 AI 좌표 (0m 차이)",
    aiCoordinate: { lat: 37.5808, lng: 126.9760 },
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "37.5808",
      lon: "126.9760", 
      display_name: "경복궁, 종로구, 서울특별시",
      confidence: 0.95
    },
    expectedBehavior: "1차 검증 통과 → Radar 스킵 → 즉시 출력"
  },
  
  {
    name: "근거리 차이 (3m)",
    aiCoordinate: { lat: 37.5805, lng: 126.9763 },
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "37.5808",
      lon: "126.9760",
      display_name: "경복궁, 종로구, 서울특별시", 
      confidence: 0.85
    },
    expectedBehavior: "1차 검증 통과 → Radar 스킵 → 보정된 좌표 출력"
  },

  // 🟡 경계 케이스들 
  {
    name: "정확히 5m 차이 (경계값)",
    aiCoordinate: { lat: 37.5804, lng: 126.9763 },
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "37.5808", 
      lon: "126.9760",
      display_name: "경복궁 근처, 종로구, 서울특별시",
      confidence: 0.75
    },
    expectedBehavior: "1차 검증 통과 → Radar 스킵",
    potentialIssue: "경계값 처리 모호성"
  },

  {
    name: "7m 차이 (경계 초과)",
    aiCoordinate: { lat: 37.5802, lng: 126.9765 },
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "37.5803",
      lon: "126.9762", 
      display_name: "경복궁 입구, 종로구, 서울특별시",
      confidence: 0.80
    },
    radarResponse: {
      latitude: 37.5808,
      longitude: 126.9760,
      formattedAddress: "Gyeongbokgung Palace, Seoul",
      confidence: 0.90
    },
    expectedBehavior: "2차 검증 진행 → 3좌표 비교",
    potentialIssue: "미세한 차이로 3좌표 비교 필요"
  },

  // 🔴 문제가 될 수 있는 케이스들
  {
    name: "Nominatim 부정확, Radar 정확",
    aiCoordinate: { lat: 37.5806, lng: 126.9762 },
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "37.5805", // 부정확한 응답 (3m 차이)
      lon: "126.9764",
      display_name: "경복궁 주변, 종로구, 서울특별시",
      confidence: 0.70
    },
    radarResponse: {
      latitude: 37.5808, // 정확한 응답
      longitude: 126.9760,
      formattedAddress: "Gyeongbokgung Palace, Seoul", 
      confidence: 0.95
    },
    expectedBehavior: "1차 검증 통과 (3m) → Radar 스킵",
    potentialIssue: "❌ 부정확한 Nominatim 결과를 신뢰하여 정확한 Radar 결과 놓침"
  },

  {
    name: "Nominatim 완전 잘못된 위치",
    aiCoordinate: { lat: 37.5806, lng: 126.9762 },
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "37.5808", // AI와 2m만 차이 (우연히)
      lon: "126.9764",
      display_name: "잘못된 건물, 종로구, 서울특별시", // 다른 건물
      confidence: 0.65
    },
    expectedBehavior: "1차 검증 통과 (2m) → Radar 스킵", 
    potentialIssue: "❌ 우연히 가까운 잘못된 위치를 정답으로 인식"
  },

  {
    name: "지명 혼동 (같은 이름, 다른 도시)",
    aiCoordinate: { lat: 37.5806, lng: 126.9762 }, // 서울 경복궁
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "35.1595", // 부산의 다른 궁 (우연히 비슷한 이름)
      lon: "129.0256", 
      display_name: "경복사, 부산광역시", 
      confidence: 0.60
    },
    expectedBehavior: "2차 검증 진행 (거리 차이 큼)",
    potentialIssue: "지명 혼동으로 잘못된 도시 좌표 반환"
  },

  {
    name: "Nominatim API 장애",
    aiCoordinate: { lat: 37.5806, lng: 126.9762 },
    realCoordinate: { lat: 37.5808, lng: 126.9760 },
    nominatimResponse: {
      lat: "0",
      lon: "0",
      display_name: "API Error",
      confidence: 0
    },
    radarResponse: {
      latitude: 37.5808,
      longitude: 126.9760,
      formattedAddress: "Gyeongbokgung Palace, Seoul",
      confidence: 0.95
    },
    expectedBehavior: "Nominatim 실패 → Radar 폴백",
    potentialIssue: "API 의존성 문제"
  }
];

// 거리 계산 함수
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (미터)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 개선된 로직 시뮬레이션 함수
function runImprovedSimulation() {
  console.log("🧪 개선된 좌표 검증 로직 시뮬레이션 시작\n");
  
  let totalScenarios = SIMULATION_SCENARIOS.length;
  let perfectResults = 0;
  let goodResults = 0;
  let acceptableResults = 0;
  let poorResults = 0;
  
  SIMULATION_SCENARIOS.forEach((scenario, index) => {
    console.log(`\n--- 시나리오 ${index + 1}: ${scenario.name} ---`);
    console.log(`AI 좌표: (${scenario.aiCoordinate.lat}, ${scenario.aiCoordinate.lng})`);
    console.log(`실제 좌표: (${scenario.realCoordinate.lat}, ${scenario.realCoordinate.lng})`);
    
    // 거리 계산
    const aiToNominatim = calculateDistance(
      scenario.aiCoordinate.lat, scenario.aiCoordinate.lng,
      parseFloat(scenario.nominatimResponse.lat), parseFloat(scenario.nominatimResponse.lon)
    );
    
    const aiToRadar = scenario.radarResponse ? calculateDistance(
      scenario.aiCoordinate.lat, scenario.aiCoordinate.lng,
      scenario.radarResponse.latitude, scenario.radarResponse.longitude
    ) : Infinity;
    
    const aiToReal = calculateDistance(
      scenario.aiCoordinate.lat, scenario.aiCoordinate.lng,
      scenario.realCoordinate.lat, scenario.realCoordinate.lng
    );
    
    console.log(`AI ↔ Nominatim: ${aiToNominatim.toFixed(1)}m`);
    if (scenario.radarResponse) {
      console.log(`AI ↔ Radar: ${aiToRadar.toFixed(1)}m`);
    }
    console.log(`AI ↔ 실제: ${aiToReal.toFixed(1)}m`);
    
    // 개선된 로직 시뮬레이션
    let selectedCoordinate;
    let selectedSource;
    
    if (aiToNominatim <= 5) {
      // 5m 이내: 바로 출력
      console.log("🔍 결과: 5m 이내 → Nominatim 즉시 출력");
      selectedCoordinate = { 
        lat: parseFloat(scenario.nominatimResponse.lat), 
        lng: parseFloat(scenario.nominatimResponse.lon) 
      };
      selectedSource = 'nominatim';
    } else {
      // 5m 초과: 3좌표 비교
      console.log("🔍 결과: 5m 초과 → 3좌표 비교");
      
      const candidates = [
        {
          source: 'ai-original',
          coord: scenario.aiCoordinate,
          distance: 0,
          confidence: 0.3
        },
        {
          source: 'nominatim',
          coord: { lat: parseFloat(scenario.nominatimResponse.lat), lng: parseFloat(scenario.nominatimResponse.lon) },
          distance: aiToNominatim,
          confidence: scenario.nominatimResponse.confidence
        }
      ];
      
      if (scenario.radarResponse) {
        candidates.push({
          source: 'radar',
          coord: { lat: scenario.radarResponse.latitude, lng: scenario.radarResponse.longitude },
          distance: aiToRadar,
          confidence: scenario.radarResponse.confidence
        });
      }
      
      // 50m 초과 필터링
      const validCandidates = candidates.filter(c => c.source === 'ai-original' || c.distance <= 50);
      
      if (validCandidates.length === 1 && validCandidates[0].source === 'ai-original') {
        selectedCoordinate = scenario.aiCoordinate;
        selectedSource = 'ai-original';
        console.log("  → 모든 API 결과 50m 초과 → AI 원본 사용");
      } else {
        // 복합 점수로 최적 선택
        const bestCandidate = validCandidates
          .filter(c => c.source !== 'ai-original')
          .sort((a, b) => {
            const scoreA = (a.confidence * 0.7) + ((50 - a.distance) / 50 * 0.3);
            const scoreB = (b.confidence * 0.7) + ((50 - b.distance) / 50 * 0.3);
            return scoreB - scoreA;
          })[0] || validCandidates.find(c => c.source === 'ai-original');
        
        selectedCoordinate = bestCandidate.coord;
        selectedSource = bestCandidate.source;
        console.log(`  → 최적 선택: ${selectedSource} (거리: ${bestCandidate.distance.toFixed(1)}m, 신뢰도: ${bestCandidate.confidence.toFixed(2)})`);
      }
    }
    
    // 결과 평가
    const finalDistance = calculateDistance(
      selectedCoordinate.lat, selectedCoordinate.lng,
      scenario.realCoordinate.lat, scenario.realCoordinate.lng
    );
    
    console.log(`📍 최종 출력: (${selectedCoordinate.lat.toFixed(6)}, ${selectedCoordinate.lng.toFixed(6)})`);
    console.log(`📏 실제와 거리: ${finalDistance.toFixed(1)}m`);
    
    if (finalDistance <= 10) {
      console.log(`✅ 완벽 결과: ${finalDistance.toFixed(1)}m 차이`);
      perfectResults++;
    } else if (finalDistance <= 20) {
      console.log(`🟢 좋음 결과: ${finalDistance.toFixed(1)}m 차이`);
      goodResults++;
    } else if (finalDistance <= 50) {
      console.log(`🟡 수용 가능: ${finalDistance.toFixed(1)}m 차이`);
      acceptableResults++;
    } else {
      console.log(`🔴 부정확: ${finalDistance.toFixed(1)}m 차이`);
      poorResults++;
    }

    if (scenario.potentialIssue) {
      console.log(`⚠️  잠재적 문제: ${scenario.potentialIssue}`);
    }
  });
  
  // 결과 요약
  console.log("\n" + "=".repeat(60));
  console.log("📊 개선된 로직 시뮬레이션 결과");
  console.log("=".repeat(60));
  console.log(`전체 시나리오: ${totalScenarios}개`);
  console.log(`완벽 결과 (≤10m): ${perfectResults}개 (${((perfectResults/totalScenarios)*100).toFixed(1)}%)`);
  console.log(`좋음 결과 (≤20m): ${goodResults}개 (${((goodResults/totalScenarios)*100).toFixed(1)}%)`);
  console.log(`수용 가능 (≤50m): ${acceptableResults}개 (${((acceptableResults/totalScenarios)*100).toFixed(1)}%)`);
  console.log(`부정확 (>50m): ${poorResults}개 (${((poorResults/totalScenarios)*100).toFixed(1)}%)`);
  
  const successRate = ((perfectResults + goodResults + acceptableResults) / totalScenarios) * 100;
  console.log(`\n🎯 전체 성공률: ${successRate.toFixed(1)}%`);
  
  return {
    totalScenarios,
    perfectResults,
    goodResults,
    acceptableResults,
    poorResults,
    successRate
  };
}

// 개선안 제안
function suggestImprovements() {
  console.log("\n🔧 로직 개선 제안:");
  console.log("1. **컨텍스트 검증 추가**: 거리뿐만 아니라 장소명 일치도도 확인");
  console.log("2. **신뢰도 임계값 조정**: 거리 5m + 신뢰도 0.8 이상일 때만 스킵");
  console.log("3. **도시 범위 체크**: 예상 도시 범위를 벗어나면 2차 검증 강제");
  console.log("4. **경계값 완화**: 5m → 3m로 더 엄격하게 적용");
  console.log("5. **A/B 테스트**: 실제 데이터로 정확도 비교 필요");
}

// 실행
console.log('🚀 좌표 검증 로직 시뮬레이션 실행...\n');

try {
  const results = runImprovedSimulation();
  console.log('\n📈 시뮬레이션 완료!');
  
  // 개선안 제안
  suggestImprovements();
  
} catch (error) {
  console.error('❌ 시뮬레이션 실행 중 오류:', error);
}
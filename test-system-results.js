// 🧪 Phase 4 시스템 통합 테스트 - 10개 지역 결과물 생성
// 실제 API 호출을 통한 전체 시스템 검증

const testLocations = [
  {
    name: "경복궁",
    language: "ko",
    behaviorData: {
      scrollSpeed: 120,
      clickFrequency: 8,
      dwellTime: 45,
      interactionDepth: 3,
      mouseMovements: 150,
      readingPatterns: "detailed"
    },
    userProfile: {
      demographics: {
        age: 28,
        country: "south_korea",
        language: "ko",
        travelStyle: "cultural",
        techSavviness: 4
      }
    }
  },
  {
    name: "에펠탑",
    language: "ko",
    behaviorData: {
      scrollSpeed: 95,
      clickFrequency: 12,
      dwellTime: 60,
      interactionDepth: 4,
      mouseMovements: 200,
      readingPatterns: "exploratory"
    },
    userProfile: {
      demographics: {
        age: 32,
        country: "south_korea",
        language: "ko",
        travelStyle: "adventure",
        techSavviness: 5
      }
    }
  },
  {
    name: "마추픽추",
    language: "ko",
    behaviorData: {
      scrollSpeed: 80,
      clickFrequency: 6,
      dwellTime: 90,
      interactionDepth: 5,
      mouseMovements: 100,
      readingPatterns: "thorough"
    },
    userProfile: {
      demographics: {
        age: 45,
        country: "south_korea",
        language: "ko",
        travelStyle: "historical",
        techSavviness: 3
      }
    }
  },
  {
    name: "후시미 이나리 신사",
    language: "ko",
    behaviorData: {
      scrollSpeed: 110,
      clickFrequency: 10,
      dwellTime: 35,
      interactionDepth: 2,
      mouseMovements: 180,
      readingPatterns: "quick"
    },
    userProfile: {
      demographics: {
        age: 24,
        country: "south_korea",
        language: "ko",
        travelStyle: "photography",
        techSavviness: 5
      }
    }
  },
  {
    name: "타임스 스퀘어",
    language: "ko",
    behaviorData: {
      scrollSpeed: 140,
      clickFrequency: 15,
      dwellTime: 25,
      interactionDepth: 2,
      mouseMovements: 250,
      readingPatterns: "scanning"
    },
    userProfile: {
      demographics: {
        age: 26,
        country: "south_korea",
        language: "ko",
        travelStyle: "urban",
        techSavviness: 5
      }
    }
  },
  {
    name: "산토리니",
    language: "ko",
    behaviorData: {
      scrollSpeed: 70,
      clickFrequency: 5,
      dwellTime: 120,
      interactionDepth: 4,
      mouseMovements: 80,
      readingPatterns: "immersive"
    },
    userProfile: {
      demographics: {
        age: 35,
        country: "south_korea",
        language: "ko",
        travelStyle: "relaxation",
        techSavviness: 3
      }
    }
  },
  {
    name: "앙코르와트",
    language: "ko",
    behaviorData: {
      scrollSpeed: 85,
      clickFrequency: 7,
      dwellTime: 75,
      interactionDepth: 5,
      mouseMovements: 120,
      readingPatterns: "analytical"
    },
    userProfile: {
      demographics: {
        age: 42,
        country: "south_korea",
        language: "ko",
        travelStyle: "spiritual",
        techSavviness: 3
      }
    }
  },
  {
    name: "그랜드 캐니언",
    language: "ko",
    behaviorData: {
      scrollSpeed: 100,
      clickFrequency: 9,
      dwellTime: 50,
      interactionDepth: 3,
      mouseMovements: 160,
      readingPatterns: "visual"
    },
    userProfile: {
      demographics: {
        age: 38,
        country: "south_korea",
        language: "ko",
        travelStyle: "nature",
        techSavviness: 4
      }
    }
  },
  {
    name: "바르셀로나 사그라다 파밀리아",
    language: "ko",
    behaviorData: {
      scrollSpeed: 90,
      clickFrequency: 11,
      dwellTime: 65,
      interactionDepth: 4,
      mouseMovements: 140,
      readingPatterns: "architectural"
    },
    userProfile: {
      demographics: {
        age: 40,
        country: "south_korea",
        language: "ko",
        travelStyle: "art_architecture",
        techSavviness: 4
      }
    }
  },
  {
    name: "킬리만자로",
    language: "ko",
    behaviorData: {
      scrollSpeed: 75,
      clickFrequency: 6,
      dwellTime: 100,
      interactionDepth: 5,
      mouseMovements: 90,
      readingPatterns: "preparation"
    },
    userProfile: {
      demographics: {
        age: 30,
        country: "south_korea",
        language: "ko",
        travelStyle: "adventure_extreme",
        techSavviness: 4
      }
    }
  }
];

async function testSystemWithLocation(location) {
  const startTime = Date.now();
  console.log(`\n🧪 테스트 시작: ${location.name}`);
  console.log(`👤 사용자 프로필: ${location.userProfile.demographics.age}세, ${location.userProfile.demographics.travelStyle} 스타일`);
  
  try {
    const response = await fetch('http://localhost:3000/api/node/ai/generate-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: location.name,
        language: location.language,
        behaviorData: location.behaviorData,
        userProfile: location.userProfile,
        forceRegenerate: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ ${location.name} 처리 완료 (${processingTime}ms)`);
    
    // Phase 4 통합 결과 분석
    if (result.success && result.data) {
      console.log(`🌍 Phase 2 다국어 시스템: ${result.phase2_multilingual_integration?.personality_system || 'N/A'}`);
      console.log(`📍 Phase 3 위치 시스템: ${result.phase3_location_system?.location_tracking || 'N/A'}`);
      console.log(`🎙️ Phase 4 음성 시스템: ${result.phase4_voice_commentary?.tts_system || 'N/A'}`);
      console.log(`🎯 목표 만족도: ${result.mega_optimization?.satisfaction_expected || 'N/A'}`);
      
      // 콘텐츠 품질 확인
      const content = result.data.content;
      if (content && content.realTimeGuide && content.realTimeGuide.chapters) {
        console.log(`📚 생성된 챕터 수: ${content.realTimeGuide.chapters.length}`);
        console.log(`📖 첫 번째 챕터: ${content.realTimeGuide.chapters[0]?.title || 'N/A'}`);
        
        // Phase 2 다국어 적응 확인
        if (result.phase2_multilingual_integration) {
          const multiInfo = result.phase2_multilingual_integration;
          console.log(`🧠 감지된 성격: ${multiInfo.personality_detected} (신뢰도: ${(multiInfo.confidence_level * 100).toFixed(1)}%)`);
          console.log(`🌐 현지화 수준: ${(multiInfo.localization_level * 100).toFixed(1)}%`);
          console.log(`⚡ 처리 시간: ${multiInfo.processing_time}ms`);
        }
      }
      
      return {
        success: true,
        location: location.name,
        processingTime,
        chaptersCount: content?.realTimeGuide?.chapters?.length || 0,
        personalityDetected: result.phase2_multilingual_integration?.personality_detected,
        satisfactionExpected: result.mega_optimization?.satisfaction_expected,
        phases: {
          phase1: result.data?.content ? 'active' : 'inactive',
          phase2: result.phase2_multilingual_integration?.personality_system || 'inactive',
          phase3: result.phase3_location_system?.location_tracking || 'inactive', 
          phase4: result.phase4_voice_commentary?.tts_system || 'inactive'
        }
      };
    } else {
      throw new Error(result.error || '알 수 없는 오류');
    }
    
  } catch (error) {
    console.error(`❌ ${location.name} 테스트 실패:`, error.message);
    return {
      success: false,
      location: location.name,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

async function runAllTests() {
  console.log('🚀 Phase 4 통합 시스템 테스트 시작...');
  console.log(`📊 테스트 대상: ${testLocations.length}개 지역`);
  console.log('=' .repeat(60));
  
  const results = [];
  const startTime = Date.now();
  
  for (const location of testLocations) {
    const result = await testSystemWithLocation(location);
    results.push(result);
    
    // 요청 간 간격 (API 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  const totalTime = Date.now() - startTime;
  
  // 결과 요약
  console.log('\n' + '=' .repeat(60));
  console.log('📊 테스트 결과 요약');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ 성공: ${successful.length}/${testLocations.length} (${(successful.length / testLocations.length * 100).toFixed(1)}%)`);
  console.log(`❌ 실패: ${failed.length}/${testLocations.length}`);
  console.log(`⏱️ 총 처리 시간: ${(totalTime / 1000).toFixed(1)}초`);
  console.log(`⚡ 평균 처리 시간: ${(totalTime / testLocations.length / 1000).toFixed(1)}초/지역`);
  
  if (successful.length > 0) {
    console.log('\n🎯 성공한 테스트들:');
    successful.forEach(result => {
      console.log(`  📍 ${result.location}: ${result.processingTime}ms, ${result.chaptersCount}챕터, ${result.personalityDetected} 성격`);
      console.log(`     Phase 상태 - P1:${result.phases.phase1}, P2:${result.phases.phase2}, P3:${result.phases.phase3}, P4:${result.phases.phase4}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 실패한 테스트들:');
    failed.forEach(result => {
      console.log(`  📍 ${result.location}: ${result.error} (${result.processingTime}ms)`);
    });
  }
  
  // Phase 4 통합도 분석
  const phaseStats = {
    phase1: successful.filter(r => r.phases.phase1 === 'active').length,
    phase2: successful.filter(r => r.phases.phase2 === 'active').length,
    phase3: successful.filter(r => r.phases.phase3 === 'active').length,
    phase4: successful.filter(r => r.phases.phase4 === 'integrated').length
  };
  
  console.log('\n🔧 Phase별 통합 현황:');
  console.log(`  Phase 1 (성격 시스템): ${phaseStats.phase1}/${successful.length} (${(phaseStats.phase1/successful.length*100).toFixed(1)}%)`);
  console.log(`  Phase 2 (다국어 시스템): ${phaseStats.phase2}/${successful.length} (${(phaseStats.phase2/successful.length*100).toFixed(1)}%)`);
  console.log(`  Phase 3 (위치 시스템): ${phaseStats.phase3}/${successful.length} (${(phaseStats.phase3/successful.length*100).toFixed(1)}%)`);
  console.log(`  Phase 4 (음성 시스템): ${phaseStats.phase4}/${successful.length} (${(phaseStats.phase4/successful.length*100).toFixed(1)}%)`);
  
  return {
    totalTests: testLocations.length,
    successful: successful.length,
    failed: failed.length,
    successRate: successful.length / testLocations.length,
    totalTime,
    averageTime: totalTime / testLocations.length,
    phaseStats,
    results
  };
}

// Node.js 환경에서 실행
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testLocations };
}

// 브라우저에서 직접 실행 가능
if (typeof window !== 'undefined') {
  window.runPhase4Tests = runAllTests;
}
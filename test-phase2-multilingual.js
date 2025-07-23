// 🌍 Phase 2 다국어 성격 적응 시스템 테스트

const testPhase2MultilingualSystem = async () => {
  console.log('🌍 Phase 2 다국어 성격 적응 시스템 테스트 시작...');
  
  const testCases = [
    {
      location: '에펠탑',
      language: 'ko',
      description: '한국어 기본 테스트'
    },
    {
      location: 'Eiffel Tower',
      language: 'en',
      description: '영어 다국어 적응 테스트'
    },
    {
      location: '富士山',
      language: 'ja',
      description: '일본어 다국어 적응 테스트'
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🎯 테스트: ${testCase.description} (${testCase.language})`);
    
    try {
      const response = await fetch('http://localhost:3000/api/node/ai/generate-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationName: testCase.location,
          language: testCase.language,
          forceRegenerate: true,
          userProfile: {
            demographics: {
              age: 30,
              country: testCase.language === 'ko' ? 'south_korea' : 'usa',
              language: testCase.language,
              travelStyle: 'cultural',
              techSavviness: 3
            },
            usage: {
              sessionsPerMonth: 5,
              avgSessionDuration: 20,
              preferredContentLength: 'medium',
              deviceType: 'mobile'
            },
            satisfaction: {
              overall: 90,
              accuracy: 92,
              storytelling: 88,
              cultural_respect: 95,
              speed: 85
            }
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Phase 2 시스템 확인
        const phase2Info = data.phase2_multilingual_integration;
        const hasMultilingualMetrics = data.data?.content?.multilingualMetrics;
        
        const result = {
          testCase: testCase.description,
          language: testCase.language,
          success: data.success,
          
          // Phase 1 성격 시스템 확인
          phase1_active: phase2Info?.personality_system === 'active',
          personality_detected: phase2Info?.personality_detected || 'unknown',
          confidence_level: phase2Info?.confidence_level || 0,
          
          // Phase 2 다국어 시스템 확인
          phase2_active: phase2Info?.multilingual_system === 'active',
          target_language: phase2Info?.target_language || testCase.language,
          localization_level: phase2Info?.localization_level || 0,
          cultural_adaptation: hasMultilingualMetrics?.culturalAdaptation || {},
          linguistic_quality: hasMultilingualMetrics?.linguisticQuality || {},
          
          // 통합 시스템 성능
          processing_time: phase2Info?.processing_time || 0,
          quality_score: phase2Info?.quality_score || 0,
          satisfaction_expected: data.mega_optimization?.satisfaction_expected || '0%',
          
          // 실제 콘텐츠 샘플
          content_sample: data.data?.content?.overview?.title || 'N/A',
          chapter_count: data.data?.content?.realTimeGuide?.chapters?.length || 0
        };
        
        results.push(result);
        
        console.log(`✅ ${testCase.description} 성공:`);
        console.log(`   - Phase 1 성격 시스템: ${result.phase1_active ? '활성' : '비활성'}`);
        console.log(`   - 감지된 성격: ${result.personality_detected} (신뢰도: ${(result.confidence_level * 100).toFixed(1)}%)`);
        console.log(`   - Phase 2 다국어 시스템: ${result.phase2_active ? '활성' : '비활성'}`);
        console.log(`   - 현지화 수준: ${(result.localization_level * 100).toFixed(1)}%`);
        console.log(`   - 품질 점수: ${result.quality_score}점`);
        console.log(`   - 처리 시간: ${result.processing_time.toFixed(0)}ms`);
        console.log(`   - 챕터 수: ${result.chapter_count}개`);
        console.log(`   - 예상 만족도: ${result.satisfaction_expected}`);
        
      } else {
        console.error(`❌ ${testCase.description} 실패: ${response.status}`);
        results.push({
          testCase: testCase.description,
          language: testCase.language,
          success: false,
          error: `HTTP ${response.status}`
        });
      }
      
    } catch (error) {
      console.error(`❌ ${testCase.description} 오류:`, error.message);
      results.push({
        testCase: testCase.description,
        language: testCase.language,
        success: false,
        error: error.message
      });
    }
    
    // 요청 간 간격
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 결과 요약
  console.log('\n📊 Phase 2 다국어 성격 적응 시스템 테스트 결과 요약:');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`전체 테스트: ${totalCount}개`);
  console.log(`성공: ${successCount}개 (${((successCount/totalCount) * 100).toFixed(1)}%)`);
  console.log(`실패: ${totalCount - successCount}개`);
  
  if (successCount > 0) {
    const avgLocalization = results
      .filter(r => r.success && r.localization_level)
      .reduce((sum, r) => sum + r.localization_level, 0) / successCount;
    
    const avgQuality = results
      .filter(r => r.success && r.quality_score)
      .reduce((sum, r) => sum + r.quality_score, 0) / successCount;
    
    console.log(`\n🎯 Phase 2 성능 지표:`);
    console.log(`평균 현지화 수준: ${(avgLocalization * 100).toFixed(1)}%`);
    console.log(`평균 품질 점수: ${avgQuality.toFixed(1)}점`);
    
    const phase1Active = results.filter(r => r.phase1_active).length;
    const phase2Active = results.filter(r => r.phase2_active).length;
    
    console.log(`\n🔧 시스템 활성화 상태:`);
    console.log(`Phase 1 성격 시스템: ${phase1Active}/${totalCount} (${((phase1Active/totalCount) * 100).toFixed(1)}%)`);
    console.log(`Phase 2 다국어 시스템: ${phase2Active}/${totalCount} (${((phase2Active/totalCount) * 100).toFixed(1)}%)`);
  }
  
  // 상세 결과 출력
  console.log('\n📋 상세 결과:');
  console.log('-'.repeat(60));
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.testCase} (${result.language})`);
    if (result.success) {
      console.log(`   ✅ 성공 - 성격: ${result.personality_detected}, 현지화: ${(result.localization_level * 100).toFixed(1)}%, 품질: ${result.quality_score}점`);
    } else {
      console.log(`   ❌ 실패 - ${result.error}`);
    }
  });
  
  console.log(`\n🎉 Phase 2 다국어 성격 적응 시스템 테스트 완료!`);
  return results;
};

// 테스트 실행
if (require.main === module) {
  testPhase2MultilingualSystem()
    .then(results => {
      process.exit(0);
    })
    .catch(error => {
      console.error('테스트 실행 중 오류:', error);
      process.exit(1);
    });
}

module.exports = { testPhase2MultilingualSystem };
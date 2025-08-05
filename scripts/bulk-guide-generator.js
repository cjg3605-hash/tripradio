// 57개 명소 × 5개 언어 = 285개 가이드 배치 생성 스크립트
// 기존 /api/node/ai/generate-guide API를 사용하여 고품질 가이드 생성

const fs = require('fs');
const path = require('path');

// 57개 명소 데이터 (메인 페이지에서 추출)
const attractions = {
  korea: [
    { name: '경복궁', location: 'Seoul, Korea' },
    { name: '남산타워', location: 'Seoul, Korea' },
    { name: '명동', location: 'Seoul, Korea' },
    { name: '해운대해수욕장', location: 'Busan, Korea' },
    { name: '감천문화마을', location: 'Busan, Korea' },
    { name: '자갈치시장', location: 'Busan, Korea' },
    { name: '한라산', location: 'Jeju, Korea' },
    { name: '성산일출봉', location: 'Jeju, Korea' },
    { name: '중문관광단지', location: 'Jeju, Korea' },
    { name: '불국사', location: 'Gyeongju, Korea' },
    { name: '석굴암', location: 'Gyeongju, Korea' },
    { name: '첨성대', location: 'Gyeongju, Korea' }
  ],
  europe: [
    { name: 'Eiffel Tower', location: 'Paris, France' },
    { name: 'Louvre Museum', location: 'Paris, France' },
    { name: 'Palace of Versailles', location: 'Versailles, France' },
    { name: 'Colosseum', location: 'Rome, Italy' },
    { name: 'Leaning Tower of Pisa', location: 'Pisa, Italy' },
    { name: 'Vatican', location: 'Vatican City' },
    { name: 'Sagrada Familia', location: 'Barcelona, Spain' },
    { name: 'Alhambra', location: 'Granada, Spain' },
    { name: 'Park Güell', location: 'Barcelona, Spain' },
    { name: 'Big Ben', location: 'London, UK' },
    { name: 'Tower Bridge', location: 'London, UK' },
    { name: 'Buckingham Palace', location: 'London, UK' },
    { name: 'Brandenburg Gate', location: 'Berlin, Germany' },
    { name: 'Neuschwanstein Castle', location: 'Bavaria, Germany' },
    { name: 'Cologne Cathedral', location: 'Cologne, Germany' }
  ],
  asia: [
    { name: 'Mount Fuji', location: 'Japan' },
    { name: 'Kiyomizu-dera', location: 'Kyoto, Japan' },
    { name: 'Senso-ji', location: 'Tokyo, Japan' },
    { name: 'Great Wall', location: 'Beijing, China' },
    { name: 'Forbidden City', location: 'Beijing, China' },
    { name: 'Tiananmen Square', location: 'Beijing, China' },
    { name: 'Taj Mahal', location: 'Agra, India' },
    { name: 'Red Fort', location: 'Delhi, India' },
    { name: 'Ganges River', location: 'Varanasi, India' },
    { name: 'Wat Arun', location: 'Bangkok, Thailand' },
    { name: 'Grand Palace', location: 'Bangkok, Thailand' },
    { name: 'Wat Pho', location: 'Bangkok, Thailand' },
    { name: 'Marina Bay Sands', location: 'Singapore' },
    { name: 'Gardens by the Bay', location: 'Singapore' },
    { name: 'Merlion', location: 'Singapore' }
  ],
  americas: [
    { name: 'Statue of Liberty', location: 'New York, USA' },
    { name: 'Grand Canyon', location: 'Arizona, USA' },
    { name: 'Times Square', location: 'New York, USA' },
    { name: 'Niagara Falls', location: 'Canada' },
    { name: 'CN Tower', location: 'Toronto, Canada' },
    { name: 'Banff National Park', location: 'Alberta, Canada' },
    { name: 'Christ the Redeemer', location: 'Rio de Janeiro, Brazil' },
    { name: 'Iguazu Falls', location: 'Brazil/Argentina' },
    { name: 'Maracanã Stadium', location: 'Rio de Janeiro, Brazil' },
    { name: 'Machu Picchu', location: 'Cusco, Peru' },
    { name: 'Cusco', location: 'Peru' },
    { name: 'Nazca Lines', location: 'Peru' },
    { name: 'Chichen Itza', location: 'Yucatan, Mexico' },
    { name: 'Teotihuacan', location: 'Mexico City, Mexico' },
    { name: 'Cancun', location: 'Quintana Roo, Mexico' }
  ]
};

// 5개 언어 설정
const languages = ['ko', 'en', 'ja', 'zh', 'es'];

// 모든 명소를 하나의 배열로 통합 (총 57개)
const allAttractions = Object.values(attractions).flat();

console.log(`🎯 총 ${allAttractions.length}개 명소 × ${languages.length}개 언어 = ${allAttractions.length * languages.length}개 가이드 생성 예정`);

// 실제 가이드 생성 함수
async function generateGuide(attractionName, language) {
  try {
    console.log(`🔄 생성 중: ${attractionName} (${language})`);
    
    const response = await fetch('http://localhost:3002/api/node/ai/generate-guide/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: attractionName,
        language: language,
        forceRegenerate: false, // 기존 가이드가 있으면 재사용
        generationMode: 'autonomous', // 전체 가이드 생성
        userProfile: {
          demographics: {
            age: 35,
            country: language === 'ko' ? 'south_korea' : language === 'en' ? 'usa' : language === 'ja' ? 'japan' : language === 'zh' ? 'china' : language === 'es' ? 'spain' : 'usa',
            language: language,
            travelStyle: 'cultural',
            techSavviness: 3
          },
          usage: {
            sessionsPerMonth: 2,
            avgSessionDuration: 15,
            preferredContentLength: 'medium',
            deviceType: 'mobile'
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ 성공: ${attractionName} (${language}) - ${result.cached || 'new'}`);
      return { 
        success: true, 
        attraction: attractionName, 
        language: language,
        cached: result.cached,
        data: result.data
      };
    } else {
      console.error(`❌ 실패: ${attractionName} (${language}) - ${result.error}`);
      return { 
        success: false, 
        attraction: attractionName, 
        language: language,
        error: result.error
      };
    }
  } catch (error) {
    console.error(`❌ 오류: ${attractionName} (${language}) - ${error.message}`);
    return { 
      success: false, 
      attraction: attractionName, 
      language: language,
      error: error.message
    };
  }
}

// 배치 생성 실행 함수 (단계별 실행)
async function runBulkGeneration(options = {}) {
  const {
    batchSize = 5, // 동시 처리할 가이드 수
    delayBetweenBatches = 2000, // 배치 간 대기 시간 (ms)
    maxRetries = 3, // 실패시 재시도 횟수
    startFromIndex = 0, // 시작 인덱스 (중단된 지점부터 재시작용)
    languages: targetLanguages = languages, // 생성할 언어들
    onlyMissing = true // 기존 가이드가 없는 것만 생성
  } = options;

  console.log('🚀 배치 가이드 생성 시작');
  console.log(`📊 설정: 배치크기=${batchSize}, 지연=${delayBetweenBatches}ms, 재시도=${maxRetries}회`);
  
  const results = {
    total: 0,
    success: 0,
    failed: 0,
    cached: 0,
    details: []
  };

  let globalIndex = 0;

  // 각 명소별로 언어들 처리
  for (let i = 0; i < allAttractions.length; i++) {
    const attraction = allAttractions[i];
    
    console.log(`\n📍 ${i + 1}/${allAttractions.length}: ${attraction.name}`);
    
    // 해당 명소의 모든 언어 가이드를 배치로 생성
    for (let langIndex = 0; langIndex < targetLanguages.length; langIndex += batchSize) {
      const languageBatch = targetLanguages.slice(langIndex, langIndex + batchSize);
      
      // 현재 배치의 가이드 생성 요청들을 병렬로 실행
      const batchPromises = languageBatch.map(async (language) => {
        if (globalIndex < startFromIndex) {
          globalIndex++;
          return null; // 건너뛰기
        }
        
        globalIndex++;
        results.total++;
        
        // 재시도 로직
        for (let retry = 0; retry <= maxRetries; retry++) {
          const result = await generateGuide(attraction.name, language);
          
          if (result.success) {
            if (result.cached === 'hit' || result.cached === 'mega_hit') {
              results.cached++;
            } else {
              results.success++;
            }
            results.details.push(result);
            return result;
          } else if (retry === maxRetries) {
            // 최대 재시도 후에도 실패
            results.failed++;
            results.details.push(result);
            return result;
          } else {
            console.log(`🔄 재시도 ${retry + 1}/${maxRetries}: ${attraction.name} (${language})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1))); // 재시도 대기
          }
        }
      });

      // 배치 실행 및 결과 수집
      const batchResults = (await Promise.all(batchPromises)).filter(r => r !== null);
      
      // 배치 간 대기 (API 부하 방지)
      if (langIndex + batchSize < targetLanguages.length || i + 1 < allAttractions.length) {
        console.log(`⏳ 다음 배치까지 ${delayBetweenBatches}ms 대기...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  }

  return results;
}

// 진행 상황 저장 함수
function saveProgress(results, filename = 'bulk-generation-progress.json') {
  const progressData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      success: results.success,
      failed: results.failed,
      cached: results.cached,
      completion_rate: `${((results.success + results.cached) / results.total * 100).toFixed(1)}%`
    },
    details: results.details
  };
  
  fs.writeFileSync(filename, JSON.stringify(progressData, null, 2));
  console.log(`💾 진행 상황 저장됨: ${filename}`);
}

// 실패한 가이드 재생성 함수
async function retryFailedGuides(progressFile = 'bulk-generation-progress.json') {
  try {
    const progressData = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    const failedGuides = progressData.details.filter(detail => !detail.success);
    
    if (failedGuides.length === 0) {
      console.log('✅ 실패한 가이드가 없습니다!');
      return;
    }
    
    console.log(`🔄 ${failedGuides.length}개의 실패한 가이드 재시도 중...`);
    
    const retryResults = {
      total: failedGuides.length,
      success: 0,
      failed: 0,
      cached: 0,
      details: []
    };
    
    for (const failed of failedGuides) {
      const result = await generateGuide(failed.attraction, failed.language);
      
      if (result.success) {
        if (result.cached === 'hit' || result.cached === 'mega_hit') {
          retryResults.cached++;
        } else {
          retryResults.success++;
        }
      } else {
        retryResults.failed++;
      }
      
      retryResults.details.push(result);
      
      // 재시도 간 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    saveProgress(retryResults, 'retry-results.json');
    console.log('🔄 재시도 완료');
    return retryResults;
    
  } catch (error) {
    console.error('❌ 재시도 중 오류:', error);
  }
}

// 명령줄 인터페이스
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';
  
  switch (command) {
    case 'run':
      // 전체 생성 실행
      runBulkGeneration({
        batchSize: parseInt(args[1]) || 3, // 동시 처리 수 줄임 (안정성)
        delayBetweenBatches: parseInt(args[2]) || 3000, // 대기 시간 늘림
        maxRetries: parseInt(args[3]) || 2,
        startFromIndex: parseInt(args[4]) || 0
      }).then(results => {
        console.log('\n🎉 배치 생성 완료!');
        console.log(`📊 전체: ${results.total}개`);
        console.log(`✅ 성공: ${results.success}개`);
        console.log(`💾 캐시됨: ${results.cached}개`);
        console.log(`❌ 실패: ${results.failed}개`);
        console.log(`📈 완료율: ${((results.success + results.cached) / results.total * 100).toFixed(1)}%`);
        
        saveProgress(results);
      }).catch(console.error);
      break;
      
    case 'retry':
      // 실패한 가이드들 재시도
      retryFailedGuides(args[1]).then(results => {
        if (results) {
          console.log('\n🔄 재시도 완료!');
          console.log(`📊 재시도: ${results.total}개`);
          console.log(`✅ 성공: ${results.success}개`);
          console.log(`💾 캐시됨: ${results.cached}개`);
          console.log(`❌ 여전히 실패: ${results.failed}개`);
        }
      }).catch(console.error);
      break;
      
    case 'status':
      // 진행 상황 확인
      try {
        const progressData = JSON.parse(fs.readFileSync(args[1] || 'bulk-generation-progress.json', 'utf8'));
        console.log('📊 진행 상황:');
        console.log(`⏰ 마지막 업데이트: ${progressData.timestamp}`);
        console.log(`📈 완료율: ${progressData.summary.completion_rate}`);
        console.log(`✅ 성공: ${progressData.summary.success}개`);
        console.log(`💾 캐시됨: ${progressData.summary.cached}개`);
        console.log(`❌ 실패: ${progressData.summary.failed}개`);
        
        const failedGuides = progressData.details.filter(d => !d.success);
        if (failedGuides.length > 0) {
          console.log('\n❌ 실패한 가이드들:');
          failedGuides.forEach(f => console.log(`  - ${f.attraction} (${f.language}): ${f.error}`));
        }
      } catch (error) {
        console.error('❌ 진행 상황 파일을 읽을 수 없습니다:', error.message);
      }
      break;
      
    default:
      console.log(`
🎯 57개 명소 × 5개 언어 배치 가이드 생성기

사용법:
  node bulk-guide-generator.js run [batchSize] [delay] [maxRetries] [startIndex]
  node bulk-guide-generator.js retry [progressFile]
  node bulk-guide-generator.js status [progressFile]

예시:
  node bulk-guide-generator.js run 3 3000 2 0    # 3개씩 배치, 3초 대기, 2회 재시도
  node bulk-guide-generator.js retry             # 실패한 가이드들 재시도
  node bulk-guide-generator.js status            # 진행 상황 확인
      `);
  }
}

module.exports = {
  allAttractions,
  languages,
  generateGuide,
  runBulkGeneration,
  retryFailedGuides,
  saveProgress
};
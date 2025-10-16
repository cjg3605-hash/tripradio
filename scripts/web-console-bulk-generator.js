// 웹사이트 개발자 콘솔에서 실행하는 57개 명소 × 5개 언어 배치 생성 스크립트
// 사용법: 웹사이트(localhost:3002)에서 F12 → Console 탭 → 이 스크립트 복사 붙여넣기 → 엔터

console.log('🎯 NaviDocent 배치 가이드 생성기 로드됨');

// 57개 명소 데이터 (메인 페이지와 동일)
const attractions = [
  // Korea (12개)
  '경복궁', '남산타워', '명동', '해운대해수욕장', '감천문화마을', '자갈치시장', 
  '한라산', '성산일출봉', '중문관광단지', '불국사', '석굴암', '첨성대',
  
  // Europe (15개)
  'Eiffel Tower', 'Louvre Museum', 'Palace of Versailles', 'Colosseum', 
  'Leaning Tower of Pisa', 'Vatican', 'Sagrada Familia', 'Alhambra', 
  'Park Güell', 'Big Ben', 'Tower Bridge', 'Buckingham Palace', 
  'Brandenburg Gate', 'Neuschwanstein Castle', 'Cologne Cathedral',
  
  // Asia (15개)
  'Mount Fuji', 'Kiyomizu-dera', 'Senso-ji', 'Great Wall', 'Forbidden City', 
  'Tiananmen Square', 'Taj Mahal', 'Red Fort', 'Ganges River', 'Wat Arun', 
  'Grand Palace', 'Wat Pho', 'Marina Bay Sands', 'Gardens by the Bay', 'Merlion',
  
  // Americas (15개)
  'Statue of Liberty', 'Grand Canyon', 'Times Square', 'Niagara Falls', 
  'CN Tower', 'Banff National Park', 'Christ the Redeemer', 'Iguazu Falls', 
  'Maracanã Stadium', 'Machu Picchu', 'Cusco', 'Nazca Lines', 
  'Chichen Itza', 'Teotihuacan', 'Cancun'
];

// 5개 언어
const languages = ['ko', 'en', 'ja', 'zh', 'es'];

console.log(`📊 총 ${attractions.length}개 명소 × ${languages.length}개 언어 = ${attractions.length * languages.length}개 가이드 생성 예정`);

// 전역 상태 관리
window.bulkGeneration = {
  isRunning: false,
  currentIndex: 0,
  results: {
    total: 0,
    success: 0,
    cached: 0,
    failed: 0,
    details: []
  },
  startTime: null
};

// 단일 가이드 생성 함수
async function generateSingleGuide(attractionName, language) {
  try {
    console.log(`🔄 생성 중: ${attractionName} (${language})`);
    
    const response = await fetch('/api/node/ai/generate-guide/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: attractionName,
        language: language,
        forceRegenerate: false,
        generationMode: 'autonomous',
        userProfile: {
          demographics: {
            age: 35,
            country: language === 'ko' ? 'south_korea' : 
                     language === 'ja' ? 'japan' : 
                     language === 'zh' ? 'china' : 
                     language === 'es' ? 'spain' : 'usa',
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
      const status = result.cached === 'hit' || result.cached === 'mega_hit' ? 'cached' : 'new';
      console.log(`✅ 성공: ${attractionName} (${language}) - ${status}`);
      return { 
        success: true, 
        attraction: attractionName, 
        language: language,
        status: status,
        cached: result.cached
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

// 진행 상황 출력
function printProgress() {
  const { results, currentIndex } = window.bulkGeneration;
  const totalTasks = attractions.length * languages.length;
  const completionRate = (currentIndex / totalTasks * 100).toFixed(1);
  const elapsedTime = window.bulkGeneration.startTime ? 
    ((Date.now() - window.bulkGeneration.startTime) / 1000).toFixed(1) : 0;
  
  console.log(`\n📊 진행 상황: ${currentIndex}/${totalTasks} (${completionRate}%)`);
  console.log(`⏱️  소요 시간: ${elapsedTime}초`);
  console.log(`✅ 성공: ${results.success}개`);
  console.log(`💾 캐시됨: ${results.cached}개`);
  console.log(`❌ 실패: ${results.failed}개`);
  
  if (results.failed > 0) {
    const failedItems = results.details.filter(d => !d.success);
    console.log(`❌ 실패 목록:`, failedItems.map(f => `${f.attraction}(${f.language})`));
  }
}

// 메인 배치 생성 함수
async function runBulkGeneration(options = {}) {
  const {
    delayBetweenRequests = 2000, // 요청 간 대기 시간 (ms)
    startFromIndex = 0, // 시작 인덱스
    batchSize = 10, // 진행 상황 출력 간격
    targetLanguages = languages // 생성할 언어들
  } = options;

  if (window.bulkGeneration.isRunning) {
    console.log('❌ 이미 배치 생성이 실행 중입니다.');
    return;
  }

  console.log('🚀 배치 가이드 생성 시작');
  console.log(`📊 설정: 지연=${delayBetweenRequests}ms, 시작=${startFromIndex}`);
  
  window.bulkGeneration.isRunning = true;
  window.bulkGeneration.startTime = Date.now();
  window.bulkGeneration.currentIndex = startFromIndex;
  
  const { results } = window.bulkGeneration;
  
  // 각 명소별로 언어들 처리
  for (let i = 0; i < attractions.length; i++) {
    if (!window.bulkGeneration.isRunning) {
      console.log('⏹️ 사용자에 의해 중단됨');
      break;
    }
    
    const attraction = attractions[i];
    console.log(`\n📍 ${i + 1}/${attractions.length}: ${attraction}`);
    
    // 각 언어별 가이드 생성
    for (let j = 0; j < targetLanguages.length; j++) {
      if (!window.bulkGeneration.isRunning) break;
      
      const globalIndex = i * targetLanguages.length + j;
      if (globalIndex < startFromIndex) {
        window.bulkGeneration.currentIndex++;
        continue;
      }
      
      const language = targetLanguages[j];
      results.total++;
      window.bulkGeneration.currentIndex++;
      
      const result = await generateSingleGuide(attraction, language);
      results.details.push(result);
      
      if (result.success) {
        if (result.status === 'cached') {
          results.cached++;
        } else {
          results.success++;
        }
      } else {
        results.failed++;
      }
      
      // 진행 상황 출력 (배치마다)
      if (results.total % batchSize === 0) {
        printProgress();
      }
      
      // 다음 요청 전 대기 (마지막 요청이 아닌 경우)
      if (i < attractions.length - 1 || j < targetLanguages.length - 1) {
        console.log(`⏳ ${delayBetweenRequests}ms 대기...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }
  }
  
  window.bulkGeneration.isRunning = false;
  
  // 최종 결과
  console.log('\n🎉 배치 생성 완료!');
  printProgress();
  
  const totalTime = (Date.now() - window.bulkGeneration.startTime) / 1000;
  console.log(`⏱️  총 소요 시간: ${totalTime.toFixed(1)}초`);
  console.log(`📈 완료율: ${((results.success + results.cached) / results.total * 100).toFixed(1)}%`);
  
  return results;
}

// 중단 함수
function stopBulkGeneration() {
  window.bulkGeneration.isRunning = false;
  console.log('⏹️ 배치 생성 중단 요청됨');
}

// 실패한 가이드 재시도 함수
async function retryFailedGuides() {
  const failedGuides = window.bulkGeneration.results.details.filter(d => !d.success);
  
  if (failedGuides.length === 0) {
    console.log('✅ 실패한 가이드가 없습니다!');
    return;
  }
  
  console.log(`🔄 ${failedGuides.length}개의 실패한 가이드 재시도 중...`);
  
  for (const failed of failedGuides) {
    if (!window.bulkGeneration.isRunning) break;
    
    const result = await generateSingleGuide(failed.attraction, failed.language);
    
    // 기존 결과 업데이트
    const index = window.bulkGeneration.results.details.findIndex(
      d => d.attraction === failed.attraction && d.language === failed.language
    );
    
    if (index !== -1) {
      window.bulkGeneration.results.details[index] = result;
      
      if (result.success) {
        window.bulkGeneration.results.failed--;
        if (result.status === 'cached') {
          window.bulkGeneration.results.cached++;
        } else {
          window.bulkGeneration.results.success++;
        }
        console.log(`✅ 재시도 성공: ${failed.attraction} (${failed.language})`);
      } else {
        console.log(`❌ 재시도 실패: ${failed.attraction} (${failed.language})`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🔄 재시도 완료');
  printProgress();
}

// 상태 확인 함수
function checkStatus() {
  printProgress();
  console.log(`🏃 실행 중: ${window.bulkGeneration.isRunning ? '예' : '아니오'}`);
}

// 사용법 안내
console.log(`
🎯 NaviDocent 배치 가이드 생성기 사용법

1. 전체 생성 시작:
   runBulkGeneration()

2. 옵션 설정:
   runBulkGeneration({
     delayBetweenRequests: 3000,  // 3초 대기
     startFromIndex: 50,          // 50번째부터 시작
     targetLanguages: ['ko', 'en'] // 한국어, 영어만
   })

3. 진행 상황 확인:
   checkStatus()

4. 중단:
   stopBulkGeneration()

5. 실패한 가이드 재시도:
   retryFailedGuides()

6. 현재 설정 확인:
   console.log(window.bulkGeneration)

이제 runBulkGeneration() 명령어를 입력하여 시작하세요!
`);

// 전역 함수로 등록
window.runBulkGeneration = runBulkGeneration;
window.stopBulkGeneration = stopBulkGeneration;
window.retryFailedGuides = retryFailedGuides;
window.checkStatus = checkStatus;
// 좌표 검색 1~4순위 디버깅 스크립트
const { findCoordinatesInOrder } = require('./src/lib/coordinates/coordinate-utils.ts');
require('dotenv').config({ path: '.env.local' });

async function testCoordinateSearch() {
  try {
    console.log('🔍 좌표 검색 시스템 디버깅 시작...\n');
    
    // 테스트 케이스들
    const testCases = [
      {
        name: '용궁사',
        context: {
          locationName: '용궁사',
          parentRegion: '완도군',
          countryCode: 'KR',
          language: 'ko'
        }
      },
      {
        name: 'Times Square',
        context: {
          locationName: 'Times Square',
          parentRegion: 'New York',
          countryCode: 'US',
          language: 'en'
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🎯 테스트: ${testCase.name}`);
      console.log('컨텍스트:', testCase.context);
      
      try {
        const result = await findCoordinatesInOrder(testCase.name, testCase.context);
        console.log(`✅ 결과: ${result.lat}, ${result.lng}`);
        
        // 결과 검증
        if (testCase.name === '용궁사') {
          const isSeoul = Math.abs(result.lat - 37.5665) < 0.01 && Math.abs(result.lng - 126.978) < 0.01;
          if (isSeoul) {
            console.log('❌ 서울 좌표로 잘못 검색됨! (1~4순위 모두 실패)');
          } else {
            console.log('✅ 정확한 용궁사 좌표 검색 성공');
          }
        }
        
        if (testCase.name === 'Times Square') {
          const isKorea = result.lat > 33 && result.lat < 39 && result.lng > 124 && result.lng < 132;
          if (isKorea) {
            console.log('❌ 한국 좌표로 잘못 검색됨! (1~4순위 모두 실패)');
          } else {
            console.log('✅ 정확한 뉴욕 타임스퀘어 좌표 검색 성공');
          }
        }
        
      } catch (error) {
        console.error(`❌ 검색 실패: ${testCase.name}`, error.message);
      }
      
      console.log('─'.repeat(50));
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 오류:', error);
  }
}

// 테스트 실행
testCoordinateSearch();
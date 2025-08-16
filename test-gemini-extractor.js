/**
 * Gemini 전세계 지역정보 추출 시스템 테스트
 */

const { extractLocationForDB, extractLocationInfoWithGemini } = require('./src/lib/location/gemini-location-extractor');

async function testGeminiExtractor() {
  console.log('🧪 Gemini 전세계 지역정보 추출 시스템 테스트 시작\n');
  
  const testCases = [
    '구엘저택',
    '구엘궁',
    '구엘공원', 
    '사그라다파밀리아',
    'Palau Güell',
    'Park Güell',
    '대왕궁',
    '타지마할',
    '마추픽추',
    '콜로세움',
    '에펠탑',
    '자유의여신상',
    '스핑크스',
    '루브르박물관'
  ];
  
  for (const testCase of testCases) {
    console.log(`🔍 테스트: "${testCase}"`);
    
    try {
      // 1. DB용 간소화된 데이터 추출 테스트
      const dbResult = await extractLocationForDB(testCase, 'ko');
      
      if (dbResult) {
        console.log(`  ✅ DB 데이터:`, dbResult);
        
        // 결과 검증
        const isValid = dbResult.location_region && 
                       dbResult.country_code && 
                       dbResult.country_code.length === 3 &&
                       dbResult.country_code !== 'UNK';
        
        if (isValid) {
          console.log(`  🎯 검증 성공: 유효한 지역정보`);
        } else {
          console.log(`  ❌ 검증 실패: 무효한 데이터`);
        }
      } else {
        console.log(`  ❌ DB 데이터 추출 실패`);
      }
      
    } catch (error) {
      console.log(`  ❌ 오류: ${error.message}`);
    }
    
    console.log('');
    
    // API 호출 제한을 위한 대기
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('🎯 테스트 완료');
}

// 모듈이 직접 실행될 때만 테스트 실행
if (require.main === module) {
  testGeminiExtractor().catch(console.error);
}

module.exports = { testGeminiExtractor };
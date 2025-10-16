/**
 * 영어 검색 로직 테스트
 */

const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// 영어 변환 함수 (officialData.ts에서 복사)
function convertLocationToEnglish(locationName) {
  let english = locationName;
  
  // 한국어 → 영어
  english = english
    .replace(/역/g, ' Station')
    .replace(/(\d+)번\s*출구/g, 'Exit $1')
    .replace(/출구/g, 'Exit')
    .replace(/입구/g, 'Entrance')
    .replace(/매표소/g, 'Ticket Office')
    .replace(/센터/g, 'Center')
    .replace(/공원/g, 'Park')
    .replace(/박물관/g, 'Museum')
    .replace(/궁/g, 'Palace')
    .replace(/시장/g, 'Market')
    .replace(/다리/g, 'Bridge');
    
  // 일본어 → 영어
  english = english
    .replace(/駅/g, ' Station')
    .replace(/(\d+)番出口/g, 'Exit $1')
    .replace(/出口/g, 'Exit');
    
  // 중국어 → 영어  
  english = english
    .replace(/车站|地铁站/g, ' Station')
    .replace(/(\d+)号出口/g, 'Exit $1')
    .replace(/出口/g, 'Exit');
  
  return english.trim();
}

async function testEnglishSearch() {
  console.log('🧪 영어 검색 로직 테스트\n');

  const testCases = [
    '명동역 8번 출구',
    '경복궁 매표소', 
    '부산역',
    '홍대입구역',
    '신세계백화점',
    '새宿駅 東口',      // 일본어
    '北京地铁站',        // 중국어
    'Myeongdong'        // 영어 (변환 안됨)
  ];

  const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!googleApiKey) {
    console.error('❌ Google API 키가 없습니다!');
    return;
  }

  for (const testCase of testCases) {
    console.log(`\n🔍 테스트: "${testCase}"`);
    
    // 영어 변환
    const englishVersion = convertLocationToEnglish(testCase);
    console.log(`   영어 변환: "${englishVersion}"`);
    
    // 실제 API 검색 (영어 버전)
    try {
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
      const fullUrl = `${url}?input=${encodeURIComponent(englishVersion)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${googleApiKey}`;
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.candidates?.length > 0) {
        const candidate = data.candidates[0];
        console.log(`   ✅ 검색 성공: ${candidate.name}`);
        console.log(`   📍 좌표: ${candidate.geometry.location.lat}, ${candidate.geometry.location.lng}`);
        console.log(`   📧 주소: ${candidate.formatted_address}`);
      } else {
        console.log(`   ❌ 검색 실패: ${data.status} - ${data.error_message || '결과 없음'}`);
      }
    } catch (error) {
      console.log(`   ❌ API 오류: ${error.message}`);
    }
    
    // API 제한 고려
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 실행
testEnglishSearch();
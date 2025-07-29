/**
 * 문화재청/국가유산청 API 테스트
 */

async function testHeritageAPIs() {
  console.log('🏛️ 문화재 관련 API 테스트');
  console.log('='.repeat(60));
  
  // 1. 기존 문화재청 API 테스트 (www.cha.go.kr)
  console.log('\n1️⃣ 기존 문화재청 API 테스트');
  console.log('-'.repeat(40));
  
  try {
    const oldUrl = 'http://www.cha.go.kr/cha/SearchKindOpenapiList.do';
    console.log('📡 요청 URL:', oldUrl);
    
    const response1 = await fetch(oldUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-Test/1.0'
      }
    });
    
    console.log('📊 응답 상태:', response1.status, response1.statusText);
    
    if (response1.ok) {
      const text = await response1.text();
      console.log('✅ 연결 성공');
      console.log('📄 응답 내용 (처음 200자):', text.substring(0, 200));
      
      if (text.includes('API') || text.includes('검색')) {
        console.log('🎯 API 서비스 가능성 있음');
      } else {
        console.log('❓ API 서비스 불확실');
      }
    } else {
      console.log('❌ 연결 실패');
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 2. 공공데이터포털 문화재 관련 API 검색
  console.log('\n2️⃣ 공공데이터포털 검색');
  console.log('-'.repeat(40));
  
  const possibleAPIs = [
    {
      name: '국가유산청 문화재 공간정보',
      testUrl: 'https://api.odcloud.kr/api/heritage-space',
      description: '새로운 국가유산청 API (예상)'
    },
    {
      name: '문화재청 문화유산정보',
      testUrl: 'https://www.heritage.go.kr/api',
      description: '문화재청 공식 API (예상)'
    },
    {
      name: '국가문화유산포털',
      testUrl: 'https://www.heritage.go.kr/heri/cul/culSelectView.do',
      description: '포털 사이트'
    }
  ];
  
  for (const api of possibleAPIs) {
    console.log(`\n🔍 ${api.name} 테스트`);
    console.log(`📄 설명: ${api.description}`);
    
    try {
      const response = await fetch(api.testUrl, {
        timeout: 8000,
        headers: {
          'User-Agent': 'GuideAI-Test/1.0'
        }
      });
      
      console.log(`📊 ${api.testUrl}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`✅ ${api.name}: 접근 가능`);
        
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('json')) {
          console.log('📦 JSON API 가능성 높음');
        } else if (contentType.includes('html')) {
          console.log('📄 웹 페이지 (API 문서 확인 필요)');
        }
      } else {
        console.log(`❌ ${api.name}: 접근 불가`);
      }
    } catch (error) {
      console.log(`❌ ${api.name}: 연결 실패 (${error.message})`);
    }
  }
  
  // 3. 공공데이터포털 직접 검색 URL들
  console.log('\n3️⃣ 확인해야 할 공공데이터 API들');
  console.log('-'.repeat(40));
  
  const searchTerms = [
    '국가유산청 문화재 공간정보',
    '문화재청 국가문화유산포털',
    '문화재 검색',
    '문화유산 정보',
    '국가지정문화재'
  ];
  
  console.log('🔍 공공데이터포털에서 검색해야 할 키워드들:');
  searchTerms.forEach((term, index) => {
    console.log(`   ${index + 1}. "${term}"`);
  });
  
  console.log('\n📞 확인 방법:');
  console.log('1. https://www.data.go.kr/ 접속');
  console.log('2. 위 키워드들로 검색');
  console.log('3. API 신청 및 키 발급');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 문화재 API 테스트 완료');
  console.log('='.repeat(60));
  
  console.log('\n💡 **권장사항**:');
  console.log('1. 공공데이터포털에서 "국가유산청" 검색');
  console.log('2. 최신 문화재 관련 API 확인');
  console.log('3. 기존 문화재청 API 대체 방안 검토');
  console.log('4. 필요시 API 키 추가 발급');
}

// 실행
testHeritageAPIs().catch(console.error);
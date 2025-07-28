/**
 * KOSIS API 올바른 엔드포인트 찾기
 */

const KOSIS_API_KEY = 'MGYyMDI2M2MzNDUyZmJjNDRlNjQyZTRlNWY0OGY1OTE=';

async function findCorrectKOSISEndpoint() {
  console.log('🔍 KOSIS API 올바른 엔드포인트 찾기');
  console.log('='.repeat(60));
  
  // KOSIS API의 일반적인 엔드포인트들 테스트
  const endpoints = [
    {
      name: 'statisticsList (현재)',
      url: 'https://kosis.kr/openapi/statisticsList.do',
      params: {
        method: 'getList',
        apiKey: KOSIS_API_KEY,
        format: 'json'
      }
    },
    {
      name: 'Param/statisticsList',
      url: 'https://kosis.kr/openapi/Param/statisticsList.do',
      params: {
        method: 'getList',
        apiKey: KOSIS_API_KEY,
        format: 'json'
      }
    },
    {
      name: 'statisticsSearch',
      url: 'https://kosis.kr/openapi/statisticsSearch.do',
      params: {
        method: 'getList',
        apiKey: KOSIS_API_KEY,
        format: 'json'
      }
    },
    {
      name: 'statSearch (간단)',
      url: 'https://kosis.kr/openapi/statSearch.do',
      params: {
        apiKey: KOSIS_API_KEY,
        format: 'json'
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🧪 테스트: ${endpoint.name}`);
    console.log('-'.repeat(40));
    
    try {
      const params = new URLSearchParams(endpoint.params);
      const fullUrl = `${endpoint.url}?${params}`;
      
      console.log('📡 URL:', fullUrl.replace(KOSIS_API_KEY, 'API_KEY_HIDDEN'));
      
      const response = await fetch(fullUrl, {
        timeout: 8000,
        headers: {
          'User-Agent': 'GuideAI-Test/1.0',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      
      console.log(`📊 ${endpoint.name}: ${response.status} ${response.statusText}`);
      console.log(`📦 Content-Type: ${response.headers.get('content-type')}`);
      
      const responseText = await response.text();
      console.log('📄 응답 (처음 200자):', responseText.substring(0, 200));
      
      // JSON 형태인지 확인
      if (responseText.startsWith('{') && responseText.endsWith('}')) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('✅ 유효한 JSON 응답');
          
          if (jsonData.err) {
            console.log(`   에러 코드: ${jsonData.err}`);
            console.log(`   에러 메시지: ${jsonData.errMsg}`);
          } else {
            console.log('✅ 성공적인 응답');
          }
        } catch (jsonError) {
          console.log('❌ JSON 파싱 실패');
        }
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name} 에러: ${error.message}`);
    }
    
    // 요청 간 간격
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 특정 통계표 ID로 테스트
  console.log('\n🎯 특정 통계표 ID로 테스트');
  console.log('-'.repeat(40));
  
  try {
    const specificParams = new URLSearchParams({
      method: 'getList',
      apiKey: KOSIS_API_KEY,
      format: 'json',
      userStatsId: 'DT_1YL20631', // 관광업 현황 통계
      prdSe: 'Y', // 연간
      startPrdDe: '2020',
      endPrdDe: '2023'
    });
    
    const specificUrl = `https://kosis.kr/openapi/statisticsList.do?${specificParams}`;
    console.log('📡 특정 통계 URL:', specificUrl.replace(KOSIS_API_KEY, 'API_KEY_HIDDEN'));
    
    const specificResponse = await fetch(specificUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-Test/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log('📊 특정 통계:', specificResponse.status, specificResponse.statusText);
    const specificText = await specificResponse.text();
    console.log('📄 특정 통계 응답:', specificText.substring(0, 300));
    
  } catch (error) {
    console.log('❌ 특정 통계 에러:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 **KOSIS API 사용법 결론**:');
  console.log('1. API 키는 유효하지만 파라미터 구조가 특수함');
  console.log('2. 응답이 완전한 JSON이 아닌 JavaScript 객체 형태');
  console.log('3. GuideAI에서는 보조 데이터로만 활용 권장');
  console.log('4. 다른 메인 API들(관광공사, Google Places)을 우선으로 구현');
  console.log('='.repeat(60));
}

// 실행
findCorrectKOSISEndpoint().catch(console.error);
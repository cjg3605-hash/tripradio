/**
 * KOSIS API 응답 내용 디버그
 */

const KOSIS_API_KEY = 'MGYyMDI2M2MzNDUyZmJjNDRlNjQyZTRlNWY0OGY1OTE=';

async function debugKOSISResponse() {
  console.log('🔍 KOSIS API 응답 내용 디버그');
  console.log('='.repeat(60));
  
  try {
    // 가장 간단한 요청
    const params = new URLSearchParams({
      method: 'getList',
      apiKey: KOSIS_API_KEY,
      format: 'json'
    });
    
    const url = `https://kosis.kr/openapi/statisticsList.do?${params}`;
    console.log('📡 요청 URL:', url.replace(KOSIS_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-Debug/1.0',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    console.log('📦 Content-Type:', response.headers.get('content-type'));
    console.log('📦 Content-Length:', response.headers.get('content-length'));
    
    // 응답을 텍스트로 먼저 확인
    const responseText = await response.text();
    console.log('📄 응답 내용 (처음 500자):');
    console.log(responseText.substring(0, 500));
    console.log('...');
    
    // 마지막 500자도 확인
    if (responseText.length > 500) {
      console.log('📄 응답 내용 (마지막 500자):');
      console.log('...');
      console.log(responseText.substring(responseText.length - 500));
    }
    
    // JSON 파싱 시도
    try {
      const jsonData = JSON.parse(responseText);
      console.log('✅ JSON 파싱 성공');
      console.log('📊 JSON 구조:', typeof jsonData);
      
      if (jsonData.err) {
        console.log('⚠️ API 에러 코드:', jsonData.err);
        console.log('⚠️ 에러 메시지:', jsonData.errMsg);
      }
    } catch (jsonError) {
      console.log('❌ JSON 파싱 실패:', jsonError.message);
      
      // HTML 응답인지 확인
      if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        console.log('🔍 HTML 응답 감지됨 - 웹페이지가 반환됨');
      }
      
      // XML 응답인지 확인
      if (responseText.includes('<?xml') || responseText.includes('<root>')) {
        console.log('🔍 XML 응답 감지됨 - XML 형식으로 반환됨');
      }
      
      // 에러 메시지 패턴 확인
      if (responseText.includes('error') || responseText.includes('Error')) {
        console.log('🔍 에러 메시지 패턴 감지됨');
      }
    }
    
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 KOSIS API 응답 디버그 완료');
  console.log('='.repeat(60));
}

// 실행
debugKOSISResponse().catch(console.error);
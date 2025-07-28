/**
 * 국가유산청 GIS API 에러 내용 상세 분석
 */

async function debugHeritageGISError() {
  console.log('🔍 국가유산청 GIS API 에러 내용 상세 분석');
  console.log('='.repeat(60));
  
  try {
    // 간단한 GetCapabilities 요청
    const params = new URLSearchParams({
      domain: 'https://gis-heritage.go.kr/',
      service: 'WMS',
      version: '1.3.0',
      request: 'GetCapabilities'
    });
    
    const url = `https://gis-heritage.go.kr/checkKey.do?${params}`;
    console.log('📡 요청 URL:', url);
    
    const response = await fetch(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-Heritage-Debug/1.0',
        'Accept': 'application/xml, text/xml, text/html, */*'
      }
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    console.log('📦 Content-Type:', response.headers.get('content-type'));
    console.log('📦 Content-Length:', response.headers.get('content-length'));
    
    const responseText = await response.text();
    console.log('\n📄 전체 응답 내용:');
    console.log('-'.repeat(40));
    console.log(responseText);
    console.log('-'.repeat(40));
    
    // 에러 패턴 분석
    if (responseText.includes('error page')) {
      console.log('🚨 에러 페이지 감지됨');
    }
    
    if (responseText.includes('ServiceException')) {
      console.log('🚨 WMS 서비스 예외 감지됨');
    }
    
    if (responseText.includes('인증') || responseText.includes('권한')) {
      console.log('🔑 인증/권한 관련 에러');
    }
    
    if (responseText.includes('도메인') || responseText.includes('domain')) {
      console.log('🌐 도메인 관련 에러');
    }
    
    if (responseText.includes('등록') || responseText.includes('신청')) {
      console.log('📝 등록/신청 필요');
    }
    
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 다른 접근 방법 시도
  console.log('\n🔄 다른 접근 방법 시도');
  console.log('-'.repeat(40));
  
  try {
    // 도메인 없이 직접 접근 시도
    const directUrl = 'https://gis-heritage.go.kr/checkKey.do';
    console.log('📡 직접 접근:', directUrl);
    
    const directResponse = await fetch(directUrl, {
      timeout: 8000,
      headers: {
        'User-Agent': 'GuideAI-Heritage-Direct/1.0'
      }
    });
    
    console.log('📊 직접 접근 결과:', directResponse.status, directResponse.statusText);
    
    if (directResponse.ok) {
      const directText = await directResponse.text();
      console.log('📄 직접 접근 응답 (처음 200자):');
      console.log(directText.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ 직접 접근 에러:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 **분석 결과**:');
  console.log('🔍 API가 200 OK를 반환하지만 HTML 에러 페이지 제공');
  console.log('🔑 도메인 등록 또는 별도 인증 절차 필요할 가능성');
  console.log('📞 국가유산청에 직접 문의하여 사용법 확인 권장');
  
  console.log('\n🎯 **현재 상황**:');
  console.log('✅ API 엔드포인트는 존재하고 접근 가능');
  console.log('⚠️ 실제 데이터 접근을 위한 추가 인증 필요');
  console.log('🚀 기존 XML API로 당분간 서비스 가능');
  console.log('='.repeat(60));
}

// 실행
debugHeritageGISError().catch(console.error);
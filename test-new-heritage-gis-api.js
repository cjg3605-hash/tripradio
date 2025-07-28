/**
 * 국가유산청 새로운 GIS API 테스트
 * https://www.gis-heritage.go.kr/openapi/
 */

async function testNewHeritageGISAPI() {
  console.log('🏛️ 국가유산청 새로운 GIS API 테스트');
  console.log('='.repeat(60));
  
  // 1. API 키 체크 엔드포인트 테스트
  console.log('\n1️⃣ API 키 체크 엔드포인트 테스트');
  console.log('-'.repeat(40));
  
  try {
    const checkUrl = 'https://gis-heritage.go.kr/checkKey.do';
    console.log('📡 요청 URL:', checkUrl);
    
    const params = new URLSearchParams({
      domain: 'https://gis-heritage.go.kr/',
      service: 'WMS',
      version: '1.3.0',
      request: 'GetCapabilities'
    });
    
    const fullUrl = `${checkUrl}?${params}`;
    
    const response1 = await fetch(fullUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-Test/1.0',
        'Accept': 'application/xml, text/xml, */*'
      }
    });
    
    console.log('📊 응답 상태:', response1.status, response1.statusText);
    console.log('📦 Content-Type:', response1.headers.get('content-type'));
    
    if (response1.ok) {
      const text = await response1.text();
      console.log('✅ API 접근 성공');
      console.log('📄 응답 내용 (처음 300자):');
      console.log(text.substring(0, 300));
      
      // WMS Capabilities 정보 확인
      if (text.includes('WMS_Capabilities') || text.includes('GetMap')) {
        console.log('🎯 WMS 서비스 확인됨');
      }
      if (text.includes('heritage') || text.includes('문화')) {
        console.log('🏛️ 문화유산 관련 데이터 확인됨');
      }
    } else {
      console.log('❌ API 접근 실패');
      const errorText = await response1.text();
      console.log('에러 내용:', errorText.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 2. WFS 서비스 테스트 (데이터 조회용)
  console.log('\n2️⃣ WFS 서비스 테스트 (데이터 조회)');
  console.log('-'.repeat(40));
  
  try {
    const wfsUrl = 'https://www.gis-heritage.go.kr/openapi/xmlService/spca.do';
    console.log('📡 WFS URL:', wfsUrl);
    
    const wfsParams = new URLSearchParams({
      service: 'WFS',
      version: '1.1.0',
      request: 'GetCapabilities'
    });
    
    const wfsFullUrl = `${wfsUrl}?${wfsParams}`;
    
    const response2 = await fetch(wfsFullUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-Test/1.0',
        'Accept': 'application/xml, text/xml'
      }
    });
    
    console.log('📊 WFS 응답 상태:', response2.status, response2.statusText);
    
    if (response2.ok) {
      const wfsText = await response2.text();
      console.log('✅ WFS 서비스 접근 성공');
      console.log('📄 WFS 응답 (처음 300자):');
      console.log(wfsText.substring(0, 300));
      
      // Feature 타입 확인
      if (wfsText.includes('FeatureType') || wfsText.includes('국가지정')) {
        console.log('🎯 국가유산 Feature 데이터 확인됨');
      }
    } else {
      console.log('❌ WFS 접근 실패');
    }
  } catch (error) {
    console.log('❌ WFS 네트워크 에러:', error.message);
  }
  
  // 3. 사용 가능한 레이어 정보
  console.log('\n3️⃣ 제공되는 데이터 레이어');
  console.log('-'.repeat(40));
  
  const layers = [
    { code: 'TB_ODTR_MID', name: '국가지정유산 지정구역' },
    { code: 'TB_OUSR_MID', name: '국가지정유산 보호구역' },
    { code: 'TB_MDQT_MID', name: '시도지정유산 지정구역' },
    { code: 'TB_MUSQ_MID', name: '시도지정유산 보호구역' },
    { code: 'TB_HRNR_MID', name: '현상변경 허용기준' },
    { code: 'TB_SHOV_MID', name: '문화유적분포지도' },
    { code: 'TB_ERHT_MID', name: '국가유산조사구역' },
    { code: 'TB_THFS_MID', name: '등록문화유산' }
  ];
  
  console.log('🗺️ 사용 가능한 레이어들:');
  layers.forEach((layer, index) => {
    console.log(`   ${index + 1}. ${layer.code}: ${layer.name}`);
  });
  
  // 4. API 키 필요성 확인
  console.log('\n4️⃣ API 키 필요성 및 신청 방법');
  console.log('-'.repeat(40));
  
  console.log('🔑 API 키 정보:');
  console.log('- 이 서비스는 도메인 기반 인증을 사용하는 것으로 보임');
  console.log('- domain 파라미터가 필요: domain=https://gis-heritage.go.kr/');
  console.log('- 실제 사용을 위해서는 도메인 등록이 필요할 수 있음');
  
  console.log('\n📞 신청 방법 (예상):');
  console.log('1. 국가유산청 또는 공공데이터포털 접속');
  console.log('2. "국가유산청 GIS API" 또는 "문화재 공간정보" 검색');
  console.log('3. 도메인 등록 및 API 키 신청');
  
  // 5. 데이터 활용 방안
  console.log('\n5️⃣ GuideAI 활용 방안');
  console.log('-'.repeat(40));
  
  console.log('🎯 활용 가능성:');
  console.log('✅ 정확한 문화재 위치 정보 (GIS 좌표)');
  console.log('✅ 지정구역/보호구역 경계 정보');
  console.log('✅ 국가/시도 지정 문화재 구분');
  console.log('✅ 등록문화유산 정보');
  console.log('✅ 문화유적 분포 정보');
  
  console.log('\n🔧 구현 방법:');
  console.log('1. WFS GetFeature 요청으로 속성 데이터 조회');
  console.log('2. 좌표 기반 문화재 검색 구현');
  console.log('3. 기존 XML API와 병행 사용');
  console.log('4. 더 정확한 위치 기반 가이드 생성');
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 국가유산청 GIS API 테스트 완료');
  console.log('='.repeat(60));
  
  console.log('\n💡 **다음 단계**:');
  console.log('1. 공공데이터포털에서 "국가유산청 GIS" 또는 "문화재 공간정보" 검색');
  console.log('2. API 키 또는 도메인 등록 신청');
  console.log('3. 실제 데이터 조회 테스트');
  console.log('4. 기존 시스템과 통합');
}

// 실행
testNewHeritageGISAPI().catch(console.error);
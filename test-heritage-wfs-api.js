/**
 * 국가유산청 WFS API 테스트
 * https://gis-heritage.go.kr/openapi/xmlService/spca.do 방식
 */

async function testHeritageWFSAPI() {
  console.log('🏛️ 국가유산청 WFS API 테스트');
  console.log('='.repeat(70));
  
  // 1. 기본 WFS 요청 (ccbaKdcd 파라미터 포함)
  console.log('\n1️⃣ WFS 기본 요청 - ccbaKdcd=79 방식');
  console.log('-'.repeat(50));
  
  try {
    const basicParams = new URLSearchParams({
      ccbaKdcd: '79' // 사용자 제안 파라미터
    });
    
    const basicUrl = `https://gis-heritage.go.kr/openapi/xmlService/spca.do?${basicParams}`;
    console.log('📡 기본 WFS URL:', basicUrl);
    
    const basicResponse = await fetch(basicUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'GuideAI-Heritage-WFS/1.0',
        'Accept': 'application/xml, text/xml, */*'
      }
    });
    
    console.log('📊 기본 WFS 응답:', basicResponse.status, basicResponse.statusText);
    console.log('📦 Content-Type:', basicResponse.headers.get('content-type'));
    console.log('📦 Content-Length:', basicResponse.headers.get('content-length'));
    
    if (basicResponse.ok) {
      const basicText = await basicResponse.text();
      console.log('✅ WFS 요청 성공');
      console.log('📄 응답 내용 (처음 500자):');
      console.log(basicText.substring(0, 500));
      console.log('...');
      
      if (basicText.includes('<?xml')) {
        console.log('🎯 유효한 XML 응답 확인됨');
        
        // 문화재 데이터 패턴 확인
        if (basicText.includes('ccbaKdcd') || basicText.includes('문화재') || basicText.includes('heritage')) {
          console.log('🏛️ 문화재 데이터 패턴 발견됨');
        }
        
        // Feature 데이터 확인
        if (basicText.includes('feature') || basicText.includes('gml:') || basicText.includes('coordinates')) {
          console.log('📍 GIS Feature 데이터 확인됨');
        }
      }
      
    } else {
      const errorText = await basicResponse.text();
      console.log('❌ WFS 요청 실패');
      console.log('에러 내용 (처음 300자):', errorText.substring(0, 300));
    }
  } catch (error) {
    console.log('❌ WFS 기본 요청 에러:', error.message);
  }
  
  // 2. 다양한 ccbaKdcd 값으로 테스트
  console.log('\n2️⃣ 다양한 문화재 분류 코드 테스트');
  console.log('-'.repeat(50));
  
  const culturalCodes = [
    { code: '11', name: '국보' },
    { code: '12', name: '보물' },
    { code: '13', name: '사적' },
    { code: '14', name: '사적및명승' },
    { code: '15', name: '명승' },
    { code: '16', name: '천연기념물' },
    { code: '17', name: '국가무형문화재' },
    { code: '79', name: '등록문화재' }
  ];
  
  for (const cultural of culturalCodes) {
    console.log(`\n🔍 ${cultural.name} (코드: ${cultural.code}) 테스트`);
    
    try {
      const codeParams = new URLSearchParams({
        ccbaKdcd: cultural.code
      });
      
      const codeUrl = `https://gis-heritage.go.kr/openapi/xmlService/spca.do?${codeParams}`;
      
      const codeResponse = await fetch(codeUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GuideAI-Heritage-WFS/1.0',
          'Accept': 'application/xml'
        }
      });
      
      console.log(`   📊 ${cultural.name}: ${codeResponse.status} ${codeResponse.statusText}`);
      
      if (codeResponse.ok) {
        const codeText = await codeResponse.text();
        
        if (codeText.includes('<?xml')) {
          console.log(`   ✅ ${cultural.name} XML 응답 성공`);
          
          // 데이터 개수 추정
          const featureCount = (codeText.match(/feature/gi) || []).length;
          const itemCount = (codeText.match(/<item>/gi) || []).length;
          const recordCount = Math.max(featureCount, itemCount);
          
          if (recordCount > 0) {
            console.log(`   📈 ${cultural.name} 데이터: 약 ${recordCount}개 항목`);
          }
          
          // 샘플 데이터 확인
          if (codeText.length > 100) {
            console.log(`   📄 응답 크기: ${codeText.length} 문자`);
          }
        } else {
          console.log(`   ⚠️ ${cultural.name} XML이 아닌 응답`);
        }
      } else {
        console.log(`   ❌ ${cultural.name} 요청 실패: ${codeResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${cultural.name} 에러: ${error.message}`);
    }
    
    // 요청 간 간격 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. WFS GetFeature 표준 방식도 시도
  console.log('\n3️⃣ WFS GetFeature 표준 방식 테스트');
  console.log('-'.repeat(50));
  
  try {
    const wfsParams = new URLSearchParams({
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: 'heritage:cultural_properties', // 예상 타입명
      outputFormat: 'application/xml',
      maxFeatures: '10'
    });
    
    const wfsUrl = `https://gis-heritage.go.kr/openapi/xmlService/spca.do?${wfsParams}`;
    console.log('📡 WFS GetFeature URL:', wfsUrl);
    
    const wfsResponse = await fetch(wfsUrl, {
      timeout: 12000,
      headers: {
        'User-Agent': 'GuideAI-Heritage-WFS/1.0',
        'Accept': 'application/xml'
      }
    });
    
    console.log('📊 WFS GetFeature 응답:', wfsResponse.status, wfsResponse.statusText);
    
    if (wfsResponse.ok) {
      const wfsText = await wfsResponse.text();
      console.log('✅ WFS GetFeature 성공');
      console.log('📄 응답 (처음 300자):', wfsText.substring(0, 300));
    }
  } catch (error) {
    console.log('❌ WFS GetFeature 에러:', error.message);
  }
  
  // 4. 지역 코드 추가 테스트
  console.log('\n4️⃣ 지역 코드 조합 테스트');
  console.log('-'.repeat(50));
  
  try {
    const regionParams = new URLSearchParams({
      ccbaKdcd: '11', // 국보
      ccbaCtcd: '11'  // 서울 (추정)
    });
    
    const regionUrl = `https://gis-heritage.go.kr/openapi/xmlService/spca.do?${regionParams}`;
    console.log('📡 지역+분류 URL:', regionUrl);
    
    const regionResponse = await fetch(regionUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'GuideAI-Heritage-WFS/1.0',
        'Accept': 'application/xml'
      }
    });
    
    console.log('📊 지역+분류 응답:', regionResponse.status, regionResponse.statusText);
    
    if (regionResponse.ok) {
      const regionText = await regionResponse.text();
      console.log('✅ 지역+분류 조합 성공');
      console.log('📄 응답 길이:', regionText.length, '문자');
      
      if (regionText.includes('서울') || regionText.includes('Seoul')) {
        console.log('🎯 서울 지역 문화재 데이터 확인됨');
      }
    }
  } catch (error) {
    console.log('❌ 지역+분류 조합 에러:', error.message);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 국가유산청 WFS API 테스트 완료');
  console.log('='.repeat(70));
  
  console.log('\n💡 **결론**:');
  console.log('✅ WFS 방식으로 직접 데이터 접근 시도');
  console.log('✅ 다양한 문화재 분류 코드 테스트');
  console.log('✅ 표준 WFS 프로토콜도 병행 테스트');
  console.log('🔍 실제 데이터 응답 여부 확인 필요');
  
  console.log('\n🚀 **GuideAI 통합 방안** (성공 시):');
  console.log('1. 문화재 분류별 정확한 데이터 수집');
  console.log('2. 지역별 필터링으로 위치 기반 검색');
  console.log('3. 기존 XML API와 병행하여 데이터 품질 향상');
  console.log('4. GIS 좌표 정보로 정확한 위치 서비스');
}

// 실행
testHeritageWFSAPI().catch(console.error);
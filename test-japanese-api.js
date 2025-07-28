/**
 * 일본어 API 테스트 (별도 키)
 */

const JAPANESE_API_KEY = 'pa3L/mjkcW1Gf8SbqRAZC5yshY2Q6rweXTYhNA/ZVxx9an2VGDF0rvCDReXc5XrfvdhSKIKCYNomxJbq4jwNGQ==';

async function testJapaneseAPI() {
  console.log('🇯🇵 일본어 API 테스트 (별도 키)');
  console.log('='.repeat(50));
  
  // 1. 지역코드 조회 테스트
  console.log('\n1️⃣ 지역코드 조회 테스트');
  try {
    const params1 = new URLSearchParams({
      serviceKey: JAPANESE_API_KEY,
      numOfRows: '5',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json'
    });
    
    const url1 = `https://apis.data.go.kr/B551011/JpnService2/areaCode1?${params1}`;
    console.log('요청 URL:', url1.replace(JAPANESE_API_KEY, 'API_KEY_HIDDEN'));
    
    const response1 = await fetch(url1);
    console.log('응답 상태:', response1.status, response1.statusText);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ 지역코드 조회 성공!');
      console.log('응답 데이터 샘플:', JSON.stringify(data1, null, 2).substring(0, 300) + '...');
    } else {
      const errorText1 = await response1.text();
      console.log('❌ 지역코드 조회 실패');
      console.log('에러 응답:', errorText1.substring(0, 500));
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 2. 키워드 검색 테스트 (일본어 키워드)
  console.log('\n2️⃣ 키워드 검색 테스트 (경복궁 - 일본어)');
  try {
    const params2 = new URLSearchParams({
      serviceKey: JAPANESE_API_KEY,
      numOfRows: '5',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json',
      keyword: '景福宮' // 일본어로 경복궁
    });
    
    const url2 = `https://apis.data.go.kr/B551011/JpnService2/searchKeyword2?${params2}`;
    console.log('요청 URL:', url2.replace(JAPANESE_API_KEY, 'API_KEY_HIDDEN'));
    console.log('키워드: "景福宮" (일본어)');
    
    const response2 = await fetch(url2);
    console.log('응답 상태:', response2.status, response2.statusText);
    console.log('응답 헤더 Content-Type:', response2.headers.get('content-type'));
    
    if (response2.ok) {
      const contentType = response2.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const data2 = await response2.json();
        console.log('✅ JSON 응답 성공!');
        
        const items = data2.response?.body?.items?.item || [];
        const itemArray = Array.isArray(items) ? items : (items ? [items] : []);
        
        console.log(`📊 검색 결과 수: ${itemArray.length}개`);
        
        if (itemArray.length > 0) {
          const firstItem = itemArray[0];
          console.log('📍 첫 번째 결과:');
          console.log(`   제목: ${firstItem.title}`);
          console.log(`   주소: ${firstItem.addr1}`);
          console.log(`   좌표: ${firstItem.mapx}, ${firstItem.mapy}`);
        }
      } else {
        // XML 응답 처리
        const xmlText = await response2.text();
        console.log('📄 XML 응답 받음');
        console.log('XML 내용 (처음 300자):', xmlText.substring(0, 300));
        
        // XML에서 에러 확인
        if (xmlText.includes('Policy Falsified')) {
          console.log('❌ Policy Falsified 오류 - API 접근 제한');
        } else if (xmlText.includes('<item>')) {
          console.log('✅ XML 데이터 포함 - 파싱 필요');
        }
      }
      
    } else {
      const errorText2 = await response2.text();
      console.log('❌ 키워드 검색 실패');
      console.log('에러 응답:', errorText2.substring(0, 500));
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 3. 영어 키워드로도 테스트
  console.log('\n3️⃣ 키워드 검색 테스트 (Gyeongbokgung - 영어)');
  try {
    const params3 = new URLSearchParams({
      serviceKey: JAPANESE_API_KEY,
      numOfRows: '3',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json',
      keyword: 'Gyeongbokgung'
    });
    
    const url3 = `https://apis.data.go.kr/B551011/JpnService2/searchKeyword2?${params3}`;
    console.log('키워드: "Gyeongbokgung" (영어)');
    
    const response3 = await fetch(url3);
    console.log('응답 상태:', response3.status, response3.statusText);
    
    if (response3.ok) {
      const contentType = response3.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const data3 = await response3.json();
        const items = data3.response?.body?.items?.item || [];
        const itemArray = Array.isArray(items) ? items : (items ? [items] : []);
        
        console.log(`✅ 성공! 결과 ${itemArray.length}개`);
        
        if (itemArray.length > 0) {
          const firstItem = itemArray[0];
          console.log('📍 첫 번째 결과:');
          console.log(`   제목: ${firstItem.title}`);
          console.log(`   주소: ${firstItem.addr1}`);
        }
      } else {
        const xmlText = await response3.text();
        console.log('📄 XML 응답:', xmlText.substring(0, 200));
      }
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 일본어 API 테스트 완료!');
}

// 실행
testJapaneseAPI().catch(console.error);
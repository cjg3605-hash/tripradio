/**
 * 한국관광공사 API 키 테스트
 */

const API_KEY = 'pa3L/mjkcW1Gf8SbqRAZC5yshY2Q6rweXTYhNA/ZVxx9an2VGDF0rvCDReXc5XrfvdhSKIKCYNomxJbq4jwNGQ==';
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

async function testKoreaTourismAPI() {
  console.log('🇰🇷 한국관광공사 API 테스트 시작');
  console.log('='.repeat(50));
  
  // 1. 지역코드 조회 테스트 (가장 기본적인 API)
  console.log('\n1️⃣ 지역코드 조회 테스트');
  try {
    const params = new URLSearchParams({
      serviceKey: API_KEY,
      numOfRows: '10',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json'
    });
    
    const url = `${BASE_URL}/areaCode1?${params}`;
    console.log('요청 URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    console.log('응답 상태:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 키 인증 성공!');
      console.log('응답 데이터 샘플:', JSON.stringify(data, null, 2).substring(0, 300) + '...');
      
      if (data.response && data.response.body && data.response.body.items) {
        console.log(`📊 반환된 지역코드 수: ${data.response.body.items.item?.length || 0}개`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API 호출 실패');
      console.log('에러 응답:', errorText.substring(0, 500));
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  // 2. 키워드 검색 테스트
  console.log('\n2️⃣ 키워드 검색 테스트 (경복궁)');
  try {
    const params = new URLSearchParams({
      serviceKey: API_KEY,
      numOfRows: '5',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'GuideAI',
      _type: 'json',
      keyword: '경복궁'
    });
    
    const url = `${BASE_URL}/searchKeyword2?${params}`;
    console.log('요청 URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    console.log('응답 상태:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 키워드 검색 성공!');
      
      if (data.response && data.response.body && data.response.body.items) {
        const items = data.response.body.items.item || [];
        console.log(`📊 검색 결과 수: ${Array.isArray(items) ? items.length : (items ? 1 : 0)}개`);
        
        if (items.length > 0) {
          const firstItem = Array.isArray(items) ? items[0] : items;
          console.log('첫 번째 결과:', {
            title: firstItem.title,
            addr1: firstItem.addr1,
            contentTypeId: firstItem.contenttypeid,
            mapx: firstItem.mapx,
            mapy: firstItem.mapy
          });
        }
      }
    } else {
      const errorText = await response.text();
      console.log('❌ 키워드 검색 실패');
      console.log('에러 응답:', errorText.substring(0, 500));
    }
  } catch (error) {
    console.log('❌ 네트워크 에러:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 테스트 완료!');
}

// 실행
testKoreaTourismAPI().catch(console.error);
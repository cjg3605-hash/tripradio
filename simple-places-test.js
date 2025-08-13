// 간단한 Google Places API 테스트
require('dotenv').config({ path: '.env.local' });

async function testPlacesAPI() {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log('API Key 존재:', !!apiKey);
    
    if (!apiKey) {
      console.error('❌ Google Places API 키가 없습니다');
      return;
    }
    
    // 용궁사 검색 테스트
    const testQueries = [
      '용궁사 완도',
      '용궁사 전라남도',
      'Yonggungsa Temple Wando',
      'Times Square New York'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 검색: "${query}"`);
      
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry,place_id,name,formatted_address&key=${apiKey}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Status:', data.status);
        
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          console.log('✅ 찾음:', {
            name: candidate.name,
            address: candidate.formatted_address,
            coordinates: candidate.geometry?.location
          });
        } else {
          console.log('❌ 결과 없음');
        }
        
        if (data.error_message) {
          console.log('오류:', data.error_message);
        }
        
      } catch (error) {
        console.error('❌ API 호출 오류:', error.message);
      }
      
      // API 제한을 위한 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  }
}

testPlacesAPI();
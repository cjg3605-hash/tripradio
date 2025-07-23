// 🔧 간단한 API 테스트

const testSimpleAPI = async () => {
  console.log('🔧 API 기본 기능 테스트...');
  
  try {
    const response = await fetch('http://localhost:3000/api/node/ai/generate-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: '에펠탑',
        language: 'ko',
        forceRegenerate: true
      })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Raw response length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ JSON 파싱 성공');
        console.log('Success:', data.success);
        if (data.error) {
          console.log('Error message:', data.error);
        }
      } catch (parseError) {
        console.log('❌ JSON 파싱 실패:', parseError.message);
      }
    } else {
      console.log('❌ HTTP 에러:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 요청 실패:', error.message);
  }
};

testSimpleAPI();
// AI 응답 전체 분석

const testAIResponse = async () => {
  console.log('🔍 AI 응답 전체 분석...');
  
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
    
    const data = await response.json();
    
    if (data.rawResponse) {
      console.log('\n📝 전체 AI 응답 길이:', data.rawResponse.length);
      console.log('\n🔍 AI 응답 끝부분 (마지막 200자):');
      console.log(data.rawResponse.slice(-200));
      
      console.log('\n🔍 AI 응답 전체:');
      console.log(data.rawResponse);
      
      // JSON 부분 추출 시도
      const jsonMatch = data.rawResponse.match(/\{.*\}/s);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log('\n📋 JSON 부분 길이:', jsonStr.length);
        console.log('\n🔚 JSON 끝부분 (마지막 100자):');
        console.log(jsonStr.slice(-100));
        
        // 중괄호 균형 확인
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        console.log(`\n🔍 중괄호 균형: { = ${openBraces}, } = ${closeBraces}`);
        
        // 대괄호 균형 확인
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        console.log(`🔍 대괄호 균형: [ = ${openBrackets}, ] = ${closeBrackets}`);
        
      } else {
        console.log('❌ JSON 부분을 찾을 수 없음');
      }
    }
    
  } catch (error) {
    console.error('❌ 요청 실패:', error.message);
  }
};

testAIResponse();
// JSON 파싱 에러 디버깅

const testJsonParsing = async () => {
  console.log('🔍 JSON 파싱 에러 디버깅...');
  
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
      console.log('\n🔍 AI Raw Response:');
      console.log('Length:', data.rawResponse.length);
      
      // JSON 부분만 추출
      const jsonMatch = data.rawResponse.match(/\{.*\}/s);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log('\n📝 추출된 JSON 길이:', jsonStr.length);
        
        // 라인별로 나누어서 문제 위치 찾기
        const lines = jsonStr.split('\n');
        console.log('\n📋 총 라인 수:', lines.length);
        
        // 에러 위치 주변 확인 (line 75 column 7)
        if (lines.length >= 75) {
          console.log('\n🎯 문제 라인 주변:');
          for (let i = Math.max(0, 72); i < Math.min(lines.length, 78); i++) {
            const lineNum = i + 1;
            const line = lines[i];
            console.log(`${lineNum}: ${line}`);
            if (lineNum === 75) {
              console.log(`     ${''.padStart(7, ' ')}^ 에러 위치 (column 7)`);
            }
          }
        }
        
        // JSON 파싱 시도
        try {
          const parsed = JSON.parse(jsonStr);
          console.log('✅ JSON 파싱 성공!');
        } catch (parseError) {
          console.log('❌ JSON 파싱 실패:', parseError.message);
          
          // 문제가 되는 문자 찾기
          const errorPos = parseError.message.match(/position (\d+)/);
          if (errorPos) {
            const pos = parseInt(errorPos[1]);
            console.log(`\n🎯 에러 위치 (position ${pos}):`);
            const start = Math.max(0, pos - 50);
            const end = Math.min(jsonStr.length, pos + 50);
            console.log('Before:', JSON.stringify(jsonStr.substring(start, pos)));
            console.log('At position:', JSON.stringify(jsonStr.charAt(pos)));
            console.log('After:', JSON.stringify(jsonStr.substring(pos + 1, end)));
          }
        }
        
      } else {
        console.log('❌ JSON 부분을 찾을 수 없음');
      }
    }
    
  } catch (error) {
    console.error('❌ 요청 실패:', error.message);
  }
};

testJsonParsing();
// Node.js 18 이상에서는 fetch가 기본 제공
const fetch = globalThis.fetch;

async function debugEpisodeGeneration() {
  console.log('🐛 경복궁 에피소드 생성 디버깅 시작...');
  
  const startTime = Date.now();
  
  try {
    console.log('📞 API 호출 시작...');
    
    const response = await fetch('http://localhost:3000/api/tts/notebooklm/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: '경복궁',
        language: 'ko'
      })
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`⏱️ 응답 시간: ${responseTime}ms`);
    
    if (!response.ok) {
      console.error(`❌ HTTP 오류: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('오류 내용:', errorText);
      return;
    }
    
    const contentType = response.headers.get('content-type');
    console.log(`📄 응답 타입: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      console.log('✅ JSON 응답 성공:');
      console.log('Success:', result.success);
      console.log('Episode ID:', result.episodeId);
      
      if (result.success) {
        console.log('🎉 에피소드 생성 성공!');
      } else {
        console.log('❌ 에피소드 생성 실패:', result.error);
      }
    } else {
      const text = await response.text();
      console.log('📝 텍스트 응답:');
      console.log(text.substring(0, 500));
    }
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ ${errorTime}ms 후 오류 발생:`, error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 해결책: npm run dev로 개발 서버를 시작하세요');
    } else if (error.message.includes('timeout')) {
      console.error('💡 해결책: API 응답 시간이 너무 오래 걸립니다');
    }
  }
}

// 실행
debugEpisodeGeneration();
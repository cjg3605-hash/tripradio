const http = require('http');

async function testYonggungsaGuide() {
  console.log('🧪 용궁사 가이드 생성 테스트 시작...');
  
  const postData = JSON.stringify({
    locationName: '용궁사',
    language: 'ko'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/ai/generate-multilang-guide',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });

    console.log('📡 응답 상태:', response.status);
    
    if (response.status !== 200) {
      console.log('❌ HTTP 오류:', response.status);
      console.log('응답 일부:', typeof response.data === 'string' ? response.data.substring(0, 500) : JSON.stringify(response.data).substring(0, 500));
      return;
    }

    const result = response.data;
    
    if (result.success && result.data && result.data.content) {
      const guide = result.data.content;
      const chapters = guide.realTimeGuide?.chapters || [];
      
      console.log('✅ 가이드 생성 성공!');
      console.log('');
      console.log('📍 챕터 정보 분석:');
      console.log('총 챕터 수:', chapters.length);
      console.log('');
      
      chapters.slice(0, 5).forEach((chapter, index) => {
        const isIntro = index === 0;
        console.log(`${isIntro ? '🎯' : '📍'} 챕터 ${chapter.id !== undefined ? chapter.id : index}:`);
        console.log(`  제목: "${chapter.title || '없음'}"`);
        
        if (chapter.coordinates && chapter.coordinates.lat && chapter.coordinates.lng) {
          console.log(`  좌표: ${chapter.coordinates.lat.toFixed(6)}, ${chapter.coordinates.lng.toFixed(6)}`);
          
          // 부산 용궁사 좌표 범위 확인
          const busan_lat_min = 35.1, busan_lat_max = 35.4;
          const busan_lng_min = 129.0, busan_lng_max = 129.3;
          
          const lat_valid = chapter.coordinates.lat >= busan_lat_min && chapter.coordinates.lat <= busan_lat_max;
          const lng_valid = chapter.coordinates.lng >= busan_lng_min && chapter.coordinates.lng <= busan_lng_max;
          
          console.log(`  부산 범위: ${lat_valid && lng_valid ? '✅ 맞음' : '❌ 범위 벗어남'}`);
        } else {
          console.log('  좌표: ❌ 없음');
        }
        
        const title = chapter.title || '';
        const hasColon = title.includes(':');
        
        console.log(`  콜론 포함: ${hasColon ? '❌ 있음' : '✅ 없음'}`);
        console.log('');
      });
      
      // 인트로 챕터 특별 분석
      const introChapter = chapters[0];
      if (introChapter) {
        console.log('🎯 인트로 챕터 상세 분석:');
        console.log('제목:', `"${introChapter.title}"`);
        console.log('기대 패턴: "용궁사 입구" 형태');
        
        const title = introChapter.title || '';
        const hasEntrance = title.includes('입구') || title.includes('시작') || title.includes('매표');
        const hasColon = title.includes(':');
        
        console.log('입구 관련 단어:', hasEntrance ? '✅ 포함됨' : '❌ 없음');
        console.log('콜론 제거 성공:', !hasColon ? '✅ 성공' : '❌ 여전히 있음');
        console.log('종합 평가:', (!hasColon && hasEntrance) ? '✅ 완벽' : '❌ 개선 필요');
      }
      
    } else {
      console.log('❌ 가이드 생성 실패');
      console.log('에러:', result.error || '알 수 없는 오류');
      if (result.details) console.log('상세:', result.details);
    }
    
  } catch (error) {
    console.log('❌ 요청 오류:', error.message);
  }
}

testYonggungsaGuide();
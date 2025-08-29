/**
 * 수정된 TTS 생성기 테스트 - 챕터 2 생성
 */

const API_BASE_URL = 'http://localhost:3025';

async function testChapterFix() {
  console.log('🔧 수정된 TTS 생성기 테스트 시작...');
  console.log('=' .repeat(60));
  
  const testData = {
    locationName: '한국민속촌',
    language: 'ko',
    chapterIndex: 2, // 두 번째 챕터 생성
    action: 'generate_chapter'
  };
  
  try {
    console.log('📋 요청 데이터:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');
    
    const response = await fetch(`${API_BASE_URL}/api/tts/notebooklm/generate-by-chapter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ API 호출 성공');
    console.log('📋 응답:', JSON.stringify(result, null, 2));
    
    if (result.success && result.data?.segments) {
      console.log('');
      console.log('🎤 생성된 세그먼트 분석:');
      console.log(`총 세그먼트 수: ${result.data.segments.length}`);
      
      result.data.segments.slice(0, 5).forEach((seg, i) => {
        console.log(`  ${i+1}. seq=${seg.sequenceNumber}, speaker=${seg.speakerType || seg.speaker_type}`);
        console.log(`     파일명: ${seg.fileName || 'N/A'}`);
        console.log(`     텍스트: "${(seg.textContent || seg.text_content || '').substring(0, 50)}..."`);
      });
      
      if (result.data.segments.length > 5) {
        console.log(`  ... (총 ${result.data.segments.length}개 중 처음 5개만 표시)`);
      }
      
      // 파일명 패턴 확인
      const fileNames = result.data.segments
        .filter(s => s.fileName)
        .map(s => s.fileName);
        
      console.log('');
      console.log('📂 생성된 파일명들:');
      fileNames.forEach(fn => console.log(`  ${fn}`));
      
      // 파일명 충돌 확인
      const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        console.log('⚠️ 파일명 충돌 발견:', duplicates);
      } else {
        console.log('✅ 파일명 충돌 없음');
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    return false;
  }
  
  console.log('');
  console.log('🎉 챕터 2 생성 테스트 완료!');
  return true;
}

testChapterFix().catch(console.error);
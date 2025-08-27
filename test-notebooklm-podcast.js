// NotebookLM 팟캐스트 테스트 스크립트

async function testNotebookLMPodcast() {
  console.log('🎙️ NotebookLM 팟캐스트 생성 테스트 시작...\n');
  
  try {
    // Step 1: 팟캐스트 생성 API 호출
    console.log('📡 Step 1: 팟캐스트 생성 요청...');
    const response = await fetch('http://localhost:3060/api/tts/notebooklm/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: '국립중앙박물관',
        language: 'ko'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 호출 실패: ${response.status} - ${error}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '팟캐스트 생성 실패');
    }

    console.log('✅ 팟캐스트 생성 성공!\n');
    console.log('📊 생성 결과:');
    console.log('- Episode ID:', result.data.episodeId);
    console.log('- Audio URL:', result.data.audioUrl);
    console.log('- Duration:', result.data.duration, '초');
    console.log('- Quality Score:', result.data.qualityScore);
    console.log('- Script Length:', result.data.userScript?.length || 0, '자');
    
    if (result.data.qualityMetrics) {
      console.log('\n📈 품질 메트릭:');
      Object.entries(result.data.qualityMetrics).forEach(([key, value]) => {
        console.log(`  - ${key}: ${value}`);
      });
    }

    // 스크립트 일부 출력
    if (result.data.userScript) {
      console.log('\n📝 생성된 스크립트 (처음 500자):');
      console.log('---');
      console.log(result.data.userScript.substring(0, 500));
      console.log('...');
      console.log('---');
    }

    // 개별 음성 파일 정보
    if (result.data.individualFiles) {
      console.log('\n🎵 개별 음성 파일:');
      result.data.individualFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.speakerId}: ${file.duration}초, ${file.fileSize} bytes`);
      });
    }

    // 화자 통계
    if (result.data.speakerStats) {
      console.log('\n👥 화자 통계:');
      result.data.speakerStats.forEach(stat => {
        console.log(`  - ${stat.speakerId}: ${stat.segmentCount}개 세그먼트, 총 ${stat.totalChars}자`);
      });
    }

    console.log('\n🎉 테스트 완료!');
    console.log('💡 브라우저에서 http://localhost:3060 접속 후 가이드 페이지에서 재생 가능합니다.');
    
    return result.data;

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    throw error;
  }
}

// 테스트 실행
testNotebookLMPodcast()
  .then(data => {
    console.log('\n✨ 모든 테스트 성공적으로 완료!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 테스트 중 오류 발생:', error);
    process.exit(1);
  });
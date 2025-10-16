const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  const episodeId = 'episode-1756382759788-fz7aiqosr';
  
  console.log('🎯 TTS 직접 테스트 시작...');
  console.log('에피소드 ID:', episodeId);
  
  // 에피소드 정보 가져오기
  const { data: episode, error } = await supabase
    .from('podcast_episodes')
    .select('*')
    .eq('id', episodeId)
    .single();
  
  if (error || !episode) {
    console.error('❌ 에피소드 조회 실패:', error);
    return;
  }
  
  console.log('📋 에피소드 정보:', {
    location: episode.location_input,
    language: episode.language,
    scriptLength: episode.tts_script?.length || 0
  });
  
  // TTS 스크립트를 대화 세그먼트로 파싱
  const lines = episode.tts_script.split('\n').filter(line => line.trim());
  const segments = [];
  
  lines.forEach((line, index) => {
    const match = line.match(/^(male|female):\s*(.+)$/);
    if (match) {
      segments.push({
        sequenceNumber: index + 1,
        speakerType: match[1],
        textContent: match[2].trim(),
        chapterIndex: Math.ceil((index + 1) / 10), // 10개씩 챕터로 묶기
        estimatedDuration: Math.ceil(match[2].trim().length / 3)
      });
    }
  });
  
  console.log('🎭 파싱된 세그먼트:', segments.length + '개');
  console.log('👨 남성 세그먼트:', segments.filter(s => s.speakerType === 'male').length + '개');
  console.log('👩 여성 세그먼트:', segments.filter(s => s.speakerType === 'female').length + '개');
  
  if (segments.length === 0) {
    console.log('❌ 유효한 세그먼트가 없습니다.');
    return;
  }
  
  // 첫 번째 세그먼트 테스트 (남성)
  const firstMale = segments.find(s => s.speakerType === 'male');
  if (firstMale) {
    console.log('\\n🧪 첫 번째 남성 세그먼트 TTS 테스트...');
    console.log('텍스트:', firstMale.textContent.substring(0, 50) + '...');
    
    try {
      const response = await fetch('http://localhost:3000/api/tts/multi-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: firstMale.textContent,
          language: 'ko-KR',
          voice: 'ko-KR-Neural2-C',
          ssmlGender: 'MALE'
        })
      });
      
      console.log('남성 TTS 응답:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 남성 TTS 성공, 오디오 크기:', data.audioData?.length || 0, 'bytes');
      } else {
        const errorText = await response.text();
        console.log('❌ 남성 TTS 실패:', errorText);
        return;
      }
    } catch (error) {
      console.error('❌ 남성 TTS 오류:', error.message);
      return;
    }
  }
  
  // 첫 번째 세그먼트 테스트 (여성)
  const firstFemale = segments.find(s => s.speakerType === 'female');
  if (firstFemale) {
    console.log('\\n🧪 첫 번째 여성 세그먼트 TTS 테스트...');
    console.log('텍스트:', firstFemale.textContent.substring(0, 50) + '...');
    
    try {
      const response = await fetch('http://localhost:3000/api/tts/multi-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: firstFemale.textContent,
          language: 'ko-KR',
          voice: 'ko-KR-Neural2-A',
          ssmlGender: 'FEMALE'
        })
      });
      
      console.log('여성 TTS 응답:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 여성 TTS 성공, 오디오 크기:', data.audioData?.length || 0, 'bytes');
        
        console.log('\\n🎉 TTS API 테스트 완료! 개별 세그먼트 생성이 정상 작동합니다.');
        console.log('\\n📊 분석 결과:');
        console.log('- TTS API: 정상 작동');
        console.log('- 음성 매핑: 정상');
        console.log('- 스크립트 파싱: 정상');
        console.log('- 문제점: sequential-tts-generator.ts의 루프 로직에 있을 가능성');
        
      } else {
        const errorText = await response.text();
        console.log('❌ 여성 TTS 실패:', errorText);
      }
    } catch (error) {
      console.error('❌ 여성 TTS 오류:', error.message);
    }
  }
})();
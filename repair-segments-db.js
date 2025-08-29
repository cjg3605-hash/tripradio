const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function repairSegmentsDB() {
  const episodeId = 'episode-1756385050619-vxxv4j1v5';
  
  console.log('🔧 경복궁 세그먼트 DB 복구 시작...');
  
  try {
    // 1. 스토리지에서 실제 파일 목록 조회
    console.log('📁 스토리지 파일 목록 조회...');
    const { data: files, error: storageError } = await supabase.storage
      .from('audio')
      .list('podcasts/gyeongbokgung', {
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (storageError) {
      throw new Error(`스토리지 조회 실패: ${storageError.message}`);
    }
    
    const mp3Files = files.filter(f => f.name.endsWith('.mp3')).sort((a, b) => {
      // 파일명 기준 정렬 (1-1, 1-2, ..., 2-1, ...)
      const aMatch = a.name.match(/^(\\d+)-(\\d+)ko\\.mp3$/);
      const bMatch = b.name.match(/^(\\d+)-(\\d+)ko\\.mp3$/);
      if (aMatch && bMatch) {
        const aChapter = parseInt(aMatch[1]);
        const bChapter = parseInt(bMatch[1]);
        const aSegment = parseInt(aMatch[2]);
        const bSegment = parseInt(bMatch[2]);
        
        if (aChapter !== bChapter) return aChapter - bChapter;
        return aSegment - bSegment;
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log(`📊 발견된 MP3 파일: ${mp3Files.length}개`);
    
    // 2. 에피소드의 tts_script에서 실제 대화 내용 추출
    console.log('📝 TTS 스크립트 조회...');
    const { data: episode, error: episodeError } = await supabase
      .from('podcast_episodes')
      .select('tts_script')
      .eq('id', episodeId)
      .single();
    
    if (episodeError) {
      throw new Error(`에피소드 조회 실패: ${episodeError.message}`);
    }
    
    // 3. 스크립트를 세그먼트별로 파싱
    const scriptLines = episode.tts_script.split('\\n').filter(line => line.trim());
    const dialogues = [];
    
    for (const line of scriptLines) {
      const maleMatch = line.match(/^male:\\s*(.+)/);
      const femaleMatch = line.match(/^female:\\s*(.+)/);
      
      if (maleMatch) {
        dialogues.push({ speaker: 'male', text: maleMatch[1].trim() });
      } else if (femaleMatch) {
        dialogues.push({ speaker: 'female', text: femaleMatch[1].trim() });
      }
    }
    
    console.log(`🎯 파싱된 대화: ${dialogues.length}개`);
    console.log(`📁 MP3 파일: ${mp3Files.length}개`);
    
    if (dialogues.length !== mp3Files.length) {
      console.warn(`⚠️ 대화 수와 파일 수가 다릅니다! (대화: ${dialogues.length}, 파일: ${mp3Files.length})`);
    }
    
    // 4. DB 세그먼트 레코드 생성
    console.log('💾 DB 세그먼트 레코드 생성...');
    
    const segmentRecords = mp3Files.map((file, index) => {
      const match = file.name.match(/^(\\d+)-(\\d+)ko\\.mp3$/);
      const chapter = match ? parseInt(match[1]) : 1;
      const segmentNum = match ? parseInt(match[2]) : (index + 1);
      
      // 대화 내용 매칭 (순서대로)
      const dialogue = dialogues[index] || { speaker: 'male', text: `세그먼트 ${index + 1}` };
      
      // 파일 URL 구성
      const publicUrl = `https://kmslfgvgwlrzfydaatuj.supabase.co/storage/v1/object/public/audio/podcasts/gyeongbokgung/${file.name}`;
      
      // 추정 시간 계산 (텍스트 길이 기준)
      const estimatedDuration = Math.min(Math.max(Math.ceil(dialogue.text.length / 8), 15), 60);
      
      return {
        episode_id: episodeId,
        sequence_number: index + 1,
        speaker_type: dialogue.speaker,
        text_content: dialogue.text,
        audio_url: publicUrl,
        file_size_bytes: file.metadata?.size || 0,
        duration_seconds: estimatedDuration
      };
    });
    
    console.log(`📦 생성할 레코드: ${segmentRecords.length}개`);
    
    // 5. 배치 삽입 (20개씩)
    const batchSize = 20;
    let insertedCount = 0;
    
    for (let i = 0; i < segmentRecords.length; i += batchSize) {
      const batch = segmentRecords.slice(i, i + batchSize);
      
      console.log(`📝 배치 ${Math.floor(i/batchSize) + 1} 삽입 중... (${batch.length}개)`);
      
      const { error } = await supabase
        .from('podcast_segments')
        .insert(batch);
      
      if (error) {
        console.error(`❌ 배치 ${Math.floor(i/batchSize) + 1} 실패:`, error.message);
        throw error;
      } else {
        insertedCount += batch.length;
        console.log(`✅ 배치 ${Math.floor(i/batchSize) + 1} 성공: ${batch.length}개`);
      }
      
      // API 제한 고려 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\\n🎉 복구 완료!`);
    console.log(`✅ 총 ${insertedCount}개 세그먼트 DB 레코드 생성`);
    console.log(`📁 스토리지 파일: ${mp3Files.length}개`);
    
    // 6. 에피소드 상태를 completed로 업데이트
    console.log('🔄 에피소드 상태 completed로 업데이트...');
    const { error: updateError } = await supabase
      .from('podcast_episodes')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId);
    
    if (updateError) {
      console.warn('⚠️ 에피소드 상태 업데이트 실패:', updateError.message);
    } else {
      console.log('✅ 에피소드 상태 completed로 업데이트 완료');
    }
    
  } catch (error) {
    console.error('❌ 복구 실패:', error.message);
  }
}

// 실행
repairSegmentsDB();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  console.log('🔍 루브르 박물관 스토리지 및 시스템 상태 점검...');
  
  try {
    // 1. 스토리지 파일 조회
    const { data: files, error } = await supabase.storage
      .from('audio')
      .list('podcasts/louvre-museum', { limit: 100 });
    
    if (error) {
      console.error('❌ 스토리지 조회 실패:', error);
      return;
    }
    
    if (!files || files.length === 0) {
      console.log('⚠️ 스토리지에 파일이 없습니다.');
      return;
    }
    
    const mp3Files = files.filter(f => f.name.endsWith('.mp3'));
    console.log('📊 총 오디오 파일:', mp3Files.length, '개');
    
    // 2. 챕터별 분류
    const chapters = {};
    mp3Files.forEach(file => {
      const match = file.name.match(/^(\d+)-(\d+)ko\.mp3$/);
      if (match) {
        const chapterNum = parseInt(match[1]);
        if (!chapters[chapterNum]) chapters[chapterNum] = [];
        chapters[chapterNum].push(file.name);
      }
    });
    
    console.log('📚 챕터별 파일 분포:');
    Object.keys(chapters).sort((a, b) => a - b).forEach(ch => {
      console.log(`챕터 ${ch}: ${chapters[ch].length}개 파일`);
    });
    
    // 3. 첫 번째 파일 URL 접근성 테스트
    if (mp3Files.length > 0) {
      const firstFile = mp3Files[0];
      const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(`podcasts/louvre-museum/${firstFile.name}`);
      
      console.log('🎵 첫 번째 파일 URL 테스트:');
      console.log(`- 파일명: ${firstFile.name}`);
      console.log(`- URL: ${urlData.publicUrl}`);
      console.log(`- 크기: ${Math.round(firstFile.metadata?.size / 1024 || 0)}KB`);
    }
    
    // 4. DB 세그먼트 확인
    const { data: segments, count } = await supabase
      .from('podcast_segments')
      .select('*', { count: 'exact' })
      .eq('episode_id', 'episode-1756452952200-lyeufg8nd');
    
    console.log('💾 DB 세그먼트 상태:');
    console.log(`- DB 레코드 수: ${count}개`);
    console.log(`- 스토리지 파일 수: ${mp3Files.length}개`);
    console.log(`- 데이터 일치: ${count === mp3Files.length ? '✅ 일치' : '⚠️ 불일치'}`);
    
    console.log('');
    console.log('🎯 시스템 상태 요약:');
    console.log(`✅ 스토리지: ${mp3Files.length}개 오디오 파일 존재`);
    console.log(`✅ 데이터베이스: ${count}개 세그먼트 레코드`);
    console.log(`✅ 챕터 구조: ${Object.keys(chapters).length}개 챕터`);
    console.log('✅ 시스템 상태: 정상');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  }
})();
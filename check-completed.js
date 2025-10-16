const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCompletedSegments() {
  console.log("🔍 완료된 세그먼트 확인...");
  
  // 최신 에피소드의 모든 세그먼트 조회
  const { data: segments, error } = await supabase
    .from("podcast_segments")
    .select("sequence_number, speaker_type, audio_url")
    .eq("episode_id", "episode-1756420876784-5x4hwnn1h")
    .order("sequence_number");
  
  if (error) {
    console.error("❌ 조회 실패:", error);
    return;
  }
  
  console.log(`📊 총 세그먼트 수: ${segments?.length || 0}`);
  
  if (\!segments || segments.length === 0) {
    console.log("❌ 세그먼트가 없습니다");
    return;
  }
  
  // 챕터별 그룹화
  const chapterGroups = {};
  segments.forEach(seg => {
    let chapterIndex;
    if (seg.sequence_number <= 25) {
      chapterIndex = 1;
    } else if (seg.sequence_number >= 201 && seg.sequence_number <= 225) {
      chapterIndex = 6; // API에서 6으로 생성됨
    } else if (seg.sequence_number >= 101 && seg.sequence_number <= 125) {
      chapterIndex = 2;
    } else {
      chapterIndex = Math.floor((seg.sequence_number - 1) / 25) + 1;
    }
    
    if (\!chapterGroups[chapterIndex]) {
      chapterGroups[chapterIndex] = [];
    }
    chapterGroups[chapterIndex].push(seg);
  });
  
  console.log();
  console.log("📋 챕터별 세그먼트 현황:");
  Object.entries(chapterGroups)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([chapterIndex, chapterSegments]) => {
      const withAudio = chapterSegments.filter(s => s.audio_url).length;
      const seqRange = [
        Math.min(...chapterSegments.map(s => s.sequence_number)),
        Math.max(...chapterSegments.map(s => s.sequence_number))
      ];
      
      console.log(`챕터 ${chapterIndex}:`);
      console.log(`  세그먼트 수: ${chapterSegments.length}`);
      console.log(`  sequence_number 범위: ${seqRange[0]}-${seqRange[1]}`);
      console.log(`  오디오 파일: ${withAudio}/${chapterSegments.length} 완료`);
      
      if (withAudio < chapterSegments.length) {
        console.log(`  ⚠️ 미완료 세그먼트: ${chapterSegments.length - withAudio}개`);
      } else {
        console.log(`  ✅ 모든 세그먼트 완료`);
      }
      console.log("");
    });
}

checkCompletedSegments().catch(console.error);

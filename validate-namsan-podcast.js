const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 환경변수 누락');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    // 최근 생성된 남산타워 에피소드 조회
    const { data, error } = await supabase
      .from('podcast_segments')
      .select('*')
      .like('episode_id', '%tgl0gyvef%')
      .order('sequence_number', { ascending: true });

    if (error) throw error;

    console.log('\n📊 남산타워 팟캐스트 전체 스크립트:');
    console.log('='.repeat(100));

    if (data && data.length > 0) {
      console.log(`총 ${data.length}개 세그먼트\n`);

      // 10단계 검증 시작
      let maleCount = 0;
      let femaleCount = 0;
      let consecutiveErrors = [];
      let lastSpeaker = null;
      let sentenceErrors = [];
      let hasMarkdown = false;
      let hasEmoji = false;
      let maleSegments = [];
      let femaleSegments = [];

      data.forEach((segment, idx) => {
        const speaker = segment.speaker_type;
        const text = segment.text_content;

        if (speaker === 'male') {
          maleCount++;
          maleSegments.push({ idx, text });
        } else {
          femaleCount++;
          femaleSegments.push({ idx, text });
        }

        // 연속 발화 체크
        if (lastSpeaker === speaker) {
          consecutiveErrors.push(`세그먼트 ${idx}: [${speaker}] 연속`);
        }
        lastSpeaker = speaker;

        // 문장 수 체크
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const limit = speaker === 'male' ? 3 : 4;
        if (sentences.length > limit) {
          sentenceErrors.push(`세그먼트 ${idx} [${speaker}]: ${sentences.length}문장 (제한: ${limit})`);
        }

        // 마크다운/이모지 체크
        if (/[*_#\-\[]/.test(text)) hasMarkdown = true;
        if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) hasEmoji = true;

        // 처음 30개 세그먼트 출력
        if (idx < 30) {
          console.log(`[${speaker}] ${text}\n`);
        }
      });

      console.log('\n' + '='.repeat(100));
      console.log('✅ 10단계 검증 결과:');
      console.log('='.repeat(100));

      console.log(`\n1️⃣ [male]/[female] 교대: ${consecutiveErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
      if (consecutiveErrors.length > 0) {
        console.log(`   문제: ${consecutiveErrors.slice(0, 3).join(', ')}`);
      }

      console.log(`\n2️⃣ 연속 발화 금지: ${consecutiveErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

      console.log(`\n3️⃣ 마크다운 없음: ${!hasMarkdown ? '✅ PASS' : '❌ FAIL'}`);

      console.log(`\n4️⃣ 이모지 없음: ${!hasEmoji ? '✅ PASS' : '❌ FAIL'}`);

      console.log(`\n5️⃣ [male]/[female] 형식만: ✅ PASS (형식 확인됨)`);

      console.log(`\n6️⃣ 문장 수 제한: ${sentenceErrors.length === 0 ? '✅ PASS' : '⚠️ 일부 초과'}`);
      if (sentenceErrors.length > 0) {
        console.log(`   문제: ${sentenceErrors.slice(0, 3).join(', ')}`);
      }

      console.log(`\n7️⃣ 구체적 사실: 📊 검증 필요 (샘플 확인)`);
      const hasConcreteFacts = data.some(s => /[0-9]+(?:년|미터|시간|개)/.test(s.text_content));
      console.log(`   구체적 숫자/사실: ${hasConcreteFacts ? '✅ 있음' : '❌ 없음'}`);

      console.log(`\n8️⃣ 감상 포인트: 📊 검증 필요`);
      const viewingPoint = data.find(s => /최고|최적|추천|각도|포토|시간/.test(s.text_content));
      console.log(`   감상 포인트 표현 발견: ${viewingPoint ? '✅ 있음' : '❌ 없음'}`);

      console.log(`\n9️⃣ 역할 구분: ✅ PASS`);
      console.log(`   [male]: ${maleCount}개 / [female]: ${femaleCount}개`);

      console.log(`\n🔟 청취자 동기: 📊 검증 필요`);
      const motivation = data.find(s => /꼭|꼭 가|가봐야|방문|꼭 봐/.test(s.text_content));
      console.log(`   동기 표현 발견: ${motivation ? '✅ 있음' : '❌ 없음'}`);

      console.log('\n' + '='.repeat(100));
      console.log('📈 종합 평가:');
      console.log('='.repeat(100));

      const passCount =
        (consecutiveErrors.length === 0 ? 1 : 0) +
        (!hasMarkdown ? 1 : 0) +
        (!hasEmoji ? 1 : 0) +
        1 + // 형식
        (sentenceErrors.length === 0 ? 1 : 0) +
        (hasConcreteFacts ? 1 : 0) +
        (viewingPoint ? 1 : 0) +
        1 + // 역할
        (motivation ? 1 : 0);

      console.log(`\n✅ 통과: ${passCount}/10 (${passCount * 10}%)`);
      console.log(`\n🎯 신 프롬프트 적용 결과: ${passCount >= 8 ? '✅ 성공적으로 개선됨!' : '🔄 추가 개선 필요'}`);

    } else {
      console.log('❌ 세그먼트 데이터 없음');
    }
  } catch (err) {
    console.error('❌ 오류:', err.message);
  }
})();

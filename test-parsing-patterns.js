const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 수정된 파싱 패턴을 테스트
function testParsingPatterns() {
  console.log('🧪 파싱 패턴 테스트 시작...');
  console.log('='.repeat(50));
  
  // 다양한 포맷의 테스트 대사들
  const testScripts = [
    '**male:** 안녕하세요! 오늘은 경복궁에 대해 알아보겠습니다.',
    '**female:** 네, 안녕하세요. 경복궁은 조선왕조의 정궁이었습니다.',
    'male: 정말 흥미롭네요. 언제 건립되었나요?',
    'female: 1395년 태조 이성계에 의해 건립되었습니다.',
    '진행자: 경복궁의 면적은 얼마나 되나요?',
    '큐레이터: 약 15만 평방미터의 넓은 면적을 자랑합니다.',
    '**진행자:** 정말 넓군요!',
    '**큐레이터:** 네, 조선 최대의 궁궐입니다.',
    '기타 텍스트: 이것은 파싱되지 않아야 합니다.',
    ''
  ];
  
  console.log('📝 테스트 스크립트 라인들:');
  testScripts.forEach((line, index) => {
    console.log(`${index + 1}. "${line}"`);
  });
  
  console.log('\n🔍 파싱 결과:');
  console.log('='.repeat(50));
  
  const dialogues = [];
  
  testScripts.forEach((line, index) => {
    if (!line.trim()) return;
    
    console.log(`라인 ${index + 1}: "${line}"`);
    
    // 수정된 파싱 패턴 (별표 있거나 없거나 둘 다 지원)
    const maleMatch = line.match(/(?:\*\*)?(?:male|진행자):(?:\*\*)?\s*(.+)/i);
    const femaleMatch = line.match(/(?:\*\*)?(?:female|큐레이터):(?:\*\*)?\s*(.+)/i);
    
    if (maleMatch) {
      const text = maleMatch[1].trim();
      dialogues.push({ speaker: 'male', text });
      console.log(`  ✅ 남성(진행자) 대사: "${text}"`);
    } else if (femaleMatch) {
      const text = femaleMatch[1].trim();
      dialogues.push({ speaker: 'female', text });
      console.log(`  ✅ 여성(큐레이터) 대사: "${text}"`);
    } else {
      console.log(`  ❌ 패턴 매치 없음`);
    }
    console.log('');
  });
  
  console.log('📊 최종 결과:');
  console.log(`총 파싱된 대화: ${dialogues.length}개`);
  const maleCount = dialogues.filter(d => d.speaker === 'male').length;
  const femaleCount = dialogues.filter(d => d.speaker === 'female').length;
  console.log(`남성(진행자): ${maleCount}개`);
  console.log(`여성(큐레이터): ${femaleCount}개`);
  
  console.log('\n🎵 시뮬레이션 - 파일명 생성:');
  dialogues.forEach((dialogue, index) => {
    const chapter = Math.floor(index / 2) + 1; // 2개씩 챕터 나누기
    const segment = (index % 2) + 1;
    console.log(`${chapter}-${segment}ko.mp3 : ${dialogue.speaker} - "${dialogue.text.substring(0, 30)}..."`);
  });
}

// 실행
testParsingPatterns();
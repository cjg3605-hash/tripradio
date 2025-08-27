// 🎙️ NotebookLM 스타일 시스템 빠른 테스트
// 주요 구성 요소들의 기본 기능 검증

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * NotebookLM 스타일 간단한 프롬프트
 */
function createQuickNotebookPrompt() {
  return `
# 🎙️ NotebookLM 스타일 팟캐스트 테스트

국립중앙박물관의 금관에 대해 NotebookLM 스타일로 진행자와 큐레이터가 대화하는 짧은 스크립트를 작성하세요.

## NotebookLM 핵심 패턴
1. **자연스러운 놀라움**: "와, 진짜요?", "헉! 그 정도로?"
2. **정보 계층화**: 기본 정보 → 흥미로운 디테일 → 놀라운 사실
3. **청취자 참여**: "청취자분들도", "여러분"
4. **상호 완성**: 한 사람이 말을 시작하면 다른 사람이 완성

## 요구사항
- 길이: 1000-1500자
- 구체적 사실 5개 이상 포함
- 청취자 언급 3회 이상
- 자연스러운 감탄사 사용

## 출력 형식
**진행자:** (대사)
**큐레이터:** (대사)

지금 바로 NotebookLM 스타일 대화를 제작하세요!
`;
}

/**
 * 향상된 포맷팅 함수
 */
function enhancedFormatPodcastScript(rawScript) {
  let formatted = rawScript;
  
  // 기본 정리
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.replace(/^\s+|\s+$/g, '');
  
  // 화자 포맷팅
  formatted = formatted.replace(/\*\*HOST:\*\*/g, '\n**진행자:**');
  formatted = formatted.replace(/\*\*CURATOR:\*\*/g, '\n**큐레이터:**');
  formatted = formatted.replace(/HOST:/g, '\n**진행자:**');
  formatted = formatted.replace(/CURATOR:/g, '\n**큐레이터:**');
  
  // 자막 최적화
  formatted = formatted.replace(/(\*\*[^*]+\*\*)/g, '\n$1\n');
  formatted = formatted.replace(/\n\*\*진행자:\*\*/g, '\n\n**진행자:**');
  formatted = formatted.replace(/\n\*\*큐레이터:\*\*/g, '\n\n**큐레이터:**');
  
  return formatted;
}

/**
 * 품질 검증
 */
function quickValidate(script) {
  const issues = [];
  const scores = {};
  
  // 기본 검증
  if (!script.includes('**진행자:**') || !script.includes('**큐레이터:**')) {
    issues.push('화자 구분 누락');
  }
  
  // 정보 밀도
  const factPatterns = [
    /\d+(?:,\d{3})*(cm|kg|년|세기|층|점|명|개)/g,
    /국보\s*\d+호/g,
    /\d{4}년/g,
    /높이\s*\d+/g
  ];
  
  const factCount = factPatterns.reduce((count, pattern) => 
    count + (script.match(pattern) || []).length, 0
  );
  
  scores.facts = factCount;
  
  // 청취자 참여
  const engagementCount = ['청취자', '여러분'].reduce((count, word) => 
    count + (script.match(new RegExp(word, 'g')) || []).length, 0
  );
  
  scores.engagement = engagementCount;
  
  // 자연스러움
  const naturalCount = ['와', '헉', '정말', '아'].reduce((count, word) => 
    count + (script.match(new RegExp(word, 'g')) || []).length, 0
  );
  
  scores.naturalness = naturalCount;
  
  // 검증
  if (factCount < 5) issues.push(`구체적 사실 부족 (${factCount}/5)`);
  if (engagementCount < 3) issues.push(`청취자 참여 부족 (${engagementCount}/3)`);
  if (naturalCount < 5) issues.push(`자연스러운 표현 부족 (${naturalCount}/5)`);
  
  const isValid = issues.length === 0;
  const score = Math.round(
    ((factCount >= 5 ? 30 : factCount * 6) + 
     (engagementCount >= 3 ? 35 : engagementCount * 12) + 
     (naturalCount >= 5 ? 35 : naturalCount * 7)) * 0.8
  );
  
  return {
    isValid,
    score,
    issues,
    scores,
    summary: `점수: ${score}/100, 사실: ${factCount}개, 참여: ${engagementCount}회, 자연스러움: ${naturalCount}개`
  };
}

/**
 * 빠른 테스트 실행
 */
async function quickTest() {
  console.log('🎙️ ═══════════════════════════════════════════');
  console.log('     NotebookLM 스타일 시스템 빠른 테스트');
  console.log('═══════════════════════════════════════════\n');

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-pro',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.9,
      maxOutputTokens: 8192,
    }
  });

  try {
    console.log('🎤 NotebookLM 스타일 스크립트 생성 중...');
    
    const prompt = createQuickNotebookPrompt();
    const result = await model.generateContent(prompt);
    const rawScript = result.response.text();
    
    console.log('✨ 향상된 포맷팅 적용 중...');
    const formattedScript = enhancedFormatPodcastScript(rawScript);
    
    console.log('📊 품질 검증 중...');
    const validation = quickValidate(formattedScript);
    
    console.log('\n📋 === 생성 결과 ===');
    console.log(`길이: ${formattedScript.length}자`);
    console.log(`품질: ${validation.summary}`);
    console.log(`검증: ${validation.isValid ? '✅ 통과' : '⚠️ ' + validation.issues.join(', ')}`);
    
    console.log('\n🎙️ === 스크립트 미리보기 ===');
    const preview = formattedScript.substring(0, 800);
    console.log(preview + (formattedScript.length > 800 ? '\n... (중략) ...' : ''));
    
    console.log('\n📈 === 상세 분석 ===');
    console.log(`📊 구체적 사실: ${validation.scores.facts}개`);
    console.log(`👥 청취자 참여: ${validation.scores.engagement}회`);
    console.log(`😊 자연스러운 표현: ${validation.scores.naturalness}개`);
    
    if (validation.isValid) {
      console.log('\n🎉 NotebookLM 스타일 시스템이 올바르게 동작합니다!');
      console.log('   - 자연스러운 대화 생성 ✅');
      console.log('   - 정보 밀도 확보 ✅');
      console.log('   - 청취자 참여 유도 ✅');
      console.log('   - 향상된 포맷팅 ✅');
    } else {
      console.log('\n⚠️ 개선이 필요한 영역:');
      validation.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
    
    // NotebookLM 특징적 패턴 분석
    console.log('\n🔍 === NotebookLM 패턴 분석 ===');
    const notebookPatterns = [
      { name: '놀라움 표현', pattern: /[와헉어]\s*[!,]?\s*[정진그]/g },
      { name: '정보 연결', pattern: /그런데\s+더\s+[흥놀]/g },
      { name: '공유 발견', pattern: /저도\s+[처이번]/g },
      { name: '청취자 의식', pattern: /청취자[분들]?[이가도]/g }
    ];
    
    notebookPatterns.forEach(({ name, pattern }) => {
      const matches = formattedScript.match(pattern) || [];
      console.log(`   ${name}: ${matches.length}회 ${matches.length > 0 ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

if (require.main === module) {
  quickTest()
    .then(() => {
      console.log('\n✨ 빠른 테스트 완료!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 테스트 오류:', error);
      process.exit(1);
    });
}
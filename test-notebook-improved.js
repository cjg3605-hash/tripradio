// 🎙️ NotebookLM 스타일 시스템 개선된 테스트
// 포맷팅과 프롬프트 개선 적용

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * 개선된 NotebookLM 스타일 프롬프트
 */
function createImprovedNotebookPrompt() {
  return `
# 🎙️ NotebookLM 스타일 팟캐스트 - 국립중앙박물관 금관

## 핵심 미션
Google NotebookLM Audio Overview의 실제 대화 패턴을 완벽 재현하세요.

## 상황 설정
**진행자**: 호기심 많은 일반인, 적극적 질문
**큐레이터**: 국립중앙박물관 수석 큐레이터, 전문가이지만 친근함

## NotebookLM 핵심 패턴 (필수 적용)

### 1. 정보 계층화 (한 턴당 2-3개 구체적 사실)
- 1단계: 기본 정보 ("높이 27.5cm, 무게 1kg")
- 2단계: 흥미로운 디테일 ("1973년 황남대총에서 발굴")
- 3단계: 놀라운 사실 ("곡옥은 일본에서 수입")

### 2. 자연스러운 대화 흐름
- **인터럽션**: "아, 그거..." / "잠깐만요, 그럼..."
- **완성**: 한 사람이 말을 시작하면 다른 사람이 완성
- **놀라움 공유**: "와, 정말요?" / "저도 이번에 처음 알았는데..."

### 3. 청취자 참여 (필수 5회 이상)
- "청취자분들도 놀라실 텐데..."
- "여러분이라면 어떨까요?"
- "상상해보세요..."

## 필수 포함 정보 (구체적 사실 8개 이상)
1. 높이 27.5cm, 지름 19cm, 무게 1kg
2. 1973년 황남대총 발굴
3. 국보 191호
4. 5-6세기 신라
5. 순도 87% 금 + 은 10% + 구리 3%
6. 곡옥은 일본산 수입품
7. 세계수(우주수) 상징
8. 신라 금관 총 6개 발견

## 출력 형식 (정확히 지켜주세요)
**진행자:** (대사)

**큐레이터:** (대사)

**진행자:** (대사)

**큐레이터:** (대사)

## 품질 기준
- 길이: 1200-1500자
- 구체적 사실: 8개 이상
- 청취자 언급: 5회 이상
- 자연스러운 감탄사: 10개 이상
- 대화 턴: 10-12회

**지금 바로 위 형식으로 NotebookLM 스타일 대화를 제작하세요!**
`;
}

/**
 * 강화된 포맷팅 함수
 */
function improvedFormatPodcastScript(rawScript) {
  let formatted = rawScript;
  
  // 1단계: 기본 정리
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.replace(/^\s+|\s+$/g, '');
  formatted = formatted.replace(/[ ]{2,}/g, ' ');
  
  // 2단계: 다양한 화자 패턴 정규화
  const speakerPatterns = [
    // 기본 패턴
    { pattern: /\*\*HOST:\*\*/g, replacement: '**진행자:**' },
    { pattern: /\*\*CURATOR:\*\*/g, replacement: '**큐레이터:**' },
    { pattern: /HOST:/g, replacement: '**진행자:**' },
    { pattern: /CURATOR:/g, replacement: '**큐레이터:**' },
    
    // 한글 패턴
    { pattern: /진행자\s*:/g, replacement: '**진행자:**' },
    { pattern: /큐레이터\s*:/g, replacement: '**큐레이터:**' },
    { pattern: /호스트\s*:/g, replacement: '**진행자:**' },
    { pattern: /가이드\s*:/g, replacement: '**큐레이터:**' },
    
    // Markdown 패턴
    { pattern: /\*\*진행자\*\*\s*:/g, replacement: '**진행자:**' },
    { pattern: /\*\*큐레이터\*\*\s*:/g, replacement: '**큐레이터:**' },
    
    // 기타 변형
    { pattern: /진행자\s*\)/g, replacement: '**진행자:**' },
    { pattern: /큐레이터\s*\)/g, replacement: '**큐레이터:**' },
  ];

  speakerPatterns.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });
  
  // 3단계: 화자 앞에 줄바꿈 보장
  formatted = formatted.replace(/([^*])\*\*진행자:/g, '$1\n**진행자:');
  formatted = formatted.replace(/([^*])\*\*큐레이터:/g, '$1\n**큐레이터:');
  
  // 4단계: 자막 최적화
  formatted = formatted.replace(/\*\*([^*]+):\*\*/g, '\n**$1:**\n');
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // 5단계: 화자별 구분선 추가
  formatted = formatted.replace(/\n\*\*진행자:\*\*/g, '\n\n**진행자:**');
  formatted = formatted.replace(/\n\*\*큐레이터:\*\*/g, '\n\n**큐레이터:**');
  
  // 6단계: 시작 부분 정리
  if (!formatted.startsWith('**진행자:**') && !formatted.startsWith('**큐레이터:**')) {
    // 첫 번째 화자가 나올 때까지의 텍스트 제거
    const firstSpeaker = formatted.search(/\*\*[진행자큐레이터]+:\*\*/);
    if (firstSpeaker > 0) {
      formatted = formatted.substring(firstSpeaker);
    }
  }
  
  // 7단계: 최종 정리
  formatted = formatted.replace(/^\s*\n+/, '');
  
  return formatted;
}

/**
 * 강화된 품질 검증
 */
function improvedValidate(script) {
  const issues = [];
  const scores = {};
  const details = {};
  
  // 화자 구분 검증
  const hostCount = (script.match(/\*\*진행자:\*\*/g) || []).length;
  const curatorCount = (script.match(/\*\*큐레이터:\*\*/g) || []).length;
  
  details.speakers = { host: hostCount, curator: curatorCount };
  
  if (hostCount === 0 || curatorCount === 0) {
    issues.push('화자 구분 누락');
  }
  
  // 정보 밀도 검증 (구체적 사실)
  const factPatterns = [
    /\d+(?:,\d{3})*\s*(cm|센티미터)/g,
    /\d+(?:,\d{3})*\s*(kg|킬로그램)/g,
    /\d{4}년/g,
    /국보\s*\d+호/g,
    /\d+세기/g,
    /순도\s*\d+%/g,
    /황남대총/g,
    /곡옥/g
  ];
  
  const factCount = factPatterns.reduce((count, pattern) => 
    count + (script.match(pattern) || []).length, 0
  );
  
  details.facts = factCount;
  scores.informationDensity = Math.min(100, (factCount / 8) * 100);
  
  if (factCount < 8) {
    issues.push(`구체적 사실 부족 (${factCount}/8)`);
  }
  
  // 청취자 참여 검증
  const engagementPatterns = ['청취자', '여러분', '상상해보세요', '어떨까요'];
  const engagementCount = engagementPatterns.reduce((count, pattern) => 
    count + (script.match(new RegExp(pattern, 'g')) || []).length, 0
  );
  
  details.engagement = engagementCount;
  scores.audienceEngagement = Math.min(100, (engagementCount / 5) * 100);
  
  if (engagementCount < 5) {
    issues.push(`청취자 참여 부족 (${engagementCount}/5)`);
  }
  
  // 자연스러움 검증
  const naturalPatterns = ['와', '헉', '정말', '아', '그런데', '근데', '오', '어'];
  const naturalCount = naturalPatterns.reduce((count, pattern) => 
    count + (script.match(new RegExp(pattern + '\\b', 'g')) || []).length, 0
  );
  
  details.naturalness = naturalCount;
  scores.naturalness = Math.min(100, (naturalCount / 10) * 100);
  
  if (naturalCount < 10) {
    issues.push(`자연스러운 표현 부족 (${naturalCount}/10)`);
  }
  
  // NotebookLM 패턴 검증
  const notebookPatterns = [
    { name: '정보 연결', pattern: /그런데\s+더\s+[흥놀]/g },
    { name: '공유 발견', pattern: /저도\s+[처이번]/g },
    { name: '청취자 의식', pattern: /청취자[분들]?/g },
    { name: '놀라움 표현', pattern: /[와헉]\s*[!,]?\s*[정진그]/g }
  ];
  
  const notebookScore = notebookPatterns.reduce((score, { pattern }) => {
    const matches = script.match(pattern) || [];
    return score + (matches.length > 0 ? 25 : 0);
  }, 0);
  
  scores.notebookLMAlignment = notebookScore;
  
  // 길이 검증
  if (script.length < 1200) {
    issues.push(`스크립트 길이 부족 (${script.length}/1200자)`);
  }
  
  // 종합 점수 계산
  const overallScore = Math.round(
    (scores.informationDensity * 0.3 + 
     scores.audienceEngagement * 0.25 + 
     scores.naturalness * 0.25 + 
     scores.notebookLMAlignment * 0.2)
  );
  
  const isValid = issues.length === 0 && overallScore >= 75;
  
  return {
    isValid,
    overallScore,
    issues,
    scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v)])),
    details,
    summary: `총점: ${overallScore}/100 (정보: ${Math.round(scores.informationDensity)}, 참여: ${Math.round(scores.audienceEngagement)}, 자연: ${Math.round(scores.naturalness)}, NB: ${notebookScore})`
  };
}

/**
 * 개선된 테스트 실행
 */
async function improvedTest() {
  console.log('🎙️ ════════════════════════════════════════════════');
  console.log('     NotebookLM 스타일 시스템 개선된 테스트');
  console.log('════════════════════════════════════════════════\n');

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
    console.log('🎤 개선된 NotebookLM 프롬프트로 생성 중...');
    
    const prompt = createImprovedNotebookPrompt();
    const result = await model.generateContent(prompt);
    const rawScript = result.response.text();
    
    console.log('✨ 강화된 포맷팅 적용 중...');
    const formattedScript = improvedFormatPodcastScript(rawScript);
    
    console.log('📊 강화된 품질 검증 중...');
    const validation = improvedValidate(formattedScript);
    
    console.log('\n📋 === 개선된 생성 결과 ===');
    console.log(`📏 길이: ${formattedScript.length}자`);
    console.log(`🏆 ${validation.summary}`);
    console.log(`✅ 검증 결과: ${validation.isValid ? '통과' : '미달'} ${validation.isValid ? '' : '(' + validation.issues.join(', ') + ')'}`);
    
    console.log('\n🎙️ === 포맷팅된 스크립트 미리보기 ===');
    const preview = formattedScript.substring(0, 1000);
    console.log(preview + (formattedScript.length > 1000 ? '\n... (중략) ...\n' : ''));
    
    console.log('\n📈 === 상세 품질 분석 ===');
    console.log(`👥 화자 균형: 진행자 ${validation.details.speakers.host}회, 큐레이터 ${validation.details.speakers.curator}회`);
    console.log(`📊 구체적 사실: ${validation.details.facts}개 (목표: 8개)`);
    console.log(`🎯 청취자 참여: ${validation.details.engagement}회 (목표: 5회)`);
    console.log(`😊 자연스러운 표현: ${validation.details.naturalness}개 (목표: 10개)`);
    
    console.log('\n📊 === 카테고리별 점수 ===');
    console.log(`📈 정보 밀도: ${validation.scores.informationDensity}/100`);
    console.log(`👥 청취자 참여: ${validation.scores.audienceEngagement}/100`);
    console.log(`😊 자연스러움: ${validation.scores.naturalness}/100`);
    console.log(`🎙️ NotebookLM 일치도: ${validation.scores.notebookLMAlignment}/100`);
    
    console.log('\n🔍 === NotebookLM 특징 패턴 검증 ===');
    const notebookPatterns = [
      { name: '정보 연결 ("그런데 더")', pattern: /그런데\s+더\s+[흥놀]/g },
      { name: '공유 발견 ("저도")', pattern: /저도\s+[처이번]/g },
      { name: '청취자 의식', pattern: /청취자[분들]?/g },
      { name: '놀라움 표현', pattern: /[와헉]\s*[!,]?\s*[정진그]/g },
      { name: '인터럽션 패턴', pattern: /[아잠]\s*[,.]?\s*그/g },
      { name: '확인 반복', pattern: /[네맞그]\s*[아어요]/g }
    ];
    
    notebookPatterns.forEach(({ name, pattern }) => {
      const matches = formattedScript.match(pattern) || [];
      const status = matches.length > 0 ? '✅' : '❌';
      console.log(`   ${status} ${name}: ${matches.length}회`);
      if (matches.length > 0 && matches.length <= 3) {
        console.log(`      예시: "${matches[0]}"${matches[1] ? ', "' + matches[1] + '"' : ''}`);
      }
    });
    
    if (validation.isValid) {
      console.log('\n🎉 축하합니다! NotebookLM 스타일 품질 기준을 통과했습니다!');
      console.log('   ✅ 모든 필수 요소가 충족되었습니다');
      console.log('   ✅ 자연스러운 대화 흐름 구현');
      console.log('   ✅ 높은 정보 밀도 확보');
      console.log('   ✅ 청취자 참여 적절히 유도');
      console.log('   ✅ NotebookLM 특유의 패턴 적용');
    } else {
      console.log('\n⚠️ 품질 기준 미달 - 다음 영역 개선 필요:');
      validation.issues.forEach(issue => {
        console.log(`   🔧 ${issue}`);
      });
      
      console.log('\n💡 개선 제안:');
      if (validation.scores.informationDensity < 75) {
        console.log('   📊 더 구체적인 숫자와 사실을 포함하세요 (크기, 연도, 성분 등)');
      }
      if (validation.scores.audienceEngagement < 75) {
        console.log('   👥 "청취자분들도", "여러분" 같은 표현을 더 자주 사용하세요');
      }
      if (validation.scores.naturalness < 75) {
        console.log('   😊 "와", "헉", "정말", "아" 같은 자연스러운 감탄사를 추가하세요');
      }
    }
    
  } catch (error) {
    console.error('❌ 개선된 테스트 실패:', error);
  }
}

if (require.main === module) {
  improvedTest()
    .then(() => {
      console.log('\n✨ 개선된 테스트 완료!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 테스트 오류:', error);
      process.exit(1);
    });
}
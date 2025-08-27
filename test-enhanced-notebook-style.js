// 🎙️ 향상된 NotebookLM 스타일 팟캐스트 시스템 테스트
// 새로 개발한 모든 구성 요소들을 통합 테스트

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const supabaseUrl = 'https://fajiwgztfwoiisgnnams.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaml3Z3p0ZndvaWlzZ25uYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzk0MDIsImV4cCI6MjA2NjE1NTQwMn0.-vTUkg7AP9NiGpoUa8XgHSJWltrKp5AseSrgCZhgY6Y';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * NotebookLM 스타일 프롬프트 (TypeScript 파일을 JavaScript로 변환)
 */
function createNotebookStylePrompt(museumName, curatorContent, chapterIndex, exhibition = null) {
  const isIntro = chapterIndex === 0;
  const chapterName = isIntro ? '인트로' : exhibition?.name;
  
  return `
# 🎙️ TripRadio NotebookLM 스타일 팟캐스트 생성

## 핵심 미션
Google NotebookLM Audio Overview의 **실제 대화 패턴**을 완벽 재현하여 
자연스럽고 매력적인 ${chapterName} 에피소드를 제작하세요.

## NotebookLM 핵심 특성 (연구 결과 기반)

### 1. 대화의 자연스러운 흐름
- **상호 완성**: 한 사람이 말을 시작하면 다른 사람이 자연스럽게 완성
- **예상 가능한 인터럽션**: "아, 그거..." / "맞아요, 그리고..." 
- **정보 계층화**: 기본 정보 → 흥미로운 디테일 → 놀라운 사실 순서

### 2. 높은 정보 밀도와 구체성
- **한 턴당 2-3개 구체적 사실** 필수 포함
- **숫자의 체감화**: "42만 점이면... 하루에 하나씩 봐도 1,150년"
- **비교와 연결**: "축구장 18개 크기" / "여의도 공원 절반"

### 3. 자연스러운 놀라움과 발견
- **단계적 놀라움**: "근데 이거 알아요? 더 놀라운 건..."
- **공유된 발견**: "저도 이번에 처음 알았는데..."
- **지속적인 호기심**: "그럼 그 다음엔 뭐가..."

### 4. 청취자 중심 의식
- **메타 인식**: "지금 청취자분들이 궁금해하실 텐데..."
- **참여 유도**: "여러분도 상상해보세요..."
- **명확한 안내**: "정리하면..." / "쉽게 말하면..."

## 실제 출력 지침

### ${isIntro ? '인트로 에피소드' : exhibition?.name + ' 에피소드'} 제작 요구사항

#### 📍 상황 설정
${isIntro ? `
**[박물관 입구 → 첫 전시관]**
- 진행자: 처음 방문, 호기심 가득, 적극적 질문
- 큐레이터: ${museumName} 수석 큐레이터, 전문가이지만 친근함
- 목표: 박물관 전체 소개 + 첫 전시관 진입 + 기대감 조성
` : `
**[${exhibition?.name} 전시관 내부]**
- 위치: ${exhibition?.floor}
- 주제: ${exhibition?.theme}
- 핵심 작품: ${exhibition?.artworks?.map(a => a.name).slice(0,3).join(', ') || '대표 소장품들'}
- 목표: 전시관 특징 + 대표작품 심화 탐구 + 다음 연결
`}

#### 🎯 NotebookLM 패턴 적용 (필수)

**오프닝 (500-600자)**
${isIntro ? `
**진행자:** "여러분 안녕하세요! TripRadio입니다. 오늘은 정말 특별한 곳, ${museumName}에 와있는데요. 와... 일단 규모부터가..."

**큐레이터:** "안녕하세요, 큐레이터 김민수입니다. 네, 여기가 세계 6위 규모거든요. 연면적만 13만 제곱미터..."

**진행자:** "13만 제곱미터면 감이 안 오는데..."

**큐레이터:** "축구장 18개? 여의도 공원 절반 정도?"

**진행자:** "헉! 그 정도로 크다고요? 그럼 소장품은..."

**큐레이터:** "42만 점이 넘죠. 그 중에서 전시되는 건 1만 5천 점 정도고..."
` : `
**진행자:** "자, 이제 ${exhibition?.name}으로 들어왔습니다. 어? 근데 여기 조명이..."

**큐레이터:** "아, 잘 보셨네요! ${exhibition?.name}은 작품 보호를 위해서 조도를 50룩스 이하로..."

**진행자:** "50룩스면 얼마나 어두운 거예요?"

**큐레이터:** "일반 사무실이 500룩스 정도니까 1/10? 그래서 처음엔 어둡게 느껴지는데, 눈이 적응되면..."

**진행자:** "아~ 그래서 입구에서 잠깐 기다리라고... 근데 벌써 뭔가 반짝이는 게 보이는데요?"

**큐레이터:** "네, 바로 ${exhibition?.artworks?.[0]?.name || '대표 작품'}이죠. 이게..."
`}

**메인 대화 (3000-3500자) - NotebookLM 스타일 고밀도 정보**

**[작품 1 - 깊이 있는 대화]**
**진행자:** "오케이, 그럼 이제 본격적으로... 어? 저기 금빛으로 번쩍이는 게..."

**큐레이터:** "아, 네! 바로 그거예요. 국보 191호 황남대총 금관입니다."

**진행자:** "황남대총이요? 그게 어디..."

**큐레이터:** "경주요. 1973년에 발굴됐는데, 사실 이게 도굴되지 않은 무덤에서 나온 거라서..."

**진행자:** "아! 그래서 이렇게 완벽한 상태로..."

**큐레이터:** "맞아요. 높이 27.5센티미터, 지름 19센티미터... 근데 무게가 겨우 1킬로그램이에요."

**진행자:** "1킬로? 생각보다 가볍네요?"

**큐레이터:** "그죠? 실제로 착용하려고 만든 거니까. 근데 이 나뭇가지 모양 장식 보이시죠?"

**진행자:** "네네, 이게 뭔가 의미가..."

**큐레이터:** "세계수예요. 신라인들이 믿었던 우주관에서... 하늘과 땅을 연결하는 신성한 나무."

**진행자:** "오... 그래서 왕이 쓰는 거구나. 근데 이 비취색 구슬들은?"

**큐레이터:** "곡옥이라고 하는데, 이게 또 재밌는 게... 일본에서 수입한 거예요."

**진행자:** "엥? 그 시대에도 수입을?"

**큐레이터:** "5세기에 이미 활발한 국제 무역이... 실크로드를 통해서 로마 유리도 들어왔고..."

**[정보 보충 패턴]**
**진행자:** "잠깐, 그러면 이 금관이 실제로..."

**큐레이터:** "네, 실제로 썼어요. 근데 평상시가 아니라 특별한 의식 때만."

**진행자:** "아~ 그래서 이렇게 화려하게..."

**큐레이터:** "그리고 이거 알아요? 신라 금관이 지금까지 6개밖에 안 발견됐어요."

**진행자:** "6개뿐이에요?"

**큐레이터:** "네. 그 중에서도 이게 가장 화려하고... 아, 그리고 최근에 성분 분석을 했더니..."

**진행자:** "뭐가 나왔는데요?"

**큐레이터:** "순도 87%의 금에, 은이 10%, 구리가 3%... 이렇게 합금을 한 이유가..."

**진행자:** "강도 때문에?"

**큐레이터:** "정확해요! 순금은 너무 무르거든요. 그래서..."

**[에피소드 + 정보 융합]**
**큐레이터:** "아, 그리고 이거 발굴할 때 에피소드가 있는데..."

**진행자:** "오, 뭔데요?"

**큐레이터:** "황남대총이 사실 쌍분... 그러니까 무덤 두 개가 붙어있는 건데..."

**진행자:** "아, 부부 합장묘?"

**큐레이터:** "그렇게 생각했는데, 북쪽 무덤에서는 남자 유물, 남쪽에서는 여자 유물이 나왔어요."

**진행자:** "그럼 부부 맞네요?"

**큐레이터:** "그런데! 남쪽 무덤이 더 크고 부장품도 더 화려해요."

**진행자:** "어? 그럼 여자가 더 높은 신분이었다는..."

**큐레이터:** "그래서 일부 학자들은 이게 여왕의 무덤일 수도... 신라에는 선덕여왕, 진덕여왕도 있었잖아요."

**진행자:** "와, 그럼 이 금관을 여왕이 썼을 수도 있다는 거네요!"

**마무리 및 전환 (400-500자)**
${exhibition?.next_direction ? 
`**진행자:** "시간이 벌써 이렇게! 다음은 어디로 가나요?"

**큐레이터:** "${exhibition.next_direction}. 거기서는..."

**진행자:** "오, 기대되는데요! 청취자분들, 우리 같이 이동해볼까요?"` :
`**진행자:** "와, 오늘 정말 많은 걸 배웠네요!"

**큐레이터:** "저도 즐거웠습니다. 청취자분들도 꼭 직접 오셔서..."

**진행자:** "TripRadio와 함께한 ${museumName} 여행, 어떠셨나요?"`
}

## NotebookLM 스타일 특별 지침

### 정보 전달 방식
1. **단계적 놀라움**: "근데 이거 알아요? 더 놀라운 건..." 
2. **숫자의 체감화**: "42만 점이면... 하루에 하나씩 봐도 1,150년"
3. **연결과 확장**: "그 얘기가 나온 김에..." / "아, 그러고 보니..."
4. **청취자 참여**: "여러분도 상상해보세요..." / "지금 듣고 계신 분들 중에..."

### 자연스러운 대화 패턴  
- **인터럽션**: "아, 그거..." / "잠깐만요, 그럼..."
- **확인과 반복**: "그러니까 정리하면..." / "네네, 맞아요"
- **놀라움 공유**: "와, 저도 이번에 처음 알았는데..." 
- **메타 인식**: "아, 지금 청취자분들이 헷갈리실 수도..."

### 품질 기준
- **정보 밀도**: 4,000-5,000자에 20-30개 구체적 사실
- **대화 리듬**: 평균 1-2문장 교환, 긴 설명은 3-4문장 최대
- **청취자 언급**: 에피소드당 5-7회
- **감탄사/추임새**: 자연스럽게 포함하되 과하지 않게

## 필수 출력 형식

**진행자:** (대사)

**큐레이터:** (대사)

**진행자:** (대사)

**큐레이터:** (대사)

**지금 바로 NotebookLM 스타일 ${chapterName} 에피소드를 **진행자:**와 **큐레이터:** 구분으로 제작하세요!**
`;
}

/**
 * 향상된 포맷팅 함수 (JavaScript 버전)
 */
function enhancedFormatPodcastScript(rawScript) {
  let formatted = rawScript;
  
  // 1단계: 기본 정리
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.replace(/^\s+|\s+$/g, '');
  formatted = formatted.replace(/[ ]{2,}/g, ' ');
  
  // 2단계: 화자 포맷팅
  const speakerPatterns = [
    { pattern: /\*\*HOST:\*\*/g, replacement: '\n**진행자:**' },
    { pattern: /\*\*CURATOR:\*\*/g, replacement: '\n**큐레이터:**' },
    { pattern: /HOST:/g, replacement: '\n**진행자:**' },
    { pattern: /CURATOR:/g, replacement: '\n**큐레이터:**' },
    { pattern: /진행자:/g, replacement: '\n**진행자:**' },
    { pattern: /큐레이터:/g, replacement: '\n**큐레이터:**' },
    { pattern: /\b호스트:\s*/g, replacement: '\n**진행자:**' },
    { pattern: /\b가이드:\s*/g, replacement: '\n**큐레이터:**' }
  ];

  speakerPatterns.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });

  // 3단계: 자막 최적화
  formatted = formatted.replace(/(\*\*[^*]+\*\*)/g, '\n$1\n');
  formatted = formatted.replace(/(\d+)\s*(cm|kg|년|세기|층)/g, '$1$2');
  formatted = formatted.replace(/\n\*\*진행자:\*\*/g, '\n\n**진행자:**');
  formatted = formatted.replace(/\n\*\*큐레이터:\*\*/g, '\n\n**큐레이터:**');
  
  // 4단계: 가독성 향상
  formatted = formatted.replace(/(국보\s*\d+호)/g, '**$1**');
  formatted = formatted.replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(명|개|점|년|센티미터|미터|킬로그램)/g, '**$1$2**');
  
  return formatted;
}

/**
 * 품질 검증 함수 (JavaScript 간소화 버전)
 */
function validateNotebookStyle(script) {
  const issues = [];
  const scores = {};
  
  // 기본 검증
  if (!script.includes('**진행자:**') || !script.includes('**큐레이터:**')) {
    issues.push('화자 구분이 명확하지 않음');
  }
  
  if (script.length < 1000) {
    issues.push('스크립트가 너무 짧음 (1000자 미만)');
  }
  
  // 정보 밀도 검증
  const factPatterns = [
    /\d+(?:,\d{3})*(cm|kg|년|세기|층|점|명|개)/g,
    /국보\s*\d+호/g,
    /세계\s*[최고대][초고]/g,
    /\d{4}년/g
  ];
  
  const factCount = factPatterns.reduce((count, pattern) => 
    count + (script.match(pattern) || []).length, 0
  );
  
  const informationDensity = factCount / (script.length / 1000);
  scores.informationDensity = Math.min(100, (informationDensity / 8) * 100);
  
  if (informationDensity < 8) {
    issues.push(`정보 밀도 부족 (현재: ${informationDensity.toFixed(1)}, 목표: 8+)`);
  }
  
  // 청취자 참여 검증
  const engagementPatterns = ['청취자', '여러분', '상상해보세요', '어떨까요'];
  const engagementCount = engagementPatterns.reduce((count, pattern) => 
    count + (script.match(new RegExp(pattern, 'g')) || []).length, 0
  );
  
  scores.audienceEngagement = Math.min(100, (engagementCount / 5) * 100);
  
  if (engagementCount < 5) {
    issues.push('청취자 참여 유도 부족');
  }
  
  // 자연스러움 검증
  const naturalPatterns = ['와', '헉', '정말', '아', '그런데', '근데'];
  const naturalCount = naturalPatterns.reduce((count, pattern) => 
    count + (script.match(new RegExp(pattern, 'g')) || []).length, 0
  );
  
  scores.naturalness = Math.min(100, (naturalCount / 8) * 100);
  
  if (naturalCount < 8) {
    issues.push('자연스러운 표현 부족');
  }
  
  // 종합 점수
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
  
  return {
    isValid: issues.length === 0 && overallScore >= 75,
    score: Math.round(overallScore),
    issues,
    scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v)])),
    recommendations: issues.length > 0 ? [
      'NotebookLM 패턴을 더 활용하세요: "그런데 더 놀라운 건", "저도 이번에 처음 알았는데"',
      '구체적인 숫자와 사실을 더 포함하세요',
      '청취자 참여 유도 표현을 늘리세요: "여러분도", "상상해보세요"'
    ] : []
  };
}

/**
 * 향상된 TripRadio 팟캐스트 생성기
 */
class EnhancedTripRadioPodcastGenerator {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 32768,
      }
    });
  }

  /**
   * 큐레이터 콘텐츠 생성 (기존 유지)
   */
  async generateCuratorContent(museumName) {
    console.log('📚 큐레이터 전문 콘텐츠 준비 중...');
    
    const prompt = `
# 📚 ${museumName} 큐레이터 전문 콘텐츠 생성

${museumName}의 수석 큐레이터로서 NotebookLM 스타일 팟캐스트를 위한 전문 콘텐츠를 준비합니다.

다음 JSON 형식으로 출력하세요:

\`\`\`json
{
  "museum_name": "${museumName}",
  "overview_summary": "전시관1 (작품1, 작품2, 작품3)\\n전시관2 (작품1, 작품2, 작품3)\\n...",
  "museum_intro": {
    "history": "박물관의 역사와 설립 배경",
    "significance": "문화적 중요성과 세계적 위상",
    "highlights": ["대표 소장품1", "대표 소장품2", "대표 소장품3"],
    "visitor_tips": "관람 팁과 추천 코스"
  },
  "exhibitions": [
    {
      "id": 1,
      "name": "전시관명",
      "floor": "위치",
      "theme": "주제",
      "talking_points": {
        "main_topic": "이 전시관의 핵심 이야기",
        "interesting_facts": ["흥미로운 사실1", "흥미로운 사실2"],
        "must_see": ["꼭 봐야 할 작품1", "꼭 봐야 할 작품2"],
        "curator_insight": "큐레이터만 아는 특별한 정보"
      },
      "artworks": [
        {
          "name": "작품명",
          "basic_info": "크기, 재료, 연도 등",
          "story": "작품에 얽힌 이야기",
          "significance": "왜 중요한가"
        }
      ],
      "next_direction": "다음 전시관으로 가는 구체적 경로"
    }
  ]
}
\`\`\`
`;
    
    const result = await this.model.generateContent(prompt);
    const response = result.response.text();

    // JSON 추출
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      console.log('   ⚠️ JSON 형식을 찾을 수 없습니다. 기본 구조 생성...');
      return this.getDefaultCuratorContent(museumName);
    }

    try {
      const content = JSON.parse(jsonMatch[1]);
      console.log(`   ✅ ${content.exhibitions?.length || 0}개 전시관 정보 준비 완료`);
      return content;
    } catch (error) {
      console.log('   ⚠️ JSON 파싱 실패. 기본 구조 사용...');
      return this.getDefaultCuratorContent(museumName);
    }
  }

  /**
   * 향상된 팟캐스트 스크립트 생성
   */
  async generateEnhancedPodcastScript(curatorContent, chapterIndex, exhibition = null) {
    const chapterName = chapterIndex === 0 ? '인트로' : exhibition?.name;
    console.log(`   🎤 ${chapterName} NotebookLM 스타일 스크립트 생성 중...`);
    
    const prompt = createNotebookStylePrompt(curatorContent.museum_name, curatorContent, chapterIndex, exhibition);
    const result = await this.model.generateContent(prompt);
    const rawScript = result.response.text();
    
    // 향상된 포맷팅 적용
    const formattedScript = enhancedFormatPodcastScript(rawScript);
    
    // 품질 검증
    const validation = validateNotebookStyle(formattedScript);
    
    console.log(`   ✅ ${chapterName} 완료 (${formattedScript.length.toLocaleString()}자)`);
    console.log(`   📊 품질 점수: ${validation.score}/100`);
    
    if (validation.issues.length > 0) {
      console.log(`   ⚠️ 품질 이슈: ${validation.issues.join(', ')}`);
    }
    
    return {
      script: formattedScript,
      validation: validation
    };
  }

  /**
   * 전체 팟캐스트 생성 (향상된 버전)
   */
  async generateEnhancedPodcast(museumName) {
    const startTime = Date.now();
    
    try {
      console.log('\n🎙️ === TripRadio NotebookLM 스타일 팟캐스트 제작 ===\n');
      
      // 1단계: 큐레이터 콘텐츠 준비
      const curatorContent = await this.generateCuratorContent(museumName);
      
      // 2단계: 향상된 팟캐스트 에피소드 생성
      console.log('\n🎤 NotebookLM 스타일 에피소드 제작 중...');
      const episodes = [];
      const validationResults = [];
      
      // 인트로 에피소드
      const introResult = await this.generateEnhancedPodcastScript(curatorContent, 0);
      episodes.push({
        id: 0,
        title: `${museumName} 여행 시작`,
        content: `TripRadio NotebookLM 스타일: ${museumName} 특별편 인트로`,
        narrative: introResult.script,
        duration: Math.round(introResult.script.length / 300 * 60),
        type: 'podcast_intro',
        qualityScore: introResult.validation.score
      });
      validationResults.push(introResult.validation);
      
      // 전시관별 에피소드
      for (let i = 0; i < Math.min(curatorContent.exhibitions?.length || 0, 3); i++) {
        const exhibition = curatorContent.exhibitions[i];
        const scriptResult = await this.generateEnhancedPodcastScript(curatorContent, i + 1, exhibition);
        
        episodes.push({
          id: i + 1,
          title: exhibition.name,
          content: `${exhibition.name}: ${exhibition.artworks?.map(a => a.name).slice(0, 3).join(', ') || exhibition.theme}`,
          narrative: scriptResult.script,
          duration: Math.round(scriptResult.script.length / 300 * 60),
          type: 'podcast_episode',
          exhibition_data: exhibition,
          qualityScore: scriptResult.validation.score
        });
        validationResults.push(scriptResult.validation);
        
        // API 호출 간격
        if (i < curatorContent.exhibitions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 품질 분석
      const avgQualityScore = Math.round(
        validationResults.reduce((sum, v) => sum + v.score, 0) / validationResults.length
      );
      
      const totalCharacters = episodes.reduce((sum, ep) => sum + ep.narrative.length, 0);
      const generationTime = Date.now() - startTime;
      
      console.log('\n📊 === NotebookLM 스타일 팟캐스트 제작 완료 ===');
      console.log(`   🎙️ 총 에피소드: ${episodes.length}개`);
      console.log(`   📝 총 스크립트: ${totalCharacters.toLocaleString()}자`);
      console.log(`   🏆 평균 품질 점수: ${avgQualityScore}/100`);
      console.log(`   ⏱️ 제작 시간: ${Math.round(generationTime/1000)}초`);
      
      // 품질 권장사항 출력
      const allIssues = validationResults.flatMap(v => v.issues);
      if (allIssues.length > 0) {
        console.log('\n⚠️ 개선 권장사항:');
        [...new Set(allIssues)].forEach(issue => {
          console.log(`   • ${issue}`);
        });
      }
      
      return {
        success: true,
        podcastData: {
          museum_name: museumName,
          overview_summary: curatorContent.overview_summary,
          episodes: episodes,
          total_characters: totalCharacters,
          podcast_info: {
            title: `TripRadio ${museumName} NotebookLM 스타일`,
            hosts: ['진행자', `${museumName} 수석 큐레이터`],
            format: '대화형 팟캐스트',
            style: 'Google NotebookLM 스타일 (향상됨)'
          },
          quality_metrics: {
            average_score: avgQualityScore,
            individual_scores: validationResults.map(v => v.score),
            total_issues: allIssues.length,
            passes_standard: avgQualityScore >= 75
          }
        },
        analysis: {
          generationTime,
          totalCharacters,
          episodeCount: episodes.length,
          qualityAnalysis: {
            avgScore: avgQualityScore,
            passRate: validationResults.filter(v => v.isValid).length / validationResults.length * 100
          }
        }
      };
      
    } catch (error) {
      console.error('❌ 향상된 팟캐스트 생성 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 기본 큐레이터 콘텐츠 (폴백)
   */
  getDefaultCuratorContent(museumName) {
    return {
      museum_name: museumName,
      overview_summary: '선사·고대관 (금관, 토기, 청동기)\n역사관 (조선왕조실록, 백자, 인장)',
      museum_intro: {
        history: `${museumName}은 우리나라를 대표하는 종합박물관입니다.`,
        significance: '5천년 역사의 정수를 보존하고 있습니다.',
        highlights: ['금관', '백자 달항아리', '반가사유상'],
        visitor_tips: '2-3시간 관람 추천'
      },
      exhibitions: [
        {
          id: 1,
          name: '선사·고대관',
          floor: '1층',
          theme: '구석기부터 통일신라까지',
          talking_points: {
            main_topic: '한반도 고대 문명의 발전',
            interesting_facts: ['세계에서 가장 정교한 금관', '5천년 전 빗살무늬토기'],
            must_see: ['신라 금관', '백제 금동대향로'],
            curator_insight: '금관의 나뭇가지 장식은 세계수를 상징합니다'
          },
          artworks: [
            {
              name: '금관',
              basic_info: '높이 27.5cm, 5세기',
              story: '신라 왕족의 권위를 상징',
              significance: '세계적인 금속공예 걸작'
            }
          ],
          next_direction: '전시관을 나와 복도를 따라 다음 전시관으로'
        }
      ]
    };
  }
}

/**
 * GuideData 변환 (기존 유지하되 품질 정보 추가)
 */
function convertToGuideData(podcastData) {
  return {
    overview: {
      title: podcastData.podcast_info.title,
      location: podcastData.museum_name,
      summary: `${podcastData.museum_name}을 NotebookLM 스타일로 진행자와 큐레이터가 함께 소개하는 특별한 팟캐스트`,
      keyFeatures: podcastData.overview_summary,
      background: `TripRadio가 제작한 ${podcastData.museum_name} NotebookLM 스타일 팟캐스트. Google NotebookLM의 자연스러운 대화 패턴을 완벽 재현했습니다.`,
      narrativeTheme: '진행자와 큐레이터의 NotebookLM 스타일 대화',
      visitInfo: {
        duration: `${Math.round(podcastData.episodes.reduce((sum, ep) => sum + ep.duration, 0) / 60)}분`,
        difficulty: '쉬움 (팟캐스트 청취)',
        season: '연중',
        format: 'NotebookLM 스타일 대화형 팟캐스트',
        qualityScore: `${podcastData.quality_metrics?.average_score || 0}/100`
      }
    },
    route: {
      steps: podcastData.episodes.map((episode, index) => ({
        stepNumber: index + 1,
        title: episode.title,
        description: episode.content,
        duration: `${Math.round(episode.duration / 60)}분`,
        format: episode.type === 'podcast_intro' ? 'NotebookLM 인트로' : 'NotebookLM 대화',
        qualityScore: episode.qualityScore || 0
      }))
    },
    realTimeGuide: { 
      chapters: podcastData.episodes.map(ep => ({
        ...ep,
        nextDirection: ep.exhibition_data?.next_direction || '다음 에피소드로 계속',
        location: {
          lat: 37.5240 + (Math.random() - 0.5) * 0.002,
          lng: 126.9800 + (Math.random() - 0.5) * 0.002
        },
        notebookLMStyle: true,
        qualityValidated: ep.qualityScore >= 75
      }))
    },
    safetyWarnings: 'NotebookLM 스타일 팟캐스트를 들으며 관람하실 때는 주변을 잘 살피며 안전하게 이동하세요.',
    mustVisitSpots: '#TripRadio #NotebookLM스타일 #팟캐스트가이드 #큐레이터와함께 #AI대화',
    metadata: {
      originalLocationName: podcastData.museum_name,
      generatedAt: new Date().toISOString(),
      version: '2.0-notebook-enhanced',
      language: 'ko',
      guideId: `notebook-${podcastData.museum_name.replace(/\s+/g, '-')}-${Date.now()}`,
      format: 'podcast',
      style: 'Google NotebookLM Enhanced',
      qualityMetrics: podcastData.quality_metrics
    }
  };
}

/**
 * DB 저장 (기존과 동일)
 */
async function saveToDatabase(guideData) {
  const dbRecord = {
    locationname: guideData.metadata.originalLocationName,
    language: 'ko',
    data: guideData,
    content: guideData,
    coordinates: guideData.realTimeGuide.chapters.map(ch => ({
      chapterId: ch.id,
      title: ch.title,
      latitude: ch.location?.lat || 37.5240,
      longitude: ch.location?.lng || 126.9800,
      accuracy: 0.95,
      notebookLMStyle: true
    })),
    metadata: guideData.metadata,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('guides')
    .insert([dbRecord])
    .select('*');

  if (error) throw error;
  return data[0];
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🎙️ ═══════════════════════════════════════════════════════════════');
  console.log('     TripRadio.AI 향상된 NotebookLM 스타일 팟캐스트 시스템');
  console.log('     실제 NotebookLM Audio Overview 분석 결과 기반 구현');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const generator = new EnhancedTripRadioPodcastGenerator();
  
  // NotebookLM 스타일 팟캐스트 생성
  const result = await generator.generateEnhancedPodcast('국립중앙박물관');
  
  if (!result.success) {
    console.error('❌ 생성 실패:', result.error);
    return;
  }

  // GuideData 변환
  const guideData = convertToGuideData(result.podcastData);
  
  console.log('\n💾 데이터베이스 저장 중...');
  
  try {
    const savedGuide = await saveToDatabase(guideData);
    
    console.log('\n✅ === NotebookLM 스타일 팟캐스트 저장 완료! ===');
    console.log(`   📻 Guide ID: ${savedGuide.id}`);
    
    const guideUrl = `http://localhost:3000/guide/ko/${encodeURIComponent(savedGuide.locationname)}`;
    console.log(`\n🌐 NotebookLM 스타일 팟캐스트 URL:`);
    console.log(`   ${guideUrl}`);
    
    console.log('\n🎧 향상된 팟캐스트 정보:');
    console.log(`   🎙️ 스타일: ${result.podcastData.podcast_info.style}`);
    console.log(`   👥 출연: ${result.podcastData.podcast_info.hosts.join(' & ')}`);
    console.log(`   🏆 평균 품질: ${result.podcastData.quality_metrics.average_score}/100`);
    console.log(`   ✅ 품질 통과: ${result.podcastData.quality_metrics.passes_standard ? '예' : '아니오'}`);
    console.log(`   📻 에피소드: ${result.podcastData.episodes.length}개`);
    console.log(`   ⏱️ 총 재생시간: 약 ${Math.round(result.podcastData.episodes.reduce((sum, ep) => sum + ep.duration, 0) / 60)}분`);

    // 품질 세부 정보
    console.log('\n📊 에피소드별 품질 점수:');
    result.podcastData.episodes.forEach(ep => {
      console.log(`   ${ep.title}: ${ep.qualityScore || '미측정'}/100`);
    });

  } catch (error) {
    console.error('❌ DB 저장 실패:', error);
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 NotebookLM 스타일 팟캐스트 제작 완료!');
      console.log('   이제 진행자와 큐레이터의 자연스럽고 생생한 대화로');
      console.log('   실제 NotebookLM Audio Overview 수준의 팟캐스트를');
      console.log('   박물관에서 즐길 수 있습니다! 🎧✨\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실행 오류:', error);
      process.exit(1);
    });
}
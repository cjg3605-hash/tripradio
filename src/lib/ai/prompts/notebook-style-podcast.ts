/**
 * NotebookLM 스타일 팟캐스트 프롬프트 시스템
 * 실제 NotebookLM Audio Overview 분석 결과를 바탕으로 구현
 */

export interface NotebookStylePodcastConfig {
  museumName: string;
  curatorContent: any;
  chapterIndex: number;
  exhibition?: any;
  language?: 'ko' | 'en';
  targetLength?: number;
}

/**
 * NotebookLM 핵심 대화 패턴 분석 결과
 */
const NOTEBOOKLM_PATTERNS = {
  // 1. 오프닝 패턴
  openings: {
    ko: [
      "여러분 안녕하세요!",
      "오늘 정말 흥미로운 이야기가 있는데요",
      "자, 이번에는 특별한 곳으로 가보겠습니다"
    ],
    en: [
      "Hey everyone, welcome back",
      "So today we're diving into something really fascinating",
      "Alright, let's talk about something incredible"
    ]
  },

  // 2. 상호 확인 및 지지 표현
  affirmations: {
    ko: ["맞아요", "정확해요", "그렇죠", "네네", "아 그래요?", "정말요?"],
    en: ["Right", "Exactly", "Absolutely", "Yeah", "Oh wow", "Really?"]
  },

  // 3. 전환 및 연결 표현
  transitions: {
    ko: [
      "그 얘기가 나온 김에",
      "아, 그러고 보니",
      "근데 이거 알아요?",
      "더 놀라운 건",
      "잠깐, 그럼"
    ],
    en: [
      "Speaking of which",
      "Oh, and here's the thing",
      "But did you know",
      "What's even more amazing",
      "Wait, so"
    ]
  },

  // 4. 놀라움 및 흥미 표현
  excitement: {
    ko: [
      "와, 진짜요?",
      "헉! 그 정도로?",
      "이거 정말 신기한데",
      "저도 이번에 처음 알았어요",
      "상상도 못했네요"
    ],
    en: [
      "Wow, seriously?",
      "No way! That much?",
      "That's incredible",
      "I had no idea",
      "Mind-blowing"
    ]
  },

  // 5. 청취자 참여 유도
  audience_engagement: {
    ko: [
      "청취자분들도 상상해보세요",
      "지금 듣고 계신 분들 중에",
      "여러분이라면 어떨까요?",
      "청취자분들이 궁금해하실 것 같은데"
    ],
    en: [
      "Imagine if you were there",
      "For those of you listening",
      "What would you think?",
      "Our listeners are probably wondering"
    ]
  },

  // 6. 메타 코멘트 (대화에 대한 언급)
  meta_comments: {
    ko: [
      "지금 청취자분들이 헷갈리실 수도",
      "아, 지금 설명이 복잡했나요?",
      "이 부분이 중요한 포인트인데",
      "잠깐, 정리해보면"
    ],
    en: [
      "Our listeners might be confused right now",
      "Was that explanation too complex?",
      "This is the key point",
      "Let me summarize"
    ]
  }
};

/**
 * NotebookLM 스타일 대화 구조 템플릿
 */
const DIALOGUE_STRUCTURE = {
  // 정보 밀도: 한 턴당 2-3개 구체적 사실
  // 대화 리듬: 평균 1-2문장 교환
  // 자연스러운 인터럽션과 완성
  intro: {
    pattern: "오프닝 → 놀라운 사실 제시 → 상호 확인 → 기대감 조성",
    length: "500-600자",
    infoPoints: "3-4개"
  },
  
  main: {
    pattern: "주제 소개 → 깊이 있는 탐구 → 연결된 사실들 → 놀라운 발견",
    length: "3000-3500자", 
    infoPoints: "20-25개"
  },
  
  transition: {
    pattern: "현재 주제 마무리 → 다음 연결점 → 기대감 → 자연스러운 이동",
    length: "400-500자",
    infoPoints: "2-3개"
  }
};

/**
 * 메인 NotebookLM 스타일 프롬프트 생성기
 */
export function createNotebookStylePodcastPrompt(config: NotebookStylePodcastConfig): string {
  const { museumName, curatorContent, chapterIndex, exhibition, language = 'ko', targetLength = 5000 } = config;
  
  const patterns = NOTEBOOKLM_PATTERNS;
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
진행자: "${patterns.openings.ko[0]} TripRadio입니다. 오늘은 정말 특별한 곳, ${museumName}에 와있는데요. 와... 일단 규모부터가..."

큐레이터: "안녕하세요, 큐레이터 ${generateCuratorName()}입니다. 네, 여기가 ${generateScaleComparison()}..."

진행자: "${generateSurpriseReaction()}..."

큐레이터: "${generateSpecificFacts()}..."

진행자: "${generateCuriousQuestion()}?"

큐레이터: "${generateEngagingAnswer()}..."
` : `
진행자: "자, 이제 ${exhibition?.name}으로 들어왔습니다. 어? 근데 여기 ${generateEnvironmentObservation()}..."

큐레이터: "아, 잘 보셨네요! ${exhibition?.name}은 ${generateTechnicalExplanation()}..."

진행자: "${generateComparison()}?"

큐레이터: "${generateDetailedExplanation()}..."

진행자: "아~ 그래서... 근데 벌써 ${generateArtworkSpotting()}?"

큐레이터: "네, 바로 ${exhibition?.artworks?.[0]?.name || '대표 작품'}이죠. 이게..."
`}

**메인 대화 (${targetLength - 1000}자) - 초고밀도 정보**

${generateMainDialogueTemplate(config)}

**마무리 및 전환 (400-500자)**
${generateTransitionTemplate(config)}

#### 💡 NotebookLM 대화 기법 (필수 적용)

1. **정보 계층화**
   - 1단계: 기본 사실 ("이게 국보 191호 금관입니다")
   - 2단계: 흥미로운 디테일 ("높이 27.5cm, 무게 1킬로그램") 
   - 3단계: 놀라운 사실 ("곡옥은 일본에서 수입한 거예요")

2. **자연스러운 인터럽션**
   - "아, 그거..." / "맞아요, 그리고..." / "잠깐만요, 그럼..."
   - 상대방 말을 받아서 정보 추가하기
   - 예상되는 질문을 미리 대답하기

3. **청취자 의식**
   - "청취자분들이 지금 궁금해하실 텐데..."
   - "여러분도 상상해보세요..."
   - "이 부분이 중요한 포인트인데..."

4. **감정적 몰입**
   - 진짜 놀라는 반응: "헉! 그 정도로?"
   - 공감대 형성: "저도 처음 알았을 때..."
   - 호기심 자극: "더 놀라운 건..."

## 필수 출력 형식

**진행자:** (대사)

**큐레이터:** (대사)

**진행자:** (대사)

**큐레이터:** (대사)

## 품질 기준 (NotebookLM 수준)

- ✅ **정보 밀도**: ${Math.round(targetLength/200)}개 이상의 구체적 사실
- ✅ **대화 리듬**: 평균 1-2문장 교환, 자연스러운 호흡
- ✅ **청취자 언급**: 에피소드당 5-7회
- ✅ **놀라움 요소**: 3-4회의 "와, 정말요?" 순간
- ✅ **연결성**: 각 정보가 자연스럽게 연결
- ✅ **전문성**: 큐레이터다운 깊이 있는 지식
- ✅ **접근성**: 일반인도 이해할 수 있는 설명

**지금 바로 NotebookLM 스타일 ${chapterName} 에피소드를 **진행자:**와 **큐레이터:** 형식으로 제작하세요!**
`;
}

/**
 * 메인 대화 템플릿 생성
 */
function generateMainDialogueTemplate(config: NotebookStylePodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
**[박물관 규모와 의미 탐구 - 1000자]**
- 구체적 숫자로 규모감 전달 (면적, 소장품 수, 역사)
- 체감할 수 있는 비교 ("축구장 몇 개", "여의도 공원 크기")
- 건설/이전 스토리와 특별한 에피소드
- 세계적 위상과 독특한 특징

**[오늘의 여정 소개 - 1000자]**
- 추천 관람 동선과 소요 시간
- 각 전시관의 하이라이트 미리보기
- 숨겨진 볼거리와 큐레이터 추천 포인트
- 첫 전시관으로의 자연스러운 연결

**[기대감 조성과 특별 정보 - 800자]**
- 오늘 만날 "세계 최고" 급 작품들
- 일반인은 모르는 흥미로운 사실들  
- 최근 연구 성과나 새로운 발견
- 첫 전시관 진입 전 마지막 티저
`;
  } else {
    return `
**[대표작품 1 집중 탐구 - 1200자]**
- 첫인상과 기본 정보 (크기, 재료, 시대)
- 제작 기법과 예술적 가치
- 역사적 배경과 발견 스토리
- 숨겨진 의미와 상징
- 최신 연구 결과나 복원 과정

**[작품간 연결과 맥락 - 1000자]**
- 시대적 배경과 문화적 맥락
- 다른 작품들과의 관계
- 당시 사람들의 생활상
- 현대적 의미와 교훈

**[큐레이터 특별 인사이트 - 800자]**
- 전시 기획 의도와 스토리
- 관람객들이 놓치기 쉬운 디테일
- 작품 보존과 관리 에피소드
- 전문가만 아는 특별한 정보
`;
  }
}

/**
 * 전환 템플릿 생성
 */
function generateTransitionTemplate(config: NotebookStylePodcastConfig): string {
  const { exhibition, chapterIndex } = config;
  
  if (chapterIndex === 0) {
    return `
진행자: "와, 벌써 시간이 이렇게! 이제 정말 첫 전시관으로..."

큐레이터: "네, 바로 ${config.curatorContent?.exhibitions?.[0]?.name}으로 가보겠습니다. 거기서는..."

진행자: "오, 기대되는데요! 청취자분들, 우리 같이 들어가볼까요?"

큐레이터: "자, 그럼 1500년 전 신라로 시간여행을 떠나볼까요?"
`;
  } else {
    return `
진행자: "시간이 정말 빠르네요. 다음은 어디로..."

큐레이터: "${exhibition?.next_direction || '다음 전시관으로 이동하겠습니다'}. 거기서는 또 다른 놀라운..."

진행자: "청취자분들도 저처럼 흥미진진하시죠? 계속 함께해요!"

큐레이터: "네, 더 놀라운 이야기들이 기다리고 있으니까요."
`;
  }
}

/**
 * 헬퍼 함수들
 */
function generateCuratorName(): string {
  const names = ['김민수', '이지영', '박문화', '최유리', '정역사'];
  return names[Math.floor(Math.random() * names.length)];
}

function generateScaleComparison(): string {
  const comparisons = [
    '세계 6위 규모거든요. 연면적만 13만 제곱미터...',
    '축구장 18개 크기입니다. 소장품만 42만 점이...',
    '여의도 공원 절반 정도 되는 규모예요...'
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateSurpriseReaction(): string {
  const reactions = [
    '13만 제곱미터면 감이 안 오는데',
    '헉! 그 정도로 크다고요?',
    '와, 상상도 못했네요'
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function generateSpecificFacts(): string {
  return '42만 점이 넘죠. 그 중에서 전시되는 건 1만 5천 점 정도고';
}

function generateCuriousQuestion(): string {
  const questions = [
    '잠깐, 그럼 나머지는',
    '그럼 소장품은 어떻게',
    '어떻게 그렇게 많은 걸'
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateEngagingAnswer(): string {
  return '수장고에 있죠. 주기적으로 교체하면서 전시하고...';
}

function generateEnvironmentObservation(): string {
  const observations = [
    '조명이 특이한데요',
    '분위기가 완전 달라졌네요',
    '온도가 다른 것 같은데'
  ];
  return observations[Math.floor(Math.random() * observations.length)];
}

function generateTechnicalExplanation(): string {
  return '작품 보호를 위해서 조도를 50룩스 이하로 관리하고 있어서';
}

function generateComparison(): string {
  const comparisons = [
    '50룩스면 얼마나 어두운 거예요',
    '그럼 평소보다 훨씬 어둡겠네요',
    '일반 실내보다 어두운 건가요'
  ];
  return comparisons[Math.floor(Math.random() * comparisons.length)];
}

function generateDetailedExplanation(): string {
  return '일반 사무실이 500룩스 정도니까 1/10? 그래서 처음엔 어둡게 느껴지는데, 눈이 적응되면';
}

function generateArtworkSpotting(): string {
  const spottings = [
    '뭔가 반짝이는 게 보이는데요',
    '저기 황금색으로 빛나는 게',
    '금빛으로 번쩍이는 게 눈에 띄네요'
  ];
  return spottings[Math.floor(Math.random() * spottings.length)];
}

/**
 * 기존 시스템과의 호환성을 위한 래퍼 함수
 */
export function createEnhancedPodcastPrompt(
  museumName: string,
  curatorContent: any,
  chapterIndex: number,
  exhibition?: any
): string {
  return createNotebookStylePodcastPrompt({
    museumName,
    curatorContent, 
    chapterIndex,
    exhibition,
    language: 'ko',
    targetLength: 5000
  });
}

export default {
  createNotebookStylePodcastPrompt,
  createEnhancedPodcastPrompt,
  NOTEBOOKLM_PATTERNS,
  DIALOGUE_STRUCTURE
};
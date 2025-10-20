/**
 * 한국어 팟캐스트 프롬프트 시스템
 * NotebookLM 스타일 최적화된 한국어 대화 생성
 * 기존 우수 프롬프트들을 통합한 완성도 높은 시스템
 */

import { HOST_PERSONA, CURATOR_PERSONA, type PodcastPersona } from '@/lib/ai/personas/podcast-personas';
import type { PodcastPromptConfig } from './index';

// ===============================
// 🔧 NotebookLM 대화 패턴 시스템
// ===============================

/**
 * 실제 NotebookLM Audio Overview 분석을 통한 핵심 대화 패턴
 */
const NOTEBOOKLM_PATTERNS = {
  // 1. 오프닝 패턴 - 자연스러운 시작
  openings: [
    "여러분 안녕하세요!",
    "오늘 정말 흥미로운 이야기가 있는데요",
    "자, 이번에는 특별한 곳으로 가보겠습니다",
    "와, 여기 진짜 대단한 곳이네요",
    "TripRadio입니다. 오늘은 정말 특별한 곳에 와있는데요"
  ],

  // 2. 상호 확인 및 지지 표현 - NotebookLM의 핵심
  affirmations: [
    "맞아요", "정확해요", "그렇죠", "네네", 
    "아 그래요?", "정말요?", "와, 그런가요?", "헉, 진짜요?"
  ],

  // 3. 전환 및 연결 표현 - 자연스러운 화제 이동
  transitions: [
    "그 얘기가 나온 김에",
    "아, 그러고 보니", 
    "근데 이거 알아요?",
    "더 놀라운 건",
    "잠깐, 그럼",
    "그러니까 말씀드리면",
    "바로 그 부분이"
  ],

  // 4. 놀라움 및 흥미 표현 - 감정적 몰입
  excitement: [
    "와, 진짜요?",
    "헉! 그 정도로?", 
    "이거 정말 신기한데",
    "저도 이번에 처음 알았어요",
    "상상도 못했네요",
    "어? 그런 게 있었어요?",
    "진짜 놀라운데요?"
  ],

  // 5. 청취자 참여 유도 - NotebookLM의 특징
  audience_engagement: [
    "청취자분들도 상상해보세요",
    "지금 듣고 계신 분들 중에",
    "여러분이라면 어떨까요?",
    "청취자분들이 궁금해하실 것 같은데",
    "우리 함께 생각해볼까요?",
    "여러분도 놀라셨죠?"
  ],

  // 6. 메타 코멘트 - 대화에 대한 언급
  meta_comments: [
    "지금 청취자분들이 헷갈리실 수도",
    "아, 지금 설명이 복잡했나요?",
    "이 부분이 중요한 포인트인데",
    "잠깐, 정리해보면",
    "쉽게 말하면",
    "좀 더 구체적으로는"
  ]
};

/**
 * 정보 밀도와 구조 템플릿
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

// ===============================
// 🔧 페르소나 통합 시스템
// ===============================

/**
 * 페르소나 특성을 프롬프트에 포함시키기 위한 함수
 */
function applyPersonaCharacteristics(persona: PodcastPersona, role: string): string {
  return `
${persona.name}는 다음과 같은 특성을 가진 ${role} 캐릭터입니다:
- 인물: ${persona.characteristics.personality.slice(0, 2).join(', ')}
- 전문 분야: ${persona.characteristics.expertise.slice(0, 2).join(', ')}
- 대화 방식: ${persona.characteristics.conversationPatterns.slice(0, 2).join(', ')}
`.trim();
}

/**
 * Host와 Curator만 사용 (구체적 이름 제거)
 */
function getHostCuratorDescriptions(): { host: string; curator: string } {
  return {
    host: '호기심 많고 친근한 진행자 - 청중에게 질문을 던지고 공감하는 역할',
    curator: '전문적이지만 친근한 큐레이터 - 깊이 있는 정보와 통찰력 제공'
  };
}

// ===============================
// 🔧 메인 프롬프트 생성 함수들
// ===============================

/**
 * 챕터별 한국어 팟캐스트 프롬프트 생성 (기존 API 호환)
 */
export function createKoreanPodcastPrompt(config: PodcastPromptConfig): string {
  const { locationName, chapter, locationContext, personaDetails, locationAnalysis, language } = config;

  // Host와 Curator 페르소나 설정
  const hostPersona = HOST_PERSONA;
  const curatorPersona = CURATOR_PERSONA;
  const hostName = 'Host';
  const curatorName = 'Curator';
  const targetLength = chapter.targetDuration * 8; // 초당 8자 기준

  return `
## 핵심 미션
Google NotebookLM Audio Overview의 **실제 대화 패턴**을 완벽 재현하여 
자연스럽고 매력적인 ${locationName} - ${chapter.title} 에피소드를 제작하세요.

## 챕터 정보
- **제목**: ${chapter.title}
- **설명**: ${chapter.description}  
- **목표 시간**: ${chapter.targetDuration}초 (약 ${Math.round(chapter.targetDuration/60)}분)
- **예상 세그먼트**: ${chapter.estimatedSegments}개
- **주요 내용**: ${chapter.contentFocus.join(', ')}

## 활성화된 전문가 페르소나
${personaDetails.map(p => 
  `### ${p.name}\n${p.description}\n전문분야: ${p.expertise.join(', ')}`
).join('\n\n')}

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

## 📍 페르소나 기반 대화 설정

### 진행자 (${hostPersona.name}) 특성
${applyPersonaCharacteristics(hostPersona, '호기심 많고 적극적인 질문자 역할')}
- **말투**: ${hostPersona.characteristics.speakingStyle.join(', ')}
- **반응 패턴**: ${hostPersona.responses.surprise.slice(0, 3).join(', ')}
- **질문 스타일**: ${hostPersona.notebookLMPatterns.questions.slice(0, 2).join(', ')}

### 큐레이터 (${curatorPersona.name}) 특성  
${applyPersonaCharacteristics(curatorPersona, '전문가이지만 친근한 해설자 역할')}
- **설명 스타일**: ${curatorPersona.characteristics.speakingStyle.join(', ')}
- **전문성 표현**: ${curatorPersona.responses.explanation.slice(0, 3).join(', ')}
- **연결 패턴**: ${curatorPersona.responses.transition.slice(0, 2).join(', ')}

## 🎯 NotebookLM 패턴 적용 (필수)

**오프닝 구조 (500-600자)**
진행자: "${NOTEBOOKLM_PATTERNS.openings[0]} TripRadio입니다. 오늘은 ${locationName}에 와있는데요..."

큐레이터: "안녕하세요, Curator입니다. 여기 ${locationName}은..."

**메인 대화 구조 (${targetLength - 1000}자) - 초고밀도 정보**

${generateMainDialogueTemplate(chapter, locationAnalysis)}

**마무리 및 전환 (400-500자)**  
${generateTransitionTemplate(chapter)}

## 💡 NotebookLM 대화 기법 (필수 적용)

1. **정보 계층화**
   - 1단계: 기본 사실 ("이게 ${locationName}의 대표적인...")
   - 2단계: 흥미로운 디테일 ("높이 27.5cm, 무게 1킬로그램") 
   - 3단계: 놀라운 사실 ("실제로는 1500년 전 기술로...")

2. **자연스러운 인터럽션**
   - ${NOTEBOOKLM_PATTERNS.transitions.slice(0, 3).join(' / ')}
   - 상대방 말을 받아서 정보 추가하기
   - 예상되는 질문을 미리 대답하기

3. **청취자 의식**
   - ${NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 3).join(' / ')}
   - ${NOTEBOOKLM_PATTERNS.meta_comments.slice(0, 2).join(' / ')}

4. **감정적 몰입**
   - 진짜 놀라는 반응: ${NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(' / ')}
   - 공감대 형성: "저도 처음 알았을 때..." / "정말 신기하죠?"
   - 호기심 자극: "더 놀라운 건..." / "그런데 이것도 알아요?"

## 필수 출력 형식

**male:** (대사)

**female:** (대사)

**male:** (대사)

**female:** (대사)

## 절대 금지사항
- 마크다운 형식 (**, ##, * 등) 절대 사용 금지
- 이모지 사용 금지
- 추상적 미사여구 ("아름다운", "놀라운" 등) 금지
- 추측성 표현 ("아마도", "~것 같다") 금지

## 품질 기준 (NotebookLM 수준)

- ✅ **정보 밀도**: ${Math.round(targetLength/200)}개 이상의 구체적 사실
- ✅ **대화 리듬**: 평균 1-2문장 교환, 자연스러운 호흡
- ✅ **청취자 언급**: 에피소드당 5-7회
- ✅ **놀라움 요소**: 3-4회의 "와, 정말요?" 순간
- ✅ **연결성**: 각 정보가 자연스럽게 연결
- ✅ **전문성**: 큐레이터다운 깊이 있는 지식
- ✅ **접근성**: 일반인도 이해할 수 있는 설명

**지금 바로 NotebookLM 스타일 ${chapter.title} 에피소드를 **male:**와 **female:** 형식으로 제작하세요!**
`;
}

/**
 * 전체 가이드 한국어 팟캐스트 프롬프트 생성
 */
export function createKoreanFullGuidePrompt(
  locationName: string,
  guideData: any,
  options: {
    priority?: 'engagement' | 'accuracy' | 'emotion';
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    podcastStyle?: 'deep-dive' | 'casual' | 'educational' | 'exploratory';
  } = {}
): string {
  const { priority = 'engagement', audienceLevel = 'beginner', podcastStyle = 'educational' } = options;
  // Host/Curator 페르소나 설정
  const hostPersona = HOST_PERSONA;
  const curatorPersona = CURATOR_PERSONA;
  const hostName = 'Host';
  const curatorName = 'Curator';
  
  const styleConfig = {
    'deep-dive': '심층 분석과 전문적 해설',
    'casual': '편안하고 친근한 대화',
    'educational': '교육적이고 체계적인 설명',
    'exploratory': '탐험적이고 발견 중심의 대화'
  };

  const audienceConfig = {
    'beginner': '일반인 눈높이의 쉬운 설명',
    'intermediate': '기본 지식이 있는 관심있는 청중',
    'advanced': '깊이 있는 배경지식을 원하는 전문가급'
  };

  return `
## 🎙️ TripRadio NotebookLM 스타일 전체 가이드 팟캐스트 생성

### 핵심 미션  
${locationName}에 대한 완전한 이해를 위한 **NotebookLM 스타일 전체 가이드 팟캐스트**를 제작하세요.
${styleConfig[podcastStyle]}으로 ${audienceConfig[audienceLevel]}에 맞춰 구성합니다.

### 가이드 정보 분석
**장소**: ${locationName}
**우선순위**: ${priority} (관여도/정확성/감정 중심)
**청중 수준**: ${audienceLevel}  
**팟캐스트 스타일**: ${podcastStyle}

### 전체 구성 전략

#### 1단계: 전체적 소개 (1000-1200자)
${hostName}: "${NOTEBOOKLM_PATTERNS.openings[1]} ${locationName}에 대한 완전한 이야기를 들려드릴게요..."

${curatorName}: "${locationName}은 단순히 관광지가 아니라..."

**포함 요소**:
- 장소의 전체적 의미와 중요성
- 오늘 다룰 핵심 주제들 미리보기
- 청취자들이 기대할 수 있는 것들
- ${NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 2).join(', ')}

#### 2단계: 역사와 문화적 맥락 (1500-1800자)
**정보 계층화 적용**:
- 기본 역사적 배경
- 문화적 의미와 가치
- 현대적 중요성
- 국제적 위상

**NotebookLM 패턴**:
- ${NOTEBOOKLM_PATTERNS.transitions[0]} + 구체적 사실 2-3개
- ${NOTEBOOKLM_PATTERNS.excitement[1]} + 놀라운 발견
- ${NOTEBOOKLM_PATTERNS.meta_comments[2]} + 청취자 안내

#### 3단계: 핵심 특징과 볼거리 (1800-2000자)  
**페르소나 특성 활용**:
- ${hostPersona.name}: ${hostPersona.responses.curiosity.slice(0, 2).join(', ')}
- ${curatorPersona.name}: ${curatorPersona.responses.explanation.slice(0, 2).join(', ')}

**구체적 정보 제공**:
- 대표적인 볼거리와 특징
- 숨겨진 디테일과 전문가 인사이트  
- 관람 팁과 추천 동선
- 계절별/시간대별 특색

#### 4단계: 체험과 활동 (1000-1200자)
**실용적 정보**:
- 추천 체험 활동
- 포토스팟과 기념품
- 주변 연계 관광지
- 교통과 편의시설

#### 5단계: 마무리와 감상 (800-1000자)
**감정적 마무리**:
- ${locationName}만의 특별함 정리
- 방문 후 느낄 수 있는 감동 포인트
- ${NOTEBOOKLM_PATTERNS.audience_engagement[0]}
- 다음 여행지 힌트

### NotebookLM 품질 기준

- **정보 밀도**: 전체 35-40개의 구체적 사실
- **대화 교환**: 100-120회의 자연스러운 턴
- **청취자 언급**: 15-20회의 적극적 참여 유도
- **놀라움 순간**: 8-10회의 "와, 정말요?" 반응
- **페르소나 일관성**: 두 캐릭터의 뚜렷한 개성 유지

### 페르소나 적용 지침

**${hostPersona.name} (진행자)**:
- 특성: ${hostPersona.characteristics.personality.slice(0, 2).join(', ')}
- 말투: ${hostPersona.characteristics.speakingStyle.slice(0, 2).join(', ')}
- 반응: ${hostPersona.responses.surprise.slice(0, 3).join(', ')}

**${curatorPersona.name} (큐레이터)**:
- 특성: ${curatorPersona.characteristics.personality.slice(0, 2).join(', ')}
- 설명법: ${curatorPersona.characteristics.conversationPatterns.slice(0, 2).join(', ')}
- 전문성: ${curatorPersona.responses.explanation.slice(0, 3).join(', ')}

## 최종 출력 형식

**male:** (대사)
**female:** (대사)

**절대 마크다운, 이모지, 추상적 표현 금지!**

지금 바로 ${locationName} 완전 가이드 팟캐스트를 NotebookLM 수준으로 제작하세요!
`;
}

// ===============================
// 🔧 헬퍼 함수들
// ===============================

/**
 * 메인 대화 템플릿 생성
 */
function generateMainDialogueTemplate(chapter: any, locationAnalysis: any): string {
  const dialogueTypes = [
    `**[핵심 내용 1 집중 탐구 - 1200자]**
- 첫인상과 기본 정보 제시
- 구체적 수치와 비교 데이터
- ${NOTEBOOKLM_PATTERNS.excitement[0]} → 놀라운 사실 연결
- ${NOTEBOOKLM_PATTERNS.transitions[1]} → 다음 정보로 연결`,

    `**[심화 정보와 맥락 - 1000자]** 
- 역사적/문화적 배경 설명
- ${NOTEBOOKLM_PATTERNS.meta_comments[0]} → 청취자 이해도 확인
- 전문가 인사이트와 최신 정보
- ${NOTEBOOKLM_PATTERNS.audience_engagement[1]} → 참여 유도`,

    `**[특별 디테일과 발견 - 800자]**
- 일반인이 놓치기 쉬운 포인트
- ${NOTEBOOKLM_PATTERNS.affirmations[2]} → 상호 확인
- 큐레이터만 아는 특별 정보  
- ${NOTEBOOKLM_PATTERNS.transitions[3]} → 마무리 연결`
  ];

  return dialogueTypes.join('\n\n');
}

/**
 * 전환 템플릿 생성
 */
function generateTransitionTemplate(chapter: any): string {
  return `
**자연스러운 마무리:**

male: "${NOTEBOOKLM_PATTERNS.transitions[0]}, 시간이 정말 빠르네요. ${chapter.title}에서..."

female: "네, ${NOTEBOOKLM_PATTERNS.affirmations[1]}. 다음에는 또 다른 놀라운..."

male: "${NOTEBOOKLM_PATTERNS.audience_engagement[0]} 저희와 같이..."

female: "계속해서 더 흥미진진한 이야기들이 기다리고 있으니까요."

**핵심 적용 패턴:**
- ${NOTEBOOKLM_PATTERNS.transitions.slice(0, 2).join(' → ')}
- ${NOTEBOOKLM_PATTERNS.affirmations.slice(0, 2).join(' → ')}  
- ${NOTEBOOKLM_PATTERNS.audience_engagement[0]} (필수 포함)
`;
}

// ===============================
// 🔧 기본 Export
// ===============================

const KoreanPodcastModule = {
  createKoreanPodcastPrompt,
  createKoreanFullGuidePrompt,
  NOTEBOOKLM_PATTERNS,
  DIALOGUE_STRUCTURE,
  applyPersonaCharacteristics
};

export default KoreanPodcastModule;
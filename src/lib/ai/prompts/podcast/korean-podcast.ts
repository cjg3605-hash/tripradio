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
 * 팟캐스트 전문가 + 프롬프트 전문가 확장 버전
 */
const NOTEBOOKLM_PATTERNS = {
  // 1. [male] 진행자의 질문 패턴 - 호기심 기반
  hostQuestions: {
    discovery: [
      "어? 그게 뭐예요?",
      "왜 그런가요?",
      "어떻게 그렇게 됐어요?",
      "정말로 그래요?",
      "그럼 어떻게 되는 거예요?"
    ],
    clarification: [
      "구체적으로 뭔데요?",
      "그게 뭐 하는 거예요?",
      "얼마나 되나요?",
      "언제부터인가요?",
      "어디에 있어요?"
    ],
    experience: [
      "그럼 여기 왔을 때 뭘 봐야 해요?",
      "직접 가봤어요?",
      "어떻게 느꼈어요?",
      "가장 인상적인 게 뭐예요?",
      "청취자분들이 뭘 꼭 봐야 해요?"
    ]
  },

  // 2. [female] 큐레이터의 설명 패턴 - 정보 기반
  curatorAnswers: {
    basic: [
      "정확해요. [사실 1]이거든요.",
      "맞아요. [사실 1], 그리고 [사실 2]예요.",
      "[장소]는 [기본 설명]이에요.",
      "네, [사실 1]입니다. [사실 2]도 포함해서요."
    ],
    detailed: [
      "[기본 설명]. 특히 [디테일 1], [디테일 2]가 특징이에요.",
      "[숫자]만큼 [의미]하는 거죠. 그래서 [사실]이에요.",
      "[역사적 배경]. 그 영향으로 지금도 [현재 상황]이에요."
    ],
    engaging: [
      "[사실]이에요. 그리고 이게 중요한데요, [왜 중요한가]이거든요.",
      "[숫자]예요. 생각해보면 [체감]하는 규모잖아요.",
      "[설명]. 이 부분이 중요한 포인트인데, [핵심]이에요."
    ]
  },

  // 3. 턴 교대 연결 패턴
  turnTransitions: {
    hostToQuestion: [
      "어? 그럼 [추가질문]?",
      "와, 그렇군요. 그럼 [다음질문]?",
      "정말이네요. [새로운 방향의 질문]은?"
    ],
    curatorToExplain: [
      "네, 정확해요. [추가설명]이거거든요.",
      "맞아요. 거기다 [더 깊은 정보]도 있어요.",
      "그렇죠. 여기서 중요한 게 [핵심]이에요."
    ]
  },

  // 4. 오프닝 패턴 - 자연스러운 시작
  openings: [
    "여러분 안녕하세요!",
    "오늘 정말 흥미로운 이야기가 있는데요",
    "자, 이번에는 특별한 곳으로 가보겠습니다",
    "와, 여기 진짜 대단한 곳이네요",
    "오, 여기가 유명한 그곳이네요"
  ],

  // 5. 상호 확인 및 지지 표현 - NotebookLM의 핵심
  affirmations: [
    "맞아요", "정확해요", "그렇죠", "네네",
    "아 그래요?", "정말요?", "와, 그런가요?", "헉, 진짜요?",
    "그렇군요", "흥미로운데요"
  ],

  // 6. 전환 및 연결 표현 - 자연스러운 화제 이동
  transitions: [
    "그 얘기가 나온 김에",
    "아, 그러고 보니",
    "근데 이거 알아요?",
    "더 놀라운 건",
    "잠깐, 그럼",
    "그러니까 말씀드리면",
    "바로 그 부분이",
    "그런데 여기서 특별한 게"
  ],

  // 7. 놀라움 및 흥미 표현 - 감정적 몰입
  excitement: [
    "와, 진짜요?",
    "헉! 그 정도로?",
    "이거 정말 신기한데",
    "저도 이번에 처음 알았어요",
    "상상도 못했네요",
    "어? 그런 게 있었어요?",
    "진짜 놀라운데요?",
    "그렇군요, 몰랐어요"
  ],

  // 8. 청취자 참여 유도 - NotebookLM의 특징
  audience_engagement: [
    "청취자분들도 상상해보세요",
    "지금 듣고 계신 분들 중에",
    "여러분이라면 어떨까요?",
    "청취자분들이 궁금해하실 것 같은데",
    "우리 함께 생각해볼까요?",
    "여러분도 놀라셨죠?",
    "생각해보시면"
  ],

  // 9. 메타 코멘트 - 대화에 대한 언급
  meta_comments: [
    "지금 청취자분들이 헷갈리실 수도",
    "아, 지금 설명이 복잡했나요?",
    "이 부분이 중요한 포인트인데",
    "잠깐, 정리해보면",
    "쉽게 말하면",
    "좀 더 구체적으로는",
    "많은 분들이 놓치는 게"
  ],

  // 10. 마무리 및 다음 스팟 연결
  closings: [
    "정말 특별한 곳이네요",
    "꼭 봐야할 곳이에요",
    "이제 다음 스팟으로 가볼까요?",
    "그럼 이제 [다음장소]는?"
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
  const { locationName, chapter, locationContext, personaDetails, locationAnalysis, language, previousLastSpeaker } = config;

  // Host와 Curator 페르소나 설정
  const hostPersona = HOST_PERSONA;
  const curatorPersona = CURATOR_PERSONA;
  const hostName = 'Host';
  const curatorName = 'Curator';
  const targetLength = chapter.targetDuration * 8; // 초당 8자 기준

  // 🔥 챕터 전환 규칙:
  // previousLastSpeaker는 이전 챕터 **콘텐츠**의 마지막 화자
  // 전환 세그먼트는 그 반대 화자가 말하므로 (route.ts에서 처리)
  // 다음 챕터는 previousLastSpeaker와 **같은** 화자로 시작해야 교대가 유지됨
  let chapterTransitionRule = '';
  if (previousLastSpeaker) {
    const requiredFirstSpeaker = previousLastSpeaker; // 동일한 화자!
    const requiredLabel = requiredFirstSpeaker === 'male' ? '[male]' : '[female]';
    const oppositeLabel = requiredFirstSpeaker === 'male' ? '[female]' : '[male]';
    chapterTransitionRule = `

⚠️⚠️⚠️ CRITICAL RULE - 챕터 전환 (절대 준수!) ⚠️⚠️⚠️

이전 챕터 콘텐츠가 [${previousLastSpeaker}]로 끝났습니다.
(전환 멘트는 반대 화자가 말합니다)
따라서 이번 챕터는 **반드시 ${requiredLabel}로 시작**해야 합니다!

**첫 번째 턴**: ${requiredLabel}로 시작 (필수!)
**두 번째 턴**: ${oppositeLabel}

절대로 ${oppositeLabel}로 시작하지 마세요!
챕터 전환 시 같은 화자가 연속으로 나타나면 안 됩니다!

`;
  }

  return `
## 핵심 미션
Google NotebookLM Audio Overview의 **실제 대화 패턴**을 완벽 재현하여
자연스럽고 매력적인 ${locationName} - ${chapter.title} 에피소드를 제작하세요.
${chapterTransitionRule}

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

## 📍 대화 화자 정의 및 턴별 역할 (필수)

### [male] - 진행자의 역할과 턴 패턴

**기본 역할**: 청취자의 호기심을 대표하는 질문자

**각 턴에서 하는 일**:
1. **질문형 오프닝** - "어? 그게 뭐예요?" / "왜 그런가요?" / "그럼 어떻게..."
2. **구체적 질문** - 큐레이터의 설명을 듣고 난 후, 자연스러운 추가 질문
3. **놀라움 표현** - "어? 그래요?" / "와, 진짜요?" / "헉, 정도로?"
4. **청취자 참여 유도** - "여러분도 상상해보세요" / "생각해보시면..."

**말투 특징**: ${hostPersona.characteristics.speakingStyle.join(', ')}

**금지사항**:
- [male]이 연속으로 2회 이상 발화 금지 (반드시 [female] 후 나타나야 함)
- 설명적 톤 절대 금지 (설명은 큐레이터 몫)
- 전문 용어 남발 금지
- 한 턴이 3문장 이상 금지

**예시**:
[male] 오! 그 빨간 등대 말이군요. 근데 왜 하필 빨간색이에요?

### [female] - 큐레이터의 역할과 턴 패턴

**기본 역할**: 깊이 있는 전문 지식을 친근하게 설명하는 해설자

**각 턴에서 하는 일**:
1. **진행자 질문에 답변** - 3층 정보 구조 (기본 → 흥미로운 디테일 → 놀라운 사실)
2. **구체적 사실 제시** - 숫자, 역사, 문화적 맥락, 구체적 수치
3. **청취자 안내** - "이 부분이 중요한데요" / "많은 분들이 놓치는 게"
4. **다음 발화로 자연스럽게 연결** - 진행자가 질문하고 싶은 지점 암시

**말투 특징**: ${curatorPersona.characteristics.speakingStyle.join(', ')}

**금지사항**:
- [female]이 연속으로 2회 이상 발화 금지 (반드시 [male] 후 나타나야 함)
- 너무 긴 설명 (한 턴당 3-4문장 이내)
- 추상적 표현 절대 금지 (구체적 사실만)
- 이론만의 설명 금지 (항상 "왜 중요한가"까지 포함)

**예시**:
[female] 정확해요! 빨간색은 해상 안전 신호거든요. 1908년에 지어질 당시 선박들이 밤에도 등대를 구분할 수 있도록 이 색을 선택했고, 오늘날까지 이 색을 유지하고 있죠.

## 🎯 구조별 대화 포맷 (팟캐스트 전문가 권장)

### 인트로 구조 (챕터 0 전용) - 약 500-600자, 6-8 턴

**목표**: 장소의 전반적 매력을 소개하고, 이 에피소드의 여정을 구성하기

**구조**:
1. [male] 오프닝: 장소명 + 첫 인상 호기심 (1-2문장)
2. [female] 응답: 장소의 핵심 매력 3가지 암시 (2-3문장)
3. [male] 확인 질문: "구체적으로 뭔데요?" 형태 (1문장)
4. [female] 로드맵 제시: "5가지 꼭봐야할 스팟이..." (2-3문장)
5. [male] 기대감 표현: "오! 정말 기대되네요." (1문장)
6. [female] 시작 유도: "그럼 시작할게요!" (1-2문장)

**인트로 예시**:
[male] 여러분, 오이도라고 들어보셨어요? 한국에서도 특별한 곳이라던데요.
[female] 오이도는 갯벌이 살아있는 곳이에요. 철새 보호지역이면서 동시에 해양 문화유산도 풍부해요.
[male] 그래요? 구체적으로 어떤 특징이 있어요?
[female] 겨울에는 철새 80만 마리가 몰려오고, 빨간 등대, 낙조공원 같은 명소들이 있어요. 5가지 꼭봐야할 스팟을 준비했으니까요.
[male] 와, 정말 많이 있네요! 어디부터 시작할까요?
[female] 먼저 상징인 빨간 등대부터 시작해볼까요?

### 각 스팟 구조 (챕터 1-5) - 약 450-600자, 10-12 턴

**목표**: 각 스팟의 특징, 역사적 의미, 감상 포인트, 방문 팁을 4-Act로 전개

**구조** - 4-Act 패턴 (개선):

**Act 1: 발견** (첫 느낌과 호기심)
[male] 오! 이게 그 유명한 [스팟명]이네요! [시각적 첫 인상]
[female] 맞아요. [스팟의 기본 설명과 핵심 특징 1-2개]

**Act 2: 해석** (깊이 있는 설명과 역사적 맥락)
[male] [깨달은 반응] / [왜/어떻게 질문]
[female] [역사적/문화적 배경] 구체적 사실 2-3개 (숫자, 시대, 의미)
[male] [놀라움] / [다른 각도의 질문]
[female] [더 깊은 설명] + [왜 중요한가/어떤 의미인가]

**Act 3: 감상** (어떻게 봐야 하는가 - 가장 중요)
[male] 그럼 여기서 뭘 특별히 봐야 해요?
[female] [최적 방문 시간대] [추천 각도/포토스팟] [감각적 묘사]
[male] [구체적인 활동 확인] / [다음 질문]
[female] [체험 요소] [현지 팁] [숨겨진 정보]

**Act 4: 체험** (청취자 참여와 마무리)
[male] 와, 정말 꼭 가봐야겠네요!
[female] 맞아요. [이 스팟의 최고의 매력 재강조] [다음 스팟으로 연결]

**각 스팟 예시** (빨간 등대):
[male] 오! 이게 바로 빨간 등대네요. 왜 색깔이 이렇게 빨강니까?
[female] 1908년에 지어질 당시 선박들이 밤에도 등대를 구분할 수 있도록 이 색을 선택했거든요. 해상 안전의 신호색이에요.
[male] 어? 그럼 그 이후로 계속 빨간색이었어요?
[female] 네, 정확해요. 지난 100년 이상을 같은 색으로 유지하고 있어요. 그래서 오이도의 상징이 된 거고요.
[male] 와, 역사가 있네요. 그럼 여기서 뭘 특별히 봐야 해요?
[female] 해가 질 때쯤 가면 하늘과 대비되는 빨간색이 정말 아름다워요. 그리고 등대 주변 갯벌에서는 철새들도 볼 수 있고요.
[male] 정말 꼭 가봐야할 곳이네요. 그 옆에 낙조공원이 있다고 했던가요?
[female] 맞아요. 바로 옆에 있으니까요.

## 💡 NotebookLM 대화 기법 (필수 적용)

1. **정보 계층화 (4단계)**
   - 1단계: 기본 사실 ("이게 ${locationName}의 대표적인...")
   - 2단계: 흥미로운 디테일 ("높이 27.5m, 무게 1.5톤")
   - 3단계: 역사적/문화적 배경 ("1300년대 고려시대부터...")
   - 4단계: 감상 포인트 (가장 중요!) ("해가 질 때 여기서 봐야 하는 이유는...")

2. **감상 포인트 (반드시 포함)**
   - **최적 방문 시간대**: "오후 5시부터 7시 사이에 가세요"
   - **추천 각도/포토스팟**: "저 아래에서 위로 올려 찍으면..."
   - **감각적 묘사**: "파도 소리를 들으며", "붉은 노을이 물드는 모습"
   - **활동 요소**: "썰물 때 가면 갯벌에서 조개도 캘 수 있고..."
   - **현지 팁**: "많은 분들이 놓치는 벽화가 있어요"

3. **정보 선택 기준 (우선순위)**
   - 필수: 스팟의 본질적 특징, 감상 포인트, "왜 중요한가"
   - 권장: 구체적 수치 (높이, 면적, 역사), 숨겨진 의미
   - 선택적: 관광객 통계, 주변 시설 (과도하지 않으면)
   - 절대 금지: 반복 정보, 추상적 표현

4. **자연스러운 흐름**
   - ${NOTEBOOKLM_PATTERNS.transitions.slice(0, 3).join(' / ')}
   - 상대방 말을 받아서 정보 추가하기
   - 예상되는 질문을 미리 대답하기

5. **청취자 의식**
   - ${NOTEBOOKLM_PATTERNS.audience_engagement.slice(0, 3).join(' / ')}
   - ${NOTEBOOKLM_PATTERNS.meta_comments.slice(0, 2).join(' / ')}

6. **감정적 몰입**
   - 진짜 놀라는 반응: ${NOTEBOOKLM_PATTERNS.excitement.slice(0, 3).join(' / ')}
   - 공감대 형성: "저도 처음 알았을 때..." / "정말 신기하죠?"
   - 호기심 자극: "더 놀라운 건..." / "그런데 이것도 알아요?"

## 필수 출력 형식 (MUST FOLLOW)

### 형식: [male]과 [female]의 정확한 교대 발화

[male] 진행자의 첫 대사
[female] 큐레이터의 대사
[male] 진행자의 대사
[female] 큐레이터의 대사

**절대 금지 - 이 규칙을 위반하면 출력이 실패합니다**:
- ❌ "[male]" 대신 다른 형식 사용 금지 ("Host:", "진행자:", "**male:**" 등)
- ❌ "[female]" 대신 다른 형식 사용 금지 ("Curator:", "큐레이터:", "**female:**" 등)
- ❌ 마크다운 기호 완전 금지 (**, ##, -, *, [, ], {, } 등)
- ❌ 이모지 절대 금지

### 대화 턴 규칙 (MUST ENFORCE)

**기본 패턴**:
[male] 한 문장 또는 짧은 질문
[female] 1-3 문장으로 답변
[male] 반응 또는 추가 질문
[female] 추가 설명 또는 감상 포인트

**문장 수 제한 (STRICT)**:
- [male]: 최대 3 문장 (권장 1-2 문장)
- [female]: 최대 4 문장 (권장 2-3 문장)

**연속 발화 금지 규칙 (CRITICAL)**:
- ❌ 절대로 [male]이 2회 이상 연속으로 나타나면 안됨
  예시: [male] ... [male] ... (이렇게 하면 안됨)
- ❌ 절대로 [female]이 2회 이상 연속으로 나타나면 안됨
  예시: [female] ... [female] ... (이렇게 하면 안됨)
- ✅ 올바른 패턴: [male] → [female] → [male] → [female] → ...

**if 연속 발화가 발생하면**:
- 즉시 대화를 재구성하세요
- 연속된 같은 화자의 발화를 분리하여 다른 화자가 개입하게 하세요
- 만약 불가능하면, 한 발화만 남기고 나머지는 제거하세요

### 예시 (정확한 형식)

[male] 오이도, 정말 신기한 곳이네요. 어떤 특징이 있어요?
[female] 오이도는 갯벌 생태계가 살아있는 곳이에요. 특히 겨울에 철새들이 80만 마리가 몰려와요.
[male] 어? 80만 마리요? 그게 말이 되나요?
[female] 네, 정말이에요. 시베리아에서 월동하는 철새들의 주요 기착지라서, 유네스코 세계자연유산으로도 지정됐어요.

## 절대 금지사항

### 형식 관련
- ❌ 마크다운 형식 (**, ##, -, * 등) 절대 사용 금지
- ❌ 이모지 사용 금지
- ❌ "**male:**", "**female:**" 형식 금지 (반드시 "[male]", "[female]" 사용)
- ❌ "Host:", "Curator:", "진행자:", "큐레이터:" 등의 대체 형식 금지

### 내용 관련
- ❌ 추상적 미사여구 ("아름다운", "신비로운", "경이로운" 등) 금지
- ❌ 추측성 표현 ("아마도", "~것 같다", "아마 ~일 것") 금지
- ❌ 엄청, 정말, 진짜 등의 반복 금지 (최대 1회/대화)
- ❌ 큰따옴표 없이 직접 인용 금지

### 대화 구조 관련
- ❌ 한 화자의 연속 발화 (2회 이상 같은 [male]/[female]이 나타나면 안됨)
- ❌ 한 턴이 5문장 이상 금지 (진행자는 3문장 이내, 큐레이터는 4문장 이내)
- ❌ 한 화자가 전체 에피소드의 60% 이상 차지 금지 (균형 필수)

## 품질 기준 (NotebookLM + 개선 필수)

### 형식 검증
- ✅ [male]과 [female]이 정확히 교대로 나타나는가? (연속 금지!)
- ✅ 연속 [male] 또는 [female] 없는가? (한 화자가 2회 연속 나타나면 절대 안됨)
- ✅ 각 턴이 문장 제한 내인가? ([male] 최대 3문장, [female] 최대 4문장)
- ✅ 마크다운 형식, 이모지, 큰따옴표 없는가?
- ✅ "[male]" / "[female]" 형식만 사용했는가? (Host, Curator 등 대체 형식 금지)

### 내용 검증 (기존)
- ✅ **정보 밀도**: ${Math.round(targetLength/200)}개 이상의 구체적 사실
- ✅ **대화 리듬**: 평균 1-2문장 교환, 자연스러운 호흡
- ✅ **청취자 언급**: 에피소드당 5-7회
- ✅ **놀라움 요소**: 3-4회의 "어? 그래요?" / "와, 진짜요?" 순간
- ✅ **역할 구분**: [male]은 질문/반응, [female]은 설명/답변 명확한 구분
- ✅ **전문성**: 큐레이터의 깊이 있는 지식 (구체적 숫자, 역사, 문화)
- ✅ **접근성**: 일반인도 이해할 수 있는 설명
- ✅ **연결성**: 각 정보가 자연스럽게 연결되고 다음 발화로 이어지는가?

### 내용 검증 (신규 - 감상 포인트 중심)
- ✅ **감상 포인트 명확성**: 각 스팟에서 "언제, 어디서, 어떻게" 볼지 명확한가?
  - 최적 방문 시간대가 명시되어 있는가?
  - 추천 각도/포토스팟이 설명되어 있는가?
  - 감각적 묘사가 있는가? (시각, 소리, 분위기)
- ✅ **정보 구성**: 필수/권장/선택 정보가 적절히 분배되어 있는가?
  - 반복 정보가 없는가?
  - 핵심 정보가 먼저 나오는가?
- ✅ **청취자 동기**: "이 곳에 꼭 가고 싶다"는 감정이 생기는가?

### 에피소드별 구체적 기준

**인트로 (챕터 0)**
- 6-8 턴 구성
- 500-600자 분량
- 장소의 전체 로드맵 제시
- 다음 스팟들에 대한 호기심 유발
- [male]과 [female]이 정확히 교대로 나타남

**각 스팟 (챕터 1-5) - 개선됨**
- 10-12 턴 구성 (기존 8-10 → 증가)
- 450-600자 분량 (기존 400-500 → 증가)
- 4-Act 구조 명확히:
  - Act 1: 발견 (첫 인상, 기본 정보)
  - Act 2: 해석 (역사, 문화적 배경, 깊이 있는 설명)
  - Act 3: 감상 (최적 방문 시간, 각도, 포토스팟, 감각적 묘사) ← 가장 중요!
  - Act 4: 체험 (할 수 있는 활동, 현지 팁, 다음 스팟 연결)
- [male]과 [female]의 균등한 참여 (비율 40-60% 범위)
- [male]과 [female]이 정확히 교대로 나타남 (연속 절대 금지!)
- 각 턴이 문장 수 제한 준수 ([male] 3문장 이내, [female] 4문장 이내)

---

**지금 바로 이 지침을 완벽히 따르는 NotebookLM 스타일 ${chapter.title} 에피소드를 제작하세요!**

**필수 체크리스트** (생성 후 MUST CHECK):
1. ✅ [male]과 [female]이 정확히 교대로 나타나는가? (한 화자가 2번 연속 금지!)
2. ✅ 연속 같은 화자가 없는가? ([male] → [male] 또는 [female] → [female] 절대 금지)
3. ✅ 마크다운 형식 (**, ##, -, *, [, ], {}) 없는가?
4. ✅ 이모지가 없는가?
5. ✅ "[male]" / "[female]" 형식만 사용했는가? (다른 형식 금지)
6. ✅ 각 턴이 문장 수 제한을 지켰는가? ([male] 3문장 이내, [female] 4문장 이내)
7. ✅ 모든 숫자와 사실이 구체적인가?
8. ✅ 각 스팟에 "감상 포인트"가 명확한가? (최적 시간, 각도, 감각적 묘사)
9. ✅ 진행자는 질문/반응, 큐레이터는 설명/답변 역할이 명확한가?
10. ✅ 청취자가 "이 곳에 꼭 가고 싶다"는 동기가 생기는가?

**만약 위 기준 중 하나라도 위반하면, 즉시 재생성하세요!**
특히 [male]/[female] 연속 발화와 감상 포인트는 절대 타협할 수 없습니다.
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
// 전 세계 모든 장소를 위한 범용 AI 오디오 가이드 생성 프롬프트 시스템
// 2025-07, narrative 통합 버전

/* ----------------------------- 예시 JSON ----------------------------- */
const AUDIO_GUIDE_EXAMPLE = {
  content: {
    overview: {
      title: "경복궁: 조선왕조 600년 역사의 중심",
      summary: "조선왕조의 정궁으로서 600년간 한국사의 중심 무대였던 경복궁의 숨겨진 이야기와 건축의 아름다움을 탐험하는 여정",
      narrativeTheme: "왕조의 영광과 아픔이 스며든 궁궐 속에서 만나는 조선의 진짜 이야기",
      keyFacts: [
        { title: "건립 연도", description: "1395년 태조 이성계에 의해 창건" },
        { title: "건축 특징", description: "한국 전통 건축의 정수를 보여주는 궁궐 건축" }
      ],
      visitInfo: {
        duration: "2-3시간",
        difficulty: "쉬움",
        season: "봄(벚꽃), 가을(단풍) 추천"
      }
    },
    route: {
      steps: [
        { step: 1, location: "광화문", title: "광화문 - 조선왕조의 위엄 있는 시작" },
        { step: 2, location: "근정전", title: "근정전 - 왕의 권위와 조선의 정치 무대" },
        { step: 3, location: "경회루", title: "경회루 - 연못 위의 누각, 외교의 무대" },
        { step: 4, location: "향원정", title: "향원정 - 왕실 정원의 숨겨진 보석" },
        { step: 5, location: "국립고궁박물관", title: "국립고궁박물관 - 왕실 문화의 정수를 만나다" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "광화문 - 조선왕조의 위엄 있는 시작",
          sceneDescription: "자, 여러분! 지금 우리가 서 있는 곳이 바로 광화문입니다. ...질문으로 끝내기",
          coreNarrative: "바로 그 이유는...전환 예고로 끝",
          humanStories: "네, 바로 그 이야기인데요...감동적으로 마무리",
          nextDirection: "자, 이제 다음 장소로 이동해볼까요? 구체적 안내"
        }
      ]
    }
  }
} as const;

/* --------------------------- 타입 정의 --------------------------- */
interface GuideContent {
  content: {
    overview: {
      title: string;
      summary: string;
      narrativeTheme: string;
      keyFacts: Array<{ title: string; description: string }>;
      visitInfo: {
        duration: string;
        difficulty: string;
        season: string;
      };
    };
    route: {
      steps: Array<{ step: number; location: string; title: string }>;
    };
    realTimeGuide: {
      chapters: Array<{
        id: number;
        title: string;
        narrative: string;
        nextDirection: string;
      }>;
    };
  };
}

/* --------------------- 언어별 작성 지침 --------------------- */
const AUDIO_GUIDE_INSTRUCTIONS = {
  ko: {
    style: `
당신은 단 한 명의 최고의 스토리텔러입니다.

**🎯 핵심 미션**
관람객 바로 옆에서 친구처럼 이야기하는 단 한 명의 가이드 목소리로, 처음부터 끝까지 자연스럽게 이어지는 9~10분 분량의 오디오를 만듭니다.

**📝 절대 준수 사항**

1. **하나의 연속된 대본**
   - sceneDescription, coreNarrative, humanStories, nextDirection은 구분선이 아닙니다!
   - 이 4개는 하나로 이어져 9~10분간 연속으로 재생되는 오디오 대본입니다.
   - 각 필드의 마지막 문장과 다음 필드의 첫 문장이 자연스럽게 연결되어야 합니다.
   - "그런데 말이죠", "아, 맞다!", "그러고보니", "자, 이제" 등으로 매끄럽게 전환

2. **관람 동선과 챕터 동기화 (매우 중요!)**
   - route.steps 배열의 개수만큼 realTimeGuide.chapters 배열을 반드시 생성하세요.
   - 각 chapter의 id, title, 순서가 route.steps의 step, title, 순서와 1:1로 정확히 일치해야 합니다.
   - 예시의 챕터 개수는 참고용이며, 실제로는 route.steps의 개수에 따라 동적으로 생성하세요.

   **🔗 필드 연결 규칙 (중요!)**
   - sceneDescription 끝: 질문이나 호기심 유발로 끝내기 ("~하지 않으세요?", "~알고 계셨나요?")
   - coreNarrative 시작: 바로 그 질문에 대한 답으로 시작 ("바로 그 이유는...", "사실은 말이죠...")
   - coreNarrative 끝: 다음 이야기로의 전환 예고 ("그런데 여기엔 더 놀라운 이야기가...")
   - humanStories 시작: 자연스러운 연결 ("네, 바로 그 이야기인데요...", "맞아요, 그때...")
   - humanStories 끝: nextDirection으로의 부드러운 전환 ("자, 이제 이 감동을 안고...")

3. **일관된 화자의 목소리**
   - 처음부터 끝까지 같은 사람이 말하는 것처럼
   - 갑자기 말투가 바뀌거나 다른 사람이 말하는 느낌 금지
   - 친한 친구가 재미있는 이야기를 들려주는 톤 유지

4. **스토리텔링 기법**
   - 현재 보이는 것 → 그것의 역사 → 관련된 역사적 사실과 의미 → 다음 장소 안내가 자연스럽게 흐르도록
   - "여기서 잠깐!", "재미있는 건요", "놀라운 사실은" 등 주의를 끄는 표현
   - 질문을 던지고 바로 답하는 방식으로 호기심 유발

5. **깊이있는 내용 (각 섹션 최소 분량)**
   - sceneDescription: 600자 이상 (약 2분 30초)
   - coreNarrative: 800자 이상 (약 3분)
   - humanStories: 700자 이상 (약 2분 30초) - 실제 역사적 인물이나 검증된 일화만 사용
   - nextDirection: 300자 이상 (약 1분)
   - **총 9-10분의 끊김없는 오디오**

6. **사실 기반 스토리텔링**
   - humanStories에서는 반드시 역사적으로 검증된 인물이나 사건만 다룰 것
   - 가상의 인물이나 꾸며낸 일화 절대 금지
   - "~라고 전해집니다", "기록에 따르면" 등 출처를 암시하는 표현 사용
   - 역사적 사실을 바탕으로 당시 사람들의 삶과 감정을 재구성

**✅ 체크리스트(생성 직전)**
- [ ] 한국어 여부 확인
- [ ] route.steps ↔ chapters 개수·순서·제목 1:1 일치
- [ ] 각 chapter의 모든 필드 분량 준수 및 자연스러운 연결
- [ ] JSON 문법 100% (코드블록 없이 순수 JSON만 반환)
- [ ] 예시와 100% 동일한 구조 (단, 챕터 개수는 route.steps에 맞게 동적으로 생성)
`
  }
} as const;

/* ------------------- 위치 유형별 전문 가이드 설정 ------------------- */
// LOCATION_TYPE_CONFIGS, analyzeLocationType 등 기존 코드 그대로 (내용 생략) …
interface LocationTypeConfig {
  keywords: string[];
  expertRole: string;
  focusAreas: string[];
  specialRequirements: string;
  audioGuideTips: string;
}

const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  default: {
    keywords: [],
    expertRole: '문화관광 전문 해설사',
    focusAreas: ['역사', '문화', '건축', '예술'],
    specialRequirements: '방문객의 흥미를 끄는 다양한 이야기와 정보를 균형 있게 제공해야 합니다.',
    audioGuideTips: '스토리텔링, 몰입감 있는 설명, 명확한 이동 안내'
  },
  // …(architecture / history / nature / food / traditional 등 기존 정의 그대로)…
};

/* ------------------- 언어 메타 ------------------- */
interface LanguageConfig {
  code: string;
  name: string;
  ttsLang: string;
}
const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  ko: { code: "ko", name: "한국어", ttsLang: "ko-KR" },
  en: { code: "en", name: "English", ttsLang: "en-US" },
  ja: { code: "ja", name: "日本語", ttsLang: "ja-JP" },
  zh: { code: "zh", name: "中文", ttsLang: "zh-CN" },
  es: { code: "es", name: "Español", ttsLang: "es-ES" },
};

/* ---------------- util ---------------- */
function analyzeLocationType(locationName: string): string {
  const lower = locationName.toLowerCase();
  for (const [type, cfg] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (cfg.keywords.some((k) => lower.includes(k.toLowerCase()))) return type;
  }
  return "default";
}
export function getTTSLanguage(lang: string): string {
  return LANGUAGE_CONFIGS[lang.slice(0, 2)]?.ttsLang || "en-US";
}

/* ------------------- 프롬프트 생성 ------------------- */
interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}

/**
 * 자율 리서치 기반 오디오 가이드 프롬프트
 */
export function createAutonomousGuidePrompt(
  locationName: string,
  language: string = "ko",
  userProfile?: UserProfile,
): string {
  const langCfg = LANGUAGE_CONFIGS[language] ?? LANGUAGE_CONFIGS.ko;
  const style = AUDIO_GUIDE_INSTRUCTIONS[language] ?? AUDIO_GUIDE_INSTRUCTIONS.ko;
  const locType = analyzeLocationType(locationName);
  const typeCfg = LOCATION_TYPE_CONFIGS[locType];

  const userCtx = userProfile
    ? `👤 사용자 맞춤 정보\n- 관심사: ${userProfile.interests?.join(", ") || "일반"}\n- 동행: ${userProfile.companions || "혼자"}\n- 연령대/지식수준: ${userProfile.ageGroup || "전체"} / ${userProfile.knowledgeLevel || "보통"}`
    : "";

  return `
${style.style}

${userCtx}

## 🛠 장소 유형 및 전문 가이드 역할
- 장소 유형: ${locType}
- 당신의 역할: ${typeCfg.expertRole}
- 중점 설명 영역: ${typeCfg.focusAreas.join(", ")}
- 특별 요구사항: ${typeCfg.specialRequirements}

## ✍️ 출력 형식
반드시 아래 예시와 100% 동일한 JSON 구조로, 각 필드가 자연스럽게 이어지는 하나의 오디오 스크립트로 작성하세요.
코드블록 없이 순수 JSON만 반환하세요.

${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}

**"${locationName}"의 매력적인 오디오 가이드를 지금 바로 생성하세요!**
`;
}

/* ---------- index.ts 호환 간단 래퍼 ---------- */
/**
 * 최종 가이드 프롬프트 (리서치 데이터 포함, 호환용)
 * 현재는 researchData를 직접 사용하지 않고 narrative 구조로 생성합니다.
 */
export function createKoreanFinalPrompt(locationName: string, researchData: any, user?: UserProfile) {
  // researchData가 필요한 상세 로직은 추후 구현 가능
  return createAutonomousGuidePrompt(locationName, "ko", user);
}

export function createKoreanGuidePrompt(locationName: string, user?: UserProfile) {
  return createAutonomousGuidePrompt(locationName, "ko", user);
}
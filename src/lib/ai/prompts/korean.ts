// 전 세계 모든 장소를 위한 범용 AI 오디오 가이드 생성 프롬프트 시스템
// 2025-07, narrative 통합 버전

/* ----------------------------- 예시 JSON ----------------------------- */
const AUDIO_GUIDE_EXAMPLE = {
  content: {
    overview: {
      title: "경복궁: 조선왕조 600년 역사의 중심",
      summary:
        "조선왕조의 정궁으로서 600년간 한국사의 중심 무대였던 경복궁의 숨겨진 이야기와 건축의 아름다움을 탐험하는 여정",
      narrativeTheme:
        "왕조의 영광과 아픔이 스며든 궁궐 속에서 만나는 조선의 진짜 이야기",
      keyFacts: [
        { title: "건립 연도", description: "1395년 태조 이성계에 의해 창건" },
        {
          title: "건축 특징",
          description: "한국 전통 건축의 정수를 보여주는 궁궐 건축",
        },
      ],
      visitInfo: {
        duration: "2-3시간",
        difficulty: "쉬움",
        season: "봄(벚꽃), 가을(단풍) 추천",
      },
    },
    route: {
      steps: [
        {
          step: 1,
          location: "광화문",
          title: "광화문 - 조선왕조의 위엄 있는 시작",
        },
        {
          step: 2,
          location: "근정전",
          title: "근정전 - 왕의 권위와 조선의 정치 무대",
        },
        {
          step: 3,
          location: "경회루",
          title: "경회루 - 연못 위의 누각, 외교의 무대",
        },
        {
          step: 4,
          location: "향원정",
          title: "향원정 - 왕실 정원의 숨겨진 보석",
        },
        {
          step: 5,
          location: "국립고궁박물관",
          title: "국립고궁박물관 - 왕실 문화의 정수를 만나다",
        },
      ],
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "광화문 – 조선왕조의 위엄 있는 시작",
          narrative:
            "자, 여러분! 지금 우리가 서 있는 곳이 바로 광화문입니다. ... (2 100자 이상 연속 서사)",
          nextDirection:
            "이제 광화문을 통과해 흥례문 광장으로 이동해 볼까요? ... (300자 이상 경로 안내)",
        },
      ],
    },
  },
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
    style: `당신은 **단 한 명의 최고의 스토리텔러**입니다.

**🎯 핵심 미션**  
관람객 바로 옆에서 친구처럼 이야기하는 **한 명의 가이드** 목소리로, 처음부터 끝까지 자연스럽게 이어지는 7-8분 분량의 오디오를 만듭니다.

**📝 절대 준수 사항**

1. **연속된 2-필드 구조**
   - narrative(≈2 100자↑) → nextDirection(≈300자↑) 두 필드는 하나의 흐름으로 이어집니다.
   - 두 필드 사이 역시 부드러운 전환어(“그런데 말이죠”, “자, 이제”)를 사용하십시오.

2. **일관된 화자**
   - 화자는 처음부터 끝까지 동일한 말투·성격을 유지합니다.

3. **스토리텔링 기법**
   - “현재 시각적 묘사 → 역사·배경 → 재미있는 사실 → 다음 장소로 연결” 순서 권장
   - 질문·감탄·개인적 코멘트로 청자의 몰입을 유도

4. **깊이 있는 내용**
   - narrative: 2 100자 이상(약 7분) — 시각·청각·후각 묘사 + 역사적 맥락 + 인물·일화
   - nextDirection: 300자 이상(약 1분) — 구체적 이동 경로·주의 사항·팁

5. **사실 기반**
   - 모든 역사 정보·인물·연도는 검증 가능한 출처 기반
   - “조선왕조실록에 따르면 …” 식의 출처 암시를 포함

**✅ 체크리스트(생성 직전)**
- [ ] 한국어 여부 확인
- [ ] route.steps ↔ chapters 순서·제목 일치
- [ ] 각 chapter narrative ≥ 2 100자 & nextDirection ≥ 300자
- [ ] JSON 문법 100 %`,
  },
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
    ? `👤 사용자 맞춤 정보
- 관심사: ${userProfile.interests?.join(", ") || "일반"}
- 동행: ${userProfile.companions || "혼자"}
- 연령대/지식수준: ${userProfile.ageGroup || "전체"} / ${userProfile.knowledgeLevel || "보통"}`
    : "";

  return `
${style}

${userCtx}

## 🛠 장소 유형 및 전문 가이드 역할
- 장소 유형: ${locType}
- 당신의 역할: ${typeCfg.expertRole}
- 중점 설명 영역: ${typeCfg.focusAreas.join(", ")}
- 특별 요구사항: ${typeCfg.specialRequirements}

## ✍️ 출력 형식
반드시 아래 JSON Schema를 준수하십시오.

\`\`\`json
${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}
\`\`\`

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
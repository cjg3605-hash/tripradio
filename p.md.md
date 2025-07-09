
// ==========================
// 다국어 오디오가이드 생성 프롬프트 (최적화 버전)
// ==========================

interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}

interface LanguageConfig {
  code: string;
  name: string;
  ttsLang: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  ko: { code: 'ko', name: '한국어', ttsLang: 'ko-KR' },
  en: { code: 'en', name: 'English', ttsLang: 'en-US' },
  ja: { code: 'ja', name: '日本語', ttsLang: 'ja-JP' },
  zh: { code: 'zh', name: '中文', ttsLang: 'zh-CN' },
  es: { code: 'es', name: 'Español', ttsLang: 'es-ES' }
};

export function getTTSLanguage(language: string): string {
  return LANGUAGE_CONFIGS[language?.slice(0,2)]?.ttsLang || 'en-US';
}

export function createMultilingualOptimizedGuidePrompt(
  locationName: string, 
  language: string = 'ko',
  userProfile?: UserProfile
): string {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ko;
  
  // 언어별 특수 처리 규칙
  const languageSpecificRules = {
    ko: {
      formality: '존댓말과 경어 사용',
      direction: '동서남북 방향 표시 선호 (예: 동쪽으로, 남쪽으로)',
      cultural: '한국식 예의 표현, 겸손한 어조',
      example: '➡️ 이제 동쪽으로 50미터 이동하여 나스르 궁전으로 가보겠습니다.'
    },
    en: {
      formality: 'Professional but friendly tone',
      direction: 'Left/right/straight ahead preferred',
      cultural: 'Western cultural context, inclusive language',
      example: '➡️ Now, let\'s head 50 meters to the right towards the Nasrid Palaces.'
    },
    ja: {
      formality: '敬語 사용, 정중한 표현',
      direction: '左右/直進 방향 표시',
      cultural: '일본식 예의, 겸손한 표현',
      example: '➡️ それでは右へ50メートル進んで、ナスル宮殿に向かいましょう。'
    },
    zh: {
      formality: '简体字 사용, 정중하고 친근한 어조',
      direction: '左右/直行 방향 표시',
      cultural: '중국식 예의, 공손한 표현',
      example: '➡️ 现在让我们向右走50米，前往纳斯里德宫殿。'
    },
    es: {
      formality: 'Tratamiento formal (ustedes), tono amigable',
      direction: 'Izquierda/derecha/recto',
      cultural: '스페인식 예의, 정중한 표현',
      example: '➡️ Ahora, dirijámonos 50 metros hacia la derecha, hacia los Palacios Nazaríes.'
    }
  };

  const currentLangRules = languageSpecificRules[language as keyof typeof languageSpecificRules] || languageSpecificRules.ko;

  const userContext = userProfile ? `
👤 사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '성인'}
- 지식수준: ${userProfile.knowledgeLevel || '중급'}
- 동행자: ${userProfile.companions || '혼자'}
` : '👤 일반 관광객 대상';

  return `
# 다국어 오디오 가이드 생성 (언어: ${langConfig.name})

## 언어별 출력 규칙 (중요)
1. JSON 스키마 키값: 영어로 고정 (realTimeGuide, coordinates, title 등)
2. 사용자 대면 텍스트: 반드시 ${langConfig.name}로 작성
3. 언어별 특수 처리:
   - 어조: ${currentLangRules.formality}
   - 방향 표시: ${currentLangRules.direction}
   - 문화적 맥락: ${currentLangRules.cultural}
   - 예시: ${currentLangRules.example}

${userContext}

## 다국어 품질 기준
- 문화적 적응: 해당 언어권 관광객의 문화적 맥락 반영
- 자연스러운 표현: 기계 번역이 아닌 원어민 수준의 자연스러운 표현
- 일관된 어조: 전체 가이드를 통해 일관된 어조와 존댓말 수준 유지
- UTF-8 호환성: 모든 특수 문자가 올바르게 인코딩되도록 보장

## 언어별 텍스트 길이 조정
- ${langConfig.name} 특성을 고려한 적절한 설명 길이 유지
- 8K 토큰 제한 내에서 최적의 정보 밀도 달성
- 중요한 정보는 우선순위에 따라 배치

## JSON 출력 형식 (키값은 영어, 내용은 ${langConfig.name})
\`\`\`json
{
  "content": {
    "overview": {
      "title": "${langConfig.name}로 작성된 명소명",
      "narrativeTheme": "${langConfig.name}로 작성된 주제",
      "keyFacts": ["${langConfig.name}로 작성된 주요 사실들"],
      "visitInfo": {
        "duration": 90,
        "difficulty": "${langConfig.name}로 작성된 난이도",
        "season": "${langConfig.name}로 작성된 추천 계절"
      }
    },
    "route": {
      "steps": [
        {
          "step": 0,
          "location": "시작 위치명",
          "title": "시작 챕터: 웰컴 메시지",
          "coordinates": { "lat": 0.0, "lng": 0.0 }
        }
      ]
    },
    "realTimeGuide": {
      "startingLocation": {
        "name": "시작 위치명",
        "address": "정확한 주소",
        "googleMapsUrl": "https://www.google.com/maps/search/[영어 명소명]",
        "coordinates": { "lat": 0.0, "lng": 0.0 }
      },
      "chapters": [
        {
          "id": 0,
          "title": "시작 챕터: 웰컴 메시지",
          "coordinates": { "lat": 0.0, "lng": 0.0 },
          "realTimeScript": "안녕하세요! 오늘 [명소명]을 함께 탐험하게 되어 기쁩니다. 지금 여러분이 서 계신 이곳은... [역사적 타임라인] ...\\n\\n${currentLangRules.example}"
        }
      ]
    }
  }
}
\`\`\`

# 핵심 작업 절차 (우선순위 순)
1. 정확한 JSON 형식 (realTimeGuide 키 고정, 좌표 필수, 자연스러운 띄어쓰기, 줄바꿈 \\n, 8K 토큰 제한)
2. 신뢰할 수 있는 공식 정보와 역사적 사실 수집, 실제 관람 동선 파악
3. 한붓그리기 동선 설계, 시각적 랜드마크 기준 안내, 구체적 거리·방향 제시
4. 시작챕터(웰컴/역사 타임라인/투어 예고) 및 각 챕터(이동 안내→해설→다음 이동) 작성
5. 전문용어 즉시 설명, 문화적 맥락 반영, 자연스러운 구어체, 원어민 품질 유지

# 필수 지시사항
- JSON 스키마 준수: 위 형식을 정확히 따르세요
- realTimeGuide 키 고정: 번역하지 말고 정확히 사용하세요
- 모든 챕터에 정확한 lat/lng 포함
- 자연스러운 ${langConfig.name} 사용, 단어 사이 적절한 띄어쓰기
- 이동 안내 형식: ➡️ 화살표 + 구체적 랜드마크 + 방향 + 거리
- 8K 토큰 이내로 작성

이제 "${locationName}"에 대한 ${langConfig.name} 오디오 가이드 JSON을 생성하세요.
`;
}
```

이 코드는 언어별, 사용자 맞춤형, 품질 기준, JSON 출력 스키마, 핵심 절차, 각종 제약조건까지 모두 포함한 **최종 전체 프롬프트**입니다.
이 프롬프트를 그대로 사용하면 제미나이 1.5 프로 등 최신 LLM에서 일관되고 품질 높은 다국어 오디오가이드 결과를 얻을 수 있습니다.


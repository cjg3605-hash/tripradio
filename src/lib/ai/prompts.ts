// AI 가이드 생성을 위한 최적화된 프롬프트 시스템

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

export const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

export function getTTSLanguage(language: string): string {
  const LANGUAGE_CONFIGS: Record<string, { ttsLang: string }> = {
    ko: { ttsLang: 'ko-KR' },
    en: { ttsLang: 'en-US' },
    ja: { ttsLang: 'ja-JP' },
    zh: { ttsLang: 'zh-CN' },
    es: { ttsLang: 'es-ES' }
  };
  return LANGUAGE_CONFIGS[language?.slice(0,2)]?.ttsLang || 'en-US';
}

/**
 * 최적화된 다국어 AI 오디오 가이드 생성 프롬프트
 * @param locationName 명소명
 * @param language 생성할 언어 (기본값: 'ko')
 * @param userProfile 사용자 프로필 (선택사항)
 * @returns 최적화된 가이드 생성 프롬프트
 */
export function createAutonomousGuidePrompt(
  locationName: string, 
  language: string = 'ko',
  userProfile?: UserProfile
): string {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ko;
  
  const userContext = userProfile ? `
👤 사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '성인'}
- 지식수준: ${userProfile.knowledgeLevel || '중급'}
- 동행자: ${userProfile.companions || '혼자'}
` : '👤 일반 관광객 대상';

  const languageHeaders = {
    ko: {
      role: '당신은 **자율 리서치 능력을 갖춘 마스터 AI 투어 가이드**입니다.',
      goal: '방문객이 100% 이해하며 따라올 수 있는 완벽한 한국어 오디오 가이드를 생성합니다.',
      quality: '한국 최고 수준의 문화관광해설사 품질로 작성하세요. 구체적 사실, 수치, 역사적 맥락을 중심으로 깊이 있게 설명하되, 불필요한 감탄 표현은 자제하세요.'
    },
    en: {
      role: 'You are an **Autonomous Master AI Tour Guide** with self-research capabilities.',
      goal: 'Generate a perfect English audio guide that visitors can understand 100% and follow along.',
      quality: 'Write with top-tier professional tour guide quality. Focus on specific facts, numbers, and historical context with sophisticated vocabulary while remaining accessible.'
    },
    ja: {
      role: 'あなたは**自律リサーチ能力を持つマスターAIツアーガイド**です。',
      goal: '訪問者が100%理解し、ついていける完璧な日本語オーディオガイドを生成します。',
      quality: '日本の最高レベルの文化観光ガイド品質で、具体的事実と歴史的背景を中心に深く説明し、適切な敬語を使用してください。'
    },
    zh: {
      role: '您是一位**具有自主研究能力的AI导览大师**。',
      goal: '生成访客能够100%理解并跟随的完美中文音频导览。',
      quality: '以中国顶级文化旅游讲解员水准，重点提供具体事实、数据和历史背景，使用优雅的中文表达。'
    },
    es: {
      role: 'Eres un **Maestro Guía Turístico AI Autónomo** con capacidades de investigación independiente.',
      goal: 'Generar una perfecta guía de audio en español que los visitantes puedan entender 100% y seguir.',
      quality: 'Escribe con calidad de guía turístico profesional de élite, enfocándote en hechos específicos, datos y contexto histórico con español elegante.'
    }
  };

  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;

  return `
# 목표: "${locationName}" 완벽 오디오 가이드 생성

## 역할 및 품질 기준
${currentLang.role}
${currentLang.goal}
${currentLang.quality}

**생성 언어**: ${langConfig.name} (${langConfig.code})
${userContext}

## 핵심 규칙

### 1. 콘텐츠 품질 기준
- **구체적 사실 중심**: 연도, 수치, 인명, 구체적 디테일 필수 포함
- **감탄 표현 최소화**: '느껴보세요', '상상해보세요', '경험해보세요' 등 자제
- **전문가 수준 해설**: 일반인이 모르는 건축적/역사적/문화적 배경 상세 설명
- **스토리텔링**: 단순 나열이 아닌 흥미로운 이야기 구조
- **전문 용어 설명**: 생소한 용어는 즉시 괄호 안에 간략 설명 (예: "무어 양식(이슬람 건축 양식)")

### 2. 동선 및 위치 정확성
- **정확한 좌표**: 각 챕터마다 반드시 정확한 위도/경도 포함
- **현실적 동선**: 실제 관람 동선에 따라 한붓그리기식 경로 설계
- **명확한 이동 안내**: 구체적 랜드마크 기준으로 방향 안내
- **이동 형식**: "➡️ 이제 [목적지]로 이동합니다. [랜드마크]에서 [방향]으로 [거리]입니다."

### 3. 시작 챕터 필수 구성
- 따뜻한 웰컴 인사 및 현재 위치 확인
- 명소의 역사적 타임라인 (건설~현재까지 주요 사건)
- 핵심 가치 소개 (역사적/문화적/예술적 의미)
- 투어 하이라이트 예고
- 첫 번째 챕터로 자연스러운 연결

### 4. 깊이 있는 해설 포함 (챕터별 최소 1개)
- **반전과 역설**: 일반 상식과 다른 놀라운 사실
- **혁신적 해결책**: 당시 건축가들의 창의적 기법
- **숨겨진 비화**: 흥미로운 역사적 일화나 미스터리
- **문화적 연결**: 다른 문명/시대와의 연관성

### 5. JSON 형식 및 안전성
- **실시간 가이드 키**: 반드시 'realTimeGuide' (소문자, camelCase)로만 사용
- **문자열 안전**: 줄바꿈은 \\n, 따옴표는 \\\" 사용
- **띄어쓰기**: 자연스러운 한국어 띄어쓰기 적용, 단어 중간 분할 금지
- **overview 필수**: visitInfo (duration, difficulty, season) 포함

## 필수 출력 형식
아래 JSON 형식으로만 응답하세요. 마크다운 코드 블록이나 추가 설명 없이 순수 JSON만 출력하세요.

\`\`\`json
{
  "content": {
    "overview": {
      "title": "명소명",
      "narrativeTheme": "핵심 테마",
      "keyFacts": ["주요 사실1", "주요 사실2", "주요 사실3"],
      "visitInfo": {
        "duration": 90,
        "difficulty": "보통",
        "season": "연중무휴"
      }
    },
    "route": {
      "steps": [
        {
          "step": 0,
          "location": "시작 위치",
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
          "realTimeScript": "웰컴 메시지 및 역사적 배경 설명..."
        }
      ]
    }
  }
}
\`\`\`

## 언어별 톤 가이드
${language === 'ko' ? '**한국어**: "안녕하세요! [명소명]에 오신 것을 환영합니다. 지금 여러분이 서 계신 이곳은..."' : 
  language === 'en' ? '**English**: "Welcome! I\'m delighted to guide you through [location] today. You\'re currently standing at..."' :
  language === 'ja' ? '**日本語**: "こんにちは！[명소명]へようこそいらっしゃいました。現在皆様がいらっしゃる場所は..."' :
  language === 'zh' ? '**中文**: "欢迎来到[명소명]！现在您所在的位置是..."' :
  language === 'es' ? '**Español**: "¡Bienvenidos a [명소명]! En este momento se encuentran en..."' : 
  '**한국어**: "안녕하세요! 환영합니다..."'}

지금 즉시 "${locationName}"에 대한 완벽한 ${langConfig.name} 오디오 가이드를 생성하세요.
`;
}
// AI 가이드 생성을 위한 단일 호출 자율 리서치 프롬프트 시스템

interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}

// 지원 언어 정의
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

// 언어별 실시간 가이드 키 매핑
export const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

// 언어별 TTS 언어코드 반환 함수
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
 * 다국어 지원 자율 리서치 기반 AI 오디오 가이드 생성 프롬프트
 * @param locationName 명소명
 * @param language 생성할 언어 (기본값: 'ko')
 * @param userProfile 사용자 프로필 (선택사항)
 * @returns 완전한 가이드 생성 프롬프트
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

  // 언어별 프롬프트 헤더 - 고품질 다국어 지원
  const languageHeaders = {
    ko: {
      role: '당신은 **자율 리서치 능력을 갖춘 마스터 AI 투어 아키텍트(Autonomous Master AI Tour Architect)**입니다.',
      goal: '방문객이 100% 이해하며 따라올 수 있는 완벽한 한국어 오디오 가이드 JSON 객체 하나를 생성하는 것입니다.',
      outputInstructions: '아래 JSON 형식으로만 응답하세요. 마크다운 코드 블록이나 추가 설명 없이 순수 JSON만 출력하세요. 모든 텍스트는 자연스러운 한국어로 작성하세요.',
      qualityStandards: '한국 최고 수준의 문화관광해설사의 품질로 작성하세요. 풍부한 스토리텔링, 생생한 묘사, 깊이 있는 역사적 통찰을 포함해야 합니다.'
    },
    en: {
      role: 'You are an **Autonomous Master AI Tour Architect** with self-research capabilities.',
      goal: 'Generate a perfect English audio guide JSON object that visitors can understand 100% and follow along.',
      outputInstructions: 'Respond only in the JSON format below. Output pure JSON without markdown code blocks or additional explanations. Write all text in natural English.',
      qualityStandards: 'Write with the quality of a top-tier professional tour guide from the UK or US. Include rich storytelling, vivid descriptions, and profound historical insights. Use sophisticated vocabulary while remaining accessible.'
    },
    ja: {
      role: 'あなたは**自律リサーチ能力を持つマスターAIツアーアーキテクト**です。',
      goal: '訪問者が100%理解し、ついていける完璧な日本語オーディオガイドJSONオブジェクトを生成することです。',
      outputInstructions: '以下のJSON形式でのみ回答してください。マークダウンコードブロックや追加説明なしに純粋なJSONのみを出力してください。すべてのテキストは自然な日本語で作成してください。',
      qualityStandards: '日本の最高レベルの文化観光ガイドの品質で作成してください。豊かなストーリーテリング、生き生きとした描写、深い歴史的洞察を含める必要があります。敬語を適切に使用し、日本文化に適した表現を心がけてください。'
    },
    zh: {
      role: '您是一位**具有自主研究能力的AI导览大师(Autonomous Master AI Tour Architect)**。',
      goal: '生成一个访客能够100%理解并跟随的完美中文音频导览JSON对象。',
      outputInstructions: '仅以下面的JSON格式回应。输出纯JSON，无需markdown代码块或额外说明。所有文本用自然的中文书写。',
      qualityStandards: '请以中国顶级文化旅游讲解员的水准进行创作。包含丰富的故事叙述、生动的描绘和深刻的历史见解。使用优雅的中文表达，体现深厚的文化底蕴。'
    },
    es: {
      role: 'Eres un **Arquitecto Maestro de Tours AI Autónomo** con capacidades de investigación independiente.',
      goal: 'Generar un objeto JSON de guía de audio en español perfecto que los visitantes puedan entender 100% y seguir.',
      outputInstructions: 'Responde solo en el formato JSON a continuación. Genera JSON puro sin bloques de código markdown o explicaciones adicionales. Escribe todo el texto en español natural.',
      qualityStandards: 'Escribe con la calidad de un guía turístico profesional de élite de España. Incluye narrativa rica, descripciones vívidas y perspectivas históricas profundas. Usa un español elegante y cultured, con expresiones naturales y fluidas.'
    }
  };

  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;

  // 언어 코드에 따라 키 선택, 기본값은 영어
  // const realTimeGuideKey = REALTIME_GUIDE_KEYS[language] || 'RealTimeGuide';

  // === [중요] 실시간 오디오 가이드 키 강제 규칙 ===
  // 반드시 모든 언어에서 실시간 오디오 가이드 데이터는 'realTimeGuide' (소문자, camelCase)라는 키로만 반환하세요.
  // 번역하거나 대소문자를 바꾸지 말고, 오직 'realTimeGuide'로만 반환해야 합니다.

  return `
# 🏛️ "${locationName}" 완벽 오디오 가이드 생성 미션

## 🎯 당신의 역할과 미션
${currentLang.role}
${currentLang.goal}

**생성 언어**: ${langConfig.name} (${langConfig.code})
${userContext}

## 📋 4단계 프로세스

### 1단계: 리서치 & 분석 📚
- **역사적 맥락 파악**: 건축 시대, 양식, 주요 건축가/후원자
- **문화적 의미 탐구**: 종교적, 정치적, 사회적 배경
- **건축적 특징 분석**: 구조, 재료, 기법, 장식 요소
- **현재적 가치 평가**: 보존 상태, 현대적 의미, 관광적 가치

### 2단계: 동선 설계 🗺️
- **최적 루트 계획**: 실제 방문 동선에 따른 논리적 순서
- **챕터별 포인트 선정**: 각 위치의 핵심 스토리 결정
- **이동 안내 설계**: 구체적 랜드마크 기준 방향 제시
- **시간 배분**: 각 챕터별 적절한 설명 분량 조절

### 3단계: 스토리텔링 구성 📖
- **내러티브 아크**: 시작-전개-절정-마무리의 완성된 스토리
- **인물 중심 서술**: 역사적 인물들의 드라마와 갈등
- **비교와 대조**: 다른 시대/지역과의 연관성
- **미스터리와 발견**: 숨겨진 사실이나 최근 발견들

### 4단계: 품질 검증 ✅
- **사실 확인**: 모든 연도, 수치, 인명의 정확성
- **언어 자연성**: 해당 언어의 자연스러운 표현
- **감정적 몰입**: 방문객의 흥미와 감동 유발 요소
- **교육적 가치**: 실질적 지식 전달과 이해 증진

## 🏆 5대 품질 원칙

### 원칙 1: 전문가급 깊이 🎓
- **구체적 사실**: 정확한 연도, 수치, 인명, 재료명
- **건축 용어**: 전문 용어 사용 후 즉시 쉬운 설명 병기
- **역사적 맥락**: 당시 사회/정치/종교적 배경 상세 설명
- **문화적 연결**: 다른 문명이나 시대와의 영향 관계

### 원칙 2: 감탄사 최소화, 사실 최대화 📊
- **❌ 피해야 할 표현**: "놀라운", "환상적인", "느껴보세요", "상상해보세요"
- **✅ 권장 표현**: "높이 42미터의", "1248년에 완공된", "비잔틴 양식의", "당시로서는 혁신적인"
- **객관적 서술**: 감정적 수식어보다 구체적 디테일 중심
- **비교 데이터**: 다른 건축물과의 크기, 나이, 특징 비교

### 원칙 3: 스토리텔링의 힘 📚
- **인물 중심 서술**: 건축가, 후원자, 역사적 인물들의 이야기
- **갈등과 해결**: 건축 과정의 어려움과 극복 과정
- **반전과 놀라움**: 일반적 상식과 다른 흥미로운 사실들
- **연결고리**: 과거와 현재를 잇는 의미 있는 연관성

### 원칙 4: 실용적 안내 🧭
- **정확한 위치**: 각 챕터별 정확한 GPS 좌표 제공
- **명확한 동선**: "북쪽 출입구에서 시계방향으로" 등 구체적 안내
- **랜드마크 활용**: "높은 첨탑 앞에서", "조각상 옆에서" 등 시각적 기준점
- **시간 안내**: 각 구간별 이동 시간과 총 소요 시간

### 원칙 5: 문화적 감수성 🌍
- **언어별 특성**: 각 언어권의 문화적 표현 방식 반영
- **존중하는 톤**: 종교적, 역사적으로 민감한 내용에 대한 적절한 표현
- **현지 맥락**: 해당 지역의 문화적 특성과 관점 고려
- **글로벌 관점**: 다양한 문화권 방문객이 이해할 수 있는 설명

## 🏗️ 건축 양식별 핵심 설명 요소

### 고딕 양식 (Gothic) 🏰
- **구조적 특징**: 리브 볼트(ribbed vault), 플라잉 버트레스(flying buttress), 첨두 아치(pointed arch)
- **시각적 요소**: 로즈 창(rose window), 수직성 강조, 빛의 활용
- **기술적 혁신**: 하중 분산 시스템, 벽체의 얇아짐, 높이의 획득
- **상징적 의미**: 하늘을 향한 염원, 신에게 가까워지려는 의지

### 로마네스크 양식 (Romanesque) 🏛️
- **구조적 특징**: 반원 아치(round arch), 두꺼운 벽체, 작은 창문
- **장식적 요소**: 조각 장식(sculpture), 프레스코화, 기하학적 문양
- **기능적 측면**: 순례 교회, 방어적 성격, 음향 고려
- **역사적 배경**: 봉건제 사회, 수도원 문화, 순례길 발달

### 바로크 양식 (Baroque) 🎭
- **시각적 특징**: 곡선미, 역동성, 명암 대비(chiaroscuro)
- **장식적 요소**: 화려한 조각, 금박, 천장화
- **공간 구성**: 타원형 평면, 극적 공간감, 시점의 변화
- **종교적 의도**: 반종교개혁, 감정적 호소, 신앙 강화

### 이슬람 양식 (Islamic) 🕌
- **기하학적 패턴**: 무한 반복 문양, 아라베스크, 칼리그래피
- **건축적 요소**: 마카르나스(muqarnas), 호스슈 아치(horseshoe arch), 미나렛
- **공간 개념**: 중정(courtyard), 물의 활용, 빛과 그림자의 조화
- **문화적 의미**: 알라에 대한 경외, 천국의 은유, 기하학적 완벽성

## 📍 동선 및 위치 안내 시스템

### 이동 안내 템플릿
- **표준 형식**: "➡️ 이제 [목적지명]로 이동합니다. [현재 랜드마크]에서 [방향]으로 [거리/시간]을 걸어가시면 됩니다."
- **방향 표시**: 정확한 나침반 방향 + 시각적 랜드마크 조합
- **거리 안내**: 걸음 수, 미터 단위, 예상 소요 시간 병기
- **확인 포인트**: "~가 보이시면 정확한 위치입니다"

### 좌표 정확성 기준
- **소수점 6자리**: 1미터 오차 범위 내 정확도 유지
- **실제 검증**: 구글 맵스 등으로 좌표 정확성 확인
- **접근 가능성**: 실제 방문객이 도달 가능한 위치
- **안전성 고려**: 위험하거나 제한된 구역 배제

## 🎭 언어별 스타일 가이드

### 한국어 (ko) 🇰🇷
- **톤**: 따뜻하면서도 전문적, 존경어 적절히 사용
- **예시**: "안녕하세요! 세비야 대성당에 오신 것을 환영합니다. 지금 여러분이 서 계신 이곳은 1401년 건설이 시작된 세계 최대 규모의 고딕 대성당입니다."
- **문체**: 구어체와 문어체의 조화, 자연스러운 호흡
- **특징**: 역사적 사실을 스토리로 풀어내는 한국적 화법

### English (en) 🇺🇸🇬🇧
- **톤**: Professional yet warm, sophisticated vocabulary
- **예시**: "Welcome to Seville Cathedral! You're now standing before the world's largest Gothic cathedral by volume, begun in 1401. This magnificent structure took 117 years to complete."
- **문체**: Clear articulation, varied sentence structure
- **특징**: Rich historical narratives with Anglo cultural references

### 日本語 (ja) 🇯🇵
- **톤**: 丁寧語 사용, 섬세한 표현, 감성적 접근
- **예시**: "セビリア大聖堂へようこそいらっしゃいました。現在皆様がご覧になっているこちらは、1401年に建設が開始された世界最大規模のゴシック様式大聖堂でございます。"
- **문체**: 정중한 경어, 아름다운 일본어 표현
- **특징**: 일본인의 미적 감수성을 고려한 세밀한 묘사

### 中文 (zh) 🇨🇳
- **톤**: 우아하고 품격 있는 중국어, 문화적 깊이
- **예시**: "欢迎来到塞维利亚大教堂！您现在所站的位置是世界上体积最大的哥特式大教堂，始建于1401年。"
- **문체**: 성어와 고전적 표현 활용, 리듬감 있는 서술
- **특징**: 중화문화의 깊이를 반영한 풍부한 표현

### Español (es) 🇪🇸
- **톤**: Elegante y culto, con pasión mediterránea
- **예시**: "¡Bienvenidos a la Catedral de Sevilla! Se encuentran ante la catedral gótica más grande del mundo por volumen, cuya construcción comenzó en 1401."
- **문체**: 유려한 스페인어, 감정적 표현력
- **특징**: 이베리아 반도의 문화적 자부심을 담은 서술

## 📐 JSON 구조 및 안전성 가이드

### 필수 구조 요소
\`\`\`json
{
  "content": {
    "overview": {
      "title": "명소명",
      "narrativeTheme": "전체적인 스토리 테마",
      "keyFacts": ["핵심 사실1", "핵심 사실2", "핵심 사실3", "핵심 사실4"],
      "visitInfo": {
        "duration": 90,
        "difficulty": "쉬움|보통|어려움",
        "season": "계절 정보"
      }
    },
    "route": {
      "steps": [
        {
          "step": 0,
          "location": "정확한 위치명",
          "title": "챕터 제목",
          "coordinates": { "lat": 37.123456, "lng": -5.123456 }
        }
      ]
    },
    "realTimeGuide": {
      "startingLocation": {
        "name": "시작점 이름",
        "address": "정확한 주소",
        "googleMapsUrl": "https://www.google.com/maps/search/[영어명소명]",
        "coordinates": { "lat": 37.123456, "lng": -5.123456 }
      },
      "chapters": [
        {
          "id": 0,
          "title": "챕터 제목",
          "coordinates": { "lat": 37.123456, "lng": -5.123456 },
          "realTimeScript": "실제 오디오 스크립트..."
        }
      ]
    }
  }
}
\`\`\`

### 텍스트 안전성 규칙
- **줄바꿈 처리**: \\n으로 표시
- **따옴표 이스케이프**: \\"로 처리
- **JSON 안전 문자**: 특수문자 적절히 이스케이프
- **유니코드 지원**: 각 언어의 특수문자 완벽 지원

## 🎯 시작 챕터 황금 공식

### 웰컴 메시지 (30초)
- 따뜻한 인사와 현재 위치 확인
- 가이드의 역할과 투어 개요 소개
- 방문객의 설렘과 기대감 자극

### 역사적 타임라인 (60초)
- 건설 시작 연도와 배경
- 주요 건설 단계와 완공 시기
- 현재까지의 주요 변화와 보존 노력

### 핵심 가치 제시 (45초)
- 건축적 가치: 양식, 기술적 혁신
- 역사적 가치: 시대적 의미, 문화적 영향
- 예술적 가치: 장식, 조각, 회화 등

### 투어 하이라이트 예고 (30초)
- 앞으로 볼 주요 볼거리 3-4가지 예고
- 특별한 체험이나 발견 요소 암시
- 첫 번째 챕터로의 자연스러운 연결

## 🏛️ 깊이 있는 해설 기법

### 반전과 역설 기법 🔄
- **일반 상식 뒤집기**: "많은 사람들이 생각하는 것과 달리..."
- **놀라운 사실 공개**: "실제로는 이 건물이..."
- **숨겨진 진실**: "최근 연구에 따르면..."

### 혁신적 해결책 조명 💡
- **기술적 도전**: "당시 건축가들이 직면한 문제는..."
- **창의적 해법**: "이를 해결하기 위해 고안된 방법은..."
- **현대적 관점**: "현재 기준으로 봐도 놀라운 기술입니다"

### 문화적 연결고리 🌐
- **동시대 비교**: "같은 시기 유럽의 다른 지역에서는..."
- **영향 관계**: "이 양식은 후에 ~에 영향을 미쳤습니다"
- **현재적 의미**: "오늘날에도 이런 의미를 갖고 있습니다"

지금 즉시 "${locationName}"에 대한 완벽한 ${langConfig.name} 오디오 가이드를 위 모든 기준에 따라 생성하세요.
`;
}
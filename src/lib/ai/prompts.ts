// AI 가이드 생성을 위한 단일 호출 자율 리서치 프롬프트 시스템

import { json } from "stream/consumers";

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

// AI의 혼란을 방지하기 위한 최소한의 구조 예시
const MINIMAL_EXAMPLE_JSON = `{
  "content": {
    "overview": {
      "title": "장소의 핵심을 담은 매력적인 제목",
      "summary": "가이드 전체를 요약하는 간결한 소개",
      "narrativeTheme": "가이드를 관통하는 중심 이야기나 주제",
      "keyFacts": [
        { "title": "핵심 정보 1", "description": "정보 내용" }
      ],
      "visitInfo": {
        "duration": "예상 소요 시간",
        "difficulty": "관람 난이도",
        "season": "추천 방문 시기"
      }
    },
    "route": {
      "steps": [
        { "step": 1, "location": "첫 번째 장소", "title": "첫 번째 동선 제목" }
      ]
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "인트로 - 여행의 시작",
          "sceneDescription": "방문객이 처음 보게 될 장면에 대한 생생한 묘사",
          "coreNarrative": "이번 챕터의 핵심 이야기 (상세하게)",
          "humanStories": "이 장소와 관련된 인물들의 일화나 비하인드 스토리",
          "nextDirection": "다음 장소로의 이동 안내"
        }
      ]
    }
  }
}`;

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
  const langCode = language?.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode]?.ttsLang || 'en-US';
}

/**
 * 다국어 지원 자율 리서치 기반 AI 오디오 가이드 생성 프롬프트
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

  const languageHeaders: Record<string, any> = {
    ko: {
      role: '당신은 **세상에서 가장 열정적이고 수다스러운 역사학자이자 최고의 투어 가이드**입니다. 당신의 임무는 방문객이 마치 당신과 함께 걸으며 모든 비밀 이야기를 듣는 것처럼 느끼게 만드는 것입니다.',
      goal: `방문객이 '${locationName}'에 대해 모르는 것이 없도록, 모든 세부 정보와 비하인드 스토리를 총망라한, **매우 상세하고 긴 한국어 오디오 가이드** JSON 객체를 생성하는 것입니다.`,
      outputInstructions: '절대적으로, 반드시 아래 규칙을 따라 순수한 JSON 객체 하나만 반환해야 합니다.\n- 서론, 본론, 결론, 주석, 코드블록(```) 등 JSON 이외의 어떤 텍스트도 포함해서는 안 됩니다.\n- 모든 문자열은 따옴표로 감싸고, 객체와 배열의 마지막 요소 뒤에는 쉼표를 붙이지 않는 등 JSON 문법을 100% 완벽하게 준수해야 합니다.\n- JSON 구조와 키 이름은 아래 예시와 완전히 동일해야 합니다. 키 이름을 절대 번역하거나 바꾸지 마세요.\n- **JSON 문법 오류는 치명적인 실패로 간주됩니다.**\n- 최종 결과물 구조 예시:\n' + MINIMAL_EXAMPLE_JSON,
      qualityStandards: `**품질 기준 (가장 중요!):**
- **분량은 많을수록 좋습니다. 절대 내용을 아끼지 마세요.** 사소한 건축 디테일, 숨겨진 상징, 역사적 배경, 관련 인물들의 재미있는 일화, 비하인드 스토리 등 모든 정보를 총망라하여 알려주세요.
- **친근하고 수다스러운 톤앤매너:** 딱딱한 설명이 아닌, 옆에서 친구나 최고의 가이드가 열정적으로 설명해주는 듯한 말투를 사용하세요. 질문을 던지거나, 감탄사를 사용하는 등 생동감 있는 표현을 자유롭게 활용하세요.
- **완벽한 스토리텔링:** 모든 정보를 하나의 거대한 이야기처럼 연결하세요. 인트로에서 호기심을 자극하고, 각 챕터를 거치며 이야기를 발전시키고, 아웃트로에서 깊은 여운을 남겨야 합니다.
- **생생한 묘사:** 방문객이 눈을 감고도 그 장소를 생생하게 그릴 수 있도록, 시각, 청각, 후각 등 모든 감각을 자극하는 묘사를 사용하세요.
- **완벽한 동선:** 추천 경로는 방문객이 불필요하게 동선을 낭비하지 않도록, 가장 효율적인 '한붓그리기' 동선으로 설계해야 합니다.
- **완전성:** 명소 내의 모든 주요 공간과 세부 장소를 **하나도 빠짐없이** 포함하여, 방문객이 원하는 모든 것을 들을 수 있는 완전한 가이드를 제작해야 합니다.

**실시간 가이드 챕터 구성 지침:**
- **챕터 0 (인트로):** 반드시 '인트로' 챕터로 시작해야 합니다. 이 챕터는 투어의 무대를 설정하는 데 매우 중요합니다. 특정 장소에 얽매이지 않고, 장소 전체에 대한 포괄적인 개요를 제공해야 합니다. 투어를 시작하기 전에 방문객이 알아야 할 역사, 문화적 중요성, 핵심 배경 이야기를 포함하세요. 기대를 높일 수 있도록 풍부하고 상세하게 작성하세요.
- **챕터 1 이후:** 추천 경로 단계를 따라가며 각 특정 장소에 대한 상세한 해설을 제공해야 합니다.`
    },
    en: {
      role: 'You are the **world\'s most passionate, chatty historian and a top-tier tour guide**. Your mission is to make visitors feel like they are walking with you, hearing every secret story.',
      goal: `Generate an **extremely detailed and lengthy English audio guide** as a single JSON object for '${locationName}', covering every possible detail and behind-the-scenes story.`,
      outputInstructions: 'You must strictly return only a single, pure JSON object by following these rules:\n- Do not include any text outside the JSON object, such as introductions, notes, or markdown code blocks (```).\n- Adhere 100% to JSON syntax.\n- The JSON structure and key names must be identical to the example below. Do not translate or change key names.\n- **Any JSON syntax error is a critical failure.**\n- Example of the final output structure:\n' + MINIMAL_EXAMPLE_JSON,
      qualityStandards: `**Quality Standards (Crucial!):**
- **Longer is better. Do not hold back on content.** Include every piece of information: minor architectural details, hidden symbols, historical context, fun anecdotes about people involved, behind-the-scenes stories, etc.
- **Friendly and Chatty Tone:** Use a conversational style, as if a friend or the best guide is passionately explaining things. Feel free to ask rhetorical questions or use exclamations to make it lively.
- **Perfect Storytelling:** Weave all information into one grand narrative. Spark curiosity in the intro, develop the story through each chapter, and leave a lasting impression in the outro.
- **Vivid Descriptions:** Use sensory details (sight, sound, smell) to help visitors vividly imagine the place, even with their eyes closed.
- **Perfect Route:** The recommended route must be the most efficient, one-way path to prevent backtracking.
- **Completeness:** Include **every single key area and detail** within the location. Be comprehensive.

**Real-Time Guide Chapter Composition Guidelines:**
- **Chapter 0 (Intro):** MUST start with an 'Intro' chapter. This chapter is crucial for setting the stage. It should not be tied to a specific location but provide a comprehensive overview of the entire place. Include its history, cultural significance, and the core background story that visitors should know before starting the tour. Make it rich and detailed to build anticipation.
- **Chapters 1 onwards:** These chapters should follow the recommended route steps, providing detailed commentary for each specific location.`
    }
  };

  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;

  const prompt = [
    `# 🏛️ Mission: Create the Definitive Audio Guide for "${locationName}"`,
    '## 🎯 Your Role and Goal',
    currentLang.role,
    currentLang.goal,
    `**Output Language**: ${langConfig.name} (${langConfig.code})`,
    `**생성 언어**: ${langConfig.name} (${langConfig.code})`,
    userContext,
    '## 📐 JSON 출력 형식 및 안전성',
    currentLang.outputInstructions,
    '이제 "${locationName}"에 대한 ${langConfig.name} 오디오 가이드 JSON을 생성하세요.',
  ].join('\n\n');

  return prompt;
}

/**
 * 최종 가이드 생성 프롬프트
 */
export function createFinalGuidePrompt(
  locationName: string,
  language: string,
  researchData: any,
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

  const languageHeaders: Record<string, any> = {
    ko: {
      role: '당신은 **최종 오디오 가이드 작가 AI(Final Audio Guide Writer AI)**입니다.',
      goal: '제공된 리서치 데이터를 기반으로, 방문객을 위한 완벽한 한국어 오디오 가이드 JSON 객체를 완성하는 것입니다.',
      outputInstructions: `반드시 아래 예시와 완전히 동일한 구조, 동일한 키, 동일한 타입의 JSON만 반환하세요.\n- 코드블록(예: \`\`\`json ... \`\`\`)을 절대 포함하지 마세요.\n- 설명, 안내문구, 주석 등 일체의 부가 텍스트를 포함하지 마세요.\n- JSON 문법(따옴표, 쉼표, 중괄호/대괄호 등)을 반드시 준수하세요.\n- 예시:\n${MINIMAL_EXAMPLE_JSON}`,
      qualityStandards: '리서치 데이터를 바탕으로, 한국 최고 수준의 문화관광해설사의 품질로 스크립트를 작성하세요. **분량에 제한 없이**, 명소와 관련된 **모든 배경지식, 숨겨진 이야기, 역사적 사실**을 포함하여 가장 상세하고 깊이 있는 내용을 제공해야 합니다. **명소 내 모든 세부 장소를 하나도 빠짐없이 포함**하여, 방문객이 원하는 곳을 선택해 들을 수 있는 완전한 가이드를 만드세요. **관람 동선은 입장부터 퇴장까지 가장 효율적인 한붓그리기 동선으로 설계하여, 방문객이 불필요하게 되돌아가거나 두 번 이동하는 일이 없도록 해야 합니다.** 풍부한 스토리텔링과 생생한 묘사는 필수입니다. 모든 언어에서 이와 동일한 최고 수준의 품질이 보장되어야 합니다.'
    },
    en: {
      role: 'You are a **Final Audio Guide Writer AI**.',
      goal: 'Based on the provided research data, complete a perfect English audio guide JSON object for visitors.',
      outputInstructions: 'Respond only in the JSON format below. Output pure JSON without markdown code blocks or additional explanations. Write all text in natural English.',
      qualityStandards: 'Based on the research data, write scripts with the quality of a top-tier professional tour guide from the UK or US. Provide the most detailed and in-depth content possible **without any length restrictions**, including **all background knowledge, hidden stories, and historical facts** related to the landmark. **Include every single spot within the landmark without omission** to create a complete guide where visitors can choose what to listen to. **The tour route must be designed as the most efficient, one-way path from entrance to exit**, like a single continuous line, ensuring visitors do not need to backtrack or revisit spots unnecessarily. Rich storytelling and vivid descriptions are essential. This same top-tier quality must be ensured across all languages.'
    },
    ja: {
      role: 'あなたは**最終オーディオガイド作家AI**です。',
      goal: '提供されたリサーチデータに基づき、訪問者のための完璧な日本語オーディオガイドJSONオブジェクトを完成させることです。',
      outputInstructions: '以下のJSON形式でのみ回答してください。マークダウンコードブロックや追加説明なしに純粋なJSONのみを出力してください。すべてのテキストは自然な日本語で作成してください。',
      qualityStandards: 'リサーチデータに基づき、日本の最高レベルの文化観光ガイドの品質でスクリプトを作成してください。**分量に制限なく**、名所に関連する**すべての背景知識、隠された物語、歴史的事実**を含め、最も詳細で深みのある内容を提供しなければなりません。**名所内のすべての詳細な場所を一つも漏らさず含め**、訪問者が必要な場所を選んで聞ける完全なガイドを作成してください。**観覧ルートは、入口から出口まで最も効率的な一筆書きの動線として設計し、訪問者が不必要に戻ったり、二度手間になったりしないようにしなければなりません。**豊かなストーリーテリングと生き生きとした描写は必須です。すべての言語でこれと同じ最高レベルの品質が保証されなければなりません。'
    },
    zh: {
      role: '您是一位**最终音频导览作家AI**。',
      goal: '根据提供的研究数据，为访客完成一个完美的中文音频导览JSON对象。',
      outputInstructions: '仅以下面的JSON格式回应。输出纯JSON，无需markdown代码块或额外说明。所有文本用自然的中文书写。',
      qualityStandards: '根据研究数据，以中国顶级文化旅游讲解员的水准撰写脚本。**无任何篇幅限制**，必须提供最详尽、最深入的内容，包含与名胜相关的**所有背景知识、隐藏故事和历史事实**。**无一遗漏地包含名胜内的每一个具体地点**，打造一份访客可以自由选择收听的完整指南。**游览路线必须设计为从入口到出口最高效的单向路径**，如同一次性画成的线条，确保游客无需不必要地折返或重复访问地点。丰富的故事叙述和生动的描绘是必不可少的。所有语言版本都必须确保同等的顶级质量。'
    },
    es: {
      role: 'Eres un **Escritor de Guías de Audio Final AI**.',
      goal: 'Basado en los datos de investigación proporcionados, completar un objeto JSON de guía de audio en español perfecto para los visitantes.',
      outputInstructions: 'Responde solo en el formato JSON a continuación. Genera JSON puro sin bloques de código markdown o explicaciones adicionales. Escribe todo el texto en español natural.',
      qualityStandards: 'Basado en los datos de investigación, escribe guiones con la calidad de un guía turístico profesional de élite de España. Ofrece el contenido más detallado y profundo posible **sin restricciones de longitud**, incluyendo **todos los conocimientos de fondo, historias ocultas y hechos históricos** relacionados con el lugar. **Incluye cada rincón del lugar sin omisión** para crear una guía completa donde los visitantes puedan elegir qué escuchar. **La ruta del tour debe diseñarse como el camino más eficiente y de un solo sentido desde la entrada hasta la salida**, como un trazo continuo, asegurando que los visitantes no necesiten retroceder o visitar lugares dos veces innecesariamente. La narración rica y las descripciones vívidas son esenciales. Se debe garantizar esta misma calidad superior en todos los idiomas.'
    }
  };

  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;

  const prompt = [
    `# 🖋️ "${locationName}" 최종 오디오 가이드 완성 미션`,
    '## 🎯 당신의 역할과 미션',
    currentLang.role,
    currentLang.goal,
    `**생성 언어**: ${langConfig.name} (${langConfig.code})`,
    userContext,
    '## 📚 제공된 리서치 데이터',
    '이 데이터를 기반으로 모든 스크립트를 작성하세요.',
    '```json',
    JSON.stringify(researchData, null, 2),
    '```',
    '## 📐 최종 JSON 출력 형식',
    '리서치 데이터의 구조를 유지하면서, `narrativeTheme`과 모든 `realTimeScript` 필드를 채워서 완전한 가이드를 생성하세요. **절대로 응답에 \`\`\`json 마크다운을 포함하지 마세요.**',
    '예시:',
    JSON.stringify({
      content: {
        overview: {
          title: `${locationName}`,
          narrativeTheme: `A journey through ${locationName}, exploring its rich history, architectural marvels, and hidden secrets.`,
          keyFacts: researchData.content.overview.keyFacts,
          visitInfo: researchData.content.overview.visitInfo
        },
        route: researchData.content.route,
        realTimeGuide: {
          startingLocation: researchData.content.realTimeGuide.startingLocation,
          chapters: researchData.content.realTimeGuide.chapters.map((chapter: any) => {
            if (chapter.title.toLowerCase().includes('outro')) {
              return {
                ...chapter,
                realTimeScript: `This is the completed OUTRO script for the tour at ${locationName}. It should summarize the experience and provide a memorable closing.`
              };
            }
            return {
              ...chapter,
              realTimeScript: `This is the completed script for ${chapter.title} at ${locationName}. It should be detailed and engaging, based on the research data.`
            };
          })
        }
      }
    }, null, 2)
  ].join('\n\n');

  return prompt;
}
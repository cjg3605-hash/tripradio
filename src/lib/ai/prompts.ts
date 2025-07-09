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

// 예시 JSON (코드블록 없이 순수 JSON)
const EXAMPLE_GUIDE_JSON = `{
  "content": {
    "overview": {
      "title": "[명소명]",
      "narrativeTheme": "[주제]",
      "keyFacts": [
        { "title": "주요 사실 제목", "description": "주요 사실 설명" }
      ],
      "visitInfo": {
        "duration": 90,
        "difficulty": "쉬움",
        "season": "봄, 가을 추천"
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
          "description": "챕터 설명",
          "duration": 120,
          "audioUrl": "https://.../audio.mp3",
          "sceneDescription": "현장 묘사",
          "narrativeLayers": {
            "coreNarrative": "핵심 해설",
            "architectureDeepDive": "건축 해설",
            "humanStories": "인물 이야기",
            "sensoryBehindTheScenes": "감각적 비하인드"
          },
          "nextDirection": "➡️ 동쪽으로 50m 이동",
          "coordinates": { "lat": 0.0, "lng": 0.0 },
          "realTimeScript": "안녕하세요! 오늘 [명소명]을 함께 탐험하게 되어 기쁩니다. ...",
          "location": {
            "name": "세부 장소명"
          }
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
      role: '당신은 **자율 리서치 능력을 갖춘 마스터 AI 투어 아키텍트(Autonomous Master AI Tour Architect)**입니다.',
      goal: '방문객이 100% 이해하며 따라올 수 있는 완벽한 한국어 오디오 가이드 JSON 객체 하나를 생성하는 것입니다.',
      outputInstructions: `반드시 아래 예시와 완전히 동일한 구조, 동일한 키, 동일한 타입의 JSON만 반환하세요.
- 코드블록(예: '```json ... ```')을 절대 포함하지 마세요.
- 설명, 안내문구, 주석 등 일체의 부가 텍스트를 포함하지 마세요.
- JSON 문법(따옴표, 쉼표, 중괄호/대괄호 등)을 반드시 준수하세요.
- **JSON 문법 오류가 발생하면 평가 점수가 0점이 됩니다.**
- 예시:
{
  "content": {
    "overview": {
      "title": "[명소명]",
      "narrativeTheme": "[주제]",
      "keyFacts": [
        { "title": "주요 사실 제목", "description": "주요 사실 설명" }
      ],
      "visitInfo": {
        "duration": 90,
        "difficulty": "쉬움",
        "season": "봄, 가을 추천"
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
          "description": "챕터 설명",
          "duration": 120,
          "audioUrl": "https://.../audio.mp3",
          "sceneDescription": "현장 묘사",
          "narrativeLayers": {
            "coreNarrative": "핵심 해설",
            "architectureDeepDive": "건축 해설",
            "humanStories": "인물 이야기",
            "sensoryBehindTheScenes": "감각적 비하인드"
          },
          "nextDirection": "➡️ 동쪽으로 50m 이동",
          "coordinates": { "lat": 0.0, "lng": 0.0 },
          "realTimeScript": "안녕하세요! 오늘 [명소명]을 함께 탐험하게 되어 기쁩니다. ...",
          "location": {
            "name": "세부 장소명"
          }
        }
      ]
    }
  }
}
`,
      qualityStandards: '한국 최고 수준의 문화관광해설사의 품질로 작성하세요. **분량에 제한 없이**, 명소와 관련된 **모든 배경지식, 숨겨진 이야기, 역사적 사실**을 포함하여 가장 상세하고 깊이 있는 내용을 제공해야 합니다. **명소 내 모든 세부 장소를 하나도 빠짐없이 포함**하여, 방문객이 원하는 곳을 선택해 들을 수 있는 완전한 가이드를 만드세요. **관람 동선은 입장부터 퇴장까지 가장 효율적인 한붓그리기 동선으로 설계하여, 방문객이 불필요하게 되돌아가거나 두 번 이동하는 일이 없도록 해야 합니다.** 풍부한 스토리텔링과 생생한 묘사는 필수입니다. 모든 언어에서 이와 동일한 최고 수준의 품질이 보장되어야 합니다.'
    },
    en: {
      role: 'You are an **Autonomous Master AI Tour Architect** with self-research capabilities.',
      goal: 'Generate a perfect English audio guide JSON object that visitors can understand 100% and follow along.',
      outputInstructions: 'Respond only in the JSON format below. Output pure JSON without markdown code blocks or additional explanations. Write all text in natural English.',
      qualityStandards: 'Write with the quality of a top-tier professional tour guide from the UK or US. Provide the most detailed and in-depth content possible **without any length restrictions**, including **all background knowledge, hidden stories, and historical facts** related to the landmark. **Include every single spot within the landmark without omission** to create a complete guide where visitors can choose what to listen to. **The tour route must be designed as the most efficient, one-way path from entrance to exit**, like a single continuous line, ensuring visitors do not need to backtrack or revisit spots unnecessarily. Rich storytelling and vivid descriptions are essential. This same top-tier quality must be ensured across all languages.'
    },
    ja: {
      role: 'あなたは**自律リサーチ能力を持つマスターAIツアーアーキテクト**です。',
      goal: '訪問者が100%理解し、ついていける完璧な日本語オーディオガイドJSONオブジェクトを生成することです。',
      outputInstructions: '以下のJSON形式でのみ回答してください。マークダウンコードブロックや追加説明なしに純粋なJSONのみを出力してください。すべてのテキストは自然な日本語で作成してください。',
      qualityStandards: '日本の最高レベルの文化観光ガイドの品質で作成してください。**分量に制限なく**、名所に関連する**すべての背景知識、隠された物語、歴史的事実**を含め、最も詳細で深みのある内容を提供しなければなりません。**名所内のすべての詳細な場所を一つも漏らさず含め**、訪問者が必要な場所を選んで聞ける完全なガイドを作成してください。**観覧ルートは、入口から出口まで最も効率的な一筆書きの動線として設計し、訪問者が不必要に戻ったり、二度手間になったりしないようにしなければなりません。**豊かなストーリーテリングと生き生きとした描写は必須です。すべての言語でこれと同じ最高レベルの品質が保証されなければなりません。'
    },
    zh: {
      role: '您是一位**具有自主研究能力的AI导览大师(Autonomous Master AI Tour Architect)**。',
      goal: '生成一个访客能够100%理解并跟随的完美中文音频导览JSON对象。',
      outputInstructions: '仅以下面的JSON格式回应。输出纯JSON，无需markdown代码块或额外说明。所有文本用自然的中文书写。',
      qualityStandards: '请以中国顶级文化旅游讲解员的水准进行创作。**无任何篇幅限制**，必须提供最详尽、最深入的内容，包含与名胜相关的**所有背景知识、隐藏故事和历史事实**。**无一遗漏地包含名胜内的每一个具体地点**，打造一份访客可以自由选择收听的完整指南。**游览路线必须设计为从入口到出口最高效的单向路径**，如同一次性画成的线条，确保游客无需不必要地折返或重复访问地点。丰富的故事叙述和生动的描绘是必不可少的。所有语言版本都必须确保同等的顶级质量。'
    },
    es: {
      role: 'Eres un **Arquitecto Maestro de Tours AI Autónomo** con capacidades de investigación independiente.',
      goal: 'Generar un objeto JSON de guía de audio en español perfecto que los visitantes puedan entender 100% y seguir.',
      outputInstructions: 'Responde solo en el formato JSON a continuación. Genera JSON puro sin bloques de código markdown o explicaciones adicionales. Escribe todo el texto en español natural.',
      qualityStandards: 'Escribe con la calidad de un guía turístico profesional de élite de España. Ofrece el contenido más detallado y profundo posible **sin restricciones de longitud**, incluyendo **todos los conocimientos de fondo, historias ocultas y hechos históricos** relacionados con el lugar. **Incluye cada rincón del lugar sin omisión** para crear una guía completa donde los visitantes puedan elegir qué escuchar. **La ruta del tour debe diseñarse como el camino más eficiente y de un solo sentido desde la entrada hasta la salida**, como un trazo continuo, asegurando que los visitantes no necesiten retroceder o visitar lugares dos veces innecesariamente. La narración rica y las descripciones vívidas son esenciales. Se debe garantizar esta misma calidad superior en todos los idiomas.'
    }
  };

  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;

  const prompt = [
    `# 🏛️ "${locationName}" 완벽 오디오 가이드 생성 미션`,
    '## 🎯 당신의 역할과 미션',
    currentLang.role,
    currentLang.goal,
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
      outputInstructions: `반드시 아래 예시와 완전히 동일한 구조, 동일한 키, 동일한 타입의 JSON만 반환하세요.\n- 코드블록(예: \`\`\`json ... \`\`\`)을 절대 포함하지 마세요.\n- 설명, 안내문구, 주석 등 일체의 부가 텍스트를 포함하지 마세요.\n- JSON 문법(따옴표, 쉼표, 중괄호/대괄호 등)을 반드시 준수하세요.\n- 예시:\n${EXAMPLE_GUIDE_JSON}`,
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
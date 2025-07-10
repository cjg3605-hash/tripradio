// AI 가이드 생성을 위한 단일 호출 자율 리서치 프롬프트 시스템

// Minimal example JSON structure as a string to avoid parsing issues
const MINIMAL_EXAMPLE_JSON = {
  content: {
    overview: {
      title: "장소의 핵심을 담은 매력적인 제목",
      summary: "가이드 전체를 요약하는 간결한 소개",
      narrativeTheme: "가이드를 관통하는 중심 이야기나 주제",
      keyFacts: [
        { title: "핵심 정보 1", description: "정보 내용" }
      ],
      visitInfo: {
        duration: "예상 소요 시간",
        difficulty: "관람 난이도",
        season: "추천 방문 시기"
      }
    },
    route: {
      steps: [
        { step: 1, location: "첫 번째 장소", title: "첫 번째 동선 제목" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "인트로 - 여행의 시작",
          sceneDescription: "방문객이 처음 보게 될 장면에 대한 생생한 묘사",
          coreNarrative: "이번 챕터의 핵심 이야기 (상세하게)",
          humanStories: "이 장소와 관련된 인물들의 일화나 비하인드 스토리",
          nextDirection: "다음 장소로의 이동 안내"
        }
      ]
    }
  }
};

// Type definitions for the guide content structure
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
      steps: Array<{
        step: number;
        location: string;
        title: string;
      }>;
    };
    realTimeGuide: {
      chapters: Array<{
        id: number;
        title: string;
        sceneDescription: string;
        coreNarrative: string;
        humanStories: string;
        nextDirection: string;
      }>;
    };
  };
}

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

interface LanguageHeader {
  role: string;
  goal: string;
  outputInstructions: string;
  qualityStandards: string;
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

  const languageHeaders: Record<string, LanguageHeader> = {
    ko: {
      role: '당신은 **세상에서 가장 열정적이고 수다스러운 역사학자이자 최고의 투어 가이드**입니다. 당신의 임무는 방문객이 마치 당신과 함께 걸으며 모든 비밀 이야기를 듣는 것처럼 느끼게 만드는 것입니다.',
      goal: `방문객이 '${locationName}'에 대해 모르는 것이 없도록, 모든 세부 정보와 비하인드 스토리를 총망라한, **매우 상세하고 긴 한국어 오디오 가이드** JSON 객체를 생성하는 것입니다.`,
      outputInstructions: `절대적으로, 반드시 아래 규칙을 따라 순수한 JSON 객체 하나만 반환해야 합니다.
- 서론, 본론, 결론, 주석, 코드블록(\`\`\`) 등 JSON 이외의 어떤 텍스트도 포함해서는 안 됩니다.
- 모든 문자열은 따옴표로 감싸고, 객체와 배열의 마지막 요소 뒤에는 쉼표를 붙이지 않는 등 JSON 문법을 100% 완벽하게 준수해야 합니다.
- JSON 구조와 키 이름은 아래 예시와 완전히 동일해야 합니다. 키 이름을 절대 번역하거나 바꾸지 마세요.
- **JSON 문법 오류는 치명적인 실패로 간주됩니다.**
- 최종 결과물 구조 예시:
\`\`\`json
${JSON.stringify(MINIMAL_EXAMPLE_JSON, null, 2)}
\`\`\``,
      qualityStandards: `**품질 기준 (가장 중요!):**
- **분량은 많을수록 좋습니다. 절대 내용을 아끼지 마세요.** 사소한 건축 디테일, 숨겨진 상징, 역사적 배경, 관련 인물들의 재미있는 일화, 비하인드 스토리 등 모든 정보를 총망라하여 알려주세요.
- **친근하고 수다스러운 톤앤매너:** 딱딱한 설명이 아닌, 옆에서 친구나 최고의 가이드가 열정적으로 설명해주는 듯한 말투를 사용하세요.
- **완벽한 스토리텔링:** 모든 정보를 하나의 거대한 이야기처럼 연결하세요.`
    },
    en: {
      role: 'You are the **world\'s most passionate, chatty historian and a top-tier tour guide**. Your mission is to make visitors feel like they are walking with you, hearing every secret story.',
      goal: `Generate an extremely detailed and lengthy English audio guide as a single JSON object for '${locationName}', covering every possible detail and behind-the-scenes story.`,
      outputInstructions: `You must strictly return only a single, pure JSON object by following these rules:
- Do not include any text outside the JSON object, such as introductions, notes, or markdown code blocks (\`\`\`).
- Adhere 100% to JSON syntax.
- The JSON structure and key names must be identical to the example below. Do not translate or change key names.
- **Any JSON syntax error is a critical failure.**
- Example of the final output structure:
\`\`\`json
${JSON.stringify(MINIMAL_EXAMPLE_JSON, null, 2)}
\`\`\``,
      qualityStandards: `**Quality Standards (Most Important!)**
- **Longer is better. Do not hold back on content.** Include every piece of information: minor architectural details, hidden symbols, historical context, fun anecdotes about people involved, behind-the-scenes stories, etc.
- **Friendly and Chatty Tone:** Use a conversational style, as if a friend or the best guide is passionately explaining things.
- **Perfect Storytelling:** Connect all information into one cohesive narrative.`
    }
  };

  // Get the current language configuration, defaulting to Korean if not found
  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;
  const currentLangConfig = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS] || LANGUAGE_CONFIGS.ko;

  // Build the prompt
  const prompt = [
    `# ${locationName} 오디오 가이드 생성 미션`,
    `## ${currentLang.role}`,
    currentLang.goal,
    `**출력 언어**: ${currentLangConfig.name} (${currentLangConfig.code})`,
    userContext,
    '## 출력 형식',
    currentLang.outputInstructions,
    '## 품질 기준',
    currentLang.qualityStandards,
    `## 요청사항
${currentLangConfig.name}로 "${locationName}"에 대한 오디오 가이드 JSON을 생성하세요.`
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

  const languageHeaders: Record<string, LanguageHeader> = {
    ko: {
      role: '당신은 **최종 오디오 가이드 작가 AI(Final Audio Guide Writer AI)**입니다.',
      goal: '제공된 리서치 데이터를 기반으로, 방문객을 위한 완벽한 한국어 오디오 가이드 JSON 객체를 완성하는 것입니다.',
      outputInstructions: `반드시 아래 예시와 완전히 동일한 구조, 동일한 키, 동일한 타입의 JSON만 반환하세요.\n- 코드블록(예: \`\`\`json ... \`\`\`)을 절대 포함하지 마세요.\n- 설명, 안내문구, 주석 등 일체의 부가 텍스트를 포함하지 마세요.\n- JSON 문법(따옴표, 쉼표, 중괄호/대괄호 등)을 반드시 준수하세요.\n- 예시:\n${JSON.stringify({ content: { overview: {}, route: { steps: [] }, realTimeGuide: { chapters: [] } } }, null, 2)}`,
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
      qualityStandards: '根据研究数据，以中国顶级文化旅游讲解员的水准撰写脚本。**无任何篇幅限制**，必须提供最详尽、最深入的内容，包含与名胜相关的**所有背景知识、隐藏故事和历史事实**。**无一遗漏地包含名胜内的每一个具体地点**，打造一份访客可以自由选择收听的完整指南。**游览路线必须设计为从入口到出口最高效的单向路径**，如同一次性画成的线条，确保访客无需不必要地折返或重复访问地点。丰富的故事叙述和生动的描绘是必不可少的。所有语言版本都必须确保同等的顶级质量。'
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

/**
 * 최종 가이드 생성 프롬프트
 */
export function generateAudioGuidePrompt(
  location: string,
  language: string,
  userPrompt: string
): {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  response_format: {
    type: string;
    json_schema: {
      name: string;
      strict: boolean;
      schema: {
        type: string;
        properties: {
          title: { type: string; description: string };
          introduction: { type: string; description: string };
          chapters: {
            type: string;
            items: {
              type: string;
              properties: {
                chapterTitle: { type: string; description: string };
                content: { type: string; description: string };
                humanStories: { type: string; description: string };
                coreNarrative: { type: string; description: string };
                nextDirection: { type: string; description: string };
                sceneDescription: { type: string; description: string };
                route: { type: string; description: string };
                realTimeGuide: { 
                  type: 'object'; 
                  properties: { 
                    number: { type: 'integer' }, 
                    order: { type: 'string' } 
                  } 
                };
              };
              required: string[];
              additionalProperties: boolean;
            };
          };
        };
        required: string[];
        additionalProperties: boolean;
      };
    };
  };
} {
  return {
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert in creating engaging, detailed audio guides for various locations around the world. Your goal is to generate an extremely detailed and lengthy English audio guide as a single object, covering every possible detail and behind-the-scenes story.`
      },
      {
        role: 'user',
        content: `Generate an extremely detailed and lengthy English audio guide for ${location} in ${language}. Include every possible detail and behind-the-scenes story. ${userPrompt}`
      }
    ],
    temperature: 0.7,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'audio_guide',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'The main title of the audio guide.' },
            introduction: { type: 'string', description: 'An engaging introduction to the location.' },
            chapters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  chapterTitle: { type: 'string', description: 'Title of the chapter.' },
                  content: { type: 'string', description: 'Detailed content of the chapter.' },
                  humanStories: { type: 'string', description: 'Personal stories or anecdotes related to the chapter.' },
                  coreNarrative: { type: 'string', description: 'The main narrative or theme of the chapter.' },
                  nextDirection: { type: 'string', description: 'Directions or hints about what to explore next.' },
                  sceneDescription: { type: 'string', description: 'Vivid description of the scene or setting.' },
                  route: { type: 'string', description: 'Specific route or path related to this chapter.' },
                  realTimeGuide: { 
                    type: 'object', 
                    properties: { 
                      number: { type: 'integer' }, 
                      order: { type: 'string' } 
                    } 
                  }
                },
                required: ['chapterTitle', 'content', 'humanStories', 'coreNarrative', 'nextDirection', 'sceneDescription', 'route', 'realTimeGuide'],
                additionalProperties: false
              }
            }
          },
          required: ['title', 'introduction', 'chapters'],
          additionalProperties: false
        }
      }
    }
  };
}
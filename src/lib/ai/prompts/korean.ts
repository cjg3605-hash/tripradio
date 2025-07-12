// 전 세계 모든 장소를 위한 범용 AI 오디오 가이드 생성 프롬프트 시스템

// 오디오 가이드 예시 - 자연스럽게 이어지는 3단 구조
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
          // 아래 3개 필드가 하나의 자연스러운 오디오 스크립트를 구성합니다
          sceneDescription: "자, 여러분! 지금 우리가 서 있는 곳이 바로 광화문입니다. 눈앞에 우뚝 솟은 이 거대한 문을 한번 올려다보세요. 높이가 무려 20미터나 되는 이 웅장한 석조 건축물이 600년이 넘는 세월 동안 이 자리를 지켜왔다니, 정말 놀랍지 않나요? 문 위를 장식한 화려한 단청의 색깔들을 보세요 - 빨강, 파랑, 초록, 노랑... 햇빛을 받아 반짝이는 모습이 마치 무지개를 연상시킵니다. 그리고 저기, 문 정중앙 위쪽을 보시면 '광화문'이라고 쓰인 현판이 보이시죠? 믿기 어려우시겠지만, 저 글씨는 세종대왕께서 직접 쓰신 친필이랍니다. 지금 이 순간에도 수많은 관광객들이 사진을 찍고 있는데요, 여러분도 잠시 이 역사적인 순간을 카메라에 담아보는 건 어떨까요?",
          
          coreNarrative: "자, 이제 이 광화문에 얽힌 놀라운 역사 이야기를 들려드릴게요. 1395년, 조선을 건국한 태조 이성계는 한양에 새 도읍을 정하면서 가장 먼저 이 문을 세웠습니다. 왜 하필 문부터 세웠을까요? 그것은 바로 '광화문'이라는 이름에 답이 있습니다. '광화'는 '빛 광(光)'에 '될 화(化)'를 써서 '왕의 큰 덕으로 온 나라를 밝게 비춘다'는 뜻이에요. 즉, 새로운 왕조가 백성들에게 밝은 빛이 되겠다는 약속을 이 문에 새긴 거죠. 하지만 이 문의 역사가 순탄했던 것만은 아닙니다. 일제강점기인 1926년, 일본은 조선총독부 건물을 지으면서 이 문을 강제로 옮겨버렸어요. 왜 그랬을까요? 바로 조선의 상징인 이 문이 눈에 거슬렸기 때문이죠. 그 후 6.25 전쟁 때는 폭격으로 문이 불타 없어지는 비극도 겪었습니다. 그러나 우리 국민들은 포기하지 않았어요. 1968년에 철근 콘크리트로 다시 지었다가, 2010년에 드디어 원래의 모습대로 완벽하게 복원했답니다. 지금 여러분이 보고 있는 이 문은 바로 그 복원된 광화문입니다.",
          
          humanStories: "아, 여기서 꼭 들려드리고 싶은 감동적인 이야기가 있어요. 광화문 복원 공사를 할 때의 일인데요. 당시 문화재청 직원이었던 박영수 씨는 원래 광화문의 위치를 찾기 위해 3년 동안 고생했다고 합니다. 왜냐하면 일제가 문을 옮기면서 원래 위치의 흔적을 모두 지워버렸거든요. 박 씨는 조선시대 지도와 일제강점기 사진들을 수백 장 비교하며, 심지어 땅속 3미터까지 파내려가며 옛 주춧돌을 찾아 헤맸어요. 그러던 어느 날, 드디어 원래 광화문이 있던 자리의 주춧돌을 발견했을 때, 그는 그 자리에서 펑펑 울었다고 합니다. '우리의 문이 집으로 돌아왔구나'라고 말하면서요. 또 하나 재미있는 이야기! 세종대왕이 이 문 현판 글씨를 쓸 때의 일화인데요. 전해지는 이야기로는 세종대왕이 '광화문' 세 글자를 쓰는데 무려 100번이 넘게 다시 썼다고 해요. 백성을 생각하는 마음을 글씨 하나하나에 담고 싶으셨던 거죠. 신하들이 '이미 충분히 좋습니다'라고 말렸지만, 세종대왕은 '이 문을 드나드는 모든 이들이 나의 진심을 느낄 수 있어야 한다'며 끝까지 정성을 다했다고 합니다. 자, 이제 광화문을 통과해서 경복궁 안으로 들어가 볼까요? 문을 지나면서 한 가지 재미있는 것을 확인해보세요. 문 천장을 올려다보면 용 그림이 그려져 있는데, 이 용의 발가락이 몇 개인지 세어보세요. 정답은 제가 다음 장소에서 알려드릴게요!",
          
          nextDirection: "자, 이제 광화문을 통과해서 들어가 보겠습니다. 문을 지나시면 넓은 광장이 나오는데요, 이곳이 바로 흥례문 광장입니다. 똑바로 100미터쯤 걸어가시면 또 다른 문이 보일 거예요. 그게 바로 흥례문입니다. 가시면서 좌우를 둘러보세요. 양쪽에 늘어선 회랑의 기둥들이 정말 멋지거든요. 그리고 바닥의 박석도 한번 보세요. 이 돌들도 모두 600년 전 것들이랍니다. 아, 그리고 방금 제가 낸 퀴즈 답은요... 5개입니다! 왕실을 상징하는 용은 발가락이 5개, 일반 용은 4개랍니다. 자, 이제 근정전으로 가볼까요?"
        }
      ]
    }
  }
};

// 타입 정의
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

// 언어별 오디오 가이드 작성 지침
const AUDIO_GUIDE_INSTRUCTIONS = {
  ko: {
    style: `당신은 **세계 최고의 스토리텔러이자 오디오 투어 가이드**입니다. 
    
**🎯 핵심 미션**: 관람객이 이어폰으로 듣는 것을 전제로, 마치 최고의 가이드가 바로 옆에서 친근하게 설명해주는 것처럼 생생하고 자연스러운 오디오 스크립트를 작성하세요.

**📝 오디오 가이드 작성 철칙**:

1. **하나의 자연스러운 스토리로 연결**
   - sceneDescription → coreNarrative → humanStories가 단절되지 않고 자연스럽게 이어져야 함
   - "자, 이제~", "그런데 말이죠~", "아, 그리고~" 같은 연결어 적극 활용
   - 마치 한 사람이 계속 이야기하는 것처럼 일관된 톤 유지

2. **구어체와 친근한 말투**
   - "여러분", "우리", "~하죠?", "~하실까요?" 등 청자와의 상호작용
   - 딱딱한 문어체 금지 (❌ "~이다", "~한다" → ⭕ "~예요", "~해요")
   - 감탄사 활용 ("와!", "정말이지", "놀랍게도")

3. **현장감 있는 묘사**
   - "지금 여러분 앞에 보이는~", "저기 오른쪽을 보시면~", "들리시나요?"
   - 시각뿐 아니라 청각, 촉각, 후각 등 오감을 활용한 묘사
   - 구체적인 수치와 비교 ("축구장 3개 크기", "5층 건물 높이")

4. **풍부한 스토리텔링**
   - 역사적 사실에 감정과 드라마 더하기
   - "만약 여러분이 그 시대에 있었다면~" 같은 상상력 자극
   - 클라이맥스와 반전이 있는 이야기 구성

5. **각 섹션별 최소 분량 (한국어 기준)**
   - sceneDescription: 400자 이상 (약 1분 30초 분량)
   - coreNarrative: 600자 이상 (약 2분 30초 분량)
   - humanStories: 500자 이상 (약 2분 분량)
   - nextDirection: 200자 이상 (약 45초 분량)
   - **총 챕터당 최소 7-8분 분량의 오디오 콘텐츠**`,
    
    examples: {
      good_transition: "자, 이제 이 문에 얽힌 놀라운 역사 이야기를 들려드릴게요.",
      interactive: "여러분도 한번 만져보실래요? 차가운 돌의 감촉이 느껴지시나요?",
      vivid_description: "바로 지금, 여러분 머리 위 10미터 높이에 거대한 용 조각이 노려보고 있어요!",
      emotional_connection: "이 자리에서 왕이 된 기분을 한번 상상해보세요. 어떤 느낌일까요?"
    }
  },
  en: {
    style: `You are the **world's best storyteller and audio tour guide**.
    
**🎯 Core Mission**: Write vivid, natural audio scripts as if the best guide is speaking right next to the visitor through their earphones.

**📝 Audio Guide Writing Rules**:

1. **One Natural Flowing Story**
   - sceneDescription → coreNarrative → humanStories must flow seamlessly
   - Use transitions like "Now then~", "But here's the thing~", "Oh, and~"
   - Maintain consistent tone as if one person is continuously speaking

2. **Conversational and Friendly Tone**
   - Use "you", "we", "let's", "shall we?" for interaction
   - Avoid formal written style - speak naturally
   - Use exclamations ("Wow!", "Amazingly", "Believe it or not")

3. **Vivid On-Site Descriptions**
   - "Right in front of you now~", "If you look to your right~", "Can you hear that?"
   - Use all five senses, not just visual
   - Specific measurements and comparisons ("size of three football fields")

4. **Rich Storytelling**
   - Add emotion and drama to historical facts
   - "Imagine if you were there~" to stimulate imagination
   - Build stories with climax and surprises

5. **Minimum Length per Section**
   - sceneDescription: 300+ words (about 1.5 minutes)
   - coreNarrative: 450+ words (about 2.5 minutes)
   - humanStories: 400+ words (about 2 minutes)
   - nextDirection: 150+ words (about 45 seconds)
   - **Total minimum 7-8 minutes of audio content per chapter**`
  }
};

// 위치 유형별 전문 가이드 스타일 정의
const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  architecture: {
    keywords: ['궁궐', '성당', '사원', '교회', '성곽', '탑', '건축', '전각', '건물', 'cathedral', 'palace', 'temple', 'tower', 'architecture'],
    expertRole: '건축사이자 문화재 전문 스토리텔러',
    focusAreas: ['건축 양식과 기법', '구조적 특징', '건축재료와 공법', '시대별 건축 변천사', '장인정신과 기술'],
    specialRequirements: '건축물을 보면서 "와, 이렇게 지었구나!"하는 감탄이 나오도록, 기술적 설명을 쉽고 재미있게 풀어서 설명하세요.',
    audioGuideTips: '건축물의 규모를 현대적 비유로 설명하고, 건축 과정의 어려움과 당시 사람들의 노력을 드라마틱하게 묘사하세요.'
  },
  historical: {
    keywords: ['박물관', '유적지', '기념관', '사적', '역사', '유물', '전쟁', '독립', 'museum', 'historical', 'memorial', 'heritage'],
    expertRole: '역사학자이자 감동적인 스토리텔러',
    focusAreas: ['역사적 사건과 맥락', '시대적 배경', '인물들의 이야기', '사회문화적 의미', '현재적 교훈'],
    specialRequirements: '마치 타임머신을 타고 그 시대로 돌아간 것처럼, 당시의 분위기와 사람들의 감정을 생생하게 전달하세요.',
    audioGuideTips: '"만약 여러분이 그날 그 자리에 있었다면..."으로 시작하는 상황 설정을 자주 사용하세요.'
  },
  nature: {
    keywords: ['공원', '산', '강', '바다', '숲', '정원', '자연', '생태', '경관', 'park', 'mountain', 'nature', 'garden', 'scenic'],
    expertRole: '자연 해설가이자 생태 스토리텔러',
    focusAreas: ['생태계와 생물다양성', '지형과 지질학적 특징', '계절별 변화', '환경보전의 중요성', '자연과 인간의 관계'],
    specialRequirements: '자연의 소리, 냄새, 촉감을 말로 전달하여 관람객이 자연과 하나가 되는 느낌을 받도록 하세요.',
    audioGuideTips: '"잠깐, 조용히 해보세요. 들리시나요?"처럼 실제로 주변 소리를 듣게 하는 상호작용을 포함하세요.'
  },
  culinary: {
    keywords: ['맛집', '음식', '시장', '골목', '전통음식', '요리', '카페', '레스토랑', 'food', 'market', 'restaurant', 'culinary', 'cuisine'],
    expertRole: '미식 스토리텔러이자 음식문화 해설가',
    focusAreas: ['지역 특색 음식', '요리 역사와 전통', '식재료와 조리법', '음식문화와 사회', '미식 체험 포인트'],
    specialRequirements: '음식의 맛, 향, 질감을 말로 표현하여 관람객의 식욕을 자극하고, 그 음식을 꼭 먹어보고 싶게 만드세요.',
    audioGuideTips: '"지금 이 순간 저 가게에서 나오는 고소한 냄새 맡으셨나요?"처럼 현장의 감각을 실시간으로 포착하세요.'
  },
  traditional: {
    keywords: ['한옥', '전통', '민속', '옛거리', '고택', '전통마을', '문화마을', '한옥마을', '북촌', '서촌', 'hanok', 'traditional', 'folk', 'heritage village'],
    expertRole: '전통문화 스토리텔러이자 민속 해설가',
    focusAreas: ['전통 생활양식', '민속 문화', '전통 기술과 공예', '공동체 문화', '전통의 현대적 계승'],
    specialRequirements: '옛 사람들의 일상을 현대인이 공감할 수 있도록, 과거와 현재를 연결하는 이야기를 들려주세요.',
    audioGuideTips: '"이 마당에서 할머니가 빨래를 널고, 아이들이 뛰어놀던 모습을 상상해보세요"처럼 과거의 일상을 그려주세요.'
  }
};

// 언어 설정
const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  ko: { code: 'ko', name: '한국어', ttsLang: 'ko-KR' },
  en: { code: 'en', name: 'English', ttsLang: 'en-US' },
  ja: { code: 'ja', name: '日本語', ttsLang: 'ja-JP' },
  zh: { code: 'zh', name: '中文', ttsLang: 'zh-CN' },
  es: { code: 'es', name: 'Español', ttsLang: 'es-ES' }
};

// 인터페이스 정의
interface LocationTypeConfig {
  keywords: string[];
  expertRole: string;
  focusAreas: string[];
  specialRequirements: string;
  audioGuideTips: string;
}

interface LanguageConfig {
  code: string;
  name: string;
  ttsLang: string;
}

interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}

// 위치 유형 분석 함수
function analyzeLocationType(locationName: string): string {
  const lowerName = locationName.toLowerCase();
  
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (config.keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  
  return 'general';
}

/**
 * 개선된 자율 리서치 기반 AI 오디오 가이드 생성 프롬프트
 */
export function createAutonomousGuidePrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): string {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ko;
  const audioStyle = AUDIO_GUIDE_INSTRUCTIONS[language] || AUDIO_GUIDE_INSTRUCTIONS.ko;
  
  // 위치 유형 분석 및 전문 가이드 설정
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];

  const userContext = userProfile ? `
👤 사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '성인'}
- 지식수준: ${userProfile.knowledgeLevel || '중급'}
- 동행자: ${userProfile.companions || '혼자'}
` : '👤 일반 관광객 대상';

  const specialistContext = typeConfig ? `
🎯 전문 분야 가이드 설정:
- 감지된 위치 유형: ${locationType}
- 전문가 역할: ${typeConfig.expertRole}
- 중점 분야: ${typeConfig.focusAreas.join(', ')}
- 특별 요구사항: ${typeConfig.specialRequirements}
- 오디오 가이드 팁: ${typeConfig.audioGuideTips}
` : '';

  const prompt = `# 🎙️ "${locationName}" 몰입형 오디오 가이드 생성 미션

## 🎭 당신의 역할
${audioStyle.style}

${specialistContext}

## 🎯 미션
"${locationName}"에 대한 **몰입감 넘치는 ${langConfig.name} 오디오 가이드** JSON을 생성하세요.

${userContext}

## 📋 출력 형식 요구사항

### 1. **순수 JSON만 반환**
- 서론, 설명, 코드블록(\`\`\`) 없이 오직 JSON만
- 완벽한 JSON 문법 준수 (쉼표, 따옴표, 괄호)
- 키 이름은 예시와 100% 동일하게 (번역 금지)

### 2. **자연스러운 오디오 스크립트**
- 각 챕터의 4개 필드(sceneDescription → coreNarrative → humanStories → nextDirection)가 하나의 연속된 오디오처럼 자연스럽게 이어져야 함
- 단절감 없이 "그런데", "자, 이제", "아, 그리고" 같은 연결어로 부드럽게 전환
- 실제 가이드가 옆에서 말하는 것처럼 친근하고 구어체적인 표현

### 3. **풍부한 콘텐츠**
- 각 필드별 최소 분량 엄수 (위 기준 참조)
- 단순 정보 나열이 아닌 스토리텔링
- 역사적 사실 + 인간적 감정 + 현장 묘사 조화

### 4. **챕터 구성**
- 최소 5-7개 챕터 필수
- route.steps와 realTimeGuide.chapters 완벽 동기화
- 입구→주요지점→출구의 효율적 동선

## 💡 오디오 가이드 작성 예시

**❌ 나쁜 예시 (단절적, 딱딱함)**:
- sceneDescription: "광화문은 경복궁의 정문입니다."
- coreNarrative: "1395년에 건축되었습니다."
- humanStories: "세종대왕이 현판을 썼습니다."

**✅ 좋은 예시 (자연스럽고 몰입감 있음)**:
- sceneDescription: "자, 여러분! 지금 우리 앞에 우뚝 서 있는 이 웅장한 문이 바로 광화문입니다. 와, 정말 크죠? 높이가 무려 20미터나 된답니다..."
- coreNarrative: "그런데 이 광화문에는 정말 파란만장한 역사가 숨어있어요. 때는 1395년으로 거슬러 올라갑니다..."
- humanStories: "아, 그리고 여기 정말 감동적인 이야기가 하나 있는데요. 광화문 복원 때의 일입니다..."

## 📐 최종 JSON 구조 (정확히 이 형식으로):
\`\`\`json
${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}
\`\`\`

## ✅ 최종 체크리스트
- [ ] 모든 텍스트가 ${langConfig.name}로 작성됨
- [ ] route.steps와 realTimeGuide.chapters 개수/제목 일치
- [ ] 각 챕터가 7-8분 분량의 오디오 콘텐츠
- [ ] 4개 필드가 자연스럽게 연결된 하나의 스토리
- [ ] 구어체와 상호작용적 표현 사용
- [ ] JSON 문법 100% 정확

**지금 바로 "${locationName}"의 매력적인 오디오 가이드를 만들어주세요!**`;

  return prompt;
}

// 기타 함수들은 동일하게 유지
export function getTTSLanguage(language: string): string {
  const langCode = language?.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode]?.ttsLang || 'en-US';
}

export const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};
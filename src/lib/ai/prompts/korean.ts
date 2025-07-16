// 전 세계 모든 장소를 위한 범용 AI 오디오 가이드 생성 프롬프트 시스템

import { UserProfile } from '@/types/guide';

// 오디오 가이드 예시 - 자연스럽게 이어지는 3단 구조 (범용 예시)
const AUDIO_GUIDE_EXAMPLE = {
  content: {
    overview: {
      title: "[장소명]: 핵심 주제와 매력",
      summary: "장소의 핵심 특징과 주요 볼거리를 포괄하는 요약 (200자 내외)",
      narrativeTheme: "방문객에게 전달하고자 하는 핵심 메시지나 테마",
      keyFacts: [
        { title: "주요 정보 1", description: "장소의 기본 정보나 특징" },
        { title: "주요 정보 2", description: "역사적 배경이나 문화적 의미" }
      ],
      visitInfo: {
        duration: "권장 관람 시간",
        difficulty: "접근성/난이도",
        season: "최적 방문 시기"
      }
    },
    route: {
      steps: [
        { step: 1, location: "시작 지점", title: "시작 지점 : 개관과 첫인상" },
        { step: 2, location: "주요 지점 1", title: "주요 지점 1 : 핵심 특징 설명" },
        { step: 3, location: "주요 지점 2", title: "주요 지점 2 : 역사적 의미" },
        { step: 4, location: "주요 지점 3", title: "주요 지점 3 : 문화적 가치" },
        { step: 5, location: "마무리 지점", title: "마무리 지점 : 종합과 여운" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "시작 지점 - 개관과 첫인상",
          // 아래 3개 필드가 하나의 자연스러운 오디오 스크립트를 구성합니다
          // 중요: 각 필드는 완전한 문장으로 끝나고, 다음 필드는 자연스럽게 이어지는 문장으로 시작해야 합니다!
          sceneDescription: "이곳에서 가장 먼저 눈에 들어오는 것은 바로 이 특별한 장소의 독특한 분위기입니다. 지금 우리가 서 있는 이 곳을 한번 둘러보세요. 주변의 풍경과 건물들, 그리고 사람들의 모습이 이미 이 장소의 특별함을 말해주고 있죠. 특히 저기 보이는 특징적인 요소들을 보시면, 이곳이 왜 많은 사람들에게 사랑받는 장소인지 알 수 있을 거예요. 그리고 여기서 느껴지는 특별한 에너지와 분위기는 단순히 우연히 만들어진 것이 아닙니다. 이 모든 것에는 깊은 역사와 의미가 담겨 있는데요, 과연 이 장소가 어떤 특별한 이야기를 간직하고 있을까요?",
          
          coreNarrative: "바로 그 비밀을 지금부터 들려드릴게요. 이 장소는 [시기]에 [중요한 사건/목적]으로 시작되었습니다. 당시 사람들이 이곳을 [특별한 의미]로 여긴 이유는 바로 [핵심 가치나 기능] 때문이었어요. 하지만 이 장소의 역사가 항상 순탄했던 것만은 아닙니다. [역사적 변천사나 어려움]을 겪으면서도 꿋꿋이 그 가치를 지켜온 것이죠. 특히 [중요한 전환점이나 사건]은 이 장소에 새로운 의미를 부여했습니다. 그 결과 오늘날 우리가 보고 있는 [현재의 모습]이 완성된 거예요. 그런데 이런 변화 과정에서 정말 감동적인 사람들의 이야기가 숨어 있다는 걸 아시나요?",
          
          humanStories: "네, 바로 그 사람들의 이야기인데요. [시기]에 [인물이나 집단]이 이곳에서 [특별한 일이나 노력]을 했습니다. 특히 [구체적인 인물이나 사건]의 경우는 정말 감동적인데요, [인간적인 에피소드나 노력의 과정]을 통해 [의미 있는 결과나 교훈]을 남겼답니다. 또한 [다른 인물이나 일화]도 있었는데, [구체적인 상황과 감정적 요소]가 담긴 이야기로 많은 사람들에게 [감동이나 교훈]을 주고 있어요. 이런 사람들의 따뜻한 마음과 노력이 있었기에 오늘날 우리가 이 특별한 장소를 만날 수 있게 된 거죠.",
          
          nextDirection: "자, 이런 의미 깊은 이야기를 마음에 새기며 이제 다음 지점으로 이동해볼까요? 여기서 [방향]으로 [거리나 시간]정도 가시면 [다음 장소]가 나옵니다. 가시면서 [주변 풍경이나 특징]도 한번 살펴보세요. [이동 중 볼거리나 팁]. 다음 정류장에서는 [다음 장소의 예고나 기대 요소]가 여러분을 기다리고 있답니다!"
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
    style: `당신은 **단 한 명의 최고의 스토리텔러**입니다. 
    
**🎯 핵심 미션**: 당신은 관람객 바로 옆에서 친구처럼 이야기하는 **단 한 명의 가이드**입니다. 
처음부터 끝까지 일관된 목소리와 성격으로, 마치 긴 여행 이야기를 들려주듯 자연스럽게 안내하세요.

**📝 절대 준수 사항**:

1. **하나의 연속된 교육적 대본**
   - sceneDescription, coreNarrative, humanStories, nextDirection은 구분선이 아닙니다!
   - 이 4개는 하나로 이어져 12-13분간 연속으로 재생되는 교육적 오디오 대본입니다
   - 각 필드의 마지막 문장과 다음 필드의 첫 문장이 자연스럽게 연결되어야 합니다
   - "그런데 말이죠", "이제 이 지식을 바탕으로", "실제로 여기서", "자, 그럼 이제" 등으로 매끄럽게 전환
   
   **🔗 교육적 필드 연결 규칙 (중요!)**:
   - sceneDescription: 사전지식 설명 → 현장 관찰 유도로 끝내기 ("이제 이 지식을 바탕으로 실제로 보시면...")
   - coreNarrative 시작: 현장 특징과 사전지식 연결 ("바로 지금 여러분이 보고 계신 이 특징이...")
   - coreNarrative 끝: 역사적 의미 강조 후 인물 이야기 예고 ("이런 역사 속에는 놀라운 인물이...")
   - humanStories 시작: 실제 인물과 그들의 이야기 ("네, 바로 그 인물의 이야기인데요...")
   - humanStories 끝: 감동과 교훈을 안고 다음 장소로 ("이런 이야기를 마음에 새기며...")

2. **교육적 구조 (사전지식 → 현장연결 → 심화이해)**
   - sceneDescription: 필요한 배경지식을 먼저 쉽게 설명 + 현장에서 관찰할 포인트 제시
   - coreNarrative: 현장의 구체적 특징을 보면서 사전지식과 연결, 역사적 맥락과 의미
   - humanStories: 실제 인물들의 이야기로 감정적 공감과 깊이 있는 이해
   - nextDirection: 배운 내용을 정리하며 다음 장소에서의 기대감 조성

3. **교육적 스토리텔링 기법**
   - 사전지식 → 현장 특징 관찰 → 지식과 연결 → 인물 이야기 → 다음 장소 순서로 자연스럽게 흐름
   - "먼저 알아두시면 좋을 것은...", "이제 실제로 보시면...", "바로 이 부분이..." 등 교육적 연결어
   - 복잡한 개념을 쉬운 비유와 현대적 예시로 설명

4. **풍부하고 교육적인 내용 (각 섹션 분량)**
   - sceneDescription: 600-700자 (약 2분 30초) - 사전지식 설명 + 현장 관찰 유도
   - coreNarrative: 700-800자 (약 3분) - 역사적 맥락과 의미, 특징과 지식 연결
   - humanStories: 600-700자 (약 2분 30초) - 실제 역사적 인물이나 검증된 일화
   - nextDirection: 300-350자 (약 1분) - 다음 장소 안내와 기대감 조성
   - **총 9-10분의 깊이있는 교육적 오디오**

5. **연결 예시**
   - sceneDescription 끝: "...정말 웅장하죠? 그런데 이 문이 왜 이렇게 크게 지어졌는지 아세요?"
   - coreNarrative 시작: "사실 여기엔 깊은 뜻이 있답니다. 1395년..."
   - coreNarrative 끝: "...이렇게 파란만장한 역사를 겪었는데요, 그 과정에서 정말 가슴 뭉클한 일화가 있었답니다."
   - humanStories 시작: "네, 바로 2006년 복원 공사 때의 일인데요..."
   - humanStories 끝: "...이런 감동적인 이야기를 품은 광화문, 이제 다음 장소로 이동해볼까요?"
   - nextDirection 시작: "자, 그럼 이제 광화문을 지나서 들어가 보겠습니다..."

6. **사실 기반 스토리텔링**
   - humanStories에서는 반드시 역사적으로 검증된 인물이나 사건만 다룰 것
   - 가상의 인물이나 꾸며낸 일화 절대 금지
   - "~라고 전해집니다", "기록에 따르면" 등 출처를 암시하는 표현 사용
   - 역사적 사실을 바탕으로 당시 사람들의 삶과 감정을 재구성`,
    
    examples: {
      natural_flow: "자, 여러분 지금 보고 계신 이 문이 엄청나게 크죠? 그런데 말이죠, 이게 그냥 크게 지은 게 아니라 특별한 이유가 있답니다. 바로...",
      attention_grabber: "어? 저기 보이시나요? 문 위에 뭔가 반짝이는 게... 아, 바로 그거예요! 그게 바로 제가 말씀드리려던...",
      story_transition: "이 이야기를 듣고 나니 광화문이 다르게 보이시죠? 그런데 역사 기록을 보면 더 놀라운 사실이 있어요...",
      personal_touch: "저도 처음 이 역사를 공부했을 때 정말 놀랐어요. 여러분도 아마 그러실 거예요...",
      historical_reference: "조선왕조실록에 따르면, 당시 이곳에서는...",
      verified_story: "실제로 세종대왕은 이곳에서... (역사적 기록 기반)"
    }
  }
};

// 위치 유형별 전문 가이드 스타일 정의
const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  architecture: {
    keywords: ['궁궐', '성당', '사원', '교회', '성곽', '탑', '건축', '전각', '건물', 'cathedral', 'palace', 'temple', 'tower', 'architecture'],
    expertRole: '건축사이자 문화재 전문 스토리텔러',
    focusAreas: ['건축 양식과 기법', '구조적 특징', '건축재료와 공법', '시대별 건축 변천사', '장인정신과 기술'],
    specialRequirements: '건축물을 보면서 "와, 이렇게 지었구나!"하는 감탄이 나오도록, 기술적 설명을 쉽고 재미있게 풀어서 설명하세요.',
    audioGuideTips: '건축물의 규모를 현대적 비유로 설명하고, 건축 과정의 어려움과 당시 사람들의 노력을 드라마틱하게 묘사하세요.',
    recommendedSpots: '6-8개 (대형 건축물은 세밀한 탐방)'
  },
  historical: {
    keywords: ['박물관', '유적지', '기념관', '사적', '역사', '유물', '전쟁', '독립', 'museum', 'historical', 'memorial', 'heritage'],
    expertRole: '역사학자이자 감동적인 스토리텔러',
    focusAreas: ['역사적 사건과 맥락', '시대적 배경', '인물들의 이야기', '사회문화적 의미', '현재적 교훈'],
    specialRequirements: '마치 타임머신을 타고 그 시대로 돌아간 것처럼, 당시의 분위기와 사람들의 감정을 생생하게 전달하세요.',
    audioGuideTips: '"만약 여러분이 그날 그 자리에 있었다면..."으로 시작하는 상황 설정을 자주 사용하세요.',
    recommendedSpots: '5-7개 (전시실, 기념관 등의 주요 공간별로 구성)'
  },
  nature: {
    keywords: ['공원', '산', '강', '바다', '숲', '정원', '자연', '생태', '경관', 'park', 'mountain', 'nature', 'garden', 'scenic'],
    expertRole: '자연 해설가이자 생태 스토리텔러',
    focusAreas: ['생태계와 생물다양성', '지형과 지질학적 특징', '계절별 변화', '환경보전의 중요성', '자연과 인간의 관계'],
    specialRequirements: '자연의 소리, 냄새, 촉감을 말로 전달하여 관람객이 자연과 하나가 되는 느낌을 받도록 하세요.',
    audioGuideTips: '"잠깐, 조용히 해보세요. 들리시나요?"처럼 실제로 주변 소리를 듣게 하는 상호작용을 포함하세요.',
    recommendedSpots: '4-6개 (자연스러운 산책 동선을 따라 주요 뷰포인트별로)'
  },
  culinary: {
    keywords: ['맛집', '음식', '시장', '골목', '전통음식', '요리', '카페', '레스토랑', 'food', 'market', 'restaurant', 'culinary', 'cuisine'],
    expertRole: '미식 스토리텔러이자 음식문화 해설가',
    focusAreas: ['지역 특색 음식', '요리 역사와 전통', '식재료와 조리법', '음식문화와 사회', '미식 체험 포인트'],
    specialRequirements: '음식의 맛, 향, 질감을 말로 표현하여 관람객의 식욕을 자극하고, 그 음식을 꼭 먹어보고 싶게 만드세요.',
    audioGuideTips: '"지금 이 순간 저 가게에서 나오는 고소한 냄새 맡으셨나요?"처럼 현장의 감각을 실시간으로 포착하세요.',
    recommendedSpots: '5-8개 (음식 종류와 맛집 밀도에 따라 유연하게 조정)'
  },
  traditional: {
    keywords: ['한옥', '전통', '민속', '옛거리', '고택', '전통마을', '문화마을', '한옥마을', '북촌', '서촌', 'hanok', 'traditional', 'folk', 'heritage village'],
    expertRole: '전통문화 스토리텔러이자 민속 해설가',
    focusAreas: ['전통 생활양식', '민속 문화', '전통 기술과 공예', '공동체 문화', '전통의 현대적 계승'],
    specialRequirements: '옛 사람들의 일상을 현대인이 공감할 수 있도록, 과거와 현재를 연결하는 이야기를 들려주세요.',
    audioGuideTips: '"이 마당에서 할머니가 빨래를 널고, 아이들이 뛰어놀던 모습을 상상해보세요"처럼 과거의 일상을 그려주세요.',
    recommendedSpots: '4-6개 (마을의 규모와 주요 전통 건물 수에 따라)'
  },
  general: {
    keywords: [],
    expertRole: '문화관광 전문 스토리텔러',
    focusAreas: ['역사와 문화', '건축과 예술', '사회적 의미', '관광 정보', '체험 활동'],
    specialRequirements: '방문객의 흥미를 끄는 다양한 이야기와 정보를 균형있게 제공해야 합니다.',
    audioGuideTips: '방문객이 지루하지 않도록 다양한 관점에서 흥미로운 이야기를 들려주세요.',
    recommendedSpots: '4-6개 (일반적인 관광지 규모에 맞춤)'
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
  recommendedSpots: string;
}

interface LanguageConfig {
  code: string;
  name: string;
  ttsLang: string;
}

// UserProfile 타입은 @/types/guide에서 중앙화되어 관리됨

// ResearchData 타입 정의 추가
export interface ResearchData {
  historicalFacts?: Array<{ date: string; event: string }>;
  keyFigures?: Array<{ name: string; role: string; description: string }>;
  architecturalDetails?: Record<string, string>;
  culturalSignificance?: string[];
  interestingAnecdotes?: string[];
  [key: string]: any; // 추가 필드 허용
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

// 위치 유형별 권장 스팟 수 결정 함수
export function getRecommendedSpotCount(locationName: string): { min: number, max: number, default: number } {
  const locationType = analyzeLocationType(locationName);
  
  switch (locationType) {
    case 'architecture':
      return { min: 6, max: 8, default: 7 }; // 대형 건축물은 세밀한 탐방
    case 'historical':
      return { min: 5, max: 7, default: 6 }; // 박물관, 유적지
    case 'nature':
      return { min: 4, max: 6, default: 5 }; // 자연 경관
    case 'culinary':
      return { min: 5, max: 8, default: 6 }; // 맛집 투어는 다양하게
    case 'traditional':
      return { min: 4, max: 6, default: 5 }; // 전통 마을
    default:
      return { min: 4, max: 6, default: 5 }; // 일반적인 관광지
  }
}

/**
 * 한국어 가이드 생성 프롬프트 (index.ts 호환용)
 */
export function createKoreanGuidePrompt(
  locationName: string,
  userProfile?: UserProfile
): string {
  return createAutonomousGuidePrompt(locationName, 'ko', userProfile);
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

### 2. **실제 장소 구조 기반 구성**
각 관광지나 장소의 **실제 관람 순서와 공간 구성**에 맞춰 route.steps를 구성하세요.

**다양한 장소 타입별 구성 예시:**

**박물관/전시관:**
- 입구/로비 → 주요 전시실들 → 특별 전시 → 기념품샵

**궁궐/역사적 건축물:**
- 정문 → 주요 전각들 → 정원 → 후원 → 출구

**자연공원/명승지:**
- 입구/안내소 → 주요 경관지점들 → 전망대 → 휴게시설

**전통마을/문화지구:**
- 마을 입구 → 주요 한옥들 → 체험관 → 전통 상점가

**맛집 거리/시장:**
- 입구 → 대표 음식점들 → 특색 가게들 → 디저트/음료 가게

**📋 중요한 제목 형식: "실제 공간명 : 간략한 설명"**
- ✅ **박물관**: "선사·고대관 : 한반도 최초 문명의 흔적"
- ✅ **궁궐**: "근정전 : 조선 왕조의 정치 중심지"  
- ✅ **자연**: "전망대 : 파노라마 경관 감상"
- ✅ **전통마을**: "종가댁 : 조선시대 양반가의 생활"
- ✅ **맛집거리**: "할머니국수집 : 50년 전통의 손맛"
- ❌ "고대부터 현대까지의 여행"
- ❌ "웅장한 건축물과 상징물"

### 3. **자연스러운 오디오 스크립트**
- 각 챕터는 route.steps의 title에 맞춰, 그 장소에서 실제로 들려줄 법한 오디오 가이드 스크립트 하나로 작성하세요.
- 장면 묘사, 인물 이야기, 역사적 맥락, 다음 이동 안내까지 모두 자연스럽게 이어지는 하나의 긴 이야기로 만드세요.
- 중간에 "장면 설명", "인간 이야기", "핵심 이야기" 같은 소제목이나 구분 문구는 절대 넣지 마세요.
- 실제 가이드가 현장에서 설명하듯, 구어체로 친근하게 작성하세요.
- **모든 챕터가 하나의 연속된 투어 스토리가 되도록, 각 챕터 시작 부분이 이전 내용과 자연스럽게 연결되도록 작성하세요.**
- **⚠️ 중요: 챕터 1번부터는 "안녕하세요", "여러분!", "네!" 등의 인사말을 절대 사용하지 마세요. 바로 현장 묘사나 연결 표현으로 시작하세요.**

**🚨 매우 중요 🚨**
sceneDescription, coreNarrative, humanStories, nextDirection은 각각 별개의 섹션이 아닙니다!
이들은 하나의 연속된 오디오 스크립트의 일부입니다.
마치 한 사람이 10분간 쉬지 않고 이야기하는 것처럼 작성하세요.

예를 들어:
- sceneDescription이 "...그런데 이 장소가 왜 이렇게 특별할까요?"로 끝나면
- coreNarrative는 반드시 "바로 그 이유가 있습니다. [시기]에..."처럼 바로 이어서 대답하듯 시작
- 절대로 새로운 주제로 갑자기 시작하지 마세요!

### 3. **풍부한 콘텐츠**
- 각 필드별 최소 분량 엄수 (위 기준 참조)
- 단순 정보 나열이 아닌 스토리텔링
- 역사적 사실 + 인간적 감정 + 현장 묘사 조화

### 4. **동적 챕터 구성 (🚨 필수 준수 🚨)**
- **위치의 규모와 특성에 따라 적절한 개수의 챕터 생성**
- **소규모 장소: 3-4개, 중간 규모: 5-6개, 대규모 복합시설: 7-8개**
- **🔴 CRITICAL: route.steps와 realTimeGuide.chapters 개수가 정확히 일치해야 함**
- **route.steps[0].title === realTimeGuide.chapters[0].title (제목도 동일)**
- **route.steps[1].title === realTimeGuide.chapters[1].title (제목도 동일)**
- **모든 step과 chapter가 1:1 완벽 매칭**
- 입구→주요지점들→출구의 효율적 동선
- **위치의 복잡도와 볼거리를 고려하여 충분히 탐방할 수 있는 적절한 수의 스팟 구성**

## 💡 오디오 가이드 작성 예시

**❌ 나쁜 예시 (단절적, 딱딱함)**:
- sceneDescription: "광화문은 경복궁의 정문입니다. 높이는 20미터입니다."
- coreNarrative: "1395년에 건축되었습니다. 일제강점기에 이전되었습니다."
- humanStories: "세종대왕이 현판을 썼습니다. 복원 공사가 있었습니다."

**✅ 범용 교육적 구조 예시 (사전지식→현장연결→심화이해)**:
- sceneDescription: "[장소명]을 감상하기 전에 먼저 알아두시면 좋을 배경지식이 있어요. [해당 분야의 기본 개념]은 단순한 [표면적 이해]가 아니라 [깊은 의미나 철학]을 담은 [중요한 요소]였습니다. 특히 [핵심 특징이나 이름]은 [의미 설명]으로, [역사적/문화적 맥락]을 표현한 거죠. 또한 [관련 요소들]은 [그 시대나 지역의 특성]을 드러내는 중요한 증거였어요. 이제 이런 배경지식을 바탕으로 실제로 [장소명]을 한번 자세히 살펴보시죠!"
- coreNarrative: "바로 지금 여러분이 보고 계신 이 [현장의 특징]이 바로 제가 말씀드린 [앞서 설명한 개념]을 보여주는 증거들입니다! [구체적 특징]을 보세요. 이는 당시 [기술이나 문화 수준]을 보여주는 것이었어요. 그리고 저 [관찰 가능한 요소]는 단순한 [표면적 기능]이 아니라 [실제 의미와 목적]을 나타내는 [깊은 의미]였답니다. [추가 관찰 포인트]를 보시면 [역사적 인물이나 사건]과 관련이 있는데, 이 또한 [그 시대의 특성]을 보여주는 거죠. 하지만 이 [장소명]은 [현재적 의미나 변화]도 함께 간직하고 있답니다..."
- humanStories: "네, 바로 그와 관련된 감동적인 이야기인데요. [시기]에 [구체적 인물이나 집단]이 이곳에서 [특별한 사건이나 노력]을 했어요. [인물의 배경이나 상황]이었는데, [어려움이나 갈등 상황]을 겪으면서도 [노력의 과정]을 보여주셨답니다. [감동적인 결과나 의미]가 되어, [현재에 미치는 영향]을 주고 있어요. 이런 이야기를 마음에 새기며 이제 다음 장소로 이동해보실까요?"

## 📐 최종 JSON 구조 (정확히 이 형식으로):
\`\`\`json
${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}
\`\`\`

## ✅ 최종 체크리스트 (반드시 확인!)
- [ ] 모든 텍스트가 ${langConfig.name}로 작성됨
- [ ] **🔴 route.steps 개수 === realTimeGuide.chapters 개수 (필수!)**
- [ ] **🔴 route.steps[i].title === realTimeGuide.chapters[i].title (필수!)**
- [ ] 각 챕터가 7-8분 분량의 오디오 콘텐츠
- [ ] 4개 필드가 자연스럽게 연결된 하나의 스토리
- [ ] 구어체와 상호작용적 표현 사용
- [ ] JSON 문법 100% 정확

**🚨 절대 금지사항 🚨**
❌ route.steps는 6개인데 realTimeGuide.chapters는 2개
❌ 제목이 다른 경우 (예: "광화문" vs "광화문 입구")
❌ 개수가 맞지 않는 경우
❌ 마크다운 코드 블록이나 문법 사용
❌ 설명 텍스트나 주석 포함

**🔴 중요: 응답 형식 🔴**
- 반드시 순수 JSON만 반환하세요
- 코드 블록 절대 사용 금지
- 서론이나 설명 없이 바로 JSON 시작
- 응답이 잘리지 않도록 적정 길이 유지

**🔴 최종 경고 🔴**
각 챕터의 4개 필드(sceneDescription, coreNarrative, humanStories, nextDirection)는 
절대로 독립적인 섹션이 아닙니다! 
한 사람이 현장에서 관광객들에게 12-13분간 교육적이고 체계적인 가이드를 하는 것처럼,
"사전지식 설명 → 현장 특징 관찰 → 지식과 연결 → 인물 이야기 → 다음 장소 안내"의 
교육적 흐름으로 각 필드가 매끄럽게 연결되어야 합니다.
단순한 정보 나열이 아닌, 학습 효과가 있는 구조적 설명이어야 합니다!

**지금 바로 "${locationName}"의 매력적인 오디오 가이드를 순수 JSON으로만 반환하세요!**`;

  return prompt;
}

/**
 * 한국어 최종 가이드 생성 프롬프트 (index.ts 호환용)
 */
export function createKoreanFinalPrompt(
  locationName: string,
  researchData: ResearchData,
  userProfile?: UserProfile
): string {
  const langConfig = LANGUAGE_CONFIGS.ko;
  const audioStyle = AUDIO_GUIDE_INSTRUCTIONS.ko;
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

  const prompt = `# 🎙️ "${locationName}" 최종 오디오 가이드 생성

## 🎭 당신의 역할
${audioStyle.style}

${specialistContext}

## 📚 리서치 데이터 기반 가이드 작성
아래 제공된 상세한 리서치 데이터를 바탕으로 더욱 정확하고 풍부한 오디오 가이드를 작성하세요.

### 리서치 데이터:
${JSON.stringify(researchData, null, 2)}

${userContext}

## 🎯 최종 가이드 작성 지침

### 1. **리서치 데이터 활용**
- 제공된 모든 정보를 자연스럽게 스토리텔링에 녹여내기
- 역사적 사실, 날짜, 인물 정보를 정확하게 반영
- 리서치에서 발견한 흥미로운 일화나 숨은 이야기 적극 활용

### 2. **오디오 스크립트 품질**
- 리서치 데이터의 딱딱한 정보를 친근한 구어체로 변환
- 전문적 내용을 쉽고 재미있게 풀어서 설명
- 청취자가 지루하지 않도록 드라마틱한 구성

### 3. **향상된 콘텐츠**
- 리서치 데이터를 바탕으로 각 챕터를 더욱 상세하게
- 구체적인 수치, 날짜, 인물명을 정확히 포함
- 리서치에서 얻은 인사이트로 스토리텔링 강화

### 4. **최소 분량 (한국어 기준)**
- sceneDescription: 500자 이상 (리서치 기반 상세 묘사)
- coreNarrative: 700자 이상 (정확한 역사적 사실 포함)
- humanStories: 600자 이상 (리서치된 인물 이야기)
- nextDirection: 250자 이상 (구체적 경로 안내)

### 5. **필드 연결 필수 규칙**
- sceneDescription 끝: 질문이나 호기심 유발 ("~알고 계셨나요?")
- coreNarrative 시작: 그 질문의 답으로 시작 ("네, 바로...")
- coreNarrative 끝: 다음 이야기 예고 ("그런데 더 놀라운 건...")
- humanStories 시작: 자연스러운 받아치기 ("맞아요, 바로 그때...")

## 📐 최종 JSON 구조:
${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ 품질 체크리스트
- [ ] 리서치 데이터의 모든 중요 정보 반영
- [ ] 역사적 사실과 날짜의 정확성
- [ ] 자연스러운 스토리텔링 흐름
- [ ] 오디오로 들었을 때 지루하지 않은 구성
- [ ] 각 챕터 8-10분 분량의 풍성한 콘텐츠
- [ ] 4개 필드가 끊김 없이 연결되는 하나의 대본

**🔴 필수 준수사항 🔴**
각 챕터는 한 사람이 10분간 쉬지 않고 이야기하는 것입니다!
sceneDescription → coreNarrative → humanStories → nextDirection이
물 흐르듯 자연스럽게 이어져야 합니다.
절대로 각 필드를 독립적인 섹션으로 작성하지 마세요!

**리서치 데이터를 완벽히 활용하여 "${locationName}"의 최고의 오디오 가이드를 만들어주세요!**`;

  return prompt;
}

/**
 * 구조 생성용 프롬프트 (overview + route만)
 */
export function createStructurePrompt(
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): string {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ko;
  const userContext = userProfile ? `
👤 사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '성인'}
` : '👤 일반 관광객 대상';

  // 위치 유형 분석 및 권장 스팟 수 정보
  const locationType = analyzeLocationType(locationName);
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType] || LOCATION_TYPE_CONFIGS.general;
  const spotCount = getRecommendedSpotCount(locationName);

  return `# 🏗️ "${locationName}" 가이드 기본 구조 생성

## 🎯 미션
"${locationName}"에 대한 **기본 구조(overview + route)만** 생성하세요.
실시간 가이드 챕터는 제목만 포함하고, 상세 내용은 생성하지 마세요.

${userContext}

## 🎯 위치 분석 정보
- 감지된 위치 유형: ${locationType}
- 권장 스팟 수: ${typeConfig.recommendedSpots}
- 최적 스팟 범위: ${spotCount.min}-${spotCount.max}개
- 추천 기본값: ${spotCount.default}개

## 📋 출력 형식
순수 JSON만 반환. 코드 블록이나 설명 없이 오직 JSON만.

**스팟 수 결정 가이드라인:**
- **소규모 단일 건물/상점**: 3-4개 스팟
- **중간 규모 관광지**: 5-6개 스팟  
- **대형 복합시설/궁궐**: 7-8개 스팟
- **자연공원/산책로**: 주요 뷰포인트별로 4-6개
- **맛집 투어 지역**: 음식 종류에 따라 5-8개

### 구조 예시 (스팟 수는 위치에 맞게 조정):
{
  "content": {
    "overview": {
      "title": "${locationName} 개관",
      "summary": "간단한 요약 (200자 이내)",
      "narrativeTheme": "핵심 테마 한 줄",
      "keyFacts": [
        { "title": "주요 정보1", "description": "설명" },
        { "title": "주요 정보2", "description": "설명" }
      ],
      "visitInfo": {
        "duration": "적절한 소요시간",
        "difficulty": "난이도",
        "season": "최적 계절"
      }
    },
    "route": {
      "steps": [
        { "step": 1, "location": "입구", "title": "1지점 제목" },
        { "step": 2, "location": "주요지점1", "title": "2지점 제목" },
        { "step": 3, "location": "주요지점2", "title": "3지점 제목" }
        // ... 위치 특성에 맞는 적절한 수의 스팟
      ]
    },
    "realTimeGuide": {
      "chapters": [
        { "id": 0, "title": "1지점 제목" },
        { "id": 1, "title": "2지점 제목" },
        { "id": 2, "title": "3지점 제목" }
        // ... route.steps와 정확히 동일한 수
      ]
    }
  }
}

**중요**: 
- route.steps와 realTimeGuide.chapters의 title이 정확히 동일해야 함
- **위치의 규모와 특성을 고려하여 적절한 수의 스팟 구성** (3-8개 범위 내)
- 입구 → 주요 지점들 → 마무리/출구 순서로 자연스러운 동선
- 챕터에는 제목만 포함, 상세 내용 없음
- 순수 JSON만 반환, 설명이나 코드블록 없음`;
}

/**
 * 챕터 상세 생성용 프롬프트
 */
export function createChapterPrompt(
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'ko',
  userProfile?: UserProfile
): string {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ko;

  return `🎙️ "${locationName}" 챕터 ${chapterIndex + 1}: "${chapterTitle}" 오디오 가이드 생성

🎯 미션
당신은 전문 관광 가이드로서 "${chapterTitle}" 지점에서 관광객들에게 들려줄 상세한 오디오 가이드 스크립트를 작성해야 합니다.

📚 기존 가이드 컨텍스트
${JSON.stringify(existingGuide, null, 2)}

📝 작성 요구사항
1. 분량: narrative 필드에 1500-1700자의 풍부한 내용 (최적 분량으로 응답 완료 보장)
2. 구조: 현장 묘사 → 역사적 배경 → 인물 이야기 → 다음 장소 안내
3. 톤: 친근한 구어체 ("여기서 주목할 점은", "흥미로운 사실은", "이야기를 들어보면" 등)
4. 교육성: 단순 정보 나열이 아닌 스토리텔링 기반 설명
5. 자연스러운 흐름: 이전 챕터에서 자연스럽게 이어지는 연속적인 이야기

🚫 **절대 금지사항 (챕터 1번부터 적용)**
- "안녕하세요", "여러분!", "네, 여러분!", "자! 이제" 등의 인사말 절대 사용 금지
- "환영합니다", "반갑습니다" 등의 환영 인사 금지
- 매 챕터마다 새로운 투어를 시작하는 듯한 표현 금지

✅ **권장 시작 표현 (챕터 1번부터)**
- "이곳에서..." "여기서 주목할 점은..." "흥미롭게도..."
- "바로 앞에 보이는..." "지금 우리가 서 있는..."
- "이제 우리는..." "계속해서..." "다음으로 만나볼..."

🎭 스타일 가이드
- 마치 옆에서 친구가 설명해주는 듯한 친근함
- 역사적 사실과 흥미로운 일화를 조화롭게 섞기
- 관람객의 호기심을 자극하는 질문과 감탄사 사용
- 현장의 분위기와 감정을 생생하게 전달
- **각 챕터가 하나의 연속된 투어처럼 자연스럽게 연결되도록 작성**

✅ 필수 출력 형식
중요: 아래 JSON 형식을 정확히 따라 응답하세요. 코드블록이나 설명 없이 순수 JSON만 출력:

**📋 제목 형식 준수: "실제 공간명 : 간략한 설명"**
- ✅ "선사·고대관 : 한반도 최초 문명의 흔적" 
- ✅ "중앙홀 : 웅장한 공간과 상징적 조형물"
- ❌ "고대부터 현대까지의 여행"

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "이곳에서 가장 먼저 눈에 들어오는 것은 바로 이 웅장한 규모입니다. 높이 20미터가 넘는 이 거대한 석조 건축물을 보고 계시는데요, 이는 단순한 문이 아니라 조선 왕조 500년 역사의 상징이자 우리나라 궁궐 건축의 백미라고 할 수 있습니다. 특히 주목할 점은 저 화려한 단청인데요, 빨강, 파랑, 초록의 조화가 이렇게 아름다울 수가 없죠. 하지만 이 단청은 단순한 장식이 아닙니다. 목재를 보호하고 건물의 위계를 나타내는 실용적이면서도 상징적인 의미를 담고 있어요. 그런데 여기서 정말 흥미로운 이야기가 하나 있는데요...(1500-1700자의 상세하고 연속적인 스토리로 계속 작성)",
    "nextDirection": "다음 관람 지점으로의 구체적인 이동 경로와 거리, 소요시간을 포함한 상세 안내 (200-300자)"
  }
}

🚨 절대 준수사항 🚨
- 반드시 위 JSON 구조 그대로 출력
- narrative 필드는 1500-1700자 (최적 분량으로 응답 완료 보장)
- 서론이나 설명 없이 바로 JSON 시작
- 코드블록 표시 절대 금지
- 문법적으로 완벽한 JSON 형식

지금 바로 "${chapterTitle}" 챕터의 매력적인 오디오 가이드를 생성해주세요!`
}

// 기타 유틸리티 함수들
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
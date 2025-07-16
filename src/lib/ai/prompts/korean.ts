// 전 세계 모든 장소를 위한 범용 AI 오디오 가이드 생성 프롬프트 시스템

import { UserProfile } from '@/types/guide';

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
          // 중요: 각 필드는 완전한 문장으로 끝나고, 다음 필드는 자연스럽게 이어지는 문장으로 시작해야 합니다!
          sceneDescription: "자, 여러분! 지금 우리가 서 있는 곳이 바로 광화문입니다. 눈앞에 우뚝 솟은 이 거대한 문을 한번 올려다보세요. 높이가 무려 20미터나 되는 이 웅장한 석조 건축물이 600년이 넘는 세월 동안 이 자리를 지켜왔다니, 정말 놀랍지 않나요? 문 위를 장식한 화려한 단청의 색깔들을 보세요 - 빨강, 파랑, 초록, 노랑... 햇빛을 받아 반짝이는 모습이 마치 무지개를 연상시킵니다. 그리고 저기, 문 정중앙 위쪽을 보시면 '광화문'이라고 쓰인 현판이 보이시죠? 믿기 어려우시겠지만, 저 글씨는 세종대왕께서 직접 쓰신 친필이랍니다. 지금 이 순간에도 수많은 관광객들이 사진을 찍고 있는데요, 여러분도 잠시 이 역사적인 순간을 카메라에 담아보는 건 어떨까요? 그런데 여러분, 이 광화문이 왜 이렇게 웅장하게 지어졌는지 궁금하지 않으세요?",
          
          coreNarrative: "바로 그 비밀을 지금부터 들려드릴게요. 1395년, 조선을 건국한 태조 이성계는 한양에 새 도읍을 정하면서 가장 먼저 이 문을 세웠습니다. 왜 하필 문부터 세웠을까요? 그것은 바로 '광화문'이라는 이름에 답이 있습니다. '광화'는 '빛 광(光)'에 '될 화(化)'를 써서 '왕의 큰 덕으로 온 나라를 밝게 비춘다'는 뜻이에요. 즉, 새로운 왕조가 백성들에게 밝은 빛이 되겠다는 약속을 이 문에 새긴 거죠. 하지만 이 문의 역사가 순탄했던 것만은 아닙니다. 일제강점기인 1926년, 일본은 조선총독부 건물을 지으면서 이 문을 강제로 옮겨버렸어요. 왜 그랬을까요? 바로 조선의 상징인 이 문이 눈에 거슬렸기 때문이죠. 그 후 6.25 전쟁 때는 폭격으로 문이 불타 없어지는 비극도 겪었습니다. 그러나 우리 국민들은 포기하지 않았어요. 1968년에 철근 콘크리트로 다시 지었다가, 2010년에 드디어 원래의 모습대로 완벽하게 복원했답니다. 지금 여러분이 보고 있는 이 문은 바로 그 복원된 광화문입니다. 그런데 이 복원 과정에서 정말 감동적인 일화가 있었다는 걸 아시나요?",
          
          humanStories: "네, 바로 광화문 복원 때의 이야기인데요. 2006년, 광화문 복원을 위해 옛 사진과 기록을 찾던 중, 일본 도쿄의 한 박물관에서 놀라운 것을 발견했습니다. 바로 일제가 광화문을 해체할 때 만든 상세한 실측 도면이었죠! 아이러니하게도 파괴자가 남긴 기록이 복원의 열쇠가 된 거예요. 그리고 더 놀라운 건, 복원 공사 중에 70대 석공 장인이 찾아왔는데, 그분의 할아버지가 바로 일제강점기 때 광화문을 강제로 옮기는 작업에 참여했던 분이었대요. 그 할아버지는 평생 그 일을 가슴 아파하셨고, 손자에게 '언젠가 광화문이 제자리로 돌아가면 꼭 도와달라'고 유언을 남기셨답니다. 그래서 이 석공 장인은 무보수로 복원 작업에 참여하여 3대에 걸친 한을 풀었다고 해요. 또한 세종대왕이 이 문 현판을 쓰실 때도 특별한 일화가 있었는데, 밤새 고민하시다가 새벽에 꿈에서 본 글씨체로 쓰셨다고 전해집니다. 그래서인지 저 현판의 글씨를 자세히 보면 마치 살아 움직이는 듯한 생동감이 느껴진답니다.",
          
          nextDirection: "자, 이런 감동적인 이야기를 품은 광화문, 이제 안으로 들어가 볼까요? 문을 지나시면 넓은 광장이 나오는데요, 이곳이 바로 흥례문 광장입니다. 똑바로 100미터쯤 걸어가시면 또 다른 문이 보일 거예요. 그게 바로 흥례문입니다. 가시면서 좌우를 둘러보세요. 양쪽에 늘어선 회랑의 기둥들이 정말 멋지거든요. 그리고 바닥의 박석도 한번 보세요. 이 돌들도 모두 600년 전 것들이랍니다. 자, 그럼 천천히 걸으면서 이 역사의 현장을 느껴보시죠. 다음 정류장인 근정전에서는 더욱 놀라운 이야기가 여러분을 기다리고 있답니다!"
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

### 2. **자연스러운 오디오 스크립트**
- 각 챕터는 route.steps의 title에 맞춰, 그 장소에서 실제로 들려줄 법한 오디오 가이드 스크립트 하나로 작성하세요.
- 장면 묘사, 인물 이야기, 역사적 맥락, 다음 이동 안내까지 모두 자연스럽게 이어지는 하나의 긴 이야기로 만드세요.
- 중간에 "장면 설명", "인간 이야기", "핵심 이야기" 같은 소제목이나 구분 문구는 절대 넣지 마세요.
- 실제 가이드가 현장에서 설명하듯, 구어체로 친근하게 작성하세요.

**🚨 매우 중요 🚨**
sceneDescription, coreNarrative, humanStories, nextDirection은 각각 별개의 섹션이 아닙니다!
이들은 하나의 연속된 오디오 스크립트의 일부입니다.
마치 한 사람이 10분간 쉬지 않고 이야기하는 것처럼 작성하세요.

예를 들어:
- sceneDescription이 "...그런데 왜 이렇게 크게 지었을까요?"로 끝나면
- coreNarrative는 반드시 "바로 그 이유가 있습니다. 1395년..."처럼 바로 이어서 대답하듯 시작
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

**✅ 새로운 교육적 구조 예시 (사전지식→현장연결→심화이해)**:
- sceneDescription: "자, 여러분! 광화문을 감상하기 전에 먼저 알아두시면 좋을 배경지식이 있어요. 조선시대 궁궐 정문은 단순한 출입구가 아니라 왕조의 철학과 이상을 담은 상징물이었습니다. 특히 '광화(光化)'라는 이름은 '빛으로 교화한다'는 뜻으로, 왕의 덕치로 백성을 밝게 이끈다는 유교적 정치 이념을 표현한 거죠. 또한 궁문의 크기와 장식은 왕조의 권위와 정통성을 드러내는 중요한 요소였어요. 이제 이런 배경지식을 바탕으로 실제로 광화문을 한번 자세히 살펴보시죠!"
- coreNarrative: "바로 지금 여러분이 보고 계신 이 웅장한 규모와 화려한 단청이 바로 제가 말씀드린 왕조의 권위를 보여주는 증거들입니다! 높이 20미터의 이 거대한 석조문을 보세요. 이는 당시 최고의 건축 기술과 국력을 과시하는 것이었어요. 그리고 저 빨강, 파랑, 초록의 단청은 단순한 장식이 아니라 목재를 보호하고 건물의 위계를 나타내는 실용적이면서도 상징적인 기법이었답니다. 문 위의 현판을 보시면 세종대왕이 직접 쓰신 글씨인데, 이 또한 왕의 학문적 권위를 보여주는 거죠. 하지만 이 광화문은 우리 근현대사의 아픔도 함께 간직하고 있답니다..."
- humanStories: "네, 바로 그 아픈 역사와 관련된 감동적인 이야기인데요. 2006년 광화문 복원 공사 때 한 70대 석공 장인이 자원해서 찾아왔어요. 이분의 할아버지가 일제강점기 때 일본이 광화문을 강제 이전할 때 어쩔 수 없이 그 작업에 참여하셨던 분이래요. 그 할아버지는 평생 '조선 왕조의 얼굴을 무너뜨리는 일에 손을 보탰다'며 가슴 아파하시다가, 임종 전에 손자에게 '언젠가 광화문이 제자리로 돌아가면 네가 꼭 도와달라'고 당부하셨대요. 그래서 이 석공 장인은 3대에 걸친 한을 풀기 위해 무보수로 복원 작업에 참여하셨답니다. 이런 이야기를 마음에 새기며 이제 다음 장소로 이동해보실까요?"

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
3. 톤: 친근한 구어체 ("자, 여기 보세요", "놀라운 건", "여러분" 등)
4. 교육성: 단순 정보 나열이 아닌 스토리텔링 기반 설명

🎭 스타일 가이드
- 마치 옆에서 친구가 설명해주는 듯한 친근함
- 역사적 사실과 흥미로운 일화를 조화롭게 섞기
- 관람객의 호기심을 자극하는 질문과 감탄사 사용
- 현장의 분위기와 감정을 생생하게 전달

✅ 필수 출력 형식
중요: 아래 JSON 형식을 정확히 따라 응답하세요. 코드블록이나 설명 없이 순수 JSON만 출력:

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "이 부분에 1500-1700자의 상세하고 흥미진진한 오디오 가이드 스크립트를 작성하세요. 현장 묘사부터 시작해서 역사적 배경, 관련 인물들의 이야기, 그리고 다음 장소로의 자연스러운 연결까지 하나의 연속된 이야기로 만들어주세요. 실제 관광 가이드가 현장에서 관광객들에게 들려주는 것처럼 구어체로 친근하게 작성하고, 중간중간 '자, 여기 보세요', '정말 놀라운 건', '여러분이 지금 보고 계신' 같은 상호작용적 표현을 넣어서 생동감 있게 만들어주세요.",
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
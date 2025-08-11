// AI 가이드 생성을 위한 완성된 프롬프트 시스템

import { UserProfile } from '@/types/guide';

// 상세한 예시 JSON 구조
const MINIMAL_EXAMPLE_JSON = {
  content: {
    overview: {
      title: "경복궁",
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
        { step: 1, location: "광화문", title: "경복궁 광화문" },
        { step: 2, location: "근정전", title: "경복궁 근정전" },
        { step: 3, location: "경회루", title: "경복궁 경회루" },
        { step: 4, location: "향원정", title: "경복궁 향원정" },
        { step: 5, location: "국립고궁박물관", title: "경복궁 국립고궁박물관" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "경복궁 입구",
          sceneDescription: "높이 솟은 광화문 앞에 서면 육중한 돌기둥과 화려한 단청이 600년 전 그 위엄을 그대로 전해줍니다. 문 위의 현판에 새겨진 '광화문' 세 글자는 세종대왕의 친필로, 오늘도 수많은 시민들을 맞이하고 있습니다.",
          coreNarrative: "1395년 태조 이성계가 한양에 새 도읍을 정하며 가장 먼저 세운 것이 바로 이 광화문이었습니다. '광화(光化)'란 '왕의 덕으로 천하를 밝게 교화한다'는 뜻으로, 새로운 왕조의 이상을 담았죠. 일제강점기 때 철거되었다가 2010년 원래 자리를 찾아 복원된 이 문은, 그 자체로 우리나라 근현대사의 아픈 상처와 회복을 상징합니다.",
          humanStories: "세종대왕은 이 문을 지날 때마다 '백성을 위한 정치'를 다짐했다고 전해집니다. 특히 한글 창제 후 첫 반포식도 이곳에서 열렸죠. 또한 일제강점기 당시 이 문을 지키려던 궁내부 관리들의 눈물겨운 노력과, 광복 후 시민들이 '우리의 문'을 되찾기 위해 벌인 복원 운동의 이야기는 지금도 많은 이들에게 감동을 줍니다.",
          nextDirection: "광화문을 지나 흥례문으로 향하세요. 돌다리를 건너며 좌우의 아름다운 석조물들을 감상해보세요. 약 100m 직진하면 근정문이 보입니다."
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

// UserProfile은 types/guide.ts에서 import됨

// LanguageConfig는 LanguageContext에서 import하여 사용
import { LanguageConfig, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext';

interface LanguageHeader {
  role: string;
  goal: string;
  outputInstructions: string;
  qualityStandards: string;
}

interface LocationTypeConfig {
  keywords: string[];
  expertRole: string;
  focusAreas: string[];
  specialRequirements: string;
  chapterStructure: string;
}

// 언어 설정 - LanguageContext에서 import한 SUPPORTED_LANGUAGES 사용
const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = 
  SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    acc[lang.code] = lang;
    return acc;
  }, {} as Record<string, LanguageConfig>);

// 언어별 실시간 가이드 키 매핑
export const REALTIME_GUIDE_KEYS: Record<string, string> = {
  ko: '실시간가이드',
  en: 'RealTimeGuide',
  ja: 'リアルタイムガイド',
  zh: '实时导览',
  es: 'GuíaEnTiempoReal'
};

// 위치 유형별 전문 가이드 스타일 정의
const LOCATION_TYPE_CONFIGS: Record<string, LocationTypeConfig> = {
  architecture: {
    keywords: ['궁궐', '성당', '사원', '교회', '성곽', '탑', '건축', '전각', '건물', 'cathedral', 'palace', 'temple', 'tower', 'architecture'],
    expertRole: '건축사이자 문화재 전문가',
    focusAreas: ['건축 양식과 기법', '구조적 특징', '건축재료와 공법', '시대별 건축 변천사', '장인정신과 기술'],
    specialRequirements: '건축학적 디테일, 구조 분석, 건축 기법의 혁신성, 시대적 의미를 중점적으로 다뤄야 합니다.',
    chapterStructure: '건축물의 외관 → 구조적 특징 → 세부 장식 → 건축 기법 → 역사적 의의 순서'
  },
  historical: {
    keywords: ['박물관', '유적지', '기념관', '사적', '역사', '유물', '전쟁', '독립', 'museum', 'historical', 'memorial', 'heritage'],
    expertRole: '역사학자이자 문화유산 해설사',
    focusAreas: ['역사적 사건과 맥락', '시대적 배경', '인물들의 이야기', '사회문화적 의미', '현재적 교훈'],
    specialRequirements: '역사적 사실의 정확성, 시대적 맥락, 인물 중심 스토리텔링, 현재와의 연결점을 강조해야 합니다.',
    chapterStructure: '역사적 배경 → 주요 사건 → 핵심 인물들 → 문화적 영향 → 현재적 의미 순서'
  },
  nature: {
    keywords: ['공원', '산', '강', '바다', '숲', '정원', '자연', '생태', '경관', 'park', 'mountain', 'nature', 'garden', 'scenic'],
    expertRole: '생태학자이자 자연환경 해설사',
    focusAreas: ['생태계와 생물다양성', '지형과 지질학적 특징', '계절별 변화', '환경보전의 중요성', '자연과 인간의 관계'],
    specialRequirements: '생태학적 정보, 자연현상 설명, 환경보전 메시지, 계절별 특징을 중점적으로 다뤄야 합니다.',
    chapterStructure: '자연환경 개관 → 생태계 특징 → 주요 동식물 → 지질학적 특성 → 보전의 의미 순서'
  },
  culinary: {
    keywords: ['맛집', '음식', '시장', '골목', '전통음식', '요리', '카페', '레스토랑', 'food', 'market', 'restaurant', 'culinary', 'cuisine'],
    expertRole: '음식문화 연구가이자 미식 전문가',
    focusAreas: ['지역 특색 음식', '요리 역사와 전통', '식재료와 조리법', '음식문화와 사회', '미식 체험 포인트'],
    specialRequirements: '음식의 역사와 문화적 의미, 맛의 특징, 조리법의 비밀, 지역성을 중점적으로 다뤄야 합니다.',
    chapterStructure: '음식문화 소개 → 대표 음식들 → 조리 전통 → 맛집 탐방 → 미식 체험 순서'
  },
  traditional: {
    keywords: ['한옥', '전통', '민속', '옛거리', '고택', '전통마을', '문화마을', '한옥마을', '북촌', '서촌', 'hanok', 'traditional', 'folk', 'heritage village'],
    expertRole: '민속학자이자 전통문화 전문가',
    focusAreas: ['전통 생활양식', '민속 문화', '전통 기술과 공예', '공동체 문화', '전통의 현대적 계승'],
    specialRequirements: '전통 생활문화, 민속학적 의미, 전통 기술의 가치, 공동체 정신을 중점적으로 다뤄야 합니다.',
    chapterStructure: '전통마을 개관 → 생활공간 구성 → 전통 기술 → 공동체 문화 → 현대적 의미 순서'
  },
  shopping: {
    keywords: ['쇼핑', '시장', '상점가', '백화점', '면세점', '아울렛', '명동', '동대문', '홍대', 'shopping', 'market', 'district', 'street'],
    expertRole: '문화인류학자이자 소비문화 전문가',
    focusAreas: ['쇼핑 문화의 역사', '상권 발달과정', '소비 트렌드', '지역 특색 상품', '경제적 의미'],
    specialRequirements: '쇼핑 문화의 사회적 의미, 지역 상권의 역사, 특색 있는 상품의 이야기를 중점적으로 다뤄야 합니다.',
    chapterStructure: '상권 역사 → 대표 상점들 → 특색 상품 → 쇼핑 문화 → 경제적 영향 순서'
  },
  entertainment: {
    keywords: ['놀이공원', '테마파크', '유원지', '오락', '축제', '공연장', '극장', '클럽', 'amusement', 'theme park', 'entertainment', 'festival'],
    expertRole: '문화기획자이자 엔터테인먼트 전문가',
    focusAreas: ['엔터테인먼트 산업', '공연 예술', '축제 문화', '여가 문화', '창의적 체험'],
    specialRequirements: '엔터테인먼트의 문화적 가치, 공연과 축제의 의미, 창의적 체험의 교육적 효과를 중점적으로 다뤄야 합니다.',
    chapterStructure: '엔터테인먼트 소개 → 주요 시설 → 체험 프로그램 → 문화적 의미 → 미래 전망 순서'
  },
  modern: {
    keywords: ['현대', '타워', '빌딩', '스카이라인', '도시', '건축', '랜드마크', '전망대', 'modern', 'tower', 'skyscraper', 'landmark', 'observatory'],
    expertRole: '도시계획 전문가이자 현대건축 비평가',
    focusAreas: ['현대 도시 발전', '건축 기술 혁신', '도시 설계 철학', '미래 지향성', '지속가능성'],
    specialRequirements: '현대 건축의 기술적 혁신, 도시 발전의 의미, 미래 지향적 가치를 중점적으로 다뤄야 합니다.',
    chapterStructure: '현대 건축 개관 → 기술적 특징 → 설계 철학 → 도시적 맥락 → 미래 비전 순서'
  }
};

// 유틸리티 함수들
export function getTTSLanguage(language: string): string {
  const langCode = language?.slice(0, 2);
  return LANGUAGE_CONFIGS[langCode]?.ttsLang || 'en-US';
}

function analyzeLocationType(locationName: string): string {
  const lowerName = locationName.toLowerCase();
  
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (config.keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  
  return 'general';
}

// 위치 유형별 맞춤형 예시 생성 함수
function generateTypeSpecificExample(locationType: string, locationName: string) {
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];
  
  if (!typeConfig) {
    return MINIMAL_EXAMPLE_JSON;
  }

  // 위치 유형별 맞춤 예시 생성
  const typeSpecificExamples = {
    architecture: {
      sceneDescription: "웅장한 석조 기둥들이 하늘 높이 솟아오르며, 정교한 조각 장식들이 햇빛을 받아 생생한 그림자를 만들어냅니다. 돔 위에서 반짝이는 청동 장식과 벽면의 섬세한 부조 조각들이 수백 년 전 장인들의 혼이 담긴 기술력을 고스란히 보여줍니다.",
      coreNarrative: "이 건축물은 14세기 고딕 양식의 정수를 보여주는 걸작으로, 당시 혁신적이었던 플라잉 버트레스 공법과 리브 볼트 기술을 활용하여 기존 건축의 한계를 뛰어넘었습니다. 특히 첨탑의 구조는 당대 최고의 석공 마이스터들이 수십 년에 걸쳐 완성한 기술적 성취의 결정체입니다.",
      humanStories: "수석 건축가 장 드 셸은 이 건물 설계를 위해 20년간 유럽 전역을 여행하며 기술을 연구했습니다. 그는 완공을 보지 못하고 세상을 떠났지만, 그의 아들이 아버지의 설계도를 바탕으로 마지막 첨탑을 완성했다는 감동적인 이야기가 전해집니다."
    },
    culinary: {
      sceneDescription: "골목길 곳곳에서 피어오르는 구수한 육수 냄새와 지글지글 끓는 기름 소리가 어우러져 오감을 자극합니다. 좁은 가게 안에서 숙련된 요리사의 손놀림이 마치 춤추듯 리드미컬하게 움직이며, 뜨거운 철판 위에서 완성되는 요리의 색깔과 향이 식욕을 돋웁니다.",
      coreNarrative: "이 골목의 음식 문화는 조선시대 궁중 요리사들이 민간으로 내려와 서민들을 위한 음식을 개발하면서 시작되었습니다. 특히 이곳의 대표 음식인 '황제 떡볶이'는 고종황제가 즐겨 먹던 궁중 떡요리를 서민들도 쉽게 즐길 수 있도록 재창조한 것으로, 100년이 넘는 역사를 자랑합니다.",
      humanStories: "3대째 이어져 내려오는 '할머니 손만두' 집의 김 할머니는 6.25 전쟁 중에도 피난민들을 위해 만두를 나눠주며 이 골목을 지켜왔습니다. 그녀의 비법 양념장 레시피는 지금도 며느리에게만 전수되는 가문의 보물입니다."
    },
    nature: {
      sceneDescription: "짙은 녹음 사이로 스며드는 햇살이 나뭇잎을 황금빛으로 물들이고, 멀리서 들려오는 새소리와 바람에 흔들리는 나뭇가지 소리가 자연의 교향곡을 연주합니다. 발밑의 촉촉한 흙냄새와 피톤치드 가득한 맑은 공기가 도시의 피로를 씻어줍니다.",
      coreNarrative: "이 숲은 500년 전부터 자연 그대로 보존되어 온 원시림으로, 총 847종의 식물과 312종의 동물이 서식하는 생태계의 보고입니다. 특히 이곳에서만 자생하는 희귀식물 7종은 학술적 가치가 매우 높으며, 기후변화 연구의 중요한 기준점 역할을 하고 있습니다.",
      humanStories: "산림청의 이영식 박사는 30년간 이 숲을 연구하며 멸종 위기에 있던 산양을 복원하는 데 성공했습니다. 그는 매일 새벽 5시부터 숲을 돌며 동물들의 생태를 관찰하고 기록했으며, 그의 연구 덕분에 이 숲은 유네스코 생태보전지역으로 지정되었습니다."
    },
    traditional: {
      sceneDescription: "기와지붕이 곡선을 그리며 연결된 한옥 처마 아래로 따뜻한 햇살이 스며들고, 마당에 심어진 감나무에서 떨어지는 낙엽이 바스락거리며 옛 정취를 자아냅니다. 대청마루에서 들려오는 할머니의 옛 이야기와 함께 전통 장독대에서 익어가는 된장 냄새가 오감에 스며듭니다.",
      coreNarrative: "이 한옥마을은 조선시대 양반가옥의 전형적인 배치를 보여주는 곳으로, '人'자형 지붕 구조와 온돌 시스템, 마루와 처마의 절묘한 비례는 우리 조상들의 자연친화적 건축 철학을 그대로 담고 있습니다. 특히 이곳의 'ㅁ'자형 배치는 유교적 질서와 가족 중심의 공동체 문화를 건축으로 구현한 걸작입니다.",
      humanStories: "이 마을에 70년간 살아온 박순자 할머니는 일제강점기부터 현재까지의 마을 변천사를 생생히 기억하고 있습니다. 그녀는 6.25 전쟁 때 피난민들을 숨겨주었던 사랑채의 비밀 공간과, 마을 아이들을 위해 야학을 열었던 사당의 이야기를 들려줍니다."
    },
    shopping: {
      sceneDescription: "형형색색의 네온사인이 밤거리를 환하게 밝히고, 좁은 골목 사이사이에서 들려오는 흥정 소리와 발걸음 소리가 활기찬 에너지를 만들어냅니다. 갓 구운 호떡 냄새와 튀김 기름 향이 어우러지며, 상인들의 구수한 사투리가 정겨운 분위기를 연출합니다.",
      coreNarrative: "이 상권은 1960년대 산업화 시대와 함께 형성된 서민들의 생활터전으로, 한국 경제 발전의 축소판을 보여줍니다. 특히 이곳에서 시작된 '야시장 문화'는 아시아 전역으로 퍼져나갔으며, 24시간 불야성을 이루는 독특한 쇼핑 문화의 원조가 되었습니다.",
      humanStories: "40년째 이곳에서 옷가게를 운영하는 김철수 사장은 동대문 패션의 산 증인입니다. 그는 새벽 2시에 시작되는 도매시장에서 전국 상인들과 거래하며, 한국 패션 트렌드를 이끌어온 숨은 주역이기도 합니다."
    },
    modern: {
      sceneDescription: "유리와 강철로 이루어진 마천루가 구름을 뚫고 솟아오르며, 건물 외벽의 LED 스크린이 도시의 심장박동처럼 깜빡입니다. 지하에서부터 지상까지 이어지는 첨단 엘리베이터 시스템과 스마트 빌딩 기술이 미래 도시의 모습을 선보입니다.",
      coreNarrative: "이 초고층 건물은 21세기 첨단 건축 기술의 집약체로, 지진 방지 시스템과 친환경 에너지 시설, AI 기반 건물 관리 시스템을 갖춘 스마트 빌딩입니다. 특히 외벽의 이중 커튼월 시스템은 에너지 효율을 40% 향상시키며, 지속가능한 도시 발전의 모델이 되고 있습니다.",
      humanStories: "이 건물의 설계를 담당한 김현대 건축가는 20년간 '인간 중심의 고층 건축'을 연구해왔습니다. 그는 기술과 인간성의 조화를 추구하며, 이 건물에 옥상 정원과 커뮤니티 공간을 배치하여 수직 도시 속에서도 인간적 소통이 가능한 공간을 만들어냈습니다."
    }
  };

  const specificExample = typeSpecificExamples[locationType] || typeSpecificExamples.architecture;
  
  // 기본 예시에 위치 유형별 내용 적용
  return {
    ...MINIMAL_EXAMPLE_JSON,
    content: {
      ...MINIMAL_EXAMPLE_JSON.content,
      realTimeGuide: {
        chapters: [
          {
            id: 0,
            title: `${locationName} - 전문가가 안내하는 특별한 여정`,
            sceneDescription: specificExample.sceneDescription,
            coreNarrative: specificExample.coreNarrative,
            humanStories: specificExample.humanStories,
            nextDirection: "다음 관람 포인트로 이동하며 더욱 깊이 있는 이야기를 들어보세요."
          }
        ]
      }
    }
  };
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

  // 위치 유형별 전문 컨텍스트 추가
  const specialistContext = typeConfig ? `
🎯 전문 분야 가이드 설정:
- 감지된 위치 유형: ${locationType}
- 전문가 역할: ${typeConfig.expertRole}
- 중점 분야: ${typeConfig.focusAreas.join(', ')}
- 특별 요구사항: ${typeConfig.specialRequirements}
- 권장 챕터 구성: ${typeConfig.chapterStructure}
` : '';

  const languageHeaders: Record<string, LanguageHeader> = {
    ko: {
      role: typeConfig 
        ? `당신은 **세상에서 가장 열정적이고 수다스러운 ${typeConfig.expertRole}이자 최고의 투어 가이드**입니다. 당신의 임무는 방문객이 마치 당신과 함께 걸으며 모든 비밀 이야기를 듣는 것처럼 느끼게 만드는 것입니다.`
        : '당신은 **세상에서 가장 열정적이고 수다스러운 역사학자이자 최고의 투어 가이드**입니다. 당신의 임무는 방문객이 마치 당신과 함께 걸으며 모든 비밀 이야기를 듣는 것처럼 느끼게 만드는 것입니다.',
      goal: `방문객이 '${locationName}'에 대해 모르는 것이 없도록, 모든 세부 정보와 비하인드 스토리를 총망라한, **매우 상세하고 긴 한국어 오디오 가이드** JSON 객체를 생성하는 것입니다.`,
      outputInstructions: `절대적으로, 반드시 아래 규칙을 따라 순수한 JSON 객체 하나만 반환해야 합니다.
- 서론, 본론, 결론, 주석, 코드블록(\`\`\`) 등 JSON 이외의 어떤 텍스트도 포함해서는 안 됩니다.
- 모든 문자열은 따옴표로 감싸고, 객체와 배열의 마지막 요소 뒤에는 쉼표를 붙이지 않는 등 JSON 문법을 100% 완벽하게 준수해야 합니다.
- JSON 구조와 키 이름은 아래 예시와 완전히 동일해야 합니다. 키 이름을 절대 번역하거나 바꾸지 마세요.
- **JSON 문법 오류는 치명적인 실패로 간주됩니다.**
- 최종 결과물 구조 예시:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\``,
      qualityStandards: `**품질 기준 (가장 중요!):**
- **🚨 절대 사용 금지 표현들 🚨**
  * "여러분", "상상해보세요", "놀라운 이야기", "경이로운", "숨을 고르고"
  * "잠시", "곧 만나게 될", "펼쳐지는", "직접 경험하게", "놀라운 세계"
  * "이곳", "여기" 같은 모호한 지시어 (반드시 구체적 장소명 사용)
  * 장소명 없는 일반적 호칭이나 감탄사
- **위치 유형별 맞춤형 정보 밀도 100% 원칙**:

**🏛️ 건축/역사 장소**: 연도+건축기법+재료+크기+인물명 필수
  * 예: "경복궁 근정전은 1395년 태조 이성계가 건립한 높이 24.75m의 2층 목조건물로, 다포계 공포양식과 주심포 구조를 사용했습니다"

**🍜 음식/맛집 장소**: 음식명+재료+조리법+역사+맛특징 필수  
  * 예: "명동교자의 왕만두는 1명이 하루 300개 한정으로 직접 빚는 두께 2mm 밀가루 피에 돼지고기와 부추를 8:2 비율로 넣어 1968년부터 전통 육수로 끓여낸 시그니처 메뉴입니다"

**🌿 자연/생태 장소**: 지질학적 형성과정+생태계+계절변화+환경데이터 필수
  * 예: "설악산 울산바위는 1억년 전 중생대 백악기에 형성된 화강암 덩어리로, 높이 873m에서 서식하는 고산식물 47종과 천연기념물 산양 15마리가 서식하며, 연평균 기온이 평지보다 6도 낮은 아고산대 기후를 보입니다"

**🏢 현대/도시 장소**: 건축기술+디자인컨셉+기능+수치+사회적의미 필수
  * 예: "롯데월드타워는 높이 554.5m의 123층 건물로, 바람 저항을 줄이는 테이퍼드 디자인과 지진 대응 TSD 시스템을 적용하여 2017년 완공된 동북아시아 최고층 복합건물입니다"

**🛍️ 쇼핑/상업 장소**: 상권역사+대표상품+가격대+특색점포+경제규모 필수
  * 예: "동대문 패션타운은 1970년대 평화시장에서 시작된 24시간 도매상권으로, 하루 평균 40만명이 방문하여 연 매출 15조원을 기록하며, 새벽 2시부터 열리는 도매시장에서 전국 소매점의 60%가 물건을 공급받습니다"

**📍 챕터 구성 필수 요구사항:**
- **🚨 반드시 정확히 5-7개 챕터 생성 🚨**: 주요 관람 포인트마다 별도 챕터 구성 (4개 이하나 8개 이상은 절대 금지)
- **관람 동선 순서대로 배치**: 입구부터 출구까지 효율적인 한붓그리기 경로
- **챕터 수 검증**: realTimeGuide.chapters 배열의 길이가 정확히 5-7 사이여야 함
- **🚨 CRITICAL: route.steps와 realTimeGuide.chapters 동기화 필수 🚨**
  * route.steps 배열과 realTimeGuide.chapters 배열의 개수가 **반드시 정확히 일치**해야 함
  * 각 step의 title과 해당 chapter의 title이 **완전히 동일**해야 함
  * step 순서와 chapter 순서가 **정확히 일치**해야 함
  * 이 규칙을 위반하면 시스템 오류가 발생합니다!
- **위치 유형별 필드 작성 기준 (챕터당 1500자 목표)**:

**🏛️ 건축/역사 필드 요구사항**:
  * sceneDescription: 건축 양식+재료+크기+색깔+장식요소 세부 묘사
  * coreNarrative: 건축 연도+건축가+건축기법+역사적 배경+문화적 의미
  * humanStories: 건축가/왕/장인 실존인물+구체적 일화+당대 사회상
  * nextDirection: 정확한 거리+건축 구조 기준 방향+다음 건물의 특징

**🍜 음식/맛집 필드 요구사항**:
  * sceneDescription: 주방모습+조리과정+향기+소리+시각적 특징
  * coreNarrative: 음식 역사+조리법+재료+창업년도+대표메뉴+가격
  * humanStories: 요리사/창업자 실명+요리 개발과정+맛의 비밀+가족사
  * nextDirection: 정확한 거리+주변 음식점+특색 메뉴 안내

**🌿 자연/생태 필드 요구사항**:
  * sceneDescription: 계절별 풍경+날씨+생태계 소리+냄새+촉감
  * coreNarrative: 지질 형성과정+기후+생태계+보존 상태+과학적 가치
  * humanStories: 생태학자/보존활동가 실명+연구성과+보존 노력+발견 일화
  * nextDirection: 정확한 거리+지형 기준 방향+생태 관찰 포인트

**🏢 현대/도시 필드 요구사항**:
  * sceneDescription: 건축 디자인+첨단 기술+야경+인파+도시 경관
  * coreNarrative: 건축 기술+디자인 컨셉+사회적 기능+경제적 의미+미래 가치
  * humanStories: 건축가/기획자 실명+설계 철학+건설 과정+기술적 도전
  * nextDirection: 정확한 거리+지하철/교통 연계+다음 랜드마크
- **위치 유형별 필수 정보 체크리스트**:

**🏛️ 건축/역사 체크리스트**:
  ✅ 건축 연도와 건축가명 포함되었는가?
  ✅ 건축 기법과 사용된 재료가 구체적으로 명시되었는가?
  ✅ 건물의 정확한 크기(높이, 넓이 등) 포함되었는가?
  ✅ 역사적 인물의 실명과 구체적 일화가 있는가?
  ✅ 현재 방문객이 실제로 볼 수 있는 부분을 정확히 설명했는가?

**🍜 음식/맛집 체크리스트**:
  ✅ 대표 메뉴명과 정확한 가격이 포함되었는가?
  ✅ 주요 재료와 조리법이 구체적으로 설명되었는가?
  ✅ 창업년도와 창업자/요리사 실명이 있는가?
  ✅ 맛의 특징과 다른 곳과의 차별점이 명확한가?
  ✅ 영업시간과 주문 방법 등 실용적 정보가 있는가?

**🌿 자연/생태 체크리스트**:
  ✅ 지질학적 형성 시기와 과정이 포함되었는가?
  ✅ 서식하는 동식물의 구체적 종류와 수량이 있는가?
  ✅ 기후 데이터(온도, 강수량 등)가 포함되었는가?
  ✅ 계절별 변화와 관찰 포인트가 명시되었는가?
  ✅ 보존 활동과 관련 연구자의 실명이 있는가?

**🏢 현대/도시 체크리스트**:
  ✅ 건물 높이와 층수 등 정확한 규모가 포함되었는가?
  ✅ 건축 기술과 디자인 컨셉이 구체적으로 설명되었는가?
  ✅ 완공년도와 건축가/설계사 정보가 있는가?
  ✅ 사회적 기능과 경제적 의미가 명확한가?
  ✅ 교통 접근성과 주변 시설 정보가 포함되었는가?

**🛍️ 쇼핑/상업 체크리스트**:
  ✅ 상권 형성 시기와 발전 과정이 포함되었는가?
  ✅ 대표 상품과 가격대가 구체적으로 명시되었는가?
  ✅ 하루 방문객 수와 매출 규모 등 경제 데이터가 있는가?
  ✅ 특색 있는 점포와 브랜드가 구체적으로 소개되었는가?
  ✅ 영업시간과 쇼핑 팁 등 실용적 정보가 포함되었는가?`
    },
    en: {
      role: typeConfig 
        ? `You are the **world's most passionate, chatty ${typeConfig.expertRole} and a top-tier tour guide**. Your mission is to make visitors feel like they are walking with you, hearing every secret story.`
        : 'You are the **world\'s most passionate, chatty historian and a top-tier tour guide**. Your mission is to make visitors feel like they are walking with you, hearing every secret story.',
      goal: `Generate an extremely detailed and lengthy English audio guide as a single JSON object for '${locationName}', covering every possible detail and behind-the-scenes story so visitors know everything about this location.`,
      outputInstructions: `Absolutely, you must strictly return only a single, pure JSON object by following these rules:
- Do not include any text outside the JSON object, such as introductions, conclusions, notes, or markdown code blocks (\`\`\`).
- All strings must be wrapped in quotes, no commas after the last element of objects and arrays, etc. Adhere 100% perfectly to JSON syntax.
- The JSON structure and key names must be identical to the example below. Do not translate or change key names.
- **JSON syntax errors are considered critical failures.**
- Example of the final output structure:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\``,
      qualityStandards: `**Quality Standards (Most Important!)**
- **🚨 ABSOLUTELY FORBIDDEN Expressions 🚨**
  * "You", "imagine", "wonderful stories", "amazing", "take a breath"
  * "Soon you will meet", "unfolding", "directly experience", "amazing world"
  * "This place", "here" without specific location names (must use concrete place names)
  * Generic addresses or exclamations without location context
- **Location Type-Specific 100% Information Density Principle**:

**🏛️ Architecture/Historical Sites**: Year+architectural technique+material+size+person name REQUIRED
  * Example: "Gyeongbokgung's Geunjeongjeon Hall was built in 1395 by King Taejo as a 24.75m-tall two-story wooden structure using multi-bracket system and jusimspo framework"

**🍜 Food/Culinary Sites**: Food name+ingredients+cooking method+history+taste characteristics REQUIRED
  * Example: "Myeongdong Kyoja's king dumplings are handmade daily by one chef limited to 300 pieces, using 2mm-thick wheat flour skin filled with pork and chives in 8:2 ratio, boiled in traditional broth since 1968"

**🌿 Nature/Ecological Sites**: Geological formation process+ecosystem+seasonal changes+environmental data REQUIRED
  * Example: "Seoraksan's Ulsanbawi Rock formed 100 million years ago during Cretaceous period as granite mass, hosts 47 alpine plant species and 15 endangered mountain goats at 873m elevation with average temperature 6°C lower than lowlands"

**🏢 Modern/Urban Sites**: Architectural technology+design concept+function+specifications+social significance REQUIRED
  * Example: "Lotte World Tower stands 554.5m tall with 123 floors, featuring wind-resistant tapered design and earthquake-responsive TSD system, completed in 2017 as Northeast Asia's tallest mixed-use building"

**🛍️ Shopping/Commercial Sites**: Commercial history+signature products+price range+unique stores+economic scale REQUIRED
  * Example: "Dongdaemun Fashion Town originated from Pyeonghwa Market in 1970s as 24-hour wholesale district, serves 400,000 daily visitors generating 15 trillion won annually, supplies 60% of nationwide retail stores from 2 AM wholesale markets"

**📍 Chapter Composition MANDATORY Requirements:**
- **🚨 Generate EXACTLY 5-7 chapters MANDATORY 🚨**: Create separate chapters for each major viewing point (4 or fewer, 8 or more is absolutely forbidden)
- **Follow visitor route order**: Efficient one-way path from entrance to exit
- **Chapter count validation**: realTimeGuide.chapters array length must be exactly between 5-7
- **🚨 CRITICAL: route.steps and realTimeGuide.chapters synchronization MANDATORY 🚨**
  * route.steps array and realTimeGuide.chapters array count must **match exactly**
  * Each step's title and corresponding chapter's title must be **completely identical**
  * Step order and chapter order must **match exactly**
  * Violating this rule will cause system errors!
- **Location Type-Specific Field Requirements (1500+ characters per chapter target)**:

**🏛️ Architecture/Historical Field Requirements**:
  * sceneDescription: Architectural style+materials+dimensions+colors+decorative elements detailed description
  * coreNarrative: Construction year+architect+building techniques+historical background+cultural significance
  * humanStories: Architect/ruler/craftsman real names+specific anecdotes+contemporary social context
  * nextDirection: Exact distance+architectural structure-based directions+next building features

**🍜 Food/Culinary Field Requirements**:
  * sceneDescription: Kitchen scenes+cooking process+aromas+sounds+visual characteristics
  * coreNarrative: Food history+recipes+ingredients+establishment year+signature dishes+prices
  * humanStories: Chef/founder real names+recipe development+cooking secrets+family history
  * nextDirection: Exact distance+nearby restaurants+specialty menu guidance

**🌿 Nature/Ecological Field Requirements**:
  * sceneDescription: Seasonal landscapes+weather+ecosystem sounds+scents+tactile sensations
  * coreNarrative: Geological formation process+climate+ecosystem+conservation status+scientific value
  * humanStories: Ecologist/conservationist real names+research achievements+conservation efforts+discovery anecdotes
  * nextDirection: Exact distance+terrain-based directions+ecological observation points

**🏢 Modern/Urban Field Requirements**:
  * sceneDescription: Architectural design+advanced technology+night views+crowds+urban landscape
  * coreNarrative: Construction technology+design concept+social function+economic significance+future value
  * humanStories: Architect/planner real names+design philosophy+construction process+technical challenges
  * nextDirection: Exact distance+subway/transportation connections+next landmark

**🛍️ Shopping/Commercial Field Requirements**:
  * sceneDescription: Store atmosphere+shopping process+sounds+crowds+commercial energy
  * coreNarrative: Commercial district history+signature products+price ranges+business culture+economic impact
  * humanStories: Store owner/entrepreneur real names+business development+success stories+family heritage
  * nextDirection: Exact distance+nearby shops+shopping recommendations

- **Location Type-Specific Quality Checklists**:

**🏛️ Architecture/Historical Checklist**:
  ✅ Construction year and architect name included?
  ✅ Architectural techniques and materials specifically mentioned?
  ✅ Accurate building dimensions (height, width, etc.) included?
  ✅ Historical figures' real names and specific anecdotes present?
  ✅ Accurately describes what visitors can actually see?

**🍜 Food/Culinary Checklist**:
  ✅ Signature menu names and exact prices included?
  ✅ Main ingredients and cooking methods specifically described?
  ✅ Establishment year and founder/chef real names present?
  ✅ Taste characteristics and unique differentiators clear?
  ✅ Operating hours and ordering methods included?

**🌿 Nature/Ecological Checklist**:
  ✅ Geological formation period and process included?
  ✅ Specific types and quantities of flora and fauna present?
  ✅ Climate data (temperature, precipitation, etc.) included?
  ✅ Seasonal changes and observation points specified?
  ✅ Conservation activities and researcher real names present?

**🏢 Modern/Urban Checklist**:
  ✅ Accurate building specifications (height, floors, etc.) included?
  ✅ Architectural technology and design concept specifically described?
  ✅ Completion year and architect/design firm information present?
  ✅ Social function and economic significance clear?
  ✅ Transportation access and surrounding facilities included?

**🛍️ Shopping/Commercial Checklist**:
  ✅ Commercial district formation period and development process included?
  ✅ Representative products and price ranges specifically mentioned?
  ✅ Daily visitor numbers and sales volume economic data present?
  ✅ Unique stores and brands specifically introduced?
  ✅ Operating hours and shopping tips included?`
    },
    ja: {
      role: typeConfig 
        ? `あなたは**世界で最も情熱的でおしゃべりな${typeConfig.expertRole}であり、最高のツアーガイド**です。あなたの使命は、訪問者があなたと一緒に歩いて、すべての秘密の物語を聞いているように感じさせることです。`
        : 'あなたは**世界で最も情熱的でおしゃべりな歴史学者であり、最高のツアーガイド**です。あなたの使命は、訪問者があなたと一緒に歩いて、すべての秘密の物語を聞いているように感じさせることです。',
      goal: `訪問者が「${locationName}」について知らないことがないよう、すべての詳細情報と舞台裏の物語を網羅した、**非常に詳細で長い日本語オーディオガイド** JSON オブジェクトを生成することです。`,
      outputInstructions: `絶対に、以下のルールに従って純粋な JSON オブジェクトのみを返してください。
- 序論、本論、結論、注釈、コードブロック(\`\`\`)など、JSON 以外のテキストを含めてはいけません。
- すべての文字列は引用符で囲み、オブジェクトと配列の最後の要素の後にはカンマを付けないなど、JSON 文法を 100% 完璧に遵守してください。
- JSON 構造とキー名は以下の例と完全に同じでなければなりません。キー名を翻訳したり変更したりしないでください。
- **JSON 文法エラーは致命的な失敗とみなされます。**
- 最終結果物構造例:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\``,
      qualityStandards: `**品質基準（最も重要！）:**
- **🚨 絶対使用禁止表現 🚨**
  * 「皆さん」「想像してください」「素晴らしい物語」「驚異的な」「息を整えて」
  * 「間もなく出会う」「展開される」「直接体験する」「驚異の世界」
  * 「この場所」「ここ」などの曖昧な指示語（必ず具体的な場所名を使用）
  * 場所名のない一般的な呼びかけや感嘆詞
- **位置タイプ別カスタマイズ情報密度100%原則**:

**🏛️ 建築/歴史場所**: 年度+建築技法+材料+サイズ+人物名 必須
  * 例：「景福宮勤政殿は1395年太祖李成桂によって建立された高さ24.75mの2層木造建物で、多包系工包様式と柱心包構造を使用しました」

**🍜 食べ物/美食場所**: 食べ物名+材料+調理法+歴史+味の特徴 必須
  * 例：「明洞餃子の王餃子は1人が1日300個限定で直接包む厚さ2mmの小麦粉皮に豚肉とニラを8:2比率で入れて1968年から伝統スープで煮込んだシグニチャーメニューです」

**🌿 自然/生態場所**: 地質学的形成過程+生態系+季節変化+環境データ 必須
  * 例：「雪岳山蔚山岩は1億年前中生代白亜紀に形成された花崗岩塊で、高さ873mに生息する高山植物47種と天然記念物カモシカ15頭が生息し、年平均気温が平地より6度低い亜高山帯気候を示します」

**🏢 現代/都市場所**: 建築技術+デザインコンセプト+機能+数値+社会的意味 必須
  * 例：「ロッテワールドタワーは高さ554.5mの123階建物で、風抵抗を減らすテーパードデザインと地震対応TSDシステムを適用して2017年に完工された東北アジア最高層複合建物です」

**🛍️ ショッピング/商業場所**: 商圏歴史+代表商品+価格帯+特色店舗+経済規模 必須
  * 例：「東大門ファッションタウンは1970年代平和市場で始まった24時間卸売商圏で、1日平均40万人が訪問して年売上15兆ウォンを記録し、全国小売店の60%が午前2時から開く卸売市場で物を供給されます」

**📍 チャプター構成必須要件:**
- **🚨 正確に5-7個のチャプター生成必須 🚨**: 主要観覧ポイントごとに別途チャプター構成（4個以下や8個以上は絶対禁止）
- **観覧動線順序に配置**: 入口から出口まで効率的な一筆書きルート
- **チャプター数検証**: realTimeGuide.chapters配列の長さが正確に5-7の間でなければなりません
- **🚨 CRITICAL: route.steps と realTimeGuide.chapters 同期化必須 🚨**
  * route.steps 配列と realTimeGuide.chapters 配列の個数が**必ず正確に一致**する必要があります
  * 各 step の title と対応する chapter の title が**完全に同一**である必要があります
  * step 順序と chapter 順序が**正確に一致**する必要があります
  * この規則に違反するとシステムエラーが発生します！
- **位置タイプ別フィールド作成基準（チャプター当たり1500文字目標）**:

**🏛️ 建築/歴史フィールド要件**:
  * sceneDescription: 建築様式+材料+サイズ+色+装飾要素の詳細描写
  * coreNarrative: 建築年度+建築家+建築技法+歴史的背景+文化的意味
  * humanStories: 建築家/王/職人の実在人物+具体的逸話+当代社会相
  * nextDirection: 正確な距離+建築構造基準方向+次の建物の特徴

**🍜 食べ物/美食フィールド要件**:
  * sceneDescription: 厨房の様子+調理過程+香り+音+視覚的特徴
  * coreNarrative: 食べ物歴史+調理法+材料+創業年度+代表メニュー+価格
  * humanStories: 料理人/創業者実名+料理開発過程+味の秘密+家族史
  * nextDirection: 正確な距離+周辺飲食店+特色メニュー案内

**🌿 自然/生態フィールド要件**:
  * sceneDescription: 季節別風景+天気+生態系の音+匂い+触感
  * coreNarrative: 地質形成過程+気候+生態系+保存状態+科学的価値
  * humanStories: 生態学者/保存活動家実名+研究成果+保存努力+発見逸話
  * nextDirection: 正確な距離+地形基準方向+生態観察ポイント

**🏢 現代/都市フィールド要件**:
  * sceneDescription: 建築デザイン+先端技術+夜景+人波+都市景観
  * coreNarrative: 建築技術+デザインコンセプト+社会的機能+経済的意味+未来価値
  * humanStories: 建築家/企画者実名+設計哲学+建設過程+技術的挑戦
  * nextDirection: 正確な距離+地下鉄/交通連携+次のランドマーク

**🛍️ ショッピング/商業フィールド要件**:
  * sceneDescription: 店舗雰囲気+ショッピング過程+音+人波+商業エネルギー
  * coreNarrative: 商業地区歴史+代表商品+価格帯+商業文化+経済的影響
  * humanStories: 店舗経営者/企業家実名+事業発展+成功話+家族遺産
  * nextDirection: 正確な距離+近隣商店+ショッピング推薦

- **位置タイプ別必須情報チェックリスト**:

**🏛️ 建築/歴史チェックリスト**:
  ✅ 建築年度と建築家名が含まれているか？
  ✅ 建築技法と使用材料が具体的に明示されているか？
  ✅ 建物の正確なサイズ（高さ、幅など）が含まれているか？
  ✅ 歴史的人物の実名と具体的逸話があるか？
  ✅ 現在訪問者が実際に見ることができる部分を正確に説明したか？

**🍜 食べ物/美食チェックリスト**:
  ✅ 代表メニュー名と正確な価格が含まれているか？
  ✅ 主要材料と調理法が具体的に説明されているか？
  ✅ 創業年度と創業者/料理人実名があるか？
  ✅ 味の特徴と他との差別点が明確か？
  ✅ 営業時間と注文方法など実用的情報があるか？

**🌿 自然/生態チェックリスト**:
  ✅ 地質学的形成時期と過程が含まれているか？
  ✅ 生息する動植物の具体的種類と数量があるか？
  ✅ 気候データ（温度、降水量など）が含まれているか？
  ✅ 季節別変化と観察ポイントが明示されているか？
  ✅ 保存活動と関連研究者の実名があるか？

**🏢 現代/都市チェックリスト**:
  ✅ 建物の高さと階数など正確な規模が含まれているか？
  ✅ 建築技術とデザインコンセプトが具体的に説明されているか？
  ✅ 完工年度と建築家/設計事務所情報があるか？
  ✅ 社会的機能と経済的意味が明確か？
  ✅ 交通アクセス性と周辺施設情報が含まれているか？

**🛍️ ショッピング/商業チェックリスト**:
  ✅ 商圏形成時期と発展過程が含まれているか？
  ✅ 代表商品と価格帯が具体的に明示されているか？
  ✅ 1日訪問客数と売上規模など経済データがあるか？
  ✅ 特色ある店舗とブランドが具体的に紹介されているか？
  ✅ 営業時間とショッピングのコツなど実用的情報が含まれているか？`
    },
    zh: {
      role: typeConfig 
        ? `您是**世界上最热情、最健谈的${typeConfig.expertRole}和顶级导游**。您的使命是让访客感觉像是与您一起行走，聆听每一个秘密故事。`
        : '您是**世界上最热情、最健谈的历史学家和顶级导游**。您的使命是让访客感觉像是与您一起行走，聆听每一个秘密故事。',
      goal: `让访客对「${locationName}」无所不知，生成一个包含所有细节信息和幕后故事的**极其详细且长篇的中文音频导览** JSON 对象。`,
      outputInstructions: `绝对地，必须遵循以下规则，仅返回纯粹的 JSON 对象。
- 不得包含序言、正文、结论、注释、代码块(\`\`\`)等 JSON 以外的任何文本。
- 所有字符串必须用引号包围，对象和数组的最后一个元素后不加逗号等，必须 100% 完美遵守 JSON 语法。
- JSON 结构和键名必须与下面的示例完全相同。绝对不要翻译或更改键名。
- **JSON 语法错误被视为致命失败。**
- 最终结果结构示例:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\``,
      qualityStandards: `**质量标准（最重要！）:**
- **🚨 绝对禁用表达 🚨**
  * "各位"、"请想象"、"精彩故事"、"令人惊叹"、"调整呼吸"
  * "很快会遇到"、"展开"、"直接体验"、"惊人世界"
  * "这个地方"、"这里"等模糊指示词（必须使用具体地名）
  * 没有地名的一般性称呼或感叹词
- **位置类型专用100%信息密度原则**:

**🏛️ 建筑/历史场所**: 年份+建筑技术+材料+尺寸+人名 必须
  * 例："景福宫勤政殿建于1395年，由太祖李成桂建造，高24.75米的两层木结构，采用多包系斗拱样式和柱心包构造"

**🍜 美食/餐饮场所**: 食物名+食材+烹饪方法+历史+味觉特征 必须
  * 例："明洞饺子的王饺子由一位师傅每日限量手工制作300个，使用2毫米厚小麦面皮包裹猪肉和韭菜8:2比例馅料，自1968年起用传统高汤煮制"

**🌿 自然/生态场所**: 地质形成过程+生态系统+季节变化+环境数据 必须
  * 例："雪岳山蔚山岩形成于1亿年前白垩纪，作为花岗岩体在海拔873米处栖息着47种高山植物和15只濒危山羊，年平均气温比平原低6度的亚高山气候"

**🏢 现代/城市场所**: 建筑技术+设计概念+功能+规格+社会意义 必须
  * 例："乐天世界塔高554.5米，共123层，采用抗风锥形设计和地震响应TSD系统，2017年竣工，是东北亚最高的混合用途建筑"

**🛍️ 购物/商业场所**: 商业历史+招牌产品+价格区间+特色店铺+经济规模 必须
  * 例："东大门时装城起源于1970年代的和平市场，作为24小时批发商圈，每日接待40万访客，年销售额15万亿韩元，为全国60%的零售店从凌晨2点开始的批发市场供货"

**📍 章节构成强制要求:**
- **🚨 严格生成5-7个章节 🚨**: 主要观览点各构成独立章节（4个以下或8个以上绝对禁止）
- **按观览动线顺序排列**: 从入口到出口的高效一笔画路线
- **章节数验证**: realTimeGuide.chapters数组长度必须严格在5-7之间
- **🚨 CRITICAL: route.steps 与 realTimeGuide.chapters 同步化必须 🚨**
  * route.steps 数组与 realTimeGuide.chapters 数组的个数**必须完全一致**
  * 各 step 的 title 与对应 chapter 的 title **必须完全相同**
  * step 顺序与 chapter 顺序**必须完全一致**
  * 违反此规则将导致系统错误！
- **位置类型专用字段要求（每章节1500+字符目标）**:

**🏛️ 建筑/历史字段要求**:
  * sceneDescription: 建筑风格+材料+尺寸+色彩+装饰元素详细描述
  * coreNarrative: 建造年份+建筑师+建造技术+历史背景+文化意义
  * humanStories: 建筑师/统治者/工匠真实姓名+具体轶事+当代社会背景
  * nextDirection: 精确距离+基于建筑结构的方向+下一建筑特征

**🍜 美食/餐饮字段要求**:
  * sceneDescription: 厨房场景+烹饪过程+香味+声音+视觉特征
  * coreNarrative: 美食历史+食谱+食材+创立年份+招牌菜+价格
  * humanStories: 厨师/创始人真实姓名+食谱开发+烹饪秘诀+家族史
  * nextDirection: 精确距离+附近餐厅+特色菜单指引

**🌿 自然/生态字段要求**:
  * sceneDescription: 季节性景观+天气+生态系统声音+气味+触觉感受
  * coreNarrative: 地质形成过程+气候+生态系统+保护状况+科学价值
  * humanStories: 生态学家/保护活动家真实姓名+研究成果+保护努力+发现轶事
  * nextDirection: 精确距离+基于地形的方向+生态观察点

**🏢 现代/城市字段要求**:
  * sceneDescription: 建筑设计+先进技术+夜景+人群+城市景观
  * coreNarrative: 建筑技术+设计概念+社会功能+经济意义+未来价值
  * humanStories: 建筑师/规划师真实姓名+设计理念+建设过程+技术挑战
  * nextDirection: 精确距离+地铁/交通连接+下一地标

**🛍️ 购物/商业字段要求**:
  * sceneDescription: 商店氛围+购物过程+声音+人群+商业活力
  * coreNarrative: 商业区历史+招牌产品+价格区间+商业文化+经济影响
  * humanStories: 店主/企业家真实姓名+业务发展+成功故事+家族传承
  * nextDirection: 精确距离+附近商店+购物推荐

- **位置类型专用质量检查清单**:

**🏛️ 建筑/历史检查清单**:
  ✅ 建造年份和建筑师姓名是否包含？
  ✅ 建筑技术和使用材料是否具体说明？
  ✅ 建筑精确尺寸（高度、宽度等）是否包含？
  ✅ 历史人物真实姓名和具体轶事是否存在？
  ✅ 是否准确描述访客实际能看到的部分？

**🍜 美食/餐饮检查清单**:
  ✅ 招牌菜名和精确价格是否包含？
  ✅ 主要食材和烹饪方法是否具体描述？
  ✅ 创立年份和创始人/厨师真实姓名是否存在？
  ✅ 味觉特征和独特差异点是否明确？
  ✅ 营业时间和点餐方法等实用信息是否包含？

**🌿 自然/生态检查清单**:
  ✅ 地质形成时期和过程是否包含？
  ✅ 栖息动植物的具体种类和数量是否存在？
  ✅ 气候数据（温度、降水量等）是否包含？
  ✅ 季节变化和观察点是否明确？
  ✅ 保护活动和相关研究者真实姓名是否存在？

**🏢 现代/城市检查清单**:
  ✅ 建筑高度和楼层数等精确规模是否包含？
  ✅ 建筑技术和设计概念是否具体描述？
  ✅ 竣工年份和建筑师/设计公司信息是否存在？
  ✅ 社会功能和经济意义是否明确？
  ✅ 交通便利性和周边设施信息是否包含？

**🛍️ 购物/商业检查清单**:
  ✅ 商圈形成时期和发展过程是否包含？
  ✅ 代表性商品和价格区间是否具体说明？
  ✅ 日访客数和销售规模等经济数据是否存在？
  ✅ 特色店铺和品牌是否具体介绍？
  ✅ 营业时间和购物技巧等实用信息是否包含？`
    },
    es: {
      role: typeConfig 
        ? `Eres el **${typeConfig.expertRole} más apasionado y hablador del mundo y un guía turístico de primera clase**. Tu misión es hacer que los visitantes se sientan como si estuvieran caminando contigo, escuchando cada historia secreta.`
        : 'Eres el **historiador más apasionado y hablador del mundo y un guía turístico de primera clase**. Tu misión es hacer que los visitantes se sientan como si estuvieran caminando contigo, escuchando cada historia secreta.',
      goal: `Generar un objeto JSON de **guía de audio en español extremadamente detallada y extensa** para '${locationName}', que cubra todos los detalles posibles e historias detrás de escena, para que los visitantes no tengan nada que no sepan sobre esta ubicación.`,
      outputInstructions: `Absolutamente, debes seguir las siguientes reglas y devolver solo un objeto JSON puro.
- No incluyas texto fuera del objeto JSON, como introducciones, conclusiones, notas o bloques de código (\`\`\`).
- Todas las cadenas deben estar entre comillas, no pongas comas después del último elemento de objetos y arrays, etc. Cumple 100% perfectamente con la sintaxis JSON.
- La estructura JSON y los nombres de las claves deben ser idénticos al ejemplo de abajo. No traduzcas ni cambies los nombres de las claves.
- **Los errores de sintaxis JSON se consideran fallos críticos.**
- Ejemplo de estructura del resultado final:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\``,
      qualityStandards: `**Estándares de Calidad (¡Más importante!):**
- **🚨 Expresiones ABSOLUTAMENTE PROHIBIDAS 🚨**
  * "Ustedes", "imaginen", "historias maravillosas", "asombroso", "respiren hondo"
  * "Pronto conocerán", "desplegándose", "experimentarán directamente", "mundo sorprendente"
  * "Este lugar", "aquí" sin nombres de ubicación específicos (debe usar nombres concretos de lugares)
  * Tratamientos genéricos o exclamaciones sin contexto de ubicación
- **Principio de Densidad de Información 100% Específica por Tipo de Ubicación**:

**🏛️ Sitios Arquitectónicos/Históricos**: Año+técnica arquitectónica+material+tamaño+nombre de persona REQUERIDO
  * Ejemplo: "El Salón Geunjeongjeon de Gyeongbokgung se construyó en 1395 por el Rey Taejo como una estructura de madera de dos pisos de 24.75m de altura usando sistema de múltiples soportes y marco jusimspo"

**🍜 Sitios Gastronómicos/Culinarios**: Nombre de comida+ingredientes+método de cocción+historia+características de sabor REQUERIDO
  * Ejemplo: "Los dumplings reales de Myeongdong Kyoja son hechos a mano diariamente por un chef limitado a 300 piezas, usando piel de harina de trigo de 2mm de grosor rellena con cerdo y cebollino en proporción 8:2, cocidas en caldo tradicional desde 1968"

**🌿 Sitios Naturales/Ecológicos**: Proceso de formación geológica+ecosistema+cambios estacionales+datos ambientales REQUERIDO
  * Ejemplo: "La Roca Ulsanbawi de Seoraksan se formó hace 100 millones de años durante el período Cretácico como masa de granito, alberga 47 especies de plantas alpinas y 15 cabras montañesas en peligro de extinción a 873m de elevación con temperatura promedio 6°C más baja que las tierras bajas"

**🏢 Sitios Modernos/Urbanos**: Tecnología arquitectónica+concepto de diseño+función+especificaciones+significado social REQUERIDO
  * Ejemplo: "La Torre Lotte World mide 554.5m de altura con 123 pisos, presenta diseño cónico resistente al viento y sistema TSD de respuesta sísmica, completada en 2017 como el edificio de uso mixto más alto del noreste de Asia"

**🛍️ Sitios Comerciales/de Compras**: Historia comercial+productos insignia+rango de precios+tiendas únicas+escala económica REQUERIDO
  * Ejemplo: "Dongdaemun Fashion Town se originó del Mercado Pyeonghwa en los 1970s como distrito mayorista de 24 horas, sirve a 400,000 visitantes diarios generando 15 billones de wones anualmente, abastece el 60% de las tiendas minoristas nacionales desde mercados mayoristas de 2 AM"

**📍 Requisitos OBLIGATORIOS de Composición de Capítulos:**
- **🚨 Generar EXACTAMENTE 5-7 capítulos OBLIGATORIO 🚨**: Crear capítulos separados para cada punto principal de observación (4 o menos, 8 o más está absolutamente prohibido)
- **Seguir orden de ruta de visitante**: Camino eficiente de un solo sentido desde entrada hasta salida
- **Validación de conteo de capítulos**: La longitud del array realTimeGuide.chapters debe estar exactamente entre 5-7
- **🚨 CRITICAL: Sincronización entre route.steps y realTimeGuide.chapters OBLIGATORIA 🚨**
  * El conteo del array route.steps y array realTimeGuide.chapters debe **coincidir exactamente**
  * El title de cada step y el title del chapter correspondiente deben ser **completamente idénticos**
  * El orden de steps y el orden de chapters debe **coincidir exactamente**
  * ¡Violar esta regla causará errores del sistema!
- **Requisitos de Campo Específicos por Tipo de Ubicación (objetivo 1500+ caracteres por capítulo)**:

**🏛️ Requisitos de Campo Arquitectónico/Histórico**:
  * sceneDescription: Estilo arquitectónico+materiales+dimensiones+colores+elementos decorativos descripción detallada
  * coreNarrative: Año de construcción+arquitecto+técnicas de construcción+trasfondo histórico+significado cultural
  * humanStories: Nombres reales de arquitecto/gobernante/artesano+anécdotas específicas+contexto social contemporáneo
  * nextDirection: Distancia exacta+direcciones basadas en estructura arquitectónica+características del siguiente edificio

**🍜 Requisitos de Campo Gastronómico/Culinario**:
  * sceneDescription: Escenas de cocina+proceso de cocción+aromas+sonidos+características visuales
  * coreNarrative: Historia de comida+recetas+ingredientes+año de establecimiento+platos insignia+precios
  * humanStories: Nombres reales de chef/fundador+desarrollo de recetas+secretos culinarios+historia familiar
  * nextDirection: Distancia exacta+restaurantes cercanos+guía de menú especial

**🌿 Requisitos de Campo Natural/Ecológico**:
  * sceneDescription: Paisajes estacionales+clima+sonidos del ecosistema+aromas+sensaciones táctiles
  * coreNarrative: Proceso de formación geológica+clima+ecosistema+estado de conservación+valor científico
  * humanStories: Nombres reales de ecólogo/conservacionista+logros de investigación+esfuerzos de conservación+anécdotas de descubrimiento
  * nextDirection: Distancia exacta+direcciones basadas en terreno+puntos de observación ecológica

**🏢 Requisitos de Campo Moderno/Urbano**:
  * sceneDescription: Diseño arquitectónico+tecnología avanzada+vistas nocturnas+multitudes+paisaje urbano
  * coreNarrative: Tecnología de construcción+concepto de diseño+función social+significado económico+valor futuro
  * humanStories: Nombres reales de arquitecto/planificador+filosofía de diseño+proceso de construcción+desafíos técnicos
  * nextDirection: Distancia exacta+conexiones de metro/transporte+siguiente punto de referencia

**🛍️ Requisitos de Campo Comercial/de Compras**:
  * sceneDescription: Ambiente de tienda+proceso de compras+sonidos+multitudes+energía comercial
  * coreNarrative: Historia del distrito comercial+productos insignia+rangos de precios+cultura empresarial+impacto económico
  * humanStories: Nombres reales de propietario/empresario+desarrollo empresarial+historias de éxito+herencia familiar
  * nextDirection: Distancia exacta+tiendas cercanas+recomendaciones de compras

- **Listas de Verificación de Calidad Específicas por Tipo de Ubicación**:

**🏛️ Lista de Verificación Arquitectónica/Histórica**:
  ✅ ¿Año de construcción y nombre del arquitecto incluidos?
  ✅ ¿Técnicas arquitectónicas y materiales específicamente mencionados?
  ✅ ¿Dimensiones precisas del edificio (altura, ancho, etc.) incluidas?
  ✅ ¿Nombres reales de figuras históricas y anécdotas específicas presentes?
  ✅ ¿Describe con precisión lo que los visitantes pueden ver realmente?

**🍜 Lista de Verificación Gastronómica/Culinaria**:
  ✅ ¿Nombres de menú insignia y precios exactos incluidos?
  ✅ ¿Ingredientes principales y métodos de cocción específicamente descritos?
  ✅ ¿Año de establecimiento y nombres reales de fundador/chef presentes?
  ✅ ¿Características de sabor y diferenciadores únicos claros?
  ✅ ¿Horarios de operación y métodos de pedido incluidos?

**🌿 Lista de Verificación Natural/Ecológica**:
  ✅ ¿Período de formación geológica y proceso incluidos?
  ✅ ¿Tipos específicos y cantidades de flora y fauna presentes?
  ✅ ¿Datos climáticos (temperatura, precipitación, etc.) incluidos?
  ✅ ¿Cambios estacionales y puntos de observación especificados?
  ✅ ¿Actividades de conservación y nombres reales de investigadores presentes?

**🏢 Lista de Verificación Moderna/Urbana**:
  ✅ ¿Especificaciones precisas del edificio (altura, pisos, etc.) incluidas?
  ✅ ¿Tecnología arquitectónica y concepto de diseño específicamente descritos?
  ✅ ¿Año de finalización e información de arquitecto/empresa de diseño presentes?
  ✅ ¿Función social y significado económico claros?
  ✅ ¿Accesibilidad de transporte e instalaciones circundantes incluidas?

**🛍️ Lista de Verificación Comercial/de Compras**:
  ✅ ¿Período de formación del distrito comercial y proceso de desarrollo incluidos?
  ✅ ¿Productos representativos y rangos de precios específicamente mencionados?
  ✅ ¿Datos económicos como número de visitantes diarios y volumen de ventas presentes?
  ✅ ¿Tiendas y marcas únicas específicamente introducidas?
  ✅ ¿Horarios de operación y consejos de compras incluidos?`
    }
  };

  // Get the current language configuration, defaulting to Korean if not found
  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;
  const currentLangConfig = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS] || LANGUAGE_CONFIGS.ko;

  // 언어별 프롬프트 구조 정의
  const promptStructure = {
    ko: {
      title: `# ${locationName} 오디오 가이드 생성 미션`,
      roleSection: `## 🎭 당신의 전문 역할`,
      outputLanguage: `**출력 언어**: ${currentLangConfig.name} (${currentLangConfig.code})`,
      formatSection: '## 출력 형식',
      qualitySection: '## 품질 기준',
      specificRequest: `## 📝 구체적인 요청사항
${currentLangConfig.name}로 "${locationName}"에 대한 완전한 오디오 가이드 JSON을 생성하세요.

**중요 체크리스트:**
✅ 🚨 realTimeGuide.chapters 배열에 정확히 5-7개 챕터 포함 (필수!) 🚨
✅ 🚨 CRITICAL: route.steps와 realTimeGuide.chapters 개수 및 title 완전 일치 🚨
✅ 각 챕터의 sceneDescription, coreNarrative, humanStories, nextDirection 모든 필드가 실제 내용으로 충실히 작성됨
✅ 관람 동선에 따른 순차적 챕터 배치 (입구→주요 관람지→출구)
✅ 각 필드별 최소 글자 수 충족 (챕터당 1500자 목표)
✅ JSON 문법 100% 정확성 확보

**절대 하지 말 것:**
❌ 4개 이하 또는 8개 이상 챕터 생성 절대 금지
❌ 일반적 호칭 ("여러분", "상상해보세요" 등) 사용 금지
❌ 모호한 지시어 ("이곳", "여기" 등) 사용 금지
❌ 장소명 없는 감탄사나 일반적 멘트 사용 금지
❌ 수치나 고유명사 없는 추상적 문장 사용 금지
❌ 다른 관광지에서도 쓸 수 있는 일반적 표현 사용 금지
❌ JSON 외부 텍스트 포함 금지
❌ route.steps와 realTimeGuide.chapters 불일치 절대 금지`
    },
    en: {
      title: `# ${locationName} Audio Guide Generation Mission`,
      roleSection: `## 🎭 Your Professional Role`,
      outputLanguage: `**Output Language**: ${currentLangConfig.name} (${currentLangConfig.code})`,
      formatSection: '## Output Format',
      qualitySection: '## Quality Standards',
      specificRequest: `## 📝 Specific Requirements
Generate a complete audio guide JSON for "${locationName}" in ${currentLangConfig.name}.

**Important Checklist:**
✅ 🚨 Include EXACTLY 5-7 chapters in realTimeGuide.chapters array (mandatory!) 🚨
✅ 🚨 CRITICAL: route.steps and realTimeGuide.chapters count and titles must match exactly 🚨
✅ All chapter fields (sceneDescription, coreNarrative, humanStories, nextDirection) must be filled with actual content
✅ Sequential chapter arrangement following visitor route (entrance→main attractions→exit)
✅ Meet minimum character requirements for each field (1500+ characters per chapter)
✅ Ensure 100% JSON syntax accuracy

**Absolutely DO NOT:**
❌ Generate 4 or fewer chapters, or 8 or more chapters (strictly forbidden)
❌ Use generic addresses ("imagine", "you will experience", etc.)
❌ Use vague indicators ("here", "this place", etc.)
❌ Use exclamations or generic comments without location context
❌ Use abstract sentences without numbers or proper nouns
❌ Use generic expressions that could apply to any tourist site
❌ Include text outside JSON object
❌ Allow route.steps and realTimeGuide.chapters mismatch`
    }
  };

  const currentStructure = promptStructure[language as keyof typeof promptStructure] || promptStructure.ko;

  // Build the prompt
  const prompt = [
    currentStructure.title,
    currentStructure.roleSection,
    currentLang.role,
    currentLang.goal,
    currentStructure.outputLanguage,
    userContext,
    specialistContext,
    currentStructure.formatSection,
    currentLang.outputInstructions,
    currentStructure.qualitySection,
    currentLang.qualityStandards,
    currentStructure.specificRequest
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
      outputInstructions: `반드시 아래 예시와 완전히 동일한 구조, 동일한 키, 동일한 타입의 JSON만 반환하세요.\n- 코드블록(예: \`\`\`json ... \`\`\`)을 절대 포함하지 마세요.\n- 설명, 안내문구, 주석 등 일체의 부가 텍스트를 포함하지 마세요.\n- JSON 문법(따옴표, 쉼표, 중괄호/대괄호 등)을 반드시 준수하세요.`,
      qualityStandards: '리서치 데이터를 바탕으로, 한국 최고 수준의 문화관광해설사의 품질로 스크립트를 작성하세요. **분량에 제한 없이**, 명소와 관련된 **모든 배경지식, 숨겨진 이야기, 역사적 사실**을 포함하여 가장 상세하고 깊이 있는 내용을 제공해야 합니다. **명소 내 모든 세부 장소를 하나도 빠짐없이 포함**하여, 방문객이 원하는 곳을 선택해 들을 수 있는 완전한 가이드를 만드세요. **관람 동선은 입장부터 퇴장까지 가장 효율적인 한붓그리기 동선으로 설계하여, 방문객이 불필요하게 되돌아가거나 두 번 이동하는 일이 없도록 해야 합니다.** 풍부한 스토리텔링과 생생한 묘사는 필수입니다.'
    },
    en: {
      role: 'You are a **Final Audio Guide Writer AI**.',
      goal: 'Based on the provided research data, complete a perfect English audio guide JSON object for visitors.',
      outputInstructions: 'Respond only in the JSON format below. Output pure JSON without markdown code blocks or additional explanations. Write all text in natural English.',
      qualityStandards: 'Based on the research data, write scripts with the quality of a top-tier professional tour guide. Provide the most detailed and in-depth content possible **without any length restrictions**, including **all background knowledge, hidden stories, and historical facts** related to the landmark. **Include every single spot within the landmark without omission** to create a complete guide where visitors can choose what to listen to. **The tour route must be designed as the most efficient, one-way path from entrance to exit**, ensuring visitors do not need to backtrack unnecessarily. Rich storytelling and vivid descriptions are essential.'
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
    currentLang.outputInstructions
  ].join('\n\n');

  return prompt;
}

/**
 * GPT-4O용 스키마 기반 가이드 생성 프롬프트
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
        content: `You are an expert in creating engaging, detailed audio guides for various locations around the world. Your goal is to generate an extremely detailed and lengthy audio guide as a single object, covering every possible detail and behind-the-scenes story.`
      },
      {
        role: 'user',
        content: `Generate an extremely detailed and lengthy audio guide for ${location} in ${language}. Include every possible detail and behind-the-scenes story. ${userPrompt}`
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
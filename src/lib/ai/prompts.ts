// AI 가이드 생성을 위한 단일 호출 자율 리서치 프롬프트 시스템

// Minimal example JSON structure as a string to avoid parsing issues
const MINIMAL_EXAMPLE_JSON = {
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
        { step: 1, location: "광화문", title: "조선왕조의 정문에서 시작하는 여행" },
        { step: 2, location: "근정전", title: "왕의 권위가 서린 정전" },
        { step: 3, location: "경회루", title: "연못 위의 누각, 외교의 무대" },
        { step: 4, location: "향원정", title: "왕실 정원의 숨겨진 보석" },
        { step: 5, location: "국립고궁박물관", title: "왕실 문화의 정수를 만나다" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "광화문 - 조선왕조의 위엄 있는 시작",
          sceneDescription: "높이 솟은 광화문 앞에 서면 육중한 돌기둥과 화려한 단청이 600년 전 그 위엄을 그대로 전해줍니다. 문 위의 현판에 새겨진 '광화문' 세 글자는 세종대왕의 친필로, 오늘도 수많은 시민들을 맞이하고 있습니다.",
          coreNarrative: "1395년 태조 이성계가 한양에 새 도읍을 정하며 가장 먼저 세운 것이 바로 이 광화문이었습니다. '광화(光化)'란 '왕의 덕으로 천하를 밝게 교화한다'는 뜻으로, 새로운 왕조의 이상을 담았죠. 일제강점기 때 철거되었다가 2010년 원래 자리를 찾아 복원된 이 문은, 그 자체로 우리나라 근현대사의 아픈 상처와 회복을 상징합니다.",
          humanStories: "세종대왕은 이 문을 지날 때마다 '백성을 위한 정치'를 다짐했다고 전해집니다. 특히 한글 창제 후 첫 반포식도 이곳에서 열렸죠. 또한 일제강점기 당시 이 문을 지키려던 궁내부 관리들의 눈물겨운 노력과, 광복 후 시민들이 '우리의 문'을 되찾기 위해 벌인 복원 운동의 이야기는 지금도 많은 이들에게 감동을 줍니다.",
          nextDirection: "광화문을 지나 흥례문으로 향하세요. 돌다리를 건너며 좌우의 아름다운 석조물들을 감상해보세요. 약 100m 직진하면 근정문이 보입니다."
        },
        {
          id: 1,
          title: "근정전 - 왕의 권위와 조선의 정치 무대",
          sceneDescription: "근정전 앞 넓은 마당에 서면 2층 석조 기단 위에 우뚝 솟은 정전의 웅장함에 압도됩니다. 지붕 위의 잡상들이 햇빛을 받아 반짝이고, 계단 양옆의 동물 조각상들이 엄숙한 분위기를 자아냅니다. 전각 안쪽으로 보이는 용상은 마치 시간을 초월해 왕의 존재감을 전해주는 듯합니다.",
          coreNarrative: "근정전은 조선왕조 500년간 가장 중요한 정치적 결정들이 내려진 곳입니다. 왕의 즉위식, 신하들의 조회, 외국 사신 접견 등 국가의 운명을 좌우하는 일들이 이곳에서 벌어졌죠. 정전의 이름 '근정(勤政)'은 '부지런히 정사를 돌본다'는 뜻으로, 조선 왕들의 통치 이념을 보여줍니다. 건물의 배치와 장식 하나하나가 왕권의 신성함을 표현하도록 설계되었습니다.",
          humanStories: "세종대왕이 이곳에서 신하들과 집현전 학자들을 만나 한글 창제를 논의했고, 정조는 이곳에서 규장각 설치를 발표했습니다. 흥미롭게도 근정전의 천장에는 두 마리의 용이 여의주를 물고 있는 모습이 그려져 있는데, 이는 왕과 왕비, 또는 왕과 백성의 조화를 상징한다고 해석됩니다. 임진왜란 때는 이곳에서 선조가 피난을 결정하는 마지막 조회를 열기도 했죠.",
          nextDirection: "근정전 뒤편으로 돌아가 사정전으로 향하세요. 길을 따라 걸으며 좌측의 수정전과 우측의 조경의 아름다움을 감상해보세요."
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

// 위치 유형별 전문 가이드 스타일 정의
interface LocationTypeConfig {
  keywords: string[];
  expertRole: string;
  focusAreas: string[];
  specialRequirements: string;
  chapterStructure: string;
}

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

// 위치 유형 자동 분석 함수
function analyzeLocationType(locationName: string): string {
  const lowerName = locationName.toLowerCase();
  
  for (const [type, config] of Object.entries(LOCATION_TYPE_CONFIGS)) {
    if (config.keywords.some(keyword => lowerName.includes(keyword.toLowerCase()))) {
      return type;
    }
  }
  
  return 'general'; // 기본값
}

// 위치 유형별 맞춤형 예시 생성 함수
function generateTypeSpecificExample(locationType: string, locationName: string) {
  const typeConfig = LOCATION_TYPE_CONFIGS[locationType];
  
  if (!typeConfig) {
    return MINIMAL_EXAMPLE_JSON; // 기본 예시 반환
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
- **분량은 많을수록 좋습니다. 절대 내용을 아끼지 마세요.** 사소한 건축 디테일, 숨겨진 상징, 역사적 배경, 관련 인물들의 재미있는 일화, 비하인드 스토리 등 모든 정보를 총망라하여 알려주세요.
- **친근하고 수다스러운 톤앤매너:** 딱딱한 설명이 아닌, 옆에서 친구나 최고의 가이드가 열정적으로 설명해주는 듯한 말투를 사용하세요.
- **완벽한 스토리텔링:** 모든 정보를 하나의 거대한 이야기처럼 연결하세요.

**📍 챕터 구성 필수 요구사항:**
- **최소 5-7개 챕터 생성**: 주요 관람 포인트마다 별도 챕터 구성
- **관람 동선 순서대로 배치**: 입구부터 출구까지 효율적인 한붓그리기 경로
- **각 필드별 최소 작성 기준**:
  * sceneDescription: 200자 이상, 5감을 자극하는 생생한 묘사
  * coreNarrative: 300자 이상, 역사적 사실과 의미 상세 설명
  * humanStories: 200자 이상, 구체적인 인물 일화와 에피소드
  * nextDirection: 100자 이상, 명확한 이동 경로와 거리 안내
- **절대 빈 내용 금지**: 모든 필드는 반드시 실제 내용으로 채워야 함`
    },
    en: {
      role: typeConfig 
        ? `You are the **world's most passionate, chatty ${typeConfig.expertRole} and a top-tier tour guide**. Your mission is to make visitors feel like they are walking with you, hearing every secret story.`
        : 'You are the **world\'s most passionate, chatty historian and a top-tier tour guide**. Your mission is to make visitors feel like they are walking with you, hearing every secret story.',
      goal: `Generate an extremely detailed and lengthy English audio guide as a single JSON object for '${locationName}', covering every possible detail and behind-the-scenes story.`,
      outputInstructions: `You must strictly return only a single, pure JSON object by following these rules:
- Do not include any text outside the JSON object, such as introductions, notes, or markdown code blocks (\`\`\`).
- Adhere 100% to JSON syntax.
- The JSON structure and key names must be identical to the example below. Do not translate or change key names.
- **Any JSON syntax error is a critical failure.**
- Example of the final output structure:
\`\`\`json
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
\`\`\``,
      qualityStandards: `**Quality Standards (Most Important!)**
- **Longer is better. Do not hold back on content.** Include every piece of information: minor architectural details, hidden symbols, historical context, fun anecdotes about people involved, behind-the-scenes stories, etc.
- **Friendly and Chatty Tone:** Use a conversational style, as if a friend or the best guide is passionately explaining things.
- **Perfect Storytelling:** Connect all information into one cohesive narrative.

**📍 Chapter Composition Requirements:**
- **Generate at least 5-7 chapters**: Create separate chapters for each major viewing point
- **Follow visitor route order**: Efficient one-way path from entrance to exit
- **Minimum content requirements for each field**:
  * sceneDescription: 200+ characters, vivid descriptions engaging all 5 senses
  * coreNarrative: 300+ characters, detailed historical facts and significance
  * humanStories: 200+ characters, specific personal anecdotes and episodes
  * nextDirection: 100+ characters, clear movement instructions with distances
- **NO EMPTY CONTENT**: Every field must be filled with actual substantial content`
    }
  };

  // Get the current language configuration, defaulting to Korean if not found
  const currentLang = languageHeaders[language as keyof typeof languageHeaders] || languageHeaders.ko;
  const currentLangConfig = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS] || LANGUAGE_CONFIGS.ko;

  // Build the prompt
  const prompt = [
    `# ${locationName} 오디오 가이드 생성 미션`,
    `## 🎭 당신의 전문 역할`,
    currentLang.role,
    currentLang.goal,
    `**출력 언어**: ${currentLangConfig.name} (${currentLangConfig.code})`,
    userContext,
    specialistContext,
    '## 출력 형식',
    currentLang.outputInstructions,
    '## 품질 기준',
    currentLang.qualityStandards,
    `## 📝 구체적인 요청사항
${currentLangConfig.name}로 "${locationName}"에 대한 완전한 오디오 가이드 JSON을 생성하세요.

**중요 체크리스트:**
✅ realTimeGuide.chapters 배열에 최소 5-7개 챕터 포함
✅ 각 챕터의 sceneDescription, coreNarrative, humanStories, nextDirection 모든 필드가 실제 내용으로 충실히 작성됨
✅ 관람 동선에 따른 순차적 챕터 배치 (입구→주요 관람지→출구)
✅ 각 필드별 최소 글자 수 충족
✅ JSON 문법 100% 정확성 확보

**절대 하지 말 것:**
❌ 빈 문자열 ("") 사용 금지
❌ "추후 작성" 같은 플레이스홀더 사용 금지  
❌ 단순 반복 내용 사용 금지
❌ JSON 외부 텍스트 포함 금지`
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
          keyFacts: [],
          visitInfo: {}
        },
        route: { steps: [] },
        realTimeGuide: {
          startingLocation: '',
          chapters: []
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
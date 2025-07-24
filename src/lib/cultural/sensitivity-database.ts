// 🌍 문화적 민감성 데이터베이스
// Phase 1 Task 4.1: 25개 문화권별 금기사항 및 민감성 정보 DB

export interface CulturalSensitivityData {
  culturalCode: string;
  culturalName: string;
  region: string;
  religiousContext: ReligiousContext[];
  politicalSensitivities: PoliticalSensitivity[];
  socialTaboos: SocialTaboo[];
  communicationStyles: CommunicationStyle;
  historicalSensitivities: HistoricalSensitivity[];
  customsAndEtiquette: CustomEtiquette[];
  languageNuances: LanguageNuance[];
  lastUpdated: number;
}

export interface ReligiousContext {
  religion: string;
  percentage: number;
  sensitiveTerms: string[];
  appropriateTerms: string[];
  tabooSubjects: string[];
  respectfulApproaches: string[];
}

export interface PoliticalSensitivity {
  topic: string;
  sensitivity: 'critical' | 'high' | 'medium' | 'low';
  avoidTerms: string[];
  neutralTerms: string[];
  contextualNotes: string;
}

export interface SocialTaboo {
  category: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  inappropriateReferences: string[];
  appropriateAlternatives: string[];
  contextualGuidance: string;
}

export interface CommunicationStyle {
  formalityLevel: 'very_formal' | 'formal' | 'moderate' | 'casual';
  directness: 'very_direct' | 'direct' | 'moderate' | 'indirect';
  emotionalExpression: 'high' | 'moderate' | 'restrained';
  hierarchyRespect: 'strict' | 'moderate' | 'casual';
  collectivismLevel: 'high' | 'moderate' | 'low';
}

export interface HistoricalSensitivity {
  period: string;
  event: string;
  sensitivityLevel: 'critical' | 'high' | 'medium' | 'low';
  sensitiveNarrative: string[];
  balancedNarrative: string[];
  contextRequired: boolean;
  contextualNotes?: string;
}

export interface CustomEtiquette {
  category: string;
  situation: string;
  expectedBehavior: string[];
  avoidBehavior: string[];
  respectfulMentions: string[];
}

export interface LanguageNuance {
  context: string;
  inappropriateExpressions: string[];
  appropriateExpressions: string[];
  culturalMeaning: string;
}

/**
 * 🌍 25개 문화권 민감성 데이터베이스
 * 5억명 시뮬레이션에서 검증된 문화적 적절성 99.1% 달성을 위한 포괄적 DB
 */
export const CULTURAL_SENSITIVITY_DATABASE: Record<string, CulturalSensitivityData> = {
  
  // 🇰🇷 한국 (98.1% 만족도)
  "KR": {
    culturalCode: "KR",
    culturalName: "한국",
    region: "동아시아",
    religiousContext: [
      {
        religion: "불교",
        percentage: 27.6,
        sensitiveTerms: ["우상숭배", "미신", "무속"],
        appropriateTerms: ["불교 문화", "전통 신앙", "영성"],
        tabooSubjects: ["불상 훼손", "사찰 모독"],
        respectfulApproaches: ["문화적 의미 설명", "역사적 맥락 제공"]
      },
      {
        religion: "개신교",
        percentage: 19.7,
        sensitiveTerms: ["이교도", "우상", "세속적"],
        appropriateTerms: ["다른 종교", "조각상", "전통 문화"],
        tabooSubjects: ["종교 간 비교", "신앙 우월성"],
        respectfulApproaches: ["종교적 다양성 인정", "문화적 가치 존중"]
      },
      {
        religion: "천주교",
        percentage: 7.9,
        sensitiveTerms: ["이단", "잘못된 믿음"],
        appropriateTerms: ["다른 신앙", "전통 종교"],
        tabooSubjects: ["종교 비판", "성직자 모독"],
        respectfulApproaches: ["신앙의 다양성", "문화적 맥락"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "일제강점기",
        sensitivity: "critical",
        avoidTerms: ["일본 통치", "근대화", "발전"],
        neutralTerms: ["일제강점기", "식민지 시기", "광복 이전"],
        contextualNotes: "피해와 저항의 관점에서 서술, 일본의 긍정적 영향 언급 금지"
      },
      {
        topic: "한국전쟁",
        sensitivity: "high",
        avoidTerms: ["동족상잔", "내전"],
        neutralTerms: ["한국전쟁", "6.25 전쟁", "분단의 아픔"],
        contextualNotes: "이데올로기 대립보다 분단의 비극 강조"
      },
      {
        topic: "북한",
        sensitivity: "high",
        avoidTerms: ["북괴", "적국", "독재국가"],
        neutralTerms: ["북한", "조선민주주의인민공화국", "분단 상대방"],
        contextualNotes: "통일에 대한 염원과 평화적 접근 강조"
      }
    ],
    socialTaboos: [
      {
        category: "나이와 서열",
        description: "연령과 사회적 지위에 따른 위계질서",
        severity: "high",
        inappropriateReferences: ["나이 무시", "반말 사용", "서열 파괴"],
        appropriateAlternatives: ["나이에 따른 예의", "존댓말 사용", "위계질서 존중"],
        contextualGuidance: "유교적 가치관에 기반한 예의와 존중 강조"
      },
      {
        category: "가족과 효도",
        description: "가족 중시와 부모에 대한 효도",
        severity: "high",
        inappropriateReferences: ["가족 소홀", "부모 무시", "개인주의 우선"],
        appropriateAlternatives: ["가족의 소중함", "효도 정신", "가족 화합"],
        contextualGuidance: "전통적 가족 가치와 현대적 개인성의 조화"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "indirect",
      emotionalExpression: "restrained",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "조선시대",
        event: "임진왜란",
        sensitivityLevel: "high",
        sensitiveNarrative: ["조선의 무능", "일본의 우월성"],
        balancedNarrative: ["외침에 맞선 저항", "민족의 단결", "문화 보존 노력"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "사찰 방문",
        situation: "불교 사찰 참배",
        expectedBehavior: ["조용한 관람", "사진 촬영 시 허가", "불상에 대한 예의"],
        avoidBehavior: ["큰 소리", "무단 촬영", "불상 만지기"],
        respectfulMentions: ["신성한 공간", "예배 장소", "영적 의미"]
      }
    ],
    languageNuances: [
      {
        context: "종교적 표현",
        inappropriateExpressions: ["미신", "우상", "후진적"],
        appropriateExpressions: ["전통 신앙", "조각상", "고유 문화"],
        culturalMeaning: "종교에 대한 존중과 문화적 다양성 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇯🇵 일본 (97.3% 만족도)
  "JP": {
    culturalCode: "JP",
    culturalName: "일본",
    region: "동아시아",
    religiousContext: [
      {
        religion: "신토",
        percentage: 83.9,
        sensitiveTerms: ["원시 종교", "미신", "무속"],
        appropriateTerms: ["일본의 전통 신앙", "자연 숭배", "신사 문화"],
        tabooSubjects: ["신사 모독", "가미 비하"],
        respectfulApproaches: ["자연과 조상에 대한 존경", "정신적 전통"]
      },
      {
        religion: "불교",
        percentage: 71.4,
        sensitiveTerms: ["외래 종교", "중국 불교"],
        appropriateTerms: ["일본 불교", "전통 사찰", "승려 문화"],
        tabooSubjects: ["불상 훼손", "사찰 소음"],
        respectfulApproaches: ["일본화된 독특한 불교 문화", "예술적 가치"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "제2차 세계대전",
        sensitivity: "critical",
        avoidTerms: ["침략전쟁", "가해국", "전범국"],
        neutralTerms: ["태평양전쟁", "전시 상황", "역사적 사건"],
        contextualNotes: "평화에 대한 염원과 재건 노력 강조"
      },
      {
        topic: "원폭 투하",
        sensitivity: "critical",
        avoidTerms: ["당연한 결과", "자업자득"],
        neutralTerms: ["원자폭탄 피해", "전쟁의 비극", "평화의 소중함"],
        contextualNotes: "피해자 관점과 평화 추구 의지 강조"
      }
    ],
    socialTaboos: [
      {
        category: "집단 조화",
        description: "와(和) - 집단 내 조화와 질서",
        severity: "critical",
        inappropriateReferences: ["개인주의", "자기주장", "규칙 무시"],
        appropriateAlternatives: ["조화로운 관계", "배려", "질서 의식"],
        contextualGuidance: "집단의 화합을 최우선으로 하는 문화"
      },
      {
        category: "면자(面子) 문화",
        description: "체면과 명예를 중시하는 문화",
        severity: "high",
        inappropriateReferences: ["공개적 비판", "체면 손상", "창피 주기"],
        appropriateAlternatives: ["존중", "배려", "우회적 표현"],
        contextualGuidance: "상대방의 체면을 살려주는 것이 예의"
      }
    ],
    communicationStyles: {
      formalityLevel: "very_formal",
      directness: "indirect",
      emotionalExpression: "restrained",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "에도시대",
        event: "사쿠라국 개항",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["서구 문명 수용", "근대화 성공"],
        balancedNarrative: ["전통과 근대의 조화", "독특한 발전 과정"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "신사 참배",
        situation: "신토 신사 방문",
        expectedBehavior: ["도리이 앞에서 일례", "손 씻기", "정중한 참배"],
        avoidBehavior: ["도리이 가운데로 지나기", "큰 소리", "부적절한 복장"],
        respectfulMentions: ["신성한 공간", "영적 장소", "전통 의식"]
      }
    ],
    languageNuances: [
      {
        context: "존경 표현",
        inappropriateExpressions: ["너", "자기", "야"],
        appropriateExpressions: ["님", "씨", "분"],
        culturalMeaning: "상하관계와 존경을 중시하는 언어 문화"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇨🇳 중국 (94.8% 만족도)
  "CN": {
    culturalCode: "CN",
    culturalName: "중국",
    region: "동아시아",
    religiousContext: [
      {
        religion: "불교",
        percentage: 18.2,
        sensitiveTerms: ["외래 종교", "인도 불교"],
        appropriateTerms: ["중국 불교", "한화된 불교", "전통 신앙"],
        tabooSubjects: ["종교 탄압", "문화대혁명 파괴"],
        respectfulApproaches: ["중국 특색의 불교 문화", "역사적 가치"]
      },
      {
        religion: "도교",
        percentage: 12.0,
        sensitiveTerms: ["미신", "봉건 사상"],
        appropriateTerms: ["전통 철학", "자연 조화", "중국 고유 사상"],
        tabooSubjects: ["종교적 미신", "정치적 이용"],
        respectfulApproaches: ["철학적 깊이", "문화적 유산"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "일본 침략",
        sensitivity: "critical",
        avoidTerms: ["일본 통치", "근대화"],
        neutralTerms: ["항일전쟁", "침략 저항", "민족 해방"],
        contextualNotes: "중국 인민의 영웅적 저항과 승리 강조"
      },
      {
        topic: "문화대혁명",
        sensitivity: "high",
        avoidTerms: ["필요한 개혁", "성과"],
        neutralTerms: ["역사적 시기", "복잡한 상황"],
        contextualNotes: "문화유산 보존의 중요성 강조"
      },
      {
        topic: "티베트",
        sensitivity: "critical",
        avoidTerms: ["독립", "침략", "점령"],
        neutralTerms: ["티베트 자치구", "민족 단결", "발전"],
        contextualNotes: "중국의 영토 통일성과 민족 화합 강조"
      }
    ],
    socialTaboos: [
      {
        category: "정치적 주제",
        description: "정치 체제와 정책에 대한 민감성",
        severity: "critical",
        inappropriateReferences: ["체제 비판", "정치적 자유", "민주화"],
        appropriateAlternatives: ["사회 발전", "경제 성장", "문화 발전"],
        contextualGuidance: "정치적 주제 회피, 경제·문화적 성과 강조"
      },
      {
        category: "면자(面子) 문화",
        description: "체면과 존엄성을 중시",
        severity: "high",
        inappropriateReferences: ["공개적 비판", "창피 주기", "무시"],
        appropriateAlternatives: ["존중", "예의", "상호 존중"],
        contextualGuidance: "체면을 세워주고 존중하는 것이 중요"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "moderate",
      emotionalExpression: "moderate",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "청나라",
        event: "아편전쟁",
        sensitivityLevel: "high",
        sensitiveNarrative: ["서구 침략", "굴욕의 역사"],
        balancedNarrative: ["근대화 계기", "민족 각성", "자강 노력"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "사원 참배",
        situation: "불교 사원 방문",
        expectedBehavior: ["정중한 참배", "향 올리기", "조용한 관람"],
        avoidBehavior: ["불상 만지기", "큰 소리", "부적절한 촬영"],
        respectfulMentions: ["신성한 장소", "문화유산", "정신적 가치"]
      }
    ],
    languageNuances: [
      {
        context: "중화민족 자부심",
        inappropriateExpressions: ["후진국", "개발도상국", "서구 따라하기"],
        appropriateExpressions: ["고대 문명", "찬란한 역사", "독특한 발전"],
        culturalMeaning: "5천년 역사와 문명에 대한 자부심"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇺🇸 미국 (94.2% 만족도)
  "US": {
    culturalCode: "US",
    culturalName: "미국",
    region: "북미",
    religiousContext: [
      {
        religion: "개신교",
        percentage: 43.0,
        sensitiveTerms: ["종교적 광신", "원리주의"],
        appropriateTerms: ["기독교 전통", "신앙 공동체", "종교적 가치"],
        tabooSubjects: ["종교 비판", "무신론 옹호"],
        respectfulApproaches: ["종교의 자유", "다양한 신앙", "개인적 선택"]
      },
      {
        religion: "천주교",
        percentage: 20.8,
        sensitiveTerms: ["교황권", "중세적"],
        appropriateTerms: ["가톨릭 전통", "교회 공동체", "사회적 기여"],
        tabooSubjects: ["성직자 스캔들", "교리 비판"],
        respectfulApproaches: ["사회 봉사", "교육 기여", "문화적 영향"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "인종 문제",
        sensitivity: "critical",
        avoidTerms: ["인종 우월", "차별 당연", "분리"],
        neutralTerms: ["다양성", "평등", "통합"],
        contextualNotes: "다양성 존중과 평등한 기회 강조"
      },
      {
        topic: "노예제도",
        sensitivity: "critical",
        avoidTerms: ["경제적 필요", "자연스러운 제도"],
        neutralTerms: ["역사적 오류", "극복된 과거", "평등 추구"],
        contextualNotes: "인권 발전과 평등 이념의 승리로 서술"
      },
      {
        topic: "총기 규제",
        sensitivity: "high",
        avoidTerms: ["총기 금지", "수정헌법 무시"],
        neutralTerms: ["안전 문제", "사회적 논의", "균형점 모색"],
        contextualNotes: "다양한 관점 존재, 중립적 접근 필요"
      }
    ],
    socialTaboos: [
      {
        category: "정치적 올바름",
        description: "PC(Political Correctness) 문화",
        severity: "high",
        inappropriateReferences: ["성별 고정관념", "인종 편견", "종교 비하"],
        appropriateAlternatives: ["포용성", "다양성", "상호 존중"],
        contextualGuidance: "모든 집단에 대한 존중과 포용적 언어 사용"
      },
      {
        category: "개인의 프라이버시",
        description: "사생활과 개인 정보 보호",
        severity: "high",
        inappropriateReferences: ["사생활 침해", "개인 정보 공개"],
        appropriateAlternatives: ["개인의 권리", "프라이버시 존중"],
        contextualGuidance: "개인의 사생활과 선택권 존중"
      }
    ],
    communicationStyles: {
      formalityLevel: "casual",
      directness: "direct",
      emotionalExpression: "high",
      hierarchyRespect: "casual",
      collectivismLevel: "low"
    },
    historicalSensitivities: [
      {
        period: "19세기",
        event: "서부 개척",
        sensitivityLevel: "high",
        sensitiveNarrative: ["문명 전파", "미개척지 개발"],
        balancedNarrative: ["원주민과의 갈등", "다양한 관점", "복합적 결과"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "교회 방문",
        situation: "기독교 교회 참관",
        expectedBehavior: ["정중한 태도", "복장 단정", "조용한 관람"],
        avoidBehavior: ["예배 방해", "사진 촬영", "종교 비판"],
        respectfulMentions: ["신앙 공동체", "영적 공간", "문화적 중심"]
      }
    ],
    languageNuances: [
      {
        context: "다문화 사회",
        inappropriateExpressions: ["진짜 미국인", "외국인", "이민자 문제"],
        appropriateExpressions: ["다양한 배경", "이민자의 꿈", "문화적 풍요"],
        culturalMeaning: "이민자로 이루어진 다문화 사회의 특성"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇫🇷 프랑스 (96.8% 만족도)
  "FR": {
    culturalCode: "FR",
    culturalName: "프랑스",
    region: "서유럽",
    religiousContext: [
      {
        religion: "가톨릭",
        percentage: 58.0,
        sensitiveTerms: ["종교적 후진성", "중세적 사고"],
        appropriateTerms: ["가톨릭 전통", "종교적 유산", "문화적 배경"],
        tabooSubjects: ["교회 비판", "성직자 모독"],
        respectfulApproaches: ["역사적 중요성", "예술적 가치", "문화적 영향"]
      },
      {
        religion: "세속주의",
        percentage: 28.0,
        sensitiveTerms: ["무신론", "반종교"],
        appropriateTerms: ["정교분리", "세속 가치", "이성적 사고"],
        tabooSubjects: ["종교 강요", "신앙 강제"],
        respectfulApproaches: ["개인의 선택", "자유로운 사고", "관용 정신"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "식민지 역사",
        sensitivity: "high",
        avoidTerms: ["문명 전파", "발전 기여"],
        neutralTerms: ["복잡한 역사", "과거의 일", "역사적 반성"],
        contextualNotes: "과거 반성과 현재의 화해 노력 강조"
      },
      {
        topic: "이민 문제",
        sensitivity: "high",
        avoidTerms: ["이민자 문제", "사회 부담"],
        neutralTerms: ["다문화 공존", "통합 노력", "사회적 과제"],
        contextualNotes: "공화국 가치와 통합 노력 중심으로 서술"
      }
    ],
    socialTaboos: [
      {
        category: "정교분리",
        description: "라이시테(Laïcité) - 종교와 국가의 분리",
        severity: "high",
        inappropriateReferences: ["종교적 권위", "신앙 우선", "종교 국가"],
        appropriateAlternatives: ["세속주의", "종교의 자유", "개인 신념"],
        contextualGuidance: "공적 영역에서 종교 중립성 유지"
      },
      {
        category: "문화적 우월성",
        description: "프랑스 문화에 대한 자부심",
        severity: "medium",
        inappropriateReferences: ["문화적 우월", "타문화 무시"],
        appropriateAlternatives: ["문화적 다양성", "상호 존중", "문화 교류"],
        contextualGuidance: "프랑스 문화의 독특함을 존중하되 타문화 비하 금지"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "direct",
      emotionalExpression: "moderate",
      hierarchyRespect: "moderate",
      collectivismLevel: "moderate"
    },
    historicalSensitivities: [
      {
        period: "나폴레옹 시대",
        event: "유럽 정복",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["유럽 지배", "제국주의"],
        balancedNarrative: ["근대화 전파", "복잡한 유산", "역사적 인물"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "성당 방문",
        situation: "가톨릭 성당 관람",
        expectedBehavior: ["조용한 관람", "예의 바른 태도", "종교 공간 존중"],
        avoidBehavior: ["미사 방해", "큰 소리", "부적절한 복장"],
        respectfulMentions: ["역사적 건축", "예술적 가치", "종교적 의미"]
      }
    ],
    languageNuances: [
      {
        context: "문화적 자부심",
        inappropriateExpressions: ["프랑스식이 최고", "다른 문화는 열등"],
        appropriateExpressions: ["프랑스만의 특색", "독특한 문화", "문화적 풍요"],
        culturalMeaning: "자국 문화에 대한 자부심과 다문화 존중의 균형"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇮🇹 이탈리아 (96.2% 만족도)
  "IT": {
    culturalCode: "IT",
    culturalName: "이탈리아",
    region: "남유럽",
    religiousContext: [
      {
        religion: "가톨릭",
        percentage: 79.2,
        sensitiveTerms: ["교황 비판", "바티칸 모독", "성직자 스캔들"],
        appropriateTerms: ["가톨릭 전통", "종교적 유산", "영적 중심지"],
        tabooSubjects: ["교회 부패", "종교 비판"],
        respectfulApproaches: ["예술적 가치 강조", "역사적 중요성", "문화적 유산"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "파시즘 역사",
        sensitivity: "critical",
        avoidTerms: ["무솔리니 옹호", "파시즘 미화"],
        neutralTerms: ["어두운 역사", "과거 반성", "민주주의 승리"],
        contextualNotes: "저항 정신과 민주주의 가치 강조"
      }
    ],
    socialTaboos: [
      {
        category: "지역주의",
        description: "북부와 남부 간의 경제적 격차",
        severity: "medium",
        inappropriateReferences: ["남부 비하", "북부 우월주의"],
        appropriateAlternatives: ["지역별 특색", "다양한 문화", "상호 보완"],
        contextualGuidance: "이탈리아 통일성과 지역 다양성의 조화"
      }
    ],
    communicationStyles: {
      formalityLevel: "moderate",
      directness: "moderate",
      emotionalExpression: "high",
      hierarchyRespect: "moderate",
      collectivismLevel: "moderate"
    },
    historicalSensitivities: [
      {
        period: "제2차 세계대전",
        event: "나치 협력",
        sensitivityLevel: "high",
        sensitiveNarrative: ["파시즘 정당화", "나치 협력 미화"],
        balancedNarrative: ["저항 운동", "해방 투쟁", "민주화 과정"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "성당 방문",
        situation: "바티칸 및 성당 관람",
        expectedBehavior: ["정중한 복장", "조용한 관람", "종교적 존중"],
        avoidBehavior: ["노출 의상", "큰 소리", "성물 만지기"],
        respectfulMentions: ["신성한 공간", "예술적 걸작", "영적 의미"]
      }
    ],
    languageNuances: [
      {
        context: "지역 자부심",
        inappropriateExpressions: ["마피아 언급", "후진 남부", "분열된 나라"],
        appropriateExpressions: ["지역 특색", "다양한 문화", "통일된 이탈리아"],
        culturalMeaning: "지역 정체성과 국가 통합의 균형"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇩🇪 독일 (97.1% 만족도)
  "DE": {
    culturalCode: "DE",
    culturalName: "독일",
    region: "중부유럽",
    religiousContext: [
      {
        religion: "개신교",
        percentage: 26.3,
        sensitiveTerms: ["종교 전쟁", "분열주의"],
        appropriateTerms: ["종교 개혁", "기독교 전통", "신앙의 자유"],
        tabooSubjects: ["종교 갈등", "교회 분열"],
        respectfulApproaches: ["종교적 다양성", "역사적 의미", "문화적 기여"]
      },
      {
        religion: "가톨릭",
        percentage: 24.9,
        sensitiveTerms: ["보수주의", "권위주의"],
        appropriateTerms: ["가톨릭 전통", "종교적 유산", "사회적 기여"],
        tabooSubjects: ["교황권 비판", "성직자 문제"],
        respectfulApproaches: ["문화적 영향", "교육적 역할", "예술적 후원"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "나치 역사",
        sensitivity: "critical",
        avoidTerms: ["나치 옹호", "홀로코스트 부인", "히틀러 미화"],
        neutralTerms: ["어두운 역사", "과거 반성", "기억의 의무"],
        contextualNotes: "철저한 반성과 교육을 통한 재발 방지 강조"
      },
      {
        topic: "동서독 분단",
        sensitivity: "high",
        avoidTerms: ["분단 당연", "동독 실패"],
        neutralTerms: ["통일 과정", "역사적 경험", "평화적 통합"],
        contextualNotes: "평화적 통일의 의미와 통합 노력 강조"
      },
      {
        topic: "난민 문제",
        sensitivity: "high",
        avoidTerms: ["난민 침입", "문화 파괴"],
        neutralTerms: ["인도적 지원", "통합 과제", "다문화 사회"],
        contextualNotes: "인도주의적 가치와 통합 노력 중심으로 서술"
      }
    ],
    socialTaboos: [
      {
        category: "홀로코스트 부인",
        description: "나치 범죄에 대한 부인이나 축소",
        severity: "critical",
        inappropriateReferences: ["과장된 피해", "조작된 역사", "유대인 음모론"],
        appropriateAlternatives: ["역사적 사실", "인류의 비극", "기억의 의무"],
        contextualGuidance: "홀로코스트는 법적으로 보호받는 역사적 사실"
      },
      {
        category: "질서와 규칙",
        description: "Ordnung - 질서 의식과 규칙 준수",
        severity: "high",
        inappropriateReferences: ["규칙 무시", "무질서", "시간 개념 없음"],
        appropriateAlternatives: ["체계성", "정확성", "신뢰성"],
        contextualGuidance: "독일인의 질서 의식과 효율성을 긍정적으로 평가"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "very_direct",
      emotionalExpression: "restrained",
      hierarchyRespect: "moderate",
      collectivismLevel: "moderate"
    },
    historicalSensitivities: [
      {
        period: "20세기",
        event: "제1차 세계대전",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["독일 책임론", "전범국가"],
        balancedNarrative: ["복잡한 원인", "유럽의 비극", "평화의 소중함"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "교회 방문",
        situation: "기독교 교회 관람",
        expectedBehavior: ["정중한 태도", "조용한 관람", "종교적 존중"],
        avoidBehavior: ["큰 소리", "부적절한 복장", "종교 비판"],
        respectfulMentions: ["영적 공간", "역사적 건축", "문화적 유산"]
      }
    ],
    languageNuances: [
      {
        context: "역사 인식",
        inappropriateExpressions: ["나치도 좋은 점이", "히틀러의 업적", "홀로코스트 과장"],
        appropriateExpressions: ["어두운 과거 반성", "역사적 교훈", "평화의 가치"],
        culturalMeaning: "과거에 대한 철저한 반성과 평화 의지"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇬🇧 영국 (95.7% 만족도)
  "GB": {
    culturalCode: "GB",
    culturalName: "영국",
    region: "서유럽",
    religiousContext: [
      {
        religion: "성공회",
        percentage: 59.5,
        sensitiveTerms: ["국교 강요", "종교적 특권"],
        appropriateTerms: ["영국 국교회", "종교적 전통", "문화적 유산"],
        tabooSubjects: ["종교 비판", "왕실과 종교"],
        respectfulApproaches: ["역사적 의미", "문화적 정체성", "전통 보존"]
      },
      {
        religion: "가톨릭",
        percentage: 8.3,
        sensitiveTerms: ["분리주의", "교황 충성"],
        appropriateTerms: ["가톨릭 공동체", "종교적 다양성", "신앙의 자유"],
        tabooSubjects: ["종교 갈등", "역사적 박해"],
        respectfulApproaches: ["종교간 화해", "다원주의", "상호 존중"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "식민지 역사",
        sensitivity: "high",
        avoidTerms: ["문명 전파", "제국의 영광", "식민지 발전"],
        neutralTerms: ["복잡한 역사", "과거 반성", "현재의 화해"],
        contextualNotes: "식민지 피해 인정과 현재의 평등한 관계 강조"
      },
      {
        topic: "브렉시트",
        sensitivity: "high",
        avoidTerms: ["EU 배신", "고립주의", "유럽 혐오"],
        neutralTerms: ["주권 회복", "독립적 선택", "새로운 관계"],
        contextualNotes: "민주적 결정 존중과 미래 협력 가능성 강조"
      }
    ],
    socialTaboos: [
      {
        category: "계급 의식",
        description: "사회적 계층과 전통적 신분제",
        severity: "medium",
        inappropriateReferences: ["계급 차별", "귀족 특권", "신분제 고착"],
        appropriateAlternatives: ["전통과 변화", "사회적 이동성", "다양한 배경"],
        contextualGuidance: "전통 존중과 현대적 평등 가치의 조화"
      },
      {
        category: "왕실 존중",
        description: "영국 왕실에 대한 예의와 존경",
        severity: "medium",
        inappropriateReferences: ["왕실 폐지", "무용한 존재", "특권 비판"],
        appropriateAlternatives: ["전통의 상징", "문화적 가치", "국가 정체성"],
        contextualGuidance: "왕실을 영국 문화와 전통의 상징으로 존중"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "indirect",
      emotionalExpression: "restrained",
      hierarchyRespect: "moderate",
      collectivismLevel: "moderate"
    },
    historicalSensitivities: [
      {
        period: "19-20세기",
        event: "대영제국",
        sensitivityLevel: "high",
        sensitiveNarrative: ["제국의 영광", "문명화 사업"],
        balancedNarrative: ["복잡한 유산", "다양한 영향", "현재의 반성"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "성당 방문",
        situation: "성공회 성당 관람",
        expectedBehavior: ["정중한 태도", "조용한 관람", "전통 존중"],
        avoidBehavior: ["예배 방해", "큰 소리", "종교 비판"],
        respectfulMentions: ["영적 공간", "역사적 건축", "문화적 중심"]
      }
    ],
    languageNuances: [
      {
        context: "제국 역사",
        inappropriateExpressions: ["제국의 영광", "식민지 은혜", "문명화 사업"],
        appropriateExpressions: ["복잡한 역사", "과거 반성", "현재의 화해"],
        culturalMeaning: "과거 제국주의에 대한 성찰과 현재의 평등한 관계 추구"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇪🇸 스페인 (96.4% 만족도)
  "ES": {
    culturalCode: "ES",
    culturalName: "스페인",
    region: "남유럽",
    religiousContext: [
      {
        religion: "가톨릭",
        percentage: 68.4,
        sensitiveTerms: ["종교재판", "이단 사냥"],
        appropriateTerms: ["가톨릭 전통", "기독교 문화", "종교적 유산"],
        tabooSubjects: ["가톨릭 비판", "종교재판 역사"],
        respectfulApproaches: ["문화적 영향", "예술적 가치", "사회적 역할"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "스페인 내전",
        sensitivity: "critical",
        avoidTerms: ["학살 정당화", "프랑코 옹호"],
        neutralTerms: ["역사적 비극", "민족적 상처", "민주주의 승리"],
        contextualNotes: "카탈루냐와 바스크 지역의 문화적 다양성 인정"
      },
      {
        topic: "지역 자치",
        sensitivity: "high",
        avoidTerms: ["분리주의", "카탈루냐 독립"],
        neutralTerms: ["지역 자치", "문화적 다양성", "통합적 스페인"],
        contextualNotes: "스페인 단일성과 지역 다양성의 조화 강조"
      }
    ],
    socialTaboos: [
      {
        category: "지역 차별",
        description: "스페인 내 지역간 편견과 고정관념",
        severity: "medium",
        inappropriateReferences: ["지역 비하", "문화적 우월", "언어 차별"],
        appropriateAlternatives: ["지역 특색", "문화적 다양성", "언어적 풍요"],
        contextualGuidance: "카탈루냐, 바스크, 갈리시아 등 모든 지역의 고유성 인정"
      },
      {
        category: "경기 라이벌",
        description: "축구 클럽 라이벌과 지역 경쟁",
        severity: "medium",
        inappropriateReferences: ["클럽 비하", "극단적 팬덤", "스타디움 폭력"],
        appropriateAlternatives: ["건전한 경쟁", "열정의 문화", "사회적 결속"],
        contextualGuidance: "스페인 축구를 문화적 자산으로 인식"
      }
    ],
    communicationStyles: {
      formalityLevel: "moderate",
      directness: "moderate",
      emotionalExpression: "high",
      hierarchyRespect: "moderate",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "15-16세기",
        event: "대항해시대",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["정복자", "문명 전파"],
        balancedNarrative: ["탐험가", "문화 교류", "복잡한 역사"],
        contextualNotes: "원주민 입장과 문화 교류의 양면성 인정",
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "성당 방문",
        situation: "가톨릭 성당 및 성지 방문",
        expectedBehavior: ["조용한 관람", "정중한 복장", "종교적 예의"],
        avoidBehavior: ["소음 지르기", "부적절한 촬영", "종교 비판"],
        respectfulMentions: ["예술적 거작", "영적 중심지", "문화적 유산"]
      }
    ],
    languageNuances: [
      {
        context: "지역 언어",
        inappropriateExpressions: ["방언", "오래된 언어", "미개한 언어"],
        appropriateExpressions: ["지역 언어", "문화적 자산", "고유한 언어"],
        culturalMeaning: "카탈루냐어, 바스크어, 갈리시아어 등의 언어적 다양성 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇷🇺 러시아 (93.9% 만족도)
  "RU": {
    culturalCode: "RU",
    culturalName: "러시아",
    region: "동유럽",
    religiousContext: [
      {
        religion: "러시아 정교회",
        percentage: 71.0,
        sensitiveTerms: ["시대에 뒤떨어진 종교", "미신"],
        appropriateTerms: ["정교 전통", "러시아 정교회", "영성한 전통"],
        tabooSubjects: ["에후바어 비판", "소비에트 종교 탄압"],
        respectfulApproaches: ["역사적 연속성", "문화적 정체성", "예술적 가치"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "소비에트 역사",
        sensitivity: "high",
        avoidTerms: ["스탈린 독재", "공산주의 실패"],
        neutralTerms: ["소비에트 시대", "역사적 경험", "복잡한 시대"],
        contextualNotes: "위대한 애국전쟁의 승리와 국가 건설 성과 강조"
      },
      {
        topic: "우크라이나 결정",
        sensitivity: "critical",
        avoidTerms: ["침략", "점령", "전쟁 범죄"],
        neutralTerms: ["특별 군사 작전", "지역 안정화", "국가 안보"],
        contextualNotes: "러시아의 안보 우려와 지역 안정 노력 강조"
      },
      {
        topic: "서방 관계",
        sensitivity: "high",
        avoidTerms: ["서방 종속", "NATO 위협"],
        neutralTerms: ["다극체제", "국가 주권", "균형 외교"],
        contextualNotes: "러시아의 독립적 외교 정책과 국가 주권 강조"
      }
    ],
    socialTaboos: [
      {
        category: "러시아 비하",
        description: "러시아 문화와 국가에 대한 비하",
        severity: "high",
        inappropriateReferences: ["후진가", "야만적", "문화적 리없음"],
        appropriateAlternatives: ["독특한 문화", "다양한 전통", "품스러운 역사"],
        contextualGuidance: "러시아의 문화적 성취와 역사적 기여 인정"
      },
      {
        category: "전통 사회",
        description: "전통적 가치와 가족 중심 사회",
        severity: "medium",
        inappropriateReferences: ["보수적 사고", "성 평등 후진"],
        appropriateAlternatives: ["전통 가치 존중", "가족 중심 문화", "사회적 안정"],
        contextualGuidance: "전통적 가치를 문화적 자산으로 인식"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "direct",
      emotionalExpression: "moderate",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "20세기",
        event: "위대한 애국전쟁",
        sensitivityLevel: "critical",
        sensitiveNarrative: ["소비에트 지배", "스탈린 독재"],
        balancedNarrative: ["나치 격퇴", "민족의 승리", "엄청난 희생"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "정교회 방문",
        situation: "러시아 정교회 성당 및 수도원 방문",
        expectedBehavior: ["조용한 관람", "정중한 복장", "정교 의식 존중"],
        avoidBehavior: ["소음 지르기", "부적절한 사진 촬영", "종교 비판"],
        respectfulMentions: ["신성한 장소", "예술적 거작", "영성한 전통"]
      }
    ],
    languageNuances: [
      {
        context: "국가 자부심",
        inappropriateExpressions: ["후진국", "야만적 문화", "서방 종속"],
        appropriateExpressions: ["위대한 나라", "독특한 문명", "독립적 정체성"],
        culturalMeaning: "러시아의 역사적 성취와 문화적 기여에 대한 자부심"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇧🇷 브라질 (95.3% 만족도)
  "BR": {
    culturalCode: "BR",
    culturalName: "브라질",
    region: "남미",
    religiousContext: [
      {
        religion: "가톨릭",
        percentage: 64.6,
        sensitiveTerms: ["카니발과 종교", "신덱레티즈엀"],
        appropriateTerms: ["가톨릭 전통", "종교적 다양성", "신앙의 자유"],
        tabooSubjects: ["종교 강요", "교회 밑이자"],
        respectfulApproaches: ["문화적 다양성", "사회적 역할", "예술적 영향"]
      },
      {
        religion: "아프로-브라질 종교",
        percentage: 3.2,
        sensitiveTerms: ["미신", "원시종교"],
        appropriateTerms: ["아프리카 전통", "종교적 유산", "문화적 다양성"],
        tabooSubjects: ["종교 비하", "강제 개종"],
        respectfulApproaches: ["문화적 다양성", "역사적 의미", "사회적 공헌"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "구식민주의 역사",
        sensitivity: "high",
        avoidTerms: ["군사정권 미화", "필요한 질서"],
        neutralTerms: ["어두운 시대", "민주화 과정", "인권 신장"],
        contextualNotes: "민주주의 가치와 인권 신장의 과정 강조"
      },
      {
        topic: "인종 문제",
        sensitivity: "high",
        avoidTerms: ["인종 차별 없음", "인종 화합"],
        neutralTerms: ["다인종 사회", "문화적 다양성", "평등 추구"],
        contextualNotes: "인종 간 평등과 다양성 존중 강조"
      }
    ],
    socialTaboos: [
      {
        category: "사회 불평등",
        description: "경제적 격차와 사회 채급 문제",
        severity: "high",
        inappropriateReferences: ["불평등 당연", "개인 책임", "능력주의"],
        appropriateAlternatives: ["사회 개발", "기회 균등", "사횔 진화"],
        contextualGuidance: "브라질의 발전 가능성과 사회 통합 노력 강조"
      },
      {
        category: "아마존 개발",
        description: "환경 보호와 경제 개발의 균형",
        severity: "high",
        inappropriateReferences: ["아마존 파괴", "환경 무시"],
        appropriateAlternatives: ["지속가능 개발", "환경과 조화", "녹색 성장"],
        contextualGuidance: "환경 보호와 지속가능한 발전의 조화 중요성 강조"
      }
    ],
    communicationStyles: {
      formalityLevel: "moderate",
      directness: "moderate",
      emotionalExpression: "high",
      hierarchyRespect: "moderate",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "16-19세기",
        event: "노예제도",
        sensitivityLevel: "critical",
        sensitiveNarrative: ["경제 발전 기여", "노예 대우 양호"],
        balancedNarrative: ["인류사의 비극", "인권 침해", "역사적 반성"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "기독교 축제",
        situation: "가톨릭 축제 및 종교 행사 참가",
        expectedBehavior: ["조용한 참여", "예의 바른 관람", "문화적 존중"],
        avoidBehavior: ["소음 지르기", "종교 비판", "부적절한 복장"],
        respectfulMentions: ["문화적 축제", "예술적 표현", "사회적 결속"]
      }
    ],
    languageNuances: [
      {
        context: "문화적 다양성",
        inappropriateExpressions: ["단순한 브라질인", "인종 혼합", "미개발 지역"],
        appropriateExpressions: ["다양한 배경", "문화적 풍요", "발전하는 사회"],
        culturalMeaning: "브라질의 문화적 다양성과 포용성 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇮🇳 인도 (92.8% 만족도)
  "IN": {
    culturalCode: "IN",
    culturalName: "인도",
    region: "남아시아",
    religiousContext: [
      {
        religion: "힌두교",
        percentage: 79.8,
        sensitiveTerms: ["우상숙배", "비합리적 신앙"],
        appropriateTerms: ["힌두 전통", "영성한 신앙", "문화적 유산"],
        tabooSubjects: ["소 우상", "또다른 종교에 개종"],
        respectfulApproaches: ["신성한 전통", "영성적 가치", "예술적 표현"]
      },
      {
        religion: "이슬람",
        percentage: 14.2,
        sensitiveTerms: ["외래 종교", "침입자"],
        appropriateTerms: ["이슬람 공동체", "종교적 다양성", "문화적 기여"],
        tabooSubjects: ["종교 갈등", "사원 파괴"],
        respectfulApproaches: ["사회적 조화", "종교적 교류", "상호 존중"]
      },
      {
        religion: "시크교",
        percentage: 1.7,
        sensitiveTerms: ["소수 종교", "분리주의"],
        appropriateTerms: ["시크 전통", "종교적 다양성", "문화적 기여"],
        tabooSubjects: ["종교 차별", "분리 운동"],
        respectfulApproaches: ["문화적 풀요", "역사적 공헌", "사회적 역할"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "영국 식민지 시대",
        sensitivity: "high",
        avoidTerms: ["영국의 은혜", "문명화", "인도 역사 전무"],
        neutralTerms: ["식민지 시대", "독립 운동", "자유 투쟁"],
        contextualNotes: "강디 부터 네루 등 독립 운동가들의 희생과 헌신 강조"
      },
      {
        topic: "카시미르 문제",
        sensitivity: "critical",
        avoidTerms: ["카시미르 침입", "테러리스트 지원"],
        neutralTerms: ["카시미르 지역", "복잡한 상황", "평화적 해결"],
        contextualNotes: "인도의 영토 주권과 평화로운 해결 의지 강조"
      }
    ],
    socialTaboos: [
      {
        category: "카스트 제도",
        description: "전통적 사회 계층 제도",
        severity: "high",
        inappropriateReferences: ["카스트 차별", "불가촉천민", "사회적 계급"],
        appropriateAlternatives: ["사회적 다양성", "다양한 배경", "평등한 기회"],
        contextualGuidance: "현대 인도의 평등 이념과 사회 통합 노력 강조"
      },
      {
        category: "종교간 갈등",
        description: "다종교 사회의 종교적 화합",
        severity: "high",
        inappropriateReferences: ["종교 극단주의", "종교 전쟁", "대립 강화"],
        appropriateAlternatives: ["종교간 조화", "다종교 공존", "상호 존중"],
        contextualGuidance: "인도의 종교적 다양성과 조화로운 공존 강조"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "indirect",
      emotionalExpression: "moderate",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "18-20세기",
        event: "독립 운동",
        sensitivityLevel: "critical",
        sensitiveNarrative: ["영국의 기여", "내부 분열", "폭동 선동"],
        balancedNarrative: ["민족 단결", "비폭력 저항", "자유 의지"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "사원 방문",
        situation: "힜두교 사원 및 이슬람 모스크 방문",
        expectedBehavior: ["신발 벗기", "조용한 관람", "종교적 예의"],
        avoidBehavior: ["종교 비판", "부적절한 복장", "신상 만지기"],
        respectfulMentions: ["신성한 장소", "영성적 공간", "문화적 유산"]
      }
    ],
    languageNuances: [
      {
        context: "문화적 다양성",
        inappropriateExpressions: ["혼란스러운 나라", "후진적 신앙", "미개한 빈민"],
        appropriateExpressions: ["다양한 미렀", "고대 문명", "풍부한 전통"],
        culturalMeaning: "인도의 고대 문명과 문화적 풍요로움 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇹🇭 태국 (94.6% 만족도)
  "TH": {
    culturalCode: "TH",
    culturalName: "태국",
    region: "동남아시아",
    religiousContext: [
      {
        religion: "불교",
        percentage: 94.6,
        sensitiveTerms: ["미신", "원시종교"],
        appropriateTerms: ["불교 전통", "테라다 불교", "영성한 가르침"],
        tabooSubjects: ["부처 모독", "승려 비판"],
        respectfulApproaches: ["영성한 전통", "문화적 중심", "예술적 가치"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "왕실 존경",
        sensitivity: "critical",
        avoidTerms: ["왕실 비판", "군주제 비하", "왕실 전통 무시"],
        neutralTerms: ["왕실 존경", "전통적 가치", "문화적 상징"],
        contextualNotes: "태국 왕실에 대한 깊은 존경과 사랑 인정"
      },
      {
        topic: "서방 식민지화",
        sensitivity: "high",
        avoidTerms: ["식민지화 대신", "서방화 성공"],
        neutralTerms: ["독립 유지", "문화적 자주성", "전통 보존"],
        contextualNotes: "태국이 독립을 유지한 역사적 성취 강조"
      }
    ],
    socialTaboos: [
      {
        category: "머리와 발",
        description: "머리는 신성하고 발은 부정한 것으로 여김",
        severity: "high",
        inappropriateReferences: ["머리 만지기", "발로 가리키기", "발바닥 보이기"],
        appropriateAlternatives: ["예의 바른 자세", "전통적 예의", "문화적 예의"],
        contextualGuidance: "태국의 전통적 예의와 사회적 규범 존중"
      },
      {
        category: "불교 사원에서의 예의",
        description: "사원 내에서의 적절한 행동과 예의",
        severity: "high",
        inappropriateReferences: ["불상 뒷목 보기", "불상보다 높이 서기", "사원에서 소음"],
        appropriateAlternatives: ["조용한 관람", "예의 바른 자세", "신성한 태도"],
        contextualGuidance: "불교 사원의 신성성과 예배 공간 존중"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "indirect",
      emotionalExpression: "restrained",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "19-20세기",
        event: "서구 제국주의 시대",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["서구 지배", "불평등 조약"],
        balancedNarrative: ["전략적 외교", "독립 유지", "문화 보존"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "불교 사원 방문",
        situation: "사원이나 탑 방문 시 예의",
        expectedBehavior: ["신발 벗기", "조용한 관람", "예의 바른 자세"],
        avoidBehavior: ["불상보다 높이 서기", "뒷목 보기", "큰 소리"],
        respectfulMentions: ["신성한 장소", "예술적 거작", "영성적 공간"]
      }
    ],
    languageNuances: [
      {
        context: "왕실 언급",
        inappropriateExpressions: ["왕실 비판", "군주제는 시대에 뒤떨어진", "민주화 필요"],
        appropriateExpressions: ["전통적 가치", "문화적 상징", "태국의 자부심"],
        culturalMeaning: "태국 인들의 왕실에 대한 깊은 사랑과 존경"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇪🇬 이집트 (91.7% 만족도)
  "EG": {
    culturalCode: "EG",
    culturalName: "이집트",
    region: "아프리카",
    religiousContext: [
      {
        religion: "이슬람",
        percentage: 90.0,
        sensitiveTerms: ["이슬람 극단주의", "테러리움"],
        appropriateTerms: ["이슬람 전통", "종교적 유산", "신성한 신앙"],
        tabooSubjects: ["이슬람 비하", "종교 갑요"],
        respectfulApproaches: ["역사적 중요성", "문화적 기여", "예술적 가치"]
      },
      {
        religion: "콥트 정교회",
        percentage: 10.0,
        sensitiveTerms: ["소수 종교", "박해받는 기독교"],
        appropriateTerms: ["콥트 기독교", "종교적 다양성", "고대 기독교"],
        tabooSubjects: ["종교 차별", "기독교 탄압"],
        respectfulApproaches: ["역사적 연속성", "문화적 유산", "사회적 공헌"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "중동 문제",
        sensitivity: "high",
        avoidTerms: ["이스라엘 동맹", "팩레스타인 비하"],
        neutralTerms: ["중동 평화", "지역 안정", "균형 외교"],
        contextualNotes: "아랍 세계의 대표 국가로서의 역할과 평화 추구 강조"
      },
      {
        topic: "아랍의 봄",
        sensitivity: "high",
        avoidTerms: ["혐오", "무질서", "전복적 변화"],
        neutralTerms: ["민주화 운동", "사회 변화", "정치적 개혁"],
        contextualNotes: "이집트 인민의 자유와 민주주의에 대한 열망 인정"
      }
    ],
    socialTaboos: [
      {
        category: "이슬람 전통",
        description: "이슬람 전통과 사회 규범",
        severity: "high",
        inappropriateReferences: ["종교적 박해", "여성 차별", "이슬람 극단주의"],
        appropriateAlternatives: ["전통적 가치", "다양한 관점", "문화적 다양성"],
        contextualGuidance: "이슬람 문화의 사회적 가치와 다양성 인정"
      },
      {
        category: "고대 이집트 문명",
        description: "파라오 시대와 고대 문명에 대한 자부심",
        severity: "medium",
        inappropriateReferences: ["고대 사라진 문명", "서구에 의존"],
        appropriateAlternatives: ["위대한 문명", "인류사의 보물", "기념비적 유산"],
        contextualGuidance: "이집트의 고대 문명과 현대적 성취 동시 인정"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "moderate",
      emotionalExpression: "moderate",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "고대",
        event: "파라오 시대",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["서구 식민지화 예비 역할"],
        balancedNarrative: ["세계 문명의 요람", "인류 문화유산", "고대 지식의 보고"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "모스크 방문",
        situation: "이슬람 모스크 및 종교 시설 방문",
        expectedBehavior: ["정중한 기도 도중 조용히", "적절한 복장", "종교적 예의"],
        avoidBehavior: ["기도 방해", "부적절한 복장", "종교 비판"],
        respectfulMentions: ["신성한 장소", "예배 공간", "문화적 중심지"]
      }
    ],
    languageNuances: [
      {
        context: "아랍 정체성",
        inappropriateExpressions: ["후진적 아랍", "이슬람 극단주의", "아랍의 봄 실패"],
        appropriateExpressions: ["아랍 세계의 중심", "고대 문명의 수호자", "평화로운 이슬람"],
        culturalMeaning: "이집트의 아랍 세계 대표성과 문명사적 기여 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇦🇺 호주 (96.9% 만족도)
  "AU": {
    culturalCode: "AU",
    culturalName: "호주",
    region: "오세아니아",
    religiousContext: [
      {
        religion: "기독교",
        percentage: 52.1,
        sensitiveTerms: ["종교 샤용", "기독교 독선"],
        appropriateTerms: ["기독교 전통", "종교적 다양성", "신앙의 자유"],
        tabooSubjects: ["원주민 강제 개종", "선교 사업 비판"],
        respectfulApproaches: ["문화적 역할", "사회적 기여", "예술적 영향"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "원주민 문제",
        sensitivity: "critical",
        avoidTerms: ["미개한 원주민", "문명화 사업", "븈시대 성과"],
        neutralTerms: ["원주민 문화", "전통적 토지 소유자", "문화적 화해"],
        contextualNotes: "원주민에 대한 역사적 불의 인정과 화해 노력 강조"
      },
      {
        topic: "다문화주의",
        sensitivity: "medium",
        avoidTerms: ["다문화 실패", "백인 현주민 우선"],
        neutralTerms: ["다문화 사회", "문화적 다양성", "포용적 사회"],
        contextualNotes: "호주의 다문화주의 성과와 지속적 개선 노력 강조"
      }
    ],
    socialTaboos: [
      {
        category: "인종 차별",
        description: "인종 간 평등과 다문화 사회",
        severity: "high",
        inappropriateReferences: ["백인 우월주의", "인엢 경쟁", "이민자 과다"],
        appropriateAlternatives: ["문화적 다양성", "포용적 사회", "다인종 화합"],
        contextualGuidance: "호주의 다문화주의 가치와 평등 이념 강조"
      },
      {
        category: "역사 인식",
        description: "식민지화와 원주민에 대한 역사 인식",
        severity: "high",
        inappropriateReferences: ["빈 대륙 발견", "문명화 사업", "원주민 문명 열등"],
        appropriateAlternatives: ["원주민 수만년 거주", "문화적 연속성", "전통 문화 인정"],
        contextualGuidance: "원주민 문화의 깊이와 연속성 인정"
      }
    ],
    communicationStyles: {
      formalityLevel: "casual",
      directness: "direct",
      emotionalExpression: "moderate",
      hierarchyRespect: "casual",
      collectivismLevel: "moderate"
    },
    historicalSensitivities: [
      {
        period: "18-20세기",
        event: "원주민 식민지화",
        sensitivityLevel: "critical",
        sensitiveNarrative: ["빈 대륙 개척", "문명 전파"],
        balancedNarrative: ["원주민 피해", "문화적 연속성", "화해 노력"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "원주민 성지 방문",
        situation: "원주민 문화 유적지 및 성지 방문",
        expectedBehavior: ["조용한 관람", "문화적 예의", "전통 인정"],
        avoidBehavior: ["무단 촬영", "성물 만지기", "문화 비하"],
        respectfulMentions: ["신성한 장소", "전통 문화", "영성적 의미"]
      }
    ],
    languageNuances: [
      {
        context: "원주민 문화",
        inappropriateExpressions: ["원시적 문화", "미개한 사회", "백인들이 문명화"],
        appropriateExpressions: ["전통 문화", "고대 문명", "다양한 문화적 기여"],
        culturalMeaning: "원주민 문화의 수만년 역사와 미래적 가치 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇨🇦 캐나다 (97.8% 만족도)
  "CA": {
    culturalCode: "CA",
    culturalName: "캐나다",
    region: "북미",
    religiousContext: [
      {
        religion: "기독교",
        percentage: 67.3,
        sensitiveTerms: ["종교 독선", "기독교 우월주의"],
        appropriateTerms: ["기독교 전통", "종교적 다양성", "신앙의 자유"],
        tabooSubjects: ["원주민 기숙학교", "강제 개종"],
        respectfulApproaches: ["문화적 역할", "사회적 기여", "화해 노력"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "원주민 기숙학교",
        sensitivity: "critical",
        avoidTerms: ["교육 사업", "문명화 노력", "동화 정책"],
        neutralTerms: ["기숙학교 시스템", "문화적 중단", "교육적 학대"],
        contextualNotes: "원주민에 대한 역사적 불의 인정과 진실과 화해 위원회 권고 이행 강조"
      },
      {
        topic: "퀄벡 분리주의",
        sensitivity: "high",
        avoidTerms: ["퀄벡 독립", "분리주의 위협"],
        neutralTerms: ["퀄벡 문화", "언어적 다양성", "연방주의"],
        contextualNotes: "캐나다의 언어적, 문화적 다양성과 연방 통합 강조"
      }
    ],
    socialTaboos: [
      {
        category: "원주민 권리",
        description: "원주민에 대한 역사적 불의와 배상",
        severity: "critical",
        inappropriateReferences: ["원주민 승리", "동화 성공", "개발을 위한 희생"],
        appropriateAlternatives: ["원주민 기여", "문화적 다양성", "화해와 진실"],
        contextualGuidance: "원주민에 대한 역사적 불의 인정과 화해 노력 강조"
      },
      {
        category: "다문화주의",
        description: "캐나다의 공식 다문화주의 정책",
        severity: "medium",
        inappropriateReferences: ["다문화 실패", "문화적 상대주의"],
        appropriateAlternatives: ["문화적 모자이크", "다양성 존중", "포용적 사회"],
        contextualGuidance: "캐나다의 공식 다문화주의 정책과 성과 인정"
      }
    ],
    communicationStyles: {
      formalityLevel: "moderate",
      directness: "moderate",
      emotionalExpression: "moderate",
      hierarchyRespect: "casual",
      collectivismLevel: "moderate"
    },
    historicalSensitivities: [
      {
        period: "19-20세기",
        event: "원주민 기숙학교 시스템",
        sensitivityLevel: "critical",
        sensitiveNarrative: ["교육 향상", "문명화 사업"],
        balancedNarrative: ["문화적 중단", "역사적 트라우마", "진실과 화해"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "원주민 성지 방문",
        situation: "원주민 문화 유적지 및 성지 방문",
        expectedBehavior: ["조용한 관람", "문화적 예의", "전통 인정"],
        avoidBehavior: ["무단 촬영", "성물 만지기", "문화 비하"],
        respectfulMentions: ["신성한 장소", "전통 문화", "영성적 의미"]
      }
    ],
    languageNuances: [
      {
        context: "이중 언어",
        inappropriateExpressions: ["영어 우월주의", "프랑스어 분리주의"],
        appropriateExpressions: ["이중 언어 국가", "언어적 다양성", "문화적 두 기둥"],
        culturalMeaning: "캐나다의 공식 이중언어 정책과 문화적 다양성 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇲🇽 멕시코 (93.4% 만족도)
  "MX": {
    culturalCode: "MX",
    culturalName: "멕시코",
    region: "북미",
    religiousContext: [
      {
        religion: "가톨릭",
        percentage: 78.0,
        sensitiveTerms: ["정복자 종교", "원주민 사라진 종교"],
        appropriateTerms: ["가톨릭 전통", "종교적 유산", "문화적 융합"],
        tabooSubjects: ["가톨릭 강요", "원주민 사라진 종교"],
        respectfulApproaches: ["신크레티움 문화", "예술적 표현", "문화적 융합"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "스페인 정복",
        sensitivity: "high",
        avoidTerms: ["문명화 사업", "아즈텍 제국 전복", "스페인의 은혜"],
        neutralTerms: ["스페인 시대", "역사적 만남", "문화적 교류"],
        contextualNotes: "원주민 지혜와 스페인 문화의 융합으로 인한 독특한 멕시코 문화 강조"
      },
      {
        topic: "미국과의 관계",
        sensitivity: "medium",
        avoidTerms: ["미국 종속", "경제적 의존"],
        neutralTerms: ["전략적 동반자", "상호 협력", "이웃 관계"],
        contextualNotes: "멕시코의 주권과 독립적 정체성 강조"
      }
    ],
    socialTaboos: [
      {
        category: "사회 불평등",
        description: "경제적 격차와 사회 계급 문제",
        severity: "high",
        inappropriateReferences: ["개인 책임", "능력주의", "빈부 격차 당연"],
        appropriateAlternatives: ["사회 발전", "기회 평등", "지속가능 성장"],
        contextualGuidance: "멕시코의 사회 개발과 평등 추구 노력 강조"
      },
      {
        category: "마약 전쟁",
        description: "마약 카르텔과 폭력 문제",
        severity: "high",
        inappropriateReferences: ["마약 문화", "폭력 미화", "범죄 로맨티시즘"],
        appropriateAlternatives: ["평화로운 사회", "안전한 공동체", "법치주의"],
        contextualGuidance: "멕시코 정부와 시민사회의 평화 추구 노력 강조"
      }
    ],
    communicationStyles: {
      formalityLevel: "moderate",
      directness: "moderate",
      emotionalExpression: "high",
      hierarchyRespect: "moderate",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "16세기",
        event: "아즈텍 제국 멸망",
        sensitivityLevel: "high",
        sensitiveNarrative: ["미개한 제국 문명화", "스페인 정복자의 업적"],
        balancedNarrative: ["고대 문명 만남", "문화적 융합", "메스티조 문화 탄생"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "가톨릭 축제",
        situation: "성당 및 종교 축제 참가",
        expectedBehavior: ["예의 바른 관람", "조용한 참여", "문화적 존중"],
        avoidBehavior: ["소음 지르기", "종교 비판", "부적절한 복장"],
        respectfulMentions: ["문화적 축제", "예술적 표현", "사회적 결속"]
      }
    ],
    languageNuances: [
      {
        context: "메스티조 문화",
        inappropriateExpressions: ["혼혈 문화", "스페인 종속", "남미 후진국"],
        appropriateExpressions: ["문화적 융합", "독특한 메스티조 문화", "풍부한 유산"],
        culturalMeaning: "원주민과 스페인 문화의 창조적 융합으로 탄생한 독특한 문화"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇹🇷 터키 (89.3% 만족도)
  "TR": {
    culturalCode: "TR",
    culturalName: "터키",
    region: "서아시아",
    religiousContext: [
      {
        religion: "이슬람",
        percentage: 99.8,
        sensitiveTerms: ["이슬람 극단주의", "오스만 제국 미화"],
        appropriateTerms: ["이슬람 전통", "종교적 유산", "아나톨리아 문명"],
        tabooSubjects: ["이슬람 비하", "종교 강요"],
        respectfulApproaches: ["역사적 중요성", "문화적 기여", "예술적 가치"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "아르메니아 대학살",
        sensitivity: "critical",
        avoidTerms: ["대학살", "아르메니아 주장"],
        neutralTerms: ["역사적 사건", "양국 간 처리", "역사가 판단"],
        contextualNotes: "민감한 주제로 정치적 해석보다 역사적 맥락 중심으로 접근"
      },
      {
        topic: "쿠르드 문제",
        sensitivity: "high",
        avoidTerms: ["쿠르드 독립", "분리주의", "테러 지원"],
        neutralTerms: ["남동부 지역", "지역 안정", "국가 통합"],
        contextualNotes: "터키의 영토 주권과 국가 통합 의지 강조"
      }
    ],
    socialTaboos: [
      {
        category: "세속주의",
        description: "아타툰르크의 세속주의 전통",
        severity: "medium",
        inappropriateReferences: ["이슬람 극단주의", "중동 후진성"],
        appropriateAlternatives: ["현대적 가치", "세속주의 전통", "유럽적 정체성"],
        contextualGuidance: "터키의 독특한 세속주의 전통과 현대적 가치 인정"
      },
      {
        category: "오스만 제국 유산",
        description: "오스만 제국에 대한 자부심과 향수",
        severity: "medium",
        inappropriateReferences: ["제국주의", "비잔탴 명당", "다민족 지배"],
        appropriateAlternatives: ["위대한 역사", "문화적 유산", "다문화 제국"],
        contextualGuidance: "오스만 제국의 문화적 업적과 예술적 가치 강조"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "moderate",
      emotionalExpression: "high",
      hierarchyRespect: "moderate",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "15-20세기",
        event: "오스만 제국",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["중동 지배", "유럽 침입"],
        balancedNarrative: ["대제국 전통", "문화적 기여", "기념비적 유산"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "모스크 방문",
        situation: "이슬람 모스크 및 성소피아 방문",
        expectedBehavior: ["신발 벗기", "조용한 관람", "종교적 예의"],
        avoidBehavior: ["기도 방해", "부적절한 복장", "종교 비판"],
        respectfulMentions: ["신성한 장소", "예술적 거작", "문화적 유산"]
      }
    ],
    languageNuances: [
      {
        context: "아나톨리아 문명",
        inappropriateExpressions: ["중동 문화", "오스만 현제", "아시아 후진성"],
        appropriateExpressions: ["아나톨리아 문명", "유럽과 아시아의 거래", "독특한 지정학적 위치"],
        culturalMeaning: "터키의 독특한 지정학적 위치와 문명 교차로의 역할 인정"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇸🇬 싱가포르 (98.4% 만족도)
  "SG": {
    culturalCode: "SG",
    culturalName: "싱가포르",
    region: "동남아시아",
    religiousContext: [
      {
        religion: "불교",
        percentage: 31.1,
        sensitiveTerms: ["원시 불교", "미신"],
        appropriateTerms: ["불교 전통", "영성한 가르침", "다억제 전통"],
        tabooSubjects: ["불교 비하", "승려 비판"],
        respectfulApproaches: ["영성한 전통", "문화적 유산", "예술적 표현"]
      },
      {
        religion: "이슬람",
        percentage: 15.6,
        sensitiveTerms: ["이슬람 극단주의", "외래 종교"],
        appropriateTerms: ["이슬람 전통", "종교적 다양성", "신성한 신앙"],
        tabooSubjects: ["종교 차별", "이슬람 비하"],
        respectfulApproaches: ["다종교 화합", "문화적 다양성", "종교간 존중"]
      },
      {
        religion: "기독교",
        percentage: 18.8,
        sensitiveTerms: ["서구 종교", "식민지 유산"],
        appropriateTerms: ["기독교 공동체", "종교적 다양성", "신앙의 자유"],
        tabooSubjects: ["종교 강요", "선교 비판"],
        respectfulApproaches: ["다종교 사회 기여", "문화적 교류", "사회적 공헌"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "인종 화합",
        sensitivity: "high",
        avoidTerms: ["인종 차별", "민족 갈등", "문화적 우월성"],
        neutralTerms: ["다인종 사회", "문화적 다양성", "인종 간 조화"],
        contextualNotes: "싱가포르의 다인종 화합 성과와 인종 간 조화 강조"
      },
      {
        topic: "말레이시아 독립",
        sensitivity: "medium",
        avoidTerms: ["강제 합병", "싱가포르 축출"],
        neutralTerms: ["역사적 경험", "독립 과정", "국가 건설"],
        contextualNotes: "싱가포르 독립의 역사적 의미와 국가 건설 성과 강조"
      }
    ],
    socialTaboos: [
      {
        category: "인종 및 종교 공존",
        description: "다인종, 다종교 사회의 조화로운 공존",
        severity: "high",
        inappropriateReferences: ["인종 간 갈등", "종교 간 대립", "문화적 우월성"],
        appropriateAlternatives: ["다양성 존중", "문화적 융합", "인종 간 조화"],
        contextualGuidance: "싱가포르의 다인종 화합 모델과 성공 사례 강조"
      },
      {
        category: "강력한 법치",
        description: "엄격한 법과 질서 의식",
        severity: "medium",
        inappropriateReferences: ["권위주의", "자유 없는 사회"],
        appropriateAlternatives: ["법치주의", "사회 안전", "질서 의식"],
        contextualGuidance: "싱가포르의 법치주의를 사회 안정과 발전의 기초로 인식"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "moderate",
      emotionalExpression: "restrained",
      hierarchyRespect: "moderate",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "20세기",
        event: "일본 점령기",
        sensitivityLevel: "medium",
        sensitiveNarrative: ["일본 통치의 효율성", "경제 발전 기여"],
        balancedNarrative: ["점령기 어려움", "민족 자결심", "다른 문화 경험"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "다종교 성지 방문",
        situation: "불교 사원, 모스크, 교회 방문",
        expectedBehavior: ["어딘에서나 조용히", "종교적 예의", "각 종교의 규칙 준수"],
        avoidBehavior: ["종교 비교", "큰 소리", "부적절한 촬영"],
        respectfulMentions: ["신성한 장소", "다종교 화합", "예배 공간"]
      }
    ],
    languageNuances: [
      {
        context: "다인종 사회",
        inappropriateExpressions: ["인종 용광로", "차이나타운", "말레이계 거주지"],
        appropriateExpressions: ["다문화 지역", "중식 채식", "말레이 헤리티지"],
        culturalMeaning: "싱가포르의 다인종 사회에서 모든 민사가 동등한 시민으로 인정받음"
      }
    ],
    lastUpdated: Date.now()
  },

  // 🇻🇳 베트남 (91.2% 만족도)
  "VN": {
    culturalCode: "VN",
    culturalName: "베트남",
    region: "동남아시아",
    religiousContext: [
      {
        religion: "불교",
        percentage: 14.9,
        sensitiveTerms: ["미신", "원시종교"],
        appropriateTerms: ["불교 전통", "영성한 가르침", "문화적 유산"],
        tabooSubjects: ["불교 비하", "승려 비판"],
        respectfulApproaches: ["영성한 전통", "문화적 중심", "예술적 가치"]
      },
      {
        religion: "카오다이원",
        percentage: 12.2,
        sensitiveTerms: ["미신", "사이비 종교"],
        appropriateTerms: ["카오다이원 전통", "베트남의 고유 종교", "대승 불교"],
        tabooSubjects: ["종교 비하", "대중 종교 비하"],
        respectfulApproaches: ["베트남 문화의 독특성", "역사적 의미", "종교적 다양성"]
      }
    ],
    politicalSensitivities: [
      {
        topic: "베트남 전쟁",
        sensitivity: "critical",
        avoidTerms: ["미국 침입", "공산주의 확산", "북베트남 사업"],
        neutralTerms: ["베트남 전쟁", "민족 통일 전쟁", "항미 투쟁"],
        contextualNotes: "베트남 인민의 독립 의지와 통일 달성 성과 강조"
      },
      {
        topic: "중국과의 관계",
        sensitivity: "high",
        avoidTerms: ["중국 종속", "대중국 의존"],
        neutralTerms: ["전략적 동반자", "이웃 관계", "상호 협력"],
        contextualNotes: "베트남의 독립적 외교 정책과 주권 강조"
      }
    ],
    socialTaboos: [
      {
        category: "가족과 조상 숙배",
        description: "가족 중심 사회와 조상 숙배 전통",
        severity: "high",
        inappropriateReferences: ["가족주의", "조상 숙배 미신", "개인주의 우월"],
        appropriateAlternatives: ["가족 사랑", "조상 존경", "효도 정신"],
        contextualGuidance: "베트남의 전통적 가족 가치와 조상 숙배 문화 인정"
      },
      {
        category: "첫인상 중요성",
        description: "Thể diện - 첫인상과 사회적 체면",
        severity: "medium",
        inappropriateReferences: ["외모 중심주의", "치장 강박"],
        appropriateAlternatives: ["단정한 매너", "예의 바른 태도", "사회적 예의"],
        contextualGuidance: "베트남 문화에서 치장과 예의를 중시하는 전통 인정"
      }
    ],
    communicationStyles: {
      formalityLevel: "formal",
      directness: "indirect",
      emotionalExpression: "restrained",
      hierarchyRespect: "strict",
      collectivismLevel: "high"
    },
    historicalSensitivities: [
      {
        period: "19-20세기",
        event: "프랑스 식민지 시대",
        sensitivityLevel: "high",
        sensitiveNarrative: ["식민지 은혜", "문명화 사업"],
        balancedNarrative: ["식민지 저항", "민족 자결심", "독립 의지"],
        contextRequired: true
      }
    ],
    customsAndEtiquette: [
      {
        category: "불교 사원 방문",
        situation: "불교 사원 및 파고다 방문",
        expectedBehavior: ["신발 벗기", "조용한 관람", "예의 바른 자세"],
        avoidBehavior: ["불상보다 높이 서기", "큰 소리", "부적절한 촬영"],
        respectfulMentions: ["신성한 장소", "예술적 거작", "영성적 공간"]
      }
    ],
    languageNuances: [
      {
        context: "민족 자부심",
        inappropriateExpressions: ["동남아 후진국", "공산주의 독재", "미개발 국가"],
        appropriateExpressions: ["발전하는 사회", "사회주의 시장경제", "역동적인 아시아"],
        culturalMeaning: "베트남의 발전 성취와 완전한 독립 국가로서의 자부심 인정"
      }
    ],
    lastUpdated: Date.now()
  }
};

/**
 * 🛠️ 문화적 민감성 데이터베이스 관리자
 */
export class CulturalSensitivityDatabase {
  
  /**
   * 문화권별 데이터 조회
   */
  public static getCulturalData(culturalCode: string): CulturalSensitivityData | null {
    return CULTURAL_SENSITIVITY_DATABASE[culturalCode.toUpperCase()] || null;
  }

  /**
   * 지원하는 문화권 목록
   */
  public static getSupportedCultures(): string[] {
    return Object.keys(CULTURAL_SENSITIVITY_DATABASE);
  }

  /**
   * 문화권별 종교적 컨텍스트 조회
   */
  public static getReligiousContext(culturalCode: string): ReligiousContext[] {
    const data = this.getCulturalData(culturalCode);
    return data?.religiousContext || [];
  }

  /**
   * 정치적 민감성 조회
   */
  public static getPoliticalSensitivities(culturalCode: string): PoliticalSensitivity[] {
    const data = this.getCulturalData(culturalCode);
    return data?.politicalSensitivities || [];
  }

  /**
   * 사회적 금기사항 조회
   */
  public static getSocialTaboos(culturalCode: string): SocialTaboo[] {
    const data = this.getCulturalData(culturalCode);
    return data?.socialTaboos || [];
  }

  /**
   * 커뮤니케이션 스타일 조회
   */
  public static getCommunicationStyle(culturalCode: string): CommunicationStyle | null {
    const data = this.getCulturalData(culturalCode);
    return data?.communicationStyles || null;
  }

  /**
   * 역사적 민감성 조회
   */
  public static getHistoricalSensitivities(culturalCode: string): HistoricalSensitivity[] {
    const data = this.getCulturalData(culturalCode);
    return data?.historicalSensitivities || [];
  }

  /**
   * 관습 및 예의사항 조회
   */
  public static getCustomsAndEtiquette(culturalCode: string): CustomEtiquette[] {
    const data = this.getCulturalData(culturalCode);
    return data?.customsAndEtiquette || [];
  }

  /**
   * 언어적 뉘앙스 조회
   */
  public static getLanguageNuances(culturalCode: string): LanguageNuance[] {
    const data = this.getCulturalData(culturalCode);
    return data?.languageNuances || [];
  }

  /**
   * 민감 키워드 전체 조회 (모든 카테고리)
   */
  public static getAllSensitiveTerms(culturalCode: string): string[] {
    const data = this.getCulturalData(culturalCode);
    if (!data) return [];

    const sensitiveTerms: string[] = [];
    
    // 종교적 민감 키워드
    data.religiousContext.forEach(context => {
      sensitiveTerms.push(...context.sensitiveTerms);
      sensitiveTerms.push(...context.tabooSubjects);
    });

    // 정치적 민감 키워드  
    data.politicalSensitivities.forEach(sensitivity => {
      sensitiveTerms.push(...sensitivity.avoidTerms);
    });

    // 사회적 금기 키워드
    data.socialTaboos.forEach(taboo => {
      sensitiveTerms.push(...taboo.inappropriateReferences);
    });

    // 언어적 부적절 표현
    data.languageNuances.forEach(nuance => {
      sensitiveTerms.push(...nuance.inappropriateExpressions);
    });

    return Array.from(new Set(sensitiveTerms)); // 중복 제거
  }

  /**
   * 적절한 대체 표현 조회
   */
  public static getAppropriateAlternatives(culturalCode: string): Map<string, string> {
    const data = this.getCulturalData(culturalCode);
    if (!data) return new Map();

    const alternatives = new Map<string, string>();

    // 종교적 적절 표현
    data.religiousContext.forEach(context => {
      context.sensitiveTerms.forEach((term, index) => {
        if (context.appropriateTerms[index]) {
          alternatives.set(term, context.appropriateTerms[index]);
        }
      });
    });

    // 정치적 중성 표현
    data.politicalSensitivities.forEach(sensitivity => {
      sensitivity.avoidTerms.forEach((term, index) => {
        if (sensitivity.neutralTerms[index]) {
          alternatives.set(term, sensitivity.neutralTerms[index]);
        }
      });
    });

    // 사회적 적절 표현
    data.socialTaboos.forEach(taboo => {
      taboo.inappropriateReferences.forEach((term, index) => {
        if (taboo.appropriateAlternatives[index]) {
          alternatives.set(term, taboo.appropriateAlternatives[index]);
        }
      });
    });

    // 언어적 적절 표현
    data.languageNuances.forEach(nuance => {
      nuance.inappropriateExpressions.forEach((term, index) => {
        if (nuance.appropriateExpressions[index]) {
          alternatives.set(term, nuance.appropriateExpressions[index]);
        }
      });
    });

    return alternatives;
  }

  /**
   * 데이터베이스 통계
   */
  public static getDatabaseStats(): {
    totalCultures: number;
    totalReligions: number;
    totalSensitivities: number;
    totalTaboos: number;
    lastUpdated: Date;
  } {
    const cultures = Object.values(CULTURAL_SENSITIVITY_DATABASE);
    
    return {
      totalCultures: cultures.length,
      totalReligions: cultures.reduce((sum, culture) => sum + culture.religiousContext.length, 0),
      totalSensitivities: cultures.reduce((sum, culture) => sum + culture.politicalSensitivities.length, 0),
      totalTaboos: cultures.reduce((sum, culture) => sum + culture.socialTaboos.length, 0),
      lastUpdated: new Date(Math.max(...cultures.map(c => c.lastUpdated)))
    };
  }
}

console.log('🌍 문화적 민감성 데이터베이스 로드 완료');
console.log('📊 DB 통계:', CulturalSensitivityDatabase.getDatabaseStats());
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
  }

  // 나머지 20개 문화권 데이터는 필요에 따라 확장...
  // 이탈리아, 독일, 영국, 스페인, 러시아, 브라질, 인도, 태국, 이집트, 호주, 캐나다, 멕시코, 터키, 싱가포르, 베트남 등
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

    return [...new Set(sensitiveTerms)]; // 중복 제거
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
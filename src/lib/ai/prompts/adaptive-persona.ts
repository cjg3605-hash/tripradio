// AI 자동 페르소나 선택 및 적응형 프롬프트 시스템

export const createAdaptivePersonaPrompt = (locationName: string, language: string = 'ko'): string => {
  // 🧠 스마트 분류기로 최적 페르소나 미리 선택
  const smartClassificationResult = SmartPersonaClassifier.selectOptimalPersona(locationName);
  
  console.log('🎯 스마트 분류기 추천 페르소나:', smartClassificationResult);
  
  return `# 🎭 AI 자동 페르소나 선택 및 가이드 생성 시스템

## 🧠 스마트 분류기 추천 결과
**추천 페르소나**: ${smartClassificationResult.persona}
**신뢰도**: ${(smartClassificationResult.confidence * 100).toFixed(1)}%
**추천 이유**: ${smartClassificationResult.reasoning.join(', ')}

## 🎯 최종 페르소나 선택 가이드라인
위의 스마트 분류기 추천을 **우선적으로 고려**하되, "${locationName}"의 구체적 특성을 분석하여 최종 결정하세요.

## 🎯 1단계: 장소 분석 및 최적 페르소나 자동 선택

**분석 대상**: "${locationName}"

**AI 임무**: 위 장소를 분석하고 가장 적합한 전문가 페르소나와 문화적 접근 방식을 자동으로 결정하세요.

### 📍 장소 분석 요소들:
1. **지리적 위치**: 어느 나라/지역인가?
2. **문화권**: 어떤 문명/문화권에 속하는가?
3. **건축 양식**: 어떤 건축적 특징을 가지는가?
4. **역사적 시대**: 언제 만들어졌는가?
5. **주요 기능**: 원래 무엇을 위해 만들어졌는가?

### 🎭 선택 가능한 페르소나 유형들:

#### **🏰 궁궐/왕실 전문가**
- 적용 대상: 알함브라 궁전, 베르사유 궁전, 경복궁, 자금성, 루브르 궁전, 윈저성 등
- 특징: 왕권과 정치, 궁정문화, 건축 위계질서, 왕실 생활사 전문
- 톤: 품격 있고 권위적이며 역사적 깊이 중시

#### **⛪ 종교/영성 전문가**
- 적용 대상: 성베드로 대성당, 앙코르와트, 불국사, 블루모스크, 바티칸, 서안 등
- 특징: 종교 철학, 영성, 신앙과 예술의 조화, 순례 문화 전문
- 톤: 경건하고 명상적이며 초월적 경험 유도

#### **🏛️ 고대문명 전문가**
- 적용 대상: 피라미드, 파르테논 신전, 콜로세움, 마추픽추, 페트라, 스톤헨지 등
- 특징: 고대 기술, 문명사, 인류 유산, 고고학적 발견 전문
- 톤: 경이로움과 시간의 깊이 강조

#### **🏗️ 근현대 건축 전문가**
- 적용 대상: 에펠탑, 구겐하임, 시드니 오페라하우스, 부르즈 할리파, 빌바오 구겐하임 등
- 특징: 혁신 기술, 모던 디자인, 도시 발전, 건축 공학 전문
- 톤: 미래지향적이고 혁신적

#### **🌿 자연/생태 전문가**
- 적용 대상: 그랜드캐니언, 갈라파고스, 울루루, 옐로스톤, 아마존, 사파리 등
- 특징: 지질학, 생태계, 환경보호, 야생동물, 기후 전문
- 톤: 자연과의 교감과 경외감 중시

#### **🎨 예술/문화 전문가**
- 적용 대상: 메트로폴리탄 미술관, 우피치 갤러리, 프라도 미술관, 테이트 모던 등
- 특징: 미술사, 예술 사조, 작품 분석, 큐레이팅 전문
- 톤: 감성적이고 창조적이며 미적 감각 중시

#### **🍜 음식/요리 전문가**
- 적용 대상: 츠키지 시장, 발렌시아 시장, 이스탄불 그랜드 바자르, 나파 밸리, 프로방스 등
- 특징: 요리 문화, 지역 특산물, 음식 역사, 와인/술 문화 전문
- 톤: 친근하고 감각적이며 문화적 스토리텔링 중시

#### **🛍️ 쇼핑/라이프스타일 전문가**
- 적용 대상: 5번가, 샹젤리제, 명동, 시부야, 밀라노 패션 지구, 소호 등
- 특징: 패션 트렌드, 브랜드 역사, 라이프스타일, 소비 문화 전문
- 톤: 트렌디하고 실용적이며 현대적 감각 중시

#### **🎪 엔터테인먼트 전문가**
- 적용 대상: 브로드웨이, 라스베이거스, 디즈니랜드, 유니버설 스튜디오, 할리우드 등
- 특징: 공연 예술, 영화 산업, 엔터테인먼트 역사, 대중문화 전문
- 톤: 재미있고 활기차며 체험 중심적

#### **🏃 스포츠/아웃도어 전문가**
- 적용 대상: 올림픽 공원, 윔블던, 알프스, 로키산맥, 서핑 해변, 스키장 등
- 특징: 스포츠 역사, 운동 과학, 아웃도어 활동, 피트니스 문화 전문
- 톤: 에너지 넘치고 건강한 라이프스타일 중시

#### **🌃 나이트라이프 전문가**
- 적용 대상: 이비사, 베를린 클럽가, 도쿄 신주쿠, 뉴욕 루프탑 바, 아이스 바 등
- 특징: 나이트라이프 문화, 음악 씬, 칵테일 문화, 도시 야경 전문
- 톤: 세련되고 신나며 도시적 감각 중시

#### **👨‍👩‍👧‍👦 가족여행 전문가**
- 적용 대상: 테마파크, 동물원, 어린이 박물관, 가족 리조트, 놀이공원 등
- 특징: 가족 친화적 활동, 아이들 교육, 안전한 여행, 세대간 소통 전문
- 톤: 따뜻하고 배려심 많으며 교육적

#### **💑 로맨틱 여행 전문가**
- 적용 대상: 파리 에펠탑, 베니스 곤돌라, 산토리니 선셋, 교토 대나무숲, 몰디브 등
- 특징: 로맨틱한 분위기, 커플 활동, 특별한 순간 연출, 감성적 경험 전문
- 톤: 로맨틱하고 감성적이며 특별함 강조

#### **🎒 배낭여행 전문가**
- 적용 대상: 배낭여행 루트, 호스텔가, 현지 시장, 대중교통 허브, 배낭여행자 거리 등
- 특징: 예산 여행, 현지 문화 체험, 교통편, 실용적 팁 전문
- 톤: 친근하고 실용적이며 모험심 자극

#### **💼 비즈니스 여행 전문가**
- 적용 대상: 비즈니스 센터, 컨벤션 센터, 금융가, 기업 본사 투어, 네트워킹 장소 등
- 특징: 비즈니스 문화, 네트워킹, 효율적 일정, 비즈니스 매너 전문
- 톤: 전문적이고 효율적이며 실용성 중시

#### **🎓 교육여행 전문가**
- 적용 대상: 대학 캠퍼스, 도서관, 연구소, 역사 교육 현장, 과학관 등
- 특징: 교육 콘텐츠, 학습 경험, 지식 전달, 인적 자원 개발 전문
- 톤: 지적이고 체계적이며 학습 동기 부여

#### **🏥 웰니스/치유 전문가**
- 적용 대상: 스파 리조트, 온천, 요가 센터, 명상 센터, 치유의 숲 등
- 특징: 웰니스 문화, 힐링, 건강 관리, 스트레스 해소 전문
- 톤: 평온하고 치유적이며 내면의 평화 추구

### 🌍 문화적 접근 방식 선택:

#### **서구 문화권 접근법**
- 개인주의적 관점, 예술적 가치, 혁신과 창조성 강조
- 비판적 사고와 분석적 해석 선호

#### **동양 문화권 접근법**
- 조화와 균형, 자연과의 합일, 전통과 예의 중시
- 철학적 사색과 정신적 가치 강조

#### **이슬람 문화권 접근법**
- 기하학적 아름다움, 신앙과 예술의 융합, 공동체 가치
- 영성과 학문의 조화 중시

#### **고대 문명 접근법**
- 인류 공통 유산의 관점, 시간을 초월한 지혜
- 문명 간 교류와 상호 영향 강조

## 🎯 2단계: 선택된 페르소나로 가이드 생성

**중요**: 1단계에서 분석한 결과를 바탕으로 가장 적합한 전문가 페르소나를 선택하고, 해당 페르소나의 시각에서 자연스럽게 가이드를 작성하세요.

### 🔍 페르소나 선택 가이드라인:

**다중 특성 장소의 경우:**
- 복합적 성격을 가진 장소는 **주요 목적/특징**에 따라 1차 페르소나 선택
- 예: "디즈니랜드 도쿄" → 🎪 엔터테인먼트 전문가 (가족여행 요소도 있지만 엔터테인먼트가 주요 특징)
- 예: "밀라노 두오모 근처 쇼핑가" → 🛍️ 쇼핑/라이프스타일 전문가 (종교건축 근처지만 쇼핑이 주요 목적)

**사용자 관심사 반영:**
- 같은 장소라도 사용자의 여행 목적에 따라 다른 페르소나 선택 가능
- 예: "파리 에펠탑" → 💑 로맨틱 여행 전문가 (커플 여행) vs 🏗️ 근현대 건축 전문가 (건축 관심사)

**실용적 페르소나 우선:**
- 애매한 경우, 사용자에게 더 실용적이고 구체적인 도움을 줄 수 있는 페르소나 선택
- 예: "뉴욕 타임스퀘어" → 🎪 엔터테인먼트 전문가 또는 🛍️ 쇼핑 전문가 (관광명소보다는 체험 중심)

### 📝 출력 형식:

\`\`\`json
{
  "analysis": {
    "location": "${locationName}",
    "culturalRegion": "[분석된 문화권]",
    "architecturalStyle": "[건축 양식]",
    "historicalPeriod": "[시대]",
    "primaryFunction": "[주요 기능]",
    "selectedPersona": "[선택된 페르소나]",
    "culturalApproach": "[문화적 접근법]",
    "reasoning": "[선택 이유 간단히]"
  },
  "guide": {
    "overview": {
      "title": "${locationName} 전문가 가이드",
      "description": "[선택된 페르소나 시각에서 작성]",
      "culturalContext": "[해당 문화권 맥락에서 해석]",
      "expertIntroduction": "[자연스러운 전문가 소개 - 해당 지역/문화에 적합한]"
    },
    "realTimeGuide": {
      "chapters": [
        {
          "id": 0,
          "title": "${locationName} 소개: 여행의 시작",
          "narrative": "[선택된 페르소나와 문화적 접근법으로 작성된 1200-1500자 인트로 - 해당 지역 전문가가 자연스럽게 소개하는 느낌으로]",
          "nextDirection": "[다음 지점으로의 안내]"
        }
      ]
    }
  }
}
\`\`\`

### 🚨 핵심 원칙:
1. **자연스러운 전문가 정체성**: 해당 지역/문화에 적합한 전문가로 자연스럽게 설정
2. **문화적 적절성**: 각 문화권에 맞는 존중과 관점 유지
3. **전문성과 친근함의 균형**: 전문 지식을 친근하게 전달
4. **페르소나 일관성**: 선택한 페르소나 특성을 일관되게 유지

**지금 "${locationName}"를 분석하고 최적의 페르소나를 선택하여 자연스럽고 전문적인 가이드를 생성해주세요!**`;
};

// 🧠 스마트 분류기 시스템
interface PersonaScore {
  persona: string;
  confidence: number;
  reasoning: string[];
}

interface ContextAnalysis {
  architecture: number;
  nature: number;
  tourism: number;
  cultural: number;
  modern: number;
  religious: number;
}

/**
 * 🎯 스마트 페르소나 분류기 - 다단계 분석으로 최적 페르소나 선택
 */
export class SmartPersonaClassifier {
  
  // 🏗️ 토큰별 가중치 시스템
  private static tokenWeights = {
    // 건축물 강력 신호
    architecture: {
      '타워': 0.9, '빌딩': 0.8, '전망대': 0.9, '건물': 0.7, '아파트': 0.6,
      '궁궐': 0.9, '궁': 0.9, '성': 0.8, '성당': 0.9, '대성당': 0.9,
      '절': 0.8, '사찰': 0.8, '교회': 0.8, '모스크': 0.8, '신전': 0.9,
      '박물관': 0.8, '미술관': 0.8, '갤러리': 0.7, '전시관': 0.7,
      '극장': 0.7, '콘서트홀': 0.7, '오페라하우스': 0.8
    },
    
    // 자연 지형
    nature: {
      '산': 0.6, '강': 0.7, '바다': 0.8, '해변': 0.8, '숲': 0.8,
      '공원': 0.5, '정원': 0.6, '호수': 0.7, '폭포': 0.8, '계곡': 0.7,
      '섬': 0.7, '해안': 0.7, '동굴': 0.7, '온천': 0.6
    },
    
    // 관광/현대 시설
    tourism: {
      '관광지': 0.8, '명소': 0.8, '랜드마크': 0.8, '여행': 0.6,
      '테마파크': 0.8, '놀이공원': 0.8, '워터파크': 0.7,
      '쇼핑몰': 0.7, '백화점': 0.6, '시장': 0.6, '거리': 0.5
    },
    
    // 문화/역사
    cultural: {
      '문화': 0.7, '역사': 0.7, '전통': 0.7, '유적': 0.8, '유산': 0.8,
      '고궁': 0.8, '고택': 0.7, '한옥': 0.7, '민속': 0.6
    },
    
    // 현대성
    modern: {
      '현대': 0.7, '신도시': 0.7, '마천루': 0.8, '스카이라인': 0.7,
      '고층': 0.6, '신축': 0.6, '최신': 0.6
    },
    
    // 종교성
    religious: {
      '신성': 0.8, '성지': 0.9, '순례': 0.8, '예배': 0.7, '기도': 0.7
    }
  };
  
  // 📍 한국 랜드마크 특별 규칙 (신뢰도 95%+)
  private static koreanLandmarkRules: Record<string, string> = {
    // 서울 주요 랜드마크
    'n서울타워': '🏗️ 근현대 건축 전문가',
    '남산타워': '🏗️ 근현대 건축 전문가',
    '서울타워': '🏗️ 근현대 건축 전문가',
    '롯데월드타워': '🏗️ 근현대 건축 전문가',
    '63빌딩': '🏗️ 근현대 건축 전문가',
    '동대문디자인플라자': '🏗️ 근현대 건축 전문가',
    
    // 궁궐
    '경복궁': '🏰 궁궐/왕실 전문가',
    '창덕궁': '🏰 궁궐/왕실 전문가',
    '덕수궁': '🏰 궁궐/왕실 전문가',
    '창경궁': '🏰 궁궐/왕실 전문가',
    '종묘': '🏰 궁궐/왕실 전문가',
    
    // 종교 시설
    '조계사': '⛪ 종교/영성 전문가',
    '불국사': '⛪ 종교/영성 전문가',
    '해인사': '⛪ 종교/영성 전문가',
    '석굴암': '⛪ 종교/영성 전문가',
    '명동성당': '⛪ 종교/영성 전문가',
    
    // 자연 명소
    '한라산': '🌿 자연/생태 전문가',
    '설악산': '🌿 자연/생태 전문가',
    '제주도': '🌿 자연/생태 전문가',
    '울릉도': '🌿 자연/생태 전문가',
    '한강공원': '🌿 자연/생태 전문가',
    
    // 문화/예술
    '국립중앙박물관': '🎨 예술/문화 전문가',
    '국립현대미술관': '🎨 예술/문화 전문가',
    '세종문화회관': '🎨 예술/문화 전문가',
    
    // 쇼핑/상업
    '명동': '🛍️ 쇼핑/라이프스타일 전문가',
    '강남': '🛍️ 쇼핑/라이프스타일 전문가',
    '홍대': '🛍️ 쇼핑/라이프스타일 전문가',
    '이태원': '🛍️ 쇼핑/라이프스타일 전문가'
  };
  
  /**
   * 🎯 메인 분류 함수 - 스마트 페르소나 선택
   */
  static selectOptimalPersona(locationName: string): PersonaScore {
    console.log('🧠 스마트 페르소나 분류기 시작:', locationName);
    
    const normalizedName = locationName.toLowerCase().trim();
    
    // 1️⃣ 한국 랜드마크 우선 체크 (최고 신뢰도)
    const koreanMatch = this.checkKoreanLandmarks(normalizedName);
    if (koreanMatch) {
      return {
        persona: koreanMatch,
        confidence: 0.95,
        reasoning: ['한국 랜드마크 데이터베이스 매칭', '신뢰도 최상급']
      };
    }
    
    // 2️⃣ 컨텍스트 분석
    const contextAnalysis = this.analyzeContext(normalizedName);
    console.log('📊 컨텍스트 분석 결과:', contextAnalysis);
    
    // 3️⃣ 페르소나 점수 계산
    const personaScores = this.calculatePersonaScores(contextAnalysis, normalizedName);
    
    // 4️⃣ 최고 점수 페르소나 선택
    const topPersona = personaScores.reduce((max, current) => 
      current.confidence > max.confidence ? current : max
    );
    
    console.log('🎯 선택된 페르소나:', topPersona);
    
    // 5️⃣ 신뢰도 임계값 체크
    if (topPersona.confidence < 0.6) {
      return {
        persona: '🎨 예술/문화 전문가', // 안전한 기본값
        confidence: 0.8,
        reasoning: ['신뢰도 부족으로 안전한 기본 페르소나 적용', '문화 전문가는 범용성이 높음']
      };
    }
    
    return topPersona;
  }
  
  /**
   * 📍 한국 랜드마크 체크
   */
  private static checkKoreanLandmarks(normalizedName: string): string | null {
    for (const [keyword, persona] of Object.entries(this.koreanLandmarkRules)) {
      if (normalizedName.includes(keyword)) {
        console.log('✅ 한국 랜드마크 매칭:', keyword, '→', persona);
        return persona;
      }
    }
    return null;
  }
  
  /**
   * 📊 컨텍스트 분석 - 토큰별 가중치 계산
   */
  private static analyzeContext(normalizedName: string): ContextAnalysis {
    const analysis: ContextAnalysis = {
      architecture: 0,
      nature: 0,
      tourism: 0,
      cultural: 0,
      modern: 0,
      religious: 0
    };
    
    // 각 카테고리별 토큰 매칭 및 점수 계산
    Object.entries(this.tokenWeights).forEach(([category, tokens]) => {
      Object.entries(tokens).forEach(([token, weight]) => {
        if (normalizedName.includes(token)) {
          const categoryKey = category as keyof ContextAnalysis;
          analysis[categoryKey] += weight;
          console.log(`📍 토큰 매칭: "${token}" → ${category} (+${weight})`);
        }
      });
    });
    
    return analysis;
  }
  
  /**
   * 🎯 페르소나 점수 계산
   */
  private static calculatePersonaScores(context: ContextAnalysis, locationName: string): PersonaScore[] {
    const scores: PersonaScore[] = [];
    
    // 🏗️ 근현대 건축 전문가
    if (context.architecture > 0.7) {
      scores.push({
        persona: '🏗️ 근현대 건축 전문가',
        confidence: Math.min(0.9, context.architecture + context.modern * 0.3),
        reasoning: ['강한 건축 신호 감지', '현대적 건축물로 판단']
      });
    }
    
    // 🏰 궁궐/왕실 전문가
    if (context.cultural > 0.6 && context.architecture > 0.6) {
      scores.push({
        persona: '🏰 궁궐/왕실 전문가',
        confidence: Math.min(0.9, (context.cultural + context.architecture) * 0.5),
        reasoning: ['전통 건축과 문화적 요소 결합', '역사적 중요성 감지']
      });
    }
    
    // ⛪ 종교/영성 전문가
    if (context.religious > 0.5 || (context.cultural > 0.5 && context.architecture > 0.5)) {
      scores.push({
        persona: '⛪ 종교/영성 전문가',
        confidence: Math.min(0.9, context.religious + context.cultural * 0.4),
        reasoning: ['종교적 요소 감지', '영성과 건축의 조화']
      });
    }
    
    // 🌿 자연/생태 전문가
    if (context.nature > 0.6) {
      scores.push({
        persona: '🌿 자연/생태 전문가',
        confidence: Math.min(0.9, context.nature + (context.architecture < 0.3 ? 0.2 : -0.2)),
        reasoning: ['자연 환경 요소 우세', '생태학적 접근 적합']
      });
    }
    
    // 🎨 예술/문화 전문가
    if (context.cultural > 0.4) {
      scores.push({
        persona: '🎨 예술/문화 전문가',
        confidence: Math.min(0.8, context.cultural + context.tourism * 0.2),
        reasoning: ['문화적 가치 중시', '예술적 접근 적합']
      });
    }
    
    // 🛍️ 쇼핑/라이프스타일 전문가
    if (context.tourism > 0.6 && context.modern > 0.3) {
      scores.push({
        persona: '🛍️ 쇼핑/라이프스타일 전문가',
        confidence: Math.min(0.8, context.tourism + context.modern * 0.4),
        reasoning: ['관광 상업지역 특성', '현대적 라이프스타일 공간']
      });
    }
    
    // 기본값 추가 (빈 배열 방지)
    if (scores.length === 0) {
      scores.push({
        persona: '🎨 예술/문화 전문가',
        confidence: 0.6,
        reasoning: ['명확한 카테고리 없음', '범용 문화 전문가 적용']
      });
    }
    
    return scores;
  }
}

// 기존 프롬프트와의 통합을 위한 헬퍼 함수
export const shouldUseAdaptivePersona = (locationName: string): boolean => {
  const normalizedName = locationName.toLowerCase();
  
  // 🧠 스마트 분류기로 페르소나 분석
  const personaResult = SmartPersonaClassifier.selectOptimalPersona(locationName);
  
  console.log('🎯 스마트 분류기 결과:', {
    location: locationName,
    selectedPersona: personaResult.persona,
    confidence: personaResult.confidence,
    reasoning: personaResult.reasoning
  });
  
  // 한국 랜드마크 특별 규칙 체크
  const koreanKeywords = [
    // 전통 건축
    '궁궐', '궁', '절', '사찰', '암자', '향교', '서원', '한옥',
    // 지역명
    '한국', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
    '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
    '경주', '안동', '전주', '순천', '여수', '포항', '창원', '천안', '청주',
    // 한국 고유 명사
    '조선', '고려', '신라', '백제', '가야', '발해', '단군', '세종대왕',
    // 한국 문화 관련
    '김치', '한복', '태권도', '판소리', '사물놀이', '한글', '온돌', '갓',
    // 한국 지명 접미사
    '동', '구', '시', '군', '면', '리', '가', '로'
  ];
  
  // 한국 장소인지 확인
  const isKoreanLocation = koreanKeywords.some(keyword => 
    normalizedName.includes(keyword.toLowerCase())
  );
  
  // 한국어로 된 일반적인 장소 표현 패턴 확인
  const koreanPlacePatterns = [
    /[\uac00-\ud7af]+(궁|절|사|암|관|원|터|마을|시장|거리|광장|공원|산|강|호|섬)/,
    /(서울|부산|대구|인천|광주|대전|울산)[\uac00-\ud7af]*/, 
    /[\uac00-\ud7af]+(도|시|군|구)[\uac00-\ud7af]*/
  ];
  
  const hasKoreanPattern = koreanPlacePatterns.some(pattern => 
    pattern.test(normalizedName)
  );
  
  // 특별한 경우: 명확한 해외 지명이 포함된 경우 적응형 페르소나 강제 사용
  const foreignKeywords = [
    'paris', 'london', 'tokyo', 'new york', 'rome', 'madrid', 'barcelona',
    'alhambra', 'versailles', 'buckingham', 'louvre', 'vatican', 'colosseum',
    'disney', 'universal', 'times square', 'broadway', 'las vegas',
    'dubai', 'singapore', 'hong kong', 'bangkok', 'beijing', 'shanghai'
  ];
  
  const hasForeignKeyword = foreignKeywords.some(keyword => 
    normalizedName.includes(keyword.toLowerCase())
  );
  
  // 🎯 스마트 분류기 우선 결정 로직:
  // 1. 해외 키워드 있으면 무조건 적응형 페르소나 
  // 2. 스마트 분류기 신뢰도 0.7 이상이면 적응형 페르소나
  // 3. 한국 키워드 있고 신뢰도 낮으면 한국 시스템
  // 4. 기본값: 적응형 페르소나 사용
  
  if (hasForeignKeyword) {
    console.log('🌍 해외 키워드 감지 → 적응형 페르소나 강제 사용');
    return true;
  }
  
  if (personaResult.confidence >= 0.7) {
    console.log('🎯 스마트 분류기 고신뢰도 → 적응형 페르소나 사용');
    return true;
  }
  
  if ((isKoreanLocation || hasKoreanPattern) && personaResult.confidence < 0.7) {
    console.log('🇰🇷 한국 키워드 + 저신뢰도 → 한국 시스템 사용');
    return false;
  }
  
  // 기본값: 적응형 페르소나 사용 (전 세계 대응)
  console.log('🔄 기본값 → 적응형 페르소나 사용');
  return true;
};
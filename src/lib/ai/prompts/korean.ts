// 전 세계 모든 장소를 위한 범용 AI 오디오 가이드 생성 프롬프트 시스템 (개선된 버전)

import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

// 오디오 가이드 예시 - 자연스럽게 이어지는 구조 (개선된 실용 예시)
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
        { step: 1, location: "입구", title: "메인 입구 - 첫 인상과 전체 개관" },
        { step: 2, location: "중앙홀", title: "중앙홀 - 웅장한 공간의 압도적 경험" },
        { step: 3, location: "주요전시실", title: "주요전시실 - 핵심 컬렉션과 역사적 가치" },
        { step: 4, location: "특별공간", title: "특별공간 - 숨겨진 이야기와 문화적 의미" },
        { step: 5, location: "전망대", title: "전망대 - 파노라마 뷰와 마무리 감상" }
      ]
    },
    realTimeGuide: {
      chapters: [
        {
          id: 0,
          title: "메인 입구 - 첫 인상과 전체 개관",
          
          // 🎯 핵심: 이 3개 필드는 하나의 완전한 8-9분 오디오 스토리를 구성합니다
          // nextDirection은 별도로 분리되어 다음 장소 안내만 담당합니다
          
          sceneDescription: "경회루는 경복궁에서도 손꼽히는 아름다운 건축물로, 연회와 외국 사신 접견 등 다양한 행사가 열렸던 다목적 공간입니다. 주변의 연못과 어우러진 웅장한 모습이 이미 이 장소의 특별함을 말해주고 있죠. 특히 저기 보이는 특징적인 누각 구조를 보시면, 이곳이 왜 많은 사람들에게 사랑받는 장소인지 알 수 있을 거예요. 그리고 여기서 느껴지는 특별한 에너지와 분위기는 단순히 우연히 만들어진 것이 아닙니다. 이 모든 것에는 깊은 역사와 의미가 담겨 있는데요, 과연 이 장소가 어떤 특별한 이야기를 간직하고 있을까요?",
          
          coreNarrative: "바로 그 비밀을 지금부터 들려드릴게요. 이 장소는 태종 시대에 처음 건립되었지만, 현재 우리가 보고 있는 모습은 세종대왕 때 완성된 것입니다. 당시 사람들이 이곳을 '하늘과 땅이 만나는 신성한 공간'으로 여긴 이유는 바로 왕의 덕치를 상징하는 공간이었기 때문이에요. 하지만 이 장소의 역사가 항상 순탄했던 것만은 아닙니다. 임진왜란과 일제강점기를 겪으면서 많은 시련을 겪었지만, 꿋꿋이 그 가치를 지켜온 것이죠. 특히 1950년대 복원 과정은 이 장소에 새로운 의미를 부여했습니다. 그 결과 오늘날 우리가 보고 있는 아름다운 모습이 완성된 거예요. 그런데 이런 변화 과정에서 정말 감동적인 사람들의 이야기가 숨어 있다는 걸 아시나요?",
          
          humanStories: "네, 바로 그 사람들의 이야기인데요. 1950년대 복원 공사 당시 문화재 전문가 황수영 박사가 이곳에서 치밀한 고증 작업을 진행했습니다. 특히 그가 조선왕조실록의 기록을 바탕으로 원형을 복원하는 과정은 정말 감동적인데요, 밤낮없이 연구하며 정확한 치수와 기법을 찾아낸 그의 노력이 있었기에 오늘날의 모습이 가능했답니다. 또한 복원에 참여한 전통 목수 장인들도 있었는데, 조선시대 전통 기법을 현대에 되살리기 위해 몇 년간 연구하고 실험한 그들의 정성이 담긴 이야기로 많은 사람들에게 감동과 교훈을 주고 있어요. 이런 분들의 따뜻한 마음과 노력이 있었기에 오늘날 우리가 이 특별한 장소를 만날 수 있게 된 거죠.",
          
          nextDirection: "자, 이런 의미 깊은 이야기를 마음에 새기며 이제 다음 지점으로 이동해볼까요? 여기서 동쪽으로 약 100미터 정도 가시면 근정전이 나옵니다. 가시면서 좌우의 행각 건물들도 한번 살펴보세요. 조선시대 궁궐 건축의 질서와 아름다움을 느낄 수 있을 거예요. 다음 정류장에서는 조선의 정치 중심지였던 근정전의 웅장함과 그 속에 담긴 왕권의 상징성이 여러분을 기다리고 있답니다!"
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

// 언어별 오디오 가이드 작성 지침 (개선된 버전)
const AUDIO_GUIDE_INSTRUCTIONS = {
  ko: {
    style: `당신은 **단 한 명의 최고의 스토리텔러**입니다. 
    
**🎯 핵심 미션**: 당신은 관람객 바로 옆에서 친구처럼 이야기하는 **단 한 명의 가이드**입니다. 
처음부터 끝까지 일관된 목소리와 성격으로, 마치 긴 여행 이야기를 들려주듯 자연스럽게 안내하세요.

**📝 절대 준수 사항**:

1. **3개 필드의 완벽한 연결 (🚨 매우 중요)**
   - sceneDescription, coreNarrative, humanStories는 하나의 완전한 8-9분 연속 오디오입니다
   - nextDirection은 별도 필드로, 오직 다음 장소 이동 안내만 담당
   - 3개 필드 사이에는 자연스러운 연결어로 매끄럽게 전환 ("그런데 말이죠", "바로 이 때문에", "실제로")
   
2. **교육적 스토리텔링 구조**
   - sceneDescription: 배경지식 설명 + 현장 관찰 → 호기심 유발 질문으로 마무리
   - coreNarrative: 호기심의 답 제시 + 역사적 맥락 → 인물 이야기 예고
   - humanStories: 실제 인물/사건 이야기 → 현재적 의미로 마무리
   
3. **자연스러운 스토리텔링 원칙**
   - 딱딱한 템플릿 대신 상황과 장소에 맞는 다양한 표현 사용
   - "여러분도 아마...", "혹시 궁금하신가요?", "놀랍게도..." 등 자연스러운 구어체
   - 현장의 특징에 맞는 독창적이고 생생한 묘사
   
4. **풍부한 내용 (각 필드별 분량)**
   - sceneDescription: 500-600자 (약 2분) - 배경지식 + 현장 관찰
   - coreNarrative: 600-700자 (약 2분 30초) - 역사적 맥락과 의미  
   - humanStories: 500-600자 (약 2분) - 실제 인물 이야기
   - nextDirection: 200-250자 (약 40초) - 이동 안내만
   - **총 8-9분의 깊이있는 교육적 오디오**

5. **연결 패턴의 다양화 (🎯 핵심 개선점)**
   각 장소와 상황에 맞는 자연스러운 연결어를 사용하세요:
   
   **sceneDescription → coreNarrative 연결 (다양한 패턴)**:
   - "그런데 이 모든 것에는 어떤 비밀이 숨어있을까요? → 바로 그 이야기를..."
   - "왜 이렇게 특별할까요? → 그 이유는 바로..."  
   - "어떤 역사가 있을까요? → 실제로 이곳은..."
   - "무엇이 이렇게 만들었을까요? → 놀랍게도..."
   - "혹시 궁금하지 않으세요? → 말씀드리자면..."
   - "어떤 이야기일까요? → 역사를 돌아보면..."
   
   **coreNarrative → humanStories 연결 (다양한 패턴)**:
   - "이런 역사 속에는 감동적인 사람들이... → 바로 그 중 한 분이..."
   - "그 과정에서 놀라운 인물이... → 실제로 이 분은..."
   - "당시에는 특별한 사람들이... → 예를 들어..."
   - "이 모든 것 뒤에는 누군가의 노력이... → 그 주인공은..."
   - "역사의 뒤편에는 흥미로운 인물이... → 그 분의 이야기를 들어보면..."
   - "그 시대를 살았던 사람들 중에... → 특히 기억해야 할 분이..."

6. **사실 기반 스토리텔링**
   - humanStories에서는 반드시 역사적으로 검증된 인물이나 사건만 다룰 것
   - 가상의 인물이나 꾸며낸 일화 절대 금지
   - "기록에 따르면", "실제로", "역사서에 보면" 등 사실성 강조`,
    
    examples: {
      diverse_connections: [
        "자, 그런데 이 아름다운 모습 뒤에는 어떤 이야기가 숨어있을까요?",
        "혹시 이 건물이 왜 이렇게 지어졌는지 궁금하지 않으세요?", 
        "놀랍게도 이곳에는 우리가 모르는 놀라운 비밀이 있어요",
        "실제로 이 장소에는 정말 특별한 의미가 담겨있는데요",
        "그런데 말이죠, 여기서 정말 흥미로운 것은...",
        "어떤 사연이 있을까요? 함께 알아보시죠"
      ],
      natural_storytelling: [
        "마치 타임머신을 탄 것처럼 그 시대로 돌아가 보시죠",
        "상상해보세요. 수백 년 전 이곳에서는...",
        "그때 이 자리에 서 있던 사람들은 어떤 기분이었을까요?",
        "역사는 때로 우리에게 놀라운 이야기를 들려주는데요",
        "시간을 거슬러 올라가면 정말 드라마틱한 순간들이...",
        "그 시절 사람들의 마음을 한번 들여다볼까요?"
      ]
    }
  }
};

/**
 * 한국어 가이드 생성 프롬프트 (index.ts 호환용)
 */
export const createKoreanGuidePrompt = (
  locationName: string,
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS.ko;
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
` : '';

  const prompt = `# 🎙️ "${locationName}" 한국어 오디오 가이드 생성

## 🎭 당신의 역할
당신은 **단 한 명의 최고의 스토리텔러**입니다. 
한국어로 자연스럽고 매력적인 오디오 가이드를 생성하세요.

${specialistContext}

${userContext}

## 📋 출력 형식 요구사항

### 1. **순수 JSON만 반환**
- 서론, 설명, 코드블록(\`\`\`) 없이 오직 JSON만
- 완벽한 JSON 문법 준수 (쉼표, 따옴표, 괄호)
- 키 이름은 예시와 100% 동일하게 (번역 금지)

### 2. **자연스러운 한국어 스토리텔링**
- 친근한 구어체 사용
- 교육적이면서도 재미있는 구성
- 역사적 사실과 인간적 감정이 조화

### 3. **완전한 오디오 가이드 구조**
- overview: 장소 전체 개관
- route: 관람 순서와 동선
- realTimeGuide: 각 지점별 상세 가이드

${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}

**"${locationName}"의 자연스럽고 매력적인 한국어 오디오 가이드를 순수 JSON으로만 반환하세요!**`;

  return prompt;
};

/**
 * 개선된 자율 리서치 기반 AI 오디오 가이드 생성 프롬프트
 */
export const createAutonomousGuidePrompt = (
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): string => {
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

**🎯 제목 형식: "구체적 장소명 - 그 장소의 특징/의미"**

**✅ 다양한 제목 예시:**
- "경회루 - 조선 궁궐의 보석 같은 누각"
- "대웅전 - 부처님의 자비가 머무는 성역"  
- "전망대 - 도시 전체를 품은 파노라마"
- "중앙홀 - 웅장함과 신성함이 만나는 공간"

### 3. **3개 필드의 완벽한 연결 🚨 핵심 개선사항**

**✅ 올바른 구조:**
\`\`\`
sceneDescription: 배경지식 설명 + 현장 관찰 → 자연스러운 호기심 질문
coreNarrative: 호기심의 답 + 역사적 맥락 → 인물 이야기 예고  
humanStories: 실제 인물 이야기 → 감동적 마무리
nextDirection: (별도 분리) 이동 안내만
\`\`\`

**🚨 연결의 자연스러움 - 매우 중요!**
- 각 장소에 맞는 독창적이고 자연스러운 연결어 사용
- 뻔한 템플릿 말고 상황에 맞는 다양한 표현
- 마치 실제 가이드가 즉석에서 이야기하는 듯한 자연스러움

**❌ 피해야 할 템플릿식 표현:**
- "과연 이 장소가 어떤 특별한 이야기를 간직하고 있을까요?"
- "바로 그 비밀을 지금부터 들려드릴게요"
- "네, 바로 그 사람들의 이야기인데요"

**✅ 권장하는 자연스러운 표현:**
- "그런데 말이죠, 이 아름다운 모습에는..."
- "혹시 여러분도 궁금하지 않으세요?"
- "실제로 이곳에서는 놀라운 일이..."
- "역사를 들여다보면 정말 흥미로운 인물이..."

### 4. **풍부하고 독창적인 콘텐츠**
- 각 필드별 최소 분량 엄수 (위 기준 참조)
- 장소의 특성을 살린 독창적 묘사
- 뻔한 설명 대신 흥미진진한 스토리텔링
- 역사적 사실 + 인간적 감정 + 현장 몰입감

### 5. **동적 챕터 구성**
- **위치의 규모와 특성에 따라 적절한 개수의 챕터 생성**
- **소규모 장소: 3-4개, 중간 규모: 5-6개, 대규모 복합시설: 7-8개**
- **🔴 CRITICAL: route.steps와 realTimeGuide.chapters 개수 및 제목 완벽 일치**

## 💡 오디오 가이드 작성 예시

**❌ 나쁜 예시 (단절적, 템플릿식)**:
- sceneDescription: "광화문은 경복궁의 정문입니다. 높이는 20미터입니다."
- coreNarrative: "1395년에 건축되었습니다. 일제강점기에 이전되었습니다."
- humanStories: "세종대왕이 현판을 썼습니다. 복원 공사가 있었습니다."

**✅ 개선된 자연스러운 예시**:
- sceneDescription: "광화문은 조선왕조 500년 역사의 상징적인 정문으로, 단순한 출입구가 아니라 왕권과 백성을 연결하는 소통의 창구 역할을 했어요. 특히 이 문의 웅장한 규모와 세밀한 장식을 보시면, 조선 건축 기술의 정수를 느낄 수 있을 겁니다. 그런데 말이죠, 이 문이 왜 이렇게 크고 화려하게 지어졌는지 아세요?"
- coreNarrative: "그 이유는 바로 조선 초기 왕권 확립과 관련이 있어요. 태조 이성계가 1395년 경복궁을 창건하면서 광화문을 정문으로 삼은 것은 단순히 기능적 목적이 아니라, 새로운 왕조의 위엄과 정통성을 보여주기 위함이었죠. 하지만 이 문은 순탄한 역사만 겪은 것은 아니에요. 일제강점기에는 강제로 이전당했고, 해방 후에도 여러 번 자리를 옮겨야 했거든요. 그런데 이런 고난의 역사 속에서도 광화문을 지키고 복원하려 했던 분들이 계셨어요."
- humanStories: "그 중에서도 특히 기억해야 할 분이 바로 김정기 선생님이에요. 1968년 광화문 복원 공사 당시 문화재 전문가로 참여하신 분인데, 원형 복원을 위해 일제강점기에 촬영된 흑백사진 한 장 한 장을 분석하며 정확한 치수와 구조를 찾아내셨어요. 몇 년간의 치밀한 고증 작업 끝에 오늘날 우리가 보는 광화문의 모습이 완성된 거죠. 이런 분들의 노력이 있었기에 우리가 지금 이 역사적인 순간을 함께할 수 있는 겁니다."

## 📐 최종 JSON 구조:
${JSON.stringify(AUDIO_GUIDE_EXAMPLE, null, 2)}

## ✅ 최종 체크리스트
- [ ] 모든 텍스트가 ${langConfig.name}로 작성됨
- [ ] route.steps와 realTimeGuide.chapters 완벽 매칭
- [ ] 3개 필드가 자연스럽게 연결된 8-9분 스토리
- [ ] nextDirection은 별도 분리되어 이동 안내만
- [ ] 템플릿식 표현 대신 자연스럽고 독창적 스토리텔링
- [ ] JSON 문법 100% 정확

**🔴 핵심 개선사항 요약 🔴**
1. **3개 필드만 연결**: nextDirection은 별도 처리
2. **자연스러운 연결**: 템플릿 대신 상황별 다양한 표현
3. **독창적 스토리텔링**: 장소 특성을 살린 고유한 묘사
4. **완전한 분리**: 이동 안내는 오직 nextDirection에만

**지금 바로 "${locationName}"의 자연스럽고 매력적인 오디오 가이드를 순수 JSON으로만 반환하세요!**`;

  return prompt;
}

/**
 * 한국어 최종 가이드 생성 프롬프트 (index.ts 호환용)
 */
export const createKoreanFinalPrompt = (
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string => {
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

## 📐 최종 가이드 작성 지침

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
- [ ] 3개 필드가 끊김 없이 연결되는 하나의 대본

**🔴 필수 준수사항 🔴**
각 챕터는 한 사람이 10분간 쉬지 않고 이야기하는 것입니다!
sceneDescription → coreNarrative → humanStories가
물 흐르듯 자연스럽게 이어져야 합니다.
절대로 각 필드를 독립적인 섹션으로 작성하지 마세요!

**리서치 데이터를 완벽히 활용하여 "${locationName}"의 최고의 오디오 가이드를 만들어주세요!**`;

  return prompt;
}

/**
 * 구조 생성용 프롬프트 (overview + route만)
 */
export const createStructurePrompt = (
  locationName: string,
  language: string = 'ko',
  userProfile?: UserProfile
): string => {
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
export const createChapterPrompt = (
  locationName: string,
  chapterIndex: number,
  chapterTitle: string,
  existingGuide: any,
  language: string = 'ko',
  userProfile?: UserProfile
): string => {
  const langConfig = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.ko;

  return `🎙️ "${locationName}" 챕터 ${chapterIndex + 1}: "${chapterTitle}" 완전한 오디오 가이드 생성

🎯 미션
당신은 전문 관광 가이드로서 "${chapterTitle}" 지점에서 관광객들에게 들려줄 **완전하고 상세한** 오디오 가이드 스크립트를 작성해야 합니다.

📚 기존 가이드 컨텍스트
${JSON.stringify(existingGuide, null, 2)}

🚨 **절대 중요 - 완전한 내용 필수**
- narrative 필드에 **최소 1600-1800자의 완전한 내용** 작성 (절대 짧게 쓰지 마세요!)
- 현장 묘사 + 역사적 배경 + 인물 이야기를 **하나의 자연스러운 스토리**로 통합
- AI가 "...더 자세한 내용은..." 같은 미완성 표현 절대 사용 금지
- **완전하고 풍부한 실제 가이드 수준의 내용**을 작성하세요

📝 작성 구조 (하나의 narrative로 자연스럽게 연결)
1. **현장 묘사** (400-500자): 방문객이 실제로 보고 느낄 수 있는 생생한 장면
2. **역사적 배경** (600-700자): 이 장소의 역사, 건축적 특징, 문화적 의미
3. **인물 이야기** (300-400자): 실제 역사적 인물이나 검증된 일화
4. **다음 이동 안내** (100-200자): 구체적인 경로와 다음 장소 예고

🎭 스타일 가이드
- 친근한 구어체 ("여기서 주목할 점은", "흥미로운 사실은", "이야기를 들어보면" 등)
- 교육적이면서도 재미있는 스토리텔링
- 마치 옆에서 친구가 설명해주는 듯한 친근함
- **각 부분이 자연스럽게 이어지는 하나의 완전한 이야기**

🚫 **절대 금지사항**
- "안녕하세요", "여러분!", "네, 여러분!" 등의 인사말 절대 사용 금지 (챕터 1번부터)
- "...에 대해서는 다음에 더 자세히...", "...잠시 후 더 상세한 내용이..." 등 미완성 표현 금지
- 짧고 대충 쓰기 금지 - **반드시 1600-1800자의 풍부한 내용**

✅ **권장 시작 표현**
- "이곳에서..." "여기서 주목할 점은..." "흥미롭게도..."
- "바로 앞에 보이는..." "이 장소에서..."
- "이제 우리는..." "계속해서..." "다음으로 만나볼..."

✅ 필수 출력 형식
**중요: 순수 JSON만 출력하세요. 코드블록이나 설명 없이!**

{
  "chapter": {
    "id": ${chapterIndex},
    "title": "${chapterTitle}",
    "narrative": "이곳에서 가장 먼저 눈에 들어오는 것은... [현장의 생생한 묘사를 400-500자로 자세히 작성] ...그런데 이 장소가 왜 이렇게 특별할까요? 바로 [시기]에 [역사적 배경과 의미를 600-700자로 상세히 설명] ...이런 역사 속에는 정말 감동적인 인물들의 이야기가 있습니다. [실제 역사적 인물이나 검증된 일화를 400-500자로 풍부하게 서술] ...자, 이런 의미 깊은 이야기를 마음에 새기며 이제 다음 지점으로 이동해보겠습니다. [구체적인 이동 경로와 다음 장소 예고를 200-300자로] (총 1800-2000자의 완전한 스토리)",
    "nextDirection": "여기서 [구체적인 방향]으로 약 [거리/시간]만큼 이동하시면 [다음 장소명]이 나옵니다. 가시는 길에 [주변 볼거리나 특징]도 주목해보세요. 다음 장소에서는 [기대할 수 있는 내용]을 만나실 수 있습니다."
  }
}

🚨 절대 준수사항 🚨
- **narrative 필드는 반드시 1800-2000자 (최소 1800자!)**
- 서론이나 설명 없이 바로 JSON 시작
- 코드블록 표시 절대 금지  
- 문법적으로 완벽한 JSON 형식
- 미완성 내용이나 "추후 보완" 같은 표현 절대 금지

지금 바로 "${chapterTitle}" 챕터의 **완전하고 풍부한** 오디오 가이드를 생성해주세요!`;
}

// 기타 유틸리티 함수들
export const createKoreanStructurePrompt = createStructurePrompt;
export const createKoreanChapterPrompt = createChapterPrompt;
// 🎯 NAVI 프롬프트 개선 - 현재 시스템 완벽 호환
// 기존 JSON 스키마와 TourContent.tsx 컴포넌트 100% 호환

export function createImprovedPrompt(
  locationName: string,
  userProfile?: UserProfile
): string {
  
  // 현재 TourContent.tsx가 읽는 구조에 완벽 호환
  const improvedPrompt = `안녕하세요! 오늘 ${locationName}의 놀라운 이야기들을 함께 탐험해볼 거예요! 😊

🌟 정말 흥미진진한 내용들을 준비했어요!

제가 여러분께 들려드릴 것들:
👑 실제 역사 인물들의 구체적 행적과 결정 과정
🏛️ 건축 설계의 정확한 배경과 기술적 특징  
💎 건립 과정과 각 시대별 변천사의 상세 기록
🎨 예술 작품들의 창작 의도와 기법적 분석
📖 각 공간의 실제 용도와 일어난 역사적 사건들

${generatePersonalTouch(userProfile)}

💫 제가 설명드리는 방식:

📚 **정확하고 밀도 높은 정보**
- 구체적 인물명, 정확한 연도, 실제 치수와 재료
- 건립 당시의 정치적 상황과 결정 배경  
- 각 시대별 개보수와 변화의 구체적 내용

🏛️ **건축과 예술의 전문적 해설**
- 건축 양식과 공법의 기술적 특징
- 장인들의 실제 작업 과정과 소요 기간
- 예술 작품의 창작 기법과 문화적 의미

👥 **인물과 사건 중심의 실제 기록**
- 역사적 인물들의 구체적 활동과 업적
- 각 시대에 실제 일어난 사건들의 상세 내용
- 당시 사회 문화적 배경과 그 영향

🎯 **중요한 원칙 (반드시 지켜주세요!)**

1. **현재 JSON 구조 완벽 준수**
   - overview (제목, 요약, 주요 정보)
   - route.steps (관람 순서 단계별)
   - realTimeGuide.chapters (실시간 가이드 챕터들)

2. **모든 챕터를 풍성하고 정확하게**
   - 각 챕터마다 충실한 내용 (최소 400자씩)
   - 구체적 사실과 정확한 정보
   - 상냥하고 친근한 설명 방식

3. **TourContent 컴포넌트 호환성**
   - sceneDescription: 현재 위치의 생생한 묘사 (300자+)
   - coreNarrative: 역사적 사실과 의미 (500자+)  
   - humanStories: 인물들의 구체적 이야기 (400자+)
   - nextDirection: 다음 장소 이동 안내 (200자+)

4. **상냥하고 전문적인 말투**
   - "여러분", "정말 흥미로운 점은", "꼭 주목해보세요"
   - "제가 가장 인상 깊었던 건", "놓치면 안 될 포인트는"

5. **정확한 정보만 사용**
   - 구체적 인물명, 정확한 연도, 실제 치수
   - 검증 가능한 역사적 사실
   - 건축 기법과 재료의 정확한 명칭

반드시 다음 JSON 형식으로만 응답하세요:

{
  "overview": {
    "title": "${locationName}",
    "summary": "친근한 요약 설명",
    "keyFacts": ["주요 사실 1", "주요 사실 2", "주요 사실 3"],
    "visitInfo": {
      "duration": 90,
      "difficulty": "쉬움",
      "season": "사계절"
    }
  },
  "route": {
    "steps": [
      {
        "step": 1,
        "title": "첫 번째 관람 지점",
        "location": "구체적 위치",
        "coordinates": {"lat": 0.0, "lng": 0.0}
      }
    ]
  },
  "realTimeGuide": {
    "startingLocation": {
      "name": "시작 위치명",
      "address": "정확한 주소",
      "googleMapsUrl": "구글맵 링크",
      "coordinates": {"lat": 0.0, "lng": 0.0}
    },
    "chapters": [
      {
        "id": 1,
        "title": "첫 번째 관람 지점",
        "coordinates": {"lat": 0.0, "lng": 0.0},
        "sceneDescription": "현재 위치의 생생한 묘사 (최소 300자)",
        "coreNarrative": "역사적 사실과 의미 상세 설명 (최소 500자)",
        "humanStories": "관련 인물들의 구체적 이야기 (최소 400자)",
        "nextDirection": "다음 장소로의 상세한 이동 안내 (최소 200자)"
      }
    ]
  }
}

자, 그럼 ${locationName}의 깊이 있는 역사 탐험을 시작해볼까요? ✨`;

  return improvedPrompt;
}

// 개인화 터치 (현재 시스템과 호환)
function generatePersonalTouch(userProfile?: UserProfile): string {
  if (!userProfile) return '';
  
  const interests = userProfile.interests || [];
  const level = userProfile.knowledgeLevel || 'intermediate';
  
  let personalTouch = '';
  
  if (interests.includes('역사')) {
    personalTouch += `📚 역사를 좋아하신다니! 특별히 준비한 역사적 배경 이야기들을 자세히 들려드릴게요.\n`;
  }
  
  if (interests.includes('건축')) {
    personalTouch += `🏗️ 건축에 관심이 있으시군요! 설계자들의 의도와 혁신적 기법들을 상세히 설명해드릴게요.\n`;
  }
  
  if (level === 'expert') {
    personalTouch += `🎓 전문적인 지식을 원하시는군요! 학술적 깊이와 최신 연구 결과까지 포함해드릴게요.\n`;
  } else if (level === 'beginner') {
    personalTouch += `😊 쉽고 재미있게 설명해드릴게요! 어려운 용어는 바로바로 풀어서 설명해드릴게요.\n`;
  }
  
  return personalTouch;
}

// 타입 정의 (현재 시스템 호환)
interface UserProfile {
  interests?: string[];
  ageGroup?: string;
  knowledgeLevel?: string;
  companions?: string;
}

// 🎯 현재 TourContent.tsx와 완벽 호환되는 개선사항
export const TOURCONTENTCOMPATIBLE_IMPROVEMENTS = {
  jsonStructure: {
    현재구조: 'overview + route + realTimeGuide',
    챕터필드: 'sceneDescription, coreNarrative, humanStories, nextDirection',
    컴포넌트: 'TourContent.tsx가 직접 읽는 구조',
    변경사항: '없음 - 100% 호환'
  },
  
  contentImprovement: {
    제거할것: [
      '감각적 글자수 채우기',
      '추상적 표현',
      '확인되지 않은 전설'
    ],
    
    강화할것: [
      '구체적 역사적 사실',
      '정확한 인물명과 연도',
      '상냥하고 친근한 말투',
      '밀도 높은 전문 정보'
    ]
  }
};

// 즉시 적용 가능한 함수
export function createOptimizedPromptForCurrentSystem(
  locationName: string, 
  userProfile?: UserProfile
): string {
  return createImprovedPrompt(locationName, userProfile);
}
import { 
  UserProfile, 
  LOCATION_TYPE_CONFIGS, 
  LANGUAGE_CONFIGS,
  analyzeLocationType,
  generateTypeSpecificExample
} from './index';

export function createKoreanGuidePrompt(
  locationName: string,
  userProfile?: UserProfile
): string {
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
- 권장 챕터 구성: ${typeConfig.chapterStructure}
` : '';

  return `# ${locationName} 오디오 가이드 생성 미션

## 🎭 당신의 전문 역할
당신은 **세상에서 가장 박학다식하고 수다스러운 ${typeConfig?.expertRole || '여행 가이드'}**입니다. 
당신의 임무는 방문객들에게 해당 명소의 모든 지식을 전문가 수준으로 상세하게 전달하는 것입니다.

## 🎯 목표
방문객이 '${locationName}'에 대해 모르는 것이 없도록, 모든 세부 정보와 역사적 사실을 총망라한, 
**매우 상세하고 긴 한국어 오디오 가이드** JSON 객체를 생성하는 것입니다.

**출력 언어**: 한국어 (ko)

${userContext}

${specialistContext}

## 📐 출력 형식
절대적으로, 반드시 아래 규칙을 따라 순수한 JSON 객체 하나만 반환해야 합니다.
- 서론, 본론, 결론, 주석, 코드블록 등 JSON 이외의 어떤 텍스트도 포함해서는 안 됩니다.
- 모든 문자열은 따옴표로 감싸고, 객체와 배열의 마지막 요소 뒤에는 쉼표를 붙이지 않는 등 JSON 문법을 100% 완벽하게 준수해야 합니다.
- JSON 구조와 키 이름은 아래 예시와 완전히 동일해야 합니다. 키 이름을 절대 번역하거나 바꾸지 마세요.
- **JSON 문법 오류는 치명적인 실패로 간주됩니다.**

최종 결과물 구조 예시:
${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}

## 🎯 가이드 스타일 (가장 중요!)

### **정보 중심 서술 원칙**
- 감정적 미사여구 절대 금지: "마음이 평온해진다", "가슴이 두근거린다", "아름답다", "신비롭다", "감동적이다" 등
- 부정확한 위치 지칭 금지: "여기서", "저기서", "저 앞에", "이쪽으로", "그곳에서" 등
- 구체적 사실 중심: 정확한 년도, 인물명, 치수, 재료, 기술적 세부사항, 역사적 배경
- 정확한 위치 명시: "매표소에서 출발하여", "본당 정면 중앙 기둥 앞에서", "동쪽 담장을 따라 50미터 걸으면" 등
- 전문 지식 과다 제공: 일반인이 모를 법한 세부사항도 친절하고 상세하게 설명
- 연관 정보 풍부하게: 관련 인물, 시대적 배경, 기술적 혁신, 문화적 맥락 등

### **전 챕터 공통 요구사항**
모든 챕터는 다음을 자연스러운 흐름으로 통합하여 포함해야 함:

1. **구체적 위치 기준점** (최소 50자): 명확한 랜드마크나 시설물 기준으로 정확한 위치 명시
2. **해당 지점의 상세한 역사적 배경** (최소 250자): 건립 시기, 역사적 맥락, 시대적 상황
3. **기술적/건축적 특징** (최소 200자): 재료, 공법, 크기, 치수, 기술적 혁신점
4. **관련 인물과 상세한 일화** (최소 200자): 구체적 인물명, 생애, 업적, 흥미로운 에피소드
5. **문화적/종교적 의미** (최소 150자): 해당 문화권에서의 의미, 상징성, 사회적 가치
6. **다음 지점 이동 안내** (최소 50자): 구체적 방향과 거리, 다음 관람 포인트 예고

### **1장 인트로 특별 강화**
첫 번째 챕터는 반드시 **입구/매표소/시작 지점**에서의 종합적 배경 설명:
- 해당 명소의 전체 역사적 배경 (최소 400자)
- 건립 당시의 정치/사회적 상황 (최소 300자)
- 주요 인물의 상세한 생애와 업적 (최소 350자)
- 건축/예술적 기법과 혁신점 (최소 300자)
- 문화재로서의 가치와 학술적 의미 (최소 200자)
- 전체 관람 동선 개요와 소요 시간 (최소 150자)

### **자연스러운 통합 서술 방식**
각 챕터 내에서 모든 정보를 하나의 자연스러운 흐름으로 통합하세요:

예시: "매표소를 지나 첫 번째 돌계단에 서시면, 바로 이곳이 751년 신라 경덕왕 10년 김대성이 석굴암 건립을 시작한 지점입니다. 김대성은 당시 신라 최고 권력자 중 한 명으로, 원성왕의 외삼촌이자 재상이었죠. 이 계단의 화강암 블록들을 자세히 보시면 각각 서로 다른 크기로 정교하게 다듬어져 있는데, 이는 신라 석공들의 뛰어난 기술력을 보여줍니다..."

### **절대 금지 사항**
- sceneDescription/coreNarrative/humanStories 기계적 분리
- "아름답다", "신비롭다", "감동적이다" 등 추상적 형용사
- "마음이 평온해진다", "기분이 좋아진다" 등 감정 묘사
- "여기", "저기", "그곳" 등 불명확한 위치 지칭
- 내용 없는 분위기 묘사로 글자 수 채우기
- 반복되는 상투적 표현 사용
- 일반적이고 뻔한 내용으로 채우기

### **필수 포함 요소**
- 구체적 연도와 정확한 인물명
- 기술적 세부사항 (재료, 공법, 크기, 치수 등)
- 역사적 배경과 정치적 상황
- 문화재로서의 학술적 가치
- 정확한 위치 기준점과 이동 경로
- 전문가 수준의 상세한 지식
- 각 챕터마다 풍부하고 실질적인 정보량 확보

## 📍 챕터 구성 필수 요구사항
- **최소 5-7개 챕터 생성**: 주요 관람 포인트마다 별도 챕터 구성
- **관람 동선 순서대로 배치**: 입구부터 출구까지 효율적인 한붓그리기 경로
- **route.steps와 realTimeGuide.chapters 동기화 필수**: 
  * route.steps 배열과 realTimeGuide.chapters 배열의 개수가 **반드시 정확히 일치**해야 함
  * 각 step의 title과 해당 chapter의 title이 **완전히 동일**해야 함
  * step 순서와 chapter 순서가 **정확히 일치**해야 함
  * 이 규칙을 위반하면 시스템 오류가 발생합니다!
- **각 필드별 최소 작성 기준 준수**: 위에서 명시한 최소 글자 수 반드시 충족
- **절대 빈 내용 금지**: 모든 필드는 반드시 실제 정보로 가득 채워야 함

## 📝 구체적인 요청사항
한국어로 "${locationName}"에 대한 완전한 오디오 가이드 JSON을 생성하세요.

**중요 체크리스트:**
- realTimeGuide.chapters 배열에 최소 5-7개 챕터 포함
- route.steps와 realTimeGuide.chapters 개수 및 title 완전 일치
- 각 챕터의 모든 정보가 강화된 최소 글자 수로 충실히 작성됨
- 관람 동선에 따른 순차적 챕터 배치 (입구→주요 관람지→출구)
- JSON 문법 100% 정확성 확보
- 박학다식한 전문 가이드 수준의 상세한 정보 제공
- 정확한 위치 기준점 명시와 구체적인 이동 안내`;
}

export function createKoreanFinalPrompt(
  locationName: string,
  researchData: any,
  userProfile?: UserProfile
): string {
  const userContext = userProfile ? `
👤 사용자 맞춤 정보:
- 관심사: ${userProfile.interests?.join(', ') || '일반'}
- 연령대: ${userProfile.ageGroup || '성인'}
- 지식수준: ${userProfile.knowledgeLevel || '중급'}
- 동행자: ${userProfile.companions || '혼자'}
` : '👤 일반 관광객 대상';

  return `# 🖋️ "${locationName}" 최종 오디오 가이드 완성 미션

## 🎯 당신의 역할과 미션
당신은 **최종 오디오 가이드 작가 AI(Final Audio Guide Writer AI)**입니다.
제공된 리서치 데이터를 기반으로, 방문객을 위한 완벽한 한국어 오디오 가이드 JSON 객체를 완성하는 것입니다.

**생성 언어**: 한국어 (ko)

${userContext}

## 📚 제공된 리서치 데이터
이 데이터를 기반으로 모든 스크립트를 작성하세요.

${JSON.stringify(researchData, null, 2)}

## 📐 최종 JSON 출력 형식
반드시 아래 예시와 완전히 동일한 구조, 동일한 키, 동일한 타입의 JSON만 반환하세요.
- 코드블록을 절대 포함하지 마세요.
- 설명, 안내문구, 주석 등 일체의 부가 텍스트를 포함하지 마세요.
- JSON 문법(따옴표, 쉼표, 중괄호/대괄호 등)을 반드시 준수하세요.

${JSON.stringify({ 
  content: { 
    overview: {}, 
    route: { steps: [] }, 
    realTimeGuide: { chapters: [] } 
  } 
}, null, 2)}

## 🎯 품질 기준
리서치 데이터를 바탕으로, 한국 최고 수준의 문화관광해설사의 품질로 스크립트를 작성하세요. 
**분량에 제한 없이**, 명소와 관련된 **모든 배경지식, 숨겨진 이야기, 역사적 사실**을 포함하여 가장 상세하고 깊이 있는 내용을 제공해야 합니다. 
**명소 내 모든 세부 장소를 하나도 빠짐없이 포함**하여, 방문객이 원하는 곳을 선택해 들을 수 있는 완전한 가이드를 만드세요. 
**관람 동선은 입장부터 퇴장까지 가장 효율적인 한붓그리기 동선으로 설계하여, 방문객이 불필요하게 되돌아가거나 두 번 이동하는 일이 없도록 해야 합니다.** 
풍부한 스토리텔링과 생생한 묘사는 필수입니다.`;
}
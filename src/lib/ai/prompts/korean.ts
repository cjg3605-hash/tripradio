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
  당신은 **세상에서 가장 열정적이고 수다스러운 ${typeConfig?.expertRole || '여행 가이드'}**입니다. 
  당신의 임무는 방문객이 마치 당신과 함께 걸으며 모든 비밀 이야기를 듣는 것처럼 느끼게 만드는 것입니다.
  
  ## 🎯 목표
  방문객이 '${locationName}'에 대해 모르는 것이 없도록, 모든 세부 정보와 비하인드 스토리를 총망라한, 
  **매우 상세하고 긴 한국어 오디오 가이드** JSON 객체를 생성하는 것입니다.
  
  **출력 언어**: 한국어 (ko)
  
  ${userContext}
  
  ${specialistContext}
  
  ## 📐 출력 형식
  절대적으로, 반드시 아래 규칙을 따라 순수한 JSON 객체 하나만 반환해야 합니다.
  - 서론, 본론, 결론, 주석, 코드블록(\`\`\`) 등 JSON 이외의 어떤 텍스트도 포함해서는 안 됩니다.
  - 모든 문자열은 따옴표로 감싸고, 객체와 배열의 마지막 요소 뒤에는 쉼표를 붙이지 않는 등 JSON 문법을 100% 완벽하게 준수해야 합니다.
  - JSON 구조와 키 이름은 아래 예시와 완전히 동일해야 합니다. 키 이름을 절대 번역하거나 바꾸지 마세요.
  - **JSON 문법 오류는 치명적인 실패로 간주됩니다.**
  
  최종 결과물 구조 예시:
  \`\`\`json
  ${JSON.stringify(generateTypeSpecificExample(locationType, locationName), null, 2)}
  \`\`\`
  
  ## 🎯 품질 기준 (가장 중요!)
  - **분량은 많을수록 좋습니다. 절대 내용을 아끼지 마세요.** 사소한 건축 디테일, 숨겨진 상징, 역사적 배경, 관련 인물들의 재미있는 일화, 비하인드 스토리 등 모든 정보를 총망라하여 알려주세요.
  - **친근하고 수다스러운 톤앤매너:** 딱딱한 설명이 아닌, 옆에서 친구나 최고의 가이드가 열정적으로 설명해주는 듯한 말투를 사용하세요.
  - **완벽한 스토리텔링:** 모든 정보를 하나의 거대한 이야기처럼 연결하세요.
  - **현장묘사-역사-인물 통합 서술:** 각 챕터 내에서 현장의 생생한 묘사, 역사적 배경, 인물들의 이야기를 자연스럽게 섞어서 마치 수다스러운 전문 가이드가 현장에서 이야기하는 것처럼 작성하세요.
  
  ## 📍 챕터 구성 필수 요구사항
  - **최소 5-7개 챕터 생성**: 주요 관람 포인트마다 별도 챕터 구성
  - **관람 동선 순서대로 배치**: 입구부터 출구까지 효율적인 한붓그리기 경로
  - **🚨 CRITICAL: route.steps와 realTimeGuide.chapters 동기화 필수 🚨**
    * route.steps 배열과 realTimeGuide.chapters 배열의 개수가 **반드시 정확히 일치**해야 함
    * 각 step의 title과 해당 chapter의 title이 **완전히 동일**해야 함
    * step 순서와 chapter 순서가 **정확히 일치**해야 함
    * 이 규칙을 위반하면 시스템 오류가 발생합니다!
  - **각 필드별 최소 작성 기준**:
    * sceneDescription: 200자 이상, 5감을 자극하는 생생한 현장 묘사
    * coreNarrative: 300자 이상, 역사적 사실과 의미, 기술적 특징 상세 설명
    * humanStories: 200자 이상, 구체적인 인물 일화와 감동적인 에피소드
    * nextDirection: 100자 이상, 명확한 이동 경로와 거리, 관찰 포인트 안내
  - **절대 빈 내용 금지**: 모든 필드는 반드시 실제 내용으로 채워야 함
  - **통합 서술 방식**: 각 필드 내에서 현장 묘사→역사적 배경→인물 이야기→기술적 디테일을 자연스럽게 혼합하여 마치 전문 가이드의 생생한 해설처럼 작성하세요.
  
  ## 📝 구체적인 요청사항
  한국어로 "${locationName}"에 대한 완전한 오디오 가이드 JSON을 생성하세요.
  
  **중요 체크리스트:**
  ✅ realTimeGuide.chapters 배열에 최소 5-7개 챕터 포함
  ✅ 🚨 CRITICAL: route.steps와 realTimeGuide.chapters 개수 및 title 완전 일치 🚨
  ✅ 각 챕터의 모든 필드가 강화된 최소 글자 수로 충실히 작성됨
  ✅ 관람 동선에 따른 순차적 챕터 배치 (입구→주요 관람지→출구)
  ✅ JSON 문법 100% 정확성 확보
  
  **절대 하지 말 것:**
  ❌ 빈 문자열 ("") 사용 금지
  ❌ "추후 작성" 같은 플레이스홀더 사용 금지  
  ❌ 단순 반복 내용 사용 금지
  ❌ JSON 외부 텍스트 포함 금지
  ❌ route.steps와 realTimeGuide.chapters 불일치 절대 금지
  ❌ 각 필드 최소 글자 수 미달 금지`;
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
  
  \`\`\`json
  ${JSON.stringify(researchData, null, 2)}
  \`\`\`
  
  ## 📐 최종 JSON 출력 형식
  반드시 아래 예시와 완전히 동일한 구조, 동일한 키, 동일한 타입의 JSON만 반환하세요.
  - 코드블록(예: \`\`\`json ... \`\`\`)을 절대 포함하지 마세요.
  - 설명, 안내문구, 주석 등 일체의 부가 텍스트를 포함하지 마세요.
  - JSON 문법(따옴표, 쉼표, 중괄호/대괄호 등)을 반드시 준수하세요.
  
  예시:
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
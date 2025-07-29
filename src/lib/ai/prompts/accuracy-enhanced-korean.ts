// 정확성 강화된 한국어 가이드 생성 프롬프트 시스템 (전세계 적용)

import { UserProfile } from '@/types/guide';
import { 
  LANGUAGE_CONFIGS, 
  LOCATION_TYPE_CONFIGS, 
  analyzeLocationType,
  getRecommendedSpotCount 
} from './index';

/**
 * 🚨 정확성 보장 시스템 - 단계별 검증
 */
const ACCURACY_VERIFICATION_SYSTEM = {
  // 1단계: 정보 제한 원칙
  INFORMATION_RESTRICTIONS: `
🚨 **절대 금지 항목 (Zero Tolerance Policy)**:

1. **특정 상점/업체명 언급 절대 금지**
   - ❌ "OO서점", "XX카페", "YY레스토랑" 등 구체적 업체명
   - ❌ "유명한 OO집", "인기 있는 XX매장" 등
   - ✅ 허용: "독립서점들", "카페들", "음식점들" (복수형 일반 명사만)

2. **확인되지 않은 시설/공간 설명 금지**
   - ❌ "문화 공연 공간", "야외 전시장", "아트 갤러리" (실제 존재 확인 불가한 경우)
   - ❌ "OO거리", "XX광장" (공식 명칭이 아닌 경우)
   - ✅ 허용: "중앙 광장", "메인 통로" 등 일반적 공간 지칭

3. **과장된 수치/통계 금지**
   - ❌ "200여 개의 상점", "수백 명의 방문객"
   - ❌ "최고의", "최대 규모의", "가장 유명한"
   - ✅ 허용: "다양한 상점들", "많은 방문객들"

4. **추측성 서술 완전 금지**
   - ❌ "아마도", "추정됩니다", "것으로 보입니다"
   - ❌ "전해져 내려오는", "알려져 있는"
   - ✅ 허용: "기록에 따르면", "공식 자료에 의하면"`,

  // 2단계: 사실 검증 기준
  FACT_VERIFICATION_CRITERIA: `
✅ **사실 검증 3단계 필터**:

**1단계 - 기본 사실만 사용**
- 공식 개장/개관 연도 (정확한 연도만)
- 건축 양식, 구조적 특징 (객관적 관찰 가능한 것만)
- 지리적 위치, 규모 (측정 가능한 것만)

**2단계 - 일반적 역사/문화 정보**
- 해당 지역의 일반적 역사 (구체적 장소보다는 지역 차원)
- 건축 양식의 일반적 특징과 의미
- 문화적 배경 (특정 장소보다는 전반적 맥락)

**3단계 - 보편적 교육 정보**
- 건축 기법의 일반 원리
- 도시 계획의 보편적 개념
- 문화적 활동의 일반적 의미`,

  // 3단계: 안전한 서술 방식
  SAFE_DESCRIPTION_PATTERNS: `
🎯 **안전한 서술 패턴 (전세계 적용)**:

**공간 묘사시:**
- "이 공간은 [객관적 특징]으로 구성되어 있습니다"
- "여기서 볼 수 있는 것은 [시각적으로 확인 가능한 것]입니다"
- "[건축적 특징]이 이 공간의 특징을 보여줍니다"

**역사/문화 설명시:**
- "이런 형태의 건축은 일반적으로 [보편적 특징]을 가집니다"
- "이 지역은 [일반적 역사적 맥락] 속에서 발전했습니다"
- "이러한 공간 배치는 [보편적 원리]를 따릅니다"

**경험/감상 안내시:**
- "이곳에서는 [구체적 활동]을 즐길 수 있습니다"
- "방문객들은 일반적으로 [보편적 경험]을 합니다"
- "이 공간의 [객관적 특징]이 특별한 분위기를 만듭니다"`
};

/**
 * 🌍 글로벌 적용 가능한 범용 정보 구조
 */
const UNIVERSAL_GUIDE_STRUCTURE = {
  CHAPTER_TYPES: {
    entrance: "입구/접근 공간",
    main_area: "중심 공간", 
    cultural_zone: "문화/전시 공간",
    commercial_zone: "상업/편의 공간",
    rest_area: "휴식/여가 공간",
    connection: "연결/이동 공간"
  },

  SAFE_CONTENT_TEMPLATES: {
    physical_description: `
이 공간은 [구체적 건축 양식/스타일]로 설계되었으며, 
[객관적으로 관찰 가능한 구조적 특징]을 보여줍니다. 
[재료/색상/형태] 등의 요소들이 [공간의 기능/목적]에 
맞게 배치되어 있습니다.`,

    historical_context: `
이러한 형태의 [건축/공간/시설]은 일반적으로 
[시대적 배경/문화적 맥락] 속에서 만들어집니다. 
[해당 지역/국가]의 [일반적 문화적 특징]이 
이 공간의 설계에 영향을 주었습니다.`,

    functional_explanation: `
이 공간은 주로 [구체적 기능/용도]를 위해 만들어졌으며,
방문객들은 여기서 [구체적 활동들]을 경험할 수 있습니다.
[공간의 배치/동선]은 [기능적 목적]을 고려해 설계되었습니다.`
  }
};

/**
 * 🎯 정확성 강화된 한국어 가이드 프롬프트 생성
 */
const createAccuracyEnhancedKoreanPrompt = (
  locationName: string,
  userProfile?: UserProfile
): string => {
  const locationType = analyzeLocationType(locationName);
  const spotCount = getRecommendedSpotCount(locationName);
  
  return `# 🎯 정확성 보장 AI 가이드 생성 (전세계 적용)

## 📍 대상 장소: "${locationName}"
- 위치 유형: ${locationType}
- 권장 챕터 수: ${spotCount.default}개 (${spotCount.min}-${spotCount.max}개 범위)

${ACCURACY_VERIFICATION_SYSTEM.INFORMATION_RESTRICTIONS}

${ACCURACY_VERIFICATION_SYSTEM.FACT_VERIFICATION_CRITERIA}

${ACCURACY_VERIFICATION_SYSTEM.SAFE_DESCRIPTION_PATTERNS}

## 🎯 **핵심 미션**
당신은 **정확성을 최우선으로 하는 전문 가이드**입니다.
확인되지 않은 정보보다는 부족하더라도 정확한 정보를 제공하세요.

## 📝 **필수 출력 형식**

\`\`\`json
{
  "overview": {
    "title": "${locationName} 가이드",
    "description": "[객관적 설명만, 과장 금지]",
    "totalDuration": "[예상 소요시간]",
    "highlights": ["[검증 가능한 특징들만]"]
  },
  "essentialInfo": {
    "locationAccess": "[교통/접근 방법 - 일반적 정보만]",
    "openingHours": "[운영시간 - 확실한 경우만, 불확실시 '공식 홈페이지 확인 요망']",
    "admissionFee": "[입장료 - 확실한 경우만]",
    "facilities": ["[실제 존재하는 시설들만]"]
  },
  "realTimeGuide": {
    "chapters": [
      {
        "id": 0,
        "title": "[구체적 공간명]: [객관적 특징]",
        "narrative": "[500-600자] [절대 확실한 정보만 포함된 설명]",
        "description": "[정확한 위치 설명 - 관광객이 실제 도착하는 지점: 메인 출입구, 방문자센터, 주출입구 등 구체적 시작지점 명시]",
        "nextDirection": "[명확한 이동 안내]"
      }
    ]
  },
  "safetyGuidelines": ["[일반적 안전 수칙들]"],
  "recommendedRoute": {
    "description": "[논리적 동선 설명]",
    "estimatedTime": "[현실적 소요시간]"
  }
}
\`\`\`

## 🚨 **최종 검증 체크리스트**
생성 전 반드시 확인:
- [ ] 구체적 업체명/상점명 언급 없음
- [ ] "최고의", "가장 유명한" 등 과장 표현 없음  
- [ ] 추측성 표현("아마도", "것으로 보임") 없음
- [ ] 확인되지 않은 시설/공간 설명 없음
- [ ] 모든 수치는 일반적/추정치로만 표현
- [ ] 역사적 정보는 일반적 맥락 수준에서만
- [ ] 실존하지 않을 수 있는 특정 공간/시설 언급 없음

**기억하세요: 틀린 정보 하나가 전체 가이드의 신뢰성을 무너뜨립니다.**
**확실하지 않으면 말하지 마세요. 정확성이 완성도보다 중요합니다.**`;
};

/**
 * 🌍 전세계 적용을 위한 범용 검증 시스템
 */
const createGlobalAccuracyPrompt = (
  locationName: string,
  countryCode: string = 'KR',
  userProfile?: UserProfile
): string => {
  return `# 🌍 Global Accuracy-First Guide Generation

## 📍 Target Location: "${locationName}" (${countryCode})

## 🚨 **UNIVERSAL ACCURACY RULES** (Apply to ALL locations worldwide)

### **ABSOLUTELY FORBIDDEN:**
1. **Specific business names** (restaurants, shops, cafes by name)
2. **Unverified facilities** (claiming specific amenities that may not exist)
3. **Exaggerated claims** ("most famous", "largest", "best")
4. **Speculative information** ("probably", "seems to be", "reportedly")
5. **Invented statistics** (visitor numbers, shop counts without verification)

### **SAFE TO INCLUDE:**
1. **Architectural observations** (visible structural features)
2. **General historical context** (regional/national history, not specific to venue)
3. **Universal cultural patterns** (typical activities for this type of location)
4. **Basic practical information** (general access methods, typical facilities)
5. **Observable spatial characteristics** (layout, design style, atmosphere)

### **REQUIRED VERIFICATION APPROACH:**
- If unsure about specific details → Use general terms
- If facility existence uncertain → Don't mention it
- If historical claim unverifiable → Use broader cultural context
- If number/statistic unknown → Use qualitative descriptions

## 🎯 **OUTPUT REQUIREMENT:**
Generate a factual, conservative guide that prioritizes accuracy over completeness.
Better to have less information that's 100% accurate than detailed information that might be wrong.

**Remember: One false claim destroys entire guide credibility.**`;
};

// Export functions
export {
  createAccuracyEnhancedKoreanPrompt,
  createGlobalAccuracyPrompt,
  ACCURACY_VERIFICATION_SYSTEM,
  UNIVERSAL_GUIDE_STRUCTURE
};
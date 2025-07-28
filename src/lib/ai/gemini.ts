import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiCircuitBreaker } from '@/lib/circuit-breaker';

// 환경변수 확인 및 초기화
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY가 설정되지 않았습니다. 더미 데이터를 사용합니다.');
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// UserProfile은 types/guide.ts에서 import
import { UserProfile } from '@/types/guide';

// Import accuracy-enhanced prompts and validation
import { createAccuracyEnhancedKoreanPrompt } from './prompts/accuracy-enhanced-korean';
import { 
  validateAccuracy, 
  sanitizeResponse, 
  shouldRegenerate,
  generateAccuracyReport 
} from './validation/accuracy-validator';

export const GEMINI_PROMPTS = {
  GUIDE_GENERATION: {
    system: `# 🎯 정확성 최우선 전문 관광 가이드 AI (전세계 적용)

## 🚨 **절대 금지 사항 (Zero Tolerance Policy)**

### 1. **특정 업체명 언급 절대 금지**
- ❌ "OO서점", "XX카페", "YY레스토랑", "ZZ호텔" 등 구체적 업체명
- ❌ "유명한 OO집", "인기 있는 XX매장", "맛있는 YY점"
- ❌ "ABC 빵집", "DEF 커피숍", "GHI 레스토랑"
- ✅ **허용**: "독립서점들", "카페들", "음식점들", "상점들" (복수형 일반 명사만)

### 2. **확인되지 않은 시설/공간 설명 금지**
- ❌ "문화 공연 공간", "야외 전시장", "아트 갤러리" (실제 존재 확인 불가)
- ❌ "OO거리", "XX광장", "YY파크" (공식 명칭이 아닌 경우)
- ❌ "북카페", "루프탑 바", "팝업스토어" (존재 불확실)
- ✅ **허용**: "중앙 광장", "메인 통로", "휴식 공간" (일반적 공간 지칭)

### 3. **과장된 수치/통계 금지**
- ❌ "200여 개의 상점", "수백 명의 방문객", "최대 1만명 수용"
- ❌ "최고의", "최대 규모의", "가장 유명한", "세계 최초"
- ❌ "90% 만족도", "평점 4.8점" (검증 불가능한 통계)
- ✅ **허용**: "다양한 상점들", "많은 방문객들", "널리 알려진"

### 4. **추측성 서술 완전 금지**
- ❌ "아마도", "추정됩니다", "것으로 보입니다", "~할 것 같습니다"
- ❌ "전해져 내려오는", "소문에 의하면", "알려져 있는"
- ❌ "~인 듯합니다", "~로 여겨집니다", "~로 추정됩니다"
- ✅ **허용**: "기록에 따르면", "공식 자료에 의하면", "문서에 의하면"

## ✅ **사실 검증 3단계 필터**

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
- 문화적 활동의 일반적 의미

## 🎯 **핵심 미션**
당신은 **정확성을 최우선으로 하는 전문 가이드**입니다.
확인되지 않은 정보보다는 부족하더라도 정확한 정보를 제공하세요.

## 📝 **출력 형식** (반드시 유효한 JSON)
{
  "overview": "명소 개요 (객관적 설명만, 과장 금지)",
  "history": "역사적 배경 (일반적 맥락 위주)",
  "highlights": ["검증 가능한 특징들만"],
  "visitRoute": {
    "totalDuration": 90,
    "description": "현실적 관람 동선",
    "steps": [
      {
        "order": 1,
        "location": "일반적 공간명",
        "duration": "현실적 시간",
        "description": "확실한 정보만 포함"
      }
    ]
  },
  "detailedStops": [
    {
      "order": 1,
      "name": "객관적 장소명",
      "navigation": "명확한 이동 안내",
      "content": "검증된 사실만 포함 (200-300자)",
      "keyPoints": ["확실한 특징만"],
      "guideNote": "실용적 조언",
      "duration": 15,
      "coordinates": {
        "lat": 37.5665,
        "lng": 126.9780,
        "description": "정확한 위치 설명"
      }
    }
  ],
  "personalizedNote": "개인화 메시지"
}

## 🔍 **설명 스타일**
- 친근한 말투로 "~입니다", "~해요" 사용
- 복잡한 개념은 쉬운 비유로 설명
- **검증된 사실과 일반적 정보만 포함**
- 확실하지 않으면 "일반적으로" 또는 생략`,

    user: (location: string, profile: UserProfile) => `
명소: ${location}

사용자 정보:
- 관심사: ${profile.interests?.join(', ') || '일반'}
- 희망시간: ${profile.tourDuration || 90}분
- 스타일: ${profile.preferredStyle || '친근함'}

🚨 **정확성 검증 체크리스트** (생성 전 반드시 확인):
- [ ] 구체적 업체명/상점명 언급 없음
- [ ] "최고의", "가장 유명한" 등 과장 표현 없음  
- [ ] 추측성 표현("아마도", "것으로 보임") 없음
- [ ] 확인되지 않은 시설/공간 설명 없음
- [ ] 모든 수치는 일반적/추정치로만 표현
- [ ] 역사적 정보는 일반적 맥락 수준에서만
- [ ] 실존하지 않을 수 있는 특정 공간/시설 언급 없음

**허용되는 표현만 사용**:
- "카페들", "음식점들", "상점들" (복수형 일반명사)
- "다양한", "여러", "많은" (구체적 수치 대신)
- "일반적으로", "보통", "대체로" (추측 대신)
- "기록에 따르면", "공식 자료에 의하면" (사실 근거)

**전세계 적용 원칙**:
- 한국뿐만 아니라 전세계 어느 장소에서도 동일한 정확성 기준 적용
- 문화적 차이를 고려하되 정확성은 절대 타협하지 않음
- 지역별 특성은 일반적 맥락에서만 언급

이 사용자를 위한 **정확성 보장** 개인화 가이드를 JSON 형식으로 생성하세요.

🚨 **최종 확인사항**:
- JSON 외에 다른 텍스트 없이 순수 JSON만 응답
- 문자열 내 따옴표는 \\"로 이스케이프
- 모든 중괄호와 대괄호가 올바르게 닫혀야 함
- detailedStops 각 항목에 정확한 coordinates (lat, lng) 정보 필수 포함

**기억하세요: 틀린 정보 하나가 전체 가이드의 신뢰성을 무너뜨립니다.**
**확실하지 않으면 말하지 마세요. 정확성이 완성도보다 중요합니다.**`
  }
};

// 이전 함수명과의 호환성을 위해 추가
export const generateGuide = generatePersonalizedGuide;

export async function generatePersonalizedGuide(
  location: string,
  userProfile: UserProfile
) {
  // userProfile 안전성 검사 및 기본값 설정 (함수 최상단으로 이동)
  const safeProfile: UserProfile = {
    interests: userProfile?.interests || ['history'],
    ageGroup: userProfile?.ageGroup || '30s',
    knowledgeLevel: userProfile?.knowledgeLevel || 'intermediate',
    companions: userProfile?.companions || 'solo',
    tourDuration: userProfile?.tourDuration || 90,
    preferredStyle: userProfile?.preferredStyle || 'friendly',
    language: userProfile?.language || 'ko'
  };

  try {
    // 서킷 브레이커로 AI 호출 보호
    return await aiCircuitBreaker.call(async () => {
      // Gemini API가 없는 경우 더미 데이터 반환
      if (!genAI) {
        console.log('🎭 더미 데이터로 가이드 생성:', location);
        return generateFallbackGuide(location, safeProfile);
      }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite-preview-06-17"
    });
    
    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 16384, // 대폭 증가: 4096 → 16384
      // @ts-ignore - topK is supported by the API but not in types
      topK: 40
    };

    const prompt = `${GEMINI_PROMPTS.GUIDE_GENERATION.system}

${GEMINI_PROMPTS.GUIDE_GENERATION.user(location, safeProfile)}`;

    console.log('🤖 Gemini 라이브러리에서 프롬프트 전송 중...');

    // Generate content by passing the prompt string directly
    const result = await model.generateContent(prompt);
    
    // Get the response and extract text
    const response = await result.response;
    const responseText = await response.text();
    
    try {
      // 디버깅을 위한 로그
      if (process.env.NODE_ENV === 'development') {
        const textLength = responseText.length;
        const textPreview = responseText.substring(0, 200);
        console.log('🤖 원본 AI 응답 길이:', textLength);
        console.log('📝 응답 미리보기:', textPreview + '...');
        
        // 좌표 정보 확인
        const hasCoordinates = responseText.includes('coordinates') || responseText.includes('lat');
        console.log('📍 좌표 정보 포함 여부:', hasCoordinates);
      }
      
      let cleanedText = responseText.trim();
      
      // 마크다운 코드 블록 제거
      cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      cleanedText = cleanedText.replace(/```\s*/, '');
      
      // 앞뒤 공백 및 불필요한 텍스트 제거
      cleanedText = cleanedText.trim();
      
      // 첫 번째 { 찾기
      const startIndex = cleanedText.indexOf('{');
      if (startIndex === -1) {
        throw new Error('JSON 시작 중괄호를 찾을 수 없습니다');
      }
      
      // 중괄호 균형을 맞춰서 JSON 끝 찾기
      let openBraces = 0;
      let endIndex = -1;
      
      for (let i = startIndex; i < cleanedText.length; i++) {
        if (cleanedText[i] === '{') {
          openBraces++;
        } else if (cleanedText[i] === '}') {
          openBraces--;
          if (openBraces === 0) {
            endIndex = i;
            break;
          }
        }
      }
      
      if (endIndex === -1) {
        throw new Error('JSON 종료 중괄호를 찾을 수 없습니다');
      }
      
      const jsonString = cleanedText.substring(startIndex, endIndex + 1);
      console.log('📦 추출된 JSON 길이:', jsonString.length);
      
      const parsed = JSON.parse(jsonString);
      
      // 파싱된 데이터에서 좌표 정보 확인
      if (process.env.NODE_ENV === 'development') {
        const hasDetailedStops = !!parsed.detailedStops;
        const stopsCount = parsed.detailedStops?.length || 0;
        const hasCoordinatesInStops = parsed.detailedStops?.some((stop: any) => stop.coordinates) || false;
        
        console.log('🎯 파싱된 데이터 분석:', {
          hasDetailedStops,
          stopsCount,
          hasCoordinatesInStops,
          sampleStop: parsed.detailedStops?.[0]
        });
        
        if (parsed.detailedStops?.length > 0) {
          parsed.detailedStops.forEach((stop: any, index: number) => {
            console.log(`📍 Stop ${index + 1}:`, {
              name: stop.name,
              hasCoordinates: !!stop.coordinates,
              coordinates: stop.coordinates
            });
          });
        }
      }

      // 🔍 정확성 검증 시스템 적용
      console.log('🔍 AI 응답 정확성 검증 시작...');
      const validationResult = validateAccuracy(parsed, location);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 검증 결과:', {
          isValid: validationResult.isValid,
          riskScore: validationResult.riskScore,
          violationCount: validationResult.violations.length,
          violations: validationResult.violations
        });
      }

      // 재생성 필요성 판단
      const regenerationDecision = shouldRegenerate(validationResult.violations, validationResult.riskScore);
      
      if (regenerationDecision.shouldRegenerate && regenerationDecision.severity === 'critical') {
        console.warn('🚨 Critical accuracy violations detected - using fallback guide');
        console.warn('위반사항:', validationResult.violations);
        
        // 심각한 정확성 위반 시 안전한 폴백 가이드 사용
        return generateFallbackGuide(location, safeProfile);
      }

      // 경미한 위반사항이 있는 경우 자동 정제
      let finalResponse = parsed;
      if (!validationResult.isValid && regenerationDecision.severity !== 'critical') {
        console.log('🧹 경미한 위반사항 자동 정제 중...');
        const sanitizationResult = sanitizeResponse(parsed);
        finalResponse = sanitizationResult.sanitized;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 정제 변경사항:', sanitizationResult.changes);
        }
      }

      // 정확성 리포트 생성 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        const accuracyReport = generateAccuracyReport(
          location, 
          validationResult, 
          !validationResult.isValid ? sanitizeResponse(parsed) : undefined
        );
        console.log('📋 정확성 리포트:', accuracyReport);
      }

      console.log('✅ JSON 파싱 및 정확성 검증 완료');
      return finalResponse;
      
    } catch (parseError) {
      console.error('JSON 파싱 실패:', parseError);
      console.log('실패한 응답 (처음 500자):', responseText.substring(0, 500));
      console.log('실패한 응답 (마지막 500자):', responseText.substring(Math.max(0, responseText.length - 500)));
      throw new Error(`AI 응답을 파싱할 수 없습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
    });
  } catch (error) {
    console.error('❌ 서킷 브레이커 또는 AI 생성 실패:', error);
    
    // 서킷 브레이커가 열린 경우 폴백 응답
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('서킷 브레이커')) {
      console.log('🔄 서킷 브레이커 열림 - 폴백 가이드 생성:', location);
      return generateFallbackGuide(location, safeProfile);
    }
    
    // 기타 에러는 그대로 던짐
    throw error;
  }
}

// 더미 데이터 생성 함수 (API 키 없을 때 사용)
function generateFallbackGuide(location: string, userProfile: UserProfile) {
  // 안전한 접근을 위한 기본값 설정
  const tourDuration = userProfile?.tourDuration || 90;
  const preferredStyle = userProfile?.preferredStyle || 'friendly';
  
  return {
    overview: `${location}은(는) 역사와 문화가 살아 숨쉬는 특별한 장소입니다. 이곳에서 당신만의 특별한 여행 경험을 만들어보세요.`,
    history: `${location}은(는) 오랜 세월 동안 많은 사람들에게 사랑받아온 명소입니다. 각 시대마다 다른 이야기들이 이곳에 스며들어 있어요.`,
    highlights: [
      "아름다운 건축양식과 독특한 디자인",
      "깊은 역사적 의미와 문화적 가치", 
      "방문객들이 꼭 봐야 할 포토스팟"
    ],
    visitRoute: {
      totalDuration: tourDuration,
      description: "효율적이고 재미있는 관람 동선을 추천드립니다",
      steps: [
        {
          order: 1,
          location: "입구 및 외관",
          duration: "20분",
          description: "전체적인 모습을 감상하고 역사적 배경을 이해합니다"
        },
        {
          order: 2,
          location: "주요 내부 공간",
          duration: "40분", 
          description: "가장 중요한 볼거리들을 차례대로 둘러봅니다"
        },
        {
          order: 3,
          location: "특별 전시 공간",
          duration: "30분",
          description: "세부적인 볼거리와 숨겨진 이야기들을 발견합니다"
        }
      ]
    },
    detailedStops: [
      {
        order: 1,
        name: `${location} 입구`,
        navigation: "정문에서 시작하여 전체적인 모습을 먼저 감상해보세요",
        content: `자, 이제 ${location}에 도착했습니다! 먼저 전체적인 모습을 천천히 둘러보시면서 이 곳의 웅장함을 느껴보세요. 멀리서 보는 것과 가까이서 보는 것이 완전히 다른 느낌을 줄 거예요.`,
        keyPoints: [
          "독특한 건축 양식의 특징",
          "전체적인 규모와 배치", 
          "주변 환경과의 조화"
        ],
        guideNote: "사진을 찍기에도 좋은 포인트니까 여러 각도로 담아보세요!",
        duration: 20
      },
      {
        order: 2,
        name: `${location} 내부`,
        navigation: "입구를 통해 내부로 들어가시면 메인 공간이 나타납니다",
        content: `이제 내부로 들어가볼까요? 내부에는 정말 놀라운 것들이 가득해요. 천장부터 바닥까지, 곳곳에 숨겨진 이야기들이 있답니다. 천천히 걸으면서 세부적인 장식들도 놓치지 마세요.`,
        keyPoints: [
          "내부 장식의 의미와 상징",
          "건축 기법의 특별함",
          "당시 사람들의 생활상"
        ],
        guideNote: "이곳에서는 조용히 감상하는 것이 예의예요. 다른 방문객들도 배려해주세요.",
        duration: 40
      },
      {
        order: 3,
        name: `${location} 특별 공간`,
        navigation: "메인 공간에서 좀 더 깊숙이 들어가면 특별한 공간들이 있어요",
        content: `마지막으로 이 특별한 공간을 소개해드릴게요. 여기는 많은 사람들이 놓치고 지나가는 곳인데, 사실 가장 중요한 의미를 담고 있는 곳이랍니다. 시간을 충분히 갖고 여유롭게 둘러보세요.`,
        keyPoints: [
          "숨겨진 보물 같은 볼거리",
          "특별한 역사적 사건들",
          "현재까지 이어지는 의미"
        ],
        guideNote: "여기서의 경험이 오래도록 기억에 남을 거예요. 마음속에 깊이 새겨두세요!",
        duration: 30
      }
    ],
    personalizedNote: `${preferredStyle === 'friendly' ? '친구' : '여행자'}님! ${location}에서의 특별한 시간이 되길 바라요. 이곳의 이야기들이 당신의 마음에 오래도록 남기를 희망합니다. 🌟`
  };
} 
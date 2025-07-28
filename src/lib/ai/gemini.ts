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
// import { createAccuracyEnhancedKoreanPrompt } from './prompts/accuracy-enhanced-korean';
import { 
  validateAccuracy, 
  sanitizeResponse, 
  shouldRegenerate,
  generateAccuracyReport,
  verifyWithExternalData
} from './validation/accuracy-validator';

// Import data orchestrator for fact verification
import { DataIntegrationOrchestrator } from '../data-sources/orchestrator/data-orchestrator';

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
  userProfile: UserProfile,
  integratedData?: any
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
    // 🚀 고성능 데이터 수집 활용
    let dataIntegrationResult = integratedData;
    if (!dataIntegrationResult) {
      const orchestrator = DataIntegrationOrchestrator.getInstance();
      dataIntegrationResult = await orchestrator.integrateLocationData(
        location.trim(),
        undefined,
        {
          dataSources: ['unesco', 'wikidata', 'government', 'google_places'],
          includeReviews: true,
          includeImages: true,
          language: safeProfile.language,
          performanceMode: 'speed' // 🚀 성능 최적화 모드 활성화
        }
      );
    }

    // 서킷 브레이커로 AI 호출 보호
    return await aiCircuitBreaker.call(async () => {
      // Gemini API가 없는 경우 더미 데이터 반환
      if (!genAI) {
        console.log('🎭 더미 데이터로 가이드 생성:', location);
        return generateFallbackGuide(location, safeProfile, dataIntegrationResult);
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

    // 🔥 Critical: 사실 기반 프롬프트 생성
    const factBasedPrompt = createFactBasedPrompt(
      location, 
      safeProfile, 
      dataIntegrationResult
    );

    console.log('🤖 Gemini 라이브러리에서 프롬프트 전송 중...', {
      location,
      hasIntegratedData: !!dataIntegrationResult,
      dataConfidence: dataIntegrationResult?.data?.confidence || 0,
      promptLength: factBasedPrompt.length
    });

    // Generate content by passing the prompt string directly
    const result = await model.generateContent(factBasedPrompt);
    
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
        return generateFallbackGuide(location, safeProfile, integratedData);
      }

      // 🔥 Critical: 실제 데이터와 교차 검증
      const verificationResult = verifyWithExternalData(
        parsed, 
        location, 
        dataIntegrationResult?.data
      );

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
        console.log('📊 팩트 검증 결과:', verificationResult);
      }

      console.log('✅ JSON 파싱 및 정확성 검증 완료');
      return {
        ...finalResponse,
        dataIntegration: dataIntegrationResult,
        factVerification: verificationResult
      };
      
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
      return generateFallbackGuide(location, safeProfile, integratedData);
    }
    
    // 기타 에러는 그대로 던짐
    throw error;
  }
}

// 🔥 새로 추가할 함수
function createFactBasedPrompt(
  location: string, 
  profile: UserProfile, 
  dataResult: any
): string {
  if (!dataResult?.success || !dataResult?.data) {
    return `${GEMINI_PROMPTS.GUIDE_GENERATION.system}

⚠️ **데이터 제한 안내**: ${location}에 대한 외부 검증 데이터가 부족합니다.
일반적인 정보만을 바탕으로 제한된 가이드를 생성하며, 정확성을 보장할 수 없습니다.

${GEMINI_PROMPTS.GUIDE_GENERATION.user(location, profile)}`;
  }

  const factualInfo = formatFactualData(dataResult.data);
  
  return `${GEMINI_PROMPTS.GUIDE_GENERATION.system}

🔍 **검증된 사실 정보** (아래 정보만 사용하세요):
${factualInfo}

**데이터 신뢰도**: ${(dataResult.data.confidence * 100).toFixed(1)}%
**검증 소스**: ${dataResult.sources.join(', ')}
**데이터 수집 시간**: ${new Date().toLocaleString('ko-KR')}

⚠️ **중요**: 위에 제시된 검증된 정보만을 사용하여 가이드를 생성하세요.
확인되지 않은 정보는 절대 포함하지 마세요.

${GEMINI_PROMPTS.GUIDE_GENERATION.user(location, profile)}`;
}

function formatFactualData(data: any): string {
  let factualInfo = '';
  
  if (data.location) {
    factualInfo += `📍 **위치 정보**:\n`;
    factualInfo += `- 좌표: ${data.location.coordinates?.lat}, ${data.location.coordinates?.lng}\n`;
    factualInfo += `- 주소: ${data.location.address?.formatted || '정보 없음'}\n\n`;
  }
  
  if (data.basicInfo) {
    factualInfo += `ℹ️ **기본 정보**:\n`;
    factualInfo += `- 공식명: ${data.basicInfo.officialName || data.location?.name || '정보 없음'}\n`;
    factualInfo += `- 유형: ${data.location?.category || '정보 없음'}\n`;
    factualInfo += `- 설명: ${data.basicInfo.description || '정보 없음'}\n\n`;
  }
  
  if (data.sources && data.sources.length > 0) {
    factualInfo += `📚 **검증 소스별 정보**:\n`;
    data.sources.forEach((source: any, index: number) => {
      factualInfo += `${index + 1}. ${source.sourceName}: ${(source.reliability * 100).toFixed(0)}% 신뢰도\n`;
    });
  }
  
  return factualInfo || '검증된 구체적 정보가 부족합니다.';
}

/**
 * 외부 데이터를 AI가 이해하기 쉬운 형태로 포맷
 */
function formatExternalDataForAI(integratedData: any, location: string): string {
  const sections: string[] = [];
  
  // 헤더 섹션
  sections.push(`

## 🔍 **검증된 외부 데이터 소스 (필수 활용)**

다음은 "${location}"에 대한 **실제 검증된 정보**입니다. 이 데이터를 바탕으로 정확한 가이드를 작성하세요.

**데이터 신뢰도**: ${Math.round(integratedData.confidence * 100)}%
**검증 상태**: ${integratedData.verificationStatus?.isValid ? '✅ 완전 검증' : '⚠️ 부분 검증'}
**데이터 소스**: ${Object.keys(integratedData.sources || {}).join(', ')}

---`);

  // 문화재/유산 정보 (국가유산청 WFS)
  if (integratedData.sources?.heritage?.data) {
    const heritageData = Array.isArray(integratedData.sources.heritage.data) 
      ? integratedData.sources.heritage.data 
      : [integratedData.sources.heritage.data];
    
    sections.push(`

### 🏛️ **문화재/유산 정보** (국가유산청)
`);
    
    heritageData.slice(0, 5).forEach((item: any, index: number) => {
      sections.push(`
**${index + 1}. ${item.title || item.ccbaMnm || '이름 없음'}**
- 분류: ${item.category || item.ccmaName || '미지정'}
- 위치: ${item.address || item.vlocName || '위치 정보 없음'}
- 지정일: ${item.designatedDate || item.ccbaAsdt || '미상'}
- 관리기관: ${item.adminOrg || item.ccbaAdmin || '미상'}${item.culturalAssetNo || item.crltsnoNm ? `
- 문화재 번호: ${item.culturalAssetNo || item.crltsnoNm}` : ''}${item.hasCoordinates ? `
- GPS 좌표: 정밀 위치 보유` : ''}`);
    });
  }

  // 정부기관 정보 (한국관광공사)
  if (integratedData.sources?.government?.data) {
    const govData = Array.isArray(integratedData.sources.government.data) 
      ? integratedData.sources.government.data 
      : [integratedData.sources.government.data];
    
    sections.push(`

### 🏢 **정부기관 정보** (한국관광공사)
`);
    
    govData.slice(0, 3).forEach((item: any, index: number) => {
      sections.push(`
**${index + 1}. ${item.title || item.name || '이름 없음'}**
- 주소: ${item.addr1 || item.address || '주소 정보 없음'}
- 전화: ${item.tel || '전화번호 없음'}${item.homepage ? `
- 홈페이지: ${item.homepage}` : ''}${item.overview ? `
- 설명: ${item.overview.substring(0, 100)}...` : ''}`);
    });
  }

  // Google Places 정보
  if (integratedData.sources?.google_places?.data) {
    const placesData = Array.isArray(integratedData.sources.google_places.data) 
      ? integratedData.sources.google_places.data 
      : [integratedData.sources.google_places.data];
    
    sections.push(`

### 📍 **Google Places 정보** (실시간)
`);
    
    placesData.slice(0, 3).forEach((item: any, index: number) => {
      sections.push(`
**${index + 1}. ${item.name || '이름 없음'}**
- 주소: ${item.formatted_address || item.vicinity || '주소 정보 없음'}
- 평점: ${item.rating ? `⭐ ${item.rating}/5 (${item.user_ratings_total || 0}개 리뷰)` : '평점 없음'}
- 상태: ${item.opening_hours?.open_now ? '✅ 현재 운영 중' : '⚠️ 운영 상태 확인 필요'}${item.price_level ? `
- 가격대: ${'$'.repeat(item.price_level)} (${item.price_level}/4)` : ''}`);
    });
  }

  // UNESCO 정보
  if (integratedData.sources?.unesco?.data) {
    const unescoData = Array.isArray(integratedData.sources.unesco.data) 
      ? integratedData.sources.unesco.data 
      : [integratedData.sources.unesco.data];
    
    sections.push(`

### 🌍 **UNESCO 세계유산 정보**
`);
    
    unescoData.slice(0, 2).forEach((item: any, index: number) => {
      sections.push(`
**${index + 1}. ${item.name || '이름 없음'}**
- 등재연도: ${item.date_inscribed || '미상'}
- 유형: ${item.category || '미분류'}
- 기준: ${item.criteria || '미상'}${item.short_description ? `
- 설명: ${item.short_description.substring(0, 150)}...` : ''}`);
    });
  }

  // Wikidata 정보
  if (integratedData.sources?.wikidata?.data) {
    const wikidataInfo = integratedData.sources.wikidata.data;
    sections.push(`

### 📊 **구조화된 지식 정보** (Wikidata)
- 공식명: ${wikidataInfo.label || '미상'}
- 설명: ${wikidataInfo.description || '설명 없음'}${wikidataInfo.coordinate ? `
- 정확한 좌표: ${wikidataInfo.coordinate.lat}, ${wikidataInfo.coordinate.lng}` : ''}${wikidataInfo.inception ? `
- 건립/설립: ${wikidataInfo.inception}` : ''}${wikidataInfo.architect ? `
- 건축가: ${wikidataInfo.architect}` : ''}`);
  }

  // 중요 지침
  sections.push(`

---

**🚨 AI 가이드 작성 지침**:
1. 위 검증된 데이터의 정보를 **최우선**으로 활용하세요
2. 문화재 번호, 지정일, 관리기관 등 **정확한 공식 정보** 포함
3. 실시간 운영 상태(Google Places)를 반영하세요
4. 평점과 리뷰 수를 언급하여 **신뢰성** 제공
5. 정확한 주소와 연락처 정보 포함
6. **추측이나 불확실한 정보는 절대 포함하지 마세요**

`);

  return sections.join('');
}

// 더미 데이터 생성 함수 (API 키 없을 때 사용)  
function generateFallbackGuide(location: string, userProfile: UserProfile, integratedData?: any) {
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
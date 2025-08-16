/**
 * 🌍 Gemini AI 기반 전세계 범용 지역정보 추출 시스템
 * 
 * 전세계 모든 장소명에 대해 정확한 지역명과 국가코드를 추출하여
 * DB의 location_region, country_code 컬럼에 저장할 수 있도록 처리
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// 추출된 지역 정보 인터페이스
export interface ExtractedLocationInfo {
  placeName: string;           // 입력받은 원본 장소명
  standardName: string;        // 국제 표준 영문명
  city: string;               // 소재 도시명 (영어)
  region: string;             // 소재 지역/주/도명 (영어) - DB location_region 컬럼용
  country: string;            // 국가명 (한국어)
  countryCode: string;        // ISO 3166-1 alpha-3 - DB country_code 컬럼용
  coordinates?: {
    lat: number;
    lng: number;
  };
  confidence: number;         // 신뢰도 (0-1)
  reasoning: string;          // 선택 근거
  alternatives?: string[];    // 다른 동명 후보지들
}

/**
 * 🎯 전세계 범용 지역정보 추출 전문가 페르소나 + 완벽한 프롬프트
 */
function createUniversalLocationPrompt(placeName: string, language: string = 'ko'): string {
  return `당신은 세계 최고의 지리학자이자 관광지 전문가입니다.

🎓 전문 자격:
- 25년간 전세계 200개국 모든 도시와 관광지 연구
- 유네스코 세계유산, 국제 랜드마크, 역사적 건축물 전문가
- 동명이지역(같은 이름의 다른 장소) 구분 최고 전문가
- 다국어 지명 정확한 위치 매핑 전문가 (한국어, 영어, 중국어, 일본어, 스페인어, 프랑스어, 독일어, 이탈리아어 등)

📍 분석 대상: "${placeName}"

🔍 체계적 분석 프로세스 (단계별로 수행):

1️⃣ **입력 분석**
- 언어 확인: 한국어/영어/현지어/로마자 표기 등
- 철자 변형: 구어체, 줄임말, 별명 포함
- 다국어 매핑: 같은 장소의 다른 언어 표기

2️⃣ **동명 후보지 전체 나열**
- 전세계에서 "${placeName}"와 같거나 유사한 이름의 모든 장소
- 관광지, 건축물, 자연명소, 도시, 지역 모두 포함
- 각 후보지의 정확한 위치와 특징

3️⃣ **가장 유명한 곳 선택 기준** (우선순위 순)
- 유네스코 세계유산 > 국가적 랜드마크 > 국제적 유명 관광지
- 수도/대도시 소재 > 중소도시 소재
- 국제적 인지도 > 지역적 인지도  
- 연간 방문객 수 > 검색 빈도
- 역사적/문화적 중요성

4️⃣ **정확한 위치 확정**
- 구체적 장소명 → 소재 도시 → 소재 지역/주/도 → 국가
- 행정구역 정확성 검증
- 지리적 좌표 확인

5️⃣ **ISO 3166-1 alpha-3 국가코드 매핑**

🌍 **완전한 국가코드 참조표** (전세계 모든 국가):

**아시아-태평양**:
KOR(한국), JPN(일본), CHN(중국), TWN(대만), HKG(홍콩), MAC(마카오)
THA(태국), VNM(베트남), SGP(싱가포르), MYS(말레이시아), IDN(인도네시아), PHL(필리핀), BRN(브루나이), MMR(미얀마), KHM(캄보디아), LAO(라오스)
IND(인도), PAK(파키스탄), BGD(방글라데시), LKA(스리랑카), NPL(네팔), BTN(부탄), MDV(몰디브)
AUS(호주), NZL(뉴질랜드), FJI(피지), PNG(파푸아뉴기니)

**유럽**:
FRA(프랑스), DEU(독일), GBR(영국), ITA(이탈리아), ESP(스페인), PRT(포르투갈), NLD(네덜란드), BEL(벨기에), CHE(스위스), AUT(오스트리아), LUX(룩셈부르크)
SWE(스웨덴), NOR(노르웨이), DNK(덴마크), FIN(핀란드), ISL(아이슬란드)
RUS(러시아), POL(폴란드), CZE(체코), SVK(슬로바키아), HUN(헝가리), ROU(루마니아), BGR(불가리아), SVN(슬로베니아), HRV(크로아티아), SRB(세르비아), MNE(몬테네그로), BIH(보스니아헤르체고비나), MKD(북마케도니아), ALB(알바니아), GRC(그리스)
UKR(우크라이나), BLR(벨라루스), LTU(리투아니아), LVA(라트비아), EST(에스토니아)

**아메리카**:
USA(미국), CAN(캐나다), MEX(멕시코)
BRA(브라질), ARG(아르헨티나), CHL(칠레), PER(페루), COL(콜롬비아), VEN(베네수엘라), ECU(에콰도르), BOL(볼리비아), URY(우루과이), PRY(파라과이), GUY(가이아나), SUR(수리남)

**아프리카**:
EGY(이집트), LBY(리비아), TUN(튀니지), DZA(알제리), MAR(모로코)
ZAF(남아프리카공화국), ETH(에티오피아), KEN(케냐), TZA(탄자니아), UGA(우간다), RWA(르완다), GHA(가나), NGA(나이지리아), SEN(세네갈)

**중동**:
TUR(터키), ISR(이스라엘), JOR(요단), LBN(레바논), SYR(시리아), IRQ(이라크), IRN(이란), SAU(사우디아라비아), ARE(아랍에미리트), QAT(카타르), KWT(쿠웨이트), BHR(바레인), OMN(오만), YEM(예멘)

6️⃣ **신뢰도 자체 평가**
- 위치 확실성: 90% 이상 (확실함) / 70-89% (거의 확실함) / 50-69% (보통) / 50% 미만 (불확실함)
- 동명이지역 구분 정확도
- 국가코드 매핑 정확도

🎯 **체계적 분석 방법론**:
- 장소명 언어/표기 분석: 한국어, 영어, 현지어, 로마자 표기 모두 고려
- 전세계 동명 후보지 식별: 같은 이름의 모든 지역/건물/명소 나열
- 우선순위 적용: 유네스코 세계유산 > 수도/대도시 랜드마크 > 국제 관광지 > 지역 명소
- 정확한 위치 확정: 구체적 장소 → 소재 도시 → 지역/주/도 → 국가 순서로 매핑
- ISO 국가코드 정확 매핑: 완전한 참조표 기반으로 정확한 3자리 코드 선택

⚠️ **절대 원칙**: 
- 확실하지 않으면 confidence를 낮춰서 표시 (최소 0.7 이상만 반환)
- 절대로 추측하지 말고 정확한 정보만 제공
- 동명이지역이 있다면 가장 유명한 곳을 선택하고 alternatives에 다른 후보 명시
- 빠른 응답을 위해 핵심 분석에 집중 (10초 내 응답 목표)

🔍 **효율적 분석 단계**:
1. 입력 장소명의 언어와 가능한 변형 파악 (2초)
2. 가장 유명한 동명 후보 3개 이내로 좁히기 (3초)  
3. 최우선 후보의 정확한 위치 정보 확정 (3초)
4. ISO 국가코드와 지역명 매핑 (2초)

JSON으로만 응답하세요:
{
  "placeName": "${placeName}",
  "standardName": "국제 표준 영문명",
  "city": "소재 도시명 (영어)",
  "region": "소재 지역/주/도명 (영어)",
  "country": "국가명 (한국어)",
  "countryCode": "ISO 3166-1 alpha-3 코드",
  "coordinates": {"lat": 0.0, "lng": 0.0},
  "confidence": 0.95,
  "reasoning": "선택한 구체적 근거와 이유",
  "alternatives": ["동명이지역이 있다면 다른 후보지들"]
}`;
}

/**
 * Gemini AI 클라이언트 초기화
 */
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * 🤖 Gemini AI로 전세계 장소의 지역정보 추출 (메인 함수)
 */
export async function extractLocationInfoWithGemini(
  placeName: string, 
  language: string = 'ko'
): Promise<ExtractedLocationInfo | null> {
  const MAX_RETRIES = 3;
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🤖 Gemini 전세계 지역정보 추출 (${attempt}/${MAX_RETRIES}): "${placeName}"`);
      
      const gemini = getGeminiClient();
      const model = gemini.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          temperature: 0.1, // 정확성 우선을 위해 낮은 온도 설정
          maxOutputTokens: 400, // 효율성을 위해 토큰 감소 (JSON 응답에 최적화)
          topK: 10, // 더 확실한 선택을 위해 감소
          topP: 0.9, // 일관성 향상
          responseMimeType: "application/json", // JSON 강제 모드
        }
      });

      const prompt = createUniversalLocationPrompt(placeName, language);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`📄 Gemini 응답 (${text.length}자):`, text.substring(0, 200) + '...');
      
      // JSON 파싱
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // 필수 필드 검증
          if (parsed.countryCode && parsed.region && parsed.country && parsed.city) {
            console.log(`✅ Gemini 지역정보 추출 성공 (시도 ${attempt}):`, {
              placeName: parsed.placeName,
              city: parsed.city,
              region: parsed.region,
              country: parsed.country,
              countryCode: parsed.countryCode,
              confidence: parsed.confidence || 'N/A'
            });
            
            return {
              placeName: parsed.placeName || placeName,
              standardName: parsed.standardName || placeName,
              city: parsed.city,
              region: parsed.region,
              country: parsed.country,
              countryCode: parsed.countryCode,
              coordinates: parsed.coordinates || { lat: 0, lng: 0 },
              confidence: parsed.confidence || 0.8,
              reasoning: parsed.reasoning || '정확한 매핑',
              alternatives: parsed.alternatives || []
            };
          } else {
            throw new Error(`필수 필드 누락: ${JSON.stringify(parsed)}`);
          }
        } else {
          throw new Error(`JSON 형식을 찾을 수 없음`);
        }
      } catch (parseError) {
        const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
        console.log(`❌ Gemini JSON 파싱 실패 (시도 ${attempt}):`, errorMsg);
        throw parseError;
      }
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Gemini API 시도 ${attempt} 실패:`, error);
      
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ ${1000 * attempt}ms 대기 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }
  }
  
  // 🚨 모든 시도 실패 - null 반환 (절대 기본값 사용 금지)
  console.error(`🚨 Gemini API ${MAX_RETRIES}회 모두 실패, 마지막 오류:`, lastError);
  console.error(`❌ "${placeName}" 지역정보 추출 완전 실패`);
  
  return null;
}

/**
 * 🎯 DB 저장용 간소화된 지역정보만 추출
 * 
 * @param placeName 장소명
 * @param language 언어 (기본값: 'ko')
 * @returns DB의 location_region, country_code 컬럼에 바로 사용 가능한 데이터
 */
export async function extractLocationForDB(
  placeName: string, 
  language: string = 'ko'
): Promise<{ location_region: string; country_code: string } | null> {
  try {
    const locationInfo = await extractLocationInfoWithGemini(placeName, language);
    
    if (!locationInfo) {
      console.error(`❌ "${placeName}" DB용 지역정보 추출 실패`);
      return null;
    }
    
    // DB 컬럼 형식으로 변환
    const dbData = {
      location_region: locationInfo.region,
      country_code: locationInfo.countryCode
    };
    
    console.log(`✅ "${placeName}" DB용 지역정보 추출 성공:`, dbData);
    return dbData;
    
  } catch (error) {
    console.error(`❌ "${placeName}" DB용 지역정보 추출 중 오류:`, error);
    return null;
  }
}

/**
 * 🔄 배치 처리: 여러 장소의 지역정보를 한번에 추출
 */
export async function extractMultipleLocationsForDB(
  placeNames: string[], 
  language: string = 'ko'
): Promise<{ [placeName: string]: { location_region: string; country_code: string } | null }> {
  const results: { [placeName: string]: { location_region: string; country_code: string } | null } = {};
  
  console.log(`🚀 배치 처리 시작: ${placeNames.length}개 장소`);
  
  for (let i = 0; i < placeNames.length; i++) {
    const placeName = placeNames[i];
    console.log(`\n📍 ${i + 1}/${placeNames.length}: "${placeName}"`);
    
    const result = await extractLocationForDB(placeName, language);
    results[placeName] = result;
    
    // API 호출 제한을 위한 대기 (1초)
    if (i < placeNames.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n🎉 배치 처리 완료: ${placeNames.length}개 중 ${Object.values(results).filter(r => r !== null).length}개 성공`);
  return results;
}
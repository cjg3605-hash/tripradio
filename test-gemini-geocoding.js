/**
 * 🧪 Gemini 국가코드/지역정보 추출 테스트
 */

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini 클라이언트 초기화
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiGeocodingExtraction() {
  // 🎯 신규 소규모 관광장소 5곳 테스트
  const testPlaces = [
    { name: "블루템플", expected: { country: "태국", countryCode: "THA", region: "Chiang Rai" }},
    { name: "감천문화마을", expected: { country: "한국", countryCode: "KOR", region: "Busan" }},
    { name: "치앙칸", expected: { country: "태국", countryCode: "THA", region: "Loei" }},
    { name: "홀로코스트기념관", expected: { country: "미국", countryCode: "USA", region: "Washington" }},
    { name: "카사바트요", expected: { country: "스페인", countryCode: "ESP", region: "Barcelona" }}
  ];

  const model = gemini.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 500,
      topK: 40,
      topP: 0.9,
    }
  });

  console.log('🧪 신규 소규모 관광장소 5곳 Gemini 테스트 시작\n');

  for (let i = 0; i < testPlaces.length; i++) {
    const place = testPlaces[i];
    console.log(`\n🎯 테스트 ${i + 1}/5: "${place.name}"`);
    
    try {
      const testPrompt = `
🧪 테스트: 다음 장소의 정확한 지역정보와 국가코드를 추출하세요.

입력: "${place.name}"

JSON 형식으로 응답하세요:
{
  "name": "${place.name}",
  "location": "도시, 국가",
  "region": "정확한 지역/도시명 (영어)",
  "country": "국가명 (한국어)", 
  "countryCode": "ISO 3166-1 alpha-3 코드",
  "confidence": 0.95
}

📋 국가코드 참조:
- 한국: KOR, 중국: CHN, 일본: JPN, 태국: THA, 베트남: VNM
- 프랑스: FRA, 영국: GBR, 독일: DEU, 이탈리아: ITA, 스페인: ESP
- 미국: USA, 캐나다: CAN, 호주: AUS, 브라질: BRA

정확한 JSON만 응답하세요 (설명 없이):`;

      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📄 Gemini 응답:', text.substring(0, 200) + '...');
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // 정확도 검증
          const countryCorrect = parsed.countryCode === place.expected.countryCode;
          const regionReasonable = parsed.region && parsed.region.length > 0;
          
          console.log(`✅ 파싱 성공: ${JSON.stringify(parsed, null, 0)}`);
          console.log(`🔍 검증 결과:`);
          console.log(`   국가코드: ${parsed.countryCode} ${countryCorrect ? '✅' : '❌'} (예상: ${place.expected.countryCode})`);
          console.log(`   국가명: ${parsed.country} ${parsed.country === place.expected.country ? '✅' : '❌'} (예상: ${place.expected.country})`);
          console.log(`   지역: ${parsed.region} ${regionReasonable ? '✅' : '❌'}`);
          console.log(`   신뢰도: ${parsed.confidence || 'N/A'}`);
          
        } else {
          console.log('❌ JSON 형식을 찾을 수 없음');
        }
      } catch (parseError) {
        console.log('❌ JSON 파싱 실패:', parseError.message);
      }
      
    } catch (error) {
      console.error(`❌ ${place.name} 테스트 실패:`, error.message);
    }
    
    // 다음 테스트 전 잠시 대기 (Rate Limit 방지)
    if (i < testPlaces.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n🏁 모든 테스트 완료!');
}

// 테스트 실행
testGeminiGeocodingExtraction();
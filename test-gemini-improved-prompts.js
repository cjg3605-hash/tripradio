/**
 * 🧪 Gemini 지역 정확도 개선 프롬프트 테스트
 */

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini 클라이언트 초기화
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testImprovedPrompts() {
  // 테스트 케이스: 블루템플 (이전에 틀린 케이스)
  const testPlace = "블루템플";
  const expected = { country: "태국", countryCode: "THA", region: "Chiang Rai" };

  const model = gemini.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      temperature: 0.05, // 더 낮은 온도로 정확성 향상
      maxOutputTokens: 600,
      topK: 20,
      topP: 0.8,
    }
  });

  // 🔬 개선된 프롬프트 버전들
  const promptVersions = [
    {
      name: "기본 프롬프트",
      prompt: `
입력: "${testPlace}"

JSON 형식으로 응답하세요:
{
  "name": "${testPlace}",
  "region": "정확한 지역/도시명 (영어)",
  "country": "국가명 (한국어)", 
  "countryCode": "ISO 3166-1 alpha-3 코드"
}`
    },
    
    {
      name: "상세 지역 정보 요구",
      prompt: `
입력: "${testPlace}"

다음을 반드시 확인하고 응답하세요:
1. 정확한 지리적 위치 (도시/주/지역)
2. 해당 관광지가 실제로 위치한 구체적인 지역명

JSON 형식으로 응답하세요:
{
  "name": "${testPlace}",
  "region": "실제 위치한 정확한 도시/지역명 (영어)",
  "province": "주/도 (해당시)",
  "country": "국가명 (한국어)", 
  "countryCode": "ISO 3166-1 alpha-3 코드"
}`
    },
    
    {
      name: "검증 단계 포함",
      prompt: `
입력: "${testPlace}"

단계별로 분석하세요:

1단계: "${testPlace}"는 무엇인가요? (사원, 박물관, 마을 등)
2단계: 이 장소가 실제로 위치한 구체적인 도시는 어디인가요?
3단계: 해당 도시가 속한 지역/주는 어디인가요?
4단계: 국가는 어디인가요?

분석 후 JSON으로만 응답하세요:
{
  "name": "${testPlace}",
  "type": "장소 유형",
  "city": "정확한 도시명 (영어)",
  "region": "지역/주명 (영어)",
  "country": "국가명 (한국어)", 
  "countryCode": "ISO 3166-1 alpha-3 코드"
}`
    },
    
    {
      name: "컨텍스트 힌트 제공",
      prompt: `
입력: "${testPlace}"

중요: 정확한 지리적 위치를 찾기 위해 다음을 고려하세요:
- 동명의 장소들이 여러 지역에 있을 수 있습니다
- 가장 유명하고 관광지로 알려진 위치를 선택하세요
- 태국의 "블루템플"은 치앙라이(Chiang Rai)에 위치합니다

JSON 형식으로 응답하세요:
{
  "name": "${testPlace}",
  "exactLocation": "정확한 위치 (도시, 지역)",
  "region": "지역명 (영어)",
  "country": "국가명 (한국어)", 
  "countryCode": "ISO 3166-1 alpha-3 코드"
}`
    },
    
    {
      name: "다단계 검증 프롬프트",
      prompt: `
입력: "${testPlace}"

정확한 지역 정보 추출을 위한 체크리스트:

✓ 1. 장소명 확인: "${testPlace}"의 정식 명칭은?
✓ 2. 위치 검증: 이 장소의 정확한 도시는?
✓ 3. 지역 확인: 해당 도시가 속한 지역/주는?
✓ 4. 국가 확인: 어느 나라에 위치?
✓ 5. 좌표 추정: 대략적인 위경도는?

위 체크리스트를 모두 확인한 후 JSON으로만 응답:
{
  "name": "${testPlace}",
  "officialName": "정식 명칭 (현지어/영어)",
  "city": "정확한 도시명",
  "region": "지역/주명 (영어)",
  "country": "국가명 (한국어)", 
  "countryCode": "ISO 3166-1 alpha-3 코드",
  "confidence": "신뢰도 (0-1)"
}`
    }
  ];

  console.log(`🧪 "${testPlace}" 지역 정확도 개선 테스트 시작\n`);
  console.log(`📍 정답: ${expected.region}, ${expected.country} (${expected.countryCode})\n`);

  for (let i = 0; i < promptVersions.length; i++) {
    const version = promptVersions[i];
    console.log(`\n🎯 테스트 ${i + 1}/${promptVersions.length}: ${version.name}`);
    
    try {
      const result = await model.generateContent(version.prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📄 응답:', text.substring(0, 150) + '...');
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // 지역 정확도 검증
          const regionMatch = parsed.region || parsed.city || parsed.exactLocation || 'N/A';
          const isRegionCorrect = regionMatch.toLowerCase().includes('chiang rai') || 
                                 regionMatch.toLowerCase().includes('chiangrai');
          
          console.log(`✅ 파싱 성공: ${JSON.stringify(parsed, null, 0)}`);
          console.log(`🔍 검증:`);
          console.log(`   지역: ${regionMatch} ${isRegionCorrect ? '✅' : '❌'}`);
          console.log(`   국가코드: ${parsed.countryCode} ${parsed.countryCode === expected.countryCode ? '✅' : '❌'}`);
          
          if (isRegionCorrect) {
            console.log(`🎉 성공! ${version.name}가 정확한 지역을 찾았습니다!`);
          }
          
        } else {
          console.log('❌ JSON 형식을 찾을 수 없음');
        }
      } catch (parseError) {
        console.log('❌ JSON 파싱 실패:', parseError.message);
      }
      
    } catch (error) {
      console.error(`❌ ${version.name} 테스트 실패:`, error.message);
    }
    
    // 다음 테스트 전 잠시 대기
    if (i < promptVersions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log('\n🏁 모든 프롬프트 테스트 완료!');
}

// 테스트 실행
testImprovedPrompts();